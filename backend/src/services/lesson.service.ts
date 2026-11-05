import { db } from "../../db.ts";
import {
    lessons,
    modules,
    lessonProgress,
    questions,
    questionOptions,
    questionAnswers,
} from "../../schema.ts";
import { eq, and, asc, inArray } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";
import { isAdmin } from "./user.service.ts";

// Computes the state (done/current/locked) of one lesson in the track.
export async function findLessonState(
    userId: string,
    lesson: typeof lessons.$inferSelect,
    lang?: string,
): Promise<string> {
    // Only published lessons enter the sequence (a "coming soon" lesson does not lock the next ones).
    const rawSiblings = await db
        .select({
            id: lessons.id,
            moduleId: lessons.moduleId,
            position: lessons.position,
            language: lessons.language,
        })
        .from(lessons)
        .where(and(eq(lessons.trailId, lesson.trailId), eq(lessons.published, true)));

    // Multi-language track: the sequence has only the neutral lessons + the active language's,
    // otherwise a lesson of the other language would become the "previous lesson" and lock this
    // one. A lesson with a language belongs to its own path; the `lang` hint only resolves neutral ones.
    const langs = [...new Set(rawSiblings.map((i) => i.language).filter(Boolean))].sort();
    const activeLang =
        lesson.language ?? (lang && langs.includes(lang) ? lang : (langs[0] ?? null));
    const siblings =
        langs.length > 0
            ? rawSiblings.filter((i) => i.language === null || i.language === activeLang)
            : rawSiblings;
    const mods = await db
        .select({ id: modules.id, position: modules.position })
        .from(modules)
        .where(eq(modules.trailId, lesson.trailId));
    const modulePosition = new Map(mods.map((m) => [m.id, m.position]));

    const ordered = [...siblings].sort((a, b) => {
        const moduleDelta = (modulePosition.get(a.moduleId) ?? 0) - (modulePosition.get(b.moduleId) ?? 0);
        return moduleDelta !== 0 ? moduleDelta : a.position - b.position;
    });

    const completed = new Set(
        (
            await db
                .select({ lessonId: lessonProgress.lessonId })
                .from(lessonProgress)
                .where(eq(lessonProgress.userId, userId))
        ).map((p) => p.lessonId),
    );

    let foundCurrent = false;
    for (const a of ordered) {
        if (completed.has(a.id)) {
            if (a.id === lesson.id) return "done";
        } else if (!foundCurrent) {
            foundCurrent = true;
            if (a.id === lesson.id) return "current";
        } else if (a.id === lesson.id) {
            return "locked";
        }
    }
    return "locked";
}

// Returns the lesson with content and questions WITHOUT revealing the right option.
export async function findLessonDetail(lessonId: string, userId: string, lang?: string) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!lesson) {
        throw new AppError(404, "lesson.notFound");
    }

    // An unpublished lesson is invisible to the student; the admin can view it (preview).
    const admin = await isAdmin(userId);
    if (!lesson.published && !admin) {
        throw new AppError(404, "lesson.notFound");
    }

    // The state (done/current/locked) is only a visual progress guide: no published
    // lesson locks access, and the student goes through the track in any order.
    const state = await findLessonState(userId, lesson, lang);

    const qs = await db
        .select()
        .from(questions)
        .where(eq(questions.lessonId, lessonId))
        .orderBy(asc(questions.position));
    const qIds = qs.map((q) => q.id);
    const opts = qIds.length
        ? await db
              .select()
              .from(questionOptions)
              .where(inArray(questionOptions.questionId, qIds))
              .orderBy(asc(questionOptions.position))
        : [];

    // Answers the user already gave, to restore the "answered" state when coming back.
    const answerRows = qIds.length
        ? await db
              .select()
              .from(questionAnswers)
              .where(
                  and(
                      eq(questionAnswers.userId, userId),
                      inArray(questionAnswers.questionId, qIds),
                  ),
              )
        : [];
    const answerByQuestion = new Map(answerRows.map((r) => [r.questionId, r]));
    const correctByQuestion = new Map<string, string>();
    for (const o of opts) if (o.isCorrect) correctByQuestion.set(o.questionId, o.id);

    // Shuffles questions and options so the right one does not always land on "A".
    // Grading goes by option id, so the order does not change the result; the position
    // is renumbered to the new order.
    const shuffle = <T>(arr: T[]): T[] => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const shuffledQuestions = shuffle(
        qs.map((q) => {
            const r = answerByQuestion.get(q.id);
            return {
                id: q.id,
                statement: q.statement,
                position: q.position,
                options: shuffle(opts.filter((o) => o.questionId === q.id)).map((o, i) => ({
                    id: o.id,
                    text: o.text,
                    position: i + 1,
                })),
                // The answer key shows only on the questions the user already answered.
                answer: r
                    ? {
                          selectedOptionId: r.selectedOptionId,
                          isCorrect: r.isCorrect,
                          correctOptionId: correctByQuestion.get(q.id) ?? null,
                          explanation: q.explanation ?? null,
                      }
                    : null,
            };
        }),
    ).map((q, i) => ({ ...q, position: i + 1 }));

    return {
        id: lesson.id,
        trailId: lesson.trailId,
        moduleId: lesson.moduleId,
        title: lesson.title,
        language: lesson.language,
        content: lesson.content,
        contentBlocks: lesson.contentBlocks ?? null,
        state: state,
        questions: shuffledQuestions,
    };
}
