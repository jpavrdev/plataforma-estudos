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
import { redes } from "./redes.ts";
import { kubernetes } from "./kubernetes.ts";
import { arquiteturaEEscala } from "./arquitetura-e-escala.ts";
import { estatisticaEProbabilidade } from "./estatistica-e-probabilidade.ts";
import { analiseDeDados } from "./analise-de-dados.ts";
import { sqlParaDados } from "./sql-para-dados.ts";
import { visualizacaoDeDados } from "./visualizacao-de-dados.ts";
import { machineLearning } from "./machine-learning.ts";
import { machineLearningNaPratica } from "./machine-learning-na-pratica.ts";
import { doModeloAoProduto } from "./do-modelo-ao-produto.ts";
import { cpp } from "./cpp.ts";
import { porDentroDaMaquina } from "./por-dentro-da-maquina.ts";
import { cppModerno } from "./cpp-moderno.ts";
import { sistemasOperacionaisEConcorrencia } from "./sistemas-operacionais-e-concorrencia.ts";
import { compiladoresEToolchain } from "./compiladores-e-toolchain.ts";
import { sistemasDeTempoReal } from "./sistemas-de-tempo-real.ts";
import { embarcadosNaPratica } from "./embarcados-na-pratica.ts";
import { preCalculo } from "./pre-calculo.ts";
import { calculo1 } from "./calculo-1.ts";
import { algebraLinear } from "./algebra-linear.ts";
import { geometriaAnalitica } from "./geometria-analitica.ts";
import { calculo2 } from "./calculo-2.ts";
import { calculo3 } from "./calculo-3.ts";
import { estatisticaMatematica } from "./estatistica-matematica.ts";
import { fundamentosDeCiberseguranca } from "./fundamentos-de-ciberseguranca.ts";
import { ameacasEAtaquesNaPratica } from "./ameacas-e-ataques-na-pratica.ts";
import { defesaEOSoc } from "./defesa-e-o-soc.ts";
import { pentestComMetodo } from "./pentest-com-metodo.ts";
import { segurancaEmNuvemEIdentidade } from "./seguranca-em-nuvem-e-identidade.ts";
import { modelagemDeDadosEDataWarehousing } from "./modelagem-de-dados-e-data-warehousing.ts";
import { etlEIngestaoDeDados } from "./etl-e-ingestao-de-dados.ts";
import { orquestracaoDePipelines } from "./orquestracao-de-pipelines.ts";
import { processamentoComSpark } from "./processamento-com-spark.ts";
import { dataLakeELakehouse } from "./data-lake-e-lakehouse.ts";
import { streamingDeDados } from "./streaming-de-dados.ts";
import { modernDataStack } from "./modern-data-stack.ts";
import { qualidadeEGovernancaDeDados } from "./qualidade-e-governanca-de-dados.ts";
import { awsAiPractitioner } from "./aws-ai-practitioner.ts";
import { awsDvaC02 } from "./aws-dva-c02.ts";
import { awsSaaC03 } from "./aws-saa-c03.ts";
import { azureAz900 } from "./azure-az-900.ts";
import { azureAi900 } from "./azure-ai-900.ts";
import { azureDp900 } from "./azure-dp-900.ts";
import { azureAi901 } from "./azure-ai-901.ts";
import { azureAz104 } from "./azure-az-104.ts";
import { azureSc900 } from "./azure-sc-900.ts";
import { istqbCtfl } from "./istqb-ctfl.ts";

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
    redes,
    kubernetes,
    arquiteturaEEscala,
    estatisticaEProbabilidade,
    analiseDeDados,
    sqlParaDados,
    visualizacaoDeDados,
    machineLearning,
    machineLearningNaPratica,
    doModeloAoProduto,
    cpp,
    porDentroDaMaquina,
    cppModerno,
    sistemasOperacionaisEConcorrencia,
    compiladoresEToolchain,
    sistemasDeTempoReal,
    embarcadosNaPratica,
    preCalculo,
    calculo1,
    algebraLinear,
    geometriaAnalitica,
    calculo2,
    calculo3,
    estatisticaMatematica,
    fundamentosDeCiberseguranca,
    ameacasEAtaquesNaPratica,
    defesaEOSoc,
    pentestComMetodo,
    segurancaEmNuvemEIdentidade,
    modelagemDeDadosEDataWarehousing,
    etlEIngestaoDeDados,
    orquestracaoDePipelines,
    processamentoComSpark,
    dataLakeELakehouse,
    streamingDeDados,
    modernDataStack,
    qualidadeEGovernancaDeDados,
    awsAiPractitioner,
    awsDvaC02,
    awsSaaC03,
    azureAz900,
    azureAi900,
    azureDp900,
    azureAi901,
    azureAz104,
    azureSc900,
    istqbCtfl,
];
