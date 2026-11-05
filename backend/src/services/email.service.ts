import nodemailer from "nodemailer";
import { env } from "../config/env.ts";
import type { Locale } from "../i18n/locale.ts";
import { emailTemplates, type Email } from "./emailTemplates.ts";

const smtpConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = smtpConfigured
    ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: Number(env.SMTP_PORT),
          secure: env.SMTP_SECURE,
          auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

// A failure is logged, not thrown: signing up must not break because the email
// did not go out.
async function send(to: string, { subject, html, text }: Email) {
    if (!transporter) {
        // In dev it logs the body (with the link or code) so the flows can be
        // tested without SMTP.
        console.log(`[EMAIL] (SMTP not configured) to=${to} subject="${subject}"\n${text}`);
        return;
    }
    try {
        const info = await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log(`[EMAIL] preview: ${preview}`);
    } catch (e) {
        console.error(`Failed to send email to ${to}:`, e);
    }
}

// The screens keep the same URL in both languages.
const frontendLink = (path: string) => `${env.FRONTEND_URL}${path}`;

// Every email goes in the language saved in the account.
export const emailService = {
    async sendVerification(email: string, token: string, locale: Locale) {
        const link = frontendLink(`/verificar-email?token=${token}`);
        await send(email, emailTemplates.verification(locale, link));
    },
    async sendPasswordReset(email: string, token: string, locale: Locale) {
        const link = frontendLink(`/redefinir-senha?token=${token}`);
        await send(email, emailTemplates.passwordReset(locale, link));
    },
    async sendCreatePassword(
        email: string,
        token: string,
        provider: string | null,
        locale: Locale,
    ) {
        const link = frontendLink(`/redefinir-senha?token=${token}`);
        await send(email, emailTemplates.createPassword(locale, link, provider));
    },
    async sendCreatePasswordCode(
        email: string,
        code: string,
        provider: string | null,
        locale: Locale,
    ) {
        await send(email, emailTemplates.createPasswordCode(locale, code, provider));
    },
    async sendResetCode(email: string, code: string, locale: Locale) {
        await send(email, emailTemplates.resetCode(locale, code));
    },
    async sendPasswordChangedNotice(email: string, locale: Locale) {
        await send(email, emailTemplates.passwordChanged(locale, frontendLink("/recuperar-senha")));
    },
    async sendTwoFactorNotice(email: string, enabled: boolean, locale: Locale) {
        const link = frontendLink("/recuperar-senha");
        await send(email, emailTemplates.twoFactor(locale, enabled, link));
    },
    async sendPhoneChangedNotice(email: string, locale: Locale) {
        await send(email, emailTemplates.phoneChanged(locale, frontendLink("/recuperar-senha")));
    },
};
