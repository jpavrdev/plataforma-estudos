// Seed do simulado AWS Certified Developer Associate (DVA-C02). Aditivo por
// enunciado: insere só as questões que ainda não existem. O banco de questões
// vive em data/dva-c02-questoes.ts, compartilhado com o atualizar-dva-c02.ts.
//
// Rodar em dev:  node --env-file=.env scripts/seed-dva-c02.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-dva-c02.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/dva-c02-questoes.ts";

const SLUG = "dva-c02";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "AWS Certified Developer Associate (DVA-C02)",
                provider: "aws",
                code: "DVA-C02",
                level: "Associate",
                description:
                    "Simulado no formato da prova DVA-C02: 130 minutos, corte de 72%. Mistura resposta única e múltipla, alinhado aos 4 domínios.",
                durationMinutes: 130,
                questionCount: 65,
                passPercent: 72,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    // Mantém provedor, código e nível em dia mesmo se o simulado já existia.
    await db
        .update(simulados)
        .set({ provider: "aws", code: "DVA-C02", level: "Associate" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    const jaExistem = new Set(
        (
            await db
                .select({ statement: simuladoQuestions.statement })
                .from(simuladoQuestions)
                .where(eq(simuladoQuestions.simuladoId, simulado.id))
        ).map((r) => r.statement),
    );
    const inseridas = QUESTOES.filter((q) => !jaExistem.has(q.statement)).length;
    if (inseridas === 0) {
        console.log(`Simulado já tem ${n} questões, nada a fazer.`);
        return;
    }

    for (let i = 0; i < QUESTOES.length; i++) {
        const q = QUESTOES[i];
        if (jaExistem.has(q.statement)) continue;
        const [questao] = await db
            .insert(simuladoQuestions)
            .values({
                simuladoId: simulado.id,
                statement: q.statement,
                explanation: q.explanation,
                topic: q.topic,
            })
            .returning();
        await db.insert(simuladoOptions).values(
            q.options.map(([text, isCorrect], idx) => ({
                questionId: questao.id,
                text,
                isCorrect,
                position: idx + 1,
            })),
        );
    }
    console.log(`Seed: ${inseridas} questões novas inseridas (${QUESTOES.length} no banco).`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
