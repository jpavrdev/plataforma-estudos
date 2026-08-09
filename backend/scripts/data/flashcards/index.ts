// Registro das trilhas que já têm cartões autorados. O seeder varre esta lista.
import type { CartasDaTrilha } from "../../seed-flashcards.ts";
import { logicaDeProgramacao } from "./logica-de-programacao.ts";
import { protocolosDaWeb } from "./protocolos-da-web.ts";
import { python } from "./python.ts";
import { awsClfC02 } from "./aws-clf-c02.ts";
import { javascript } from "./javascript.ts";
import { java } from "./java.ts";
import { html } from "./html.ts";
import { fundamentosDeLlms } from "./fundamentos-de-llms.ts";
import { aplicacoesComLlms } from "./aplicacoes-com-llms.ts";
import { ragNaPratica } from "./rag-na-pratica.ts";
import { agentesDeIa } from "./agentes-de-ia.ts";
import { llmsEmProducao } from "./llms-em-producao.ts";
import { fundamentosDeQa } from "./fundamentos-de-qa.ts";
import { testesEQualidade } from "./testes-e-qualidade.ts";
import { testesE2e } from "./testes-e2e.ts";
import { bancoDeDadosESql } from "./banco-de-dados-e-sql.ts";
import { cicdECloud } from "./cicd-e-cloud.ts";
import { segurancaDeAplicacoesWeb } from "./seguranca-de-aplicacoes-web.ts";
import { fundamentosDeProduto } from "./fundamentos-de-produto.ts";
import { discoveryEPesquisa } from "./discovery-e-pesquisa.ts";
import { estrategiaEPriorizacao } from "./estrategia-e-priorizacao.ts";

export const TRILHAS: CartasDaTrilha[] = [
    logicaDeProgramacao,
    protocolosDaWeb,
    python,
    awsClfC02,
    javascript,
    java,
    html,
    fundamentosDeLlms,
    aplicacoesComLlms,
    ragNaPratica,
    agentesDeIa,
    llmsEmProducao,
    fundamentosDeQa,
    testesEQualidade,
    testesE2e,
    bancoDeDadosESql,
    cicdECloud,
    segurancaDeAplicacoesWeb,
    fundamentosDeProduto,
    discoveryEPesquisa,
    estrategiaEPriorizacao,
];
