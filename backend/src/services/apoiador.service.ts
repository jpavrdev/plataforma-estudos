import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gt, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "../../db.ts";
import { subscriptions, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { env } from "../config/env.ts";
import {
    gatewayConfigurado,
    criarPixTransparente,
    criarCheckoutAssinatura,
    consultarPixQrCode,
    PIX_TTL_SEGUNDOS,
} from "./abacatepay.client.ts";

export const PLANOS = {
    mensal: { valorCents: 500, dias: 30, descricao: "Apoio mensal ao Ensina Dev" },
    anual: { valorCents: 5000, dias: 365, descricao: "Apoio anual ao Ensina Dev" },
    pix_auto: { valorCents: 500, dias: 30, descricao: "Apoio mensal recorrente ao Ensina Dev" },
} as const;

export const ACCENTS = ["#2D6BF5", "#7C3AED", "#DB2777", "#E0532F", "#1C8F5A", "#B7791F"];

// Cancelada com validade futura ainda conta: o período pago vale até o fim.
export async function apoiadorAtivo(userId: string): Promise<boolean> {
    const [linha] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, userId),
                inArray(subscriptions.status, ["ativa", "cancelada"]),
                gt(subscriptions.expiresAt, new Date()),
            ),
        )
        .limit(1);
    return Boolean(linha);
}

// Conjunto de apoiadores ativos, para marcar o selo em listas (ranking, perfis).
export async function apoiadoresAtivos(): Promise<Set<string>> {
    const linhas = await db
        .selectDistinct({ userId: subscriptions.userId })
        .from(subscriptions)
        .where(
            and(
                inArray(subscriptions.status, ["ativa", "cancelada"]),
                gt(subscriptions.expiresAt, new Date()),
            ),
        );
    return new Set(linhas.map((l) => l.userId));
}

// Marca o apoio como pago e calcula até quando vale. Renovação estende a partir
// do vencimento atual; pagamento novo conta da data em que o dinheiro entrou.
async function ativarAssinatura(
    alvo: {
        id: string;
        plan: keyof typeof PLANOS;
        paidAt: Date | null;
        expiresAt: Date | null;
    },
    pagoEm: Date,
    renovacao = false,
) {
    const base = renovacao && alvo.expiresAt && alvo.expiresAt > pagoEm ? alvo.expiresAt : pagoEm;
    const expiresAt = new Date(base.getTime() + PLANOS[alvo.plan].dias * 86400000);
    // Fora de renovação, exigir paid_at nulo torna a ativação idempotente: o
    // webhook e a consulta ao gateway podem chegar juntos sem se atropelar.
    const condicoes = [eq(subscriptions.id, alvo.id)];
    if (!renovacao) condicoes.push(isNull(subscriptions.paidAt));
    await db
        .update(subscriptions)
        .set({ status: "ativa", paidAt: alvo.paidAt ?? pagoEm, expiresAt })
        .where(and(...condicoes));
}

// Pergunta ao gateway se as cobranças que ainda estão pendentes aqui já foram
// pagas. O webhook é o caminho rápido, e este é o que garante que um webhook
// perdido não deixe quem pagou sem o apoio. Só consulta cobrança que ainda pode
// ser paga, para não bater no gateway a cada abertura da página.
export async function confirmarPagamentosPendentes(userId: string) {
    if (!gatewayConfigurado()) return;
    const pendentes = await db
        .select()
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, "pendente"),
                isNull(subscriptions.paidAt),
                isNotNull(subscriptions.gatewayId),
                gt(subscriptions.createdAt, new Date(Date.now() - PIX_TTL_SEGUNDOS * 1000)),
            ),
        );
    for (const pendente of pendentes) {
        try {
            const cobranca = await consultarPixQrCode(pendente.gatewayId!);
            if (cobranca.pago) await ativarAssinatura(pendente, cobranca.pagoEm ?? new Date());
        } catch (err) {
            // Gateway fora do ar não pode derrubar a tela de apoio: a próxima
            // consulta ou o webhook resolvem.
            console.error("Falha ao confirmar cobrança no gateway:", pendente.gatewayId, err);
        }
    }
}

