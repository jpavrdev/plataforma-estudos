import { db } from "../../db.ts";
import {
    simulados,
    simuladoQuestions,
    simuladoOptions,
    simuladoAttempts,
    simuladoAttemptQuestions,
    simuladoAttemptAnswers,
    simuladoFavoritos,
    type SnapshotQuestaoRevisao,
} from "../../schema.ts";
import { eq, and, sql, inArray, desc, isNull, isNotNull, count, ne } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";
import { gradePracticeExam, isQuestionCorrect, summaryByTopic } from "../domain/practiceExam.ts";
import { seededShuffle } from "../domain/shuffle.ts";

function groupPairs(pairs: [string, string][]): Map<string, Set<string>> {
    const groups = new Map<string, Set<string>>();
    for (const [key, value] of pairs) {
        let members = groups.get(key);
        if (!members) {
            members = new Set();
            groups.set(key, members);
        }
        members.add(value);
    }
    return groups;
}

export async function findPracticeExams(userId: string) {
    return db
        .select({
            slug: simulados.slug,
            name: simulados.name,
            description: simulados.description,
            provider: simulados.provider,
            code: simulados.code,
            level: simulados.level,
            durationMinutes: simulados.durationMinutes,
            questionCount: simulados.questionCount,
            passPercent: simulados.passPercent,
            favorito: sql<boolean>`${simuladoFavoritos.id} is not null`,
        })
        .from(simulados)
        .leftJoin(
            simuladoFavoritos,
            and(
                eq(simuladoFavoritos.simuladoId, simulados.id),
                eq(simuladoFavoritos.userId, userId),
            ),
        )
        .where(eq(simulados.published, true))
        .orderBy(simulados.name);
}

export async function toggleExamFavorite(userId: string, slug: string) {
    const [exam] = await db
        .select({ id: simulados.id })
        .from(simulados)
        .where(and(eq(simulados.slug, slug), eq(simulados.published, true)));
    if (!exam) throw new AppError(404, "practiceExam.notFound");

    const removed = await db
        .delete(simuladoFavoritos)
        .where(and(eq(simuladoFavoritos.simuladoId, exam.id), eq(simuladoFavoritos.userId, userId)))
        .returning({ id: simuladoFavoritos.id });
    if (removed.length === 0) {
        await db
            .insert(simuladoFavoritos)
            .values({ simuladoId: exam.id, userId })
            .onConflictDoNothing();
    }
    return { favorito: removed.length === 0 };
}

// Cancels the user's open attempts: sets submittedAt without saving score/passed.
// Since every attempt really submitted has a score, the history shows these as "Cancelada"
// and their timer stops. Optionally keeps one attempt (the one being resumed).
async function cancelOpenAttempts(userId: string, keepId: string | null) {
    const conditions = [eq(simuladoAttempts.userId, userId), isNull(simuladoAttempts.submittedAt)];
    if (keepId) conditions.push(ne(simuladoAttempts.id, keepId));
    await db
        .update(simuladoAttempts)
        .set({ submittedAt: new Date() })
        .where(and(...conditions));
}

export const MIN_QUESTIONS = 5;
// Without a timer the attempt does not expire by itself, and an abandoned one would
// lock the exam forever, because starting would always resume it.
const UNTIMED_VALIDITY_MS = 24 * 60 * 60 * 1000;

// What the student picks in the subject filter. In some exams the topic is the
// service being tested and the exam domain comes from the domain column; in the
// others the topic itself is the domain.
const subject = sql<string>`coalesce(${simuladoQuestions.domain}, ${simuladoQuestions.topic})`;

export type AttemptSettings = {
    questionCount?: number;
    comTempo?: boolean;
    duracaoMinutos?: number;
    topicos?: string[];
    pratica?: boolean;
};

function isStillValid(attempt: { expiresAt: Date | null; startedAt: Date }, now: Date) {
    if (attempt.expiresAt) return attempt.expiresAt > now;
    return now.getTime() - attempt.startedAt.getTime() < UNTIMED_VALIDITY_MS;
}

