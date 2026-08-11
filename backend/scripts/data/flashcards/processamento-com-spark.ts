import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Processamento com Spark, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto do job; as cartas guardam as definições fechadas, os nomes dos
 * componentes e as regras de bolso que a aula enuncia de passagem.
 */
export const processamentoComSpark: CartasDaTrilha = {
    trilha: "Processamento com Spark",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que escalar verticalmente compra?",
                        verso: "Tempo dentro do teto de uma máquina.",
                    },
                    {
                        frente: "O que escalar horizontalmente muda?",
                        verso: "Qual é o teto.",
                    },
                    {
                        frente: "Que limite a máquina única impõe?",
                        verso: "Memória, disco e núcleos de um só equipamento.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a etapa de map roda livre?",
                        verso: "Cada registro é independente dos demais.",
                    },
                    {
                        frente: "Por que o shuffle custa caro?",
                        verso: "Junta de novo o que estava espalhado.",
                    },
                    {
                        frente: "Que estratégia o paralelismo de dados usa?",
                        verso: "Dividir para conquistar, um pedaço por máquina.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Spark não inventou?",
                        verso: "O paralelismo de dados.",
                    },
                    {
                        frente: "O que o Spark trocou?",
                        verso: "Onde os dados ficam entre uma etapa e outra.",
                    },
                    {
                        frente: "Para onde essa troca levou os dados intermediários?",
                        verso: "Do disco para a memória.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a pergunta certa entre os motores?",
                        verso: "Qual deles combina com o tamanho do problema atual.",
                    },
                    {
                        frente: "Qual não é a pergunta certa?",
                        verso: "Qual motor é o melhor.",
                    },
                    {
                        frente: "Quando o pandas ainda resolve?",
                        verso: "Quando o dado cabe na memória de uma máquina.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que PySpark, Scala e SQL descrevem?",
                        verso: "O mesmo plano, para a mesma engine.",
                    },
                    {
                        frente: "Sobre o que é a escolha entre eles?",
                        verso: "Sobre o time, e não sobre desempenho.",
                    },
                    {
                        frente: "Que módulos o ecossistema Spark reúne?",
                        verso: "SQL, streaming, aprendizado de máquina e grafos.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o driver decide?",
                        verso: "O quê e quando.",
                    },
                    {
                        frente: "O que o cluster manager decide?",
                        verso: "Onde há espaço.",
                    },
                    {
                        frente: "O que os executors sabem fazer?",
                        verso: "Executar a task que chegou.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que corta um job em stages?",
                        verso: "O shuffle.",
                    },
                    {
                        frente: "O que corta um stage em tasks?",
                        verso: "As partições.",
                    },
                    {
                        frente: "Como a aula descreve esses dois cortes?",
                        verso: "O shuffle divide na vertical, a partição na horizontal.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que limita o paralelismo de um stage?",
                        verso: "O menor valor entre partições e núcleos livres.",
                    },
                    {
                        frente: "O que partições demais provocam?",
                        verso: "Desperdício, com muita tarefa pequena.",
                    },
                    {
                        frente: "O que partições de menos provocam?",
                        verso: "Núcleos ociosos, sem trabalho para pegar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que uma transformação faz?",
                        verso: "Monta o plano.",
                    },
                    {
                        frente: "O que uma ação faz?",
                        verso: "Executa o plano.",
                    },
                    {
                        frente: "Quando algo acontece de fato?",
                        verso: "Só quando uma ação é chamada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o plano lógico diz?",
                        verso: "O que o Spark deve entregar.",
                    },
                    {
                        frente: "O que o plano físico diz?",
                        verso: "Como os executors vão entregar.",
                    },
                    {
                        frente: "Quem escolhe o plano físico?",
                        verso: "O Catalyst.",
                    },
                ],
            },
        },
    },
};
