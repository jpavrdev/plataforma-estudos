import { z } from "zod";

const nivel = z.enum(["iniciante", "intermediario", "avancado"]);
const fase = z.enum(["fundamentos", "core", "avancado", "deploy"]);
const tipoRef = z.enum(["trail", "module", "lesson", "simulado", "challenge"]);
const slug = z
    .string()
    .trim()
    .min(2, "Slug muito curto")
    .max(80, "Slug muito longo")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens");

export const createRoadmapSchema = z.object({
    slug: slug.optional(),
    name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(160, "Nome muito longo"),
    description: z.string().trim().min(10, "A descrição deve ter ao menos 10 caracteres"),
    level: nivel,
    icon: z.string().trim().max(40, "Ícone muito longo").optional(),
    position: z.int().min(0, "A posição não pode ser negativa").optional(),
    premium: z.boolean().optional(),
    published: z.boolean().optional(),
});

export const updateRoadmapSchema = z.object({
    slug: slug.optional(),
    name: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(160, "Nome muito longo").optional(),
    description: z.string().trim().min(10, "A descrição deve ter ao menos 10 caracteres").optional(),
    level: nivel.optional(),
    icon: z.string().trim().max(40, "Ícone muito longo").nullable().optional(),
    position: z.int().min(0, "A posição não pode ser negativa").optional(),
    premium: z.boolean().optional(),
    published: z.boolean().optional(),
});

export const createStageSchema = z.object({
    phase: fase,
    title: z.string().trim().min(2, "Título deve ter ao menos 2 caracteres").max(200, "Título muito longo"),
    description: z.string().trim().min(2, "Descrição obrigatória"),
    tags: z.array(z.string().trim().min(1).max(40)).max(10, "No máximo 10 tags").optional(),
    position: z.int().positive("A posição deve ser um número positivo").optional(),
});

export const updateStageSchema = z.object({
    phase: fase.optional(),
    title: z.string().trim().min(2, "Título deve ter ao menos 2 caracteres").max(200, "Título muito longo").optional(),
    description: z.string().trim().min(2, "Descrição obrigatória").optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(10, "No máximo 10 tags").optional(),
    position: z.int().positive("A posição deve ser um número positivo").optional(),
});

export const createRefSchema = z.object({
    refType: tipoRef,
    refId: z.uuid("Conteúdo inválido"),
    position: z.int().min(0, "A posição não pode ser negativa").optional(),
});
