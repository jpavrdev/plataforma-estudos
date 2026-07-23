import { z } from "zod";

export const createTrailSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(255),
    level: z.enum(["iniciante", "intermediario", "avancado"]),
    description: z.string().min(10, "A descrição deve ter ao menos 10 caracteres"),
    tagIds: z.array(z.uuid()).optional(),
    workloadHours: z.number().int().min(1).max(999).nullable().optional(),
});

export const updateTrailSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(255).optional(),
    level: z.enum(["iniciante", "intermediario", "avancado"]).optional(),
    description: z.string().min(10, "A descrição deve ter ao menos 10 caracteres").optional(),
    tagIds: z.array(z.uuid()).optional(),
    workloadHours: z.number().int().min(1).max(999).nullable().optional(),
});

export const reviewTrailSchema = z.object({
    stars: z.number().int().min(1, "Nota de 1 a 5").max(5, "Nota de 1 a 5"),
    comment: z.string().max(1000, "Comentário muito longo").optional(),
});

export const createTagSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(60, "Nome muito longo"),
});

export const updateTagSchema = createTagSchema;

export const createLanguageSchema = z.object({
    name: z.string().min(1, "Nome obrigatório").max(60, "Nome muito longo"),
});

export const updateLanguageSchema = createLanguageSchema;

export const createAchievementSchema = z
    .object({
        name: z.string().min(2, "Nome obrigatório").max(80, "Nome muito longo"),
        description: z.string().min(2, "Descrição obrigatória").max(200, "Descrição muito longa"),
        icon: z.enum(["trophy", "flame", "star", "check", "medal", "bookmark", "bug"]),
        criteriaType: z.enum(["xp_total", "lessons_completed", "questions_correct", "special"]),
        // "special" é concedida à mão pelo admin, então não exige valor.
        threshold: z.int().min(0, "O valor não pode ser negativo").default(0),
    })
    .refine((d) => d.criteriaType === "special" || d.threshold > 0, {
        message: "Informe um valor maior que zero.",
        path: ["threshold"],
    });

export const updateAchievementSchema = createAchievementSchema;

export const grantAchievementSchema = z.object({
    userId: z.uuid("Usuário inválido"),
});

export const glossaryTermSchema = z.object({
    term: z.string().min(1, "Termo obrigatório").max(60, "Termo muito longo"),
    definition: z.string().min(2, "Definição obrigatória").max(400, "Definição muito longa"),
});

export const createLessonSchema = z.object({
    title: z.string().min(3, "Título deve ter ao menos 3 caracteres").max(255),
    content: z.string().optional(),
    position: z.int().positive("A posição deve ser um número positivo"),
});

export const createModuleSchema = z.object({
    title: z.string().min(2, "Título deve ter ao menos 2 caracteres").max(255),
    position: z.int().positive("A posição deve ser um número positivo"),
});

export const createQuestionSchema = z.object({
    statement: z.string().min(3, "O enunciado deve ter ao menos 3 caracteres"),
    position: z.int().positive("A posição deve ser um número positivo"),
    options: z
        .array(
            z.object({
                text: z.string().min(1, "A alternativa não pode ser vazia"),
                isCorrect: z.boolean(),
            }),
        )
        .min(2, "A questão precisa de ao menos 2 alternativas")
        .refine(
            (opts) => opts.filter((o) => o.isCorrect).length === 1,
            "A questão precisa de exatamente uma alternativa correta",
        ),
});

export const submitQuizSchema = z.object({
    answers: z
        .array(
            z.object({
                questionId: z.uuid("ID de questão inválido"),
                optionId: z.uuid("ID de alternativa inválido"),
            }),
        )
        .min(1, "Envie ao menos uma resposta")
        .max(50, "Quiz não tem tantas questões"),
});

export const checkAnswerSchema = z.object({
    questionId: z.uuid("ID de questão inválido"),
    optionId: z.uuid("ID de alternativa inválido"),
});

// Salvar a aula inteira pelo Estúdio. Lenient para rascunho; a validação forte
// (exatamente 1 correta, minimo de questoes) acontece no controller ao publicar.
export const saveLessonStudioSchema = z.object({
    title: z.string().min(3, "Título deve ter ao menos 3 caracteres").max(255),
    content: z.string().nullable().optional(),
    contentBlocks: z
        .array(
            z.object({
                type: z.enum(["text", "code", "image", "video", "quote", "table"]),
                value: z.string(),
            }),
        )
        .optional(),
    published: z.boolean().optional(),
    questions: z.array(
        z.object({
            statement: z.string(),
            difficulty: z.enum(["facil", "medio", "dificil"]).optional(),
            options: z.array(
                z.object({
                    text: z.string(),
                    isCorrect: z.boolean(),
                }),
            ),
        }),
    ),
});
