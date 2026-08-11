import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de CSS, trilha sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o resultado na
 * tela; as cartas guardam os nomes das propriedades, os valores padrão e
 * as regras de cascata que a aula enuncia de passagem.
 */
export const css: CartasDaTrilha = {
    trilha: "CSS",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que a sigla CSS significa?",
                        verso: "Folhas de estilo em cascata.",
                    },
                    {
                        frente: "Do que o CSS cuida?",
                        verso: "Da aparência da página.",
                    },
                    {
                        frente: "Do que o HTML cuida?",
                        verso: "Da estrutura.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas formas de aplicar CSS existem?",
                        verso: "Três: inline, interno e externo.",
                    },
                    {
                        frente: "Onde o CSS interno fica?",
                        verso: "Numa tag de estilo, dentro do cabeçalho.",
                    },
                    {
                        frente: "Para que a forma inline serve?",
                        verso: "Só para exceções pontuais.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o seletor faz numa regra?",
                        verso: "Escolhe quais elementos recebem o estilo.",
                    },
                    {
                        frente: "Que seletor atinge todas as tags de um nome?",
                        verso: "O seletor de tipo.",
                    },
                    {
                        frente: "Que símbolo marca o seletor de classe?",
                        verso: "O ponto antes do nome.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que propriedade pinta o texto?",
                        verso: "A de cor.",
                    },
                    {
                        frente: "Que propriedade pinta o fundo?",
                        verso: "A de cor de fundo.",
                    },
                    {
                        frente: "De quantas formas a mesma cor pode ser escrita?",
                        verso: "Por nome, em hexadecimal, em rgb e em hsl.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que é um combinador?",
                        verso: "O símbolo entre dois seletores que descreve a relação.",
                    },
                    {
                        frente: "Que relação o espaço descreve?",
                        verso: "Qualquer descendente.",
                    },
                    {
                        frente: "Que relação o sinal de maior descreve?",
                        verso: "Filho direto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantos dois-pontos marcam uma pseudo-classe?",
                        verso: "Um.",
                    },
                    {
                        frente: "Quantos marcam um pseudo-elemento?",
                        verso: "Dois.",
                    },
                    {
                        frente: "O que uma pseudo-classe mira?",
                        verso: "Um estado ou uma posição do elemento.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que propriedades a herança repassa sozinha?",
                        verso: "As de texto, como cor e fonte.",
                    },
                    {
                        frente: "Que propriedades não são herdadas?",
                        verso: "As de caixa, como margem e borda.",
                    },
                    {
                        frente: "O que a cascata resolve?",
                        verso: "Qual regra vence quando várias miram o mesmo elemento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a especificidade decide?",
                        verso: "Quem vence entre duas regras que miram o mesmo elemento.",
                    },
                    {
                        frente: "A ordem no arquivo vence a especificidade?",
                        verso: "Não: a regra mais específica ganha mesmo vindo antes.",
                    },
                    {
                        frente: "Que seletor pesa mais na pontuação?",
                        verso: "O de identificador, acima de classe e de tipo.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro camadas toda caixa tem?",
                        verso: "Conteúdo, preenchimento, borda e margem.",
                    },
                    {
                        frente: "Em que ordem elas ficam?",
                        verso: "De dentro para fora, nessa sequência.",
                    },
                    {
                        frente: "O que a margem separa?",
                        verso: "O elemento dos vizinhos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a largura mede no modo padrão?",
                        verso: "Só o conteúdo.",
                    },
                    {
                        frente: "O que acontece com preenchimento e borda ali?",
                        verso: "São somados por fora, aumentando a caixa.",
                    },
                    {
                        frente: "O que o modo de caixa de borda muda?",
                        verso: "A largura passa a incluir preenchimento e borda.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como um elemento de bloco se comporta?",
                        verso: "Ocupa a linha inteira e empilha os vizinhos.",
                    },
                    {
                        frente: "Como um elemento em linha se comporta?",
                        verso: "Fica na mesma linha, ocupando só o necessário.",
                    },
                    {
                        frente: "O que o valor de bloco em linha combina?",
                        verso: "Fica na linha, mas aceita largura e altura.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que caracteriza uma unidade absoluta?",
                        verso: "Tamanho fixo, como o pixel.",
                    },
                    {
                        frente: "A que a unidade rem é relativa?",
                        verso: "À fonte da raiz do documento.",
                    },
                    {
                        frente: "A que as unidades de viewport são relativas?",
                        verso: "Ao tamanho da tela.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que é a pilha de fontes?",
                        verso: "Uma lista usada em ordem, até achar uma fonte que exista.",
                    },
                    {
                        frente: "Como a pilha de fontes deve terminar?",
                        verso: "Numa família genérica.",
                    },
                    {
                        frente: "Que propriedade controla o peso da letra?",
                        verso: "A de espessura da fonte.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que altura de linha a aula sugere como ponto de partida?",
                        verso: "Perto de um e meio.",
                    },
                    {
                        frente: "O que o espaçamento entre letras ajusta?",
                        verso: "A distância de uma letra para a outra.",
                    },
                    {
                        frente: "O que o alinhamento de texto controla?",
                        verso: "Se o texto encosta à esquerda, à direita, centraliza ou justifica.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o fundo de um elemento pode ser?",
                        verso: "Uma cor, uma imagem ou um gradiente.",
                    },
                    {
                        frente: "O que a imagem de fundo faz por padrão?",
                        verso: "Se repete até preencher o espaço.",
                    },
                    {
                        frente: "Que propriedade impede essa repetição?",
                        verso: "A de repetição do fundo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que formato a borda usa?",
                        verso: "Espessura, estilo e cor, nessa ordem.",
                    },
                    {
                        frente: "O que o raio da borda faz?",
                        verso: "Arredonda os cantos, e no limite vira círculo.",
                    },
                    {
                        frente: "O que a sombra da caixa acrescenta?",
                        verso: "Profundidade, com uma cópia borrada atrás do elemento.",
                    },
                ],
            },
        },
    },
};
