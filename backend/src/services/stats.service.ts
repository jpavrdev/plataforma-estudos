import { db } from "../../db.ts";
import { lessonProgress, questionAnswers } from "../../schema.ts";
import { eq, and, count } from "drizzle-orm";
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
    const lessonsCompleted = Number(aulas?.n ?? 0);
    const questionsCorrect = Number(acertos?.n ?? 0);
    const xp = calcularXp({ aulas: lessonsCompleted, questoes: questionsCorrect });
    return {
        xp,
        level: nivelPorXp(xp),
        lessonsCompleted,
        questionsCorrect,
    };
}
