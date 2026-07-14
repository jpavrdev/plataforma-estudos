// Seed da trilha ETL e Ingestao de Dados (roadmap de Engenharia de Dados).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-etl.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "ETL e Ingestão de Dados";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Trilha de ingestao e ETL do roadmap de Engenharia de Dados: construir pipelines que trazem dados de bancos, APIs e arquivos ate o destino analitico, de forma confiavel. ETL x ELT, extracao incremental e CDC, formatos (CSV, JSON, Parquet, Avro), transformacao e limpeza, estrategias de carga e idempotencia, e a confiabilidade da ingestao. Assume base de SQL, Python e modelagem, com foco em decisoes e cenarios.";

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
        "titulo": "Módulo 1 - Fundamentos de pipelines e ingestão de dados",
        "aulas": [
            {
                "titulo": "O que é um pipeline de dados e o papel do engenheiro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um pipeline de dados e o papel do engenheiro\n\nNuma empresa, dado nasce espalhado: o banco transacional que sustenta a aplicação, a API de um provedor de pagamento, uma planilha que o financeiro mantém à parte, os eventos que o produto gera a cada clique. Cada sistema foi construído pra resolver o seu próprio problema, não pra conversar com os outros.\n\nO problema aparece quando alguém precisa de uma resposta que depende de mais de um desses sistemas ao mesmo tempo, como quantos clientes ativos existem ou qual o custo real por pedido. Esse dado precisa sair de onde nasceu e chegar, de forma confiável e repetível, a um lugar em que possa ser consultado."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um pipeline de dados\n\nUm pipeline de dados é a sequência automatizada de etapas que extrai dado de uma ou mais origens, aplica as transformações necessárias e carrega o resultado num destino, de um jeito que esse processo possa rodar de novo, no mesmo formato, sem que alguém precise repetir o trabalho manualmente. É a infraestrutura que sustenta qualquer relatório, painel ou modelo que dependa de dado vindo de outro lugar."
                    },
                    {
                        "type": "code",
                        "value": "[ banco transacional ]   [ API de pagamentos ]   [ planilha de custos ]\n            |                     |                       |\n            +---------------------+-----------------------+\n                                  |\n                                  v\n                       [ pipeline de dados ]\n                                  |\n                                  v\n                       [ data warehouse ]"
                    },
                    {
                        "type": "text",
                        "value": "## O que separa um pipeline de um script avulso\n\nUm script que alguém roda na hora resolve o problema uma vez. Um pipeline resolve o mesmo problema de forma sustentável:\n\n- Roda sozinho, numa agenda ou disparado por evento, sem depender de alguém lembrar.\n- Trata falha: sabe o que fazer quando uma origem está fora do ar ou devolve um dado fora do esperado.\n- Pode rodar de novo sem duplicar nem corromper o destino (propriedade chamada de idempotência).\n- Expõe o que está acontecendo, com logs, métricas e alertas.\n- Tem dono, versão e histórico, como qualquer outro código que roda em produção."
                    },
                    {
                        "type": "quote",
                        "value": "O papel de um pipeline é tornar invisível, pra quem consome o dado no destino, toda a complexidade de saber de onde ele veio e como chegou até ali."
                    },
                    {
                        "type": "text",
                        "value": "## Onde o engenheiro de dados atua\n\nO engenheiro de dados fica entre quem gera o dado (times de aplicação, sistemas de terceiros, dispositivos) e quem consome o dado (análise, ciência de dados, produto). Ele não é dono do sistema de origem nem do relatório final: é responsável por construir e operar o caminho confiável entre os dois, decidir como extrair, transformar e carregar cada informação, e garantir que esse caminho continue funcionando quando o volume cresce ou uma origem muda sem aviso.\n\nNa prática, isso mistura trabalho de engenharia de software (código versionado, testado, em produção) com um conhecimento profundo de como o negócio usa o dado no fim da linha."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Script manual\", \"Pipeline de produção\"], [\"Execução\", \"Alguém precisa lembrar de rodar\", \"Agendada ou disparada por evento\"], [\"Falha numa origem\", \"Quebra silenciosamente\", \"É registrada, alertada e pode ser retomada\"], [\"Rodar de novo\", \"Risco de duplicar ou corromper o destino\", \"Seguro, pensado pra ser idempotente\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas melhor define um pipeline de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um documento que descreve, em texto, como os dados de um sistema deveriam se relacionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma sequência automatizada que leva dados de uma origem até um destino, de forma repetível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um script que um analista roda manualmente sempre que alguém pede um novo relatório atualizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma consulta SQL que junta tabelas de sistemas diferentes direto dentro de um painel de BI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de produto pede um relatório cruzando dados do banco da aplicação com uma planilha de custos mantida pelo financeiro. Qual tarefa está mais alinhada ao papel do engenheiro de dados nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Montar o painel final com os gráficos que o time de produto vai usar para acompanhar os custos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Construir um pipeline que extraia as duas origens e entregue os dados unificados num destino confiável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Decidir quais métricas de custo fazem mais sentido para a decisão de negócio que o produto quer tomar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajustar a planilha do financeiro pra que ela siga o mesmo padrão de colunas do banco da aplicação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista escreveu uma consulta que une três tabelas de bancos diferentes e a roda manualmente toda sexta-feira, antes da reunião de resultados. Qual é o principal risco dessa abordagem do ponto de vista de engenharia de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O resultado da consulta não poder ser salvo numa planilha depois de pronto e revisado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depender de alguém lembrar de rodar a consulta, sem tratamento de erro caso uma origem falhe.",
                                "isCorrect": true
                            },
                            {
                                "text": "A consulta demorar mais tempo pra rodar à medida que o volume das tabelas cresce com o tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "As três tabelas terem nomes de colunas diferentes, o que exige ajustes manuais na consulta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline carrega diariamente os pedidos de um e-commerce num data warehouse. O time percebe que o número de pedidos carregados caiu pela metade num certo dia, mas o pipeline não registrou nenhum erro. De quem é a responsabilidade de investigar essa situação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Do time de produto, porque a queda no volume de pedidos é um problema de negócio, não de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "De ninguém, porque a ausência de erro no pipeline já garante que o processo funcionou direito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Do analista que consome o relatório, porque foi ele quem percebeu o número estranho primeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Do engenheiro de dados, porque o pipeline rodou sem erro mas entregou um resultado incorreto.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que times de análise e de ciência de dados dependem de pipelines de dados bem construídos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque assim eles confiam que os dados no destino estão completos e atualizados, sem checar cada origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque pipelines eliminam de vez a necessidade de qualquer validação de qualidade dos dados recebidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque pipelines substituem por completo a necessidade de modelagem de dados no destino final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque pipelines decidem sozinhos quais métricas de negócio são relevantes pra cada análise feita.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As etapas: ingestão, transformação e carga",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# As etapas: ingestão, transformação e carga\n\nPor baixo de qualquer pipeline de dados, não importa a ferramenta ou a arquitetura escolhida, existem três etapas que sempre acontecem, em alguma ordem: ingestão (trazer o dado da origem), transformação (ajustar esse dado ao formato e à regra que o destino espera) e carga (gravar o resultado no destino). O que muda de uma arquitetura pra outra é quando e onde cada etapa roda, não se ela existe."
                    },
                    {
                        "type": "text",
                        "value": "## Ingestão\n\nIngestão é o ato de trazer o dado da origem pro ambiente do pipeline, preservando ao máximo a informação original. Nessa etapa, o foco é a conexão com a origem (autenticação, paginação, leitura de arquivo), não a qualidade do conteúdo: o dado costuma ser gravado praticamente cru, numa área chamada de staging, pra só depois ser tratado."
                    },
                    {
                        "type": "text",
                        "value": "## Transformação\n\nTransformação é onde o dado ganha sentido pro negócio: tipos são corrigidos, campos são renomeados e padronizados, duplicatas são removidas, regras são aplicadas, e às vezes dados de origens diferentes são combinados. Existem pipelines que transformam antes de carregar o resultado final, e outros que carregam o dado cru primeiro e transformam já dentro do próprio destino. Essa escolha tem nome próprio e ganha um módulo inteiro mais à frente nesta trilha."
                    },
                    {
                        "type": "text",
                        "value": "## Carga\n\nCarga é a etapa que grava o resultado, já transformado (ou ainda cru, dependendo da arquitetura), no destino que vai ser consultado: um data warehouse, um banco analítico ou um data lake. Aqui entram decisões como sobrescrever a tabela inteira, só acrescentar linhas novas, ou atualizar o que já existe, decisões que também têm um módulo dedicado mais adiante."
                    },
                    {
                        "type": "code",
                        "value": "Origem (API, JSON bruto):\n{\"id\": \"042\", \"valor\": \"129.90\", \"criado_em\": \"2026-07-01T14:32:00Z\"}\n\nIngestão (staging, tipos crus):\nstg_pedidos (id text, valor text, criado_em text)\n\nTransformação (tipagem e padronização):\nid integer, valor numeric(10,2), criado_em timestamp\n\nCarga (destino):\nfato_pedidos, particionada por data"
                    },
                    {
                        "type": "quote",
                        "value": "Ingestão traz o dado, transformação dá sentido a ele, carga entrega esse resultado pra quem vai usar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Etapa\", \"O que resolve\", \"Exemplo\"], [\"Ingestão\", \"Como trazer o dado da origem sem perder nem alterar sua informação\", \"Ler pedidos de uma API paginada\"], [\"Transformação\", \"Como ajustar o dado ao formato e à regra que o destino espera\", \"Converter texto de data em timestamp, remover duplicata\"], [\"Carga\", \"Como e onde gravar o resultado final\", \"Inserir os registros na tabela de pedidos do warehouse\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Considerando as três etapas clássicas de um pipeline, o que acontece na etapa de ingestão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os dados são trazidos da origem até o pipeline, preservando ao máximo sua informação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dados são gravados de forma definitiva na tabela que o time de análise consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados são limpos, padronizados e ajustados às regras de negócio do destino final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados são agregados e resumidos em métricas prontas pra consumo no relatório final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline lê pedidos de uma API em JSON, onde o campo valor vem como texto (\"129.90\") e a data como string no formato ISO. Antes de gravar no data warehouse, o time converte valor pra numérico e data pra timestamp. A qual etapa do pipeline pertence essa conversão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ingestão, porque qualquer ajuste feito logo após ler a origem já conta como extração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Carga, porque a conversão só é aplicada no momento em que o dado é gravado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformação, porque ajusta o tipo e o formato do dado às regras do destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Extração incremental, porque conversão de tipo só entra quando o pipeline roda de forma incremental.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de transformar os dados de vendas, um pipeline grava o resultado numa tabela do data warehouse que o time financeiro consulta todo dia. Esse passo final, de gravar o dado já pronto no destino, é chamado de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extração, a etapa que lê o dado bruto direto do sistema onde ele nasceu originalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Carga, a etapa que entrega o resultado transformado no destino que será consultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ingestão, a etapa que traz o dado da origem até o ambiente do pipeline pela primeira vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformação, a etapa que ajusta o dado às regras de negócio antes de ele ser usado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois pipelines resolvem o mesmo problema de formas diferentes: um transforma os dados antes de gravá-los no destino, o outro grava os dados brutos primeiro e só depois roda a transformação dentro do próprio destino. O que isso mostra sobre as três etapas de um pipeline?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A etapa de ingestão deixa de existir quando o dado bruto é gravado direto no destino final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pipelines que carregam o dado bruto primeiro não chegam a realizar a etapa de transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem e o local onde a transformação acontece podem variar, mas as três etapas continuam presentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um dos dois pipelines está incorreto, porque a transformação sempre precisa acontecer antes da carga.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação melhor resume a relação entre as três etapas de um pipeline de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ingestão traz o dado, transformação dá sentido a ele e carga entrega o resultado pra quem vai usar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ingestão e carga são a mesma etapa vista de ângulos diferentes, e a transformação é sempre opcional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformação é a única etapa obrigatória, já que ingestão e carga dependem da ferramenta usada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Carga acontece antes da ingestão sempre que o pipeline lê dados direto de um data warehouse.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Batch x streaming: os dois modos de ingestão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Batch x streaming: os dois modos de ingestão\n\nTodo pipeline precisa decidir com que ritmo vai trazer o dado da origem. Existem, no fundo, dois modos possíveis: processar em lotes, esperando um volume de dados se acumular antes de mover tudo de uma vez, ou processar de forma contínua, tratando cada evento assim que ele acontece. São os dois modos de ingestão, batch e streaming."
                    },
                    {
                        "type": "text",
                        "value": "## Batch: processar em lotes\n\nNum pipeline batch, o dado se acumula na origem e o pipeline roda numa agenda (a cada hora, todo dia de madrugada) processando de uma vez tudo o que se acumulou desde a última execução. É o modo mais simples de construir, testar e depurar, e costuma ter o melhor throughput por unidade de recurso, já que processa grandes volumes de uma só vez. O custo é a latência: o dado mais recente só fica disponível na próxima execução agendada."
                    },
                    {
                        "type": "text",
                        "value": "## Streaming: processar de forma contínua\n\nNum pipeline streaming, cada evento é processado assim que chega, sem esperar um lote se formar, o que reduz a latência pra segundos. Em troca, streaming exige uma infraestrutura pensada pra rodar continuamente, com monitoramento constante, e costuma ser mais difícil de operar e depurar do que um batch. Esta trilha só apresenta o conceito aqui: streaming ganha um aprofundamento próprio mais adiante no roadmap."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Batch\", \"Streaming\"], [\"Latência\", \"Minutos a horas, depende da janela de execução\", \"Segundos a poucos minutos\"], [\"Throughput\", \"Alto, processa um grande volume de uma vez\", \"Menor por evento, mas contínuo\"], [\"Operação\", \"Mais simples de construir e depurar\", \"Exige monitoramento e infraestrutura contínuos\"], [\"Exemplo de uso\", \"Fechamento financeiro do dia anterior\", \"Bloqueio de uma transação suspeita em segundos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Batch:\n[ origem ] --(lote a cada 1 hora)--> [ pipeline ] --> [ destino ]\n\nStreaming:\n[ origem ] --(evento a evento, contínuo)--> [ pipeline ] --> [ destino ]"
                    },
                    {
                        "type": "text",
                        "value": "## Latência x throughput: o trade-off central\n\nA escolha entre batch e streaming raramente é sobre qual modo é \"melhor\": é sobre qual latência a decisão de negócio realmente exige. Streaming reduz o tempo entre o dado nascer e ficar disponível, mas custa mais em complexidade operacional. Batch aceita um atraso maior em troca de simplicidade e de processar mais dado por execução. Adotar streaming sem um motivo de negócio que justifique a latência baixa costuma trazer complexidade sem retorno."
                    },
                    {
                        "type": "quote",
                        "value": "Antes de escolher streaming, pergunte: alguém vai realmente agir sobre esse dado nos próximos segundos, ou um relatório de amanhã de manhã já resolve?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre ingestão em batch e em streaming?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Batch processa dados acumulados em lotes, enquanto streaming processa cada evento assim que ocorre.",
                                "isCorrect": true
                            },
                            {
                                "text": "Batch grava direto no destino final, enquanto streaming sempre passa antes por uma área de staging.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch é usado apenas para dados históricos, enquanto streaming é usado apenas para dados de teste.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch só funciona com arquivos CSV, enquanto streaming só funciona com dados vindos de APIs REST.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa fecha o resultado financeiro do mês sempre na manhã seguinte, usando dados consolidados até a meia-noite. Qual modo de ingestão atende esse requisito com menor complexidade operacional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Streaming, combinado com um lote diário adicional só pra conferir se os dados batem certo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch, rodando uma vez por dia após a meia-noite, já que a janela de um dia atende o requisito.",
                                "isCorrect": true
                            },
                            {
                                "text": "Batch, mas rodando a cada poucos segundos pra garantir que nenhuma transação fique de fora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Streaming, porque qualquer processo financeiro precisa refletir cada transação em tempo real.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de detecção de fraude precisa bloquear uma transação suspeita antes que ela seja concluída, poucos segundos depois de o cliente iniciar o pagamento. Qual modo de ingestão essa necessidade de negócio exige?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Batch, executando a cada poucos minutos pra reduzir o atraso entre a transação e a análise.",
                                "isCorrect": false
                            },
                            {
                                "text": "Streaming, porque a decisão precisa ser tomada com base no evento assim que ele acontece.",
                                "isCorrect": true
                            },
                            {
                                "text": "Streaming, mas só durante o horário comercial, quando o volume de transações é maior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch, desde que o pipeline rode logo após o fechamento do lote de transações do dia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide migrar um pipeline de batch diário pra streaming, mesmo sem nenhum caso de uso que exija dado em segundos, só porque streaming parece mais moderno. Qual é o risco mais provável dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Impedir que o pipeline consiga processar dados vindos de bancos relacionais tradicionais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o throughput total de dados que o pipeline consegue processar por dia inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar bastante a complexidade operacional do pipeline sem ganho real pro negócio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Tornar impossível reprocessar dados antigos caso um erro seja encontrado depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em qual cenário a ingestão em batch costuma ser a escolha mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quando o negócio precisa reagir a cada evento individual, em poucos segundos, assim que ocorre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o destino dos dados é um sistema que não aceita nenhum tipo de escrita em lote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando a origem dos dados é uma fila de mensagens que só entrega eventos um de cada vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando um atraso de horas até o dado ficar disponível não compromete a decisão de negócio.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fontes e destinos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Fontes e destinos\n\nTodo pipeline liga pelo menos uma origem a pelo menos um destino. Entender a natureza de cada origem (como ela guarda o dado, como se conecta a ela, que limites ela impõe) e de cada destino (pra que tipo de consulta ele foi otimizado) molda praticamente toda decisão de ingestão que vem depois."
                    },
                    {
                        "type": "text",
                        "value": "## Fontes comuns\n\n- **Bancos relacionais**: o banco transacional (OLTP) que sustenta uma aplicação, otimizado pra transação, não pra leitura em massa.\n- **APIs de terceiros**: provedores de pagamento, CRM, ferramentas de marketing, cada uma com sua própria autenticação e seus próprios limites de uso.\n- **Arquivos**: CSV, JSON, planilhas e logs, muitas vezes exportados manualmente ou entregues por outro sistema.\n- **Object storage**: um espaço de armazenamento de arquivos em escala, onde dados já pousam prontos pra leitura.\n- **Filas de mensagens**: eventos publicados por outro sistema assim que algo acontece, consumidos pelo pipeline conforme chegam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fonte\", \"Característica\", \"Cuidado principal\"], [\"Banco relacional (OLTP)\", \"Otimizado pra transação, não pra leitura em massa\", \"Não sobrecarregar o banco de produção durante a extração\"], [\"API de terceiros\", \"Acesso controlado por autenticação e limite de uso\", \"Respeitar o rate limit e tratar a paginação\"], [\"Arquivo (CSV, JSON, planilha)\", \"Estrutura pode variar entre exportações\", \"Validar o schema a cada nova carga recebida\"], [\"Fila de mensagens\", \"Entrega eventos conforme eles acontecem\", \"Garantir que nenhuma mensagem se perca ou duplique\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Destinos comuns\n\n- **Data warehouse**: banco otimizado pra consulta analítica, geralmente colunar, na nuvem. É o destino padrão de quem faz BI e relatório.\n- **Data lake**: armazenamento de dado bruto ou semiestruturado, em grande escala, sem exigir um schema definido de antemão. Tema com trilha própria mais à frente, aqui fica só o conceito.\n- **Banco analítico especializado**: um banco dedicado a um tipo específico de consulta ou carga de trabalho analítica.\n\nA escolha do destino depende de quem vai consumir o dado: um time de BI que roda consulta estruturada se beneficia de um warehouse; um time de ciência de dados explorando dado ainda bruto se beneficia de um lake."
                    },
                    {
                        "type": "code",
                        "value": "[ banco OLTP ]   [ API terceiros ]   [ arquivo CSV ]   [ fila de eventos ]\n       |                |                  |                  |\n       +----------------+------------------+------------------+\n                                 |\n                                 v\n                    [ pipeline / staging ]\n                                 |\n                +----------------+----------------+\n                v                                 v\n     [ data warehouse ]                  [ data lake ]"
                    },
                    {
                        "type": "quote",
                        "value": "A origem dita como você extrai; o destino dita como você entrega. O pipeline é a ponte entre essas duas decisões."
                    },
                    {
                        "type": "text",
                        "value": "## Ligando fonte e destino\n\nA escolha de origem quase nunca é do engenheiro (o sistema já existe, o pipeline se conecta a ele como está). Já o destino costuma ser decisão do time de dados, e normalmente já foi tomada antes mesmo do pipeline existir, na trilha de modelagem e data warehousing. O trabalho de ingestão, então, é conectar um lado que você não controla a um lado que já foi desenhado pra receber esse tipo de consulta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo costuma ser um destino de um pipeline de dados, e não uma origem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um banco relacional que sustenta as transações da aplicação em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma fila de mensagens que publica eventos gerados pelo sistema de pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um data warehouse na nuvem, onde o time de análise consulta os dados já consolidados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma API de terceiros que expõe dados de pagamento processados por outro sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline precisa extrair dados direto do banco relacional que sustenta a aplicação em produção, durante o horário de pico de uso. Qual é o principal cuidado nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Evitar que os dados extraídos cheguem em texto, já que o banco só aceita tipos binários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar que a extração sobrecarregue o banco e afete a performance da aplicação pros usuários.",
                                "isCorrect": true
                            },
                            {
                                "text": "Evitar que o destino final seja um data warehouse, já que OLTP não alimenta warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar que o pipeline rode mais de uma vez por dia, já que o banco limita execuções.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao extrair dados de uma API de terceiros que devolve no máximo 100 registros por chamada e bloqueia temporariamente quem excede um número de requisições por minuto, o que o pipeline precisa tratar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apenas a autenticação inicial, já que o limite de chamadas some após o primeiro acesso aprovado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A compressão dos arquivos recebidos, já que toda API devolve dados em lotes muito grandes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a conversão do formato de resposta, já que paginação não existe em APIs de terceiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Paginação pra percorrer todos os registros e controle de ritmo pra respeitar o limite de chamadas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O time de ciência de dados quer explorar dados brutos e semiestruturados de várias origens, incluindo formatos que ainda nem foram totalmente definidos, pra testar hipóteses antes de decidir o que vale consolidar. Qual destino atende melhor essa necessidade inicial?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um banco relacional de produção, já que ele garante o schema mais rígido pra qualquer exploração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma fila de mensagens, porque ela guarda o histórico completo de dados brutos por tempo indefinido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um data warehouse, porque toda exploração de dado deve acontecer sobre tabelas já definidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um data lake, que aceita dado bruto e semiestruturado sem exigir um schema definido antes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline recebe, todo mês, um arquivo CSV exportado manualmente por um fornecedor externo. Que risco esse tipo de fonte traz, que um banco relacional bem mantido não costuma trazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A estrutura do arquivo pode mudar de um mês pro outro sem nenhum aviso prévio ao pipeline.",
                                "isCorrect": true
                            },
                            {
                                "text": "O fornecedor externo passa a ter acesso direto de escrita no data warehouse ao enviar o arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo não pode, em hipótese alguma, ser lido por um pipeline automatizado depois de exportado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de dados é sempre maior do que qualquer banco relacional conseguiria armazenar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que torna um pipeline confiável",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que torna um pipeline confiável\n\nA diferença entre um script frágil e um pipeline de produção não está em quão elegante é o código: está no que acontece quando algo dá errado. Falha é normal (uma origem fica fora do ar, uma API muda sem aviso, a rede engasga por alguns segundos). O que torna um pipeline confiável é como ele se comporta diante disso."
                    },
                    {
                        "type": "text",
                        "value": "## Idempotência\n\nUm pipeline é idempotente quando rodar de novo, com a mesma entrada, produz sempre o mesmo resultado no destino, sem duplicar nem corromper nada. Isso importa porque reexecuções acontecem o tempo todo na prática: uma falha no meio da carga, um backfill de um período antigo, alguém disparando o pipeline manualmente de novo por precaução. Sem idempotência, cada uma dessas reexecuções vira um risco real de dado errado."
                    },
                    {
                        "type": "code",
                        "value": "-- Não idempotente: insere sempre, sem checar o que já existe\nINSERT INTO fato_pedidos\nSELECT * FROM stg_pedidos WHERE data_pedido = '2026-07-12';\n-- rodar esse comando duas vezes duplica todos os pedidos do dia\n\n-- Idempotente: garante que sempre sobra uma única cópia do dia\nDELETE FROM fato_pedidos WHERE data_pedido = '2026-07-12';\nINSERT INTO fato_pedidos\nSELECT * FROM stg_pedidos WHERE data_pedido = '2026-07-12';\n-- rodar quantas vezes for preciso sempre deixa só uma cópia do dia"
                    },
                    {
                        "type": "text",
                        "value": "## Retries e tratamento de falha\n\nFalha pontual (um timeout de rede, uma API fora do ar por alguns segundos) não deveria derrubar o pipeline inteiro na primeira tentativa. Um pipeline confiável tenta de novo algumas vezes, de forma controlada, antes de desistir. Quando a falha realmente não se resolve sozinha, o pipeline precisa parar de forma visível, registrando o erro, em vez de seguir adiante com dado incompleto como se nada tivesse acontecido. Formas mais específicas de lidar com esse tipo de falha, como fila de erro e quarentena de dado ruim, ganham um módulo próprio mais adiante."
                    },
                    {
                        "type": "text",
                        "value": "## Monitoramento e alertas\n\nUm pipeline confiável expõe sinais que alguém pode observar: se rodou, quanto tempo levou, quantas linhas moveu, se esse volume está dentro do esperado. Sem esses sinais, uma falha silenciosa só é descoberta quando alguém percebe um número estranho no relatório, geralmente tarde demais pra reagir a tempo. Esse tema também volta com mais detalhe num módulo dedicado a confiabilidade, mais à frente na trilha."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Script frágil\", \"Pipeline confiável\"], [\"Origem fora do ar por 30 segundos\", \"Falha e para, sem tentar de novo\", \"Tenta de novo algumas vezes antes de desistir\"], [\"Executado duas vezes por engano\", \"Duplica os dados no destino\", \"Produz o mesmo resultado de uma única execução\"], [\"Queda no volume de dados carregados\", \"Ninguém percebe até alguém reclamar\", \"Gera um alerta pra quem cuida do pipeline\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Não é a ausência de falha que torna um pipeline confiável: é o que ele faz quando a falha acontece."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que um pipeline é idempotente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rodar o pipeline mais de uma vez, com a mesma entrada, produz sempre o mesmo resultado no destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline sempre grava os dados num destino diferente a cada nova execução realizada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline nunca falha, porque foi programado pra ignorar qualquer erro que apareça na execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline roda automaticamente a cada segundo, sem depender de nenhum tipo de agendamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline insere no destino todos os pedidos do dia com um único comando de inserção, sem apagar nada antes. Depois de uma falha de rede, alguém roda o pipeline de novo manualmente pro mesmo dia. O que provavelmente acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O pipeline apaga os dados antigos por padrão antes de inserir os novos registros do dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada muda, porque qualquer pipeline reconhece sozinho uma execução repetida do mesmo dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "O destino rejeita a segunda execução, já que bancos analíticos bloqueiam inserção repetida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os pedidos daquele dia ficam duplicados no destino, porque o pipeline não trata a reexecução.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Durante a extração, a API de origem fica indisponível por 20 segundos e depois volta ao normal. Qual comportamento indica um pipeline com bom tratamento de falha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar a origem dos dados automaticamente por outra fonte disponível no momento da falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Interromper o pipeline de forma definitiva, exigindo que alguém o reinicie na mão todo dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar o erro em silêncio e seguir pra etapa de carga com os dados que conseguiu até ali.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tentar de novo algumas vezes antes de desistir, em vez de falhar logo no primeiro erro.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de carga roda todos os dias sem gerar nenhum erro, mas o volume de linhas carregadas cai de forma abrupta numa terça-feira, e ninguém percebe até o relatório semanal. O que faltou a esse pipeline?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma extração em streaming, já que pipelines em batch nunca detectam queda de volume.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um destino diferente, porque data warehouses não registram grandes volumes de linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma etapa de transformação adicional, já que só a transformação evita queda de volume.",
                                "isCorrect": false
                            },
                            {
                                "text": "Monitoramento que comparasse o volume carregado com um padrão esperado e alertasse a queda.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica melhor diferencia um pipeline de produção de um script frágil?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dispensa qualquer tipo de agendamento, já que roda sempre de forma manual e pontual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trata falha, evita duplicar dado numa nova execução e expõe sinais de monitoramento.",
                                "isCorrect": true
                            },
                            {
                                "text": "É sempre escrito numa linguagem de programação diferente da usada em scripts comuns.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nunca precisa ser executado de novo depois da primeira vez que roda com sucesso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - ETL x ELT",
        "aulas": [
            {
                "titulo": "ETL: extrair, transformar, carregar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ETL: extrair, transformar, carregar\n\nETL é a sigla para Extract, Transform, Load (extrair, transformar, carregar). É a abordagem mais antiga de integração de dados, consolidada a partir dos anos 1990 com o crescimento dos data warehouses corporativos.\n\nA ideia central: os dados só chegam ao destino final depois de passar por uma etapa de transformação em um ambiente intermediário, separado tanto da origem quanto do destino."
                    },
                    {
                        "type": "text",
                        "value": "## As três etapas\n\n- **Extract (extrair)**: os dados saem de bancos transacionais, arquivos, APIs ou sistemas legados e são copiados para uma área de processamento.\n- **Transform (transformar)**: nesse ambiente intermediário (o servidor de ETL), os dados são limpos, padronizados, agregados e reformatados para o modelo do destino.\n- **Load (carregar)**: só o resultado já transformado, pronto para consumo, é escrito no data warehouse."
                    },
                    {
                        "type": "code",
                        "value": "Origem (bancos, arquivos, APIs)\n   |\n   v\n[ Servidor de ETL ]\n   - limpeza\n   - padronizacao\n   - agregacao\n   - aplicacao de regras de negocio\n   |\n   v\nData Warehouse (dado ja no modelo final)"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa ordem existia\n\nNas décadas em que o ETL se consolidou, armazenamento e processamento no data warehouse eram caros e limitados. Fazia sentido gastar poder de processamento em um servidor dedicado e mais barato, e carregar no warehouse só o dado final, no formato exato das tabelas de destino, sem gastar espaço com dados brutos ou intermediários.\n\nTransformar antes de carregar também funciona como um portão de qualidade: nada entra no warehouse sem passar pelas regras de validação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Como aparecia no ETL clássico\"],[\"Ferramentas típicas\",\"Informatica PowerCenter, IBM DataStage, servidores dedicados\"],[\"Quando roda\",\"Em janelas de batch, fora do horário comercial\"],[\"O que chega ao warehouse\",\"Só o dado já transformado e modelado\"],[\"Custo mais sensível\",\"Processamento e armazenamento do próprio warehouse\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "No ETL clássico, o warehouse só vê o dado depois que ele já está limpo e modelado: o processamento pesado acontece fora dele, num servidor dedicado."
                    },
                    {
                        "type": "text",
                        "value": "## Quando ainda faz sentido hoje\n\nO ETL clássico continua relevante quando existe exigência de compliance que impede dados brutos, sensíveis ou regulados, de tocar o destino antes de mascarar ou anonimizar; quando o volume de dados brutos é grande demais para valer a pena guardar no warehouse; ou quando o destino tem custo de armazenamento bem mais alto que o de uma camada intermediária dedicada."
                    }
                ],
                "questions": [
                    {
                        "statement": "No ETL clássico, em que momento os dados passam pela transformação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Depois de carregados no destino, já dentro do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depois de extraídos da origem e antes de chegar ao destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Antes da extração, ainda dentro do sistema de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente durante consultas feitas pelo usuário final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém um data warehouse on-premise com pouco espaço em disco e processamento caro. Antes de carregar, ela limpa e agrega os dados em um servidor separado, e só grava o resultado final no warehouse. Isso é característica de qual abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ELT, porque a transformação usa o processamento do próprio warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "CDC, porque a carga captura somente as mudanças desde a última vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "ETL, porque a transformação ocorre fora do warehouse, antes da carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "Streaming, porque os dados chegam de forma contínua ao warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a abordagem ETL se consolidou nas décadas em que os data warehouses corporativos surgiram?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque processar e guardar no warehouse saía caro, e transformar fora custava menos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque as APIs de origem só aceitavam receber os dados já transformados antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os bancos transacionais não suportavam qualquer consulta de leitura direta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o formato Parquet só passou a existir depois de os dados serem transformados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa da área de saúde precisa integrar dados de pacientes de um sistema legado a um data warehouse na nuvem. Por exigência regulatória, nenhum dado de identificação pessoal pode ser gravado, nem temporariamente, fora do sistema de origem e do destino já mascarado. Qual abordagem atende essa exigência?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "ELT, carregando os dados brutos e aplicando a máscara depois, no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "CDC, capturando somente os campos alterados desde a última carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração incremental por watermark, reduzindo o volume a cada rodada.",
                                "isCorrect": false
                            },
                            {
                                "text": "ETL, mascarando os dados sensíveis num servidor intermediário antes da carga.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "No ETL clássico, o que costuma acontecer com os dados brutos extraídos da origem depois que a transformação termina?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São convertidos para o formato Parquet antes de qualquer transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficam só no servidor de ETL, ou são descartados, sem ir ao warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "São carregados no warehouse junto ao resultado, numa tabela separada.",
                                "isCorrect": false
                            },
                            {
                                "text": "São reenviados automaticamente de volta para o sistema de origem.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ELT: extrair, carregar, transformar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ELT: extrair, carregar, transformar\n\nELT inverte a ordem do ETL: Extract, Load, Transform (extrair, carregar, transformar). Os dados brutos são extraídos da origem e carregados direto no destino, sem passar por um servidor intermediário. A transformação só acontece depois, já dentro do data warehouse, usando o próprio poder de processamento dele."
                    },
                    {
                        "type": "text",
                        "value": "## As três etapas\n\n- **Extract (extrair)**: os dados saem da origem como no ETL, sem grandes mudanças nessa parte.\n- **Load (carregar)**: os dados brutos, praticamente sem tratamento, são gravados direto no data warehouse.\n- **Transform (transformar)**: limpeza, padronização, agregação e modelagem acontecem depois, com SQL (ou ferramentas de transformação) rodando dentro do próprio warehouse."
                    },
                    {
                        "type": "code",
                        "value": "Origem (bancos, arquivos, APIs)\n   |\n   v\nData Warehouse na nuvem (dado bruto, camada raw)\n   |\n   v   transformacao em SQL, dentro do warehouse\n   |\nCamadas curadas (staging -> intermediaria -> final)"
                    },
                    {
                        "type": "text",
                        "value": "## O que mudou: o warehouse na nuvem\n\nO ELT só virou prático em escala quando os data warehouses na nuvem passaram a oferecer armazenamento barato e processamento elástico: dá para guardar todo o histórico de dados brutos sem se preocupar de imediato com custo de disco, e escalar o processamento só durante as janelas de transformação, pagando pelo uso.\n\nIsso reduz a necessidade de um servidor de ETL dedicado: o warehouse passa a ser, ao mesmo tempo, o lugar onde os dados pousam e onde são transformados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Warehouse tradicional (on-premise)\",\"Warehouse na nuvem\"],[\"Armazenamento\",\"Caro, capacidade fixa\",\"Barato, escala sob demanda\"],[\"Processamento\",\"Compartilhado com a carga de consultas\",\"Elástico, isolado por carga de trabalho\"],[\"Custo\",\"Investido antecipadamente (hardware)\",\"Pago pelo uso (compute e storage)\"],[\"Guardar dado bruto\",\"Raramente compensava\",\"Comum, vira a camada raw\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Com armazenamento barato e processamento elástico, guardar o dado bruto deixou de ser desperdício e virou a base para transformar, e retransformar, quantas vezes for preciso."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa\n\nManter os dados brutos no destino significa que, se uma regra de transformação mudar ou tiver um erro, dá para reprocessar a partir do dado original, sem precisar extrair tudo de novo da origem. Essa flexibilidade é uma das maiores vantagens do ELT sobre o ETL clássico."
                    }
                ],
                "questions": [
                    {
                        "statement": "No ELT, o que é carregado no data warehouse logo após a extração?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Somente os dados já agregados e prontos para consumo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas os metadados das tabelas do sistema de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados brutos, praticamente sem qualquer transformação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dados já convertidos para o modelo dimensional final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual mudança de infraestrutura tornou o ELT uma abordagem prática em larga escala?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Data warehouses na nuvem com armazenamento barato e processamento elástico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Bancos transacionais passaram a suportar transformação nativa em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "APIs de origem passaram a entregar sempre dados já transformados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Servidores de ETL ficaram mais baratos do que os data warehouses.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe carrega diariamente o volume total de pedidos, sem tratamento, direto num data warehouse na nuvem. As transformações rodam depois, em SQL, dentro do próprio warehouse. Isso descreve qual abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "CDC, porque a carga captura somente as mudanças desde o último dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração incremental, porque só uma parte dos pedidos é carregada.",
                                "isCorrect": false
                            },
                            {
                                "text": "ETL, porque a transformação acontece num servidor à parte, antes da carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "ELT, porque a transformação acontece dentro do destino, após a carga.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe muda as regras de cálculo de métricas com frequência e precisa comparar resultados antigos e novos sem reprocessar tudo desde a origem, que tem acesso lento e restrito. O destino é um warehouse na nuvem com processamento elástico. Qual abordagem sustenta melhor esse ritmo de mudança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "ETL, porque o servidor de ETL guarda versões de cada transformação aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "ELT, porque o dado bruto já carregado permite reprocessar sem voltar à origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "ELT, porque o warehouse recalcula sozinho as métricas antigas automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "ETL, porque a origem lenta obriga a extrair os dados uma única vez por mês.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No ELT, com que ferramenta as transformações costumam ser escritas, já dentro do warehouse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SQL, rodando direto sobre as tabelas já carregadas no warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "Scripts de shell, rodando no servidor de origem antes da extração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um servidor de ETL dedicado, mantido separado do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só ferramentas de visualização, no momento da consulta final.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ETL x ELT: trade-offs e quando escolher",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ETL x ELT: trade-offs e quando escolher\n\nETL e ELT não são certo ou errado: são duas formas de organizar a mesma sequência lógica (extrair, transformar, carregar), mudando onde a transformação acontece. A escolha depende de custo, de quem tem poder de processamento disponível, do volume de dados e de quão sensível é o dado que está sendo movido."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\",\"ETL\",\"ELT\"],[\"Onde transforma\",\"Servidor de ETL, fora do destino\",\"Dentro do próprio destino\"],[\"O que chega ao destino\",\"Só o dado já transformado\",\"Dado bruto e, depois, o transformado\"],[\"Custo de processamento\",\"Concentrado no servidor de ETL\",\"Concentrado no warehouse, sob demanda\"],[\"Flexibilidade para reprocessar\",\"Baixa, depende de extrair de novo\",\"Alta, o bruto já está no destino\"],[\"Dados sensíveis\",\"Pode mascarar antes de chegar ao destino\",\"Dado sensível pode chegar bruto ao destino\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando ETL ainda faz mais sentido\n\n- Quando existe exigência regulatória de mascarar ou remover dados sensíveis antes de qualquer gravação no destino.\n- Quando o destino tem custo de armazenamento ou processamento bem mais alto que o de uma camada intermediária dedicada.\n- Quando o volume de dados brutos é grande demais para valer a pena guardar, e só o resultado agregado interessa."
                    },
                    {
                        "type": "text",
                        "value": "## Quando ELT costuma vencer\n\n- Quando o destino é um data warehouse na nuvem, com armazenamento barato e processamento elástico.\n- Quando a equipe precisa de flexibilidade para mudar regras de transformação e reprocessar sem voltar à origem.\n- Quando a velocidade de disponibilizar o dado no destino importa mais do que entregá-lo já pronto para consumo."
                    },
                    {
                        "type": "code",
                        "value": "Existe exigencia de mascarar dado sensivel antes do destino?\n   SIM -> ETL (transformar antes de carregar)\n   NAO -> proxima pergunta\n\nO destino tem processamento elastico e barato (warehouse na nuvem)?\n   NAO -> ETL (arriscado depender do processamento do destino)\n   SIM -> proxima pergunta\n\nA equipe precisa reprocessar com frequencia, mudando regras?\n   SIM -> ELT (mantem o bruto, reprocessa sem reextrair)\n   NAO -> as duas resolvem; ELT costuma ser o padrao atual"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta não é qual abordagem é melhor, e sim onde compensa gastar poder de processamento: num servidor dedicado antes da carga, ou dentro do próprio destino depois dela."
                    },
                    {
                        "type": "text",
                        "value": "## Na prática, os dois convivem\n\nMuitos pipelines reais misturam as duas ideias: uma transformação leve de mascaramento ou validação acontece antes da carga (como no ETL), e o grosso da modelagem analítica acontece depois, dentro do warehouse (como no ELT). O importante é entender o trade-off por trás de cada decisão, não seguir uma regra fixa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal fator que diferencia a decisão entre ETL e ELT?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se a extração dos dados é feita por API ou direto do banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se os dados de origem são armazenados em CSV ou em formato Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a carga dos dados é feita em horário comercial ou fora dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Onde a transformação dos dados acontece, antes ou depois da carga.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa usa um warehouse com armazenamento caro e processamento limitado, sem elasticidade na nuvem, e extrai um grande volume de dados brutos. Qual abordagem tende a reduzir melhor o custo nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "CDC, capturando as mudanças direto do log de transações da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "ETL, transformando e reduzindo o volume antes de carregar no warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "ELT, carregando o volume bruto e deixando o warehouse absorver o custo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração full, repetindo a carga completa a cada execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline move dados de cartão de crédito de um sistema de pagamentos até um warehouse compartilhado por equipes sem permissão para ver dados sensíveis. Qual decisão evita melhor expor esses dados no destino?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Carregar os dados brutos numa tabela temporária de acesso público.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extrair os dados sensíveis com frequência menor que os demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mascarar os dados sensíveis antes de carregar no destino, como no ETL.",
                                "isCorrect": true
                            },
                            {
                                "text": "Carregar os dados brutos e restringir o acesso só depois, como no ELT.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fintech recebe dados de transações financeiras sensíveis de um parceiro externo, em grande volume, e precisa disponibilizá-los rápido para o time de risco. Por contrato, nenhum dado sensível pode ficar armazenado fora de ambientes já aprovados (a origem e o destino final, já mascarado). Considerando volume, sensibilidade e velocidade, qual abordagem equilibra melhor essas exigências?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "ETL, aplicando o mascaramento num servidor intermediário aprovado, antes da carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "ELT, carregando os dados brutos no destino e mascarando depois, dentro dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "ELT, guardando os dados brutos indefinidamente para acelerar consultas futuras.",
                                "isCorrect": false
                            },
                            {
                                "text": "ETL, adiando o mascaramento até a próxima janela de manutenção do contrato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na hora de escolher entre ETL e ELT para um novo pipeline, qual pergunta costuma vir primeiro, antes de pensar em custo ou performance?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Qual ferramenta de visualização vai consumir os dados no final?",
                                "isCorrect": false
                            },
                            {
                                "text": "Qual formato de arquivo será usado para guardar os dados brutos?",
                                "isCorrect": false
                            },
                            {
                                "text": "Existe exigência de mascarar dados sensíveis antes do destino?",
                                "isCorrect": true
                            },
                            {
                                "text": "Qual linguagem de programação a equipe prefere usar na extração?",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Staging: a área intermediária",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Staging: a área intermediária\n\nStaging é uma área de pouso para os dados: um espaço, dentro ou fora do destino final, onde os dados extraídos ficam antes de virar tabelas prontas para consumo. Existe tanto em pipelines ETL (o servidor de ETL é uma forma de staging) quanto em ELT (como um schema ou dataset separado dentro do próprio warehouse)."
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa área existe\n\n- **Isola falhas**: se uma transformação quebrar no meio do caminho, o dado bruto já extraído continua seguro em staging, sem precisar reextrair da origem.\n- **Protege a origem**: extrair uma vez e reaproveitar o dado em staging evita bater várias vezes no sistema de origem pra testar transformações diferentes.\n- **Vira ponto de reprocessamento**: um erro de regra de negócio pode ser corrigido reprocessando a partir do staging, sem depender da origem estar disponível."
                    },
                    {
                        "type": "code",
                        "value": "Origem\n   |\n   v\nRAW (copia fiel do que foi extraido, sem tratamento)\n   |\n   v\nSTAGING (tipos ajustados, duplicatas tratadas, nomes padronizados)\n   |\n   v\nCURATED (modelado para consumo: dimensoes, fatos, metricas)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Conteúdo\",\"Quem costuma consultar\"],[\"Raw\",\"Cópia fiel da origem, sem tratamento\",\"Engenharia de dados, para reprocessar\"],[\"Staging\",\"Tipos corrigidos, nomes padronizados, ainda bruto\",\"Engenharia de dados e analytics engineering\"],[\"Curated\",\"Dados modelados, prontos para métricas e relatórios\",\"Analistas de negócio e ferramentas de BI\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Reprocessar a partir do staging\n\nQuando uma regra de transformação muda, ou tinha um erro, reprocessar a partir do staging é bem mais barato do que voltar à origem: o dado bruto (ou quase bruto) já está disponível, então basta rodar de novo a lógica de transformação sobre ele. Isso só funciona se o staging guardar dados suficientes, e por tempo suficiente, para cobrir o reprocessamento que a equipe pode precisar fazer."
                    },
                    {
                        "type": "quote",
                        "value": "Staging existe para que um erro de transformação nunca vire motivo pra extrair tudo de novo da origem."
                    },
                    {
                        "type": "text",
                        "value": "## Staging não é lixo temporário\n\nÉ comum tratar o staging como algo descartável, mas ele guarda o dado mais próximo da origem que a equipe tem. Definir por quanto tempo manter cada camada é uma decisão de custo consciente, não um detalhe operacional: apagar o staging cedo demais tira a capacidade de reprocessar quando algo dá errado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a área de staging em um pipeline de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O sistema de origem de onde os dados são extraídos originalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma área intermediária onde os dados ficam antes da camada final.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ferramenta de visualização usada pelos analistas de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de regras de acesso aplicado ao data warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que manter um staging evita sobrecarregar o sistema de origem durante o desenvolvimento de transformações?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o staging processa consultas mais rápido do que o sistema de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o staging bloqueia automaticamente qualquer nova extração da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o staging elimina totalmente a necessidade de extração incremental.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dado extraído fica disponível, sem reconsultar a origem a cada teste.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma analista de negócio precisa de uma tabela com métricas de vendas já calculadas e nomes de colunas padronizados para montar um relatório. Em qual camada ela deve buscar esses dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Curated, onde os dados já estão modelados e prontos para consumo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Raw, onde os dados chegam sem qualquer tipo de tratamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Staging, onde os tipos ainda estão sendo ajustados e validados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Diretamente na origem, para garantir o dado mais atual possível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe descobre um erro numa regra de transformação que roda há dois meses, mas a infraestrutura apagou o staging com mais de sete dias para economizar espaço. Qual é a consequência direta dessa política de retenção curta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O erro se corrige sozinho na próxima carga incremental programada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A camada curated recalcula automaticamente os dados antigos afetados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe precisa extrair os dois meses de novo, direto da origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "A equipe reprocessa os dois meses direto do staging, sem custo extra.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma carga, a transformação que gera a camada curated falha na metade do processo. O que acontece com os dados brutos já extraídos e gravados em staging?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Continuam disponíveis em staging, prontos para uma nova tentativa.",
                                "isCorrect": true
                            },
                            {
                                "text": "São apagados junto com a falha, exigindo nova extração da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "São promovidos automaticamente à camada curated, mesmo incompletos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Retornam para o sistema de origem como parte de um rollback.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Como o ELT moldou o modern data stack",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Como o ELT moldou o modern data stack\n\nModern data stack é o nome dado a um conjunto de ferramentas que virou padrão de mercado a partir da popularização do ELT: ingestão gerenciada, um data warehouse na nuvem como centro do pipeline, e uma camada de transformação escrita em SQL, versionada como código, rodando dentro do próprio warehouse."
                    },
                    {
                        "type": "text",
                        "value": "## As peças do modern data stack\n\n- **Ingestão gerenciada**: ferramentas como Fivetran e Airbyte cuidam da extração e carga dos dados brutos, sem exigir que a equipe escreva conectores do zero.\n- **Warehouse na nuvem**: recebe o dado bruto e vira o ambiente onde ele é armazenado e transformado.\n- **Camada de transformação em SQL**: consultas organizadas como projeto de software (versionadas, testadas, documentadas) transformam o dado bruto em tabelas prontas para consumo.\n- **Ferramentas de consumo**: dashboards e ferramentas de BI leem o resultado já modelado."
                    },
                    {
                        "type": "code",
                        "value": "Fontes (bancos, APIs, arquivos)\n   |\n   v\nIngestao gerenciada (ex.: Fivetran, Airbyte)\n   |\n   v\nData Warehouse na nuvem (camada raw)\n   |\n   v   transformacao em SQL, versionada como codigo\n   |\nCamada de consumo (dashboards, ferramentas de BI)"
                    },
                    {
                        "type": "text",
                        "value": "## O papel das ferramentas de transformação\n\nAntes do ELT, transformar significava escrever scripts dispersos ou configurar um servidor de ETL fechado. Com o dado bruto já dentro do warehouse, surgiu espaço para ferramentas que organizam a transformação como um projeto de software: consultas SQL guardadas em arquivos, versionadas num repositório, testadas antes de ir para produção e documentadas para quem for consultar depois.\n\nO dbt é o exemplo mais conhecido dessa categoria: ele não extrai nem carrega dados, só organiza e executa a etapa de transformação (o T do ELT) dentro do warehouse. Os detalhes de como usá-lo ficam para uma trilha própria de transformação de dados."
                    },
                    {
                        "type": "text",
                        "value": "## Analytics engineering em uma frase\n\nAnalytics engineering é o trabalho de aplicar práticas de engenharia de software (versionamento, testes, documentação) à etapa de transformação que roda dentro do warehouse, ocupando o espaço que se abriu entre o engenheiro de dados que ingere e o analista que consome."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Stack clássica (ETL)\",\"Modern data stack (ELT)\"],[\"Ingestão\",\"Conectores construídos sob medida\",\"Ferramentas gerenciadas (Fivetran, Airbyte)\"],[\"Onde transforma\",\"Servidor de ETL dedicado\",\"Dentro do warehouse, em SQL\"],[\"Como a transformação é tratada\",\"Configuração numa ferramenta fechada\",\"Código versionado, testado e documentado\"],[\"Quem cuida da transformação\",\"Só engenharia de dados\",\"Engenharia de dados e analytics engineering\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O modern data stack não inventou uma etapa nova: ele deu ao T do ELT o mesmo tratamento que o código de produção sempre teve, com versionamento, testes e documentação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são as peças centrais do modern data stack, na ordem em que os dados passam por elas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Servidor de ETL, banco transacional, arquivo CSV, ferramenta de BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ingestão gerenciada, warehouse na nuvem, transformação em SQL, consumo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Data lake, fila de mensagens, processamento em streaming, aplicativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "API de origem, cache local, banco de grafos, painel administrativo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro do modern data stack, qual é o papel de uma ferramenta de transformação como o dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extrair os dados direto das origens, no lugar da ingestão gerenciada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar os dados brutos no lugar do próprio data warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar os dashboards finais consumidos pelas áreas de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Organizar e executar a etapa de transformação em SQL, no warehouse.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Como o papel de analytics engineering costuma ser descrito dentro do modern data stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aplicar práticas de engenharia de software à transformação de dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Construir os conectores de ingestão que extraem dados das origens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Administrar a infraestrutura de rede do data warehouse na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir as políticas de acesso e segurança aplicadas ao warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena precisa ingerir dados de dezenas de APIs de SaaS diferentes, carregar tudo bruto num warehouse na nuvem, e manter as transformações organizadas como código, com testes e versionamento. Qual combinação atende melhor esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Servidor de ETL dedicado para cada API, mais scripts soltos sem versionamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração manual de cada API, com toda a transformação feita em planilhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ingestão gerenciada para as APIs, com transformação versionada como código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um pipeline de streaming único, substituindo tanto ingestão quanto transformação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o ELT foi o que abriu espaço para o modern data stack, e não o ETL clássico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o ETL clássico não permitia nenhuma transformação feita em SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dado bruto já no warehouse deu à transformação um lugar natural.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o ELT eliminou de vez a necessidade de ferramenta de ingestão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o ETL clássico exigia que o warehouse ficasse sempre vazio de dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Extração: fontes e técnicas",
        "aulas": [
            {
                "titulo": "Extração de bancos relacionais: full x incremental",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Extração de bancos relacionais: full x incremental\n\nBancos relacionais (Postgres, MySQL, SQL Server) são a fonte mais comum em pipelines de ingestão. A primeira decisão de design é: em cada execução, o pipeline lê a tabela inteira ou só o que mudou desde a última vez? A resposta molda o custo, a complexidade e a confiabilidade de toda a extração."
                    },
                    {
                        "type": "text",
                        "value": "## Extração full (full load)\n\nNa extração full, o pipeline lê todas as linhas da tabela de origem a cada execução, descartando o resultado anterior no destino. É a estratégia mais simples de implementar: não exige guardar estado entre execuções nem confiar em uma coluna de controle.\n\nFunciona bem para tabelas pequenas (dimensões com poucos milhares de linhas, tabelas de referência) ou quando a origem não tem uma forma confiável de identificar o que mudou. O custo cresce junto com o volume: numa tabela de bilhões de linhas, ler tudo a cada hora é caro em tempo, rede e carga na origem."
                    },
                    {
                        "type": "text",
                        "value": "## Extração incremental\n\nNa extração incremental, o pipeline lê só as linhas inseridas ou alteradas desde a última execução. Isso exige uma **chave incremental**: uma coluna que cresce de forma previsível, como um `id` autoincremento ou um timestamp `updated_at`.\n\nA cada execução, o pipeline guarda o maior valor lido (o cursor) e, na próxima vez, busca só o que é maior que esse valor. O volume transferido fica proporcional à mudança, não ao tamanho total da tabela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Full load\",\"Incremental\"],[\"Volume por execução\",\"Tabela inteira\",\"Só o que mudou desde o cursor\"],[\"Precisa guardar estado\",\"Não\",\"Sim, o último cursor lido\"],[\"Captura deletes na origem\",\"Sim, naturalmente\",\"Não, sem tratamento extra\"],[\"Custo em tabelas grandes\",\"Alto, cresce com o volume\",\"Baixo e estável\"],[\"Complexidade de implementação\",\"Baixa\",\"Média, exige chave confiável\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- cursor guardado da execução anterior\n-- ultimo_id_lido = 84213\n\nSELECT id, cliente_id, valor, criado_em\nFROM pedidos\nWHERE id > 84213\nORDER BY id\nLIMIT 5000;\n\n-- após a leitura, o pipeline guarda o novo cursor\n-- ultimo_id_lido = MAX(id) do lote retornado"
                    },
                    {
                        "type": "text",
                        "value": "## Impacto na origem e quando usar cada um\n\nBancos transacionais existem para atender a aplicação, não o pipeline de ingestão. Uma extração full em uma tabela grande pode competir por I/O e conexões com o tráfego de produção, especialmente se rodar em horário de pico.\n\nUse full load quando a tabela é pequena, quando não existe coluna confiável para incrementar, ou quando o objetivo é detectar deletes. Use incremental quando o volume é grande, existe uma chave crescente (id ou timestamp) e a meta é reduzir custo e tempo de extração. Muitos pipelines combinam os dois: incremental no dia a dia e full periódico (semanal, por exemplo) para reconciliar diferenças."
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta não é qual estratégia é melhor: é qual volume de mudança a origem tem e qual chave confiável existe para capturá-lo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em um pipeline de ingestão, o que caracteriza uma extração do tipo full load?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Só as linhas alteradas desde a última execução são lidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas as linhas da tabela de origem são lidas de novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas as linhas inseridas no último minuto são lidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "As linhas são lidas direto do log de transações da origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de pedidos tem 800 milhões de linhas e cresce cerca de 200 mil linhas por dia. O pipeline roda a cada hora e precisa terminar em poucos minutos, sem sobrecarregar o banco transacional. Qual abordagem de extração é mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extração full a cada execução, para garantir consistência total.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração full uma vez por dia, ignorando as execuções horárias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração incremental sem cursor, relendo as últimas 200 mil linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração incremental usando updated_at ou um id crescente como cursor.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Para que uma extração incremental por chave funcione de forma confiável, qual característica a coluna usada como cursor precisa ter?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ser monotonicamente crescente, como um id ou um timestamp.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ser uma chave estrangeira que referencia outra tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser uma coluna de texto livre, preenchida manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser uma coluna booleana que indica se o registro foi lido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebeu que registros excluídos fisicamente na tabela de origem continuavam aparecendo no destino, mesmo meses depois da exclusão. A extração usa updated_at como cursor incremental. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O cursor updated_at está configurado no fuso horário errado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna updated_at não tem índice na tabela de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A extração incremental não captura deletes físicos da origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline está rodando com paralelismo excessivo entre lotes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal vantagem prática de uma extração incremental em relação a uma extração full, no dia a dia de um pipeline?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Elimina de vez a necessidade de reconciliar origem e destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduz o volume lido e a carga na origem a cada execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Garante que exclusões na origem sejam sempre refletidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispensa a existência de qualquer coluna de controle.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Extração de APIs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Extração de APIs\n\nAPIs HTTP são uma fonte cada vez mais comum de dados: sistemas de CRM, gateways de pagamento, ferramentas de marketing e SaaS em geral expõem seus dados por API REST. Extrair de uma API exige lidar com paginação, limites de uso e autenticação, tudo isso sem controle sobre o servidor do outro lado."
                    },
                    {
                        "type": "text",
                        "value": "## Paginação e a estrutura da resposta\n\nUma API raramente devolve todos os registros em uma única resposta. O mais comum são três estilos de paginação:\n\n- **Offset/limit**: a requisição informa `offset=1000&limit=100` e a API devolve a página correspondente. Simples, mas pode pular ou repetir registros se a origem mudar entre chamadas.\n- **Baseada em cursor**: a resposta traz um token (`next_cursor`) que aponta para a próxima página, mais estável quando os dados mudam durante a extração.\n- **Baseada em página**: parecida com offset/limit, mas usando um número de página (`page=5`) em vez de um deslocamento.\n\nA resposta costuma vir em JSON, com os registros dentro de um envelope de metadados, por exemplo `{ \"data\": [...], \"has_more\": true, \"next_cursor\": \"abc123\" }`. O pipeline segue paginando até a API sinalizar o fim, seja por uma lista vazia, `has_more: false` ou a ausência de um próximo cursor."
                    },
                    {
                        "type": "text",
                        "value": "## Rate limit e retry com backoff\n\nAPIs impõem limites de uso (rate limit) para proteger o próprio serviço, por exemplo 100 requisições por minuto. Ao estourar o limite, a API costuma responder com o código HTTP `429 Too Many Requests`, muitas vezes com um cabeçalho `Retry-After` indicando quanto esperar.\n\nErros temporários (timeout, `500`, `503`, o próprio `429`) devem ser tratados com **retry** automático, mas nunca em loop imediato: a prática recomendada é o **backoff exponencial**, aumentando o tempo de espera a cada nova tentativa (1s, 2s, 4s, 8s) até um limite de tentativas, evitando martelar um serviço já sobrecarregado."
                    },
                    {
                        "type": "code",
                        "value": "cursor = carregar_cursor_salvo()\ntentativa = 0\n\nenquanto True:\n    resposta = chamar_api(f\"/pedidos?cursor={cursor}&limit=200\")\n\n    se resposta.status == 429 ou resposta.status >= 500:\n        tentativa += 1\n        se tentativa > 5:\n            registrar_erro_e_parar()\n        espera = 2 ** tentativa\n        aguardar(espera)\n        continuar\n\n    tentativa = 0\n    processar(resposta.dados)\n\n    se resposta.has_more == False:\n        parar()\n\n    cursor = resposta.next_cursor\n    salvar_cursor(cursor)"
                    },
                    {
                        "type": "text",
                        "value": "## Autenticação\n\nA maioria das APIs exige autenticação em toda requisição:\n\n- **API key**: um token fixo enviado em um header (`Authorization: Bearer <chave>`) ou como parâmetro. Simples de configurar, mas exige guardar a chave com segurança e rotacioná-la periodicamente.\n- **OAuth 2.0**: o pipeline obtém um access token (via client credentials ou outro fluxo), usa esse token nas chamadas e o renova com um refresh token quando ele expira. É o padrão mais comum em APIs corporativas e quando o dado pertence a um terceiro que precisa autorizar o acesso.\n\nEm ambos os casos, credenciais nunca devem ficar hardcoded no código do pipeline: o padrão é buscar de um cofre de segredos (secrets manager) ou variável de ambiente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"API key\",\"OAuth 2.0\"],[\"Como funciona\",\"Token fixo enviado em header ou parâmetro\",\"Access token obtido por fluxo de autorização, com refresh token\"],[\"Complexidade\",\"Baixa\",\"Maior, exige gerenciar expiração e renovação\"],[\"Uso típico\",\"Integrações simples, APIs internas\",\"APIs corporativas e dados de terceiros\"],[\"Rotação de credencial\",\"Manual, feita pelo time\",\"Automática, via refresh token\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma extração de API confiável trata o erro 429 como uma instrução, não como uma falha: o servidor está dizendo exatamente quanto esperar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao extrair dados de uma API, o que indica o código de resposta HTTP 429?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que o limite de requisições no período foi excedido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a chave de autenticação usada na chamada expirou.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o registro solicitado não existe mais na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o servidor da API está fora do ar no momento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de pedidos permite paginação por offset/limit ou por cursor. A tabela de origem recebe inserções o tempo todo, inclusive durante a extração, que demora vários minutos para percorrer todas as páginas. Qual estilo reduz o risco de pular ou repetir registros?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Offset/limit, já que o deslocamento numérico é sempre estável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Offset/limit, aumentando o parâmetro de limit por chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cursor, já que o token aponta para uma posição estável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cursor, desde que o pipeline reinicie a cada nova página.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de extração de API começa a receber respostas 503 de forma intermitente. A implementação atual tenta de novo imediatamente, sem espera, e insiste indefinidamente. Qual ajuste é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número de chamadas simultâneas feitas à API.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o protocolo de HTTP para HTTPS na chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar o código 503 e seguir para a próxima página.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar backoff exponencial com um limite de tentativas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma integração precisa acessar dados de um sistema de terceiros em nome de cada cliente da plataforma, sem que o cliente compartilhe sua senha, e com a possibilidade de revogar o acesso a qualquer momento. Qual mecanismo de autenticação atende esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "API key única, compartilhada entre todos os clientes.",
                                "isCorrect": false
                            },
                            {
                                "text": "OAuth 2.0, com token renovável e revogável pelo cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação básica, enviando usuário e senha do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "API key individual, gerada e enviada manualmente por e-mail.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a prática recomendada para armazenar chaves de API e tokens usados por um pipeline de extração?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar em um cofre de segredos ou variável de ambiente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar direto no código-fonte, versionado com o pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar em um arquivo de log, para consulta em erros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar em um comentário no início do arquivo de código.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Extração de arquivos e object storage",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Extração de arquivos e object storage\n\nNem toda fonte de dados é um banco ou uma API. Times de dados recebem arquivos: um export em CSV de um parceiro, eventos em JSON gerados por uma aplicação, logs de acesso de um servidor. Hoje, a forma mais comum de disponibilizar esses arquivos é um serviço de object storage, como Amazon S3 ou Google Cloud Storage."
                    },
                    {
                        "type": "text",
                        "value": "## CSV, JSON e logs\n\n- **CSV**: formato tabular, texto plano, separado por vírgula (ou outro delimitador). Fácil de gerar e ler, mas frágil: não tem tipos, não tem um jeito nativo de representar estruturas aninhadas e quebra com vírgulas ou quebras de linha mal escapadas dentro de um campo.\n- **JSON**: representa estruturas aninhadas e listas, comum em exports de aplicações e respostas de API salvas em arquivo. Um formato popular para ingestão é o **JSON Lines** (`.jsonl`), um objeto JSON por linha, o que permite processar o arquivo linha a linha sem carregar tudo em memória.\n- **Logs**: geralmente texto semiestruturado, uma linha por evento com campos separados por espaço ou em um formato próprio, exigindo parsing antes de virarem dados tabulares utilizáveis.\n\nOs detalhes de cada formato, incluindo formatos colunares como Parquet, ficam para o próximo módulo. Aqui o foco é como esses arquivos chegam até o pipeline."
                    },
                    {
                        "type": "text",
                        "value": "## Object storage: buckets e chaves\n\nUm object storage guarda arquivos (objetos) dentro de um **bucket**, endereçados por uma **chave** (key) que funciona como um caminho, por exemplo `vendas/2026/07/13/pedidos_001.csv`. Não existem pastas de verdade: o caminho é só parte do nome do objeto, mas na prática o pipeline trata prefixos como se fossem diretórios.\n\nÉ comum organizar os arquivos por data de chegada ou de referência (`ano/mes/dia/arquivo`), o que facilita tanto a extração incremental (processar só o prefixo do dia) quanto a auditoria de quando cada lote chegou."
                    },
                    {
                        "type": "code",
                        "value": "bucket: dados-brutos-vendas\n\nvendas/2026/07/11/pedidos_001.csv\nvendas/2026/07/11/pedidos_002.csv\nvendas/2026/07/12/pedidos_001.csv\nvendas/2026/07/13/pedidos_001.csv   <- lote de hoje, ainda nao processado\nvendas/2026/07/13/pedidos_002.csv   <- lote de hoje, ainda nao processado\n\nBucket (object storage)\n   |\n   v\nPipeline lista o prefixo do dia\n   |\n   v\nStaging\n   |\n   v\nDestino"
                    },
                    {
                        "type": "text",
                        "value": "## Processando só o que é novo\n\nArquivos chegam em lote: um parceiro deposita um export toda madrugada, uma aplicação grava um novo arquivo de log a cada hora. O pipeline não pode reprocessar tudo a cada execução, então precisa de um jeito de saber o que já foi lido.\n\nAs duas estratégias mais comuns:\n\n- **Convenção de prefixo**: o pipeline lista só as chaves com o prefixo do dia ou hora atual, assumindo que arquivos de dias anteriores já foram processados.\n- **Manifesto de processados**: o pipeline guarda, em uma tabela de controle, a lista de chaves já processadas e, a cada execução, lista o bucket e processa só as chaves ausentes dessa lista.\n\nA segunda opção é mais robusta a arquivos que chegam fora de ordem ou atrasados, mas exige manter esse estado em algum lugar, um banco ou uma tabela de metadados."
                    },
                    {
                        "type": "code",
                        "value": "arquivos_no_bucket = listar_objetos(bucket=\"dados-brutos-vendas\", prefixo=\"vendas/2026/07/13/\")\narquivos_processados = carregar_manifesto_de_controle()\n\npara cada arquivo em arquivos_no_bucket:\n    se arquivo.chave in arquivos_processados:\n        continuar\n\n    dados = ler_arquivo(arquivo.chave)\n    carregar_no_staging(dados)\n    registrar_no_manifesto(arquivo.chave, processado_em=agora())"
                    },
                    {
                        "type": "quote",
                        "value": "Em object storage, organizar por prefixo de data não é só uma questão de arrumação: é o que torna a extração incremental possível."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em um serviço de object storage como S3 ou GCS, como um arquivo é endereçado dentro de um bucket?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por um índice numérico atribuído na ordem de upload.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por um identificador de linha de uma tabela relacional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por uma pasta real do sistema operacional do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por uma chave única que funciona como um caminho.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um parceiro passou a enviar um campo de observações em texto livre dentro do export CSV diário, e alguns valores desse campo contêm vírgulas. Depois dessa mudança, o pipeline de extração passou a gerar linhas com colunas deslocadas. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O arquivo CSV excedeu o limite de tamanho do formato.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CSV não escapa as vírgulas dentro do campo de texto.",
                                "isCorrect": true
                            },
                            {
                                "text": "A codificação do arquivo mudou de UTF-8 para ASCII.",
                                "isCorrect": false
                            },
                            {
                                "text": "O parceiro passou a usar quebras de linha do Windows.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bucket recebe arquivos de um parceiro que às vezes atrasa o envio, depositando o lote de um dia até dois dias depois da data de referência no nome do arquivo. O pipeline lista só o prefixo do dia corrente a cada execução. Qual problema essa abordagem apresenta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Arquivos atrasados nunca são processados pelo pipeline.",
                                "isCorrect": true
                            },
                            {
                                "text": "O bucket rejeita arquivos com prefixo de data anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline reprocessa todos os arquivos de dias anteriores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Arquivos atrasados sobrescrevem os arquivos do dia atual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline lista o prefixo do dia e processa todos os arquivos encontrados, sem checar se algum deles já foi carregado antes. Durante uma execução, uma falha de rede fez o processo reiniciar no meio do prefixo do dia. Qual é a consequência mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhuma, a listagem por prefixo nunca repete arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os arquivos restantes ficam inacessíveis até o outro dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Arquivos já lidos antes da falha seriam relidos de novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O bucket reenvia sozinho só os arquivos ainda não lidos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a vantagem prática do formato JSON Lines (um objeto JSON por linha) para a extração de arquivos, em comparação com um único JSON grande contendo um array de objetos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduz o tamanho do arquivo, eliminando aspas dos campos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte automaticamente campos aninhados em colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permite abrir o arquivo direto numa ferramenta de planilha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permite processar o arquivo linha a linha, sem carregar tudo.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Extração incremental por tempo: watermark",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Extração incremental por tempo: watermark\n\nA extração incremental por chave, vista na aula anterior, geralmente usa uma coluna de tempo, como `updated_at`, como cursor. Esse cursor tem um nome técnico: **watermark**, ou **high-water mark**, o ponto até onde o pipeline já leu com segurança."
                    },
                    {
                        "type": "text",
                        "value": "## O que é o watermark\n\nO watermark é o maior valor de uma coluna de controle (tipicamente um timestamp) que o pipeline já processou com sucesso. Antes de cada execução, o pipeline lê o watermark salvo da execução anterior, busca na origem só os registros com valor maior que esse watermark e, ao final, salva o novo watermark com base no maior valor lido no lote.\n\nEsse estado precisa sobreviver entre execuções: normalmente fica guardado em uma tabela de controle no próprio destino, um arquivo de metadados ou uma variável mantida por um orquestrador."
                    },
                    {
                        "type": "code",
                        "value": "-- tabela de controle no destino\n-- controle_extracao(tabela_origem, ultimo_watermark)\n\n-- 1) ler o watermark salvo\nSELECT ultimo_watermark FROM controle_extracao\nWHERE tabela_origem = 'pedidos';\n-- ultimo_watermark = '2026-07-12 08:00:00'\n\n-- 2) extrair so o que mudou depois do watermark\nSELECT id, cliente_id, status, updated_at\nFROM pedidos\nWHERE updated_at > '2026-07-12 08:00:00'\nORDER BY updated_at;\n\n-- 3) apos carregar com sucesso, atualizar o watermark\nUPDATE controle_extracao\nSET ultimo_watermark = '2026-07-13 08:00:00'\nWHERE tabela_origem = 'pedidos';"
                    },
                    {
                        "type": "text",
                        "value": "## O risco da fronteira\n\nExiste um risco sutil no limite exato do watermark. Se dois registros forem atualizados no mesmo timestamp e a extração rodar exatamente nesse instante, um pode ficar dentro do lote e outro fora, dependendo de qual terminou de commitar primeiro no banco. Usar `>` estrito no lugar de `>=` evita reler o último registro do lote anterior, mas pode deixar passar um registro que ainda estava sendo escrito no instante exato do corte.\n\nUma prática comum é aplicar uma pequena margem de segurança: mover o watermark um pouco para trás do maior valor lido (alguns segundos ou minutos), garantindo sobreposição entre execuções. Isso reintroduz alguns registros já vistos, então a carga no destino precisa ser idempotente, um upsert, não um append puro."
                    },
                    {
                        "type": "text",
                        "value": "## Late data: dados que chegam atrasados\n\nUm registro pode ficar visível na origem depois do timestamp que ele carrega. Uma transação longa, por exemplo, pode gravar updated_at às 10:00:00 mas só commitar, e só ficar visível para leitura, às 10:00:07. Se o pipeline já leu tudo até as 10:00:05 e avançou o watermark, esse registro fica para trás: seu timestamp já é menor que o novo watermark, e ele nunca mais é capturado.\n\nEsse fenômeno é chamado de **late data** (dado atrasado). É mais comum do que parece em bancos com replicação, transações longas ou relógios não perfeitamente sincronizados entre instâncias."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"Como funciona\",\"Custo\"],[\"Margem de segurança (overlap)\",\"Watermark avança um pouco atrás do maior valor lido, relendo uma janela recente\",\"Alguns registros repetidos, exige carga idempotente\"],[\"Atraso proposital na leitura\",\"Só considera registros com alguns minutos de folga desde o updated_at\",\"Aumenta a latência da ingestão\"],[\"Reconciliação periódica\",\"Full load esporádico para pegar o que o watermark deixou passar\",\"Custo pontual mais alto, roda com pouca frequência\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um watermark que nunca olha para trás está confiando cegamente que nada chegou atrasado, e isso quase nunca é verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "No contexto de extração incremental, o que é o watermark (high-water mark)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tempo total que uma extração leva para rodar por completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite máximo de linhas lidas em uma única execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O maior valor já processado de uma coluna de controle.",
                                "isCorrect": true
                            },
                            {
                                "text": "O espaço em disco reservado no destino para a carga.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline usa WHERE updated_at > watermark para extrair registros e salva o maior updated_at lido como novo watermark. Um registro foi atualizado no exato timestamp que virou o novo watermark, mas seu commit terminou um instante depois da leitura ter começado. O que acontece com esse registro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica fora do lote atual e nunca mais é capturado.",
                                "isCorrect": true
                            },
                            {
                                "text": "É incluído automaticamente no lote seguinte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gera um erro de chave duplicada no destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "É lido duas vezes, sem causar nenhum problema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para reduzir o risco de perder registros na fronteira do watermark, um time decide mover o watermark salvo alguns minutos para trás do maior valor lido em cada execução. Qual outro ajuste essa decisão exige no restante do pipeline?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir a frequência de execução do pipeline pela metade.",
                                "isCorrect": false
                            },
                            {
                                "text": "A carga no destino precisa ser idempotente, como um upsert.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o updated_at por um id autoincremento na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriar o destino do zero a cada nova execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de origem tem uma coluna updated_at preenchida no início de cada transação. Um pedido específico ficou de fora de todas as extrações incrementais, mesmo com seu updated_at claramente anterior ao watermark atual. A investigação descobriu que a transação que gravou esse pedido levou 40 segundos para commitar. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A coluna updated_at foi gravada num fuso horário diferente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline excluiu esse pedido por um filtro de status.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transação ultrapassou o tempo limite de leitura do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registro só ficou visível após o commit, tarde demais.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Mesmo aplicando margem de segurança no watermark, um time decide rodar uma extração full da tabela de pedidos uma vez por mês. Qual é o principal motivo prático para manter essa reconciliação periódica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Substituir de vez a extração incremental do dia a dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o espaço ocupado no destino a cada carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Capturar exceções que o watermark não cobre, como deletes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Diminuir a carga imposta ao banco de dados de origem.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Change Data Capture (CDC)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Change Data Capture (CDC)\n\nAs técnicas vistas até aqui, full load, incremental por chave, watermark, têm limites conhecidos: full load é caro em tabelas grandes, e mesmo o watermark mais bem ajustado não enxerga deletes físicos e pode perder dados na fronteira. O Change Data Capture (CDC) ataca o problema de outro jeito: em vez de perguntar à tabela o que mudou, ele escuta as mudanças no momento em que acontecem."
                    },
                    {
                        "type": "text",
                        "value": "## O que é CDC\n\nCDC é a técnica de capturar cada INSERT, UPDATE e DELETE que ocorre na origem, na ordem em que aconteceram, e propagar essas mudanças para o destino. Diferente da extração por watermark, que só enxerga o estado atual de uma linha, o CDC captura o evento da mudança: qual operação foi essa, qual era o valor antes (para updates e deletes) e qual é o valor depois.\n\nIsso resolve de forma nativa dois problemas da extração por watermark: deletes físicos passam a ser capturados como eventos, e não existe a ambiguidade de fronteira, porque cada mudança é um evento discreto, não uma comparação de timestamp."
                    },
                    {
                        "type": "text",
                        "value": "## CDC baseado em log x baseado em query\n\nExistem duas formas de implementar CDC:\n\n- **Baseado em log**: lê diretamente o log de transações da origem (o WAL no Postgres, o binlog no MySQL), o mesmo mecanismo interno que o banco usa para replicação. Captura toda mudança confirmada, na ordem exata em que ocorreu, sem consultar as tabelas de produção.\n- **Baseado em query**: também chamado de CDC por polling, consulta a tabela periodicamente em busca de mudanças, normalmente com uma coluna de watermark ou uma trigger que grava as alterações em uma tabela auxiliar. Na prática, é uma extração incremental sofisticada, não uma leitura real do log."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"CDC baseado em log\",\"CDC baseado em query\"],[\"Fonte dos dados\",\"Log de transações (WAL, binlog)\",\"Consultas periódicas às tabelas\"],[\"Captura deletes\",\"Sim, nativamente\",\"Só com trigger ou coluna extra\"],[\"Impacto na origem\",\"Mínimo, não consulta as tabelas\",\"Consultas repetidas geram carga\"],[\"Latência típica\",\"Segundos\",\"Minutos, conforme o intervalo\"],[\"Complexidade de operar\",\"Maior, exige acesso ao log e um conector\",\"Menor, reaproveita SQL comum\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Origem (Postgres)\n   |\n   v\nLog de transacoes (WAL)\n   |\n   v\nConector CDC\n   |\n   v\nFila / stream\n   |\n   v\nDestino\n\nexemplo de evento capturado pelo conector:\n\n{\n  \"operacao\": \"update\",\n  \"tabela\": \"pedidos\",\n  \"antes\": { \"id\": 501, \"status\": \"pendente\" },\n  \"depois\": { \"id\": 501, \"status\": \"pago\" },\n  \"timestamp_commit\": \"2026-07-13T10:15:32Z\"\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Quando vale a pena usar CDC\n\nCDC exige mais para colocar em operação: acesso ao log de transações da origem (nem sempre liberado pelo time de banco), um conector dedicado e, em geral, uma fila ou stream para propagar os eventos até o destino. Vale o investimento quando a origem tem alto volume de updates e deletes, quando a latência da ingestão precisa ser de minutos ou menos, não de horas, ou quando capturar deletes é um requisito real do negócio.\n\nPara volumes menores ou janelas de atualização de algumas horas, um watermark bem implementado costuma ser suficiente e mais simples de manter. Em termos de ferramentas, o CDC baseado em log costuma aparecer em conectores especializados (o Debezium é um exemplo conhecido), e soluções gerenciadas de ingestão como Fivetran e Airbyte também oferecem CDC como opção pronta para várias origens, sem o time precisar operar o conector."
                    },
                    {
                        "type": "quote",
                        "value": "CDC não pergunta o que mudou: ele já sabia no instante em que mudou. A diferença entre perguntar e escutar é o que o separa do watermark."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza a técnica de Change Data Capture (CDC) em um pipeline de ingestão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Comparar periodicamente um checksum da tabela inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Capturar inserções, atualizações e exclusões como eventos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Extrair a tabela inteira em intervalos bem curtos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar uma cópia diária da tabela de origem inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica diferencia o CDC baseado em log do CDC baseado em query (polling)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Só funciona em bancos hospedados na nuvem pública.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não consegue capturar operações de update na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exige que a origem tenha uma coluna updated_at preenchida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lê o log de transações, sem consultar as tabelas direto.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados precisa que exclusões físicas feitas no sistema de origem sejam refletidas no data warehouse em poucos minutos, sem sobrecarregar o banco transacional com consultas repetidas. A tabela não tem nenhuma coluna que marque exclusão lógica. Qual abordagem atende melhor esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extração incremental por watermark, rodando a cada minuto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração full a cada poucos minutos, sobre a tabela toda.",
                                "isCorrect": false
                            },
                            {
                                "text": "CDC baseado em log, capturando os deletes direto do log.",
                                "isCorrect": true
                            },
                            {
                                "text": "CDC baseado em query, consultando a tabela a cada minuto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de catálogo de produtos recebe poucas dezenas de atualizações por dia, e o time de BI só precisa dos dados atualizados uma vez por dia, pela manhã. O time de banco de dados também restringe o acesso ao log de transações por política de segurança. Qual abordagem de extração é a mais adequada nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Incremental por watermark, já que o volume não justifica CDC.",
                                "isCorrect": true
                            },
                            {
                                "text": "CDC baseado em log, negociando uma exceção de acesso pontual.",
                                "isCorrect": false
                            },
                            {
                                "text": "CDC baseado em query, dispensando o acesso ao log de transações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração full a cada hora, como qualquer tabela de catálogo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em relação a ferramentas de ingestão, qual afirmação sobre CDC é correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fivetran e Airbyte não oferecem suporte algum a CDC.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fivetran e Airbyte oferecem CDC pronto para várias origens.",
                                "isCorrect": true
                            },
                            {
                                "text": "O CDC só pode ser implementado por conectores caseiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ferramentas de CDC eliminam a necessidade de watermark.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Formatos de dados",
        "aulas": [
            {
                "titulo": "Formatos de texto: CSV e JSON",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Formatos de texto: CSV e JSON\n\nCSV e JSON são os formatos mais usados para trocar dados entre sistemas. Um arquivo de log, um export de planilha, a resposta de uma API: a chance de encontrar um desses dois formatos na origem de um pipeline é altíssima. Eles são simples de ler, simples de gerar e não exigem nenhuma ferramenta especial para inspecionar, já que qualquer editor de texto abre os dois sem problema.\n\nEssa simplicidade tem um preço. Nenhum dos dois carrega um schema forte nem tipos de dado nativos, então cabe ao pipeline de ingestão validar e converter o que chega antes de qualquer transformação."
                    },
                    {
                        "type": "text",
                        "value": "## CSV: linhas separadas por vírgula (ou quase isso)\n\nCSV (comma-separated values) representa uma tabela como texto puro: uma linha por registro, colunas separadas por um delimitador, geralmente vírgula, mas às vezes ponto e vírgula ou tabulação. Não existe um padrão único e rígido: cada sistema decide, à sua maneira, como lidar com aspas, quebras de linha dentro de um campo e o próprio caractere de delimitador.\n\nO problema clássico é o campo que contém o delimitador dentro do valor. Um endereço como `Rua A, número 10` quebra o parsing se o valor não estiver entre aspas, porque um leitor ingênuo interpreta a vírgula do endereço como se fosse a fronteira entre duas colunas, deslocando todos os campos seguintes da linha.\n\nOutro ponto de atrito é o encoding. Um arquivo salvo em `Latin-1` e lido como `UTF-8` (ou o contrário) corrompe acentos e caracteres especiais sem lançar nenhum erro: o pipeline simplesmente carrega o dado errado, de forma silenciosa. Por isso, declarar o encoding explicitamente na extração é mais seguro do que confiar no padrão do sistema operacional."
                    },
                    {
                        "type": "code",
                        "value": "# CSV sem quoting: o campo com vírgula quebra o parsing\nnome,cidade,observacao\nAna Silva,São Paulo,Cliente antigo\nBruno Costa,Rio de Janeiro, RJ,Pediu desconto\n\n# CSV com quoting correto: o campo problemático fica entre aspas\nnome,cidade,observacao\nAna Silva,São Paulo,Cliente antigo\nBruno Costa,\"Rio de Janeiro, RJ\",Pediu desconto"
                    },
                    {
                        "type": "text",
                        "value": "## JSON: estrutura aninhada e tipos básicos\n\nJSON (JavaScript Object Notation) resolve parte do problema do CSV: strings, números, booleanos e nulos são tipos distintos, e um objeto pode aninhar outros objetos e listas. É o formato padrão de resposta de praticamente toda API REST, o que faz dele a porta de entrada mais comum quando um pipeline ingere dados de sistemas externos.\n\nO custo aparece na hora de achatar (flatten) essa estrutura para uma tabela. Um pedido com uma lista de itens dentro do objeto precisa virar uma ou mais tabelas relacionais antes de chegar num data warehouse, e cada nível de aninhamento é uma decisão de modelagem: vira uma coluna, uma tabela filha, ou um campo bruto guardado como está.\n\nPara ingestão em lote, é comum encontrar a variante JSON Lines (ou NDJSON): um objeto JSON completo por linha, sem vírgula entre eles e sem colchete externo envolvendo tudo. Isso permite processar o arquivo linha a linha, sem precisar carregar o conteúdo inteiro na memória antes de começar o parsing."
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"pedido_id\": 4521,\n  \"cliente\": \"Ana Silva\",\n  \"itens\": [\n    {\"produto\": \"Teclado\", \"quantidade\": 1},\n    {\"produto\": \"Mouse\", \"quantidade\": 2}\n  ],\n  \"total\": 349.90\n}\n\n# o mesmo tipo de pedido em JSON Lines: um objeto por linha, sem colchete externo\n{\"pedido_id\": 4521, \"cliente\": \"Ana Silva\", \"total\": 349.90}\n{\"pedido_id\": 4522, \"cliente\": \"Bruno Costa\", \"total\": 129.00}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"CSV\", \"JSON\"], [\"Estrutura\", \"Tabular, linhas e colunas\", \"Aninhada, objetos e listas\"], [\"Tipos de dado\", \"Tudo texto, sem distinção nativa\", \"Texto, número, booleano e nulo distintos\"], [\"Tamanho do arquivo\", \"Mais compacto, sem repetir nome de campo\", \"Maior, repete o nome dos campos em cada registro\"], [\"Uso típico\", \"Export de planilha, dump de tabela\", \"Resposta de API, eventos e mensagens\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "CSV e JSON são ótimos para trocar dados entre sistemas heterogêneos, mas nenhum dos dois foi pensado para leitura analítica eficiente em grande volume: eles seguem sendo a porta de entrada da ingestão, raramente o formato de armazenamento intermediário ou final de um pipeline."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista recebe um arquivo CSV exportado de um sistema legado e reclama que todas as colunas, inclusive as numéricas, chegam como texto. Por que isso acontece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O sistema legado tem um defeito que apaga o tipo original de cada coluna na exportação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CSV só preserva números quando o delimitador usado é o ponto e vírgula.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CSV não tem tipos de dado nativos: tudo é armazenado como texto simples.",
                                "isCorrect": true
                            },
                            {
                                "text": "O editor de planilhas converteu os campos para texto ao salvar o arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline lê diariamente um CSV exportado de um CRM. Depois que a equipe de vendas passou a preencher o campo de endereço no formato 'Rua X, número Y', algumas linhas começam a chegar com colunas deslocadas no destino. Qual é a causa mais provável, e a correção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O CRM passou a usar um encoding diferente do esperado; ajustar o encoding na leitura resolve o deslocamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O exportador não coloca aspas em campos que contêm o delimitador; corrigir o quoting resolve o deslocamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo ficou grande demais para o parser processar de uma vez; dividir o CSV resolve o deslocamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem das colunas mudou no CRM; mapear os campos por posição em vez de nome resolve o deslocamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de migrar a extração de um CSV para um servidor diferente, nomes como 'João' e 'São Paulo' começam a chegar com caracteres estranhos no lugar dos acentos, sem nenhum erro reportado pelo pipeline. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O encoding declarado na leitura não bate com o do arquivo, corrompendo os acentos sem aviso.",
                                "isCorrect": true
                            },
                            {
                                "text": "O novo servidor roda uma versão de sistema operacional incompatível com arquivos CSV.",
                                "isCorrect": false
                            },
                            {
                                "text": "O delimitador do CSV foi alterado na migração e passou a tratar acentos como separador.",
                                "isCorrect": false
                            },
                            {
                                "text": "O CSV atingiu um limite de tamanho de coluna e truncou os caracteres acentuados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de e-commerce retorna cada pedido como um JSON com uma lista de itens aninhada dentro do objeto, e o destino é uma tabela relacional de pedidos. Qual abordagem lida melhor com essa estrutura na ingestão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Guardar a lista de itens inteira como uma única string separada por vírgulas na tabela de pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar a lista de itens e manter apenas os campos de nível superior do pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma coluna nova para cada item possível, numerando item_1, item_2 e assim por diante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar em duas tabelas, uma de pedidos e outra de itens, ligadas pelo id do pedido.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline recebe diariamente um arquivo de eventos com centenas de milhares de linhas. A equipe decide gerar esse arquivo em JSON Lines em vez de um único array JSON. Qual é a principal vantagem dessa escolha para esse volume?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O JSON Lines comprime os dados automaticamente, reduzindo o tamanho do arquivo em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "O JSON Lines impede que campos aninhados apareçam nos eventos, simplificando o schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo pode ser processado linha a linha, sem carregar a estrutura inteira na memória.",
                                "isCorrect": true
                            },
                            {
                                "text": "O JSON Lines adiciona tipagem forte aos campos, eliminando a necessidade de validação.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Parquet: o formato colunar do mundo analítico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Parquet: o formato colunar do mundo analítico\n\nOs formatos vistos até aqui, CSV e JSON, são orientados a linha: cada registro completo fica armazenado junto, um após o outro. Isso é ótimo para escrever e ler um registro inteiro de cada vez, o padrão de acesso típico de um sistema transacional. A maioria das cargas analíticas, porém, faz o oposto: lê poucas colunas de bilhões de linhas para calcular uma soma, uma média ou um agrupamento.\n\nO Apache Parquet nasceu para esse segundo cenário. É um formato binário, colunar, pensado para ser lido (não editado) por motores analíticos, e hoje é o formato de armazenamento mais comum em data lakes e data warehouses modernos."
                    },
                    {
                        "type": "text",
                        "value": "## Armazenamento colunar: ler só o que importa\n\nNum arquivo orientado a linha, para somar uma única coluna o motor de leitura precisa passar por cada registro inteiro, descartando o resto dos campos depois de lidos. Num arquivo colunar, os valores de cada coluna ficam armazenados fisicamente juntos. Uma consulta que usa 3 colunas de uma tabela com 50 lê apenas os blocos dessas 3 colunas no disco, ignorando as outras 47 por completo.\n\nEssa poda de colunas (column pruning) é o principal motivo do ganho de performance e de custo: em ambientes de nuvem que cobram por dado lido ou por I/O, ler menos colunas significa menos bytes trafegados e menos tempo de consulta."
                    },
                    {
                        "type": "code",
                        "value": "Armazenamento orientado a linha (CSV, JSON):\n[id=1, nome=Ana, cidade=SP] [id=2, nome=Bruno, cidade=RJ] [id=3, nome=Carla, cidade=MG]\n\nArmazenamento orientado a coluna (Parquet):\nid:      [1, 2, 3]\nnome:    [Ana, Bruno, Carla]\ncidade:  [SP, RJ, MG]\n\n# uma consulta que lê só a coluna \"cidade\" acessa apenas o bloco dela,\n# sem tocar em id e nome"
                    },
                    {
                        "type": "text",
                        "value": "## Compressão por coluna e schema embutido\n\nValores de uma mesma coluna tendem a se parecer entre si: a coluna `cidade` repete um número pequeno de valores distintos, a coluna `status` talvez tenha só 3 ou 4 possibilidades. Guardar esses valores juntos permite técnicas de compressão bem mais eficientes do que comprimir uma linha inteira com tipos diferentes misturados, como um dicionário dos valores repetidos ou uma contagem de repetições em sequência.\n\nO Parquet também guarda o schema dentro do próprio arquivo: nome de cada coluna, tipo de dado e metadados como valor mínimo e máximo por bloco. Isso significa que um motor de consulta abre o arquivo e já conhece a estrutura dos dados, sem depender de um catálogo externo ou de inferência manual, e ainda consegue pular blocos inteiros que não satisfazem um filtro, só olhando os metadados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"CSV\", \"Parquet\"], [\"Orientação\", \"Linha\", \"Coluna\"], [\"Schema\", \"Não possui, é apenas texto\", \"Embutido no próprio arquivo\"], [\"Compressão\", \"Opcional, sobre o arquivo inteiro\", \"Nativa, aplicada por coluna\"], [\"Leitura de poucas colunas\", \"Lê o arquivo inteiro mesmo assim\", \"Lê só os blocos das colunas usadas\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- tabela de vendas com 20 colunas armazenada em Parquet\n-- a consulta abaixo usa só 2 colunas\nSELECT regiao, SUM(valor_total)\nFROM vendas\nGROUP BY regiao;\n\n-- o motor de leitura acessa somente os blocos de \"regiao\" e \"valor_total\"\n-- as outras 18 colunas do arquivo Parquet nunca são lidas do disco"
                    },
                    {
                        "type": "quote",
                        "value": "Parquet virou padrão em data lake e data warehouse porque resolve o que mais custa num ambiente analítico: menos bytes lidos por consulta e menos espaço ocupado em disco, sem abrir mão de um schema explícito."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela de vendas com 40 colunas está armazenada em Parquet. Uma consulta calcula a soma de uma única coluna numérica. Por que o Parquet tende a responder essa consulta mais rápido do que o mesmo dado em CSV?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o Parquet armazena por coluna e lê só os blocos da coluna usada na consulta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Parquet mantém os dados sempre ordenados pela coluna mais consultada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Parquet guarda uma cópia resumida de cada coluna, pronta para somas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Parquet distribui a consulta automaticamente entre várias máquinas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de clientes tem uma coluna `estado` com apenas 27 valores possíveis, repetidos milhões de vezes, e uma coluna `email` com valores quase todos únicos. Ao converter essa tabela para Parquet, qual efeito se espera sobre o tamanho de cada coluna no arquivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As duas colunas comprimem na mesma proporção, porque o Parquet aplica uma taxa fixa por arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna `estado` comprime bem mais do que `email`, por ter poucos valores distintos se repetindo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A coluna `email` comprime mais, porque strings longas sempre comprimem melhor que strings curtas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas colunas comprime, porque o Parquet só comprime campos numéricos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados substitui a leitura de arquivos JSON por arquivos Parquet como origem de uma tabela externa no data warehouse. Depois da troca, deixa de ser necessário declarar manualmente o tipo de cada coluna na definição da tabela. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O data warehouse aprende os tipos automaticamente na primeira consulta e os reaproveita depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Parquet converte todos os campos para texto, então nenhum tipo precisa ser declarado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O formato Parquet exige que a tabela já exista antes da carga, herdando o schema dela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Parquet guarda o schema, nomes e tipos de cada coluna, dentro do próprio arquivo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de pedidos em Parquet tem bilhões de linhas, divididas em milhares de blocos. Uma consulta filtra `data_pedido = '2026-07-01'`. Além de ler só as colunas usadas, o que mais permite ao motor de consulta ignorar a maioria dos blocos sem abrir o conteúdo deles?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os metadados de cada bloco guardam valor mínimo e máximo, permitindo pular blocos fora do filtro.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Parquet ordena fisicamente todos os blocos pela data antes de gravar, isolando cada dia num arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O motor de consulta mantém um índice em memória com a posição exata de cada linha do arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Parquet cria automaticamente um arquivo por dia sempre que existe uma coluna de data na tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe avalia usar Parquet como o armazenamento por trás de um sistema transacional que grava e atualiza pedidos a cada poucos segundos, linha por linha. Qual é o principal problema dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Parquet não suporta colunas do tipo texto, apenas tipos numéricos, o que inviabiliza a maioria dos pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Parquet exige que o schema inteiro seja recriado a cada gravação, dobrando o tempo de escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Parquet é otimizado para leitura em lote; escritas frequentes de poucas linhas são custosas e pouco práticas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Parquet limita cada arquivo a um milhão de linhas, exigindo um particionamento manual a cada pedido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Avro: formato de linha e schema para dados em movimento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Avro: formato de linha e schema para dados em movimento\n\nAvro é um formato binário, orientado a linha, criado dentro do ecossistema Hadoop e hoje bastante usado como formato de mensagens em filas e sistemas de streaming. Ele ocupa um lugar particular no mapa dos formatos: assim como CSV e JSON, grava um registro inteiro de cada vez, o que favorece escrita frequente; mas assim como o Parquet, carrega um schema explícito e tipado junto com os dados, o que favorece confiabilidade."
                    },
                    {
                        "type": "text",
                        "value": "## Schema junto com o dado, e schema que evolui\n\nCada arquivo Avro carrega o schema usado para escrevê-lo, normalmente descrito em JSON: nome dos campos, tipos e quais campos são opcionais. Isso viabiliza uma capacidade central do formato, a evolução de schema: um produtor pode adicionar um campo novo, com um valor padrão definido, sem quebrar os consumidores que ainda leem pelo schema antigo; e um consumidor com um schema mais novo consegue ler dados gravados com um schema mais antigo.\n\nIsso importa muito em sistemas de mensageria, onde produtores e consumidores de um mesmo tópico raramente fazem deploy no mesmo instante. Um evento gravado hoje pode ser lido por um consumidor atualizado só semanas depois, e o par de schemas envolvido, o de escrita e o de leitura, precisa continuar compatível."
                    },
                    {
                        "type": "code",
                        "value": "# schema Avro: define os campos e tipos do registro\n{\n  \"type\": \"record\",\n  \"name\": \"Pedido\",\n  \"fields\": [\n    {\"name\": \"pedido_id\", \"type\": \"long\"},\n    {\"name\": \"cliente\", \"type\": \"string\"},\n    {\"name\": \"total\", \"type\": \"double\"},\n    {\"name\": \"cupom\", \"type\": [\"null\", \"string\"], \"default\": null}\n  ]\n}\n\n# \"cupom\" foi adicionado depois, com default null:\n# consumidores com o schema antigo continuam lendo o registro sem quebrar"
                    },
                    {
                        "type": "text",
                        "value": "## Por que Avro combina com streaming e escrita intensa\n\nSistemas de mensageria, como filas e tópicos de streaming, lidam com um fluxo contínuo de eventos pequenos sendo escritos o tempo todo, um registro de cada vez. Escrever um registro Avro é barato: basta serializar aquele registro isolado usando o schema. Escrever um único registro num arquivo Parquet é mais caro, porque o formato colunar foi pensado para acumular muitos registros e organizá-los por coluna antes de gravar em blocos.\n\nPor isso é comum ver um pipeline usando os dois formatos em momentos diferentes: Avro para transportar o dado no meio do caminho, em filas, mensageria ou chamadas entre serviços; e Parquet quando o dado chega na área de armazenamento analítico e passa a ser majoritariamente lido, não mais escrito registro a registro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Avro\", \"Parquet\"], [\"Orientação\", \"Linha\", \"Coluna\"], [\"Melhor cenário\", \"Escrita frequente, streaming, mensageria\", \"Leitura analítica em lote\"], [\"Foco do schema\", \"Evolução de schema entre versões\", \"Metadados para leitura eficiente\"], [\"Formato dos dados\", \"Binário\", \"Binário\"]]"
                    },
                    {
                        "type": "code",
                        "value": "aplicação produtora --(evento Avro)--> fila / tópico de streaming --(consumidor grava em lote)--> arquivo Parquet no data lake\n\n   escrita registro a registro                                    leitura analítica em lote"
                    },
                    {
                        "type": "quote",
                        "value": "Avro carrega o schema junto com o dado e foi desenhado para escrever um registro de cada vez sem atrito, o que faz dele a escolha natural para o meio do caminho de um pipeline: filas, mensageria e streaming, antes de o dado pousar num formato colunar para análise."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica diferencia o Avro do Parquet, mesmo os dois carregando um schema explícito junto com os dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Avro não suporta tipos numéricos, enquanto o Parquet suporta todos os tipos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Avro só funciona dentro do Hadoop, enquanto o Parquet funciona em qualquer ambiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Avro grava os dados em texto simples, enquanto o Parquet grava em binário.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Avro grava os registros orientado a linha, enquanto o Parquet grava orientado a coluna.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um produtor de eventos em Avro adiciona um novo campo `cupom` ao schema, com valor padrão `null`. Consumidores que ainda usam o schema anterior continuam rodando sem nenhuma alteração. O que se espera desses consumidores ao ler os eventos novos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Continuam funcionando normalmente, simplesmente ignorando o campo `cupom` que não conhecem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Param de funcionar, porque o schema de leitura precisa ser idêntico ao schema de escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Passam a ler o evento inteiro como texto bruto, sem conseguir separar os campos originais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recebem o campo `cupom` sempre preenchido com o último valor visto por outro consumidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço grava um evento por vez, dezenas de vezes por segundo, numa fila de mensageria. A equipe discute em qual formato serializar cada evento antes de publicar. Qual formato tende a ser mais adequado para essa escrita registro a registro, e por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Parquet, porque o formato colunar reduz o tamanho de cada mensagem publicada individualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Avro, porque serializar um único registro é uma operação leve nesse formato orientado a linha.",
                                "isCorrect": true
                            },
                            {
                                "text": "CSV, porque não exige schema e por isso é sempre a opção mais rápida para qualquer escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Avro, porque o formato exige acumular um lote mínimo antes de aceitar qualquer escrita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe faz o deploy de um consumidor com um schema Avro mais recente antes de qualquer produtor ter sido atualizado. Esse consumidor passa a ler eventos antigos, gravados com o schema anterior. O que permite essa leitura funcionar sem erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Avro reprocessa automaticamente todos os eventos antigos para o schema novo assim que o consumidor sobe.",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumidor ignora o schema Avro e lê os bytes brutos usando a posição fixa de cada campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O par de schemas envolvidos é resolvido registro a registro, permitindo ler dado antigo com schema novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A fila de mensageria detecta a diferença de schema e converte cada evento antes da entrega.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline recebe eventos de streaming em alta frequência e, horas depois, um job em lote lê esses mesmos dados para gerar relatórios que agregam poucas colunas de tabelas largas. Qual arranjo de formatos tende a equilibrar melhor os dois momentos?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Gravar os eventos em Avro na chegada e convertê-los para Parquet antes da leitura analítica em lote.",
                                "isCorrect": true
                            },
                            {
                                "text": "Gravar direto em Parquet na chegada, um arquivo por evento, e lê-lo em Avro no job analítico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar em Avro na chegada e manter Avro também na leitura analítica, evitando qualquer conversão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar em CSV na chegada, já que evita ter que escolher entre os formatos Avro e Parquet.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Compressão e particionamento de arquivos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Compressão e particionamento de arquivos\n\nDepois de escolher o formato de um arquivo (CSV, JSON, Parquet, Avro), duas decisões práticas afetam diretamente o custo e a performance de qualquer pipeline: como comprimir os arquivos e como organizá-los em pastas. Nenhuma das duas muda o conteúdo lógico do dado, mas as duas mudam quanto ele custa para guardar e para ler depois."
                    },
                    {
                        "type": "text",
                        "value": "## Compressão: trocar CPU por espaço (ou o contrário)\n\nComprimir um arquivo reduz o espaço em disco e o volume trafegado numa leitura, ao custo de gastar CPU para compactar na escrita e descompactar na leitura. Algoritmos diferentes fazem essa troca de formas diferentes:\n\n- **Gzip**: compressão mais forte, arquivo final menor, porém mais lenta para compactar e descompactar. Faz sentido para dados escritos uma vez e lidos raramente, ou quando o custo de armazenamento pesa mais do que o custo de CPU.\n- **Snappy**: compressão mais leve, arquivo final um pouco maior que com gzip, porém muito mais rápida. É a escolha comum dentro de arquivos Parquet e Avro em pipelines analíticos, onde a leitura acontece com frequência e a velocidade importa mais do que espremer cada byte."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Gzip\", \"Snappy\"], [\"Taxa de compressão\", \"Mais alta, arquivo final menor\", \"Mais baixa, arquivo um pouco maior\"], [\"Velocidade\", \"Mais lenta para compactar e ler\", \"Mais rápida para compactar e ler\"], [\"Uso típico\", \"Arquivamento, dados lidos raramente\", \"Dados analíticos lidos com frequência\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Particionamento: organizar arquivos em pastas\n\nParticionar significa dividir os arquivos em pastas de acordo com o valor de uma ou mais colunas, geralmente data e alguma chave de negócio. Uma tabela de vendas particionada por ano, mês e dia grava um conjunto de arquivos por dia, em vez de um único arquivo gigante com todo o histórico.\n\nO ganho aparece na leitura: uma consulta que filtra `data = '2026-07-01'` pode ignorar completamente as pastas de outros dias, sem precisar abrir nenhum arquivo fora do intervalo. Esse corte por pasta (partition pruning) reduz drasticamente o volume lido, de um jeito parecido com a poda de colunas do Parquet, só que na dimensão das linhas em vez das colunas."
                    },
                    {
                        "type": "code",
                        "value": "vendas/\n  ano=2026/\n    mes=06/\n      dia=29/arquivo1.parquet\n      dia=30/arquivo1.parquet\n    mes=07/\n      dia=01/arquivo1.parquet\n      dia=02/arquivo1.parquet\n\n# consulta com filtro data = '2026-07-01' lê só a pasta dia=01\n# as demais pastas nunca são abertas"
                    },
                    {
                        "type": "text",
                        "value": "## O problema dos small files\n\nParticionar demais, ou gravar com muita frequência (um arquivo novo a cada poucos segundos, por exemplo), cria um número enorme de arquivos pequenos dentro da mesma pasta. Isso é conhecido como o problema dos small files, e ele custa caro de um jeito que não aparece no volume total de dados: cada arquivo tem um custo fixo de abertura, listagem e leitura de metadados, independente de quanto dado ele realmente contém.\n\nLer mil arquivos de 1 MB tende a ser mais lento do que ler um único arquivo de 1 GB, mesmo sendo o mesmo volume total, porque o overhead por arquivo se repete mil vezes. A prática comum é compactar arquivos pequenos periodicamente, um processo às vezes chamado de compaction, e escolher uma granularidade de particionamento que gere arquivos de tamanho razoável: nem poucos arquivos enormes, nem milhares de arquivos minúsculos."
                    },
                    {
                        "type": "quote",
                        "value": "Compressão troca CPU por espaço, particionamento troca organização por velocidade de leitura: as duas decisões existem para que um pipeline leia só o que precisa, e as duas podem sair pela culatra quando levadas ao extremo, como no problema clássico dos small files."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe escolhe Snappy em vez de Gzip para comprimir arquivos Parquet lidos várias vezes por dia por consultas analíticas. Qual é a principal razão para essa escolha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Snappy gera arquivos sempre menores do que o Gzip, o que economiza espaço em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snappy comprime e descomprime mais rápido, o que favorece leituras frequentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Snappy é o único algoritmo de compressão que o formato Parquet consegue usar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snappy criptografa os dados durante a compressão, somando uma camada extra de segurança.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um conjunto de arquivos de log é movido para armazenamento de longo prazo, com leitura esperada poucas vezes por ano, após investigações pontuais. O custo de armazenamento pesa mais nessa decisão do que a velocidade de leitura. Qual compressão tende a ser mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Snappy, porque é sempre a opção recomendada, independente da frequência de leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gzip, porque é o único formato de compressão que aceita arquivos de log em texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma compressão, já que arquivos raramente lidos não compensam ser comprimidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gzip, porque comprime mais o arquivo, ao custo de mais CPU numa leitura pouco frequente.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de pedidos é consultada quase sempre com um filtro de intervalo de datas, e raramente por qualquer outra coluna. Ao definir o particionamento dos arquivos no data lake, qual estratégia aproveita melhor esse padrão de consulta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Particionar por id do pedido, garantindo que cada arquivo tenha exatamente um registro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Particionar por data, para que consultas com filtro de data ignorem pastas fora do intervalo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não particionar, deixando todos os registros num único arquivo para simplificar a leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Particionar por todas as colunas da tabela, maximizando as opções de filtro no futuro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um processo grava um novo arquivo Parquet a cada poucos segundos, resultando em milhares de arquivos pequenos por dia dentro da mesma pasta particionada. As consultas sobre essa pasta ficam mais lentas do que o volume total de dados sugeriria. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Arquivos Parquet gravados com poucos segundos de intervalo perdem automaticamente a compressão aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O particionamento por pasta aceita no máximo mil arquivos, e o excedente é ignorado nas consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo fixo de abrir e listar cada arquivo se acumula, encarecendo muitos arquivos pequenos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Arquivos pequenos demais deixam de conter um schema Parquet válido, exigindo releitura repetida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela com poucas linhas por dia está particionada por ano, mês, dia e hora. O resultado é um grande número de pastas contendo, cada uma, arquivos de poucos kilobytes. Qual ajuste tende a melhorar a performance sem abrir mão do particionamento por data?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar o formato de Parquet para CSV, que não sofre com o problema de arquivos pequenos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a granularidade para incluir também o minuto, distribuindo ainda mais os registros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o particionamento por data e particionar apenas por uma chave de negócio irrelevante ao filtro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a granularidade do particionamento, por exemplo para só ano e mês, gerando arquivos maiores.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Schema e evolução de schema",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Schema e evolução de schema\n\nSchema é a definição formal dos dados: quais campos existem, o tipo de cada um, e quais são obrigatórios. Toda fonte de dados tem um schema, mesmo que ele nunca tenha sido escrito em lugar nenhum: um CSV sem cabeçalho ainda tem colunas numa ordem fixa, uma API ainda devolve os mesmos campos em toda resposta. O que muda de formato para formato, e de pipeline para pipeline, é o momento em que esse schema é verificado."
                    },
                    {
                        "type": "text",
                        "value": "## Schema-on-write x schema-on-read\n\n**Schema-on-write** valida a estrutura dos dados no momento da escrita: um banco relacional, por exemplo, rejeita um INSERT que não respeita as colunas e os tipos da tabela. O dado só entra se estiver conforme, o que dá confiança a quem lê depois, mas exige que o schema já esteja definido antes de qualquer carga.\n\n**Schema-on-read** adia essa validação para o momento da leitura: o dado é gravado como está (um JSON, um CSV, um arquivo de log), e cada consumidor aplica sua própria interpretação de schema ao ler. Isso dá flexibilidade para ingerir dados de fontes variadas sem um trabalho de modelagem prévio, mas transfere o risco de inconsistência para quem consome o dado depois."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Schema-on-write\", \"Schema-on-read\"], [\"Quando valida\", \"Na escrita\", \"Na leitura\"], [\"Flexibilidade para ingerir\", \"Baixa, exige schema definido antes\", \"Alta, aceita dados de formatos variados\"], [\"Risco de dado inconsistente\", \"Baixo, rejeitado logo na entrada\", \"Alto, só aparece quando alguém lê\"], [\"Exemplo típico\", \"Tabela de um banco relacional\", \"Arquivos JSON num data lake\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Evoluir um schema sem quebrar quem consome\n\nFontes de dados mudam: um sistema de origem ganha um campo novo, deixa de preencher outro, ou muda o tipo de uma coluna existente. Duas ideias ajudam a avaliar se essa mudança é segura:\n\n- **Compatibilidade retroativa (backward)**: um consumidor com o schema novo consegue ler dados gravados com o schema antigo.\n- **Compatibilidade progressiva (forward)**: um consumidor com o schema antigo consegue ler dados gravados com o schema novo.\n\nAdicionar uma coluna opcional, com um valor padrão definido, costuma preservar os dois sentidos: quem lê com o schema antigo ignora a coluna nova, e quem lê com o schema novo usa o padrão quando o dado antigo não a possui. Remover uma coluna, ou mudar o tipo de uma coluna existente, como de inteiro para texto, é a mudança mais arriscada: qualquer consumidor que ainda espera o campo do jeito antigo pode quebrar."
                    },
                    {
                        "type": "code",
                        "value": "# schema v1, em produção há meses\n{\"campos\": [\"pedido_id\", \"cliente\", \"total\"]}\n\n# schema v2, adiciona campo opcional com valor padrão\n{\"campos\": [\"pedido_id\", \"cliente\", \"total\", \"cupom (opcional, padrão: null)\"]}\n# consumidores antigos: ignoram \"cupom\", continuam funcionando normalmente\n# consumidores novos lendo dado antigo: recebem \"cupom\" = null\n\n# mudança arriscada: renomear o campo \"total\" para \"valor_total\"\n# consumidores antigos procuram por \"total\" e não encontram mais o campo"
                    },
                    {
                        "type": "text",
                        "value": "## Um checklist prático\n\nAntes de aplicar uma mudança de schema numa fonte que alimenta um pipeline, vale perguntar:\n\n- Adicionar uma coluna opcional com valor padrão: geralmente seguro nos dois sentidos.\n- Remover uma coluna: arriscado, quebra qualquer consumidor que ainda a espera.\n- Renomear uma coluna: na prática, equivale a remover uma e adicionar outra, com o mesmo risco.\n- Mudar o tipo de uma coluna existente: arriscado, mesmo quando a conversão parece óbvia (de inteiro para texto, por exemplo), porque quem consome pode depender do tipo original.\n\nFormatos como Avro e Parquet ajudam justamente por guardarem o schema junto com o dado, tornando essas mudanças visíveis e verificáveis, em vez de descobertas só quando algo já quebrou em produção."
                    },
                    {
                        "type": "quote",
                        "value": "Schema não é um detalhe técnico do formato de arquivo: é o contrato entre quem grava e quem lê um dado, e a diferença entre uma mudança tranquila e um pipeline quebrado em produção costuma estar em quando esse contrato é verificado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um banco de dados relacional rejeita um INSERT porque o valor enviado para uma coluna numérica veio como texto inválido. Esse comportamento é um exemplo de qual abordagem de schema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Schema-on-write, porque a estrutura é validada no momento da escrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Schema-on-read, porque a estrutura só é verificada quando alguém consulta a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema-on-write, porque o banco converte automaticamente o valor para o tipo esperado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema-on-read, porque o banco aceita o valor e sinaliza o erro só na próxima leitura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe recebe arquivos de várias fontes externas, cada uma com uma estrutura levemente diferente, e quer começar a ingerir esses arquivos num data lake antes de definir um modelo único para todas elas. Qual abordagem de schema combina melhor com essa necessidade inicial?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Schema-on-write, criando uma tabela relacional com todas as colunas possíveis antes do primeiro arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema-on-read, gravando os arquivos como chegam e aplicando a interpretação de estrutura só na leitura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Schema-on-read, rejeitando na ingestão qualquer arquivo cuja estrutura ainda não foi definida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema-on-write, convertendo automaticamente cada fonte para uma estrutura comum antes da escrita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de origem passa a enviar um campo novo, opcional, com valor padrão definido, em cada registro. Consumidores que ainda usam o schema anterior continuam sendo executados sem nenhuma alteração. O que se espera desses consumidores?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Param de funcionar, porque qualquer campo novo obriga a atualização imediata de todos eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "Passam a receber os registros vazios, já que o campo novo invalida o restante da estrutura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuam funcionando normalmente, ignorando o campo novo que não faz parte do schema deles.",
                                "isCorrect": true
                            },
                            {
                                "text": "Continuam funcionando, mas duplicam cada registro por não reconhecerem o campo novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe renomeia a coluna `total` para `valor_total` na origem de um pipeline, sem avisar os times consumidores. Alguns relatórios que dependiam do campo `total` começam a falhar. Por que essa mudança quebrou os consumidores, mesmo o dado em si continuando o mesmo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Renomear colunas sempre exige uma migração de banco de dados, que não foi executada nesse caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tipo de dado da coluna muda automaticamente durante uma renomeação, invalidando o valor gravado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Renomear uma coluna apaga o histórico de dados anteriores à mudança, deixando os relatórios sem base.",
                                "isCorrect": false
                            },
                            {
                                "text": "Renomear equivale, na prática, a remover uma coluna e adicionar outra, quebrando quem busca o nome antigo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time avalia quatro mudanças propostas para o schema de uma tabela de eventos consumida por vários outros times, e quer aplicar somente a de menor risco de quebrar consumidores existentes. Qual das opções abaixo tende a ser a mudança mais segura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Remover a coluna `status`, já que poucos relatórios parecem usá-la atualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar uma coluna opcional, com um valor padrão definido para os registros que não a possuem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mudar o tipo da coluna `quantidade` de inteiro para texto, mantendo o mesmo nome de campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Renomear a coluna `data_evento` para `timestamp`, padronizando com as demais tabelas do time.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Transformação de dados",
        "aulas": [
            {
                "titulo": "Limpeza: nulos, tipos, duplicatas e outliers",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Limpeza: nulos, tipos, duplicatas e outliers\n\nDepois que os dados chegam na área de staging, extraídos de um banco, de uma API ou de um arquivo, eles raramente estão prontos para alimentar um relatório ou um modelo. A transformação começa resolvendo os problemas mais comuns de qualidade: campos vazios, tipos errados, registros repetidos e valores fora da curva. Esta aula cobre os três primeiros de perto, nulos, tipos e outliers, além de uma introdução rápida a duplicatas (a deduplicação a fundo fica para a próxima aula)."
                    },
                    {
                        "type": "text",
                        "value": "## Valores ausentes: dropar ou imputar\n\nUm campo nulo pode significar coisas diferentes: o dado nunca existiu, foi perdido na extração, ou é legitimamente opcional. Antes de decidir o que fazer, vale entender qual desses casos está na frente.\n\nAs duas estratégias básicas são:\n\n- **Dropar**: remover a linha (ou a coluna inteira) quando o campo é essencial e não dá para inventar um valor razoável, como uma chave de negócio ausente.\n- **Imputar**: preencher o nulo com um valor, seja fixo (uma constante como `SEM_CUPOM`), estatístico (média, mediana, moda) ou o último valor conhecido.\n\nDropar sem critério some com volume e pode enviesar a amostra, se o nulo não for aleatório. Imputar sem critério mistura dado real com dado inventado, e quem consome a tabela depois raramente sabe distinguir um do outro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"Quando faz sentido\",\"Risco\"],[\"Dropar a linha\",\"Poucos registros afetados e o campo é essencial, como a chave do pedido\",\"Perde volume e pode enviesar a amostra se o nulo não for aleatório\"],[\"Imputar um valor fixo\",\"Campo opcional com um valor neutro claro, como cupom igual a SEM_CUPOM\",\"Mistura dado real com dado inventado, e isso precisa ficar rastreável\"],[\"Imputar média ou mediana\",\"Campo numérico com poucos nulos e distribuição estável\",\"Achata a variância e pode distorcer métricas sensíveis a valores extremos\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Uma view de limpeza tipica: cast seguro + valores default para campos opcionais\nCREATE OR REPLACE VIEW stg_pedidos_limpo AS\nSELECT\n    pedido_id,\n    TRY_CAST(valor_bruto AS NUMERIC(12,2)) AS valor,\n    TRY_CAST(data_pedido AS DATE)          AS data_pedido,\n    COALESCE(cupom_desconto, 'SEM_CUPOM')  AS cupom_desconto,\n    COALESCE(quantidade, 0)                AS quantidade\nFROM stg_pedidos_raw\nWHERE pedido_id IS NOT NULL;  -- sem chave de negocio, a linha e descartada\n\n-- Quantas linhas tiveram o cast de valor_bruto falhando (virou nulo)?\nSELECT COUNT(*) AS linhas_com_valor_invalido\nFROM stg_pedidos_raw\nWHERE valor_bruto IS NOT NULL\n  AND TRY_CAST(valor_bruto AS NUMERIC(12,2)) IS NULL;"
                    },
                    {
                        "type": "text",
                        "value": "## Tipos e coerção: o cast pode falhar\n\nDados vindos de CSV, planilha ou API costumam chegar como texto, mesmo quando representam número ou data. `\"1.234,56\"` e `\"1234.56\"` podem ser o mesmo valor em formatos diferentes, e um cast ingênuo transforma um no outro errado ou simplesmente falha.\n\nDois cuidados importantes:\n\n- **Cast que falha não pode derrubar a carga inteira.** A maioria dos data warehouses oferece uma variante segura de conversão de tipo (frequentemente chamada de `TRY_CAST` ou `SAFE_CAST`) que devolve nulo em vez de erro quando o valor não converte.\n- **Contar as falhas de cast é parte do trabalho.** Uma linha que virou nulo depois do cast é uma pista de que a origem mudou o formato ou mandou lixo, e vale monitorar esse número ao longo do tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Outliers: nem todo valor extremo é erro\n\nOutlier é um valor que foge muito do padrão do restante dos dados: um pedido de R$ 500.000 numa loja onde o ticket médio é R$ 80, ou uma idade de 180 anos num cadastro de cliente. Duas formas simples de detectar:\n\n- **Regra de negócio**: limites conhecidos do domínio (idade entre 0 e 120, quantidade positiva).\n- **Estatística**: valores muito distantes da média ou fora de uma faixa como o intervalo interquartil.\n\nA parte difícil não é detectar, é decidir o que fazer: um outlier pode ser erro de digitação (dropar ou corrigir), pode ser um evento real que merece ficar (uma Black Friday não é erro), ou pode precisar só ser sinalizado numa coluna à parte para quem for analisar decidir. Tratar todo outlier como lixo, sem investigar, é tão arriscado quanto ignorá-los."
                    },
                    {
                        "type": "quote",
                        "value": "Dado sujo que passa despercebido na transformação não desaparece, ele só troca de lugar: vira métrica errada no dashboard ou viés silencioso no modelo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Durante a limpeza de uma tabela de pedidos em staging, uma pequena fração das linhas chegou sem o `pedido_id` preenchido. Qual é a abordagem mais adequada para essas linhas?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Imputar o `pedido_id` com um valor sequencial gerado pelo próprio pipeline de transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Imputar o `pedido_id` com a moda da coluna, repetindo o identificador mais frequente da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar essas linhas, já que não existe valor razoável para imputar numa chave de negócio ausente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter as linhas com `pedido_id` nulo e tratar esse campo como opcional dali em diante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de vendas tem uma coluna `desconto_percentual` numérica, com 2% das linhas nulas. Investigando a origem, o time descobre que o campo fica em branco quando nenhum desconto foi aplicado ao pedido. Qual tratamento é mais coerente com esse comportamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Imputar zero, porque nesse caso o nulo representa ausência de desconto, não um dado desconhecido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Imputar a média dos descontos aplicados, porque ela representa o comportamento típico da loja.",
                                "isCorrect": false
                            },
                            {
                                "text": "Imputar a mediana dos descontos aplicados, porque ela resiste melhor a valores extremos na coluna.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar as linhas com desconto nulo, porque um campo numérico não deveria ficar em branco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de aplicar `TRY_CAST` numa coluna `data_pedido` recém-chegada de um arquivo CSV, 15% das linhas viraram nulas na data, um salto em relação ao 1% histórico do pipeline. O que essa mudança mais provavelmente indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O warehouse atingiu um limite de processamento e descarta conversões de forma aleatória.",
                                "isCorrect": false
                            },
                            {
                                "text": "O TRY_CAST está com defeito nessa consulta e precisa ser trocado por um CAST comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de pedidos cresceu na origem, o que eleva naturalmente a taxa de falha do cast.",
                                "isCorrect": false
                            },
                            {
                                "text": "A origem provavelmente passou a mandar as datas num formato diferente do que o cast espera.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de limpeza aplica a regra de descartar automaticamente qualquer pedido com valor acima de 3 desvios-padrão da média histórica. Numa Black Friday, isso descartou pedidos legítimos de alto valor, o que reduziu artificialmente a receita reportada no dashboard do dia. Qual é o principal problema dessa regra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O desvio-padrão deveria ser calculado sobre o próprio dia, e não sobre o histórico completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela trata todo valor estatisticamente extremo como erro, sem considerar o contexto do evento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela deveria comparar com a mediana em vez da média, o que preservaria os pedidos do dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite de 3 desvios-padrão está matematicamente errado e deveria ser de 2 desvios-padrão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista percebe que um dashboard de receita mensal está inflado porque a coluna `valor_pedido` não passou por nenhum tratamento de outlier ou de cast na transformação, deixando passar valores absurdos vindos de erro de digitação na origem. Isso ilustra principalmente qual risco de pular a limpeza de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O warehouse recusa automaticamente a carga ao encontrar um valor de origem inconsistente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A extração incremental para de funcionar quando a origem envia um valor fora do padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erros vindos da origem se propagam sem filtro até relatórios e decisões que dependem deles.",
                                "isCorrect": true
                            },
                            {
                                "text": "O custo de armazenamento cresce proporcionalmente ao número de valores extremos na tabela.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Padronização e enriquecimento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Padronização e enriquecimento\n\nDepois de limpar nulos, tipos e outliers, os dados ainda podem estar tecnicamente corretos e mesmo assim inconsistentes: uma data em três formatos diferentes, um estado gravado como `SP`, `S.P.` e `São Paulo` na mesma coluna, um valor em centavos numa linha e em reais na outra. Padronizar coloca tudo na mesma régua. Enriquecer vai além: junta a linha com uma fonte de referência para adicionar contexto que ela não trazia sozinha."
                    },
                    {
                        "type": "text",
                        "value": "## Normalizar formatos\n\nFormato inconsistente é diferente de dado errado: o valor está certo, mas representado de jeitos diferentes, o que quebra qualquer comparação ou agregação. Os casos mais comuns:\n\n- **Datas**: `10/03/2026`, `2026-03-10` e `Mar 10, 2026` podem ser o mesmo dia; escolher um formato canônico (geralmente ISO 8601, `AAAA-MM-DD`) evita ambiguidade, inclusive entre dia e mês.\n- **Moeda**: centavos como inteiro (`15090`) e reais como decimal (`150.90`) precisam virar uma única unidade antes de somar qualquer coisa.\n- **Texto**: maiúsculas e minúsculas misturadas atrapalham join e agrupamento se não forem uniformizadas.\n- **Unidades**: `kg` numa linha e `g` na outra fazem a soma de uma coluna `peso` não significar nada sem conversão prévia."
                    },
                    {
                        "type": "code",
                        "value": "SELECT\n    pedido_id,\n    UPPER(TRIM(estado))                AS estado,\n    TO_CHAR(data_pedido, 'YYYY-MM-DD') AS data_pedido,\n    CASE\n        WHEN moeda = 'centavos' THEN valor / 100.0\n        ELSE valor\n    END                                 AS valor_em_reais\nFROM stg_pedidos_limpo;"
                    },
                    {
                        "type": "text",
                        "value": "## Padronizar categorias\n\nCategorias de texto livre são um problema parecido, só que sem uma regra matemática pronta: a mesma ideia pode chegar escrita de várias formas (`cartao`, `Cartão de Crédito`, `CC`, `cartao credito`). Padronizar aqui costuma significar mapear cada variação para um valor canônico, geralmente com uma tabela de mapeamento ou uma série de `CASE WHEN`. Sem isso, um `GROUP BY forma_pagamento` conta o mesmo método de pagamento como se fossem vários diferentes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Valor na origem\",\"Valor canônico\"],[\"cartao, CC, cartao credito\",\"cartao_credito\"],[\"boleto, bank slip, BOLETO\",\"boleto\"],[\"pix, PIX, Pix\",\"pix\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Enriquecer com dados de referência\n\nPadronizar arruma o que já existe na linha. Enriquecer adiciona algo que não estava lá, buscando em outra fonte via join ou lookup. Exemplos comuns:\n\n- Juntar um pedido com uma tabela de câmbio pela data, para converter um valor em dólar para reais no dia da transação.\n- Juntar um CEP com uma tabela de referência de endereços, para adicionar cidade, estado e região a um cadastro que só trazia o CEP.\n- Juntar um `id_categoria` com uma tabela de dimensão de produto, para trazer o nome e o departamento da categoria.\n\nO cuidado principal num enriquecimento por join é garantir que a chave de busca é única do lado da tabela de referência: se não for, o join multiplica linhas em vez de só adicionar colunas (mais sobre esse risco na próxima aula, que fala de joins e agregações)."
                    },
                    {
                        "type": "quote",
                        "value": "Padronizar deixa o dado comparável. Enriquecer deixa o dado útil."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela recebe datas de três origens diferentes, cada uma num formato distinto (`10/03/2026`, `2026-03-10`, `10-Mar-2026`). Qual prática evita ambiguidade entre dia e mês ao padronizar essa coluna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Converter todas as datas para o formato americano, no padrão MM/DD/AAAA.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter todas as datas para o formato ISO 8601, no padrão AAAA-MM-DD.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o formato original de cada origem, documentando a diferença à parte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter todas as datas para texto livre, registrando o mês sempre por extenso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna `valor` recebe pedidos de dois sistemas de origem: um envia o valor em centavos como inteiro (`15090`) e outro envia em reais como decimal (`150.90`), sem nenhuma coluna indicando a unidade. Qual é o maior risco de somar essa coluna sem padronizar antes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A soma falha com erro de tipo, porque inteiro e decimal não podem ser somados numa consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse arredonda automaticamente um dos formatos para igualar as duas escalas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de uma coluna de unidade impede qualquer consulta de agregação na tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O total combina escalas diferentes e fica sem significado, mesmo sem nulos ou tipo errado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A coluna `forma_pagamento` chega com `cartao`, `Cartão de Crédito` e `CC` representando o mesmo método. Um `GROUP BY forma_pagamento` direto na tabela crua mostra três linhas separadas para o cartão. Qual solução resolve a causa do problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mapear cada variação para um valor canônico antes de agrupar, com CASE WHEN ou uma tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o GROUP BY por um DISTINCT, que já unifica valores textualmente parecidos entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar uma cláusula HAVING sobre a contagem de linhas para juntar os três valores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordenar o resultado por `forma_pagamento` antes de agrupar, o que aproxima valores parecidos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao enriquecer uma tabela de pedidos com uma tabela de referência de CEPs (`ref_cep`) para trazer cidade e estado, o time percebe que o número de linhas do resultado ficou maior que o número de pedidos originais. O que mais provavelmente causou esse aumento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O join usou LEFT JOIN em vez de INNER JOIN, o que por natureza duplica linhas na saída.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela de pedidos tinha CEPs nulos, e o banco gera uma linha extra para cada nulo encontrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela `ref_cep` tem mais de uma linha para o mesmo CEP, e o join multiplicou os pedidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O otimizador de consultas processou o join em paralelo, duplicando linhas por engano no plano.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual exemplo melhor ilustra um enriquecimento de dados, e não apenas uma padronização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Converter todos os nomes de cliente para maiúsculas, uniformizando a coluna inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Juntar um pedido com uma tabela de câmbio, para adicionar o valor convertido em reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uniformizar a coluna `estado` para usar sempre a sigla de duas letras em vez do nome.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter uma coluna de valor de centavos para reais, dividindo cada número por 100.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Deduplicação e resolução de entidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Deduplicação e resolução de entidade\n\nDuplicata é um dos problemas mais comuns, e mais enganosos, de um pipeline de ingestão: um retry de API que reenvia o mesmo evento, uma extração incremental mal configurada que repete uma janela de tempo, ou simplesmente duas linhas que representam a mesma pessoa cadastradas de formas ligeiramente diferentes. Esta aula cobre como identificar duplicatas, qual registro manter, e uma introdução ao problema mais difícil da família: reconhecer que dois registros diferentes são, na verdade, a mesma entidade."
                    },
                    {
                        "type": "text",
                        "value": "## O que conta como duplicado\n\nNem toda duplicata é igual. Vale separar pelo menos dois casos:\n\n- **Duplicata exata**: a mesma linha, com os mesmos valores em todas as colunas, aparece mais de uma vez. Costuma vir de um reprocessamento ou de um retry que reenviou o mesmo lote.\n- **Duplicata por chave de negócio**: o mesmo `pedido_id` aparece em duas linhas com valores diferentes, porque o pedido foi atualizado na origem e extraído de novo. Aqui não basta remover a repetição, é preciso decidir qual das duas versões é a válida.\n\nO segundo caso é o mais comum em ingestão incremental, e é ele que motiva a próxima seção."
                    },
                    {
                        "type": "text",
                        "value": "## Chave de deduplicação\n\nA chave de deduplicação é o conjunto de colunas que define o que significa \"o mesmo registro\". Às vezes é a chave primária da origem (`pedido_id`), às vezes é composta (`pedido_id` mais `item_id`, numa tabela de itens de pedido), e às vezes é um identificador natural quando não existe um ID técnico confiável (`cpf` mais `data_nascimento`, por exemplo). Escolher a chave errada é uma fonte clássica de bug: uma chave estreita demais apaga registros que na verdade são diferentes, uma chave ampla demais deixa duplicatas passarem."
                    },
                    {
                        "type": "code",
                        "value": "-- Mantem so a versao mais recente de cada pedido, pela chave de dedup\nWITH ranqueado AS (\n    SELECT\n        *,\n        ROW_NUMBER() OVER (\n            PARTITION BY pedido_id\n            ORDER BY updated_at DESC\n        ) AS rn\n    FROM stg_pedidos_bruto\n)\nSELECT *\nFROM ranqueado\nWHERE rn = 1;"
                    },
                    {
                        "type": "text",
                        "value": "## Manter o registro mais recente\n\nQuando a duplicata vem de reextração de um registro atualizado, a regra mais comum é ficar com a versão mais recente, usando uma coluna de timestamp confiável (`updated_at` na origem, ou `extracted_at` do próprio pipeline, se a origem não tiver um timestamp de atualização). Repare que \"mais recente\" não é o mesmo que \"última linha lida\": se a extração não é ordenada, a ordem de chegada dos dados não garante nada sobre qual versão é a mais nova, por isso o `ORDER BY` do `ROW_NUMBER` precisa apontar para uma coluna de tempo real, não para a ordem física da tabela."
                    },
                    {
                        "type": "text",
                        "value": "## Fuzzy matching e resolução de entidade\n\nÀs vezes duas linhas não são duplicatas no sentido estrito (os valores não são idênticos), mas representam a mesma entidade do mundo real: `João da Silva` e `Joao Silva`, ou dois cadastros do mesmo cliente com e-mails diferentes. Resolver isso exige comparação aproximada (fuzzy matching), calculando o quão parecidos dois registros são a partir de vários campos, como nome, telefone e endereço, em vez de exigir igualdade exata. Esse problema, chamado de resolução de entidade ou record linkage, é grande o suficiente para ter técnicas e ferramentas próprias; para esta trilha, o importante é reconhecer o cenário e saber que uma chave exata não resolve."
                    },
                    {
                        "type": "quote",
                        "value": "Uma chave de deduplicação errada não é um detalhe técnico: é a diferença entre limpar duplicata e apagar dado válido."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um pedido com `pedido_id = 4521` aparece duas vezes na tabela de staging: a primeira linha tem `status = pendente`, a segunda tem `status = pago`, ambas vindas de extrações diferentes. Que tipo de duplicata é essa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Duplicata exata, porque o `pedido_id` é idêntico nas duas linhas da tabela de staging.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é duplicata, porque duas linhas com o mesmo `pedido_id` são esperadas na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de extração, porque a origem nunca deveria reenviar o mesmo `pedido_id` de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duplicata por chave de negócio, já que os valores das duas linhas são diferentes entre si.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de itens de pedido usa só `pedido_id` como chave de deduplicação, mas cada pedido pode ter vários itens diferentes. Depois da deduplicação, o pipeline passou a manter apenas um item por pedido, descartando os demais. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A cláusula ORDER BY do ROW_NUMBER está apontando para a coluna errada dentro da partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave de deduplicação está estreita demais, tratando itens diferentes como duplicatas.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela de itens deveria ter sido carregada em full load, em vez de modo incremental.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline deveria usar DISTINCT no lugar de ROW_NUMBER para remover as duplicatas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma origem não fornece nenhuma coluna de data de atualização, e o pipeline está deduplicando com `ROW_NUMBER() OVER (PARTITION BY chave ORDER BY linha_lida DESC)`, assumindo que a última linha lida é a mais recente. Por que essa suposição é arriscada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O ROW_NUMBER só funciona corretamente ordenado de forma crescente, nunca de forma decrescente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A função PARTITION BY exige uma chave numérica, e a maioria das chaves de negócio é texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem de leitura não garante nada sobre qual versão foi atualizada por último na origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sem uma coluna de atualização, o banco de dados rejeita a execução da função ROW_NUMBER.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cadastro de clientes tem duas linhas, `João da Silva, joao@email.com` e `Joao Silva, joaosilva@email.com`, sem nenhum identificador técnico em comum entre elas. Uma deduplicação baseada em igualdade exata de nome e e-mail não junta as duas linhas. O que esse cenário exige?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Comparação aproximada entre vários campos, técnica de resolução de entidade, não chave exata.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma chave de deduplicação composta por nome e e-mail, aplicada com ROW_NUMBER de costume.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma extração incremental mais frequente, que evitaria essas duas linhas surgirem na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cast de tipo nos campos nome e e-mail, já que provavelmente estão com o tipo errado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de ingestão sofreu uma falha de rede no meio da carga e foi reexecutado do zero, sem nenhum controle de idempotência. Como resultado, uma parte dos pedidos foi inserida duas vezes na tabela de staging, com linhas absolutamente idênticas em todas as colunas. Qual abordagem de deduplicação resolve esse caso específico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aplicar ROW_NUMBER ordenado por `updated_at`, para escolher a versão mais recente entre as duas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar fuzzy matching entre as linhas, para medir o quanto elas se parecem entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recriar a chave de deduplicação, já que a chave atual claramente não é mais confiável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover linhas exatamente iguais, já que não há diferença de valores a decidir entre elas.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Joins, agregações e janelas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Joins, agregações e janelas\n\nGrande parte da transformação de dados não trata de limpar uma coluna por vez, trata de combinar tabelas: juntar pedidos com clientes, agregar vendas por dia, calcular o status mais recente de cada conta. Esta aula cobre três ferramentas que aparecem juntas o tempo todo numa camada de transformação, join, agregação com `GROUP BY` e funções de janela, além de um risco clássico que gruda nas três: o fan-out."
                    },
                    {
                        "type": "text",
                        "value": "## Juntar tabelas na transformação\n\nUma tabela de fatos (pedidos, eventos, transações) raramente carrega tudo que uma análise precisa: o nome do cliente, a categoria do produto e a região da loja normalmente vivem em tabelas de dimensão separadas. A transformação é onde essas tabelas se encontram, geralmente com um `LEFT JOIN` partindo da tabela de fatos, para não perder uma linha de pedido só porque o cliente correspondente ainda não chegou na tabela de dimensão.\n\n## Agregar com GROUP BY\n\nAgregar é resumir várias linhas em uma, numa granularidade (o **grain**) diferente da original, de uma linha por pedido para uma linha por cliente por mês, por exemplo. Antes de qualquer `SUM` ou `COUNT`, vale confirmar qual é o grain de saída esperado, porque agregar no nível errado produz um número que parece certo e está errado."
                    },
                    {
                        "type": "code",
                        "value": "SELECT\n    c.cliente_id,\n    c.nome,\n    COUNT(p.pedido_id) AS qtd_pedidos,\n    SUM(p.valor)       AS total_gasto\nFROM fato_pedidos p\nLEFT JOIN dim_clientes c\n    ON p.cliente_id = c.cliente_id\nWHERE p.data_pedido >= '2026-01-01'\nGROUP BY c.cliente_id, c.nome;"
                    },
                    {
                        "type": "text",
                        "value": "## Funções de janela: o mais recente por grupo\n\nUma função de janela calcula um valor olhando para um grupo de linhas relacionadas, sem colapsar essas linhas numa só como o `GROUP BY` faz. É a ferramenta usada para responder perguntas como \"qual o status mais recente de cada pedido\" ou \"qual a posição desta venda no ranking do mês\", mantendo uma linha por registro. Você já viu esse padrão na aula de deduplicação: `ROW_NUMBER() OVER (PARTITION BY chave ORDER BY data DESC)` também é uma função de janela, só que aplicada para escolher a versão mais recente de um registro em vez de calcular uma métrica."
                    },
                    {
                        "type": "code",
                        "value": "SELECT\n    pedido_id,\n    cliente_id,\n    status,\n    atualizado_em,\n    ROW_NUMBER() OVER (\n        PARTITION BY cliente_id\n        ORDER BY atualizado_em DESC\n    ) AS posicao_mais_recente,\n    SUM(valor) OVER (\n        PARTITION BY cliente_id\n        ORDER BY atualizado_em\n    ) AS total_acumulado\nFROM fato_pedidos;"
                    },
                    {
                        "type": "text",
                        "value": "## O risco do fan-out no join\n\nFan-out acontece quando o lado direito de um join tem mais de uma linha para a mesma chave, e cada linha da esquerda passa a se multiplicar por todas as correspondências da direita. Isso não gera erro nem quebra a consulta, o que o torna especialmente perigoso: o `SELECT` roda normal, só que qualquer `SUM` ou `COUNT` feito depois do join vem inflado, porque o mesmo pedido foi contado várias vezes. O sinal de alerta mais simples é comparar a contagem de linhas antes e depois do join: se cresceu e a expectativa era manter uma linha por pedido, alguma tabela do lado direito não é única pela chave usada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Linhas em fato_pedidos\",\"Linhas após o join\",\"O que aconteceu\"],[\"dim_clientes com uma linha por cliente_id\",\"1.000\",\"1.000\",\"Join correto, cardinalidade um para um\"],[\"dim_clientes com duas linhas para um cliente_id repetido\",\"1.000\",\"1.003\",\"Fan-out: os pedidos desse cliente foram contados em dobro\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao juntar uma tabela de fatos `fato_pedidos` com uma tabela de dimensão `dim_clientes`, a equipe quer garantir que nenhum pedido seja perdido da saída, mesmo que o cliente correspondente ainda não exista na dimensão. Qual tipo de join atende a esse requisito, partindo da tabela de pedidos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um LEFT JOIN partindo de `fato_pedidos`, que preserva toda linha de pedido na saída.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um INNER JOIN partindo de `fato_pedidos`, que preserva toda linha independente da dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um RIGHT JOIN partindo de `fato_pedidos`, que prioriza as linhas da tabela de dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um CROSS JOIN entre as duas tabelas, que combina todas as linhas possíveis entre si.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório precisa mostrar o total gasto por cliente em cada mês, mas a consulta de transformação agrupa só por `cliente_id`, sem incluir o mês na cláusula GROUP BY. O que acontece com o resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A consulta falha, porque todo GROUP BY precisa incluir uma coluna de data obrigatoriamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco agrupa automaticamente por mês, inferindo isso a partir da própria coluna de valor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O total soma todos os meses juntos, entregando um grain mais grosso do que o necessário.",
                                "isCorrect": true
                            },
                            {
                                "text": "O resultado fica correto, porque o mês não influencia o cálculo de um SUM de valores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta precisa listar cada pedido individualmente, mas também mostrar, ao lado de cada linha, a posição desse pedido no ranking de valor dentro do mês do cliente. Por que um `GROUP BY` sozinho não resolve esse caso, sendo necessária uma função de janela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O GROUP BY não aceita a função RANK dentro da sua cláusula de agregação, só SUM e COUNT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Funções de janela são sempre mais rápidas que o GROUP BY em qualquer volume processado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O GROUP BY exige que a tabela já esteja ordenada previamente pela coluna de valor do pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O GROUP BY colapsa as linhas num resumo, e o requisito é manter uma linha por pedido.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de juntar `fato_pedidos` com `dim_produtos` e agregar com `SUM(valor)` por categoria, o total geral ficou 12% maior do que a soma direta da tabela `fato_pedidos` sozinha, sem nenhuma alteração nos dados de pedidos. Qual verificação confirma se a causa é fan-out no join?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Comparar a soma de valor por categoria com a média histórica de vendas da mesma categoria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparar a contagem de linhas de `fato_pedidos` antes e depois do join, isolando o GROUP BY.",
                                "isCorrect": true
                            },
                            {
                                "text": "Verificar se a cláusula WHERE da consulta está filtrando o período correto de pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Conferir se a coluna valor está com o tipo numérico correto depois do cast na origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para obter só a linha com o status mais recente de cada pedido a partir de um histórico de atualizações, um analista escreve `ROW_NUMBER() OVER (PARTITION BY pedido_id ORDER BY atualizado_em DESC)` e depois filtra `WHERE posicao = 1`. Qual é o papel do `PARTITION BY` nessa consulta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reiniciar a contagem do ROW_NUMBER para cada pedido, em vez de numerar a tabela inteira.",
                                "isCorrect": true
                            },
                            {
                                "text": "Filtrar a tabela para incluir só os pedidos que tiveram alguma atualização de status.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ordenar fisicamente as linhas da tabela pela coluna `atualizado_em` antes da consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o GROUP BY, agregando as linhas de cada pedido numa única linha de resumo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Transformar em SQL x em código",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Transformar em SQL x em código\n\nTudo que esta trilha cobriu até aqui (limpeza, padronização, deduplicação, joins e agregações) pode ser escrito de duas formas bem diferentes: como consulta SQL rodando dentro do data warehouse, ou como código, geralmente Python, rodando fora dele antes ou depois da carga. Nenhuma das duas está certa por padrão. Esta aula fecha o módulo com os critérios práticos para decidir entre uma e outra."
                    },
                    {
                        "type": "text",
                        "value": "## SQL no warehouse (ELT)\n\nNo padrão ELT, os dados brutos são carregados primeiro e a transformação roda depois, como consulta SQL dentro do próprio warehouse. As vantagens vêm de rodar onde o dado já está:\n\n- O motor do warehouse já é otimizado para join, agregação e varredura de grandes volumes, sem mover dado para fora dele.\n- SQL é a linguagem que a maior parte do time de dados (analistas, analytics engineers) já lê e mantém, o que reduz o número de pessoas capazes de dar manutenção numa transformação.\n- Encadear transformações como views ou tabelas sucessivas deixa o pipeline inteiro visível como uma sequência de consultas, mais fácil de auditar do que um script disperso."
                    },
                    {
                        "type": "text",
                        "value": "## Transformar em código\n\nAlgumas transformações são difíceis, ou impossíveis, de expressar em SQL puro: lógica condicional complexa com muitos casos específicos, chamadas a uma biblioteca externa (calcular uma similaridade de texto para fuzzy matching, por exemplo), ou um fluxo com muitos passos intermediários que ficaria ilegível como uma única consulta encadeada. Nesses casos, Python é a escolha mais comum, geralmente com pandas para manipular tabelas em memória. Quando o volume não cabe mais numa única máquina, a mesma lógica em código costuma migrar para um motor de processamento distribuído como o Spark, um tema que essa trilha só cita aqui e aprofunda mais adiante."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\",\"SQL no warehouse\",\"Código (Python/pandas)\"],[\"Quem mantém\",\"Times de analytics e SQL avançado\",\"Times de engenharia com Python\"],[\"Melhor para\",\"Join, agregação e filtro em grande volume\",\"Lógica condicional complexa e bibliotecas externas\"],[\"Teste comum\",\"Comparar contagem e amostra entre consultas\",\"Teste unitário sobre função de transformação\"],[\"Limite típico\",\"Precisa do dado já dentro do warehouse\",\"Precisa caber na memória (ou distribuir o processamento)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Legibilidade, teste e performance\n\nTrês critérios ajudam a decidir na prática:\n\n- **Legibilidade**: quem vai dar manutenção nessa lógica daqui a seis meses? Se a resposta é o time de analytics, SQL tende a ser mais sustentável do que um script Python que só quem escreveu entende.\n- **Teste**: transformações em SQL costumam ser validadas comparando contagens, somas e amostras entre a tabela de entrada e a de saída. Transformações em código permitem teste unitário mais tradicional, isolando uma função com casos conhecidos de entrada e saída esperada.\n- **Performance**: para operações de conjunto (join, agregação, filtro) sobre grandes volumes, o otimizador do warehouse costuma vencer um loop escrito à mão. Para lógica linha a linha com muitos desvios condicionais, código bem escrito pode ser tão claro quanto rápido."
                    },
                    {
                        "type": "code",
                        "value": "-- A mesma limpeza (trim + upper + default) em SQL\nSELECT\n    pedido_id,\n    UPPER(TRIM(estado))                   AS estado,\n    COALESCE(cupom_desconto, 'SEM_CUPOM') AS cupom_desconto\nFROM stg_pedidos;\n\n# A mesma limpeza em Python, com pandas\ndf[\"estado\"] = df[\"estado\"].str.strip().str.upper()\ndf[\"cupom_desconto\"] = df[\"cupom_desconto\"].fillna(\"SEM_CUPOM\")"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta não é qual linguagem é melhor, é qual delas o problema, e o time, pedem nesse caso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal vantagem de transformar os dados com SQL diretamente no data warehouse, no padrão ELT?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A transformação passa a dispensar qualquer tipo de teste, já que o SQL não precisa validação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação deixa de depender de uma chave de negócio para juntar as tabelas envolvidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação elimina a necessidade de qualquer etapa de carga antes de começar o processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação roda onde o dado já está, aproveitando o otimizador do próprio warehouse.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma transformação precisa calcular a similaridade de texto entre nomes de clientes para apoiar uma resolução de entidade, usando uma biblioteca especializada de fuzzy matching. O restante do pipeline já roda como SQL no warehouse. Qual decisão é mais coerente com essa necessidade específica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fazer essa etapa em código, porque ela depende de uma biblioteca que o SQL não oferece.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reescrever a lógica de similaridade em SQL, já que qualquer cálculo pode virar uma consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover o pipeline inteiro para código, porque uma etapa em Python obriga as demais a seguir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar a similaridade de texto, comparando os nomes só por igualdade exata dentro do SQL.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de analytics engineering quer validar uma transformação em SQL comparando o resultado antes e depois de uma mudança na consulta, sem escrever testes unitários tradicionais. Qual prática de teste é mais compatível com esse contexto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Isolar cada cláusula do SQL numa função separada, testável de forma unitária e independente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparar contagens, somas e amostras entre a tabela de entrada e a de saída da transformação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar a consulta dentro de um framework de testes unitários criado originalmente para Python.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depender só da revisão de código no pull request, sem nenhuma validação automatizada de dado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista pretende calcular o total de vendas por categoria a partir de uma tabela com bilhões de linhas, extraindo tudo para um script Python e agregando com pandas em memória numa máquina local. O processo está lento e às vezes falha por falta de memória. Qual mudança resolve melhor esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar o pandas por outra biblioteca Python de tabelas, mantendo o volume inteiro em memória.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir a extração em lotes menores, mas continuar agregando o total inteiro dentro do pandas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer a agregação em SQL dentro do warehouse, e só trazer o resultado já resumido para o Python.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a memória da máquina local até o volume completo da tabela caber ali sem falhar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma transformação de limpeza simples (remover espaços, padronizar maiúsculas, preencher um valor default) precisa ser mantida por um time de analytics que conhece bem SQL e não trabalha com Python no dia a dia. Considerando só a legibilidade e a manutenção futura, qual decisão faz mais sentido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escrever em Python, já que o pandas é sempre mais indicado para limpeza do que o SQL puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever em Python, para manter o padrão de uma única linguagem ao longo do pipeline inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir a lógica entre SQL e Python, já que combinar as duas linguagens facilita a manutenção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever em SQL, já que é a linguagem que o time responsável pela manutenção domina bem.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Carga: estratégias, idempotência e incremental",
        "aulas": [
            {
                "titulo": "Estratégias de carga: full, append e upsert",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Estratégias de carga: full, append e upsert\n\nDepois que os dados são extraídos da origem e passam pela transformação (ou vão direto para a staging, no caso do ELT), a etapa de carga escreve o resultado no destino analítico. Existem três estratégias básicas para essa escrita, e a escolha entre elas depende de como os dados da origem se comportam: eles mudam depois de criados? São poucos ou muitos? Precisam manter histórico?\n\n- **Full load**: apaga o destino e recarrega tudo do zero.\n- **Append**: só insere linhas novas, sem tocar nas existentes.\n- **Upsert (merge)**: atualiza o que já existe e insere o que é novo, por uma chave.\n\nNas próximas aulas o foco vai para rodar essas cargas repetidamente sem quebrar nada (idempotência) e para cargas incrementais. Aqui o objetivo é entender quando cada estratégia faz sentido."
                    },
                    {
                        "type": "text",
                        "value": "## Full load (substituir tudo)\n\nNo full load (também chamado de truncate-and-load), a tabela de destino é limpa (truncate ou delete) e recarregada inteira a cada execução, com o snapshot mais recente da origem.\n\nVantagens: é simples de implementar e de raciocinar sobre. Não exige uma chave confiável para comparar registros, e qualquer alteração na origem (incluindo exclusões) aparece automaticamente no destino, porque tudo é reescrito.\n\nDesvantagens: o custo cresce junto com o volume. Recarregar uma tabela de bilhões de linhas todo dia é caro em tempo e em processamento, e a tabela costuma ficar indisponível (ou inconsistente) durante a troca. Por isso, full load funciona bem para tabelas pequenas ou de referência (tabelas de domínio, cadastros pequenos), e piora rápido conforme a tabela cresce."
                    },
                    {
                        "type": "text",
                        "value": "## Append (só acrescentar)\n\nNo append, cada execução apenas insere linhas novas no destino, sem tocar no que já está lá. Nenhuma comparação com o que já existe é feita: cada linha extraída vira uma linha inserida.\n\nEssa estratégia combina bem com dados imutáveis: eventos, logs, cliques, leituras de sensor, transações já fechadas. Depois de gravado, um evento desses nunca muda: não há o que atualizar, só o que adicionar.\n\nO risco do append aparece quando a origem não é realmente imutável, ou quando a mesma carga roda mais de uma vez sobre a mesma janela de dados (por exemplo, um retry depois de uma falha). Sem nenhum controle, cada execução repetida gera linhas duplicadas. Isso é explorado a fundo na próxima aula, sobre idempotência."
                    },
                    {
                        "type": "text",
                        "value": "## Upsert / MERGE (inserir ou atualizar)\n\nO upsert (contração de update + insert) verifica, para cada registro extraído, se já existe uma linha correspondente no destino, usando uma chave (`cliente_id`, `pedido_id`, e assim por diante). Se existir, atualiza; se não existir, insere. Em SQL, isso costuma ser feito com o comando `MERGE` (ou padrões equivalentes, como `INSERT ... ON CONFLICT` e `INSERT ... ON DUPLICATE KEY UPDATE`, dependendo do banco).\n\nEssa estratégia é a mais adequada para dados mutáveis com uma chave de negócio confiável: cadastros de cliente, pedidos que mudam de status, produtos de catálogo. O upsert evita duplicatas e mantém o destino sempre com a versão mais recente de cada registro, sem precisar recarregar a tabela inteira.\n\nO custo do upsert é a necessidade de comparar cada linha extraída contra o destino pela chave, o que exige índice na coluna de chave e, em volumes grandes, mais processamento do que um append simples."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"Melhor para\",\"Custo por execução\",\"Risco principal\"],[\"Full load\",\"Tabelas pequenas ou de referência\",\"Alto (reescreve tudo)\",\"Indisponibilidade durante a troca\"],[\"Append\",\"Dados imutáveis (eventos, logs)\",\"Baixo (só insere)\",\"Duplicatas em reprocessamento\"],[\"Upsert\",\"Dados mutáveis com chave confiável\",\"Médio (compara por chave)\",\"Exige chave e índice adequados\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Upsert de clientes: atualiza quem já existe, insere quem é novo\nMERGE INTO dim_cliente AS destino\nUSING stg_cliente AS origem\nON destino.cliente_id = origem.cliente_id\nWHEN MATCHED THEN\n  UPDATE SET\n    nome = origem.nome,\n    email = origem.email,\n    atualizado_em = origem.atualizado_em\nWHEN NOT MATCHED THEN\n  INSERT (cliente_id, nome, email, atualizado_em)\n  VALUES (origem.cliente_id, origem.nome, origem.email, origem.atualizado_em);"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta que define a estratégia de carga não é qual delas é mais moderna, e sim se os dados de origem podem mudar depois de criados. Dados imutáveis pedem append. Dados mutáveis com chave pedem upsert. Tabelas pequenas sem chave confiável toleram full load."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual estratégia de carga apaga o conteúdo da tabela de destino e a recarrega por completo a cada execução?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Full load: a tabela de destino é apagada e recarregada por completo a cada execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Append: os novos registros são inseridos no destino sem alterar os que já existem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Upsert: cada registro é atualizado ou inserido no destino conforme uma chave única.",
                                "isCorrect": false
                            },
                            {
                                "text": "Incremental: somente os registros alterados desde a última execução são processados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de cliques (clickstream) recebe cerca de 50 milhões de linhas por dia, e um evento registrado nunca é alterado depois de gravado. A equipe quer a carga mais simples e barata possível para esse volume. Qual estratégia atende melhor esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Full load, porque recarregar a tabela inteira garante que nenhum evento fique desatualizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Append, porque os eventos são imutáveis e cada execução só precisa somar linhas novas ao destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Upsert, porque comparar cada evento pela chave evita qualquer duplicata na tabela de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Delete-insert por partição, porque reconstruir a partição do dia elimina o risco de inconsistência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O cadastro de clientes de um sistema permite edição de nome, e-mail e endereço a qualquer momento, e cada cliente tem um `cliente_id` estável. O data warehouse precisa sempre refletir o estado atual de cada cliente, sem duplicar registros. Qual estratégia de carga atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Append por cliente_id, inserindo uma nova linha a cada carga para preservar o histórico de cada edição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Full load da tabela de clientes, ignorando o cliente_id porque toda a tabela é reescrita do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "Upsert por cliente_id: atualiza o registro existente ou insere um novo se a chave não for encontrada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Extração incremental por data de criação do cliente, desconsiderando as edições feitas após o cadastro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de domínio com apenas 200 linhas (categorias de produto) vem de uma planilha exportada manualmente todo mês, sem nenhum identificador estável entre as exportações: os nomes das categorias podem ser reescritos e a ordem das linhas muda a cada arquivo. Qual estratégia de carga é mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Upsert, porque a chave de negócio pode ser recriada a partir da posição da linha na planilha exportada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Append, porque cada exportação mensal deve ser tratada como um novo lote de categorias imutáveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Delta incremental, porque a planilha traz nativamente um campo de data de última atualização confiável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Full load, porque sem uma chave estável não há como comparar linhas com segurança, e o volume é pequeno.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de fatos de vendas recebe 200 milhões de linhas por dia vindas de um sistema de ponto de venda. Cada venda, uma vez registrada, jamais é alterada, mas o pipeline às vezes reprocessa o mesmo arquivo por engano após falhas de rede. A equipe quer decidir entre append puro e upsert pela chave da venda. Qual é a melhor decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Upsert pela chave da venda, porque o append puro duplicaria linhas nos reprocessamentos acidentais do arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Append puro, porque vendas são imutáveis e o upsert só se aplica a registros que podem ser alterados depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Full load da tabela de fatos inteira, porque assim qualquer reprocessamento acidental é automaticamente corrigido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Upsert pela data da venda, porque agrupar por dia evita comparar as 200 milhões de linhas individualmente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Idempotência: rodar de novo sem duplicar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Idempotência: rodar de novo sem duplicar\n\nPipelines falham. Uma conexão cai no meio da carga, um job estoura o tempo limite, alguém reexecuta manualmente depois de um erro. Isso é normal e vai acontecer. A pergunta que importa é: o que acontece quando a mesma carga roda duas vezes sobre os mesmos dados?\n\nUma carga é **idempotente** quando executá-la mais de uma vez, com a mesma entrada, produz o mesmo resultado no destino que executá-la uma única vez. Não gera linhas duplicadas, não corrompe totais, não muda o resultado final só porque rodou de novo.\n\nIdempotência não é um detalhe de implementação, é um requisito de confiabilidade. Sem ela, todo retry vira um risco."
                    },
                    {
                        "type": "quote",
                        "value": "Uma carga idempotente pode ser executada uma vez ou cem vezes sobre a mesma entrada: o destino termina exatamente igual. Se o resultado muda a cada repetição, a carga não é confiável, só parece funcionar enquanto nada falha."
                    },
                    {
                        "type": "text",
                        "value": "## Por que idempotência importa\n\nEm produção, uma carga quase nunca roda exatamente uma vez do jeito planejado:\n\n- **Retries automáticos**: orquestradores como Airflow reexecutam uma tarefa que falhou, muitas vezes sem saber exatamente onde ela parou.\n- **Reprocessamento manual**: alguém percebe um erro nos dados e decide rodar a carga de novo para um dia específico.\n- **Falhas parciais**: a carga insere metade das linhas e cai. Rodar de novo do zero é a solução mais simples, se for segura.\n- **Backfill**: recarregar um período passado inteiro (tema da última aula deste módulo) depende de poder repetir a carga sem medo.\n\nSem idempotência, cada um desses eventos comuns vira uma fonte de dado duplicado ou inconsistente, e a equipe passa a ter medo de rodar o próprio pipeline de novo, o que é o oposto do que se espera de um sistema confiável."
                    },
                    {
                        "type": "text",
                        "value": "## Como conseguir idempotência\n\nTrês técnicas cobrem a maioria dos casos:\n\n**1. Upsert por chave**: como visto na aula anterior, o `MERGE` por chave de negócio é naturalmente idempotente. Rodar o mesmo `MERGE` duas vezes com a mesma origem produz o mesmo destino, porque a segunda execução só vai encontrar correspondências e atualizar os mesmos valores, sem inserir nada novo.\n\n**2. Delete-insert por partição**: antes de inserir os dados de um período (um dia, uma hora), apaga-se primeiro tudo o que já existe no destino para aquele mesmo período, depois insere-se o novo lote inteiro. Rodar duas vezes para o mesmo dia dá o mesmo resultado, porque a segunda execução apaga o que a primeira tinha inserido antes de reinserir.\n\n**3. Deduplicação na carga**: quando não há upsert nem particionamento simples, a carga pode remover duplicatas logo antes de escrever, comparando a chave (e, se preciso, um timestamp de atualização) para manter só a versão mais recente de cada registro.\n\nO ponto em comum: nenhuma das três técnicas depende de a carga nunca falhar. Todas assumem que ela vai falhar e rodar de novo, e são desenhadas para isso não ser um problema."
                    },
                    {
                        "type": "code",
                        "value": "-- Delete-insert idempotente por partição (recarrega só o dia informado)\nDELETE FROM fato_pedido\nWHERE data_pedido = :data_execucao;\n\nINSERT INTO fato_pedido (pedido_id, cliente_id, valor, data_pedido)\nSELECT pedido_id, cliente_id, valor, data_pedido\nFROM stg_pedido\nWHERE data_pedido = :data_execucao;\n\n-- Rodar este par DELETE + INSERT duas vezes para a mesma data_execucao\n-- produz o mesmo resultado: não há acúmulo de linhas duplicadas."
                    },
                    {
                        "type": "code",
                        "value": "-- Deduplicação antes da carga: mantém só a versão mais recente por chave\nWITH ranqueado AS (\n  SELECT\n    pedido_id,\n    valor,\n    atualizado_em,\n    ROW_NUMBER() OVER (\n      PARTITION BY pedido_id\n      ORDER BY atualizado_em DESC\n    ) AS posicao\n  FROM stg_pedido\n)\nSELECT pedido_id, valor, atualizado_em\nFROM ranqueado\nWHERE posicao = 1;"
                    },
                    {
                        "type": "text",
                        "value": "## O perigo do append cego\n\nAppend (aula anterior) é a estratégia mais simples, mas também a menos protegida contra repetição. Um append cego insere cada linha extraída sem checar se ela já foi carregada antes. Se a mesma extração rodar duas vezes, seja por um retry automático, seja por uma reexecução manual, o destino recebe as mesmas linhas duas vezes.\n\nO problema raramente aparece na hora: o pipeline aparenta ter funcionado, os dados chegaram. Ele aparece semanas depois, quando alguém soma uma coluna de valor e o total não bate, ou quando um relatório mostra o dobro de pedidos em um dia específico. Nesse ponto, já pode ser difícil saber quais linhas são duplicatas legítimas (reenviadas de fato pela origem) e quais são efeito do reprocessamento.\n\nPor isso, append só é seguro quando combinado com alguma garantia de não reprocessar a mesma janela de dados duas vezes (um controle de watermark, por exemplo, tema da próxima aula) ou com deduplicação no destino."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que uma carga de dados é idempotente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A carga processa qualquer volume de dados em poucos segundos, independente do tamanho da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar a carga mais de uma vez com a mesma entrada resulta no mesmo destino que rodar uma única vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "A carga usa sempre a estratégia de append, sem nunca atualizar nenhum registro existente no destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A carga nunca apresenta falhas, porque foi testada de forma exaustiva antes de ir para produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma carga noturna insere os pedidos do dia em uma tabela usando append simples. Na madrugada, uma falha de rede interrompe o job depois que 70% das linhas já foram inseridas, e o orquestrador reexecuta a tarefa automaticamente. O que provavelmente acontece com a tabela de pedidos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum problema ocorre, porque o append só insere pedidos que ainda não existem na tabela de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela fica vazia, porque o retry apaga automaticamente as linhas inseridas pela execução anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "As linhas inseridas antes da falha ficam duplicadas, pois o retry insere de novo os mesmos pedidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os pedidos duplicados são detectados e ignorados pelo banco de dados durante a inserção das linhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O pipeline do cenário anterior precisa se tornar seguro para reexecuções, e a tabela de pedidos tem uma coluna `data_pedido` que particiona naturalmente os dados por dia. Qual ajuste torna a carga idempotente sem exigir uma chave de upsert por pedido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o tempo limite do job, para reduzir a chance de o orquestrador precisar reexecutar a tarefa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o append por um full load da tabela inteira, recarregando todos os dias históricos a cada execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o orquestrador e executar a carga manualmente, evitando qualquer retry automático do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar as linhas da partição do dia antes de inserir o lote novamente (delete-insert por partição).",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe implementou upsert por `pedido_id` para tornar a carga de pedidos idempotente. Um teste mostra que, ao rodar a mesma carga duas vezes, a tabela de destino não cresce, mas os pedidos que tinham duas linhas com o mesmo `pedido_id` na origem (um erro de exportação) continuam aparecendo duplicados no destino. O que explica esse resultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O upsert evita duplicatas entre execuções, mas não remove duplicatas repetidas dentro da mesma extração de origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "O upsert só funciona corretamente quando a tabela de destino está totalmente vazia antes da primeira execução da carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando MERGE ignora de forma automática qualquer linha cuja chave apareça mais de uma vez na origem extraída.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave pedido_id perdeu a unicidade no destino, porque toda operação de upsert remove restrições de unicidade da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista percebe que o total de vendas de terça-feira ficou exatamente o dobro do esperado, depois que o time de dados reexecutou manualmente a carga daquele dia para corrigir um erro de tipo de dado em uma coluna. A carga usa append simples, sem particionamento nem deduplicação. Qual foi a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O erro de tipo de dado corrompeu os valores numéricos das vendas, dobrando os totais sem inserir nenhuma linha nova.",
                                "isCorrect": false
                            },
                            {
                                "text": "O reprocessamento duplicou as linhas de terça-feira, e trocar o append por upsert pela chave evitaria o problema.",
                                "isCorrect": true
                            },
                            {
                                "text": "O orquestrador executou a carga de terça-feira e de quarta-feira ao mesmo tempo, somando os valores dos dois dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela de origem tinha um total de vendas duplicado desde antes da extração, e o pipeline apenas refletiu isso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cargas incrementais e delta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cargas incrementais e delta\n\nFull load recarrega tudo, e append só soma o que chega, sem filtro. A carga incremental fica no meio: em vez de processar a origem inteira a cada execução, ela processa só o que mudou desde a última vez, o chamado **delta**.\n\nO ganho é direto: uma tabela de origem com 500 milhões de linhas pode gerar um delta diário de apenas 200 mil linhas alteradas. Processar 200 mil linhas em vez de 500 milhões muda o tempo de execução de horas para minutos, e reduz a carga sobre o banco de origem.\n\nCarga incremental não é uma estratégia isolada: ela decide o que carregar (só o delta), e depois ainda precisa de uma estratégia de escrita (append ou upsert, vistas na primeira aula) para decidir como escrever esse delta no destino."
                    },
                    {
                        "type": "text",
                        "value": "## De onde vem o delta\n\nO delta começa na extração, não na carga. Como visto na trilha de extração, a técnica mais comum é o **watermark** (ou high-water mark): guardar o maior valor de uma coluna de controle (`atualizado_em`, `id`, um número de sequência) processado na última execução, e na próxima extração buscar só os registros com valor maior que esse.\n\nA carga incremental recebe esse delta já filtrado, vindo da extração, e sua responsabilidade é aplicá-lo corretamente no destino. Se o watermark da extração falhar (por exemplo, avançar antes da carga confirmar sucesso), o delta que chega para a carga pode estar incompleto ou repetido, então as duas etapas precisam estar sincronizadas."
                    },
                    {
                        "type": "code",
                        "value": "origem (tabela transacional)\n    | extração filtra por watermark: atualizado_em > ultimo_valor_processado\n    v\nstaging (delta: só linhas novas ou alteradas desde a última execução)\n    | carga aplica o delta no destino (upsert por chave)\n    v\ndestino (tabela final, sempre com o estado mais recente de cada registro)\n    |\n    v\nnovo watermark = maior atualizado_em do delta processado com sucesso"
                    },
                    {
                        "type": "text",
                        "value": "## Aplicando o delta no destino\n\nComo o delta traz registros novos e registros alterados misturados, o upsert (aula 1) é a forma natural de aplicá-lo: cada linha do delta atualiza o registro correspondente no destino, se já existir, ou insere um novo, se não existir. O resultado é o mesmo `MERGE` visto antes, só que rodando sobre um volume muito menor de linhas (o delta), em vez da tabela inteira.\n\nIsso também torna a carga incremental naturalmente compatível com idempotência: como o upsert por chave já é idempotente, reprocessar o mesmo delta duas vezes (por um retry, por exemplo) não duplica nada, desde que o watermark só avance depois da carga confirmar sucesso."
                    },
                    {
                        "type": "code",
                        "value": "-- Carga incremental: aplica só o delta (linhas com atualizado_em após o último watermark)\nMERGE INTO fato_pedido AS destino\nUSING (\n  SELECT pedido_id, cliente_id, valor, status, atualizado_em\n  FROM stg_pedido_delta\n  WHERE atualizado_em > :ultimo_watermark\n) AS delta\nON destino.pedido_id = delta.pedido_id\nWHEN MATCHED THEN\n  UPDATE SET\n    valor = delta.valor,\n    status = delta.status,\n    atualizado_em = delta.atualizado_em\nWHEN NOT MATCHED THEN\n  INSERT (pedido_id, cliente_id, valor, status, atualizado_em)\n  VALUES (delta.pedido_id, delta.cliente_id, delta.valor, delta.status, delta.atualizado_em);"
                    },
                    {
                        "type": "text",
                        "value": "## O problema dos deletes no incremental\n\nUm watermark baseado em `atualizado_em` captura linhas novas e linhas alteradas, mas não captura linhas excluídas na origem. Se um pedido é cancelado e removido da tabela de origem (delete físico, sem um campo de status), ele simplesmente para de aparecer nas próximas extrações, mas continua existindo no destino para sempre, porque nenhum delta jamais vai indicar que aquele registro deve ser apagado.\n\nExistem algumas formas de lidar com isso:\n\n- **Soft delete na origem**: em vez de excluir a linha, marcar um campo `excluido_em` ou `ativo = false`. A alteração vira uma linha no delta como qualquer update, e a carga pode refletir a exclusão no destino.\n- **Comparação periódica**: de tempos em tempos, comparar o conjunto completo de chaves da origem com o destino (uma reconciliação), e remover no destino o que não existe mais na origem.\n- **Change Data Capture (CDC)**: como visto na trilha de extração, o CDC lê o log de transações da origem e captura deletes físicos como eventos explícitos, o que resolve o problema na raiz.\n\nSem nenhuma dessas três, a carga incremental por watermark simplesmente não enxerga exclusões, e isso precisa ser uma decisão consciente da equipe, não um efeito colateral descoberto tarde."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de mudança na origem\",\"Aparece no delta por watermark?\",\"Como tratar no destino\"],[\"Inserção de linha nova\",\"Sim\",\"Upsert insere a linha nova\"],[\"Atualização de linha existente\",\"Sim\",\"Upsert atualiza a linha existente\"],[\"Exclusão física (delete)\",\"Não\",\"Precisa de soft delete, reconciliação periódica ou CDC\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma carga incremental, o que é o delta processado a cada execução?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O conjunto completo de registros da tabela de origem, extraído e recarregado a cada execução do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de registros que foram excluídos fisicamente da origem desde a última execução da carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de registros novos ou alterados na origem desde a última execução bem sucedida da carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de registros que apresentaram erro de validação durante a etapa de transformação dos dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de origem tem 800 milhões de linhas, e cerca de 300 mil linhas são inseridas ou atualizadas por dia. O time quer uma carga diária rápida, que reflita essas mudanças no destino sem duplicar registros. Qual combinação de técnicas atende esse objetivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extração completa da tabela todo dia, aplicada no destino por append para manter o histórico integral.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração incremental por watermark trazendo só o delta do dia, aplicado no destino por append simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração completa da tabela todo dia, aplicada no destino por upsert comparando as 800 milhões de linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extração incremental por watermark trazendo só o delta do dia, aplicado no destino por upsert.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline usa extração incremental por watermark na coluna `atualizado_em` e aplica o delta por upsert todos os dias. Depois de um mês, o time percebe que pedidos cancelados e excluídos fisicamente na origem continuam aparecendo no relatório do destino como se ainda estivessem ativos. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O watermark captura inserções e atualizações, mas exclusões físicas na origem nunca geram uma linha no delta.",
                                "isCorrect": true
                            },
                            {
                                "text": "O upsert aplicado no destino está configurado para ignorar qualquer atualização de status vinda do delta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna atualizado_em não existe na tabela de origem, então o watermark nunca avança corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O delta está sendo aplicado por append em vez de upsert, o que impede a atualização dos pedidos cancelados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um pipeline incremental, o watermark é atualizado para o maior `atualizado_em` do delta assim que a extração termina, antes de a carga confirmar que os dados foram gravados com sucesso no destino. Em uma execução, a extração termina normalmente, mas a carga falha ao aplicar o delta no destino. O que acontece na próxima execução?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O delta que falhou é reprocessado automaticamente, porque o watermark só avança depois que a carga confirma sucesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O delta que falhou fica perdido, pois o watermark já avançou e a extração seguinte só pega registros mais recentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "A próxima execução falha imediatamente, porque o watermark não pode avançar sem uma carga bem sucedida anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "O delta que falhou é aplicado em dobro na próxima execução, porque o watermark não registrou a falha da carga.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de origem permite que pedidos sejam excluídos fisicamente pelo time de suporte quando um cliente pede o cancelamento total do registro, e a equipe de dados não tem acesso ao log de transações do banco para implementar CDC. O destino precisa refletir essas exclusões em até 24 horas. Qual abordagem resolve o problema dentro dessas restrições?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar a frequência da extração incremental por watermark, para capturar as exclusões físicas mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar uma coluna atualizado_em na tabela de origem, para que as exclusões apareçam no próximo delta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparar periodicamente as chaves da origem com o destino e remover no destino o que já não existe na origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o upsert por append na carga, garantindo que os registros excluídos permaneçam disponíveis no destino.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Carregar dimensões que mudam (SCD na carga)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Carregar dimensões que mudam (SCD na carga)\n\nA trilha de Modelagem já cobriu o que são as Slowly Changing Dimensions (SCD): tipo 1 sobrescreve o valor antigo, tipo 2 preserva o histórico criando uma nova versão da linha. Esta aula foca no lado da carga: como o pipeline detecta que um atributo mudou e aplica o tipo de SCD correto no destino, execução após execução.\n\nIsso é, na prática, um caso especial de upsert (aula 1), com uma regra a mais: antes de decidir entre atualizar ou inserir, a carga precisa decidir o que fazer com a versão antiga, sobrescrever ou preservar."
                    },
                    {
                        "type": "text",
                        "value": "## Detectando a mudança\n\nAntes de aplicar SCD tipo 1 ou tipo 2, a carga precisa saber se um registro realmente mudou. Duas abordagens comuns:\n\n- **Comparação coluna a coluna**: comparar cada atributo relevante (`nome`, `endereco`, `categoria`) entre a linha da origem e a versão atual no destino. Funciona bem quando poucas colunas importam para o histórico.\n- **Hash de comparação**: calcular um hash (`MD5`, `SHA256`) sobre a concatenação dos atributos relevantes, tanto na origem quanto no destino, e comparar os hashes. Um hash diferente significa que algo mudou, sem precisar comparar coluna por coluna. Fica mais simples de manter quando a dimensão tem muitos atributos.\n\nEm ambos os casos, só vale a pena atualizar o destino quando algo de fato mudou: comparar e não encontrar diferença significa não tocar na linha."
                    },
                    {
                        "type": "text",
                        "value": "## SCD tipo 1 na carga: sobrescrever\n\nNa prática, aplicar SCD tipo 1 na carga é exatamente o upsert visto na aula 1: quando a chave de negócio já existe no destino e algum atributo mudou, o `UPDATE` sobrescreve o valor antigo pelo novo, sem deixar rastro da versão anterior. Quando a chave não existe, insere uma linha nova.\n\nÉ a opção mais simples e mais barata, e faz sentido quando o histórico do atributo não importa para a análise (por exemplo, corrigir um erro de digitação no nome de um produto não precisa virar uma nova versão)."
                    },
                    {
                        "type": "text",
                        "value": "## SCD tipo 2 na carga: fechar e abrir versão\n\nSCD tipo 2 exige que a carga, ao detectar mudança, faça duas coisas na mesma operação:\n\n1. **Fechar a versão atual**: marcar a linha vigente do destino como não mais atual, geralmente preenchendo uma coluna `data_fim` (ou `valido_ate`) com a data da carga, e `atual = false`.\n2. **Abrir uma versão nova**: inserir uma nova linha com os atributos atualizados, `data_inicio` igual à data da carga, `data_fim` em aberto (nulo ou uma data futura simbólica, como `9999-12-31`) e `atual = true`.\n\nA chave de negócio (`produto_id`, por exemplo) se repete em várias linhas do destino, uma por versão, e cada versão tem seu próprio identificador técnico (chave substituta, ou surrogate key) para ser referenciada pelas tabelas de fato."
                    },
                    {
                        "type": "code",
                        "value": "-- SCD tipo 2: fecha a versão atual e abre uma nova quando o atributo muda\nBEGIN;\n\n-- 1. Fecha a versão vigente dos produtos que mudaram\nUPDATE dim_produto\nSET data_fim = CURRENT_DATE, atual = false\nWHERE atual = true\n  AND produto_id IN (\n    SELECT s.produto_id\n    FROM stg_produto s\n    JOIN dim_produto d\n      ON d.produto_id = s.produto_id AND d.atual = true\n    WHERE s.categoria <> d.categoria OR s.nome <> d.nome\n  );\n\n-- 2. Abre uma nova versão para os produtos que mudaram (ou são novos)\nINSERT INTO dim_produto (produto_id, nome, categoria, data_inicio, data_fim, atual)\nSELECT s.produto_id, s.nome, s.categoria, CURRENT_DATE, NULL, true\nFROM stg_produto s\nLEFT JOIN dim_produto d\n  ON d.produto_id = s.produto_id AND d.atual = true\nWHERE d.produto_id IS NULL;\n\nCOMMIT;"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Momento da carga\",\"SCD tipo 1\",\"SCD tipo 2\"],[\"Registro novo (chave não existe)\",\"Insere a linha\",\"Insere a linha com atual = true\"],[\"Atributo mudou\",\"UPDATE sobrescreve o valor antigo\",\"Fecha a versão atual e insere uma nova versão\"],[\"Número de linhas por chave no destino\",\"Sempre uma\",\"Uma por versão histórica\"],[\"Consulta ao histórico de mudanças\",\"Não é possível: o valor antigo se perdeu\",\"Possível, filtrando por data ou por atual = true\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Late arriving dimensions\n\nUma dimensão de chegada tardia (late arriving) acontece quando um fato chega para carga antes de a dimensão correspondente existir no destino. Por exemplo, uma venda referencia um `cliente_id` que ainda não foi carregado na `dim_cliente`, porque o cadastro completo do cliente só chega no dia seguinte.\n\nDuas formas comuns de lidar com isso:\n\n- **Registro inferido (inferred member)**: a carga do fato, ao não encontrar a chave na dimensão, insere uma linha mínima na dimensão só com a chave de negócio e atributos em branco ou um valor marcador, como Desconhecido. Quando a dimensão real chega depois, essa linha inferida é atualizada (SCD tipo 1) em vez de criar uma segunda linha para o mesmo cliente.\n- **Adiar a carga do fato**: manter a linha do fato em uma área de espera até que a dimensão correspondente exista, e só então carregá-la. Mais simples de raciocinar, mas atrasa a disponibilidade do fato.\n\nO erro mais comum é a carga do fato simplesmente descartar (ou falhar) toda vez que a dimensão ainda não existe, o que faz vendas legítimas desaparecerem do relatório sem nenhum aviso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao aplicar SCD tipo 1 na carga de uma dimensão, o que acontece quando um atributo de um registro já existente muda?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma nova linha é inserida com o valor atualizado, e a linha antiga é mantida marcada como não mais atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "A carga rejeita a mudança e mantém o valor original, até que uma correção manual seja aplicada no destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registro inteiro é removido do destino e recriado do zero na próxima execução completa da carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor antigo do atributo é sobrescrito pelo novo, na mesma linha, sem manter histórico da versão anterior.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O time de marketing quer analisar, para cada pedido histórico, qual era a categoria do produto no momento exato da venda, mesmo que a categoria tenha sido reclassificada depois. A dimensão de produto muda de categoria algumas vezes por ano. Qual abordagem de carga atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SCD tipo 2, fechando a versão anterior e abrindo uma nova a cada mudança de categoria, preservando o histórico.",
                                "isCorrect": true
                            },
                            {
                                "text": "SCD tipo 1, sobrescrevendo a categoria a cada mudança, para que o relatório sempre mostre a categoria mais recente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Full load da dimensão de produto a cada execução, garantindo que a categoria esteja sempre atualizada no destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Append na dimensão de produto, inserindo uma linha de categoria a cada execução, sem fechar as versões antigas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dimensão de cliente tem 40 atributos (nome, endereço, telefone, preferências, entre outros), e qualquer um deles pode mudar entre execuções. Comparar os 40 atributos individualmente a cada carga deixou o processo lento e difícil de manter. Qual técnica simplifica a detecção de mudança nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir a dimensão para 5 atributos, eliminando do modelo aqueles que raramente são alterados pela origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular um hash sobre os atributos relevantes na origem e no destino, e comparar apenas os hashes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Comparar somente a chave de negócio entre origem e destino, ignorando qualquer atributo durante a detecção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar SCD tipo 1 em vez de SCD tipo 2, o que elimina a necessidade de detectar mudança de atributos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma venda é carregada na tabela de fatos referenciando um `cliente_id` que ainda não existe na `dim_cliente`, porque o cadastro completo do cliente será processado somente no dia seguinte. A equipe não quer descartar a venda nem atrasar a carga do fato. Qual técnica resolve esse cenário sem perder a venda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adiar a carga da venda para o dia seguinte, quando o cadastro completo do cliente estiver disponível no destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar a venda da carga atual e registrá-la em um log de erros para reprocessamento manual posterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Inserir uma linha inferida na dim_cliente só com a chave, e atualizar os atributos quando o cadastro chegar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir o cliente_id da venda por um valor nulo, e associá-lo ao cliente correto em uma correção futura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de implementar SCD tipo 2 na dim_produto, um analista nota que a tabela de fatos de vendas, carregada antes da mudança de modelagem, referencia produto_id diretamente (a chave de negócio) em vez de uma chave substituta. Qual é o problema causado por essa referência ao carregar novas vendas após uma mudança de categoria?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A carga de vendas falha imediatamente, porque produto_id deixou de existir na dim_produto após a mudança para SCD tipo 2.",
                                "isCorrect": false
                            },
                            {
                                "text": "As vendas antigas somem do relatório, porque a chave de negócio produto_id foi removida da tabela de fatos automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O upsert da tabela de fatos passa a duplicar cada venda, uma vez para cada versão histórica do produto associado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A venda passa a se associar a várias versões do produto, sem indicar qual estava vigente na data da venda.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Reprocessamento e backfill",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Reprocessamento e backfill\n\nReprocessamento é rodar de novo uma carga que já rodou antes, seja porque um bug foi corrigido, uma coluna nova precisa ser preenchida para o histórico inteiro, ou uma fonte externa corrigiu dados que já tinham sido carregados. Quando esse reprocessamento cobre um período de tempo inteiro no passado (uma semana, um mês, o histórico completo), o nome usual é **backfill**.\n\nBackfill não é uma técnica nova, é a aplicação de tudo que foi visto neste módulo (estratégias de carga, idempotência, incremental) sobre dados que já foram processados antes. A pergunta central é sempre a mesma: como recarregar um período sem duplicar o que já está no destino?"
                    },
                    {
                        "type": "quote",
                        "value": "Backfill só é seguro em uma carga que já é idempotente. Se rodar a carga de um dia inteiro dez vezes seguidas não muda o resultado, rodar o backfill de um ano inteiro também não vai mudar. Se a carga não é idempotente, cada dia reprocessado no backfill é um novo risco de duplicata."
                    },
                    {
                        "type": "text",
                        "value": "## Backfill de um período (recarregar dias passados)\n\nO caso mais comum de backfill é recarregar um intervalo de datas, por exemplo quando os dados de 1 a 15 de março vieram errados da origem e precisam ser recarregados. A forma mais segura de fazer isso é reaproveitar a mesma técnica de idempotência da carga normal, aplicada a cada partição do período:\n\n1. Identificar as partições (normalmente por dia) que precisam ser recarregadas.\n2. Para cada partição, apagar o que existe no destino para aquela data (delete-insert por partição, aula 2) ou rodar o upsert sobre os dados do período.\n3. Reinserir os dados corrigidos vindos da origem para aquela partição.\n\nRodar esse processo partição por partição, em vez de tentar recarregar o período inteiro em uma única operação gigante, facilita retomar de onde parou se o backfill falhar no meio, e reduz o impacto de cada execução individual."
                    },
                    {
                        "type": "code",
                        "value": "-- Backfill idempotente: recarrega cada dia do período, uma partição por vez\npara cada data in intervalo(inicio='2026-03-01', fim='2026-03-15'):\n    DELETE FROM fato_pedido WHERE data_pedido = data\n    extrair dados da origem para a data corrente\n    INSERT INTO fato_pedido SELECT * FROM extracao WHERE data_pedido = data\n    registrar a data como reprocessada com sucesso\n\n-- Cada iteração é independente e idempotente:\n-- reexecutar o backfill de uma data específica não duplica nada."
                    },
                    {
                        "type": "text",
                        "value": "## Backfill de uma coluna ou tabela nova\n\nOutro cenário comum: uma coluna nova foi adicionada ao modelo (por exemplo, `canal_venda`), e ela precisa ser preenchida também para os registros históricos, não só para os novos que chegarem a partir de hoje. Aqui o backfill não recarrega o período inteiro do zero, ele só precisa popular a coluna nova.\n\nSe a origem ainda tem o dado histórico disponível, a forma mais direta é um `UPDATE` no destino, cruzando pela chave de negócio, preenchendo só a coluna nova para as linhas já existentes, sem duplicar nem tocar nas demais colunas. Se a origem não guarda mais o histórico (por exemplo, um sistema que só mantém os últimos 90 dias), o backfill dessa coluna pode não ser possível para os períodos mais antigos, e a equipe precisa decidir entre deixar nulo, usar um valor padrão, ou aceitar que o histórico distante fica sem esse dado."
                    },
                    {
                        "type": "text",
                        "value": "## Particionamento: reprocessar só o que foi afetado\n\nUm backfill malfeito recarrega mais dados do que precisa, por exemplo, refazendo a tabela inteira quando só um mês específico teve problema. Isso desperdiça tempo e processamento, e aumenta o risco de introduzir um novo erro em dados que estavam corretos.\n\nUma tabela particionada (por data, na maioria dos casos de fato) permite isolar exatamente o que precisa ser reprocessado: se o problema afetou só março de 2026, o backfill toca só nas partições de março de 2026, e as demais partições nem são lidas. Isso exige que a partição usada na tabela de destino corresponda à granularidade em que os problemas normalmente acontecem (por dia costuma ser mais flexível do que por mês ou por ano)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário de reprocessamento\",\"O que é recarregado\",\"Técnica típica\"],[\"Dados de um período vieram errados da origem\",\"Só as partições do período afetado\",\"Delete-insert por partição, dia a dia\"],[\"Coluna nova precisa de histórico\",\"Só a coluna nova, nas linhas existentes\",\"UPDATE pela chave de negócio, sem recarregar tudo\"],[\"Bug de transformação corrigido\",\"Todo período processado pela versão com bug\",\"Backfill partição a partição, do início do bug até hoje\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é backfill, no contexto de uma carga de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reprocessar um período de tempo do passado, recarregando dados que já tinham sido processados antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Processar pela primeira vez os dados do dia atual, assim que eles ficam disponíveis na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Excluir permanentemente os dados de um período antigo que não são mais necessários para análise.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar os dados recém carregados antes de liberá-los para consumo das equipes de análise.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa recarregar os pedidos dos últimos 3 meses, porque a origem corrigiu um erro de arredondamento no campo de valor. A carga atual usa append simples, sem particionamento nem controle de chave. O que deve acontecer antes de rodar esse backfill com segurança?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O backfill deve ser feito diretamente com append, já que os dados corrigidos substituem automaticamente os antigos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A carga precisa se tornar idempotente primeiro, por exemplo com delete-insert por partição ou upsert por chave.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela de destino deve ser convertida para um formato colunar como Parquet antes do backfill começar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O período de 3 meses deve ser reduzido para 1 mês, porque o append só suporta backfills de curta duração.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna canal_venda foi adicionada ao modelo, e o sistema de origem ainda guarda esse dado para pedidos dos últimos 2 anos. A tabela de fatos de pedidos já tem 2 anos de histórico carregado, sem essa coluna preenchida. Qual abordagem preenche o histórico sem recarregar a tabela inteira?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um DELETE de toda a tabela de fatos, seguido de uma nova carga completa dos 2 anos de histórico disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma nova tabela de fatos, com a coluna canal_venda incluída, carregada do zero para os próximos pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um UPDATE no destino pela chave de negócio, preenchendo somente a coluna canal_venda nas linhas já existentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um append da coluna canal_venda como uma tabela separada, unida à tabela de fatos original por join.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de fatos é particionada por mês. Uma auditoria descobre que só o dia 17 de um mês específico teve um erro de transformação, os demais 29 dias do mês estão corretos. Qual é a implicação de a partição ser mensal, e não diária, para o backfill desse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O backfill fica impossível de executar, porque partições mensais não podem ser reprocessadas parcialmente em nenhum caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O backfill reprocessa automaticamente só o dia 17, porque o mecanismo de particionamento identifica a diferença internamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O backfill precisa ser feito manualmente linha por linha, já que partições mensais não aceitam operações em lote.",
                                "isCorrect": false
                            },
                            {
                                "text": "O backfill reprocessa a partição do mês inteiro, pois a granularidade não permite isolar só o dia 17.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de fatos usa upsert por pedido_id em toda carga, incremental ou backfill. Durante um backfill dos últimos 6 meses, o processo é interrompido na metade por uma queda de conexão, e a equipe simplesmente reexecuta o backfill do período inteiro, do início, sem nenhum ajuste. O que acontece com o destino?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O destino fica correto, porque o upsert por chave torna cada execução do backfill idempotente, mesmo reiniciando do zero.",
                                "isCorrect": true
                            },
                            {
                                "text": "O destino fica com pedidos duplicados para os 3 meses que já tinham sido reprocessados antes da queda de conexão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O destino perde os pedidos dos 3 meses que já tinham sido reprocessados, porque o upsert os sobrescreve com valores vazios.",
                                "isCorrect": false
                            },
                            {
                                "text": "A segunda execução falha imediatamente, porque o upsert não permite processar novamente pedidos já existentes no destino.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Confiabilidade da ingestão e boas práticas",
        "aulas": [
            {
                "titulo": "Tratamento de erros: retries, dead-letter e quarentena",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tratamento de erros: retries, dead-letter e quarentena\n\nNenhuma ingestão roda para sempre sem falhar. Uma API vai devolver um 503 no meio da madrugada, um arquivo vai chegar corrompido, uma linha vai vir com um tipo de dado errado. A diferença entre um pipeline confiável e um frágil não está em nunca falhar, está em como ele reage quando falha.\n\nO primeiro passo é separar dois tipos de erro que pedem respostas bem diferentes: os transitórios e os permanentes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Transitório\",\"Permanente\"],[\"Timeout de rede, erro 503, limite de requisições da API\",\"Schema incompatível, JSON malformado, credencial inválida\"],[\"Tende a se resolver sozinho em segundos ou minutos\",\"Não se resolve sozinho sem alguma intervenção\"],[\"Resposta adequada: retry com espera entre tentativas\",\"Resposta adequada: isolar o registro e seguir em frente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Retry com backoff exponencial\n\nRepetir a chamada imediatamente após uma falha costuma piorar o problema: se a origem já está sobrecarregada, uma nova tentativa no mesmo instante só aumenta a pressão. Por isso o padrão é o backoff exponencial: esperar um intervalo que cresce a cada nova tentativa (1s, 2s, 4s, 8s...), até um teto e até um número máximo de tentativas.\n\nQuando muitas instâncias do mesmo pipeline retentam ao mesmo tempo, ainda existe o risco de uma nova onda sincronizada de chamadas. A correção é somar um **jitter**, uma pequena variação aleatória ao tempo de espera, para que as tentativas se espalhem em vez de coincidir."
                    },
                    {
                        "type": "code",
                        "value": "tentativa = 0\nespera_base = 1  # segundos\nmax_tentativas = 5\n\nenquanto tentativa < max_tentativas:\n    tentativa += 1\n    resposta = chamar_api_origem()\n\n    se resposta.status == 200:\n        processar(resposta.dados)\n        parar\n\n    se resposta.status em (429, 503, 504):\n        # erro transitório: espera crescente com jitter\n        espera = espera_base * (2 ** tentativa) + aleatorio(0, 1)\n        dormir(espera)\n        continuar\n\n    # erro permanente (400, 401, schema inválido): repetir não resolve\n    enviar_para_dead_letter(resposta, motivo=\"erro não recuperável\")\n    parar\n\nse tentativa == max_tentativas:\n    enviar_para_dead_letter(resposta, motivo=\"tentativas esgotadas\")\n    alertar_time_de_dados()"
                    },
                    {
                        "type": "text",
                        "value": "## Dead-letter queue: isolar sem travar o lote\n\nUma dead-letter queue (DLQ) é um destino separado (uma fila, uma tabela, um bucket) para onde vão as mensagens que falharam mesmo depois de esgotadas as tentativas de retry. Além do payload original, a mensagem carrega metadados do erro: motivo da falha, horário e número de tentativas realizadas.\n\nO ganho principal é isolar a falha: se 3 mensagens em 100 mil têm um payload malformado, só essas 3 saem do fluxo normal e vão para a dead-letter, enquanto as outras 99.997 seguem processadas sem interrupção."
                    },
                    {
                        "type": "text",
                        "value": "## Quarentena de registros ruins\n\nEm ingestões orientadas a lote (arquivos, tabelas inteiras), a mesma ideia aparece como **quarentena**: em vez de uma fila de mensagens, as linhas rejeitadas vão para uma área ou tabela separada (por exemplo, `stg_pedidos_quarentena`), com o motivo da rejeição registrado ao lado. As linhas válidas seguem o caminho normal.\n\nO princípio é o mesmo nos dois casos: rejeitar no nível do registro, não no nível do lote inteiro. Uma linha ruim não deveria ter poder de travar um milhão de linhas boas."
                    },
                    {
                        "type": "quote",
                        "value": "Um pipeline confiável não é o que nunca falha, é o que isola a falha e continua entregando o resto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Durante uma carga noturna, a chamada a uma API parceira começa a retornar erro 503 por causa de uma instabilidade temporária no servidor de origem. Depois de 40 segundos, a API volta a responder normalmente. Qual é a melhor forma de tratar esse tipo de erro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cancelar a carga do dia inteiro e aguardar a próxima janela agendada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pular esses registros sem repetir a chamada nem registrar o motivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Repetir a chamada em intervalos crescentes, até um limite de tentativas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar para uma fonte de dados alternativa configurada como backup.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa carga incremental de pedidos, uma linha chega com o campo data_pedido preenchido como o texto 'ontem' em vez de uma data válida. As outras 50 mil linhas do lote estão corretas. Qual é a melhor forma de tratar esse registro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Isolar a linha em quarentena com o motivo do erro e seguir carregando as demais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Repetir a chamada de origem com backoff exponencial até a linha ficar válida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Interromper a carga inteira até alguém corrigir o valor manualmente na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o valor para a data atual automaticamente e carregar sem avisar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Centenas de instâncias do mesmo pipeline usam a mesma política de retry com backoff exponencial. Quando a API de origem volta do ar, todas tentam de novo quase no mesmo segundo, e a origem cai de novo. Qual ajuste evita essa nova onda sincronizada de tentativas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número máximo de tentativas permitidas para cada instância.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o tempo base de espera entre uma tentativa e a seguinte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o limite de tentativas para garantir que tudo seja entregue.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um jitter, uma variação aleatória, ao tempo entre tentativas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor de fila processa eventos de clique e falha ao decodificar 0,2% das mensagens por payload malformado. Depois de esgotadas as tentativas de retry, essas mensagens vão para uma dead-letter queue. Além do payload original, o que essa mensagem deveria carregar para o time investigar depois?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Somente um contador global de quantas mensagens falharam naquele dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Metadados do erro, como motivo da falha, horário e número de tentativas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cópia da mensagem processada com sucesso mais próxima no tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O payload compactado, sem nenhuma informação adicional sobre o erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de esgotar as tentativas de retry para um registro problemático, qual é a próxima ação esperada de um pipeline confiável, além de isolar esse registro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reiniciar o pipeline inteiro do zero para garantir que nada foi perdido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar automaticamente o número máximo de tentativas para esse registro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registrar o erro e alertar o time responsável, sem travar o resto da carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "Descartar o registro sem nenhum tipo de rastro, para não acumular ruído.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Validação e testes de dados na ingestão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Validação e testes de dados na ingestão\n\nUm dado errado que entra no pipeline não fica contido na origem, ele se espalha: vira uma métrica errada num dashboard, um join que perde linhas, uma decisão de negócio tomada em cima de um número furado. Validar na entrada é a forma mais barata de conter o problema, porque o custo de corrigir cresce a cada etapa que o dado errado atravessa.\n\nValidar significa checar um conjunto de expectativas antes de aceitar o dado como válido."
                    },
                    {
                        "type": "text",
                        "value": "## O que validar na entrada\n\n- **Schema**: as colunas esperadas estão presentes e com o tipo certo (um `preco` que chega como texto em vez de número, por exemplo).\n- **Ranges**: o valor cai dentro de um intervalo plausível (idade negativa, preço menor que zero, data num futuro distante).\n- **Unicidade**: a chave primária ou de negócio não se repete quando deveria ser única.\n- **Não-nulos**: campos obrigatórios vieram preenchidos (um `cpf_cliente` vazio num cadastro).\n\nCada uma dessas checagens pega um tipo diferente de problema, e nenhuma substitui as outras."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Validação\",\"Pergunta que responde\",\"Exemplo de falha\"],[\"Schema\",\"As colunas e os tipos batem com o esperado?\",\"Coluna preco chega como texto em vez de número\"],[\"Range\",\"O valor está num intervalo plausível?\",\"Idade igual a -5 ou preço negativo\"],[\"Unicidade\",\"A chave se repete quando não deveria?\",\"Mesmo id_pedido aparece duas vezes no lote\"],[\"Não-nulo\",\"Um campo obrigatório veio vazio?\",\"cpf_cliente chega nulo em um cadastro\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Testes de dados como parte do pipeline\n\nAssim como um teste automatizado verifica se o código se comporta como esperado, um teste de dados verifica se o dado se comporta como esperado antes de seguir para a próxima etapa. Ferramentas como o Great Expectations formalizam essa ideia: você declara expectativas sobre uma tabela ou coluna, elas rodam a cada carga, e o resultado vira um relatório de quais passaram e quais falharam.\n\nA ideia central independe da ferramenta escolhida: transformar suposições implícitas (\"esse campo nunca vem nulo\") em checagens explícitas que rodam automaticamente, carga após carga."
                    },
                    {
                        "type": "code",
                        "value": "# exemplos de expectativas sobre a tabela stg_pedidos\nexpect_column_to_exist(\"id_pedido\")\nexpect_column_values_to_not_be_null(\"id_pedido\")\nexpect_column_values_to_be_unique(\"id_pedido\")\nexpect_column_values_to_be_of_type(\"valor_total\", \"numeric\")\nexpect_column_values_to_be_between(\"valor_total\", min=0, max=1000000)\nexpect_column_values_to_be_in_set(\"status\", [\"pendente\", \"pago\", \"cancelado\"])\n\n# resultado ao rodar:\n# 6 expectativas avaliadas, 5 ok, 1 falhou (312 linhas com valor_total nulo)"
                    },
                    {
                        "type": "text",
                        "value": "## Falhar cedo x deixar passar\n\nQuando uma validação falha, o pipeline tem três caminhos possíveis:\n\n- **Falhar cedo (fail fast)**: rejeitar a carga inteira ao primeiro erro. Mais seguro, mas uma única linha ruim pode travar milhões de linhas boas.\n- **Deixar passar sem checar**: carregar tudo sem validar. Mais rápido, mas empurra o problema para quem consome o dado depois.\n- **Quarentena com limite de tolerância**: separar as linhas que falham e só falhar o lote inteiro se a proporção de erros passar de um limite (por exemplo, mais de 5% das linhas inválidas).\n\nNa prática, a maioria dos pipelines maduros usa a terceira opção: tolera um pouco de sujeira pontual, mas desconfia quando o volume de erros foge do padrão."
                    },
                    {
                        "type": "quote",
                        "value": "Validar na entrada não é burocracia, é a diferença entre descobrir o problema em segundos ou descobrir semanas depois, num relatório que já chegou à diretoria."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela de clientes exige que o campo email esteja sempre preenchido. Numa carga, 40 linhas chegam com esse campo vazio. Qual tipo de validação detecta esse problema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Validação de unicidade sobre a chave primária da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validação de não-nulo sobre o campo obrigatório.",
                                "isCorrect": true
                            },
                            {
                                "text": "Validação de schema sobre as colunas esperadas da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validação de range sobre o valor permitido do campo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa carga de produtos, a coluna preco chega corretamente como número, mas 12 linhas trazem o valor -50. O restante dos preços é válido. Qual validação deveria ter pego esse problema antes de ele entrar na tabela final?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Validação de schema, checando o tipo de dado da coluna preco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validação de unicidade, checando duplicidade do id do produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validação de não-nulo, checando se o campo preco veio vazio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validação de range, checando um intervalo plausível para o preço.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Numa ferramenta de testes de dados como o Great Expectations, o que representa uma expectativa declarada sobre uma coluna?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma regra explícita que o dado deve cumprir, verificada a cada carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um relatório manual que o time preenche depois de cada incidente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma estimativa de quanto tempo a carga deve levar para terminar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um limite de armazenamento que a tabela não pode ultrapassar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma carga diária processa 2 milhões de linhas vindas de um parceiro. Historicamente, menos de 0,1% das linhas falha na validação por inconsistências pontuais na origem. Num certo dia, 18% das linhas falham na validação de schema. Qual é a resposta mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Colocar as linhas inválidas em quarentena e seguir carregando o restante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar a validação de schema nesse dia e carregar tudo sem checagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Interromper a carga inteira e investigar a causa antes de liberar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir automaticamente o limite de tolerância da validação para 20%.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline configurado para falhar cedo (fail fast) rejeita a carga inteira assim que encontra a primeira linha inválida. Qual é a principal desvantagem dessa abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela deixa passar dados inválidos para as tabelas finais sem nenhum aviso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela impede que qualquer teste de dados seja executado durante a carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela aumenta o tempo de execução da carga em várias horas, sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma linha ruim pode bloquear milhões de linhas válidas do mesmo lote.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Monitorar uma carga",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Monitorar uma carga\n\nUm pipeline pode terminar sem erro e mesmo assim falhar silenciosamente: o job roda até o fim, mas carregou zero linhas porque a origem mudou um endpoint; ou carregou os dados de ontem de novo porque o watermark não avançou; ou trouxe só metade do volume normal porque a paginação parou cedo. Nenhum desses casos lança uma exceção. Sem monitoramento, o primeiro sinal do problema costuma ser alguém do negócio perguntando por que o dashboard está estranho.\n\nMonitorar uma carga é acompanhar quatro sinais principais: freshness, volume, contagens de controle e alertas sobre desvios do padrão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\",\"O que mede\",\"Exemplo de alerta\"],[\"Freshness\",\"Há quanto tempo os dados foram atualizados pela última vez\",\"Tabela sem atualizar há 26h, o SLA é 24h\"],[\"Volume\",\"Quantas linhas foram carregadas nesta execução\",\"Carga trouxe 200 linhas, a média histórica é 50 mil\"],[\"Contagem de controle\",\"Se origem e destino concordam sobre quantos registros existem\",\"Origem com 1.000.040 linhas, destino com 998.500\"],[\"Alerta\",\"Se algum desses sinais fugiu do padrão esperado\",\"Volume caiu mais de 30% frente à média móvel\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Freshness: os dados estão atualizados?\n\nFreshness mede o tempo decorrido desde a última carga bem-sucedida. Toda tabela importante deveria ter um SLA implícito ou explícito: \"esse pedido precisa estar disponível até 15 minutos depois de criado\", \"essa tabela atualiza uma vez por dia, até as 6h\". Quando o tempo desde a última atualização passa desse limite, é hora de alertar, mesmo que a última execução não tenha lançado erro nenhum.\n\nUm pipeline pode estar tecnicamente no ar e, mesmo assim, estar entregando dados de dois dias atrás, porque uma etapa anterior da cadeia travou silenciosamente."
                    },
                    {
                        "type": "text",
                        "value": "## Volume: a contagem bate com o esperado?\n\nVolume mede quantas linhas (ou bytes, ou eventos) uma carga trouxe, comparado com uma referência: a média histórica, o volume do mesmo dia da semana anterior, ou uma faixa esperada. Uma queda abrupta para zero costuma ser fácil de perceber, mas uma queda de 40% pode passar despercebida se ninguém estiver olhando, e ainda assim significa que quase metade dos pedidos do dia não chegou ao destino.\n\nO oposto também é um sinal: um pico bem acima do normal pode indicar um reprocessamento duplicado ou uma extração que perdeu o filtro incremental e trouxe a tabela inteira de novo."
                    },
                    {
                        "type": "text",
                        "value": "## Contagens de controle: conciliar origem e destino\n\nContagens de controle (ou control totals) comparam um número calculado na origem com o mesmo número calculado no destino depois da carga: quantidade de linhas, soma de uma coluna numérica, ou um hash do conjunto de dados. Se os dois números não batem, alguma linha se perdeu, duplicou ou foi transformada de um jeito inesperado no caminho.\n\nEssa conciliação pode rodar ao final de cada carga, comparando um `SELECT COUNT(*)` (ou uma soma de controle) na origem contra o mesmo cálculo na tabela de destino."
                    },
                    {
                        "type": "code",
                        "value": "-- contagem na origem (executada no banco de origem)\nSELECT COUNT(*) AS total_origem, SUM(valor_total) AS soma_origem\nFROM pedidos\nWHERE data_pedido = CURRENT_DATE - 1;\n\n-- contagem no destino (executada no data warehouse, após a carga)\nSELECT COUNT(*) AS total_destino, SUM(valor_total) AS soma_destino\nFROM stg_pedidos\nWHERE data_pedido = CURRENT_DATE - 1;\n\n-- a conciliação compara os dois resultados:\n-- total_origem = total_destino e soma_origem = soma_destino\n-- qualquer diferença dispara um alerta para investigação"
                    },
                    {
                        "type": "text",
                        "value": "## Alertas: agir quando foge do padrão\n\nTer os sinais não adianta se ninguém reage a eles. Um bom alerta compara o valor atual contra um padrão (uma média móvel, um SLA, uma faixa histórica) e dispara só quando o desvio é relevante, não a cada pequena oscilação. Alertar para toda variação de 1% cria fadiga de alerta: depois de algumas semanas, o time passa a ignorar as notificações, inclusive as que importam.\n\nUma boa prática é começar com poucos alertas, ligados a impacto real (freshness estourando o SLA, volume fora de uma faixa de tolerância, contagem de controle divergente), e só adicionar mais sinais conforme aparecem novos tipos de falha silenciosa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela tem um SLA de atualização diária até as 6h da manhã. Às 10h, a última carga bem-sucedida já tem 30 horas. Qual sinal de monitoramento deveria ter capturado esse atraso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Freshness, o tempo desde a última atualização bem-sucedida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Volume, a quantidade de linhas carregadas na última execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contagem de controle, a conciliação entre origem e destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema, a estrutura de colunas esperada na tabela de destino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A carga diária de eventos de checkout costuma trazer entre 80 mil e 95 mil linhas. Na última execução, o job terminou sem erro e carregou 41 mil linhas. Esse é um exemplo típico de qual tipo de problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Erro permanente de schema, que deveria ter ido para quarentena.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro transitório de rede, que deveria ter sido resolvido com retry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha silenciosa: o job não lançou erro, mas o volume fugiu do padrão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Violação de unicidade na chave primária da tabela de destino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de uma carga, o time roda um COUNT(*) na tabela de origem e outro na tabela de destino e compara os dois valores. Qual problema essa prática ajuda a detectar, que uma validação de schema sozinha não pega?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Colunas que chegaram com um tipo de dado diferente do esperado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Linhas que se perderam ou duplicaram silenciosamente durante a carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "Valores que caem fora do intervalo plausível definido para o campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Campos obrigatórios que chegaram vazios em parte das linhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time configura alertas para disparar sempre que o volume de qualquer carga variar mais de 1% em relação ao dia anterior. Depois de três semanas, boa parte dos alertas passa a ser ignorada pelo time. Qual é a causa mais provável desse comportamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um erro permanente na origem, que deveria estar em quarentena.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um SLA de freshness desalinhado com a frequência real da carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma parada silenciosa da contagem de controle entre origem e destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um limiar de alerta sensível demais, que dispara a cada pequena oscilação.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma carga incremental que normalmente traz 10 mil linhas por dia chega num dia com 3 milhões de linhas, próximo do tamanho da tabela inteira de pedidos. O job terminou sem erro. Qual é a hipótese mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O filtro incremental (watermark) falhou e a extração trouxe a tabela inteira.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela de origem recebeu 3 milhões de pedidos novos legítimos no dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "A contagem de controle da origem está desatualizada há vários dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "O schema da tabela de destino mudou e duplicou automaticamente as linhas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ferramentas de ingestão: caseira x gerenciada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ferramentas de ingestão: caseira x gerenciada\n\nToda fonte nova de dados traz a mesma pergunta: vale a pena escrever e manter o código de extração, ou faz mais sentido pagar por um conector já pronto? Essa é a decisão de build x buy aplicada à ingestão, e ela aparece toda vez que um time de dados precisa conectar uma nova origem ao seu warehouse."
                    },
                    {
                        "type": "text",
                        "value": "## Construir do zero (caseira)\n\nConstruir a ingestão internamente significa escrever o código que autentica na fonte, pagina os resultados de uma API, controla o watermark da extração incremental, trata erros e retries, e lida com qualquer peculiaridade daquela fonte específica.\n\nA vantagem é controle total: o time decide exatamente como e quando os dados são extraídos, e pode adaptar a lógica a qualquer requisito incomum. O custo aparece depois do primeiro deploy: toda vez que a fonte muda um campo ou um endpoint, alguém do time de dados precisa perceber e consertar o pipeline."
                    },
                    {
                        "type": "text",
                        "value": "## Conectores gerenciados\n\nFerramentas como Fivetran e Airbyte oferecem conectores prontos para fontes comuns (bancos relacionais, Salesforce, Stripe, planilhas, entre dezenas de outras). O time só configura credenciais e o destino, e a ferramenta cuida da extração, da lógica incremental, de boa parte do tratamento de erro e da adaptação quando o schema da origem muda.\n\nA vantagem é velocidade: uma fonte nova pode ficar disponível em horas em vez de semanas. O custo costuma ser financeiro (cobrança por volume ou por linha sincronizada) e uma perda de controle fino: quando a fonte é incomum ou o conector pronto não cobre um requisito específico, a ferramenta gerenciada não ajuda."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Caseira\",\"Gerenciada\"],[\"Controle sobre a lógica de extração\",\"Total\",\"Limitado ao que o conector permite\"],[\"Velocidade para conectar uma fonte nova\",\"Semanas de desenvolvimento\",\"Horas de configuração\"],[\"Custo principal\",\"Tempo de engenharia contínuo\",\"Assinatura ou cobrança por volume\"],[\"Cobertura de fontes incomuns ou internas\",\"Qualquer fonte com API ou acesso\",\"Limitada aos conectores prontos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher cada abordagem\n\nFontes comuns e bem suportadas (um Postgres, um Salesforce, um Stripe) costumam compensar como conector gerenciado: o conector já existe, já foi testado por milhares de outros clientes, e o time de dados não precisa reinventar paginação de API que nenhuma ferramenta faz muito diferente. Times pequenos, sem capacidade de manter várias integrações, também tendem a sair ganhando aqui.\n\nFontes internas, proprietárias ou com uma regra de extração muito específica (um sistema legado da empresa, uma API interna sem documentação pública) normalmente exigem construção caseira, porque nenhum conector genérico vai cobrir aquele caso. Em volumes muito grandes, o custo por linha de uma ferramenta gerenciada também pode superar o custo de manter um pipeline próprio."
                    },
                    {
                        "type": "code",
                        "value": "fontes comuns (Postgres, Salesforce, Stripe)\n    -> conector gerenciado (Fivetran / Airbyte)\n    -> data warehouse\n\nsistema legado interno, API própria\n    -> pipeline caseiro (Python agendado)\n    -> data warehouse"
                    },
                    {
                        "type": "quote",
                        "value": "Build x buy não é uma escolha única e definitiva: a maioria dos times maduros usa conector gerenciado para o que é comum e pipeline próprio para o que é específico."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um time de dados com duas pessoas precisa trazer dados de um Postgres de produção e de uma conta do Stripe para o warehouse o mais rápido possível. Nenhuma das duas fontes tem particularidade fora do comum. Qual abordagem tende a ser mais adequada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Construir um pipeline caseiro para ter controle total desde já.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esperar o time crescer antes de conectar qualquer fonte nova.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o Postgres de produção para dentro do próprio warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar conectores gerenciados prontos para essas duas fontes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa precisa ingerir dados de um sistema legado interno, com uma API proprietária sem documentação pública e sem conector disponível em nenhuma ferramenta do mercado. Qual é a opção viável para essa fonte?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar um conector gerenciado genérico e ajustar o mapeamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Construir e manter um pipeline caseiro específico para essa fonte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Esperar algum fornecedor lançar um conector pronto para esse sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar esse sistema legado para o Salesforce antes de integrar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline caseiro extrai dados de uma API de parceiro há dois anos. O parceiro renomeia um campo do payload sem aviso prévio, e a carga passa a falhar. Esse cenário ilustra qual desvantagem típica da abordagem caseira frente a um conector gerenciado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O pipeline caseiro não consegue rodar cargas incrementais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pipelines caseiros não suportam retries nem tratamento de erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time de dados precisa monitorar e corrigir mudanças na fonte.",
                                "isCorrect": true
                            },
                            {
                                "text": "O volume extraído por dia fica limitado por cláusula de contrato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa sincroniza 40 bilhões de linhas por mês de um banco transacional para o warehouse. A cobrança da ferramenta gerenciada é por volume de linhas processadas, e o valor mensal já passou o custo de manter uma pessoa dedicada a um pipeline próprio. Qual é a leitura mais correta dessa situação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Em volume alto, o custo por linha da gerenciada pode superar o caseiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ferramentas gerenciadas sempre saem mais baratas, não importa o volume.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pipelines caseiros sempre saem mais baratos, não importa o volume.",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo de uma ferramenta gerenciada independe do volume sincronizado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve melhor como times de dados maduros costumam decidir entre construir a ingestão ou usar um conector gerenciado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Eles padronizam numa única abordagem para todas as fontes da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles combinam as duas abordagens, cada fonte segue o caminho mais adequado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Eles evitam ferramentas gerenciadas por princípio, mesmo em fontes comuns.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eles evitam pipelines caseiros por completo assim que a empresa cresce.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas e antipadrões de ETL e ingestão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas e antipadrões de ETL e ingestão\n\nEssa é a última aula da trilha, e o objetivo aqui é consolidar: quais práticas separam um pipeline que aguenta rodar em produção por anos de um pipeline que quebra toda vez que alguém olha torto para ele? A maior parte já apareceu ao longo dos módulos anteriores, isolada em cada tópico. Juntas, elas formam uma checklist do que revisar antes de considerar uma ingestão pronta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\",\"Por que importa\"],[\"Idempotência\",\"Rodar a carga de novo não duplica nem corrompe o que já foi carregado\"],[\"Staging\",\"Guarda o dado cru antes de transformar, facilita reprocessar do zero\"],[\"Incremental quando possível\",\"Carrega só o que mudou, reduz custo e tempo de execução\"],[\"Particionamento\",\"Organiza os dados por data ou chave, acelera leitura e reprocessamento\"],[\"Versionamento\",\"Mudanças de schema e de lógica ficam rastreáveis e reversíveis\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essas práticas se reforçam entre si\n\nIdempotência e staging andam juntos: se a área de staging guarda o dado bruto tal como ele chegou da origem, um reprocessamento pode reconstruir qualquer tabela final do zero, sem depender de um estado intermediário que ninguém mais lembra como foi gerado. Particionar essa área de staging por data de carga faz o reprocessamento de um único dia não exigir reler o histórico inteiro.\n\nVersionar o schema e a lógica de transformação (por exemplo, guardando o pipeline como código num repositório, com histórico de mudanças) é o que permite responder \"por que esse número mudou\" seis meses depois, quando alguém perguntar."
                    },
                    {
                        "type": "text",
                        "value": "## Antipadrões comuns\n\n- **O pipeline de um script só**: toda a lógica (extração, transformação, carga, tratamento de erro) misturada num único arquivo, sem etapas separadas nem testes. Funciona até a primeira mudança de requisito, depois disso vira um risco a cada deploy.\n- **Transformar durante a extração**: aplicar regras de negócio antes de guardar o dado cru descarta informação e torna o reprocessamento quase impossível quando a regra muda ou tinha um bug.\n- **Carga sem idempotência**: reprocessar um dia que falhou duplica linhas, porque nada impede que o mesmo registro entre duas vezes.\n- **Ausência de monitoramento**: o pipeline só é notado quando alguém do negócio reclama de um número errado, dias depois de o problema ter começado."
                    },
                    {
                        "type": "code",
                        "value": "# antipadrão: um script só, sem etapas\ndef rodar_pipeline():\n    dados = requests.get(api_parceiro).json()\n    dados_limpos = [transformar(d) for d in dados]  # já transforma na extração\n    for d in dados_limpos:\n        db.execute(\"INSERT INTO pedidos VALUES (...)\", d)  # sem staging, sem controle de duplicata\n\n\n# pipeline em etapas, com staging e idempotência\ndef extrair():\n    dados_brutos = requests.get(api_parceiro).json()\n    salvar_em_staging(dados_brutos, particao=data_de_hoje())\n\ndef transformar_e_carregar():\n    dados_brutos = ler_de_staging(particao=data_de_hoje())\n    dados_limpos = [transformar(d) for d in dados_brutos]\n    upsert_por_chave(\"pedidos\", dados_limpos)  # idempotente: reprocessar não duplica"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando a trilha\n\nAo longo dessa trilha, a ingestão deixou de ser \"só copiar dados de um lugar para o outro\" e virou uma disciplina de engenharia: escolher entre ETL e ELT, extrair de fontes diferentes com técnicas diferentes, lidar com formatos e schema, transformar com cuidado, carregar de forma idempotente e incremental e, por fim, tratar erro, validar, monitorar e escolher a ferramenta certa para cada fonte.\n\nNenhuma dessas práticas sozinha torna um pipeline confiável. É a combinação delas, aplicada com consistência, que faz a diferença entre um pipeline em que o time confia e um que todo mundo teme mexer."
                    },
                    {
                        "type": "quote",
                        "value": "Um pipeline de dados confiável não nasce pronto, ele acumula, aula após aula, decisão após decisão, as pequenas escolhas que evitam os grandes incêndios."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma carga que insere pedidos no destino é reprocessada duas vezes para o mesmo dia, por engano. Na segunda execução, nenhum pedido aparece duplicado na tabela final. Essa carga demonstra qual propriedade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Particionamento, os dados ficam organizados por data.",
                                "isCorrect": false
                            },
                            {
                                "text": "Incrementalidade, só o que mudou é carregado de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Idempotência, rodar a carga de novo não gera duplicatas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Versionamento, as mudanças de schema ficam rastreáveis.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline aplica uma regra de negócio direto sobre os dados vindos da API, durante a extração, sem guardar uma cópia crua em nenhum lugar. Duas semanas depois, descobrem que a regra tinha um bug. Qual é a consequência mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reprocessar corretamente os dados fica quase impossível depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "O pipeline passa a falhar de imediato na próxima execução agendada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O schema da tabela de destino muda sozinho para refletir o bug.",
                                "isCorrect": false
                            },
                            {
                                "text": "A carga incremental passa a rodar mais rápido do que antes do bug.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline inteiro (extração, transformação e carga) vive num único script, sem separação de etapas e sem nenhum teste. A cada pequena mudança de requisito, o risco de quebrar alguma parte do fluxo aumenta. Esse cenário é um exemplo clássico de qual antipadrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A ausência de particionamento nos dados guardados em staging.",
                                "isCorrect": false
                            },
                            {
                                "text": "A falta de contagens de controle entre origem e destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação feita em SQL em vez de em código Python.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline monolítico de um script só, difícil de manter e testar.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time vai construir do zero um pipeline para uma fonte nova, de alto volume, com atualizações diárias. Considerando as boas práticas da trilha, qual combinação reduz mais risco no longo prazo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Transformar o dado direto na extração e carregar numa única tabela final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o dado cru em staging particionado e aplicar cargas idempotentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever toda a lógica num único script para simplificar o deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer full load da tabela inteira a cada execução, sem usar staging.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ver tratamento de erro, validação, monitoramento, ferramentas e boas práticas de carga, qual afirmação resume melhor o que torna um pipeline de ingestão confiável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A combinação consistente de várias práticas, não uma técnica isolada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O uso exclusivo de uma ferramenta gerenciada em vez de código próprio.",
                                "isCorrect": false
                            },
                            {
                                "text": "A escolha de ELT no lugar de ETL como abordagem de transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A adoção de streaming no lugar de batch para toda fonte de dados.",
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
