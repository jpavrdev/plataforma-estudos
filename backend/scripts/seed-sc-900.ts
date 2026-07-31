// Seed do simulado Microsoft Security, Compliance, and Identity Fundamentals (SC-900).
// Aditivo por enunciado: insere só as questões que ainda não existem. O banco
// vive em data/sc-900-questoes.ts, compartilhado com o atualizar-sc-900.ts.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-sc-900.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/sc-900-questoes.ts";

const SLUG = "sc-900";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Microsoft Security, Compliance, and Identity Fundamentals (SC-900)",
                provider: "azure",
                code: "SC-900",
                level: "Fundamental",
                description: "Simulado no formato da prova SC-900: 45 minutos, corte de 70%.",
                durationMinutes: 45,
                questionCount: 50,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({ provider: "azure", code: "SC-900", level: "Fundamental" })
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
