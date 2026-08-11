import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Álgebra Linear, terceira trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os nomes dos métodos e as
 * condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const algebraLinear: CartasDaTrilha = {
    trilha: "Álgebra Linear",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quantos finais um sistema linear pode ter?",
                        verso: "Três: uma solução, infinitas soluções ou nenhuma.",
                    },
                    {
                        frente: "Que formas uma equação linear proíbe nas incógnitas?",
                        verso: "Potência, raiz e produto entre elas.",
                    },
                    {
                        frente: "O que significa resolver um sistema linear?",
                        verso: "Achar os valores que satisfazem todas as equações ao mesmo tempo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a matriz aumentada carrega além dos coeficientes?",
                        verso: "A coluna dos termos independentes, separada das demais.",
                    },
                    {
                        frente: "Quais são as três operações elementares de linha?",
                        verso: "Trocar duas linhas, multiplicar por escalar não nulo e somar múltiplo.",
                    },
                    {
                        frente: "Que vantagem a matriz aumentada traz ao processo?",
                        verso: "Mexer no sistema sem reescrever as incógnitas a cada passo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que arrumação a eliminação de Gauss produz?",
                        verso: "Zeros abaixo dos pivôs, na forma escalonada.",
                    },
                    {
                        frente: "O que é o pivô de uma linha escalonada?",
                        verso: "O primeiro número não nulo daquela linha.",
                    },
                    {
                        frente: "Que passo resolve o sistema depois de escalonar?",
                        verso: "A substituição de baixo para cima, linha a linha.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que Gauss-Jordan acrescenta à eliminação de Gauss?",
                        verso: "Zeros também acima dos pivôs, entregando a solução pronta.",
                    },
                    {
                        frente: "Que forma a matriz assume ao fim de Gauss-Jordan?",
                        verso: "A escalonada reduzida, com a resposta na última coluna.",
                    },
                    {
                        frente: "Que valor todo pivô tem na forma reduzida?",
                        verso: "Um, com zeros em toda a sua coluna.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que nome o sistema sem solução recebe?",
                        verso: "Sistema impossível.",
                    },
                    {
                        frente: "O que distingue o sistema possível determinado?",
                        verso: "A solução única, com pivô em cada incógnita.",
                    },
                    {
                        frente: "O que produz infinitas soluções num sistema?",
                        verso: "A variável livre, aquela sem pivô na sua coluna.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que condição a soma de matrizes exige?",
                        verso: "Mesma ordem, somando entrada a entrada.",
                    },
                    {
                        frente: "O que a ordem de uma matriz informa?",
                        verso: "Quantas linhas e quantas colunas ela tem, nessa sequência.",
                    },
                    {
                        frente: "O que multiplicar por escalar faz na matriz?",
                        verso: "Multiplica todas as entradas pelo mesmo número.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que encaixe a multiplicação de matrizes exige?",
                        verso: "As colunas da primeira igualando as linhas da segunda.",
                    },
                    {
                        frente: "Que propriedade a multiplicação de matrizes não tem?",
                        verso: "A comutativa: trocar a ordem muda o resultado.",
                    },
                    {
                        frente: "Que operação a multiplicação de matrizes representa?",
                        verso: "O encadeamento de transformações, uma após a outra.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a transposta faz com a matriz?",
                        verso: "Troca linhas por colunas.",
                    },
                    {
                        frente: "O que caracteriza uma matriz simétrica?",
                        verso: "Ser igual à própria transposta.",
                    },
                    {
                        frente: "Que papel a identidade cumpre no produto?",
                        verso: "O de elemento neutro, deixando a outra matriz intacta.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que operação a inversa torna possível?",
                        verso: "A divisão no mundo das matrizes, desfazendo a original.",
                    },
                    {
                        frente: "Que produto define a inversa de uma matriz?",
                        verso: "O que devolve a identidade nas duas ordens.",
                    },
                    {
                        frente: "Que formato toda matriz invertível tem?",
                        verso: "Quadrada, com o mesmo número de linhas e colunas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que matriz acompanha a original no escalonamento?",
                        verso: "A identidade, ao lado, recebendo as mesmas operações.",
                    },
                    {
                        frente: "Que sinal indica que a inversa não existe?",
                        verso: "Uma linha inteira de zeros aparecendo no escalonamento.",
                    },
                    {
                        frente: "O que sobra no lugar da identidade ao final?",
                        verso: "A inversa, quando o lado esquerdo vira identidade.",
                    },
                ],
            },
        },
    },
};
