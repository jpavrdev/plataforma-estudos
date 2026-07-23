import { z } from "zod";

function cpfValido(cpf: string) {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    for (const tamanho of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) {
            soma += Number(cpf[i]) * (tamanho + 1 - i);
        }
        const digito = ((soma * 10) % 11) % 10;
        if (digito !== Number(cpf[tamanho])) return false;
    }
    return true;
}

export const emitirCertificadoSchema = z.object({
    name: z
        .string()
        .transform((v) => v.trim().replace(/\s+/g, " "))
        .refine((v) => v.length >= 5 && v.length <= 255 && v.split(" ").length >= 2, {
            message: "Informe o nome completo",
        }),
    cpf: z
        .string()
        .transform((v) => v.replace(/\D/g, ""))
        .refine(cpfValido, "CPF inválido"),
});
