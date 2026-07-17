// Seed da trilha Processamento com Spark (roadmap de Engenharia de Dados).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-spark.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Processamento com Spark";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Trilha de processamento distribuido do roadmap de Engenharia de Dados: processar dados em escala com o Apache Spark. Por que distribuir, a arquitetura do Spark (driver, executors, particoes, avaliacao lazy), RDDs e DataFrames, a API de DataFrame e Spark SQL com PySpark, o shuffle e o particionamento, otimizacao e tuning (cache, Catalyst, AQE, Spark UI) e o Spark na pratica de engenharia de dados. Assume base de Python, SQL e ETL, com foco em decisoes, performance e cenarios.";

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
        "titulo": "Módulo 1 - Por que processamento distribuído",
        "aulas": [
            {
                "titulo": "O limite de uma só máquina",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O limite de uma só máquina\n\nAté aqui, no caminho de Engenharia de Dados, todo processamento aconteceu numa máquina só: um script Python, uma consulta SQL, um job de ETL rodando num único servidor ou container. É a escolha certa enquanto o volume de dados cabe confortavelmente na memória e no tempo de CPU disponíveis ali, e vale guardar essa ideia para o resto da trilha: processamento distribuído resolve um problema de escala, não é um upgrade automático para qualquer pipeline. O limite aparece quando o dado cresce além do que uma máquina aguenta, uma tabela de bilhões de linhas, anos de histórico de eventos, um lote diário que passou de gigabytes para terabytes, e é esse limite que motiva tudo o que vem a seguir."
                    },
                    {
                        "type": "text",
                        "value": "## Dois limites diferentes: memória e CPU\n\nDizer que um dado \"não cabe\" numa máquina esconde duas restrições distintas, e a diferença importa porque a saída para cada uma não é a mesma. A primeira é memória: uma ferramenta como o pandas carrega o dado inteiro na RAM antes de processar qualquer coisa, e se o dataset for maior que a memória disponível o processo falha com um erro de falta de memória, sem terminar o trabalho. A segunda é tempo de CPU: o dado até cabe em disco e daria para processá-lo aos poucos, mas um processo de um núcleo só, ou de poucos núcleos, leva horas ou dias para varrer tudo, o que estoura o prazo do pipeline mesmo sem nenhum erro. Um job real pode esbarrar só num desses limites, ou nos dois ao mesmo tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Escalar verticalmente (scale up)\", \"Escalar horizontalmente (scale out)\"], [\"O que muda\", \"Mais CPU, memória e disco na mesma máquina\", \"Mais máquinas trabalhando juntas no mesmo processamento\"], [\"Teto prático\", \"O maior servidor disponível no mercado\", \"Cresce enquanto houver orçamento para novos nós\"], [\"Mudança na aplicação\", \"Nenhuma, o software nem percebe a troca\", \"Exige um motor que saiba dividir e coordenar o trabalho\"], [\"Ponto único de falha\", \"Sim, a máquina inteira\", \"Não, a perda de um nó não derruba o cluster inteiro\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Escalar verticalmente                          Escalar horizontalmente\n\n+------------------------+                     +--------+  +--------+  +--------+\n|       1 maquina        |                     |maquina1|  |maquina2|  |maquina3|\n|  CPU:  8 -> 16 -> 64    |     em vez de       | CPU: 8 |  | CPU: 8 |  | CPU: 8 |\n|  RAM: 32GB -> 512GB     |                     | RAM:32 |  | RAM:32 |  | RAM:32 |\n+------------------------+                     +--------+  +--------+  +--------+\n\nteto = o maior hardware que existe              teto = quantas maquinas o orcamento paga"
                    },
                    {
                        "type": "text",
                        "value": "## O custo de mover dados grandes\n\nExiste ainda um terceiro fator, ortogonal a memória e CPU: a rede. Um dataset de terabytes normalmente não está na própria máquina que vai processá-lo, está num data lake, num bucket de object storage ou num banco separado, e trazer esse volume inteiro pela rede até um único servidor consome tempo e banda antes mesmo da primeira linha ser processada. Um job que baixa 3 TB de um bucket para depois rodar em pandas pode gastar horas só na cópia, um custo que nem aparece como \"processamento\" mas domina o tempo total do job. É por isso que motores distribuídos preferem levar o processamento até onde o dado já está, em vez de centralizar o dado numa máquina só."
                    },
                    {
                        "type": "text",
                        "value": "## Onde isso leva\n\nOs dois caminhos possíveis a partir daqui já apareceram: comprar uma máquina maior (escalar verticalmente) ou dividir o trabalho entre várias máquinas menores (escalar horizontalmente). O primeiro caminho é simples, mas tem teto de hardware e custo crescente, além de continuar sendo um ponto único de falha. O segundo não tem um teto tão baixo, mas exige um jeito novo de pensar o processamento: como dividir o dado em pedaços, como distribuir esses pedaços entre máquinas, e como juntar os resultados de volta. É exatamente esse jeito novo de pensar, o paralelismo de dados, o assunto da próxima aula."
                    },
                    {
                        "type": "quote",
                        "value": "Escalar verticalmente compra tempo dentro do teto de uma máquina; escalar horizontalmente muda qual é o teto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença central entre escalar verticalmente e escalar horizontalmente um processamento de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Verticalmente aumenta os recursos de uma máquina só; horizontalmente soma várias máquinas ao trabalho",
                                "isCorrect": true
                            },
                            {
                                "text": "Verticalmente soma várias máquinas ao trabalho; horizontalmente aumenta os recursos de uma máquina só",
                                "isCorrect": false
                            },
                            {
                                "text": "Verticalmente reduz o tempo de rede; horizontalmente reduz apenas o uso de memória de cada máquina",
                                "isCorrect": false
                            },
                            {
                                "text": "Verticalmente muda o código da aplicação; horizontalmente roda sem qualquer alteração no pipeline",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline em pandas processa um arquivo de 200 GB numa máquina com 32 GB de RAM, e o processo é interrompido por um erro de falta de memória antes de terminar a leitura. Qual limite esse erro evidencia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O limite de CPU, porque o processo não tem núcleos suficientes para paralelizar a leitura do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite de memória, porque o pandas tenta carregar o arquivo inteiro na RAM antes de processar",
                                "isCorrect": true
                            },
                            {
                                "text": "O limite de rede, porque a transferência do arquivo do disco para a RAM excedeu a banda disponível",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite de disco, porque um arquivo de 200 GB não cabe no armazenamento local da máquina",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job precisa processar 3 TB armazenados num data lake. Em vez de copiar o arquivo inteiro para uma única máquina antes de processar, um motor distribuído prefere levar o processamento até onde o dado está. Por que essa escolha reduz o custo total do job?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque processar perto do dado elimina totalmente a necessidade de paralelismo entre máquinas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o armazenamento em data lake é sempre mais rápido que qualquer disco local de servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque evita gastar tempo e banda copiando um volume grande pela rede antes de processar",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque um data lake processa parte dos dados sozinho, antes mesmo do job distribuído começar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que seu job diário de agregação está lento e, a cada trimestre, aumenta o tamanho da máquina que roda o pandas: mais núcleos, mais RAM, um disco mais rápido. O tempo do job melhora a cada troca, mas cada vez menos, e o custo da instância já é o maior disponível na nuvem. Qual é a leitura mais precisa dessa situação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O time deveria trocar o disco por um SSD ainda mais rápido antes de considerar outra arquitetura",
                                "isCorrect": false
                            },
                            {
                                "text": "O job está mal escrito em pandas, e reescrevê-lo em SQL puro resolveria sem mudar de máquina",
                                "isCorrect": false
                            },
                            {
                                "text": "O ganho decrescente é normal, e o time deve seguir aumentando a máquina até o job acelerar de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "O time está no teto do escalonamento vertical e precisa migrar para um processamento distribuído",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que escalar verticalmente é considerado um ponto único de falha, mesmo depois de aumentar bastante os recursos da máquina?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque máquinas maiores têm taxa de falha de hardware mais alta que máquinas menores, por estatística",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque todo o processamento depende de uma única máquina, e a queda dela derruba o job inteiro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque uma máquina maior custa mais para ser substituída em caso de manutenção programada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sistemas operacionais modernos não lidam bem com servidores de muitos núcleos e muita RAM",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dividir para conquistar: paralelismo de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dividir para conquistar: paralelismo de dados\n\nA saída para o limite de uma máquina só é dividir o dado em pedaços menores e processar todos os pedaços ao mesmo tempo, em máquinas diferentes. Essa ideia, paralelismo de dados, é simples de enunciar mas exige responder três perguntas para funcionar de verdade: como dividir o dado sem que um pedaço dependa do outro, como coordenar o trabalho entre máquinas que não compartilham memória, e o que fazer quando uma dessas máquinas falha no meio do processamento. O modelo map-reduce, que nasceu no Google e mais tarde deu origem ao Hadoop MapReduce, foi a primeira resposta amplamente adotada para essas três perguntas, e suas ideias continuam vivas dentro do próprio Spark."
                    },
                    {
                        "type": "text",
                        "value": "## Map: aplicar a mesma função em paralelo\n\nA etapa de map aplica uma função a cada registro do dado de forma independente, sem que o processamento de um registro precise saber o que aconteceu com outro. Essa independência é o que permite paralelismo quase perfeito: se o dado está dividido em 100 partições, até 100 tarefas de map podem rodar ao mesmo tempo, cada uma numa máquina ou núcleo diferente, sem nenhuma comunicação entre elas. Num exemplo clássico de contagem de palavras, o map lê cada linha de texto e emite um par chave-valor para cada palavra encontrada, como (\"spark\", 1), sem ainda somar nada."
                    },
                    {
                        "type": "code",
                        "value": "Entrada dividida em particoes\n  [particao 0] [particao 1] [particao 2] ... [particao N]\n        |            |            |               |\n        v            v            v               v\n      MAP          MAP          MAP             MAP        (paralelo, sem comunicacao)\n        |            |            |               |\n        +----------- SHUFFLE (redistribui por chave) ------------+\n                             |\n              agrupa cada chave num so lugar\n                             v\n       REDUCE(chave A)   REDUCE(chave B)   REDUCE(chave C)   (paralelo, por chave)\n                             |\n                        resultado final"
                    },
                    {
                        "type": "text",
                        "value": "## Shuffle: a etapa que redistribui\n\nOs pares emitidos pelo map estão espalhados pelas máquinas que fizeram cada pedaço do trabalho, mas para somar os valores de uma mesma chave, como o total de vezes que \"spark\" apareceu, todos os pares dessa chave precisam chegar à mesma máquina. Essa redistribuição é o shuffle: dados são reorganizados e movidos pela rede entre as máquinas do cluster, agrupando cada chave num único destino. É a etapa mais cara do modelo, porque envolve tráfego de rede e, dependendo do volume, escrita e leitura em disco, enquanto map e reduce custam basicamente CPU local."
                    },
                    {
                        "type": "text",
                        "value": "## Reduce e tolerância a falha por reexecução\n\nCom cada chave já agrupada num único lugar, a etapa de reduce combina os valores dessa chave num resultado final, como somar todas as ocorrências de \"spark\" para chegar à contagem total, e roda em paralelo entre chaves diferentes, do mesmo jeito que o map rodou em paralelo entre partições. O último ingrediente do modelo é a tolerância a falha: como cada tarefa de map ou reduce é uma função determinística sobre um pedaço bem definido do dado, se uma máquina cai no meio do trabalho o framework não precisa refazer o job inteiro, só reexecuta a tarefa perdida em outra máquina, a partir do mesmo pedaço de entrada. É uma solução simples para um problema que, num cluster grande, é praticamente garantido acontecer todo dia."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"O que faz\", \"Custo típico\"], [\"Map\", \"Aplica uma função a cada registro, de forma independente\", \"Baixo, só CPU local, paralelo quase perfeito\"], [\"Shuffle\", \"Redistribui os dados pela rede, agrupando por chave\", \"Alto, envolve rede e, às vezes, disco\"], [\"Reduce\", \"Combina os valores de cada chave num resultado\", \"Baixo a médio, paralelo entre chaves diferentes\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O map roda livre porque cada registro é independente; o shuffle custa caro porque junta de novo o que estava espalhado."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo map-reduce, o que caracteriza a etapa de map?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela redistribui os pares chave-valor entre as máquinas do cluster, agrupando cada uma delas",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela combina os valores de uma mesma chave, produzindo o resultado final da agregação",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela aplica uma função a cada registro de forma independente, com paralelismo quase total",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela decide em quantas partições o dado de entrada será dividido antes do processamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o shuffle costuma ser a etapa mais cara do modelo map-reduce, em comparação com map e reduce?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o shuffle é a única etapa que exige que o cluster manager aloque núcleos adicionais",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o shuffle recalcula, do zero, todos os registros que o map já tinha processado antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o shuffle depende de uma única máquina central, enquanto map e reduce rodam em paralelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o shuffle move dados pela rede entre máquinas, enquanto map e reduce usam só CPU local",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Num job de contagem de palavras rodando em 50 partições, a etapa de map processa cada partição de forma totalmente independente. Qual é a consequência prática dessa independência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Até 50 tarefas de map podem rodar ao mesmo tempo, sem nenhuma máquina esperar o resultado de outra",
                                "isCorrect": true
                            },
                            {
                                "text": "As 50 tarefas de map precisam rodar em ordem, porque cada uma depende do resultado da anterior",
                                "isCorrect": false
                            },
                            {
                                "text": "Só uma tarefa de map roda por vez, e o paralelismo aparece apenas na etapa de reduce",
                                "isCorrect": false
                            },
                            {
                                "text": "As 50 partições são reunidas numa só antes do map começar, para simplificar a contagem",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante a etapa de reduce, a máquina responsável pela chave \"spark\" falha antes de terminar a soma dos valores dessa chave. Segundo o modelo de tolerância a falha por reexecução, o que o framework faz para se recuperar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reinicia o job inteiro do zero, incluindo as etapas de map e shuffle já concluídas com sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "Reexecuta só a tarefa de reduce daquela chave em outra máquina, a partir dos dados embaralhados",
                                "isCorrect": true
                            },
                            {
                                "text": "Marca a chave spark como perdida e entrega o resultado final do job sem os valores dessa chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Interrompe o cluster inteiro até um operador humano decidir manualmente como prosseguir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que torna possível, no modelo map-reduce, recuperar-se de uma falha reexecutando só a tarefa perdida, em vez do job inteiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O fato de todas as máquinas do cluster guardarem uma cópia completa do dataset inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "O fato de o shuffle salvar uma cópia do resultado final antes de qualquer tarefa começar",
                                "isCorrect": false
                            },
                            {
                                "text": "O fato de o cluster manager proibir a ocorrência de falhas durante a execução de um job",
                                "isCorrect": false
                            },
                            {
                                "text": "O fato de cada tarefa ser uma função determinística sobre um pedaço bem definido de entrada",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é o Apache Spark e por que ele ganhou",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é o Apache Spark e por que ele ganhou\n\nO Apache Spark é um motor de processamento distribuído de propósito geral: a mesma engine processa lotes gigantes de dados, responde consultas SQL, treina modelos de machine learning e consome streams contínuos, sempre dividindo o trabalho entre as máquinas de um cluster como visto nas aulas anteriores. Ele nasceu no AMPLab da UC Berkeley, em 2009, como resposta direta a uma limitação do Hadoop MapReduce, o motor dominante na época: entre uma etapa e outra, o MapReduce escreve o resultado intermediário em disco, e essa escrita e leitura repetida é cara justamente nos pipelines que mais precisam de velocidade, os iterativos. O Spark virou o padrão de fato do processamento distribuído porque atacou esse ponto de frente."
                    },
                    {
                        "type": "text",
                        "value": "## Processamento em memória\n\nA diferença central do Spark é manter os dados intermediários em memória entre uma etapa e outra do processamento, em vez de gravá-los em disco a cada passo. Isso não elimina o disco (o Spark grava em disco quando os dados não cabem na memória disponível, e lê a origem e grava o destino final normalmente), mas evita o vaivém constante entre etapas de um mesmo job. Para um pipeline com uma única passada pelo dado a diferença é pequena, mas para algoritmos iterativos, como treinar um modelo que varre o mesmo dataset dezenas de vezes, ou para pipelines com várias transformações encadeadas, a diferença de velocidade é enorme."
                    },
                    {
                        "type": "code",
                        "value": "MapReduce classico (disco entre etapas)\n\nEntrada -> MAP -> disco -> REDUCE -> disco -> MAP -> disco -> REDUCE -> disco -> Saida\n           (etapa 1)                          (etapa 2)\n\nSpark (memoria entre etapas)\n\nEntrada -> transformacao -> transformacao -> transformacao -> Saida\n           (tudo em memoria ate uma acao gravar o resultado ou faltar espaco)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Necessidade\", \"Antes do Spark\", \"Com o Spark\"], [\"Processamento em lote\", \"Hadoop MapReduce\", \"API de DataFrame / RDD\"], [\"Consultas parecidas com SQL\", \"Hive, traduzindo SQL para MapReduce\", \"Spark SQL\"], [\"Processamento de streams\", \"Motores separados, como o Storm\", \"Structured Streaming\"], [\"Machine learning distribuído\", \"Mahout, rodando sobre MapReduce\", \"MLlib\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Uma API para vários tipos de trabalho\n\nAntes do Spark, cada tipo de carga de trabalho, lote, consulta SQL, streaming, machine learning, tinha o seu próprio motor especializado, muitas vezes rodando sobre a mesma infraestrutura Hadoop mas com APIs e comportamentos diferentes entre si. O Spark unificou isso numa única engine: os mesmos conceitos de partição, transformação e ação valem para um job de lote, uma consulta Spark SQL ou um pipeline de MLlib, e boa parte do código de um se parece com o código do outro porque compartilham a mesma API de DataFrame. Isso reduz o número de ferramentas diferentes que um time de dados precisa dominar, operar e manter em produção."
                    },
                    {
                        "type": "text",
                        "value": "## Avaliação lazy, em uma frase\n\nUma peça final que ajuda a explicar a velocidade do Spark, e que volta com mais profundidade no próximo módulo, é a avaliação lazy: transformações como filtrar ou agrupar não executam nada no momento em que são escritas, elas só montam um plano, e é somente quando uma ação como contar ou gravar é chamada que o Spark olha o plano inteiro e decide a forma mais eficiente de executá-lo de uma vez."
                    },
                    {
                        "type": "quote",
                        "value": "O Spark não inventou o paralelismo de dados, ele trocou onde os dados ficam entre uma etapa e outra: do disco para a memória."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual definição descreve melhor o que é o Apache Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um sistema de armazenamento distribuído, alternativa ao HDFS e a serviços como o S3",
                                "isCorrect": false
                            },
                            {
                                "text": "Um motor de processamento distribuído de propósito geral, com processamento em memória",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma linguagem de programação criada especificamente para consultas SQL em cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "Um banco de dados relacional otimizado para cargas de trabalho analíticas em lote",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um algoritmo de machine learning treina um modelo varrendo o mesmo dataset 40 vezes seguidas, uma por iteração. Rodando em Spark, essa carga é bem mais rápida do que seria num Hadoop MapReduce clássico. Qual é o motivo principal dessa diferença?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Spark distribui o dataset entre mais máquinas do que o MapReduce consegue usar por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark reduz automaticamente o número de iterações necessárias para o modelo convergir",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark mantém o dataset em memória entre as iterações, sem regravar em disco a cada passada",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark converte o algoritmo de machine learning para SQL antes de distribuí-lo pelo cluster",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na prática, o que muda para um time de dados quando adota o Spark em vez de manter motores separados para lote, SQL, streaming e machine learning?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O time passa a precisar de um cluster dedicado e exclusivo para cada tipo de carga de trabalho",
                                "isCorrect": false
                            },
                            {
                                "text": "O time deixa de precisar de qualquer cluster, porque o Spark roda inteiro numa máquina só",
                                "isCorrect": false
                            },
                            {
                                "text": "O time perde a opção de rodar consultas SQL, já que o Spark é focado só em lote e streaming",
                                "isCorrect": false
                            },
                            {
                                "text": "O time passa a operar uma engine só, com uma API compartilhada entre os diferentes tipos de carga",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor escreve um pipeline com várias transformações encadeadas, select, filter, groupBy, e nota que nada parece rodar até a linha em que chama df.write(). O que explica esse comportamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Spark só monta o plano de execução nas transformações; a execução real começa na ação",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark executa cada transformação imediatamente, mas só mostra o resultado após o write",
                                "isCorrect": false
                            },
                            {
                                "text": "O select e o filter rodam na hora, e só o groupBy espera até a ação ser chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline está com erro de configuração, porque toda transformação deveria rodar de imediato",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dessas afirmações sobre o Apache Spark está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Spark exige que o dataset inteiro caiba na memória RAM do cluster, senão o job falha",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark processa exclusivamente dados que já estejam em memória, nunca lendo do disco",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark pode gravar dados em disco quando não há memória suficiente, sem falhar o job",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark substitui o cluster manager, decidindo sozinho em que máquina física cada nó está",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Spark x Hadoop MapReduce x pandas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Spark x Hadoop MapReduce x pandas\n\nCom os três nomes já apresentados, vale colocar lado a lado quando cada um é a escolha certa, porque a resposta não é \"o Spark é sempre melhor\". Os três resolvem processamento de dados, mas em pontos bem diferentes do espectro de escala, e usar a ferramenta errada para o tamanho do problema custa caro dos dois lados: tanto rodar pandas num dado que não cabe numa máquina quanto subir um cluster Spark para um CSV de alguns megabytes."
                    },
                    {
                        "type": "text",
                        "value": "## pandas: uma máquina, ótimo até caber na RAM\n\nO pandas roda inteiro numa única máquina, majoritariamente numa única thread, e carrega o dado em memória para trabalhar. Enquanto o dataset cabe confortavelmente na RAM disponível, o pandas é difícil de bater: não tem cluster para configurar, não tem shuffle, não tem latência de agendamento de tarefas, e a API é direta para exploração e prototipagem. O problema aparece exatamente no limite discutido na primeira aula deste módulo, quando o dado ultrapassa a memória ou o tempo de CPU de uma máquina só."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\", \"pandas\", \"Hadoop MapReduce\", \"Spark\"], [\"Onde roda\", \"Uma máquina só\", \"Cluster, disco entre etapas\", \"Cluster, memória entre etapas\"], [\"Melhor cenário\", \"Dado cabe na RAM disponível\", \"Lote grande, sem iteração\", \"Lote grande, com várias etapas ou iteração\"], [\"Overhead num dado pequeno\", \"Baixo\", \"Alto\", \"Alto\"], [\"Situação hoje\", \"Padrão para dado pequeno e médio\", \"Majoritariamente legado\", \"Padrão para processamento distribuído\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Hadoop MapReduce: robusto, verboso e majoritariamente legado\n\nO Hadoop MapReduce implementa o modelo map-reduce da aula anterior de forma direta, historicamente em Java, com bastante código de infraestrutura para escrever mesmo uma transformação simples, o que empurrou muita gente para camadas como o Hive, que traduzem SQL em jobs MapReduce por baixo. Ele continua rodando em ambientes legados, ainda mantidos por robustez e histórico, mas raramente é a escolha para um pipeline novo hoje: o Spark cobre o mesmo espaço de problema e sai na frente em quase todo cenário, exceto num, um lote gigante, de uma passada só, sem etapas intermediárias, onde a diferença de velocidade some."
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher cada um\n\nA decisão parte do tamanho do dado e do formato do problema, não de qual ferramenta é mais nova. O pandas continua sendo a escolha certa para análise exploratória, protótipos e ETLs pequenos ou médios que cabem numa máquina. O Spark entra quando o dado não cabe numa máquina só, quando o pipeline tem várias etapas encadeadas, ou quando é preciso usar a mesma engine para lote, SQL e streaming. O Hadoop MapReduce, hoje, aparece principalmente mantendo pipelines antigos ainda não migrados, raramente como escolha para algo novo."
                    },
                    {
                        "type": "code",
                        "value": "Pergunta de decisao\n\nO dado cabe confortavelmente na RAM de uma maquina?\n  sim -> pandas\n  nao -> continue\n\nO pipeline e uma unica passada, sem etapas iterativas, e ja roda em MapReduce?\n  sim -> manter (raramente vale migrar so por migrar)\n  nao, ou e um pipeline novo -> Spark\n\n# regra pratica: comecar simples, trocar de ferramenta quando o limite aparecer,\n# nao antes"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta certa não é qual motor é o melhor, é qual motor combina com o tamanho do problema que se tem agora."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica descreve melhor o pandas, em comparação com Spark e Hadoop MapReduce?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Roda distribuído por padrão, dividindo o dado automaticamente entre várias máquinas",
                                "isCorrect": false
                            },
                            {
                                "text": "Grava resultados intermediários em disco entre cada etapa do processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisa de um cluster manager, como YARN ou Kubernetes, para executar qualquer job",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda numa única máquina e carrega o dado inteiro em memória para processar",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um analista tem um CSV de 200 MB e roda, uma vez por dia, uma agregação simples nesse arquivo. O time decidiu subir um cluster Spark de 5 máquinas só para esse job. Qual é a avaliação mais precisa dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É overhead desnecessário: 200 MB cabe folgado na RAM de uma máquina, pandas resolveria mais simples",
                                "isCorrect": true
                            },
                            {
                                "text": "É a escolha certa: qualquer agregação diária deveria rodar num motor distribuído, por segurança",
                                "isCorrect": false
                            },
                            {
                                "text": "É a escolha certa, porque o Spark é sempre mais rápido que o pandas, independente do tamanho do dado",
                                "isCorrect": false
                            },
                            {
                                "text": "É overhead desnecessário: o certo seria usar Hadoop MapReduce, mais leve que o Spark para dados pequenos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline em pandas processava um dataset de 5 GB sem problemas, mas ao longo do ano o volume cresceu para 500 GB e o job passa a falhar com erro de memória, mesmo na maior máquina disponível na nuvem. Qual é o próximo passo mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reescrever o mesmo pipeline em Hadoop MapReduce, que lida melhor com dados desse tamanho que o Spark",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o pipeline para um motor distribuído como o Spark, já que o limite de uma máquina foi atingido",
                                "isCorrect": true
                            },
                            {
                                "text": "Dividir manualmente o arquivo de 500 GB em partes menores e rodar o mesmo script pandas em cada parte",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tamanho do arquivo de swap do sistema operacional até o pandas conseguir processar tudo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline legado em Hadoop MapReduce encadeia 6 jobs, cada um lendo o resultado do anterior direto do disco. O time quer reescrevê-lo em Spark para reduzir o tempo total de execução, mantendo a mesma lógica de transformação. Qual vantagem do Spark ataca diretamente esse gargalo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Spark distribui os 6 jobs entre mais máquinas do cluster do que o MapReduce permite por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark converte automaticamente os 6 jobs num único job SQL, eliminando etapas intermediárias",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark mantém os resultados intermediários em memória entre os passos, sem regravar em disco 6 vezes",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark executa os 6 jobs em paralelo entre si, mesmo quando um depende do resultado do anterior",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o uso atual do Hadoop MapReduce em times de engenharia de dados, qual afirmação é precisa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ainda aparece mantendo pipelines legados, mas raramente é escolhido para um pipeline novo hoje",
                                "isCorrect": true
                            },
                            {
                                "text": "Continua sendo, hoje, a escolha padrão para novos pipelines de streaming em tempo real",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda numa única máquina, sem exigir cluster algum, o que simplifica bastante toda a sua operação",
                                "isCorrect": false
                            },
                            {
                                "text": "Processa os dados majoritariamente em memória, de uma forma equivalente à do próprio Spark",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ecossistema Spark e onde ele roda",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O ecossistema Spark e onde ele roda\n\nTudo visto até aqui girou em torno do núcleo do Spark, a engine que distribui, planeja e executa transformações sobre dados em lote. Esse núcleo, o Spark Core, é a base sobre a qual vivem os demais componentes do ecossistema, cada um especializado num tipo de carga de trabalho, e é também a base que precisa rodar em algum lugar, um cluster próprio ou um serviço gerenciado por terceiros. Esta aula fecha o módulo com esse mapa: o que cada componente resolve e onde, fisicamente, tudo isso roda."
                    },
                    {
                        "type": "text",
                        "value": "## Os componentes do Spark\n\nSpark SQL é o componente que executa consultas estruturadas e é também o motor por trás da própria API de DataFrame, incluindo o otimizador que decide o plano de execução. Structured Streaming aplica o mesmo modelo de DataFrame a dados que chegam continuamente, tratando um stream como uma tabela que nunca para de crescer, processada em micro-lotes (o assunto ganha uma aula introdutória lá na frente, e aprofundamento numa trilha própria de streaming). MLlib é a biblioteca de machine learning distribuído, com algoritmos que operam sobre DataFrames em vez de exigir que o dado caiba numa máquina só. GraphX processa grafos, mas é construído sobre a API de RDD mais antiga e recebe hoje bem menos investimento que os outros três."
                    },
                    {
                        "type": "code",
                        "value": "API de DataFrame / SQL   (PySpark, Scala, Java, R, SQL)\n+-----------+-------------------+----------+---------+\n| Spark SQL | Structured        |  MLlib   | GraphX  |\n|           | Streaming         |          |         |\n+-----------+-------------------+----------+---------+\n|                   Spark Core                        |\n|      (agendamento, memoria, particoes, DAG)          |\n+-------------------------------------------------------+\n|   Standalone   |   YARN   |   Kubernetes  | gerenciado |\n+-------------------------------------------------------+\n     cluster manager proprio          servico que opera\n                                       o cluster manager"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\", \"Para que serve\", \"Abstração principal\"], [\"Spark SQL\", \"Consultas estruturadas e o motor da API de DataFrame\", \"DataFrame / tabela\"], [\"Structured Streaming\", \"Processar dados que chegam continuamente\", \"Stream tratado como tabela sem fim\"], [\"MLlib\", \"Treinar e aplicar modelos de machine learning distribuído\", \"DataFrame\"], [\"GraphX\", \"Processar grafos (nós e arestas) em paralelo\", \"RDD\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde o cluster roda\n\nO Spark precisa de um cluster manager para negociar CPU e memória entre driver e executors, e os três mais comuns, Standalone, YARN e Kubernetes, já apareceram no módulo anterior sobre a arquitetura do Spark. O que muda de perspectiva aqui é que cada vez menos times sobem e operam esse cluster à mão: existe um mercado de serviços gerenciados, como Databricks, Amazon EMR, Google Dataproc e AWS Glue, que cuidam do provisionamento e da operação do cluster por trás de uma interface mais simples. O funcionamento interno, driver, executors, jobs, stages, é o mesmo independentemente de quem administra a infraestrutura por baixo (o módulo final desta trilha volta a esse tema com mais profundidade operacional)."
                    },
                    {
                        "type": "text",
                        "value": "## PySpark, Scala e SQL: a mesma engine, portas diferentes\n\nO Spark é escrito em Scala e roda sobre a JVM, o que faz do Scala a linguagem nativa da engine, mas não a única forma de usá-la: PySpark expõe a mesma API de DataFrame para Python, e é o caminho natural para quem já vem dessa linguagem, como é o caso nesta trilha. Para código que usa a API de DataFrame e Spark SQL, a diferença de desempenho entre PySpark e Scala é pequena, porque as duas linguagens só descrevem o mesmo plano, que o Catalyst otimiza e executa igual, na JVM, nos dois casos. A diferença aparece principalmente em código que foge desse plano, como uma função definida pelo usuário em Python, que precisa cruzar a fronteira entre o processo Python e a JVM a cada chamada (assunto retomado com mais detalhe quando UDFs entrarem em cena)."
                    },
                    {
                        "type": "quote",
                        "value": "PySpark, Scala e SQL descrevem o mesmo plano para a mesma engine; a escolha entre eles é sobre o time, não sobre desempenho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual componente do ecossistema Spark é voltado a treinar e aplicar modelos de machine learning de forma distribuída?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "MLlib, a biblioteca que aplica algoritmos de machine learning sobre DataFrames distribuídos",
                                "isCorrect": true
                            },
                            {
                                "text": "GraphX, o componente que processa grafos de nós e arestas construído sobre a API de RDD",
                                "isCorrect": false
                            },
                            {
                                "text": "Structured Streaming, o componente que trata dados que chegam continuamente como uma tabela",
                                "isCorrect": false
                            },
                            {
                                "text": "Spark SQL, o motor que executa consultas estruturadas e serve de base à API de DataFrame",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time já opera Spark SQL para consultas em lote e agora precisa processar um feed de eventos que chega continuamente, sem reescrever a lógica de transformação do zero. Qual componente do ecossistema resolve esse cenário, reaproveitando a mesma API de DataFrame?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "GraphX, adaptando as transformações de DataFrame existentes para um modelo de grafos",
                                "isCorrect": false
                            },
                            {
                                "text": "MLlib, aplicando o modelo de machine learning já treinado sobre cada evento recebido",
                                "isCorrect": false
                            },
                            {
                                "text": "Structured Streaming, tratando o feed contínuo como uma tabela que nunca para de crescer",
                                "isCorrect": true
                            },
                            {
                                "text": "Spark Core, reexecutando as mesmas transformações de lote direto sobre RDDs a cada evento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer rodar Spark sem contratar ninguém para provisionar, atualizar e operar servidores de cluster, preferindo pagar por um serviço que já entregue isso pronto. Qual caminho atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Subir um cluster Standalone, o cluster manager mais simples de configurar entre os três",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar todo o processamento para rodar direto na máquina local de um desenvolvedor",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um cluster Kubernetes próprio, gerenciado inteiramente pelo time de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Contratar um serviço gerenciado, como Databricks, EMR, Dataproc ou Glue, que opera o cluster",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline usa só a API de DataFrame e Spark SQL, sem nenhuma função definida pelo usuário (UDF). Um engenheiro sugere reescrevê-lo de PySpark para Scala, esperando um ganho relevante de desempenho. O que é mais preciso dizer sobre essa expectativa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O ganho será grande, porque Scala roda nativamente na JVM e o PySpark sempre roda mais lento",
                                "isCorrect": false
                            },
                            {
                                "text": "O ganho tende a ser pequeno, porque as duas linguagens descrevem o mesmo plano otimizado pelo Catalyst",
                                "isCorrect": true
                            },
                            {
                                "text": "O ganho será grande, porque só o Scala tem acesso ao otimizador Catalyst durante a execução",
                                "isCorrect": false
                            },
                            {
                                "text": "O ganho tende a ser pequeno, porque o PySpark converte o código para Scala antes de cada execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o componente GraphX no ecossistema Spark, qual afirmação é precisa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É o componente mais usado atualmente para processar grafos, com investimento maior que o MLlib recebe",
                                "isCorrect": false
                            },
                            {
                                "text": "Foi descontinuado nas versões mais recentes do Spark 3.x e não deve mais ser usado em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "É construído sobre a API de RDD, mais antiga, e recebe hoje menos investimento que os demais componentes",
                                "isCorrect": true
                            },
                            {
                                "text": "Substitui o Spark SQL nos casos em que os dados estruturados envolvem relacionamentos entre tabelas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - A arquitetura do Spark",
        "aulas": [
            {
                "titulo": "Driver, executors e cluster manager",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Driver, executors e cluster manager\n\nTodo job Spark roda sobre um conjunto de processos distribuídos em uma ou mais máquinas. Entender o papel de cada peça, o driver, os executors e o cluster manager, é o primeiro passo para ler um erro no Spark UI, dimensionar um cluster ou explicar por que um job está lento.\n\nEsses três papéis existem independente de onde o Spark roda: um notebook local, um cluster EMR, um cluster Kubernetes ou o Databricks. Muda a infraestrutura por baixo, não os papéis."
                    },
                    {
                        "type": "text",
                        "value": "## O driver\n\nO driver é o processo que roda o `main()` da aplicação Spark, o código que cria a `SparkSession`, encadeia as transformações e chama as ações. É o driver quem:\n\n- Converte o código do usuário num DAG de operações.\n- Divide esse DAG em jobs, stages e tasks (assunto da próxima aula).\n- Negocia recursos com o cluster manager e envia as tasks para os executors.\n- Recebe de volta os resultados de ações como `collect()` e `count()`.\n\nO driver roda num único processo. Se ele cair, a aplicação inteira cai, mesmo que todos os executors continuem de pé."
                    },
                    {
                        "type": "text",
                        "value": "## Os executors\n\nOs executors são processos JVM que rodam nos nós do cluster e fazem o trabalho pesado: executam as tasks enviadas pelo driver e guardam dados em memória ou disco quando um DataFrame é persistido com `cache()` ou `persist()`.\n\nCada executor tem um número fixo de núcleos e uma quantidade de memória, definidos na submissão do job (`--executor-cores`, `--executor-memory`). Os núcleos de um executor funcionam como slots: um executor com 4 núcleos roda até 4 tasks ao mesmo tempo, uma por núcleo. Mais núcleos por executor, mais tasks em paralelo naquele processo."
                    },
                    {
                        "type": "text",
                        "value": "## O cluster manager\n\nO cluster manager decide quais máquinas (ou containers) o driver e os executors ocupam, e quanta CPU e memória cada um recebe. O Spark não resolve isso sozinho: ele delega essa negociação a um gerenciador de recursos externo.\n\nOs três mais comuns em Spark 3.x:\n\n- **Standalone**: o gerenciador que vem com o próprio Spark, simples de configurar, comum em clusters dedicados só a Spark.\n- **YARN**: o gerenciador de recursos do ecossistema Hadoop, presente em clusters on-premise e em serviços como o EMR.\n- **Kubernetes**: orquestrador de containers genérico, onde cada executor roda como um pod; ganha espaço por unificar a infraestrutura com outras cargas de trabalho.\n\nNo modo Standalone existem processos próprios chamados Master e Worker, que só cuidam de alocar recursos: não confundir esse Worker com o driver ou com um executor da aplicação, que continuam sendo processos separados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cluster manager\",\"Onde é comum\"],[\"Standalone\",\"Cluster dedicado só a aplicações Spark\"],[\"YARN\",\"Clusters Hadoop on-premise e serviços como o EMR\"],[\"Kubernetes\",\"Infraestrutura em containers, ao lado de outras cargas de trabalho\"]]"
                    },
                    {
                        "type": "code",
                        "value": "+-----------------+\n| Cluster manager |\n| (YARN / K8s /   |\n|  Standalone)    |\n+-----------------+\n          |\n          |  aloca CPU e memoria para o driver e os executors\n          v\n+----------+                      +-----------+\n| Driver   |                      | Executor  |\n| (roda o  |-- envia tasks -->    | (JVM, N   |\n|  main()) |<-- resultados ---    |  nucleos) |\n+----------+                      +-----------+\n\n                          (e os demais executors do cluster, em paralelo)"
                    },
                    {
                        "type": "quote",
                        "value": "O driver decide o quê e quando; o cluster manager decide onde há espaço; os executors só sabem executar a task que chegou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num job Spark, qual processo é responsável por converter o código do usuário num plano de execução e distribuir as tasks para rodar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O driver, que transforma o código num plano de execução e distribui as tasks.",
                                "isCorrect": true
                            },
                            {
                                "text": "O executor, que transforma o código num plano de execução e distribui as tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cluster manager, que transforma o código num plano de execução e distribui as tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "O worker, que transforma o código num plano de execução e distribui as tasks.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time configura um job Spark com 5 executors, cada um com 4 núcleos, e nota que muitas tasks ficam esperando na fila mesmo com o cluster inteiro alocado. Sem adicionar máquinas, qual mudança aumenta diretamente o número de tasks rodando ao mesmo tempo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir o número de partições do DataFrame de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de núcleos configurados por executor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o cluster manager de YARN para Kubernetes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a memória alocada apenas para o driver.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro submete um job Spark a partir do notebook do seu laptop, em modo client, para um cluster YARN. No meio do processamento, o laptop perde a conexão de rede. O que acontece com o job?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O YARN reinicia automaticamente o driver dentro de um executor, sem perda de progresso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O job continua normalmente, pois os executors assumem o papel do driver até a rede voltar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O job falha, pois em modo client o driver roda no laptop e a aplicação depende dele.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada muda, pois em modo client o driver já roda dentro do cluster, isolado do laptop.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação Spark pede 10 executors ao cluster manager, mas só há recursos livres para 4 no momento da submissão. Em termos de arquitetura, o que acontece a seguir?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cluster manager rejeita a aplicação inteira, que precisa ser submetida de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O YARN interrompe outras aplicações do cluster para liberar os 10 executors de uma vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "O driver assume o trabalho dos executors que faltam até o cluster liberar mais recursos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação começa com os 4 executors liberados e recebe mais conforme o cluster libera.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo descreve uma responsabilidade que o Spark delega a um sistema externo, em vez de resolver com seu próprio código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A alocação de CPU e memória entre o driver e os executors do cluster.",
                                "isCorrect": true
                            },
                            {
                                "text": "A construção do plano de execução a partir das transformações do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "O envio das tasks prontas do driver para os executors disponíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "A divisão do job em stages, separados pelos pontos de shuffle no plano.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Job, stage e task",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Job, stage e task\n\nToda vez que uma ação roda sobre um DataFrame, o Spark não executa aquela linha isolada: ele transforma a sequência inteira de transformações acumuladas até ali numa hierarquia de trabalho, dividida em job, stages e tasks. Entender essa hierarquia é o que permite ler o Spark UI e explicar por que um job tem 3 stages, ou por que um deles tem 200 tasks."
                    },
                    {
                        "type": "text",
                        "value": "## Da ação ao job\n\nUma ação, como `collect()`, `count()`, `show()` ou `write.parquet()`, é o gatilho que dispara um **job**. Cada ação chamada no código gera um novo job; uma aplicação com várias ações ao longo do script gera vários jobs, um atrás do outro.\n\nO job carrega o plano inteiro de transformações acumuladas desde a leitura dos dados (ou da última ação anterior) até a ação que o disparou."
                    },
                    {
                        "type": "text",
                        "value": "## Do job aos stages\n\nO Spark não roda o job como um bloco único: ele divide o job em **stages**, cortando o plano toda vez que encontra uma operação que exige **shuffle**, redistribuir dados entre partições, como um `groupBy`, um `join` ou um `repartition`.\n\nTransformações que não exigem mover dados entre partições (`select`, `filter`, `withColumn`) ficam empacotadas no mesmo stage e rodam em sequência, sem parar para trocar dados pela rede. Um job com um shuffle no meio tem 2 stages; um job com dois shuffles tem 3, e assim por diante."
                    },
                    {
                        "type": "text",
                        "value": "## Dos stages às tasks\n\nCada stage, por sua vez, é dividido em **tasks**, uma para cada partição dos dados naquele ponto do plano. Se um stage opera sobre um DataFrame com 200 partições, ele gera 200 tasks, distribuídas entre os núcleos livres dos executors.\n\nA task é a menor unidade de trabalho do Spark: um processo que roda a mesma lógica sobre uma partição diferente dos dados. É nesse nível que o paralelismo de fato acontece."
                    },
                    {
                        "type": "code",
                        "value": "Aplicacao Spark\n  |\n  +-- Job 1 (disparado por uma acao: count(), collect(), write()...)\n        |\n        +-- Stage 1 (transformacoes narrow: select, filter, withColumn)\n        |     +-- Task 1 (particao 0)\n        |     +-- Task 2 (particao 1)\n        |     +-- ...\n        |     +-- Task N (particao N-1)\n        |\n        |  ------ shuffle (ex.: groupBy, join) ------\n        |\n        +-- Stage 2 (depois do shuffle)\n              +-- Task 1 (particao 0)\n              +-- Task 2 (particao 1)\n              +-- ..."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nível\",\"O que dispara\",\"Quantos existem\"],[\"Job\",\"Uma ação (collect, count, write...)\",\"Um job por ação chamada\"],[\"Stage\",\"Um limite de shuffle no plano\",\"Um ou mais por job, conforme os shuffles\"],[\"Task\",\"Uma partição de dados dentro do stage\",\"Uma task por partição do stage\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um job é cortado em stages pelo shuffle, e cada stage é cortado em tasks pelas partições: o shuffle divide o trabalho na vertical, a partição divide na horizontal."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que dispara a criação de um novo job numa aplicação Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma transformação, como um filter ou um select, aplicada ao DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma ação, como um collect, count ou write, chamada sobre o DataFrame.",
                                "isCorrect": true
                            },
                            {
                                "text": "A leitura inicial dos dados de origem, antes de qualquer transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A divisão automática das partições feita pelo Spark ao abrir a sessão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um script roda `df.filter(cond).select(cols).groupBy('categoria').agg({'valor': 'sum'}).show()`. Quantos stages esse job tem, e por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "4 stages, um para o filter, um para o select, um para o groupBy e um para o agg.",
                                "isCorrect": false
                            },
                            {
                                "text": "1 stage, porque todas as operações pertencem ao mesmo job e rodam juntas.",
                                "isCorrect": false
                            },
                            {
                                "text": "2 stages, porque o groupBy exige shuffle e corta o plano em duas partes.",
                                "isCorrect": true
                            },
                            {
                                "text": "3 stages, um para cada transformação diferente presente no código.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um stage processa um DataFrame dividido em 150 partições, num cluster com 40 núcleos livres no total. Quantas tasks esse stage gera, e quantas rodam ao mesmo tempo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "150 tasks no total; até 40 rodam ao mesmo tempo, conforme os núcleos livres.",
                                "isCorrect": true
                            },
                            {
                                "text": "40 tasks no total, uma para cada núcleo livre disponível no cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "1 task por executor, que processa as 150 partições em sequência.",
                                "isCorrect": false
                            },
                            {
                                "text": "150 tasks no total, todas rodando ao mesmo tempo, sem depender dos núcleos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um script lê um Parquet, aplica transformações e depois chama `df.count()` e, na linha seguinte, `df.write.parquet(destino)`, sem usar `cache()` em nenhum momento. O que acontece em termos de jobs e leitura dos dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "1 job é criado, dividido internamente em duas execuções para as duas ações.",
                                "isCorrect": false
                            },
                            {
                                "text": "2 jobs são criados, mas o Spark guarda o resultado do primeiro em cache sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só 1 job é criado, pois o Spark reaproveita o resultado da primeira ação na segunda.",
                                "isCorrect": false
                            },
                            {
                                "text": "2 jobs são criados, e os dados são lidos e transformados de novo em cada um.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Durante a execução de um stage com 200 tasks, o executor que rodava a task 47 falha por falta de memória. O que o Spark faz para se recuperar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reexecuta só a task 47 em outro executor, recalculando a partição pela linhagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reexecuta o stage inteiro, refazendo as 200 tasks num novo conjunto de executors.",
                                "isCorrect": false
                            },
                            {
                                "text": "Marca a partição 47 como perdida e segue sem ela no resultado final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reinicia o job inteiro, refazendo também os stages já concluídos antes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Partições: a unidade de paralelismo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Partições: a unidade de paralelismo\n\nToda vez que uma task roda, ela processa uma partição, nunca o DataFrame inteiro. O número e o tamanho das partições determinam o quanto um job consegue paralelizar, e é uma das configurações que mais afeta a performance de um pipeline Spark."
                    },
                    {
                        "type": "text",
                        "value": "## O que é uma partição\n\nUma partição é um pedaço do DataFrame: um subconjunto de linhas que vive junto, geralmente na memória de um único executor, e que é processado por exatamente uma task. Um DataFrame com 100 partições vira, no mínimo, 100 tasks quando uma ação roda sobre ele.\n\nO número de partições muda ao longo do plano: a leitura de um arquivo cria partições com base no tamanho dos arquivos de origem, e operações como `groupBy` ou `join` costumam gerar um novo número de partições, definido por configuração (`spark.sql.shuffle.partitions`, com padrão de 200)."
                    },
                    {
                        "type": "text",
                        "value": "## Paralelismo limitado pelos núcleos\n\nO paralelismo real de um stage é o menor valor entre o número de partições e o número de núcleos livres no cluster. Com 200 partições e 50 núcleos livres, o Spark processa 50 tasks por vez, em 4 levas sucessivas. Com 20 partições e 50 núcleos livres, só 20 núcleos trabalham: os outros 30 ficam ociosos, esperando um trabalho que não existe."
                    },
                    {
                        "type": "text",
                        "value": "## Poucas partições x partições demais\n\nNenhum dos dois extremos ajuda. **Poucas partições** (partições grandes demais) deixam núcleos ociosos, concentram muito dado numa única task, o que eleva o risco de estourar a memória do executor, e deixam o job sensível a qualquer partição desbalanceada.\n\n**Partições demais** (partições pequenas demais) multiplicam a sobrecarga de agendar, iniciar e encerrar cada task, o que pode dominar o tempo total do job; na escrita, ainda geram um excesso de arquivos pequenos no destino, um problema comum em data lakes."
                    },
                    {
                        "type": "code",
                        "value": "Cluster com 3 executors, 4 nucleos cada (12 nucleos livres no total)\n\nDataFrame com 12 particoes:\n  [P0][P1][P2][P3][P4][P5][P6][P7][P8][P9][P10][P11]\n  cada particao ocupa um nucleo livre; tudo roda numa unica leva\n\nDataFrame com 3 particoes (poucas):\n  [P0][P1][P2]\n  so 3 nucleos trabalham; 9 nucleos ficam ociosos\n\nDataFrame com 1200 particoes (particoes demais):\n  [P0][P1][P2] ... [P1199]\n  12 nucleos trabalham por vez, em 100 levas sucessivas,\n  cada uma pagando o overhead de agendar cada task"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sintoma\",\"Poucas partições\",\"Partições demais\"],[\"Núcleos ociosos\",\"Sim, sobra capacidade não usada\",\"Não, mas cada leva processa pouco dado\"],[\"Risco de OOM\",\"Maior, partição grande demais para a memória\",\"Menor por task, mas overhead cresce\"],[\"Arquivos na escrita\",\"Poucos arquivos, possivelmente grandes\",\"Muitos arquivos pequenos no destino\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O paralelismo de um stage nunca passa do menor entre o número de partições e o número de núcleos livres; partições demais e partições de menos desperdiçam capacidade por motivos opostos."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma partição, no contexto da execução de um job Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um estágio do plano de execução, separado por uma operação de shuffle.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um núcleo de CPU reservado exclusivamente para um executor específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um subconjunto de linhas do DataFrame, processado por exatamente uma task.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um arquivo Parquet individual gravado no destino de uma escrita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cluster tem 20 núcleos livres, e um DataFrame está dividido em 20 partições de tamanho parecido. O que acontece quando uma ação dispara o processamento desse stage?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Spark junta as 20 partições em uma só antes de distribuir o trabalho.",
                                "isCorrect": false
                            },
                            {
                                "text": "As 20 partições esperam em fila, pois o Spark reserva núcleos extras por segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas 1 partição é processada por vez, já que cada executor prioriza uma task.",
                                "isCorrect": false
                            },
                            {
                                "text": "As 20 partições são processadas em paralelo numa única leva, usando todos os núcleos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job lê uma tabela pequena que resulta em apenas 2 partições, mas roda num cluster com 100 núcleos livres, sem nenhuma outra aplicação concorrendo por recursos. Qual é o diagnóstico mais direto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tempo total do job independe do número de partições quando há núcleos de sobra.",
                                "isCorrect": false
                            },
                            {
                                "text": "O job usa só 2 núcleos de fato; aumentar as partições aproveitaria mais o cluster.",
                                "isCorrect": true
                            },
                            {
                                "text": "O cluster está mal dimensionado e precisa de menos núcleos livres para esse job.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark distribui automaticamente cada partição entre vários núcleos ao mesmo tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job processa um DataFrame com 50 mil partições muito pequenas, num cluster com 200 núcleos, e termina mais devagar do que uma versão anterior com 500 partições maiores, lendo o mesmo volume de dados. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Partições pequenas demais são combinadas automaticamente pelo Spark antes de rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cluster manager limita a 500 o número de tasks simultâneas, ignorando o resto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Com mais partições, o Spark usa sempre menos memória por task, o que deveria acelerar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A sobrecarga de agendar e encerrar cada uma das 50 mil tasks passa a dominar o tempo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline grava um DataFrame com 8 mil partições num destino Parquet, e o time encontra milhares de arquivos pequenos no diretório de saída, prejudicando leituras futuras. Qual é a causa mais direta desse padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A compressão do Parquet fragmenta automaticamente arquivos grandes em partes menores.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número alto de partições no momento da escrita gera um arquivo por partição.",
                                "isCorrect": true
                            },
                            {
                                "text": "O formato Parquet sempre grava um arquivo por linha do DataFrame, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cluster manager divide a escrita entre executors sem relação com as partições.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Avaliação lazy: transformações x ações",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Avaliação lazy: transformações x ações\n\nUma linha como `df.filter(coluna > 10)` não processa uma única linha de dado quando é executada. O Spark só monta um plano; o processamento de fato só começa quando uma ação é chamada. Esse comportamento, chamado de avaliação lazy (preguiçosa), é uma das decisões de design mais importantes do Spark, e explica boa parte do que parece \"mágico\" na hora de otimizar um job."
                    },
                    {
                        "type": "text",
                        "value": "## Transformações: montam o plano\n\nOperações como `select`, `filter`, `withColumn`, `join`, `groupBy` e `orderBy` são **transformações**: recebem um DataFrame e devolvem outro DataFrame novo, sem processar uma única linha de dado real. O que existe, depois de encadear várias transformações, é uma descrição do trabalho a fazer, não o trabalho feito.\n\nEssa descrição é acumulada como um plano lógico (a próxima aula entra nesse plano em detalhe). Nenhuma leitura de arquivo, nenhum shuffle, nenhum cálculo acontece só por chamar uma transformação."
                    },
                    {
                        "type": "text",
                        "value": "## Ações: disparam a execução\n\nUma **ação** é o que pede um resultado de volta, seja para o driver (`collect()`, `count()`, `take(n)`, `show()`), seja para um destino externo (`write.parquet(...)`, `write.saveAsTable(...)`). Só quando uma ação é chamada o Spark converte o plano acumulado num job, divide em stages e tasks, e efetivamente lê e processa os dados.\n\nCada ação nova dispara um job novo, que refaz o processamento desde a origem (leitura ou último ponto em cache), a menos que o resultado intermediário tenha sido persistido explicitamente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Transformações (lazy)\",\"Ações (disparam execução)\"],[\"select, filter, where\",\"collect, take, first\"],[\"withColumn, drop\",\"count\"],[\"groupBy, agg\",\"show\"],[\"join, union\",\"write (parquet, csv, saveAsTable...)\"],[\"orderBy, distinct, repartition\",\"foreach, toPandas\"]]"
                    },
                    {
                        "type": "code",
                        "value": "df = spark.read.parquet('/dados/pedidos')\n\n# as tres linhas abaixo sao transformacoes: so montam o plano, nada roda ainda\nfiltrado = df.filter(df.status == 'pago')\ncom_total = filtrado.withColumn('total', df.preco * df.quantidade)\nagrupado = com_total.groupBy('categoria').sum('total')\n\n# nenhum job aparece no Spark UI ate aqui\n\nresultado = agrupado.collect()  # acao: agora o Spark le, processa e traz o resultado"
                    },
                    {
                        "type": "text",
                        "value": "## Por que lazy ajuda a otimizar\n\nSe cada transformação rodasse na hora (avaliação eager, como o pandas faz), o Spark processaria cada etapa isolada, sem enxergar o que vem depois. Como a execução é adiada até a ação, o Catalyst Optimizer (próxima aula) enxerga o plano inteiro de uma vez e pode reorganizar operações antes de rodar: aplicar um filtro antes de um join para reduzir o volume de dados embaralhado, ou eliminar colunas que nunca são lidas.\n\nAvaliação lazy também evita trabalho desnecessário: se uma coluna calculada nunca é usada por uma ação, o Spark nem chega a computá-la."
                    },
                    {
                        "type": "quote",
                        "value": "Transformação monta o plano; ação executa o plano. Nada acontece de fato até uma ação ser chamada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Das operações abaixo, qual é uma ação, e não uma transformação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "groupBy, que agrupa linhas por uma ou mais colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "withColumn, que adiciona uma coluna calculada ao DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "filter, que remove linhas que não atendem a uma condição.",
                                "isCorrect": false
                            },
                            {
                                "text": "collect, que traz o resultado processado de volta para o driver.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor encadeia dez transformações sobre um DataFrame e, ao abrir o Spark UI, não vê nenhum job em execução nem concluído. Assim que adiciona um `.count()` ao final do código, um job aparece. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As transformações são lazy; só uma ação, como count(), dispara um job de fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "As primeiras nove transformações falharam em silêncio, e só a décima é válida.",
                                "isCorrect": false
                            },
                            {
                                "text": "O count() reinicia a sessão do Spark, o que faz o UI voltar a exibir jobs.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark UI só atualiza depois que dez transformações se acumulam no plano.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor chama `df.select('coluna_que_nao_existe')` e, mesmo sem ter chamado nenhuma ação, o Spark já lança um erro (AnalysisException) nessa mesma linha. Isso contradiz a avaliação lazy?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Contradiz: transformações inválidas só deveriam falhar quando uma ação for chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não contradiz: essa validação conta, na prática, como uma ação implícita do Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contradiz: nesse caso específico, o Spark abandona o lazy e processa tudo na hora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não contradiz: o Spark resolve nomes e tipos de coluna na hora; só o dado é lazy.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal vantagem de o Spark esperar por uma ação para só então executar as transformações acumuladas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Catalyst enxerga o plano inteiro e pode reorganizar operações antes de rodar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O cluster manager aloca recursos com mais folga, sem pressa para liberar executors.",
                                "isCorrect": false
                            },
                            {
                                "text": "O driver consome menos memória, já que nenhuma transformação fica guardada em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os executors recebem menos tasks, pois transformações lazy geram menos partições.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um script aplica um filtro custoso sobre um DataFrame e depois chama `df_filtrado.show()` e, na sequência, `df_filtrado.count()`, sem usar `cache()` em nenhum momento. O que acontece com o filtro custoso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele roda em paralelo nas duas ações, pois o Spark identifica a mesma origem de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele roda só na primeira ação; a segunda reaproveita o plano sem reler a origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele roda só uma vez, e o resultado fica guardado automaticamente para a segunda ação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele roda de novo do zero em cada ação, já que nada foi persistido entre as chamadas.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O DAG e o Catalyst",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O DAG e o Catalyst\n\nAs aulas anteriores mostraram que o Spark transforma código em jobs, stages e tasks (aula 2), e que esse processo só começa quando uma ação é chamada (aula 4). Falta a peça que liga as duas pontas: como o Spark decide, exatamente, qual plano rodar. Essa decisão passa por um grafo de operações, o DAG, e por um otimizador chamado Catalyst."
                    },
                    {
                        "type": "text",
                        "value": "## O DAG de operações\n\nEnquanto o código encadeia transformações, o Spark constrói internamente um DAG (grafo acíclico dirigido) que registra cada operação e de onde ela veio, sua linhagem. É esse grafo, e não o código Python em si, que o Spark de fato executa quando uma ação chega.\n\nSer acíclico significa que os dados sempre fluem numa direção, da origem para o resultado, sem voltar atrás; é essa propriedade que permite ao Spark recalcular qualquer partição perdida a partir da linhagem, sem depender de um backup completo a cada etapa (o motivo pelo qual cache e persist, vistos no módulo 6, são uma escolha explícita, não o padrão)."
                    },
                    {
                        "type": "text",
                        "value": "## O Catalyst Optimizer\n\nO Catalyst é o otimizador de consultas do Spark SQL, usado tanto por código SQL quanto pela API de DataFrame (as duas viram a mesma representação interna). Ele parte do plano que o código descreve e passa por etapas até chegar num plano físico pronto para rodar:\n\n1. **Análise**: resolve nomes de colunas e tabelas contra o catálogo, produzindo um plano lógico validado.\n2. **Otimização lógica**: aplica regras que simplificam o plano, como aproximar filtros da leitura dos dados (predicate pushdown) e descartar colunas nunca usadas.\n3. **Planejamento físico**: gera candidatos a plano físico, estratégias concretas de execução, como o tipo de join a usar, e escolhe um deles pelo custo estimado.\n4. **Geração de código**: compila o plano físico escolhido em bytecode otimizado para rodar nos executors."
                    },
                    {
                        "type": "code",
                        "value": "Codigo (DataFrame API ou SQL)\n        |\n        v\n+--------------+\n| Plano logico |   (o que fazer, em termos relacionais)\n+--------------+\n        |  analise: resolve colunas e tabelas\n        v\n+-----------------------+\n| Plano logico validado |\n+-----------------------+\n        |  otimizacao logica: predicate pushdown,\n        |  poda de colunas, simplificacao de expressoes\n        v\n+------------------------+\n| Plano logico otimizado |\n+------------------------+\n        |  planejamento fisico: gera candidatos,\n        |  escolhe pelo custo estimado\n        v\n+--------------+\n| Plano fisico |   (como fazer: join hash, scan, etc.)\n+--------------+\n        |  geracao de codigo (Tungsten)\n        v\n  Jobs, stages e tasks nos executors"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Plano lógico\",\"Plano físico\"],[\"Descreve\",\"O que fazer, em termos relacionais\",\"Como fazer, com algoritmos concretos\"],[\"Exemplo\",\"Juntar pedidos e clientes por id\",\"Broadcast hash join lendo pedidos em stream\"],[\"Depende do cluster\",\"Não\",\"Sim, considera tamanho dos dados e recursos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "df = spark.read.parquet('/dados/pedidos')\nresultado = df.filter(df.status == 'pago').groupBy('categoria').count()\n\nresultado.explain()\n\n# saida simplificada (plano fisico):\n# == Physical Plan ==\n# *(2) HashAggregate(keys=[categoria], functions=[count(1)])\n# +- Exchange hashpartitioning(categoria, 200)\n#    +- *(1) HashAggregate(keys=[categoria], functions=[partial_count(1)])\n#       +- *(1) Filter (status = 'pago')\n#          +- *(1) FileScan parquet /dados/pedidos"
                    },
                    {
                        "type": "quote",
                        "value": "O plano lógico diz o que o Spark deve entregar; o plano físico, escolhido pelo Catalyst, diz como os executors vão entregar, e é esse último que efetivamente vira jobs, stages e tasks."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o DAG representa, dentro da execução de uma aplicação Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A lista de máquinas físicas disponíveis no cluster para rodar os executors.",
                                "isCorrect": false
                            },
                            {
                                "text": "O histórico de jobs já concluídos, guardado no metadata do Spark UI.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grafo de operações e dependências, construído a partir das transformações.",
                                "isCorrect": true
                            },
                            {
                                "text": "A sequência de comandos SQL enviados diretamente ao cluster manager.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel do Catalyst Optimizer dentro do Spark SQL?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Decidir em qual cluster manager a aplicação deve ser submetida antes de iniciar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar o plano lógico construído a partir do código num plano físico eficiente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Alocar núcleos e memória entre os executors de acordo com o tamanho das partições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o código Python da aplicação em bytecode Java antes da fase de análise.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação distingue corretamente plano lógico e plano físico no Spark?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O plano lógico roda nos executors; o plano físico existe só como referência no driver.",
                                "isCorrect": false
                            },
                            {
                                "text": "O plano lógico já escolhe o algoritmo de join; o físico só decide a ordem das operações.",
                                "isCorrect": false
                            },
                            {
                                "text": "O plano lógico descreve o que fazer; o físico descreve como fazer, de forma concreta.",
                                "isCorrect": true
                            },
                            {
                                "text": "O plano lógico e o plano físico são o mesmo plano, com nomes diferentes por convenção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para o mesmo plano lógico de um join entre duas tabelas, o Catalyst pode gerar mais de um plano físico candidato, com estratégias de join diferentes. O que determina qual desses candidatos é escolhido para rodar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cluster manager, que decide o plano físico com base nos executors livres no momento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem em que as tabelas aparecem no código-fonte, da esquerda para a direita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma estimativa de custo de cada plano candidato, considerando o volume de dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "A escolha manual do desenvolvedor, feita obrigatoriamente através do explain().",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o Catalyst consegue otimizar automaticamente um pipeline escrito com a API de DataFrame, mas não um pipeline equivalente escrito com transformações de RDD e funções Python soltas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque RDDs sempre rodam num único executor, sem qualquer paralelismo entre partições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o DataFrame usa expressões que o Catalyst enxerga; RDD usa funções opacas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Catalyst otimiza apenas RDDs, sem ainda dar suporte à API de DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque RDDs não formam um DAG, apenas uma sequência de comandos sem dependências.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - RDDs e DataFrames",
        "aulas": [
            {
                "titulo": "RDD: a abstração original",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# RDD: a abstração original\n\nO RDD (Resilient Distributed Dataset) foi a primeira abstração do Spark, e é a partir dela que todas as outras (DataFrame, Dataset, Spark SQL) foram construídas por cima. Um RDD é uma coleção distribuída e imutável de objetos, dividida em partições espalhadas pelos executors do cluster e processada em paralelo. O Spark oferece essa API em Scala, Java, Python e R; os exemplos desta trilha usam PySpark, mas o conceito de RDD é o mesmo em qualquer linguagem."
                    },
                    {
                        "type": "text",
                        "value": "## Imutável, particionado e resiliente\n\nNenhuma operação altera um RDD existente: toda transformação (`map`, `filter`, `union`) produz um novo RDD, deixando o original intacto, o mesmo princípio de imutabilidade que reaparece depois no DataFrame. A parte \"resiliente\" do nome vem da forma como o Spark lida com falhas: em vez de replicar os dados como um sistema de arquivos distribuído faz, o Spark guarda o lineage de cada RDD, o encadeamento de transformações que levou da fonte original até aquele RDD. Se um executor cai e uma partição se perde, o Spark reconstrói só aquela partição reaplicando o lineage, sem refazer o job inteiro."
                    },
                    {
                        "type": "code",
                        "value": "# cria um RDD a partir de uma lista Python, dividido em 4 partições\nnumeros = sc.parallelize(range(1, 11), numSlices=4)\n\n# transformações: avaliação lazy, nada é executado ainda\npares = numeros.filter(lambda n: n % 2 == 0)\ndobro = pares.map(lambda n: n * 2)\n\n# ação: dispara a execução e traz o resultado para o driver\nresultado = dobro.reduce(lambda a, b: a + b)\nprint(resultado)  # 60"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operação\",\"Categoria\",\"O que faz\"],[\"map\",\"Transformação\",\"Aplica uma função a cada elemento e gera um novo RDD\"],[\"filter\",\"Transformação\",\"Mantém só os elementos que satisfazem uma condição\"],[\"flatMap\",\"Transformação\",\"Aplica uma função e achata o resultado em um único RDD\"],[\"reduce\",\"Ação\",\"Combina todos os elementos em um único valor, no driver\"],[\"collect\",\"Ação\",\"Traz todos os elementos do RDD para o driver\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um RDD não guarda os dados prontos: guarda o lineage, o caminho de transformações que permite reconstruir qualquer partição perdida a partir da origem."
                    },
                    {
                        "type": "text",
                        "value": "## Por que hoje se usa pouco\n\nA API de RDD é de baixo nível: `map`, `filter` e `reduce` recebem funções arbitrárias (lambdas, funções Python comuns), e o Spark simplesmente executa o que foi escrito, sem enxergar o que acontece dentro delas. Sem um schema associado aos elementos, não existe coluna, tipo ou expressão para o Catalyst analisar: o RDD passa ao largo do otimizador (a próxima aula mostra o que isso custa na prática). Em PySpark há ainda um custo extra: cada elemento que passa por uma função Python precisa ser serializado entre a JVM e o processo Python e de volta, algo que a API de DataFrame evita na maior parte do tempo. Por isso, desde que o DataFrame amadureceu, o RDD passou a ser usado direto só em casos pontuais: dados que não cabem bem em linhas e colunas, ou situações que exigem controle fino sobre particionamento e execução que a API estruturada não expõe."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que um RDD é imutável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma transformação aplicada a um RDD sempre produz um novo RDD, sem alterar o original.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dados do RDD ficam fixos na memória do driver durante toda a execução do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um RDD não pode ser reparticionado depois de criado, pois o número de partições é definido na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um RDD não pode ser usado em mais de uma ação depois de calculado pela primeira vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como o Spark recupera uma partição de um RDD perdida depois da falha de um executor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Copiando a partição perdida a partir de uma réplica mantida automaticamente em outro executor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recalculando a partição a partir do lineage, reaplicando as transformações desde a origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reiniciando o job inteiro, já que partições isoladas não podem ser recalculadas sozinhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Restaurando a partição a partir de um checkpoint salvo automaticamente a cada transformação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time mantém um job em RDDs puros que aplica uma sequência de map e filter com funções Python antes de gravar o resultado. A mesma lógica reescrita em DataFrame roda visivelmente mais rápido sobre o mesmo volume de dados. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "RDDs sempre usam menos partições que DataFrames, deixando o paralelismo do cluster subutilizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O DataFrame grava o resultado em cache automaticamente, enquanto o RDD recalcula tudo a cada execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst otimiza o plano do DataFrame, enquanto as funções Python do RDD são opacas para o otimizador.",
                                "isCorrect": true
                            },
                            {
                                "text": "RDDs não distribuem a execução entre executors, concentrando o processamento no driver.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que melhor descreve a relação atual entre RDDs e DataFrames no Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "RDDs foram removidos das versões recentes do Spark e sobrevivem só como conceito histórico.",
                                "isCorrect": false
                            },
                            {
                                "text": "DataFrames e RDDs são engines de execução independentes, sem nenhuma relação interna entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "RDDs substituíram os DataFrames como abstração recomendada a partir das versões mais recentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O DataFrame é construído sobre RDDs internamente, mas adiciona um schema que o Catalyst otimiza.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe troca RDD.map com uma função Python por operações equivalentes na API de DataFrame, usando select e withColumn. Além do ganho trazido pelo Catalyst, qual custo específico da API de RDD em PySpark também desaparece nessa troca?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A serialização de cada elemento entre a JVM e o processo Python a cada chamada da função.",
                                "isCorrect": true
                            },
                            {
                                "text": "O particionamento dos dados entre executors, que só existe quando a API de RDD é usada direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "A avaliação lazy das transformações, exclusiva da API de RDD e ausente na API de DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "A necessidade de um driver coordenando a execução, que a API de DataFrame elimina.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DataFrame e Dataset: a API estruturada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# DataFrame e Dataset: a API estruturada\n\nUm DataFrame é uma coleção distribuída de dados organizada em colunas nomeadas e tipadas, o equivalente distribuído de uma tabela de banco de dados ou de um DataFrame do pandas, mas avaliado de forma lazy e particionado entre os executors. A diferença central para o RDD não é só de sintaxe: um DataFrame carrega um schema, e é esse schema que dá ao Spark visibilidade sobre a estrutura dos dados, a peça que faltava para o Catalyst conseguir otimizar alguma coisa."
                    },
                    {
                        "type": "text",
                        "value": "## Dataset: a versão tipada\n\nO Dataset adiciona segurança de tipos em tempo de compilação por cima das mesmas otimizações do DataFrame, uma vantagem que só faz sentido em linguagens de tipagem estática como Scala e Java, onde cada linha do Dataset mapeia para uma classe conhecida em tempo de compilação. Tecnicamente, um DataFrame é um Dataset[Row], uma linha genérica sem tipo específico. Como Python é dinamicamente tipado, esse tipo de checagem em tempo de compilação não existe na linguagem, então o PySpark não expõe uma API de Dataset separada: o DataFrame já é a API estruturada completa disponível em Python."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.appName(\"clientes\").getOrCreate()\n\ndados = [(\"Ana\", 29, \"SP\"), (\"Bruno\", 34, \"RJ\"), (\"Carla\", 41, \"MG\")]\ncolunas = [\"nome\", \"idade\", \"uf\"]\n\ndf = spark.createDataFrame(dados, colunas)\ndf.printSchema()\n# root\n#  |-- nome: string (nullable = true)\n#  |-- idade: long (nullable = true)\n#  |-- uf: string (nullable = true)\ndf.show()"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"RDD\",\"DataFrame\",\"Dataset\"],[\"Schema\",\"Não tem, objetos opacos\",\"Tem, colunas nomeadas e tipadas\",\"Tem, colunas nomeadas e tipadas\"],[\"Passa pelo Catalyst\",\"Não\",\"Sim\",\"Sim\"],[\"Tipagem checada em compilação\",\"Via o tipo do objeto da linguagem\",\"Não, resolvida em runtime\",\"Sim, em Scala e Java\"],[\"Disponível em PySpark\",\"Sim\",\"Sim, é a API padrão\",\"Não existe versão tipada em Python\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Em PySpark, todo DataFrame já é, por definição, um Dataset de linhas genéricas: a tipagem dinâmica do Python é o motivo de não existir uma API de Dataset separada na linguagem."
                    },
                    {
                        "type": "text",
                        "value": "## Por que o DataFrame é o padrão no PySpark\n\nQuase todo código PySpark em produção é escrito contra a API de DataFrame ou contra Spark SQL, as duas faces da mesma engine estruturada. É possível registrar um DataFrame como view temporária com createOrReplaceTempView e escrever a mesma lógica em spark.sql(\"SELECT ...\"): os dois caminhos passam pelo mesmo Catalyst e tendem a gerar o mesmo plano de execução. A escolha entre um estilo e outro costuma ser preferência da equipe, não desempenho."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um DataFrame no Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma coleção de objetos Python arbitrários, sem schema, distribuída entre os executors do cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma coleção distribuída de dados organizada em colunas nomeadas e tipadas, com um schema associado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tabela armazenada fisicamente em disco no formato Parquet, gerenciada automaticamente pelo Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração que descreve como o Spark deve particionar os dados entre os executors.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a API de Dataset tipado não existe em PySpark do mesmo jeito que existe em Scala?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o PySpark ainda não implementou o Catalyst Optimizer para nenhuma de suas APIs estruturadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Dataset tipado foi removido do Spark a partir da versão 3.x, em todas as linguagens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque Python é uma linguagem de tipagem dinâmica, sem checagem de tipos em tempo de compilação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o DataFrame em Python roda só localmente no driver, sem distribuir a execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma engenheira recebe um RDD de tuplas (nome, categoria, valor) e precisa somar os valores por categoria da forma mais simples, aproveitando otimizações automáticas do Spark. Qual é o caminho mais direto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter o processamento em RDD e usar reduceByKey, já que essa operação já é otimizada pelo Catalyst.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o RDD em uma lista Python local e somar os valores com um laço for no driver.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar map no RDD para calcular a soma manualmente, sem converter nada para DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o RDD em DataFrame com um schema definido e usar groupBy com uma função de agregação.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta escrita com spark.sql sobre uma view temporária e a sequência equivalente de select e groupBy na API de DataFrame tendem a ter desempenho parecido. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque as duas formas passam pelo mesmo Catalyst Optimizer e geram planos de execução equivalentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Spark SQL e a API de DataFrame rodam em processos separados que trocam dados por cache.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a API de DataFrame é apenas uma tradução automática de comandos SQL feita pelo driver.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as duas formas evitam o uso de partições, tratando o dataset inteiro como uma unidade só.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação sobre Dataset e DataFrame está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um Dataset sempre roda mais rápido que um DataFrame equivalente, pulando a etapa do Catalyst.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em Scala, DataFrame é definido como um alias de Dataset[Row], uma linha genérica sem tipo associado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um DataFrame pode ter colunas tipadas, mas um Dataset é restrito a dados sem schema, como um RDD.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Dataset só pode ser criado a partir de um DataFrame existente, nunca direto de uma fonte de dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que o DataFrame é mais rápido",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que o DataFrame é mais rápido\n\nA diferença de desempenho entre um job em RDD e o mesmo job reescrito em DataFrame não vem de um truque isolado: vem de dois componentes do Spark trabalhando em conjunto. O Catalyst decide o melhor plano antes de qualquer dado ser processado; o Tungsten executa esse plano perto do limite de eficiência da CPU e da memória disponíveis. Como já vimos, uma operação de DataFrame é lazy e só constrói um plano quando uma ação dispara a execução: esta aula detalha o que acontece com esse plano entre o código escrito e as tasks que rodam nos executors."
                    },
                    {
                        "type": "text",
                        "value": "## O que o Catalyst faz com o plano\n\nO código de DataFrame (ou uma consulta Spark SQL) vira primeiro um plano lógico não resolvido, com nomes de colunas e tabelas ainda não conferidos. Na análise, o Catalyst confere esses nomes contra o catálogo e resolve os tipos, gerando um plano lógico válido. Em seguida aplica regras de otimização (poda de colunas, predicate pushdown, simplificação de expressões constantes, reordenação de filtros) para chegar a um plano lógico otimizado. Desse plano lógico nascem um ou mais planos físicos, estratégias concretas de execução, e o Spark seleciona o de menor custo estimado antes de gerar as tasks."
                    },
                    {
                        "type": "code",
                        "value": "código DataFrame ou consulta SQL\n        |\n        v\nPlano Lógico Não Resolvido   (colunas e tabelas ainda não conferidas)\n        |  análise: valida contra o catálogo\n        v\nPlano Lógico\n        |  regras de otimização: pushdown, poda de colunas, simplificação\n        v\nPlano Lógico Otimizado\n        |  gera mais de uma estratégia física possível\n        v\nPlanos Físicos  ->  escolhe o de menor custo estimado\n        |\n        v\nTungsten: geração de código e execução nos executors"
                    },
                    {
                        "type": "text",
                        "value": "## O que o Tungsten faz na execução\n\nO Tungsten cuida da parte de baixo nível: gerencia memória fora do heap da JVM, em um formato binário compacto que evita o custo de objetos individuais e reduz pausas de garbage collection. A otimização mais visível é o whole-stage code generation: em vez de interpretar cada operador do plano um a um (um modelo clássico de iteradores, com uma chamada de função por linha), o Tungsten funde vários operadores de um mesmo estágio em uma única função de bytecode compilada. Menos chamadas de função e menos indireção significam mais eficiência de CPU para o mesmo trabalho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\",\"RDD\",\"DataFrame\"],[\"Visibilidade do Spark sobre a operação\",\"Nenhuma, função opaca\",\"Total: coluna, tipo, expressão\"],[\"Passa pelo Catalyst\",\"Não\",\"Sim\"],[\"Geração de código pelo Tungsten\",\"Não se aplica do mesmo jeito\",\"Sim, via whole-stage codegen\"],[\"Quem decide a estratégia de execução\",\"Exatamente o que foi escrito no código\",\"O otimizador, com base em regras e custo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Catalyst escolhe o melhor plano antes de rodar; o Tungsten faz esse plano rodar perto do limite da CPU e da memória. Um dos dois sozinho não explica o ganho de desempenho do DataFrame sobre o RDD."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais dois componentes do Spark trabalham juntos para tornar a execução de DataFrames mais eficiente que a de RDDs equivalentes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O driver, que otimiza o plano, e o cluster manager, que aloca executors para rodar as tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark SQL, que substitui o DataFrame, e o Hive Metastore, que guarda o schema das tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst Optimizer, que otimiza o plano, e o Tungsten, que executa esse plano com eficiência.",
                                "isCorrect": true
                            },
                            {
                                "text": "O particionador, que define as partições, e o shuffle, que redistribui dados entre executors.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em que etapa do plano do Catalyst uma otimização como poda de colunas, ler só as colunas realmente usadas, é aplicada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Só durante a execução física nos executors, depois que os dados já foram lidos por completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na análise do plano lógico não resolvido, antes de o Spark validar se as colunas existem.",
                                "isCorrect": false
                            },
                            {
                                "text": "No Tungsten, como parte da geração de código, depois que o plano físico já foi escolhido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na transformação do plano lógico em plano lógico otimizado, antes de gerar os planos físicos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job em DataFrame lê um Parquet com 40 colunas, aplica um filter e depois um select mantendo só 3 colunas. Comparado a ler as 40 colunas completas, o plano otimizado pelo Catalyst tende a:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ler do disco só as 3 colunas necessárias, aproveitando o formato colunar do Parquet.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ler as 40 colunas por completo, já que o Parquet exige carregar o arquivo inteiro antes de filtrar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ler só as linhas que passam no filtro, mas ainda assim as 40 colunas dessas linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar o select e materializar as 40 colunas em memória antes de qualquer otimização.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é, especificamente, o whole-stage code generation feito pelo Tungsten?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A geração automática de índices nas colunas mais usadas nos filtros, para acelerar buscas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fusão de vários operadores de um estágio em uma única função de bytecode compilada.",
                                "isCorrect": true
                            },
                            {
                                "text": "A compilação do código Python do driver para bytecode JVM antes de distribuir as tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "A criação automática de mais partições durante a execução, para aumentar o paralelismo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma sequência de map e filter com lambdas Python em um RDD não se beneficia do Catalyst Optimizer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Catalyst só foi implementado para clusters com mais de um executor, nunca em modo local.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque RDDs não suportam avaliação lazy, então toda operação roda de imediato, sem chance de otimização.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o conteúdo das funções Python é opaco para o Spark, que não consegue analisar o que está dentro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque as funções Python de um RDD sempre rodam no driver, nunca distribuídas para os executors.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criar e ler DataFrames",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Criar e ler DataFrames\n\nTodo código PySpark começa por uma SparkSession, o ponto de entrada que representa a aplicação Spark dentro do driver. A partir dela, um DataFrame nasce de duas formas: lendo de uma fonte externa (arquivos em um data lake, uma tabela de catálogo) ou criando a partir de dados que já estão na memória do driver, normalmente para testes e prototipagem."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.appName(\"vendas\").getOrCreate()\n\n# lê um diretório de arquivos Parquet; o schema vem embutido nos próprios arquivos\ndf_parquet = spark.read.parquet(\"s3://bucket/vendas/\")\n\n# lê um CSV com cabeçalho, inferindo o schema a partir dos dados\ndf_csv = spark.read.csv(\"dados/vendas.csv\", header=True, inferSchema=True)\n\n# lê um JSON, um registro por linha\ndf_json = spark.read.json(\"dados/vendas.json\")\n\n# lê uma tabela já registrada no catálogo do Spark (ex.: Hive metastore)\ndf_tabela = spark.read.table(\"vendas_db.pedidos\")"
                    },
                    {
                        "type": "text",
                        "value": "## Criar um DataFrame a partir de uma lista\n\nPara testar uma transformação com uma massa de dados pequena, sem depender de nenhum arquivo externo, o caminho mais direto é spark.createDataFrame, passando uma lista de tuplas e os nomes das colunas (ou um schema completo, quando o tipo de cada coluna importa)."
                    },
                    {
                        "type": "code",
                        "value": "dados = [\n    (\"Ana\", \"SP\", 1200.50),\n    (\"Bruno\", \"RJ\", 980.00),\n    (\"Carla\", \"MG\", 1450.75),\n]\ncolunas = [\"cliente\", \"uf\", \"total\"]\n\ndf = spark.createDataFrame(dados, colunas)\ndf.show()"
                    },
                    {
                        "type": "code",
                        "value": "# grava particionado por uf, sobrescrevendo o destino se já existir\ndf.write.mode(\"overwrite\").partitionBy(\"uf\").parquet(\"s3://bucket/saida/vendas/\")"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Formato\",\"Schema embutido no arquivo\",\"Formato colunar\",\"Observação\"],[\"Parquet\",\"Sim\",\"Sim\",\"Preferido para dados já processados: leitura seletiva de colunas e boa compressão\"],[\"CSV\",\"Não\",\"Não, é orientado a linha\",\"Schema precisa ser inferido ou declarado a cada leitura\"],[\"JSON\",\"Parcial, por registro\",\"Não, é orientado a linha\",\"Bom para dados semiestruturados; mais pesado para ler em escala\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Preferir Parquet como formato intermediário não é um detalhe de estilo: é o formato que preserva o schema junto dos dados e deixa o Spark ler só as colunas de que precisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "No PySpark, qual é a forma correta de ler, como DataFrame, uma tabela já registrada no catálogo do Spark, por exemplo no Hive metastore?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "spark.catalog.read(\"banco.tabela\")",
                                "isCorrect": false
                            },
                            {
                                "text": "spark.createDataFrame.table(\"banco.tabela\")",
                                "isCorrect": false
                            },
                            {
                                "text": "spark.read.load.table(\"banco.tabela\")",
                                "isCorrect": false
                            },
                            {
                                "text": "spark.read.table(\"banco.tabela\")",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline lê diariamente arquivos que foram escritos por um job Spark anterior, sem nenhuma necessidade de compatibilidade com ferramentas externas. Qual formato tende a exigir menos trabalho do Spark para descobrir o schema dos dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Parquet, porque o schema fica armazenado nos metadados do próprio arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "CSV, porque o cabeçalho da primeira linha já informa o schema completo, sem leitura adicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON, porque cada registro carrega o nome dos campos junto do valor, dispensando inferência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos os formatos exigem o mesmo esforço do Spark para descobrir o schema dos dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o desenvolvimento local de um job, um engenheiro quer testar uma transformação com uma pequena massa de dados fabricada à mão, sem depender de nenhum arquivo externo. Qual é a forma mais direta de fazer isso no PySpark?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escrever os dados em um CSV temporário no disco local e lê-lo em seguida com spark.read.csv.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar spark.createDataFrame passando uma lista de tuplas e os nomes das colunas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um RDD com sc.parallelize e usá-lo direto no lugar de um DataFrame nas transformações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Declarar os dados dentro de uma UDF e chamá-la sem nenhum DataFrame de entrada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job roda todos os dias e precisa substituir completamente os dados do dia anterior, caso o mesmo dia seja reprocessado. Qual configuração de escrita atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "df.write.mode(\"append\"), adicionando os novos dados sem remover os que já existiam.",
                                "isCorrect": false
                            },
                            {
                                "text": "df.write.mode(\"ignore\"), mantendo os dados antigos sempre que o destino já existir.",
                                "isCorrect": false
                            },
                            {
                                "text": "df.write.mode(\"overwrite\"), sobrescrevendo os dados existentes no destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "df.write.mode(\"error\"), interrompendo o job sempre que o destino já contiver dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline grava diariamente arquivos JSON, lidos no dia seguinte por um job que aplica filtros e agregações sobre poucas colunas de um total de 50. Ao migrar a escrita para Parquet, mantendo a mesma lógica de leitura, qual ganho é o mais direto de se esperar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Redução automática no número de partições do DataFrame, independente do tamanho dos arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminação completa do shuffle na agregação, já que o Parquet não exige redistribuir dados entre executors.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantia automática de que os dados não terão mais nenhum tipo de data skew no processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Leitura mais rápida, porque o formato colunar traz do disco só as colunas usadas no filtro e na agregação.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Schema, tipos e colunas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Schema, tipos e colunas\n\nO schema de um DataFrame é o conjunto de nomes de colunas, seus tipos e se cada uma aceita nulo. Ele pode vir de duas formas: inferido pelo Spark a partir dos próprios dados, ou declarado explicitamente antes da leitura. A diferença entre as duas parece só sintaxe, mas tem impacto direto no tempo de leitura e na previsibilidade do resultado."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql.types import StructType, StructField, IntegerType, StringType, DoubleType, BooleanType\n\nschema = StructType([\n    StructField(\"id_pedido\", IntegerType(), nullable=False),\n    StructField(\"cliente\", StringType(), nullable=True),\n    StructField(\"valor\", DoubleType(), nullable=True),\n    StructField(\"pago\", BooleanType(), nullable=True),\n])\n\ndf = spark.read.schema(schema).csv(\"dados/pedidos.csv\", header=True)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo Spark\",\"Equivalente em Python\",\"Uso típico\"],[\"StringType\",\"str\",\"Texto\"],[\"IntegerType / LongType\",\"int\",\"Números inteiros, 32 ou 64 bits\"],[\"DoubleType\",\"float\",\"Números com casas decimais\"],[\"BooleanType\",\"bool\",\"Verdadeiro ou falso\"],[\"TimestampType / DateType\",\"datetime.datetime / datetime.date\",\"Data e hora, ou só data\"],[\"ArrayType / StructType\",\"list / dict aninhado\",\"Colunas com estrutura aninhada\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Schema inferido tem um custo\n\nCom inferSchema=True em um CSV, o Spark faz uma passada extra pelos dados só para descobrir o tipo de cada coluna, antes da leitura que efetivamente monta o DataFrame: são dois passes onde poderia haver um. Em JSON o problema é parecido, cada registro pode ter campos diferentes, então o Spark varre os dados (ou uma amostra) para calcular a união de todos os campos e, quando o mesmo campo aparece com tipos diferentes entre registros, resolve para um tipo mais permissivo. Em arquivos grandes, esse custo aparece como um tempo de leitura bem maior do que o esperado, mesmo antes de qualquer transformação começar. Um arquivo Parquet não tem esse problema: o schema já está gravado nos metadados do próprio arquivo, então lê-lo é consultar um metadado, não escanear os dados."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql.functions import col\n\n# três formas equivalentes de referenciar a mesma coluna\ndf.select(df[\"valor\"])\ndf.select(df.valor)\ndf.select(col(\"valor\"))\n\n# expressão: cria uma coluna nova a partir de outra, sem sair da API estruturada\ndf_com_desconto = df.withColumn(\"valor_com_desconto\", col(\"valor\") * 0.9)"
                    },
                    {
                        "type": "quote",
                        "value": "Um schema explícito custa uma linha a mais de código e evita duas coisas caras: o tempo gasto inferindo e a surpresa de um tipo errado descoberto só em produção."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que descreve o schema de um DataFrame no Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O conjunto de nomes de colunas, seus tipos e se cada uma aceita valores nulos.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ordem física em que os arquivos de dados foram gravados em disco pelo Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de partições que o DataFrame terá durante a execução das transformações.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista de transformações que serão aplicadas ao DataFrame antes de uma ação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao ler um CSV de 200 GB com inferSchema=True, um job passa a demorar bem mais só na etapa de leitura, antes de qualquer transformação. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O inferSchema força o Spark a processar o arquivo inteiro em uma única partição, sem paralelismo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark faz uma passada extra pelos dados só para deduzir o tipo de cada coluna antes de ler de fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Arquivos CSV maiores que 100 GB não são suportados pelo leitor padrão e caem num modo mais lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O inferSchema desativa a avaliação lazy, executando a leitura de imediato e por completo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual opção referencia corretamente a coluna preco de um DataFrame df para uso dentro de uma expressão, como multiplicar por um fator?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "\"preco\" * 1.1, usando direto o nome da coluna como string dentro da expressão",
                                "isCorrect": false
                            },
                            {
                                "text": "df.select(\"preco\") * 1.1, aplicando a multiplicação sobre o resultado de um select",
                                "isCorrect": false
                            },
                            {
                                "text": "col(\"preco\") * 1.1, usando a função col importada de pyspark.sql.functions",
                                "isCorrect": true
                            },
                            {
                                "text": "Column(\"preco\") * 1.1, instanciando a classe Column direto com o nome desejado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquivo JSON tem o campo quantidade como número inteiro em 99% dos registros, mas como texto, por exemplo \"cinco\", em alguns registros antigos. Ao ler esse arquivo sem um schema explícito, qual comportamento é o mais esperado do Spark?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Spark ignora silenciosamente os registros com o campo em texto, mantendo só os numéricos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura falha de imediato, já que o Spark exige um único tipo consistente em todo o arquivo JSON.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark converte automaticamente o texto \"cinco\" para o número 5 durante a inferência do schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark tende a inferir um tipo mais permissivo, como string, para acomodar todos os valores.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe declara um schema explícito antes de ler um CSV grande, no lugar de usar inferSchema=True. Além de evitar a passada extra de leitura, qual outro benefício essa decisão traz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Garante que os tipos das colunas sejam previsíveis e consistentes entre execuções diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduz automaticamente o número de partições necessárias para processar o arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina a necessidade de qualquer transformação futura sobre as colunas do DataFrame resultante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permite que o Spark leia o arquivo sem paralelismo entre executors, simplificando a execução.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Transformando dados com a API de DataFrame",
        "aulas": [
            {
                "titulo": "select, filter, withColumn e expressões de coluna",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# select, filter, withColumn e expressões de coluna\n\nA partir daqui o DataFrame já existe (leitura coberta no módulo anterior) e o trabalho passa a ser transformar: escolher colunas, descartar linhas, calcular novos valores. Esses três métodos, select, filter (ou where) e withColumn, cobrem a maior parte do que se faz em um pipeline de transformação, e quase todo o resto da API de DataFrame é variação ou composição deles. Cada chamada retorna um DataFrame novo: nenhum deles altera o original, e nenhum deles executa nada sozinho, é tudo plano lógico até uma ação disparar o cálculo."
                    },
                    {
                        "type": "text",
                        "value": "## Selecionar e renomear colunas\n\n`select()` aceita nomes de colunas como string ou como objetos `Column`, construídos com `col(\"nome\")` ou `df.nome`. A diferença importa: uma string só nomeia a coluna, enquanto um `Column` pode ser combinado em expressões, com `.alias()` para renomear, funções de `pyspark.sql.functions` e operadores aritméticos. `withColumnRenamed(\"antigo\", \"novo\")` renomeia sem reescrever o select inteiro, e `drop(\"coluna\")` remove uma coluna específica."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql import functions as F\nfrom pyspark.sql.functions import col\n\n# select com strings e com Column, misturando os dois\ndf.select(\n    \"id\",\n    col(\"nome_cliente\").alias(\"cliente\"),\n    (col(\"preco\") * col(\"quantidade\")).alias(\"total\"),\n)\n\n# renomear sem reescrever o select inteiro\ndf.withColumnRenamed(\"dt_pedido\", \"data_pedido\")\n\n# remover colunas que nao interessam mais\ndf.drop(\"coluna_temporaria\", \"flag_interna\")"
                    },
                    {
                        "type": "text",
                        "value": "## Filtrar linhas com where e filter\n\n`filter()` e `where()` são exatamente o mesmo método, o segundo existe só para quem vem do SQL. A condição é uma expressão de `Column`, combinada com `&` (e), `|` (ou) e `~` (não), nunca com os operadores `and`, `or`, `not` do Python puro, que não funcionam sobre um `Column` e lançam erro. Cada condição precisa de parênteses ao redor quando combinada, porque `&` e `|` têm precedência maior que operadores de comparação como `>` e `==` em Python, e sem os parênteses a expressão é avaliada na ordem errada."
                    },
                    {
                        "type": "code",
                        "value": "# forma correta: cada condicao entre parenteses\ndf.filter((col(\"idade\") >= 18) & (col(\"status\") == \"ativo\"))\n\n# where e filter sao sinonimos\ndf.where((col(\"uf\") == \"SP\") | (col(\"uf\") == \"RJ\"))\n\n# nulos tem metodo proprio, == None nao funciona\ndf.filter(col(\"email\").isNotNull())\n\n# lista de valores\ndf.filter(col(\"categoria\").isin(\"eletronicos\", \"informatica\"))"
                    },
                    {
                        "type": "text",
                        "value": "## Criar e transformar colunas com withColumn\n\n`withColumn(\"nome\", expressao)` adiciona uma coluna nova ou, se o nome já existe, sobrescreve a coluna com o novo valor, sempre devolvendo um DataFrame novo. `F.when(condicao, valor).otherwise(padrao)` resolve lógica condicional, o equivalente a um CASE WHEN do SQL, e pode ser encadeado com vários `.when()`. `F.lit(valor)` cria uma coluna de valor constante, útil quando uma expressão espera uma coluna mas o valor é fixo, e `.cast(\"tipo\")` converte o tipo de uma coluna existente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Método\",\"Para que serve\"],[\"select(...)\",\"Escolher e opcionalmente renomear colunas\"],[\"filter(...) / where(...)\",\"Manter linhas que satisfazem uma condição\"],[\"withColumn(nome, expr)\",\"Criar coluna nova ou sobrescrever uma existente\"],[\"withColumnRenamed(a, b)\",\"Renomear uma coluna sem reescrever o select\"],[\"drop(...)\",\"Remover uma ou mais colunas\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o método select faz em um DataFrame Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Retorna um DataFrame novo, contendo só as colunas informadas, na ordem escolhida",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove do DataFrame as colunas informadas, mantendo todas as demais sem alteração",
                                "isCorrect": false
                            },
                            {
                                "text": "Reordena fisicamente os dados no disco de acordo com as colunas informadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Filtra as linhas do DataFrame com base no valor das colunas informadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro escreveu df.filter(col(\"idade\") > 18 & col(\"status\") == \"ativo\") e o Spark lançou um erro ao avaliar a expressão. Qual ajuste resolve o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Substituir & por and, o operador lógico nativo do Python para combinar condições",
                                "isCorrect": false
                            },
                            {
                                "text": "Envolver cada condição entre parênteses, já que & tem precedência maior que > e ==",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir & por &&, a sintaxe de conjunção lógica usada pelo PySpark",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar col(\"idade\") e col(\"status\") por strings simples, sem o col()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se withColumn for chamado passando um nome de coluna que já existe no DataFrame, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Spark lança um erro de coluna duplicada e interrompe a execução do job",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma segunda coluna é criada com um sufixo automático, como _2, para evitar conflito",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna existente é substituída pelo novo valor, em um DataFrame novo retornado",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna antiga é mantida sem alteração, e o novo valor calculado é descartado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a vantagem prática de usar col(\"idade\") em vez da string \"idade\" ao construir uma expressão de filtro ou de coluna derivada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "col() é obrigatório dentro de select, strings simples não são aceitas nesse método",
                                "isCorrect": false
                            },
                            {
                                "text": "col() executa a leitura da coluna diretamente do disco, sem passar pelo plano lógico",
                                "isCorrect": false
                            },
                            {
                                "text": "col() evita que o Catalyst precise otimizar a expressão antes da execução",
                                "isCorrect": false
                            },
                            {
                                "text": "col() retorna um objeto que pode ser combinado em expressões, como comparações e contas",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline encadeia df.select(...).filter(...).withColumn(...).count(). Em que momento o Spark efetivamente lê os dados de origem e executa as transformações encadeadas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A cada método da cadeia, na ordem exata em que aparecem no código",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente quando count(), uma ação, é chamado: os demais só montam o plano lógico",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas no select inicial, os métodos seguintes operam sobre um resultado já em memória",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark decide a ordem de leitura e execução de forma aleatória entre as tasks",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "groupBy e agregações",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# groupBy e agregações\n\ngroupBy agrupa linhas que compartilham o mesmo valor em uma ou mais colunas, para então resumir cada grupo com uma função de agregação. Sozinho, `df.groupBy(\"coluna\")` não devolve um DataFrame: devolve um objeto `GroupedData`, um agrupador que ainda está esperando uma agregação para virar resultado. É esse par, agrupar mais agregar, que produz o DataFrame final, com uma linha por grupo."
                    },
                    {
                        "type": "text",
                        "value": "## Agregações simples\n\nPara uma única métrica, o `GroupedData` tem atalhos diretos: `count()`, `sum(\"coluna\")`, `avg(\"coluna\")`, `max(\"coluna\")` e `min(\"coluna\")`. Eles cobrem o caso mais comum, contar ou somar uma coluna por grupo, mas só aceitam uma agregação por chamada. Quando o pipeline precisa de várias métricas ao mesmo tempo, ou de uma função sem atalho direto, a ferramenta é `agg()`."
                    },
                    {
                        "type": "code",
                        "value": "# atalhos diretos do GroupedData\ndf.groupBy(\"categoria\").count()\ndf.groupBy(\"categoria\").sum(\"valor\")\ndf.groupBy(\"categoria\").avg(\"valor\")\n\n# groupBy sozinho nao e um DataFrame, e um GroupedData\ntype(df.groupBy(\"categoria\"))\n# <class 'pyspark.sql.group.GroupedData'>"
                    },
                    {
                        "type": "text",
                        "value": "## agg() para múltiplas agregações, com alias\n\n`agg()` aceita várias funções de `pyspark.sql.functions` na mesma chamada, cada uma virando uma coluna no resultado. Sem `.alias()`, o nome da coluna gerada é o padrão do Spark, algo como `sum(valor)`, incômodo de referenciar depois, então o hábito certo é sempre nomear cada agregação. O resultado de `agg()` é um DataFrame comum: pode ser filtrado, ordenado ou selecionado como qualquer outro, inclusive para aplicar uma condição sobre o valor agregado, o equivalente a um HAVING do SQL."
                    },
                    {
                        "type": "code",
                        "value": "resumo = (\n    df.groupBy(\"categoria\")\n    .agg(\n        F.sum(\"valor\").alias(\"total\"),\n        F.avg(\"valor\").alias(\"ticket_medio\"),\n        F.count(\"*\").alias(\"qtd_pedidos\"),\n    )\n    .filter(col(\"total\") > 10000)\n    .orderBy(col(\"total\").desc())\n)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"RDD groupByKey\",\"DataFrame groupBy().agg()\"],[\"Pré-agregação antes do shuffle\",\"Não, envia todos os valores\",\"Sim, o Catalyst combina por partição\"],[\"Volume de dados no shuffle\",\"Cresce com o total de linhas\",\"Cresce com o número de grupos\"],[\"Tipo de retorno\",\"RDD de chave e lista de valores\",\"DataFrame com uma linha por grupo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "groupBy().agg() é uma wide transformation: linhas com a mesma chave podem estar em executors diferentes e precisam ser reunidas, isso é shuffle. O módulo seguinte detalha esse custo e como reduzi-lo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que df.groupBy(\"categoria\") retorna quando nenhuma função de agregação é encadeada em seguida?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um DataFrame com uma linha para cada valor distinto da coluna categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, pois groupBy exige uma agregação na mesma chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista Python com os valores distintos encontrados na coluna categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "Um objeto GroupedData, que ainda não é um DataFrame e depende de agregação",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de df.groupBy(\"categoria\").agg(F.sum(\"valor\")), uma consulta seguinte usando a coluna total falha com erro de coluna inexistente. Qual é o motivo mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sem alias, a coluna agregada recebeu o nome padrão sum(valor), e não total",
                                "isCorrect": true
                            },
                            {
                                "text": "agg() não aceita funções de F, apenas nomes de função em string, como \"sum\"",
                                "isCorrect": false
                            },
                            {
                                "text": "groupBy exige um select() explícito antes do agg para definir nomes de coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "alias só é aceito em colunas criadas por withColumn, não dentro de agg()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório precisa listar apenas as categorias cuja soma de vendas ultrapassa 10000. Qual é a forma correta de fazer isso em PySpark?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aplicar filter na coluna valor antes do groupBy, comparando cada linha com 10000",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar where(...) como argumento dentro da própria chamada de groupBy()",
                                "isCorrect": false
                            },
                            {
                                "text": "Agrupar e agregar primeiro, depois aplicar filter sobre a coluna agregada resultante",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é possível filtrar depois de um agg, é preciso um select() intermediário antes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que groupBy().agg() da API de DataFrame costuma gerar menos tráfego de shuffle do que groupByKey() em RDDs, para a mesma agregação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "groupBy().agg() não realiza shuffle algum, diferente de groupByKey()",
                                "isCorrect": false
                            },
                            {
                                "text": "O DataFrame agrega os dados inteiramente em memória do driver antes de distribuir",
                                "isCorrect": false
                            },
                            {
                                "text": "groupBy().agg() sempre recorre a um broadcast join para evitar mover dados",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst pré-agrega por partição antes do shuffle, o que groupByKey() não faz",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "df.groupBy(\"regiao\", \"categoria\").agg(F.sum(\"valor\").alias(\"total\")) produz quantas linhas no resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma linha por região, somando todas as categorias daquela região",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma linha para cada combinação distinta de região e categoria presente nos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma linha por categoria, somando todas as regiões daquela categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma única linha, já que agg() sempre reduz o DataFrame inteiro a um total geral",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Joins",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Joins\n\nJoin é o método que combina dois DataFrames a partir de uma chave em comum, a base de qualquer pipeline que integra fontes diferentes, como pedidos e clientes, ou eventos e cadastro. `df1.join(df2, condicao, how)` é a assinatura geral, e cada peça, o tipo de join, a condição e o volume resultante, custa caro quando ignorada. Assim como groupBy, join é uma wide transformation: exige reunir linhas de mesma chave que podem estar em executors diferentes, então dispara shuffle (com uma exceção importante, o broadcast join, tratada no módulo seguinte)."
                    },
                    {
                        "type": "text",
                        "value": "## Tipos de join\n\n- **inner** (padrão): mantém só as linhas com chave presente nos dois lados.\n- **left / left_outer**: mantém todas as linhas da esquerda, com nulo onde não casar à direita.\n- **right / right_outer**: o espelho do left, mantém todas as linhas da direita.\n- **outer / full / full_outer**: mantém todas as linhas dos dois lados, com nulo onde faltar par.\n- **left_semi**: mantém as linhas da esquerda que têm correspondência à direita, mas só traz colunas da esquerda, como um filtro.\n- **left_anti**: o oposto do semi, mantém as linhas da esquerda que não têm correspondência à direita."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo (how)\",\"O que mantém no resultado\"],[\"inner\",\"Linhas com chave presente nos dois DataFrames\"],[\"left / left_outer\",\"Todas as linhas da esquerda, nulo onde faltar à direita\"],[\"right / right_outer\",\"Todas as linhas da direita, nulo onde faltar à esquerda\"],[\"outer / full\",\"Todas as linhas dos dois lados, nulo onde não houver par\"],[\"left_semi\",\"Linhas da esquerda com correspondência, sem colunas da direita\"],[\"left_anti\",\"Linhas da esquerda sem nenhuma correspondência à direita\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# inner e o padrao quando how nao e informado\npedidos.join(clientes, \"cliente_id\")\n\n# left mantem todo pedido, mesmo sem cliente cadastrado\npedidos.join(clientes, \"cliente_id\", \"left\")\n\n# semi: so pedidos de clientes ativos, sem colunas de clientes\npedidos.join(clientes_ativos, \"cliente_id\", \"left_semi\")\n\n# anti: clientes que nunca fizeram pedido\nclientes.join(pedidos, \"cliente_id\", \"left_anti\")"
                    },
                    {
                        "type": "text",
                        "value": "## A condição do join e colunas duplicadas\n\nA condição pode ser um nome de coluna (ou lista de nomes), quando a chave tem o mesmo nome nos dois DataFrames, ou uma expressão booleana, como `df1.id == df2.id`. A diferença importa: o nome como string ou lista colapsa a chave em uma única coluna no resultado, enquanto a expressão booleana mantém as duas colunas originais, id de df1 e id de df2, e uma referência posterior a `col(\"id\")` falha com erro de ambiguidade. Quando a expressão booleana é necessária, por exemplo com chaves de nomes diferentes nos dois lados, o caminho é dar alias aos DataFrames antes do join e selecionar as colunas qualificadas."
                    },
                    {
                        "type": "code",
                        "value": "# expressao booleana mantem as duas colunas id, gera ambiguidade\npedidos.join(clientes, pedidos.id == clientes.id)\n\n# forma que evita duplicidade: nome da coluna como condicao\npedidos.join(clientes, \"id\")\n\n# alternativa quando os nomes das chaves sao diferentes\n(\n    pedidos.alias(\"p\")\n    .join(clientes.alias(\"c\"), col(\"p.cliente_id\") == col(\"c.id\"))\n    .select(\"p.*\", col(\"c.nome\").alias(\"nome_cliente\"))\n)"
                    },
                    {
                        "type": "quote",
                        "value": "Um join multiplica linhas quando a chave não é única de um dos lados. Antes de um join pensado como um-para-um, vale confirmar a cardinalidade: um fan-out inesperado infla o resultado e o custo do shuffle junto com ele."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o tipo de join usado por padrão em df1.join(df2, condicao) quando o parâmetro how não é informado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "inner, que mantém as linhas com chave presente nos dois DataFrames",
                                "isCorrect": true
                            },
                            {
                                "text": "left_outer, que mantém todas as linhas do DataFrame à esquerda",
                                "isCorrect": false
                            },
                            {
                                "text": "outer, que mantém todas as linhas dos dois DataFrames envolvidos",
                                "isCorrect": false
                            },
                            {
                                "text": "cross, que combina cada linha de um DataFrame com todas as do outro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "pedidos.join(clientes, pedidos.id == clientes.id) foi executado, e uma seleção seguinte por col(\"id\") falhou com erro de referência ambígua. Qual é a causa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "how não foi informado, e o Spark duplica todas as colunas por segurança nesse caso",
                                "isCorrect": false
                            },
                            {
                                "text": "id é uma palavra reservada do Spark SQL e não pode nomear uma coluna",
                                "isCorrect": false
                            },
                            {
                                "text": "A condição por expressão booleana manteve as duas colunas id, uma de cada DataFrame",
                                "isCorrect": true
                            },
                            {
                                "text": "clientes não tinha uma coluna id antes do join, e o Spark copiou a de pedidos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer listar os clientes que não têm nenhum pedido registrado, sem trazer nenhuma coluna da tabela pedidos no resultado. Qual join resolve isso diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "left_semi, mantendo os clientes que têm correspondência em pedidos",
                                "isCorrect": false
                            },
                            {
                                "text": "left_anti, mantendo os clientes sem nenhuma correspondência em pedidos",
                                "isCorrect": true
                            },
                            {
                                "text": "left_outer, mantendo as linhas em que as colunas de pedidos vierem nulas",
                                "isCorrect": false
                            },
                            {
                                "text": "inner com a condição de igualdade de chave negada pelo operador ~",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para evitar colunas duplicadas ao juntar dois DataFrames pela mesma chave id, sem dar alias manualmente, qual chamada de join é a mais direta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "pedidos.join(clientes, pedidos.id == clientes.id)",
                                "isCorrect": false
                            },
                            {
                                "text": "pedidos.join(clientes, how=\"id\")",
                                "isCorrect": false
                            },
                            {
                                "text": "pedidos.crossJoin(clientes).filter(pedidos.id == clientes.id)",
                                "isCorrect": false
                            },
                            {
                                "text": "pedidos.join(clientes, \"id\")",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela pedidos deveria ter no máximo um pedido por cliente_id, mas por um bug upstream alguns valores de cliente_id aparecem repetidos nela. Um join inner entre clientes (uma linha por cliente) e pedidos por cliente_id resulta em mais linhas do que pedidos tinha antes. Por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A chave não é única de um dos lados, então cada correspondência gera uma linha e multiplica o total",
                                "isCorrect": true
                            },
                            {
                                "text": "Todo join duplica o total de linhas das duas tabelas somadas, não importa como a chave se repete",
                                "isCorrect": false
                            },
                            {
                                "text": "O shuffle do join reprocessa pedidos duas vezes, contando cada linha em dobro no resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "O plano do Catalyst não elimina linhas repetidas de cliente_id antes de montar o join",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Funções de janela (window functions)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Funções de janela (window functions)\n\ngroupBy resume um grupo em uma linha só, perdendo o detalhe de cada registro. Quando o objetivo é comparar uma linha com outras do mesmo grupo sem perder essa granularidade, por exemplo o rank de cada pedido dentro do cliente, ou a diferença para o pedido anterior, a ferramenta certa é uma função de janela. Ela calcula um valor por linha olhando para uma partição de linhas relacionadas, e devolve o DataFrame com o mesmo número de linhas que tinha antes, só que com uma coluna a mais."
                    },
                    {
                        "type": "text",
                        "value": "## Window, partitionBy, orderBy e over()\n\nUma especificação de janela é construída com `Window.partitionBy(...)`, que define o agrupamento (equivalente à chave do groupBy, mas sem colapsar linhas), e opcionalmente `.orderBy(...)`, que define a ordem dentro de cada partição. A função de janela é aplicada com `.over(janela)`, encadeado depois de algo como `F.row_number()` ou `F.sum(\"valor\")`. Sem partitionBy, a janela inteira vira uma única partição lógica, o que concentra o trabalho e merece cuidado em DataFrames grandes."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql.window import Window\n\njanela = Window.partitionBy(\"cliente_id\").orderBy(col(\"data\").desc())\n\npedidos.withColumn(\"posicao\", F.row_number().over(janela))\n\n# agregacao sobre a janela, sem colapsar linhas\ntotal_janela = Window.partitionBy(\"categoria\")\npedidos.withColumn(\"total_categoria\", F.sum(\"valor\").over(total_janela))"
                    },
                    {
                        "type": "text",
                        "value": "## row_number, rank, dense_rank, lag e lead\n\n`row_number()` numera as linhas de cada partição de forma sequencial e única, mesmo com empates. `rank()` dá o mesmo número a valores empatados, mas pula posições depois do empate. `dense_rank()` também empata, sem deixar buracos na sequência seguinte. `lag(\"coluna\", n)` traz o valor de n linhas antes, na ordem da janela, e `lead(\"coluna\", n)` traz o valor de n linhas depois, úteis para comparar uma linha com a vizinha, como calcular a variação frente ao pedido anterior do mesmo cliente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\",\"Empate recebe o mesmo número\",\"Deixa buraco depois do empate\"],[\"row_number()\",\"Não, cada linha recebe um número distinto\",\"Não se aplica\"],[\"rank()\",\"Sim\",\"Sim, pula posições\"],[\"dense_rank()\",\"Sim\",\"Não, sequência contínua\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# o pedido mais recente de cada cliente\njanela = Window.partitionBy(\"cliente_id\").orderBy(col(\"data\").desc())\n\nmais_recentes = (\n    pedidos.withColumn(\"rn\", F.row_number().over(janela))\n    .filter(col(\"rn\") == 1)\n    .drop(\"rn\")\n)"
                    },
                    {
                        "type": "quote",
                        "value": "Uma função de janela não reduz linhas, ela enriquece cada linha com uma visão do grupo ao redor. groupBy().agg() responde uma linha por grupo, a janela responde a mesma pergunta sem abrir mão do detalhe de cada linha original."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o efeito de aplicar uma função de janela, como row_number().over(janela), em um DataFrame?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As linhas são agrupadas em uma única linha por partição, como em um groupBy",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados são reordenados fisicamente no disco, de acordo com a partição usada",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma coluna nova é calculada por linha, a partir da partição, sem reduzir as linhas",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma nova partição física é criada no cluster para cada valor distinto da chave",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma partição ordenada por nota decrescente, as duas primeiras linhas empatam com a maior nota. Usando dense_rank(), qual valor a terceira linha recebe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "1, repetindo o valor das duas linhas empatadas anteriores",
                                "isCorrect": false
                            },
                            {
                                "text": "3, pois cada linha soma uma posição ao rank, empatada ou não",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum valor, dense_rank não é definida logo após um empate",
                                "isCorrect": false
                            },
                            {
                                "text": "2, porque dense_rank não deixa buracos depois de um empate",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela pedidos tem várias linhas por cliente_id, e o pipeline precisa manter só o pedido mais recente de cada cliente. Qual abordagem resolve isso corretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "groupBy(\"cliente_id\").agg(F.max(\"data\")) já traz a linha completa mais recente de cada cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "row_number() sobre Window.partitionBy(\"cliente_id\").orderBy(col(\"data\").desc()), filtrando por 1",
                                "isCorrect": true
                            },
                            {
                                "text": "orderBy(\"data\", ascending=False) no DataFrame inteiro, seguido de limit(1), repetido por cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "sum(\"valor\").over(Window.partitionBy(\"cliente_id\")), mantendo a linha de maior total por cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DataFrame de vendas tem 100 mil linhas. Depois de criar uma coluna com F.sum(\"valor\").over(Window.partitionBy(\"categoria\")), quantas linhas o resultado tem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "100 mil, o mesmo total original, pois a função de janela não colapsa linhas",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma linha por categoria, o mesmo resultado de groupBy(\"categoria\").agg(F.sum(\"valor\"))",
                                "isCorrect": false
                            },
                            {
                                "text": "100 mil menos as linhas duplicadas dentro de cada categoria",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende do número de executors disponíveis no cluster no momento da execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job aplica F.row_number().over(Window.orderBy(\"data\")), sem partitionBy, sobre um DataFrame de 500 milhões de linhas, e fica extremamente lento com um executor sobrecarregado. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "row_number() não é compatível com DataFrames acima de alguns milhões de linhas",
                                "isCorrect": false
                            },
                            {
                                "text": "orderBy dentro da janela ordena fisicamente o arquivo de saída inteiro no driver",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem partitionBy, o DataFrame inteiro vira uma única partição lógica para a janela",
                                "isCorrect": true
                            },
                            {
                                "text": "Funções de janela não usam shuffle, o gargalo só pode ser rede lenta entre executors",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "UDFs e por que evitá-las",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# UDFs e por que evitá-las\n\nNem toda transformação tem uma função pronta em pyspark.sql.functions, e nesses casos a UDF (user-defined function) parece a saída natural: escrever a lógica em Python puro e aplicá-la coluna a coluna. Funciona, mas tem um custo real que vale entender antes de recorrer a ela, porque em boa parte dos casos existe uma alternativa nativa mais barata, e a UDF deveria ser o último recurso, não o primeiro."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql.types import StringType\n\n@F.udf(returnType=StringType())\ndef classificar(valor):\n    if valor is None:\n        return \"sem_valor\"\n    return \"alto\" if valor > 1000 else \"baixo\"\n\npedidos.withColumn(\"faixa\", classificar(col(\"valor\")))"
                    },
                    {
                        "type": "text",
                        "value": "## Por que uma UDF Python custa caro\n\nO Spark roda na JVM, e uma UDF Python tradicional (row-at-a-time) precisa serializar cada linha da JVM para um processo Python separado, executar a função ali, e trazer o resultado de volta, um custo de comunicação entre processos repetido linha a linha. O Catalyst, além disso, enxerga a UDF como uma caixa-preta: não sabe o que a função faz por dentro, então não consegue otimizar ao redor dela, como empurrar um filtro para antes de um join. Usar uma UDF também interrompe o whole-stage codegen do Tungsten naquele trecho do plano."
                    },
                    {
                        "type": "code",
                        "value": "# com UDF: caixa-preta para o Catalyst, serializacao por linha\n@F.udf(returnType=StringType())\ndef faixa_udf(valor):\n    return \"alto\" if valor is not None and valor > 1000 else \"baixo\"\n\npedidos.withColumn(\"faixa\", faixa_udf(col(\"valor\")))\n\n# equivalente nativo: fica dentro da JVM, Catalyst otimiza normalmente\npedidos.withColumn(\n    \"faixa\",\n    F.when(col(\"valor\") > 1000, \"alto\").otherwise(\"baixo\"),\n)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"UDF Python (row-at-a-time)\",\"Função nativa (pyspark.sql.functions)\"],[\"Onde executa\",\"Processo Python separado, fora da JVM\",\"Dentro da JVM, junto do resto do plano\"],[\"Visibilidade do Catalyst\",\"Caixa-preta, sem otimização ao redor\",\"Plano otimizável normalmente\"],[\"Whole-stage codegen\",\"Interrompido no trecho da UDF\",\"Preservado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## pandas UDF, em uma frase\n\nQuando não existe alternativa nativa, uma pandas UDF (vetorizada) processa os dados em lotes como Series do pandas usando Arrow na serialização, reduzindo bastante o custo por linha de uma UDF tradicional, embora ainda fique atrás de uma função nativa em performance."
                    },
                    {
                        "type": "quote",
                        "value": "Antes de escrever uma UDF, vale procurar a combinação de funções nativas que resolve o mesmo problema. A UDF é o último recurso depois de esgotar when/otherwise, expressões aritméticas e as funções prontas de pyspark.sql.functions, não o primeiro caminho."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que uma UDF Python tradicional (row-at-a-time) costuma ser mais custosa do que uma função nativa de pyspark.sql.functions?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque UDFs só podem ser executadas no driver, nunca distribuídas entre os executors",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque UDFs exigem que o DataFrame inteiro caiba na memória antes de aplicar a função",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Python, por ser interpretado, é sempre mais lento que qualquer código Scala",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada linha precisa ser serializada da JVM para um processo Python e volta",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Como o Catalyst Optimizer trata uma UDF Python dentro de um plano de execução?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como uma caixa-preta, sem visibilidade do que a função faz, o que limita otimizações ao redor",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele decompila o bytecode Python para gerar um plano equivalente otimizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele converte automaticamente a UDF em uma função nativa na primeira execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele executa a UDF uma única vez e reaproveita o resultado em cache para as demais linhas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline usa uma UDF Python só para transformar um texto em maiúsculas antes de gravar. Qual é a melhor forma de evitar o custo dessa UDF?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número de partições do DataFrame antes de aplicar a mesma UDF",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a UDF por F.upper(), a função nativa que já resolve essa transformação",
                                "isCorrect": true
                            },
                            {
                                "text": "Envolver a chamada da UDF em um cache() para reaproveitar linhas já processadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Declarar explicitamente o tipo de retorno da UDF como StringType para acelerar a serialização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia uma pandas UDF (vetorizada) de uma UDF Python tradicional (row-at-a-time)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A pandas UDF roda inteiramente dentro da JVM, sem nenhuma execução em processo Python",
                                "isCorrect": false
                            },
                            {
                                "text": "A pandas UDF é otimizada pelo Catalyst do mesmo jeito que uma função nativa, sem caixa-preta",
                                "isCorrect": false
                            },
                            {
                                "text": "A pandas UDF processa os dados em lotes como Series do pandas, usando Arrow na serialização",
                                "isCorrect": true
                            },
                            {
                                "text": "A pandas UDF elimina totalmente o custo de serialização, igualando a performance a uma nativa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro nota que, ao inserir uma única UDF Python no meio de transformações nativas, o plano gerado por explain() muda de forma notável ao redor dela. O que explica essa mudança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A UDF força o Spark a reler os dados de origem do zero antes e depois dela",
                                "isCorrect": false
                            },
                            {
                                "text": "A presença de uma UDF cancela o Adaptive Query Execution para o job inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "explain() sempre muda de formato quando há mais de uma função aplicada em sequência",
                                "isCorrect": false
                            },
                            {
                                "text": "A UDF interrompe o whole-stage codegen do Tungsten naquele ponto do plano",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Shuffle, particionamento e performance",
        "aulas": [
            {
                "titulo": "O shuffle: o que é e por que é caro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O shuffle: o que é e por que é caro\n\nNos módulos anteriores cada transformação, select, filter, groupBy, join, apareceu isolada, sem se preocupar com onde os dados fisicamente estão dentro do cluster. Este módulo assume o contrário: entender por que um job Spark está lento passa, quase sempre, por entender o shuffle, a operação que redistribui dados entre executors pela rede e pelo disco. Não é exagero dizer que a maior parte do tempo de um job Spark mal ajustado é gasta em shuffle, não em cálculo. Reconhecer quando ele acontece e como reduzi-lo é a diferença entre um job de minutos e um job de horas processando exatamente o mesmo volume de dados."
                    },
                    {
                        "type": "text",
                        "value": "## O que é o shuffle\n\nO Spark distribui um DataFrame em partições, pedaços dos dados espalhados entre os executors do cluster. Enquanto uma transformação processa cada partição de forma independente, o trabalho corre em paralelo sem que um executor precise saber o que existe em outro. O problema aparece quando uma operação exige que registros com a mesma chave estejam juntos na mesma partição, por exemplo, somar o valor de todos os pedidos de um mesmo cliente, espalhados por partições diferentes. Como não há garantia de que registros da mesma chave já estejam na mesma partição, o Spark precisa redistribuir os dados fisicamente pela rede e pelo disco, reunindo cada chave em uma única partição de destino. Essa redistribuição é o shuffle."
                    },
                    {
                        "type": "code",
                        "value": "ANTES do shuffle (particoes de entrada, chaves misturadas)\n\n  Executor 1                  Executor 2\n  P0: [A=1, B=2, A=3]         P2: [C=4, A=5, B=6]\n  P1: [B=7, C=8, A=9]         P3: [C=10, B=11, C=12]\n\n                |  shuffle write: cada task grava no disco\n                |  local arquivos separados por particao de\n                |  destino (hash da chave, por padrao)\n                v\n\n        rede: cada executor busca, nos outros executors,\n        so os blocos da chave que lhe cabe processar\n\n                |\n                v\n\nDEPOIS do shuffle (particoes por chave, prontas para agregar)\n\n  Executor 1                       Executor 2\n  Q0: [A=1, A=3, A=5, A=9]         Q1: [B=2, B=6, B=7, B=11]\n                                    Q2: [C=4, C=8, C=10, C=12]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando o shuffle acontece\n\n- **groupBy e agg**: para somar, contar ou calcular qualquer agregação por chave, os registros da mesma chave precisam estar juntos.\n- **join**, quando nenhum dos lados é pequeno o bastante para broadcast (aula 5): as duas tabelas precisam ter a mesma chave na mesma partição para casar as linhas.\n- **distinct e dropDuplicates**: para saber se um valor já apareceu em outra partição, o Spark precisa reunir as ocorrências da mesma chave.\n- **orderBy e sort**: ordenar um DataFrame inteiro exige redistribuir as linhas por faixas de valor entre partições, não só ordenar cada partição isoladamente.\n- **repartition**: redistribuir explicitamente o número de partições é, por definição, um shuffle (aula 3).\n- **funções de janela com partitionBy**: a mesma lógica do groupBy, os dados são reunidos por partição lógica antes do cálculo (módulo 4)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase\",\"O que acontece\"],[\"Shuffle write\",\"Cada task da stage anterior grava, no disco local do executor, arquivos já separados pela partição de destino\"],[\"Transferência pela rede\",\"Cada task da stage seguinte busca, nos outros executors, somente os blocos da partição que lhe cabe processar\"],[\"Shuffle read\",\"Os blocos recebidos são lidos e, quando necessário, ordenados ou agrupados antes da próxima operação\"],[\"Spill em disco\",\"Quando os dados de uma partição não cabem na memória disponível durante o shuffle, o excedente é gravado em disco temporário\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o shuffle domina o tempo do job\n\nComparado a processar dados que já estão na memória de um executor, um shuffle serializa cada registro, grava em disco, transfere pela rede e desserializa do outro lado, um custo ordens de magnitude maior que uma operação puramente em memória. Além do custo bruto de I/O, o shuffle cria uma barreira entre stages (a próxima aula detalha o porquê): a stage seguinte só processa os blocos à medida que ficam disponíveis, então um shuffle desbalanceado (aula 4) pode travar o job inteiro na task mais lenta, mesmo com o resto do cluster ocioso esperando por ela. No Spark UI, a aba Stages mostra o volume de Shuffle Read e Shuffle Write de cada stage, normalmente o primeiro lugar para investigar quando um job está mais lento do que deveria."
                    },
                    {
                        "type": "quote",
                        "value": "Não é só o volume de dados que torna um job Spark lento, é quantas vezes esses dados atravessam a rede e o disco em um shuffle. Reduzir a quantidade e o tamanho dos shuffles, não apenas o volume total processado, é o eixo central de otimização em Spark."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um shuffle, no contexto da execução de um job Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mover dados entre executors, pela rede ou disco, agrupando cada chave em uma partição",
                                "isCorrect": true
                            },
                            {
                                "text": "Ler os dados de origem no armazenamento, antes de qualquer transformação ser aplicada",
                                "isCorrect": false
                            },
                            {
                                "text": "Copiar o DataFrame inteiro para a memória do driver, ao final da execução do job",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar o resultado final em disco, no momento em que a última ação do job termina",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline encadeia df.filter(...).select(...).groupBy(\"categoria\").agg(F.sum(\"valor\")). Qual etapa dessa cadeia dispara um shuffle?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "filter, pois cada linha é comparada individualmente com as demais linhas do DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "select, pois escolher colunas exige reorganizar fisicamente os dados entre executors",
                                "isCorrect": false
                            },
                            {
                                "text": "groupBy, pois a categoria pode se espalhar por partições diferentes e precisa ser reunida",
                                "isCorrect": true
                            },
                            {
                                "text": "agg, pois toda função de agregação precisa reler o DataFrame inteiro diretamente do disco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro roda df.orderBy(\"data_pedido\") sobre um DataFrame de 2 bilhões de linhas e se surpreende com o tempo de execução, mesmo sem nenhum groupBy ou join no pipeline. Por que orderBy também dispara um shuffle?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "orderBy sempre recalcula o DataFrame inteiro a partir da fonte original antes de ordenar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordenar o DataFrame inteiro exige redistribuir as linhas por faixas de valor entre partições",
                                "isCorrect": true
                            },
                            {
                                "text": "orderBy converte o DataFrame em RDD internamente, e RDDs sempre disparam shuffle",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst Optimizer não reconhece orderBy como transformação nativa e recorre a uma UDF",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Spark UI, a aba Stages de um job mostra que uma stage tem 40 GB de Shuffle Write e a stage seguinte tem 40 GB de Shuffle Read, e juntas essas duas stages consomem 80% do tempo total do job. Qual conclusão é mais direta a partir desses números?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cluster tem executors insuficientes, e a solução imediata é adicionar mais nós",
                                "isCorrect": false
                            },
                            {
                                "text": "O job está limitado pela leitura do armazenamento de origem, antes de qualquer transformação",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst não conseguiu gerar um plano otimizado para nenhuma das duas stages",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de dados movido entre as duas stages é o principal custo do job nesse cenário",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta faz apenas df.select(\"nome\", \"valor\").filter(col(\"valor\") > 0).count() sobre um DataFrame já particionado. Quantos shuffles essa cadeia de operações dispara?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um, porque toda ação, count incluído, força um shuffle final para consolidar o resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, select, filter e count não exigem reunir registros de chaves em outras partições",
                                "isCorrect": true
                            },
                            {
                                "text": "Dois, um para o select e outro para o filter, antes da contagem final no driver",
                                "isCorrect": false
                            },
                            {
                                "text": "Depende do número de partições do DataFrame, um shuffle é disparado a cada partição extra",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Narrow x wide transformations",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Narrow x wide transformations\n\nA aula anterior definiu o shuffle pelo que ele faz: redistribuir dados entre partições. Falta responder a pergunta prática, como saber, olhando para uma linha de código, se ela vai disparar um shuffle ou não. A resposta está na natureza da transformação: toda transformação do Spark é narrow ou wide, e essa classificação decide sozinha se existe shuffle, quantas stages um job tem e onde estão as fronteiras de paralelismo."
                    },
                    {
                        "type": "text",
                        "value": "## Narrow transformations\n\nUma transformação é narrow quando cada partição de saída depende de uma única partição de entrada correspondente, sem precisar de dados de nenhuma outra partição. `select`, `filter`, `withColumn`, `drop` e `union` são narrow: o Spark aplica a lógica dentro de cada partição, isoladamente, sem trocar nenhum byte com outro executor. Por não precisarem de dados de fora, transformações narrow são pipelined, encadeadas em uma só passada por partição, e são as mais baratas de executar em um job Spark."
                    },
                    {
                        "type": "text",
                        "value": "## Wide transformations\n\nUma transformação é wide quando uma partição de saída pode depender de várias partições de entrada, possivelmente espalhadas por executors diferentes. `groupBy`/`agg`, `join` (sem broadcast), `distinct`, `dropDuplicates`, `orderBy`/`sort` e `repartition` são wide: para produzir uma única partição de saída correta, o Spark precisa primeiro reunir dados que hoje estão em partições diferentes, o que exige shuffle. Toda transformação wide implica shuffle, e o contrário também vale: se uma transformação não é wide, ela não dispara shuffle sozinha."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Transformação\",\"Tipo\",\"Shuffle?\"],[\"select, filter, withColumn, drop\",\"Narrow\",\"Não\"],[\"union (duas fontes com o mesmo schema)\",\"Narrow\",\"Não\"],[\"groupBy / agg\",\"Wide\",\"Sim\"],[\"join (sem broadcast)\",\"Wide\",\"Sim\"],[\"distinct, dropDuplicates\",\"Wide\",\"Sim\"],[\"orderBy / sort\",\"Wide\",\"Sim\"],[\"repartition\",\"Wide\",\"Sim\"]]"
                    },
                    {
                        "type": "code",
                        "value": "STAGE 1 (narrow: pipeline em uma so passada, sem tocar disco entre etapas)\n\n  Particao 0 -> select -> filter -> withColumn -+\n  Particao 1 -> select -> filter -> withColumn -+-> shuffle write\n  Particao 2 -> select -> filter -> withColumn -+\n\n                        |\n                        |  limite de stage: groupBy e uma wide\n                        |  transformation, precisa reunir particoes\n                        |  diferentes antes de agregar\n                        v\n\nSTAGE 2 (comeca so apos o shuffle write da stage 1 terminar)\n\n  shuffle read -> groupBy(\"chave\") -> agg(sum) -> Particao Q0\n  shuffle read -> groupBy(\"chave\") -> agg(sum) -> Particao Q1"
                    },
                    {
                        "type": "text",
                        "value": "## O limite de stage: job, stage e task\n\nUm job Spark se divide em stages nos limites de cada shuffle: toda vez que uma wide transformation aparece no plano, o Spark fecha a stage atual e abre uma nova. Dentro de uma stage, a cadeia de transformações narrow é executada em pipeline, uma task por partição, sem materializar nenhum resultado intermediário em disco entre elas, parte do que o Catalyst e o Tungsten otimizam com o whole-stage codegen. Uma stage só pode começar de fato quando a stage anterior grava seus arquivos de shuffle, o que faz do número de shuffles no plano, mais do que o número de linhas de código, o fator que mais pesa na duração de um job."
                    },
                    {
                        "type": "quote",
                        "value": "Contar shuffles em um plano de execução é uma forma prática de estimar o custo de um job antes de rodar: cada wide transformation é um ponto onde o Spark para de processar em memória e passa a mover dados pela rede e pelo disco."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que select e filter são chamadas de narrow transformations?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque produzem sempre um número menor de linhas do que o DataFrame de entrada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque não podem ser combinadas com outras transformações na mesma cadeia de código",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Spark as executa exclusivamente no driver, sem distribuir entre executors",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada partição de saída depende apenas de uma partição de entrada correspondente",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline usa df1.union(df2) para juntar dois DataFrames com o mesmo schema, empilhando as linhas de um sobre o outro. Essa operação é narrow ou wide?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Narrow, cada partição de saída corresponde a uma partição de df1 ou de df2, sem shuffle",
                                "isCorrect": true
                            },
                            {
                                "text": "Wide, porque combinar dois DataFrames distintos sempre exige redistribuir as linhas por chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Narrow, mas apenas quando os dois DataFrames têm exatamente o mesmo número de partições",
                                "isCorrect": false
                            },
                            {
                                "text": "Wide, já que o resultado final precisa ser reordenado antes de qualquer ação subsequente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job executa df.select(...).filter(...).groupBy(\"uf\").agg(F.count(\"*\")).orderBy(\"uf\"). Quantas stages, no mínimo, esse job deve gerar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Duas, uma antes e outra depois do groupBy, pois orderBy não altera o número de stages",
                                "isCorrect": false
                            },
                            {
                                "text": "Quatro, uma para cada método encadeado no código, select, filter, groupBy e orderBy",
                                "isCorrect": false
                            },
                            {
                                "text": "Três, o groupBy e o orderBy são dois limites de shuffle, e cada limite abre uma nova stage",
                                "isCorrect": true
                            },
                            {
                                "text": "Depende exclusivamente do número de executors disponíveis no cluster no momento da execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de uma mesma stage, formada só por narrow transformations encadeadas, select, filter, withColumn, o Spark grava o resultado intermediário de cada transformação em disco antes de aplicar a próxima?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, cada transformação intermediária é persistida automaticamente até a próxima ação",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, as transformações são combinadas em pipeline e processadas em uma só passada por partição",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, mas apenas quando o DataFrame tem mais de duas transformações narrow em sequência",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas cada transformação ainda dispara uma leitura separada da fonte de dados original",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das transformações abaixo é classificada como wide, exigindo shuffle, mesmo operando sobre um único DataFrame, sem nenhum join?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dropDuplicates(), pois compara linhas que podem estar em partições diferentes do cluster",
                                "isCorrect": true
                            },
                            {
                                "text": "withColumn(), pois cria uma coluna nova a partir de uma expressão sobre colunas existentes",
                                "isCorrect": false
                            },
                            {
                                "text": "filter(), pois avalia uma condição booleana linha a linha dentro de cada partição",
                                "isCorrect": false
                            },
                            {
                                "text": "select(), pois pode reduzir o número de colunas mantidas no DataFrame resultante",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Particionamento: repartition x coalesce",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Particionamento: repartition x coalesce\n\nParticionamento aparece em dois momentos bem diferentes de um pipeline Spark. Durante o processamento, o número de partições em memória decide o paralelismo, quantas tasks rodam ao mesmo tempo. Na escrita, o particionamento em disco decide como os arquivos de saída ficam organizados, e quanto de cada consulta futura precisa ser lido. `repartition` e `coalesce` controlam o primeiro; `partitionBy` na escrita controla o segundo. Confundir os três é uma fonte comum de jobs lentos ou de tabelas cheias de arquivos pequenos."
                    },
                    {
                        "type": "text",
                        "value": "## repartition: redistribuir com shuffle completo\n\n`repartition(n)` redistribui o DataFrame inteiro em `n` novas partições, com um shuffle completo: cada linha é reembaralhada, geralmente por round robin (distribuição uniforme) ou por hash das colunas informadas, quando `repartition(n, \"coluna\")` ou `repartition(\"coluna\")` é usado. É a ferramenta certa para aumentar o paralelismo depois de uma leitura com poucas partições, corrigir um desbalanceamento entre partições, ou preparar o DataFrame para ser escrito particionado por uma coluna específica. O custo é sempre um shuffle completo, então `repartition` não deve ser chamado sem um motivo concreto."
                    },
                    {
                        "type": "text",
                        "value": "## coalesce: juntar partições sem shuffle completo\n\n`coalesce(n)` também muda o número de partições, mas de um jeito mais barato: em vez de redistribuir tudo, ele agrupa partições existentes que já estão próximas, sem shuffle completo. Por isso `coalesce` só reduz o número de partições, nunca aumenta, pedir mais partições do que já existem simplesmente não tem efeito. A economia tem um preço: como `coalesce` só combina o que já existe, o resultado pode ficar desbalanceado, e `coalesce(1)` em particular é uma armadilha clássica, forçar tudo em uma única partição concentra o trabalho final em uma única task, sem o rebalanceamento que um shuffle de verdade faria."
                    },
                    {
                        "type": "code",
                        "value": "repartition(3): shuffle completo, redistribui TUDO\n\n  ANTES (4 particoes desbalanceadas)      DEPOIS (3 particoes uniformes)\n   P0: [######]                            N0: [#####]\n   P1: [##]                                N1: [#####]\n   P2: [####]                              N2: [#####]\n   P3: [#]\n\ncoalesce(2): so agrupa particoes vizinhas, sem shuffle completo\n\n  ANTES (4 particoes)                     DEPOIS (2 particoes, desiguais)\n   P0: [######]  --+\n   P1: [##]         +--> M0: [########]\n   P2: [####]  --+\n   P3: [#]          +--> M1: [#]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"repartition\",\"coalesce\"],[\"Shuffle\",\"Completo, redistribui todos os dados\",\"Evita shuffle completo, só junta partições vizinhas\"],[\"Direção\",\"Aumenta ou reduz o número de partições\",\"Só reduz o número de partições\"],[\"Distribuição resultante\",\"Uniforme (round robin ou hash da coluna)\",\"Pode ficar desigual, depende das partições de origem\"],[\"Custo típico\",\"Mais alto\",\"Mais baixo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Particionar na escrita: small files x partições gigantes\n\n`df.write.partitionBy(\"uf\").parquet(caminho)` grava um diretório separado para cada valor distinto da coluna, o chamado particionamento Hive. Uma consulta futura que filtra por `uf` lê só os diretórios relevantes, partition pruning, ignorando o resto do dado no disco. O ganho depende da coluna escolhida: uma coluna de cardinalidade baixa ou média (uf, data, categoria) cria diretórios de tamanho razoável; uma coluna de cardinalidade alta (id_pedido, cpf) cria milhares de diretórios minúsculos, o problema de small files, que pesa no armazenamento e deixa leituras futuras mais lentas, cada arquivo pequeno tem um custo fixo de abertura. No outro extremo, poucas partições muito amplas geram arquivos gigantes, que limitam o paralelismo de quem lê depois."
                    },
                    {
                        "type": "code",
                        "value": "# risco de small files: muitas particoes em memoria, poucos\n# valores distintos na coluna de escrita\npedidos.repartition(200).write.partitionBy(\"uf\").parquet(caminho)\n# cada uma das 200 particoes em memoria pode gerar um arquivo\n# por valor de \"uf\", multiplicando o total de arquivos pequenos\n\n# ajuste: alinhar o numero de particoes em memoria ao numero de\n# valores distintos da coluna usada no particionamento da escrita\n(\n    pedidos\n    .repartition(\"uf\")  # uma particao por valor de uf\n    .write\n    .partitionBy(\"uf\")\n    .parquet(caminho)\n)"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre repartition(n) e coalesce(n) quanto ao número de partições que cada um pode produzir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "repartition só reduz o número de partições, coalesce pode aumentar ou reduzir livremente",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois métodos só conseguem reduzir o número de partições já existentes no DataFrame",
                                "isCorrect": false
                            },
                            {
                                "text": "repartition pode aumentar ou reduzir o número de partições, coalesce só reduz",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois métodos só conseguem aumentar o número de partições já existentes no DataFrame",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de escrever o resultado final, um engenheiro adiciona .coalesce(1) a um pipeline que processava um DataFrame de 500 GB em 400 partições, esperando gerar um único arquivo de saída. O job passa a demorar muito mais e quase estoura a memória de um executor. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "coalesce(1) força um shuffle completo dos 500 GB antes de gravar o arquivo único",
                                "isCorrect": false
                            },
                            {
                                "text": "coalesce(1) só funciona corretamente quando o DataFrame já está ordenado por chave",
                                "isCorrect": false
                            },
                            {
                                "text": "coalesce(1) precisa recalcular o DataFrame inteiro a partir da fonte de dados original",
                                "isCorrect": false
                            },
                            {
                                "text": "coalesce(1) reúne todas as partições em uma só, e uma única task processa tudo sozinha",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de eventos é lida com frequência filtrando por data_evento, mas foi escrita sem nenhum particionamento por coluna, em um único diretório. Qual mudança na escrita reduz mais diretamente o volume de dados lido nessas consultas futuras?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escrever com df.write.partitionBy(\"data_evento\"), criando um diretório por valor da coluna",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de partições em memória com repartition antes de qualquer leitura futura",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar cache() no DataFrame logo após a leitura, antes de qualquer filtro por data",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter os arquivos de Parquet para CSV, reduzindo o tempo de abertura de cada arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job faz uma leitura ampla, 200 partições, aplica um filter seletivo e, em seguida, coalesce(10) antes de um cálculo pesado por partição. O tempo total do job fica pior do que sem o coalesce, mesmo escrevendo menos arquivos ao final. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "coalesce(10) obriga o Spark a reler os dados de origem já agrupados em 10 partições",
                                "isCorrect": false
                            },
                            {
                                "text": "O coalesce reduziu também o paralelismo do cálculo pesado, que passou a rodar em só 10 tasks",
                                "isCorrect": true
                            },
                            {
                                "text": "coalesce sempre executa mais lento que repartition, independentemente do número de partições",
                                "isCorrect": false
                            },
                            {
                                "text": "O filter aplicado antes do coalesce se tornou uma wide transformation nesse cenário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela é escrita com df.repartition(200).write.partitionBy(\"pais\").parquet(caminho), mas \"pais\" tem só 5 valores distintos e o volume total é pequeno. O resultado são milhares de arquivos minúsculos espalhados em 5 diretórios. Qual ajuste resolve o problema de small files nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar partitionBy(\"pais\") por partitionBy(\"id_pedido\"), uma coluna de maior cardinalidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o Parquet e escrever em CSV, que não sofre com o problema de muitos arquivos pequenos",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar ainda mais o número de partições em memória antes da escrita, para 500 ou mais",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de partições em memória antes da escrita, próximo do número de países",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Data skew",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Data skew\n\nAté aqui, o shuffle foi tratado como se distribuísse a carga igualmente entre as partições de destino. Na prática, isso depende dos dados: se uma chave concentra muito mais linhas do que as outras, o shuffle reúne essa chave inteira em uma única partição, e a task responsável por ela recebe uma carga desproporcional. Esse desequilíbrio, chamado de data skew, é uma das causas mais comuns, e mais mal diagnosticadas, de jobs Spark lentos, porque o cluster inteiro pode estar ocioso, esperando uma única task terminar."
                    },
                    {
                        "type": "text",
                        "value": "## O que é data skew\n\nData skew acontece quando a distribuição de valores de uma chave é muito desigual: um cliente que responde por boa parte dos pedidos, um produto muito mais vendido que os demais, um identificador nulo usado como valor padrão. Em qualquer operação com shuffle, groupBy, join, repartition por coluna, essa chave concentrada cai inteira em uma única partição de destino, e a task que processa essa partição tem muito mais trabalho que as demais. O resultado típico: enquanto a maioria das tasks termina em segundos, uma ou duas ficam rodando minutos ou horas, ou estouram a memória do executor tentando processar tudo de uma vez."
                    },
                    {
                        "type": "code",
                        "value": "Distribuicao de linhas por chave, apos o shuffle de\ngroupBy(\"cliente_id\")\n\n  cliente_1  -> Particao 0: ############################  (2.400.000 linhas)\n  cliente_2  -> Particao 1: ##                              (8.000 linhas)\n  cliente_3  -> Particao 2: #                               (5.000 linhas)\n  cliente_4  -> Particao 3: ##                              (7.500 linhas)\n\n  Tasks 1, 2 e 3 terminam em poucos segundos.\n  Task 0 ainda esta processando minutos depois,\n  ou estoura a memoria do executor."
                    },
                    {
                        "type": "text",
                        "value": "## Sintomas no Spark UI e a chave nula\n\nNo Spark UI, o sintoma característico é uma stage onde quase todas as tasks terminam rápido e uma ou poucas ficam muito acima da mediana de duração, a aba de tasks de uma stage mostra o tempo mínimo, mediano e máximo, e um máximo muito distante do resto é o sinal. O job parece travado perto do fim, em 99%, esperando essas tasks retardatárias, com a maioria dos executors ociosos. Outro indício é um volume de Shuffle Read muito maior em uma task específica que nas demais. Uma causa frequente é a chave nula: linhas sem valor de chave, um cliente_id ausente, um evento sem categoria, costumam ser tratadas como um único valor, e se o volume dessas linhas for grande, elas formam sozinhas uma partição enorme."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mitigação\",\"Como funciona\"],[\"Salting\",\"Divide a chave concentrada em várias chaves artificiais, espalhando a carga entre mais partições\"],[\"AQE skew join\",\"O Spark detecta, em tempo de execução, uma partição de shuffle muito maior que as demais e a divide em pedaços menores\"],[\"Isolar a chave (ex.: nulos)\",\"Processa a fatia problemática, como um valor nulo ou padrão, separada do restante e une os resultados depois\"],[\"Broadcast join\",\"Elimina o shuffle do lado grande quando o outro lado é pequeno, contornando o desbalanceio da chave (aula 5)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# sem salting: cliente_1 concentra a maioria das linhas em\n# uma unica particao apos o shuffle de groupBy\npedidos.groupBy(\"cliente_id\").agg(F.sum(\"valor\"))\n\n# salting: cria uma chave artificial com um sufixo aleatorio,\n# espalhando a chave concentrada entre N particoes\nN = 8\nsalgado = pedidos.withColumn(\n    \"chave_salgada\",\n    F.concat(col(\"cliente_id\"), F.lit(\"_\"), (F.rand() * N).cast(\"int\")),\n)\n\n# 1a agregacao: parcial, por chave salgada (mais espalhada)\nparcial = salgado.groupBy(\"cliente_id\", \"chave_salgada\").agg(\n    F.sum(\"valor\").alias(\"subtotal\")\n)\n\n# 2a agregacao: remove o sal e soma os parciais, resultado\n# identico ao groupBy original, so que sem a task gigante\nfinal = parcial.groupBy(\"cliente_id\").agg(F.sum(\"subtotal\").alias(\"total\"))"
                    },
                    {
                        "type": "quote",
                        "value": "Data skew não é um problema de cluster, é um problema de dados que só aparece na hora do shuffle. Aumentar executors ou memória raramente resolve uma chave desbalanceada, o ajuste certo quase sempre está em mudar como essa chave é distribuída, não em dar mais recursos ao job."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um cenário de data skew em um job Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O cluster tem menos executors ativos do que o número de partições configuradas no job",
                                "isCorrect": false
                            },
                            {
                                "text": "O DataFrame inteiro é grande demais para caber na memória de qualquer executor sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma chave concentra parte desproporcional dos dados, deixando uma task sobrecarregada",
                                "isCorrect": true
                            },
                            {
                                "text": "O plano de execução gerado pelo Catalyst nunca foi otimizado antes de rodar esse job",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma stage de 200 tasks, no Spark UI, 199 tasks terminam em menos de 10 segundos e uma única task continua rodando por 40 minutos, processando muito mais shuffle read do que as demais. Investigando, a chave dessa task é NULL. O que isso sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um grande volume de linhas com chave nula caiu na mesma partição, concentrando o trabalho",
                                "isCorrect": true
                            },
                            {
                                "text": "O executor daquela task específica está com um defeito de hardware isolado no cluster",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst não sabe lidar com valores nulos e processa essas linhas fora do paralelismo",
                                "isCorrect": false
                            },
                            {
                                "text": "Os valores nulos sempre são processados por último, independentemente do volume de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um join entre pedidos, grande, e uma dimensão média, ambos acima do limite de broadcast, sofre com uma chave muito mais frequente que as demais, criando uma partição de shuffle desproporcional. Sem alterar nenhuma linha de código do job, qual recurso do Spark pode mitigar esse desbalanceio automaticamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar manualmente o número de executors até a chave desbalanceada parar de incomodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar o AQE, que detecta a partição desproporcional e a divide em pedaços bem menores",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o join por um left_anti, que ignora linhas de chaves muito frequentes automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar cache() nas duas tabelas antes do join, reduzindo o custo do shuffle desbalanceado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para mitigar o skew de uma chave concentrada em um groupBy, um engenheiro aplica a técnica de salting: adiciona um sufixo aleatório à chave antes de agregar. Depois da agregação parcial por chave salgada, o que ainda falta para chegar ao resultado final, equivalente ao groupBy original?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada, a agregação por chave salgada já é o resultado final esperado pelo pipeline",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover as linhas com sufixo aleatório, pois elas representam duplicatas do processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar coalesce(1) sobre o resultado parcial, unindo as partições salgadas em uma só",
                                "isCorrect": false
                            },
                            {
                                "text": "Agregar novamente, agora pela chave original sem o sufixo, somando os resultados parciais",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de pedidos tem 40 milhões de linhas, das quais 6 milhões têm cliente_id nulo, pedidos de convidados, sem cadastro. Um join dessa tabela com clientes por cliente_id sofre skew forte na chave nula. Qual abordagem trata essa chave separadamente, sem afetar o join das demais chaves?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Substituir todo cliente_id nulo por zero antes do join, unificando a chave em uma partição",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar bastante o número de partições de shuffle do job inteiro, de 200 para 2000",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar as linhas de cliente_id nulo, processá-las à parte e unir os dois resultados depois",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar orderBy(\"cliente_id\") antes do join, para agrupar os nulos em uma única task ordenada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Broadcast join e reduzir shuffle",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Broadcast join e reduzir shuffle\n\nO módulo anterior tratou join como uma wide transformation que sempre embaralha os dois lados pela rede. Isso é verdade quando as duas tabelas são grandes, mas deixa de ser necessário em um caso muito comum: uma tabela grande de fatos, pedidos, eventos, unida a uma tabela pequena de dimensão, status, categoria, país. Quando um dos lados cabe folgado na memória de um executor, o Spark tem uma estratégia bem mais barata do que embaralhar os dois lados inteiros."
                    },
                    {
                        "type": "text",
                        "value": "## Sort-merge join: o caminho padrão para dois lados grandes\n\nQuando os dois DataFrames envolvidos no join são grandes, o Spark usa, por padrão, o sort-merge join: os dois lados são particionados pela chave, shuffle nos dois, cada partição resultante é ordenada, e as linhas com a mesma chave são casadas em uma varredura sequencial. É uma estratégia sólida e previsível, mas cara: os dois DataFrames inteiros atravessam a rede e o disco antes de qualquer linha ser efetivamente unida."
                    },
                    {
                        "type": "text",
                        "value": "## Broadcast join: copiar o lado pequeno, eliminar o shuffle do lado grande\n\nQuando um dos lados é pequeno o bastante, o Spark pode copiar essa tabela inteira para a memória de cada executor, em vez de embaralhá-la. Com uma cópia local completa da tabela pequena, cada executor faz o join olhando só para as partições que já tem do lado grande, sem mover nenhum byte dele pela rede. O Catalyst decide isso automaticamente comparando o tamanho estimado da tabela menor com `spark.sql.autoBroadcastJoinThreshold` (10 MB por padrão), e o mesmo resultado pode ser forçado explicitamente com a função `F.broadcast(df_pequeno)` no join."
                    },
                    {
                        "type": "code",
                        "value": "SORT-MERGE JOIN (os dois lados sao grandes, os dois sofrem shuffle)\n\n  pedidos (grande)          clientes (grande)\n  particionado                particionado\n  por chave (shuffle)         por chave (shuffle)\n          \\                        /\n           v                      v\n         particoes com a mesma chave, casadas em sequencia\n\nBROADCAST JOIN (um lado e pequeno o bastante para caber em memoria)\n\n  pedidos (grande, fica no lugar)        clientes (pequeno)\n   P0    P1    P2    P3                  copiado INTEIRO para\n    |     |     |     |                  a memoria de CADA executor\n    v     v     v     v                         |\n   join local em cada particao  <----------------+\n   (sem shuffle de pedidos)"
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql.functions import broadcast\n\n# automatico: o Catalyst compara o tamanho estimado de\n# status_pedido com o limite configurado e escolhe broadcast\npedidos.join(status_pedido, \"status_id\")\n\n# explicito: forca o broadcast independente da estimativa\n# de tamanho (util quando a estatistica do Catalyst esta desatualizada)\npedidos.join(broadcast(status_pedido), \"status_id\")\n\n# ajustar o limite usado na decisao automatica (padrao: 10 MB)\nspark.conf.set(\"spark.sql.autoBroadcastJoinThreshold\", 50 * 1024 * 1024)\n\n# desligar o broadcast automatico por completo\nspark.conf.set(\"spark.sql.autoBroadcastJoinThreshold\", -1)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Broadcast join\",\"Sort-merge join\"],[\"Quando o Spark escolhe\",\"Um dos lados está abaixo do limite de broadcast configurado\",\"Os dois lados são grandes, acima do limite de broadcast\"],[\"Shuffle do lado grande\",\"Não ocorre\",\"Ocorre nos dois lados\"],[\"Onde o lado pequeno fica\",\"Copiado inteiro para a memória de cada executor\",\"Particionado e embaralhado como o lado grande\"],[\"Risco principal\",\"Estourar memória se o lado \\\"pequeno\\\" for grande demais\",\"Custo de shuffle e ordenação nos dois lados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Broadcast join não é gratuito, ele troca o custo de rede de um shuffle pelo custo de memória de manter uma cópia inteira da tabela em cada executor. O limite configurado existe exatamente para isso: forçar um broadcast maior do que a memória disponível transforma uma otimização em uma causa de falha por memória."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um broadcast join, no Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma estratégia que ordena as duas tabelas pela chave antes de uni-las em cada partição",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma estratégia que copia a tabela menor para a memória de cada executor, evitando shuffle",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma estratégia que divide a tabela maior em pedaços menores antes do shuffle",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma estratégia que executa o join inteiramente no driver, sem distribuir entre executors",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um join entre pedidos, 300 GB, e uma tabela de status_pedido com 6 linhas, poucos KB, roda automaticamente sem nenhum shuffle visível na tabela pequena, mesmo sem nenhuma dica explícita no código. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tamanho estimado de status_pedido está abaixo do limite, e o Catalyst escolhe broadcast sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark sempre faz broadcast de qualquer tabela com menos de 100 linhas, por padrão fixo",
                                "isCorrect": false
                            },
                            {
                                "text": "pedidos, por ser maior, é automaticamente particionado em blocos do tamanho de status_pedido",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst elimina o join por completo quando um dos lados tem poucas linhas distintas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro força F.broadcast(dim_produtos) em um join, mas dim_produtos cresceu e hoje tem 4 GB. O job passa a falhar com erro de memória, tanto no driver quanto nos executors. Qual é a explicação mais direta para essa falha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "F.broadcast() só funciona corretamente para tabelas com menos de 3 colunas",
                                "isCorrect": false
                            },
                            {
                                "text": "O broadcast converteu automaticamente o join em um cross join entre as duas tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "O AQE desabilitou o broadcast e forçou um shuffle completo sem avisar o engenheiro",
                                "isCorrect": false
                            },
                            {
                                "text": "O driver precisa coletar dim_produtos inteira antes de enviá-la aos executors",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Dois DataFrames de 200 GB cada precisam ser unidos por uma chave, e nenhum dos dois cabe nos critérios de broadcast. Qual estratégia de join o Spark utiliza por padrão nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Broadcast join, replicando metade de cada tabela entre os executors disponíveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Nested loop join, comparando cada linha de um lado com todas as linhas do outro",
                                "isCorrect": false
                            },
                            {
                                "text": "Sort-merge join, particionando e ordenando os dois lados pela chave antes da junção",
                                "isCorrect": true
                            },
                            {
                                "text": "Cross join, combinando cada linha de uma tabela com todas as linhas da outra",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O Catalyst, por padrão, não faria broadcast em um join porque a tabela menor está pouco acima do limite configurado, mas um engenheiro sabe que ela cabe com folga na memória dos executors. Como forçar o broadcast mesmo assim, sem alterar a configuração global do cluster?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentando manualmente o número de partições de shuffle antes de executar o join",
                                "isCorrect": false
                            },
                            {
                                "text": "Envolvendo a tabela menor com F.broadcast() na chamada do join, como dica ao Catalyst",
                                "isCorrect": true
                            },
                            {
                                "text": "Convertendo as duas tabelas para RDD antes do join, o que ativa o broadcast automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicando repartition(1) na tabela menor, reduzindo seu tamanho estimado para o Catalyst",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Otimização e tuning",
        "aulas": [
            {
                "titulo": "cache e persist: quando e como",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# cache e persist: quando e como\n\nAvaliação lazy significa que um DataFrame não guarda dado nenhum: ele guarda um plano. Cada vez que uma ação (`count()`, `collect()`, `write()` etc.) é disparada sobre esse DataFrame, o Spark executa o plano inteiro de novo, do zero, lendo a fonte e refazendo cada transformação no caminho. Quando o mesmo DataFrame alimenta duas, três ou dez ações diferentes, esse recálculo se repete a cada vez, mesmo que o resultado intermediário seja idêntico. É esse desperdício que `cache()` e `persist()` resolvem."
                    },
                    {
                        "type": "text",
                        "value": "## O custo de recalcular\n\nImagine um DataFrame que lê um Parquet de 50 GB, filtra colunas e aplica uma agregação cara. Se esse DataFrame alimenta três etapas diferentes de um pipeline (uma contagem, um resumo por categoria e uma gravação final), sem cache o Spark repete a leitura do Parquet e a agregação três vezes inteiras. O plano lógico não muda, mas o trabalho físico é refeito a cada ação."
                    },
                    {
                        "type": "code",
                        "value": "# sem cache: cada acao reexecuta o plano inteiro\ndf = spark.read.parquet(\"/dados/pedidos\")\npedidos_sp = df.filter(df.uf == \"SP\").join(clientes, \"id_cliente\")\n\npedidos_sp.count()                                   # le o parquet e faz o join\npedidos_sp.groupBy(\"produto\").sum(\"valor\").show()    # le o parquet e faz o join de novo\npedidos_sp.write.parquet(\"/saida/pedidos_sp\")         # le o parquet e faz o join uma terceira vez\n\n# com cache: o plano so roda de verdade na primeira acao\npedidos_sp = df.filter(df.uf == \"SP\").join(clientes, \"id_cliente\").cache()\n\npedidos_sp.count()                                   # materializa e guarda o resultado\npedidos_sp.groupBy(\"produto\").sum(\"valor\").show()    # reaproveita o que ja foi cacheado\npedidos_sp.write.parquet(\"/saida/pedidos_sp\")         # reaproveita de novo, sem reler o parquet"
                    },
                    {
                        "type": "text",
                        "value": "## cache() x persist(storageLevel)\n\n`cache()` é um atalho para `persist()` com o nível de armazenamento padrão. Para DataFrame e Dataset, esse padrão é `MEMORY_AND_DISK`: o Spark tenta manter as partições em memória e usa disco local para o que não couber. `persist()` aceita um `StorageLevel` explícito, importado de `pyspark`, para os casos em que o padrão não é a melhor escolha."
                    },
                    {
                        "type": "table",
                        "value": "[[\"StorageLevel\", \"O que guarda\"], [\"MEMORY_ONLY\", \"Só em memória; partição que não cabe é descartada e recalculada quando for necessária de novo\"], [\"MEMORY_AND_DISK\", \"Em memória; o que não cabe transborda para disco local (padrão ao chamar cache() num DataFrame)\"], [\"DISK_ONLY\", \"Só em disco local, sem tentar guardar nada em memória\"], [\"MEMORY_AND_DISK_2\", \"Como MEMORY_AND_DISK, porém replicado em dois executors para tolerar a perda de um deles\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando ajuda, quando atrapalha\n\n- **Ajuda** quando o mesmo DataFrame é reaproveitado por várias ações ou consultas (relatórios múltiplos, um loop que itera sobre o mesmo conjunto, exploração num notebook).\n- **Atrapalha** quando o DataFrame é usado uma única vez: você paga o custo de materializar e guardar o resultado sem nunca colher o benefício do reuso.\n- Cache em excesso compete por memória com a execução do restante do job, o que pode gerar mais *spill* para disco em vez de menos.\n- Diferente do `checkpoint()` (que grava em armazenamento confiável e corta o lineage), o cache não corta o lineage: se uma partição cacheada for perdida, o Spark a recalcula usando o plano original.\n- Sempre chame `unpersist()` quando o DataFrame cacheado não for mais necessário, liberando memória e disco para o resto do job."
                    },
                    {
                        "type": "quote",
                        "value": "cache() só compensa quando o mesmo resultado intermediário é reaproveitado mais de uma vez; usado num DataFrame de uso único, ele só adiciona custo sem nunca devolver o benefício."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um DataFrame é usado por três ações diferentes seguidas (count(), show() e write()) sem nenhuma chamada a cache() ou persist(). O que acontece com o plano desse DataFrame a cada uma dessas ações?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Spark reaproveita automaticamente o resultado da primeira ação nas duas ações seguintes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark materializa o plano em disco na primeira ação e o reaproveita nas ações seguintes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark reexecuta o plano inteiro do zero em cada ação, já que nada foi materializado entre elas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark executa as três ações em paralelo, dividindo o plano entre os executors disponíveis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline gera `resumo = pedidos.groupBy(\"categoria\").agg(...)` e essa variável é usada em duas etapas seguintes: montar um relatório e gravar uma tabela agregada. O job está lento porque o agrupamento, uma operação cara, roda duas vezes. Qual mudança resolve isso com o menor esforço?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Chamar `resumo.cache()` logo após o `groupBy().agg()`, antes de usar o resultado nas duas etapas seguintes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reescrever o `groupBy` como uma função UDF em Python para reduzir o tempo de cada execução do agrupamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições de shuffle bem acima do padrão de 200, configurado em `spark.sql.shuffle.partitions`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o `groupBy().agg()` por um `join` com uma tabela auxiliar já agregada previamente em outro job.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao chamar `df.cache()` num DataFrame, sem especificar nenhum `StorageLevel`, qual nível de armazenamento o Spark usa por padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "MEMORY_ONLY: mantém tudo em memória e descarta partições que não couberem, sem usar disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "DISK_ONLY: grava todas as partições em disco local, sem tentar usar memória do executor.",
                                "isCorrect": false
                            },
                            {
                                "text": "OFF_HEAP: guarda as partições em memória fora do heap da JVM, sem depender do disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "MEMORY_AND_DISK: tenta manter as partições em memória e usa disco local para o que não couber.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro adiciona `.cache()` após cada leitura de DataFrame no job inteiro, achando que isso deixa qualquer pipeline mais rápido. Depois da mudança, o job ficou mais lento e passou a apresentar mais spill para disco. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O `cache()` obriga o Spark a usar um único executor para todo o processamento, eliminando o paralelismo entre tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vários DataFrames usados uma única vez foram cacheados sem necessidade, competindo por memória com a execução do job.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `cache()` desliga o Catalyst Optimizer para os DataFrames afetados, impedindo o predicate pushdown nas leituras.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `cache()` força uma conversão de DataFrame para RDD internamente, perdendo as otimizações do Tungsten.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que um DataFrame cacheado não é mais necessário no restante do job, qual é a prática recomendada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Chamar `unpersist()` explicitamente, liberando a memória e o disco ocupados por esse DataFrame.",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar o DataFrame cacheado até o fim da aplicação, já que o Spark nunca reutiliza esse espaço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriar a SparkSession inteira, já que essa é a única forma de remover um DataFrame da memória.",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamar `checkpoint()` no lugar de `unpersist()`, o que também libera a memória ocupada pelo cache.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O Catalyst Optimizer e o plano",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O Catalyst Optimizer e o plano\n\nTodo DataFrame ou query Spark SQL passa pelo Catalyst antes de virar trabalho de verdade nos executors. O Catalyst é o otimizador de consultas do Spark SQL: ele pega o plano lógico que você escreveu (a sequência de `select`, `filter`, `join` etc.) e o transforma num plano físico eficiente, aplicando regras de otimização automaticamente, sem que você precise pedir."
                    },
                    {
                        "type": "text",
                        "value": "## As quatro fases do Catalyst\n\n- **Análise**: resolve nomes de colunas e tabelas contra o catálogo, checando se o que você escreveu faz sentido.\n- **Otimização lógica**: aplica regras baseadas em heurísticas, como *predicate pushdown* e *column pruning*, reescrevendo o plano sem mudar o resultado.\n- **Planejamento físico**: gera um ou mais planos físicos candidatos (por exemplo, qual algoritmo de join usar) e escolhe um deles.\n- **Geração de código**: compila trechos do plano físico em bytecode JVM otimizado (*whole-stage code generation*), parte do Tungsten."
                    },
                    {
                        "type": "code",
                        "value": "df = spark.read.parquet(\"/dados/vendas\")\nresultado = df.filter(df.uf == \"SP\").select(\"id_pedido\", \"valor\")\nresultado.explain()\n\n# == Physical Plan ==\n# *(1) Project [id_pedido#12, valor#15]\n# +- *(1) Filter (isnotnull(uf#10) AND (uf#10 = SP))\n#    +- *(1) ColumnarToRow\n#       +- FileScan parquet [id_pedido#12,uf#10,valor#15] Batched: true,\n#          DataFilters: [isnotnull(uf#10), (uf#10 = SP)],\n#          Format: Parquet,\n#          PushedFilters: [IsNotNull(uf), EqualTo(uf,SP)],\n#          ReadSchema: struct<id_pedido:int,uf:string,valor:double>"
                    },
                    {
                        "type": "text",
                        "value": "## Predicate pushdown e column pruning\n\nRepare em duas linhas do plano acima. `PushedFilters` mostra que o filtro `uf = 'SP'` foi empurrado para dentro da leitura do Parquet: o Spark descarta blocos que não têm nenhuma linha com `uf = 'SP'` antes mesmo de trazer os dados para os executors. `ReadSchema` mostra só três colunas, embora a tabela de vendas tenha muitas outras: o Catalyst percebeu que só `id_pedido`, `uf` e `valor` são usadas no plano e evitou ler o resto. As duas técnicas otimizam o mesmo recurso: menos dado lido do disco e da rede."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\", \"O que faz\", \"Onde aparece no plano\"], [\"Predicate pushdown\", \"Empurra filtros para a fonte de dados, antes da leitura\", \"PushedFilters no FileScan\"], [\"Column pruning\", \"Lê apenas as colunas usadas no plano, não a tabela inteira\", \"ReadSchema no FileScan\"], [\"Constant folding\", \"Resolve expressões constantes em tempo de otimização\", \"Aparece simplificado, sem a expressão original\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## explain() com mais detalhe\n\n`resultado.explain()` mostra só o plano físico. Para ver todas as fases, use `resultado.explain(mode=\"extended\")` (ou `explain(True)`), que imprime o plano lógico não resolvido, o plano lógico analisado, o plano lógico otimizado e o plano físico, nessa ordem. Isso ajuda a enxergar qual regra do Catalyst mudou o plano, e não apenas o resultado final."
                    },
                    {
                        "type": "quote",
                        "value": "Ler o plano físico com explain() não é curiosidade acadêmica: é o jeito mais direto de confirmar se o filtro que você escreveu chegou até a fonte de dados, ou se o Spark está lendo mais do que precisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o papel do Catalyst Optimizer num job Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Distribuir as partições dos DataFrames entre os executors disponíveis no cluster, de forma balanceada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compactar os arquivos Parquet gravados pelo job, reduzindo o espaço ocupado no armazenamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar o plano lógico de um DataFrame ou query SQL num plano físico eficiente, aplicando otimizações.",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerenciar a alocação de memória entre os executors, decidindo quanto cada um recebe do cluster manager.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O plano físico de uma leitura de Parquet mostra `PushedFilters: [EqualTo(uf,SP)]` e `ReadSchema` com apenas três das quinze colunas da tabela original. O que esse trecho do plano confirma?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a tabela de origem foi reescrita em disco com apenas as três colunas usadas nessa consulta específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Spark criou um índice sobre a coluna `uf` para acelerar consultas futuras com esse mesmo filtro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o resultado da consulta já está cacheado em memória para as próximas ações sobre esse DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o filtro por UF e a seleção de colunas foram aplicados antes da leitura completa dos dados em disco.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual a diferença entre `df.explain()` e `df.explain(mode=\"extended\")`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O primeiro mostra o plano em texto; o segundo mostra o mesmo plano, mas como um gráfico interativo no navegador.",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro mostra só o plano físico; o segundo mostra também os planos lógicos, do não resolvido ao otimizado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O primeiro roda antes da ação; o segundo só pode ser chamado depois que uma ação já foi executada no DataFrame.",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro funciona para DataFrame; o segundo é a única forma de ver o plano de uma query em Spark SQL puro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um filtro escrito como uma UDF Python (`df.filter(minha_udf(df.uf))`) aparece no plano físico sem nenhum `PushedFilters` correspondente, mesmo lendo de uma fonte Parquet particionada por UF. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Catalyst não consegue interpretar a lógica de uma UDF para empurrá-la como filtro, então lê os dados por inteiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "UDFs em Python sempre desativam o Catalyst Optimizer para o restante do plano, não só para o próprio filtro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fontes Parquet particionadas não suportam predicate pushdown, independentemente de o filtro ser uma UDF ou não.",
                                "isCorrect": false
                            },
                            {
                                "text": "O predicate pushdown só existe para filtros aplicados depois de um `join`, nunca antes de outras transformações.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela Parquet tem 40 colunas. Uma consulta faz `df.select(\"id\", \"valor\").filter(df.valor > 100)`. Por que o column pruning traz mais benefício aqui do que sobre um CSV com as mesmas 40 colunas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque arquivos CSV não podem ser lidos por mais de um executor ao mesmo tempo, ao contrário do Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o column pruning só é uma regra do Catalyst aplicável a formatos binários, nunca a formatos de texto puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Parquet é colunar e permite ler só as colunas pedidas; o CSV é lido linha inteira, mesmo com poucas colunas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Parquet grava um índice separado com o valor mínimo e máximo de cada coluna, dispensando leitura de dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Adaptive Query Execution (AQE)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Adaptive Query Execution (AQE)\n\nAté aqui, todo plano de execução foi decidido antes do job rodar, com base em estimativas: tamanho aproximado das tabelas, número de partições configurado, estatísticas nem sempre atualizadas. O Adaptive Query Execution, o AQE, muda esse jogo: a partir do Spark 3.0, o Spark pode reotimizar o plano *durante* a execução, usando estatísticas reais colhidas depois de cada shuffle, não apenas estimativas feitas antes de começar."
                    },
                    {
                        "type": "text",
                        "value": "## Como o AQE decide reotimizar\n\nUm shuffle é um ponto natural de checkpoint: para embaralhar os dados, o Spark já precisa materializar as partições intermediárias. O AQE aproveita esse ponto para medir o tamanho real de cada partição e, com esse dado em mãos, ajustar o restante do plano antes de continuar. Sem shuffle no meio da query, não existe esse ponto de parada, e o AQE não tem o que reotimizar."
                    },
                    {
                        "type": "code",
                        "value": "# a partir do Spark 3.2 o AQE vem ligado por padrao;\n# em versoes anteriores (3.0 e 3.1) e preciso habilitar\nspark.conf.set(\"spark.sql.adaptive.enabled\", \"true\")\n\n# as tres otimizacoes do AQE tem flags proprias,\n# todas ligadas por padrao quando o AQE esta ativo\nspark.conf.set(\"spark.sql.adaptive.coalescePartitions.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.skewJoin.enabled\", \"true\")"
                    },
                    {
                        "type": "text",
                        "value": "## As três otimizações do AQE\n\n- **Coalescer partições de shuffle**: depois do shuffle, o Spark junta partições pequenas em tasks maiores, evitando um exército de tasks minúsculas quando `spark.sql.shuffle.partitions` ficou alto demais para o volume real de dados.\n- **Trocar a estratégia de join**: se, depois de um filtro ou agregação, um dos lados do join ficar menor que `spark.sql.autoBroadcastJoinThreshold`, o AQE troca um sort-merge join por um broadcast join em tempo de execução, mesmo que a estimativa inicial não previsse isso.\n- **Dividir partições com skew**: detecta uma partição de shuffle muito maior que as demais, na entrada de um join, e a quebra em pedaços menores, para que uma única task não segure o estágio inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Configuração\", \"O que controla\", \"Padrão\"], [\"spark.sql.adaptive.enabled\", \"Liga o AQE como um todo\", \"true desde o Spark 3.2\"], [\"spark.sql.adaptive.coalescePartitions.enabled\", \"Junta partições pequenas de shuffle em tasks maiores\", \"true\"], [\"spark.sql.adaptive.skewJoin.enabled\", \"Divide partições de shuffle desproporcionalmente grandes\", \"true\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que você ganha\n\nAntes do AQE, ajustar `spark.sql.shuffle.partitions` era um exercício manual: um valor bom para uma tabela de 5 GB é péssimo para a mesma query rodando sobre 500 GB. Com AQE, esse número vira um teto inicial, e o Spark ajusta o número real de partições depois do shuffle, com base no volume que de fato chegou. O mesmo vale para joins: em vez de depender só de *hints* manuais de broadcast espalhados pelo código, o AQE decide com dados reais, coletados durante a própria execução."
                    },
                    {
                        "type": "quote",
                        "value": "O AQE não substitui o Catalyst: ele complementa o plano decidido antes da execução com ajustes feitos depois, quando o Spark finalmente sabe o tamanho real dos dados, não apenas a estimativa."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o Adaptive Query Execution (AQE) no Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um mecanismo que reescreve o código Python do job antes de submetê-lo ao cluster manager para execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um mecanismo que reotimiza o plano de execução em tempo real, usando estatísticas colhidas após um shuffle.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um mecanismo que aumenta automaticamente o número de executors do cluster sempre que um job está lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um mecanismo que grava um checkpoint completo do DataFrame a cada estágio, para tolerar falhas de executor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma query agrega uma tabela pequena, de poucos megabytes, usando o `spark.sql.shuffle.partitions` padrão de 200. Sem AQE, isso gera 200 tasks minúsculas na etapa de agregação. Com o AQE ligado, o que muda nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O AQE reduz `spark.sql.shuffle.partitions` para 1 automaticamente, processando toda a agregação numa única task.",
                                "isCorrect": false
                            },
                            {
                                "text": "O AQE ignora a configuração de shuffle partitions e usa sempre o número de cores disponíveis no cluster inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O AQE move a agregação inteira para o driver, evitando o shuffle entre executors nesse caso específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "O AQE junta as partições de shuffle pequenas num número menor de tasks, proporcional ao volume real de dados.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um join entre duas tabelas grandes tem, do lado direito, um filtro aplicado antes do join que reduz o resultado para poucos megabytes, algo que só se confirma durante a execução. Com o AQE ligado, o que pode acontecer com a estratégia desse join?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Spark pode trocar um sort-merge join, planejado inicialmente, por um broadcast join, com base no tamanho real.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark cancela o join e exige que o código seja reescrito manualmente com um hint de broadcast explícito.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark mantém o sort-merge join original, já que a estratégia de join é sempre decidida antes da execução começar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark converte automaticamente o join num produto cartesiano, por ser mais simples de reotimizar em tempo real.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num shuffle antes de um join, uma partição concentra 80% dos dados por causa de um valor de chave muito frequente, enquanto as outras 199 partições dividem os 20% restantes. Uma única task demora vinte minutos enquanto as demais terminam em segundos. Com `spark.sql.adaptive.skewJoin.enabled` ativo, como o AQE trata esse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Remove do join as linhas associadas à chave mais frequente, processando-as num job separado, fora do plano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Redistribui aleatoriamente as 200 partições, sem considerar quais delas de fato concentram o volume desproporcional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Detecta a partição desproporcionalmente grande e a divide em pedaços menores, processados em paralelo por várias tasks.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumenta o tempo limite da task para vinte minutos, permitindo que a partição grande termine sem travar o estágio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job faz apenas `select` e `filter` sobre uma tabela, sem nenhum `groupBy`, `join` ou `repartition`, ou seja, sem nenhum shuffle no plano. Qual é o efeito esperado do AQE nesse job?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O AQE força um shuffle artificial no meio do plano, só para poder coletar estatísticas reais dos dados lidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum efeito relevante: sem um shuffle para materializar estatísticas reais, o AQE não tem o que reotimizar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O AQE substitui o `filter` por um `join` broadcast interno, para criar um ponto de checkpoint no plano.",
                                "isCorrect": false
                            },
                            {
                                "text": "O AQE reduz o número de partições de leitura para uma só, já que não há shuffle para justificar o paralelismo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Memória, partições e paralelismo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Memória, partições e paralelismo\n\nAjustar um job Spark é, na prática, equilibrar três recursos: quanta memória cada executor tem, quantos cores processam tasks em paralelo, e em quantas partições os dados estão divididos. Errar esse equilíbrio custa caro dos dois lados: partições grandes ou memória curta demais geram spill e falhas de memória; partições pequenas ou memória sobrando demais desperdiçam paralelismo e recursos do cluster."
                    },
                    {
                        "type": "text",
                        "value": "## Memória do executor\n\n`spark.executor.memory` define a memória heap de cada executor, usada tanto para execução (shuffles, joins, agregações, ordenação) quanto para armazenamento (cache). As duas competem pela mesma área, controlada por `spark.memory.fraction`, mas podem emprestar espaço uma da outra sob demanda. Além do heap, `spark.executor.memoryOverhead` reserva memória fora da JVM, como buffers de rede; jobs em PySpark ainda somam a memória do processo Python que roda ao lado da JVM do executor."
                    },
                    {
                        "type": "code",
                        "value": "spark-submit --executor-memory 8g --executor-cores 4 --num-executors 10 --conf spark.sql.shuffle.partitions=400 transformar_pedidos.py\n\n# 10 executors x 4 cores = ate 40 tasks rodando em paralelo ao mesmo tempo"
                    },
                    {
                        "type": "text",
                        "value": "## Partições: quantas e de que tamanho\n\nNa leitura, o número de partições nasce do tamanho dos arquivos de origem, limitado por `spark.sql.files.maxPartitionBytes` (128 MB por padrão). Já no shuffle (`groupBy`, `join`, `repartition`), quem decide é `spark.sql.shuffle.partitions`, com padrão histórico de 200, independente do volume de dados. Como regra prática, uma partição na faixa de 128 MB a 200 MB costuma equilibrar bem paralelismo e overhead de agendamento: partições menores multiplicam tasks pequenas demais para compensar o custo fixo de cada uma; partições maiores concentram trabalho demais em poucas tasks, e cada uma pode faltar memória."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sintoma\", \"Causa provável\", \"Ajuste\"], [\"Milhares de tasks de poucos milissegundos\", \"Partições pequenas demais para o volume de dados\", \"Reduzir spark.sql.shuffle.partitions ou usar coalesce\"], [\"Poucas tasks muito longas, com spill alto\", \"Partições grandes demais para a memória disponível\", \"Aumentar spark.sql.shuffle.partitions ou repartition\"], [\"Executors ociosos com poucas tasks rodando\", \"Poucos cores ou poucos executors para o cluster disponível\", \"Aumentar spark.executor.cores ou o número de executors\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Spill para disco\n\nQuando os dados de uma task (numa ordenação, agregação ou join) não cabem na memória de execução alocada para ela, o Spark grava parte deles em disco local e retoma depois, um processo chamado *spill*. Spill ocasional não é motivo de alarme, mas spill constante e volumoso é sinal claro de que a partição está grande demais para a memória disponível, e a saída típica é aumentar o número de partições, reduzindo quanto dado cada task processa por vez, ou aumentar a memória do executor."
                    },
                    {
                        "type": "quote",
                        "value": "Mais memória resolve sintoma; menos dado por partição resolve causa. Antes de simplesmente aumentar `spark.executor.memory`, vale perguntar se o problema não é uma partição grande demais para qualquer memória razoável."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a configuração `spark.sql.shuffle.partitions` controla?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número de partições geradas ao ler um arquivo Parquet, com base no tamanho de cada bloco de arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de executors disponíveis para o job, alocados pelo cluster manager no início da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de cores usados por cada executor para processar tasks em paralelo durante o job inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de partições geradas depois de uma operação de shuffle, como um `groupBy` ou um `join`.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job agrega uma tabela de 2 GB usando o `spark.sql.shuffle.partitions` padrão de 200, resultando em partições de shuffle de poucos megabytes cada, e o Spark UI mostra milhares de tasks terminando em menos de um segundo. Qual ajuste reduz o overhead de agendamento nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir `spark.sql.shuffle.partitions` para um valor mais próximo do volume real de dados dessa agregação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar `spark.sql.shuffle.partitions` para um valor bem acima de 200, distribuindo ainda mais os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar `spark.executor.memory` de cada executor, mantendo o mesmo número de partições de shuffle configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o `groupBy` por um `join` com uma tabela auxiliar, evitando a etapa de shuffle da agregação original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O Spark UI mostra spill alto (memória e disco) numa etapa de `join` entre duas tabelas grandes, com poucas partições de shuffle configuradas para o volume de dados. Qual ajuste ataca a causa mais provável do spill?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o `join` por um `union` entre as duas tabelas, eliminando a necessidade de embaralhar dados entre executors.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições de shuffle, reduzindo o volume de dados processado por cada task individual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o número de partições de shuffle, concentrando o processamento em menos tasks para simplificar o plano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar o Catalyst Optimizer para essa consulta, permitindo que o Spark escolha o plano físico mais simples.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job PySpark com UDFs pesadas falha com erro de memória mesmo com `spark.executor.memory` configurado generosamente, enquanto o uso do heap da JVM do executor aparece longe do limite. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "UDFs em Python são executadas dentro do driver, não dos executors, então a memória relevante é a do driver.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Catalyst Optimizer ignora completamente jobs com UDFs, então nenhuma configuração de memória afeta esses jobs.",
                                "isCorrect": false
                            },
                            {
                                "text": "O processo Python que roda ao lado da JVM do executor também consome memória, fora do heap alocado ao executor.",
                                "isCorrect": true
                            },
                            {
                                "text": "`spark.executor.memory` só se aplica a jobs escritos em Scala; jobs PySpark usam exclusivamente memória do sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como regra prática de tamanho, o que costuma equilibrar bem paralelismo e overhead de agendamento numa partição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Algo na faixa de 1 MB a 5 MB por partição, priorizando o máximo de paralelismo possível entre as tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo na faixa de 2 GB a 5 GB por partição, priorizando o menor número possível de tasks no job inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tamanho fixo de exatamente 64 MB por partição, igual ao tamanho de bloco padrão do HDFS no cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo na faixa de 128 MB a 200 MB por partição, evitando tanto tasks minúsculas quanto tasks pesadas demais.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ler o Spark UI para achar o gargalo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ler o Spark UI para achar o gargalo\n\nAntes de mexer em qualquer configuração de memória, partições ou cache, a pergunta certa é: onde exatamente esse job está perdendo tempo? O Spark UI, disponível por padrão na porta 4040 do driver enquanto a aplicação roda, responde essa pergunta com dados reais de execução, não com suposições. Otimizar sem antes diagnosticar é, na melhor das hipóteses, sorte."
                    },
                    {
                        "type": "text",
                        "value": "## As abas que importam\n\n- **Jobs**: lista os jobs disparados por cada ação, com duração total e status; o primeiro lugar para ver qual ação está demorando mais.\n- **Stages**: lista os estágios de cada job, um por fronteira de shuffle; mostra duração, volume lido e escrito, e métricas agregadas das tasks.\n- **SQL**: mostra o plano de execução de forma visual, com métricas reais anotadas em cada operação (linhas processadas, tempo, dados embaralhados), o mesmo plano do `explain()`, mas com números de verdade.\n- **Executors**: mostra uso de memória, disco e tarefas ativas por executor, útil para achar desequilíbrio entre eles."
                    },
                    {
                        "type": "code",
                        "value": "Jobs\n  -> job #3 (write parquet)          12 min\n     -> Stages\n        -> stage 5 (groupBy)          9 min    <- gargalo\n           Shuffle Read: 340 GB\n           Spill (Memory): 210 GB\n           Spill (Disk): 95 GB\n        -> stage 6 (write)             3 min\n           Shuffle Read: 12 GB"
                    },
                    {
                        "type": "text",
                        "value": "## Achando o estágio lento\n\nNa aba Stages, ordene por duração: o estágio no topo da lista é onde o job gasta a maior parte do tempo. Antes de investigar código, olhe as colunas de shuffle read e shuffle write daquele estágio: um volume desproporcional ali costuma apontar para um shuffle mal dimensionado, seja por poucas partições, seja por um join que deveria ter sido broadcast."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal no Spark UI\", \"O que indica\"], [\"Spill (Memory) e Spill (Disk) altos numa stage\", \"Partições grandes demais para a memória de execução disponível\"], [\"Task máxima muito acima da mediana, no resumo da stage\", \"Data skew: uma partição concentra dados demais\"], [\"Muitas tasks terminando quase instantaneamente\", \"Partições pequenas demais para o volume de dados\"], [\"Executors com uso de tarefas bem desigual entre si\", \"Desbalanceamento de carga entre executors, ligado a skew\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Tasks desbalanceadas: o sinal do skew\n\nO resumo de métricas de uma stage traz a duração mínima, os percentis 25, 50 (mediana) e 75, e a duração máxima entre as tasks daquela stage. Quando a task máxima leva, digamos, dez vezes mais tempo que a mediana, isso quase sempre aponta para data skew: uma partição concentra um volume de dados muito maior que as demais, e o estágio inteiro fica esperando essa única task terminar, mesmo com dezenas de outras já ociosas."
                    },
                    {
                        "type": "quote",
                        "value": "O Spark UI existe para substituir o palpite pelo diagnóstico: antes de aumentar memória, mexer em partições ou ligar uma flag de tuning, vale confirmar, com números reais, qual estágio é o gargalo e por quê."
                    }
                ],
                "questions": [
                    {
                        "statement": "Onde no Spark UI é possível ver o plano de execução de uma query com métricas reais (linhas processadas, dados embaralhados) anotadas em cada operação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na aba Executors, que mostra o uso de memória e disco de cada executor durante a execução do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na aba SQL, que mostra o mesmo plano do `explain()`, com números reais de execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na aba Environment, que lista todas as configurações do Spark aplicadas naquela sessão específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na aba Storage, que mostra os DataFrames cacheados e o espaço ocupado por cada um deles.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job com vários estágios está mais lento do que o esperado, mas não está claro qual parte do pipeline é a responsável. Qual é o primeiro passo mais direto para localizar o gargalo no Spark UI?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Abrir a aba Stages e ordenar por duração, identificando o estágio que consome a maior parte do tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Abrir a aba Environment e conferir se alguma configuração de memória ficou abaixo do valor padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reescrever o job inteiro usando RDDs no lugar de DataFrames, para obter métricas mais detalhadas de cada etapa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar `spark.sql.shuffle.partitions` para o dobro do valor atual e comparar a duração total do job.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No resumo de métricas de uma stage, a task mediana leva 8 segundos, mas a task máxima leva 95 segundos, e o estágio inteiro só termina quando essa última task conclui. O que esse padrão de duração sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falha de rede: a task mais lenta perdeu conexão com o driver e precisou ser reenviada para outro executor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache insuficiente: a ausência de `cache()` nessa etapa faz uma única task recalcular o plano inteiro sozinha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bug no Catalyst: o otimizador gerou um plano físico diferente para essa task específica, sem relação com os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data skew: uma partição concentra um volume de dados desproporcional em relação às demais partições da stage.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma stage no Spark UI mostra duração das tasks bem equilibrada entre si (mediana e máxima próximas), mas `Spill (Disk)` alto em praticamente todas as tasks. Qual conclusão os dados sustentam, e qual ajuste é o mais coerente com esse diagnóstico?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É um caso clássico de data skew, já que spill em disco só ocorre quando uma partição concentra a maioria dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um problema de rede entre executors, então a solução mais coerente é reduzir o número de executors do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é skew, pois as tasks estão equilibradas; é memória insuficiente para o volume por partição, e repartition ajuda.",
                                "isCorrect": true
                            },
                            {
                                "text": "É uma limitação do formato de leitura, então a solução mais coerente é converter a fonte de CSV para JSON antes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma stage do Spark UI mostra milhares de tasks, a grande maioria terminando em poucos milissegundos, para um volume de dados relativamente pequeno. O que esse padrão costuma sinalizar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um data skew invertido, em que a maioria das partições está praticamente vazia, exceto por uma sobrecarregada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Partições pequenas demais para o volume de dados, com o overhead de agendar cada task pesando mais que o trabalho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma falha silenciosa de leitura, em que a maior parte dos arquivos de origem não foi encontrada pelos executors.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cache mal configurado, em que o `StorageLevel` escolhido não permite reaproveitar partições entre as tasks.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Spark na prática de engenharia de dados",
        "aulas": [
            {
                "titulo": "Um job de ETL em batch com Spark",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Um job de ETL em batch com Spark\n\nOs módulos anteriores explicaram como o Spark funciona por dentro: a arquitetura de driver e executors, o DAG e o Catalyst, o shuffle, a otimização e o tuning. Este último módulo fecha a trilha olhando para o outro lado da mesma moeda: como esse motor aparece no dia a dia de um engenheiro de dados, num job real que roda todo dia em produção.\n\nUm job de ETL em batch com Spark segue a mesma estrutura de qualquer pipeline de ETL: ler os dados de origem, transformar segundo as regras de negócio e escrever o resultado num destino. A diferença é que, aqui, cada uma dessas três etapas é expressa com a API de DataFrame que a trilha já cobriu, e roda distribuída entre os executors do cluster."
                    },
                    {
                        "type": "code",
                        "value": "# job_faturamento_diario.py\nimport argparse\nfrom pyspark.sql import SparkSession\nfrom pyspark.sql import functions as F\n\n\ndef parse_args():\n    parser = argparse.ArgumentParser()\n    parser.add_argument('--data', required=True, help='data de referencia, formato AAAA-MM-DD')\n    return parser.parse_args()\n\n\ndef main():\n    args = parse_args()\n    spark = SparkSession.builder.appName('faturamento_diario').getOrCreate()\n\n    # ler: carrega a origem ja filtrando pela data de referencia recebida\n    pedidos = (\n        spark.read.parquet('s3://bronze/pedidos/')\n        .filter(F.col('data_pedido') == args.data)\n    )\n\n    # transformar: regras de negocio desta camada\n    faturamento = (\n        pedidos\n        .filter(F.col('status') != 'cancelado')\n        .groupBy('data_pedido', 'loja_id')\n        .agg(F.sum('valor_total').alias('faturamento'))\n    )\n\n    # escrever: grava o resultado no destino\n    faturamento.write.mode('overwrite').partitionBy('data_pedido').parquet('s3://silver/faturamento_por_loja/')\n\n    spark.stop()\n\n\nif __name__ == '__main__':\n    main()"
                    },
                    {
                        "type": "text",
                        "value": "## SparkSession: o ponto de entrada\n\nTodo job PySpark começa criando uma `SparkSession`, o ponto de entrada único para tudo que a trilha já usou: criar DataFrames, rodar consultas Spark SQL, ajustar configurações. Antes do Spark 2.0 existiam `SparkContext`, `SQLContext` e `HiveContext` separados; a `SparkSession` unificou os três, e o `SparkContext` continua acessível por baixo, em `spark.sparkContext`, para quem precisa da API mais antiga de RDD.\n\nO padrão `SparkSession.builder` aceita `appName` (o nome que aparece nos logs e na interface do cluster) e `config` para ajustar parâmetros como o número de partições de shuffle. Em produção, o `master` normalmente não é fixado dentro do script: quem define onde e como o job roda é o comando usado para submetê-lo, assunto de uma aula mais à frente neste módulo."
                    },
                    {
                        "type": "text",
                        "value": "## Parametrizar por data\n\nUm job de batch quase sempre processa uma fatia de tempo: os pedidos de ontem, os eventos da última hora, o mês fechado. Se essa data vier de `datetime.now()` escrita direto no código, o job só sabe processar hoje, e reprocessar um dia específico do passado (um backfill, depois de corrigir um bug ou receber dados atrasados) vira uma edição manual do script antes de rodar de novo.\n\nA alternativa, usada no exemplo desta aula, é receber a data como argumento (`--data`), passado por quem executa o job, seja uma pessoa via linha de comando ou o orquestrador via `spark-submit`. O mesmo script processa qualquer data, incluindo o backfill de um dia antigo, sem precisar de nenhuma alteração de código."
                    },
                    {
                        "type": "text",
                        "value": "## Idempotência: o cuidado com overwrite e partitionBy\n\nUm job de batch idempotente pode ser reexecutado para a mesma data quantas vezes for preciso, sempre chegando ao mesmo resultado, sem duplicar nem perder dados. Isso liga direto ao que a trilha de ETL já cobriu: a estratégia de carga mais simples para um job particionado por data é sobrescrever apenas a partição daquele dia.\n\nAqui mora uma pegadinha real: `write.mode('overwrite')` combinado com `partitionBy` usa, por padrão, o modo estático de sobrescrita de partição. Nesse modo o Spark apaga todas as partições existentes no destino antes de escrever as novas, não só a partição da data processada. Reexecutar o job do exemplo anterior para reprocessar um dia específico apagaria também os demais dias já gravados ali."
                    },
                    {
                        "type": "code",
                        "value": "# antes de escrever, muda o modo de sobrescrita de particao para dinamico:\n# so as particoes presentes no DataFrame sao substituidas, as demais ficam intactas\nspark.conf.set('spark.sql.sources.partitionOverwriteMode', 'dynamic')\n\nfaturamento.write.mode('overwrite').partitionBy('data_pedido').parquet('s3://silver/faturamento_por_loja/')\n\n# reexecutando o job para uma data especifica (backfill), sem editar o codigo\n# spark-submit job_faturamento_diario.py --data 2026-07-10\n\n# no orquestrador, a mesma ideia via SparkSubmitOperator do Airflow\nprocessar = SparkSubmitOperator(\n    task_id='processar_faturamento',\n    application='jobs/job_faturamento_diario.py',\n    application_args=['--data', '{{ ds }}'],\n)"
                    },
                    {
                        "type": "quote",
                        "value": "Um job de batch só está pronto quando dá para rodar de novo, para qualquer data, sem medo do resultado mudar por acidente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a sequência que descreve a estrutura padrão de um job de ETL em batch com Spark?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ler a origem, transformar os dados e escrever o resultado no destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever o destino primeiro e só depois ler a origem para validação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar os dados em memória local antes de ler a origem de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever o schema esperado e depois ler a origem para conferi-lo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um script PySpark precisa rodar consultas em Spark SQL, criar DataFrames e ajustar configurações do job, tudo a partir de um único ponto de entrada. Qual objeto cumpre esse papel desde o Spark 2.0?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O SparkContext, mantido separado da API de DataFrame por design.",
                                "isCorrect": false
                            },
                            {
                                "text": "A SparkSession, que unifica SparkContext, SQLContext e HiveContext.",
                                "isCorrect": true
                            },
                            {
                                "text": "O SQLContext, exclusivo para consultas escritas em Spark SQL puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O HiveContext, obrigatório sempre que a origem dos dados é Parquet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de batch usa `datetime.now()` dentro do script para decidir qual data processar. Depois de corrigir um bug, o time precisa reprocessar especificamente um dia do mês passado. Qual mudança resolve isso de forma reutilizável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Remover o filtro de data, processando a origem inteira em toda execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Agendar uma execução extra exatamente à meia-noite do dia desejado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Receber a data como argumento do job, em vez de usar datetime.now().",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma cópia do script com a data de reprocessamento fixa no código.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job grava o resultado diário com write.mode('overwrite').partitionBy('data_pedido'), sem nenhuma outra configuração de escrita. Ao reexecutar só para reprocessar um dia específico, os dados de outros dias já gravados desaparecem do destino. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O partitionBy foi aplicado sobre uma coluna ausente no DataFrame de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mode('overwrite') só funciona quando combinado com o método coalesce.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark limita a escrita particionada a um único destino por execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modo estático de sobrescrita de partição apaga o destino antes de escrever.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job de batch é considerado idempotente quando ele:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "reexecutado para a mesma data, sempre chega ao mesmo resultado, sem duplicar.",
                                "isCorrect": true
                            },
                            {
                                "text": "grava sempre em modo append, acumulando o histórico de cada execução antiga.",
                                "isCorrect": false
                            },
                            {
                                "text": "roda mais rápido a cada nova execução, graças ao cache automático do Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "depende do horário exato em que o spark-submit foi disparado no dia.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Formatos e particionamento na escrita",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Formatos e particionamento na escrita\n\nA aula anterior mostrou a estrutura de um job de ETL terminando num `write`. Esta aula abre essa última etapa: qual formato escrever, como particionar o resultado em disco e quais decisões de escrita evitam um destino lento de ler. Parquet é o formato padrão de saída para esse tipo de job: colunar, comprimido, guarda o schema junto com os dados e permite que o próximo job leia só as colunas e partições de que precisa.\n\n## Particionar a escrita com partitionBy\n\n`partitionBy` grava o resultado em uma pasta por valor da coluna escolhida, no formato `coluna=valor` (particionamento estilo Hive), em vez de um único diretório com todos os arquivos misturados. Uma tabela particionada por `data_pedido` grava algo como `data_pedido=2026-07-15/`, `data_pedido=2026-07-16/`, cada pasta com os arquivos daquele dia. O ganho aparece na leitura: um filtro por data no próximo job permite ao Spark ler só a pasta daquele dia, ignorando as demais (partition pruning). A escolha da coluna importa: colunas de baixa cardinalidade (data, região, categoria) funcionam bem; uma coluna de altíssima cardinalidade, como `pedido_id`, gera uma pasta quase para cada linha, o problema oposto ao que se quer resolver."
                    },
                    {
                        "type": "code",
                        "value": "# escreve particionado por data\nfaturamento.write.mode('overwrite').partitionBy('data_pedido').parquet('s3://silver/faturamento/')\n\n# layout resultante no storage\n# s3://silver/faturamento/data_pedido=2026-07-15/part-0000.parquet\n# s3://silver/faturamento/data_pedido=2026-07-16/part-0000.parquet\n\n# leitura seguinte: o filtro por data vira partition pruning, so a pasta do dia e lida\nspark.read.parquet('s3://silver/faturamento/').filter(F.col('data_pedido') == '2026-07-16')"
                    },
                    {
                        "type": "text",
                        "value": "## Modos de escrita: overwrite, append e a sobrescrita dinâmica\n\nO `mode` do writer define o que acontece se o destino já tiver dados. `append` adiciona os novos arquivos aos que já existem, sem tocar no que estava lá; é a escolha errada para um job que pode ser reexecutado, porque rodar duas vezes para o mesmo dia duplica tudo. `overwrite` substitui o conteúdo, mas, como a aula anterior mostrou, o padrão estático apaga o destino inteiro quando combinado com `partitionBy`, a não ser que o modo dinâmico de sobrescrita de partição esteja configurado.\n\nPara um job particionado por data, a combinação mais segura costuma ser `overwrite` com a sobrescrita de partição dinâmica: troca só a partição daquele dia, sem risco de duplicar (como o `append` faria) nem de apagar os demais dias (como o `overwrite` estático faria sozinho)."
                    },
                    {
                        "type": "text",
                        "value": "## O problema dos small files\n\nCada task de escrita grava, no mínimo, um arquivo por partição de saída que ela toca. Um job com `spark.sql.shuffle.partitions` no padrão (200) escrevendo o faturamento de um único dia pode gerar até 200 arquivos pequenos dentro da mesma pasta `data_pedido=2026-07-16/`, mesmo que o volume total daquele dia caiba tranquilamente em poucos arquivos maiores.\n\nMuitos arquivos pequenos custam caro na leitura: cada arquivo tem overhead de abertura e de leitura de metadados, e sistemas de object storage, como o S3, pagam um custo extra por chamada de listagem e abertura. Um destino com milhares de arquivos de poucos KB cada costuma ser mais lento de ler do que o mesmo dado guardado em algumas dezenas de arquivos de tamanho razoável."
                    },
                    {
                        "type": "code",
                        "value": "# antipadrao: 200 tasks de shuffle podem gerar ate 200 arquivos pequenos na particao do dia\nfaturamento.write.mode('overwrite').partitionBy('data_pedido').parquet(destino)\n\n# corrigido: reparticiona pela propria coluna de saida antes de escrever\n# (linhas com o mesmo valor de data_pedido caem todas na mesma partition em memoria,\n# entao cada pasta de data recebe o resultado de uma unica task de escrita)\n(\n    faturamento\n    .repartition('data_pedido')\n    .write.mode('overwrite')\n    .partitionBy('data_pedido')\n    .parquet(destino)\n)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"Efeito\"],[\"repartition(coluna_de_particao)\",\"Uma task por valor da coluna: tende a gerar um arquivo por partição de saída\"],[\"coalesce(N)\",\"Reduz o número total de tasks de escrita, sem direcionar por valor da coluna\"],[\"Job de compactação periódico\",\"Lê uma partição com muitos arquivos pequenos e a reescreve com menos arquivos, maiores\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um dado espalhado em milhares de arquivos pequenos é rápido de escrever e lento para sempre depois, toda vez que alguém precisar lê-lo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que particionar a escrita de um Parquet por uma coluna como data_pedido acelera leituras futuras?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o Spark aplica um shuffle extra antes de qualquer leitura subsequente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um filtro pela coluna de partição lê só as pastas necessárias.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque um Parquet particionado dispensa a leitura do schema a cada consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o particionamento aumenta a taxa de compressão usada pelo Parquet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide particionar a escrita de uma tabela pela coluna pedido_id, um identificador quase único por linha. Qual é o problema mais provável dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Spark rejeita a escrita, pois partitionBy exige uma coluna do tipo data.",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura passa a ignorar por completo os filtros das próximas consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera uma pasta quase para cada linha, multiplicando os arquivos pequenos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Parquet passa a gravar essa tabela específica sem nenhuma compressão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job grava o faturamento diário com mode('append') num destino particionado por data. Depois de uma falha de rede, o time reexecuta o job para o mesmo dia sem alterar nada. Qual é o efeito mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O destino fica igual, pois o Spark identifica execuções repetidas sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "O job falha antes de escrever, pois append exige que o destino esteja vazio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente as linhas novas em relação à execução anterior são adicionadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados daquele dia ficam duplicados, pois append só adiciona arquivos novos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job processa o faturamento de um único dia, mas antes de escrever passa por um groupBy que dispara um shuffle com as 200 partições padrão do Spark. A pasta do dia termina com até 200 arquivos pequenos. Qual mudança reduz esse número sem alterar o resultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reparticionar pela coluna de partição de saída antes do write.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar ainda mais o spark.sql.shuffle.partitions antes do groupBy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o groupBy por uma função de janela equivalente antes da escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o partitionBy da escrita, gravando tudo num diretório plano.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela particionada por mês acumulou milhares de arquivos pequenos numa partição específica, por causa de reprocessamentos sucessivos ao longo de dois anos. As consultas que leem esse mês estão visivelmente mais lentas. Qual ação corrige isso sem reprocessar os dois anos inteiros?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o shuffle.partitions da instância para acelerar a leitura dos arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar um job de compactação que reescreve só aquela partição com menos arquivos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar a tabela inteira para CSV, formato que não sofre com arquivos pequenos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar o partitionOverwriteMode como estático só para essa tabela.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Onde o Spark roda",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Onde o Spark roda\n\nAté aqui, o cluster do Spark foi tratado de forma abstrata: um driver, um conjunto de executors, um cluster manager coordenando os dois. Na prática, esse cluster precisa existir em algum lugar, gerenciado por alguém, e a maioria dos times de engenharia de dados não sobe e mantém esse cluster à mão. Existe todo um mercado de serviços gerenciados justamente para isso.\n\nEsta aula fica no nível de conceito: o que cada serviço resolve, como um job chega até o cluster e uma decisão recorrente, entre manter um cluster no ar o tempo todo ou subir um cluster só para a duração do job."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Provedor\",\"Ideia central\"],[\"Amazon EMR\",\"AWS\",\"Cluster gerenciado de Spark/Hadoop/Hive, com controle fino sobre o provisionamento\"],[\"Databricks\",\"Multicloud (AWS, Azure, GCP)\",\"Plataforma criada pelos autores originais do Spark, com notebooks colaborativos e autoscaling\"],[\"AWS Glue\",\"AWS\",\"ETL serverless: roda Spark por baixo sem expor a administração do cluster\"],[\"Google Dataproc\",\"Google Cloud\",\"Cluster gerenciado de Spark/Hadoop, equivalente ao EMR na GCP\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## spark-submit: como um job chega ao cluster\n\n`spark-submit` é o utilitário de linha de comando que empacota e envia um job para rodar num cluster, seja ele um EMR, um Databricks, um Glue, um Dataproc ou um cluster standalone. Ele recebe o script, o cluster manager de destino e uma série de parâmetros de recursos: quantos executors, quanta memória e quantos núcleos por executor, entre outros.\n\nO parâmetro `--deploy-mode` decide onde o processo driver roda. Em modo `cluster`, o driver roda dentro do próprio cluster, gerenciado como qualquer outro processo; em modo `client`, o driver roda na máquina que disparou o `spark-submit` (uma máquina do orquestrador, por exemplo), que precisa permanecer ativa e conectada até o job terminar."
                    },
                    {
                        "type": "code",
                        "value": "spark-submit \\\n  --master yarn \\\n  --deploy-mode cluster \\\n  --num-executors 10 \\\n  --executor-memory 8g \\\n  --executor-cores 4 \\\n  --conf spark.sql.shuffle.partitions=200 \\\n  jobs/job_faturamento_diario.py \\\n  --data 2026-07-16"
                    },
                    {
                        "type": "text",
                        "value": "## Cluster efêmero x permanente\n\nUm cluster permanente fica no ar continuamente, compartilhado entre jobs e, às vezes, entre times: o custo existe mesmo nos períodos ociosos, mas qualquer job pode rodar a qualquer momento sem esperar o cluster subir. É comum em ambientes de uso interativo, como um Databricks usado para exploração ao longo do dia.\n\nUm cluster efêmero sobe só para a duração de um job e desce logo depois, cobrando apenas pelo tempo realmente usado. É o padrão natural para jobs de batch agendados, como o job diário desta trilha: o orquestrador dispara a criação do cluster, o job roda, o cluster é destruído. O trade-off é o tempo de subida, que soma alguns minutos de latência a cada execução antes da primeira task rodar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Cluster efêmero\",\"Cluster permanente\"],[\"Custo quando ocioso\",\"Nenhum, o cluster não existe fora da execução\",\"Existe, mesmo sem jobs rodando\"],[\"Tempo até a primeira task\",\"Minutos, por causa do provisionamento\",\"Praticamente imediato\"],[\"Uso típico\",\"Jobs de batch agendados\",\"Uso interativo e compartilhado entre times\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Escolher onde o Spark roda é, no fundo, decidir entre pagar por ociosidade ou pagar em latência de inicialização a cada execução."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando spark-submit faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Envia um job Spark a um cluster, definindo recursos e cluster manager.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cria um cluster Spark do zero, provisionando máquinas novas na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instala o Apache Spark numa máquina local, preparando o ambiente de dev.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consulta o Spark UI de um job em execução, exibindo o progresso das stages.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer rodar ETL em Spark de forma totalmente serverless na AWS, sem provisionar cluster algum, com integração nativa a um catálogo de dados. Qual serviço atende melhor esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon EMR, configurado manualmente em modo cluster standalone.",
                                "isCorrect": false
                            },
                            {
                                "text": "Google Dataproc, apontando para um bucket hospedado na AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Databricks, hospedado dentro da própria conta AWS do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "AWS Glue, serverless e já integrado ao catálogo de dados.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job de batch roda uma vez por dia, leva cerca de 25 minutos, e fora desse horário não há nenhuma outra carga no mesmo cluster. Qual abordagem reduz melhor o custo, sem comprometer a execução diária?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter um cluster permanente dimensionado para o pico do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir pela metade o número de executors do cluster permanente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Subir um cluster efêmero só para a execução e destruí-lo em seguida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar o job para rodar em --deploy-mode client em vez de cluster.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job é submetido com --deploy-mode client a partir de uma máquina do orquestrador. No meio da execução, essa máquina perde conectividade de rede com o cluster. O que acontece com o job?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O job continua normalmente, pois o driver já rodava dentro do cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "O job é afetado, pois o driver roda na própria máquina que caiu.",
                                "isCorrect": true
                            },
                            {
                                "text": "O cluster manager promove automaticamente um executor a driver.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark alterna sozinho para --deploy-mode cluster no restante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que, usando clusters efêmeros a cada execução do job diário, cerca de 4 dos 25 minutos totais são gastos antes da primeira task começar. Qual é a explicação para esse tempo extra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tempo que o Catalyst leva para montar o plano de execução do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de leitura do schema do Parquet na primeira consulta feita.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de provisionar e inicializar o cluster, antes do Spark ficar pronto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tempo de transferência do código do job até o driver via spark-submit.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Structured Streaming: uma introdução",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Structured Streaming: uma introdução\n\nTodo o processamento visto até aqui foi em batch: uma execução começa, processa um volume de dados conhecido e termina. Muitos cenários não cabem nesse modelo, casos em que os dados chegam continuamente e o processamento precisa rodar de forma contínua também, não uma vez por dia.\n\nO Structured Streaming é a resposta do Spark para esse cenário, e a ideia central é reaproveitar a mesma API de DataFrame que a trilha inteira já usou. Esta aula é só uma introdução aos conceitos; o aprofundamento em streaming, incluindo Kafka, é assunto de uma trilha própria, depois desta."
                    },
                    {
                        "type": "text",
                        "value": "## O stream como uma tabela ilimitada\n\nA abstração central do Structured Streaming é tratar um stream como uma tabela que nunca para de crescer: cada novo dado que chega é uma nova linha acrescentada ao final. A consulta que roda sobre essa tabela é escrita exatamente como uma consulta em batch, com `select`, `filter`, `groupBy`, e o Spark se encarrega de aplicar essa consulta de forma incremental, conforme novas linhas chegam.\n\nEssa escolha de design é o que permite reaproveitar a API: quem já sabe escrever uma transformação de DataFrame em batch já sabe escrever a mesma lógica em streaming, sem aprender uma API paralela."
                    },
                    {
                        "type": "code",
                        "value": "# batch: le uma vez, processa, escreve uma vez\npedidos = spark.read.parquet('s3://bronze/pedidos/')\nresumo = pedidos.groupBy('loja_id').agg(F.sum('valor_total').alias('faturamento'))\nresumo.write.mode('overwrite').parquet('s3://silver/resumo/')\n\n# streaming: a mesma transformacao, agora sobre uma fonte continua\n# (schema_pedidos definido antes; leitura em streaming de arquivos exige schema explicito)\npedidos = spark.readStream.schema(schema_pedidos).parquet('s3://bronze/pedidos/')\nresumo = pedidos.groupBy('loja_id').agg(F.sum('valor_total').alias('faturamento'))\n\nconsulta = (\n    resumo.writeStream\n    .format('console')\n    .outputMode('complete')\n    .start()\n)\nconsulta.awaitTermination()"
                    },
                    {
                        "type": "text",
                        "value": "## Micro-batch: como a execução acontece por baixo\n\nO motor padrão do Structured Streaming não processa um registro de cada vez: ele agrupa os dados chegados num intervalo em pequenos lotes (micro-batches) e roda cada lote pelo mesmo Catalyst e pelo mesmo Tungsten usados em batch. Cada micro-batch é, na prática, um job Spark comum, disparado automaticamente em ciclos.\n\nPara saber até onde já processou e conseguir retomar depois de uma falha sem reprocessar nem perder dados, o Structured Streaming grava seu progresso num `checkpointLocation`: um diretório onde ficam registrados os offsets já processados. Sem um checkpoint configurado, reiniciar a consulta depois de uma queda perde essa memória de progresso."
                    },
                    {
                        "type": "text",
                        "value": "## Fontes e sinks, em conceito\n\nUma fonte (source) é de onde o stream lê: Kafka é a mais comum em produção, mas o Structured Streaming também lê um diretório de arquivos monitorado, como no exemplo desta aula. Um sink é para onde o resultado é escrito: arquivos, Kafka novamente, ou o console, usado sobretudo para depuração local.\n\nExiste ainda o `foreachBatch`, um sink que entrega cada micro-batch como um DataFrame comum para uma função definida por quem escreve o job, permitindo reaproveitar a mesma lógica de escrita já usada em jobs batch. Esse é só um panorama: a escolha de fonte, sink e as garantias de entrega de cada combinação são o assunto central da trilha de streaming."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Papel\",\"Exemplos\"],[\"Fonte (source)\",\"Kafka, um diretório de arquivos monitorado, um socket (didático)\"],[\"Sink\",\"Arquivos, Kafka, console (depuração), foreachBatch (lógica customizada)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Structured Streaming não é uma API nova para aprender, é a mesma API de DataFrame aplicada a um dado que nunca termina de chegar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ideia central da API do Structured Streaming?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Substituir o DataFrame por uma API própria, dedicada só a dados contínuos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Processar cada registro isoladamente, assim que ele chega, sem agrupamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exigir que toda fonte seja convertida para RDD antes de qualquer transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tratar o stream como uma tabela ilimitada, com a mesma API de DataFrame do batch.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, como o motor do Structured Streaming processa os dados que chegam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em pequenos lotes periódicos (micro-batches), cada um como um job Spark comum.",
                                "isCorrect": true
                            },
                            {
                                "text": "Registro a registro, aplicando a transformação assim que cada linha chega.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente quando o volume acumulado atinge um tamanho mínimo definido em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "De uma vez só, ao final do dia, como um job batch disparado automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job batch já pronto lê um Parquet, agrupa por loja e soma o faturamento, escrevendo o resultado num novo Parquet. Mantendo a mesma lógica, qual é a mudança mínima para essa consulta rodar como streaming?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reescrever o groupBy com uma função de janela, já que ele não existe em streaming.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar spark.read por spark.readStream e write por writeStream.",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar uma coluna de timestamp antes de qualquer outra transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o DataFrame para RDD antes do groupBy e de volta na escrita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o desenvolvimento local de uma consulta em streaming, um engenheiro quer ver o resultado de cada micro-batch impresso no terminal, sem configurar nenhum destino externo. Qual sink atende esse uso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O sink kafka, apontando para um tópico de testes criado na hora.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sink foreachBatch, sem nenhuma função customizada definida.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sink console, pensado justamente para depuração local.",
                                "isCorrect": true
                            },
                            {
                                "text": "O sink parquet, apontando para um diretório temporário local.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta em streaming roda por dias sem um checkpointLocation configurado. Depois de uma queda inesperada do processo, a consulta é reiniciada. Qual é a consequência mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ela se recusa a iniciar, exigindo a criação manual de um checkpoint antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark reconstrói o checkpoint sozinho a partir dos logs do cluster manager.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente os dados chegados depois da queda deixam de ser processados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela recomeça sem nenhuma memória do que já havia processado antes da queda.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas e antipadrões de jobs Spark",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas e antipadrões de jobs Spark\n\nEsta é a última aula da trilha, e o objetivo é reunir numa lista prática o que os módulos anteriores cobriram um por um: avaliação lazy e o Catalyst, o shuffle e o particionamento, cache e o Spark UI. Cada item aqui já apareceu isolado em algum momento; a diferença é olhar para eles como uma checklist antes de considerar um job pronto para produção.\n\n## Filtrar e projetar cedo\n\nO Catalyst já reordena filtros e seleções de coluna para o mais cedo possível do plano na maioria dos casos, inclusive empurrando o filtro para dentro da própria leitura do Parquet quando possível. Ainda assim, vale manter o hábito de filtrar e selecionar só o necessário logo no início do código: além de reduzir o volume de dado nas etapas seguintes, evita depender do otimizador em casos que ele não consegue reordenar sozinho, como depois de uma UDF."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\",\"Por que importa\"],[\"Filtrar e projetar cedo\",\"Reduz o volume de dado nas etapas seguintes do job\"],[\"Evitar collect() em dado grande\",\"Preserva a memória do driver, muito menor que o cluster inteiro\"],[\"Preferir função nativa a UDF\",\"Mantém o job dentro das otimizações do Catalyst e do Tungsten\"],[\"Particionar com propósito\",\"Equilibra paralelismo sem gerar overhead de tasks demais\"],[\"Cache com critério\",\"Evita gastar memória de executor guardando dado usado uma única vez\"],[\"Ler o Spark UI\",\"Mostra onde o tempo do job realmente está sendo gasto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Evitar collect() em dado grande\n\ncollect() traz todas as linhas do DataFrame para a memória do driver, de uma vez. Isso é seguro para um resultado pequeno, como um resumo agregado, mas um collect() sobre um dado do tamanho de um dataset distribuído tenta empilhar, numa única máquina, um volume que só cabia porque estava espalhado entre todos os executors. O resultado costuma ser um erro de memória no driver, que normalmente tem bem menos recursos que o cluster somado.\n\nQuando o objetivo é só inspecionar o dado, show() ou take(n) trazem uma amostra pequena. Quando o resultado final realmente precisa sair do Spark, o caminho mais seguro é gravar num destino com write, deixando a leitura para quem for consumir depois."
                    },
                    {
                        "type": "text",
                        "value": "## UDFs, particionamento e cache: usar com critério\n\nUma UDF Python comum roda fora do Catalyst e do Tungsten: cada linha precisa ser serializada do processo da JVM para um processo Python e de volta, um custo que uma função nativa do pyspark.sql.functions não paga. A regra prática é sempre procurar a função nativa equivalente primeiro; quando não existe alternativa, uma pandas UDF, vetorizada, costuma custar bem menos que uma UDF linha a linha.\n\nParticionar bem significa ter partições suficientes para usar os executors disponíveis, sem exagerar a ponto de gerar milhares de tasks minúsculas cujo overhead de agendamento supera o trabalho de cada uma. E cache só vale a pena para um DataFrame reaproveitado mais de uma vez: cachear tudo por precaução ocupa memória de executor que outro estágio do job pode precisar."
                    },
                    {
                        "type": "code",
                        "value": "# antipadrao: UDF para algo que ja existe nativo, dado reusado sem cache, e um collect arriscado\nmaiusculo = F.udf(lambda s: s.upper())\nvendas = spark.read.parquet('s3://silver/vendas/').withColumn('loja', maiusculo(F.col('loja')))\n\nresumo_dia = vendas.groupBy('loja').agg(F.sum('valor').alias('total_dia'))\nresumo_mes = vendas.groupBy('loja').agg(F.avg('valor').alias('media_mes'))  # vendas e recalculado do zero aqui\nlinhas = vendas.collect()  # risco real de estourar a memoria do driver\n\n\n# corrigido: funcao nativa, cache no dado reaproveitado, sem trazer tudo para o driver\nvendas = (\n    spark.read.parquet('s3://silver/vendas/')\n    .withColumn('loja', F.upper(F.col('loja')))\n    .cache()\n)\n\nresumo_dia = vendas.groupBy('loja').agg(F.sum('valor').alias('total_dia'))\nresumo_mes = vendas.groupBy('loja').agg(F.avg('valor').alias('media_mes'))  # reusa o dado ja cacheado\nresumo_dia.write.mode('overwrite').parquet('s3://gold/resumo_dia/')\n\nvendas.unpersist()  # libera a memoria assim que o dado deixa de ser reaproveitado"
                    },
                    {
                        "type": "text",
                        "value": "## Ler o Spark UI para achar o gargalo\n\nAntes de tentar adivinhar por que um job está lento, o Spark UI já guarda a resposta na maioria dos casos. A aba de Stages mostra quanto tempo cada estágio levou e quanto foi gasto em shuffle; quando uma task específica, dentro de um estágio, leva muito mais tempo que as demais tasks do mesmo estágio, esse é o sintoma clássico de data skew. A aba SQL mostra o plano de execução de uma consulta, incluindo o que o Catalyst e o AQE decidiram em tempo de execução, útil para confirmar se um join saiu como broadcast ou como shuffle join.\n\nSinais como spill para disco, quando a memória do executor não bastou durante um shuffle ou uma agregação, também aparecem na UI, geralmente antes de virarem um job que falha por falta de memória. Olhar a UI antes de mudar configuração às cegas costuma economizar horas de tentativa e erro."
                    },
                    {
                        "type": "quote",
                        "value": "O Spark otimiza muita coisa sozinho, mas não decide por quem escreve o job: filtrar cedo, evitar trazer dado grande para o driver, particionar e cachear com critério continuam sendo escolha de quem escreve o código."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que usar collect() sobre um DataFrame muito grande é uma prática arriscada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Traz todas as linhas para a memória do driver, bem menor que o cluster inteiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Força o Spark a recalcular o DataFrame inteiro antes de qualquer outra ação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desabilita o Catalyst Optimizer para o restante das operações do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede que o resultado seja gravado depois num destino como Parquet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job troca uma UDF Python por F.upper() para deixar uma coluna em maiúsculas. Processando o mesmo volume, a versão com UDF é visivelmente mais lenta. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A função F.upper() só funciona em colunas já particionadas por valor.",
                                "isCorrect": false
                            },
                            {
                                "text": "A UDF serializa cada linha entre a JVM e um processo Python, fora do Catalyst.",
                                "isCorrect": true
                            },
                            {
                                "text": "UDFs em Spark rodam sempre no driver, nunca distribuídas nos executors.",
                                "isCorrect": false
                            },
                            {
                                "text": "A UDF força o Spark a desligar o Adaptive Query Execution do job inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um script usa o mesmo DataFrame, resultado de uma leitura e algumas transformações, em três agregações diferentes, sem chamar cache() em nenhum momento. Qual é o efeito mais provável dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O job falha, pois um DataFrame só pode ser referenciado uma única vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado da primeira agregação é reaproveitado automaticamente pelas outras.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark recalcula a leitura e as transformações a cada uma das três agregações.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark grava um checkpoint automático após o primeiro uso do DataFrame.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Spark UI, um estágio com 200 tasks mostra 199 delas terminando em cerca de 20 segundos, e uma única task levando 35 minutos, processando um volume bem maior que as demais. Qual problema esse padrão indica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um erro na configuração do número de executors disponíveis para o job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cache mal configurado, forçando a releitura completa da origem ali.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um problema no cluster manager, alocando recursos de forma desigual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data skew: uma partição concentrando um volume desproporcional de dado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Buscando robustez, um time passa a chamar .cache() em todo DataFrame intermediário, mesmo os usados uma única vez antes de serem descartados. Qual é o principal custo dessa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Memória de executor fica ocupada guardando dado que nunca é reaproveitado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada cache() obriga o job a reiniciar a SparkSession antes de continuar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O DataFrame cacheado some do plano de execução exibido pelo Catalyst.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark passa a ignorar o particionamento definido na leitura original.",
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
