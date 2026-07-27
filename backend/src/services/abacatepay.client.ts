import { env } from "../config/env.ts";
import { AppError } from "../errors/AppError.ts";

export function gatewayConfigurado() {
    return Boolean(env.ABACATEPAY_API_KEY);
}

async function chamar(caminho: string, body: unknown) {
    const resposta = await fetch(`${env.ABACATEPAY_API_URL}${caminho}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.ABACATEPAY_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) {
        console.error("AbacatePay respondeu erro:", resposta.status, JSON.stringify(dados));
        throw new AppError(502, "O gateway de pagamento não respondeu. Tente de novo em instantes.");
    }
    return dados as Record<string, unknown>;
}

// QRCode Pix direto (v1): devolve o QR (imagem base64) e o copia-e-cola.
// Sem customer de propósito: no Pix quem paga já se identifica no banco.
export async function criarPixTransparente(
    amountCents: number,
    description: string,
    metadata: Record<string, string>,
) {
    const r = await chamar("/pixQrCode/create", {
        amount: amountCents,
        description,
        expiresIn: 1800,
        metadata,
    });
    const dados = (r.data ?? r) as Record<string, unknown>;
    return {
        gatewayId: String(dados.id ?? ""),
        brCode: String(dados.brCode ?? ""),
        brCodeBase64: String(dados.brCodeBase64 ?? ""),
    };
}

// Cobrança hospedada (v1): devolve a URL de redirecionamento para o checkout deles.
export async function criarCheckoutAssinatura(
    productId: string,
    returnUrl: string,
    completionUrl: string,
    externalId: string,
) {
    const r = await chamar("/billing/create", {
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
    const dados = (r.data ?? r) as Record<string, unknown>;
    return {
        gatewayId: String(dados.id ?? ""),
        url: String(dados.url ?? ""),
    };
}
