import assert from "node:assert/strict";
import type { IncomingHttpHeaders } from "node:http";
import { afterEach, describe, test } from "node:test";
import { capturarConsole } from "../testes/console.ts";
import { subirServidorLocal, type ServidorLocal } from "../testes/servidorLocal.ts";
import { ClienteHttpFetch } from "./clienteHttp.ts";

describe("ClienteHttpFetch contra um servidor local", () => {
    let servidor: ServidorLocal | undefined;

    afterEach(async () => {
        await servidor?.fechar();
        servidor = undefined;
    });

    test("devolve status, corpo e latência e manda os cabeçalhos pedidos", async () => {
        let recebidos: IncomingHttpHeaders = {};
        servidor = await subirServidorLocal((requisicao, resposta) => {
            recebidos = requisicao.headers;
            resposta.end('{"status":"ok"}');
        });
        const resposta = await new ClienteHttpFetch().obter(`${servidor.url}/api/health`, {
            cabecalhos: { authorization: "Bearer abc" },
        });
        assert.equal(resposta.status, 200);
        assert.equal(resposta.corpo, '{"status":"ok"}');
        assert.ok(Number.isInteger(resposta.latenciaMs) && resposta.latenciaMs >= 0);
        assert.equal(recebidos.authorization, "Bearer abc");
        assert.equal(recebidos["user-agent"], "ensinadev-monitor/1.0");
    });

    test("status de erro volta como resposta, sem exceção", async () => {
        servidor = await subirServidorLocal((_requisicao, resposta) => {
            resposta.statusCode = 502;
            resposta.end("Bad Gateway");
        });
        const resposta = await new ClienteHttpFetch().obter(servidor.url);
        assert.equal(resposta.status, 502);
        assert.equal(resposta.corpo, "Bad Gateway");
    });

    test("servidor que não responde estoura o timeout", async (t) => {
        capturarConsole(t);
        servidor = await subirServidorLocal(() => undefined);
        await assert.rejects(new ClienteHttpFetch().obter(servidor.url, { timeoutMs: 200 }), {
            message: "tempo esgotado após 200 ms",
        });
    });

    test("o timeout também vale para um corpo que não termina", async (t) => {
        capturarConsole(t);
        servidor = await subirServidorLocal((_requisicao, resposta) => {
            resposta.writeHead(200, { "content-type": "text/html" });
            resposta.write("<html>");
        });
        await assert.rejects(new ClienteHttpFetch().obter(servidor.url, { timeoutMs: 200 }), {
            message: "tempo esgotado após 200 ms",
        });
    });

    test("conexão recusada vira falha de rede", async (t) => {
        capturarConsole(t);
        const desligado = await subirServidorLocal(() => undefined);
        await desligado.fechar();
        await assert.rejects(
            new ClienteHttpFetch().obter(desligado.url, { timeoutMs: 2_000 }),
            /^Error: falha de rede: .*ECONNREFUSED/,
        );
    });
});
