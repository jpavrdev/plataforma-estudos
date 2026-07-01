// Lógica pura de streak. Recebe os dias ativos (YYYY-MM-DD) e o "hoje" já resolvido,
// então é determinística e testável, sem depender do relógio nem do fuso.

const LETRAS = ["D", "S", "T", "Q", "Q", "S", "S"]; // domingo..sábado

// Dia anterior a uma data YYYY-MM-DD, na aritmética UTC.
export function diaAnterior(dia: string): string {
    return new Date(Date.parse(dia + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
}

// Dias consecutivos terminando em hoje (ou ontem, se ainda não houve atividade hoje).
export function calcularStreak(dias: Set<string>, hoje: string): number {
    if (dias.size === 0) return 0;
    let cursor = hoje;
    if (!dias.has(cursor)) {
        cursor = diaAnterior(cursor);
        if (!dias.has(cursor)) return 0;
    }
    let n = 0;
    while (dias.has(cursor)) {
        n++;
        cursor = diaAnterior(cursor);
    }
    return n;
}

// Últimos 7 dias (mais antigo -> hoje) com flag de atividade, para o card da home.
export function semanaAtividade(
    dias: Set<string>,
    hoje: string,
): { label: string; active: boolean }[] {
    const ult7: string[] = [];
    let cursor = hoje;
    for (let i = 0; i < 7; i++) {
        ult7.unshift(cursor);
        cursor = diaAnterior(cursor);
    }
    return ult7.map((d) => ({
        label: LETRAS[new Date(d + "T00:00:00Z").getUTCDay()],
        active: dias.has(d),
    }));
}
