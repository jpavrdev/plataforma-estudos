import { db } from "../../db.ts";
import {
    simulados,
    simuladoQuestions,
    simuladoOptions,
    simuladoAttempts,
    simuladoAttemptQuestions,
    simuladoAttemptAnswers,
    type SnapshotQuestaoRevisao,
} from "../../schema.ts";
import { eq, and, sql, inArray, desc, isNull, isNotNull, count, ne } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";
import {
    corrigirSimulado,
    questaoCorreta,
    resumoPorTema,
    embaralharComSemente,
} from "../domain/simulado.ts";

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
            provider: simulados.provider,
            code: simulados.code,
            level: simulados.level,
            durationMinutes: simulados.durationMinutes,
            questionCount: simulados.questionCount,
            passPercent: simulados.passPercent,
        })
        .from(simulados)
        .where(eq(simulados.published, true))
        .orderBy(simulados.name);
}

// Cancela as tentativas em aberto do usuário: marca submittedAt sem gravar score/passed.
// Como toda tentativa realmente enviada tem score, o histórico exibe estas como "Cancelada"
// e o cronômetro delas para. Opcionalmente preserva uma tentativa (a que será retomada).
async function cancelarTentativasEmAberto(userId: string, exceto: string | null) {
    const condicoes = [eq(simuladoAttempts.userId, userId), isNull(simuladoAttempts.submittedAt)];
    if (exceto) condicoes.push(ne(simuladoAttempts.id, exceto));
    await db
        .update(simuladoAttempts)
        .set({ submittedAt: new Date() })
        .where(and(...condicoes));
}

export const MIN_QUESTOES = 5;
// Sem cronômetro a tentativa não expira sozinha, e uma abandonada travaria o
// simulado para sempre, porque o início sempre a retomaria.
const VALIDADE_SEM_TEMPO_MS = 24 * 60 * 60 * 1000;

// O que o aluno escolhe no filtro de assuntos. Em parte dos simulados o topic é o
// serviço testado e o domínio da prova vem da coluna domain; nos outros o próprio
// topic já é o domínio.
const assunto = sql<string>`coalesce(${simuladoQuestions.domain}, ${simuladoQuestions.topic})`;

export type OpcoesTentativa = {
    questionCount?: number;
    comTempo?: boolean;
    duracaoMinutos?: number;
    topicos?: string[];
};

function aindaVale(attempt: { expiresAt: Date | null; startedAt: Date }, agora: Date) {
    if (attempt.expiresAt) return attempt.expiresAt > agora;
    return agora.getTime() - attempt.startedAt.getTime() < VALIDADE_SEM_TEMPO_MS;
}

