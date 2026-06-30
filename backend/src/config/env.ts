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
});

// Valida os dados e lança erro se tiver algo errado.
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("Variáveis ambientes inválidas:", _env.error.format());
    throw new Error("Variáveis ambientes inválidas.");
}

export const env = _env.data;
