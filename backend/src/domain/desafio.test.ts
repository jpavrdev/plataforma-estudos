import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    normalizarSaida,
    saidaCorreta,
    corrigirDesafio,
    retornoCorreto,
    jsonProfundamenteIgual,
    indiceDoDia,
} from "./desafio.ts";

describe("normalizarSaida", () => {
    test("remove espaços no fim das linhas", () => {
        assert.equal(normalizarSaida("a  \nb\t"), "a\nb");
    });

    test("remove linhas em branco no fim", () => {
        assert.equal(normalizarSaida("42\n\n\n"), "42");
    });

    test("converte quebras de linha do Windows", () => {
        assert.equal(normalizarSaida("a\r\nb\r\n"), "a\nb");
    });

    test("preserva linhas em branco no meio", () => {
        assert.equal(normalizarSaida("a\n\nb\n"), "a\n\nb");
    });
});

describe("saidaCorreta", () => {
    test("iguais após normalizar", () => {
        assert.equal(saidaCorreta("7\n", "7"), true);
    });

    test("diferentes de verdade", () => {
        assert.equal(saidaCorreta("7", "8"), false);
    });

    test("espaços internos contam", () => {
        assert.equal(saidaCorreta("a b", "ab"), false);
    });
});

describe("corrigirDesafio", () => {
    const ok = { stdout: "7", exitCode: 0, timedOut: false };

    test("todos os casos certos aprova", () => {
        const r = corrigirDesafio(["7", "7"], [ok, ok]);
        assert.deepEqual(r, { aprovado: true, acertos: 2, total: 2, casos: [true, true] });
    });

    test("saída errada reprova o caso", () => {
        const r = corrigirDesafio(["7", "9"], [ok, ok]);
        assert.equal(r.aprovado, false);
        assert.equal(r.acertos, 1);
        assert.deepEqual(r.casos, [true, false]);
    });

    test("timeout reprova mesmo com saída certa", () => {
        const r = corrigirDesafio(["7"], [{ ...ok, timedOut: true }]);
        assert.equal(r.aprovado, false);
    });

    test("exit code diferente de zero reprova", () => {
        const r = corrigirDesafio(["7"], [{ ...ok, exitCode: 1 }]);
        assert.equal(r.aprovado, false);
    });

    test("saída faltando reprova", () => {
        const r = corrigirDesafio(["7", "8"], [ok]);
        assert.equal(r.aprovado, false);
        assert.equal(r.acertos, 1);
    });

    test("sem casos não aprova", () => {
        assert.equal(corrigirDesafio([], []).aprovado, false);
    });
});

describe("modo função (JSON)", () => {
    test("igualdade profunda de arrays", () => {
        assert.equal(jsonProfundamenteIgual([0, 1], [0, 1]), true);
        assert.equal(jsonProfundamenteIgual([0, 1], [1, 0]), false);
    });

    test("igualdade profunda de objetos independe da ordem das chaves", () => {
        assert.equal(jsonProfundamenteIgual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
    });

    test("retornoCorreto compara JSON, não texto", () => {
        assert.equal(retornoCorreto("[0, 1]", "[0,1]"), true);
        assert.equal(retornoCorreto("[0,1]", "[1,0]"), false);
        assert.equal(retornoCorreto("3", "3"), true);
    });

    test("corrigir no modo function usa comparação de JSON", () => {
        const ok = { stdout: "[0,1]", exitCode: 0, timedOut: false };
        const r = corrigirDesafio(["[0, 1]"], [ok], "function");
        assert.equal(r.aprovado, true);
    });

    test("retorno errado reprova no modo function", () => {
        const s = { stdout: "[1,0]", exitCode: 0, timedOut: false };
        const r = corrigirDesafio(["[0,1]"], [s], "function");
        assert.equal(r.aprovado, false);
    });
});

describe("indiceDoDia", () => {
    test("é determinístico para a mesma data", () => {
        assert.equal(indiceDoDia("2026-07-02", 30), indiceDoDia("2026-07-02", 30));
    });

    test("fica dentro do intervalo [0, total)", () => {
        for (const d of ["2026-01-01", "2026-07-02", "2025-12-31", "2026-06-15"]) {
            const i = indiceDoDia(d, 30);
            assert.ok(i >= 0 && i < 30, `${d} -> ${i}`);
        }
    });

    test("datas diferentes tendem a dar índices diferentes", () => {
        const dias = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];
        const indices = new Set(dias.map((d) => indiceDoDia(d, 30)));
        assert.ok(indices.size >= 3);
    });

    test("total zero devolve -1", () => {
        assert.equal(indiceDoDia("2026-07-02", 0), -1);
    });
});
