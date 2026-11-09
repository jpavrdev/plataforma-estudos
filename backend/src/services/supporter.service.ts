import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gt, lt, inArray, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "../../db.ts";
import { subscriptions, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { env } from "../config/env.ts";
import {
    gatewayConfigured,
    createTransparentPix,
    createSubscriptionCheckout,
    queryPixQrCode,
    PIX_TTL_SECONDS,
} from "./abacatepay.client.ts";

export const PLANS = {
    mensal: { priceCents: 500, days: 30, description: "Apoio mensal ao Ensina Dev" },
    trimestral: { priceCents: 1400, days: 90, description: "Apoio trimestral ao Ensina Dev" },
    anual: { priceCents: 5000, days: 365, description: "Apoio anual ao Ensina Dev" },
    pix_auto: { priceCents: 500, days: 30, description: "Apoio mensal recorrente ao Ensina Dev" },
} as const;

// Plans the user picks on the screen; pix_auto comes from a separate flow.
export type SinglePlan = "mensal" | "trimestral" | "anual";

export const ACCENTS = ["#2D6BF5", "#7C3AED", "#DB2777", "#E0532F", "#1C8F5A", "#B7791F"];

// Cancelled with a future expiry still counts: the paid period lasts until the end.
export async function supportActive(userId: string): Promise<boolean> {
    const [row] = await db
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
    return Boolean(row);
}

// Set of active supporters, to badge them in lists (ranking, profiles).
export async function activeSupporters(): Promise<Set<string>> {
    const rows = await db
        .selectDistinct({ userId: subscriptions.userId })
        .from(subscriptions)
        .where(
            and(
                inArray(subscriptions.status, ["ativa", "cancelada"]),
                gt(subscriptions.expiresAt, new Date()),
            ),
        );
    return new Set(rows.map((r) => r.userId));
}

// Marks the support as paid and computes how long it lasts. A renewal extends
// from the current expiry; a new payment counts from the date the money came in.
async function activateSubscription(
    target: {
        id: string;
        plan: keyof typeof PLANS;
        paidAt: Date | null;
        expiresAt: Date | null;
    },
    paidOn: Date,
    renewal = false,
) {
    const base =
        renewal && target.expiresAt && target.expiresAt > paidOn ? target.expiresAt : paidOn;
    const expiresAt = new Date(base.getTime() + PLANS[target.plan].days * 86400000);
    // Outside a renewal, requiring a null paid_at makes activation idempotent:
    // the webhook and the gateway poll can arrive together without a race.
    const conditions = [eq(subscriptions.id, target.id)];
    if (!renewal) conditions.push(isNull(subscriptions.paidAt));
    await db
        .update(subscriptions)
        .set({ status: "ativa", paidAt: target.paidAt ?? paidOn, expiresAt })
        .where(and(...conditions));
}

// Asks the gateway whether charges still pending here were already paid. The
// webhook is the fast path; this is what guarantees a lost webhook does not
// leave someone who paid without their support. Only queries charges that can
// still be paid, to avoid hitting the gateway on every page load.
export async function confirmPendingPayments(userId: string) {
    if (!gatewayConfigured()) return;
    const pending = await db
        .select()
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, "pendente"),
                isNull(subscriptions.paidAt),
                isNotNull(subscriptions.gatewayId),
                gt(subscriptions.createdAt, new Date(Date.now() - PIX_TTL_SECONDS * 1000)),
            ),
        );
    for (const row of pending) {
        try {
            const charge = await queryPixQrCode(row.gatewayId!);
            if (charge.paid) await activateSubscription(row, charge.paidAt ?? new Date());
        } catch (err) {
            // A gateway outage must not take down the support page: the next
            // poll or the webhook sorts it out.
            console.error("Failed to confirm charge with the gateway:", row.gatewayId, err);
        }
    }
}

export async function supportStatus(userId: string) {
    await confirmPendingPayments(userId);
    const [active] = await db
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
        apoiador: Boolean(active),
        plano: active?.plan ?? null,
        expiresAt: active?.expiresAt ?? null,
        cancelada: active?.status === "cancelada",
        disponivel: gatewayConfigured(),
        pixAutomatico: Boolean(env.ABACATEPAY_PRODUCT_PIX_AUTO),
    };
}

