import { z } from "zod";

export const createTrailSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    level: z.enum(["iniciante", "intermediario", "avancado"]),
    description: z.string().min(10, "A descrição deve ter ao menos 10 caracteres"),
});

export const createLessonSchema = z.object({
    title: z.string().min(3, "Título deve ter ao menos 3 caracteres"),
    content: z.string().optional(),
    position: z.int().positive("A posição deve ser um número positivo")
});

export const createModuleSchema = z.object({
    title: z.string().min(2, "Título deve ter ao menos 2 caracteres"),
    position: z.int().positive("A posição deve ser um número positivo")
});

export const createQuestionSchema = z.object({
    statement: z.string().min(3, "O enunciado deve ter ao menos 3 caracteres"),
    position: z.int().positive("A posição deve ser um número positivo"),
    options: z
        .array(z.object({
            text: z.string().min(1, "A alternativa não pode ser vazia"),
            isCorrect: z.boolean()
        }))
        .min(2, "A questão precisa de ao menos 2 alternativas")
        .refine(
            (opts) => opts.filter((o) => o.isCorrect).length === 1,
            "A questão precisa de exatamente uma alternativa correta"
        )
});

export const submitQuizSchema = z.object({
    answers: z
        .array(z.object({
            questionId: z.uuid("ID de questão inválido"),
            optionId: z.uuid("ID de alternativa inválido")
        }))
        .min(1, "Envie ao menos uma resposta")
});