import { resumir } from "../dominio/formatacao.ts";
import type { Resultado, Situacao } from "../dominio/tipos.ts";

const LIMITE_DO_DETALHE = 300;

export interface Medicao {
    ok(detalhe: string, latenciaMs?: number): Resultado;
    falha(detalhe: string, latenciaMs?: number): Resultado;
}

export function novaMedicao(verificacao: string, medidaEm: Date): Medicao {
    const medidoEm = medidaEm.toISOString();
    const criar = (situacao: Situacao, detalhe: string, latenciaMs?: number): Resultado => {
        const resultado: Resultado = {
            verificacao,
            situacao,
            detalhe: resumir(detalhe, LIMITE_DO_DETALHE),
            medidoEm,
        };
        return latenciaMs === undefined ? resultado : { ...resultado, latenciaMs };
    };
    return {
        ok: (detalhe, latenciaMs) => criar("ok", detalhe, latenciaMs),
        falha: (detalhe, latenciaMs) => criar("falha", detalhe, latenciaMs),
    };
}
