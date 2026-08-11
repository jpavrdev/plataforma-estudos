import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Pré-cálculo, primeira trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os nomes das técnicas e as
 * armadilhas de sinal que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const preCalculo: CartasDaTrilha = {
    trilha: "Pré-cálculo",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que cadeia de inclusões os conjuntos numéricos formam?",
                        verso: "Naturais dentro de inteiros, dentro de racionais, dentro de reais.",
                    },
                    {
                        frente: "Como uma dízima periódica simples vira fração?",
                        verso: "O período sobre tantos noves quantos os algarismos repetidos.",
                    },
                    {
                        frente: "Como se calcula a distância entre dois pontos da reta?",
                        verso: "Pelo módulo da diferença entre eles.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um expoente negativo indica na potência?",
                        verso: "O inverso: um sobre a mesma potência com expoente positivo.",
                    },
                    {
                        frente: "Que erro mais comum troca soma por multiplicação?",
                        verso: "Multiplicar expoentes no produto de mesma base, em vez de somar.",
                    },
                    {
                        frente: "Que diferença o sinal antes da base provoca?",
                        verso: "Com parênteses o expoente age no negativo; sem eles, só no número.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois nomes as partes de um radical recebem?",
                        verso: "O índice, fora, e o radicando, dentro da raiz.",
                    },
                    {
                        frente: "Que expoente fracionário corresponde à raiz n-ésima?",
                        verso: "Um sobre n, e a raiz de a elevado a m vira m sobre n.",
                    },
                    {
                        frente: "Que ganho a ponte entre raiz e potência traz?",
                        verso: "Todas as propriedades de potência passam a valer no radical.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro produtos notáveis a aula manda memorizar?",
                        verso: "Quadrado da soma, da diferença, soma por diferença e o cubo.",
                    },
                    {
                        frente: "Que termo do meio o quadrado da soma carrega?",
                        verso: "O dobro do produto dos dois termos, com sinal positivo.",
                    },
                    {
                        frente: "Que resultado a soma pela diferença produz?",
                        verso: "A diferença dos quadrados, sem termo do meio.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que fatorar significa, em uma frase?",
                        verso: "Escrever a expressão como um produto de fatores.",
                    },
                    {
                        frente: "Que três técnicas de fatoração a aula prioriza?",
                        verso: "Fator comum, diferença de quadrados e trinômio por soma e produto.",
                    },
                    {
                        frente: "Que caminho simplifica uma fração algébrica?",
                        verso: "Fatorar numerador e denominador e cancelar o fator comum.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Em que ordem se desfazem as operações ao isolar?",
                        verso: "Primeiro soma e subtração, depois multiplicação e divisão.",
                    },
                    {
                        frente: "Que passo final toda equação resolvida merece?",
                        verso: "Substituir a resposta na equação original e conferir.",
                    },
                    {
                        frente: "O que isolar a incógnita significa na prática?",
                        verso: "Fazer e desfazer operações até ela ficar sozinha.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que cálculo precede a aplicação da fórmula?",
                        verso: "O do discriminante, cujo sinal antecipa as raízes reais.",
                    },
                    {
                        frente: "O que o discriminante negativo indica sobre as raízes?",
                        verso: "Que não existe raiz real, e a fórmula pararia ali.",
                    },
                    {
                        frente: "Quantas raízes o discriminante zero produz?",
                        verso: "Uma só, com as duas raízes coincidindo no mesmo valor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que teste confirma a solução de um sistema?",
                        verso: "Substituir o par nas duas equações originais ao mesmo tempo.",
                    },
                    {
                        frente: "Que erro tratar uma equação só provoca?",
                        verso: "Aceitar um par que serve a uma e falha na outra do sistema.",
                    },
                    {
                        frente: "Que dois métodos clássicos resolvem um sistema?",
                        verso: "A substituição e a adição das equações.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que operação obriga a virar o sinal da desigualdade?",
                        verso: "Multiplicar ou dividir os dois lados por um negativo.",
                    },
                    {
                        frente: "Que descuido lidera os erros em inequação?",
                        verso: "Esquecer de inverter o sinal depois do negativo.",
                    },
                    {
                        frente: "Que forma a resposta de uma inequação assume?",
                        verso: "Um intervalo de valores, e não um número único.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que linguagem o módulo deve ser traduzido?",
                        verso: "Na de distância até um ponto da reta real.",
                    },
                    {
                        frente: "Em quantos casos uma igualdade com módulo se abre?",
                        verso: "Em dois, um para cada sinal possível do interior.",
                    },
                    {
                        frente: "Que forma o sinal de maior com módulo produz?",
                        verso: "Dois pedaços separados na reta, e não um intervalo.",
                    },
                ],
            },
        },
    },
};
