import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Aluno Apoiador",
    email: `apo_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `apo_${seq}`,
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
    return { email: dados.email, username: dados.username, token: login.body.token };
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

// Cria uma assinatura pendente direto no banco, como se a cobrança tivesse sido gerada.
async function criarPendente(email: string, plan: "mensal" | "anual" | "pix_auto") {
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

describe("Apoio ao projeto", () => {
    test("sem gateway configurado a cobrança responde 503 e o status diz indisponível", async () => {
        const aluno = await criarUsuarioLogado();
        const status = await get("/apoie/status", aluno.token);
        assert.equal(status.body.apoiador, false);
        assert.equal(status.body.disponivel, false);
        const r = await postJson("/apoie/cobranca", { plan: "mensal" }, aluno.token);
        assert.equal(r.status, 503);
    });

    test("webhook com segredo errado é rejeitado; com o certo ativa o apoio e os selos", async () => {
        const aluno = await criarUsuarioLogado();
        const sub = await criarPendente(aluno.email, "anual");

        const negado = await postJson("/webhooks/abacatepay?webhookSecret=errado", {
            event: "transparent.completed",
            data: { metadata: { subscriptionId: sub.id } },
        });
        assert.equal(negado.status, 401);

        const ok = await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );
        assert.equal(ok.status, 200);

        const status = await get("/apoie/status", aluno.token);
        assert.equal(status.body.apoiador, true);
        assert.equal(status.body.plano, "anual");

        const me = await get("/me", aluno.token);
        assert.equal(me.body.apoiador, true);

        const publico = await get(`/perfis/${aluno.username}`);
        assert.equal(publico.body.apoiador, true);

        const ranking = await get("/ranking?periodo=all", aluno.token);
        const linha = ranking.body.rows.find((r: any) => r.username === aluno.username);
        assert.equal(linha?.apoiador, true);
    });

    test("cor personalizada exige apoio ativo e formato hex", async () => {
        const aluno = await criarUsuarioLogado();
        const negado = await patch("/me/accent", aluno.token, { accent: "#7C3AED" });
        assert.equal(negado.status, 403);

        const sub = await criarPendente(aluno.email, "mensal");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const formatoInvalido = await patch("/me/accent", aluno.token, { accent: "azul" });
        assert.equal(formatoInvalido.status, 400);

        const hexLivre = await patch("/me/accent", aluno.token, { accent: "#123456" });
        assert.equal(hexLivre.status, 200);

        const ok = await patch("/me/accent", aluno.token, { accent: "#7C3AED" });
        assert.equal(ok.status, 200);
        const me = await get("/me", aluno.token);
        assert.equal(me.body.accent, "#7C3AED");

        const limpar = await patch("/me/accent", aluno.token, { accent: null });
        assert.equal(limpar.status, 200);
    });

    test("cancelar mantém os benefícios até o vencimento e para de renovar", async () => {
        const aluno = await criarUsuarioLogado();
        const sub = await criarPendente(aluno.email, "anual");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const res = await fetch(`${server.base}/apoie/assinatura`, {
            method: "DELETE",
            headers: auth(aluno.token),
        });
        assert.equal(res.status, 200);

        const status = await get("/apoie/status", aluno.token);
        assert.equal(status.body.apoiador, true);
        assert.equal(status.body.cancelada, true);

        const publico = await get(`/perfis/${aluno.username}`);
        assert.equal(publico.body.apoiador, true);

        const denovo = await fetch(`${server.base}/apoie/assinatura`, {
            method: "DELETE",
            headers: auth(aluno.token),
        });
        assert.equal(denovo.status, 404);
    });

    test("imagem de fundo é só para apoiador", async () => {
        const aluno = await criarUsuarioLogado();
        const pixel =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
        const negado = await postJson("/me/fundo", { image: pixel }, aluno.token);
        assert.equal(negado.status, 403);

        const sub = await criarPendente(aluno.email, "mensal");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const ok = await postJson("/me/fundo", { image: pixel }, aluno.token);
        assert.equal(ok.status, 200);
        assert.match(ok.body.backgroundUrl, /uploads\/fundos/);

        const veu = await patch("/me/fundo", aluno.token, { dim: 30 });
        assert.equal(veu.status, 200);
        assert.equal(veu.body.backgroundDim, 30);

        const veuInvalido = await patch("/me/fundo", aluno.token, { dim: 150 });
        assert.equal(veuInvalido.status, 400);

        const remover = await fetch(`${server.base}/me/fundo`, {
            method: "DELETE",
            headers: auth(aluno.token),
        });
        assert.equal(remover.status, 200);
    });

    test("painel de assinaturas é do admin e soma o recebido", async () => {
        const aluno = await criarUsuarioLogado();
        const admin = await criarUsuarioLogado(true);
        const sub = await criarPendente(aluno.email, "anual");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const negado = await get("/studio/assinaturas", aluno.token);
        assert.equal(negado.status, 403);

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

    test("períodos avançados do progresso caem no padrão sem apoio e liberam com apoio", async () => {
        const aluno = await criarUsuarioLogado();
        const bloqueado = await get("/me/progresso?periodo=365", aluno.token);
        assert.equal(bloqueado.body.periodo.dias, 30);

        const sub = await criarPendente(aluno.email, "mensal");
        await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            { event: "transparent.completed", data: { metadata: { subscriptionId: sub.id } } },
        );

        const liberado = await get("/me/progresso?periodo=365", aluno.token);
        assert.equal(liberado.body.periodo.dias, 365);
    });
});

describe("Segurança dos pagamentos", () => {
    test("todos os endpoints de pagamento exigem login", async () => {
        const rotas: [string, string][] = [
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
        for (const [method, path] of rotas) {
            const res = await fetch(`${server.base}${path}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: method === "GET" ? undefined : "{}",
            });
            assert.equal(res.status, 401, `${method} ${path} deveria exigir login`);
        }
    });

    test("webhook sem segredo é rejeitado e payload malicioso não derruba", async () => {
        const semSegredo = await postJson("/webhooks/abacatepay", { event: "billing.paid" });
        assert.equal(semSegredo.status, 401);

        const malicioso = await postJson(
            `/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
            {
                event: "billing.paid",
                data: {
                    pixQrCode: { id: "pix' OR '1'='1; DROP TABLE subscriptions;--" },
                    metadata: { subscriptionId: "../../etc/passwd" },
                },
            },
        );
        assert.equal(malicioso.status, 200);
        assert.equal(malicioso.body.ok, true);
    });

    test("reentrega do webhook de pagamento não estende a assinatura", async () => {
        const aluno = await criarUsuarioLogado();
        const sub = await criarPendente(aluno.email, "mensal");
        const disparo = () =>
            postJson(`/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`, {
                event: "transparent.completed",
                data: { metadata: { subscriptionId: sub.id } },
            });
        await disparo();
        const antes = await get("/apoie/status", aluno.token);
        await new Promise((r) => setTimeout(r, 30));
        await disparo();
        const depois = await get("/apoie/status", aluno.token);
        assert.equal(antes.body.apoiador, true);
        assert.equal(depois.body.expiresAt, antes.body.expiresAt);
    });

    test("rajada de cobranças pendentes é bloqueada com 429", async () => {
        const aluno = await criarUsuarioLogado();
        for (let i = 0; i < 3; i++) await criarPendente(aluno.email, "mensal");
        const r = await postJson("/apoie/cobranca", { plan: "mensal" }, aluno.token);
        assert.equal(r.status, 429);
    });

    test("body gigante e plano inválido são rejeitados", async () => {
        const aluno = await criarUsuarioLogado();
        const gigante = await fetch(`${server.base}/apoie/cobranca`, {
            method: "POST",
            headers: { ...auth(aluno.token), "Content-Type": "application/json" },
            body: JSON.stringify({ plan: "mensal", lixo: "x".repeat(200 * 1024) }),
        });
        assert.equal(gigante.status, 413);

        const invalido = await postJson("/apoie/cobranca", { plan: "vitalicio" }, aluno.token);
        assert.equal(invalido.status, 400);
    });

    test("perfil público não vaza detalhes da assinatura", async () => {
        const aluno = await criarUsuarioLogado();
        const sub = await criarPendente(aluno.email, "anual");
        await postJson(`/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`, {
            event: "transparent.completed",
            data: { metadata: { subscriptionId: sub.id } },
        });
        const publico = await get(`/perfis/${aluno.username}`);
        assert.equal(publico.body.apoiador, true);
        assert.equal(publico.body.plano, undefined);
        assert.equal(publico.body.expiresAt, undefined);
        assert.equal(publico.body.email, undefined);
    });
});
