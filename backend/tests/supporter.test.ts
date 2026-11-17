import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Apoiador",
    email: `apo_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `apo_${seq}`,
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

async function createLoggedInUser(admin = false) {
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
async function patch(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "PATCH",
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}
async function postJson(path: string, body: unknown, token?: string) {
    const res = await fetch(`${server.base}${path}`, {
        method: "POST",
        headers: { ...(token ? auth(token) : {}), "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

// Inserts a pending subscription straight into the database, as if the charge had been created.
async function createPendingSubscription(email: string, plan: "mensal" | "anual" | "pix_auto") {
    const { db } = await import("../db.ts");
    const { subscriptions, users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    const [sub] = await db
        .insert(subscriptions)
        .values({
            userId: u.id,
            plan,
            status: "pendente",
            amountCents: plan === "anual" ? 5000 : 500,
            gatewayId: `gw_${Math.round(performance.now() * 1000)}`,
        })
        .returning();
    return sub;
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

describe("Project support", () => {
    test("without a configured gateway the charge returns 503 and status reports unavailable", async () => {
        const student = await createLoggedInUser();
        const status = await get("/apoie/status", student.token);
        assert.equal(status.body.apoiador, false);
        assert.equal(status.body.disponivel, false);
        const r = await postJson("/apoie/cobranca", { plan: "mensal" }, student.token);
        assert.equal(r.status, 503);
    });

    test("webhook with the wrong secret is rejected; with the right one it activates support and badges", async () => {
        const student = await createLoggedInUser();
        const sub = await createPendingSubscription(student.email, "anual");

        const denied = await postJson("/webhooks/abacatepay?webhookSecret=errado", {
            event: "transparent.completed",
            data: { metadata: { subscriptionId: sub.id } },
        });
        assert.equal(denied.status, 401);

        const ok = await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );
        assert.equal(ok.status, 200);

        const status = await get("/apoie/status", student.token);
        assert.equal(status.body.apoiador, true);
        assert.equal(status.body.plano, "anual");

        const me = await get("/me", student.token);
        assert.equal(me.body.apoiador, true);

        const publicProfile = await get(`/perfis/${student.username}`);
        assert.equal(publicProfile.body.apoiador, true);

        const ranking = await get("/ranking?periodo=all", student.token);
        const row = ranking.body.rows.find((r: any) => r.username === student.username);
        assert.equal(row?.apoiador, true);
    });

    test("custom color requires active support and a hex format", async () => {
        const student = await createLoggedInUser();
        const denied = await patch("/me/accent", student.token, { accent: "#7C3AED" });
        assert.equal(denied.status, 403);

        const sub = await createPendingSubscription(student.email, "mensal");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const invalidFormat = await patch("/me/accent", student.token, { accent: "azul" });
        assert.equal(invalidFormat.status, 400);

        const anyHex = await patch("/me/accent", student.token, { accent: "#123456" });
        assert.equal(anyHex.status, 200);

        const ok = await patch("/me/accent", student.token, { accent: "#7C3AED" });
        assert.equal(ok.status, 200);
        const me = await get("/me", student.token);
        assert.equal(me.body.accent, "#7C3AED");

        const cleared = await patch("/me/accent", student.token, { accent: null });
        assert.equal(cleared.status, 200);
    });

    test("cancelling keeps the benefits until expiry and stops renewals", async () => {
        const student = await createLoggedInUser();
        const sub = await createPendingSubscription(student.email, "anual");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const res = await fetch(`${server.base}/apoie/assinatura`, {
            method: "DELETE",
            headers: auth(student.token),
        });
        assert.equal(res.status, 200);

        const status = await get("/apoie/status", student.token);
        assert.equal(status.body.apoiador, true);
        assert.equal(status.body.cancelada, true);

        const publicProfile = await get(`/perfis/${student.username}`);
        assert.equal(publicProfile.body.apoiador, true);

        const again = await fetch(`${server.base}/apoie/assinatura`, {
            method: "DELETE",
            headers: auth(student.token),
        });
        assert.equal(again.status, 404);
    });

    test("background image is supporters only", async () => {
        const student = await createLoggedInUser();
        const pixel =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        const denied = await postJson("/me/fundo", { image: pixel }, student.token);
        assert.equal(denied.status, 403);

        const sub = await createPendingSubscription(student.email, "mensal");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const ok = await postJson("/me/fundo", { image: pixel }, student.token);
        assert.equal(ok.status, 200);
        assert.match(ok.body.backgroundUrl, /uploads\/fundos/);

        const dim = await patch("/me/fundo", student.token, { dim: 30 });
        assert.equal(dim.status, 200);
        assert.equal(dim.body.backgroundDim, 30);

        const invalidDim = await patch("/me/fundo", student.token, { dim: 150 });
        assert.equal(invalidDim.status, 400);

        const removed = await fetch(`${server.base}/me/fundo`, {
            method: "DELETE",
            headers: auth(student.token),
        });
        assert.equal(removed.status, 200);
    });

    test("subscriptions dashboard is admin only and sums the revenue", async () => {
        const student = await createLoggedInUser();
        const admin = await createLoggedInUser(true);
        const sub = await createPendingSubscription(student.email, "anual");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const denied = await get("/studio/assinaturas", student.token);
        assert.equal(denied.status, 403);

        const r = await get("/studio/assinaturas", admin.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.totais.totalCents, 5000);
        assert.equal(r.body.totais.mesCents, 5000);
        assert.equal(r.body.totais.hojeCents, 5000);
        assert.equal(r.body.totais.apoiadoresAtivos, 1);
        assert.equal(r.body.porDia.length, 1);
        assert.equal(r.body.assinaturas.length, 1);
        assert.equal(r.body.assinaturas[0].plan, "anual");
        assert.equal(r.body.assinaturas[0].status, "ativa");
        assert.ok(r.body.assinaturas[0].paidAt);
        assert.ok(r.body.assinaturas[0].expiresAt);
    });

    test("advanced progress periods fall back to the default without support and unlock with it", async () => {
        const student = await createLoggedInUser();
        const blocked = await get("/me/progresso?periodo=365", student.token);
        assert.equal(blocked.body.periodo.dias, 30);

        const sub = await createPendingSubscription(student.email, "mensal");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const unlocked = await get("/me/progresso?periodo=365", student.token);
        assert.equal(unlocked.body.periodo.dias, 365);
    });
});

describe("Payment security", () => {
    test("every payment endpoint requires login", async () => {
        const routes: [string, string][] = [
            ["GET", "/apoie/status"],
            ["POST", "/apoie/cobranca"],
            ["POST", "/apoie/assinatura"],
            ["DELETE", "/apoie/assinatura"],
            ["PATCH", "/me/accent"],
            ["POST", "/me/fundo"],
            ["PATCH", "/me/fundo"],
            ["DELETE", "/me/fundo"],
            ["GET", "/studio/assinaturas"],
        ];
        for (const [method, path] of routes) {
            const res = await fetch(`${server.base}${path}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: method === "GET" ? undefined : "{}",
            });
            assert.equal(res.status, 401, `${method} ${path} should require login`);
        }
    });

    test("webhook without a secret is rejected and a malicious payload does not crash it", async () => {
        const noSecret = await postJson("/webhooks/abacatepay", { event: "billing.paid" });
        assert.equal(noSecret.status, 401);

        const malicious = await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            {
                event: "billing.paid",
                data: {
                    pixQrCode: { id: "pix' OR '1'='1; DROP TABLE subscriptions;--" },
                    metadata: { subscriptionId: "../../etc/passwd" },
                },
            },
        );
        assert.equal(malicious.status, 200);
        assert.equal(malicious.body.ok, true);
    });

    test("payment webhook redelivery does not extend the subscription", async () => {
        const student = await createLoggedInUser();
        const sub = await createPendingSubscription(student.email, "mensal");
        const fire = () =>
            postJson(
                `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
                {
                    event: "transparent.completed",
                    data: { metadata: { subscriptionId: sub.id } },
                },
            );
        await fire();
        const before = await get("/apoie/status", student.token);
        await new Promise((r) => setTimeout(r, 30));
        await fire();
        const after = await get("/apoie/status", student.token);
        assert.equal(before.body.apoiador, true);
        assert.equal(after.body.expiresAt, before.body.expiresAt);
    });

    test("a burst of pending charges is blocked with 429", async () => {
        const student = await createLoggedInUser();
        for (let i = 0; i < 3; i++) await createPendingSubscription(student.email, "mensal");
        const r = await postJson("/apoie/cobranca", { plan: "mensal" }, student.token);
        assert.equal(r.status, 429);
    });

    test("oversized body and invalid plan are rejected", async () => {
        const student = await createLoggedInUser();
        const oversized = await fetch(`${server.base}/apoie/cobranca`, {
            method: "POST",
            headers: { ...auth(student.token), "Content-Type": "application/json" },
            body: JSON.stringify({ plan: "mensal", junk: "x".repeat(200 * 1024) }),
        });
        assert.equal(oversized.status, 413);

        const invalid = await postJson("/apoie/cobranca", { plan: "vitalicio" }, student.token);
        assert.equal(invalid.status, 400);
    });

    test("public profile does not leak subscription details", async () => {
        const student = await createLoggedInUser();
        const sub = await createPendingSubscription(student.email, "anual");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            {
                event: "transparent.completed",
                data: { metadata: { subscriptionId: sub.id } },
            },
        );
        const publicProfile = await get(`/perfis/${student.username}`);
        assert.equal(publicProfile.body.apoiador, true);
        assert.equal(publicProfile.body.plano, undefined);
        assert.equal(publicProfile.body.expiresAt, undefined);
        assert.equal(publicProfile.body.email, undefined);
    });
});
