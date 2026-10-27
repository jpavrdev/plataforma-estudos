import { descreverErro } from "../dominio/erro.ts";
import { formatarTamanho } from "../dominio/formatacao.ts";
import type { ArmazenamentoBackup } from "../dominio/portas.ts";
import type { Resultado } from "../dominio/tipos.ts";
import { novaMedicao } from "./medicao.ts";

const PROPORCAO_MINIMA = 0.8;
const MS_POR_DIA = 86_400_000;

export interface PortasBackup {
    armazenamento: ArmazenamentoBackup;
    agora: () => Date;
}

export async function verificarBackup(portas: PortasBackup, prefixo: string): Promise<Resultado> {
    const agora = portas.agora();
    const medicao = novaMedicao("backup", agora);
    const hoje = dataUtc(agora);
    const ontem = dataUtc(new Date(agora.getTime() - MS_POR_DIA));
    const dumpDe = (data: string) => `${prefixo}estudos-${data}.dump`;
    try {
        const tamanho = await portas.armazenamento.tamanhoDe(dumpDe(hoje));
        if (tamanho === null) return medicao.falha(`${dumpDe(hoje)} não chegou ao bucket`);
        if (tamanho === 0) return medicao.falha(`${dumpDe(hoje)} está vazio`);

        const tamanhoAnterior = await portas.armazenamento.tamanhoDe(dumpDe(ontem));
        if (!tamanhoAnterior) {
            return medicao.ok(
                `${dumpDe(hoje)} tem ${formatarTamanho(tamanho)}; não há dump de ${ontem} para comparar`,
            );
        }
        const proporcao = tamanho / tamanhoAnterior;
        const comparacao = `${dumpDe(hoje)} tem ${formatarTamanho(tamanho)}, ${Math.round(proporcao * 100)}% do dump de ${ontem} (${formatarTamanho(tamanhoAnterior)})`;
        return proporcao < PROPORCAO_MINIMA
            ? medicao.falha(`${comparacao}, abaixo dos ${PROPORCAO_MINIMA * 100}% esperados`)
            : medicao.ok(comparacao);
    } catch (erro) {
        console.error("verificação backup falhou:", descreverErro(erro));
        return medicao.falha(`não consegui consultar o bucket: ${descreverErro(erro)}`);
    }
}

function dataUtc(instante: Date): string {
    return instante.toISOString().slice(0, 10);
}
