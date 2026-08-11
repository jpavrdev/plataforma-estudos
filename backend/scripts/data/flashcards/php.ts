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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Onde preferir a sintaxe alternativa dos condicionais?",
                        verso: "Em arquivos de template.",
                    },
                    {
                        frente: "Onde preferir as chaves?",
                        verso: "Em arquivos só de lógica.",
                    },
                    {
                        frente: "O que a sintaxe alternativa troca?",
                        verso: "As chaves por palavras de abertura e fechamento.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que laço percorre array sem controlar o índice?",
                        verso: "O foreach.",
                    },
                    {
                        frente: "O que o foreach entrega a cada volta?",
                        verso: "O valor, e opcionalmente a chave.",
                    },
                    {
                        frente: "Que laço serve quando a condição decide a parada?",
                        verso: "O while.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um parâmetro com valor padrão permite?",
                        verso: "Chamar a função sem passar aquele argumento.",
                    },
                    {
                        frente: "Onde os parâmetros com padrão precisam ficar?",
                        verso: "Depois dos obrigatórios.",
                    },
                    {
                        frente: "O que o retorno declarado documenta?",
                        verso: "O tipo que a função entrega.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para onde vale a declaração de tipos estritos?",
                        verso: "Só para o arquivo onde está escrita.",
                    },
                    {
                        frente: "Onde ela precisa aparecer?",
                        verso: "Como a primeira instrução do arquivo.",
                    },
                    {
                        frente: "O que ela muda no comportamento?",
                        verso: "O PHP deixa de converter o argumento e reclama.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que os argumentos nomeados permitem?",
                        verso: "Passar só o que interessa, fora de ordem.",
                    },
                    {
                        frente: "O que uma função de seta captura sozinha?",
                        verso: "As variáveis do escopo em volta.",
                    },
                    {
                        frente: "Quantas expressões uma função de seta tem?",
                        verso: "Uma só, que já é o retorno.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que dois tipos de array o PHP tem?",
                        verso: "Indexado e associativo.",
                    },
                    {
                        frente: "O que o array associativo usa como chave?",
                        verso: "Uma string escolhida por você.",
                    },
                    {
                        frente: "O que acontece ao remover um item do indexado?",
                        verso: "As chaves ficam com buracos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a filtragem deixa para trás nas chaves?",
                        verso: "Os índices originais, agora com buracos.",
                    },
                    {
                        frente: "O que corrige isso antes de virar JSON?",
                        verso: "Reindexar o array.",
                    },
                    {
                        frente: "Que problema o array com buracos causa numa API?",
                        verso: "Vira objeto no JSON, onde deveria ser lista.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que as funções de ordenação fazem com o array?",
                        verso: "Ordenam no próprio lugar, sem devolver cópia.",
                    },
                    {
                        frente: "Que cuidado a ordenação de associativo exige?",
                        verso: "Escolher a função que preserva as chaves.",
                    },
                    {
                        frente: "Que função diz se um valor está no array?",
                        verso: "A de busca por valor, com comparação estrita opcional.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o espalhamento faz com um array?",
                        verso: "Desmonta os itens dentro de outro array ou chamada.",
                    },
                    {
                        frente: "O que a desestruturação faz?",
                        verso: "Distribui os itens em variáveis de uma vez.",
                    },
                    {
                        frente: "Que ganho o espalhamento traz na junção?",
                        verso: "Combina arrays sem função auxiliar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a codificação para JSON espera do array?",
                        verso: "Chaves sequenciais, para virar lista.",
                    },
                    {
                        frente: "O que a decodificação devolve por padrão?",
                        verso: "Um objeto, salvo se você pedir array associativo.",
                    },
                    {
                        frente: "Que cuidado a decodificação exige?",
                        verso: "Checar se falhou antes de usar o resultado.",
                    },
                ],
            },
        },
    },
};
