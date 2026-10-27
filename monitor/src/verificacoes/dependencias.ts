import { descreverErro } from "../dominio/erro.ts";
import type { ClienteHttp, FonteDeSegredo } from "../dominio/portas.ts";
import type { Resultado } from "../dominio/tipos.ts";
import { ehObjeto, lerJson } from "./json.ts";
import { novaMedicao } from "./medicao.ts";

export const DEPENDENCIAS = ["banco", "whatsapp", "disco"] as const;
export const LIMITE_DE_USO_DO_DISCO = 85;

const TIMEOUT_MS = 10_000;
const ACESSO_RECUSADO = new Set([401, 404]);
const MUITAS_REQUISICOES = 429;

// Sem resposta, as três mantêm o estado: com a API fora, quem avisa é a verificação api.
export type LeituraDependencias =
    { tipo: "resultados"; resultados: Resultado[] } | { tipo: "sem-resposta"; motivo: string };

export interface PortasDependencias {
    http: ClienteHttp;
    segredo: FonteDeSegredo;
    agora: () => Date;
}

type RespostaHttp = Awaited<ReturnType<ClienteHttp["obter"]>>;

export async function verificarDependencias(
    portas: PortasDependencias,
    url: string,
): Promise<LeituraDependencias> {
    const agora = portas.agora();
    try {
        const token = await portas.segredo.token();
        let resposta: RespostaHttp;
        try {
            resposta = await portas.http.obter(url, {
                cabecalhos: { authorization: `Bearer ${token}` },
                timeoutMs: TIMEOUT_MS,
            });
        } catch (erro) {
            console.warn("endpoint de dependências sem resposta:", descreverErro(erro));
            return { tipo: "sem-resposta", motivo: descreverErro(erro) };
        }
        return interpretar(resposta, agora);
    } catch (erro) {
        console.error("verificação de dependências falhou:", descreverErro(erro));
        return todasEmFalha(
            agora,
            `não consegui consultar as dependências: ${descreverErro(erro)}`,
        );
    }
}

function interpretar(resposta: RespostaHttp, agora: Date): LeituraDependencias {
    // O 429 do limitador da API é passageiro e não diz nada sobre banco, WhatsApp ou disco.
    if (resposta.status >= 500 || resposta.status === MUITAS_REQUISICOES) {
        return { tipo: "sem-resposta", motivo: `o endpoint respondeu ${resposta.status}` };
    }
    if (ACESSO_RECUSADO.has(resposta.status)) {
        const detalhe = `o monitor não tem acesso ao endpoint de dependências (HTTP ${resposta.status}): confira o token no SSM e o MONITOR_TOKEN do .env.prod`;
        console.error(detalhe);
        return todasEmFalha(agora, detalhe);
    }
    if (resposta.status !== 200) {
        return todasEmFalha(agora, `o endpoint de dependências respondeu ${resposta.status}`);
    }
    const corpo = lerJson(resposta.corpo);
    if (!ehObjeto(corpo)) {
        return todasEmFalha(agora, "o endpoint de dependências respondeu um corpo inesperado");
    }
    return {
        tipo: "resultados",
        resultados: [
            lerBanco(corpo.banco, agora),
            lerWhatsapp(corpo.whatsapp, agora),
            lerDisco(corpo.disco, agora),
        ],
    };
}

function lerBanco(campo: unknown, agora: Date): Resultado {
    const medicao = novaMedicao("banco", agora);
    if (!ehObjeto(campo) || typeof campo.situacao !== "string") {
        return medicao.falha("campo banco ausente ou inválido na resposta");
    }
    if (campo.situacao !== "ok") return medicao.falha("a API não alcançou o banco");
    const latenciaMs = typeof campo.latenciaMs === "number" ? campo.latenciaMs : undefined;
    const tempo = latenciaMs === undefined ? "" : ` em ${latenciaMs} ms`;
    return medicao.ok(`a API alcançou o banco${tempo}`, latenciaMs);
}

function lerWhatsapp(campo: unknown, agora: Date): Resultado {
    const medicao = novaMedicao("whatsapp", agora);
    if (!ehObjeto(campo) || typeof campo.situacao !== "string") {
        return medicao.falha("campo whatsapp ausente ou inválido na resposta");
    }
    if (campo.situacao === "nao-configurado") {
        return medicao.falha(
            "a API está sem a Evolution configurada: confira EVOLUTION_URL e EVOLUTION_API_KEY no .env.prod",
        );
    }
    const conexao = typeof campo.estado === "string" ? campo.estado : undefined;
    if (campo.situacao === "ok" && conexao === "open") return medicao.ok("conexão open");
    if (conexao === undefined) return medicao.falha("a API não conseguiu consultar a Evolution");
    return medicao.falha(`conexão ${conexao} na Evolution`);
}

function lerDisco(campo: unknown, agora: Date): Resultado {
    const medicao = novaMedicao("disco", agora);
    if (!ehObjeto(campo) || typeof campo.situacao !== "string") {
        return medicao.falha("campo disco ausente ou inválido na resposta");
    }
    if (campo.situacao !== "ok") return medicao.falha("a API não conseguiu medir o disco");
    if (typeof campo.usoPercentual !== "number") {
        return medicao.falha("campo disco sem usoPercentual na resposta");
    }
    const uso = `${campo.usoPercentual}% de uso`;
    return campo.usoPercentual < LIMITE_DE_USO_DO_DISCO
        ? medicao.ok(uso)
        : medicao.falha(`${uso}, o limite é ${LIMITE_DE_USO_DO_DISCO}%`);
}

function todasEmFalha(agora: Date, detalhe: string): LeituraDependencias {
    return {
        tipo: "resultados",
        resultados: DEPENDENCIAS.map((nome) => novaMedicao(nome, agora).falha(detalhe)),
    };
}
