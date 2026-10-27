export type Situacao = "ok" | "falha";

export interface Resultado {
    verificacao: string;
    situacao: Situacao;
    detalhe: string;
    medidoEm: string;
    latenciaMs?: number;
}

export interface Politica {
    falhasParaAlertar: number;
    lembreteACadaHoras: number;
}

export interface EstadoVerificacao {
    verificacao: string;
    situacao: Situacao;
    falhasSeguidas: number;
    desde: string;
    alertado: boolean;
    ultimoAlertaEm?: string;
}

export interface Alerta {
    tipo: "falha" | "recuperacao" | "lembrete";
    verificacao: string;
    assunto: string;
    mensagem: string;
}
