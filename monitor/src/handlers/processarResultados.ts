import { descreverErro } from "../dominio/erro.ts";
import { avaliar, POLITICAS } from "../dominio/politica.ts";
import type { Notificador, RepositorioEstado } from "../dominio/portas.ts";
import type { Alerta, EstadoVerificacao, Resultado, Situacao } from "../dominio/tipos.ts";

export interface DependenciasDoProcessamento {
    repositorio: RepositorioEstado;
    notificador: Notificador;
    agora: () => Date;
}

export interface SemLeitura {
    verificacoes: readonly string[];
    motivo: string;
}

export interface ResumoDaVerificacao {
    verificacao: string;
    situacao: Situacao;
    detalhe: string;
    latenciaMs?: number;
    falhasSeguidas?: number;
    alerta?: Alerta["tipo"];
    problema?: string;
}

export interface ResumoDaExecucao {
    funcao: string;
    verificacoes: ResumoDaVerificacao[];
    semLeitura?: SemLeitura;
    problemas: string[];
}

export async function processarResultados(
    funcao: string,
    resultados: Resultado[],
    deps: DependenciasDoProcessamento,
    semLeitura?: SemLeitura,
): Promise<ResumoDaExecucao> {
    const anteriores = await deps.repositorio.ler(resultados.map((r) => r.verificacao));
    const agora = deps.agora();
    const verificacoes: ResumoDaVerificacao[] = [];
    for (const resultado of resultados) {
        const anterior = anteriores.get(resultado.verificacao);
        verificacoes.push(await processar(resultado, anterior, agora, deps));
    }
    const problemas = verificacoes.flatMap((linha) =>
        linha.problema ? [`${linha.verificacao}: ${linha.problema}`] : [],
    );
    const resumo: ResumoDaExecucao = semLeitura
        ? { funcao, verificacoes, semLeitura, problemas }
        : { funcao, verificacoes, problemas };
    console.log(JSON.stringify({ evento: "resumo", ...resumo }));
    return resumo;
}

async function processar(
    resultado: Resultado,
    anterior: EstadoVerificacao | undefined,
    agora: Date,
    deps: DependenciasDoProcessamento,
): Promise<ResumoDaVerificacao> {
    const linha = linhaDoResumo(resultado);
    let etapa = "avaliação";
    try {
        const politica = POLITICAS[resultado.verificacao];
        if (!politica) throw new Error(`não há política para ${resultado.verificacao}`);
        const { estado, alerta } = avaliar(anterior, resultado, politica, agora);
        linha.falhasSeguidas = estado.falhasSeguidas;
        if (alerta) {
            etapa = `envio do alerta de ${alerta.tipo}`;
            linha.alerta = alerta.tipo;
            await deps.notificador.enviar(alerta);
        }
        // Se o envio falhar, o estado não é gravado: a próxima execução reavalia e tenta de novo.
        etapa = "gravação do estado";
        await deps.repositorio.salvar(estado);
    } catch (erro) {
        linha.problema = `${etapa} falhou: ${descreverErro(erro)}`;
        console.error(`verificação ${resultado.verificacao}: ${linha.problema}`);
    }
    return linha;
}

function linhaDoResumo(resultado: Resultado): ResumoDaVerificacao {
    const { verificacao, situacao, detalhe, latenciaMs } = resultado;
    return latenciaMs === undefined
        ? { verificacao, situacao, detalhe }
        : { verificacao, situacao, detalhe, latenciaMs };
}
