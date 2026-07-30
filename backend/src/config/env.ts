import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter ao menos 32 caracteres."),
    PORT: z.string().default("3001"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    DB_SSL: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    // OAuth (login social). Opcionais: cada provedor só liga se tiver as duas chaves.
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    // Base pública do backend, para montar a redirect_uri do OAuth.
    // Dev: http://localhost:3001 · Prod: https://ensinadev.com.br/api
    OAUTH_CALLBACK_BASE: z.string().url().default("http://localhost:3001"),
    // Serviço interno que executa o código dos desafios em containers isolados.
    RUNNER_URL: z.string().url().default("http://runner:8080"),
    // Serviço interno dos laboratórios de Linux (terminal por WebSocket).
    LABS_URL: z.string().default("ws://labs:8090"),
    // Envio de email por SMTP (opcional). Sem host/user/pass, o backend só loga o link.
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default("587"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    EMAIL_FROM: z.string().default("ensina.dev <nao-responda@ensinadev.com.br>"),

    // Evolution API (gateway WhatsApp). Sem URL/KEY, o envio por WhatsApp vira no-op.
    EVOLUTION_URL: z.string().url().optional(),
    EVOLUTION_API_KEY: z.string().optional(),
    EVOLUTION_INSTANCE: z.string().default("ensinadev"),
    // Gateway de pagamento do apoio (AbacatePay). Sem a chave, a página existe mas não cobra.
    ABACATEPAY_API_URL: z.string().url().default("https://api.abacatepay.com/v1"),
    ABACATEPAY_API_KEY: z.string().optional(),
    ABACATEPAY_WEBHOOK_SECRET: z.string().optional(),
    ABACATEPAY_PRODUCT_PIX_AUTO: z.string().optional(),
    // Analisador de currículo. Sem modo de IA roda só o motor determinístico;
    // "cli" usa o Claude Code da máquina (local) e "api" usa a chave (produção).
    ATS_IA_MODO: z.enum(["off", "cli", "api"]).default("off"),
    ATS_API_KEY: z.string().optional(),
    // O modo "api" fala o protocolo da Anthropic, e o DeepSeek expõe um endpoint
    // nesse formato. Apagar a base URL manda as chamadas para a Anthropic.
    ATS_API_BASE_URL: z.string().url().default("https://api.deepseek.com/anthropic"),
    ATS_MODELO: z.string().default("deepseek-v4-pro"),
    ATS_MODELO_CLI: z.string().default("opus"),
    // O v4-pro passa de 100s em currículo grande, então a margem é generosa.
    ATS_TIMEOUT_S: z.coerce.number().int().positive().default(180),
    ATS_LIMITE_MENSAL: z.coerce.number().int().positive().default(30),
    // Dados do emissor impressos no certificado. Sem os três, a emissão fica desligada.
    CERT_RAZAO_SOCIAL: z.string().optional(),
    CERT_CNPJ: z.string().optional(),
    CERT_RESPONSAVEL: z.string().optional(),
});

// Valida os dados e lança erro se tiver algo errado.
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("Variáveis ambientes inválidas:", _env.error.format());
    throw new Error("Variáveis ambientes inválidas.");
}

export const env = _env.data;
