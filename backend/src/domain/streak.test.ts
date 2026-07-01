import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calcularStreak, semanaAtividade, diaAnterior } from "./streak.ts";

const HOJE = "2026-07-01";

describe("calcularStreak", () => {
    test("sem dias ativos é 0", () => {
        assert.equal(calcularStreak(new Set(), HOJE), 0);
    });

    test("só hoje conta 1", () => {
        assert.equal(calcularStreak(new Set([HOJE]), HOJE), 1);
    });

    test("só ontem (sem hoje) ainda conta 1", () => {
        assert.equal(calcularStreak(new Set(["2026-06-30"]), HOJE), 1);
    });

    test("hoje e ontem contam 2", () => {
        assert.equal(calcularStreak(new Set(["2026-07-01", "2026-06-30"]), HOJE), 2);
    });

    test("sem hoje nem ontem é 0", () => {
        assert.equal(calcularStreak(new Set(["2026-06-28"]), HOJE), 0);
    });

    test("buraco quebra a contagem", () => {
        // hoje ativo, ontem não, anteontem ativo: só hoje conta
        assert.equal(calcularStreak(new Set(["2026-07-01", "2026-06-29"]), HOJE), 1);
    });

    test("atravessa a virada de mês", () => {
        assert.equal(calcularStreak(new Set(["2026-07-01", "2026-06-30", "2026-06-29"]), HOJE), 3);
    });

    test("atravessa a virada de ano", () => {
        assert.equal(
            calcularStreak(new Set(["2026-01-01", "2025-12-31", "2025-12-30"]), "2026-01-01"),
            3,
        );
    });

    test("dia no futuro é ignorado", () => {
        assert.equal(calcularStreak(new Set(["2026-07-02", "2026-07-01"]), HOJE), 1);
    });
});

describe("diaAnterior", () => {
    test("dia comum", () => {
        assert.equal(diaAnterior("2026-07-01"), "2026-06-30");
    });

    test("virada de ano", () => {
        assert.equal(diaAnterior("2026-01-01"), "2025-12-31");
    });

    test("fevereiro em ano não bissexto", () => {
        assert.equal(diaAnterior("2026-03-01"), "2026-02-28");
    });

    test("fevereiro em ano bissexto", () => {
        assert.equal(diaAnterior("2024-03-01"), "2024-02-29");
    });
});

describe("semanaAtividade", () => {
    test("retorna 7 dias terminando em hoje", () => {
        const semana = semanaAtividade(new Set([HOJE]), HOJE);
        assert.equal(semana.length, 7);
        assert.equal(semana[6].active, true); // último é hoje
    });

    test("marca ativos só nos dias da janela", () => {
        const semana = semanaAtividade(new Set(["2026-07-01", "2026-06-29", "2026-05-01"]), HOJE);
        // 07-01 e 06-29 caem nos últimos 7 dias; 05-01 não
        assert.equal(semana.filter((d) => d.active).length, 2);
    });

    test("labels são iniciais de dia da semana", () => {
        const semana = semanaAtividade(new Set(), HOJE);
        assert.ok(semana.every((d) => "DSTQ".includes(d.label)));
    });
});
