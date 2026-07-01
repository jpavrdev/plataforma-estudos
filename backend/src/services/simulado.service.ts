import { db } from "../../db.ts";
import {
    simulados,
    simuladoQuestions,
    simuladoOptions,
    simuladoAttempts,
    simuladoAttemptQuestions,
    simuladoAttemptAnswers,
} from "../../schema.ts";
import { eq, and, sql, inArray, desc, isNull } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";
import { corrigirSimulado, questaoCorreta, resumoPorTema } from "../domain/simulado.ts";

function agrupar(pares: [string, string][]): Map<string, Set<string>> {
    const mapa = new Map<string, Set<string>>();
    for (const [chave, valor] of pares) {
        let conjunto = mapa.get(chave);
        if (!conjunto) {
            conjunto = new Set();
            mapa.set(chave, conjunto);
        }
        conjunto.add(valor);
    }
    return mapa;
}

export async function listarSimulados() {
    return db
        .select({
            slug: simulados.slug,
            name: simulados.name,
            description: simulados.description,
            durationMinutes: simulados.durationMinutes,
            questionCount: simulados.questionCount,
            passPercent: simulados.passPercent,
        })
        .from(simulados)
        .where(eq(simulados.published, true))
        .orderBy(simulados.name);
}

export async function iniciarTentativa(userId: string, slug: string) {
    const [simulado] = await db
        .select()
        .from(simulados)
        .where(and(eq(simulados.slug, slug), eq(simulados.published, true)));
    if (!simulado) throw new AppError(404, "Simulado não encontrado");

    const agora = new Date();

    // Se já existe uma tentativa em aberto e dentro do prazo, retoma em vez de criar outra.
    const [emAberto] = await db
        .select()
        .from(simuladoAttempts)
        .where(
            and(
                eq(simuladoAttempts.userId, userId),
                eq(simuladoAttempts.simuladoId, simulado.id),
                isNull(simuladoAttempts.submittedAt),
            ),
        )
        .orderBy(desc(simuladoAttempts.startedAt))
        .limit(1);
    if (emAberto && emAberto.expiresAt > agora) {
        return estadoDaTentativa(userId, emAberto.id);
    }

    const sorteadas = await db
        .select({ id: simuladoQuestions.id })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id))
        .orderBy(sql`random()`)
        .limit(simulado.questionCount);
    if (sorteadas.length === 0) throw new AppError(409, "Simulado ainda não tem questões");

    const expiresAt = new Date(agora.getTime() + simulado.durationMinutes * 60 * 1000);
    const attemptId = await db.transaction(async (tx) => {
        const [attempt] = await tx
            .insert(simuladoAttempts)
            .values({ userId, simuladoId: simulado.id, expiresAt })
            .returning({ id: simuladoAttempts.id });
        await tx.insert(simuladoAttemptQuestions).values(
            sorteadas.map((q, i) => ({
                attemptId: attempt.id,
                questionId: q.id,
                position: i + 1,
            })),
        );
        return attempt.id;
    });

    return estadoDaTentativa(userId, attemptId);
}

// O gabarito (isCorrect e a justificativa) só é revelado depois de enviar.
export async function estadoDaTentativa(userId: string, attemptId: string) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "Tentativa não encontrada");

    const enviado = attempt.submittedAt !== null;

    const questoes = await db
        .select({
            id: simuladoQuestions.id,
            statement: simuladoQuestions.statement,
            explanation: simuladoQuestions.explanation,
            topic: simuladoQuestions.topic,
            position: simuladoAttemptQuestions.position,
        })
        .from(simuladoAttemptQuestions)
        .innerJoin(simuladoQuestions, eq(simuladoQuestions.id, simuladoAttemptQuestions.questionId))
        .where(eq(simuladoAttemptQuestions.attemptId, attemptId))
        .orderBy(simuladoAttemptQuestions.position);

    const questionIds = questoes.map((q) => q.id);
    const opcoes = questionIds.length
        ? await db
              .select()
              .from(simuladoOptions)
              .where(inArray(simuladoOptions.questionId, questionIds))
              .orderBy(simuladoOptions.position)
        : [];
    const respostas = await db
        .select()
        .from(simuladoAttemptAnswers)
        .where(eq(simuladoAttemptAnswers.attemptId, attemptId));
    const marcadas = agrupar(respostas.map((r) => [r.questionId, r.optionId]));

    const paraResumo: { topic: string | null; correta: boolean }[] = [];
    const questions = questoes.map((q) => {
        const opcoesDaQuestao = opcoes.filter((o) => o.questionId === q.id);
        if (enviado) {
            const corretasSet = new Set(
                opcoesDaQuestao.filter((o) => o.isCorrect).map((o) => o.id),
            );
            const marcadasSet = new Set(marcadas.get(q.id) ?? []);
            paraResumo.push({ topic: q.topic, correta: questaoCorreta(marcadasSet, corretasSet) });
        }
        return {
            id: q.id,
            statement: q.statement,
            position: q.position,
            // multi-resposta é derivado do gabarito; só expomos o booleano (a contagem
            // exata já está no enunciado, ex.: "selecione DUAS").
            multiple: opcoesDaQuestao.filter((o) => o.isCorrect).length > 1,
            options: opcoesDaQuestao.map((o) => ({
                id: o.id,
                text: o.text,
                position: o.position,
                ...(enviado ? { isCorrect: o.isCorrect } : {}),
            })),
            selected: [...(marcadas.get(q.id) ?? [])],
            ...(enviado ? { topic: q.topic, explanation: q.explanation } : {}),
        };
    });

    const restanteMs = attempt.expiresAt.getTime() - Date.now();
    return {
        attemptId: attempt.id,
        submitted: enviado,
        expiresAt: attempt.expiresAt,
        remainingSeconds: enviado ? 0 : Math.max(0, Math.floor(restanteMs / 1000)),
        ...(enviado
            ? {
                  score: attempt.score,
                  passed: attempt.passed,
                  temasARevisar: resumoPorTema(paraResumo),
              }
            : {}),
        questions,
    };
}

