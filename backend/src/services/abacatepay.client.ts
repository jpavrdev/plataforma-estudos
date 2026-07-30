import { env } from "../config/env.ts";
import { AppError } from "../errors/AppError.ts";

export function gatewayConfigurado() {
    return Boolean(env.ABACATEPAY_API_KEY);
}

// Validade do QRCode Pix. Passado esse prazo a cobrança não pode mais ser paga,
// então nem vale consultar o gateway sobre ela.
export const PIX_TTL_SEGUNDOS = 1800;

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

// Estado de um QRCode Pix já criado (v1). É como sabemos que o dinheiro entrou
// sem depender do webhook: PENDING enquanto ninguém paga, PAID depois.
export async function consultarPixQrCode(id: string) {
    const resposta = await fetch(
        `${env.ABACATEPAY_API_URL}/pixQrCode/check?id=${encodeURIComponent(id)}`,
        { headers: { Authorization: `Bearer ${env.ABACATEPAY_API_KEY}` } },
    );
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) {
        console.error(
            "AbacatePay respondeu erro ao consultar cobrança:",
            id,
            resposta.status,
            JSON.stringify(dados),
        );
        throw new AppError(
            502,
            "O gateway de pagamento não respondeu. Tente de novo em instantes.",
        );
    }
    const d = ((dados as Record<string, unknown>)?.data ?? dados) as Record<string, unknown>;
    return {
        pago: String(d.status ?? "") === "PAID",
        amountCents: Number(d.amount ?? 0),
        // updatedAt é quando a cobrança virou PAID. Vale mais que a hora da
        // reconciliação: é o instante em que o aluno pagou de verdade.
        pagoEm: d.updatedAt ? new Date(String(d.updatedAt)) : null,
    };
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
        expiresIn: PIX_TTL_SEGUNDOS,
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
