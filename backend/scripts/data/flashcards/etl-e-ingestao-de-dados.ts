import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de ETL e Ingestão de Dados, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * arquitetura; as cartas guardam as definições fechadas, os nomes dos
 * formatos e as regras de bolso que a aula enuncia de passagem.
 */
export const etlEIngestaoDeDados: CartasDaTrilha = {
    trilha: "ETL e Ingestão de Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o papel de um pipeline, na definição da aula?",
                        verso: "Tornar invisível a complexidade de como o dado chegou ali.",
                    },
                    {
                        frente: "Para quem essa complexidade fica invisível?",
                        verso: "Para quem consome o dado no destino.",
                    },
                    {
                        frente: "Que responsabilidade o engenheiro de dados assume?",
                        verso: "Levar o dado da origem ao destino de forma confiável.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a etapa de ingestão faz?",
                        verso: "Traz o dado.",
                    },
                    {
                        frente: "O que a etapa de transformação faz?",
                        verso: "Dá sentido ao dado.",
                    },
                    {
                        frente: "O que a etapa de carga faz?",
                        verso: "Entrega o resultado a quem vai usar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que pergunta fazer antes de escolher streaming?",
                        verso: "Se alguém vai agir sobre o dado nos próximos segundos.",
                    },
                    {
                        frente: "Que resposta dispensa o streaming?",
                        verso: "Um relatório de amanhã de manhã já resolver.",
                    },
                    {
                        frente: "Que diferença separa batch de streaming?",
                        verso: "O batch processa em lotes; o streaming, evento a evento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a origem dita?",
                        verso: "Como você extrai.",
                    },
                    {
                        frente: "O que o destino dita?",
                        verso: "Como você entrega.",
                    },
                    {
                        frente: "O que o pipeline é, entre os dois?",
                        verso: "A ponte entre essas duas decisões.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que torna um pipeline confiável?",
                        verso: "O que ele faz quando a falha acontece.",
                    },
                    {
                        frente: "O que não torna um pipeline confiável?",
                        verso: "A ausência de falha.",
                    },
                    {
                        frente: "Que comportamento a confiabilidade exige na falha?",
                        verso: "Isolar o problema e continuar entregando o resto.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quando o warehouse vê o dado no ETL clássico?",
                        verso: "Só depois que ele já está limpo e modelado.",
                    },
                    {
                        frente: "Onde o processamento pesado acontece no ETL?",
                        verso: "Fora do warehouse, num servidor dedicado.",
                    },
                    {
                        frente: "Que ordem as letras do ETL indicam?",
                        verso: "Extrair, transformar e carregar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que tornou guardar o dado bruto viável?",
                        verso: "Armazenamento barato e processamento elástico.",
                    },
                    {
                        frente: "O que o dado bruto guardado permite?",
                        verso: "Transformar e retransformar quantas vezes for preciso.",
                    },
                    {
                        frente: "Que ordem o ELT segue?",
                        verso: "Extrair, carregar e transformar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa entre ETL e ELT?",
                        verso: "Onde compensa gastar poder de processamento.",
                    },
                    {
                        frente: "Que dois lugares essa escolha compara?",
                        verso: "Um servidor dedicado antes da carga, ou o próprio destino.",
                    },
                    {
                        frente: "Qual não é a pergunta certa nessa escolha?",
                        verso: "Qual das duas abordagens é melhor.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que a área de staging existe?",
                        verso: "Para um erro de transformação não obrigar a extrair tudo de novo.",
                    },
                    {
                        frente: "O que o staging guarda?",
                        verso: "O dado extraído, antes da transformação.",
                    },
                    {
                        frente: "Que custo o staging evita?",
                        verso: "O de bater na origem outra vez a cada erro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que etapa nova o modern data stack inventou?",
                        verso: "Nenhuma etapa nova.",
                    },
                    {
                        frente: "Que tratamento ele deu ao T do ELT?",
                        verso: "O mesmo que o código de produção sempre teve.",
                    },
                    {
                        frente: "Que práticas isso trouxe para a transformação?",
                        verso: "Versionamento, testes e documentação.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta define a estratégia de extração?",
                        verso: "Qual o volume de mudança e qual chave confiável existe.",
                    },
                    {
                        frente: "O que a extração completa faz a cada execução?",
                        verso: "Traz a tabela inteira, de novo.",
                    },
                    {
                        frente: "O que a extração incremental exige da origem?",
                        verso: "Uma chave confiável para identificar o que mudou.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como tratar o erro 429 numa extração de API?",
                        verso: "Como instrução: o servidor diz exatamente quanto esperar.",
                    },
                    {
                        frente: "O que o erro 429 não é?",
                        verso: "Uma falha do seu pipeline.",
                    },
                    {
                        frente: "Que mecanismo a API usa para entregar muitos registros?",
                        verso: "A paginação, página por página.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que organizar por prefixo de data torna possível?",
                        verso: "A extração incremental no object storage.",
                    },
                    {
                        frente: "O que o prefixo de data não é?",
                        verso: "Apenas uma questão de arrumação.",
                    },
                    {
                        frente: "Que informação o object storage dá sobre cada objeto?",
                        verso: "O caminho, o tamanho e a data de modificação.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "No que um watermark que nunca olha para trás confia?",
                        verso: "Que nada chegou atrasado.",
                    },
                    {
                        frente: "Com que frequência essa confiança se justifica?",
                        verso: "Quase nunca.",
                    },
                    {
                        frente: "O que o watermark guarda entre execuções?",
                        verso: "A marca de até onde já foi lido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o CDC não precisa perguntar?",
                        verso: "O que mudou: ele já sabia no instante da mudança.",
                    },
                    {
                        frente: "O que separa CDC de watermark?",
                        verso: "A diferença entre escutar e perguntar.",
                    },
                    {
                        frente: "De onde o CDC costuma ler as mudanças?",
                        verso: "Do log de transações do banco.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Para que CSV e JSON são ótimos?",
                        verso: "Para trocar dados entre sistemas heterogêneos.",
                    },
                    {
                        frente: "Para que eles não foram pensados?",
                        verso: "Para leitura analítica eficiente em grande volume.",
                    },
                    {
                        frente: "Que vantagem o JSON tem sobre o CSV?",
                        verso: "Representa estrutura aninhada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problema o Parquet resolve no ambiente analítico?",
                        verso: "Menos bytes lidos por consulta e menos espaço ocupado.",
                    },
                    {
                        frente: "Que organização o Parquet usa?",
                        verso: "Organização colunar.",
                    },
                    {
                        frente: "Onde o Parquet virou padrão?",
                        verso: "Em data lake e data warehouse.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Avro carrega junto com o dado?",
                        verso: "O schema.",
                    },
                    {
                        frente: "Para que tipo de escrita o Avro foi desenhado?",
                        verso: "Um registro de cada vez, sem atrito.",
                    },
                    {
                        frente: "Onde o Avro é a escolha natural?",
                        verso: "No meio do caminho, com dado em movimento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a compressão troca?",
                        verso: "CPU por espaço.",
                    },
                    {
                        frente: "O que o particionamento troca?",
                        verso: "Organização por velocidade de leitura.",
                    },
                    {
                        frente: "Para que as duas decisões existem?",
                        verso: "Para o pipeline ler só o que precisa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o schema é, além de detalhe do formato?",
                        verso: "O contrato entre quem grava e quem lê o dado.",
                    },
                    {
                        frente: "O que o schema separa na prática?",
                        verso: "A mudança tranquila do pipeline quebrado.",
                    },
                    {
                        frente: "Que mudança de schema costuma ser segura?",
                        verso: "Acrescentar um campo opcional no fim.",
                    },
                ],
            },
        },
    },
};
