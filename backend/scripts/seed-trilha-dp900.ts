// Seed da trilha AZURE DP-900 (regenerado no formato padrao durante a campanha de de-tell).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "AZURE DP-900";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "Trilha de fundamentos de dados no Microsoft Azure para a certificação DP-900: conceitos de dados, cargas transacionais e analíticas, dados relacionais e não relacionais no Azure, e cargas de análise com Microsoft Fabric, Azure Databricks e Power BI.";

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
        "titulo": "Módulo 1 - Conceitos centrais de dados",
        "aulas": [
            {
                "titulo": "Dados estruturados, semiestruturados e não estruturados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Os três tipos de dados\nTodo dado que uma empresa guarda cai em um de três tipos, definidos pelo quanto ele segue um formato fixo. Classificar o dado é o primeiro passo para decidir onde guardar e como consultar.\n\n## Dados estruturados\nSão dados que cabem em tabelas com schema fixo, organizados em linhas e colunas. Cada coluna tem um tipo definido (texto, número, data) e todo registro segue o mesmo formato. O schema é definido antes de gravar, então a estrutura vem primeiro e o dado depois. É o formato típico dos bancos relacionais. Exemplos: cadastro de clientes, lançamentos financeiros e catálogo de produtos.\n\n## Dados semiestruturados\nTêm alguma organização, mas o schema é flexível e self-describing: o próprio dado carrega as marcações que descrevem seus campos. Dois registros podem ter campos diferentes. Entram aqui JSON, XML, pares chave-valor, documentos e grafos. Exemplos: um documento JSON de um pedido, um arquivo XML de configuração e dados de redes sociais. Costumam ficar em bancos NoSQL, como o Azure Cosmos DB.\n\n## Dados não estruturados\nNão seguem nenhum modelo de dados definido. O conteúdo existe, mas não há linhas, colunas nem campos que o organizem por dentro. Exemplos: imagens, áudio, vídeo, PDFs e e-mails. Ficam bem em armazenamento de objetos como o Azure Blob Storage ou em um data lake."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"Característica\",\"Exemplo\",\"Onde armazenar\"],[\"Estruturado\",\"Schema fixo em linhas e colunas\",\"Cadastro de clientes\",\"Banco relacional como Azure SQL\"],[\"Semiestruturado\",\"Schema flexível e self-describing\",\"Documento JSON ou XML\",\"Banco NoSQL como Azure Cosmos DB\"],[\"Não estruturado\",\"Sem modelo de dados definido\",\"Imagem, vídeo ou PDF\",\"Blob Storage ou data lake\"]]"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"pedido\": 1042,\n  \"cliente\": \"Ana\",\n  \"itens\": [\"café\", \"filtro\"],\n  \"entrega\": { \"cidade\": \"Recife\" }\n}"
                    },
                    {
                        "type": "quote",
                        "value": "O que separa os três é o schema. Estruturado tem schema fixo definido antes de gravar. Semiestruturado carrega o schema dentro do próprio dado. Não estruturado não tem schema nenhum."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa guarda o cadastro de clientes em tabelas com colunas fixas de nome, CPF e data de nascimento, iguais em todo registro. Como esses dados são classificados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Estruturados",
                                "isCorrect": true
                            },
                            {
                                "text": "Semiestruturados",
                                "isCorrect": false
                            },
                            {
                                "text": "Não estruturados",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem qualquer organização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo recebe pedidos como documentos JSON em que cada pedido pode ter campos diferentes. Que tipo de dado é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Semiestruturado",
                                "isCorrect": true
                            },
                            {
                                "text": "Estruturado",
                                "isCorrect": false
                            },
                            {
                                "text": "Não estruturado",
                                "isCorrect": false
                            },
                            {
                                "text": "Relacional normalizado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time precisa armazenar milhares de imagens de exames e gravações de áudio de atendimento. Qual serviço combina com esse dado não estruturado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure SQL Database",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela relacional normalizada",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice de colunas em banco relacional",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente dados semiestruturados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Schema flexível: os próprios dados descrevem seus campos",
                                "isCorrect": true
                            },
                            {
                                "text": "Schema fixo, definido sempre antes de gravar os dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem nenhuma estrutura ou organização interna",
                                "isCorrect": false
                            },
                            {
                                "text": "Só é possível guardar em bancos relacionais",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer guardar perfis cuja estrutura muda de um registro para outro, usando pares chave-valor e documentos. Qual banco atende melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Cosmos DB",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure SQL Database",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "SQL Server com schema fixo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Formatos de arquivo e opções de armazenamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que o formato importa\nO mesmo dado pode ser gravado em formatos diferentes, e a escolha muda o tamanho do arquivo e a velocidade de leitura. Uns são feitos para o humano ler e trocar dados entre sistemas. Outros são feitos para a máquina processar grandes volumes em análise.\n\n## Formatos comuns\nCSV e outros delimitados guardam dados em texto, uma linha por registro, com campos separados por um caractere como a vírgula. São leves, portáteis e fáceis de ler, mas não guardam tipos nem hierarquia. JSON organiza os dados em hierarquia com pares chave-valor e é self-describing. XML também é hierárquico, usando tags para marcar cada campo.\n\n## Formatos otimizados para análise\nParquet e ORC guardam os dados por coluna (colunar). Como os valores de uma mesma coluna ficam juntos e são parecidos, a compressão fica muito boa e a leitura analítica busca só as colunas necessárias, sem varrer o resto. Avro guarda os dados por linha, favorece a escrita e o transporte de mensagens e mantém o schema junto do arquivo. Regra geral: colunar para leitura analítica, por linha para escrita intensa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Formato\",\"Organização\",\"Quando usar\"],[\"CSV\",\"Texto delimitado, por linha\",\"Troca simples e portátil de dados\"],[\"JSON\",\"Hierárquico e self-describing\",\"Dados semiestruturados e APIs\"],[\"XML\",\"Hierárquico com tags\",\"Integração e configuração\"],[\"Parquet\",\"Colunar\",\"Leitura analítica com boa compressão\"],[\"ORC\",\"Colunar\",\"Leitura analítica em grandes volumes\"],[\"Avro\",\"Por linha\",\"Escrita intensa e streaming\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde guardar: arquivos ou bancos\nUm data store pode ser um conjunto de arquivos ou um banco de dados. Arquivos em um data lake servem bem para guardar volume bruto barato, em qualquer formato. Bancos de dados dão estrutura, consultas e regras de integridade.\n\nEntre os bancos, os relacionais guardam dados em tabelas com schema fixo e relações entre elas, com forte consistência. Os não relacionais (NoSQL) trazem schema flexível e escalam bem para documentos, chave-valor, colunas largas e grafos. Não existe o melhor em abstrato: escolhe-se o armazenamento pelo caso de uso, olhando formato do dado, volume, padrão de consulta e necessidade de consistência."
                    },
                    {
                        "type": "quote",
                        "value": "Colunar (Parquet e ORC) vence na leitura analítica e na compressão porque busca só as colunas pedidas. Por linha (Avro) vence na escrita e no transporte de dados."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa exporta uma tabela para um arquivo de texto simples, uma linha por registro, com campos separados por vírgula, para enviar a um parceiro. Que formato é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "CSV",
                                "isCorrect": true
                            },
                            {
                                "text": "Parquet",
                                "isCorrect": false
                            },
                            {
                                "text": "Avro",
                                "isCorrect": false
                            },
                            {
                                "text": "ORC",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um data warehouse precisa ler poucas colunas de bilhões de linhas gerando o menor arquivo possível. Qual formato é o mais indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Parquet",
                                "isCorrect": true
                            },
                            {
                                "text": "CSV",
                                "isCorrect": false
                            },
                            {
                                "text": "XML",
                                "isCorrect": false
                            },
                            {
                                "text": "JSON",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pipeline de streaming grava muitos eventos e precisa manter o schema junto dos dados, favorecendo a escrita. Qual formato combina?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Avro",
                                "isCorrect": true
                            },
                            {
                                "text": "Parquet",
                                "isCorrect": false
                            },
                            {
                                "text": "ORC",
                                "isCorrect": false
                            },
                            {
                                "text": "CSV",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual formato é hierárquico, self-describing e muito usado em APIs web?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "JSON",
                                "isCorrect": true
                            },
                            {
                                "text": "CSV",
                                "isCorrect": false
                            },
                            {
                                "text": "Parquet",
                                "isCorrect": false
                            },
                            {
                                "text": "ORC",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time precisa guardar um volume enorme de arquivos brutos, de vários formatos, com o menor custo, antes de processar. Qual opção de armazenamento faz mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Arquivos em um data lake",
                                "isCorrect": true
                            },
                            {
                                "text": "Um banco relacional normalizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma única tabela em memória",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice colunar em banco relacional",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cargas de trabalho: transacional (OLTP) e analítica (OLAP)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Duas cargas de trabalho, dois objetivos\nSistemas de dados servem a dois tipos de trabalho bem diferentes. Um roda a operação do dia a dia, registrando o que acontece agora. O outro analisa o histórico acumulado para gerar relatório e apoiar decisão. Cada um pede um desenho de banco diferente.\n\n## OLTP: processamento transacional\nOLTP (Online Transaction Processing) lida com muitas transações pequenas de leitura e escrita sobre dados atuais. É o que roda por trás de um sistema de pedidos, um caixa de loja ou um app de banco. O banco costuma ser normalizado, para evitar dado repetido e manter a integridade, e precisa garantir ACID em cada transação.\n\n## OLAP: processamento analítico\nOLAP (Online Analytical Processing) faz leitura pesada com agregações sobre grandes volumes de dados históricos, para relatório e BI. As consultas somam, contam e agrupam milhões de linhas. Para ler rápido, o dado costuma ficar desnormalizado, muitas vezes em esquema estrela, com uma tabela de fatos no centro e tabelas de dimensão em volta."
                    },
                    {
                        "type": "text",
                        "value": "## ACID em uma transação\nACID é o conjunto de garantias que um banco transacional dá a cada transação:\n- Atomicidade: tudo acontece ou nada acontece, sem meio-termo.\n- Consistência: a transação leva o banco de um estado válido a outro estado válido.\n- Isolamento: transações simultâneas não interferem umas nas outras.\n- Durabilidade: uma vez confirmada, a alteração persiste mesmo se faltar energia.\n\n## O fluxo geral de análise\nLevar o dado do sistema operacional até um painel segue etapas: ingerir os dados das fontes, processar e transformar (limpar e padronizar), armazenar em um repositório analítico, modelar e servir os dados prontos para consulta e, por fim, visualizar em relatórios e dashboards."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"OLTP\",\"OLAP\"],[\"Objetivo\",\"Rodar a operação do dia a dia\",\"Analisar histórico para decisão\"],[\"Operações\",\"Muitas transações pequenas de leitura e escrita\",\"Consultas de leitura com agregações\"],[\"Dados\",\"Atuais\",\"Históricos acumulados\"],[\"Modelagem\",\"Normalizado\",\"Desnormalizado, esquema estrela\"],[\"Garantia principal\",\"ACID em cada transação\",\"Leitura rápida de grandes volumes\"],[\"Exemplo\",\"Sistema de pedidos\",\"Relatório de vendas no BI\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "OLTP escreve muito e mantém o dado atual normalizado com ACID. OLAP lê muito e mantém o histórico desnormalizado em esquema estrela. Se a pergunta é operação, é OLTP; se é relatório, é OLAP."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um sistema de pedidos registra o tempo todo novas compras, atualiza estoque e confirma pagamentos, com muitas transações pequenas. Que tipo de carga é essa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "OLTP",
                                "isCorrect": true
                            },
                            {
                                "text": "OLAP",
                                "isCorrect": false
                            },
                            {
                                "text": "Data lake",
                                "isCorrect": false
                            },
                            {
                                "text": "ETL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma área de BI precisa somar as vendas dos últimos cinco anos por região e produto. Que tipo de carga atende melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "OLAP",
                                "isCorrect": true
                            },
                            {
                                "text": "OLTP",
                                "isCorrect": false
                            },
                            {
                                "text": "Transacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Chave-valor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um banco transacional, uma transferência debita uma conta e credita outra. Se o débito ocorre mas o crédito falha, nada deve valer. Qual propriedade ACID garante isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Atomicidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Isolamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Durabilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Consistência",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um data warehouse organiza os dados com uma tabela de fatos no centro e tabelas de dimensão ao redor, de forma desnormalizada. Como se chama esse desenho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Esquema estrela",
                                "isCorrect": true
                            },
                            {
                                "text": "Normalização completa",
                                "isCorrect": false
                            },
                            {
                                "text": "Índice colunar",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelo relacional normalizado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao montar uma solução analítica, um time quer a ordem geral do fluxo de dados. Qual sequência descreve esse fluxo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ingerir, processar e transformar, armazenar, modelar e servir, visualizar",
                                "isCorrect": true
                            },
                            {
                                "text": "Visualizar, ingerir, processar e transformar, modelar e servir, armazenar",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelar e servir, visualizar, ingerir, armazenar, processar e transformar",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar, modelar e servir, visualizar, ingerir, processar e transformar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Funções e responsabilidades: administrador de banco, engenheiro e analista de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quem cuida do quê\nTrabalhar com dados na nuvem envolve papéis diferentes, cada um com foco próprio. No DP-900 aparecem três funções principais: administrador de banco de dados, engenheiro de dados e analista de dados. Elas se complementam ao longo do caminho do dado.\n\n## Administrador de banco de dados (DBA)\nO DBA projeta, instala, mantém e protege o banco. Cuida da disponibilidade, do desempenho e da segurança, define permissões de acesso e, acima de tudo, garante backup e restauração para não perder dado. Quando o banco fica lento ou cai, é quem responde.\n\n## Engenheiro de dados\nO engenheiro de dados constrói e opera os pipelines que ingerem e transformam dados. Integra fontes diferentes, cuida de data lakes e data warehouses e entrega o dado limpo e pronto para quem vai analisar. É quem faz o processo de ingestão e transformação rodar.\n\n## Analista de dados\nO analista de dados explora, modela e visualiza os dados para gerar insight e apoiar a decisão do negócio. Cria relatórios e dashboards, muitas vezes no Power BI, e traduz números em respostas para as áreas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\",\"Foco\",\"Tarefas típicas\",\"Ferramentas\"],[\"DBA\",\"Manter o banco no ar e seguro\",\"Backup, restauração, desempenho e segurança\",\"SQL Server Management Studio e Azure portal\"],[\"Engenheiro de dados\",\"Mover e preparar o dado\",\"Pipelines de ingestão e transformação, data lakes e warehouses\",\"Azure Data Factory e Azure Synapse Analytics\"],[\"Analista de dados\",\"Gerar insight para decisão\",\"Modelar, visualizar e criar relatórios\",\"Power BI\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como os papéis se conectam\nNo caminho do dado, os três se encaixam em sequência. O engenheiro de dados traz os dados das fontes e os prepara em um repositório central. O DBA garante que os bancos envolvidos fiquem disponíveis, rápidos e seguros. O analista de dados pega esse dado pronto e o transforma em relatórios que respondem perguntas do negócio. Restaurar um backup é tarefa do DBA, montar uma pipeline de ingestão é do engenheiro e criar um dashboard de vendas é do analista."
                    },
                    {
                        "type": "quote",
                        "value": "DBA mantém o banco no ar e protegido. Engenheiro de dados constrói os pipelines e entrega o dado pronto. Analista de dados transforma o dado em insight, quase sempre no Power BI."
                    }
                ],
                "questions": [
                    {
                        "statement": "O banco de produção começou a apresentar lentidão e é preciso revisar índices, ajustar o desempenho e conferir a rotina de backup. Qual profissional é o responsável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Administrador de banco de dados, focado em desempenho",
                                "isCorrect": true
                            },
                            {
                                "text": "Analista de dados, focado em relatórios e dashboards",
                                "isCorrect": false
                            },
                            {
                                "text": "Engenheiro de dados, focado em pipelines de ingestão",
                                "isCorrect": false
                            },
                            {
                                "text": "Cientista de dados, focado em modelos preditivos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer transformar dados já preparados em um painel de vendas interativo no Power BI. Quem faz esse trabalho?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Analista de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Administrador de banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Engenheiro de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Administrador de rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "É preciso montar uma pipeline que ingere dados de vários sistemas, limpa e grava tudo em um data lake para consumo posterior. Qual função assume isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Engenheiro de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Analista de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Administrador de banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerente de projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa perdeu dados após uma falha e precisa restaurar o banco a partir do último backup íntegro. Quem conduz a restauração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Administrador de banco de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Engenheiro de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Analista de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Desenvolvedor de front-end",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual ferramenta é a mais associada ao trabalho do analista de dados no ecossistema Microsoft?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Power BI",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Data Factory",
                                "isCorrect": false
                            },
                            {
                                "text": "SQL Server Management Studio",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Conceitos de dados relacionais",
        "aulas": [
            {
                "titulo": "Conceitos relacionais: tabelas, chaves e relacionamentos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O modelo relacional\nNo modelo relacional os dados ficam guardados em tabelas. Cada tabela representa um tipo de entidade do mundo real, como Cliente, Produto ou Pedido. É a forma mais comum de organizar dados estruturados, aqueles que seguem um formato fixo e bem definido.\n\n## Linhas e colunas\nCada linha da tabela, também chamada de registro ou instância, é uma ocorrência daquela entidade, por exemplo um cliente específico. Cada coluna, ou atributo, guarda uma informação da entidade e tem um tipo de dado definido, como texto, número inteiro ou data. Todos os valores de uma mesma coluna seguem o mesmo tipo."
                    },
                    {
                        "type": "text",
                        "value": "## Chave primária e chave estrangeira\nA chave primária (primary key) identifica cada linha de forma única dentro da tabela. Seu valor não pode se repetir e não pode ser nulo, por isso ela localiza um registro sem ambiguidade.\n\nA chave estrangeira (foreign key) é uma coluna que aponta para a chave primária de outra tabela. É ela que cria o relacionamento entre duas tabelas. Por exemplo, a tabela Pedido guarda o identificador do cliente que fez o pedido, referenciando a chave primária da tabela Cliente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Elemento\",\"O que é\"],[\"Tabela\",\"Conjunto de dados de um tipo de entidade\"],[\"Linha\",\"Um registro, uma ocorrência da entidade\"],[\"Coluna\",\"Um atributo com um tipo de dado\"],[\"Chave primária\",\"Identifica cada linha de forma única, sem repetir nem ser nula\"],[\"Chave estrangeira\",\"Coluna que aponta para a chave primária de outra tabela\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Tipos de relacionamento\nAs ligações entre tabelas podem ser de três tipos.\n\nUm para um: cada linha de A se liga a no máximo uma linha de B. Exemplo: um funcionário e o seu crachá.\n\nUm para muitos: uma linha de A se liga a várias linhas de B, mas cada linha de B se liga a apenas uma de A. É o tipo mais comum. Exemplo: um cliente tem vários pedidos.\n\nMuitos para muitos: várias linhas de A se ligam a várias de B. Normalmente isso se resolve com uma terceira tabela de ligação. Exemplo: alunos e disciplinas.\n\n## Integridade referencial\nA integridade referencial garante que toda chave estrangeira aponte para uma linha que realmente existe na outra tabela. Ela impede cadastrar um pedido para um cliente inexistente ou apagar um cliente que ainda tem pedidos ligados a ele."
                    },
                    {
                        "type": "quote",
                        "value": "A chave primária identifica a linha dentro da própria tabela; a chave estrangeira usa essa chave para ligar uma tabela à outra."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela Cliente precisa de uma coluna que identifique cada cliente sem repetir valores e sem aceitar nulo. Que tipo de coluna é essa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Chave primária",
                                "isCorrect": true
                            },
                            {
                                "text": "Chave estrangeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Índice comum",
                                "isCorrect": false
                            },
                            {
                                "text": "Atributo descritivo qualquer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na tabela Pedido existe a coluna id_cliente, que guarda o identificador do dono do pedido e aponta para a tabela Cliente. Como essa coluna é chamada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Chave estrangeira",
                                "isCorrect": true
                            },
                            {
                                "text": "Chave primária",
                                "isCorrect": false
                            },
                            {
                                "text": "Chave candidata",
                                "isCorrect": false
                            },
                            {
                                "text": "Coluna atômica",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cliente pode ter vários pedidos, mas cada pedido pertence a um único cliente. Que tipo de relacionamento existe entre Cliente e Pedido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um para muitos",
                                "isCorrect": true
                            },
                            {
                                "text": "Um para um",
                                "isCorrect": false
                            },
                            {
                                "text": "Muitos para muitos",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum relacionamento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema precisa relacionar Aluno e Disciplina, sabendo que um aluno cursa várias disciplinas e uma disciplina tem vários alunos. Qual é a forma usual de representar isso no modelo relacional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma terceira tabela de ligação entre Aluno e Disciplina",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar todos os alunos em uma única coluna da tabela Disciplina",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a chave primária das duas tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar apenas uma chave estrangeira na tabela Aluno",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao tentar excluir um cliente que ainda possui pedidos registrados, o banco bloqueia a operação. Que conceito está atuando nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Integridade referencial",
                                "isCorrect": true
                            },
                            {
                                "text": "Normalização até a 3FN",
                                "isCorrect": false
                            },
                            {
                                "text": "Indexação da chave primária",
                                "isCorrect": false
                            },
                            {
                                "text": "Desnormalização controlada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Normalização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é normalização\nNormalizar é organizar as colunas e as tabelas de um banco relacional para reduzir dados duplicados e dependências mal resolvidas. Em vez de repetir a mesma informação em vários lugares, ela fica guardada uma única vez, no lugar certo.\n\n## Por que normalizar\nDados repetidos levam a anomalias, ou seja, problemas na hora de mexer no banco.\n\nAnomalia de inserção: não dá para cadastrar uma informação sem ter outra junto.\n\nAnomalia de atualização: a mesma informação está em vários lugares e alguém atualiza só uma parte, deixando o banco inconsistente.\n\nAnomalia de exclusão: ao apagar uma linha, você perde sem querer outra informação que estava junto.\n\nNormalizar também economiza espaço e ajuda a manter a consistência dos dados."
                    },
                    {
                        "type": "text",
                        "value": "## As três primeiras formas normais\nPrimeira forma normal (1FN): cada coluna guarda um valor atômico, isto é, um único valor indivisível. Nada de listas dentro de uma célula nem grupos de colunas repetidas como Telefone1, Telefone2 e Telefone3.\n\nSegunda forma normal (2FN): a tabela já está na 1FN e nenhuma coluna depende apenas de parte da chave. Isso importa quando a chave primária é composta por mais de uma coluna, pois cada atributo precisa depender da chave inteira.\n\nTerceira forma normal (3FN): a tabela já está na 2FN e não tem dependência transitiva. Ou seja, nenhuma coluna comum depende de outra coluna comum; toda coluna depende apenas da chave primária."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Forma normal\",\"Regra em uma linha\"],[\"1FN\",\"Valores atômicos, sem grupos repetidos\"],[\"2FN\",\"Está na 1FN e sem dependência parcial da chave\"],[\"3FN\",\"Está na 2FN e sem dependência transitiva\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O preço da normalização\nQuanto mais você normaliza, mais tabelas aparecem, cada uma com um pedaço da informação. Para montar um relatório completo, a consulta precisa juntar essas tabelas com joins, o que pode deixar a leitura mais lenta. Por isso, em cenários de análise e relatórios é comum aceitar alguma repetição de propósito, o que se chama desnormalização, para ganhar velocidade na consulta."
                    },
                    {
                        "type": "quote",
                        "value": "Normalizar reduz repetição e anomalias, mas cobra o preço de mais tabelas e mais joins na hora de consultar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela guarda na mesma célula da coluna Telefones o valor 9999-0000, 8888-1111. Qual regra está sendo violada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Primeira forma normal (1FN)",
                                "isCorrect": true
                            },
                            {
                                "text": "Segunda forma normal (2FN)",
                                "isCorrect": false
                            },
                            {
                                "text": "Terceira forma normal (3FN)",
                                "isCorrect": false
                            },
                            {
                                "text": "Integridade referencial",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o principal objetivo da normalização em um banco relacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir dados duplicados e evitar anomalias",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a repetição para acelerar consultas",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminar todas as chaves estrangeiras",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o banco relacional em NoSQL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O endereço de um cliente está repetido em todas as linhas de pedido dele. Ao mudar de endereço, alguém atualiza apenas alguns pedidos e o banco fica com dados conflitantes. Que anomalia é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Anomalia de atualização",
                                "isCorrect": true
                            },
                            {
                                "text": "Anomalia de inserção",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de exclusão",
                                "isCorrect": false
                            },
                            {
                                "text": "Anomalia de índice",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela já está na 2FN, mas a coluna cidade é determinada pela coluna cep, e não diretamente pela chave primária. Qual forma normal resolve essa dependência transitiva?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Terceira forma normal (3FN)",
                                "isCorrect": true
                            },
                            {
                                "text": "Primeira forma normal (1FN)",
                                "isCorrect": false
                            },
                            {
                                "text": "Segunda forma normal (2FN)",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma forma normal trata isso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe de relatórios reclama que as consultas ficaram lentas porque precisam juntar muitas tabelas. Qual é o trade-off esperado de um banco muito normalizado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Menos repetição de dados, porém mais joins nas consultas",
                                "isCorrect": true
                            },
                            {
                                "text": "Mais repetição de dados, porém menos tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "Perda automática da integridade referencial do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Impossibilidade de definir qualquer chave primária",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "SQL: DDL, DML, DQL e objetos de banco",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é SQL\nSQL (Structured Query Language) é a linguagem padrão para trabalhar com bancos relacionais. Com ela você cria a estrutura, insere e altera dados e faz consultas. Os comandos são agrupados em categorias conforme a função que exercem.\n\n## As categorias de comandos\nDDL (Data Definition Language) define e altera a estrutura do banco, como tabelas e colunas.\n\nDML (Data Manipulation Language) mexe nos dados que estão dentro das tabelas.\n\nDQL (Data Query Language) é a categoria da consulta, feita com o SELECT. Em muitos materiais o SELECT aparece dentro da própria DML, mas o DP-900 costuma tratar a consulta à parte.\n\nDCL (Data Control Language) controla quem pode fazer o quê, por meio de permissões."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Categoria\",\"Comandos\",\"Para que serve\"],[\"DDL\",\"CREATE, ALTER, DROP, TRUNCATE\",\"Define e altera a estrutura dos objetos\"],[\"DML\",\"INSERT, UPDATE, DELETE\",\"Insere, altera e remove dados das tabelas\"],[\"DQL\",\"SELECT\",\"Consulta e retorna dados\"],[\"DCL\",\"GRANT, REVOKE\",\"Concede e revoga permissões de acesso\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Objetos de banco\nAlém das tabelas, o banco tem outros objetos que ajudam no dia a dia.\n\nView: uma consulta salva que funciona como uma tabela virtual. Você consulta a view como se fosse uma tabela, mas por trás existe um SELECT guardado. Serve para simplificar consultas e esconder colunas.\n\nStored procedure: um bloco de comandos SQL salvo no banco, que pode receber parâmetros e ser executado quando precisar. Boa para reaproveitar lógica.\n\nFunction (função): parecida com a stored procedure, porém feita para calcular e retornar um valor, podendo ser usada dentro de uma consulta.\n\nIndex (índice): uma estrutura que acelera a busca por certas colunas, como o índice remissivo de um livro. Ajuda a ler mais rápido, mas ocupa espaço e pode deixar a escrita um pouco mais lenta."
                    },
                    {
                        "type": "code",
                        "value": "SELECT nome, email\nFROM Cliente\nWHERE cidade = 'São Paulo'\nORDER BY nome;"
                    },
                    {
                        "type": "text",
                        "value": "## Dialetos do SQL\nO SQL tem uma base padronizada, mas cada banco traz a sua variação.\n\nT-SQL (Transact-SQL): o dialeto do SQL Server e do Azure SQL.\n\nPL/pgSQL: o dialeto usado no PostgreSQL para escrever funções e procedures.\n\nConhecer o dialeto ajuda a usar recursos específicos de cada banco, mas um SELECT básico é praticamente igual em todos eles."
                    },
                    {
                        "type": "quote",
                        "value": "DDL mexe na estrutura, DML mexe nos dados e o SELECT (DQL) apenas lê; a DCL cuida das permissões."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um desenvolvedor vai criar uma nova tabela com o comando CREATE TABLE. A qual categoria de comando SQL ele pertence?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DDL",
                                "isCorrect": true
                            },
                            {
                                "text": "DML",
                                "isCorrect": false
                            },
                            {
                                "text": "DQL",
                                "isCorrect": false
                            },
                            {
                                "text": "DCL",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando SQL é usado para consultar e retornar dados de uma tabela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SELECT",
                                "isCorrect": true
                            },
                            {
                                "text": "INSERT",
                                "isCorrect": false
                            },
                            {
                                "text": "ALTER",
                                "isCorrect": false
                            },
                            {
                                "text": "GRANT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma analista quer salvar uma consulta complexa para que outras pessoas a usem como se fosse uma tabela, sem reescrever o SELECT toda vez. Qual objeto de banco atende melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "View",
                                "isCorrect": true
                            },
                            {
                                "text": "Stored procedure",
                                "isCorrect": false
                            },
                            {
                                "text": "Index",
                                "isCorrect": false
                            },
                            {
                                "text": "Chave estrangeira",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "As buscas por email na tabela Cliente estão lentas porque o banco varre a tabela inteira. Qual objeto pode acelerar a busca por essa coluna?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Index",
                                "isCorrect": true
                            },
                            {
                                "text": "View",
                                "isCorrect": false
                            },
                            {
                                "text": "Chave estrangeira",
                                "isCorrect": false
                            },
                            {
                                "text": "Comando GRANT",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa esvaziar todas as linhas de uma tabela, mantendo a tabela existente. O comando escolhido é classificado como DDL e costuma não poder ser desfeito, diferente do DELETE. Qual é ele?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "TRUNCATE",
                                "isCorrect": true
                            },
                            {
                                "text": "DROP",
                                "isCorrect": false
                            },
                            {
                                "text": "DELETE",
                                "isCorrect": false
                            },
                            {
                                "text": "ALTER",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Serviços de dados relacionais no Azure",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## IaaS ou PaaS para banco de dados\nNo Azure você pode rodar um banco relacional de duas formas principais. Na IaaS você tem uma máquina virtual e instala o banco nela, cuidando de quase tudo. Na PaaS a plataforma cuida da infraestrutura, do sistema operacional e de tarefas como backup e aplicação de patches, e você foca no banco e nos dados. Quanto mais gerenciado é o serviço, menos manutenção sobra para você."
                    },
                    {
                        "type": "text",
                        "value": "## SQL Server em Máquina Virtual do Azure (IaaS)\nAqui você cria uma máquina virtual no Azure e roda o SQL Server dentro dela. Você tem controle total: escolhe a versão exata, configura o sistema operacional e ajusta o que quiser. Em troca, é você quem cuida dos patches do sistema operacional, dos backups e da alta disponibilidade. É uma boa opção quando você precisa de uma versão específica ou de acesso ao sistema operacional."
                    },
                    {
                        "type": "text",
                        "value": "## Azure SQL Managed Instance (PaaS)\nO Managed Instance é um serviço gerenciado quase 100% compatível com o SQL Server local. Ele é a escolha típica para migrar sistemas existentes para a nuvem com pouca mudança, o chamado lift-and-shift, porque suporta recursos que o Azure SQL Database sozinho não oferece.\n\n## Azure SQL Database (PaaS puro)\nÉ um banco totalmente gerenciado, pensado para aplicações novas nascidas na nuvem. Ele oferece opções de implantação.\n\nSingle database: um banco isolado, com recursos próprios.\n\nElastic pool: vários bancos que compartilham um conjunto de recursos, bom quando o uso de cada um varia em horários diferentes.\n\nServerless: o banco escala sozinho e pode pausar quando não há uso, cobrando conforme o consumo."
                    },
                    {
                        "type": "text",
                        "value": "## Motores open source gerenciados\nAlém das opções baseadas em SQL Server, o Azure oferece bancos open source como serviço totalmente gerenciado, ou seja, você não cuida da infraestrutura nem do sistema operacional. Os principais são o Azure Database for PostgreSQL e o Azure Database for MySQL. O Azure Database for MariaDB fazia parte dessa mesma família e ainda aparece em materiais mais antigos do DP-900, mas foi descontinuado pela Microsoft, então o foco atual fica em PostgreSQL e MySQL."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Modelo\",\"Quando usar\"],[\"SQL Server em VM do Azure\",\"IaaS\",\"Controle total e versão específica, aceitando cuidar do SO e do banco\"],[\"Azure SQL Managed Instance\",\"PaaS\",\"Migrar sistemas do SQL Server local com pouca mudança (lift-and-shift)\"],[\"Azure SQL Database\",\"PaaS\",\"Aplicações novas na nuvem, com single database, elastic pool ou serverless\"],[\"Azure Database for PostgreSQL e MySQL\",\"PaaS\",\"Usar motores open source gerenciados sem cuidar da infraestrutura\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Managed Instance é a ponte para migrar o SQL Server local; o Azure SQL Database é feito para apps novos na nuvem; a máquina virtual entrega controle total ao custo de mais manutenção."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer o banco na nuvem sem se preocupar com patches do sistema operacional nem com backups, deixando isso com a plataforma. Que modelo atende melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "PaaS",
                                "isCorrect": true
                            },
                            {
                                "text": "IaaS",
                                "isCorrect": false
                            },
                            {
                                "text": "On-premises",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocation",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual serviço do Azure dá controle total, permitindo instalar uma versão específica do SQL Server e acessar o sistema operacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "SQL Server em Máquina Virtual do Azure",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure SQL Database serverless (PaaS)",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure SQL Managed Instance (PaaS)",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Database for PostgreSQL (PaaS)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe vai migrar para a nuvem um sistema que roda em SQL Server local, usa muitos recursos e deve mudar o mínimo possível. Qual serviço PaaS é o mais indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure SQL Managed Instance",
                                "isCorrect": true
                            },
                            {
                                "text": "SQL Server em Máquina Virtual do Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Database for MySQL",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure SQL Database single database",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup vai criar um app novo na nuvem sobre um banco PostgreSQL gerenciado, sem administrar servidores nem infraestrutura. Qual serviço escolher?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Database for PostgreSQL",
                                "isCorrect": true
                            },
                            {
                                "text": "SQL Server em Máquina Virtual do Azure",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure SQL Managed Instance",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure SQL Database single database",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação tem uso intermitente e fica horas sem nenhuma consulta. A empresa quer que o banco pause sozinho nos períodos ociosos e pague conforme o consumo. Qual opção do Azure SQL Database atende?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Serverless",
                                "isCorrect": true
                            },
                            {
                                "text": "Elastic pool",
                                "isCorrect": false
                            },
                            {
                                "text": "Single database provisionado",
                                "isCorrect": false
                            },
                            {
                                "text": "SQL Server em Máquina Virtual do Azure",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Dados não relacionais no Azure",
        "aulas": [
            {
                "titulo": "Azure Storage: Blob, Files e Table",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A conta de armazenamento\nA conta de armazenamento (storage account) é o guarda-chuva que reúne vários serviços de dados no Azure. Dentro de uma mesma conta você encontra o Blob (objetos), o Files (compartilhamentos de arquivo), o Table (NoSQL chave-valor) e o Queue (filas de mensagens). Você cria a conta uma vez e escolhe qual serviço usar conforme o tipo de dado."
                    },
                    {
                        "type": "text",
                        "value": "## Azure Blob Storage\nO Blob guarda dados não estruturados, como imagens, vídeos, backups e logs. Os blobs ficam organizados em containers, que funcionam como pastas dentro da conta. Cada blob fica em uma camada de acesso que troca custo de guardar por custo de ler: quanto mais barato for armazenar, mais caro e lento fica recuperar o dado. A camada Archive é a mais barata para guardar, mas mantém o dado offline, então antes de ler é preciso reidratar o blob, o que pode levar horas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Melhor para\",\"Custo de guardar\",\"Custo de ler\"],[\"Hot\",\"Dados acessados com frequência\",\"O mais alto\",\"O mais baixo\"],[\"Cool\",\"Acesso raro, retido por pelo menos 30 dias\",\"Menor que Hot\",\"Maior que Hot\"],[\"Cold\",\"Acesso raro, retido por pelo menos 90 dias\",\"Menor que Cool\",\"Maior que Cool\"],[\"Archive\",\"Quase nunca lido, retido por pelo menos 180 dias\",\"O mais baixo\",\"O mais alto e lento\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Files, Table e Queue\nO Azure Files entrega compartilhamentos de arquivo gerenciados, acessados pelos protocolos SMB e NFS. O mesmo compartilhamento pode ser montado ao mesmo tempo em VMs na nuvem e em máquinas locais, funcionando como um drive de rede compartilhado.\n\nO Azure Table Storage é um banco NoSQL de chave-valor, sem schema fixo, barato para guardar grandes volumes de dados semiestruturados. Cada linha é identificada por uma chave de partição e uma chave de linha.\n\nO Azure Queue Storage guarda mensagens em fila e serve para comunicação assíncrona entre componentes de uma aplicação, desacoplando quem produz de quem consome."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Serviço\",\"Tipo de dado\",\"Quando usar\"],[\"Blob\",\"Objetos não estruturados\",\"Imagens, vídeos, backups e logs\"],[\"Files\",\"Compartilhamento de arquivos\",\"Drive de rede montável por SMB ou NFS\"],[\"Table\",\"NoSQL chave-valor\",\"Dados semiestruturados em grande volume e baixo custo\"],[\"Queue\",\"Mensagens em fila\",\"Comunicação assíncrona entre componentes\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Guarde o mapa dos quatro serviços da conta: Blob para dados não estruturados, Files para compartilhamento montável por SMB e NFS, Table para NoSQL chave-valor e Queue para mensagens assíncronas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa precisa armazenar milhões de imagens e vídeos enviados pelos usuários. Qual serviço da conta de armazenamento é o indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Files",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Table Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Queue Storage",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time guarda backups que quase nunca serão lidos e quer o menor custo de armazenamento possível, aceitando esperar horas para recuperar. Qual camada de acesso do Blob usar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cool",
                                "isCorrect": false
                            },
                            {
                                "text": "Archive",
                                "isCorrect": true
                            },
                            {
                                "text": "Hot",
                                "isCorrect": false
                            },
                            {
                                "text": "Cold",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa de um compartilhamento de arquivos que possa ser montado ao mesmo tempo por VMs na nuvem e por máquinas locais, usando SMB ou NFS. Qual serviço atende?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Files",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Table Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Queue Storage",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação precisa gravar um grande volume de registros semiestruturados de forma barata, sem schema fixo e sem relacionamentos entre tabelas. Qual serviço da conta de armazenamento se encaixa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Files",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Table Storage",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Queue Storage",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois componentes de um sistema precisam trocar mensagens de forma assíncrona, sem depender de estarem disponíveis no mesmo instante. Qual serviço da conta de armazenamento resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Table Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Queue Storage",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Files",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Azure Cosmos DB e suas APIs",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Azure Cosmos DB\nO Azure Cosmos DB é um banco de dados NoSQL totalmente gerenciado, oferecido como PaaS. Você não cuida de servidor, patch nem backup de infraestrutura: o Azure administra tudo isso. Ele foi feito para aplicações modernas que lidam com dados semiestruturados, alto volume e usuários espalhados pelo mundo."
                    },
                    {
                        "type": "text",
                        "value": "## Características que definem o serviço\nQuatro pontos resumem o Cosmos DB. Distribuição global: com poucos cliques você replica os dados em várias regiões do mundo, deixando o dado perto do usuário. Latência baixa: respostas na casa de poucos milissegundos. Escala horizontal automática: a capacidade acompanha o tráfego, subindo e descendo conforme a demanda. Alta disponibilidade: um SLA forte, sustentado justamente por essa replicação em várias regiões."
                    },
                    {
                        "type": "text",
                        "value": "## Várias APIs, use a que você já conhece\nO Cosmos DB fala diferentes APIs, então você trabalha com o modelo de dados e as ferramentas que já domina. A API nativa é a API for NoSQL, que guarda documentos JSON. As outras existem principalmente para reaproveitar código, drivers e conhecimento de bancos que a equipe já usa, ou para migrar cargas existentes sem reescrever tudo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"API\",\"Modelo de dados\",\"Quando usar\"],[\"API for NoSQL\",\"Documentos JSON\",\"Aplicação nova; é a API nativa e mais completa\"],[\"API for MongoDB\",\"Documentos\",\"Reaproveitar ou migrar apps e ferramentas MongoDB\"],[\"API for Apache Cassandra\",\"Colunar (wide-column)\",\"Migrar cargas Cassandra ou dados colunares em escala\"],[\"API for Table\",\"Chave-valor\",\"Evoluir do Azure Table Storage com distribuição global\"],[\"API for Apache Gremlin\",\"Grafo (vértices e arestas)\",\"Dados com muitos relacionamentos, como redes e recomendações\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Casos de uso\nO Cosmos DB brilha em cenários de tempo real com dados semiestruturados, alto volume e baixa latência global. Exemplos comuns: telemetria de dispositivos IoT, catálogo e carrinho de e-commerce, perfis e placares de jogos, e personalização de conteúdo. Em geral, qualquer aplicação com usuários espalhados pelo mundo que precise de resposta rápida se beneficia da distribuição global."
                    },
                    {
                        "type": "quote",
                        "value": "O Cosmos DB é NoSQL como PaaS, com distribuição global e latência de poucos milissegundos. A API nativa é a API for NoSQL (documentos JSON); as demais existem para reaproveitar MongoDB, Cassandra, Table e Gremlin."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma aplicação tem usuários na Europa, na Ásia e nas Américas e precisa de resposta rápida em todas as regiões. Qual recurso do Azure Cosmos DB atende diretamente a essa necessidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Distribuição global, replicando os dados em várias regiões",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma única réplica em uma região central para todos os usuários",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenamento local sem qualquer replicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Processamento em lote executado uma vez por dia",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a API nativa do Azure Cosmos DB, recomendada para uma aplicação nova que armazena documentos JSON?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "API for MongoDB",
                                "isCorrect": false
                            },
                            {
                                "text": "API for NoSQL",
                                "isCorrect": true
                            },
                            {
                                "text": "API for Apache Cassandra",
                                "isCorrect": false
                            },
                            {
                                "text": "API for Apache Gremlin",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de rede social precisa modelar pessoas e as conexões entre elas, com muitas relações e consultas de caminhos entre nós. Qual API do Cosmos DB é a mais indicada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "API for NoSQL, voltada a documentos JSON",
                                "isCorrect": false
                            },
                            {
                                "text": "API for Table, voltada a chave-valor",
                                "isCorrect": false
                            },
                            {
                                "text": "API for Apache Gremlin",
                                "isCorrect": true
                            },
                            {
                                "text": "API for MongoDB, voltada a documentos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe já tem uma aplicação escrita para o MongoDB e quer migrar para um serviço gerenciado no Azure reaproveitando os drivers e o código existentes. Qual API do Cosmos DB facilita isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "API for MongoDB",
                                "isCorrect": true
                            },
                            {
                                "text": "API for NoSQL",
                                "isCorrect": false
                            },
                            {
                                "text": "API for Apache Cassandra",
                                "isCorrect": false
                            },
                            {
                                "text": "API for Table",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação usa hoje o Azure Table Storage, mas passou a precisar de distribuição global e latência garantida por SLA, mantendo o modelo chave-valor. Qual é a evolução natural?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Files",
                                "isCorrect": false
                            },
                            {
                                "text": "API for NoSQL do Azure Cosmos DB",
                                "isCorrect": false
                            },
                            {
                                "text": "API for Table do Azure Cosmos DB",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Cargas de trabalho de análise no Azure",
        "aulas": [
            {
                "titulo": "Ingestão, processamento e armazenamentos analíticos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O fluxo de análise em larga escala\nTransformar dados em decisões segue quase sempre o mesmo caminho. Primeiro você ingere os dados das fontes (bancos, arquivos, APIs, eventos). Depois processa e transforma esses dados, limpando e dando formato. Em seguida armazena tudo num repositório analítico. Por fim, modela e serve os dados para consulta e visualiza os resultados em relatórios e dashboards.\n\nCada etapa costuma usar um serviço diferente do Azure, mas a ideia geral é sempre essa: da fonte bruta até o insight que aparece na tela."
                    },
                    {
                        "type": "text",
                        "value": "## Ingestão e processamento: ETL e ELT\nHá duas ordens clássicas para preparar os dados. No ETL (extrair, transformar, carregar) você transforma os dados antes de gravar no destino. Só entra no repositório aquilo que já está limpo e no formato certo. É a abordagem tradicional de data warehouse.\n\nNo ELT (extrair, carregar, transformar) você grava primeiro os dados brutos no destino e transforma depois, dentro dele, aproveitando o poder de processamento e a escala do próprio destino. Combina muito com data lakes e com plataformas modernas de computação elástica.\n\nPara orquestrar esse vaivém existe o Azure Data Factory, o serviço de integração de dados do Azure. Ele coordena pipelines: sequências de atividades que copiam e transformam dados de dezenas de fontes de forma agendada e monitorada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"ETL\",\"ELT\"],[\"Ordem\",\"Transforma antes de carregar\",\"Carrega bruto e transforma depois\"],[\"Onde transforma\",\"Fora do destino, num motor próprio\",\"Dentro do destino, usando a escala dele\"],[\"Combina com\",\"Data warehouse tradicional\",\"Data lake e nuvem elástica\"],[\"Chega ao destino\",\"Só dado já curado\",\"Dado bruto, pronto para explorar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde os dados analíticos ficam\nDepois de ingeridos, os dados precisam morar em algum lugar pensado para análise. Há três modelos principais.\n\nO data warehouse é relacional. Usa schema-on-write: o esquema é definido na hora de gravar, então tudo entra já modelado, curado e organizado em tabelas. Isso deixa as consultas rápidas e previsíveis, ideal para relatórios de negócio.\n\nO data lake guarda arquivos brutos de qualquer formato (CSV, JSON, Parquet, imagens, logs) numa storage barata e muito escalável. Usa schema-on-read: você só aplica a estrutura na hora de ler. É flexível e aceita qualquer dado, mas exige mais trabalho para consultar.\n\nO lakehouse une os dois mundos: guarda arquivos abertos num data lake, mas por cima oferece recursos de data warehouse, como tabelas, esquema e consultas SQL. É o modelo que o Microsoft Fabric e o Azure Databricks adotam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Data warehouse\",\"Data lake\",\"Lakehouse\"],[\"Tipo de dado\",\"Estruturado e curado\",\"Bruto, qualquer formato\",\"Bruto com camada estruturada\"],[\"Esquema\",\"Schema-on-write\",\"Schema-on-read\",\"Schema-on-read com tabelas\"],[\"Custo de armazenamento\",\"Mais alto\",\"Baixo\",\"Baixo\"],[\"Consulta\",\"SQL rápido e modelado\",\"Precisa de preparo\",\"SQL sobre arquivos abertos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "ETL transforma antes de gravar (só dado curado entra); ELT grava o bruto e transforma depois, no destino. Schema-on-write é do data warehouse; schema-on-read é do data lake."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa quer despejar rapidamente arquivos brutos de várias fontes num repositório barato e só depois, usando a escala do próprio destino, aplicar as transformações. Qual abordagem descreve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "ELT: carrega bruto e transforma depois, no destino",
                                "isCorrect": true
                            },
                            {
                                "text": "ETL: transforma os dados antes de carregar no destino",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema-on-write, típico do data warehouse relacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelagem em estrela feita antes de qualquer ingestão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados precisa armazenar arquivos brutos de qualquer formato (CSV, JSON, logs, imagens) num repositório barato e muito escalável, aplicando estrutura só na hora de ler. Que armazenamento analítico atende melhor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Data lake",
                                "isCorrect": true
                            },
                            {
                                "text": "Data warehouse relacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Cache em memória",
                                "isCorrect": false
                            },
                            {
                                "text": "Banco transacional OLTP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Relatórios de negócio precisam rodar consultas rápidas e previsíveis sobre dados já curados, modelados e organizados em tabelas, com o esquema definido na gravação. Que armazenamento é o mais indicado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Data warehouse",
                                "isCorrect": true
                            },
                            {
                                "text": "Data lake com schema-on-read",
                                "isCorrect": false
                            },
                            {
                                "text": "Fila de mensagens",
                                "isCorrect": false
                            },
                            {
                                "text": "Compartilhamento de arquivos genérico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer orquestrar pipelines que copiam e transformam dados de dezenas de fontes de forma agendada e monitorada, sem escrever a infraestrutura na mão. Qual serviço do Azure faz essa orquestração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Data Factory",
                                "isCorrect": true
                            },
                            {
                                "text": "Power BI Desktop",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Stream Analytics",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A arquitetura escolhida guarda os arquivos abertos num data lake, mas oferece por cima tabelas, esquema e consultas SQL, como no Fabric e no Databricks. Como se chama esse modelo que une os dois mundos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lakehouse",
                                "isCorrect": true
                            },
                            {
                                "text": "Data mart isolado",
                                "isCorrect": false
                            },
                            {
                                "text": "Banco NoSQL de documentos",
                                "isCorrect": false
                            },
                            {
                                "text": "OLTP normalizado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Plataformas de análise: Microsoft Fabric e Azure Databricks",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Microsoft Fabric: a plataforma unificada\nO Microsoft Fabric é a plataforma SaaS de análise da Microsoft. A ideia central é reunir num único produto tudo que vai do dado ao insight: ingestão, engenharia, armazenamento, ciência de dados, tempo real e visualização. Como é SaaS, você não gerencia servidores nem clusters; foca no dado e na análise.\n\nNo coração do Fabric está o OneLake, um único data lake para toda a organização. A regra de ouro é: o dado fica guardado uma vez e todos os workloads o usam ali mesmo, sem cópias espalhadas. Pense no OneLake como o OneDrive dos dados da empresa. Ele é construído sobre o Azure Data Lake Storage Gen2 e usa o formato aberto Delta Parquet."
                    },
                    {
                        "type": "text",
                        "value": "## As cargas de trabalho do Fabric\nDentro do Fabric, cada tipo de tarefa tem sua experiência, todas integradas e apontando para o mesmo OneLake:\n\n- Data Factory: ingestão de dados e pipelines.\n- Engenharia de Dados (Synapse Data Engineering): transformação em larga escala com Apache Spark.\n- Data Warehouse: armazém relacional consultado com SQL.\n- Data Science: criação de modelos de machine learning.\n- Real-Time Intelligence: análise de dados em tempo real.\n- Power BI: relatórios e dashboards.\n\nComo tudo compartilha o mesmo lake, um dado ingerido pelo Data Factory pode ser transformado no Spark, servido pelo Data Warehouse e visualizado no Power BI sem ficar copiando arquivo de um lado para o outro."
                    },
                    {
                        "type": "text",
                        "value": "## Azure Databricks\nO Azure Databricks é uma plataforma de análise baseada no Apache Spark, oferecida no Azure em parceria com a Databricks. É muito forte em engenharia de dados, ciência de dados e machine learning em larga escala. Seu ambiente gira em torno de notebooks colaborativos, onde os times escrevem código em Python, SQL, Scala ou R e trabalham juntos no mesmo projeto.\n\nEnquanto o Fabric é SaaS e tenta cobrir toda a jornada de análise de ponta a ponta, o Databricks brilha quando o time quer controle sobre clusters Spark e processamento pesado de dados e de modelos."
                    },
                    {
                        "type": "text",
                        "value": "## Synapse Analytics e o armazenamento\nAntes do Fabric, o serviço de data warehouse e análise corporativa do Azure era o Azure Synapse Analytics, que juntava pools SQL, Spark e pipelines num só lugar. Seus recursos hoje convergem para o Microsoft Fabric, que é o serviço guarda-chuva atual de análise da Microsoft.\n\nEm todas essas plataformas, a camada de armazenamento costuma ser o Azure Data Lake Storage Gen2 (ADLS Gen2). Ele é otimizado para análise porque adiciona um namespace hierárquico (pastas de verdade) sobre o armazenamento de blobs, o que acelera as operações de big data."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Microsoft Fabric\",\"Azure Databricks\"],[\"O que é\",\"Plataforma SaaS unificada, do dado ao insight\",\"Plataforma de análise baseada em Apache Spark\"],[\"Base\",\"OneLake e workloads integrados\",\"Apache Spark e notebooks colaborativos\"],[\"Perfil\",\"Cobre toda a jornada com pouca gestão\",\"Engenharia, ciência de dados e ML pesados\"],[\"Quando usar\",\"Solução completa e integrada de análise\",\"Controle sobre Spark e cargas de ML em escala\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Microsoft Fabric é o serviço guarda-chuva atual de análise: SaaS, com o OneLake guardando o dado uma única vez para todos os workloads. Os recursos do Azure Synapse Analytics convergem para o Fabric."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma organização quer uma plataforma de análise SaaS que reúna num só produto ingestão, engenharia, data warehouse, ciência de dados, tempo real e visualização, sem gerenciar servidores. Qual serviço atende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Microsoft Fabric",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure SQL Database",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Data Factory sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No Microsoft Fabric, uma empresa quer que o dado seja guardado uma única vez e usado por todos os workloads, sem cópias espalhadas. Que componente cumpre esse papel de data lake único da organização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "OneLake",
                                "isCorrect": true
                            },
                            {
                                "text": "Power BI Mobile",
                                "isCorrect": false
                            },
                            {
                                "text": "Um pool SQL dedicado",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma conta de armazenamento por equipe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de ciência de dados quer processar grandes volumes com Apache Spark em notebooks colaborativos, com forte controle sobre os clusters, para engenharia de dados e machine learning em escala. Qual plataforma é a mais alinhada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Databricks",
                                "isCorrect": true
                            },
                            {
                                "text": "Power BI Service",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Data Lake Storage Gen2",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Stream Analytics",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe usava o Azure Synapse Analytics como serviço de data warehouse e análise corporativa. Para onde os recursos desse tipo de análise estão convergindo como serviço guarda-chuva atual da Microsoft?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Microsoft Fabric",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Cosmos DB",
                                "isCorrect": false
                            },
                            {
                                "text": "Power BI Desktop",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Event Hubs",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Nas plataformas analíticas do Azure, qual serviço costuma ser a camada de armazenamento, com namespace hierárquico otimizado para big data sobre o armazenamento de blobs?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Azure Data Lake Storage Gen2",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure SQL Database, banco relacional gerenciado",
                                "isCorrect": false
                            },
                            {
                                "text": "Power BI Service, ferramenta de visualização",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Table Storage, NoSQL chave-valor",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Análise em tempo real: lote (batch) e fluxo (streaming)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dois jeitos de processar dados\nNem todo dado precisa ser analisado na mesma velocidade. Existem dois grandes modos de processamento.\n\nNo processamento em lote (batch) você junta um grande volume de dados e processa de tempos em tempos, em blocos. A latência é maior, porque você espera acumular para rodar. É perfeito para relatórios e fechamentos, como processar todas as vendas do dia durante a madrugada.\n\nNo processamento em fluxo (streaming) cada evento é processado de forma contínua, um a um, assim que chega. A latência é baixíssima, quase em tempo real. É o modo certo para dados que chegam sem parar: sensores de IoT, cliques em um site, transações de cartão e detecção de fraude."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Lote (batch)\",\"Fluxo (streaming)\"],[\"Latência\",\"Maior, roda de tempos em tempos\",\"Baixa, quase em tempo real\"],[\"Volume por vez\",\"Grande bloco acumulado\",\"Evento a evento, contínuo\"],[\"Exemplo\",\"Fechamento das vendas do dia à noite\",\"Sensores de IoT e detecção de fraude\"],[\"Quando usar\",\"Relatórios e cargas periódicas\",\"Reação imediata a eventos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Janelas de tempo no streaming\nNum fluxo os eventos nunca param de chegar, então não dá para simplesmente somar tudo. Para calcular agregações (como quantos cliques por minuto) o streaming usa janelas de tempo: recortes que agrupam os eventos de um intervalo definido.\n\nUm exemplo comum é a janela em cascata (tumbling), fatias fixas e sem sobreposição, por exemplo a cada 30 segundos. A cada janela que fecha, o sistema calcula o resultado daquele intervalo e segue para a próxima. É assim que se obtêm médias, contagens e totais contínuos sobre um fluxo que não tem fim."
                    },
                    {
                        "type": "text",
                        "value": "## Serviços da Microsoft para tempo real\nO Azure oferece várias peças para trabalhar com dados em movimento:\n\n- Azure Event Hubs: porta de entrada que ingere milhões de eventos por segundo vindos das fontes.\n- Azure Stream Analytics: motor que processa o fluxo com uma linguagem parecida com SQL e joga o resultado num destino.\n- Real-Time Intelligence do Microsoft Fabric: a experiência de tempo real do Fabric, com o Eventstream para capturar e rotear eventos sem código.\n- Spark Structured Streaming: processamento de fluxo em escala sobre o Apache Spark.\n\nUm desenho típico é os eventos entrarem pelo Event Hubs e serem processados pelo Stream Analytics ou pelo Eventstream do Fabric."
                    },
                    {
                        "type": "quote",
                        "value": "Batch acumula um grande volume e processa de tempos em tempos (latência maior, bom para fechamentos); streaming processa evento a evento em tempo quase real (baixa latência, bom para IoT e fraude). O Event Hubs ingere os eventos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma varejista processa todas as vendas do dia durante a madrugada, em um único bloco, para gerar o relatório da manhã seguinte. Que tipo de processamento é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Processamento em lote (batch)",
                                "isCorrect": true
                            },
                            {
                                "text": "Processamento em fluxo (streaming)",
                                "isCorrect": false
                            },
                            {
                                "text": "Processamento evento a evento em tempo real",
                                "isCorrect": false
                            },
                            {
                                "text": "Consulta transacional OLTP",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fintech precisa analisar cada transação de cartão assim que ela acontece para detectar fraude na hora, com latência mínima. Que tipo de processamento atende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Processamento em fluxo (streaming)",
                                "isCorrect": true
                            },
                            {
                                "text": "Processamento em lote (batch) noturno",
                                "isCorrect": false
                            },
                            {
                                "text": "Carga periódica semanal",
                                "isCorrect": false
                            },
                            {
                                "text": "Exportação diária para planilha",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma solução de IoT recebe milhões de eventos por segundo de sensores e precisa de um serviço do Azure para ingerir esse fluxo de entrada. Qual serviço é o indicado como porta de entrada dos eventos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Event Hubs",
                                "isCorrect": true
                            },
                            {
                                "text": "Power BI Desktop",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure SQL Database",
                                "isCorrect": false
                            },
                            {
                                "text": "Azure Blob Storage",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao analisar um fluxo contínuo, um time quer contar quantos cliques ocorrem a cada 30 segundos, em fatias fixas e sem sobreposição. Que conceito de streaming ele está usando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Janela de tempo (tumbling)",
                                "isCorrect": true
                            },
                            {
                                "text": "Schema-on-write, do data warehouse relacional",
                                "isCorrect": false
                            },
                            {
                                "text": "Processamento em lote, sem janelas de tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Índice columnstore para consultas analíticas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer processar um fluxo de eventos usando uma linguagem parecida com SQL e enviar o resultado a um destino, sem montar clusters. Qual serviço do Azure é feito para esse processamento de streaming?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Azure Stream Analytics",
                                "isCorrect": true
                            },
                            {
                                "text": "Azure Data Factory",
                                "isCorrect": false
                            },
                            {
                                "text": "Pool SQL dedicado do Synapse",
                                "isCorrect": false
                            },
                            {
                                "text": "Power BI Mobile",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Visualização de dados com o Power BI",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que é o Power BI\nO Power BI é a ferramenta de análise de negócio e visualização de dados da Microsoft. Com ele você conecta os dados, modela e transforma esses dados em relatórios e dashboards interativos que ajudam a decidir.\n\nO Power BI tem três componentes principais que trabalham juntos:\n\n- Power BI Desktop: aplicativo para Windows, gratuito, onde você conecta às fontes, modela os dados e cria os relatórios. É o lugar de construção.\n- Serviço do Power BI: a parte na nuvem (SaaS), onde você publica os relatórios, monta dashboards, compartilha e colabora com o time.\n- Power BI Mobile: aplicativos para celular e tablet, para consumir relatórios e dashboards de qualquer lugar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Componente\",\"Onde roda\",\"Para que serve\"],[\"Power BI Desktop\",\"Aplicativo Windows\",\"Conectar, modelar e criar relatórios\"],[\"Serviço do Power BI\",\"Nuvem (SaaS)\",\"Publicar, compartilhar e montar dashboards\"],[\"Power BI Mobile\",\"Celular e tablet\",\"Consumir relatórios em qualquer lugar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo de trabalho e o modelo de dados\nO caminho típico no Power BI tem quatro passos: conectar às fontes, modelar os dados, construir os relatórios e, por fim, publicar e compartilhar no Serviço.\n\nModelar é a parte que dá poder de verdade. Você relaciona as tabelas entre si (por exemplo, ligar a tabela de vendas à de produtos) e cria medidas, que são cálculos sob demanda escritos em DAX, a linguagem de fórmulas do Power BI. Uma medida como Total de Vendas ou Margem % é recalculada conforme o usuário filtra e navega no relatório. Um bom modelo, com tabelas bem relacionadas e medidas claras, é o que faz o relatório responder rápido e certo."
                    },
                    {
                        "type": "text",
                        "value": "## Escolher a visualização certa\nCada pergunta pede um tipo de gráfico. Errar o visual atrapalha a leitura, então vale conhecer o uso clássico de cada um:\n\n- Barras ou colunas: comparar valores entre categorias.\n- Linha: mostrar tendência ao longo do tempo.\n- Pizza ou rosca: parte de um todo, sempre com moderação e poucas fatias.\n- Dispersão: correlação entre duas medidas numéricas.\n- Mapa: dados geográficos, por região ou país.\n- Cartão ou KPI: destacar um único número importante.\n- Tabela ou matriz: mostrar o detalhe, linha a linha."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Visualização\",\"Quando usar\"],[\"Barras ou colunas\",\"Comparar categorias\"],[\"Linha\",\"Tendência ao longo do tempo\"],[\"Pizza ou rosca\",\"Parte de um todo, com poucas fatias\"],[\"Dispersão\",\"Correlação entre duas medidas\"],[\"Mapa\",\"Dados geográficos\"],[\"Cartão ou KPI\",\"Um único número em destaque\"],[\"Tabela ou matriz\",\"Detalhe linha a linha\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Constrói no Power BI Desktop (Windows), publica e compartilha no Serviço do Power BI (nuvem), consome no Mobile. Linha para tendência no tempo, barras para comparar categorias, mapa para dado geográfico."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista precisa conectar às fontes, modelar os dados e construir os relatórios em um aplicativo de Windows, antes de publicar. Qual componente do Power BI ele usa para essa construção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Power BI Desktop",
                                "isCorrect": true
                            },
                            {
                                "text": "Serviço do Power BI",
                                "isCorrect": false
                            },
                            {
                                "text": "Power BI Mobile",
                                "isCorrect": false
                            },
                            {
                                "text": "Excel Online",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório precisa mostrar como a receita mensal evoluiu ao longo dos últimos dois anos, destacando a tendência. Qual visualização é a mais adequada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gráfico de linha",
                                "isCorrect": true
                            },
                            {
                                "text": "Gráfico de pizza",
                                "isCorrect": false
                            },
                            {
                                "text": "Cartão (KPI) único",
                                "isCorrect": false
                            },
                            {
                                "text": "Mapa geográfico",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O gestor quer comparar o total de vendas entre as diferentes categorias de produto, lado a lado. Qual visualização comunica melhor essa comparação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gráfico de barras ou colunas",
                                "isCorrect": true
                            },
                            {
                                "text": "Gráfico de linha, para tendência no tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Gráfico de dispersão, para correlação",
                                "isCorrect": false
                            },
                            {
                                "text": "Cartão (KPI), para um número único",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No modelo de dados do Power BI, um analista precisa criar um cálculo de Margem % que seja recalculado conforme o usuário filtra o relatório. Que recurso, escrito em DAX, ele deve usar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma medida",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma relação entre tabelas",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dashboard no Serviço",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma visualização de mapa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A diretoria quer publicar os relatórios na nuvem, montar dashboards e compartilhar com o time para colaborar. Qual componente do Power BI é o indicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Serviço do Power BI",
                                "isCorrect": true
                            },
                            {
                                "text": "Power BI Desktop",
                                "isCorrect": false
                            },
                            {
                                "text": "Power BI Mobile",
                                "isCorrect": false
                            },
                            {
                                "text": "Editor do Power Query",
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
