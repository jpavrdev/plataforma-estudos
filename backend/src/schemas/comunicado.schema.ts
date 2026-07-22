import { z } from "zod";

export const createComunicadoSchema = z.object({
    kind: z.enum(["aviso", "pesquisa"]),
    title: z.string().trim().min(2, "Título deve ter ao menos 2 caracteres").max(200, "Título muito longo"),
    message: z.string().trim().min(2, "Mensagem obrigatória").max(2000, "Mensagem muito longa"),
    published: z.boolean().optional(),
});

export const updateComunicadoSchema = createComunicadoSchema.partial();

export const responderComunicadoSchema = z.object({
    rating: z.int("Nota inválida").min(1, "A nota vai de 1 a 5").max(5, "A nota vai de 1 a 5"),
    comment: z.string().trim().max(2000, "Comentário muito longo").optional(),
});