export async function statusApoio(userId: string) {
    await confirmarPagamentosPendentes(userId);
    const [ativa] = await db
        .select({
            plan: subscriptions.plan,
            status: subscriptions.status,
            expiresAt: subscriptions.expiresAt,
        })
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, userId),
                inArray(subscriptions.status, ["ativa", "cancelada"]),
                gt(subscriptions.expiresAt, new Date()),
            ),
        )
        .orderBy(desc(subscriptions.expiresAt))
        .limit(1);
    return {
        apoiador: Boolean(ativa),
        plano: ativa?.plan ?? null,
        expiresAt: ativa?.expiresAt ?? null,
        cancelada: ativa?.status === "cancelada",
        disponivel: gatewayConfigurado(),
        pixAutomatico: Boolean(env.ABACATEPAY_PRODUCT_PIX_AUTO),
    };
}

export async function criarCobranca(userId: string, plan: "mensal" | "anual") {
    const [pendentes] = await db
        .select({ n: count() })
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, "pendente"),
                isNotNull(subscriptions.gatewayId),
                gt(subscriptions.createdAt, new Date(Date.now() - 3600000)),
            ),
        );
    if (Number(pendentes?.n ?? 0) >= 3) {
        throw new AppError(429, "Muitas cobranças geradas. Aguarde um pouco e tente de novo.");
    }
    if (!gatewayConfigurado()) {
        throw new AppError(503, "O apoio ainda não está disponível. Volte em breve!");
    }
    // O id nasce aqui para viajar no metadata da cobrança, e a linha só é gravada
    // depois que o gateway responde. Assim uma falha na criação do Pix não deixa
    // pendência órfã, que além de sujar o histórico contaria contra o limite acima.
    const id = randomUUID();
    const pix = await criarPixTransparente(PLANOS[plan].valorCents, PLANOS[plan].descricao, {
        subscriptionId: id,
    });
    await db.insert(subscriptions).values({
        id,
        userId,
        plan,
        status: "pendente",
        amountCents: PLANOS[plan].valorCents,
        gatewayId: pix.gatewayId || null,
    });

    return {
        subscriptionId: id,
        valorCents: PLANOS[plan].valorCents,
        brCode: pix.brCode,
        brCodeBase64: pix.brCodeBase64,
    };
}

export async function criarAssinaturaRecorrente(userId: string) {
    if (!gatewayConfigurado() || !env.ABACATEPAY_PRODUCT_PIX_AUTO) {
        throw new AppError(503, "O Pix Automático ainda não está disponível. Use o plano mensal ou anual.");
    }
    const id = randomUUID();
    const checkout = await criarCheckoutAssinatura(
        env.ABACATEPAY_PRODUCT_PIX_AUTO,
        `${env.FRONTEND_URL}/apoie`,
        `${env.FRONTEND_URL}/apoie?pago=1`,
        id,
    );
    await db.insert(subscriptions).values({
        id,
        userId,
        plan: "pix_auto",
        status: "pendente",
        amountCents: PLANOS.pix_auto.valorCents,
        gatewayId: checkout.gatewayId || null,
    });

    return { url: checkout.url };
}

// Caça o identificador da nossa assinatura no payload, que muda de formato por evento.
function extrairReferencias(payload: Record<string, unknown>): string[] {
    const refs: string[] = [];
    const visitar = (v: unknown) => {
        if (!v || typeof v !== "object") return;
        const o = v as Record<string, unknown>;
        if (typeof o.subscriptionId === "string") refs.push(o.subscriptionId);
        if (typeof o.externalId === "string") refs.push(o.externalId);
        if (typeof o.id === "string") refs.push(o.id);
        for (const chave of [
            "metadata",
            "data",
            "pixQrCode",
            "transparent",
            "checkout",
            "subscription",
            "billing",
        ]) {
            visitar(o[chave]);
        }
    };
    visitar(payload);
    return refs;
}

const EVENTOS_PAGAMENTO = new Set([
    "transparent.completed",
    "checkout.completed",
    "billing.paid",
    "subscription.completed",
    "subscription.renewed",
]);

