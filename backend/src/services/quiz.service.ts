import { db } from "../../db.ts";
import { abrirCartoesDaAula } from "./flashcard.service.ts";
import {
    lessons,
    questions,
    questionOptions,
    questionAnswers,
    lessonProgress,
} from "../../schema.ts";
import { eq, and, inArray, sql } from "drizzle-orm";
import type { z } from "zod";
import type { submitQuizSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";
import { ehAdmin } from "./usuario.service.ts";
import { verificarConquistas } from "./achievement.service.ts";

// Minimum of right answers to complete the lesson (and of questions to publish it).
export const QUIZ_MIN_CORRECT = 4;

type QuizAnswers = z.infer<typeof submitQuizSchema>;

// Receives the answers, grades them on the server and completes the lesson when enough are right.
export async function gradeQuiz(userId: string, lessonId: string, data: QuizAnswers) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
    }

    if (!lesson.published) {
        throw new AppError(404, "lesson.notFound");
    }

    const qs = await db
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.lessonId, lessonId));
    const qIds = qs.map((q) => q.id);
    if (qIds.length === 0) {
        throw new AppError(400, "quiz.noQuestions");
    }

    const opts = await db
        .select()
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, qIds));
    const correctByQuestion = new Map<string, string>();
    for (const o of opts) {
        if (o.isCorrect) correctByQuestion.set(o.questionId, o.id);
    }

    // One answer for each question of the lesson, none missing. Before, the same right
    // question sent several times counted one hit per copy and completed the lesson alone.
    const qIdSet = new Set(qIds);
    const answeredIds = new Set(
        data.answers.map((r) => r.questionId).filter((id) => qIdSet.has(id)),
    );
    if (answeredIds.size !== qIds.length) {
        throw new AppError(400, "quiz.answerAll");
    }

    let correctCount = 0;
    for (const answer of data.answers) {
        if (correctByQuestion.get(answer.questionId) === answer.optionId) correctCount++;
    }

    // Each question has one row per student, and it keeps two different things.
    //
    // The LAST attempt (selected_option_id and is_correct) is overwritten on every
    // submission, because it is what the lesson restores when the student comes back.
    // Without it, whoever got it wrong, redid it and got it right kept seeing the score
    // of the first guess.
    //
    // The FIRST right answer (acertou_em) is never rewritten once saved. It is what
    // counts for XP, ranking, mastery and statistics, so redoing and getting it right
    // earns the 10 XP only once, and redoing and getting it wrong takes no XP or
    // position from anyone.
    const validOptionIds = new Set(opts.map((o) => o.id));
    const now = new Date();
    for (const answer of data.answers) {
        if (!qIdSet.has(answer.questionId) || !validOptionIds.has(answer.optionId)) continue;
        const isRight = correctByQuestion.get(answer.questionId) === answer.optionId;
        await db
            .insert(questionAnswers)
            .values({
                userId,
                questionId: answer.questionId,
                selectedOptionId: answer.optionId,
                isCorrect: isRight,
                answeredAt: now,
                acertouEm: isRight ? now : null,
            })
            .onConflictDoUpdate({
                target: [questionAnswers.userId, questionAnswers.questionId],
                set: {
                    selectedOptionId: answer.optionId,
                    isCorrect: isRight,
                    answeredAt: now,
                    acertouEm: isRight
                        ? sql`coalesce(${questionAnswers.acertouEm}, ${now})`
                        : sql`${questionAnswers.acertouEm}`,
                },
            });
    }

    const total = qIds.length;
    const passed = correctCount >= QUIZ_MIN_CORRECT;

    let lessonCompleted = false;
    if (passed) {
        const [existing] = await db
            .select({ id: lessonProgress.id, manual: lessonProgress.manual })
            .from(lessonProgress)
            .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
        if (!existing) {
            await db.insert(lessonProgress).values({ userId, lessonId });
        } else if (existing.manual) {
            await db
                .update(lessonProgress)
                .set({ manual: false, completedAt: new Date() })
                .where(eq(lessonProgress.id, existing.id));
        }
        lessonCompleted = true;
        // The cards of this lesson join the review deck now. Only here: a card from a
        // lesson not studied yet would give the answer away too early. It fails
        // silently on purpose, because it must never block completing the lesson.
        try {
            await abrirCartoesDaAula(userId, lessonId);
        } catch (e) {
            console.error("Failed to open the lesson flashcards", e);
        }
    }

    await verificarConquistas(userId);

    return { correct: correctCount, total, passed: passed, lessonCompleted: lessonCompleted };
}

// Checks a single answer without revealing the answer key of the other questions.
// It saves nothing: completing the lesson is still decided in gradeQuiz.
export async function verifyAnswer(
    userId: string,
    lessonId: string,
    questionId: string,
    optionId: string,
) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
    }
    if (!lesson.published && !(await ehAdmin(userId))) {
        throw new AppError(404, "lesson.notFound");
    }

    // The question has to belong to this lesson.
    const [question] = await db
        .select({ id: questions.id, explanation: questions.explanation })
        .from(questions)
        .where(and(eq(questions.id, questionId), eq(questions.lessonId, lessonId)));
    if (!question) {
        throw new AppError(404, "quiz.questionNotFound");
    }

    const [correctOption] = await db
        .select({ id: questionOptions.id })
        .from(questionOptions)
        .where(
            and(eq(questionOptions.questionId, questionId), eq(questionOptions.isCorrect, true)),
        );
    if (!correctOption) {
        throw new AppError(500, "quiz.noAnswerKey");
    }

    return {
        correct: correctOption.id === optionId,
        correctOptionId: correctOption.id,
        explanation: question.explanation ?? null,
    };
}
