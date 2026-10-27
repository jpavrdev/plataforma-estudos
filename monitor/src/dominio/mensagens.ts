import { contar, formatarDuracao, formatarInstante } from "./formatacao.ts";
import type { Alerta, EstadoVerificacao, Politica, Resultado } from "./tipos.ts";

interface Alvo {
    nome: string;
    feminino: boolean;
}

const ALVOS: Record<string, Alvo> = {
    site: { nome: "site", feminino: false },
    api: { nome: "API", feminino: true },
    banco: { nome: "banco de dados", feminino: false },
    whatsapp: { nome: "WhatsApp da recuperação de senha", feminino: false },
    disco: { nome: "disco de uploads", feminino: false },
    renderizacao: { nome: "renderização do site", feminino: true },
    backup: { nome: "backup do banco", feminino: false },
};

const PREFIXO = "[ensina.dev]";

export function alertaDeFalha(
    estado: EstadoVerificacao,
    resultado: Resultado,
    politica: Politica,
    agora: Date,
): Alerta {
    const alvo = alvoDe(estado.verificacao);
    const vezes =
        estado.falhasSeguidas > 1 ? ` em ${estado.falhasSeguidas} verificações seguidas` : "";
    const lembrete = contar(politica.lembreteACadaHoras, "hora", "horas");
    return {
        tipo: "falha",
        verificacao: estado.verificacao,
        assunto: `${PREFIXO} Falha ${noAlvo(alvo)}`,
        mensagem: [
            `O monitor detectou falha ${noAlvo(alvo)}${vezes}.`,
            "",
            `Detalhe: ${resultado.detalhe}`,
            `Em falha desde ${formatarInstante(estado.desde)}, há ${tempoDesde(estado.desde, agora)}.`,
            "",
            `Quando voltar ao normal você recebe outro email. Enquanto a falha continuar, chega um lembrete a cada ${lembrete}.`,
            `Verificação: ${estado.verificacao}`,
        ].join("\n"),
    };
}

export function alertaDeLembrete(
    estado: EstadoVerificacao,
    resultado: Resultado,
    agora: Date,
): Alerta {
    const alvo = alvoDe(estado.verificacao);
    return {
        tipo: "lembrete",
        verificacao: estado.verificacao,
        assunto: `${PREFIXO} ${oAlvo(alvo)} continua em falha`,
        mensagem: [
            `${oAlvo(alvo)} continua em falha há ${tempoDesde(estado.desde, agora)}, em ${estado.falhasSeguidas} verificações seguidas.`,
            "",
            `Detalhe da última verificação: ${resultado.detalhe}`,
            `Em falha desde ${formatarInstante(estado.desde)}.`,
            "",
            `Verificação: ${estado.verificacao}`,
        ].join("\n"),
    };
}

export function alertaDeRecuperacao(
    anterior: EstadoVerificacao,
    resultado: Resultado,
    agora: Date,
): Alerta {
    const alvo = alvoDe(anterior.verificacao);
    return {
        tipo: "recuperacao",
        verificacao: anterior.verificacao,
        assunto: `${PREFIXO} ${oAlvo(alvo)} voltou ao normal`,
        mensagem: [
            `${oAlvo(alvo)} voltou ao normal depois de ${tempoDesde(anterior.desde, agora)} em falha.`,
            "",
            `A falha começou em ${formatarInstante(anterior.desde)}.`,
            `Última verificação: ${resultado.detalhe}`,
            "",
            `Verificação: ${anterior.verificacao}`,
        ].join("\n"),
    };
}

function alvoDe(verificacao: string): Alvo {
    return ALVOS[verificacao] ?? { nome: verificacao, feminino: false };
}

function noAlvo(alvo: Alvo): string {
    return `${alvo.feminino ? "na" : "no"} ${alvo.nome}`;
}

function oAlvo(alvo: Alvo): string {
    return `${alvo.feminino ? "A" : "O"} ${alvo.nome}`;
}

function tempoDesde(inicio: string, agora: Date): string {
    return formatarDuracao(agora.getTime() - Date.parse(inicio));
}
