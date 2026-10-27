import type { Alerta, EstadoVerificacao } from "./tipos.ts";

export interface ClienteHttp {
    obter(
        url: string,
        opcoes?: { cabecalhos?: Record<string, string>; timeoutMs?: number },
    ): Promise<{ status: number; corpo: string; latenciaMs: number }>;
}

export interface ArmazenamentoBackup {
    tamanhoDe(chave: string): Promise<number | null>;
}

export interface Navegador {
    renderizar(
        url: string,
        timeoutMs: number,
    ): Promise<{ elementosNoRoot: number; errosDaPagina: string[] }>;
}

export interface RepositorioEstado {
    ler(verificacoes: string[]): Promise<Map<string, EstadoVerificacao>>;
    salvar(estado: EstadoVerificacao): Promise<void>;
}

export interface Notificador {
    enviar(alerta: Alerta): Promise<void>;
}

export interface FonteDeSegredo {
    token(): Promise<string>;
}
