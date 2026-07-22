import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Aluno Teste",
    email: `aluno_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `aluno_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
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

async function criarPesquisa(adminToken: string, over: Record<string, unknown> = {}) {
    return post("/comunicados", adminToken, {
        kind: "pesquisa",
        title: "Ajude a melhorar o site",
        message: "De 1 a 5, como está sendo sua experiência?",
        published: true,
        ...over,
    });
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

describe("Comunicados", () => {
    test("admin cria; usuário comum recebe 403", async () => {
        const admin = await criarUsuarioLogado(true);
        const criado = await criarPesquisa(admin.token);
        assert.equal(criado.status, 201);
        assert.equal(criado.body.kind, "pesquisa");

        const comum = await criarUsuarioLogado();
        const negado = await criarPesquisa(comum.token);
        assert.equal(negado.status, 403);
    });

    test("ativo traz o publicado mais recente; rascunho não aparece", async () => {
        const admin = await criarUsuarioLogado(true);
        await criarPesquisa(admin.token, { title: "Antiga" });
        await criarPesquisa(admin.token, { title: "Recente" });
        await criarPesquisa(admin.token, { title: "Rascunho", published: false });

        const aluno = await criarUsuarioLogado();
        const ativo = await get("/comunicados/ativo", aluno.token);
        assert.equal(ativo.status, 200);
        assert.equal(ativo.body.title, "Recente");
    });

    test("responder registra nota e comentário e não reaparece; repetir dá 409", async () => {
        const admin = await criarUsuarioLogado(true);
        const pesquisa = await criarPesquisa(admin.token);
        const aluno = await criarUsuarioLogado();

        const ok = await post(`/comunicados/${pesquisa.body.id}/responder`, aluno.token, {
            rating: 4,
            comment: "Muito bom, faltam mais desafios",
        });
        assert.equal(ok.status, 200);

        const ativo = await get("/comunicados/ativo", aluno.token);
        assert.equal(ativo.body, null);

        const repetida = await post(`/comunicados/${pesquisa.body.id}/responder`, aluno.token, {
            rating: 5,
        });
        assert.equal(repetida.status, 409);
    });

    test("nota fora de 1 a 5 é rejeitada", async () => {
        const admin = await criarUsuarioLogado(true);
        const pesquisa = await criarPesquisa(admin.token);
        const aluno = await criarUsuarioLogado();

        for (const rating of [0, 6]) {
            const r = await post(`/comunicados/${pesquisa.body.id}/responder`, aluno.token, {
                rating,
            });
            assert.equal(r.status, 400);
        }
    });

    test("dispensar esconde o comunicado e é idempotente", async () => {
        const admin = await criarUsuarioLogado(true);
        const pesquisa = await criarPesquisa(admin.token);
        const aluno = await criarUsuarioLogado();

        assert.equal(
            (await post(`/comunicados/${pesquisa.body.id}/dispensar`, aluno.token)).status,
            200,
        );
        assert.equal(
            (await post(`/comunicados/${pesquisa.body.id}/dispensar`, aluno.token)).status,
            200,
        );
        const ativo = await get("/comunicados/ativo", aluno.token);
        assert.equal(ativo.body, null);
    });

    test("aviso não aceita resposta, só dispensa", async () => {
        const admin = await criarUsuarioLogado(true);
        const aviso = await criarPesquisa(admin.token, { kind: "aviso", title: "Manutenção" });
        const aluno = await criarUsuarioLogado();

        const r = await post(`/comunicados/${aviso.body.id}/responder`, aluno.token, { rating: 5 });
        assert.equal(r.status, 400);
        assert.equal(
            (await post(`/comunicados/${aviso.body.id}/dispensar`, aluno.token)).status,
            200,
        );
    });

    test("resultados agregam distribuição, média e comentários (só admin)", async () => {
        const admin = await criarUsuarioLogado(true);
        const pesquisa = await criarPesquisa(admin.token);

        const a = await criarUsuarioLogado();
        const b = await criarUsuarioLogado();
        const c = await criarUsuarioLogado();
        await post(`/comunicados/${pesquisa.body.id}/responder`, a.token, {
            rating: 5,
            comment: "Excelente",
        });
        await post(`/comunicados/${pesquisa.body.id}/responder`, b.token, { rating: 3 });
        await post(`/comunicados/${pesquisa.body.id}/dispensar`, c.token);

        const res = await get(`/studio/comunicados/${pesquisa.body.id}`, admin.token);
        assert.equal(res.status, 200);
        assert.equal(res.body.respondidos, 2);
        assert.equal(res.body.dispensados, 1);
        assert.equal(res.body.media, 4);
        assert.equal(res.body.distribuicao.find((d: any) => d.rating === 5).count, 1);
        assert.equal(res.body.distribuicao.find((d: any) => d.rating === 3).count, 1);
        assert.equal(res.body.respostas.some((r: any) => r.comment === "Excelente"), true);

        const negado = await get(`/studio/comunicados/${pesquisa.body.id}`, a.token);
        assert.equal(negado.status, 403);
    });
});
