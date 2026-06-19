import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser AAAA-MM-DD"),
  gender: z.string(),
  phone: z.string(),
});

export const loginSchema = z.object({
  email: z.email("Email inválido."),
  password: z.string().min(1, "Senha é obrigatória."),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh Token é obrigatório.")
});