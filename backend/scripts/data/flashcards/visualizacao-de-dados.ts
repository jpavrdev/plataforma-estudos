import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Visualização de Dados, quinta trilha do roadmap de Ciência de
 * Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a escolha do
 * gráfico e a saída do código; as cartas guardam os nomes de função, as
 * listas fechadas e os detalhes que a aula enuncia de passagem.
 */
export const visualizacaoDeDados: CartasDaTrilha = {
    trilha: "Visualização de Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quem construiu o quarteto, e em que ano?",
                        verso: "O estatístico Francis Anscombe, em 1973.",
                    },
                    {
                        frente: "Que quatro formas os conjuntos do quarteto desenham?",
                        verso: "Reta com ruído, arco, reta com outlier e ponto isolado.",
                    },
                    {
                        frente: "Quantos pares de valores cada conjunto do quarteto tem?",
                        verso: "Onze pares, com correlação de 0,816 em todos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que erro mais comum inverte os dois papéis do gráfico?",
                        verso: "Entregar gráfico cru de exploração para outra pessoa.",
                    },
                    {
                        frente: "Que pergunta resolve se o gráfico já está pronto?",
                        verso: "Se ele é só para você ou se outra pessoa vai olhar.",
                    },
                    {
                        frente: "Quantos gráficos cada fase costuma produzir?",
                        verso: "Muitos e descartáveis ao explorar; poucos e revisados ao explicar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que cinco famílias de pergunta um gráfico responde?",
                        verso: "Distribuição, comparação, relação, composição e evolução.",
                    },
                    {
                        frente: "Que pergunta a dispersão responde, ponto a ponto?",
                        verso: "Se duas variáveis andam juntas, pelo formato da nuvem.",
                    },
                    {
                        frente: "Que nome as faixas do histograma recebem?",
                        verso: "Bins, cada uma virando uma barra de frequência.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três perguntas formam o roteiro de escolha?",
                        verso: "Quantas variáveis, se existe ordem natural e detalhe ou resumo.",
                    },
                    {
                        frente: "Que diferença separa histograma de gráfico de barras?",
                        verso: "O histograma divide faixa contínua; a barra compara categoria.",
                    },
                    {
                        frente: "Por que a pizza falha com muitas fatias?",
                        verso: "O olho compara ângulo e área mal, e ninguém vê a maior.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que troca o matplotlib faz ao dar controle total?",
                        verso: "Ele exige mais linhas para chegar ao mesmo gráfico.",
                    },
                    {
                        frente: "Que três recursos o plotly libera no navegador?",
                        verso: "O zoom, o valor exato no ponteiro e ligar categorias.",
                    },
                    {
                        frente: "Que relação existe entre as três bibliotecas no projeto?",
                        verso: "Elas convivem: não são concorrentes que se excluem.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Em que ano o matplotlib surgiu, e de onde vem o nome?",
                        verso: "Em 2003, inspirado no MATLAB, que batiza a biblioteca.",
                    },
                    {
                        frente: "Sobre o que a interface pyplot age a cada chamada?",
                        verso: "Sobre o gráfico atual, de forma imperativa e implícita.",
                    },
                    {
                        frente: "O que o matplotlib usa como x quando recebe uma lista só?",
                        verso: "O índice de cada valor, de zero em diante.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que confusão o nome Axes provoca em português?",
                        verso: "Ele é a área do gráfico, não o eixo x ou y sozinho.",
                    },
                    {
                        frente: "O que o plt.plot cria escondido ao ser chamado direto?",
                        verso: "Uma Figure e um Axes, sem mostrar nenhum dos dois.",
                    },
                    {
                        frente: "Que prefixo os métodos do Axes usam para título e rótulo?",
                        verso: "O set_, como no set_title e no set_xlabel.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que ordem o plot liga os pontos do gráfico?",
                        verso: "Na ordem em que eles aparecem nos dados, sem reordenar.",
                    },
                    {
                        frente: "Por que a barra deixa espaço entre as categorias?",
                        verso: "Elas são unidades distintas, sem continuidade entre si.",
                    },
                    {
                        frente: "Que passo o hist faz antes de desenhar as barras?",
                        verso: "Divide o intervalo em bins e conta o que cai em cada um.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que quatro funções deixam o gráfico legível?",
                        verso: "O title, os rótulos de eixo, a legend e o grid.",
                    },
                    {
                        frente: "Que cuidado o rótulo de eixo pede além do nome?",
                        verso: "Dizer a unidade, como vendas em reais mil.",
                    },
                    {
                        frente: "Que três parâmetros diferenciam séries num mesmo gráfico?",
                        verso: "A color, o marker e o linestyle de cada linha.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o ax vira quando o subplots cria vários painéis?",
                        verso: "Um array, acessado por índice, e não um objeto só.",
                    },
                    {
                        frente: "Como o savefig escolhe o formato do arquivo?",
                        verso: "Pela extensão do nome: png rasteriza, pdf e svg vetorizam.",
                    },
                    {
                        frente: "Por que o savefig deve vir antes do show?",
                        verso: "Depois do show a figura pode ser liberada e sair vazia.",
                    },
                ],
            },
        },
    },
};
