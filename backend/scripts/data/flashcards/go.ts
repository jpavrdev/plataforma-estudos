import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Go, segunda trilha do roadmap de DevOps.
 *
 * Trilha de nove módulos de três aulas, sem trilhos de linguagem: tudo em
 * "neutra". O quiz cobra a leitura de código; as cartas ficam com as listas
 * fechadas, os nomes das ferramentas e as regras que a aula enuncia de passagem.
 */
export const go: CartasDaTrilha = {
    trilha: "Go",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que ferramentas conhecidas são escritas em Go?",
                        verso: "O Docker e o Kubernetes, além de muita infra de nuvem.",
                    },
                    {
                        frente: "Que problema o Go nasceu para resolver?",
                        verso: "Software de servidor rápido de compilar, simples de ler e concorrente.",
                    },
                    {
                        frente: "Que quatro escolhas de projeto definem o Go?",
                        verso: "Simplicidade, compilação rápida, concorrência embutida e formatação única.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre go run e go build?",
                        verso: "O run compila e executa de uma vez; o build gera o binário.",
                    },
                    {
                        frente: "O que o Go dispensa no fim de cada linha?",
                        verso: "O ponto e vírgula: a ferramenta cuida disso sozinha.",
                    },
                    {
                        frente: "O que o fmt.Println faz além de imprimir?",
                        verso: "Pula uma linha depois de imprimir o argumento.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que palavras o Go dispensa para controlar visibilidade?",
                        verso: "As de público e privado: a inicial do nome decide sozinha.",
                    },
                    {
                        frente: "Que pacotes da biblioteca padrão a aula cita?",
                        verso: "fmt para formatação, strings, math e os para o sistema.",
                    },
                    {
                        frente: "O que cada arquivo Go declara logo na primeira linha?",
                        verso: "A que pacote ele pertence.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Onde a forma curta com dois pontos e igual pode ser usada?",
                        verso: "Só dentro de funções; fora delas, usa-se var.",
                    },
                    {
                        frente: "Que zero value os números e os booleanos recebem?",
                        verso: "Zero nos números e false nos booleanos.",
                    },
                    {
                        frente: "Por que o Go trata variável não usada como erro?",
                        verso: "É escolha proposital para manter o código limpo.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De que tipos byte e rune são apelidos?",
                        verso: "byte é apelido de uint8 e rune, de int32.",
                    },
                    {
                        frente: "Quando uma constante do Go é resolvida?",
                        verso: "Em tempo de compilação; ela não aceita valor só conhecido ao rodar.",
                    },
                    {
                        frente: "De que depende o tamanho do tipo int em Go?",
                        verso: "Da plataforma; existem também int32 e int64 explícitos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro verbos de formato o Printf usa com mais frequência?",
                        verso: "Um para inteiro, um para float, um para string e um para qualquer valor.",
                    },
                    {
                        frente: "Por que não se escreve uma atribuição recebendo i mais mais?",
                        verso: "O incremento é instrução, não expressão, então não devolve valor.",
                    },
                    {
                        frente: "O que o Printf não faz, ao contrário do Println?",
                        verso: "Pular linha: a quebra vai escrita na string de formato.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que instrução o if do Go aceita antes da condição?",
                        verso: "Uma inicialização curta, separada por ponto e vírgula.",
                    },
                    {
                        frente: "Com que tipo de função o if com inicialização mais combina?",
                        verso: "Com as que devolvem um valor e um erro de uma vez.",
                    },
                    {
                        frente: "De que linguagens o switch do Go se diferencia no fall-through?",
                        verso: "De C e Java: nele cada case para sozinho, sem break.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que laços o Go não tem, além do for?",
                        verso: "Nem while nem do-while: o for cobre todos os casos.",
                    },
                    {
                        frente: "Que três formas o for do Go assume?",
                        verso: "A clássica com três partes, só com a condição, ou sem nada.",
                    },
                    {
                        frente: "O que a forma clássica do for declara nas três partes?",
                        verso: "Inicialização, condição e passo, separados por ponto e vírgula.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Sobre que quatro tipos o for range consegue iterar?",
                        verso: "Slice, array, string e map.",
                    },
                    {
                        frente: "Que outro uso o identificador em branco tem, além do range?",
                        verso: "Descartar qualquer retorno que você não vai usar.",
                    },
                    {
                        frente: "Que dois valores o range entrega a cada volta?",
                        verso: "O índice e o valor do elemento atual, nessa ordem.",
                    },
                ],
            },
        },
    },
};
