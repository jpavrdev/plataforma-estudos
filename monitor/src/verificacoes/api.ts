import { descreverErro } from "../dominio/erro.ts";
import type { ClienteHttp } from "../dominio/portas.ts";
import type { Resultado } from "../dominio/tipos.ts";
import { ehObjeto, lerJson } from "./json.ts";
import { novaMedicao } from "./medicao.ts";

const TIMEOUT_MS = 10_000;

export interface PortasApi {
    http: ClienteHttp;
    agora: () => Date;
}

export async function verificarApi(portas: PortasApi, url: string): Promise<Resultado> {
    const medicao = novaMedicao("api", portas.agora());
    try {
        const { status, corpo, latenciaMs } = await portas.http.obter(url, {
            timeoutMs: TIMEOUT_MS,
        });
        if (status !== 200) {
            return medicao.falha(`respondeu ${status} em ${latenciaMs} ms`, latenciaMs);
        }
        const json = lerJson(corpo);
        if (!ehObjeto(json) || json.status !== "ok") {
            return medicao.falha('respondeu 200 sem {"status":"ok"} no corpo', latenciaMs);
        }
        return medicao.ok(`respondeu {"status":"ok"} em ${latenciaMs} ms`, latenciaMs);
    } catch (erro) {
        console.error("verificação api sem resposta:", descreverErro(erro));
        return medicao.falha(`sem resposta: ${descreverErro(erro)}`);
    }
}