export async function salvarResposta(
    userId: string,
    attemptId: string,
    questionId: string,
    optionIds: string[],
) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "Tentativa não encontrada");
    if (attempt.submittedAt) throw new AppError(409, "Simulado já enviado");
    if (attempt.expiresAt <= new Date()) throw new AppError(409, "Tempo esgotado");

    const [pertence] = await db
        .select({ id: simuladoAttemptQuestions.id })
        .from(simuladoAttemptQuestions)
        .where(
            and(
                eq(simuladoAttemptQuestions.attemptId, attemptId),
                eq(simuladoAttemptQuestions.questionId, questionId),
            ),
        );
    if (!pertence) throw new AppError(404, "Questão não faz parte da tentativa");

    // As opções precisam ser desta questão (não deixa marcar opção de outra).
    let validas: string[] = [];
    if (optionIds.length > 0) {
        const encontradas = await db
            .select({ id: simuladoOptions.id })
            .from(simuladoOptions)
            .where(
                and(
                    eq(simuladoOptions.questionId, questionId),
                    inArray(simuladoOptions.id, optionIds),
                ),
            );
        validas = encontradas.map((o) => o.id);
        if (validas.length !== new Set(optionIds).size) {
            throw new AppError(400, "Opção inválida para esta questão");
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
        if (validas.length > 0) {
            await tx
                .insert(simuladoAttemptAnswers)
                .values(validas.map((optionId) => ({ attemptId, questionId, optionId })));
        }
    });
    return { ok: true };
}

// Pontua só o que estava salvo, então envio após o prazo vale como auto-envio.
export async function enviarTentativa(userId: string, attemptId: string) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "Tentativa não encontrada");
    if (attempt.submittedAt) throw new AppError(409, "Simulado já enviado");

    const [simulado] = await db
        .select({ passPercent: simulados.passPercent })
        .from(simulados)
        .where(eq(simulados.id, attempt.simuladoId));
    if (!simulado) throw new AppError(404, "Simulado não encontrado");

    const linhasQ = await db
        .select({ questionId: simuladoAttemptQuestions.questionId })
        .from(simuladoAttemptQuestions)
        .where(eq(simuladoAttemptQuestions.attemptId, attemptId));
    const questionIds = linhasQ.map((q) => q.questionId);

    const corretasRows = questionIds.length
        ? await db
              .select({ questionId: simuladoOptions.questionId, id: simuladoOptions.id })
              .from(simuladoOptions)
              .where(
                  and(
                      inArray(simuladoOptions.questionId, questionIds),
                      eq(simuladoOptions.isCorrect, true),
                  ),
              )
        : [];
    const respostasRows = await db
        .select()
        .from(simuladoAttemptAnswers)
        .where(eq(simuladoAttemptAnswers.attemptId, attemptId));

    const corretasPorQuestao = agrupar(corretasRows.map((r) => [r.questionId, r.id]));
    const respostasPorQuestao = agrupar(respostasRows.map((r) => [r.questionId, r.optionId]));
    const questoes = questionIds.map((id) => ({
        id,
        corretas: corretasPorQuestao.get(id) ?? new Set<string>(),
    }));

    const resultado = corrigirSimulado(questoes, respostasPorQuestao, simulado.passPercent);

    await db
        .update(simuladoAttempts)
        .set({ submittedAt: new Date(), score: resultado.score, passed: resultado.passed })
        .where(eq(simuladoAttempts.id, attemptId));

    return resultado;
}

export async function historicoDoUsuario(userId: string) {
    return db
        .select({
            attemptId: simuladoAttempts.id,
            simulado: simulados.name,
            slug: simulados.slug,
            startedAt: simuladoAttempts.startedAt,
            submittedAt: simuladoAttempts.submittedAt,
            score: simuladoAttempts.score,
            passed: simuladoAttempts.passed,
        })
        .from(simuladoAttempts)
        .innerJoin(simulados, eq(simulados.id, simuladoAttempts.simuladoId))
        .where(eq(simuladoAttempts.userId, userId))
        .orderBy(desc(simuladoAttempts.startedAt));
}