export async function insertCharge(userId: string, plan: SinglePlan) {
    const [open] = await db
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
    if (Number(open?.n ?? 0) >= 3) {
        throw new AppError(429, "support.tooManyCharges");
    }
    if (!gatewayConfigured()) {
        throw new AppError(503, "support.unavailable");
    }
    // The id is born here so it can travel in the charge metadata, and the row
    // is only written after the gateway responds. That way a failure creating
    // the Pix leaves no orphan pending row, which besides dirtying the history
    // would count against the limit above.
    const id = randomUUID();
    const pix = await createTransparentPix(PLANS[plan].priceCents, PLANS[plan].description, {
        subscriptionId: id,
    });
    await db.insert(subscriptions).values({
        id,
        userId,
        plan,
        status: "pendente",
        amountCents: PLANS[plan].priceCents,
        gatewayId: pix.gatewayId || null,
    });

    return {
        subscriptionId: id,
        valorCents: PLANS[plan].priceCents,
        brCode: pix.brCode,
        brCodeBase64: pix.brCodeBase64,
    };
}

export async function insertRecurringSubscription(userId: string) {
    if (!gatewayConfigured() || !env.ABACATEPAY_PRODUCT_PIX_AUTO) {
        throw new AppError(503, "support.pixAutoUnavailable");
    }
    const id = randomUUID();
    const checkout = await createSubscriptionCheckout(
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
        amountCents: PLANS.pix_auto.priceCents,
        gatewayId: checkout.gatewayId || null,
    });

    return { url: checkout.url };
}

// Hunts for our subscription identifier in the payload, which changes shape per event.
function extractReferences(payload: Record<string, unknown>): string[] {
    const refs: string[] = [];
    const visit = (v: unknown) => {
        if (!v || typeof v !== "object") return;
        const o = v as Record<string, unknown>;
        if (typeof o.subscriptionId === "string") refs.push(o.subscriptionId);
        if (typeof o.externalId === "string") refs.push(o.externalId);
        if (typeof o.id === "string") refs.push(o.id);
        for (const key of [
            "metadata",
            "data",
            "pixQrCode",
            "transparent",
            "checkout",
            "subscription",
            "billing",
        ]) {
            visit(o[key]);
        }
    };
    visit(payload);
    return refs;
}

const PAYMENT_EVENTS = new Set([
    "transparent.completed",
    "checkout.completed",
    "billing.paid",
    "subscription.completed",
    "subscription.renewed",
]);

export async function processWebhook(payload: Record<string, unknown>) {
    const event = String(payload.event ?? payload.type ?? "");
    const refs = extractReferences(payload);
    if (refs.length === 0) {
        console.warn("Gateway webhook without a recognizable reference:", event);
        return { ok: true };
    }

    const uuids = refs.filter((r) => /^[0-9a-f-]{36}$/i.test(r));
    const conditions = [inArray(subscriptions.gatewayId, refs)];
    if (uuids.length > 0) conditions.push(inArray(subscriptions.id, uuids));
    const candidates = await db
        .select()
        .from(subscriptions)
        .where(or(...conditions));
    const target = candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (!target) {
        console.warn("Gateway webhook without a matching subscription:", event, refs.join(","));
        return { ok: true };
    }

    if (PAYMENT_EVENTS.has(event)) {
        // Only the recurring subscription renews; a paid single plan does not extend.
        const renewal = event === "subscription.renewed" && target.plan === "pix_auto";
        if (target.paidAt && !renewal) {
            return { ok: true };
        }
        // The secret in the URL authenticates the webhook, but the payment is
        // verified with the gateway: that way not even a forged webhook with the
        // secret activates a charge that was never paid. For now only direct Pix
        // can be queried; a gateway outage becomes an error and AbacatePay
        // resends later.
        let paidOn = new Date();
        if (gatewayConfigured() && target.plan !== "pix_auto" && target.gatewayId) {
            const charge = await queryPixQrCode(target.gatewayId);
            if (!charge.paid) {
                console.warn("Payment webhook without gateway confirmation:", event, target.id);
                return { ok: true };
            }
            paidOn = charge.paidAt ?? paidOn;
        }
        await activateSubscription(target, paidOn, renewal);
    } else if (event === "subscription.cancelled") {
        await db
            .update(subscriptions)
            .set({ status: "cancelada" })
            .where(eq(subscriptions.id, target.id));
    } else {
        console.warn("Gateway webhook with an unhandled event:", event);
    }
    return { ok: true };
}

