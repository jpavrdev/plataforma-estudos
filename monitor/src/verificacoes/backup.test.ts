import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { capturarConsole } from "../testes/console.ts";
import { ArmazenamentoFalso, RelogioFalso } from "../testes/falsos.ts";
import { verificarBackup } from "./backup.ts";

const MB = 1024 ** 2;
const HOJE = "postgres/estudos-2026-10-23.dump";
const ONTEM = "postgres/estudos-2026-10-22.dump";

function portas(armazenamento: ArmazenamentoFalso, agora = "2026-10-23T07:00:00.000Z") {
    return { armazenamento, agora: new RelogioFalso(agora).agora };
}

describe("verificarBackup", () => {
    test("dump de hoje parecido com o de ontem é ok", async () => {
        const armazenamento = new ArmazenamentoFalso({ [HOJE]: 100 * MB, [ONTEM]: 110 * MB });
        const resultado = await verificarBackup(portas(armazenamento), "postgres/");
        assert.equal(resultado.verificacao, "backup");
        assert.equal(resultado.situacao, "ok");
        assert.equal(
            resultado.detalhe,
            `${HOJE} tem 100,0 MB, 91% do dump de 2026-10-22 (110,0 MB)`,
        );
        assert.deepEqual(armazenamento.consultas, [HOJE, ONTEM]);
    });

    test("usa a data UTC, não a de Brasília", async () => {
        const armazenamento = new ArmazenamentoFalso();
        await verificarBackup(portas(armazenamento, "2026-10-24T01:30:00.000Z"), "postgres/");
        assert.deepEqual(armazenamento.consultas, ["postgres/estudos-2026-10-24.dump"]);
    });

    test("o dia anterior atravessa a virada do ano", async () => {
        const armazenamento = new ArmazenamentoFalso({ "postgres/estudos-2026-01-01.dump": MB });
        await verificarBackup(portas(armazenamento, "2026-01-01T07:00:00.000Z"), "postgres/");
        assert.deepEqual(armazenamento.consultas, [
            "postgres/estudos-2026-01-01.dump",
            "postgres/estudos-2025-12-31.dump",
        ]);
    });

    test("dump de hoje ausente é falha", async () => {
        const armazenamento = new ArmazenamentoFalso({ [ONTEM]: 100 * MB });
        const resultado = await verificarBackup(portas(armazenamento), "postgres/");
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, `${HOJE} não chegou ao bucket`);
    });

    test("menos de 80% do dia anterior é falha, exatamente 80% passa", async () => {
        const menor = await verificarBackup(
            portas(new ArmazenamentoFalso({ [HOJE]: 79 * MB, [ONTEM]: 100 * MB })),
            "postgres/",
        );
        assert.equal(menor.situacao, "falha");
        assert.equal(
            menor.detalhe,
            `${HOJE} tem 79,0 MB, 79% do dump de 2026-10-22 (100,0 MB), abaixo dos 80% esperados`,
        );
        const noLimite = await verificarBackup(
            portas(new ArmazenamentoFalso({ [HOJE]: 80 * MB, [ONTEM]: 100 * MB })),
            "postgres/",
        );
        assert.equal(noLimite.situacao, "ok");
    });

    test("sem o dump de ontem para comparar basta o de hoje existir", async () => {
        const resultado = await verificarBackup(
            portas(new ArmazenamentoFalso({ [HOJE]: 100 * MB })),
            "postgres/",
        );
        assert.equal(resultado.situacao, "ok");
        assert.equal(
            resultado.detalhe,
            `${HOJE} tem 100,0 MB; não há dump de 2026-10-22 para comparar`,
        );
    });

    test("dump vazio é falha", async () => {
        const resultado = await verificarBackup(
            portas(new ArmazenamentoFalso({ [HOJE]: 0, [ONTEM]: 100 * MB })),
            "postgres/",
        );
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, `${HOJE} está vazio`);
    });

    test("erro do S3 vira falha com o motivo e não sobe", async (t) => {
        capturarConsole(t);
        const negado = new Error("Access Denied");
        negado.name = "AccessDenied";
        const armazenamento = new ArmazenamentoFalso();
        armazenamento.erro = negado;
        const resultado = await verificarBackup(portas(armazenamento), "postgres/");
        assert.equal(resultado.situacao, "falha");
        assert.equal(
            resultado.detalhe,
            "não consegui consultar o bucket: AccessDenied: Access Denied",
        );
    });
});
