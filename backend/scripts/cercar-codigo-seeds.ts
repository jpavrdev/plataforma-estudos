// Codemod: cerca o código nos enunciados dos seeds (a fonte), para instalações limpas já
// nascerem com a indentação preservada. Espelha o backfill do banco (mesma lib) e é
// idempotente. Usa cerca simples (```), que renderiza igual à cerca com linguagem.
//
// Rodar: docker compose exec -T backend node scripts/cercar-codigo-seeds.ts [--dry] <arquivo...>
import { readFileSync, writeFileSync } from "node:fs";
import { cercarCodigo } from "./cercar-codigo.lib.ts";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const arquivos = args.filter((a) => !a.startsWith("--"));

// Casa `"statement": "..."` (chave com aspas) e `statement: "..."` (sem aspas): string de
// aspas duplas em uma linha só (os seeds usam \n escapado, não quebra de linha literal).
const RE = /((?:"statement"|statement)\s*:\s*)"((?:\\.|[^"\\])*)"/g;

let totalArquivos = 0;
let totalCercados = 0;
for (const arq of arquivos) {
    const orig = readFileSync(arq, "utf8");
    let n = 0;
    const novo = orig.replace(RE, (m, prefixo, corpo) => {
        let texto: string;
        try {
            texto = JSON.parse('"' + corpo + '"');
        } catch {
            console.warn("Enunciado ignorado (não decodou):", arq);
            return m;
        }
        const cercado = cercarCodigo(texto);
        if (cercado === texto) return m;
        n++;
        return prefixo + JSON.stringify(cercado);
    });
    totalCercados += n;
    if (n > 0) totalArquivos++;
    console.log(`${arq}: ${n} enunciado(s) cercado(s)`);
    if (!dry && n > 0) writeFileSync(arq, novo);
}
console.log(`\n${dry ? "[DRY] " : ""}Total: ${totalCercados} enunciado(s) em ${totalArquivos} arquivo(s).`);
