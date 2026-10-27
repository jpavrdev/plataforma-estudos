import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { capturarConsole } from "../testes/console.ts";
import { ClienteHttpFalso, RelogioFalso } from "../testes/falsos.ts";
import { verificarApi } from "./api.ts";

const URL = "https://ensinadev.com.br/api/health";
const AGORA = "2026-10-23T12:00:00.000Z";

const portas = (http: ClienteHttpFalso) => ({ http, agora: new RelogioFalso(AGORA).agora });

describe("verificarApi", () => {
    test('200 com {"status":"ok"} é ok', async () => {
        const http = new ClienteHttpFalso().responder(URL, 200, '{"status":"ok"}', 22);
        const resultado = await verificarApi(portas(http), URL);
        assert.deepEqual(resultado, {
            verificacao: "api",
            situacao: "ok",
            detalhe: 'respondeu {"status":"ok"} em 22 ms',
            medidoEm: AGORA,
            latenciaMs: 22,
        });
        assert.deepEqual(http.chamadas, [{ url: URL, opcoes: { timeoutMs: 10_000 } }]);
    });

    test("status diferente de 200 é falha", async () => {
        const http = new ClienteHttpFalso().responder(URL, 503, "", 5);
        const resultado = await verificarApi(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, "respondeu 503 em 5 ms");
    });

    test("corpo que não é JSON é falha", async (t) => {
        capturarConsole(t);
        const http = new ClienteHttpFalso().responder(URL, 200, "<html>ok</html>");
        const resultado = await verificarApi(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, 'respondeu 200 sem {"status":"ok"} no corpo');
    });

    test("JSON com outro status é falha", async () => {
        const http = new ClienteHttpFalso().responder(URL, 200, '{"status":"degradado"}');
        const resultado = await verificarApi(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, 'respondeu 200 sem {"status":"ok"} no corpo');
    });

    test("tempo esgotado vira falha com o motivo", async (t) => {
        capturarConsole(t);
        const http = new ClienteHttpFalso().falhar(URL, new Error("tempo esgotado após 10000 ms"));
        const resultado = await verificarApi(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, "sem resposta: tempo esgotado após 10000 ms");
    });

    test("exceção inesperada vira falha e não sobe", async (t) => {
        capturarConsole(t);
        const http = new ClienteHttpFalso().falhar(URL, new RangeError("estouro"));
        const resultado = await verificarApi(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, "sem resposta: RangeError: estouro");
    });
});
