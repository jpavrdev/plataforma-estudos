import { z } from "zod";

// Empty clears the answer; several options cover the multiple-answer questions.
export const saveAnswerSchema = z.object({
    optionIds: z.array(z.uuid()).max(10),
});

// All optional: without a body, the attempt uses the exam's official settings.
export const startAttemptSchema = z.object({
    questionCount: z.int().min(5).max(200).optional(),
    comTempo: z.boolean().optional(),
    duracaoMinutos: z.int().min(1).max(300).optional(),
    topicos: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
    // Practice mode: checks each question right away. It ignores comTempo (practice
    // never has a timer).
    pratica: z.boolean().optional(),
});

export const createPracticeExamSchema = z.object({
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

export const updatePracticeExamSchema = z.object({
    name: z.string().trim().min(3).max(160).optional(),
    description: z.string().max(2000).optional(),
    durationMinutes: z.int().positive().optional(),
    questionCount: z.int().positive().optional(),
    passPercent: z.int().min(0).max(100).optional(),
    published: z.boolean().optional(),
});

// Exam question: it accepts multiple answers, so it requires at least one right option.
export const examQuestionSchema = z.object({
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

// Saving everything (atomic): each question may have an id (edits) or not (creates);
// the ones missing from the list are removed. Validating the whole list is all-or-nothing.
export const syncExamQuestionsSchema = z.object({
    questions: z.array(examQuestionSchema.extend({ id: z.uuid().optional() })).max(200),
});
