import type { Ambiente } from "../handlers/ambiente.ts";

export const AMBIENTE_DE_EXEMPLO: Ambiente = {
    URL_SITE: "https://ensinadev.com.br/",
    URL_API: "https://ensinadev.com.br/api/health",
    URL_DEPENDENCIAS: "https://ensinadev.com.br/api/health/dependencias",
    PARAMETRO_TOKEN: "/ensinadev/monitor/token",
    TABELA_ESTADO: "monitor-estado",
    TOPICO_ALERTAS: "arn:aws:sns:sa-east-1:123456789012:monitor-alertas",
    BUCKET_BACKUP: "ensinadev-backup-prod",
    PREFIXO_BACKUP: "postgres/",
    REGIAO_BACKUP: "us-east-2",
};

export function semAVariavel(nome: string): Ambiente {
    const ambiente = { ...AMBIENTE_DE_EXEMPLO };
    delete ambiente[nome];
    return ambiente;
}
