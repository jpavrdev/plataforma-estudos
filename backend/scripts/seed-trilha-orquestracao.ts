// Seed da trilha Orquestracao de Pipelines (roadmap de Engenharia de Dados).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-orquestracao.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Orquestração de Pipelines";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Trilha de orquestracao do roadmap de Engenharia de Dados: agendar, encadear e monitorar pipelines de forma confiavel. Do problema (o cron nao escala) aos DAGs, a arquitetura do Apache Airflow, agendamento e data intervals, dependencias e trigger rules, retries e idempotencia de tasks, sensores e dependencias entre DAGs, e a operacao de pipelines em producao. Vendor-neutral, com Airflow como referencia e Dagster/Prefect citados. Assume base de Python e ETL, com foco em decisoes e cenarios.";

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
        "titulo": "Módulo 1 - Fundamentos de orquestração",
        "aulas": [
            {
                "titulo": "O problema: por que orquestrar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O problema: por que orquestrar\n\nTodo pipeline de dados começa simples: um script Python que extrai, transforma e carrega dados, disparado por um cron. Funciona bem enquanto existe um único job, sem dependência de outros processos e sem histórico de falhas para gerenciar. O problema aparece quando esse cenário cresce: dezenas de scripts, dependendo uns dos outros, disputando os mesmos recursos e rodando em horários diferentes."
                    },
                    {
                        "type": "text",
                        "value": "## O que quebra com o crescimento\n\n- **Dependências implícitas**: um job assume que outro já terminou só porque roda alguns minutos depois, não porque essa garantia existe de fato.\n- **Falhas silenciosas**: um script que falha às 3h da manhã só é percebido quando alguém reclama que o painel está desatualizado.\n- **Falta de visibilidade**: não existe um lugar único para ver o que rodou, o que falhou e por quê.\n- **Reprocessamento manual**: corrigir um dia de dados errado significa lembrar a ordem certa de rodar cada script de novo, na mão."
                    },
                    {
                        "type": "code",
                        "value": "# extrai pedidos às 2h; assume que termina antes das 2h30\n0 2 * * * /jobs/extrair_pedidos.sh\n\n# transforma pedidos às 2h30; assumindo que a extração já acabou\n30 2 * * * /jobs/transformar_pedidos.sh\n\n# carrega no warehouse às 3h; assumindo que a transformação já acabou\n0 3 * * * /jobs/carregar_pedidos.sh"
                    },
                    {
                        "type": "quote",
                        "value": "Quando a ordem entre jobs depende de quanto tempo cada um demora para rodar, é questão de tempo até um deles atrasar e derrubar o pipeline inteiro, em silêncio."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Scripts soltos com cron\",\"Orquestrador\"],[\"Dependências\",\"Baseadas num intervalo de tempo estimado\",\"Baseadas na confirmação real de que a tarefa anterior terminou\"],[\"Falhas\",\"Silenciosas, aparecem só quando alguém percebe\",\"Registradas e visíveis num histórico central\"],[\"Visibilidade\",\"Espalhada em logs de servidores diferentes\",\"Centralizada, com o status de cada execução\"],[\"Reprocessamento\",\"Manual, exige lembrar a ordem certa dos scripts\",\"Reexecução controlada de uma tarefa ou de um intervalo de datas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Sintomas de que falta um orquestrador\n\n- Alguém coloca um `sleep` no meio do script só para esperar outro processo terminar.\n- Existe um 'horário mágico' copiado de projeto em projeto, sem ninguém lembrar por que aquele número foi escolhido.\n- Ninguém sabe reprocessar um dia específico sem correr o risco de quebrar outro dia já processado.\n- A única forma de saber se um pipeline rodou é abrir o log manualmente, um servidor de cada vez."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nEsses sintomas não são falha de disciplina da equipe: são o limite natural de coordenar múltiplos processos usando apenas horários fixos. É exatamente essa lacuna que um orquestrador de dados preenche, tema da próxima aula."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe encadeia cinco scripts usando cron, cada um agendado alguns minutos depois do anterior, supondo que o anterior já tenha terminado. Depois de um aumento no volume de pedidos, o script de transformação passou a começar antes da extração terminar, gerando dados incompletos no destino. Qual é a causa raiz desse problema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O servidor de cron está configurado com um fuso horário diferente do restante da infraestrutura da equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os scripts estão agendados com uma frequência baixa demais para acompanhar o crescimento do volume de pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A dependência entre os scripts é baseada num intervalo de tempo fixo, não na confirmação de término do job anterior.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela de destino usada pelo script de carga está sem índices, o que atrasa a gravação dos dados transformados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um incidente, um analista de plantão passa duas horas procurando, em logs espalhados por servidores diferentes, qual script falhou durante a madrugada. Qual seria o benefício mais direto de um orquestrador nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um painel central que mostra o status de cada execução e aponta a etapa que falhou, sem vasculhar logs em servidores diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cópia automática dos arquivos de log de todos os servidores para uma pasta compartilhada, lida manualmente durante incidentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um reinício automático de qualquer processo do sistema operacional que pare de responder, sem qualquer intervenção humana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um aumento na frequência dos agendamentos sempre que a equipe percebe atrasos recorrentes nas entregas dos dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bug corrompeu os dados de um único dia específico. Corrigir isso exige rodar de novo, nessa ordem, os scripts de extração, transformação e carga apenas para aquele dia, sem tocar nos demais dias, que já estão corretos. Com a abordagem de scripts soltos e cron, qual é o obstáculo real para fazer isso hoje?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os scripts precisariam ser reescritos do zero para aceitar qualquer tipo de parâmetro, algo que scripts em Python não suportam.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cron impede executar o mesmo script duas vezes no mesmo dia, então o reprocessamento só pode acontecer no próximo ciclo agendado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O reprocessamento só é possível reiniciando o servidor inteiro, já que os scripts leem o estado apenas durante a inicialização.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe uma noção pronta de rodar para uma data específica: alguém precisa descobrir na mão quais scripts chamar e em qual ordem.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de sofrer com falhas não percebidas, a equipe decide adicionar alertas por e-mail sempre que um script termina com erro. Isso melhora a visibilidade de falhas, mas qual limitação estrutural da abordagem baseada em cron continua sem solução?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O volume de e-mails de alerta recebidos pela equipe cresce rápido demais para ser administrável.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ordem entre os scripts segue horários fixos, não a confirmação de término da tarefa anterior.",
                                "isCorrect": true
                            },
                            {
                                "text": "O servidor de e-mail tem limite diário de envio, o que atrasa parte das notificações de falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "O envio de cada e-mail consome processamento e deixa os scripts sensivelmente mais lentos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere quatro situações numa equipe que ainda roda tudo via cron. Qual delas é o sinal mais claro de que falta um orquestrador, e não apenas um ajuste pontual de configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um dos scripts está usando uma biblioteca desatualizada e precisa ser migrado para uma versão mais recente da linguagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O servidor onde os scripts rodam está com o disco quase cheio e precisa de uma limpeza de arquivos temporários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ninguém sabe reprocessar um dia específico sem rodar scripts na mão, na ordem certa, torcendo para não esquecer nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "A equipe decidiu trocar o editor de texto usado para escrever os scripts por um com mais recursos de autocompletar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é um orquestrador de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um orquestrador de dados\n\nUm orquestrador de dados é o sistema responsável por agendar, encadear, monitorar e reprocessar pipelines compostos por várias tarefas. Ele não substitui o código que você já escreve em Python, SQL ou Spark: ele decide quando cada pedaço roda, em que ordem, o que fazer quando algo falha e como reexecutar um trecho específico depois."
                    },
                    {
                        "type": "text",
                        "value": "## As quatro responsabilidades centrais\n\n- **Agendar**: disparar um pipeline num horário ou numa frequência definida, ou em resposta a um evento.\n- **Encadear**: garantir que uma tarefa só comece depois que suas dependências reais tiverem terminado com sucesso.\n- **Monitorar**: manter um histórico central de execuções, com status, duração e logs de cada tarefa.\n- **Reprocessar**: permitir rodar de novo um pipeline inteiro, ou só uma parte dele, para uma data ou intervalo específico."
                    },
                    {
                        "type": "quote",
                        "value": "O orquestrador decide quando e em que ordem o trabalho acontece; quem processa os dados de fato é o motor por trás de cada tarefa, seja um script Python, uma query SQL ou um job Spark."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta\",\"Quem responde\"],[\"Quando o pipeline deve começar?\",\"Orquestrador\"],[\"Qual tarefa depende de qual?\",\"Orquestrador\"],[\"Uma tarefa falhou: e agora?\",\"Orquestrador\"],[\"Como transformar 500 GB de eventos numa tabela agregada?\",\"Motor de processamento (Spark, warehouse etc.)\"],[\"Onde os dados transformados ficam armazenados?\",\"Data lake ou data warehouse\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from airflow import DAG\nfrom airflow.operators.python import PythonOperator\n\ndef rodar_transformacao_no_spark():\n    # a task apenas dispara o job no cluster Spark;\n    # quem processa os dados é o Spark, não o orquestrador\n    submeter_job_spark(script='transformar_pedidos.py')\n\ntransformar = PythonOperator(\n    task_id='transformar_pedidos',\n    python_callable=rodar_transformacao_no_spark,\n)"
                    },
                    {
                        "type": "text",
                        "value": "## O que um orquestrador não é\n\n- Não é um motor de processamento: ele não lê, junta nem agrega os dados, apenas aciona quem faz isso (Spark, um warehouse, um script).\n- Não é uma fila de mensagens: não foi feito para streaming de eventos em tempo real, e sim para pipelines organizados em tarefas discretas.\n- Não é um banco de dados de negócio: o banco de metadados do orquestrador guarda o estado das execuções, não os dados do pipeline em si."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando a definição\n\nPara encadear tarefas com confiança, o orquestrador precisa representar o pipeline como um grafo de dependências. É exatamente disso que trata a próxima aula: o DAG."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um engenheiro sugere fazer, dentro de uma task do orquestrador, o join pesado entre duas tabelas de 200 GB, tudo em memória no worker que executa a task. Por que essa é uma decisão de arquitetura questionável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o orquestrador não permite que uma task rode por mais de um minuto antes de ser encerrada automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque tasks escritas em Python só conseguem manipular arquivos menores que 1 GB, por limitação da linguagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o orquestrador exige que todo processamento de dados seja feito exclusivamente em SQL, nunca em Python.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o orquestrador coordena quando e em que ordem o trabalho roda, e não processa grandes volumes de dados sozinho.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer poder rodar de novo, com um clique, somente o pipeline de vendas do dia 10 de março, sem afetar os demais dias já processados. Essa capacidade corresponde a qual responsabilidade central de um orquestrador?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reprocessar: rodar de novo uma parte do pipeline, para uma data específica, sem tocar no restante.",
                                "isCorrect": true
                            },
                            {
                                "text": "Agendar: definir a frequência ou o horário em que o pipeline inteiro deve começar a rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Encadear: garantir que cada tarefa comece somente depois que suas dependências tenham terminado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Monitorar: manter um histórico central com o status e a duração de cada execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista tenta rodar queries de faturamento diretamente no banco de metadados do orquestrador, achando que os dados do pipeline ficam armazenados ali. Qual é o erro nesse raciocínio?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O banco de metadados só aceita conexões vindas do próprio servidor do orquestrador, nunca de ferramentas externas de consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de metadados é apagado automaticamente a cada nova execução do pipeline, então nunca há dados históricos para consultar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de metadados guarda o estado das execuções (quando rodou, se falhou, duração), não os dados de negócio processados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de metadados armazena apenas os logs de erro, sem nenhuma informação sobre execuções que terminaram com sucesso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de pagamentos precisa reagir a cada transação individual em poucos milissegundos, aplicando regras de fraude em tempo real, evento a evento. Ela cogita usar o orquestrador de dados para consumir esses eventos diretamente. Por que essa não é a ferramenta certa para esse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque um orquestrador só consegue iniciar pipelines uma vez por dia, devido a uma limitação interna do agendador padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um orquestrador coordena tarefas discretas de um pipeline, não um fluxo contínuo de eventos em milissegundos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque um orquestrador impede que qualquer tarefa individual leve menos de um minuto inteiro para ser concluída.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um orquestrador exige que todos os dados de entrada cheguem em arquivos CSV antes de iniciar o pipeline.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Das opções abaixo, qual é uma atividade que o próprio orquestrador realiza, e não algo que ele apenas aciona em outro sistema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Calcular a soma do faturamento mensal a partir das linhas de uma tabela de vendas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Executar o join entre duas tabelas grandes para gerar uma tabela agregada final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir um arquivo de eventos brutos antes de gravá-lo no data lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "Decidir que a carga só começa depois que a transformação tiver terminado com sucesso.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "DAG: o grafo acíclico dirigido de tarefas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# DAG: o grafo acíclico dirigido de tarefas\n\nDAG é a sigla para 'directed acyclic graph', grafo acíclico dirigido. É a estrutura que todo orquestrador moderno usa para representar um pipeline: cada tarefa é um nó do grafo, e cada dependência entre tarefas é uma aresta. O nome carrega as três propriedades que importam."
                    },
                    {
                        "type": "text",
                        "value": "## As três palavras do nome\n\n- **Grafo**: o pipeline é um conjunto de nós (tarefas) conectados por arestas (dependências), não uma lista linear única.\n- **Dirigido**: cada aresta tem um sentido. Se `extrair -> transformar`, a dependência só vale nessa direção: transformar depende de extrair, o contrário não.\n- **Acíclico**: o grafo não pode ter ciclos. Uma tarefa nunca pode depender, direta ou indiretamente, dela mesma."
                    },
                    {
                        "type": "code",
                        "value": "extrair_dados -> transformar_pedidos\nextrair_dados -> transformar_clientes\ntransformar_pedidos -> unir_dados\ntransformar_clientes -> unir_dados\nunir_dados -> carregar_dw"
                    },
                    {
                        "type": "quote",
                        "value": "Se um ciclo fosse permitido, a tarefa A dependeria da tarefa B, que dependeria da tarefa A: nenhuma das duas poderia começar, porque cada uma estaria esperando a outra terminar primeiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo do grafo\",\"O que representa no pipeline\"],[\"Nó (node)\",\"Uma tarefa (task)\"],[\"Aresta (edge)\",\"Uma dependência entre duas tarefas\"],[\"Upstream\",\"Uma tarefa que precisa terminar antes\"],[\"Downstream\",\"Uma tarefa que depende da anterior\"],[\"Ciclo\",\"Uma dependência circular, proibida num DAG\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from airflow import DAG\nfrom airflow.operators.python import PythonOperator\nfrom datetime import datetime\n\nwith DAG('pipeline_pedidos', start_date=datetime(2026, 1, 1), schedule='@daily') as dag:\n    extrair_dados = PythonOperator(task_id='extrair_dados', python_callable=extrair)\n    transformar_pedidos = PythonOperator(task_id='transformar_pedidos', python_callable=transformar_pedidos_fn)\n    transformar_clientes = PythonOperator(task_id='transformar_clientes', python_callable=transformar_clientes_fn)\n    unir_dados = PythonOperator(task_id='unir_dados', python_callable=unir)\n    carregar_dw = PythonOperator(task_id='carregar_dw', python_callable=carregar)\n\n    extrair_dados >> [transformar_pedidos, transformar_clientes] >> unir_dados >> carregar_dw"
                    },
                    {
                        "type": "text",
                        "value": "## Estrutura, não comportamento\n\nO DAG define quais tarefas existem e em que ordem elas podem rodar. Ele não diz o que acontece dentro de cada tarefa: isso é responsabilidade do código por trás de cada uma. A próxima aula olha de perto o que é uma tarefa e como a ordem entre elas é decidida na prática."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em um DAG, a propriedade acíclico existe para impedir qual situação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que uma tarefa dependa, direta ou indiretamente, dela mesma, num ciclo sem início possível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que duas tarefas diferentes rodem ao mesmo tempo em workers separados do orquestrador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que uma tarefa tenha mais de uma dependência upstream ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o pipeline tenha mais de uma tarefa final sem nenhuma dependência downstream.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para tentar resolver falhas, um engenheiro propõe adicionar uma dependência extra no DAG: a última tarefa (carregar_dw) passaria a apontar de volta para a primeira (extrair_dados), disparando-a de novo sempre que a carga terminasse. Por que essa mudança é inválida num DAG?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque tarefas com nomes iniciados por 'extrair' e 'carregar' não podem ser conectadas diretamente por convenção do orquestrador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cria um ciclo: extrair_dados dependeria de carregar_dw, que já depende dela, e nenhuma das duas conseguiria começar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque cada DAG só pode ter uma única tarefa marcada como ponto de entrada, e extrair_dados já ocupa essa posição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque arestas num DAG só podem conectar tarefas que rodam no mesmo worker físico durante a execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No DAG da aula, existe a aresta extrair_dados -> transformar_pedidos. O que essa aresta dirigida significa, exatamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "extrair_dados é downstream de transformar_pedidos: só pode começar depois que transformar_pedidos terminar com sucesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas tarefas devem começar exatamente ao mesmo tempo, já que estão conectadas por uma aresta.",
                                "isCorrect": false
                            },
                            {
                                "text": "extrair_dados e transformar_pedidos pertencem a DAGs diferentes, e a seta apenas indica uma referência externa.",
                                "isCorrect": false
                            },
                            {
                                "text": "transformar_pedidos é downstream de extrair_dados: só pode começar depois que extrair_dados terminar com sucesso.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual das situações abaixo, se modelada literalmente como dependência num DAG, violaria a propriedade de ser acíclico?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Duas tarefas de transformação diferentes começam ao mesmo tempo, logo após a extração terminar, e ambas alimentam a tarefa de união dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tarefa de carga só começa depois que as duas tarefas de transformação tiverem terminado com sucesso, não antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tarefa de validação final aciona de novo a tarefa de extração ao encontrar um dado inválido, antes de o pipeline ser considerado concluído.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tarefa de extração alimenta diretamente três tarefas de transformação diferentes, que rodam de forma independente entre si.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Se a tarefa carregar_dw é downstream de unir_dados, isso significa que:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "unir_dados é upstream de carregar_dw: termina antes de carregar_dw poder começar.",
                                "isCorrect": true
                            },
                            {
                                "text": "carregar_dw precisa terminar antes de unir_dados poder começar a rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "as duas tarefas são independentes e podem rodar em qualquer ordem, sem restrição.",
                                "isCorrect": false
                            },
                            {
                                "text": "unir_dados é executada automaticamente de novo toda vez que carregar_dw termina.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tarefas, dependências e ordem de execução",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tarefas, dependências e ordem de execução\n\nUma tarefa (task) é a menor unidade de trabalho dentro de um DAG: um passo com início, fim e um status próprio (em execução, sucesso, falha). Cada task normalmente faz uma coisa bem definida, como extrair um conjunto de dados, transformar uma tabela ou verificar se um arquivo chegou. A forma como essas tasks se conectam determina a ordem em que o pipeline pode rodar."
                    },
                    {
                        "type": "text",
                        "value": "## Upstream e downstream na prática\n\nUma task pode ter mais de uma dependência upstream (esperar várias tasks terminarem antes de começar) e mais de uma task downstream (várias tasks esperando por ela). Isso é normal em pipelines reais: uma task de união de dados costuma esperar por duas ou mais transformações em paralelo, e uma task de carga costuma alimentar mais de um consumidor depois dela."
                    },
                    {
                        "type": "code",
                        "value": "extrair_pedidos -> transformar_pedidos -> validar_pedidos -> unir_dados -> carregar_dw\nextrair_clientes -> transformar_clientes -> unir_dados"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tarefa\",\"Duração estimada\",\"Depende de\"],[\"extrair_pedidos\",\"10 min\",\"(nenhuma)\"],[\"transformar_pedidos\",\"15 min\",\"extrair_pedidos\"],[\"validar_pedidos\",\"5 min\",\"transformar_pedidos\"],[\"extrair_clientes\",\"4 min\",\"(nenhuma)\"],[\"transformar_clientes\",\"6 min\",\"extrair_clientes\"],[\"unir_dados\",\"8 min\",\"validar_pedidos, transformar_clientes\"],[\"carregar_dw\",\"3 min\",\"unir_dados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O tempo total do pipeline não é a soma da duração de todas as tasks: é a soma das tasks no caminho mais longo entre dependências, o caminho crítico. Acelerar uma task fora desse caminho não muda o tempo final."
                    },
                    {
                        "type": "text",
                        "value": "## Paralelismo possível x paralelismo real\n\nO DAG mostra quais tasks poderiam rodar ao mesmo tempo, por não dependerem uma da outra: no exemplo acima, `extrair_pedidos` e `extrair_clientes` não têm relação de dependência entre si. Mas isso é paralelismo possível, não garantido. Se o orquestrador só tiver capacidade para rodar uma task por vez, ou se um limite de concorrência estiver configurado, essas tasks vão disputar recursos e acabar rodando em sequência, mesmo sem depender uma da outra."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nEntender tasks, dependências e caminho crítico é o que permite desenhar um DAG que reflete a realidade do pipeline, sem dependências falsas e sem gargalos escondidos. A próxima aula fecha o módulo 1 olhando para as ferramentas que implementam tudo isso: Airflow, Dagster e Prefect."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que melhor define uma task dentro de um DAG?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um conjunto de vários DAGs relacionados que compartilham o mesmo agendamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A menor unidade de trabalho do pipeline, com início, fim e status próprio.",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome técnico dado ao arquivo Python onde o pipeline inteiro é definido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia do DAG usada apenas para testes antes de ir para produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline tem dois ramos independentes que convergem numa tarefa final. Ramo 1: extrair (8 min) seguido de transformar (12 min). Ramo 2: extrair_b (5 min) seguido de transformar_b (5 min). Os dois ramos alimentam a tarefa unir (4 min), que só roda depois que ambos terminarem. Supondo que os dois ramos comecem juntos e rodem em paralelo, quanto tempo leva o pipeline inteiro, do início ao fim?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "14 minutos: supondo que a tarefa final começa assim que o ramo mais curto termina, sem esperar o outro ramo.",
                                "isCorrect": false
                            },
                            {
                                "text": "34 minutos: somando a duração de todas as tarefas dos dois ramos, mais a tarefa final de união.",
                                "isCorrect": false
                            },
                            {
                                "text": "20 minutos: contando apenas o ramo mais longo, sem somar a duração da tarefa final de união.",
                                "isCorrect": false
                            },
                            {
                                "text": "24 minutos: o pipeline segue o ritmo do ramo mais longo (20 minutos) e só depois soma a tarefa final (4 minutos).",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O DAG de um pipeline permite que extrair_pedidos e extrair_clientes rodem ao mesmo tempo, já que uma não depende da outra. Mesmo assim, no ambiente de produção, as duas tasks estão sempre rodando em sequência, nunca simultaneamente. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A estrutura permite paralelismo, mas a capacidade do ambiente (workers ou slots) limita quantas tasks rodam ao mesmo tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Tasks sem nenhuma dependência entre si são automaticamente proibidas de rodar em paralelo pelo próprio formato de DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas tasks pertencem ao mesmo DAG, e tasks de um mesmo DAG nunca podem rodar simultaneamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome das tasks começa com a mesma palavra (extrair), e o orquestrador agrupa tasks parecidas na mesma fila.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No pipeline com dois ramos paralelos que convergem numa tarefa de união (ramo 1 leva 20 minutos ao todo; ramo 2 leva 10 minutos ao todo), um atraso de 5 minutos em qual ramo adia a entrega final do pipeline?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um atraso no ramo 2, porque ramos mais curtos são sempre mais sensíveis a atrasos do que ramos longos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um atraso em qualquer um dos dois ramos tem exatamente o mesmo impacto no tempo final do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um atraso no ramo 1: ele já é o caminho mais longo (crítico), então qualquer atraso nele se propaga até o fim.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum atraso de 5 minutos chega a afetar o tempo final, já que o orquestrador absorve atrasos automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A task unir_dados só pode começar depois que validar_pedidos e transformar_clientes tiverem terminado com sucesso. Quantas dependências upstream diretas unir_dados tem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma: apenas a última tarefa da lista é considerada dependência direta, a outra é indireta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duas: validar_pedidos e transformar_clientes precisam terminar antes de unir_dados começar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma: tasks que convergem de ramos diferentes não contam como dependência upstream direta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quatro: cada tarefa upstream conta em dobro quando existe convergência entre dois ramos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O panorama de ferramentas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O panorama de ferramentas\n\nOs conceitos vistos até aqui (DAG, task, dependência, agendamento) não pertencem a uma ferramenta específica: são o modelo mental por trás de qualquer orquestrador de dados. Na prática, três ferramentas dominam esse espaço hoje, cada uma com uma filosofia própria sobre como declarar e organizar pipelines: Apache Airflow, Dagster e Prefect."
                    },
                    {
                        "type": "text",
                        "value": "## Apache Airflow\n\nÉ a ferramenta mais adotada do mercado e a referência principal deste curso. Um DAG no Airflow é definido como código Python: você declara tasks e as conecta com operadores de dependência. O foco do Airflow está na task, no que precisa rodar e em que ordem. Tem o maior ecossistema de integrações prontas (providers) para bancos, nuvens e ferramentas de dados, o que pesa a favor em ambientes heterogêneos."
                    },
                    {
                        "type": "text",
                        "value": "## Dagster\n\nDagster muda o centro das atenções da task para o dado que ela produz, chamado de 'asset'. Em vez de pensar só em rodar a task X depois da task Y, você declara que uma tabela depende de dois datasets específicos, e o Dagster infere boa parte do grafo de execução a partir dessas dependências de dados. Isso vem com um foco maior em tipagem, testes e qualidade dos dados gerados em cada etapa."
                    },
                    {
                        "type": "text",
                        "value": "## Prefect\n\nPrefect prioriza a experiência Python pura: um pipeline pode ser escrito quase como uma função Python comum, decorada para virar um 'flow', com as tasks também viradas funções decoradas. A proposta é reduzir a distância entre um script que você já escreve e um pipeline orquestrado, com suporte natural a fluxos mais dinâmicos, em que o número de tasks só é conhecido durante a execução."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\",\"Unidade central\",\"Filosofia em uma frase\"],[\"Apache Airflow\",\"Task\",\"DAGs como código Python, foco em ordem e dependência entre tarefas\"],[\"Dagster\",\"Asset (dado)\",\"Declarar os dados e suas dependências; o grafo de tasks vem depois\"],[\"Prefect\",\"Flow (função Python)\",\"Pipelines pythônicos e dinâmicos, perto de um script comum\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A ferramenta muda a sintaxe e o ponto de partida, mas o problema que ela resolve é sempre o mesmo: decidir quando, em que ordem e com que garantias um conjunto de tarefas deve rodar."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nEste módulo cobriu por que orquestrar, o que um orquestrador faz (e não faz), o que é um DAG e como tasks se conectam nele, além do panorama de ferramentas disponíveis. A partir daqui, o curso aprofunda no Airflow especificamente, começando pela arquitetura por trás de cada DAG: scheduler, executor, workers e banco de metadados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa com muitas integrações diferentes (vários bancos, provedores de nuvem, ferramentas de terceiros) quer minimizar o esforço de conectar o orquestrador a cada uma dessas fontes, aproveitando integrações prontas mantidas pela comunidade. Historicamente, qual ferramenta se encaixa melhor nesse critério?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dagster, que prioriza o modelo orientado a assets em vez do tamanho do ecossistema de integrações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Prefect, que prioriza a experiência pythônica em vez do tamanho do ecossistema disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Luigi, um orquestrador mais antigo, hoje com comunidade e ecossistema bem menores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apache Airflow, que soma tempo de mercado e o maior catálogo de integrações prontas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer modelar o pipeline em torno dos dados que cada etapa produz, declarando explicitamente que a tabela final depende de dois datasets específicos, com foco em rastrear a qualidade e a linhagem de cada asset gerado. Qual filosofia de ferramenta se encaixa melhor nessa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A filosofia orientada a assets, em que o pipeline gira em torno dos dados e de suas dependências, associada ao Dagster.",
                                "isCorrect": true
                            },
                            {
                                "text": "A filosofia orientada a tasks, em que o pipeline gira em torno da ordem de execução dos passos, associada ao Apache Airflow.",
                                "isCorrect": false
                            },
                            {
                                "text": "A filosofia pythônica e dinâmica, em que o pipeline é escrito quase como um script comum, associada ao Prefect.",
                                "isCorrect": false
                            },
                            {
                                "text": "A filosofia orientada a filas de mensagens, em que o pipeline reage a eventos individuais em tempo real, sem grafo fixo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe já tem vários scripts Python soltos e quer migrar para um orquestrador com a menor mudança possível de estilo de código. Além disso, o número de arquivos a processar em cada execução só é conhecido durante a própria execução, então o pipeline precisa criar tasks dinamicamente nesse momento. Qual filosofia se encaixa melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A filosofia orientada a assets do Dagster, que exige declarar previamente cada dataset produzido antes de qualquer execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "A filosofia orientada a tasks do Apache Airflow, que historicamente pressupõe um número de tasks fixo e conhecido de antemão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A filosofia pythônica e dinâmica do Prefect, próxima de um script comum, que lida bem com tasks conhecidas em tempo de execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "A filosofia orientada a filas do RabbitMQ, que trata cada arquivo novo como um evento publicado num tópico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Apesar das diferenças de filosofia entre Airflow, Dagster e Prefect, qual afirmação sobre as três ferramentas é verdadeira?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Apenas o Airflow usa o conceito de dependência entre tarefas; Dagster e Prefect não têm noção de ordem de execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "As três ainda organizam o trabalho como um grafo de dependências, decidindo quando e em que ordem cada parte roda.",
                                "isCorrect": true
                            },
                            {
                                "text": "As três ferramentas processam os dados diretamente dentro do próprio motor de orquestração, sem depender de nenhum sistema externo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas uma das três ferramentas permite definir pipelines usando código Python; as outras duas usam somente arquivos YAML.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide começar com Apache Airflow, apesar de achar interessante o modelo orientado a assets do Dagster, porque a organização já usa dezenas de integrações prontas com bancos e provedores de nuvem, e quer aproveitar um ecossistema maduro. Essa é uma justificativa técnica válida para a escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, porque a única coisa que deveria pesar na escolha de um orquestrador é a filosofia de modelagem, nunca o ecossistema disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque ferramentas com um ecossistema maior de integrações prontas são sempre mais lentas para executar pipelines.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só porque o Dagster ainda não permite definir pipelines usando a linguagem Python, o que tornaria a migração inviável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim: o tamanho do ecossistema de integrações e a maturidade da ferramenta são critérios legítimos, além da filosofia preferida.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Airflow: a arquitetura",
        "aulas": [
            {
                "titulo": "Componentes do Airflow",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Componentes do Airflow\n\nO Airflow não é um programa único: é um conjunto de processos independentes que cooperam para agendar, executar e monitorar tarefas. Entender o papel de cada componente é o primeiro passo para diagnosticar problemas e dimensionar um ambiente de produção.\n\nCinco peças aparecem em praticamente toda instalação: **scheduler**, **executor**, **workers**, **metadata database** e **webserver**. Este módulo foca no Airflow, por ser a referência mais usada no mercado; Dagster e Prefect resolvem os mesmos problemas com peças e nomes próprios, mas os papéis (algo que agenda, algo que executa, algo que guarda estado) se repetem em qualquer orquestrador."
                    },
                    {
                        "type": "text",
                        "value": "## Scheduler\n\nO scheduler é o coração do Airflow. Em loop contínuo, ele:\n\n- Lê os arquivos da pasta `dags/` e monta a representação de cada DAG.\n- Verifica quais tasks têm as dependências satisfeitas e quais DAG runs precisam começar, de acordo com o schedule configurado.\n- Envia as tasks prontas para o executor, que cuida de colocá-las para rodar.\n\nSe o scheduler para, nenhuma task nova é agendada: o resto do ambiente fica parado esperando, mesmo que workers e webserver continuem no ar."
                    },
                    {
                        "type": "text",
                        "value": "## Executor\n\nO executor é a peça que decide **como e onde** o código de cada task roda. Ele não substitui o scheduler: recebe dele a lista de tasks prontas e define a estratégia de despacho para os workers.\n\nExistem vários executors (LocalExecutor, CeleryExecutor, KubernetesExecutor, entre outros), cada um com uma forma diferente de acionar os workers. Escolher entre eles é uma decisão de escala, tema da última aula deste módulo."
                    },
                    {
                        "type": "text",
                        "value": "## Workers e metadata database\n\nOs **workers** são os processos que efetivamente executam o código da task: rodar uma função Python, disparar um comando, chamar uma API. Dependendo do executor, um worker pode ser um subprocesso na mesma máquina do scheduler ou uma máquina (ou pod) totalmente separada.\n\nO **metadata database** é o banco relacional (Postgres ou MySQL, tipicamente) onde o Airflow guarda o estado de cada DAG run e task instance, variáveis, conexões e o histórico de execuções. É o ponto de encontro que permite a scheduler, webserver e workers enxergarem o mesmo estado do ambiente."
                    },
                    {
                        "type": "text",
                        "value": "## Webserver\n\nO webserver serve a interface web do Airflow: a tela onde você acompanha DAGs e runs, inspeciona o status de cada task e pode disparar execuções manuais. Ele lê o estado das execuções no metadata database e os logs no armazenamento configurado para eles; não participa da decisão de quando ou como uma task roda."
                    },
                    {
                        "type": "code",
                        "value": "dags/*.py\n   |\n   |  parseia e agenda\n   v\n+-----------+      entrega tasks prontas      +-----------+\n| Scheduler | ------------------------------> |  Executor |\n+-----------+                                 +-----------+\n   |   ^                                            |\n   |   |                                            | despacha\n   v   |                                            v\n+---------------+                             +-----------+\n|  Metadata DB  | <-------------------------- |  Workers  |\n| (Postgres ou  |          grava estado        +-----------+\n|    MySQL)     |\n+---------------+\n   ^\n   |  le estado\n   |\n+-----------+\n| Webserver | ---> UI no navegador\n+-----------+"
                    },
                    {
                        "type": "quote",
                        "value": "O metadata database é o ponto de encontro entre scheduler, webserver e workers: é ali que os três enxergam o mesmo estado do ambiente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Os DAGs de um ambiente Airflow pararam de gerar novas execuções, embora o webserver continue respondendo normalmente e os workers estejam ociosos, sem nada na fila. Qual componente deve ser investigado primeiro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O metadata database, pois é ele quem decide quando cada execução deve começar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scheduler, pois é ele quem decide quando cada execução deve começar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O executor, pois é ele quem decide quando cada execução deve começar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O webserver, pois é ele quem decide quando cada execução deve começar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro quer aumentar a capacidade de execução paralela do ambiente, adicionando mais máquinas que executam de fato o código das tasks, sem alterar a lógica de nenhum DAG. Isso significa, principalmente, adicionar mais:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Executors, que são os processos responsáveis por executar o código de cada task.",
                                "isCorrect": false
                            },
                            {
                                "text": "Workers, que são os processos responsáveis por executar o código de cada task.",
                                "isCorrect": true
                            },
                            {
                                "text": "Schedulers, que são os processos responsáveis por executar o código de cada task.",
                                "isCorrect": false
                            },
                            {
                                "text": "Webservers, que são os processos responsáveis por executar o código de cada task.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de reiniciar o webserver, um analista percebe que o histórico de execuções, as conexões cadastradas e as variáveis do Airflow continuam intactos e visíveis na interface. Isso acontece porque esse estado vive em qual componente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No próprio webserver, que persiste esse estado em disco a cada reinício.",
                                "isCorrect": false
                            },
                            {
                                "text": "No metadata database, que guarda esse estado de forma independente do webserver.",
                                "isCorrect": true
                            },
                            {
                                "text": "No scheduler, que mantém esse estado em memória e o repassa ao webserver.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nos workers, que guardam esse estado distribuído entre as máquinas de execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário clica em 'Trigger DAG' na interface do Airflow para disparar uma execução manual imediata. O que exatamente essa ação faz, em termos de arquitetura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O webserver aciona diretamente o executor, pulando o scheduler para acelerar o início da execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "O webserver assume temporariamente o papel do scheduler só para essa execução manual específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O webserver envia a execução direto para um worker livre, sem passar pelo metadata database.",
                                "isCorrect": false
                            },
                            {
                                "text": "O webserver grava uma DAG run no metadata database; no próximo ciclo, o scheduler aciona as tasks.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A interface web do Airflow está lenta para carregar páginas de histórico de execuções, mas as tasks continuam sendo agendadas e executadas no horário certo, sem atrasos. Isso sugere um problema concentrado em qual componente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No scheduler, já que ele serve apenas a interface, sem afetar o agendamento das tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "No webserver, já que ele serve apenas a interface, sem afetar o agendamento das tasks.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nos workers, já que eles servem apenas a interface, sem afetar o agendamento das tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "No executor, já que ele serve apenas a interface, sem afetar o agendamento das tasks.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Como um DAG é definido em Python",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Como um DAG é definido em Python\n\nNo Airflow, um pipeline não é configurado numa tela ou em YAML: é escrito em Python puro. Um arquivo `.py` na pasta `dags/` declara um objeto `DAG`, cria as tasks e liga as dependências entre elas. Esse arquivo é a única fonte de verdade sobre a estrutura do pipeline."
                    },
                    {
                        "type": "text",
                        "value": "## O objeto DAG\n\nUm DAG é instanciado a partir da classe `DAG`, com um `dag_id` único e parâmetros que definem seu comportamento: agenda, data de início, se deve rodar execuções passadas (`catchup`), argumentos padrão aplicados a todas as tasks (`default_args`), entre outros.\n\nUm mesmo arquivo pode, tecnicamente, declarar mais de um DAG, mas a prática mais comum é um arquivo por DAG, com nome claro e fácil de rastrear no código."
                    },
                    {
                        "type": "code",
                        "value": "from datetime import datetime\nfrom airflow import DAG\nfrom airflow.operators.python import PythonOperator\nfrom airflow.operators.bash import BashOperator\n\nwith DAG(\n    dag_id='pipeline_vendas',\n    schedule='0 6 * * *',\n    start_date=datetime(2024, 1, 1),\n    catchup=False,\n    default_args={'retries': 2},\n) as dag:\n\n    extrair = BashOperator(\n        task_id='extrair_dados',\n        bash_command='python extrai.py',\n    )\n\n    def transformar_dados():\n        # logica de transformacao dos dados extraidos\n        pass\n\n    transformar = PythonOperator(\n        task_id='transformar_dados',\n        python_callable=transformar_dados,\n    )\n\n    extrair >> transformar"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Parâmetro\", \"O que define\"], [\"dag_id\", \"Identificador único do DAG dentro do ambiente\"], [\"schedule\", \"Frequência ou condição que dispara novas execuções\"], [\"start_date\", \"Data a partir da qual o Airflow passa a considerar execuções\"], [\"catchup\", \"Se o Airflow deve criar execuções retroativas até hoje\"], [\"default_args\", \"Argumentos aplicados a todas as tasks do DAG (ex.: retries)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Dependências e o operador `>>`\n\nA última linha do exemplo, `extrair >> transformar`, é o que declara a dependência: `transformar` só pode começar depois que `extrair` terminar com sucesso. O Airflow lê essa relação para montar o grafo do DAG; encadear tasks de formas mais elaboradas é um tema aprofundado mais adiante nesta trilha."
                    },
                    {
                        "type": "text",
                        "value": "## A pasta `dags/` e a leitura pelo Airflow\n\nTodo arquivo Python colocado na pasta configurada como `dags_folder` é candidato a conter DAGs. Periodicamente, o scheduler varre essa pasta, importa cada arquivo `.py` e procura por objetos `DAG` no escopo do módulo.\n\nQualquer DAG encontrado nessa varredura passa a aparecer na interface e a ser considerado para agendamento. Se o arquivo tiver um erro de sintaxe ou uma importação quebrada, o DAG inteiro falha ao carregar, e o erro costuma aparecer numa lista de erros de importação na tela inicial."
                    },
                    {
                        "type": "quote",
                        "value": "Se o Airflow não consegue importar o arquivo Python sem erros, o DAG simplesmente não existe para o scheduler: não há execução parcial de um arquivo quebrado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista escreve um arquivo Python em que o objeto `DAG` só é criado dentro de uma função que nunca chega a ser chamada durante a importação do módulo. O que acontece quando o scheduler varre a pasta `dags/`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O DAG aparece na interface, porém fica pausado até alguém chamar a função manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Airflow chama a função automaticamente ao importar o arquivo, e o DAG aparece normalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Airflow rejeita o arquivo inteiro com erro de importação, pois todo DAG deve estar fora de funções.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo é importado sem erro, mas nenhum DAG aparece, pois o objeto nunca chega a ser criado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe cria um arquivo `relatorio_diario.py` com um DAG válido, mas salva o arquivo numa pasta de utilitários fora do `dags_folder` configurado. O que acontece com esse DAG?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele nunca aparece na interface, pois o scheduler só varre o `dags_folder` configurado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele aparece pausado na interface, pois o scheduler indexa qualquer `.py` do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele aparece normalmente, pois o Airflow busca DAGs em todo o sistema de arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele só aparece depois de um restart manual do webserver, mesmo fora do `dags_folder`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DAG precisa transformar os dados, depois carregá-los no destino e, por fim, rodar uma validação de qualidade como última etapa. Qual declaração de dependências representa essa ordem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "transformar >> validar >> carregar",
                                "isCorrect": false
                            },
                            {
                                "text": "validar >> transformar >> carregar",
                                "isCorrect": false
                            },
                            {
                                "text": "carregar >> transformar >> validar",
                                "isCorrect": false
                            },
                            {
                                "text": "transformar >> carregar >> validar",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um DAG que funcionava há meses deixa de aparecer na interface do Airflow depois de uma alteração que adicionou a importação de uma biblioteca não instalada no ambiente. Qual é a causa mais provável e onde investigar primeiro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O DAG foi pausado automaticamente por segurança; basta reativá-lo na tela inicial para voltar a funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O metadata database descartou o DAG por inconsistência; é preciso recriar o `dag_id` do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "O arquivo falha ao ser importado; o erro aparece na lista de erros de importação da interface.",
                                "isCorrect": true
                            },
                            {
                                "text": "O worker que executaria o DAG ficou sem memória disponível; é preciso reiniciar o processo do worker.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task é criada com o decorator `@task` em vez de instanciar `PythonOperator` diretamente. Em termos de arquitetura, o que isso muda sobre como o scheduler enxerga essa task?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A task deixa de aparecer no grafo do DAG, pois o TaskFlow roda fora do fluxo normal de dependências.",
                                "isCorrect": false
                            },
                            {
                                "text": "Praticamente nada: o decorator é uma forma mais concisa de escrever uma task equivalente a um operator.",
                                "isCorrect": true
                            },
                            {
                                "text": "O scheduler passa a executar essa task fora do executor configurado, direto no seu próprio processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O metadata database para de registrar o estado dessa task, já que ela não é mais um operator tradicional.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Operators, sensors e hooks",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Operators, sensors e hooks\n\nDepois de ver como um DAG é escrito e quais componentes o executam, falta a peça que define o que cada task realmente faz. O Airflow oferece três abstrações complementares para isso: **operator**, **sensor** e **hook**."
                    },
                    {
                        "type": "text",
                        "value": "## Operator: a unidade de trabalho\n\nUm operator é um molde para uma task: descreve uma ação específica, como rodar um comando (`BashOperator`), executar uma função Python (`PythonOperator`) ou disparar uma query SQL. Quando um operator é instanciado dentro de um DAG, ele vira uma task.\n\nA recomendação geral é usar um operator já pronto quando ele existir para o sistema envolvido, em vez de reescrever a integração do zero com código solto."
                    },
                    {
                        "type": "text",
                        "value": "## Sensor: esperar por uma condição\n\nUm sensor é um tipo especial de operator cujo trabalho é esperar: ficar checando, em intervalos, se uma condição ficou verdadeira, como um arquivo aparecer num diretório, uma partição existir numa tabela ou outra DAG ter terminado. Só depois disso as tasks seguintes são liberadas.\n\nNo modo padrão (`poke`), um sensor ocupa um slot de worker enquanto espera. Em esperas longas, o modo `reschedule` libera o worker entre uma checagem e outra, evitando prender recursos por horas."
                    },
                    {
                        "type": "text",
                        "value": "## Hook: a conexão com sistemas externos\n\nUm hook é uma interface reutilizável para falar com um sistema externo (um banco, uma API, um serviço de nuvem), cuidando de detalhes como autenticação a partir de uma Connection cadastrada no Airflow. Um hook, sozinho, não é uma task: ele é usado por dentro de um operator (muitos operators prontos usam um hook internamente) ou dentro do código de uma `PythonOperator` quando a lógica é customizada."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.operators.python import PythonOperator\nfrom airflow.providers.postgres.hooks.postgres import PostgresHook\n\ndef contar_pedidos_do_dia():\n    hook = PostgresHook(postgres_conn_id='dw_vendas')\n    total = hook.get_first('select count(*) from pedidos where data = current_date')\n    if total[0] == 0:\n        raise ValueError('nenhum pedido encontrado para hoje')\n\nchecar_volume = PythonOperator(\n    task_id='checar_volume_pedidos',\n    python_callable=contar_pedidos_do_dia,\n)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Abstração\", \"Pergunta que responde\", \"Exemplo\"], [\"Operator\", \"O que essa task faz?\", \"BashOperator, PythonOperator\"], [\"Sensor\", \"Que condição preciso esperar antes de seguir?\", \"FileSensor, ExternalTaskSensor\"], [\"Hook\", \"Como eu me conecto a esse sistema?\", \"PostgresHook, S3Hook\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um sensor é um operator especializado em esperar; um hook não é uma task e nunca aparece sozinho no grafo do DAG, ele mora dentro do código de uma task."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma task precisa esperar um arquivo `pedidos_2026-07-13.csv` aparecer num diretório antes de seguir para o processamento. Qual abstração do Airflow resolve diretamente esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um sensor, que fica checando a condição até ela se tornar verdadeira.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um hook, que fica checando a condição até ela se tornar verdadeira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um operator comum, que fica checando a condição até ela se tornar verdadeira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma Connection, que fica checando a condição até ela se tornar verdadeira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time precisa consultar uma tabela do Postgres dentro do código Python de uma task para decidir se o pipeline deve prosseguir. Qual é a forma mais direta de fazer essa consulta sem criar um operator novo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Instanciar um novo `DAG` dentro da função, apontando para a tabela que precisa ser lida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instanciar um `PostgresHook` dentro da função e usá-lo para rodar a consulta diretamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma nova Connection dentro da função, que já executa a consulta sozinha ao ser criada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamar o `SqlSensor` dentro da função, que devolve o resultado da consulta como retorno.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe usa um `S3KeySensor` no modo padrão (`poke`), esperando um arquivo que costuma demorar até 6 horas para chegar. Depois de um tempo, o ambiente fica sem workers livres para outras tasks. Qual é a causa mais provável e o ajuste recomendado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O sensor em modo poke consome memória do metadata database a cada checagem; reduzir o timeout resolve.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `S3KeySensor` abre uma conexão persistente que trava o worker; trocar o sensor por um hook resolve.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sensor cria uma nova DAG run a cada checagem; limitar o `max_active_runs` para 1 resolve.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sensor em modo poke ocupa um worker durante a espera; `reschedule` libera o worker entre as checagens.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa descreve corretamente a relação entre sensor e operator no Airflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um operator é um tipo de sensor especializado em executar comandos diretos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sensor é independente de operator e hook, com execução própria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sensor é um tipo de operator especializado em esperar por uma condição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um sensor é um tipo de hook especializado em esperar por uma condição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline precisa enviar dados para uma API interna que ainda não tem nenhum operator pronto em nenhum provider do Airflow. A chamada é simples: um POST com um payload montado a partir do resultado de uma query. Qual abordagem exige menos esforço de manutenção, mantendo a integração dentro do modelo do Airflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar um `PythonOperator` que monta o payload e chama um `HttpHook` dentro da função.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever a chamada HTTP direto no `default_args` do DAG, fora de qualquer task específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um `HttpSensor` configurado para aguardar a API responder com sucesso de primeira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um novo operator do zero, herdando de `BaseOperator`, só para essa chamada pontual.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ciclo de vida de uma task e o scheduler",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ciclo de vida de uma task e o scheduler\n\nCada vez que uma task é agendada para rodar, ela passa por uma sequência de estados registrados no metadata database. Entender esses estados e o papel do scheduler em cada transição é essencial para diagnosticar pipelines lentos ou travados."
                    },
                    {
                        "type": "text",
                        "value": "## Os principais estados de uma task instance\n\n- **scheduled**: o scheduler verificou que as dependências foram satisfeitas e a task está pronta para ser enviada ao executor.\n- **queued**: a task foi entregue ao executor e aguarda um worker livre para começar.\n- **running**: a task está executando de fato num worker.\n- **success**: a execução terminou sem erros.\n- **failed**: a execução terminou com erro e não há mais tentativas de retry disponíveis.\n- **up_for_retry**: a execução falhou, mas ainda há tentativas de retry configuradas; a task volta para a fila depois do `retry_delay`.\n- **skipped**: a task foi deliberadamente pulada, por uma branch ou por uma trigger rule que não foi satisfeita.\n- **upstream_failed**: uma dependência direta falhou e a trigger rule padrão não deixa esta task rodar; ela nunca chega a `running`, diferente de uma falha própria."
                    },
                    {
                        "type": "code",
                        "value": "none -> scheduled -> queued -> running -> success\n                                   |\n                                   v\n                                 failed -> up_for_retry -> scheduled\n                                           (somente se restam tentativas)\n\nscheduled -> skipped\n   (quando a trigger rule nao e satisfeita por uma branch; nunca chega a running)\n\nscheduled -> upstream_failed\n   (quando uma upstream falha e a trigger rule padrao bloqueia esta task)"
                    },
                    {
                        "type": "text",
                        "value": "## O scheduler no centro do ciclo\n\nÉ o scheduler quem promove uma task de `none` para `scheduled`, assim que confirma que a agenda e as dependências (upstream, trigger rule) permitem o avanço. Dali em diante, é o executor quem move a task para `queued` e, por fim, para `running`, delegando o trabalho a um worker.\n\nQuando a execução termina, é o worker quem grava o resultado (`success` ou `failed`) de volta no metadata database. O scheduler lê esse resultado no ciclo seguinte e decide se libera as tasks downstream, se agenda um retry ou se marca tasks dependentes como puladas."
                    },
                    {
                        "type": "text",
                        "value": "## A fila e o gargalo mais comum\n\nUma task pode ficar em `queued` por um bom tempo sem que nada esteja quebrado: ela só está esperando um worker livre. Isso acontece quando o número de tasks prontas para rodar excede a capacidade configurada (parallelism, concorrência por DAG, pools). Nesses casos, o problema não é o scheduler nem a task em si, e sim a capacidade de execução disponível."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estado\", \"O que significa\"], [\"scheduled\", \"Dependências satisfeitas; pronta para o executor\"], [\"queued\", \"Entregue ao executor; aguardando worker livre\"], [\"running\", \"Em execução num worker\"], [\"success\", \"Terminou sem erros\"], [\"failed\", \"Terminou com erro e sem tentativas de retry restantes\"], [\"up_for_retry\", \"Falhou, mas volta para a fila após o retry_delay\"], [\"skipped\", \"Pulada por uma branch ou trigger rule\"], [\"upstream_failed\", \"Bloqueada porque uma upstream falhou\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma task presa em queued não está com defeito: está esperando por capacidade. O sintoma parece o mesmo de uma task travada, mas a causa é outra."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma task termina sua execução com erro, mas ainda tem duas tentativas de retry configuradas e restantes. Qual estado ela assume imediatamente após essa falha, antes de tentar de novo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "skipped",
                                "isCorrect": false
                            },
                            {
                                "text": "failed",
                                "isCorrect": false
                            },
                            {
                                "text": "up_for_retry",
                                "isCorrect": true
                            },
                            {
                                "text": "upstream_failed",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DAG tem 20 tasks prontas para rodar ao mesmo tempo, mas o ambiente só tem 4 workers disponíveis. Na interface, 16 tasks aparecem no estado `queued` por vários minutos, sem nenhuma mensagem de erro. Qual é a interpretação correta dessa situação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As tasks estão presas porque o metadata database perdeu a conexão com o executor.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tasks estão com falha silenciosa; o scheduler deveria movê-las para `failed` após alguns minutos.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tasks estão aguardando workers livres; o comportamento é esperado dado o limite de capacidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "As tasks estão aguardando o próximo `schedule` do DAG, já que passaram do horário previsto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task `notificar_erro` só deve rodar se alguma tarefa anterior falhar; nas demais situações, deve ser marcada como pulada automaticamente, sem nunca chegar a `running`. Isso é resultado de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma trigger rule que avalia as upstream e decide, antes de rodar, se a task deve ser pulada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma pool com capacidade zero atribuída só a essa task específica, impedindo a execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sensor que verifica o estado das upstream e cancela a execução após o timeout padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um retry configurado para essa task, que o Airflow interpreta como pulo automático sem erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que um worker termina a execução de uma task com sucesso, quem atualiza esse resultado no metadata database, e quem, em seguida, decide liberar a próxima task da cadeia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O scheduler grava o resultado; o worker lê esse resultado e decide liberar as tasks downstream.",
                                "isCorrect": false
                            },
                            {
                                "text": "O metadata database grava o resultado sozinho; o executor decide liberar as tasks downstream.",
                                "isCorrect": false
                            },
                            {
                                "text": "O executor grava o resultado; o webserver lê esse resultado e decide liberar as tasks downstream.",
                                "isCorrect": false
                            },
                            {
                                "text": "O worker grava o resultado; o scheduler lê esse resultado e decide liberar as tasks downstream.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time configura um alerta que dispara sempre que uma task assume o estado `up_for_retry`, tratando isso como falha definitiva do pipeline. Depois de um dia com instabilidade de rede resolvida por retries automáticos, o time recebe dezenas de alertas para tasks que, minutos depois, terminaram com sucesso. Qual é o problema na configuração do alerta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O problema é do scheduler, que deveria ter pulado direto para `failed` em vez de tentar de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O alerta está correto; `up_for_retry` só deveria ocorrer quando o pipeline já está definitivamente quebrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é da fila, que deveria ter descartado as tasks instáveis antes de chegarem a `running`.",
                                "isCorrect": false
                            },
                            {
                                "text": "O alerta confunde uma tentativa intermediária com falha definitiva; o retry ainda pode resolver sozinho.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Executors e escala",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Executors e escala\n\nA última aula deste módulo volta ao executor, apresentado na primeira aula, para responder a uma pergunta prática: quando o volume de tasks cresce, como o Airflow distribui esse trabalho, e qual executor escolher?"
                    },
                    {
                        "type": "text",
                        "value": "## SequentialExecutor e LocalExecutor: tudo numa única máquina\n\nO `SequentialExecutor`, padrão de instalações novas, roda uma task por vez, sem nenhum paralelismo; serve só para testar o Airflow localmente, nunca para produção.\n\nJá o `LocalExecutor` roda as tasks como processos paralelos na mesma máquina onde o scheduler está rodando. É simples de operar, sem infraestrutura adicional, mas o paralelismo máximo é limitado pela CPU e memória dessa única máquina. É uma escolha sólida para volumes pequenos ou médios."
                    },
                    {
                        "type": "text",
                        "value": "## CeleryExecutor: distribuindo entre vários workers\n\nO `CeleryExecutor` distribui as tasks entre um conjunto de workers, geralmente em máquinas separadas do scheduler, usando uma fila de mensagens (Redis ou RabbitMQ, tipicamente) como intermediária. Basta adicionar mais máquinas worker para aumentar a capacidade de execução paralela, sem tocar na lógica de nenhum DAG.\n\nEm troca da escala, há mais peças para operar: o broker de mensagens, o pool de workers e o monitoramento de cada um deles."
                    },
                    {
                        "type": "text",
                        "value": "## KubernetesExecutor: um pod por task\n\nO `KubernetesExecutor` sobe um pod novo no Kubernetes para cada task, com o isolamento e os recursos definidos só para aquela execução, e destrói o pod ao final. Não existe uma frota fixa de workers ociosos esperando trabalho: a capacidade cresce e encolhe conforme a demanda.\n\nO custo dessa elasticidade é o tempo de inicialização de cada pod, além da dependência de um cluster Kubernetes configurado e saudável."
                    },
                    {
                        "type": "code",
                        "value": "LocalExecutor\n  [ Scheduler e processos worker na mesma maquina ]\n\nCeleryExecutor\n  [ Scheduler ] -> [ Fila (Redis ou RabbitMQ) ] -> [ Worker 1 ] [ Worker 2 ] [ Worker 3 ]\n\nKubernetesExecutor\n  [ Scheduler ] -> [ API do Kubernetes ] -> [ Pod task A ] [ Pod task B ] (sobem e descem sob demanda)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Executor\", \"Onde as tasks rodam\", \"Boa escolha quando\"], [\"Sequential\", \"Uma a uma, no processo do scheduler\", \"Aprender ou testar o Airflow localmente\"], [\"Local\", \"Processos paralelos na máquina do scheduler\", \"Volume pequeno ou médio, operação simples\"], [\"Celery\", \"Pool de workers, geralmente em outras máquinas\", \"Alto volume constante, escala horizontal previsível\"], [\"Kubernetes\", \"Um pod isolado por task, sob demanda\", \"Cargas variáveis, isolamento por task, custo sob demanda\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Trocar de executor muda como e onde as tasks rodam, não muda o que cada DAG faz: a decisão de escala fica isolada da lógica do pipeline."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe está apenas aprendendo Airflow, rodando tudo num único notebook, sem nenhuma necessidade de paralelismo. Qual executor corresponde a esse cenário, sendo inclusive o padrão de uma instalação nova?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SequentialExecutor",
                                "isCorrect": true
                            },
                            {
                                "text": "LocalExecutor",
                                "isCorrect": false
                            },
                            {
                                "text": "KubernetesExecutor",
                                "isCorrect": false
                            },
                            {
                                "text": "CeleryExecutor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline cresceu de 10 para 300 tasks diárias, concentradas na mesma janela de horário. As tasks demoram cada vez mais para sair do estado `queued`, mesmo com o scheduler funcionando normalmente, e o time não quer depender de um cluster Kubernetes por enquanto. Qual mudança de executor resolve o gargalo com menor complexidade operacional adicional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Migrar do `LocalExecutor` para o `KubernetesExecutor`, mesmo sem um cluster Kubernetes disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar do `LocalExecutor` para o `SequentialExecutor`, reduzindo a concorrência para evitar a fila.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar do `LocalExecutor` para o `CeleryExecutor`, adicionando workers dedicados em outras máquinas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter o `LocalExecutor`, apenas aumentando o número de DAGs para distribuir melhor a carga.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As tasks de um DAG têm necessidades de recursos muito diferentes entre si (uma exige bastante memória por poucos minutos, outra é leve mas roda por horas), e o time quer cada uma isolada, sem competir por CPU ou memória com as demais, nem manter capacidade ociosa reservada o tempo todo. Qual executor atende melhor esse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "LocalExecutor, que isola cada task num processo com limite de memória definido automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "SequentialExecutor, que executa uma task de cada vez, eliminando qualquer disputa por recursos.",
                                "isCorrect": false
                            },
                            {
                                "text": "KubernetesExecutor, que cria um pod dedicado para cada task e o destrói assim que ela termina.",
                                "isCorrect": true
                            },
                            {
                                "text": "CeleryExecutor, que reserva um worker fixo e dedicado para cada task diferente do DAG.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal custo operacional de adotar o `CeleryExecutor` em troca do paralelismo distribuído entre máquinas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Manter e monitorar um broker de mensagens e um conjunto de workers separados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reescrever todos os DAGs para o formato de tasks exigido pelo Celery.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perder a capacidade de rodar mais de uma task por vez, diferente do LocalExecutor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o metadata database de um banco relacional para um banco NoSQL.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia fundamentalmente o `LocalExecutor` do `CeleryExecutor`?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O LocalExecutor roda uma task por vez; o CeleryExecutor também roda uma task por vez, mas com prioridade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O LocalExecutor roda as tasks na máquina do scheduler; o CeleryExecutor distribui entre workers separados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O LocalExecutor exige Kubernetes; o CeleryExecutor roda sem nenhuma infraestrutura extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "O LocalExecutor não permite retries; o CeleryExecutor adiciona retries automáticos a cada task.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Agendamento e execução no tempo",
        "aulas": [
            {
                "titulo": "Schedule interval e expressoes cron",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Schedule interval e expressoes cron\n\nTodo DAG precisa responder a uma pergunta simples: de quanto em quanto tempo ele deve rodar? Essa resposta vive no parametro `schedule` (em versoes mais antigas, `schedule_interval`) na definicao do DAG. Quem faz o trabalho pesado por baixo dos panos e a expressao **cron**, um formato de 5 campos usado por praticamente todo agendador desde os anos 70, adotado tambem pelo Airflow, pelo Dagster e pelo Prefect.\n\nDominar cron nao e opcional aqui: e a base para tudo que vem depois neste modulo, do calculo do data interval as decisoes de catchup."
                    },
                    {
                        "type": "text",
                        "value": "## Os cinco campos do cron\n\nUma expressao cron tem sempre 5 campos, separados por espaco, na ordem minuto, hora, dia do mes, mes e dia da semana. Cada campo aceita um valor fixo, um asterisco (`*`, significa qualquer valor), uma lista (`1,15`), um intervalo (`1-5`) ou um passo (`*/15`).\n\nUm detalhe que pega muita gente: quando dia do mes e dia da semana estao os dois restritos (nenhum dos dois e asterisco), o cron combina os dois com OU, nao com E. A task roda se qualquer um dos dois casar, nao exige os dois ao mesmo tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Campo\",\"Posicao\",\"Valores aceitos\"],[\"Minuto\",\"1o campo\",\"0 a 59\"],[\"Hora\",\"2o campo\",\"0 a 23\"],[\"Dia do mes\",\"3o campo\",\"1 a 31\"],[\"Mes\",\"4o campo\",\"1 a 12\"],[\"Dia da semana\",\"5o campo\",\"0 a 6 (0 e domingo)\"]]"
                    },
                    {
                        "type": "code",
                        "value": "0 0 * * *            todo dia, a meia-noite\n*/15 * * * *          a cada 15 minutos\n0 9 * * 1-5           as 9h, de segunda a sexta\n0 6,18 * * *          as 6h e as 18h, todo dia\n0 0 1 * *             a meia-noite do primeiro dia de cada mes\n30 2 * * 0            as 2h30, todo domingo"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Preset\",\"Cron equivalente\",\"Significado\"],[\"@once\",\"(sem equivalente fixo)\",\"Roda uma unica vez, no primeiro disparo\"],[\"@hourly\",\"0 * * * *\",\"Uma vez por hora, no minuto 0\"],[\"@daily\",\"0 0 * * *\",\"Uma vez por dia, a meia-noite\"],[\"@weekly\",\"0 0 * * 0\",\"Uma vez por semana, meia-noite de domingo\"],[\"@monthly\",\"0 0 1 * *\",\"Uma vez por mes, meia-noite do dia 1\"],[\"@yearly\",\"0 0 1 1 *\",\"Uma vez por ano, meia-noite de 1 de janeiro\"],[\"None\",\"(nenhum)\",\"Sem agendamento automatico; so dispara manual ou por evento\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O schedule de um DAG nao descreve um instante isolado: ele descreve um intervalo que se repete. Cada disparo representa a passagem de um desses intervalos, e essa ideia sustenta o conceito de data interval, visto na proxima aula."
                    },
                    {
                        "type": "code",
                        "value": "from airflow import DAG\nfrom datetime import datetime, timedelta\n\n# opcao 1: expressao cron explicita\ndag_cron = DAG(\n    dag_id=\"vendas_diario\",\n    schedule=\"0 6 * * *\",\n    start_date=datetime(2026, 1, 1),\n    catchup=False,\n)\n\n# opcao 2: preset, mais legivel para casos comuns\ndag_preset = DAG(\n    dag_id=\"vendas_diario_v2\",\n    schedule=\"@daily\",\n    start_date=datetime(2026, 1, 1),\n    catchup=False,\n)\n\n# opcao 3: intervalo fixo, nao amarrado a um horario do relogio\ndag_timedelta = DAG(\n    dag_id=\"verificacao_a_cada_6h\",\n    schedule=timedelta(hours=6),\n    start_date=datetime(2026, 1, 1),\n    catchup=False,\n)"
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma pipeline de vendas precisa rodar uma vez por dia, sempre a meia-noite. Qual valor de schedule atende diretamente esse requisito, sem escrever a expressao cron a mao?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "@hourly",
                                "isCorrect": false
                            },
                            {
                                "text": "@once",
                                "isCorrect": false
                            },
                            {
                                "text": "@daily",
                                "isCorrect": true
                            },
                            {
                                "text": "@weekly",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG foi configurada com schedule=\"0 9 * * 1-5\". Em que momentos ela e disparada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As 9h da manha, de segunda a sexta-feira",
                                "isCorrect": true
                            },
                            {
                                "text": "As 9h da manha, de domingo a sabado",
                                "isCorrect": false
                            },
                            {
                                "text": "A cada 9 minutos, de segunda a sexta-feira",
                                "isCorrect": false
                            },
                            {
                                "text": "As 9h da manha, apenas aos sabados e domingos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG foi configurada com schedule=\"0 8 15 * 1\" (dia do mes preenchido com 15 e dia da semana preenchido com 1, segunda-feira). Como o cron interpreta essa combinacao?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dispara as 8h somente quando o dia 15 cair numa segunda-feira, combinando os dois campos por E",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispara as 8h apenas no dia 15; o campo de dia da semana e ignorado quando o dia do mes ja esta definido",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispara as 8h apenas as segundas; o campo de dia do mes e ignorado quando o dia da semana ja esta definido",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispara as 8h todo dia 15 do mes e tambem toda segunda-feira, os dois casos combinados por OU",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe define schedule=timedelta(hours=6) em vez de uma expressao cron fixa como \"0 */6 * * *\". Qual e a diferenca pratica entre as duas abordagens?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O timedelta so passa a funcionar quando catchup esta desligado; com cron, o catchup nao tem nenhum efeito",
                                "isCorrect": false
                            },
                            {
                                "text": "O timedelta conta um intervalo fixo a partir do start_date; o cron ancora os disparos a horarios fixos do relogio",
                                "isCorrect": true
                            },
                            {
                                "text": "O timedelta permite que a DAG seja disparada por eventos externos; o cron restringe a DAG a disparos manuais",
                                "isCorrect": false
                            },
                            {
                                "text": "O timedelta define por quanto tempo a DAG pode ficar em execucao; o cron so controla o horario em que ela comeca",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG de carga historica deve ser executada manualmente, uma unica vez, sem nenhum agendamento automatico recorrente. Qual valor de schedule e o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "None, para que a DAG so seja disparada manualmente",
                                "isCorrect": true
                            },
                            {
                                "text": "@once, para que o Airflow ja agende uma unica execucao automatica",
                                "isCorrect": false
                            },
                            {
                                "text": "@daily, ajustando o start_date para o dia desejado",
                                "isCorrect": false
                            },
                            {
                                "text": "0 0 1 1 *, para que a DAG rode uma vez por ano",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Data interval e a logical date",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Data interval e a logical date\n\nEssa e a pergunta que mais gera confusao em quem comeca a mexer com Airflow: se uma DAG roda todo dia a meia-noite, a run do dia 10 processa os dados do dia 10 ou do dia 9? A resposta certa, do dia 9, parece contraintuitiva ate voce entender o conceito de data interval: cada run nao representa um instante, representa uma janela de tempo de dados."
                    },
                    {
                        "type": "text",
                        "value": "## data_interval_start e data_interval_end\n\nToda DAG run tem dois timestamps que delimitam a janela de dados sob sua responsabilidade: `data_interval_start` (inicio, inclusive) e `data_interval_end` (fim, exclusivo). Uma DAG com schedule `@daily` gera runs cuja janela e sempre um dia inteiro, por exemplo [09/01 00h, 10/01 00h).\n\nO ponto chave: o Airflow so considera essa janela fechada, e portanto pronta para ser processada, quando o data_interval_end chega. E por isso que a run so dispara depois que o periodo que ela representa termina."
                    },
                    {
                        "type": "quote",
                        "value": "Uma run nunca processa o periodo em que ela dispara. Ela processa o periodo anterior, que acabou de fechar. A run do dia 10 as 00h00 tem como tarefa processar os dados do dia 9 inteiro."
                    },
                    {
                        "type": "code",
                        "value": "DAG: schedule=\"@daily\", start_date=2026-01-09\n\ndata interval               run dispara em      o que essa run processa\n[09/01 00h, 10/01 00h)      10/01 as 00h00      dados do dia 09/01 (dia fechado)\n[10/01 00h, 11/01 00h)      11/01 as 00h00      dados do dia 10/01 (dia fechado)\n[11/01 00h, 12/01 00h)      12/01 as 00h00      dados do dia 11/01 (dia fechado)\n\nrepare: a primeira run so acontece em 10/01, um dia depois do start_date"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\",\"O que representa\"],[\"logical_date (antigo execution_date)\",\"Inicio do data interval da run; identifica a run, nao o horario real em que ela rodou\"],[\"data_interval_start\",\"Inicio da janela de dados que a run processa (inclusive)\"],[\"data_interval_end\",\"Fim da janela de dados que a run processa (exclusivo); tambem e quando a run dispara\"],[\"Hora real de execucao\",\"Pode ser depois de data_interval_end, se o scheduler estiver ocupado ou a fila cheia\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from airflow.decorators import task\n\n@task\ndef extrair_pedidos(data_interval_start=None, data_interval_end=None):\n    # filtra exatamente a janela que esta run representa, nunca \"hoje\"\n    query = (\n        \"SELECT * FROM pedidos \"\n        f\"WHERE criado_em >= '{data_interval_start}' \"\n        f\"AND criado_em < '{data_interval_end}'\"\n    )\n    return executar_query(query)\n\n# em SQL templado com Jinja, o equivalente e:\n# WHERE criado_em >= '{{ data_interval_start }}' AND criado_em < '{{ data_interval_end }}'\n# ou, para granularidade de dia: WHERE data = '{{ ds }}'"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa para o ETL\n\nFiltrar pelo data interval da run, e nao por datetime.now(), e o que torna uma task reexecutavel com seguranca: rodar de novo a run do dia 9, hoje ou daqui a um mes, sempre processa exatamente os dados do dia 9. Usar \"hoje\" quebra esse contrato e e uma causa comum de bug sutil em pipelines agendados. Essa ideia volta com forca quando falarmos de idempotencia, no modulo de confiabilidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em uma DAG com schedule \"@daily\", o que o data_interval de uma run representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O instante exato do relogio de sistema em que o scheduler efetivamente disparou aquela run",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo maximo que a run pode ficar em execucao antes de ser marcada como uma falha",
                                "isCorrect": false
                            },
                            {
                                "text": "O intervalo entre o fim de uma run e o inicio da proxima run, usado para liberar recursos",
                                "isCorrect": false
                            },
                            {
                                "text": "A janela de dados pela qual aquela run e responsavel, com inicio inclusive e fim exclusivo",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG tem schedule=\"@daily\" e start_date=datetime(2026,3,1). Como o Airflow so dispara uma run apos o data interval dela se fechar, quando acontece a primeira execucao e qual periodo ela processa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A primeira run dispara em 1 de marco, as 00h, e processa os dados de 1 de marco",
                                "isCorrect": false
                            },
                            {
                                "text": "A primeira run dispara em 2 de marco, as 00h, e processa os dados de 1 de marco",
                                "isCorrect": true
                            },
                            {
                                "text": "A primeira run dispara em 1 de marco, as 00h, e processa os dados de 28 de fevereiro",
                                "isCorrect": false
                            },
                            {
                                "text": "A primeira run dispara em 2 de marco, as 00h, e processa os dados de 2 de marco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task precisa extrair somente os registros criados durante o periodo que a run representa, de forma que reexecutar essa mesma run sempre traga o mesmo resultado. Qual abordagem atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Filtrar usando datetime.now(), o horario do sistema no momento em que a task e executada",
                                "isCorrect": false
                            },
                            {
                                "text": "Filtrar usando a data em que a DAG foi implantada no ambiente de producao",
                                "isCorrect": false
                            },
                            {
                                "text": "Filtrar usando data_interval_start e data_interval_end da propria run, via template ou parametro",
                                "isCorrect": true
                            },
                            {
                                "text": "Filtrar usando o horario em que o scheduler efetivamente disparou a run, e nao o data interval",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O Airflow renomeou a variavel execution_date para logical_date, mantendo execution_date como alias por compatibilidade. Por que essa mudanca de nome foi feita?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque execution_date era exclusiva de versoes antigas e precisou ser trocada por um nome compativel com Python 3.9",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque logical_date passou a marcar o fim do data interval, enquanto execution_date marcava o inicio dele",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque execution_date funcionava so em DAGs com cron, perdendo sentido em DAGs com schedule por timedelta",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque execution_date sugeria o horario real de execucao, mas o valor sempre foi o inicio do data interval da run",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG diaria extrai pedidos usando WHERE data_pedido = CURRENT_DATE em vez de filtrar pelo data_interval da run. Ao rodar um backfill para os ultimos 30 dias, qual problema essa escolha causa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Todas as 30 runs do backfill extraem os pedidos do dia atual, e nao o dia que lhe cabia",
                                "isCorrect": true
                            },
                            {
                                "text": "O backfill falha imediatamente, porque CURRENT_DATE nao e uma funcao valida dentro de tasks do Airflow",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada run do backfill extrai um dia a mais do que deveria, por causa do fim exclusivo do data interval",
                                "isCorrect": false
                            },
                            {
                                "text": "As 30 runs do backfill rodam em paralelo sem controle, porque CURRENT_DATE ignora o max_active_runs",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Catchup e backfill automatico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Catchup e backfill automatico\n\nO que acontece quando voce cria uma DAG nova com start_date de seis meses atras? Por padrao, o Airflow tenta recuperar o tempo perdido: ele agenda e dispara uma run para cada intervalo que ja deveria ter acontecido entre o start_date e agora. Esse comportamento se chama catchup, e ignora-lo e uma causa classica de scheduler sobrecarregado no primeiro dia de uma DAG nova."
                    },
                    {
                        "type": "text",
                        "value": "## O que o catchup faz\n\nCom `catchup=True` (o padrao do Airflow), ao ser criada ou reativada, a DAG recebe uma run para cada data interval fechado entre `start_date` e o momento atual que ainda nao foi executado. Isso vale tanto para a primeira ativacao quanto para uma DAG que ficou pausada por um tempo: ao ser despausada, o Airflow completa o que faltou.\n\nCom `catchup=False`, o Airflow ignora o historico e agenda so a partir do intervalo mais recente. As runs passadas simplesmente nunca acontecem via agendamento automatico."
                    },
                    {
                        "type": "quote",
                        "value": "Catchup e o Airflow tentando ser consistente: se a DAG deveria ter rodado 40 vezes e so rodou 10, ele entende que ainda deve 30 runs a voce. A pergunta que importa e se voce realmente quer que ele cubra essa divida de uma vez so."
                    },
                    {
                        "type": "code",
                        "value": "DAG nova, criada hoje:\n  start_date = 2025-09-01\n  schedule   = \"@hourly\"\n  catchup    = True   (padrao)\n\nintervalo entre start_date e hoje (2026-07-13): cerca de 315 dias, ou 7560 horas\n\nresultado ao ativar a DAG:\n  7560 DAG runs sao agendadas de uma vez\n  cada uma dispara suas tasks (extracao, chamadas de API, etc)\n  se uma task chama uma API externa com limite de requisicoes,\n  o catchup pode estourar esse limite em poucos minutos\n\nessa e a avalanche de runs: sem nenhum limite, o backlog inteiro\ntenta rodar de uma vez, disputando slots do executor"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"catchup=True\",\"catchup=False\"],[\"Ao ativar a DAG\",\"Agenda uma run para cada intervalo perdido desde start_date\",\"Agenda so o intervalo mais recente\"],[\"Uso tipico\",\"Series historicas onde cada dia depende do anterior, como um saldo acumulado\",\"Cargas onde so o estado mais atual importa\"],[\"Risco principal\",\"Avalanche de runs se start_date for antigo e o schedule frequente\",\"Buracos no historico, que exigem backfill manual para preencher\"]]"
                    },
                    {
                        "type": "code",
                        "value": "from airflow import DAG\nfrom datetime import datetime\n\ndag = DAG(\n    dag_id=\"agregado_diario_vendas\",\n    schedule=\"@daily\",\n    start_date=datetime(2025, 9, 1),\n    catchup=False,\n)\n\n# quando for preciso reprocessar um periodo especifico de proposito,\n# isso e feito como backfill manual, nao via catchup automatico:\n# airflow dags backfill --start-date 2026-06-01 --end-date 2026-06-07 agregado_diario_vendas"
                    },
                    {
                        "type": "text",
                        "value": "## Catchup ligado nao precisa ser um risco\n\nSe a DAG realmente depende do historico, por exemplo um saldo que acumula dia a dia, desligar catchup nao resolve: ela vai gerar dados incompletos. Nesse caso, mantenha `catchup=True` e controle o impacto com `max_active_runs` (assunto da proxima aula), limitando quantas dessas runs atrasadas rodam ao mesmo tempo. Backfill manual, via CLI ou UI, continua sendo o jeito certo de reprocessar um intervalo especifico de forma deliberada, independente do valor de catchup."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o parametro catchup=True faz quando uma DAG e criada com um start_date no passado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ignora o start_date e comeca a agendar runs somente a partir do momento em que a DAG e criada",
                                "isCorrect": false
                            },
                            {
                                "text": "Agenda automaticamente uma run para cada intervalo ja fechado entre o start_date e agora",
                                "isCorrect": true
                            },
                            {
                                "text": "Bloqueia a DAG ate que um usuario aprove manualmente cada run atrasada",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga o historico de intervalos anteriores e comeca a contagem do zero",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG com schedule=\"@hourly\" e start_date de seis meses atras e ativada pela primeira vez com catchup=True e sem limite de execucoes simultaneas. O que tende a acontecer logo em seguida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apenas a run mais recente e agendada, porque o Airflow ignora automaticamente runs com mais de 24 horas de atraso",
                                "isCorrect": false
                            },
                            {
                                "text": "A DAG e pausada automaticamente pelo scheduler ate que o start_date seja corrigido manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Milhares de runs atrasadas disparam de uma vez, disputando slots do executor e sobrecarregando sistemas externos",
                                "isCorrect": true
                            },
                            {
                                "text": "As runs atrasadas sao descartadas e um alerta e enviado pedindo confirmacao para cada uma",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG ficou pausada por 10 dias por causa de uma manutencao, e tem catchup=False. Ao ser reativada, o que acontece com as runs desses 10 dias?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhuma delas e agendada automaticamente; se for preciso, precisam ser recuperadas via backfill manual",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas as 10 runs sao agendadas automaticamente assim que a DAG e reativada, na ordem cronologica",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas as runs de dias uteis dentro do periodo sao agendadas automaticamente, ignorando fins de semana",
                                "isCorrect": false
                            },
                            {
                                "text": "As 10 runs sao mescladas em uma unica run que processa o periodo inteiro de uma vez",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual e a diferenca essencial entre o catchup automatico e um backfill disparado manualmente para o mesmo intervalo de datas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O catchup roda as tasks isoladas em ambiente de teste; o backfill sempre executa direto contra o ambiente de producao",
                                "isCorrect": false
                            },
                            {
                                "text": "O catchup e o nome usado em versoes antigas do Airflow; backfill e o nome atual do mesmo mecanismo, apenas renomeado",
                                "isCorrect": false
                            },
                            {
                                "text": "O catchup reprocessa somente a run pendente mais recente; o backfill reprocessa obrigatoriamente o historico inteiro desde o start_date",
                                "isCorrect": false
                            },
                            {
                                "text": "O catchup e o scheduler disparando runs pendentes desde o start_date; backfill e o comando manual para um intervalo escolhido",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG calcula o saldo acumulado de uma conta, e cada dia depende do saldo calculado no dia anterior. Ela ficou tres semanas sem rodar por um problema de infraestrutura. Qual e a abordagem mais segura para recuperar o historico sem risco de saldos incorretos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir catchup=False, deixando a proxima run recalcular o saldo total e ignorar os dias intermediarios",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter catchup=True, com as runs das tres semanas rodando em ordem e concorrencia limitada por max_active_runs",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar manualmente so a run do dia mais recente, assumindo que o saldo dos dias anteriores deixou de importar",
                                "isCorrect": false
                            },
                            {
                                "text": "Excluir a DAG e recria-la com o start_date igual a data de hoje, descartando o periodo perdido inteiro",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "max_active_runs, timezones e nao sobreposicao",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# max_active_runs, timezones e nao sobreposicao\n\nTres perguntas praticas fecham o assunto de agendamento: quantas runs da mesma DAG podem existir ao mesmo tempo, em qual fuso horario ela deve rodar, e o que impede uma run de comecar antes da anterior terminar. As tres respostas moram na configuracao do DAG, e ignora-las e uma fonte comum de corrida de dados, com duas runs escrevendo na mesma tabela ao mesmo tempo, e de horarios que nunca batem com o esperado pelo negocio."
                    },
                    {
                        "type": "text",
                        "value": "## max_active_runs\n\n`max_active_runs` limita quantas DagRuns da mesma DAG podem estar ativas ao mesmo tempo. O padrao vem da configuracao global do Airflow (historicamente 16), mas cada DAG pode sobrescrever esse valor.\n\nQuando o limite e atingido, novas runs nao sao perdidas: elas ficam na fila, aguardando uma vaga, e disparam assim que uma run ativa terminar. Isso e diferente de limitar quantas tasks rodam ao mesmo tempo, que e o papel de `max_active_tasks` e dos pools, que valem para tasks, nao para runs inteiras."
                    },
                    {
                        "type": "code",
                        "value": "from airflow import DAG\nfrom datetime import datetime\n\ndag = DAG(\n    dag_id=\"fechamento_financeiro_diario\",\n    schedule=\"@daily\",\n    start_date=datetime(2026, 1, 1),\n    catchup=True,\n    max_active_runs=1,\n)\n\n# com max_active_runs=1, mesmo que o catchup libere varias runs\n# atrasadas de uma vez, elas rodam uma de cada vez, em ordem,\n# nunca em paralelo"
                    },
                    {
                        "type": "quote",
                        "value": "Se a run de hoje depende do resultado da run de ontem, ou se duas runs escrevendo ao mesmo tempo corrompem a mesma tabela, max_active_runs=1 deixa de ser uma opcao de performance e passa a ser uma condicao de correcao dos dados."
                    },
                    {
                        "type": "text",
                        "value": "## Timezones\n\nInternamente, o Airflow trabalha em UTC. Se `start_date` for definido com um datetime sem fuso horario, ele e tratado como UTC por padrao, e uma expressao como \"0 9 * * *\" dispara as 9h UTC, nao as 9h de Sao Paulo.\n\nPara agendar no horario local certo, o `start_date` precisa ser timezone-aware, usando `pendulum`, a biblioteca de datas que o Airflow usa internamente. Isso tambem resolve de forma correta a transicao de horario de verao em paises que ainda o adotam: o Airflow recalcula o horario UTC equivalente a cada mudanca, em vez de manter um deslocamento fixo."
                    },
                    {
                        "type": "code",
                        "value": "import pendulum\nfrom airflow import DAG\n\ndag = DAG(\n    dag_id=\"relatorio_matinal\",\n    schedule=\"0 9 * * *\",\n    start_date=pendulum.datetime(2026, 1, 1, tz=\"America/Sao_Paulo\"),\n    catchup=False,\n)\n\n# essa DAG dispara sempre as 9h no horario de Sao Paulo,\n# independente do fuso horario que o servidor do Airflow usa internamente"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\",\"O que limita\",\"Escopo\"],[\"max_active_runs\",\"Quantas DagRuns dessa DAG podem estar ativas ao mesmo tempo\",\"Por DAG\"],[\"max_active_tasks (ex-concurrency)\",\"Quantas task instances dessa DAG podem rodar ao mesmo tempo, somando todas as runs ativas\",\"Por DAG\"],[\"Pool\",\"Quantas tasks, de quaisquer DAGs, podem usar um recurso compartilhado ao mesmo tempo\",\"Global, entre DAGs\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o parametro max_active_runs controla em uma DAG do Airflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quantas vezes uma task pode ser tentada novamente apos falhar",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantos segundos uma task pode ficar em execucao antes do timeout",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas DagRuns dessa DAG podem estar ativas ao mesmo tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantas DAGs diferentes podem rodar ao mesmo tempo no ambiente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG de fechamento financeiro escreve valores acumulados numa tabela, e cada run parte do total deixado pela run anterior. Duas runs ativas ao mesmo tempo corrompem esse total. Qual configuracao evita isso diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "retries=0 na DAG, para que nenhuma task seja executada mais de uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "catchup=False na DAG, para que runs atrasadas nunca sejam agendadas",
                                "isCorrect": false
                            },
                            {
                                "text": "schedule=None na DAG, deixando toda execucao a cargo de disparos manuais",
                                "isCorrect": false
                            },
                            {
                                "text": "max_active_runs=1 na DAG, garantindo que so exista uma run ativa por vez",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe em Sao Paulo define start_date sem fuso horario e schedule=\"0 9 * * *\", esperando que a DAG dispare as 9h no horario local. O que realmente acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A DAG dispara as 9h UTC, que corresponde as 6h em Sao Paulo (horario padrao, sem horario de verao)",
                                "isCorrect": true
                            },
                            {
                                "text": "A DAG dispara as 9h no horario de Sao Paulo, porque o Airflow detecta o fuso do servidor automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "A DAG nao dispara nunca, porque start_date sem fuso horario e invalido no Airflow",
                                "isCorrect": false
                            },
                            {
                                "text": "A DAG dispara as 9h em cada fuso horario configurado nos workers, gerando ate 3 execucoes diferentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG tem catchup=True, max_active_runs=2, e acabou de ser ativada apos ficar 20 dias sem rodar. O que acontece com as 20 runs atrasadas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As 20 runs disparam todas ao mesmo tempo, porque catchup=True ignora o limite de max_active_runs",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas as 2 runs mais recentes disparam; as outras 18 sao descartadas e nunca mais rodam automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Ate 2 runs ficam ativas ao mesmo tempo; as demais esperam na fila e disparam conforme as ativas terminam",
                                "isCorrect": true
                            },
                            {
                                "text": "As runs disparam em pares aleatorios, sem seguir a ordem cronologica dos intervalos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG tem 10 tasks e precisa que ate 5 delas rodem em paralelo dentro de uma mesma run, sem limitar quantas runs dessa DAG ficam ativas ao mesmo tempo. Qual parametro e o adequado para esse controle?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "max_active_runs, que limita quantas DagRuns inteiras dessa DAG ficam ativas ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "max_active_tasks, que limita quantas task instances dessa DAG rodam ao mesmo tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "catchup, que controla se runs atrasadas desde o start_date sao agendadas automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "schedule, que define a expressao cron ou o preset usado para disparar a DAG",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Formas de disparo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Formas de disparo\n\nAte aqui, tratamos o agendamento como se so existisse uma forma de uma DAG rodar: pelo relogio. Mas uma DagRun pode comecar por tres caminhos diferentes: porque o horario programado chegou, porque alguem (ou algum sistema) pediu explicitamente, ou porque um dado que a DAG espera ficou pronto. Entender os tres evita o erro comum de tentar resolver com cron um problema que, na verdade, e de dependencia de dados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma de disparo\",\"Quem decide o momento\",\"Exemplo de uso\"],[\"Agendado\",\"O schedule da propria DAG: cron, preset ou timedelta\",\"Um relatorio que sempre roda as 6h\"],[\"Manual\",\"Uma pessoa ou um sistema externo, via UI, CLI ou API\",\"Reprocessar um periodo especifico sob demanda\"],[\"Por evento\",\"A atualizacao de um dado do qual a DAG depende\",\"Rodar assim que a tabela de origem for atualizada por outra DAG\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Disparo manual\n\nAlem do botao de disparo na UI, uma run manual pode ser criada pela CLI (`airflow dags trigger`) ou pela API REST, o que permite que outro sistema dispare uma DAG do Airflow como parte de um fluxo maior. Em qualquer um desses caminhos, e possivel passar um `conf`, um dicionario de parametros que fica disponivel para as tasks daquela run especifica, como um intervalo de datas ou um identificador de cliente.\n\nPor padrao, uma run manual usa o momento atual como logical_date, em vez de seguir o proximo slot calculado pelo schedule."
                    },
                    {
                        "type": "code",
                        "value": "airflow dags trigger pipeline_vendas\n\nairflow dags trigger pipeline_vendas --conf '{\"cliente_id\": \"4471\", \"reprocessar\": true}'\n\n# dentro de uma task, o conf fica acessivel via o contexto de execucao:\n# def minha_task(**context):\n#     conf = context[\"dag_run\"].conf\n#     cliente_id = conf.get(\"cliente_id\")"
                    },
                    {
                        "type": "text",
                        "value": "## Disparo por evento\n\nDesde que o Airflow introduziu os Datasets, uma DAG pode ser agendada para rodar quando um dado especifico e atualizado por outra DAG, em vez de (ou alem de) seguir um horario fixo. Isso troca a pergunta \"que horas o dado costuma ficar pronto\" pela pergunta \"a DAG roda quando o dado realmente fica pronto\", o que elimina boa parte do trabalho de estimar horarios com folga de seguranca.\n\nVale separar dois conceitos parecidos que atuam em niveis diferentes: um schedule por Dataset decide quando uma nova DagRun comeca; um sensor e uma task dentro de uma DAG ja em execucao que espera uma condicao, como um arquivo, uma particao ou o fim de outra DAG, antes de deixar as tasks seguintes prosseguirem. Os dois merecem um modulo inteiro mais a frente; aqui fica so o mapa geral."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.datasets import Dataset\n\npedidos_processados = Dataset(\"s3://datalake/pedidos/processado/\")\n\n# a DAG produtora declara esse dataset como saida de uma de suas tasks\n\n# a DAG consumidora dispara automaticamente quando o dataset muda\ndag_consumidor = DAG(\n    dag_id=\"notificar_time_comercial\",\n    schedule=[pedidos_processados],\n    catchup=False,\n)"
                    },
                    {
                        "type": "quote",
                        "value": "A escolha certa nao e a mais familiar, e sim a que corresponde a quem realmente sabe quando a DAG deve rodar: o relogio, uma pessoa, ou o dado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Alem do disparo agendado por horario, quais sao as outras duas formas de uma DagRun comecar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Disparo por retry, quando uma task falha, e disparo por SLA, quando uma task atrasa alem do esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "Disparo por prioridade, quando a fila libera espaco, e disparo por pool, quando um recurso fica livre",
                                "isCorrect": false
                            },
                            {
                                "text": "Disparo por dependencia, quando outra task termina, e disparo por trigger rule, como all_success",
                                "isCorrect": false
                            },
                            {
                                "text": "Disparo manual, por pessoa ou sistema, e disparo por evento, quando um dado que ela depende fica pronto",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um analista dispara manualmente, pela UI, uma DAG que normalmente roda so as 6h da manha via cron. Qual e o comportamento padrao dessa run manual em relacao ao logical_date?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A run usa o momento atual como logical_date, e nao o proximo slot calculado pelo schedule",
                                "isCorrect": true
                            },
                            {
                                "text": "A run e rejeitada, porque DAGs com schedule por cron nao aceitam disparo manual pela UI",
                                "isCorrect": false
                            },
                            {
                                "text": "A run usa o horario das 6h da manha do proximo dia, respeitando o schedule original da DAG",
                                "isCorrect": false
                            },
                            {
                                "text": "A run assume o mesmo logical_date da ultima execucao agendada, duplicando aquele intervalo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema externo precisa disparar uma DAG do Airflow e informar, no momento do disparo, qual cliente deve ser processado naquela run especifica. Qual mecanismo permite isso diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma Variable do Airflow, atualizada pelo sistema externo antes de cada disparo agendado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um XCom criado antes da DAG comecar, para que a primeira task o leia como parametro",
                                "isCorrect": false
                            },
                            {
                                "text": "Disparo manual via API ou CLI, passando o identificador do cliente no conf da run",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma Connection configurada com o identificador do cliente no campo de senha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG B so deve comecar quando uma DAG A termina de atualizar uma tabela especifica, e o time quer que isso aconteca automaticamente, sem estimar um horario fixo com margem de seguranca. Qual e a diferenca entre resolver isso com um schedule baseado em Dataset e resolver com um sensor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Dataset so cria dependencia entre tasks da mesma DAG; o sensor e a unica forma de ligar DAGs diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "O Dataset decide quando uma nova run de B comeca; o sensor e uma task de uma run ja ativa, que espera a condicao",
                                "isCorrect": true
                            },
                            {
                                "text": "O Dataset dispara de forma mais lenta, via polling constante; o sensor reage de forma instantanea a mudanca",
                                "isCorrect": false
                            },
                            {
                                "text": "O Dataset exige que as duas DAGs estejam num unico arquivo Python; o sensor funciona com arquivos separados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer reprocessar, uma unica vez e sob demanda, os dados de uma semana especifica que tiveram um problema de qualidade ja corrigido na origem. Qual forma de disparo e a mais adequada para essa necessidade pontual?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Disparo agendado, criando um novo schedule so para essa semana especifica",
                                "isCorrect": false
                            },
                            {
                                "text": "Disparo por evento, associando um Dataset novo criado so para esse reprocessamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Alterar o start_date da DAG para a semana com problema e reativar o catchup",
                                "isCorrect": false
                            },
                            {
                                "text": "Disparo manual, apontado diretamente para o periodo que precisa ser reprocessado",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Dependências e fluxo de controle",
        "aulas": [
            {
                "titulo": "Definir dependências entre tasks",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Definir dependências entre tasks\n\nUm DAG é definido por dois elementos: as tasks e as dependências entre elas. As tasks sozinhas não bastam. Sem dependência explícita, o Airflow trata cada task como independente e apta a rodar em paralelo assim que o DAG dispara, o que raramente é o comportamento desejado num pipeline de ETL. Definir dependência é dizer ao scheduler: essa task só entra na fila depois que aquela outra terminar."
                    },
                    {
                        "type": "text",
                        "value": "## Upstream e downstream\n\n- **Upstream**: a task da qual a atual depende. Por padrão, precisa terminar com sucesso antes da atual ser liberada.\n- **Downstream**: a task que só roda depois da atual. Fica represada até a dependência ser satisfeita.\n\nUma task pode ser downstream de uma e upstream de outra ao mesmo tempo, isso é a regra em qualquer pipeline com mais de dois passos. O nome vem da metáfora do rio: o dado nasce lá em cima (upstream) e escoa pipeline abaixo (downstream). Esse conceito não é exclusivo do Airflow: Dagster declara dependências entre assets e ops, Prefect infere boa parte delas a partir de como as tasks são chamadas dentro do flow. A sintaxe muda, a ideia de upstream e downstream é universal."
                    },
                    {
                        "type": "code",
                        "value": "extrair = PythonOperator(task_id='extrair', python_callable=extrair_dados)\ntransformar = PythonOperator(task_id='transformar', python_callable=transformar_dados)\ncarregar = PythonOperator(task_id='carregar', python_callable=carregar_dados)\n\n# >> declara a task da esquerda como upstream da direita\nextrair >> transformar >> carregar\n\n# forma explícita, equivalente ao bloco acima\nextrair.set_downstream(transformar)\ntransformar.set_downstream(carregar)\n\n# << faz o caminho inverso (declara upstream a partir da direita)\ncarregar << transformar << extrair"
                    },
                    {
                        "type": "text",
                        "value": "## Fan-out e fan-in\n\n- **Fan-out**: uma task se ramifica em várias tasks downstream que não dependem entre si, então o scheduler pode liberá-las ao mesmo tempo. É o jeito natural de paralelizar, por exemplo transformar tabelas diferentes depois de uma extração comum.\n- **Fan-in**: várias tasks convergem para uma downstream única, que só é liberada quando todas as upstream terminarem (a trigger rule padrão exige sucesso em todas, a próxima aula detalha isso).\n\nPara declarar os dois, basta usar listas nos dois lados do operador, como em `extrair >> [transformar_vendas, transformar_estoque] >> carregar`. Rodar em paralelo não é uma escolha manual de thread, é consequência direta do desenho de dependências: quem não depende de quem é elegível para execução simultânea, dentro do limite de slots do executor."
                    },
                    {
                        "type": "code",
                        "value": "                 +--> transformar_vendas -----+\n                 |                            |\nextrair_dados ---+--> transformar_estoque ----+---> carregar_dw\n                 |                            |\n                 +--> transformar_clientes ---+\n\nextrair_dados roda uma vez. As três transformações não dependem\numas das outras, então são liberadas juntas (fan-out) assim que\nextrair_dados tem sucesso. carregar_dw só começa quando as três\ntiverem sucesso (fan-in)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sintaxe\", \"O que faz\"], [\"a >> b\", \"Declara a como upstream de b\"], [\"a << b\", \"Declara a como downstream de b\"], [\"a.set_downstream(b)\", \"Forma explícita, equivalente a a >> b\"], [\"a.set_upstream(b)\", \"Forma explícita, equivalente a a << b\"], [\"chain(a, b, c)\", \"Encadeia tasks, ou listas de tasks, em sequência\"], [\"cross_downstream([a, b], [c, d])\", \"Liga cada task do primeiro grupo a cada task do segundo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A ordem em que as tasks aparecem no arquivo Python é irrelevante para a ordem de execução. O que manda é o grafo de dependências declarado com >>, <<, set_downstream ou set_upstream."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Airflow, o código `extrair >> carregar` estabelece que:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "extrair e carregar são executadas ao mesmo tempo, sem nenhuma ordem entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "carregar precisa terminar antes de extrair começar, pois a leitura é da direita para a esquerda",
                                "isCorrect": false
                            },
                            {
                                "text": "carregar só é liberada para execução depois que extrair terminar com sucesso",
                                "isCorrect": true
                            },
                            {
                                "text": "extrair será reexecutada automaticamente toda vez que carregar for reprocessada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline tem uma task `extrair` seguida de três transformações independentes entre si (`transformar_vendas`, `transformar_estoque`, `transformar_clientes`) que alimentam uma única `carregar_dw`. Qual definição de dependências permite que as três transformações rodem em paralelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "extrair >> [transformar_vendas, transformar_estoque, transformar_clientes] >> carregar_dw",
                                "isCorrect": true
                            },
                            {
                                "text": "extrair >> transformar_vendas >> transformar_estoque >> transformar_clientes >> carregar_dw",
                                "isCorrect": false
                            },
                            {
                                "text": "extrair >> [transformar_vendas, transformar_estoque] >> transformar_clientes >> carregar_dw",
                                "isCorrect": false
                            },
                            {
                                "text": "[extrair, transformar_vendas] >> [transformar_estoque, transformar_clientes] >> carregar_dw",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro escreveu `a >> b`, depois `b >> c` e, mais abaixo no mesmo arquivo, também `a >> c`. O que acontece quando esse DAG for interpretado pelo Airflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Airflow rejeita o DAG no parse, porque a mesma task não pode aparecer em duas dependências",
                                "isCorrect": false
                            },
                            {
                                "text": "A dependência direta a >> c substitui a cadeia anterior, então b passa a rodar isolada, sem downstream",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria-se um ciclo entre a e c, e o scheduler entra em loop tentando decidir qual task libera primeiro",
                                "isCorrect": false
                            },
                            {
                                "text": "O DAG fica com uma dependência redundante, mas continua válido: c só libera depois de a e de b",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "As três tasks de um fan-out têm suas dependências satisfeitas ao mesmo tempo, mas o executor só tem dois slots livres nesse momento. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O scheduler falha o DAG inteiro, porque fan-out exige slots suficientes para todas as tasks paralelas",
                                "isCorrect": false
                            },
                            {
                                "text": "Duas começam imediatamente e a terceira fica em fila até liberar um slot, sem violar dependências",
                                "isCorrect": true
                            },
                            {
                                "text": "As três esperam até que os dois slots ocupados fiquem livres, para só então iniciarem juntas",
                                "isCorrect": false
                            },
                            {
                                "text": "A terceira task é marcada como skipped automaticamente, pois não havia recurso disponível no momento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao declarar `[extrair_a, extrair_b] >> [transformar_a, transformar_b]`, qual é o resultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada task do primeiro grupo vira upstream de cada task do segundo, um total de quatro dependências",
                                "isCorrect": true
                            },
                            {
                                "text": "extrair_a vira upstream de transformar_a e extrair_b de transformar_b, par a par, na ordem da lista",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas a primeira task de cada lista é conectada, as demais ficam sem nenhuma dependência declarada",
                                "isCorrect": false
                            },
                            {
                                "text": "O Airflow gera um erro de parse, pois listas dos dois lados do operador >> não são suportadas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Trigger rules",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Trigger rules\n\nToda task tem uma trigger rule: a condição sobre o estado das upstream que precisa ser satisfeita para ela ser liberada. Até aqui vimos apenas a dependência, quem é upstream de quem. A trigger rule decide o que conta como *upstream pronta o suficiente*. Por padrão, toda task usa `all_success`: só libera se todas as upstream diretas tiverem terminado com sucesso. Trocar a trigger rule é o jeito de fazer uma task rodar mesmo quando algo upstream falhou, por exemplo para notificar ou limpar recursos. O nome trigger_rule e a lista de valores abaixo são específicos do Airflow: Dagster e Prefect resolvem a mesma necessidade com mecanismos próprios de condição de execução."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Trigger rule\", \"Quando a task roda\"], [\"all_success (padrão)\", \"Todas as upstream diretas terminaram com sucesso\"], [\"all_failed\", \"Todas as upstream diretas falharam, ou ficaram upstream_failed\"], [\"all_done\", \"Todas as upstream diretas terminaram, independente do resultado\"], [\"one_failed\", \"Ao menos uma upstream falhou, não espera as demais terminarem\"], [\"one_success\", \"Ao menos uma upstream teve sucesso, não espera as demais\"], [\"none_failed\", \"Nenhuma upstream falhou, sucesso ou skipped são aceitos\"], [\"none_skipped\", \"Nenhuma upstream foi pulada (skipped)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que trocar a trigger rule\n\nNuma pipeline real, tasks de notificação e limpeza não podem depender de tudo ter dado certo, elas existem justamente para agir quando algo dá errado. Uma task de aviso no Slack faz mais sentido com `one_failed`: dispara assim que a primeira falha aparecer, sem esperar o resto do DAG terminar. Já uma task que libera um arquivo temporário combina melhor com `all_done`: precisa rodar sempre, o pipeline principal tendo funcionado ou não, para não deixar lixo para trás."
                    },
                    {
                        "type": "code",
                        "value": "extrair = PythonOperator(task_id='extrair', python_callable=extrair_dados)\ntransformar = PythonOperator(task_id='transformar', python_callable=transformar_dados)\ncarregar = PythonOperator(task_id='carregar', python_callable=carregar_dados)\n\nnotificar_falha = PythonOperator(\n    task_id='notificar_falha',\n    python_callable=enviar_alerta,\n    trigger_rule='one_failed',\n)\n\nlimpar_temporarios = PythonOperator(\n    task_id='limpar_temporarios',\n    python_callable=remover_arquivos_staging,\n    trigger_rule='all_done',\n)\n\nextrair >> transformar >> carregar\n[extrair, transformar, carregar] >> notificar_falha\n[extrair, transformar, carregar] >> limpar_temporarios"
                    },
                    {
                        "type": "code",
                        "value": "extrair -------+\n               |\ntransformar ---+--> notificar_falha    (trigger_rule=one_failed)\n               |\ncarregar ------+--> limpar_temporarios (trigger_rule=all_done)\n\nSe transformar falhar, carregar fica upstream_failed e não roda,\nmas notificar_falha e limpar_temporarios disparam do mesmo jeito,\nporque suas trigger rules não exigem sucesso nas upstream."
                    },
                    {
                        "type": "quote",
                        "value": "Trigger rule não muda o que a task faz, muda a condição para ela ser liberada. O código da task de notificação é sempre o mesmo, só a regra de disparo é diferente."
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado com all_done\n\n`all_done` libera a task depois de sucesso ou de falha, então ela não sabe, sozinha, qual foi o resultado. Se o comportamento precisar variar, por exemplo mandar uma mensagem diferente para sucesso e para falha, a task precisa checar o estado das upstream em tempo de execução, a trigger rule só decide se ela roda, não o que fazer com o resultado. Vale lembrar também que uma task pulada (skipped) conta como terminada para `all_done`, mas não conta nem como sucesso nem como falha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quando nenhuma trigger rule é definida explicitamente numa task do Airflow, qual é o comportamento padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A task roda assim que qualquer upstream direta terminar, com sucesso ou falha",
                                "isCorrect": false
                            },
                            {
                                "text": "A task só roda se todas as upstream diretas tiverem falhado",
                                "isCorrect": false
                            },
                            {
                                "text": "A task roda independente do estado das upstream, o padrão ignora as dependências",
                                "isCorrect": false
                            },
                            {
                                "text": "A task só roda se todas as upstream diretas tiverem terminado com sucesso",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma task `avisar_time` deve mandar uma mensagem assim que qualquer task do pipeline falhar, sem esperar as demais terminarem. Qual trigger rule atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "all_failed: só dispara se todas as upstream falharem",
                                "isCorrect": false
                            },
                            {
                                "text": "one_failed: dispara assim que uma upstream falha",
                                "isCorrect": true
                            },
                            {
                                "text": "all_done: dispara sempre, sem olhar sucesso ou falha",
                                "isCorrect": false
                            },
                            {
                                "text": "none_failed: dispara se nenhuma upstream tiver falhado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task `remover_staging` precisa excluir arquivos temporários independente do pipeline principal ter sucesso ou falha, contanto que as upstream já tenham terminado. Qual trigger rule é mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "all_success: libera só quando as upstream terminarem todas com sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "one_success: libera assim que a primeira upstream tiver sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "all_done: libera quando as upstream terminarem, com sucesso ou falha",
                                "isCorrect": true
                            },
                            {
                                "text": "none_failed: libera se nenhuma upstream tiver falhado, aceitando skipped",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num branch (assunto da próxima aula), duas tasks upstream de `consolidar` ficaram skipped porque o BranchPythonOperator escolheu outro caminho, e nenhuma upstream falhou. Com a trigger rule `none_failed`, o que acontece com `consolidar`?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "consolidar é liberada normalmente, pois skipped não conta como falha para essa trigger rule",
                                "isCorrect": true
                            },
                            {
                                "text": "consolidar também fica skipped, porque all_success e none_failed tratam skipped da mesma forma",
                                "isCorrect": false
                            },
                            {
                                "text": "consolidar fica presa em fila indefinidamente, esperando as upstream puladas terminarem",
                                "isCorrect": false
                            },
                            {
                                "text": "consolidar é marcada como upstream_failed, pois tasks puladas contam como falha indireta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um DAG baixa o mesmo arquivo de dois provedores em paralelo (`baixar_provedor_a` e `baixar_provedor_b`), e basta que um dos dois tenha sucesso para seguir com `processar_arquivo`. Qual trigger rule evita que o pipeline pare se um dos downloads falhar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "all_success: processar_arquivo exige que os dois downloads tenham sucesso ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "none_failed: processar_arquivo só libera se nenhum dos dois downloads tiver falhado",
                                "isCorrect": false
                            },
                            {
                                "text": "one_failed: processar_arquivo libera assim que um dos dois downloads falhar",
                                "isCorrect": false
                            },
                            {
                                "text": "one_success: processar_arquivo libera assim que um dos dois downloads tiver sucesso",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Branching e tasks condicionais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Branching e tasks condicionais\n\nNem todo pipeline segue sempre o mesmo caminho. Às vezes a decisão de qual task rodar em seguida só pode ser tomada em tempo de execução, por exemplo dependendo do volume extraído, do dia da semana ou do resultado de uma validação. Branching é o mecanismo do Airflow para escolher dinamicamente qual ramo do DAG seguir, pulando os ramos não escolhidos."
                    },
                    {
                        "type": "text",
                        "value": "## BranchPythonOperator\n\nO `BranchPythonOperator` roda uma função Python que decide o caminho e retorna a lista de `task_id`s (ou um único `task_id`) que devem seguir em execução. Todas as outras tasks diretamente downstream do branch que não foram retornadas são marcadas como `skipped`, não como `failed`: elas simplesmente não precisavam rodar dessa vez, não é um erro. O estado `skipped` se propaga: tasks downstream de uma task pulada tendem a ser puladas também, a menos que a trigger rule diga o contrário."
                    },
                    {
                        "type": "code",
                        "value": "def escolher_caminho(**contexto):\n    volume = contexto['ti'].xcom_pull(task_ids='extrair')\n    if volume > 1_000_000:\n        return 'processar_em_lote'\n    return 'processar_direto'\n\nbranch = BranchPythonOperator(\n    task_id='escolher_caminho',\n    python_callable=escolher_caminho,\n)\n\nprocessar_lote = PythonOperator(task_id='processar_em_lote', python_callable=processar_em_lote)\nprocessar_direto = PythonOperator(task_id='processar_direto', python_callable=processar_direto)\nconsolidar = PythonOperator(\n    task_id='consolidar',\n    python_callable=consolidar_resultado,\n    trigger_rule='none_failed',\n)\n\nbranch >> [processar_lote, processar_direto] >> consolidar"
                    },
                    {
                        "type": "code",
                        "value": "                  +--> processar_em_lote  ---+\n                  |    (se volume alto)      |\nescolher_caminho -+                          +--> consolidar\n                  |    (se volume baixo)     |\n                  +--> processar_direto   ---+\n\nApenas um dos dois ramos executa, o outro fica skipped.\nconsolidar precisa de trigger_rule='none_failed' para não\nficar skipped também: com all_success, o ramo pulado conta\ncomo upstream não satisfeita."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estado da task\", \"O que significa\"], [\"success\", \"Executou e terminou sem erro\"], [\"failed\", \"Executou e lançou uma exceção, ou retornou erro\"], [\"skipped\", \"Não executou por decisão de branch ou trigger rule, não é erro\"], [\"upstream_failed\", \"Não executou porque uma upstream falhou e a trigger rule exigia sucesso\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "skipped não é falha, é a forma do Airflow dizer que aquela task não era necessária desta vez. Uma task de junção depois de um branch precisa de uma trigger rule que aceite ramos pulados, senão ela mesma acaba pulada por causa do ramo não escolhido."
                    },
                    {
                        "type": "text",
                        "value": "## Reconvergir depois do branch\n\nUm erro comum é ligar um branch a uma task de consolidação sem trocar a trigger rule. Com `all_success`, o padrão, a task de junção exige sucesso em todas as upstream diretas, incluindo o ramo que foi pulado, então ela também acaba pulada, mesmo o ramo escolhido tendo funcionado perfeitamente. A correção é usar `none_failed` (segue mesmo com ramos pulados, desde que nenhum tenha falhado de verdade) na task que reconverge os caminhos."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a função Python usada num BranchPythonOperator deve retornar para o Airflow saber qual caminho seguir?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "um valor booleano indicando se o DAG deve continuar ou parar",
                                "isCorrect": false
                            },
                            {
                                "text": "a lista de task_ids (ou um único task_id) que devem seguir em execução",
                                "isCorrect": true
                            },
                            {
                                "text": "o nome do DAG que deve ser disparado em seguida, via TriggerDagRun",
                                "isCorrect": false
                            },
                            {
                                "text": "um dicionário com os parâmetros que serão passados via XCom para o próximo ramo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que um BranchPythonOperator escolhe seguir por `processar_direto`, o que acontece com a task irmã `processar_em_lote`, que não foi retornada pela função de decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica com estado failed, pois não foi selecionada pela função de decisão",
                                "isCorrect": false
                            },
                            {
                                "text": "Continua com estado none e só é reavaliada na próxima execução agendada",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica com estado skipped, que o Airflow não trata como erro nem como falha",
                                "isCorrect": true
                            },
                            {
                                "text": "É removida do histórico de runs, como se nunca tivesse feito parte do DAG",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Após um branch com dois ramos exclusivos, uma task `consolidar` foi definida com a trigger rule padrão e ligada aos dois ramos. Ao rodar o DAG, `consolidar` aparece como skipped mesmo o ramo escolhido tendo tido sucesso. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "all_success trata o ramo pulado como upstream não satisfeita, então consolidar também fica skipped",
                                "isCorrect": true
                            },
                            {
                                "text": "O BranchPythonOperator só funciona corretamente com uma única task downstream, nunca com dois ramos",
                                "isCorrect": false
                            },
                            {
                                "text": "consolidar foi definida antes dos dois ramos no arquivo Python, então a dependência não é encontrada",
                                "isCorrect": false
                            },
                            {
                                "text": "O ramo escolhido também falhou silenciosamente, e o Airflow reportou o estado errado por um bug conhecido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função de decisão de branch precisa permitir que, em certos casos, duas transformações rodem ao mesmo tempo, não apenas uma. Isso é possível com o BranchPythonOperator?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não: o BranchPythonOperator sempre libera exatamente uma task por execução, nunca mais de uma",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas apenas combinando o branch com um TaskGroup contendo as duas transformações",
                                "isCorrect": false
                            },
                            {
                                "text": "Não diretamente: é preciso criar dois BranchPythonOperator separados, um para cada transformação",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim: a função pode retornar uma lista de task_ids, e todas as tasks dessa lista são liberadas",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline só precisa pular o envio de um e-mail de relatório quando a extração trouxer zero linhas, e toda a decisão é simples e local a uma única task. Qual abordagem é mais direta, sem adicionar complexidade desnecessária ao DAG?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar um BranchPythonOperator para decidir entre enviar_email e uma task vazia de no-op",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir a extração em duas DAGs separadas, uma para quando há linhas e outra para quando não há",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter uma única task e usar um if comum dentro do python_callable, sem branching",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um TaskGroup com a lógica condicional replicada dentro de cada task do grupo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Passar dados entre tasks (XCom)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Passar dados entre tasks (XCom)\n\nCada task de um DAG pode rodar num worker diferente, em outro processo, às vezes em outra máquina. Elas não compartilham memória. Quando uma task precisa passar uma informação pequena para a próxima, como um caminho de arquivo, uma contagem de linhas ou um identificador de execução, o Airflow oferece o XCom (cross-communication) para isso."
                    },
                    {
                        "type": "text",
                        "value": "## O que é XCom\n\nXCom é um mecanismo de troca de valores pequenos entre tasks, guardado como pares chave-valor no metadata DB do Airflow. Uma task publica um valor com `xcom_push` e outra o lê com `xcom_pull`, referenciando o `task_id` de origem. Quando uma task de `PythonOperator` simplesmente retorna um valor, o Airflow faz o push automaticamente, usando a chave padrão `return_value`.\n\nXCom serve bem para contagem de registros, um nome de tabela escolhido em tempo de execução, um caminho de arquivo, uma data de referência, um status. Não serve para carregar o resultado de um processamento pesado de uma task para outra. O nome XCom é do Airflow, Dagster e Prefect resolvem essa troca com seus próprios mecanismos (outputs tipados, results), mas a regra prática é a mesma em qualquer orquestrador: nunca usar esse canal para trafegar o dataset inteiro."
                    },
                    {
                        "type": "code",
                        "value": "def extrair(**contexto):\n    caminho = salvar_extracao_no_storage()\n    contexto['ti'].xcom_push(key='caminho_arquivo', value=caminho)\n    return 15000  # PythonOperator publica o retorno como XCom automático\n\ndef transformar(**contexto):\n    ti = contexto['ti']\n    caminho = ti.xcom_pull(task_ids='extrair', key='caminho_arquivo')\n    total_linhas = ti.xcom_pull(task_ids='extrair', key='return_value')\n    dados = ler_do_storage(caminho)\n    processar(dados, total_linhas)"
                    },
                    {
                        "type": "quote",
                        "value": "XCom foi feito para pequenos pedaços de metadado que orientam a próxima task, não para carregar o dado em si. Se a informação tem mais que algumas linhas ou alguns KB, ela não deveria estar no XCom."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\", \"Usar XCom?\"], [\"Passar o caminho de um arquivo no storage gerado por uma task\", \"Sim, é uma referência pequena\"], [\"Passar a contagem de linhas processadas por uma task\", \"Sim, é um número pequeno\"], [\"Passar um DataFrame inteiro com milhões de linhas\", \"Não, sobrecarrega o metadata DB com dado grande\"], [\"Passar o nome da tabela de destino escolhida num branch\", \"Sim, é uma string curta\"], [\"Passar o conteúdo bruto de um arquivo CSV baixado\", \"Não, salve o arquivo e passe só o caminho\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# antipadrão: empurra o dataset inteiro pelo XCom\ndef extrair_errado(**contexto):\n    df = pd.read_sql('select * from vendas', conexao)\n    contexto['ti'].xcom_push(key='dataframe', value=df.to_dict())\n    # o metadata DB não foi feito para guardar megabytes de linhas\n\n# correto: persiste num storage intermediário,\n# passa só o caminho pelo XCom\ndef extrair_correto(**contexto):\n    df = pd.read_sql('select * from vendas', conexao)\n    caminho = f's3://staging/vendas/{contexto[\"ds\"]}.parquet'\n    df.to_parquet(caminho)\n    contexto['ti'].xcom_push(key='caminho_arquivo', value=caminho)"
                    },
                    {
                        "type": "text",
                        "value": "## O antipadrão de trafegar datasets\n\nO backend padrão do XCom grava o valor serializado no metadata DB, o mesmo banco que guarda o histórico de todas as execuções do Airflow. Empurrar DataFrames ou arquivos inteiros por ali degrada esse banco para todo mundo, não só para o seu DAG, e pode falhar de forma pouco óbvia quando o valor passa do limite de tamanho aceito. Existem XCom backends customizados que gravam em object storage em vez do metadata DB, mas o padrão recomendado continua o mesmo: tasks de processamento persistem o resultado num storage intermediário (um data lake, uma tabela de staging, um bucket), e trafegam pelo XCom apenas a referência. O orquestrador continua coordenando, quem processa e guarda o dado é a ferramenta certa para isso."
                    }
                ],
                "questions": [
                    {
                        "statement": "Para que serve o XCom no Airflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Armazenar os logs completos de execução de cada task para consulta posterior",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar valores pequenos entre tasks, como um caminho ou uma contagem",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir a ordem de dependência entre as tasks dentro de um mesmo DAG",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar credenciais e segredos usados pelas tasks durante a execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task extrai 5 milhões de linhas de um banco e a próxima precisa desses dados para transformar. Qual é a forma recomendada de conectar as duas tasks?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Salvar o resultado num storage intermediário e passar só o caminho pelo XCom",
                                "isCorrect": true
                            },
                            {
                                "text": "Fazer xcom_push do DataFrame inteiro, já que o XCom aceita qualquer volume de dado",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar as duas etapas numa única task, eliminando a necessidade de troca de dado",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar uma Variable do Airflow para guardar os 5 milhões de linhas entre as execuções",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task de PythonOperator tem uma função que termina com `return total_processado`. O que o Airflow faz com esse valor, por padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ignora o valor, XCom sempre exige uma chamada explícita a xcom_push",
                                "isCorrect": false
                            },
                            {
                                "text": "Grava o valor só nos logs da task, sem disponibilizá-lo a outras tasks",
                                "isCorrect": false
                            },
                            {
                                "text": "Publica automaticamente como XCom, na chave padrão return_value",
                                "isCorrect": true
                            },
                            {
                                "text": "Levanta um erro, pois PythonOperator não permite retorno de valores",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas tasks upstream, `extrair_a` e `extrair_b`, publicam XCom usando a mesma chave `total`. Por que é recomendado sempre informar o parâmetro `task_ids` ao consumir esse valor com `xcom_pull`?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o XCom exige task_ids como parâmetro obrigatório, o pull falha se ele for omitido",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem task_ids o Airflow soma automaticamente os valores das duas tasks upstream",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque task_ids define em qual worker a leitura do XCom será executada, por performance",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem task_ids a busca fica ambígua e pode misturar extrair_a com extrair_b",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que trafegar datasets inteiros pelo XCom é considerado um antipadrão, mesmo quando tecnicamente é possível serializar o dado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o XCom só aceita valores do tipo string, o dataset precisaria virar texto plano",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o XCom grava no metadata DB, que não foi pensado para guardar grandes volumes",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque cada task roda num container isolado, e o XCom não atravessa containers diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o XCom é apagado automaticamente a cada 5 minutos, antes da próxima task conseguir lê-lo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "TaskGroups e modularização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# TaskGroups e modularização\n\nUm DAG de produção raramente tem só três ou quatro tasks. Pipelines reais chegam a dezenas de tasks, e sem alguma forma de organização a visualização no Airflow vira um emaranhado difícil de ler. TaskGroup existe para isso: agrupar tasks relacionadas visualmente e logicamente, sem mudar como elas são agendadas ou executadas."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um TaskGroup\n\nUm TaskGroup é um agrupamento de tasks dentro do mesmo DAG, só isso. Não é um DAG dentro do DAG, não tem scheduler próprio, não roda em processo separado. As tasks continuam pertencendo ao DAG original, com o mesmo metadata DB e o mesmo executor. O que muda é a apresentação: na interface, o grupo aparece como uma caixa que pode ser expandida ou recolhida, e cada `task_id` interno recebe o prefixo do grupo (`grupo.task_id`) para evitar colisão de nomes.\n\nDependências podem ser declaradas no nível do grupo: `grupo_a >> grupo_b` conecta as tasks finais de `grupo_a` às tasks iniciais de `grupo_b`, sem precisar listar task por task."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.utils.task_group import TaskGroup\n\nwith TaskGroup(group_id='extracao') as extracao:\n    extrair_vendas = PythonOperator(task_id='vendas', python_callable=extrair_vendas)\n    extrair_estoque = PythonOperator(task_id='estoque', python_callable=extrair_estoque)\n\nwith TaskGroup(group_id='transformacao') as transformacao:\n    limpar = PythonOperator(task_id='limpar', python_callable=limpar_dados)\n    enriquecer = PythonOperator(task_id='enriquecer', python_callable=enriquecer_dados)\n    limpar >> enriquecer\n\ncarregar = PythonOperator(task_id='carregar', python_callable=carregar_dw)\n\nextracao >> transformacao >> carregar"
                    },
                    {
                        "type": "code",
                        "value": "extracao                       transformacao\n[vendas, estoque]  ----->  [limpar -> enriquecer]  ----->  carregar\n\nCada colchete representa um TaskGroup: no grafo do Airflow ele\naparece como uma caixa que pode ser expandida ou recolhida.\nContinua sendo o mesmo DAG, um só scheduler, um só metadata DB."
                    },
                    {
                        "type": "quote",
                        "value": "TaskGroup é organização visual e lógica, não isolamento de execução. As tasks dentro de um grupo são tasks normais do mesmo DAG, agendadas e executadas exatamente como qualquer outra."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"SubDAG (legado)\", \"TaskGroup\"], [\"Onde as tasks rodam\", \"DAG separado, com scheduler e execução próprios\", \"Mesmo DAG, mesmo scheduler, mesmo worker\"], [\"Overhead\", \"Alto, cada SubDAG podia travar slots do executor\", \"Nenhum, é só uma organização visual\"], [\"Risco conhecido\", \"Deadlocks quando havia poucos slots livres\", \"Não se aplica\"], [\"Status atual\", \"Descontinuado nas versões recentes do Airflow\", \"Recomendado para agrupar tasks\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## SubDAGs (legado)\n\nAntes do TaskGroup existir, a forma de agrupar tasks era o `SubDagOperator`: ele criava um DAG aninhado, com execução própria, dentro do DAG principal. Na prática isso trazia problemas sérios, o SubDAG competia por slots do executor junto com o resto do sistema, e travamentos eram um risco conhecido quando a concorrência disponível era baixa. TaskGroup resolve o mesmo problema de organização sem esse custo: é só uma composição visual, sem nenhum motor de execução próprio. Hoje o SubDagOperator é considerado legado, TaskGroup é a forma recomendada de estruturar DAGs grandes."
                    }
                ],
                "questions": [
                    {
                        "statement": "Do ponto de vista de execução, o que é um TaskGroup no Airflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um agrupamento visual e lógico de tasks que continuam pertencendo ao mesmo DAG",
                                "isCorrect": true
                            },
                            {
                                "text": "Um DAG independente, com scheduler próprio, aninhado dentro do DAG principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo especial de operator que executa várias tasks num único processo",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma fila separada de execução, com prioridade maior que as demais tasks do DAG",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de um TaskGroup com `group_id='transformacao'`, uma task é definida com `task_id='limpar'`. Como essa task é identificada no DAG final?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como limpar, o group_id só aparece na interface gráfica, nunca no identificador real",
                                "isCorrect": false
                            },
                            {
                                "text": "Como limpar_transformacao, o Airflow sufixa o task_id com o nome do grupo",
                                "isCorrect": false
                            },
                            {
                                "text": "Como transformacao.limpar, o Airflow prefixa o task_id com o group_id",
                                "isCorrect": true
                            },
                            {
                                "text": "Como transformacao, o task_id interno é descartado em favor do nome do grupo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao escrever `extracao >> transformacao`, sendo os dois TaskGroups com várias tasks internas, o que o Airflow faz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gera um erro, dependências só podem ser declaradas entre tasks individuais, nunca entre grupos",
                                "isCorrect": false
                            },
                            {
                                "text": "Conecta as tasks finais de extracao às tasks iniciais de transformacao, sem listar cada uma",
                                "isCorrect": true
                            },
                            {
                                "text": "Conecta apenas a primeira task de extracao à primeira task de transformacao, ignorando as demais",
                                "isCorrect": false
                            },
                            {
                                "text": "Executa todas as tasks de extracao e transformacao em sequência única, dentro de um mesmo processo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time antigo usava SubDagOperator e relatava travamentos esporádicos quando o executor tinha poucos slots livres. Qual é a explicação clássica para esse tipo de deadlock?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O metadata DB não suportava duas execuções de DAG simultâneas, então uma delas travava",
                                "isCorrect": false
                            },
                            {
                                "text": "O scheduler priorizava sempre o DAG principal, deixando o SubDAG numa fila permanente",
                                "isCorrect": false
                            },
                            {
                                "text": "As tasks do SubDAG não tinham timeout por padrão, então qualquer erro as deixava presas",
                                "isCorrect": false
                            },
                            {
                                "text": "O SubDAG ocupava um slot esperando tasks internas que disputavam os mesmos slots",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um mesmo padrão de três tasks (validar, limpar, arquivar) se repete em quatro DAGs diferentes. Qual abordagem reduz a duplicação de código mantendo a organização visual em TaskGroups?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma função que retorna um TaskGroup configurável e reutilizá-la nos quatro DAGs",
                                "isCorrect": true
                            },
                            {
                                "text": "Copiar e colar a definição do TaskGroup em cada um dos quatro arquivos, ajustando nomes",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformar as três tasks num SubDagOperator compartilhado entre os quatro DAGs",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir o TaskGroup uma vez num DAG e importá-lo diretamente nos outros três",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Confiabilidade: retries, idempotência e falhas",
        "aulas": [
            {
                "titulo": "Retries e retry_delay",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Retries e retry_delay\n\nPipelines de dados rodam em cima de sistemas que falham: uma API que responde com timeout, um banco que fecha a conexão no meio de uma query, uma rede instável por alguns segundos. Nenhuma dessas falhas é culpa do código da task, e boa parte delas desaparece sozinha se a mesma operação for tentada de novo alguns minutos depois.\n\nÉ exatamente esse cenário que o mecanismo de retry do orquestrador resolve: reexecutar automaticamente uma task que falhou, sem precisar de ninguém acordando de madrugada para clicar em \"rodar de novo\"."
                    },
                    {
                        "type": "text",
                        "value": "## retries e retry_delay\n\nNo Airflow, dois parâmetros controlam esse comportamento em qualquer task:\n\n- **`retries`**: quantas vezes a task pode ser reexecutada depois de falhar, antes de ser marcada como `failed` definitivamente.\n- **`retry_delay`**: quanto tempo o scheduler espera entre uma tentativa e a próxima.\n\nTambém é possível ligar `retry_exponential_backoff=True` para que esse intervalo cresça a cada nova tentativa (backoff exponencial), evitando martelar um sistema que já está sob pressão, com um teto definido por `max_retry_delay`. Dagster e Prefect têm mecanismos equivalentes, com nomes próprios para retries e backoff."
                    },
                    {
                        "type": "code",
                        "value": "from datetime import timedelta\n\ndefault_args = {\n    \"owner\": \"dados\",\n    \"retries\": 3,\n    \"retry_delay\": timedelta(minutes=5),\n    \"retry_exponential_backoff\": True,\n    \"max_retry_delay\": timedelta(minutes=30),\n}\n\nextrair_pedidos = PythonOperator(\n    task_id=\"extrair_pedidos\",\n    python_callable=extrair_pedidos_da_api,\n    retries=5,              # sobrescreve o default_args só para essa task\n    retry_delay=timedelta(minutes=2),\n    dag=dag,\n)"
                    },
                    {
                        "type": "text",
                        "value": "## O estado up_for_retry\n\nQuando uma task falha mas ainda tem tentativas disponíveis, ela não vai direto para `failed`. Ela passa pelo estado `up_for_retry`: aguarda o `retry_delay` passar, depois volta para `scheduled` e é reenfileirada como se fosse uma nova rodada da mesma task instance (o número da tentativa, `try_number`, incrementa a cada rodada).\n\nSó quando as tentativas se esgotam a task é marcada como `failed` de verdade, disparando o que estiver configurado para falha (tema da aula 4)."
                    },
                    {
                        "type": "code",
                        "value": "task falha durante a execução\n        |\n        v\n  restam tentativas de retry? ---- não ----> failed\n        |\n       sim\n        |\n        v\n   up_for_retry  (aguardando o retry_delay)\n        |\n        v\n   scheduled -> queued -> running  (nova tentativa, try_number + 1)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de erro\",\"Exemplo\",\"Retry ajuda?\"],[\"Transitório\",\"Timeout de rede, API fora do ar por instantes, deadlock no banco\",\"Sim, a nova tentativa tem boa chance de suceder\"],[\"Determinístico\",\"Bug no código, coluna inexistente, credencial errada, dado de entrada inválido\",\"Não, a próxima tentativa falha do mesmo jeito\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Retry resolve falha transitória, aquela que depende do momento em que rodou. Erro determinístico falha sempre pelo mesmo motivo, e continua falhando a cada nova tentativa até alguém corrigir a causa."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Airflow, o parâmetro `retries` de uma task define o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quantos segundos o scheduler aguarda antes da primeira execução da task.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantos workers podem processar essa mesma task ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas vezes a task volta a rodar depois de falhar, antes de virar failed.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantas execuções (DAG runs) da mesma DAG podem ficar ativas juntas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task que extrai dados de uma API externa falha com erro de \"connection timeout\" de forma intermitente, cerca de uma vez a cada dez execuções. A equipe configurou `retries=3` e `retry_delay=timedelta(minutes=5)`. Qual é o raciocínio correto sobre essa configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faz sentido, porque timeout de rede costuma ser um erro transitório que se resolve numa nova tentativa.",
                                "isCorrect": true
                            },
                            {
                                "text": "É inútil, porque qualquer erro numa task só se resolve reescrevendo o código que faz a chamada à API.",
                                "isCorrect": false
                            },
                            {
                                "text": "É arriscado, porque toda task com retries configurado passa a rodar em paralelo com a tentativa anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "É desnecessário, porque o scheduler já tenta reconectar sozinho antes de marcar a task como failed.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task de transformação começou a falhar sempre com `KeyError: 'cliente_id'`, porque a origem removeu essa coluna do arquivo exportado. A task tem `retries=5`. O que acontece nas próximas execuções?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As tentativas seguintes têm sucesso, porque o backoff exponencial dá tempo da origem corrigir o arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A partir da segunda tentativa a falha para de ocorrer, porque o Airflow ignora colunas ausentes automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tentativas seguintes são todas puladas, porque o Airflow reconhece de cara que o erro vai se repetir.",
                                "isCorrect": false
                            },
                            {
                                "text": "As 5 tentativas falham do mesmo jeito, porque o erro é determinístico e não depende do momento em que roda.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma task tem `retries=4`, `retry_delay=timedelta(minutes=2)` e `retry_exponential_backoff=True`, com `max_retry_delay=timedelta(minutes=20)`. Sobre o intervalo entre as tentativas, o que é correto afirmar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O intervalo permanece fixo em exatamente 2 minutos durante toda a sequência de tentativas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O intervalo cresce a cada tentativa, respeitando um teto de 20 minutos entre uma tentativa e outra.",
                                "isCorrect": true
                            },
                            {
                                "text": "O intervalo dobra a cada tentativa sem nenhum limite superior, até a quarta tentativa se esgotar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O intervalo diminui a cada tentativa, ficando bem mais curto na última do que na primeira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task falhou e ainda tem tentativas restantes de retry. Qual estado ela assume enquanto aguarda o `retry_delay` antes da próxima tentativa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "failed, até que alguém a reexecute manualmente pela interface do Airflow.",
                                "isCorrect": false
                            },
                            {
                                "text": "queued, aguardando um worker livre para tentar rodar imediatamente de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "up_for_retry, até o tempo de espera passar e ela voltar a ser agendada.",
                                "isCorrect": true
                            },
                            {
                                "text": "skipped, tratando a próxima tentativa como uma execução completamente separada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Idempotência de tasks",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Idempotência de tasks\n\nToda task de um pipeline vai rodar mais de uma vez sobre o mesmo intervalo de dados, mais cedo ou mais tarde: um retry automático depois de uma falha, um reprocessamento manual porque alguém encontrou um problema, um backfill de um período inteiro (aula 5). Isso não é uma exceção, é rotina.\n\nA pergunta que decide se essa rotina é segura ou perigosa é sempre a mesma: rodar essa task de novo, com a mesma entrada, produz o mesmo resultado no destino, ou duplica e corrompe o que já estava lá?"
                    },
                    {
                        "type": "quote",
                        "value": "Uma task é idempotente quando executá-la uma vez ou dez vezes seguidas, com a mesma entrada, deixa o destino exatamente no mesmo estado. Retry sem idempotência não é confiabilidade, é apenas adiar o problema."
                    },
                    {
                        "type": "text",
                        "value": "## As mesmas técnicas da trilha de ETL, agora dentro da task\n\nIdempotência não é um conceito novo desta trilha: a trilha de ETL já mostrou como conquistá-la na camada de carga. Dentro de uma task de orquestração, as mesmas técnicas se aplicam:\n\n- **Delete-insert por partição**: antes de inserir os dados do período, apagar o que já existe no destino para aquele mesmo período.\n- **Upsert por chave**: atualizar quem já existe e inserir quem é novo, por uma chave de negócio, sem gerar duplicata em nenhum cenário.\n\nO que muda na orquestração é de onde vem o \"período\": ele não pode ser `datetime.now()`, precisa ser o intervalo de dados da própria execução."
                    },
                    {
                        "type": "code",
                        "value": "def carregar_pedidos(data_interval_start, **context):\n    dia = data_interval_start.strftime(\"%Y-%m-%d\")\n\n    # idempotente: sempre limpa a partição do dia antes de reinserir\n    hook = PostgresHook(postgres_conn_id=\"dw\")\n    hook.run(\"DELETE FROM fato_pedidos WHERE data_pedido = %s\", parameters=[dia])\n\n    pedidos = extrair_pedidos_da_api(dia)\n    hook.insert_rows(\"fato_pedidos\", pedidos)\n\ncarregar = PythonOperator(\n    task_id=\"carregar_pedidos\",\n    python_callable=carregar_pedidos,\n    retries=3,\n    dag=dag,\n)"
                    },
                    {
                        "type": "text",
                        "value": "## Por que não pode ser datetime.now()\n\nUm erro comum é usar a hora \"atual\" dentro da task para decidir qual partição processar. O problema aparece exatamente quando a task roda fora do horário original: um retry de madrugada, um backfill dias ou meses depois. Nesses casos, `datetime.now()` aponta para o dia em que a task por acaso está rodando, não para o dia que ela deveria processar.\n\nO Airflow resolve isso passando o intervalo de dados da execução para dentro da task, via `data_interval_start` (ou o atalho de template `{{ ds }}`, a data no formato `AAAA-MM-DD`). Uma task idempotente sempre usa esse valor, nunca o relógio da máquina."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Padrão dentro da task\",\"Idempotente?\"],[\"DELETE por partição + INSERT do período\",\"Sim, mesmo resultado a cada execução\"],[\"INSERT direto, sem checar duplicata\",\"Não, cada execução acrescenta linhas novas\"],[\"UPSERT por chave de negócio\",\"Sim, atualiza ou insere, nunca duplica\"],[\"Usar datetime.now() para decidir o período\",\"Não, o resultado depende de quando a task roda de fato\"],[\"Usar data_interval_start/ds da execução\",\"Sim, o resultado não muda mesmo em retry ou backfill\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Retry sozinho não garante nada\n\nConfigurar `retries` numa task que faz `INSERT` puro, sem idempotência, não deixa o pipeline mais confiável, deixa mais perigoso: cada tentativa automática de retry passa a ser uma nova chance de duplicar dado. Retry e idempotência resolvem problemas diferentes e precisam andar juntos: um garante que a task tenta de novo, o outro garante que tentar de novo é seguro."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que uma task do Airflow é idempotente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela nunca falha, mesmo quando depende de sistemas externos fora do controle do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "Executá-la mais de uma vez com a mesma entrada sempre produz o mesmo resultado no destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela sempre termina mais rápido na segunda execução, reaproveitando o cache da primeira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela não pode ser configurada com retries, já que qualquer nova tentativa seria redundante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task insere os pedidos do dia com `INSERT` direto na tabela final, sem nenhuma checagem. Ela falhou depois de inserir metade das linhas, e o retry automático rodou a task inteira de novo desde o início. Qual é a consequência mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada muda, porque o Airflow detecta automaticamente as linhas já inseridas antes de repetir a task.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela final fica vazia, porque o retry sempre desfaz o que a tentativa anterior tinha inserido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só os pedidos que faltavam são inseridos, porque o retry retoma de onde a task havia parado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os pedidos inseridos antes da falha ficam duplicados, porque a nova execução insere tudo de novo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma task decide qual partição carregar chamando `datetime.now()` dentro do próprio código Python. Ela roda normalmente todo dia à 1h da manhã, mas um backfill precisou reprocessar um mês inteiro do passado, todo executado numa única tarde. O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Todas as execuções do backfill carregam a partição do dia da tarde em que ele rodou, não a do período correto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada execução do backfill carrega corretamente a partição correspondente, porque o Airflow ajusta o now() internamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O backfill falha imediatamente, porque datetime.now() não pode ser chamado de dentro de uma task do Airflow.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada execução carrega o dia seguinte ao anterior, seguindo a ordem em que as tasks terminam de rodar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A extração de pedidos passou a trazer, a cada execução, apenas os pedidos criados ou alterados nas últimas 24 horas, não a partição do dia inteira. A carga precisa continuar idempotente. Por que o delete-insert por partição deixa de ser uma boa escolha nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque delete-insert nunca chega a ser idempotente, mesmo recebendo a partição completa de dados a cada vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o delete-insert passa a exigir que a tabela de destino não tenha nenhuma chave primária definida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque apagar a partição inteira apagaria também os pedidos antigos que não vieram nesta execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque apagar e reinserir a partição inteira é sempre mais lento do que fazer upsert linha a linha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A task A carrega pedidos com upsert por `pedido_id`. A task B carrega os mesmos dados com `INSERT` direto, sem nenhuma verificação. As duas têm `retries=3` configurado. Qual comparação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As duas tasks são igualmente seguras para retry, porque o parâmetro retries já evita duplicatas sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "A task A pode ser reexecutada pelo retry com segurança, mas a B arrisca duplicar dados a cada nova tentativa.",
                                "isCorrect": true
                            },
                            {
                                "text": "A task B é mais segura, porque INSERT direto é mais rápido e reduz a janela de risco durante o retry.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas é segura para retry, porque upsert e INSERT direto duplicam dados da mesma forma.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Timeouts, SLAs e tarefas presas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Timeouts, SLAs e tarefas presas\n\nRetry cuida de tasks que falham rápido e de forma visível. Mas existe um problema diferente, e mais traiçoeiro: a task que não falha nem termina, ela simplesmente fica presa. Uma chamada de rede que nunca recebe resposta nem erro, uma query esperando um lock que nunca é liberado, um processo que trava sem lançar exceção nenhuma.\n\nSem um limite explícito, essa task pode ficar \"rodando\" por horas, ocupando um slot de execução e atrasando tudo que depende dela, sem que ninguém perceba até alguém notar que os dados do dia não chegaram."
                    },
                    {
                        "type": "text",
                        "value": "## execution_timeout: um limite de tempo que mata a task\n\nO parâmetro `execution_timeout` define quanto tempo uma task pode rodar antes de ser interrompida à força. Se esse tempo é ultrapassado, o Airflow lança um erro (`AirflowTaskTimeout`), marca a task como falha e, se ainda houver tentativas em `retries`, ela segue o fluxo normal de retry visto na aula 1.\n\nexecution_timeout existe justamente para tasks que dependem de recursos externos que podem simplesmente não responder: chamadas de API, sensores mal configurados, queries pesadas demais."
                    },
                    {
                        "type": "code",
                        "value": "extrair_api_parceiro = PythonOperator(\n    task_id=\"extrair_api_parceiro\",\n    python_callable=extrair_api_parceiro,\n    execution_timeout=timedelta(minutes=20),\n    retries=2,\n    dag=dag,\n)\n\n# se a chamada à API não responder em 20 minutos,\n# o Airflow interrompe a task e marca falha (entra em retry, se sobrar tentativa)"
                    },
                    {
                        "type": "text",
                        "value": "## SLA: um alarme que não mata nada\n\n`sla` é diferente: define o tempo esperado, a partir do agendamento da execução, para a task (ou a DAG inteira) terminar com sucesso. Se esse prazo passa e a task ainda não terminou, o Airflow registra um SLA miss e dispara o `sla_miss_callback` configurado, mas a task continua rodando normalmente.\n\nEssa é a diferença que mais gera confusão: `execution_timeout` interrompe a execução. `sla` só avisa que o prazo estourou, sem tomar nenhuma ação sobre a task em si."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\",\"O que faz quando dispara\",\"Interrompe a task?\"],[\"execution_timeout\",\"Marca a task como falha, pode entrar em retry\",\"Sim\"],[\"sla\",\"Registra um SLA miss e chama o sla_miss_callback\",\"Não, só avisa\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "execution_timeout mata a task que passou do tempo permitido. SLA não mata nada, só avisa que a execução está mais lenta do que o esperado."
                    },
                    {
                        "type": "text",
                        "value": "## Detectando tasks presas na prática\n\nAlém da configuração preventiva, vale olhar o histórico de execuções (a visão de árvore ou de Gantt do Airflow mostra a duração de cada task ao longo do tempo): uma task que costuma levar 5 minutos e num dia aparece rodando há 3 horas é sinal de algo preso, mesmo antes do timeout estourar.\n\nToda task que depende de um recurso externo fora do controle do pipeline (API, arquivo remoto, outro sistema) deveria ter um `execution_timeout` definido. Sem isso, o pior caso não é só \"essa task demora\", é \"essa task nunca termina e trava um slot do pool para sempre\"."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece quando uma task ultrapassa o tempo definido em `execution_timeout`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A task continua rodando normalmente, e o Airflow apenas registra um aviso no log.",
                                "isCorrect": false
                            },
                            {
                                "text": "A task é pausada e retomada automaticamente assim que um worker fica livre.",
                                "isCorrect": false
                            },
                            {
                                "text": "O DAG inteiro é interrompido, cancelando também as tasks que já tinham terminado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A execução é interrompida e a task é marcada como falha, podendo entrar em retry.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma task de extração ficou presa esperando resposta de uma API por mais de 6 horas, sem lançar nenhum erro, ocupando um slot do pool o tempo todo. A task não tinha `execution_timeout` configurado. Qual ajuste evita que isso se repita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número de retries da task, para que outra tentativa comece antes da primeira travar de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir um execution_timeout compatível com a duração normal da task, para interrompê-la se passar do esperado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configurar um sla para essa task, já que o SLA miss interrompe automaticamente execuções muito lentas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de slots do pool, para que a task presa não impeça as outras tasks de rodarem normalmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task tem `sla=timedelta(hours=1)` configurado, mas nenhum `execution_timeout`. Numa determinada execução, ela está demorando 3 horas para terminar. O que o Airflow faz nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Interrompe a task assim que a primeira hora se esgota, marcando a execução como falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduz automaticamente a prioridade da task na fila, liberando o worker para outras tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registra um SLA miss e dispara o callback configurado, mas deixa a task seguir rodando até terminar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cancela a task e agenda uma nova tentativa, seguindo o mesmo fluxo de um execution_timeout estourado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG diária está agendada para processar o intervalo de dados de cada dia, com `sla=timedelta(hours=2)` numa das tasks. Num certo dia, o scheduler atrasou 40 minutos para iniciar essa execução, mas a task em si rodou rápido, em 15 minutos. Sobre o SLA dessa execução, o que é correto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O prazo do SLA é contado a partir do horário esperado da execução, então o atraso do scheduler consome parte desse prazo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O SLA nunca é afetado por atraso do scheduler, porque é contado só a partir do instante em que a task começa a rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SLA é ignorado nessa execução, porque só se aplica quando a task ultrapassa o próprio execution_timeout.",
                                "isCorrect": false
                            },
                            {
                                "text": "O SLA é recalculado automaticamente, somando o atraso do scheduler ao prazo original de duas horas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe percebe que várias tasks de integração com sistemas externos já ficaram presas por horas no passado, sem nunca ter recebido esse tratamento. Qual prática deveria se tornar padrão para essas tasks?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Remover o retries dessas tasks, já que retry é a causa mais comum de tasks ficarem presas por horas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar todas para rodar com sla no lugar de execution_timeout, já que sla também interrompe execuções presas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o intervalo de agendamento da DAG, para dar mais tempo de essas tasks terminarem sozinhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir execution_timeout em toda task que depende de um recurso externo fora do controle do pipeline.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Alertas e notificações em falha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Alertas e notificações em falha\n\nUma task que falha e não é notada por ninguém equivale, na prática, a um pipeline sem nenhum tratamento de erro: os dados param de chegar, e só alguém do negócio percebe dias depois, quando um relatório aparece com número errado ou vazio.\n\nAlertar automaticamente quando algo falha fecha esse ciclo: transforma \"vamos descobrir quando alguém reclamar\" em \"a equipe já sabe antes de qualquer reclamação\"."
                    },
                    {
                        "type": "text",
                        "value": "## on_failure_callback\n\nO parâmetro `on_failure_callback` recebe uma função Python que o Airflow chama quando a task chega ao estado `failed` definitivo, depois de esgotar as tentativas de retry (não a cada tentativa isolada, esse papel é do `on_retry_callback`). Pode ser definido numa task específica ou em `default_args`, valendo para todas as tasks da DAG.\n\nEssa função recebe o contexto da execução (`context`), de onde é possível extrair qual DAG e task falharam, qual o intervalo de dados afetado e o link direto para o log daquela tentativa."
                    },
                    {
                        "type": "code",
                        "value": "def notificar_falha(context):\n    ti = context[\"task_instance\"]\n    mensagem = (\n        f\"Falha: {ti.dag_id}.{ti.task_id}\\n\"\n        f\"Data interval: {context['data_interval_start']}\\n\"\n        f\"Tentativa: {ti.try_number}\\n\"\n        f\"Log: {ti.log_url}\"\n    )\n    enviar_para_slack(canal=\"#dados-alertas\", texto=mensagem)\n\ndefault_args = {\n    \"on_failure_callback\": notificar_falha,\n    \"retries\": 3,\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Email e Slack, em conceito\n\nO Airflow também tem suporte nativo a alerta por email, com `email_on_failure` e `email_on_retry` em `default_args`, desde que um servidor SMTP esteja configurado. Na prática, times de dados costumam preferir um canal de chat (Slack, Teams) via `on_failure_callback`, porque a notificação chega em tempo real onde a equipe já está prestando atenção, e não numa caixa de entrada que pode ficar horas sem ser aberta.\n\nDagster e Prefect seguem a mesma ideia com nomes próprios (sensors e hooks de falha), o mecanismo central é sempre \"algo observa o estado da execução e dispara uma notificação quando ele piora\"."
                    },
                    {
                        "type": "text",
                        "value": "## Alertar as pessoas certas, sem virar ruído\n\nAlerta que dispara demais para de ser lido. Algumas escolhas ajudam a manter o canal útil:\n\n- Notificar só na falha final da task (`on_failure_callback`), não em cada tentativa intermediária de retry.\n- Rotear o alerta para o time dono daquele pipeline, não para um canal genérico que ninguém acompanha de perto.\n- Diferenciar severidade: um SLA miss (aula 3) pode ser um aviso mais brando, uma falha definitiva num pipeline crítico pode justificar acionar quem está de plantão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Incluir no alerta\",\"Evitar no alerta\"],[\"DAG e task que falharam\",\"O dataset inteiro processado pela task\"],[\"Intervalo de dados afetado\",\"Um stack trace gigante sem nenhum resumo\"],[\"Link direto para o log da execução\",\"Credenciais ou dados sensíveis do contexto\"],[\"Resumo objetivo do erro\",\"Disparo a cada tentativa intermediária de retry\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um alerta que dispara toda hora e quase nunca exige uma ação vira ruído: a equipe aprende a ignorá-lo, e é exatamente aí que a falha importante passa despercebida."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quando o `on_failure_callback` de uma task é chamado pelo Airflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quando a task chega ao failed definitivo, depois de esgotar as tentativas de retry.",
                                "isCorrect": true
                            },
                            {
                                "text": "Antes de cada tentativa de execução, para avisar que a task está prestes a rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre que a task demora mais do que o execution_timeout configurado permite.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cada nova tentativa de retry, logo depois do estado up_for_retry ser atribuído.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline crítico de faturamento começou a falhar diariamente numa das últimas tasks, e ninguém da equipe de dados percebeu até o time financeiro reclamar de números incompletos, quatro dias depois. Qual mudança resolve diretamente esse tipo de problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número de retries da task, para reduzir a chance de qualquer falha chegar ao estado failed.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o schedule_interval da DAG, fazendo o pipeline rodar com mais frequência ao longo do dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um on_failure_callback que notifique o time responsável assim que a task falhar de vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover o execution_timeout da task, para que ela sempre tenha tempo de terminar antes de falhar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task com `retries=3` falha na primeira tentativa, entra em `up_for_retry`, e na segunda tentativa termina com sucesso. Considerando `on_failure_callback` e `on_retry_callback` configurados, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O on_failure_callback dispara depois da primeira falha, e o on_retry_callback não chega a disparar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O on_retry_callback dispara depois da primeira falha, e o on_failure_callback não chega a disparar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois callbacks disparam juntos depois da primeira falha, já que a task ainda não tinha sucesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois callbacks dispara, porque a task terminou com sucesso na segunda tentativa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O canal de alertas de uma equipe dispara uma mensagem a cada tentativa de retry de qualquer task, em qualquer DAG. Depois de alguns meses, a equipe passa a ignorar o canal, e uma falha real de um pipeline crítico passa despercebida por dois dias. Qual mudança ataca a causa raiz desse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar o canal de alertas de Slack para email, já que email tende a ser lido com mais atenção pela equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o retries de todas as tasks, reduzindo a quantidade de vezes que uma task chega a falhar de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar os alertas automáticos e passar a checar manualmente o status das DAGs críticas todos os dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Restringir a notificação à falha definitiva da task e separar os pipelines críticos num canal com menos ruído.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time está desenhando o conteúdo da mensagem que o `on_failure_callback` envia para o Slack quando uma task falha. Qual conjunto de informações torna esse alerta mais útil para quem for investigar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "DAG, task, intervalo de dados afetado e um link direto para o log daquela execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas as linhas de dado que a task estava processando no momento da falha, para conferência.",
                                "isCorrect": false
                            },
                            {
                                "text": "As credenciais de acesso usadas pela task, para que a investigação já consiga reproduzir o erro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o nome da DAG, sem mais nenhum detalhe, para manter a mensagem curta e evitar ruído.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Reprocessamento e backfill controlado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Reprocessamento e backfill controlado\n\nCedo ou tarde, alguém vai precisar rodar de novo um período que já rodou antes: um bug na transformação percebido só semanas depois, uma correção que a origem aplicou retroativamente, uma coluna nova que precisa ser preenchida para todo o histórico. Esse reprocessamento deliberado de um intervalo passado é o que se chama de **backfill**.\n\nBackfill não introduz nenhuma técnica nova, ele apenas aplica tudo que já foi visto neste módulo (retries, e principalmente idempotência) sobre dados que já passaram pelo pipeline uma vez."
                    },
                    {
                        "type": "text",
                        "value": "## Backfill não é a mesma coisa que catchup\n\nÉ fácil confundir os dois, mas resolvem problemas diferentes:\n\n- **Catchup**: automático, acontece quando uma DAG é ativada (ou reativada) e existem intervalos agendados no passado que nunca rodaram. O Airflow preenche essas execuções sozinho, a menos que `catchup=False` esteja configurado.\n- **Backfill**: manual e deliberado, alguém decide reprocessar um intervalo que já rodou antes, geralmente porque um problema foi encontrado depois do fato."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Catchup\",\"Backfill\"],[\"Automático, dispara ao ativar uma DAG com execuções passadas pendentes\",\"Manual, disparado deliberadamente para reprocessar um período\"],[\"Cobre intervalos que nunca chegaram a rodar\",\"Cobre intervalos que já rodaram, geralmente por um problema encontrado depois\"],[\"Controlado pelo parâmetro catchup da DAG\",\"Disparado via CLI ou pela interface, escolhendo o intervalo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# Reprocessar um intervalo específico via linha de comando\nairflow dags backfill vendas_diarias \\\n    --start-date 2026-03-01 \\\n    --end-date 2026-03-15\n\n# Alternativa: limpar só as task instances de um período,\n# o scheduler reenfileira automaticamente (depende da task ser idempotente)\nairflow tasks clear vendas_diarias \\\n    --start-date 2026-03-01 --end-date 2026-03-15"
                    },
                    {
                        "type": "text",
                        "value": "## Escopar o reprocessamento só ao que foi afetado\n\nO primeiro passo de qualquer backfill é delimitar exatamente o intervalo com problema, não o histórico inteiro. Se a origem mandou dado errado só entre 1 e 15 de março, o backfill cobre só essas partições: a mesma técnica de idempotência da carga normal (delete-insert por partição ou upsert por chave, aula 2) garante que reprocessar exatamente esses dias não deixa duplicata nem exige tocar nos outros meses.\n\nReprocessar mais do que o necessário custa tempo, custa recursos e aumenta o risco de introduzir um problema novo numa área que já estava correta."
                    },
                    {
                        "type": "text",
                        "value": "## O cuidado com o volume\n\nReprocessar muitos dias de uma vez, todos em paralelo, pode sobrecarregar a mesma origem, banco ou API que o pipeline normal usa, algo que uma única execução diária nunca faria sozinha. Um backfill de um ano inteiro disparado sem limite de paralelismo pode derrubar uma API externa ou esgotar as conexões do banco de origem.\n\nControlar isso é possível limitando a concorrência do próprio backfill (rodando em lotes menores, com `max_active_runs` mais baixo) ou usando pools para limitar quantas tasks acessam o mesmo recurso compartilhado ao mesmo tempo, mesmo durante um reprocessamento grande."
                    },
                    {
                        "type": "quote",
                        "value": "Backfill só é seguro sobre uma task idempotente. Se rodar um único dia dez vezes sempre dá o mesmo resultado, rodar um ano inteiro de backfill também dá, um dia de cada vez."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um backfill, no contexto de orquestração de pipelines?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O preenchimento automático de execuções agendadas que nunca chegaram a rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O reprocessamento deliberado de um intervalo do passado que já tinha rodado antes.",
                                "isCorrect": true
                            },
                            {
                                "text": "A repetição automática de uma task que acabou de falhar, dentro do mesmo dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ajuste automático do schedule_interval de uma DAG depois de uma falha grave.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG nova é criada com `start_date` de seis meses atrás e é ativada hoje, sem nenhuma configuração adicional de catchup. Ao mesmo tempo, alguém decide reprocessar manualmente a primeira semana de um mês específico, porque a origem corrigiu dados retroativamente. Como esses dois eventos são chamados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O primeiro é catchup, automático; o segundo é backfill, disparado para o período afetado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois são chamados de backfill, já que ambos preenchem execuções de datas passadas da mesma DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro é backfill, porque cobre seis meses; o segundo é catchup, porque cobre só uma semana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois são chamados de catchup, já que dependem do parâmetro catchup estar habilitado na DAG.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A origem de dados de pedidos enviou valores errados só para o período de 1 a 15 de março, e o restante do histórico está correto. A tabela de destino é particionada por dia e a carga já é idempotente por delete-insert. Qual é a abordagem mais adequada de reprocessamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rodar o backfill do histórico completo da tabela, para garantir que nenhuma outra partição foi afetada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar a tabela inteira e recarregar todo o histórico do zero, já que delete-insert não cobre vários dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar o particionamento por dia antes do backfill, para simplificar o delete-insert do período.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o backfill apenas das partições de 1 a 15 de março, deixando o restante do histórico intocado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe dispara o backfill de dois anos de partições diárias de uma vez, todas sem limite de paralelismo, contra uma API de origem que tem um limite de requisições por minuto. Pouco depois, a API começa a devolver erro de limite excedido em boa parte das execuções. Qual ajuste ataca a causa desse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o número de retries de cada task, já que o erro de limite excedido sempre se resolve na tentativa seguinte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a carga de delete-insert por partição para upsert por chave, já que upsert não faz chamadas à origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Limitar a concorrência do backfill, rodando as partições em lotes menores ou usando um pool para essa origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o execution_timeout das tasks do backfill, para que cada uma libere o slot do pool mais rápido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task de carga usa `INSERT` direto, sem upsert nem delete-insert, e nunca tinha sido reprocessada até hoje. Um backfill de 10 dias é disparado para corrigir um erro de transformação identificado depois do fato. O que acontece com o destino ao final desse backfill?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os 10 dias reprocessados ficam corretos, porque o comando de backfill substitui automaticamente as partições afetadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os 10 dias reprocessados ficam com dados duplicados, porque a carga insere de novo sem apagar nem checar nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O backfill falha antes de começar, porque o Airflow exige que toda task seja idempotente para aceitar um backfill.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o último dos 10 dias fica duplicado, porque os anteriores são sobrescritos pelas execuções seguintes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Padrões de orquestração",
        "aulas": [
            {
                "titulo": "Sensores: esperar por uma condição",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Sensores: esperar por uma condição\n\nUm **sensor** é um tipo especial de operator: em vez de executar um trabalho, ele fica verificando periodicamente se uma condição ficou verdadeira. Só quando a condição é satisfeita (ou o tempo expira) o sensor termina e libera as tasks downstream.\n\nCasos clássicos de uso:\n- Esperar um arquivo chegar em um diretório ou bucket\n- Esperar uma partição existir em uma tabela do warehouse\n- Esperar um horário específico do dia\n- Esperar a resposta de um sistema externo, como outro pipeline\n\nSensores conectam o mundo assíncrono, no qual arquivos e eventos chegam quando chegam, ao modelo de DAG, que espera dependências bem definidas."
                    },
                    {
                        "type": "text",
                        "value": "## Poke x reschedule mode\n\nTodo sensor do Airflow tem um parâmetro `mode` que muda como ele ocupa recursos enquanto espera:\n\n- **poke** (padrão): o sensor fica com o worker slot ocupado do início ao fim, verificando a condição a cada `poke_interval` segundos. Simples, mas prende um worker mesmo quando não está fazendo nada.\n- **reschedule**: o sensor libera o worker slot entre uma verificação e outra. A cada checagem sem sucesso, a task volta para o estado `up_for_reschedule` e o scheduler a recoloca na fila mais tarde.\n\nA escolha certa depende do tempo de espera esperado. Para esperas curtas, de segundos a poucos minutos, poke é aceitável. Para esperas longas, como um job noturno de outra equipe, reschedule evita desperdiçar capacidade de execução com um worker parado só verificando uma condição."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.sensors.filesystem import FileSensor\n\naguarda_arquivo = FileSensor(\n    task_id=\"aguarda_arquivo_vendas\",\n    filepath=\"/dados/entrada/vendas_{{ ds }}.csv\",\n    mode=\"reschedule\",\n    poke_interval=300,\n    timeout=60 * 60 * 6,\n    soft_fail=True,\n)\n\naguarda_arquivo >> processa_vendas"
                    },
                    {
                        "type": "text",
                        "value": "## Timeout: o que acontece quando a espera estoura\n\nTodo sensor deveria ter um `timeout` explícito: o tempo máximo, em segundos, que ele pode ficar esperando antes de desistir. Sem timeout, um sensor pode ficar preso indefinidamente esperando uma condição que nunca se cumpre, ocupando fila de execução ou slots de reschedule.\n\nQuando o timeout estoura, o comportamento padrão é a task falhar, o que pode disparar retries e alertas como qualquer outra task. Definindo `soft_fail=True`, o sensor marca a si mesmo como `skipped` em vez de `failed`, útil quando a ausência da condição é um cenário esperado, não um erro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"poke\", \"reschedule\"], [\"Worker slot\", \"Ocupado do início ao fim\", \"Liberado entre verificações\"], [\"Melhor para\", \"Esperas curtas\", \"Esperas longas\"], [\"Estado entre checagens\", \"running\", \"up_for_reschedule\"]]"
                    },
                    {
                        "type": "code",
                        "value": "aguarda_arquivo (sensor, mode=reschedule)\n        |\n        v\n   valida_schema\n        |\n        v\n   carrega_no_warehouse\n\nEnquanto o arquivo não chega, aguarda_arquivo fica em up_for_reschedule\ne libera o worker slot para outras tasks do cluster."
                    },
                    {
                        "type": "quote",
                        "value": "Um sensor bem configurado não segura um worker refém de uma condição externa: ele espera de forma barata, com reschedule, timeout e uma estratégia clara para quando a condição nunca se cumpre."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal função de um sensor em uma DAG?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Executar o processamento pesado dos dados vindos da origem",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar de forma definitiva os arquivos que a DAG recebeu",
                                "isCorrect": false
                            },
                            {
                                "text": "Aguardar uma condição externa até ela se tornar verdadeira",
                                "isCorrect": true
                            },
                            {
                                "text": "Decidir em qual worker cada task da DAG será executada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time criou uma DAG que precisa esperar um arquivo que costuma chegar entre 2 e 5 horas depois do agendamento. No modo padrão do sensor, o worker fica ocupado o tempo todo só verificando se o arquivo existe, reduzindo a capacidade do cluster para outras DAGs. Qual ajuste resolve isso sem abrir mão do sensor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar o sensor com mode reschedule, liberando o worker entre as checagens",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o sensor por uma task Python que dorme em loop até o arquivo aparecer",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o poke_interval para verificar o arquivo com mais frequência",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o timeout do sensor para ele não falhar antes do arquivo chegar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task só deve rodar depois que uma tabela do warehouse tiver uma partição específica do dia carregada por outro processo, e a checagem é feita por uma query que confirma se a partição existe. Qual abordagem é a mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar um operator comum que roda essa query uma única vez no início da DAG",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a task com trigger_rule igual a all_done para ignorar a dependência",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um sensor que roda essa query periodicamente até a partição existir",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o schedule_interval da DAG para o dobro do tempo normal de carga",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em dias de manutenção do sistema de origem, o arquivo esperado por um sensor simplesmente não chega. O time não quer que a DAG fique marcada como falha, o que dispara um alerta de incidente desnecessário, mas quer que a ausência fique registrada como um caso esperado. Qual configuração atende a esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Definir trigger_rule igual a all_failed na task que vem depois do sensor",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir timeout no sensor com soft_fail=True, marcando a task como skipped",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir apenas retries altos no sensor, sem timeout, para tentar indefinidamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o sensor e deixar a dependência descrita só na documentação da DAG",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a diferença entre um sensor e um operator comum?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O sensor espera a condição ficar verdadeira; o operator comum executa e termina",
                                "isCorrect": true
                            },
                            {
                                "text": "O sensor só pode ser a primeira task de uma DAG, nunca no meio do grafo",
                                "isCorrect": false
                            },
                            {
                                "text": "O operator comum aceita retries, mas o sensor nunca pode configurar retries",
                                "isCorrect": false
                            },
                            {
                                "text": "O sensor sempre roda isolado dos demais operators da mesma DAG",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dependências entre DAGs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dependências entre DAGs\n\nNem sempre um pipeline cabe em uma única DAG. Times diferentes, agendamentos diferentes ou domínios de falha diferentes são bons motivos para dividir o trabalho em DAGs separadas. O preço dessa divisão é que passa a ser preciso coordenar a execução entre elas.\n\nO Airflow oferece três mecanismos principais para isso:\n- `TriggerDagRunOperator`: uma DAG dispara a execução de outra\n- `ExternalTaskSensor`: uma DAG espera uma task específica de outra DAG terminar\n- Datasets: agendamento orientado à atualização de dados, desacoplando produtor e consumidor"
                    },
                    {
                        "type": "text",
                        "value": "## TriggerDagRunOperator: uma DAG dispara a outra\n\nO `TriggerDagRunOperator` é uma task que, ao rodar, dispara uma nova execução de outra DAG. É uma dependência do tipo push: quem produz o dado sabe quem consome e toma a iniciativa de acionar o próximo pipeline assim que termina.\n\nFunciona bem quando existe uma relação direta entre produtor e consumidor, com poucos consumidores para acionar. Fica menos prático quando muitos pipelines diferentes dependem do mesmo resultado, porque a DAG produtora precisaria conhecer e disparar cada um deles."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.operators.trigger_dagrun import TriggerDagRunOperator\n\ndispara_relatorio = TriggerDagRunOperator(\n    task_id=\"dispara_dag_relatorio\",\n    trigger_dag_id=\"gera_relatorio_diario\",\n    conf={\"data_referencia\": \"{{ ds }}\"},\n    wait_for_completion=False,\n)\n\ncarrega_fato_vendas >> dispara_relatorio"
                    },
                    {
                        "type": "text",
                        "value": "## ExternalTaskSensor: esperar uma task de outra DAG\n\nO `ExternalTaskSensor` faz o caminho inverso: fica na DAG consumidora e espera uma task, ou a DAG inteira, de outra DAG chegar a um estado específico, geralmente success. É uma dependência do tipo pull: quem consome é quem fica de olho no produtor.\n\nO detalhe que mais causa confusão na prática é o alinhamento do data interval: por padrão, o sensor espera a task correspondente com o mesmo execution_date da sua própria execução. Se as duas DAGs têm schedules diferentes, é preciso ajustar esse mapeamento (por exemplo, com execution_date_fn), ou a espera nunca vai casar com a execução certa."
                    },
                    {
                        "type": "text",
                        "value": "## Datasets: agendamento orientado a dados\n\nAlém de push e pull entre DAGs específicas, o Airflow permite declarar Datasets: uma task marca que produz um determinado dataset, e outra DAG é agendada para rodar automaticamente quando esse dataset é atualizado. Nenhuma das duas DAGs precisa conhecer a outra diretamente, ambas só conhecem o dataset.\n\nEssa abordagem desacopla produtor e consumidor: um mesmo dataset pode disparar várias DAGs consumidoras, e uma DAG pode esperar a atualização de vários datasets antes de rodar. Dagster segue uma filosofia parecida com o conceito de assets, tratando o dado produzido como o centro do agendamento, não a DAG em si."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\", \"Quem toma a iniciativa\", \"Quando usar\"], [\"TriggerDagRunOperator\", \"A DAG produtora\", \"Poucos consumidores, com relação direta e conhecida\"], [\"ExternalTaskSensor\", \"A DAG consumidora\", \"Consumidor depende de uma task específica com data interval alinhável\"], [\"Datasets\", \"Nenhuma DAG conhece a outra diretamente\", \"Vários produtores ou consumidores, com baixo acoplamento\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Dividir um pipeline em várias DAGs só vale a pena se o ganho em isolamento e clareza for maior do que o custo de coordenar a execução entre elas."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que faz o TriggerDagRunOperator dentro de uma DAG?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aguarda a conclusão de uma task específica em outra DAG",
                                "isCorrect": false
                            },
                            {
                                "text": "Cria automaticamente um dataset a partir da saída de uma task",
                                "isCorrect": false
                            },
                            {
                                "text": "Sincroniza o schedule_interval de duas DAGs diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Dispara a execução de outra DAG a partir de uma task da DAG atual",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG carrega a tabela fato_vendas todos os dias. Cinco equipes diferentes criaram DAGs que precisam rodar assim que essa tabela é atualizada, e a DAG produtora já acumula cinco TriggerDagRunOperator, um para cada consumidora, o que trava sempre que uma nova equipe pede para ser avisada. Qual mudança reduz esse acoplamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Unificar as cinco DAGs consumidoras em uma única DAG com cinco branches",
                                "isCorrect": false
                            },
                            {
                                "text": "Declarar um dataset na task de carga e agendar as consumidoras a partir dele",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir os cinco TriggerDagRunOperator por cinco ExternalTaskSensor",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o wait_for_completion de cada TriggerDagRunOperator existente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG B usa ExternalTaskSensor para esperar a task carrega_dados da DAG A. A DAG A roda a cada hora, mas a DAG B roda uma vez por dia, e o sensor nunca encontra a execução correspondente. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A task carrega_dados precisa estar marcada como sensor para ser encontrada",
                                "isCorrect": false
                            },
                            {
                                "text": "O sensor espera por padrão o mesmo execution_date da sua própria execução",
                                "isCorrect": true
                            },
                            {
                                "text": "O ExternalTaskSensor só funciona quando as duas DAGs estão no mesmo arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O mode do sensor está como poke, o que impede a busca em outra DAG",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A extração de um pipeline roda a cada 15 minutos e alimenta uma tabela intermediária; a carga no warehouse só faz sentido uma vez por dia e é mantida por outro time. Hoje as duas etapas vivem na mesma DAG. Qual é o ajuste mais adequado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Manter uma única DAG e usar trigger_rule igual a all_done na task de carga",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar em duas DAGs sem nenhuma dependência declarada entre elas",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar em duas DAGs com schedules próprios, coordenadas por um dataset",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter uma única DAG e ajustar o schedule_interval geral para 15 minutos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "TriggerDagRunOperator e ExternalTaskSensor resolvem o mesmo problema, coordenar DAGs, por caminhos opostos. Qual caminho o ExternalTaskSensor usa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele substitui o scheduler na decisão de quando rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele espera, a partir da consumidora, o estado da produtora",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele cria um dataset intermediário entre as duas DAGs",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele dispara a DAG dependente diretamente, como um push",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tasks dinâmicas: mapeamento dinâmico",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tasks dinâmicas: mapeamento dinâmico\n\nEm muitos pipelines, o número de unidades de trabalho só é conhecido em tempo de execução: quantos arquivos chegaram hoje, quantas partições precisam ser processadas, quantos clientes têm um extrato pendente. Escrever uma task fixa para cada item não escala e obriga a editar o código da DAG toda vez que a quantidade muda.\n\nO mapeamento dinâmico (dynamic task mapping) resolve isso: você define uma task como um template e pede para o Airflow expandi-la em tempo de execução, gerando uma instância de task para cada item de uma lista. É um fan-out declarado na estrutura da DAG, sem loop no código Python que gera tasks."
                    },
                    {
                        "type": "text",
                        "value": "## expand: gerando tasks a partir de uma lista\n\nA forma mais comum de mapear dinamicamente é com `.expand()` na TaskFlow API. Uma task decorada com `@task` recebe uma lista, conhecida só em runtime, e o Airflow cria uma task mapeada para cada elemento, cada uma com seu próprio estado, log e histórico de retries, visível individualmente na interface.\n\nIsso é diferente de um loop Python que cria tasks no momento em que a DAG é interpretada (parse time): nesse caso, a lista precisa ser conhecida antes da execução. Com `.expand()`, a lista pode vir do resultado de outra task, decidido durante o próprio run. Dagster e Prefect têm mecanismos equivalentes (saídas dinâmicas e `.map()`, respectivamente) para o mesmo problema."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.decorators import task\n\n@task\ndef lista_arquivos_do_dia():\n    return [\"vendas_norte.csv\", \"vendas_sul.csv\", \"vendas_leste.csv\"]\n\n@task\ndef processa_arquivo(nome_arquivo: str):\n    print(f\"processando {nome_arquivo}\")\n\narquivos = lista_arquivos_do_dia()\nprocessa_arquivo.expand(nome_arquivo=arquivos)"
                    },
                    {
                        "type": "text",
                        "value": "## De onde vem a lista: outra task, XCom\n\nA lista usada em `.expand()` normalmente chega via XCom, o mecanismo de troca de dados pequenos entre tasks. No exemplo acima, `lista_arquivos_do_dia` devolve a lista, o Airflow guarda esse retorno como XCom e `processa_arquivo.expand(...)` lê esse XCom para saber quantas instâncias criar e com quais argumentos.\n\nCada task mapeada recebe um `map_index` (0, 1, 2...), que aparece na interface e nos logs, facilitando encontrar qual instância processou qual item quando algo dá errado."
                    },
                    {
                        "type": "code",
                        "value": "lista_arquivos_do_dia\n        |\n        v\n  (expand sobre a lista)\n        |\n   +----+----+----+\n   v    v    v    v\n  [0]  [1]  [2]  [3]   processa_arquivo (uma instancia por item)\n   |    |    |    |\n   +----+----+----+\n        v\n  consolida_resultado"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidados: limite de mapeamento e custo por task\n\nMapeamento dinâmico não é gratuito: cada instância mapeada é uma task normal para o scheduler, com sua fila, seu slot de worker e sua linha na interface. Uma lista com dezenas de milhares de itens pode sobrecarregar o scheduler e poluir a UI. O Airflow expõe `max_map_length` como trava de segurança contra listas grandes demais.\n\nQuando o número de itens é muito alto, geralmente compensa mais agrupar itens em lotes, por exemplo processar 100 arquivos por task mapeada, em vez de mapear um arquivo por task."
                    },
                    {
                        "type": "quote",
                        "value": "Mapeamento dinâmico existe para você descrever o formato do trabalho uma única vez e deixar o Airflow decidir quantas instâncias criar, em vez de escrever manualmente uma task para cada item."
                    }
                ],
                "questions": [
                    {
                        "statement": "Que problema o mapeamento dinâmico de tasks resolve?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gerar uma task para cada item de uma lista conhecida só em runtime",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o tempo de retry de uma task que falha com frequência",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar grandes volumes de dados trocados entre tasks via XCom",
                                "isCorrect": false
                            },
                            {
                                "text": "Permitir que duas DAGs diferentes compartilhem o mesmo scheduler",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG tem um loop Python que cria uma task fixa para cada arquivo listado em um diretório no momento em que o arquivo da DAG é interpretado pelo scheduler. Quando a quantidade de arquivos muda de um dia para o outro, a lista de tasks na interface não reflete mais a execução real. Qual mudança resolve esse descompasso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o loop de parse time por uma task que lista os arquivos em runtime e usa expand",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o min_file_process_interval para reler o arquivo da DAG com mais frequência",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um sensor antes do loop para esperar todos os arquivos chegarem",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover o loop para dentro de uma única task que processa todos os arquivos em sequência",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma DAG que usa expand, de onde normalmente vem a lista de itens usada para gerar as tasks mapeadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Do nome da DAG, usado pelo Airflow para inferir a quantidade de tasks",
                                "isCorrect": false
                            },
                            {
                                "text": "De um arquivo YAML de configuração, lido só quando a DAG é criada",
                                "isCorrect": false
                            },
                            {
                                "text": "De uma Variable do Airflow, atualizada manualmente antes de cada run",
                                "isCorrect": false
                            },
                            {
                                "text": "Do retorno, via XCom, de uma task anterior, resolvido durante a execução",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma task mapeada com expand está gerando cerca de 50 mil instâncias por execução, uma para cada linha de um arquivo de entrada, e o scheduler começou a apresentar lentidão perceptível para processar a fila. Qual ajuste ataca a causa do problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Agrupar as linhas em lotes, mapeando uma task por lote em vez de por linha",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de workers do executor para absorver as 50 mil instâncias",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o executor local pelo executor Celery, que não tem limite de tasks",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o poke_interval das tasks mapeadas para acelerar a fila",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task mapeada falhou para um item específico dentro de uma lista de vinte. Como identificar, na interface do Airflow, qual item correspondeu à instância que falhou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não é possível isolar qual item falhou, só que a task mapeada teve erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo XCom da DAG inteira, que só existe depois que todas terminam",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo map_index da instância, que indica a posição do item na lista mapeada",
                                "isCorrect": true
                            },
                            {
                                "text": "Pelo nome da task, que muda automaticamente para cada item da lista",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Parametrização: params, Variables, Connections e segredos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Parametrização: params, Variables, Connections e segredos\n\nPipeline de produção raramente tem tudo fixo no código. Quatro mecanismos cobrem a maior parte das necessidades de configuração no Airflow, cada um para um tipo diferente de valor:\n\n- **params**: valores passados numa execução específica de uma DAG\n- **Variables**: configuração compartilhada entre DAGs e execuções\n- **Connections**: como conectar a sistemas externos (host, usuário, senha)\n- **Secrets backend**: onde credenciais realmente sensíveis deveriam morar em produção\n\nMisturar esses papéis é uma fonte comum de dor de cabeça, como guardar uma senha numa Variable em texto puro ou fixar no código um valor que deveria mudar a cada execução."
                    },
                    {
                        "type": "text",
                        "value": "## params: parametrizar uma execução\n\n`params` são valores fornecidos no momento em que uma DAG run é disparada, seja manualmente pela interface, pela CLI ou via API. Servem para o que muda de execução para execução: um intervalo de datas num backfill manual, o identificador de um cliente num reprocessamento pontual, uma flag de dry_run.\n\nDentro das tasks, os params ficam disponíveis pelo contexto de execução e podem ser usados em templates Jinja, como `{{ params.data_inicio }}`, ou lidos diretamente no código da task."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.decorators import dag, task\nfrom datetime import datetime\n\n@dag(\n    schedule=None,\n    start_date=datetime(2024, 1, 1),\n    params={\"data_inicio\": \"2024-01-01\", \"data_fim\": \"2024-01-31\"},\n)\ndef reprocessamento_manual():\n\n    @task\n    def reprocessa(**context):\n        params = context[\"params\"]\n        print(f\"reprocessando de {params['data_inicio']} ate {params['data_fim']}\")\n\n    reprocessa()\n\nreprocessamento_manual()"
                    },
                    {
                        "type": "text",
                        "value": "## Variables: configuração compartilhada\n\nVariables são um armazenamento de chave-valor dentro do metadata DB do Airflow, pensado para configuração que várias DAGs (ou várias execuções da mesma DAG) precisam enxergar: o nome do ambiente, um prefixo de caminho no armazenamento, um limite de linhas para um alerta.\n\nO cuidado principal é não abusar: chamar `Variable.get` no nível do módulo, fora de uma task, faz o scheduler consultar o banco toda vez que interpreta o arquivo da DAG, o que pesa quando há muitas DAGs no mesmo ambiente. O ideal é ler a Variable dentro da task, no momento em que ela realmente é executada."
                    },
                    {
                        "type": "text",
                        "value": "## Connections, Hooks e segredos: credenciais para sistemas externos\n\nConnections guardam o necessário para falar com um sistema externo (host, porta, login, senha, parâmetros extras) sob um identificador, o `conn_id`. As tasks não usam a Connection diretamente: usam um Hook (`PostgresHook`, `S3Hook`, entre outros) que recebe o `conn_id` e sabe como abrir a conexão certa, sem que a credencial apareça em nenhum lugar do código da DAG.\n\nEm produção, o valor real da credencial não precisa, e não deveria, ficar só no metadata DB do Airflow: um secrets backend (um cofre externo, como Vault ou o gerenciador de segredos do provedor de nuvem) pode ser configurado para que o Airflow busque Connections e Variables sensíveis diretamente dele. Dagster resolve o mesmo problema com resources, e Prefect com blocks: a ideia de não misturar credencial com código da task se repete em qualquer orquestrador sério."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\", \"Para que serve\", \"Muda com que frequência\"], [\"params\", \"Valores de uma execução específica\", \"A cada disparo da DAG\"], [\"Variables\", \"Configuração compartilhada entre DAGs\", \"Raramente, fora do ciclo de execução\"], [\"Connections\", \"Endereço e credenciais de sistemas externos\", \"Quando o sistema externo muda\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Senha, token e chave de API não vão no código da DAG nem numa Variable em texto puro: em produção, essas credenciais moram num secrets backend dedicado, e o Airflow só busca o que precisa na hora de executar a task."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre params e Variables no Airflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "params ficam no metadata DB; Variables ficam só no código da DAG",
                                "isCorrect": false
                            },
                            {
                                "text": "params valem para uma execução específica; Variables são compartilhadas",
                                "isCorrect": true
                            },
                            {
                                "text": "params e Variables são dois nomes para o mesmo mecanismo do Airflow",
                                "isCorrect": false
                            },
                            {
                                "text": "params servem só para senhas; Variables servem só para caminhos de arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task usa uma biblioteca de banco de dados diretamente no código, com host, usuário e senha escritos em uma Variable de texto puro chamada senha_banco. Um novo integrante do time encontrou a senha ao abrir a interface do Airflow. Qual mudança resolve o problema de forma correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o nome da Variable para algo menos óbvio, como config_banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover a senha para dentro do arquivo da DAG, como uma constante Python",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar só o valor da Variable com uma chave fixa no repositório",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar uma Connection com as credenciais e acessar o banco por um Hook",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG chama Variable.get logo no topo do arquivo, fora de qualquer task, para decidir quantas tasks paralelas criar. Com o crescimento do número de DAGs no ambiente, o scheduler ficou mais lento para interpretar os arquivos. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O uso de Variable.get impede o scheduler de colocar o DAG em cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Variables só podem ser lidas uma vez por dia, o que atrasa o parse das DAGs",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada parse do arquivo da DAG dispara uma nova consulta ao metadata DB",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada Variable criada aumenta o tempo de retry de todas as tasks da DAG",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time precisa reprocessar um único dia específico, escolhido no momento em que a DAG é disparada manualmente, sem alterar o comportamento das próximas execuções agendadas. Qual mecanismo é o mais adequado para receber essa data?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "params, informado no momento do disparo manual da DAG run",
                                "isCorrect": true
                            },
                            {
                                "text": "Variables, atualizada antes do disparo manual e revertida depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Um secrets backend, guardando a data como se fosse uma credencial",
                                "isCorrect": false
                            },
                            {
                                "text": "Connections, criando uma conexão nova a cada reprocessamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel de um Hook, como PostgresHook ou S3Hook, dentro de uma task do Airflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Substituir o sensor quando a condição esperada é a existência de uma Connection",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a ordem de dependência entre a task atual e a próxima da DAG",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar em cache o resultado de uma query para as próximas execuções",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar a Connection configurada para abrir a conexão, sem expor a credencial",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O orquestrador coordena, não processa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O orquestrador coordena, não processa\n\nFecha este módulo a ideia que atravessa todos os padrões anteriores: o Airflow, como qualquer orquestrador, decide quando, em que ordem e sob quais condições o trabalho acontece. Ele não foi construído para ser o lugar onde o trabalho pesado é feito.\n\nOs workers de um cluster Airflow são um recurso compartilhado e limitado. Uma task que consome CPU e memória por horas não está só lenta: ela está segurando um slot que outras dezenas de DAGs também disputam."
                    },
                    {
                        "type": "text",
                        "value": "## O antipadrão: processar gigabytes dentro de uma task Python\n\nÉ comum, principalmente em quem está começando, escrever uma task com `@task` ou `PythonOperator` que lê um arquivo enorme, carrega tudo em um DataFrame e faz joins, agregações e transformações ali mesmo, dentro do worker do Airflow.\n\nIsso traz vários problemas ao mesmo tempo: o worker fica limitado pela memória e CPU da máquina, sem nenhuma forma de escalar horizontalmente o processamento; a task vira um ponto único de falha demorado, porque um retry refaz todo o trabalho pesado do zero; e o cluster de orquestração inteiro sofre, já que aquele slot fica indisponível para as demais DAGs enquanto a task roda."
                    },
                    {
                        "type": "code",
                        "value": "# Antipadrao: processamento pesado dentro da task do Airflow\n@task\ndef transforma_vendas():\n    import pandas as pd\n    df = pd.read_parquet(\"s3://dados/vendas/ano=2024/\")\n    df = df.groupby(\"regiao\").agg({\"valor\": \"sum\"})\n    df.to_parquet(\"s3://dados/vendas_agregadas/\")\n    # gigabytes de dados passando pela memoria do worker do Airflow"
                    },
                    {
                        "type": "text",
                        "value": "## O padrão correto: empurrar o trabalho pesado\n\nA task do Airflow deveria fazer pouco: montar os parâmetros certos, acionar o motor adequado (Spark, um warehouse como BigQuery ou Snowflake, um serviço de processamento gerenciado) e acompanhar o resultado até ele terminar. Quem processa os dados é esse motor, não o worker do orquestrador.\n\nNa prática, isso quer dizer usar operators que submetem um job, como um operator de Spark, ou que rodam uma instrução em um warehouse, em vez de operators genéricos executando código Python pesado. O worker do Airflow só fica esperando e checando o status, um trabalho leve mesmo quando o processamento por trás é gigantesco. O mesmo princípio vale em Dagster ou Prefect: o orquestrador aciona, o motor de dados processa."
                    },
                    {
                        "type": "code",
                        "value": "from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator\nfrom airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator\n\n# Padrao correto: a task so aciona e acompanha o job no motor certo\nspark_transforma_vendas = SparkSubmitOperator(\n    task_id=\"transforma_vendas_spark\",\n    application=\"jobs/agrega_vendas.py\",\n    conf={\"spark.executor.memory\": \"4g\"},\n)\n\ncarrega_no_warehouse = SQLExecuteQueryOperator(\n    task_id=\"agrega_vendas_no_warehouse\",\n    conn_id=\"warehouse_prod\",\n    sql=\"CALL agrega_vendas_por_regiao('{{ ds }}')\",\n)\n\nspark_transforma_vendas >> carrega_no_warehouse"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Task processa os dados direto\", \"Task só orquestra\"], [\"Onde o processamento roda\", \"No worker do Airflow\", \"Em Spark, warehouse ou serviço dedicado\"], [\"Escala com o volume de dados\", \"Não, limitada à máquina do worker\", \"Sim, o motor escala de forma independente\"], [\"Custo de um retry\", \"Refaz todo o processamento pesado\", \"Refaz só o disparo e o acompanhamento\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Se uma task do Airflow está lenta porque está processando dados, o problema não é o orquestrador: é o lugar onde o processamento foi colocado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o papel esperado de uma task do Airflow em um pipeline bem desenhado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar de forma permanente todos os dados que a DAG processa",
                                "isCorrect": false
                            },
                            {
                                "text": "Acionar o processamento certo e acompanhar até ele terminar",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar toda a transformação dos dados dentro do próprio worker",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o warehouse sempre que o volume de dados for pequeno",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task Python lê um arquivo de 40 GB, faz agregações com pandas dentro do próprio worker do Airflow e demora quase duas horas para terminar. Nesse tempo, outras DAGs do mesmo cluster ficam esperando slot de worker disponível. Qual mudança ataca a causa raiz do problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o retries da task para garantir que ela termine mesmo com lentidão",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o PythonOperator por um sensor, que consome menos recursos",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover a agregação para Spark ou para o warehouse, e a task só aciona e acompanha",
                                "isCorrect": true
                            },
                            {
                                "text": "Diminuir o poke_interval da task para ela liberar o worker mais rápido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma task que processa gigabytes de dados dentro do worker do Airflow, o que acontece quando ela falha na metade e o Airflow aciona um retry?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O XCom da task guarda o dado processado até ali, e o retry começa dali",
                                "isCorrect": false
                            },
                            {
                                "text": "Só a parte que faltava é refeita, porque o Airflow guarda o progresso automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O retry é ignorado, porque tasks que processam dados não suportam retry",
                                "isCorrect": false
                            },
                            {
                                "text": "Todo o processamento é refeito do zero, sem nenhum estado salvo fora do worker",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma task com @task lê um arquivo de configuração pequeno, calcula alguns parâmetros e decide qual job de Spark acionar, sem tocar nos dados de negócio propriamente ditos. Essa task viola o princípio de manter o orquestrador leve?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não, porque tasks com @task nunca contam como processamento, independente do que fazem",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, o volume manipulado pela própria task é pequeno; quem processa o dado é o Spark",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque decidir qual job acionar deveria ser responsabilidade do próprio job de Spark",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque qualquer lógica em Python dentro de uma task é considerada processamento pesado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task tenta devolver via XCom um DataFrame inteiro de alguns gigabytes para a próxima task usar. Por que essa prática é desaconselhada no Airflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "XCom é apagado automaticamente antes da próxima task conseguir lê-lo",
                                "isCorrect": false
                            },
                            {
                                "text": "XCom exige que as duas tasks estejam na mesma DAG e no mesmo worker físico",
                                "isCorrect": false
                            },
                            {
                                "text": "XCom só aceita valores numéricos, então um DataFrame nunca seria aceito",
                                "isCorrect": false
                            },
                            {
                                "text": "XCom foi feito para dados pequenos, como metadados, e fica salvo no metadata DB",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Operação, testes e boas práticas",
        "aulas": [
            {
                "titulo": "Testar DAGs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testar DAGs\n\nUm DAG é código Python, e código Python quebra: falta um import, sobra um parêntese, uma variável de ambiente ainda não existe naquele momento. A diferença para outros tipos de código está no efeito colateral de um DAG quebrado: o scheduler tenta reler a pasta `dags/` em ciclos regulares, e um arquivo com erro de importação pode atrasar o carregamento de todos os outros DAGs daquela pasta, além de nunca aparecer na interface para alguém perceber a tempo.\n\nTestar DAGs aplica à orquestração a mesma disciplina que o time já usa no código de ETL: garantir que o arquivo importa sem erro, que a lógica de cada task está correta isoladamente, e que a estrutura do grafo faz sentido."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de teste\",\"O que verifica\"],[\"Importação (DAG validity)\",\"O arquivo Python é importado sem lançar nenhuma exceção\"],[\"Unitário de task\",\"A lógica de negócio de uma função, isolada do Airflow\"],[\"Integridade estrutural\",\"Sem ciclos, sem tasks órfãs, convenções do time (retries, owner, tags)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O teste de importação\n\nO teste de maior retorno é o mais simples: carregar o módulo da DAG e confirmar que nenhuma exceção foi lançada. Ele pega a classe de erro mais comum e mais destrutiva (um import que falta no ambiente, um erro de digitação numa variável, um parêntese no lugar errado) antes que o scheduler tente reler o mesmo arquivo em produção.\n\nO Airflow expõe essa checagem através do `DagBag`, a mesma estrutura que o scheduler usa internamente para carregar os arquivos da pasta `dags/`. Rodar esse teste em CI, a cada commit, transforma um erro que só apareceria em produção num erro que aparece antes do merge."
                    },
                    {
                        "type": "text",
                        "value": "## Testar a lógica de uma task isolada\n\nUma task bem desenhada separa duas coisas: a definição da task (o operator, os parâmetros, as dependências) e a lógica de negócio que ela executa (a função que transforma um valor, calcula uma métrica, valida um payload). Quando essa lógica mora numa função pura, o teste unitário nem precisa instanciar um `DAG` ou um contexto de execução: chama a função direto, com um pytest comum, do mesmo jeito que já se testa qualquer outro código Python.\n\nIsso também é argumento contra colocar lógica de negócio extensa direto dentro do `python_callable` ou de uma função decorada com `@task`: quanto mais a lógica mora numa função separada, mais barato é testar sem precisar subir o Airflow inteiro."
                    },
                    {
                        "type": "text",
                        "value": "## Testes de integridade estrutural\n\nAlém de importar e de testar a lógica, vale validar propriedades do grafo em si, aplicadas a todas as DAGs do repositório de uma vez. Ciclos o próprio Airflow recusa ao montar o grafo, então esse erro tende a aparecer cedo, mas vale documentar a expectativa num teste. Tasks órfãs (definidas no arquivo, mas nunca conectadas a nenhuma dependência) costumam ser esquecimento, e um teste que percorre `dag.tasks` verificando se cada uma tem ao menos uma relação upstream ou downstream pega esse caso automaticamente. O mesmo vale para convenções do time, como toda task ter `retries` configurado."
                    },
                    {
                        "type": "code",
                        "value": "# tests/test_dags.py\nimport pytest\nfrom airflow.models import DagBag\n\nDAG_BAG = DagBag(dag_folder=\"dags/\", include_examples=False)\n\n\ndef test_dag_bag_importa_sem_erro():\n    assert len(DAG_BAG.import_errors) == 0, DAG_BAG.import_errors\n\n\ndef test_calcular_frete_e_uma_funcao_pura():\n    from services.transformacao import calcular_frete\n    assert calcular_frete(peso_kg=10, distancia_km=100) == 9.0\n\n\n@pytest.mark.parametrize(\"dag_id\", DAG_BAG.dag_ids)\ndef test_dag_sem_task_orfa(dag_id):\n    dag = DAG_BAG.get_dag(dag_id)\n    if len(dag.tasks) > 1:\n        for task in dag.tasks:\n            assert task.upstream_list or task.downstream_list, (\n                f\"task {task.task_id} sem dependência em {dag_id}\"\n            )"
                    },
                    {
                        "type": "quote",
                        "value": "Um DAG que nunca foi importado em CI é um incidente esperando a próxima janela de deploy para acontecer."
                    }
                ],
                "questions": [
                    {
                        "statement": "Antes de liberar o merge de uma alteração na pasta `dags/`, o pipeline de CI instancia um `DagBag` e verifica `dag_bag.import_errors`. O que esse teste está checando?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se algum arquivo da pasta de DAGs falha ao importar no Python.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se a task mais lenta da DAG terminou dentro do tempo esperado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se as credenciais de conexão usadas pela DAG ainda são válidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o scheduler tem workers suficientes para rodar a DAG agora.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função decorada com `@task` faz autenticação, chama uma API externa e calcula um valor de frete, tudo dentro do mesmo callable, em cerca de 40 linhas. Qual mudança facilita testar a lógica de cálculo do frete sem subir o Airflow?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extrair o cálculo de frete para uma função pura, testável com pytest comum.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o timeout da task para dar mais tempo à suíte de testes rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o operator da task para um KubernetesPodOperator antes de testar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de retries configurado na task durante os testes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa revisão de código, um time percebe que uma task chamada enviar_relatorio foi definida no arquivo da DAG, mas nunca aparece em nenhuma relação >> com as demais tasks. Que tipo de teste pegaria esse problema automaticamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um teste que verifica se toda task tem ao menos uma dependência configurada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um teste que verifica se o e-mail de notificação de falha está configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste que compara a duração da task com a média histórica dela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste que confere se a task tem um número mínimo de tentativas de retry.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O Airflow já recusa instanciar um DAG cujo grafo contenha um ciclo, lançando um erro ao montar as dependências. Diante disso, qual é o valor de manter, mesmo assim, um teste automatizado de ausência de ciclos rodando em CI?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Antecipa o erro para o CI, antes de chegar até o scheduler em produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substitui, por completo, a validação nativa do Airflow ao montar o DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permite que um DAG cíclico rode normalmente, com apenas um aviso no log.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduz o tempo que o scheduler leva para fazer o parse do arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados quer que toda alteração no repositório de DAGs passe por CI antes do merge. Qual conjunto de testes forma a base mínima recomendada para DAGs de Airflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Teste de importação, teste da lógica de cada task e teste de integridade do grafo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste de carga, teste de latência de rede e teste de uso de memória do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Teste de cobertura de código, teste de estilo e teste de tipagem estática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Teste de permissões de acesso, teste de UI e teste de autenticação do webserver.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Versionar e implantar DAGs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Versionar e implantar DAGs\n\nUm DAG é código, então segue o mesmo ciclo de vida de qualquer código: vive num repositório git, passa por revisão, roda numa esteira de CI e só depois chega ao ambiente onde vai rodar de verdade. A particularidade da orquestração está no que significa \"chegar ao ambiente\": não existe um binário para publicar nem um serviço para reiniciar, existe um arquivo Python que precisa aparecer na pasta que o scheduler observa.\n\nEsta aula cobre como levar um DAG do commit até o scheduler de forma confiável, e como manter dev e produção coerentes sem duplicar código."
                    },
                    {
                        "type": "text",
                        "value": "## DAGs no git\n\nO repositório de DAGs segue o mesmo fluxo de qualquer outro código: branch, pull request, revisão por outra pessoa do time, merge na branch principal. O arquivo em produção deveria ser sempre um reflexo direto do que está na branch principal do git, nunca uma versão editada manualmente no servidor. Uma edição feita direto no servidor, por SSH por exemplo, some no próximo deploy, e ninguém mais sabe que ela existiu."
                    },
                    {
                        "type": "code",
                        "value": "# .ci/pipeline.yml (configuração ilustrativa de um pipeline de CI/CD)\nstages: [lint, test, deploy]\n\nlint:\n  script:\n    - black --check dags/\n    - flake8 dags/\n\ntest:\n  script:\n    - pytest tests/test_dags.py   # importação + lógica de task + integridade\n\ndeploy_dev:\n  branch: develop\n  script:\n    - rsync -av dags/ usuario@airflow-dev:/opt/airflow/dags/\n\ndeploy_prod:\n  branch: main\n  requires: [deploy_dev]         # só promove depois de validado em dev\n  script:\n    - rsync -av dags/ usuario@airflow-prod:/opt/airflow/dags/"
                    },
                    {
                        "type": "text",
                        "value": "## Sincronizando os arquivos até o scheduler\n\nPassar no lint e nos testes não é o fim da história: o arquivo ainda precisa chegar fisicamente até a máquina, o volume ou o bucket que o scheduler lê. Isso costuma acontecer de poucas formas: um processo de git-sync que roda ao lado do scheduler e faz git pull em intervalos regulares num volume compartilhado; uma imagem Docker reconstruída a cada deploy, com os arquivos de DAG já embutidos; ou o próprio pipeline de CI copiando os arquivos para o storage correto depois dos testes passarem.\n\nEm qualquer uma dessas formas, vale lembrar que a mudança não é instantânea: existe um intervalo entre o merge e o momento em que o scheduler efetivamente relê aquele arquivo."
                    },
                    {
                        "type": "text",
                        "value": "## Ambientes: dev e produção\n\nCada ambiente mantém seu próprio metadata DB e seu próprio conjunto de Variables e Connections, mas idealmente roda o mesmo código de DAG. Promover uma alteração de dev para produção deveria significar mover o mesmo arquivo, sem editar uma linha, porque qualquer valor que muda entre ambientes (endpoint de uma API, credencial, nome de uma tabela) vem de uma Variable ou Connection com o mesmo nome nos dois lugares, não de um valor escrito direto no código."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia de sincronização\",\"Como funciona\",\"Trade-off\"],[\"git-sync (sidecar)\",\"Um processo faz git pull periódico num volume compartilhado com o scheduler\",\"Simples de operar, mas a mudança só chega no próximo ciclo de sync\"],[\"Imagem com DAGs embutidas\",\"Os arquivos são copiados para dentro da imagem durante o build\",\"Deploy reprodutível, mas exige rebuild e novo rollout a cada mudança\"],[\"CI copia para o storage\",\"O pipeline roda os testes e depois copia os arquivos para o volume ou bucket\",\"Rápido de aplicar, mas depende do storage estar acessível ao CI\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma DAG só está de fato pronta quando o caminho do commit até o scheduler é automático, testado e igual em todo ambiente."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa, na prática, \"implantar\" (fazer o deploy de) uma DAG do Airflow?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fazer o arquivo Python da DAG chegar até a pasta que o scheduler monitora.",
                                "isCorrect": true
                            },
                            {
                                "text": "Compilar a DAG num binário executável e publicar num artefato versionado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reiniciar o metadata DB para que a nova definição de tasks seja aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registrar manualmente cada task nova através da interface web do Airflow.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time configura um git-sync que atualiza a pasta de DAGs a cada 60 segundos. Um desenvolvedor corrige um bug, faz merge na branch principal, e confere o Airflow 5 segundos depois: a mudança ainda não aparece. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O próximo ciclo de sincronização do git-sync ainda não ocorreu.",
                                "isCorrect": true
                            },
                            {
                                "text": "O merge não foi de fato concluído no repositório remoto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scheduler está com o executor configurado de forma incorreta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A correção introduziu um novo erro de importação no arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG usada em dev e em produção referencia o endpoint de uma API externa. Ao promover a DAG para produção, o time percebe que o endereço está escrito direto no código Python da task, ainda apontando para o ambiente de dev. Qual prática evita esse tipo de problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ler o endereço a partir de uma Variable ou Connection do ambiente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter um arquivo de DAG separado e completo para cada ambiente existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Congelar o deploy em produção até alguém trocar o endereço manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um comentário no código avisando qual ambiente está ativo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num pipeline de CI/CD para DAGs, o deploy em produção só é liberado depois que o mesmo commit já passou pelo deploy em desenvolvimento e pela suíte de testes automatizados. Qual é o principal benefício dessa promoção em etapas, em vez de aplicar direto em produção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduz o risco de um problema só aparecer com dados reais de produção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Elimina de vez a necessidade de testes de importação antes de cada deploy.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que o Airflow de produção sempre terá menos tasks que o de dev.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permite pular a etapa de lint quando o ambiente de dev já validou o código.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um incidente em produção, um engenheiro edita direto o arquivo da DAG no servidor, via SSH, para corrigir um valor de configuração, sem passar pelo git nem pelo pipeline de CI. A correção funciona na hora. Qual é o principal risco dessa prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A mudança some no próximo deploy, porque não existe no controle de versão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Airflow rejeita edições feitas fora da interface web, revertendo o arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O scheduler para de funcionar até o arquivo ser sincronizado de novo pelo git.",
                                "isCorrect": false
                            },
                            {
                                "text": "A DAG passa a rodar em modo de manutenção até uma nova versão ser publicada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Observabilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Observabilidade\n\nQuando um pipeline falha às 3 da manhã, a pergunta nunca é só \"falhou?\", é \"por que falhou, desde quando, e isso é raro ou está virando um padrão?\". Um orquestrador que só executa tasks, sem dar visibilidade sobre elas, empurra essas perguntas para uma investigação manual, revirando logs de servidor e cruzando horários à mão.\n\nObservabilidade, no contexto de orquestração, é o conjunto de sinais que respondem a essas perguntas sem precisar reconstruir a investigação do zero a cada incidente: logs por task, o histórico de execuções e métricas de duração e falha ao longo do tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Logs por task\n\nCada execução de cada task grava seu próprio log, isolado das demais, acessível diretamente pela página daquela task instance na interface. Isso importa porque um DAG com 20 tasks gera 20 fluxos de log independentes por execução: procurar o motivo de uma falha específica no log de uma task isolada é muito mais rápido do que vasculhar um log único e compartilhado de todo o pipeline."
                    },
                    {
                        "type": "text",
                        "value": "## Histórico de execuções: grid, graph e Gantt\n\nO grid view mostra uma matriz com as execuções (dag runs) numa direção e as tasks na outra, cada célula colorida pelo estado daquela execução específica. É a visão mais rápida para responder \"essa task vem falhando há quanto tempo\" ou \"isso começou a quebrar a partir de qual dia\".\n\nO graph view mostra a estrutura de dependências de uma execução específica, útil para ver visualmente em qual ponto do grafo um run travou. O Gantt view mostra a duração de cada task dentro de uma execução, lado a lado, o que ajuda a enxergar qual task consome mais tempo dentro do run, e se tasks que poderiam rodar em paralelo estão de fato se sobrepondo."
                    },
                    {
                        "type": "code",
                        "value": "task              dia 10   dia 11   dia 12   dia 13\nextrair_dados      OK       OK       OK       OK\nvalidar_schema     OK       OK       OK       FALHOU\ncarregar_tabela     -        -        -      NAO_RODOU\n\n# leitura do grid view acima:\n# validar_schema começou a falhar no dia 13\n# carregar_tabela nunca chegou a rodar naquele dia (upstream falhou)\n# dias 10 a 12 não mostram nenhum padrão de instabilidade"
                    },
                    {
                        "type": "text",
                        "value": "## Métricas: duração e taxa de falha\n\nAlém do resultado de uma execução isolada, vale acompanhar como cada task se comporta ao longo do tempo: duração média, tempo de fila antes de começar a rodar, e taxa de sucesso ou falha numa janela de dias ou semanas. Uma task que sempre levou 4 minutos e passa a levar 11 não gerou nenhuma falha, mas é um sinal de que algo mudou (volume de dados crescendo, um recurso externo mais lento, contenção por outra task no mesmo pool) antes que vire um atraso crítico.\n\nComparar a duração ou a taxa de falha atual contra o histórico da mesma task é como se encontra a task lenta ou a task cronicamente instável antes que ela vire um incidente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sinal\",\"Pergunta que responde\"],[\"Log da task\",\"Por que essa execução específica falhou\"],[\"Grid view\",\"Desde quando essa task vem falhando ou ficando lenta\"],[\"Graph view\",\"Em qual task uma execução específica travou\"],[\"Duração ao longo do tempo\",\"Essa execução foi mais lenta que o normal para essa task\"],[\"Taxa de falha\",\"Essa task falha raramente ou é cronicamente instável\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um pipeline sem observabilidade não é confiável, é só sortudo até o dia em que alguém pergunta por que o número está errado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Onde um engenheiro deve olhar primeiro para entender por que uma execução específica de uma task falhou?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No log daquela task, disponível na página da task instance.",
                                "isCorrect": true
                            },
                            {
                                "text": "No arquivo de configuração global do scheduler Airflow.",
                                "isCorrect": false
                            },
                            {
                                "text": "No histórico de commits do repositório git de DAGs.",
                                "isCorrect": false
                            },
                            {
                                "text": "No painel de uso de CPU e memória do servidor todo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No grid view de uma DAG, a task validar_pagamento aparece verde em todos os dias, até que, a partir de uma data específica, passa a aparecer vermelha em toda execução seguinte. Qual é a leitura mais direta dessa visualização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Algo mudou a partir daquela data, quebrando a task todas as vezes.",
                                "isCorrect": true
                            },
                            {
                                "text": "A task está configurada com um número de retries maior que o das demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O DAG inteiro parou de ser agendado a partir daquela data específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "A duração da task cresceu de forma gradual ao longo do tempo todo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Gantt view de uma execução, duas tasks sem dependência entre si, que poderiam rodar em paralelo, aparecem uma exatamente após a outra, sem nenhuma sobreposição de horário. O que esse padrão sugere investigar primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um pool ou os slots do executor podem estar limitando o paralelismo entre elas.",
                                "isCorrect": true
                            },
                            {
                                "text": "As duas tasks provavelmente têm uma dependência oculta não declarada no código.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas tasks foram configuradas com a trigger rule all_done por engano.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grid view está desatualizado e precisa ser recarregado manualmente pelo time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A task transformar_pedidos levava, em média, 4 minutos nos últimos seis meses. Nas últimas duas semanas, a duração média subiu para 11 minutos, embora nenhuma execução tenha falhado. Qual é a ação mais adequada diante desse sinal?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Investigar a causa do aumento de duração antes que vire um atraso crítico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignorar o sinal, já que só métricas de falha justificam alguma investigação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de retries da task para compensar o tempo a mais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o intervalo de agendamento da DAG para compensar o atraso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença principal entre consultar o log de uma task e consultar a métrica de duração dessa mesma task?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O log explica uma execução específica; a métrica mostra a tendência no tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O log mostra a tendência no tempo; a métrica explica uma execução específica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O log e a métrica mostram sempre a mesma informação, em formatos diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O log só existe para tasks que falharam; a métrica existe para todas elas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Custo e desempenho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Custo e desempenho\n\nOrquestrar também tem custo, e nem sempre é óbvio onde ele mora. O scheduler não executa o trabalho pesado dos pipelines, mas precisa reler e reprocessar a definição de cada DAG em ciclos constantes, e cada execução compete por slots de execução com todas as outras rodando ao mesmo tempo. Um ambiente com centenas de DAGs sente esse custo de um jeito que um ambiente com cinco DAGs nunca sente.\n\nEsta aula cobre dois eixos: o que evitar para não pesar o parse dos arquivos, e como limitar a concorrência de forma deliberada, em vez de deixar cada DAG competir livremente pelos mesmos recursos."
                    },
                    {
                        "type": "text",
                        "value": "## Código pesado no topo do arquivo\n\nTudo que está no nível do módulo num arquivo de DAG, fora de qualquer task, roda a cada vez que o scheduler faz o parse daquele arquivo, e isso acontece em ciclos regulares, não só quando a DAG é de fato executada. Uma chamada de rede, uma consulta pesada ao banco ou um cálculo custoso escritos direto no corpo do arquivo rodam dezenas de vezes ao dia sem que nenhuma execução tenha realmente começado, e atrasam o parse de todos os DAGs daquela pasta, não só o daquele arquivo.\n\nA correção é sempre a mesma: mover esse código para dentro de uma função executada pela task (um python_callable, o corpo de uma função @task), para que ele só rode quando a task de fato for executada."
                    },
                    {
                        "type": "code",
                        "value": "# antipadrão: roda a cada parse do scheduler, não só na execução da task\nimport requests\n\nCONFIG = requests.get(\"https://api.interna/config\").json()  # top-level: roda sempre\n\nwith DAG(\"pedidos_diarios\", schedule=\"0 6 * * *\") as dag:\n    processar = PythonOperator(\n        task_id=\"processar\",\n        python_callable=lambda: transformar(CONFIG),\n    )\n\n\n# corrigido: a chamada só acontece quando a task é de fato executada\ndef processar_pedidos(**context):\n    config = requests.get(\"https://api.interna/config\").json()\n    transformar(config)\n\nwith DAG(\"pedidos_diarios\", schedule=\"0 6 * * *\") as dag:\n    processar = PythonOperator(\n        task_id=\"processar\",\n        python_callable=processar_pedidos,\n    )"
                    },
                    {
                        "type": "text",
                        "value": "## Pools: limitar concorrência sobre um recurso compartilhado\n\nUm pool define um número fixo de slots para um recurso específico, e qualquer task de qualquer DAG atribuída àquele pool disputa esses mesmos slots. É a ferramenta certa quando o gargalo não está no Airflow, está do outro lado: uma API de parceiro que aceita poucas conexões simultâneas, um banco réplica com limite de conexões, uma licença de software com um número máximo de usos ao mesmo tempo.\n\nSem um pool, nada impede que dez DAGs diferentes, cada uma com uma task que chama essa mesma API, rodem ao mesmo tempo e derrubem a origem. Com um pool de 3 slots atribuído a todas essas tasks, no máximo 3 rodam por vez, não importa quantas DAGs distintas estejam ativas."
                    },
                    {
                        "type": "text",
                        "value": "## max_active_tasks, max_active_runs e parallelism\n\nTrês configurações limitam concorrência em níveis diferentes, e é comum confundir uma com a outra. parallelism é global: o número máximo de tasks rodando ao mesmo tempo em toda a instalação do Airflow, somando todas as DAGs. max_active_tasks vale por DAG: quantas tasks daquela DAG específica podem rodar ao mesmo tempo, mesmo que várias execuções dela estejam ativas. max_active_runs também vale por DAG, mas limita outra coisa: quantas execuções (runs) daquela DAG podem estar ativas ao mesmo tempo, o que importa quando uma execução depende do resultado da anterior."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Configuração\",\"Nível\",\"O que limita\"],[\"parallelism\",\"Instância inteira do Airflow\",\"Tasks rodando ao mesmo tempo, somando todas as DAGs\"],[\"max_active_tasks\",\"Uma DAG\",\"Tasks dessa DAG rodando ao mesmo tempo, em qualquer execução\"],[\"max_active_runs\",\"Uma DAG\",\"Execuções (runs) dessa DAG ativas ao mesmo tempo\"],[\"pool\",\"Um recurso compartilhado\",\"Tasks de quaisquer DAGs usando aquele recurso ao mesmo tempo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Desempenho em orquestração raramente é sobre a task individual, é sobre quantas coisas o ambiente deixa acontecer ao mesmo tempo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que colocar uma chamada de rede pesada direto no nível do módulo de um arquivo de DAG, fora de qualquer task, é uma má prática?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque esse código roda a cada parse do arquivo pelo scheduler, não só na execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Airflow bloqueia por padrão qualquer chamada de rede fora de uma task.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque tasks fora de um operator não aparecem no grid view da interface.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o metadata DB armazena o resultado dessa chamada em cada execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Cinco DAGs diferentes têm tasks que consultam a mesma API de um parceiro, que aceita no máximo 3 conexões simultâneas. Em dias de pico, várias dessas tasks rodam ao mesmo tempo e a API passa a recusar conexões. Qual mecanismo resolve isso sem impedir que as DAGs rodem em paralelo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar um pool com 3 slots, atribuído às tasks que chamam essa API.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir max_active_runs=1 em cada uma das cinco DAGs envolvidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o parallelism global da instância para liberar mais slots.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um número maior de retries nas tasks que chamam essa API.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG de fechamento financeiro precisa que cada execução termine antes da próxima começar, porque o cálculo depende do resultado da execução anterior. Qual configuração garante isso diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir max_active_runs=1 na configuração dessa DAG.",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir max_active_tasks=1 na configuração dessa DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir parallelism=1 na configuração da instância inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um pool com 1 slot e atribuí-lo às tasks dessa DAG.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A instância do Airflow tem parallelism=32. Uma DAG específica tem max_active_tasks=10 e, num certo momento, é a única DAG com execuções ativas no ambiente. Quantas tasks dessa DAG podem rodar ao mesmo tempo nesse momento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "No máximo 10, porque o limite da própria DAG é o mais restritivo aqui.",
                                "isCorrect": true
                            },
                            {
                                "text": "No máximo 32, porque o limite da instância prevalece sobre o da DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exatamente 32, dividido em partes iguais entre as DAGs cadastradas.",
                                "isCorrect": false
                            },
                            {
                                "text": "No máximo 22, a diferença entre o limite da instância e o da DAG.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que o scheduler está cada vez mais lento para exibir DAGs novas na interface, mesmo sem aumento no volume de execuções. Investigando, encontram vários arquivos de DAG com consultas ao banco escritas fora de qualquer task, direto no corpo do arquivo. Qual é a relação mais provável com a lentidão observada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada consulta roda de novo a cada parse, atrasando o carregamento das DAGs.",
                                "isCorrect": true
                            },
                            {
                                "text": "As consultas consomem os mesmos slots de pool usados pelas tasks em execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "As consultas aumentam o tamanho do metadata DB a cada execução da DAG.",
                                "isCorrect": false
                            },
                            {
                                "text": "As consultas só rodam de novo quando alguém abre o graph view manualmente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas e antipadrões",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas e antipadrões\n\nEssa é a última aula da trilha, e o objetivo é consolidar numa lente operacional o que separa um pipeline orquestrado que aguenta rodar em produção por anos de um que quebra toda vez que alguém olha para ele. Boa parte dessas ideias já apareceu em módulos anteriores, isolada em cada tópico (idempotência no módulo 5, o orquestrador que não processa dados no módulo 6). Aqui elas se juntam numa checklist para revisar antes de considerar uma DAG pronta para produção."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\",\"Por que importa\"],[\"Idempotência\",\"Reexecutar uma task não duplica nem corrompe o que já foi processado\"],[\"Tasks pequenas e atômicas\",\"Uma falha refaz só aquele passo, não o pipeline inteiro\"],[\"Não processar no worker\",\"Poupa a memória e a CPU do orquestrador, que existe para coordenar\"],[\"Parametrização\",\"A mesma DAG serve para dev, produção ou datas diferentes, sem duplicar código\"],[\"XCom só para dados pequenos\",\"Evita sobrecarregar o metadata DB com payloads grandes\"],[\"DAGs simples e legíveis\",\"Reduz o tempo para entender, revisar e corrigir o pipeline\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Idempotência e tasks pequenas e atômicas\n\nIdempotência (rodar de novo com segurança) fica mais fácil de garantir quando cada task faz uma coisa só. Uma task que baixa um arquivo, valida o schema e insere no banco, tudo junto, precisa refazer as três etapas inteiras se a terceira falhar, mesmo que as duas primeiras já tivessem funcionado. Dividir essas etapas em tasks separadas, encadeadas por dependência, faz o reprocessamento custar só o que de fato precisa ser refeito."
                    },
                    {
                        "type": "text",
                        "value": "## Não processar dados pesados no worker\n\nO orquestrador coordena quando e em que ordem o trabalho acontece, ele não é o lugar de processar volumes grandes de dados. Uma task que carrega um DataFrame de vários gigabytes na memória do worker compete por CPU e memória com qualquer outra task rodando no mesmo worker, e pode derrubar processos que não têm nenhuma relação com ela. A alternativa é a mesma dos módulos anteriores: a task apenas aciona e monitora um job externo (Spark, um warehouse, um serviço dedicado), que faz o processamento pesado fora do Airflow."
                    },
                    {
                        "type": "text",
                        "value": "## Parametrizar e evitar XCom grande\n\nUma DAG parametrizada lê valores que mudam (datas, nomes de tabela, ambiente) a partir de params, de Variables ou da própria data lógica da execução, em vez de ter esses valores fixos no código. Isso evita duplicar a mesma DAG por ambiente ou por período, e faz com que promover de dev para produção seja mover o mesmo arquivo, sem editar nada.\n\nXCom serve para passar metadados pequenos entre tasks (um id, um caminho de arquivo, uma contagem de linhas), não para carregar o resultado de um processamento inteiro. Empurrar um DataFrame de milhões de linhas por XCom sobrecarrega o metadata DB e reintroduz, por trás das cortinas, o mesmo problema de processar dados pesados dentro do Airflow."
                    },
                    {
                        "type": "code",
                        "value": "# antipadrão: task única, sem idempotência, XCom com o dado inteiro\ndef processar_tudo(**context):\n    df = extrair_do_banco()                            # processamento no worker\n    df = limpar_e_transformar(df)\n    df.to_sql(\"pedidos\", engine, if_exists=\"append\")    # append: reprocessar duplica\n    context[\"ti\"].xcom_push(key=\"dados\", value=df.to_dict())\n\ntarefa_unica = PythonOperator(task_id=\"processar_tudo\", python_callable=processar_tudo)\n\n\n# corrigido: tasks pequenas, idempotentes, worker só aciona e monitora\nextrair = SparkSubmitOperator(\n    task_id=\"extrair\",\n    application=\"jobs/extrair_pedidos.py\",\n    application_args=[\"--data\", \"{{ ds }}\"],            # parametrizado pela data lógica\n)\n\ncarregar = SparkSubmitOperator(\n    task_id=\"carregar\",\n    application=\"jobs/carregar_pedidos.py\",\n    application_args=[\"--data\", \"{{ ds }}\", \"--modo\", \"upsert\"],  # upsert é idempotente\n)\n\nextrair >> carregar"
                    },
                    {
                        "type": "quote",
                        "value": "Orquestrar não é rodar tarefas na hora certa, é dar ao time a confiança de que o pipeline se comporta do mesmo jeito, falha de forma previsível e se recupera sem drama, hoje e daqui a um ano."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que uma task que carrega um DataFrame de vários gigabytes na memória do worker é considerada uma má prática operacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela compete por memória e CPU com as demais tasks do mesmo worker.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela impede que a task seja marcada como bem-sucedida pelo scheduler.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela desabilita automaticamente os retries configurados na task.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela remove a task da visualização do grid view depois de concluída.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task extrai um DataFrame de 2 milhões de linhas e usa xcom_push para repassar o resultado inteiro para a próxima task processar. A execução fica lenta e o metadata DB cresce rapidamente. Qual é a correção mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gravar os dados num storage intermediário e passar só o caminho via XCom.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o tamanho máximo de XCom permitido na configuração do Airflow.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir o mesmo conteúdo em várias chamadas menores de xcom_push.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir o DataFrame antes de enviá-lo pelo XCom para reduzir o tamanho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task única baixa um arquivo de um FTP, valida o schema e insere os dados numa tabela, nessa ordem. A inserção falha por uma coluna com tipo incompatível. Depois de corrigir o problema, reexecutar a task refaz o download e a validação, que já tinham funcionado. Qual mudança de design evita esse retrabalho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Separar as três etapas em tasks distintas, encadeadas por dependência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de retries configurado nessa task para 5 tentativas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover a validação de schema para dentro do banco de dados de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o operator da task por um sensor que aguarda o arquivo no FTP.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma DAG de fechamento mensal tem, escrito direto no código Python, o nome do mês de referência usado para nomear a tabela de destino. Para rodar o fechamento de um mês anterior, alguém precisa editar o arquivo e commitar de novo. Qual mudança resolve esse problema de forma alinhada às boas práticas de orquestração?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Passar o mês de referência como parâmetro, derivado da data lógica da execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar uma DAG separada e idêntica para cada mês do ano, mantida à mão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar max_active_runs para permitir rodar vários meses ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover o nome do mês para dentro de uma task, sem alterar o restante do código.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ver testes, versionamento, observabilidade, custo e as boas práticas desta aula, qual afirmação resume melhor o papel do orquestrador dentro de um pipeline de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele coordena quando e em que ordem o trabalho acontece, sem processar os dados pesados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele substitui a necessidade de testes automatizados, porque já garante a ordem certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele processa os dados diretamente no worker sempre que a tarefa é pequena.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele existe, sobretudo, para reduzir o custo de armazenamento no data warehouse.",
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
