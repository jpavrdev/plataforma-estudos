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
    },
};
