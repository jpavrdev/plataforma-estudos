import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";

// O env só é lido quando o app sobe e cada arquivo de teste roda em processo
// próprio; remover aqui garante o cenário mesmo com o token exportado no shell.
delete process.env.MONITOR_TOKEN;

let server: Awaited<ReturnType<typeof startTestServer>>;

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});

test("sem MONITOR_TOKEN /health/dependencias responde o 404 de rota inexistente", async () => {
    const res = await fetch(`${server.base}/health/dependencias`, {
        headers: { Authorization: "Bearer token_qualquer_com_mais_de_32_caracteres" },
    });
    assert.equal(res.status, 404);
    assert.match(await res.text(), /Cannot GET \/health\/dependencias/);
});
