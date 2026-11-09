import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { emailTemplates, type Email } from "./emailTemplates.ts";
import { NOTIFICATIONS } from "../i18n/emails.ts";
import { LOCALES, type Locale } from "../i18n/locale.ts";

const LINK = "https://ensinadev.com.br/redefinir-senha?token=abc123";
const CODE = "482913";

// Every email, with the value that must reach the person in it (link or code).
function allEmails(locale: Locale): [string, Email, string][] {
    return [
        ["verification", emailTemplates.verification(locale, LINK), LINK],
        ["passwordReset", emailTemplates.passwordReset(locale, LINK), LINK],
        ["createPassword", emailTemplates.createPassword(locale, LINK, "Google"), LINK],
        ["createPasswordCode", emailTemplates.createPasswordCode(locale, CODE, null), CODE],
        ["resetCode", emailTemplates.resetCode(locale, CODE), CODE],
        ["passwordChanged", emailTemplates.passwordChanged(locale, LINK), LINK],
        ["twoFactorOn", emailTemplates.twoFactor(locale, true, LINK), LINK],
        ["twoFactorOff", emailTemplates.twoFactor(locale, false, LINK), LINK],
        ["phoneChanged", emailTemplates.phoneChanged(locale, LINK), LINK],
    ];
}

// Words and accents that only show up in Portuguese. URLs are left out because the
// screens keep the Portuguese paths in both languages.
const PORTUGUESE = /[ãõçáéíóúâêôà]|\b(você|senha|código|conta|seu|sua|para|não|pelo)\b/i;
const withoutUrls = (text: string) => text.replace(/https?:\/\/\S+/g, "");

describe("emails in both languages", () => {
    for (const locale of LOCALES) {
        test(`${locale}: each email carries its link or code, in the html and in the text`, () => {
            for (const [name, email, value] of allEmails(locale)) {
                assert.ok(email.subject.endsWith(" · Ensina Dev"), `${name}: ${email.subject}`);
                assert.ok(email.html.includes(value), `${name}: html without ${value}`);
                assert.ok(email.text.includes(value), `${name}: text without ${value}`);
                for (const part of [email.subject, email.html, email.text]) {
                    assert.doesNotMatch(part, /undefined|\[object|NaN/, name);
                }
            }
        });
    }

    test("en: no Portuguese left in subjects, bodies and texts", () => {
        for (const [name, email] of allEmails("en")) {
            for (const part of [email.subject, email.html, email.text]) {
                assert.doesNotMatch(withoutUrls(part), PORTUGUESE, name);
            }
        }
    });

    test("pt-BR keeps the texts it already had", () => {
        const email = emailTemplates.verification("pt-BR", LINK);
        assert.equal(email.subject, "Confirme seu email · Ensina Dev");
        assert.ok(email.html.includes("Falta pouco para começar."));
        const notice = emailTemplates.twoFactor("pt-BR", true, LINK);
        assert.equal(notice.subject, "A verificação em duas etapas foi ativada · Ensina Dev");
    });

    test("the social provider shows up in the create password email", () => {
        assert.ok(
            emailTemplates.createPassword("pt-BR", LINK, "GitHub").html.includes("pelo GitHub"),
        );
        assert.ok(emailTemplates.createPassword("en", LINK, "GitHub").html.includes("with GitHub"));
        assert.ok(emailTemplates.createPassword("en", LINK, null).html.includes("social sign-in"));
    });
});

describe("WhatsApp messages in both languages", () => {
    test("each message carries the code, and the English one has no Portuguese", () => {
        for (const locale of LOCALES) {
            const { resetCode, phoneCode } = NOTIFICATIONS[locale].whatsapp;
            assert.ok(resetCode(CODE).includes(`*${CODE}*`));
            assert.ok(phoneCode(CODE).includes(`*${CODE}*`));
        }
        const { resetCode, phoneCode } = NOTIFICATIONS.en.whatsapp;
        assert.doesNotMatch(resetCode(CODE), PORTUGUESE);
        assert.doesNotMatch(phoneCode(CODE), PORTUGUESE);
    });
});
