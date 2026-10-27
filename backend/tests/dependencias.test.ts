import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { startTestServer } from "./helpers/server.ts";
import { UPLOADS_DIR } from "../src/config/paths.ts";

// O env só é lido quando o app sobe (import dinâmico no startTestServer) e cada
// arquivo de teste roda em processo próprio, então ajustar aqui basta.
const TOKEN = "token_do_monitor_de_teste_com_mais_de_32_caracteres";
process.env.MONITOR_TOKEN = TOKEN;
delete process.env.EVOLUTION_URL;

let server: Awaited<ReturnType<typeof startTestServer>>;

async function get(path: string, authorization?: string) {
    const res = await fetch(`${server.base}${path}`, {
        headers: authorization ? { Authorization: authorization } : {},
    });
    return { status: res.status, body: await res.json() };
}

before(async () => {
    // Em produção o volume de uploads sempre existe; num checkout limpo (CI), não.
    await mkdir(UPLOADS_DIR, { recursive: true });
    server = await startTestServer();
});
after(async () => {
    await server.close();
});

describe("GET /health/dependencias", () => {
    test("sem Authorization responde 401", async () => {
        const res = await get("/health/dependencias");
        assert.equal(res.status, 401);
        assert.deepEqual(res.body, { erro: "Não autorizado" });
    });

    test("token errado do mesmo tamanho responde 401", async () => {
        const res = await get("/health/dependencias", `Bearer ${"x".repeat(TOKEN.length)}`);
        assert.equal(res.status, 401);
    });

    test("token de outro tamanho responde 401", async () => {
        const res = await get("/health/dependencias", `Bearer ${TOKEN}x`);
        assert.equal(res.status, 401);
    });

    test("token certo fora do esquema Bearer responde 401", async () => {
        const res = await get("/health/dependencias", `Basic ${TOKEN}`);
        assert.equal(res.status, 401);
    });

    test("token certo responde 200 no formato do contrato", async () => {
        const res = await get("/health/dependencias", `Bearer ${TOKEN}`);
        assert.equal(res.status, 200);

        const { banco, whatsapp, disco } = res.body;
        assert.deepEqual(Object.keys(res.body), ["banco", "whatsapp", "disco"]);
        assert.deepEqual(banco, { situacao: "ok", latenciaMs: banco.latenciaMs });
        assert.ok(Number.isInteger(banco.latenciaMs) && banco.latenciaMs >= 0);
        assert.deepEqual(whatsapp, { situacao: "nao-configurado" });
        assert.deepEqual(disco, { situacao: "ok", usoPercentual: disco.usoPercentual });
        assert.ok(Number.isInteger(disco.usoPercentual));
        assert.ok(disco.usoPercentual >= 0 && disco.usoPercentual <= 100);
    });

    test("/health segue aberto e sem token", async () => {
        const res = await get("/health");
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { status: "ok" });
    });
});
