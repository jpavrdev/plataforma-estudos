import type { CartasDaTrilha } from "../../seed-flashcards.ts";

// Trilha com quiz denso: cinco questões por aula cobrindo boa parte do conteúdo.
// Onde a aula não sustenta um cartão distinto do que já é cobrado, ela fica sem
// cartão, porque forçar produziria repetição.
export const java: CartasDaTrilha = {
    trilha: "Java",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre JRE e JDK?",
                        verso: "O JRE roda programas Java; o JDK traz também o compilador.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como o arquivo precisa se chamar em relação à classe pública?",
                        verso: "Exatamente igual à classe, com a extensão .java.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o ponto e vírgula marca em Java?",
                        verso: "O fim de cada instrução.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quantos caracteres um char guarda?",
                        verso: "Um só, escrito entre aspas simples.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando a conversão de tipo é automática em Java?",
                        verso: "De tipo menor para maior, porque aí não há perda de informação.",
                    },
                ],
            },
        },
        3: {
            2: {
                neutra: [
                    {
                        frente: "O que o switch com seta evita?",
                        verso: "O fall-through, sem precisar escrever break em cada case.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando o for clássico ganha do for-each?",
                        verso: "Quando você precisa do índice ou de controle fino da repetição.",
                    },
                ],
            },
        },
        4: {
            2: {
                neutra: [
                    {
                        frente: "Por que comparar String com == é errado em Java?",
                        verso: "O == compara se são o mesmo objeto na memória, não o conteúdo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que situação o StringBuilder mais compensa?",
                        verso: "Ao juntar muitas partes de texto dentro de um laço.",
                    },
                ],
            },
        },
        6: {
            2: {
                neutra: [
                    {
                        frente: "O que acontece com um objeto sem nenhuma referência apontando para ele?",
                        verso: "Deixa de existir, e o coletor de lixo recolhe a memória.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que relação a herança modela?",
                        verso: "A de é um tipo de: o cachorro é um tipo de animal.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas classes base e quantas interfaces uma classe pode ter?",
                        verso: "Uma classe base só, mas várias interfaces ao mesmo tempo.",
                    },
                ],
            },
        },
        8: {
            2: {
                neutra: [
                    {
                        frente: "Um Map permite valores repetidos?",
                        verso: "Sim. Só as chaves precisam ser únicas.",
                    },
                ],
            },
        },
        9: {
            1: {
                neutra: [
                    {
                        frente: "Qual símbolo escreve uma lambda em Java?",
                        verso: "A seta ->, entre os parâmetros e o corpo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre operação intermediária e terminal numa stream?",
                        verso: "A intermediária encadeia e não roda; a terminal encerra e produz o resultado.",
                    },
                ],
            },
        },
    },
};
