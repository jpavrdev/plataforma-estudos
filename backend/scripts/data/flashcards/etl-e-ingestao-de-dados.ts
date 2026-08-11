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
    },
};
