// Inteiro uniforme em [0, limite). Na produção é o crypto.randomInt; nos testes,
// uma sequência combinada.
export type Aleatorio = (limite: number) => number;

// Fisher-Yates parcial: só embaralha as primeiras posições, as que vão sair.
// Cada item tem a mesma chance em cada posição, e a ordem de saída é a colocação.
export function sortear<T>(itens: readonly T[], quantidade: number, aleatorio: Aleatorio): T[] {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
        throw new RangeError(`Quantidade inválida para sortear: ${quantidade}`);
    }
    const urna = [...itens];
    const total = Math.min(quantidade, urna.length);
    for (let i = 0; i < total; i++) {
        const restantes = urna.length - i;
        const salto = aleatorio(restantes);
        // Fora do intervalo, sairia um item que não existe ou um sorteio viciado, sem erro.
        if (!Number.isInteger(salto) || salto < 0 || salto >= restantes) {
            throw new RangeError(`aleatorio(${restantes}) devolveu ${salto}`);
        }
        const j = i + salto;
        [urna[i], urna[j]] = [urna[j], urna[i]];
    }
    return urna.slice(0, total);
}
