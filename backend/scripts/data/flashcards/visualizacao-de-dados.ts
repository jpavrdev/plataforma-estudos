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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que três coisas se observa em qualquer histograma?",
                        verso: "O formato, a quantidade de picos e o tamanho da cauda.",
                    },
                    {
                        frente: "O que um histograma bimodal costuma denunciar?",
                        verso: "Dois grupos misturados dentro da mesma variável.",
                    },
                    {
                        frente: "Que faixa de bins serve de ponto de partida razoável?",
                        verso: "Algo entre dez e trinta, ajustando pelo resultado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que medida o corpo da caixa representa por inteiro?",
                        verso: "O IQR, onde está metade das observações.",
                    },
                    {
                        frente: "Até onde os bigodes do boxplot se estendem?",
                        verso: "Ao valor mais extremo dentro de 1,5 vez o IQR.",
                    },
                    {
                        frente: "Que três comparações várias caixas lado a lado permitem?",
                        verso: "Mediana mais alta, grupo mais consistente e mais outliers.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três coisas se lê numa nuvem de pontos?",
                        verso: "A tendência, a força e os padrões fora da reta.",
                    },
                    {
                        frente: "Por que a dispersão vem antes do coeficiente?",
                        verso: "Ela mostra se a relação é mesmo reta e se há grupos.",
                    },
                    {
                        frente: "Que padrão fora da reta a nuvem pode revelar?",
                        verso: "Uma curva, ou duas nuvens separadas de pontos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que duas orientações de barra o matplotlib oferece?",
                        verso: "A vertical com bar e a horizontal com barh.",
                    },
                    {
                        frente: "Que pergunta separa barra agrupada de empilhada?",
                        verso: "Comparar subcategorias ou mostrar a composição do total.",
                    },
                    {
                        frente: "Em que caso raro a pizza ainda se sustenta?",
                        verso: "Com duas ou três fatias de diferença bem grande.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que dois padrões a linha entrega de leitura?",
                        verso: "A tendência de longo prazo e a sazonalidade que repete.",
                    },
                    {
                        frente: "A partir de quantas linhas o gráfico vira emaranhado?",
                        verso: "De seis ou sete em diante, com todas se cruzando.",
                    },
                    {
                        frente: "Que pergunta simples decide entre linha e barra?",
                        verso: "Se o eixo x é tempo ou se é categoria sem ordem.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que dois compromissos o seaborn assume de saída?",
                        verso: "Vir bonito por padrão e conversar direto com o pandas.",
                    },
                    {
                        frente: "Que tipo de valor os parâmetros x e y recebem?",
                        verso: "Nomes de coluna em texto, não os valores prontos.",
                    },
                    {
                        frente: "Que três coisas o hue dispensa escrever à mão?",
                        verso: "O laço, o dicionário de cores e a chamada da legenda.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que troca o kdeplot faz em relação ao histplot?",
                        verso: "Curva suave no lugar das barras, sem contagem exata.",
                    },
                    {
                        frente: "Que vantagem a curva de densidade leva sobre as barras?",
                        verso: "Ela não depende de escolher o número de bins.",
                    },
                    {
                        frente: "Que parâmetro empilha em vez de sobrepor os grupos?",
                        verso: "O multiple igual a stack, quando a sobreposição atrapalha.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que detalhe o violinplot soma ao boxplot?",
                        verso: "O formato inteiro da distribuição, espelhado dos dois lados.",
                    },
                    {
                        frente: "O que a linha vertical de cada barra do barplot indica?",
                        verso: "A incerteza em torno da média agregada do grupo.",
                    },
                    {
                        frente: "Que método do pandas o countplot desenha?",
                        verso: "O value_counts da coluna categórica escolhida.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três leituras todo heatmap de correlação permite?",
                        verso: "Diagonal sempre um, matriz simétrica e a paleta divergente.",
                    },
                    {
                        frente: "O que o pairplot desenha na diagonal da grade?",
                        verso: "A distribuição de cada variável isolada.",
                    },
                    {
                        frente: "Que limite do heatmap o pairplot cobre?",
                        verso: "Ele mostra a forma da relação, e não só o valor de r.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três famílias de paleta a aula separa?",
                        verso: "Qualitativa, sequencial e divergente, cada uma com seu uso.",
                    },
                    {
                        frente: "Que paleta o seaborn traz pensando em daltonismo?",
                        verso: "A colorblind, entre as opções prontas da biblioteca.",
                    },
                    {
                        frente: "Que objeto a maioria das funções do seaborn devolve?",
                        verso: "Um Axes do matplotlib, ajustável do jeito de sempre.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que estatístico popularizou o termo EDA?",
                        verso: "John Tukey, defendendo olhar o dado antes de concluir.",
                    },
                    {
                        frente: "Que cinco etapas o roteiro de uma EDA percorre?",
                        verso: "Estrutura, univariada, bivariada, caça a problemas e hipóteses.",
                    },
                    {
                        frente: "O que o describe entrega e o que ele não mostra?",
                        verso: "Média, desvio e quartis; nunca a forma da distribuição.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas um countplot faz procurar na coluna?",
                        verso: "Categoria dominante, categoria rara e desbalanceamento.",
                    },
                    {
                        frente: "Que erro uma barra quase invisível pode denunciar?",
                        verso: "Erro de digitação, com o mesmo nome escrito de dois jeitos.",
                    },
                    {
                        frente: "Que parâmetro ordena as barras do countplot?",
                        verso: "O order, indo da categoria mais frequente à menos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três cruzamentos a análise bivariada distingue?",
                        verso: "Numérica com numérica, numérica com categórica e o pairplot.",
                    },
                    {
                        frente: "Que quatro coisas se procura num scatter plot?",
                        verso: "Direção, força, formato e grupos ou pontos isolados.",
                    },
                    {
                        frente: "Que comando do pandas o boxplot por categoria espelha?",
                        verso: "O groupby com mediana, mas mostrando a distribuição inteira.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que parâmetro escreve o valor dentro de cada célula?",
                        verso: "O annot igual a verdadeiro, confirmando o que a cor sugere.",
                    },
                    {
                        frente: "Por que fixar vmin e vmax entre menos um e um?",
                        verso: "Para a mesma cor significar a mesma força em heatmaps diferentes.",
                    },
                    {
                        frente: "O que uma célula bem vermelha inicia, e o que não encerra?",
                        verso: "Inicia uma pergunta; não encerra nenhuma conclusão de causa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como uma EDA de ponta a ponta termina, afinal?",
                        verso: "Com uma pergunta mais precisa do que a inicial.",
                    },
                    {
                        frente: "Que dois comandos abrem a etapa de estrutura?",
                        verso: "O info e a contagem de nulos com isna somado.",
                    },
                    {
                        frente: "Que achado o exemplo trata como bom primeiro insight?",
                        verso: "Categoria mais cara com a avaliação mais baixa.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que três pilares um bom gráfico persegue ao mesmo tempo?",
                        verso: "Clareza, foco na mensagem e honestidade com o número.",
                    },
                    {
                        frente: "Que função do seaborn tira as bordas de cima e da direita?",
                        verso: "O despine, atalho para esconder aqueles dois spines.",
                    },
                    {
                        frente: "Em que década Tufte propôs essa régua de avaliação?",
                        verso: "Nos anos 1980, com a razão entre tinta e dado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta testa se o título ainda é descritivo?",
                        verso: "Que conclusão alguém leva se ler só o título.",
                    },
                    {
                        frente: "Que custo a legenda impõe a quem lê o gráfico?",
                        verso: "Obriga o olho a ir e voltar entre a cor e o nome.",
                    },
                    {
                        frente: "Que alternativa substitui a legenda com poucas séries?",
                        verso: "Rotular direto no fim de cada linha ou barra.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que exemplo mostra o eixo truncado exagerando a diferença?",
                        verso: "Aprovação de 91% e 94% num eixo que começa em 90.",
                    },
                    {
                        frente: "Quando a escala logarítmica é legítima, e quando engana?",
                        verso: "Legítima em ordens de grandeza; engana sem aviso no eixo.",
                    },
                    {
                        frente: "Que risco o eixo secundário traz ao gráfico?",
                        verso: "Comparar duas curvas como se dividissem a mesma escala.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que problema o excesso de cor cria no gráfico?",
                        verso: "O olho decifra a legenda em vez de comparar valores.",
                    },
                    {
                        frente: "A partir de quantas categorias a pizza deve virar barra?",
                        verso: "De quatro ou cinco em diante, ordenada na horizontal.",
                    },
                    {
                        frente: "Que exemplo mostra a agregação escondendo o essencial?",
                        verso: "Crescimento total de 5% com uma região caindo 20.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que prevalência o daltonismo tem entre homens e mulheres?",
                        verso: "Cerca de um em doze homens e uma em duzentas mulheres.",
                    },
                    {
                        frente: "Que parâmetro do seaborn varia formato junto com a cor?",
                        verso: "O style, usado ao lado do hue na linha e no ponto.",
                    },
                    {
                        frente: "Por que a cor não pode ser o único canal do gráfico?",
                        verso: "Ele precisa funcionar impresso em preto e branco também.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Quantas mensagens um gráfico de apresentação carrega?",
                        verso: "Uma só, escolhida antes de o gráfico ser desenhado.",
                    },
                    {
                        frente: "Como a ordem do trabalho inverte na apresentação?",
                        verso: "Você já sabe a conclusão e desenha o gráfico que a prova.",
                    },
                    {
                        frente: "Que teste rápido diz se o gráfico está pronto?",
                        verso: "O do e daí: a resposta cabe numa frase, que é o título.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três públicos a aula separa para o mesmo dado?",
                        verso: "A diretoria, o colega técnico e o público geral.",
                    },
                    {
                        frente: "Que troca de vocabulário o público geral pede?",
                        verso: "Outlier vira valor fora do padrão; mediana, valor do meio.",
                    },
                    {
                        frente: "O que simplificar para um público nunca autoriza?",
                        verso: "Distorcer o dado: o eixo e a escala seguem honestos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três posições o annotate combina numa chamada?",
                        verso: "O texto, o ponto apontado e onde o texto aparece.",
                    },
                    {
                        frente: "Quando o text basta no lugar do annotate?",
                        verso: "Quando o ponto já fala por si, como o topo de uma barra.",
                    },
                    {
                        frente: "Que padrão de cor destaca uma categoria entre muitas?",
                        verso: "Uma cor só na protagonista e cinza em todo o resto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que metáfora descreve o lugar do gráfico exploratório?",
                        verso: "A parte de baixo do iceberg, que ninguém mais vê.",
                    },
                    {
                        frente: "O que um dashboard reúne, e com que critério?",
                        verso: "Vários gráficos ligados, cada um com sua pergunta.",
                    },
                    {
                        frente: "Que ferramentas de dashboard a aula cita?",
                        verso: "Power BI, Tableau, Looker Studio, Streamlit e Dash.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três gráficos avaliam um modelo já treinado?",
                        verso: "A curva de erro, a matriz de confusão e a curva ROC.",
                    },
                    {
                        frente: "Que peças o exemplo final da trilha junta numa tela?",
                        verso: "O groupby, o histplot, o título-conclusão e a anotação.",
                    },
                    {
                        frente: "O que a próxima etapa faz com o olhar treinado aqui?",
                        verso: "Transforma a leitura do dado em previsão do que virá.",
                    },
                ],
            },
        },
    },
};
