import { alertaDeFalha, alertaDeLembrete, alertaDeRecuperacao } from "./mensagens.ts";
import type { Alerta, EstadoVerificacao, Politica, Resultado } from "./tipos.ts";

const LEMBRETE_A_CADA_HORAS = 6;
const MS_POR_HORA = 3_600_000;

export const POLITICAS: Record<string, Politica> = {
    site: { falhasParaAlertar: 2, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
    api: { falhasParaAlertar: 2, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
    banco: { falhasParaAlertar: 2, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
    whatsapp: { falhasParaAlertar: 5, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
    disco: { falhasParaAlertar: 1, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
    labs: { falhasParaAlertar: 2, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
    renderizacao: { falhasParaAlertar: 2, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
    backup: { falhasParaAlertar: 1, lembreteACadaHoras: LEMBRETE_A_CADA_HORAS },
};

export function avaliar(
    anterior: EstadoVerificacao | undefined,
    resultado: Resultado,
    politica: Politica,
    agora: Date,
): { estado: EstadoVerificacao; alerta?: Alerta } {
    return resultado.situacao === "ok"
        ? avaliarSucesso(anterior, resultado, agora)
        : avaliarFalha(anterior, resultado, politica, agora);
}

function avaliarSucesso(
    anterior: EstadoVerificacao | undefined,
    resultado: Resultado,
    agora: Date,
): { estado: EstadoVerificacao; alerta?: Alerta } {
    const instante = agora.toISOString();
    const voltou = anterior?.situacao === "falha";
    const estado: EstadoVerificacao = {
        verificacao: resultado.verificacao,
        situacao: "ok",
        falhasSeguidas: 0,
        desde: anterior && !voltou ? anterior.desde : instante,
        alertado: false,
    };
    if (voltou && anterior.alertado) {
        return {
            estado: { ...estado, ultimoAlertaEm: instante },
            alerta: alertaDeRecuperacao(anterior, resultado, agora),
        };
    }
    return { estado: comUltimoAlerta(estado, anterior?.ultimoAlertaEm) };
}

function avaliarFalha(
    anterior: EstadoVerificacao | undefined,
    resultado: Resultado,
    politica: Politica,
    agora: Date,
): { estado: EstadoVerificacao; alerta?: Alerta } {
    const instante = agora.toISOString();
    const continua = anterior?.situacao === "falha";
    const estado = comUltimoAlerta(
        {
            verificacao: resultado.verificacao,
            situacao: "falha",
            falhasSeguidas: continua ? anterior.falhasSeguidas + 1 : 1,
            desde: continua ? anterior.desde : instante,
            alertado: continua && anterior.alertado,
        },
        anterior?.ultimoAlertaEm,
    );

    if (!estado.alertado) {
        if (estado.falhasSeguidas < politica.falhasParaAlertar) return { estado };
        const alertado = { ...estado, alertado: true, ultimoAlertaEm: instante };
        return { estado: alertado, alerta: alertaDeFalha(alertado, resultado, politica, agora) };
    }

    const ultimoAviso = Date.parse(estado.ultimoAlertaEm ?? estado.desde);
    if (agora.getTime() - ultimoAviso < politica.lembreteACadaHoras * MS_POR_HORA) {
        return { estado };
    }
    const lembrado = { ...estado, ultimoAlertaEm: instante };
    return { estado: lembrado, alerta: alertaDeLembrete(lembrado, resultado, agora) };
}

function comUltimoAlerta(
    estado: EstadoVerificacao,
    ultimoAlertaEm: string | undefined,
): EstadoVerificacao {
    return ultimoAlertaEm === undefined ? estado : { ...estado, ultimoAlertaEm };
}
