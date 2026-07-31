// Seed do simulado Microsoft Azure Fundamentals (AZ-900). Idempotente: se o
// simulado já tiver questões, não faz nada. O banco de questões vive em
// data/az-900-questoes.ts, compartilhado com o atualizar-az-900.ts.
//
// Rodar em dev:  node --env-file=.env scripts/seed-az-900.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-az-900.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/az-900-questoes.ts";

const SLUG = "az-900";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Microsoft Azure Fundamentals (AZ-900)",
                provider: "azure",
                code: "AZ-900",
                level: "Fundamental",
                description:
                    "Simulado no formato da prova AZ-900: 45 minutos, corte de 70%. Mistura resposta única e múltipla.",
                durationMinutes: 45,
                questionCount: 50,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    // Mantém provedor, código e nível em dia mesmo se o simulado já existia.
    await db
        .update(simulados)
        .set({ provider: "azure", code: "AZ-900", level: "Fundamental" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    if (Number(n) > 0) {
        console.log(`Simulado já tem ${n} questões, nada a fazer.`);
        return;
    }

    for (const q of QUESTOES) {
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
            q.options.map(([text, isCorrect], i) => ({
                questionId: questao.id,
                text,
                isCorrect,
                position: i + 1,
            })),
        );
    }
    console.log(`Seed concluído: ${QUESTOES.length} questões inseridas.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
