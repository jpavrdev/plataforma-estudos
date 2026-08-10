import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Modelagem de Dados e Data Warehousing, do roadmap de
 * Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * modelagem; as cartas guardam as definições fechadas, os nomes próprios
 * das arquiteturas e as regras que a aula enuncia de passagem.
 */
export const modelagemDeDadosEDataWarehousing: CartasDaTrilha = {
    trilha: "Modelagem de Dados e Data Warehousing",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que a modelagem de dados é, na definição da aula?",
                        verso: "O contrato entre a visão do negócio e o armazenamento.",
                    },
                    {
                        frente: "Que três níveis a modelagem tem?",
                        verso: "Conceitual, lógico e físico.",
                    },
                    {
                        frente: "O que o nível conceitual descreve?",
                        verso: "O que o negócio enxerga, sem falar de tecnologia.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um diagrama ER conta antes de qualquer SQL?",
                        verso: "A história do negócio: quem faz o quê, para quem.",
                    },
                    {
                        frente: "Que três elementos o modelo ER usa?",
                        verso: "Entidades, atributos e relacionamentos.",
                    },
                    {
                        frente: "O que um atributo representa?",
                        verso: "Uma característica da entidade.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a chave substituta resolve?",
                        verso: "Estabilidade e desempenho.",
                    },
                    {
                        frente: "O que a chave substituta não substitui?",
                        verso: "A restrição de unicidade sobre a chave natural.",
                    },
                    {
                        frente: "O que a chave estrangeira garante?",
                        verso: "Que o valor referenciado existe na outra tabela.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a cardinalidade informa?",
                        verso: "Quantos.",
                    },
                    {
                        frente: "O que a opcionalidade informa?",
                        verso: "Se é obrigatório.",
                    },
                    {
                        frente: "Qual é o erro mais comum ao ler um diagrama ER?",
                        verso: "Confundir cardinalidade com opcionalidade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que cada tipo de dado escolhido no físico é?",
                        verso: "Uma regra de negócio documentada como restrição.",
                    },
                    {
                        frente: "O que errar o tipo abre espaço para?",
                        verso: "Dado inválido que nenhuma validação depois recupera.",
                    },
                    {
                        frente: "O que a passagem ao modelo físico define?",
                        verso: "Tabelas, tipos, índices e restrições concretas.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que a normalização organiza?",
                        verso: "Colunas e tabelas, para cada fato ficar num lugar só.",
                    },
                    {
                        frente: "O que a redundância provoca?",
                        verso: "As anomalias de inserção, atualização e exclusão.",
                    },
                    {
                        frente: "Que anomalia a atualização parcial gera?",
                        verso: "Duas cópias do mesmo fato discordando entre si.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a primeira forma normal exige?",
                        verso: "Valores atômicos, sem grupos repetidos na coluna.",
                    },
                    {
                        frente: "O que a segunda forma normal elimina?",
                        verso: "A dependência parcial da chave composta.",
                    },
                    {
                        frente: "O que a terceira forma normal elimina?",
                        verso: "A dependência transitiva entre colunas não chave.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Onde a maioria dos sistemas transacionais para?",
                        verso: "Entre a terceira forma normal e a BCNF.",
                    },
                    {
                        frente: "O que normalizar além disso costuma custar?",
                        verso: "Complexidade que raramente compensa.",
                    },
                    {
                        frente: "O que a BCNF endurece na terceira forma normal?",
                        verso: "Exige que todo determinante seja chave candidata.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que um sistema transacional é otimizado?",
                        verso: "Responder rápido a uma transação por vez, com integridade.",
                    },
                    {
                        frente: "Para que ele não foi desenhado?",
                        verso: "Varrer milhões de linhas de uma vez.",
                    },
                    {
                        frente: "Que padrão de acesso o transacional espera?",
                        verso: "Poucas linhas por operação, com muita concorrência.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a desnormalização é, na definição da aula?",
                        verso: "Um passo posterior, aplicado com intenção.",
                    },
                    {
                        frente: "O que a desnormalização não é?",
                        verso: "O oposto da normalização.",
                    },
                    {
                        frente: "Sobre o que a desnormalização se aplica?",
                        verso: "Partes específicas de um modelo normalizado por padrão.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta o OLTP responde?",
                        verso: "O que está acontecendo agora, com poucas linhas por vez.",
                    },
                    {
                        frente: "Que pergunta o OLAP responde?",
                        verso: "O que aconteceu ao longo do tempo, varrendo milhões.",
                    },
                    {
                        frente: "Que consequência a diferença entre os dois tem?",
                        verso: "São cargas opostas, e pedem modelos diferentes.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quem definiu o data warehouse orientado por assunto?",
                        verso: "Bill Inmon.",
                    },
                    {
                        frente: "Que quatro qualidades essa definição lista?",
                        verso: "Orientado por assunto, integrado, variante no tempo e não volátil.",
                    },
                    {
                        frente: "Para que o data warehouse é organizado?",
                        verso: "Para dar suporte a decisões.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por onde a abordagem de Inmon começa?",
                        verso: "Pelo todo, desdobrando depois nas partes.",
                    },
                    {
                        frente: "Por onde a abordagem de Kimball começa?",
                        verso: "Pelas partes, integrando depois pelo todo.",
                    },
                    {
                        frente: "Onde as duas querem chegar?",
                        verso: "A um warehouse confiável e integrado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o data warehouse define, nessa comparação?",
                        verso: "Escopo: a empresa toda.",
                    },
                    {
                        frente: "O que o data mart define?",
                        verso: "Recorte: uma área.",
                    },
                    {
                        frente: "O que o ODS define?",
                        verso: "Velocidade: o agora, e não o histórico.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como o analytics costuma ler os dados?",
                        verso: "Poucas colunas de muitas linhas.",
                    },
                    {
                        frente: "Como o armazenamento colunar guarda os dados?",
                        verso: "Coluna a coluna, do mesmo jeito que a consulta lê.",
                    },
                    {
                        frente: "Que dois ganhos o colunar traz?",
                        verso: "Varre menos dados e comprime melhor.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que a modelagem dimensional troca?",
                        verso: "A eliminação de redundância pela facilidade de consulta.",
                    },
                    {
                        frente: "Que perguntas a modelagem dimensional responde bem?",
                        verso: "Quanto, quando, onde e por quem.",
                    },
                    {
                        frente: "Em que escala ela foi pensada?",
                        verso: "Grandes volumes de dados analíticos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Do que a tabela fato é feita, sobretudo?",
                        verso: "De números e de chaves.",
                    },
                    {
                        frente: "Onde mora o texto que não muda a cada evento?",
                        verso: "Numa dimensão, e não na tabela fato.",
                    },
                    {
                        frente: "O que cada linha da tabela fato representa?",
                        verso: "Um evento de negócio no grão declarado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que as dimensões são, na comparação da aula?",
                        verso: "As perguntas que um analista faz.",
                    },
                    {
                        frente: "Que dimensão aparece em quase todo esquema estrela?",
                        verso: "A dimensão de tempo.",
                    },
                    {
                        frente: "Por que a dimensão de tempo é quase universal?",
                        verso: "Quase toda pergunta de negócio compara períodos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "A quantos joins cada dimensão fica da tabela fato?",
                        verso: "Exatamente um.",
                    },
                    {
                        frente: "O que essa distância única garante?",
                        verso: "Consulta simples e previsível.",
                    },
                    {
                        frente: "O que acontece quando o número de dimensões cresce?",
                        verso: "A consulta segue previsível, com um join para cada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a primeira decisão de design de uma tabela fato?",
                        verso: "Declarar o grão.",
                    },
                    {
                        frente: "O que vem depois de declarar o grão?",
                        verso: "Escolher as dimensões e as medidas.",
                    },
                    {
                        frente: "O que o grão define?",
                        verso: "O que uma linha da tabela fato representa.",
                    },
                ],
            },
        },
    },
};
