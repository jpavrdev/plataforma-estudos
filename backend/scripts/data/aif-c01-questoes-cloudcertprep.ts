// Lotes importados do banco aberto cloudcertprep para o simulado AIF-C01, um
// arquivo por domínio da prova. Licença MIT: ver LICENSE-cloudcertprep.txt.
import type { Questao } from "./aif-c01-questoes.ts";
import { QUESTOES_CLOUDCERTPREP_D1 } from "./aif-c01-questoes-cloudcertprep-d1.ts";
import { QUESTOES_CLOUDCERTPREP_D2 } from "./aif-c01-questoes-cloudcertprep-d2.ts";
import { QUESTOES_CLOUDCERTPREP_D3 } from "./aif-c01-questoes-cloudcertprep-d3.ts";

export const QUESTOES_CLOUDCERTPREP: Questao[] = [
    ...QUESTOES_CLOUDCERTPREP_D1,
    ...QUESTOES_CLOUDCERTPREP_D2,
    ...QUESTOES_CLOUDCERTPREP_D3,
];
