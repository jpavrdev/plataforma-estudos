import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Cálculo 1, segunda trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, as condições dos teoremas e as
 * armadilhas que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const calculo1: CartasDaTrilha = {
    trilha: "Cálculo 1",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o limite pergunta sobre a função?",
                        verso: "Para onde ela aponta perto do ponto, não quanto vale nele.",
                    },
                    {
                        frente: "Que aproximação a noção intuitiva de limite usa?",
                        verso: "Chegar cada vez mais perto do ponto, pelos dois lados.",
                    },
                    {
                        frente: "Que valor pode faltar sem impedir o limite?",
                        verso: "O da função no ponto, que o limite dispensa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que condição os limites laterais impõem à existência?",
                        verso: "Os dois lados precisam apontar para o mesmo valor.",
                    },
                    {
                        frente: "Que notação marca o lado da aproximação?",
                        verso: "Um sinal de mais ou de menos junto do ponto.",
                    },
                    {
                        frente: "Onde os limites laterais costumam divergir?",
                        verso: "No salto de uma função por partes, na fronteira dos pedaços.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando calcular limite é só substituir?",
                        verso: "Quando o denominador não zera e a função é bem comportada.",
                    },
                    {
                        frente: "Que propriedade vale para soma e produto de limites?",
                        verso: "O limite da soma é a soma dos limites, e o mesmo no produto.",
                    },
                    {
                        frente: "Que restrição a propriedade do quociente carrega?",
                        verso: "O limite do denominador precisa ser diferente de zero.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a indeterminação zero sobre zero indica?",
                        verso: "Que há fator comum a cancelar, e não um beco sem saída.",
                    },
                    {
                        frente: "Que técnica resolve a raiz na indeterminação?",
                        verso: "Multiplicar pelo conjugado para racionalizar a expressão.",
                    },
                    {
                        frente: "Que gesto a indeterminação zero sobre zero pede?",
                        verso: "Fatorar e cancelar o fator que anula os dois lados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "A quanto tende seno de x sobre x com x indo a zero?",
                        verso: "A um, o limite trigonométrico fundamental.",
                    },
                    {
                        frente: "Que disfarce todo limite trigonométrico em zero usa?",
                        verso: "O mesmo fato: seno de algo sobre esse mesmo algo tende a um.",
                    },
                    {
                        frente: "Que ajuste faz o limite valer com seno de 3x?",
                        verso: "Casar o denominador com o argumento, compensando o fator.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quem manda numa função racional no infinito?",
                        verso: "O termo de maior grau, em cima e embaixo da fração.",
                    },
                    {
                        frente: "Que limite uma racional de graus iguais tem?",
                        verso: "A razão entre os coeficientes dos termos de maior grau.",
                    },
                    {
                        frente: "Que limite sobra com o denominador de grau maior?",
                        verso: "Zero, porque o de baixo cresce mais rápido que o de cima.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma assíntota vertical marca no gráfico?",
                        verso: "O ponto onde a função explode, sem valor finito.",
                    },
                    {
                        frente: "Que limite revela uma assíntota horizontal?",
                        verso: "O da função no infinito, quando resulta num número finito.",
                    },
                    {
                        frente: "Onde procurar candidata a assíntota vertical?",
                        verso: "Nas raízes do denominador que sobrevivem à simplificação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que promessa a continuidade faz num ponto?",
                        verso: "O valor para onde a função aponta é o que ela entrega.",
                    },
                    {
                        frente: "Que três condições a continuidade num ponto exige?",
                        verso: "A função existe ali, o limite existe e os dois coincidem.",
                    },
                    {
                        frente: "Que desenho a função contínua permite?",
                        verso: "Percorrer o gráfico num traço só, sem levantar o lápis.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que decide se a descontinuidade é removível?",
                        verso: "Os limites laterais concordarem num mesmo valor finito.",
                    },
                    {
                        frente: "Que descontinuidade o salto caracteriza?",
                        verso: "A de limites laterais finitos, porém diferentes entre si.",
                    },
                    {
                        frente: "Que descontinuidade a assíntota vertical produz?",
                        verso: "A infinita, com pelo menos um dos lados disparando.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que tipo de conclusão o teorema do valor intermediário dá?",
                        verso: "De existência: garante que existe, sem dizer onde.",
                    },
                    {
                        frente: "Que hipótese o teorema do valor intermediário exige?",
                        verso: "Função contínua num intervalo fechado, com os extremos definidos.",
                    },
                    {
                        frente: "Que uso prático o teorema do valor intermediário tem?",
                        verso: "Provar que há raiz entre dois pontos de sinais opostos.",
                    },
                ],
            },
        },
    },
};