export async function insertAttempt(userId: string, slug: string, settings: AttemptSettings = {}) {
    const [exam] = await db
        .select()
        .from(simulados)
        .where(and(eq(simulados.slug, slug), eq(simulados.published, true)));
    if (!exam) throw new AppError(404, "practiceExam.notFound");

    const now = new Date();

    // If there is an open attempt that is still valid, it resumes instead of creating another.
    const [openAttempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(
            and(
                eq(simuladoAttempts.userId, userId),
                eq(simuladoAttempts.simuladoId, exam.id),
                isNull(simuladoAttempts.submittedAt),
            ),
        )
        .orderBy(desc(simuladoAttempts.startedAt))
        .limit(1);
    if (openAttempt && isStillValid(openAttempt, now)) {
        // Resumes this attempt and cancels any other open one (from other exams).
        // retomada tells the client that the settings asked for now were not applied.
        await cancelOpenAttempts(userId, openAttempt.id);
        return { ...(await findAttemptState(userId, openAttempt.id)), retomada: true };
    }

    // A new one is coming: cancels every open attempt, stopping their timers.
    await cancelOpenAttempts(userId, null);

    const topics = settings.topicos?.length ? [...new Set(settings.topicos)] : null;
    const inExam = eq(simuladoQuestions.simuladoId, exam.id);
    const questionFilter = topics ? and(inExam, inArray(subject, topics)) : inExam;

    const [available] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(questionFilter);
    const total = Number(available?.n ?? 0);
    if (total === 0) {
        throw new AppError(
            409,
            topics ? "practiceExam.noQuestionsInTopics" : "practiceExam.noQuestions",
        );
    }

    // Trimmed to what exists: asking for 60 in a topic of 12 gives 12.
    const requested = settings.questionCount ?? exam.questionCount;
    const amount = Math.min(Math.max(requested, MIN_QUESTIONS), total);

    const drawn = await db
        .select({ id: simuladoQuestions.id })
        .from(simuladoQuestions)
        .where(questionFilter)
        .orderBy(sql`random()`)
        .limit(amount);

    // In practice mode the student checks each question right away and reads the
    // explanation, so a timer would only get in the way: practice is study, not an exam.
    const practice = settings.pratica === true;
    // Without a chosen duration, it keeps the official pace: fewer questions, fewer minutes.
    const timed = practice ? false : (settings.comTempo ?? true);
    const proportional = Math.max(
        1,
        Math.round((exam.durationMinutes * drawn.length) / exam.questionCount),
    );
    const minutes = settings.duracaoMinutos ?? proportional;
    const expiresAt = timed ? new Date(now.getTime() + minutes * 60 * 1000) : null;
    const custom =
        practice ||
        !timed ||
        topics !== null ||
        drawn.length !== exam.questionCount ||
        (timed && minutes !== exam.durationMinutes);

    const attemptId = await db.transaction(async (tx) => {
        const [attempt] = await tx
            .insert(simuladoAttempts)
            .values({
                userId,
                simuladoId: exam.id,
                expiresAt,
                personalizado: custom,
                pratica: practice,
                topicos: topics,
            })
            .returning({ id: simuladoAttempts.id });
        await tx.insert(simuladoAttemptQuestions).values(
            drawn.map((q, i) => ({
                attemptId: attempt.id,
                questionId: q.id,
                position: i + 1,
            })),
        );
        return attempt.id;
    });

    return findAttemptState(userId, attemptId);
}

// An exam without classified domains would fall into a list of hundreds of items with
// one question each, useless as a filter. In that case the list comes out empty and the
// screen hides the subject choice.
const MIN_QUESTIONS_PER_TOPIC = 5;

export async function findAttemptOptions(slug: string) {
    const [exam] = await db
        .select()
        .from(simulados)
        .where(and(eq(simulados.slug, slug), eq(simulados.published, true)));
    if (!exam) throw new AppError(404, "practiceExam.notFound");

    const topicRows = await db
        .select({ nome: subject, questoes: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, exam.id))
        .groupBy(subject)
        .orderBy(desc(count()));

    const named = topicRows.filter((t): t is { nome: string; questoes: number } => !!t.nome);
    const totalQuestions = named.reduce((s, t) => s + Number(t.questoes), 0);
    const average = named.length ? totalQuestions / named.length : 0;

    return {
        oficial: {
            questionCount: exam.questionCount,
            durationMinutes: exam.durationMinutes,
        },
        minQuestoes: MIN_QUESTIONS,
        maxQuestoes: totalQuestions,
        temas:
            average >= MIN_QUESTIONS_PER_TOPIC
                ? named.map((t) => ({ nome: t.nome, questoes: Number(t.questoes) }))
                : [],
    };
}

// The answer key (isCorrect and the explanation) is revealed only after submitting,
// or, in practice mode, on the questions the student already checked.
export async function findAttemptState(userId: string, attemptId: string) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "practiceExam.attemptNotFound");

    const submitted = attempt.submittedAt !== null;

    const rows = await db
        .select()
        .from(simuladoAttemptQuestions)
        .where(eq(simuladoAttemptQuestions.attemptId, attemptId))
        .orderBy(simuladoAttemptQuestions.position);
    // A submitted attempt with a snapshot renders the exam frozen at submission; the
    // others (in progress or older than the snapshot) read the live database.
    const frozen = submitted && rows.length > 0 && rows.every((l) => l.snapshot !== null);

    type ReviewQuestion = {
        id: string;
        statement: string;
        position: number;
        multiple: boolean;
        options: { id: string; text: string; position: number; isCorrect?: boolean }[];
        selected: string[];
        revealed: boolean;
        topic?: string | null;
        explanation?: string | null;
    };
    const forSummary: { topic: string | null; correta: boolean }[] = [];
    let questions: ReviewQuestion[];

    if (frozen) {
        questions = rows.map((l) => {
            const snap = l.snapshot!;
            const correctSet = new Set<string>();
            const markedSet = new Set<string>();
            const options = snap.options.map((o, i) => {
                const id = `${l.id}:${i}`;
                if (o.isCorrect) correctSet.add(id);
                if (o.marked) markedSet.add(id);
                return { id, text: o.text, position: i + 1, isCorrect: o.isCorrect };
            });
            forSummary.push({
                topic: snap.topic,
                correta: isQuestionCorrect(markedSet, correctSet),
            });
            return {
                id: l.questionId ?? l.id,
                statement: snap.statement,
                position: l.position,
                multiple: correctSet.size > 1,
                options,
                selected: [...markedSet],
                revealed: true,
                topic: snap.topic,
                explanation: snap.explanation,
            };
        });
    } else {
        const questionRows = await db
            .select({
                id: simuladoQuestions.id,
                statement: simuladoQuestions.statement,
                explanation: simuladoQuestions.explanation,
                topic: simuladoQuestions.topic,
                position: simuladoAttemptQuestions.position,
                revealedAt: simuladoAttemptQuestions.revealedAt,
            })
            .from(simuladoAttemptQuestions)
            .innerJoin(
                simuladoQuestions,
                eq(simuladoQuestions.id, simuladoAttemptQuestions.questionId),
            )
            .where(eq(simuladoAttemptQuestions.attemptId, attemptId))
            .orderBy(simuladoAttemptQuestions.position);

        const questionIds = questionRows.map((q) => q.id);
        const optionRows = questionIds.length
            ? await db
                  .select()
                  .from(simuladoOptions)
                  .where(inArray(simuladoOptions.questionId, questionIds))
                  .orderBy(simuladoOptions.position)
            : [];
        const answerRows = await db
            .select()
            .from(simuladoAttemptAnswers)
            .where(eq(simuladoAttemptAnswers.attemptId, attemptId));
        const marked = groupPairs(answerRows.map((r) => [r.questionId, r.optionId]));

        questions = questionRows.map((q) => {
            const shuffledOptions = seededShuffle(
                optionRows.filter((o) => o.questionId === q.id),
                attemptId + q.id,
            );
            // In practice mode, a question already checked shows the answer key before submitting.
            const revealed = submitted || (attempt.pratica && q.revealedAt !== null);
            if (submitted) {
                const correctSet = new Set(
                    shuffledOptions.filter((o) => o.isCorrect).map((o) => o.id),
                );
                const markedSet = new Set(marked.get(q.id) ?? []);
                forSummary.push({
                    topic: q.topic,
                    correta: isQuestionCorrect(markedSet, correctSet),
                });
            }
            return {
                id: q.id,
                statement: q.statement,
                position: q.position,
                // Multiple answers come from the answer key; only the boolean is exposed (the exact
                // count is already in the statement, e.g. "selecione DUAS").
                multiple: shuffledOptions.filter((o) => o.isCorrect).length > 1,
                options: shuffledOptions.map((o) => ({
                    id: o.id,
                    text: o.text,
                    position: o.position,
                    ...(revealed ? { isCorrect: o.isCorrect } : {}),
                })),
                selected: [...(marked.get(q.id) ?? [])],
                revealed: revealed,
                ...(revealed ? { topic: q.topic, explanation: q.explanation } : {}),
            };
        });
    }

    const [examRow] = await db
        .select({
            slug: simulados.slug,
            name: simulados.name,
            passPercent: simulados.passPercent,
        })
        .from(simulados)
        .where(eq(simulados.id, attempt.simuladoId));
    const remainingMs = attempt.expiresAt ? attempt.expiresAt.getTime() - Date.now() : null;
    return {
        attemptId: attempt.id,
        slug: examRow?.slug ?? null,
        simulado: examRow?.name ?? null,
        passPercent: examRow?.passPercent ?? null,
        submitted: submitted,
        expiresAt: attempt.expiresAt,
        personalizado: attempt.personalizado,
        pratica: attempt.pratica,
        topicos: attempt.topicos ?? null,
        remainingSeconds:
            remainingMs === null
                ? null
                : submitted
                  ? 0
                  : Math.max(0, Math.floor(remainingMs / 1000)),
        ...(submitted
            ? {
                  score: attempt.score,
                  passed: attempt.passed,
                  elapsedSeconds: Math.max(
                      0,
                      Math.round(
                          (attempt.submittedAt!.getTime() - attempt.startedAt.getTime()) / 1000,
                      ),
                  ),
                  temasARevisar: summaryByTopic(forSummary),
              }
            : {}),
        questions,
    };
}