export async function iniciarTentativa(userId: string, slug: string, opcoes: OpcoesTentativa = {}) {
    const [simulado] = await db
        .select()
        .from(simulados)
        .where(and(eq(simulados.slug, slug), eq(simulados.published, true)));
    if (!simulado) throw new AppError(404, "Simulado não encontrado");

    const agora = new Date();

    // Se já existe uma tentativa em aberto e ainda válida, retoma em vez de criar outra.
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
    if (emAberto && aindaVale(emAberto, agora)) {
        // Retoma esta tentativa e cancela qualquer outra em aberto (de outros simulados).
        // Retomada avisa o cliente de que a configuração pedida agora não valeu.
        await cancelarTentativasEmAberto(userId, emAberto.id);
        return { ...(await estadoDaTentativa(userId, emAberto.id)), retomada: true };
    }

    // Vai criar uma nova: cancela todas as tentativas em aberto, parando o cronômetro delas.
    await cancelarTentativasEmAberto(userId, null);

    const topicos = opcoes.topicos?.length ? [...new Set(opcoes.topicos)] : null;
    const doSimulado = eq(simuladoQuestions.simuladoId, simulado.id);
    const filtro = topicos ? and(doSimulado, inArray(assunto, topicos)) : doSimulado;

    const [disponiveis] = await db.select({ n: count() }).from(simuladoQuestions).where(filtro);
    const total = Number(disponiveis?.n ?? 0);
    if (total === 0) {
        throw new AppError(
            409,
            topicos ? "Nenhuma questão nos temas escolhidos" : "Simulado ainda não tem questões",
        );
    }

    // Aparado pelo que existe: pedir 60 num tema de 12 dá 12.
    const pedido = opcoes.questionCount ?? simulado.questionCount;
    const quantidade = Math.min(Math.max(pedido, MIN_QUESTOES), total);

    const sorteadas = await db
        .select({ id: simuladoQuestions.id })
        .from(simuladoQuestions)
        .where(filtro)
        .orderBy(sql`random()`)
        .limit(quantidade);

    // Sem duração escolhida, mantém o ritmo oficial: menos questões, menos minutos.
    const comTempo = opcoes.comTempo ?? true;
    const proporcional = Math.max(
        1,
        Math.round((simulado.durationMinutes * sorteadas.length) / simulado.questionCount),
    );
    const minutos = opcoes.duracaoMinutos ?? proporcional;
    const expiresAt = comTempo ? new Date(agora.getTime() + minutos * 60 * 1000) : null;
    const personalizado =
        !comTempo ||
        topicos !== null ||
        sorteadas.length !== simulado.questionCount ||
        (comTempo && minutos !== simulado.durationMinutes);

    const attemptId = await db.transaction(async (tx) => {
        const [attempt] = await tx
            .insert(simuladoAttempts)
            .values({ userId, simuladoId: simulado.id, expiresAt, personalizado, topicos })
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

// Simulado sem domínio classificado ainda cairia numa lista de centenas de itens de
// uma questão cada, inútil como filtro. Nesse caso a lista sai vazia e a tela esconde
// a escolha de assuntos.
const MIN_QUESTOES_POR_TEMA = 5;

export async function opcoesDoSimulado(slug: string) {
    const [simulado] = await db
        .select()
        .from(simulados)
        .where(and(eq(simulados.slug, slug), eq(simulados.published, true)));
    if (!simulado) throw new AppError(404, "Simulado não encontrado");

    const temas = await db
        .select({ nome: assunto, questoes: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id))
        .groupBy(assunto)
        .orderBy(desc(count()));

    const comNome = temas.filter((t): t is { nome: string; questoes: number } => !!t.nome);
    const totalQuestoes = comNome.reduce((s, t) => s + Number(t.questoes), 0);
    const media = comNome.length ? totalQuestoes / comNome.length : 0;

    return {
        oficial: {
            questionCount: simulado.questionCount,
            durationMinutes: simulado.durationMinutes,
        },
        minQuestoes: MIN_QUESTOES,
        maxQuestoes: totalQuestoes,
        temas:
            media >= MIN_QUESTOES_POR_TEMA
                ? comNome.map((t) => ({ nome: t.nome, questoes: Number(t.questoes) }))
                : [],
    };
}

// O gabarito (isCorrect e a justificativa) só é revelado depois de enviar.
export async function estadoDaTentativa(userId: string, attemptId: string) {
    const [attempt] = await db
        .select()
        .from(simuladoAttempts)
        .where(and(eq(simuladoAttempts.id, attemptId), eq(simuladoAttempts.userId, userId)));
    if (!attempt) throw new AppError(404, "Tentativa não encontrada");

    const enviado = attempt.submittedAt !== null;

    const linhas = await db
        .select()
        .from(simuladoAttemptQuestions)
        .where(eq(simuladoAttemptQuestions.attemptId, attemptId))
        .orderBy(simuladoAttemptQuestions.position);
    // Tentativa enviada com snapshot renderiza a prova congelada no envio; as
    // demais (em andamento ou anteriores ao snapshot) leem o banco vivo.
    const congelada = enviado && linhas.length > 0 && linhas.every((l) => l.snapshot !== null);

    type QuestaoRevisao = {
        id: string;
        statement: string;
        position: number;
        multiple: boolean;
        options: { id: string; text: string; position: number; isCorrect?: boolean }[];
        selected: string[];
        topic?: string | null;
        explanation?: string | null;
    };
    const paraResumo: { topic: string | null; correta: boolean }[] = [];
    let questions: QuestaoRevisao[];

    if (congelada) {
        questions = linhas.map((l) => {
            const snap = l.snapshot!;
            const corretasSet = new Set<string>();
            const marcadasSet = new Set<string>();
            const options = snap.options.map((o, i) => {
                const id = `${l.id}:${i}`;
                if (o.isCorrect) corretasSet.add(id);
                if (o.marked) marcadasSet.add(id);
                return { id, text: o.text, position: i + 1, isCorrect: o.isCorrect };
            });
            paraResumo.push({
                topic: snap.topic,
                correta: questaoCorreta(marcadasSet, corretasSet),
            });
            return {
                id: l.questionId ?? l.id,
                statement: snap.statement,
                position: l.position,
                multiple: corretasSet.size > 1,
                options,
                selected: [...marcadasSet],
                topic: snap.topic,
                explanation: snap.explanation,
            };
        });
    } else {
        const questoes = await db
            .select({
                id: simuladoQuestions.id,
                statement: simuladoQuestions.statement,
                explanation: simuladoQuestions.explanation,
                topic: simuladoQuestions.topic,
                position: simuladoAttemptQuestions.position,
            })
            .from(simuladoAttemptQuestions)
            .innerJoin(
                simuladoQuestions,
                eq(simuladoQuestions.id, simuladoAttemptQuestions.questionId),
            )
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

        questions = questoes.map((q) => {
            const opcoesDaQuestao = embaralharComSemente(
                opcoes.filter((o) => o.questionId === q.id),
                attemptId + q.id,
            );
            if (enviado) {
                const corretasSet = new Set(
                    opcoesDaQuestao.filter((o) => o.isCorrect).map((o) => o.id),
                );
                const marcadasSet = new Set(marcadas.get(q.id) ?? []);
                paraResumo.push({
                    topic: q.topic,
                    correta: questaoCorreta(marcadasSet, corretasSet),
                });
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
    }

    const [sim] = await db
        .select({
            slug: simulados.slug,
            name: simulados.name,
            passPercent: simulados.passPercent,
        })
        .from(simulados)
        .where(eq(simulados.id, attempt.simuladoId));
    const restanteMs = attempt.expiresAt ? attempt.expiresAt.getTime() - Date.now() : null;
    return {
        attemptId: attempt.id,
        slug: sim?.slug ?? null,
        simulado: sim?.name ?? null,
        passPercent: sim?.passPercent ?? null,
        submitted: enviado,
        expiresAt: attempt.expiresAt,
        personalizado: attempt.personalizado,
        topicos: attempt.topicos ?? null,
        remainingSeconds:
            restanteMs === null ? null : enviado ? 0 : Math.max(0, Math.floor(restanteMs / 1000)),
        ...(enviado
            ? {
                  score: attempt.score,
                  passed: attempt.passed,
                  elapsedSeconds: Math.max(
                      0,
                      Math.round(
                          (attempt.submittedAt!.getTime() - attempt.startedAt.getTime()) / 1000,
                      ),
                  ),
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
    if (attempt.expiresAt && attempt.expiresAt <= new Date())
        throw new AppError(409, "Tempo esgotado");

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
    const questionIds = linhasQ.map((q) => q.questionId);

    const opcoesRows = questionIds.length
        ? await db
              .select()
              .from(simuladoOptions)
              .where(inArray(simuladoOptions.questionId, questionIds))
              .orderBy(simuladoOptions.position)
        : [];
    const respostasRows = await db
        .select()
        .from(simuladoAttemptAnswers)
        .where(eq(simuladoAttemptAnswers.attemptId, attemptId));

    const corretasPorQuestao = agrupar(
        opcoesRows.filter((o) => o.isCorrect).map((o) => [o.questionId, o.id]),
    );
    const respostasPorQuestao = agrupar(respostasRows.map((r) => [r.questionId, r.optionId]));
    const questoes = questionIds.map((id) => ({
        id,
        corretas: corretasPorQuestao.get(id) ?? new Set<string>(),
    }));

    const resultado = corrigirSimulado(questoes, respostasPorQuestao, simulado.passPercent);

    // Congela a prova como foi exibida (mesma ordem embaralhada) para a revisão
    // sobreviver a atualizações do banco de questões.
    const snapshots = linhasQ.map((q) => {
        const marcadasSet = respostasPorQuestao.get(q.questionId) ?? new Set<string>();
        const opcoes = embaralharComSemente(
            opcoesRows.filter((o) => o.questionId === q.questionId),
            attemptId + q.questionId,
        );
        const snapshot: SnapshotQuestaoRevisao = {
            statement: q.statement,
            explanation: q.explanation,
            topic: q.topic,
            options: opcoes.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                marked: marcadasSet.has(o.id),
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
            .set({ submittedAt: new Date(), score: resultado.score, passed: resultado.passed })
            .where(eq(simuladoAttempts.id, attemptId));
    });

    return resultado;
}

export async function historicoDoUsuario(userId: string) {
    const questoesPorTentativa = db
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
            comTempo: sql<boolean>`${simuladoAttempts.expiresAt} is not null`,
            topicos: simuladoAttempts.topicos,
            questoes: sql<number>`coalesce(${questoesPorTentativa.total}, 0)::int`,
        })
        .from(simuladoAttempts)
        .innerJoin(simulados, eq(simulados.id, simuladoAttempts.simuladoId))
        .leftJoin(questoesPorTentativa, eq(questoesPorTentativa.attemptId, simuladoAttempts.id))
        .where(eq(simuladoAttempts.userId, userId))
        .orderBy(desc(simuladoAttempts.startedAt));
}

// ===================== ADMIN (CRUD) =====================

type DadosSimulado = {
    slug: string;
    name: string;
    description?: string;
    durationMinutes: number;
    questionCount: number;
    passPercent: number;
    published: boolean;
};
type DadosSimuladoUpdate = Partial<Omit<DadosSimulado, "slug">>;
type DadosQuestao = {
    statement: string;
    topic?: string;
    explanation?: string;
    options: { text: string; isCorrect: boolean }[];
};

async function simuladoPorSlug(slug: string) {
    const [s] = await db.select().from(simulados).where(eq(simulados.slug, slug));
    if (!s) throw new AppError(404, "Simulado não encontrado");
    return s;
}

export async function listarSimuladosAdmin() {
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

export async function criarSimulado(dados: DadosSimulado) {
    const [existe] = await db
        .select({ id: simulados.id })
        .from(simulados)
        .where(eq(simulados.slug, dados.slug));
    if (existe) throw new AppError(409, "Já existe um simulado com esse slug");
    const [s] = await db.insert(simulados).values(dados).returning();
    return s;
}

export async function atualizarSimulado(slug: string, dados: DadosSimuladoUpdate) {
    const s = await simuladoPorSlug(slug);
    if (Object.keys(dados).length === 0) throw new AppError(400, "Nada para atualizar");
    const [atualizado] = await db
        .update(simulados)
        .set(dados)
        .where(eq(simulados.id, s.id))
        .returning();
    return atualizado;
}

export async function excluirSimulado(slug: string) {
    const s = await simuladoPorSlug(slug);
    await db.transaction(async (tx) => {
        const tentativas = await tx
            .select({ id: simuladoAttempts.id })
            .from(simuladoAttempts)
            .where(eq(simuladoAttempts.simuladoId, s.id));
        const attemptIds = tentativas.map((t) => t.id);
        if (attemptIds.length) {
            await tx
                .delete(simuladoAttemptAnswers)
                .where(inArray(simuladoAttemptAnswers.attemptId, attemptIds));
            await tx
                .delete(simuladoAttemptQuestions)
                .where(inArray(simuladoAttemptQuestions.attemptId, attemptIds));
            await tx.delete(simuladoAttempts).where(eq(simuladoAttempts.simuladoId, s.id));
        }
        const questoes = await tx
            .select({ id: simuladoQuestions.id })
            .from(simuladoQuestions)
            .where(eq(simuladoQuestions.simuladoId, s.id));
        const questionIds = questoes.map((q) => q.id);
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

// Simulado com o banco de questões inteiro (com gabarito), para a edição no admin.
export async function detalheSimuladoAdmin(slug: string) {
    const s = await simuladoPorSlug(slug);
    const questoes = await db
        .select()
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, s.id))
        .orderBy(simuladoQuestions.createdAt);
    const questionIds = questoes.map((q) => q.id);
    const opcoes = questionIds.length
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
        questions: questoes.map((q) => ({
            id: q.id,
            statement: q.statement,
            topic: q.topic,
            explanation: q.explanation,
            options: opcoes
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

export async function criarQuestaoSimulado(slug: string, dados: DadosQuestao) {
    const s = await simuladoPorSlug(slug);
    return db.transaction(async (tx) => {
        const [q] = await tx
            .insert(simuladoQuestions)
            .values({
                simuladoId: s.id,
                statement: dados.statement,
                topic: dados.topic,
                explanation: dados.explanation,
            })
            .returning();
        await tx.insert(simuladoOptions).values(
            dados.options.map((o, i) => ({
                questionId: q.id,
                text: o.text,
                isCorrect: o.isCorrect,
                position: i + 1,
            })),
        );
        return q;
    });
}

export async function atualizarQuestaoSimulado(questionId: string, dados: DadosQuestao) {
    const [q] = await db
        .select({ id: simuladoQuestions.id })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.id, questionId));
    if (!q) throw new AppError(404, "Questão não encontrada");
    await db.transaction(async (tx) => {
        await tx
            .update(simuladoQuestions)
            .set({
                statement: dados.statement,
                topic: dados.topic,
                explanation: dados.explanation,
            })
            .where(eq(simuladoQuestions.id, questionId));
        // Substitui as opções. Como o id delas muda, apaga as respostas de tentativas
        // que apontavam para as antigas (edição de banco reflete em revisões passadas).
        await tx
            .delete(simuladoAttemptAnswers)
            .where(eq(simuladoAttemptAnswers.questionId, questionId));
        await tx.delete(simuladoOptions).where(eq(simuladoOptions.questionId, questionId));
        await tx.insert(simuladoOptions).values(
            dados.options.map((o, i) => ({
                questionId,
                text: o.text,
                isCorrect: o.isCorrect,
                position: i + 1,
            })),
        );
    });
    return { ok: true };
}

export async function excluirQuestaoSimulado(questionId: string) {
    const [q] = await db
        .select({ id: simuladoQuestions.id })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.id, questionId));
    if (!q) throw new AppError(404, "Questão não encontrada");
    await db.transaction(async (tx) => {
        await tx
            .delete(simuladoAttemptAnswers)
            .where(eq(simuladoAttemptAnswers.questionId, questionId));
        // Tentativas com revisão congelada mantêm a linha (a questão vira órfã);
        // as demais perdem a questão, como antes.
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

// Salvar tudo numa única transação (atômico): remove as questões que sumiram,
// atualiza as que têm id e cria as novas. Se qualquer passo falhar, nada é gravado.
export async function sincronizarQuestoesSimulado(
    slug: string,
    questoes: ({ id?: string } & DadosQuestao)[],
) {
    const s = await simuladoPorSlug(slug);
    await db.transaction(async (tx) => {
        const existentes = await tx
            .select({ id: simuladoQuestions.id })
            .from(simuladoQuestions)
            .where(eq(simuladoQuestions.simuladoId, s.id));
        const idsExistentes = new Set(existentes.map((q) => q.id));

        const idsEnviados = new Set<string>();
        for (const q of questoes) {
            if (q.id) {
                if (!idsExistentes.has(q.id))
                    throw new AppError(400, "Questão não pertence a este simulado");
                idsEnviados.add(q.id);
            }
        }

        const aRemover = [...idsExistentes].filter((id) => !idsEnviados.has(id));
        if (aRemover.length) {
            await tx
                .delete(simuladoAttemptAnswers)
                .where(inArray(simuladoAttemptAnswers.questionId, aRemover));
            await tx
                .update(simuladoAttemptQuestions)
                .set({ questionId: null })
                .where(
                    and(
                        inArray(simuladoAttemptQuestions.questionId, aRemover),
                        isNotNull(simuladoAttemptQuestions.snapshot),
                    ),
                );
            await tx
                .delete(simuladoAttemptQuestions)
                .where(inArray(simuladoAttemptQuestions.questionId, aRemover));
            await tx.delete(simuladoOptions).where(inArray(simuladoOptions.questionId, aRemover));
            await tx.delete(simuladoQuestions).where(inArray(simuladoQuestions.id, aRemover));
        }

        for (const q of questoes) {
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
                const [nova] = await tx
                    .insert(simuladoQuestions)
                    .values({
                        simuladoId: s.id,
                        statement: q.statement,
                        topic: q.topic,
                        explanation: q.explanation,
                    })
                    .returning({ id: simuladoQuestions.id });
                questionId = nova.id;
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
