import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de ISTQB CTFL, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário; as
 * cartas guardam o vocabulário exato do syllabus, as listas fechadas e as
 * distinções que a prova transforma em distrator.
 */
export const istqbCtfl: CartasDaTrilha = {
    trilha: "ISTQB CTFL",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o teste dinâmico faz?",
                        verso: "Executa o software.",
                    },
                    {
                        frente: "O que o teste estático faz?",
                        verso: "Examina artefatos sem executar.",
                    },
                    {
                        frente: "Os dois contam como teste?",
                        verso: "Contam, e a prova cobra essa distinção com frequência.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o teste faz e o que a depuração faz?",
                        verso: "O teste encontra; a depuração corrige.",
                    },
                    {
                        frente: "O que a depuração não envolve no teste estático?",
                        verso: "Reproduzir a falha nem diagnosticar a causa.",
                    },
                    {
                        frente: "Por que ela não envolve isso ali?",
                        verso: "O defeito foi encontrado direto no artefato.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De que o teste faz parte?",
                        verso: "Do controle de qualidade.",
                    },
                    {
                        frente: "De que ele não faz parte?",
                        verso: "Da garantia da qualidade.",
                    },
                    {
                        frente: "Como esse distrator aparece na prova?",
                        verso: "Invertendo os dois.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um erro?",
                        verso: "Uma ação humana.",
                    },
                    {
                        frente: "O que é um defeito?",
                        verso: "A imperfeição no artefato.",
                    },
                    {
                        frente: "O que é uma falha?",
                        verso: "O comportamento errado na execução.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é uma condição de teste?",
                        verso: "O que verificar, produto da análise.",
                    },
                    {
                        frente: "O que é um caso de teste?",
                        verso: "Como verificar, produto da modelagem.",
                    },
                    {
                        frente: "Que outra dupla a prova cobra junto dessa?",
                        verso: "Verificação contra validação.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o primeiro princípio diz?",
                        verso: "O teste não prova ausência de defeitos.",
                    },
                    {
                        frente: "O que o sétimo princípio diz?",
                        verso: "Ausência de defeitos não garante um produto útil.",
                    },
                    {
                        frente: "Quantos princípios o syllabus lista?",
                        verso: "Sete.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a análise produz?",
                        verso: "Condições de teste.",
                    },
                    {
                        frente: "O que a modelagem produz?",
                        verso: "Casos de teste.",
                    },
                    {
                        frente: "Qual é a confusão mais frequente da prova aqui?",
                        verso: "Trocar análise por modelagem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que duas perguntas a rastreabilidade responde?",
                        verso: "O que essa mudança afeta e o que ainda não foi coberto.",
                    },
                    {
                        frente: "O que é o testware?",
                        verso: "Todo artefato produzido pelo trabalho de teste.",
                    },
                    {
                        frente: "O que a rastreabilidade liga?",
                        verso: "A base de teste aos casos e aos resultados.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que reveses a independência traz?",
                        verso: "Isolamento, feedback lento e resistência à informação.",
                    },
                    {
                        frente: "Que outro revés o syllabus cita?",
                        verso: "A perda de conhecimento do produto pela equipe.",
                    },
                    {
                        frente: "Por que a prova pergunta os reveses?",
                        verso: "Porque a maioria só decora os benefícios.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que frase resume erro, defeito e falha?",
                        verso: "Erro é humano, defeito é do artefato, falha é da execução.",
                    },
                    {
                        frente: "Que frase separa teste de depuração?",
                        verso: "Teste encontra, depuração corrige.",
                    },
                    {
                        frente: "Que frase separa garantia de controle?",
                        verso: "Garantia é processo, controle é produto.",
                    },
                ],
            },
        },
    },
};
