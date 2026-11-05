// Contacts of whoever signs up for a raffle. What arrives from the form, with
// varied masks and casing, leaves here in the stored format or with the reason
// each field was rejected.
import { z } from "zod";

export type Contact =
    | { canal: "whatsapp"; pais: string; ddi: string; ddd: string | null; numero: string }
    | { canal: "instagram"; usuario: string }
    | { canal: "email"; email: string };

export interface Contacts {
    primario: Contact;
    secundario: Contact | null;
}

export type ContactInput =
    | { canal: "whatsapp"; pais: string; ddd?: string | null; numero: string }
    | { canal: "instagram"; usuario: string }
    | { canal: "email"; email: string };

export interface ContactsInput {
    primario: ContactInput;
    secundario?: ContactInput | null;
}

export interface ContactProblem {
    caminho: string[];
    mensagem: string;
}

export type ContactsResult =
    { ok: true; contatos: Contacts } | { ok: false; problemas: ContactProblem[] };

export type ContactResult =
    { ok: true; contato: Contact } | { ok: false; campo: string; mensagem: string };

type ChannelInput<C extends ContactInput["canal"]> = Extract<ContactInput, { canal: C }>;

// The country calling code comes from this list, never from the client.
const DIAL_CODE_BY_COUNTRY = new Map([
    ["BR", "55"],
    ["PT", "351"],
    ["AO", "244"],
    ["MZ", "258"],
    ["CV", "238"],
    ["GW", "245"],
    ["ST", "239"],
    ["TL", "670"],
    ["US", "1"],
    ["CA", "1"],
    ["AR", "54"],
    ["CL", "56"],
    ["CO", "57"],
    ["MX", "52"],
    ["PY", "595"],
    ["UY", "598"],
    ["ES", "34"],
    ["FR", "33"],
    ["IT", "39"],
    ["DE", "49"],
    ["NL", "31"],
    ["BE", "32"],
    ["CH", "41"],
    ["IE", "353"],
    ["GB", "44"],
    ["JP", "81"],
    ["AU", "61"],
]);

// Countries where the leading 0 is part of the number in the international format too.
const COUNTRIES_KEEPING_ZERO = new Set(["IT"]);

// The 67 Brazilian area codes (DDD) on Anatel's official list.
const AREA_CODES = new Set(
    [
        11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42,
        43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74,
        75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
    ].map(String),
);

// E.164 limit for the full number, calling code included.
const MAX_E164_DIGITS = 15;
const MAX_EMAIL_LENGTH = 254;
const emailFormat = z.email();

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const reject = (field: string, message: string): ContactResult => ({
    ok: false,
    campo: field,
    mensagem: message,
});

function normalizeWhatsapp(input: ChannelInput<"whatsapp">): ContactResult {
    const country = input.pais.trim().toUpperCase();
    const dialCode = DIAL_CODE_BY_COUNTRY.get(country);
    if (!dialCode) return reject("pais", "País fora da lista");
    const number = digitsOnly(input.numero);

    if (country === "BR") {
        const areaCode = digitsOnly(input.ddd ?? "");
        if (!AREA_CODES.has(areaCode)) return reject("ddd", "DDD inválido");
        if (number.length !== 9) return reject("numero", "O celular deve ter 9 dígitos");
        if (!number.startsWith("9")) return reject("numero", "O celular deve começar com 9");
        return {
            ok: true,
            contato: {
                canal: "whatsapp",
                pais: country,
                ddi: dialCode,
                ddd: areaCode,
                numero: number,
            },
        };
    }

    // Outside Brazil the area code goes with the number, and a separate DDD is ignored.
    // The national trunk 0 does not exist in the international format: the UK's
    // 07911 is +44 7911, and with the 0 the WhatsApp link would reach another number.
    const international = COUNTRIES_KEEPING_ZERO.has(country) ? number : number.replace(/^0/, "");
    if (international.length < 7 || international.length > 14) {
        return reject("numero", "O telefone deve ter de 7 a 14 dígitos");
    }
    if (dialCode.length + international.length > MAX_E164_DIGITS) {
        return reject("numero", "O telefone é longo demais para o código do país");
    }
    return {
        ok: true,
        contato: {
            canal: "whatsapp",
            pais: country,
            ddi: dialCode,
            ddd: null,
            numero: international,
        },
    };
}

function normalizeInstagram(input: ChannelInput<"instagram">): ContactResult {
    const username = input.usuario.trim().replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9._]{1,30}$/.test(username)) {
        return reject("usuario", "Use de 1 a 30 letras, números, ponto ou underline");
    }
    if (username.startsWith(".") || username.endsWith(".") || username.includes("..")) {
        return reject(
            "usuario",
            "O usuário não pode ter ponto no começo, no fim nem dois seguidos",
        );
    }
    return { ok: true, contato: { canal: "instagram", usuario: username } };
}

function normalizeEmail(input: ChannelInput<"email">): ContactResult {
    const email = input.email.trim().toLowerCase();
    if (email.length > MAX_EMAIL_LENGTH || !emailFormat.safeParse(email).success) {
        return reject("email", "Email inválido");
    }
    return { ok: true, contato: { canal: "email", email } };
}

export function normalizeContact(input: ContactInput): ContactResult {
    switch (input.canal) {
        case "whatsapp":
            return normalizeWhatsapp(input);
        case "instagram":
            return normalizeInstagram(input);
        case "email":
            return normalizeEmail(input);
    }
}

export function normalizeContacts(input: ContactsInput): ContactsResult {
    const problems: ContactProblem[] = [];
    const normalize = (field: keyof Contacts, contact: ContactInput) => {
        const result = normalizeContact(contact);
        if (result.ok) return result.contato;
        problems.push({ caminho: [field, result.campo], mensagem: result.mensagem });
        return null;
    };

    const primary = normalize("primario", input.primario);
    const secondary = input.secundario ? normalize("secundario", input.secundario) : null;
    if (input.secundario?.canal === input.primario.canal) {
        problems.push({
            caminho: ["secundario", "canal"],
            mensagem: "O contato secundário precisa ser de outro canal",
        });
    }

    if (!primary || problems.length > 0) return { ok: false, problemas: problems };
    return { ok: true, contatos: { primario: primary, secundario: secondary } };
}
