import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Beta",
    email: `flag_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `flag_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function updateUserFields(email: string, fields: Record<string, unknown>) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set(fields).where(eq(users.email, email));
}

async function createLoggedInUser() {
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await updateUserFields(data.email, { emailVerifiedAt: new Date() });
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { email: data.email, token: login.body.token };
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
}
async function get(path: string, token?: string) {
    const res = await fetch(`${server.base}${path}`, { headers: token ? auth(token) : {} });
    return { status: res.status, body: await res.json().catch(() => null) };
}

async function createFlag(key: string, status: "off" | "beta" | "on") {
    const { db } = await import("../db.ts");
    const { featureFlags } = await import("../schema.ts");
    const [flag] = await db
        .insert(featureFlags)
        .values({ key, description: "Flag de teste", status })
        .returning();
    return flag;
}

async function idByEmail(email: string) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    return user.id;
}

async function allowFlag(flagId: string, email: string) {
    const { db } = await import("../db.ts");
    const { featureFlagUsers } = await import("../schema.ts");
    await db.insert(featureFlagUsers).values({ flagId, userId: await idByEmail(email) });
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

describe("Feature flags", () => {
    test("with no flags /me returns an empty features list", async () => {
        const student = await createLoggedInUser();
        const me = await get("/me", student.token);
        assert.equal(me.status, 200);
        assert.deepEqual(me.body.features, []);
    });

    test("an on flag shows up in any user's /me", async () => {
        await createFlag("recurso-novo", "on");
        const student = await createLoggedInUser();
        const me = await get("/me", student.token);
        assert.deepEqual(me.body.features, ["recurso-novo"]);
    });

    test("a beta flag only shows up for allowlisted users", async () => {
        const flag = await createFlag("recurso-novo", "beta");
        const inside = await createLoggedInUser();
        const outside = await createLoggedInUser();
        await allowFlag(flag.id, inside.email);

        const meInside = await get("/me", inside.token);
        const meOutside = await get("/me", outside.token);
        assert.deepEqual(meInside.body.features, ["recurso-novo"]);
        assert.deepEqual(meOutside.body.features, []);
    });

    test("an off flag hides even from allowlisted users (kill switch)", async () => {
        const flag = await createFlag("recurso-novo", "off");
        const student = await createLoggedInUser();
        await allowFlag(flag.id, student.email);

        const me = await get("/me", student.token);
        assert.deepEqual(me.body.features, []);
    });

    test("hasFeature follows the same rule as /me", async () => {
        const { hasFeature } = await import("../src/services/feature-flag.service.ts");
        const flag = await createFlag("recurso-novo", "beta");
        const student = await createLoggedInUser();
        const uid = await idByEmail(student.email);

        assert.equal(await hasFeature(uid, "recurso-novo"), false);
        await allowFlag(flag.id, student.email);
        assert.equal(await hasFeature(uid, "recurso-novo"), true);
        assert.equal(await hasFeature(uid, "flag-inexistente"), false);
    });
});