export async function saveAttemptAnswer(
    userId: string,
    attemptId: string,
    questionId: string,
    optionIds: string[],
) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "practiceExam.attemptNotFound");
    if (attempt.submittedAt) throw new AppError(409, "practiceExam.alreadySubmitted");
    if (attempt.expiresAt && attempt.expiresAt <= new Date())
        throw new AppError(409, "practiceExam.timeUp");

    const [attemptQuestion] = await db
        .select({
            id: simuladoAttemptQuestions.id,
            revealedAt: simuladoAttemptQuestions.revealedAt,
        })
        .from(simuladoAttemptQuestions)
        .where(
            and(
                eq(simuladoAttemptQuestions.attemptId, attemptId),
                eq(simuladoAttemptQuestions.questionId, questionId),
            ),
        );
    if (!attemptQuestion) throw new AppError(404, "practiceExam.questionNotInAttempt");
    if (attemptQuestion.revealedAt) throw new AppError(409, "practiceExam.questionAlreadyChecked");

    // The options have to belong to this question (an option of another cannot be marked).
    let validIds: string[] = [];
    if (optionIds.length > 0) {
        const found = await db
            .select({ id: simuladoOptions.id })
            .from(simuladoOptions)
            .where(
                and(
                    eq(simuladoOptions.questionId, questionId),
                    inArray(simuladoOptions.id, optionIds),
                ),
            );
        validIds = found.map((o) => o.id);
        if (validIds.length !== new Set(optionIds).size) {
            throw new AppError(400, "practiceExam.invalidOption");
        }
    }

    await db.transaction(async (tx) => {
        await tx
            .delete(simuladoAttemptAnswers)
            .where(
                and(
                    eq(simuladoAttemptAnswers.attemptId, attemptId),
                    eq(simuladoAttemptAnswers.questionId, questionId),
                ),
            );
        if (validIds.length > 0) {
            await tx
                .insert(simuladoAttemptAnswers)
                .values(validIds.map((optionId) => ({ attemptId, questionId, optionId })));
        }
    });
    return { ok: true };
}

