import { descreverErro } from "../dominio/erro.ts";
import type { ClienteHttp } from "../dominio/portas.ts";
import type { Resultado } from "../dominio/tipos.ts";
import { novaMedicao } from "./medicao.ts";

const TIMEOUT_MS = 10_000;
const DIV_ROOT = /<div\b[^>]*\bid=["']root["']/i;

export interface PortasSite {
    http: ClienteHttp;
    agora: () => Date;
}

export async function verificarSite(portas: PortasSite, url: string): Promise<Resultado> {
    const medicao = novaMedicao("site", portas.agora());
    try {
        const { status, corpo, latenciaMs } = await portas.http.obter(url, {
            timeoutMs: TIMEOUT_MS,
        });
        if (status !== 200) {
            return medicao.falha(`respondeu ${status} em ${latenciaMs} ms`, latenciaMs);
        }
        if (!DIV_ROOT.test(corpo)) {
            return medicao.falha('respondeu 200 sem o <div id="root"> no HTML', latenciaMs);
        }
        return medicao.ok(`respondeu 200 em ${latenciaMs} ms`, latenciaMs);
    } catch (erro) {
        console.error("verificação site sem resposta:", descreverErro(erro));
        return medicao.falha(`sem resposta: ${descreverErro(erro)}`);
    }
}
