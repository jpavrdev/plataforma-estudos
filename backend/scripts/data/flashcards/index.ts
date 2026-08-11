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
import { dadosParaProduto } from "./dados-para-produto.ts";
import { produtoNaPratica } from "./produto-na-pratica.ts";
import { agilEDeliveryNaPratica } from "./agil-e-delivery-na-pratica.ts";
import { apisEFrameworks } from "./apis-e-frameworks.ts";
import { autenticacao } from "./autenticacao.ts";
import { cacheFilasEPerformance } from "./cache-filas-e-performance.ts";
import { dockerEContainers } from "./docker-e-containers.ts";
import { go } from "./go.ts";
import { linuxELinhaDeComando } from "./linux-e-linha-de-comando.ts";

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
    dadosParaProduto,
    produtoNaPratica,
    agilEDeliveryNaPratica,
    apisEFrameworks,
    autenticacao,
    cacheFilasEPerformance,
    dockerEContainers,
    go,
    linuxELinhaDeComando,
];
