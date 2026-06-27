import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

const novoUsuario = (over: Record<string, unknown> = {}) => ({
    name: "Aluno Teste",
    email: `aluno_${Math.round(performance.now() * 1000)}@email.com`,
    password: "senhaforte123",
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

async function criarUsuarioLogado(over: Record<string, unknown> = {}, admin = false) {
    const dados = novoUsuario(over);
    await server.request("POST", "/register", { body: dados });
    await ajustarUsuario(dados.email, { emailVerifiedAt: new Date(), ...(admin ? { role: "admin" } : {}) });
    const login = await server.request("POST", "/login", {
        body: { email: dados.email, password: dados.password },
    });
    return { email: dados.email, token: login.body.token };
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
}

async function get(path: string, token: string) {
    const res = await fetch(`${server.base}${path}`, { headers: auth(token) });
    return { status: res.status, body: await res.json().catch(() => null) };
}

async function post(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "POST",
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

async function criarTrilhaComAulas(adminToken: string, qtdAulas = 2) {
    const trilha = await post("/trails", adminToken, {
        name: "Logica de Programacao",
        level: "iniciante",
        description: "A base de qualquer linguagem de programacao.",
    });
    const lessonIds: string[] = [];
    for (let i = 1; i <= qtdAulas; i++) {
        const aula = await post(`/trails/${trilha.body.id}/lessons`, adminToken, {
            title: `Aula ${i}`,
            position: i,
        });
        lessonIds.push(aula.body.id);
    }
    return { trailId: trilha.body.id as string, lessonIds };
}

before(async () => { server = await startTestServer(); });
after(async () => { await server.close(); });
beforeEach(async () => { await limparBanco(); });

describe("POST /trails", () => {
    test("admin cria trilha (201)", async () => {
        const { token } = await criarUsuarioLogado({}, true);
        const res = await post("/trails", token, {
            name: "Logica de Programacao",
            level: "iniciante",
            description: "A base de qualquer linguagem de programacao.",
        });
        assert.equal(res.status, 201);
        assert.ok(res.body.id);
    });

    test("usuario comum recebe 403", async () => {
        const { token } = await criarUsuarioLogado();
        const res = await post("/trails", token, {
            name: "Logica de Programacao",
            level: "iniciante",
            description: "A base de qualquer linguagem de programacao.",
        });
        assert.equal(res.status, 403);
    });

    test("rejeita nivel invalido (400)", async () => {
        const { token } = await criarUsuarioLogado({}, true);
        const res = await post("/trails", token, {
            name: "Trilha X",
            level: "expert",
            description: "Descricao valida com mais de dez caracteres.",
        });
        assert.equal(res.status, 400);
    });
});

describe("POST /trails/:id/lessons", () => {
    test("admin cria aula numa trilha (201)", async () => {
        const { token } = await criarUsuarioLogado({}, true);
        const trilha = await post("/trails", token, {
            name: "Trilha",
            level: "iniciante",
            description: "Descricao valida com mais de dez caracteres.",
        });
        const res = await post(`/trails/${trilha.body.id}/lessons`, token, {
            title: "Variaveis",
            position: 1,
        });
        assert.equal(res.status, 201);
        assert.equal(res.body.position, 1);
    });

    test("404 ao criar aula em trilha inexistente", async () => {
        const { token } = await criarUsuarioLogado({}, true);
        const idFalso = "00000000-0000-0000-0000-000000000000";
        const res = await post(`/trails/${idFalso}/lessons`, token, {
            title: "Variaveis",
            position: 1,
        });
        assert.equal(res.status, 404);
    });
});

describe("GET /trails", () => {
    test("lista o catalogo com o total de aulas", async () => {
        const admin = await criarUsuarioLogado({}, true);
        await criarTrilhaComAulas(admin.token, 3);

        const aluno = await criarUsuarioLogado();
        const res = await get("/trails", aluno.token);
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0].totalLessons, 3);
    });
});

describe("POST /lessons/:id/complete e GET /me/trails", () => {
    test("marcar aula reflete no progresso (1 de 2 = 50%)", async () => {
        const admin = await criarUsuarioLogado({}, true);
        const { lessonIds } = await criarTrilhaComAulas(admin.token, 2);
        const aluno = await criarUsuarioLogado();

        const c = await post(`/lessons/${lessonIds[0]}/complete`, aluno.token);
        assert.equal(c.status, 201);

        const prog = await get("/me/trails", aluno.token);
        assert.equal(prog.status, 200);
        assert.equal(prog.body.length, 1);
        assert.equal(prog.body[0].completedLessons, 1);
        assert.equal(prog.body[0].progress, 50);
    });

    test("marcar a mesma aula duas vezes e idempotente", async () => {
        const admin = await criarUsuarioLogado({}, true);
        const { lessonIds } = await criarTrilhaComAulas(admin.token, 2);
        const aluno = await criarUsuarioLogado();

        const primeira = await post(`/lessons/${lessonIds[0]}/complete`, aluno.token);
        const segunda = await post(`/lessons/${lessonIds[0]}/complete`, aluno.token);
        assert.equal(primeira.status, 201);
        assert.equal(segunda.status, 200);

        const prog = await get("/me/trails", aluno.token);
        assert.equal(prog.body[0].completedLessons, 1);
    });

    test("o progresso de um aluno nao aparece para outro", async () => {
        const admin = await criarUsuarioLogado({}, true);
        const { lessonIds } = await criarTrilhaComAulas(admin.token, 2);

        const alunoA = await criarUsuarioLogado();
        await post(`/lessons/${lessonIds[0]}/complete`, alunoA.token);

        const alunoB = await criarUsuarioLogado();
        const progB = await get("/me/trails", alunoB.token);
        assert.equal(progB.status, 200);
        assert.deepEqual(progB.body, []);
    });
});
