// Seed da trilha Visualizacao de Dados (intermediario), estagio 6 do roadmap de Ciencia de Dados.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-visualizacao-dados.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Visualização de Dados";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Veja e comunique seus dados: quando usar cada gráfico, matplotlib e seaborn na prática, análise exploratória visual, boas práticas (e os gráficos que enganam) e storytelling com dados. De uma tabela ao insight que convence.";

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
        "titulo": "Módulo 1 - Por que visualizar dados",
        "aulas": [
            {
                "titulo": "O que um gráfico revela (o quarteto de Anscombe)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que visualizar dados\n\nVocê já sabe resumir uma variável com pandas e estatística: média, desvio padrão, correlação. Um punhado de números que descreve o comportamento de milhares de linhas em poucos caracteres. Só que resumir tem um custo escondido: dois conjuntos de dados completamente diferentes podem gerar exatamente os mesmos números resumidos. Só o gráfico mostra a diferença entre eles. Essa é a ideia central deste módulo, e o exemplo mais famoso da estatística pra provar isso tem nome: o quarteto de Anscombe."
                    },
                    {
                        "type": "text",
                        "value": "## O quarteto de Anscombe\n\nEm 1973, o estatístico Francis Anscombe construiu quatro conjuntos de dados, cada um com onze pares de valores (x, y). Ele fez isso de propósito: os quatro têm média de x, média de y, variância de x, variância de y, correlação entre x e y e até a reta de regressão linear praticamente idênticas. Se você olhasse só a tabela de estatísticas resumidas, diria que é o mesmo conjunto de dados repetido quatro vezes.\n\nOs quatro gráficos de dispersão mostram outra história."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estatística\",\"Conjunto I\",\"Conjunto II\",\"Conjunto III\",\"Conjunto IV\"],[\"Média de x\",\"9,00\",\"9,00\",\"9,00\",\"9,00\"],[\"Média de y\",\"7,50\",\"7,50\",\"7,50\",\"7,50\"],[\"Variância de x\",\"11,00\",\"11,00\",\"11,00\",\"11,00\"],[\"Variância de y\",\"4,13\",\"4,13\",\"4,12\",\"4,12\"],[\"Correlação (x, y)\",\"0,816\",\"0,816\",\"0,816\",\"0,816\"],[\"Reta de regressão\",\"y = 3,00 + 0,50x\",\"y = 3,00 + 0,50x\",\"y = 3,00 + 0,50x\",\"y = 3,00 + 0,50x\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que cada dispersão mostra\n\nPlotando os quatro conjuntos lado a lado (o código a seguir faz isso), aparecem quatro formas bem diferentes:\n\n- **Conjunto I**: uma nuvem de pontos alinhada em torno de uma reta crescente, com espalhamento normal ao redor dela. É o caso clássico de relação linear com ruído, exatamente o que a reta de regressão promete.\n- **Conjunto II**: os pontos não formam uma reta, formam uma curva nítida, subindo e depois descendo, um arco. A relação entre x e y é forte, só que não é linear. Uma reta é o modelo errado aqui, mesmo com a mesma correlação de 0,816.\n- **Conjunto III**: quase todos os pontos caem sobre uma reta quase perfeita, com uma única exceção: um ponto isolado bem acima do padrão. Esse outlier sozinho puxa a reta de regressão pra longe de onde ela deveria estar.\n- **Conjunto IV**: quase todos os pontos têm o mesmo valor de x, empilhados numa linha vertical, exceto um ponto isolado bem à direita. Esse ponto único é responsável por toda a correlação calculada: sem ele, x nem varia."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# os quatro conjuntos do quarteto de Anscombe (o mesmo x para I, II e III)\nx123 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]\ny1 = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]\ny2 = [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]\ny3 = [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]\nx4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8]\ny4 = [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]\n\n# 2 linhas, 2 colunas de gráficos na mesma figura (subplots em detalhe no próximo módulo)\nfig, eixos = plt.subplots(2, 2, figsize=(8, 8))\n\neixos[0, 0].scatter(x123, y1)\neixos[0, 0].set_title(\"Conjunto I\")\n\neixos[0, 1].scatter(x123, y2)\neixos[0, 1].set_title(\"Conjunto II\")\n\neixos[1, 0].scatter(x123, y3)\neixos[1, 0].set_title(\"Conjunto III\")\n\neixos[1, 1].scatter(x4, y4)\neixos[1, 1].set_title(\"Conjunto IV\")\n\nplt.tight_layout()\nplt.savefig(\"anscombe.png\")"
                    },
                    {
                        "type": "text",
                        "value": "## A moral do quarteto\n\nQuatro histórias diferentes (relação linear com ruído, relação curva, outlier isolado, ponto isolado que sozinho cria a correlação) escondidas atrás da mesma tabela de estatísticas. Quem decidisse ajustar uma reta de regressão olhando só os números resumidos cometeria o mesmo erro nos quatro casos, e só um deles pede mesmo uma reta. Resumir é útil, mas resumir esconde forma. O gráfico devolve a forma que o resumo apagou, e é por isso que ele abre esta trilha, antes de qualquer linha de matplotlib."
                    },
                    {
                        "type": "quote",
                        "value": "Média, variância e correlação descrevem um número. O gráfico descreve uma forma, e quase sempre é a forma que conta a história de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o quarteto de Anscombe demonstra sobre estatísticas resumidas como média e correlação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que dados quase idênticos nessas estatísticas podem ter formas bem diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Que todo gráfico de dispersão esconde por trás uma relação linear perfeita",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a correlação entre duas variáveis sempre aumenta com mais pontos",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a média é sempre igual à mediana em qualquer conjunto de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No quarteto de Anscombe, o que os quatro conjuntos de dados têm em comum?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Média, variância e correlação praticamente iguais entre os quatro conjuntos",
                                "isCorrect": true
                            },
                            {
                                "text": "O mesmo formato exato de nuvem de pontos nos quatro gráficos de dispersão",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência completa de outliers em cada um dos quatro conjuntos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma relação claramente curva presente nos quatro conjuntos de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Conjunto IV do quarteto de Anscombe, o que explica a correlação calculada entre x e y?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um único ponto isolado, com x bem maior que os demais, define sozinho a correlação",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma relação linear forte e genuína, espalhada de forma uniforme pelos pontos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma curva suave que passa exatamente por cima de todos os onze pontos",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência completa de qualquer outlier, ao contrário dos outros três conjuntos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre o Conjunto I e o Conjunto II do quarteto, mesmo com estatísticas resumidas quase iguais?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O I tem relação linear com ruído normal; o II tem relação em forma de curva",
                                "isCorrect": true
                            },
                            {
                                "text": "O I tem relação em forma de curva; o II tem relação linear com ruído normal",
                                "isCorrect": false
                            },
                            {
                                "text": "O I não tem nenhuma relação entre x e y; o II tem relação linear perfeita",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois conjuntos têm exatamente o mesmo gráfico de dispersão, sem diferença",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que calcular só média, variância e correlação não é suficiente pra decidir se uma reta de regressão é um bom modelo pros dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque conjuntos com essas estatísticas iguais podem ter formas visuais bem diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque média, variância e correlação só podem ser calculadas com no máximo dez pontos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda reta de regressão exige que os dados já estejam ordenados por x antes do cálculo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o valor da correlação muda sozinho cada vez que o conjunto de dados é replotado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Explorar x explicar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dois motivos pra abrir um gráfico\n\nNem todo gráfico que você faz serve pro mesmo objetivo. Às vezes você plota pra entender o que tem na mão, ainda sem saber o que vai encontrar. Outras vezes você já sabe o achado e precisa convencer alguém dele. São dois momentos diferentes da análise, com regras diferentes, e a literatura de visualização dá nome pra cada um: exploração e explicação."
                    },
                    {
                        "type": "text",
                        "value": "## Explorar: gráfico pra você\n\nExplorar é a fase de investigação. Você acabou de carregar um DataFrame novo com `pd.read_csv()` e quer entender rápido o que tem ali: como cada coluna se distribui, se existem outliers, se duas variáveis parecem relacionadas. Nessa fase o gráfico é pra você mesmo, então velocidade importa mais que estética: usa `df.hist()`, `plt.scatter()` ou `df.plot()` sem se preocupar com título caprichado, cor combinando ou legenda arrumada. Você vai gerar dezenas de gráficos rascunho, descartar a maioria, e seguir pro próximo. É a continuação visual do que você já fazia com `.describe()` e `.value_counts()`, só que agora com os olhos, não só com números."
                    },
                    {
                        "type": "text",
                        "value": "## Explicar: gráfico pra outra pessoa\n\nExplicar é a fase de comunicação. Você já sabe o que os dados dizem (achou o padrão, confirmou a hipótese, encontrou o problema) e agora precisa mostrar isso pra alguém que não viu o processo todo: um gestor, um cliente, o resto do time. Aqui o cuidado muda de figura: um gráfico só (ou poucos), com título que já entrega a conclusão, eixos rotulados, cor usada com intenção, e todo elemento que não ajuda a mensagem removido. É trabalho de edição, não de descoberta: você já sabe o que quer mostrar, falta só mostrar bem.\n\nO erro mais comum é inverter os papéis: pular a exploração e ir direto pro gráfico bonito, ou entregar pra outra pessoa um gráfico de exploração cru, sem título nem eixo rotulado, que só fazia sentido pra quem já conhecia os dados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Explorar\",\"Explicar\"],[\"Pra quem\",\"Pra você mesmo\",\"Pra outra pessoa\"],[\"Quantidade de gráficos\",\"Muitos, descartáveis\",\"Poucos, revisados\"],[\"Velocidade\",\"Rápida, sem capricho\",\"Lenta, cuidadosa\"],[\"Título e rótulos\",\"Opcionais ou padrão\",\"Claros e obrigatórios\"],[\"Momento da análise\",\"Início, investigando\",\"Fim, comunicando\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport matplotlib.pyplot as plt\n\nvendas = pd.read_csv(\"vendas.csv\")\n\n# fase de exploração: rápido, sem capricho, só pra ver a distribuição\nvendas[\"valor\"].hist()\nplt.show()\n\n# fase de explicação: o mesmo dado, agora pronto pra outra pessoa ver\nplt.figure(figsize=(8, 5))\nplt.hist(vendas[\"valor\"], bins=20, color=\"#4C72B0\", edgecolor=\"white\")\nplt.title(\"A maioria das vendas fica entre R$ 50 e R$ 150\")\nplt.xlabel(\"Valor da venda (R$)\")\nplt.ylabel(\"Número de vendas\")\nplt.savefig(\"vendas_explicado.png\")"
                    },
                    {
                        "type": "text",
                        "value": "## A pergunta que resolve a dúvida\n\nComo os dois momentos usam o mesmo código de plotagem por baixo (`plt`, e mais pra frente `sns`), é fácil esquecer que são etapas diferentes, com plateia diferente. Antes de considerar um gráfico pronto, vale perguntar: este gráfico é só pra eu entender, ou alguém mais vai olhar pra ele sem o contexto que eu tenho? A resposta decide se falta título, rótulo e capricho, ou se já pode seguir pro rascunho seguinte."
                    },
                    {
                        "type": "quote",
                        "value": "Explorar é fazer perguntas pros dados; explicar é responder uma pergunta pra alguém. Raramente o mesmo gráfico serve bem pros dois papéis."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal objetivo de um gráfico feito na fase de exploração dos dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ajudar quem está analisando a entender rápido o que os dados escondem",
                                "isCorrect": true
                            },
                            {
                                "text": "Impressionar um gestor numa apresentação com um único gráfico final",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir por completo qualquer relatório escrito sobre os dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantir que o gráfico já saia pronto pra publicação sem revisão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num gráfico feito pra explicar um achado pra outra pessoa, o que costuma ganhar mais cuidado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Título, rótulos dos eixos e a remoção do que não ajuda a mensagem",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de gráficos gerados, quanto mais rascunhos, melhor",
                                "isCorrect": false
                            },
                            {
                                "text": "A velocidade de gerar o gráfico, sem revisar nada depois",
                                "isCorrect": false
                            },
                            {
                                "text": "O uso do maior número possível de cores diferentes no mesmo gráfico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma analista acabou de carregar um CSV novo e está testando vários gráficos rápidos, sem título nem legenda, só pra entender as colunas. Essa é a fase de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Exploração, um momento de investigação rápida pra ela mesma",
                                "isCorrect": true
                            },
                            {
                                "text": "Explicação, um momento de comunicação formal pro time todo",
                                "isCorrect": false
                            },
                            {
                                "text": "Limpeza, uma etapa que já deveria ter sido feita no pandas",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelagem, uma etapa que antecede o treino de machine learning",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que costuma ser um problema entregar pra um gestor um gráfico feito na fase de exploração, sem ajustes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque falta contexto: sem título e eixos claros, ele não sabe ler o gráfico",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque gráficos de exploração usam sempre uma biblioteca proibida pra clientes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nenhum gráfico de exploração pode ser gerado outra vez depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a fase de exploração nunca produz nenhum gráfico correto de verdade",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista já sabe, por exploração anterior, que a região Sul vende mais que as demais, e agora precisa montar um gráfico pra reunião de diretoria mostrando exatamente esse ponto. O que faz mais sentido nesse momento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um gráfico de barras único, com título que já entrega a conclusão e destaque pro Sul",
                                "isCorrect": true
                            },
                            {
                                "text": "Vários histogramas de rascunho, um pra cada coluna do DataFrame original completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico sem título nem cor, deixando a diretoria descobrir sozinha o padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela bruta do pandas, sem gráfico nenhum, exportada direto do describe()",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de gráfico e a pergunta de cada um",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Cada gráfico responde a uma pergunta\n\nAntes de abrir o matplotlib, vale uma pergunta mais simples: o que você quer descobrir? Cada tipo de gráfico existe pra responder um tipo de pergunta sobre os dados, e a escolha certa começa aí, na pergunta, não na biblioteca. Os próximos módulos entregam a ferramenta (matplotlib e depois seaborn); esta aula entrega o mapa de qual gráfico procurar pra cada pergunta."
                    },
                    {
                        "type": "text",
                        "value": "## Distribuição: como os valores se espalham?\n\nQuando a pergunta é sobre uma única variável (quais valores ela assume, com que frequência, se é simétrica, se tem outliers), o gráfico certo é de distribuição. O histograma divide os valores em faixas (bins) e mostra, em barras, quantas observações caem em cada faixa: barras altas marcam faixas comuns, barras baixas marcam faixas raras. O boxplot resume a mesma ideia de outro jeito, com uma caixa que vai do primeiro ao terceiro quartil, uma linha na mediana, hastes até o alcance típico dos dados, e pontos isolados marcando outliers: o mesmo IQR que você calculou na trilha de Estatística, agora desenhado."
                    },
                    {
                        "type": "text",
                        "value": "## Comparação: quem é maior, quem é menor?\n\nQuando a pergunta compara categorias (qual produto vendeu mais, qual região teve mais clientes), o gráfico certo é de comparação: barras. Cada categoria vira uma barra, a altura representa o valor, e o olho humano é ótimo pra comparar tamanhos de barras lado a lado. É diferente do histograma: a barra do gráfico de comparação representa uma categoria (produto A, produto B); a barra do histograma representa uma faixa de valores de uma variável contínua (0 a 10, 10 a 20). Confundir os dois é um dos erros mais comuns de quem está começando."
                    },
                    {
                        "type": "text",
                        "value": "## Relação, composição e evolução\n\nTrês perguntas fecham o mapa. Quando você quer saber se duas variáveis andam juntas (o preço sobe quando a área aumenta?), a pergunta é de relação, e o gráfico é a dispersão: cada ponto é uma observação, posicionada pelo valor de x e de y, e o formato da nuvem mostra se a relação é forte, fraca, linear ou curva, o mesmo tipo de gráfico que revelou as diferenças do quarteto de Anscombe. Quando você quer saber como um total se divide em partes (que fração das vendas veio de cada categoria, mês a mês), a pergunta é de composição, e o gráfico é de barras empilhadas: cada barra é um total, dividido em segmentos coloridos, um por categoria. E quando a pergunta é sobre mudança ao longo do tempo (como o faturamento variou mês a mês), o gráfico é de linha: o tempo no eixo x, o valor no eixo y, pontos ligados por um traço que deixa a tendência óbvia."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta que você quer responder\",\"Tipo de gráfico\",\"Exemplo de gráfico\"],[\"Como uma variável se espalha?\",\"Distribuição\",\"Histograma, boxplot\"],[\"Quem é maior entre as categorias?\",\"Comparação\",\"Gráfico de barras\"],[\"Duas variáveis andam juntas?\",\"Relação\",\"Dispersão (scatter)\"],[\"Como um total se divide em partes?\",\"Composição\",\"Barras empilhadas\"],[\"Como algo muda ao longo do tempo?\",\"Evolução\",\"Gráfico de linha\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nnotas = [5.5, 6.0, 6.5, 7.0, 7.0, 7.5, 8.0, 8.5, 8.5, 9.0, 9.5]\ncategorias = [\"Norte\", \"Sul\", \"Leste\", \"Oeste\"]\nvendas = [120, 210, 95, 150]\nhoras_estudo = [1, 2, 2, 3, 4, 5, 6, 7, 8, 9]\nnotas_relacao = [5.0, 5.4, 5.9, 6.3, 6.8, 7.2, 7.6, 8.1, 8.6, 9.0]\nmeses = [\"Jan\", \"Fev\", \"Mar\", \"Abr\", \"Mai\"]\nfaturamento = [10000, 10500, 9800, 11200, 12400]\n\n# distribuição: histograma\nplt.hist(notas, bins=5)\nplt.title(\"Distribuição das notas\")\nplt.show()\n\n# comparação: barras\nplt.bar(categorias, vendas)\nplt.title(\"Vendas por região\")\nplt.show()\n\n# relação: dispersão\nplt.scatter(horas_estudo, notas_relacao)\nplt.title(\"Horas de estudo x nota\")\nplt.show()\n\n# evolução: linha\nplt.plot(meses, faturamento, marker=\"o\")\nplt.title(\"Faturamento mês a mês\")\nplt.show()"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de escolher a biblioteca, escolha a pergunta: distribuição, comparação, relação, composição ou evolução. O gráfico certo é consequência da pergunta certa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tipo de gráfico responde à pergunta 'como os valores de uma variável se espalham'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um gráfico de distribuição, como o histograma ou o boxplot",
                                "isCorrect": true
                            },
                            {
                                "text": "Um gráfico de composição, como as barras empilhadas coloridas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico de evolução, como a linha ligando pontos no tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico de relação, como a dispersão entre duas variáveis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual gráfico é o mais indicado pra comparar o faturamento de quatro regiões diferentes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um gráfico de barras, uma barra pra cada região",
                                "isCorrect": true
                            },
                            {
                                "text": "Um histograma, uma faixa de valores pra cada região",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico de dispersão, um ponto pra cada região",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico de linha, ligando as quatro regiões no tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre a barra de um histograma e a barra de um gráfico de comparação de categorias?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A do histograma representa uma faixa de valores; a outra representa uma categoria",
                                "isCorrect": true
                            },
                            {
                                "text": "A do histograma representa uma categoria; a outra representa uma faixa de valores",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas representam sempre a mesma coisa, só muda a cor das barras",
                                "isCorrect": false
                            },
                            {
                                "text": "A do histograma nunca pode ter altura diferente entre as barras vizinhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela do pandas mostra, mês a mês, o faturamento total de uma loja ao longo de dois anos. Qual gráfico revela melhor a tendência dessa série?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um gráfico de linha, com o tempo no eixo x e o faturamento no eixo y",
                                "isCorrect": true
                            },
                            {
                                "text": "Um gráfico de dispersão, sem nenhuma ordem entre os pontos plotados",
                                "isCorrect": false
                            },
                            {
                                "text": "Um boxplot, resumindo o faturamento inteiro numa única caixa",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico de barras empilhadas, dividindo cada mês em categorias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista quer saber se existe relação entre a área de um imóvel e o preço de venda, usando um DataFrame com uma linha por imóvel. Qual gráfico responde diretamente a essa pergunta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dispersão, com a área num eixo e o preço no outro, ponto a ponto",
                                "isCorrect": true
                            },
                            {
                                "text": "Histograma da área, ignorando por completo a coluna de preço",
                                "isCorrect": false
                            },
                            {
                                "text": "Barras comparando a média de preço entre bairros diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Linha do preço médio mês a mês ao longo do último ano",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escolher o gráfico certo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O erro mais comum: escolher pelo que é bonito\n\nCom o mapa da aula passada, que liga cada pergunta a um tipo de gráfico, já dá pra evitar o erro mais comum de quem está começando: escolher o gráfico pelo que parece mais bonito, ou pelo que já é hábito usar (quase sempre barra, pra tudo), em vez de escolher pelo que a pergunta pede. Um gráfico pode estar tecnicamente correto, com os números certos, e ainda ser a escolha errada, porque não responde a pergunta que motivou a análise."
                    },
                    {
                        "type": "text",
                        "value": "## Um roteiro de três perguntas\n\nAntes de abrir o matplotlib, três perguntas resolvem boa parte das escolhas:\n\n1. Quantas variáveis eu quero olhar de uma vez? Uma variável sozinha pede distribuição. Duas pedem relação, ou evolução se uma delas for tempo. Categorias contra um valor pedem comparação.\n2. Existe uma ordem natural, como o tempo? Se sim, a evolução (linha) quase sempre vence a comparação (barra) pra mostrar tendência.\n3. Eu preciso ver cada observação, ou só o resumo? Outliers e formato pedem o dado bruto (dispersão, histograma); uma decisão rápida pede o resumo (barra, boxplot).\n\nRaramente existe um único gráfico certo pra cada situação, mas esse roteiro já elimina rápido as opções erradas."
                    },
                    {
                        "type": "text",
                        "value": "## Confusão clássica: histograma não é gráfico de barras\n\nOs dois parecem irmãos (ambos são retângulos verticais), mas respondem perguntas diferentes, como você viu na aula passada: o histograma mostra a distribuição de uma variável numérica contínua, dividida em faixas; o gráfico de barras compara categorias distintas. Um jeito prático de não errar: se o eixo x tem nomes (Norte, Sul, Produto A), é barra; se o eixo x tem faixas de número (0 a 10, 10 a 20), é histograma."
                    },
                    {
                        "type": "text",
                        "value": "## Dois problemas pra desconfiar desde já\n\nDuas escolhas quase sempre saem erradas, e valem uma desconfiança permanente a partir de agora (os módulos 3 e 6 desta trilha voltam a cada uma delas com mais calma):\n\n- Gráfico de pizza com muitas fatias: o olho humano é ruim pra comparar ângulo e área, e com mais de três ou quatro fatias fica quase impossível dizer qual é maior só de olhar. Quase sempre uma barra faz o mesmo trabalho, melhor.\n- Eixo que não começa em zero: um gráfico de barras com o eixo y cortado, começando em 80 em vez de 0, por exemplo, exagera visualmente qualquer diferença pequena entre as barras. Vale sempre checar onde o eixo começa antes de confiar no que os olhos estão vendo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Se você quer...\",\"Evite\",\"Prefira\"],[\"Comparar poucas categorias\",\"Pizza com muitas fatias\",\"Barras\"],[\"Mostrar mudança ao longo do tempo\",\"Barras soltas, sem ordem\",\"Linha\"],[\"Ver a distribuição de um número\",\"Barras por categoria\",\"Histograma ou boxplot\"],[\"Destacar a diferença real entre barras\",\"Eixo y cortado, fora do zero\",\"Eixo y começando em zero\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nprodutos = [\"A\", \"B\", \"C\"]\nvendas = [102, 98, 105]\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))\n\n# eixo cortado: exagera uma diferença pequena entre 98 e 105\nax1.bar(produtos, vendas, color=\"#DD8452\")\nax1.set_ylim(90, 110)\nax1.set_title(\"Eixo cortado (enganoso)\")\n\n# eixo começando em zero: mostra o tamanho real da diferença\nax2.bar(produtos, vendas, color=\"#4C72B0\")\nax2.set_ylim(0, 120)\nax2.set_title(\"Eixo em zero (honesto)\")\n\nplt.tight_layout()\nplt.savefig(\"comparacao_eixos.png\")"
                    },
                    {
                        "type": "quote",
                        "value": "O gráfico certo é o que responde a pergunta, não o que fica mais bonito no slide. E o mais honesto é o que não precisa de legenda explicando por que o eixo começa em 80."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o critério mais indicado pra escolher um tipo de gráfico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A pergunta que você quer responder sobre os dados",
                                "isCorrect": true
                            },
                            {
                                "text": "O gráfico que parece mais bonito na tela do computador",
                                "isCorrect": false
                            },
                            {
                                "text": "O gráfico que a equipe usou da última vez, sempre o mesmo",
                                "isCorrect": false
                            },
                            {
                                "text": "O gráfico que usa o maior número de cores possível",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num gráfico de barras, qual costuma ser o sinal mais claro de que o eixo y foi cortado de forma enganosa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O eixo y não começa em zero, exagerando a diferença entre barras",
                                "isCorrect": true
                            },
                            {
                                "text": "As barras têm cores diferentes umas das outras no mesmo gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "O gráfico tem um título grande, escrito acima das barras",
                                "isCorrect": false
                            },
                            {
                                "text": "As barras estão ordenadas da menor pra maior, da esquerda pra direita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório mostra um gráfico de pizza com doze fatias, cada uma representando um produto diferente. Qual é o problema mais provável dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com tantas fatias parecidas, fica difícil ver qual produto vende mais",
                                "isCorrect": true
                            },
                            {
                                "text": "Gráfico de pizza nunca pode somar mais de cem por cento do total",
                                "isCorrect": false
                            },
                            {
                                "text": "Pizza só é considerada válida quando existe apenas uma fatia colorida",
                                "isCorrect": false
                            },
                            {
                                "text": "Doze fatias fazem o matplotlib recusar a gerar o gráfico solicitado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma variável tem faixas numéricas no eixo (0 a 10, 10 a 20...) e outra tem nomes de produto no eixo. O que diferencia esses dois gráficos de barras verticais?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O primeiro é histograma (distribuição), o segundo é comparação de categorias",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro é comparação de categorias, o segundo é histograma de distribuição",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois são exatamente o mesmo tipo de gráfico, só muda a cor das barras",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois pode ser feito com a biblioteca matplotlib, só seaborn",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois gráficos de barras mostram as mesmas vendas (98, 102 e 105), mas um usa eixo y de 0 a 120 e o outro usa eixo y de 90 a 110. Por que essa escolha importa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O eixo de 90 a 110 faz uma diferença pequena entre as barras parecer enorme",
                                "isCorrect": true
                            },
                            {
                                "text": "O eixo de 0 a 120 esconde por completo a existência da barra mais alta",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois eixos sempre produzem a mesma impressão visual pra quem olha",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o eixo de 0 a 120 é aceito pela biblioteca matplotlib nesse gráfico",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ecossistema: matplotlib, seaborn e plotly",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Três nomes que você vai ouvir muito\n\nAté aqui você viu o que plotar: a pergunta certa pra cada tipo de gráfico. Falta o com o quê. No ecossistema Python de visualização, três bibliotecas aparecem o tempo todo, e cada uma tem um papel diferente. Não são concorrentes que se excluem: é comum um mesmo projeto usar as três."
                    },
                    {
                        "type": "text",
                        "value": "## matplotlib: a base de tudo\n\nO matplotlib é a biblioteca de visualização mais antiga e mais usada do Python, e a fundação sobre a qual quase todo o resto foi construído, inclusive o seaborn. Ela dá controle sobre cada detalhe de um gráfico: linha, rótulo, cor, posição, você decide. Essa liberdade tem um preço: um gráfico com a aparência padrão do matplotlib pede mais código pra ficar bonito. É a ferramenta certa pra aprender primeiro, porque entender ela é entender a base que sustenta as outras duas. O próximo módulo desta trilha é só sobre ela."
                    },
                    {
                        "type": "text",
                        "value": "## seaborn: estatística, bonita por padrão\n\nO seaborn é construído em cima do matplotlib (por baixo dos panos, ele monta um gráfico matplotlib pra você) e resolve boa parte do trabalho manual: gráficos estatísticos (distribuição, correlação, regressão) com poucas linhas, cores e estilos bonitos por padrão, e integração direta com o DataFrame do pandas, passando `data=df` e os nomes das colunas em `x=` e `y=`, sem precisar extrair cada coluna à mão. O que o matplotlib ainda faz manualmente, o seaborn resolve numa função só, e como o resultado é um gráfico matplotlib normal por baixo, dá pra ajustar qualquer detalhe depois com `plt`. Esta trilha dedica um módulo inteiro a ele, logo depois do matplotlib."
                    },
                    {
                        "type": "text",
                        "value": "## plotly: quando o gráfico precisa ser interativo\n\nO terceiro nome é o plotly. A diferença central é que o gráfico do plotly roda no navegador e é interativo: dá pra passar o mouse em cima de um ponto e ver o valor exato, dar zoom numa parte do gráfico, ligar e desligar categorias clicando na legenda. É a ferramenta certa pra um dashboard ou uma página web, onde alguém vai manipular o gráfico depois de pronto. Esta trilha não entra no código do plotly (o foco é matplotlib e seaborn, a dupla mais usada em análise e notebook), mas vale conhecer o nome: é a opção quando um gráfico estático, uma imagem parada, já não é suficiente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Biblioteca\",\"Ponto forte\",\"Quando usar\"],[\"matplotlib\",\"Controle total, é a base de tudo\",\"Qualquer gráfico, com ajuste fino\"],[\"seaborn\",\"Estatística e bonito por padrão, integra com pandas\",\"Explorar dados tabulares rápido\"],[\"plotly\",\"Interativo, roda no navegador\",\"Dashboards e páginas web\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\ngorjetas = pd.DataFrame({\n    \"conta\": [10, 20, 30, 15, 25, 40, 12, 22],\n    \"gorjeta\": [1.5, 3.0, 4.5, 2.0, 3.8, 6.0, 1.8, 3.2],\n})\n\n# o mesmo gráfico de dispersão, primeiro em matplotlib puro\nplt.scatter(gorjetas[\"conta\"], gorjetas[\"gorjeta\"])\nplt.xlabel(\"Valor da conta\")\nplt.ylabel(\"Gorjeta\")\nplt.title(\"Gorjeta x valor da conta (matplotlib)\")\nplt.show()\n\n# depois em seaborn, direto a partir do DataFrame\nsns.scatterplot(data=gorjetas, x=\"conta\", y=\"gorjeta\")\nplt.title(\"Gorjeta x valor da conta (seaborn)\")\nplt.show()"
                    },
                    {
                        "type": "quote",
                        "value": "matplotlib dá o controle, seaborn dá velocidade pra estatística, plotly dá interação. Esta trilha começa pela base e sobe: matplotlib primeiro, seaborn depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Sobre qual biblioteca o seaborn é construído por baixo dos panos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "matplotlib",
                                "isCorrect": true
                            },
                            {
                                "text": "plotly",
                                "isCorrect": false
                            },
                            {
                                "text": "scikit-learn",
                                "isCorrect": false
                            },
                            {
                                "text": "pandas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das três bibliotecas é a mais indicada quando o gráfico final precisa de zoom e tooltip interativos no navegador?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "plotly",
                                "isCorrect": true
                            },
                            {
                                "text": "matplotlib",
                                "isCorrect": false
                            },
                            {
                                "text": "seaborn",
                                "isCorrect": false
                            },
                            {
                                "text": "pandas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual vantagem prática o seaborn oferece ao trabalhar direto com um DataFrame do pandas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aceita data=df e os nomes das colunas em x= e y=, sem extrair cada coluna à mão",
                                "isCorrect": true
                            },
                            {
                                "text": "Converte automaticamente qualquer DataFrame num arquivo CSV antes de plotar",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensa por completo a necessidade de o pandas estar instalado no projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que o matplotlib seja usado no mesmo script onde o seaborn aparece",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que dizer que o seaborn 'é construído em cima do matplotlib' é uma descrição precisa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque por baixo dos panos o seaborn monta um gráfico matplotlib comum",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o seaborn substitui completamente o matplotlib, que fica obsoleto",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque instalar o seaborn desinstala automaticamente o matplotlib do ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o matplotlib só funciona depois que algum gráfico seaborn é criado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dupla de cientistas de dados quer publicar num notebook estático (uma imagem por gráfico, sem interação) a correlação entre várias colunas numéricas de um DataFrame. Qual dupla de ferramentas atende melhor esse cenário, considerando o foco desta trilha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "matplotlib e seaborn, com um heatmap de correlação e ajuste fino quando precisar",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente plotly, porque interação no navegador é obrigatória em qualquer relatório",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente NumPy, porque a criação de gráficos depende só de arrays numéricos",
                                "isCorrect": false
                            },
                            {
                                "text": "matplotlib e plotly, ignorando o seaborn por não integrar com o pandas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - matplotlib: a base",
        "aulas": [
            {
                "titulo": "Primeiro gráfico com pyplot",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# matplotlib: a base\n\nAté aqui você usou pandas para carregar, limpar e agrupar dados, e viu na trilha de estatística como resumir uma distribuição em números (média, mediana, desvio padrão). Só que número resumido esconde coisa: foi exatamente isso que o quarteto de Anscombe mostrou no módulo anterior. Agora é a hora de **ver** os dados.\n\nO **matplotlib** é a biblioteca de visualização mais antiga e mais usada do ecossistema Python. Existe desde 2003, foi inspirada no MATLAB (daí o nome) e é a base sobre a qual quase tudo o resto é construído: o método `.plot()` do pandas usa matplotlib por baixo, e o seaborn, que você vai conhecer no módulo 4, também. Entender matplotlib bem primeiro facilita muito entender as outras duas depois.\n\nSe ainda não tiver instalado no seu ambiente, o comando é `pip install matplotlib`. A convenção de import usada em praticamente todo código Python que plota alguma coisa é `import matplotlib.pyplot as plt`."
                    },
                    {
                        "type": "text",
                        "value": "## A interface pyplot\n\nO módulo `pyplot` (por isso o apelido `plt`) oferece uma interface rápida e imperativa: você vai chamando funções, uma depois da outra, e cada uma modifica o gráfico \"atual\". É parecido com dar instruções verbais: desenha essa linha, agora bota um título, agora mostra. Por trás dos panos o pyplot vai guardando qual é a figura e qual é a área de plotagem ativas no momento, então você não precisa nomear nada explicitamente pra começar.\n\nEssa simplicidade é ótima pra explorar dados rápido, quando você está no meio de uma análise e só quer dar uma espiada visual. Mais adiante, na aula 2, você vai conhecer a interface orientada a objetos, mais explícita e mais indicada pra gráficos com vários painéis ou pra código que vai virar função reutilizável."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# uma lista de valores: o eixo x fica implicito (0, 1, 2, 3, 4)\nplt.plot([1, 4, 9, 16, 25])\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O que apareceu na tela\n\nRode o código acima (em um script `.py`, em um notebook Jupyter ou no console interativo) e vai aparecer uma janela, ou uma saída inline no caso do Jupyter, com uma linha azul subindo da esquerda pra direita, ligando cinco pontos. Como você passou só uma lista de valores, o matplotlib assumiu que o eixo x é o índice de cada valor (0, 1, 2, 3, 4) e o eixo y é o valor em si (1, 4, 9, 16, 25). Sem título, sem rótulo nos eixos, linha azul por padrão: é o gráfico mais cru que dá pra fazer, e é exatamente o ponto de partida.\n\nA função `plt.show()` é o que efetivamente abre a janela (ou renderiza a saída) com o gráfico. Sem ela, num script comum, o gráfico é montado na memória mas nunca aparece na tela. (No Jupyter, com a configuração padrão, às vezes o gráfico aparece mesmo sem `show()`, mas é boa prática chamar sempre, porque nem todo ambiente tem esse comportamento automático.)\n\nVale lembrar: esta plataforma não desenha o gráfico pra você. Todo código de plotagem aqui precisa ser rodado no seu ambiente (Jupyter, VS Code, terminal) pra você ver o resultado de fato. O texto sempre descreve o que vai aparecer."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nhoras_estudadas = [1, 2, 3, 4, 5]\nnota_prova = [50, 58, 70, 75, 90]\n\n# agora x e y sao explicitos: um valor de y pra cada x\nplt.plot(horas_estudadas, nota_prova)\nplt.show()"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Biblioteca\", \"Camada\", \"Quando usar direto\"], [\"matplotlib\", \"Base do ecossistema\", \"Quando você precisa de controle fino sobre o gráfico\"], [\"pandas (.plot())\", \"Atalho em cima do matplotlib\", \"Pra uma olhada rápida direto do DataFrame, sem sair do fluxo\"], [\"seaborn\", \"Estatística, em cima do matplotlib\", \"Pra gráficos estatísticos prontos, com menos código (módulo 4)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "matplotlib é a base de quase tudo que você vai plotar em Python: entender Figure, Axes e a interface pyplot agora poupa confusão depois, quando pandas e seaborn entrarem em cena."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a convenção universal de import usada para trabalhar com o módulo pyplot do matplotlib?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`import matplotlib.pyplot as plt`",
                                "isCorrect": true
                            },
                            {
                                "text": "`import matplotlib as plt`",
                                "isCorrect": false
                            },
                            {
                                "text": "`from matplotlib import pyplot`",
                                "isCorrect": false
                            },
                            {
                                "text": "`import pyplot as plt`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de montar um gráfico com `plt.plot(...)` em um script `.py` comum, qual função faz a janela do gráfico aparecer na tela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`plt.show()`",
                                "isCorrect": true
                            },
                            {
                                "text": "`plt.display()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.render()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.open()`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar `plt.plot([10, 20, 15, 30])`, sem passar valores de x, o que o matplotlib usa como eixo x?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O índice de cada valor da lista (0, 1, 2, 3)",
                                "isCorrect": true
                            },
                            {
                                "text": "Os próprios valores da lista, repetidos nos dois eixos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma sequência de datas, a partir do dia da execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor fixo, igual a zero, pra todos os pontos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O método `.plot()` de um DataFrame do pandas e os gráficos do seaborn têm o que em comum, em termos de implementação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os dois são construídos por cima do matplotlib",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois têm um motor de desenho próprio, sem relação com matplotlib",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois geram só gráficos interativos, nunca uma imagem estática",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois substituíram de vez o matplotlib nas versões recentes do pandas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você escreve um script grafico.py com plt.plot(x, y), mas esquece de chamar plt.show() antes do script terminar. O que acontece ao rodar python grafico.py no terminal?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O script termina e nenhuma janela de gráfico chega a aparecer",
                                "isCorrect": true
                            },
                            {
                                "text": "O script lança um erro de sintaxe e não chega a rodar o plot",
                                "isCorrect": false
                            },
                            {
                                "text": "O gráfico é salvo automaticamente como PNG na pasta atual",
                                "isCorrect": false
                            },
                            {
                                "text": "O terminal imprime os valores de x e y em formato de texto",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Figure e Axes (a anatomia)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Figure e Axes: a anatomia de um gráfico\n\nTodo gráfico do matplotlib tem duas camadas, e os nomes técnicos delas aparecem o tempo todo, então vale aprender agora:\n\n- **Figure**: é a tela inteira, a \"folha de papel\" onde tudo é desenhado. Uma Figure pode conter um ou vários gráficos dentro dela.\n- **Axes**: é a área de plotagem em si, com seus eixos x e y, seu título, suas linhas e pontos. Um objeto do tipo Axes é *um* gráfico dentro da Figure.\n\nRepare que **Axes** (com \"e\" no final) não é o mesmo que **axis** (eixo, x ou y). É confuso no começo porque em português os dois viram \"eixo\", mas no código do matplotlib \"Axes\" é sempre a área do gráfico completa, não uma linha isolada.\n\nQuando você chama `plt.plot(...)` direto, como fez na aula 1, o pyplot cria uma Figure e um Axes escondidos por trás, sem te mostrar isso. É conveniente, mas a partir de agora vale entender o que está por trás, porque em gráficos mais elaborados, como os subplots da aula 5, você vai precisar nomear a Figure e os Axes você mesmo."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# cria a Figure (fig) e um Axes (ax) dentro dela, ja prontos pra usar\nfig, ax = plt.subplots()\n\n# agora chamamos .plot() diretamente no Axes, nao no pyplot\nax.plot([1, 2, 3, 4], [10, 20, 25, 30])\n\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "### O que muda no gráfico, e como diferenciar séries\n\nVisualmente, o resultado é idêntico ao que você já viu na aula 1: uma linha azul ligando quatro pontos, sem título nem rótulos ainda. A diferença não está no desenho, está em como você chegou até ele: agora `fig` guarda a referência da tela inteira e `ax` guarda a referência da área de plotagem, e você pode usar essas duas variáveis pra ajustar qualquer detalhe do gráfico depois, de forma explícita.\n\n### pyplot direto x interface orientada a objetos\n\nExistem duas formas de escrever matplotlib, e as duas convivem no dia a dia:\n\n- **Interface pyplot (rápida)**: `plt.plot(...)`, `plt.title(...)`, `plt.show()`. O pyplot sempre trabalha na Figure e no Axes atuais, sem você precisar nomeá-los. Ótima pra uma exploração rápida no meio de uma análise.\n- **Interface orientada a objetos (explícita)**: você cria `fig, ax = plt.subplots()` e depois chama métodos direto no `ax`, como `ax.plot(...)` e `ax.set_title(...)`. É mais verbosa, mas deixa claro qual gráfico está sendo modificado, o que importa muito quando há mais de um Axes na mesma Figure.\n\nNão existe uma forma \"errada\": pra um gráfico único e rápido, `plt.` resolve. Pra qualquer coisa com mais de um painel, ou pra código que você vai reaproveitar (uma função que sempre desenha o mesmo tipo de gráfico, por exemplo), a orientada a objetos evita ambiguidade sobre qual Axes está sendo afetado."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\ndias = [1, 2, 3, 4, 5]\ntemperatura = [22, 24, 23, 27, 26]\n\n# forma rapida: plt. trabalha no Axes atual, de forma implicita\nplt.plot(dias, temperatura)\nplt.title(\"Temperatura ao longo da semana\")\nplt.show()\n\n# forma orientada a objetos: o mesmo resultado, de forma explicita\nfig, ax = plt.subplots()\nax.plot(dias, temperatura)\nax.set_title(\"Temperatura ao longo da semana\")\nplt.show()"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Interface pyplot\", \"Interface orientada a objetos\", \"O que faz\"], [\"plt.title(\\\"...\\\")\", \"ax.set_title(\\\"...\\\")\", \"Define o título do gráfico\"], [\"plt.xlabel(\\\"...\\\")\", \"ax.set_xlabel(\\\"...\\\")\", \"Define o rótulo do eixo x\"], [\"plt.ylabel(\\\"...\\\")\", \"ax.set_ylabel(\\\"...\\\")\", \"Define o rótulo do eixo y\"], [\"plt.xlim(min, max)\", \"ax.set_xlim(min, max)\", \"Define os limites do eixo x\"], [\"plt.plot(...)\", \"ax.plot(...)\", \"Desenha uma linha no gráfico\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Figure é a tela inteira, Axes é o gráfico dentro dela: quando tiver mais de um painel na mesma figura, é o Axes que diz qual deles você está mexendo."
                    }
                ],
                "questions": [
                    {
                        "statement": "No matplotlib, qual das opções descreve corretamente a diferença entre Figure e Axes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Figure é a tela inteira, Axes é a área de plotagem dentro dela",
                                "isCorrect": true
                            },
                            {
                                "text": "Figure é a área de plotagem, Axes é a tela inteira que a contém",
                                "isCorrect": false
                            },
                            {
                                "text": "Figure e Axes são dois nomes pro mesmo objeto, sem diferença prática",
                                "isCorrect": false
                            },
                            {
                                "text": "Figure guarda os dados carregados, Axes guarda só as cores usadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando cria, de uma vez, uma Figure e um Axes prontos pra usar na interface orientada a objetos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`fig, ax = plt.subplots()`",
                                "isCorrect": true
                            },
                            {
                                "text": "`fig = plt.new_figure()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ax = plt.create_axes()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`fig, ax = plt.canvas()`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está escrevendo uma função que sempre recebe um DataFrame e desenha um gráfico de linha, pra reaproveitar em vários pontos do notebook. Qual interface evita ambiguidade sobre qual Axes está sendo modificado dentro da função?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A interface orientada a objetos, com `fig, ax`",
                                "isCorrect": true
                            },
                            {
                                "text": "A interface pyplot rápida, chamando só `plt.plot()`",
                                "isCorrect": false
                            },
                            {
                                "text": "Tanto faz, as duas interfaces são idênticas nesse cenário",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas interfaces funciona dentro de uma função",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao trabalhar com `fig, ax = plt.subplots()`, qual comando define o título do gráfico de forma equivalente a `plt.title(\"Vendas\")`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`ax.set_title(\"Vendas\")`",
                                "isCorrect": true
                            },
                            {
                                "text": "`ax.title(\"Vendas\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`fig.set_title(\"Vendas\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ax.add_title(\"Vendas\")`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar `fig, ax = plt.subplots()` e chamar `ax.plot(x, y)`, você chama `plt.title(\"Resultado\")`, na interface pyplot, sem usar `ax`. O que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O título é aplicado ao `ax`, que virou o Axes atual",
                                "isCorrect": true
                            },
                            {
                                "text": "O comando falha, pois não há Axes ativo no momento",
                                "isCorrect": false
                            },
                            {
                                "text": "Um novo Axes vazio é criado só para o título",
                                "isCorrect": false
                            },
                            {
                                "text": "O título fica solto, sem se associar a nenhum Axes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os tipos básicos (plot, scatter, bar, hist)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Os quatro tipos básicos\n\nO matplotlib tem dezenas de tipos de gráfico, mas quatro deles resolvem a grande maioria das situações do dia a dia, e cada um responde a uma pergunta diferente (lembra do módulo 1: distribuição, comparação, relação, evolução?):\n\n- `plt.plot()`: linha. Ótimo pra **evolução**, quando o x tem uma ordem natural, tempo, por exemplo.\n- `plt.scatter()`: dispersão. Ótimo pra **relação** entre duas variáveis numéricas, a mesma ideia de correlação que você viu na trilha de estatística.\n- `plt.bar()`: barras. Ótimo pra **comparação** entre categorias (linguagens de programação, produtos, regiões).\n- `plt.hist()`: histograma. Ótimo pra **distribuição** de uma única variável numérica, também ligado direto à estatística: é o histograma que revela se os dados são simétricos, enviesados, se têm outliers.\n\nO módulo 3 vai aprofundar quando escolher cada um. Por agora, o objetivo é conhecer a sintaxe básica das quatro funções."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# --- plt.plot: linha, boa pra evolucao no tempo ---\ndias = [1, 2, 3, 4, 5, 6, 7]\nvendas = [120, 135, 128, 140, 160, 155, 170]\n\nplt.plot(dias, vendas)\nplt.show()\n\n# --- plt.scatter: dispersao, boa pra relacao entre duas variaveis ---\nhoras_estudadas = [1, 2, 3, 4, 5, 6, 7, 8]\nnota_prova = [50, 55, 63, 60, 75, 78, 85, 92]\n\nplt.scatter(horas_estudadas, nota_prova)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "### O que aparece em cada um\n\nO `plt.plot()` desenha uma linha contínua ligando os pontos **na ordem em que aparecem** nos dados: no exemplo, sete pontos conectados mostrando as vendas subindo e descendo ao longo dos dias da semana. A linha só faz sentido porque o eixo x (dia) tem uma ordem natural, um antes do outro.\n\nO `plt.scatter()` desenha só os pontos, **sem ligar nada**: uma nuvem de marcadores, um pra cada par (horas estudadas, nota). Nesse exemplo a nuvem sobe da esquerda pra direita, sugerindo uma relação positiva entre estudar mais e tirar nota melhor, o mesmo tipo de padrão que um coeficiente de correlação alto resume em um único número. Diferente da linha, aqui ligar os pontos não faria sentido: não existe uma ordem natural entre os alunos."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# --- plt.bar: barras, boas pra comparar categorias ---\nlinguagens = [\"Python\", \"JavaScript\", \"SQL\", \"Java\"]\nuso_percentual = [48, 27, 15, 10]\n\nplt.bar(linguagens, uso_percentual)\nplt.show()\n\n# --- plt.hist: histograma, bom pra ver a distribuicao de uma variavel ---\nnotas_turma = [55, 60, 62, 65, 68, 70, 70, 72, 75, 75,\n               78, 80, 80, 82, 85, 88, 90, 92, 95, 98]\n\nplt.hist(notas_turma, bins=8)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "### O que aparece em cada um\n\nO `plt.bar()` desenha uma barra vertical por categoria, com a altura proporcional ao valor: quatro barras separadas, com espaço entre elas, uma pra cada linguagem, deixando bem claro que Python está na frente. Categorias são unidades distintas, então faz sentido ter espaço entre as barras.\n\nO `plt.hist()` é diferente por dentro, mesmo se parecendo com barras: primeiro ele divide o intervalo de valores em faixas (os `bins`, aqui pedimos 8) e depois desenha uma barra pra cada faixa, com a altura igual à quantidade de valores que caíram ali. Como as faixas são pedaços contínuos de uma mesma escala numérica, as barras do histograma ficam **coladas** uma na outra, sem espaço, justamente pra mostrar que é tudo a mesma variável dividida em pedaços. É essa forma (mais alta no meio, mais baixa nas pontas, ou enviesada pra um lado) que revela se a distribuição das notas se parece com uma normal ou não, algo que você já explorou em número na trilha de estatística."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\", \"Tipo de gráfico\", \"Pergunta que responde\"], [\"plt.plot(x, y)\", \"Linha\", \"Como um valor evolui, geralmente ao longo do tempo?\"], [\"plt.scatter(x, y)\", \"Dispersão\", \"Como duas variáveis numéricas se relacionam?\"], [\"plt.bar(categorias, valores)\", \"Barras\", \"Como as categorias se comparam entre si?\"], [\"plt.hist(valores, bins=n)\", \"Histograma\", \"Qual é a distribuição de uma variável numérica?\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Linha liga pontos em ordem, dispersão mostra a nuvem sem ligar nada, barra compara categorias, histograma divide uma variável contínua em faixas: a forma do gráfico já entrega metade da pergunta que ele responde."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função do matplotlib é a mais indicada pra mostrar como um valor evolui ao longo do tempo, como o total de vendas dia a dia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`plt.plot()`",
                                "isCorrect": true
                            },
                            {
                                "text": "`plt.scatter()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.bar()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.pie()`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual função é a mais indicada pra visualizar a distribuição de uma variável numérica, como as notas de uma turma inteira?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`plt.hist()`",
                                "isCorrect": true
                            },
                            {
                                "text": "`plt.scatter()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.bar()`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.plot()`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem duas listas, horas_estudadas e nota_prova, uma pra cada aluno, e quer ver se existe alguma relação entre elas. Qual gráfico é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um `plt.scatter()`, com um ponto por aluno",
                                "isCorrect": true
                            },
                            {
                                "text": "Um `plt.plot()`, ligando os alunos em uma linha",
                                "isCorrect": false
                            },
                            {
                                "text": "Um `plt.bar()`, com uma barra por aluno",
                                "isCorrect": false
                            },
                            {
                                "text": "Um `plt.hist()` das horas, ignorando a nota",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As barras de um plt.bar() de categorias e as barras de um plt.hist() de uma variável contínua parecem parecidas, mas há uma diferença visual típica entre elas. Qual é?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No histograma, as barras ficam coladas: a variável é contínua",
                                "isCorrect": true
                            },
                            {
                                "text": "No histograma, as barras são sempre vermelhas por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "No `plt.bar()`, as barras são sempre desenhadas na horizontal",
                                "isCorrect": false
                            },
                            {
                                "text": "No histograma, cada barra representa um único valor exato",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se você rodar plt.hist(notas_turma, bins=8) e, depois, plt.hist(notas_turma, bins=40) nos mesmos dados, o que muda no resultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Com `bins=40`, as faixas ficam mais estreitas: mais barras",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada muda: `bins` só afeta a cor das barras do histograma",
                                "isCorrect": false
                            },
                            {
                                "text": "Com `bins=40`, o matplotlib ignora o valor e usa 10 faixas",
                                "isCorrect": false
                            },
                            {
                                "text": "Com `bins=40`, valores fora do intervalo ficam sem faixa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Títulos, rótulos, legenda e estilo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Deixando o gráfico legível\n\nTodos os gráficos que você fez até aqui funcionam, mas nenhum diz pro leitor o que está vendo: falta título, falta saber o que cada eixo representa, falta saber o que cada linha significa quando há mais de uma. Um gráfico sem esse contexto obriga quem olha a adivinhar, e adivinhação não é análise de dados.\n\nAs funções que resolvem isso são simples e você vai usar em praticamente todo gráfico daqui pra frente:\n\n- `plt.title(\"...\")`: título do gráfico.\n- `plt.xlabel(\"...\")` e `plt.ylabel(\"...\")`: rótulo de cada eixo (sempre diga a unidade, se fizer sentido: \"Vendas (R$ mil)\", não só \"Vendas\").\n- `plt.legend()`: mostra a legenda, associando cada linha ou série ao seu `label`.\n- `plt.grid()`: adiciona uma grade de fundo, que ajuda a ler valores aproximados.\n\nNa interface orientada a objetos da aula 2, o equivalente de cada uma tem o prefixo `set_`: `ax.set_title()`, `ax.set_xlabel()`, e assim por diante."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\ndias = [1, 2, 3, 4, 5, 6, 7]\nvendas = [120, 135, 128, 140, 160, 155, 170]\n\nplt.plot(dias, vendas)\nplt.title(\"Vendas na semana\")\nplt.xlabel(\"Dia da semana\")\nplt.ylabel(\"Vendas (R$ mil)\")\nplt.grid(True)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "### O que muda no gráfico, e como diferenciar séries\n\nA mesma linha de antes aparece agora com um título centralizado acima da área de plotagem (\"Vendas na semana\"), um rótulo abaixo do eixo x (\"Dia da semana\") e um rótulo na vertical ao lado do eixo y (\"Vendas (R$ mil)\"). Atrás da linha, uma grade de linhas horizontais e verticais (ativada por `plt.grid(True)`) ajuda o olho a estimar valores sem precisar apontar exatamente pro ponto.\n\nIsso resolve um gráfico com uma linha só. Quando há mais de uma série no mesmo gráfico, cor e estilo deixam de ser só estética: viram a forma de diferenciar uma série da outra. O `plt.plot()` aceita parâmetros pra isso:\n\n- `color`: a cor da linha (nome como `\"red\"`, código de uma letra como `\"r\"`, ou hexadecimal como `\"#1f77b4\"`).\n- `marker`: um símbolo em cada ponto de dado (círculo, quadrado, triângulo), útil quando os valores exatos importam, não só a tendência geral.\n- `linestyle`: o traço da linha (contínua, tracejada, pontilhada).\n- `label`: o nome dessa série, que só aparece de fato na figura depois de chamar `plt.legend()`."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\ndias = [1, 2, 3, 4, 5, 6, 7]\nvendas_loja_a = [120, 135, 128, 140, 160, 155, 170]\nvendas_loja_b = [100, 110, 115, 108, 130, 140, 138]\n\nplt.plot(dias, vendas_loja_a, color=\"blue\", marker=\"o\", linestyle=\"-\", label=\"Loja A\")\nplt.plot(dias, vendas_loja_b, color=\"orange\", marker=\"s\", linestyle=\"--\", label=\"Loja B\")\n\nplt.title(\"Vendas por loja na semana\")\nplt.xlabel(\"Dia da semana\")\nplt.ylabel(\"Vendas (R$ mil)\")\nplt.legend()\nplt.grid(True)\nplt.show()"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parâmetro\", \"Exemplos de valor\", \"O que controla\"], [\"color\", \"\\\"blue\\\", \\\"r\\\", \\\"#1f77b4\\\"\", \"A cor da linha ou dos marcadores\"], [\"marker\", \"\\\"o\\\", \\\"s\\\", \\\"^\\\", \\\"x\\\"\", \"O símbolo desenhado em cada ponto\"], [\"linestyle\", \"\\\"-\\\", \\\"--\\\", \\\":\\\", \\\"-.\\\"\", \"O traço da linha (contínua, tracejada, pontilhada, mista)\"], [\"label\", \"\\\"Loja A\\\"\", \"O nome da série, usado por plt.legend()\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Título, rótulos, legenda e grade não são enfeite: são o que transforma um desenho em informação que a outra pessoa entende sem te perguntar nada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função adiciona o título de um gráfico na interface pyplot?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`plt.title(\"...\")`",
                                "isCorrect": true
                            },
                            {
                                "text": "`plt.name(\"...\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.header(\"...\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.label(\"...\")`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que a legenda de um gráfico apareça de fato na figura, o que precisa acontecer, além de passar label= em cada plt.plot()?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Chamar `plt.legend()` depois de desenhar as séries",
                                "isCorrect": true
                            },
                            {
                                "text": "Chamar `plt.title()` com o mesmo texto do label",
                                "isCorrect": false
                            },
                            {
                                "text": "Passar `legend=True` dentro de `plt.plot()`",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada além disso: o `label` já basta sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem duas linhas no mesmo gráfico e quer que quem olhar saiba, sem adivinhar, qual linha é qual. Quais dois elementos resolvem isso juntos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`label` em cada `plt.plot()` e `plt.legend()` no final",
                                "isCorrect": true
                            },
                            {
                                "text": "`color` em cada `plt.plot()` e `plt.grid()` no final",
                                "isCorrect": false
                            },
                            {
                                "text": "`title` do gráfico e `xlabel` do eixo x",
                                "isCorrect": false
                            },
                            {
                                "text": "`marker` em cada `plt.plot()` e `plt.title()` no final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a função do plt.grid(True) num gráfico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Desenhar linhas de fundo, pra estimar valores",
                                "isCorrect": true
                            },
                            {
                                "text": "Mostrar o nome de cada série desenhada no gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Desenhar uma borda mais grossa ao redor do gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajustar automaticamente a escala dos dois eixos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em plt.plot(x, y, \"go-\"), o que essa string curta configura, tudo de uma vez?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cor verde, marcador circular e linha contínua",
                                "isCorrect": true
                            },
                            {
                                "text": "Cor cinza, marcador quadrado e linha tracejada",
                                "isCorrect": false
                            },
                            {
                                "text": "Cor verde, marcador triangular e linha pontilhada",
                                "isCorrect": false
                            },
                            {
                                "text": "Cor dourada, sem marcador e linha contínua",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Subplots e salvar a figura",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Vários gráficos numa figura só\n\nÀs vezes uma pergunta não cabe num gráfico só: você quer comparar a distribuição de uma variável ao lado da comparação entre categorias, por exemplo, sem abrir duas janelas separadas. É pra isso que serve `plt.subplots(nrows, ncols)`: em vez de criar um único Axes, ele cria uma **grade** de Axes dentro da mesma Figure.\n\nPor exemplo, `fig, ax = plt.subplots(1, 2)` cria uma Figure com 1 linha e 2 colunas de Axes, ou seja, dois gráficos lado a lado. A diferença importante em relação à aula 2 é que agora `ax` não é mais um único objeto: é um array, e você acessa cada painel pelo índice, por exemplo `ax[0]` pro primeiro e `ax[1]` pro segundo."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nnotas_turma = [55, 60, 62, 65, 68, 70, 70, 72, 75, 75,\n               78, 80, 80, 82, 85, 88, 90, 92, 95, 98]\nlinguagens = [\"Python\", \"JavaScript\", \"SQL\", \"Java\"]\nuso_percentual = [48, 27, 15, 10]\n\n# 1 linha, 2 colunas: dois Axes lado a lado na mesma Figure\nfig, ax = plt.subplots(1, 2, figsize=(10, 4))\n\nax[0].hist(notas_turma, bins=8)\nax[0].set_title(\"Distribuição das notas\")\n\nax[1].bar(linguagens, uso_percentual)\nax[1].set_title(\"Uso por linguagem\")\n\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "### O que aparece, e a grade 2D\n\nUma única janela (uma Figure só) mostra dois painéis lado a lado: à esquerda o histograma das notas, com sua forma de distribuição; à direita as barras de uso por linguagem, com Python na frente. Cada painel tem o próprio título, porque cada `ax[i]` é um Axes independente, só que compartilhando a mesma Figure. O `figsize=(10, 4)` define o tamanho da Figure inteira em polegadas (largura, altura), e o `plt.tight_layout()` ajusta os espaçamentos automaticamente pra títulos e rótulos não ficarem cortados ou sobrepostos, algo bem comum quando há vários painéis.\n\nSe a grade tivesse 2 linhas e 2 colunas (`plt.subplots(2, 2)`), `ax` viraria uma grade bidimensional, e a indexação ganharia uma segunda posição: `ax[0, 0]` é o painel superior esquerdo, `ax[0, 1]` o superior direito, `ax[1, 0]` o inferior esquerdo, e `ax[1, 1]` o inferior direito."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\ndias = [1, 2, 3, 4, 5, 6, 7]\nvendas = [120, 135, 128, 140, 160, 155, 170]\n\nfig, ax = plt.subplots()\nax.plot(dias, vendas)\nax.set_title(\"Vendas na semana\")\nax.set_xlabel(\"Dia\")\nax.set_ylabel(\"Vendas (R$ mil)\")\n\n# salva em arquivo: o formato e definido pela extensao do nome\nfig.savefig(\"vendas_semana.png\", dpi=300, bbox_inches=\"tight\")\n\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "### Salvando a figura em arquivo\n\n`savefig()` grava a Figure inteira num arquivo, em vez de (ou além de) mostrar na tela. O matplotlib decide o formato pela extensão do nome: `.png` gera uma imagem rasterizada (a mais comum pra colar num relatório ou apresentação), `.pdf` e `.svg` geram formatos vetoriais, que não perdem qualidade em qualquer zoom. O parâmetro `dpi` controla a resolução da imagem (300 é um valor comum pra qualidade de impressão), e `bbox_inches=\"tight\"` corta o excesso de espaço em branco ao redor do gráfico.\n\nUm detalhe que costuma pegar iniciante: `fig.savefig(...)` deve vir **antes** de `plt.show()`. Em alguns ambientes, depois que a janela do `show()` é fechada, o matplotlib libera a Figure da memória, e um `savefig()` chamado depois pode gerar um arquivo vazio ou lançar erro. Salvar primeiro e mostrar depois é a ordem segura."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parâmetro\", \"Exemplo\", \"Efeito\"], [\"fname (o nome do arquivo)\", \"\\\"grafico.png\\\"\", \"Define o arquivo e, pela extensão, o formato (png, pdf, svg...)\"], [\"dpi\", \"300\", \"Resolução da imagem: mais alto, mais nítido e mais pesado\"], [\"bbox_inches\", \"\\\"tight\\\"\", \"Corta o espaço em branco sobrando ao redor do gráfico\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "matplotlib é a base: Figure e Axes, os quatro gráficos básicos, título e legenda pra clareza, subplots pra comparar vários de uma vez, savefig pra levar o resultado pra fora do notebook. No próximo módulo, cada um desses gráficos ganha profundidade: quando usar, como ler, e por que a pizza quase sempre atrapalha."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que plt.subplots(1, 2) cria?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma Figure com 1 linha e 2 colunas de Axes",
                                "isCorrect": true
                            },
                            {
                                "text": "Duas Figures separadas, cada uma com seu gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único Axes com dois conjuntos de dados sobrepostos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma Figure com 2 linhas e 1 coluna de Axes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual função salva a figura atual em um arquivo, como PNG ou PDF?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`plt.savefig(\"arquivo.png\")`",
                                "isCorrect": true
                            },
                            {
                                "text": "`plt.save(\"arquivo.png\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.export(\"arquivo.png\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`plt.write(\"arquivo.png\")`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar fig, ax = plt.subplots(2, 2), como você acessa o Axes do canto superior direito da grade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`ax[0, 1]`",
                                "isCorrect": true
                            },
                            {
                                "text": "`ax[1, 0]`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ax[2]`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ax[0][2]`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que costuma ser recomendado chamar plt.tight_layout() quando a figura tem vários subplots?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque evita títulos e rótulos vizinhos se sobreporem",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque aumenta automaticamente a resolução da imagem final",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque converte os subplots em um único Axes só",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque adiciona uma legenda geral pra toda a figura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você escreve, nessa ordem, plt.show() e depois fig.savefig(\"grafico.png\"). Qual é o risco prático dessa ordem, em alguns ambientes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A Figure pode não estar mais disponível pro `savefig()`",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo salvo vem sempre com metade do gráfico cortada",
                                "isCorrect": false
                            },
                            {
                                "text": "O matplotlib troca automaticamente o nome do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O `savefig()` chamado depois do `show()` gera erro de sintaxe",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Os gráficos essenciais na prática",
        "aulas": [
            {
                "titulo": "Histograma: a distribuição de uma variável",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 3: Os gráficos essenciais na prática\n\n## Histograma: a forma de uma distribuição\n\nVocê já calculou média, mediana e desvio padrão de uma variável na trilha de Estatística. Esses números resumem os dados, mas escondem o formato: duas variáveis podem ter a mesma média e se espalhar de jeitos completamente diferentes. O histograma mostra esse formato. Ele pega uma variável numérica, divide o intervalo de valores em faixas (os **bins**) e desenha uma barra pra cada faixa, com altura igual à quantidade de observações que caem ali dentro. A função `plt.hist()` do matplotlib faz exatamente isso.\n\nUse histograma quando a pergunta for **\"como essa variável numérica se distribui?\"**: onde os valores se concentram, se existe um valor típico, se há valores raros nas pontas. É o gráfico de distribuição por excelência, a mesma pergunta que a trilha de Estatística respondia com números (média, mediana, desvio padrão) e que aqui ganha uma forma visual."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(42)\nnotas = np.random.normal(loc=7.0, scale=1.5, size=300)\nnotas = np.clip(notas, 0, 10)  # nota final fica entre 0 e 10\n\nplt.figure(figsize=(8, 5))\nplt.hist(notas, bins=15, color=\"steelblue\", edgecolor=\"white\")\nplt.title(\"Distribuição das notas finais na trilha de Python\")\nplt.xlabel(\"Nota final\")\nplt.ylabel(\"Número de alunos\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Como ler um histograma\n\nO eixo x mostra os valores da variável (aqui, a nota final, de 0 a 10) dividido nos bins. O eixo y mostra quantos alunos caem em cada faixa. No exemplo acima, as barras mais altas ficam perto de 7, o valor em torno do qual os dados foram gerados, e vão diminuindo pras pontas: é o formato de sino de uma distribuição aproximadamente **simétrica**, a mesma normal que você viu na trilha de Estatística.\n\nTrês coisas pra observar em qualquer histograma:\n\n- **Formato**: simétrico (parecido dos dois lados) ou assimétrico (puxado pra um lado)?\n- **Picos**: um único pico (unimodal) ou mais de um pico separado (bimodal), o que costuma indicar dois grupos misturados na mesma variável?\n- **Cauda**: existe uma cauda longa de valores raros esticando o gráfico pra um lado?"
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(7)\n# tempo em minutos até um aluno concluir um exercício: tende a ser assimétrico\ntempo_exercicio = np.random.exponential(scale=8, size=300)\n\nfig, eixos = plt.subplots(1, 3, figsize=(14, 4))\nfor eixo, n_bins in zip(eixos, [5, 15, 50]):\n    eixo.hist(tempo_exercicio, bins=n_bins, color=\"darkorange\", edgecolor=\"white\")\n    eixo.set_title(f\"bins={n_bins}\")\n    eixo.set_xlabel(\"Minutos até concluir\")\n\neixos[0].set_ylabel(\"Número de alunos\")\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O número de bins muda a leitura, e a cauda revela a assimetria\n\nCom `bins=5`, faixas grandes escondem detalhes: o histograma vira um bloco genérico. Com `bins=50`, faixas pequenas deixam o gráfico cheio de ruído, cada barra quase representa uma única observação. Não existe um número mágico: um ponto de partida razoável fica entre 10 e 30 faixas, ajustando pra cima ou pra baixo até o formato ficar claro sem virar ruído.\n\nO exemplo do tempo de conclusão do exercício, diferente do exemplo das notas, mostra uma assimetria à direita: a maioria dos alunos termina rápido (barras altas perto do zero) e uma cauda comprida se estende até valores bem altos, os poucos alunos que demoraram bem mais que o normal. Faz sentido: dá pra terminar rápido, mas não dá pra terminar em tempo negativo, então a cauda só tem pra onde crescer de um lado.\n\nQuando quiser comparar o formato entre variáveis com escalas diferentes, o parâmetro `density=True` normaliza o histograma pra que a área total das barras some 1, a mesma ideia de área sob a curva de uma distribuição de probabilidade contínua vista na trilha de Estatística."
                    },
                    {
                        "type": "table",
                        "value": "[[\"formato do histograma\",\"o que indica\",\"exemplo típico\"],[\"simétrico, em forma de sino\",\"valores concentrados perto do centro, poucos extremos dos dois lados\",\"notas numa prova bem calibrada\"],[\"assimétrico à direita\",\"maioria dos valores baixos, poucos valores bem altos esticando a cauda\",\"tempo até concluir uma tarefa\"],[\"assimétrico à esquerda\",\"maioria dos valores altos, poucos valores bem baixos esticando a cauda\",\"nota numa prova muito fácil\"],[\"bimodal, com dois picos separados\",\"provavelmente dois grupos diferentes misturados na mesma variável\",\"altura de crianças e adultos juntos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um histograma não devolve só a média: devolve o formato inteiro da distribuição, pra que lado ela puxa e se existe mais de um grupo escondido ali dentro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual pergunta um histograma responde melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Como uma variável numérica se distribui",
                                "isCorrect": true
                            },
                            {
                                "text": "Como duas variáveis numéricas se relacionam",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um valor se compara entre categorias",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um valor evolui ao longo do tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No histograma, o que cada barra representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A quantidade de valores dentro de uma faixa",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor exato de uma única observação",
                                "isCorrect": false
                            },
                            {
                                "text": "A média de todos os valores da variável",
                                "isCorrect": false
                            },
                            {
                                "text": "A proporção de uma categoria no total geral",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um histograma do tempo de conclusão de um exercício mostra a maioria dos alunos concentrada em poucos minutos e uma cauda longa esticando até valores bem altos. Qual é esse formato?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Assimétrico à direita, com cauda nos valores altos",
                                "isCorrect": true
                            },
                            {
                                "text": "Assimétrico à esquerda, com cauda nos valores baixos",
                                "isCorrect": false
                            },
                            {
                                "text": "Simétrico, com dois picos bem definidos e separados",
                                "isCorrect": false
                            },
                            {
                                "text": "Uniforme, sem nenhuma concentração de valores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os mesmos dados geram um histograma com bins=5 e outro com bins=50. Qual é o efeito esperado de usar poucos bins (5)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Agrupa demais os valores e esconde detalhes do formato",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixa o gráfico idêntico ao de muitos bins, sem diferença",
                                "isCorrect": false
                            },
                            {
                                "text": "Transforma automaticamente o histograma num boxplot",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o eixo y passar a mostrar percentual em vez de contagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem as notas finais de 300 alunos e quer checar visualmente se a distribuição se parece com uma curva normal (sino) ou se está puxada pra um lado. Qual gráfico é mais direto pra isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Histograma das notas finais dos 300 alunos",
                                "isCorrect": true
                            },
                            {
                                "text": "Dispersão das notas finais contra o índice do aluno",
                                "isCorrect": false
                            },
                            {
                                "text": "Barras com a média de nota final por trilha",
                                "isCorrect": false
                            },
                            {
                                "text": "Linha das notas finais ao longo da matrícula",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boxplot: o resumo e os outliers",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Boxplot: os cinco números e os outliers, de um jeito visual\n\nNa trilha de Estatística você aprendeu o resumo de cinco números de uma variável: mínimo, primeiro quartil (Q1), mediana, terceiro quartil (Q3) e máximo, além do IQR (intervalo interquartil, a diferença entre Q3 e Q1) e da regra prática de outlier: um valor é considerado atípico quando fica abaixo de Q1 menos 1,5 vezes o IQR, ou acima de Q3 mais 1,5 vezes o IQR. O boxplot (ou gráfico de caixa) desenha esse resumo inteiro numa figura só, com a função `plt.boxplot()`.\n\nUse boxplot quando a pergunta for **\"qual o resumo dessa distribuição, e ela tem valores fora da curva?\"**, ou quando quiser comparar essa distribuição entre grupos diferentes lado a lado, algo que um histograma sozinho não faz tão bem."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(42)\nnotas = np.random.normal(loc=7.0, scale=1.5, size=300)\nnotas = np.clip(notas, 0, 10)\nnotas = np.append(notas, [0.5, 0.8, 10.0, 10.0])  # alguns casos bem fora do padrão\n\nplt.figure(figsize=(4, 6))\nplt.boxplot(notas)\nplt.title(\"Distribuição das notas finais\")\nplt.ylabel(\"Nota final\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Como ler um boxplot\n\nA caixa vai de Q1 até Q3, ou seja, o corpo da caixa é o próprio IQR: metade das observações está ali dentro. A linha no meio da caixa é a mediana. As duas linhas que saem da caixa (os **bigodes**) se estendem até o valor mais extremo que ainda está dentro de 1,5 vez o IQR. Qualquer ponto desenhado além dos bigodes é um **outlier** pela mesma regra que você já usava em número: aqui, ele aparece como um ponto isolado, fácil de contar e localizar.\n\nNo exemplo das notas, os valores 0,5 e 0,8 aparecem como pontos isolados abaixo do bigode inferior, e o 10,0 repetido aparece acima do bigode superior: o boxplot aponta exatamente quem são esses casos fora do padrão, sem precisar calcular o IQR na mão."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(1)\nnotas_python = np.clip(np.random.normal(7.5, 1.2, 120), 0, 10)\nnotas_estatistica = np.clip(np.random.normal(6.5, 2.0, 120), 0, 10)\nnotas_sql = np.clip(np.random.normal(8.0, 0.8, 120), 0, 10)\n\nplt.figure(figsize=(7, 5))\nplt.boxplot([notas_python, notas_estatistica, notas_sql])\nplt.xticks([1, 2, 3], [\"Python\", \"Estatística\", \"SQL\"])\nplt.title(\"Nota final por trilha\")\nplt.ylabel(\"Nota final\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Comparando distribuições entre grupos\n\nCom várias caixas lado a lado, dá pra comparar de uma vez: qual grupo tem a mediana mais alta (a linha do meio mais em cima), qual grupo é mais consistente (caixa mais baixa, dados espalhados numa faixa menor) e qual grupo tem mais outliers. No exemplo, a trilha de Estatística tende a ter a caixa mais alta, sinal de notas mais heterogêneas, enquanto SQL tende a ter a caixa mais curta, sinal de notas mais parecidas entre os alunos.\n\nEsse é o mesmo tipo de comparação que você faria agrupando um DataFrame com `groupby(\"trilha\")` e olhando a média de cada grupo, só que aqui a distribuição inteira de cada grupo aparece de uma vez, não só a média."
                    },
                    {
                        "type": "table",
                        "value": "[[\"elemento do boxplot\",\"o que representa\"],[\"borda inferior da caixa\",\"primeiro quartil (Q1): 25% dos dados abaixo dele\"],[\"linha dentro da caixa\",\"mediana: 50% dos dados abaixo dela\"],[\"borda superior da caixa\",\"terceiro quartil (Q3): 75% dos dados abaixo dele\"],[\"altura da caixa\",\"o IQR, a diferença entre Q3 e Q1\"],[\"bigodes (linhas que saem da caixa)\",\"alcance de até 1,5 vez o IQR além de Q1 e de Q3\"],[\"pontos isolados além dos bigodes\",\"outliers, pela mesma regra do 1,5 x IQR\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O boxplot resume uma distribuição inteira em cinco números e ainda aponta o dedo pros valores que não se encaixam: é o resumo de Estatística, só que desenhado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a linha dentro da caixa de um boxplot representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A mediana da distribuição",
                                "isCorrect": true
                            },
                            {
                                "text": "A média da distribuição",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor mínimo da amostra",
                                "isCorrect": false
                            },
                            {
                                "text": "O desvio padrão da amostra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quais dois valores marcam as bordas da caixa de um boxplot?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O primeiro quartil (Q1) e o terceiro quartil (Q3)",
                                "isCorrect": true
                            },
                            {
                                "text": "O valor mínimo e o valor máximo da amostra inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "A média e o desvio padrão da distribuição",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro e o último valor da tabela original",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pela regra usual de outliers do boxplot, um ponto é marcado como outlier quando fica:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Além de 1,5 vez o IQR acima de Q3 ou abaixo de Q1",
                                "isCorrect": true
                            },
                            {
                                "text": "Fora do intervalo entre a média e um desvio padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Acima do maior valor observado em qualquer grupo",
                                "isCorrect": false
                            },
                            {
                                "text": "Fora do intervalo entre o primeiro e o último quartil",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Comparando o boxplot de notas de três trilhas lado a lado, a caixa da trilha B fica bem mais alta que as outras duas, mas com a mesma altura de caixa. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Notas mais altas na trilha B, com dispersão parecida às demais",
                                "isCorrect": true
                            },
                            {
                                "text": "Muito mais outliers na trilha B do que nas outras trilhas",
                                "isCorrect": false
                            },
                            {
                                "text": "Mediana igual entre as trilhas, só o mínimo muda na trilha B",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma fórmula de nota diferente aplicada só na trilha B",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um boxplot de salários de uma empresa mostra vários pontos isolados acima do bigode superior, todos bem distantes da caixa. O que é mais razoável concluir só com essa informação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Existem valores bem acima do padrão, que merecem ser investigados",
                                "isCorrect": true
                            },
                            {
                                "text": "A base de dados de salários com certeza tem um erro de digitação",
                                "isCorrect": false
                            },
                            {
                                "text": "A distribuição de salários é perfeitamente simétrica e sem cauda",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe nenhum funcionário ganhando acima da mediana da empresa",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dispersão: a relação entre duas variáveis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dispersão: a relação entre duas variáveis numéricas\n\nNa trilha de Estatística você calculou a correlação entre duas variáveis: um número entre -1 e 1 que resume a força e a direção de uma relação linear, o mesmo que `df[\"horas_estudo\"].corr(df[\"nota_final\"])` calcula direto num DataFrame do pandas. O gráfico de dispersão (scatter plot) mostra essa mesma relação sem resumir em número nenhum: cada observação vira um ponto, posicionado pelo valor de uma variável no eixo x e da outra no eixo y.\n\nUse dispersão quando a pergunta for **\"essas duas variáveis numéricas se relacionam de algum jeito?\"**. É o gráfico certo pra checar, antes de confiar num coeficiente de correlação, o que de fato está acontecendo entre as duas variáveis."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(3)\nhoras_estudo = np.random.uniform(1, 20, 150)\nruido = np.random.normal(0, 1, 150)\nnota_final = np.clip(3 + 0.35 * horas_estudo + ruido, 0, 10)\n\nplt.figure(figsize=(7, 5))\nplt.scatter(horas_estudo, nota_final, color=\"teal\", alpha=0.6)\nplt.title(\"Horas de estudo por semana x nota final\")\nplt.xlabel(\"Horas de estudo por semana\")\nplt.ylabel(\"Nota final\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Como ler uma nuvem de pontos\n\nCada ponto é um aluno: a posição no eixo x é quantas horas ele estudou, a posição no eixo y é a nota que tirou. Três coisas pra observar:\n\n- **Tendência**: a nuvem sobe (relação positiva), desce (relação negativa) ou não tem direção clara (sem relação linear)?\n- **Força**: os pontos ficam grudados perto de uma reta imaginária (relação forte) ou espalhados por todo lado (relação fraca)?\n- **Padrões fora da reta**: existe uma curva em vez de uma reta? Existem dois grupos de pontos separados, como se fossem duas nuvens diferentes?\n\nNo exemplo, a nuvem sobe da esquerda pra direita e os pontos ficam relativamente próximos uns dos outros: sinal de uma correlação positiva e razoavelmente forte entre horas de estudo e nota final."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport matplotlib.pyplot as plt\n\n# continua com horas_estudo e nota_final criados no bloco anterior desta aula\ncorrelacao = np.corrcoef(horas_estudo, nota_final)[0, 1]\n\nplt.figure(figsize=(7, 5))\nplt.scatter(horas_estudo, nota_final, color=\"teal\", alpha=0.6)\nplt.title(f\"Horas de estudo x nota final (correlação = {correlacao:.2f})\")\nplt.xlabel(\"Horas de estudo por semana\")\nplt.ylabel(\"Nota final\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Um número só não conta a história toda\n\nNo Módulo 1 desta trilha, o quarteto de Anscombe mostrou quatro conjuntos de dados com a mesma correlação e gráficos completamente diferentes. Na prática isso quer dizer: dois conjuntos podem ter coeficientes de correlação parecidos e nuvens de pontos bem diferentes, uma em linha reta e outra em curva, por exemplo. O coeficiente de Pearson só mede relação **linear**; uma relação forte, porém curva, pode gerar um coeficiente baixo mesmo existindo um padrão claro no gráfico.\n\nPor isso a dispersão vem antes do número: ela mostra se a relação existe, se é mesmo uma reta, e se há grupos ou pontos fora do padrão que um coeficiente sozinho nunca mostraria."
                    },
                    {
                        "type": "table",
                        "value": "[[\"padrão da nuvem de pontos\",\"o que sugere\"],[\"sobe da esquerda pra direita, pontos próximos de uma reta\",\"relação linear positiva forte\"],[\"desce da esquerda pra direita, pontos espalhados\",\"relação linear negativa fraca\"],[\"nuvem redonda, sem direção clara\",\"pouca ou nenhuma relação linear\"],[\"forma de curva nítida, não uma reta\",\"relação existe, mas não é linear\"],[\"dois agrupamentos de pontos separados\",\"possíveis subgrupos distintos nos dados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Correlação é um número; dispersão é a nuvem inteira. Antes de confiar no coeficiente, olhe o gráfico, porque nuvens bem diferentes podem gerar o mesmo número."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual gráfico é o mais direto pra visualizar a relação entre duas variáveis numéricas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gráfico de dispersão entre as variáveis",
                                "isCorrect": true
                            },
                            {
                                "text": "Gráfico de barras entre categorias",
                                "isCorrect": false
                            },
                            {
                                "text": "Histograma de uma única variável",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de pizza entre categorias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num gráfico de dispersão, o que cada ponto representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma observação, com um valor em cada eixo",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma categoria inteira, resumida pela média",
                                "isCorrect": false
                            },
                            {
                                "text": "Um intervalo de valores agrupados numa faixa",
                                "isCorrect": false
                            },
                            {
                                "text": "Um instante de tempo numa série histórica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num gráfico de dispersão entre horas de estudo e nota final, os pontos sobem da esquerda pra direita e ficam próximos de uma reta imaginária. Isso sugere uma correlação:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Linear positiva, e razoavelmente forte",
                                "isCorrect": true
                            },
                            {
                                "text": "Linear negativa, e razoavelmente forte",
                                "isCorrect": false
                            },
                            {
                                "text": "Linear positiva, mas bastante fraca",
                                "isCorrect": false
                            },
                            {
                                "text": "Praticamente nula, sem direção clara",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois conjuntos de dados têm o mesmo coeficiente de correlação de Pearson, mas um gráfico de dispersão mostra uma nuvem em linha reta e o outro mostra uma curva nítida. O que isso ensina sobre confiar só no coeficiente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um único número pode esconder formatos bem diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "O coeficiente está necessariamente errado num dos casos",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois conjuntos de dados são, na prática, idênticos",
                                "isCorrect": false
                            },
                            {
                                "text": "A correlação de Pearson não existe pra nenhum dos dois",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico de dispersão entre idade e nota final mostra uma nuvem redonda, sem inclinação em nenhuma direção clara. O que essa forma sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pouca ou nenhuma relação linear entre elas",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma relação linear positiva de força moderada",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma relação linear negativa bastante forte",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro no cálculo das duas variáveis usadas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Barras: comparando categorias (e por que evitar a pizza)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Barras: comparando um valor entre categorias\n\nUse barras quando a pergunta for **\"como esse valor se compara entre categorias diferentes?\"**: alunos por trilha, vendas por região, aprovações por turma. Cada barra representa uma categoria inteira, e o comprimento da barra é o valor daquela categoria, o tipo de resultado que normalmente vem de um `groupby` seguido de alguma agregação (soma, contagem, média).\n\nExistem duas orientações. `plt.bar` desenha barras **verticais**, a opção padrão quando os nomes das categorias são curtos. `plt.barh` desenha barras **horizontais**, melhor quando os nomes são longos ou quando existem muitas categorias: os rótulos ficam no eixo y, um embaixo do outro, sem se sobrepor."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\ntrilhas = [\"Python\", \"Estatística\", \"SQL\", \"Visualização de Dados\", \"Machine Learning\"]\nalunos = [420, 310, 275, 190, 150]\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))\n\nax1.bar(trilhas, alunos, color=\"steelblue\")\nax1.set_title(\"Alunos por trilha (barras verticais)\")\nax1.set_ylabel(\"Número de alunos\")\nax1.tick_params(axis=\"x\", rotation=30)\n\nax2.barh(trilhas, alunos, color=\"steelblue\")\nax2.set_title(\"Alunos por trilha (barras horizontais)\")\nax2.set_xlabel(\"Número de alunos\")\n\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Barras agrupadas e empilhadas\n\nQuando cada categoria se divide em subcategorias, tipo aprovados e reprovados dentro de cada trilha, uma barra só não basta. **Barras agrupadas** colocam uma barra ao lado da outra pra cada subcategoria, boas pra comparar as subcategorias entre si dentro de cada grupo. **Barras empilhadas** colocam uma barra em cima da outra, boas pra ver o total da categoria e, ao mesmo tempo, a proporção de cada parte dentro dele."
                    },
                    {
                        "type": "code",
                        "value": "import numpy as np\nimport matplotlib.pyplot as plt\n\ntrilhas = [\"Python\", \"Estatística\", \"SQL\"]\naprovados = [340, 220, 230]\nreprovados = [80, 90, 45]\n\nx = np.arange(len(trilhas))\nlargura = 0.35\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))\n\nax1.bar(x - largura / 2, aprovados, largura, label=\"Aprovados\", color=\"seagreen\")\nax1.bar(x + largura / 2, reprovados, largura, label=\"Reprovados\", color=\"indianred\")\nax1.set_xticks(x)\nax1.set_xticklabels(trilhas)\nax1.set_title(\"Barras agrupadas\")\nax1.legend()\n\nax2.bar(trilhas, aprovados, label=\"Aprovados\", color=\"seagreen\")\nax2.bar(trilhas, reprovados, bottom=aprovados, label=\"Reprovados\", color=\"indianred\")\nax2.set_title(\"Barras empilhadas\")\nax2.legend()\n\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Por que evitar o gráfico de pizza\n\nO gráfico de pizza (`plt.pie`) existe no matplotlib, mas ele pede pro olho humano fazer uma tarefa que ele não faz bem: comparar **ângulos** e **áreas** de fatias com precisão. Comparar o comprimento de duas barras é fácil e rápido; comparar se uma fatia de 23 graus é maior que outra de 19 graus, muito menos. O problema piora com mais fatias (a partir de umas cinco ou seis já fica difícil) e com fatias de tamanho parecido, onde a diferença visual quase desaparece.\n\nQuase sempre que alguém pensa em pizza, um gráfico de barras conta a mesma informação de um jeito mais fácil de comparar, ordenando as categorias da maior pra menor. A pizza só se sustenta em casos bem pontuais, tipo duas ou três fatias com diferença bem grande entre elas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"gráfico de barras\",\"histograma\"],[\"variável no eixo das categorias\",\"categórica (grupos distintos)\",\"numérica contínua (faixas de valores)\"],[\"o que cada barra representa\",\"uma categoria inteira\",\"uma faixa (bin) de valores\"],[\"espaço entre as barras\",\"sim, categorias são separadas\",\"não, os bins ficam colados\"],[\"pergunta que responde\",\"comparar categorias entre si\",\"ver o formato de uma distribuição\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Comparar o comprimento de barras é fácil pro olho humano; comparar o ângulo de fatias de pizza, não. Quando a pergunta é qual categoria é maior, a barra quase sempre ganha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual gráfico é o mais indicado pra comparar um valor entre categorias diferentes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gráfico de barras entre categorias",
                                "isCorrect": true
                            },
                            {
                                "text": "Histograma de uma única variável",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de dispersão entre variáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de linha ao longo do tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Quando os nomes das categorias são longos e podem se sobrepor no eixo, qual escolha costuma resolver melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Barras horizontais, com barh",
                                "isCorrect": true
                            },
                            {
                                "text": "Barras verticais, com bar",
                                "isCorrect": false
                            },
                            {
                                "text": "Histograma, com poucos bins",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispersão, com cores por grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a principal diferença entre barras agrupadas e barras empilhadas pra comparar aprovados e reprovados por trilha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Agrupadas ficam lado a lado; empilhadas somam uma sobre a outra",
                                "isCorrect": true
                            },
                            {
                                "text": "Agrupadas mostram uma categoria só; empilhadas mostram todas",
                                "isCorrect": false
                            },
                            {
                                "text": "Agrupadas usam uma cor única; empilhadas usam várias cores",
                                "isCorrect": false
                            },
                            {
                                "text": "Agrupadas servem pra tempo; empilhadas servem pra categorias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um gráfico de pizza com sete ou oito fatias parecidas costuma ser uma escolha ruim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O olho humano tem dificuldade de comparar ângulos direito",
                                "isCorrect": true
                            },
                            {
                                "text": "O gráfico de pizza só aceita até quatro categorias ao todo",
                                "isCorrect": false
                            },
                            {
                                "text": "Fatias de pizza não conseguem representar valores percentuais",
                                "isCorrect": false
                            },
                            {
                                "text": "O matplotlib não possui nenhuma função pronta pra fazer pizza",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer mostrar quantos alunos se inscreveram em cada uma das cinco trilhas do roadmap de Ciência de Dados, deixando claro qual trilha tem mais alunos. Qual gráfico comunica isso com mais precisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Barras, comparando o comprimento entre as cinco trilhas",
                                "isCorrect": true
                            },
                            {
                                "text": "Pizza, comparando o ângulo de cada fatia entre as trilhas",
                                "isCorrect": false
                            },
                            {
                                "text": "Histograma, agrupando o número de alunos em faixas",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispersão, relacionando a trilha com o número de alunos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Linha: a evolução ao longo do tempo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Linha: a evolução de um valor ao longo do tempo\n\nUse linha quando a pergunta for **\"como esse valor mudou ao longo do tempo?\"**: inscrições por mês, receita por trimestre, temperatura por dia. O eixo x é o tempo, sempre em ordem cronológica, e o eixo y é o valor medido em cada ponto. Os pontos são ligados por uma linha, a mesma `plt.plot()` que você já usou no Módulo 2, só que agora com o tempo no eixo x em vez de números soltos.\n\nDo gráfico de linha dá pra ler dois padrões centrais: a **tendência** (o valor sobe, desce ou fica estável no longo prazo) e a **sazonalidade** (picos ou quedas que se repetem em períodos parecidos, tipo todo mês de dezembro)."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nmeses = [\"Jan\", \"Fev\", \"Mar\", \"Abr\", \"Mai\", \"Jun\", \"Jul\", \"Ago\", \"Set\", \"Out\", \"Nov\", \"Dez\"]\ninscricoes = [120, 135, 150, 170, 165, 190, 210, 205, 230, 250, 240, 150]\n\nplt.figure(figsize=(9, 5))\nplt.plot(meses, inscricoes, marker=\"o\", color=\"darkviolet\")\nplt.title(\"Novas inscrições por mês na plataforma\")\nplt.xlabel(\"Mês\")\nplt.ylabel(\"Novas inscrições\")\nplt.grid(True, alpha=0.3)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Como ler um gráfico de linha\n\nNo exemplo, a linha sobe de forma bastante constante de janeiro até novembro: essa é a tendência, um crescimento sustentado nas inscrições ao longo do ano. Em dezembro a linha cai bastante, um comportamento pontual (provavelmente as férias de fim de ano) que não muda a tendência de fundo, só interrompe ela por um mês.\n\nRepare que a ordem no eixo x é essencial aqui: trocar a ordem dos meses destruiria a leitura de tendência, porque deixaria de existir uma sequência temporal fazendo sentido. É por isso que linha combina com tempo (ou qualquer sequência ordenada) e não combina bem com categorias soltas, tipo trilhas ou regiões, que não têm uma ordem natural entre si."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nmeses = [\"Jan\", \"Fev\", \"Mar\", \"Abr\", \"Mai\", \"Jun\", \"Jul\", \"Ago\", \"Set\", \"Out\", \"Nov\", \"Dez\"]\ninscricoes_python = [80, 90, 95, 110, 105, 120, 130, 128, 140, 150, 145, 95]\ninscricoes_ml = [10, 12, 15, 18, 20, 25, 30, 35, 45, 55, 60, 40]\n\nplt.figure(figsize=(9, 5))\nplt.plot(meses, inscricoes_python, marker=\"o\", label=\"Python\")\nplt.plot(meses, inscricoes_ml, marker=\"o\", label=\"Machine Learning\")\nplt.title(\"Novas inscrições por trilha ao longo do ano\")\nplt.xlabel(\"Mês\")\nplt.ylabel(\"Novas inscrições\")\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidados com várias linhas, e o que vem a seguir\n\nDuas linhas no mesmo gráfico já dão pra comparar bem, usando `label` em cada `plt.plot` e `plt.legend()` pra identificar qual é qual. A partir de seis ou sete linhas, o gráfico costuma virar um emaranhado difícil de seguir, cada linha cruzando a outra: nesse caso, vale considerar separar em vários gráficos menores (voltando à ideia de `plt.subplots` do Módulo 2) em vez de espremer tudo numa figura só.\n\nCom histograma, boxplot, dispersão, barras e linha, você já cobre a grande maioria das perguntas do dia a dia com dado: distribuição, resumo com outliers, relação, comparação e evolução no tempo. No próximo módulo, o seaborn entra pra gerar esses mesmos gráficos com menos código e integração direta com o DataFrame do pandas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"situação\",\"gráfico de linha\",\"gráfico de barras\"],[\"eixo x\",\"tempo ou sequência ordenada\",\"categorias sem ordem natural\"],[\"o que destaca melhor\",\"tendência e variação ao longo do tempo\",\"comparação direta entre valores\"],[\"número de séries confortável\",\"poucas linhas, até 3 ou 4\",\"funciona bem com várias categorias\"],[\"exemplo típico\",\"inscrições por mês\",\"inscrições por trilha\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Se o eixo x é tempo, pense em linha; se o eixo x é categoria, pense em barra. Essa pergunta simples já resolve boa parte da dúvida de qual gráfico usar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual gráfico é o mais indicado pra mostrar a evolução de um valor ao longo do tempo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gráfico de linha ao longo do tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Gráfico de barras entre categorias",
                                "isCorrect": false
                            },
                            {
                                "text": "Boxplot com resumo e outliers",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de dispersão entre variáveis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num gráfico de linha de inscrições por mês, o que o eixo x normalmente representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tempo, em ordem cronológica",
                                "isCorrect": true
                            },
                            {
                                "text": "As categorias, sem ordem definida",
                                "isCorrect": false
                            },
                            {
                                "text": "A frequência de cada faixa de valores",
                                "isCorrect": false
                            },
                            {
                                "text": "A correlação entre duas variáveis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico de linha de inscrições mostra crescimento constante de janeiro a novembro e uma queda só em dezembro. Como descrever esse padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tendência de alta, com uma queda pontual no fim",
                                "isCorrect": true
                            },
                            {
                                "text": "Tendência de queda constante durante o ano inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Ausência total de qualquer tendência nos dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Correlação negativa entre os doze meses do ano",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que colocar seis ou sete linhas diferentes no mesmo gráfico costuma prejudicar a leitura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As linhas se cruzam, formando um emaranhado difícil",
                                "isCorrect": true
                            },
                            {
                                "text": "O matplotlib limita o gráfico de linha a três séries",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada linha nova exige um eixo x totalmente diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráficos de linha não aceitam legenda com várias séries",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem matrículas por trilha, mês a mês, ao longo de um ano, e quer comparar a evolução entre trilhas e também o total anual entre elas. Quais gráficos combinam melhor com cada objetivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Linha pra evolução mensal, barras pro total anual",
                                "isCorrect": true
                            },
                            {
                                "text": "Barras pra evolução mensal, linha pro total anual",
                                "isCorrect": false
                            },
                            {
                                "text": "Histograma pra evolução, dispersão pro total anual",
                                "isCorrect": false
                            },
                            {
                                "text": "Pizza pra evolução mensal, histograma pro total anual",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - seaborn: visualização estatística",
        "aulas": [
            {
                "titulo": "Por que seaborn e o data=df",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# seaborn: visualização estatística\n\nNos módulos 2 e 3 você aprendeu matplotlib: a base de tudo, com controle total sobre cada elemento da figura. Só que esse controle tem um preço. Pra colorir pontos por categoria, você escreve um laço e um dicionário de cores na mão. Pra cada gráfico novo, ajusta grade, espaçamento e paleta de novo.\n\nO seaborn resolve isso de um jeito específico: é uma biblioteca de visualização estatística, construída em cima do matplotlib, com dois compromissos claros. Primeiro, vem bonito por padrão (grade, cores e proporções já ajustadas, sem configurar nada). Segundo, e mais importante, é feita pra conversar direto com o DataFrame do pandas: em vez de passar arrays soltos, você entrega a tabela inteira e diz quais colunas usar.\n\nA convenção de import segue a mesma lógica de `import pandas as pd` e `import matplotlib.pyplot as plt`:\n\n`import seaborn as sns`"
                    },
                    {
                        "type": "text",
                        "value": "## data=df, x, y, hue: a gramática do seaborn\n\nQuase toda função do seaborn segue o mesmo padrão de chamada: um parâmetro `data` recebendo o DataFrame inteiro, e depois `x`, `y` e `hue` recebendo nomes de coluna, como texto, não os valores em si. É diferente do matplotlib, que espera os valores já prontos: `plt.plot(lista_x, lista_y)`.\n\nO `hue` é o parâmetro que mais economiza código: aponta uma coluna categórica e o seaborn colore cada grupo automaticamente, com legenda incluída, sem laço e sem dicionário de cores.\n\nPra este módulo, vamos usar um DataFrame de vendas parecido com aquele que você agrupava lá na trilha de Análise de Dados: categoria do produto, região, valor da venda, quantidade de itens e a avaliação que o cliente deu."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"matplotlib\",\"seaborn\"],[\"Entrada de dados\",\"arrays, listas ou Series soltos, como em plt.plot(x, y)\",\"o DataFrame inteiro, com data=df e colunas por nome\"],[\"Separar por categoria\",\"loop manual, um plt.scatter por grupo\",\"hue=\\\"coluna\\\" resolve numa linha\"],[\"Visual padrão\",\"básico, cor e grade pedem configuração manual\",\"já vem com paleta, grade e proporções ajustadas\"],[\"Foco principal\",\"gráficos genéricos, controle total da figura\",\"gráficos estatísticos: distribuição, relação, comparação de grupos\"],[\"Relação entre os dois\",\"é a base: toda figura do seaborn é uma Figure do matplotlib\",\"roda em cima do matplotlib, dá pra ajustar com plt depois\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\", \"Papelaria\", \"Eletrônicos\"],\n    \"regiao\": [\"Sudeste\", \"Sul\", \"Sudeste\", \"Nordeste\", \"Sul\", \"Sudeste\", \"Centro-Oeste\", \"Sudeste\"],\n    \"valor\": [1200.0, 45.0, 8.5, 2500.0, 60.0, 90.0, 12.0, 1800.0],\n    \"quantidade\": [1, 1, 5, 1, 2, 3, 4, 1],\n    \"avaliacao\": [5, 4, 5, 3, 4, 5, 4, 2]\n})\n\ncores = {\"Eletrônicos\": \"tab:blue\", \"Livros\": \"tab:orange\", \"Papelaria\": \"tab:green\", \"Brinquedos\": \"tab:red\"}\n\nfig, ax = plt.subplots()\nfor categoria, grupo in df.groupby(\"categoria\"):\n    ax.scatter(grupo[\"quantidade\"], grupo[\"valor\"], label=categoria, color=cores[categoria])\n\nax.set_xlabel(\"Quantidade\")\nax.set_ylabel(\"Valor (R$)\")\nax.set_title(\"Valor por quantidade, colorido por categoria (matplotlib puro)\")\nax.legend(title=\"Categoria\")\nplt.show()"
                    },
                    {
                        "type": "code",
                        "value": "import seaborn as sns\nimport matplotlib.pyplot as plt\n\n# usando o mesmo df do bloco anterior\nsns.scatterplot(data=df, x=\"quantidade\", y=\"valor\", hue=\"categoria\")\nplt.xlabel(\"Quantidade\")\nplt.ylabel(\"Valor (R$)\")\nplt.title(\"Valor por quantidade, colorido por categoria (seaborn)\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O que o hue poupou\n\nRepare no tamanho dos dois blocos de código. No matplotlib puro, foi preciso montar um dicionário de cores, abrir um laço com `df.groupby(\"categoria\")` e chamar `ax.legend()` no final. No seaborn, uma chamada resolveu tudo: cor por grupo e legenda prontas, sem laço.\n\nEsse mesmo df de vendas volta nas próximas aulas: primeiro pra olhar a distribuição de valor (Aula 2), depois pra comparar categorias (Aula 3), e por fim pra olhar a correlação entre as colunas numéricas (Aula 4). É a mesma tabela, vista de ângulos diferentes."
                    },
                    {
                        "type": "quote",
                        "value": "seaborn não substitui o matplotlib: ele conversa com o pandas. Você entrega o DataFrame e diz x, y e hue, o resto o seaborn resolve sozinho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Seguindo a mesma convenção de import pandas as pd, qual é a forma padrão de importar o seaborn?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "import seaborn as sns",
                                "isCorrect": true
                            },
                            {
                                "text": "import seaborn as sb",
                                "isCorrect": false
                            },
                            {
                                "text": "from seaborn import plot",
                                "isCorrect": false
                            },
                            {
                                "text": "import stats as sns",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No padrão sns.scatterplot(data=df, x=\"quantidade\", y=\"valor\", hue=\"categoria\"), qual é o papel do parâmetro hue?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Colorir os pontos do gráfico conforme uma coluna categórica",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir o tamanho da figura antes de desenhar o gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordenar as linhas do DataFrame antes de gerar o gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Escolher qual coluna do DataFrame define o eixo y do gráfico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu df tem as colunas categoria, valor e quantidade. Você quer ver a dispersão de quantidade por valor, colorida por categoria, numa linha, sem laço nem dicionário de cores. Qual chamada faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "sns.scatterplot(data=df, x=\"quantidade\", y=\"valor\", hue=\"categoria\")",
                                "isCorrect": true
                            },
                            {
                                "text": "plt.scatter(df[\"quantidade\"], df[\"valor\"], color=\"categoria\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.scatterplot(df[\"quantidade\"], df[\"valor\"], df[\"categoria\"])",
                                "isCorrect": false
                            },
                            {
                                "text": "plt.plot(data=df, x=\"quantidade\", y=\"valor\", hue=\"categoria\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença central entre chamar plt.scatter(x, y) e sns.scatterplot(data=df, x=\"col1\", y=\"col2\")?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No seaborn, x e y são nomes de coluna; no matplotlib, são os valores prontos",
                                "isCorrect": true
                            },
                            {
                                "text": "No seaborn, x e y precisam virar array NumPy antes de entrar na função",
                                "isCorrect": false
                            },
                            {
                                "text": "No matplotlib, x e y aceitam nome de coluna direto, sem precisar de DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "No seaborn, o parâmetro data é opcional e pode ser trocado por hue",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você tem o df de vendas com categoria, regiao, valor, quantidade e avaliacao. Quer separar os pontos de quantidade por valor por categoria, com cor e legenda prontas, sem manter dicionário de cores. Qual caminho exige menos código?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "sns.scatterplot(data=df, x=\"quantidade\", y=\"valor\", hue=\"categoria\"), que gera cor e legenda sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "plt.scatter(data=df, x=\"quantidade\", y=\"valor\", hue=\"categoria\"), que já aceita hue nativamente",
                                "isCorrect": false
                            },
                            {
                                "text": "um laço com plt.scatter por categoria, montando a legenda com ax.legend() no final",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.lineplot(data=df, x=\"quantidade\", y=\"valor\", hue=\"categoria\"), ideal pra dispersão",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Distribuição no seaborn: histplot e kdeplot",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do histograma do matplotlib pro histplot\n\nNo Módulo 3 você já viu o histograma: divide os valores em faixas (bins) e conta quantas observações caem em cada uma, revelando a forma da distribuição. O `sns.histplot` faz a mesma coisa, só que com a gramática do seaborn: `data`, `x`, e a opção de separar grupos com `hue`, sem desenhar um histograma por categoria na mão.\n\nA leitura continua a mesma da trilha de Estatística: onde a barra é mais alta, os valores se concentram; uma cauda longa de um lado indica assimetria; uma barra isolada, bem longe das outras, é candidata a outlier."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\",\n                  \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\",\n                  \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\", \"Eletrônicos\",\n                  \"Papelaria\", \"Brinquedos\", \"Eletrônicos\"],\n    \"valor\": [1200.0, 45.0, 8.5, 2500.0, 60.0, 90.0, 12.0, 1800.0, 75.0, 55.0,\n              15.0, 3200.0, 68.0, 40.0, 1500.0, 9.0, 82.0, 2100.0]\n})\n\nsns.histplot(data=df, x=\"valor\", bins=8)\nplt.title(\"Distribuição do valor das vendas\")\nplt.xlabel(\"Valor (R$)\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo esse histograma\n\nEsse gráfico deve sair com a maioria das barras concentradas perto de zero (livros, papelaria e brinquedos custam pouco) e poucas barras isoladas lá longe, na casa dos R$ 1.200 a R$ 3.200 (os eletrônicos). É uma distribuição assimétrica à direita: uma cauda longa puxada por poucos valores altos, o mesmo tipo de assimetria que você já reconhecia olhando describe() na trilha de Análise de Dados, agora numa forma visual.\n\nOutra opção pra ver a mesma distribuição é a curva de densidade, o kdeplot."
                    },
                    {
                        "type": "code",
                        "value": "import seaborn as sns\nimport matplotlib.pyplot as plt\nimport pandas as pd\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\",\n                  \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\",\n                  \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\", \"Eletrônicos\",\n                  \"Papelaria\", \"Brinquedos\", \"Eletrônicos\"],\n    \"valor\": [1200.0, 45.0, 8.5, 2500.0, 60.0, 90.0, 12.0, 1800.0, 75.0, 55.0,\n              15.0, 3200.0, 68.0, 40.0, 1500.0, 9.0, 82.0, 2100.0]\n})\n\nsns.kdeplot(data=df, x=\"valor\", fill=True)\nplt.title(\"Densidade estimada do valor das vendas\")\nplt.show()\n\n# histograma e densidade juntos, numa chamada só\nsns.histplot(data=df, x=\"valor\", kde=True, bins=8)\nplt.show()\n\n# comparando a distribuição de valor entre categorias\nsns.kdeplot(data=df, x=\"valor\", hue=\"categoria\", fill=True)\nplt.title(\"Valor por categoria\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Uma curva em vez de barras\n\nO kdeplot troca as barras por uma curva suave, estimando a densidade da distribuição. Ganha em elegância pra comparar formatos (não depende de escolher o número de bins), mas perde a leitura direta de quantas observações caem em cada ponto: pra contagem exata, o histograma continua sendo a ferramenta certa.\n\nCom hue, tanto histplot quanto kdeplot desenham uma curva ou conjunto de barras por categoria, sobrepostas por padrão. Quando a sobreposição atrapalha a leitura, o parâmetro multiple=\"stack\" empilha as barras do histplot em vez de sobrepor."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\",\"O que mostra\",\"Quando preferir\"],[\"histplot\",\"contagem de observações em cada faixa (bin) de valores\",\"quando a contagem exata e o formato de barras ajudam a leitura\"],[\"kdeplot\",\"curva suave estimando a densidade da distribuição\",\"quando o objetivo é comparar o formato de vários grupos de uma vez\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "histplot conta, kdeplot suaviza. Os dois respondem a mesma pergunta, como essa variável se distribui, com hue fazendo o trabalho de comparar grupos que antes pedia um gráfico por categoria."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função do seaborn desenha um histograma?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "sns.histplot()",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.barplot()",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.histogram()",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.plotdist()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, o que o eixo y de um histplot mostra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A contagem de observações em cada faixa de valores",
                                "isCorrect": true
                            },
                            {
                                "text": "A média da variável dentro de cada categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "A densidade acumulada até aquele ponto do eixo x",
                                "isCorrect": false
                            },
                            {
                                "text": "O percentual de outliers detectados na faixa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer comparar a distribuição de valor entre as quatro categorias de produto, no mesmo gráfico, sem abrir um histograma por categoria. Qual chamada faz isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "sns.histplot(data=df, x=\"valor\", hue=\"categoria\")",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.histplot(data=df, x=\"valor\", y=\"categoria\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.histplot(data=df, x=\"valor\", style=\"categoria\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.boxplot(data=df, x=\"valor\", hue=\"categoria\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma curva de densidade (kdeplot) ajuda mais do que um histograma quando...",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "o objetivo é comparar o formato de duas distribuições, sem escolher bins",
                                "isCorrect": true
                            },
                            {
                                "text": "é preciso contar exatamente quantas observações caem em cada faixa de valores",
                                "isCorrect": false
                            },
                            {
                                "text": "cada categoria precisa aparecer num gráfico separado, lado a lado",
                                "isCorrect": false
                            },
                            {
                                "text": "o eixo y precisa mostrar sempre valores entre 0 e 1, como uma probabilidade exata",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No histplot com hue=\"categoria\", as barras de categorias diferentes ficam sobrepostas. Qual parâmetro ajusta como os grupos se organizam entre si, por exemplo empilhando em vez de sobrepor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "multiple",
                                "isCorrect": true
                            },
                            {
                                "text": "stat",
                                "isCorrect": false
                            },
                            {
                                "text": "element",
                                "isCorrect": false
                            },
                            {
                                "text": "common_norm",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Categorias: boxplot, violinplot, barplot e countplot",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Boxplot e violinplot: uma variável numérica por categoria\n\nO boxplot já apareceu no Módulo 3, com os quartis e a regra do IQR pra marcar outliers, que você viu primeiro lá na trilha de Estatística. A versão do seaborn segue a mesma gramática das outras funções: data, x pra categoria, y pra variável numérica, sem filtrar cada grupo manualmente antes de plotar.\n\nO violinplot parte da mesma chamada (só troca o nome da função) e soma um detalhe: além dos quartis, desenha o formato inteiro da distribuição, espelhado dos dois lados, como uma densidade. Onde o violino é mais largo, há mais observações concentradas naquele valor."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\",\n                  \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\",\n                  \"Papelaria\", \"Eletrônicos\"],\n    \"valor\": [1200.0, 45.0, 8.5, 2500.0, 60.0, 90.0, 12.0, 1800.0, 75.0, 55.0, 15.0, 3200.0]\n})\n\nplt.figure()\nsns.boxplot(data=df, x=\"categoria\", y=\"valor\")\nplt.title(\"Boxplot: valor por categoria\")\nplt.show()\n\nplt.figure()\nsns.violinplot(data=df, x=\"categoria\", y=\"valor\")\nplt.title(\"Violinplot: valor por categoria\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Contar x resumir: barplot e countplot\n\nDuas perguntas diferentes, dois gráficos diferentes. \"Qual a categoria com maior valor médio?\" é uma pergunta de resumo: o barplot agrega uma coluna numérica por categoria (a média, por padrão) e desenha uma barra por grupo, com uma linha vertical indicando a incerteza dessa média. É o mesmo cálculo de df.groupby(\"categoria\")[\"valor\"].mean(), já desenhado.\n\n\"Quantos pedidos cada categoria teve?\" é uma pergunta de contagem: o countplot conta quantas linhas existem em cada categoria, sem olhar pra nenhuma coluna numérica. Equivale a df[\"categoria\"].value_counts(), também já desenhado. Trocar um pelo outro é um erro comum: pedir a média de algo e receber uma contagem, ou vice versa."
                    },
                    {
                        "type": "code",
                        "value": "import seaborn as sns\nimport matplotlib.pyplot as plt\nimport pandas as pd\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\",\n                  \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\",\n                  \"Papelaria\", \"Eletrônicos\"],\n    \"valor\": [1200.0, 45.0, 8.5, 2500.0, 60.0, 90.0, 12.0, 1800.0, 75.0, 55.0, 15.0, 3200.0]\n})\n\nsns.barplot(data=df, x=\"categoria\", y=\"valor\")\nplt.title(\"Valor médio por categoria\")\nplt.ylabel(\"Valor médio (R$)\")\nplt.show()\n\nsns.countplot(data=df, x=\"categoria\")\nplt.title(\"Quantidade de pedidos por categoria\")\nplt.ylabel(\"Número de pedidos\")\nplt.show()"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\",\"O que mostra\",\"Equivalente em pandas\"],[\"boxplot\",\"quartis, mediana e outliers de uma variável numérica por categoria\",\"describe() e a regra do IQR, categoria por categoria\"],[\"violinplot\",\"o mesmo resumo do boxplot, mais a forma completa da distribuição\",\"um histograma ou kdeplot separado por categoria\"],[\"barplot\",\"a média (ou outra agregação) de uma variável numérica por categoria\",\"groupby(\\\"categoria\\\")[\\\"coluna\\\"].mean()\"],[\"countplot\",\"quantas linhas existem em cada categoria\",\"value_counts() ou groupby(\\\"categoria\\\").size()\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Qual pergunta, qual gráfico\n\nEssas quatro funções cobrem quase toda pergunta do tipo \"como essa variável se comporta em cada grupo\": a forma completa (violinplot), o resumo em quartis (boxplot), a média (barplot) ou a contagem (countplot). É exatamente esse tipo de pergunta que vai guiar a análise exploratória do Módulo 5: olhar cada variável, categoria por categoria, antes de ir atrás de relações entre colunas."
                    },
                    {
                        "type": "quote",
                        "value": "Antes de escolher o gráfico, escolha a pergunta: resumo numérico é boxplot ou violinplot, média por grupo é barplot, contagem por grupo é countplot."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual gráfico do seaborn resume quartis, mediana e outliers de uma variável numérica por categoria, retomando o IQR da trilha de Estatística?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "sns.boxplot()",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.countplot()",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.heatmap()",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.pairplot()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença central entre barplot e countplot no seaborn?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "barplot agrega uma coluna numérica por categoria; countplot conta linhas por categoria",
                                "isCorrect": true
                            },
                            {
                                "text": "barplot conta linhas por categoria; countplot agrega uma coluna numérica pela média",
                                "isCorrect": false
                            },
                            {
                                "text": "barplot só aceita uma categoria por vez; countplot aceita várias ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "barplot mostra a mediana de cada grupo; countplot mostra a média de cada grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu df de vendas tem uma linha por pedido e a coluna categoria. Você quer saber quantos pedidos cada categoria teve, sem calcular média nem soma de nada. Qual gráfico resolve direto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "sns.countplot(data=df, x=\"categoria\")",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.barplot(data=df, x=\"categoria\", y=\"valor\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.boxplot(data=df, x=\"categoria\", y=\"valor\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.histplot(data=df, x=\"categoria\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em que situação um violinplot revela algo que um boxplot sozinho esconde?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "quando a distribuição de um grupo é bimodal, já que o boxplot só mostra os quartis",
                                "isCorrect": true
                            },
                            {
                                "text": "quando o número de categorias passa de quatro, que é o limite do boxplot",
                                "isCorrect": false
                            },
                            {
                                "text": "quando existem valores negativos, que o boxplot não consegue desenhar",
                                "isCorrect": false
                            },
                            {
                                "text": "quando a categoria tem poucas linhas, abaixo do mínimo exigido pelo boxplot",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes do seaborn, pra saber a média de valor por categoria você escrevia df.groupby(\"categoria\")[\"valor\"].mean(). Qual gráfico chega nesse mesmo número, já desenhado, sem rodar o groupby à parte?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "sns.barplot(data=df, x=\"categoria\", y=\"valor\")",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.violinplot(data=df, x=\"categoria\", y=\"valor\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.countplot(data=df, x=\"categoria\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.scatterplot(data=df, x=\"categoria\", y=\"valor\")",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Correlação com heatmap e a visão geral do pairplot",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## De volta ao r, agora pra todas as colunas de uma vez\n\nLá na trilha de Estatística você calculou o coeficiente de correlação de Pearson, o r: um número entre -1 e 1 que resume força e direção da relação entre duas variáveis. O df.corr() do pandas faz essa conta pra cada par de colunas numéricas do DataFrame de uma só vez, devolvendo uma matriz. O sns.heatmap transforma essa matriz em cor, trocando uma tabela de números por algo que se lê num olhar."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\",\n                  \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\",\n                  \"Papelaria\", \"Eletrônicos\"],\n    \"valor\": [1200.0, 45.0, 8.5, 2500.0, 60.0, 90.0, 12.0, 1800.0, 75.0, 55.0, 15.0, 3200.0],\n    \"quantidade\": [1, 1, 5, 1, 2, 3, 4, 1, 1, 2, 6, 1],\n    \"avaliacao\": [5, 4, 5, 3, 4, 5, 4, 2, 5, 4, 5, 4]\n})\n\ncorrelacoes = df[[\"valor\", \"quantidade\", \"avaliacao\"]].corr()\nprint(correlacoes)\n\nsns.heatmap(correlacoes, annot=True, fmt=\".2f\", cmap=\"coolwarm\", vmin=-1, vmax=1)\nplt.title(\"Correlação entre valor, quantidade e avaliação\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo o heatmap\n\nTrês pontos pra ler qualquer heatmap de correlação. A diagonal principal é sempre 1: toda variável tem correlação perfeita com ela mesma. A matriz é simétrica, a metade de cima repete a de baixo. E a cor segue uma paleta divergente (coolwarm): vermelho forte perto de 1 (correlação positiva forte), azul forte perto de -1 (negativa forte), tons claros perto de 0 (relação fraca ou nula). Com annot=True, o valor exato de r ainda aparece escrito em cada célula, sem precisar adivinhar pela cor.\n\nNesse exemplo, valor e quantidade devem sair com correlação negativa: quem compra eletrônicos gasta mais por pedido, mas leva menos unidades; quem compra papelaria leva várias unidades baratas."
                    },
                    {
                        "type": "text",
                        "value": "## pairplot: todos os pares de uma vez\n\nO heatmap resume cada relação num número. O sns.pairplot(df) vai além: desenha um scatterplot pra cada par de colunas numéricas, organizados numa grade, com a distribuição de cada variável isolada na diagonal. É uma visão geral, útil bem no início de uma EDA, antes de decidir em qual par de colunas vale a pena se aprofundar.\n\nLembra do quarteto de Anscombe, lá no Módulo 1? Quatro relações com a mesma correlação e as mesmas médias, mas formatos completamente diferentes. O heatmap sozinho mostraria o mesmo r pras quatro. É pra isso que serve o pairplot: mostrar a forma da relação, não só o coeficiente."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\",\n                  \"Livros\", \"Papelaria\", \"Eletrônicos\", \"Brinquedos\", \"Livros\",\n                  \"Papelaria\", \"Eletrônicos\"],\n    \"valor\": [1200.0, 45.0, 8.5, 2500.0, 60.0, 90.0, 12.0, 1800.0, 75.0, 55.0, 15.0, 3200.0],\n    \"quantidade\": [1, 1, 5, 1, 2, 3, 4, 1, 1, 2, 6, 1],\n    \"avaliacao\": [5, 4, 5, 3, 4, 5, 4, 2, 5, 4, 5, 4]\n})\n\ngrade = sns.pairplot(df, hue=\"categoria\", vars=[\"valor\", \"quantidade\", \"avaliacao\"])\ngrade.fig.suptitle(\"Relação entre valor, quantidade e avaliação\", y=1.02)\nplt.show()\n\n# pairplot devolve um PairGrid, não um Axes: por isso o título usa\n# grade.fig.suptitle(...) em vez do ax.set_title(...) que funciona nos outros gráficos"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\",\"O que mostra\",\"Quando ajuda numa EDA\"],[\"heatmap de correlação\",\"o valor de r entre cada par de colunas numéricas, numa matriz colorida\",\"visão rápida de quais variáveis se movem juntas, entre muitas colunas\"],[\"pairplot\",\"um scatterplot por par de colunas, mais a distribuição de cada uma na diagonal\",\"ver a forma de relações específicas, não só o número\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O heatmap responde quais variáveis se movem juntas. O pairplot responde de que jeito. Numa EDA, o primeiro vem antes, o segundo aprofunda."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual método do pandas calcula a correlação entre cada par de colunas numéricas de um DataFrame, de uma vez só?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "df.corr()",
                                "isCorrect": true
                            },
                            {
                                "text": "df.corrwith()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.describe()",
                                "isCorrect": false
                            },
                            {
                                "text": "df.cov()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual gráfico do seaborn transforma uma matriz de correlação numa grade de cores, com o valor de r escrito em cada célula?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "sns.heatmap(corr, annot=True)",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.pairplot(corr, hue=\"categoria\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.clustermap(corr, cmap=\"coolwarm\")",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.jointplot(corr, kind=\"hex\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu df tem oito colunas numéricas. Você quer uma primeira visão de quais pares parecem ter relação mais forte, antes de investigar a fundo. Qual ferramenta dá essa visão mais rápido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "sns.heatmap(df.corr(), annot=True), pela leitura direta de cor e número",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.pairplot(df), pela grade de 64 gráficos de dispersão de uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.boxplot(data=df), separando cada coluna numérica em um grupo",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.scatterplot(data=df, x=df.columns[0], y=df.columns[1])",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O heatmap mostra r = 0.86 entre duas colunas. Por que ainda vale a pena olhar o scatterplot ou o pairplot dessas duas, e não parar só no número?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "porque o mesmo r pode vir de formatos de relação bem diferentes, e o heatmap não mostra a forma",
                                "isCorrect": true
                            },
                            {
                                "text": "porque o heatmap só calcula corretamente quando existem no máximo duas colunas numéricas",
                                "isCorrect": false
                            },
                            {
                                "text": "porque o r do heatmap vem sempre arredondado, escondendo o valor real da correlação",
                                "isCorrect": false
                            },
                            {
                                "text": "porque o pairplot recalcula a correlação com uma fórmula mais precisa que a do heatmap",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No sns.pairplot(df, hue=\"categoria\"), o que aparece na diagonal principal da grade, no lugar de um scatterplot da coluna com ela mesma?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "a distribuição de cada variável numérica, separada por categoria",
                                "isCorrect": true
                            },
                            {
                                "text": "um scatterplot da coluna contra o índice (posição da linha) do DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "a média e o desvio padrão da coluna, escritos como texto na célula",
                                "isCorrect": false
                            },
                            {
                                "text": "a mesma matriz de correlação do heatmap, repetida célula por célula",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Paletas, temas e a relação com o matplotlib",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Estética também é leitura\n\nCor e estilo não são só enfeite: uma paleta bem escolhida ajuda a enxergar o padrão mais rápido, uma mal escolhida atrapalha. O seaborn já vem com uma paleta padrão (deep) e outras prontas: pastel, muted, dark, bright, entre outras (existe até uma chamada colorblind, um adiantamento do que o Módulo 6 vai tratar com mais calma).\n\nO sns.set_theme() ajusta estilo e paleta de uma vez, valendo pra todos os gráficos seguintes do script, até ser chamado de novo com outros valores."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Brinquedos\", \"Eletrônicos\", \"Livros\"],\n    \"valor\": [1200.0, 45.0, 8.5, 60.0, 1800.0, 90.0]\n})\n\nsns.set_theme(style=\"whitegrid\", palette=\"muted\")\n\nsns.boxplot(data=df, x=\"categoria\", y=\"valor\")\nplt.title(\"Valor por categoria, com o tema whitegrid\")\nplt.show()"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de paleta\",\"Quando usar\",\"Exemplo de nome\"],[\"Qualitativa\",\"categorias sem ordem entre si, como categoria do produto ou região\",\"deep, pastel, muted, Set2\"],[\"Sequencial\",\"valores contínuos ou ordenados, do menor pro maior\",\"viridis, Blues\"],[\"Divergente\",\"valores com um centro significativo, como o zero da correlação\",\"coolwarm\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## coolwarm não foi escolha por acaso\n\nO heatmap da Aula 4 usou cmap=\"coolwarm\" porque correlação tem um centro que importa: o zero. Uma paleta divergente destaca os dois extremos (positivo forte, negativo forte) e deixa o meio claro, exatamente o que uma paleta qualitativa como Set2 não faz.\n\n## seaborn devolve um Axes (menos o pairplot)\n\nA maioria das funções que você usou até aqui (histplot, kdeplot, boxplot, violinplot, scatterplot, barplot, countplot, heatmap) devolve um Axes do matplotlib, o mesmo objeto que plt.subplots() cria. Por isso dá pra guardar o retorno numa variável e ajustar com o próprio matplotlib depois: ax.set_title(...), ax.set_xlabel(...), ou passar esse ax pronto pra dentro de uma grade de plt.subplots(). O pairplot da Aula 4 é a exceção: devolve um PairGrid, não um Axes único, por isso o título geral usa grade.fig.suptitle(...) em vez de set_title."
                    },
                    {
                        "type": "code",
                        "value": "import seaborn as sns\nimport matplotlib.pyplot as plt\nimport pandas as pd\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Brinquedos\", \"Eletrônicos\", \"Livros\"],\n    \"valor\": [1200.0, 45.0, 8.5, 60.0, 1800.0, 90.0]\n})\n\nsns.boxplot(data=df, x=\"categoria\", y=\"valor\", hue=\"categoria\", palette=\"Set2\", legend=False)\nplt.title(\"Mesmo boxplot, paleta Set2 no lugar do tema global\")\nplt.show()\n\n# hue igual ao x, com legend=False: o jeito atual do seaborn de colorir\n# cada categoria sem duplicar a legenda"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\ndf = pd.DataFrame({\n    \"categoria\": [\"Eletrônicos\", \"Livros\", \"Papelaria\", \"Brinquedos\", \"Eletrônicos\", \"Livros\"],\n    \"valor\": [1200.0, 45.0, 8.5, 60.0, 1800.0, 90.0]\n})\n\nfig, eixos = plt.subplots(1, 2, figsize=(10, 4))\n\nsns.histplot(data=df, x=\"valor\", ax=eixos[0])\neixos[0].set_title(\"Distribuição de valor\")\n\nsns.boxplot(data=df, x=\"categoria\", y=\"valor\", hue=\"categoria\", palette=\"Set2\", legend=False, ax=eixos[1])\neixos[1].set_title(\"Valor por categoria\")\n\nplt.tight_layout()\nplt.savefig(\"vendas_resumo.png\")\nplt.show()"
                    },
                    {
                        "type": "quote",
                        "value": "seaborn escolhe a cor e o estilo por você, mas quem manda no título, no eixo e na figura final continua sendo o matplotlib que você já conhece do Módulo 2."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função do seaborn ajusta, de uma vez, o estilo visual (grade, fundo) e a paleta de cor padrão do resto do script?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "sns.set_theme()",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.color_palette()",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.axes_style()",
                                "isCorrect": false
                            },
                            {
                                "text": "plt.style.use()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O heatmap de correlação da Aula 4 vai de -1 a 1, com um centro (zero) que importa. Que tipo de paleta combina melhor com esse caso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "uma paleta divergente, como coolwarm",
                                "isCorrect": true
                            },
                            {
                                "text": "uma paleta sequencial, como viridis",
                                "isCorrect": false
                            },
                            {
                                "text": "uma paleta qualitativa, como Set2",
                                "isCorrect": false
                            },
                            {
                                "text": "a paleta padrão do tema darkgrid, sem escolher cmap",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você chamou sns.set_theme(style=\"whitegrid\", palette=\"pastel\") no topo do script. Depois, chamou sns.boxplot(data=df, x=\"categoria\", y=\"valor\") sem passar palette. O que acontece com a cor do gráfico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "usa a paleta pastel do set_theme, que vale pra todos os gráficos seguintes",
                                "isCorrect": true
                            },
                            {
                                "text": "usa a paleta padrão (deep), porque set_theme só muda o estilo da grade",
                                "isCorrect": false
                            },
                            {
                                "text": "gera um erro, porque todo boxplot exige o parâmetro palette explícito",
                                "isCorrect": false
                            },
                            {
                                "text": "usa cores aleatórias, já que nenhuma paleta foi passada direto no boxplot",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ax = sns.boxplot(data=df, x=\"categoria\", y=\"valor\"), qual linha ajusta o título do gráfico usando o próprio matplotlib?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ax.set_title(\"Valor por categoria\")",
                                "isCorrect": true
                            },
                            {
                                "text": "ax.title(\"Valor por categoria\")",
                                "isCorrect": false
                            },
                            {
                                "text": "plt.set_title(\"Valor por categoria\")",
                                "isCorrect": false
                            },
                            {
                                "text": "fig.set_title(\"Valor por categoria\")",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer um histplot e um boxplot lado a lado, na mesma figura, aproveitando o plt.subplots() do Módulo 2. Qual combinação faz isso corretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "fig, eixos = plt.subplots(1, 2); sns.histplot(..., ax=eixos[0]); sns.boxplot(..., ax=eixos[1])",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.histplot(data=df, x=\"valor\"); sns.boxplot(data=df, x=\"categoria\", y=\"valor\"), em sequência",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.pairplot(df, vars=[\"valor\", \"categoria\"]), pra juntar os dois num só",
                                "isCorrect": false
                            },
                            {
                                "text": "plt.subplots(1, 2, hue=\"categoria\"), deixando o hue dividir os dois eixos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Análise exploratória (EDA) com visualização",
        "aulas": [
            {
                "titulo": "O que é EDA e o roteiro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é EDA e o roteiro\n\n**Análise exploratória de dados** (ou **EDA**, de *Exploratory Data Analysis*) é o processo de conhecer um conjunto de dados antes de tirar conclusões ou treinar qualquer modelo sobre ele. O termo foi popularizado pelo estatístico John Tukey, que defendia uma ideia simples: antes de testar hipóteses ou ajustar modelos, olhe para os dados de verdade, com tabelas, resumos e, principalmente, gráficos.\n\nVocê já deu os primeiros passos nas trilhas anteriores. Com **pandas**, aprendeu a carregar, limpar e agrupar dados. Com **estatística**, aprendeu a resumir uma variável (média, mediana, desvio padrão) e a reconhecer outliers pelo IQR. A EDA junta tudo isso com os gráficos que você vem aprendendo nos últimos módulos: o que uma tabela de `describe()` sugere, um histograma confirma (ou desmente) visualmente.\n\nPara praticar ao longo do módulo, vamos usar como exemplo um dataset de imóveis à venda, com colunas como área em metros quadrados, preço, idade do imóvel e a região do país."
                    },
                    {
                        "type": "text",
                        "value": "## O roteiro de uma EDA\n\nNão existe uma receita fixa, mas a maioria das análises exploratórias segue mais ou menos esta ordem:\n\n- **Entender a estrutura**: quantas linhas e colunas, o tipo de cada uma (numérica, categórica, data), o que cada coluna significa.\n- **Entender cada variável sozinha** (univariada): qual a distribuição, se há outliers, se as categorias estão balanceadas.\n- **Entender as relações entre variáveis** (bivariada e multivariada): se duas colunas caminham juntas, se uma categoria muda o comportamento de uma numérica.\n- **Caçar problemas**: valores faltantes, outliers que podem ser erro de digitação, duplicatas, inconsistências.\n- **Anotar padrões e hipóteses**: o que já dá pra concluir e o que ainda precisa de mais investigação (ou de um modelo).\n\nOs módulos anteriores desta trilha, sem que você percebesse, seguiram essa mesma ordem: primeiro os gráficos de uma variável (histograma, boxplot, countplot), depois os de duas variáveis (scatter, boxplot por categoria), depois a correlação entre várias de uma vez (heatmap, pairplot). Este módulo é o momento de usar tudo isso junto, com um objetivo claro: conhecer o dado antes de modelar ou apresentar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa da EDA\", \"Pergunta que responde\", \"Com pandas\", \"Com gráfico\"], [\"Estrutura\", \"Quantas linhas e colunas? Quais tipos?\", \"df.info(), df.shape\", \"(tabular, sem gráfico)\"], [\"Univariada\", \"Qual a distribuição de cada variável?\", \"df.describe(), value_counts()\", \"histplot, boxplot, countplot\"], [\"Bivariada\", \"Duas variáveis se relacionam?\", \"groupby()\", \"scatterplot, boxplot por categoria\"], [\"Multivariada\", \"Quais variáveis se movem juntas?\", \"df.corr()\", \"heatmap, pairplot\"], [\"Qualidade dos dados\", \"Tem valor faltante ou fora da curva?\", \"isna().sum(), quantis\", \"boxplot, histplot\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.read_csv(\"imoveis.csv\")\n\n# Estrutura: quantas linhas, colunas, e o tipo de cada uma\nprint(df.shape)\ndf.info()\n\n# Resumo estatístico das colunas numéricas\nprint(df.describe())\n\n# Quantos valores faltantes existem em cada coluna\nprint(df.isna().sum())"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Um primeiro vislumbre, antes de entrar a fundo na univariada\nsns.histplot(data=df, x=\"preco\")\nplt.title(\"Primeiro olhar: distribuição de preço\")\nplt.xlabel(\"Preço (R$)\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Por que os números não bastam\n\nO `describe()` devolve média, desvio padrão e quartis, mas não mostra a forma da distribuição. O histograma acima já adianta algo que nenhuma coluna do `describe()` sozinha entrega: se `preco` é simétrico, tem uma cauda longa de um lado, ou concentra valores em mais de um pico. Duas colunas podem ter a mesma média e o mesmo desvio padrão e ainda serem bem diferentes: foi esse o ponto do quarteto de Anscombe, no módulo 1 desta trilha, estatísticas praticamente iguais, gráficos completamente diferentes.\n\nEsse vaivém entre tabela e gráfico (olhar os números, depois confirmar ou derrubar com um gráfico) é o que as próximas quatro aulas vão praticar a fundo, começando pela análise univariada."
                    },
                    {
                        "type": "quote",
                        "value": "EDA não é uma etapa que se pula: é o tempo investido pra não modelar, nem apresentar, em cima de um dado que você ainda não entende."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a sigla EDA representa em ciência de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Exploratory Data Analysis, a análise exploratória que antecede a modelagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Estimated Data Accuracy, a métrica que mede a confiabilidade de um dataset.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extraction and Data Aggregation, o processo de juntar tabelas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Enhanced Data Architecture, o desenho otimizado de um banco de dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo o roteiro de uma EDA, qual etapa costuma vir primeiro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Entender a estrutura do dataset: linhas, colunas e o tipo de cada variável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Treinar um modelo preditivo para validar as hipóteses do time de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar o dashboard final com os gráficos já revisados pela liderança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular a correlação entre todas as variáveis numéricas do dataset.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dataset tem describe() com médias e desvios padrão praticamente iguais em duas colunas, mas os histogramas dessas colunas têm formatos bem diferentes. O que isso ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que estatísticas resumidas podem esconder a forma real da distribuição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o describe() do pandas tem um erro de cálculo nessas duas colunas específicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que as duas colunas precisam ser normalizadas antes de qualquer gráfico ser feito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o histograma está configurado com um número errado de bins para os dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual etapa da EDA faz mais sentido usar df.isna().sum()?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na caça a problemas, para contar valores faltantes em cada coluna.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na análise bivariada, para comparar duas variáveis numéricas ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na etapa de correlação, para montar o heatmap entre as colunas numéricas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na etapa de storytelling, para decidir qual gráfico apresentar ao público.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna numérica tem describe() com mínimo, mediana e máximo parecidos com os de uma distribuição normal, mas um histograma revela dois picos bem separados. Qual conclusão é mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A coluna provavelmente mistura dois grupos diferentes, e vale investigar antes de seguir.",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna está correta e pronta para uso, já que os quartis parecem normais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O histograma está enganando, porque os quartis são sempre a fonte mais confiável.",
                                "isCorrect": false
                            },
                            {
                                "text": "O describe() deveria ser descartado, já que gráficos substituem estatística resumida.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Análise univariada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Uma variável de cada vez\n\nA análise univariada olha para **uma coluna por vez**, sem se preocupar ainda com as outras. É o primeiro contato de verdade com os dados: antes de comparar categorias ou cruzar duas variáveis, você precisa saber como cada uma se comporta sozinha.\n\nO gráfico certo depende do tipo da variável:\n\n- **Numérica** (área, preço, idade do imóvel): histograma (`histplot`) para ver a forma da distribuição, boxplot (`boxplot`) para ver o resumo de cinco números e os outliers.\n- **Categórica** (região, tipo de imóvel): gráfico de contagem (`countplot`) para ver quantas observações caem em cada categoria.\n\nIsso já apareceu nos módulos 3 (matplotlib) e 4 (seaborn) desta trilha. Aqui a diferença é o objetivo: não é só saber plotar um histograma, é usar esse histograma como parte de um processo de investigação, no nosso exemplo, o dataset de imóveis."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\ndf = pd.read_csv(\"imoveis.csv\")\n\nfig, eixos = plt.subplots(1, 2, figsize=(10, 4))\n\nsns.histplot(data=df, x=\"preco\", kde=True, ax=eixos[0])\neixos[0].set_title(\"Distribuição de preço\")\n\nsns.boxplot(data=df, y=\"preco\", ax=eixos[1])\neixos[1].set_title(\"Boxplot de preço\")\n\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O que procurar num histograma e num boxplot\n\nAo olhar o histograma de uma variável numérica, preste atenção em três coisas:\n\n- **Formato**: é simétrico (parecido dos dois lados), ou assimétrico (cauda mais longa de um lado, o que os livros chamam de assimetria à direita ou à esquerda)?\n- **Modas**: tem um único pico (unimodal) ou mais de um pico (bimodal, multimodal)? Dois picos costumam indicar que a coluna mistura dois grupos diferentes.\n- **Outliers**: existem barras isoladas, bem longe do resto? O boxplot ao lado facilita essa leitura, porque desenha os pontos fora dos bigodes (o `1.5 * IQR` que você viu na trilha de estatística) como pontos individuais.\n\nUm histograma de `preco` concentrado à esquerda com uma cauda longa à direita é típico desse tipo de variável: a maioria dos imóveis tem preço baixo ou moderado, mas alguns bem caros esticam a distribuição. O boxplot mostra isso como uma caixa comprimida perto da base e vários pontos acima do bigode superior."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\nplt.figure(figsize=(6, 4))\nsns.countplot(data=df, x=\"regiao\", order=df[\"regiao\"].value_counts().index)\nplt.title(\"Quantidade de imóveis por região\")\nplt.xlabel(\"Região\")\nplt.ylabel(\"Contagem\")\nplt.xticks(rotation=45)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O que procurar num countplot\n\nO `countplot` é basicamente um histograma para variáveis categóricas: uma barra por categoria, com a altura mostrando quantas observações existem ali. Usar o parâmetro `order` (como no código acima) ordena as barras da categoria mais frequente para a menos frequente, o que deixa o desbalanceamento visível de cara.\n\nO que procurar:\n\n- **Categorias dominantes**: uma ou duas barras muito mais altas que as outras podem indicar concentração real nos dados, ou um valor padrão sendo usado com frequência demais.\n- **Categorias raras**: barras quase invisíveis podem ser erro de digitação (`\"Sao Paulo\"` e `\"São Paulo\"` como valores diferentes) ou casos legítimos, mas raros.\n- **Desbalanceamento**: se uma região domina o dataset, isso importa bastante quando essa coluna vira alvo de um modelo mais adiante, no estágio de Machine Learning."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de variável\", \"Gráfico\", \"O que observar\"], [\"Numérica\", \"histplot, boxplot\", \"Formato, moda(s), simetria, outliers\"], [\"Categórica\", \"countplot\", \"Categoria dominante, categorias raras, desbalanceamento\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de comparar duas variáveis, entenda cada uma sozinha: o histograma e o boxplot contam a história de uma coluna numérica, o countplot conta a de uma categórica."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual gráfico é mais indicado para ver a distribuição de uma variável numérica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Histograma, que agrupa os valores em faixas e mostra a frequência de cada uma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Countplot, que conta quantas vezes cada valor exato da coluna se repete.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de pizza, que mostra a proporção de cada valor numérico no total.",
                                "isCorrect": false
                            },
                            {
                                "text": "Scatter plot, que compara essa variável numérica com uma segunda coluna.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para uma variável categórica como região, qual gráfico mostra melhor quantas observações existem em cada categoria?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Countplot, uma barra por categoria com a contagem de observações.",
                                "isCorrect": true
                            },
                            {
                                "text": "Histograma, que agrupa as categorias em faixas contínuas de valor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Boxplot, que resume a categoria em quartis e desenha os outliers.",
                                "isCorrect": false
                            },
                            {
                                "text": "Scatter plot, que posiciona cada categoria num eixo numérico contínuo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O histograma de uma coluna idade mostra dois picos bem separados, um perto de 20 anos e outro perto de 60. O que esse formato bimodal sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a coluna provavelmente mistura dois grupos diferentes de pessoas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que os dados estão errados e o histograma precisa ser refeito do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a variável não é numérica e deveria virar uma coluna categórica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o número de bins do histograma está alto demais e precisa cair.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num countplot ordenado pela frequência, uma categoria aparece com uma barra quase invisível perto de outras muito altas. O que essa barra minúscula pode indicar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um valor raro legítimo, ou um erro de digitação que criou uma categoria a mais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro no countplot, que sempre distorce a altura da primeira barra da lista.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que essa categoria deveria ser removida do gráfico antes de qualquer análise.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a coluna categórica não tem relação nenhuma com o restante do dataset.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas colunas numéricas têm a mesma média, mas o boxplot de uma mostra uma caixa estreita com poucos pontos fora dos bigodes, e o da outra mostra uma caixa larga com vários pontos acima do bigode superior. O que essa diferença indica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A segunda variável tem mais dispersão e outliers, mesmo com média parecida.",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas variáveis são estatisticamente idênticas, já que a média é a mesma.",
                                "isCorrect": false
                            },
                            {
                                "text": "O boxplot da segunda variável foi construído com uma escala incorreta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A primeira variável tem outliers escondidos que o boxplot não conseguiu mostrar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Análise bivariada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas variáveis ao mesmo tempo\n\nDepois de olhar cada variável sozinha (a análise univariada da aula passada), o próximo passo é ver como elas se relacionam. É a análise bivariada: pegar duas colunas de cada vez e perguntar se uma parece influenciar, acompanhar ou não ter nada a ver com a outra.\n\nO gráfico certo depende dos tipos das duas variáveis envolvidas:\n\n- **Numérica x numérica**: gráfico de dispersão (`scatterplot`), pra ver se existe uma relação e que formato ela tem.\n- **Numérica x categórica**: boxplot separado por categoria, pra comparar a distribuição da numérica em cada grupo.\n- **Várias variáveis numéricas de uma vez**: `pairplot`, que monta uma grade com todos os pares de uma vez.\n\nVamos continuar com o dataset de imóveis: área, preço, idade do imóvel e região."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\ndf = pd.read_csv(\"imoveis.csv\")\n\nplt.figure(figsize=(6, 5))\nsns.scatterplot(data=df, x=\"area_m2\", y=\"preco\", hue=\"regiao\")\nplt.title(\"Preço do imóvel por área\")\nplt.xlabel(\"Área (m²)\")\nplt.ylabel(\"Preço (R$)\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O que procurar num scatter plot\n\nCada ponto do gráfico de dispersão é uma linha do DataFrame, posicionada pelo valor de `x` e de `y`. O que olhar:\n\n- **Direção**: os pontos sobem da esquerda pra direita (relação positiva, como área e preço), descem (relação negativa) ou formam uma nuvem sem direção clara (sem relação aparente)?\n- **Força**: os pontos formam quase uma linha reta (relação forte) ou uma nuvem espalhada com tendência fraca (relação fraca)?\n- **Formato**: a relação é linear (uma reta) ou curva (uma variável cresce muito mais rápido que a outra em algum trecho)?\n- **Grupos e outliers**: usar `hue` (como no código acima, colorindo por `regiao`) ajuda a ver se a relação muda entre grupos, e pontos isolados longe da nuvem principal são candidatos a outlier.\n\nUm scatter com pontos praticamente alinhados sugere uma correlação forte, algo que a próxima aula vai colocar em número com o `corr()`. Mas o gráfico já adianta esse resultado antes de qualquer cálculo."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\nplt.figure(figsize=(7, 5))\nsns.boxplot(data=df, x=\"regiao\", y=\"preco\")\nplt.title(\"Distribuição de preço por região\")\nplt.xlabel(\"Região\")\nplt.ylabel(\"Preço (R$)\")\nplt.xticks(rotation=45)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Comparando grupos, e vendo tudo de uma vez\n\nO boxplot por categoria coloca uma caixa lado a lado para cada grupo, o que facilita comparar mediana, dispersão e outliers entre eles. Se as caixas estão em alturas bem diferentes, a região parece influenciar o preço. Se estão bem parecidas, a região provavelmente não faz tanta diferença.\n\nEsse gráfico é a versão visual de um `groupby` que você já conhece do pandas: `df.groupby(\"regiao\")[\"preco\"].median()` devolve os mesmos números que o boxplot desenha, um por grupo. A diferença é que o boxplot mostra a distribuição inteira (incluindo outliers), não só um resumo em uma linha por grupo.\n\nQuando o dataset tem várias colunas numéricas e você quer uma visão geral de todas as relações de uma vez, sem montar um scatter pra cada par manualmente, existe o `pairplot` do seaborn: ele monta uma grade com um scatter para cada par de variáveis numéricas, e um histograma na diagonal, onde ficaria o scatter de uma variável com ela mesma."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\nsns.pairplot(df[[\"area_m2\", \"preco\", \"idade_imovel\", \"regiao\"]], hue=\"regiao\")\nplt.show()"
                    },
                    {
                        "type": "quote",
                        "value": "Uma variável sozinha conta uma história incompleta: é no cruzamento entre duas (ou mais) que aparecem as relações que interessam pra uma EDA."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual gráfico é o mais indicado para investigar a relação entre duas variáveis numéricas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Scatter plot, que posiciona cada observação pelos valores das duas variáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Countplot, que conta quantas observações existem em cada categoria distinta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Boxplot simples, que resume uma única variável numérica em cinco números.",
                                "isCorrect": false
                            },
                            {
                                "text": "Histograma, que agrupa uma variável numérica em faixas de frequência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para comparar a distribuição de uma variável numérica entre categorias diferentes, qual gráfico é mais indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Boxplot separado por categoria, com uma caixa lado a lado para cada grupo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Scatter plot entre a variável numérica e o índice das linhas do DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "Heatmap de correlação entre a variável numérica e ela mesma repetida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de pizza com uma fatia para cada valor da variável numérica.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num scatter plot de área x preço de imóveis, os pontos sobem da esquerda para a direita quase alinhados numa reta. O que isso sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma relação positiva e forte entre as duas variáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma relação negativa e forte entre as duas variáveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que não existe relação nenhuma entre as duas variáveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o gráfico foi construído com os eixos trocados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao comparar a mediana de preço por região (via groupby) com o boxplot de preço por região, qual é a principal vantagem do boxplot sobre a tabela de medianas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mostrar a distribuição inteira de cada grupo, incluindo dispersão e outliers.",
                                "isCorrect": true
                            },
                            {
                                "text": "Calcular a mediana de forma mais exata do que o groupby do pandas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar automaticamente os valores faltantes antes de qualquer cálculo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordenar as categorias em ordem alfabética antes de desenhar os grupos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pairplot com hue por região mostra, num dos pares de variáveis, nuvens de pontos bem separadas por cor, cada uma com uma inclinação diferente. O que essa configuração sugere?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A relação entre essas duas variáveis muda de acordo com a região.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pairplot está com um erro de configuração no parâmetro hue.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas variáveis não têm nenhuma relação, independente da região.",
                                "isCorrect": false
                            },
                            {
                                "text": "A região deveria ser removida do dataset antes de qualquer gráfico.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Correlação e heatmap",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Muitas variáveis, uma imagem só\n\nNa trilha de estatística você calculou a correlação de Pearson entre duas variáveis: um número entre -1 e 1 que resume o quanto elas caminham juntas linearmente. Repetir esse cálculo par a par, para um dataset com dez ou vinte colunas numéricas, é inviável de ler em forma de tabela. É aí que entra o **heatmap de correlação**: uma imagem colorida onde cada célula representa a correlação entre duas variáveis, e a cor substitui o número na hora de encontrar padrões rapidamente.\n\nO `pairplot` da aula passada já dava uma pista visual dessas relações, par a par. O heatmap resume a mesma informação de um jeito mais compacto: ótimo pra uma primeira varredura em busca de variáveis relacionadas, antes de aprofundar em scatters específicos."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\ndf = pd.read_csv(\"imoveis.csv\")\n\ncorrelacoes = df.corr(numeric_only=True)\nprint(correlacoes)\n\nplt.figure(figsize=(7, 6))\nsns.heatmap(correlacoes, annot=True, fmt=\".2f\", cmap=\"coolwarm\", vmin=-1, vmax=1)\nplt.title(\"Correlação entre variáveis numéricas\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Como ler um heatmap de correlação\n\nA matriz que `df.corr()` devolve é sempre quadrada e simétrica: a correlação entre `preco` e `area_m2` é a mesma nas duas direções, e a diagonal principal é sempre 1 (a correlação de uma variável com ela mesma). No heatmap:\n\n- **Cor**: com a paleta `\"coolwarm\"` do exemplo, tons de vermelho indicam correlação positiva (as duas sobem juntas), tons de azul indicam correlação negativa (uma sobe quando a outra desce), e tons próximos do branco indicam correlação perto de zero.\n- **Intensidade**: quanto mais forte a cor (mais vermelho ou mais azul), mais próxima de 1 ou -1 está a correlação, e mais forte é a relação linear.\n- **`annot=True`**: escreve o valor numérico dentro de cada célula, confirmando o que a cor já sugeriu, sem precisar adivinhar a tonalidade exata.\n- **`vmin=-1, vmax=1`**: fixa a escala de cor entre -1 e 1, garantindo que a mesma cor sempre signifique a mesma força de correlação, mesmo comparando heatmaps diferentes.\n\nDepois de achar a célula mais forte do heatmap, vale confirmar com um scatter, como na aula passada. No dataset de imóveis, `area_m2` e `preco` costumam ser o par com a correlação mais alta:"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\nsns.scatterplot(data=df, x=\"area_m2\", y=\"preco\")\nplt.title(\"Confirmando a correlação mais forte do heatmap\")\nplt.xlabel(\"Área (m²)\")\nplt.ylabel(\"Preço (R$)\")\nplt.show()"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Valor de r\", \"Força da relação linear\", \"Cor no coolwarm\"], [\"Próximo de 1\", \"Positiva forte\", \"Vermelho intenso\"], [\"Por volta de 0.3 a 0.5\", \"Positiva moderada\", \"Vermelho claro\"], [\"Próximo de 0\", \"Praticamente nenhuma\", \"Branco, neutro\"], [\"Por volta de -0.3 a -0.5\", \"Negativa moderada\", \"Azul claro\"], [\"Próximo de -1\", \"Negativa forte\", \"Azul intenso\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Correlação não é causalidade\n\nVale repetir aqui o que a trilha de estatística já alertou: uma correlação alta entre duas variáveis não prova que uma causa a outra. O heatmap só descreve o quanto duas colunas se movem juntas, sem dizer o motivo. Um exemplo clássico: em dados de cidades, o número de sorveterias e o número de afogamentos costumam ter correlação positiva, mas nenhum dos dois causa o outro. Existe uma terceira variável por trás, a temperatura: dias quentes aumentam a venda de sorvete e também o número de pessoas nadando, e junto com isso, o risco de afogamento.\n\nUma célula bem vermelha no heatmap é o começo de uma pergunta (por que essas duas variáveis se movem juntas?), não o fim de uma conclusão. Ela mostra onde vale a pena investigar mais, seja com um scatter, com conhecimento do negócio, ou eventualmente com um experimento controlado."
                    },
                    {
                        "type": "quote",
                        "value": "O heatmap aponta onde procurar relações. Não confunda o dedo com a coisa apontada: correlação é pista, não veredito sobre causa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que cada célula de um heatmap de correlação representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A correlação entre o par de variáveis correspondente à linha e à coluna.",
                                "isCorrect": true
                            },
                            {
                                "text": "A média aritmética simples das duas variáveis correspondentes à célula.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de valores faltantes nas duas variáveis daquela célula.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor máximo absoluto encontrado entre as duas colunas comparadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual função do seaborn é usada para desenhar um heatmap de correlação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "sns.heatmap(), aplicada sobre a matriz que df.corr() devolve.",
                                "isCorrect": true
                            },
                            {
                                "text": "sns.corrplot(), aplicada diretamente sobre o DataFrame original.",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.matrixplot(), aplicada sobre as colunas categóricas do DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "sns.pairplot(), aplicada sobre a matriz que df.corr() devolve.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num heatmap com a paleta coolwarm e escala fixada entre -1 e 1, uma célula aparece em azul bem intenso. O que essa cor indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma correlação negativa forte entre as duas variáveis daquela célula.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma correlação positiva forte entre as duas variáveis daquela célula.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor faltante que o pandas não conseguiu calcular naquela célula.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de leitura, já que azul não é usado em heatmap de correlação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a diagonal principal de um heatmap de df.corr() é sempre a cor mais intensa da escala positiva?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque toda variável tem correlação 1 consigo mesma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o pandas preenche a diagonal com o valor máximo do dataset.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o seaborn ignora a diagonal e usa uma cor fixa de destaque.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a diagonal soma a correlação de todas as outras variáveis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em dados de uma cidade, o número de sorveterias abertas e o número de afogamentos no mês têm correlação positiva forte no heatmap. Qual a leitura mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Provavelmente existe uma terceira variável, como a temperatura, por trás das duas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Abrir mais sorveterias claramente aumenta o número de afogamentos na cidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O heatmap está errado, já que essas duas variáveis nunca poderiam se relacionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Afogamentos fazem as pessoas comprarem mais sorvete, o que explica a correlação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um mini-EDA de ponta a ponta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Um mini-EDA, do carregamento ao insight\n\nChegou a hora de juntar tudo: pandas, estatística e os gráficos das últimas aulas, numa análise só, do início ao fim. Vamos usar um dataset fictício de pedidos de uma loja online, com estas colunas:\n\n- `categoria`: categoria do produto (Eletrônicos, Moda, Casa, Livros, Beleza).\n- `preco`: preço do produto, em reais.\n- `avaliacao`: nota média do produto, de 1 a 5.\n- `regiao`: região do Brasil de quem comprou.\n\nO objetivo não é produzir um relatório definitivo, é seguir o roteiro da aula 1 (estrutura, univariada, bivariada, correlação) até chegar a pelo menos um insight que valha a pena investigar mais a fundo."
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\n\ndf = pd.read_csv(\"pedidos.csv\")\n\n# Passo 1: estrutura\nprint(df.shape)\ndf.info()\nprint(df.describe())\nprint(df.isna().sum())"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Passo 2: univariada\nfig, eixos = plt.subplots(1, 2, figsize=(11, 4))\n\nsns.histplot(data=df, x=\"preco\", kde=True, ax=eixos[0])\neixos[0].set_title(\"Distribuição de preço\")\n\nsns.countplot(data=df, x=\"categoria\", order=df[\"categoria\"].value_counts().index, ax=eixos[1])\neixos[1].set_title(\"Pedidos por categoria\")\neixos[1].tick_params(axis=\"x\", rotation=45)\n\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Passo 3: bivariada e correlação\nplt.figure(figsize=(7, 5))\nsns.boxplot(data=df, x=\"categoria\", y=\"preco\")\nplt.title(\"Preço por categoria\")\nplt.xticks(rotation=45)\nplt.show()\n\ncorrelacoes = df.corr(numeric_only=True)\nplt.figure(figsize=(5, 4))\nsns.heatmap(correlacoes, annot=True, fmt=\".2f\", cmap=\"coolwarm\", vmin=-1, vmax=1)\nplt.title(\"Correlação entre variáveis numéricas\")\nplt.show()"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# Passo 4: combinar groupby com gráfico pra chegar num insight\navaliacao_por_categoria = df.groupby(\"categoria\")[\"avaliacao\"].mean().sort_values()\nprint(avaliacao_por_categoria)\n\navaliacao_por_categoria.plot(kind=\"barh\", figsize=(6, 4))\nplt.title(\"Avaliação média por categoria\")\nplt.xlabel(\"Avaliação média\")\nplt.ylabel(\"Categoria\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O que os gráficos revelaram\n\nJuntando as quatro etapas:\n\n- **Estrutura**: o `info()` e o `isna().sum()` mostram se sobrou algum valor faltante nas colunas antes de seguir em frente.\n- **Univariada**: o histograma de `preco` costuma aparecer com uma cauda longa à direita (alguns produtos bem mais caros puxando a distribuição), e o `countplot` de `categoria` mostra se os pedidos estão concentrados em poucas categorias ou bem distribuídos entre elas.\n- **Bivariada e correlação**: o boxplot de preço por categoria mostra se alguma categoria é sistematicamente mais cara que as outras, e o heatmap indica se `preco` e `avaliacao`, por exemplo, caminham juntos ou não têm relação linear nenhuma.\n- **Groupby + gráfico**: o gráfico de barras horizontais com a avaliação média por categoria, ordenado do menor para o maior, aponta rapidamente qual categoria tem a pior nota, por exemplo Eletrônicos, mesmo sendo, no boxplot anterior, uma das categorias mais caras.\n\nEsse é o tipo de achado que caracteriza um bom primeiro insight de EDA: categoria mais cara com avaliação mais baixa não é uma conclusão fechada (correlação não é causalidade), é uma pergunta melhor para investigar a seguir, seja olhando comentários, prazo de entrega, ou taxa de devolução daquela categoria."
                    },
                    {
                        "type": "quote",
                        "value": "Uma EDA de ponta a ponta não termina com uma resposta definitiva: termina com uma pergunta mais precisa do que a que você começou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num mini-EDA, qual costuma ser a primeira etapa antes de plotar qualquer gráfico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Olhar a estrutura do dataset com info(), describe() e a contagem de nulos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Calcular o heatmap de correlação entre todas as colunas numéricas primeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Treinar um modelo de machine learning para depois interpretar os gráficos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover todas as colunas categóricas antes de qualquer outra análise.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Que tipo de gráfico combina bem com um groupby para comparar uma média entre categorias?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um gráfico de barras, com uma barra para a média de cada categoria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um scatter plot, com um ponto para a média de cada categoria isolada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um heatmap, aplicado diretamente sobre o resultado do groupby.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um histograma, aplicado sobre o resultado numérico do groupby.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No mini-EDA, o histograma de preco mostra uma cauda longa à direita. O que fazer com essa informação, seguindo o roteiro da aula 1?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Anotar como padrão da distribuição e seguir investigando outras etapas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Excluir a coluna preco do dataset, já que a distribuição não é simétrica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Interromper a EDA, porque uma distribuição assimétrica invalida os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir todos os valores altos pela média antes de continuar a análise.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O boxplot mostra Eletrônicos como a categoria mais cara, e o gráfico de barras da avaliação média mostra Eletrônicos com a pior nota. Qual a conclusão mais adequada nesse ponto da EDA?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Vale investigar essa relação mais a fundo antes de afirmar uma causa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Preço alto claramente causa avaliação baixa nessa loja específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois gráficos têm um erro, já que preço e avaliação sempre andam juntos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A categoria Eletrônicos deve ser removida do catálogo imediatamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de plotar a avaliação média por categoria com um groupby seguido de gráfico de barras, qual seria o próximo passo mais coerente com o espírito de uma EDA?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Investigar por que a categoria com pior avaliação se comporta assim.",
                                "isCorrect": true
                            },
                            {
                                "text": "Encerrar a análise, já que o gráfico de barras já responde tudo sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar a coluna avaliacao, porque ela não é uma variável numérica útil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Refazer o mesmo gráfico com kind='pie', já que pizza é sempre mais claro.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Boas práticas e gráficos que enganam",
        "aulas": [
            {
                "titulo": "Princípios de um bom gráfico (data-ink ratio)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 6 - Boas práticas e gráficos que enganam\n\nVocê já sabe construir histograma, boxplot, scatter, barra, linha e heatmap de correlação. Já escolhe entre matplotlib e seaborn sem susto e já rodou uma EDA inteira, do carregar o dado ao primeiro insight. Falta uma peça: garantir que o gráfico que você mostra pra alguém diz a verdade, e diz ela de um jeito fácil de entender.\n\nEsse módulo tem duas metades. Nas duas primeiras aulas você aprende o que faz um gráfico ser **bom**: claro, focado na mensagem e honesto. Nas três seguintes você aprende a reconhecer, e a nunca cometer, os erros mais comuns que fazem um gráfico **enganar**, de propósito ou sem querer: eixo cortado, escala distorcida, 3D, pizza demais, recorte de intervalo e cor mal usada. Fechando, uma aula sobre acessibilidade: um gráfico que só funciona pra quem enxerga bem vermelho e verde já nasce excluindo parte de quem vai ler ele."
                    },
                    {
                        "type": "text",
                        "value": "## Os três pilares de um bom gráfico\n\nAntes de entrar em técnica, vale fixar o que você está tentando alcançar. Um bom gráfico busca três coisas ao mesmo tempo:\n\n- **Clareza**: quem olha entende o gráfico sem precisar de você do lado explicando. Eixos rotulados, título que ajuda, nada perdido no meio do caminho.\n- **Foco na mensagem**: todo gráfico existe pra responder uma pergunta ou defender um ponto. Um bom gráfico deixa essa mensagem óbvia; um gráfico ruim mostra dado demais e obriga quem olha a garimpar sozinho o que importa.\n- **Honestidade**: a impressão visual bate com o número real. Se uma barra é o dobro da outra, o valor por trás também precisa ser o dobro. Boa parte das próximas três aulas é sobre esse terceiro pilar: como ele quebra, e como não deixar quebrar."
                    },
                    {
                        "type": "text",
                        "value": "## Data-ink ratio: tirar o que não informa\n\nNa década de 1980, o estatístico Edward Tufte propôs uma régua simples pra avaliar um gráfico: a razão dado-tinta (data-ink ratio), a proporção da tinta (ou do pixel, hoje) usada pra representar dado de verdade sobre o total de tinta usada no gráfico inteiro: `tinta_que_representa_dado / tinta_total_do_grafico`.\n\nQuanto mais perto de 1, melhor: quase todo traço do gráfico carrega informação. Tufte batizou o excesso do lado errado dessa conta de **chartjunk** (algo como \"lixo gráfico\"): grade pesada demais, moldura completa em volta do gráfico, sombra, textura de fundo, efeito 3D num gráfico que é essencialmente 2D, legenda repetindo uma cor que já dava pra rotular direto na linha. Nenhum desses elementos ajuda a ler o dado, e cada um compete por atenção com o que realmente importa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento\",\"Informa dado real?\",\"Prática recomendada\"],[\"Grade (gridlines) pesada\",\"Não\",\"Deixar bem leve ou tirar quando os rótulos já bastam\"],[\"Moldura completa nas quatro bordas do gráfico\",\"Não\",\"Remover as bordas de cima e da direita (spines)\"],[\"Efeito 3D num gráfico essencialmente 2D\",\"Não\",\"Nunca usar: distorce a leitura de área e proporção\"],[\"Sombra e gradiente de preenchimento\",\"Não\",\"Remover, é só decoração\"],[\"Cor categórica com significado (uma cor por grupo)\",\"Sim\",\"Manter: ela carrega informação\"],[\"Rótulo de valor sobre a barra ou ponto\",\"Sim\",\"Manter: ajuda a ler o número exato\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\ncursos = [\"Python\", \"SQL\", \"Estatística\", \"Visualização\"]\nconcluintes = [420, 310, 260, 180]\n\n# versão cheia de chartjunk: grade pesada e nenhuma mensagem no título\nfig, ax = plt.subplots(figsize=(7, 4))\nax.bar(cursos, concluintes, color=\"steelblue\")\nax.set_title(\"Concluintes por curso\")\nax.grid(True, linewidth=1.5)\nplt.show()\n\n# versão com data-ink ratio mais alto: só o que ajuda a ler o dado fica\nfig, ax = plt.subplots(figsize=(7, 4))\nax.bar(cursos, concluintes, color=\"steelblue\")\nax.set_title(\"Python forma mais que o dobro de concluintes que Visualização\")\nax.set_ylabel(\"Concluintes em 2025\")\nax.spines[\"top\"].set_visible(False)\nax.spines[\"right\"].set_visible(False)\nax.grid(axis=\"y\", alpha=0.3)\nfor i, valor in enumerate(concluintes):\n    ax.text(i, valor + 8, str(valor), ha=\"center\", fontsize=9)\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo princípio, com um atalho do seaborn\n\nSe você já usa seaborn (Módulo 4), a limpeza de moldura tem uma função pronta: `sns.despine()` remove as bordas de cima e da direita dos eixos atuais, o mesmo efeito das duas linhas de `ax.spines[...].set_visible(False)` do exemplo acima. É um detalhe pequeno, mas some com metade do chartjunk mais comum numa linha só de código."
                    },
                    {
                        "type": "quote",
                        "value": "Todo traço do gráfico que não representa um dado é, por padrão, candidato a sair: a régua de Tufte não pede um gráfico pobre, pede um gráfico sem gordura."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a razão dado-tinta (data-ink ratio) de Tufte busca maximizar num gráfico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A parte da tinta do gráfico usada pra representar dado real",
                                "isCorrect": true
                            },
                            {
                                "text": "A quantidade de cores diferentes usadas num mesmo gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de efeitos decorativos, pra deixar o gráfico atraente",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho da fonte do título em relação ao resto da figura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Edward Tufte chamou de chartjunk o quê, num gráfico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Elementos visuais que não carregam nenhuma informação sobre o dado",
                                "isCorrect": true
                            },
                            {
                                "text": "Qualquer gráfico feito no matplotlib sem o estilo do seaborn",
                                "isCorrect": false
                            },
                            {
                                "text": "Cores usadas pra diferenciar categorias dentro do mesmo gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Rótulos de valor escritos em cima de cada barra do gráfico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de vendas mostra o dado certo, mas o gráfico feito a partir dela tem barras que exageram a diferença real entre categorias. Qual pilar de um bom gráfico esse problema quebra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Honestidade: a impressão visual não bate com o valor real",
                                "isCorrect": true
                            },
                            {
                                "text": "Clareza: os eixos do gráfico não estão rotulados",
                                "isCorrect": false
                            },
                            {
                                "text": "Foco na mensagem: o gráfico mistura tipos de gráfico diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos três: o problema está só na tabela de origem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a função `sns.despine()` faz, por padrão, num gráfico do seaborn?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Remove as bordas (spines) de cima e da direita dos eixos",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove todos os rótulos de eixo x e eixo y do gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Troca a paleta de cores padrão pra uma paleta sem gradiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga a grade (gridlines) e deixa o fundo do gráfico branco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista, tentando maximizar a razão dado-tinta, remove os rótulos dos eixos e o título do gráfico, deixando só as barras. O resultado desse gráfico é",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "pior: rótulo de eixo e título carregam informação, não são chartjunk",
                                "isCorrect": true
                            },
                            {
                                "text": "melhor: quanto menos tinta fora das barras, mais alta a razão dado-tinta",
                                "isCorrect": false
                            },
                            {
                                "text": "igual: a razão dado-tinta não considera texto, só formas geométricas",
                                "isCorrect": false
                            },
                            {
                                "text": "melhor: um gráfico sem texto nenhum é sempre mais fácil de ler",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escolher o gráfico certo e rotular bem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Escolher o gráfico certo e rotular bem\n\nLá no Módulo 1 você viu os cinco tipos de pergunta que um gráfico responde: distribuição, comparação, relação, composição e evolução. Isso já ajuda a escolher a família certa (histograma, barra, scatter, pizza ou linha, cada um do seu jeito). Mas escolher bem vai um passo além: dentro da família certa, o gráfico ainda precisa carregar a mensagem específica que você quer passar, não só o tipo de dado.\n\nPense numa frase como \"o Sudeste vendeu o dobro do Nordeste em 2025\". Um scatter, um heatmap ou até uma tabela cheia de números tecnicamente mostram esse dado, mas nenhum deles grita a mensagem tão rápido quanto duas barras lado a lado, uma visivelmente o dobro da outra. O gráfico certo não é só o que combina com o tipo de dado, é o que faz a mensagem saltar aos olhos sem esforço de quem olha."
                    },
                    {
                        "type": "text",
                        "value": "## O título que diz a conclusão\n\nO erro mais comum em título de gráfico é descrever o eixo em vez de entregar a mensagem. \"Vendas por região\" é um título descritivo: só repete o que já está escrito nos eixos, e obriga quem olha a estudar o gráfico inteiro pra descobrir a conclusão. Um título como \"Sudeste vende o dobro do Nordeste em 2025\" já entrega a conclusão de cara: quem só lê o título, sem olhar pro resto da figura, já sai sabendo o que importa.\n\nEssa técnica é comum em jornalismo de dados e em relatórios corporativos, e vale como regra prática: depois de pronto o gráfico, pergunte \"se alguém só ler o título, qual conclusão ela leva?\". Se a resposta for \"nenhuma\", o título ainda está descritivo demais."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Título fraco (descritivo)\",\"Título forte (diz a conclusão)\"],[\"Vendas por região\",\"Vendas por região em 2025\",\"Sudeste vende o dobro do Nordeste em 2025\"],[\"Evasão escolar ao longo dos anos\",\"Taxa de evasão, 2019 a 2024\",\"Evasão escolar caiu à metade desde a pandemia\"],[\"Tempo de resposta do suporte\",\"Tempo médio de resposta por mês\",\"Suporte responde três vezes mais rápido após a mudança de time\"],[\"Distribuição de idade dos alunos\",\"Histograma da idade dos alunos\",\"Metade dos alunos tem entre 22 e 28 anos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Eixos, unidades e legenda\n\nTítulo forte não substitui eixo bem rotulado, os dois trabalham juntos. Todo eixo numérico precisa dizer o que está medindo e em qual unidade: \"Vendas (R$ mil)\", \"Tempo de resposta (horas)\", \"Alunos aprovados (%)\". Um eixo só com números soltos, sem nome nem unidade, obriga quem olha a adivinhar ou a caçar essa informação em outro lugar do relatório.\n\nCom legenda, o cuidado é outro: ela é ótima quando há várias categorias e cores, mas obriga o olho a ir e voltar entre a cor na linha e o nome na legenda. Quando dá (poucas linhas, poucas categorias), rotular direto no fim de cada linha ou barra, com `ax.annotate()` ou `ax.text()`, poupa essa ida e volta e ainda funciona melhor pra quem tem dificuldade de distinguir cor, assunto da última aula deste módulo."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nregioes = [\"Sudeste\", \"Nordeste\", \"Sul\", \"Centro-Oeste\", \"Norte\"]\nvendas_mil = [820, 410, 350, 210, 140]\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.bar(regioes, vendas_mil, color=\"steelblue\")\n\n# título que já entrega a conclusão, não só descreve o eixo\nax.set_title(\"Sudeste vende o dobro do Nordeste em 2025\", fontsize=13, loc=\"left\")\nax.set_ylabel(\"Vendas (R$ mil)\")\nax.spines[\"top\"].set_visible(False)\nax.spines[\"right\"].set_visible(False)\nax.grid(axis=\"y\", alpha=0.3)\n\n# fonte da informação, um padrão de rodapé que dá credibilidade ao gráfico\nfig.text(0.01, -0.02, \"Fonte: relatório interno de vendas, 2025\", fontsize=8, color=\"gray\")\n\nplt.tight_layout()\nplt.savefig(\"vendas_por_regiao.png\", dpi=150, bbox_inches=\"tight\")\nplt.show()"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nanos = [2021, 2022, 2023, 2024, 2025]\npython_trilha = [120, 340, 610, 900, 1250]\nsql_trilha = [200, 380, 520, 640, 720]\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.plot(anos, python_trilha, marker=\"o\", color=\"steelblue\")\nax.plot(anos, sql_trilha, marker=\"o\", color=\"darkorange\")\n\n# rótulo direto no fim de cada linha, sem precisar de legenda\nax.annotate(\"Python\", xy=(anos[-1], python_trilha[-1]), xytext=(5, 0),\n            textcoords=\"offset points\", va=\"center\", color=\"steelblue\", fontweight=\"bold\")\nax.annotate(\"SQL\", xy=(anos[-1], sql_trilha[-1]), xytext=(5, 0),\n            textcoords=\"offset points\", va=\"center\", color=\"darkorange\", fontweight=\"bold\")\n\nax.set_title(\"Matrículas em Python cresceram mais rápido que em SQL\", loc=\"left\")\nax.set_ylabel(\"Matrículas\")\nax.spines[\"top\"].set_visible(False)\nax.spines[\"right\"].set_visible(False)\nplt.tight_layout()\nplt.show()"
                    },
                    {
                        "type": "quote",
                        "value": "Um bom título entrega a conclusão antes de quem olha precisar procurar ela; o resto do gráfico existe pra provar que o título está certo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo é um título de gráfico que já entrega a conclusão, em vez de só descrever o eixo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "\"Sudeste vende o dobro do Nordeste em 2025\"",
                                "isCorrect": true
                            },
                            {
                                "text": "\"Vendas por região, ano de 2025\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Gráfico de barras das vendas regionais\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Distribuição de vendas entre as cinco regiões\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um eixo numérico deve trazer a unidade junto com o nome, como em \"Tempo de resposta (horas)\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque sem unidade quem olha não sabe o que aquele número representa",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o matplotlib exige unidade pra desenhar a grade do eixo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque títulos sem unidade não passam na validação do seaborn",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque eixo sem unidade sempre começa a contagem fora do zero",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico de linha compara só duas categorias ao longo do tempo. Qual prática melhora a leitura, no lugar de uma legenda tradicional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rotular cada linha direto no ponto final dela, com `ax.annotate()`",
                                "isCorrect": true
                            },
                            {
                                "text": "Colocar as duas linhas em subplots separados, um pra cada",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a espessura das duas linhas pra ficarem mais visíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o gráfico de linha por um gráfico de pizza",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num gráfico pronto pra um relatório, qual é a função de uma linha pequena como \"Fonte: relatório interno de vendas, 2025\" no rodapé da figura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Indicar de onde vieram os dados, pra dar rastreabilidade ao gráfico",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir a necessidade de rotular os eixos do gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a razão dado-tinta, já que é mais texto na figura",
                                "isCorrect": false
                            },
                            {
                                "text": "Servir de título alternativo, caso o título principal falte",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de vendas quer um título que prove que a campanha funcionou, e propõe \"A campanha triplicou as vendas!\" antes mesmo de o analista olhar os números. Qual é o problema dessa prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O título nasce pronto, e o gráfico corre o risco de só confirmar ele",
                                "isCorrect": true
                            },
                            {
                                "text": "Título que afirma uma conclusão está sempre errado e deve ser evitado",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum problema: título forte é sempre melhor que título descritivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só de estética, não muda em nada a leitura do gráfico",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Enganos de escala: o eixo truncado e as escalas distorcidas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Enganos de escala: o eixo truncado e as escalas distorcidas\n\nA partir daqui o foco muda: em vez de como fazer um gráfico bom, as próximas duas aulas mostram como um gráfico engana, de propósito ou por descuido. O primeiro grupo de erros mexe na escala dos eixos, o jeito mais comum, e mais fácil de fazer sem perceber, de fazer uma diferença pequena parecer enorme, ou uma diferença enorme sumir."
                    },
                    {
                        "type": "text",
                        "value": "## Eixo y truncado: a barra que mente\n\nNum gráfico de barras, a altura da barra é a própria mensagem: o olho lê a proporção entre alturas como a proporção entre os valores. Uma barra duas vezes mais alta que a outra só faz sentido se o valor por trás também for o dobro, e isso só é verdade se o eixo começar em zero.\n\nTruncar o eixo y, por exemplo com `ax.set_ylim(bottom=90)`, quebra essa relação. Duas turmas com aprovação de 91% e 94%, que são quase iguais, podem ocupar alturas bem diferentes na tela se o eixo for de 90 a 100: visualmente parece uma diferença enorme, quando na real é de 3 pontos percentuais. Vale um detalhe a favor do matplotlib: por padrão, `ax.bar()` já ancora o eixo em zero sozinho (um recurso interno chamado sticky edges), então essa distorção quase sempre vem de alguém sobrescrever esse padrão de propósito, ou de outra ferramenta, como planilha eletrônica, que não protege o eixo do mesmo jeito. Ainda assim, a prática mais segura é forçar o zero de forma explícita, sem depender só do padrão da biblioteca."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nturmas = [\"Turma A\", \"Turma B\"]\naprovacao = [91, 94]\n\n# versão enganosa: eixo forçado a começar em 90, longe do zero\nfig, ax = plt.subplots(figsize=(5, 4))\nax.bar(turmas, aprovacao, color=\"steelblue\")\nax.set_ylim(90, 100)\nax.set_title(\"Eixo forçado a partir de 90: a diferença parece enorme\")\nplt.show()\n\n# versão honesta: eixo em zero de forma explícita, não só por padrão\nfig, ax = plt.subplots(figsize=(5, 4))\nax.bar(turmas, aprovacao, color=\"steelblue\")\nax.set_ylim(bottom=0)\nax.set_title(\"Com o eixo em zero, a diferença real aparece: é pequena\")\nfor i, valor in enumerate(aprovacao):\n    ax.text(i, valor + 1, f\"{valor}%\", ha=\"center\")\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Escalas distorcidas e a escala dupla enganosa\n\nTruncar o eixo é o erro mais famoso, mas não é o único jeito de distorcer escala. Um eixo logarítmico, por exemplo, é uma ferramenta legítima pra dado que varia em ordens de grandeza (população de cidades, número de casos numa epidemia), mas usado sem aviso (sem indicar \"escala log\" em algum lugar visível) faz um crescimento explosivo parecer suave, porque cada intervalo igual no eixo log representa uma multiplicação, não uma soma.\n\nOutro clássico é o eixo secundário, a escala dupla: colocar duas variáveis de naturezas diferentes no mesmo gráfico, cada uma com seu próprio eixo y. Isso já é delicado, porque quem olha tende a comparar as duas curvas como se estivessem na mesma escala. O problema fica sério quando as duas escalas são escolhidas, mesmo sem querer, de um jeito que faz as curvas se cruzarem ou parecerem andar juntas, sugerindo uma relação entre as duas variáveis que os números, numa escala só, não sustentam."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nmeses = [\"Jan\", \"Fev\", \"Mar\", \"Abr\", \"Mai\"]\ntemperatura = [24, 25, 23, 22, 21]\nvendas_sorvete = [980, 1050, 890, 860, 780]\n\nfig, ax1 = plt.subplots(figsize=(8, 5))\n\nax1.plot(meses, temperatura, color=\"darkorange\", marker=\"o\", label=\"Temperatura (°C)\")\nax1.set_ylabel(\"Temperatura (°C)\", color=\"darkorange\")\n\nax2 = ax1.twinx()  # segundo eixo y, compartilhando o mesmo eixo x\nax2.plot(meses, vendas_sorvete, color=\"steelblue\", marker=\"o\", label=\"Vendas de sorvete\")\nax2.set_ylabel(\"Vendas de sorvete (unidades)\", color=\"steelblue\")\n\nax1.set_title(\"Escala dupla: cuidado ao escolher o intervalo de cada eixo\")\nplt.tight_layout()\nplt.show()\n# aqui a relação até faz sentido (temperatura e venda de sorvete),\n# mas o intervalo de cada eixo foi escolhido pra fazer as curvas quase se sobreporem;\n# um pequeno ajuste no set_ylim de qualquer um dos dois muda a impressão inteira"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Erro\",\"Por que engana\",\"Como corrigir\"],[\"Eixo y truncado em gráfico de barra\",\"A altura da barra deixa de ser proporcional ao valor real\",\"Forçar ax.set_ylim(bottom=0) sempre que o gráfico for de barra\"],[\"Escala logarítmica sem aviso\",\"Cada intervalo igual representa uma multiplicação, o crescimento parece mais suave do que é\",\"Indicar \\\"escala log\\\" no eixo ou no título, ou usar escala linear\"],[\"Dois eixos y (escala dupla) mal calibrados\",\"O intervalo de cada eixo pode ser escolhido pra fazer curvas sem relação parecerem andar juntas\",\"Evitar quando possível; se usar, começar os dois eixos em zero\"],[\"Intervalos de tempo desiguais no eixo x\",\"Períodos maiores ocupam o mesmo espaço visual que períodos menores, distorcendo a tendência\",\"Manter o espaçamento do eixo proporcional ao tempo real entre os pontos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Numa barra, a altura é a mensagem: cortar a base do eixo é cortar a régua que o olho usa pra comparar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num gráfico de barras, por que o eixo y deveria, via de regra, começar em zero?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a altura da barra só é proporcional ao valor com eixo em zero",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o matplotlib recusa desenhar barras com eixo fora do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque começar em zero deixa qualquer gráfico visualmente mais bonito",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só gráfico de linha pode ter eixo fora do zero",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual código força o eixo y de um Axes a começar em zero, no matplotlib?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`ax.set_ylim(bottom=0)`",
                                "isCorrect": true
                            },
                            {
                                "text": "`ax.set_xlim(bottom=0)`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ax.grid(bottom=0)`",
                                "isCorrect": false
                            },
                            {
                                "text": "`ax.bar(bottom=0)`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico usa dois eixos y (`ax.twinx()`) pra comparar preço de um produto e número de reclamações. O que deve deixar quem lê em alerta, mesmo se os dois eixos estiverem rotulados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O intervalo de cada eixo pode exagerar a relação real entre as curvas",
                                "isCorrect": true
                            },
                            {
                                "text": "Eixo secundário nunca é válido, deveria sempre virar dois gráficos separados",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas curvas do gráfico estão em cores diferentes uma da outra",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas curvas foram desenhadas com o mesmo estilo de marcador",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico usa escala logarítmica no eixo y pra mostrar o crescimento de casos numa epidemia, mas não indica isso em lugar nenhum. Qual é o risco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quem olha lê o crescimento como mais suave do que é",
                                "isCorrect": true
                            },
                            {
                                "text": "O matplotlib calcula os valores da escala log de forma errada",
                                "isCorrect": false
                            },
                            {
                                "text": "Escala log só funciona com número negativo, o gráfico quebra",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum risco: escala log é sempre mais precisa que escala linear",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das situações abaixo usa uma escala fora do padrão, log ou eixo não começando em zero, de forma legítima, não enganosa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gráfico de linha com eixo log indicado, mostrando casos de uma doença",
                                "isCorrect": true
                            },
                            {
                                "text": "Gráfico de barras comparando dois produtos, com eixo y de 80 a 100",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de barras de vendas mensais, com eixo y começando em 500",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de barras de aprovação escolar, com eixo y de 70 a 90",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Enganos de forma: 3D, pizza e cherry-picking",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Enganos de forma: 3D, pizza e cherry-picking\n\nA escala distorce o eixo; esse segundo grupo de erros distorce a forma do gráfico ou o recorte do dado que ele mostra. São erros mais fáceis de perceber quando alguém aponta, mas continuam por aí porque parecem só estilo: um efeito 3D bonitinho, uma pizza colorida, um recorte de período que, sem querer (ou querendo), conta só metade da história.\n\n## 3D desnecessário e cor demais\n\nUm gráfico de barras ou de pizza é, por natureza, um desenho em duas dimensões: a informação está na altura da barra ou no ângulo da fatia. Adicionar profundidade 3D não acrescenta nenhum dado novo, só distorce a percepção: numa pizza em 3D, a fatia da frente parece maior que uma fatia igual do fundo, só por causa da perspectiva. Vale notar que o matplotlib nem oferece um gráfico de pizza em 3D pronto: quem quer esse efeito geralmente recorre a planilha eletrônica, o que já é um indício de que a comunidade de visualização de dados não recomenda o recurso.\n\nCor em excesso tem o mesmo problema por outro caminho: uma cor diferente pra cada categoria, sem nenhum critério, faz o olho gastar energia decifrando a legenda em vez de comparar os valores. Cor devia carregar informação (categoria, grupo, intensidade), não decorar."
                    },
                    {
                        "type": "text",
                        "value": "## Pizza com muitas fatias\n\nVocê já viu, lá no Módulo 3, que o gráfico de pizza quase sempre perde pra uma barra, porque o olho humano compara comprimento muito melhor do que ângulo. Esse problema piora rápido com o número de fatias: até três ou quatro categorias, uma pizza ainda dá pra ler; com dez ou mais, as fatias pequenas ficam praticamente do mesmo tamanho visual, as cores se confundem e a legenda vira uma lista maior que o próprio gráfico.\n\nA prática mais segura: usar pizza, se usar, só pra poucas categorias com diferença clara entre elas, e trocar por barra horizontal ordenada assim que o número de categorias passar de quatro ou cinco, ou quando várias fatias forem parecidas em tamanho."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# poucas categorias, tamanhos bem diferentes: pizza ainda funciona aqui\ncanais = [\"Orgânico\", \"Pago\", \"Indicação\"]\npercentual = [55, 30, 15]\n\nfig, ax = plt.subplots(figsize=(5, 5))\nax.pie(percentual, labels=canais, autopct=\"%1.0f%%\", startangle=90)\nax.set_title(\"Origem do tráfego do site\")\nplt.show()\n# com 3 fatias bem diferentes, a leitura ainda é rápida;\n# com 10 categorias miúdas, troque para um gráfico de barra horizontal ordenado"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport matplotlib.pyplot as plt\n\nvendas = pd.DataFrame({\n    \"data\": pd.date_range(\"2023-01-01\", periods=24, freq=\"ME\"),\n    \"valor_mil\": [300, 320, 310, 330, 340, 360, 380, 400, 420, 450, 470, 500,\n                  480, 460, 430, 410, 390, 370, 350, 330, 310, 290, 270, 250]\n})\n\nrecorte = vendas[vendas[\"data\"] >= \"2024-01-01\"]  # só o segundo ano, em queda\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4), sharey=True)\n\nax1.plot(vendas[\"data\"], vendas[\"valor_mil\"])\nax1.set_title(\"Série completa: sobe e depois cai\")\n\nax2.plot(recorte[\"data\"], recorte[\"valor_mil\"], color=\"crimson\")\nax2.set_title(\"Só o recorte de 2024: parece só queda\")\n\nplt.tight_layout()\nplt.show()\n# os dois gráficos vêm do mesmo DataFrame; o segundo, sozinho, conta uma história incompleta"
                    },
                    {
                        "type": "text",
                        "value": "## Agregação que esconde\n\nLembra do quarteto de Anscombe, lá no Módulo 1? Quatro conjuntos de dados com média, variância e correlação praticamente iguais, mas gráficos completamente diferentes. O mesmo risco aparece quando você agrega demais: um total ou uma média geral pode esconder que, por baixo, os grupos se comportam de jeitos opostos.\n\nUm exemplo clássico: o faturamento total de uma empresa cresce 5% no ano, uma boa notícia à primeira vista. Só que um `groupby(\"regiao\")`, aquele agrupamento que você aprendeu no módulo de pandas, revela que uma região cresceu 40% e outra caiu 20%, e o total agregado escondeu completamente esse segundo fato. Antes de confiar num número (ou num gráfico) agregado, vale abrir ele em subgrupos e conferir se a história de cada pedaço bate com a história do todo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Erro\",\"Por que engana\",\"Como corrigir\"],[\"Efeito 3D em barra ou pizza\",\"A perspectiva distorce a área percebida de cada fatia ou barra\",\"Manter o gráfico em 2D, sem profundidade artificial\"],[\"Pizza com muitas fatias (dez ou mais)\",\"O olho não distingue bem ângulos parecidos entre várias fatias pequenas\",\"Trocar por barra horizontal ordenada da maior pra menor categoria\"],[\"Cherry-picking do intervalo de tempo\",\"Um recorte específico pode mostrar só a parte que interessa contar\",\"Mostrar a série completa, ou justificar claramente por que recortar\"],[\"Agregação que esconde subgrupos\",\"Total ou média geral pode mascarar tendências opostas dentro dos grupos\",\"Abrir o dado por groupby antes de confiar só no total\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Recortar o intervalo certo do eixo x muda a história tanto quanto recortar a frase certa de uma entrevista: os dois casos saem do contexto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que um efeito 3D não ajuda a ler um gráfico de barras ou de pizza, que são naturalmente 2D?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a profundidade não representa dado, só distorce o tamanho",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o matplotlib não deixa salvar gráfico 3D em formato PNG",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um gráfico em 3D só serve pra mostrar três variáveis juntas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a cor de um gráfico em 3D sempre fica bem mais escura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A partir de quantas fatias, aproximadamente, um gráfico de pizza costuma ficar difícil de ler?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por volta de dez fatias, quando várias ficam parecidas em tamanho",
                                "isCorrect": true
                            },
                            {
                                "text": "A partir de duas fatias, pizza nunca deveria ter mais que isso",
                                "isCorrect": false
                            },
                            {
                                "text": "Só depois de cem fatias, antes disso a leitura é tranquila",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de fatias nunca atrapalha, só a cor de cada uma",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório mostra só os últimos três meses de uma série de vendas, que caíram nesse período, embora o ano inteiro tenha fechado em alta. Qual é o nome dessa prática enganosa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cherry-picking: mostrar o recorte que sustenta uma história",
                                "isCorrect": true
                            },
                            {
                                "text": "Data-ink ratio: reduzir a tinta do gráfico ao essencial",
                                "isCorrect": false
                            },
                            {
                                "text": "Eixo truncado: cortar a base do eixo y de uma barra",
                                "isCorrect": false
                            },
                            {
                                "text": "Escala dupla: usar dois eixos y calibrados de propósito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O faturamento total de uma empresa cresceu 5% no ano. Um `groupby(\"regiao\")` mostra que uma região cresceu 40% e outra caiu 20%. O que esse caso ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um total agregado pode esconder tendências opostas dentro dos grupos",
                                "isCorrect": true
                            },
                            {
                                "text": "O `groupby` sempre calcula a média, nunca o crescimento percentual",
                                "isCorrect": false
                            },
                            {
                                "text": "O total agregado está errado, o correto seria somar as duas taxas",
                                "isCorrect": false
                            },
                            {
                                "text": "Regiões diferentes nunca deveriam aparecer no mesmo relatório de vendas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Das situações abaixo, em qual o gráfico de pizza é a escolha mais defensável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Duas categorias, uma com 70% e outra com 30% do total",
                                "isCorrect": true
                            },
                            {
                                "text": "Doze categorias de produto, cada uma entre 2% e 15% do total",
                                "isCorrect": false
                            },
                            {
                                "text": "Cinco categorias que precisam ser comparadas com o ano anterior",
                                "isCorrect": false
                            },
                            {
                                "text": "Oito categorias de causa de chamado, com percentuais bem parecidos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Acessibilidade e ética em visualização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Acessibilidade e ética em visualização\n\nFechando o módulo, duas responsabilidades de quem faz gráfico. A primeira é técnica: garantir que o gráfico funcione pra quem enxerga cor de um jeito diferente do seu, o que muda a paleta que você escolhe. A segunda é uma postura: usar tudo que você aprendeu nas últimas aulas pra nunca enganar quem olha, e pra não ser enganado quando quem olha é você.\n\n## Daltonismo e paleta de cor segura\n\nDaltonismo, a dificuldade de distinguir certas cores, atinge cerca de 1 em cada 12 homens e 1 em cada 200 mulheres; a forma mais comum é a dificuldade de diferenciar vermelho e verde. Um gráfico que usa exatamente essas duas cores pra marcar \"bom\" e \"ruim\", ou \"aprovado\" e \"reprovado\", perde a informação pra uma fatia relevante de quem olha.\n\nA saída é escolher paletas pensadas pra isso. O seaborn já vem com uma pronta: `sns.color_palette(\"colorblind\")`, uma paleta qualitativa (uma cor por categoria) pensada pra continuar distinguível nos tipos mais comuns de daltonismo. Pra dado contínuo, um heatmap de correlação, por exemplo, prefira paletas sequenciais perceptualmente uniformes como `\"viridis\"` ou `\"cividis\"` (essa última desenhada especificamente pra leitura por daltônicos) no lugar de paletas como `\"jet\"`, que distorcem a percepção de quanto um valor é maior que outro."
                    },
                    {
                        "type": "code",
                        "value": "import seaborn as sns\nimport matplotlib.pyplot as plt\n\n# paleta qualitativa pensada pra continuar distinguível em tipos comuns de daltonismo\npaleta = sns.color_palette(\"colorblind\")\nprint(paleta.as_hex())  # lista de cores em hexadecimal, uma por categoria\n\nsns.set_palette(\"colorblind\")\n\ncursos = [\"Python\", \"SQL\", \"Estatística\", \"Visualização\"]\nconcluintes = [420, 310, 260, 180]\n\nfig, ax = plt.subplots(figsize=(7, 4))\nsns.barplot(x=cursos, y=concluintes, ax=ax)\nax.set_title(\"Concluintes por curso, com paleta segura pra daltonismo\")\nsns.despine()\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Redundância: cor não pode ser o único canal\n\nMesmo com paleta segura, a prática mais robusta é nunca deixar a cor como único jeito de diferenciar categoria. Reforçar com uma segunda pista (formato de marcador, estilo de linha, rótulo direto escrito ao lado do dado) garante que o gráfico ainda funcione impresso em preto e branco, numa tela mal calibrada ou pra quem não distingue bem aquela cor específica.\n\nO seaborn facilita essa redundância: em `sns.lineplot()` e `sns.scatterplot()`, o parâmetro `style` (junto com `hue`) faz uma mesma categoria variar de cor e de formato de marcador ou tracejado ao mesmo tempo, sem esforço extra."
                    },
                    {
                        "type": "code",
                        "value": "import seaborn as sns\nimport matplotlib.pyplot as plt\nimport pandas as pd\n\nnotas = pd.DataFrame({\n    \"mes\": [\"Jan\", \"Fev\", \"Mar\", \"Abr\", \"Jan\", \"Fev\", \"Mar\", \"Abr\"],\n    \"media\": [7.2, 7.5, 7.8, 8.0, 6.5, 6.4, 6.8, 7.0],\n    \"turma\": [\"A\", \"A\", \"A\", \"A\", \"B\", \"B\", \"B\", \"B\"]\n})\n\nfig, ax = plt.subplots(figsize=(7, 4))\nsns.lineplot(data=notas, x=\"mes\", y=\"media\", hue=\"turma\", style=\"turma\", markers=True, ax=ax)\nax.set_title(\"Turma A x Turma B: cor e formato de marcador juntos\")\nsns.despine()\nplt.show()\n# quem não distingue bem as duas cores ainda consegue ler pelo formato do marcador e do traço"
                    },
                    {
                        "type": "text",
                        "value": "## Ética: a responsabilidade de não enganar (nem ser enganado)\n\nTudo que as últimas aulas mostraram, eixo truncado, escala dupla, 3D, pizza com fatia demais, cherry-picking, pode acontecer por má-fé, mas acontece com muito mais frequência por descuido: o padrão automático de uma biblioteca, a pressa de fechar um relatório, a vontade de que o gráfico prove o que você já esperava ver. O resultado pra quem lê é o mesmo dos dois jeitos.\n\nAntes de publicar um gráfico, vale uma checagem rápida: o eixo de barra começa em zero? O título descreve a conclusão real, ou só o que eu queria que fosse a conclusão? Existe alguma cor carregando informação que some numa impressão em preto e branco? Essa mesma checagem funciona ao contrário, como leitor: todo gráfico que você encontra por aí, num relatório, numa notícia, numa rede social, merece as mesmas perguntas antes de você acreditar nele. Saber reconhecer um gráfico que engana é a base pra próxima etapa da trilha: contar histórias com dados que convencem sem distorcer."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\",\"Por que importa\"],[\"Eixo de barra começando em zero\",\"Mantém a altura da barra proporcional ao valor real\"],[\"Título que diz a conclusão\",\"Quem só lê o título já sai com a mensagem certa\"],[\"Paleta segura pra daltonismo (colorblind, viridis)\",\"Mantém o gráfico legível pra quem não distingue bem vermelho e verde\"],[\"Cor reforçada por uma segunda pista (formato, rótulo direto)\",\"Funciona mesmo em preto e branco ou numa tela mal calibrada\"],[\"Checar o próprio gráfico antes de publicar\",\"Evita enganar por descuido, não só por má intenção\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um gráfico bem feito não é só bonito ou claro: é honesto o bastante pra você confiar nele mesmo sem ver a tabela por trás."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual tipo de daltonismo é mais comum, e por isso mais importante evitar como único par de cores num gráfico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dificuldade de diferenciar vermelho e verde",
                                "isCorrect": true
                            },
                            {
                                "text": "Dificuldade de diferenciar azul e amarelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Dificuldade de diferenciar preto e branco",
                                "isCorrect": false
                            },
                            {
                                "text": "Dificuldade de enxergar qualquer cor, só tons de cinza",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual chamada de seaborn devolve uma paleta de cor pensada pra continuar distinguível pros tipos mais comuns de daltonismo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "`sns.color_palette(\"colorblind\")`",
                                "isCorrect": true
                            },
                            {
                                "text": "`sns.color_palette(\"pastel\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`sns.set_style(\"colorblind\")`",
                                "isCorrect": false
                            },
                            {
                                "text": "`sns.despine(colorblind=True)`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num `sns.lineplot()`, qual parâmetro faz uma categoria variar de formato de marcador ou tracejado, além da cor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`style`",
                                "isCorrect": true
                            },
                            {
                                "text": "`hue`",
                                "isCorrect": false
                            },
                            {
                                "text": "`markers`",
                                "isCorrect": false
                            },
                            {
                                "text": "`palette`",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico usa `hue` pra colorir duas linhas de turmas diferentes, sem mais nada. Por que reforçar com `style` (marcador ou tracejado) é uma boa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o gráfico continua legível mesmo sem depender só da cor",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o `hue` sozinho nunca funciona no `sns.lineplot()`",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `style` deixa o gráfico mais rápido de renderizar",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque duas linhas sem `style` sempre ficam com a mesma cor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de publicar um relatório, um analista percebe que o eixo y do gráfico de barras que fez começa em 200, não em zero, exagerando uma diferença pequena entre dois times. A opção mais alinhada com a postura ética discutida nessa aula é",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "ajustar o eixo pra começar em zero, mesmo perdendo o dramatismo",
                                "isCorrect": true
                            },
                            {
                                "text": "manter o eixo como está, já que os números exibidos continuam corretos",
                                "isCorrect": false
                            },
                            {
                                "text": "trocar pra um gráfico de pizza, que não tem esse problema de eixo",
                                "isCorrect": false
                            },
                            {
                                "text": "deixar como está e explicar a truncagem só se alguém perguntar depois",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Contar histórias com dados (data storytelling)",
        "aulas": [
            {
                "titulo": "O gráfico como argumento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 7 - Contar histórias com dados (data storytelling)\n\nVocê já sabe escolher o gráfico certo (Módulo 3), fazer ele bonito e estatisticamente correto com seaborn (Módulo 4), usar gráficos pra explorar uma base inteira (Módulo 5) e evitar os erros que enganam quem olha (Módulo 6). Falta uma peça: pegar tudo isso e transformar num argumento capaz de convencer alguém de algo. É isso que a área chama de **data storytelling**, e é o fechamento da trilha.\n\n## Dois tipos de gráfico, dois objetivos diferentes\n\nAté aqui, boa parte dos gráficos que você fez foram exploratórios: rápidos, muitos, feitos pra você mesmo entender os dados (o Módulo 5 inteiro foi sobre isso). Ninguém além de você precisa ver aquele histograma cru ou aquele pairplot com doze variáveis cruzadas. Mas quando o gráfico vai pra uma reunião, um relatório ou uma apresentação, ele muda de papel: deixa de ser uma ferramenta de investigação e vira um **argumento**. E todo argumento defende uma única tese."
                    },
                    {
                        "type": "text",
                        "value": "## Um gráfico, uma mensagem\n\nA regra prática é simples de enunciar e fácil de esquecer na hora de fazer: **todo gráfico de apresentação carrega uma mensagem central, e só uma**. Não é 'aqui está a receita mensal de cada região, tire suas conclusões'. É 'a região Sudeste puxou o crescimento do ano, e é por isso que vale investir mais lá'. O gráfico é o mesmo conjunto de barras ou linhas; o que muda é que agora ele nasce depois da conclusão, não antes.\n\nNa prática, isso inverte a ordem do trabalho. No gráfico exploratório, você olha os dados e só depois descobre o que eles dizem. No gráfico de apresentação, é o contrário: você já sabe o que quer provar (porque já explorou os dados antes) e desenha o gráfico que prova exatamente isso, sem sobrar nem faltar informação."
                    },
                    {
                        "type": "text",
                        "value": "## Comece pelo título, não pelo eixo\n\nA forma mais direta de forçar um gráfico a carregar uma mensagem é escrever o título como manchete de notícia, não como legenda de eixo. Um título como 'Vendas por mês em 2025' só descreve o que já está nos eixos, isso o leitor vê sozinho. Um título como 'As vendas dispararam no último trimestre de 2025' afirma uma conclusão, a mesma que o gráfico existe pra provar. É a diferença entre um título descritivo e um título-conclusão, e ela vale pra qualquer gráfico de apresentação, não só pra barras."
                    },
                    {
                        "type": "table",
                        "value": "[[\"gráfico\", \"título fraco (descritivo)\", \"título forte (a mensagem)\"], [\"Vendas por mês\", \"Vendas por mês em 2025\", \"As vendas dispararam no último trimestre\"], [\"Churn mensal\", \"Taxa de churn por mês\", \"Perdemos 1 em cada 5 clientes em março\"], [\"Tempo de resposta por time\", \"Tempo médio de resposta por time\", \"O time Sul demora o dobro dos outros pra responder\"], [\"Satisfação por canal\", \"Nota de satisfação por canal de atendimento\", \"O chat é o canal com pior satisfação do trimestre\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nmeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']\nvendas = [42, 45, 40, 47, 44, 46, 43, 45, 48, 58, 66, 74]\n\nfig, ax = plt.subplots(figsize=(9, 5))\nax.bar(meses, vendas, color='#4C72B0')\nax.set_ylabel('Vendas (mil unidades)')\n\n# título descritivo: só repete o que os eixos já mostram\nax.set_title('Vendas por mês em 2025')\nplt.savefig('vendas_titulo_fraco.png', dpi=150, bbox_inches='tight')\n\n# mesmo gráfico, agora com o título afirmando a conclusão\nax.set_title('As vendas dispararam no último trimestre de 2025', fontsize=13, fontweight='bold')\nplt.savefig('vendas_titulo_forte.png', dpi=150, bbox_inches='tight')\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O teste do 'e daí?'\n\nDepois de montar um gráfico de apresentação, vale rodar um teste rápido: olhar pra ele e perguntar 'e daí?'. Se você consegue responder numa frase só, e essa frase é basicamente o título, o gráfico está pronto. Se a resposta exige explicar o que cada linha ou cada cor significa antes de chegar à conclusão, ainda falta trabalho: ou tem informação demais, ou a mensagem ainda não está clara nem pra quem fez.\n\nIsso não quer dizer que o gráfico exploratório seja descartável, longe disso: ele continua sendo o jeito mais rápido de você entender uma base nova. A diferença é que ele fica com você, na sua análise. O que vai pra fora, pra convencer alguém, passa pelo teste do 'e daí'."
                    },
                    {
                        "type": "quote",
                        "value": "Um gráfico de apresentação tem um público, uma pergunta e uma resposta. Se ele não afirma nada, ainda é só um rascunho de EDA."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num gráfico de apresentação (pra convencer alguém de algo), qual desses títulos afirma melhor a conclusão que o gráfico prova?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Nordeste ultrapassa o Sul em receita no segundo semestre",
                                "isCorrect": true
                            },
                            {
                                "text": "Receita mensal por região ao longo do ano de 2025",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuição da receita entre as cinco regiões do país",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparação de receita mensal entre as cinco regiões",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Diferente de um gráfico exploratório, o que um gráfico de apresentação deve carregar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma mensagem central única, que o gráfico existe pra provar",
                                "isCorrect": true
                            },
                            {
                                "text": "O maior número possível de séries, pra parecer mais completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas as variáveis do DataFrame, cada uma numa cor diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "O código Python usado pra gerar o gráfico, como legenda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de pronto, qual pergunta funciona como teste pra saber se um gráfico de apresentação está focado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "'e daí?': dá pra resumir em uma frase o que o gráfico prova",
                                "isCorrect": true
                            },
                            {
                                "text": "'cabe mais uma cor?': quanto mais cores, melhor fica a leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "'quantas casas decimais tem o eixo?': mais precisão convence mais",
                                "isCorrect": false
                            },
                            {
                                "text": "'quantos tipos dá pra misturar aqui?': misturar ajuda a leitura",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois analistas fazem o mesmo gráfico de vendas por mês. Um usa o título 'Vendas por mês em 2025', o outro usa 'Vendas caem 30% depois de junho'. Qual dos dois segue a lógica de gráfico como argumento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O segundo, porque o título afirma a conclusão que o gráfico prova",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro, porque títulos neutros são sempre mais profissionais",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois, título não influencia a leitura de um gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois igualmente, já que o conteúdo do gráfico é o mesmo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa EDA, um analista gera quinze histogramas, um por coluna, só pra ele mesmo entender a base. Ao preparar a reunião com o cliente, o que fazer com eles?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Escolher só o gráfico que sustenta a mensagem da reunião, e refiná-lo",
                                "isCorrect": true
                            },
                            {
                                "text": "Levar os quinze histogramas exatamente como estão, pra mostrar o trabalho",
                                "isCorrect": false
                            },
                            {
                                "text": "Levar só o primeiro histograma gerado, na ordem em que foi criado",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir todos os histogramas por uma tabela de números, sem gráfico",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Conhecer o público",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Conhecer o público\n\nO mesmo dado, o mesmo DataFrame, a mesma análise pronta: dependendo de quem vai olhar o gráfico, o resultado final deveria ser diferente. Um cientista de dados que revisa seu trabalho aguenta (e quer) mais detalhe. Um diretor que tem cinco minutos entre duas reuniões quer a conclusão e nada além dela. O público geral, numa reportagem ou num post, precisa de uma comparação familiar, sem jargão nenhum. Antes de abrir o matplotlib, vale parar e perguntar: pra quem é esse gráfico?"
                    },
                    {
                        "type": "table",
                        "value": "[[\"público\", \"o que quer ver\", \"vocabulário\", \"gráfico mais indicado\"], [\"Diretoria / executivo\", \"a conclusão e o impacto no negócio, rápido\", \"direto, sem termos técnicos\", \"gráfico simples, com o número principal em destaque\"], [\"Colega técnico / analista\", \"o detalhe, a distribuição, a incerteza\", \"termos como outlier, IQR, correlação\", \"boxplot, scatter com hue, heatmap\"], [\"Público geral / imprensa\", \"uma comparação familiar, fácil de guardar\", \"nenhum jargão, números redondos\", \"barra ou linha simples, com anotação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Três públicos, três abordagens\n\nPra diretoria ou qualquer público executivo, o tempo é curto e a pergunta é sempre a mesma: e agora, o que eu faço com essa informação? Um único número em destaque, uma tendência clara, um título que já entrega a conclusão, isso basta. Detalhe técnico (intervalo de confiança, distribuição completa, p-valor) só atrapalha.\n\nPra um colega técnico (outro analista, um cientista de dados, alguém do time de engenharia), o inverso costuma valer: ele tem repertório pra interpretar um boxplot inteiro, uma dispersão com várias cores por `hue`, um heatmap de correlação. Esconder detalhe desse público tira informação que ele sabe usar.\n\nPro público geral (uma reportagem, um post, uma explicação pra alguém de fora da área), o cuidado é trocar o vocabulário técnico por linguagem do dia a dia: no lugar de 'outlier', 'um valor fora do padrão'; no lugar de 'mediana', 'o valor do meio'. O gráfico também costuma ficar mais simples: menos categorias, menos cores, uma comparação só."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\nchamados = pd.DataFrame({\n    'time': ['Norte'] * 8 + ['Sul'] * 8 + ['Sudeste'] * 8,\n    'tempo_resposta_min': [10, 11, 13, 12, 14, 9, 15, 12,\n                           30, 34, 38, 32, 45, 29, 36, 33,\n                           13, 15, 16, 14, 18, 12, 17, 15]\n})\n\n# versão pro colega técnico: distribuição completa, com outliers visíveis\nfig, ax = plt.subplots(figsize=(8, 5))\nsns.boxplot(data=chamados, x='time', y='tempo_resposta_min', ax=ax)\nax.set_title('Distribuição do tempo de resposta por time')\nax.set_ylabel('Tempo de resposta (min)')\nplt.show()\n\n# versão pra diretoria: só a média por time, sem jargão estatístico\nmedias = chamados.groupby('time')['tempo_resposta_min'].mean().sort_values()\nfig, ax = plt.subplots(figsize=(8, 5))\nax.bar(medias.index, medias.values, color='#55A868')\nax.set_title('O time Sul demora quase o triplo do Norte pra responder')\nax.set_ylabel('Tempo médio de resposta (min)')\nax.spines['top'].set_visible(False)\nax.spines['right'].set_visible(False)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Simplificar não é enganar\n\nVale um cuidado que conecta direto com o Módulo 6: adaptar um gráfico pra um público mais leigo significa cortar detalhe técnico e jargão, não distorcer o dado. O eixo continua começando em zero quando faz sentido, a escala continua linear, a categoria em destaque continua sendo a que realmente pesa mais. Simplificar é decidir o que tirar de informação; enganar é fazer o gráfico mentir pra parecer mais simples. São coisas bem diferentes, mesmo que o resultado visual pareça parecido à primeira vista."
                    },
                    {
                        "type": "quote",
                        "value": "O dado não muda de público pra público. O gráfico, sim."
                    }
                ],
                "questions": [
                    {
                        "statement": "Você vai apresentar a taxa de churn pra diretoria, com cinco minutos de reunião. Qual abordagem de gráfico é mais adequada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um gráfico simples, com o número principal em destaque",
                                "isCorrect": true
                            },
                            {
                                "text": "Um heatmap de correlação com todas as variáveis do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um pairplot cruzando todas as colunas numéricas da base",
                                "isCorrect": false
                            },
                            {
                                "text": "Um violinplot comparando a distribuição em oito segmentos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao apresentar um gráfico pro público geral, sem repertório técnico, qual prática é mais adequada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Trocar termos técnicos como 'outlier' por linguagem do dia a dia",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter todos os termos técnicos, pra manter a precisão da análise",
                                "isCorrect": false
                            },
                            {
                                "text": "Cortar o eixo Y pra começar acima de zero, deixando o gráfico mais limpo",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar o máximo de categorias possível, pra mostrar todo o dado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao apresentar uma análise pra outro cientista de dados do time, o que costuma ser aceitável, diferente de uma apresentação pra diretoria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mostrar a distribuição completa e mais de uma métrica de uma vez",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar todos os gráficos por uma única frase com a conclusão final",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover os eixos, já que o colega técnico já conhece a base",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar só gráfico de pizza, que concentra informação num espaço menor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você vai mostrar a evolução da receita pra diretoria, que tem pouco tempo e quer só a tendência geral. Qual abordagem funciona melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma linha simples, com anotação no ponto final indicando a tendência",
                                "isCorrect": true
                            },
                            {
                                "text": "Um pairplot cruzando receita com as outras dez variáveis da base",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela extensa com o valor exato de receita de cada dia do ano",
                                "isCorrect": false
                            },
                            {
                                "text": "Um heatmap de correlação entre receita e as variáveis do modelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Pra deixar um gráfico mais simples pro público geral, um analista corta o eixo Y pra começar em 40 em vez de zero, o que faz a diferença entre dois grupos parecer bem maior do que é. Essa prática é...",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Inválida: o eixo precisa refletir a proporção real, mesmo pro leigo",
                                "isCorrect": true
                            },
                            {
                                "text": "Válida, já que o público geral raramente repara no início do eixo",
                                "isCorrect": false
                            },
                            {
                                "text": "Válida, porque simplificar sempre exige cortar parte da escala",
                                "isCorrect": false
                            },
                            {
                                "text": "Inválida, mas só quando o gráfico é uma linha, e não uma barra",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Destacar o que importa: anotações e cor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Destacar o que importa\n\nCom a mensagem definida (Aula 1) e o público em mente (Aula 2), falta a parte visual: fazer o olho de quem olha ir direto pro que importa, sem precisar ler o gráfico inteiro pra entender a conclusão. As duas ferramentas mais diretas pra isso são a **anotação** (texto e seta apontando pra um ponto) e a **cor de destaque** (uma série colorida, o resto em cinza)."
                    },
                    {
                        "type": "text",
                        "value": "## Anotações: texto e seta\n\nO matplotlib tem uma função própria pra isso, `ax.annotate()`. Ela recebe o texto, a posição do ponto que você quer apontar (`xy`) e a posição onde o texto deve aparecer (`xytext`), com uma seta opcional (`arrowprops`) ligando os dois. É o recurso certo pra explicar um pico, uma queda ou uma virada que sozinha, sem contexto, o leitor não ia notar: 'queda por causa da greve', 'pico na Black Friday', 'mudança de método de coleta aqui'.\n\nQuando o ponto já fala por si (o topo de uma barra, por exemplo), às vezes basta `ax.text()`, que só escreve um texto solto numa posição, sem seta."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport pandas as pd\n\nreceita = pd.DataFrame({\n    'mes': list(range(1, 13)) * 3,\n    'regiao': ['Sudeste'] * 12 + ['Sul'] * 12 + ['Nordeste'] * 12,\n    'valor': [320, 330, 310, 340, 335, 345, 350, 360, 400, 430, 460, 480,\n              180, 175, 190, 185, 195, 200, 198, 205, 210, 215, 220, 225,\n              150, 155, 148, 160, 158, 162, 165, 170, 168, 172, 175, 178]\n})\n\nfig, ax = plt.subplots(figsize=(9, 5))\nfor regiao, cor, largura in [('Sudeste', '#C44E52', 2.5), ('Sul', 'lightgray', 1.5), ('Nordeste', 'lightgray', 1.5)]:\n    dados = receita[receita['regiao'] == regiao]\n    ax.plot(dados['mes'], dados['valor'], color=cor, linewidth=largura)\n\nax.annotate('crescimento forte no 2º semestre', xy=(12, 480), xytext=(6, 520),\n            arrowprops=dict(arrowstyle='->', color='#C44E52'), color='#C44E52')\nax.set_title('O Sudeste puxou o crescimento de receita em 2025')\nax.spines['top'].set_visible(False)\nax.spines['right'].set_visible(False)\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Cor de destaque, cinza no resto\n\nA outra ferramenta é a cor. Num gráfico com várias categorias (regiões, produtos, times), colorir todas com cores diferentes obriga o leitor a decorar uma legenda antes de entender qualquer coisa. Se a mensagem é sobre uma categoria só, o padrão mais eficaz é o oposto: uma cor de destaque na categoria que importa, e cinza (ou um tom neutro) em todas as outras. O olho vai direto pro que tem cor.\n\nEssa escolha também reduz ruído, a ideia de data-ink ratio do Módulo 6: grade de fundo, borda dos quatro lados (`spines`), legenda quando a cor e a anotação já bastam pra explicar, tudo isso que não carrega mensagem pode sair. Sobra só o que aponta pra conclusão."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nprodutos = ['A', 'B', 'C', 'D', 'E', 'F']\nreceita = [8, 10, 47, 9, 11, 13]\ncores = ['#4C72B0' if p == 'C' else 'lightgray' for p in produtos]\n\nfig, ax = plt.subplots(figsize=(8, 5))\nax.bar(produtos, receita, color=cores)\nax.text(2, 49, 'quase metade da receita total', ha='center', color='#4C72B0', fontweight='bold')\nax.set_title('O Produto C responde por quase metade da receita')\nax.set_yticks([])\nfor lado in ['top', 'right', 'left']:\n    ax.spines[lado].set_visible(False)\nplt.show()"
                    },
                    {
                        "type": "quote",
                        "value": "Cor e anotação não decoram o gráfico: apontam pra onde o olho de quem vê deve parar primeiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual técnica ajuda a guiar o olhar de quem vê o gráfico direto pro ponto que importa, sem precisar interpretar o eixo inteiro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma anotação (texto e seta) apontando pro ponto certo",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o tamanho da fonte de todos os rótulos",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar grade (grid) em todos os eixos do gráfico",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar uma paleta com o maior número possível de cores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa linha do tempo com oito categorias, mas a mensagem é só sobre uma delas, qual uso de cor ajuda mais?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Colorir só a categoria que importa e deixar as outras em cinza",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar uma cor diferente e vibrante pra cada uma das oito categorias",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar tons de cinza pra todas as oito categorias, sem exceção",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar a paleta padrão do seaborn, sem alterar nenhuma cor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual função do matplotlib desenha uma seta com texto apontando pra um ponto específico do gráfico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ax.annotate()",
                                "isCorrect": true
                            },
                            {
                                "text": "ax.legend()",
                                "isCorrect": false
                            },
                            {
                                "text": "ax.grid()",
                                "isCorrect": false
                            },
                            {
                                "text": "ax.set_title()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico de apresentação tem grade nos dois eixos, borda nos quatro lados e um degradê de fundo. Seguindo a ideia de data-ink ratio vista no módulo anterior, o que fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Remover a grade, as bordas desnecessárias e o degradê de fundo",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter tudo, já que mais elementos deixam o gráfico mais completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar ainda mais cores, pra compensar o excesso de grade",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o degradê por uma textura, mantendo grade e bordas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um gráfico de barras compara a receita de seis produtos. A mensagem é 'o Produto C responde por quase metade da receita'. Qual combinação comunica isso melhor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Barra do Produto C em cor de destaque, com o valor escrito acima dela",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas as seis barras em cores diferentes e vibrantes, sem nenhum rótulo",
                                "isCorrect": false
                            },
                            {
                                "text": "Barra do Produto C em cinza, e as demais em cores diferentes entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas as barras na mesma cor de destaque, com uma legenda grande",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Do exploratório ao explicativo (e dashboards)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do exploratório ao explicativo\n\nNo Módulo 5 você fez EDA: gerou gráfico atrás de gráfico, rápido, cru, só pra você mesmo enxergar distribuição, relação e outlier. Essa é a parte de baixo do iceberg, o trabalho que ninguém além de você precisa ver. Agora fecha o ciclo: pegar um desses gráficos crus e transformar num gráfico de apresentação, aplicando tudo que as três aulas anteriores ensinaram (mensagem única, público certo, destaque com anotação e cor)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"aspecto\", \"gráfico exploratório (EDA)\", \"gráfico explicativo (apresentação)\"], [\"objetivo\", \"você entender os dados\", \"convencer quem vê de uma conclusão\"], [\"quantidade\", \"muitos, um atrás do outro\", \"um ou poucos, escolhidos a dedo\"], [\"acabamento\", \"cru, cores e título padrão\", \"cor de destaque, título-conclusão, anotação\"], [\"público\", \"só você (ou o time técnico)\", \"quem vai decidir algo com base nele\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\nvendas = pd.DataFrame({\n    'categoria': ['Eletrônicos', 'Livros', 'Roupas', 'Papelaria', 'Alimentos'],\n    'receita': [48000, 9000, 21000, 7000, 15000]\n})\n\n# gráfico cru de EDA: rápido, só pra olhar a ordem de grandeza\nfig, ax = plt.subplots()\nsns.barplot(data=vendas, x='categoria', y='receita', ax=ax)\nplt.show()"
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\n# o mesmo dado, agora como gráfico de apresentação\nvendas_ordenada = vendas.sort_values('receita', ascending=False)\ncores = ['#4C72B0' if c == 'Eletrônicos' else 'lightgray' for c in vendas_ordenada['categoria']]\n\nfig, ax = plt.subplots(figsize=(9, 5))\nax.bar(vendas_ordenada['categoria'], vendas_ordenada['receita'], color=cores)\nax.annotate('R$ 48 mil', xy=(0, 48000), xytext=(0, 51000), ha='center', color='#4C72B0', fontweight='bold')\nax.set_title('Eletrônicos fatura mais que o dobro da segunda colocada, Roupas')\nax.set_yticks([])\nfor lado in ['top', 'right', 'left']:\n    ax.spines[lado].set_visible(False)\nplt.savefig('receita_por_categoria.png', dpi=150, bbox_inches='tight')\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## Dashboards: vários gráficos, um painel só\n\nNem toda comunicação de dado cabe num gráfico só. Quando o objetivo é acompanhar uma área ao longo do tempo (vendas, atendimento, operação), o formato comum é o **dashboard**: um painel que reúne vários gráficos relacionados, cada um respondendo uma pergunta diferente, todos visíveis de uma vez. É a mesma ideia do painel de um carro: velocímetro, combustível e temperatura juntos, porque você precisa dos três pra dirigir.\n\nProfissionalmente, dashboards costumam ser feitos em ferramentas com atualização automática e filtro interativo, como Power BI, Tableau ou Looker Studio (ou, em Python, bibliotecas como Streamlit ou Dash, essa última construída em cima do Plotly, a alternativa interativa ao matplotlib citada lá no Módulo 1). Mas a ideia visual de base, juntar vários gráficos relacionados numa grade, você já sabe fazer com o que aprendeu no Módulo 2: `plt.subplots()` com mais de uma linha e coluna."
                    },
                    {
                        "type": "code",
                        "value": "import matplotlib.pyplot as plt\n\nevolucao_meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']\nevolucao_receita = [42000, 45000, 43000, 47000, 51000, 58000]\ntop_categorias = vendas_ordenada['categoria'].head(3)\ntop_valores = vendas_ordenada['receita'].head(3)\ntempo_por_time = {'Norte': 18, 'Sul': 34, 'Sudeste': 15}\npedidos_por_dia = [12, 18, 22, 19, 25, 30, 28, 24, 20, 16]\n\nfig, axes = plt.subplots(2, 2, figsize=(12, 8))\n\naxes[0, 0].plot(evolucao_meses, evolucao_receita, color='#4C72B0', linewidth=2)\naxes[0, 0].set_title('Receita ao longo do semestre')\n\naxes[0, 1].bar(top_categorias, top_valores, color='#55A868')\naxes[0, 1].set_title('Top 3 categorias em receita')\n\naxes[1, 0].bar(list(tempo_por_time.keys()), list(tempo_por_time.values()), color='#C44E52')\naxes[1, 0].set_title('Tempo médio de resposta por time (min)')\n\naxes[1, 1].hist(pedidos_por_dia, bins=5, color='#8172B2')\naxes[1, 1].set_title('Distribuição de pedidos por dia')\n\nfig.suptitle('Painel mensal de vendas e atendimento', fontsize=14, fontweight='bold')\nplt.tight_layout()\nplt.savefig('dashboard.png', dpi=150, bbox_inches='tight')\nplt.show()"
                    },
                    {
                        "type": "quote",
                        "value": "Todo gráfico de apresentação já foi, em algum momento, um gráfico cru de EDA. A diferença é o trabalho que veio depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre um gráfico exploratório (feito durante a EDA) e um gráfico explicativo (de apresentação)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O exploratório é rápido, pra você mesmo entender; o explicativo comunica algo a outros",
                                "isCorrect": true
                            },
                            {
                                "text": "O exploratório usa sempre seaborn; o explicativo usa sempre matplotlib, nunca o contrário",
                                "isCorrect": false
                            },
                            {
                                "text": "O exploratório é sempre um gráfico de linha; o explicativo é sempre um gráfico de barras",
                                "isCorrect": false
                            },
                            {
                                "text": "O exploratório mostra os dados brutos; o explicativo mostra só a média de cada grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num fluxo típico de análise, em que ordem a exploração e o gráfico de apresentação costumam aparecer?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Primeiro exploratórios, depois um ou poucos explicativos",
                                "isCorrect": true
                            },
                            {
                                "text": "Primeiro o gráfico explicativo, depois a exploração pra confirmar",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois ao mesmo tempo, sempre no mesmo gráfico único",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o explicativo: a exploração é opcional numa análise completa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que melhor descreve a ideia de um dashboard, no sentido usado na aula?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um painel que reúne vários gráficos relacionados, pra acompanhar algo",
                                "isCorrect": true
                            },
                            {
                                "text": "Um único gráfico de pizza com o maior número possível de fatias",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela só com números resumidos, sem nenhum gráfico junto",
                                "isCorrect": false
                            },
                            {
                                "text": "Um gráfico 3D que gira sozinho pra mostrar mais dimensões de uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual função do matplotlib cria uma grade de vários gráficos (por exemplo, 2 linhas por 2 colunas) numa única figura, base de um dashboard simples?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "plt.subplots()",
                                "isCorrect": true
                            },
                            {
                                "text": "plt.grid()",
                                "isCorrect": false
                            },
                            {
                                "text": "plt.legend()",
                                "isCorrect": false
                            },
                            {
                                "text": "plt.annotate()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um histograma de EDA, feito rápido durante a exploração, tem título padrão, cores default e nenhuma anotação. Pra virar um gráfico de apresentação, o que fazer?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar o título por uma conclusão, destacar com cor e anotar o ponto-chave",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o título padrão, só aumentando o tamanho da fonte de todos os elementos",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar mais variáveis ao mesmo gráfico, pra ele ficar mais completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o histograma por um gráfico de pizza, que costuma ser mais chamativo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recap da trilha e o próximo passo: Machine Learning",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Fim da trilha, o que fica\n\nSeis módulos atrás, você olhava uma tabela de números e via só números. Hoje, na mesma tabela, você enxerga uma distribuição, encontra um outlier de cara, decide entre boxplot e histograma sem pensar duas vezes e sabe transformar tudo isso num gráfico que convence alguém de alguma coisa. Antes do próximo passo, vale o recap rápido do que cada módulo te deu."
                    },
                    {
                        "type": "table",
                        "value": "[[\"módulo\", \"o que você aprendeu\", \"ferramenta-chave\"], [\"1. Por que visualizar\", \"a estatística resume, o gráfico revela (o quarteto de Anscombe)\", \"distribuição, comparação, relação, composição, evolução\"], [\"2. matplotlib: a base\", \"a anatomia de uma figura e o primeiro gráfico\", \"Figure, Axes, plt.plot, plt.subplots\"], [\"3. Gráficos essenciais\", \"quando usar cada um (e por que fugir da pizza)\", \"hist, boxplot, scatter, bar, plot de linha\"], [\"4. seaborn\", \"gráfico estatístico bonito, direto do DataFrame\", \"histplot, boxplot, scatterplot com hue, heatmap\"], [\"5. EDA visual\", \"o fluxo de olhar distribuição, relação e correlação\", \"pairplot, heatmap de correlação, groupby + plot\"], [\"6. Boas práticas\", \"clareza, foco e honestidade (e os gráficos que enganam)\", \"eixo em zero, data-ink ratio, paleta acessível\"], [\"7. Storytelling\", \"o gráfico como argumento, pro público certo\", \"título-conclusão, anotação, cor de destaque\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\nvendas = pd.DataFrame({\n    'regiao': ['Sudeste', 'Sul', 'Nordeste', 'Norte', 'Centro-Oeste'] * 20,\n    'receita': [320, 210, 180, 95, 140] * 20\n})\n\nsns.histplot(data=vendas, x='receita')                                    # Módulo 5: EDA, olhar a distribuição\nplt.show()\n\nresumo = vendas.groupby('regiao')['receita'].sum().sort_values(ascending=False)  # pandas: agrupar e somar\n\ncores = ['#4C72B0' if r == resumo.index[0] else 'lightgray' for r in resumo.index]  # Módulo 7: cor de destaque\nfig, ax = plt.subplots(figsize=(9, 5))\nax.bar(resumo.index, resumo.values, color=cores)\nax.annotate('maior receita entre as cinco regiões', xy=(0, resumo.iloc[0]), xytext=(1, resumo.iloc[0] * 1.05),\n            arrowprops=dict(arrowstyle='->', color='#4C72B0'))             # Módulo 7: anotação\nax.set_title(f'{resumo.index[0]} lidera a receita entre as regiões')       # Módulo 7: título-conclusão\nax.spines['top'].set_visible(False)\nax.spines['right'].set_visible(False)\nplt.savefig('receita_regiao.png', dpi=150, bbox_inches='tight')           # Módulo 2: savefig\nplt.show()"
                    },
                    {
                        "type": "text",
                        "value": "## O que essa trilha te preparou pra fazer\n\nRepare no que o código acima juntou numa tela só: o `groupby` que você já sabia (da trilha de Análise de Dados), o `histplot` do Módulo 5 pra explorar a distribuição antes de decidir qualquer coisa, e o título-conclusão, a cor de destaque e a anotação dos Módulos 6 e 7 pra transformar o resultado num gráfico que se defende sozinho. Essa é a trilha inteira resumida numa sequência de poucas linhas: enxergar o dado, entender o que ele mostra, e comunicar isso sem enganar ninguém."
                    },
                    {
                        "type": "text",
                        "value": "## Próximo passo: Machine Learning\n\nA trilha de Análise de Dados te ensinou a limpar e organizar dados; esta trilha te ensinou a enxergá-los, distribuição, relação, correlação, outlier, a olho, num gráfico. O próximo estágio do roadmap de Ciência de Dados, **Machine Learning**, é onde esse olhar vira previsão: um scatter que mostra dois grupos bem separados é, no fundo, o mesmo problema que um modelo de classificação aprende a resolver sozinho; um heatmap de correlação que você já sabe ler é exatamente o tipo de informação usada pra escolher quais variáveis entram num modelo.\n\nE matplotlib e seaborn não ficam pra trás: seguem sendo as ferramentas usadas pra avaliar um modelo depois de treinado, no gráfico da curva de erro durante o treino, na matriz de confusão, na curva ROC. Você não larga o que aprendeu aqui: leva junto pro próximo estágio."
                    },
                    {
                        "type": "quote",
                        "value": "Você aprendeu a enxergar o dado. A próxima trilha ensina a fazer ele prever o que ainda não aconteceu."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual biblioteca, usada ao longo da trilha, faz visualização estatística com integração direta ao DataFrame do pandas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "seaborn",
                                "isCorrect": true
                            },
                            {
                                "text": "matplotlib",
                                "isCorrect": false
                            },
                            {
                                "text": "NumPy",
                                "isCorrect": false
                            },
                            {
                                "text": "scikit-learn",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de Visualização de Dados, qual é o próximo estágio do roadmap de Ciência de Dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Machine Learning",
                                "isCorrect": true
                            },
                            {
                                "text": "Estatística e Probabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Lógica de Programação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O quarteto de Anscombe, visto no Módulo 1 da trilha, mostrou que...",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "quatro conjuntos de dados têm as mesmas estatísticas, mas gráficos diferentes",
                                "isCorrect": true
                            },
                            {
                                "text": "a média sozinha já basta pra escolher entre um gráfico de barras e um histograma",
                                "isCorrect": false
                            },
                            {
                                "text": "todo dataset real se representa bem com um único tipo de gráfico, sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "quanto maior o dataset, menos necessário se torna visualizar os dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo o recap da trilha, que papel a visualização cumpre entre a Análise de Dados (pandas) e o Machine Learning?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ajuda a enxergar distribuição, correlação e outliers antes de treinar o modelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Substitui a limpeza de dados do pandas, tornando o pré-processamento desnecessário",
                                "isCorrect": false
                            },
                            {
                                "text": "Treina o modelo de machine learning diretamente a partir do gráfico gerado",
                                "isCorrect": false
                            },
                            {
                                "text": "Só é necessária depois que o modelo já está pronto, pra ilustrar o relatório",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de treinar um modelo de Machine Learning, quais recursos desta trilha continuam sendo usados, segundo o fechamento da aula?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "matplotlib e seaborn, agora em gráficos como matriz de confusão e curva ROC",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: a partir do Machine Learning, os gráficos são gerados sem código",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o seaborn, já que o matplotlib é substituído por completo nessa fase",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o pandas, já que gráfico deixa de ser necessário com um modelo treinado",
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
