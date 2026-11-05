import { z } from "zod";
import { env } from "../config/env.ts";
import { NOTIFICATIONS } from "../i18n/emails.ts";
import type { Locale } from "../i18n/locale.ts";

// Sends messages through the Evolution API (WhatsApp/Baileys gateway) hosted on the
// VPS. Without EVOLUTION_URL/EVOLUTION_API_KEY (e.g. dev), sending becomes a logged
// no-op, like the email when SMTP is not configured.
const configured = !!(env.EVOLUTION_URL && env.EVOLUTION_API_KEY);

const connectionStateSchema = z.object({ instance: z.object({ state: z.string() }) });

// Normalizes to the WhatsApp format (digits only, with the country code). Accepts a
// Brazilian phone without the country code (10-11 digits) and prefixes 55; one that
// already has it stays as it is.
function normalizeNumber(phone: string): string | null {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return null;
    if (digits.startsWith("55")) return digits;
    if (digits.length === 10 || digits.length === 11) return "55" + digits;
    return digits;
}

// A failure is logged, not thrown: recovery must not break because the WhatsApp
// message did not go out (email stays as the default channel).
async function sendText(phone: string, text: string) {
    const number = normalizeNumber(phone);
    if (!number) {
        console.warn(`[WHATSAPP] invalid phone, message skipped: ${phone}`);
        return;
    }
    if (!configured) {
        console.log(`[WHATSAPP] (Evolution not configured) to=${number}\n${text}`);
        return;
    }
    try {
        const resp = await fetch(
            `${env.EVOLUTION_URL}/message/sendText/${env.EVOLUTION_INSTANCE}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", apikey: env.EVOLUTION_API_KEY! },
                body: JSON.stringify({ number, text }),
            },
        );
        if (!resp.ok) {
            const body = await resp.text().catch(() => "");
            console.error(`Failed to send WhatsApp to ${number}: HTTP ${resp.status} ${body}`);
        }
    } catch (e) {
        console.error(`Failed to send WhatsApp to ${number}:`, e);
    }
}

// Messages go in the language saved in the account.
export const whatsappService = {
    async sendResetCode(phone: string, code: string, locale: Locale) {
        await sendText(phone, NOTIFICATIONS[locale].whatsapp.resetCode(code));
    },
    async sendPhoneCode(phone: string, code: string, locale: Locale) {
        await sendText(phone, NOTIFICATIONS[locale].whatsapp.phoneCode(code));
    },

    // Unlike sending, here the error goes up: it is what marks WhatsApp as failing
    // in the dependencies endpoint. null when there is no Evolution configured.
    async connectionState(signal: AbortSignal): Promise<string | null> {
        if (!configured) return null;
        const resp = await fetch(
            `${env.EVOLUTION_URL}/instance/connectionState/${env.EVOLUTION_INSTANCE}`,
            { headers: { apikey: env.EVOLUTION_API_KEY! }, signal },
        );
        if (!resp.ok) throw new Error(`Evolution answered HTTP ${resp.status}`);
        return connectionStateSchema.parse(await resp.json()).instance.state;
    },
};
