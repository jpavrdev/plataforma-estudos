// Seed do simulado Scrum.org Professional Scrum Product Owner I (PSPO I), no
// formato da prova real: 80 questões por tentativa, 60 minutos, corte de 85%. O
// banco tem 120 questões (fator 1,5x), distribuídas pelo peso das áreas de foco
// da Scrum.org. O topic é a área de foco, então o filtro de assuntos funciona de
// imediato. O banco de questões vive em data/pspo-i-questoes.ts, compartilhado
// com um eventual script de atualização.
//
// Aditivo por enunciado: re-rodar acrescenta as questões novas sem duplicar.
//
// Rodar em dev:  node --env-file=.env scripts/seed-pspo-i.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-pspo-i.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/pspo-i-questoes.ts";

const SLUG = "pspo-i";
const DESCRICAO =
    "Simulado no formato da prova PSPO I da Scrum.org: 80 questões, 60 minutos, corte de 85%. A prova oficial é em inglês; treine aqui os conceitos e a leitura de cenário.";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Scrum.org PSPO I",
                provider: "scrum-org",
                code: "PSPO I",
                level: "Professional",
                description: DESCRICAO,
                durationMinutes: 60,
                questionCount: 80,
                passPercent: 85,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({
            provider: "scrum-org",
            code: "PSPO I",
            level: "Professional",
            description: DESCRICAO,
        })
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
