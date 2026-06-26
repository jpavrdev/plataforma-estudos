import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter ao menos 32 caracteres."),
    PORT: z.string().default("3001"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    DB_SSL: z.string().optional().transform((v) => v === "true"),
});

// Valida os dados e lança erro se tiver algo errado.
const _env = envSchema.safeParse(process.env);

if(!_env.success) {
    console.error("Variáveis ambientes inválidas:", _env.error.format());
    throw new Error("Variáveis ambientes inválidas.");
}

export const env = _env.data;