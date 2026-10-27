const HORARIO_DE_BRASILIA = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

const UNIDADES_DE_TAMANHO = [
    ["GB", 1024 ** 3],
    ["MB", 1024 ** 2],
    ["KB", 1024],
] as const;

export function formatarInstante(iso: string): string {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return iso;
    const partes = new Map(
        HORARIO_DE_BRASILIA.formatToParts(data).map((parte) => [parte.type, parte.value]),
    );
    const parte = (tipo: Intl.DateTimeFormatPartTypes) => partes.get(tipo) ?? "";
    return `${parte("day")}/${parte("month")}/${parte("year")} ${parte("hour")}:${parte("minute")} (horário de Brasília)`;
}

export function formatarDuracao(ms: number): string {
    const minutos = Math.floor(Math.max(ms, 0) / 60_000);
    if (minutos < 1) return "menos de 1 min";
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return juntar(`${horas} h`, minutos % 60, `${minutos % 60} min`);
    const dias = Math.floor(horas / 24);
    return juntar(contar(dias, "dia", "dias"), horas % 24, `${horas % 24} h`);
}

export function formatarTamanho(bytes: number): string {
    for (const [unidade, tamanho] of UNIDADES_DE_TAMANHO) {
        if (bytes >= tamanho) return `${(bytes / tamanho).toFixed(1).replace(".", ",")} ${unidade}`;
    }
    return `${bytes} B`;
}

export function contar(quantidade: number, singular: string, plural: string): string {
    return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

export function resumir(texto: string, limite: number): string {
    const emUmaLinha = texto.replace(/\s+/g, " ").trim();
    return emUmaLinha.length <= limite ? emUmaLinha : `${emUmaLinha.slice(0, limite - 3)}...`;
}

function juntar(maior: string, quantidadeMenor: number, menor: string): string {
    return quantidadeMenor === 0 ? maior : `${maior} e ${menor}`;
}
