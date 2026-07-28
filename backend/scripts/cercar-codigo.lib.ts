// Detecção e cerca de blocos de código em enunciados de quiz. Sem cerca de código, o
// markdown inline (TextoMath) colapsa os espaços e quebra a indentação, o que é crítico
// em Python. Usado pelo backfill do banco (cercar-codigo-questoes.ts) e pelo codemod dos
// seeds (cercar-codigo-seeds.ts), para manter banco e fonte consistentes.

// Uma linha é "código" se está indentada, começa com uma construção de código, ou tem
// pontuação/atribuição de código. Pergunta (termina em ?) é sempre prosa.
export const KW =
    /^(def\b|class\b|function\b|func\b|let\b|const\b|var\b|return\b|import\b|from\b|for\b|while\b|if\b|elif\b|else\b|switch\b|match\b|case\b|with\b|try\b|except\b|finally\b|raise\b|throw\b|catch\b|lambda\b|yield\b|global\b|nonlocal\b|assert\b|print\(|println\b|printf\b|console\.|System\.|public\b|private\b|protected\b|static\b|void\b|SELECT\b|INSERT\b|UPDATE\b|DELETE\b|CREATE\b|ALTER\b|DROP\b|FROM\b|WHERE\b|JOIN\b|VALUES\b|GROUP\b|ORDER\b)/i;

export function isCode(line: string): boolean {
    if (/^\s+\S/.test(line)) return true; // indentada = código
    const t = line.trim();
    if (t === "") return false;
    if (/[?]$/.test(t)) return false; // pergunta = prosa
    if (KW.test(t)) return true; // começa com construção de código
    if (/[;{}]/.test(t)) return true; // pontuação de bloco
    if (/\w+\s*\([^)]*\)/.test(t)) return true; // chamada foo(...) (mesmo terminando em :)
    if (/^[\w.[\]"'()]+\s*[-+*/%]?=[^=]/.test(t)) return true; // atribuição no início da linha
    return false;
}

// Envolve o bloco de código (da primeira à última linha de código) numa cerca, mantendo a
// intro antes e a pergunta depois. Retorna o enunciado inalterado se já houver cerca ou se
// não houver bloco de código indentado de fato (conservador e idempotente).
export function cercarCodigo(statement: string, lang?: string | null): string {
    if (!statement || statement.includes("```")) return statement;
    if (!/\n[ \t]+\S/.test(statement)) return statement; // sem linha indentada: não mexe
    const lines = statement.replace(/\r\n/g, "\n").split("\n");
    let first = -1;
    let last = -1;
    for (let i = 0; i < lines.length; i++) {
        if (isCode(lines[i])) {
            if (first === -1) first = i;
            last = i;
        }
    }
    if (first === -1) return statement;
    const intro = lines.slice(0, first).join("\n").replace(/\s+$/, "");
    const code = lines.slice(first, last + 1).join("\n");
    const outro = lines
        .slice(last + 1)
        .join("\n")
        .replace(/^\s+/, "");
    const fence = lang ? "```" + lang : "```";
    const partes: string[] = [];
    if (intro.trim()) partes.push(intro);
    partes.push(fence + "\n" + code + "\n```");
    if (outro.trim()) partes.push(outro);
    return partes.join("\n\n");
}
