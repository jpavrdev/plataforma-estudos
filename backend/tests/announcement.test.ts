import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Teste",
    email: `aluno_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `aluno_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function updateUser(email: string, fields: Record<string, unknown>) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set(fields).where(eq(users.email, email));
}

async function createLoggedUser(admin = false) {
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await updateUser(data.email, {
        emailVerifiedAt: new Date(),
        ...(admin ? { role: "admin" } : {}),
    });
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { email: data.email, token: login.body.token };
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

async function createSurvey(adminToken: string, over: Record<string, unknown> = {}) {
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

describe("Announcements", () => {
    test("an admin creates; a regular user gets 403", async () => {
        const admin = await createLoggedUser(true);
        const created = await createSurvey(admin.token);
        assert.equal(created.status, 201);
        assert.equal(created.body.kind, "pesquisa");

        const regular = await createLoggedUser();
        const denied = await createSurvey(regular.token);
        assert.equal(denied.status, 403);
    });

    test("active brings the latest published one; a draft does not show up", async () => {
        const admin = await createLoggedUser(true);
        await createSurvey(admin.token, { title: "Antiga" });
        await createSurvey(admin.token, { title: "Recente" });
        await createSurvey(admin.token, { title: "Rascunho", published: false });

        const student = await createLoggedUser();
        const active = await get("/comunicados/ativo", student.token);
        assert.equal(active.status, 200);
        assert.equal(active.body.title, "Recente");
    });

    test("answering saves the rating and comment and does not show up again; repeating gives 409", async () => {
        const admin = await createLoggedUser(true);
        const survey = await createSurvey(admin.token);
        const student = await createLoggedUser();

        const ok = await post(`/comunicados/${survey.body.id}/responder`, student.token, {
            rating: 4,
            comment: "Muito bom, faltam mais desafios",
        });
        assert.equal(ok.status, 200);

        const active = await get("/comunicados/ativo", student.token);
        assert.equal(active.body, null);

        const repeated = await post(`/comunicados/${survey.body.id}/responder`, student.token, {
            rating: 5,
        });
        assert.equal(repeated.status, 409);
    });

    test("a rating outside 1 to 5 is rejected", async () => {
        const admin = await createLoggedUser(true);
        const survey = await createSurvey(admin.token);
        const student = await createLoggedUser();

        for (const rating of [0, 6]) {
            const r = await post(`/comunicados/${survey.body.id}/responder`, student.token, {
                rating,
            });
            assert.equal(r.status, 400);
        }
    });

    test("dismissing hides the announcement and is idempotent", async () => {
        const admin = await createLoggedUser(true);
        const survey = await createSurvey(admin.token);
        const student = await createLoggedUser();

        assert.equal(
            (await post(`/comunicados/${survey.body.id}/dispensar`, student.token)).status,
            200,
        );
        assert.equal(
            (await post(`/comunicados/${survey.body.id}/dispensar`, student.token)).status,
            200,
        );
        const active = await get("/comunicados/ativo", student.token);
        assert.equal(active.body, null);
    });

    test("a notice does not accept answers, only dismissal", async () => {
        const admin = await createLoggedUser(true);
        const notice = await createSurvey(admin.token, { kind: "aviso", title: "Manutenção" });
        const student = await createLoggedUser();

        const r = await post(`/comunicados/${notice.body.id}/responder`, student.token, {
            rating: 5,
        });
        assert.equal(r.status, 400);
        assert.equal(
            (await post(`/comunicados/${notice.body.id}/dispensar`, student.token)).status,
            200,
        );
    });

    test("results aggregate distribution, average and comments (admin only)", async () => {
        const admin = await createLoggedUser(true);
        const survey = await createSurvey(admin.token);

        const a = await createLoggedUser();
        const b = await createLoggedUser();
        const c = await createLoggedUser();
        await post(`/comunicados/${survey.body.id}/responder`, a.token, {
            rating: 5,
            comment: "Excelente",
        });
        await post(`/comunicados/${survey.body.id}/responder`, b.token, { rating: 3 });
        await post(`/comunicados/${survey.body.id}/dispensar`, c.token);

        const res = await get(`/studio/comunicados/${survey.body.id}`, admin.token);
        assert.equal(res.status, 200);
        assert.equal(res.body.respondidos, 2);
        assert.equal(res.body.dispensados, 1);
        assert.equal(res.body.media, 4);
        assert.equal(res.body.distribuicao.find((d: any) => d.rating === 5).count, 1);
        assert.equal(res.body.distribuicao.find((d: any) => d.rating === 3).count, 1);
        assert.equal(
            res.body.respostas.some((r: any) => r.comment === "Excelente"),
            true,
        );

        const denied = await get(`/studio/comunicados/${survey.body.id}`, a.token);
        assert.equal(denied.status, 403);
    });
});
