import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Modern Data Stack, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto; as cartas guardam as definições fechadas, as divisões de
 * responsabilidade e as regras que a aula enuncia de passagem.
 */
export const modernDataStack: CartasDaTrilha = {
    trilha: "Modern Data Stack",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o modern data stack não é?",
                        verso: "Uma ferramenta única.",
                    },
                    {
                        frente: "O que o modern data stack é, então?",
                        verso: "Um warehouse elástico com ferramentas gerenciadas e plugáveis.",
                    },
                    {
                        frente: "Que responsabilidade cada ferramenta tem?",
                        verso: "Cuidar de uma etapa só do caminho do dado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que camada fica no centro do stack?",
                        verso: "O warehouse, para onde tudo converge.",
                    },
                    {
                        frente: "Que etapa abre o caminho do dado no stack?",
                        verso: "A ingestão, que traz o dado das fontes.",
                    },
                    {
                        frente: "O que a camada de análise entrega?",
                        verso: "O painel e a consulta que respondem ao negócio.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De que o analytics engineer é dono?",
                        verso: "Da camada de transformação e da definição das métricas.",
                    },
                    {
                        frente: "Entre o que ele fica?",
                        verso: "Entre a infraestrutura e a pergunta de negócio.",
                    },
                    {
                        frente: "Quem mantém a infraestrutura, nessa divisão?",
                        verso: "O data engineer.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que guardar o dado bruto no warehouse permite?",
                        verso: "Refazer qualquer regra de transformação do zero.",
                    },
                    {
                        frente: "O que deixa de ser necessário?",
                        verso: "Voltar à fonte original para buscar o mesmo dado.",
                    },
                    {
                        frente: "Que letra do ELT o warehouse passou a executar?",
                        verso: "O T, da transformação.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Alguma ferramenta do stack faz sentido sozinha?",
                        verso: "Nenhuma: o valor está em como elas se conectam.",
                    },
                    {
                        frente: "Em torno do que elas se conectam?",
                        verso: "Do warehouse.",
                    },
                    {
                        frente: "Quem dá coerência à camada de transformação?",
                        verso: "O dbt.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "No que o SQL de transformação virou?",
                        verso: "Código de produção.",
                    },
                    {
                        frente: "O que faltava a esse código?",
                        verso: "As práticas que a engenharia de software já usava.",
                    },
                    {
                        frente: "Que práticas o dbt trouxe para o SQL?",
                        verso: "Versionamento, teste, documentação e dependência declarada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o dbt não faz?",
                        verso: "Extrair nem carregar dado.",
                    },
                    {
                        frente: "O que ele assume como ponto de partida?",
                        verso: "Que o dado bruto já chegou ao warehouse.",
                    },
                    {
                        frente: "De que etapa o dbt cuida?",
                        verso: "Só da transformação, o T do ELT.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que dbt Core e dbt Cloud têm em comum?",
                        verso: "A mesma engine por baixo.",
                    },
                    {
                        frente: "Onde está a diferença entre os dois?",
                        verso: "Em quem cuida do agendador, do editor e da infraestrutura.",
                    },
                    {
                        frente: "O que muda nos conceitos entre eles?",
                        verso: "Nada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o arquivo de projeto do dbt declara?",
                        verso: "O nome, os caminhos e as configurações padrão.",
                    },
                    {
                        frente: "Onde os modelos ficam num projeto dbt?",
                        verso: "Na pasta de modelos, organizados por camada.",
                    },
                    {
                        frente: "O que o arquivo de schema declara ao lado dos modelos?",
                        verso: "Testes, descrições e colunas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o comando de execução faz?",
                        verso: "Constrói os modelos dentro do warehouse.",
                    },
                    {
                        frente: "O que o comando de teste faz?",
                        verso: "Roda as verificações declaradas sobre o resultado.",
                    },
                    {
                        frente: "O que o build combina numa passada só?",
                        verso: "A execução e os testes, modelo a modelo.",
                    },
                ],
            },
        },
    },
};
