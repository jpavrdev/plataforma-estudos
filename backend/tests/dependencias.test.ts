import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { startTestServer } from "./helpers/server.ts";
import { UPLOADS_DIR } from "../src/config/paths.ts";

// Env is only read when the app boots (dynamic import inside startTestServer) and
// each test file runs in its own process, so adjusting it here is enough.
const TOKEN = "token_do_monitor_de_teste_com_mais_de_32_caracteres";
process.env.MONITOR_TOKEN = TOKEN;
delete process.env.EVOLUTION_URL;

let server: Awaited<ReturnType<typeof startTestServer>>;

// Fake labs service: the app reaches it through LABS_URL, just like the real one.
let labsStatus = 200;
const fakeLabs = createServer((req, res) => {
    const isHealth = req.url === "/health";
    res.writeHead(isHealth ? labsStatus : 404, { "content-type": "application/json" });
    const status = labsStatus === 200 ? "ok" : "falha";
    res.end(isHealth ? JSON.stringify({ status, sessoes: 0, max: 6 }) : "");
});

async function get(path: string, authorization?: string) {
    const res = await fetch(`${server.base}${path}`, {
        headers: authorization ? { Authorization: authorization } : {},
    });
    return { status: res.status, body: await res.json() };
}

before(async () => {
    // In production the uploads volume always exists; on a clean checkout (CI) it does not.
    await mkdir(UPLOADS_DIR, { recursive: true });
    await new Promise<void>((resolve) => fakeLabs.listen(0, "127.0.0.1", resolve));
    process.env.LABS_URL = `ws://127.0.0.1:${(fakeLabs.address() as AddressInfo).port}`;
    server = await startTestServer();
});
after(async () => {
    await server.close();
    fakeLabs.close();
});

describe("GET /health/dependencias", () => {
    test("without Authorization answers 401", async () => {
        const res = await get("/health/dependencias");
        assert.equal(res.status, 401);
        assert.deepEqual(res.body, { erro: "Não autorizado" });
    });

    test("wrong token of the same length answers 401", async () => {
        const res = await get("/health/dependencias", `Bearer ${"x".repeat(TOKEN.length)}`);
        assert.equal(res.status, 401);
    });

    test("token of another length answers 401", async () => {
        const res = await get("/health/dependencias", `Bearer ${TOKEN}x`);
        assert.equal(res.status, 401);
    });

    test("right token outside the Bearer scheme answers 401", async () => {
        const res = await get("/health/dependencias", `Basic ${TOKEN}`);
        assert.equal(res.status, 401);
    });

    test("right token answers 200 in the contract format", async () => {
        const res = await get("/health/dependencias", `Bearer ${TOKEN}`);
        assert.equal(res.status, 200);

        const { banco, whatsapp, disco, labs } = res.body;
        assert.deepEqual(Object.keys(res.body), ["banco", "whatsapp", "disco", "labs"]);
        assert.deepEqual(banco, { situacao: "ok", latenciaMs: banco.latenciaMs });
        assert.ok(Number.isInteger(banco.latenciaMs) && banco.latenciaMs >= 0);
        assert.deepEqual(whatsapp, { situacao: "nao-configurado" });
        assert.deepEqual(disco, { situacao: "ok", usoPercentual: disco.usoPercentual });
        assert.ok(Number.isInteger(disco.usoPercentual));
        assert.ok(disco.usoPercentual >= 0 && disco.usoPercentual <= 100);
        assert.deepEqual(labs, { situacao: "ok", sessoes: 0, max: 6 });
    });

    test("labs down becomes falha and the endpoint still answers 200", async (t) => {
        t.mock.method(console, "error", () => {});
        labsStatus = 503;
        t.after(() => {
            labsStatus = 200;
        });
        const res = await get("/health/dependencias", `Bearer ${TOKEN}`);
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.labs, { situacao: "falha" });
        assert.equal(res.body.banco.situacao, "ok");
    });

    test("/health stays open and tokenless", async () => {
        const res = await get("/health");
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { status: "ok" });
    });
});
