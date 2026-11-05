import type { Locale } from "./locale.ts";

// Texts of the emails and WhatsApp messages, one set per language. The emails go
// in the language saved in the account (users.locale), not the one of the screen
// that asked for them.
const ptBR = {
    brand: "Ensina Dev",
    pasteLink: "Se o botão não funcionar, cole este link no navegador:",
    resetButton: "Redefinir senha",
    viaProvider: (provider: string | null) => (provider ? `pelo ${provider}` : "por login social"),
    bothWays: (via: string) =>
        `Depois de criar, você poderá entrar das duas formas: com email e senha, ou ${via} como sempre fez.`,

    verification: {
        subject: "Confirme seu email",
        title: "Confirme seu email",
        intro: "Falta pouco para começar. Clique no botão abaixo para ativar sua conta.",
        button: "Confirmar email",
        ignore: "Se você não criou uma conta, pode ignorar este email.",
        text: (link: string) =>
            `Confirme seu email para ativar sua conta no Ensina Dev:\n${link}\n\nSe você não criou uma conta, ignore este email.`,
    },
    passwordReset: {
        subject: "Redefinir sua senha",
        title: "Redefinir sua senha",
        intro: "Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova. O link vale por 1 hora.",
        ignore: "Se você não pediu isso, pode ignorar este email: sua senha continua a mesma.",
        text: (link: string) =>
            `Redefina sua senha no Ensina Dev (o link vale por 1 hora):\n${link}\n\nSe você não pediu isso, ignore este email.`,
    },
    createPassword: {
        subject: "Crie uma senha",
        title: "Crie uma senha para sua conta",
        intro: (via: string) =>
            `Você pediu para redefinir a senha, mas sua conta entra ${via} e ainda não tem uma. Clique no botão abaixo para criar. O link vale por 1 hora.`,
        button: "Criar senha",
        ignore: "Se você não pediu isso, pode ignorar este email: sua conta continua como está.",
        text: (link: string, via: string) =>
            `Sua conta no Ensina Dev entra ${via} e ainda não tem senha. Crie uma por este link (vale por 1 hora):\n${link}\n\nDepois você poderá entrar das duas formas. Se você não pediu isso, ignore este email.`,
    },
    createPasswordCode: {
        subject: "Seu código para criar a senha",
        title: "Seu código para criar uma senha",
        intro: (via: string) =>
            `Sua conta entra ${via} e ainda não tem senha. Use o código abaixo para criar uma. Ele vale por 10 minutos.`,
        ignore: "Se você não pediu isso, ignore este email.",
        text: (code: string) =>
            `Seu código para criar uma senha no Ensina Dev é ${code}. Ele vale por 10 minutos.\n\nSe você não pediu isso, ignore este email.`,
    },
    resetCode: {
        subject: "Seu código de redefinição",
        title: "Seu código para redefinir a senha",
        intro: "Use o código abaixo para redefinir sua senha. Ele vale por 10 minutos.",
        ignore: "Se você não pediu isso, ignore este email: sua senha continua a mesma.",
        text: (code: string) =>
            `Seu código para redefinir a senha no Ensina Dev é ${code}. Ele vale por 10 minutos.\n\nSe você não pediu isso, ignore este email.`,
    },
    passwordChanged: {
        subject: "Sua senha foi redefinida",
        title: "Sua senha foi redefinida",
        intro: "A senha da sua conta no Ensina Dev acabou de ser redefinida, e as sessões abertas foram encerradas.",
        action: "Se não foi você, redefina a senha agora pelo email e confira o telefone no seu perfil:",
    },
    twoFactorEnabled: {
        subject: "A verificação em duas etapas foi ativada",
        title: "A verificação em duas etapas foi ativada",
        intro: "A verificação em duas etapas acabou de ser ativada na sua conta do Ensina Dev. A partir de agora, o login pede também o código do app autenticador.",
        action: "Se não foi você, redefina a senha agora pelo email:",
    },
    twoFactorDisabled: {
        subject: "A verificação em duas etapas foi desativada",
        title: "A verificação em duas etapas foi desativada",
        intro: "A verificação em duas etapas acabou de ser desativada na sua conta do Ensina Dev. O login volta a pedir só a senha.",
        action: "Se não foi você, redefina a senha agora pelo email:",
    },
    phoneChanged: {
        subject: "O telefone da sua conta mudou",
        title: "O telefone da sua conta mudou",
        intro: "O telefone de recuperação da sua conta no Ensina Dev acabou de ser trocado.",
        action: "Se não foi você, redefina a senha agora pelo email e corrija o telefone no seu perfil:",
    },

    whatsapp: {
        resetCode: (code: string) =>
            `Ensina Dev\n\nSeu código para redefinir a senha é *${code}*.\nEle vale por 10 minutos. Se você não pediu, ignore esta mensagem.`,
        phoneCode: (code: string) =>
            `Ensina Dev\n\nSeu código para confirmar este telefone é *${code}*.\nEle vale por 10 minutos. Se você não pediu, ignore esta mensagem.`,
    },
};

