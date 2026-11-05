import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizeContact, normalizeContacts } from "./contacts.ts";
import type { ContactInput, ContactResult, ContactsResult } from "./contacts.ts";

const whatsapp = (country: string, number: string, areaCode?: string | null) =>
    normalizeContact({ canal: "whatsapp", pais: country, ddd: areaCode, numero: number });
const instagram = (username: string) => normalizeContact({ canal: "instagram", usuario: username });
const email = (value: string) => normalizeContact({ canal: "email", email: value });

function rejected(result: ContactResult, field: string) {
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.campo, field);
}

const paths = (result: ContactsResult) =>
    result.ok ? [] : result.problemas.map((problem) => problem.caminho.join("."));

describe("WhatsApp in Brazil", () => {
    test("strips the mask and takes the calling code from the list", () => {
        assert.deepEqual(whatsapp("BR", "98765-4321", "(11)"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "BR", ddi: "55", ddd: "11", numero: "987654321" },
        });
    });

    test("accepts the area codes at both ends of the list", () => {
        for (const areaCode of ["11", "19", "55", "79", "99"]) {
            assert.equal(whatsapp("BR", "987654321", areaCode).ok, true, areaCode);
        }
    });

    test("rejects an area code outside the list", () => {
        for (const areaCode of ["10", "20", "23", "25", "36", "52", "70", "72", "90", "00"]) {
            rejected(whatsapp("BR", "987654321", areaCode), "ddd");
        }
    });

    test("rejects a missing or three-digit area code", () => {
        rejected(whatsapp("BR", "987654321"), "ddd");
        rejected(whatsapp("BR", "987654321", null), "ddd");
        rejected(whatsapp("BR", "987654321", ""), "ddd");
        rejected(whatsapp("BR", "987654321", "011"), "ddd");
    });

    test("rejects a short number", () => {
        rejected(whatsapp("BR", "8765-4321", "11"), "numero");
    });

    test("rejects a long number", () => {
        rejected(whatsapp("BR", "998765-4321", "11"), "numero");
    });

    test("rejects a mobile number without the leading 9", () => {
        rejected(whatsapp("BR", "88765-4321", "11"), "numero");
    });
});

describe("WhatsApp outside Brazil", () => {
    test("stores the number with the area code and no DDD", () => {
        assert.deepEqual(whatsapp("PT", "912 345 678"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "PT", ddi: "351", ddd: null, numero: "912345678" },
        });
    });

    test("drops the national trunk 0, except in Italy", () => {
        assert.deepEqual(whatsapp("GB", "07911 123456"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "GB", ddi: "44", ddd: null, numero: "7911123456" },
        });
        assert.deepEqual(whatsapp("IT", "06 1234 5678"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "IT", ddi: "39", ddd: null, numero: "0612345678" },
        });
    });

    test("ignores a separate area code", () => {
        assert.deepEqual(whatsapp("US", "(415) 555-2671", "21"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "US", ddi: "1", ddd: null, numero: "4155552671" },
        });
    });

    test("accepts the country code in lowercase", () => {
        assert.deepEqual(whatsapp("pt", "912345678"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "PT", ddi: "351", ddd: null, numero: "912345678" },
        });
    });

    test("rejects a country outside the list", () => {
        rejected(whatsapp("XX", "912345678"), "pais");
        rejected(whatsapp("", "912345678"), "pais");
    });

    test("number from 7 to 14 digits", () => {
        assert.equal(whatsapp("DE", "1234567").ok, true);
        rejected(whatsapp("DE", "123456"), "numero");
        assert.equal(whatsapp("US", "1".repeat(14)).ok, true);
        rejected(whatsapp("US", "1".repeat(15)), "numero");
    });

    test("calling code plus number with at most 15 digits (E.164)", () => {
        assert.equal(whatsapp("PT", "9".repeat(12)).ok, true);
        rejected(whatsapp("PT", "9".repeat(13)), "numero");
        assert.equal(whatsapp("TL", "7".repeat(12)).ok, true);
        rejected(whatsapp("TL", "7".repeat(13)), "numero");
    });
});