// Practice mode: checks one question right away. It requires a marked answer, because
// checking a blank one would just read the answer key, and it marks the question as
// checked, which locks the answer: without that one could check, fix it and get 100%.
export async function revealAttemptQuestion(userId: string, attemptId: string, questionId: string) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "practiceExam.attemptNotFound");
    if (!attempt.pratica) throw new AppError(409, "practiceExam.notPracticeAttempt");
    if (attempt.submittedAt) throw new AppError(409, "practiceExam.alreadySubmitted");

    const [row] = await db
        .select({
            id: simuladoAttemptQuestions.id,
            revealedAt: simuladoAttemptQuestions.revealedAt,
        })
        .from(simuladoAttemptQuestions)
        .where(
            and(
                eq(simuladoAttemptQuestions.attemptId, attemptId),
                eq(simuladoAttemptQuestions.questionId, questionId),
            ),
        );
    if (!row) throw new AppError(404, "practiceExam.questionNotInAttempt");

    const [question] = await db
        .select({ explanation: simuladoQuestions.explanation, topic: simuladoQuestions.topic })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.id, questionId));
    if (!question) throw new AppError(404, "quiz.questionNotFound");

    const answerRows = await db
        .select({ optionId: simuladoAttemptAnswers.optionId })
        .from(simuladoAttemptAnswers)
        .where(
            and(
                eq(simuladoAttemptAnswers.attemptId, attemptId),
                eq(simuladoAttemptAnswers.questionId, questionId),
            ),
        );
    if (answerRows.length === 0) throw new AppError(409, "practiceExam.answerBeforeChecking");

    const optionRows = await db
        .select({ id: simuladoOptions.id, isCorrect: simuladoOptions.isCorrect })
        .from(simuladoOptions)
        .where(eq(simuladoOptions.questionId, questionId));
    const correctIds = new Set(optionRows.filter((o) => o.isCorrect).map((o) => o.id));
    const marked = new Set(answerRows.map((r) => r.optionId));

    if (!row.revealedAt) {
        await db
            .update(simuladoAttemptQuestions)
            .set({ revealedAt: new Date() })
            .where(eq(simuladoAttemptQuestions.id, row.id));
    }

    return {
        questionId,
        correta: isQuestionCorrect(marked, correctIds),
        corretas: [...correctIds],
        explanation: question.explanation,
        topic: question.topic,
    };
}

