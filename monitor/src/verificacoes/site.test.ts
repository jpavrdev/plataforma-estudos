import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { capturarConsole } from "../testes/console.ts";
import { ClienteHttpFalso, RelogioFalso } from "../testes/falsos.ts";
import { verificarSite } from "./site.ts";

const URL = "https://ensinadev.com.br/";
const AGORA = "2026-10-23T12:00:00.000Z";
const HTML =
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>';

const portas = (http: ClienteHttpFalso) => ({ http, agora: new RelogioFalso(AGORA).agora });

describe("verificarSite", () => {
    test("200 com o #root é ok, com latência e hora da medição", async () => {
        const http = new ClienteHttpFalso().responder(URL, 200, HTML, 85);
        const resultado = await verificarSite(portas(http), URL);
        assert.deepEqual(resultado, {
            verificacao: "site",
            situacao: "ok",
            detalhe: "respondeu 200 em 85 ms",
            medidoEm: AGORA,
            latenciaMs: 85,
        });
        assert.deepEqual(http.chamadas, [{ url: URL, opcoes: { timeoutMs: 10_000 } }]);
    });

    test("status diferente de 200 é falha", async () => {
        const http = new ClienteHttpFalso().responder(URL, 502, "Bad Gateway", 30);
        const resultado = await verificarSite(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, "respondeu 502 em 30 ms");
        assert.equal(resultado.latenciaMs, 30);
    });

    test("200 sem o #root no HTML é falha", async () => {
        const http = new ClienteHttpFalso().responder(
            URL,
            200,
            "<html><body>manutenção</body></html>",
        );
        const resultado = await verificarSite(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, 'respondeu 200 sem o <div id="root"> no HTML');
    });

    test("tempo esgotado vira falha com o motivo", async (t) => {
        capturarConsole(t);
        const http = new ClienteHttpFalso().falhar(URL, new Error("tempo esgotado após 10000 ms"));
        const resultado = await verificarSite(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, "sem resposta: tempo esgotado após 10000 ms");
        assert.equal(resultado.latenciaMs, undefined);
    });

    test("exceção inesperada vira falha, é logada e não sobe", async (t) => {
        const linhas = capturarConsole(t);
        const http = new ClienteHttpFalso().falhar(URL, new TypeError("leitura de undefined"));
        const resultado = await verificarSite(portas(http), URL);
        assert.equal(resultado.situacao, "falha");
        assert.equal(resultado.detalhe, "sem resposta: TypeError: leitura de undefined");
        assert.ok(linhas.some((linha) => linha.includes("verificação site")));
    });
});
