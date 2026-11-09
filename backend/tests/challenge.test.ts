import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;
let seq = 0;

const todayInSaoPaulo = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

const newUser = (over: Record<string, unknown> = {}) => ({
    name: "Aluno Teste",
    email: `aluno_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `aluno_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
    ...over,
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
    return { email: data.email, token: login.body.token as string };
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

const baseChallenge = (over: Record<string, unknown> = {}) => ({
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

describe("challenges - admin", () => {
    test("the admin creates a challenge and gets it back with all the cases", async () => {
        const admin = await createSignedInUser(true);
        const created = await req("POST", "/desafios", admin.token, baseChallenge());
        assert.equal(created.status, 201);
        assert.ok(created.body.id);

        const det = await req("GET", `/admin/desafios/${created.body.id}`, admin.token);
        assert.equal(det.status, 200);
        assert.equal(det.body.tests.length, 2);
        assert.equal(det.body.tests.filter((t: any) => t.isPublic).length, 1);
    });

    test("a regular user cannot create one", async () => {
        const user = await createSignedInUser(false);
        const r = await req("POST", "/desafios", user.token, baseChallenge());
        assert.equal(r.status, 403);
    });

    test("rejects a challenge without any public example", async () => {
        const admin = await createSignedInUser(true);
        const r = await req(
            "POST",
            "/desafios",
            admin.token,
            baseChallenge({
                tests: [{ input: "1", expectedOutput: "1", isPublic: false }],
            }),
        );
        assert.equal(r.status, 400);
    });

    test("rejects two equal active dates", async () => {
        const admin = await createSignedInUser(true);
        const today = todayInSaoPaulo();
        const a = await req("POST", "/desafios", admin.token, baseChallenge({ activeDate: today }));
        assert.equal(a.status, 201);
        const b = await req(
            "POST",
            "/desafios",
            admin.token,
            baseChallenge({ activeDate: today, title: "Outro" }),
        );
        assert.equal(b.status, 409);
    });

    test("updating replaces the test cases", async () => {
        const admin = await createSignedInUser(true);
        const created = await req("POST", "/desafios", admin.token, baseChallenge());
        const updated = await req(
            "PATCH",
            `/desafios/${created.body.id}`,
            admin.token,
            baseChallenge({
                tests: [
                    { input: "1 1\n", expectedOutput: "2", isPublic: true },
                    { input: "2 2\n", expectedOutput: "4", isPublic: true },
                    { input: "9 9\n", expectedOutput: "18", isPublic: false },
                ],
            }),
        );
        assert.equal(updated.status, 200);
        const det = await req("GET", `/admin/desafios/${created.body.id}`, admin.token);
        assert.equal(det.body.tests.length, 3);
    });

    test("deletes the challenge", async () => {
        const admin = await createSignedInUser(true);
        const created = await req("POST", "/desafios", admin.token, baseChallenge());
        const del = await req("DELETE", `/desafios/${created.body.id}`, admin.token);
        assert.equal(del.status, 200);
        const det = await req("GET", `/desafios/${created.body.id}`, admin.token);
        assert.equal(det.status, 404);
    });
});

describe("challenges - student", () => {
    test("the challenge of the day exposes only the public examples", async () => {
        const admin = await createSignedInUser(true);
        await req(
            "POST",
            "/desafios",
            admin.token,
            baseChallenge({ activeDate: todayInSaoPaulo() }),
        );

        const user = await createSignedInUser(false);
        const today = await req("GET", "/desafios/hoje", user.token);
        assert.equal(today.status, 200);
        assert.equal(today.body.isToday, true);
        assert.equal(today.body.exampleTests.length, 1);
        assert.equal(today.body.exampleTests[0].expectedOutput, "5");
        assert.equal(today.body.solved, false);
        // XP derived from the difficulty (easy = 50).
        assert.equal(today.body.xp, 50);
        // The hidden case (input "10 20") must not leak in any field.
        assert.ok(!JSON.stringify(today.body).includes("10 20"));
    });

    test("without a challenge of the day it returns null", async () => {
        const user = await createSignedInUser(false);
        const today = await req("GET", "/desafios/hoje", user.token);
        assert.equal(today.status, 200);
        assert.equal(today.body, null);
    });

    test("the list brings items with status/xp and the user's progress", async () => {
        const admin = await createSignedInUser(true);
        await req(
            "POST",
            "/desafios",
            admin.token,
            baseChallenge({ activeDate: todayInSaoPaulo(), difficulty: "medio" }),
        );
        const user = await createSignedInUser(false);
        const challengeList = await req("GET", "/desafios", user.token);
        assert.equal(challengeList.status, 200);
        assert.equal(challengeList.body.items.length, 1);
        assert.equal(challengeList.body.items[0].status, "todo");
        assert.equal(challengeList.body.items[0].isToday, true);
        assert.equal(challengeList.body.items[0].xp, 80); // médio
        assert.equal(challengeList.body.progress.total, 1);
        assert.equal(challengeList.body.progress.solved, 0);
    });

    test("the detail does not leak hidden cases", async () => {
        const admin = await createSignedInUser(true);
        const created = await req("POST", "/desafios", admin.token, baseChallenge());
        const user = await createSignedInUser(false);
        const det = await req("GET", `/desafios/${created.body.id}`, user.token);
        assert.equal(det.status, 200);
        assert.equal(det.body.exampleTests.length, 1);
        assert.ok(!JSON.stringify(det.body).includes("10 20"));
    });
});
