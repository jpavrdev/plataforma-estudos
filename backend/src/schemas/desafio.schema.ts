import { z } from "zod";

// Linguagens executáveis hoje. O enum do banco (challenge_language) já reserva
// "csharp"; ele entra aqui quando a imagem do runner estiver pronta.
const LINGUAGENS = ["javascript", "python"] as const;

// Rodar exemplos ou submeter: o código é limitado para não estourar o runner.
export const executarDesafioSchema = z.object({
    language: z.enum(LINGUAGENS),
    code: z.string().min(1, "Envie algum código").max(50_000, "Código muito longo"),
});

const blocoSchema = z.object({
    type: z.enum(["text", "code", "quote", "table"]),
    value: z.string(),
});

const testeSchema = z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isPublic: z.boolean().default(false),
});

export const criarDesafioSchema = z
    .object({
        title: z.string().trim().min(3, "O título deve ter ao menos 3 caracteres").max(255),
        // Número de exibição (opcional; o backend atribui o próximo livre quando ausente).
        number: z.number().int().positive().nullable().optional(),
        // Tema(s) livres, ex.: "Array · Hash Table".
        topic: z.string().trim().max(160).default(""),
        // stdin: lê stdin/imprime stdout. function: implementa uma função chamada com args.
        kind: z.enum(["stdin", "function"]).default("stdin"),
        // Nome do método (obrigatório quando kind = function), ex.: "twoSum".
        entryPoint: z.string().trim().max(120).default(""),
        statementBlocks: z.array(blocoSchema).default([]),
        difficulty: z.enum(["facil", "medio", "dificil"]).default("facil"),
        starterCode: z.record(z.string(), z.string()).default({}),
        activeDate: z.iso.date().nullable().optional(),
        published: z.boolean().default(false),
        tests: z
            .array(testeSchema)
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
