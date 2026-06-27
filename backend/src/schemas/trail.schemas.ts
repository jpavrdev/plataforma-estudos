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