describe("Instagram", () => {
    test("strips spaces and the @ and lowercases", () => {
        assert.deepEqual(instagram("  @Fulano.Dev "), {
            ok: true,
            contato: { canal: "instagram", usuario: "fulano.dev" },
        });
    });

    test("accepts underscores, digits and the maximum length of 30", () => {
        assert.equal(instagram("fulano_dev_2026").ok, true);
        assert.equal(instagram("a".repeat(30)).ok, true);
    });

    test("rejects a dot at the start, at the end or two in a row", () => {
        rejected(instagram(".fulano"), "usuario");
        rejected(instagram("@.fulano"), "usuario");
        rejected(instagram("fulano."), "usuario");
        rejected(instagram("fulano..dev"), "usuario");
    });

    test("rejects empty, more than 30 and characters outside the rule", () => {
        rejected(instagram(""), "usuario");
        rejected(instagram("@"), "usuario");
        rejected(instagram("a".repeat(31)), "usuario");
        rejected(instagram("fulano-dev"), "usuario");
        rejected(instagram("fulano dev"), "usuario");
        rejected(instagram("@@fulano"), "usuario");
    });
});

describe("Email", () => {
    test("strips spaces and lowercases", () => {
        assert.deepEqual(email("  Fulano.Dev@Email.COM "), {
            ok: true,
            contato: { canal: "email", email: "fulano.dev@email.com" },
        });
    });

    test("rejects an invalid format", () => {
        const invalid = ["", "fulano", "fulano@", "@email.com", "fulano@email", "ful ano@a.com"];
        for (const value of invalid) rejected(email(value), "email");
    });

    test("accepts up to 254 characters", () => {
        // 247 domain characters, with labels within DNS's 63 limit.
        const domain = ["a", "b", "c", "d"].map((letter) => letter.repeat(60)).join(".") + ".com";
        assert.equal(email(`${"x".repeat(6)}@${domain}`).ok, true);
        rejected(email(`${"x".repeat(7)}@${domain}`), "email");
    });
});

describe("normalizeContacts", () => {
    const zap: ContactInput = { canal: "whatsapp", pais: "BR", ddd: "11", numero: "98765-4321" };
    const insta: ContactInput = { canal: "instagram", usuario: "@Fulano" };

    test("normalizes both contacts", () => {
        assert.deepEqual(normalizeContacts({ primario: zap, secundario: insta }), {
            ok: true,
            contatos: {
                primario: {
                    canal: "whatsapp",
                    pais: "BR",
                    ddi: "55",
                    ddd: "11",
                    numero: "987654321",
                },
                secundario: { canal: "instagram", usuario: "fulano" },
            },
        });
    });

    test("a missing or null secondary becomes null", () => {
        for (const secondary of [undefined, null]) {
            const result = normalizeContacts({ primario: insta, secundario: secondary });
            assert.equal(result.ok, true);
            if (result.ok) assert.equal(result.contatos.secundario, null);
        }
    });

    test("rejects both on the same channel", () => {
        const result = normalizeContacts({
            primario: insta,
            secundario: { canal: "instagram", usuario: "outro" },
        });
        assert.deepEqual(paths(result), ["secundario.canal"]);
    });

    test("points at the field of each invalid contact", () => {
        const result = normalizeContacts({
            primario: { canal: "whatsapp", pais: "BR", ddd: "20", numero: "987654321" },
            secundario: { canal: "email", email: "sem-arroba" },
        });
        assert.deepEqual(paths(result), ["primario.ddd", "secundario.email"]);
    });

    test("an invalid secondary rejects even with a valid primary", () => {
        const result = normalizeContacts({
            primario: zap,
            secundario: { canal: "instagram", usuario: ".fulano" },
        });
        assert.deepEqual(paths(result), ["secundario.usuario"]);
    });
});
