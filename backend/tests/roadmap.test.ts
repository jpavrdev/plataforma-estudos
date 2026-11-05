import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Teste",
    email: `rmap_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `rmap_${seq}`,
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

async function patch(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "PATCH",
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

async function seedRoadmap(adminToken: string) {
    const trail = await post("/trails", adminToken, {
        name: "Logica",
        level: "iniciante",
        description: "Base da programacao logica.",
    });
    const moduleRow = await post(`/trails/${trail.body.id}/modules`, adminToken, {
        title: "Modulo 1",
        position: 1,
    });
    const lessonIds: string[] = [];
    for (let i = 1; i <= 2; i++) {
        const aula = await post(`/modules/${moduleRow.body.id}/lessons`, adminToken, {
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
    const trail2 = await post("/trails", adminToken, {
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
    for (const trailId of [trail.body.id, trail2.body.id]) {
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
        trailIds: [trail.body.id as string, trail2.body.id as string],
    };
}

async function completeLessonByQuiz(lessonId: string, token: string) {
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

describe("Roadmap: manual stage completion", () => {
    test("completing marks the stage, unlocks the next one and is idempotent", async () => {
        const admin = await createLoggedUser(true);
        const { slug, stageIds } = await seedRoadmap(admin.token);
        const student = await createLoggedUser();

        const earlier = await get(`/roadmaps/${slug}`, student.token);
        assert.equal(earlier.body.stages[0].completed, false);
        assert.equal(earlier.body.stages[1].locked, true);

        assert.equal(
            (await post(`/roadmap-stages/${stageIds[0]}/concluir`, student.token)).status,
            200,
        );
        assert.equal(
            (await post(`/roadmap-stages/${stageIds[0]}/concluir`, student.token)).status,
            200,
        );

        const later = await get(`/roadmaps/${slug}`, student.token);
        assert.equal(later.body.stages[0].completed, true);
        assert.equal(later.body.stages[1].locked, false);
        assert.equal(later.body.progress.stagesDone, 1);
    });

    test("completing marks the stage's tracks without XP; doing them for real recovers the XP", async () => {
        const admin = await createLoggedUser(true);
        const { stageIds, lessonIds } = await seedRoadmap(admin.token);
        const student = await createLoggedUser();

        await post(`/roadmap-stages/${stageIds[0]}/concluir`, student.token);

        const mine = await get("/me/trails", student.token);
        assert.equal(mine.body.length, 1);
        assert.equal(mine.body[0].progress, 100);

        const xpBefore = await get("/me/xp", student.token);
        assert.equal(xpBefore.body.xp, 0);
        assert.equal(xpBefore.body.lessonsCompleted, 0);

        const aula = await get(`/lessons/${lessonIds[0]}`, student.token);
        const answers = aula.body.questions.map((q: any) => ({
            questionId: q.id,
            optionId: q.options.find((o: any) => o.text === "certa").id,
        }));
        await post(`/lessons/${lessonIds[0]}/quiz`, student.token, { answers });

        const xpAfter = await get("/me/xp", student.token);
        assert.equal(xpAfter.body.lessonsCompleted, 1);
        assert.equal(xpAfter.body.xp, 100);
    });

    test("an unknown stage returns 404", async () => {
        const student = await createLoggedUser();
        const r = await post(
            "/roadmap-stages/00000000-0000-0000-0000-000000000000/concluir",
            student.token,
        );
        assert.equal(r.status, 404);
    });
});

describe("Roadmap: next track after completing", () => {
    test("points to the roadmap's next track; at the end, returns null", async () => {
        const admin = await createLoggedUser(true);
        const { lessonIds, trailIds } = await seedRoadmap(admin.token);
        const student = await createLoggedUser();

        // Before completing the first track, the next stage is locked:
        // nothing to offer.
        const locked = await get(`/roadmaps/proxima-trilha/${trailIds[0]}`, student.token);
        assert.equal(locked.status, 200);
        assert.equal(locked.body.roadmap.name, "Backend");
        assert.equal(locked.body.proximaTrilha, null);

        for (const lessonId of lessonIds) {
            await completeLessonByQuiz(lessonId, student.token);
        }

        const r = await get(`/roadmaps/proxima-trilha/${trailIds[0]}`, student.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.roadmap.name, "Backend");
        assert.equal(r.body.proximaTrilha.name, "Logica 2");
        assert.equal(r.body.proximaTrilha.id, trailIds[1]);

        // The roadmap's last track has no next one.
        const end = await get(`/roadmaps/proxima-trilha/${trailIds[1]}`, student.token);
        assert.equal(end.body.roadmap.name, "Backend");
        assert.equal(end.body.proximaTrilha, null);
    });

    test("a track outside any roadmap returns a null roadmap", async () => {
        const admin = await createLoggedUser(true);
        const standalone = await post("/trails", admin.token, {
            name: "Avulsa",
            level: "iniciante",
            description: "Trilha sem roadmap nenhum.",
        });
        const student = await createLoggedUser();
        const r = await get(`/roadmaps/proxima-trilha/${standalone.body.id}`, student.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.roadmap, null);
        assert.equal(r.body.proximaTrilha, null);
    });
});
