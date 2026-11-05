import { NOTIFICATIONS } from "../i18n/emails.ts";
import type { Locale } from "../i18n/locale.ts";

export interface Email {
    subject: string;
    html: string;
    text: string;
}

const BLUE = "#2d6bf5";

// Inline styles: email clients ignore external CSS.
function layout(brand: string, title: string, body: string[]) {
    return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#251f31">
  <div style="font-size:20px;font-weight:700;color:${BLUE}">${brand}</div>
  <h1 style="font-size:22px;margin:22px 0 8px">${title}</h1>
  ${body.join("\n  ")}
</div>`;
}

const paragraph = (text: string) =>
    `<p style="font-size:15px;line-height:1.6;color:#555">${text}</p>`;

const button = (link: string, label: string) =>
    `<a href="${link}" style="display:inline-block;margin:20px 0;background:${BLUE};color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600">${label}</a>`;

const pasteLink = (intro: string, link: string) =>
    `<p style="font-size:13px;line-height:1.6;color:#888">${intro}<br><a href="${link}" style="color:${BLUE};word-break:break-all">${link}</a></p>`;

const note = (text: string, marginTop = 24) =>
    `<p style="font-size:13px;line-height:1.6;color:#888;margin-top:${marginTop}px">${text}</p>`;

const codeBox = (code: string) =>
    `<div style="font-size:30px;font-weight:700;letter-spacing:6px;color:${BLUE};margin:18px 0">${code}</div>`;

function build(locale: Locale, subject: string, title: string, body: string[], text: string) {
    const { brand } = NOTIFICATIONS[locale];
    return { subject: `${subject} · ${brand}`, html: layout(brand, title, body), text };
}

type NoticeKind = "passwordChanged" | "twoFactorEnabled" | "twoFactorDisabled" | "phoneChanged";

// Account change notices: whoever took over the account cannot delete them, and
// the owner finds out in time to get access back by email.
function notice(locale: Locale, kind: NoticeKind, link: string): Email {
    const copy = NOTIFICATIONS[locale];
    const n = copy[kind];
    return build(
        locale,
        n.subject,
        n.title,
        [paragraph(n.intro), paragraph(n.action), button(link, copy.resetButton)],
        `${n.intro}\n\n${n.action}\n${link}`,
    );
}

// Builds the emails without sending them, in the language given.
export const emailTemplates = {
    verification(locale: Locale, link: string): Email {
        const copy = NOTIFICATIONS[locale];
        const c = copy.verification;
        return build(
            locale,
            c.subject,
            c.title,
            [
                paragraph(c.intro),
                button(link, c.button),
                pasteLink(copy.pasteLink, link),
                note(c.ignore),
            ],
            c.text(link),
        );
    },
    passwordReset(locale: Locale, link: string): Email {
        const copy = NOTIFICATIONS[locale];
        const c = copy.passwordReset;
        return build(
            locale,
            c.subject,
            c.title,
            [
                paragraph(c.intro),
                button(link, copy.resetButton),
                pasteLink(copy.pasteLink, link),
                note(c.ignore),
            ],
            c.text(link),
        );
    },
    // Whoever signed up through social login has no password to reset, so the
    // "forgot my password" email says something else: that one can be created now,
    // and that signing in through the provider keeps working. Before this, the
    // person asked for the link, was told it had been sent, and nothing ever came.
    createPassword(locale: Locale, link: string, provider: string | null): Email {
        const copy = NOTIFICATIONS[locale];
        const c = copy.createPassword;
        const via = copy.viaProvider(provider);
        return build(
            locale,
            c.subject,
            c.title,
            [
                paragraph(c.intro(via)),
                button(link, c.button),
                pasteLink(copy.pasteLink, link),
                note(copy.bothWays(via)),
                note(c.ignore, 12),
            ],
            c.text(link, via),
        );
    },
    // The same idea as createPassword, on the six-digit code path.
    createPasswordCode(locale: Locale, code: string, provider: string | null): Email {
        const copy = NOTIFICATIONS[locale];
        const c = copy.createPasswordCode;
        const via = copy.viaProvider(provider);
        return build(
            locale,
            c.subject,
            c.title,
            [paragraph(c.intro(via)), codeBox(code), note(copy.bothWays(via)), note(c.ignore, 12)],
            c.text(code),
        );
    },
    resetCode(locale: Locale, code: string): Email {
        const c = NOTIFICATIONS[locale].resetCode;
        return build(
            locale,
            c.subject,
            c.title,
            [paragraph(c.intro), codeBox(code), note(c.ignore)],
            c.text(code),
        );
    },
    passwordChanged: (locale: Locale, link: string) => notice(locale, "passwordChanged", link),
    twoFactor: (locale: Locale, enabled: boolean, link: string) =>
        notice(locale, enabled ? "twoFactorEnabled" : "twoFactorDisabled", link),
    phoneChanged: (locale: Locale, link: string) => notice(locale, "phoneChanged", link),
};
