import type { CartasDaTrilha } from "../../seed-flashcards.ts";

export const html: CartasDaTrilha = {
    trilha: "HTML",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Na analogia do corpo, o que o HTML representa numa página?",
                        verso: "O esqueleto: a estrutura e o conteúdo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que vai dentro da tag body?",
                        verso: "O conteúdo que aparece na tela.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são as três partes de um elemento HTML?",
                        verso: "Tag de abertura, conteúdo e tag de fechamento.",
                    },
                    {
                        frente: "O que o atributo lang informa, e em qual elemento ele fica?",
                        verso: "O idioma da página, no elemento html.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que programa é preciso para escrever HTML?",
                        verso: "Qualquer editor de texto, porque o arquivo é texto puro.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quantos níveis de título o HTML tem?",
                        verso: "Seis, de h1 a h6, em ordem de importância.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que tipo de lista usar para termo e definição?",
                        verso: "A lista de definições, com dl, dt e dd.",
                    },
                    {
                        frente: "O que o atributo type de uma lista ordenada muda?",
                        verso: "A forma de numerar: números, letras ou romanos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre strong e b?",
                        verso: "O strong marca importância; o b só engrossa, sem significado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como criar um link que salta para um trecho da mesma página?",
                        verso: "Dar id ao elemento e apontar o href para esse id com cerquilha.",
                    },
                ],
            },
        },
        3: {
            4: {
                neutra: [
                    {
                        frente: "Que atributo funde células na horizontal?",
                        verso: "O de expansão por colunas.",
                    },
                    {
                        frente: "Que atributo funde células na vertical?",
                        verso: "O de expansão por linhas.",
                    },
                    {
                        frente: "O que acontece com a célula absorvida?",
                        verso: "Ela sai do código, em vez de ficar vazia.",
                    },
                ],
            },
            1: {
                neutra: [
                    {
                        frente: "Qual formato usar para foto e qual para logo com transparência?",
                        verso: "JPG para foto; PNG quando precisa de fundo transparente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Para que serve o atributo poster num vídeo?",
                        verso: "Define a imagem que aparece antes de a pessoa dar play.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual tag envolve uma célula comum de dados numa tabela?",
                        verso: "A td, sempre dentro de uma tr.",
                    },
                ],
            },
        },
        4: {
            5: {
                neutra: [
                    {
                        frente: "O que a validação nativa dispensa?",
                        verso: "Escrever código para checar o básico.",
                    },
                    {
                        frente: "Que atributo torna o campo obrigatório?",
                        verso: "O de campo requerido.",
                    },
                    {
                        frente: "A validação nativa substitui a do servidor?",
                        verso: "Não: ela é conveniência, e não segurança.",
                    },
                ],
            },
            1: {
                neutra: [
                    {
                        frente: "O que o atributo name de um campo determina?",
                        verso: "O nome com que o valor chega ao servidor; sem ele o campo não vai.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o type email dá de brinde num campo?",
                        verso: "Teclado com arroba e conferência do formato digitado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o value de uma option representa?",
                        verso: "O valor enviado, que pode ser diferente do texto exibido.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde fica o rótulo do button e onde fica o do input de envio?",
                        verso: "No button, entre as tags; no input, dentro do atributo value.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que a tag aside marca numa página?",
                        verso: "Conteúdo complementar, ao lado do principal.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma tag semântica cria para o leitor de tela?",
                        verso: "Uma landmark, uma região que dá para navegar direto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a meta viewport resolve?",
                        verso: "Ajusta a página ao tamanho real da tela do celular.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como devem ser os nomes de arquivo de um site?",
                        verso: "Minúsculas, sem espaços nem acentos.",
                    },
                ],
            },
        },
    },
};
