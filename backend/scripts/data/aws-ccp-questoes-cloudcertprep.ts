// Lotes importados do banco aberto cloudcertprep para o simulado CLF-C02, um
// arquivo por domínio da prova. Licença MIT: ver LICENSE-cloudcertprep.txt.
import type { Questao } from "./aws-ccp-questoes.ts";
import { QUESTOES_CLOUDCERTPREP_D1 } from "./aws-ccp-questoes-cloudcertprep-d1.ts";
import { QUESTOES_CLOUDCERTPREP_D2 } from "./aws-ccp-questoes-cloudcertprep-d2.ts";
import { QUESTOES_CLOUDCERTPREP_D3 } from "./aws-ccp-questoes-cloudcertprep-d3.ts";
import { QUESTOES_CLOUDCERTPREP_D4 } from "./aws-ccp-questoes-cloudcertprep-d4.ts";

export const QUESTOES_CLOUDCERTPREP: Questao[] = [
    ...QUESTOES_CLOUDCERTPREP_D1,
    ...QUESTOES_CLOUDCERTPREP_D2,
    ...QUESTOES_CLOUDCERTPREP_D3,
    ...QUESTOES_CLOUDCERTPREP_D4,
];
