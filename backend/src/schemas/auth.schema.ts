import { z } from "zod";

// Regras de senha forte, compartilhadas entre cadastro e redefinição.
const senhaForte = z
    .string()
    .min(12, "Senha deve ter ao menos 12 caracteres")
    .max(72)
    .refine((s) => /[a-z]/.test(s), "A senha deve conter uma letra minúscula")
    .refine((s) => /[A-Z]/.test(s), "A senha deve conter uma letra maiúscula")
    .refine((s) => /[0-9]/.test(s), "A senha deve conter pelo menos um número")
    .refine((s) => /[^A-Za-z0-9]/.test(s), "A senha deve conter um caractere especial");

export const registerSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    username: z
        .string()
        .trim()
        .min(3, "Usuário deve ter ao menos 3 caracteres")
        .max(20, "Usuário deve ter no máximo 20 caracteres")
        .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscore"),
    email: z.email("Email inválido"),
    password: senhaForte,
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser AAAA-MM-DD"),
    gender: z.string(),
    phone: z.string().trim().max(20, "Telefone muito longo"),
});

export const forgotPasswordSchema = z.object({
    email: z.email("Email inválido"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token é obrigatório."),
    password: senhaForte,
});

export const loginSchema = z.object({
    email: z.email("Email inválido."),
    password: z.string().min(1, "Senha é obrigatória."),
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, "Refresh Token é obrigatório."),
});

export const updateMeSchema = z.object({
    name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(255).optional(),
    username: z
        .string()
        .trim()
        .min(3, "Usuário deve ter ao menos 3 caracteres")
        .max(20, "Usuário deve ter no máximo 20 caracteres")
        .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscore")
        .optional(),
    bio: z.string().max(500, "A bio deve ter no máximo 500 caracteres").optional(),
    location: z.string().max(120).optional(),
    occupation: z.string().max(120).optional(),
    languages: z.array(z.string().min(1).max(60)).max(20).optional(),
    github: z.string().max(200).optional(),
    linkedin: z.string().max(200).optional(),
    x: z.string().max(200).optional(),
});

// Campos que o login social não traz e o usuário completa depois.
export const completarPerfilSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, "Usuário deve ter ao menos 3 caracteres")
        .max(20, "Usuário deve ter no máximo 20 caracteres")
        .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscore"),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser AAAA-MM-DD"),
    gender: z.string().min(1, "Selecione o gênero"),
    phone: z.string().trim().min(1, "Informe o telefone").max(20, "Telefone muito longo"),
});
