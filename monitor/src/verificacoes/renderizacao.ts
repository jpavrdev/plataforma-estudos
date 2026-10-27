import { descreverErro } from "../dominio/erro.ts";
import { contar, resumir } from "../dominio/formatacao.ts";
import type { Navegador } from "../dominio/portas.ts";
import type { Resultado } from "../dominio/tipos.ts";
import { novaMedicao } from "./medicao.ts";

export const TIMEOUT_DA_RENDERIZACAO_MS = 30_000;

const ERROS_NO_DETALHE = 3;
const LIMITE_POR_ERRO = 120;

export interface PortasRenderizacao {
    navegador: Navegador;
    agora: () => Date;
}

export async function verificarRenderizacao(
    portas: PortasRenderizacao,
    url: string,
): Promise<Resultado> {
    const inicio = portas.agora();
    const medicao = novaMedicao("renderizacao", inicio);
    try {
        const { elementosNoRoot, errosDaPagina } = await portas.navegador.renderizar(
            url,
            TIMEOUT_DA_RENDERIZACAO_MS,
        );
        const latenciaMs = portas.agora().getTime() - inicio.getTime();
        const problemas: string[] = [];
        if (elementosNoRoot === 0) problemas.push("o #root ficou vazio");
        if (errosDaPagina.length > 0) problemas.push(descreverErrosDaPagina(errosDaPagina));
        if (problemas.length > 0) return medicao.falha(problemas.join("; "), latenciaMs);
        const elementos = contar(elementosNoRoot, "elemento", "elementos");
        return medicao.ok(`o #root ganhou ${elementos}, sem erros na página`, latenciaMs);
    } catch (erro) {
        console.error("verificação renderizacao falhou:", descreverErro(erro));
        return medicao.falha(`não foi possível renderizar a página: ${descreverErro(erro)}`);
    }
}

function descreverErrosDaPagina(erros: string[]): string {
    const exemplos = erros
        .slice(0, ERROS_NO_DETALHE)
        .map((erro) => `"${resumir(erro, LIMITE_POR_ERRO)}"`);
    const resto =
        erros.length > ERROS_NO_DETALHE ? ` e mais ${erros.length - ERROS_NO_DETALHE}` : "";
    return `a página registrou ${contar(erros.length, "erro", "erros")}: ${exemplos.join(", ")}${resto}`;
}
