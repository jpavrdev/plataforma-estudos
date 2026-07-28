// Cerca em ``` o código dos enunciados de quiz que perderam a indentação. O código já
// está no banco com as quebras e os espaços certos, mas sem cerca de código o markdown
// inline (TextoMath) colapsa os espaços, quebrando a indentação (crítico em Python).
// Idempotente (pula quem já tem ```) e conservador (só mexe em enunciado com linha
// indentada). Casa a linguagem da aula na cerca.
//
// Rodar:      docker compose exec -T backend node scripts/cercar-codigo-questoes.ts [--dry]
// Em prod:    docker compose -f docker-compose.prod.yml exec -T backend node scripts/cercar-codigo-questoes.ts [--dry]
import { db } from "../db.ts";
import { questions, lessons } from "../schema.ts";
import { eq } from "drizzle-orm";
import { cercarCodigo } from "./cercar-codigo.lib.ts";

async function main() {
    const dry = process.argv.includes("--dry");
    const rows = await db
        .select({ id: questions.id, statement: questions.statement, lang: lessons.language })
        .from(questions)
        .innerJoin(lessons, eq(questions.lessonId, lessons.id));

    let alterados = 0;
    let amostras = 0;
    for (const r of rows) {
        const novo = cercarCodigo(r.statement, r.lang);
        if (novo === r.statement) continue;
        alterados++;
        if (dry) {
            if (amostras < 4) {
                amostras++;
                console.log("\n----- ANTES -----\n" + r.statement + "\n----- DEPOIS -----\n" + novo);
            }
            continue;
        }
        await db.update(questions).set({ statement: novo }).where(eq(questions.id, r.id));
    }
    console.log(`\n${dry ? "[DRY] " : ""}Enunciados cercados: ${alterados}`);
    process.exit(0);
}

main().catch((e) => {
    console.error("Falha ao cercar código:", e);
    process.exit(1);
});
