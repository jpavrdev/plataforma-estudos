import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Publico",
    email: `pub_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `pub_${seq}`,
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

async function createSignedInUser(admin = false) {
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await updateUser(data.email, {
        emailVerifiedAt: new Date(),
        ...(admin ? { role: "admin" } : {}),
    });
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { email: data.email, username: data.username, token: login.body.token };
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
}
async function get(path: string, token?: string) {
    const res = await fetch(`${server.base}${path}`, { headers: token ? auth(token) : {} });
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

async function buildCompletedTrail(adminToken: string, studentToken: string) {
    const trail = await post("/trails", adminToken, {
        name: "Logica",
        level: "iniciante",
        description: "Base da programacao logica.",
        workloadHours: 20,
    });
    const mod = await post(`/trails/${trail.body.id}/modules`, adminToken, {
        title: "Modulo 1",
        position: 1,
    });
    for (let i = 1; i <= 2; i++) {
        const lesson = await post(`/modules/${mod.body.id}/lessons`, adminToken, {
            title: `Aula ${i}`,
            position: i,
        });
        for (let q = 1; q <= 5; q++) {
            await post(`/lessons/${lesson.body.id}/questions`, adminToken, {
                statement: `Questao numero ${q}`,
                position: q,
                options: [
                    { text: "errada", isCorrect: false },
                    { text: "certa", isCorrect: true },
                ],
            });
        }
        await patch(`/lessons/${lesson.body.id}/published`, adminToken, { published: true });
        const detail = await get(`/lessons/${lesson.body.id}`, studentToken);
        const answers = detail.body.questions.map((q: any) => ({
            questionId: q.id,
            optionId: q.options.find((o: any) => o.text === "certa").id,
        }));
        await post(`/lessons/${lesson.body.id}/quiz`, studentToken, { answers });
    }
    return trail.body.id as string;
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

describe("Public profile", () => {
    test("anyone sees the profile without signing in, with no sensitive data", async () => {
        const student = await createSignedInUser();
        await patch("/me", student.token, { bio: "Estudando programacao todo dia." });

        const r = await get(`/perfis/${student.username}`);
        assert.equal(r.status, 200);
        assert.equal(r.body.username, student.username);
        assert.equal(r.body.name, "Aluno Publico");
        assert.equal(r.body.bio, "Estudando programacao todo dia.");
        assert.equal(r.body.email, undefined);
        assert.equal(r.body.phone, undefined);
        assert.equal(r.body.birthDate, undefined);
    });

    test("shows progress, the track and the issued certificate", async () => {
        const admin = await createSignedInUser(true);
        const student = await createSignedInUser();
        const trailId = await buildCompletedTrail(admin.token, student.token);
        await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: "529.982.247-25",
            name: "Aluno Publico da Silva",
        });

        const r = await get(`/perfis/${student.username}`);
        assert.equal(r.status, 200);
        assert.equal(r.body.lessonsCompleted, 2);
        assert.equal(r.body.xp, 200);
        assert.equal(r.body.trilhas.length, 1);
        assert.equal(r.body.trilhas[0].progress, 100);
        assert.equal(r.body.certificados.length, 1);
        assert.equal(r.body.certificados[0].trailName, "Logica");
        assert.match(r.body.certificados[0].code, /^ED-/);
        assert.equal(r.body.certificados[0].cpf, undefined);
    });

    test("a missing username returns 404", async () => {
        const r = await get("/perfis/nao_existe_esse");
        assert.equal(r.status, 404);
    });
});
