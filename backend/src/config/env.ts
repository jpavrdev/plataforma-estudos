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
    // OAuth (social login). Optional: each provider turns on only with both keys.
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    // Public base of the backend, to build the OAuth redirect_uri.
    // Dev: http://localhost:3001 · Prod: https://ensinadev.com.br/api
    OAUTH_CALLBACK_BASE: z.string().url().default("http://localhost:3001"),
    // Internal service that runs the challenge code in isolated containers.
    RUNNER_URL: z.string().url().default("http://runner:8080"),
    // Internal service for the Linux labs (terminal over WebSocket).
    LABS_URL: z.string().default("ws://labs:8090"),
    // Email over SMTP (optional). Without host/user/pass, the backend only logs the link.
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default("587"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    EMAIL_FROM: z.string().default("ensina.dev <nao-responda@ensinadev.com.br>"),

    // Evolution API (WhatsApp gateway). Without URL/KEY, sending over WhatsApp is a no-op.
    EVOLUTION_URL: z.string().url().optional(),
    EVOLUTION_API_KEY: z.string().optional(),
    EVOLUTION_INSTANCE: z.string().default("ensinadev"),
    // Payment gateway for supporters (AbacatePay). Without the key, the page exists but does not charge.
    ABACATEPAY_API_URL: z.string().url().default("https://api.abacatepay.com/v1"),
    ABACATEPAY_API_KEY: z.string().optional(),
    ABACATEPAY_WEBHOOK_SECRET: z.string().optional(),
    ABACATEPAY_PRODUCT_PIX_AUTO: z.string().optional(),
    // Resume analyzer. Without an AI mode only the deterministic engine runs;
    // "cli" uses the machine's Claude Code (local) and "api" uses the key (production).
    ATS_IA_MODO: z.enum(["off", "cli", "api"]).default("off"),
    ATS_API_KEY: z.string().optional(),
    // The "api" mode speaks the Anthropic protocol, and DeepSeek exposes an endpoint
    // in that format. Removing the base URL sends the calls to Anthropic.
    ATS_API_BASE_URL: z.string().url().default("https://api.deepseek.com/anthropic"),
    ATS_MODELO: z.string().default("deepseek-v4-pro"),
    ATS_MODELO_CLI: z.string().default("opus"),
    // v4-pro takes more than 100s on a large resume, so the margin is generous.
    ATS_TIMEOUT_S: z.coerce.number().int().positive().default(180),
    ATS_LIMITE_MENSAL: z.coerce.number().int().positive().default(30),
    // Issuer data printed on the certificate. Without all three, issuing is off.
    CERT_RAZAO_SOCIAL: z.string().optional(),
    CERT_CNPJ: z.string().optional(),
    CERT_RESPONSAVEL: z.string().optional(),
    // Token of the external monitor to read /health/dependencias. Without it, the route does not exist.
    MONITOR_TOKEN: z.string().min(32, "MONITOR_TOKEN deve ter ao menos 32 caracteres.").optional(),
    // Admin routes only accept sessions verified by 2FA. "false" turns the
    // requirement off, for an emergency (or for the tests that are not about 2FA).
    ADMIN_REQUIRE_2FA: z
        .string()
        .optional()
        .transform((v) => v !== "false"),
});

// Validates the values and throws if anything is wrong.
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("Invalid environment variables:", _env.error.format());
    throw new Error("Invalid environment variables.");
}

export const env = _env.data;
