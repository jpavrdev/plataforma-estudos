import { db } from "../../db.ts";
import { lessonProgress, questionAnswers } from "../../schema.ts";
import { eq, and, count } from "drizzle-orm";

// Nível derivado do XP. Fonte única da fórmula (usada aqui, no /me e no ranking).
export const nivelPorXp = (xp: number) => Math.floor(xp / 500) + 1;

// Estatísticas base do usuário. XP = 50 por aula concluída + 10 por questão certa.
export async function calcularEstatisticas(userId: string) {
    const [aulas] = await db
        .select({ n: count() })
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId));
    const [acertos] = await db
        .select({ n: count() })
        .from(questionAnswers)
        .where(and(eq(questionAnswers.userId, userId), eq(questionAnswers.isCorrect, true)));
    const lessonsCompleted = Number(aulas?.n ?? 0);
    const questionsCorrect = Number(acertos?.n ?? 0);
    const xp = lessonsCompleted * 50 + questionsCorrect * 10;
    return {
        xp,
        level: nivelPorXp(xp),
        lessonsCompleted,
        questionsCorrect,
    };
}
