// Life cycle of a raffle. Everything comes from the dates and a given "now",
// without reading the clock in here.

export type RaffleStatus = "agendado" | "aberto" | "encerrado" | "sorteado";

export interface Period {
    inicio: Date;
    fim: Date;
}

// The start is inside the period and the end is not: at the end instant sign-ups are already closed.
export function raffleStatus(
    raffle: Period & { sorteadoEm: Date | null },
    now: Date,
): RaffleStatus {
    if (raffle.sorteadoEm) return "sorteado";
    if (now.getTime() < raffle.inicio.getTime()) return "agendado";
    if (now.getTime() < raffle.fim.getTime()) return "aberto";
    return "encerrado";
}

export function isValidPeriod({ inicio: start, fim: end }: Period): boolean {
    return end.getTime() > start.getTime();
}

// Since the end is left out, a raffle that ends at the instant another one
// starts does not conflict with it.
export function periodsOverlap(a: Period, b: Period): boolean {
    return a.inicio.getTime() < b.fim.getTime() && b.inicio.getTime() < a.fim.getTime();
}
