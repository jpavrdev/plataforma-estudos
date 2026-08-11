import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Cálculo 2, quinta trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam os nomes das técnicas, os critérios de escolha e as
 * condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const calculo2: CartasDaTrilha = {
    trilha: "Cálculo 2",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que escolha decide a integração por partes?",
                        verso: "A de u e dv: a boa transforma a integral, a má só disfarça.",
                    },
                    {
                        frente: "Que regra a integração por partes desfaz?",
                        verso: "A do produto, lida ao contrário.",
                    },
                    {
                        frente: "Que critério ajuda a escolher u?",
                        verso: "O que fica mais simples depois de derivado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De onde vem a resposta na integração cíclica?",
                        verso: "De reconhecer o padrão e resolver uma equação.",
                    },
                    {
                        frente: "O que caracteriza a integração cíclica?",
                        verso: "A integral original reaparecer depois de aplicar por partes.",
                    },
                    {
                        frente: "Que integrando costuma virar cíclico?",
                        verso: "Exponencial multiplicada por seno ou cosseno.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a paridade dos expoentes decide?",
                        verso: "A estratégia: procurar primeiro quem tem expoente ímpar.",
                    },
                    {
                        frente: "O que fazer quando os dois expoentes são pares?",
                        verso: "Recorrer às identidades de redução de potência.",
                    },
                    {
                        frente: "Que fator o expoente ímpar libera?",
                        verso: "Um fator, guardado para a substituição.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que decisão resolve quase tudo com tangente e secante?",
                        verso: "Qual fator vira a substituição, antes de mexer no resto.",
                    },
                    {
                        frente: "Que identidade acompanha tangente e secante?",
                        verso: "A que liga o quadrado de uma ao quadrado da outra.",
                    },
                    {
                        frente: "Que derivada torna a secante boa candidata?",
                        verso: "A dela, que traz secante vezes tangente.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que troca facilita produtos de seno e cosseno?",
                        verso: "Transformar produto em soma, dividindo para conquistar.",
                    },
                    {
                        frente: "No que o produto vira depois dessa troca?",
                        verso: "Várias parcelas fáceis, no lugar de um integrando difícil.",
                    },
                    {
                        frente: "Que identidades fazem essa transformação?",
                        verso: "As de produto em soma, vindas das fórmulas de adição.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que ideia central a substituição trigonométrica usa?",
                        verso: "Trocar uma raiz difícil por uma função trigonométrica simples.",
                    },
                    {
                        frente: "Que família de identidades orienta essa substituição?",
                        verso: "As identidades pitagóricas.",
                    },
                    {
                        frente: "Que substituição a diferença com a constante antes pede?",
                        verso: "A com seno.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que substituição a soma dentro da raiz pede?",
                        verso: "A com tangente.",
                    },
                    {
                        frente: "Que substituição a diferença com a variável antes pede?",
                        verso: "A com secante.",
                    },
                    {
                        frente: "Que leitura escolhe a substituição certa?",
                        verso: "A do sinal e da ordem dos termos dentro da raiz.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que frações parciais transformam a integral?",
                        verso: "Em várias integrais de logaritmo, simples de resolver.",
                    },
                    {
                        frente: "Que passo precede a decomposição em frações parciais?",
                        verso: "Conferir se o grau de cima é menor que o de baixo.",
                    },
                    {
                        frente: "Que termo cada fator linear distinto recebe?",
                        verso: "Uma constante sobre aquele fator.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quantos termos um fator repetido merece?",
                        verso: "Um para cada potência, até a maior delas.",
                    },
                    {
                        frente: "Que numerador o fator quadrático irredutível pede?",
                        verso: "Um numerador linear completo.",
                    },
                    {
                        frente: "O que torna um fator quadrático irredutível?",
                        verso: "Não ter raiz real que permita fatorar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Onde mora metade do trabalho de integrar?",
                        verso: "Em reconhecer o padrão e escolher a ferramenta certa.",
                    },
                    {
                        frente: "Que técnica tentar antes de todas as outras?",
                        verso: "A substituição simples, a mais barata de testar.",
                    },
                    {
                        frente: "Que técnica o produto de tipos diferentes sugere?",
                        verso: "A integração por partes.",
                    },
                ],
            },
        },
    },
};
