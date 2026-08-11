import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de PHP, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * código; as cartas guardam as regras da linguagem, os operadores e as
 * armadilhas de segurança que a aula enuncia de passagem.
 */
export const php: CartasDaTrilha = {
    trilha: "PHP",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Onde o PHP roda?",
                        verso: "No servidor.",
                    },
                    {
                        frente: "O que quem acessa o site recebe?",
                        verso: "O resultado pronto, nunca o código.",
                    },
                    {
                        frente: "Que saída o PHP costuma devolver?",
                        verso: "HTML já montado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como um script PHP é executado no terminal?",
                        verso: "Pelo próprio interpretador, apontando para o arquivo.",
                    },
                    {
                        frente: "Que servidor o PHP oferece para desenvolver?",
                        verso: "Um servidor embutido, iniciado por comando.",
                    },
                    {
                        frente: "Que extensão o arquivo usa?",
                        verso: "A extensão php.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Com que símbolo toda variável começa?",
                        verso: "Com cifrão.",
                    },
                    {
                        frente: "O que a saída simples faz com o valor?",
                        verso: "Imprime direto na resposta.",
                    },
                    {
                        frente: "O que o tipo de uma variável pode fazer ao longo do tempo?",
                        verso: "Mudar, porque a tipagem é dinâmica.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por onde todo dado externo passa antes de virar HTML?",
                        verso: "Pelo escape de caracteres especiais.",
                    },
                    {
                        frente: "Existe exceção a essa regra?",
                        verso: "Nenhuma.",
                    },
                    {
                        frente: "Que ataque esse escape previne?",
                        verso: "A injeção de script na página.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a instalação pelo Composer respeita?",
                        verso: "O arquivo de trava, com as versões fixadas.",
                    },
                    {
                        frente: "O que a atualização faz com esse arquivo?",
                        verso: "Ignora e busca versões novas.",
                    },
                    {
                        frente: "O que o Composer gerencia num projeto?",
                        verso: "As dependências e o carregamento automático.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que tipos escalares o PHP tem?",
                        verso: "Inteiro, decimal, string e booleano.",
                    },
                    {
                        frente: "O que a conversão implícita faz?",
                        verso: "Muda o tipo do valor conforme o contexto.",
                    },
                    {
                        frente: "Que risco a conversão implícita traz?",
                        verso: "Comparações com resultado inesperado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que aspas fazem interpolação de variável?",
                        verso: "As aspas duplas.",
                    },
                    {
                        frente: "O que as aspas simples fazem?",
                        verso: "Tratam o conteúdo como texto literal.",
                    },
                    {
                        frente: "Para que serve o heredoc?",
                        verso: "Escrever blocos longos, com interpolação.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a comparação simples faz antes de comparar?",
                        verso: "Converte os tipos.",
                    },
                    {
                        frente: "O que a comparação estrita exige?",
                        verso: "Mesmo valor e mesmo tipo.",
                    },
                    {
                        frente: "Qual das duas é a recomendada?",
                        verso: "A estrita, por evitar surpresa.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o operador de coalescência trata?",
                        verso: "Valor ausente.",
                    },
                    {
                        frente: "O que o operador seguro para nulo trata?",
                        verso: "Objeto ausente.",
                    },
                    {
                        frente: "O que os dois juntos cobrem?",
                        verso: "Quase todo caso de nulo do dia a dia.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como o match compara os braços?",
                        verso: "De forma estrita, sem conversão de tipo.",
                    },
                    {
                        frente: "O que o match devolve?",
                        verso: "Uma expressão, que pode ser atribuída.",
                    },
                    {
                        frente: "O que acontece se nenhum braço casar?",
                        verso: "Um erro é lançado.",
                    },
                ],
            },
        },
    },
};
