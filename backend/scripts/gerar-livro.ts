// Gera o livro (EPUB) de uma trilha em arquivo, para conferir o resultado fora
// da plataforma. O endpoint do aluno usa o mesmo gerador.
// Uso: node scripts/gerar-livro.ts <id-ou-parte-do-nome-da-trilha> [linguagem]
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { eq, ilike } from "drizzle-orm";
import { db } from "../db.ts";
import { trails } from "../schema.ts";
import { livroDaTrilha } from "../src/services/livro.service.ts";
import { LIVROS_DIR } from "../src/config/paths.ts";

const [alvo, lang] = process.argv.slice(2);
if (!alvo) {
    console.error("uso: node scripts/gerar-livro.ts <id-ou-parte-do-nome-da-trilha> [linguagem]");
    process.exit(1);
}

const achadas = /^[0-9a-f-]{36}$/i.test(alvo)
    ? await db.select({ id: trails.id, name: trails.name }).from(trails).where(eq(trails.id, alvo))
    : await db
          .select({ id: trails.id, name: trails.name })
          .from(trails)
          .where(ilike(trails.name, `%${alvo}%`));

if (achadas.length === 0) {
    console.error(`Nenhuma trilha casou com "${alvo}".`);
    process.exit(1);
}
if (achadas.length > 1) {
    console.error(
        `"${alvo}" casou com mais de uma trilha:\n${achadas.map((t) => `  ${t.id}  ${t.name}`).join("\n")}`,
    );
    process.exit(1);
}

const { buffer, nome } = await livroDaTrilha(achadas[0].id, lang);
const destino = path.join(LIVROS_DIR, nome);
await writeFile(destino, buffer);
console.log(`${achadas[0].name}: ${destino} (${(buffer.length / 1024).toFixed(0)} KB)`);
process.exit(0);
