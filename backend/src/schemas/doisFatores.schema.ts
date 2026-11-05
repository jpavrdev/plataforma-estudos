import { z } from "zod";

// Código do app (6 dígitos) ou de recuperação (10 letras e números, com ou sem
// o hífen). O serviço decide qual dos dois é pelo formato.
const codigo = z.string().trim().min(6, "Digite o código.").max(20);
const senhaAtual = z.string().max(200).optional();

export const loginDoisFatoresSchema = z.object({
    desafio: z.string().regex(/^[a-f0-9]{64}$/, "Desafio inválido."),
    codigo,
});

export const ativarDoisFatoresSchema = z.object({
    codigo: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "O código do app tem 6 dígitos."),
    senhaAtual,
});

export const codigoDoisFatoresSchema = z.object({ codigo });

export const desativarDoisFatoresSchema = z.object({ codigo, senhaAtual });
