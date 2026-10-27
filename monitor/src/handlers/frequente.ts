import { SSMClient } from "@aws-sdk/client-ssm";
import { ClienteHttpFetch } from "../adaptadores/clienteHttp.ts";
import { SegredoSsm } from "../adaptadores/segredoSsm.ts";
import type { ClienteHttp, FonteDeSegredo } from "../dominio/portas.ts";
import { verificarApi } from "../verificacoes/api.ts";
import { DEPENDENCIAS, verificarDependencias } from "../verificacoes/dependencias.ts";
import { verificarSite } from "../verificacoes/site.ts";
import { exigir, type Ambiente } from "./ambiente.ts";
import { criarHandler } from "./criarHandler.ts";
import { montarProcessamento } from "./montagem.ts";
import {
    processarResultados,
    type DependenciasDoProcessamento,
    type ResumoDaExecucao,
} from "./processarResultados.ts";

export interface DependenciasFrequente extends DependenciasDoProcessamento {
    http: ClienteHttp;
    segredo: FonteDeSegredo;
    urls: { site: string; api: string; dependencias: string };
}

export async function executarFrequente(deps: DependenciasFrequente): Promise<ResumoDaExecucao> {
    const [site, api, dependencias] = await Promise.all([
        verificarSite(deps, deps.urls.site),
        verificarApi(deps, deps.urls.api),
        verificarDependencias(deps, deps.urls.dependencias),
    ]);
    if (dependencias.tipo === "sem-resposta") {
        return processarResultados("frequente", [site, api], deps, {
            verificacoes: DEPENDENCIAS,
            motivo: dependencias.motivo,
        });
    }
    return processarResultados("frequente", [site, api, ...dependencias.resultados], deps);
}

export function montarFrequente(ambiente: Ambiente): DependenciasFrequente {
    return {
        ...montarProcessamento(ambiente),
        http: new ClienteHttpFetch(),
        segredo: new SegredoSsm(new SSMClient({}), exigir(ambiente, "PARAMETRO_TOKEN")),
        urls: {
            site: exigir(ambiente, "URL_SITE"),
            api: exigir(ambiente, "URL_API"),
            dependencias: exigir(ambiente, "URL_DEPENDENCIAS"),
        },
    };
}

export const handler = criarHandler(() => montarFrequente(process.env), executarFrequente);
