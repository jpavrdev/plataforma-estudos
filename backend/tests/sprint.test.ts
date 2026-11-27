import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Sprint",
    email: `sprint_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `sprint_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function createLoggedInUser() {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, data.email));
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return login.body.token as string;
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
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

// A published sprint with three tasks; the game routes are useless without one.
async function createSprint() {
    const { db } = await import("../db.ts");
    const { sprints, sprintTasks } = await import("../schema.ts");
    const [sprint] = await db
        .insert(sprints)
        .values({
            slug: `sprint-teste-${++seq}`,
            product: "Sprint de teste",
            summary: "sumario",
            endsAt: new Date(Date.now() + 86_400_000),
            position: 1,
            published: true,
        })
        .returning();
    const tasks = await db
        .insert(sprintTasks)
        .values([
            {
                sprintId: sprint.id,
                position: 1,
                trackName: "Um",
                title: "Primeira task",
                description: "desc",
                points: 5,
                tag: "RUST · V2",
                starterCode: "fn a() {}",
                criteria: ["crit 1", "crit 2"],
                tests: [{ name: "teste_um", ms: 5 }],
            },
            {
                sprintId: sprint.id,
                position: 2,
                trackName: "Dois",
                title: "Segunda task",
                description: "desc",
                points: 3,
                tag: "RUST · V2",
                starterCode: "fn b() {}",
                criteria: ["crit 1"],
                tests: [{ name: "teste_dois", ms: 4 }],
            },
            {
                sprintId: sprint.id,
                position: 3,
                trackName: "Tres",
                title: "Terceira task",
                description: "desc",
                points: 3,
                tag: "RUST · V2",
                starterCode: "fn c() {}",
                criteria: ["crit 1"],
                tests: [{ name: "teste_tres", ms: 4 }],
            },
        ])
        .returning();
    return { sprint, tasks };
}

async function turnFlagOn(token: string) {
    const { db } = await import("../db.ts");
    const { featureFlags, featureFlagUsers } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    ) as { userId: string };
    const [flag] = await db
        .insert(featureFlags)
        .values({ key: "projetos-guiados", description: "teste", status: "on" })
        .onConflictDoUpdate({
            target: featureFlags.key,
            set: { status: "on" },
        })
        .returning();
    await db
        .insert(featureFlagUsers)
        .values({ flagId: flag.id, userId: payload.userId })
        .onConflictDoNothing();
    console.log(
        "FLAG-DEBUG",
        JSON.stringify({ status: flag.status, id: flag.id, userId: payload.userId }),
    );
}

before(async () => {
    server = await startTestServer();
});

after(async () => {
    await server.close();
});

describe("sprint game", () => {
    beforeEach(limparBanco);

    test("the routes stay invisible without the feature flag", async () => {
        const { sprint } = await createSprint();
        const token = await createLoggedInUser();
        assert.equal((await get("/sprints/current", token)).status, 404);
        assert.equal((await get(`/sprints/tasks/${sprint.id}`, token)).status, 404);
    });

    test("the board shows only the first task unlocked and progress as it goes", async () => {
        await createSprint();
        const token = await createLoggedInUser();
        await turnFlagOn(token);

        const first = await get("/sprints/current", token);
        assert.equal(first.status, 200, JSON.stringify(first.body));
        assert.equal(first.body.sprint.totalTasks, 3);
        assert.equal(first.body.sprint.delivered, 0);
        const statuses = first.body.tasks.map((t: { status: string; locked: boolean }) => [
            t.status,
            t.locked,
        ]);
        assert.deepEqual(statuses, [
            ["backlog", false],
            ["backlog", true],
            ["backlog", true],
        ]);
    });

    test("claim, code and complete drive the task through the engine", async () => {
        const { tasks } = await createSprint();
        const token = await createLoggedInUser();
        await turnFlagOn(token);

        assert.equal((await post(`/sprints/tasks/${tasks[0].id}/claim`, token)).status, 200);

        const saved = await post(`/sprints/tasks/${tasks[0].id}/code`, token, {
            code: "fn a() { 1 + 1 }",
        });
        assert.equal(saved.status, 200);

        const detail = await get(`/sprints/tasks/${tasks[0].id}`, token);
        assert.equal(detail.body.code, "fn a() { 1 + 1 }");
        assert.equal(detail.body.status, "doing");

        const done = await post(`/sprints/tasks/${tasks[0].id}/complete`, token);
        assert.equal(done.status, 200);
        assert.equal(done.body.xpEarned, 100);
        assert.equal(done.body.ranking[0].you, true);

        // Completing again does not pay twice.
        assert.equal((await post(`/sprints/tasks/${tasks[0].id}/complete`, token)).status, 409);

        // The second task unlocks, the third stays locked.
        const board = await get("/sprints/current", token);
        assert.deepEqual(
            board.body.tasks.map((t: { status: string; locked: boolean }) => [t.status, t.locked]),
            [
                ["done", false],
                ["backlog", false],
                ["backlog", true],
            ],
        );
        assert.equal(board.body.sprint.delivered, 1);
        assert.equal(board.body.sprint.earned, 5);
    });

    test("returning a claimed task keeps the saved code", async () => {
        const { tasks } = await createSprint();
        const token = await createLoggedInUser();
        await turnFlagOn(token);

        await post(`/sprints/tasks/${tasks[0].id}/claim`, token);
        await post(`/sprints/tasks/${tasks[0].id}/code`, token, { code: "meu codigo" });
        assert.equal((await post(`/sprints/tasks/${tasks[0].id}/return`, token)).status, 200);

        const detail = await get(`/sprints/tasks/${tasks[0].id}`, token);
        assert.equal(detail.body.status, "backlog");
        assert.equal(detail.body.code, "meu codigo");

        // Completing without claiming again is refused.
        assert.equal((await post(`/sprints/tasks/${tasks[0].id}/complete`, token)).status, 409);
    });

    test("the sprint ends when every task is done, with ranking by earliest delivery", async () => {
        const { tasks } = await createSprint();
        const token = await createLoggedInUser();
        await turnFlagOn(token);

        for (const task of tasks) {
            await post(`/sprints/tasks/${task.id}/claim`, token);
            await post(`/sprints/tasks/${task.id}/complete`, token);
        }

        const board = await get("/sprints/current", token);
        assert.equal(board.body.sprint.over, true);
        assert.equal(board.body.sprint.earned, 11);
        assert.equal(board.body.tasks.every((t: { status: string }) => t.status === "done"), true);
    });
});
