import { env } from "../config/env.ts";

// Envia mensagens via Evolution API (gateway WhatsApp/Baileys) hospedado na VPS.
// Sem EVOLUTION_URL/EVOLUTION_API_KEY (ex.: dev), o envio vira no-op logado, igual
// ao email quando o SMTP não está configurado.
const configurado = !!(env.EVOLUTION_URL && env.EVOLUTION_API_KEY);

// Normaliza para o formato do WhatsApp (só dígitos, com DDI). Aceita telefone
// brasileiro sem DDI (10-11 dígitos) e prefixa 55; se já vier com DDI, mantém.
function normalizarNumero(telefone: string): string | null {
    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 10) return null;
    if (digitos.startsWith("55")) return digitos;
    if (digitos.length === 10 || digitos.length === 11) return "55" + digitos;
    return digitos;
}

// Uma falha é logada, não propagada: a recuperação não deve quebrar porque o
// WhatsApp não saiu (o email continua como canal padrão).
async function enviarTexto(telefone: string, texto: string) {
    const numero = normalizarNumero(telefone);
    if (!numero) {
        console.warn(`[WHATSAPP] telefone inválido, envio ignorado: ${telefone}`);
        return;
    }
    if (!configurado) {
        console.log(`[WHATSAPP] (Evolution não configurado) para=${numero}\n${texto}`);
        return;
    }
    try {
        const resp = await fetch(
            `${env.EVOLUTION_URL}/message/sendText/${env.EVOLUTION_INSTANCE}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", apikey: env.EVOLUTION_API_KEY! },
                body: JSON.stringify({ number: numero, text: texto }),
            },
        );
        if (!resp.ok) {
            const corpo = await resp.text().catch(() => "");
            console.error(`Falha ao enviar WhatsApp para ${numero}: HTTP ${resp.status} ${corpo}`);
        }
    } catch (e) {
        console.error(`Falha ao enviar WhatsApp para ${numero}:`, e);
    }
}

export const whatsappService = {
    async enviarOtpReset(telefone: string, otp: string) {
        const texto =
            `ensina.dev\n\nSeu código para redefinir a senha é *${otp}*.\n` +
            `Ele vale por 10 minutos. Se você não pediu, ignore esta mensagem.`;
        await enviarTexto(telefone, texto);
    },
};
