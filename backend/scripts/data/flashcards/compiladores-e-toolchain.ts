import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Compiladores e Toolchain, sexta trilha do roadmap de C++ e
 * Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o diagnóstico
 * do cenário; as cartas guardam as listas fechadas, os nomes de flag e as
 * distinções que a aula enuncia de passagem.
 */
export const compiladoresEToolchain: CartasDaTrilha = {
    trilha: "Compiladores e Toolchain",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro ferramentas o comando de compilar chama?",
                        verso: "Pré-processador, compilador, assembler e linker.",
                    },
                    {
                        frente: "Que flag para o fluxo logo depois do compilador?",
                        verso: "A que gera assembly, parando antes do assembler.",
                    },
                    {
                        frente: "Como projetos grandes organizam o build?",
                        verso: "Cada arquivo com objeto próprio e um link só no fim.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que linguagem o pré-processador realmente entende?",
                        verso: "Nenhuma: ele só enxerga texto e diretivas com cerquilha.",
                    },
                    {
                        frente: "Que alternativa ao guard clássico os compiladores aceitam?",
                        verso: "O pragma once, mais curto e sem nome de macro.",
                    },
                    {
                        frente: "Que substitutos a regra prática prefere às macros?",
                        verso: "Constantes const ou constexpr e funções inline.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois erros a ODR produz quando é violada?",
                        verso: "Referência indefinida com zero, e duplicada com duas.",
                    },
                    {
                        frente: "Que licença o inline moderno realmente concede?",
                        verso: "A de repetir a definição em várias unidades de tradução.",
                    },
                    {
                        frente: "Que efeito o static tem sobre um nome global?",
                        verso: "Dá linkage interno: cada unidade tem a própria cópia.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que letras o nm usa para os símbolos principais?",
                        verso: "T no código, U no indefinido, D e B nos dados.",
                    },
                    {
                        frente: "Que anotação o assembler deixa no lugar do endereço?",
                        verso: "Um buraco com bilhete de relocação para o linker.",
                    },
                    {
                        frente: "Que formato os objetos usam no Linux?",
                        verso: "O ELF, com seções separadas de código e dados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que momento o erro de biblioteca dinâmica aparece?",
                        verso: "Na execução, quando o carregador não acha o arquivo.",
                    },
                    {
                        frente: "Que argumento decisivo favorece a linkagem dinâmica?",
                        verso: "A segurança: um patch conserta todos os programas.",
                    },
                    {
                        frente: "Que variável adiciona diretórios à busca do carregador?",
                        verso: "A de caminho de biblioteca, ótima em teste e ruim fixa.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que regra decide onde um token termina?",
                        verso: "A do bocado máximo, comendo o maior trecho válido.",
                    },
                    {
                        frente: "Que dois exemplos de erro léxico a aula dá?",
                        verso: "Um caractere fora da linguagem e uma string sem fechar.",
                    },
                    {
                        frente: "Que informação cada token carrega além da categoria?",
                        verso: "O lexema, o texto original que apareceu no fonte.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a árvore sintática é chamada de abstrata?",
                        verso: "Ela descarta o que era só notação, como o parêntese.",
                    },
                    {
                        frente: "Que papel a precedência cumpre na forma da árvore?",
                        verso: "Decide quem fica mais perto das folhas na expressão.",
                    },
                    {
                        frente: "O que a associatividade resolve que a precedência não?",
                        verso: "O empate entre operadores de mesma força na expressão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que produto a análise semântica entrega adiante?",
                        verso: "A árvore anotada, com tipo em cada nó e nome resolvido.",
                    },
                    {
                        frente: "Que erro usar função definida mais abaixo produz?",
                        verso: "Semântico, por falta de declaração visível ali.",
                    },
                    {
                        frente: "Que fase produz o undefined reference, afinal?",
                        verso: "O linker, bem depois da análise semântica.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que linha vale olhar além da apontada pelo erro?",
                        verso: "A anterior: a pontuação faltante mora logo acima.",
                    },
                    {
                        frente: "Que flags limitam a saída ao primeiro erro?",
                        verso: "O máximo de erros no gcc e o limite no clang.",
                    },
                    {
                        frente: "Que proporção de problema e eco a tela costuma ter?",
                        verso: "Um problema real e dezenas de ecos do parser perdido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ordem a avaliação de uma árvore segue?",
                        verso: "A pós-ordem: filhos antes do pai e folhas antes de tudo.",
                    },
                    {
                        frente: "Que descoberta o exercício de avaliar revela?",
                        verso: "Que interpretar é percorrer, em poucas linhas recursivas.",
                    },
                    {
                        frente: "Como o hábito muda a leitura de expressão difícil?",
                        verso: "Localiza-se o operador da raiz em vez de ler em linha.",
                    },
                ],
            },
        },
    },
};
