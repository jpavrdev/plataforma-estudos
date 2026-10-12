// Reconcilia o banco de questões do simulado databricks-de-professional com data/databricks-de-professional-questoes.ts
// em uma instalação onde o simulado já existe. Casa questão por enunciado:
// insere as novas, atualiza as que mudaram e remove as que saíram do banco.
//
// Remoção e alteração seguem o mesmo padrão do editor de simulados do admin
// (sincronizarQuestoesSimulado): as respostas e o snapshot das tentativas
// antigas que apontam para a questão saem junto. A nota e a aprovação de cada
// tentativa ficam gravadas na própria tentativa e não mudam. Tentativas com
// revisão congelada (snapshot) preservam a revisão intacta; nas demais, a
// revisão deixa de exibir as questões alteradas ou removidas.
//
// Também corrige a descrição do simulado, que estava sem acentos.
//
// Idempotente: rodar de novo sem mudanças no banco de questões não altera nada.
//
// Com --dry-run, só imprime o que faria e sai sem gravar nada. É assim que se
// confere o estado de produção: rodar de verdade "só para ver" reescreve
// alternativa e leva embora as respostas das tentativas.
//
// Rodar em dev:  node --env-file=.env scripts/atualizar-databricks-de-professional.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node --env-file=.env.prod scripts/atualizar-databricks-de-professional.ts
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "../db.ts";
import {
    simulados,
    simuladoQuestions,
    simuladoOptions,
    simuladoAttemptQuestions,
    simuladoAttemptAnswers,
} from "../schema.ts";
import { QUESTOES, type Questao } from "./data/databricks-de-professional-questoes.ts";

const SLUG = "databricks-de-professional";

type QuestaoDb = {
    id: string;
    statement: string;
    explanation: string | null;
    topic: string | null;
    options: { text: string; isCorrect: boolean; position: number }[];
};

// Diz o que mudou entre o que está gravado e o arquivo de dados, ou null
// quando nada mudou. O motivo aparece no --dry-run, e é o que denuncia na hora
// uma rodada que ia reescrever alternativa sem precisar.
function diferenca(atual: QuestaoDb, seed: Questao): string | null {
    if ((atual.explanation ?? "") !== seed.explanation) return "resolução";
    if ((atual.topic ?? "") !== seed.topic) return "tópico";
    if (atual.options.length !== seed.options.length) return "número de alternativas";
    // Compara por texto, e não pela position, porque a ordem gravada não é a
    // ordem de autoria: o scripts/embaralhar-alternativas.ts embaralha a
    // position para a correta não ficar sempre na frente. Comparar por position
    // dava questão "alterada" em toda rodada, e alternativa reescrita apaga as
    // respostas que as tentativas deram nela.
    const porTexto = (a: { text: string }, b: { text: string }) => (a.text < b.text ? -1 : 1);
    const atuais = [...atual.options].sort(porTexto);
    const doSeed = seed.options.map(([text, isCorrect]) => ({ text, isCorrect })).sort(porTexto);
    const i = doSeed.findIndex(
        (o, k) => atuais[k].text !== o.text || atuais[k].isCorrect !== o.isCorrect,
    );
    if (i < 0) return null;
    return atuais[i].text === doSeed[i].text ? "gabarito de alternativa" : "texto de alternativa";
}

const SIMULAR = process.argv.includes("--dry-run");

// Primeiras palavras do enunciado, para o --dry-run caber na tela.
const resumo = (texto: string) =>
    texto.length > 90 ? `${texto.slice(0, 90).trimEnd()}...` : texto;

function imprimirPlano(
    remover: { statement: string }[],
    inserir: { statement: string }[],
    alterar: { seed: { statement: string }; motivo: string }[],
) {
    for (const q of remover) console.log(`  remover: ${resumo(q.statement)}`);
    for (const q of inserir) console.log(`  inserir: ${resumo(q.statement)}`);
    for (const a of alterar) console.log(`  alterar (${a.motivo}): ${resumo(a.seed.statement)}`);
}

