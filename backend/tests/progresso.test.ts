import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Aluno Progresso",
    email: `prg_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `prg_${seq}`,
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
async function patch(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "PATCH",
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
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

describe("Meu progresso", () => {
    test("agrega XP, exercícios, tempo estimado, meta da semana e heatmap", async () => {
        const admin = await criarUsuarioLogado(true);
        const trilha = await post("/trails", admin.token, {
            name: "Logica",
            level: "iniciante",
            description: "Base da programacao logica.",
        });
        const modulo = await post(`/trails/${trilha.body.id}/modules`, admin.token, {
            title: "Modulo 1",
            position: 1,
        });
        const aluno = await criarUsuarioLogado();
        for (let i = 1; i <= 2; i++) {
            const aula = await post(`/modules/${modulo.body.id}/lessons`, admin.token, {
                title: `Aula ${i}`,
                position: i,
            });
            for (let q = 1; q <= 5; q++) {
                await post(`/lessons/${aula.body.id}/questions`, admin.token, {
                    statement: `Questao numero ${q}`,
                    position: q,
                    options: [
                        { text: "errada", isCorrect: false },
                        { text: "certa", isCorrect: true },
                    ],
                });
            }
            await patch(`/lessons/${aula.body.id}/published`, admin.token, { published: true });
            const detalhe = await get(`/lessons/${aula.body.id}`, aluno.token);
            const answers = detalhe.body.questions.map((q: any) => ({
                questionId: q.id,
                optionId: q.options.find((o: any) => o.text === "certa").id,
            }));
            await post(`/lessons/${aula.body.id}/quiz`, aluno.token, { answers });
        }

        const r = await get("/me/progresso?periodo=30", aluno.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.xpTotal, 200);
        assert.equal(r.body.streakAtual, 1);
        assert.equal(r.body.streakRecorde, 1);
        assert.equal(r.body.periodo.atual.xp, 200);
        assert.equal(r.body.periodo.atual.exercicios, 10);
        assert.equal(r.body.periodo.atual.minutos, 24);
        assert.equal(r.body.metaSemana.tipo, "padrao");
        assert.equal(r.body.metaSemana.valor, 1);
        assert.equal(r.body.metaSemana.alvo, 7);
        assert.equal(r.body.xpPorDia.length, 14);
        assert.equal(r.body.xpPorDia.at(-1).xp, 200);
        assert.equal(r.body.heatmap.length, 1);
        assert.equal(r.body.heatmap[0].n, 2);
        assert.equal(r.body.aulasAno, 2);
        assert.equal(r.body.dominio.length, 1);
        assert.equal(r.body.dominio[0].name, "Logica");
        assert.equal(r.body.dominio[0].acertos, 10);
        assert.equal(r.body.dominio[0].total, 10);
        assert.equal(r.body.dominio[0].pct, 100);
    });

    test("meta semanal personalizada muda o anel e pode voltar ao padrão", async () => {
        const admin = await criarUsuarioLogado(true);
        const trilha = await post("/trails", admin.token, {
            name: "Logica",
            level: "iniciante",
            description: "Base da programacao logica.",
        });
        const modulo = await post(`/trails/${trilha.body.id}/modules`, admin.token, {
            title: "Modulo 1",
            position: 1,
        });
        const aluno = await criarUsuarioLogado();
        for (let i = 1; i <= 2; i++) {
            const aula = await post(`/modules/${modulo.body.id}/lessons`, admin.token, {
                title: `Aula ${i}`,
                position: i,
            });
            for (let q = 1; q <= 5; q++) {
                await post(`/lessons/${aula.body.id}/questions`, admin.token, {
                    statement: `Questao numero ${q}`,
                    position: q,
                    options: [
                        { text: "errada", isCorrect: false },
                        { text: "certa", isCorrect: true },
                    ],
                });
            }
            await patch(`/lessons/${aula.body.id}/published`, admin.token, { published: true });
            const detalhe = await get(`/lessons/${aula.body.id}`, aluno.token);
            const answers = detalhe.body.questions.map((q: any) => ({
                questionId: q.id,
                optionId: q.options.find((o: any) => o.text === "certa").id,
            }));
            await post(`/lessons/${aula.body.id}/quiz`, aluno.token, { answers });
        }

        const put = await fetch(`${server.base}/me/meta-semanal`, {
            method: "PUT",
            headers: { ...auth(aluno.token), "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "aulas", target: 2 }),
        });
        assert.equal(put.status, 200);
        let r = await get("/me/progresso?periodo=30", aluno.token);
        assert.deepEqual(r.body.metaSemana, { tipo: "aulas", valor: 1, alvo: 7, alvoDiario: 2 });

        await fetch(`${server.base}/me/meta-semanal`, {
            method: "PUT",
            headers: { ...auth(aluno.token), "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "dias", target: 5 }),
        });
        r = await get("/me/progresso?periodo=30", aluno.token);
        assert.deepEqual(r.body.metaSemana, { tipo: "dias", valor: 1, alvo: 5 });

        const del = await fetch(`${server.base}/me/meta-semanal`, {
            method: "DELETE",
            headers: auth(aluno.token),
        });
        assert.equal(del.status, 200);
        r = await get("/me/progresso?periodo=30", aluno.token);
        assert.equal(r.body.metaSemana.tipo, "padrao");

        const invalida = await fetch(`${server.base}/me/meta-semanal`, {
            method: "PUT",
            headers: { ...auth(aluno.token), "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "dias", target: 1 }),
        });
        assert.equal(invalida.status, 400);
    });

    test("período tudo não traz comparação com anterior", async () => {
        const aluno = await criarUsuarioLogado();
        const r = await get("/me/progresso?periodo=tudo", aluno.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.periodo.dias, null);
        assert.equal(r.body.periodo.anterior, null);
        assert.equal(r.body.xpTotal, 0);
    });
});
