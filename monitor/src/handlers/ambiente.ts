export type Ambiente = Record<string, string | undefined>;

export function exigir(ambiente: Ambiente, nome: string): string {
    const valor = ambiente[nome]?.trim();
    if (!valor) throw new Error(`a variável de ambiente ${nome} não está definida`);
    return valor;
}
