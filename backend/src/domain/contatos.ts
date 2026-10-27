// Contatos de quem se inscreve num sorteio. O que chega do formulário, com
// máscara e caixa variadas, sai daqui no formato guardado ou com o motivo da
// recusa de cada campo.
import { z } from "zod";

export type Contato =
    | { canal: "whatsapp"; pais: string; ddi: string; ddd: string | null; numero: string }
    | { canal: "instagram"; usuario: string }
    | { canal: "email"; email: string };

export interface Contatos {
    primario: Contato;
    secundario: Contato | null;
}

export type EntradaContato =
    | { canal: "whatsapp"; pais: string; ddd?: string | null; numero: string }
    | { canal: "instagram"; usuario: string }
    | { canal: "email"; email: string };

export interface EntradaContatos {
    primario: EntradaContato;
    secundario?: EntradaContato | null;
}

export interface ProblemaDeContato {
    caminho: string[];
    mensagem: string;
}

export type ResultadoContatos =
    { ok: true; contatos: Contatos } | { ok: false; problemas: ProblemaDeContato[] };

export type ResultadoContato =
    { ok: true; contato: Contato } | { ok: false; campo: string; mensagem: string };

type Entrada<C extends EntradaContato["canal"]> = Extract<EntradaContato, { canal: C }>;

// O DDI sai desta lista, nunca do cliente.
const DDI_POR_PAIS = new Map([
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

// Países em que o 0 inicial faz parte do número também no formato internacional.
const PAISES_QUE_MANTEM_O_ZERO = new Set(["IT"]);

// Os 67 DDDs da lista oficial da Anatel.
const DDDS = new Set(
    [
        11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42,
        43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74,
        75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
    ].map(String),
);

// Limite do E.164 para o número completo, DDI incluído.
const MAX_DIGITOS_E164 = 15;
const MAX_EMAIL = 254;
const formatoDeEmail = z.email();

const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

const recusa = (campo: string, mensagem: string): ResultadoContato => ({
    ok: false,
    campo,
    mensagem,
});

function normalizarWhatsapp(entrada: Entrada<"whatsapp">): ResultadoContato {
    const pais = entrada.pais.trim().toUpperCase();
    const ddi = DDI_POR_PAIS.get(pais);
    if (!ddi) return recusa("pais", "País fora da lista");
    const numero = somenteDigitos(entrada.numero);

    if (pais === "BR") {
        const ddd = somenteDigitos(entrada.ddd ?? "");
        if (!DDDS.has(ddd)) return recusa("ddd", "DDD inválido");
        if (numero.length !== 9) return recusa("numero", "O celular deve ter 9 dígitos");
        if (!numero.startsWith("9")) return recusa("numero", "O celular deve começar com 9");
        return { ok: true, contato: { canal: "whatsapp", pais, ddi, ddd, numero } };
    }

    // Fora do Brasil o código de área vai junto do número, e um DDD avulso é ignorado.
    // O 0 de discagem nacional não existe no formato internacional: o 07911 do
    // Reino Unido é +44 7911, e com o 0 o link do WhatsApp cairia em outro número.
    const internacional = PAISES_QUE_MANTEM_O_ZERO.has(pais) ? numero : numero.replace(/^0/, "");
    if (internacional.length < 7 || internacional.length > 14) {
        return recusa("numero", "O telefone deve ter de 7 a 14 dígitos");
    }
    if (ddi.length + internacional.length > MAX_DIGITOS_E164) {
        return recusa("numero", "O telefone é longo demais para o código do país");
    }
    return {
        ok: true,
        contato: { canal: "whatsapp", pais, ddi, ddd: null, numero: internacional },
    };
}

function normalizarInstagram(entrada: Entrada<"instagram">): ResultadoContato {
    const usuario = entrada.usuario.trim().replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9._]{1,30}$/.test(usuario)) {
        return recusa("usuario", "Use de 1 a 30 letras, números, ponto ou underline");
    }
    if (usuario.startsWith(".") || usuario.endsWith(".") || usuario.includes("..")) {
        return recusa(
            "usuario",
            "O usuário não pode ter ponto no começo, no fim nem dois seguidos",
        );
    }
    return { ok: true, contato: { canal: "instagram", usuario } };
}

function normalizarEmail(entrada: Entrada<"email">): ResultadoContato {
    const email = entrada.email.trim().toLowerCase();
    if (email.length > MAX_EMAIL || !formatoDeEmail.safeParse(email).success) {
        return recusa("email", "Email inválido");
    }
    return { ok: true, contato: { canal: "email", email } };
}

export function normalizarContato(entrada: EntradaContato): ResultadoContato {
    switch (entrada.canal) {
        case "whatsapp":
            return normalizarWhatsapp(entrada);
        case "instagram":
            return normalizarInstagram(entrada);
        case "email":
            return normalizarEmail(entrada);
    }
}

export function normalizarContatos(entrada: EntradaContatos): ResultadoContatos {
    const problemas: ProblemaDeContato[] = [];
    const normalizar = (campo: keyof Contatos, contato: EntradaContato) => {
        const resultado = normalizarContato(contato);
        if (resultado.ok) return resultado.contato;
        problemas.push({ caminho: [campo, resultado.campo], mensagem: resultado.mensagem });
        return null;
    };

    const primario = normalizar("primario", entrada.primario);
    const secundario = entrada.secundario ? normalizar("secundario", entrada.secundario) : null;
    if (entrada.secundario?.canal === entrada.primario.canal) {
        problemas.push({
            caminho: ["secundario", "canal"],
            mensagem: "O contato secundário precisa ser de outro canal",
        });
    }

    if (!primario || problemas.length > 0) return { ok: false, problemas };
    return { ok: true, contatos: { primario, secundario } };
}