export async function editAccent(userId: string, accent: string | null) {
    if (accent !== null && !(await supportActive(userId))) {
        throw new AppError(403, "support.colorsForSupporters");
    }
    await db.update(users).set({ accent }).where(eq(users.id, userId));
    return { accent };
}

// Cancels whatever is still valid: nothing renews, and the paid period runs until the end.
export async function cancelActiveSupport(userId: string) {
    const cancelled = await db
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
    if (cancelled.length === 0) {
        throw new AppError(404, "support.noActiveSubscription");
    }
    const pixAuto = cancelled.some((c) => c.plan === "pix_auto");
    const expiresAt = cancelled
        .map((c) => c.expiresAt)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0];
    return { ok: true, expiresAt: expiresAt ?? null, pixAuto };
}

export async function editBackgroundDim(userId: string, dim: number) {
    if (!(await supportActive(userId))) {
        throw new AppError(403, "support.backgroundForSupporters");
    }
    await db.update(users).set({ backgroundDim: dim }).where(eq(users.id, userId));
    return { backgroundDim: dim };
}

const TZ_SP = "America/Sao_Paulo";
const spDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ_SP });

/**
 * Marks as expired every pending charge whose Pix QR code has already expired.
 *
 * This is not cosmetic cleanup: the gateway itself defines PIX_TTL_SECONDS, and
 * past that window the charge can NO LONGER be paid. Leaving it as pending makes
 * the dashboard show dozens of charges that will never become anything, and
 * drowns out the signal of what is actually open right now.
 *
 * The 10 minute slack exists because the gateway webhook can arrive late: it is
 * better to wait a bit longer than to expire something that was just paid.
 *
 * Runs before listing, so the dashboard always reflects reality without a
 * scheduler. Naturally idempotent: rows already expired are not touched.
 */
export async function expireStalePending(): Promise<number> {
    const cutoff = new Date(Date.now() - (PIX_TTL_SECONDS + 600) * 1000);
    const updated = await db
        .update(subscriptions)
        .set({ status: "expirada" })
        .where(
            and(
                eq(subscriptions.status, "pendente"),
                lt(subscriptions.createdAt, cutoff),
                isNull(subscriptions.paidAt),
            ),
        )
        .returning({ id: subscriptions.id });
    return updated.length;
}

// Admin view: who pays, when it started and ends, and revenue per period.
export async function listAdminSubscriptions() {
    // The dashboard needs the real state, not the state frozen at the moment
    // the charge was born.
    await expireStalePending();

    const rows = await db
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

    const now = new Date();
    const today = spDay(now);
    const paid = rows.filter((r) => r.paidAt !== null);
    const window = (days: number) =>
        paid.filter((r) => r.paidAt! >= new Date(now.getTime() - days * 86400000));
    const sum = (arr: { amountCents: number }[]) => arr.reduce((t, r) => t + r.amountCents, 0);

    const perDayMap = new Map<string, number>();
    for (const r of paid) {
        const d = spDay(r.paidAt!);
        perDayMap.set(d, (perDayMap.get(d) ?? 0) + r.amountCents);
    }
    const porDia = [...perDayMap.entries()]
        .map(([d, cents]) => ({ d, cents }))
        .sort((a, b) => (a.d < b.d ? -1 : 1));

    const activeSet = new Set(
        rows
            .filter(
                (r) =>
                    (r.status === "ativa" || r.status === "cancelada") &&
                    r.expiresAt !== null &&
                    r.expiresAt > now,
            )
            .map((r) => r.email),
    );

    return {
        totais: {
            hojeCents: sum(paid.filter((r) => spDay(r.paidAt!) === today)),
            semanaCents: sum(window(7)),
            mesCents: sum(window(30)),
            totalCents: sum(paid),
            apoiadoresAtivos: activeSet.size,
            pagamentos: paid.length,
        },
        porDia,
        assinaturas: rows,
    };
}
