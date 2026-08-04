// Reconcilia o banco de questões do simulado AIF-C01 com data/aif-c01-questoes.ts
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
// Idempotente: rodar de novo sem mudanças no banco de questões não altera nada.
//
// Rodar em dev:  node --env-file=.env scripts/atualizar-aif-c01.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node --env-file=.env.prod scripts/atualizar-aif-c01.ts
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "../db.ts";
import {
    simulados,
    simuladoQuestions,
    simuladoOptions,
    simuladoAttemptQuestions,
    simuladoAttemptAnswers,
} from "../schema.ts";
import { QUESTOES, type Questao } from "./data/aif-c01-questoes.ts";

const SLUG = "aws-ai-practitioner";

type QuestaoDb = {
    id: string;
    statement: string;
    explanation: string | null;
    topic: string | null;
    options: { text: string; isCorrect: boolean; position: number }[];
};

function igual(atual: QuestaoDb, seed: Questao): boolean {
    if ((atual.explanation ?? "") !== seed.explanation) return false;
    if ((atual.topic ?? "") !== seed.topic) return false;
    if (atual.options.length !== seed.options.length) return false;
    const ordenadas = [...atual.options].sort((a, b) => a.position - b.position);
    return seed.options.every(
        ([text, isCorrect], i) =>
            ordenadas[i].text === text && ordenadas[i].isCorrect === isCorrect,
    );
}

async function atualizar() {
    const [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        console.log(`Simulado ${SLUG} não existe; rode o seed-aif-c01.ts.`);
        return;
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
    const alterar = QUESTOES.filter((q) => {
        const atual = porEnunciado.get(q.statement);
        return atual && !igual(atual, q);
    });

    if (!remover.length && !inserir.length && !alterar.length) {
        console.log(`Banco já está em dia (${questoesDb.length} questões).`);
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

        for (const q of alterar) {
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
