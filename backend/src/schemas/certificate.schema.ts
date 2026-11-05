import { z } from "zod";

function isValidCpf(cpf: string) {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    for (const length of [9, 10]) {
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum += Number(cpf[i]) * (length + 1 - i);
        }
        const digit = ((sum * 10) % 11) % 10;
        if (digit !== Number(cpf[length])) return false;
    }
    return true;
}

export const issueCertificateSchema = z.object({
    name: z
        .string()
        .transform((v) => v.trim().replace(/\s+/g, " "))
        .refine((v) => v.length >= 5 && v.length <= 255 && v.split(" ").length >= 2, {
            message: "Informe o nome completo",
        }),
    cpf: z
        .string()
        .transform((v) => v.replace(/\D/g, ""))
        .refine(isValidCpf, "CPF inválido"),
});
