import { db } from "../../db.ts";
import {
    lessons,
    questions,
    questionOptions,
    questionAnswers,
    lessonProgress,
} from "../../schema.ts";
import { eq, and, inArray } from "drizzle-orm";
import type { z } from "zod";
import type { submitQuizSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";
import { estadoDaAula } from "./lesson.service.ts";
import { ehAdmin } from "./usuario.service.ts";
import { verificarConquistas } from "./achievement.service.ts";

// Mínimo de acertos para concluir a aula (e de questões para poder publicá-la).
export const QUIZ_MIN_ACERTOS = 4;

type RespostasQuiz = z.infer<typeof submitQuizSchema>;

// Recebe as respostas, corrige no servidor e conclui a aula se acertar o mínimo.
export async function corrigirQuiz(userId: string, lessonId: string, dados: RespostasQuiz) {
    const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }

    if (!aula.published) {
        throw new AppError(404, "Aula não encontrada");
    }

    const estado = await estadoDaAula(userId, aula);
    if (estado === "locked") {
        throw new AppError(403, "Aula bloqueada. Conclua a aula anterior.");
    }

    const qs = await db
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.lessonId, lessonId));
    const qIds = qs.map((q) => q.id);
    if (qIds.length === 0) {
        throw new AppError(400, "Esta aula não tem questões");
    }

    const opts = await db
        .select()
        .from(questionOptions)
        .where(inArray(questionOptions.questionId, qIds));
    const corretaPorQuestao = new Map<string, string>();
    for (const o of opts) {
        if (o.isCorrect) corretaPorQuestao.set(o.questionId, o.id);
    }

    let acertos = 0;
    for (const resp of dados.answers) {
        if (corretaPorQuestao.get(resp.questionId) === resp.optionId) acertos++;
    }

    // Registra cada resposta uma única vez. A primeira conta para o XP por questão
    // (10 cada); como não sobrescreve, errar e refazer não rende XP depois.
    const idsValidos = new Set(opts.map((o) => o.id));
    const qIdSet = new Set(qIds);
    for (const resp of dados.answers) {
        if (!qIdSet.has(resp.questionId) || !idsValidos.has(resp.optionId)) continue;
        await db
            .insert(questionAnswers)
            .values({
                userId,
                questionId: resp.questionId,
                selectedOptionId: resp.optionId,
                isCorrect: corretaPorQuestao.get(resp.questionId) === resp.optionId,
            })
            .onConflictDoNothing();
    }

    const total = qIds.length;
    const passou = acertos >= QUIZ_MIN_ACERTOS;

    let aulaConcluida = false;
    if (passou) {
        const [existe] = await db
            .select({ id: lessonProgress.id })
            .from(lessonProgress)
            .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
        if (!existe) {
            await db.insert(lessonProgress).values({ userId, lessonId });
        }
        aulaConcluida = true;
    }

    await verificarConquistas(userId);

    return { correct: acertos, total, passed: passou, lessonCompleted: aulaConcluida };
}

// Confere uma única resposta sem revelar o gabarito das outras questões.
// Não grava nada: a conclusão da aula continua sendo decidida no corrigirQuiz.
export async function conferirResposta(
    userId: string,
    lessonId: string,
    questionId: string,
    optionId: string,
) {
    const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }
    if (!aula.published && !(await ehAdmin(userId))) {
        throw new AppError(404, "Aula não encontrada");
    }

    const estado = await estadoDaAula(userId, aula);
    if (estado === "locked") {
        throw new AppError(403, "Aula bloqueada. Conclua a aula anterior.");
    }

    // A questão precisa pertencer a esta aula.
    const [questao] = await db
        .select({ id: questions.id })
        .from(questions)
        .where(and(eq(questions.id, questionId), eq(questions.lessonId, lessonId)));
    if (!questao) {
        throw new AppError(404, "Questão não encontrada");
    }

    const [correta] = await db
        .select({ id: questionOptions.id })
        .from(questionOptions)
        .where(and(eq(questionOptions.questionId, questionId), eq(questionOptions.isCorrect, true)));
    if (!correta) {
        throw new AppError(500, "Questão sem gabarito");
    }

    return { correct: correta.id === optionId, correctOptionId: correta.id };
}
