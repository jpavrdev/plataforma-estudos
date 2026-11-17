import { env } from "../config/env.ts";
import { AppError } from "../errors/AppError.ts";

export function gatewayConfigured() {
    return Boolean(env.ABACATEPAY_API_KEY);
}

// Pix QR code validity. Past this window the charge can no longer be paid,
// so it is not even worth querying the gateway about it.
export const PIX_TTL_SECONDS = 1800;

async function post(path: string, body: unknown) {
    const response = await fetch(`${env.ABACATEPAY_API_URL}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.ABACATEPAY_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        console.error("AbacatePay responded with an error:", response.status, JSON.stringify(data));
        throw new AppError(502, "payment.gatewayTimeout");
    }
    return data as Record<string, unknown>;
}

// Status of an already created Pix QR code (v1). This is how we learn the money
// landed without depending on the webhook: PENDING until someone pays, PAID after.
export async function queryPixQrCode(id: string) {
    const response = await fetch(
        `${env.ABACATEPAY_API_URL}/pixQrCode/check?id=${encodeURIComponent(id)}`,
        { headers: { Authorization: `Bearer ${env.ABACATEPAY_API_KEY}` } },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        console.error(
            "AbacatePay responded with an error while checking a charge:",
            id,
            response.status,
            JSON.stringify(data),
        );
        throw new AppError(502, "payment.gatewayTimeout");
    }
    const d = ((data as Record<string, unknown>)?.data ?? data) as Record<string, unknown>;
    return {
        paid: String(d.status ?? "") === "PAID",
        amountCents: Number(d.amount ?? 0),
        // updatedAt is when the charge became PAID. It beats the reconciliation
        // time: that is the moment the student actually paid.
        paidAt: d.updatedAt ? new Date(String(d.updatedAt)) : null,
    };
}

// Direct Pix QR code (v1): returns the QR (base64 image) and the copy-and-paste code.
// No customer on purpose: with Pix the payer already identifies themselves at the bank.
export async function createTransparentPix(
    amountCents: number,
    description: string,
    metadata: Record<string, string>,
) {
    const r = await post("/pixQrCode/create", {
        amount: amountCents,
        description,
        expiresIn: PIX_TTL_SECONDS,
        metadata,
    });
    const data = (r.data ?? r) as Record<string, unknown>;
    return {
        gatewayId: String(data.id ?? ""),
        brCode: String(data.brCode ?? ""),
        brCodeBase64: String(data.brCodeBase64 ?? ""),
    };
}

// Hosted charge (v1): returns the redirect URL to their checkout.
export async function createSubscriptionCheckout(
    productId: string,
    returnUrl: string,
    completionUrl: string,
    externalId: string,
) {
    const r = await post("/billing/create", {
        frequency: "MULTIPLE_PAYMENTS",
        methods: ["PIX"],
        products: [
            {
                externalId: productId,
                name: "Apoio mensal ao Ensina Dev",
                description: "Assinatura de apoiador",
                quantity: 1,
                price: 500,
            },
        ],
        returnUrl,
        completionUrl,
        metadata: { subscriptionId: externalId },
    });
    const data = (r.data ?? r) as Record<string, unknown>;
    return {
        gatewayId: String(data.id ?? ""),
        url: String(data.url ?? ""),
    };
}
