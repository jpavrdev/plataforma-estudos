// Seed do simulado Databricks Certified Data Engineer Professional (databricks-de-professional). Aditivo por enunciado: insere só as questões
// que ainda não existem. O banco vive em data/databricks-de-professional-questoes.ts,
// compartilhado com o atualizar-databricks-de-professional.ts.
//
// Rodar em dev:  node --env-file=.env scripts/seed-databricks-de-professional.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-databricks-de-professional.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";
import { QUESTOES } from "./data/databricks-de-professional-questoes.ts";

const SLUG = "databricks-de-professional";

const DESCRICAO =
    "Simulado no formato do exame Databricks Certified Data Engineer Professional: 120 minutos, 59 questões por tentativa, corte de 70%. Nível avançado, cobrindo desenvolvimento de código (Python/SQL), ingestão, transformação e qualidade, compartilhamento e federação, monitoramento e alertas, otimização de custo e desempenho, segurança e conformidade, governança, debugging e deploy, e modelagem de dados. Delta Lake avançado (CDF, deletion vectors), Structured Streaming e Lakeflow Spark Declarative Pipelines. Nomenclatura Lakeflow atual.";

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Databricks Certified Data Engineer Professional",
                provider: "databricks",
                code: "Databricks DE Professional",
                level: "Professional",
                description: DESCRICAO,
                durationMinutes: 120,
                questionCount: 59,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    await db
        .update(simulados)
        .set({
            provider: "databricks",
            code: "Databricks DE Professional",
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
        console.log(`Simulado ja tem ${n} questoes, nada a fazer.`);
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
        await db
            .insert(simuladoOptions)
            .values(
                q.options.map(([text, isCorrect], idx) => ({
                    questionId: questao.id,
                    text,
                    isCorrect,
                    position: idx + 1,
                })),
            );
    }
    console.log(`Seed: ${inseridas} questoes novas inseridas (${QUESTOES.length} no banco).`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
