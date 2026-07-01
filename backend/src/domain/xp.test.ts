import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calcularXp, nivelPorXp } from "./xp.ts";

describe("calcularXp", () => {
    test("sem progresso vale 0", () => {
        assert.equal(calcularXp({ aulas: 0, questoes: 0 }), 0);
    });

    test("cada aula concluída vale 50", () => {
        assert.equal(calcularXp({ aulas: 1, questoes: 0 }), 50);
        assert.equal(calcularXp({ aulas: 3, questoes: 0 }), 150);
    });

    test("cada questão certa vale 10", () => {
        assert.equal(calcularXp({ aulas: 0, questoes: 1 }), 10);
        assert.equal(calcularXp({ aulas: 0, questoes: 5 }), 50);
    });

    test("soma aulas e questões", () => {
        assert.equal(calcularXp({ aulas: 2, questoes: 4 }), 140);
    });

    test("aula pesa mais que questão", () => {
        assert.ok(calcularXp({ aulas: 1, questoes: 0 }) > calcularXp({ aulas: 0, questoes: 1 }));
    });
});

describe("nivelPorXp", () => {
    test("nível 1 com 0 de XP", () => {
        assert.equal(nivelPorXp(0), 1);
    });

    test("um pouco antes do limite continua no mesmo nível", () => {
        assert.equal(nivelPorXp(499), 1);
    });

    test("no limite exato sobe de nível", () => {
        assert.equal(nivelPorXp(500), 2);
        assert.equal(nivelPorXp(1000), 3);
    });

    test("nível não decresce quando o XP aumenta", () => {
        let anterior = 1;
        for (let xp = 0; xp <= 3000; xp += 37) {
            const atual = nivelPorXp(xp);
            assert.ok(atual >= anterior);
            anterior = atual;
        }
    });
});
