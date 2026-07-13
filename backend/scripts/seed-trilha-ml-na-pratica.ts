// Seed da trilha Machine Learning na Pratica (avancado), estagio 8 do roadmap de Ciencia de Dados.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-ml-na-pratica.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Machine Learning na Prática";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Machine learning além do básico: feature engineering, ajuste de hiperparâmetros, ensembles (random forest e boosting), pipelines robustos, lidar com classes desbalanceadas e overfitting, e uma introdução a deep learning. Do modelo que funciona ao modelo que ganha.";

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
        "titulo": "Módulo 1 - Feature engineering na prática",
        "aulas": [
            {
                "titulo": "Features valem mais que o algoritmo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Features valem mais que o algoritmo\n\nNa trilha de Machine Learning você comparou modelos, ajustou hiperparâmetros básicos e olhou pra métricas de avaliação. Provavelmente reparou que trocar de algoritmo (uma árvore por uma regressão logística, por exemplo) muda o resultado, mas raramente muda demais. O que costuma mover o ponteiro de verdade, na prática, é outra coisa: as colunas que você entrega pro modelo treinar."
                    },
                    {
                        "type": "text",
                        "value": "## O modelo só é tão bom quanto as features\n\nUm algoritmo de machine learning só encontra padrões que estão, de alguma forma, representados nos dados de entrada. Se uma informação decisiva pro problema não vira feature, nenhum modelo, por mais sofisticado que seja, vai descobrir essa informação sozinho. É a versão de machine learning do velho **garbage in, garbage out**: dado ruim ou incompleto na entrada, previsão ruim na saída, não importa o quanto você capriche no algoritmo."
                    },
                    {
                        "type": "text",
                        "value": "## O que é feature engineering\n\n**Feature engineering** é o processo de criar, transformar e selecionar as variáveis que o modelo recebe, usando o que você sabe sobre o problema pra representar melhor esse problema em forma de número. Não é só \"adicionar mais dado\": muitas vezes é pegar o dado que você já tem e reorganizar ele de um jeito que o algoritmo consiga enxergar o padrão com menos esforço."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    'area_m2': [120, 45, 80, 200],\n    'quartos': [3, 1, 2, 4],\n    'ano_construcao': [2005, 2018, 2010, 1995]\n})\n\nano_atual = 2026\n\n# feature derivada: idade do imóvel em anos\ndf['idade_imovel'] = ano_atual - df['ano_construcao']\n\n# feature derivada: área média por cômodo\ndf['area_por_quarto'] = df['area_m2'] / df['quartos']\n\nprint(df[['area_m2', 'quartos', 'idade_imovel', 'area_por_quarto']])\n#    area_m2  quartos  idade_imovel  area_por_quarto\n# 0      120        3            21             40.0\n# 1       45        1             8             45.0\n# 2       80        2            16             40.0\n# 3      200        4            31             50.0"
                    },
                    {
                        "type": "text",
                        "value": "Repare que `idade_imovel` e `area_por_quarto` provavelmente têm uma relação mais direta com o preço do imóvel do que `ano_construcao` sozinho. Uma árvore de decisão até consegue aproximar essa mesma informação fazendo vários splits em `ano_construcao`, parecido com o jeito que ela lidava com o overfitting quando ficava funda demais na trilha de ML, mas entregar a feature já pronta poupa esse trabalho e ajuda o modelo a generalizar com menos dado de treino."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Feature crua\", \"Feature derivada\", \"Por que ajuda\"], [\"ano_construcao\", \"idade_imovel\", \"Idade tem relação mais direta com o preço do que o ano em si\"], [\"data_da_venda\", \"dia_da_semana, mes, eh_feriado\", \"Deixa a sazonalidade explícita em vez de escondida num timestamp\"], [\"renda e numero_de_dependentes\", \"renda_per_capita\", \"Uma única razão capta a interação que duas colunas separadas escondem\"], [\"latitude e longitude\", \"distancia_ao_centro\", \"Coordenadas cruas quase não têm relação linear com preço, a distância tem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O algoritmo é o motor, mas a feature é o combustível: motor bom com combustível ruim não anda longe."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas melhor descreve o que é feature engineering?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Criar, transformar e selecionar variáveis pra representar melhor o problema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher qual algoritmo de machine learning treinar em cada problema novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajustar os hiperparâmetros do modelo depois que o treino inicial já terminou.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir os dados em conjuntos de treino e de teste antes de treinar o modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados trocou uma regressão logística por um gradient boosting nas mesmas features e a métrica de validação subiu 1%. Depois, ele criou uma feature de idade a partir da data de nascimento e a métrica subiu 8%. O que esse resultado ilustra melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a qualidade das features costuma pesar mais no resultado do que a escolha entre algoritmos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que gradient boosting é sempre superior a regressão logística em qualquer conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que criar features novas é sempre mais importante do que ajustar hiperparâmetros do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o modelo mais simples deve ser preferido sempre que os dados têm poucas colunas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que se diz que feature engineering depende de conhecimento sobre o domínio do problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque saber o que é relevante no problema real ajuda a decidir quais variáveis criar ou combinar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque só especialistas em estatística conseguem programar transformações de dados em Python.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o scikit-learn exige declarar manualmente o domínio de cada variável do conjunto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque todo projeto de machine learning precisa de uma equipe multidisciplinar grande.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time comparou duas random forests idênticas em hiperparâmetros: uma recebeu o timestamp bruto da data de nascimento (dias desde 1970) e outra recebeu a idade em anos já calculada. A segunda teve desempenho de validação melhor, mesmo os dois números vindo da mesma informação. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A árvore precisa de muitos splits pra aproximar a idade a partir do timestamp bruto sozinha.",
                                "isCorrect": true
                            },
                            {
                                "text": "O timestamp bruto tem uma escala numérica inválida, então o scikit-learn rejeita essa coluna sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Random forest, ao contrário de uma árvore isolada, exige que todas as features usem a mesma unidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O timestamp bruto tem uma correlação negativa com o alvo, o que atrapalha qualquer modelo de árvore.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma cientista de dados tem duas opções antes do prazo acabar: testar mais três algoritmos diferentes com as features atuais, ou investir o tempo criando cinco features novas a partir do conhecimento do negócio. Qual tende a trazer mais ganho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Investir nas features novas, já que a representação dos dados costuma pesar mais que o algoritmo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Testar mais algoritmos, porque cada família de modelo capta um padrão que as features não expõem.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas opções tendem a trazer o mesmo ganho, já que algoritmo e feature sempre pesam de forma igual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas, porque sem ajustar hiperparâmetros nenhuma mudança altera a métrica final do modelo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criar features: interações, datas e binning",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Interações: multiplicar e combinar colunas\n\nÀs vezes o efeito de uma variável depende do valor de outra. Preço por metro quadrado importa mais quando cruzado com o bairro; tempo no site importa mais quando cruzado com o número de páginas visitadas. Quando você multiplica, divide ou combina duas colunas, cria uma **feature de interação** que expõe esse efeito conjunto sem que o modelo precise descobrir a combinação sozinho.\n\nIsso lembra a comparação que você fez na trilha de Machine Learning entre um modelo linear e uma árvore: a árvore aproxima interações fazendo splits sucessivos, mas um modelo linear, como a regressão logística, não capta interação nenhuma a menos que você entregue ela pronta como feature."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    'preco_unitario': [50, 120, 30, 80],\n    'quantidade': [10, 2, 25, 5],\n    'desconto_percentual': [0.1, 0.0, 0.2, 0.05]\n})\n\n# interação: receita bruta (multiplicação de duas colunas)\ndf['receita'] = df['preco_unitario'] * df['quantidade']\n\n# interação: receita líquida, já considerando o desconto\ndf['receita_liquida'] = df['receita'] * (1 - df['desconto_percentual'])\n\nprint(df[['receita', 'receita_liquida']])\n#    receita  receita_liquida\n# 0      500            450.0\n# 1      240            240.0\n# 2      750            600.0\n# 3      400            380.0"
                    },
                    {
                        "type": "text",
                        "value": "## Extraindo sinal de datas\n\nUma coluna de data pura, tipo `2026-07-13`, quase não ajuda o modelo do jeito que está: pra ele é só um número gigante. O sinal útil mora em como você quebra essa data em pedaços que fazem sentido pro problema.\n\n- **Dia da semana**: vendas de restaurante mudam de sexta pra terça.\n- **Mês**: sazonalidade (época de provas, black friday, período de chuva).\n- **É fim de semana**: comportamento de compra muda.\n- **É feriado**: quedas ou picos que não têm a ver com tendência nenhuma, só com o calendário."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    'data_pedido': pd.to_datetime([\n        '2026-01-05', '2026-07-04', '2026-12-25', '2026-03-17'\n    ])\n})\n\ndf['dia_semana'] = df['data_pedido'].dt.dayofweek  # 0 = segunda, 6 = domingo\ndf['mes'] = df['data_pedido'].dt.month\ndf['eh_fim_de_semana'] = df['dia_semana'].isin([5, 6]).astype(int)\n\nferiados_2026 = pd.to_datetime(['2026-01-01', '2026-12-25', '2026-04-21'])\ndf['eh_feriado'] = df['data_pedido'].isin(feriados_2026).astype(int)\n\nprint(df[['dia_semana', 'mes', 'eh_fim_de_semana', 'eh_feriado']])\n#    dia_semana  mes  eh_fim_de_semana  eh_feriado\n# 0           0    1                 0           0\n# 1           5    7                 1           0\n# 2           4   12                 0           1\n# 3           1    3                 0           0"
                    },
                    {
                        "type": "text",
                        "value": "## Agregações por grupo e binning\n\nDuas outras formas de criar sinal:\n\n- **Agregação por grupo**: resumir um grupo em um número e trazer esse resumo pra cada linha. O gasto médio histórico daquele cliente, calculado com `groupby` e `transform`, vira uma feature nova em cada pedido dele. Isso captura \"esse cliente costuma gastar muito\" sem vazar o valor daquele pedido específico.\n- **Binning**: transformar uma variável contínua em faixas categóricas. Idade vira `18-25`, `26-35`, `36-50`, `50+`. Ajuda quando a relação com o alvo não é uma linha reta (crianças e idosos compram menos que adultos, por exemplo, e uma idade contínua sozinha confunde um modelo linear)."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    'cliente_id': [1, 1, 2, 2, 3],\n    'valor_pedido': [100, 300, 50, 60, 900],\n    'idade': [22, 22, 45, 45, 67]\n})\n\n# agregação: gasto médio histórico do cliente, repetido em cada linha dele\ndf['gasto_medio_cliente'] = df.groupby('cliente_id')['valor_pedido'].transform('mean')\n\n# binning: faixa etária em vez de idade contínua\ndf['faixa_etaria'] = pd.cut(\n    df['idade'],\n    bins=[0, 25, 35, 50, 120],\n    labels=['18-25', '26-35', '36-50', '50+']\n)\n\nprint(df[['cliente_id', 'valor_pedido', 'gasto_medio_cliente', 'faixa_etaria']])\n#    cliente_id  valor_pedido  gasto_medio_cliente faixa_etaria\n# 0           1           100                 200.0        18-25\n# 1           1           300                 200.0        18-25\n# 2           2            50                  55.0        36-50\n# 3           2            60                  55.0        36-50\n# 4           3           900                 900.0          50+"
                    },
                    {
                        "type": "quote",
                        "value": "Criar uma boa feature exige menos matemática e mais pergunta: o que, nesse dado, realmente separa quem eu quero prever de quem eu não quero?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas é um exemplo de feature de interação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Multiplicar o preço unitário pela quantidade comprada pra criar uma coluna de receita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir os valores nulos de uma coluna pela média dos valores existentes nela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Padronizar uma coluna numérica pra ter média zero e desvio padrão igual a um.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover uma coluna que está perfeitamente correlacionada com outra já existente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que extrair `dia_da_semana` e `eh_feriado` de uma data costuma ajudar mais do que usar a data bruta como número?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o modelo passa a enxergar direto padrões de calendário que a data bruta esconde num número gigante.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque datas brutas sempre geram erro de tipo quando usadas dentro do scikit-learn, mesmo convertidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda coluna de data tem, por padrão, valores nulos que atrapalham o treino do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a data bruta, ao contrário do dia da semana, não pode ser normalizada com as outras colunas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual situação faz mais sentido transformar idade contínua em faixas etárias antes de treinar um modelo linear?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quando a relação com o alvo não é uma linha reta, como crianças e idosos comprando menos que adultos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando a coluna de idade tem valores faltantes que precisam ser preenchidos antes do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o modelo usado é uma árvore de decisão, já que ela não consegue dividir variáveis contínuas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando se quer reduzir o número total de linhas do conjunto de dados antes de treinar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados calculou `gasto_medio_cliente` com `groupby().transform('mean')` sobre o treino inteiro, incluindo a própria linha prevista, e usou essa feature pra prever se aquele pedido específico é fraude. Qual é o risco dessa abordagem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A média inclui o valor do próprio pedido a prever, então carrega informação que só existe por causa do alvo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A função `transform` do pandas devolve um valor por grupo, e esse formato não bate com o número de linhas originais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `groupby` por cliente sempre gera uma quantidade de grupos maior do que o número de linhas disponíveis pro treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular médias por grupo exige normalizar a coluna antes, senão o `transform` gera valores em escalas diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar `receita = preco_unitario * quantidade`, um colega sugere manter as três colunas no modelo. Qual é a preocupação mais relevante nessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Receita é uma combinação determinística das outras duas, o que pode gerar redundância sem informação nova.",
                                "isCorrect": true
                            },
                            {
                                "text": "Receita nunca deve ser usada como feature, porque é sempre a variável alvo em problemas de previsão de vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter as três colunas obriga o modelo a normalizar cada uma delas numa escala diferente antes do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn rejeita treinar um modelo quando há colunas calculadas a partir de outras do mesmo conjunto.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Transformar: escala e transformação log",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Retomando escala, agora com mais nuance\n\nNa trilha de Machine Learning você já usou `StandardScaler` pra colocar colunas em escalas comparáveis antes de treinar modelos sensíveis a distância ou a gradiente (KNN, regressão logística, redes neurais). Duas palavras que às vezes se confundem:\n\n- **Padronizar** (`StandardScaler`): subtrai a média e divide pelo desvio padrão. O resultado tem média 0 e desvio padrão 1, sem limite fixo de mínimo e máximo.\n- **Normalizar** (`MinMaxScaler`): reescala pra um intervalo fixo, normalmente 0 a 1. Bom quando os limites de mínimo e máximo observados no treino são confiáveis.\n\nÁrvore de decisão, random forest e gradient boosting não precisam de nada disso: eles decidem os splits comparando valores dentro da própria coluna, e a escala não muda esse resultado."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.preprocessing import StandardScaler, MinMaxScaler\nimport pandas as pd\n\ndf = pd.DataFrame({'renda_mensal': [1800, 3200, 25000, 4100, 2600]})\n\npadronizador = StandardScaler()\ndf['renda_padronizada'] = padronizador.fit_transform(df[['renda_mensal']])\n\nnormalizador = MinMaxScaler()\ndf['renda_normalizada'] = normalizador.fit_transform(df[['renda_mensal']])\n\nprint(df)\n#    renda_mensal  renda_padronizada  renda_normalizada\n# 0          1800            -0.6251             0.0000\n# 1          3200            -0.4672             0.0603\n# 2         25000             1.9928             1.0000\n# 3          4100            -0.3656             0.0991\n# 4          2600            -0.5349             0.0345"
                    },
                    {
                        "type": "text",
                        "value": "## Transformação log pra distribuições assimétricas\n\nRepare no exemplo acima: quatro pessoas ganham entre 1800 e 4100, e uma ganha 25000. Isso é uma **distribuição assimétrica à direita** (poucos valores bem altos puxando a cauda), comum em renda, preço de imóvel, número de visualizações de um vídeo, tempo de espera. Escalar não resolve a assimetria, só muda a unidade. Quem ajuda é a **transformação logarítmica**.\n\nSe você plotasse um histograma dessa renda crua, veria a maioria das barras espremida perto de zero e uma cauda comprida esticando pra direita. Aplicando log, a mesma distribuição fica bem mais próxima de um formato de sino: os valores baixos se espalham e o valor alto deixa de dominar a escala."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({\n    'renda_mensal': [1500, 1700, 1900, 2100, 2500, 3200, 4000, 8000, 15000, 50000]\n})\n\n# log1p = log(1 + x), evita erro quando x = 0\ndf['log_renda'] = np.log1p(df['renda_mensal'])\n\nprint(df['renda_mensal'].skew().round(2), df['log_renda'].skew().round(2))\n# 2.76 1.37   -> assimetria cai bastante depois do log, mesmo sem sumir de vez\n\n# pra voltar à escala original depois de prever em log:\n# valor_original = np.expm1(valor_previsto_em_log)"
                    },
                    {
                        "type": "text",
                        "value": "Um detalhe que pega muita gente: se você treinar o modelo pra prever `log_renda` em vez de `renda_mensal`, a previsão sai em escala log. Antes de comparar com o valor real ou mostrar pro usuário, é preciso desfazer a transformação com `np.expm1`. Esquecer esse passo é um erro comum: o modelo até treina e valida bem, mas os números finais não fazem sentido nenhum pra quem vai usar a previsão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\", \"O que faz\", \"Quando usar\"], [\"StandardScaler\", \"Deixa a coluna com média 0 e desvio padrão 1\", \"Modelos sensíveis a distância ou gradiente, sem cauda longa\"], [\"MinMaxScaler\", \"Reescala a coluna pro intervalo 0 a 1\", \"Quando os limites de mínimo e máximo do treino são confiáveis\"], [\"Transformação log\", \"Comprime valores altos, espalha valores baixos\", \"Distribuições assimétricas: renda, preço, contagens\"], [\"Nenhuma transformação\", \"Mantém os valores originais\", \"Árvores, random forest, gradient boosting\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Transformar não é maquiar o dado, é apresentar ele numa forma que o algoritmo consegue aproveitar melhor."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o efeito de aplicar `StandardScaler` numa coluna numérica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Transforma a coluna pra ter média 0 e desvio padrão 1.",
                                "isCorrect": true
                            },
                            {
                                "text": "Transforma a coluna pra ficar sempre entre os valores 0 e 1.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove os valores considerados outliers da coluna original.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui os valores ausentes da coluna pela mediana calculada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que árvores de decisão e random forest não precisam de escala nas features?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque decidem os splits comparando valores dentro da própria coluna, e isso não muda com a escala.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o scikit-learn aplica escala automaticamente por trás dos panos em qualquer modelo de árvore.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque árvores de decisão só aceitam colunas categóricas, nunca colunas numéricas contínuas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a escala já é corrigida durante a divisão entre os dados de treino e de teste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista percebe que 'preço do imóvel' tem a maioria dos valores entre 200 mil e 600 mil, mas alguns imóveis de luxo passam de 10 milhões, puxando a média pra cima. Qual transformação tende a ajudar mais um modelo linear nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aplicar transformação log, que comprime os valores altos e aproxima a distribuição de um formato simétrico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar `MinMaxScaler`, que encaixa os valores extremos entre 0 e 1 sem alterar o formato da distribuição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a coluna de preço, já que distribuições assimétricas não podem entrar num modelo linear qualquer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar `StandardScaler`, que corrige a assimetria ao subtrair a média de cada valor da coluna original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo foi treinado pra prever `log_preco` em vez de `preco`. Na hora de comparar a previsão com o preço real, o erro médio calculado ficou artificialmente pequeno e sem sentido prático. O que provavelmente foi esquecido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aplicar `np.expm1` na previsão antes de comparar com o preço real, desfazendo a transformação do treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar `StandardScaler` na previsão final antes de calcular o erro médio contra o preço real observado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recalcular a transformação log do teste separadamente, usando a média do conjunto de treino inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinar o modelo de novo, dessa vez sem aplicar nenhuma escala nas variáveis explicativas usadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um KNN treinado com 'idade' (0 a 90) e 'renda mensal' (1000 a 30000) sem nenhuma escala teve desempenho ruim, dominado quase inteiramente pela coluna de renda. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Como o KNN mede distância entre pontos, a coluna de maior magnitude domina o cálculo sem ser mais importante.",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna renda mensal tem correlação perfeita com o alvo, o que satura qualquer modelo baseado em distância.",
                                "isCorrect": false
                            },
                            {
                                "text": "O KNN, diferente de outros modelos, exige que todas as colunas estejam em formato inteiro antes do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna idade tem poucos valores únicos, o que impede o KNN de calcular distância entre os pontos direito.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Selecionar features",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que selecionar features\n\nDepois de criar um monte de features novas (interações, datas quebradas, agregações), é tentador jogar tudo pro modelo e deixar ele \"escolher\" o que importa. Só que mais colunas não é de graça:\n\n- **Mais overfitting**: com mais dimensões fica mais fácil o modelo decorar ruído do treino em vez de aprender padrão de verdade, o mesmo problema da árvore funda demais que você viu na trilha de ML, só que aqui causado pelo excesso de colunas em vez de excesso de profundidade.\n- **Mais custo computacional**: treino mais lento, tuning mais caro.\n- **Menos interpretabilidade**: fica mais difícil explicar um modelo com 200 features do que um com 15.\n\nDois tipos de coluna pra cortar logo de cara: **irrelevantes** (sem relação nenhuma com o que você quer prever, como um ID interno ou uma coluna quase constante, o mesmo valor em 99% das linhas) e **redundantes** (carregam basicamente a mesma informação de outra já presente, como `area_m2` e `area_construida` com correlação de 0.99 entre si)."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.DataFrame({\n    'area_m2': [50, 80, 120, 45, 200],\n    'area_construida': [48, 79, 118, 44, 197],  # quase idêntica a area_m2\n    'quartos': [1, 2, 3, 1, 4],\n    'id_imovel': [1001, 1002, 1003, 1004, 1005]  # irrelevante, é só identificador\n})\n\ncorrelacoes = df[['area_m2', 'area_construida', 'quartos']].corr()\nprint(correlacoes['area_m2'])\n# area_m2            1.000000\n# area_construida    0.999970\n# quartos            0.978595\n# Name: area_m2, dtype: float64\n\n# area_construida é quase redundante com area_m2: manter as duas agrega pouco\ndf_selecionado = df.drop(columns=['area_construida', 'id_imovel'])"
                    },
                    {
                        "type": "text",
                        "value": "## Correlação com o alvo, e um limite importante\n\nUm primeiro filtro simples: calcular a correlação de cada feature com o alvo e cortar as que ficam perto de zero. Funciona bem como triagem inicial, mas tem um limite: correlação de Pearson só enxerga relação **linear**. Uma feature pode ter correlação quase zero com o alvo e ainda ser extremamente útil (por exemplo, se a relação tiver formato de U). Por isso correlação é um primeiro corte, não a palavra final.\n\nPra ir além da correlação simples, o scikit-learn tem `SelectKBest`, que escolhe as `k` melhores features segundo um teste estatístico (`f_classif` pra classificação, `f_regression` pra regressão)."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.feature_selection import SelectKBest, f_classif\nimport pandas as pd\n\nX = pd.DataFrame({\n    'idade': [22, 35, 45, 28, 60, 33],\n    'renda_mensal': [2000, 5000, 8000, 3000, 12000, 4500],\n    'id_cliente': [1, 2, 3, 4, 5, 6],\n    'tempo_no_site_seg': [30, 200, 180, 45, 300, 90]\n})\ny = [0, 1, 1, 0, 1, 0]  # comprou ou não\n\nseletor = SelectKBest(score_func=f_classif, k=2)\nX_selecionado = seletor.fit_transform(X, y)\n\ncolunas_escolhidas = X.columns[seletor.get_support()]\nprint(colunas_escolhidas.tolist())\n# ['renda_mensal', 'tempo_no_site_seg']  -> id_cliente e idade ficaram de fora"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.feature_selection import SelectFromModel\n\nmodelo = RandomForestClassifier(n_estimators=200, random_state=42)\nseletor_modelo = SelectFromModel(modelo, threshold='median')\nX_selecionado_rf = seletor_modelo.fit_transform(X, y)\n\ncolunas_escolhidas_rf = X.columns[seletor_modelo.get_support()]\nprint(colunas_escolhidas_rf.tolist())\n# ['renda_mensal', 'tempo_no_site_seg']  -> só ficam as features acima da importância mediana"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\", \"Como decide\", \"Quando usar\"], [\"Correlação com o alvo\", \"Mede relação linear entre cada feature e o alvo\", \"Triagem inicial rápida, antes de treinar qualquer modelo\"], [\"SelectKBest\", \"Teste estatístico (f_classif, f_regression) por feature\", \"Selecionar um número fixo k de features, de forma simples\"], [\"SelectFromModel\", \"Importância aprendida por um modelo de árvore já treinado\", \"Aproveitar um modelo existente pra escolher as melhores features\"], [\"Correlação entre features\", \"Mede redundância entre pares de colunas explicativas\", \"Cortar redundância antes mesmo de olhar pro alvo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Selecionar features é editar: tirar o que sobra costuma valorizar mais o modelo do que acrescentar mais uma coluna."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é um motivo direto pra selecionar features antes de treinar o modelo final?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir o risco de overfitting causado pelo excesso de colunas pouco úteis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Garantir que o modelo sempre atinja acurácia de 100% no conjunto de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar artificialmente o número de linhas disponíveis pro treino do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar a necessidade de dividir os dados em conjunto de treino e teste.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma coluna de ID interno do cliente costuma ser removida antes do treino?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque é um identificador sem relação real com o padrão a prever, e pode confundir o modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque colunas numéricas com muitos dígitos sempre quebram o treinamento no scikit-learn.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque colunas de ID sempre têm valores ausentes que atrapalham o cálculo de correlação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o scikit-learn trata automaticamente qualquer coluna chamada 'id' como o alvo do modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal limitação de usar só a correlação de Pearson pra decidir quais features manter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela só capta relações lineares, e pode descartar uma feature útil com relação não linear.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela só funciona em conjuntos de dados com menos de mil linhas registradas no total.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela exige que todas as colunas estejam previamente normalizadas entre os valores 0 e 1.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela não pode ser calculada quando o alvo é uma variável categórica com duas classes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de aplicar `SelectKBest` com `k=5`, o desempenho de validação caiu em comparação com usar todas as 20 features originais. O que pode explicar essa queda?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alguma feature descartada captava uma relação não linear com o alvo que o teste estatístico não enxergou.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `SelectKBest` sempre reduz o desempenho do modelo, independente de quantas features forem mantidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor de `k` escolhido é sempre maior do que o número ideal de features pra qualquer conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Features escolhidas por teste estatístico não podem ser usadas dentro de um `Pipeline` do scikit-learn.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de regressão linear com duas features quase idênticas (`area_m2` e `area_construida`, correlação 0.99 entre si) apresentou coeficientes instáveis, mudando bastante a cada nova amostra de treino. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A redundância entre as duas colunas gera multicolinearidade e deixa os coeficientes instáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo linear não consegue processar duas colunas numéricas com valores parecidos entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "A correlação alta entre as duas colunas indica que o alvo foi vazado pras features do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coeficientes instáveis sempre indicam poucas linhas de dado pro número de colunas do modelo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Importância e vazamento de features",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Lendo feature_importances_\n\nNa trilha de Machine Learning você treinou árvores e viu como elas decidem cada split escolhendo a feature que mais reduz a bagunça (impureza) dos dados naquele ponto. Depois de treinar uma árvore, random forest ou gradient boosting, o scikit-learn guarda quanto cada feature contribuiu pra essa redução ao longo de todos os splits, de todas as árvores. Isso vira o atributo `feature_importances_`: um número por feature, somando 1 no total, dizendo o quanto o modelo usou cada coluna.\n\nTrês cuidados na hora de interpretar esse número: features correlacionadas dividem o crédito entre si (a importância de cada uma sozinha parece menor do que é de fato); importância não é causalidade (a feature ajuda a prever, isso não quer dizer que ela cause o resultado); e colunas com muitos valores distintos tendem a formar splits \"bons\" por acaso com mais frequência, o que infla a importância aparente delas."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import RandomForestClassifier\nimport pandas as pd\n\nX = pd.DataFrame({\n    'idade': [22, 35, 45, 28, 60, 33, 51, 40],\n    'renda_mensal': [2000, 5000, 8000, 3000, 12000, 4500, 9000, 6000],\n    'tempo_no_site_seg': [30, 200, 180, 45, 300, 90, 250, 120],\n    'cor_favorita_cod': [1, 3, 2, 1, 4, 2, 3, 1]  # provavelmente irrelevante\n})\ny = [0, 1, 1, 0, 1, 0, 1, 1]\n\nmodelo = RandomForestClassifier(n_estimators=300, random_state=42)\nmodelo.fit(X, y)\n\nimportancias = pd.Series(modelo.feature_importances_, index=X.columns)\nprint(importancias.sort_values(ascending=False))\n# renda_mensal          0.42\n# tempo_no_site_seg     0.35\n# idade                 0.19\n# cor_favorita_cod      0.04\n# dtype: float64"
                    },
                    {
                        "type": "text",
                        "value": "## O perigo de features vazadas\n\nTem um caso em que importância alta é motivo de alarme, não de comemoração: quando a feature está claramente vazando informação do alvo. **Vazamento (leakage)** acontece quando uma feature só existe por causa do alvo, ou carrega informação que só estaria disponível depois do momento da previsão, um dado do futuro.\n\nDois exemplos clássicos:\n\n- Prever inadimplência usando `valor_total_multas_pagas`: essa coluna praticamente só tem valor diferente de zero pra quem já ficou inadimplente. O modelo não está aprendendo a prever risco, está reconhecendo o próprio resultado disfarçado de feature.\n- Prever cancelamento de assinatura (`churn`) usando `data_de_cancelamento`: essa data só existe depois que o cliente já cancelou. No momento real da previsão, essa informação simplesmente ainda não existe."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import train_test_split\nimport pandas as pd\n\nX = pd.DataFrame({\n    'dias_em_atraso_atual': [0, 45, 0, 60, 0, 5, 0, 90],\n    'renda_mensal': [3000, 2500, 8000, 2000, 9000, 4000, 7000, 1800],\n    'valor_total_multas': [0, 320, 0, 410, 0, 15, 0, 600]  # existe por causa do alvo\n})\ny = [0, 1, 0, 1, 0, 0, 0, 1]  # inadimplente\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.25, random_state=42, stratify=y\n)\n\nmodelo = GradientBoostingClassifier(random_state=42)\nmodelo.fit(X_treino, y_treino)\n\nimportancias = pd.Series(modelo.feature_importances_, index=X.columns)\nprint(importancias.sort_values(ascending=False))\n# valor_total_multas       0.94   -> sinal de alerta, uma feature dominando quase tudo\n# dias_em_atraso_atual     0.05\n# renda_mensal             0.01\n\nprint(modelo.score(X_teste, y_teste))\n# 1.0   -> acurácia perfeita é suspeita, não motivo de comemoração"
                    },
                    {
                        "type": "text",
                        "value": "Acurácia quase perfeita ou importância concentrada quase inteira numa única feature são sinais clássicos de vazamento, o mesmo tipo de desconfiança que a matriz de confusão te ensinou a ter com métricas boas demais pra ser verdade. A pergunta que resolve a maioria dos casos é simples: essa informação estaria disponível no momento em que eu realmente preciso fazer a previsão? Se a resposta for não, a feature sai do conjunto, não importa o quanto ela pareça ajudar a métrica."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal de alerta\", \"O que pode indicar\", \"O que fazer\"], [\"Uma feature concentra quase toda a importância\", \"Possível vazamento: ela pode carregar o próprio alvo disfarçado\", \"Investigar de onde a feature vem e quando ela fica disponível\"], [\"Acurácia ou métrica quase perfeita no teste\", \"Vazamento entre treino e teste, ou feature vazada\", \"Desconfiar antes de comemorar, revisar o pipeline de dados\"], [\"Uma feature nova aumenta muito a métrica de repente\", \"Ela pode usar informação que só existe depois da previsão\", \"Perguntar se o dado estaria disponível no momento real da previsão\"], [\"Duas features quase idênticas com importância dividida\", \"Redundância, não vazamento\", \"Considerar remover uma das duas, sem alarme\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A melhor feature do mundo não vale nada se ela só existe depois que a resposta já aconteceu."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o atributo `feature_importances_` de uma random forest treinada representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O quanto cada feature contribuiu, somado nas árvores, pra reduzir a impureza dos splits.",
                                "isCorrect": true
                            },
                            {
                                "text": "A correlação linear exata entre cada feature e a variável alvo do problema estudado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A porcentagem de valores ausentes que cada feature tinha antes do treino do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem em que cada coluna aparece originalmente no dataframe de entrada usado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que duas features fortemente correlacionadas entre si tendem a aparecer com importância individual menor do que o esperado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o modelo divide o crédito entre as duas ao usar ora uma, ora outra, nos splits das árvores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o scikit-learn remove automaticamente uma das duas antes de calcular a importância final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `feature_importances_` sempre distribui a importância de forma igual entre as colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque colunas correlacionadas são combinadas numa única coluna antes do treino da árvore.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a definição mais precisa de vazamento de dados (leakage) numa feature?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma feature que carrega informação que só fica disponível depois da previsão ser feita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma feature que tem valores ausentes em mais da metade das linhas de todo o conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma feature que está numa escala numérica muito diferente das demais colunas usadas no modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma feature categórica que não foi codificada em números antes do treino do modelo utilizado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de previsão de churn atingiu 99% de acurácia no teste depois de incluir a feature `motivo_do_cancelamento`. O que essa combinação de resultado e feature sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a feature provavelmente só existe pra quem já cancelou, e está vazando o próprio alvo pro treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o modelo finalmente achou a combinação ideal de hiperparâmetros pra esse problema de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a base de dados usada tem poucas linhas, o que facilita atingir acurácia alta em qualquer teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a técnica de balanceamento de classes usada funcionou melhor do que o esperado nesse caso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa previsão de inadimplência, `score_de_credito_na_solicitacao` tem importância alta, e `valor_total_multas_pagas_depois_do_atraso` também tem importância alta. Qual das duas deve ser questionada como possível vazamento, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`valor_total_multas_pagas_depois_do_atraso`, porque essa informação só existe depois do evento que se quer prever.",
                                "isCorrect": true
                            },
                            {
                                "text": "`score_de_credito_na_solicitacao`, porque score de crédito nunca tem relação real com risco de inadimplência.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas devem ser questionadas igualmente, já que toda feature com importância alta é sinal de vazamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas, já que importância alta é sempre um bom sinal de que a feature deve ser mantida.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Ajuste de hiperparâmetros",
        "aulas": [
            {
                "titulo": "Parâmetro x hiperparâmetro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas coisas com nome parecido, que se confundem\n\nAo longo da trilha de Machine Learning você chamou `.fit()` dezenas de vezes, e nesse processo mexeu tanto em coisas que o modelo aprende sozinho quanto em coisas que você decide antes de treinar, sem sempre separar os dois grupos. Chegou a hora de separar isso direito: **parâmetro** é o que o modelo aprende a partir dos dados durante o treino; **hiperparâmetro** é o que você define antes do treino começar, e que o `fit()` não toca."
                    },
                    {
                        "type": "text",
                        "value": "## Parâmetro: o que sai do fit()\n\nQuando um `LinearRegression` termina o `fit()`, ele guarda o coeficiente de cada feature em `coef_` e o intercepto em `intercept_`. Ninguém escolheu esses números à mão: o algoritmo de otimização encontrou os valores que minimizam o erro nos dados de treino. O mesmo vale para os pesos internos de uma regressão logística, ou para as perguntas (feature e limite) que uma árvore de decisão escolhe em cada nó: tudo isso é parâmetro, aprendido, e muda se você treinar de novo com dados diferentes."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.linear_model import LinearRegression\nfrom sklearn.datasets import make_regression\n\nX, y = make_regression(n_samples=200, n_features=3, noise=10, random_state=42)\n\nmodelo = LinearRegression()\nmodelo.fit(X, y)\n\nprint(modelo.coef_)\n# [45.23 12.87 -3.41]  (aprendido a partir dos dados, ninguem escolheu)\n\nprint(modelo.intercept_)\n# 0.52  (tambem aprendido: nao e argumento do construtor)"
                    },
                    {
                        "type": "text",
                        "value": "## Hiperparâmetro: o que você define antes\n\nJá o `max_depth` de uma `DecisionTreeClassifier`, o `n_neighbors` de um `KNeighborsClassifier` ou o `learning_rate` que você vai ver no Módulo 4, de boosting, são hiperparâmetros: você escolhe o valor antes de chamar `fit()`, e o algoritmo de treino não tem como mudar isso sozinho. Lembra daquele overfitting da árvore, lá na trilha de Machine Learning, quando ela cresceu sem limite e decorou o treino? `max_depth` era exatamente o hiperparâmetro que faltava limitar."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.neighbors import KNeighborsClassifier\n\n# max_depth e n_neighbors sao hiperparametros: voce escolhe antes do fit\narvore = DecisionTreeClassifier(max_depth=4, min_samples_leaf=10, random_state=42)\nknn = KNeighborsClassifier(n_neighbors=7)\n\n# depois do fit, quem \"aprende\" sao os PARAMETROS internos\n# (os limites de cada no da arvore, os pontos guardados pelo knn)\n# max_depth continua sendo 4: o fit nao muda esse valor, so usa ele"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Parâmetro\", \"Hiperparâmetro\"], [\"Quem define o valor\", \"O algoritmo, durante o fit()\", \"Você, antes do fit()\"], [\"Muda ao treinar com dados novos?\", \"Sim, cada treino aprende valores novos\", \"Não, continua o mesmo até você trocar\"], [\"Exemplos\", \"coef_, intercept_, os limites de cada nó da árvore\", \"max_depth, n_neighbors, learning_rate, C\"], [\"Onde aparece no código\", \"Atributos com _ no final, lidos depois do fit\", \"Argumentos passados no construtor do modelo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O modelo aprende os parâmetros sozinho; os hiperparâmetros são as regras do jogo que você define antes de deixar ele jogar. Escolher bem essas regras é o assunto deste módulo inteiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois que um LinearRegression termina o treino, os valores guardados em coef_ e intercept_ são um exemplo de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "parâmetros: valores que o algoritmo aprendeu a partir dos dados de treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "hiperparâmetros: valores que controlam o comportamento geral do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "hiperparâmetros: valores escolhidos à mão antes de chamar o fit().",
                                "isCorrect": false
                            },
                            {
                                "text": "parâmetros: valores que o cientista de dados ajusta antes do treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de hiperparâmetro, e não de parâmetro aprendido pelo modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o learning_rate usado num modelo de gradient boosting.",
                                "isCorrect": true
                            },
                            {
                                "text": "os coeficientes de uma regressão logística depois do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "os limites de decisão escolhidos em cada nó de uma árvore.",
                                "isCorrect": false
                            },
                            {
                                "text": "os pesos internos ajustados por uma regressão linear treinada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o max_depth de uma árvore de decisão é considerado um hiperparâmetro, e não um parâmetro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "porque o valor é definido antes do treino, e o fit() não o altera.",
                                "isCorrect": true
                            },
                            {
                                "text": "porque nunca aparece entre os argumentos do construtor do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque o valor muda sozinho a cada nova chamada de fit().",
                                "isCorrect": false
                            },
                            {
                                "text": "porque só existe em modelos de classificação, nunca em regressão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de escolher max_depth e treinar a árvore final, os limites de decisão que ela usa em cada nó (tipo 'idade menor que 30') são:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "parâmetros, porque foram aprendidos no fit() com esse max_depth fixado.",
                                "isCorrect": true
                            },
                            {
                                "text": "hiperparâmetros, porque dependem diretamente do valor escolhido pra max_depth.",
                                "isCorrect": false
                            },
                            {
                                "text": "parâmetros, porque foram escolhidos junto com max_depth antes do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "hiperparâmetros, porque só existem depois que a árvore termina de crescer.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual situação abaixo o valor citado é um hiperparâmetro, e não um parâmetro aprendido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o C escolhido pra regularizar uma regressão logística antes do treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "o coeficiente que a regressão logística atribui a cada variável de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "a probabilidade que o predict_proba calcula pra cada classe prevista.",
                                "isCorrect": false
                            },
                            {
                                "text": "o intercepto que a regressão logística ajusta durante o processo de fit.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "GridSearchCV: busca em grade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Automatizando a busca manual\n\nVocê já treinou modelos trocando um hiperparâmetro na mão, olhando o score, trocando de novo. Funciona, mas não escala: com dois ou três hiperparâmetros pra testar juntos, o número de combinações cresce rápido, e testar cada uma manualmente vira trabalho repetitivo, sujeito a erro. O `GridSearchCV` do scikit-learn automatiza exatamente isso: você descreve as combinações possíveis, e ele testa todas, usando a mesma validação cruzada que você já conhece da trilha de Machine Learning em cada uma delas."
                    },
                    {
                        "type": "text",
                        "value": "## Montando o param_grid\n\nO `param_grid` é um dicionário: cada chave é o nome do hiperparâmetro, igual ao argumento do construtor do modelo, e o valor é uma lista com as opções que você quer testar. Se você passar `max_depth: [3, 5, 10]` e `min_samples_leaf: [1, 5, 10]`, o GridSearchCV testa as 9 combinações possíveis (3 x 3), cada uma validada com cross-validation."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import GridSearchCV\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=500, n_features=8, random_state=42)\n\nparam_grid = {\n    \"max_depth\": [3, 5, 10, None],\n    \"min_samples_leaf\": [1, 5, 10],\n}\n\nbusca = GridSearchCV(\n    DecisionTreeClassifier(random_state=42),\n    param_grid=param_grid,\n    cv=5,\n    scoring=\"accuracy\",\n)\nbusca.fit(X, y)\n# 4 valores de max_depth x 3 de min_samples_leaf x 5 folds = 60 treinos"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo o resultado: best_params_ e best_score_\n\nDepois do `fit()`, o objeto guarda tudo que foi testado. `best_params_` traz o dicionário com a combinação campeã, e `best_score_` traz a média da validação cruzada obtida por ela. Tem também `best_estimator_`, que já é um modelo treinado com essa combinação e com todos os dados passados pro fit, pronto pra usar direto."
                    },
                    {
                        "type": "code",
                        "value": "print(busca.best_params_)\n# {'max_depth': 5, 'min_samples_leaf': 5}\n\nprint(busca.best_score_)\n# 0.87\n\nmodelo_final = busca.best_estimator_\nprint(modelo_final.max_depth)\n# 5"
                    },
                    {
                        "type": "text",
                        "value": "## O custo de testar tudo\n\nO nome \"grade\" é literal: o GridSearchCV testa cada ponto do cruzamento entre as listas, sem pular nenhum. Isso garante que você não passa batido pela melhor combinação dentro da grade que definiu, mas o custo cresce multiplicando: número de valores de cada hiperparâmetro, vezes o número de folds do cv. Uma grade com 4 hiperparâmetros e 5 valores cada já soma 625 combinações (5 x 5 x 5 x 5), cada uma treinada cv vezes. Em modelos lentos de treinar, isso pode levar horas."
                    },
                    {
                        "type": "quote",
                        "value": "GridSearchCV não é inteligente, é sistemático: testa cada combinação da grade sem exceção. A inteligência está em você desenhar uma grade que valha a pena testar por inteiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o GridSearchCV faz, na prática?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "testa todas as combinações de uma grade de hiperparâmetros, com validação cruzada.",
                                "isCorrect": true
                            },
                            {
                                "text": "escolhe sozinho, sem grade, qual algoritmo de machine learning usar no problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "treina o modelo uma única vez, usando os hiperparâmetros padrão do scikit-learn.",
                                "isCorrect": false
                            },
                            {
                                "text": "elimina a necessidade de definir hiperparâmetros antes de treinar o modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No param_grid {'max_depth': [3, 5, 10], 'min_samples_leaf': [1, 10]}, quantas combinações o GridSearchCV testa, antes de multiplicar pelos folds do cv?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "6, o produto entre os 3 valores de max_depth e os 2 de min_samples_leaf.",
                                "isCorrect": true
                            },
                            {
                                "text": "5, a soma entre os 3 valores de max_depth e os 2 de min_samples_leaf.",
                                "isCorrect": false
                            },
                            {
                                "text": "3, apenas os valores de max_depth, já que ele aparece primeiro na grade.",
                                "isCorrect": false
                            },
                            {
                                "text": "2, apenas os valores de min_samples_leaf, testados por último na grade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao criar um GridSearchCV pra um DecisionTreeClassifier sem passar o argumento scoring, qual métrica ele usa por padrão pra decidir a melhor combinação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "a métrica padrão do estimador, que pra classificação costuma ser a acurácia.",
                                "isCorrect": true
                            },
                            {
                                "text": "o F1-score, porque é a métrica padrão de todo GridSearchCV do scikit-learn.",
                                "isCorrect": false
                            },
                            {
                                "text": "o erro quadrático médio, usado como padrão em qualquer busca de hiperparâmetros.",
                                "isCorrect": false
                            },
                            {
                                "text": "nenhuma: é obrigatório informar scoring, ou o GridSearchCV recusa a rodar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar GridSearchCV(modelo, param_grid, cv=5).fit(X, y), qual atributo guarda a combinação de hiperparâmetros com a melhor média de validação cruzada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "best_params_",
                                "isCorrect": true
                            },
                            {
                                "text": "best_estimator_",
                                "isCorrect": false
                            },
                            {
                                "text": "cv_results_",
                                "isCorrect": false
                            },
                            {
                                "text": "best_score_",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer testar 5 hiperparâmetros diferentes, cada um com 6 valores possíveis, usando GridSearchCV com cv=10. Qual é o principal problema prático dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o número de combinações cresce rápido demais, deixando a busca cara e lenta.",
                                "isCorrect": true
                            },
                            {
                                "text": "o GridSearchCV trava com mais de três hiperparâmetros numa mesma grade de busca.",
                                "isCorrect": false
                            },
                            {
                                "text": "o resultado fica pouco confiável, porque cv=10 é um valor baixo demais ali.",
                                "isCorrect": false
                            },
                            {
                                "text": "a grade não aceita hiperparâmetros com mais de cinco valores possíveis cada um.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "RandomizedSearchCV: busca aleatória",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando a grade fica grande demais\n\nNo fim da aula passada, uma grade de 4 hiperparâmetros com 5 valores cada virou uma conta de 625 combinações. Esse é o cenário onde o `RandomizedSearchCV` entra: em vez de testar cada ponto da grade, ele sorteia um número fixo de combinações, definido por você em `n_iter`, e testa só essas, cada uma validada com cross-validation como no GridSearchCV."
                    },
                    {
                        "type": "text",
                        "value": "## Como funciona o sorteio\n\nVocê ainda descreve o espaço de busca, agora chamado `param_distributions` (o equivalente ao `param_grid`), mas pode usar tanto listas quanto distribuições estatísticas do `scipy.stats`, por exemplo `randint` pra inteiros num intervalo, ou `uniform` pra números contínuos. A cada uma das `n_iter` rodadas, o RandomizedSearchCV sorteia um valor de cada hiperparâmetro dentro do que foi descrito, monta uma combinação e avalia com CV."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import RandomizedSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\nfrom scipy.stats import randint\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=500, n_features=8, random_state=42)\n\nparam_distributions = {\n    \"n_estimators\": randint(50, 500),\n    \"max_depth\": randint(2, 20),\n    \"min_samples_leaf\": randint(1, 20),\n}\n\nbusca = RandomizedSearchCV(\n    RandomForestClassifier(random_state=42),\n    param_distributions=param_distributions,\n    n_iter=30,\n    cv=5,\n    random_state=42,\n)\nbusca.fit(X, y)\n# so 30 combinacoes testadas, sorteadas dentro dos intervalos acima\n\nprint(busca.best_params_)\n# {'max_depth': 14, 'min_samples_leaf': 3, 'n_estimators': 267}"
                    },
                    {
                        "type": "text",
                        "value": "## Por que sortear pode ser tão bom quanto testar tudo\n\nParece contraintuitivo abrir mão de testar tudo, mas na prática, quando o espaço de busca é grande, boa parte dos hiperparâmetros tem pouco efeito no resultado final, e só alguns realmente importam. Testar uma grade inteira gasta boa parte do orçamento repetindo variações de um hiperparâmetro que quase não muda o score, enquanto o sorteio do RandomizedSearchCV cobre uma faixa mais ampla dos hiperparâmetros que de fato importam, com bem menos combinações."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"GridSearchCV\", \"RandomizedSearchCV\"], [\"Como escolhe as combinações\", \"Testa todas as combinações da grade\", \"Sorteia n_iter combinações do espaço\"], [\"Espaço de busca aceito\", \"Listas de valores discretos\", \"Listas ou distribuições contínuas\"], [\"Custo controlado por\", \"Tamanho da grade (cresce rápido)\", \"Valor de n_iter, escolhido por você\"], [\"Melhor cenário\", \"Poucos hiperparâmetros, poucos valores\", \"Muitos hiperparâmetros, espaço grande\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando preferir cada um\n\nComo regra prática: com dois ou três hiperparâmetros e poucos valores plausíveis pra cada um, uma grade pequena no GridSearchCV é direta e garante cobrir tudo. Quando o espaço cresce (mais hiperparâmetros, faixas contínuas, ou um modelo caro de treinar como os de boosting do Módulo 4), o RandomizedSearchCV costuma achar uma combinação quase tão boa gastando uma fração do tempo, e o `n_iter` deixa você decidir quanto orçamento de busca está disposto a gastar."
                    },
                    {
                        "type": "quote",
                        "value": "GridSearchCV pergunta: e se eu testar tudo? RandomizedSearchCV pergunta: quanto do \"tudo\" eu realmente preciso testar pra achar algo bom? Com espaço de busca grande, a segunda pergunta costuma valer mais a pena."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre RandomizedSearchCV e GridSearchCV?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "o RandomizedSearchCV sorteia um número fixo de combinações, em vez de testar todas.",
                                "isCorrect": true
                            },
                            {
                                "text": "o RandomizedSearchCV não usa validação cruzada, ao contrário do GridSearchCV.",
                                "isCorrect": false
                            },
                            {
                                "text": "o RandomizedSearchCV só funciona com modelos de ensemble, como random forest.",
                                "isCorrect": false
                            },
                            {
                                "text": "o RandomizedSearchCV escolhe hiperparâmetros sem precisar de nenhum espaço de busca.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pra que serve o argumento n_iter no RandomizedSearchCV?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "define quantas combinações de hiperparâmetros serão sorteadas e testadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "define quantos folds de validação cruzada serão usados em cada teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "define quantas vezes o modelo final será retreinado depois da busca.",
                                "isCorrect": false
                            },
                            {
                                "text": "define o número máximo de hiperparâmetros que podem entrar na busca.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No param_distributions de um RandomizedSearchCV, um hiperparâmetro pode receber tanto uma lista de valores quanto:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "uma distribuição do scipy.stats, como randint ou uniform.",
                                "isCorrect": true
                            },
                            {
                                "text": "uma função customizada, desde que retorne sempre um número inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "outro objeto GridSearchCV já treinado com uma grade menor antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "um segundo param_distributions aninhado, com valores mais específicos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de gradient boosting é caro de treinar, e a equipe quer buscar entre 6 hiperparâmetros com faixas contínuas de valores. Qual argumento do RandomizedSearchCV concentra o controle direto sobre o orçamento de tempo da busca?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "n_iter, porque define quantas combinações serão sorteadas e treinadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "cv, porque reduzir o número de folds elimina o custo da busca.",
                                "isCorrect": false
                            },
                            {
                                "text": "random_state, porque fixá-lo evita que combinações repetidas sejam testadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "param_distributions, porque menos hiperparâmetros ali reduzem o tempo total.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o RandomizedSearchCV consegue, muitas vezes, achar uma combinação quase tão boa quanto a do GridSearchCV testando bem menos combinações?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "porque nem todo hiperparâmetro pesa igual no resultado, e sortear cobre bem os que importam.",
                                "isCorrect": true
                            },
                            {
                                "text": "porque ele sempre encontra o ótimo global, diferente do GridSearchCV, que é só aproximado.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque internamente ele ainda testa a grade inteira, só exibe uma amostra do resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque ele reduz sozinho o número de features do conjunto de dados de entrada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Não vazar o teste no tuning",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O mesmo cuidado do vazamento, agora no tuning\n\nLá na trilha de Machine Learning você aprendeu que treinar o scaler com o dataset inteiro, treino e teste juntos, vaza informação e infla a avaliação, e que o Pipeline existe pra isso não acontecer por descuido. A busca de hiperparâmetros tem exatamente o mesmo risco, só que mais sutil: se você usa o conjunto de teste pra escolher qual combinação de hiperparâmetros é a melhor, o teste deixou de medir dado nunca visto, porque ele ajudou a escolher o modelo."
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo certo: CV no treino, teste só no final\n\nA prática correta é separar treino e teste primeiro, com `train_test_split`, e nunca deixar o GridSearchCV ou RandomizedSearchCV ver o conjunto de teste durante a busca. A validação cruzada, dentro da busca, roda inteiramente dentro do conjunto de treino: cada fold usado pra validar ali é uma fatia do treino, não o teste reservado. Só depois de escolher o `best_estimator_` é que ele encosta, uma única vez, no conjunto de teste, pra estimar o desempenho em dado realmente novo."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import train_test_split, GridSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=1000, n_features=10, random_state=42)\n\n# separa o teste ANTES de qualquer busca\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\nparam_grid = {\"max_depth\": [4, 8, 12, None], \"n_estimators\": [100, 300]}\n\nbusca = GridSearchCV(\n    RandomForestClassifier(random_state=42), param_grid, cv=5\n)\nbusca.fit(X_treino, y_treino)  # o CV inteiro roda dentro do treino\n\nprint(busca.best_params_)\n# {'max_depth': 12, 'n_estimators': 300}\n\nprint(busca.best_score_)\n# 0.89  (media da validacao cruzada, ainda dentro do treino)\n\n# X_teste so aparece aqui, uma vez, no fim de tudo\nprint(busca.score(X_teste, y_teste))\n# 0.87  (estimativa honesta, em dado que a busca nunca viu)"
                    },
                    {
                        "type": "text",
                        "value": "## A ideia de um conjunto de validação\n\nQuando o GridSearchCV faz cross-validation dentro do treino, ele já está, na prática, usando pedaços do treino como validação: cada fold vira teste temporário das outras rodadas. Por isso, quando alguém fala em \"conjunto de validação\" nesse contexto, normalmente está descrevendo esses folds rotativos, e não um terceiro conjunto fixo. Em alguns projetos, ainda assim, separa-se um conjunto de validação fixo (treino, validação e teste, os três juntos) quando comparar poucos modelos grandes, caros demais pra retreinar a cada fold, não compensa o custo."
                    },
                    {
                        "type": "text",
                        "value": "## Por cima: nested cross-validation\n\nExiste uma pergunta ainda mais rigorosa: e se o próprio processo de escolher os hiperparâmetros, com aquele best_score_, também estiver um pouco otimista, porque a mesma validação cruzada que ajustou a busca também virou a métrica reportada? A resposta mais rigorosa é o nested CV, a validação cruzada aninhada: uma validação cruzada externa avalia o modelo, e dentro de cada fold externo roda uma busca de hiperparâmetros completa, com sua própria validação cruzada interna, só com aquele pedaço de treino. É mais caro ainda de rodar, então na prática costuma aparecer mais em comparações científicas entre algoritmos do que no dia a dia de ajustar um modelo pra produção."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"Certo\", \"Errado\"], [\"Separar treino e teste\", \"Antes de qualquer busca de hiperparâmetros\", \"Depois de já ter espiado algum resultado\"], [\"Validação cruzada da busca\", \"Roda só dentro do conjunto de treino\", \"Roda no dataset inteiro, treino e teste juntos\"], [\"Conjunto de teste\", \"Usado uma única vez, no final\", \"Usado várias vezes pra comparar combinações\"], [\"Métrica reportada\", \"busca.score(X_teste, y_teste), depois de tudo\", \"best_score_ apresentado como desempenho final\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "best_score_ mede o quão bem a busca foi no treino; o conjunto de teste, tocado uma única vez, mede o quão bem o modelo vai lá fora. Confundir os dois é vazar o teste sem perceber."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o conjunto de teste não deve ser usado dentro do GridSearchCV ou RandomizedSearchCV, durante a busca de hiperparâmetros?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "porque o teste deixaria de medir desempenho em dado nunca visto pelo processo.",
                                "isCorrect": true
                            },
                            {
                                "text": "porque o GridSearchCV não aceita tecnicamente rodar sobre um conjunto de teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque o teste, sozinho, é sempre pequeno demais pra qualquer validação cruzada.",
                                "isCorrect": false
                            },
                            {
                                "text": "porque hiperparâmetros só podem ser ajustados usando o conjunto de treino inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No fluxo correto de tuning, a validação cruzada usada pelo GridSearchCV roda sobre:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "fatias do conjunto de treino, revezando qual fatia vira validação a cada rodada.",
                                "isCorrect": true
                            },
                            {
                                "text": "o conjunto de teste inteiro, repetido uma vez pra cada hiperparâmetro testado.",
                                "isCorrect": false
                            },
                            {
                                "text": "o dataset completo, treino e teste juntos, embaralhado antes de cada fold.",
                                "isCorrect": false
                            },
                            {
                                "text": "uma amostra aleatória nova, sorteada fora do treino e do teste originais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe rodou GridSearchCV, obteve best_score_ de 0,91 e publicou esse número como o desempenho esperado em produção, sem tocar no conjunto de teste. Qual o problema dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "best_score_ vem só da validação cruzada no treino, e pode ficar otimista.",
                                "isCorrect": true
                            },
                            {
                                "text": "best_score_ não existe de fato como atributo do GridSearchCV depois do fit.",
                                "isCorrect": false
                            },
                            {
                                "text": "o problema é usar cv na busca: deveria ter usado um único split.",
                                "isCorrect": false
                            },
                            {
                                "text": "nenhum problema, já que best_score_ já reflete o desempenho em dado novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o nested cross-validation (validação cruzada aninhada), é correto afirmar que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "a cada fold externo, roda uma busca completa de hiperparâmetros só com o treino dali.",
                                "isCorrect": true
                            },
                            {
                                "text": "dispensa por completo qualquer validação cruzada dentro do processo de busca inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "custa bem menos pra rodar, na prática, do que uma busca simples com GridSearchCV.",
                                "isCorrect": false
                            },
                            {
                                "text": "elimina de vez a necessidade de testar mais de um valor de hiperparâmetro na grade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de separar treino e teste, uma pessoa roda GridSearchCV várias vezes no mesmo treino, ajustando o param_grid a cada rodada com base no score que ela vê em busca.score(X_teste, y_teste) entre uma tentativa e outra. Qual o problema disso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o teste, mesmo fora do fit, acaba guiando as escolhas e perde a isenção.",
                                "isCorrect": true
                            },
                            {
                                "text": "nada muda, desde que o cv dentro do GridSearchCV continue igual a 5.",
                                "isCorrect": false
                            },
                            {
                                "text": "o param_grid não pode, por padrão, mudar entre uma rodada e outra.",
                                "isCorrect": false
                            },
                            {
                                "text": "o problema é só o tempo gasto: rodar várias vezes não muda o resultado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Curva de validação e custo x ganho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Enxergando o efeito de um hiperparâmetro sozinho\n\nGridSearchCV e RandomizedSearchCV respondem \"qual é a melhor combinação\", mas não mostram como o desempenho muda conforme um hiperparâmetro sobe ou desce. Pra isso existe a curva de validação: fixa todos os outros hiperparâmetros, varia só um (por exemplo, max_depth de 1 a 20) e registra o score de treino e o score de validação cruzada em cada valor. Como a plataforma não desenha o gráfico aqui, vale descrever a forma que ele costuma ter, porque ela conta uma história por si só."
                    },
                    {
                        "type": "text",
                        "value": "## A forma da curva: underfit de um lado, overfit do outro\n\nCom um max_depth muito baixo, tanto o score de treino quanto o de validação ficam baixos e próximos: a árvore é simples demais pra captar o padrão, isso é underfitting. Conforme max_depth sobe, os dois scores sobem junto, até um ponto em que o score de treino continua subindo (a árvore aprende cada vez mais detalhes), mas o score de validação estaciona ou começa a cair: dali em diante, a árvore está decorando particularidades do treino que não se repetem em dado novo, aquele overfitting que você já viu antes. O ponto ideal fica onde os dois scores estão altos e ainda próximos um do outro, antes de abrirem distância."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import validation_curve\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=500, n_features=10, random_state=42)\n\nprofundidades = range(1, 21)\n\nscores_treino, scores_val = validation_curve(\n    DecisionTreeClassifier(random_state=42),\n    X, y,\n    param_name=\"max_depth\",\n    param_range=profundidades,\n    cv=5,\n)\n\nmedia_treino = scores_treino.mean(axis=1)\nmedia_val = scores_val.mean(axis=1)\n\nfor prof, tr, val in zip(profundidades, media_treino, media_val):\n    print(prof, round(tr, 2), round(val, 2))\n# 1  0.71 0.70   (underfitting: os dois baixos e colados)\n# 6  0.94 0.89   (os dois sobem, ainda proximos)\n# 12 0.99 0.86   (treino quase perfeito, validacao ja caiu: overfitting)\n# 20 1.00 0.83   (treino decorado, validacao piorando mais ainda)"
                    },
                    {
                        "type": "text",
                        "value": "## Da curva ao trade-off: custo da busca x ganho\n\nA curva de validação não substitui o GridSearchCV (ela varia um hiperparâmetro de cada vez, isolado, enquanto uma busca real combina vários), mas ajuda a desenhar uma grade mais inteligente: se a validação já está caindo a partir de max_depth=10, testar 15, 18 ou 20 na grade é gastar tempo numa região que a curva já descartou. Esse é o trade-off que fecha o módulo: cada combinação a mais custa tempo de treino, mas o ganho de score não cresce na mesma proporção. Sair de uma grade pequena pra uma média costuma trazer ganho real; sair de uma grade grande pra uma gigantesca, na mesma faixa de valores, tende a trazer frações de melhora cada vez menores: o retorno decrescente da busca de hiperparâmetros."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\", \"Custo da busca\", \"Ganho esperado\"], [\"Poucos valores, longe do ideal\", \"Baixo\", \"Alto: sai do underfitting rápido\"], [\"Grade ampla, cobrindo região desconhecida\", \"Médio a alto\", \"Médio: ainda mapeia o comportamento\"], [\"Grade enorme, refinando casas decimais do score\", \"Muito alto\", \"Baixo: retorno decrescente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o Módulo 2\n\nVocê já sabe separar o que o modelo aprende sozinho (parâmetro) do que você decide antes (hiperparâmetro), automatizar essa escolha com GridSearchCV ou RandomizedSearchCV, manter o conjunto de teste isento durante o tuning e ler uma curva de validação pra saber quando parar de buscar. É a mesma disciplina de sempre: validação cruzada guiando a decisão, teste reservado pro veredito final.\n\nNo próximo módulo, o hiperparâmetro dá lugar a outra ideia pra melhorar um modelo: em vez de ajustar um modelo só, treinar vários e combinar as respostas. É o começo dos ensembles, começando pelo bagging e pela random forest."
                    },
                    {
                        "type": "quote",
                        "value": "A curva de validação mostra onde o modelo para de aprender e começa a decorar. Saber parar de buscar hiperparâmetro na hora certa vale tanto quanto saber buscar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a curva de validação mostra, ao variar um único hiperparâmetro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "como o score de treino e o de validação mudam conforme o hiperparâmetro varia.",
                                "isCorrect": true
                            },
                            {
                                "text": "qual é, automaticamente, a melhor combinação entre vários hiperparâmetros diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "quanto tempo, em segundos, cada combinação de hiperparâmetros leva pra treinar.",
                                "isCorrect": false
                            },
                            {
                                "text": "qual algoritmo de machine learning generaliza melhor pro conjunto de dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa curva de validação, o que indica a região onde o score de treino continua subindo, mas o score de validação estaciona ou cai?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o começo do overfitting: o modelo decorando particularidades do treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "um erro de código, já que os dois scores deveriam sempre subir juntos.",
                                "isCorrect": false
                            },
                            {
                                "text": "o começo do underfitting: o modelo simples demais pra captar o padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "um sinal de que o conjunto de validação está desbalanceado entre classes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma curva de validação pro max_depth de uma árvore mostra os dois scores baixos e próximos entre si nos valores pequenos de max_depth. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "underfitting: a árvore está simples demais pra captar o padrão dos dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "overfitting: a árvore está decorando detalhes que não se repetem fora do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "vazamento de dados: o conjunto de teste influenciou o treino nesses valores.",
                                "isCorrect": false
                            },
                            {
                                "text": "um bug na validation_curve, já que os scores nunca deveriam ficar próximos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ver que, a partir de max_depth=8, o score de validação para de melhorar, qual é o uso mais direto dessa informação ao montar o param_grid de um GridSearchCV?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "concentrar a grade numa faixa próxima de 8, sem testar valores bem maiores.",
                                "isCorrect": true
                            },
                            {
                                "text": "remover max_depth do param_grid, já que a curva sozinha revelou o valor ideal.",
                                "isCorrect": false
                            },
                            {
                                "text": "aumentar o cv da busca, já que a curva substitui os folds do GridSearchCV.",
                                "isCorrect": false
                            },
                            {
                                "text": "trocar de algoritmo, porque a estabilização indica um modelo mal escolhido ali.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe expande a grade de busca de 200 pra 4000 combinações, na mesma faixa de valores já testada antes, e o best_score_ sobe de 0,912 pra 0,914. O que essa situação ilustra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "o retorno decrescente da busca: muito mais custo computacional por um ganho pequeno.",
                                "isCorrect": true
                            },
                            {
                                "text": "um sinal claro de que a grade anterior sofria de underfitting nos hiperparâmetros.",
                                "isCorrect": false
                            },
                            {
                                "text": "que o RandomizedSearchCV teria, obrigatoriamente, piorado ainda mais esse resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "que o conjunto de teste vazou durante a expansão da grade de busca.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Ensembles: bagging e random forest",
        "aulas": [
            {
                "titulo": "Por que ensembles funcionam",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que ensembles funcionam\n\nAté agora, na trilha de Machine Learning, você treinou um modelo de cada vez: uma árvore, uma regressão, um KNN. Funciona, mas tem um limite. Todo modelo individual carrega os próprios pontos cegos, e por melhor que seja o ajuste de hiperparâmetros, sempre sobra erro que aquele modelo específico não consegue resolver sozinho.\n\nA ideia de **ensemble** é simples de enunciar e poderosa na prática: em vez de apostar tudo em um modelo só, treine vários e combine as previsões deles. Se os modelos erram de formas diferentes, os erros de uns tendem a ser compensados pelos acertos dos outros, e o resultado final fica mais preciso e, principalmente, mais estável do que qualquer um dos modelos isolados."
                    },
                    {
                        "type": "text",
                        "value": "## A sabedoria da multidão\n\nEsse fenômeno tem nome fora do machine learning: sabedoria da multidão (*wisdom of the crowd*). O exemplo clássico é do estatístico Francis Galton, que documentou um concurso numa feira de gado no início do século 20: centenas de pessoas tentaram adivinhar o peso de um boi depois de abatido e limpo. Nenhum palpite individual foi exato, mas a média de todos os palpites ficou impressionantemente próxima do peso real, mais perto do que a maioria dos especialistas individuais presentes.\n\nCom classificadores acontece algo parecido. Se você tem vários modelos, cada um só um pouco melhor do que chutar aleatoriamente, e os erros deles não estão muito correlacionados, a votação da maioria pode superar e muito qualquer um dos modelos sozinho."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\nrng = np.random.default_rng(42)\n\ndef acerto_por_votacao(n_modelos, acuracia_individual, n_simulacoes=20000):\n    \"\"\"Simula n_modelos classificadores independentes, cada um certo\n    com probabilidade acuracia_individual, e agrega por voto da maioria.\"\"\"\n    acertos = rng.random((n_simulacoes, n_modelos)) < acuracia_individual\n    votos_certos = acertos.sum(axis=1) > (n_modelos / 2)\n    return votos_certos.mean()\n\nfor n in [1, 5, 15, 51, 101]:\n    print(n, round(acerto_por_votacao(n, 0.6), 3))\n\n# 1    0.6\n# 5    0.683\n# 15   0.755\n# 51   0.856\n# 101  0.911\n# cada modelo sozinho acerta so 60% das vezes, mas a votacao de 101\n# modelos independentes acerta mais de 91%"
                    },
                    {
                        "type": "text",
                        "value": "## A condição escondida: os modelos precisam errar diferente\n\nA votação só ajuda se duas condições forem verdadeiras:\n\n- cada modelo precisa ser melhor do que o acaso, ainda que só um pouco\n- os erros dos modelos não podem estar muito correlacionados entre si\n\nSe todos os modelos erram exatamente nos mesmos exemplos, a votação não corrige nada, ela só repete o mesmo erro em coro.\n\nÉ por isso que juntar cinquenta cópias idênticas do mesmo modelo, treinadas com os mesmos dados e os mesmos hiperparâmetros, não ajuda em nada: elas vão prever exatamente a mesma coisa, sempre. O ganho de um ensemble vem da **diversidade** entre os modelos, não só da quantidade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Um modelo só\", \"Ensemble de modelos diversos\"], [\"Variância (sensibilidade aos dados de treino)\", \"Pode ser alta, dependendo do modelo\", \"Tende a ser menor, pela agregação\"], [\"Efeito de um exemplo ruidoso no treino\", \"Pode mudar bastante a previsão final\", \"Efeito diluído entre vários modelos\"], [\"Custo computacional\", \"Baixo: treina e prediz uma vez\", \"Maior: treina e prediz várias vezes\"], [\"Facilidade de interpretar o resultado\", \"Geralmente mais simples de explicar\", \"Mais difícil de explicar diretamente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir neste módulo\n\nExistem várias formas de montar um ensemble: por votação de modelos diferentes, por combinação sequencial (onde cada modelo corrige o anterior) ou por agregação de várias versões do mesmo modelo treinadas em amostras diferentes dos dados. Este módulo foca nessa última família, com destaque para a mais usada na prática: a **random forest**, que nada mais é do que um ensemble de árvores de decisão construído com bastante inteligência.\n\nAntes de chegar lá, vale relembrar por que a árvore de decisão, sozinha, é uma ótima candidata a entrar num ensemble."
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo só carrega os próprios erros sozinho. Um ensemble bem montado reparte esses erros entre vários modelos, e a votação ou a média cuida de cancelar boa parte deles."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a ideia central por trás de um ensemble de modelos em machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Combinar várias previsões pra que os erros de cada modelo se compensem entre si",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar um único modelo bem grande até memorizar todos os padrões dos dados de treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher sempre o algoritmo mais complexo disponível, descartando os mais simples",
                                "isCorrect": false
                            },
                            {
                                "text": "Repetir o mesmo algoritmo com os mesmos hiperparâmetros, várias vezes seguidas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que um ensemble de classificadores realmente melhore o resultado em relação a um modelo só, o que se espera dos modelos que o compõem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que sejam razoavelmente bons individualmente e errem de formas diferentes entre si",
                                "isCorrect": true
                            },
                            {
                                "text": "Que sejam todos exatamente iguais em estrutura e cometam os mesmos erros sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "Que sejam o mais fracos possível, já que a agregação sempre compensa qualquer fraqueza",
                                "isCorrect": false
                            },
                            {
                                "text": "Que usem exatamente os mesmos dados de treino, sem nenhuma variação de amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega treinou 50 árvores de decisão idênticas, com os mesmos dados e os mesmos hiperparâmetros, e combinou as previsões por votação. O resultado ficou igual ao de uma única árvore. Por que isso aconteceu?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque os modelos idênticos cometem os mesmos erros, sem nada pra votação compensar",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque árvores de decisão não podem, por definição, fazer parte de nenhum ensemble",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a votação por maioria só funciona corretamente com menos de dez modelos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cinquenta árvores já é um número baixo demais pra qualquer ganho estatístico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo a lógica da 'sabedoria da multidão' aplicada a classificadores, o que tende a acontecer com a acurácia da votação majoritária conforme cresce o número de modelos independentes, cada um com acurácia individual pouco acima de 50%?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A acurácia da votação tende a subir e se aproximar de 100%, se os erros forem independentes",
                                "isCorrect": true
                            },
                            {
                                "text": "A acurácia da votação cai, porque mais modelos aumentam a chance de empates na contagem",
                                "isCorrect": false
                            },
                            {
                                "text": "A acurácia da votação fica travada exatamente no valor da acurácia de cada modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "A acurácia da votação só sobe se cada modelo individual já acertar mais de 90% sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas equipes montam ensembles com 100 modelos cada, todos com acurácia individual parecida. Na equipe A, os modelos erram de forma bem correlacionada entre si. Na equipe B, os erros são bem menos correlacionados. O que esperar do ganho da agregação em cada caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O ensemble da equipe B tende a ganhar mais, porque erros pouco correlacionados se cancelam melhor",
                                "isCorrect": true
                            },
                            {
                                "text": "O ensemble da equipe A tende a ganhar mais, porque erros correlacionados são mais fáceis de corrigir",
                                "isCorrect": false
                            },
                            {
                                "text": "Não faz diferença: a correlação entre os erros dos modelos não influencia o ensemble final",
                                "isCorrect": false
                            },
                            {
                                "text": "O ensemble da equipe B tende a piorar, já que erros pouco correlacionados confundem a votação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A árvore e seu overfitting (revisão)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Relembrando a árvore de decisão\n\nLá na trilha de Machine Learning você treinou sua primeira árvore de decisão: um modelo que divide os dados repetidamente em regiões cada vez mais puras, escolhendo em cada passo a feature e o ponto de corte que mais reduzem a impureza (Gini ou entropia). É um modelo fácil de visualizar, fácil de explicar pra qualquer pessoa e capaz de capturar relações bem complexas nos dados.\n\nO problema mora exatamente nessa capacidade. Se você deixar a árvore crescer livre, sem nenhum limite, ela vai dividir os dados até sobrar uma folha quase só pra cada exemplo de treino. Nesse ponto ela não aprendeu o padrão geral, ela decorou o conjunto de treino."
                    },
                    {
                        "type": "text",
                        "value": "## O problema não é só overfitar, é ser instável\n\nVocê já viu como limitar `max_depth` ou `min_samples_leaf` ajuda a controlar o overfitting de uma árvore. Mas sobra um segundo problema, mais sutil: mesmo uma árvore razoavelmente podada é **instável**. Pequenas mudanças no conjunto de treino, como remover ou trocar uma fração pequena dos exemplos, podem mudar qual feature vira a raiz da árvore, e essa mudança lá em cima se propaga pra todas as divisões abaixo dela.\n\nSe fosse possível treinar a mesma árvore em cem amostras ligeiramente diferentes dos mesmos dados, você teria cem árvores com estruturas visivelmente diferentes entre si, mesmo vindo da mesma fonte de dados e do mesmo algoritmo."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split\nimport numpy as np\n\nX, y = load_breast_cancer(return_X_y=True, as_frame=True)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\nrng = np.random.default_rng(0)\nraizes = []\nacuracias = []\n\nfor _ in range(5):\n    idx = rng.choice(len(X_train), size=len(X_train), replace=True)\n    arvore = DecisionTreeClassifier(random_state=0)\n    arvore.fit(X_train.iloc[idx], y_train.iloc[idx])\n    raizes.append(X_train.columns[arvore.tree_.feature[0]])\n    acuracias.append(round(arvore.score(X_test, y_test), 3))\n\nprint(raizes)\n# ['worst perimeter', 'worst concave points', 'worst radius',\n#  'mean concave points', 'worst perimeter']\nprint(acuracias)\n# [0.912, 0.936, 0.924, 0.947, 0.918]\n# a raiz muda em quase toda amostra, e a acuracia oscila mais de\n# 3 pontos percentuais so por causa do reamostramento"
                    },
                    {
                        "type": "text",
                        "value": "## Viés baixo, variância alta\n\nEm termos de viés e variância (aquele equilíbrio que você já viu na trilha de Machine Learning), a árvore sem limites tem viés baixo, ela consegue se ajustar a praticamente qualquer formato de fronteira de decisão, mas paga isso com variância alta: o modelo final depende demais da amostra específica de treino que ela recebeu.\n\nLimitar `max_depth` ou aumentar `min_samples_leaf` reduz a variância, mas custa viés: a árvore fica mais simples e passa a errar até em padrões reais que ela poderia ter capturado. Existe um limite no quanto dá pra resolver a instabilidade só ajustando os hiperparâmetros de uma única árvore."
                    },
                    {
                        "type": "text",
                        "value": "## E se a instabilidade for uma vantagem escondida?\n\nAqui está a virada deste módulo: em vez de tentar podar a árvore até ela parar de balançar, dá pra aceitar a instabilidade e usá-la a favor. Se pequenas variações no treino produzem árvores diferentes, então treinar várias árvores em variações diferentes dos dados e combinar as previsões delas deve reduzir bastante essa variância, exatamente pelo mesmo princípio de ensemble que você viu na aula anterior.\n\nEssa é a ideia por trás do **bagging**, o assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "A árvore sozinha é fácil de entender e fácil de overfitar. E no detalhe ela é instável: um defeito que os ensembles estão prestes a transformar em vantagem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica torna a árvore de decisão propensa a dar overfitting quando cresce sem nenhum limite de profundidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela continua dividindo os dados até isolar ruídos e casos específicos do treino",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela aplica regularização L2 por padrão, o que aumenta bastante o viés do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é limitada por construção a no máximo três níveis de profundidade possíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela não consegue separar bem as classes, nem mesmo nos próprios dados de treino",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa dizer que uma árvore de decisão é um modelo 'instável'?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pequenas mudanças no conjunto de treino podem mudar bastante a estrutura da árvore",
                                "isCorrect": true
                            },
                            {
                                "text": "O treinamento da árvore falha com frequência e precisa ser reiniciado manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "A árvore muda a previsão pra mesma entrada toda vez que é executada novamente",
                                "isCorrect": false
                            },
                            {
                                "text": "A árvore leva um tempo bem variável pra treinar dependendo do hardware disponível",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No experimento em que cinco árvores foram treinadas em cinco amostras bootstrap diferentes do mesmo conjunto de dados, a feature escolhida como raiz mudou em quase toda árvore, e a acurácia no teste oscilou entre elas. O que esse resultado evidencia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A alta variância da árvore de decisão: pequenas mudanças na amostra mudam bastante o modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de implementação, já que a mesma árvore deveria sempre escolher a mesma raiz",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o conjunto de dados usado é pequeno demais pra qualquer algoritmo de árvore funcionar",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a árvore de decisão tem viés alto e por isso não se ajusta aos dados de treino",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Limitar a profundidade máxima (max_depth) de uma árvore de decisão, mantendo os outros hiperparâmetros fixos, tende a",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "reduzir a variância do modelo, mas aumentar o viés, já que a árvore fica mais simples",
                                "isCorrect": true
                            },
                            {
                                "text": "reduzir o viés do modelo, mas aumentar a variância, já que a árvore fica mais simples",
                                "isCorrect": false
                            },
                            {
                                "text": "reduzir viés e variância ao mesmo tempo, sem nenhum tipo de custo envolvido nisso",
                                "isCorrect": false
                            },
                            {
                                "text": "não alterar nem o viés nem a variância, apenas o tempo total de treinamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que apenas ajustar os hiperparâmetros de uma única árvore (como max_depth ou min_samples_leaf) não resolve completamente o problema da instabilidade, o que motiva o uso de técnicas como o bagging?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque limitar a árvore reduz o overfitting, mas ela segue sensível a variações no treino",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque limitar a árvore aumenta a instabilidade, ao forçar decisões de corte mais aleatórias",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a poda torna a árvore incapaz de fazer previsões em dados nunca vistos antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os hiperparâmetros da árvore afetam só o tempo de execução, não a estrutura aprendida",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Bagging",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é bagging\n\n**Bagging** é abreviação de *bootstrap aggregating*: treinar várias cópias do mesmo tipo de modelo, cada uma em uma amostra bootstrap diferente dos dados de treino, e depois agregar as previsões de todas elas. É a aplicação mais direta da ideia de ensemble que você viu na primeira aula, usando a instabilidade da árvore (vista na aula passada) como matéria-prima.\n\nO nome carrega as duas partes do processo: *bootstrap* é a forma de gerar as amostras de treino, e *aggregating* é a forma de juntar as previsões no final."
                    },
                    {
                        "type": "text",
                        "value": "## Amostragem bootstrap\n\nUma amostra bootstrap tem o mesmo tamanho do conjunto de treino original, mas é sorteada **com reposição**: um mesmo exemplo pode aparecer várias vezes na amostra, e outros podem não aparecer nenhuma vez. Na prática, cada amostra bootstrap costuma conter cerca de 63% dos exemplos originais (alguns repetidos), deixando de fora, em média, os outros 37%.\n\nEsses exemplos deixados de fora em cada amostra têm um nome: dados *out-of-bag* (OOB). Como cada modelo do bagging nunca viu os próprios dados OOB durante o treino, dá pra usá-los como uma espécie de validação gratuita, sem precisar separar um conjunto de validação à parte."
                    },
                    {
                        "type": "text",
                        "value": "## Agregando as previsões\n\nDepois de treinar um modelo em cada amostra bootstrap, o bagging combina as previsões de um jeito simples: em classificação, por votação da maioria entre as classes previstas (ou pela média das probabilidades, se o modelo expõe `predict_proba`); em regressão, pela média das previsões numéricas.\n\nO ganho vem da mesma lógica da aula 1: se cada árvore erra de um jeito um pouco diferente das outras (porque foi treinada numa amostra diferente), a média ou o voto tende a cancelar boa parte desses erros individuais. O resultado é um modelo final com variância bem menor do que qualquer árvore isolada, sem precisar simplificar cada árvore individualmente."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import BaggingClassifier\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split, cross_val_score\n\nX, y = load_breast_cancer(return_X_y=True, as_frame=True)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\narvore_unica = DecisionTreeClassifier(random_state=42)\nbagging = BaggingClassifier(\n    estimator=DecisionTreeClassifier(random_state=42),\n    n_estimators=100,\n    oob_score=True,\n    random_state=42,\n)\n\nprint(cross_val_score(arvore_unica, X_train, y_train, cv=5).mean())\n# 0.917 (arvore unica, variancia alta entre os folds)\n\nbagging.fit(X_train, y_train)\nprint(bagging.oob_score_)\n# 0.960 (avaliado nos dados out-of-bag, sem tocar no teste)\nprint(bagging.score(X_test, y_test))\n# 0.953 (o bagging costuma superar a arvore unica, com menos\n# oscilacao entre execucoes diferentes)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\", \"O que significa\"], [\"Amostragem com reposição\", \"Cada exemplo pode ser sorteado mais de uma vez na mesma amostra\"], [\"Tamanho da amostra bootstrap\", \"Igual ao do conjunto de treino original\"], [\"Dados out-of-bag (OOB)\", \"Cerca de 37% dos exemplos que ficam fora de cada amostra bootstrap\"], [\"Agregação em classificação\", \"Votação da maioria (ou média das probabilidades previstas)\"], [\"Agregação em regressão\", \"Média das previsões numéricas de cada modelo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Bagging não deixa nenhuma árvore mais esperta. Ele deixa o grupo mais estável: treinar em amostras bootstrap diferentes faz os erros puxarem pra lados diferentes, e a agregação cancela boa parte deles."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa 'bootstrap' no contexto do bagging?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma amostragem com reposição, do mesmo tamanho do conjunto original, pra treinar cada modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma técnica de normalização aplicada às features antes de treinar cada modelo do ensemble",
                                "isCorrect": false
                            },
                            {
                                "text": "Um método de validação cruzada que separa treino e teste em cinco partes iguais",
                                "isCorrect": false
                            },
                            {
                                "text": "Um algoritmo de otimização usado pra ajustar os pesos internos de cada árvore",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma amostra bootstrap do mesmo tamanho do conjunto de treino original, aproximadamente que fração dos exemplos originais costuma aparecer pelo menos uma vez?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cerca de 63%, e o restante fica de fora, podendo virar validação out-of-bag",
                                "isCorrect": true
                            },
                            {
                                "text": "Cerca de 100%, porque a amostragem com reposição sempre inclui todos os exemplos",
                                "isCorrect": false
                            },
                            {
                                "text": "Cerca de 50%, o que corresponde exatamente à metade do conjunto de treino original",
                                "isCorrect": false
                            },
                            {
                                "text": "Cerca de 10%, o que deixa cada modelo do bagging treinado com pouquíssimo dado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No bagging aplicado a um problema de classificação, como as previsões dos modelos individuais costumam ser agregadas em uma previsão final?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Por votação majoritária entre as classes previstas por cada modelo do ensemble",
                                "isCorrect": true
                            },
                            {
                                "text": "Pela soma direta dos erros de cada modelo, escolhendo a classe com o menor total",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela previsão do primeiro modelo treinado, os demais servem só como validação",
                                "isCorrect": false
                            },
                            {
                                "text": "Por um modelo adicional que aprende a corrigir sequencialmente o erro dos anteriores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que treinar vários modelos com bagging tende a reduzir a variância sem aumentar muito o viés, comparado a um único modelo instável treinado nos mesmos dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a média (ou o voto) de vários modelos com erros pouco correlacionados suaviza os erros",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque cada modelo do bagging recebe um viés adicional de propósito, o que cancela a variância",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o bagging elimina o erro de todos os modelos individuais antes de agregar as previsões",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a amostragem bootstrap reduz o número de exemplos de treino, o que simplifica os modelos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cientista de dados aplica bagging usando regressão linear simples como modelo base, em vez de árvores de decisão sem poda. Comparado ao bagging de árvores, o ganho obtido tende a ser",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Menor, porque a regressão linear já é um modelo de baixa variância, com pouco a ganhar",
                                "isCorrect": true
                            },
                            {
                                "text": "Maior, porque modelos lineares se beneficiam mais da agregação bootstrap do que as árvores",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo, já que o ganho do bagging independe completamente do modelo de base escolhido",
                                "isCorrect": false
                            },
                            {
                                "text": "Impossível de obter, pois o bagging não pode ser aplicado a modelos lineares simples",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Random Forest",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Bagging de árvores com um toque a mais\n\nA **random forest** é, na essência, um bagging de árvores de decisão. Mas o Breiman, quando propôs o algoritmo, percebeu que dava pra ir além: além de sortear as amostras de treino (o bootstrap que você viu na aula passada), a random forest também sorteia, em **cada divisão** de cada árvore, um subconjunto aleatório das features disponíveis, e escolhe a melhor divisão só dentro desse subconjunto.\n\nIsso significa que, mesmo tendo o dado inteiro disponível, uma árvore da floresta pode ser proibida de usar a feature mais óbvia numa divisão específica, e obrigada a considerar alternativas que uma árvore comum nunca cogitaria naquele ponto."
                    },
                    {
                        "type": "text",
                        "value": "## Por que sortear features ajuda\n\nPense num conjunto de dados onde uma feature é claramente a mais forte pra prever o alvo. No bagging comum de árvores, quase toda amostra bootstrap vai produzir uma árvore que escolhe essa mesma feature forte lá na raiz, porque ela domina o cálculo de impureza na maioria dos casos. O resultado são árvores parecidas entre si, e árvores parecidas cometem erros parecidos, o que limita o quanto a agregação consegue reduzir a variância (lembra da aula 1: a votação só ajuda de verdade quando os erros não são muito correlacionados).\n\nAo restringir as features candidatas em cada divisão, a random forest força as árvores a explorarem caminhos diferentes. Elas ficam menos parecidas entre si, e por isso a média das previsões delas reduz a variância de forma bem mais eficaz do que o bagging simples."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split, cross_val_score\n\nX, y = load_breast_cancer(return_X_y=True, as_frame=True)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\nfloresta = RandomForestClassifier(\n    n_estimators=200,\n    max_features='sqrt',\n    random_state=42,\n    n_jobs=-1,\n)\n\nprint(cross_val_score(floresta, X_train, y_train, cv=5).mean())\n# 0.965 (media na validacao cruzada, mais alta e mais estavel entre os folds)\n\nfloresta.fit(X_train, y_train)\nprint(floresta.score(X_test, y_test))\n# 0.959\nprint(floresta.predict(X_test.iloc[:3]))\n# [1 0 1]\nprint(floresta.predict_proba(X_test.iloc[:3]))\n# [[0.02 0.98] [0.91 0.09] [0.05 0.95]]"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import RandomForestRegressor\nfrom sklearn.datasets import fetch_california_housing\nfrom sklearn.model_selection import train_test_split\n\nX, y = fetch_california_housing(return_X_y=True, as_frame=True)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\nregressor = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)\nregressor.fit(X_train, y_train)\n\nprint(regressor.score(X_test, y_test))\n# 0.807 (R2 no teste)\nprint(regressor.predict(X_test.iloc[:3]))\n# [1.62 1.02 3.45]\n# cada arvore da floresta preve um valor numerico, e o regressor\n# final devolve a media dessas previsoes"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Árvore de decisão única\", \"Random Forest\"], [\"Viés\", \"Baixo, se deixada crescer livre\", \"Parecido ao de uma árvore livre\"], [\"Variância\", \"Alta, sensível à amostra de treino\", \"Bem menor, pela agregação de várias árvores\"], [\"Tendência a overfitar\", \"Alta, sem limitar a profundidade\", \"Bem menor, mesmo com árvores individuais profundas\"], [\"Estabilidade entre execuções\", \"Baixa: pequenas mudanças no treino mudam a árvore\", \"Alta: o resultado agregado varia pouco\"], [\"Tempo de treino e de previsão\", \"Rápido\", \"Mais lento (proporcional ao número de árvores)\"], [\"Interpretar o modelo direto\", \"Fácil de visualizar e explicar\", \"Difícil de visualizar, mas dá feature_importances_\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Uma família, dois usos\n\nRepare que a mesma ideia serve tanto pra classificação (`RandomForestClassifier`) quanto pra regressão (`RandomForestRegressor`): a diferença está só em como as árvores da floresta agregam a previsão final, votação ou média das probabilidades num caso, média direta dos valores previstos no outro. A lógica de bagging mais aleatoriedade nas features é exatamente a mesma nos dois.\n\nNa próxima aula, o foco vira prático: quais hiperparâmetros realmente importam ajustar numa random forest, e por que ela costuma ser o primeiro modelo forte que um cientista de dados tenta antes de partir pra algo mais sofisticado."
                    },
                    {
                        "type": "quote",
                        "value": "Bagging já reduz a variância. A random forest vai além: ao sortear as features em cada divisão, força as árvores a discordarem mais entre si, e é essa discordância controlada que deixa a floresta mais estável que qualquer árvore isolada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Além de treinar cada árvore em uma amostra bootstrap diferente, o que a random forest faz de adicional em relação ao bagging comum de árvores?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em cada divisão, considera apenas um subconjunto aleatório das features disponíveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Treina cada árvore usando apenas 10% dos exemplos disponíveis no conjunto de treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui a votação final por uma média ponderada definida manualmente pelo usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Limita todas as árvores da floresta a terem exatamente a mesma profundidade máxima",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que sortear um subconjunto de features em cada divisão ajuda a random forest a superar o bagging simples de árvores?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque isso decorrelaciona as árvores, deixando a média das previsões mais eficaz na variância",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque isso aumenta o viés de cada árvore individual, o que sempre melhora a acurácia final",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso reduz o tempo de treino de cada árvore, sem alterar a qualidade das previsões",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque isso impede qualquer árvore da floresta de overfitar os dados de treino sozinha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um conjunto de dados onde uma única feature é claramente mais forte que as demais para prever o alvo, o que tende a acontecer no bagging simples de árvores (sem sorteio de features), comparado à random forest?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As árvores do bagging ficam parecidas entre si, já que quase todas escolhem a feature forte",
                                "isCorrect": true
                            },
                            {
                                "text": "As árvores do bagging tendem a ficar mais diversas entre si do que as árvores da random forest",
                                "isCorrect": false
                            },
                            {
                                "text": "O bagging simples ignora automaticamente a feature mais forte, pra evitar viés no resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "Nesse cenário específico, o bagging simples sempre supera a random forest em acurácia final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No scikit-learn, o que fazem os métodos fit e predict de um RandomForestClassifier já configurado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "fit ajusta cada árvore da floresta aos dados de treino; predict agrega o voto das árvores",
                                "isCorrect": true
                            },
                            {
                                "text": "fit apenas valida os hiperparâmetros informados; predict é quem de fato treina e aplica o modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "fit treina só a primeira árvore da floresta; predict treina as demais sob demanda a cada chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "fit e predict fazem exatamente a mesma coisa no RandomForestClassifier, por compatibilidade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o uso da random forest tanto para classificação quanto para regressão no scikit-learn, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "RandomForestClassifier agrega por votação e RandomForestRegressor agrega pela média das previsões",
                                "isCorrect": true
                            },
                            {
                                "text": "RandomForestRegressor não aceita o parâmetro n_estimators, que é exclusivo da versão de classificação",
                                "isCorrect": false
                            },
                            {
                                "text": "RandomForestClassifier só pode ser usado quando o alvo tem exatamente duas classes possíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "RandomForestRegressor treina uma única árvore grande, sem qualquer amostragem bootstrap envolvida",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Usando random forest na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Os hiperparâmetros que mais importam\n\nRandom forest tem bastante hiperparâmetro configurável, mas um punhado deles concentra a maior parte do efeito no resultado:\n\n- `n_estimators`: quantas árvores compõem a floresta\n- `max_depth`: o quanto cada árvore pode crescer\n- `max_features`: quantas features são sorteadas em cada divisão\n- `min_samples_leaf` e `min_samples_split`: o tamanho mínimo de folha e de divisão\n\nAssim como no módulo de ajuste de hiperparâmetros, a forma correta de escolher esses valores é por validação cruzada no conjunto de treino, nunca espiando o conjunto de teste no processo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Hiperparâmetro\", \"O que controla\", \"Efeito de aumentar o valor\"], [\"n_estimators\", \"Número de árvores na floresta\", \"Mais estável, mais lento; ganho encolhe depois de certo ponto\"], [\"max_depth\", \"Profundidade máxima de cada árvore\", \"Árvores mais complexas; mais risco de cada uma overfitar\"], [\"max_features\", \"Quantas features são sorteadas em cada divisão\", \"Árvores mais parecidas entre si; menos ganho da agregação\"], [\"min_samples_leaf\", \"Tamanho mínimo de exemplos numa folha\", \"Árvores mais simples e mais regularizadas\"], [\"min_samples_split\", \"Mínimo de exemplos para tentar dividir um nó\", \"Árvores mais simples, com divisões menos finas\"], [\"n_jobs\", \"Quantos núcleos de CPU usar no treino\", \"Treino mais rápido; não muda o resultado do modelo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import GridSearchCV, train_test_split\nfrom sklearn.datasets import load_breast_cancer\n\nX, y = load_breast_cancer(return_X_y=True, as_frame=True)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\ngrade = {\n    'n_estimators': [100, 300],\n    'max_depth': [None, 8, 16],\n    'max_features': ['sqrt', 0.5],\n}\n\nbusca = GridSearchCV(\n    RandomForestClassifier(random_state=42),\n    param_grid=grade,\n    cv=5,\n    scoring='accuracy',\n    n_jobs=-1,\n)\nbusca.fit(X_train, y_train)\n\nprint(busca.best_params_)\n# {'max_depth': 8, 'max_features': 'sqrt', 'n_estimators': 300}\nprint(busca.best_score_)\n# 0.965 (media na validacao cruzada, dentro do treino)\nprint(busca.score(X_test, y_test))\n# 0.959 (avaliacao final, so agora tocando no teste)"
                    },
                    {
                        "type": "code",
                        "value": "# continuando o exemplo anterior, com o melhor modelo encontrado pela busca\nfloresta_final = busca.best_estimator_\n\nimportancias = sorted(\n    zip(X.columns, floresta_final.feature_importances_),\n    key=lambda par: par[1],\n    reverse=True,\n)\n\nfor nome, importancia in importancias[:5]:\n    print(f'{nome}: {importancia:.3f}')\n\n# worst concave points: 0.142\n# worst perimeter: 0.129\n# worst radius: 0.108\n# mean concave points: 0.089\n# worst area: 0.081\n# quanto maior o numero, mais aquela feature contribuiu, em media,\n# pra reduzir a impureza nas divisoes de todas as arvores da floresta"
                    },
                    {
                        "type": "text",
                        "value": "## Por que random forest é um baseline tão forte\n\nRandom forest ganhou fama de baseline que funciona quase sempre por um motivo simples: ela costuma entregar um resultado bom com pouquíssimo ajuste, os valores padrão do scikit-learn já resolvem boa parte dos problemas. Ela não exige normalizar as features (diferente de KNN ou regressão logística), lida bem com relações não lineares e com interações entre variáveis sem que você precise criar essas interações manualmente, e é bem mais resistente a overfitar do que uma árvore isolada.\n\nSoma-se a isso o fato de que o treino de cada árvore é independente das demais, o que faz a random forest paralelizar bem entre núcleos de CPU (`n_jobs=-1`), e você tem um modelo que quase sempre vale a pena treinar primeiro, antes de partir pra algo mais sofisticado."
                    },
                    {
                        "type": "text",
                        "value": "## O que a random forest não resolve sozinha\n\nVale a honestidade: random forest não é bala de prata. Com árvores muito profundas e pouco dado, ela ainda pode overfitar, só que menos e mais devagar do que uma árvore só. O modelo final é bem mais pesado pra armazenar e mais lento pra prever do que uma árvore única, porque cada previsão passa por centenas de árvores. E embora `feature_importances_` ajude bastante, você perde a leitura direta de uma árvore única: não dá pra simplesmente olhar a floresta inteira e explicar uma previsão específica em poucos passos.\n\nEm regressão existe ainda uma limitação conhecida: como a previsão final é uma média de valores vistos no treino, a random forest tem dificuldade pra **extrapolar** além do intervalo de valores que apareceu nos dados de treino."
                    },
                    {
                        "type": "quote",
                        "value": "Random forest é o baseline que você treina primeiro: robusto, difícil de overfitar feio e generoso com a importância das features. No próximo módulo entra o boosting, que troca parte dessa robustez por um ajuste mais fino e, às vezes, mais preciso."
                    }
                ],
                "questions": [
                    {
                        "statement": "O hiperparâmetro n_estimators de uma random forest controla o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número de árvores independentes que serão treinadas dentro da floresta",
                                "isCorrect": true
                            },
                            {
                                "text": "A profundidade máxima permitida para cada árvore dentro da floresta",
                                "isCorrect": false
                            },
                            {
                                "text": "O número mínimo de exemplos exigido em cada folha das árvores da floresta",
                                "isCorrect": false
                            },
                            {
                                "text": "A fração de features sorteadas em cada divisão das árvores da floresta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Aumentar bastante o max_depth das árvores de uma random forest, mantendo os outros hiperparâmetros fixos, tende a",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "aumentar o risco de cada árvore individual overfitar, mesmo com a agregação amortecendo o efeito",
                                "isCorrect": true
                            },
                            {
                                "text": "eliminar por completo o risco de overfitting, já que a random forest é imune a esse problema",
                                "isCorrect": false
                            },
                            {
                                "text": "reduzir o número de árvores necessárias na floresta para manter a mesma acurácia final",
                                "isCorrect": false
                            },
                            {
                                "text": "diminuir o tempo total de treino da floresta, pois árvores mais profundas convergem mais rápido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar um GridSearchCV para ajustar max_features de uma random forest, qual cuidado evita que a escolha final do hiperparâmetro fique otimista demais?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Avaliar cada combinação por validação cruzada no treino e reservar o teste só pra avaliação final",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher o valor de max_features que obtém a maior acurácia diretamente no conjunto de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar sempre o maior valor possível de max_features, já que testar mais features é sempre melhor",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o GridSearchCV sobre todo o conjunto de dados de uma vez, sem separar treino e teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o atributo feature_importances_ de uma random forest treinada representa, de forma resumida?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma estimativa de quanto cada feature contribuiu, em média, pra reduzir a impureza nas divisões",
                                "isCorrect": true
                            },
                            {
                                "text": "O coeficiente linear exato que cada feature teria numa regressão equivalente nos mesmos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "A correlação direta e isolada entre cada feature e a variável alvo, calculada fora do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem em que cada feature foi originalmente coletada na construção do conjunto de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de treinar uma random forest para regressão, um analista percebe que ela erra sistematicamente as previsões para valores de alvo bem acima de qualquer valor visto no treino. Qual é a explicação mais provável, dada uma limitação conhecida do modelo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A random forest agrega médias do treino, por isso não extrapola além do intervalo visto",
                                "isCorrect": true
                            },
                            {
                                "text": "A random forest nunca deveria ser usada para problemas de regressão, apenas para classificação",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de árvores configuradas na floresta certamente está abaixo do mínimo necessário",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso indica um vazamento de dados (leakage) acontecendo entre o treino e o conjunto de teste",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Ensembles: boosting",
        "aulas": [
            {
                "titulo": "A ideia de boosting (sequencial)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ensembles: boosting\n\nLá na trilha de Machine Learning você esbarrou naquele overfitting clássico da árvore de decisão sozinha: profunda demais, decorava o treino e generalizava mal. Random forest, que você viu no módulo passado, resolve isso combinando várias árvores treinadas em paralelo, cada uma numa amostra bootstrap diferente, e tirando a média dos votos. As árvores nem sabem da existência umas das outras, e é essa independência que reduz a variância do conjunto.\n\nBoosting ataca o mesmo problema (juntar modelos fracos pra formar um modelo forte) de um jeito bem diferente. Em vez de treinar tudo em paralelo, sem comunicação entre os modelos, o boosting treina em **sequência**: cada novo modelo nasce olhando pro que o modelo anterior errou."
                    },
                    {
                        "type": "text",
                        "value": "## Do fraco pro forte\n\nA ideia central do boosting é simples de enunciar: comece com um modelo bem fraco (às vezes uma árvore de profundidade 1, um *toco*, que sozinho erra bastante) e vá adicionando novos modelos fracos, cada um treinado pra corrigir o que os anteriores erraram. No fim, você soma as previsões de todos, com pesos, e o conjunto, mesmo formado só por modelos fracos, se comporta como um modelo forte.\n\nRepare na diferença de postura em relação ao random forest. Lá, cada árvore tenta ser razoavelmente boa sozinha, e a força vem da média de várias opiniões independentes. Aqui, cada modelo individual pode ser bem ruim, quase um palpite educado, mas a sequência de correções vai fechando o buraco que sobrou."
                    },
                    {
                        "type": "text",
                        "value": "## Paralelo x sequencial: a diferença que importa\n\nEssa é a diferença fundamental entre as duas famílias de ensemble que você está estudando (bagging no módulo anterior, boosting agora):\n\n- **Bagging (random forest):** os modelos são treinados em paralelo, de forma independente. Dá pra treinar todas as árvores ao mesmo tempo, em processos separados, porque uma não depende da outra. O objetivo principal é reduzir variância.\n- **Boosting:** os modelos são treinados em sequência, um depois do outro, porque cada modelo novo precisa saber o que o anterior errou. A sequência em si não dá pra paralelizar (mesmo que cada árvore, internamente, use vários núcleos). O objetivo principal é reduzir viés.\n\nEssa dependência sequencial tem um preço: treinar um boosting tende a ser mais lento que treinar um random forest com o mesmo número de árvores, já que não dá pra simplesmente distribuir tudo em vários processos ao mesmo tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Bagging (random forest)\", \"Boosting\"], [\"Treinamento\", \"Paralelo, modelos independentes\", \"Sequencial, cada modelo depende do anterior\"], [\"Foco de cada modelo\", \"Amostra bootstrap aleatória dos dados\", \"Erros deixados pelo modelo anterior\"], [\"Objetivo principal\", \"Reduzir variância\", \"Reduzir viés\"], [\"Modelos individuais\", \"Costumam ser razoavelmente fortes\", \"Costumam ser propositalmente fracos\"], [\"Paralelização do treino\", \"Fácil, cada árvore é independente\", \"Limitada, a sequência é obrigatória\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import AdaBoostClassifier\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import accuracy_score\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\n# AdaBoost é um dos algoritmos de boosting mais antigos e didáticos.\n# A cada rodada, ele aumenta o peso das amostras que o modelo anterior\n# errou, forçando o próximo \"toco\" de árvore a prestar atenção nelas.\nmodelo = AdaBoostClassifier(\n    estimator=DecisionTreeClassifier(max_depth=1),\n    n_estimators=100,\n    random_state=42\n)\nmodelo.fit(X_train, y_train)\n\ny_pred = modelo.predict(X_test)\nprint(accuracy_score(y_test, y_pred))\n# 0.87 (um único \"toco\" sozinho mal passaria de 0.60 de acurácia)"
                    },
                    {
                        "type": "quote",
                        "value": "Boosting não é sobre achar um modelo genial de uma vez só. É sobre errar rápido, admitir o erro e treinar o próximo modelo pra cobrir exatamente esse buraco, repetidas vezes, até o conjunto ficar bom."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o treinamento dos modelos num algoritmo de boosting?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os modelos são treinados em sequência, e cada um foca nos erros do anterior",
                                "isCorrect": true
                            },
                            {
                                "text": "Os modelos são treinados em paralelo, cada um numa amostra bootstrap diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "Os modelos são treinados uma única vez e depois reaproveitados em outras bases",
                                "isCorrect": false
                            },
                            {
                                "text": "Os modelos são treinados em paralelo e depois combinados por votação simples",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega diz que bagging e boosting são basicamente a mesma ideia, só com nomes diferentes. Qual é a diferença conceitual mais importante entre eles?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Bagging reduz variância com modelos independentes; boosting reduz viés em sequência",
                                "isCorrect": true
                            },
                            {
                                "text": "Bagging só funciona bem com regressão linear; boosting só funciona com árvores rasas",
                                "isCorrect": false
                            },
                            {
                                "text": "Bagging exige obrigatoriamente validação cruzada; boosting dispensa qualquer avaliação",
                                "isCorrect": false
                            },
                            {
                                "text": "Bagging serve apenas para problemas de classificação; boosting serve só pra regressão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No AdaBoost, o que acontece com o peso das amostras que o modelo anterior classificou errado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O peso delas aumenta, forçando o próximo modelo a prestar mais atenção nelas",
                                "isCorrect": true
                            },
                            {
                                "text": "O peso delas diminui, pra evitar que o próximo modelo repita o mesmo erro",
                                "isCorrect": false
                            },
                            {
                                "text": "As amostras erradas são removidas do conjunto de treino da rodada seguinte",
                                "isCorrect": false
                            },
                            {
                                "text": "O peso de todas as amostras é reiniciado do zero a cada nova rodada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, em geral, não dá pra paralelizar o treinamento dos modelos dentro de um boosting da mesma forma que se faz num random forest?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque cada modelo novo depende do erro deixado pelo modelo treinado antes dele",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque as bibliotecas de boosting não têm suporte a múltiplos núcleos de processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada modelo do boosting usa um conjunto de dados completamente diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o boosting sempre treina um único modelo grande, sem etapas separadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem vários *tocos* de árvore, cada um acertando pouco mais que o acaso sozinho. Isso é um problema pro boosting?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não necessariamente: boosting é feito pra combinar modelos fracos assim num conjunto forte",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque boosting só funciona bem com modelos já fortes e precisos individualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque modelos fracos tornam o treinamento sequencial impossível de executar",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas o resultado final vai ser idêntico ao de um único modelo fraco isolado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Gradient Boosting",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Gradient Boosting: corrigindo o resíduo aos poucos\n\nO AdaBoost que você viu na aula passada resolve o problema reponderando amostras: erra numa amostra, aumenta o peso dela, o próximo modelo presta mais atenção. O Gradient Boosting generaliza essa ideia de um jeito mais direto: em vez de mexer no peso das amostras, ele ajusta cada novo modelo pra prever o **resíduo**, ou seja, o erro que sobrou da previsão atual.\n\nPensa numa regressão de preço de imóvel. A primeira árvore pode ser só a média dos preços de treino. O erro entre essa média e o preço real de cada imóvel é o resíduo. A segunda árvore não tenta prever o preço de novo: ela tenta prever esse resíduo. A previsão da segunda árvore é somada (com um fator de ajuste) à primeira, o resíduo diminui, e uma terceira árvore tenta prever o que ainda sobrou. E assim por diante."
                    },
                    {
                        "type": "text",
                        "value": "## E na classificação?\n\nEm classificação não existe um resíduo tão literal quanto em regressão (a diferença entre uma probabilidade prevista e uma classe 0 ou 1 não é bem um erro numérico direto), mas a lógica é parecida: a cada rodada, o algoritmo calcula o quanto errou em relação a uma função de perda e treina a próxima árvore pra reduzir esse erro. É daí que vem o nome *gradient*: cada árvore nova segue a direção que mais reduz essa perda."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import GradientBoostingRegressor\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import mean_absolute_error\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\nmodelo = GradientBoostingRegressor(\n    n_estimators=200,\n    learning_rate=0.1,\n    max_depth=3,\n    random_state=42\n)\nmodelo.fit(X_train, y_train)\n\ny_pred = modelo.predict(X_test)\nprint(mean_absolute_error(y_test, y_pred))\n# 2.35 (cada árvore nova aprendeu a prever o resíduo que sobrou da anterior)"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.metrics import classification_report\n\nmodelo_clf = GradientBoostingClassifier(\n    n_estimators=150,\n    learning_rate=0.1,\n    max_depth=3,\n    random_state=42\n)\nmodelo_clf.fit(X_train, y_train)\n\ny_pred = modelo_clf.predict(X_test)\nprint(classification_report(y_test, y_pred))\n# a mesma leitura de precision, recall e matriz de confusão que você já\n# conhece, agora calculada em cima das previsões do ensemble sequencial"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"O que acontece\"], [\"1\", \"Um modelo inicial simples prevê algo básico (por exemplo, a média do alvo)\"], [\"2\", \"Calcula-se o resíduo: a diferença entre essa previsão e o valor real\"], [\"3\", \"Uma nova árvore é treinada pra prever justamente esse resíduo\"], [\"4\", \"A previsão da nova árvore é somada à anterior, escalada pela learning_rate\"], [\"5\", \"O processo se repete por n_estimators rodadas, reduzindo o resíduo a cada passo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Gradient boosting não tenta acertar tudo de uma vez. Cada árvore nova tem uma tarefa bem específica: aprender só o pedaço do erro que ainda sobrou da rodada anterior."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual classe do scikit-learn você usa pra aplicar gradient boosting num problema de regressão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GradientBoostingRegressor",
                                "isCorrect": true
                            },
                            {
                                "text": "GradientBoostingClassifier",
                                "isCorrect": false
                            },
                            {
                                "text": "RandomForestRegressor",
                                "isCorrect": false
                            },
                            {
                                "text": "AdaBoostRegressor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de treinar a primeira árvore de um gradient boosting pra prever preço de imóveis, os resíduos ainda mostram um padrão forte relacionado ao bairro. O que isso sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a próxima árvore ainda tem um erro sistemático pra corrigir, ligado ao bairro",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o modelo já convergiu, e novas árvores não vão mudar mais a previsão final",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a variável bairro deve ser removida do conjunto de dados imediatamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o gradient boosting não consegue lidar com variáveis categóricas como bairro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre gradient boosting e AdaBoost na forma de corrigir os erros do modelo anterior?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gradient boosting ajusta a árvore ao resíduo do erro; o AdaBoost reforça o peso das amostras erradas",
                                "isCorrect": true
                            },
                            {
                                "text": "Gradient boosting reforça o peso das amostras erradas; o AdaBoost ajusta a árvore ao resíduo do erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Gradient boosting treina todas as árvores em paralelo; o AdaBoost treina uma árvore só, por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Gradient boosting não usa árvores de decisão; o AdaBoost funciona apenas com árvores bem profundas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o método se chama gradient boosting, e não algo como *residual boosting*?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque cada árvore segue a direção que reduz a função de perda usada no treino",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o algoritmo esconde uma rede neural treinada por gradiente descendente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque gradient é apenas um nome comercial, sem relação com o método usado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as árvores são treinadas de trás pra frente, da última rodada até a primeira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar um GradientBoostingClassifier, o recall da classe minoritária ficou bem baixo no classification_report, mesmo com acurácia alta. Isso tem relação direta com o fato de ser um boosting?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não necessariamente, esse padrão costuma apontar desbalanceamento de classes, comum a qualquer modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque gradient boosting sempre ignora por completo as classes minoritárias durante o treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o cálculo do resíduo no gradient boosting considera só a classe majoritária",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque gradient boosting nunca deve ser avaliado usando o classification_report",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "XGBoost, LightGBM e CatBoost",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## XGBoost, LightGBM e CatBoost: o estado da arte\n\nO GradientBoostingClassifier e o GradientBoostingRegressor do scikit-learn são ótimos pra entender o algoritmo por dentro, mas no dia a dia, e principalmente em competições de dados tabulares, quem domina é um trio de bibliotecas especializadas: **XGBoost**, **LightGBM** e **CatBoost**. Todas implementam a mesma ideia de gradient boosting que você acabou de ver, só que com anos de engenharia em cima pra treinar mais rápido, usar menos memória e generalizar melhor."
                    },
                    {
                        "type": "text",
                        "value": "## Por que elas dominam\n\nEssas bibliotecas ficaram famosas por um motivo simples: em bases de dados tabulares (linhas e colunas, o tipo mais comum em empresas), elas costumam entregar o melhor resultado com o menor esforço de preparo. Isso vem de otimizações como divisão de nós por histograma (mais rápida que testar cada valor possível), regularização embutida contra overfitting, suporte nativo a valores ausentes e, em alguns casos, treino em GPU.\n\nVale uma nota de honestidade aqui: mesmo com todo esse avanço, gradient boosting bem ajustado costuma superar redes neurais profundas em dados tabulares. Isso não quer dizer que deep learning seja ruim (você vai ver isso lá na frente, no módulo sobre redes neurais), só que, pra tabela de linhas e colunas, árvores em sequência costumam ganhar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Biblioteca\", \"Origem\", \"Diferencial\", \"Bom pra\"], [\"XGBoost\", \"Projeto open source, famoso em competições desde 2014\", \"Regularização forte embutida, muito testado e documentado\", \"Ponto de partida padrão em quase qualquer problema tabular\"], [\"LightGBM\", \"Microsoft\", \"Crescimento das árvores por folha, treino muito rápido\", \"Bases grandes, quando o tempo de treino importa muito\"], [\"CatBoost\", \"Yandex\", \"Lida nativamente com variáveis categóricas\", \"Bases com muitas colunas categóricas\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import xgboost as xgb\n\nmodelo = xgb.XGBClassifier(\n    n_estimators=300,\n    learning_rate=0.05,\n    max_depth=4,\n    random_state=42\n)\nmodelo.fit(X_train, y_train)\n\ny_pred = modelo.predict(X_test)\n# XGBoost segue a mesma interface fit/predict do scikit-learn,\n# então dá pra usar dentro de um Pipeline ou de um GridSearchCV normalmente"
                    },
                    {
                        "type": "code",
                        "value": "import lightgbm as lgb\n\nmodelo = lgb.LGBMClassifier(\n    n_estimators=300,\n    learning_rate=0.05,\n    max_depth=-1,\n    random_state=42\n)\nmodelo.fit(X_train, y_train)\n\ny_pred = modelo.predict(X_test)\n# max_depth=-1 é o padrão do LightGBM: sem limite explícito de profundidade,\n# porque o crescimento é por folha (leaf-wise), e não por nível"
                    },
                    {
                        "type": "code",
                        "value": "from catboost import CatBoostClassifier\n\nmodelo = CatBoostClassifier(\n    iterations=300,\n    learning_rate=0.05,\n    depth=4,\n    random_seed=42,\n    verbose=False\n)\nmodelo.fit(X_train, y_train)\n\ny_pred = modelo.predict(X_test)\n# no CatBoost os hiperparâmetros mudam de nome (iterations em vez de\n# n_estimators, depth em vez de max_depth), mas a lógica é a mesma:\n# boosting sequencial corrigindo o erro anterior"
                    },
                    {
                        "type": "quote",
                        "value": "Não existe uma biblioteca certa entre XGBoost, LightGBM e CatBoost. Existem trade-offs de velocidade, tipo de dado e facilidade de uso, e a única forma de saber qual funciona melhor no seu problema é testar mais de uma."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais três bibliotecas são citadas como o estado da arte em gradient boosting pra dados tabulares?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "XGBoost, LightGBM e CatBoost",
                                "isCorrect": true
                            },
                            {
                                "text": "XGBoost, TensorFlow e Keras",
                                "isCorrect": false
                            },
                            {
                                "text": "LightGBM, PyTorch e CatBoost",
                                "isCorrect": false
                            },
                            {
                                "text": "Scikit-learn, XGBoost e TensorFlow",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que XGBoost e LightGBM costumam treinar mais rápido que o GradientBoostingClassifier padrão do scikit-learn em bases grandes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque usam otimizações de engenharia, como divisão por histograma, no cálculo de cada árvore",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque treinam todas as árvores em paralelo, como um random forest, em vez de sequencialmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque usam árvores bem mais profundas, o que exige menos rodadas de treino no total",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque reduzem automaticamente o tamanho da base de dados antes de começar o treino",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o diferencial mais citado do CatBoost em relação às outras bibliotecas de boosting?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lidar nativamente com variáveis categóricas, sem exigir codificação manual antes do treino",
                                "isCorrect": true
                            },
                            {
                                "text": "Ser a única entre as três bibliotecas de boosting com suporte a treino em GPU",
                                "isCorrect": false
                            },
                            {
                                "text": "Não exigir absolutamente nenhum hiperparâmetro configurado pela pessoa que treina",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinar exclusivamente modelos de regressão, nunca conseguindo lidar com classificação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time está numa tarefa com uma tabela de milhões de linhas e várias colunas categóricas de alta cardinalidade. Qual caminho tende a exigir menos preparo manual?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Testar bibliotecas como CatBoost ou LightGBM, feitas pra lidar bem com esse cenário",
                                "isCorrect": true
                            },
                            {
                                "text": "Descartar as colunas categóricas, já que bibliotecas de boosting não aceitam esse tipo de dado",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinar uma rede neural profunda, porque tabelas grandes sempre favorecem deep learning",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a base pra poucas centenas de linhas antes de treinar qualquer boosting",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em bases de dados tabulares, comuns na maioria dos problemas de negócio, por que gradient boosting bem ajustado costuma superar redes neurais profundas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque árvores lidam bem com poucas amostras e features heterogêneas, sem exigir tanto dado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque redes neurais só conseguem processar dados de imagem, nunca tabelas numéricas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque gradient boosting sempre treina mais rápido que qualquer rede neural, em qualquer caso",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque bibliotecas de boosting têm uma rede neural interna que substitui o ajuste manual",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boosting x random forest",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Boosting x random forest: qual escolher\n\nAgora que você já viu as duas famílias de ensemble (random forest no módulo passado, boosting neste módulo), vale comparar as duas de frente. Na prática, essa é uma decisão que você vai tomar toda vez que for atacar um problema novo de dados tabulares."
                    },
                    {
                        "type": "text",
                        "value": "## Mais preciso, porém mais sensível\n\nBem ajustado, boosting costuma vencer random forest em métrica de desempenho. Faz sentido: ele ataca o viés diretamente, corrigindo erro atrás de erro, em vez de só reduzir variância tirando a média de árvores independentes. Só que essa precisão tem um preço. Boosting é mais sensível ao ajuste de hiperparâmetros: exagerar no número de árvores ou deixar a learning_rate alta demais faz o modelo decorar o ruído do treino, um overfitting parecido com aquele da árvore de decisão sozinha, só que mais difícil de perceber, porque o desempenho no treino continua parecendo ótimo.\n\nRandom forest é mais tolerante. Mesmo com parâmetros bem básicos, dificilmente entrega um resultado ruim, porque a média de várias árvores independentes já freia boa parte do overfitting sozinha. É por isso que ele funciona tão bem como baseline, como você viu no módulo anterior."
                    },
                    {
                        "type": "text",
                        "value": "## Guia prático de escolha\n\nQuando você tem tempo pra ajustar com calma e a precisão importa muito (por exemplo, um modelo que vai rodar em produção por meses, ou uma competição de dados), vale investir em boosting. Quando você quer um resultado sólido rápido, com menos risco de errar no ajuste, random forest costuma ser o caminho mais seguro.\n\nNa prática, muita gente faz as duas coisas: treina um random forest primeiro, como piso de referência, e só parte pra uma biblioteca de boosting se o ganho de desempenho compensar o tempo extra de ajuste."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Random forest\", \"Gradient boosting\"], [\"Treinamento\", \"Paralelo, árvores independentes\", \"Sequencial, cada árvore corrige a anterior\"], [\"Tende a reduzir\", \"Variância\", \"Viés\"], [\"Ajuste de hiperparâmetros\", \"Mais tolerante, funciona bem com padrão\", \"Mais delicado, exige mais cuidado\"], [\"Risco de overfitting\", \"Mais baixo, controlado pela média das árvores\", \"Mais alto, se n_estimators e learning_rate não forem bem ajustados\"], [\"Quando usar\", \"Baseline rápido e robusto\", \"Quando dá pra investir em tuning e precisão importa muito\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\nfrom sklearn.model_selection import cross_val_score\n\nrf = RandomForestClassifier(n_estimators=300, random_state=42)\ngb = GradientBoostingClassifier(\n    n_estimators=300, learning_rate=0.05, random_state=42\n)\n\nprint(\"Random forest:\", cross_val_score(rf, X, y, cv=5).mean())\nprint(\"Gradient boosting:\", cross_val_score(gb, X, y, cv=5).mean())\n# Random forest: 0.85\n# Gradient boosting: 0.88 (mais preciso aqui, mas exigiu escolher\n# a learning_rate com cuidado pra não overfitar)"
                    },
                    {
                        "type": "quote",
                        "value": "Random forest costuma ser o baseline sólido que raramente decepciona. Boosting costuma ser o resultado que você busca depois de ajustar com calma. Comece pelo mais simples e só suba de complexidade se o ganho compensar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em geral, qual opção descreve corretamente a sensibilidade de cada algoritmo ao ajuste de hiperparâmetros?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Boosting costuma ser mais sensível ao ajuste; random forest costuma ser mais tolerante",
                                "isCorrect": true
                            },
                            {
                                "text": "Random forest costuma ser mais sensível ao ajuste; boosting costuma ser mais tolerante",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois são igualmente sensíveis, e o ajuste quase nunca muda o resultado final",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois é afetado de forma relevante pelo ajuste de hiperparâmetros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de treinar um GradientBoostingClassifier com n_estimators alto e learning_rate sem limitar bem, o desempenho no treino ficou ótimo, mas caiu bastante no teste. O que provavelmente aconteceu?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo overfitou, um risco mais comum em boosting quando os hiperparâmetros fogem do controle",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo underfitou, já que todo boosting sempre precisa de ainda mais árvores pra melhorar",
                                "isCorrect": false
                            },
                            {
                                "text": "Houve vazamento de dados entre treino e teste, um problema exclusivo de modelos de boosting",
                                "isCorrect": false
                            },
                            {
                                "text": "O random_state foi definido de forma errada, o que invalida qualquer avaliação do modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o random forest costuma ser descrito como uma escolha mais segura quando falta tempo pra ajustar hiperparâmetros com calma?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a média de árvores independentes já protege contra overfitting, mesmo com parâmetros padrão",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o random forest praticamente não erra, não importa a qualidade dos dados de treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o random forest não tem nenhum hiperparâmetro que realmente precise ser configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o random forest sempre treina muito mais rápido do que qualquer biblioteca de boosting",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma base pequena e bastante ruidosa precisa de um modelo robusto, com pouco tempo disponível pra ajuste cuidadoso. Qual ponto de partida costuma ser mais prudente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Random forest, que tende a tolerar melhor dados ruidosos e parâmetros padrão nesse cenário",
                                "isCorrect": true
                            },
                            {
                                "text": "Gradient boosting com learning_rate alta, que converge mais rápido nesse tipo de cenário ruidoso",
                                "isCorrect": false
                            },
                            {
                                "text": "XGBoost configurado com max_depth bem profundo, já que mais profundidade sempre compensa o ruído",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer um dos dois, já que o nível de ruído nos dados não influencia essa escolha de modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando random forest e gradient boosting com cross_val_score na mesma base, o gradient boosting teve uma média de acurácia menor que o random forest. Isso significa que boosting é pior de forma geral?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não necessariamente, já que boosting tende a ser mais sensível ao ajuste de hiperparâmetros",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque boosting é, por definição matemática, sempre menos preciso que random forest",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque gradient boosting nunca deveria ser avaliado usando a função cross_val_score",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque cross_val_score nunca é uma forma confiável de comparar dois modelos treinados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Hiperparâmetros do boosting (learning_rate)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Os hiperparâmetros que mais importam no boosting\n\nVocê já ajustou hiperparâmetros com GridSearchCV lá no módulo de tuning. Em boosting, a lógica de busca é a mesma, mas alguns hiperparâmetros pesam mais que outros na hora de decidir entre um modelo bom e um modelo que decorou o treino. Os três que mais merecem sua atenção são learning_rate, n_estimators e max_depth."
                    },
                    {
                        "type": "text",
                        "value": "## Learning_rate: o tamanho de cada passo\n\nO learning_rate controla o quanto a contribuição de cada nova árvore é reduzida antes de ser somada ao conjunto. Um learning_rate baixo (por exemplo, 0.01) faz cada árvore corrigir só um pedacinho do erro, então você precisa de bem mais árvores (n_estimators alto) pra chegar num ajuste equivalente. Em compensação, esse aprendizado devagar costuma generalizar melhor.\n\nUm learning_rate alto (por exemplo, 0.3) faz cada árvore corrigir uma fatia grande do erro de uma vez, então poucas árvores já bastam. O problema é que esse passo largo facilita passar do ponto ótimo e decorar particularidades do treino, sobretudo se n_estimators também for alto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"learning_rate\", \"n_estimators necessário\", \"Efeito\"], [\"Baixo (em torno de 0.01)\", \"Alto (centenas a milhares)\", \"Aprendizado devagar e estável, geralmente generaliza melhor, treino mais lento\"], [\"Médio (em torno de 0.05 a 0.1)\", \"Médio (uma centena, aproximadamente)\", \"Ponto de partida comum, equilíbrio razoável entre tempo e generalização\"], [\"Alto (em torno de 0.3)\", \"Baixo (dezenas)\", \"Aprendizado rápido, porém maior risco de passar do ponto ótimo e overfitar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Max_depth: árvores rasas de propósito\n\nNo random forest, é comum deixar as árvores crescerem bem fundo, porque cada uma precisa ser razoavelmente forte sozinha. Em boosting é o oposto: as árvores costumam ficar rasas (max_depth entre 2 e 5, tipicamente), porque cada uma só precisa aprender um pedaço pequeno e específico do erro. Árvore profunda demais dentro de um boosting tende a memorizar ruído logo nas primeiras rodadas, e sobra pouco espaço útil pras próximas árvores corrigirem alguma coisa."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import GridSearchCV\n\nparametros = {\n    \"n_estimators\": [100, 300, 500],\n    \"learning_rate\": [0.01, 0.05, 0.1],\n    \"max_depth\": [2, 3, 4]\n}\n\n# a mesma cautela do módulo de tuning vale aqui: a busca roda\n# dentro da validação cruzada, e o conjunto de teste fica de fora,\n# intocado, do mesmo jeito que o Pipeline te ensinou a não vazar dado\nbusca = GridSearchCV(\n    GradientBoostingClassifier(random_state=42),\n    param_grid=parametros,\n    cv=5,\n    scoring=\"accuracy\",\n    n_jobs=-1\n)\nbusca.fit(X_train, y_train)\n\nprint(busca.best_params_)\n# {'learning_rate': 0.05, 'max_depth': 3, 'n_estimators': 300}\nprint(busca.best_score_)\n# 0.89"
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import GradientBoostingClassifier\n\nmodelo = GradientBoostingClassifier(\n    n_estimators=1000,\n    learning_rate=0.05,\n    max_depth=3,\n    validation_fraction=0.1,\n    n_iter_no_change=10,\n    tol=1e-4,\n    random_state=42\n)\nmodelo.fit(X_train, y_train)\n\nprint(modelo.n_estimators_)\n# 342 (o treino parou sozinho bem antes de chegar em 1000 árvores,\n# porque a validação interna ficou 10 rodadas seguidas sem melhorar)"
                    },
                    {
                        "type": "quote",
                        "value": "Learning_rate baixo com n_estimators alto, quase sempre, é uma troca mais segura do que learning_rate alto com poucas árvores. Boosting recompensa quem tem paciência de ajustar com calma, e pune rápido quem não tem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o hiperparâmetro learning_rate controla no gradient boosting?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O quanto a contribuição de cada nova árvore é reduzida antes de ser somada ao conjunto",
                                "isCorrect": true
                            },
                            {
                                "text": "O número total de árvores que serão treinadas ao longo de toda a sequência do boosting",
                                "isCorrect": false
                            },
                            {
                                "text": "A profundidade máxima permitida para cada árvore individual dentro do ensemble treinado",
                                "isCorrect": false
                            },
                            {
                                "text": "A fração dos dados de treino reservada especificamente pra validação interna do modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o trade-off central entre learning_rate e n_estimators no boosting?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Learning_rate baixo costuma exigir mais n_estimators pra chegar num ajuste equivalente",
                                "isCorrect": true
                            },
                            {
                                "text": "Learning_rate e n_estimators são parâmetros redundantes, então só um precisa ser ajustado",
                                "isCorrect": false
                            },
                            {
                                "text": "Learning_rate alto sempre exige mais n_estimators pra evitar qualquer overfitting",
                                "isCorrect": false
                            },
                            {
                                "text": "N_estimators não tem nenhuma influência sobre o tempo total de treino do modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, em boosting, as árvores individuais costumam usar max_depth baixo, algo entre 2 e 5?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque cada árvore deve continuar sendo um modelo fraco, e a força vem da sequência de correções",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque árvores rasas treinam exatamente na mesma velocidade que árvores bem mais profundas e complexas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as bibliotecas de boosting nunca aceitam árvores com profundidade maior do que cinco níveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um max_depth baixo elimina de vez a necessidade de ajustar o learning_rate mais tarde",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gradient boosting foi treinado com n_estimators=2000 e learning_rate=0.3, e o desempenho no treino ficou quase perfeito, mas despencou no teste. Qual ajuste tem mais chance de resolver isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduzir o learning_rate e possivelmente o n_estimators também, com early stopping ligado",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar ainda mais o n_estimators, mantendo o learning_rate fixo em 0.3 do jeito que está",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o max_depth de cada árvore individual, pra tentar compensar o learning_rate alto",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o random_state do modelo, já que ele seria a causa principal desse overfitting",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao configurar n_iter_no_change e validation_fraction num GradientBoostingClassifier, o que esse mecanismo de early stopping faz na prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reserva parte do treino pra validação interna e para o treino se o desempenho parar de melhorar",
                                "isCorrect": true
                            },
                            {
                                "text": "Reserva parte do treino pra validação interna e reinicia o treino do zero a cada rodada sem melhora",
                                "isCorrect": false
                            },
                            {
                                "text": "Usa o conjunto de teste final da avaliação inteira pra decidir quando parar de adicionar árvores",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignora por completo o n_estimators definido pela pessoa, treinando até o desempenho final cair",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Pipelines e fluxo robusto",
        "aulas": [
            {
                "titulo": "Por que Pipeline",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que empacotar preparo e modelo num Pipeline\n\nLá na trilha de Machine Learning você já usou o `Pipeline` do scikit-learn: encadear um `StandardScaler` com um modelo, pra evitar que o scaler visse o teste antes da hora dentro da validação cruzada. Funcionou bem pra dois passos. Só que um projeto real raramente tem só um passo de preparo: você imputa valor faltante, escala colunas numéricas, codifica colunas categóricas, e só depois treina o modelo. Quanto mais passos manuais existem entre o dado bruto e o `fit`, maior a chance de um deles sair fora de ordem, ser esquecido, ou ser aplicado de um jeito no treino e de outro (sem querer) em produção.\n\nEste módulo retoma o Pipeline do ponto onde a trilha de Machine Learning parou e vai além: combinar transformações diferentes por tipo de coluna com `ColumnTransformer`, ajustar hiperparâmetros do preparo e do modelo juntos sem vazar dado, fixar a reprodutibilidade do experimento inteiro, e salvar o modelo treinado pra usar sem retreinar."
                    },
                    {
                        "type": "text",
                        "value": "## O problema que o Pipeline resolve\n\nImagine o fluxo de preparo sem `Pipeline`: ajustar um `SimpleImputer` no treino e transformar treino e teste, ajustar um `StandardScaler` no treino e transformar os dois, só então treinar o modelo. Pra prever um dado novo em produção, alguém precisa lembrar de repetir, na mesma ordem, os mesmos passos, com os mesmos objetos já ajustados (nunca um novo `fit`, só `transform`). Esquecer um passo, trocar a ordem entre `scaler` e `imputer`, ou reajustar por engano um transformador que deveria só transformar: qualquer um desses erros é silencioso, o código roda sem lançar exceção, e o modelo só erra mais (ou parece acertar mais do que deveria, se o erro for vazamento de dado).\n\nO `Pipeline` empacota a sequência inteira, preparo e modelo, num único objeto com a mesma interface `fit`/`predict`/`score` que você já usa em qualquer estimador. Chamar `pipeline.fit(X_treino, y_treino)` roda `fit_transform` em cada etapa de preparo, em ordem, e por fim `fit` no modelo final. Chamar `pipeline.predict(X_novo)` roda `transform` (nunca `fit`) em cada etapa de preparo, na mesma ordem, e por fim `predict` no modelo. Essa sequência é escrita uma única vez, ao montar o pipeline, e o objeto garante que ela se repete sempre igual."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.pipeline import Pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\npipeline = Pipeline([\n    ('imputer', SimpleImputer(strategy='median')),\n    ('scaler', StandardScaler()),\n    ('modelo', LogisticRegression())\n])\n\n# um unico fit roda, em ordem: imputer.fit_transform, scaler.fit_transform,\n# modelo.fit, sempre nessa sequencia e sempre so com o treino\npipeline.fit(X_treino, y_treino)\n\nprint(pipeline.score(X_teste, y_teste))\n# 0.90"
                    },
                    {
                        "type": "code",
                        "value": "# em producao, chega uma linha nova, com valor faltante e sem escala,\n# exatamente como ela existe no mundo real\ndado_novo = X_teste.iloc[[0]]\n\npipeline.predict(dado_novo)\n# array([1]) -> o pipeline aplicou imputer.transform e scaler.transform\n# (nunca fit) antes de chamar modelo.predict, tudo numa unica chamada\n\n# acessar uma etapa especifica pelo nome\npipeline.named_steps['scaler'].mean_\n# array([...]) -> a media que o StandardScaler aprendeu, so com o treino\n\n# fatiar o pipeline: tudo menos a ultima etapa, ou seja, so o preparo\nX_treino_preparado = pipeline[:-1].transform(X_treino)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação de risco\",\"Sem Pipeline (manual)\",\"Com Pipeline\"],[\"Ordem das etapas de preparo\",\"Depende de lembrar e escrever certo toda vez\",\"Fixada uma única vez, na montagem do objeto\"],[\"Ajustar (fit) um transformador de novo, por engano\",\"Fácil de acontecer ao copiar código pra produção\",\"predict só chama transform, nunca fit, em cada etapa\"],[\"Validação cruzada\",\"Fácil escalar antes e vazar dado entre folds\",\"Cada fold refaz o fit do zero, dentro do próprio CV\"],[\"Código de treino x código de produção\",\"Duas versões que podem divergir com o tempo\",\"O mesmo objeto, salvo e carregado, serve os dois casos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um Pipeline não deixa o modelo mais inteligente: deixa o processo mais difícil de estragar sem querer."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece quando você chama pipeline.fit(X_treino, y_treino) num Pipeline com um StandardScaler seguido de uma LogisticRegression?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O scaler roda fit_transform no treino, e a regressão logística treina com o resultado escalado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só a regressão logística é treinada: o scaler precisa ser ajustado numa chamada separada antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline treina os dois passos em paralelo, sem nenhuma ordem definida entre eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scaler fica parado durante o fit, e só passa a agir quando o predict é chamado depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega editou o código de produção e, por engano, chama scaler.fit_transform(dado_novo) manualmente antes de prever, em vez de usar pipeline.predict(dado_novo) direto. Qual o efeito mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O scaler recalcula média e desvio com o dado novo, gerando uma escala diferente da usada no treino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum efeito perceptível, já que fit_transform e transform produzem sempre o mesmo resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline detecta a chamada duplicada e ignora automaticamente o fit_transform feito à parte.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo final recusa a previsão, porque o scaler já tinha sido ajustado antes, no treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de treinar um Pipeline com as etapas 'imputer', 'scaler' e 'modelo', qual alternativa descreve como obter um novo pipeline só com as etapas de preparo, sem a etapa final?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fatiar o pipeline com pipeline[:-1], obtendo um pipeline só com as etapas de preparo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Chamar pipeline.named_steps['modelo'], que devolve todas as etapas exceto o modelo final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar pipeline.steps[-1], que remove automaticamente a última etapa da lista de etapas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamar pipeline.drop('modelo'), que descarta essa etapa e devolve as etapas anteriores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe treinou um modelo com Pipeline (imputer, scaler, modelo), mas na hora de colocar em produção reescreveu o preparo em outra linguagem, direto na API que recebe as requisições, sem usar o pipeline salvo. Qual risco isso cria?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Divergência entre o preparo do treino e o da produção, já que um detalhe reescrito diferente muda o resultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco adicional, contanto que a equipe use a mesma versão do scikit-learn nos dois ambientes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo passa a rejeitar automaticamente previsões vindas de um preparo implementado fora do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "A acurácia de produção sempre fica mais alta, já que o novo preparo não tem as limitações do scikit-learn.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma cientista de dados aplica StandardScaler().fit_transform(X) no dataset inteiro, guarda o resultado em X_norm, e só depois monta um Pipeline com um SimpleImputer e um modelo, treinado com X_norm. O que está errado nessa prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Pipeline só protege o que está dentro dele: a normalização feita antes, fora dele, ainda pode vazar dado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada está errado, porque o Pipeline detecta dados já normalizados e ajusta o restante automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SimpleImputer dentro do pipeline vai falhar, porque não aceita dados que já passaram por um scaler.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo final ignora a normalização feita fora do pipeline e recalcula tudo do zero durante o fit.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ColumnTransformer: numéricas e categóricas juntas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ColumnTransformer: uma transformação para cada tipo de coluna\n\nO Pipeline da aula passada resolve um problema, mas assume algo que quase nunca é verdade num dataset real: que faz sentido aplicar a mesma transformação em todas as colunas. Um dataset de clientes típico mistura colunas numéricas (idade, renda) com colunas categóricas (cidade, plano contratado). Escalar uma coluna de texto com `StandardScaler` não faz sentido, já que não existe média de 'São Paulo', e aplicar `OneHotEncoder` numa coluna numérica criaria uma categoria pra cada valor de idade existente, o que também não ajuda em nada.\n\nO scikit-learn resolve isso com o `ColumnTransformer`: em vez de aplicar uma transformação só a tudo, ele aplica transformações diferentes a grupos diferentes de colunas, ao mesmo tempo, dentro do mesmo objeto."
                    },
                    {
                        "type": "text",
                        "value": "## Como o ColumnTransformer organiza isso\n\nA ideia é declarar uma lista de trincas: um nome, um transformador, e a lista de colunas que aquele transformador deve receber. Cada transformador enxerga só as colunas atribuídas a ele, nunca as colunas das outras trincas. No fim do `fit_transform`, o `ColumnTransformer` concatena, lado a lado, a saída de cada transformador, formando uma única matriz pronta pra alimentar o modelo."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\n\ncolunas_numericas = ['idade', 'renda']\ncolunas_categoricas = ['cidade', 'plano']\n\npreparo = ColumnTransformer([\n    ('num', StandardScaler(), colunas_numericas),\n    ('cat', OneHotEncoder(handle_unknown='ignore'), colunas_categoricas)\n])\n\nX_treino_preparado = preparo.fit_transform(X_treino)\nprint(X_treino_preparado.shape)\n# (800, 7) -> 2 colunas numericas escaladas + 5 colunas do one-hot,\n# concatenadas lado a lado numa unica matriz"
                    },
                    {
                        "type": "text",
                        "value": "## Sub-pipelines dentro de cada branch\n\nCada uma das trincas pode receber, no lugar de um transformador único, um `Pipeline` inteiro. É assim que se resolve valor faltante separadamente por tipo de coluna: a branch numérica imputa com a mediana e depois escala, a branch categórica imputa com o valor mais frequente e depois aplica o one-hot. E colunas que não aparecem em nenhuma lista? Por padrão (`remainder='drop'`), o `ColumnTransformer` simplesmente as descarta; passar `remainder='passthrough'` faz ele repassar essas colunas sem transformar."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.pipeline import Pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.ensemble import RandomForestClassifier\n\npipeline_numerico = Pipeline([\n    ('imputer', SimpleImputer(strategy='median')),\n    ('scaler', StandardScaler())\n])\n\npipeline_categorico = Pipeline([\n    ('imputer', SimpleImputer(strategy='most_frequent')),\n    ('onehot', OneHotEncoder(handle_unknown='ignore'))\n])\n\npreparo = ColumnTransformer([\n    ('num', pipeline_numerico, colunas_numericas),\n    ('cat', pipeline_categorico, colunas_categoricas)\n])\n\npipeline_completo = Pipeline([\n    ('preparo', preparo),\n    ('modelo', RandomForestClassifier(random_state=42))\n])\n\npipeline_completo.fit(X_treino, y_treino)\nprint(pipeline_completo.score(X_teste, y_teste))\n# 0.88\n\nprint(preparo.get_feature_names_out())\n# ['num__idade' 'num__renda' 'cat__cidade_Rio de Janeiro'\n#  'cat__cidade_Sao Paulo' 'cat__plano_premium']\n# o prefixo antes de '__' mostra de qual branch cada coluna final veio"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de coluna\",\"Transformador comum\",\"Problema de usar o transformador errado\"],[\"Numérica contínua (idade, renda)\",\"SimpleImputer + StandardScaler\",\"OneHotEncoder trataria cada valor numérico como categoria própria\"],[\"Categórica nominal (cidade, plano)\",\"SimpleImputer + OneHotEncoder\",\"StandardScaler tenta calcular média e desvio de texto, e falha\"],[\"Categórica ordinal (escolaridade)\",\"Mapeamento numérico ou OrdinalEncoder\",\"OneHotEncoder descarta a ordem natural entre as categorias\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O ColumnTransformer não inventa nenhuma transformação nova: garante que cada coluna receba o tratamento certo pro seu tipo, sem você remontar a matriz final na mão."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dentro de um ColumnTransformer, o que a lista de colunas passada junto de cada transformador define?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quais colunas do DataFrame aquele transformador específico vai receber e transformar.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ordem em que as colunas vão aparecer na tabela final, depois de qualquer transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de colunas mínimo que todo o dataset precisa ter pra esse transformador funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quais colunas serão descartadas do dataset antes que qualquer transformador atue nelas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dataset tem colunas numéricas (idade, renda) e categóricas (cidade, plano). Por que aplicar um StandardScaler ao DataFrame inteiro, sem ColumnTransformer, não funciona?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O StandardScaler espera valores numéricos, e colunas categóricas em texto quebram o cálculo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O StandardScaler funciona normalmente em texto, mas ignora as colunas categóricas em silêncio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O StandardScaler exige o mesmo número de colunas numéricas e categóricas pra poder funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O StandardScaler converte automaticamente qualquer texto em número antes de calcular a escala.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é comum usar um Pipeline (imputer seguido de scaler) como transformador da branch numérica dentro de um ColumnTransformer, em vez de só o scaler direto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a branch pode ter valores faltantes, e o imputer precisa tratá-los antes do scaler agir.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o ColumnTransformer só aceita um Pipeline inteiro, nunca uma classe isolada como o scaler.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque duas etapas na mesma branch dobram automaticamente o peso dessas colunas no modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o scaler sozinho não sabe separar colunas numéricas de colunas categóricas no dataset.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um ColumnTransformer foi montado listando só 'idade', 'renda' (numéricas) e 'cidade' (categórica), mas o DataFrame de treino também tem a coluna 'id_cliente', fora das duas listas. Qual o comportamento padrão nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Por padrão (remainder='drop'), a coluna 'id_cliente' é descartada e não chega à matriz final.",
                                "isCorrect": true
                            },
                            {
                                "text": "Por padrão, a coluna 'id_cliente' é escalada automaticamente junto das colunas numéricas listadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ColumnTransformer lança um erro no fit, porque toda coluna do DataFrame precisa estar listada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por padrão, a coluna 'id_cliente' vira mais uma categoria dentro da coluna 'cidade' codificada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num ColumnTransformer com uma branch numérica (imputer + scaler) e outra categórica (imputer + onehot), a branch numérica tem acesso às colunas categóricas durante o fit?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: cada branch enxerga só as colunas atribuídas a ela, nunca as das outras branches.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, todas as branches recebem o DataFrame inteiro e decidem sozinhas o que ignorar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende do remainder: com passthrough, as branches passam a enxergar as mesmas colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só durante o transform final, quando as saídas das branches são concatenadas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Pipeline e GridSearchCV sem vazar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ajustando hiperparâmetros do preparo e do modelo juntos\n\nNo módulo de ajuste de hiperparâmetros desta trilha, o `GridSearchCV` testou combinações de hiperparâmetros de um modelo isolado, já com os dados prontos. Mas o `pipeline_completo` montado na aula passada tem hiperparâmetros em dois lugares: no `ColumnTransformer` (a estratégia do `SimpleImputer`, por exemplo) e no modelo final (`n_estimators`, `max_depth`). Tratar isso como duas buscas separadas, uma pro preparo e outra pro modelo, ignora que a melhor combinação de preparo pode depender de qual modelo está sendo usado, e vice-versa.\n\nA boa notícia: o `GridSearchCV` aceita um `Pipeline` inteiro como estimador. Ele testa combinações de hiperparâmetros do preparo e do modelo juntos, numa busca só, e continua fazendo isso sem vazar dado do teste."
                    },
                    {
                        "type": "text",
                        "value": "## A sintaxe com dois underscores\n\nPra apontar um hiperparâmetro de uma etapa específica do pipeline, o nome no `param_grid` segue o padrão `nome_da_etapa__nome_do_parametro`, com dois underscores separando os dois. Se a etapa é o `ColumnTransformer` e o hiperparâmetro está dentro de uma das branches (que também é um `Pipeline`), o caminho encadeia mais um nível: `preparo__num__imputer__strategy` aponta pro `strategy` do `imputer` dentro da branch `num` dentro da etapa `preparo`."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import GridSearchCV\n\n# pipeline_completo: o ColumnTransformer (branches 'num' e 'cat') + o modelo,\n# montados na aula anterior, com as etapas nomeadas 'preparo' e 'modelo'\n\ngrade_parametros = {\n    'preparo__num__imputer__strategy': ['mean', 'median'],\n    'modelo__n_estimators': [100, 300],\n    'modelo__max_depth': [None, 10, 20]\n}\n\nbusca = GridSearchCV(\n    pipeline_completo,\n    grade_parametros,\n    cv=5,\n    scoring='f1',\n    n_jobs=-1\n)\nbusca.fit(X_treino, y_treino)\n\nprint(busca.best_params_)\n# {'modelo__max_depth': 10, 'modelo__n_estimators': 300,\n#  'preparo__num__imputer__strategy': 'median'}\n\nprint(busca.best_score_)\n# 0.87 -> media da metrica escolhida nos folds de validacao, so com o treino\n\nmodelo_final = busca.best_estimator_\nprint(modelo_final.score(X_teste, y_teste))\n# 0.86 -> agora sim, avaliado no teste, que ficou fora do tuning inteiro"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso não vaza\n\nO `GridSearchCV` faz validação cruzada por baixo dos panos: para cada combinação do `param_grid` e cada fold, ele clona o pipeline inteiro do zero e chama `fit` só com a parte de treino daquele fold, depois avalia na parte de validação daquele fold, que nenhuma etapa (nem o `imputer`, nem o `scaler`, nem o `onehot`) viu durante aquele `fit`. Isso vale pra toda etapa dentro do pipeline, não só pro modelo final.\n\nCompare com a alternativa arriscada: ajustar o `ColumnTransformer` uma vez, fora do pipeline, transformar o dataset inteiro, e só então passar esse resultado já transformado pro `GridSearchCV`. Nesse caso, o preparo já viu, durante o seu único `fit`, dados que em algum fold vão parar do lado da validação: um vazamento clássico, que ainda se repete em cada uma das combinações testadas."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\nresultados = pd.DataFrame(busca.cv_results_)\ncolunas = ['param_modelo__n_estimators', 'param_modelo__max_depth', 'mean_test_score']\n\nprint(resultados[colunas].sort_values('mean_test_score', ascending=False).head(3))\n#    param_modelo__n_estimators  param_modelo__max_depth  mean_test_score\n# 7                          300                       10             0.87\n# 6                          300                       10             0.86\n# 10                         300                       20             0.86\n\n# cuidado com o tamanho da grade: cada hiperparametro a mais MULTIPLICA\n# o numero de combinacoes, e cada combinacao roda 'cv' vezes inteiras\nprint(len(resultados))\n# 12 combinacoes (2 x 2 x 3) -> com cv=5, isso e 60 ajustes completos do pipeline"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Abordagem\",\"O que dá pra ajustar\",\"Risco de vazamento\"],[\"GridSearchCV só no modelo, com preparo feito antes, fora do pipeline\",\"Só os hiperparâmetros do modelo\",\"Alto: o preparo já viu treino e validação juntos, de uma vez\"],[\"GridSearchCV no pipeline inteiro (preparo e modelo juntos)\",\"Hiperparâmetros do preparo e do modelo, ao mesmo tempo\",\"Baixo: cada fold refaz o preparo do zero, só com aquele treino\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um GridSearchCV que não enxerga o preparo otimiza só metade do problema, e ainda corre o risco de comemorar um número que o teste vai desmentir depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num Pipeline com as etapas nomeadas 'preparo' e 'modelo', qual é a forma correta de o param_grid apontar pro hiperparâmetro n_estimators da etapa 'modelo'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "'modelo__n_estimators', com dois underscores entre o nome da etapa e do hiperparâmetro.",
                                "isCorrect": true
                            },
                            {
                                "text": "'modelo.n_estimators', com um ponto entre o nome da etapa e o nome do hiperparâmetro.",
                                "isCorrect": false
                            },
                            {
                                "text": "'n_estimators', só o nome do hiperparâmetro, já que o pipeline tem um único modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "'modelo->n_estimators', com uma seta entre o nome da etapa e o do hiperparâmetro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe faz fit_transform do ColumnTransformer no dataset inteiro, guarda o resultado, e só depois roda GridSearchCV passando só o modelo e essa matriz já transformada. O que esse fluxo compromete?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A validação cruzada deixa de ser confiável, já que o preparo viu dados de cada fold de validação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada é comprometido, contanto que o GridSearchCV use um número alto de folds na validação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O GridSearchCV recusa a execução, porque exige receber sempre um Pipeline como estimador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o tempo de execução aumenta, já que refazer o preparo em cada fold deixaria tudo mais lento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um param_grid combina 3 valores de um hiperparâmetro do preparo, 4 valores de um hiperparâmetro do modelo e 3 valores de outro hiperparâmetro do modelo, com cv=5. Quantos ajustes o GridSearchCV realiza no total?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "180, já que as 36 combinações possíveis (3 x 4 x 3) são multiplicadas pelos 5 folds.",
                                "isCorrect": true
                            },
                            {
                                "text": "36, já que o número de folds da validação cruzada só conta uma vez, no final da busca.",
                                "isCorrect": false
                            },
                            {
                                "text": "10, somando direto os valores possíveis de cada hiperparâmetro do preparo e do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "5, um único ajuste por fold, já que o GridSearchCV reaproveita a mesma combinação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de montar o pipeline_completo e o param_grid, alguém chama busca.fit(X, y), usando o dataset inteiro em vez de X_treino, y_treino, já separado antes com train_test_split. Qual o problema mais direto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O conjunto reservado pra teste entra no tuning e deixa de ser uma medida final independente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O GridSearchCV lança um erro, porque exige receber só o conjunto de treino como argumento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum problema, já que a validação cruzada interna do GridSearchCV separa treino e teste sozinha.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de execução cai bastante, porque o dataset completo tem menos linhas que só o treino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de busca.fit(X_treino, y_treino), o valor de busca.best_score_ foi 0.89. Qual a interpretação correta desse número?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A média da métrica nos folds de validação, usando só o treino, pra melhor combinação encontrada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O desempenho do modelo final no conjunto de teste, já com a melhor combinação encontrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A métrica calculada uma única vez, treinando e avaliando no mesmo conjunto de treino inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A porcentagem de combinações testadas no param_grid que bateram um limite mínimo aceitável.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Reprodutibilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Reprodutibilidade: por que o mesmo código precisa dar o mesmo resultado\n\nDesde o começo da trilha de Machine Learning, o `train_test_split` sempre apareceu com `random_state=42`. Até aqui isso pode ter parecido um detalhe de sintaxe pra copiar sem pensar demais, mas é a ponta de um princípio bem mais amplo: **reprodutibilidade**. Um experimento é reprodutível quando rodar o mesmo código, com o mesmo dado, produz o mesmo resultado de novo, seja amanhã, seja daqui a um ano, seja no computador de outra pessoa da equipe.\n\nIsso importa por um motivo prático e nada abstrato: sem reprodutibilidade, comparar dois modelos de forma justa fica impossível (a diferença de métrica pode ser sorte da divisão dos dados, não mérito de um modelo sobre o outro), depurar um erro relatado por outra pessoa fica muito mais difícil, e ninguém mais consegue auditar ou confiar no resultado que você reportou."
                    },
                    {
                        "type": "text",
                        "value": "## Onde a aleatoriedade se esconde\n\nO `train_test_split` é só uma das fontes de aleatoriedade num pipeline de ML. O `RandomForestClassifier` sorteia, internamente, quais linhas entram em cada amostra bootstrap e quais features cada árvore pode considerar em cada divisão. Um `KFold` ou `StratifiedKFold` com `shuffle=True` embaralha as linhas antes de formar os folds. Até o `RandomizedSearchCV`, que sorteia quais combinações de hiperparâmetros testar, depende de uma semente aleatória. Fixar `random_state` só no `train_test_split` e deixar essas outras fontes soltas ainda deixa o experimento parcialmente irreprodutível."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\n\nRANDOM_STATE = 42\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y\n)\n\nvalidacao = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)\n\nmodelo = RandomForestClassifier(n_estimators=300, random_state=RANDOM_STATE)\n\nbusca = GridSearchCV(modelo, {'max_depth': [5, 10, None]}, cv=validacao)\nbusca.fit(X_treino, y_treino)\n\n# rodando esse bloco de novo, do zero, em qualquer maquina com as mesmas\n# versoes de biblioteca: mesmos folds, mesma divisao, mesma floresta"
                    },
                    {
                        "type": "text",
                        "value": "## Além do random_state: versão de biblioteca e registro do experimento\n\nFixar a semente resolve a aleatoriedade do código, mas não é a reprodutibilidade inteira. O `scikit-learn`, o `pandas` e o `numpy` mudam de versão com o tempo, e uma mudança de versão pode alterar um valor padrão ou uma implementação interna, produzindo um resultado levemente diferente mesmo com o `random_state` idêntico. Por isso vale fixar as versões usadas (num `requirements.txt` ou `pyproject.toml`) junto do código, e manter uma cópia (ou um identificador claro) do dado exato usado em cada experimento, não só do script que o processa.\n\nTambém vale registrar, pra cada execução, quais hiperparâmetros foram usados e qual métrica saiu no final: sem isso, ninguém sabe depois qual configuração gerou qual modelo salvo. Ferramentas como o `MLflow` automatizam esse registro, mas mesmo uma planilha ou um arquivo de log simples já ajuda bastante. Vale um limite honesto: `random_state` fixo garante uma reprodutibilidade muito forte, mas não é uma garantia absoluta bit a bit em qualquer hardware ou sistema operacional."
                    },
                    {
                        "type": "code",
                        "value": "import json\nfrom datetime import datetime\nimport sklearn\n\nregistro = {\n    'data': datetime.now().isoformat(),\n    'random_state': RANDOM_STATE,\n    'modelo': 'RandomForestClassifier',\n    'melhores_parametros': busca.best_params_,\n    'score_validacao': busca.best_score_,\n    'score_teste': busca.best_estimator_.score(X_teste, y_teste),\n    'sklearn_version': sklearn.__version__\n}\n\nwith open('experimentos.jsonl', 'a') as arquivo:\n    print(json.dumps(registro), file=arquivo)\n# cada execucao vira uma linha nova: um historico simples, que ja\n# responde 'qual configuracao gerou qual resultado' meses depois"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fonte de aleatoriedade\",\"Onde aparece\",\"Como fixar\"],[\"Divisão entre treino e teste\",\"train_test_split\",\"random_state=42\"],[\"Amostragem bootstrap e sorteio de features\",\"RandomForestClassifier, RandomForestRegressor\",\"random_state=42\"],[\"Ordem dos folds quando shuffle=True\",\"KFold, StratifiedKFold\",\"random_state=42 junto com shuffle=True\"],[\"Sorteio de quais combinações testar\",\"RandomizedSearchCV\",\"random_state=42\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Fixar random_state não é birra de curso: é o que separa 'meu modelo deu 91 por cento' de um resultado que outra pessoa consegue conferir."
                    }
                ],
                "questions": [
                    {
                        "statement": "Rodar o mesmo código de treino duas vezes, sem fixar random_state em nenhum lugar, tende a produzir:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Divisões de treino e teste, e resultados de modelo, ligeiramente diferentes a cada execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Exatamente o mesmo modelo e a mesma métrica final, já que o algoritmo é sempre determinístico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de execução, já que o scikit-learn exige random_state definido em todo objeto aleatório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo cada vez mais preciso, já que cada execução aprende com a divisão da anterior.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de fixar random_state no train_test_split, por que também vale a pena fixá-lo no RandomForestClassifier usado depois?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a floresta usa amostragem bootstrap e sorteio de features, outra fonte de aleatoriedade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque sem isso o RandomForestClassifier não converge e lança um erro ao final do treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque fixar random_state no modelo aumenta a acurácia final, independente dos dados usados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o RandomForestClassifier reaproveita sozinho o random_state do train_test_split.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo treinado há um ano, com o mesmo código e o mesmo random_state, produz resultado levemente diferente ao ser retreinado hoje. O que pode explicar isso, mesmo com a semente fixada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As versões das bibliotecas usadas podem ter mudado, alterando algum padrão ou cálculo interno.",
                                "isCorrect": true
                            },
                            {
                                "text": "O random_state perde o efeito depois de um tempo, e precisa ser trocado periodicamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Isso não poderia acontecer: random_state fixo garante resultado idêntico pra sempre, sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de dados muda sozinho com o tempo, mesmo quando ninguém edita o arquivo original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois modelos foram treinados em datas diferentes, com hiperparâmetros diferentes, mas ninguém registrou qual configuração gerou qual resultado salvo. Qual problema prático isso causa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fica difícil saber depois qual configuração gerou o modelo, dificultando repetir o resultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois modelos param de funcionar automaticamente, por faltar o registro formal de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scikit-learn recusa carregar um modelo salvo sem um arquivo de registro de experimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A acurácia dos dois modelos cai pela metade, por faltar o histórico de parâmetros usados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Mesmo fixando random_state em tudo, o que ainda pode impedir uma reprodução idêntica, bit a bit, entre duas máquinas diferentes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Diferenças de versão de biblioteca ou de hardware entre as máquinas ainda podem gerar variações.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada: random_state fixo já é garantia absoluta de resultado idêntico, em qualquer hardware.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho do dataset, já que datasets grandes tornam qualquer semente aleatória inválida.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tipo de modelo usado, já que só modelos de regressão de fato respeitam o random_state.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Salvando o modelo com joblib e organizando o projeto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Salvando o modelo treinado com joblib\n\nDepois da aula passada, você tem em mãos `busca.best_estimator_`: um Pipeline inteiro (preparo com ColumnTransformer e modelo) já ajustado com os melhores hiperparâmetros encontrados pelo GridSearchCV, com `random_state` fixado em todo canto que precisava. Falta uma última pergunta prática: precisa retreinar esse pipeline inteiro toda vez que alguém for usar o modelo?\n\nA resposta é não, e é aí que entra o `joblib`, um pacote (que acompanha o scikit-learn, mas é independente dele) especializado em salvar em disco objetos Python que carregam muitos arrays do NumPy por dentro, exatamente o caso de um Pipeline treinado. Dá pra usar o `pickle` da biblioteca padrão pra mesma coisa, mas o `joblib` costuma ser mais rápido e gerar arquivos menores pra esse tipo de objeto, e é o que a própria documentação do scikit-learn recomenda."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\n\n# apos o busca.fit(X_treino, y_treino) da aula passada\nmodelo_final = busca.best_estimator_\n\n# salva o pipeline inteiro (preparo + modelo) num unico arquivo\njoblib.dump(modelo_final, 'modelos/modelo_v1.joblib')\n# ['modelos/modelo_v1.joblib']\n\n# em outro processo, outro dia, sem repetir nenhum treino:\npipeline_carregado = joblib.load('modelos/modelo_v1.joblib')\n\ndado_novo = X_teste.iloc[[0]]\npipeline_carregado.predict(dado_novo)\n# array([1]) -> imputer, scaler, onehot e o modelo, tudo aplicado de novo,\n# exatamente como foi ajustado no treino, sem escrever esse codigo outra vez\n\n# cuidado: joblib.load executa codigo Python ao desserializar,\n# entao so carregue arquivos .joblib de origem em que voce confia"
                    },
                    {
                        "type": "text",
                        "value": "## Um arquivo .joblib sozinho não é um projeto\n\nSalvar o modelo resolve o 'como reusar', mas um projeto de ML de verdade também precisa responder outras perguntas, meses depois: de onde veio o dado usado nesse modelo? Qual código gerou esse `.joblib`? Quais hiperparâmetros a busca em grade escolheu? Deixar tudo isso espalhado em notebooks soltos ou scripts sem organização é a forma mais comum de um projeto ficar impossível de reproduzir ou de dar manutenção.\n\nA prática comum é separar o projeto em pastas com responsabilidade clara: dado bruto nunca é editado direto, código de preparo fica isolado do código de treino, e os modelos salvos ficam numa pasta própria, versionados por nome ou por data."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pasta ou arquivo\",\"O que guarda\"],[\"dados/brutos/\",\"O dado original, exatamente como chegou, nunca editado direto\"],[\"dados/processados/\",\"O dado já limpo e pronto pra virar X e y do pipeline\"],[\"notebooks/\",\"Exploração e prototipagem; nada que o projeto final dependa pra rodar\"],[\"src/preparo.py\",\"A construção do ColumnTransformer e do Pipeline de preparo\"],[\"src/treino.py\",\"O treino, o GridSearchCV e a chamada joblib.dump\"],[\"src/avaliacao.py\",\"As métricas calculadas no conjunto de teste, isoladas do treino\"],[\"modelos/modelo_v1.joblib\",\"O pipeline treinado e salvo, pronto pra ser carregado e prever\"],[\"requirements.txt\",\"As versões fixadas das bibliotecas, ligadas à reprodutibilidade\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# treino.py: o modulo inteiro resumido num fluxo so, do preparo ao arquivo salvo\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split, GridSearchCV\nimport joblib\n\nRANDOM_STATE = 42\ncolunas_numericas = ['idade', 'renda']\ncolunas_categoricas = ['cidade', 'plano']\n\npreparo = ColumnTransformer([\n    ('num', Pipeline([\n        ('imputer', SimpleImputer(strategy='median')),\n        ('scaler', StandardScaler())\n    ]), colunas_numericas),\n    ('cat', Pipeline([\n        ('imputer', SimpleImputer(strategy='most_frequent')),\n        ('onehot', OneHotEncoder(handle_unknown='ignore'))\n    ]), colunas_categoricas)\n])\n\npipeline_completo = Pipeline([\n    ('preparo', preparo),\n    ('modelo', RandomForestClassifier(random_state=RANDOM_STATE))\n])\n\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y\n)\n\nbusca = GridSearchCV(\n    pipeline_completo,\n    {'modelo__n_estimators': [100, 300], 'modelo__max_depth': [None, 10]},\n    cv=5,\n    scoring='f1'\n)\nbusca.fit(X_treino, y_treino)\n\nmodelo_final = busca.best_estimator_\nprint(modelo_final.score(X_teste, y_teste))\n# 0.88\n\njoblib.dump(modelo_final, 'modelos/modelo_v1.joblib')\n# ['modelos/modelo_v1.joblib'] -> pronto pra prever sem retreinar"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o Módulo 5\n\nVocê fechou o ciclo que faltava pra um projeto de machine learning sair do notebook e virar algo confiável: encadear preparo e modelo num só `Pipeline`, tratar colunas numéricas e categóricas ao mesmo tempo com `ColumnTransformer`, ajustar hiperparâmetros do preparo e do modelo juntos com `GridSearchCV` sem vazar dado, fixar a reprodutibilidade do experimento inteiro, e salvar o resultado com `joblib` dentro de um projeto organizado.\n\nNo próximo módulo, o foco muda pra problemas que aparecem em dado real e que nenhuma dessas ferramentas resolve sozinha: classes desbalanceadas, dado e rótulo ruim, overfitting na prática e a honestidade de reconhecer quando machine learning não é a resposta certa."
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo que só existe no notebook de quem treinou não ajuda ninguém. Pipeline, reprodutibilidade e joblib são o que transforma um experimento pessoal em algo que outra pessoa, ou você mesmo daqui a seis meses, consegue abrir, entender e confiar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a função de joblib.dump(modelo_final, 'modelo_v1.joblib')?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Salvar o objeto Python treinado, como um Pipeline, em disco, pra carregar depois sem retreinar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar o modelo do zero e, em seguida, calcular sua acurácia no conjunto de teste reservado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Enviar o modelo treinado direto pra um servidor de produção, pronto pra receber requisições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar o modelo da memória do processo atual, liberando espaço depois de um treino longo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é melhor persistir o Pipeline inteiro (preparo e modelo) com joblib, em vez de persistir só o modelo final treinado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque quem for usar o modelo depois não reimplementa o preparo (imputer, scaler, encoder) à parte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o joblib só consegue salvar objetos do tipo Pipeline, e recusa salvar um estimador sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um Pipeline salvo ocupa sempre menos espaço em disco do que um modelo salvo sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o modelo final sozinho, sem o pipeline, perde a capacidade de fazer previsões corretas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o joblib costuma ser preferido ao pickle da biblioteca padrão pra salvar um Pipeline do scikit-learn?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque lida melhor com objetos que carregam muitos arrays do NumPy, como um Pipeline treinado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pickle não consegue, de jeito nenhum, salvar nenhum objeto criado pelo scikit-learn.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque arquivos salvos com joblib podem ser abertos e editados direto como texto simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o joblib, ao contrário do pickle, salva o código-fonte do scikit-learn junto do modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação carrega, com joblib.load, um arquivo .joblib enviado por um usuário externo, sem nenhuma validação de origem. Qual o risco mais direto dessa prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O carregamento pode rodar código arbitrário embutido no arquivo, já que a desserialização não é segura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum risco relevante, já que arquivos .joblib só conseguem armazenar números e texto, nunca código.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo carregado sempre terá uma acurácia pior do que o modelo original salvo pela própria equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "O joblib.load recusa automaticamente qualquer arquivo que não tenha sido gerado pela mesma aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num projeto de ML organizado, o código que constrói o ColumnTransformer e o Pipeline de preparo fica separado do código que chama o GridSearchCV e o joblib.dump. Qual a principal vantagem prática dessa separação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada parte fica mais fácil de entender, testar e reaproveitar sozinha, sem depender do fluxo inteiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "O scikit-learn exige, por regra, que preparo e treino estejam sempre em arquivos Python diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "A separação em arquivos diferentes torna o treinamento do modelo automaticamente mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem essa separação, o joblib.dump não consegue salvar corretamente um Pipeline com ColumnTransformer.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Problemas reais e como lidar",
        "aulas": [
            {
                "titulo": "Classes desbalanceadas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da bancada pro mundo real\n\nAté aqui você viu como extrair features melhores, ajustar hiperparâmetros de verdade, montar ensembles fortes (random forest, boosting) e encadear tudo num Pipeline que não vaza dado. É o kit de quem sabe treinar um modelo bom. Só que \"bom\" pressupõe um mundo bem-comportado: dados limpos, classes equilibradas, resultado fácil de explicar. Este módulo é sobre o que fazer quando o mundo não coopera, que é o normal, não a exceção.\n\nComeçando pelo desbalanceamento de classes. Você já esbarrou nisso lá na trilha de Machine Learning: aquele exemplo do detector de fraude com 99% de acurácia que, na prática, não pegava fraude nenhuma. Ali você aprendeu a enxergar o problema com a matriz de confusão e com precisão, recall e F1. Nesta aula, a pergunta muda de \"como eu percebo\" pra \"o que eu faço a respeito\"."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o desbalanceamento atrapalha o treino, não só a métrica\n\nA maioria dos algoritmos de classificação, incluindo os do scikit-learn, aprende minimizando um erro médio sobre todos os exemplos de treino. Quando 97% dos exemplos são da classe majoritária, o jeito mais barato de reduzir esse erro médio é acertar bem a maioria e ignorar a minoria, porque cada exemplo raro pesa pouco na conta final. O modelo não está sendo preguiçoso: está otimizando exatamente o que foi pedido pra otimizar.\n\nIsso aparece o tempo todo: fraude em cartão, churn de um plano caro (a minoria que cancela), falha de uma peça industrial, diagnóstico de uma condição rara. Em quase todos esses casos, é a classe rara que importa mais, o oposto do que o treino padrão prioriza."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\n# dataset com 97% classe 0 e 3% classe 1 (ex.: falha rara de equipamento)\nX, y = make_classification(\n    n_samples=4000, n_features=12, weights=[0.97, 0.03], random_state=42\n)\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.3, stratify=y, random_state=42\n)\n\nmodelo = RandomForestClassifier(random_state=42)\nmodelo.fit(X_treino, y_treino)\ny_pred = modelo.predict(X_teste)\n\nprint(classification_report(y_teste, y_pred, digits=2))\n#               precision    recall  f1-score   support\n#            0       0.97      1.00      0.99      1164\n#            1       0.83      0.14      0.24        36\n#\n#     accuracy                           0.97      1200\n\nprint(\"Acurácia:\", modelo.score(X_teste, y_teste))\n# Acurácia: 0.97"
                    },
                    {
                        "type": "text",
                        "value": "## Estratégias para lidar com o desbalanceamento\n\nNenhuma bala de prata aqui, mas um conjunto de táticas que se combinam:\n\n- **Pesar as classes** (`class_weight='balanced'`): diz ao algoritmo que errar na classe rara custa mais caro, sem tocar nos dados. Costuma ser o primeiro passo, é só um parâmetro a mais.\n- **Undersampling**: descarta parte dos exemplos da classe majoritária pra equilibrar as proporções no treino. Funciona quando sobra dado, mas joga informação fora.\n- **Oversampling simples**: duplica exemplos da classe minoritária. Não perde dado, mas repetir os mesmos pontos aumenta o risco de decorar justamente esses exemplos.\n- **SMOTE** (Synthetic Minority Oversampling Technique): em vez de duplicar, cria exemplos sintéticos da classe minoritária interpolando entre vizinhos no espaço de features. Vive na biblioteca `imbalanced-learn` (`from imblearn.over_sampling import SMOTE`), não no scikit-learn, e entra como uma etapa antes do treino, só no conjunto de treino, nunca no teste.\n- **Trocar a métrica de decisão**: parar de validar pela acurácia e acompanhar recall, F1 ou AUC, escolhendo qual pesa mais conforme o custo de cada tipo de erro no seu problema.\n\nReamostragem sempre acontece depois do split e só no treino: contaminar o teste com exemplo duplicado ou sintético dá uma avaliação otimista que não existe na vida real."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\n# mesmo X_treino/X_teste do exemplo anterior, agora com class_weight\nmodelo_balanceado = RandomForestClassifier(\n    class_weight=\"balanced\", random_state=42\n)\nmodelo_balanceado.fit(X_treino, y_treino)\ny_pred_bal = modelo_balanceado.predict(X_teste)\n\nprint(classification_report(y_teste, y_pred_bal, digits=2))\n#               precision    recall  f1-score   support\n#            0       0.98      0.96      0.97      1164\n#            1       0.36      0.53      0.43        36\n#\n#     accuracy                           0.95      1200\n\n# 'balanced' pondera cada classe pelo inverso da sua frequência: errar na\n# classe rara passa a custar bem mais caro pro modelo durante o treino"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\", \"Estratégia mais indicada\", \"Cuidado\"], [\"Muito dado, desbalanceamento moderado\", \"class_weight='balanced'\", \"Comece por aqui, é a mudança mais simples\"], [\"Pouco dado no total\", \"SMOTE ou oversampling\", \"Não cria dado real, só interpola ou repete\"], [\"Dado abundante e minoria bem rara\", \"Undersampling\", \"Reduz o treino, atenção ao viés que isso introduz\"], [\"Erro na classe rara é bem mais caro\", \"class_weight com recall ou F1 como métrica principal\", \"Aceitar mais falso positivo em troca de menos falso negativo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Desbalanceamento não se resolve olhando pra acurácia de novo até ela parecer boa. Resolve-se decidindo, antes de treinar, qual erro custa mais caro, e ajustando o modelo pra errar menos exatamente aí."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que faz o parâmetro class_weight='balanced' num classificador do scikit-learn?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pondera o erro de cada classe pelo inverso da sua frequência nos dados de treino",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove automaticamente os exemplos duplicados da classe majoritária antes do treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera exemplos sintéticos da classe minoritária usando os vizinhos mais próximos",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca a métrica de avaliação de acurácia para F1-score durante o treino",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de detecção de defeito industrial tem acurácia de 98% e recall de 20% na classe \"defeituoso\". Depois de aplicar class_weight='balanced', a acurácia cai pra 94%, mas o recall sobe pra 65%. Como avaliar essa troca?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma troca desejável: pegar mais defeitos reais importa mais que a acurácia geral",
                                "isCorrect": true
                            },
                            {
                                "text": "Um sinal de que o modelo passou a sofrer overfitting grave nos dados de treino",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma prova de que o class_weight piorou o modelo, já que a acurácia geral caiu",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sinal de vazamento de dados introduzido pelo parâmetro class_weight no treino",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que aplicar SMOTE ou oversampling depois de dividir treino e teste, nunca antes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque gerar ou duplicar exemplos antes do split espalha a mesma informação pro teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o SMOTE só funciona em conjuntos de dados já padronizados com StandardScaler",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a ordem não muda o resultado, mas é a convenção adotada pelo scikit-learn",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque aplicar a reamostragem antes do split deixa o treino consideravelmente mais lento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dataset de crédito tem quase todas as features categóricas, com poucas colunas numéricas. Ao aplicar SMOTE diretamente nesse conjunto, qual risco é mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "SMOTE interpola no espaço de features e pode gerar combinações pouco realistas nesse caso",
                                "isCorrect": true
                            },
                            {
                                "text": "SMOTE não roda em datasets com colunas categóricas e o código lança um erro de execução",
                                "isCorrect": false
                            },
                            {
                                "text": "SMOTE se comporta de forma idêntica em dados categóricos e numéricos, sem diferença prática",
                                "isCorrect": false
                            },
                            {
                                "text": "SMOTE substitui automaticamente as colunas categóricas por codificação one-hot antes de gerar exemplos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num sistema de aprovação de crédito, um falso positivo (aprovar quem não vai pagar) custa muito mais caro que um falso negativo (recusar quem pagaria). Qual prioridade faz mais sentido pra classe \"vai pagar\"?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Priorizar precisão alta, mesmo que isso reduza o recall dessa classe",
                                "isCorrect": true
                            },
                            {
                                "text": "Priorizar recall alto, mesmo que isso reduza a precisão dessa classe",
                                "isCorrect": false
                            },
                            {
                                "text": "Priorizar a acurácia geral, já que ela pondera os dois tipos de erro igualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Priorizar o F1-score da classe oposta, ignorando as métricas dessa classe",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dados e rótulos ruins",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Garbage in, garbage out, de novo\n\nLá na trilha de Machine Learning você já ouviu essa frase, na aula sobre preparar features: dado ruim gera modelo ruim, não importa o quão sofisticado seja o algoritmo. Ali o foco era dado faltante e variável fora de escala, problemas mecânicos, fáceis de flagrar com `.isnull()` e resolver com um imputer. Nesta aula o problema é mais traiçoeiro: rótulo errado, ruído e viés, coisas que não aparecem em nenhum `.isnull().sum()`."
                    },
                    {
                        "type": "text",
                        "value": "## Rótulos errados: o modelo aprende a mentira\n\nTodo problema supervisionado depende de um pressuposto: o rótulo (`y`) usado pra treinar reflete a verdade. Na prática, rótulo é produzido por gente, processo ou sensor, e todos os três erram. Um cliente marcado como \"não converteu\" porque o evento de conversão falhou em disparar. Um exame classificado errado por cansaço de quem revisou. Uma etiqueta de produto atribuída à categoria errada no sistema.\n\nO problema é que o modelo não sabe que aquele rótulo está errado, ele aprende a reproduzir o erro como se fosse padrão. Diferente de ruído numa feature, que o modelo consegue aprender a ignorar em parte, ruído no rótulo contamina diretamente aquilo que o modelo está tentando prever."
                    },
                    {
                        "type": "text",
                        "value": "## Ruído e viés não são a mesma coisa\n\n**Ruído** é variação aleatória: um sensor com pequena imprecisão, um outlier que é real mas incomum, uma resposta de pesquisa preenchida às pressas. Em geral, com dado suficiente, o modelo aprende a não se importar tanto com ruído, porque ele não segue um padrão consistente.\n\n**Viés nos dados** é mais grave, porque não é aleatório: é sistemático. Se o histórico de contratação usado pra treinar um modelo reflete anos de preferência por um perfil específico de candidato, o modelo aprende esse padrão como se fosse mérito. Se os dados de um processo refletem onde a fiscalização já era mais presente, o modelo aprende a recomendar mais fiscalização pros mesmos lugares. O modelo não inventa o viés, ele aprende e reproduz um viés que já estava no dado, só que agora automatizado e em escala."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\nX, y = make_classification(n_samples=3000, n_features=15, random_state=42)\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\n# modelo treinado com os rótulos originais\nmodelo_limpo = RandomForestClassifier(random_state=42)\nmodelo_limpo.fit(X_treino, y_treino)\nprint(\"Acurácia com rótulos corretos:\", modelo_limpo.score(X_teste, y_teste))\n# Acurácia com rótulos corretos: 0.92\n\n# simula 15% de rótulos errados só no treino (o teste continua confiável)\nrng = np.random.default_rng(42)\ny_treino_ruidoso = y_treino.copy()\nindices_embaralhados = rng.choice(\n    len(y_treino_ruidoso), size=int(0.15 * len(y_treino_ruidoso)), replace=False\n)\ny_treino_ruidoso[indices_embaralhados] = 1 - y_treino_ruidoso[indices_embaralhados]\n\nmodelo_ruidoso = RandomForestClassifier(random_state=42)\nmodelo_ruidoso.fit(X_treino, y_treino_ruidoso)\nprint(\"Acurácia com 15% de rótulos errados:\", modelo_ruidoso.score(X_teste, y_teste))\n# Acurácia com 15% de rótulos errados: 0.81"
                    },
                    {
                        "type": "text",
                        "value": "## Antes de treinar, olhar (de novo)\n\nA melhor defesa contra rótulo ruim, ruído e viés é velha conhecida: a EDA (análise exploratória) que você já fez lá em Análise de Dados, agora aplicada com outro objetivo. Não é só entender a distribuição das variáveis, é desconfiar do dado:\n\n- `df['alvo'].value_counts()`: a proporção das classes bate com o que faz sentido pro problema?\n- `df.groupby('categoria')['alvo'].mean()`: existe uma categoria com uma taxa de alvo suspeita, alta ou baixa demais?\n- Amostrar exemplos manualmente, sobretudo os que o modelo erra com mais confiança: às vezes o modelo não errou, o rótulo que estava errado.\n- Verificar se alguma feature é boa demais pra ser verdade (correlação quase perfeita com o alvo costuma ser vazamento, não sorte).\n\nNenhuma dessas checagens está dentro do `fit()`. Elas são trabalho manual, ler e desconfiar, e é exatamente por isso que ficam de fora do pipeline automatizado e dentro da responsabilidade de quem constrói o modelo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Problema\", \"Como costuma aparecer\", \"O que fazer\"], [\"Rótulo errado\", \"Exemplos que o modelo erra com muita confiança, sempre no mesmo padrão\", \"Amostrar e conferir manualmente um grupo desses casos\"], [\"Ruído aleatório\", \"Erros espalhados pelos dados, sem padrão claro entre eles\", \"Mais dado de treino, ou aceitar um teto de desempenho\"], [\"Viés sistemático\", \"O modelo reproduz uma desigualdade que já existia no histórico\", \"Auditar a origem dos dados, não só ajustar o modelo\"], [\"Feature vazada\", \"Uma variável com correlação quase perfeita com o alvo\", \"Investigar se ela só existe depois do evento a prever\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo treinado em dado ruim não é neutro: ele aprende exatamente o erro e o viés que você deu a ele, e devolve isso com a aparência de objetividade de um número."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa a expressão 'garbage in, garbage out' aplicada a machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um modelo treinado com dado de baixa qualidade tende a produzir previsões de baixa qualidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Um modelo sempre melhora de desempenho quando recebe mais dados de treino, sem exceção",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo descarta automaticamente os exemplos de treino considerados de baixa qualidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo com poucos hiperparâmetros ajustados produz resultado pior que um mais complexo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um rótulo (y) errado tende a ser mais prejudicial ao treino do que ruído numa feature (X)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o modelo aprende a reproduzir o erro do rótulo como se fosse o padrão a prever",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque rótulo errado sempre reduz o tamanho do conjunto de treino disponível",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ruído em features nunca afeta o desempenho de nenhum algoritmo supervisionado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque rótulo errado impede o fit() do scikit-learn de terminar sem lançar um erro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma feature apresenta correlação de 0,98 com o alvo, bem mais alta que qualquer outra variável do dataset. O que essa observação deveria motivar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Investigar se essa feature só fica disponível depois que o alvo já é conhecido",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar essa feature sozinha no modelo, já que ela sintetiza bem o padrão dos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover todas as outras features, pois elas claramente têm pouca relevância",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o max_depth da árvore pra aproveitar melhor essa correlação alta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de triagem de currículos, treinado no histórico de contratações de uma empresa, passa a rejeitar sistematicamente um perfil de candidato raramente contratado no passado, mesmo com qualificação equivalente. Isso é evidência de que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O modelo aprendeu e automatizou um viés que já existia no processo de contratação",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo está com overfitting, já que aprendeu demais sobre os candidatos do treino",
                                "isCorrect": false
                            },
                            {
                                "text": "O dataset de treino tinha rótulos aleatórios e por isso o modelo não aprendeu nada",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo precisa de mais features numéricas pra deixar de considerar o histórico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao investigar manualmente os exemplos em que o modelo erra com mais confiança, uma cientista percebe que boa parte tem o rótulo original incoerente com as demais colunas. Qual conclusão é mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Vale revisar e corrigir esses rótulos antes de tentar melhorar o modelo em si",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo precisa de um algoritmo mais complexo pra dar conta desses casos difíceis",
                                "isCorrect": false
                            },
                            {
                                "text": "Esses exemplos devem ficar como estão, já que o teste precisa refletir a realidade",
                                "isCorrect": false
                            },
                            {
                                "text": "A métrica usada na avaliação está incorreta e precisa ser recalculada do zero",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Overfitting na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que a definição não conta\n\nLá na trilha de Machine Learning você aprendeu a definição clássica de overfitting: desempenho ótimo no treino, desempenho ruim no teste, aquela árvore sem limite de profundidade que decorava 100% do treino e caía pra 81% no teste. A definição está correta, só que na prática o overfitting raramente é tão escancarado. Ele aparece disfarçado: numa diferença de poucos pontos entre treino e validação que parece pequena, mas que some quando você simplifica o modelo. Ou aparece depois do próprio processo de tuning, o vilão que ninguém avisa."
                    },
                    {
                        "type": "text",
                        "value": "## Sinais que valem mais atenção do que parecem\n\n- **Gap crescente**: conforme você aumenta a complexidade (mais árvores, mais profundidade, `C` maior), o score de treino sobe e o score de validação estaciona ou cai. É a curva de validação do Módulo 2: como a plataforma não desenha gráfico, imagine duas linhas que começam juntas e se afastam.\n- **Ótimo no CV, decepcionante fora dele**: se a busca de hiperparâmetros (`GridSearchCV`, `RandomizedSearchCV`) testou dezenas de combinações e escolheu a de melhor score médio de validação cruzada, existe uma chance real de ter escolhido a combinação que foi bem naqueles folds por coincidência. Quanto mais combinações testadas, maior essa chance: uma forma sutil de overfitting no próprio processo de tuning, não só no modelo final.\n- **Ensemble complexo demais**: um boosting com `n_estimators` alto e `learning_rate` alto junto tende a decorar o treino rápido; um random forest com árvores muito profundas e poucas amostras por folha, também.\n\nO antídoto pro segundo ponto é o que você já pratica: manter um conjunto de teste isolado do processo de tuning inteiro, e só olhar pra ele uma vez, no fim."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import GradientBoostingClassifier\n\nX, y = make_classification(n_samples=1500, n_features=20, random_state=42)\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\nfor n in [10, 50, 200, 500]:\n    modelo = GradientBoostingClassifier(\n        n_estimators=n, learning_rate=0.2, max_depth=3, random_state=42\n    )\n    modelo.fit(X_treino, y_treino)\n    print(\n        f\"n_estimators={n:>3} | treino={modelo.score(X_treino, y_treino):.2f} \"\n        f\"| teste={modelo.score(X_teste, y_teste):.2f}\"\n    )\n\n# n_estimators= 10 | treino=0.91 | teste=0.89\n# n_estimators= 50 | treino=0.98 | teste=0.90\n# n_estimators=200 | treino=1.00 | teste=0.88\n# n_estimators=500 | treino=1.00 | teste=0.86"
                    },
                    {
                        "type": "text",
                        "value": "## O que fazer quando o modelo overfitou\n\n- **Regularizar**: em modelos lineares, diminuir `C` (regressão logística) ou aumentar `alpha` (Ridge/Lasso) penaliza coeficientes grandes. Em árvores e ensembles, limitar `max_depth` ou aumentar `min_samples_leaf` faz o mesmo papel, impedir que o modelo se ajuste a detalhes pequenos demais.\n- **Mais dados**: quando é possível conseguir, é o remédio mais direto, porque dificulta decorar particularidades que não vão se repetir. Nem sempre está disponível, mas vale sempre perguntar antes de mexer só no modelo.\n- **Features mais simples**: menos features, ou features mais agregadas e menos ruidosas, reduzem o espaço em que o modelo pode se especializar demais no treino. É o que você viu no Módulo 1: nem toda feature nova ajuda, algumas só dão corda pro overfitting.\n- **Early stopping no boosting**: em vez de fixar um `n_estimators` alto e torcer, você monitora o desempenho numa fatia de validação e para de adicionar árvores quando ele para de melhorar. O `GradientBoostingClassifier` faz isso nativamente com `validation_fraction` e `n_iter_no_change`; XGBoost e LightGBM têm o mecanismo equivalente, geralmente chamado de `early_stopping_rounds`.\n- **Reduzir a complexidade do ensemble**: menos árvores, menos profundidade, ou trocar um boosting muito ajustado por um random forest, naturalmente mais resistente a overfitting por causa da votação entre árvores."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.ensemble import GradientBoostingClassifier\n\n# reaproveitando X_treino, X_teste, y_treino, y_teste da célula anterior\n# para de adicionar árvores quando 10 rodadas seguidas não melhoram o\n# desempenho numa fatia de validação separada internamente\nmodelo_early_stop = GradientBoostingClassifier(\n    n_estimators=500,\n    learning_rate=0.2,\n    max_depth=3,\n    validation_fraction=0.15,\n    n_iter_no_change=10,\n    random_state=42,\n)\nmodelo_early_stop.fit(X_treino, y_treino)\n\nprint(\"Estágios (árvores) realmente usados:\", modelo_early_stop.estimators_.shape[0])\n# Estágios (árvores) realmente usados: 63\n\nprint(\"Score no teste:\", modelo_early_stop.score(X_teste, y_teste))\n# Score no teste: 0.91"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\", \"O que costuma indicar\", \"O que fazer\"], [\"Score de treino bem acima do score de teste\", \"Overfitting clássico, o modelo decorou o treino\", \"Regularizar, reduzir complexidade, buscar mais dado\"], [\"Treino e teste sobem juntos e depois o teste cai\", \"Ponto de complexidade ideal já foi ultrapassado\", \"Voltar pro hiperparâmetro em que só o treino ainda subia\"], [\"Boosting com muitas iterações e teste caindo\", \"Excesso de estágios, learning_rate alto demais\", \"Early stopping, reduzir learning_rate ou n_estimators\"], [\"Score de CV ótimo, desempenho ruim fora do tuning\", \"Overfitting no próprio processo de busca de hiperparâmetro\", \"Testar menos combinações plausíveis, manter teste isolado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Overfitting não é um defeito visível no código, é uma promessa otimista demais sobre o quanto o modelo realmente aprendeu. A única forma de desmentir a promessa é medir num dado que o modelo, e o processo de tuning inteiro, nunca viram."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o sinal mais clássico de que um modelo está com overfitting?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Desempenho bem melhor no conjunto de treino do que no conjunto de teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Desempenho parecido e ruim tanto no conjunto de treino quanto no de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tempo de treinamento maior do que o esperado pro tamanho do dataset",
                                "isCorrect": false
                            },
                            {
                                "text": "Um número de features maior do que o número de exemplos de treino usados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um GridSearchCV testar 200 combinações de hiperparâmetros, o modelo escolhido tem ótimo score médio de validação cruzada, mas desempenho bem pior no conjunto de teste, isolado desde o início. O que provavelmente aconteceu?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A busca testou tantas combinações que escolheu uma que foi bem nos folds por sorte",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de teste ficou desbalanceado, invalidando a comparação com a validação",
                                "isCorrect": false
                            },
                            {
                                "text": "O GridSearchCV usou o conjunto de teste internamente sem isso aparecer no código",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo escolhido tem, com certeza, um bug de implementação no scikit-learn",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um GradientBoostingClassifier com n_estimators=500 e learning_rate alto atinge score 1.0 no treino, com queda progressiva no teste conforme mais árvores entram. Qual mudança ataca diretamente essa causa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar validation_fraction e n_iter_no_change para parar antes do ponto de piora",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar ainda mais o n_estimators, já que o modelo pode não ter convergido",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o GradientBoostingClassifier por um KNeighborsClassifier, imune a overfitting",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o conjunto de teste da avaliação, já que ele tem distribuição diferente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe reduziu o max_depth de uma random forest e viu o score de treino cair de 0.99 para 0.90, enquanto o score de teste subiu de 0.78 para 0.87. Como interpretar essa mudança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A variância caiu, aproximando treino e teste com ganho real de generalização",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo piorou de forma geral, já que o score de treino caiu bastante após o ajuste",
                                "isCorrect": false
                            },
                            {
                                "text": "Houve vazamento de dados introduzido pela redução do max_depth no treinamento",
                                "isCorrect": false
                            },
                            {
                                "text": "A random forest deixou de conseguir aprender qualquer padrão útil dos dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de simplificar as features (removendo agregações muito específicas) e adicionar mais exemplos de treino, um modelo de boosting manteve o mesmo score de treino, mas o score de teste melhorou bastante. O que essas duas mudanças têm em comum?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As duas reduzem a chance de o modelo se especializar em detalhes que não se repetem",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas aumentam a complexidade efetiva do modelo, captando padrões mais sutis",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas alteram a métrica usada na avaliação, o que explica a melhora no teste",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas eliminam a necessidade de dividir os dados entre treino e teste",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Interpretar o modelo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que se importar com o motivo\n\nUm modelo que acerta 95% das vezes já convence muita gente, mas em boa parte dos casos reais isso não basta. Quem aprova ou recusa crédito precisa justificar a decisão pro cliente, e em vários contextos isso é exigência regulatória, não gentileza. Um time médico não vai confiar (nem deveria) numa previsão de risco sem entender o que pesou nela. E, como você viu na Aula 2 deste módulo, um modelo pode estar reproduzindo um viés do dado sem que ninguém perceba, e a única forma de flagrar isso é abrindo o motivo da previsão, não só olhando o resultado final.\n\nLá no Módulo 1 você já usou o `feature_importances_` de uma árvore pra ver quais variáveis mais pesavam. Nesta aula, esse instrumento ganha companhia e um olhar mais crítico."
                    },
                    {
                        "type": "text",
                        "value": "## O que o feature_importances_ realmente mede\n\nEm árvores e florestas, `feature_importances_` soma o quanto cada feature reduziu a impureza (Gini, geralmente) em todas as divisões onde foi usada, normalizado pra somar 1. É rápido, vem de graça depois do `fit()`, mas tem limitações que vale conhecer:\n\n- Tende a inflar a importância de features numéricas com muitos valores únicos, ou categóricas com muitas categorias, porque elas têm mais pontos de corte possíveis pra testar.\n- É calculada sobre o conjunto de treino, então uma feature que ajudou o modelo a decorar particularidades (aquele overfitting da árvore) pode aparecer como \"importante\" sem ser realmente útil pra generalizar.\n- Lida mal com features correlacionadas entre si: se duas colunas carregam a mesma informação, a árvore pode dividir a importância entre as duas, fazendo cada uma parecer menos relevante do que é."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.inspection import permutation_importance\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.datasets import make_classification\nimport pandas as pd\n\nX, y = make_classification(n_samples=1000, n_features=6, random_state=42)\ncolunas = [f\"feature_{i}\" for i in range(6)]\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    pd.DataFrame(X, columns=colunas), y, test_size=0.3, random_state=42\n)\n\nmodelo = RandomForestClassifier(random_state=42)\nmodelo.fit(X_treino, y_treino)\n\nresultado = permutation_importance(\n    modelo, X_teste, y_teste, n_repeats=10, random_state=42, scoring=\"accuracy\"\n)\n\nimportancias = pd.Series(resultado.importances_mean, index=colunas)\nprint(importancias.sort_values(ascending=False))\n# feature_1    0.142\n# feature_4    0.098\n# feature_0    0.061\n# feature_3    0.014\n# feature_2    0.003\n# feature_5   -0.002"
                    },
                    {
                        "type": "text",
                        "value": "## Por que a permutation importance costuma ser mais confiável\n\nA ideia é direta: pega o conjunto de teste (ou um holdout), embaralha os valores de uma feature de cada vez (destruindo a relação dela com o alvo, mantendo tudo mais igual) e mede o quanto a métrica do modelo piora. Uma feature importante de verdade faz a métrica desabar quando embaralhada; uma feature inútil quase não muda nada, podendo até flutuar perto de zero.\n\nComo é medida no conjunto de teste, com a métrica final que você realmente se importa (`accuracy`, `f1`, o que fizer sentido), ela reflete o que a feature contribui pra generalização, não só o que ela ajudou a decorar no treino. A troca é custo computacional: embaralhar e prever várias vezes (`n_repeats`) pra cada feature é bem mais caro que ler o `feature_importances_` de graça, mas funciona pra qualquer modelo, não só árvore, porque não depende da estrutura interna dele."
                    },
                    {
                        "type": "text",
                        "value": "## Explicar o modelo inteiro x explicar uma previsão\n\n`feature_importances_` e permutation importance respondem \"o que o modelo usa mais, em média, considerando todos os exemplos\". Muitas vezes a pergunta é outra: \"por que esse cliente específico foi recusado?\". Pra isso existem ferramentas de explicação local, duas viraram padrão de mercado:\n\n- **SHAP** (SHapley Additive exPlanations): baseado num conceito de teoria dos jogos (valores de Shapley), reparte a previsão de um exemplo entre as features, mostrando o quanto cada uma empurrou a previsão pra cima ou pra baixo a partir de uma base. Funciona pra qualquer modelo, incluindo os ensembles deste módulo, e tem versões otimizadas pra árvores.\n- **LIME** (Local Interpretable Model-agnostic Explanations): explica uma previsão treinando, ao redor daquele ponto específico, um modelo bem mais simples (tipo uma regressão linear) que aproxima o comportamento do modelo complexo só naquela vizinhança.\n\nNenhuma das duas vem no scikit-learn, são bibliotecas à parte (`shap`, `lime`), e ambas custam tempo de computação, sobretudo SHAP em modelos grandes. Valem a pena quando a pergunta é sobre um caso específico, não sobre o modelo inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Modelo simples (regressão, árvore rasa)\", \"Caixa-preta (random forest, boosting)\"], [\"Interpretação nativa\", \"Sim: coeficientes ou o caminho de decisão\", \"Fraca: muitas árvores ou pesos combinados\"], [\"Ferramenta extra necessária\", \"Geralmente não\", \"permutation importance, SHAP ou LIME\"], [\"Desempenho típico em dado complexo\", \"Costuma perder pra ensembles\", \"Costuma ganhar em dado tabular complexo\"], [\"Uso comum\", \"Crédito, saúde, contexto regulatório\", \"Quando desempenho pesa mais que explicação direta\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo que ninguém consegue explicar não é neutro nem infalível, só é opaco. Interpretar não é luxo acadêmico: é a diferença entre confiar num número e entender por que ele apareceu."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a permutation importance mede pra avaliar a importância de uma feature?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O quanto a métrica do modelo piora quando os valores dessa feature são embaralhados",
                                "isCorrect": true
                            },
                            {
                                "text": "O quanto essa feature está correlacionada com todas as outras do conjunto de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de vezes que essa feature aparece nas divisões de uma única árvore",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de processamento que o modelo leva pra usar essa feature no treinamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a permutation importance costuma ser considerada mais confiável do que o feature_importances_ de uma árvore?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque é medida no conjunto de teste, refletindo o que a feature contribui pra generalizar",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque é calculada automaticamente durante o fit, sem exigir nenhum passo manual",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque funciona exclusivamente com árvores de decisão e ensembles baseados nelas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque descarta as features correlacionadas antes de calcular a importância de cada uma",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença central entre o que o feature_importances_ de uma random forest mostra e o que o SHAP mostra pra um exemplo específico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "feature_importances_ resume a floresta inteira, SHAP reparte a previsão daquele exemplo",
                                "isCorrect": true
                            },
                            {
                                "text": "feature_importances_ funciona pra qualquer modelo, SHAP funciona só pra árvores de decisão",
                                "isCorrect": false
                            },
                            {
                                "text": "feature_importances_ precisa do conjunto de teste, SHAP é calculado inteiramente no treino",
                                "isCorrect": false
                            },
                            {
                                "text": "feature_importances_ mede correlação, SHAP mede exclusivamente features numéricas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas features de um dataset são fortemente correlacionadas entre si, e ambas realmente influenciam o alvo. O que costuma acontecer com o feature_importances_ de uma random forest nesse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A importância tende a se dividir entre as duas, cada uma parecendo menos relevante",
                                "isCorrect": true
                            },
                            {
                                "text": "A importância das duas soma exatamente zero, já que a correlação anula o efeito",
                                "isCorrect": false
                            },
                            {
                                "text": "A random forest ignora automaticamente uma das duas features durante o treino",
                                "isCorrect": false
                            },
                            {
                                "text": "A importância das duas dobra de valor, já que elas reforçam o mesmo sinal",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma instituição financeira precisa justificar, cliente a cliente, por que um pedido de crédito foi recusado, cumprindo exigência regulatória. Qual ferramenta atende diretamente essa necessidade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma explicação local, como SHAP, mostrando o peso de cada feature naquela previsão",
                                "isCorrect": true
                            },
                            {
                                "text": "O feature_importances_ do modelo, que já detalha o motivo de cada previsão individual",
                                "isCorrect": false
                            },
                            {
                                "text": "A acurácia geral do modelo no conjunto de teste, reportada junto de cada decisão",
                                "isCorrect": false
                            },
                            {
                                "text": "A matriz de confusão do modelo, mostrando o padrão de erro em cada cliente recusado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Quando ML não é a resposta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A pergunta que este módulo inteiro pressupõe\n\nTudo neste módulo assume que ML é a ferramenta certa e o trabalho é fazer ela funcionar apesar do desbalanceamento, do dado ruim, do overfitting. Mas existe uma pergunta anterior a todas essas, fácil de pular quando você já sabe treinar ensemble e ajustar hiperparâmetro: esse problema deveria ir pra machine learning?\n\nDizer não a ML, quando faz sentido, é tão parte do trabalho quanto saber montar um `Pipeline` correto. É a última habilidade prática deste módulo, e talvez a mais madura."
                    },
                    {
                        "type": "text",
                        "value": "## Quando uma regra simples já resolve\n\nSe o problema pode ser descrito numa frase tipo \"recusa automaticamente se o valor da compra for maior que R$ 5.000 e o cliente tiver conta há menos de 30 dias\", vale testar essa regra antes de treinar qualquer modelo. Regras simples têm vantagens que nenhum ensemble oferece de graça: são triviais de explicar, de auditar e de ajustar quando o negócio muda, e não exigem infraestrutura de treino, monitoramento e retreinamento.\n\nO teste prático é o mesmo raciocínio do `DummyClassifier` que você viu na trilha de Machine Learning, ampliado: compare o modelo não só contra \"sempre prever a classe majoritária\", mas contra a melhor regra de negócio que alguém experiente conseguir escrever. Se o ganho do modelo for pequeno perto da complexidade extra que ele traz, a regra simples pode ser a escolha certa, não a escolha preguiçosa."
                    },
                    {
                        "type": "text",
                        "value": "## Quando faltam dados\n\nModelos aprendem padrão repetido; sem repetição suficiente, não tem padrão pra aprender, só ruído. Um dataset de 80 linhas pra um problema com 15 features tende a produzir um modelo instável, que muda bastante de previsão dependendo de quais poucos exemplos entraram no treino, mesmo com toda a regularização deste módulo.\n\nNesse cenário, as alternativas costumam valer mais que forçar um modelo: uma regra simples baseada no conhecimento de quem já vive o problema, um processo manual assistido (o modelo sugere, uma pessoa decide) até o volume de dado crescer, ou simplesmente esperar e coletar mais antes de treinar algo que ninguém vai conseguir validar direito."
                    },
                    {
                        "type": "text",
                        "value": "## Quando o custo do erro é alto demais pra decidir sozinho\n\nMesmo um modelo com métricas boas erra: um recall de 95% ainda deixa 5% passar. A pergunta que importa é se esse erro remanescente é aceitável pra decisão em questão. Automatizar uma recomendação de produto errada custa pouco. Automatizar, sem revisão humana, uma decisão que nega um tratamento ou corta o acesso de alguém a um serviço essencial é outra categoria de risco, mesmo com uma métrica de teste elogiável.\n\nNesses casos, a resposta madura raramente é \"não usar o modelo\", e sim \"não deixar o modelo decidir sozinho\": usar a previsão como apoio pra uma pessoa, manter revisão humana no caminho, e ser honesto sobre o fato de que nenhuma métrica de validação garante o comportamento do modelo em todo caso futuro."
                    },
                    {
                        "type": "code",
                        "value": "from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\n# problema simulado em que uma única feature já carrega quase toda a\n# informação (comum quando existe uma regra de negócio forte por trás)\nX, y = make_classification(\n    n_samples=1000, n_features=5, n_informative=1, n_redundant=0,\n    n_clusters_per_class=1, random_state=42\n)\nX_treino, X_teste, y_treino, y_teste = train_test_split(\n    X, y, test_size=0.3, random_state=42\n)\n\n# regra simples: um limiar na primeira feature\nregra_simples = (X_teste[:, 0] > 0).astype(int)\nprint(\"Acurácia da regra simples:\", accuracy_score(y_teste, regra_simples))\n# Acurácia da regra simples: 0.94\n\nmodelo = LogisticRegression()\nmodelo.fit(X_treino, y_treino)\nprint(\"Acurácia da regressão logística:\", modelo.score(X_teste, y_teste))\n# Acurácia da regressão logística: 0.95\n\n# um ponto de acurácia a mais raramente paga a conta de manter um pipeline\n# de ML inteiro rodando no lugar de uma regra de uma linha"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta\", \"Se a resposta for sim\"], [\"Uma regra simples já cobre a maior parte dos casos?\", \"Comece pela regra, meça, só complique se o ganho justificar\"], [\"Existe dado suficiente e representativo do problema?\", \"Sem isso, considere apoio humano em vez de um modelo\"], [\"O erro automatizado tem consequência grave e pouco reversível?\", \"Mantenha revisão humana no processo, não decisão sozinha do modelo\"], [\"É preciso explicar cada decisão individual por exigência externa?\", \"Priorize modelo interpretável ou reserve tempo pra SHAP e LIME\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta mais avançada em machine learning não é qual algoritmo usar, é se este problema precisa de um algoritmo. Um cientista de dados maduro sabe fazer as duas coisas: treinar o modelo certo, e recusar treinar um modelo quando a resposta certa é mais simples que isso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em qual situação uma regra de negócio simples costuma ser preferível a um modelo de machine learning?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quando a regra já explica a maior parte dos casos e é fácil de auditar e ajustar",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando o time tem bastante experiência prévia usando GridSearchCV e Pipeline",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o conjunto de dados disponível é grande e cobre bem o problema",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o modelo mais complexo testado teve o melhor score de validação cruzada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dataset de apenas 60 exemplos, com 20 features, é usado pra treinar um classificador. Mesmo com regularização, o modelo muda bastante de previsão a cada pequena mudança no conjunto de treino. O que essa instabilidade sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O volume de dado é insuficiente, e uma alternativa mais simples pode valer mais",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo precisa de um ensemble ainda mais complexo pra estabilizar as previsões",
                                "isCorrect": false
                            },
                            {
                                "text": "A regularização foi aplicada de forma incorreta e deve ser completamente removida",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema tem, com certeza, vazamento de dados entre o treino e o teste usados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que 'não deixar o modelo decidir sozinho' costuma ser mais adequado do que simplesmente descartar o modelo, em decisões de alto custo de erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o modelo ainda pode apoiar uma decisão humana, mesmo sem garantia de acerto total",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque toda decisão automatizada de alto custo se torna segura acima de 90% de acurácia",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque manter revisão humana elimina a necessidade de medir recall ou precisão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um modelo sem supervisão humana sempre tem desempenho pior que uma regra simples",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma regra simples alcança 94% de acurácia num problema, e uma regressão logística treinada nos mesmos dados alcança 95%. O que essa comparação, sozinha, já justifica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pouco ainda: vale pesar se o ganho de 1 ponto compensa manter um modelo em produção",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir imediatamente a regra pelo modelo, já que qualquer ganho de acurácia compensa",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a regra simples está com overfitting, por chegar tão perto de um modelo treinado",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o dataset usado tem vazamento de dados, já que uma regra não deveria competir assim",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide não usar machine learning para aprovar automaticamente pedidos de um benefício social, mesmo com um modelo de bom desempenho nos testes, optando por usá-lo só como apoio a um analista humano. Qual argumento justifica melhor essa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O custo de um erro automatizado nesse contexto é alto e pouco reversível, mesmo com bom teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Modelos de machine learning nunca devem ser usados em processos que envolvem pessoas reais",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo certamente tem overfitting, já que nenhum modelo deveria ir bem nesse tipo de problema",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe não confia no scikit-learn, preferindo aguardar uma versão mais recente da biblioteca",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Introdução a deep learning e o próximo passo",
        "aulas": [
            {
                "titulo": "O que é uma rede neural",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é uma rede neural\n\nVocê passou a trilha inteira combinando árvores (random forest, boosting), ajustando hiperparâmetros e montando pipelines robustos. Isso é, e continua sendo, o coração do trabalho de um cientista de dados no dia a dia. Mas existe uma outra família de modelos que você com certeza já ouviu falar, às vezes com um tom quase místico: as redes neurais, a base do deep learning.\n\nA boa notícia é que a intuição por trás de uma rede neural não é nada mágica. Boa parte dela você já viu, sem saber, lá na regressão logística. Este último módulo fecha a trilha te dando essa intuição, sem afundar na matemática pesada, e te mostrando quando essa ferramenta vale a pena (e quando não vale)."
                    },
                    {
                        "type": "text",
                        "value": "## O neurônio: soma ponderada mais ativação\n\nUm neurônio artificial faz uma conta bem simples. Ele recebe várias entradas (as features do seu problema, ou a saída de outros neurônios), multiplica cada uma por um peso, soma tudo e ainda soma um termo extra chamado viés (bias). Esse resultado passa por uma função de ativação, que decide o quanto aquele neurônio \"dispara\".\n\nSe você já treinou uma regressão logística, essa conta é familiar: soma ponderada das entradas, seguida da função sigmoide, que espreme o resultado entre 0 e 1. Um neurônio com ativação sigmoide é, literalmente, uma regressão logística em miniatura. A diferença de uma rede neural pra um único neurônio é empilhar muitos deles, em várias camadas, um alimentando o outro."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\n\ndef sigmoide(z):\n    return 1 / (1 + np.exp(-z))\n\nentradas = np.array([0.5, 1.2, -0.3])  # as features de um exemplo\npesos = np.array([0.4, -0.6, 0.9])     # pesos aprendidos no treino\nvies = 0.1\n\nsoma_ponderada = np.dot(entradas, pesos) + vies\nsaida = sigmoide(soma_ponderada)\n\nprint(saida)  # algo como 0.33: a ativação desse neurônio\n# essa é a mesma conta por trás da regressão logística: soma ponderada e sigmoide"
                    },
                    {
                        "type": "text",
                        "value": "## Camadas: entrada, ocultas e saída\n\nUma rede neural organiza os neurônios em camadas. A camada de entrada só recebe as features, uma por neurônio, sem fazer conta nenhuma. As camadas ocultas, no meio, combinam essas entradas em representações cada vez mais abstratas. E a camada de saída produz o resultado final: uma probabilidade, uma classe, um número.\n\nA intuição por trás de \"deep\" learning é justamente ter várias camadas ocultas empilhadas (a palavra \"profundo\" se refere à quantidade de camadas). Num modelo que reconhece imagens, por exemplo, as primeiras camadas costumam aprender a detectar bordas e contrastes simples, as camadas seguintes combinam essas bordas em formas e texturas, e as camadas mais profundas juntam essas formas em partes de objetos reconhecíveis. Ninguém programa essa hierarquia à mão: a rede aprende sozinha, camada por camada, a partir dos dados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\", \"O que faz\"], [\"Entrada\", \"Recebe as features do exemplo, um valor por neurônio, sem transformar nada\"], [\"Oculta (mais rasa)\", \"Combina as entradas em padrões simples e locais\"], [\"Oculta (mais profunda)\", \"Combina os padrões anteriores em representações mais abstratas\"], [\"Saída\", \"Produz o resultado final: uma classe, uma probabilidade ou um número\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Pesos: os parâmetros que a rede aprende sozinha\n\nLembra da diferença entre parâmetro e hiperparâmetro, lá do Módulo 2? Os pesos de uma rede neural são parâmetros: valores que o próprio treino ajusta, exatamente como os coeficientes de uma regressão. Ninguém escolhe o valor de um peso na mão, o algoritmo de treino encontra esses valores sozinho.\n\nJá o número de camadas, quantos neurônios cada camada tem e qual função de ativação usar são hiperparâmetros, escolhas que você faz antes de treinar, do mesmo jeito que escolheu `n_estimators` e `max_depth` de uma random forest. A diferença é de escala: uma rede modesta já tem milhares de pesos pra ajustar, uma rede grande chega a bilhões. É por isso que treinar essas redes pede tanto dado e tanta conta, assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Uma rede neural não esconde nenhum truque: é soma ponderada e ativação, repetida em camadas, muitas e muitas vezes."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um neurônio artificial faz com as entradas recebidas, antes de aplicar a função de ativação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Multiplica cada entrada pelo peso correspondente, soma tudo e ainda soma um viés",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolhe apenas a entrada de maior valor e descarta todas as outras recebidas",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcula a média simples das entradas recebidas, sem usar peso nenhum",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordena as entradas da maior pra menor e repassa essa ordem adiante",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que se diz que um único neurônio com ativação sigmoide se parece com uma regressão logística?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque os dois calculam uma soma ponderada das entradas e aplicam a função sigmoide nela",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque os dois exigem uma árvore de decisão treinada antes de calcular qualquer resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os dois dependem de agrupar os dados em clusters antes da previsão final",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os dois usam apenas a mediana das entradas, em vez de somar valor nenhum",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel da camada de entrada numa rede neural?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Receber as features do exemplo e repassá-las adiante, sem transformar nada",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar a função de ativação mais complexa da rede antes de qualquer outra camada",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular a função de perda comparando a previsão com o valor real esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar os padrões aprendidos nas camadas ocultas numa previsão final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa rede neural, os pesos das conexões e o número de camadas ocultas se diferenciam de que forma?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os pesos são parâmetros que o treino ajusta; camadas são um hiperparâmetro definido por você",
                                "isCorrect": true
                            },
                            {
                                "text": "Os pesos são hiperparâmetros definidos por você; camadas são ajustadas pelo treino sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos são parâmetros aprendidos pelo treino, sem nenhuma escolha manual envolvida",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos são hiperparâmetros que você precisa fixar antes de qualquer treino começar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa rede treinada pra reconhecer imagens, o que costuma acontecer conforme os dados atravessam camadas mais profundas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As representações ficam mais abstratas, combinando padrões simples em conceitos complexos",
                                "isCorrect": true
                            },
                            {
                                "text": "As representações ficam mais simples, descartando toda combinação das camadas anteriores",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados voltam ao formato original de entrada, sem nenhuma transformação acumulada",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada camada refaz exatamente a mesma conta da camada de entrada, sem mudar nada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Como a rede aprende (por cima)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Da previsão ao erro: a função de perda\n\nTreinar uma rede neural começa com uma previsão. Os dados de um exemplo entram pela camada de entrada, atravessam as camadas ocultas e saem pela camada de saída como um número ou uma probabilidade. Isso é o chamado forward pass, e no início do treino, com pesos aleatórios, essa previsão costuma ser péssima.\n\nO próximo passo é medir o quão errada ela foi. É pra isso que serve a função de perda (loss function): ela compara a previsão da rede com o valor real e devolve um número que representa o erro. Pra regressão, é comum usar algo parecido com o erro quadrático médio que você já viu. Pra classificação, é comum usar a entropia cruzada (cross-entropy), uma prima da ideia por trás do log loss."
                    },
                    {
                        "type": "text",
                        "value": "## Backpropagation e gradiente: a ideia por cima\n\nCom o erro em mãos, a rede precisa descobrir como ajustar cada peso pra errar um pouco menos na próxima rodada. É aí que entra o backpropagation: um jeito de percorrer a rede de trás pra frente, calculando o quanto cada peso contribuiu pro erro final. Esse \"quanto contribuiu\" é o gradiente.\n\nCom o gradiente de cada peso calculado, o algoritmo de gradiente descendente empurra cada peso um pouco na direção que reduz o erro. Não é um salto direto pra resposta certa, é um passo pequeno, repetido milhares de vezes. Se você já acompanhou aquela curva de validação subindo e descendo até estabilizar, é essa mesma lógica de ajuste gradual, só que aplicada a cada peso da rede."
                    },
                    {
                        "type": "code",
                        "value": "# ideia simplificada de UM passo de gradiente descendente, pra um peso só\npeso = 0.4\ntaxa_aprendizado = 0.01\ngradiente = 0.8  # o quanto esse peso contribuiu pro erro, calculado pelo backpropagation\n\npeso_novo = peso - taxa_aprendizado * gradiente\n\nprint(peso_novo)  # 0.392: o peso se moveu um pouco na direção que reduz o erro\n# repita essa conta pra cada peso da rede, a cada rodada, milhares de vezes"
                    },
                    {
                        "type": "text",
                        "value": "## Épocas, taxa de aprendizado e o custo de treinar\n\nUma rodada completa em que a rede vê todos os exemplos de treino se chama época (epoch). Como treinar com o dataset inteiro de uma vez costuma ser caro, é comum dividir os dados em lotes menores (batches), e ajustar os pesos a cada lote processado.\n\nO tamanho do passo em cada ajuste é a taxa de aprendizado (learning rate), e o nome não é coincidência: é o mesmo `learning_rate` que você ajustou no GradientBoosting do Módulo 4. A ideia de dar passos pequenos numa direção que reduz o erro, repetidos várias vezes, aparece tanto no boosting quanto no treino de uma rede. Uma taxa alta demais faz o treino oscilar sem convergir, uma taxa baixa demais faz o treino andar devagar demais pra ser útil.\n\nCom milhares (ou milhões) de pesos sendo ajustados a cada lote, o volume de conta cresce rápido. Isso explica por que treinar redes maiores pede tanto dado (pra generalizar de verdade, e não decorar o treino, como você já viu no Módulo 6) e tanta capacidade computacional, geralmente numa GPU, que faz esse tipo de multiplicação de matrizes em paralelo bem mais rápido que uma CPU comum."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\", \"O que significa\"], [\"Época (epoch)\", \"Uma passada completa da rede por todos os exemplos de treino\"], [\"Lote (batch)\", \"Um pedaço dos dados usado por vez, em vez do conjunto inteiro\"], [\"Taxa de aprendizado\", \"O tamanho do passo em cada ajuste de peso (o learning_rate do Módulo 4)\"], [\"Função de perda (loss)\", \"A medida de erro que o treino tenta reduzir a cada rodada\"], [\"Backpropagation\", \"O cálculo que descobre o quanto cada peso contribuiu pro erro\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Treinar uma rede neural é isso: prever, medir o erro, empurrar cada peso um pouco na direção que reduz esse erro, e repetir a conta milhares de vezes."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a função de perda (loss) no treino de uma rede neural?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma medida de erro entre a previsão e o valor real, que o treino tenta reduzir",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma camada extra da rede, responsável por armazenar os dados de treino recebidos",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome dado à taxa de aprendizado usada em cada atualização de peso da rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma técnica de reamostragem usada apenas quando as classes estão desbalanceadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em linhas gerais, o que o backpropagation calcula durante o treino de uma rede neural?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O quanto cada peso da rede contribuiu para o erro, pra saber em que direção ajustá-lo",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de camadas ocultas ideal pra rede aprender o problema sem overfitar",
                                "isCorrect": false
                            },
                            {
                                "text": "A correlação entre as features de entrada, antes mesmo do treino da rede começar",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor final que cada peso deveria ter, sem precisar de nenhuma rodada de treino",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a taxa de aprendizado (learning rate) controla no treino de uma rede neural?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tamanho do passo dado em cada ajuste de peso, na direção que reduz o erro",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de camadas ocultas que a rede vai usar durante todo o treino",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de exemplos de treino que a rede tem disponível pra aprender",
                                "isCorrect": false
                            },
                            {
                                "text": "A função de ativação usada na camada de saída da rede, entre outras opções",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o treino, a perda de uma rede neural oscila bastante e não diminui de forma consistente. Qual costuma ser a primeira causa a se testar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A taxa de aprendizado está alta demais, fazendo os pesos darem passos grandes demais",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de teste foi usado sem querer no lugar do conjunto de treino da rede",
                                "isCorrect": false
                            },
                            {
                                "text": "A camada de entrada está aplicando uma ativação, em vez de só repassar o dado",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de features do problema é grande demais pra qualquer rede aprender",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o treino de uma rede neural costuma exigir mais dado e mais poder computacional do que treinar uma random forest?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque há muitos pesos pra ajustar por gradiente, o que pede mais exemplo e mais conta",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a random forest não usa validação cruzada, então precisa de bem menos dado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque redes neurais não conseguem rodar em CPU, apenas em GPU, mesmo com pouco dado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a função de perda de uma rede é sempre mais difícil de calcular que um erro comum",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Quando deep learning brilha (e quando não)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Onde deep learning brilha: dado não estruturado e abundante\n\nDeep learning se destaca quando o dado é não estruturado (imagem, texto, áudio, voz) e existe bastante volume disponível. Nesses casos, é difícil descrever à mão o que torna uma foto um gato ou uma frase uma reclamação de cliente: são padrões demais, complexos demais, pra virar uma fórmula de feature engineering como a do Módulo 1 desta trilha.\n\nÉ exatamente aí que uma rede com várias camadas se paga: em vez de você desenhar a feature, a rede aprende sozinha, a partir de milhares ou milhões de exemplos, quais representações internas ajudam a resolver o problema. Reconhecimento de imagem, tradução automática, assistente de voz, esses são os terrenos onde deep learning normalmente lidera."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de dado\", \"Abordagem que costuma ganhar\", \"Por quê\"], [\"Tabular (planilhas, bancos de dados)\", \"ML clássico (random forest, boosting)\", \"As colunas já são boas features, e funciona bem mesmo com pouco dado\"], [\"Imagem\", \"Deep learning\", \"Os padrões visuais são difíceis de descrever à mão, a rede aprende sozinha\"], [\"Texto (linguagem natural)\", \"Deep learning\", \"Vocabulário, contexto e ordem das palavras pedem representações aprendidas\"], [\"Áudio e voz\", \"Deep learning\", \"A onda sonora bruta pede o mesmo tipo de representação aprendida em camadas\"], [\"Poucos exemplos (centenas ou poucos milhares de linhas)\", \"ML clássico\", \"Uma rede profunda overfita fácil sem dado suficiente pra generalizar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde o ML clássico ainda ganha\n\nBoa parte dos problemas de negócio não é imagem nem texto solto: é uma tabela, com colunas numéricas e categóricas, vindas de um banco de dados ou uma planilha. Nesse terreno, o gradient boosting (e as bibliotecas XGBoost, LightGBM e CatBoost, do Módulo 4) costuma bater rede neural, com menos dado, menos ajuste e menos custo computacional. Não é à toa que domina as competições de dado tabular.\n\nTambém vale lembrar do Módulo 6: quando é preciso explicar uma decisão (negar um crédito, sinalizar uma fraude), a importância de features e o SHAP funcionam muito melhor em cima de árvores e boosting do que em cima de uma rede neural, que continua sendo, na prática, uma caixa-preta bem mais difícil de interpretar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"ML clássico (árvores, boosting)\", \"Deep learning (redes neurais)\"], [\"Dado necessário\", \"Centenas ou milhares de linhas já rendem um bom modelo\", \"Costuma pedir dezenas de milhares de exemplos ou mais\"], [\"Custo computacional\", \"Treina em CPU, em minutos\", \"Geralmente pede GPU, e pode levar horas\"], [\"Interpretabilidade\", \"Alta, com importância de features e SHAP\", \"Baixa, mais parecida com uma caixa-preta\"], [\"Dado ideal\", \"Tabular, com colunas numéricas e categóricas\", \"Não estruturado: imagem, texto, áudio\"], [\"Preparo das features\", \"Você desenha as features, como no Módulo 1\", \"A rede aprende as representações sozinha\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# regra prática pra começar a pensar (não é lei, é ponto de partida)\ndef abordagem_provavel(tipo_dado, n_amostras):\n    dado_nao_estruturado = tipo_dado in (\"imagem\", \"texto\", \"audio\")\n    if dado_nao_estruturado and n_amostras > 100_000:\n        return \"deep learning\"\n    return \"ML clássico (árvore, random forest, gradient boosting)\"\n\nprint(abordagem_provavel(\"tabular\", 5_000))   # ML clássico (árvore, random forest, gradient boosting)\nprint(abordagem_provavel(\"imagem\", 500_000))  # deep learning\n# a maioria dos problemas de negócio com dado em tabela cai no primeiro caso"
                    },
                    {
                        "type": "text",
                        "value": "## Não é bala de prata pra nenhum dos dois lados\n\nVale reforçar a mesma honestidade que já apareceu com boosting no Módulo 4: nem deep learning nem ML clássico ganham sempre. Deep learning custa dado (muito dado) e custa máquina, e um projeto que não tem nenhum dos dois só vai acumular complexidade sem ganhar acurácia. ML clássico, por outro lado, ainda depende de você desenhar boas features na mão, o que nem sempre é possível quando o dado é bruto demais, como uma imagem ou um áudio.\n\nA pergunta certa nunca é \"qual técnica é mais avançada\", e sim \"qual técnica resolve este problema, com este dado que eu realmente tenho\"."
                    },
                    {
                        "type": "quote",
                        "value": "Deep learning brilha quando o dado é bruto e abundante. Fora disso, a árvore, o random forest e o boosting continuam sendo o caminho mais curto até um bom resultado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Deep learning costuma se destacar mais em qual tipo de dado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dados não estruturados e abundantes, como imagem, texto e áudio",
                                "isCorrect": true
                            },
                            {
                                "text": "Dados tabulares organizados em poucas colunas numéricas e categóricas",
                                "isCorrect": false
                            },
                            {
                                "text": "Planilhas pequenas, com algumas centenas de linhas ao todo",
                                "isCorrect": false
                            },
                            {
                                "text": "Dados já resumidos em poucas métricas agregadas por categoria",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa base de dados tabular de porte médio, por que o gradient boosting costuma bater uma rede neural?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque as colunas já são boas features, e o boosting extrai valor delas com pouco ajuste",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque redes neurais não conseguem processar número nenhum, apenas texto e imagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o gradient boosting não depende de nenhum hiperparâmetro pra funcionar bem",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque dados tabulares nunca têm relação nenhuma entre as colunas pra rede explorar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num problema onde é preciso justificar cada decisão do modelo pro cliente, qual costuma ser a escolha mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um modelo como árvore ou boosting, apoiado em importância de features ou SHAP",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma rede neural profunda, porque redes sempre entregam a maior acurácia possível",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer modelo, já que interpretabilidade não muda conforme o algoritmo escolhido",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo de clustering, porque ele dispensa qualquer explicação sobre o resultado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe tem apenas 800 linhas rotuladas e decide treinar uma rede neural profunda em vez de um random forest. O que é mais provável de acontecer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A rede overfita fácil, porque poucos exemplos não bastam pra ajustar tantos pesos",
                                "isCorrect": true
                            },
                            {
                                "text": "A rede treina mais rápido que o random forest, já que tem menos dado pra processar",
                                "isCorrect": false
                            },
                            {
                                "text": "O random forest deixa de funcionar, porque exige uma quantidade mínima de linhas",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois modelos chegam exatamente ao mesmo resultado, independente da base usada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma manchete anuncia que \"deep learning substitui todo o machine learning clássico\". Qual afirmação melhor descreve a realidade da prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Depende: em dado tabular e com pouco volume, o ML clássico ainda costuma ganhar",
                                "isCorrect": true
                            },
                            {
                                "text": "É verdade: nenhuma equipe séria ainda usa random forest ou boosting em produção hoje",
                                "isCorrect": false
                            },
                            {
                                "text": "É verdade, mas só porque o scikit-learn parou de receber atualização e manutenção",
                                "isCorrect": false
                            },
                            {
                                "text": "É falso: deep learning só funciona em pesquisa acadêmica, nunca em problema real",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As ferramentas (TensorFlow, PyTorch)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Outro ferramental: treinar rede não é treinar com scikit-learn\n\nToda a trilha até aqui girou em torno do scikit-learn: `fit`, `predict`, `Pipeline`, `GridSearchCV`. Treinar uma rede neural de verdade, com muitas camadas e muitos pesos, geralmente pede outro ferramental, pensado pra fazer contas de matriz em larga escala e aproveitar GPU. Três nomes aparecem o tempo todo nesse mundo: TensorFlow, Keras e PyTorch.\n\nTensorFlow nasceu no Google e é bastante usado quando o destino final é produção, em times que já treinam e também servem redes grandes no dia a dia. PyTorch nasceu no que hoje é a Meta e é a escolha mais comum em pesquisa, por ser mais flexível de mexer por dentro, embora hoje apareça bastante em produção também. Keras é uma API de alto nível, criada pra tornar a montagem de uma rede mais legível, e hoje roda integrada ao TensorFlow."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\", \"O que é\", \"Onde costuma aparecer\"], [\"TensorFlow\", \"Framework de deep learning do Google, pensado pra produção\", \"Times que treinam e também servem redes grandes\"], [\"Keras\", \"API de alto nível sobre o TensorFlow, fácil de ler e escrever\", \"Primeiro contato com deep learning, prototipagem rápida\"], [\"PyTorch\", \"Framework de deep learning flexível, popular em pesquisa\", \"Pesquisa acadêmica, e cada vez mais também produção\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um esboço de rede com Keras\n\nRepare como a lógica de fundo se repete: você empilha camadas, compila o modelo dizendo qual função de perda e qual otimizador usar, e chama `fit` passando os dados de treino. No final, `predict` devolve as previsões, do mesmo jeito que em qualquer modelo do scikit-learn. A cara muda, o roteiro (treinar e depois prever) continua o mesmo."
                    },
                    {
                        "type": "code",
                        "value": "from tensorflow import keras\nfrom tensorflow.keras import layers\n\nmodelo = keras.Sequential([\n    layers.Dense(16, activation=\"relu\", input_shape=(X_treino.shape[1],)),  # camada oculta\n    layers.Dense(8, activation=\"relu\"),                                     # outra camada oculta\n    layers.Dense(1, activation=\"sigmoid\"),                                  # saída: classe binária\n])\n\nmodelo.compile(optimizer=\"adam\", loss=\"binary_crossentropy\", metrics=[\"accuracy\"])\nmodelo.fit(X_treino, y_treino, epochs=20, batch_size=32, validation_split=0.2)\n# validation_split reserva uma fatia do treino pra acompanhar o erro a cada época\n\nprevisoes = modelo.predict(X_teste)\n# de novo um predict() no final, como em qualquer modelo scikit-learn desta trilha"
                    },
                    {
                        "type": "text",
                        "value": "## O preço desse ferramental\n\nVale ser honesto sobre o que essa troca de ferramental custa. Uma rede como a do exemplo já tem mais hiperparâmetro pra decidir do que um RandomForestClassifier: quantas camadas, quantos neurônios por camada, qual ativação, qual taxa de aprendizado, quantas épocas, qual tamanho de lote. Cada escolha dessas pede experimentação, e testar cada combinação custa tempo de GPU, não só tempo de CPU.\n\nIsso não quer dizer que dá pra evitar deep learning sempre. Quer dizer que reaproveitar o que essa trilha já ensinou (validação cruzada, curva de validação, honestidade sobre overfitting) continua necessário, só que agora com um ferramental mais caro de operar."
                    },
                    {
                        "type": "quote",
                        "value": "TensorFlow, Keras e PyTorch são só o motor. Decidir se vale a pena ligar esse motor continua sendo trabalho seu."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são três das principais ferramentas usadas pra treinar redes neurais, citadas nesta aula?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "TensorFlow, Keras e PyTorch",
                                "isCorrect": true
                            },
                            {
                                "text": "scikit-learn, pandas e NumPy",
                                "isCorrect": false
                            },
                            {
                                "text": "GridSearchCV, RandomForest e Pipeline",
                                "isCorrect": false
                            },
                            {
                                "text": "XGBoost, LightGBM e CatBoost",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel do Keras no ecossistema de deep learning?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma API de alto nível, mais simples de ler e escrever, que roda sobre o TensorFlow",
                                "isCorrect": true
                            },
                            {
                                "text": "Um banco de dados otimizado pra guardar pesos de redes neurais já treinadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma biblioteca de visualização de gráficos, usada só depois do treino da rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Um algoritmo de ensemble, que combina várias redes neurais treinadas em paralelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o `.fit()` de um modelo Keras tem em comum com o `.fit()` de um modelo scikit-learn?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os dois recebem os dados de treino e ajustam os parâmetros internos do modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois exigem que o dado já esteja normalizado dentro de uma rede neural",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois só funcionam depois de uma chamada anterior ao método `.predict()`",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois calculam automaticamente o SHAP de cada feature usada no treino",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca um GradientBoostingClassifier por uma rede neural em Keras, sem mudar o volume de dado nem o problema. O que é mais provável de acontecer com o custo de desenvolvimento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumenta: agora tem mais hiperparâmetros pra ajustar e mais poder computacional envolvido",
                                "isCorrect": true
                            },
                            {
                                "text": "Diminui: redes neurais sempre exigem menos ajuste de hiperparâmetro do que o boosting",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica igual: o número de decisões de arquitetura não muda entre os dois tipos de modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Diminui: o Keras dispensa qualquer etapa de validação que o scikit-learn exigia antes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao decidir treinar uma rede neural com TensorFlow ou PyTorch em vez de um modelo scikit-learn, o que continua sendo verdade?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O ciclo de treinar, avaliar e desconfiar do resultado continua o mesmo, mudam as ferramentas",
                                "isCorrect": true
                            },
                            {
                                "text": "A validação cruzada deixa de fazer sentido, porque redes neurais não podem ser avaliadas assim",
                                "isCorrect": false
                            },
                            {
                                "text": "O overfitting deixa de ser um risco, porque redes neurais generalizam sempre melhor",
                                "isCorrect": false
                            },
                            {
                                "text": "A divisão entre treino e teste deixa de ser necessária ao usar esse tipo de ferramenta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recap e o próximo passo (Do Modelo ao Produto)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Sete módulos depois: você foi além do básico\n\nQuando você começou esta trilha, já sabia treinar e avaliar um modelo com scikit-learn: regressão, classificação, matriz de confusão, aquele overfitting da árvore de decisão. Sete módulos depois, você foi muito além disso. Sabe criar features que realmente ajudam o modelo, ajustar hiperparâmetros de forma sistemática em vez de no chute, combinar modelos em ensembles que costumam bater qualquer árvore sozinha, montar um pipeline que não vaza dado, lidar com problemas reais como classes desbalanceadas, e agora tem até uma primeira noção de deep learning.\n\nAntes de seguir pro próximo (e último) estágio do roadmap de Ciência de Dados, vale olhar pra trás e ver o caminho inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Módulo\", \"O que você levou dele\"], [\"1\", \"Feature engineering: criar, selecionar e checar a importância de boas features\"], [\"2\", \"Ajuste de hiperparâmetros com GridSearchCV e RandomizedSearchCV, apoiado em validação cruzada\"], [\"3\", \"Ensembles por bagging: random forest, e por que juntar modelos reduz a variância\"], [\"4\", \"Ensembles por boosting: Gradient Boosting e a família XGBoost, LightGBM e CatBoost\"], [\"5\", \"Pipelines robustos com Pipeline e ColumnTransformer, sem vazamento, prontos pra salvar com joblib\"], [\"6\", \"Lidar com classes desbalanceadas, dado ruim e overfitting, e interpretar o modelo com SHAP\"], [\"7\", \"Uma introdução a deep learning: o que é, quando vale a pena, e as ferramentas do ecossistema\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O fio condutor desta trilha\n\nRepare no caminho que essa sequência percorre. Você começou entendendo que boas features valem tanto quanto (às vezes mais que) o algoritmo escolhido. Aprendeu a buscar hiperparâmetros de forma sistemática, em vez de ajustar um valor de cada vez no escuro. Descobriu que um conjunto de modelos, bem combinado, costuma bater qualquer modelo sozinho, seja votando (bagging) ou corrigindo o erro um do outro em sequência (boosting). Aprendeu que nenhum pipeline sobrevive a dado vazado ou mal preparado. Encarou de frente os problemas que todo projeto real enfrenta mais cedo ou mais tarde. E, por fim, espiou o outro lado do mapa, onde dado bruto e abundante pede um ferramental diferente.\n\nO fio condutor é esse: sair de um modelo que só funciona no notebook e chegar a um modelo em que dá pra confiar, mesmo sabendo onde ele pode falhar."
                    },
                    {
                        "type": "text",
                        "value": "## Honestidade final: complexidade não é sinônimo de qualidade\n\nVale fechar reforçando algo que apareceu em quase todo módulo desta trilha: nem boosting, nem ensemble, nem deep learning são bala de prata. Um modelo mais complexo só vale a pena quando o problema realmente pede essa complexidade, e quando existe dado suficiente pra sustentá-la. Muita vez, um RandomForestClassifier bem ajustado, rodando sobre features bem pensadas, ganha de uma solução chamativa e cara de manter. Julgamento continua valendo mais que a técnica mais nova do momento."
                    },
                    {
                        "type": "text",
                        "value": "## O próximo (e último) estágio: Do Modelo ao Produto\n\nUm modelo que só existe dentro de um notebook não gera valor pra ninguém. O próximo estágio do roadmap de Ciência de Dados, Do Modelo ao Produto, fecha exatamente essa lacuna, com quatro frentes:\n\n- **Colocar o modelo em produção**: sair do notebook e transformar o modelo treinado numa parte de um sistema de verdade.\n- **Servir previsões**: expor o modelo pra que outros sistemas (ou pessoas) consigam pedir uma previsão, geralmente através de uma API.\n- **MLOps**: o ciclo de vida do modelo depois do treino, versionar, re-treinar quando necessário, e automatizar esse processo.\n- **Monitorar o modelo em produção e a ética da IA**: acompanhar se o modelo continua acertando com o tempo (o mundo muda, o dado muda), e pensar com responsabilidade no impacto real de uma decisão automatizada na vida de alguém.\n\nÉ o último estágio do roadmap de Ciência de Dados. Você está a um estágio de fechar esse caminho inteiro."
                    },
                    {
                        "type": "code",
                        "value": "import joblib\n\n# uma prévia do próximo estágio: o pipeline treinado (Módulo 5) vira parte de um serviço\nmodelo = joblib.load(\"modelo_treinado.pkl\")\n\ndef prever(dados_novos):\n    return modelo.predict(dados_novos)\n\n# no próximo estágio, uma função como essa vira um endpoint de API,\n# chamado em produção toda vez que alguém precisa de uma previsão nova"
                    },
                    {
                        "type": "quote",
                        "value": "Você não sai desta trilha sabendo todo algoritmo que existe. Sai sabendo desconfiar de resultado bom demais, testar de forma sistemática e escolher a ferramenta pelo problema, não pela fama dela."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao longo desta trilha, qual foi a ideia central que uniu feature engineering, tuning e ensembles?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ir além de treinar um modelo básico, buscando ganhos reais de qualidade e robustez",
                                "isCorrect": true
                            },
                            {
                                "text": "Abandonar tudo que foi visto na trilha de Machine Learning anterior, do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o scikit-learn por outra biblioteca em praticamente todos os módulos",
                                "isCorrect": false
                            },
                            {
                                "text": "Provar que qualquer modelo simples já basta pra qualquer problema real de negócio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o próximo (e último) estágio do roadmap de Ciência de Dados depois desta trilha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Do Modelo ao Produto, cobrindo deploy, MLOps, monitoramento e ética em IA",
                                "isCorrect": true
                            },
                            {
                                "text": "Machine Learning na Prática, revisando ensembles e deep learning outra vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Estatística e Probabilidade, agora aprofundada num nível mais avançado",
                                "isCorrect": false
                            },
                            {
                                "text": "Banco de Dados, cobrindo SQL avançado e modelagem relacional completa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual par conecta corretamente um módulo desta trilha à sua ideia central?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Módulo 4: treinar modelos em sequência, cada um corrigindo o erro do anterior",
                                "isCorrect": true
                            },
                            {
                                "text": "Módulo 3: treinar vários modelos ao mesmo tempo, cada um corrigindo o erro do anterior",
                                "isCorrect": false
                            },
                            {
                                "text": "Módulo 6: escalonar as variáveis numéricas antes de calcular qualquer distância",
                                "isCorrect": false
                            },
                            {
                                "text": "Módulo 1: combinar árvores de decisão numa floresta pra reduzir a variância",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um modelo entrar em produção, os dados do mundo real começam a mudar aos poucos em relação ao dado de treino. Qual frente do próximo estágio trata exatamente disso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Monitoramento do modelo em produção, de olho em degradação de performance ao longo do tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Feature engineering, criando variáveis novas antes de qualquer modelo ser treinado",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajuste de hiperparâmetros, buscando uma combinação melhor de `n_estimators` e `max_depth`",
                                "isCorrect": false
                            },
                            {
                                "text": "Seleção de features, removendo colunas irrelevantes ou redundantes do conjunto de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de aprender ensembles, pipelines e uma introdução a deep learning nesta trilha, qual conclusão resume melhor o critério pra escolher entre eles num problema novo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Depende dos dados e do objetivo: não existe algoritmo que vença sempre, em qualquer cenário",
                                "isCorrect": true
                            },
                            {
                                "text": "Deep learning deve ser a primeira tentativa sempre, por ser a técnica mais recente disponível",
                                "isCorrect": false
                            },
                            {
                                "text": "Boosting deve ser descartado sempre que uma rede neural estiver disponível pra uso imediato",
                                "isCorrect": false
                            },
                            {
                                "text": "Random forest deve substituir qualquer outro modelo, já que nunca overfita em nenhum caso",
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