// Scores only what was saved, so a submission after the deadline counts as an auto-submit.
export async function gradeAttempt(userId: string, attemptId: string) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "practiceExam.attemptNotFound");
    if (attempt.submittedAt) throw new AppError(409, "practiceExam.alreadySubmitted");

    const [exam] = await db
        .select({ passPercent: simulados.passPercent })
        .from(simulados)
        .where(eq(simulados.id, attempt.simuladoId));
    if (!exam) throw new AppError(404, "practiceExam.notFound");

    const questionLinks = await db
        .select({
            aqId: simuladoAttemptQuestions.id,
            questionId: simuladoQuestions.id,
            statement: simuladoQuestions.statement,
            explanation: simuladoQuestions.explanation,
            topic: simuladoQuestions.topic,
        })
        .from(simuladoAttemptQuestions)
        .innerJoin(simuladoQuestions, eq(simuladoQuestions.id, simuladoAttemptQuestions.questionId))
        .where(eq(simuladoAttemptQuestions.attemptId, attemptId));
    const questionIds = questionLinks.map((q) => q.questionId);

    const allOptionRows = questionIds.length
        ? await db
              .select()
              .from(simuladoOptions)
              .where(inArray(simuladoOptions.questionId, questionIds))
              .orderBy(simuladoOptions.position)
        : [];
    const allAnswerRows = await db
        .select()
        .from(simuladoAttemptAnswers)
        .where(eq(simuladoAttemptAnswers.attemptId, attemptId));

    const correctByQuestion = groupPairs(
        allOptionRows.filter((o) => o.isCorrect).map((o) => [o.questionId, o.id]),
    );
    const answersByQuestion = groupPairs(allAnswerRows.map((r) => [r.questionId, r.optionId]));
    const questionRows = questionIds.map((id) => ({
        id,
        corretas: correctByQuestion.get(id) ?? new Set<string>(),
    }));

    const result = gradePracticeExam(questionRows, answersByQuestion, exam.passPercent);

    // Freezes the exam as it was shown (same shuffled order) so the review survives
    // changes to the question bank.
    const snapshots = questionLinks.map((q) => {
        const markedSet = answersByQuestion.get(q.questionId) ?? new Set<string>();
        const optionRows = seededShuffle(
            allOptionRows.filter((o) => o.questionId === q.questionId),
            attemptId + q.questionId,
        );
        const snapshot: SnapshotQuestaoRevisao = {
            statement: q.statement,
            explanation: q.explanation,
            topic: q.topic,
            options: optionRows.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                marked: markedSet.has(o.id),
            })),
        };
        return { aqId: q.aqId, snapshot };
    });

    await db.transaction(async (tx) => {
        for (const s of snapshots) {
            await tx
                .update(simuladoAttemptQuestions)
                .set({ snapshot: s.snapshot })
                .where(eq(simuladoAttemptQuestions.id, s.aqId));
        }
        await tx
            .update(simuladoAttempts)
            .set({ submittedAt: new Date(), score: result.score, passed: result.passed })
            .where(eq(simuladoAttempts.id, attemptId));
    });

    return result;
}

