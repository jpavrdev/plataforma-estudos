import { db } from "../../db.ts";
import { lessonProgress, questionAnswers, challengeSubmissions } from "../../schema.ts";
import { eq, and, count, sum, gt } from "drizzle-orm";
import { calcularXp, nivelPorXp } from "../domain/xp.ts";

// Estatísticas base do usuário: conta o progresso no banco e deriva XP e nível.
export async function calcularEstatisticas(userId: string) {
    const [aulas] = await db
        .select({ n: count() })
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId));
    const [acertos] = await db
        .select({ n: count() })
        .from(questionAnswers)
        .where(and(eq(questionAnswers.userId, userId), eq(questionAnswers.isCorrect, true)));
    // XP dos desafios já vem somado (cada desafio vale diferente); conta os resolvidos à parte.
    const [desafios] = await db
        .select({ xp: sum(challengeSubmissions.xpEarned), n: count() })
        .from(challengeSubmissions)
        .where(and(eq(challengeSubmissions.userId, userId), gt(challengeSubmissions.xpEarned, 0)));
    const lessonsCompleted = Number(aulas?.n ?? 0);
    const questionsCorrect = Number(acertos?.n ?? 0);
    const challengesCompleted = Number(desafios?.n ?? 0);
    const desafiosXp = Number(desafios?.xp ?? 0);
    const xp = calcularXp({ aulas: lessonsCompleted, questoes: questionsCorrect, desafiosXp });
    return {
        xp,
        level: nivelPorXp(xp),
        lessonsCompleted,
        questionsCorrect,
        challengesCompleted,
    };
}