export async function processarWebhook(payload: Record<string, unknown>) {
    const evento = String(payload.event ?? payload.type ?? "");
    const refs = extrairReferencias(payload);
    if (refs.length === 0) {
        console.warn("Webhook do gateway sem referência reconhecível:", evento);
        return { ok: true };
    }

    const uuids = refs.filter((r) => /^[0-9a-f-]{36}$/i.test(r));
    const condicoes = [inArray(subscriptions.gatewayId, refs)];
    if (uuids.length > 0) condicoes.push(inArray(subscriptions.id, uuids));
    const candidatas = await db
        .select()
        .from(subscriptions)
        .where(or(...condicoes));
    const alvo = candidatas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (!alvo) {
        console.warn("Webhook do gateway sem assinatura correspondente:", evento, refs.join(","));
        return { ok: true };
    }

    if (EVENTOS_PAGAMENTO.has(evento)) {
        const renovacao = evento === "subscription.renewed";
        if (alvo.paidAt && !renovacao) {
            return { ok: true };
        }
        await ativarAssinatura(alvo, new Date(), renovacao);
    } else if (evento === "subscription.cancelled") {
        await db
            .update(subscriptions)
            .set({ status: "cancelada" })
            .where(eq(subscriptions.id, alvo.id));
    } else {
        console.warn("Webhook do gateway com evento não tratado:", evento);
    }
    return { ok: true };
}

export async function definirAccent(userId: string, accent: string | null) {
    if (accent !== null && !(await apoiadorAtivo(userId))) {
        throw new AppError(403, "Cores personalizadas são um benefício de apoiador.");
    }
    await db.update(users).set({ accent }).where(eq(users.id, userId));
    return { accent };
}

// Cancela o que estiver valendo: nada renova, e o período já pago segue até o fim.
export async function cancelarApoio(userId: string) {
    const canceladas = await db
        .update(subscriptions)
        .set({ status: "cancelada" })
        .where(
            and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, "ativa"),
                gt(subscriptions.expiresAt, new Date()),
            ),
        )
        .returning({ plan: subscriptions.plan, expiresAt: subscriptions.expiresAt });
    if (canceladas.length === 0) {
        throw new AppError(404, "Você não tem uma assinatura ativa.");
    }
    const pixAuto = canceladas.some((c) => c.plan === "pix_auto");
    const expiresAt = canceladas
        .map((c) => c.expiresAt)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];
    return { ok: true, expiresAt: expiresAt ?? null, pixAuto };
}

export async function definirVeuFundo(userId: string, dim: number) {
    if (!(await apoiadorAtivo(userId))) {
        throw new AppError(403, "Imagem de fundo é um benefício de apoiador.");
    }
    await db.update(users).set({ backgroundDim: dim }).where(eq(users.id, userId));
    return { backgroundDim: dim };
}

const TZ_SP = "America/Sao_Paulo";
const diaSP = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ_SP });

// Visão do admin: quem paga, quando começou e termina, e o recebido por período.
export async function assinaturasAdmin() {
    const linhas = await db
        .select({
            id: subscriptions.id,
            plan: subscriptions.plan,
            status: subscriptions.status,
            amountCents: subscriptions.amountCents,
            paidAt: subscriptions.paidAt,
            expiresAt: subscriptions.expiresAt,
            createdAt: subscriptions.createdAt,
            name: users.name,
            email: users.email,
            username: users.username,
        })
        .from(subscriptions)
        .innerJoin(users, eq(users.id, subscriptions.userId))
        .orderBy(desc(subscriptions.createdAt));

    const agora = new Date();
    const hoje = diaSP(agora);
    const pagas = linhas.filter((l) => l.paidAt !== null);
    const janela = (dias: number) =>
        pagas.filter((l) => l.paidAt! >= new Date(agora.getTime() - dias * 86400000));
    const soma = (arr: { amountCents: number }[]) => arr.reduce((t, l) => t + l.amountCents, 0);

    const porDiaMapa = new Map<string, number>();
    for (const l of pagas) {
        const d = diaSP(l.paidAt!);
        porDiaMapa.set(d, (porDiaMapa.get(d) ?? 0) + l.amountCents);
    }
    const porDia = [...porDiaMapa.entries()]
        .map(([d, cents]) => ({ d, cents }))
        .sort((a, b) => (a.d < b.d ? -1 : 1));

    const ativosSet = new Set(
        linhas
            .filter(
                (l) =>
                    (l.status === "ativa" || l.status === "cancelada") &&
                    l.expiresAt !== null &&
                    l.expiresAt > agora,
            )
            .map((l) => l.email),
    );

    return {
        totais: {
            hojeCents: soma(pagas.filter((l) => diaSP(l.paidAt!) === hoje)),
            semanaCents: soma(janela(7)),
            mesCents: soma(janela(30)),
            totalCents: soma(pagas),
            apoiadoresAtivos: ativosSet.size,
            pagamentos: pagas.length,
        },
        porDia,
        assinaturas: linhas,
    };
}
