// Seed do simulado AZ-104 (Microsoft Azure Administrator), no formato da prova:
// 50 questões por tentativa, 100 minutos, corte de 65%. O banco tem 125 questões
// (fator 2,5x), distribuídas pelo peso oficial de cada domínio do skills measured
// de 17/04/2026. O topic é o domínio oficial, então o filtro de assuntos funciona
// de imediato. O banco de questões vive em data/az-104-questoes.ts, compartilhado
// com o atualizar-az-104.ts.
//
// Aditivo por enunciado: re-rodar acrescenta as questões novas sem duplicar.
//
// Rodar em dev:  node --env-file=.env scripts/seed-az-104.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-az-104.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/az-104-questoes.ts";

const SLUG = "az-104";
const DESCRICAO = "Simulado no formato da prova AZ-104: 50 questões, 100 minutos, corte de 65%.";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Microsoft Azure Administrator (AZ-104)",
                provider: "azure",
                code: "AZ-104",
                level: "Associate",
                description: DESCRICAO,
                durationMinutes: 100,
                questionCount: 50,
                passPercent: 65,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({ provider: "azure", code: "AZ-104", level: "Associate", description: DESCRICAO })
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
        console.log("Simulado já tem " + n + " questões, nada a fazer.");
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
    console.log(
        "Seed: " + inseridas + " questões novas inseridas (" + QUESTOES.length + " no banco).",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