export async function findUserAttempts(userId: string) {
    const questionsPerAttempt = db
        .select({
            attemptId: simuladoAttemptQuestions.attemptId,
            total: count().as("total"),
        })
        .from(simuladoAttemptQuestions)
        .groupBy(simuladoAttemptQuestions.attemptId)
        .as("q");

    return db
        .select({
            attemptId: simuladoAttempts.id,
            simulado: simulados.name,
            slug: simulados.slug,
            startedAt: simuladoAttempts.startedAt,
            submittedAt: simuladoAttempts.submittedAt,
            score: simuladoAttempts.score,
            passed: simuladoAttempts.passed,
            personalizado: simuladoAttempts.personalizado,
            pratica: simuladoAttempts.pratica,
            comTempo: sql<boolean>`${simuladoAttempts.expiresAt} is not null`,
            topicos: simuladoAttempts.topicos,
            questoes: sql<number>`coalesce(${questionsPerAttempt.total}, 0)::int`,
        })
        .from(simuladoAttempts)
        .innerJoin(simulados, eq(simulados.id, simuladoAttempts.simuladoId))
        .leftJoin(questionsPerAttempt, eq(questionsPerAttempt.attemptId, simuladoAttempts.id))
        .where(eq(simuladoAttempts.userId, userId))
        .orderBy(desc(simuladoAttempts.startedAt));
}

// ===================== ADMIN (CRUD) =====================

type PracticeExamData = {
    slug: string;
    name: string;
    description?: string;
    durationMinutes: number;
    questionCount: number;
    passPercent: number;
    published: boolean;
};
type PracticeExamUpdate = Partial<Omit<PracticeExamData, "slug">>;
type ExamQuestionData = {
    statement: string;
    topic?: string;
    explanation?: string;
    options: { text: string; isCorrect: boolean }[];
};

async function findExamBySlug(slug: string) {
    const [s] = await db.select().from(simulados).where(eq(simulados.slug, slug));
    if (!s) throw new AppError(404, "practiceExam.notFound");
    return s;
}

export async function findPracticeExamsForStudio() {
    return db
        .select({
            slug: simulados.slug,
            name: simulados.name,
            durationMinutes: simulados.durationMinutes,
            questionCount: simulados.questionCount,
            passPercent: simulados.passPercent,
            published: simulados.published,
            questoes: count(simuladoQuestions.id),
        })
        .from(simulados)
        .leftJoin(simuladoQuestions, eq(simuladoQuestions.simuladoId, simulados.id))
        .groupBy(simulados.id)
        .orderBy(simulados.name);
}

export async function insertPracticeExam(data: PracticeExamData) {
    const [existing] = await db
        .select({ id: simulados.id })
        .from(simulados)
        .where(eq(simulados.slug, data.slug));
    if (existing) throw new AppError(409, "practiceExam.slugTaken");
    const [s] = await db.insert(simulados).values(data).returning();
    return s;
}

