// Seed da trilha Modern Data Stack (roadmap de Engenharia de Dados).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-modern-data-stack.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Modern Data Stack";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Trilha de modern data stack e analytics engineering do roadmap de Engenharia de Dados: transformar dados no warehouse com o dbt e entregar metricas confiaveis. O modern data stack e o ELT na nuvem, o dbt (modelos, ref e a linhagem, materializacoes view/table/incremental), testes e documentacao de dados, dbt avancado (Jinja, macros, packages, snapshots) e o modern data stack na pratica (semantic layer, CI/CD para dados). Assume base de SQL, modelagem, ETL e orquestracao, com foco em decisoes e cenarios.";

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
        "titulo": "Módulo 1 - O modern data stack e o analytics engineering",
        "aulas": [
            {
                "titulo": "O que é o modern data stack",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é o modern data stack\n\nDurante décadas, montar um pipeline analítico significava construir uma esteira pesada: extrair o dado da origem, transformá-lo numa ferramenta dedicada, só então carregar o resultado já pronto num banco analítico com capacidade fixa. Cada mudança de regra de negócio passava pela esteira inteira de novo.\n\nO modern data stack é a resposta a esse modelo depois que os warehouses passaram para a nuvem: carregar o dado bruto primeiro, o mais rápido possível, e transformar depois, com SQL, dentro do próprio warehouse. Não é uma ferramenta, é um jeito de organizar o trabalho em torno de um warehouse elástico e de ferramentas gerenciadas que se conectam a ele."
                    },
                    {
                        "type": "text",
                        "value": "## O stack antigo: transformar antes de carregar\n\nNo modelo tradicional, a transformação acontecia fora do destino, normalmente num servidor de ETL dedicado (ferramentas como Informatica, SSIS ou scripts próprios), antes de qualquer linha chegar ao banco analítico. Isso trazia algumas consequências:\n\n- O schema do destino precisava estar decidido de antemão, porque só o dado já modelado entrava nele.\n- Adicionar uma fonte nova ou uma métrica nova significava alterar o pipeline de transformação e esperar uma janela de deploy.\n- O banco analítico, muitas vezes on-premise (um cluster Teradata ou Hadoop), tinha capacidade fixa: escalar significava comprar mais hardware.\n- O servidor de ETL virava um gargalo único: toda regra de negócio da empresa passava por ali."
                    },
                    {
                        "type": "code",
                        "value": "STACK ANTIGO (transforma antes de carregar)\n\n[ fontes de dados ]\n        |\n        v\n[ servidor de ETL dedicado ]   (aplica a regra de negócio aqui)\n        |\n        v\n[ warehouse on-premise ]   (só recebe o dado já pronto)\n\n\nMODERN DATA STACK (carrega bruto, transforma depois)\n\n[ fontes de dados ]\n        |\n        v\n[ ingestão gerenciada ]   (só extrai e carrega, sem regra de negócio)\n        |\n        v\n[ warehouse na nuvem ]   (recebe o dado bruto)\n        |\n        v\n[ transformação em SQL, dentro do warehouse ]   (aqui mora a regra de negócio)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Stack antigo (ETL on-premise)\",\"Modern data stack (ELT na nuvem)\"],[\"Onde a transformação acontece\",\"Num servidor de ETL dedicado, antes da carga\",\"Dentro do warehouse, em SQL, depois da carga\"],[\"Escalar o processamento\",\"Comprar e configurar mais hardware próprio\",\"Ajustar a capacidade elástica do warehouse sob demanda\"],[\"Adicionar uma fonte nova\",\"Semanas de desenvolvimento de um pipeline dedicado\",\"Conectar um conector gerenciado de ingestão\"],[\"Armazenamento e computação\",\"Acoplados na mesma infraestrutura fixa\",\"Separados, cada um escalando de forma independente\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O modern data stack não é uma ferramenta única: é a combinação de um warehouse elástico na nuvem com ferramentas gerenciadas e plugáveis, cada uma responsável por uma etapa do caminho entre a origem e a decisão de negócio."
                    },
                    {
                        "type": "text",
                        "value": "## O gatilho: warehouses baratos e elásticos\n\nA virada só foi possível depois que os warehouses na nuvem (Snowflake, BigQuery, Redshift) separaram armazenamento de computação. Guardar dado passou a ser barato, e processar consultas pesadas passou a escalar sob demanda, sem que ninguém precisasse comprar ou dimensionar hardware com antecedência.\n\nCom isso, carregar tudo bruto primeiro e decidir depois o que transformar deixou de ser um desperdício e virou a opção mais segura: o dado fica disponível assim que chega, e qualquer regra de negócio pode ser aplicada, ou reaplicada, depois, em SQL, sem depender de uma nova extração na origem."
                    },
                    {
                        "type": "text",
                        "value": "## O que muda para quem trabalha com dado\n\nCom a transformação vivendo dentro do warehouse, em SQL, o trabalho de moldar o dado deixa de exigir um time inteiro dedicado a operar um servidor de ETL. Times menores passam a conseguir montar um stack completo conectando ferramentas gerenciadas, e o esforço de engenharia se desloca de mover dado de um lugar para o outro para modelar esse dado e garantir que ele seja confiável. Essa mudança é o que abre espaço para times organizarem o trabalho por camadas, cada uma com sua ferramenta, e para um papel novo cuidar da transformação, o que o restante deste módulo vai destrinchar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das alternativas descreve melhor a mudança que caracteriza o modern data stack em relação ao stack tradicional de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Carregar o dado bruto num warehouse na nuvem, barato e elástico, e transformar depois com SQL.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir bancos relacionais por bancos de grafos para acelerar consultas analíticas complexas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar a necessidade de um data warehouse, consultando as origens diretamente em tempo real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Concentrar toda a transformação num servidor de ETL dedicado antes de qualquer carga no destino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém um servidor dedicado de ETL que transforma cada fonte antes de carregar num data warehouse on-premise com capacidade fixa. Toda vez que um time pede uma métrica nova, é preciso alterar o pipeline de transformação antes que o dado chegue ao warehouse. Qual mudança caracterizaria a adoção do modern data stack nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o warehouse on-premise por outro também on-premise, mas com mais disco instalado localmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Carregar o dado bruto direto num warehouse na nuvem e mover a transformação para SQL dentro dele.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o servidor de ETL, mas reescrever as transformações numa linguagem de programação mais moderna.",
                                "isCorrect": false
                            },
                            {
                                "text": "Parar de carregar os dados num warehouse e consultar as fontes originais direto a cada relatório.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que tornou viável, na prática, carregar o dado bruto num warehouse e só transformar depois, em vez de transformar antes de carregar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A criação de uma nova linguagem de consulta que substituiu o SQL dentro dos warehouses modernos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A obrigatoriedade legal de guardar todo dado bruto por motivos de auditoria em qualquer empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "A queda no custo de armazenamento e computação elástica na nuvem, que separou os dois recursos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O fim do uso de ferramentas de ingestão, já que as fontes passaram a gravar direto no warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No modern data stack, a ingestão ainda pode aplicar algum tratamento leve ao dado que chega, mas o que efetivamente muda em relação ao stack antigo é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A transformação de regra de negócio deixa de existir, porque o warehouse já entrega os dados prontos assim que chegam.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação de regra de negócio continua acontecendo antes da carga, só que numa ferramenta gerenciada na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação de regra de negócio passa a ser responsabilidade exclusiva da ferramenta de BI, no momento do relatório.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação de regra de negócio deixa de acontecer antes da carga e passa a rodar como SQL dentro do warehouse.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que é impreciso descrever o modern data stack como uma única ferramenta que uma empresa compra e instala?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque, na prática, ele é a combinação de ferramentas gerenciadas e plugáveis, conectadas em torno de um warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a expressão modern data stack se refere apenas ao hardware usado dentro do data center da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada empresa precisa desenvolver sua própria ferramenta de transformação do zero para usar esse modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nenhuma dessas ferramentas roda na nuvem, sendo todas mantidas em servidores internos da empresa.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As camadas do stack",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# As camadas do stack\n\nDá para pensar no modern data stack como uma esteira dividida em camadas, cada uma com uma responsabilidade única e uma ferramenta própria cuidando dela. O dado entra bruto numa ponta, passa por cada camada recebendo um tratamento específico, e sai do outro lado como uma resposta que alguém consegue usar para decidir algo.\n\nQuatro camadas aparecem na maioria dos stacks modernos: ingestão, armazenamento, transformação e BI. Entender o que cada uma recebe e o que cada uma entrega é o que permite trocar uma ferramenta por outra sem quebrar o restante do caminho."
                    },
                    {
                        "type": "text",
                        "value": "## Ingestão: extrair e carregar\n\nA camada de ingestão é o E e o L do ELT: ela extrai o dado da origem (um banco transacional, uma API, um arquivo) e carrega esse dado no warehouse, preservando o formato mais próximo possível do original. Ela não aplica regra de negócio, não decide o que uma coluna significa, não junta tabelas de fontes diferentes: o trabalho dela termina quando o dado bruto está pousado no warehouse, disponível para a próxima camada.\n\nÉ por isso que essa camada costuma ser resolvida com ferramentas de conector gerenciado: o trabalho é repetitivo e bem definido (extrair, replicar, lidar com mudança de schema na origem), então faz sentido pagar por uma ferramenta pronta em vez de manter esse código à mão."
                    },
                    {
                        "type": "code",
                        "value": "[ fontes: banco, API, arquivo, evento ]\n        |\n        v   (extrai e carrega, sem transformar)\n[ camada de ingestão ]   Fivetran, Airbyte\n        |\n        v\n[ camada de armazenamento ]   Snowflake, BigQuery, Redshift   (dado bruto)\n        |\n        v   (o SQL roda dentro do próprio warehouse)\n[ camada de transformação ]   dbt   (dado bruto vira modelo confiável)\n        |\n        v\n[ camada de BI e consumo ]   Looker, Metabase\n        |\n        v\n[ decisão de negócio ]"
                    },
                    {
                        "type": "text",
                        "value": "## Armazenamento: o warehouse como hub central\n\nO warehouse é o ponto em que todas as outras camadas se encontram. É nele que o dado bruto pousa assim que a ingestão termina, é nele que a transformação lê o bruto e escreve os modelos prontos, e é dele que a camada de BI consulta o resultado final. Uma única peça de infraestrutura concentra as três outras camadas ao seu redor.\n\nO que torna isso viável é a computação elástica: o mesmo warehouse aguenta a carga contínua da ingestão, as consultas pesadas da transformação e o acesso concorrente de dezenas de painéis de BI, escalando cada tipo de carga sob demanda."
                    },
                    {
                        "type": "text",
                        "value": "## Transformação: onde o dado bruto vira informação confiável\n\nA camada de transformação lê o dado bruto do warehouse e aplica a regra de negócio: o que conta como pedido cancelado, como calcular receita líquida, como juntar cliente e assinatura numa única visão. É aqui que mora o dbt, e é aqui que o analytics engineer passa a maior parte do tempo, escrevendo SQL versionado, testado e documentado.\n\nEssa camada é a fronteira entre dado bruto (fiel à origem, mas difícil de usar direto) e dado modelado (pronto para responder a uma pergunta de negócio sem que cada consumidor precise reinventar a regra)."
                    },
                    {
                        "type": "text",
                        "value": "## BI e consumo: onde a resposta chega para quem decide\n\nA última camada é onde o dado transformado vira painel, relatório ou consulta ad-hoc para quem vai usar essa informação para decidir algo. O papel dela é explorar e apresentar, não recalcular regra de negócio: quando duas ferramentas de BI diferentes calculam a mesma métrica de dois jeitos, o problema quase sempre é que a regra não estava centralizada na camada de transformação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"O que recebe\",\"O que entrega\"],[\"Ingestão\",\"Dado na origem (banco, API, arquivo)\",\"Dado bruto, carregado no warehouse\"],[\"Armazenamento\",\"Dado bruto da ingestão\",\"Dado bruto e transformado, disponível para consulta\"],[\"Transformação\",\"Dado bruto do warehouse\",\"Modelos testados, prontos para consumo\"],[\"BI e consumo\",\"Modelos transformados do warehouse\",\"Painéis, métricas e respostas para o negócio\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a responsabilidade da camada de ingestão dentro do modern data stack?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aplicar as regras de negócio da empresa antes mesmo de o dado chegar ao warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extrair o dado das origens e carregá-lo no warehouse, preservando o formato original.",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerar os painéis que o time de negócio consulta todo dia para acompanhar métricas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir o modelo dimensional que os analistas usam para consultar esse dado depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide colocar a lógica que classifica um pedido como cancelado ou concluído dentro do próprio conector que traz os pedidos para o warehouse, na camada de ingestão. Qual problema essa escolha tende a causar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O conector passa a demorar mais para autenticar na origem dos dados a cada execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time de análise passa a ter acesso mais rápido ao pedido, já que a classificação chega pronta desde a ingestão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A empresa perde o dado bruto do pedido, que chega ao warehouse já reclassificado, sem o estado original.",
                                "isCorrect": true
                            },
                            {
                                "text": "O time de BI passa a enxergar o pedido duplicado em todos os painéis que consultam o warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o data warehouse costuma ser descrito como o hub central do modern data stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque é a única camada do stack em que ferramentas de terceiros não podem se conectar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é ele quem decide sozinho qual ferramenta de BI cada time da empresa deve usar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é a camada responsável por extrair o dado diretamente das aplicações de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque concentra o dado bruto e o transformado, conectando as demais camadas do stack.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Duas ferramentas de BI, usadas por times distintos, calculam a taxa de cancelamento de pedidos cada uma com sua própria fórmula. Qual é a origem desse problema, do ponto de vista das camadas do stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A regra que define a métrica não está centralizada na transformação, e cada ferramenta reimplementa o próprio cálculo.",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas ferramentas de BI estão conectadas a warehouses físicos diferentes, um para cada time da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "A camada de ingestão trouxe os pedidos de cada time com um conector separado e incompatível entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse não consegue armazenar duas tabelas de pedidos ao mesmo tempo, então cada time usa uma cópia própria.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre o fluxo de dado entre as camadas do modern data stack, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A camada de BI é quem grava o dado transformado de volta no warehouse, para as outras camadas consultarem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A camada de ingestão entrega o dado bruto, e a transformação aplica a regra de negócio antes do consumo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A camada de armazenamento aplica as regras de negócio, para que a ingestão só precise mover bytes sem contexto.",
                                "isCorrect": false
                            },
                            {
                                "text": "A camada de transformação extrai o dado direto das aplicações de origem, sem depender da ingestão.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O papel do analytics engineer",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O papel do analytics engineer\n\nAntes do modern data stack, o caminho entre o dado bruto e uma resposta de negócio tinha um vão no meio. De um lado, o data engineer construía e operava a infraestrutura: pipelines, orquestração, o warehouse no ar. Do outro, o analista entendia a pergunta de negócio e escrevia a consulta SQL que respondia a ela, direto no seu relatório.\n\nO problema é que ninguém era dono do meio do caminho: a lógica que transforma dado bruto em algo confiável (o que conta como cliente ativo, como calcular receita líquida) acabava espalhada, duplicada e sem teste, reescrita por um analista diferente toda vez que alguém precisava da mesma resposta."
                    },
                    {
                        "type": "text",
                        "value": "## O vão entre o data engineer e o analista\n\nO data engineer é quem garante que o dado chegue: constrói conectores, orquestra pipelines, mantém o warehouse disponível e com performance. Ele não necessariamente conhece a fundo a semântica de negócio, como o que separa exatamente um pedido cancelado de um pedido devolvido.\n\nO analista conhece essa semântica e sabe qual pergunta o negócio está tentando responder, mas normalmente escreve SQL direto no seu relatório, sem versionar, sem revisar em código e sem testar. Quando dois analistas respondem à mesma pergunta de formas ligeiramente diferentes, a empresa passa a ter duas verdades para a mesma métrica."
                    },
                    {
                        "type": "code",
                        "value": "[ Data Engineer ]\n   cuida da infraestrutura: conectores, orquestração, o warehouse no ar\n        |\n        v\n[ warehouse, dado bruto ]\n        |\n        v\n[ Analytics Engineer ]\n   dono da transformação: modelos em SQL, testes, documentação, métricas\n        |\n        v\n[ warehouse, modelos confiáveis ]\n        |\n        v\n[ Analista de Dados / Cientista de Dados ]\n   interpreta os números e responde às perguntas de negócio"
                    },
                    {
                        "type": "quote",
                        "value": "O analytics engineer é dono da camada de transformação e da definição das métricas: fica entre a infraestrutura que o data engineer mantém e a pergunta de negócio que o analista precisa responder."
                    },
                    {
                        "type": "text",
                        "value": "## O que o analytics engineer faz, na prática\n\n- Escreve e mantém os modelos de transformação em SQL, hoje majoritariamente em dbt, lendo o dado bruto do warehouse.\n- Define a métrica uma única vez, num lugar versionado, para que qualquer relatório consulte a mesma fonte de verdade.\n- Escreve testes que verificam o dado antes de publicá-lo, e documenta o que cada modelo representa.\n- Aplica prática de engenharia de software ao trabalho de análise: controle de versão, revisão de código, integração contínua, modelos pequenos e reutilizáveis em vez de uma consulta gigante."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Data Engineer\",\"Analytics Engineer\",\"Analista de Dados\"],[\"Foco principal\",\"Infraestrutura, pipelines e orquestração\",\"Camada de transformação e definição de métricas\",\"Perguntas de negócio e interpretação dos números\"],[\"Ferramentas típicas\",\"Orquestrador, ferramentas de ingestão, o warehouse em si\",\"dbt, SQL versionado, testes de dado\",\"Ferramenta de BI, planilhas, SQL exploratório\"],[\"Entregável\",\"Pipeline de dados confiável, rodando em produção\",\"Modelos testados e documentados, prontos para consumo\",\"Relatório, painel ou recomendação para o negócio\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que essa função surgiu justamente agora\n\nO papel só ganhou força depois que a transformação passou a rodar como SQL dentro do warehouse. Antes, essa lógica ficava presa dentro de uma ferramenta de ETL que só o data engineer operava, ou espalhada em consultas ad-hoc que ninguém versionava. Quando transformar virou escrever SQL testável, um profissional que entende tanto de negócio quanto de prática de engenharia passou a ter onde atuar: exatamente no meio do caminho que antes ficava sem dono."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções descreve melhor o papel do analytics engineer dentro do modern data stack?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cuida da infraestrutura dos conectores de ingestão que trazem o dado bruto das aplicações de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Decide, sozinho, quais decisões de negócio a empresa deve tomar a partir dos números do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "É dono da camada de transformação e da definição das métricas, entre a infraestrutura e a análise de negócio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substitui o analista de dados, respondendo diretamente às perguntas pontuais que o negócio faz todo dia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista escreve, direto no seu próprio relatório, uma consulta SQL que calcula a receita líquida da empresa. Duas semanas depois, outro analista escreve uma consulta parecida, mas com uma regra de desconto ligeiramente diferente, para outro relatório. Qual tarefa do analytics engineer ajudaria a evitar essa divergência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Impedir que qualquer analista escreva consultas SQL, transferindo toda consulta para os data engineers.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o warehouse para outro provedor de nuvem que calcule a receita líquida de forma automática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar mais um conector de ingestão para trazer a mesma fonte de receita de duas formas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelar a receita líquida uma vez na camada de transformação, para que os relatórios usem a mesma definição.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que significa, na prática, dizer que o analytics engineer aplica engenharia de software ao trabalho de análise?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Versionar os modelos de transformação, revisar as mudanças em código e testar o dado antes de publicá-lo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever os modelos de transformação numa linguagem de programação de propósito geral, em vez de SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o data warehouse por um repositório de código onde o dado passa a ser armazenado direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Automatizar por completo a criação de novos painéis de BI, sem qualquer intervenção humana no processo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas descreve corretamente a diferença de foco entre o data engineer e o analytics engineer no modern data stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O data engineer cuida da camada de transformação em SQL, e o analytics engineer cuida da infraestrutura de ingestão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O data engineer cuida da infraestrutura de pipelines e do warehouse, e o analytics engineer cuida da transformação e métricas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O data engineer só trabalha com dado já transformado, e o analytics engineer só trabalha com dado ainda bruto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O data engineer decide as perguntas de negócio que a empresa deve responder, e o analytics engineer mantém a infraestrutura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o papel do analytics engineer só ganhou força depois da adoção do modern data stack, e não antes, no modelo de ETL tradicional?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque antes do modern data stack não existia a função de analista de dados dentro das empresas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o SQL só passou a existir como linguagem de consulta depois da adoção de warehouses na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a transformação passou a rodar como SQL dentro do warehouse, um trabalho versionável e testável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque os data engineers pararam de existir, e alguém precisava assumir toda a infraestrutura de pipelines.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que o ELT no warehouse mudou o jogo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que o ELT no warehouse mudou o jogo\n\nA ideia de carregar o dado bruto e transformar depois, dentro do warehouse, parece simples quando descrita numa frase. O que essa inversão de ordem muda na prática é mais profundo do que parece: ela desloca onde o processamento acontece, quem precisa dimensionar esse processamento, e o que custa mudar uma regra de negócio depois que o dado já foi carregado."
                    },
                    {
                        "type": "text",
                        "value": "## Transformar onde o dado já está\n\nNo modelo antigo, a transformação rodava num servidor de ETL dimensionado à parte, e só o resultado já pronto chegava ao destino. Esse servidor virava mais uma peça de infraestrutura para o time manter, com capacidade própria para planejar e escalar.\n\nNo ELT, a transformação roda dentro do warehouse, usando a mesma capacidade elástica que já guarda o dado. Não existe um servidor extra para dimensionar: o time escreve SQL, e o warehouse decide como paralelizar e escalar aquele processamento."
                    },
                    {
                        "type": "code",
                        "value": "ETL tradicional: mudou a regra de negócio? Volta lá atrás.\n\n[ fonte original ] --> [ servidor de ETL, aplica a regra ] --> [ warehouse, já transformado ]\n        ^\n        |\n        (para aplicar uma regra nova ao histórico, geralmente é preciso reextrair da fonte)\n\n\nELT no warehouse: mudou a regra de negócio? Roda de novo.\n\n[ fonte original ] --> [ ingestão, só carrega ] --> [ warehouse, dado bruto guardado ]\n                                                              |\n                                                              v\n                                                   [ SQL roda de novo sobre o bruto ]\n                                                              |\n                                                              v\n                                                   [ warehouse, modelos atualizados ]"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"ETL tradicional (transforma antes)\",\"ELT no warehouse (transforma depois)\"],[\"Onde processa a transformação\",\"Servidor de ETL externo, dimensionado à parte\",\"Dentro do próprio warehouse, usando a capacidade elástica dele\"],[\"Reprocessar o histórico com uma regra nova\",\"Normalmente exige voltar à fonte original\",\"Basta rodar de novo o modelo em SQL sobre o dado já carregado\"],[\"Escalabilidade da transformação\",\"Limitada pela capacidade do servidor de ETL\",\"Escala junto com o warehouse, sob demanda\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Guardar o dado bruto no warehouse significa que qualquer regra de transformação pode ser refeita do zero, sem precisar voltar à fonte original para buscar o mesmo dado outra vez."
                    },
                    {
                        "type": "text",
                        "value": "## O que se ganha: reprocessar fica barato\n\nComo o bruto continua guardado, mudar uma regra de negócio não exige uma nova extração: basta rodar de novo o modelo em SQL sobre o dado que já está lá. Isso reduz risco, já que a fonte original pode nem ter mais o histórico completo disponível, e torna a transformação mais fácil de corrigir: um modelo com um erro pode ser ajustado e reprocessado, em vez de exigir uma reextração inteira da origem."
                    },
                    {
                        "type": "text",
                        "value": "## O que exige cuidado\n\nProcessar dentro do warehouse tem custo, e esse custo aparece na mesma fatura do armazenamento: uma transformação que refaz um histórico inteiro a cada execução pode sair caro, o que torna a escolha da materialização, assunto do próximo módulo, uma decisão de custo, não só de código. E guardar o dado bruto não elimina a responsabilidade sobre ele: se a origem tem dado sensível, o bruto no warehouse também tem, e continua exigindo controle de acesso, mesmo antes de qualquer transformação."
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo ELT, em que momento a transformação de regra de negócio acontece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Antes de o dado sair da aplicação de origem, direto no banco transacional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Num servidor de ETL dedicado, separado do warehouse, antes da carga dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na ferramenta de ingestão, no mesmo passo em que o dado é extraído da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Depois de o dado já estar carregado no warehouse, rodando como SQL dentro dele.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa muda a regra que define quando um cliente é considerado inativo. No modelo ELT, com o dado bruto preservado no warehouse, o que é necessário para aplicar a nova regra a todo o histórico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reexecutar os modelos de transformação em SQL sobre o dado bruto já carregado, sem voltar à fonte original.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reextrair todo o histórico de novo das aplicações de origem, já que o bruto não fica guardado no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconfigurar o servidor de ETL externo para aplicar a nova regra antes da próxima carga de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pedir ao time de BI que ajuste manualmente os números antigos em cada painel já publicado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a vantagem prática de rodar a transformação como SQL dentro do warehouse, em vez de num servidor de ETL separado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O SQL passa a não precisar mais ser testado, porque o warehouse garante sozinho a qualidade do resultado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A transformação usa a capacidade elástica do warehouse, sem que o time precise dimensionar um servidor à parte.",
                                "isCorrect": true
                            },
                            {
                                "text": "O warehouse deixa de cobrar pelo processamento das consultas de transformação, cobrando só o armazenamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "As fontes de dados originais deixam de precisar de qualquer conector de ingestão para alimentar o warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual cuidado o ELT no warehouse coloca em evidência, que o modelo antigo, com transformação num servidor de ETL à parte, não colocava?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A necessidade de nomear as colunas do dado extraído, algo que simplesmente não existia no modelo ETL tradicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "A obrigação de agendar a execução da transformação, algo que o ETL tradicional nunca precisou fazer.",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo de processar a transformação passa a aparecer na fatura do warehouse, e cresce com a complexidade do SQL.",
                                "isCorrect": true
                            },
                            {
                                "text": "A necessidade de dar nome às tabelas de destino, uma exigência que só passou a existir a partir do ELT.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a preservação do dado bruto no warehouse, no modelo ELT, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O dado bruto pode ser descartado assim que a primeira transformação é aplicada, já que ele perde a utilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado bruto some do warehouse automaticamente depois de um número fixo de dias, definido pelo próprio ELT.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado bruto não precisa de nenhum controle de acesso, porque só times técnicos chegam até essa camada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado bruto continua no warehouse depois de transformado, e ainda exige controle de acesso.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ecossistema de ferramentas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O ecossistema de ferramentas\n\nO modern data stack não vem numa caixa só. Em vez de uma plataforma monolítica que promete resolver tudo, o mercado se organizou em torno de ferramentas especializadas, cada uma dona de uma camada, plugadas umas nas outras por meio do warehouse. Trocar uma ferramenta de ingestão, por exemplo, não deveria exigir reescrever os modelos de transformação, desde que o dado continue chegando ao warehouse com a mesma estrutura essencial."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Ferramentas de mercado\",\"O que fazem\"],[\"Ingestão\",\"Fivetran, Airbyte\",\"Conectam-se às origens e carregam o dado bruto no warehouse\"],[\"Armazenamento\",\"Snowflake, BigQuery, Redshift\",\"Guardam o dado e processam consultas com computação elástica\"],[\"Transformação\",\"dbt\",\"Transforma o dado bruto em modelos testados, em SQL versionado\"],[\"BI e consumo\",\"Looker, Metabase\",\"Exploram os modelos transformados em painéis e consultas de negócio\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Ingestão gerenciada: Fivetran e Airbyte\n\nFivetran e Airbyte resolvem a mesma camada, com filosofias diferentes. O Fivetran é um serviço proprietário totalmente gerenciado: a empresa configura o conector e o restante, autenticação, sincronização incremental, mudança de schema na origem, fica por conta do fornecedor. O Airbyte nasceu como projeto de código aberto, pode ser auto-hospedado ou usado como serviço gerenciado (Airbyte Cloud), com uma comunidade que mantém boa parte dos conectores.\n\nOs detalhes de extração incremental, CDC e formatos de arquivo são assunto da trilha de ETL e ingestão: aqui, o que importa é o papel que essa camada ocupa no stack."
                    },
                    {
                        "type": "text",
                        "value": "## O warehouse: Snowflake, BigQuery e Redshift\n\nOs três resolvem o mesmo papel: guardar o dado, bruto e transformado, e processar consultas, com armazenamento e computação escalando de forma elástica e independente. Diferem em detalhes de precificação, arquitetura interna e integração com o restante do ecossistema de cada provedor de nuvem, mas, do ponto de vista de quem monta o stack, são intercambiáveis como destino: qualquer um deles recebe a ingestão de um lado e alimenta a transformação e o BI do outro."
                    },
                    {
                        "type": "code",
                        "value": "[ fonte: banco, API, evento ]\n        |\n        v\n[ Fivetran ou Airbyte ]   (ingestão gerenciada)\n        |\n        v\n[ Snowflake, BigQuery ou Redshift ]   (warehouse, dado bruto)\n        |\n        v\n[ dbt ]   (transformação em SQL, versionada e testada)\n        |\n        v\n[ Snowflake, BigQuery ou Redshift ]   (warehouse, modelos prontos)\n        |\n        v\n[ Looker ou Metabase ]   (painéis e consultas de negócio)"
                    },
                    {
                        "type": "quote",
                        "value": "Nenhuma ferramenta do modern data stack faz sentido sozinha: o valor está em como elas se conectam em torno do warehouse, e é o dbt quem dá coerência à camada de transformação nesse meio de campo."
                    },
                    {
                        "type": "text",
                        "value": "## Transformação e consumo: dbt, Looker e Metabase\n\nO dbt ocupa a camada de transformação em praticamente qualquer combinação do modern data stack, por ser vendor-neutral em relação ao warehouse: os mesmos modelos em SQL rodam sobre Snowflake, BigQuery ou Redshift, trocando só a configuração de conexão.\n\nNa ponta de consumo, Looker e Metabase resolvem o mesmo problema, explorar o dado transformado em painéis e consultas de negócio, para públicos diferentes: o Looker tem uma camada de modelagem própria voltada a empresas que já centralizaram a definição de métricas, enquanto o Metabase prioriza um uso mais simples e direto, comum em times menores ou numa adoção inicial de self-service."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual conjunto de ferramentas representa uma combinação típica do modern data stack, camada por camada (ingestão, warehouse, transformação, BI)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fivetran para ingestão, Snowflake como warehouse, dbt para transformação e Metabase para BI.",
                                "isCorrect": true
                            },
                            {
                                "text": "dbt para ingestão, Looker como warehouse, Fivetran para transformação e Snowflake para BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Metabase para ingestão, dbt como warehouse, Airbyte para transformação e BigQuery para BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snowflake para ingestão, Fivetran como warehouse, Looker para transformação e dbt para BI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Do ponto de vista conceitual, qual é uma diferença comumente associada entre Fivetran e Airbyte como ferramentas de ingestão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fivetran é uma ferramenta de transformação em SQL, enquanto Airbyte é uma ferramenta de armazenamento de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fivetran é um serviço proprietário gerenciado, enquanto Airbyte também existe como projeto de código aberto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fivetran só se conecta a warehouses on-premise, enquanto Airbyte só se conecta a warehouses na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fivetran substitui o data warehouse da empresa, enquanto Airbyte substitui a ferramenta de BI usada pelo time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que Snowflake, BigQuery e Redshift têm em comum, do ponto de vista do papel que ocupam no modern data stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Todos são ferramentas de BI usadas para montar painéis de acompanhamento de métricas de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos são pacotes de macros da comunidade dbt para reaproveitar lógica de transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos são data warehouses na nuvem, que separam armazenamento e computação de forma elástica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos são conectores de ingestão mantidos pela comunidade para trazer dado até o warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o dbt costuma ser descrito como a ferramenta central da camada de transformação, mesmo sendo vendor-neutral em relação ao warehouse escolhido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o dbt substitui o warehouse, armazenando os dados transformados fora do Snowflake, BigQuery ou Redshift.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dbt é a única ferramenta da lista capaz de extrair dado direto das aplicações de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dbt roda como um painel de BI, entregando o resultado final direto para quem toma a decisão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dbt organiza as transformações em SQL versionado e testável, plugável em warehouses diferentes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa troca sua ferramenta de ingestão de Airbyte para Fivetran, mantendo o mesmo warehouse e os mesmos modelos dbt. O que essa troca, por si só, tende a exigir da camada de transformação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pouca ou nenhuma mudança nos modelos dbt, desde que o dado chegue ao warehouse com a mesma estrutura essencial.",
                                "isCorrect": true
                            },
                            {
                                "text": "A reescrita completa dos modelos dbt, já que cada ferramenta de ingestão exige uma sintaxe própria de SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "A troca obrigatória do warehouse, porque o Fivetran só se conecta a um provedor de nuvem específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "A substituição do dbt por uma ferramenta de transformação própria do Fivetran, incompatível com o resto do stack.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - dbt: o que é e por que existe",
        "aulas": [
            {
                "titulo": "O problema que o dbt resolve",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O problema que o dbt resolve\n\nAntes de ferramentas como o dbt existirem, a transformação de dados dentro do warehouse acontecia de um jeito parecido em praticamente toda empresa: alguém abria o console do banco, escrevia um `CREATE VIEW` ou um `CREATE TABLE AS SELECT`, e pronto, a lógica de negócio ficava gravada ali, sem passar por nenhuma das práticas que já eram padrão no desenvolvimento de software havia anos.\n\nEsse SQL de transformação virava um artefato descartável: funcionava até alguém precisar mudar, entender ou confiar nele."
                    },
                    {
                        "type": "text",
                        "value": "## Quatro coisas que faltavam\n\n- **Versão**: não existia histórico de quem mudou o quê, nem como voltar a um estado anterior.\n- **Teste**: nada verificava se uma coluna ficou nula, se um ID se duplicou ou se uma soma bateu.\n- **Documentação**: a definição de uma métrica ou de uma tabela vivia só na cabeça de quem escreveu a query.\n- **Linhagem**: ninguém conseguia responder, com confiança, de onde vinha uma coluna nem quem dependia dela."
                    },
                    {
                        "type": "code",
                        "value": "-- view criada direto no console do warehouse, sem revisão nem histórico\n-- (o comentário abaixo é tudo que restou de contexto)\n-- ajustado por alguém do financeiro em algum momento, motivo perdido\nCREATE OR REPLACE VIEW analytics.clientes_ativos AS\nSELECT\n    c.id AS cliente_id,\n    c.nome,\n    MAX(p.data_pedido) AS ultima_compra\nFROM raw.clientes c\nJOIN raw.pedidos p ON p.cliente_id = c.id\nWHERE p.data_pedido >= CURRENT_DATE - INTERVAL '90 days'\nGROUP BY 1, 2"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática ausente\",\"O que acontecia na prática\"],[\"Versionamento\",\"Duas pessoas alteravam a mesma view em dias diferentes e uma sobrescrevia a outra\"],[\"Teste\",\"Um campo nulo só era percebido quando o dashboard já estava errado havia semanas\"],[\"Documentação\",\"Cada analista explicava o conceito de cliente ativo de um jeito diferente numa reunião\"],[\"Linhagem\",\"Ninguém sabia se podia apagar uma view sem quebrar outro relatório\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O mesmo sintoma em times diferentes\n\nEsse cenário se repete de formas parecidas, em praticamente qualquer empresa:\n\n- Marketing e vendas calculam a métrica de receita com filtros diferentes, e cada time chega a um número, sem que ninguém perceba a divergência até uma reunião de resultado.\n- Uma view depende de outra, que depende de uma tabela removida meses atrás: a query só quebra na próxima vez que alguém tentar rodá-la.\n- A origem muda o nome de uma coluna, e a mudança se propaga em silêncio até um relatório parar de bater, sem nenhum aviso no meio do caminho."
                    },
                    {
                        "type": "quote",
                        "value": "O SQL de transformação virou código de produção, mas sem nenhuma das práticas que o resto da engenharia de software já usava havia anos: controle de versão, teste automatizado e documentação."
                    },
                    {
                        "type": "text",
                        "value": "## O que precisava mudar\n\nO problema não era o SQL em si, e sim o jeito como ele era tratado: escrito direto no warehouse, sem repositório, sem teste, sem dono claro. Era exatamente esse o espaço que o dbt viria preencher, tratando a camada de transformação como um projeto de software normal, versionado em git e com testes automatizados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Antes de ferramentas como o dbt se popularizarem, como a lógica de transformação de dados costumava viver dentro do warehouse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em macros Jinja, documentadas automaticamente pelo próprio warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em views e tabelas criadas manualmente no console, sem controle de versão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em arquivos YAML que um orquestrador convertia em SQL antes de rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em modelos SQL versionados em git, revisados por pull request antes de subir.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Os times de marketing e de vendas calculam a métrica de receita com filtros diferentes e só percebem a divergência numa reunião de resultados. Qual prática, se existisse, atacaria diretamente esse sintoma, dando aos dois times um lugar único para consultar como a métrica é definida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Versionamento em git de cada consulta, escrita e mantida de forma isolada por cada time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes automatizados de not_null nas colunas usadas no cálculo da métrica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Linhagem automática mostrando de qual tabela bruta vem cada coluna usada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Documentação centralizada da definição da métrica, visível para os dois times.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma view depende de outra view, que depende de uma tabela que já foi removida do warehouse há meses. O erro só aparece quando alguém tenta rodar essa cadeia de novo. Antes de existir uma ferramenta que gera o grafo de dependências automaticamente, qual prática ausente explica por que ninguém percebeu o problema antes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Linhagem: sem o mapa de dependências, ninguém sabia da view ligada à tabela removida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste: sem um teste de unicidade, o warehouse impede a remoção de qualquer tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Documentação: sem uma descrição escrita, o warehouse recusa o comando de remoção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Versionamento: sem um histórico em git, o warehouse recria sozinho a tabela apagada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela de origem `pedidos` tem a coluna `status` renomeada para `situacao` pelo time do sistema transacional, sem aviso a mais ninguém. Um relatório de vendas passa a trazer números errados, e isso só é percebido dias depois. Esse tipo de falha silenciosa é sintoma direto da ausência de qual prática?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Backups diários do warehouse, que permitiriam restaurar a coluna antiga quando necessário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Réplicas de leitura do banco transacional, que isolariam o relatório da tabela de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes automatizados que verificassem a estrutura esperada dos dados a cada execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Índices nas colunas mais consultadas, que agilizariam a leitura da tabela de pedidos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num warehouse sem nenhuma camada de transformação compartilhada, cada analista escreve sua própria versão da lógica de pedido válido dentro da query que ele mesmo roda. Além do retrabalho, qual problema isso tende a causar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pequenas divergências entre versões da lógica, gerando números diferentes para a mesma pergunta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumento no tempo de resposta do warehouse, já que cada query passa a rodar num cluster isolado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloqueio de escrita nas tabelas de origem, impedindo o sistema transacional de gravar pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Redução no espaço em disco do warehouse, já que cada query cria uma tabela temporária permanente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que o dbt faz",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que o dbt faz\n\nO dbt (data build tool) é uma ferramenta de transformação: ela pega dados que já estão dentro do warehouse e os transforma em modelos prontos para análise, usando apenas SQL (mais alguns recursos de Jinja, que o módulo 6 cobre em detalhe). A unidade básica de trabalho é o modelo: um arquivo `.sql` com um único `SELECT`."
                    },
                    {
                        "type": "text",
                        "value": "## Você escreve SELECT, o dbt cuida do DDL/DML\n\nNum modelo dbt, você não escreve `CREATE VIEW`, `CREATE TABLE` nem `INSERT`. Você escreve só a lógica de negócio, como um `SELECT` comum. O dbt lê essa definição e gera, por trás dos panos, o comando de DDL/DML certo para materializar aquele modelo no warehouse, de acordo com a estratégia configurada (view, table, incremental ou ephemeral, tema do módulo 4)."
                    },
                    {
                        "type": "code",
                        "value": "-- models/marts/fct_pedidos.sql\n-- o analytics engineer escreve só o SELECT\nSELECT\n    p.pedido_id,\n    p.cliente_id,\n    p.valor_total,\n    c.segmento\nFROM {{ ref('stg_pedidos') }} p\nLEFT JOIN {{ ref('stg_clientes') }} c ON c.cliente_id = p.cliente_id\n\n-- o dbt gera algo como o comando abaixo, de acordo com a materialização:\n-- CREATE OR REPLACE TABLE analytics.fct_pedidos AS ( ...o SELECT acima... )"
                    },
                    {
                        "type": "text",
                        "value": "## Versionado, testável e documentado\n\n- **Versionado**: os arquivos `.sql` e `.yml` do projeto vivem num repositório git, como qualquer outro código: histórico, revisão em pull request, branch por mudança.\n- **Testável**: cada modelo pode ter testes declarados em YAML (por exemplo, `unique` e `not_null` numa coluna), rodados com um único comando.\n- **Documentado**: descrições de modelos e colunas ficam no próprio projeto, em YAML, e viram um site de documentação navegável, gerado automaticamente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que faltava (aula anterior)\",\"Como o dbt resolve\"],[\"Sem versão\",\"Projeto inteiro (modelos, testes, docs) vive num repositório git\"],[\"Sem teste\",\"Testes declarados em YAML, rodados junto com a transformação\"],[\"Sem documentação\",\"Descrições em YAML viram um site de documentação gerado pelo próprio dbt\"],[\"Sem linhagem\",\"O DAG é montado sozinho a partir das referências entre modelos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que o dbt não faz\n\nO dbt não se conecta a um banco transacional para extrair dados, e não carrega dados de um arquivo ou de uma API no warehouse. Ele parte do princípio de que os dados brutos já estão lá, carregados por uma ferramenta de ingestão (como Fivetran ou Airbyte) ou por um pipeline próprio. O dbt entra depois, cuidando só da transformação.\n\nEm termos de ELT, o dbt é o T: ele não é o E (extract) nem o L (load)."
                    },
                    {
                        "type": "quote",
                        "value": "O dbt não extrai nem carrega dado nenhum: ele assume que o dado bruto já chegou ao warehouse e cuida só da transformação, o T do ELT."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um analytics engineer escreve, na prática, dentro de um modelo dbt?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um `CREATE TABLE` completo, incluindo tipos de coluna e chaves primárias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um script Python que gera o SQL de acordo com o volume de dados de entrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um `SELECT`, sem escrever o `CREATE VIEW` ou `CREATE TABLE` correspondente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um job de orquestração que decide em que ordem os modelos vão rodar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe usa o Fivetran para trazer dados de um CRM ao warehouse todas as manhãs, e o dbt para transformar esses dados em modelos prontos para os dashboards. Se a extração do CRM falhar silenciosamente, qual afirmação está correta sobre o papel do dbt nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O dbt não detecta essa falha por conta própria: ele só transforma o que já chegou ao warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt refaz a extração automaticamente, já que ele também orquestra a camada de ingestão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt pausa todos os modelos até que o Fivetran confirme que a extração terminou sem erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt substitui o Fivetran nesse fluxo, porque os dois fazem exatamente a mesma função.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois modelos dbt têm exatamente o mesmo `SELECT`, mas um está configurado como `view` e o outro como `table`. O que muda no comportamento do dbt ao rodar cada um?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `SELECT` escrito pelo time, que precisa ser reescrito de forma diferente em cada caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O motor de banco de dados usado, já que `view` e `table` exigem warehouses diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "A possibilidade de testar, já que só modelos materializados como `table` podem ser testados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando de DDL que o dbt gera por trás do SELECT: um vira `view`, o outro vira `table`.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time novo em dbt planeja usá-lo para capturar as mudanças na tabela `pedidos` do banco transacional a cada 5 minutos e gravá-las direto no warehouse, sem nenhuma outra ferramenta no meio. Por que esse plano não funciona como o time espera?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o dbt só roda uma vez por dia e nunca aceita execuções mais frequentes que essa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dbt não extrai dados de bancos transacionais, só transforma o que já está no warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o dbt exige que os dados cheguem primeiro em formato Parquet, nunca direto de um banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dbt precisa de um Airflow instalado na mesma máquina para conseguir rodar um modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de gerar o SQL que materializa cada modelo, o que mais o dbt entrega automaticamente a partir do mesmo projeto, sem esforço manual extra do analytics engineer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um cluster de processamento dedicado, provisionado para cada execução do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia de segurança diária de todas as tabelas de origem do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um grafo de dependências entre os modelos, construído a partir das referências entre eles.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um pipeline de ingestão configurado automaticamente para cada fonte usada nos modelos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "dbt Core x dbt Cloud",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# dbt Core x dbt Cloud\n\n\"dbt\" não é um produto único: existem duas formas de usar a mesma ferramenta. O dbt Core é o motor open source, distribuído como linha de comando. O dbt Cloud é um produto comercial, hospedado pela dbt Labs, construído em cima do mesmo motor. Os conceitos (modelos, `ref()`, testes, o DAG) são idênticos nos dois; o que muda é onde e como o projeto roda."
                    },
                    {
                        "type": "text",
                        "value": "## dbt Core: o motor, na sua infraestrutura\n\nO dbt Core é instalado via linha de comando, roda local na máquina de quem desenvolve, dentro de um container, ou dentro de um orquestrador como o Airflow. É open source e gratuito. Em troca dessa liberdade, o time precisa montar o resto ao redor: onde o código fica versionado, quem dispara as execuções e em qual horário, e onde a documentação gerada fica publicada."
                    },
                    {
                        "type": "text",
                        "value": "## dbt Cloud: o produto hospedado\n\nO dbt Cloud é um produto comercial da dbt Labs, construído sobre o dbt Core. Ele entrega, hospedado, o que o Core deixa por conta do time: um IDE no navegador para escrever e rodar modelos sem instalar nada localmente, um scheduler embutido para agendar execuções, um site de documentação já publicado, e uma interface de administração para controlar acesso e ambientes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"dbt Core\",\"dbt Cloud\"],[\"Distribuição\",\"Open source, linha de comando\",\"Produto comercial, hospedado\"],[\"Onde roda\",\"Onde o time instalar (local, container, orquestrador próprio)\",\"Na infraestrutura da dbt Labs\"],[\"Scheduler\",\"Nenhum embutido, o time traz o seu (cron, Airflow)\",\"Embutido, configurado pela interface\"],[\"IDE\",\"Nenhum, usa o editor de código local\",\"IDE no navegador, sem instalação\"],[\"Documentação\",\"Gerada localmente, o time decide onde publicar\",\"Hospedada automaticamente\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# dbt Core: quem dispara a execução e onde ela roda fica por conta do time\n$ dbt run --select stg_pedidos\n\n# dbt Cloud: o mesmo comando roda por baixo de um job agendado\n# ou disparado pela interface, sem o time gerenciar onde o processo executa"
                    },
                    {
                        "type": "text",
                        "value": "## A mesma engine por baixo\n\nUm projeto dbt (os arquivos `.sql` e `.yml` dentro de `models/`, `tests/` etc.) não muda de um lado para o outro: os mesmos modelos, o mesmo `ref()`, os mesmos testes rodam tanto no Core quanto no Cloud. A escolha entre os dois é operacional (quem cuida da infraestrutura, do scheduler, da IDE), não conceitual: aprender dbt é aprender o mesmo conjunto de ideias nos dois casos."
                    },
                    {
                        "type": "quote",
                        "value": "dbt Core e dbt Cloud rodam a mesma engine por baixo: a diferença não está nos conceitos, está em quem cuida do scheduler, da IDE e da infraestrutura ao redor do projeto."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o dbt Core?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É um produto comercial que só roda na infraestrutura hospedada pela dbt Labs.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um plugin que só funciona dentro do dbt Cloud, sem uso independente.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma extensão paga que adiciona um IDE no navegador ao dbt Cloud.",
                                "isCorrect": false
                            },
                            {
                                "text": "É open source, distribuído como uma ferramenta de linha de comando.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados já opera um Airflow próprio para orquestrar outros pipelines e não quer adicionar mais um serviço hospedado ao ambiente. Para rodar as transformações dbt dentro desse Airflow existente, qual é a opção mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dbt Cloud, porque só ele consegue se conectar a um Airflow já existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt Core, instalado onde o Airflow roda, disparado como mais uma tarefa do pipeline.",
                                "isCorrect": true
                            },
                            {
                                "text": "dbt Core, mas só depois de migrar todo o Airflow para dentro do dbt Cloud.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt Cloud, configurando o Airflow para funcionar como scheduler substituto do próprio dbt Cloud.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, sem tempo para manter infraestrutura própria, quer escrever modelos dbt direto pelo navegador, sem instalar nada na máquina, com as execuções agendadas numa interface visual. O que essa necessidade aponta como escolha mais natural?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dbt Cloud, pelo IDE no navegador e o scheduler já embutidos na própria interface.",
                                "isCorrect": true
                            },
                            {
                                "text": "dbt Core, porque o navegador já é suficiente para instalá-lo sem linha de comando.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt Cloud, mas só depois de instalar o dbt Core manualmente em cada máquina do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt Core, configurando o cron do sistema operacional para funcionar como um IDE.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time desenvolveu seu projeto no dbt Cloud por seis meses e decide migrar para dbt Core, rodando dentro do próprio Airflow, para reduzir custo de licença. O que precisa mudar na lógica dos modelos `.sql` e dos arquivos `.yml` para essa migração funcionar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Todo `ref()` precisa virar uma chamada direta às tabelas, já que o Core não suporta `ref()`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todo teste em YAML precisa ser reescrito em Python, formato exigido pelo dbt Core.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada na lógica dos modelos ou dos testes: a mesma estrutura de projeto vale para os dois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Toda a estrutura de pastas precisa mudar, já que Core e Cloud usam layouts diferentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença mais precisa entre dbt Core e dbt Cloud, em termos de modelo de distribuição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Core é pago e roda na nuvem; Cloud é gratuito e roda só na máquina local do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Core é uma linguagem de consulta própria e independente; Cloud é a implementação dela em SQL padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Core é um plugin do dbt Cloud, usado só para gerar documentação offline.",
                                "isCorrect": false
                            },
                            {
                                "text": "Core é open source e roda por linha de comando; Cloud é comercial e hospedado sobre o Core.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A estrutura de um projeto dbt",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A estrutura de um projeto dbt\n\nUm projeto dbt é, na prática, uma pasta com uma convenção de subpastas mais ou menos fixa e dois arquivos de configuração centrais. Depois de ver o que o dbt é e as duas formas de rodá-lo, esta aula mapeia o que vive em cada parte dessa estrutura, antes de entrar em modelos e materializações nos próximos módulos."
                    },
                    {
                        "type": "code",
                        "value": "meu_projeto_dbt/\n|-- dbt_project.yml        (configuração do projeto)\n|-- models/\n|   |-- staging/           (1:1 com a fonte, só limpeza e renomeação)\n|   |-- intermediate/      (combina modelos de staging)\n|   `-- marts/              (modelos finais, prontos para consumo)\n|-- seeds/                  (arquivos .csv pequenos, viram tabela)\n|-- snapshots/               (captura de mudanças ao longo do tempo, SCD tipo 2)\n|-- tests/                   (testes singulares, um SELECT customizado)\n`-- macros/                  (Jinja reutilizável entre modelos)\n\nprofiles.yml fica fora desta pasta, normalmente em ~/.dbt/"
                    },
                    {
                        "type": "text",
                        "value": "## O que vive em cada pasta\n\n- **models/**: os arquivos `.sql` com os SELECTs que viram views, tables ou outras materializações, mais os `.yml` que documentam e testam esses modelos.\n- **seeds/**: arquivos `.csv` pequenos e estáveis (uma tabela de códigos de país, por exemplo), carregados como tabela pelo dbt.\n- **snapshots/**: modelos especiais que registram como uma linha mudou ao longo do tempo, a base para um histórico tipo SCD Tipo 2 (o módulo 6 aprofunda).\n- **tests/**: testes singulares, cada um um SELECT que não deveria retornar nenhuma linha se os dados estiverem corretos (o módulo 5 aprofunda; testes genéricos costumam ficar declarados em YAML, junto do próprio modelo).\n- **macros/**: trechos de Jinja reutilizáveis entre modelos, o equivalente a funções (o módulo 6 aprofunda)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pasta ou arquivo\",\"O que guarda\"],[\"models/\",\"Os SELECTs que viram modelos, mais o YAML de teste e documentação\"],[\"seeds/\",\"Arquivos CSV pequenos e estáveis, carregados como tabela\"],[\"snapshots/\",\"Definições que capturam o histórico de mudanças de uma tabela\"],[\"tests/\",\"Testes singulares, escritos como um SELECT customizado\"],[\"macros/\",\"Jinja reutilizável entre modelos\"],[\"dbt_project.yml\",\"Configuração do projeto: nome, caminhos, materialização padrão\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## dbt_project.yml: a configuração do projeto\n\nTodo projeto dbt tem, na raiz, um `dbt_project.yml`. É ali que ficam o nome do projeto, o nome do profile de conexão que ele usa (referenciando uma entrada do `profiles.yml`), os caminhos das pastas (`model-paths`, `seed-paths` etc.) e configurações padrão, como qual materialização usar por subpasta de `models/`."
                    },
                    {
                        "type": "code",
                        "value": "# dbt_project.yml\nname: 'meu_projeto_dbt'\nversion: '1.0.0'\nprofile: 'meu_projeto_dw'\n\nmodel-paths: ['models']\nseed-paths: ['seeds']\nsnapshot-paths: ['snapshots']\n\nmodels:\n  meu_projeto_dbt:\n    staging:\n      +materialized: view\n    marts:\n      +materialized: table"
                    },
                    {
                        "type": "text",
                        "value": "## profiles.yml: a conexão, fora do projeto\n\nO `profiles.yml` guarda os dados de conexão com o warehouse (host, usuário, credenciais, banco) organizados por target (por exemplo, dev e prod). Diferente do `dbt_project.yml`, ele normalmente não fica dentro do repositório do projeto: por padrão, o dbt procura por ele em `~/.dbt/profiles.yml`, na máquina de quem está rodando, ou num caminho apontado por variável de ambiente.\n\nEssa separação existe porque o `profiles.yml` tem credenciais e detalhes de ambiente (cada pessoa, ou cada execução em CI, pode ter os seus), enquanto o `dbt_project.yml` descreve o projeto em si, igual para todo mundo que o usa, e por isso faz sentido ficar versionado em git."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num projeto dbt, onde ficam os arquivos `.sql` que definem os modelos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na pasta `models/`, organizada por subpastas como staging, intermediate e marts.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na pasta `seeds/`, junto com os arquivos `.csv` de dados de referência.",
                                "isCorrect": false
                            },
                            {
                                "text": "No `dbt_project.yml`, dentro de uma seção reservada para SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na pasta `snapshots/`, ao lado das definições completas do histórico de mudanças.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analytics engineer precisa de uma tabela pequena e estável com o mapeamento entre sigla de estado e região do Brasil, que não vem de nenhum sistema de origem e quase nunca muda. Onde esse dado deve entrar no projeto dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como um modelo em `models/staging/`, com um SELECT que gera as siglas por código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como uma entrada em `snapshots/`, já que o mapeamento precisa de histórico de mudanças.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como uma macro em `macros/`, retornando o mapeamento inteiro direto em Jinja.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um seed: um arquivo `.csv` dentro de `seeds/`, carregado como tabela pelo dbt.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma organização quer que o nome do projeto e os caminhos de pastas do dbt fiquem versionados em git, mas que as credenciais de acesso ao warehouse nunca sejam commitadas junto com o código. Como o dbt já separa isso, sem esforço extra de configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os dois ficam no mesmo `dbt_project.yml`, numa seção marcada para ser ignorada pelo git.",
                                "isCorrect": false
                            },
                            {
                                "text": "`dbt_project.yml` guarda a configuração do projeto e vai para o git; `profiles.yml` guarda a conexão e fica fora.",
                                "isCorrect": true
                            },
                            {
                                "text": "`profiles.yml` guarda tudo, incluindo o nome do projeto, e o dbt oculta sozinho as credenciais.",
                                "isCorrect": false
                            },
                            {
                                "text": "`dbt_project.yml` guarda a conexão com o warehouse, e `profiles.yml` guarda só os caminhos de pastas do projeto inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa nova no time clona o repositório do projeto dbt e roda os comandos pela primeira vez na própria máquina. O projeto builda sem erro para o resto do time, mas a conexão com o warehouse falha só para ela, mesmo com as credenciais corretas. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O `dbt_project.yml` clonado do repositório está apontando para o warehouse de outra pessoa do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "A pasta `models/` clonada do git perdeu a permissão de leitura ao ser copiada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela ainda não tem um `profiles.yml` configurado na própria máquina, já que ele não vem no repositório.",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo `seeds/` precisa ser recriado manualmente a cada nova máquina do time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre o que vive em `snapshots/` e o que vive em `seeds/` num projeto dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`snapshots/` guarda a captura de como os dados mudam ao longo do tempo; `seeds/` guarda arquivos CSV estáticos.",
                                "isCorrect": true
                            },
                            {
                                "text": "`snapshots/` guarda arquivos CSV estáticos; `seeds/` guarda a captura de como os dados mudam ao longo do tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas guardam a mesma coisa, são só nomes alternativos para a mesma pasta de configuração.",
                                "isCorrect": false
                            },
                            {
                                "text": "`snapshots/` guarda testes de dados; `seeds/` guarda a documentação gerada pelo dbt.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ciclo: run, test, build, compile",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O ciclo: run, test, build, compile\n\nO dia a dia com o dbt gira em torno de poucos comandos. Cada um faz uma coisa específica, e usar o comando errado no momento errado é uma fonte comum de confusão para quem está começando: rodar só `dbt run` e achar que os testes também rodaram, por exemplo, é um engano frequente."
                    },
                    {
                        "type": "text",
                        "value": "## dbt run: materializa os modelos\n\nO comando `dbt run` executa os SELECTs de cada modelo e os materializa no warehouse (cria ou atualiza views, tables, ou processa o incremento, dependendo da configuração), respeitando a ordem do DAG. Ele não roda os testes declarados no projeto: um modelo pode rodar com sucesso e, mesmo assim, ter dados inconsistentes que só um teste pegaria."
                    },
                    {
                        "type": "text",
                        "value": "## dbt test: roda os testes\n\nO comando `dbt test` executa os testes genéricos (como `unique` e `not_null`) e os testes singulares definidos no projeto, contra o que já existe no warehouse. Ele não materializa nada: se um modelo referenciado por um teste ainda não existir no warehouse, o teste falha, porque não há dado nenhum para verificar."
                    },
                    {
                        "type": "code",
                        "value": "# rodando run e test separados: tudo é construído antes de qualquer teste rodar\ndbt run\ndbt test\n# se um modelo no meio do DAG tiver dado ruim, os modelos a jusante\n# já foram construídos em cima dele antes de o teste avisar do problema\n\n# dbt build: testa cada modelo logo depois de construí-lo, na ordem do DAG\ndbt build\n# se um teste falhar num modelo, os modelos a jusante que dependem dele\n# são pulados (skipped), em vez de rodar em cima de um dado já sabido ruim"
                    },
                    {
                        "type": "text",
                        "value": "## dbt build: o ciclo completo, na ordem do DAG\n\nO comando `dbt build` roda seeds, snapshots, modelos e testes juntos, respeitando a ordem de dependência do DAG: cada nó é construído e testado antes de o próximo nó, que depende dele, começar. Se um teste falhar num modelo, o `dbt build` pula (skip) os modelos a jusante daquele nó, em vez de construí-los em cima de um dado que já se sabe problemático. É o comando mais indicado para rodar o projeto inteiro de uma vez, principalmente em CI."
                    },
                    {
                        "type": "text",
                        "value": "## dbt compile: só gera o SQL, não roda nada\n\nO comando `dbt compile` resolve o Jinja de cada modelo (`ref()`, `source()`, macros) e gera o SQL final, exatamente como ele seria enviado ao warehouse, sem de fato executá-lo: nada é criado, atualizado ou testado. É útil para depurar o que uma macro está gerando, ou para conferir a query final antes de rodar de verdade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"O que faz\",\"Materializa algo?\"],[\"dbt run\",\"Executa os SELECTs e materializa os modelos\",\"Sim\"],[\"dbt test\",\"Roda os testes genéricos e singulares\",\"Não\"],[\"dbt build\",\"Roda seeds, snapshots, models e tests juntos, na ordem do DAG\",\"Sim\"],[\"dbt compile\",\"Gera o SQL final, com o Jinja resolvido\",\"Não\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando `dbt run` faz com os testes declarados no projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Roda todos os testes genéricos, mas pula os testes singulares do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não roda os testes: só executa os SELECTs e materializa os modelos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Roda os testes antes de materializar cada modelo, seguindo a ordem do DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda os testes só dos modelos que falharam na execução anterior.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time roda `dbt run` todos os dias, sem nunca rodar `dbt test`, porque os modelos sempre terminam sem erro. Um dia, uma coluna que nunca podia ser nula passa a vir nula da origem, e o dashboard só percebe o problema dias depois. O que esse cenário evidencia sobre o `dbt run`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o `dbt run` deveria ter travado sozinho ao encontrar o valor nulo na coluna.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o `dbt run` corrige valores nulos automaticamente antes de gravar no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o `dbt run` terminar sem erro não garante dado correto, só que o SQL rodou.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o `dbt test` teria o mesmo resultado do `dbt run`, já que os dois materializam modelos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de um `dbt build`, um teste falha num modelo intermediário do qual vários modelos de marts dependem, via `ref()`. O que o dbt faz com esses modelos de marts, na mesma execução?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pula (skip) a construção desses modelos, já que dependem de um nó que falhou no teste.",
                                "isCorrect": true
                            },
                            {
                                "text": "Constrói todos eles normalmente, porque o `dbt build` ignora falhas de teste nos modelos intermediários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reverte a última execução bem-sucedida desses modelos para o estado anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Envia um alerta por e-mail e pausa a execução de todo o projeto até alguém intervir.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analytics engineer suspeita que uma macro está gerando um filtro de data errado dentro de um modelo, mas não quer criar nem alterar nenhuma tabela no warehouse enquanto investiga. Qual comando permite ver o SQL final, já com a macro resolvida, sem esse risco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "`dbt test`, que mostra o SQL final de qualquer modelo antes de validar os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "`dbt run`, que grava o resultado numa tabela temporária e apaga automaticamente depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "`dbt build`, que sempre mostra o SQL gerado antes de decidir se materializa ou não.",
                                "isCorrect": false
                            },
                            {
                                "text": "`dbt compile`, que gera o SQL final sem executá-lo contra o warehouse.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline roda `dbt run` e, na sequência, `dbt test`, sempre como dois passos separados. Comparado a substituir os dois por um único `dbt build`, qual é a principal desvantagem prática dessa sequência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `dbt run` seguido de `dbt test` deixa de rodar os testes genéricos, executando somente os singulares do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelos a jusante de um nó com dado ruim já são construídos antes de qualquer teste apontar o problema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar os dois separados impede o dbt de montar corretamente o DAG de dependências.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `dbt test`, sozinho depois do `dbt run`, materializa os modelos de novo do zero.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Modelos, ref e a linhagem",
        "aulas": [
            {
                "titulo": "O que é um modelo dbt",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um modelo dbt\n\nUm modelo dbt é, na prática, um arquivo `.sql` guardado na pasta `models/` de um projeto dbt, contendo um único comando `SELECT`. Não há `CREATE TABLE`, não há `INSERT`, não há DDL nem DML escrito à mão: só a lógica de transformação, em SQL puro (ou SQL com Jinja, quando é preciso lógica dinâmica). O dbt lê esse arquivo e decide, sozinho, como transformar esse SELECT num objeto real dentro do warehouse."
                    },
                    {
                        "type": "text",
                        "value": "## Do arquivo ao objeto no warehouse\n\n- O **nome do arquivo** vira o nome do objeto criado no warehouse: um arquivo `models/marts/fct_pedidos.sql` gera, por padrão, um objeto chamado `fct_pedidos`.\n- O **schema** onde o objeto é criado segue a configuração do projeto, e pode variar por camada, por pasta ou por ambiente.\n- A **materialização** (view, table, incremental, ephemeral) decide como o SELECT vira objeto: sem nenhuma configuração explícita, o padrão do dbt é criar uma **view**.\n- `dbt run` é o comando que executa esse processo de fato: compila os modelos e cria, ou atualiza, os objetos no warehouse, na ordem correta."
                    },
                    {
                        "type": "code",
                        "value": "-- models/marts/fct_pedidos.sql\n-- Um exemplo simples, só para mostrar o formato\n-- (o nome físico escrito direto no FROM tem um problema,\n-- assunto da próxima aula)\n\nSELECT\n    id_pedido,\n    id_cliente,\n    status,\n    valor_total,\n    data_criacao\nFROM bruto.pedidos\nWHERE status != 'cancelado'"
                    },
                    {
                        "type": "code",
                        "value": "-- O que o dbt run faz com o SELECT acima:\n-- traduz para o dialeto do warehouse configurado\n-- e materializa como view (o padrão, sem configuração extra)\n\nCREATE OR REPLACE VIEW analytics.marts.fct_pedidos AS (\n    SELECT\n        id_pedido,\n        id_cliente,\n        status,\n        valor_total,\n        data_criacao\n    FROM bruto.pedidos\n    WHERE status != 'cancelado'\n)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"No arquivo do modelo\",\"No warehouse, depois do dbt run\"],[\"Nome do arquivo (fct_pedidos.sql)\",\"Nome do objeto criado (fct_pedidos)\"],[\"Um SELECT, sem DDL/DML escrito à mão\",\"CREATE VIEW ou CREATE TABLE, gerado pelo dbt\"],[\"Materialização configurada (ou o padrão view)\",\"O tipo real do objeto: view, table, etc.\"],[\"Uma definição versionada no Git\",\"Um objeto recriado a cada dbt run, a partir dela\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um modelo dbt não é a tabela: é a definição de como essa tabela deve ser construída. A tabela, ou view, é só o resultado, recriado a cada execução do dbt run a partir dessa definição."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa\n\nTratar transformação como um SELECT versionado, e não como um script solto de DDL, é o que abre a porta para tudo que vem depois: linhagem automática, testes, documentação. Mas o exemplo do bloco acima ainda tem um problema: `bruto.pedidos` escrito direto no FROM. Na próxima aula, veja por que isso é uma prática a evitar, e como `ref()` e `source()` resolvem isso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista cria o arquivo `models/marts/fct_vendas.sql` contendo apenas um comando SELECT, sem nenhum DDL escrito à mão. O que esse arquivo representa dentro de um projeto dbt?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A definição de um modelo: o dbt materializa esse SELECT como view ou table no warehouse, usando o nome do arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um script de infraestrutura que cria o schema marts inteiro no warehouse antes de qualquer outro comando rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia física dos dados de vendas, carregada no warehouse automaticamente assim que o arquivo é salvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um relatório pronto para consumo em BI, que substitui a necessidade de dashboards em ferramentas como Metabase.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma engenheira cria um modelo novo, `fct_pagamentos.sql`, sem configurar nenhuma materialização, nem no arquivo nem no `dbt_project.yml`. Depois de rodar `dbt run`, que tipo de objeto ela deve encontrar no warehouse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma table, porque essa é a materialização padrão do dbt quando nenhuma outra é configurada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma view, porque essa é a materialização padrão do dbt quando nenhuma outra é configurada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum objeto, porque o dbt exige que toda materialização seja configurada explicitamente antes do run.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo ephemeral, porque essa é a materialização padrão quando o modelo fica na pasta marts.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo estava em `models/marts/fct_pedidos.sql` e, numa refatoração, o arquivo foi renomeado para `fct_pedidos_v2.sql`, sem nenhuma outra mudança no SQL. O que acontece no warehouse depois do próximo `dbt run`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada muda no warehouse, porque o dbt identifica modelos pelo conteúdo do SELECT, não pelo nome do arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt renomeia o objeto antigo automaticamente, preservando o histórico de dados já carregados na tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt passa a criar um objeto chamado fct_pedidos_v2, já que o nome do objeto segue o nome do arquivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O próximo run falha, porque o dbt não permite renomear um arquivo de modelo depois de criado no projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um `dbt run` bem-sucedido, alguém apaga manualmente, direto no warehouse, a view criada para um modelo dbt. O que acontece com o modelo em si, dentro do projeto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O modelo também é apagado, já que o arquivo .sql depende da existência prévia do objeto no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "O próximo dbt run falha, porque o dbt exige que o objeto anterior ainda exista antes de recriar a view.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt detecta a exclusão automaticamente e desfaz a operação, restaurando a view apagada no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada muda: o modelo continua definido no arquivo .sql, e a view volta a existir no próximo dbt run.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor roda `dbt compile` num modelo novo e confere, na pasta de arquivos compilados, um SQL válido, sem nenhuma referência a Jinja. Nenhum objeto novo aparece no warehouse. Por que isso acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "dbt compile só traduz o Jinja em SQL puro; quem cria os objetos no warehouse é o dbt run (ou o dbt build).",
                                "isCorrect": true
                            },
                            {
                                "text": "dbt compile só funciona corretamente em modelos materializados como table, nunca em views ou ephemeral.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt compile cria os objetos automaticamente, mas apenas no schema de desenvolvimento, nunca em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt compile exige que o warehouse tenha permissão de escrita liberada antes de gerar qualquer resultado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ref() e source()",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ref() e source()\n\nNa aula anterior, o modelo `fct_pedidos` tinha um problema: `FROM bruto.pedidos`, o nome físico da tabela escrito direto no SQL. Funciona, mas quebra duas coisas importantes: o dbt não sabe que esse modelo depende dessa tabela, porque não está olhando para dentro do FROM, e o SQL fica preso a um schema fixo, difícil de promover entre ambientes. É para resolver isso que existem `ref()` e `source()`."
                    },
                    {
                        "type": "text",
                        "value": "## ref(): referenciar outro modelo\n\n- `{{ ref('nome_do_modelo') }}` substitui, no SQL compilado, o nome completo (schema e nome do objeto) do modelo referenciado no ambiente atual.\n- Não importa se esse modelo é uma view em desenvolvimento ou uma table em produção: o `ref()` resolve para o lugar certo, automaticamente.\n- Cada `ref()` usado num modelo cria uma dependência: o dbt passa a saber que esse modelo só pode rodar depois do modelo referenciado."
                    },
                    {
                        "type": "text",
                        "value": "## source(): referenciar uma tabela bruta\n\n- `{{ source('nome_da_fonte', 'nome_da_tabela') }}` referencia uma tabela carregada por uma ferramenta de ingestão, como Fivetran ou Airbyte, fora do controle do dbt.\n- Antes de usar, a fonte precisa ser **declarada** num arquivo `.yml`, com o schema e o nome real da tabela no warehouse.\n- Assim como o `ref()`, o `source()` também vira uma dependência visível no grafo, só que apontando para uma tabela bruta, não para outro modelo."
                    },
                    {
                        "type": "code",
                        "value": "-- models/staging/erp/_erp__sources.yml\n\nversion: 2\n\nsources:\n  - name: erp\n    schema: bruto\n    tables:\n      - name: pedidos\n      - name: clientes"
                    },
                    {
                        "type": "code",
                        "value": "-- models/staging/erp/stg_erp__pedidos.sql\n-- Sem nome físico escrito à mão\n\nSELECT\n    id_pedido,\n    id_cliente,\n    status,\n    valor_total,\n    data_criacao\nFROM {{ source('erp', 'pedidos') }}\nWHERE status != 'cancelado'\n\n\n-- models/marts/fct_pedidos.sql\n-- Depende de um modelo, não de uma fonte bruta\n\nSELECT\n    id_pedido,\n    id_cliente,\n    valor_total\nFROM {{ ref('stg_erp__pedidos') }}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"ref()\",\"source()\"],[\"O que referencia\",\"Outro modelo dbt, definido em SQL\",\"Uma tabela bruta, carregada por ingestão\"],[\"Precisa de declaração prévia\",\"Não: o modelo já é parte do projeto\",\"Sim: a fonte precisa existir num arquivo .yml\"],[\"Aparece no grafo de dependências\",\"Sim, como nó de modelo\",\"Sim, como nó de fonte (source)\"],[\"Nome físico escrito no SQL\",\"Nunca: o dbt resolve o schema certo\",\"Nunca: o dbt resolve o schema certo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Se o FROM de um modelo dbt tem um nome de schema.tabela escrito à mão, alguma coisa está errada: ou falta um ref(), ou falta um source() declarado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um modelo dbt tem `FROM {{ ref('stg_erp__pedidos') }}` no lugar de `FROM dev_ana.stg_erp__pedidos` escrito à mão. Qual é o principal motivo prático dessa troca?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O ref() executa o modelo referenciado em paralelo, reduzindo o tempo total de execução do dbt run.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ref() resolve o nome completo do modelo no ambiente atual, e cria a dependência no grafo do dbt.",
                                "isCorrect": true
                            },
                            {
                                "text": "O ref() valida automaticamente os tipos de dado das colunas antes de compilar o SQL do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ref() aplica um cache de resultados, evitando reprocessar o modelo referenciado a cada execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma analista tenta usar `{{ source('vendas', 'pedidos') }}` num modelo novo, mas o `dbt compile` falha, avisando que essa fonte não existe. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O nome do modelo que contém esse source() não segue a convenção de prefixo stg_ exigida pelo dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela pedidos está materializada como view, e o source() só funciona com tabelas físicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fonte vendas, com a tabela pedidos, ainda não foi declarada num arquivo .yml de sources do projeto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O projeto dbt não tem um dbt_project.yml configurado com a lista de todas as tabelas brutas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo precisa ler duas entradas: a tabela `bruto.clientes`, carregada pelo Fivetran e ainda não tratada por nenhum modelo dbt, e o modelo `stg_erp__pedidos`, já existente no projeto. Como cada leitura deve ser escrita no FROM/JOIN desse modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ref('clientes') para a tabela bruta do Fivetran, e source('stg_erp__pedidos') para o modelo já existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "source('erp', 'clientes') para as duas leituras, já que as duas tabelas vêm do mesmo sistema de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "ref('bruto.clientes') para a tabela bruta, e ref('stg_erp__pedidos') para o modelo já existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "source('erp', 'clientes') para a tabela bruta, e ref('stg_erp__pedidos') para o modelo já existente.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe promove seu projeto dbt de desenvolvimento para produção, e cada ambiente usa um schema diferente no warehouse. Um modelo antigo, que ainda tem `FROM dev_joana.stg_vendas` escrito à mão, passa a devolver dados vazios em produção. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O nome do schema foi fixado à mão, então o modelo aponta para o schema de dev mesmo rodando em produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo está com a materialização configurada como ephemeral, que não é suportada em produção pelo dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário de produção do warehouse não tem permissão de leitura em nenhuma tabela criada por outros modelos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem de execução dos modelos mudou entre ambientes, e o modelo passou a rodar antes da sua dependência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo referencia `{{ source('financeiro', 'faturas') }}`, mas ninguém jamais criou um arquivo `.yml` com um bloco `sources:` para `financeiro`. O que acontece ao rodar `dbt run`?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O dbt cria a declaração da fonte automaticamente, inferindo o schema a partir do nome usado no source().",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando falha na compilação, porque o dbt não encontra nenhuma fonte financeiro declarada no projeto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O modelo roda normalmente, mas fica de fora do grafo de dependências, sem aparecer na linhagem do dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt materializa o modelo como ephemeral por padrão, já que não localizou a fonte declarada no projeto.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A linhagem automática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A linhagem automática\n\nCada `ref()` e `source()` usado nos modelos de um projeto dbt é, ao mesmo tempo, uma instrução de SQL e uma declaração de dependência. O dbt lê todos os modelos do projeto, encontra essas chamadas, e monta com elas um grafo: o DAG (directed acyclic graph, grafo acíclico dirigido) do projeto. Esse grafo não é desenhado à mão por ninguém, ele é derivado automaticamente do próprio SQL."
                    },
                    {
                        "type": "text",
                        "value": "## Para que serve o DAG\n\n- **Ordem de execução**: um modelo só roda depois que todos os modelos e fontes que ele referencia, seus 'pais' no grafo, já rodaram com sucesso.\n- **Paralelismo seguro**: modelos sem dependência entre si podem rodar ao mesmo tempo, porque o dbt sabe exatamente quem depende de quem.\n- **Linhagem visível**: `dbt docs generate` gera um site com o grafo completo, navegável, mostrando de onde cada modelo vem e para onde seus dados seguem.\n- **Impacto de mudança**: antes de alterar um modelo ou uma fonte, dá para ver exatamente quais modelos, diretos e indiretos, dependem dele."
                    },
                    {
                        "type": "code",
                        "value": "                 +--> stg_erp__pedidos -------+\n                 |                             |\n                 |                             v\nerp (source) ----+                    int_pedidos_enriquecidos --> fct_pedidos\n                 |                             ^\n                 |                             |\n                 +--> stg_erp__clientes -------+\n                                  |\n                                  +--> dim_clientes"
                    },
                    {
                        "type": "text",
                        "value": "## Uma fonte mudou: quem é afetado?\n\nSuponha que o time de vendas renomeia uma coluna na tabela bruta `erp.pedidos`. Sem o DAG, a pergunta 'quem quebra com essa mudança' só seria respondida na tentativa e erro, esperando algum painel falhar. Com a linhagem automática, a resposta está no próprio grafo: basta olhar tudo que é descendente de `stg_erp__pedidos`, que lê o source `erp.pedidos`. Nesse caso, `int_pedidos_enriquecidos` e `fct_pedidos` são afetados. `dim_clientes`, que nunca leu essa fonte, fica de fora."
                    },
                    {
                        "type": "code",
                        "value": "-- Roda o modelo e tudo que depende dele (descendentes)\ndbt run --select stg_erp__pedidos+\n\n-- Roda o modelo e tudo de que ele depende (ancestrais)\ndbt run --select +fct_pedidos"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\",\"Significado no DAG do dbt\"],[\"Nó (node)\",\"Um modelo, uma fonte, um seed ou um snapshot no grafo\"],[\"Pai (parent, upstream)\",\"Um nó referenciado por ref() ou source() dentro de outro modelo\"],[\"Filho (child, downstream)\",\"Um nó que referencia o modelo atual, direta ou indiretamente\"],[\"Ciclo\",\"Uma dependência circular; o dbt recusa compilar um projeto com ciclos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O DAG de um projeto dbt não é um diagrama mantido à parte: é a soma exata de todos os ref() e source() escritos no SQL, sempre atualizado, nunca desatualizado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o dbt usa para montar automaticamente o DAG, o grafo de dependências, de um projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um arquivo separado, mantido manualmente, onde a equipe desenha a ordem de execução dos modelos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem alfabética dos nomes de arquivo dentro da pasta models do projeto dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "As chamadas a ref() e source() escritas dentro dos próprios modelos SQL do projeto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O histórico de execuções anteriores, registrado automaticamente a cada rodada de dbt run.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna é renomeada na tabela bruta `erp.pedidos`. Antes de aplicar a mudança, a equipe quer saber quais modelos dbt seriam afetados. Qual é a forma correta de responder a isso usando o próprio projeto dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Procurar, em cada arquivo .sql do projeto, o texto erp.pedidos escrito literalmente no FROM ou no JOIN.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar dbt test em todos os modelos do projeto e verificar quais deles retornam alguma falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perguntar para o time responsável por cada modelo se ele usa dados vindos do sistema ERP.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar o grafo de linhagem e identificar todos os modelos descendentes do source erp.pedidos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Num projeto dbt, `stg_pedidos` e `stg_clientes` não têm nenhuma dependência entre si, mas ambos são referenciados por `int_pedidos_enriquecidos`. O que o DAG permite que o dbt faça nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Executar stg_pedidos e stg_clientes em paralelo, já que nenhum dos dois depende do outro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar os três modelos em paralelo, incluindo int_pedidos_enriquecidos, para ganhar tempo no run.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pular a execução de um dos dois modelos de staging, já que ambos alimentam o mesmo modelo intermediário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar os dois modelos de staging automaticamente num único objeto, simplificando o grafo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro quer rodar apenas o modelo `fct_pedidos` e todos os modelos dos quais ele depende, sem tocar em nada que vem depois dele no grafo. Qual comando faz exatamente isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "dbt run --select fct_pedidos+",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt run --select +fct_pedidos",
                                "isCorrect": true
                            },
                            {
                                "text": "dbt run --select fct_pedidos",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt run --select fct_pedidos+2",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um `dbt compile`, o dbt retorna um erro informando um ciclo no grafo de dependências entre os modelos `int_a` e `int_b`. O que provavelmente causou esse erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "int_a e int_b foram criados no mesmo commit, e o dbt não permite compilar dois modelos novos ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "int_a e int_b estão configurados com a mesma materialização, o que o dbt trata como dependência circular.",
                                "isCorrect": false
                            },
                            {
                                "text": "int_a tem um ref('int_b'), e ao mesmo tempo int_b tem um ref('int_a'), criando uma dependência circular.",
                                "isCorrect": true
                            },
                            {
                                "text": "int_a referencia uma fonte que também é referenciada, separadamente, pelo modelo int_b.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Camadas: staging, intermediate e marts",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Camadas: staging, intermediate e marts\n\nUm projeto dbt pode, tecnicamente, ter todos os modelos numa pasta só, sem organização nenhuma. Mas a comunidade dbt consolidou, ao longo dos anos, uma convenção de camadas que resolve um problema recorrente: sem padrão, cada pessoa junta fontes e aplica regra de negócio onde bem entende, e a linhagem vira um emaranhado difícil de acompanhar. A convenção divide os modelos em três camadas: staging, intermediate e marts."
                    },
                    {
                        "type": "text",
                        "value": "## staging: limpeza 1:1 com a fonte\n\n- Um modelo de staging lê **uma única fonte**, via `source()`, e faz limpeza leve: renomear colunas, ajustar tipos, talvez filtrar linhas claramente inválidas.\n- Não há junção com outras fontes nem regra de negócio aqui. A relação com a fonte original é 1:1: uma tabela bruta, um modelo de staging.\n- É a camada mais próxima do dado cru, e normalmente a mais barata de manter: costuma ser materializada como view."
                    },
                    {
                        "type": "text",
                        "value": "## intermediate: juntar e preparar\n\n- Um modelo intermediate combina **múltiplos modelos de staging**, ou outros intermediates, aplicando lógica que ainda não é o produto final: joins, agregações parciais, pivôs.\n- Não costuma ser consumido diretamente por ferramentas de BI. Existe para organizar lógica complexa em passos menores, cada um testável e legível sozinho.\n- É comum usar a materialização ephemeral aqui, tema da próxima aula, já que ninguém precisa consultar esse modelo diretamente no warehouse."
                    },
                    {
                        "type": "text",
                        "value": "## marts: pronto para o negócio\n\n- Um modelo de marts é o produto final: uma tabela de fato ou de dimensão, nomeada e estruturada em torno de um processo de negócio (pedidos, pagamentos, campanhas), não em torno de uma fonte.\n- É a camada consumida por ferramentas de BI, como Looker ou Metabase, e por qualquer consulta ad-hoc no warehouse.\n- Organizada por domínio ou área (financeiro, marketing, vendas), e não por sistema de origem: várias fontes já foram unificadas antes de chegar aqui."
                    },
                    {
                        "type": "code",
                        "value": "sources (brutos)       -->  staging (stg_)        -->  intermediate (int_)    -->  marts (fct_/dim_)\n\nerp.pedidos                  stg_erp__pedidos            int_pedidos_                 fct_pedidos\nerp.clientes                 stg_erp__clientes           enriquecidos                 dim_clientes\n\n1 fonte = 1 modelo,          limpeza 1:1 com a           junta modelos de             organizado por\nsem tratamento                fonte, sem junção           staging, ainda não           domínio de negócio,\n                              entre fontes                é o produto final           pronto para BI"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Lê de\",\"O que faz\",\"Consumida por\"],[\"staging\",\"Uma única fonte (source)\",\"Renomeia, tipa, filtra o óbvio\",\"Outros modelos dbt\"],[\"intermediate\",\"Modelos de staging ou outros intermediate\",\"Junta, agrega, prepara\",\"Outros modelos dbt\"],[\"marts\",\"Modelos de intermediate, ou staging quando não há lógica intermediária\",\"Organiza por domínio de negócio\",\"BI, análises, outros consumidores\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A staging responde qual é essa fonte, já limpa. A intermediate responde como essas fontes se combinam. A marts responde o que o negócio precisa consultar. Cada camada resolve uma pergunta diferente, por isso elas não se misturam num único modelo gigante."
                    }
                ],
                "questions": [
                    {
                        "statement": "Das camadas de um projeto dbt (staging, intermediate, marts), qual delas costuma ser organizada por domínio de negócio, como financeiro ou marketing, e não por sistema de origem dos dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "staging",
                                "isCorrect": false
                            },
                            {
                                "text": "intermediate",
                                "isCorrect": false
                            },
                            {
                                "text": "sources",
                                "isCorrect": false
                            },
                            {
                                "text": "marts",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo precisa juntar `stg_erp__pedidos` com `stg_erp__clientes`, aplicando uma lógica de enriquecimento que nenhum modelo de negócio usa diretamente, mas que dois marts diferentes, `fct_pedidos` e `fct_pagamentos`, vão reaproveitar. Em qual camada esse modelo deveria viver?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "intermediate, já que junta modelos de staging e não é destinado ao consumo direto por ferramentas de BI.",
                                "isCorrect": true
                            },
                            {
                                "text": "staging, já que ainda está perto da fonte original e não representa um processo de negócio completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "marts, já que o resultado será reaproveitado por mais de um modelo de fatos dentro do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "staging, desde que o modelo receba um prefixo diferente para indicar que junta duas fontes distintas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo chamado `stg_erp__pedidos` foi escrito fazendo um JOIN entre a tabela bruta de pedidos e a tabela bruta de clientes, ambas via `source()`. Qual princípio da convenção de camadas esse modelo está violando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Staging deve sempre ser materializado como table, nunca como view, para garantir performance de leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Staging deve manter relação 1:1 com uma única fonte, sem juntar dados de outras tabelas brutas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Staging deve conter apenas colunas numéricas, deixando texto e datas para os modelos de intermediate.",
                                "isCorrect": false
                            },
                            {
                                "text": "Staging deve ser nomeado sempre no plural, e pedidos já está no plural, então o nome está incorreto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista de BI pergunta em qual modelo deve basear um novo dashboard de vendas, que precisa de dados já unificados e prontos para consumo direto. Qual camada é a resposta esperada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "staging, porque é a camada mais próxima da fonte, com os dados mais atualizados possíveis para o dashboard.",
                                "isCorrect": false
                            },
                            {
                                "text": "intermediate, porque já combina os dados de múltiplas fontes antes de qualquer regra de negócio ser aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "marts, porque é a camada organizada em torno do negócio, pensada para consumo direto por ferramentas de BI.",
                                "isCorrect": true
                            },
                            {
                                "text": "source, porque representa a tabela bruta original, sem nenhuma transformação que possa distorcer os números.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de staging já contém exatamente os dados que um mart de dimensão precisa, sem nenhuma junção ou lógica adicional necessária. Nesse caso, o que a convenção de camadas recomenda?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um modelo de intermediate deve ser criado mesmo assim, já que pular essa camada não é permitido pelo dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo de staging deve ser renomeado com o prefixo fct_ ou dim_, já que ele virou o mart nesse cenário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados devem ser duplicados manualmente da staging para um novo modelo de marts, mantendo os dois separados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mart pode referenciar o modelo de staging diretamente, sem exigir um modelo de intermediate desnecessário.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Nomear e organizar modelos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Nomear e organizar modelos\n\nA convenção de camadas (staging, intermediate, marts) só cumpre sua promessa, deixar a linhagem fácil de entender de relance, se vier acompanhada de nomes e pastas consistentes. Sem isso, um projeto com centenas de modelos vira um labirinto: para saber o que um modelo faz, seria preciso abrir o arquivo e ler o SQL inteiro. Com convenção, o nome já entrega boa parte da resposta."
                    },
                    {
                        "type": "text",
                        "value": "## Prefixos por camada\n\n- **stg_**: modelos de staging. Convenção comum: `stg_[fonte]__[entidade]`, como `stg_stripe__pagamentos` ou `stg_erp__pedidos` (o sistema de origem no nome ajuda quando duas fontes têm entidades com nome parecido).\n- **int_**: modelos de intermediate, como `int_pedidos_enriquecidos` ou `int_pagamentos_pivotados`.\n- **fct_**: fatos, no sentido de modelagem dimensional (eventos, transações, algo que aconteceu), como `fct_pedidos` ou `fct_pagamentos`.\n- **dim_**: dimensões, entidades com atributos que descrevem o fato, como `dim_clientes` ou `dim_produtos`."
                    },
                    {
                        "type": "text",
                        "value": "## Organização de pastas\n\n- **staging**: uma subpasta por sistema de origem, `models/staging/erp/`, `models/staging/stripe/`, cada uma com seus modelos e o arquivo de sources correspondente.\n- **intermediate**: geralmente uma pasta única, `models/intermediate/`, já que esses modelos tendem a ser específicos de um fluxo, não de uma fonte.\n- **marts**: uma subpasta por domínio de negócio, `models/marts/financeiro/`, `models/marts/marketing/`, reunindo os fatos e dimensões daquele domínio."
                    },
                    {
                        "type": "code",
                        "value": "models/\n  staging/\n    erp/\n      _erp__sources.yml\n      stg_erp__pedidos.sql\n      stg_erp__clientes.sql\n    stripe/\n      _stripe__sources.yml\n      stg_stripe__pagamentos.sql\n  intermediate/\n    int_pedidos_enriquecidos.sql\n  marts/\n    financeiro/\n      fct_pedidos.sql\n      fct_pagamentos.sql\n      dim_clientes.sql\n    marketing/\n      fct_campanhas.sql"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prefixo\",\"Camada\",\"Exemplo\",\"Convenção de nome\"],[\"stg_\",\"staging\",\"stg_erp__pedidos\",\"stg_[fonte]__[entidade]\"],[\"int_\",\"intermediate\",\"int_pedidos_enriquecidos\",\"int_[entidade]_[verbo no particípio]\"],[\"fct_\",\"marts (fato)\",\"fct_pedidos\",\"fct_[processo de negócio]\"],[\"dim_\",\"marts (dimensão)\",\"dim_clientes\",\"dim_[entidade descritiva]\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um bom nome de modelo dbt responde duas perguntas antes de abrir o arquivo: em qual camada ele está, e o que ele representa. Se o nome não responde isso, a convenção não está sendo seguida de verdade."
                    },
                    {
                        "type": "text",
                        "value": "## Consistência acima de tudo\n\nO prefixo exato, ou a forma de dividir pastas, importa menos do que a equipe inteira seguir a mesma convenção. Um projeto onde metade dos modelos de fato começa com `fct_` e a outra metade não segue nenhum padrão perde justamente o benefício que a convenção deveria trazer: reconhecer a camada e o papel de um modelo só pelo nome, sem precisar abrir o arquivo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na convenção de nomenclatura mais comum em projetos dbt, qual prefixo é usado para um modelo de staging que limpa a tabela bruta de pagamentos vinda do Stripe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "stg_, como em stg_stripe__pagamentos",
                                "isCorrect": true
                            },
                            {
                                "text": "int_, como em int_stripe__pagamentos",
                                "isCorrect": false
                            },
                            {
                                "text": "fct_, como em fct_stripe__pagamentos",
                                "isCorrect": false
                            },
                            {
                                "text": "dim_, como em dim_stripe__pagamentos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time está nomeando dois modelos novos: um representa cada pedido feito por um cliente, um evento com data e valor, e outro representa os atributos de cada cliente, nome, segmento, data de cadastro. Como esses modelos devem ser nomeados, seguindo a convenção fct_/dim_?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dim_pedidos para o evento de pedido, e fct_clientes para os atributos do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "fct_pedidos para o evento de pedido, e dim_clientes para os atributos do cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "fct_pedidos para os dois modelos, já que ambos pertencem ao mesmo domínio de vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "dim_pedidos para os dois modelos, já que representam entidades do mesmo processo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto dbt ingere dados de dois sistemas diferentes, um ERP e o Stripe, cada um com uma tabela chamada `pagamentos`. Qual organização de pastas evita a colisão de nomes entre os dois modelos de staging?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma única pasta staging/ para todos os modelos, distinguindo os dois pela ordem no dbt_project.yml.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma pasta staging/pagamentos/ compartilhada pelos dois sistemas, com um modelo único que junta as fontes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma subpasta por sistema de origem, staging/erp/ e staging/stripe/, cada uma com seu modelo de staging.",
                                "isCorrect": true
                            },
                            {
                                "text": "Duas pastas com o mesmo nome stg_pagamentos/, diferenciadas apenas pelo schema de cada ambiente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa revisão de código, um revisor percebe que um modelo chamado `pedidos_completos.sql` está na pasta `marts/financeiro/`, sem nenhum prefixo fct_ ou dim_, enquanto os demais modelos da pasta seguem a convenção. Qual é o problema prático dessa inconsistência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O dbt recusa compilar o projeto, porque todo modelo dentro de marts precisa obrigatoriamente ter um prefixo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo pedidos_completos deixa de aparecer no grafo de linhagem, já que não segue o padrão de nomenclatura.",
                                "isCorrect": false
                            },
                            {
                                "text": "A materialização configurada para esse modelo é ignorada pelo dbt, que aplica sempre a materialização view.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quem olhar a lista de modelos não consegue saber, só pelo nome, se pedidos_completos é um fato ou dimensão.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Diferente de staging e marts, a pasta intermediate costuma não ser dividida em subpastas por fonte ou por domínio, ficando com todos os modelos direto em `models/intermediate/`. Qual é a justificativa mais consistente com o papel dessa camada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Modelos de intermediate tendem a ser específicos de um fluxo, não de uma fonte ou de um domínio inteiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "A pasta intermediate é opcional e raramente usada, então criar subpastas não compensaria o esforço extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt exige, por padrão, que todos os modelos intermediate fiquem numa única pasta, sem suporte a subpastas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelos de intermediate não aparecem na documentação gerada, então a organização em pastas não teria efeito.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Materializações",
        "aulas": [
            {
                "titulo": "view: leve e sempre atual",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# view: leve e sempre atual\n\nA materialização é a decisão de como o SELECT de um modelo dbt vira um objeto no warehouse (ou nem vira nenhum). Ela é configurada com `{{ config(materialized='...') }}` no topo do modelo, ou por pasta no `dbt_project.yml`. Esta aula abre o módulo pela mais simples das quatro: **view**, que também é a materialização padrão do dbt quando nenhuma é configurada explicitamente."
                    },
                    {
                        "type": "text",
                        "value": "## Como funciona\n\nAo rodar `dbt run` sobre um modelo materializado como view, o dbt compila o SQL do modelo e executa um `CREATE VIEW AS SELECT ...` no warehouse. Nenhum dado é copiado ou duplicado: a view é só a query salva com um nome. Toda vez que alguém consulta essa view (uma ferramenta de BI, outro modelo dbt, um analista rodando um SELECT manual), o warehouse reexecuta o SELECT inteiro por trás dela, contra as tabelas de origem, na hora da leitura."
                    },
                    {
                        "type": "code",
                        "value": "{{ config(materialized='view') }}\n\n-- Camada de staging: renomeia e tipa as colunas da fonte, 1:1 com a origem\nselect\n    id as pedido_id,\n    cliente_id,\n    cast(valor_total as numeric(10,2)) as valor_total,\n    status,\n    cast(criado_em as timestamp) as criado_em\nfrom {{ source('vendas', 'pedidos') }}"
                    },
                    {
                        "type": "text",
                        "value": "## Onde ela brilha\n\n- **Camada de staging**: modelos `stg_` costumam ser só limpeza e renomeação, 1:1 com a fonte. Sem agregação pesada, o custo de recalcular a cada leitura é baixo.\n- **Dado sempre atual**: como a view não guarda nenhum snapshot, uma mudança na tabela de origem aparece imediatamente na próxima consulta, sem esperar o próximo `dbt run`.\n- **Sem duplicação de armazenamento**: nenhum byte extra é gravado no warehouse, só a definição da query.\n\nPor isso a view costuma ser o padrão para a staging na maioria dos projetos dbt: modelos leves, numerosos, e onde frescor importa mais do que velocidade de leitura."
                    },
                    {
                        "type": "text",
                        "value": "## O custo fica na leitura\n\nA troca é simples: a view não paga custo de escrita (o `dbt run` só valida a sintaxe e cria a definição), mas empurra todo o custo de processamento para quem lê. Se um modelo view tem lógica pesada (vários joins, agregações, window functions) e é consultado com frequência, esse custo se repete a cada consulta, o que pode deixar dashboards lentos ou multiplicar o gasto de computação no warehouse. Encadear várias views (uma view sobre outra view) agrava o problema: a query final carrega a lógica de todas as camadas empilhadas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Momento\", \"O que acontece numa view\"], [\"dbt run\", \"Só cria ou atualiza a definição da view (CREATE VIEW), sem processar dados\"], [\"Consulta (SELECT)\", \"O warehouse reexecuta o SELECT completo contra as tabelas de origem\"], [\"Armazenamento\", \"Nenhum dado adicional é gravado, só a query salva\"], [\"Atualização dos dados\", \"Imediata: reflete a origem na consulta seguinte, sem esperar novo dbt run\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma view não guarda dado nenhum, guarda uma pergunta. Toda vez que alguém consulta, o warehouse refaz essa pergunta do zero contra a origem, e é isso que garante o dado sempre atual, ao custo de repetir o processamento a cada leitura."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a materialização padrão de um modelo dbt quando nenhuma é configurada explicitamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "view, que cria uma view no warehouse sem duplicar nenhum dado da origem",
                                "isCorrect": true
                            },
                            {
                                "text": "table, que materializa o modelo como uma tabela física recriada a cada dbt run",
                                "isCorrect": false
                            },
                            {
                                "text": "incremental, que processa só as linhas novas ou alteradas desde o último run",
                                "isCorrect": false
                            },
                            {
                                "text": "ephemeral, que injeta o modelo como um CTE nos modelos que o referenciam",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de staging (`stg_clientes`) faz só renomeação de colunas e um cast de tipos, sem nenhuma agregação, e precisa refletir a fonte imediatamente após qualquer mudança. É consultado por poucos modelos downstream, nunca direto por dashboards. Qual materialização atende melhor esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "table, porque uma tabela física sempre reflete o dado mais atualizado do warehouse",
                                "isCorrect": false
                            },
                            {
                                "text": "view, porque é leve e o dado deve refletir a origem sem esperar um novo run",
                                "isCorrect": true
                            },
                            {
                                "text": "incremental, porque processar só as linhas novas reduz o custo de qualquer staging",
                                "isCorrect": false
                            },
                            {
                                "text": "ephemeral, porque um modelo de staging nunca deveria virar objeto consultável",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista encadeou três modelos view, cada um fazendo joins e agregações sobre o anterior (view sobre view sobre view), e agora um dashboard que consulta o modelo final demora minutos para carregar. Qual é a causa mais provável da lentidão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O warehouse limita quantas views podem existir dentro de um mesmo schema do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Views não suportam joins nem agregações, então cada uma dessas operações roda como subquery lenta",
                                "isCorrect": false
                            },
                            {
                                "text": "A cada consulta do dashboard, o warehouse reprocessa a lógica das três camadas de view empilhadas",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt recompila o SQL das três views a cada consulta feita pelo dashboard ao warehouse",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas equipes de BI apontam para o mesmo modelo view (`stg_pedidos`) e rodam, juntas, cerca de 200 consultas por hora contra ele, cada uma repetindo os mesmos joins e casts. O time de dados quer reduzir o custo de warehouse sem perder o frescor total dos dados. Qual ação é mais coerente com as características da materialização view?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter view e aceitar o custo, pois é a única materialização com frescor imediato garantido",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar para ephemeral, que elimina esse custo injetando a lógica como CTE em cada consulta de BI",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar para incremental, que reduz o custo reprocessando só as linhas alteradas a cada consulta",
                                "isCorrect": false
                            },
                            {
                                "text": "Aceitar perda de frescor e trocar para table, pagando o custo uma vez no run, não a cada consulta",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A tabela de origem que alimenta a view `stg_clientes` teve a coluna `telefone` removida numa migração recente, mas o modelo dbt não foi atualizado e ninguém rodou `dbt run` de novo. A definição da view ainda faz SELECT explícito dessa coluna. O que acontece na próxima vez que alguém consultar `stg_clientes`?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A consulta falha, porque a definição da view referencia uma coluna que não existe mais na origem",
                                "isCorrect": true
                            },
                            {
                                "text": "A consulta funciona normalmente, porque a view guarda uma cópia dos dados no momento da criação",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna telefone aparece com valor nulo em todas as linhas, sem gerar nenhum erro na consulta",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse atualiza a definição da view automaticamente, removendo a coluna telefone sozinha",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "table: rápida de ler",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# table: rápida de ler\n\nA view (aula anterior) guarda uma pergunta e a refaz a cada leitura. A materialização **table** faz o oposto: guarda a resposta. Em vez de salvar só a definição do SELECT, o dbt executa a query e grava o resultado como uma tabela física no warehouse, com os dados fisicamente copiados e prontos para ler."
                    },
                    {
                        "type": "text",
                        "value": "## Como funciona\n\nAo rodar `dbt run` sobre um modelo `materialized='table'`, o dbt executa um `CREATE TABLE AS SELECT` (CTAS) com a lógica do modelo, e o resultado é gravado como uma tabela nova no warehouse (a maioria dos adaptadores cria a tabela num lugar temporário e faz a troca ao final, para não deixar o modelo indisponível durante o rebuild). A partir daí, qualquer consulta lê diretamente os dados já calculados, sem reprocessar o SELECT original."
                    },
                    {
                        "type": "code",
                        "value": "{{ config(materialized='table') }}\n\n-- Marts: pedidos agregados por dia, consultado direto pelo dashboard financeiro\nselect\n    data_pedido,\n    count(*) as total_pedidos,\n    sum(valor_total) as receita_total,\n    avg(valor_total) as ticket_medio\nfrom {{ ref('stg_pedidos') }}\ngroup by data_pedido"
                    },
                    {
                        "type": "text",
                        "value": "## Onde ela brilha\n\n- **Marts consultados com frequência**: uma tabela de métricas aberta o dia inteiro num dashboard não pode pagar o custo do SELECT completo a cada clique de filtro.\n- **Lógica pesada**: joins entre várias tabelas grandes, agregações e window functions compensam ser calculados uma vez no `dbt run` e lidos várias vezes depois.\n- **Muitos consumidores simultâneos**: quando dezenas de analistas ou uma ferramenta de BI consultam o mesmo modelo ao mesmo tempo, ler uma tabela pronta é muito mais barato do que recalcular a mesma lógica em paralelo várias vezes."
                    },
                    {
                        "type": "text",
                        "value": "## O custo fica na escrita\n\nA troca em relação à view é: a table processa tudo de novo a cada `dbt run`, não importa se a origem mudou uma linha ou um milhão. Numa tabela de milhões (ou bilhões) de linhas, refazer o CTAS inteiro todo dia consome tempo de processamento e créditos de warehouse, mesmo quando a maior parte dos dados já estava correta desde ontem. Some a isso o espaço de armazenamento: os dados da table ficam duplicados em relação à origem (e a qualquer staging view por trás dela). Quando esse custo de reprocessar tudo fica alto demais, a resposta costuma ser a materialização incremental, tema da próxima aula."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"view\", \"table\"], [\"Onde o SELECT roda\", \"A cada leitura\", \"Só no dbt run\"], [\"Dado fica armazenado?\", \"Não\", \"Sim, cópia física\"], [\"Velocidade de leitura\", \"Depende da lógica, recalculada sempre\", \"Rápida, dado já pronto\"], [\"Custo do dbt run\", \"Baixo, só cria a definição\", \"Alto, reprocessa tudo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma table troca o custo de leitura pelo custo de escrita: cada dbt run paga o preço de recalcular o modelo inteiro, para que cada consulta depois disso seja barata. Vale a troca quando o modelo é lido muito mais vezes do que é reconstruído."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o dbt executa no warehouse ao rodar `dbt run` sobre um modelo materializado como table?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um CREATE VIEW AS SELECT, guardando apenas a definição da query",
                                "isCorrect": false
                            },
                            {
                                "text": "Um CREATE TABLE AS SELECT, gravando o resultado como dados físicos",
                                "isCorrect": true
                            },
                            {
                                "text": "Um MERGE entre a tabela existente e apenas as linhas novas da origem",
                                "isCorrect": false
                            },
                            {
                                "text": "Um INSERT INTO acrescentando linhas novas à tabela já existente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dashboard financeiro é consultado por dezenas de pessoas ao longo do dia e faz agregações pesadas (joins entre três tabelas grandes e somas por período) sobre um modelo dbt. Hoje esse modelo é uma view, e o dashboard está lento porque cada clique reprocessa os joins do zero. Qual mudança de materialização resolve a lentidão sem trocar a lógica do modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar para ephemeral, para que o modelo seja injetado como CTE direto na consulta do dashboard",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter a view, mas adicionar mais índices nas tabelas de origem consultadas pelos joins",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar para table, para que os joins e as somas sejam calculados uma vez no dbt run",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar para incremental, para que cada consulta do dashboard processe só os dados mais recentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de fatos com 800 milhões de linhas está materializada como table. Todo dia, menos de 0,1% das linhas (as vendas do dia anterior) são novas; o resto já estava certo desde a véspera. Mesmo assim, o dbt run demora quase uma hora processando esse modelo. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A materialização table sempre falha em tabelas com mais de 500 milhões de linhas, por limite do warehouse",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo está usando ref() em vez de source(), o que força o dbt a reler a tabela inteira sempre",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela não tem um teste unique_key configurado, então o dbt não sabe quais linhas já existem",
                                "isCorrect": false
                            },
                            {
                                "text": "A materialização table reprocessa o SELECT inteiro a cada run, mesmo quando quase nada mudou na origem",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo já materializado como table no warehouse é alterado (uma nova coluna calculada é adicionada ao SELECT) e o time roda `dbt run` de novo. O que acontece com a tabela existente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A tabela inteira é reconstruída a partir do novo SELECT, substituindo a versão anterior por completo",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt adiciona só a coluna nova à tabela existente, com ALTER TABLE, preservando as linhas já gravadas",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt bloqueia a execução e pede um --full-refresh explícito antes de aceitar mudanças no SELECT",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela antiga é mantida intacta e uma segunda tabela com sufixo _v2 é criada ao lado dela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O projeto tem `stg_pedidos` (view) e, sobre ele, `fct_pedidos` (table) com agregações pesadas. Um analista afirma que toda consulta a `fct_pedidos` continua pagando o custo de reprocessar `stg_pedidos`, já que um depende do outro no DAG. Essa afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, porque toda table que referencia uma view precisa reabrir essa view a cada consulta feita depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, o custo de stg_pedidos é pago uma vez, durante o CTAS que constrói fct_pedidos no dbt run",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque o dbt grava a dependência entre os dois modelos direto dentro da tabela fct_pedidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque fct_pedidos ignora stg_pedidos no build e lê a fonte original direto pelo source()",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "incremental: só o novo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# incremental: só o novo\n\nA materialização table (aula anterior) resolve a velocidade de leitura, mas reprocessa o modelo inteiro a cada `dbt run`, não importa quantas linhas realmente mudaram. Numa tabela de fatos com centenas de milhões de linhas, onde só uma fração pequena é nova a cada dia, isso desperdiça tempo e créditos de warehouse. A materialização **incremental** ataca exatamente esse problema: em vez de refazer tudo, processa só as linhas novas ou alteradas desde a última execução, e as combina com o que já existe na tabela."
                    },
                    {
                        "type": "text",
                        "value": "## Como funciona\n\nNa primeira execução (ou quando a tabela ainda não existe), um modelo incremental se comporta como uma table comum: roda o SELECT inteiro e materializa todo o histórico. A partir da segunda execução em diante, o dbt usa a macro `is_incremental()` para envolver um trecho do SQL num filtro condicional, que só entra em vigor quando a tabela de destino já existe, o modelo está configurado como incremental e a execução não foi disparada com `--full-refresh`. Fora dessas condições, `is_incremental()` retorna falso e o filtro é simplesmente ignorado, então o modelo volta a processar tudo, como na primeira vez."
                    },
                    {
                        "type": "code",
                        "value": "{{\n  config(\n    materialized='incremental',\n    unique_key='pedido_id'\n  )\n}}\n\nselect\n    pedido_id,\n    cliente_id,\n    valor_total,\n    status,\n    atualizado_em\nfrom {{ source('vendas', 'pedidos') }}\n\n{% if is_incremental() %}\n-- Este filtro só entra no SQL a partir da segunda execução em diante:\n-- processa apenas pedidos alterados depois do último valor já gravado\nwhere atualizado_em > (select max(atualizado_em) from {{ this }})\n{% endif %}"
                    },
                    {
                        "type": "text",
                        "value": "## unique_key: o que fazer com o que já existe\n\nFiltrar as linhas novas resolve só metade do problema: o dbt também precisa saber o que fazer quando uma dessas linhas já tem uma versão anterior na tabela de destino, por exemplo um pedido que mudou de status depois de já ter sido carregado. É para isso que serve o `unique_key`: ele diz ao dbt qual coluna (ou combinação de colunas) identifica um registro de forma única, para que a linha nova substitua a antiga em vez de virar uma duplicata.\n\nSem `unique_key`, a estratégia incremental padrão tende a só inserir as linhas retornadas pelo filtro, sem checar se elas já existem, o que reproduz o mesmo risco de duplicação de um append cego quando uma linha \"nova\" é, na verdade, a atualização de uma linha antiga."
                    },
                    {
                        "type": "text",
                        "value": "## O cuidado com dados atrasados\n\nO filtro `where atualizado_em > (select max(atualizado_em) from {{ this }})` parte de uma suposição: que os dados chegam na origem em ordem, sem atraso. Na prática isso nem sempre é verdade. Um evento pode ser gravado na origem horas ou dias depois de acontecer (atraso de rede, um sistema batch que consolida no fim do dia, uma correção manual num registro antigo), com uma data de referência anterior ao maior `atualizado_em` que o filtro já considerou como processado. Se isso acontecer, a linha atrasada nunca entra no filtro, e o dado fica faltando na tabela de destino de forma silenciosa, sem nenhum erro para avisar.\n\nA mitigação mais comum é abrir uma janela de reprocessamento (lookback), revisitando por exemplo os últimos dias a cada run, em vez de só o que é estritamente mais novo que o máximo já gravado. Como o `unique_key` já cuida do merge, reprocessar uma janela que inclui linhas já existentes não gera duplicata, só garante que atualizações atrasadas dentro dessa janela sejam capturadas. Um `dbt run --full-refresh` periódico, reconstruindo a tabela inteira, é o reforço final contra qualquer drift acumulado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"is_incremental()\"], [\"Primeira execução, tabela ainda não existe\", \"Falso, roda o SELECT completo\"], [\"Execução normal, tabela já existe\", \"Verdadeiro, aplica o filtro incremental\"], [\"Execução com a flag --full-refresh\", \"Falso, reconstrói a tabela inteira\"], [\"Modelo não está configurado como incremental\", \"Falso, a macro não se aplica\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "incremental não é sobre nunca reprocessar tudo, é sobre reprocessar só o necessário na maioria das vezes. O ganho de custo vem daí: uma tabela de bilhões de linhas paga o preço cheio uma vez, e depois só paga pelo que realmente mudou, run após run."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a macro `is_incremental()` permite fazer dentro de um modelo dbt materializado como incremental?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Definir automaticamente qual coluna deve ser usada como unique_key na configuração do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear a execução do modelo até que a tabela de destino tenha pelo menos uma linha gravada",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar um filtro condicional que só processa as linhas novas ou alteradas desde o último run",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir a necessidade de rodar dbt run, processando o modelo direto na leitura pela ferramenta de BI",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela incremental de pedidos usa o filtro `where atualizado_em > (select max(atualizado_em) from {{ this }})`, mas o modelo não tem `unique_key` configurado. Um pedido já carregado teve o status alterado, e seu `atualizado_em` foi atualizado na origem. O que acontece na tabela de destino após o próximo `dbt run`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O pedido é ignorado pelo filtro incremental, porque seu pedido_id já existe na tabela de destino",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt run falha com erro, porque a ausência de unique_key é obrigatória em modelos incrementais",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt identifica que o pedido_id já existe e atualiza a linha, mesmo sem unique_key configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma nova linha para o mesmo pedido é inserida, e a tabela passa a ter duas linhas para esse pedido",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo é configurado como `materialized='incremental'` pela primeira vez, num projeto onde essa tabela nunca existiu antes no warehouse. Ao rodar `dbt run`, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O bloco dentro de is_incremental() é ignorado, e o modelo roda o SELECT completo, como uma table",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt recusa a execução, porque modelos incrementais exigem que a tabela de destino já exista",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt cria a tabela vazia primeiro, e o filtro incremental é aplicado já na primeira execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a primeira linha retornada pelo SELECT é carregada, e o restante espera o próximo run",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela incremental de eventos usa `where evento_em > (select max(evento_em) from {{ this }})` e tem `unique_key` configurado. O time percebe que eventos corrigidos manualmente pela equipe de suporte, com `evento_em` de dias atrás, nunca aparecem na tabela de destino, mesmo depois de várias execuções. Qual mudança resolve esse problema sem exigir `--full-refresh` a cada run?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar a coluna do filtro de evento_em para pedido_id, comparando pelo identificador do evento",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir uma janela de reprocessamento no filtro, revisitando por exemplo os últimos dias já gravados",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover o unique_key do modelo, para que qualquer linha retornada pelo filtro seja sempre inserida",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar o modelo como ephemeral, para que ele seja reprocessado por completo a cada referência",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro suspeita que a tabela incremental de pedidos acumulou inconsistências ao longo de meses (por causa de janelas de atraso não capturadas antes de uma correção recente no filtro). Qual comando reconstrói a tabela inteira do zero, reaplicando o SELECT completo do modelo, sem alterar a configuração do modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dbt run --incremental, que reprocessa todo o histórico ignorando o filtro configurado",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt seed, que recarrega os dados de origem e reconstrói todos os modelos dependentes",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt run --full-refresh, que força a reconstrução completa mesmo em modelos incrementais",
                                "isCorrect": true
                            },
                            {
                                "text": "dbt run, repetido três vezes seguidas, até que o filtro capture todo o histórico faltante",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ephemeral: um CTE reutilizável",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ephemeral: um CTE reutilizável\n\nAs três materializações anteriores (view, table, incremental) sempre criam algum objeto no warehouse: uma view, uma tabela, ou uma tabela atualizada incrementalmente. A materialização **ephemeral** é a exceção: `materialized='ephemeral'` não cria view, não cria tabela, não cria nada consultável no warehouse. O modelo existe só dentro do projeto dbt, como um passo intermediário de lógica."
                    },
                    {
                        "type": "text",
                        "value": "## Como funciona\n\nQuando um modelo `B` faz `ref('A')` e `A` é ephemeral, o dbt não gera uma referência de tabela ou view para `A` no SQL compilado de `B`. Em vez disso, o dbt pega o SELECT compilado de `A` inteiro e injeta como uma CTE (`with a as (...)`) no topo do SQL de `B`, trocando `ref('A')` pelo nome dessa CTE. O warehouse nunca vê o modelo `A` como um objeto separado, só vê a query final de `B`, já com a lógica de `A` embutida dentro dela."
                    },
                    {
                        "type": "code",
                        "value": "-- models/intermediate/int_pedidos_validos.sql\n{{ config(materialized='ephemeral') }}\n\nselect *\nfrom {{ ref('stg_pedidos') }}\nwhere status != 'cancelado'\n  and valor_total > 0\n\n-- models/marts/fct_receita_diaria.sql\nselect\n    data_pedido,\n    sum(valor_total) as receita_total\nfrom {{ ref('int_pedidos_validos') }}\ngroup by data_pedido\n\n-- SQL compilado de fct_receita_diaria (aproximado): int_pedidos_validos\n-- não existe como tabela nem view, vira uma CTE dentro da própria query\n-- with int_pedidos_validos as (\n--     select * from staging.stg_pedidos\n--     where status != 'cancelado' and valor_total > 0\n-- )\n-- select data_pedido, sum(valor_total) as receita_total\n-- from int_pedidos_validos\n-- group by data_pedido"
                    },
                    {
                        "type": "text",
                        "value": "## Onde ela brilha\n\n- **Lógica intermediária leve**: um filtro, uma renomeação, um cálculo simples que existe só para deixar outro modelo mais legível, sem merecer virar um objeto próprio no warehouse.\n- **Reuso sem objeto extra**: se dois ou três modelos precisam da mesma lógica de filtro, um ephemeral evita copiar e colar o mesmo SQL em cada um, mantendo a regra escrita uma única vez.\n- **Warehouse mais limpo**: nenhuma view ou tabela extra aparece no schema só para representar um passo de transformação que ninguém consulta diretamente. Isso reduz ruído tanto no warehouse quanto na navegação do `dbt docs`."
                    },
                    {
                        "type": "text",
                        "value": "## O que se perde\n\nA principal limitação é literal: um modelo ephemeral não pode ser consultado direto, porque não existe como objeto no warehouse. Não dá para abrir uma ferramenta de BI, ou rodar um `SELECT * FROM` no schema, e olhar os dados desse modelo isolado, ele só existe embutido dentro de quem o referencia.\n\nO outro cuidado é o reuso em cadeia: se vários modelos fazem `ref()` do mesmo ephemeral, a lógica dele é recompilada e injetada em cada um deles, sem ser calculada uma vez só. Encadear vários modelos ephemeral um sobre o outro empilha CTEs dentro do SQL compilado final, o que deixa a query mais longa e mais difícil de debugar quando algo dá errado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Materialização\", \"Objeto no warehouse\", \"Dá para consultar direto\", \"Quando roda o SELECT\"], [\"view\", \"View\", \"Sim\", \"A cada leitura\"], [\"table\", \"Tabela física\", \"Sim\", \"No dbt run, sempre completo\"], [\"incremental\", \"Tabela física\", \"Sim\", \"No dbt run, só o novo ou alterado\"], [\"ephemeral\", \"Nenhum\", \"Não, só embutido em quem referencia\", \"Quando o modelo que a referencia é construído\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "ephemeral não elimina o processamento, só elimina o objeto. A lógica ainda roda, só que embutida dentro de quem a referencia, sem deixar rastro consultável no warehouse."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a materialização `ephemeral` cria no warehouse quando o dbt executa o modelo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma tabela temporária, apagada automaticamente ao final de cada execução do dbt run",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma view, que recalcula a lógica do modelo a cada consulta feita por quem a referencia",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela física idêntica à da materialização table, mas armazenada em um schema separado",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum objeto: a lógica é injetada como CTE dentro do SQL dos modelos que a referenciam",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo `int_clientes_ativos` (ephemeral) é referenciado por `ref()` em três marts diferentes. O que acontece com a lógica desse modelo no SQL compilado de cada um dos três marts?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela é injetada como CTE, de forma independente, dentro do SQL compilado de cada um dos três marts",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela é calculada uma única vez num objeto compartilhado, e os três marts leem esse mesmo resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é ignorada nos dois últimos marts, porque um modelo ephemeral só pode ser referenciado uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é convertida automaticamente em view na segunda referência, para evitar recompilar o SQL de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista quer investigar os dados de um modelo ephemeral chamado `int_pedidos_validos`, rodando um `SELECT * FROM int_pedidos_validos` direto no editor SQL do warehouse. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A consulta retorna vazio, porque modelos ephemeral são recriados a cada acesso, sempre sem linhas",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta falha, porque não existe view nem tabela com esse nome no warehouse para ser encontrada",
                                "isCorrect": true
                            },
                            {
                                "text": "A consulta funciona normalmente, porque todo modelo dbt vira um objeto consultável, mudando só o custo",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta funciona, mas só retorna as linhas que já foram lidas por algum modelo downstream antes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto encadeia quatro modelos ephemeral, um referenciando o outro (int_a, int_b, int_c, int_d), até chegar a um mart final que faz `ref('int_d')`. Um erro de SQL aparece só na execução do mart final. Qual é a dificuldade adicional de depurar esse erro, específica do uso de ephemeral em cadeia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O erro não indica linha nem mensagem alguma, porque modelos ephemeral suprimem toda mensagem de erro do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt não permite encadear modelos ephemeral, então esse projeto não chegaria a compilar de jeito nenhum",
                                "isCorrect": false
                            },
                            {
                                "text": "O SQL que efetivamente roda no warehouse é uma única query grande, com as quatro CTEs empilhadas dentro dela",
                                "isCorrect": true
                            },
                            {
                                "text": "O erro sempre aponta para int_a, o primeiro da cadeia, mesmo quando o problema está em outro CTE",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo intermediário de deduplicação de clientes precisa, além de alimentar dois marts, também ser consultado ocasionalmente por um analista direto no editor SQL do warehouse, para investigar casos duvidosos. Qual materialização NÃO atende esse segundo requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "table, porque a materialização table nunca grava um objeto físico, só mantém a definição da query",
                                "isCorrect": false
                            },
                            {
                                "text": "incremental, porque a tabela incremental permanece bloqueada para leitura durante todo o dbt run",
                                "isCorrect": false
                            },
                            {
                                "text": "view, porque uma view não armazena dado nenhum e por isso nunca pode ser lida por fora do dbt",
                                "isCorrect": false
                            },
                            {
                                "text": "ephemeral, porque não existe view nem tabela criada para esse modelo no warehouse",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escolher a materialização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Escolher a materialização\n\nAs quatro aulas anteriores mostraram cada materialização isoladamente: view, table, incremental e ephemeral. Na prática, escolher entre elas não é uma questão de qual é \"melhor\", e sim de qual equilíbrio faz sentido para aquele modelo específico, entre três forças que puxam em direções opostas: **custo** de processamento, **frescor** do dado e **complexidade** de manter."
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off entre custo, frescor e complexidade\n\n- **view**: custo de escrita quase zero (só grava a definição), frescor máximo (reflete a origem a cada leitura), complexidade mínima. O custo reaparece na leitura, multiplicado por cada consulta.\n- **table**: custo de escrita alto e constante (reprocessa tudo a cada dbt run), frescor limitado à última execução, complexidade mínima. Em compensação, a leitura fica barata e rápida.\n- **incremental**: o melhor custo em escala (processa só o que mudou), frescor também limitado à última execução, mas com a maior complexidade de configurar e manter (o filtro do is_incremental(), o unique_key, o cuidado com dados atrasados).\n- **ephemeral**: não entra nessa mesma balança de custo de warehouse, porque não é lido diretamente, é reuso de lógica sem gerar objeto. A decisão para ela é sobre organização do projeto, não sobre desempenho de leitura."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Materialização\", \"Custo de escrita\", \"Frescor\", \"Complexidade\"], [\"view\", \"Muito baixo\", \"Sempre atual\", \"Baixa\"], [\"table\", \"Alto, a cada run\", \"Da última execução\", \"Baixa\"], [\"incremental\", \"Baixo após o primeiro run\", \"Da última execução\", \"Alta\"], [\"ephemeral\", \"Nenhum objeto gerado\", \"Não se aplica, sem leitura direta\", \"Baixa a média\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A regra prática\n\nUma regra de bolso cobre a maioria dos casos, e serve como ponto de partida, não como lei fixa:\n\n- **Staging = view**: modelos `stg_` são numerosos, leves (renomear, tipar, limpar) e servem de base para tudo depois. Frescor barato importa mais do que velocidade de leitura, porque raramente são consultados direto por um dashboard.\n- **Marts muito consultados = table**: um modelo de métricas aberto o dia inteiro numa ferramenta de BI compensa pagar o custo do dbt run para deixar cada leitura rápida.\n- **Fatos grandes = incremental**: quando o volume cresce a ponto de o dbt run de uma table ficar caro ou lento, e só uma fração dos dados muda a cada execução, o custo extra de manter o filtro incremental compensa.\n- **Lógica intermediária leve e reutilizada = ephemeral**: um passo de transformação que existe só para organizar o SQL, sem valor em ser consultado sozinho.\n\nEsses padrões mudam com o tempo: um modelo de staging que passa a ser consultado direto por vários times pode migrar para table, e uma table que cresceu demais pode virar incremental. A escolha inicial não é definitiva."
                    },
                    {
                        "type": "code",
                        "value": "# dbt_project.yml: define um padrão de materialização por pasta\nmodels:\n  meu_projeto:\n    staging:\n      +materialized: view\n    marts:\n      +materialized: table\n      fatos:\n        +materialized: incremental\n\n-- models/staging/stg_taxas_cambio.sql\n-- Exceção: essa staging é consultada direto por várias ferramentas de BI,\n-- então sobrescreve o padrão da pasta (view) para table\n{{ config(materialized='table') }}\n\nselect\n    moeda_origem,\n    moeda_destino,\n    taxa,\n    data_referencia\nfrom {{ source('financeiro', 'taxas_cambio') }}"
                    },
                    {
                        "type": "text",
                        "value": "## Onde configurar: modelo x dbt_project.yml\n\nA materialização pode ser definida em dois lugares, e os dois convivem:\n\n- **`dbt_project.yml`**: define um padrão por pasta (`+materialized: view` para tudo em `staging/`, por exemplo). É a forma mais prática de manter consistência num projeto com dezenas ou centenas de modelos, sem repetir a mesma config em cada arquivo.\n- **`{{ config(...) }}` no modelo**: sobrescreve o padrão da pasta só para aquele modelo específico. Serve para as exceções, como uma staging que virou table por ser muito consultada, ou um mart que virou incremental por causa do volume.\n\nA prioridade é do modelo: se o `dbt_project.yml` diz view para a pasta inteira e um modelo tem `{{ config(materialized='table') }}` no próprio arquivo, esse modelo específico é uma table, o resto da pasta continua view."
                    },
                    {
                        "type": "quote",
                        "value": "Não existe materialização certa em abstrato, só a que equilibra custo, frescor e complexidade para aquele modelo, naquele volume de dados, com aquele padrão de consulta. A regra prática é o ponto de partida, revisar conforme o projeto cresce é parte do trabalho do analytics engineer."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das quatro materializações do dbt costuma ser a escolha padrão para a camada de staging, onde os modelos são leves e numerosos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "view, porque a lógica é leve e o baixo custo de escrita compensa o frescor imediato dos dados",
                                "isCorrect": true
                            },
                            {
                                "text": "table, porque staging é a camada mais consultada por dashboards de BI em qualquer projeto dbt",
                                "isCorrect": false
                            },
                            {
                                "text": "incremental, porque staging processa o maior volume de dados entre todas as camadas do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "ephemeral, porque staging nunca precisa ser consultada por nenhum modelo downstream depois dela",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de staging simples (`stg_produtos`) passou a ser consultado direto por três ferramentas de BI diferentes, várias vezes por hora, além de alimentar dois marts. Hoje ele é view e os times reclamam de lentidão nos relatórios. Qual ajuste é mais coerente com a regra prática de materialização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mover a lógica desse modelo para dentro de cada mart que o referencia, eliminando o ref() direto",
                                "isCorrect": false
                            },
                            {
                                "text": "Sobrescrever esse modelo para table, já que agora ele tem um padrão de leitura pesado e frequente",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter como view, porque staging deve permanecer view independente do padrão de consulta observado",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar para ephemeral, para que a lógica seja embutida direto nas ferramentas de BI que o consultam",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um `dbt_project.yml` define `+materialized: view` para toda a pasta `marts/`, mas o arquivo `fct_vendas.sql` tem `{{ config(materialized='incremental', unique_key='venda_id') }}` no topo. Como esse modelo é materializado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como view, porque a configuração no dbt_project.yml tem prioridade sobre a do modelo",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt run falha, porque um modelo não pode ter uma config diferente da pasta em que está",
                                "isCorrect": false
                            },
                            {
                                "text": "Como incremental, porque a configuração dentro do modelo sobrescreve o padrão da pasta",
                                "isCorrect": true
                            },
                            {
                                "text": "Como table, porque configs conflitantes entre modelo e projeto sempre caem no padrão do dbt",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de fatos recebe 5 mil linhas novas por dia, tem 300 mil linhas no total, e o dbt run atual (table completa) demora 40 segundos. Um engenheiro sugere migrar para incremental para \"economizar custo\". Qual é a consideração mais importante antes de fazer essa mudança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Migrar sempre compensa, porque incremental é estritamente mais barato que table em qualquer volume",
                                "isCorrect": false
                            },
                            {
                                "text": "incremental só funciona corretamente em tabelas com mais de 1 milhão de linhas, então esse caso não se aplica",
                                "isCorrect": false
                            },
                            {
                                "text": "A migração é obrigatória, porque nenhum projeto dbt em produção deveria ter modelos table de fatos",
                                "isCorrect": false
                            },
                            {
                                "text": "O ganho de custo pode não compensar a complexidade extra, quando a table atual já roda rápido e barata",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está decidindo a materialização de um modelo intermediário que só existe para filtrar linhas inválidas antes de dois marts, e nunca é consultado diretamente por ninguém fora do projeto dbt. O volume de dados é pequeno e o custo de processamento não é a preocupação principal. Qual materialização é mais coerente com esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ephemeral, porque a lógica é leve, reutilizada só dentro do projeto, e não precisa virar objeto algum",
                                "isCorrect": true
                            },
                            {
                                "text": "table, para garantir que o filtro fique fisicamente armazenado e disponível para consulta futura",
                                "isCorrect": false
                            },
                            {
                                "text": "incremental, porque qualquer modelo intermediário deve evitar reprocessar dados desnecessariamente",
                                "isCorrect": false
                            },
                            {
                                "text": "view, porque modelos intermediários devem sempre ficar visíveis como objeto no schema do warehouse",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Testes, documentação e qualidade no dbt",
        "aulas": [
            {
                "titulo": "Testes genéricos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testes genéricos\n\nUm modelo dbt é um SELECT, e um SELECT sozinho não avisa quando o resultado está errado. Uma coluna que deveria ser única pode passar a ter duplicatas depois que a fonte muda um comportamento, uma chave estrangeira pode apontar para um cliente que não existe mais, um status pode chegar com um valor novo que ninguém mapeou. Sem teste, esse tipo de problema só aparece quando alguém do negócio desconfia de um número no dashboard.\n\nO dbt resolve isso com testes que rodam como parte do próprio projeto, declarados em YAML, sem precisar escrever uma linha de SQL para os casos mais comuns. São os testes genéricos: `unique`, `not_null`, `accepted_values` e `relationships`, os quatro testes que já vêm prontos no dbt Core."
                    },
                    {
                        "type": "text",
                        "value": "## Os quatro testes genéricos\n\nCada teste genérico verifica uma afirmação específica sobre uma coluna:\n\n- **`unique`**: nenhum valor se repete na coluna, o teste natural para uma chave primária, como `order_id` numa tabela de pedidos.\n- **`not_null`**: a coluna nunca vem vazia, essencial em chaves e em qualquer campo que uma métrica soma ou agrupa.\n- **`accepted_values`**: o valor da coluna está sempre dentro de uma lista fechada, como `status` só podendo ser `pending`, `shipped` ou `cancelled`.\n- **`relationships`**: todo valor da coluna existe como valor de referência em outro modelo, a checagem clássica de integridade referencial.\n\nOs quatro são declarados sob a coluna, dentro do `schema.yml` que descreve o modelo."
                    },
                    {
                        "type": "code",
                        "value": "models:\n  - name: stg_orders\n    columns:\n      - name: order_id\n        tests:\n          - unique\n          - not_null\n      - name: status\n        tests:\n          - accepted_values:\n              values: ['pending', 'shipped', 'cancelled']\n      - name: customer_id\n        tests:\n          - not_null\n          - relationships:\n              to: ref('stg_customers')\n              field: customer_id"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Teste genérico\",\"O que verifica\"],[\"unique\",\"Nenhum valor se repete na coluna\"],[\"not_null\",\"A coluna não tem nenhum valor nulo\"],[\"accepted_values\",\"O valor está dentro de uma lista fixa permitida\"],[\"relationships\",\"Todo valor existe como referência em outro modelo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Rodando os testes\n\nO comando `dbt test` executa todos os testes declarados no projeto. Para rodar só os de um modelo, `dbt test --select stg_orders`. Cada teste genérico vira, por trás, uma consulta que conta quantas linhas violam a condição: zero linhas é `PASS`, uma ou mais é `FAIL`.\n\nPor padrão, uma falha marca o teste como erro. Quando o time quer só ser avisado, sem travar o build por causa de um caso que ainda não virou prioridade, dá para configurar a severidade desse teste como `warn` no lugar de `error`.\n\nComo testes e modelos moram no mesmo grafo de dependências, `dbt build` constrói e testa cada modelo na ordem certa, um depois do outro, em vez de rodar tudo primeiro para só testar no final."
                    },
                    {
                        "type": "code",
                        "value": "$ dbt test --select stg_orders\n\n1 of 4 START test not_null_stg_orders_order_id ......... [RUN]\n1 of 4 PASS not_null_stg_orders_order_id ................ [PASS in 0.41s]\n2 of 4 START test unique_stg_orders_order_id ............ [RUN]\n2 of 4 PASS unique_stg_orders_order_id .................. [PASS in 0.38s]\n3 of 4 START test accepted_values_stg_orders_status ..... [RUN]\n3 of 4 FAIL 2 accepted_values_stg_orders_status ......... [FAIL 2 in 0.35s]\n4 of 4 START test relationships_stg_orders_customer_id .. [RUN]\n4 of 4 PASS relationships_stg_orders_customer_id ......... [PASS in 0.44s]\n\nCompleted with 1 error and 0 warnings"
                    },
                    {
                        "type": "quote",
                        "value": "Um teste genérico não substitui a modelagem, ele confirma que uma suposição sobre o dado continua verdadeira a cada execução do pipeline."
                    }
                ],
                "questions": [
                    {
                        "statement": "No dbt, o teste genérico `unique` aplicado à coluna `order_id` verifica o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se o order_id nunca se repete entre as linhas do modelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se o order_id nunca aparece vazio em nenhuma linha do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o order_id está sempre dentro de uma lista de valores aceitos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o order_id existe como referência em outro modelo do projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela stg_pedidos tem a coluna customer_id, e o time quer garantir que todo pedido aponte para um cliente que realmente existe em stg_clientes. Qual teste genérico resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "unique, aplicado à customer_id de stg_pedidos, para impedir que o mesmo cliente apareça duas vezes.",
                                "isCorrect": false
                            },
                            {
                                "text": "relationships, aplicado à customer_id de stg_pedidos, apontando para o customer_id de stg_clientes.",
                                "isCorrect": true
                            },
                            {
                                "text": "not_null, aplicado à customer_id de stg_pedidos, para impedir que o campo fique vazio em algum pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "accepted_values, aplicado à customer_id de stg_pedidos, com a lista de clientes ativos no momento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de pedidos historicamente só usava os status pending, shipped e cancelled no accepted_values de status. A origem passou a emitir um novo status, returned, sem avisar ninguém. O que acontece na próxima execução de dbt test?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O teste accepted_values de status é ignorado, porque esse teste só falha quando um valor conhecido some da lista.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo stg_orders para de compilar, porque o SELECT rejeita qualquer valor fora da lista de status.",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste accepted_values de status passa a falhar, sinalizando o valor returned que ainda não está na lista.",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo schema.yml é atualizado automaticamente pelo dbt, incluindo returned na lista de valores aceitos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao rodar dbt test, o teste relationships aplicado a customer_id de stg_pedidos falha e aponta 12 linhas problemáticas. O que essas 12 linhas representam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "12 clientes de stg_clientes que ainda não têm nenhum pedido em stg_pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "12 pedidos com o mesmo customer_id repetido mais de uma vez em stg_pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "12 pedidos com o campo customer_id vazio, sem nenhum valor preenchido.",
                                "isCorrect": false
                            },
                            {
                                "text": "12 pedidos cujo customer_id não existe entre os valores de stg_clientes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O time decidiu que o teste not_null na coluna telefone de stg_clientes deve alertar quando falhar, mas sem quebrar o dbt build, já que telefone é opcional para clientes antigos. Qual configuração aplica esse comportamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Configurar a severidade desse teste como warn, para ele reportar como aviso em vez de quebrar o build.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar not_null por unique na mesma coluna, para o teste falhar só em caso de duplicidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o teste do schema.yml e acompanhar os nulos manualmente pelo dashboard de BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar a severidade desse teste como error, para o dbt test sempre interromper o build ao falhar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testes singulares",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testes singulares\n\nNem toda regra de negócio cabe em `unique`, `not_null`, `accepted_values` ou `relationships`. Como garantir que o valor total de um pedido é igual à soma dos seus itens? Que a receita de uma linha nunca fica negativa? Que a data de um pedido nunca é posterior à data de hoje? Essas são comparações entre colunas, entre modelos, ou cálculos que um teste genérico de coluna não expressa.\n\nPara esses casos existe o teste singular: um arquivo `.sql` dentro da pasta `tests/`, escrito à mão, que aplica exatamente a mesma lógica de um modelo comum, um SELECT com `ref()` e `source()`."
                    },
                    {
                        "type": "text",
                        "value": "## A regra do teste singular\n\nUm teste singular é um SELECT que não deveria retornar nenhuma linha. O dbt roda a query, e se ela devolver zero linhas, o teste passa. Se devolver uma ou mais linhas, o teste falha, e cada linha retornada é um registro que quebrou a regra, útil para investigar o problema depois.\n\nNão existe sintaxe especial: é só escrever a consulta que encontraria os casos ruins, o oposto do que a regra permite. Se a regra é \"o total do pedido bate com a soma dos itens\", o teste seleciona os pedidos em que isso não acontece."
                    },
                    {
                        "type": "code",
                        "value": "-- tests/assert_total_pedido_bate_com_itens.sql\n-- Falha se existir pedido cujo total declarado diverge da soma dos itens\n\nselect\n    p.order_id,\n    p.total_pedido,\n    sum(i.valor_item) as total_calculado\nfrom {{ ref('stg_orders') }} p\njoin {{ ref('stg_order_items') }} i on i.order_id = p.order_id\ngroup by p.order_id, p.total_pedido\nhaving abs(p.total_pedido - sum(i.valor_item)) > 0.01"
                    },
                    {
                        "type": "code",
                        "value": "-- tests/assert_receita_nao_negativa.sql\n-- Falha se existir alguma linha de receita menor que zero\n\nselect *\nfrom {{ ref('fct_receita') }}\nwhere valor_receita < 0"
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher cada um\n\nTestes genéricos cobrem a maior parte do dia a dia porque são rápidos de declarar, uma linha de YAML por coluna, e cobrem os casos mais comuns: unicidade, nulo, domínio de valores, integridade referencial. O teste singular entra quando a regra envolve mais de uma coluna, mais de um modelo, um cálculo, ou uma condição específica do negócio que nenhum teste genérico consegue expressar sozinho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Teste genérico\",\"Teste singular\"],[\"Onde é declarado\",\"No schema.yml, sob a coluna\",\"Um arquivo .sql na pasta tests/\"],[\"Como é escrito\",\"Nome do teste mais parâmetros em YAML\",\"Um SELECT completo, em SQL\"],[\"Bom para\",\"Regras comuns de uma coluna isolada\",\"Regras de negócio específicas, entre colunas ou modelos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um teste singular é uma pergunta que só devia ter uma resposta possível: nenhuma linha. Toda vez que aparece uma linha, a realidade quebrou a regra que alguém do time decidiu proteger."
                    }
                ],
                "questions": [
                    {
                        "statement": "Sobre um teste singular no dbt, arquivo .sql dentro de tests/, o que determina se ele passa ou falha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O teste falha sempre que a query demora mais que um limite de tempo configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste passa quando a query não retorna nenhuma linha, e falha quando retorna alguma.",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste passa quando a query retorna ao menos uma linha, confirmando a regra aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste falha somente quando a query lança um erro de sintaxe ao ser compilada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista quer garantir que, em fct_pedidos, a soma dos itens de cada pedido em fct_itens_pedido sempre bate com o total_pedido registrado. Qual é a forma correta de implementar essa checagem no dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um teste accepted_values na coluna total_pedido, listando os totais válidos permitidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste relationships entre total_pedido e a coluna valor_item de fct_itens_pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste singular que soma os itens por pedido e seleciona os casos em que o total diverge.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um teste not_null na coluna total_pedido, para impedir que o campo fique vazio em algum pedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar dbt test, o teste singular assert_receita_nao_negativa retornou 3 linhas. O que isso significa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O teste passou, e as 3 linhas são um resumo estatístico do resultado da checagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A query do teste tem um erro de sintaxe, e as 3 linhas mostram onde o erro ocorreu.",
                                "isCorrect": false
                            },
                            {
                                "text": "Existem 3 modelos no projeto que dependem de fct_receita e podem estar afetados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Existem 3 linhas em fct_receita cujo valor_receita ficou menor que zero.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma regra de negócio diz que a data_pedido nunca pode ser posterior à data de hoje. Por que essa checagem exige um teste singular, e não um teste genérico como accepted_values?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque accepted_values exige uma lista fixa de valores, e essa regra depende de um cálculo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque accepted_values só pode ser aplicado a colunas numéricas, e data_pedido é do tipo data.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque accepted_values exige que a coluna testada seja a chave primária do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque accepted_values não pode ser combinado com not_null na mesma coluna do modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste singular chamado assert_pedidos_sem_cliente_orfao.sql foi criado em tests/ e usa ref('stg_orders') e ref('stg_customers') dentro do mesmo SELECT, com um join entre os dois. Isso é uma prática válida no dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, testes singulares só podem referenciar um único modelo por arquivo, nunca dois com join.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, um teste singular usa ref() e source() como um modelo, e entra no grafo de dependências.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, ref() e source() só funcionam dentro da pasta models/, nunca dentro de tests/.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas apenas se o arquivo for registrado manualmente na lista de testes do dbt_project.yml.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Documentação e o dbt docs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Documentação e o dbt docs\n\nUm modelo dbt pronto, testado e rodando em produção ainda pode ser inútil para quem chega depois, se ninguém souber o que uma coluna significa, de onde vêm os números de fct_receita, ou por que um filtro específico existe no meio do SELECT. Documentação não é um extra: é a diferença entre um projeto que qualquer pessoa do time consegue navegar e um projeto que só quem escreveu entende.\n\nO dbt trata documentação como parte do mesmo arquivo YAML que já declara os testes, e gera um site navegável a partir dela, sem precisar manter um documento separado que desatualiza sozinho."
                    },
                    {
                        "type": "text",
                        "value": "## description no schema.yml\n\nCada modelo e cada coluna podem receber uma `description` no `schema.yml`. A descrição do modelo explica o propósito dele, o que representa uma linha, para que serve; a descrição de cada coluna explica o significado do campo, principalmente quando o nome sozinho não é óbvio, como status, tipo ou códigos internos do negócio.\n\nEssas descrições aceitam markdown, e viram parte do artefato que o dbt compila: aparecem no site de documentação exatamente como foram escritas."
                    },
                    {
                        "type": "code",
                        "value": "models:\n  - name: stg_orders\n    description: 'Um pedido por linha, já limpo e renomeado a partir da fonte bruta de vendas.'\n    columns:\n      - name: order_id\n        description: 'Identificador único do pedido, chave primária do modelo.'\n        tests:\n          - unique\n          - not_null\n      - name: status\n        description: 'Situação atual do pedido: pending, shipped ou cancelled.'\n        tests:\n          - accepted_values:\n              values: ['pending', 'shipped', 'cancelled']"
                    },
                    {
                        "type": "text",
                        "value": "## dbt docs generate e dbt docs serve\n\n`dbt docs generate` compila a documentação do projeto: lê as descriptions do schema.yml, os testes declarados, o SQL de cada modelo, bruto e compilado, e consulta o warehouse para trazer metadados reais, como o tipo de cada coluna. O resultado vira um site estático.\n\n`dbt docs serve` sobe um servidor local para navegar nesse site pelo navegador, sem precisar publicar nada externamente só para conferir o resultado."
                    },
                    {
                        "type": "code",
                        "value": "$ dbt docs generate\nDocumentação compilada: 24 modelos, 3 seeds, 2 snapshots\n\n$ dbt docs serve\nServindo o site de documentação em http://localhost:8080"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Seção do site\",\"O que mostra\"],[\"Overview de cada modelo\",\"Description do modelo, colunas, tipos e descriptions de cada coluna\"],[\"Grafo de linhagem (DAG)\",\"Todas as dependências via ref() e source(), navegável visualmente\"],[\"Testes\",\"Quais testes genéricos e singulares cobrem cada coluna ou modelo\"],[\"Código\",\"O SQL bruto escrito e o SQL compilado, pronto para rodar no warehouse\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O site de documentação não é escrito à parte, ele nasce do mesmo schema.yml que já declara os testes: documentar deixa de ser tarefa extra e vira parte de terminar o modelo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando dbt docs generate faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Roda todos os testes genéricos e singulares do projeto, gerando um relatório de cobertura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Materializa os modelos no warehouse, criando as tabelas e views do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compila a documentação do projeto: descriptions, testes e metadados do warehouse, num site.",
                                "isCorrect": true
                            },
                            {
                                "text": "Publica o projeto dbt num repositório remoto, versionando as mudanças automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista roda dbt docs generate e depois quer navegar pelo site no navegador, sem publicar nada externamente. Qual comando ele usa em seguida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "dbt run, para materializar os modelos antes de qualquer visualização ser possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt build, para rodar modelos e testes juntos antes de abrir a documentação.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt test, para validar que a documentação gerada não tem nenhum erro de sintaxe.",
                                "isCorrect": false
                            },
                            {
                                "text": "dbt docs serve, que sobe um servidor local para navegar pelo site já compilado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo mart_receita_mensal tem 15 colunas, mas nenhuma delas recebeu description no schema.yml. Qual é a consequência mais direta disso no site do dbt docs?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O site é gerado normalmente, mas as colunas aparecem sem nenhuma explicação para quem consultar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O comando dbt docs generate falha, porque toda coluna precisa de uma description preenchida.",
                                "isCorrect": false
                            },
                            {
                                "text": "As colunas somem do grafo de linhagem, porque o dbt só desenha nós que têm description.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo deixa de ser materializado no próximo dbt run, até que as descriptions sejam adicionadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No grafo de linhagem do site do dbt docs, as setas que ligam um modelo a outro são construídas a partir de qual informação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Da ordem em que os arquivos aparecem dentro da pasta models/ no sistema de arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Das chamadas a ref() e source() usadas dentro do SQL de cada modelo, que definem o DAG.",
                                "isCorrect": true
                            },
                            {
                                "text": "Da ordem alfabética dos nomes dos modelos, calculada automaticamente pelo dbt docs generate.",
                                "isCorrect": false
                            },
                            {
                                "text": "Das descriptions escritas no schema.yml, que indicam manualmente de qual modelo cada um depende.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de analytics engineering decide que nenhum modelo pode ser mesclado sem description no modelo e nas colunas principais. Qual é o principal ganho dessa política?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os modelos passam a rodar mais rápido no warehouse, porque a documentação otimiza o SQL compilado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes genéricos passam a ser gerados automaticamente a partir do texto de cada description.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quem consulta o modelo depois entende seu propósito no site, sem precisar perguntar a quem escreveu.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt passa a bloquear qualquer alteração no modelo que não venha acompanhada de um novo teste.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sources e freshness",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Sources e freshness\n\nAntes do primeiro modelo dbt rodar, o dado já está em algum lugar do warehouse: uma ferramenta de ingestão como Fivetran ou Airbyte carregou uma tabela bruta, replicando o que existe num banco transacional ou numa API. O dbt não faz essa ingestão, isso é tema de outra trilha, mas precisa saber onde essa tabela bruta está para poder começar a transformar a partir dela.\n\nÉ para isso que existe o source: uma forma de declarar, em YAML, que uma tabela bruta existe num determinado schema do warehouse, e de referenciá-la nos modelos sem espalhar o nome físico dela pelo projeto inteiro."
                    },
                    {
                        "type": "text",
                        "value": "## Declarando uma source\n\nUma source é declarada sob a chave `sources:` no schema.yml, separada da chave `models:`, com o nome do schema físico e a lista de tabelas que interessam ao projeto. A partir daí, qualquer modelo referencia essa tabela com `source('nome_da_source', 'nome_da_tabela')`, em vez de escrever o schema e a tabela direto no SELECT.\n\nIsso dá ao dbt visibilidade sobre onde o projeto começa: o source vira o primeiro nó do grafo de linhagem, antes de qualquer modelo de staging."
                    },
                    {
                        "type": "code",
                        "value": "sources:\n  - name: erp\n    database: raw\n    schema: erp_raw\n    tables:\n      - name: orders\n      - name: customers\n\n-- models/staging/stg_orders.sql\nselect\n    id as order_id,\n    customer_id,\n    status,\n    created_at as data_pedido\nfrom {{ source('erp', 'orders') }}"
                    },
                    {
                        "type": "text",
                        "value": "## Freshness: o dado ainda está atualizado?\n\nUma tabela bruta pode existir e mesmo assim estar velha: a ferramenta de ingestão pode ter parado de rodar, uma credencial pode ter expirado, um job pode estar falhando silenciosamente há dois dias. Sem checar isso, o dbt run continua funcionando normalmente, e os modelos são recalculados em cima de dados que já não mudam há muito tempo, sem ninguém perceber até um número parecer estranho no BI.\n\nO dbt resolve isso com freshness: uma configuração que compara o valor mais recente de uma coluna de data ou timestamp, o `loaded_at_field`, com o momento atual, e classifica a source como em dia, atrasada ou vencida."
                    },
                    {
                        "type": "code",
                        "value": "sources:\n  - name: erp\n    database: raw\n    schema: erp_raw\n    tables:\n      - name: orders\n        loaded_at_field: _loaded_at\n        freshness:\n          warn_after: {count: 12, period: hour}\n          error_after: {count: 24, period: hour}"
                    },
                    {
                        "type": "text",
                        "value": "## dbt source freshness\n\nO comando `dbt source freshness` roda essa checagem para cada tabela declarada: busca o valor mais recente de `loaded_at_field`, compara com os limites de `warn_after` e `error_after`, e reporta o resultado por tabela. Uma source com mais de 12 horas desde a última carga aparece como `WARN`; com mais de 24 horas, como `ERROR`.\n\nEsse comando costuma rodar antes do resto do pipeline, num job agendado separado: não faz sentido gastar tempo transformando dados que já estão velhos na origem, e o resultado serve como alerta para o time responsável pela ingestão."
                    },
                    {
                        "type": "quote",
                        "value": "Um dbt run que termina com sucesso não garante que o dado está atualizado, só que o SELECT rodou sem erro. Freshness é quem responde a pergunta que realmente importa: esse dado ainda serve para decisão?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que um modelo de staging usa source('erp', 'orders') em vez de escrever direto o nome do schema e da tabela bruta no SELECT?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque source() converte automaticamente os tipos de dado da tabela bruta para os tipos de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque source() aplica os testes genéricos da tabela bruta antes de qualquer modelo poder lê-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque source() materializa uma cópia da tabela bruta dentro do schema de destino do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque source() registra a tabela como nó do grafo de dependências, além de centralizar sua localização.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma fonte erp.orders é declarada com loaded_at_field igual a _loaded_at, warn_after de 12 horas e error_after de 24 horas. A última linha carregada tem _loaded_at de 30 horas atrás. O que dbt source freshness reporta para essa tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ERROR, porque o intervalo desde a última carga passou do limite de error_after.",
                                "isCorrect": true
                            },
                            {
                                "text": "WARN, porque o intervalo desde a última carga ainda está dentro do limite de error_after.",
                                "isCorrect": false
                            },
                            {
                                "text": "PASS, porque a tabela existe e tem ao menos uma linha com valor em _loaded_at.",
                                "isCorrect": false
                            },
                            {
                                "text": "PASS, porque o freshness só é calculado na primeira vez que a source é declarada no projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma source foi declarada em schema.yml com name, database, schema e a lista de tables, mas sem nenhum bloco freshness nem loaded_at_field. O que acontece ao rodar dbt source freshness para essa tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O comando inteiro falha com erro, porque toda source do projeto precisa ter freshness configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Essa tabela é simplesmente ignorada na checagem, já que faltam loaded_at_field e limites.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt assume um valor padrão de 24 horas para warn_after e error_after nessa tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt usa a data de criação da tabela no warehouse como loaded_at_field automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe roda dbt source freshness antes de dbt build, num job separado e agendado mais cedo. Qual é a principal razão para checar freshness antes de transformar, e não só depois que os modelos já rodaram?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque dbt source freshness precisa rodar antes de qualquer source ser declarada no schema.yml.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque rodar freshness depois faz o dbt build falhar automaticamente em qualquer cenário de atraso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque não compensa gastar tempo e custo transformando dados que já chegaram desatualizados na origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a ordem de execução não influencia o resultado, e checar antes é só uma convenção sem efeito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa source com warn_after de 6 horas e error_after de 48 horas, uma tabela está há 20 horas sem carga nova. O que o resultado WARN, em vez de ERROR, comunica para o time?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a tabela nunca recebeu nenhuma carga desde que o projeto dbt foi criado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o teste de freshness falhou de forma definitiva e bloqueou o restante do dbt build.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o loaded_at_field configurado para essa tabela está com o nome errado no schema.yml.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o atraso passou do limite de atenção, mas não chegou ao limite considerado crítico.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testar cedo e a confiança no pipeline",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testar cedo e a confiança no pipeline\n\nO mesmo problema custa preços muito diferentes dependendo de onde é encontrado. Um customer_id duplicado pego por um teste unique na staging é uma linha no log do dbt test. O mesmo customer_id duplicado, não pego, pode se multiplicar em cada join feito rio abaixo, inflar métricas em três ou quatro marts diferentes, e só ser percebido quando alguém do financeiro pergunta por que a receita do mês fechou maior do que o esperado.\n\nTestar cedo não é só uma questão de disciplina, é uma questão de custo: quanto mais perto da fonte um problema é pego, mais barato costuma ser corrigir."
                    },
                    {
                        "type": "code",
                        "value": "fonte bruta (source)\n      |\n      v\n  staging       <- teste unique/not_null aqui pega o problema com 1 modelo afetado\n      |\n      v\nintermediate    <- o mesmo problema, se escapou, já contamina joins e agregações\n      |\n      v\n    marts       <- e aqui aparece multiplicado em várias métricas de negócio\n      |\n      v\n      BI        <- e aqui vira um número errado na frente de quem decide"
                    },
                    {
                        "type": "text",
                        "value": "## Testar na camada certa\n\nCada camada tem uma responsabilidade diferente, e o teste certo em cada uma reflete isso. A staging é a fronteira entre o dado bruto e o projeto dbt: é ali que faz sentido validar as suposições sobre a fonte, como o customer_id ser único, o status estar dentro dos valores esperados, e as colunas obrigatórias nunca virem nulas. Se a fonte quebrar uma dessas suposições, o teste falha bem no início do grafo, antes de qualquer modelo de intermediate ou marts sequer usar aquele dado.\n\nIsso não elimina a necessidade de testes em marts: regras de negócio, como o total do pedido bater com a soma dos itens, continuam fazendo mais sentido perto do modelo final que calcula esse número. Mas a integridade básica da fonte se testa o quanto antes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"O que faz sentido testar ali\",\"Exemplo\"],[\"staging\",\"Suposições sobre a fonte bruta\",\"unique e not_null em customer_id, accepted_values em status\"],[\"intermediate\",\"Resultado de joins e agregações intermediárias\",\"not_null em colunas calculadas que alimentam os marts\"],[\"marts\",\"Regras de negócio do número final entregue ao BI\",\"teste singular comparando total do pedido com a soma dos itens\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A confiança que testes dão\n\nUm projeto dbt com testes e documentação em dia muda a relação do time com o próprio pipeline. Alguém pode alterar um modelo de intermediate sem precisar conferir manualmente todo o histórico de dashboards: os testes fazem essa conferência. Um novo integrante do time consegue entender o que um modelo garante lendo o schema.yml, sem precisar perguntar para quem escreveu.\n\nEssa confiança é o que permite mudar o pipeline com velocidade, e é também a porta de entrada para temas mais amplos de qualidade e governança de dados, como contratos de dados e catálogos, que pertencem a uma trilha própria e não são o foco aqui."
                    },
                    {
                        "type": "text",
                        "value": "## Antes de considerar um modelo pronto\n\nFechando o módulo, vale reunir num checklist curto o que as cinco aulas cobriram: testes genéricos nas colunas óbvias, chaves, domínios, referências; um teste singular onde a regra de negócio exige; description no modelo e nas colunas principais; e a source de onde ele parte com freshness configurada, se depender de uma fonte que pode atrasar. Nenhum desses itens é opcional por padrão: são o que separa um SELECT que funciona hoje de um modelo em que o time inteiro pode confiar amanhã."
                    },
                    {
                        "type": "quote",
                        "value": "Teste não existe para provar que o pipeline funciona uma vez, existe para avisar rápido no dia em que ele parar de funcionar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que faz sentido concentrar os testes que validam suposições sobre a fonte bruta, como a unicidade de uma chave, já na camada de staging?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque ali o problema é pego na entrada do projeto, antes de se espalhar pelos joins seguintes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a camada de staging é a única em que o dbt test consegue rodar testes genéricos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque modelos de staging não fazem parte do grafo de linhagem, então testar ali é mais barato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a camada de marts não permite declarar tests no schema.yml dos seus modelos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um customer_id duplicado na fonte não foi pego por nenhum teste em staging. O modelo de intermediate faz join dessa tabela com outras três, e os marts finais somam valores a partir desse resultado. Qual é o efeito mais provável desse duplicado não pego cedo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum efeito prático, porque duplicatas em customer_id nunca afetam o resultado de um join.",
                                "isCorrect": false
                            },
                            {
                                "text": "O duplicado se multiplica nos joins, inflando os valores agregados em mais de um mart ao mesmo tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt run seguinte falha automaticamente, porque duplicatas em qualquer coluna interrompem a execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema fica isolado no modelo de intermediate, sem chegar a nenhum modelo de marts.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A regra 'o total do pedido bate com a soma dos itens' depende de dois modelos e de um cálculo de soma. Em qual camada esse teste faz mais sentido, e por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na camada de staging, porque toda regra de negócio deve ser testada antes de qualquer transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fora do dbt, num script separado, porque testes que envolvem dois modelos não são suportados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perto do modelo de marts que calcula esse total, porque é ali que a regra de negócio final é conferida.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em nenhuma camada específica, porque testes singulares não pertencem ao grafo de dependências.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que corrigir um dado errado identificado por um teste em staging leva minutos, enquanto o mesmo tipo de erro, quando só é percebido depois de aparecer num dashboard executivo, leva dias de investigação para rastrear a causa. Que conclusão sobre testes esse cenário sustenta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que testes em staging são opcionais, já que o problema seria descoberto de qualquer forma mais tarde.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que apenas testes na camada de marts têm valor, porque é ali que o negócio enxerga o número final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o custo de um erro é sempre o mesmo, independentemente de em qual camada ele é encontrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que quanto mais cedo no pipeline um teste pega o problema, mais barato costuma ser corrigi-lo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Segundo o conteúdo desta aula, qual é a relação entre os testes de dbt cobertos no módulo e os temas mais amplos de qualidade e governança de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os testes de dbt constroem a confiança básica do pipeline, a porta de entrada para os temas mais amplos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os testes de dbt substituem por completo os temas de governança, sem depender de uma trilha própria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes de dbt não têm nenhuma relação com qualidade de dados, sendo assuntos independentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes de dbt só passam a ter valor depois que o time implementa um catálogo de dados completo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - dbt avançado e reuso",
        "aulas": [
            {
                "titulo": "Jinja e macros",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Jinja e macros\n\nTodo modelo dbt é, na essência, um arquivo `.sql` com um `select`. A diferença para um script solto é que esse `select` pode conter Jinja, uma linguagem de templates que o dbt processa antes de mandar qualquer coisa para o warehouse. O resultado desse processamento é o SQL compilado: só esse SQL final, sem nenhuma marca de Jinja, é o que roda no banco."
                    },
                    {
                        "type": "text",
                        "value": "## As marcas do Jinja\n\nDentro de um modelo dbt, Jinja aparece em três formatos:\n\n- `{{ ... }}`: uma expressão que devolve um valor, como `{{ ref('stg_pedidos') }}` ou `{{ config(materialized='table') }}`.\n- `{% ... %}`: uma instrução de controle, como um `{% if %}`, um `{% for %}` ou a abertura de um `{% macro %}`.\n- `{# ... #}`: um comentário, que some completamente do SQL compilado.\n\n`ref()` e `source()`, vistos no módulo 3, já são Jinja: são funções embutidas do próprio dbt, que resolvem o nome completo da tabela no warehouse em tempo de compilação."
                    },
                    {
                        "type": "code",
                        "value": "-- models/marts/financeiro/fin_pedidos.sql\nselect\n    pedido_id,\n    cliente_id,\n    receita,\n    custo\nfrom {{ ref('int_pedidos_financeiro') }}\n\n{% if target.name == 'dev' %}\n-- em desenvolvimento, roda só numa amostra para ser mais rápido\nlimit 1000\n{% endif %}"
                    },
                    {
                        "type": "text",
                        "value": "## Macros: uma função que devolve SQL\n\nUm macro é um pedaço de Jinja, geralmente misturado com SQL, que recebe parâmetros e devolve texto, do mesmo jeito que uma função recebe argumentos e devolve um valor. A diferença é que o que ele devolve não é um número ou uma string qualquer: é um trecho de SQL, que entra no lugar em que o macro foi chamado, antes da compilação.\n\nMacros ficam em arquivos `.sql` dentro da pasta `macros/` do projeto e ficam disponíveis para qualquer modelo, sem nenhum import explícito."
                    },
                    {
                        "type": "code",
                        "value": "-- macros/divisao_segura.sql\n{% macro divisao_segura(numerador, denominador) %}\n    case\n        when {{ denominador }} = 0 then null\n        else {{ numerador }} / {{ denominador }}\n    end\n{% endmacro %}\n\n-- uso dentro de um modelo\nselect\n    pedido_id,\n    {{ divisao_segura('receita - custo', 'receita') }} as margem_pct\nfrom {{ ref('int_pedidos_financeiro') }}"
                    },
                    {
                        "type": "code",
                        "value": "-- SQL compilado (dbt compile), o que de fato roda no warehouse\nselect\n    pedido_id,\n    case\n        when receita = 0 then null\n        else (receita - custo) / receita\n    end as margem_pct\nfrom analytics.intermediate.int_pedidos_financeiro"
                    },
                    {
                        "type": "quote",
                        "value": "O warehouse nunca recebe Jinja, só SQL. Quem faz a ponte entre o `{{ }}` do modelo e o select final é a compilação do dbt, e é esse SQL compilado, não o arquivo fonte, que roda de fato no banco."
                    }
                ],
                "questions": [
                    {
                        "statement": "No dbt, qual é a função de um macro escrito em Jinja dentro de um projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gerar um trecho de SQL reutilizável, que é expandido dentro dos modelos antes da compilação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Agendar a ordem de execução dos modelos, definindo qual roda antes de qual dentro do DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar os dados depois da carga, retornando erro quando uma linha foge da regra esperada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Declarar uma tabela que já existe no warehouse, tornando-a disponível para os modelos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que a mesma expressão de divisão segura, com um `case when denominador = 0 then null else numerador/denominador end`, está copiada em oito modelos diferentes. Toda vez que alguém corrige um detalhe de arredondamento, precisa repetir a mudança nos oito arquivos. Qual é a melhor forma de resolver isso no dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Transformar os oito modelos em snapshots, para que o dbt versione a expressão automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extrair a expressão para um macro Jinja e chamá-lo nos oito modelos, mudando a lógica num só lugar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar um teste genérico de `not_null` na coluna calculada, o que corrige o arredondamento na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Extrair a expressão para um source único e referenciá-lo a partir dos oito modelos existentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de um modelo dbt, um desenvolvedor abre um bloco `{% if target.name == 'dev' %}` para limitar o volume de dados só em desenvolvimento. Por que essa instrução usa chaves com percentual (`{% %}`), e não chaves duplas (`{{ }}`)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque `{% %}` só funciona dentro de macros, enquanto `{{ }}` só funciona dentro de modelos comuns.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `{% %}` é a sintaxe usada só por `ref()` e `source()`, diferente das demais funções do dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `{% %}` marca uma instrução de controle do Jinja, e não um valor a inserir no SQL.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque `{% %}` roda em tempo de execução no warehouse, enquanto `{{ }}` roda antes, na compilação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa nova no time cria um macro chamado `receita_liquida`, que retorna a expressão `(receita - impostos)`, e depois reclama que, ao rodar `dbt run`, nenhuma tabela `receita_liquida` foi criada no warehouse. Qual é a explicação correta para isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O macro precisava estar listado no `dbt_project.yml`, na seção de models, para ser materializado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Macros só materializam quando o projeto roda em produção, nunca durante execuções locais de desenvolvimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do macro colidiu com uma palavra reservada do dbt, e por isso a criação da tabela falhou em silêncio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um macro não materializa nada sozinho: ele só gera SQL, que precisa ser chamado dentro de um modelo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo com uma chamada de macro está retornando erro de sintaxe SQL no `dbt run`, mas a mensagem não deixa claro qual parte do Jinja causou o problema. Qual é o caminho mais direto para ver exatamente o SQL que o dbt tentou executar no warehouse?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Rodar `dbt compile` e inspecionar o arquivo gerado em `target/compiled`, já sem nenhum Jinja.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar `dbt debug`, comando que existe justamente para mostrar o SQL compilado de cada modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar `dbt seed` de novo, já que erro de sintaxe em macro costuma vir de um seed desatualizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir direto o log do warehouse, porque o dbt não guarda em lugar nenhum o SQL que foi executado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Packages",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Packages\n\nUm projeto dbt não precisa resolver tudo do zero. Assim como uma aplicação importa bibliotecas prontas em vez de reescrever cada função utilitária, um projeto dbt pode depender de outros projetos dbt, chamados packages. Um package é, na prática, um conjunto de macros, e às vezes também modelos e testes, publicado para ser reaproveitado por qualquer projeto."
                    },
                    {
                        "type": "text",
                        "value": "## dbt_utils: o package mais usado\n\nO `dbt_utils`, mantido pela comunidade dbt, é o package mais instalado do ecossistema. Ele reúne macros genéricas que praticamente todo projeto analítico precisa em algum momento: gerar uma chave substituta a partir de várias colunas, montar uma tabela de datas, pivotar valores de linha para coluna, comparar o schema de duas relações, entre outras. Também existem packages mais específicos, para um sistema de origem conhecido ou um domínio de negócio particular."
                    },
                    {
                        "type": "code",
                        "value": "# packages.yml, na raiz do projeto\npackages:\n  - package: dbt-labs/dbt_utils\n    version: [\">=1.1.0\", \"<2.0.0\"]"
                    },
                    {
                        "type": "text",
                        "value": "## dbt deps: instalando o package\n\nDeclarar o package no `packages.yml` não é suficiente para usá-lo: é preciso rodar `dbt deps`, que baixa a versão compatível de cada package listado para dentro do projeto. A partir daí, as macros do package ficam disponíveis em qualquer modelo, chamadas com o prefixo do package, como `{{ dbt_utils.generate_surrogate_key([...]) }}`. Um projeto real também gera um arquivo de lock com a versão exata resolvida de cada package, para que o build seja reprodutível entre máquinas."
                    },
                    {
                        "type": "code",
                        "value": "-- gerando uma chave substituta a partir de colunas naturais\nselect\n    {{ dbt_utils.generate_surrogate_key(['pedido_id', 'item_id']) }} as sk_item_pedido,\n    pedido_id,\n    item_id,\n    quantidade\nfrom {{ ref('stg_itens_pedido') }}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Decisão\",\"Escrever a macro do zero\",\"Usar um package como o dbt_utils\"],[\"Tempo\",\"Reimplementa e testa uma lógica já resolvida\",\"Já vem testada e usada por milhares de projetos\"],[\"Manutenção\",\"Fica só a cargo do time interno\",\"Mantida pela comunidade, com versões estáveis\"],[\"Quando faz sentido\",\"Regra de negócio específica, sem equivalente genérico\",\"Necessidade genérica, como chave substituta ou date spine\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Antes de escrever um macro novo do zero, vale perguntar se essa necessidade já não é genérica o suficiente para já ter sido resolvida, e testada, por um package como o dbt_utils."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função do arquivo `packages.yml` num projeto dbt?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar a lista de seeds que devem ser recarregados a cada execução do `dbt build`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Declarar quais packages externos o projeto usa, como o `dbt_utils`, e suas versões.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configurar o schema de destino de cada modelo, separando os ambientes de dev e prod.",
                                "isCorrect": false
                            },
                            {
                                "text": "Listar as sources externas que os modelos podem referenciar com a função `source()`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de codificar uma dimensão, um analista percebe que precisa gerar uma chave substituta combinando três colunas naturais, e está prestes a escrever um macro Jinja do zero para concatenar e fazer hash dessas colunas. Qual alternativa está mais alinhada às boas práticas do modern data stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escrever o macro mesmo assim, porque hashear colunas é lógica simples demais para um package externo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Resolver isso com um snapshot, já que gerar chave substituta é justamente a função do `dbt snapshot`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar a macro `generate_surrogate_key` do `dbt_utils`, já testada pela comunidade para esse caso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar a chave como seed, cadastrando manualmente a combinação de colunas num CSV versionado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto lista `dbt_utils` no `packages.yml`, mas ao rodar um modelo que chama `{{ dbt_utils.generate_surrogate_key(...) }}`, o dbt informa que essa macro não existe. O que provavelmente ficou faltando antes de rodar o modelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Adicionar `dbt_utils` também no `dbt_project.yml`, já que só o `packages.yml` não é suficiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar `dbt seed` para carregar os arquivos do `dbt_utils` como tabelas no schema de desenvolvimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Publicar o próprio projeto como um package, porque só packages publicados enxergam outros packages.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar `dbt deps` para instalar de fato o package declarado, antes de compilar ou rodar os modelos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma financeira tem uma regra própria de cálculo de imposto, que não existe em nenhum lugar fora da empresa. Um analista sugere procurar um package pronto no lugar de escrever essa lógica como macro interna. Por que essa não é a melhor decisão nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a regra é específica do negócio, sem equivalente genérico, e um macro interno resolve de forma mais direta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque packages só podem ser instalados em projetos que já usam `dbt Cloud`, nunca em projetos com `dbt Core`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque regra de imposto não pode virar macro, só teste singular aplicado direto no modelo final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só é possível instalar um package por projeto, e o `dbt_utils` provavelmente já ocupa essa vaga.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois desenvolvedores do mesmo projeto rodam `dbt deps` em máquinas diferentes, em dias diferentes, e um deles percebe que uma macro do `dbt_utils` se comporta de um jeito diferente do esperado pelo outro. O `packages.yml` fixa só um intervalo de versão, não uma versão exata. Qual prática evita esse tipo de inconsistência?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Substituir o `dbt_utils` por macros escritas à mão, já que package externo nunca garante versão estável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fixar um intervalo de versão mais estrito no `packages.yml`, e comitar o arquivo de lock gerado pelo `dbt deps`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar `dbt deps` sempre em produção antes de cada deploy, o que sincroniza as versões locais de cada máquina.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o projeto inteiro para `dbt Cloud`, ambiente em que a versão de cada package é sempre fixada pela plataforma.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Snapshots: SCD Tipo 2 no dbt",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Snapshots: SCD Tipo 2 no dbt\n\nNa trilha de Modelagem de Dados e Data Warehousing, SCD tipo 2 foi definido como a estratégia que versiona uma dimensão: cada mudança relevante numa linha de origem vira uma nova linha, com data de início e fim de vigência, em vez de sobrescrever o valor antigo. O snapshot é o recurso do dbt que implementa esse padrão de forma automática, a partir de uma fonte que só entrega o estado atual."
                    },
                    {
                        "type": "text",
                        "value": "## Por que capturar, e não só transformar\n\nA maioria dos sistemas de origem sobrescreve dados: um update no ERP troca o endereço do cliente na mesma linha, sem deixar rastro do valor anterior. Se ninguém captura esse estado antes da sobrescrita, o histórico está perdido para sempre, porque nenhuma transformação de SQL recupera um dado que a origem já apagou. É por isso que um snapshot precisa rodar sobre a fonte periodicamente, a cada execução agendada, e não sob demanda: ele só enxerga o estado que existe no instante em que roda."
                    },
                    {
                        "type": "code",
                        "value": "-- snapshots/snap_clientes.sql\n{% snapshot snap_clientes %}\n\n{{\n    config(\n      target_schema='snapshots',\n      unique_key='id_cliente',\n      strategy='timestamp',\n      updated_at='atualizado_em',\n    )\n}}\n\nselect * from {{ source('erp', 'clientes') }}\n\n{% endsnapshot %}"
                    },
                    {
                        "type": "text",
                        "value": "## As duas estratégias: timestamp x check\n\nUm snapshot decide se uma linha mudou de dois jeitos possíveis:\n\n- **timestamp**: confia numa coluna de controle mantida pela origem (`updated_at`), que muda de valor sempre que a linha é alterada. Simples e barato, desde que essa coluna seja confiável.\n- **check**: compara o valor de um conjunto de colunas (`check_cols`, uma lista ou `all`) entre a última captura e a origem atual. Usada quando não existe uma coluna de data confiável para detectar mudanças."
                    },
                    {
                        "type": "code",
                        "value": "-- estratégia check, para quando a origem não tem uma coluna de data confiável\n{{\n    config(\n      target_schema='snapshots',\n      unique_key='id_produto',\n      strategy='check',\n      check_cols=['categoria', 'preco'],\n    )\n}}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Coluna gerada pelo snapshot\",\"O que guarda\"],[\"dbt_scd_id\",\"Identificador único de cada versão da linha\"],[\"dbt_valid_from\",\"O instante em que essa versão passou a valer\"],[\"dbt_valid_to\",\"O instante em que essa versão deixou de valer, nulo se ainda vigente\"],[\"dbt_updated_at\",\"O valor da coluna de controle usada para detectar a mudança\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um snapshot não transforma dado, ele preserva um estado que a origem apagaria na próxima sobrescrita. É o elo entre o pipeline que extrai da origem e a dimensão SCD tipo 2 que os modelos de marts vão consumir."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a função do comando `dbt snapshot` dentro de um projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rodar todos os testes genéricos e singulares que estão configurados nos modelos do projeto inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar os packages declarados no `packages.yml`, deixando as macros deles disponíveis no projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Capturar o estado atual da fonte e gravar uma nova versão, se algo mudou desde a última captura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Compilar os modelos escritos em Jinja para SQL puro, sem executar nada de fato no warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A tabela de clientes de um ERP tem uma coluna `atualizado_em`, mantida automaticamente pelo próprio sistema toda vez que qualquer campo da linha muda. Um time está configurando o snapshot dessa tabela no dbt. Qual estratégia melhor aproveita essa característica da origem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`strategy='check'` com `check_cols='all'`, comparando o valor de cada coluna a cada execução do snapshot.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer uma das duas estratégias, já que `timestamp` e `check` sempre produzem o mesmo resultado final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma estratégia sozinha resolve isso: seria preciso combinar `timestamp` e `check` no mesmo snapshot.",
                                "isCorrect": false
                            },
                            {
                                "text": "`strategy='timestamp'`, usando `atualizado_em` como o `updated_at` que indica quando a linha mudou.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de configurar um snapshot para a tabela de clientes, um analista percebe que a tabela gerada tem várias linhas com o mesmo `id_cliente`, cada uma com um `dbt_valid_from` e um `dbt_valid_to` diferentes. Isso é esperado, e representa o quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O histórico de versões do cliente: cada linha vale para um intervalo de tempo específico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de configuração do `unique_key`, que deveria garantir uma única linha por cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma duplicação criada por rodar `dbt snapshot` mais de uma vez no mesmo dia, sem necessidade real.",
                                "isCorrect": false
                            },
                            {
                                "text": "O efeito de usar `strategy='check'` por engano, que sempre gera duas linhas extras por execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor tenta colocar a definição de um snapshot dentro da pasta `models/`, junto dos demais arquivos `.sql`, e o dbt não reconhece esse arquivo como snapshot. Qual é o motivo mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Snapshots exigem uma extensão de arquivo diferente, `.snap`, em vez do `.sql` usado pelos modelos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Snapshots vivem numa pasta própria, por padrão `snapshots/`, e usam o bloco `{% snapshot %}`.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt só reconhece snapshot quando o projeto roda no `dbt Cloud`, nunca em instalações de `dbt Core`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou declarar o snapshot também como um `source()`, já que ele depende de uma fonte para existir.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma dimensão de produtos é alimentada por um snapshot com `strategy='check'`. Um fato de vendas precisa relacionar cada venda à categoria do produto que valia no momento exato da venda, não à categoria atual. Como o modelo do fato deve usar a saída do snapshot para garantir isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Filtrando a saída do snapshot só pelas linhas em que `dbt_valid_to` é nulo, o que reflete a época da venda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorando `dbt_valid_from` e `dbt_valid_to`, e cruzando direto pelo `id_produto`, que já identifica a versão certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cruzando pela data da venda entre `dbt_valid_from` e `dbt_valid_to`, escolhendo a versão vigente naquele momento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodando o snapshot de novo na data da venda, para que ele gere uma versão retroativa específica do pedido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Seeds e a diferença para source",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Seeds e a diferença para source\n\ndbt tem duas formas de trazer dado para dentro de um modelo que não são um `select` sobre outro modelo: seeds e sources. São conceitos frequentemente confundidos, mas resolvem problemas bem diferentes."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um seed\n\nUm seed é um arquivo CSV pequeno, guardado na pasta `seeds/` do projeto dbt e versionado no git junto com o resto do código. Rodar `dbt seed` lê esse CSV e carrega como uma tabela no warehouse; a partir daí, o seed é referenciado em outros modelos com `ref()`, exatamente como um modelo comum.\n\nUso típico: mapeamentos e listas de referência pequenas, que mudam raramente e são mantidas pelo próprio time de analytics engineering, como um de-para de sigla de estado para região, ou uma tabela fixa de câmbio usada num contexto específico."
                    },
                    {
                        "type": "code",
                        "value": "-- seeds/mapa_regiao.csv\nuf,regiao\nSP,Sudeste\nRJ,Sudeste\nBA,Nordeste\nRS,Sul\n\n-- uso num modelo, depois de rodar dbt seed\nselect\n    p.pedido_id,\n    m.regiao\nfrom {{ ref('stg_pedidos') }} as p\nleft join {{ ref('mapa_regiao') }} as m\n    on p.uf = m.uf"
                    },
                    {
                        "type": "text",
                        "value": "## O que é um source\n\nUm source é uma tabela que já existe no warehouse, normalmente carregada por um processo de ingestão (Fivetran, Airbyte, ou um pipeline próprio), com dado bruto vindo de um sistema de origem. O dbt não cria nem é dono desse dado: ele só declara essa tabela num arquivo `.yml`, com nome, schema e, opcionalmente, uma checagem de freshness. A partir dessa declaração, os modelos referenciam a tabela com `source()`, em vez de escrever o schema na mão."
                    },
                    {
                        "type": "code",
                        "value": "-- models/staging/erp/_erp__sources.yml\nsources:\n  - name: erp\n    schema: erp_raw\n    tables:\n      - name: clientes\n      - name: pedidos\n\n-- uso num modelo de staging\nselect * from {{ source('erp', 'clientes') }}"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Seed\",\"Source\"],[\"Onde o dado mora\",\"CSV dentro do projeto dbt, versionado no git\",\"Tabela que já existe no warehouse, fora do dbt\"],[\"Quem carrega\",\"`dbt seed`, a partir do arquivo versionado\",\"Um processo externo de ingestão\"],[\"Tamanho e mudança\",\"Pequeno, muda raramente\",\"Qualquer volume, atualizado pela ingestão\"],[\"Uso típico\",\"Mapeamento e lista de referência fixa\",\"Dado operacional bruto de um sistema de origem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um seed é dado que o próprio time de analytics engineering possui e versiona; um source é dado que já existe no warehouse, e o dbt só declara, sem nunca ter sido dono dele."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença central entre um seed e um source no dbt?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Seed é lido com `source()`, e source é lido com `ref()`: só uma troca de função no select do modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Seed serve só para ambientes de teste, e source serve só para modelos que vão para produção de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Seed é criado automaticamente pela ferramenta de ingestão, e source é digitado à mão pelo time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Seed é um CSV versionado e carregado pelo dbt; source é uma tabela que já existe, só declarada.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time de analytics engineering precisa de uma tabela pequena e estável, com o de-para entre sigla de estado e região do país, mantida e revisada pelo próprio time dentro do repositório do projeto dbt. Qual é a forma mais adequada de disponibilizar esse dado para os modelos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como um seed: um CSV versionado em `seeds/`, carregado com `dbt seed` e referenciado com `ref()`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como um source: declarado num `schema.yml`, apontando para uma tabela mantida pela ingestão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um snapshot: capturando o de-para periodicamente, para preservar histórico de mudanças.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um teste singular: um select reaproveitado pelos modelos de staging como se fosse uma fonte.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor cria um seed com a extração diária de dez mil linhas de pedidos vindas do ERP, versionando o CSV atualizado no repositório toda manhã antes de rodar `dbt build`. Qual é o problema dessa abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum problema: seeds servem exatamente para isso, incluindo grande volume que muda todo dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Seed é para dado pequeno e estável; volume diário e operacional pede ingestão real como source.",
                                "isCorrect": true
                            },
                            {
                                "text": "É só uma questão de performance, resolvida aumentando o número de `threads` usado pelo `dbt seed`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum problema técnico, mas cada linha carregada via seed cobra uma licença extra no warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo de staging tenta acessar uma tabela carregada via `dbt seed` usando `{{ source('seeds', 'mapa_regiao') }}`, e o dbt informa que essa fonte não foi declarada. Qual é a causa do erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Seeds precisam ser declarados manualmente num `sources.yml` antes de qualquer modelo referenciá-los.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do seed está errado: deveria incluir a extensão `.csv` dentro da chamada de `source()`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Seed se referencia com `ref('mapa_regiao')`, como um modelo comum; `source()` é só para tabela externa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Faltou rodar `dbt docs generate` depois do `dbt seed`, passo que registra o seed como fonte válida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer configurar uma checagem de freshness (o quanto um dado pode estar desatualizado) para o seed de mapeamento de regiões, do mesmo jeito que já faz para os sources vindos do ERP. Por que essa configuração não se aplica a um seed?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque freshness só funciona em warehouses na nuvem, e seed não pode ser carregado nesse tipo de warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é bem assim: freshness pode, sim, ser configurada para um seed do mesmo jeito que para um source.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque freshness é um teste genérico, e teste genérico só pode ser aplicado a modelo, nunca a seed ou source.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque freshness vale para source, dado de um processo externo; o seed só muda quando o time versiona um CSV.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Configuração e ambientes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Configuração e ambientes\n\nUm mesmo projeto dbt roda, sem alterar o código dos modelos, tanto na máquina de um desenvolvedor quanto em produção. O que muda de uma execução para outra é a configuração: para onde escrever, com qual conexão, com qual volume de dado. O SQL continua sendo o mesmo."
                    },
                    {
                        "type": "text",
                        "value": "## Configuração em dois lugares: dbt_project.yml e o modelo\n\nO `dbt_project.yml` configura por pasta: tudo dentro de `models/marts/`, por exemplo, pode ser materializado como table de uma vez só. Um modelo específico pode sobrescrever essa configuração com um bloco `{{ config(...) }}` no topo do próprio arquivo `.sql`. Quando as duas fontes conflitam, a mais específica vence: a configuração do modelo prevalece sobre a da pasta, e a da pasta mais interna prevalece sobre a de uma pasta mais externa."
                    },
                    {
                        "type": "code",
                        "value": "-- dbt_project.yml (configuração por pasta)\nmodels:\n  meu_projeto:\n    staging:\n      +materialized: view\n    marts:\n      +materialized: table\n      financeiro:\n        +materialized: incremental\n\n-- dentro de models/marts/financeiro/fin_margem.sql (a config mais específica vence)\n{{ config(materialized='table') }}\n\nselect\n    pedido_id,\n    receita,\n    custo\nfrom {{ ref('int_pedidos_financeiro') }}"
                    },
                    {
                        "type": "text",
                        "value": "## Targets: dev e prod\n\nUm target é um ambiente de execução nomeado, declarado no `profiles.yml`, com sua própria conexão, schema e credenciais. Um mesmo projeto pode ter vários targets, tipicamente um `dev` e um `prod`, cada um apontando para um schema diferente. Escolher o target ativo muda para onde os modelos são construídos, sem mudar uma linha sequer do SQL: o mesmo `select` gera uma tabela num schema pessoal em `dev`, e na tabela compartilhada de verdade em `prod`."
                    },
                    {
                        "type": "code",
                        "value": "-- profiles.yml, geralmente fora do projeto, em ~/.dbt/\nmeu_projeto:\n  target: dev\n  outputs:\n    dev:\n      type: snowflake\n      schema: dev_joao\n      threads: 4\n    prod:\n      type: snowflake\n      schema: analytics\n      threads: 8"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Target dev\",\"Target prod\"],[\"Schema de destino\",\"Pessoal, como `dev_joao`\",\"Compartilhado, consumido por BI e outros times\"],[\"Quem roda\",\"O próprio desenvolvedor, local ou num PR\",\"Um agendador, em produção\"],[\"Volume de dado\",\"Às vezes uma amostra, para ciclo rápido\",\"Completo, o dado real usado nas decisões\"],[\"Código dos modelos\",\"O mesmo\",\"O mesmo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A configuração muda para onde o dbt escreve e como ele se conecta; o SQL dos modelos não muda uma linha entre dev e prod. É essa separação que permite testar com segurança antes de publicar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num projeto dbt, quando uma materialização é definida por pasta no `dbt_project.yml` e também dentro de um modelo específico com `{{ config(...) }}`, qual configuração prevalece?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A do modelo específico, porque a configuração mais específica tem prioridade sobre a mais geral.",
                                "isCorrect": true
                            },
                            {
                                "text": "A do `dbt_project.yml`, porque configuração no nível do projeto sempre tem prioridade sobre o modelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas: o dbt ignora ambas e usa sempre view como a materialização padrão do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas juntas, gerando dois objetos diferentes no warehouse para o mesmo modelo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma desenvolvedora roda `dbt build` na própria máquina usando o target `dev`, e depois o mesmo comando roda em produção com o target `prod`. Os modelos SQL não têm nenhuma diferença entre as duas execuções. O que explica os dados aparecerem em schemas diferentes em cada caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O dbt detecta sozinho se a máquina é de um desenvolvedor ou de um servidor, e escolhe o schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada target no `profiles.yml` aponta para um schema próprio; o código roda contra conexões diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os modelos têm, sim, uma diferença: um `{% if %}` interno que troca o schema em cada arquivo `.sql`.",
                                "isCorrect": false
                            },
                            {
                                "text": "O schema muda porque `dbt build` em produção sempre recria o projeto inteiro num banco de dados novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo tem, escrito direto no select, o nome do schema de produção referenciado (`analytics.marts.fin_pedidos`) em vez de usar `{{ ref(...) }}`. O modelo funciona em produção, mas quebra sempre que alguém tenta rodá-lo no target `dev`. Qual é o problema dessa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum: escrever o schema direto é mais rápido de ler, e o problema está no target `dev`, mal configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo deveria estar na pasta `marts/` do `dbt_project.yml`, e não na raiz de `models/`, para resolver sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome fixo ignora o schema do target ativo; `ref()` deixa o dbt resolver o schema certo em cada ambiente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O erro é de sintaxe: nome de schema com ponto exige aspas duplas ao redor de cada parte do caminho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um novo integrante do time sugere eliminar o target `dev` e fazer todo mundo rodar `dbt build` direto contra o schema de produção, para simplificar a configuração. Qual é o principal risco dessa sugestão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum risco real: como o SQL dos modelos é idêntico entre ambientes, rodar direto em prod não muda nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt bloqueia por padrão qualquer `dbt build` fora do target `prod`, então a sugestão nem é possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco é só de custo, já que rodar em prod sempre cobra mais caro do que rodar num target de desenvolvimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelo ainda em desenvolvimento passaria a sobrescrever tabela usada por relatório e time que depende de produção.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "No `dbt_project.yml`, a pasta `marts` está configurada com `+materialized: table`, e a subpasta `marts/financeiro`, dentro dela, está configurada com `+materialized: incremental`. Um modelo dentro de `models/marts/financeiro/` não tem nenhum `config()` próprio. Com qual materialização ele é construído?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Incremental, porque a configuração da subpasta mais próxima do modelo prevalece sobre a pasta mais geral.",
                                "isCorrect": true
                            },
                            {
                                "text": "Table, porque a configuração de `marts` é a primeira que o dbt encontra ao ler o `dbt_project.yml`.",
                                "isCorrect": false
                            },
                            {
                                "text": "View, porque sem um `config()` no próprio arquivo, o dbt sempre volta para a materialização padrão do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O build falha com erro, porque duas pastas aninhadas não podem declarar materializações diferentes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - O modern data stack na prática",
        "aulas": [
            {
                "titulo": "dbt + orquestrador: quem chama o dbt",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# dbt + orquestrador: quem chama o dbt\n\nO dbt compila e executa modelos SQL, resolve a ordem certa de execução através do DAG de `ref()` e `source()`, e sabe dizer se um teste passou ou falhou. O que o dbt não faz sozinho é responder a pergunta mais básica de qualquer pipeline: quando rodar? Ele não tem um relógio interno esperando as 6 da manhã, nem um jeito nativo de saber que a carga do Fivetran daquela madrugada já terminou. Alguém, ou alguma coisa, precisa chamar `dbt build` no momento certo, depois que os dados certos já chegaram.\n\nEsta aula é sobre esse \"alguém\": como um orquestrador, como o Airflow, ou o scheduler do próprio dbt Cloud, encaixa o dbt dentro de um pipeline maior, e por que o dbt foi desenhado de propósito para não resolver esse problema sozinho."
                    },
                    {
                        "type": "text",
                        "value": "## dbt é uma ferramenta de transformação, não um agendador\n\nO dbt Core, a versão open source que roda por linha de comando, não tem um processo em segundo plano esperando a hora certa. Rodar `dbt run` ou `dbt build` executa os modelos pendentes naquele instante, e o processo termina: não existe um daemon do dbt Core verificando o relógio a cada minuto. Isso é uma escolha de design, não uma limitação esquecida. O dbt se concentra em fazer uma coisa bem feita (compilar e executar SQL de forma versionada, testável e documentada) e deixa agendamento, retries entre sistemas diferentes e dependências externas para uma ferramenta especializada nisso.\n\nO dbt Cloud, a versão gerenciada, adiciona um scheduler próprio por cima do mesmo motor: um job pode rodar todo dia às 6h, ou ser disparado por uma chamada de API depois que outro sistema termina. Mesmo assim, esse scheduler só enxerga o mundo do dbt: ele não sabe orquestrar uma extração do Fivetran, esperar um arquivo chegar num bucket ou disparar um modelo de machine learning depois do `dbt build` passar. Para pipelines com mais de uma ferramenta envolvida, a orquestração de ponta a ponta continua sendo trabalho de um orquestrador externo, como o Airflow, já estudado a fundo na trilha de Orquestração de Pipelines."
                    },
                    {
                        "type": "code",
                        "value": "Uma pipeline tipica orquestrada de ponta a ponta\n\n  Orquestrador (Airflow, ou o scheduler do dbt Cloud)\n  |\n  |-- 1. aciona a extracao e carga (Fivetran, Airbyte, script proprio)\n  |        |\n  |        v\n  |   warehouse: tabelas RAW atualizadas\n  |\n  |-- 2. so depois do passo 1 confirmar sucesso, roda `dbt build`\n  |        |\n  |        v\n  |   staging -> intermediate -> marts, dentro do warehouse\n  |\n  |-- 3. so depois do dbt build/test passar, libera o refresh do BI\n           |\n           v\n      Looker / Metabase leem os marts atualizados\n\n  o dbt controla o DAG de dentro do passo 2; o orquestrador controla a ordem entre 1, 2 e 3"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Scheduler do dbt Cloud\", \"Orquestrador externo (Airflow)\"], [\"O que agenda\", \"Só jobs de dbt (run, test, build, docs generate)\", \"Qualquer sistema: extração, dbt, ML, notificações\"], [\"Dependência entre sistemas\", \"Só via API, chamando outro sistema de fora\", \"Nativo: uma task espera a outra terminar\"], [\"Onde vive o DAG\", \"DAG interno dos modelos, dentro do projeto dbt\", \"DAG do pipeline inteiro, com o dbt como um nó\"], [\"Setup\", \"Mais simples quando o pipeline é só dbt\", \"Mais trabalho, compensa com várias ferramentas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como um orquestrador chama o dbt\n\nNa prática, existem algumas formas comuns de um orquestrador acionar o dbt:\n\n- **Chamar o comando diretamente**: uma task do Airflow (ou de qualquer orquestrador) executa `dbt build` como um comando de shell, dentro de um container ou ambiente onde o projeto dbt está instalado.\n- **Chamar a API do dbt Cloud**: em vez de rodar o dbt localmente, a task dispara um job já configurado no dbt Cloud através de uma chamada HTTP, e opcionalmente espera a resposta antes de seguir.\n- **Uma integração que expande o DAG do dbt dentro do DAG do orquestrador**: ferramentas do ecossistema leem o `manifest.json` do dbt e criam uma task para cada modelo, em vez de rodar o projeto inteiro como um bloco único. Isso dá visibilidade por modelo dentro da interface do orquestrador, ao custo de mais complexidade de configuração.\n\nEm qualquer uma dessas formas, o dbt continua resolvendo sozinho a ordem entre os próprios modelos. O orquestrador só decide quando aquele bloco inteiro começa, e o que acontece antes e depois dele."
                    },
                    {
                        "type": "quote",
                        "value": "O dbt sabe exatamente em que ordem os próprios modelos devem rodar; ele só não sabe, e não deveria saber, que horas são."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por padrão, ao terminar de executar `dbt build`, o dbt Core encerra o processo. O que isso revela sobre o papel do dbt dentro de um pipeline de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O dbt executa a transformação quando chamado, mas não decide sozinho a hora certa de rodar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dbt mantém um processo em segundo plano, verificando a cada minuto se há um novo modelo para compilar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt reinicia sozinho a cada seis horas, usando um agendador embutido no próprio dbt Core.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt aguarda, em segundo plano, a confirmação de que a carga do warehouse terminou antes de sair.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time roda todo o pipeline de dados só com dbt Cloud: a extração já chega pronta por um conector nativo, sem nenhuma outra ferramenta envolvida além do warehouse e do BI. Nesse cenário, qual opção de agendamento é suficiente, sem exigir um orquestrador externo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar um cron no servidor de BI para disparar a transformação antes de qualquer leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o scheduler do próprio dbt Cloud para rodar o job num horário fixo ou por gatilho de API.",
                                "isCorrect": true
                            },
                            {
                                "text": "Instalar um orquestrador externo apenas para acionar o mesmo comando que o dbt Cloud já executaria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever um script Python separado que reimplementa o DAG de modelos fora do projeto dbt.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pipeline extrai dados de uma API com Airbyte, carrega no warehouse, roda os modelos dbt e, só depois, precisa disparar um modelo de recomendação em outro serviço. O time quer uma ferramenta só para coordenar essas quatro etapas, na ordem certa. Qual é a alternativa mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ampliar o `dbt_project.yml` para declarar a extração do Airbyte e o serviço de recomendação como fontes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas testes de source freshness do dbt para garantir que as quatro etapas rodem na ordem certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um orquestrador externo, como o Airflow, para coordenar as quatro etapas, com o dbt como uma delas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar `dbt build --full-refresh` para que o próprio dbt acione a extração e o serviço de recomendação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide criar, dentro do próprio projeto dbt, uma tabela de controle e uma rotina em Python que verifica a cada minuto se é hora de rodar cada modelo, replicando um agendador. Qual é o principal problema dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O dbt não permite a criação de tabelas de controle dentro de um projeto, então a rotina falharia ao rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tabelas de controle escritas em SQL não podem ser referenciadas por modelos dbt através de `ref()`.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt Core bloqueia qualquer execução que não tenha sido iniciada por um scheduler externo configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe está reconstruindo, por conta própria, algo que um orquestrador já resolve de forma testada.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a divisão de responsabilidade entre o dbt e um orquestrador como o Airflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Airflow compila e executa os modelos SQL, e o dbt apenas registra o horário em que cada um rodou.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt e o Airflow disputam o mesmo papel, e um projeto maduro deveria escolher usar só um dos dois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt resolve o DAG interno de modelos e os transforma; o Airflow decide quando e em que contexto isso roda.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Airflow substitui o `ref()` e o `source()` do dbt, montando o DAG de modelos a partir das próprias tasks.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O semantic layer e métricas consistentes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O semantic layer e métricas consistentes\n\nÉ comum uma pergunta simples virar uma discussão de meia hora: qual é a receita do mês passado? O time financeiro olha para uma planilha e diz um número. O dashboard de vendas, construído no Looker, mostra outro. O relatório automático que o time de growth manda por e-mail toda segunda mostra um terceiro. Nenhum dos três está necessariamente errado: cada um define receita de um jeito ligeiramente diferente (bruta ou líquida, com ou sem cancelamento, na data do pedido ou na data do pagamento). O problema não é o cálculo em si, é ele existir em três lugares diferentes, calculado três vezes.\n\nEsta aula trata do semantic layer: a camada que existe para acabar com essa pergunta, definindo cada métrica uma única vez e deixando qualquer ferramenta de BI consultar essa mesma definição."
                    },
                    {
                        "type": "text",
                        "value": "## O problema: métrica duplicada em cada dashboard\n\nSem um lugar central para definir métricas, cada analista que constrói um dashboard reescreve a lógica do zero: um SQL direto no Looker, uma fórmula calculada no Metabase, uma coluna derivada numa planilha. Cada uma dessas versões tende a divergir com o tempo, porque são mantidas por pessoas diferentes, em ferramentas diferentes, sem nenhuma delas ser \"a fonte de verdade\". A consequência não é só o número errado numa reunião: é a erosão da confiança no dado como um todo. Depois que alguém vê duas ferramentas mostrando receitas diferentes, o próximo instinto é desconfiar de qualquer número, mesmo dos corretos.\n\nIsso é diferente de um modelo dbt mal escrito ou de um teste faltando: mesmo com os marts corretos e bem testados, nada impede que duas pessoas somem colunas diferentes, filtrem status diferentes, ou apliquem um `WHERE` diferente ao montar a mesma métrica em ferramentas separadas."
                    },
                    {
                        "type": "quote",
                        "value": "Uma métrica que existe em três lugares não é uma métrica, são três opiniões parecidas com números."
                    },
                    {
                        "type": "code",
                        "value": "# definicao conceitual de uma metrica no semantic layer do dbt\n# (a metrica referencia um measure, que por sua vez vem de um modelo)\n\nsemantic_models:\n  - name: pedidos\n    model: ref('fct_pedidos')\n    defaults:\n      agg_time_dimension: data_pedido\n    measures:\n      - name: receita_liquida\n        agg: sum\n        expr: valor_total - valor_cancelado\n    dimensions:\n      - name: data_pedido\n        type: time\n        type_params:\n          time_granularity: day\n\nmetrics:\n  - name: receita_total\n    label: Receita Total\n    description: Soma da receita liquida de pedidos, usada em todos os dashboards\n    type: simple\n    type_params:\n      measure: receita_liquida\n\n# qualquer ferramenta de BI conectada ao semantic layer consulta \"receita_total\"\n# e recebe sempre o mesmo calculo, sem reescrever a logica"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sem semantic layer\", \"Com semantic layer\"], [\"Cada dashboard tem sua própria fórmula de receita\", \"Receita definida uma vez, reusada por todos os dashboards\"], [\"Divergência só aparece quando alguém compara dois relatórios\", \"Divergência fica difícil de acontecer, a fonte é única\"], [\"Mudar a regra de negócio exige editar cada dashboard\", \"Mudar a regra de negócio exige editar só a definição da métrica\"], [\"Dimensão (por mês, por região) recalculada em cada ferramenta\", \"Dimensão consultada junto da métrica, com o mesmo grain\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde o semantic layer se encaixa\n\nO semantic layer fica entre os marts, já modelados e testados pelo dbt, e as ferramentas de consumo (Looker, Metabase, uma planilha, um assistente de perguntas em linguagem natural). Ele não substitui os marts, depende deles: a métrica `receita_total` só existe porque aponta para um measure que vem de um modelo dbt já confiável. O que o semantic layer adiciona é uma camada de definição (nome, cálculo, granularidade, dimensões permitidas) que qualquer ferramenta pode consultar, em vez de cada ferramenta reimplementar o cálculo do zero em sua própria sintaxe.\n\nIsso também muda quem consegue definir uma métrica nova. Sem semantic layer, qualquer pessoa com acesso ao dashboard pode criar uma métrica calculada, sem revisão. Com semantic layer, a métrica nasce como código versionado, dentro do projeto dbt, passando pelo mesmo processo de revisão de qualquer outro modelo."
                    },
                    {
                        "type": "text",
                        "value": "## Métrica não é a mesma coisa que modelo\n\nVale separar dois conceitos que se confundem fácil. Um modelo dbt (uma tabela ou view num mart) guarda linhas: um pedido por linha, um cliente por linha. Uma métrica é um número agregado a partir dessas linhas, sempre acompanhado de uma granularidade (por dia, por mês, por região) e, geralmente, de uma forma de agregação (soma, contagem, média). `fct_pedidos` é um modelo. \"Receita total por mês\" é uma métrica com uma dimensão. O semantic layer trabalha nesse segundo nível, em cima de modelos que o dbt já materializou.\n\nEssa camada não substitui a governança de dados, vista com mais profundidade em outra trilha da plataforma: ela resolve o problema específico da métrica calculada de formas diferentes, não o controle de quem pode acessar qual dado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal problema que um semantic layer resolve dentro do modern data stack?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A demora para carregar grandes volumes de dados brutos até o warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "A mesma métrica sendo calculada de formas diferentes em cada ferramenta de BI.",
                                "isCorrect": true
                            },
                            {
                                "text": "A falta de espaço em disco para armazenar tabelas materializadas como table.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de testes genéricos como `not_null` e `unique` nos modelos dbt.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O dashboard de vendas mostra receita de R$ 500 mil no mês, enquanto o relatório financeiro, calculado numa planilha separada, mostra R$ 480 mil para o mesmo período. Os dois times garantem que seus números estão certos. Qual mudança ataca a causa raiz desse tipo de divergência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar a planilha do financeiro por um novo dashboard, também com fórmula própria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a frequência de atualização dos dois relatórios para reduzir o atraso entre eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a métrica de receita uma vez no semantic layer e conectar as duas ferramentas a ela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar um teste `unique` na tabela de pedidos usada por um dos dois relatórios.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe já tem um modelo dbt `fct_pedidos`, testado e documentado, com uma linha por pedido. Um analista quer expor receita total por região e por mês de forma consistente para várias ferramentas de BI. Qual é o próximo passo mais adequado, além do modelo já existente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir uma métrica no semantic layer, apontando para um measure do modelo, com a granularidade desejada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Recriar `fct_pedidos` como uma tabela nova, já agregada por região e por mês, no lugar da original.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um teste `accepted_values` na coluna de região para garantir que os valores existentes sejam válidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duplicar o modelo em cada ferramenta de BI, ajustando o agrupamento conforme a necessidade de cada uma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide não usar semantic layer e, em vez disso, documentar num arquivo compartilhado a fórmula oficial de cada métrica, confiando que cada analista vai seguir a receita ao montar seu próprio dashboard. Por que essa abordagem tende a falhar com o tempo, mesmo com a documentação correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque arquivos compartilhados não podem ser lidos por mais de uma pessoa da equipe ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dbt exige que toda métrica esteja formalmente declarada em YAML para ser considerada válida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque documentação escrita num arquivo compartilhado não consegue descrever fórmulas de agregação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nada impede que a fórmula seja reescrita de forma levemente diferente em cada ferramenta.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ver o problema da métrica duplicada, qual afirmação descreve corretamente o papel do semantic layer dentro do modern data stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele define uma métrica uma única vez, sobre os marts, para ser reutilizada por qualquer ferramenta de BI.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele substitui a necessidade de modelos dbt, calculando métricas direto sobre as tabelas raw do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele garante que os dados de origem estejam livres de valores nulos antes de qualquer transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele controla quais usuários têm permissão para acessar cada tabela dentro do data warehouse.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "CI/CD para dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# CI/CD para dados\n\nUm pull request muda uma linha de SQL num modelo dbt: troca um `LEFT JOIN` por um `INNER JOIN`. Sozinha, a mudança parece pequena. Só que esse modelo alimenta outros três, e um deles vira uma métrica de receita usada pelo financeiro. Sem nada verificando esse PR antes do merge, o erro só aparece quando alguém do financeiro percebe que a receita do mês caiu 8% da noite para o dia, sem nenhuma explicação de negócio.\n\nCI/CD para dados aplica ao SQL versionado no dbt a mesma disciplina que já existe para código de aplicação: testar antes do merge, não depois. Esta aula cobre como isso funciona na prática, incluindo uma técnica do próprio ecossistema dbt para manter esse teste rápido mesmo em projetos grandes: o slim CI."
                    },
                    {
                        "type": "text",
                        "value": "## O que roda no CI de um projeto dbt\n\nA ideia central é simples: toda vez que alguém abre um pull request mudando algo em `models/`, um pipeline de CI sobe um ambiente isolado (um schema separado no warehouse, por exemplo) e roda `dbt build`, que compila, executa e testa os modelos afetados nesse ambiente. Se algum modelo falhar ao compilar, se um teste `not_null` ou `unique` quebrar, ou se um teste singular retornar linhas, o pipeline falha e o PR fica bloqueado até alguém corrigir. Ninguém revisando o PR manualmente precisa notar o problema primeiro: o CI já provou, antes da revisão humana, que os modelos ao menos rodam e passam nos testes declarados.\n\nEsse ambiente isolado de CI importa: rodar os testes direto contra o schema de produção arriscaria sobrescrever dados reais com uma versão ainda não revisada do modelo."
                    },
                    {
                        "type": "code",
                        "value": "# .ci/pipeline.yml (configuracao ilustrativa de CI para um projeto dbt)\nstages: [build_pr]\n\nbuild_pr:\n  trigger: pull_request\n  script:\n    - dbt deps\n    # roda so os modelos modificados e o que depende deles, contra o estado de producao\n    - dbt build --select state:modified+ --state ./prod-manifest\n\n# fluxo:\n# PR aberto -> CI cria schema isolado -> dbt build (state:modified+) -> testes rodam\n#   -> passou: PR liberado para revisao e merge\n#   -> falhou: PR bloqueado, autor corrige antes de pedir revisao de novo"
                    },
                    {
                        "type": "text",
                        "value": "## Slim CI: testar só o que mudou\n\nUm projeto dbt grande pode ter centenas de modelos. Rodar `dbt build` completo a cada PR, testando tudo de novo, fica caro e lento rápido: minutos viram dezenas de minutos, e o time começa a evitar abrir PRs pequenos só para não esperar o CI inteiro. O slim CI resolve isso comparando o estado do PR contra o `manifest.json` da última execução em produção: só os modelos que de fato mudaram, mais tudo que depende deles no DAG, entram na seleção `state:modified+`. Um modelo que não mudou, e que nada a jusante dele mudou, nem é reconstruído.\n\nIsso não é uma otimização cosmética. É a diferença entre um CI que roda em dois minutos e um que roda em quarenta, e entre um time que testa cada PR de bom grado e um time tentado a pular o CI \"só dessa vez\"."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Critério\", \"CI completo\", \"Slim CI (state:modified+)\"], [\"O que roda\", \"Todos os modelos do projeto, a cada PR\", \"Só os modelos alterados e o que depende deles\"], [\"Tempo de execução\", \"Cresce junto com o tamanho do projeto\", \"Proporcional ao tamanho da mudança, não do projeto\"], [\"Depende de\", \"Nada além do projeto dbt\", \"Um manifest.json de uma execução anterior, como referência\"], [\"Cobertura do downstream\", \"Total, por definição\", \"Total, desde que o DAG enxergue a dependência\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um PR de dado só devia inspirar confiança depois que o pipeline provou, sozinho, que os modelos ainda compilam e os testes ainda passam."
                    },
                    {
                        "type": "text",
                        "value": "## Do PR à produção, promovendo com confiança\n\nO caminho típico segue os mesmos passos de qualquer entrega de software, adaptado para dados: o PR roda no CI contra um ambiente isolado, alguém revisa a mudança de SQL como revisaria qualquer outro código, e só depois do merge na branch principal é que a mudança é promovida para o ambiente de produção, seja pelo job agendado do dbt Cloud, seja por uma etapa de deploy dentro do próprio pipeline de CI/CD. Os ambientes (dev, CI, produção) mantêm o mesmo projeto dbt, diferindo só nas variáveis de ambiente e no schema de destino, do mesmo jeito que uma aplicação usa a mesma imagem em ambientes diferentes.\n\nEssa esteira completa, o caminho que leva um commit até a produção com portões de qualidade no meio, é o assunto central da trilha de CI/CD e Cloud. Aqui, o que importa é que dados seguem a mesma lógica: testar antes de promover, nunca depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o objetivo principal de rodar `dbt build` dentro de um pipeline de CI, a cada pull request?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir o tempo de resposta das consultas feitas pelo BI em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Verificar, antes do merge, se os modelos compilam e os testes passam.",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerar automaticamente a documentação de todos os modelos do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de linhas processadas por execução do pipeline.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto dbt tem 400 modelos. Um PR altera apenas um modelo de staging usado por dois modelos de marts. Rodando `dbt build --select state:modified+` contra o manifest de produção, quais modelos o CI reconstrói?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os 400 modelos do projeto, porque `state:modified+` sempre reconstrói tudo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum modelo, porque `state:modified+` só roda testes, sem executar SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o modelo alterado e os modelos a jusante dele, que dependem do resultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só os modelos de marts, ignorando o modelo de staging que de fato mudou.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para economizar tempo de configuração, um time decide rodar os testes de CI de um PR diretamente contra o schema de produção, em vez de um schema isolado. Qual é o principal risco dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `dbt build` passa a ignorar testes singulares quando aponta para produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `manifest.json` da execução deixa de ser gerado quando o schema é o de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `ref()` e o `source()` do PR deixam de resolver corretamente o DAG de modelos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um modelo ainda não revisado pode sobrescrever dados reais usados por outras pessoas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de adotar slim CI, um time percebe que um PR alterando um modelo de staging passa rápido pelo CI, mas quebra em produção um mart que deveria depender dele. Investigando, descobrem que esse mart usa `FROM analytics.stg_pedidos` direto no SQL, em vez de `{{ ref('stg_pedidos') }}`. Por que isso explica o CI não ter pego o problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sem `ref()`, o dbt não enxerga essa dependência no DAG, e o mart nunca entra na seleção `state:modified+`.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque `FROM` direto faz o modelo rodar antes do staging, invertendo a ordem correta do DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nomes de tabela fixos são ignorados pelos testes genéricos, mesmo quando declarados corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o slim CI só analisa modelos materializados como view, ignorando os materializados como table.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual conjunto de práticas melhor descreve CI/CD aplicado a um projeto dbt?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rodar `dbt docs generate` a cada PR e revisar manualmente a documentação antes do merge.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testar o PR num ambiente isolado, com slim CI, e só promover para produção depois do merge.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de threads do projeto dbt para acelerar qualquer pipeline de CI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar os testes uma vez por semana, num horário fixo, direto no schema de produção.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Analytics engineering na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Analytics engineering na prática\n\nChegou a hora de ver o fluxo inteiro, de ponta a ponta, sem cortar em pedaços por módulo. Uma tabela `orders` nasce dentro do banco transacional de um sistema de e-commerce, linha por linha, pedido por pedido, sem nenhuma preocupação com análise: ela existe para o sistema funcionar, não para alguém tirar uma métrica dela. Entre essa tabela crua e o número de receita mensal que aparece no dashboard do time comercial existe uma cadeia de transformações inteira, e é essa cadeia que esta aula percorre.\n\nQuem constrói e mantém essa cadeia, na prática, é o analytics engineer: a pessoa que conecta o dado bruto que a engenharia de dados entrega ao número em que o time de negócio confia."
                    },
                    {
                        "type": "code",
                        "value": "Fluxo completo, de uma fonte crua a uma metrica confiavel (exemplo: e-commerce)\n\n  [ fonte: banco transacional, tabela orders ]\n                  |\n                  |  ingestao (Fivetran / Airbyte / pipeline proprio)\n                  v\n  [ warehouse: raw.orders ]                      <- dado cru, tal como chegou\n                  |\n                  |  dbt: source('erp', 'orders')\n                  v\n  [ staging: stg_orders ]                        <- limpo, renomeado, tipado, 1:1 com a fonte\n                  |\n                  |  dbt: ref('stg_orders') + ref('stg_customers')\n                  v\n  [ intermediate: int_orders_enriquecidos ]      <- juntado com clientes, regras intermediarias\n                  |\n                  |  dbt: ref('int_orders_enriquecidos')\n                  v\n  [ marts: fct_pedidos, dim_clientes ]           <- modelos de negocio, testados e documentados\n                  |\n                  |  semantic layer: metrica receita_total\n                  v\n  [ BI: Looker / Metabase ]                      <- receita mensal, mesma definicao em todo lugar"
                    },
                    {
                        "type": "text",
                        "value": "## O analytics engineer: entre o dado e o negócio\n\nO papel nasceu do meio de dois outros. A engenharia de dados garante que o dado saia da fonte e chegue ao warehouse: pipelines de ingestão, orquestração, infraestrutura, volume, latência. O analista de negócio sabe o que uma métrica deveria significar para a empresa e o que o time comercial precisa enxergar no dashboard, mas nem sempre tem o hábito de versionar SQL, escrever teste ou documentar uma coluna. O analytics engineer mora nesse meio: usa práticas de engenharia de software (controle de versão, revisão de código, testes, CI) para transformar o dado já ingerido em modelos que respondem às perguntas do negócio.\n\nNo dia a dia, isso significa conversar com um stakeholder para entender o que \"cliente ativo\" ou \"receita reconhecida\" deveriam significar, traduzir essa definição em modelos e métricas dentro do dbt, testar e documentar o resultado, e só então liberar para consumo no BI. A ferramenta central desse trabalho é o dbt, mas o valor entregue não é o SQL em si, é a métrica em que alguém do negócio pode confiar sem checar de novo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\", \"Exemplo neste fluxo\", \"Responsabilidade\"], [\"Raw\", \"raw.orders\", \"Cópia fiel da fonte, sem transformação\"], [\"Staging\", \"stg_orders\", \"Limpa, renomeia e tipa, ainda 1:1 com a fonte\"], [\"Intermediate\", \"int_orders_enriquecidos\", \"Junta fontes, aplica regra de negócio intermediária\"], [\"Marts\", \"fct_pedidos, dim_clientes\", \"Modelo de negócio, pronto para consumo e testado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um fluxo de ponta a ponta, na prática\n\nUm pedido do time comercial chega assim: \"precisamos saber a receita mensal por região, considerando só pedidos entregues\". O analytics engineer parte da pergunta, não do SQL. Primeiro, confirma que a fonte já está disponível como `source()` (a tabela `orders`, ingerida pela engenharia de dados). Depois, verifica se já existe um `stg_orders` reaproveitável, ou cria um, aplicando apenas limpeza e renomeação. Em seguida, decide se a regra \"só pedidos entregues\" e o join com região pertencem a um modelo intermediate (se outros modelos também vão precisar dessa mesma junção) ou já podem ir direto para o mart.\n\nSó depois do modelo de mart pronto é que a métrica de receita entra em cena: uma definição no semantic layer, apontando para o measure certo, testada com `dbt build` no CI antes de qualquer PR ser aceito. O time comercial só vê o resultado final, mas cada camada no meio existiu para que aquele número pudesse ser confiável e reproduzível."
                    },
                    {
                        "type": "quote",
                        "value": "Entre a tabela crua e o número que aparece no dashboard existe uma cadeia inteira de decisões, e cada uma delas tem a assinatura de um analytics engineer."
                    },
                    {
                        "type": "text",
                        "value": "## O que fica com quem\n\nVale reforçar as fronteiras, ainda que na prática elas se sobreponham em times pequenos. Ingestão, trazer o dado da fonte até o warehouse, é trabalho de engenharia de dados, com ferramentas como Fivetran, Airbyte ou pipelines próprios. Orquestrar quando cada etapa roda é trabalho de um orquestrador como o Airflow. Transformar o dado já ingerido, em camadas testadas e documentadas, é o núcleo do analytics engineering, com o dbt como ferramenta central. Nenhuma dessas responsabilidades substitui a outra: um analytics engineer não costuma escrever o conector de ingestão, e quem cuida da ingestão não costuma decidir o que \"cliente ativo\" significa para o negócio."
                    }
                ],
                "questions": [
                    {
                        "statement": "No fluxo staging -> intermediate -> marts, qual característica melhor define um modelo de staging?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Junta múltiplas fontes já aplicando regras de negócio complexas do domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Limpa e renomeia uma única fonte, mantendo uma relação de um para um com ela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Expõe a métrica final, já testada, pronta para consumo direto no BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Agrega dados de várias tabelas de marts numa única visão consolidada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de e-commerce precisa que alguém converse com o setor comercial para entender o que \"cliente ativo\" deve significar, traduza isso em modelos dbt testados e documentados, e libere a métrica correspondente no BI. Qual papel concentra esse trabalho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O engenheiro de dados, responsável por manter os conectores de ingestão do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "O administrador do warehouse, responsável por gerenciar custo e permissões de acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "O analytics engineer, que traduz a necessidade de negócio em modelos e métricas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O engenheiro de orquestração, responsável por agendar quando os modelos vão rodar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analytics engineer precisa juntar `stg_orders` com `stg_customers` e aplicar uma regra de negócio (excluir pedidos cancelados) que será reaproveitada por dois modelos de marts diferentes. Em qual camada essa lógica deveria viver?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Direto na fonte, alterando a tabela `orders` antes mesmo da ingestão acontecer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Num modelo intermediate, reaproveitado pelos dois marts que precisam da mesma junção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Duplicada dentro de cada um dos dois marts, para manter os modelos independentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Num modelo de staging, já que staging é o lugar de aplicar regras de negócio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analytics engineer entrega rápido uma métrica de receita, direto de `raw.orders` para um dashboard, pulando staging, intermediate e marts, porque \"o prazo era curto\". Duas semanas depois, a fonte muda um nome de coluna e o dashboard quebra sem aviso. Qual teria sido o principal benefício de seguir as camadas normalmente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O prazo de entrega teria sido menor, porque staging elimina a necessidade de testes.",
                                "isCorrect": false
                            },
                            {
                                "text": "A métrica teria ficado disponível automaticamente no semantic layer, sem configuração.",
                                "isCorrect": false
                            },
                            {
                                "text": "A mudança de nome ficaria isolada dentro de `stg_orders`, sem quebrar o restante do fluxo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O warehouse passaria a validar sozinho qualquer alteração feita na tabela de origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de acompanhar o fluxo completo desta aula, qual afirmação melhor resume o papel do analytics engineer dentro do modern data stack?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Construir e manter os pipelines de ingestão que trazem o dado até o warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Decidir a infraestrutura de hardware do cluster que roda o data warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar os alertas de disponibilidade da API que serve os dados ao BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar o dado ingerido em modelos e métricas testadas e confiáveis.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas e antipadrões do modern data stack",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas e antipadrões do modern data stack\n\nEssa é a última aula da trilha, e também o fechamento de uma fase inteira do roadmap de Engenharia de Dados: depois de processamento distribuído com Spark e de data lake e lakehouse, o modern data stack fecha o bloco mais avançado do caminho, antes de o roadmap seguir para os temas de operação, qualidade e governança de uma plataforma de dados madura.\n\nO objetivo aqui não é apresentar conceito novo, é consolidar. Boa parte do que aparece nesta aula já foi vista, espalhada, ao longo dos módulos anteriores: camadas, testes, documentação, `ref()` no lugar de nome de tabela fixo. Junto, isso forma uma checklist do que revisar antes de considerar um projeto dbt pronto para produção, e uma lista do que evitar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Boa prática\", \"Por que importa\"], [\"Camadas claras (staging, intermediate, marts)\", \"Isola mudança de fonte, deixa o DAG fácil de entender\"], [\"Testar cedo (genéricos e singulares)\", \"Pega problema no CI, antes de chegar ao dashboard\"], [\"Uma fonte de verdade para métricas\", \"O semantic layer evita a mesma métrica calculada duas vezes\"], [\"Nunca pular a staging\", \"Mesmo um join simples merece uma camada 1:1 com a fonte\"], [\"Documentar (descriptions, dbt docs)\", \"A próxima pessoa entende o modelo sem perguntar no chat\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Antipadrões comuns\n\n- **O modelo deus**: um único `SELECT` de centenas de linhas, misturando limpeza, várias junções e regra de negócio, direto de tabelas raw até uma saída pronta para o BI. Funciona até a primeira mudança de requisito, depois disso ninguém entende mais o que cada trecho faz nem onde alterar com segurança.\n- **Nome de tabela fixo em vez de `ref()` e `source()`**: escrever `FROM analytics.orders` direto no SQL quebra a linhagem automática do dbt e some do grafo de dependências, o que impede que o `state:modified+` saiba que aquele modelo depende de outro.\n- **Pular a staging**: ir direto da fonte raw para um modelo de mart parece economizar um passo, mas espalha a mesma limpeza (tipos, nomes de coluna) por vários modelos diferentes, cada um reimplementando a mesma correção.\n- **BI consultando a tabela raw direto**: quando um dashboard aponta para uma tabela raw ou staging, em vez de um mart testado, qualquer mudança de schema na fonte quebra o relatório sem passar por nenhum teste no caminho.\n- **Métrica reescrita em cada dashboard**: a ausência de um semantic layer, ou ao menos de uma convenção clara, faz cada analista calcular receita, churn ou LTV do seu próprio jeito."
                    },
                    {
                        "type": "code",
                        "value": "-- antipadrao: modelo deus, nome de tabela fixo, sem camadas\nSELECT\n    o.id,\n    c.nome,\n    o.valor - o.desconto AS receita,\n    r.nome AS regiao\nFROM analytics.orders o                       -- nome fixo, sem source()\nJOIN analytics.customers c ON c.id = o.customer_id\nJOIN analytics.regioes r ON r.id = c.regiao_id\nWHERE o.status = 'entregue'\n\n\n-- corrigido: em camadas, com ref()/source(), cada modelo com uma responsabilidade\n\n-- models/staging/stg_orders.sql\nSELECT id, customer_id, valor, desconto, status\nFROM {{ source('erp', 'orders') }}\n\n-- models/intermediate/int_orders_enriquecidos.sql\nSELECT\n    o.id,\n    o.valor - o.desconto AS receita,\n    c.regiao_id\nFROM {{ ref('stg_orders') }} o\nJOIN {{ ref('stg_customers') }} c ON c.id = o.customer_id\nWHERE o.status = 'entregue'\n\n-- models/marts/fct_pedidos.sql\nSELECT oe.id, oe.receita, r.nome AS regiao\nFROM {{ ref('int_orders_enriquecidos') }} oe\nJOIN {{ ref('stg_regioes') }} r ON r.id = oe.regiao_id"
                    },
                    {
                        "type": "quote",
                        "value": "Um projeto dbt maduro não se reconhece pelo número de modelos, se reconhece pela confiança de quem lê um SQL escrito por outra pessoa e entende, na hora, o que ele faz."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando a trilha\n\nAo longo desta trilha, o modern data stack deixou de ser uma lista de nomes de ferramentas e virou um jeito de organizar trabalho: ingestão gerenciada (Fivetran, Airbyte) trazendo o dado cru até o warehouse (Snowflake, BigQuery), o dbt transformando esse dado em camadas versionadas e testadas, um semantic layer garantindo que a métrica seja uma só, e um pipeline de CI/CD dando confiança a cada mudança antes dela chegar num BI (Looker, Metabase). Como o restante do roadmap de Engenharia de Dados construído até aqui (lógica, Python, SQL, modelagem, ingestão, orquestração, Spark, lakehouse), nenhuma peça sozinha resolve o problema todo: é a combinação, mantida com disciplina, que faz um time confiar no dado que consome todo dia.\n\nIsso também fecha a fase mais avançada do roadmap. A partir daqui, os próximos passos olham menos para \"como processar e transformar\" e mais para \"como operar, garantir qualidade e governar\" uma plataforma de dados que já funciona, o assunto de trilhas futuras dedicadas a isso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que escrever `FROM analytics.orders` direto no SQL, em vez de usar `{{ source('erp', 'orders') }}`, é considerado um antipadrão num projeto dbt?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque quebra a linhagem do dbt, e o modelo some do grafo de dependências.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o dbt bloqueia a compilação de qualquer modelo que não use `source()`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nomes fixos de tabela tornam a consulta mais lenta dentro do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `FROM` direto impede a criação de testes genéricos como `not_null`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo único, com mais de 300 linhas de SQL, faz limpeza, três junções e o cálculo final de receita, direto das tabelas raw até uma saída consumida pelo BI. Um novo integrante do time leva dias para entender onde alterar uma regra de negócio. Qual mudança ataca diretamente esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número de comentários dentro do mesmo `SELECT`, sem separar em modelos menores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Materializar esse modelo como table em vez de view, para acelerar a leitura no BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de testes aplicados a esse modelo, já que ele já é complexo o bastante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir o modelo em camadas (staging, intermediate, marts), cada uma com uma responsabilidade.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um dashboard no Metabase aponta direto para uma tabela de staging, ignorando os marts já testados e documentados. Depois que a fonte de origem muda um tipo de coluna, o dashboard passa a mostrar números incorretos, sem nenhum alerta. Qual prática teria reduzido esse risco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Conectar o BI apenas aos marts, deixando staging e intermediate como camadas internas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a frequência de atualização do dashboard, para refletir a mudança mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar mais colunas à tabela de staging, cobrindo qualquer mudança futura de tipo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Materializar a tabela de staging como table, em vez de deixá-la como view.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois dashboards diferentes mostram churn mensal com números distintos: um calcula churn sobre clientes com contrato ativo, o outro sobre todos os clientes já cadastrados. Ambos os SQLs estão, cada um dentro da própria lógica, corretos. Qual mudança estrutural evita esse tipo de divergência silenciosa no futuro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Padronizar o nome da coluna churn em todas as tabelas envolvidas nos dois dashboards.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a frequência de execução do `dbt build` para reduzir o atraso entre os dashboards.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar os dois dashboards para a mesma ferramenta de BI, mantendo cada fórmula como está.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir churn uma única vez no semantic layer, com a regra de negócio explícita e documentada.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ver camadas, testes, semantic layer e CI/CD ao longo da trilha, qual conjunto de práticas melhor caracteriza um projeto de modern data stack maduro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um único modelo por domínio de negócio, otimizado para reduzir o número total de arquivos SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes aplicados só nos modelos de staging, já que marts raramente mudam depois de prontos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Métricas calculadas dentro de cada ferramenta de BI, ajustadas conforme o público de cada uma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Camadas claras, testes desde cedo, métricas centralizadas e CI validando cada mudança.",
                                "isCorrect": true
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
