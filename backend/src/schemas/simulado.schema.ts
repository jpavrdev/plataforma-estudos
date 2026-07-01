import { z } from "zod";

// Vazio limpa a resposta; várias opções cobrem as questões de múltipla resposta.
export const salvarRespostaSchema = z.object({
    optionIds: z.array(z.uuid()).max(10),
});