export async function editPracticeExam(slug: string, data: PracticeExamUpdate) {
    const s = await findExamBySlug(slug);
    if (Object.keys(data).length === 0) throw new AppError(400, "common.nothingToUpdate");
    const [updated] = await db
        .update(simulados)
        .set(data)
        .where(eq(simulados.id, s.id))
        .returning();
    return updated;
}

export async function removePracticeExam(slug: string) {
    const s = await findExamBySlug(slug);
    await db.transaction(async (tx) => {
        const attempts = await tx
            .select({ id: simuladoAttempts.id })
            .from(simuladoAttempts)
            .where(eq(simuladoAttempts.simuladoId, s.id));
        const attemptIds = attempts.map((t) => t.id);
        if (attemptIds.length) {
            await tx
                .delete(simuladoAttemptAnswers)
                .where(inArray(simuladoAttemptAnswers.attemptId, attemptIds));
            await tx
                .delete(simuladoAttemptQuestions)
                .where(inArray(simuladoAttemptQuestions.attemptId, attemptIds));
            await tx.delete(simuladoAttempts).where(eq(simuladoAttempts.simuladoId, s.id));
        }
        const questionRows = await tx
            .select({ id: simuladoQuestions.id })
            .from(simuladoQuestions)
            .where(eq(simuladoQuestions.simuladoId, s.id));
        const questionIds = questionRows.map((q) => q.id);
        if (questionIds.length) {
            await tx
                .delete(simuladoOptions)
                .where(inArray(simuladoOptions.questionId, questionIds));
            await tx.delete(simuladoQuestions).where(eq(simuladoQuestions.simuladoId, s.id));
        }
        await tx.delete(simulados).where(eq(simulados.id, s.id));
    });
    return { ok: true };
}

// The exam with its whole question bank (answer key included), for editing in the admin.
export async function findStudioPracticeExam(slug: string) {
    const s = await findExamBySlug(slug);
    const questionRows = await db
        .select()
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, s.id))
        .orderBy(simuladoQuestions.createdAt);
    const questionIds = questionRows.map((q) => q.id);
    const optionRows = questionIds.length
        ? await db
              .select()
              .from(simuladoOptions)
              .where(inArray(simuladoOptions.questionId, questionIds))
              .orderBy(simuladoOptions.position)
        : [];
    return {
        slug: s.slug,
        name: s.name,
        description: s.description,
        durationMinutes: s.durationMinutes,
        questionCount: s.questionCount,
        passPercent: s.passPercent,
        published: s.published,
        questions: questionRows.map((q) => ({
            id: q.id,
            statement: q.statement,
            topic: q.topic,
            explanation: q.explanation,
            options: optionRows
                .filter((o) => o.questionId === q.id)
                .map((o) => ({
                    id: o.id,
                    text: o.text,
                    isCorrect: o.isCorrect,
                    position: o.position,
                })),
        })),
    };
}

export async function insertExamQuestion(slug: string, data: ExamQuestionData) {
    const s = await findExamBySlug(slug);
    return db.transaction(async (tx) => {
        const [q] = await tx
            .insert(simuladoQuestions)
            .values({
                simuladoId: s.id,
                statement: data.statement,
                topic: data.topic,
                explanation: data.explanation,
            })
            .returning();
        await tx.insert(simuladoOptions).values(
            data.options.map((o, i) => ({
                questionId: q.id,
                text: o.text,
                isCorrect: o.isCorrect,
                position: i + 1,
            })),
        );
        return q;
    });
}

export async function editExamQuestion(questionId: string, data: ExamQuestionData) {
    const [q] = await db
        .select({ id: simuladoQuestions.id })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.id, questionId));
    if (!q) throw new AppError(404, "quiz.questionNotFound");
    await db.transaction(async (tx) => {
        await tx
            .update(simuladoQuestions)
            .set({
                statement: data.statement,
                topic: data.topic,
                explanation: data.explanation,
            })
            .where(eq(simuladoQuestions.id, questionId));
        // Replaces the options. Since their ids change, it deletes the attempt answers that
        // pointed to the old ones (editing the bank shows in past reviews).
        await tx
            .delete(simuladoAttemptAnswers)
            .where(eq(simuladoAttemptAnswers.questionId, questionId));
        await tx.delete(simuladoOptions).where(eq(simuladoOptions.questionId, questionId));
        await tx.insert(simuladoOptions).values(
            data.options.map((o, i) => ({
                questionId,
                text: o.text,
                isCorrect: o.isCorrect,
                position: i + 1,
            })),
        );
    });
    return { ok: true };
}

