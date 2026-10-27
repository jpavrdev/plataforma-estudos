import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatarDuracao, formatarInstante, formatarTamanho, resumir } from "./formatacao.ts";

describe("formatarInstante", () => {
    test("mostra no horário de Brasília", () => {
        assert.equal(
            formatarInstante("2026-10-23T12:05:00.000Z"),
            "23/10/2026 09:05 (horário de Brasília)",
        );
    });

    test("vira o dia e o ano quando ainda é véspera em Brasília", () => {
        assert.equal(
            formatarInstante("2026-01-01T02:30:00.000Z"),
            "31/12/2025 23:30 (horário de Brasília)",
        );
    });

    test("devolve o texto como veio se não for uma data", () => {
        assert.equal(formatarInstante("ontem"), "ontem");
    });
});

describe("formatarDuracao", () => {
    test("arredonda para baixo em minutos, horas e dias", () => {
        assert.equal(formatarDuracao(30_000), "menos de 1 min");
        assert.equal(formatarDuracao(14 * 60_000 + 59_000), "14 min");
        assert.equal(formatarDuracao(6 * 3_600_000), "6 h");
        assert.equal(formatarDuracao(6 * 3_600_000 + 2 * 60_000), "6 h e 2 min");
        assert.equal(formatarDuracao(24 * 3_600_000), "1 dia");
        assert.equal(formatarDuracao(51 * 3_600_000), "2 dias e 3 h");
    });

    test("trata duração negativa como zero", () => {
        assert.equal(formatarDuracao(-5_000), "menos de 1 min");
    });
});

describe("formatarTamanho", () => {
    test("escolhe a unidade e usa vírgula decimal", () => {
        assert.equal(formatarTamanho(512), "512 B");
        assert.equal(formatarTamanho(1536), "1,5 KB");
        assert.equal(formatarTamanho(120 * 1024 ** 2), "120,0 MB");
        assert.equal(formatarTamanho(2.25 * 1024 ** 3), "2,3 GB");
    });
});

describe("resumir", () => {
    test("junta as linhas e corta no limite", () => {
        assert.equal(resumir("  erro\n   na  linha  ", 50), "erro na linha");
        assert.equal(resumir("a".repeat(20), 10), "aaaaaaa...");
    });
});
