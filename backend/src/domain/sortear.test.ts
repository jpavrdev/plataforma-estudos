import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { sortear } from "./sortear.ts";

// Devolve os valores combinados, na ordem, e guarda os limites pedidos.
function roteiro(valores: number[]) {
    const limites: number[] = [];
    const aleatorio = (limite: number) => {
        limites.push(limite);
        const valor = valores.shift();
        if (valor === undefined) throw new Error("roteiro acabou");
        return valor;
    };
    return { aleatorio, limites };
}

const ITENS = ["ana", "bia", "caio", "davi", "eva"];

describe("sortear", () => {
    test("a ordem de saída segue o gerador e é a colocação", () => {
        const { aleatorio, limites } = roteiro([2, 0, 1]);
        assert.deepEqual(sortear(ITENS, 3, aleatorio), ["caio", "bia", "davi"]);
        assert.deepEqual(limites, [5, 4, 3]);
    });

    test("gerador sempre no zero tira os primeiros, em ordem", () => {
        assert.deepEqual(
            sortear(ITENS, 3, () => 0),
            ["ana", "bia", "caio"],
        );
    });

    test("gerador sempre no máximo tira do fim da urna", () => {
        assert.deepEqual(
            sortear(ITENS, 3, (limite) => limite - 1),
            ["eva", "ana", "bia"],
        );
    });

    test("nunca repete item", () => {
        for (let semente = 0; semente < 200; semente++) {
            let estado = semente;
            const aleatorio = (limite: number) => {
                estado = (estado * 75 + 74) % 65537;
                return estado % limite;
            };
            const ganhadores = sortear(ITENS, 3, aleatorio);
            assert.equal(new Set(ganhadores).size, 3);
        }
    });

    test("cada resultado sai de exatamente uma combinação do gerador", () => {
        const itens = ["a", "b", "c", "d"];
        const resultados = new Set<string>();
        for (let primeiro = 0; primeiro < 4; primeiro++) {
            for (let segundo = 0; segundo < 3; segundo++) {
                const { aleatorio } = roteiro([primeiro, segundo]);
                resultados.add(sortear(itens, 2, aleatorio).join(""));
            }
        }
        // 12 combinações do gerador e 12 pares ordenados possíveis: sem viés.
        assert.equal(resultados.size, 12);
    });

    test("quantidade maior que a lista sorteia todos", () => {
        const { aleatorio, limites } = roteiro([1, 0]);
        assert.deepEqual(sortear(["x", "y"], 3, aleatorio), ["y", "x"]);
        assert.deepEqual(limites, [2, 1]);
    });

    test("lista vazia e quantidade zero não chamam o gerador", () => {
        const { aleatorio, limites } = roteiro([]);
        assert.deepEqual(sortear([], 3, aleatorio), []);
        assert.deepEqual(sortear(ITENS, 0, aleatorio), []);
        assert.deepEqual(limites, []);
    });

    test("não muta a lista recebida", () => {
        const itens = [...ITENS];
        sortear(itens, 3, (limite) => limite - 1);
        assert.deepEqual(itens, ITENS);
    });

    test("recusa gerador fora do intervalo", () => {
        assert.throws(() => sortear(ITENS, 1, (limite) => limite), RangeError);
        assert.throws(() => sortear(ITENS, 1, () => -1), RangeError);
        assert.throws(() => sortear(ITENS, 1, () => 0.5), RangeError);
    });

    test("recusa quantidade negativa ou fracionária", () => {
        assert.throws(() => sortear(ITENS, -1, () => 0), RangeError);
        assert.throws(() => sortear(ITENS, 1.5, () => 0), RangeError);
    });
});
