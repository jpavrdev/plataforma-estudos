// Regras do endpoint de dependências que o monitor externo consulta. O I/O de
// cada dependência entra pelas portas, então tudo aqui roda nos testes sem
// rede, banco nem disco.
import { createHash, timingSafeEqual } from "node:crypto";

export type Situacao = "ok" | "falha";

export interface EstadoBanco {
    situacao: Situacao;
    latenciaMs?: number;
}

export interface EstadoWhatsapp {
    situacao: Situacao | "nao-configurado";
    estado?: string;
}

export interface EstadoDisco {
    situacao: Situacao;
    usoPercentual?: number;
}

export interface RelatorioDependencias {
    banco: EstadoBanco;
    whatsapp: EstadoWhatsapp;
    disco: EstadoDisco;
}

// Campos do statfs, com os nomes que o Node devolve.
export interface EspacoEmDisco {
    blocks: number;
    bfree: number;
    bavail: number;
}

export interface PortasDependencias {
    consultarBanco(): Promise<unknown>;
    // null quando a API roda sem Evolution (dev).
    estadoDoWhatsapp(sinal: AbortSignal): Promise<string | null>;
    espacoEmDisco(): Promise<EspacoEmDisco>;
}

export function tokenDoCabecalho(authorization: string | undefined): string | null {
    return authorization?.match(/^Bearer\s+(\S+)\s*$/i)?.[1] ?? null;
}

const resumo = (valor: string) => createHash("sha256").update(valor).digest();

// O timingSafeEqual exige buffers do mesmo tamanho. Comparar os hashes resolve
// isso sem deixar o tempo de resposta revelar o tamanho do token.
export function tokenConfere(recebido: string | null, esperado: string): boolean {
    if (!recebido || !esperado) return false;
    return timingSafeEqual(resumo(recebido), resumo(esperado));
}

export class TempoEsgotado extends Error {
    constructor(ms: number) {
        super(`sem resposta em ${ms} ms`);
        this.name = "TempoEsgotado";
    }
}

// O sinal é abortado no estouro para que quem sabe cancelar (o fetch) solte a
// conexão em vez de seguir pendurado depois que a resposta já saiu.
export async function comTimeout<T>(
    tarefa: (sinal: AbortSignal) => Promise<T>,
    ms: number,
): Promise<T> {
    const controle = new AbortController();
    let relogio: ReturnType<typeof setTimeout> | undefined;
    const estouro = new Promise<never>((_, rejeitar) => {
        relogio = setTimeout(() => {
            const erro = new TempoEsgotado(ms);
            controle.abort(erro);
            rejeitar(erro);
        }, ms);
    });
    try {
        return await Promise.race([tarefa(controle.signal), estouro]);
    } finally {
        clearTimeout(relogio);
    }
}

// Mesma conta do df: a reserva do root fica fora do total e o resultado sobe
// para o inteiro de cima, para o número bater com o df -h da VPS.
export function usoPercentual({ blocks, bfree, bavail }: EspacoEmDisco): number {
    const usados = blocks - bfree;
    const total = usados + bavail;
    if (total <= 0) throw new Error("statfs sem blocos utilizáveis");
    return Math.ceil((usados * 100) / total);
}

export function criarVerificadorDeDependencias(portas: PortasDependencias, timeoutMs: number) {
    async function banco(): Promise<EstadoBanco> {
        const inicio = performance.now();
        await portas.consultarBanco();
        return { situacao: "ok", latenciaMs: Math.round(performance.now() - inicio) };
    }

    async function whatsapp(sinal: AbortSignal): Promise<EstadoWhatsapp> {
        const estado = await portas.estadoDoWhatsapp(sinal);
        if (estado === null) return { situacao: "nao-configurado" };
        // Só a conexão aberta entrega mensagem; "connecting" e "close" já são falha.
        return { situacao: estado === "open" ? "ok" : "falha", estado };
    }

    async function disco(): Promise<EstadoDisco> {
        return { situacao: "ok", usoPercentual: usoPercentual(await portas.espacoEmDisco()) };
    }

    // O motivo fica só no log: o corpo diz o que falhou, nunca o porquê.
    async function checar<T>(
        nome: string,
        checagem: (sinal: AbortSignal) => Promise<T>,
    ): Promise<T | { situacao: "falha" }> {
        try {
            return await comTimeout(checagem, timeoutMs);
        } catch (erro) {
            console.error(`[dependencias] ${nome} falhou:`, erro);
            return { situacao: "falha" };
        }
    }

    return async function verificarDependencias(): Promise<RelatorioDependencias> {
        const [estadoBanco, estadoWhatsapp, estadoDisco] = await Promise.all([
            checar("banco", banco),
            checar("whatsapp", whatsapp),
            checar("disco", disco),
        ]);
        return { banco: estadoBanco, whatsapp: estadoWhatsapp, disco: estadoDisco };
    };
}
