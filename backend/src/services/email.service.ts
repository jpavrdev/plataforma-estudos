import { env } from "../config/env.ts";

export const emailService = {
    async enviarVerificacao(email: string, token: string) {
        const link = `${env.FRONTEND_URL}/verificar-email?token=${token}`;

        console.log(`[VERIFY-LINK] ${email} ${link}`);
    },
};