export async function removeExamQuestion(questionId: string) {
    const [q] = await db
        .select({ id: simuladoQuestions.id })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.id, questionId));
    if (!q) throw new AppError(404, "quiz.questionNotFound");
    await db.transaction(async (tx) => {
        await tx
            .delete(simuladoAttemptAnswers)
            .where(eq(simuladoAttemptAnswers.questionId, questionId));
        // Attempts with a frozen review keep the row (the question becomes an orphan);
        // the others lose the question, as before.
        await tx
            .update(simuladoAttemptQuestions)
            .set({ questionId: null })
            .where(
                and(
                    eq(simuladoAttemptQuestions.questionId, questionId),
                    isNotNull(simuladoAttemptQuestions.snapshot),
                ),
            );
        await tx
            .delete(simuladoAttemptQuestions)
            .where(eq(simuladoAttemptQuestions.questionId, questionId));
        await tx.delete(simuladoOptions).where(eq(simuladoOptions.questionId, questionId));
        await tx.delete(simuladoQuestions).where(eq(simuladoQuestions.id, questionId));
    });
    return { ok: true };
}

// Saves everything in a single transaction (atomic): removes the questions that are
// gone, updates the ones with an id and creates the new ones. If any step fails,
// nothing is saved.
export async function replaceExamQuestions(
    slug: string,
    questionRows: ({ id?: string } & ExamQuestionData)[],
) {
    const s = await findExamBySlug(slug);
    await db.transaction(async (tx) => {
        const existingQuestions = await tx
            .select({ id: simuladoQuestions.id })
            .from(simuladoQuestions)
            .where(eq(simuladoQuestions.simuladoId, s.id));
        const existingIds = new Set(existingQuestions.map((q) => q.id));

        const sentIds = new Set<string>();
        for (const q of questionRows) {
            if (q.id) {
                if (!existingIds.has(q.id))
                    throw new AppError(400, "practiceExam.questionNotInExam");
                sentIds.add(q.id);
            }
        }

        const toRemove = [...existingIds].filter((id) => !sentIds.has(id));
        if (toRemove.length) {
            await tx
                .delete(simuladoAttemptAnswers)
                .where(inArray(simuladoAttemptAnswers.questionId, toRemove));
            await tx
                .update(simuladoAttemptQuestions)
                .set({ questionId: null })
                .where(
                    and(
                        inArray(simuladoAttemptQuestions.questionId, toRemove),
                        isNotNull(simuladoAttemptQuestions.snapshot),
                    ),
                );
            await tx
                .delete(simuladoAttemptQuestions)
                .where(inArray(simuladoAttemptQuestions.questionId, toRemove));
            await tx.delete(simuladoOptions).where(inArray(simuladoOptions.questionId, toRemove));
            await tx.delete(simuladoQuestions).where(inArray(simuladoQuestions.id, toRemove));
        }

        for (const q of questionRows) {
            let questionId: string;
            if (q.id) {
                await tx
                    .update(simuladoQuestions)
                    .set({ statement: q.statement, topic: q.topic, explanation: q.explanation })
                    .where(eq(simuladoQuestions.id, q.id));
                await tx
                    .delete(simuladoAttemptAnswers)
                    .where(eq(simuladoAttemptAnswers.questionId, q.id));
                await tx.delete(simuladoOptions).where(eq(simuladoOptions.questionId, q.id));
                questionId = q.id;
            } else {
                const [created] = await tx
                    .insert(simuladoQuestions)
                    .values({
                        simuladoId: s.id,
                        statement: q.statement,
                        topic: q.topic,
                        explanation: q.explanation,
                    })
                    .returning({ id: simuladoQuestions.id });
                questionId = created.id;
            }
            await tx.insert(simuladoOptions).values(
                q.options.map((o, i) => ({
                    questionId,
                    text: o.text,
                    isCorrect: o.isCorrect,
                    position: i + 1,
                })),
            );
        }
    });
    return { ok: true };
}
