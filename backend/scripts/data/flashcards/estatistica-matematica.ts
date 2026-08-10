import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Estatística Matemática, sétima trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os nomes das distribuições e
 * as condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const estatisticaMatematica: CartasDaTrilha = {
    trilha: "Estatística Matemática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o espaço amostral reúne?",
                        verso: "Todos os resultados possíveis do experimento.",
                    },
                    {
                        frente: "Que trabalho vem antes de calcular a probabilidade?",
                        verso: "Descrever o evento com uniões, interseções e complementos.",
                    },
                    {
                        frente: "O que é um evento, na definição da aula?",
                        verso: "Um subconjunto do espaço amostral.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantos axiomas Kolmogorov enuncia?",
                        verso: "Três.",
                    },
                    {
                        frente: "Que faixa de valores a probabilidade ocupa?",
                        verso: "De zero a um, sem jamais sair desse intervalo.",
                    },
                    {
                        frente: "Que probabilidade o espaço amostral inteiro tem?",
                        verso: "Probabilidade igual a um.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que diferença separa arranjo de combinação?",
                        verso: "O arranjo leva a ordem em conta; a combinação não.",
                    },
                    {
                        frente: "Que princípio multiplica as escolhas de cada etapa?",
                        verso: "O princípio fundamental da contagem.",
                    },
                    {
                        frente: "Que pergunta escolhe entre arranjo e combinação?",
                        verso: "Se a ordem dos elementos muda o resultado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que condicionar faz com o espaço amostral?",
                        verso: "Troca por outro: o que era certeza vira o novo mundo.",
                    },
                    {
                        frente: "Que conta define a probabilidade condicional?",
                        verso: "A da interseção dividida pela probabilidade do que se sabe.",
                    },
                    {
                        frente: "Que probabilidade impede o condicionamento?",
                        verso: "A de zero no evento condicionante.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o teorema de Bayes não faz?",
                        verso: "Criar informação: ele só faz a priori conversar com a evidência.",
                    },
                    {
                        frente: "O que caracteriza dois eventos independentes?",
                        verso: "Saber de um não muda a probabilidade do outro.",
                    },
                    {
                        frente: "Que nome a probabilidade antes da evidência recebe?",
                        verso: "Probabilidade a priori.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que uma variável aleatória realmente é?",
                        verso: "Uma função que traduz o acaso em números reais.",
                    },
                    {
                        frente: "O que a função de distribuição acumula?",
                        verso: "A probabilidade até um valor, e não apenas nele.",
                    },
                    {
                        frente: "Que comportamento a função de distribuição sempre tem?",
                        verso: "Cresce sem voltar, indo de zero até um.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta a função de probabilidade responde?",
                        verso: "Uma pergunta pontual, sobre um valor exato.",
                    },
                    {
                        frente: "Que pergunta a função de distribuição responde?",
                        verso: "Uma pergunta acumulada, do tipo até aqui.",
                    },
                    {
                        frente: "Quanto a função de probabilidade soma no total?",
                        verso: "Um, somando todos os valores possíveis.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que probabilidade um ponto isolado carrega no contínuo?",
                        verso: "Probabilidade zero.",
                    },
                    {
                        frente: "O que pesa numa distribuição contínua?",
                        verso: "A área sob a curva, e não a altura num ponto.",
                    },
                    {
                        frente: "Quanto vale a área total sob a densidade?",
                        verso: "Área igual a um.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que imagem física a esperança tem?",
                        verso: "A de centro de gravidade da distribuição.",
                    },
                    {
                        frente: "Como a esperança de uma discreta é calculada?",
                        verso: "Somando cada valor multiplicado pela sua probabilidade.",
                    },
                    {
                        frente: "Que operação a esperança preserva sempre?",
                        verso: "A soma, mesmo sem independência entre as variáveis.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a variância diz, ao lado da esperança?",
                        verso: "O quanto a distribuição se espalha em volta dela.",
                    },
                    {
                        frente: "Que unidade o desvio padrão devolve?",
                        verso: "A da própria variável, ao contrário da variância.",
                    },
                    {
                        frente: "Que esperança define a variância?",
                        verso: "A do desvio ao quadrado em relação à média.",
                    },
                ],
            },
        },
    },
};
