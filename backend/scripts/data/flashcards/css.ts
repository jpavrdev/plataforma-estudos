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
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que o Flexbox organiza?",
                        verso: "Os filhos de um elemento, em linha ou em coluna.",
                    },
                    {
                        frente: "Onde o Flexbox é ligado?",
                        verso: "No container, o elemento pai.",
                    },
                    {
                        frente: "Quantas direções o Flexbox trata por vez?",
                        verso: "Uma: linha ou coluna.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a propriedade de justificar alinha?",
                        verso: "Os itens no eixo principal.",
                    },
                    {
                        frente: "O que a propriedade de alinhar itens alinha?",
                        verso: "Os itens no eixo transversal.",
                    },
                    {
                        frente: "O que a justificação faz com o espaço que sobra?",
                        verso: "Distribui entre os itens e ao redor deles.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que muda quando a direção vira coluna?",
                        verso: "Os eixos giram: o principal passa a ser o vertical.",
                    },
                    {
                        frente: "O que a quebra permite?",
                        verso: "Que os itens passem para a linha seguinte.",
                    },
                    {
                        frente: "O que a propriedade de espaçamento cria?",
                        verso: "O respiro entre os itens, sem precisar de margem.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o crescimento de um item define?",
                        verso: "Quanto ele cresce na sobra de espaço.",
                    },
                    {
                        frente: "O que o encolhimento define?",
                        verso: "Quanto ele cede quando falta espaço.",
                    },
                    {
                        frente: "O que a base define?",
                        verso: "O tamanho inicial do item no eixo principal.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Quantas dimensões o Grid trata?",
                        verso: "Duas: linhas e colunas ao mesmo tempo.",
                    },
                    {
                        frente: "Onde o Grid é ligado?",
                        verso: "No container, pelo valor de grid no display.",
                    },
                    {
                        frente: "O que define as colunas?",
                        verso: "A propriedade de modelo de colunas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a propriedade de espaçamento cria no grid?",
                        verso: "O respiro entre as células, sem sobrar nas bordas.",
                    },
                    {
                        frente: "O que o modelo de linhas define?",
                        verso: "A altura das linhas.",
                    },
                    {
                        frente: "Como um item é posicionado numa célula específica?",
                        verso: "Indicando as linhas de início e de fim.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois passos as áreas nomeadas exigem?",
                        verso: "Batizar cada item e desenhar o layout no container.",
                    },
                    {
                        frente: "Onde o nome do item é definido?",
                        verso: "No próprio filho, pela propriedade de área.",
                    },
                    {
                        frente: "O que torna as áreas nomeadas atraentes?",
                        verso: "O layout fica desenhado dentro do próprio código.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a função de intervalo define?",
                        verso: "Um piso e um teto para a coluna.",
                    },
                    {
                        frente: "Que combinação cria uma grade que se encaixa sozinha?",
                        verso: "A repetição automática com intervalo mínimo e máximo.",
                    },
                    {
                        frente: "Quando escolher Flexbox em vez de Grid?",
                        verso: "Quando o arranjo é numa direção só.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que é design responsivo?",
                        verso: "Uma página só, que se adapta a qualquer tela.",
                    },
                    {
                        frente: "Em que ele se apoia?",
                        verso: "Unidades relativas, layout flexível e media queries.",
                    },
                    {
                        frente: "O que ele substitui?",
                        verso: "Fazer um site separado para cada tipo de tela.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma media query faz?",
                        verso: "Aplica CSS só quando uma condição de tela é verdadeira.",
                    },
                    {
                        frente: "Que condição é a mais usada?",
                        verso: "A de largura da tela.",
                    },
                    {
                        frente: "Que tag precisa existir no HTML para o responsivo funcionar?",
                        verso: "A meta de viewport.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que unidades deixam o layout fluido?",
                        verso: "As relativas, como porcentagem, vw e rem.",
                    },
                    {
                        frente: "A que a porcentagem é relativa?",
                        verso: "Ao elemento pai.",
                    },
                    {
                        frente: "Que ajuste impede a imagem de estourar o espaço?",
                        verso: "Limitar a largura máxima a cem por cento.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um layout responsivo, no fim?",
                        verso: "A soma das técnicas da trilha, e não uma técnica única.",
                    },
                    {
                        frente: "Por onde a montagem começa?",
                        verso: "Pela meta de viewport e por um HTML bem estruturado.",
                    },
                    {
                        frente: "Que abordagem escreve primeiro o estilo do celular?",
                        verso: "A de mobile primeiro.",
                    },
                ],
            },
        },
    },
};
