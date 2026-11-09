import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";

// Env is only read when the app boots and each test file runs in its own process;
// removing it here guarantees the scenario even with the token exported in the shell.
delete process.env.MONITOR_TOKEN;

let server: Awaited<ReturnType<typeof startTestServer>>;

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});

test("without MONITOR_TOKEN /health/dependencias answers the 404 of a nonexistent route", async () => {
    const res = await fetch(`${server.base}/health/dependencias`, {
        headers: { Authorization: "Bearer token_qualquer_com_mais_de_32_caracteres" },
    });
    assert.equal(res.status, 404);
    assert.match(await res.text(), /Cannot GET \/health\/dependencias/);
});
