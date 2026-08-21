import nodemailer from "nodemailer";
import { env } from "../config/env.ts";

const smtpConfigurado = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = smtpConfigurado
    ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: Number(env.SMTP_PORT),
          secure: env.SMTP_SECURE,
          auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

interface Mensagem {
    to: string;
    subject: string;
    html: string;
    text: string;
}

// Uma falha é logada, não propagada: o cadastro não deve quebrar porque o email não saiu.
async function enviar({ to, subject, html, text }: Mensagem) {
    if (!transporter) {
        // Em dev registra o corpo (com o link) para dar pra testar o fluxo sem SMTP.
        console.log(`[EMAIL] (SMTP não configurado) para=${to} assunto="${subject}"\n${text}`);
        return;
    }
    try {
        const info = await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log(`[EMAIL] preview: ${preview}`);
    } catch (e) {
        console.error(`Falha ao enviar email para ${to}:`, e);
    }
}

// Estilos inline: clientes de email ignoram CSS externo.
function layout(titulo: string, corpo: string) {
    return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#251f31">
  <div style="font-size:20px;font-weight:700;color:#2d6bf5">ensina.dev</div>
  <h1 style="font-size:22px;margin:22px 0 8px">${titulo}</h1>
  ${corpo}
</div>`;
}

export const emailService = {
    async enviarVerificacao(email: string, token: string) {
        const link = `${env.FRONTEND_URL}/verificar-email?token=${token}`;
        const html = layout(
            "Confirme seu email",
            `<p style="font-size:15px;line-height:1.6;color:#555">Falta pouco para começar. Clique no botão abaixo para ativar sua conta.</p>
  <a href="${link}" style="display:inline-block;margin:20px 0;background:#2d6bf5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600">Confirmar email</a>
  <p style="font-size:13px;line-height:1.6;color:#888">Se o botão não funcionar, cole este link no navegador:<br><a href="${link}" style="color:#2d6bf5;word-break:break-all">${link}</a></p>
  <p style="font-size:13px;color:#888;margin-top:24px">Se você não criou uma conta, pode ignorar este email.</p>`,
        );
        const text = `Confirme seu email para ativar sua conta no ensina.dev:\n${link}\n\nSe você não criou uma conta, ignore este email.`;
        await enviar({ to: email, subject: "Confirme seu email · ensina.dev", html, text });
    },
    async enviarResetSenha(email: string, token: string) {
        const link = `${env.FRONTEND_URL}/redefinir-senha?token=${token}`;
        const html = layout(
            "Redefinir sua senha",
            `<p style="font-size:15px;line-height:1.6;color:#555">Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova. O link vale por 1 hora.</p>
  <a href="${link}" style="display:inline-block;margin:20px 0;background:#2d6bf5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600">Redefinir senha</a>
  <p style="font-size:13px;line-height:1.6;color:#888">Se o botão não funcionar, cole este link no navegador:<br><a href="${link}" style="color:#2d6bf5;word-break:break-all">${link}</a></p>
  <p style="font-size:13px;color:#888;margin-top:24px">Se você não pediu isso, pode ignorar este email: sua senha continua a mesma.</p>`,
        );
        const text = `Redefina sua senha no ensina.dev (o link vale por 1 hora):\n${link}\n\nSe você não pediu isso, ignore este email.`;
        await enviar({ to: email, subject: "Redefinir sua senha · ensina.dev", html, text });
    },
    /**
     * Quem entrou por login social não tem senha para redefinir, então o email
     * de "esqueci a senha" precisa dizer outra coisa: que dá para criar uma agora,
     * e que o acesso pelo provedor continua valendo. Antes disso a pessoa pedia o
     * link, recebia a mensagem de que ele tinha sido enviado, e nada chegava nunca.
     */
    async enviarCriarSenha(email: string, token: string, provedor: string | null) {
        const link = `${env.FRONTEND_URL}/redefinir-senha?token=${token}`;
        const entra = provedor ? `pelo ${provedor}` : "por login social";
        const html = layout(
            "Crie uma senha para sua conta",
            `<p style="font-size:15px;line-height:1.6;color:#555">Você pediu para redefinir a senha, mas sua conta entra ${entra} e ainda não tem uma. Clique no botão abaixo para criar. O link vale por 1 hora.</p>
  <a href="${link}" style="display:inline-block;margin:20px 0;background:#2d6bf5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600">Criar senha</a>
  <p style="font-size:13px;line-height:1.6;color:#888">Se o botão não funcionar, cole este link no navegador:<br><a href="${link}" style="color:#2d6bf5;word-break:break-all">${link}</a></p>
  <p style="font-size:13px;line-height:1.6;color:#888;margin-top:24px">Depois de criar, você poderá entrar das duas formas: com email e senha, ou ${entra} como sempre fez.</p>
  <p style="font-size:13px;color:#888;margin-top:12px">Se você não pediu isso, pode ignorar este email: sua conta continua como está.</p>`,
        );
        const text = `Sua conta no ensina.dev entra ${entra} e ainda não tem senha. Crie uma por este link (vale por 1 hora):\n${link}\n\nDepois você poderá entrar das duas formas. Se você não pediu isso, ignore este email.`;
        await enviar({ to: email, subject: "Crie uma senha · ensina.dev", html, text });
    },
    /** A mesma ideia do enviarCriarSenha, no caminho do código de seis dígitos. */
    async enviarOtpCriarSenha(email: string, otp: string, provedor: string | null) {
        const entra = provedor ? `pelo ${provedor}` : "por login social";
        const html = layout(
            "Seu código para criar uma senha",
            `<p style="font-size:15px;line-height:1.6;color:#555">Sua conta entra ${entra} e ainda não tem senha. Use o código abaixo para criar uma. Ele vale por 10 minutos.</p>
  <div style="font-size:30px;font-weight:700;letter-spacing:6px;color:#2d6bf5;margin:18px 0">${otp}</div>
  <p style="font-size:13px;line-height:1.6;color:#888;margin-top:24px">Depois de criar, você poderá entrar das duas formas: com email e senha, ou ${entra} como sempre fez.</p>
  <p style="font-size:13px;color:#888;margin-top:12px">Se você não pediu isso, ignore este email.</p>`,
        );
        const text = `Seu código para criar uma senha no ensina.dev é ${otp}. Ele vale por 10 minutos.\n\nSe você não pediu isso, ignore este email.`;
        await enviar({
            to: email,
            subject: "Seu código para criar a senha · ensina.dev",
            html,
            text,
        });
    },
    async enviarOtpReset(email: string, otp: string) {
        const html = layout(
            "Seu código para redefinir a senha",
            `<p style="font-size:15px;line-height:1.6;color:#555">Use o código abaixo para redefinir sua senha. Ele vale por 10 minutos.</p>
  <div style="font-size:30px;font-weight:700;letter-spacing:6px;color:#2d6bf5;margin:18px 0">${otp}</div>
  <p style="font-size:13px;color:#888;margin-top:24px">Se você não pediu isso, ignore este email: sua senha continua a mesma.</p>`,
        );
        const text = `Seu código para redefinir a senha no ensina.dev é ${otp}. Ele vale por 10 minutos.\n\nSe você não pediu isso, ignore este email.`;
        await enviar({ to: email, subject: "Seu código de redefinição · ensina.dev", html, text });
    },
};
