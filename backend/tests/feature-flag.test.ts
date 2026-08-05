import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Aluno Beta",
    email: `flag_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `flag_${seq}`,
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

async function criarUsuarioLogado() {
    const dados = novoUsuario();
    await server.request("POST", "/register", { body: dados });
    await ajustarUsuario(dados.email, { emailVerifiedAt: new Date() });
    const login = await server.request("POST", "/login", {
        body: { email: dados.email, password: dados.password },
    });
    return { email: dados.email, token: login.body.token };
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
}
async function get(path: string, token?: string) {
    const res = await fetch(`${server.base}${path}`, { headers: token ? auth(token) : {} });
    return { status: res.status, body: await res.json().catch(() => null) };
}

async function criarFlag(key: string, status: "off" | "beta" | "on") {
    const { db } = await import("../db.ts");
    const { featureFlags } = await import("../schema.ts");
    const [flag] = await db
        .insert(featureFlags)
        .values({ key, description: "Flag de teste", status })
        .returning();
    return flag;
}

async function idPorEmail(email: string) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    return u.id;
}

async function liberar(flagId: string, email: string) {
    const { db } = await import("../db.ts");
    const { featureFlagUsers } = await import("../schema.ts");
    await db.insert(featureFlagUsers).values({ flagId, userId: await idPorEmail(email) });
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
    test("sem flags o /me vem com features vazio", async () => {
        const aluno = await criarUsuarioLogado();
        const me = await get("/me", aluno.token);
        assert.equal(me.status, 200);
        assert.deepEqual(me.body.features, []);
    });

    test("flag on aparece no /me de qualquer usuário", async () => {
        await criarFlag("recurso-novo", "on");
        const aluno = await criarUsuarioLogado();
        const me = await get("/me", aluno.token);
        assert.deepEqual(me.body.features, ["recurso-novo"]);
    });

    test("flag beta só aparece pra quem está na allowlist", async () => {
        const flag = await criarFlag("recurso-novo", "beta");
        const dentro = await criarUsuarioLogado();
        const fora = await criarUsuarioLogado();
        await liberar(flag.id, dentro.email);

        const meDentro = await get("/me", dentro.token);
        const meFora = await get("/me", fora.token);
        assert.deepEqual(meDentro.body.features, ["recurso-novo"]);
        assert.deepEqual(meFora.body.features, []);
    });

    test("flag off esconde até de quem está na allowlist (kill switch)", async () => {
        const flag = await criarFlag("recurso-novo", "off");
        const aluno = await criarUsuarioLogado();
        await liberar(flag.id, aluno.email);

        const me = await get("/me", aluno.token);
        assert.deepEqual(me.body.features, []);
    });

    test("temFeature segue a mesma régua do /me", async () => {
        const { temFeature } = await import("../src/services/feature-flag.service.ts");
        const flag = await criarFlag("recurso-novo", "beta");
        const aluno = await criarUsuarioLogado();
        const uid = await idPorEmail(aluno.email);

        assert.equal(await temFeature(uid, "recurso-novo"), false);
        await liberar(flag.id, aluno.email);
        assert.equal(await temFeature(uid, "recurso-novo"), true);
        assert.equal(await temFeature(uid, "flag-inexistente"), false);
    });
});
