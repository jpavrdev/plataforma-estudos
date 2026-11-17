import { z } from "zod";
import { normalizeContacts } from "../domain/contacts.ts";

export const raffleIdSchema = z.uuid("Sorteio inválido");

// Requires the timezone (Z or ±hh:mm), as toISOString() outputs: without it the
// same time would land on different instents depending on the server's timezone.
const datetime = z.iso
    .datetime({ offset: true, error: "Use data e hora em ISO 8601, com fuso" })
    .transform((value) => new Date(value));

export const createRaffleSchema = z.object({
    titulo: z
        .string("Informe o título")
        .trim()
        .min(3, "O título deve ter ao menos 3 caracteres")
        .max(120, "O título deve ter no máximo 120 caracteres"),
    descricao: z
        .string("Informe a descrição")
        .trim()
        .min(1, "Informe a descrição")
        .max(2000, "A descrição deve ter no máximo 2000 caracteres"),
    inicio: datetime,
    fim: datetime,
});

// End after start is checked in the service, which knows the stored dates when
// the edit changes only one of them.
export const updateRaffleSchema = createRaffleSchema.partial();

// The ceilings here only block absurd input; each field's rule lives in domain/contacts.
const contactSchema = z.discriminatedUnion(
    "canal",
    [
        z.object({
            canal: z.literal("whatsapp"),
            pais: z.string("Informe o país").max(10, "País inválido"),
            ddd: z.string("DDD inválido").max(10, "DDD inválido").nullish(),
            numero: z.string("Informe o telefone").max(30, "Telefone muito longo"),
        }),
        z.object({
            canal: z.literal("instagram"),
            usuario: z.string("Informe o usuário do Instagram").max(60, "Usuário muito longo"),
        }),
        z.object({
            canal: z.literal("email"),
            email: z.string("Informe o email").max(320, "Email muito longo"),
        }),
    ],
    { error: "Escolha o canal: whatsapp, instagram ou email" },
);

export const raffleEntrySchema = z
    .object({ primario: contactSchema, secundario: contactSchema.nullish() })
    .transform((input, ctx) => {
        const result = normalizeContacts(input);
        if (result.ok) return result.contatos;
        for (const { caminho, mensagem } of result.problemas) {
            ctx.addIssue({ code: "custom", path: caminho, message: mensagem, input });
        }
        return z.NEVER;
    });