async function atualizar() {
    const [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        console.log(`Simulado ${SLUG} não existe; rode o seed-databricks-de-professional.ts.`);
        return;
    }

    if (!SIMULAR) {
        await db
            .update(simulados)
            .set({
                description:
                    "Simulado no formato do exame Databricks Certified Data Engineer Professional: 120 minutos, 59 questões por tentativa, corte de 70%. Nível avançado, cobrindo desenvolvimento de código (Python/SQL), ingestão, transformação e qualidade, compartilhamento e federação, monitoramento e alertas, otimização de custo e desempenho, segurança e conformidade, governança, debugging e deploy, e modelagem de dados. Delta Lake avançado (CDF, deletion vectors), Structured Streaming e Lakeflow Spark Declarative Pipelines. Nomenclatura Lakeflow atual.",
            })
            .where(eq(simulados.id, simulado.id));
    }

    const questoesDb = await db
        .select()
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    const ids = questoesDb.map((q) => q.id);
    const opcoesDb = ids.length
        ? await db.select().from(simuladoOptions).where(inArray(simuladoOptions.questionId, ids))
        : [];

    const porEnunciado = new Map<string, QuestaoDb>(
        questoesDb.map((q) => [
            q.statement,
            { ...q, options: opcoesDb.filter((o) => o.questionId === q.id) },
        ]),
    );
    const enunciadosSeed = new Set(QUESTOES.map((q) => q.statement));

    const remover = questoesDb.filter((q) => !enunciadosSeed.has(q.statement));
    const inserir = QUESTOES.filter((q) => !porEnunciado.has(q.statement));
    const alterar = QUESTOES.flatMap((q) => {
        const atual = porEnunciado.get(q.statement);
        if (!atual) return [];
        const motivo = diferenca(atual, q);
        return motivo ? [{ seed: q, motivo }] : [];
    });

    if (!remover.length && !inserir.length && !alterar.length) {
        console.log(`Banco já está em dia (${questoesDb.length} questões).`);
        return;
    }

    if (SIMULAR) {
        console.log(
            `Simulação: ${inserir.length} a inserir, ${alterar.length} a alterar, ${remover.length} a remover (${questoesDb.length} no banco hoje).`,
        );
        imprimirPlano(remover, inserir, alterar);
        console.log("Nada foi gravado. Rode sem --dry-run para aplicar.");
        return;
    }

    await db.transaction(async (tx) => {
        if (remover.length) {
            const idsRemover = remover.map((q) => q.id);
            await tx
                .delete(simuladoAttemptAnswers)
                .where(inArray(simuladoAttemptAnswers.questionId, idsRemover));
            await tx
                .update(simuladoAttemptQuestions)
                .set({ questionId: null })
                .where(
                    and(
                        inArray(simuladoAttemptQuestions.questionId, idsRemover),
                        isNotNull(simuladoAttemptQuestions.snapshot),
                    ),
                );
            await tx
                .delete(simuladoAttemptQuestions)
                .where(inArray(simuladoAttemptQuestions.questionId, idsRemover));
            await tx.delete(simuladoOptions).where(inArray(simuladoOptions.questionId, idsRemover));
            await tx.delete(simuladoQuestions).where(inArray(simuladoQuestions.id, idsRemover));
        }

        for (const { seed: q } of alterar) {
            const atual = porEnunciado.get(q.statement)!;
            await tx
                .update(simuladoQuestions)
                .set({ explanation: q.explanation, topic: q.topic })
                .where(eq(simuladoQuestions.id, atual.id));
            await tx
                .delete(simuladoAttemptAnswers)
                .where(eq(simuladoAttemptAnswers.questionId, atual.id));
            await tx.delete(simuladoOptions).where(eq(simuladoOptions.questionId, atual.id));
            await tx.insert(simuladoOptions).values(
                q.options.map(([text, isCorrect], idx) => ({
                    questionId: atual.id,
                    text,
                    isCorrect,
                    position: idx + 1,
                })),
            );
        }

        for (const q of inserir) {
            const [nova] = await tx
                .insert(simuladoQuestions)
                .values({
                    simuladoId: simulado.id,
                    statement: q.statement,
                    explanation: q.explanation,
                    topic: q.topic,
                })
                .returning();
            await tx.insert(simuladoOptions).values(
                q.options.map(([text, isCorrect], idx) => ({
                    questionId: nova.id,
                    text,
                    isCorrect,
                    position: idx + 1,
                })),
            );
        }
    });

    console.log(
        `Atualizado: ${inserir.length} inseridas, ${alterar.length} alteradas, ${remover.length} removidas (${QUESTOES.length} no banco).`,
    );
}

atualizar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha na atualização:", e);
        process.exit(1);
    });
