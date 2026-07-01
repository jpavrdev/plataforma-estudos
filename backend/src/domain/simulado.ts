// Por questão é tudo-ou-nada: o conjunto marcado tem que ser exatamente o correto.
// Vale para resposta única e múltipla.

function mesmosConjuntos(a: Set<string>, b: Set<string>): boolean {
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
}

export function questaoCorreta(marcadas: Set<string>, corretas: Set<string>): boolean {
    return corretas.size > 0 && mesmosConjuntos(marcadas, corretas);
}

export function corrigirSimulado(
    questoes: { id: string; corretas: Set<string> }[],
    respostas: Map<string, Set<string>>,
    passPercent: number,
): { acertos: number; total: number; score: number; passed: boolean } {
    let acertos = 0;
    for (const q of questoes) {
        if (questaoCorreta(respostas.get(q.id) ?? new Set(), q.corretas)) acertos++;
    }
    const total = questoes.length;
    const score = total === 0 ? 0 : Math.round((acertos / total) * 100);
    return { acertos, total, score, passed: total > 0 && score >= passPercent };
}

// Agrupa só os temas com erro, mais errados primeiro, para recomendar o que revisar.
export function resumoPorTema(
    questoes: { topic: string | null; correta: boolean }[],
): { topic: string; erradas: number; total: number }[] {
    const mapa = new Map<string, { erradas: number; total: number }>();
    for (const q of questoes) {
        const tema = q.topic ?? "Outros";
        const atual = mapa.get(tema) ?? { erradas: 0, total: 0 };
        atual.total++;
        if (!q.correta) atual.erradas++;
        mapa.set(tema, atual);
    }
    return [...mapa.entries()]
        .filter(([, v]) => v.erradas > 0)
        .map(([topic, v]) => ({ topic, erradas: v.erradas, total: v.total }))
        .sort((a, b) => b.erradas - a.erradas);
}
