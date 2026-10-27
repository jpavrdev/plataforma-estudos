import { descreverErro } from "../dominio/erro.ts";
import type { ClienteHttp } from "../dominio/portas.ts";

const TIMEOUT_PADRAO_MS = 10_000;
const AGENTE = "ensinadev-monitor/1.0";

export class ClienteHttpFetch implements ClienteHttp {
    async obter(
        url: string,
        opcoes: { cabecalhos?: Record<string, string>; timeoutMs?: number } = {},
    ): Promise<{ status: number; corpo: string; latenciaMs: number }> {
        const timeoutMs = opcoes.timeoutMs ?? TIMEOUT_PADRAO_MS;
        const inicio = performance.now();
        try {
            const resposta = await fetch(url, {
                headers: { "user-agent": AGENTE, ...opcoes.cabecalhos },
                signal: AbortSignal.timeout(timeoutMs),
            });
            const corpo = await resposta.text();
            const latenciaMs = Math.round(performance.now() - inicio);
            return { status: resposta.status, corpo, latenciaMs };
        } catch (erro) {
            const motivo = traduzir(erro, timeoutMs);
            console.warn(`GET ${url} falhou: ${motivo}`);
            throw new Error(motivo, { cause: erro });
        }
    }
}

function traduzir(erro: unknown, timeoutMs: number): string {
    if (erro instanceof Error && erro.name === "TimeoutError") {
        return `tempo esgotado após ${timeoutMs} ms`;
    }
    const causa = erro instanceof Error && erro.cause !== undefined ? erro.cause : erro;
    return `falha de rede: ${descreverErro(causa)}`;
}
