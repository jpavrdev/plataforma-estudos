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
import { ehAdmin } from "./usuario.service.ts";

// Calcula o estado (done/current/locked) de uma aula específica na trilha.
export async function estadoDaAula(
    userId: string,
    aula: typeof lessons.$inferSelect,
): Promise<string> {
    // Só aulas publicadas entram na sequência (uma aula "em breve" não trava as próximas).
    const irmas = await db
        .select({ id: lessons.id, moduleId: lessons.moduleId, position: lessons.position })
        .from(lessons)
        .where(and(eq(lessons.trailId, aula.trailId), eq(lessons.published, true)));
    const mods = await db
        .select({ id: modules.id, position: modules.position })
        .from(modules)
        .where(eq(modules.trailId, aula.trailId));
    const ordemModulo = new Map(mods.map((m) => [m.id, m.position]));

    const ordenadas = [...irmas].sort((a, b) => {
        const pm = (ordemModulo.get(a.moduleId) ?? 0) - (ordemModulo.get(b.moduleId) ?? 0);
        return pm !== 0 ? pm : a.position - b.position;
    });

    const concluidas = new Set(
        (
            await db
                .select({ lessonId: lessonProgress.lessonId })
                .from(lessonProgress)
                .where(eq(lessonProgress.userId, userId))
        ).map((p) => p.lessonId),
    );

    let achouCurrent = false;
    for (const a of ordenadas) {
        if (concluidas.has(a.id)) {
            if (a.id === aula.id) return "done";
        } else if (!achouCurrent) {
            achouCurrent = true;
            if (a.id === aula.id) return "current";
        } else if (a.id === aula.id) {
            return "locked";
        }
    }
    return "locked";
}

// Retorna a aula com conteúdo e questões SEM revelar a alternativa correta.
export async function detalheDaAula(lessonId: string, userId: string) {
    const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!aula) {
        throw new AppError(404, "Aula não encontrada");
    }

    // Aula não publicada é invisível para o aluno; admin pode visualizar (preview).
    const admin = await ehAdmin(userId);
    if (!aula.published && !admin) {
        throw new AppError(404, "Aula não encontrada");
    }

    // Admin não é travado pelo bloqueio sequencial (pode pré-visualizar qualquer aula).
    const estado = await estadoDaAula(userId, aula);
    if (estado === "locked" && !admin) {
        throw new AppError(403, "Aula bloqueada. Conclua a aula anterior.");
    }

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

    // Respostas que o usuário já deu, para restaurar o estado "respondido" ao revisitar.
    const respostas = qIds.length
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
    const respostaPorQuestao = new Map(respostas.map((r) => [r.questionId, r]));
    const corretaPorQuestao = new Map<string, string>();
    for (const o of opts) if (o.isCorrect) corretaPorQuestao.set(o.questionId, o.id);

    const questoes = qs.map((q) => {
        const r = respostaPorQuestao.get(q.id);
        return {
            id: q.id,
            statement: q.statement,
            position: q.position,
            options: opts
                .filter((o) => o.questionId === q.id)
                .map((o) => ({ id: o.id, text: o.text, position: o.position })),
            // O gabarito só é revelado nas questões que o usuário já respondeu.
            answer: r
                ? {
                      selectedOptionId: r.selectedOptionId,
                      isCorrect: r.isCorrect,
                      correctOptionId: corretaPorQuestao.get(q.id) ?? null,
                  }
                : null,
        };
    });

    return {
        id: aula.id,
        trailId: aula.trailId,
        moduleId: aula.moduleId,
        title: aula.title,
        content: aula.content,
        contentBlocks: aula.contentBlocks ?? null,
        state: estado,
        questions: questoes,
    };
}
