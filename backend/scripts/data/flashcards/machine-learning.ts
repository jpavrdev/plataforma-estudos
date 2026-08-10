import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Machine Learning, sexta trilha do roadmap de Ciência de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário e a leitura do código; as cartas guardam o vocabulário fechado,
 * os nomes de método e as regras que a aula enuncia de passagem.
 */
export const machineLearning: CartasDaTrilha = {
    trilha: "Machine Learning",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Por que a lista de regras do filtro de spam não se sustenta?",
                        verso: "Quem envia adapta a mensagem e cada truque pede regra nova.",
                    },
                    {
                        frente: "Que exemplo da trilha de estatística já era aprendizado?",
                        verso: "A regressão linear, que achou os coeficientes sozinha.",
                    },
                    {
                        frente: "O que o algoritmo recebe no lugar das regras prontas?",
                        verso: "Milhares de exemplos já classificados por pessoas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que verbo resume cada um dos três tipos de aprendizado?",
                        verso: "Prever no supervisionado, agrupar no não-supervisionado, agir no reforço.",
                    },
                    {
                        frente: "Que peças o aprendizado por reforço coloca em jogo?",
                        verso: "Um agente, um ambiente e recompensas por cada decisão.",
                    },
                    {
                        frente: "Que tipo de problema o scikit-learn não atende?",
                        verso: "O aprendizado por reforço, que tem bibliotecas próprias.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que seis termos formam o vocabulário básico de ML?",
                        verso: "Feature, alvo, amostra, modelo, treino e previsão.",
                    },
                    {
                        frente: "Que estruturas do pandas o X e o y assumem?",
                        verso: "O X vira DataFrame e o y vira Series de um valor por linha.",
                    },
                    {
                        frente: "Que sinônimos o alvo recebe na documentação?",
                        verso: "Target, rótulo e variável dependente do problema.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que cadeia de etapas antecede o modelo no fluxo?",
                        verso: "Buscar com SQL, limpar com pandas, explorar e visualizar.",
                    },
                    {
                        frente: "Que foco separa a estatística do aprendizado de máquina?",
                        verso: "A estatística explica e testa; o modelo quer prever bem.",
                    },
                    {
                        frente: "O que o algoritmo faz com dado mal preparado?",
                        verso: "Aprende o problema junto, sem consertar nada sozinho.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que comparação a aula faz entre algoritmo e dado?",
                        verso: "Algoritmo simples com dado bom vence sofisticado com dado ruim.",
                    },
                    {
                        frente: "Que pergunta precede confiar numa previsão?",
                        verso: "Que dados treinaram isso e quem eles representam de fato.",
                    },
                    {
                        frente: "Por que um modelo não é neutro só por ser matemática?",
                        verso: "Ele reproduz o viés que estava nos dados de treino.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que sete etapas o pipeline de ML percorre?",
                        verso: "Definir, obter, preparar, dividir, treinar, avaliar e usar.",
                    },
                    {
                        frente: "Por que o fluxo é um mapa, e não uma esteira?",
                        verso: "Avaliar costuma mandar você voltar para limpar de novo.",
                    },
                    {
                        frente: "Que etapas do pipeline vêm antes de qualquer algoritmo?",
                        verso: "Obter e preparar os dados, o grosso do trabalho.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que faixa de teste costuma ser reservada na divisão?",
                        verso: "Algo entre vinte e trinta por cento dos dados.",
                    },
                    {
                        frente: "O que o random_state garante entre duas execuções?",
                        verso: "A mesma divisão, para comparar experimentos de forma justa.",
                    },
                    {
                        frente: "Em que momento o conjunto de teste entra em cena?",
                        verso: "Só na avaliação, intocado durante todo o treino.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três métodos todo estimador do scikit-learn expõe?",
                        verso: "O fit que aprende, o predict que aplica e o score que resume.",
                    },
                    {
                        frente: "Que métrica o score devolve em cada tipo de modelo?",
                        verso: "Acurácia na classificação e R quadrado na regressão.",
                    },
                    {
                        frente: "Que vantagem a API igual entre algoritmos traz?",
                        verso: "Trocar de algoritmo sem reescrever o resto do código.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dataset de exemplo vem junto do scikit-learn?",
                        verso: "O iris, com 150 linhas de medidas de flores.",
                    },
                    {
                        frente: "Que alinhamento X e y precisam manter entre si?",
                        verso: "A linha de X corresponde à mesma posição em y.",
                    },
                    {
                        frente: "Por que a métrica quase perfeita do iris engana?",
                        verso: "Ele é pequeno e bem separável; dado real é mais barulhento.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três conjuntos a divisão completa produz?",
                        verso: "Treino, validação e o teste guardado para o fim.",
                    },
                    {
                        frente: "Quantas vezes cada conjunto é consultado no projeto?",
                        verso: "Treino e validação, várias; o teste, uma só vez.",
                    },
                    {
                        frente: "Que técnica o módulo 5 traz para conjunto pequeno?",
                        verso: "A validação cruzada, que aproveita melhor os dados.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que teste rápido reconhece um problema de regressão?",
                        verso: "Olhar se o alvo é numérico e varia de forma contínua.",
                    },
                    {
                        frente: "Que três coisas mudam entre regressão e classificação?",
                        verso: "O algoritmo, a métrica de avaliação e a interpretação.",
                    },
                    {
                        frente: "O que o modelo faz quando não existe relação real?",
                        verso: "Ajusta a reta assim mesmo, sem nenhum erro no fit.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que leitura o intercepto tem, e quando ela não serve?",
                        verso: "É o y quando x é zero, sem sentido prático em área nula.",
                    },
                    {
                        frente: "Como se define o resíduo de cada ponto?",
                        verso: "Pelo valor real menos o previsto pela reta ali.",
                    },
                    {
                        frente: "Que distância os mínimos quadrados minimizam no gráfico?",
                        verso: "A vertical de cada ponto até a reta, elevada ao quadrado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que formato o X precisa ter, mesmo com uma variável?",
                        verso: "Bidimensional: uma matriz de amostras por variáveis.",
                    },
                    {
                        frente: "Que diferença de formato separa coef_ de intercept_?",
                        verso: "O coef_ é um array por variável; o intercept_, um número.",
                    },
                    {
                        frente: "Que cinco coisas se lê numa LinearRegression treinada?",
                        verso: "O fit, o predict, o coef_, o intercept_ e o score.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que suposição a leitura de cada coeficiente carrega?",
                        verso: "Que dá para variar uma feature segurando as outras fixas.",
                    },
                    {
                        frente: "Por que coeficiente grande não indica variável importante?",
                        verso: "As escalas diferem: um quarto não é um metro quadrado.",
                    },
                    {
                        frente: "Que preparo o módulo 6 traz para igualar as escalas?",
                        verso: "O StandardScaler, aplicado antes de treinar o modelo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que unidade o MAE e o MSE se expressam?",
                        verso: "O MAE na unidade do alvo; o MSE, nela ao quadrado.",
                    },
                    {
                        frente: "Que fração o R quadrado informa sobre o modelo?",
                        verso: "A da variação dos valores reais que ele consegue explicar.",
                    },
                    {
                        frente: "Que detalhe um R quadrado alto ainda pode esconder?",
                        verso: "Um caso isolado com erro grande dentro do conjunto.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que dois nomes a classe recebe além de categoria?",
                        verso: "Rótulo e alvo, a coluna que o modelo aprende a prever.",
                    },
                    {
                        frente: "Que quantidade de classes separa binária de multiclasse?",
                        verso: "Duas na binária; três ou mais na multiclasse.",
                    },
                    {
                        frente: "Que armadilha o desequilíbrio de classes cria?",
                        verso: "O modelo preguiçoso acerta 99% sem achar fraude nenhuma.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De onde vem o nome enganoso da regressão logística?",
                        verso: "Da função logística, a sigmoide que ela aplica no fim.",
                    },
                    {
                        frente: "Que limiar o scikit-learn aplica por padrão na decisão?",
                        verso: "O de 0,5, movível quando um erro custa mais que o outro.",
                    },
                    {
                        frente: "Que formato a fronteira da regressão logística tem?",
                        verso: "Uma reta ou plano, por ser combinação linear das features.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Onde o k-NN concentra o trabalho pesado?",
                        verso: "No predict, medindo a distância até cada exemplo guardado.",
                    },
                    {
                        frente: "Que distância o k-NN usa entre dois exemplos?",
                        verso: "A euclidiana, a mesma régua da raiz da soma dos quadrados.",
                    },
                    {
                        frente: "Por que o k-NN exige features na mesma escala?",
                        verso: "A feature de número maior domina sozinha a distância.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que critério de pureza a árvore usa por padrão?",
                        verso: "A impureza de Gini, escolhendo a divisão mais separadora.",
                    },
                    {
                        frente: "Que formato a fronteira de uma árvore desenha?",
                        verso: "Degraus: retas perpendiculares aos eixos das features.",
                    },
                    {
                        frente: "Que parâmetro contém o crescimento da árvore?",
                        verso: "O max_depth, limitando a profundidade permitida.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que métrica o score devolve num classificador?",
                        verso: "A acurácia, a fração de exemplos classificados certo.",
                    },
                    {
                        frente: "Que três formatos de fronteira o módulo compara?",
                        verso: "A reta, o contorno irregular e os degraus da árvore.",
                    },
                    {
                        frente: "Por que 0,51 e 0,98 viram a mesma classe no predict?",
                        verso: "O limiar decide sozinho e apaga a diferença de confiança.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta a acurácia nunca faz sobre o erro?",
                        verso: "Em que tipo de caso ele aconteceu: todo erro pesa igual.",
                    },
                    {
                        frente: "Em que cenário a acurácia continua sendo razoável?",
                        verso: "Com classes equilibradas, perto de metade para cada lado.",
                    },
                    {
                        frente: "Que três exemplos de desbalanceamento a aula cita?",
                        verso: "Fraude em cartão, doença rara e spam em certos contextos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que quatro grupos a matriz de confusão separa?",
                        verso: "Verdadeiro positivo e negativo, e falso positivo e negativo.",
                    },
                    {
                        frente: "Como o scikit-learn organiza a matriz de confusão?",
                        verso: "Classes reais nas linhas e previstas nas colunas, em ordem.",
                    },
                    {
                        frente: "Que exemplo inverte o custo dos dois tipos de erro?",
                        verso: "O filtro de spam, em que o falso positivo pesa mais.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que outro nome o recall carrega na literatura?",
                        verso: "Sensibilidade, a fração de positivos reais encontrada.",
                    },
                    {
                        frente: "Que trade-off precisão e recall mantêm entre si?",
                        verso: "Prever positivo com mais folga sobe um e derruba o outro.",
                    },
                    {
                        frente: "Que valores de AUC marcam sorteio e separação perfeita?",
                        verso: "Meio para a moeda jogada e um para a separação perfeita.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dupla de nomes técnicos os dois problemas recebem?",
                        verso: "Viés no underfitting e variância no overfitting.",
                    },
                    {
                        frente: "Que causa comum leva um modelo ao overfitting?",
                        verso: "Ser complexo demais para o tamanho real dos dados.",
                    },
                    {
                        frente: "Que sinal separa underfitting de overfitting nos números?",
                        verso: "O underfitting vai mal nos dois; o overfitting só no teste.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que valores de k a validação cruzada costuma usar?",
                        verso: "Cinco ou dez partes, treinando uma vez para cada uma.",
                    },
                    {
                        frente: "Que dois números a validação cruzada entrega no fim?",
                        verso: "A média dos scores e o desvio entre eles.",
                    },
                    {
                        frente: "Que custo a validação cruzada cobra do projeto?",
                        verso: "Treinar o modelo do zero em cada uma das k rodadas.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que comparação a aula faz entre algoritmo e feature?",
                        verso: "Modelo simples com feature boa vence sofisticado com ruim.",
                    },
                    {
                        frente: "Que três verbos definem feature engineering?",
                        verso: "Criar, transformar e selecionar as variáveis de entrada.",
                    },
                    {
                        frente: "Que exemplos de feature a data completa rende?",
                        verso: "O mês, o dia da semana e se aquilo caiu no fim de semana.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que medida da trilha de estatística o StandardScaler repete?",
                        verso: "O z-score: valor menos a média sobre o desvio padrão.",
                    },
                    {
                        frente: "O que muda e o que permanece ao padronizar a variável?",
                        verso: "O eixo muda; o formato da distribuição continua igual.",
                    },
                    {
                        frente: "Por que o MinMaxScaler sofre mais com outlier?",
                        verso: "Um valor extremo define o mínimo ou o máximo sozinho.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que variáveis o one-hot encoding pode explodir em colunas?",
                        verso: "As de muitos valores únicos, como CEP e id de produto.",
                    },
                    {
                        frente: "Que parâmetro evita a coluna redundante no get_dummies?",
                        verso: "O drop_first, que descarta a primeira de cada variável.",
                    },
                    {
                        frente: "Que codificação uma categoria com ordem natural pede?",
                        verso: "Um número que respeite a ordem, e não uma coluna por valor.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que troca a imputação faz ao preencher o buraco?",
                        verso: "Preserva a linha, mas troca o vazio por uma suposição.",
                    },
                    {
                        frente: "Que efeito imputar pela média tem na variável?",
                        verso: "Reduz a variância real, criando gente artificial na média.",
                    },
                    {
                        frente: "Quando remover a linha enviesa em vez de só perder dado?",
                        verso: "Quando a falta não é aleatória e tem padrão próprio.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que o vazamento de dados é um erro silencioso?",
                        verso: "O código roda sem erro e as métricas saem ótimas.",
                    },
                    {
                        frente: "Que objeto do scikit-learn encadeia preparo e modelo?",
                        verso: "O Pipeline, garantindo a ordem certa em cada etapa.",
                    },
                    {
                        frente: "Por que o Pipeline é essencial na validação cruzada?",
                        verso: "Sem ele, cada fold de teste vaza no preparo já aplicado.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que parte dos dados falta no aprendizado sem rótulo?",
                        verso: "O y: só existem as features, sem nenhuma resposta certa.",
                    },
                    {
                        frente: "Que dois assuntos o não-supervisionado cobre na trilha?",
                        verso: "O agrupamento e a redução de dimensionalidade.",
                    },
                    {
                        frente: "Que verbo troca o prever no aprendizado sem rótulo?",
                        verso: "O descobrir: achar estrutura que ninguém nomeou.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que método ajuda a escolher o valor de k?",
                        verso: "O do cotovelo, olhando a inércia de cada rodada.",
                    },
                    {
                        frente: "Que grandeza a inércia do k-means soma?",
                        verso: "As distâncias ao quadrado de cada ponto ao seu centroide.",
                    },
                    {
                        frente: "Que parâmetro protege o k-means de uma partida ruim?",
                        verso: "O n_init, que roda várias vezes e fica com o melhor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o PCA faz com as colunas originais, afinal?",
                        verso: "Cria eixos novos misturando todas, em vez de escolher.",
                    },
                    {
                        frente: "Que atributo mostra quanta variância cada componente guarda?",
                        verso: "O explained_variance_ratio_, um valor por componente.",
                    },
                    {
                        frente: "Que preço a simplificação por PCA cobra na leitura?",
                        verso: "Os componentes perdem o significado direto das colunas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três usos clássicos o não-supervisionado tem?",
                        verso: "Segmentação, detecção de anomalia e exploração de base.",
                    },
                    {
                        frente: "Que métricas internas avaliam grupos sem rótulo?",
                        verso: "A inércia e o coeficiente de silhueta dos clusters.",
                    },
                    {
                        frente: "Como o clustering aponta uma anomalia sem algoritmo novo?",
                        verso: "Pela distância grande até o centroide mais próximo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro frentes a próxima trilha aprofunda?",
                        verso: "Features, hiperparâmetros, ensembles e uma entrada em deep learning.",
                    },
                    {
                        frente: "Que técnica troca o chute no ajuste de hiperparâmetro?",
                        verso: "O GridSearch, testando combinações com validação cruzada.",
                    },
                    {
                        frente: "Que dois nomes de ensemble a aula antecipa?",
                        verso: "O random forest e o boosting, times de árvores.",
                    },
                ],
            },
        },
    },
};
