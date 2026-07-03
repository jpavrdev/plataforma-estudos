// Envia um email de verificação de teste.
// - Sem SMTP configurado: usa a conta de teste do nodemailer (Ethereal) e imprime
//   uma URL de preview do email renderizado.
// - Com SMTP configurado (ex.: em produção): envia de verdade para o endereço dado.
//
// Uso:  node scripts/testar-email.ts [email-de-destino]
import nodemailer from "nodemailer";

async function main() {
    if (!process.env.SMTP_HOST) {
        console.log("SMTP não configurado: usando a conta de teste do nodemailer (Ethereal).");
        const acc = await nodemailer.createTestAccount();
        process.env.SMTP_HOST = acc.smtp.host;
        process.env.SMTP_PORT = String(acc.smtp.port);
        process.env.SMTP_SECURE = String(acc.smtp.secure);
        process.env.SMTP_USER = acc.user;
        process.env.SMTP_PASS = acc.pass;
    }
    // env.ts valida estas duas; em produção já vêm do ambiente.
    process.env.DATABASE_URL ??= "postgres://x:x@localhost:5432/x";
    process.env.JWT_SECRET ??= "chave_de_teste_com_pelo_menos_32_caracteres_ok";

    const destino = process.argv[2] || "aluno@example.com";
    const { emailService } = await import("../src/services/email.service.ts");
    console.log(`Enviando email de verificação de teste para ${destino}...`);
    await emailService.enviarVerificacao(destino, "token-de-teste-abc123");
    console.log("Concluído.");
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
