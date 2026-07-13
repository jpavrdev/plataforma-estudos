// Seed da trilha Machine Learning (avancado), estagio 7 do roadmap de Ciencia de Dados.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-machine-learning.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Machine Learning";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "O coração da ciência de dados: o que é machine learning, o fluxo de um projeto (treino, teste, avaliação), regressão e classificação com scikit-learn, como avaliar modelos de verdade e fugir do overfitting, preparar dados e uma introdução ao aprendizado não-supervisionado. Onde os dados viram previsão.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS: Modulo[] = [
    {
        "titulo": "Módulo 1 - O que é machine learning",
        "aulas": [
            {
                "titulo": "Aprender dos dados x programar regras",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é machine learning\n\nVocê já passou por Python, Estatística, pandas, SQL e Visualização. Em algum momento entre um `GROUP BY` e uma regressão linear, talvez tenha se perguntado: onde entra, de fato, o \"aprendizado de máquina\" do nome? A resposta começa com uma mudança de mentalidade bem simples: em vez de escrever regra por regra o que o programa deve fazer, você dá exemplos pro programa e deixa que ele descubra o padrão sozinho.\n\nEsse é o coração de machine learning (ML): **aprender padrões a partir de dados, em vez de programar as regras na mão**. Parece sutil, mas muda completamente como se resolve um problema."
                    },
                    {
                        "type": "text",
                        "value": "## O exemplo clássico: filtrar spam\n\nImagine que você precisa construir um filtro de spam. A abordagem tradicional (programar regras na mão) seria assim: se o e-mail contém \"clique aqui\", é spam; se contém \"ganhe dinheiro\", é spam; se o remetente não está nos contatos e tem mais de três links, é spam. Você, como programador, senta e escreve cada critério, um por um.\n\nO problema aparece rápido. Quem manda spam também percebe o padrão e adapta a mensagem: troca \"ganhe dinheiro\" por \"gnhe dinheir0\", usa imagens em vez de texto, varia o remetente. Cada truque novo exige uma regra nova. A lista de exceções cresce mais rápido do que sua capacidade de mantê-la, e ainda assim e-mails legítimos continuam sendo bloqueados por engano."
                    },
                    {
                        "type": "code",
                        "value": "def eh_spam_regra(texto):\n    palavras_suspeitas = [\"clique aqui\", \"ganhe dinheiro\", \"promoção imperdível\"]\n    texto = texto.lower()\n    return any(p in texto for p in palavras_suspeitas)\n\nprint(eh_spam_regra(\"Ganhe dinheiro fácil sem sair de casa\"))\n# True: pegou a regra certinho\n\nprint(eh_spam_regra(\"Gnhe dinheir0 fácil sem sair de casa\"))\n# False: um pequeno truque de digitação já escapa da regra\n\nprint(eh_spam_regra(\"Pauta da reunião de amanhã: clique aqui para confirmar presença\"))\n# True: e-mail legítimo do trabalho, bloqueado por engano (falso positivo)"
                    },
                    {
                        "type": "text",
                        "value": "## A alternativa: aprender com exemplos\n\nA abordagem de machine learning inverte o processo. Em vez de escrever as regras, você reúne milhares de e-mails já classificados por humanos como spam ou não spam e entrega esses exemplos para um algoritmo. O algoritmo não recebe nenhuma regra pronta: ele analisa os exemplos, encontra os padrões que separam um grupo do outro (frequência de certas palavras, características do remetente, estrutura do texto) e constrói, sozinho, um critério de decisão.\n\nNa prática, isso não é tão diferente do que você já fez na trilha de Estatística. Quando ajustou uma regressão linear, você não escreveu \"se x for tal coisa, y é tal outra\": deixou que o próprio cálculo encontrasse os coeficientes da reta que melhor se ajustava aos dados. Aquilo já era, no fundo, uma forma simples de aprendizado a partir de dados. Machine learning generaliza essa ideia para problemas bem mais variados que uma reta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Regras programadas na mão\", \"Aprendizado de máquina\"], [\"Quem define o comportamento\", \"A pessoa que programa, regra por regra\", \"O modelo, a partir de exemplos rotulados\"], [\"Lida bem com exceções e variações?\", \"Mal: cada exceção vira uma nova regra\", \"Bem: aprende um padrão geral dos dados\"], [\"O que fazer quando o cenário muda\", \"Reescrever as regras manualmente\", \"Retreinar o modelo com dados novos\"], [\"O que a solução exige\", \"Conhecimento explícito do domínio\", \"Dados de qualidade e em quantidade\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa\n\nEntender essa diferença é o primeiro passo da trilha inteira. Todo algoritmo de machine learning que você vai ver daqui pra frente (regressão, árvore de decisão, k-means) segue essa mesma lógica básica: aprender um padrão a partir de exemplos, e não seguir instruções escritas à mão. Nas próximas aulas você vai ver os diferentes jeitos de aprender (com ou sem rótulos), o vocabulário que aparece em todo lugar no scikit-learn, e onde exatamente esse aprendizado se encaixa no fluxo de um projeto de dados."
                    },
                    {
                        "type": "quote",
                        "value": "Machine learning não é sobre escrever o comportamento certo: é sobre dar exemplos bons o suficiente para que o padrão certo seja aprendido."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza a abordagem de aprendizado de máquina em comparação com a programação tradicional baseada em regras?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O modelo aprende padrões a partir de exemplos de dados, em vez de seguir regras escritas à mão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O programador escreve regras cada vez mais detalhadas até cobrir todos os casos imagináveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sistema segue uma sequência de passos fixos, definida antes de qualquer contato com dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comportamento do programa é fixado no código e nunca muda depois de publicado em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No filtro de spam construído só com regras de palavras proibidas, por que ele erra tanto em deixar passar spam disfarçado quanto em bloquear e-mails legítimos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque as regras comparam o texto de forma literal e não entendem contexto ou variações reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o servidor de e-mail limita quantas regras podem valer para cada mensagem recebida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o modelo de linguagem das regras não foi treinado com exemplos suficientes de spam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as regras são avaliadas em ordem aleatória, o que muda o resultado a cada execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A trilha de Estatística mostrou a regressão linear ajustando uma reta que minimiza o erro sobre os dados. Por que esse processo já pode ser entendido como uma forma simples de aprendizado de máquina?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque os coeficientes da reta são ajustados a partir dos dados, sem regras fixas escolhidas manualmente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a regressão linear usa o mesmo algoritmo interno das redes neurais profundas mais avançadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda reta ajustada por regressão vira automaticamente um modelo de classificação de categorias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o cálculo do erro da reta exige rótulos de teste que só existem em deep learning.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa decidir entre um sistema de regras e um modelo de machine learning para aprovar ou reprovar transações financeiras. Em qual cenário as regras programadas na mão ainda são a escolha mais sensata?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Quando há poucas exceções conhecidas e o critério de decisão é simples e precisa ser auditável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando há milhões de exemplos rotulados disponíveis e os padrões de fraude mudam com frequência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o volume de transações é tão grande que nenhuma pessoa consegue revisar as regras manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando os padrões de comportamento fraudulento variam de cliente para cliente de forma imprevisível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um programa guarda numa tabela todos os e-mails já vistos e a classificação (spam ou não) de cada um. Para um e-mail novo, que nunca apareceu na tabela, ele não sabe o que responder. Por que isso NÃO é considerado aprendizado de máquina?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o programa memorizou casos específicos, sem extrair um padrão capaz de lidar com exemplos novos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque tabelas de consulta são proibidas por definição em qualquer sistema com dados rotulados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque aprendizado de máquina exige o uso obrigatório de redes neurais para qualquer problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o programa usa muito pouca memória do computador para armazenar as informações necessárias.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Supervisionado, não-supervisionado e reforço",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Nem todo aprendizado é igual\n\nA aula passada mostrou a ideia central: aprender padrões a partir de exemplos. Mas \"exemplos\" pode significar coisas bem diferentes dependendo do problema. Às vezes você sabe exatamente a resposta certa de cada exemplo (esse e-mail é spam, aquele não é). Às vezes você só tem os dados, sem nenhuma resposta anotada, e quer descobrir uma estrutura escondida neles. E às vezes não existem exemplos prontos: existe um agente que aprende agindo, por tentativa e erro.\n\nEssas três situações correspondem aos três grandes tipos de aprendizado de máquina: supervisionado, não-supervisionado e por reforço."
                    },
                    {
                        "type": "text",
                        "value": "## Aprendizado supervisionado: aprender a prever\n\nNo aprendizado supervisionado, cada exemplo do conjunto de dados vem com uma resposta certa conhecida, chamada de rótulo (ou alvo, ou target). O modelo aprende a relação entre as características de entrada e esse rótulo, para depois prever o rótulo de exemplos novos, que ele nunca viu.\n\nÉ o caso do filtro de spam da aula passada (cada e-mail rotulado como spam ou não spam) e também da regressão linear da trilha de Estatística (cada imóvel com seu preço de venda já conhecido). Sempre que o objetivo é **prever** algo que já foi observado no passado para casos parecidos, o problema é supervisionado."
                    },
                    {
                        "type": "text",
                        "value": "## Aprendizado não-supervisionado: aprender a descrever\n\nNo aprendizado não-supervisionado não existe rótulo nenhum. Você tem só os dados, sem saber de antemão a resposta certa, e o objetivo passa a ser descobrir uma estrutura que já existe ali, mas está escondida: grupos de exemplos parecidos entre si, ou uma forma mais simples de representar os mesmos dados.\n\nO exemplo mais comum é agrupar clientes por perfil de compra sem saber previamente quais perfis existem (isso se chama clustering, e você vai ver o algoritmo k-means no Módulo 7). Aqui o verbo não é \"prever\": é **agrupar** ou **descobrir**."
                    },
                    {
                        "type": "text",
                        "value": "## Aprendizado por reforço: aprender agindo\n\nO terceiro tipo funciona de um jeito diferente dos outros dois: não existe uma base de dados pronta com exemplos rotulados de antemão. Em vez disso, existe um agente que interage com um ambiente, toma decisões e recebe recompensas ou punições de acordo com o resultado delas. Aos poucos, por tentativa e erro, o agente aprende a agir de um jeito que maximiza a recompensa recebida.\n\nÉ assim que agentes aprendem a jogar jogos complexos (como xadrez ou Go) ou a controlar um robô. O scikit-learn, ferramenta principal desta trilha, não é feito para esse tipo de problema (existem bibliotecas próprias para isso). Por enquanto, vale conhecer o nome e a ideia: aprender é possível mesmo sem nenhum exemplo pronto de resposta certa."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\n# Dados de clientes de um e-commerce\nclientes = pd.DataFrame({\n    \"idade\": [25, 41, 33, 52, 29],\n    \"gasto_mensal\": [120, 340, 210, 480, 90],\n    \"comprou_categoria_x\": [0, 1, 1, 1, 0]  # rótulo: 1 = comprou, 0 = não comprou\n})\n\nprint(clientes)\n#    idade  gasto_mensal  comprou_categoria_x\n# 0     25           120                     0\n# 1     41           340                     1\n# 2     33           210                     1\n# 3     52           480                     1\n# 4     29            90                     0\n\n# Com a coluna \"comprou_categoria_x\" como alvo, isso é supervisionado:\n# o modelo aprenderia a prever esse rótulo para clientes novos.\n# Sem essa coluna, os mesmos dados serviriam para não-supervisionado:\n# por exemplo, agrupar clientes parecidos sem saber os grupos de antemão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de aprendizado\", \"Tem rótulos?\", \"O que o modelo faz\", \"Exemplo\"], [\"Supervisionado\", \"Sim\", \"Aprende a prever o rótulo de exemplos novos\", \"Prever se um e-mail é spam\"], [\"Não-supervisionado\", \"Não\", \"Descobre estrutura ou agrupamentos nos dados\", \"Agrupar clientes por perfil de compra\"], [\"Por reforço\", \"Não, usa recompensas\", \"Aprende por tentativa e erro, maximizando recompensa\", \"Agente que aprende a jogar um jogo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de treinar qualquer modelo, a primeira pergunta é sempre a mesma: existe um rótulo para aprender a prever, ou o objetivo é descobrir uma estrutura que ainda não conhecemos?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica define o aprendizado supervisionado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os dados de treino vêm acompanhados de um rótulo conhecido, que o modelo aprende a prever.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dados de treino não têm nenhuma informação além dos valores das próprias features.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo interage com um ambiente e recebe recompensas a cada decisão tomada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo agrupa os exemplos em categorias que ele mesmo descobre durante o treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de marketing tem uma base com histórico de compras de clientes, mas nenhuma informação sobre a qual \"perfil\" cada cliente pertence. Eles querem descobrir grupos naturais de clientes parecidos. Que tipo de aprendizado se encaixa nesse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não supervisionado, porque não há rótulo prévio e o objetivo é descobrir estrutura nos dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Supervisionado, porque o histórico de compras já funciona como rótulo direto de cada cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por reforço, porque a equipe vai testar recompensas para cada grupo de clientes formado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Supervisionado, porque o objetivo final é prever exatamente o comportamento futuro de cada cliente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um agente de software aprende a jogar um jogo eletrônico disputando milhares de partidas, ganhando pontos quando vence uma fase e perdendo pontos quando é derrotado, sem que ninguém diga a jogada certa em cada momento. Que tipo de aprendizado descreve melhor esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Por reforço, porque o agente aprende por tentativa e erro a partir de recompensas e punições.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aprendizado supervisionado, porque cada partida jogada funciona como um exemplo rotulado de jogada certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aprendizado não supervisionado, porque o jogo não fornece nenhum tipo de retorno para o agente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aprendizado supervisionado, porque a pontuação de cada fase é usada diretamente como rótulo de treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma imobiliária tem uma planilha com características de imóveis já vendidos (área, bairro, número de quartos) e o preço final de venda de cada um. Ela quer estimar o preço de um imóvel novo, ainda não vendido. Isso é um problema de que tipo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Supervisionado, porque o preço de venda de imóveis anteriores funciona como o rótulo a ser aprendido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não supervisionado, porque características como área e bairro não têm relação direta com o preço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por reforço, porque o preço final só é conhecido depois de uma sequência de negociações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não supervisionado, porque o objetivo é agrupar imóveis parecidos em faixas de preço.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das situações abaixo é um exemplo de aprendizado supervisionado, e não de aprendizado não supervisionado, apesar de também envolver \"encontrar padrões\" nos dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Prever, com base em exames já diagnosticados, se um novo paciente tem ou não uma doença específica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Agrupar produtos de um catálogo em categorias parecidas sem nenhuma informação sobre a categoria real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de variáveis de um conjunto de dados para visualizar os clientes em duas dimensões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar textos de notícias em grupos temáticos parecidos sem qualquer rótulo de assunto informado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O vocabulário: features, alvo, modelo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Falando a mesma língua\n\nA partir daqui, alguns termos vão aparecer o tempo todo: na documentação do scikit-learn, em mensagens de erro, em artigos e em conversas com outras pessoas da área. Vale a pena parar uma aula inteira só para fixar esse vocabulário, porque confundir esses termos é uma das maiores fontes de confusão de quem está começando em machine learning.\n\nA boa notícia é que você já conhece a peça principal: o DataFrame do pandas. Quase todo o vocabulário de ML mapeia direto para conceitos que você já usa."
                    },
                    {
                        "type": "text",
                        "value": "## As peças do quebra-cabeça\n\n**Feature** (ou atributo, ou variável): cada característica usada como entrada do modelo. Numa tabela de imóveis, são colunas como área, número de quartos e distância do centro.\n\n**Alvo** (ou target, ou rótulo): o que o modelo tenta prever. No mesmo exemplo, seria o preço de venda.\n\n**Amostra** (ou exemplo, ou observação): cada caso individual do conjunto de dados. Em termos de DataFrame, cada linha é uma amostra: um imóvel específico, um cliente específico, um e-mail específico.\n\n**Modelo**: a estrutura matemática (no scikit-learn, o objeto estimador) que aprende o padrão a partir dos dados e depois faz previsões.\n\n**Treino**: o processo de ajustar o modelo usando os dados disponíveis, chamando o método `.fit()`.\n\n**Previsão**: o valor que o modelo retorna para um exemplo novo, chamando o método `.predict()`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\", \"Sinônimos comuns\", \"O que significa\", \"Exemplo (dataset de imóveis)\"], [\"Feature\", \"Atributo, variável, coluna de entrada\", \"Cada característica usada para prever\", \"area_m2, quartos, distancia_centro_km\"], [\"Alvo\", \"Target, rótulo, variável dependente\", \"O que o modelo tenta prever\", \"preco_mil\"], [\"Amostra\", \"Exemplo, observação, instância, linha\", \"Cada caso individual do dataset\", \"Um imóvel específico (uma linha)\"], [\"Modelo\", \"Estimador, no vocabulário do scikit-learn\", \"A estrutura que aprende o padrão e prevê\", \"Um objeto LinearRegression já treinado\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nimoveis = pd.DataFrame({\n    \"area_m2\": [55, 78, 120, 42, 95],\n    \"quartos\": [2, 3, 4, 1, 3],\n    \"distancia_centro_km\": [8.2, 3.5, 12.0, 1.1, 6.4],\n    \"preco_mil\": [210, 340, 480, 190, 350]\n})\n\n# X: as features, tudo que o modelo usa para prever, menos o alvo\nX = imoveis.drop(columns=\"preco_mil\")\n\n# y: o alvo, a coluna que queremos prever\ny = imoveis[\"preco_mil\"]\n\nprint(X.shape)\n# (5, 3) -> 5 amostras, 3 features\n\nprint(y.shape)\n# (5,) -> 5 valores de alvo, um por amostra"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"X (features)\", \"y (alvo)\"], [\"Formato\", \"Tabela: linhas (amostras) por colunas (features)\", \"Lista: um valor por amostra\"], [\"Contém\", \"As variáveis usadas para prever\", \"O que o modelo deve aprender a prever\"], [\"No pandas\", \"DataFrame\", \"Series\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que decorar isso vale a pena\n\nEsses seis termos (feature, alvo, amostra, modelo, treino, previsão) e a notação X/y vão aparecer em praticamente todo código de scikit-learn que você escrever daqui pra frente. Quando uma mensagem de erro falar em \"shape de X incompatível com y\", ou a documentação disser \"o estimador precisa ser ajustado (fit) antes de prever (predict)\", você já vai saber exatamente do que se trata."
                    },
                    {
                        "type": "quote",
                        "value": "Feature é o que você sabe sobre cada exemplo. Alvo é o que você quer descobrir. Todo problema de machine learning supervisionado nasce dessa divisão."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma \"feature\" em um problema de machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma característica ou variável usada como entrada para o modelo fazer a previsão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor final que o modelo tenta prever para cada amostra do conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O algoritmo específico escolhido para treinar o modelo, como regressão ou árvore.",
                                "isCorrect": false
                            },
                            {
                                "text": "A métrica usada para avaliar se o modelo acertou ou errou uma previsão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um dataset de clientes de banco com as colunas idade, renda_mensal, tempo_de_conta e inadimplente (0 ou 1, indicando se deixou de pagar), qual conjunto de colunas forma corretamente o X (features) se o objetivo é prever inadimplência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "idade, renda_mensal e tempo_de_conta, deixando inadimplente de fora por ser o alvo a prever.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas a coluna inadimplente, porque é ela que representa todas as features do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "idade, renda_mensal, tempo_de_conta e inadimplente juntas, já que todas as colunas viram features.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas idade e renda_mensal, porque tempo_de_conta não pode ser usado como entrada do modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num DataFrame de exames laboratoriais em que cada linha representa um paciente e cada coluna representa um exame diferente, o que corresponde a uma \"amostra\" (ou exemplo, ou observação) nesse conjunto de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma linha inteira, com todos os resultados de exames de um único paciente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma coluna inteira, com o resultado de um exame específico para todos os pacientes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de cada exame, usado como cabeçalho das colunas do DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor médio de todos os exames de todos os pacientes juntos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que um modelo já foi treinado, ele é usado para prever o preço de imóveis novos, que ainda não foram vendidos. Nesse momento de previsão sobre dados novos, o que se pode afirmar sobre X e y?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Existe X, com as features dos imóveis novos, mas ainda não existe um y real para comparar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Existem X e y completos, porque todo imóvel já tem preço de mercado conhecido de antemão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe X nem y, porque o modelo já aprendeu tudo durante a fase de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Existe apenas y, já que o modelo agora só precisa gerar o preço final do imóvel.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de chamar `.fit(X, y)`, um objeto `LinearRegression()` recém-criado no scikit-learn já pode ser chamado de \"modelo treinado\", pronto para prever valores confiáveis?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, porque antes do fit ele só define o algoritmo escolhido, sem ter aprendido nada ainda.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque todo objeto do scikit-learn já nasce com os coeficientes calculados por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o método predict funciona normalmente mesmo sem nunca ter passado por fit.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o scikit-learn exige rótulos de teste antes mesmo de o objeto ser criado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Onde ML entra no fluxo de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O fluxo que você já percorreu\n\nOlhando para trás, dá pra ver um fluxo se formando ao longo da trilha de Ciência de Dados: primeiro você aprendeu a buscar dados com SQL, depois a limpar e organizar esses dados com pandas, depois a entender suas variáveis com estatística descritiva e correlação, e por fim a enxergar padrões visualmente com gráficos. Cada etapa depende da anterior: não dá para explorar dados que ainda não foram limpos, nem limpar dados que ainda não foram coletados.\n\nMachine learning entra como a etapa seguinte dessa cadeia: depois que os dados já foram coletados, limpos e explorados, o modelo é o que transforma esses dados prontos em previsão."
                    },
                    {
                        "type": "text",
                        "value": "## ML depende de tudo que veio antes\n\nUm erro comum de quem está começando é achar que o algoritmo de machine learning \"resolve\" problemas de qualidade dos dados sozinho. Não resolve. Se a base tem valores faltantes mal tratados, outliers não investigados ou colunas com significado confuso, o modelo aprende exatamente esses problemas junto com o padrão real, porque para o algoritmo não existe diferença entre \"dado real\" e \"dado com erro\": existe só o dado que foi entregue a ele.\n\nPor isso, boa parte do trabalho de um projeto de machine learning nem é sobre o modelo em si: é sobre garantir que os dados que chegam até ele fazem sentido. Você já treinou esse olhar nas trilhas anteriores."
                    },
                    {
                        "type": "text",
                        "value": "## Machine learning, estatística e inteligência artificial\n\nOs três termos se confundem bastante, e vale desfazer a confusão. Inteligência artificial (IA) é o campo mais amplo: qualquer técnica que faça um sistema se comportar de forma inteligente, incluindo regras escritas à mão, algoritmos de busca e também machine learning. Machine learning é uma parte da IA: a parte específica que aprende com dados em vez de seguir instruções fixas.\n\nEstatística, por sua vez, tem uma relação de parentesco muito próxima com machine learning (a regressão linear, por exemplo, é estudada nas duas áreas). A diferença costuma estar no foco: a estatística tradicionalmente se preocupa em explicar e testar relações com rigor (essa correlação é real ou é coincidência da amostra?), enquanto machine learning se preocupa mais em prever bem casos novos, mesmo que o modelo por dentro seja menos fácil de interpretar. Não é uma fronteira rígida: é uma questão de ênfase. E deep learning, que você vai ouvir falar bastante, é uma subárea de machine learning baseada em redes neurais com muitas camadas: o próximo nível depois do que esta trilha cobre."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Área\", \"Foco principal\", \"Exemplo de técnica\"], [\"Inteligência artificial\", \"Fazer sistemas agirem de forma inteligente, por qualquer meio\", \"Regras, busca, machine learning, robótica\"], [\"Machine learning\", \"Aprender padrões dos dados para prever ou agrupar\", \"Regressão, árvore de decisão, k-means\"], [\"Estatística\", \"Entender e testar relações nos dados com rigor\", \"Teste de hipótese, intervalo de confiança, regressão\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\n# Etapas 1 e 2 do fluxo, já conhecidas: os dados chegaram (SQL) e foram limpos (pandas)\nvendas = pd.DataFrame({\n    \"preco\": [29.9, 49.9, 15.0, 89.9, 120.0],\n    \"desconto_pct\": [10, 0, 20, 5, 0],\n    \"categoria\": [\"A\", \"B\", \"A\", \"C\", \"B\"],\n    \"vendido_em_1_dia\": [1, 0, 1, 0, 1]\n})\n\n# Etapa 3, também já conhecida: explorar os dados\nprint(vendas.describe())\n# count, mean, std, min, quartis e max de cada coluna numérica: o resumo de sempre\n\n# Etapa 4: é aqui que o machine learning entra.\n# Os dados limpos e explorados viram X (features) e y (alvo)...\nX = vendas.drop(columns=\"vendido_em_1_dia\")\ny = vendas[\"vendido_em_1_dia\"]\n\n# ...prontos para um modelo aprender. Treinar de fato (fit/predict)\n# é o assunto do próximo módulo: por aqui, o que importa é o lugar do ML no fluxo."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nSaber onde o machine learning se encaixa evita duas armadilhas comuns: tratar o modelo como se ele fosse a parte mais importante do projeto (raramente é) e esperar que ele compense, sozinho, dados mal preparados (nunca compensa). No Módulo 2 você vai ver esse fluxo com mais detalhe, incluindo por que os dados usados para treinar o modelo precisam ser separados dos dados usados para avaliar se ele realmente aprendeu alguma coisa."
                    },
                    {
                        "type": "quote",
                        "value": "Machine learning não substitui as etapas anteriores da ciência de dados: ele depende inteiramente delas para ter algo de bom para aprender."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual alternativa descreve corretamente a relação entre inteligência artificial e machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Machine learning é uma parte da inteligência artificial, focada especificamente em aprender com dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Inteligência artificial é uma técnica específica dentro do machine learning, usada só em robótica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Machine learning e inteligência artificial são exatamente a mesma coisa, apenas com nomes diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Inteligência artificial só existe quando o sistema usa redes neurais profundas para funcionar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa recebe uma base de dados cheia de valores faltantes e duplicados e decide treinar um modelo de machine learning imediatamente, sem tratar esses problemas antes. Qual é a consequência mais provável dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo provavelmente aprende padrões distorcidos, porque a previsão depende da qualidade dos dados de entrada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma, porque algoritmos de machine learning corrigem automaticamente valores faltantes e duplicados durante o treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo vai treinar mais rápido, já que dados sujos exigem menos capacidade de processamento do computador.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo vai ignorar sozinho as linhas problemáticas e treinar apenas com os dados perfeitamente limpos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pesquisadora quer saber, com rigor estatístico, se existe mesmo uma relação significativa entre horas de estudo e nota da prova, ou se essa relação observada pode ser só coincidência da amostra. Esse objetivo está mais alinhado com qual área?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Estatística, porque o foco está em testar e explicar a relação entre as variáveis com rigor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Machine learning, porque qualquer relação entre variáveis só pode ser medida com algoritmos de predição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Machine learning, porque o objetivo principal de qualquer modelo é sempre maximizar a acurácia da previsão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística, porque essa área nunca lida com dados de amostras, apenas com populações completas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante a análise exploratória com pandas e estatística, percebeu-se uma forte correlação entre duas variáveis do dataset e vários outliers extremos numa terceira variável. Como essa etapa anterior deveria influenciar a etapa de machine learning que vem a seguir?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Deveria influenciar as decisões sobre quais variáveis usar e como tratar os outliers antes de treinar o modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não deveria influenciar em nada, já que o algoritmo de machine learning refaz essa análise sozinho, do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deveria ser ignorada, porque correlação e outliers só importam na etapa de visualização dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deveria apenas ser registrada num relatório separado, sem qualquer conexão com a etapa de modelagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um artigo descreve deep learning como \"a próxima fronteira depois do machine learning tradicional\". Do ponto de vista técnico mais preciso, qual é a relação entre deep learning e machine learning?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Deep learning é uma subárea do machine learning que usa redes neurais com muitas camadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deep learning é um campo totalmente separado de machine learning, sem nenhuma relação técnica entre os dois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deep learning substitui por completo o machine learning tradicional em qualquer tipo de problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deep learning é sinônimo exato de inteligência artificial, enquanto machine learning é algo bem diferente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ML não é mágica: limites e vieses",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Desfazendo a mágica\n\nDe fora, um modelo de machine learning pode parecer mágica: você entrega dados novos e ele \"adivinha\" a resposta certa. Não é mágica. É matemática e estatística encontrando padrões nos dados que foram mostrados a ele, e nada além disso. Essa última aula do módulo é sobre ser honesto quanto ao que machine learning consegue e ao que não consegue fazer, antes de começar a treinar modelos de verdade nos próximos módulos."
                    },
                    {
                        "type": "text",
                        "value": "## O modelo só conhece o que os dados mostraram\n\nUm modelo não tem acesso ao mundo real: ele tem acesso apenas ao conjunto de dados que recebeu no treino. Se esses dados não representam bem a situação em que o modelo vai ser usado, o desempenho cai, mesmo que o algoritmo esteja implementado corretamente. Um modelo de reconhecimento de imagem treinado quase só com fotos bem iluminadas, por exemplo, tende a errar mais em fotos escuras, simplesmente porque viu poucos exemplos desse tipo durante o treino.\n\nEsse é o motivo pelo qual dados bons e representativos importam mais do que a escolha do algoritmo. Um algoritmo sofisticado treinado com dados ruins costuma perder para um algoritmo simples treinado com dados bons."
                    },
                    {
                        "type": "text",
                        "value": "## O modelo também aprende os vieses dos dados\n\nAqui mora um risco mais sério. Se os dados históricos usados no treino refletem algum tipo de desigualdade (um processo de contratação que historicamente favoreceu um perfil específico de candidato, por exemplo), o modelo aprende esse padrão como se fosse um padrão legítimo a ser reproduzido. E o problema piora porque a decisão passa a parecer neutra: \"foi o algoritmo que decidiu\", quando na verdade o algoritmo só reproduziu, em escala, um viés que já existia nos dados.\n\nPor isso, tratar as previsões de um modelo como automaticamente objetivas é um erro. A pergunta \"que dados foram usados para treinar isso, e quem eles representam de verdade\" deveria vir sempre antes de confiar cegamente numa previsão."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\n# Base de clientes para prever inadimplência, com poucas amostras da classe minoritária\nclientes = pd.DataFrame({\n    \"renda\": [3200, 5400, 2100, 7800, 3900, 4600, 2900, 6100, 3300, 5000],\n    \"inadimplente\": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]  # só 1 em 10 é inadimplente\n})\n\nprint(clientes[\"inadimplente\"].value_counts())\n# 0    9\n# 1    1\n# Name: inadimplente, dtype: int64\n\n# Um modelo \"preguiçoso\", que sempre prevê 0 (não inadimplente), já acerta 90% das vezes\n# sem ter aprendido nada de útil sobre quem realmente é inadimplente.\n# Dados representativos (e a métrica de avaliação certa, tema do Módulo 5) importam\n# muito mais do que só treinar um modelo qualquer e olhar a acurácia isolada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mito comum sobre machine learning\", \"Realidade\"], [\"O modelo é neutro e objetivo, porque é matemática\", \"O modelo reflete os padrões, inclusive os vieses, dos dados usados no treino\"], [\"Mais dados sempre resolvem qualquer problema\", \"Dados de má qualidade ou não representativos atrapalham mesmo em grande volume\"], [\"Um modelo com nota alta no treino já está pronto para produção\", \"O que importa de verdade é o desempenho em dados novos, nunca vistos no treino\"], [\"O algoritmo mais avançado sempre dá o melhor resultado\", \"Dados bons e um problema bem definido pesam mais que a sofisticação do algoritmo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Honesto, não inútil\n\nNada disso quer dizer que machine learning não sirva para nada: quer dizer que ele precisa ser usado com responsabilidade, questionamento e avaliação criteriosa, em vez de confiança automática. É exatamente isso que o restante da trilha ensina: como dividir dados em treino e teste, como escolher a métrica certa para cada problema, como perceber quando um modelo decorou o treino em vez de aprender de verdade. Machine learning é uma ferramenta poderosa, desde que se conheçam os limites dela."
                    },
                    {
                        "type": "quote",
                        "value": "Machine learning não adivinha o futuro: ele projeta, para casos parecidos, o padrão que aprendeu no passado. Fora desse território conhecido, reconhecer os limites vale mais do que confiar cegamente no modelo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual afirmação descreve corretamente uma limitação real do machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um modelo só consegue aprender os padrões que estão presentes nos dados usados para treiná-lo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um modelo bem treinado nunca comete erros de previsão em nenhuma situação nova.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de machine learning é sempre neutro, porque se baseia apenas em matemática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo treinado com poucos dados funciona exatamente tão bem quanto um treinado com muitos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa treina um modelo para triagem de currículos usando dez anos de decisões de contratação passadas. Se essas decisões passadas favoreceram sistematicamente um determinado perfil de candidato, o que é mais provável acontecer com o modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo tende a reproduzir esse mesmo favorecimento, porque aprende exatamente os padrões dos dados históricos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo automaticamente corrige esse favorecimento, já que algoritmos matemáticos eliminam qualquer viés humano.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo ignora completamente as decisões passadas e avalia cada currículo novo de forma totalmente isolada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo detecta sozinho que houve favorecimento e alerta a empresa sobre o problema encontrado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de reconhecimento de imagens foi treinado quase inteiramente com fotos tiradas durante o dia, com boa iluminação. Colocado em produção, ele passa a receber fotos noturnas com frequência. O que é mais provável observar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Desempenho pior nas fotos noturnas, porque esse cenário está pouco representado nos dados de treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "O mesmo desempenho de sempre, já que a iluminação da foto nunca influencia modelos de imagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desempenho melhor nas fotos noturnas, porque menos detalhes visíveis facilitam o trabalho do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro imediato de execução, já que modelos de imagem não conseguem processar fotos escuras.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo encontra forte relação estatística entre o número de sorvetes vendidos e o número de afogamentos registrados numa cidade, usando essa relação para prever afogamentos. O que essa situação melhor ilustra sobre os limites do machine learning?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O modelo capta uma correlação útil para prever, o que não significa que sorvete cause afogamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo está claramente errado, porque relações estatísticas fortes sempre indicam uma causa real.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo deveria ser descartado, já que nenhuma correlação encontrada por machine learning tem valor prático.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo provou, de forma definitiva, que existe um mecanismo causal direto entre as duas variáveis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo atinge 99% de acerto nos dados usados para treiná-lo, mas quando testado com dados novos, nunca vistos antes, o acerto cai para 60%. Como interpretar essa diferença à luz dos limites do machine learning?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O modelo provavelmente decorou particularidades do treino, sem aprender um padrão que generalize.",
                                "isCorrect": true
                            },
                            {
                                "text": "Essa diferença é normal e esperada, e não exige nenhuma investigação adicional da equipe responsável.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado de 99% no treino não é, sozinho, suficiente para decidir se o modelo é bom.",
                                "isCorrect": false
                            },
                            {
                                "text": "A queda de desempenho mostra que os dados novos foram medidos com uma escala numérica diferente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - O fluxo de um projeto de ML",
        "aulas": [
            {
                "titulo": "O pipeline de ML (visão geral)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O fluxo de um projeto de machine learning\n\nNos módulos anteriores você entendeu o que é machine learning: aprender padrões a partir de dados, em vez de programar regras na mão. Mas da ideia até um modelo funcionando existe um caminho com etapas bem definidas, um fluxo que se repete (com variações) em praticamente todo projeto de ML, do mais simples ao mais sofisticado.\n\nEsse fluxo é o mapa deste módulo. Vamos ver a visão geral agora e detalhar cada etapa nas próximas quatro aulas."
                    },
                    {
                        "type": "text",
                        "value": "## As etapas do pipeline\n\nUm projeto de machine learning passa, tipicamente, por sete etapas:\n\n1. **Definir o problema**: o que exatamente queremos prever? Que decisão esse modelo vai apoiar?\n2. **Obter os dados**: reunir exemplos relevantes, geralmente organizados em um DataFrame do pandas.\n3. **Preparar os dados**: limpar, tratar valores faltantes, lidar com ruído (o módulo 6 aprofunda essa etapa).\n4. **Dividir em treino e teste**: separar uma parte dos dados para treinar e outra para avaliar depois (aula 2).\n5. **Treinar o modelo**: apresentar os dados de treino ao algoritmo escolhido (aula 3).\n6. **Avaliar o modelo**: medir o quanto ele acerta em dados que nunca viu (aula 3 e módulo 5).\n7. **Usar o modelo**: aplicar as previsões no problema real que motivou tudo isso.\n\nRepare que boa parte do trabalho (etapas 2 e 3) acontece antes de qualquer algoritmo de ML entrar em cena. É o DataFrame limpo que você já sabe construir com pandas, mais os outliers e correlações que você aprendeu a enxergar na visualização de dados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\",\"Pergunta que ela responde\",\"Onde você já viu (ou vai ver)\"],[\"1. Definir o problema\",\"O que eu quero prever, e por quê?\",\"Módulo 1: vocabulário de ML\"],[\"2. Obter os dados\",\"De onde vêm os exemplos?\",\"SQL e pandas, nas trilhas anteriores\"],[\"3. Preparar os dados\",\"Os dados estão limpos e prontos?\",\"Módulo 6 desta trilha\"],[\"4. Dividir treino/teste\",\"Como avaliar sem trapacear?\",\"Aula 2 deste módulo\"],[\"5. Treinar\",\"Como o modelo aprende o padrão?\",\"Aula 3 deste módulo\"],[\"6. Avaliar\",\"O modelo generaliza bem?\",\"Aula 3 e módulo 5\"],[\"7. Usar\",\"Como aplicar a previsão no mundo real?\",\"Aula 4 deste módulo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# Visao geral do pipeline em codigo (cada peca e detalhada nas proximas aulas)\n\n# 1-3. Definir o problema, obter e preparar os dados\n# df = pd.read_csv(\"clientes.csv\")           # o DataFrame que voce ja conhece do pandas\n\n# 4. Dividir em treino e teste\nfrom sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# 5. Treinar\nfrom sklearn.neighbors import KNeighborsClassifier\nmodelo = KNeighborsClassifier()\nmodelo.fit(X_train, y_train)\n\n# 6. Avaliar\nmodelo.score(X_test, y_test)\n# 0.93                                        -> 93% de acerto no conjunto de teste\n\n# 7. Usar\nmodelo.predict(dados_novos)                   # previsao para casos ainda nao vistos"
                    },
                    {
                        "type": "text",
                        "value": "## Um mapa, não uma esteira\n\nVale um alerta antes de seguir: na prática, esse fluxo raramente é percorrido em linha reta uma única vez. Você treina um modelo, avalia, percebe que os dados precisavam de mais limpeza, volta à etapa 3, tenta de novo. É normal (e esperado) ir e voltar entre as etapas.\n\nE como já vimos no módulo 1: nenhuma etapa desse pipeline compensa dados ruins. Um modelo treinado sobre dados enviesados ou mal coletados aprende exatamente esse viés, por mais caprichado que seja o resto do fluxo."
                    },
                    {
                        "type": "quote",
                        "value": "O pipeline de ML não é burocracia: é a diferença entre um modelo que parece funcionar e um modelo em que você pode confiar para prever dados que ainda não existem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo o pipeline apresentado, qual etapa vem logo antes de treinar o modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dividir os dados em conjuntos de treino e teste.",
                                "isCorrect": true
                            },
                            {
                                "text": "Avaliar o modelo com dados que ele ainda não viu.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o modelo para prever dados novos do mundo real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir qual será a métrica de sucesso do projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe começou a testar vários algoritmos de ML até um deles dar uma acurácia alta, sem antes definir claramente qual problema o modelo deveria resolver. Qual é o principal risco dessa abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo pode acertar métricas no papel sem responder a nenhuma pergunta de negócio útil.",
                                "isCorrect": true
                            },
                            {
                                "text": "O treinamento vai demorar muito mais tempo do que se o problema tivesse sido definido antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn recusa o treinamento quando o problema do projeto não foi definido antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "A acurácia obtida será sempre mais baixa do que se o problema tivesse sido definido antes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de avaliar seu primeiro modelo e ver um desempenho ruim, um cientista de dados decide voltar para revisar como os dados foram limpos, antes de treinar de novo. Como isso se encaixa no pipeline de ML?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É esperado: o pipeline costuma ser percorrido várias vezes, não numa única passada linear.",
                                "isCorrect": true
                            },
                            {
                                "text": "É um erro grave: o pipeline deve ser seguido uma única vez, do início ao fim, sem repetições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só é válido se o motivo for um bug no código, nunca por causa da qualidade dos dados usados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Indica que o algoritmo escolhido foi o errado e deveria ser trocado antes de mexer nos dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja quer prever quais clientes vão cancelar a assinatura no próximo mês. Antes de sair coletando dados, qual pergunta pertence à etapa de definir o problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que evento conta como cancelamento e qual histórico de dados será usado para prever isso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Qual valor de test_size deve ser passado para a função train_test_split do scikit-learn.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qual algoritmo de classificação vai gerar a maior acurácia possível para esse problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qual biblioteca de machine learning em Python tem a documentação mais fácil de usar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa descreve corretamente a relação entre o pipeline de ML e o que você já estudou nas trilhas anteriores?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Etapas como obter e preparar os dados reaproveitam diretamente SQL e pandas vistos antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline de ML substitui o uso de SQL e pandas, que só servem para relatórios simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística deixa de ser útil a partir do momento em que o scikit-learn entra no fluxo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Visualização de dados só volta a ser necessária depois que o modelo já está em produção.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Treino x teste e o train_test_split",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que nunca avaliar no mesmo dado que treinou\n\nImagine uma prova em que o aluno estuda exatamente as perguntas que vão cair, com as respostas incluídas. Ele pode até decorar tudo e tirar nota máxima, mas isso não prova que aprendeu a matéria, só que decorou aquele gabarito específico.\n\nCom modelos de ML acontece algo parecido. Se você treina um modelo e mede o desempenho dele nos mesmos dados usados no treino, corre o risco de medir o quanto ele decorou aqueles exemplos, não o quanto ele aprendeu o padrão de verdade. Lembra da regressão linear na trilha de estatística? Se o erro dela fosse calculado só nos pontos usados para ajustar a reta, esse erro pareceria ótimo, mas não diria nada sobre como a reta se sairia com um ponto novo."
                    },
                    {
                        "type": "text",
                        "value": "## A solução: separar treino e teste\n\nA prática padrão é separar uma parte dos dados antes de treinar qualquer coisa. O modelo só enxerga o conjunto de treino durante o `fit`. O conjunto de teste fica de lado, intocado, e só entra em cena na hora de avaliar, como uma prova com perguntas que o aluno nunca viu antes.\n\nO scikit-learn tem uma função pronta para isso: `train_test_split`, do módulo `sklearn.model_selection`."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import train_test_split\n\n# supondo X e y ja carregados, com 150 linhas ao todo\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\nX_train.shape, X_test.shape\n# ((120, 4), (30, 4))                -> 80% para treino (120), 20% para teste (30)"
                    },
                    {
                        "type": "text",
                        "value": "## Os dois parâmetros que mais importam\n\n`test_size` define a fração dos dados reservada para o teste: `0.2` significa 20%. Não existe um valor universal certo, mas é comum ver algo entre 20% e 30% para teste, deixando o restante para o treino.\n\n`random_state` fixa a semente aleatória usada para embaralhar os dados antes de dividir. Sem ele, cada execução do código gera uma divisão diferente, o que dificulta comparar dois experimentos de forma justa: a diferença de resultado pode ser só sorte da divisão, não mérito do modelo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Avaliar no treino\",\"Avaliar no teste\"],[\"O que mede\",\"Quanto o modelo decorou os exemplos\",\"Quanto o modelo generaliza para o novo\"],[\"Resultado típico\",\"Tende a ser otimista demais\",\"Mais realista sobre o uso real\"],[\"Uso correto\",\"Acompanhar o ajuste durante o treino\",\"Veredito final de desempenho\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# NAO faca isso: usar o mesmo dado para treinar e para avaliar\n# (supondo um modelo qualquer, ja instanciado)\nmodelo.fit(X_train, y_train)\nmodelo.score(X_train, y_train)\n# 0.98                                -> parece otimo, mas o modelo ja viu essas respostas\n\n# Avaliacao correta: dados que o modelo nunca viu no treino\nmodelo.score(X_test, y_test)\n# 0.91                                -> mais baixo, e essa e a estimativa que importa"
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo só prova que aprendeu quando acerta dados que nunca viu. Acertar o que já foi decorado não conta."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a função train_test_split do scikit-learn faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Divide os dados em um conjunto para treinar o modelo e outro para avaliá-lo depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treina o modelo e já calcula a acurácia final em uma única chamada de função.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove valores faltantes e outliers antes de qualquer etapa de treino do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolhe automaticamente, entre vários algoritmos, qual é o mais adequado para os dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trecho train_test_split(X, y, test_size=0.2, random_state=42), o que representa o parâmetro test_size=0.2?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que 20% dos exemplos vão para o conjunto de teste, e o restante para o treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o modelo vai rodar 20 vezes antes de calcular a métrica final de avaliação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que apenas 20% das colunas do conjunto de dados serão usadas para treinar o modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a semente aleatória usada para embaralhar e dividir os dados será fixada no valor vinte.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo apresentou 99% de acerto quando avaliado com model.score(X_train, y_train), mas apenas 62% com model.score(X_test, y_test). O que esse resultado sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O modelo decorou particularidades do treino e generaliza mal para dados novos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de teste foi montado com uma proporção de test_size incorreta demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor de random_state usado na divisão dos dados provavelmente estava incorreto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo está com desempenho ótimo, pois pelo menos uma das métricas foi alta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois cientistas de dados rodaram o mesmo código de train_test_split, mas sem passar random_state, e por isso obtiveram divisões diferentes dos dados em cada execução. Qual é a consequência prática disso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fica mais difícil comparar experimentos, pois cada divisão de dados muda os resultados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo treinado vai automaticamente ter uma acurácia mais baixa em qualquer teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn recusa a execução até que um valor de random_state seja informado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados de treino e teste vão se sobrepor parcialmente entre uma execução e outra.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que dizemos que o objetivo do treino é o modelo generalizar para dados novos, e não apenas acertar os dados de treino?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque, na prática, o modelo vai prever exemplos que nunca apareceram durante o treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o scikit-learn calcula a generalização automaticamente ao final de cada chamada de fit.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque acertar todos os dados de treino é sempre impossível, mesmo com bons algoritmos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a generalização é uma métrica obrigatória, exigida por toda avaliação de classificação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A API do scikit-learn (fit/predict/score)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um padrão que se repete em todo modelo\n\nDepois de entender por que dividimos os dados, vamos falar sobre a parte que mais surpreende quem começa em ML: não importa qual algoritmo você escolher, a forma de usá-lo no scikit-learn é sempre a mesma. Regressão linear, árvore de decisão, k-NN, todos seguem a mesma receita de três passos.\n\nEssa consistência não é acaso: é uma escolha de design da biblioteca, que permite trocar de algoritmo sem reescrever o resto do código."
                    },
                    {
                        "type": "text",
                        "value": "## Os três métodos essenciais\n\n- `fit(X_train, y_train)`: aprende os padrões a partir dos dados de treino. Ajusta os parâmetros internos do modelo, sem devolver nenhuma previsão.\n- `predict(X_novo)`: usa o que foi aprendido para gerar previsões em dados novos, sejam eles o `X_test` ou qualquer dado com o mesmo formato.\n- `score(X_test, y_test)`: calcula rapidamente uma métrica padrão de desempenho (acurácia para classificação, R² para regressão) comparando a previsão com o valor real.\n\nRepare na ordem: primeiro se aprende (`fit`), depois se aplica (`predict`), depois se resume o resultado (`score`)."
                    },
                    {
                        "type": "code",
                        "value": "# O mesmo padrao, independente do algoritmo escolhido\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\n\nmodelo_a = LogisticRegression()\nmodelo_a.fit(X_train, y_train)\nprevisoes_a = modelo_a.predict(X_test)\nmodelo_a.score(X_test, y_test)\n# 0.93\n\nmodelo_b = DecisionTreeClassifier()\nmodelo_b.fit(X_train, y_train)\nprevisoes_b = modelo_b.predict(X_test)\nmodelo_b.score(X_test, y_test)\n# 0.89\n\n# fit, predict e score: os mesmos tres passos, dois algoritmos diferentes"
                    },
                    {
                        "type": "text",
                        "value": "## O que cada método devolve\n\n`predict` devolve um array com uma previsão para cada linha de entrada: se `X_test` tem 30 linhas, `predict(X_test)` devolve 30 valores. Já `score` devolve um único número, resumindo o desempenho geral no conjunto informado.\n\nO que exatamente esse número representa depende do tipo de modelo: para um classificador, por padrão é a proporção de acertos; para um regressor, é o R², que a trilha de regressão (módulo 3) explica em detalhe. Por enquanto, pense em `score` como um jeito rápido de perguntar ao modelo: \"no geral, quão bem você está indo?\""
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\",\"O que você passa\",\"O que ele devolve\",\"O que faz\"],[\"fit(X, y)\",\"dados de treino e respostas certas\",\"o próprio modelo, já ajustado\",\"aprende os padrões\"],[\"predict(X)\",\"dados novos, sem as respostas\",\"um array com uma previsão por linha\",\"aplica o que aprendeu\"],[\"score(X, y)\",\"dados e as respostas verdadeiras\",\"um número único, geralmente entre 0 e 1\",\"resume o desempenho\"]]"
                    },
                    {
                        "type": "code",
                        "value": "previsoes = modelo_a.predict(X_test[:5])\nprevisoes\n# array([0, 0, 1, 0, 1])\n\ny_test[:5].values\n# array([0, 0, 1, 0, 1])              -> nesse trecho, todas as previsoes bateram com o real"
                    },
                    {
                        "type": "quote",
                        "value": "fit aprende, predict aplica, score resume. Troque o algoritmo à vontade: essas três palavras continuam valendo."
                    }
                ],
                "questions": [
                    {
                        "statement": "No scikit-learn, qual método é usado para treinar um modelo com os dados de treino?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "model.fit(X_train, y_train)",
                                "isCorrect": true
                            },
                            {
                                "text": "model.predict(X_train, y_train)",
                                "isCorrect": false
                            },
                            {
                                "text": "model.score(X_train, y_train)",
                                "isCorrect": false
                            },
                            {
                                "text": "model.train(X_train, y_train)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar modelo.fit(X_train, y_train), o que modelo.predict(X_test) devolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um array com uma previsão para cada linha de X_test.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um único número resumindo o desempenho do modelo no teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "O próprio conjunto X_test, sem nenhuma alteração aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um novo modelo já reajustado com os dados de teste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega escreveu modelo.score(X_train, y_train) achando que estava medindo o desempenho real do modelo, mas está avaliando o mesmo conjunto usado no fit. Qual é o problema, especificamente com o número que esse score devolve?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele reflete o quanto o modelo decorou o treino, não sua capacidade de generalizar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele não pode ser calculado, pois score não aceita os mesmos dados usados no fit.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele sempre retorna, nesse caso, um valor exatamente igual a 1.0, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele na verdade recalcula o fit do modelo, em vez de avaliar seu desempenho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal vantagem prática de todos os modelos do scikit-learn seguirem a mesma interface fit/predict/score?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar de algoritmo no meio de um projeto exige poucas mudanças no restante do código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os modelos passam a ter exatamente a mesma acurácia nos mesmos dados de teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de treinamento fica idêntico entre algoritmos diferentes que usam essa interface comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os hiperparâmetros de todos os algoritmos passam a ter exatamente os mesmos nomes e valores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o método score calcula, por padrão, em um modelo de classificação do scikit-learn?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A proporção de previsões corretas do modelo sobre o conjunto de dados informado.",
                                "isCorrect": true
                            },
                            {
                                "text": "A diferença média entre os valores previstos e os valores reais em cada linha.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo total, em segundos, que o modelo levou para treinar e ser avaliado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de exemplos de treino que foram usados para ajustar os parâmetros.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um modelo de ponta a ponta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um modelo, do início ao fim\n\nChegou a hora de juntar tudo (pipeline, split e a API fit/predict/score) em um único exemplo, completo, rodando de ponta a ponta. Vamos usar o `iris`, um dos datasets de exemplo que já vêm junto com o scikit-learn: medidas de flores (comprimento e largura de sépala e pétala) e a tarefa de prever a espécie.\n\nO foco aqui não é o algoritmo (isso o módulo 4 aprofunda), é o fluxo: esse esqueleto de código se repete, com pequenas variações, em praticamente todo projeto supervisionado simples."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.datasets import load_iris\nimport pandas as pd\n\niris = load_iris()\nX = pd.DataFrame(iris.data, columns=iris.feature_names)   # atributos (features)\ny = pd.Series(iris.target, name=\"especie\")                # alvo (target)\n\nX.shape, y.shape\n# ((150, 4), (150,))          -> 150 flores, 4 medidas cada, 1 especie por linha\n\ny.unique()\n# array([0, 1, 2])            -> 3 especies possiveis, codificadas como numeros"
                    },
                    {
                        "type": "text",
                        "value": "## Separar X e y: atributos e alvo\n\nEssa separação retoma o vocabulário do módulo 1: `X` reúne os atributos (as medidas de cada flor), e `y` guarda o alvo, a espécie que queremos prever. Cada linha de `X` corresponde à mesma posição em `y`: a flor na linha 0 de `X` tem sua espécie no valor da posição 0 de `y`.\n\nVale uma honestidade: o `iris` é um dataset pequeno (150 linhas) e bem separável, quase um \"hello world\" de ML. Dados reais costumam ser maiores, mais barulhentos, e resultam em métricas menos perfeitas. Isso não é falha do fluxo, é o mundo real sendo mais bagunçado que um dataset didático."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import train_test_split\nfrom sklearn.neighbors import KNeighborsClassifier\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\nmodelo = KNeighborsClassifier(n_neighbors=3)\nmodelo.fit(X_train, y_train)\n# KNeighborsClassifier(n_neighbors=3)   -> o modelo agora guarda o que aprendeu do treino"
                    },
                    {
                        "type": "code",
                        "value": "previsoes = modelo.predict(X_test)\nprevisoes[:8]\n# array([1, 0, 2, 1, 1, 0, 1, 2])\n\ny_test[:8].values\n# array([1, 0, 2, 1, 1, 0, 1, 2])        -> nesse trecho, previsao bateu com o valor real\n\nmodelo.score(X_test, y_test)\n# 1.0          -> 100% de acerto no teste (dataset pequeno e bem separavel, como comentamos)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Código\",\"Etapa do pipeline\"],[\"load_iris(), pd.DataFrame(...)\",\"Obter os dados\"],[\"X = ...  /  y = ...\",\"Separar atributos e alvo\"],[\"train_test_split(X, y, ...)\",\"Dividir treino e teste\"],[\"modelo.fit(X_train, y_train)\",\"Treinar\"],[\"modelo.score(X_test, y_test)\",\"Avaliar\"],[\"modelo.predict(dado_novo)\",\"Usar\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Carregar os dados, separar X e y, dividir treino e teste, treinar, prever, avaliar: esse esqueleto muda pouco de projeto para projeto. Domine esse fluxo e você já sabe o caminho, mesmo antes de conhecer o próximo algoritmo."
                    }
                ],
                "questions": [
                    {
                        "statement": "No exemplo com o dataset iris, o que a variável X representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As medidas das flores, usadas como atributos de entrada do modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A espécie de cada flor, usada como alvo a ser previsto pelo modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número total de flores presentes em todo o conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A acurácia final obtida pelo modelo já treinado no conjunto de teste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de modelo.fit(X_train, y_train) e modelo.predict(X_test), o que se compara para saber se a previsão foi boa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O resultado de predict(X_test) com os valores reais guardados em y_test.",
                                "isCorrect": true
                            },
                            {
                                "text": "O resultado de predict(X_test) com os valores usados dentro de X_train.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor de score(X_train, y_train) com o valor de score(X_test, y_test).",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de execução do fit com o tempo de execução do predict.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se, no lugar do KNeighborsClassifier, o exemplo usasse um DecisionTreeClassifier, o que precisaria mudar no restante do código (split, fit, predict, score)?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Praticamente nada: a chamada de fit, predict e score continua igual, só muda o import.",
                                "isCorrect": true
                            },
                            {
                                "text": "O train_test_split precisaria usar um test_size diferente para árvores de decisão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O X e o y precisariam ser recriados em um formato numérico específico para árvores.",
                                "isCorrect": false
                            },
                            {
                                "text": "O predict precisaria ser chamado antes do fit, já que o algoritmo é uma árvore.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo, modelo.score(X_test, y_test) retornou 1.0 (100% de acerto). O que é mais razoável concluir disso, considerando as características do dataset iris?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O resultado reflete um dataset pequeno e bem separável, não uma garantia para dados reais maiores.",
                                "isCorrect": true
                            },
                            {
                                "text": "O resultado prova que o k-NN é o melhor algoritmo possível para qualquer problema de classificação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado indica um erro no código, já que nenhum modelo real atinge 100% de acerto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado só é confiável porque a divisão de treino e teste usou exatamente random_state=42.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a ordem correta das etapas no esqueleto de um projeto supervisionado simples, como o do exemplo com iris?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Carregar os dados, separar X e y, dividir treino/teste, treinar, prever e avaliar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Separar X e y, treinar o modelo, carregar os dados, dividir treino/teste, avaliar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir treino/teste, carregar os dados, separar X e y, avaliar, treinar o modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Carregar os dados, treinar o modelo, dividir treino/teste, separar X e y, prever.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Validação e não vazar o teste",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Depois do primeiro modelo, vêm os ajustes\n\nCom o esqueleto da aula anterior funcionando, é natural querer melhorar: trocar o algoritmo, testar outro valor de `n_neighbors`, comparar configurações diferentes. A pergunta é: em cima de qual conjunto de dados você toma essas decisões?\n\nA resposta não pode ser \"o conjunto de teste\". Se você espia o teste toda vez que testa uma configuração nova e escolhe a que deu melhor nota ali, o teste deixa de medir generalização e passa a medir o quanto você ajustou suas escolhas a ele. É a mesma armadilha da aula 2 (avaliar no que já foi visto), só que um nível acima: agora é a sua decisão que está sendo ajustada ao teste, não o modelo."
                    },
                    {
                        "type": "text",
                        "value": "## Um terceiro conjunto: a validação\n\nA prática comum é dividir os dados em três partes, não duas:\n\n- **Treino**: usado no `fit`, para o modelo aprender os padrões.\n- **Validação**: usada para comparar configurações e decidir qual usar.\n- **Teste**: guardado de lado, consultado uma única vez, no final, para a avaliação honesta.\n\nEssa é a introdução da ideia. O módulo 5 aprofunda com validação cruzada (`cross-validation`), uma forma mais robusta de usar os dados de validação quando o conjunto é pequeno."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import train_test_split\n\n# 1o split: separa o teste, que so sera usado no final\nX_treino_val, X_test, y_treino_val, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\n# 2o split: do que sobrou, separa treino e validacao\nX_train, X_val, y_train, y_val = train_test_split(\n    X_treino_val, y_treino_val, test_size=0.25, random_state=42\n)\n\nlen(X_train), len(X_val), len(X_test)\n# (90, 30, 30)          -> de 150 exemplos: 60% treino, 20% validacao, 20% teste"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.neighbors import KNeighborsClassifier\n\nfor k in [1, 3, 5, 7]:\n    modelo = KNeighborsClassifier(n_neighbors=k)\n    modelo.fit(X_train, y_train)\n    print(k, modelo.score(X_val, y_val))\n# 1 0.90\n# 3 0.97\n# 5 0.97\n# 7 0.93          -> k=3 parece a melhor escolha, olhando so a validacao\n\n# So depois de decidir k, uma unica vez, olhamos o teste:\nmodelo_final = KNeighborsClassifier(n_neighbors=3)\nmodelo_final.fit(X_train, y_train)\nmodelo_final.score(X_test, y_test)\n# 0.93          -> avaliacao final, feita uma unica vez"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conjunto\",\"Usado para\",\"Quantas vezes é consultado\"],[\"Treino\",\"Ajustar os parâmetros do modelo (fit)\",\"Várias vezes, a cada tentativa\"],[\"Validação\",\"Comparar configurações e escolher a melhor\",\"Várias vezes, a cada tentativa\"],[\"Teste\",\"Estimativa final e honesta de desempenho\",\"Idealmente, uma única vez\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nEssa separação em três partes é só o começo. No módulo 5, a validação cruzada mostra como aproveitar melhor os dados de validação sem depender de uma única divisão da sorte. No módulo 6, o cuidado se estende à preparação dos dados: escalar variáveis e codificar categorias também precisam respeitar o split, calculados a partir do treino e só depois aplicados à validação e ao teste, para não vazar informação de um conjunto para o outro."
                    },
                    {
                        "type": "quote",
                        "value": "Teste é o exame final: você faz uma vez, e ele vale menos se você já tiver espiado as respostas durante as rodadas de validação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o papel do conjunto de validação em um projeto de ML?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Comparar diferentes configurações do modelo antes de decidir qual usar no fim.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar o modelo, no lugar do conjunto de treino considerado tradicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir de vez o conjunto de teste na avaliação final do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar os dados brutos antes de qualquer etapa de preparação deles.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que não é uma boa prática usar o conjunto de teste repetidas vezes para decidir qual configuração de modelo é a melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque as decisões passam a se ajustar ao teste, tornando a avaliação final menos honesta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o scikit-learn bloqueia chamadas repetidas de score sobre o mesmo conjunto de teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o conjunto de teste perde os dados originais a cada nova chamada de score.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada chamada de score no teste altera os valores salvos dentro de y_test.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados testou cinco algoritmos diferentes, sempre avaliando com score(X_test, y_test), escolheu o de maior nota no teste e reportou essa nota como o desempenho esperado do modelo. Qual é o problema dessa prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A nota reportada tende a ser otimista, pois o teste virou parte da escolha do algoritmo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A nota reportada está incorreta porque score não deveria ser chamado mais de uma vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "A nota reportada seria mais confiável se os cinco algoritmos tivessem sido testados no treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A nota reportada só seria válida se todos os cinco algoritmos usassem o mesmo random_state.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No código que faz dois train_test_split em sequência (um para separar o teste, outro para separar treino e validação), por que o teste é separado primeiro, logo no primeiro split?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Para que decisões tomadas depois, como a escolha feita na validação, não afetem o teste.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a função train_test_split só aceita ser chamada uma vez por conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o scikit-learn exige que o parâmetro test_size venha antes do random_state.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque calcular a validação antes do teste sempre gera uma divisão de dados errada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma divisão de 150 exemplos em 60% treino, 20% validação e 20% teste, quantos exemplos aproximadamente vão para cada conjunto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "90 para treino, 30 para validação e 30 para teste.",
                                "isCorrect": true
                            },
                            {
                                "text": "75 para treino, 45 para validação e 30 para teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "100 para treino, 25 para validação e 25 para teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "90 para treino, 45 para validação e 15 para teste.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Regressão: prever números",
        "aulas": [
            {
                "titulo": "O problema de regressão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O problema de regressão\n\nAté aqui você aprendeu o vocabulário de machine learning e o fluxo de um projeto: dividir em treino e teste, treinar com `fit`, prever com `predict`, avaliar com `score`. Chegou a hora de colocar esse fluxo pra trabalhar no primeiro tipo de problema da trilha: a **regressão**.\n\nRegressão é a tarefa de prever um número. Não uma categoria, não uma classe: um valor contínuo, que pode assumir (em teoria) qualquer ponto numa escala. Preço de um imóvel, temperatura de amanhã, salário de um cargo, tempo de entrega de um pedido, faturamento do mês que vem. Se a pergunta é \"quanto?\" ou \"qual valor?\", você está diante de um problema de regressão."
                    },
                    {
                        "type": "text",
                        "value": "## O que caracteriza um alvo contínuo\n\nO jeito mais rápido de reconhecer um problema de regressão é olhar pro alvo (a coluna que você quer prever, o target que você já viu no Módulo 1). Se esse alvo é numérico e pode variar de forma contínua (R$ 180 mil, R$ 180,50 mil, R$ 312,90 mil), é regressão. Se o alvo é uma categoria (spam ou não spam, aprovado ou reprovado, tipo de flor), isso é classificação, o assunto do próximo módulo.\n\nA distinção importa porque muda tudo: o algoritmo usado, a métrica de avaliação, até a forma de interpretar o resultado. Errar \"R$ 312 mil\" por R$ 5 mil é um tipo de erro bem diferente de prever a classe errada quando a resposta era outra classe."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Regressão\",\"Classificação\"],[\"O que prevê\",\"Um número contínuo\",\"Uma categoria (classe)\"],[\"Exemplo de alvo\",\"Preço, temperatura, salário\",\"Spam ou não, aprovado ou não\"],[\"Pergunta típica\",\"Quanto? Qual valor?\",\"Qual grupo? Qual tipo?\"],[\"Métricas usadas\",\"MAE, MSE, RMSE, R2\",\"Acurácia, precisão, recall, F1\"],[\"Onde entra na trilha\",\"Módulo 3 (este)\",\"Módulo 4\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde a regressão entra no fluxo que você já conhece\n\nNada muda na engrenagem que você viu no Módulo 2. Você ainda vai separar os dados em treino e teste com `train_test_split`, treinar o modelo com `.fit(X_train, y_train)`, prever com `.predict(X_test)` e avaliar comparando a previsão com o valor real do teste.\n\nA diferença é só o tipo de modelo (agora, um modelo de regressão) e o tipo de métrica usada na avaliação, que você vai ver na Aula 5. O padrão fit/predict/score se repete em praticamente todo modelo do scikit-learn, e isso não é acidente: é a API pensada pra você trocar de algoritmo sem reescrever o fluxo inteiro."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nimoveis = pd.DataFrame({\n    \"area_m2\": [30, 45, 60, 75, 90, 120],\n    \"quartos\": [1, 2, 2, 3, 3, 4],\n    \"preco_mil\": [175.0, 240.0, 316.0, 379.0, 425.0, 588.0],\n})\n\nprint(imoveis[\"preco_mil\"].dtype)\n# float64\n\nprint(float(imoveis[\"preco_mil\"].min()), float(imoveis[\"preco_mil\"].max()))\n# 175.0 588.0\nprint(round(float(imoveis[\"preco_mil\"].mean()), 2))\n# 353.83"
                    },
                    {
                        "type": "text",
                        "value": "## Regressão não é mágica\n\nUm modelo de regressão sempre encontra uma reta (ou uma superfície, quando há várias variáveis) que minimiza o erro nos dados que você deu a ele. Isso vale mesmo quando a relação real é fraca ou inexistente: o algoritmo não recusa o ajuste, ele só faz o melhor que consegue com o que tem.\n\nPrever bem depende de existir, de fato, uma relação entre as variáveis de entrada e o alvo, e de ter dados que capturem essa relação. Sem isso, o `fit()` roda sem erro nenhum e as previsões saem ruins mesmo assim."
                    },
                    {
                        "type": "quote",
                        "value": "Regressão é prever um número, não uma categoria. Antes de escolher qualquer algoritmo, vale perguntar: o alvo que eu quero prever é mesmo contínuo, ou é uma categoria disfarçada de número?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas descreve corretamente um problema de regressão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Prever um valor numérico contínuo, como o preço de um imóvel ou a temperatura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prever a categoria correta entre duas ou mais classes possíveis, como spam ou não.",
                                "isCorrect": false
                            },
                            {
                                "text": "Agrupar exemplos parecidos sem usar nenhum rótulo definido previamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de variáveis mantendo o máximo de informação possível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma imobiliária quer prever se um imóvel vai vender em até 30 dias (sim ou não) e, separadamente, por quanto ele vai vender (em reais). Como classificar essas duas tarefas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A primeira é classificação e a segunda é regressão: os alvos têm naturezas diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas são regressão, porque ambas usam os mesmos dados de entrada sobre o imóvel.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas são classificação, porque o resultado final sempre vira uma decisão de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "A primeira é regressão e a segunda é classificação, já que preço tem poucas categorias.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No fluxo de ML que você já viu (fit, predict, score), o que muda quando o problema passa a ser de regressão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tipo de modelo e a métrica de avaliação mudam, mas fit e predict continuam iguais.",
                                "isCorrect": true
                            },
                            {
                                "text": "O método fit deixa de existir, porque modelos de regressão não passam por treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A divisão em treino e teste deixa de ser necessária, já que o alvo é numérico.",
                                "isCorrect": false
                            },
                            {
                                "text": "O predict passa a devolver sempre uma probabilidade em vez de um valor direto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma escola quer prever a nota (0 a 10, com casas decimais) que cada aluno vai tirar na prova final a partir das horas de estudo. Por que isso é um problema de regressão, e não de classificação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a nota é um valor contínuo numa escala, não uma categoria fixa entre poucas opções.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o número de alunos analisados é grande demais para caber numa classificação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque horas de estudo é uma variável numérica, e só se pode prever números com números.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a escola já usa notas para decidir aprovação, o que torna o problema numérico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista tenta prever o preço de imóveis usando só a cor da porta de entrada como variável. O modelo treina sem erro no código, mas as previsões são ruins. O que isso ilustra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que o algoritmo encontra uma reta mesmo sem existir relação real entre a variável e o alvo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a regressão linear só funciona quando existe uma única variável de entrada disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o scikit-learn bloqueia o treino quando detecta uma variável irrelevante no conjunto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que esse tipo de erro só aparece quando faltam dados suficientes para treinar o modelo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Regressão linear simples: a reta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Regressão linear simples: a reta\n\nNa trilha de Estatística você já viu a reta de regressão: aquela reta que resume a relação entre duas variáveis numéricas. Machine learning não reinventa essa ideia, ele a usa como o primeiro e mais simples modelo de regressão. A regressão linear simples prevê um alvo `y` a partir de uma única variável `x`, pela equação que você já conhece:\n\ny = a * x + b\n\nO trabalho do modelo é encontrar os melhores valores de `a` e `b` para os dados que você tem. É só isso: uma reta, dois números."
                    },
                    {
                        "type": "text",
                        "value": "## Os coeficientes: inclinação e intercepto\n\nCada letra da equação tem um papel:\n\n- **a (inclinação, ou coeficiente angular):** quanto y muda, em média, para cada unidade a mais de x. Se a = 4,27 numa regressão que prevê preço de imóvel (em R$ mil) a partir da área (em m2), cada metro quadrado a mais soma, em média, R$ 4,27 mil ao preço previsto.\n- **b (intercepto):** o valor previsto de y quando x = 0. Nem sempre tem uma leitura prática (um imóvel de área zero não existe), mas é o ponto onde a reta cruza o eixo vertical, e o modelo precisa dele pra se ajustar direito aos dados.\n\nSaber ler esses dois números já é interpretar o modelo. Não tem caixa-preta aqui: a regressão linear simples é, literalmente, os dois coeficientes de uma reta."
                    },
                    {
                        "type": "text",
                        "value": "## Ajustando a reta aos dados: mínimos quadrados\n\nDado um conjunto de pontos (x, y), existem infinitas retas passando perto deles. Qual é \"a\" reta certa? A resposta padrão é o método dos mínimos quadrados (ordinary least squares, ou OLS): entre todas as retas possíveis, escolha a que minimiza a soma dos quadrados dos resíduos.\n\nResíduo é a diferença entre o valor real e o valor previsto pela reta, ponto a ponto: residuo = y_real - y_previsto. Alguns pontos ficam acima da reta (resíduo positivo), outros abaixo (resíduo negativo). Elevar ao quadrado antes de somar tem dois efeitos: elimina o sinal, pra erros positivos não cancelarem negativos por acaso, e penaliza mais os erros grandes do que os pequenos.\n\nSe você imaginar um gráfico de pontos espalhados com uma reta passando no meio, os resíduos são as distâncias verticais entre cada ponto e a reta: mínimos quadrados é a reta que deixa a soma dessas distâncias, ao quadrado, a menor possível."
                    },
                    {
                        "type": "code",
                        "value": "area = [30, 45, 60, 75, 90]          # m2\npreco = [150, 220, 280, 340, 410]    # R$ mil\n\nmedia_x = sum(area) / len(area)\nmedia_y = sum(preco) / len(preco)\n\nnumerador = sum((x - media_x) * (y - media_y) for x, y in zip(area, preco))\ndenominador = sum((x - media_x) ** 2 for x in area)\n\na = numerador / denominador\nb = media_y - a * media_x\n\nprint(round(a, 4), round(b, 4))\n# 4.2667 24.0"
                    },
                    {
                        "type": "code",
                        "value": "previstos = [round(a * x + b, 1) for x in area]\nresiduos = [round(y - p, 1) for y, p in zip(preco, previstos)]\n\nprint(previstos)\n# [152.0, 216.0, 280.0, 344.0, 408.0]\nprint(residuos)\n# [-2.0, 4.0, 0.0, -4.0, 2.0]\nprint(sum(residuos))\n# 0.0"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Área (m2)\",\"Preço real (R$ mil)\",\"Preço previsto (R$ mil)\",\"Resíduo\"],[\"30\",\"150\",\"152,0\",\"-2,0\"],[\"45\",\"220\",\"216,0\",\"4,0\"],[\"60\",\"280\",\"280,0\",\"0,0\"],[\"75\",\"340\",\"344,0\",\"-4,0\"],[\"90\",\"410\",\"408,0\",\"2,0\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Regressão linear simples é só isso: duas constantes escolhidas pra deixar a soma dos erros ao quadrado a menor possível. Todo modelo mais sofisticado da trilha parte dessa mesma lógica de ajustar parâmetros aos dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na equação da reta de regressão y = a*x + b, o que o coeficiente a representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A inclinação da reta: quanto y muda, em média, a cada unidade a mais de x.",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor de y previsto quando x é igual a zero, independente da inclinação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A distância média entre os pontos reais e a reta ajustada aos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A proporção de pontos que caem exatamente sobre a reta ajustada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O método dos mínimos quadrados escolhe a reta que minimiza o quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A soma dos quadrados das diferenças entre os valores reais e os valores previstos pela reta.",
                                "isCorrect": true
                            },
                            {
                                "text": "A soma das diferenças absolutas entre os valores reais e os valores previstos pela reta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número total de pontos que ficam acima da reta em relação aos que ficam abaixo dela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A distância entre o primeiro e o último ponto do conjunto de dados usado no ajuste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você já viu correlação na trilha de Estatística. Qual é a relação entre correlação e a inclinação a da reta de regressão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma correlação mais forte entre x e y tende a deixar os pontos mais próximos da reta.",
                                "isCorrect": true
                            },
                            {
                                "text": "A inclinação a é sempre igual ao coeficiente de correlação entre as duas variáveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Correlação e inclinação medem exatamente a mesma coisa, só em escalas numéricas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando a correlação é zero, a reta de regressão sempre tem inclinação negativa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ajustar uma reta de regressão por mínimos quadrados, um analista soma todos os resíduos (real menos previsto) dos dados de treino. O resultado esperado dessa soma é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Igual a zero, porque mínimos quadrados equilibra os desvios positivos e negativos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre um número positivo, já que os erros de previsão se acumulam na mesma direção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Igual à soma dos valores reais de y, porque a reta passa exatamente pela origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Igual ao coeficiente a, já que os dois vêm do mesmo cálculo de mínimos quadrados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um conjunto de dados tem quatro pontos bem alinhados e um quinto ponto bem distante da tendência dos outros. Por que esse quinto ponto pode puxar bastante a reta de mínimos quadrados na direção dele?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o método eleva os resíduos ao quadrado, e o erro grande pesa muito mais na soma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o scikit-learn remove automaticamente os quatro pontos alinhados ao detectar o padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a reta de regressão sempre passa exatamente pelo ponto mais distante da média.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque mínimos quadrados considera apenas os dois pontos mais extremos do conjunto de dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "LinearRegression no scikit-learn",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# LinearRegression no scikit-learn\n\nVocê já sabe calcular a e b na mão. Na prática, ninguém faz isso linha por linha: o scikit-learn resolve o ajuste por mínimos quadrados pra você, de forma rápida e testada, através da classe `LinearRegression`. O valor de ter aprendido o cálculo manual não foi perdido: agora você sabe exatamente o que a biblioteca está fazendo por baixo do capô."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n# mesmos dados da Aula 2, agora como arrays do numpy\nX = np.array([[30], [45], [60], [75], [90]])   # 2D: (n_amostras, 1)\ny = np.array([150, 220, 280, 340, 410])         # 1D: (n_amostras,)\n\nmodelo = LinearRegression()\nmodelo.fit(X, y)\n\nprint(round(float(modelo.coef_[0]), 4))\n# 4.2667\nprint(round(float(modelo.intercept_), 4))\n# 24.0"
                    },
                    {
                        "type": "text",
                        "value": "## Interpretando coef_ e intercept_\n\nRepare: são os mesmos números da Aula 2, calculados a mão. `modelo.coef_` é um array (porque em regressão múltipla existe um coeficiente por variável, você vê já na próxima aula) com o valor de a. `modelo.intercept_` é um número único com o valor de b. O scikit-learn não inventa uma lógica nova: ele resolve o mesmo mínimos quadrados que você já entende, só que de forma otimizada para conjuntos de dados bem maiores do que seria razoável calcular à mão.\n\nUm detalhe de implementação importa aqui: X precisa ser bidimensional, mesmo com uma variável só (por isso `[[30], [45], ...]`, e não `[30, 45, ...]`). O scikit-learn sempre espera uma matriz de amostras por variáveis, mesmo quando \"por variáveis\" é só uma coluna."
                    },
                    {
                        "type": "code",
                        "value": "novos_imoveis = np.array([[50], [100], [150]])\nprevisoes = modelo.predict(novos_imoveis)\n\nprint([round(float(p), 2) for p in previsoes])\n# [237.33, 450.67, 664.0]"
                    },
                    {
                        "type": "text",
                        "value": "## Retomando train_test_split, e o que você já sabe ler\n\nNo exemplo acima, treinamos e previmos em cima de dados diferentes (os 5 imóveis de treino, depois 3 imóveis novos), o que é bom. Mas com um conjunto de dados só, sem imóveis \"novos\" de verdade, como avaliar o modelo de forma justa? A resposta é a mesma do Módulo 2: usar `train_test_split` pra separar uma fatia que o modelo nunca vê durante o treino, e usar essa fatia só na hora de avaliar.\n\nAntes de seguir pra regressão múltipla, um resumo rápido do que você já sabe ler numa LinearRegression treinada:\n\n- `fit(X, y)`: ajusta o modelo aos dados de treino.\n- `predict(X)`: devolve as previsões para os dados passados.\n- `coef_`: os coeficientes (a) aprendidos, um por variável de entrada.\n- `intercept_`: o intercepto (b) aprendido pelo modelo.\n- `score(X, y)`: devolve o R2 do modelo, que você vai destrinchar na Aula 5."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import train_test_split\n\n# um conjunto maior, 10 imóveis\nareas = np.array([[28], [35], [42], [50], [58], [65], [72], [80], [95], [110]])\nprecos = np.array([145, 175, 205, 235, 270, 300, 325, 355, 410, 465])\n\nX_train, X_test, y_train, y_test = train_test_split(\n    areas, precos, test_size=0.2, random_state=42\n)\n\nprint(X_train.shape, X_test.shape)\n# (8, 1) (2, 1)\n\nmodelo_2 = LinearRegression()\nmodelo_2.fit(X_train, y_train)\n# a partir daqui, o fluxo é o de sempre: modelo_2.predict(X_test) e comparar com y_test"
                    },
                    {
                        "type": "quote",
                        "value": "fit encontra os coeficientes, predict aplica a reta aprendida a dados novos. Debaixo da API simples do scikit-learn está a mesma conta de mínimos quadrados que você acabou de fazer à mão."
                    }
                ],
                "questions": [
                    {
                        "statement": "No scikit-learn, qual é a ordem correta para treinar e usar um modelo de regressão linear?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Criar o modelo, chamar fit com os dados de treino e depois predict com dados novos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Chamar predict para gerar os dados e depois fit para ajustar o modelo a eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar o modelo e chamar score diretamente, sem precisar treinar com fit antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamar fit com os dados de teste e predict com os dados de treino, nessa ordem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de modelo.fit(X, y) em uma regressão linear simples, o que os atributos coef_ e intercept_ representam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os valores de a e b da reta que o modelo aprendeu a partir dos dados de treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "A previsão do modelo para o primeiro e o último exemplo do conjunto de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro médio e o erro máximo cometidos pelo modelo nos dados de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de exemplos e de variáveis usadas para treinar o modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao treinar uma regressão linear simples com uma única variável de entrada no scikit-learn, qual é o formato esperado para X?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma matriz de duas dimensões, tipo (n_amostras, 1), mesmo havendo só uma variável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um vetor de uma dimensão, tipo (n_amostras,), igual ao formato esperado para y.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um número único, já que existe apenas uma variável de entrada no modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista de textos com o nome da variável repetido para cada amostra.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega treina uma regressão linear com modelo.fit(X, y) usando o conjunto de dados inteiro e depois avalia o modelo prevendo sobre esse mesmo X. Qual é o problema dessa prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A avaliação fica otimista, pois o modelo é testado nos mesmos dados que usou no treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "O método predict não funciona quando recebe o mesmo X que foi usado no fit.",
                                "isCorrect": false
                            },
                            {
                                "text": "O coef_ calculado fica incorreto sempre que treino e avaliação usam os mesmos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn gera um erro de execução ao detectar que X se repete entre fit e predict.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao chamar modelo.predict(X_novo) passando um array com três novos imóveis, o que o retorno desse método traz?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um array com três valores, cada um sendo o preço previsto para o imóvel correspondente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um único valor numérico, que é a média das previsões para os três imóveis informados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um array com os coeficientes coef_ recalculados para esses três imóveis específicos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor booleano indicando se as previsões estão dentro da faixa observada no treino.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Regressão múltipla",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Regressão múltipla\n\nPreço de imóvel não depende só da área. Depende também do número de quartos, da idade da construção, da localização, e de mais uma dúzia de fatores. A regressão múltipla é exatamente a regressão linear que você já conhece, só que com mais de uma variável de entrada:\n\ny = b + a1*x1 + a2*x2 + ... + an*xn\n\nCada xi é uma feature (área, quartos, idade), cada ai é o coeficiente daquela feature, e b continua sendo o intercepto. No scikit-learn, a mudança no código é mínima: você passa uma matriz X com várias colunas em vez de uma só."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nfrom sklearn.linear_model import LinearRegression\n\nimoveis = pd.DataFrame({\n    \"area_m2\":    [30, 45, 60, 75, 90, 120],\n    \"quartos\":    [1, 2, 2, 3, 3, 4],\n    \"idade_anos\": [5, 10, 2, 8, 15, 1],\n    \"preco_mil\":  [175, 240, 316, 379, 425, 588],\n})\n\nX = imoveis[[\"area_m2\", \"quartos\", \"idade_anos\"]]\ny = imoveis[\"preco_mil\"]\n\nmodelo = LinearRegression()\nmodelo.fit(X, y)\n\nprint([round(float(c), 2) for c in modelo.coef_])\n# [4.0, 15.0, -2.0]\nprint(round(float(modelo.intercept_), 2))\n# 50.0\n\nfor nome, coeficiente in zip(X.columns, modelo.coef_):\n    print(f\"{nome}: {float(coeficiente):.2f}\")\n# area_m2: 4.00\n# quartos: 15.00\n# idade_anos: -2.00"
                    },
                    {
                        "type": "text",
                        "value": "## A interpretação fica mais delicada\n\nCom uma variável só, a era simplesmente \"quanto y sobe por unidade de x\". Com várias variáveis, cada coeficiente passa a significar \"quanto y sobe por unidade daquela variável, mantendo as outras constantes\". No exemplo: mantendo quartos e idade fixos, cada m2 a mais soma, em média, R$ 4 mil ao preço.\n\nEssa leitura assume que dá pra variar uma feature \"segurando\" as outras, o que nem sempre é realista: área e número de quartos, por exemplo, costumam andar juntos na vida real, já que imóveis maiores tendem a ter mais quartos. Quando as features de entrada estão correlacionadas entre si, os coeficientes individuais ficam menos confiáveis como explicação isolada, mesmo que o modelo, como um todo, continue prevendo bem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Feature\",\"Coeficiente\",\"O que significa (mantendo as outras fixas)\"],[\"area_m2\",\"4,0\",\"Cada m2 a mais soma, em média, R$ 4 mil ao preço previsto\"],[\"quartos\",\"15,0\",\"Cada quarto a mais soma, em média, R$ 15 mil ao preço previsto\"],[\"idade_anos\",\"-2,0\",\"Cada ano a mais de idade tira, em média, R$ 2 mil do preço previsto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que a escala das variáveis importa\n\nRepare que o coeficiente de quartos (15) é maior que o de area_m2 (4). Isso não quer dizer que quartos \"importa mais\": quer dizer que uma unidade de quartos (um quarto inteiro) tem um impacto diferente de uma unidade de área (um metro quadrado, uma fração pequena do imóvel). Se a área estivesse em centímetros quadrados em vez de metros, o coeficiente ficaria bem menor sem o modelo mudar em nada de essência. O código abaixo mostra exatamente isso.\n\nColocar as variáveis todas na mesma escala antes de treinar (com `StandardScaler`, por exemplo) é assunto do Módulo 6. Por enquanto já vale guardar a lição: coeficiente grande não é sinônimo de variável importante."
                    },
                    {
                        "type": "code",
                        "value": "imoveis[\"area_cm2\"] = imoveis[\"area_m2\"] * 10000\n\nX2 = imoveis[[\"area_cm2\", \"quartos\", \"idade_anos\"]]\nmodelo_cm = LinearRegression()\nmodelo_cm.fit(X2, y)\n\nfor nome, coeficiente in zip(X2.columns, modelo_cm.coef_):\n    print(f\"{nome}: {float(coeficiente):.6f}\")\n# area_cm2: 0.000400\n# quartos: 15.000000\n# idade_anos: -2.000000\n\nprint(round(float(modelo_cm.intercept_), 2))\n# 50.0\n\n# só o coeficiente da variável reescalada mudou (proporcionalmente à mudança de unidade);\n# quartos, idade_anos e o intercepto continuam idênticos, e as previsões também não mudam"
                    },
                    {
                        "type": "quote",
                        "value": "Mais variáveis não é só mais poder preditivo, é também mais cuidado ao ler o que cada coeficiente está dizendo. Coeficiente grande não é sinônimo de variável importante, principalmente quando as escalas são diferentes."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diferencia a regressão múltipla da regressão linear simples?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A múltipla usa duas ou mais variáveis de entrada para prever o alvo, em vez de apenas uma.",
                                "isCorrect": true
                            },
                            {
                                "text": "A múltipla prevê duas ou mais variáveis de saída ao mesmo tempo, em vez de apenas uma.",
                                "isCorrect": false
                            },
                            {
                                "text": "A múltipla não usa mínimos quadrados, e sim um algoritmo de classificação por trás.",
                                "isCorrect": false
                            },
                            {
                                "text": "A múltipla só funciona quando todas as variáveis de entrada são categóricas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um modelo que prevê preço a partir de área, número de quartos e idade do imóvel, o coeficiente da área indica o quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O quanto o preço tende a mudar por m2 a mais, mantendo quartos e idade constantes.",
                                "isCorrect": true
                            },
                            {
                                "text": "O quanto o preço tende a mudar por m2 a mais, somado ao efeito de quartos e idade juntos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A porcentagem do preço final que é explicada exclusivamente pela área do imóvel.",
                                "isCorrect": false
                            },
                            {
                                "text": "A importância da área em relação às outras variáveis, independente da escala usada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que interpretar os coeficientes fica mais delicado na regressão múltipla do que na simples?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque as variáveis de entrada podem estar correlacionadas entre si, misturando os efeitos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o scikit-learn não permite mais de uma variável ao calcular o método fit.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a regressão múltipla deixa de usar mínimos quadrados no ajuste dos coeficientes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada coeficiente passa a representar uma probabilidade em vez de uma taxa de variação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo usa área em metros quadrados e recebe coeficiente 4,0. Um colega refaz o mesmo modelo com a área em centímetros quadrados e o coeficiente vira 0,0004. O que está acontecendo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A escala da variável mudou, então o coeficiente muda de magnitude sem o modelo piorar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O segundo modelo está errado, porque coeficientes não podem ter casas decimais tão pequenas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A mudança de unidade indica que a variável deixou de ter relação linear com o preço.",
                                "isCorrect": false
                            },
                            {
                                "text": "O segundo modelo é mais preciso, já que coeficientes menores indicam menos overfitting.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de preço de imóveis tem coeficiente 30 para quartos e 4 para área em m2. É correto concluir que o número de quartos é a variável mais importante do modelo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não necessariamente: os coeficientes estão em escalas diferentes e não dá pra comparar direto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque em qualquer modelo o coeficiente maior sempre indica a variável mais importante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque coeficientes negativos são sempre mais importantes do que os positivos no modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só quando as duas variáveis têm a mesma unidade de medida entre si.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Métricas: MAE, RMSE e R2",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Métricas de regressão: MAE, RMSE e R2\n\nDesde o Módulo 2 você usa modelo.score(X_test, y_test) pra ter uma nota rápida do modelo. Para um regressor como o LinearRegression, esse número já é o R2. Mas avaliar um modelo de regressão direito costuma pedir mais de uma métrica: cada uma conta uma parte diferente da história de quão perto as previsões chegam dos valores reais."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Métrica\",\"O que mede\",\"Quando olhar com mais atenção\"],[\"MAE\",\"Erro médio absoluto, na mesma unidade do alvo\",\"Quando todo erro deve pesar igual, independente do tamanho\"],[\"MSE\",\"Erro médio ao quadrado, em unidade ao quadrado\",\"Mais como etapa intermediária pro RMSE do que pra leitura direta\"],[\"RMSE\",\"Raiz do MSE, de volta à unidade original do alvo\",\"Quando erros grandes devem pesar mais do que vários erros pequenos\"],[\"R2\",\"Proporção da variação do alvo explicada pelo modelo\",\"Pra comparar modelos entre si e ver o quadro geral\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Comparando previsão com o valor real\n\nRetomando o modelo de preço de imóveis: depois do train_test_split, o modelo nunca viu os dados de teste durante o treino. Chega a hora da verdade, comparar predict(X_test) com o y_test de verdade:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Preço real (R$ mil)\",\"Preço previsto (R$ mil)\",\"Erro (real - previsto)\"],[\"180\",\"185\",\"-5\"],[\"250\",\"235\",\"15\"],[\"300\",\"303\",\"-3\"],[\"220\",\"212\",\"8\"],[\"340\",\"360\",\"-20\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n\ny_test = np.array([180, 250, 300, 220, 340])   # preço real, R$ mil\ny_pred = np.array([185, 235, 303, 212, 360])   # preço previsto pelo modelo\n\nmae = mean_absolute_error(y_test, y_pred)\nmse = mean_squared_error(y_test, y_pred)\nrmse = np.sqrt(mse)\nr2 = r2_score(y_test, y_pred)\n\nprint(f\"MAE:  {mae:.2f}\")\n# MAE:  10.20\nprint(f\"MSE:  {mse:.2f}\")\n# MSE:  144.60\nprint(f\"RMSE: {rmse:.2f}\")\n# RMSE: 12.02\nprint(f\"R2:   {r2:.4f}\")\n# R2:   0.9550"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo os quatro números juntos\n\nOlhando a tabela de erros, quatro imóveis erraram por pouco (5, 15, 3 e 8 mil) e um errou por bastante (20 mil, no imóvel mais caro do grupo). O MAE trata todo erro do mesmo jeito e dá 10,2. O RMSE eleva cada erro ao quadrado antes de tirar a média e a raiz, o que faz o erro de 20 mil pesar muito mais que os outros, puxando o resultado pra 12,02: quando o RMSE se destaca bem acima do MAE, é sinal de que uns poucos erros grandes estão puxando a média.\n\nO R2 de 0,955 diz que o modelo explica cerca de 95,5% da variação dos preços reais, um número bom. Mas olhando só pra ele, você perderia o detalhe de que um imóvel específico errou por R$ 20 mil, quase 6% do valor dele. Machine learning não é mágica: R2 alto não garante que toda previsão individual vai ser boa, e olhar a tabela de previsão x real, não só o resumo estatístico, continua valendo a pena."
                    },
                    {
                        "type": "quote",
                        "value": "Nenhuma métrica sozinha conta a história inteira. MAE, RMSE e R2 respondem perguntas diferentes sobre o mesmo conjunto de erros: um bom hábito é olhar mais de uma antes de confiar no modelo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o MAE (erro absoluto médio) mede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A média das diferenças absolutas entre os valores previstos e os valores reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "A proporção de previsões que ficaram exatamente iguais aos valores reais observados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A maior diferença encontrada entre um valor previsto e o valor real correspondente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A média dos valores reais menos a média dos valores previstos pelo modelo inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o RMSE costuma ser maior ou igual ao MAE para o mesmo conjunto de previsões?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque elevar os erros ao quadrado penaliza mais os erros grandes do que os pequenos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o RMSE é calculado sobre o dobro dos dados usados no cálculo do MAE.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o MAE ignora previsões erradas, enquanto o RMSE considera todas elas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o RMSE é sempre calculado nos dados de treino, e o MAE nos dados de teste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa um R2 de 0,80 para um modelo de regressão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo explica cerca de 80% da variação do alvo observada nos dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo acerta exatamente o valor real em 80% das previsões realizadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo erra, em média, 80% do valor real em cada previsão que faz.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo usa 80% das variáveis disponíveis para gerar cada previsão feita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma seguradora está prevendo o valor de indenizações e quer penalizar bastante previsões muito abaixo do valor real, que geram prejuízo maior. Qual métrica combina melhor com essa prioridade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "RMSE, porque eleva os erros ao quadrado e dá mais peso justamente aos erros grandes.",
                                "isCorrect": true
                            },
                            {
                                "text": "MAE, porque trata todo erro da mesma forma, sem depender do tamanho de cada um.",
                                "isCorrect": false
                            },
                            {
                                "text": "R2, porque mede diretamente o prejuízo em reais causado por cada erro de previsão.",
                                "isCorrect": false
                            },
                            {
                                "text": "MAE, porque é a métrica padrão do scikit-learn para qualquer problema de seguros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo apresenta R2 de 0,95, mas o MAE mostra um erro médio de R$ 40 mil em imóveis que custam, em média, R$ 90 mil. O que essa combinação de números indica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que apesar do R2 alto, o erro médio ainda é grande perto do valor típico do alvo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que os dois números estão contraditórios, e um dos cálculos com certeza está errado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o modelo está com overfitting, já que R2 alto sempre indica esse problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o MAE nesse caso não é uma métrica válida quando o R2 já está calculado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Classificação: prever categorias",
        "aulas": [
            {
                "titulo": "O problema de classificação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Classificação: prever categorias\n\nNo módulo anterior você usou regressão pra prever um número: o preço de um imóvel, a nota de uma prova, o consumo de energia de uma casa. Mas nem toda pergunta que a ciência de dados tenta responder tem uma resposta numérica contínua. Às vezes a pergunta é outra: esse e-mail é spam ou não é? Esse paciente tem a doença ou não tem? Esse cliente vai cancelar a assinatura ou vai continuar?\n\nEsse é o problema de **classificação**: em vez de prever um valor que pode ser qualquer número, o modelo prevê uma **classe**, escolhida entre um conjunto fixo e conhecido de possibilidades. É o outro grande pilar do aprendizado supervisionado, ao lado da regressão, e é o assunto deste módulo."
                    },
                    {
                        "type": "text",
                        "value": "## Classe, rótulo, categoria: o mesmo vocabulário\n\nAssim como na regressão a coluna que você quer prever se chama alvo (`target`), na classificação essa coluna guarda uma **classe** (também chamada de **rótulo** ou **categoria**). Alguns exemplos de alvo em problemas de classificação:\n\n- spam ou não spam\n- aprovado ou reprovado\n- doente ou saudável\n- risco baixo, risco médio ou risco alto\n\nCada linha dos dados, cada exemplo, já vem com uma dessas classes marcada (é assim que o aprendizado é supervisionado: alguém rotulou os exemplos de treino antes). O trabalho do modelo é aprender, a partir desses exemplos já rotulados, a prever a classe de um exemplo novo, que ele nunca viu."
                    },
                    {
                        "type": "text",
                        "value": "## Binária x multiclasse\n\nQuando o alvo tem só duas classes possíveis, como spam ou não spam, o problema é de **classificação binária**. É o caso mais comum, e o que este módulo usa na maioria dos exemplos.\n\nQuando o alvo tem três ou mais classes possíveis, como classificar uma notícia em \"esporte\", \"política\" ou \"economia\", o problema é de **classificação multiclasse**. A ideia central não muda (ainda é prever uma categoria entre opções conhecidas), mas alguns algoritmos e métricas precisam de ajustes pra lidar com mais de duas opções, algo que essa trilha só toca de leve."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Regressão\",\"Classificação\"],[\"O que prevê\",\"Um valor numérico contínuo\",\"Uma classe (categoria) entre um conjunto conhecido\"],[\"Exemplo de alvo\",\"Preço de um imóvel, nota de uma prova\",\"Spam ou não spam, aprovado ou reprovado\"],[\"Saída do modelo\",\"Um número (ex.: R$ 350.000)\",\"Um rótulo (ex.: \\\"spam\\\") ou uma probabilidade\"],[\"Métrica comum\",\"MAE, MSE, RMSE, R2 (módulo 3)\",\"Acurácia, precisão, recall (módulo 5)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nemails = pd.DataFrame({\n    \"tamanho_kb\": [12, 340, 8, 220, 15],\n    \"tem_link\": [1, 1, 0, 1, 0],\n    \"classe\": [\"spam\", \"não spam\", \"não spam\", \"spam\", \"não spam\"],\n})\n\nprint(emails[\"classe\"].value_counts())\n# não spam    3\n# spam        2\n# Name: classe, dtype: int64"
                    },
                    {
                        "type": "text",
                        "value": "## Nem tudo é rótulo confiável\n\nUm classificador só é tão bom quanto os rótulos que aprendeu a imitar. Se os exemplos de treino têm rótulos errados, inconsistentes ou enviesados (um sistema de aprovação de crédito treinado em decisões humanas enviesadas, por exemplo), o modelo aprende exatamente esse padrão, erros e vieses incluídos. Machine learning não separa o certo do errado sozinho: ele encontra o padrão que está nos dados, seja ele qual for.\n\nOutro ponto de atenção, que o módulo 5 aprofunda: nem sempre as classes aparecem em quantidades parecidas. Um sistema de detecção de fraude pode ter 99% de transações normais e 1% de fraudes. Um modelo \"preguiçoso\", que sempre prevê \"normal\", já acerta 99% das vezes, e ainda assim é inútil. Definir bem o que é \"um bom modelo\" fica pra frente."
                    },
                    {
                        "type": "quote",
                        "value": "Regressão prevê um número. Classificação prevê uma categoria, escolhida entre um conjunto conhecido de classes."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um modelo de classificação prevê, diferente de um modelo de regressão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma classe (categoria), escolhida entre um conjunto conhecido de rótulos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um valor numérico que pode assumir qualquer número real possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade exata de linhas presentes nos dados de treino usados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma nova coluna de dados que ainda não existia no conjunto original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco quer prever se um cliente vai pagar ou não um empréstimo (duas respostas possíveis). Esse é um problema de classificação:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "binária, porque existem exatamente duas classes possíveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "multiclasse, porque a previsão envolve mais de uma variável.",
                                "isCorrect": false
                            },
                            {
                                "text": "de regressão, porque o resultado final é uma probabilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "não supervisionada, porque o banco não tem rótulos históricos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema classifica fotos de animais em \"gato\", \"cachorro\", \"pássaro\" ou \"outro\". Esse é um problema de classificação:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "multiclasse, porque existem mais de duas classes possíveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "binária, porque cada foto pertence a apenas uma classe por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "de regressão, porque a saída é uma pontuação de confiança.",
                                "isCorrect": false
                            },
                            {
                                "text": "não supervisionada, porque as fotos não têm rótulo definido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna chamada \"nivel_risco\" guarda os valores 1, 2 e 3, representando risco baixo, médio e alto. Prever essa coluna é um problema de:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "classificação, pois os números representam categorias, não quantidades.",
                                "isCorrect": true
                            },
                            {
                                "text": "regressão, porque a coluna contém apenas valores numéricos inteiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "classificação, mas só funciona se os valores forem sempre positivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "regressão, já que o scikit-learn não classifica valores numéricos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa treina um classificador de currículos usando decisões de contratação de anos anteriores, que favoreciam um perfil específico de candidato. O modelo tende a repetir esse padrão. Isso mostra que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o modelo aprende os padrões dos dados de treino, inclusive os enviesados.",
                                "isCorrect": true
                            },
                            {
                                "text": "classificação é imune a viés, porque usa só cálculo matemático puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "o problema deixa de ser classificação assim que envolve pessoas.",
                                "isCorrect": false
                            },
                            {
                                "text": "algoritmos de classificação corrigem sozinhos dados desbalanceados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Regressão logística",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Regressão logística: um nome que engana\n\nApesar do nome, regressão logística não resolve problemas de regressão: é um dos algoritmos mais usados para **classificação**, principalmente binária. O nome vem da função matemática que ela usa por baixo dos panos, a função logística (também chamada de sigmoide), não do tipo de problema que ela resolve. É uma pegadinha de nome clássica, e vale gravar: regressão logística classifica."
                    },
                    {
                        "type": "text",
                        "value": "## A intuição: espremendo a reta entre 0 e 1\n\nLembra da reta da regressão linear (módulo 3), que combina as features multiplicando cada uma por um coeficiente e somando tudo? A regressão logística parte da mesma ideia, mas dá um passo a mais: pega o resultado dessa combinação linear e passa por uma função em formato de S (a sigmoide), que espreme qualquer número, por maior ou menor que seja, pra um valor entre 0 e 1.\n\nEsse valor entre 0 e 1 é interpretado como uma **probabilidade**: a chance estimada de o exemplo pertencer à classe positiva. Quanto mais a combinação linear das features empurra esse valor pra perto de 1, mais o modelo \"acredita\" naquela classe."
                    },
                    {
                        "type": "text",
                        "value": "## Da probabilidade à classe: o limiar\n\nUma probabilidade sozinha não é uma decisão. Pra transformar os 0,82 ou 0,15 que saem da sigmoide numa classe (\"sim\" ou \"não\"), o scikit-learn aplica um **limiar** (`threshold`): por padrão, 0,5. Probabilidade maior ou igual a 0,5 vira a classe positiva; menor que isso vira a classe negativa.\n\nEsse limiar não é uma lei da física, é só um padrão razoável. O módulo 5 mostra situações (como exames médicos, em que deixar passar um doente é pior do que assustar um saudável à toa) em que faz sentido mover esse limiar pra 0,2 ou 0,3, tornando o modelo mais \"desconfiado\"."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.linear_model import LogisticRegression\nimport pandas as pd\n\ndados = pd.DataFrame({\n    \"horas_estudo\": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\n    \"aprovado\":     [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],\n})\n\nX = dados[[\"horas_estudo\"]]\ny = dados[\"aprovado\"]\n\nmodelo = LogisticRegression()\nmodelo.fit(X, y)\n\nnovos_alunos = pd.DataFrame({\"horas_estudo\": [2, 5.5, 9]})\n\nprint(modelo.predict(novos_alunos))\n# [0 1 1]\n\nprint(modelo.predict_proba(novos_alunos))\n# [[0.9  0.1 ]\n#  [0.42 0.58]\n#  [0.04 0.96]]"
                    },
                    {
                        "type": "text",
                        "value": "## A fronteira de decisão da regressão logística\n\nImagine um gráfico com os exemplos espalhados, coloridos por classe. A **fronteira de decisão** é a linha (ou, com mais de duas features, o plano) que separa a região onde o modelo prevê uma classe da região onde ele prevê a outra: exatamente onde a probabilidade prevista cruza o limiar de 0,5.\n\nComo a regressão logística é, no fundo, uma combinação linear das features, essa fronteira é sempre uma **reta** (ou um plano, em mais dimensões). Isso é uma limitação real: se as classes só puderem ser separadas por uma curva, uma reta nunca vai fazer um trabalho perfeito, por mais dados que você use."
                    },
                    {
                        "type": "quote",
                        "value": "Regressão logística é regressão só no nome: o que ela devolve é uma probabilidade, e um limiar transforma essa probabilidade em classe."
                    }
                ],
                "questions": [
                    {
                        "statement": "Apesar do nome, a regressão logística é usada para resolver problemas de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "classificação: estima a probabilidade de pertencer a cada classe.",
                                "isCorrect": true
                            },
                            {
                                "text": "regressão, estimando diretamente um valor numérico contínuo.",
                                "isCorrect": false
                            },
                            {
                                "text": "agrupamento, juntando exemplos parecidos sem usar rótulos.",
                                "isCorrect": false
                            },
                            {
                                "text": "redução de dimensionalidade, diminuindo o número de features.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o método `predict_proba()` de um `LogisticRegression` devolve para cada exemplo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A probabilidade estimada de o exemplo pertencer a cada classe.",
                                "isCorrect": true
                            },
                            {
                                "text": "A classe final já escolhida, depois de aplicar o limiar padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro do modelo, medido nos dados de teste separados antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os coeficientes que o modelo ajustou durante o treino com `fit()`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, o scikit-learn classifica um exemplo na classe positiva quando a probabilidade prevista é:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "maior ou igual a 0,5, o limiar padrão de decisão.",
                                "isCorrect": true
                            },
                            {
                                "text": "igual a 1,0, ou seja, quando o modelo tem certeza total.",
                                "isCorrect": false
                            },
                            {
                                "text": "menor que 0,5, priorizando a classe negativa por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "igual à proporção de positivos observada nos dados de treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um exame para detectar uma doença grave, a equipe passa a classificar como positivo qualquer paciente com probabilidade prevista acima de 0,2, em vez de 0,5. O objetivo dessa mudança é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "reduzir os casos de pacientes doentes classificados como saudáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "aumentar a acurácia geral do modelo em todos os pacientes testados.",
                                "isCorrect": false
                            },
                            {
                                "text": "tornar o treino do modelo mais rápido em bases de dados grandes.",
                                "isCorrect": false
                            },
                            {
                                "text": "transformar o problema, que deixa de ser binário e vira multiclasse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A fronteira de decisão de uma regressão logística, no espaço das features, tem o formato de:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "uma reta (ou plano), já que o modelo combina as features linearmente.",
                                "isCorrect": true
                            },
                            {
                                "text": "uma curva em S, o mesmo formato da função sigmoide usada por dentro.",
                                "isCorrect": false
                            },
                            {
                                "text": "um conjunto de degraus retos, um para cada pergunta feita ao modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "um círculo ao redor da média de cada classe presente no treino.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "k-vizinhos mais próximos (k-NN)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A intuição: classificar pela vizinhança\n\nO k-NN (`k-nearest neighbors`, k-vizinhos mais próximos) usa talvez a ideia mais simples de todo o machine learning: para classificar um exemplo novo, olhe para os exemplos de treino mais parecidos com ele e copie a classe da maioria. É a versão matemática do ditado \"diz-me com quem andas e te direi quem és\".\n\nNão existe fórmula nem curva ajustada aos dados. O k-NN guarda os exemplos de treino e, na hora de prever, mede a distância do exemplo novo até todos eles, escolhe os `k` mais próximos e deixa esses vizinhos votarem na classe."
                    },
                    {
                        "type": "text",
                        "value": "## Um algoritmo que quase não treina\n\nIsso torna o k-NN um caso curioso: o `fit()` dele é rápido e simples, basicamente guarda os dados de treino na memória. Todo o trabalho pesado acontece depois, em cada chamada de `predict()`, quando o modelo precisa calcular a distância até cada exemplo guardado. Por isso ele é chamado de aprendiz preguiçoso (`lazy learner`): adia o esforço pra hora de prever, em vez de resumir os dados numa fórmula durante o treino.\n\nA distância mais comum entre dois exemplos é a distância euclidiana, a mesma da régua: a raiz quadrada da soma dos quadrados das diferenças em cada feature."
                    },
                    {
                        "type": "text",
                        "value": "## O efeito do k na fronteira de decisão\n\nO valor de `k` muda bastante o comportamento do modelo. Com `k` pequeno (como `k=1`), a previsão depende de pouquíssimos vizinhos, então um exemplo ruidoso ou um outlier no treino pode virar a decisão sozinho: a fronteira de decisão fica irregular, cheia de dobras, acompanhando de perto cada ponto do treino (um sinal de possível overfitting).\n\nCom `k` grande, cada previsão passa pelo voto de muitos vizinhos, o que suaviza a fronteira de decisão, mas também pode borrar a separação entre classes que ficam próximas uma da outra (um sinal de possível underfitting). Não existe um `k` universalmente certo: ele costuma ser escolhido testando alguns valores, algo que o módulo 5 retoma com a validação cruzada."
                    },
                    {
                        "type": "text",
                        "value": "## Por que k-NN precisa de features na mesma escala\n\nComo o k-NN decide tudo por distância, a escala de cada feature importa demais. Imagine comparar clientes usando \"idade\" (varia de 20 a 60) e \"renda anual em reais\" (varia de 20.000 a 200.000). Uma diferença de 5 anos é pequena em números absolutos perto de uma diferença de 5.000 reais, mesmo que as duas sejam, proporcionalmente, igual de relevantes pro problema.\n\nSem escalar as features antes de treinar, a renda praticamente decide sozinha a distância entre exemplos, e a idade vira ruído de fundo, quase ignorado. Por isso o k-NN quase sempre é usado depois de um `StandardScaler` (o módulo 6 mostra como). Regressão logística e árvore de decisão sentem bem menos esse problema."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.neighbors import KNeighborsClassifier\nimport pandas as pd\n\ndados = pd.DataFrame({\n    \"idade\": [22, 25, 47, 52, 46, 56, 23, 60],\n    \"salario_mil\": [2.5, 3.0, 8.0, 9.5, 7.8, 10.2, 2.8, 11.0],\n    \"comprou_plano_premium\": [0, 0, 1, 1, 1, 1, 0, 1],\n})\n\nX = dados[[\"idade\", \"salario_mil\"]]\ny = dados[\"comprou_plano_premium\"]\n\nmodelo = KNeighborsClassifier(n_neighbors=3)\nmodelo.fit(X, y)\n\nnovo_cliente = pd.DataFrame({\"idade\": [48], \"salario_mil\": [8.5]})\n\nprint(modelo.predict(novo_cliente))\n# [1]\n\nprint(modelo.predict_proba(novo_cliente))\n# [[0. 1.]]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"k pequeno (ex.: k=1)\",\"k grande (ex.: k=25)\"],[\"Sensibilidade a ruído\",\"Alta: um vizinho estranho muda a previsão\",\"Baixa: o voto de um outlier pesa pouco\"],[\"Fronteira de decisão\",\"Irregular, acompanha de perto cada exemplo\",\"Mais suave, pode borrar classes próximas\"],[\"Risco principal\",\"Overfitting: decorar o treino\",\"Underfitting: ignorar padrões locais\"],[\"Custo computacional\",\"Baixo por previsão\",\"Mais alto (compara com mais vizinhos)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "k-NN não aprende uma fórmula: aprende a comparar. A classe de um exemplo novo é a classe da vizinhança que ele mais se parece."
                    }
                ],
                "questions": [
                    {
                        "statement": "Como o k-NN decide a classe de um exemplo novo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Olha os k exemplos mais próximos e vota pela classe mais comum.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ajusta uma equação linear que combina todas as features de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz perguntas de sim ou não em sequência até chegar numa classe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Agrupa todos os exemplos em clusters antes de calcular a previsão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo k-NN é treinado com `k=1`. Esse valor tende a deixar o modelo:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "muito sensível a ruído, já que um único vizinho decide a classe.",
                                "isCorrect": true
                            },
                            {
                                "text": "muito lento para treinar, mesmo com poucos exemplos de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "incapaz de lidar com problemas que têm mais de duas classes.",
                                "isCorrect": false
                            },
                            {
                                "text": "imune a overfitting, já que usa só um vizinho por previsão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o k-NN exige que as features estejam numa escala parecida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "porque ele decide a classe com base na distância entre exemplos.",
                                "isCorrect": true
                            },
                            {
                                "text": "porque ele só aceita valores decimais entre 0 e 1 como entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque o `fit()` retorna erro ao receber escalas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque o scikit-learn exige escala igual para qualquer modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um conjunto de dados tem \"idade\" (0 a 100) e \"renda mensal\" (0 a 50.000), sem nenhum escalonamento. Ao treinar um k-NN nesses dados, o efeito mais provável é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "a renda dominar a distância calculada, deixando a idade quase irrelevante.",
                                "isCorrect": true
                            },
                            {
                                "text": "o modelo ignorar automaticamente a coluna com a maior variação.",
                                "isCorrect": false
                            },
                            {
                                "text": "o k-NN normalizar as duas colunas sozinho, antes de calcular distâncias.",
                                "isCorrect": false
                            },
                            {
                                "text": "o treino falhar com erro, já que as escalas precisam ser sempre iguais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Aumentar bastante o valor de `k` em um k-NN tende a deixar a fronteira de decisão:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "mais suave, podendo borrar a separação entre classes próximas.",
                                "isCorrect": true
                            },
                            {
                                "text": "mais irregular, seguindo de perto cada exemplo do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "idêntica à de uma árvore de decisão, não importa os dados usados.",
                                "isCorrect": false
                            },
                            {
                                "text": "impossível de calcular quando existe mais de uma feature.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Árvore de decisão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A intuição: uma sequência de perguntas\n\nUma árvore de decisão classifica de um jeito bem parecido com o de um médico fazendo perguntas de triagem: \"tem febre?\", se sim, \"tem tosse também?\", e assim por diante, até chegar numa conclusão. Cada pergunta olha para uma feature e divide os exemplos em dois grupos, criando um fluxograma de perguntas encadeadas.\n\nEssa estrutura de perguntas se/então é o que torna a árvore de decisão um dos algoritmos mais fáceis de interpretar: dá pra desenhá-la, segui-la manualmente e explicar exatamente por que o modelo chegou naquela previsão, sem depender de fórmula nenhuma."
                    },
                    {
                        "type": "text",
                        "value": "## Como a árvore escolhe as perguntas\n\nDurante o treino, para cada divisão (cada nó da árvore), o algoritmo testa várias combinações de feature e limite (\"idade menor que 30?\", \"salário maior que 5000?\") e escolhe a que melhor separa as classes, deixando cada galho resultante o mais \"puro\" possível: com exemplos concentrados numa única classe, e não misturados.\n\nO scikit-learn mede essa pureza com um critério chamado impureza de Gini (o padrão do `DecisionTreeClassifier`), mas o nome importa menos que a ideia: a árvore sempre busca a pergunta que mais separa as classes naquele ponto, de forma gulosa, uma divisão de cada vez."
                    },
                    {
                        "type": "text",
                        "value": "## Da pergunta à decisão, e o formato da fronteira\n\nO processo se repete em cada galho novo, criando divisões sucessivas, até bater num critério de parada (uma folha ficar pura, ou a árvore atingir a profundidade máxima permitida). Cada **folha** guarda a classe mais comum entre os exemplos de treino que caíram ali, e é essa classe que a árvore prevê para qualquer exemplo novo que termine naquela folha.\n\nComo cada pergunta testa uma única feature contra um limite (\"maior que\" ou \"menor que\"), a fronteira de decisão de uma árvore é sempre formada por linhas retas perpendiculares aos eixos, um formato de degraus, bem diferente da reta única da regressão logística."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.tree import DecisionTreeClassifier\nimport pandas as pd\n\ndados = pd.DataFrame({\n    \"febre\": [1, 0, 1, 0, 1, 0, 1, 0],\n    \"tosse\": [1, 1, 0, 0, 1, 0, 1, 1],\n    \"diagnostico\": [\"gripe\", \"saudavel\", \"alergia\", \"saudavel\", \"gripe\", \"saudavel\", \"gripe\", \"alergia\"],\n})\n\nX = dados[[\"febre\", \"tosse\"]]\ny = dados[\"diagnostico\"]\n\nmodelo = DecisionTreeClassifier(max_depth=3, random_state=42)\nmodelo.fit(X, y)\n\nnovo_paciente = pd.DataFrame({\"febre\": [1], \"tosse\": [1]})\n\nprint(modelo.predict(novo_paciente))\n# ['gripe']\n\nprint(modelo.predict_proba(novo_paciente))\n# [[0. 1. 0.]]\n# colunas em ordem alfabética de classes_: alergia, gripe, saudavel"
                    },
                    {
                        "type": "text",
                        "value": "## O risco de deixar a árvore crescer demais\n\nSe nada limitar o crescimento, uma árvore de decisão pode continuar fazendo perguntas até cada folha conter um único exemplo de treino, decorado. O resultado é uma árvore gigante, cheia de galhos hiperespecíficos, que acerta 100% dos dados de treino e generaliza mal para dados novos: um caso claro de **overfitting**, o modelo aprendeu o ruído dos dados de treino, não só o padrão.\n\nPor isso o `DecisionTreeClassifier` aceita parâmetros como `max_depth` (profundidade máxima) para conter esse crescimento. O quanto limitar, e como perceber que a árvore decorou em vez de aprender, é assunto para o módulo 5, quando o overfitting ganha uma definição mais formal."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Algoritmo\",\"Intuição\",\"Precisa escalar features?\",\"Fácil de interpretar?\"],[\"Regressão logística\",\"Ajusta uma curva em S e devolve uma probabilidade\",\"Ajuda o treino, mas não é obrigatório\",\"Média: dá pra olhar os coeficientes\"],[\"k-NN (k-vizinhos)\",\"Vota pela classe dos k exemplos mais parecidos\",\"Sim, essencial: o algoritmo usa distância\",\"Baixa: não explica o motivo da previsão\"],[\"Árvore de decisão\",\"Faz perguntas sequenciais do tipo se/então\",\"Não precisa: não usa distância entre pontos\",\"Alta: dá pra desenhar e ler a árvore\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma árvore de decisão não esconde o motivo da resposta: o motivo é o caminho de perguntas que ela percorreu até a folha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma árvore de decisão classifica um exemplo novo por meio de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "uma sequência de perguntas do tipo se/então sobre as features.",
                                "isCorrect": true
                            },
                            {
                                "text": "uma equação linear que soma o peso de cada feature de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "o cálculo da distância até os exemplos mais próximos do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "uma média entre as previsões de vários modelos diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a árvore de decisão busca em cada divisão (nó) durante o treino?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "uma pergunta que separe as classes, deixando os galhos mais puros.",
                                "isCorrect": true
                            },
                            {
                                "text": "uma pergunta escolhida ao acaso entre as features disponíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "a feature cujo nome vem primeiro em ordem alfabética nos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "a divisão que deixa a árvore com o menor número de galhos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que árvores de decisão costumam ser consideradas fáceis de interpretar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "porque as regras de decisão dão pra ler e desenhar como um fluxograma.",
                                "isCorrect": true
                            },
                            {
                                "text": "porque elas sempre alcançam acurácia maior do que outros modelos.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque não precisam de nenhum dado de treino rotulado pra funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque o scikit-learn explica em texto cada previsão feita por elas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma árvore de decisão treinada sem limite de profundidade acerta 100% dos exemplos de treino, mas erra bastante em dados novos. Isso é sinal de:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "overfitting: a árvore decorou particularidades do treino, sem generalizar.",
                                "isCorrect": true
                            },
                            {
                                "text": "underfitting: a árvore é simples demais pra captar os padrões dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "vazamento de dados: o alvo foi usado sem querer como feature de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "um bug no scikit-learn, já que árvores nunca deveriam acertar tudo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparada à fronteira de decisão de uma regressão logística, a fronteira de uma árvore de decisão tende a ser:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "formada por linhas retas perpendiculares aos eixos, tipo um degrau.",
                                "isCorrect": true
                            },
                            {
                                "text": "sempre uma única reta diagonal, igual à da regressão logística.",
                                "isCorrect": false
                            },
                            {
                                "text": "uma curva suave em formato de S, ajustada aos dados de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "sempre igual, já que toda fronteira de decisão tem o mesmo formato.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O fluxo scikit-learn e predict_proba",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O mesmo fluxo, um resultado diferente\n\nO padrão que você viu na regressão (módulo 3) se repete aqui, exatamente igual: escolher o algoritmo, instanciar o modelo, chamar `fit(X_treino, y_treino)` para treinar, e `predict(X_novo)` para prever. Isso vale para `LogisticRegression`, `KNeighborsClassifier`, `DecisionTreeClassifier` e praticamente qualquer outro modelo do scikit-learn: a API é sempre a mesma, só muda o que a saída representa.\n\nNuma regressão, `predict()` devolve um número. Numa classificação, `predict()` devolve uma classe. E o método `score(X_teste, y_teste)`, que na regressão devolvia R2, aqui devolve **acurácia**: a fração de exemplos que o modelo classificou corretamente. Mas acurácia sozinha engana em vários casos comuns, como classes desbalanceadas, isso é assunto do módulo 5, o próximo desta trilha."
                    },
                    {
                        "type": "text",
                        "value": "## predict() decide, predict_proba() mostra a confiança\n\nAlém de `predict()`, os modelos de classificação do scikit-learn (regressão logística, k-NN, árvore de decisão, entre outros) também têm o método `predict_proba()`. A diferença:\n\n- `predict(X)` devolve a classe final, já decidida (aplicando o limiar por trás dos panos).\n- `predict_proba(X)` devolve a probabilidade estimada para cada classe, sem decidir nada, deixando essa decisão pra você.\n\nIsso importa porque duas previsões \"positivas\" podem ter confiança bem diferente: uma com probabilidade 0,51 e outra com 0,98 viram a mesma classe em `predict()`, mas contam histórias bem diferentes. Quando a decisão tem consequência (aprovar um empréstimo, sinalizar uma fraude), vale olhar `predict_proba()` antes de confiar cegamente na classe final."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\nimport pandas as pd\n\ndados = pd.DataFrame({\n    \"horas_estudo\": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1.5, 8.5],\n    \"aprovado\":     [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],\n})\n\nX = dados[[\"horas_estudo\"]]\ny = dados[\"aprovado\"]\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.25, random_state=42\n)\n\nmodelo = LogisticRegression()\nmodelo.fit(X_treino, y_treino)\n\nprint(modelo.score(X_teste, y_teste))\n# 1.0\n\nprint(modelo.classes_)\n# [0 1]\n\nnovos_alunos = pd.DataFrame({\"horas_estudo\": [3, 5.5, 8]})\nprint(modelo.predict(novos_alunos))\n# [0 1 1]\n\nprint(modelo.predict_proba(novos_alunos))\n# [[0.85 0.15]\n#  [0.45 0.55]\n#  [0.06 0.94]]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"predict()\",\"predict_proba()\"],[\"O que devolve\",\"A classe final escolhida pelo modelo\",\"A probabilidade estimada de cada classe\"],[\"Formato da saída\",\"Um rótulo por exemplo (ex.: \\\"gripe\\\")\",\"Uma lista de probabilidades por exemplo\"],[\"Quando usar\",\"Quando basta a decisão automática\",\"Quando quer ver a confiança ou ajustar o limiar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Três algoritmos, três formatos de fronteira\n\nVale juntar num só lugar o que ficou espalhado pelo módulo. A **fronteira de decisão** é a linha (ou superfície) imaginária que separa, no espaço das features, a região onde o modelo prevê uma classe da região onde ele prevê outra. Os três algoritmos deste módulo desenham essa linha de formas bem diferentes:\n\n- Regressão logística: uma reta (ou plano), porque a decisão vem de uma combinação linear das features.\n- k-NN: um contorno irregular, que muda com a densidade dos pontos ao redor e com o valor de `k`.\n- Árvore de decisão: um conjunto de retas perpendiculares aos eixos, em formato de degraus.\n\nNenhum formato é \"o melhor\" em todo problema: depende de como as classes de verdade se separam nos dados."
                    },
                    {
                        "type": "text",
                        "value": "## Não existe algoritmo vencedor universal\n\nVale terminar com uma honestidade importante: não existe um algoritmo de classificação que seja sempre o melhor, para qualquer conjunto de dados. Regressão logística é rápida e interpretável, mas só desenha fronteiras retas. k-NN se adapta a formatos complexos, mas depende de escala e fica lento com muitos dados. Árvore de decisão é fácil de explicar, mas sozinha tende a decorar o treino. A escolha depende do problema, do volume de dados e do quanto a interpretação importa, não existe atalho que substitua testar e comparar.\n\nE nenhum dos três é mágico: todos aprendem só o que os dados de treino mostram a eles. Com dados ruins, rótulos errados ou não representativos, mesmo o algoritmo certo produz um modelo ruim. O módulo 6 desta trilha volta a esse ponto, mostrando como preparar dados de verdade para um modelo."
                    },
                    {
                        "type": "quote",
                        "value": "predict() decide por você. predict_proba() mostra o quão confiante o modelo estava antes de decidir."
                    }
                ],
                "questions": [
                    {
                        "statement": "No scikit-learn, qual método devolve diretamente a classe final prevista por um modelo de classificação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O método `predict()`, que devolve o rótulo já decidido pelo modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O método `fit()`, que devolve o rótulo previsto logo após o treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O método `score()`, que devolve a acurácia do modelo nos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O atributo `classes_`, que devolve a lista de classes conhecidas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença central entre `predict()` e `predict_proba()` num modelo de classificação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`predict()` devolve a classe escolhida; `predict_proba()`, a probabilidade por classe.",
                                "isCorrect": true
                            },
                            {
                                "text": "`predict()` funciona só em regressão; `predict_proba()`, só em classificação binária.",
                                "isCorrect": false
                            },
                            {
                                "text": "`predict()` usa dados de treino; `predict_proba()` usa sempre dados de teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "`predict()` devolve texto; `predict_proba()` devolve somente números inteiros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual situação faz mais sentido consultar `predict_proba()` em vez de só `predict()`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "quando é preciso ajustar o limiar de decisão para a situação em questão.",
                                "isCorrect": true
                            },
                            {
                                "text": "quando o modelo usado é uma árvore de decisão, e nunca outro tipo.",
                                "isCorrect": false
                            },
                            {
                                "text": "quando os dados de treino e teste têm exatamente o mesmo tamanho.",
                                "isCorrect": false
                            },
                            {
                                "text": "quando o problema deixa de ser classificação e passa a ser regressão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo tem `classes_` igual a `[0, 1]` e `predict_proba()` devolve `[[0.3, 0.7]]` para um exemplo. O que esse resultado indica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "70% de probabilidade estimada de o exemplo pertencer à classe 1.",
                                "isCorrect": true
                            },
                            {
                                "text": "70% de acurácia geral do modelo, medida nos dados de teste inteiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "certeza total de que o exemplo pertence à classe 1, sem nenhuma dúvida.",
                                "isCorrect": false
                            },
                            {
                                "text": "30% dos exemplos de treino inteiros pertencem à classe 0, no total.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Diante de um novo problema de classificação, qual afirmação é mais correta sobre escolher entre regressão logística, k-NN e árvore de decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "não existe vencedor universal: a escolha depende dos dados e do problema.",
                                "isCorrect": true
                            },
                            {
                                "text": "a árvore de decisão deve ser sempre a primeira escolha, por ser mais simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "o k-NN deve ser evitado sempre, porque nunca funciona bem na prática.",
                                "isCorrect": false
                            },
                            {
                                "text": "a regressão logística só funciona quando existem mais de duas classes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Avaliar modelos de verdade",
        "aulas": [
            {
                "titulo": "Por que a acurácia engana",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O número que parece bom demais\n\nLá no Módulo 4 você treinou seus primeiros classificadores e usou `modelo.score(X_teste, y_teste)` pra saber se estavam bons. Esse número é a **acurácia**: a proporção de previsões certas sobre o total. Simples, direto e, em muitos casos, enganoso.\n\nImagine que alguém te diz: \"meu modelo detecta fraude em cartão de crédito com 99% de acurácia\". Parece ótimo, certo? Só que essa frase, sozinha, não diz quase nada sobre se o modelo é útil. Nesta aula você vai entender por quê."
                    },
                    {
                        "type": "text",
                        "value": "## Classes desbalanceadas\n\nMuitos problemas reais de classificação têm uma classe bem mais rara que a outra. Isso se chama **desbalanceamento de classes**:\n\n- Fraude em cartão de crédito: a esmagadora maioria das transações é legítima.\n- Diagnóstico de uma doença rara: quase todo mundo que faz o exame não tem a doença.\n- Detecção de spam em certos contextos: a maior parte do tráfego é email legítimo.\n\nNesses casos, a classe que a gente quer identificar (a fraude, a doença, o spam) é minoria nos dados. E é exatamente aí que a acurácia trai a gente."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.dummy import DummyClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\n# dataset desbalanceado: 99% classe 0 (\"não é fraude\"), 1% classe 1 (\"é fraude\")\nX, y = make_classification(\n    n_samples=5000,\n    n_features=10,\n    weights=[0.99, 0.01],\n    random_state=42,\n)\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.3, stratify=y, random_state=42\n)\n\n# modelo bobo: sempre prevê a classe mais frequente\nbobo = DummyClassifier(strategy=\"most_frequent\")\nbobo.fit(X_treino, y_treino)\npred_bobo = bobo.predict(X_teste)\n\nprint(\"Acurácia do modelo bobo:\", accuracy_score(y_teste, pred_bobo))\n# Acurácia do modelo bobo: 0.99\n\nprint(\"Casos da classe rara encontrados pelo bobo:\", pred_bobo.sum())\n# Casos da classe rara encontrados pelo bobo: 0\n\n# agora um modelo de verdade\nmodelo = LogisticRegression()\nmodelo.fit(X_treino, y_treino)\npred = modelo.predict(X_teste)\n\nprint(\"Acurácia do modelo real:\", accuracy_score(y_teste, pred))\n# Acurácia do modelo real: 0.985\n\nprint(\"Casos da classe rara encontrados pelo modelo real:\", pred.sum())\n# Casos da classe rara encontrados pelo modelo real: 7"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modelo\", \"Acurácia\", \"Encontrou algum caso da classe rara?\"], [\"Bobo (sempre prevê a maioria)\", \"0.99\", \"Não, nenhum\"], [\"Regressão logística real\", \"0.985\", \"Sim, várias vezes\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso acontece\n\nA acurácia trata todo acerto e todo erro do mesmo jeito: um ponto pra cada previsão certa, nada além disso. Ela não pergunta ERROU EM QUÊ. Quando 99% dos exemplos são de uma classe, um modelo que ignora completamente a outra classe ainda acerta quase tudo, porque a maioria dos exemplos são fáceis (são todos da classe majoritária).\n\nO problema não é a conta da acurácia estar errada. O problema é que ela esconde justamente os casos que mais importam: os raros, que geralmente são o motivo de você estar construindo o modelo."
                    },
                    {
                        "type": "text",
                        "value": "## A acurácia não é vilã\n\nIsso não quer dizer que acurácia é uma métrica ruim. Em problemas com classes equilibradas (tipo 50/50 ou 60/40), ela continua sendo uma medida razoável e fácil de explicar. O erro é usá-la sozinha, sem olhar a distribuição das classes e sem perguntar que TIPO de erro o modelo está cometendo. É exatamente isso que a matriz de confusão, na próxima aula, vai destrinchar."
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo com 99% de acurácia pode ser genial ou pode ser um modelo que nunca aprendeu nada e só repete a resposta mais comum. A acurácia sozinha não distingue os dois casos."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que um problema de classificação tem classes desbalanceadas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma classe aparece com frequência bem maior que a outra nos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo usa mais atributos pra prever uma classe do que a outra",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de treino tem mais linhas do que o conjunto de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "As métricas de avaliação retornam valores bem diferentes entre si",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de detecção de fraude tem 99,5% de acurácia, sabendo que só 0,5% das transações são fraudulentas. O que esse número, sozinho, sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o modelo provavelmente prevê sempre a classe majoritária, sem pegar fraude",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o modelo aprendeu a distinguir muito bem fraude de transação legítima",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a acurácia é, nesse caso, a métrica mais confiável pra comparar modelos",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o conjunto de dados usado no treino provavelmente estava balanceado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que comparar um modelo real com um DummyClassifier(strategy='most_frequent') é uma prática útil?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque ele serve de piso de comparação: um modelo só é bom se superar essa base",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ele treina mais rápido e por isso deve substituir o modelo real em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele ajusta automaticamente o desbalanceamento das classes antes do treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele calcula a matriz de confusão sem precisar dividir treino e teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um dataset com 98% de exemplos da classe A e 2% da classe B, um modelo real teve 96% de acurácia, menor que os 98% de um modelo bobo. Isso prova que o modelo real é pior?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não necessariamente: o modelo real pode estar acertando exemplos da classe B",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque acurácia menor sempre indica um modelo com pior capacidade preditiva",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque nesse cenário a acurácia é a única métrica capaz de medir qualidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque a acurácia do modelo bobo não pode ser calculada nesse cenário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual cenário a acurácia sozinha já é uma métrica razoável pra avaliar um classificador?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Quando as classes têm proporções parecidas e o custo dos erros é semelhante",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando uma das classes é rara, mas acertá-la importa mais que o restante",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o objetivo principal é nunca deixar passar um caso da classe rara",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o conjunto de dados tem muitas variáveis categóricas com categorias",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Matriz de confusão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Abrindo o acerto e o erro em quatro partes\n\nA acurácia responde só uma pergunta: quantas previsões o modelo acertou? A **matriz de confusão** responde uma pergunta bem mais útil: acertou e errou COMO? Ela cruza o que o modelo previu com o que realmente aconteceu, e separa o resultado em quatro grupos."
                    },
                    {
                        "type": "text",
                        "value": "## Os quatro grupos\n\nPense num exame de uma doença, em que a classe positiva é \"tem a doença\":\n\n- **Verdadeiro Positivo (VP):** o modelo disse \"tem a doença\" e a pessoa realmente tem.\n- **Verdadeiro Negativo (VN):** o modelo disse \"não tem\" e a pessoa realmente não tem.\n- **Falso Positivo (FP):** o modelo disse \"tem a doença\" mas a pessoa não tem (um alarme falso).\n- **Falso Negativo (FN):** o modelo disse \"não tem\" mas a pessoa tem (a doença passa batida).\n\nVP e VN são acertos. FP e FN são os dois jeitos diferentes de errar, e raramente têm o mesmo custo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Previsto: Negativo\", \"Previsto: Positivo\"], [\"Real: Negativo\", \"Verdadeiro Negativo (VN)\", \"Falso Positivo (FP)\"], [\"Real: Positivo\", \"Falso Negativo (FN)\", \"Verdadeiro Positivo (VP)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O custo de cada erro depende do problema\n\nNum exame de uma doença grave, o falso negativo costuma ser o pior erro: a pessoa sai achando que está saudável e não trata a doença a tempo. O falso positivo também tem custo (exames extras, ansiedade), mas geralmente é menor.\n\nJá num filtro de spam, a conta pode inverter: um falso positivo (um email importante indo pro spam sem o usuário ver) às vezes pesa mais do que um falso negativo (um spam que passa e vai pra caixa de entrada, chato mas inofensivo).\n\nNão existe uma regra universal. Antes de escolher qual erro evitar mais, você precisa entender o problema que está resolvendo."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.metrics import confusion_matrix\n\n# y_teste: o que realmente aconteceu (1 = tem a doença, 0 = não tem)\ny_teste = [1, 0, 1, 1, 0, 0, 1, 0, 0, 0]\ny_pred  = [1, 0, 0, 1, 0, 1, 1, 0, 0, 0]\n\nmatriz = confusion_matrix(y_teste, y_pred)\nprint(matriz)\n# [[5 1]\n#  [1 3]]"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a saída do scikit-learn\n\nPor padrão, `confusion_matrix(y_teste, y_pred)` organiza as classes em ordem crescente e coloca as classes REAIS nas linhas e as classes PREVISTAS nas colunas. No exemplo acima, a primeira linha é sobre quem realmente é da classe 0 (5 acertos como VN, 1 erro como FP) e a segunda linha é sobre quem realmente é da classe 1 (1 erro como FN, 3 acertos como VP).\n\nVale reforçar: a matriz sozinha não dá uma nota única pro modelo. Ela é a base pra calcular as métricas que resumem tudo isso em números comparáveis, o assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "A matriz de confusão não julga o modelo, ela só mostra os fatos: o que era o quê e o que o modelo disse que era. Julgar se isso é bom ou ruim depende do preço que cada erro tem no seu problema."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na matriz de confusão, o que caracteriza um falso positivo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O modelo previu a classe positiva, mas o valor real era negativo",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo previu a classe negativa, mas o valor real era positivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo acertou a previsão da classe positiva corretamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo errou a previsão das duas classes, positiva e negativa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num exame de uma doença grave, por que o falso negativo costuma ser considerado o erro mais perigoso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a pessoa doente sai achando que está saudável e não é tratada a tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a pessoa saudável precisa repetir o exame sem nenhuma necessidade real",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esse tipo de erro sempre torna o exame mais caro para o laboratório",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esse erro é sempre mais raro estatisticamente do que o falso positivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um filtro de spam analisa 1000 emails: marca 40 legítimos como spam (o usuário nunca vê) e deixa passar 5 spams reais na caixa de entrada. Qual erro pesa mais nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O falso positivo, porque emails legítimos ficam escondidos sem aviso",
                                "isCorrect": true
                            },
                            {
                                "text": "O falso negativo, porque os spams que passaram trazem mais risco",
                                "isCorrect": false
                            },
                            {
                                "text": "O verdadeiro positivo, porque identificar spam corretamente já é ruim",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois pesam igual, porque o que importa é só o total de 45 erros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na convenção padrão do confusion_matrix do scikit-learn, o que representam as linhas e as colunas da matriz retornada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Linhas são as classes reais e colunas são as classes previstas pelo modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Linhas são as classes previstas e colunas são as classes reais dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Linhas representam o treino e colunas representam o teste dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Linhas e colunas são intercambiáveis porque a matriz é sempre simétrica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dada a matriz de confusão [[5, 1], [1, 3]], em que a linha e a coluna 0 são a classe negativa e a linha e a coluna 1 são a classe positiva, quantos falsos negativos o modelo cometeu?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "1 falso negativo",
                                "isCorrect": true
                            },
                            {
                                "text": "3 falsos negativos",
                                "isCorrect": false
                            },
                            {
                                "text": "5 falsos negativos",
                                "isCorrect": false
                            },
                            {
                                "text": "4 falsos negativos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Precisão, recall e F1",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Resumindo a matriz de confusão em números\n\nA matriz de confusão é rica, mas incômoda de comparar entre modelos: ninguém quer decidir \"qual modelo é melhor\" olhando quatro números de cada vez. Precisão, recall e F1 pegam a mesma informação da matriz e resumem em números únicos, cada um respondendo uma pergunta diferente."
                    },
                    {
                        "type": "text",
                        "value": "## Precisão: quando o modelo diz \"sim\", dá pra confiar?\n\n**Precisão** = VP / (VP + FP). Ela responde: das vezes que o modelo previu a classe positiva, quantas realmente eram? Precisão alta significa poucos alarmes falsos.\n\nPriorize precisão quando um falso positivo é caro: por exemplo, marcar um conteúdo como impróprio e removê-lo sem necessidade, ou recomendar um investimento ruim como se fosse seguro."
                    },
                    {
                        "type": "text",
                        "value": "## Recall: quantos casos reais o modelo encontrou?\n\n**Recall** (também chamado de sensibilidade) = VP / (VP + FN). Ela responde: dos casos positivos que realmente existiam, quantos o modelo encontrou? Recall alto significa poucos casos deixados passar.\n\nPriorize recall quando um falso negativo é caro: diagnóstico de doença grave, detecção de fraude, qualquer situação em que deixar passar um caso real é pior do que investigar um caso que não era nada.\n\nOs dois costumam competir: um modelo mais \"generoso\" pra prever positivo tende a aumentar o recall e derrubar a precisão, e vice-versa. O F1-score existe pra resumir esse equilíbrio num único número."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Métrica\", \"Pergunta que responde\", \"Quando priorizar\"], [\"Precisão\", \"Das vezes que previu positivo, quantas acertou?\", \"Quando um alarme falso custa caro\"], [\"Recall\", \"Dos positivos reais, quantos foram encontrados?\", \"Quando deixar passar um caso custa caro\"], [\"F1-score\", \"Qual o equilíbrio entre precisão e recall?\", \"Quando as duas coisas importam parecido\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import classification_report\n\nX, y = make_classification(\n    n_samples=2000, n_features=10, weights=[0.9, 0.1], random_state=42\n)\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.3, stratify=y, random_state=42\n)\n\nmodelo = LogisticRegression()\nmodelo.fit(X_treino, y_treino)\ny_pred = modelo.predict(X_teste)\n\nprint(classification_report(y_teste, y_pred, target_names=[\"classe 0\", \"classe 1\"]))\n#               precision    recall  f1-score   support\n#\n#     classe 0       0.94      0.98      0.96       540\n#     classe 1       0.78      0.55      0.65        60\n#\n#     accuracy                           0.94       600\n#    macro avg       0.86      0.77      0.81       600\n# weighted avg       0.92      0.94      0.93       600"
                    },
                    {
                        "type": "text",
                        "value": "## ROC e AUC, por cima\n\nExiste outra forma de olhar esse trade-off: a curva ROC. Ela mostra como o recall e a taxa de falsos positivos mudam conforme você varia o limiar de decisão do modelo (lembra do `predict_proba` do Módulo 4? é ele que permite variar esse limiar, em vez de usar direto o `predict`). Como a plataforma não desenha gráficos, imagine uma linha que sobe da esquerda pra direita: quanto mais perto do canto superior esquerdo ela passa, melhor o modelo separa as classes em qualquer limiar escolhido.\n\nA **AUC** (area under the curve) resume essa curva inteira num número entre 0 e 1: 0,5 é o desempenho de um sorteio de moeda, 1,0 é separação perfeita. Na prática, calcula-se com `roc_auc_score(y_teste, probabilidades)`, usando a probabilidade da classe positiva, não a classe prevista."
                    },
                    {
                        "type": "quote",
                        "value": "Precisão sem recall esconde o que ficou de fora. Recall sem precisão esconde o alarme falso que você criou. Nenhuma métrica sozinha conta a história inteira."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o recall mede num problema de classificação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "De todos os positivos reais, quantos o modelo conseguiu identificar",
                                "isCorrect": true
                            },
                            {
                                "text": "De todas as previsões positivas, quantas realmente eram positivas",
                                "isCorrect": false
                            },
                            {
                                "text": "A proporção geral de acertos do modelo, somando as duas classes",
                                "isCorrect": false
                            },
                            {
                                "text": "A média harmônica entre a precisão e a taxa de erro do modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um exame de triagem de câncer precisa evitar ao máximo deixar passar um caso real, mesmo gerando mais exames desnecessários depois. Qual métrica deve ser priorizada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Recall alto, mesmo que isso derrube um pouco a precisão do modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Precisão alta, mesmo que isso derrube um pouco o recall do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Acurácia geral, porque ela já equilibra os dois tipos de erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente o F1-score, deixando de lado a precisão e o recall",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o F1-score usa a média harmônica entre precisão e recall, em vez de uma média simples?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque ela pune com mais força quando um dos dois valores é muito baixo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ela sempre resulta num valor maior do que a média simples",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a média simples não existe quando as classes são desbalanceadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ela ignora a classe minoritária no cálculo do resultado final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo tem precisão de 0,95 e recall de 0,20 na classe positiva. O que isso sugere sobre o comportamento dele?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele raramente prevê a classe positiva, mas acerta quando o faz",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele prevê a classe positiva com frequência e quase sempre erra",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele tem desempenho parecido e equilibrado entre as duas classes",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele está sofrendo overfitting grave no conjunto de treino usado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a curva ROC e a AUC de um classificador, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma AUC de 0,5 equivale ao desempenho de uma escolha aleatória",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma AUC de 0,5 indica que o modelo classifica tudo corretamente",
                                "isCorrect": false
                            },
                            {
                                "text": "A curva ROC substitui o cálculo separado de precisão e recall",
                                "isCorrect": false
                            },
                            {
                                "text": "A AUC só existe quando o modelo usa acurácia como métrica base",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Overfitting x underfitting: o trade-off viés-variância",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O aluno que decorou a prova\n\nImagine um aluno que decorou palavra por palavra as respostas de uma lista de exercícios, sem entender o raciocínio por trás. Na prova com as mesmas questões, ele vai bem. Numa prova com questões parecidas, mas diferentes, ele vai mal, porque não aprendeu o padrão, só decorou o exemplo.\n\nModelos de machine learning podem cometer o mesmo erro. E o oposto também é possível: um aluno que nem estudou o suficiente pra ir bem nem na prova que ele já tinha visto."
                    },
                    {
                        "type": "text",
                        "value": "## Overfitting: foi bem no treino, mal no teste\n\n**Overfitting** é quando o modelo se ajusta demais aos dados de treino, inclusive ao ruído e às particularidades daquele conjunto específico, em vez de aprender o padrão geral. O sinal clássico: desempenho ótimo no treino e desempenho bem pior no teste, uma diferença grande entre os dois.\n\nCostuma acontecer com modelos complexos demais pro tamanho ou pra complexidade real dos dados: uma árvore de decisão sem limite de profundidade, por exemplo, pode crescer até isolar cada exemplo de treino individualmente."
                    },
                    {
                        "type": "text",
                        "value": "## Underfitting: foi mal nos dois\n\n**Underfitting** é o oposto: o modelo é simples demais (ou os dados e as features não são suficientes) pra captar nem o padrão básico dos dados de treino. O sinal: desempenho baixo tanto no treino quanto no teste, geralmente parecido entre os dois.\n\nAqui o problema não é falta de generalização, é falta de aprendizado mesmo. O modelo não capturou nem o que já viu."
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off viés-variância\n\nEsses dois problemas têm nome técnico: **viés** (bias) é o erro que vem de suposições simples demais do modelo, o sintoma do underfitting. **Variância** é o erro que vem de o modelo ser sensível demais aos dados específicos de treino, o sintoma do overfitting: se você trocasse o conjunto de treino por outro parecido, o modelo mudaria bastante.\n\nO objetivo é equilibrar os dois: um modelo simples o suficiente pra generalizar, mas complexo o suficiente pra captar o padrão real. Não existe fórmula fixa pra esse ponto ideal, ele depende dos dados e é encontrado testando."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=1000, n_features=10, random_state=42)\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\nfor profundidade in [1, 3, 5, None]:\n    arvore = DecisionTreeClassifier(max_depth=profundidade, random_state=42)\n    arvore.fit(X_treino, y_treino)\n    score_treino = arvore.score(X_treino, y_treino)\n    score_teste = arvore.score(X_teste, y_teste)\n    print(f\"profundidade={profundidade} | treino={score_treino:.2f} | teste={score_teste:.2f}\")\n\n# profundidade=1    | treino=0.78 | teste=0.76\n# profundidade=3    | treino=0.89 | teste=0.85\n# profundidade=5    | treino=0.94 | teste=0.86\n# profundidade=None | treino=1.00 | teste=0.81"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Overfitting\", \"Underfitting\"], [\"Desempenho no treino\", \"Alto, às vezes quase perfeito\", \"Baixo\"], [\"Desempenho no teste\", \"Bem abaixo do treino\", \"Baixo, parecido com o treino\"], [\"Causa comum\", \"Modelo complexo demais pro problema\", \"Modelo simples demais pro problema\"], [\"Relação com viés-variância\", \"Variância alta\", \"Viés alto\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo com 100% de acerto no treino não é motivo de comemoração, é motivo de desconfiança. O que importa é como ele se sai no que nunca viu."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o overfitting num modelo de machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Desempenho muito bom no treino e bem pior no teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Desempenho ruim tanto no treino quanto no teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Desempenho parecido e bom nos dois conjuntos de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tempo de treinamento muito longo no scikit-learn",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo atinge 60% de acurácia no treino e 58% no teste. O que esse resultado sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Underfitting: o modelo não aprendeu nem o treino direito",
                                "isCorrect": true
                            },
                            {
                                "text": "Overfitting: o modelo decorou o treino e não consegue generalizar",
                                "isCorrect": false
                            },
                            {
                                "text": "Vazamento de dados: informação do teste vazou para o treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum problema, já que a diferença entre os dois é pequena",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trade-off viés-variância, o que representa uma variância alta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo é muito sensível aos dados de treino e muda bastante com eles",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo ignora os dados de treino e prevê de forma praticamente aleatória",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo usa poucas variáveis (features) pra tentar prever o resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo aplica suposições simples demais que não captam o padrão real",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma árvore sem limite de profundidade atinge 100% no treino e 81% no teste. Uma árvore com profundidade limitada atinge 94% no treino e 86% no teste. Qual generaliza melhor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A limitada, porque o teste é o que importa pra avaliar generalização",
                                "isCorrect": true
                            },
                            {
                                "text": "A sem limite, porque 100% no treino comprova que ela aprendeu bem",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas generalizam igual, já que a diferença está só no treino",
                                "isCorrect": false
                            },
                            {
                                "text": "A sem limite, porque quanto mais profunda, melhor ela capta os dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Reduzir a complexidade de um modelo que está com overfitting tende a que efeito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Diminuir a variância, deixando o treino e o teste mais parecidos",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a variância, afastando ainda mais o treino e o teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar de vez a necessidade de separar treino e teste em dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantir 100% de acurácia no teste em praticamente qualquer caso",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Validação cruzada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O problema de confiar em um único split\n\nDesde o Módulo 2 você separa os dados em treino e teste antes de avaliar um modelo, e por um bom motivo: avaliar no mesmo dado que treinou infla o resultado. Mas um único split também tem um problema: o score que você vê depende de QUAIS exemplos, por acaso, caíram no teste.\n\nCom pouco dado, isso pesa ainda mais: um split pode isolar por acaso os exemplos mais fáceis (score bonito, mas enganoso) ou os mais difíceis (score ruim, também enganoso) no conjunto de teste."
                    },
                    {
                        "type": "text",
                        "value": "## A ideia da validação cruzada\n\nA **validação cruzada** (cross-validation) resolve isso repetindo a divisão várias vezes. A versão mais comum é o **k-fold**: divide o conjunto de dados em k partes (folds) de tamanho parecido, e repete k vezes o processo de treinar com k-1 partes e testar na parte restante, trocando qual parte é o teste a cada rodada.\n\nNo final, em vez de um único score, você tem k scores. A média deles é uma estimativa mais confiável do desempenho do modelo, e o desvio entre eles mostra o quanto essa estimativa pode variar."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=1000, n_features=10, random_state=42)\n\nmodelo = LogisticRegression()\nscores = cross_val_score(modelo, X, y, cv=5)\n\nprint(scores)\n# [0.85 0.82 0.87 0.84 0.86]\n\nprint(f\"Média: {scores.mean():.2f} | Desvio padrão: {scores.std():.2f}\")\n# Média: 0.85 | Desvio padrão: 0.02"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Um único split\", \"Validação cruzada (k-fold)\"], [\"Quantas vezes treina\", \"1\", \"k vezes (comum: 5 ou 10)\"], [\"Estimativa\", \"Um número só, pode ser sorte ou azar\", \"Média de k números, mais estável\"], [\"Custo computacional\", \"Baixo\", \"k vezes maior\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que a validação cruzada não resolve\n\nCross-validation dá uma estimativa melhor, mas não é mágica. Ela custa k vezes mais processamento, porque treina o modelo do zero em cada fold. E se você usa a validação cruzada repetidamente pra ESCOLHER entre modelos ou ajustar parâmetros, e depois reporta esse mesmo resultado como o desempenho final, a estimativa tende a ficar otimista: os dados de validação acabaram influenciando a escolha, mesmo sem serem usados diretamente no treino. Por isso, em projetos mais rigorosos, ainda se reserva um conjunto de teste final, que só é usado uma vez, no fim de tudo."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o Módulo 5\n\nVocê agora sabe desconfiar de um número de acurácia isolado, ler uma matriz de confusão, calcular e interpretar precisão, recall e F1, reconhecer os sinais de overfitting e underfitting, e avaliar um modelo de um jeito mais confiável com validação cruzada. É a caixa de ferramentas que separa quem só chama `.fit()` de quem sabe se o modelo realmente presta.\n\nNo próximo módulo, o foco muda pros dados que alimentam o modelo: escalar variáveis, codificar categorias, tratar valores faltantes e, principalmente, evitar que informação do teste vaze pro treino, usando os Pipelines do scikit-learn."
                    },
                    {
                        "type": "quote",
                        "value": "Confiar em um único split é julgar um aluno por uma prova só. A validação cruzada aplica várias provas parecidas e olha a média: o que sobra depois disso conta muito mais sobre o que o modelo realmente aprendeu."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a validação cruzada (k-fold) faz, na prática?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Treina e avalia o modelo várias vezes, trocando qual parte é o teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Treina o modelo uma única vez, usando todos os dados disponíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolhe automaticamente o melhor algoritmo entre vários candidatos",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina de vez a necessidade de separar treino e teste nos dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma estimativa de validação cruzada costuma ser mais confiável que a de um único split?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque reduz o efeito de um split ter caído fácil ou difícil demais",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ela sempre aumenta a acurácia final do modelo testado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ela treina o modelo com mais dados do que qualquer split",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ela elimina de vez a variância entre as partes dos dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar cross_val_score com cv=5, os 5 scores voltam bem diferentes entre si, de 0,60 a 0,95. O que isso sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o desempenho do modelo é instável entre partes diferentes dos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o modelo tem desempenho excelente e consistente em qualquer parte",
                                "isCorrect": false
                            },
                            {
                                "text": "Que houve um erro de sintaxe na chamada da função cross_val_score",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o parâmetro cv=5 deveria virar cv=1 pra corrigir o problema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é uma limitação real da validação cruzada, na prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Custa k vezes mais processamento: treina o modelo do zero em cada fold",
                                "isCorrect": true
                            },
                            {
                                "text": "Não pode ser usada em problemas de classificação, apenas de regressão",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui por completo a necessidade de um conjunto de teste reservado",
                                "isCorrect": false
                            },
                            {
                                "text": "Só entrega resultado correto quando o conjunto de dados está balanceado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados usa validação cruzada só pra escolher entre modelos e ajustar parâmetros, e depois relata essa mesma média como o desempenho final esperado, sem testar em nenhum dado à parte. Qual o risco dessa prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A estimativa pode ficar otimista, pois os mesmos dados guiaram a escolha",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco, pois a validação cruzada já equivale a um teste reservado",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco só existe quando o cv usado é maior que 10 partes dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "A validação cruzada torna a divisão treino/teste desnecessária ali",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Preparar dados para o modelo",
        "aulas": [
            {
                "titulo": "Features boas: garbage in, garbage out",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Features boas: garbage in, garbage out\n\nAté aqui você aprendeu a treinar modelos de regressão e de classificação, avaliar com as métricas certas e reconhecer overfitting. Lá no módulo 2 apareceu uma regra que não sai mais da cabeça: o teste só serve como avaliação honesta se continuar sendo um dado que o modelo nunca viu. Este módulo pega esse mesmo cuidado e estende pra uma etapa que vem antes do treino: preparar os dados.\n\nA primeira parada é uma verdade que separa projeto de ML que funciona do que não funciona: o algoritmo importa menos do que a qualidade das variáveis, as features, que você entrega pra ele. Um Random Forest sofisticado treinado com features ruins costuma perder pra uma regressão linear simples treinada com features boas.\n\nEssa ideia tem um nome conhecido na área: **garbage in, garbage out** (lixo entra, lixo sai). Se as variáveis que descrevem seus exemplos não carregam informação relacionada ao que você quer prever, nenhum algoritmo cria essa informação do nada. Não existe truque de modelagem que compense dado sem sinal."
                    },
                    {
                        "type": "text",
                        "value": "## O que é feature engineering\n\nFeature engineering é o processo de criar, transformar e selecionar as variáveis que entram no modelo. Não é sobre escolher o algoritmo, é sobre preparar a matéria-prima que o algoritmo recebe. Alguns exemplos comuns: extrair mês, dia da semana ou se é fim de semana a partir de uma data completa; calcular IMC a partir de altura e peso; reduzir um endereço completo só ao bairro ou à cidade; contar palavras ou detectar termos específicos dentro de um texto livre.\n\nLembra do DataFrame que você limpou e manipulou na trilha de Análise de Dados? Feature engineering usa esse mesmo tipo de manipulação com `pandas`, mas com um objetivo específico: criar colunas que ajudem o modelo a enxergar um padrão que você já sabe, ou suspeita, que existe nos dados."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    'data_venda': ['2024-01-06', '2024-06-20', '2024-12-24'],\n    'preco': [250000, 310000, 480000],\n    'area_m2': [65, 80, 120]\n})\n\ndf['data_venda'] = pd.to_datetime(df['data_venda'])\ndf['mes_venda'] = df['data_venda'].dt.month\ndf['fim_de_semana'] = df['data_venda'].dt.dayofweek >= 5\ndf['preco_por_m2'] = df['preco'] / df['area_m2']\n\nprint(df[['mes_venda', 'fim_de_semana', 'preco_por_m2']])\n#    mes_venda  fim_de_semana  preco_por_m2\n# 0          1           True   3846.153846\n# 1          6          False   3875.000000\n# 2         12          False   4000.000000"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dado bruto\", \"Feature criada\", \"Por que ajuda o modelo\"], [\"Data completa (2024-01-06)\", \"Mês da venda e se é fim de semana\", \"O modelo não interpreta texto de data, mas aprende padrões sazonais representados em números\"], [\"Altura e peso em colunas separadas\", \"IMC (peso dividido pela altura ao quadrado)\", \"Junta duas variáveis numa métrica já validada, mais direta do que as duas isoladas\"], [\"Endereço completo por extenso\", \"Bairro ou cidade\", \"Reduz uma variável quase única por linha a categorias que se repetem e formam padrão\"], [\"Total gasto e tempo de casa separados\", \"Gasto médio mensal (total dividido pelo tempo)\", \"Revela diferenças de padrão de consumo que as duas colunas isoladas escondiam\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os limites: feature engineering não é mágica\n\nMesmo a melhor feature engineering não compensa dados coletados errado, com viés, ou que simplesmente não têm relação nenhuma com o que você quer prever. Se o objetivo é prever se um cliente vai cancelar a assinatura, mas o único dado disponível é o nome dele, nenhuma transformação vai conjurar esse sinal do nada. Feature engineering reorganiza e destaca informação que já existe nos dados, ela não cria informação que nunca foi coletada.\n\nEssa ideia conecta direto com o resto do módulo: antes de sair trocando de algoritmo atrás de mais desempenho, vale investir tempo entendendo e preparando bem as variáveis que você já tem."
                    },
                    {
                        "type": "code",
                        "value": "df_clientes = pd.DataFrame({\n    'meses_como_cliente': [2, 24, 6, 48],\n    'total_gasto': [150, 4800, 900, 9600]\n})\n\ndf_clientes['gasto_medio_mensal'] = (\n    df_clientes['total_gasto'] / df_clientes['meses_como_cliente']\n)\n\nprint(df_clientes)\n#    meses_como_cliente  total_gasto  gasto_medio_mensal\n# 0                    2          150                75.0\n# 1                   24         4800               200.0\n# 2                    6          900               150.0\n# 3                   48         9600               200.0\n# duas empresas com total gasto e tempo de casa bem diferentes\n# podem ter o mesmo gasto médio mensal: a nova feature revela\n# uma semelhança que as colunas originais, isoladas, escondiam"
                    },
                    {
                        "type": "quote",
                        "value": "Um algoritmo sofisticado não conserta features ruins, mas features boas fazem até um modelo simples brilhar. Antes de trocar de algoritmo, pergunte se você já tirou o máximo de sinal dos seus dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa a expressão \"garbage in, garbage out\" aplicada a machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dados sem informação relevante sobre o alvo não geram boas previsões, não importa o algoritmo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um modelo salvo com o disco corrompido nunca mais consegue ser carregado pelo scikit-learn.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todo dataset precisa ser limpo com pandas antes de ser lido pela linguagem Python.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quanto mais colunas um dataset tiver, pior o desempenho de qualquer modelo treinado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é feature engineering, no contexto de um projeto de machine learning?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O processo de criar e transformar variáveis pra que carreguem mais sinal útil sobre o alvo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O processo de escolher entre regressão e classificação, de acordo com o tipo da variável alvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O processo de ajustar os hiperparâmetros do algoritmo depois que o modelo já foi treinado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O processo de dividir o dataset em treino e teste antes de qualquer outra etapa do projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que extrair \"mês da venda\" e \"dia da semana\" a partir de uma data completa costuma ajudar um modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o modelo não interpreta texto de data, mas aprende padrões sazonais representados em números.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque colunas de data sempre atrapalham o cálculo de correlação entre as variáveis do dataset.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o scikit-learn exige que toda variável de entrada tenha o mesmo formato de número inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque datas completas ocupam muito mais espaço em memória do que qualquer outra variável.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer prever se um cliente vai cancelar a assinatura, mas o único dado disponível é o nome do cliente. Feature engineering bem feita resolve esse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, porque feature engineering reorganiza informação que já existe nos dados, sem criar sinal novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, combinando várias transformações do nome é possível chegar a um sinal forte de cancelamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só se o nome for convertido antes pra letras maiúsculas e sem nenhuma acentuação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque feature engineering só se aplica a problemas de regressão, nunca de classificação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas empresas clientes têm o mesmo total gasto e o mesmo tempo de casa em meses, mas perfis de consumo bem diferentes. Criar a feature \"gasto médio mensal\" ajuda nesse caso porque...",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Junta duas variáveis brutas numa métrica que pode revelar diferenças que cada uma escondia sozinha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substitui a necessidade de escalar as variáveis antes de treinar qualquer modelo de classificação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina automaticamente qualquer outlier presente nas colunas originais de gasto e de tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que o modelo vai atingir uma acurácia mais alta do que usando as duas colunas separadas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escalar e padronizar variáveis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que a escala das variáveis importa\n\nImagine um dataset de clientes com duas colunas: idade (variando de 18 a 90) e renda mensal (variando de 0 a 50000). Se você usar k-NN pra encontrar os clientes mais parecidos, o algoritmo calcula a distância entre pontos considerando todas as colunas ao mesmo tempo. Só que renda varia na casa dos milhares e idade varia na casa das dezenas: a distância acaba sendo dominada quase inteiramente pela renda. Pro k-NN, um cliente de 20 anos e um de 80 anos podem parecer \"vizinhos\" só porque a diferença de renda entre eles é pequena, mesmo com 60 anos de diferença de idade.\n\nIsso não é exclusividade do k-NN. Regressão logística com regularização (aquela que penaliza coeficientes grandes pra evitar overfitting) também sofre: se uma variável tem escala muito maior que as outras, a penalização trata ela de um jeito desproporcional. Já algoritmos baseados em árvore (decision tree, Random Forest) não têm esse problema, porque decidem cada corte olhando uma variável de cada vez, sem calcular distância entre pontos."
                    },
                    {
                        "type": "text",
                        "value": "## StandardScaler: média 0 e desvio padrão 1\n\nA padronização (standardization) transforma cada variável pra que ela passe a ter média 0 e desvio padrão 1. A fórmula por trás é simples: z = (x menos a média) dividido pelo desvio padrão. Se isso lembra o z-score que apareceu na trilha de Estatística, é exatamente a mesma ideia: cada valor passa a representar quantos desvios padrão ele está distante da média.\n\nSe você plotasse um histograma da variável antes e depois do StandardScaler, o formato da distribuição continuaria o mesmo, só o eixo mudaria: em vez de valores em reais ou em anos, os valores passam a representar desvios padrão em torno de zero.\n\n**A regra vale pra qualquer scaler: ajuste (fit) só com os dados de treino, e aplique (transform) essa mesma transformação no treino e no teste.** Nunca chame `fit` ou `fit_transform` usando o conjunto de teste, nem o dataset inteiro antes de dividir. A aula 5 deste módulo explica em detalhe por que isso é tão importante."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import train_test_split\nimport pandas as pd\n\ndf = pd.DataFrame({\n    'idade': [22, 35, 45, 60, 28, 51],\n    'renda_mensal': [2200, 5400, 8900, 12000, 3100, 9500]\n})\n\nX_treino, X_teste = train_test_split(df, test_size=0.33, random_state=42)\n\nscaler = StandardScaler()\nscaler.fit(X_treino)  # calcula média e desvio padrão só com o treino\n\nX_treino_escalado = scaler.transform(X_treino)\nX_teste_escalado = scaler.transform(X_teste)\n\nprint(X_treino_escalado.mean(axis=0))\n# [0. 0.]\nprint(X_treino_escalado.std(axis=0))\n# [1. 1.]"
                    },
                    {
                        "type": "text",
                        "value": "## MinMaxScaler: comprimindo pra um intervalo fixo\n\nOutra forma comum de escalar é o MinMaxScaler, que comprime os valores pra um intervalo fixo, geralmente entre 0 e 1. A fórmula: cada valor menos o mínimo, dividido pela diferença entre o máximo e o mínimo da variável. O menor valor vira 0, o maior vira 1, e todo o resto fica proporcional entre eles.\n\nA diferença prática entre os dois: o StandardScaler é a escolha mais comum por padrão, e lida razoavelmente bem com a maioria dos casos. Já o MinMaxScaler é mais sensível a outliers, porque um único valor extremo define o mínimo ou o máximo, e comprime todos os outros valores pra perto do outro extremo. Ele costuma ser preferido quando você precisa mesmo de valores dentro de um intervalo limitado, como em algumas redes neurais."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.preprocessing import MinMaxScaler\n\nscaler_mm = MinMaxScaler()\nscaler_mm.fit(X_treino)  # calcula mínimo e máximo só com o treino\n\nX_treino_normalizado = scaler_mm.transform(X_treino)\nX_teste_normalizado = scaler_mm.transform(X_teste)\n\nprint(X_treino_normalizado.min(axis=0))\n# [0. 0.]\nprint(X_treino_normalizado.max(axis=0))\n# [1. 1.]\n\nprint(X_teste_normalizado.min(axis=0))\n# valores do teste podem ficar abaixo de 0 ou acima de 1 se algum\n# cliente do teste tiver idade ou renda fora do intervalo visto no\n# treino, e isso é esperado: o intervalo [0, 1] só vale pro treino"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Sensível à escala?\", \"O que fazer\"], [\"k-NN (distância entre pontos)\", \"Sim, bastante\", \"Escalar sempre, com StandardScaler ou MinMaxScaler\"], [\"Regressão logística com regularização\", \"Sim\", \"Escalar antes de treinar, senão a penalização pesa errado\"], [\"Regressão linear simples, sem regularização\", \"Pouco\", \"Escalar ajuda a interpretar coeficientes, mas não é obrigatório\"], [\"Árvore de decisão e Random Forest\", \"Não\", \"Escalar não muda o resultado, os cortes são por variável isolada\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Escalar uma variável não muda a informação que ela carrega, só a régua usada pra medir. Mas pra algoritmos que calculam distância, essa régua faz toda a diferença."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o k-NN é sensível à escala das variáveis?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque ele calcula distância entre pontos, e valores maiores acabam dominando essa distância.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ele só aceita valores entre 0 e 1 como entrada, do mesmo jeito que uma probabilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele treina visivelmente mais devagar quando as variáveis estão em escalas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele exige que todas as variáveis sigam uma distribuição normal pra funcionar direito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença principal entre StandardScaler e MinMaxScaler?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "StandardScaler centra os dados em média 0 e desvio 1; MinMaxScaler comprime pra um intervalo fixo.",
                                "isCorrect": true
                            },
                            {
                                "text": "StandardScaler funciona só com variáveis categóricas; MinMaxScaler só com variáveis numéricas.",
                                "isCorrect": false
                            },
                            {
                                "text": "StandardScaler remove outliers automaticamente; MinMaxScaler mantém todos os valores originais.",
                                "isCorrect": false
                            },
                            {
                                "text": "StandardScaler precisa do dataset dividido antes; MinMaxScaler pode ser usado no dataset inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você ajustou o StandardScaler usando o dataset inteiro, antes de dividir em treino e teste. Qual o problema mais direto disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A média e o desvio usados pra escalar já enxergaram o teste, e a avaliação deixa de ser isenta.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo treinado passa a demorar visivelmente mais tempo pra convergir durante o treinamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O StandardScaler lança um erro de execução quando é ajustado antes do train_test_split.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados de treino e de teste ficam com um número diferente de colunas depois da transformação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dataset de salários tem um outlier grande, um diretor ganhando muito mais que o resto do time. Qual scaler tende a ser mais afetado por esse outlier?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "MinMaxScaler, porque o outlier vira o máximo e comprime o resto pra perto de zero.",
                                "isCorrect": true
                            },
                            {
                                "text": "StandardScaler, porque a média sobe tanto que todos os outros valores somem da escala.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois, porque scalers lineares não são sensíveis a outliers de forma nenhuma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos são afetados de forma idêntica, já que os dois usam exatamente a mesma fórmula.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados não escala as variáveis antes de treinar um Random Forest, mas escala antes de treinar uma regressão logística regularizada. Essa escolha faz sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, árvores dividem por variável isolada e não usam distância, e a regularização é sensível à escala.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, todo algoritmo de machine learning exige as variáveis na mesma escala pra funcionar direito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, escalar sempre muda o resultado final de qualquer modelo, então a escolha deveria ser igual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só porque Random Forest treina mais rápido, sem relação nenhuma com escala.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Codificar categóricas: one-hot encoding",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Modelos só entendem números\n\nOs exemplos até aqui usaram variáveis numéricas: idade, renda, área. Mas boa parte dos dados do mundo real vem em categorias: cidade, cor do produto, tipo de plano, nível de escolaridade. Nenhum algoritmo do scikit-learn sabe calcular distância ou multiplicar coeficiente pela palavra \"São Paulo\". Antes de treinar, toda variável categórica precisa virar número.\n\nA tentação mais simples é trocar cada categoria por um número sequencial: São Paulo = 0, Rio de Janeiro = 1, Belo Horizonte = 2. O problema é que isso cria uma relação de ordem e de distância que não existe de verdade: o modelo pode aprender que \"Belo Horizonte é o dobro de São Paulo\", o que não faz sentido nenhum pra uma variável sem ordem natural entre as categorias.\n\n## Categorias nominais e ordinais pedem tratamento diferente\n\nCategorias nominais não têm ordem entre si: cidade, cor, forma de pagamento. Pra essas, a codificação correta é o one-hot encoding: cada categoria vira uma coluna binária própria (0 ou 1), sem sugerir ordem nenhuma entre elas. Já categorias ordinais têm uma ordem natural: nível de escolaridade, nota de satisfação, tamanho de roupa (P, M, G). Pra essas, um mapeamento numérico que preserve a ordem costuma fazer mais sentido do que criar uma coluna pra cada valor."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    'escolaridade': ['Médio', 'Fundamental', 'Superior', 'Médio']\n})\n\nmapa_ordem = {'Fundamental': 0, 'Médio': 1, 'Superior': 2}\ndf['escolaridade_num'] = df['escolaridade'].map(mapa_ordem)\n\nprint(df)\n#   escolaridade  escolaridade_num\n# 0        Médio                 1\n# 1  Fundamental                 0\n# 2     Superior                 2\n# 3        Médio                 1"
                    },
                    {
                        "type": "code",
                        "value": "df_cidade = pd.DataFrame({\n    'cidade': ['São Paulo', 'Rio de Janeiro', 'São Paulo', 'Belo Horizonte']\n})\n\ndf_codificado = pd.get_dummies(df_cidade, columns=['cidade'])\nprint(df_codificado)\n#    cidade_Belo Horizonte  cidade_Rio de Janeiro  cidade_São Paulo\n# 0                   False                  False               True\n# 1                   False                   True              False\n# 2                   False                  False               True\n# 3                    True                  False              False"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.preprocessing import OneHotEncoder\n\ncidade_treino = pd.DataFrame({'cidade': ['São Paulo', 'Rio de Janeiro', 'São Paulo']})\ncidade_teste = pd.DataFrame({'cidade': ['Belo Horizonte', 'São Paulo']})\n\nencoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)\nencoder.fit(cidade_treino)  # só aprende as categorias do treino\n\nprint(encoder.get_feature_names_out())\n# ['cidade_Rio de Janeiro' 'cidade_São Paulo']\n\nprint(encoder.transform(cidade_teste))\n# [[0. 0.]\n#  [0. 1.]]\n# \"Belo Horizonte\" não existia no treino: com handle_unknown='ignore',\n# a linha fica zerada nessa categoria, em vez de gerar erro"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de variável\", \"Exemplo\", \"Como codificar\"], [\"Nominal, sem ordem entre categorias\", \"Cidade, cor, forma de pagamento\", \"One-hot encoding, com get_dummies ou OneHotEncoder\"], [\"Ordinal, com ordem natural\", \"Escolaridade, satisfação, tamanho P/M/G\", \"Mapeamento numérico que preserva a ordem entre as categorias\"], [\"Alta cardinalidade, muitas categorias únicas\", \"CEP, ID de produto, nome de usuário\", \"Agrupar categorias raras antes, ou repensar se a coluna deve entrar assim\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado com a explosão de colunas\n\nQuando uma variável categórica tem muitos valores únicos (CEP, ID de produto, nome de usuário), o one-hot encoding cria uma coluna pra cada categoria, e o dataset pode ganhar milhares de colunas esparsas (quase todas com zero). Isso encarece o treinamento e pode até prejudicar o desempenho do modelo, em vez de ajudar. Antes de aplicar one-hot direto numa variável assim, vale considerar agrupar as categorias raras numa classe \"outros\" ou repensar se aquela coluna, do jeito que está, deveria mesmo entrar no modelo.\n\nUma variação comum é usar `get_dummies(df, columns=[...], drop_first=True)`, que descarta a primeira coluna de cada variável codificada. Como as colunas restantes já deixam essa categoria implícita (todas as outras zeradas), isso evita redundância sem perder informação."
                    },
                    {
                        "type": "quote",
                        "value": "Categoria sem ordem vira coluna binária, categoria com ordem vira número que respeita essa ordem. Confundir os dois ensina ao modelo uma matemática que não existe nos dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que é preciso codificar variáveis categóricas antes de treinar a maioria dos modelos do scikit-learn?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque os algoritmos fazem operações matemáticas com os dados e não processam texto diretamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Python não permite guardar texto dentro de um array do numpy em nenhuma hipótese.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque codificar categorias deixa o treinamento do modelo mais rápido em qualquer situação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só modelos de classificação aceitam variáveis numéricas, os de regressão aceitam texto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual o problema de simplesmente trocar cada cidade por um número sequencial (São Paulo=0, Rio=1, Salvador=2) numa variável nominal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo passa a enxergar ordem e distância entre categorias que não existe de verdade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, contanto que o número máximo seja menor que a quantidade de linhas do dataset.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo demora mais pra treinar porque precisa converter os números de volta pra texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn recusa treinar o modelo quando encontra números atribuídos a categorias.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quando faz mais sentido usar um mapeamento numérico simples (Fundamental=0, Médio=1, Superior=2) em vez de one-hot encoding?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quando a categoria é ordinal, ou seja, quando existe uma ordem natural entre os valores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando a variável tem muitas categorias diferentes e o dataset é relativamente pequeno.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o modelo escolhido é uma árvore de decisão, porque árvores não aceitam one-hot.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o objetivo do projeto é regressão, porque classificação não aceita mapeamento numérico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você usa OneHotEncoder, ajusta com o treino e transforma treino e teste. No teste aparece uma categoria de cidade que não existia no treino. O que acontece com handle_unknown='ignore'?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As colunas dessa categoria nova ficam todas com zero, sem gerar erro no processamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O encoder cria automaticamente uma nova coluna pra representar essa categoria inédita.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn lança um erro e interrompe a execução, porque a categoria não existia no treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A linha inteira é removida do conjunto de teste antes de calcular qualquer métrica do modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma variável de CEP tem 8000 valores únicos num dataset de 10000 linhas. Qual a consequência mais provável de aplicar one-hot direto nela, sem tratamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O dataset ganha milhares de colunas esparsas, o que aumenta muito a dimensionalidade do problema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma, one-hot encoding sempre gera o mesmo número de colunas, independente da cardinalidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo passa a tratar o CEP automaticamente como uma variável ordinal, com ordem geográfica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pandas converte a coluna de CEP direto pra tipo numérico, sem criar nenhuma coluna nova.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dados faltantes e imputação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dados faltantes não desaparecem sozinhos\n\nNa trilha de Análise de Dados você aprendeu a identificar valores faltantes com `isna()` e a lidar com eles usando `dropna()` ou `fillna()`. Agora, no contexto de treinar um modelo, essa decisão fica ainda mais importante: a maioria dos algoritmos do scikit-learn simplesmente não aceita `NaN` como entrada e lança um erro na hora do `fit`. Ignorar o problema não é opção, ele trava o treinamento antes mesmo de começar."
                    },
                    {
                        "type": "text",
                        "value": "## Duas saídas possíveis: remover ou imputar\n\nA primeira saída é remover: descartar linhas (ou colunas) que têm valores faltantes, com `dropna()`. É simples, mas tem custo: se os valores faltantes forem comuns, você perde muitos dados, e se a falta não for aleatória (por exemplo, clientes com renda mais baixa tendem a não informar a renda), remover introduz um viés no dataset que sobra.\n\nA segunda saída é imputar: preencher o valor faltante com uma estimativa calculada a partir dos dados que você tem (média, mediana, valor mais frequente, ou um valor fixo). Isso preserva a linha inteira, mas troca um buraco por uma suposição: o valor imputado não é o valor real que faltou, é a melhor estimativa possível dado o resto dos dados."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport pandas as pd\nfrom sklearn.impute import SimpleImputer\n\nX_treino = pd.DataFrame({\n    'idade': [25, np.nan, 40, 35],\n    'renda': [3000, 4500, np.nan, 5200]\n})\nX_teste = pd.DataFrame({\n    'idade': [np.nan, 50],\n    'renda': [2800, 6100]\n})\n\nimputer = SimpleImputer(strategy='median')\nimputer.fit(X_treino)  # calcula a mediana só com o treino\n\nX_treino_imputado = imputer.transform(X_treino)\nX_teste_imputado = imputer.transform(X_teste)\n\nprint(X_treino_imputado)\n# idade: mediana do treino (ignorando o NaN) é 35.0\n# renda: mediana do treino (ignorando o NaN) é 4500.0\n# [[  25.  3000.]\n#  [  35.  4500.]\n#  [  40.  4500.]\n#  [  35.  5200.]]\n\nprint(X_teste_imputado)\n# [[  35.  2800.]\n#  [  50.  6100.]]\n# o 35.0 usado aqui é a mediana calculada no treino, não uma\n# mediana recalculada com os dados de teste"
                    },
                    {
                        "type": "code",
                        "value": "categorias = pd.DataFrame({\n    'plano': ['básico', np.nan, 'premium', 'básico', np.nan]\n})\n\nimputer_cat = SimpleImputer(strategy='most_frequent')\ncategorias_imputadas = imputer_cat.fit_transform(categorias)\n\nprint(categorias_imputadas)\n# [['básico']\n#  ['básico']\n#  ['premium']\n#  ['básico']\n#  ['básico']]\n# a categoria mais frequente ('básico') preencheu os NaN\n# (aqui fit_transform foi usado só pra ilustrar a mecânica num\n# dataset único; no fluxo real, o fit é sempre feito com o treino)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\", \"Quando usar\", \"Risco\"], [\"Remover a linha (dropna)\", \"Poucos valores faltantes, e de forma aleatória\", \"Perde dados, e pode enviesar se a falta não for aleatória\"], [\"Imputar com a média\", \"Variável numérica sem outliers fortes\", \"Outliers puxam a média pra longe do valor típico da variável\"], [\"Imputar com a mediana\", \"Variável numérica com outliers ou assimetria\", \"Ainda é uma estimativa, não recupera o valor real perdido\"], [\"Imputar com o mais frequente\", \"Variável categórica\", \"Pode reforçar demais a categoria que já era dominante\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O efeito no modelo e o cuidado de sempre\n\nImputar não é uma operação neutra. Preencher todos os valores faltantes de idade com a mesma média reduz a variância real da variável, e se muitos valores faltarem, o modelo passa a enxergar uma quantidade artificial de gente exatamente \"na média\". Em datasets onde a própria ausência do dado carrega informação (como no exemplo da renda), imputar sem pensar nisso pode até esconder um padrão que seria útil pro modelo aprender.\n\nE, como já apareceu nas aulas anteriores: o imputer também segue a regra de ajustar só com o treino. Calcular a média ou a mediana olhando também o conjunto de teste faz essa estatística \"vazar\" informação que o modelo não deveria ter na hora de ser avaliado."
                    },
                    {
                        "type": "quote",
                        "value": "Preencher um valor faltante é fazer uma aposta educada, não recuperar o dado verdadeiro. Escolha a estratégia sabendo o que ela assume, e calcule sempre a partir do treino."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que geralmente acontece se você tenta treinar um modelo do scikit-learn com uma coluna que tem valores NaN?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A maioria dos algoritmos lança um erro e não consegue completar o treinamento do modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo ignora automaticamente as linhas com NaN e treina normalmente com o restante.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn substitui o NaN pela média da coluna de forma automática, sem avisar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo trata o NaN como se fosse zero, sem gerar nenhum tipo de erro no processo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que imputar com a mediana costuma ser mais seguro que imputar com a média quando a variável tem outliers fortes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A mediana não é puxada pelos valores extremos, enquanto a média é bem sensível a eles.",
                                "isCorrect": true
                            },
                            {
                                "text": "A mediana sempre resulta num número inteiro, o que facilita o treinamento do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A média só pode ser calculada em variáveis categóricas, nunca em variáveis numéricas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A mediana recalcula sozinha o valor certo, ignorando qualquer forma de outlier presente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual o principal risco de simplesmente remover, com dropna, todas as linhas que têm algum valor faltante?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Se a falta não for aleatória, remover pode enviesar o dataset que sobra pra treinar o modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, remover linhas com NaN nunca afeta a distribuição das variáveis que restaram.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo passa a exigir mais poder computacional pra treinar com um número menor de linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn passa a rejeitar o dataset por ele ficar com um número ímpar de linhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dataset de crédito tem a coluna renda com 40% de valores faltantes, e quem não informa a renda tende a ganhar menos. Qual abordagem de imputação tende a distorcer mais o modelo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Preencher com a média, porque ela ignora que a ausência está ligada ao próprio valor da renda.",
                                "isCorrect": true
                            },
                            {
                                "text": "Preencher com a mediana, porque ela é sempre igual ao valor mais alto de toda a distribuição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a coluna inteira, porque isso preserva perfeitamente o padrão original dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Preencher com zero, porque zero está sempre dentro do intervalo esperado pra renda mensal.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O SimpleImputer foi ajustado usando o dataset inteiro, antes da divisão entre treino e teste. Qual o problema mais direto dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A média ou mediana usada pra imputar já incorpora o teste, o que compromete a avaliação honesta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, imputação é uma etapa neutra que não interfere na avaliação do modelo depois do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SimpleImputer não funciona se for ajustado antes do train_test_split, e o código quebra.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo passa a treinar mais rápido, já que os dados chegam completos antes da divisão.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Vazamento de dados e Pipeline",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é vazamento de dados (data leakage)\n\nAo longo deste módulo, uma regra apareceu em toda aula: escale, codifique e impute usando só o conjunto de treino, depois aplique essa mesma transformação no teste. Chegou a hora de nomear por que essa regra existe, e ela não é surpresa nova: é uma extensão direta daquele cuidado do módulo 2 de nunca avaliar o modelo com um dado que ele, ou qualquer etapa antes dele, já viu de alguma forma. Quando alguma informação do conjunto de teste (ou do futuro, em dados organizados no tempo) influencia o treinamento, isso se chama vazamento de dados, ou data leakage.\n\nÉ um dos erros mais comuns e mais silenciosos em projetos de ML: o código roda sem nenhum erro, as métricas costumam sair ótimas, e o modelo parece muito bom. Só que essa avaliação está mentindo. Na prática, com dados novos que o modelo nunca viu, o desempenho real costuma despencar.\n\n## Como o vazamento acontece na prática\n\nO caso mais comum é exatamente o que as aulas anteriores vinham evitando: calcular média, desvio padrão, mínimo, máximo ou categoria mais frequente usando o dataset inteiro, antes de separar treino e teste. Quando isso acontece, a estatística usada pra transformar os dados já \"viu\" uma amostra do conjunto de teste, e o teste deixa de simular dados realmente novos."
                    },
                    {
                        "type": "code",
                        "value": "# X (features) e y (alvo) já preparados, como nos módulos anteriores\n\n# ERRADO: ajusta o scaler com o dataset inteiro, antes do split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\n\nscaler = StandardScaler()\nX_escalado = scaler.fit_transform(X)  # viu treino E teste juntos aqui\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X_escalado, y, test_size=0.2, random_state=42\n)\n\nmodelo = LogisticRegression()\nmodelo.fit(X_treino, y_treino)\nprint(modelo.score(X_teste, y_teste))\n# a métrica aqui pode parecer ótima, mas está inflada: o scaler\n# usou estatísticas calculadas com o próprio conjunto de teste"
                    },
                    {
                        "type": "code",
                        "value": "# CERTO: divide primeiro, ajusta o scaler só com o treino\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\nscaler = StandardScaler()\nscaler.fit(X_treino)  # fit só com o treino\n\nX_treino_escalado = scaler.transform(X_treino)\nX_teste_escalado = scaler.transform(X_teste)  # só transform, nunca fit\n\nmodelo = LogisticRegression()\nmodelo.fit(X_treino_escalado, y_treino)\nprint(modelo.score(X_teste_escalado, y_teste))\n# agora a métrica reflete o desempenho num dado que o preparo\n# nunca tinha visto antes, do jeito que a avaliação deveria ser"
                    },
                    {
                        "type": "text",
                        "value": "## Pipeline: encadeando preparo e modelo sem vazar\n\nSeguir a ordem certa manualmente funciona, mas cria espaço pra erro: é fácil esquecer, num projeto grande, o que o scaler já viu ou não. O scikit-learn resolve isso com o `Pipeline`: um objeto que encadeia etapas de preparo (scaler, imputer, encoder) e o modelo final numa sequência única. Quando você chama `fit` no pipeline inteiro, cada etapa de preparo ajusta e transforma só com os dados que chegam até ela naquele momento; como o pipeline inteiro só recebe o treino durante o fit, não tem como vazar.\n\nO Pipeline também é essencial quando você usa validação cruzada, aquela técnica vista em detalhe no módulo 5: sem pipeline, é fácil escalar os dados uma vez só e rodar a validação cruzada em cima do resultado já escalado, o que vaza dado de cada fold de teste pros folds de treino vizinhos. Com o Pipeline dentro do `cross_val_score`, cada fold refaz o fit do zero, só com os dados de treino daquele fold."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split, cross_val_score\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\npipeline = Pipeline([\n    ('scaler', StandardScaler()),\n    ('modelo', LogisticRegression())\n])\n\npipeline.fit(X_treino, y_treino)\nprint(pipeline.score(X_teste, y_teste))\n# 0.91\n\n# validação cruzada usando o pipeline inteiro: cada fold ajusta\n# o scaler do zero, só com os dados de treino daquele fold\nscores = cross_val_score(pipeline, X_treino, y_treino, cv=5)\nprint(scores)\n# [0.89 0.92 0.9  0.88 0.91]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"Certo\", \"Errado\"], [\"Escalar variáveis\", \"scaler.fit(X_treino), depois transform no treino e no teste\", \"scaler.fit_transform(X) no dataset inteiro, antes do split\"], [\"Imputar faltantes\", \"imputer.fit(X_treino), depois transform nos dois conjuntos\", \"imputer.fit(X) usando todas as linhas, incluindo o teste\"], [\"Codificar categorias\", \"encoder.fit(X_treino), depois transform no treino e no teste\", \"get_dummies aplicado no dataset inteiro, antes de dividir\"], [\"Validação cruzada com preparo\", \"Pipeline inteiro dentro do cross_val_score\", \"Escalar uma vez só e rodar cross_val_score em cima do resultado escalado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma métrica calculada com dado que vazou do teste não mede o modelo, mede a mentira que você contou pra si mesmo. O Pipeline existe pra essa mentira não acontecer por descuido."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é vazamento de dados (data leakage) num projeto de machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quando informação do teste, ou de dados futuros, acaba influenciando o treino e infla a avaliação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando o modelo perde acurácia porque foi treinado com poucos exemplos no conjunto de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando uma coluna do dataset tem muitos valores faltantes e o modelo não consegue processá-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o conjunto de treino e o conjunto de teste têm exatamente o mesmo número de linhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o problema de rodar scaler.fit_transform() no dataset inteiro, antes de fazer o train_test_split?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A média e o desvio usados pra escalar já incorporam o teste, e a avaliação deixa de ser isenta.",
                                "isCorrect": true
                            },
                            {
                                "text": "O StandardScaler não aceita ser usado antes do train_test_split e gera um erro de execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados de treino ficam com uma escala diferente dos dados de teste depois da divisão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo demora muito mais tempo pra treinar quando o scaler é ajustado antes da divisão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal vantagem de usar Pipeline em vez de aplicar scaler, encoder e modelo em etapas manuais separadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduz o risco de esquecer a ordem certa e de vazar dado de teste, sobretudo na validação cruzada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Pipeline sempre entrega uma acurácia mais alta do que fazer os mesmos passos manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Pipeline permite treinar o modelo sem precisar dividir os dados em treino e em teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Pipeline escolhe sozinho qual algoritmo de machine learning é o mais adequado pro problema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma cientista de dados escalou o dataset inteiro uma única vez, e só depois rodou cross_val_score com 5 folds em cima dos dados já escalados. O que está errado nisso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada fold de teste foi indiretamente usado pra calcular a escala aplicada nos folds de treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada está errado, escalar antes da validação cruzada é a forma recomendada de usar cross_val_score.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cross_val_score não aceita dados que já foram escalados antes, e vai lançar um erro na execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os 5 folds vão treinar modelos idênticos entre si, tornando a validação cruzada inútil nesse caso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo teve acurácia de 98% no teste durante o desenvolvimento, mas caiu pra 70% em produção. O pipeline de preparo tinha sido ajustado no dataset inteiro, antes do split. Qual a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Houve vazamento de dados: a avaliação no teste já estava inflada pelo preparo ajustado com ele.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo em produção está recebendo dados de uma distribuição bem diferente da usada no treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O algoritmo escolhido não é adequado pra esse tipo de problema e precisa ser trocado por outro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A infraestrutura de produção está rodando uma versão do scikit-learn diferente da usada em dev.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Aprendizado não-supervisionado e o próximo passo",
        "aulas": [
            {
                "titulo": "Aprender sem rótulos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 7 - Aprendizado não-supervisionado e o próximo passo\n\nDos módulos 3 a 6 desta trilha, todo modelo que você treinou tinha uma coluna alvo: o preço do imóvel, se o cliente cancelou o plano, se o e-mail era spam. Você sempre teve, de antemão, a resposta certa de cada exemplo do treino, e o modelo aprendia a imitar essa resposta em dados novos.\n\nMas nem todo problema com dados vem com uma coluna de resposta pronta. Às vezes você só tem a tabela: idade, renda, histórico de compra, sem nenhuma pista de qual é a \"resposta certa\" pra cada linha. Esse é o território deste último módulo da trilha: o aprendizado não-supervisionado."
                    },
                    {
                        "type": "text",
                        "value": "## Supervisionado x não-supervisionado, agora com mais profundidade\n\nRelembrando o Módulo 1: no aprendizado **supervisionado**, cada exemplo de treino vem com um rótulo (o alvo, ou `y`), e o objetivo é aprender uma função que prevê esse rótulo em exemplos novos. Foi o que você fez em regressão (prever um número) e em classificação (prever uma categoria).\n\nNo aprendizado **não-supervisionado**, os dados de treino não têm rótulo nenhum: só existem as features (o `X`), sem nenhum `y` correspondente. O objetivo muda por completo. Em vez de prever um valor já conhecido, o algoritmo busca descobrir uma estrutura escondida nos dados, como grupos de exemplos parecidos entre si ou combinações de variáveis que resumem a informação da base inteira."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Supervisionado\", \"Não-supervisionado\"], [\"Tem rótulo (y) no treino?\", \"Sim, cada exemplo já vem com a resposta certa\", \"Não, só existem as features (X)\"], [\"Objetivo do modelo\", \"Prever um valor ou uma categoria conhecidos\", \"Descobrir estrutura, como grupos ou padrões\"], [\"Exemplos de algoritmo\", \"Regressão linear, regressão logística, k-NN, árvore\", \"K-means, PCA\"], [\"Como o resultado é avaliado\", \"Compara a previsão com o rótulo real (MAE, F1...)\", \"Não há rótulo pra comparar; a avaliação é indireta\"], [\"Pergunta típica\", \"Esse cliente vai cancelar o plano?\", \"Existem grupos naturais de clientes nesta base?\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\n# a mesma ideia de tabela de clientes de uma classificação,\n# só que sem a coluna alvo (\"cancelou\") que existiria lá\nclientes = pd.DataFrame({\n    \"idade\": [23, 45, 31, 52, 28, 40],\n    \"renda_mensal\": [2000, 9200, 4100, 11000, 3000, 8700],\n    \"tempo_de_casa_meses\": [3, 40, 12, 55, 6, 38],\n})\n\nprint(clientes.head(3))\n#    idade  renda_mensal  tempo_de_casa_meses\n# 0     23          2000                     3\n# 1     45          9200                    40\n# 2     31          4100                    12\n\n# repare: não existe coluna \"cancelou\" nem \"categoria\" aqui\n# o objetivo não é prever algo que já existe, é descobrir uma estrutura nova"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa\n\nEsse tipo de pergunta aparece o tempo todo fora da sala de aula. Um time de marketing quer saber se existem \"tipos\" de cliente na base, sem que ninguém tenha definido esses tipos antes. Um time de operações quer saber se alguma transação foge muito do padrão das demais. Um cientista de dados, ao receber uma base nova, quer entender rapidamente se ela tem estrutura antes mesmo de decidir o que fazer com ela.\n\nEm nenhum desses casos existe uma coluna pronta com a resposta certa. É aí que o não-supervisionado entra, e é o assunto das próximas aulas: primeiro agrupando exemplos parecidos (clustering), depois simplificando muitas colunas em poucas (redução de dimensionalidade)."
                    },
                    {
                        "type": "quote",
                        "value": "Aprendizado não-supervisionado não prevê uma resposta que já existe em algum lugar: ele procura uma estrutura que ninguém tinha nomeado ainda."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diferencia um problema de aprendizado supervisionado de um não-supervisionado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se os exemplos de treino têm ou não um rótulo (y) conhecido",
                                "isCorrect": true
                            },
                            {
                                "text": "O número mínimo de linhas exigido na base de dados usada",
                                "isCorrect": false
                            },
                            {
                                "text": "O tipo de linguagem de programação usada no projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de colunas numéricas presentes na tabela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe tem uma tabela de clientes com idade, renda e histórico de compra, sem nenhuma coluna que diga o que fazer com cada cliente. A equipe quer descobrir se existem grupos naturais parecidos entre si. Que tipo de problema é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não-supervisionado, já que não existe rótulo pra guiar o aprendizado",
                                "isCorrect": true
                            },
                            {
                                "text": "Supervisionado, porque a base tem mais de uma coluna numérica",
                                "isCorrect": false
                            },
                            {
                                "text": "De regressão, já que renda e idade são variáveis contínuas",
                                "isCorrect": false
                            },
                            {
                                "text": "Impossível de resolver sem antes rotular manualmente cada cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a ideia de \"acertar\" ou \"errar\" muda no aprendizado não-supervisionado, comparado ao supervisionado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque não existe rótulo verdadeiro pra comparar com o resultado do modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o não-supervisionado nunca erra, já que não faz previsão nenhuma",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nele não se usa nenhum dado numérico, só colunas de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o scikit-learn não calcula métrica nenhuma pra esses algoritmos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja quer prever se um cliente vai cancelar a assinatura no próximo mês, usando o histórico de quem já cancelou ou não no passado. Esse é um problema de que tipo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Supervisionado, pois existe rótulo passado (cancelou ou não) pra treinar o modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Não-supervisionado, pois o objetivo é descobrir um grupo de clientes parecidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Não-supervisionado, pois a loja ainda não sabe o resultado do próximo mês",
                                "isCorrect": false
                            },
                            {
                                "text": "Supervisionado, mas só pode ser resolvido com k-means e nenhum outro algoritmo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre aprendizado não-supervisionado é verdadeira?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ele pode revelar estruturas inesperadas, mas cabe a alguém interpretar o achado",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele sempre encontra o mesmo número de grupos, independente dos dados usados",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele dispensa qualquer decisão humana depois que o algoritmo termina de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele supera modelos supervisionados em previsão sempre que aplicado ao mesmo problema",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Clustering com k-means",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Agrupar por parecença\n\nClustering é a tarefa de separar um conjunto de dados em grupos (os *clusters*), de forma que exemplos dentro do mesmo grupo sejam parecidos entre si, e exemplos de grupos diferentes sejam bem diferentes. Ninguém diz ao algoritmo, de antemão, quais são os grupos certos: ele descobre isso sozinho, olhando só pra semelhança entre os exemplos.\n\nO **k-means** é o algoritmo de clustering mais usado como porta de entrada. O nome já entrega a ideia: `k` é o número de grupos que você quer encontrar, e `means` (médias) é como cada grupo é representado."
                    },
                    {
                        "type": "text",
                        "value": "## Como o k-means funciona\n\nO algoritmo segue um processo simples e repetitivo:\n\n1. Você escolhe `k`, o número de clusters que quer encontrar.\n2. O algoritmo espalha `k` pontos iniciais pelos dados, chamados **centroides** (um por cluster).\n3. Cada exemplo da base é atribuído ao centroide mais próximo dele (por distância).\n4. Cada centroide se move pra posição média de todos os exemplos que foram atribuídos a ele.\n5. Os passos 3 e 4 se repetem até os centroides pararem de se mover de forma relevante (o algoritmo convergiu).\n\nUm centroide não é, necessariamente, um exemplo real da base: ele é um ponto matemático, a média das posições do grupo."
                    },
                    {
                        "type": "text",
                        "value": "## Escolher k: o método do cotovelo\n\nO k-means não decide sozinho quantos grupos existem: você informa `k` antes de rodar. Escolher um `k` ruim gera grupos artificiais (muito pequenos ou sem sentido) ou grupos grandes demais, que misturam exemplos diferentes.\n\nUma forma comum de escolher `k` é o **método do cotovelo**. A ideia: rodar o k-means várias vezes, com `k` = 1, 2, 3, 4 e assim por diante, e medir a **inércia** de cada rodada (a soma das distâncias ao quadrado de cada ponto até o centroide do seu cluster; quanto menor, mais compactos os grupos). Se você desenhasse um gráfico com `k` no eixo horizontal e a inércia no eixo vertical, veria uma curva caindo: ela cai rápido no início e depois desacelera, quase achatando numa linha reta. O ponto onde a queda desacelera bruscamente é o \"cotovelo\", e costuma ser um bom candidato pra `k`. Não é uma resposta matematicamente exata, é uma pista visual, e o conhecimento do problema (\"faz sentido ter 3 segmentos de cliente ou 8?\") ajuda a decidir junto."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\nimport pandas as pd\n\nclientes = pd.DataFrame({\n    \"renda_mensal\": [2000, 2200, 15000, 16500, 3000, 14000],\n    \"gasto_mensal\": [1800, 2000, 3000, 3200, 2600, 3100],\n})\n\n# k-means usa distância, então escalar antes é tão importante quanto foi para o k-NN\nX_escalado = StandardScaler().fit_transform(clientes)\n\nkmeans = KMeans(n_clusters=2, random_state=42, n_init=10)\nkmeans.fit(X_escalado)\n\nprint(kmeans.labels_)\n# algo como array([0, 0, 1, 1, 0, 1])\n# um grupo reúne quem tem renda e gasto mais baixos, o outro quem tem renda e gasto mais altos\n# (o número do grupo, 0 ou 1, é só um rótulo arbitrário, não indica ordem ou qualidade)\n\nprint(kmeans.cluster_centers_)\n# as coordenadas dos 2 centroides, no espaço já escalado"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidados com o k-means\n\nAlguns pontos valem atenção antes de usar o k-means no dia a dia:\n\n- **Escala importa**: como ele usa distância entre pontos, uma variável em escala muito maior domina o cálculo se você não padronizar antes (o mesmo problema do k-NN, visto no Módulo 6).\n- **`k` é escolhido por você**: o algoritmo não decide o número de grupos sozinho, é um hiperparâmetro que você define.\n- **Inicialização importa**: os centroides iniciais são posicionados de forma aleatória, e uma inicialização ruim pode levar a um resultado pior. O parâmetro `n_init` roda o algoritmo várias vezes, com inícios diferentes, e fica com o melhor resultado.\n- **Grupos tendem a ficar arredondados**: o k-means funciona melhor quando os clusters têm formato mais ou menos esférico e tamanho parecido; formatos muito irregulares confundem o algoritmo."
                    },
                    {
                        "type": "quote",
                        "value": "O k-means não sabe o que é um cliente bom ou uma transação suspeita: ele só sabe medir distância. O sentido de cada grupo quem dá é você."
                    }
                ],
                "questions": [
                    {
                        "statement": "No k-means, o que é o centroide de um cluster?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O ponto que representa a média das posições dos exemplos daquele grupo",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro exemplo da base que foi atribuído àquele grupo específico",
                                "isCorrect": false
                            },
                            {
                                "text": "O exemplo mais distante de todos os outros grupos formados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dos exemplos originais escolhido como representante fixo do grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A cada iteração do k-means, como um exemplo é atribuído a um cluster?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É atribuído ao cluster cujo centroide está mais próximo dele, por distância",
                                "isCorrect": true
                            },
                            {
                                "text": "É atribuído de forma aleatória, sorteado a cada nova iteração do algoritmo",
                                "isCorrect": false
                            },
                            {
                                "text": "É atribuído ao cluster que, até então, tem o menor número de exemplos",
                                "isCorrect": false
                            },
                            {
                                "text": "É atribuído por votação dos exemplos vizinhos mais próximos dele",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Assim como o k-NN, o k-means também exige atenção à escala das variáveis. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a distância usada para formar os grupos é dominada pela variável de maior magnitude",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o scikit-learn recusa a rodar o `fit` se as colunas tiverem escalas diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem escalonar, o número de clusters `k` muda sozinho durante o treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque colunas em escalas diferentes não podem ficar juntas num mesmo DataFrame",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No método do cotovelo, o que se espera observar na curva de inércia à medida que `k` aumenta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A inércia cai continuamente, mas a queda desacelera a partir de um certo ponto",
                                "isCorrect": true
                            },
                            {
                                "text": "A inércia sobe de forma constante à medida que mais clusters são adicionados",
                                "isCorrect": false
                            },
                            {
                                "text": "A inércia permanece igual, não importa quantos clusters sejam testados",
                                "isCorrect": false
                            },
                            {
                                "text": "A inércia cai até `k` igual a 2 e depois volta a subir sempre daí em diante",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista roda o k-means com `k` igual a 3, já com os dados escalados, e os grupos formados ficam muito desiguais e sem sentido de negócio. O que essa observação sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O valor de `k` escolhido pode não refletir a estrutura dos dados, vale testar outros",
                                "isCorrect": true
                            },
                            {
                                "text": "O k-means nunca erra o número de grupos, o problema só pode estar nos dados brutos",
                                "isCorrect": false
                            },
                            {
                                "text": "É o comportamento esperado: o k-means sempre gera grupos de tamanhos bem diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "O algoritmo deveria ser trocado direto por uma regressão linear nesse tipo de caso",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Redução de dimensionalidade com PCA",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Muitas colunas, um problema real\n\nAté aqui, os exemplos desta trilha usaram poucas features de propósito, pra facilitar a explicação. Mas uma base de dados real de ciência de dados costuma ter dezenas, às vezes centenas de colunas: dados de clientes, de sensores, de transações, de imagens.\n\nIsso traz três dores de cabeça. Primeiro, é impossível visualizar mais de 2 ou 3 dimensões num gráfico. Segundo, muitas dessas colunas costumam ser redundantes entre si (lembra da correlação, lá da trilha de Estatística?): renda e faixa de consumo, por exemplo, costumam andar juntas. Terceiro, muitas colunas deixam o treino mais lento e, em alguns modelos, mais barulhento. A pergunta natural é: dá pra comprimir várias colunas em poucas, sem perder o essencial da informação?"
                    },
                    {
                        "type": "text",
                        "value": "## A intuição do PCA\n\nO **PCA** (Análise de Componentes Principais) responde exatamente essa pergunta. Ele cria um novo conjunto de eixos, chamados **componentes principais**, que são combinações das colunas originais. O primeiro componente é escolhido pra capturar a maior variação possível dos dados; o segundo captura a maior parte do que sobrou (sem repetir o que o primeiro já capturou); e assim por diante.\n\nUma boa analogia: imagine tentar fotografar um objeto em 3D com uma única foto 2D. Existe um ângulo que mostra bem a forma do objeto, e outro que mostra quase só um risco sem informação nenhuma. O PCA procura, matematicamente, o \"melhor ângulo\" pra representar os dados com menos dimensões, sem você precisar da matemática pesada por trás pra usar."
                    },
                    {
                        "type": "text",
                        "value": "## Pra que serve, na prática\n\nDois usos aparecem o tempo todo. O primeiro é **visualização**: reduzir uma base de muitas colunas pra 2 componentes, só pra poder plotar num gráfico e enxergar se existe alguma estrutura, algum agrupamento, algum ponto fora da curva. É comum, inclusive, usar PCA junto com k-means: rodar o clustering nas colunas originais (ou escaladas), e usar o PCA só depois, pra desenhar os clusters encontrados num gráfico 2D.\n\nO segundo uso é **simplificação**: reduzir o número de colunas antes de treinar um modelo, economizando tempo de treino e removendo parte do ruído. Vale um alerta: os componentes gerados são combinações das colunas originais, então perdem o significado direto de cada variável. Depois do PCA, fica mais difícil dizer \"esse componente é a renda do cliente\", porque ele geralmente é um pouco de várias colunas ao mesmo tempo."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\nimport pandas as pd\n\ndados = pd.DataFrame({\n    \"idade\": [23, 45, 31, 52, 28, 40],\n    \"renda_mensal\": [2500, 9000, 4200, 11000, 3100, 8500],\n    \"anos_estudo\": [12, 18, 15, 20, 13, 17],\n    \"gasto_mensal\": [1900, 5200, 2800, 6100, 2200, 4900],\n})\n\nX_escalado = StandardScaler().fit_transform(dados)\n\npca = PCA(n_components=2)\nX_reduzido = pca.fit_transform(X_escalado)\n\nprint(X_reduzido.shape)\n# (6, 2) -> as 4 colunas originais viraram 2 componentes principais\n\nprint(pca.explained_variance_ratio_)\n# algo como [0.83, 0.11]\n# o 1º componente sozinho já explica cerca de 83% da variância dos dados originais\n# os 2 componentes juntos preservam perto de 94% da informação"
                    },
                    {
                        "type": "text",
                        "value": "## O preço da compressão\n\nO atributo `explained_variance_ratio_` mostra, pra cada componente, quanto da variância (informação) original ele preserva. Somando os valores dos componentes que você manteve, dá pra saber quanto da informação total sobrou depois da compressão.\n\nAqui vale a mesma honestidade de sempre: reduzir dimensões tem preço. Uma parte da variância sempre fica pra trás (a não ser que você mantenha todos os componentes originais, e aí não há compressão nenhuma). Antes de confiar num gráfico 2D gerado por PCA pra tirar conclusões, vale conferir quanto da variância original aqueles 2 componentes realmente preservam: 94% é uma boa representação, 40% já é bem mais arriscado de interpretar."
                    },
                    {
                        "type": "quote",
                        "value": "PCA não escolhe as colunas mais importantes e descarta o resto: ele cria eixos novos, misturando as colunas originais, pra guardar o máximo de informação no menor número de dimensões possível."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o objetivo principal do PCA (Análise de Componentes Principais)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir variáveis, combinando-as em componentes que preservam o máximo de informação",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de variáveis disponíveis pra deixar o modelo ainda mais preciso",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir os valores faltantes de uma coluna pela média dos demais valores válidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher de forma totalmente automática qual algoritmo de classificação usar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que representa o primeiro componente principal gerado pelo PCA?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A combinação das variáveis originais que captura a maior variância dos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "A variável original que tem a maior correlação com o alvo do problema",
                                "isCorrect": false
                            },
                            {
                                "text": "A média simples de todas as variáveis originais, calculada linha a linha",
                                "isCorrect": false
                            },
                            {
                                "text": "A variável original que tem o menor número de valores faltantes na base",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de padronizar os dados e aplicar PCA com 2 componentes numa base de 10 colunas, `explained_variance_ratio_` retorna algo como [0.55, 0.20]. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os 2 componentes preservam juntos cerca de 75% da variância dos dados originais",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo treinado nessa base tem 75% de acurácia na tarefa de classificação",
                                "isCorrect": false
                            },
                            {
                                "text": "55% e 20% das linhas da base foram descartadas durante a redução de dimensões",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas primeiras colunas originais, sozinhas, já explicam 75% dos dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de reduzir uma base de 20 para 2 dimensões com PCA e plotar os pontos, dá pra afirmar que dois pontos próximos no gráfico são parecidos em todas as 20 variáveis originais?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não necessariamente: o PCA preserva a maior parte da variância, mas parte da informação se perde",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, o PCA garante fidelidade total às variáveis originais sempre que os dados são padronizados",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o PCA apenas remove colunas redundantes e mantém as demais intactas",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o PCA embaralha de forma aleatória a ordem das linhas da base original",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dupla de cientistas de dados quer visualizar, num gráfico 2D, se os clusters encontrados por um k-means com 15 variáveis fazem sentido. Qual caminho é mais adequado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Rodar o k-means nas 15 variáveis escaladas e usar o PCA só depois, para plotar em 2 dimensões",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar o PCA primeiro pra reduzir a 1 variável e rodar o k-means só com essa variável",
                                "isCorrect": false
                            },
                            {
                                "text": "Selecionar apenas duas das 15 colunas originais, escolhidas ao acaso, e ignorar as demais",
                                "isCorrect": false
                            },
                            {
                                "text": "Desistir da visualização, já que não é possível representar mais de 2 variáveis num gráfico",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Quando usar não-supervisionado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Três usos clássicos\n\nCom clustering e redução de dimensionalidade na caixa de ferramentas, vale mapear onde o aprendizado não-supervisionado costuma aparecer no trabalho real com dados:\n\n- **Segmentação**: dividir clientes, usuários ou produtos em grupos de comportamento parecido, sem que ninguém tenha definido esses grupos antes. É o uso mais comum de k-means no mercado.\n- **Detecção de anomalia**: encontrar exemplos muito diferentes do padrão geral, como uma transação fora do comum ou uma leitura de sensor fora da curva.\n- **Exploração**: quando você recebe uma base nova e ainda não sabe bem o que fazer com ela, técnicas não-supervisionadas ajudam a enxergar estrutura antes mesmo de decidir se um projeto supervisionado faz sentido."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Caso de uso\", \"O que se busca\", \"Técnica comum\"], [\"Segmentação de clientes\", \"Grupos com comportamento parecido\", \"K-means\"], [\"Detecção de anomalia\", \"Pontos muito distantes de qualquer grupo\", \"Clustering (distância ao centroide)\"], [\"Exploração de uma base nova\", \"Estrutura e redundância entre colunas\", \"PCA\"], [\"Visualizar dados com muitas colunas\", \"Enxergar em 2D uma base de alta dimensão\", \"PCA\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Detecção de anomalia com o que você já sabe\n\nDetectar anomalia com clustering não exige um algoritmo novo: a ideia é olhar pra distância entre cada ponto e o centroide do cluster mais próximo dele. Pontos muito distantes de qualquer centroide, ou que formam sozinhos um cluster minúsculo, são candidatos a anomalia: uma transação de cartão fora do padrão de gastos do cliente, uma leitura de sensor de máquina fora da faixa normal.\n\nRepare na palavra **candidatos**. O algoritmo aponta o que foge do padrão estatístico, não o que é, de fato, fraude ou defeito. Cabe a uma pessoa (ou a uma regra de negócio) investigar cada ponto sinalizado antes de agir sobre ele."
                    },
                    {
                        "type": "text",
                        "value": "## Os cuidados: avaliar é mais difícil sem rótulo\n\nNo Módulo 5, você viu métricas como precisão, recall e F1, todas comparando a previsão do modelo com um rótulo verdadeiro. Sem rótulo, essas métricas simplesmente não existem: não há um \"gabarito\" pra confrontar com os grupos encontrados.\n\nIsso não quer dizer que não dá pra avaliar nada. Existem métricas internas, calculadas só a partir da estrutura dos próprios clusters, sem precisar de rótulo (a inércia do k-means é uma delas, o coeficiente de silhueta é outra). Mas nenhuma delas substitui a pergunta mais importante: os grupos encontrados fazem sentido pro problema de negócio? É fácil forçar qualquer `k` num k-means e obter *uma* resposta; garantir que essa resposta é *boa* exige olhar além do número."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.metrics import silhouette_score\n\n# X_escalado e kmeans.labels_ são os mesmos da aula sobre k-means\nscore = silhouette_score(X_escalado, kmeans.labels_)\n\nprint(score)\n# um número entre -1 e 1\n# perto de 1: clusters bem separados e coesos\n# perto de 0: clusters que se sobrepõem, mal definidos\n# negativo: muitos pontos parecem estar no cluster errado"
                    },
                    {
                        "type": "text",
                        "value": "## Um fluxo comum na prática\n\nNo dia a dia, não-supervisionado e supervisionado costumam trabalhar juntos, não como escolhas concorrentes. Um fluxo bem comum: usar PCA e k-means pra explorar uma base nova e entender se existe estrutura; dar nome de negócio aos grupos encontrados (\"clientes de alto valor\", \"clientes em risco de cancelamento\"); e, só depois, se fizer sentido, treinar um modelo supervisionado pra prever a qual grupo um cliente novo provavelmente pertence.\n\nO não-supervisionado, nesse fluxo, funciona como uma lupa: ajuda a enxergar o problema antes de decidir qual pergunta supervisionada vale a pena fazer."
                    },
                    {
                        "type": "quote",
                        "value": "Sem rótulo, o algoritmo não erra nem acerta sozinho: quem decide se um grupo faz sentido é sempre uma pessoa olhando pro resultado com espírito crítico."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções é um uso típico de aprendizado não-supervisionado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Segmentar clientes em grupos parecidos sem que ninguém tenha rotulado os grupos antes",
                                "isCorrect": true
                            },
                            {
                                "text": "Prever o preço de um imóvel a partir de um histórico de vendas com preço conhecido",
                                "isCorrect": false
                            },
                            {
                                "text": "Classificar e-mails como spam ou não spam usando exemplos já rotulados antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular a acurácia de um modelo já treinado numa tarefa de classificação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que sinalizar uma anomalia com clustering costuma exigir revisão humana depois?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o algoritmo aponta o que foge do padrão estatístico, sem dizer se é fraude ou erro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o k-means erra a maior parte dos cálculos de distância em bases muito grandes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda anomalia sinalizada por um algoritmo é, por definição, um erro de digitação",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o scikit-learn bloqueia a execução de detecção de anomalia sem revisão prévia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem uma coluna de rótulo, como normalmente se avalia se os grupos de um k-means fazem sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Combinando métricas internas, como inércia ou silhueta, com a leitura humana dos grupos",
                                "isCorrect": true
                            },
                            {
                                "text": "Calculando a acurácia dos grupos formados em relação a um alvo verdadeiro conhecido",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparando a matriz de confusão entre os diferentes clusters encontrados no treino todo",
                                "isCorrect": false
                            },
                            {
                                "text": "Usando o R² entre os centroides encontrados e a média geral de todos os dados originais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de marketing pede: \"rode o k-means na base de clientes e nos diga o nome de cada grupo encontrado\". O que o algoritmo entrega sozinho, e o que depende da equipe?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O algoritmo entrega os grupos numerados; dar nome de negócio a cada um é interpretação humana",
                                "isCorrect": true
                            },
                            {
                                "text": "O algoritmo entrega tanto os grupos quanto o nome de negócio de cada um, de forma automática",
                                "isCorrect": false
                            },
                            {
                                "text": "O algoritmo não consegue formar grupo nenhum sem que a equipe defina os nomes antes",
                                "isCorrect": false
                            },
                            {
                                "text": "O algoritmo entrega os nomes dos grupos, mas nunca informa quantos clientes há em cada um",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um k-means com `k` igual a 4 numa base de clientes, um cluster ficou com apenas 3 clientes, bem distantes dos demais pontos. O que essa observação sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Esses 3 clientes podem ser um grupo atípico, que vale investigar antes de generalizar",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor de `k` está definitivamente errado e precisa, obrigatoriamente, cair para 3",
                                "isCorrect": false
                            },
                            {
                                "text": "O k-means deve ser abandonado nesse caso, em favor direto de uma árvore de decisão",
                                "isCorrect": false
                            },
                            {
                                "text": "Esses 3 clientes certamente têm erro de digitação nos dados e devem ser excluídos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recap e o próximo passo: Machine Learning na Prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Você chegou ao fim da trilha de Machine Learning\n\nQuando você começou esta trilha, machine learning talvez fosse só um termo repetido em notícia de tecnologia. Sete módulos depois, você sabe o que o termo realmente significa: aprender padrões a partir de dados em vez de programar regra por regra, sabe treinar e avaliar um modelo de verdade, sabe evitar as armadilhas mais comuns (overfitting, vazamento de dados, acurácia enganosa), e agora sabe até encontrar estrutura em dados sem rótulo nenhum.\n\nAntes de seguir pro próximo estágio do roadmap de Ciência de Dados, vale olhar pra trás e ver o caminho inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Módulo\", \"O que você levou dele\"], [\"1\", \"O que é ML, tipos de aprendizado e o vocabulário essencial (features, alvo, modelo)\"], [\"2\", \"O pipeline de um projeto e o padrão fit/predict/score do scikit-learn\"], [\"3\", \"Regressão: prever números com LinearRegression e métricas como MAE, RMSE e R2\"], [\"4\", \"Classificação: prever categorias com regressão logística, k-NN e árvore de decisão\"], [\"5\", \"Avaliar de verdade: matriz de confusão, precisão, recall, F1 e validação cruzada\"], [\"6\", \"Preparar dados sem vazamento: escalonamento, one-hot encoding e Pipeline\"], [\"7\", \"Aprendizado não-supervisionado: agrupar com k-means e simplificar com PCA\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O fio condutor\n\nRepare no caminho que essa sequência percorre. Você começou entendendo que ML é aprender padrões em vez de escrever regra fixa. Aprendeu o pipeline que qualquer projeto segue, treinar sem nunca avaliar no mesmo dado usado no treino. Usou esse pipeline pra prever números (regressão) e depois categorias (classificação). Descobriu que treinar um modelo é fácil, e que avaliar esse modelo com honestidade é que separa um projeto sério de um projeto ingênuo. Aprendeu que dado malpreparado, ou vazado entre treino e teste, derruba até o melhor algoritmo. E, por fim, viu que nem todo problema chega com um rótulo pronto, e que dá pra extrair valor dos dados mesmo assim.\n\nO fio condutor é esse: da pergunta \"o que significa aprender com dados\" até a prática de construir e, com as devidas ressalvas, confiar num modelo."
                    },
                    {
                        "type": "text",
                        "value": "## Honestidade final sobre limites\n\nVale fechar como o Módulo 1 começou: machine learning não é mágica. Um modelo só é tão bom quanto os dados que ele viu no treino; dados enviesados ou pouco representativos geram modelos enviesados ou pouco úteis. Nenhum modelo desta trilha, nem os do próximo estágio, elimina a necessidade de entender o problema de negócio por trás dos números. Todo modelo erra parte do tempo, e a métrica certa pra medir esse erro depende do que está em jogo em cada aplicação.\n\nEssa desconfiança treinada (perguntar como o modelo foi avaliado, com quais dados, e o que ele erra) vale tanto pra um projeto seu quanto pra qualquer resultado de ML que você ler por aí."
                    },
                    {
                        "type": "text",
                        "value": "## Próximo passo: Machine Learning na Prática\n\nO próximo estágio do roadmap de Ciência de Dados pega exatamente de onde esta trilha parou, e aprofunda quatro frentes:\n\n- **Feature engineering avançado**: ir além do escalonamento e do one-hot encoding, criando variáveis novas e mais poderosas a partir das que já existem.\n- **Seleção e ajuste de hiperparâmetros**: em vez de escolher `n_neighbors` ou a profundidade de uma árvore no chute, testar várias combinações de forma sistemática, com GridSearch, apoiado na validação cruzada que você viu no Módulo 5.\n- **Ensembles**: combinar várias árvores de decisão numa \"equipe\" de modelos, como random forest e boosting, que juntas costumam errar menos do que qualquer árvore sozinha.\n- **Uma introdução a deep learning**: o próximo salto de complexidade, com redes neurais e ferramentas como TensorFlow e PyTorch, pra problemas onde os modelos desta trilha já não bastam."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import GridSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\n\n# uma prévia do próximo estágio: testar hiperparâmetros de forma sistemática,\n# em vez de ajustar um valor de cada vez no chute\nparametros = {\"n_estimators\": [50, 100, 200], \"max_depth\": [3, 5, None]}\n\nbusca = GridSearchCV(RandomForestClassifier(random_state=42), parametros, cv=5)\n# busca.fit(X_treino, y_treino)\n# busca.best_params_ traria a melhor combinação de hiperparâmetros encontrada,\n# testada com validação cruzada de 5 dobras em cada combinação"
                    },
                    {
                        "type": "quote",
                        "value": "Você não sai desta trilha sabendo todos os algoritmos que existem. Sai sabendo o funil que qualquer um deles segue: preparar dado direito, treinar sem trapacear, avaliar com honestidade e desconfiar de todo resultado bom demais."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual foi o fluxo geral de um projeto de machine learning apresentado a partir do Módulo 2 desta trilha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Preparar os dados, dividir em treino e teste, treinar, avaliar e só então usar o modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar o modelo direto, coletar dados depois, e publicar sem dividir treino e teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Avaliar o modelo antes de treiná-lo, e só depois preparar os dados restantes",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher o algoritmo mais complexo disponível e aplicá-lo direto nos dados brutos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o próximo passo sugerido no roadmap de Ciência de Dados depois desta trilha de Machine Learning?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Machine Learning na Prática, com feature engineering avançado, GridSearch e ensembles",
                                "isCorrect": true
                            },
                            {
                                "text": "Voltar para a trilha de Estatística e Probabilidade, agora em nível avançado",
                                "isCorrect": false
                            },
                            {
                                "text": "A trilha de Machine Learning encerra por completo o roadmap de Ciência de Dados",
                                "isCorrect": false
                            },
                            {
                                "text": "A trilha de Visualização de Dados, ainda não estudada em nenhum estágio anterior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual par conecta corretamente um módulo desta trilha à sua ideia central?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Módulo 6: preparar os dados depois de dividir treino e teste, evitando vazamento",
                                "isCorrect": true
                            },
                            {
                                "text": "Módulo 3: escolher entre precisão e recall dependendo do custo de cada erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Módulo 5: prever um número contínuo usando uma reta de regressão linear",
                                "isCorrect": false
                            },
                            {
                                "text": "Módulo 4: treinar o modelo sem nunca avaliar num conjunto de teste separado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma árvore de decisão do Módulo 4 vai bem no treino, mas sua profundidade máxima foi escolhida no chute, testando um valor de cada vez. Qual recurso do próximo estágio resolve isso de forma sistemática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O GridSearch, que testa várias combinações de hiperparâmetros, apoiado em validação cruzada",
                                "isCorrect": true
                            },
                            {
                                "text": "O StandardScaler, aplicado agora sobre os hiperparâmetros do modelo em vez das variáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "O PCA, reduzindo diretamente o número de hiperparâmetros disponíveis pra testar",
                                "isCorrect": false
                            },
                            {
                                "text": "Repetir a divisão treino e teste várias vezes até o resultado no teste melhorar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Random forest e boosting, citados como o próximo passo do roadmap, têm em comum o fato de ambos serem",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ensembles: combinam várias árvores de decisão pra chegar numa previsão mais robusta",
                                "isCorrect": true
                            },
                            {
                                "text": "Técnicas de redução de dimensionalidade, do mesmo grupo do PCA visto neste módulo",
                                "isCorrect": false
                            },
                            {
                                "text": "Técnicas de clustering, do mesmo grupo do k-means visto neste módulo",
                                "isCorrect": false
                            },
                            {
                                "text": "Métricas de avaliação, do mesmo grupo de precisão, recall e F1 vistas no Módulo 5",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.");
        return;
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log("Seed concluido: " + MODULOS.length + " modulos, " + totalAulas + " aulas, " + totalQuestoes + " questoes.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
