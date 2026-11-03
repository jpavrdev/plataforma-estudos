import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { gzipSync } from "node:zlib";
import { startTestServer } from "./helpers/server.ts";

// GHSA-27r3-jxmh-p828: no body-parser 2.3, um gzip válido seguido de bytes extras
// deixava o descompressor solto, e o erro dele derrubava o processo inteiro.
let server: Awaited<ReturnType<typeof startTestServer>>;

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});

// Formato descrito no aviso: um frame comprimido válido e, depois, bytes extras.
function postEmDuasPartes(path: string, gzip: Buffer, sobra: Buffer): Promise<number> {
    const url = new URL(path, server.base);
    return new Promise((resolve, reject) => {
        const req = http.request(
            {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: "POST",
                headers: { "Content-Type": "application/json", "Content-Encoding": "gzip" },
            },
            (res) => {
                res.resume();
                resolve(res.statusCode ?? 0);
            },
        );
        // Depois da resposta o servidor pode fechar a conexão antes da sobra.
        req.on("error", (e) => (req.writableEnded ? undefined : reject(e)));
        req.write(gzip);
        setTimeout(() => req.end(sobra), 100);
    });
}

function postComprimido(path: string, corpo: Buffer) {
    return fetch(`${server.base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Encoding": "gzip" },
        body: new Uint8Array(corpo),
    });
}

describe("corpo comprimido", () => {
    test("gzip seguido de bytes extras recebe 415 e o processo segue de pé", async () => {
        const status = await postEmDuasPartes(
            "/login",
            gzipSync(JSON.stringify({ email: "aluno@example.com" })),
            Buffer.from("bytes extras"),
        );
        assert.equal(status, 415);
        // Quando existia, o erro do descompressor saía depois da resposta.
        await new Promise((resolve) => setTimeout(resolve, 300));
        const saude = await fetch(`${server.base}/health`);
        assert.equal(saude.status, 200);
    });

    test("gzip válido também é recusado: o front nunca envia corpo comprimido", async () => {
        const corpo = gzipSync(JSON.stringify({ email: "aluno@example.com", password: "x" }));
        const res = await postComprimido("/login", corpo);
        assert.equal(res.status, 415);
    });

    test("JSON comum segue funcionando", async () => {
        const res = await fetch(`${server.base}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "ninguem@example.com", password: "Senha#forte1" }),
        });
        assert.notEqual(res.status, 415);
        assert.ok(res.status < 500);
    });
});
