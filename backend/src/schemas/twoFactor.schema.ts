import { z } from "zod";

// An app code (6 digits) or a recovery code (10 letters and digits, with or
// without the dash). The service tells them apart by the format.
const code = z.string().trim().min(6, "Digite o código.").max(20);
const currentPassword = z.string().max(200).optional();

export const twoFactorLoginSchema = z.object({
    challenge: z.string().regex(/^[a-f0-9]{64}$/, "Desafio inválido."),
    code,
});

export const enableTwoFactorSchema = z.object({
    code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "O código do app tem 6 dígitos."),
    currentPassword,
});

export const twoFactorCodeSchema = z.object({ code });

export const disableTwoFactorSchema = z.object({ code, currentPassword });
