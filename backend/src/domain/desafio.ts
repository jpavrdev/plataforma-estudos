// Correção dos desafios de código. Dois modos:
// - stdin: compara a saída como texto (ignora espaços no fim das linhas e linhas
//   em branco no fim), como nos juízes clássicos.
// - function: compara o retorno da função por igualdade profunda de JSON.
export function normalizarSaida(s: string): string {
    return s
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((linha) => linha.replace(/[ \t]+$/, ""))
        .join("\n")
        .replace(/\n+$/, "");
}

export function saidaCorreta(obtida: string, esperada: string): boolean {
    return normalizarSaida(obtida) === normalizarSaida(esperada);
}

// Igualdade profunda de valores JSON (arrays, objetos, primitivos).
export function jsonProfundamenteIgual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((x, i) => jsonProfundamenteIgual(x, b[i]));
    }
    if (a && b && typeof a === "object" && typeof b === "object") {
        const ka = Object.keys(a as object);
        const kb = Object.keys(b as object);
        if (ka.length !== kb.length) return false;
        return ka.every((k) =>
            jsonProfundamenteIgual(
                (a as Record<string, unknown>)[k],
                (b as Record<string, unknown>)[k],
            ),
        );
    }
    return false;
}

// Compara o retorno da função (JSON) com o esperado. Se algum lado não for JSON
// válido, cai para comparação textual (tolerante).
export function retornoCorreto(obtido: string, esperado: string): boolean {
    try {
        return jsonProfundamenteIgual(JSON.parse(obtido), JSON.parse(esperado));
    } catch {
        return saidaCorreta(obtido, esperado);
    }
}

// Hash FNV-1a: base para escolher o desafio do dia de forma determinística.
export function hashData(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

// Índice do desafio do dia: mesmo para todos os usuários, muda a cada dia.
// Semeado pela data (YYYY-MM-DD), então é estável dentro do mesmo dia.
export function indiceDoDia(hoje: string, total: number): number {
    if (total <= 0) return -1;
    return hashData(hoje) % total;
}

export interface SaidaCaso {
    stdout: string;
    exitCode: number;
    timedOut: boolean;
}

export type ModoDesafio = "stdin" | "function";

// Um caso só conta se o programa terminou bem (sem timeout, exit 0) e a saída bate.
export function corrigirDesafio(esperados: string[], saidas: SaidaCaso[], modo: ModoDesafio = "stdin") {
    const comparar = modo === "function" ? retornoCorreto : saidaCorreta;
    let acertos = 0;
    const casos = esperados.map((esperada, i) => {
        const s = saidas[i];
        const ok = !!s && !s.timedOut && s.exitCode === 0 && comparar(s.stdout, esperada);
        if (ok) acertos++;
        return ok;
    });
    return {
        aprovado: esperados.length > 0 && acertos === esperados.length,
        acertos,
        total: esperados.length,
        casos,
    };
}
