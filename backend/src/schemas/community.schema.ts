import { z } from "zod";

export const createPostSchema = z.object({
    kind: z.enum(["duvida", "solucao", "conquista", "post"]).default("post"),
    content: z
        .string()
        .transform((v) => v.trim())
        .refine(
            (v) => v.length >= 1 && v.length <= 2000,
            "A publicação deve ter entre 1 e 2000 caracteres.",
        ),
    code: z.string().max(6000).optional(),
    codeLanguage: z.string().max(30).optional(),
    tags: z.array(z.string().max(40)).max(5).optional(),
    // Only accepts paths recorded by our own upload; never an arbitrary URL.
    imageUrl: z
        .string()
        .regex(/^\/uploads\/comunidade\/[\w.-]+$/)
        .optional(),
});

export const commentSchema = z.object({
    content: z
        .string()
        .transform((v) => v.trim())
        .refine(
            (v) => v.length >= 1 && v.length <= 1000,
            "O comentário deve ter entre 1 e 1000 caracteres.",
        ),
    parentId: z.string().uuid().optional(),
});