export type NotificationCopy = typeof ptBR;

const en: NotificationCopy = {
    brand: "Ensina Dev",
    pasteLink: "If the button does not work, paste this link into your browser:",
    resetButton: "Reset password",
    viaProvider: (provider: string | null) =>
        provider ? `with ${provider}` : "with social sign-in",
    bothWays: (via: string) =>
        `After that, you can sign in both ways: with email and password, or ${via} as you always have.`,

    verification: {
        subject: "Confirm your email",
        title: "Confirm your email",
        intro: "You are almost ready to start. Click the button below to activate your account.",
        button: "Confirm email",
        ignore: "If you did not create an account, you can ignore this email.",
        text: (link: string) =>
            `Confirm your email to activate your Ensina Dev account:\n${link}\n\nIf you did not create an account, ignore this email.`,
    },
    passwordReset: {
        subject: "Reset your password",
        title: "Reset your password",
        intro: "We received a request to reset your password. Click the button below to create a new one. The link is valid for 1 hour.",
        ignore: "If you did not ask for this, you can ignore this email: your password stays the same.",
        text: (link: string) =>
            `Reset your Ensina Dev password (the link is valid for 1 hour):\n${link}\n\nIf you did not ask for this, ignore this email.`,
    },
    createPassword: {
        subject: "Create a password",
        title: "Create a password for your account",
        intro: (via: string) =>
            `You asked to reset your password, but your account signs in ${via} and does not have one yet. Click the button below to create it. The link is valid for 1 hour.`,
        button: "Create password",
        ignore: "If you did not ask for this, you can ignore this email: your account stays as it is.",
        text: (link: string, via: string) =>
            `Your Ensina Dev account signs in ${via} and does not have a password yet. Create one with this link (valid for 1 hour):\n${link}\n\nAfter that you can sign in both ways. If you did not ask for this, ignore this email.`,
    },
    createPasswordCode: {
        subject: "Your code to create a password",
        title: "Your code to create a password",
        intro: (via: string) =>
            `Your account signs in ${via} and does not have a password yet. Use the code below to create one. It is valid for 10 minutes.`,
        ignore: "If you did not ask for this, ignore this email.",
        text: (code: string) =>
            `Your code to create an Ensina Dev password is ${code}. It is valid for 10 minutes.\n\nIf you did not ask for this, ignore this email.`,
    },
    resetCode: {
        subject: "Your password reset code",
        title: "Your code to reset your password",
        intro: "Use the code below to reset your password. It is valid for 10 minutes.",
        ignore: "If you did not ask for this, ignore this email: your password stays the same.",
        text: (code: string) =>
            `Your code to reset your Ensina Dev password is ${code}. It is valid for 10 minutes.\n\nIf you did not ask for this, ignore this email.`,
    },
    passwordChanged: {
        subject: "Your password was reset",
        title: "Your password was reset",
        intro: "The password of your Ensina Dev account was just reset, and the open sessions were closed.",
        action: "If it was not you, reset your password now by email and check the phone in your profile:",
    },
    twoFactorEnabled: {
        subject: "Two-step verification was turned on",
        title: "Two-step verification was turned on",
        intro: "Two-step verification was just turned on for your Ensina Dev account. From now on, signing in also asks for the code from your authenticator app.",
        action: "If it was not you, reset your password now by email:",
    },
    twoFactorDisabled: {
        subject: "Two-step verification was turned off",
        title: "Two-step verification was turned off",
        intro: "Two-step verification was just turned off for your Ensina Dev account. Signing in asks only for the password again.",
        action: "If it was not you, reset your password now by email:",
    },
    phoneChanged: {
        subject: "The phone of your account changed",
        title: "The phone of your account changed",
        intro: "The recovery phone of your Ensina Dev account was just changed.",
        action: "If it was not you, reset your password now by email and fix the phone in your profile:",
    },

    whatsapp: {
        resetCode: (code: string) =>
            `Ensina Dev\n\nYour code to reset your password is *${code}*.\nIt is valid for 10 minutes. If you did not ask for it, ignore this message.`,
        phoneCode: (code: string) =>
            `Ensina Dev\n\nYour code to confirm this phone is *${code}*.\nIt is valid for 10 minutes. If you did not ask for it, ignore this message.`,
    },
};

export const NOTIFICATIONS: Record<Locale, NotificationCopy> = { "pt-BR": ptBR, en };
