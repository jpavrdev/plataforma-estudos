import type { ResumoDaExecucao } from "./processarResultados.ts";

export function criarHandler<Dependencias>(
    montar: () => Dependencias,
    executar: (dependencias: Dependencias) => Promise<ResumoDaExecucao>,
): () => Promise<ResumoDaExecucao> {
    let dependencias: Dependencias | undefined;
    return async () => {
        dependencias ??= montar();
        const resumo = await executar(dependencias);
        // O erro da função aciona o alarme do CloudWatch, que avisa por fora quando o monitor falha.
        if (resumo.problemas.length > 0) {
            throw new Error(
                `a execução ${resumo.funcao} terminou com problemas: ${resumo.problemas.join("; ")}`,
            );
        }
        return resumo;
    };
}
