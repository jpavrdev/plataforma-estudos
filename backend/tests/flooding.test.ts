import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Aluno Flood",
    email: `fld_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `fld_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function criarUsuarioLogado() {
    const dados = novoUsuario();
    await server.request("POST", "/register", { body: dados });
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db
        .update(users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(users.email, dados.email));
    const login = await server.request("POST", "/login", {
        body: { email: dados.email, password: dados.password },
    });
    return { token: login.body.token };
}

async function postJson(path: string, body: unknown, token?: string) {
    const res = await fetch(`${server.base}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
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

describe("Proteção contra input flooding", () => {
    test("cadastro rejeita nome e gênero sem teto", async () => {
        const base = novoUsuario();
        const nomeGigante = await postJson("/register", { ...base, name: "N".repeat(300) });
        assert.equal(nomeGigante.status, 400);
        const generoGigante = await postJson("/register", {
            ...novoUsuario(),
            gender: "g".repeat(100),
        });
        assert.equal(generoGigante.status, 400);
    });

    test("login rejeita senha quilométrica antes do bcrypt", async () => {
        const r = await postJson("/login", {
            email: "alguem@email.com",
            password: "x".repeat(5000),
        });
        assert.equal(r.status, 400);
    });

    test("quiz rejeita mais respostas do que qualquer aula tem", async () => {
        const aluno = await criarUsuarioLogado();
        const resposta = () => ({ questionId: randomUUID(), optionId: randomUUID() });

        const inundado = await postJson(
            `/lessons/${randomUUID()}/quiz`,
            { answers: Array.from({ length: 51 }, resposta) },
            aluno.token,
        );
        assert.equal(inundado.status, 400);

        const noLimite = await postJson(
            `/lessons/${randomUUID()}/quiz`,
            { answers: Array.from({ length: 50 }, resposta) },
            aluno.token,
        );
        assert.equal(noLimite.status, 404);
    });
});

describe("Cabeçalhos de segurança", () => {
    test("respostas trazem os headers de proteção", async () => {
        const res = await fetch(`${server.base}/trails`);
        assert.equal(res.headers.get("x-frame-options"), "DENY");
        assert.equal(res.headers.get("x-content-type-options"), "nosniff");
        assert.ok(res.headers.get("content-security-policy"));
        assert.ok(res.headers.get("strict-transport-security"));
        assert.equal(res.headers.get("x-powered-by"), null);
    });
});
