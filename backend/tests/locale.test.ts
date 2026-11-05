import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

async function call(
    method: string,
    path: string,
    { locale, body, raw }: { locale?: string; body?: unknown; raw?: string } = {},
) {
    const headers: Record<string, string> = {};
    if (locale) headers["X-Locale"] = locale;
    if (body !== undefined || raw !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(`${server.base}${path}`, {
        method,
        headers,
        body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

before(async () => {
    server = await startTestServer();
});

after(async () => {
    await server.close();
});

beforeEach(async () => {
    await limparBanco();
});

describe("API language", () => {
    test("without the header the answer stays in Portuguese, as before", async () => {
        const r = await call("POST", "/login", {
            body: { email: "ninguem@example.com", password: "Qualquer123!" },
        });
        assert.equal(r.status, 401);
        assert.equal(r.body.erro, "Credenciais inválidas");
    });

    test("X-Locale: en translates an error written by a controller", async () => {
        const r = await call("POST", "/login", {
            locale: "en",
            body: { email: "ninguem@example.com", password: "Qualquer123!" },
        });
        assert.equal(r.status, 401);
        assert.equal(r.body.erro, "Invalid credentials");
    });

    test("X-Locale: en translates an error thrown by a service", async () => {
        const r = await call("GET", "/certificados/ED-0000-0000-0000", { locale: "en" });
        assert.equal(r.status, 404);
        assert.equal(r.body.erro, "Certificate not found");
    });

    test("X-Locale: en translates a malformed body error", async () => {
        const r = await call("POST", "/login", { locale: "en", raw: "{not json" });
        assert.equal(r.status, 400);
        assert.equal(r.body.erro, "Invalid request");
    });

    test("X-Locale: en translates a success message, keeping the field name", async () => {
        const r = await call("POST", "/register", {
            locale: "en",
            body: {
                name: "Student Test",
                email: `locale_${Date.now()}@example.com`,
                username: `loc_${Date.now() % 1_000_000}`,
                password: "Senhaforte123!",
                birthDate: "1990-01-01",
                gender: "outro",
                phone: "(11) 98888-7777",
            },
        });
        assert.equal(r.status, 201);
        assert.equal(r.body.mensagem, "Account created. Check your email to activate access.");
    });

    test("X-Locale: pt-BR keeps Portuguese", async () => {
        const r = await call("GET", "/certificados/ED-0000-0000-0000", { locale: "pt-BR" });
        assert.equal(r.body.erro, "Certificado não encontrado");
    });
});
