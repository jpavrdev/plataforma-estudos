import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Aluno Teste",
    email: `rmap_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `rmap_${seq}`,
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

async function montarRoadmap(adminToken: string) {
    const trilha = await post("/trails", adminToken, {
        name: "Logica",
        level: "iniciante",
        description: "Base da programacao logica.",
    });
    const modulo = await post(`/trails/${trilha.body.id}/modules`, adminToken, {
        title: "Modulo 1",
        position: 1,
    });
    const lessonIds: string[] = [];
    for (let i = 1; i <= 2; i++) {
        const aula = await post(`/modules/${modulo.body.id}/lessons`, adminToken, {
            title: `Aula ${i}`,
            position: i,
        });
        for (let q = 1; q <= 5; q++) {
            await post(`/lessons/${aula.body.id}/questions`, adminToken, {
                statement: `Questao numero ${q}`,
                position: q,
                options: [
                    { text: "errada", isCorrect: false },
                    { text: "certa", isCorrect: true },
                ],
            });
        }
        await patch(`/lessons/${aula.body.id}/published`, adminToken, { published: true });
        lessonIds.push(aula.body.id as string);
    }
    const trilha2 = await post("/trails", adminToken, {
        name: "Logica 2",
        level: "iniciante",
        description: "Continuacao da programacao logica.",
    });
    const rm = await post("/roadmaps", adminToken, {
        name: "Backend",
        description: "Do zero ao backend.",
        level: "iniciante",
        published: true,
    });
    const stageIds: string[] = [];
    for (const trailId of [trilha.body.id, trilha2.body.id]) {
        const st = await post(`/roadmaps/${rm.body.id}/stages`, adminToken, {
            phase: "fundamentos",
            title: `Etapa ${stageIds.length + 1}`,
            description: "Descricao da etapa.",
        });
        await post(`/roadmap-stages/${st.body.id}/refs`, adminToken, {
            refType: "trail",
            refId: trailId,
        });
        stageIds.push(st.body.id as string);
    }
    return {
        slug: rm.body.slug as string,
        stageIds,
        lessonIds,
        trailIds: [trilha.body.id as string, trilha2.body.id as string],
    };
}

async function concluirAulaPeloQuiz(lessonId: string, token: string) {
    const aula = await get(`/lessons/${lessonId}`, token);
    const answers = aula.body.questions.map((q: any) => ({
        questionId: q.id,
        optionId: q.options.find((o: any) => o.text === "certa").id,
    }));
    await post(`/lessons/${lessonId}/quiz`, token, { answers });
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

describe("Roadmap: conclusão manual de estágio", () => {
    test("concluir marca o estágio, destrava o próximo e é idempotente", async () => {
        const admin = await criarUsuarioLogado(true);
        const { slug, stageIds } = await montarRoadmap(admin.token);
        const aluno = await criarUsuarioLogado();

        const antes = await get(`/roadmaps/${slug}`, aluno.token);
        assert.equal(antes.body.stages[0].completed, false);
        assert.equal(antes.body.stages[1].locked, true);

        assert.equal(
            (await post(`/roadmap-stages/${stageIds[0]}/concluir`, aluno.token)).status,
            200,
        );
        assert.equal(
            (await post(`/roadmap-stages/${stageIds[0]}/concluir`, aluno.token)).status,
            200,
        );

        const depois = await get(`/roadmaps/${slug}`, aluno.token);
        assert.equal(depois.body.stages[0].completed, true);
        assert.equal(depois.body.stages[1].locked, false);
        assert.equal(depois.body.progress.stagesDone, 1);
    });

    test("concluir marca as trilhas do estágio sem dar XP; fazer de verdade recupera o XP", async () => {
        const admin = await criarUsuarioLogado(true);
        const { stageIds, lessonIds } = await montarRoadmap(admin.token);
        const aluno = await criarUsuarioLogado();

        await post(`/roadmap-stages/${stageIds[0]}/concluir`, aluno.token);

        const minhas = await get("/me/trails", aluno.token);
        assert.equal(minhas.body.length, 1);
        assert.equal(minhas.body[0].progress, 100);

        const xpAntes = await get("/me/xp", aluno.token);
        assert.equal(xpAntes.body.xp, 0);
        assert.equal(xpAntes.body.lessonsCompleted, 0);

        const aula = await get(`/lessons/${lessonIds[0]}`, aluno.token);
        const answers = aula.body.questions.map((q: any) => ({
            questionId: q.id,
            optionId: q.options.find((o: any) => o.text === "certa").id,
        }));
        await post(`/lessons/${lessonIds[0]}/quiz`, aluno.token, { answers });

        const xpDepois = await get("/me/xp", aluno.token);
        assert.equal(xpDepois.body.lessonsCompleted, 1);
        assert.equal(xpDepois.body.xp, 100);
    });

    test("estágio inexistente retorna 404", async () => {
        const aluno = await criarUsuarioLogado();
        const r = await post(
            "/roadmap-stages/00000000-0000-0000-0000-000000000000/concluir",
            aluno.token,
        );
        assert.equal(r.status, 404);
    });
});

describe("Roadmap: próxima trilha após concluir", () => {
    test("aponta a próxima trilha do roadmap; no fim, devolve nula", async () => {
        const admin = await criarUsuarioLogado(true);
        const { lessonIds, trailIds } = await montarRoadmap(admin.token);
        const aluno = await criarUsuarioLogado();

        // Antes de concluir a primeira trilha, a etapa seguinte está travada:
        // nada a oferecer.
        const travado = await get(`/roadmaps/proxima-trilha/${trailIds[0]}`, aluno.token);
        assert.equal(travado.status, 200);
        assert.equal(travado.body.roadmap.name, "Backend");
        assert.equal(travado.body.proximaTrilha, null);

        for (const lessonId of lessonIds) {
            await concluirAulaPeloQuiz(lessonId, aluno.token);
        }

        const r = await get(`/roadmaps/proxima-trilha/${trailIds[0]}`, aluno.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.roadmap.name, "Backend");
        assert.equal(r.body.proximaTrilha.name, "Logica 2");
        assert.equal(r.body.proximaTrilha.id, trailIds[1]);

        // A última trilha do roadmap não tem próxima.
        const fim = await get(`/roadmaps/proxima-trilha/${trailIds[1]}`, aluno.token);
        assert.equal(fim.body.roadmap.name, "Backend");
        assert.equal(fim.body.proximaTrilha, null);
    });

    test("trilha fora de qualquer roadmap devolve roadmap nulo", async () => {
        const admin = await criarUsuarioLogado(true);
        const avulsa = await post("/trails", admin.token, {
            name: "Avulsa",
            level: "iniciante",
            description: "Trilha sem roadmap nenhum.",
        });
        const aluno = await criarUsuarioLogado();
        const r = await get(`/roadmaps/proxima-trilha/${avulsa.body.id}`, aluno.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.roadmap, null);
        assert.equal(r.body.proximaTrilha, null);
    });
});
