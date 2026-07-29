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
import { eq, and, count, sum, gt } from "drizzle-orm";
import { calcularXp, nivelPorXp } from "../domain/xp.ts";

// Estatísticas base do usuário: conta o progresso no banco e deriva XP e nível.
export async function calcularEstatisticas(userId: string) {
    const [aulas] = await db
        .select({ n: count() })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.manual, false)));
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

// Contagens agregadas para a página inicial, sem nenhum dado de usuário. Ficam
// alguns minutos em memória para uma visita não virar sete count() no banco.
export type EstatisticasPublicas = {
    trilhas: number;
    aulas: number;
    desafios: number;
    simulados: number;
    questoes: number;
    estudantes: number;
    exerciciosResolvidos: number;
    aulasConcluidas: number;
};

const CACHE_PUBLICO_MS = 5 * 60 * 1000;
let cachePublico: { dados: EstatisticasPublicas; expiraEm: number } | null = null;

export async function estatisticasPublicas(): Promise<EstatisticasPublicas> {
    if (cachePublico && cachePublico.expiraEm > Date.now()) return cachePublico.dados;
    const [trilhas, aulas, desafios, provas, questoesAula, estudantes, respostas, concluidas] =
        await Promise.all([
            db.select({ n: count() }).from(trails),
            db.select({ n: count() }).from(lessons).where(eq(lessons.published, true)),
            db.select({ n: count() }).from(challenges).where(eq(challenges.published, true)),
            db.select({ n: count() }).from(simulados),
            db.select({ n: count() }).from(questions),
            db.select({ n: count() }).from(users),
            db.select({ n: count() }).from(questionAnswers),
            db.select({ n: count() }).from(lessonProgress),
        ]);
    const dados: EstatisticasPublicas = {
        trilhas: Number(trilhas[0]?.n ?? 0),
        aulas: Number(aulas[0]?.n ?? 0),
        desafios: Number(desafios[0]?.n ?? 0),
        simulados: Number(provas[0]?.n ?? 0),
        questoes: Number(questoesAula[0]?.n ?? 0),
        estudantes: Number(estudantes[0]?.n ?? 0),
        exerciciosResolvidos: Number(respostas[0]?.n ?? 0),
        aulasConcluidas: Number(concluidas[0]?.n ?? 0),
    };
    cachePublico = { dados, expiraEm: Date.now() + CACHE_PUBLICO_MS };
    return dados;
}
