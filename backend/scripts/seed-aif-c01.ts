// Seed do simulado AWS Certified AI Practitioner (AIF-C01). Questões autorais,
// escritas para ensinar os conceitos dos 5 domínios do exame (não reproduzem a prova real).
// O banco de questões vive em data/aif-c01-questoes.ts, compartilhado com o script
// atualizar-aif-c01.ts, que reconcilia instalações onde o simulado já existe.
// Idempotente: insere só as questões que ainda não existem, sem tocar nas demais.
//
// Rodar em dev:  node --env-file=.env scripts/seed-aif-c01.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node --env-file=.env.prod scripts/seed-aif-c01.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/aif-c01-questoes.ts";

const SLUG = "aws-ai-practitioner";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "AWS Certified AI Practitioner (AIF-C01)",
                provider: "aws",
                code: "AIF-C01",
                level: "Fundamental",
                description:
                    "Simulado no formato da prova AIF-C01: 90 minutos, corte de 70%. Cobre os 5 domínios: fundamentos de IA e ML, IA generativa, aplicações de foundation models, IA responsável e segurança e governança.",
                durationMinutes: 90,
                questionCount: 65,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    await db
        .update(simulados)
        .set({ provider: "aws", code: "AIF-C01", level: "Fundamental" })
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

    for (const q of QUESTOES) {
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
