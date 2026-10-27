import { NavegadorChromium } from "../adaptadores/navegadorChromium.ts";
import type { Navegador } from "../dominio/portas.ts";
import { verificarRenderizacao } from "../verificacoes/renderizacao.ts";
import { exigir, type Ambiente } from "./ambiente.ts";
import { criarHandler } from "./criarHandler.ts";
import { montarProcessamento } from "./montagem.ts";
import {
    processarResultados,
    type DependenciasDoProcessamento,
    type ResumoDaExecucao,
} from "./processarResultados.ts";

export interface DependenciasRenderizacao extends DependenciasDoProcessamento {
    navegador: Navegador;
    urlSite: string;
}

export async function executarRenderizacao(
    deps: DependenciasRenderizacao,
): Promise<ResumoDaExecucao> {
    const resultado = await verificarRenderizacao(deps, deps.urlSite);
    return processarResultados("renderizacao", [resultado], deps);
}

export function montarRenderizacao(ambiente: Ambiente): DependenciasRenderizacao {
    return {
        ...montarProcessamento(ambiente),
        navegador: new NavegadorChromium({
            emLambda: Boolean(ambiente.AWS_LAMBDA_FUNCTION_NAME),
            caminhoChrome: ambiente.CHROME_PATH,
        }),
        urlSite: exigir(ambiente, "URL_SITE"),
    };
}

export const handler = criarHandler(() => montarRenderizacao(process.env), executarRenderizacao);
