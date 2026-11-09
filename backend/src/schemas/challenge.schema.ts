import { z } from "zod";

// What the runner executes today. The database enum also reserves "csharp".
const LANGUAGES = ["javascript", "python", "java"] as const;

// Running examples or submitting: the code is limited so it does not overload the runner.
// durationSeconds only matters on submission (the student's timer, informational).
export const runChallengeSchema = z.object({
    language: z.enum(LANGUAGES),
    code: z.string().min(1, "Envie algum código").max(50_000, "Código muito longo"),
    durationSeconds: z.number().int().min(0).max(86_400).nullable().optional(),
});

export const challengeCommentSchema = z.object({
    content: z
        .string()
        .transform((v) => v.trim())
        .refine(
            (v) => v.length >= 1 && v.length <= 1000,
            "O comentário deve ter entre 1 e 1000 caracteres.",
        ),
});

const blockSchema = z.object({
    type: z.enum(["text", "code", "quote", "table"]),
    value: z.string(),
});

const testSchema = z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isPublic: z.boolean().default(false),
});

export const createChallengeSchema = z
    .object({
        title: z.string().trim().min(3, "O título deve ter ao menos 3 caracteres").max(255),
        // Display number (optional; the backend assigns the next free one when missing).
        number: z.number().int().positive().nullable().optional(),
        // Free-form topic(s), e.g. "Array · Hash Table".
        topic: z.string().trim().max(160).default(""),
        // stdin: reads stdin/prints stdout. function: implements a function called with args.
        kind: z.enum(["stdin", "function"]).default("stdin"),
        // Method name (required when kind = function), e.g. "twoSum".
        entryPoint: z.string().trim().max(120).default(""),
        statementBlocks: z.array(blockSchema).default([]),
        difficulty: z.enum(["facil", "medio", "dificil"]).default("facil"),
        starterCode: z.record(z.string(), z.string()).default({}),
        activeDate: z.iso.date().nullable().optional(),
        published: z.boolean().default(false),
        tests: z
            .array(testSchema)
            .min(1, "Adicione ao menos um caso de teste")
            .refine(
                (t) => t.some((x) => x.isPublic),
                "Marque ao menos um caso como exemplo (público)",
            ),
    })
    .refine((d) => d.kind !== "function" || /^[A-Za-z_]\w*$/.test(d.entryPoint), {
        message: "Informe o nome do método (entryPoint) para desafios do tipo função.",
        path: ["entryPoint"],
    });
