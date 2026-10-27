import { z } from "zod";
import { normalizarContatos } from "../domain/contatos.ts";

export const idSorteioSchema = z.uuid("Sorteio inválido");

// Exige o fuso (Z ou ±hh:mm), como sai do toISOString(): sem ele a mesma hora
// cairia em instantes diferentes conforme o fuso do servidor.
const data = z.iso
    .datetime({ offset: true, error: "Use data e hora em ISO 8601, com fuso" })
    .transform((valor) => new Date(valor));

export const criarSorteioSchema = z.object({
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
    inicio: data,
    fim: data,
});

// O fim depois do início é conferido no service, que conhece as datas já gravadas
// quando a edição muda só uma delas.
export const atualizarSorteioSchema = criarSorteioSchema.partial();

// Os tetos aqui só barram entrada absurda; a regra de cada campo está em domain/contatos.
const contatoSchema = z.discriminatedUnion(
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

export const participacaoSchema = z
    .object({ primario: contatoSchema, secundario: contatoSchema.nullish() })
    .transform((entrada, ctx) => {
        const resultado = normalizarContatos(entrada);
        if (resultado.ok) return resultado.contatos;
        for (const { caminho, mensagem } of resultado.problemas) {
            ctx.addIssue({ code: "custom", path: caminho, message: mensagem, input: entrada });
        }
        return z.NEVER;
    });
