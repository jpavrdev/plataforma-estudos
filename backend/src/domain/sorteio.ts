// Ciclo de vida de um sorteio. Tudo sai das datas e de um "agora" recebido, sem
// ler o relógio aqui dentro.

export type Situacao = "agendado" | "aberto" | "encerrado" | "sorteado";

export interface Periodo {
    inicio: Date;
    fim: Date;
}

// O início entra no período e o fim não: no instante do fim as inscrições já fecharam.
export function situacaoDoSorteio(
    sorteio: Periodo & { sorteadoEm: Date | null },
    agora: Date,
): Situacao {
    if (sorteio.sorteadoEm) return "sorteado";
    if (agora.getTime() < sorteio.inicio.getTime()) return "agendado";
    if (agora.getTime() < sorteio.fim.getTime()) return "aberto";
    return "encerrado";
}

export function periodoValido({ inicio, fim }: Periodo): boolean {
    return fim.getTime() > inicio.getTime();
}

// Como o fim fica de fora, um sorteio que termina no instante em que outro
// começa não conflita com ele.
export function periodosSobrepoem(a: Periodo, b: Periodo): boolean {
    return a.inicio.getTime() < b.fim.getTime() && b.inicio.getTime() < a.fim.getTime();
}
