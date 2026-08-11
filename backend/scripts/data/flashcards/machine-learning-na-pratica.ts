import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Machine Learning na Prática, sétima trilha do roadmap de
 * Ciência de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam os nomes de parâmetro, as listas fechadas e as
 * armadilhas que a aula enuncia de passagem.
 */
export const machineLearningNaPratica: CartasDaTrilha = {
    trilha: "Machine Learning na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que analogia separa o algoritmo da feature?",
                        verso: "O algoritmo é o motor; a feature é o combustível.",
                    },
                    {
                        frente: "Que troca de feature crua por derivada a aula exemplifica?",
                        verso: "Ano de construção virando idade do imóvel.",
                    },
                    {
                        frente: "Que ação além de acrescentar cabe na feature engineering?",
                        verso: "Tirar coluna: muitas vezes é o que mais ajuda.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que modelo não capta interação sem você criá-la?",
                        verso: "O linear; a árvore aproxima com splits sucessivos.",
                    },
                    {
                        frente: "Que dupla do pandas cria uma agregação por grupo?",
                        verso: "O groupby com transform, trazendo o resumo para a linha.",
                    },
                    {
                        frente: "Que transformação o binning faz numa variável?",
                        verso: "Converte a contínua em faixas categóricas de valor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que diferença separa padronizar de normalizar?",
                        verso: "A padronização não fixa limites; o MinMax prende entre 0 e 1.",
                    },
                    {
                        frente: "Que formato de distribuição a transformação log corrige?",
                        verso: "A assimétrica à direita, com cauda longa de valores altos.",
                    },
                    {
                        frente: "Que passo é obrigatório após prever numa escala log?",
                        verso: "Desfazer a transformação antes de comparar o valor.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três custos mais colunas trazem ao modelo?",
                        verso: "Mais overfitting, treino mais caro e menos interpretação.",
                    },
                    {
                        frente: "Que dois tipos de coluna se corta logo de cara?",
                        verso: "As irrelevantes e as redundantes entre si.",
                    },
                    {
                        frente: "Que limite a correlação tem como filtro de feature?",
                        verso: "Ela só enxerga relação linear com o alvo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que dois sinais clássicos denunciam vazamento?",
                        verso: "Acurácia quase perfeita e importância concentrada numa feature.",
                    },
                    {
                        frente: "Que exemplo de churn mostra feature vazada?",
                        verso: "A data de cancelamento, que só existe depois do fato.",
                    },
                    {
                        frente: "Que pergunta resolve a suspeita de vazamento?",
                        verso: "Quando essa feature fica disponível na vida real.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quem define cada um, e em que momento?",
                        verso: "O algoritmo define o parâmetro no fit; você, o hiperparâmetro antes.",
                    },
                    {
                        frente: "O que acontece com cada um ao treinar com dados novos?",
                        verso: "O parâmetro muda; o hiperparâmetro segue igual.",
                    },
                    {
                        frente: "Que três hiperparâmetros a aula cita como exemplo?",
                        verso: "O max_depth, o n_neighbors e o learning_rate.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que estrutura o param_grid usa para descrever a busca?",
                        verso: "Um dicionário de nome do hiperparâmetro para lista de valores.",
                    },
                    {
                        frente: "Que três atributos o GridSearchCV guarda após o fit?",
                        verso: "O best_params_, o best_score_ e o best_estimator_.",
                    },
                    {
                        frente: "Como o custo do GridSearchCV cresce com a grade?",
                        verso: "Multiplicando a quantidade de valores de cada lista.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que tipos de valor o param_distributions aceita?",
                        verso: "Listas ou distribuições contínuas, como randint e uniform.",
                    },
                    {
                        frente: "Por que sortear funciona tão bem quanto testar tudo?",
                        verso: "Poucos hiperparâmetros importam de verdade no resultado.",
                    },
                    {
                        frente: "Quando o GridSearchCV ainda é a escolha direta?",
                        verso: "Com dois ou três hiperparâmetros e poucos valores.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde a validação cruzada da busca roda, exatamente?",
                        verso: "Inteiramente dentro do conjunto de treino separado antes.",
                    },
                    {
                        frente: "Que papel cada fold cumpre dentro da busca?",
                        verso: "Vira teste temporário das outras rodadas, como validação.",
                    },
                    {
                        frente: "Que técnica responde à suspeita sobre o best_score_?",
                        verso: "A validação cruzada aninhada, com uma camada a mais.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que arranjo a curva de validação exige para funcionar?",
                        verso: "Fixar os outros hiperparâmetros e variar só um deles.",
                    },
                    {
                        frente: "Que dois extremos a forma da curva revela?",
                        verso: "O underfitting de um lado e o overfitting do outro.",
                    },
                    {
                        frente: "Para que a curva serve, já que não substitui a busca?",
                        verso: "Para desenhar uma grade mais inteligente e menor.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que fenômeno fora do ML explica o ganho do ensemble?",
                        verso: "A sabedoria da multidão, documentada por Francis Galton.",
                    },
                    {
                        frente: "Que duas condições a votação exige para ajudar?",
                        verso: "Cada modelo melhor que o acaso e erros pouco correlacionados.",
                    },
                    {
                        frente: "Por que cinquenta cópias idênticas não formam ensemble?",
                        verso: "Elas preveem sempre a mesma coisa, sem diversidade.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que combinação de viés e variância a árvore livre tem?",
                        verso: "Viés baixo e variância alta, ajustando-se a qualquer forma.",
                    },
                    {
                        frente: "Que preço podar a árvore cobra em troca da estabilidade?",
                        verso: "Mais viés: ela passa a errar até padrão real e simples.",
                    },
                    {
                        frente: "Que virada o módulo faz com a instabilidade da árvore?",
                        verso: "Aceita e usa a favor, treinando várias e agregando.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que duas palavras o nome bagging abrevia?",
                        verso: "Bootstrap aggregating: a amostragem e a agregação.",
                    },
                    {
                        frente: "Que nome os exemplos deixados de fora recebem?",
                        verso: "Out-of-bag, cerca de 37%, úteis como validação grátis.",
                    },
                    {
                        frente: "Como o bagging agrega em cada tipo de problema?",
                        verso: "Voto da maioria na classificação e média na regressão.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quem propôs a random forest sobre o bagging?",
                        verso: "Breiman, somando o sorteio de features a cada divisão.",
                    },
                    {
                        frente: "Que problema o sorteio de features resolve nas árvores?",
                        verso: "Uma feature forte dominaria a raiz de todas elas.",
                    },
                    {
                        frente: "Que duas classes o scikit-learn oferece para a floresta?",
                        verso: "O RandomForestClassifier e o RandomForestRegressor.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que cinco hiperparâmetros concentram o efeito na floresta?",
                        verso: "n_estimators, max_depth, max_features e os dois mínimos.",
                    },
                    {
                        frente: "Que argumento paraleliza o treino entre os núcleos?",
                        verso: "O n_jobs igual a menos um, usando a CPU inteira.",
                    },
                    {
                        frente: "Que limitação a floresta tem em problema de regressão?",
                        verso: "Ela não extrapola além da faixa vista no treino.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Com que modelo o boosting costuma começar a sequência?",
                        verso: "Um toco: árvore de profundidade um, fraca sozinha.",
                    },
                    {
                        frente: "Que erro cada família de ensemble ataca primeiro?",
                        verso: "O bagging reduz variância; o boosting reduz viés.",
                    },
                    {
                        frente: "Por que o boosting treina mais devagar que a floresta?",
                        verso: "A sequência não paraleliza: cada modelo espera o anterior.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que abordagem o AdaBoost usa, diferente do gradiente?",
                        verso: "Repesar as amostras erradas em vez de prever o resíduo.",
                    },
                    {
                        frente: "O que a segunda árvore do gradient boosting prevê?",
                        verso: "O resíduo deixado pela previsão anterior, não o alvo.",
                    },
                    {
                        frente: "Que previsão inicial simples abre a sequência?",
                        verso: "Algo básico, como a média do alvo no treino.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que vantagem o XGBoost traz embutida desde 2014?",
                        verso: "Regularização forte, muito testada e documentada.",
                    },
                    {
                        frente: "Que comparação a aula faz com redes neurais profundas?",
                        verso: "Em dado tabular, o boosting ajustado costuma vencer.",
                    },
                    {
                        frente: "Que critério decide entre as três bibliotecas?",
                        verso: "Testar mais de uma: não existe a certa de antemão.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que o boosting costuma vencer na métrica final?",
                        verso: "Ele ataca o viés direto, corrigindo erro atrás de erro.",
                    },
                    {
                        frente: "Que prática combina as duas famílias num projeto?",
                        verso: "Treinar a floresta como piso e só então tentar boosting.",
                    },
                    {
                        frente: "Que perfil de problema pede a tolerância da floresta?",
                        verso: "O que precisa de resultado sólido rápido, com pouco ajuste.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que profundidade as árvores do boosting costumam ter?",
                        verso: "Rasas, entre dois e cinco, aprendendo um pedaço do erro.",
                    },
                    {
                        frente: "Que combinação de ajuste a aula considera mais segura?",
                        verso: "Learning_rate baixo com muitas árvores no conjunto.",
                    },
                    {
                        frente: "Que risco um learning_rate alto traz ao modelo?",
                        verso: "Passar do ponto ótimo e decorar o conjunto de treino.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que interface o Pipeline expõe, apesar de várias etapas?",
                        verso: "A mesma do estimador: fit, predict e score.",
                    },
                    {
                        frente: "Que risco o Pipeline elimina no preparo manual?",
                        verso: "Esquecer a ordem ou reajustar um transformador sem querer.",
                    },
                    {
                        frente: "O que o Pipeline empacota num objeto só?",
                        verso: "A sequência inteira de preparo mais o modelo final.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que trinca cada entrada do ColumnTransformer declara?",
                        verso: "Um nome, um transformador e a lista de colunas dele.",
                    },
                    {
                        frente: "O que cada transformador enxerga do DataFrame?",
                        verso: "Só as colunas atribuídas a ele, nunca as das outras trincas.",
                    },
                    {
                        frente: "Que estrutura cabe no lugar de um transformador único?",
                        verso: "Um Pipeline inteiro, com imputação e escala na sequência.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que separador liga a etapa ao hiperparâmetro no grid?",
                        verso: "Dois underscores entre o nome da etapa e o parâmetro.",
                    },
                    {
                        frente: "O que a busca faz com o pipeline a cada fold?",
                        verso: "Clona do zero e ajusta só com o treino daquele fold.",
                    },
                    {
                        frente: "Que alternativa arriscada o pipeline na busca evita?",
                        verso: "Transformar o dataset inteiro antes de entregar à busca.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que fontes de aleatoriedade um projeto de ML esconde?",
                        verso: "A divisão dos dados e o sorteio interno de cada modelo.",
                    },
                    {
                        frente: "Que impossibilidade a falta de reprodutibilidade cria?",
                        verso: "Comparar dois modelos de forma justa e depurar o erro.",
                    },
                    {
                        frente: "Que ferramenta automatiza o registro de cada execução?",
                        verso: "O MLflow, guardando hiperparâmetros e métricas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que tipo de objeto o joblib é especializado em salvar?",
                        verso: "Os que carregam muitos arrays do NumPy por dentro.",
                    },
                    {
                        frente: "Que perguntas um arquivo salvo sozinho não responde?",
                        verso: "De onde veio o dado e qual código gerou aquele modelo.",
                    },
                    {
                        frente: "Que separação a organização de pastas exige do projeto?",
                        verso: "Dado bruto intocado, preparo isolado do treino e modelos à parte.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que cinco táticas atacam o desbalanceamento?",
                        verso: "Pesar classes, undersampling, oversampling, SMOTE e trocar a métrica.",
                    },
                    {
                        frente: "O que o SMOTE faz de diferente do oversampling simples?",
                        verso: "Cria exemplos sintéticos interpolando entre vizinhos.",
                    },
                    {
                        frente: "Em que momento a reamostragem pode acontecer?",
                        verso: "Só depois do split, e apenas no conjunto de treino.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que diferença separa ruído de viés nos dados?",
                        verso: "O ruído é aleatório; o viés é sistemático e não some.",
                    },
                    {
                        frente: "Por que ruído no rótulo é pior que ruído na feature?",
                        verso: "Ele contamina direto o que o modelo tenta imitar.",
                    },
                    {
                        frente: "Que checagem manual revela um rótulo errado?",
                        verso: "Amostrar os exemplos que o modelo erra com confiança.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três sinais denunciam overfitting na prática?",
                        verso: "Gap crescente, ótimo só no CV e ensemble complexo demais.",
                    },
                    {
                        frente: "Que remédio o boosting oferece contra árvores demais?",
                        verso: "O early stopping, parando quando a validação estaciona.",
                    },
                    {
                        frente: "Que dois ajustes regularizam um modelo linear?",
                        verso: "Diminuir o C na logística ou subir o alpha no Ridge.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três limitações o feature_importances_ carrega?",
                        verso: "Infla muitos valores únicos, mede no treino e confunde correlatas.",
                    },
                    {
                        frente: "Que pergunta o SHAP e o LIME respondem, diferente?",
                        verso: "Por que este exemplo específico recebeu essa previsão.",
                    },
                    {
                        frente: "De onde vem o nome SHAP, e a que teoria ele remete?",
                        verso: "Dos valores de Shapley, da teoria dos jogos.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Contra o que o modelo deve ser comparado, além do dummy?",
                        verso: "Contra a melhor regra de negócio que alguém já escreveu.",
                    },
                    {
                        frente: "Que resposta madura cabe quando o erro custa caro demais?",
                        verso: "Não deixar o modelo decidir sozinho, com revisão humana.",
                    },
                    {
                        frente: "Que problema um dataset pequeno demais produz?",
                        verso: "Um modelo instável, que muda a previsão a cada divisão.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que três tipos de camada uma rede organiza?",
                        verso: "A de entrada, as ocultas e a de saída da previsão.",
                    },
                    {
                        frente: "A que a palavra profundo se refere em deep learning?",
                        verso: "À quantidade de camadas ocultas empilhadas na rede.",
                    },
                    {
                        frente: "O que é parâmetro e o que é hiperparâmetro na rede?",
                        verso: "Os pesos são aprendidos; camadas e ativação, escolhidas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome a passagem dos dados até a previsão recebe?",
                        verso: "Forward pass, com os pesos ainda aleatórios no início.",
                    },
                    {
                        frente: "Que nome uma rodada completa sobre o treino recebe?",
                        verso: "Época, dividida em lotes menores para caber na memória.",
                    },
                    {
                        frente: "Que hiperparâmetro do boosting reaparece na rede?",
                        verso: "A taxa de aprendizado, o tamanho de cada passo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro tipos de dado não estruturado a aula cita?",
                        verso: "Imagem, texto, áudio e voz, com muito volume.",
                    },
                    {
                        frente: "Que dois custos o deep learning cobra do projeto?",
                        verso: "Muito dado e máquina, sem nenhum dos dois ele não paga.",
                    },
                    {
                        frente: "Que vantagem o ML clássico mantém ao explicar decisão?",
                        verso: "Importância de feature e SHAP funcionam melhor em árvore.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde cada uma das duas grandes bibliotecas nasceu?",
                        verso: "O TensorFlow no Google e o PyTorch na atual Meta.",
                    },
                    {
                        frente: "Que perfil de uso cada uma das duas atrai?",
                        verso: "O TensorFlow em produção e o PyTorch em pesquisa.",
                    },
                    {
                        frente: "Que custo a rede cobra em decisões de configuração?",
                        verso: "Mais hiperparâmetros que uma floresta para escolher.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro frentes o próximo estágio do roadmap cobre?",
                        verso: "Produção, servir previsões, MLOps e monitorar com ética.",
                    },
                    {
                        frente: "Que honestidade a trilha repete em quase todo módulo?",
                        verso: "Complexidade não é sinônimo de qualidade no modelo.",
                    },
                    {
                        frente: "Que arco a trilha percorre, do começo ao fim?",
                        verso: "Do modelo que roda no notebook ao modelo em que se confia.",
                    },
                ],
            },
        },
    },
};
