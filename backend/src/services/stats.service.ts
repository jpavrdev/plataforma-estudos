import { db } from "../../db.ts";
import {
    lessonProgress,
    questionAnswers,
    challengeSubmissions,
    trails,
    lessons,
    questions,
    challenges,
    simulados,
    users,
} from "../../schema.ts";
import { eq, and, count, sum, gt, isNotNull } from "drizzle-orm";
import { computeXp, levelFromXp } from "../domain/xp.ts";

// The user's base stats: counts the progress in the database and derives XP and level.
export async function computeUserStats(userId: string) {
    const [lessonRows] = await db
        .select({ n: count() })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.manual, false)));
    const [correctRows] = await db
        .select({ n: count() })
        .from(questionAnswers)
        .where(and(eq(questionAnswers.userId, userId), isNotNull(questionAnswers.acertouEm)));
    // The challenge XP comes already summed (each challenge is worth a different amount); the solved ones are counted apart.
    const [challengeRows] = await db
        .select({ xp: sum(challengeSubmissions.xpEarned), n: count() })
        .from(challengeSubmissions)
        .where(and(eq(challengeSubmissions.userId, userId), gt(challengeSubmissions.xpEarned, 0)));
    const lessonsCompleted = Number(lessonRows?.n ?? 0);
    const questionsCorrect = Number(correctRows?.n ?? 0);
    const challengesCompleted = Number(challengeRows?.n ?? 0);
    const challengeXpTotal = Number(challengeRows?.xp ?? 0);
    const xp = computeXp({
        aulas: lessonsCompleted,
        questoes: questionsCorrect,
        desafiosXp: challengeXpTotal,
    });
    return {
        xp,
        level: levelFromXp(xp),
        lessonsCompleted,
        questionsCorrect,
        challengesCompleted,
    };
}

// Aggregate counts for the home page, with no user data. They stay in memory for
// a few minutes so a visit does not turn into seven count() queries.
export type PublicStats = {
    trilhas: number;
    aulas: number;
    desafios: number;
    simulados: number;
    questoes: number;
    estudantes: number;
    exerciciosResolvidos: number;
    aulasConcluidas: number;
};

const PUBLIC_CACHE_MS = 5 * 60 * 1000;
let publicCache: { dados: PublicStats; expiraEm: number } | null = null;

export async function findPublicStats(): Promise<PublicStats> {
    if (publicCache && publicCache.expiraEm > Date.now()) return publicCache.dados;
    const [
        trackRows,
        lessonRows,
        challengeRows,
        examRows,
        lessonQuestionRows,
        studentRows,
        answerRows,
        completedRows,
    ] = await Promise.all([
        db.select({ n: count() }).from(trails),
        db.select({ n: count() }).from(lessons).where(eq(lessons.published, true)),
        db.select({ n: count() }).from(challenges).where(eq(challenges.published, true)),
        db.select({ n: count() }).from(simulados),
        db.select({ n: count() }).from(questions),
        db.select({ n: count() }).from(users),
        db.select({ n: count() }).from(questionAnswers),
        db.select({ n: count() }).from(lessonProgress),
    ]);
    const data: PublicStats = {
        trilhas: Number(trackRows[0]?.n ?? 0),
        aulas: Number(lessonRows[0]?.n ?? 0),
        desafios: Number(challengeRows[0]?.n ?? 0),
        simulados: Number(examRows[0]?.n ?? 0),
        questoes: Number(lessonQuestionRows[0]?.n ?? 0),
        estudantes: Number(studentRows[0]?.n ?? 0),
        exerciciosResolvidos: Number(answerRows[0]?.n ?? 0),
        aulasConcluidas: Number(completedRows[0]?.n ?? 0),
    };
    publicCache = { dados: data, expiraEm: Date.now() + PUBLIC_CACHE_MS };
    return data;
}
