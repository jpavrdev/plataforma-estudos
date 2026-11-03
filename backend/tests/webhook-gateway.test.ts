import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { startTestServer } from "./helpers/server.ts";

// Gateway falso no lugar da AbacatePay: responde a consulta de Pix com o estado
// que cada teste definir. O app chega nele pelo ABACATEPAY_API_URL.
const estadoPorCobranca = new Map<string, { status: number; corpo: unknown }>();
const gateway = createServer((req, res) => {
    const id = new URL(req.url ?? "/", "http://gateway").searchParams.get("id") ?? "";
    const resposta = estadoPorCobranca.get(id) ?? { status: 404, corpo: { error: "not found" } };
    res.writeHead(resposta.status, { "content-type": "application/json" });
    res.end(JSON.stringify(resposta.corpo));
});

const pix = (status: "PENDING" | "PAID") => ({
    status: 200,
    corpo: { data: { status, amount: 5000, updatedAt: "2026-11-03T12:00:00.000Z" } },
});

let server: Awaited<ReturnType<typeof startTestServer>>;
let seq = 0;

async function criarAlunoComCobranca() {
    const email = `gw_${++seq}_${Math.round(performance.now() * 1000)}@example.com`;
    await server.request("POST", "/register", {
        body: {
            name: "Aluno Apoiador",
            email,
            username: `gw_${seq}`,
            password: "Senhaforte123!",
            birthDate: "1990-01-01",
            gender: "outro",
            phone: "11999998888",
        },
    });
    const { db } = await import("../db.ts");
    const { subscriptions, users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    const gatewayId = `pix_char_${seq}`;
    const [sub] = await db
        .insert(subscriptions)
        .values({ userId: u.id, plan: "anual", status: "pendente", amountCents: 5000, gatewayId })
        .returning();
    return { sub, gatewayId };
}

async function assinatura(id: string) {
    const { db } = await import("../db.ts");
    const { subscriptions } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return sub;
}

function webhook(evento: string, subscriptionId: string) {
    return fetch(
        `${server.base}/webhooks/abacatepay?webhookSecret=${process.env.ABACATEPAY_WEBHOOK_SECRET}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: evento, data: { metadata: { subscriptionId } } }),
        },
    );
}

before(async () => {
    await new Promise<void>((resolve) => gateway.listen(0, "127.0.0.1", resolve));
    process.env.ABACATEPAY_API_URL = `http://127.0.0.1:${(gateway.address() as AddressInfo).port}`;
    process.env.ABACATEPAY_API_KEY = "chave_de_teste";
    server = await startTestServer();
});
after(async () => {
    await server.close();
    gateway.close();
});
beforeEach(async () => {
    // Importado aqui, e não no topo: o helper carrega o env, que precisa já ter as
    // variáveis do gateway falso definidas no before.
    const { limparBanco } = await import("./helpers/db.ts");
    await limparBanco();
    estadoPorCobranca.clear();
});

describe("webhook de pagamento conferido no gateway", () => {
    test("cobrança que o gateway não deu como paga não ativa o apoio", async (t) => {
        t.mock.method(console, "warn", () => {});
        const { sub, gatewayId } = await criarAlunoComCobranca();
        estadoPorCobranca.set(gatewayId, pix("PENDING"));

        const res = await webhook("billing.paid", sub.id);
        assert.equal(res.status, 200);
        const depois = await assinatura(sub.id);
        assert.equal(depois.status, "pendente");
        assert.equal(depois.paidAt, null);
    });

    test("cobrança paga no gateway ativa o apoio com a data do pagamento", async () => {
        const { sub, gatewayId } = await criarAlunoComCobranca();
        estadoPorCobranca.set(gatewayId, pix("PAID"));

        const res = await webhook("billing.paid", sub.id);
        assert.equal(res.status, 200);
        const depois = await assinatura(sub.id);
        assert.equal(depois.status, "ativa");
        assert.equal(depois.paidAt?.toISOString(), "2026-11-03T12:00:00.000Z");
    });

    test("plano avulso já pago não é estendido por um evento de renovação", async () => {
        const { sub, gatewayId } = await criarAlunoComCobranca();
        estadoPorCobranca.set(gatewayId, pix("PAID"));
        await webhook("billing.paid", sub.id);
        const pago = await assinatura(sub.id);

        await webhook("subscription.renewed", sub.id);
        const depois = await assinatura(sub.id);
        assert.equal(depois.expiresAt?.getTime(), pago.expiresAt?.getTime());
    });

    test("gateway fora do ar devolve erro, para a AbacatePay reenviar depois", async (t) => {
        t.mock.method(console, "error", () => {});
        const { sub, gatewayId } = await criarAlunoComCobranca();
        estadoPorCobranca.set(gatewayId, { status: 500, corpo: { error: "fora" } });

        const res = await webhook("billing.paid", sub.id);
        assert.equal(res.status, 502);
        assert.equal((await assinatura(sub.id)).status, "pendente");
    });
});
