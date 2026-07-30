// Ativa os apoios que foram pagos no gateway mas continuam pendentes no banco.
// Acontece quando o webhook do AbacatePay não chega: não cadastrado, fora do ar,
// segredo trocado. A tela de apoio já confirma sozinha enquanto o QR está aberto,
// mas cobrança paga depois disso (ou antes desta correção existir) fica presa e
// só sai daqui.
//
// Idempotente: só mexe em linha pendente com paid_at nulo, e só quando o gateway
// diz PAID. Rodar de novo não estende validade de ninguém.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/reconciliar-apoios.ts
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "../db.ts";
import { subscriptions, users } from "../schema.ts";
import { PLANOS } from "../src/services/apoiador.service.ts";
import { consultarPixQrCode, gatewayConfigurado } from "../src/services/abacatepay.client.ts";

const reais = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

async function reconciliar() {
    if (!gatewayConfigurado()) {
        console.error("Sem ABACATEPAY_API_KEY: não há como consultar o gateway.");
        process.exit(1);
    }

    const pendentes = await db
        .select({
            id: subscriptions.id,
            plan: subscriptions.plan,
            gatewayId: subscriptions.gatewayId,
            amountCents: subscriptions.amountCents,
            paidAt: subscriptions.paidAt,
            expiresAt: subscriptions.expiresAt,
            username: users.username,
            email: users.email,
        })
        .from(subscriptions)
        .innerJoin(users, eq(users.id, subscriptions.userId))
        .where(
            and(
                eq(subscriptions.status, "pendente"),
                isNull(subscriptions.paidAt),
                isNotNull(subscriptions.gatewayId),
            ),
        );

    if (pendentes.length === 0) {
        console.log("Nenhuma cobrança pendente para conferir.");
        return;
    }

    let ativadas = 0;
    let recebido = 0;
    for (const p of pendentes) {
        const quem = p.username ?? p.email;
        // Só cobrança de QRCode Pix tem consulta nesta rota; assinatura recorrente
        // vem do /billing e depende do webhook.
        if (!p.gatewayId!.startsWith("pix_char_")) {
            console.log(`${quem}: ${p.gatewayId} não é QRCode Pix, pulando.`);
            continue;
        }
        try {
            const cobranca = await consultarPixQrCode(p.gatewayId!);
            if (!cobranca.pago) {
                console.log(`${quem}: ${p.plan} de ${reais(p.amountCents)} segue sem pagamento.`);
                continue;
            }
            if (cobranca.amountCents !== p.amountCents) {
                console.warn(
                    `${quem}: valor divergente, cobramos ${reais(p.amountCents)} e o gateway registrou ${reais(cobranca.amountCents)}.`,
                );
            }
            const pagoEm = cobranca.pagoEm ?? new Date();
            const expiresAt = new Date(pagoEm.getTime() + PLANOS[p.plan].dias * 86400000);
            const feito = await db
                .update(subscriptions)
                .set({ status: "ativa", paidAt: pagoEm, expiresAt })
                .where(and(eq(subscriptions.id, p.id), isNull(subscriptions.paidAt)))
                .returning({ id: subscriptions.id });
            if (feito.length === 0) {
                console.log(`${quem}: alguém confirmou antes, nada a fazer.`);
                continue;
            }
            ativadas++;
            recebido += p.amountCents;
            console.log(
                `${quem}: ${p.plan} de ${reais(p.amountCents)} pago em ${pagoEm.toISOString()}, apoio vale até ${expiresAt.toISOString()}.`,
            );
        } catch (err) {
            console.error(`${quem}: falha ao consultar ${p.gatewayId}:`, err);
        }
    }

    console.log(
        `Concluído: ${pendentes.length} conferidas, ${ativadas} ativadas, ${reais(recebido)} reconhecidos.`,
    );
}

reconciliar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao reconciliar apoios:", e);
        process.exit(1);
    });
