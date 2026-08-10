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
        3: {
            1: {
                neutra: [
                    {
                        frente: "De que experimento a binomial nasce?",
                        verso: "Da repetição independente do cara ou coroa.",
                    },
                    {
                        frente: "Quantos resultados o ensaio de Bernoulli tem?",
                        verso: "Dois: sucesso ou fracasso.",
                    },
                    {
                        frente: "Que dois parâmetros a binomial exige?",
                        verso: "O número de repetições e a probabilidade de sucesso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta a distribuição geométrica faz?",
                        verso: "Quando o primeiro sucesso chega.",
                    },
                    {
                        frente: "Que pergunta a Poisson faz?",
                        verso: "Quantos eventos cabem num intervalo.",
                    },
                    {
                        frente: "Que parâmetro a Poisson usa?",
                        verso: "A taxa média de eventos no intervalo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que preferência a uniforme tem dentro do intervalo?",
                        verso: "Nenhuma: trechos de mesmo tamanho pesam igual.",
                    },
                    {
                        frente: "Que propriedade curiosa a exponencial tem?",
                        verso: "A falta de memória do tempo já decorrido.",
                    },
                    {
                        frente: "Que grandeza a exponencial costuma modelar?",
                        verso: "O tempo de espera até o próximo evento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que acontece ao somar muitos acasos pequenos?",
                        verso: "Reencontra-se a curva em forma de sino.",
                    },
                    {
                        frente: "Que dois parâmetros definem a normal?",
                        verso: "A média e o desvio padrão.",
                    },
                    {
                        frente: "Que simetria a curva normal tem?",
                        verso: "É simétrica em torno da média.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "De onde a distribuição certa se deduz?",
                        verso: "Da estrutura do experimento e das perguntas feitas.",
                    },
                    {
                        frente: "Que estrago escolher a distribuição no chute causa?",
                        verso: "Contas certas sobre um modelo que não descreve o caso.",
                    },
                    {
                        frente: "Que pergunta separa discreta de contínua?",
                        verso: "Se o resultado é contado ou medido.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que objeto é primário nas variáveis conjuntas?",
                        verso: "A distribuição conjunta, da qual as outras se extraem.",
                    },
                    {
                        frente: "O que a distribuição conjunta descreve?",
                        verso: "O comportamento das variáveis ao mesmo tempo.",
                    },
                    {
                        frente: "O que não se pode fazer a partir das marginais?",
                        verso: "Reconstruir a distribuição conjunta.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como uma marginal é obtida da conjunta?",
                        verso: "Somando ou integrando sobre a outra variável.",
                    },
                    {
                        frente: "O que a distribuição condicional fixa?",
                        verso: "Um valor de uma variável, remedindo a outra.",
                    },
                    {
                        frente: "Que informação a marginal perde?",
                        verso: "A da relação entre as variáveis.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Sobre o que a independência é uma afirmação?",
                        verso: "Sobre toda a distribuição conjunta.",
                    },
                    {
                        frente: "Que resumo não basta para provar independência?",
                        verso: "A covariância, que é um número só.",
                    },
                    {
                        frente: "Que fatoração a independência produz?",
                        verso: "A conjunta vira o produto das marginais.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que tipo de relação a covariância mede?",
                        verso: "Apenas o alinhamento linear entre as variáveis.",
                    },
                    {
                        frente: "O que passa despercebido pela covariância?",
                        verso: "Toda estrutura curva entre as variáveis.",
                    },
                    {
                        frente: "Que vantagem a correlação tem sobre a covariância?",
                        verso: "Fica entre menos um e um, sem depender da unidade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que condição a esperança da soma exige?",
                        verso: "Nenhuma: é sempre a soma das esperanças.",
                    },
                    {
                        frente: "Que condição a variância da soma exige?",
                        verso: "Independência, ou a covariância entra na conta.",
                    },
                    {
                        frente: "Que termo entra na variância da soma sem independência?",
                        verso: "O dobro da covariância entre as variáveis.",
                    },
                ],
            },
        },
    },
};
