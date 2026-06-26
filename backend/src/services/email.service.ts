import { env } from "../config/env.ts";

export const emailService = {
    async enviarVerificacao(email: string, token: string) {
        const link = `${env.FRONTEND_URL}/verificar-email?token=${token}`

        console.log(`[DEV] Verificação de email para ${email}: ${link}`);
    }
}