// Preenche a coluna domain das questões dos simulados cujo topic guarda o serviço
// testado, e não o domínio da prova (SAA-C03, DVA-C02 e os dois do Databricks). Sem
// isso o filtro de assuntos ficaria com centenas de itens de uma questão cada, e por
// isso ele se esconde nesses simulados. O topic continua intacto: a revisão do
// resultado segue mostrando o assunto fino de cada questão.
//
// Idempotente: escreve sempre o mesmo domínio para o mesmo topic. Rodar depois de
// semear questões novas.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/aplicar-dominios-simulados.ts
import { readFileSync } from "node:fs";
import { db } from "../db.ts";
import { simulados, simuladoQuestions } from "../schema.ts";
import { and, eq, sql } from "drizzle-orm";

type Mapeamento = Record<string, { dominios: string[]; temas: Record<string, string> }>;

const MAPA: Mapeamento = JSON.parse(
    readFileSync(new URL("./data/dominios-simulados.json", import.meta.url), "utf8"),
);

async function aplicar() {
    for (const [slug, { temas }] of Object.entries(MAPA)) {
        const [sim] = await db.select().from(simulados).where(eq(simulados.slug, slug));
        if (!sim) {
            console.log(`${slug}: simulado não encontrado, pulando.`);
            continue;
        }

        let atualizadas = 0;
        for (const [topic, dominio] of Object.entries(temas)) {
            const res = await db
                .update(simuladoQuestions)
                .set({ domain: dominio })
                .where(
                    and(
                        eq(simuladoQuestions.simuladoId, sim.id),
                        eq(simuladoQuestions.topic, topic),
                        sql`${simuladoQuestions.domain} is distinct from ${dominio}`,
                    ),
                );
            atualizadas += res.rowCount ?? 0;
        }

        // Um topic sem mapeamento cai fora do filtro, então vale avisar em vez de
        // deixar passar em silêncio.
        const semDominio = await db
            .select({ topic: simuladoQuestions.topic })
            .from(simuladoQuestions)
            .where(
                and(
                    eq(simuladoQuestions.simuladoId, sim.id),
                    sql`${simuladoQuestions.domain} is null`,
                ),
            );
        const orfaos = [...new Set(semDominio.map((q) => q.topic ?? "(sem topic)"))];

        console.log(`${slug}: ${atualizadas} questões atualizadas.`);
        if (orfaos.length) console.log(`  sem domínio (${orfaos.length}): ${orfaos.join(", ")}`);
    }
}

aplicar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao aplicar domínios:", e);
        process.exit(1);
    });
