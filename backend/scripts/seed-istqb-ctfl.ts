// Seed do simulado ISTQB Certified Tester Foundation Level (CTFL), no formato da
// prova v4.0: 40 questões por tentativa, 60 minutos, corte de 65%. O banco tem 100
// questões (fator 2,5x), distribuídas pelo peso real de cada capítulo do syllabus.
// O topic é o capítulo oficial, então o filtro de assuntos funciona de imediato.
// O banco de questões vive em data/istqb-ctfl-questoes.ts, compartilhado com o
// atualizar-istqb-ctfl.ts.
//
// Aditivo por enunciado: re-rodar acrescenta as questões novas sem duplicar.
//
// Rodar em dev:  node --env-file=.env scripts/seed-istqb-ctfl.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-istqb-ctfl.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/istqb-ctfl-questoes.ts";

const SLUG = "istqb-ctfl";
const DESCRICAO =
    "Simulado no formato da prova CTFL v4.0 da ISTQB: 40 questões, 60 minutos, corte de 65%.";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "ISTQB Certified Tester Foundation Level (CTFL)",
                provider: "istqb",
                code: "CTFL",
                level: "Foundation",
                description: DESCRICAO,
                durationMinutes: 60,
                questionCount: 40,
                passPercent: 65,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({ provider: "istqb", code: "CTFL", level: "Foundation", description: DESCRICAO })
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
