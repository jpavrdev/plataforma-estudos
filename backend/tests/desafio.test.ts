import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;
let seq = 0;

const hojeSP = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

const novoUsuario = (over: Record<string, unknown> = {}) => ({
    name: "Aluno Teste",
    email: `aluno_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `aluno_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
    ...over,
});

async function ajustarUsuario(email: string, campos: Record<string, unknown>) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set(campos).where(eq(users.email, email));
}

async function criarUsuarioLogado(admin = false) {
    const dados = novoUsuario();
    await server.request("POST", "/register", { body: dados });
    await ajustarUsuario(dados.email, {
        emailVerifiedAt: new Date(),
        ...(admin ? { role: "admin" } : {}),
    });
    const login = await server.request("POST", "/login", {
        body: { email: dados.email, password: dados.password },
    });
    return { email: dados.email, token: login.body.token as string };
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
async function req(method: string, path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method,
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

const desafioBase = (over: Record<string, unknown> = {}) => ({
    title: "Soma de dois números",
    statementBlocks: [{ type: "text", value: "Leia dois números e imprima a soma." }],
    difficulty: "facil",
    starterCode: { javascript: "// leia de process.stdin", python: "# leia de input()" },
    published: true,
    tests: [
        { input: "2 3\n", expectedOutput: "5", isPublic: true },
        { input: "10 20\n", expectedOutput: "30", isPublic: false },
    ],
    ...over,
});

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});
beforeEach(async () => {
    await limparBanco();
});

describe("desafios - admin", () => {
    test("admin cria desafio e recupera com todos os casos", async () => {
        const admin = await criarUsuarioLogado(true);
        const criado = await req("POST", "/desafios", admin.token, desafioBase());
        assert.equal(criado.status, 201);
        assert.ok(criado.body.id);

        const det = await req("GET", `/admin/desafios/${criado.body.id}`, admin.token);
        assert.equal(det.status, 200);
        assert.equal(det.body.tests.length, 2);
        assert.equal(det.body.tests.filter((t: any) => t.isPublic).length, 1);
    });

    test("usuário comum não pode criar", async () => {
        const user = await criarUsuarioLogado(false);
        const r = await req("POST", "/desafios", user.token, desafioBase());
        assert.equal(r.status, 403);
    });

    test("recusa desafio sem nenhum exemplo público", async () => {
        const admin = await criarUsuarioLogado(true);
        const r = await req(
            "POST",
            "/desafios",
            admin.token,
            desafioBase({
                tests: [{ input: "1", expectedOutput: "1", isPublic: false }],
            }),
        );
        assert.equal(r.status, 400);
    });

    test("recusa duas datas ativas iguais", async () => {
        const admin = await criarUsuarioLogado(true);
        const hoje = hojeSP();
        const a = await req("POST", "/desafios", admin.token, desafioBase({ activeDate: hoje }));
        assert.equal(a.status, 201);
        const b = await req(
            "POST",
            "/desafios",
            admin.token,
            desafioBase({ activeDate: hoje, title: "Outro" }),
        );
        assert.equal(b.status, 409);
    });

    test("atualiza troca os casos de teste", async () => {
        const admin = await criarUsuarioLogado(true);
        const criado = await req("POST", "/desafios", admin.token, desafioBase());
        const upd = await req(
            "PATCH",
            `/desafios/${criado.body.id}`,
            admin.token,
            desafioBase({
                tests: [
                    { input: "1 1\n", expectedOutput: "2", isPublic: true },
                    { input: "2 2\n", expectedOutput: "4", isPublic: true },
                    { input: "9 9\n", expectedOutput: "18", isPublic: false },
                ],
            }),
        );
        assert.equal(upd.status, 200);
        const det = await req("GET", `/admin/desafios/${criado.body.id}`, admin.token);
        assert.equal(det.body.tests.length, 3);
    });

    test("exclui o desafio", async () => {
        const admin = await criarUsuarioLogado(true);
        const criado = await req("POST", "/desafios", admin.token, desafioBase());
        const del = await req("DELETE", `/desafios/${criado.body.id}`, admin.token);
        assert.equal(del.status, 200);
        const det = await req("GET", `/desafios/${criado.body.id}`, admin.token);
        assert.equal(det.status, 404);
    });
});

describe("desafios - aluno", () => {
    test("desafio do dia expõe só os exemplos públicos", async () => {
        const admin = await criarUsuarioLogado(true);
        await req("POST", "/desafios", admin.token, desafioBase({ activeDate: hojeSP() }));

        const user = await criarUsuarioLogado(false);
        const hoje = await req("GET", "/desafios/hoje", user.token);
        assert.equal(hoje.status, 200);
        assert.equal(hoje.body.isToday, true);
        assert.equal(hoje.body.exampleTests.length, 1);
        assert.equal(hoje.body.exampleTests[0].expectedOutput, "5");
        assert.equal(hoje.body.solved, false);
        // XP derivado da dificuldade (fácil = 50).
        assert.equal(hoje.body.xp, 50);
        // O caso oculto (entrada "10 20") não pode vazar em nenhum campo.
        assert.ok(!JSON.stringify(hoje.body).includes("10 20"));
    });

    test("sem desafio do dia devolve null", async () => {
        const user = await criarUsuarioLogado(false);
        const hoje = await req("GET", "/desafios/hoje", user.token);
        assert.equal(hoje.status, 200);
        assert.equal(hoje.body, null);
    });

    test("lista traz itens com status/xp e o progresso do usuário", async () => {
        const admin = await criarUsuarioLogado(true);
        await req(
            "POST",
            "/desafios",
            admin.token,
            desafioBase({ activeDate: hojeSP(), difficulty: "medio" }),
        );
        const user = await criarUsuarioLogado(false);
        const lista = await req("GET", "/desafios", user.token);
        assert.equal(lista.status, 200);
        assert.equal(lista.body.items.length, 1);
        assert.equal(lista.body.items[0].status, "todo");
        assert.equal(lista.body.items[0].isToday, true);
        assert.equal(lista.body.items[0].xp, 80); // médio
        assert.equal(lista.body.progress.total, 1);
        assert.equal(lista.body.progress.solved, 0);
    });

    test("detalhe não vaza casos ocultos", async () => {
        const admin = await criarUsuarioLogado(true);
        const criado = await req("POST", "/desafios", admin.token, desafioBase());
        const user = await criarUsuarioLogado(false);
        const det = await req("GET", `/desafios/${criado.body.id}`, user.token);
        assert.equal(det.status, 200);
        assert.equal(det.body.exampleTests.length, 1);
        assert.ok(!JSON.stringify(det.body).includes("10 20"));
    });
});
