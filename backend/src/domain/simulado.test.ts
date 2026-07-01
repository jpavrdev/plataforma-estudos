import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { corrigirSimulado, questaoCorreta } from "./simulado.ts";

describe("questaoCorreta", () => {
    test("resposta única certa", () => {
        assert.equal(questaoCorreta(new Set(["a"]), new Set(["a"])), true);
    });

    test("resposta única errada", () => {
        assert.equal(questaoCorreta(new Set(["b"]), new Set(["a"])), false);
    });

    test("múltipla completa acerta", () => {
        assert.equal(questaoCorreta(new Set(["a", "b"]), new Set(["a", "b"])), true);
    });

    test("múltipla parcial não conta", () => {
        assert.equal(questaoCorreta(new Set(["a"]), new Set(["a", "b"])), false);
    });

    test("múltipla com opção a mais não conta", () => {
        assert.equal(questaoCorreta(new Set(["a", "b", "c"]), new Set(["a", "b"])), false);
    });

    test("em branco não conta", () => {
        assert.equal(questaoCorreta(new Set(), new Set(["a"])), false);
    });

    test("questão sem gabarito nunca é correta", () => {
        assert.equal(questaoCorreta(new Set(["a"]), new Set()), false);
    });
});

describe("corrigirSimulado", () => {
    const questoes = [
        { id: "q1", corretas: new Set(["a"]) },
        { id: "q2", corretas: new Set(["a", "b"]) },
        { id: "q3", corretas: new Set(["c"]) },
    ];

    test("tudo certo é 100 e passa", () => {
        const r = corrigirSimulado(
            questoes,
            new Map([
                ["q1", new Set(["a"])],
                ["q2", new Set(["a", "b"])],
                ["q3", new Set(["c"])],
            ]),
            70,
        );
        assert.deepEqual(r, { acertos: 3, total: 3, score: 100, passed: true });
    });

    test("multi parcial reprova a questão", () => {
        const r = corrigirSimulado(
            questoes,
            new Map([
                ["q1", new Set(["a"])],
                ["q2", new Set(["a"])], // faltou b
                ["q3", new Set(["c"])],
            ]),
            70,
        );
        assert.equal(r.acertos, 2);
        assert.equal(r.score, 67);
        assert.equal(r.passed, false);
    });

    test("questões sem resposta contam como erro", () => {
        const r = corrigirSimulado(questoes, new Map(), 70);
        assert.deepEqual(r, { acertos: 0, total: 3, score: 0, passed: false });
    });

    test("corte exato de 70 passa", () => {
        const dez = Array.from({ length: 10 }, (_, i) => ({
            id: `q${i}`,
            corretas: new Set([`o${i}`]),
        }));
        const respostas = new Map(
            dez.slice(0, 7).map((q) => [q.id, new Set([`o${q.id.slice(1)}`])]),
        );
        const r = corrigirSimulado(dez, respostas, 70);
        assert.equal(r.score, 70);
        assert.equal(r.passed, true);
    });

    test("simulado vazio não passa", () => {
        assert.deepEqual(corrigirSimulado([], new Map(), 70), {
            acertos: 0,
            total: 0,
            score: 0,
            passed: false,
        });
    });
});
