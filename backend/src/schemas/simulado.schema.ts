import { z } from "zod";

// Vazio limpa a resposta; várias opções cobrem as questões de múltipla resposta.
export const salvarRespostaSchema = z.object({
    optionIds: z.array(z.uuid()).max(10),
});

export const createSimuladoSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(3, "O slug deve ter ao menos 3 caracteres")
        .max(80)
        .regex(/^[a-z0-9-]+$/, "Use apenas minúsculas, números e hífen"),
    name: z.string().trim().min(3, "O nome deve ter ao menos 3 caracteres").max(160),
    description: z.string().max(2000).optional(),
    durationMinutes: z.int().positive("A duração deve ser positiva"),
    questionCount: z.int().positive("A quantidade de questões deve ser positiva"),
    passPercent: z.int().min(0).max(100),
    published: z.boolean().default(false),
});

export const updateSimuladoSchema = z.object({
    name: z.string().trim().min(3).max(160).optional(),
    description: z.string().max(2000).optional(),
    durationMinutes: z.int().positive().optional(),
    questionCount: z.int().positive().optional(),
    passPercent: z.int().min(0).max(100).optional(),
    published: z.boolean().optional(),
});

// Questão de simulado: aceita múltipla resposta, então exige ao menos uma correta.
export const simuladoQuestionSchema = z.object({
    statement: z.string().trim().min(3, "O enunciado deve ter ao menos 3 caracteres"),
    topic: z.string().trim().max(60).optional(),
    explanation: z.string().max(2000).optional(),
    options: z
        .array(
            z.object({
                text: z.string().trim().min(1, "A alternativa não pode ser vazia"),
                isCorrect: z.boolean(),
            }),
        )
        .min(2, "A questão precisa de ao menos 2 alternativas")
        .max(6, "No máximo 6 alternativas")
        .refine((opts) => opts.some((o) => o.isCorrect), "Marque ao menos uma alternativa correta"),
});
