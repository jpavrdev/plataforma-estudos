// Seed da trilha Data Lake e Lakehouse (roadmap de Engenharia de Dados).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-lakehouse.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Data Lake e Lakehouse";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Trilha de data lake e lakehouse do roadmap de Engenharia de Dados: guardar e organizar dados em escala sobre object storage e evoluir do data lake cru ao lakehouse. Do data warehouse ao data lake, as zonas e o particionamento, os limites do lake cru (sem ACID, sem upsert, sem time travel), os table formats abertos (Delta Lake, Apache Iceberg, Hudi), a arquitetura medalhao (bronze, silver, gold), operar tabelas (MERGE, time travel, OPTIMIZE, vacuum) e o lakehouse na pratica. Assume base de Spark e ETL, com foco em decisoes e cenarios.";

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
        "titulo": "Módulo 1 - Do data warehouse ao data lake",
        "aulas": [
            {
                "titulo": "O limite do data warehouse tradicional",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O limite do data warehouse tradicional\n\nUm data warehouse relacional, seja on-premise ou um dos primeiros warehouses em nuvem, foi desenhado para uma pergunta específica: consultas SQL rápidas sobre dados estruturados e já modelados. Essa especialização traz três limites que aparecem assim que o volume, a variedade ou a velocidade dos dados crescem."
                    },
                    {
                        "type": "text",
                        "value": "## Storage e compute no mesmo lugar\n\nNos warehouses clássicos, os nós que guardam os dados são os mesmos que processam as consultas. Isso significa que:\n\n- **Escalar armazenamento custa compute**: guardar mais histórico também escala, e cobra, poder de processamento que talvez você não precise.\n- **Escalar compute custa armazenamento**: rodar mais consultas simultâneas também exige mais discos, mesmo que o volume de dados não tenha crescido.\n- **Picos forçam capacidade ociosa**: fim de mês, Black Friday e outros picos obrigam a manter capacidade parada o resto do tempo, porque não dá para desligar só o compute."
                    },
                    {
                        "type": "code",
                        "value": "Arquitetura acoplada de um warehouse tradicional\n\n  +--------------------------------------------------+\n  |               Cluster do warehouse               |\n  |                                                  |\n  |          Compute  <---------->  Storage          |\n  |       (processamento)      (mesmos discos)       |\n  |                                                  |\n  |    Quer mais espaco? Paga mais processamento.    |\n  |    Quer mais processamento? Paga mais espaco.    |\n  +--------------------------------------------------+"
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que muda\", \"Estruturado\", \"Semiestruturado\", \"Não estruturado\"], [\"Exemplo\", \"Tabela de pedidos, cadastro de clientes\", \"JSON de eventos, payloads de API, XML\", \"Imagens, áudio, vídeo, PDFs, texto livre\"], [\"Exige antes de carregar\", \"Modelagem em tabelas e colunas\", \"Achatar (flatten) e tipar campos aninhados\", \"Não existe uma coluna natural para isso\"], [\"Warehouse tradicional\", \"Nativo, é o caso de uso principal\", \"Contorna com bastante ETL\", \"Praticamente não guarda\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Schema-on-write: modelar antes de perguntar\n\nTodo dado que entra em um warehouse passa por uma modelagem prévia: definir tabelas, tipos de coluna e chaves antes da primeira carga. Isso é ótimo para consistência, mas cobra um preço:\n\n- Uma fonte de dados nova só fica disponível depois que alguém desenha o esquema e escreve o ETL.\n- Uma mudança no formato de origem, como um campo novo em um JSON de evento, pode quebrar a carga ou exigir uma migração de schema.\n- Dados que ninguém sabe se vão ser úteis (logs brutos, cliques, telemetria) tendem a ficar de fora, porque não compensa modelar algo que talvez nunca seja consultado."
                    },
                    {
                        "type": "quote",
                        "value": "O warehouse tradicional não é ruim, ele é especializado: ótimo para SQL sobre dados já limpos e modelados, caro e rígido para tudo que é volumoso, variado ou ainda sem forma definida."
                    },
                    {
                        "type": "text",
                        "value": "## O que isso empurra a arquitetura a fazer\n\nEsses três limites, custo por escala, exigência de estrutura e acoplamento entre guardar e processar, empurraram equipes de dados a procurar um lugar mais barato e mais flexível para guardar tudo primeiro, e decidir depois o que fazer com cada dado. É exatamente o problema que o data lake resolve, tema da próxima aula."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe de dados nota que, para aumentar o espaço de armazenamento do warehouse, a fatura de processamento sobe junto, mesmo sem nenhuma consulta nova rodando. Qual característica da arquitetura tradicional explica isso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O uso de índices em excesso, que consome processamento toda vez que uma tabela nova é criada, encarecendo o armazenamento indiretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O acoplamento entre storage e compute, em que os mesmos nós guardam e processam os dados, então escalar um escala o outro junto.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ausência de compressão nas tabelas, que faz o warehouse gastar mais disco e, por tabela maior, mais ciclos de CPU em cada consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cobrança por número de usuários conectados, que soma custo de processamento a cada novo analista com acesso ao cluster.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fintech recebe diariamente arquivos de log de autenticação em JSON, com campos aninhados que mudam de formato a cada nova versão do app. O time tenta carregar tudo direto no warehouse relacional e trava em retrabalho de schema. Qual é a raiz do problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O warehouse não suporta arquivos maiores que alguns megabytes, então os logs precisam ser divididos antes de qualquer carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O JSON é um formato binário, incompatível com o motor de armazenamento colunar usado internamente pelo warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse exige que os dados venham ordenados por data antes da carga, o que os logs de autenticação não garantem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse exige schema-on-write, então cada mudança na estrutura do JSON obriga a remodelar tabelas antes de carregar.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time de ML quer treinar um modelo com imagens de produtos e as descrições estruturadas já existentes no warehouse. Ao avaliar guardar as imagens no mesmo warehouse, qual limite estrutural aparece primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O warehouse relacional é otimizado para linhas e colunas, sem um lugar natural para guardar arquivos binários como imagens.",
                                "isCorrect": true
                            },
                            {
                                "text": "O warehouse aceita imagens normalmente, mas cobra uma taxa extra por consulta que envolva colunas do tipo binário.",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse converte toda imagem em texto automaticamente, o que corrompe boa parte dos arquivos maiores durante a carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse limita o número de colunas por tabela, então as imagens precisam ficar numa tabela separada e sem relação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma varejista decide não trazer os cliques do site para o warehouse porque ninguém sabe ainda se esse dado será útil, e modelar o schema para ele custaria semanas de trabalho. Que limite do warehouse tradicional essa decisão evidencia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O custo de licenciamento por tabela criada, que torna inviável testar hipóteses com dados que podem não ser usados depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite de retenção padrão de noventa dias, que apaga automaticamente dados exploratórios antes de virarem úteis.",
                                "isCorrect": false
                            },
                            {
                                "text": "A exigência de modelar o esquema antes de carregar, o que penaliza guardar dados exploratórios de utilidade ainda incerta.",
                                "isCorrect": true
                            },
                            {
                                "text": "A necessidade de aprovação de um comitê de dados para qualquer tabela nova, o que atrasa a ingestão de dados exploratórios.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em relação ao processo de carga de dados em um data warehouse relacional clássico, como o esquema se relaciona com a chegada dos dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O esquema é definido antes da carga, e os dados precisam se adequar a ele para entrar nas tabelas (schema-on-write).",
                                "isCorrect": true
                            },
                            {
                                "text": "O esquema é inferido automaticamente a cada consulta, então qualquer formato de dado pode ser lido sem preparo prévio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema muda sozinho conforme o volume de dados cresce, sem exigir intervenção da equipe de engenharia de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema só é necessário para tabelas de fatos, enquanto as dimensões podem ser carregadas em qualquer formato livre.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é um data lake",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é um data lake\n\nUm data lake é um repositório central onde dados de qualquer formato (estruturado, semiestruturado ou não estruturado) são guardados como arquivos, sem exigir um esquema relacional definido antes da ingestão. A ideia central é inverter a ordem do warehouse: primeiro guarda-se o dado bruto, depois se decide como organizá-lo e consultá-lo."
                    },
                    {
                        "type": "text",
                        "value": "## Qualquer formato, no mesmo repositório\n\nEm vez de tabelas relacionais, o data lake guarda arquivos: `CSV`, `JSON`, `Parquet`, `Avro`, imagens, áudio, vídeo, logs de texto. Todos convivem na mesma camada de armazenamento, organizados em pastas, sem que o formato de um arquivo interfira no de outro. Isso elimina a barreira de entrada que o warehouse impõe a dados semiestruturados e não estruturados."
                    },
                    {
                        "type": "code",
                        "value": "Exemplo de um data lake recebendo dados brutos de fontes variadas\n\n  s3://empresa-lake/raw/\n    vendas/\n      pedidos_2026-07-15.csv\n    eventos_app/\n      cliques_2026-07-15.json\n    cdc_clientes/\n      clientes_snapshot.parquet\n    imagens_produto/\n      produto_8231.jpg\n\n  # Nenhum esquema relacional e exigido para gravar esses arquivos.\n  # Cada fonte grava no seu proprio formato, na sua propria pasta."
                    },
                    {
                        "type": "text",
                        "value": "## Schema-on-read: interpretar no momento da leitura\n\nNo lake, o esquema não é imposto na escrita, ele é aplicado quando um motor de consulta (Spark, Trino, Presto) lê o arquivo. O mesmo arquivo JSON bruto pode ser lido de formas diferentes por dois times diferentes, cada um projetando as colunas que interessam para o seu caso de uso, sem exigir uma nova carga nem alterar o dado original."
                    },
                    {
                        "type": "quote",
                        "value": "Guardar primeiro, dar sentido depois: o data lake troca a rigidez do esquema antecipado pela flexibilidade de decidir, na hora da leitura, o que cada dado significa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Momento do esquema\", \"Schema-on-write (warehouse)\", \"Schema-on-read (data lake)\"], [\"Quando é definido\", \"Antes da carga dos dados\", \"No momento da leitura ou consulta\"], [\"Quem aplica\", \"O processo de ETL, antes de gravar\", \"O motor de consulta, ao ler o arquivo\"], [\"Vantagem\", \"Consistência garantida na tabela\", \"Ingestão rápida, aceita qualquer formato\"], [\"Risco\", \"Fonte nova exige modelagem antes de usar\", \"Sem controle, os dados podem ficar difíceis de interpretar depois\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um padrão de arquitetura, não um produto\n\nData lake não é o nome de uma ferramenta específica: é um padrão que combina armazenamento barato de arquivos e um jeito de organizar pastas, com um catálogo que, mais adiante, descreve o que existe ali dentro. A peça que sustenta esse padrão na prática é o **object storage**, tema da próxima aula."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal inversão que o data lake propõe em relação ao momento em que o esquema dos dados é definido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O esquema deixa de existir por completo, e nenhuma ferramenta consegue interpretar a estrutura dos arquivos gravados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema passa a ser definido por um comitê de governança antes da ingestão, substituindo o time de engenharia.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema deixa de ser exigido na escrita e passa a ser aplicado pelo motor de consulta no momento da leitura.",
                                "isCorrect": true
                            },
                            {
                                "text": "O esquema passa a ser gerado automaticamente por machine learning assim que o arquivo chega ao armazenamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados recebe arquivos de três fontes diferentes (CSV de vendas, JSON de eventos de app e imagens de produto) e precisa guardá-los para decidir depois como cada um será usado. Qual característica do data lake atende diretamente essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aceitar qualquer formato de arquivo na mesma camada de armazenamento, sem exigir modelagem antes de gravar os dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Converter automaticamente todo arquivo recebido para o formato Parquet, unificando o schema antes da primeira gravação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exigir que cada fonte publique um contrato de schema em JSON antes de liberar a gravação dos arquivos brutos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar validação de qualidade em tempo real, rejeitando arquivos que não sigam um padrão de nomenclatura definido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois times leem o mesmo arquivo JSON bruto de eventos de clique, guardado sem transformação no data lake. O time de marketing projeta os campos de campanha, e o time de produto projeta os campos de tela e botão, cada um com sua própria consulta. Isso só é possível porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O arquivo é duplicado automaticamente pelo motor de armazenamento, gerando uma cópia com schema fixo para cada time.",
                                "isCorrect": false
                            },
                            {
                                "text": "O data lake mantém um esquema relacional interno que já separa os campos de marketing dos campos de produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada time precisa primeiro rodar um ETL que reescreve o arquivo original antes de poder consultar os campos que interessam.",
                                "isCorrect": false
                            },
                            {
                                "text": "O esquema é aplicado na leitura, então cada motor de consulta pode projetar campos diferentes do mesmo arquivo original.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide gravar dados de sensores IoT direto no data lake, sem qualquer transformação, e só planeja organizar esses dados quando um caso de uso concreto aparecer. Do ponto de vista da promessa central do data lake, essa prática é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um erro, porque o data lake exige que todo dado seja validado contra um schema antes de qualquer gravação, como no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coerente com a proposta do lake, que é guardar o dado bruto primeiro e decidir a estrutura de uso quando ele for consultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aceitável apenas para dados estruturados, já que dados de sensores IoT não podem ser lidos sem schema definido na escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Arriscado, porque arquivos gravados sem transformação prévia não podem ser lidos por nenhum motor de consulta depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das afirmações descreve corretamente o que é um data lake, dentro do padrão de arquitetura discutido nesta aula?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um produto específico vendido por um único fornecedor de nuvem, que substitui a necessidade de qualquer banco relacional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma extensão do warehouse que roda exclusivamente sobre bancos de dados relacionais configurados em modo de leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um repositório central de arquivos em qualquer formato, guardados sem exigir um esquema relacional definido antes da carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um serviço de backup incremental que arquiva cópias de tabelas do warehouse para recuperação em caso de falha.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Object storage: o alicerce",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Object storage: o alicerce\n\nSe o data lake é um padrão de arquitetura, o object storage é a peça de infraestrutura que o sustenta na prática. Serviços como Amazon S3, Google Cloud Storage (GCS) e Azure Data Lake Storage (ADLS) são, em conceito, a camada de armazenamento sobre a qual praticamente todo data lake moderno é construído."
                    },
                    {
                        "type": "text",
                        "value": "## O que é, em conceito\n\nObject storage guarda dados como objetos (arquivos binários) dentro de buckets (ou containers, no Azure), cada objeto identificado por uma chave única. Não existe uma hierarquia real de pastas como em um sistema de arquivos tradicional: o que parece uma estrutura de diretórios é, na prática, um namespace plano em que a chave inclui as barras `/` como parte do nome. O acesso acontece por API HTTP (`GET`, `PUT`, `DELETE`), não por um protocolo de sistema de arquivos."
                    },
                    {
                        "type": "code",
                        "value": "Estrutura conceitual de um object storage\n\n  bucket: empresa-lake\n    chave: raw/vendas/pedidos_2026-07-15.csv\n    chave: raw/eventos_app/cliques_2026-07-15.json\n    chave: curated/vendas/ano=2026/mes=07/parte-001.parquet\n\n  # A \"pasta\" raw/vendas/ nao existe de fato: e um prefixo comum\n  # entre chaves. O storage entende prefixo, nao diretorio.\n\n  # URI tipica para acessar um objeto:\n  s3://empresa-lake/curated/vendas/ano=2026/mes=07/parte-001.parquet"
                    },
                    {
                        "type": "text",
                        "value": "## Barato e durável por desenho\n\nObject storage é significativamente mais barato por gigabyte do que o disco usado em um warehouse ou em um banco transacional, porque roda sobre hardware comum, em grande escala, sem processamento acoplado. A durabilidade costuma ser expressa em várias casas decimais de nove (o provedor replica cada objeto em múltiplos discos e, em geral, múltiplas zonas de disponibilidade), o que o torna adequado para guardar dados brutos que não podem ser perdidos, mesmo antes de qualquer camada de governança existir."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\", \"Amazon S3\", \"Google Cloud Storage\", \"Azure Data Lake Storage\"], [\"Unidade de agrupamento\", \"Bucket\", \"Bucket\", \"Container\"], [\"Unidade de dado\", \"Object (chave e valor)\", \"Object\", \"Blob\"], [\"Namespace\", \"Plano, com prefixos\", \"Plano, com prefixos\", \"Hierárquico (ADLS Gen2)\"], [\"Acesso\", \"API HTTP (REST)\", \"API HTTP (REST)\", \"API HTTP (REST)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Object storage não processa dado, só guarda e devolve quando pedido: é exatamente essa simplicidade que o torna barato, durável e a base sobre a qual todo o resto do lakehouse é construído."
                    },
                    {
                        "type": "text",
                        "value": "## Desacoplando storage de compute\n\nComo o object storage só guarda bytes e responde a chamadas HTTP, qualquer motor de processamento pode ler os mesmos dados de forma independente: um cluster Spark, um mecanismo de consulta como Trino ou Presto, ou um serviço serverless de consulta. Cada engine escala, e é cobrada, separadamente do armazenamento, o que resolve diretamente o acoplamento que travava o warehouse tradicional, visto na primeira aula deste módulo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em termos conceituais, como o object storage (S3, GCS, ADLS) organiza os dados internamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Como um sistema de arquivos hierárquico real, com diretórios físicos que precisam ser criados antes de qualquer gravação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um banco relacional simplificado, em que cada bucket corresponde a uma tabela com colunas fixas predefinidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como blocos de disco alocados diretamente ao usuário, exigindo formatação manual antes do primeiro objeto ser gravado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como objetos identificados por uma chave única dentro de um bucket, em um namespace plano acessado por API HTTP.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma engenheira nota que a pasta raw/vendas/ que aparece no console do S3 não pode ser criada vazia da forma como se cria uma pasta em um sistema operacional. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o S3 exige que toda pasta tenha ao menos um arquivo de configuração antes de aparecer listada no console.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque não existem pastas reais no object storage, apenas chaves com prefixo comum exibidas pelo console como diretórios.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque pastas vazias são automaticamente removidas por uma rotina de limpeza que roda a cada objeto gravado no bucket.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o console do S3 só exibe pastas que já contenham arquivos Parquet, ignorando outros formatos de arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma arquiteta de dados justifica a escolha de object storage como base do data lake citando custo por gigabyte. Qual fator explica por que esse custo tende a ser bem menor do que o disco de um warehouse tradicional?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O object storage roda sobre hardware padronizado e em larga escala, sem processamento de consulta acoplado ao mesmo cluster.",
                                "isCorrect": true
                            },
                            {
                                "text": "O object storage não replica os dados em múltiplos discos, economizando o custo extra de redundância usado pelo warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage comprime todo arquivo automaticamente para um formato binário proprietário antes de gravar no bucket.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage cobra apenas uma taxa fixa mensal, independente da quantidade de dados efetivamente armazenada no bucket.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide processar os mesmos dados brutos do lake com Spark para um job de transformação e, ao mesmo tempo, com Trino para uma consulta ad hoc de um analista, sem que um interfira no outro. Isso só é viável porque:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Spark e o Trino compartilham o mesmo cluster de processamento por trás do object storage, coordenando o acesso automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage cria uma cópia temporária dos dados para cada engine, isolando Spark e Trino em ambientes separados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage está desacoplado do compute, então qualquer engine pode ler os mesmos dados de forma independente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O object storage prioriza automaticamente o motor com menor carga no momento, enfileirando a leitura do outro motor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções resume corretamente a relação entre object storage e as engines de processamento (Spark, Trino, Presto) em uma arquitetura de data lake?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O object storage inclui um motor de consulta embutido, dispensando a necessidade de Spark ou Trino para ler os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "As engines de processamento precisam copiar todo o bucket para um disco local antes de conseguir ler qualquer objeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage só permite leitura por uma engine por vez, bloqueando o acesso concorrente de múltiplos motores.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage guarda os dados de forma independente do compute, e diferentes engines podem lê-los sem coordenar acesso.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Data lake x data warehouse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Data lake x data warehouse\n\nDepois de ver os limites do warehouse tradicional, o que é um data lake e o papel do object storage como alicerce, dá para colocar os dois lado a lado. Não é uma disputa sobre qual é melhor: são arquiteturas com forças diferentes, frequentemente usadas juntas na mesma empresa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\", \"Data warehouse\", \"Data lake\"], [\"Formato dos dados\", \"Estruturado, já modelado em tabelas\", \"Qualquer formato: estruturado, semiestruturado, não estruturado\"], [\"Momento do esquema\", \"Schema-on-write, antes da carga\", \"Schema-on-read, na leitura\"], [\"Custo de armazenamento\", \"Mais alto, storage otimizado para SQL\", \"Mais baixo, object storage genérico\"], [\"Usuários típicos\", \"Analistas de BI, times de negócio\", \"Engenheiros e cientistas de dados\"], [\"Caso de uso típico\", \"Dashboards, relatórios, SQL de negócio\", \"Exploração, machine learning, dados brutos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quem usa cada um no dia a dia\n\nNo warehouse, o público principal é quem consome dado já pronto: analistas de BI escrevendo SQL sobre tabelas modeladas, dashboards com métricas de negócio, relatórios recorrentes com SLA de atualização. No lake, o público típico é quem ainda está explorando ou transformando o dado: engenheiros de dados construindo pipelines, cientistas de dados testando features para um modelo, times de ML lendo grandes volumes de dados brutos ou semiestruturados."
                    },
                    {
                        "type": "text",
                        "value": "## Quando escolher cada um\n\n- **Warehouse**: quando o requisito é SQL rápido e consistente sobre dados já modelados, com governança e SLA fortes, como um relatório financeiro ou um dashboard executivo.\n- **Lake**: quando o requisito é guardar grande volume e variedade de dados brutos, com custo baixo, para uso exploratório, histórico longo ou treino de modelos.\n- **Os dois juntos**: a maioria das empresas usa as duas arquiteturas, o lake guarda tudo primeiro, e um subconjunto tratado e modelado alimenta o warehouse para consumo de negócio."
                    },
                    {
                        "type": "code",
                        "value": "Padrao comum: lake como origem, warehouse como camada de consumo\n\n  Fontes -> [ Data Lake (raw) ] -> ETL/ELT -> [ Data Warehouse ]\n                     |                                 |\n               dados brutos,                    tabelas modeladas,\n               qualquer formato                 prontas para BI/SQL\n                     |\n                     +--> Times de ciencia de dados e ML consultam\n                          direto o lake, sem passar pelo warehouse"
                    },
                    {
                        "type": "quote",
                        "value": "Data lake e data warehouse não competem pelo mesmo trabalho: o lake é onde o dado bruto tem espaço para existir, o warehouse é onde o dado já tratado vira resposta rápida para o negócio."
                    },
                    {
                        "type": "text",
                        "value": "## A dificuldade de manter os dois\n\nManter lake e warehouse separados tem um custo escondido: pipelines duplicados para levar dado do lake ao warehouse, dados que ficam desatualizados em um lugar e atualizados no outro, e duas camadas de segurança e catálogo para manter consistentes. Essa dor é o que motiva a evolução que os próximos módulos desta trilha exploram: dar ao lake as garantias do warehouse, sem abrir mão do custo e da flexibilidade do object storage."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma dashboard executiva precisa de métricas de vendas atualizadas todo dia às 7h, com SQL consistente e schema estável. Qual arquitetura atende melhor esse requisito específico?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Data warehouse, porque entrega SQL rápido e consistente sobre dados já modelados, com o schema definido antes da carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "Data lake, porque guarda qualquer formato de dado e permite que o dashboard leia arquivos brutos diretamente sem ETL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data lake, porque o custo de armazenamento mais baixo compensa a maior latência das consultas SQL sobre arquivos Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data warehouse, porque é a única arquitetura capaz de guardar histórico de vendas por mais de um ano de dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de ciência de dados precisa de acesso a cliques brutos de app, logs de erro e imagens de produto para treinar um modelo, sem que ninguém tenha modelado essas fontes antes. Qual arquitetura atende esse cenário com menor atrito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Data warehouse, porque a modelagem prévia do schema garante que o modelo de ML treine só com dados já validados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data warehouse, porque times de ciência de dados dependem de SQL para acessar qualquer tipo de dado de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data lake, porque aceita qualquer formato sem exigir modelagem prévia, o que combina com fontes ainda não tratadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Data lake, porque converte automaticamente imagens e logs em tabelas relacionais assim que chegam ao armazenamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém um data lake com dados brutos de todas as fontes e um data warehouse alimentado por um subconjunto tratado desses dados. Qual é o papel do warehouse nesse arranjo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Substituir o lake como único repositório, já que manter as duas camadas ao mesmo tempo nunca traz benefício real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Servir como camada de consumo para o negócio, com dados já modelados e prontos para SQL de BI e relatórios.",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar uma cópia de segurança do lake inteiro, garantindo recuperação caso o object storage sofra alguma falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar os dados que o lake não consegue guardar, como arquivos binários grandes ou formatos não estruturados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa mantém pipelines separados para levar dado do lake ao warehouse, e percebe que a mesma métrica aparece com valores diferentes nos dois lugares, dependendo de quando cada pipeline rodou por último. Esse sintoma aponta para qual dor de manter as duas camadas separadas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A falta de um object storage compatível, que impede o warehouse de ler arquivos Parquet gerados pelo lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "O limite de linhas por tabela do warehouse, que trunca os dados vindos do lake antes de concluir a carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de schema-on-read no warehouse, que impede aplicar o mesmo esquema usado pelas consultas no lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "A duplicação e a defasagem entre as duas camadas, já que cada pipeline atualiza os dados em momentos diferentes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "De forma geral, qual afirmação descreve melhor a relação entre data lake e data warehouse na maioria das empresas que usam os dois?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São complementares: o lake guarda o dado bruto em qualquer formato, e um subconjunto tratado alimenta o warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "São concorrentes diretos: escolher um implica abandonar completamente qualquer investimento já feito no outro.",
                                "isCorrect": false
                            },
                            {
                                "text": "São idênticos em função, diferindo apenas no nome que cada fornecedor de nuvem escolhe usar em sua documentação.",
                                "isCorrect": false
                            },
                            {
                                "text": "São sequenciais no tempo: toda empresa começa com data lake e migra por completo para o warehouse depois.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A promessa e o perigo: o data swamp",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A promessa e o perigo: o data swamp\n\nO data lake promete baixo custo e liberdade para guardar qualquer dado sem esperar por modelagem. Essa mesma liberdade, sem nenhum cuidado adicional, é o que transforma um lake em um data swamp: um repositório onde os dados existem, mas ninguém consegue encontrá-los, confiar neles ou entender o que significam."
                    },
                    {
                        "type": "text",
                        "value": "## Os sintomas de um pântano de dados\n\n- **Sem convenção**: arquivos gravados sem padrão de nome, pasta ou formato, cada time fazendo do seu jeito.\n- **Sem catálogo**: para saber o que existe em uma pasta, é preciso abrir os arquivos um por um.\n- **Sem controle de versão**: dados duplicados, versões antigas nunca removidas, sem indicação de qual é a válida.\n- **Sem dono**: nenhum responsável definido por dataset, então ninguém responde quando um dado está errado ou desatualizado.\n- **Sem qualidade**: nulos, tipos inconsistentes e schemas que mudaram sem aviso."
                    },
                    {
                        "type": "quote",
                        "value": "Um data lake sem catálogo, sem dono e sem controle de qualidade não é mais barato: ele só transfere o custo do armazenamento para o tempo que alguém vai gastar tentando confiar no que está guardado ali."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Data lake saudável\", \"Data swamp\"], [\"Organização\", \"Zonas claras: raw, staging, curated\", \"Arquivos soltos sem padrão de pasta\"], [\"Descoberta\", \"Catálogo central com metadados\", \"Ninguém sabe o que existe onde\"], [\"Qualidade\", \"Validação e contratos de dados\", \"Nulos, tipos e schemas inconsistentes\"], [\"Responsabilidade\", \"Dono definido por dataset\", \"Nenhum responsável identificável\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Mesmo bucket, dois destinos possiveis\n\n  # Data swamp: sem padrao, sem dono, sem versao clara\n  s3://empresa-lake/\n    joao_teste.csv\n    vendas_final.csv\n    vendas_final_v2.csv\n    vendas_final_v2_usar_esse.csv\n    export(3).json\n\n  # Data lake saudavel: zonas, convencao e dono documentado\n  s3://empresa-lake/\n    raw/vendas/dt=2026-07-15/pedidos.csv\n    staging/vendas/dt=2026-07-15/pedidos.parquet\n    curated/vendas/ano=2026/mes=07/pedidos.parquet\n    # dono: time-vendas | catalogo: glue://vendas.pedidos"
                    },
                    {
                        "type": "text",
                        "value": "## O que falta no lake cru para não virar pântano\n\nO object storage resolve onde guardar. O que falta é um catálogo que descreva o que existe e onde (metadados, schema, dono), zonas organizadas que separem dado bruto de dado tratado, e controle de qualidade que detecte schemas quebrados antes que virem problema de quem consome. É exatamente por aí que o próximo módulo começa: as zonas do lake, o layout de pastas e o catálogo de dados."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nNeste módulo, vimos por que o warehouse tradicional esbarra em custo e rigidez, o que é um data lake e sua promessa de schema-on-read, o object storage como alicerce barato e durável, a comparação direta entre lake e warehouse, e o risco do data swamp quando a liberdade do lake não vem acompanhada de organização. A partir daqui, a trilha entra no como: organizar, formatar e, mais adiante, dar ao lake garantias de transação que hoje só o warehouse tem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual conjunto de sintomas caracteriza um data lake que se tornou um data swamp?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Custo de armazenamento crescente, causado exclusivamente pelo aumento do volume de dados brutos recebidos todo mês.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta de catálogo, dados duplicados sem versão clara e nenhum dono definido para responder por cada dataset.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uso exclusivo de arquivos Parquet, o que reduz a flexibilidade de formato prometida pela arquitetura de data lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "Excesso de zonas organizadas (raw, staging, curated), o que confunde os times sobre onde gravar cada arquivo novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista precisa encontrar o dataset de pedidos mais atualizado em um bucket com vendas_final.csv, vendas_final_v2.csv e vendas_final_v2_usar_esse.csv, sem nenhuma documentação disponível. Qual elemento, se existisse, teria evitado essa situação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um limite de tamanho máximo por bucket, que forçaria os times a apagar arquivos antigos automaticamente todo mês.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma regra de compressão obrigatória, que reduziria o espaço ocupado pelas versões antigas do mesmo arquivo de pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um particionamento por data, que organizaria os arquivos em pastas sem depender do nome escolhido por cada pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um catálogo central com metadados, indicando qual versão do dataset é a válida e quem é o dono responsável.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa argumenta que seu data lake é barato porque o object storage custa pouco por gigabyte, mas o time de analistas gasta horas todo mês tentando entender quais arquivos ainda são válidos. Qual conclusão essa situação sustenta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O custo do object storage está superestimado, e a empresa deveria migrar para um warehouse tradicional imediatamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é exclusivamente técnico, resolvido apenas trocando o formato dos arquivos de CSV para Parquet no bucket.",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo baixo do armazenamento não elimina o custo de um lake sem organização: desloca o custo para o tempo das pessoas.",
                                "isCorrect": true
                            },
                            {
                                "text": "A situação é normal e esperada em qualquer data lake, independente de existir catálogo, zonas ou dono definido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de engenharia de dados propõe investir em zonas organizadas (raw, staging, curated), catálogo de metadados e validação de schema antes de liberar o lake para outros times. Do ponto de vista do risco de data swamp, essa proposta é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adequada, porque ataca diretamente as causas do pântano: falta de organização, de descoberta e de controle de qualidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Desnecessária, porque o object storage já garante organização suficiente por manter os arquivos ordenados por data de upload.",
                                "isCorrect": false
                            },
                            {
                                "text": "Insuficiente, porque só um data warehouse completo consegue eliminar de fato o risco de um data lake virar um pântano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Prematura, porque catálogo e validação de schema só fazem sentido depois que o lake acumular alguns anos de dados brutos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções descreve corretamente o que falta em um data lake cru (apenas object storage e arquivos, sem mais nada) para evitar que ele vire um data swamp?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um contrato exclusivo com um único fornecedor de nuvem, eliminando a necessidade de qualquer catálogo de metadados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um catálogo de metadados, zonas organizadas e controle de qualidade que descrevam e validem o que está guardado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um limite rígido de espaço em disco, que impede o lake de crescer além da capacidade de leitura de uma única engine.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma conversão obrigatória de todo arquivo para formato de imagem, padronizando a forma como os dados são guardados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Organizando um data lake",
        "aulas": [
            {
                "titulo": "Zonas do lake: raw, staging, curated",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Zonas do lake: raw, staging, curated\n\nUm data lake sem organização interna vira rapidamente um data swamp: arquivos de origens diferentes, formatos diferentes e níveis de qualidade diferentes, todos misturados sem nenhum critério. A forma mais comum de evitar isso é dividir o lake em zonas, camadas que representam o nível de maturidade do dado, não apenas mais uma pasta qualquer no storage.\n\nEssas zonas aparecem sob dois nomes equivalentes: raw, staging e curated (o nome pela função de cada uma) ou bronze, silver e gold (o nome popularizado pela arquitetura medalhão, que a trilha aprofunda mais adiante). O conceito por trás dos dois é o mesmo, e os dois nomes convivem no mercado."
                    },
                    {
                        "type": "text",
                        "value": "## A zona raw (bronze)\n\nA zona raw guarda uma cópia fiel do dado como ele chegou da fonte, sem transformação. Se a origem manda JSON, fica JSON; se manda CSV, fica CSV. Nada é filtrado, corrigido ou descartado nessa etapa, nem mesmo um registro claramente duplicado ou um campo em branco.\n\nEssa fidelidade é proposital. Se uma transformação mais adiante tiver um bug, ou se um requisito novo pedir um campo que antes era ignorado, o time reprocessa a partir da raw sem precisar voltar à fonte original, que pode nem estar mais disponível no mesmo formato de hoje. Na prática, a raw funciona como a rede de segurança de todo o pipeline."
                    },
                    {
                        "type": "text",
                        "value": "## A zona staging (silver)\n\nNa staging o dado já passou por uma primeira limpeza: tipos corrigidos, duplicatas removidas, nomes de coluna padronizados, valores nulos tratados. O grão continua o mesmo da fonte (uma linha de staging corresponde a um evento ou registro original), mas agora o schema é conhecido e estável, normalmente já em Parquet.\n\nÉ nessa zona que o dado fica confiável, porém ainda granular: pronto para ser combinado e agregado, mas ainda sem responder sozinho a uma pergunta de negócio específica."
                    },
                    {
                        "type": "text",
                        "value": "## A zona curated (gold)\n\nA curated existe para responder perguntas de negócio diretamente. Aqui o dado já foi agregado, cruzado com outras tabelas e modelado, muitas vezes como fatos e dimensões ou como métricas pré-calculadas. É essa zona que alimenta dashboards, relatórios e modelos de machine learning.\n\nQuanto mais perto da curated, menos técnico costuma ser o consumidor: um analista de BI consulta a curated, não a raw, porque não é papel dele decidir como deduplicar um registro ou tipar uma coluna."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Zona\", \"O que contém\", \"Transformação aplicada\", \"Consumidor típico\"], [\"Raw (bronze)\", \"Cópia fiel da fonte, sem alteração\", \"Nenhuma, ingestão direta\", \"Engenharia de dados, reprocessamento\"], [\"Staging (silver)\", \"Dados limpos, validados e conformados\", \"Deduplicação, tipagem, padronização de schema\", \"Times de dados, ETL downstream\"], [\"Curated (gold)\", \"Agregados e métricas de negócio\", \"Joins, agregações, regras de negócio\", \"Analistas, BI, dashboards, ML\"]]"
                    },
                    {
                        "type": "code",
                        "value": "s3://lake-empresa/\n  raw/                                    (bronze, cópia fiel da fonte)\n    vendas/pedidos/dt=2026-07-14/pedidos_export.json\n\n  staging/                                (silver, limpo, tipado, deduplicado)\n    vendas/pedidos/dt=2026-07-14/part-00000.parquet\n\n  curated/                                (gold, agregado, pronto para consumo)\n    vendas/receita_diaria/dt=2026-07-14/part-00000.parquet\n\nfluxo dos dados:\n\n  raw --(limpeza, dedup, schema)--> staging --(joins, agregação, regras de negócio)--> curated"
                    },
                    {
                        "type": "quote",
                        "value": "Cada zona do lake responde a uma pergunta diferente: a raw guarda o que aconteceu, a staging garante o que é válido, a curated entrega o que importa para o negócio."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual zona do data lake guarda uma cópia do dado exatamente como chegou da fonte, sem nenhuma transformação aplicada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A zona staging, que remove duplicatas e corrige tipos antes de qualquer consumo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A zona raw, que preserva o dado fiel à origem para permitir reprocessamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "A zona curated, que agrega e modela o dado para consumo direto do negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "A zona de catálogo, que registra o schema das tabelas sem guardar os dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bug foi encontrado na transformação que gera a zona staging de uma tabela, e meses de dados staging ficaram com um campo calculado errado. Qual característica do design em zonas torna a correção viável sem voltar ao sistema de origem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A curated já ter sido validada por um analista antes de chegar ao dashboard final.",
                                "isCorrect": false
                            },
                            {
                                "text": "A staging usar Parquet, que grava os dados de forma mais compacta que o CSV original.",
                                "isCorrect": false
                            },
                            {
                                "text": "O catálogo manter o histórico de todas as alterações de schema feitas na staging.",
                                "isCorrect": false
                            },
                            {
                                "text": "A raw guardar uma cópia intacta da fonte, permitindo reprocessar a staging a partir dela.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um analista de BI precisa montar um dashboard de receita diária e quer consultar uma tabela já pronta, sem fazer joins nem agregações por conta própria. A qual zona essa tabela deve pertencer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "À curated, porque essa zona entrega o dado já agregado e modelado para o negócio.",
                                "isCorrect": true
                            },
                            {
                                "text": "À staging, porque essa zona já garante que os tipos e nomes de coluna estão corretos.",
                                "isCorrect": false
                            },
                            {
                                "text": "À raw, porque essa zona concentra o volume total de dados históricos disponíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ao catálogo, porque essa zona guarda a definição de schema usada pelas outras zonas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time passou a gravar direto na zona curated um dado já deduplicado e tipado, mas ainda no grão original de evento (uma linha por clique), sem nenhuma agregação de negócio. Qual é o problema dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Esse dado deveria ficar na raw, já que ainda está no grão de um evento individual.",
                                "isCorrect": false
                            },
                            {
                                "text": "A curated não pode ser particionada por data, apenas as zonas raw e staging podem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse dado é staging por natureza: falta a agregação que caracteriza a curated.",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema é só de nomenclatura, pois o conteúdo da curated pode ter qualquer grão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a zona raw normalmente é descrita como schema-on-read, enquanto a staging já tem um schema conhecido e estável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a raw grava exclusivamente em Parquet, formato que dispensa schema explícito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a raw guarda o formato original da fonte, e o schema só é interpretado na leitura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a staging não permite mudanças de schema depois que a tabela é criada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a raw é reprocessada a cada consulta, então nunca chega a ter um schema fixo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Layout de pastas e particionamento no storage",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Layout de pastas e particionamento no storage\n\nUm data lake é, no fundo, um conjunto de arquivos dentro de um object storage. Sem nenhuma estrutura, encontrar a tabela certa vira uma busca manual por prefixos de pasta. Um bom layout resolve dois problemas ao mesmo tempo: organiza a descoberta dos dados (onde fica a tabela X) e acelera a consulta (quais arquivos a engine realmente precisa ler).\n\nEsses dois problemas se resolvem com técnicas diferentes: hierarquia de pastas para a descoberta, e particionamento para a performance da consulta."
                    },
                    {
                        "type": "text",
                        "value": "## Organizando por domínio e tabela\n\nA convenção mais comum organiza o storage por domínio de negócio e depois por tabela, por exemplo `curated/vendas/pedidos/` ou `staging/marketing/campanhas/`. Essa hierarquia não muda o desempenho de nenhuma consulta: ela existe para que qualquer pessoa, ou ferramenta, consiga localizar uma tabela sem depender de documentação externa.\n\nManter esse padrão consistente entre raw, staging e curated também facilita rastrear a mesma tabela em diferentes estágios do pipeline, o que ajuda tanto na governança quanto na hora de depurar um problema."
                    },
                    {
                        "type": "text",
                        "value": "## Particionamento por coluna\n\nParticionar significa gravar os dados em subpastas nomeadas a partir do valor de uma coluna, no formato `coluna=valor`, conhecido como particionamento no estilo Hive. Uma tabela particionada por data, por exemplo, grava cada dia em sua própria pasta: `dt=2026-07-14/`, `dt=2026-07-15/`, e assim por diante.\n\nDiferente da hierarquia de domínio e tabela, o particionamento afeta diretamente o desempenho: ele diz à engine de consulta quais pastas inteiras podem ser ignoradas quando uma query filtra por aquela coluna."
                    },
                    {
                        "type": "code",
                        "value": "s3://lake-empresa/curated/vendas/pedidos/\n  dt=2026-07-12/\n    part-00000.parquet\n    part-00001.parquet\n  dt=2026-07-13/\n    part-00000.parquet\n    part-00001.parquet\n  dt=2026-07-14/\n    part-00000.parquet\n    part-00001.parquet\n\n-- consulta filtrando pela coluna de partição\nSELECT SUM(valor_total)\nFROM vendas.pedidos\nWHERE dt = '2026-07-14';\n\n-- a engine lê SOMENTE a pasta dt=2026-07-14/ e ignora as outras duas (partition pruning)"
                    },
                    {
                        "type": "text",
                        "value": "## Partition pruning e o custo de varredura\n\nQuando uma consulta filtra pela coluna de partição, a engine consegue eliminar pastas inteiras antes mesmo de abrir um arquivo, uma otimização chamada de partition pruning. O efeito prático é direto: menos arquivos lidos, menos I/O, consulta mais rápida, e em engines que cobram por volume de dados varrido, menos custo.\n\nO inverso também é verdadeiro: uma tabela particionada pela coluna errada, ou uma consulta que nunca filtra pela coluna de partição escolhida, não ganha nada dessa otimização e acaba lendo a tabela inteira mesmo com uma estrutura de pastas elaborada."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Chave de particionamento\", \"Cardinalidade típica\", \"Efeito no lake\"], [\"Data (dt=AAAA-MM-DD)\", \"Baixa a média, cerca de 365 valores por ano\", \"Poucas pastas, boa filtragem por período\"], [\"País ou região\", \"Baixa, dezenas de valores distintos\", \"Partições bem povoadas, boa filtragem\"], [\"ID do cliente\", \"Altíssima, milhões de valores distintos\", \"Milhões de pastas minúsculas, catálogo sobrecarregado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Particionamento é uma decisão física: a mesma coluna que acelera uma consulta pode, se escolhida errado, explodir o número de arquivos do lake."
                    }
                ],
                "questions": [
                    {
                        "statement": "No caminho `s3://lake/curated/vendas/pedidos/dt=2026-07-14/`, o que o trecho `dt=2026-07-14` representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma partição no estilo Hive, em que o nome da pasta codifica a coluna e o valor.",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do arquivo Parquet mais recente gravado dentro da tabela de pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tag de versão do schema da tabela, usada pelo catálogo para controle de mudanças.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um identificador único da execução do job que gravou os dados naquele dia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de pedidos está particionada por `dt` e tem dois anos de histórico. Uma consulta filtra `WHERE dt = '2026-07-14'`. O que a engine faz de diferente por causa do particionamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lê todos os arquivos da tabela e descarta em memória as linhas fora da data pedida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consulta primeiro o catálogo para recalcular o schema antes de acessar o storage.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lista apenas a pasta `dt=2026-07-14` e ignora as demais, reduzindo o volume lido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Converte a tabela inteira para um formato temporário antes de aplicar o filtro de data.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide particionar uma tabela de pedidos por `cliente_id`, que tem alguns milhões de valores distintos. Qual é a consequência mais provável dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As consultas por período deixam de funcionar, já que `dt` não é mais uma coluna disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "O formato dos arquivos precisa mudar de Parquet para CSV para suportar tantas pastas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O catálogo passa a exigir schema-on-write, o que não é suportado em tabelas externas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O lake acumula milhões de pastas minúsculas, sobrecarregando listagem e catálogo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela é particionada por `dt`, mas a maioria das consultas do time filtra por `regiao`, uma coluna que não é a chave de partição. O que acontece nessas consultas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A engine rejeita a consulta, pois só aceita filtros na coluna usada como partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "A engine varre as partições de `dt` inteiras, sem conseguir podar por `regiao`.",
                                "isCorrect": true
                            },
                            {
                                "text": "O catálogo cria automaticamente uma segunda partição por `regiao` para otimizar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado sai incompleto, porque `regiao` não está registrada no schema da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Organizar o storage como `curated/vendas/pedidos/` (domínio e tabela) e, dentro disso, particionar por `dt` resolvem o mesmo problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não: a hierarquia de domínio e tabela organiza a descoberta, e a partição acelera a consulta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim: as duas técnicas existem só para reduzir o espaço ocupado no object storage.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: a hierarquia de domínio serve para consultas, e a partição serve para backup dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim: tanto a hierarquia quanto a partição são definidas automaticamente pelo catálogo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Formatos no lake: por que Parquet",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Formatos no lake: por que Parquet\n\nUm data lake aceita qualquer formato de arquivo, mas isso não significa que todo formato sirva igualmente bem para todo propósito. Na prática, um pequeno grupo de formatos domina cada zona: CSV e JSON aparecem na borda de ingestão, e o Parquet domina a partir da staging em diante.\n\nEntender por que essa divisão existe evita um erro comum: tratar o lake como se qualquer formato fosse equivalente, e descobrir tarde demais que consultas analíticas sobre CSV ou JSON custam caro demais para operar em escala."
                    },
                    {
                        "type": "text",
                        "value": "## Armazenamento colunar\n\nFormatos como CSV e JSON são orientados a linha: cada registro fica inteiro, um após o outro. Para ler uma única coluna, o motor de leitura precisa passar por cada linha inteira, mesmo que a consulta use só um punhado de colunas.\n\nO Parquet é orientado a coluna: os valores de uma mesma coluna ficam agrupados fisicamente. Uma consulta analítica típica, que agrega poucas colunas sobre bilhões de linhas, lê só o que precisa e ignora o resto do arquivo, o que reduz drasticamente o volume de I/O."
                    },
                    {
                        "type": "text",
                        "value": "## Compressão e schema embutido\n\nComo valores de uma mesma coluna tendem a ser parecidos entre si (mesmo tipo, faixa de valores parecida), o Parquet comprime muito melhor do que um formato orientado a linha, aplicando codificações específicas por tipo de coluna. O arquivo também guarda o schema junto com os dados: nomes de coluna, tipos e estatísticas como valor mínimo e máximo por grupo de linhas.\n\nEssas estatísticas permitem que a engine pule grupos inteiros de linhas que não podem satisfazer um filtro, sem precisar decodificar o conteúdo, uma otimização parecida em espírito com o partition pruning, só que dentro do próprio arquivo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"CSV\", \"JSON\", \"Parquet\"], [\"Orientação\", \"Linha, texto puro\", \"Linha, documento aninhado\", \"Coluna, binário\"], [\"Schema\", \"Nenhum, inferido na leitura\", \"Semiestruturado, aninhado\", \"Embutido no próprio arquivo\"], [\"Compressão\", \"Fraca, exige compressão externa\", \"Fraca, exige compressão externa\", \"Forte, por tipo de coluna\"], [\"Leitura seletiva de colunas\", \"Não, lê a linha inteira\", \"Não, lê o documento inteiro\", \"Sim, ignora colunas não usadas\"], [\"Uso típico no lake\", \"Landing de exports simples\", \"Landing de APIs e eventos\", \"Staging e curated\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde CSV e JSON ainda aparecem\n\nÉ normal, e esperado, que a zona raw receba dados no formato original da fonte: um export em CSV de um sistema legado, um payload em JSON vindo de uma API. A raw existe justamente para preservar essa fidelidade, então converter esse formato ainda na ingestão perderia o propósito da zona.\n\nA conversão para Parquet acontece na passagem para a staging, junto com a limpeza e a padronização de schema. Dali em diante, tanto a staging quanto a curated seguem em Parquet."
                    },
                    {
                        "type": "code",
                        "value": "# lê o dado em JSON na zona raw, no formato original da fonte\ndf_raw = spark.read.json(\"s3://lake-empresa/raw/vendas/pedidos/dt=2026-07-14/\")\n\n# limpa, tipa e grava particionado em Parquet na zona staging\n(df_raw\n    .select(\"pedido_id\", \"cliente_id\", \"valor_total\", \"dt\")\n    .withColumn(\"valor_total\", col(\"valor_total\").cast(\"decimal(10,2)\"))\n    .dropDuplicates([\"pedido_id\"])\n    .write\n    .mode(\"overwrite\")\n    .partitionBy(\"dt\")\n    .parquet(\"s3://lake-empresa/staging/vendas/pedidos/\"))"
                    },
                    {
                        "type": "quote",
                        "value": "Parquet é a língua franca do lake: o que entra em qualquer formato sai em colunas comprimidas, prontas para consulta eficiente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o Parquet costuma ser o formato padrão das zonas staging e curated de um data lake?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque é o único formato que os motores SQL modernos conseguem ler diretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque grava sempre um arquivo único por tabela, o que simplifica o particionamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque dispensa a existência de um catálogo de dados para localizar as tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é colunar, comprimido e guarda o schema junto com os dados.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um dashboard consulta apenas 3 das 50 colunas de uma tabela curated com bilhões de linhas. Por que armazenar essa tabela em Parquet, e não em CSV, reduz o custo dessa consulta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Parquet aplica automaticamente um índice B-tree sobre todas as colunas da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o formato colunar permite ler só as 3 colunas usadas, ignorando as outras 47.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque arquivos Parquet são sempre menores em bytes do que o mesmo dado em CSV.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Parquet armazena as consultas mais frequentes em cache dentro do próprio arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema externo entrega, todo dia, um export em JSON que é gravado sem alterações na zona raw. Isso é um problema de organização do lake?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, porque a zona raw só pode conter arquivos já convertidos para Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o catálogo não consegue registrar tabelas apontando para arquivos JSON.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, a raw preserva o formato de origem; a conversão para Parquet acontece depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, mas somente se o JSON for convertido para CSV antes de chegar à zona raw.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação faz milhares de buscas por segundo, cada uma trazendo todas as colunas de um único pedido pelo seu ID. Por que Parquet na zona curated não é a escolha certa para esse padrão de acesso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o formato colunar é otimizado para varrer poucas colunas em muitas linhas, não o contrário.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque arquivos Parquet não podem ser lidos por nenhuma aplicação fora do ecossistema Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a zona curated é somente leitura em lote, uma vez por dia, e nunca aceita consultas pontuais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Parquet exige que o catálogo esteja disponível para abrir qualquer arquivo individual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além de armazenar os dados em colunas, um arquivo Parquet guarda estatísticas como valor mínimo e máximo por grupo de linhas. Para que isso serve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Para criptografar automaticamente as colunas que contêm dados sensíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para gerar, a partir dessas estatísticas, a documentação de negócio da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para permitir que o arquivo seja aberto por engines que não suportam schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Para deixar a engine pular grupos de linhas que não podem satisfazer um filtro.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O problema dos small files e da compactação",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O problema dos small files e da compactação\n\nUm data lake saudável tende a acumular, com o tempo, um inimigo silencioso: um número enorme de arquivos pequenos numa mesma partição. Isso costuma passar despercebido no início, quando o volume de dados ainda é pequeno, e vira um problema sério de performance à medida que o lake cresce.\n\nO nome que o mercado dá a isso é small files problem, e é uma das causas mais comuns de lentidão em consultas sobre um lake que, no papel, não deveria estar tão devagar."
                    },
                    {
                        "type": "text",
                        "value": "## Por que small files acontecem\n\nA causa mais comum é a escrita frequente em pequenos lotes: um job de streaming ou de micro-batch que grava um arquivo novo a cada execução, várias vezes por hora, sem nunca consolidar o que já foi escrito. Outra causa comum é o particionamento excessivo, quando a coluna de partição tem cardinalidade alta demais e cada partição acaba recebendo poucas linhas.\n\nUm terceiro cenário é puramente operacional: um job Spark configurado com paralelismo alto demais para o volume real de dados, em que cada tarefa grava seu próprio arquivo, pequeno, ao final do processamento."
                    },
                    {
                        "type": "text",
                        "value": "## O impacto na performance\n\nO custo de ler um arquivo não é só proporcional ao seu tamanho: existe um custo fixo por arquivo, de abrir a conexão, listar o objeto no storage e agendar a tarefa que vai processá-lo. Multiplicado por milhares ou milhões de arquivos, esse custo fixo passa a dominar o tempo total da consulta, mesmo que o volume de dados continue o mesmo.\n\nO catálogo de dados também sofre: cada arquivo é uma entrada de metadado a mais para rastrear, e um número excessivo de arquivos pode deixar até operações simples, como listar as partições de uma tabela, visivelmente mais lentas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Poucos arquivos grandes\", \"Muitos arquivos pequenos\"], [\"Listagem no storage\", \"Rápida, poucas chamadas\", \"Lenta, milhares de chamadas\"], [\"Custo fixo de abertura\", \"Diluído entre muitas linhas\", \"Repetido a cada arquivo\"], [\"Catálogo de metadados\", \"Poucas entradas para rastrear\", \"Milhões de entradas para rastrear\"], [\"Paralelismo da engine\", \"Tarefas bem dimensionadas\", \"Tarefas minúsculas, agendamento ineficiente\"]]"
                    },
                    {
                        "type": "code",
                        "value": "antes da compactação (streaming gravando a cada minuto):\n\ns3://lake-empresa/staging/eventos/clicks/dt=2026-07-14/\n  part-00000-a1b2.parquet   (12 KB)\n  part-00001-c3d4.parquet   (9 KB)\n  part-00002-e5f6.parquet   (14 KB)\n  ... (mais de 4000 arquivos nesse padrão)\n\ndepois de um job diário de compactação:\n\ns3://lake-empresa/staging/eventos/clicks/dt=2026-07-14/\n  part-00000-9f8e.parquet   (480 MB)\n  part-00001-7a6b.parquet   (460 MB)\n\n# reduz o número de arquivos de saída antes da escrita\ndf.coalesce(2).write.mode(\"overwrite\").parquet(destino)"
                    },
                    {
                        "type": "text",
                        "value": "## Compactando na escrita\n\nA correção mais direta é compactar: reunir muitos arquivos pequenos em poucos arquivos maiores, geralmente na faixa de uma centena de megabytes a um gigabyte cada. Isso pode acontecer de duas formas, que não se excluem: controlando o número de arquivos já no momento da escrita, com `coalesce` ou `repartition` antes de gravar, ou rodando um job periódico de compactação que reescreve uma partição inteira num número menor de arquivos.\n\nTable formats como Delta Lake e Apache Iceberg, que a trilha aborda mais adiante, oferecem operações prontas para essa compactação, mas o princípio é o mesmo, mesmo num lake que ainda usa só Parquet puro."
                    },
                    {
                        "type": "quote",
                        "value": "Poucos arquivos grandes valem mais que muitos arquivos pequenos: o volume de dados é o mesmo, mas o custo de lê-los não."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o chamado problema de small files num data lake?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A tabela ficou com poucas colunas, o que limita o tipo de análise possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os arquivos ficaram comprimidos demais, o que aumenta o tempo de leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "A partição acumula muitos arquivos pequenos, em vez de poucos arquivos grandes.",
                                "isCorrect": true
                            },
                            {
                                "text": "O schema da tabela muda com frequência, exigindo reprocessar a raw sempre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de streaming grava um arquivo novo por partição a cada minuto, e depois de alguns meses a partição acumula centenas de milhares de arquivos pequenos. Qual é a forma mais direta de reduzir esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rodar um processo periódico que compacta os arquivos pequenos em arquivos maiores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o número de colunas gravadas, para que cada arquivo pequeno ocupe menos espaço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o formato de Parquet para CSV, que não sofre com excesso de arquivos pequenos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições da tabela, distribuindo os arquivos entre mais pastas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas tabelas têm exatamente o mesmo volume total de dados, mas uma está em 50 arquivos e a outra em 50 mil. Por que a segunda tende a ser mais lenta de consultar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o volume total lido do storage cresce quando os arquivos ficam menores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada arquivo tem um custo fixo de abertura, multiplicado pela quantidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque arquivos pequenos não podem ser lidos em paralelo pelos executores da engine.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Parquet limita o número de linhas por arquivo, truncando parte dos dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de eventos foi particionada por minuto (`dt_hora=2026-07-14-08-01`), gerando milhares de partições por dia, cada uma com poucos registros. Qual ajuste ataca a causa do problema, e não só o sintoma?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Manter a partição por minuto, mas trocar o formato dos arquivos de Parquet para JSON.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o particionamento por completo, gravando todos os eventos em uma única pasta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mover a tabela inteira da zona staging para a raw, onde o particionamento não se aplica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar uma granularidade mais grossa, como `dt` por dia, e compactar os arquivos resultantes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Antes de gravar um DataFrame no lake, um engenheiro chama `coalesce(2)` para reduzir o número de partições em memória. Qual é o efeito dessa chamada sobre os arquivos gravados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ordena as linhas por chave de partição, melhorando a compressão de cada arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplica uma agregação nos dados, reduzindo o volume total antes da escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Limita a quantidade de arquivos de saída, evitando gravar um arquivo por tarefa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Converte o schema da tabela automaticamente para o formato esperado pela curated.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Catálogo de dados e metadados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Catálogo de dados e metadados\n\nArquivos Parquet dentro de um object storage não são, por si só, uma tabela: são só arquivos. Para que uma engine SQL consiga rodar `SELECT * FROM vendas.pedidos`, alguma coisa precisa traduzir esse nome de tabela para um caminho físico no storage, um schema de colunas e a lista de partições disponíveis. Esse é o papel do catálogo de dados.\n\nSem catálogo, cada consulta exigiria conhecer o caminho exato dos arquivos e reconstruir manualmente o schema, o que inviabiliza qualquer uso sério de SQL sobre o lake."
                    },
                    {
                        "type": "text",
                        "value": "## O que o catálogo guarda\n\nPara cada tabela registrada, o catálogo guarda o nome da tabela e do domínio a que pertence, a lista de colunas com seus tipos, o caminho no storage onde os arquivos físicos estão gravados, quais colunas são partição e, em muitos casos, estatísticas usadas pela engine para otimizar a consulta.\n\nEsse conjunto de informações é o que transforma uma pasta cheia de arquivos Parquet numa tabela que pode ser consultada como qualquer outra."
                    },
                    {
                        "type": "text",
                        "value": "## Hive Metastore e AWS Glue Data Catalog, em conceito\n\nO Hive Metastore foi o catálogo original popularizado pelo ecossistema Hadoop, e o AWS Glue Data Catalog é a versão gerenciada equivalente na nuvem da AWS. Os dois cumprem o mesmo papel conceitual: um serviço de metadados compartilhado, que várias engines (Spark, Trino, Presto, entre outras) consultam antes de acessar os arquivos no storage.\n\nO ponto importante não é decorar a API de nenhum dos dois, e sim entender a ideia: o catálogo é um serviço à parte do storage e à parte da engine de consulta, o que permite que ferramentas diferentes compartilhem a mesma definição de tabela."
                    },
                    {
                        "type": "code",
                        "value": "-- registra no catálogo uma tabela externa apontando para arquivos já existentes no lake\nCREATE EXTERNAL TABLE vendas.pedidos (\n    pedido_id STRING,\n    cliente_id STRING,\n    valor_total DECIMAL(10,2)\n)\nPARTITIONED BY (dt STRING)\nSTORED AS PARQUET\nLOCATION 's3://lake-empresa/curated/vendas/pedidos/';\n\n-- registra no catálogo as partições que já existem fisicamente no storage\nMSCK REPAIR TABLE vendas.pedidos;\n\n-- a partir daqui, qualquer engine conectada ao catálogo consulta como uma tabela comum\nSELECT dt, SUM(valor_total) AS receita\nFROM vendas.pedidos\nWHERE dt = '2026-07-14'\nGROUP BY dt;"
                    },
                    {
                        "type": "text",
                        "value": "## Tabela externa x dados no lake\n\nUma tabela registrada dessa forma é chamada de tabela externa: o catálogo guarda a definição (schema, localização, partições), mas não é dono dos arquivos. Os dados continuam existindo no storage independentemente do catálogo, gravados e apagados por quem controla o pipeline, não pelo catálogo em si.\n\nEssa separação é diferente do que costuma acontecer num data warehouse tradicional, em que criar e apagar uma tabela também cria e apaga os dados. Num lake, apagar a definição no catálogo não apaga um único arquivo Parquet no storage."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Sem catálogo\", \"Com catálogo\"], [\"Descoberta de dados\", \"É preciso conhecer o caminho físico\", \"Basta o nome da tabela\"], [\"Consulta em SQL\", \"Cada engine lê o arquivo bruto manualmente\", \"SELECT direto, como um banco comum\"], [\"Compartilhamento entre times\", \"Cada time guarda sua própria referência\", \"Definição única, usada por todas as engines\"], [\"Novas partições\", \"Ficam invisíveis até alguém avisar\", \"Reconhecidas após registro no catálogo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um catálogo transforma arquivos em tabelas: sem ele, o lake é uma pasta cheia de arquivos; com ele, é um banco de dados consultável."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal função de um catálogo de dados como o Hive Metastore ou o AWS Glue Data Catalog num data lake?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Registrar nome, schema e localização física, para engines SQL encontrarem os dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar as consultas SQL no lugar da engine, direto sobre os arquivos do storage.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir e converter automaticamente os arquivos para o formato Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a necessidade de particionar os dados por data ou domínio no storage.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista consegue rodar `SELECT * FROM vendas.pedidos` sem saber em qual pasta do storage os arquivos realmente estão. O que torna isso possível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Parquet grava o caminho completo do arquivo dentro dos próprios metadados da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela externa no catálogo, apontando o nome da tabela para o caminho físico.",
                                "isCorrect": true
                            },
                            {
                                "text": "O object storage indexa automaticamente qualquer arquivo Parquet gravado nele.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark memoriza o último caminho lido e reaplica esse caminho em consultas futuras.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro executa `DROP TABLE` sobre uma tabela externa registrada no catálogo, apontando para arquivos já existentes no lake. O que acontece com os arquivos Parquet no storage?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "São apagados junto com a definição, porque o catálogo é dono dos dados de qualquer tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "São movidos automaticamente para a zona raw, como forma de preservar o histórico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permanecem no storage: o catálogo remove só a definição, não os arquivos físicos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ficam corrompidos, já que o schema associado a eles deixa de existir no catálogo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time usa Spark para escrever uma tabela, e outro time usa Trino para consultar a mesma tabela. O que permite que os dois enxerguem exatamente a mesma definição de schema e localização?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As duas engines precisam manter, cada uma, uma cópia própria e sincronizada do schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Parquet embute no arquivo uma lista das engines autorizadas a lê-lo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage converte automaticamente o schema para o formato que cada engine espera.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um catálogo compartilhado, consultado por ambas as engines antes de acessar os arquivos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job grava diretamente no storage uma nova pasta `dt=2026-07-15/` para uma tabela particionada, mas uma consulta logo em seguida não retorna nenhuma linha dessa data. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O catálogo ainda não tem essa partição registrada, e precisa ser atualizado para reconhecê-la.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Parquet gravado nessa pasta está corrompido, já que o job escreveu fora do padrão esperado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela atingiu o limite máximo de partições suportado pelo catálogo de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A engine só consegue ler partições criadas há mais de 24 horas, por razões de consistência.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Os limites do data lake cru",
        "aulas": [
            {
                "titulo": "Sem ACID: escritas concorrentes e leituras inconsistentes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Sem ACID: escritas concorrentes e leituras inconsistentes\n\nEm um banco relacional ou em um data warehouse, ACID (atomicidade, consistência, isolamento e durabilidade) é dado como certo: um `UPDATE` ou um `INSERT` roda dentro de uma transação, e quem lê a tabela nunca vê um estado parcial dessa transação. No data lake cru isso não existe. Uma \"tabela\" no lake é só uma convenção: uma pasta no object storage cheia de arquivos Parquet, sem nenhum mecanismo de transação amarrando essa pasta como uma unidade só. Cada arquivo é gravado de forma independente, e nada coordena dois processos que escrevem (ou um que escreve e outro que lê) ao mesmo tempo na mesma pasta."
                    },
                    {
                        "type": "text",
                        "value": "## O que o object storage garante (e o que não garante)\n\nServiços de object storage como S3, GCS e ADLS garantem atomicidade por objeto: um `PUT` de um arquivo específico é atômico, ou o arquivo aparece completo, ou não aparece. O que eles não garantem é atomicidade através de múltiplos objetos. Sobrescrever uma partição normalmente significa apagar um conjunto de arquivos Parquet e escrever outro conjunto no lugar, uma sequência de várias operações separadas, sem um \"commit\" que faça tudo (ou nada) de uma vez só. Um leitor que lista a pasta no meio dessa sequência vê exatamente o estado parcial em que ela está naquele instante."
                    },
                    {
                        "type": "code",
                        "value": "Job A (recomputa e sobrescreve a partição vendas/data=2026-07-16)\n  1. lista os arquivos atuais da partição: parte-1.parquet, parte-2.parquet\n  2. apaga parte-1.parquet\n  3. apaga parte-2.parquet\n  4. escreve novo-1.parquet\n  5. escreve novo-2.parquet\n\nJob B (lê a mesma partição para um dashboard), rodando em paralelo:\n\n  tempo 1: Job A ainda não começou            -> Job B vê parte-1, parte-2 (ok)\n  tempo 2: Job A está entre os passos 2 e 4    -> Job B vê só parte-2, ou nada\n  tempo 3: Job A está entre os passos 4 e 5    -> Job B vê parte-2 (antigo) + novo-1 (novo)\n  tempo 4: Job A terminou                      -> Job B vê novo-1, novo-2 (ok)\n\nNos tempos 2 e 3, o dashboard soma um subconjunto de linhas que nunca existiu como\num estado real da tabela: nem o \"antes\" nem o \"depois\" da sobrescrita."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que uma tabela precisa\",\"O que o object storage garante\",\"O que falta no lake cru\"],[\"Atomicidade ao trocar vários arquivos de uma vez\",\"Atomicidade só por arquivo individual (PUT)\",\"Nenhum commit amarrando o grupo inteiro\"],[\"Isolamento entre quem lê e quem escreve\",\"Nenhum controle de concorrência nativo\",\"Leitor pode ver um estado parcial da escrita\"],[\"Uma versão consistente da tabela por vez\",\"Cada LIST reflete só o instante da chamada\",\"Nenhum conceito de snapshot da tabela\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma tabela no lake cru não é uma unidade transacional: é uma pasta com arquivos, e nada impede dois escritores de pisarem um no trabalho do outro ao mesmo tempo."
                    },
                    {
                        "type": "text",
                        "value": "## Duas escritas concorrentes na mesma partição\n\nO problema não é só leitor contra escritor. Dois jobs que escrevem ao mesmo tempo também podem se atropelar. Se os dois só adicionam arquivos novos (um padrão de ingestão append-only, cada job com um nome de arquivo único), o risco é baixo: os arquivos coexistem sem conflito. O problema aparece quando um job faz um `overwrite`, recalculando e substituindo o conteúdo inteiro de uma partição: se dois jobs tentam sobrescrever a mesma partição ao mesmo tempo (por exemplo, um reprocessamento manual disparado enquanto o job agendado ainda roda), o resultado final é uma mistura de arquivos dos dois jobs, sem um vencedor definido. É um lost update clássico, só que em nível de arquivos em vez de linhas."
                    },
                    {
                        "type": "text",
                        "value": "## O custo de não ter isolamento\n\nSem isolamento, cada consumidor da tabela corre um risco silencioso: um relatório que soma valores errados por alguns minutos, um job downstream que falha ao ler um arquivo que sumiu no meio da leitura, um pipeline de ETL que processa a mesma partição duas vezes porque leu um estado intermediário. O problema raramente aparece nos testes, porque testes não têm concorrência real; ele aparece em produção, quando o volume de dados e a frequência dos jobs tornam as janelas de sobreposição comuns."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que falta, especificamente, para uma pasta de arquivos Parquet em um object storage funcionar como uma tabela transacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Compressão colunar nos arquivos, que reduz o volume de dados lidos em cada consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um mecanismo que trate a troca de vários arquivos como uma operação atômica, tudo ou nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um formato de arquivo mais rápido de gravar do que o Parquet, hoje o principal gargalo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Réplicas automáticas dos arquivos entre regiões, para tolerar a queda de um data center.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job noturno recalcula e sobrescreve a partição de vendas de ontem (apaga os arquivos antigos e escreve os novos). Por coincidência, no mesmo instante, um analista roda uma consulta ad-hoc direto na mesma partição do lake. Qual é o resultado mais provável dessa consulta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma contagem que não bate com o estado da tabela nem de antes, nem de depois da sobrescrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de permissão, porque dois processos não podem acessar a mesma pasta ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor da última execução bem-sucedida, porque o object storage sempre serializa leituras concorrentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma mensagem informando que a partição está bloqueada até o job noturno terminar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que escrever os arquivos novos em uma pasta temporária e só depois mover para o lugar final não resolve completamente o problema de atomicidade em um lake sobre object storage como o S3?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque mover um arquivo (rename) não é atômico em muitos object stores, sendo implementado como cópia seguida de exclusão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque pastas temporárias não são suportadas pelo formato Parquet, que sempre exige um caminho fixo definido na escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Spark não permite gravar arquivos fora do caminho da partição final, configurado previamente no início do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o catálogo de metadados bloqueia qualquer caminho de escrita que ainda não esteja registrado nele antecipadamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois jobs Spark recalculam a mesma agregação diária e terminam quase ao mesmo tempo, cada um sobrescrevendo a partição de destino com o próprio resultado. Nenhum dos dois falha. Qual é a causa raiz do risco nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Spark distribui os dois jobs em executors diferentes, o que impede os dois de escreverem na mesma partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "O formato Parquet grava metadados de versão em cada arquivo, e o job mais recente sempre prevalece.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage enfileira escritas concorrentes na mesma pasta e aplica a última por ordem de chegada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A sobrescrita não é atômica em nível de tabela, e o conjunto final pode misturar pedaços dos dois jobs.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Em um lake cru, dois jobs de ingestão gravam arquivos novos e distintos na mesma pasta de uma partição, sem nunca apagar ou sobrescrever nenhum arquivo. Comparado com uma sobrescrita (overwrite) na mesma partição, esse padrão de escrita:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tem o mesmo risco, porque qualquer escrita concorrente na mesma pasta do object storage é insegura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tem risco de conflito bem menor, porque cada arquivo novo coexiste com os demais sem exigir substituição coordenada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Tem risco maior, porque arquivos de jobs diferentes geram conflito de nomes com mais frequência do que uma sobrescrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Elimina o risco por completo, já que appends concorrentes são sempre serializados automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Atualizar e deletar é difícil",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Atualizar e deletar é difícil\n\nParquet é um formato colunar imutável: uma vez gravado, um arquivo não é editado, ele é lido, e ponto. Não existe uma operação de \"abrir o arquivo e trocar um valor\", porque os dados dentro de um arquivo Parquet estão organizados em row groups, comprimidos e codificados em colunas, uma estrutura pensada para leitura eficiente, não para edição pontual. Um data lake cru herda essa limitação direto: o padrão natural de escrita é append-only, adicionar arquivos novos, e qualquer operação que pareça um `UPDATE` ou um `DELETE` do mundo relacional precisa ser simulada por fora, reescrevendo arquivos inteiros."
                    },
                    {
                        "type": "text",
                        "value": "## Por que não dá para só editar o arquivo\n\nEm um banco relacional, um `UPDATE` altera as linhas certas no lugar (ou em uma estrutura de versionamento interna do próprio banco) sem tocar no resto da tabela. No lake cru não existe esse \"lugar\": não há índice que aponte de uma linha lógica para um arquivo e um offset específico. A única forma de encontrar as linhas que precisam mudar é ler os arquivos candidatos (idealmente restritos a uma partição, na pior hipótese a tabela inteira) e filtrar. Depois de identificar o que muda, a única forma de aplicar a mudança é escrever um Parquet novo com o conteúdo corrigido e descartar o antigo, mesmo que só uma fração pequena das linhas do arquivo tenha mudado."
                    },
                    {
                        "type": "code",
                        "value": "# padrão manual para \"corrigir\" linhas em uma partição do lake cru\n# (sem MERGE, sem UPDATE: é um job Spark escrito à mão)\n\nparticao = spark.read.parquet(\"s3://lake/vendas/data=2026-07-16/\")\n\n# separa o que precisa mudar do que fica como está\nlinhas_afetadas = particao.filter(\"pedido_id in (select pedido_id from correcoes)\")\nlinhas_intactas = particao.join(correcoes, \"pedido_id\", \"left_anti\")\n\n# aplica a correção e junta de volta com o que não mudou\nlinhas_corrigidas = aplicar_correcao(linhas_afetadas, correcoes)\nresultado = linhas_intactas.unionByName(linhas_corrigidas)\n\n# reescreve a partição inteira, mesmo que só uma fração das linhas tenha mudado\nresultado.write.mode(\"overwrite\").parquet(\"s3://lake/vendas/data=2026-07-16/\")"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"UPDATE/DELETE em warehouse\",\"Update/delete no lake cru\"],[\"Como se localiza a linha\",\"Índice ou motor de armazenamento interno\",\"Scan e filtro manual dos arquivos candidatos\"],[\"O que é reescrito\",\"Só as páginas ou linhas afetadas\",\"A partição inteira (ou o arquivo inteiro)\"],[\"Como se expressa\",\"Uma instrução declarativa, um UPDATE ... WHERE\",\"Um job Spark customizado, escrito à mão\"],[\"Atomicidade da troca\",\"Garantida pelo motor transacional\",\"Nenhuma, o mesmo risco visto na aula anterior\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Mudar duas linhas em uma partição de um bilhão delas custa, no lake cru, o mesmo que reescrever a partição inteira: não existe update parcial de um arquivo Parquet."
                    },
                    {
                        "type": "text",
                        "value": "## Um caso real: apagar os dados de uma pessoa\n\nPedidos de exclusão sob LGPD ou GDPR são um teste de estresse para o lake cru. Os registros de uma única pessoa podem estar espalhados em anos de partições diárias, e nada no lake indica de antemão quais arquivos contêm aquele identificador. Sem um índice, atender ao pedido significa, na prática, varrer o histórico inteiro (ou pelo menos toda partição que possa conter o dado), filtrar as linhas daquela pessoa em cada uma, reescrever as partições afetadas e coordenar a troca dos arquivos antigos pelos novos, com o mesmo risco de leitura inconsistente da aula anterior em cada partição tocada."
                    },
                    {
                        "type": "text",
                        "value": "## O apetite por upsert\n\nDeduplicação de eventos reprocessados, Change Data Capture aplicando a mudança mais recente de cada chave, uma dimensão SCD Tipo 2 fechando a validade de uma versão antiga e abrindo uma nova: todos esses padrões, comuns na trilha de ETL, dependem de uma operação de upsert, inserir se a chave não existe, atualizar se existe. No lake cru, upsert não é uma operação, é um projeto: ler, identificar, filtrar, reescrever, trocar. É exatamente essa lacuna que motiva o `MERGE` declarativo que os table formats trazem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que uma alteração pontual em algumas linhas de uma tabela no lake cru costuma exigir a reescrita de uma partição inteira?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o Parquet é um formato imutável e colunar, sem operação nativa para editar linhas já gravadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Spark só consegue gravar partições completas, nunca um subconjunto de arquivos dentro delas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o object storage cobra por operação de escrita, o que torna updates pequenos inviáveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o catálogo de metadados exige que cada partição tenha sempre só um arquivo Parquet por vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job corrige um bug que calculou errado uma coluna em cerca de 2% das linhas da partição de ontem, que tem centenas de milhões de linhas. Sem nenhum table format, como essa correção é aplicada no lake cru?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Marcando as linhas erradas como inválidas em um arquivo à parte, sem tocar nos arquivos originais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esperando a próxima execução agendada do pipeline, que naturalmente corrige a coluna no ciclo seguinte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Atualizando só as linhas afetadas com um UPDATE ... WHERE, já que o Parquet suporta edição pontual de valores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reprocessando a partição inteira em um job Spark, mesmo que só uma fração das linhas precise mudar.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que falta ao lake cru para localizar diretamente os arquivos que contêm as linhas de uma chave específica, sem ler e filtrar todos os arquivos candidatos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um formato de compressão mais eficiente, que reduziria o tempo de leitura de cada arquivo candidato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice ou metadado que associe valores de chave aos arquivos físicos que contêm essas linhas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cluster Spark maior, que paralelizaria a varredura de todos os arquivos candidatos ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma nomeação de arquivos que embuta a chave primária diretamente no nome de cada arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe deduplica eventos reprocessados lendo a partição inteira a cada execução, removendo as chaves duplicadas com um anti-join e sobrescrevendo a partição completa. Comparado a um MERGE declarativo, qual é o principal custo estrutural dessa abordagem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Parquet não permite armazenar chaves duplicadas, então o job falha antes de completar a deduplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O anti-join do Spark não pode ser distribuído entre executors, então roda inteiramente no driver.",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de I/O é proporcional ao tamanho da partição inteira, não ao volume de eventos duplicados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O resultado da deduplicação fica inconsistente sempre que a partição tem mais de um arquivo Parquet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dos padrões abaixo, comuns na trilha de ETL, depende estruturalmente de uma operação de upsert, inserir se a chave não existe e atualizar se existe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma dimensão SCD Tipo 2 fechando a validade de uma versão antiga da linha e abrindo uma nova.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma ingestão append-only que grava um arquivo novo por execução, sem nunca reler os arquivos anteriores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um particionamento por data que organiza os arquivos em pastas separadas por dia de referência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma compactação periódica que junta arquivos pequenos em arquivos maiores dentro da partição.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sem schema enforcement e o schema drift",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Sem schema enforcement e o schema drift\n\nO lake cru segue o princípio de schema-on-read: ninguém verifica a estrutura de um arquivo no momento em que ele é escrito, o schema só é interpretado depois, quando algum motor de consulta lê os dados. Isso dá flexibilidade (qualquer processo pode gravar um Parquet novo na pasta, sem pedir permissão a um schema centralizado), mas tem um preço: nada impede que dois arquivos da mesma tabela tenham colunas diferentes, tipos diferentes para a mesma coluna, ou uma coluna que existe em um arquivo e não existe no outro. Essa divergência silenciosa entre arquivos que deveriam pertencer à mesma tabela é o schema drift."
                    },
                    {
                        "type": "text",
                        "value": "## De onde vem o drift\n\nSchema drift raramente é um evento único e óbvio, ele se acumula. Uma API upstream troca o tipo de um campo (um preço que era inteiro em centavos passa a vir como string com símbolo de moeda), um novo sistema fonte é conectado ao mesmo pipeline de ingestão e manda um campo a mais, um job de ingestão é ajustado às pressas e esquece de preservar uma coluna antiga, um analista roda um script manual que grava direto na pasta com uma estrutura ligeiramente diferente do resto. Cada mudança, isolada, escreve arquivos Parquet válidos; o problema é que o conjunto de arquivos da \"mesma tabela\" deixa de ter um schema único."
                    },
                    {
                        "type": "code",
                        "value": "# partição vendas/data=2026-07-16/, dois arquivos com schemas diferentes\n\n# arquivo antigo (parte-1.parquet), gravado pelo pipeline de sempre\n# root\n#  |-- pedido_id: string\n#  |-- preco: int            <- centavos, ex.: 4590\n\n# arquivo novo (parte-2.parquet), gravado depois de uma mudança na API de origem\n# root\n#  |-- pedido_id: string\n#  |-- preco: string          <- ex.: \"R$ 45,90\"\n#  |-- moeda: string          <- coluna nova, não existe no arquivo antigo\n\n# um motor de leitura que infere o schema a partir dos arquivos precisa decidir:\n# usar só o primeiro arquivo (perde a coluna \"moeda\" e o tipo novo de \"preco\"),\n# tentar unificar os schemas (mergeSchema), ou falhar direto com erro de tipo"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Schema-on-write (warehouse)\",\"Schema-on-read (lake cru)\"],[\"Quando o schema é checado\",\"No momento da escrita\",\"Só quando um motor lê os arquivos\"],[\"Quem aplica a checagem\",\"O próprio motor, de forma centralizada\",\"Cada leitor decide como interpretar, se decide\"],[\"O que acontece com um registro fora do padrão\",\"A escrita é rejeitada antes de persistir\",\"O arquivo é gravado normalmente, sem aviso\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Schema-on-read não é ausência de schema, é ausência de fiscalização: o schema existe em algum lugar, na cabeça de quem projetou, só não é verificado no momento em que mais importaria."
                    },
                    {
                        "type": "text",
                        "value": "## O catálogo não protege sozinho\n\nUm catálogo de metadados como o Hive Metastore ou o Glue Data Catalog guarda uma definição declarada do schema de uma tabela, as colunas e os tipos que ela deveria ter. O que ele não faz, no lake cru, é validar cada arquivo novo contra essa definição no momento em que o arquivo chega à pasta: o catálogo é consultado por quem lê, não fiscaliza quem escreve. Isso significa que o schema registrado no catálogo e o schema real dos arquivos na pasta podem divergir silenciosamente por um bom tempo, até que alguma consulta específica tropece na diferença."
                    },
                    {
                        "type": "text",
                        "value": "## O custo do drift silencioso\n\nO efeito mais perigoso do schema drift não é o erro que quebra um job na hora, esse pelo menos avisa. É o drift que não quebra nada: uma inferência de schema que escolhe o tipo errado, uma coluna nova que fica ausente (nula) nas linhas antigas sem ninguém perceber, uma agregação que silenciosamente ignora um subconjunto de arquivos incompatíveis. O problema nasce na origem, dias ou semanas antes, mas só é descoberto quando alguém nota um número estranho em um relatório, e a depuração vira arqueologia: qual arquivo, de qual execução, mudou o quê."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o schema-on-read, o modelo seguido pelo data lake cru?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não existe schema em nenhum momento, os dados ficam sem estrutura até virarem uma tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O schema é definido antes da primeira escrita, e todo arquivo fora do padrão é rejeitado automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O schema só é interpretado quando um motor de consulta lê os arquivos, sem checagem no momento da escrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "O schema é validado por um serviço externo assim que o arquivo termina de ser gravado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API de origem muda o campo preco de inteiro (centavos) para string com símbolo de moeda, e o pipeline de ingestão não valida o schema na escrita. Qual é a consequência mais provável na tabela do lake?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os arquivos novos e antigos passam a coexistir na mesma pasta com tipos diferentes para a mesma coluna, sem aviso.",
                                "isCorrect": true
                            },
                            {
                                "text": "A escrita do arquivo novo falha de imediato, porque o Parquet impede tipos diferentes entre arquivos da mesma tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O catálogo de metadados atualiza sozinho o tipo da coluna assim que detecta o arquivo com o schema novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage renomeia automaticamente a coluna divergente para evitar conflito entre arquivos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel real de um catálogo como o Hive Metastore ou o Glue Data Catalog em relação ao schema de uma tabela no lake cru?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele reescreve automaticamente todos os arquivos antigos para o schema mais recente que foi registrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele roda uma checagem completa de tipos toda vez que um novo arquivo aparece na pasta monitorada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele impede fisicamente que qualquer arquivo com schema divergente seja gravado na pasta da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele guarda uma definição declarada do schema, consultada por leitores, sem validar a escrita dos arquivos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um motor de consulta lê todos os arquivos de uma partição usando uma opção de merge de schemas, e os arquivos têm uma coluna com tipos incompatíveis entre si (inteiro em um arquivo, string em outro). Qual é o risco mais provável desse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O motor sempre converte automaticamente o tipo mais antigo para o mais novo, sem qualquer erro ou aviso.",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura pode falhar com erro de tipo incompatível, ou gerar um resultado inesperado dependendo de como o merge resolve.",
                                "isCorrect": true
                            },
                            {
                                "text": "O merge de schemas ignora qualquer coluna com tipo divergente e a remove de todos os arquivos, mesmo dos compatíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "O merge de schemas é feito uma única vez e vira a nova definição oficial do catálogo automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a ausência de schema enforcement no momento da escrita é considerada mais arriscada do que um erro que quebra o job na hora?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Spark trata falhas de escrita como críticas e interrompe o cluster inteiro até a correção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque erros que quebram o job são sempre mais caros de corrigir do que dados incorretos em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o dado incorreto é gravado e consumido silenciosamente, e só aparece dias depois, longe da causa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a ausência de enforcement impede completamente a leitura da tabela até o schema ser corrigido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sem time travel nem versionamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Sem time travel nem versionamento\n\nDepois que um arquivo é sobrescrito ou apagado no lake cru, o estado anterior da tabela desaparece, a menos que alguém tenha guardado uma cópia manual antes. Não existe um histórico de versões da tabela, nenhum registro de \"como estavam os dados às 10h de ontem\" ou \"o que mudou entre a execução de segunda e a de terça\". Cada escrita simplesmente substitui o que existia, sem deixar rastro do estado anterior. Para qualquer pergunta que envolva o passado da tabela, auditar, reverter ou reproduzir, o lake cru não tem resposta embutida."
                    },
                    {
                        "type": "text",
                        "value": "## Auditoria: o que os dados diziam ontem\n\nUm número muda em um relatório executivo e alguém pergunta por quê. Em uma tabela com histórico, a resposta é uma consulta: comparar a versão de hoje com a de ontem e ver exatamente quais linhas mudaram. No lake cru, sem uma cópia de backup feita a propósito, essa pergunta não tem resposta: o estado de ontem já foi sobrescrito e não existe mais em lugar nenhum. A investigação vira reconstrução manual, cruzando logs de execução de pipeline, código-fonte versionado do job e sorte."
                    },
                    {
                        "type": "code",
                        "value": "# a operação roda, some com o estado anterior, e não há \"desfazer\"\n\ndf_corrigido.write.mode(\"overwrite\").parquet(\"s3://lake/vendas/data=2026-07-16/\")\n\n# depois desse comando:\n# - os arquivos antigos da partição já foram apagados\n# - se df_corrigido tiver um bug (um join errado, um filtro invertido),\n#   o único jeito de voltar atrás é ter um backup manual de antes do job\n# - sem esse backup, a versão anterior dos dados simplesmente não existe mais"
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que se quer fazer\",\"O lake cru oferece isso nativamente?\"],[\"Consultar a tabela como ela estava ontem\",\"Não, só com um backup manual feito antes\"],[\"Reverter um job que sobrescreveu dados errados\",\"Não, é preciso restaurar um backup ou reprocessar da fonte\"],[\"Comparar duas versões da tabela e ver o que mudou\",\"Não, não existe um conceito de versão da tabela\"],[\"Reproduzir o dado exato usado em um treino de ontem\",\"Não, a menos que os arquivos daquele momento tenham sido preservados\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um backup manual é uma cópia que alguém lembrou de fazer antes que fosse tarde demais; versionamento de verdade é uma garantia estrutural, que não depende de ninguém lembrar de nada."
                    },
                    {
                        "type": "text",
                        "value": "## Recuperar de um job que deu errado\n\nQuando um job com um bug sobrescreve uma partição crítica com dados errados, as opções no lake cru são limitadas. Se existir um backup recente (uma cópia manual dos arquivos, feita antes da execução), a recuperação é restaurar essa cópia. Se não existir, a alternativa é reprocessar a partição inteira a partir da fonte original, o que só funciona se a fonte ainda guardar aquele estado (muitos sistemas transacionais retêm só os dados atuais, não um histórico completo), e ainda assim exige refazer manualmente todo o caminho do pipeline até aquele ponto."
                    },
                    {
                        "type": "text",
                        "value": "## Reprodutibilidade em pipelines de ML e relatórios\n\nTreinar um modelo e depois querer saber exatamente quais dados entraram naquele treino é um requisito comum, seja para depurar um resultado estranho, seja para atender uma auditoria. Um relatório crítico tem a mesma exigência: reproduzir o número publicado deveria ser possível a partir dos dados que existiam no momento em que ele foi gerado. O lake cru não guarda essa referência: sem um mecanismo de versionamento, \"os dados que existiam naquele momento\" é uma pergunta sem resposta garantida, a não ser que alguém tenha preservado uma cópia à parte, por disciplina manual."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece com o estado anterior de uma partição depois de uma sobrescrita (overwrite) no lake cru, sem nenhum table format envolvido?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É movido para uma pasta de backup criada automaticamente pelo motor de escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Continua acessível por um período de retenção padrão do object storage, depois é removido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica arquivado automaticamente em uma área de versões antigas, acessível por consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desaparece, a menos que alguém tenha feito uma cópia manual dos arquivos antes da sobrescrita.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um número em um relatório executivo mudou em relação à semana passada, e ninguém sabe se foi uma correção legítima ou um bug em algum job. Sem um table format, o que falta ao lake cru para investigar isso rapidamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um cluster Spark maior, que permitiria reprocessar o histórico inteiro em bem menos tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma forma de consultar o estado da tabela antes da mudança e comparar com o estado atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um catálogo de metadados mais detalhado, com a descrição completa de cada coluna da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela particionada por data, que já organiza fisicamente os dados por dia de referência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O S3 e serviços equivalentes oferecem versionamento de objetos, que mantém versões anteriores de um mesmo arquivo quando ativado. Por que isso, sozinho, não entrega o mesmo que o time travel de uma tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o versionamento é por objeto, sem garantir um snapshot consistente do conjunto de arquivos da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o versionamento de objetos só funciona para arquivos menores do que os Parquet típicos de um lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o versionamento de objetos precisa ser reativado manualmente antes de cada escrita de um job Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o versionamento de objetos apaga fisicamente a versão anterior assim que uma nova é gravada ali.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job Spark com um filtro invertido sobrescreve, por engano, uma partição crítica com dados errados. Não existe backup recente dos arquivos, e o sistema de origem já não retém o estado de alguns dias atrás. Qual é a situação real desse time nesse momento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os dados podem ser recuperados consultando o histórico de versões da tabela, mantido automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados podem ser recuperados a partir do lineage do job, que reconstrói qualquer estado anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados da partição, no estado anterior ao erro, provavelmente não são mais recuperáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dados podem ser recuperados a partir do catálogo de metadados, que guarda os valores antigos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para reproduzir exatamente os dados usados no treino de um modelo de ontem, o que um lake cru sem versionamento exige da equipe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rodar o mesmo notebook de treino novamente, já que o resultado de um modelo é sempre determinístico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar o catálogo de metadados, que versiona o schema e os dados de cada tabela usada no treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada, porque o Spark grava automaticamente uma cópia dos dados de entrada de cada execução de treino.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter preservado, por disciplina própria, uma cópia à parte dos arquivos como estavam no momento do treino.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Por que isso motivou os table formats",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que isso motivou os table formats\n\nAs quatro últimas aulas mostraram quatro dores separadas: escritas concorrentes sem ACID, updates e deletes que exigem reescrever partições inteiras, schema drift sem enforcement e a ausência de time travel. São problemas diferentes na superfície, mas compartilham a mesma causa raiz: o lake cru trata uma tabela como uma pasta de arquivos independentes, sem nenhuma camada que amarre esse conjunto como uma unidade transacional, versionada e com um schema fiscalizado. Resolver as quatro dores ao mesmo tempo foi exatamente o que motivou o surgimento dos table formats abertos, Delta Lake, Apache Iceberg e Apache Hudi."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dor do lake cru\",\"Causa raiz\",\"O que um table format promete\"],[\"Sem ACID em escritas concorrentes\",\"Sobrescrita não é atômica em nível de tabela\",\"Commits atômicos, com isolamento entre leitor e escritor\"],[\"Update e delete difíceis\",\"Sem índice de linha para arquivo, Parquet imutável\",\"Operações de MERGE, UPDATE e DELETE declarativas\"],[\"Schema drift silencioso\",\"Nenhuma checagem no momento da escrita\",\"Schema enforcement, com evolução controlada\"],[\"Sem time travel\",\"Nenhum histórico de versões da tabela\",\"Snapshots versionados, consultáveis pelo tempo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Uma camada de metadados sobre os mesmos arquivos\n\nA ideia central, compartilhada pelos três table formats, é adicionar uma camada de metadados transacional por cima dos mesmos arquivos Parquet que já existiam no lake, sem trocar o formato de armazenamento nem mudar de storage. Essa camada registra, para cada versão da tabela, exatamente quais arquivos a compõem. Uma escrita deixa de significar \"apagar e recriar arquivos direto na pasta\" e passa a significar \"publicar uma nova entrada no log, apontando para os arquivos que valem a partir de agora\". Ler a tabela deixa de ser \"listar o que está na pasta\" e passa a ser \"consultar o log e abrir só os arquivos que a versão atual, ou uma versão passada, aponta\"."
                    },
                    {
                        "type": "code",
                        "value": "# ideia simplificada de um log transacional sobre a tabela\n# (cada formato implementa isso com seu próprio mecanismo; o princípio é este)\n\nversão 0: cria a tabela\n  arquivos ativos: [parte-1.parquet, parte-2.parquet]\n\nversão 1: INSERT de um novo lote de eventos\n  ação: adiciona parte-3.parquet\n  arquivos ativos: [parte-1.parquet, parte-2.parquet, parte-3.parquet]\n\nversão 2: MERGE que atualiza algumas linhas\n  ação: remove parte-1.parquet, adiciona parte-4.parquet (linhas corrigidas)\n  arquivos ativos: [parte-2.parquet, parte-3.parquet, parte-4.parquet]\n\n# consultar \"a tabela como estava na versão 1\" só exige reler o log até\n# aquele ponto: nenhum arquivo precisou ser fisicamente restaurado"
                    },
                    {
                        "type": "quote",
                        "value": "O dado não muda de lugar, nem de formato: o que muda é que passa a existir um controle transacional sobre quais arquivos formam a tabela em cada momento."
                    },
                    {
                        "type": "text",
                        "value": "## Continua sendo Parquet, continua sendo object storage\n\nAdotar um table format não significa abandonar o data lake construído até aqui. Os arquivos de dados continuam, na prática, sendo Parquet; o armazenamento continua sendo o mesmo object storage (S3, GCS ou ADLS); o Spark continua sendo um motor válido para ler e escrever. O que se adiciona é só a camada de metadados por cima, o log de transações, os manifests ou a timeline, dependendo do formato. É uma evolução aditiva do lake que já existe, não uma migração para uma tecnologia completamente nova."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nO próximo módulo detalha como cada um dos três table formats implementa essa ideia de camada transacional: o transaction log do Delta Lake (o `_delta_log`), os snapshots e o hidden partitioning do Apache Iceberg, e o modelo copy-on-write e merge-on-read do Apache Hudi. São implementações diferentes do mesmo princípio apresentado aqui, e entender as diferenças é o que permite escolher entre eles com critério."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que as quatro dores do data lake cru (falta de ACID, update e delete difíceis, schema drift, falta de time travel) têm em comum como causa raiz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todas decorrem do uso do Parquet como formato de arquivo, que seria substituído nos table formats.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas decorrem da ausência de uma camada que trate os arquivos como uma tabela transacional e versionada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todas decorrem de limitações do object storage, que seria substituído por um banco de dados tradicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todas decorrem da falta de capacidade de processamento do Spark para lidar com grandes volumes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a mudança central que um table format introduz em relação ao lake cru?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Move os dados do object storage para um banco relacional gerenciado, que passa a controlar as transações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui o Parquet por um novo formato de arquivo binário, otimizado para updates linha a linha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiciona uma camada de metadados que registra, versão a versão, quais arquivos compõem a tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remove a necessidade de particionamento, já que o novo formato indexa cada linha individualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time pergunta se adotar um table format como o Delta Lake significa abandonar o S3 e os arquivos Parquet que já existem no data lake atual. Qual é a resposta correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, os arquivos precisam ser convertidos para um formato binário incompatível com Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não totalmente: o Parquet continua, mas o Spark deixa de ser um motor compatível com a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, o table format substitui o object storage por um armazenamento proprietário próprio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: os dados continuam em Parquet no mesmo object storage, com uma camada de metadados a mais.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer, ao mesmo tempo, garantir que uma sobrescrita de partição seja atômica para quem lê a tabela e conseguir consultar como a tabela estava antes dessa sobrescrita. Qual capacidade, adicionada por um table format, atende as duas necessidades juntas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um log de transações com commits atômicos, que geram snapshots versionados e consultáveis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cache distribuído em memória, que mantém a última versão lida de cada partição sempre disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um particionamento bem mais granular, que reduz o volume de arquivos afetados por cada sobrescrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma compactação automática, que reorganiza todos os arquivos pequenos após cada escrita na tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Delta Lake, Apache Iceberg e Apache Hudi são especificações abertas, não um produto de um único fornecedor. Por que essa característica importa na decisão de adotar um table format?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque formatos abertos dispensam completamente qualquer necessidade de um catálogo de metadados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a mesma tabela pode ser lida e escrita por motores diferentes, sem prender a equipe a um fornecedor.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque formatos abertos são sempre muito mais rápidos do que qualquer implementação proprietária equivalente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque formatos abertos eliminam por completo a necessidade de versionar o schema da tabela.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Table formats abertos: Delta, Iceberg e Hudi",
        "aulas": [
            {
                "titulo": "O que um table format adiciona ao Parquet",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que um table format adiciona ao Parquet\n\nOs módulos anteriores desta trilha mostraram os limites do data lake cru: sem ACID, atualizar ou apagar uma linha significa reescrever arquivos na mão, não existe schema enforcement e não há como voltar a uma versão anterior da tabela. Um **table format** é a camada que resolve exatamente isso, sem trocar o formato dos dados. Os arquivos continuam sendo Parquet; o que muda é que passa a existir uma camada de metadados que sabe, a qualquer momento, quais arquivos compõem a tabela e em que estado ela está."
                    },
                    {
                        "type": "text",
                        "value": "## Uma pasta de arquivos não é uma tabela\n\nSem um table format, a definição de uma tabela é implícita: \"todos os arquivos Parquet dentro dessa pasta, agora\". Isso funciona até aparecer qualquer coisa que exija coordenação: um job grava novos arquivos enquanto outro lê a pasta e vê um estado parcial; dois jobs escrevem ao mesmo tempo e um sobrescreve o efeito do outro; um DELETE numa linha específica não tem como ser expresso, porque o Parquet é um arquivo imutável, não uma linha endereçável.\n\nUm table format resolve isso trocando \"liste os arquivos da pasta\" por \"leia os metadados e descubra exatamente quais arquivos, e quais versões deles, formam a tabela agora\"."
                    },
                    {
                        "type": "code",
                        "value": "Sem table format (pasta simples):\n\ns3://lake/vendas/\n  parte-001.parquet\n  parte-002.parquet\n  parte-003.parquet   <- um job ainda esta escrevendo este arquivo\n\n# a query faz um LIST na pasta e le o que encontrar;\n# nao ha garantia de que parte-003.parquet esta completo\n\nCom table format:\n\ns3://lake/vendas/\n  _delta_log/00000000000000000000.json   <- metadados: quais arquivos valem\n  parte-001.parquet\n  parte-002.parquet\n  parte-003.parquet\n\n# a query le o log primeiro e sabe exatamente quais arquivos\n# fazem parte da versao atual da tabela, mesmo com escrita em andamento"
                    },
                    {
                        "type": "text",
                        "value": "## O que a camada de metadados passa a garantir\n\n- **Transações ACID**: uma escrita só fica visível quando termina por completo; leitores nunca veem um estado parcial.\n- **Upsert e delete**: MERGE, UPDATE e DELETE funcionam em nível de linha, mesmo os arquivos Parquet por trás sendo imutáveis (o table format reescreve só os arquivos afetados).\n- **Time travel**: cada mudança gera uma nova versão registrada nos metadados, então dá para consultar a tabela como ela estava em um commit ou um instante anterior.\n- **Schema enforcement e evolution**: o schema da tabela fica registrado nos metadados, não é apenas inferido dos arquivos; adicionar ou alterar uma coluna é uma operação controlada.\n- **Listagem eficiente**: consultar os metadados custa muito menos do que fazer um LIST completo num bucket com milhões de objetos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Capacidade\",\"Parquet puro (pasta de arquivos)\",\"Parquet + table format\"],[\"Unidade de leitura\",\"Todos os arquivos que a query encontrar na pasta\",\"Só os arquivos listados na versão atual dos metadados\"],[\"Update/delete por linha\",\"Não existe; exige reescrever arquivos na mão\",\"MERGE/UPDATE/DELETE via metadados, sem processo manual\"],[\"Escrita concorrente\",\"Corrida entre jobs, sem garantia de isolamento\",\"Commit atômico, isolamento entre escritores\"],[\"Versão anterior da tabela\",\"Não existe, a menos que haja backup externo\",\"Time travel: consulta por versão ou timestamp\"],[\"Schema\",\"Inferido a cada leitura, pode divergir entre arquivos\",\"Registrado nos metadados, validado na escrita\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um table format não substitui o Parquet, ele o organiza: a mesma coleção de arquivos colunares ganha uma camada de metadados que a transforma de pasta em tabela transacional."
                    },
                    {
                        "type": "text",
                        "value": "## Três implementações, uma mesma ideia\n\nDelta Lake, Apache Iceberg e Apache Hudi são as três implementações abertas dessa ideia. Todas guardam os dados em Parquet (Hudi também aceita outros formatos internamente) e todas adicionam uma camada de metadados que registra versões, schema e os arquivos válidos em cada momento. A diferença está em como cada uma organiza esses metadados e em quais cenários cada design se sai melhor, o assunto das próximas aulas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um time grava arquivos Parquet diretamente numa pasta do object storage, sem nenhum table format por cima. Um segundo processo lê essa pasta inteira enquanto o primeiro ainda está gravando o último arquivo do lote. Qual é o risco direto desse cenário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O leitor pode enxergar um estado parcial da escrita, incluindo um arquivo do lote ainda incompleto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O object storage rejeita a leitura enquanto existir qualquer escrita em andamento na mesma pasta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Parquet identifica a escrita concorrente e pausa o job de leitura até a gravação terminar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os arquivos mais antigos da pasta são substituídos automaticamente pelos arquivos do novo lote.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela vive numa pasta com centenas de milhares de arquivos Parquet. Sem um table format, toda consulta precisa primeiro listar o conteúdo da pasta no object storage antes de decidir quais arquivos ler. Depois de adotar um table format, essa listagem completa deixa de ser necessária a cada consulta. O que torna isso possível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O table format move os arquivos pequenos para um índice separado, fora do alcance do comando LIST.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage passa a armazenar os arquivos da tabela num formato mais rápido de listar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os metadados já registram quais arquivos compõem a versão atual, sem depender de listar a pasta.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Parquet embutido no table format guarda um índice interno que substitui o LIST do storage.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa apagar todas as linhas de um cliente específico de uma tabela de pedidos, por exigência legal. Os dados estão em arquivos Parquet puros, numa pasta sem table format. Qual é a limitação real que essa equipe enfrenta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Parquet criptografa os dados por padrão, então apagar uma linha exige descriptografar o arquivo inteiro antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage não permite excluir arquivos com menos de 30 dias desde a última gravação registrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando DELETE do Spark funciona apenas em tabelas com menos de um milhão de linhas por arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Parquet é um arquivo imutável e não endereçável por linha, exigindo reescrever os arquivos afetados na mão.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de migrar uma tabela de Parquet puro para um table format, um analista pergunta o que mudou fisicamente nos dados armazenados no object storage. A resposta correta destaca que:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Os arquivos Parquet são convertidos para um formato binário proprietário do table format escolhido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados continuam em arquivos Parquet; o que se adiciona é uma camada de metadados por cima deles.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cada linha da tabela passa a ser armazenada como um objeto individual, em vez de agrupada em arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os arquivos Parquet são reorganizados num único arquivo grande, controlado inteiramente pelos metadados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro propõe escrever, junto com os arquivos Parquet, um arquivo manifest.json listando os arquivos válidos e a versão do schema, atualizado a cada escrita, como alternativa caseira a um table format. Antes mesmo de chegar em time travel, qual dificuldade essa abordagem enfrentaria primeiro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Garantir a atomicidade e o isolamento desse manifesto diante de múltiplos escritores concorrentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Encontrar uma biblioteca capaz de ler arquivos Parquet fora de um cluster Spark ou Hadoop.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter os arquivos Parquet existentes para um formato orientado a linha antes de gravar o manifesto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular o tamanho em bytes de cada arquivo Parquet, algo que o formato não expõe nativamente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Delta Lake: o transaction log",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Delta Lake: o transaction log\n\nDelta Lake é um table format de código aberto criado pela Databricks, hoje mantido pela Linux Foundation. Sua peça central é o **transaction log**, uma pasta chamada `_delta_log` que fica dentro do próprio diretório da tabela e registra, em ordem, cada mudança que a tabela já sofreu."
                    },
                    {
                        "type": "text",
                        "value": "## Commits em JSON, checkpoints em Parquet\n\nCada transação bem-sucedida grava um novo arquivo JSON no `_delta_log`, numerado sequencialmente: `00000000000000000000.json`, `00000000000000000001.json`, e assim por diante. Cada arquivo descreve uma lista de ações daquela transação, entre elas:\n\n- `add`: um arquivo Parquet passou a fazer parte da tabela.\n- `remove`: um arquivo Parquet deixou de fazer parte da tabela (não significa que ele foi apagado do storage na hora).\n- `metaData`: o schema ou outra propriedade da tabela mudou.\n- `commitInfo`: metadados sobre a operação em si (tipo de operação, quando aconteceu).\n\nA cada N commits (por padrão, a cada 10), o Delta grava um **checkpoint**: um arquivo Parquet com o estado consolidado da tabela até ali. Isso evita que um leitor precise reler milhares de arquivos JSON desde o commit zero só para saber o estado atual."
                    },
                    {
                        "type": "code",
                        "value": "s3://lake/vendas/_delta_log/\n  00000000000000000000.json   # commit 0: criacao da tabela (metaData + add)\n  00000000000000000001.json   # commit 1: novo lote de arquivos (add)\n  00000000000000000002.json   # commit 2: um MERGE (add de novos arquivos + remove dos antigos)\n  ...\n  00000000000000000010.checkpoint.parquet   # estado consolidado ate o commit 10\n  00000000000000000011.json\n\n# duas acoes (simplificadas) dentro do commit 2:\n# { \"remove\": { \"path\": \"parte-004.parquet\" } }\n# { \"add\": { \"path\": \"parte-011.parquet\", \"size\": 128340, \"stats\": \"...\" } }"
                    },
                    {
                        "type": "text",
                        "value": "## A tabela é o resultado do replay do log\n\nQuando um leitor abre uma tabela Delta, ele não faz um LIST na pasta de dados: ele lê o checkpoint mais recente e aplica, em ordem, os commits JSON gravados depois dele. O resultado desse replay é a lista exata de arquivos Parquet que valem para a versão atual, isolando por completo arquivos de versões antigas que ainda podem estar fisicamente no storage (um `remove` não apaga o arquivo, só o marca como fora da versão atual, até uma limpeza posterior).\n\nÉ esse mecanismo que garante ACID: uma transação só é considerada bem-sucedida quando seu arquivo JSON é gravado no log de forma atômica; até lá, nenhum leitor enxerga o efeito dela."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.appName(\"delta-exemplo\").getOrCreate()\n\n# escrita inicial\n(df_pedidos.write\n    .format(\"delta\")\n    .mode(\"overwrite\")\n    .save(\"s3://lake/gold/pedidos\"))\n\n# leitura da versao atual (le o checkpoint + commits mais recentes do _delta_log)\ndf_atual = spark.read.format(\"delta\").load(\"s3://lake/gold/pedidos\")\n\n# leitura de uma versao anterior, so trocando a opcao de leitura\ndf_v5 = (spark.read.format(\"delta\")\n    .option(\"versionAsOf\", 5)\n    .load(\"s3://lake/gold/pedidos\"))"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação no log\",\"O que registra\",\"Quando aparece\"],[\"add\",\"Um arquivo Parquet passou a fazer parte da versão atual\",\"Em inserções, MERGE, COPY INTO, compactações\"],[\"remove\",\"Um arquivo Parquet saiu da versão atual (permanece no storage até uma limpeza)\",\"Em DELETE, UPDATE, MERGE, OPTIMIZE\"],[\"metaData\",\"O schema ou uma propriedade da tabela mudou\",\"Em ALTER TABLE ou evolução de schema\"],[\"commitInfo\",\"Detalhes sobre a operação que gerou o commit\",\"Em toda transação, sem exceção\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O estado de uma tabela Delta nunca é \"o que está na pasta agora\"; é o resultado de aplicar, em ordem, os commits registrados no _delta_log."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um engenheiro abre pela primeira vez a pasta de uma tabela Delta no object storage e encontra, além dos arquivos Parquet, uma subpasta chamada _delta_log cheia de arquivos .json numerados. O que essa subpasta representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um backup automático dos arquivos Parquet, gerado a cada gravação, para recuperação em caso de falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "O histórico de commits da tabela, que define quais arquivos Parquet valem para cada versão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cache de consultas recentes, mantido para acelerar leituras repetidas da mesma tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os logs de erro do cluster Spark que gravou os arquivos Parquet mais recentes da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela Delta acumulou 400 commits desde a criação. Um novo leitor abre a tabela e obtém a lista de arquivos válidos em poucos milissegundos, sem processar os 400 arquivos JSON um a um. O que torna isso possível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Delta mantém a lista de arquivos válidos em cache na memória do cluster entre sessões diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os arquivos JSON mais antigos são apagados automaticamente depois de alguns dias, restando poucos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage indexa o conteúdo de cada arquivo JSON, permitindo buscas diretas sem abri-los.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um checkpoint em Parquet consolida o estado até um certo commit, evitando reler o log inteiro.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma operação de DELETE numa tabela Delta, o commit gerado inclui ações remove para os arquivos Parquet que continham as linhas apagadas. Momentos depois, um analista percebe que esses arquivos Parquet ainda existem fisicamente no object storage. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A ação remove tira o arquivo da versão atual da tabela, mas não o apaga do storage nesse momento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O comando DELETE do Delta Lake só remove metadados; os dados em si nunca saem do storage.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage tem um atraso de propagação de até 24 horas para refletir exclusões de arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A operação falhou silenciosamente e o commit remove foi gravado no log sem ser aplicado de fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois jobs tentam gravar, ao mesmo tempo, o mesmo número de sequência do log de uma tabela Delta (ambos disputando, por exemplo, o commit 00000000000000000042.json). O que garante que apenas um deles tenha sucesso, preservando o ACID da tabela?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Spark elege um único executor como responsável por gravar em todas as tabelas Delta do cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois commits são aceitos e mesclados automaticamente numa única versão consolidada pelo Delta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A escrita atômica do arquivo de log naquele número de sequência, garantida pelo storage subjacente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Delta bloqueia a tabela inteira para escrita assim que detecta mais de um job ativo simultâneo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de plantão precisa entender o que aconteceu numa tabela Delta às 3h da manhã, quando um job de MERGE parece ter corrompido dados. Em vez de recorrer a logs de aplicação externos, ela lê diretamente os arquivos JSON do _delta_log gerados naquele horário. O que essa leitura permite reconstruir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O plano de execução físico que o Spark usou internamente para paralelizar o MERGE entre executores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quais arquivos Parquet entraram e saíram da tabela naquele commit, e detalhes da operação.",
                                "isCorrect": true
                            },
                            {
                                "text": "O uso de CPU e memória do cluster durante a execução do MERGE, registrado minuto a minuto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O texto exato da consulta SQL ou do código PySpark que deu origem ao job, com as variáveis usadas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Apache Iceberg: snapshots e hidden partitioning",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Apache Iceberg: snapshots e hidden partitioning\n\nApache Iceberg é um table format de código aberto criado originalmente na Netflix e hoje mantido pela Apache Software Foundation, com adoção forte em engines como Spark, Trino, Flink, e suporte nativo em plataformas como Snowflake. Assim como o Delta Lake, o Iceberg guarda os dados em arquivos Parquet (também aceita ORC e Avro) e adiciona uma camada de metadados por cima. A diferença está em como essa camada é organizada: em vez de um log sequencial de commits, o Iceberg usa uma estrutura de metadados em camadas, pensada para tabelas com um número muito grande de arquivos e partições."
                    },
                    {
                        "type": "text",
                        "value": "## Três camadas de metadados\n\n- **Arquivo de metadados** (`metadata.json`): o ponto de entrada da tabela. Guarda o schema atual, o histórico de snapshots e qual snapshot é o atual.\n- **Lista de manifests** (manifest list): por snapshot, um arquivo que lista quais arquivos de manifest compõem aquele snapshot, com estatísticas resumidas de cada um.\n- **Arquivos de manifest** (manifest files): cada um lista um conjunto de arquivos de dados Parquet, com estatísticas por arquivo (contagem de linhas, mínimo e máximo por coluna) usadas para podar a leitura sem abrir os arquivos.\n\nUma consulta percorre essas camadas de cima para baixo: lê o `metadata.json`, encontra o snapshot atual, lê a lista de manifests dele, e só então decide quais arquivos de manifest, e por fim quais arquivos de dados, realmente precisa abrir."
                    },
                    {
                        "type": "code",
                        "value": "lake/vendas/metadata/\n  v1.metadata.json\n  v2.metadata.json              # cada escrita gera uma nova versao do metadata\n  snap-4001-1-a1b2.avro         # manifest list do snapshot 4001\n  snap-4002-1-c3d4.avro         # manifest list do snapshot 4002 (snapshot atual)\n  manifest-0001.avro            # arquivo de manifest: lista arquivos de dados + estatisticas\n  manifest-0002.avro\nlake/vendas/data/\n  regiao=sul/parte-001.parquet\n  regiao=sul/parte-002.parquet\n  regiao=norte/parte-001.parquet\n\n# metadata.json aponta para o snapshot atual (\"current-snapshot-id\": 4002)\n# o snapshot 4002 aponta para sua manifest list\n# a manifest list aponta para os arquivos de manifest validos naquele snapshot"
                    },
                    {
                        "type": "text",
                        "value": "## Snapshots e time travel\n\nToda escrita no Iceberg (um INSERT, um MERGE, uma compactação) cria um novo **snapshot**: uma foto imutável do estado da tabela naquele momento, com seu próprio conjunto de manifests. O `metadata.json` guarda o histórico de snapshots já criados e aponta para qual deles é o atual. Como snapshots antigos continuam referenciados nos metadados (até serem expirados por uma rotina de limpeza), consultar a tabela como ela estava num snapshot anterior é só uma questão de apontar para esse snapshot, sem reprocessar nada."
                    },
                    {
                        "type": "text",
                        "value": "## Hidden partitioning\n\nEm particionamento no estilo Hive, a tabela é organizada em pastas como `dt=2026-07-01/`, e o valor da partição é derivado manualmente pelo pipeline de escrita, geralmente extraindo ano, mês e dia de uma coluna de timestamp. Quem consulta a tabela precisa conhecer esse detalhe: filtrar diretamente pela coluna de timestamp original, sem repetir a mesma transformação usada na escrita, faz o motor de consulta perder o corte por partição.\n\nO Iceberg guarda a transformação de particionamento (por exemplo, `days(evento_ts)`) como parte do schema da tabela, não como uma coluna separada. O motor de consulta aplica essa transformação sozinho a partir do predicado na coluna original, então filtrar por `evento_ts` continua aproveitando o corte por partição, sem quem escreve a consulta precisar saber como a tabela é particionada. Isso também viabiliza a **evolução de particionamento**: mudar o esquema de partições dali para frente, sem reescrever os dados já gravados com o esquema antigo."
                    },
                    {
                        "type": "code",
                        "value": "-- criacao da tabela: o particionamento e uma transformacao sobre a coluna, nao uma coluna a parte\nCREATE TABLE vendas (\n    id BIGINT,\n    evento_ts TIMESTAMP,\n    valor DECIMAL(10,2)\n)\nUSING iceberg\nPARTITIONED BY (days(evento_ts));\n\n-- quem consulta filtra a coluna original, sem conhecer o esquema de particionamento\nSELECT * FROM vendas WHERE evento_ts >= TIMESTAMP '2026-07-01';\n-- o motor deriva sozinho quais particoes (dias) satisfazem o filtro e poda o restante\n\n-- time travel por snapshot ou por timestamp\nSELECT * FROM vendas VERSION AS OF 4001;\nSELECT * FROM vendas TIMESTAMP AS OF '2026-07-01 00:00:00';"
                    },
                    {
                        "type": "quote",
                        "value": "No Iceberg, particionar é um detalhe de como a tabela é organizada por baixo, não um contrato que quem escreve a consulta precisa conhecer e repetir."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe está avaliando o Apache Iceberg e lê que ele organiza os metadados em camadas: um arquivo de metadados, listas de manifests e arquivos de manifest. Qual é o papel do arquivo de metadados (metadata.json) nessa estrutura?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Listar, um a um, todos os arquivos Parquet de dados que já existiram na tabela, incluindo os expirados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armazenar fisicamente as estatísticas de cada coluna, substituindo os metadados internos do Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser o ponto de entrada da tabela, apontando para o snapshot atual e para o histórico de snapshots.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar a poda de partições em tempo de consulta, antes de qualquer arquivo de manifest ser lido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela Iceberg particionada por days(evento_ts) recebe uma consulta com o filtro WHERE evento_ts >= '2026-07-01', sem qualquer referência a uma coluna de partição. Ainda assim, o motor de consulta consegue ignorar arquivos de dias anteriores a essa data. O que explica esse comportamento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A transformação de particionamento fica registrada no schema da tabela, e o motor a aplica ao predicado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Iceberg reescreve toda consulta recebida, adicionando automaticamente um filtro explícito por partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark testa o filtro contra todos os arquivos de dados antes de decidir quais partições existem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna evento_ts é convertida em coluna de partição física assim que a consulta é submetida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time migra uma tabela do particionamento estilo Hive (pasta dt=AAAA-MM-DD) para o hidden partitioning do Iceberg. Antes da migração, todo relatório precisava incluir um filtro explícito na coluna derivada dt, além do filtro na coluna de timestamp original, para não perder o corte por partição. Depois da migração, qual mudança prática os autores dos relatórios percebem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Passam a precisar declarar manualmente, em cada consulta, qual transformação de particionamento a tabela usa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixam de poder filtrar pela coluna de timestamp original, usando só a nova coluna de partição oculta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisam recriar todos os relatórios do zero, já que o hidden partitioning não é compatível com SQL padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Passam a filtrar só pela coluna de timestamp original e continuam aproveitando o corte por partição.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela Iceberg passa por um MERGE que atualiza um pequeno conjunto de linhas. Depois da operação, um analista consulta a tabela com VERSION AS OF apontando para o snapshot imediatamente anterior ao MERGE. O que essa consulta retorna?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um erro, porque snapshots anteriores ao mais recente deixam de ficar acessíveis depois de um MERGE.",
                                "isCorrect": false
                            },
                            {
                                "text": "O estado exato da tabela antes do MERGE, incluindo as linhas que a operação alterou depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "O estado atual da tabela, já que VERSION AS OF só se aplica a operações de leitura, não de escrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas as linhas que o MERGE alterou, para permitir comparar o antes e o depois de cada uma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela Iceberg tem bilhões de linhas e milhares de arquivos de dados. Uma consulta filtra por um intervalo pequeno de datas numa coluna usada no particionamento. Mesmo assim, o motor de consulta gasta um tempo perceptível só decidindo quais arquivos abrir, antes de ler qualquer dado de fato. Onde esse custo de decisão é pago?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "No Parquet, que precisa descompactar o rodapé de cada um dos milhares de arquivos de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "No object storage, que precisa executar um LIST completo da pasta de dados a cada consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na leitura da manifest list e dos manifests do snapshot, para decidir quais arquivos abrir.",
                                "isCorrect": true
                            },
                            {
                                "text": "No catálogo externo (Hive Metastore ou Glue), que reconstrói o schema da tabela a cada consulta.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Apache Hudi: copy-on-write x merge-on-read",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Apache Hudi: copy-on-write x merge-on-read\n\nApache Hudi (Hadoop Upserts Deletes and Incrementals) nasceu na Uber e hoje é um projeto da Apache Software Foundation. Diferente do Delta Lake e do Iceberg, que começaram voltados a cargas em lote e passaram a incorporar upsert e streaming ao longo do tempo, o Hudi foi desenhado desde o início em torno de upserts e ingestão incremental: o cenário de atualizar continuamente uma tabela grande com um fluxo de mudanças, típico de CDC (change data capture) e de pipelines quase em tempo real.\n\nEssa origem aparece na decisão mais importante que o Hudi expõe ao criar uma tabela: o **tipo de tabela**, copy-on-write ou merge-on-read, que define como as atualizações são fisicamente aplicadas."
                    },
                    {
                        "type": "text",
                        "value": "## Copy-on-write (COW)\n\nEm copy-on-write, cada atualização reescreve por completo o arquivo Parquet (o \"base file\") que contém as linhas afetadas: lê o arquivo original, aplica a mudança em memória e grava um novo arquivo com a versão atualizada, marcando o antigo como obsoleto. Não existem arquivos intermediários: a qualquer momento, a tabela é só um conjunto de arquivos Parquet comuns.\n\nO resultado é uma leitura simples e rápida, igual à de qualquer tabela Parquet, porque não há nada para mesclar em tempo de consulta. O custo fica na escrita: atualizar poucas linhas de um arquivo grande significa reescrever o arquivo inteiro, o que pesa quando as atualizações são frequentes e o arquivo é grande."
                    },
                    {
                        "type": "code",
                        "value": "Copy-on-write:\n\nversao 1:  base-file-001.parquet  [id=1,valor=100] [id=2,valor=200] [id=3,valor=300]\n\n# chega uma atualizacao: id=2 passa a valer 250\n# o arquivo inteiro e reescrito com a linha alterada\n\nversao 2:  base-file-002.parquet  [id=1,valor=100] [id=2,valor=250] [id=3,valor=300]\n           base-file-001.parquet  (obsoleto, removido depois por uma limpeza)\n\n# leitura: sempre le direto o base file mais recente, sem nenhuma mesclagem"
                    },
                    {
                        "type": "text",
                        "value": "## Merge-on-read (MOR)\n\nEm merge-on-read, uma atualização não reescreve o arquivo base na hora: grava só a mudança num **arquivo de log** (delta), associado àquele grupo de arquivos. A leitura é quem faz o trabalho de juntar o base file com os logs pendentes para montar o valor atual de cada linha, um custo pago em tempo de consulta.\n\nPeriodicamente, uma operação de **compactação** aplica os logs acumulados sobre o base file e gera um novo base file consolidado. O Hudi ainda oferece duas formas de ler uma tabela MOR: uma consulta **read-optimized**, que lê só os base files (mais rápida, pode não refletir as atualizações mais recentes ainda não compactadas), e uma consulta **snapshot**, que mescla base e logs (mais lenta, sempre atual)."
                    },
                    {
                        "type": "code",
                        "value": "Merge-on-read:\n\nbase-file-001.parquet   [id=1,valor=100] [id=2,valor=200] [id=3,valor=300]\nlog-001.log             [id=2,valor=250]     # delta: so a mudanca, gravada rapido\n\n# consulta read-optimized: le so o base file -> ainda ve id=2 com valor=200\n# consulta snapshot: mescla base + log em tempo de leitura -> ve id=2 com valor=250\n\n# apos a compactacao periodica:\nbase-file-002.parquet   [id=1,valor=100] [id=2,valor=250] [id=3,valor=300]\n# log-001.log deixa de ser necessario"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Copy-on-write\",\"Merge-on-read\"],[\"Custo da escrita\",\"Alto: reescreve o arquivo base inteiro a cada atualização\",\"Baixo: só acrescenta um arquivo de log com a mudança\"],[\"Custo da leitura\",\"Baixo: lê arquivos Parquet comuns, sem mesclar nada\",\"Maior na consulta snapshot: mescla base e logs em tempo real\"],[\"Frescor dos dados\",\"Sempre atual, porque a escrita já consolida tudo\",\"Depende do modo de leitura: read-optimized pode atrasar\"],[\"Cenário mais adequado\",\"Leitura frequente, escrita menos frequente\",\"Escrita frequente ou streaming, tolerando mesclar na leitura\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Copy-on-write paga o custo de mesclar no momento da escrita; merge-on-read adia esse custo para o momento da leitura. Nenhum dos dois é superior, é uma troca entre latência de escrita e latência de leitura."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela Hudi do tipo copy-on-write recebe uma atualização que altera 10 linhas dentro de um arquivo Parquet de 2 milhões de linhas. O que o Hudi faz fisicamente para aplicar essa mudança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Grava apenas as 10 linhas alteradas num arquivo separado, deixando o arquivo original intacto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Marca as 10 linhas como deletadas e insere 10 novas linhas ao final do mesmo arquivo Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloqueia a tabela inteira para leitura até que uma compactação seja disparada manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reescreve o arquivo Parquet inteiro, incorporando a mudança, e substitui o arquivo anterior.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de CDC aplica milhares de pequenas atualizações por minuto numa tabela Hudi, cada uma afetando poucas linhas espalhadas por arquivos grandes. A equipe percebe que o tipo copy-on-write está gerando um custo de escrita alto, porque cada atualização reescreve arquivos inteiros. Qual mudança reduz diretamente esse custo, assumindo que a equipe aceita pagar parte dele na leitura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Migrar a tabela para merge-on-read, gravando as mudanças em log em vez de reescrever o base file.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o número de partições da tabela, para cada atualização afetar um volume menor de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a frequência das atualizações para uma vez por hora, acumulando mudanças antes de aplicá-las.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o formato dos arquivos base de Parquet para CSV, que sofre menos com reescritas frequentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tabela Hudi merge-on-read, uma consulta read-optimized é executada minutos depois de uma atualização que ainda não foi compactada. O que essa consulta retorna?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um erro, porque consultas read-optimized exigem que toda atualização pendente já tenha sido compactada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado da mesclagem entre o base file e os arquivos de log, igual a uma consulta snapshot faria.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conteúdo dos base files, possivelmente sem refletir a atualização que ainda está só no log.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas as linhas alteradas pela atualização mais recente, ignorando o restante da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe compara os dois tipos de tabela do Hudi para um caso de uso de leitura analítica pesada, feita várias vezes ao dia por um data warehouse, com atualizações relativamente raras na origem. Qual tipo tende a servir melhor esse padrão de uso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Merge-on-read, porque toda consulta se beneficia de mesclar os logs mais recentes com o base file.",
                                "isCorrect": false
                            },
                            {
                                "text": "Copy-on-write, porque a leitura é direta sobre Parquet e as atualizações raras não pesam na escrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Merge-on-read, porque compactações automáticas eliminam qualquer diferença de custo na leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Copy-on-write, porque esse tipo impede consultas concorrentes durante qualquer atualização da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela Hudi merge-on-read acumula arquivos de log por semanas, sem que a rotina de compactação seja executada. Além do crescimento no espaço ocupado, qual efeito colateral direto essa falta de compactação tem sobre consultas snapshot feitas nesse período?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada consulta snapshot precisa mesclar um volume cada vez maior de logs com o base file, ficando mais lenta.",
                                "isCorrect": true
                            },
                            {
                                "text": "As consultas snapshot passam a retornar dados desatualizados, já que os logs deixam de ser considerados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O catálogo da tabela perde a referência ao schema atual, obrigando a redeclarar as colunas na mão.",
                                "isCorrect": false
                            },
                            {
                                "text": "As consultas read-optimized param de funcionar, já que dependem diretamente da compactação recente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Comparando os três e como escolher",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Comparando os três e como escolher\n\nDelta Lake, Apache Iceberg e Apache Hudi resolvem o mesmo problema central: transformar uma coleção de arquivos Parquet numa tabela com ACID, upsert, time travel e schema enforcement. As três são projetos abertos, ativamente desenvolvidos, com casos reais de uso em produção em escala. A diferença não está em qual delas \"faz mais\", e sim na origem, no ecossistema em que cada uma nasceu mais forte e em algumas decisões de design que ainda pesam na escolha, mesmo com os três projetos convergindo em recursos ano após ano."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Delta Lake\",\"Apache Iceberg\",\"Apache Hudi\"],[\"Origem\",\"Databricks (hoje Linux Foundation)\",\"Netflix (hoje Apache Software Foundation)\",\"Uber (hoje Apache Software Foundation)\"],[\"Estrutura de metadados\",\"Log sequencial de commits (_delta_log)\",\"Camadas: metadata, manifest list, manifests\",\"Timeline de commits + arquivos base e log\"],[\"Foco original de design\",\"Confiabilidade de pipelines em lote no Spark\",\"Interoperabilidade entre múltiplos engines\",\"Upsert e ingestão incremental/streaming\"],[\"Ecossistema historicamente mais forte\",\"Spark e Databricks\",\"Trino, Spark, Flink, Snowflake\",\"Spark, com forte uso em CDC e streaming\"],[\"Particionamento\",\"Estilo Hive, colunas de partição explícitas\",\"Hidden partitioning, com evolução de partições\",\"Estilo Hive, colunas de partição explícitas\"],[\"Tipos de tabela para upsert\",\"Um único formato, MERGE via log\",\"Um único formato, MERGE via snapshots\",\"Dois tipos: copy-on-write e merge-on-read\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Os três estão convergindo\n\nCada formato nasceu mais forte num nicho: o Delta cresceu colado ao Spark e ao Databricks; o Iceberg nasceu pensando em múltiplos engines lendo a mesma tabela sem depender de um só fornecedor; o Hudi nasceu resolvendo upsert em escala antes dos outros dois considerarem isso um requisito central. Anos depois, essa distinção ficou mais estreita: os três suportam ACID, upsert, time travel e schema evolution; os três têm conectores para os principais engines do mercado; e já existem camadas de interoperabilidade e projetos de tradução de metadados que permitem ler uma tabela escrita num formato através de outro, sem duplicar os dados.\n\nIsso não significa que a escolha deixou de importar, só que ela pesa mais no ecossistema ao redor da tabela do que numa lista de recursos que, hoje, os três compartilham em boa parte."
                    },
                    {
                        "type": "text",
                        "value": "## O que pesa de fato na escolha\n\n- **Engine principal**: se o time opera majoritariamente em Databricks, o Delta tem a integração mais madura. Se o ambiente é multi-engine (Trino, Spark, Flink lendo a mesma tabela), o histórico do Iceberg em interoperabilidade pesa a favor.\n- **Padrão de escrita**: cargas em lote, com atualizações menos frequentes, funcionam bem em qualquer um dos três. Upsert intenso ou CDC contínuo é onde o merge-on-read do Hudi tem uma vantagem mais clara.\n- **Catálogo já em uso**: um catálogo específico (Unity Catalog, Glue, um catálogo REST do Iceberg) pode já favorecer um formato pela integração existente.\n- **Conhecimento da equipe**: um time que já domina um dos três reduz risco operacional escolhendo o que conhece, mesmo quando outro formato teria uma vantagem técnica pequena no papel.\n\nNenhum desses fatores aponta para uma resposta universal. A pergunta certa não é \"qual é o melhor table format\", e sim \"qual se encaixa melhor no engine, na carga de trabalho e na equipe que já existem\"."
                    },
                    {
                        "type": "code",
                        "value": "Pergunta 1: o ambiente e fortemente Databricks/Spark?\n  sim -> Delta Lake costuma ser o caminho de menor atrito\n  nao -> proxima pergunta\n\nPergunta 2: multiplos engines (Trino, Flink, Spark, Snowflake) precisam ler a MESMA tabela?\n  sim -> Iceberg tem o historico mais forte em interoperabilidade\n  nao -> proxima pergunta\n\nPergunta 3: a carga e dominada por upsert intenso ou CDC continuo?\n  sim -> Hudi (merge-on-read) tende a se sair melhor\n  nao -> qualquer um dos tres atende; decida pelo ecossistema e pela equipe"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\",\"Formato que tende a se encaixar melhor\"],[\"Lakehouse construído em torno do Databricks\",\"Delta Lake\"],[\"Vários engines (Trino, Flink, Spark) lendo a mesma tabela\",\"Apache Iceberg\"],[\"CDC contínuo de um banco transacional, upserts frequentes\",\"Apache Hudi (merge-on-read)\"],[\"Time sem preferência prévia, carga majoritariamente em lote\",\"Qualquer um dos três, decidir pelo ecossistema já em uso\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O que importa primeiro não é qual table format é tecnicamente superior, é que os três resolvem o mesmo problema central; a escolha certa é a que se encaixa no engine, na carga de trabalho e na equipe que já existem."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe pergunta qual dos três table formats abertos (Delta Lake, Iceberg, Hudi) resolve o problema central de transformar arquivos Parquet numa tabela transacional. Qual é a resposta tecnicamente correta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Só o Delta Lake resolve isso; Iceberg e Hudi lidam com outros problemas, sem sobreposição entre eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os três resolvem o mesmo problema central; a diferença está na origem, no ecossistema e no design.",
                                "isCorrect": true
                            },
                            {
                                "text": "É preciso combinar os três formatos numa única tabela para obter transações ACID de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o Iceberg resolve isso de fato; Delta e Hudi são variações voltadas a nichos bem específicos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados opera um ambiente com Trino, Flink e Spark, cada engine lendo e escrevendo nas mesmas tabelas, sem um fornecedor único concentrando o processamento. Historicamente, qual formato construiu a reputação mais forte para esse tipo de ambiente multi-engine?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Delta Lake, por ter sido desenhado desde o início para múltiplos fornecedores de engine simultâneos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Hudi, porque o merge-on-read foi criado especificamente para simplificar a leitura entre engines diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos três é pensado para múltiplos engines; a equipe precisaria adotar outra arquitetura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apache Iceberg, que nasceu com foco em interoperabilidade entre múltiplos engines na mesma tabela.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de CDC replica, em tempo quase real, mudanças de um banco transacional para o lakehouse, gerando um volume alto e constante de upserts pequenos. A equipe quer o formato cujo design histórico mais se encaixa nesse padrão de escrita, sem descartar que os outros dois também suportam upsert. Qual escolha melhor reflete isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apache Hudi, cujo merge-on-read foi desenhado justamente para escrita incremental frequente como essa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apache Iceberg, porque hidden partitioning elimina o custo de upserts frequentes em qualquer volume.",
                                "isCorrect": false
                            },
                            {
                                "text": "Delta Lake, porque o _delta_log foi criado especificamente para registrar eventos de CDC em tempo real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os três table formats tratam upsert como um recurso secundário, adicionado por pressão de mercado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está decidindo entre os três formatos e um dos argumentos levantados é: \"os três já suportam ACID, upsert, time travel e schema evolution, então a escolha de recursos praticamente não importa mais\". Qual é a conclusão mais correta sobre esse argumento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É totalmente falso: apenas um dos três formatos suporta essas quatro capacidades ao mesmo tempo hoje.",
                                "isCorrect": false
                            },
                            {
                                "text": "É totalmente verdadeiro, e por isso não existe mais nenhum critério técnico razoável para escolher.",
                                "isCorrect": false
                            },
                            {
                                "text": "É parcialmente verdadeiro: os recursos convergiram bastante, mas o ecossistema ao redor ainda pesa.",
                                "isCorrect": true
                            },
                            {
                                "text": "É irrelevante, porque nenhum dos três formatos é usado em produção em escala atualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto justifica a escolha de um table format assim: \"vamos usar o Iceberg porque é o mais moderno dos três\", sem citar o engine principal do time, o padrão de escrita das cargas nem o catálogo já em uso. Qual é o problema mais direto nesse critério de decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Iceberg não é compatível com nenhum engine além do Trino, então a justificativa está tecnicamente errada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele ignora os fatores que de fato diferenciam os três formatos hoje: engine, escrita e catálogo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não existe problema: entre formatos com recursos parecidos, o mais recente é sempre a escolha certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O critério está correto, mas deveria ter escolhido o Hudi, já que é sempre o mais recente dos três.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - O lakehouse",
        "aulas": [
            {
                "titulo": "O que é a arquitetura lakehouse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é a arquitetura lakehouse\n\nNos módulos anteriores desta trilha, dois mundos ficaram bem definidos. De um lado, o data warehouse: caro por volume, rígido no schema, mas com ACID, desempenho de consulta e SQL maduro. Do outro, o data lake: barato, flexível, guarda qualquer formato, mas cru, sem transações, sem garantia de que uma leitura concorrente veja um estado consistente. A arquitetura lakehouse nasce de uma pergunta direta: por que manter os dois mundos separados, copiando dado de um para o outro, se dá para ter as garantias do warehouse direto em cima do lake?"
                    },
                    {
                        "type": "text",
                        "value": "## A ideia central\n\nUm lakehouse não é um produto novo que substitui o lake: é uma camada de garantias (transações ACID, schema, desempenho de consulta) aplicada diretamente sobre arquivos que continuam vivendo no mesmo object storage barato. Em vez de manter uma cópia dos dados no lake para ciência de dados e outra, transformada e duplicada, num warehouse para BI, o lakehouse mantém **uma única cópia dos dados**, organizada em tabelas com transações, e deixa cada motor (SQL engine, Spark, uma ferramenta de BI) ler essa mesma cópia do jeito que precisar."
                    },
                    {
                        "type": "code",
                        "value": "Arquitetura em dois sistemas (antes do lakehouse):\n\n  Fontes  -->  Data Lake  --ETL-->  Data Warehouse\n               (Parquet)             (copia estruturada)\n                  |                         |\n              Data Science               BI / SQL\n              (le o lake cru)          (le o warehouse)\n\n  duas copias dos dados, duas linhas de pipeline, risco de a copia\n  do warehouse ficar desatualizada em relacao ao lake\n\n\nLakehouse (uma copia, varios motores por cima):\n\n  Fontes  -->  Object Storage + table format (Delta / Iceberg / Hudi)\n                              |\n              +---------------+----------------+\n              |                |                |\n          SQL engine      Spark / pandas   Ferramenta de BI\n          (Trino etc)      (ML, ETL)        (dashboards)\n\n  uma copia dos dados, com ACID, schema e desempenho de consulta;\n  cada motor le a mesma tabela, do jeito que precisar"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Lake + warehouse separados\",\"Lakehouse\"],[\"Cópias dos dados\",\"Pelo menos duas (lake cru e warehouse transformado)\",\"Uma única cópia, organizada em tabelas\"],[\"Acesso para BI\",\"Só via warehouse, depois do ETL terminar\",\"Direto sobre as tabelas do lakehouse\"],[\"Acesso para ML e ciência de dados\",\"Direto no lake, sem ACID nem schema garantido\",\"Nas mesmas tabelas, agora com ACID e schema\"],[\"Consistência entre times\",\"Depende do ETL estar em dia\",\"Um único estado, sempre consistente\"],[\"Custo de armazenamento\",\"Duplicado entre os dois sistemas\",\"O do object storage, sem duplicar\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O lakehouse não troca o lake por outra coisa: aplica, direto sobre os arquivos que já estão no object storage, as garantias que antes só um warehouse oferecia."
                    },
                    {
                        "type": "text",
                        "value": "## O papel do table format\n\nNada disso funciona só com Parquet solto num diretório. O que transforma um amontoado de arquivos numa tabela com transações, schema e histórico é exatamente o table format aberto visto no módulo anterior: Delta Lake, Apache Iceberg ou Apache Hudi. É essa camada de metadados que registra cada escrita como uma transação atômica, guarda o schema esperado da tabela e mantém o histórico de versões. Sem ela, o que existe é um data lake com arquivos Parquet, de volta aos problemas do módulo 3: sem ACID, sem upsert simples, sem time travel."
                    },
                    {
                        "type": "text",
                        "value": "## Um só lugar para BI e ML\n\nEssa é a promessa prática do lakehouse: acabar com a escolha entre \"otimizado para SQL\" e \"flexível para ciência de dados\". As mesmas tabelas, com as mesmas garantias, atendem um dashboard de BI e um notebook de machine learning. Mas essa unificação não acontece de graça: ela depende de organizar os dados em camadas, cada uma com um papel e um nível de qualidade diferente. É o que a próxima aula detalha, com a arquitetura medalhão."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa mantém um data lake para ciência de dados e um data warehouse separado para BI, com um ETL noturno copiando e transformando os dados de um para o outro. Times reclamam que os números do BI às vezes ficam um dia desatualizados em relação ao que a ciência de dados já vê no lake. Qual é a ideia central de adotar uma arquitetura lakehouse para esse cenário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir o intervalo do ETL noturno entre o lake e o warehouse, para os dois lados sincronizarem com menos atraso entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar as garantias do warehouse, como ACID e desempenho, direto sobre os arquivos do lake, numa única cópia dos dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir o data lake por um data warehouse tradicional, encerrando o uso de object storage barato pela equipe de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter lake e warehouse como sistemas separados, mas compartilhando um único catálogo de metadados entre os dois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados grava os eventos brutos em arquivos Parquet dentro de um bucket, sem nenhum table format por cima, e chama esse arranjo de \"nosso lakehouse\". Pouco depois, uma escrita concorrente corrompe uma leitura em andamento, coisa que a equipe achava que não deveria mais acontecer. O que está faltando nesse arranjo para que ele seja de fato um lakehouse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um cluster Spark maior, capaz de processar as escritas e leituras concorrentes sem gerar nenhum tipo de conflito entre elas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma migração completa dos arquivos Parquet para um banco de dados relacional hospedado fora do object storage.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um segundo bucket dedicado, só para separar fisicamente as escritas das leituras feitas pela equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "A camada de table format, como Delta Lake ou Iceberg, que registra as escritas como transações e garante ACID sobre os arquivos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um gestor entende que \"adotar lakehouse\" significa copiar todos os dados do data lake para dentro de um data warehouse tradicional, aposentando o object storage. Por que essa leitura está errada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o lakehouse aplica as garantias do warehouse sobre os dados que já estão no lake, sem migrar nada para outro sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque um data warehouse tradicional não consegue armazenar nenhum tipo de dado estruturado, só arquivos brutos e semiestruturados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque migrar dados de um sistema para outro sempre exige interromper as cargas de BI por várias semanas seguidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o object storage é a única camada capaz de rodar transações ACID, algo que um warehouse tradicional não oferece.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de adotar um lakehouse, uma empresa percebe que o mesmo conjunto de tabelas é lido por um engine SQL para os dashboards, por jobs Spark para as cargas de ETL e por notebooks de ciência de dados para treinar modelos, sem que nenhum desses usos exija copiar os dados para outro lugar. Qual característica da arquitetura lakehouse explica essa flexibilidade de motores sobre os mesmos dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Cada motor mantém, por baixo dos panos, sua própria cópia otimizada dos dados, sincronizada automaticamente pelo object storage.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage converte os arquivos para o formato nativo de cada motor no exato momento em que a leitura é solicitada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O table format expõe as tabelas por metadados abertos, então qualquer motor compatível lê a mesma cópia dos dados no object storage.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark atua como intermediário obrigatório, traduzindo os dados para o formato esperado por cada um dos outros motores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa recalculou o orçamento de dados e descobriu que paga duas vezes pelo armazenamento do mesmo histórico de vendas: uma vez no data lake, outra vez, já transformado, no data warehouse. Ao migrar esse histórico para um lakehouse, qual é o efeito mais direto sobre esse custo duplicado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O custo de armazenamento desaparece por completo, porque as tabelas lakehouse deixam de ocupar espaço em qualquer disco físico.",
                                "isCorrect": false
                            },
                            {
                                "text": "O histórico passa a existir numa única cópia, em tabelas mantidas sobre o mesmo object storage já usado pelo lake.",
                                "isCorrect": true
                            },
                            {
                                "text": "O histórico é compactado automaticamente até caber inteiro na memória RAM dos servidores de consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O warehouse original é mantido intacto, e o lakehouse se soma a ele como uma terceira cópia dos dados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A arquitetura medalhão",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A arquitetura medalhão\n\nNo módulo 2 desta trilha, as zonas do data lake apareceram como uma convenção de pastas: raw, staging, curated. No lakehouse, essa mesma ideia ganha um nome consolidado, a **arquitetura medalhão**, e um upgrade importante: cada zona deixa de ser só um diretório com arquivos Parquet soltos e passa a ser uma tabela de verdade, com transações, schema e histórico, graças ao table format. As camadas continuam três: bronze, silver e gold, cada uma com um papel específico e um nível de qualidade crescente."
                    },
                    {
                        "type": "text",
                        "value": "## Bronze: os dados brutos\n\nA camada bronze recebe os dados praticamente como chegam da origem: mesma estrutura, mesmos valores, sem limpeza nem validação de regras de negócio. A transformação, quando existe, é mínima, como ajustar o tipo de uma coluna ou adicionar metadados de ingestão (data de carga, arquivo de origem). O objetivo da bronze não é estar pronta para consumo, é preservar um registro fiel do que chegou, para que qualquer camada seguinte possa ser reconstruída do zero caso um bug apareça no processamento."
                    },
                    {
                        "type": "text",
                        "value": "## Silver: limpo e conformado\n\nNa camada silver, os dados já passaram por limpeza: deduplicação, correção de tipos, aplicação de regras de qualidade e, com frequência, join com outras entidades para formar uma visão mais completa. A granularidade ainda costuma ser a de detalhe (uma linha por pedido, por evento, por registro), sem agregações. É a camada que representa \"a verdade conformada\" do negócio, pronta para ser combinada, mas ainda não desenhada para uma pergunta analítica específica."
                    },
                    {
                        "type": "text",
                        "value": "## Gold: agregado e pronto para consumo\n\nA camada gold organiza os dados no formato que quem consome realmente usa: tabelas agregadas por dia ou por categoria, ou um esquema dimensional com fatos e dimensões, como visto na trilha de modelagem. É a camada que alimenta os dashboards de BI e, com frequência, também as feature stores usadas para treinar modelos de machine learning. Cada tabela gold normalmente serve um domínio de negócio ou um caso de uso, não existe uma única tabela gold para a empresa inteira."
                    },
                    {
                        "type": "code",
                        "value": "Fontes de dados\n     |\n     v\n+-----------+     +-----------+     +-------------+\n|  BRONZE   | --> |  SILVER   | --> |    GOLD     |\n| dados     |     | limpo,    |     | agregado,   |\n| brutos,   |     | deduplic. |     | dimensoes   |\n| como      |     | e         |     | e fatos,    |\n| chegaram  |     | conformado|     | por dominio |\n+-----------+     +-----------+     +-------------+\n                                            |\n                                  +---------+---------+\n                                  |                   |\n                            dashboards de BI     feature store / ML\n\nqualidade e nivel de agregacao crescem da esquerda para a direita;\ncada camada e uma tabela com table format, nao so uma pasta de arquivos"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Conteúdo típico\",\"Transformação aplicada\",\"Consumidor típico\"],[\"Bronze\",\"Cópia fiel da origem, com metadados de ingestão\",\"Mínima: ajuste de tipo, sem limpeza de regra de negócio\",\"Engenharia de dados, reprocessamento\"],[\"Silver\",\"Dados deduplicados, validados e conformados\",\"Limpeza, deduplicação, joins entre entidades\",\"Analistas de dados, outras equipes de engenharia\"],[\"Gold\",\"Tabelas agregadas ou esquema dimensional\",\"Agregação, modelagem dimensional por domínio\",\"BI, dashboards, feature store de ML\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando\n\nBronze, silver e gold não são um contrato rígido nem uma exigência técnica do table format: são um padrão amplamente adotado para organizar o crescimento de qualidade dentro do lakehouse. O que faz essas camadas funcionarem de verdade, com atualizações seguras e histórico consultável, são as garantias que o table format acrescenta a cada uma delas, o assunto da próxima aula."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um pipeline grava na camada bronze de um lakehouse exatamente os campos que vieram da origem, sem aplicar nenhuma regra de limpeza, só adicionando a data de ingestão como metadado extra. Isso é consistente com o papel esperado da camada bronze?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É consistente: bronze preserva um registro fiel da origem, servindo de base para reprocessar as camadas seguintes se necessário.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não é consistente: toda camada bronze precisa aplicar deduplicação completa antes de gravar qualquer dado novo na tabela em si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é consistente: a camada bronze deve conter apenas dados já agregados por dia, prontos para consumo direto do BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "É consistente apenas em lakehouses pequenos: volumes maiores exigem limpeza completa já na camada bronze.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time carrega pedidos deduplicados e com tipos corrigidos numa tabela que já cruza dados de pedidos com dados de clientes, mas ainda mantém uma linha por pedido, sem nenhuma agregação. Essa tabela está mais alinhada a qual camada da arquitetura medalhão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Bronze, porque qualquer join entre entidades diferentes só pode acontecer nessa camada, antes de qualquer limpeza.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gold, porque a existência de um join entre pedidos e clientes já caracteriza uma tabela pronta para consumo direto do BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bronze, porque a granularidade de uma linha por pedido é exclusiva dessa camada dentro da arquitetura medalhão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Silver, porque os dados já estão limpos, deduplicados e conformados, mas ainda no grão de detalhe, sem agregação.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela reúne vendas agregadas por categoria e por dia, alimentando ao mesmo tempo um dashboard de BI e uma feature store usada para treinar um modelo de previsão de demanda. Essa tabela é um exemplo típico de qual camada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Bronze, porque qualquer tabela consumida por mais de uma equipe precisa ficar na camada mais próxima da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Silver, porque servir tanto BI quanto machine learning é uma característica exclusiva dos dados ainda no grão de detalhe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gold, porque a agregação por categoria e dia já representa os dados no formato pronto para consumo analítico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um data warehouse externo, porque tabelas com agregações prontas para BI não pertencem à arquitetura medalhão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro afirma que o table format exige, tecnicamente, que toda tabela lakehouse pertença a uma das três camadas bronze, silver ou gold, e que nomear uma tabela fora desse padrão quebraria o Delta Lake ou o Iceberg. Essa afirmação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Está correta: o transaction log do table format valida o nome da camada antes de aceitar qualquer escrita nova na tabela em si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está incorreta: bronze, silver e gold são um padrão de organização amplamente adotado, não uma exigência técnica do table format.",
                                "isCorrect": true
                            },
                            {
                                "text": "Está correta, mas apenas para tabelas Iceberg, já que o Delta Lake não impõe nenhuma convenção de nomenclatura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está incorreta, porque o padrão de camadas é uma exigência do object storage, não do table format em si.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um bug na lógica de deduplicação da camada silver gerou dados incorretos por duas semanas, já propagados também para a camada gold. A camada bronze desse período permaneceu intacta, sem o bug, já que recebeu os dados exatamente como vieram da origem. Qual é o benefício prático dessa separação em camadas, evidenciado por esse incidente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A bronze evita qualquer tipo de bug de lógica, porque toda a validação de regras de negócio acontece antes da ingestão dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A gold pode ser corrigida diretamente, editando os valores errados linha a linha, sem precisar reprocessar a silver.",
                                "isCorrect": false
                            },
                            {
                                "text": "O bug não teria acontecido se bronze e silver fossem a mesma tabela, eliminando a necessidade de reprocessamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A silver e a gold do período podem ser reprocessadas a partir da bronze intacta, sem depender de recarregar a origem de novo.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "ACID, upsert (MERGE) e time travel na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# ACID, upsert (MERGE) e time travel na prática\n\nO módulo 3 desta trilha listou os limites do data lake cru: sem ACID, escritas concorrentes podiam corromper leituras; sem upsert, atualizar um registro significava reescrever arquivos inteiros na mão; sem time travel, não existia como consultar \"como os dados estavam ontem\" sem guardar cópias manuais. Esta aula mostra como o lakehouse fecha essas três lacunas na prática, com um exemplo de MERGE e um de consulta a uma versão anterior da tabela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Propriedade ACID\",\"O que garante\",\"Como o lakehouse entrega\"],[\"Atomicidade\",\"Uma escrita acontece por inteiro ou não acontece\",\"O commit no log da tabela só existe depois que todos os arquivos da transação terminam de ser gravados\"],[\"Consistência\",\"Toda leitura enxerga um estado válido da tabela\",\"Cada leitura aponta para uma versão específica e completa, nunca um commit pela metade\"],[\"Isolamento\",\"Escritas concorrentes não se corrompem\",\"O table format detecta conflito entre transações concorrentes e rejeita a que não pode ser aplicada com segurança\"],[\"Durabilidade\",\"Uma escrita confirmada sobrevive a falhas\",\"O commit fica registrado no log da tabela, persistido no próprio object storage\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## MERGE: upsert com garantias\n\nNo lake cru, \"atualizar\" um registro significava reescrever o arquivo Parquet inteiro (ou a partição inteira) que continha aquela linha, sem garantia de que um leitor concorrente não pegasse um estado intermediário. No lakehouse, a operação de **upsert** usa o comando `MERGE`, igual ao visto na trilha de ETL, mas agora contra uma tabela com transação: compara a origem com o destino por uma chave, atualiza o que já existe, insere o que é novo e, se preciso, remove o que foi excluído, tudo dentro de uma única transação atômica."
                    },
                    {
                        "type": "code",
                        "value": "-- upsert de clientes na camada silver, a partir de um lote de CDC vindo da bronze\nMERGE INTO silver.clientes AS destino\nUSING bronze.clientes_cdc AS origem\nON destino.cliente_id = origem.cliente_id\nWHEN MATCHED AND origem.operacao = 'DELETE' THEN\n  DELETE\nWHEN MATCHED THEN\n  UPDATE SET\n    nome = origem.nome,\n    email = origem.email,\n    atualizado_em = origem.atualizado_em\nWHEN NOT MATCHED THEN\n  INSERT (cliente_id, nome, email, atualizado_em)\n  VALUES (origem.cliente_id, origem.nome, origem.email, origem.atualizado_em);\n\n-- esse MERGE inteiro vira um unico commit no log da tabela:\n-- quem le silver.clientes nunca ve um estado com o upsert pela metade"
                    },
                    {
                        "type": "text",
                        "value": "## Time travel\n\nCada transação aplicada a uma tabela lakehouse gera uma nova versão, registrada no log (o `_delta_log` no Delta Lake, um novo snapshot no Iceberg). Como esse histórico fica guardado, é possível consultar a tabela do jeito que ela estava numa versão específica ou num instante no passado, o **time travel**. Na prática, isso serve para auditar uma mudança, comparar o antes e o depois de um `MERGE`, ou investigar um valor que mudou sem entender exatamente quando ou por quê."
                    },
                    {
                        "type": "code",
                        "value": "-- consultando a tabela como ela estava numa versao especifica\nSELECT * FROM silver.clientes VERSION AS OF 41;\n\n-- ou num instante no passado, por timestamp\nSELECT * FROM silver.clientes TIMESTAMP AS OF '2026-07-16 00:00:00';\n\n-- comparando o total de linhas antes e depois do MERGE desta aula\nSELECT count(*) FROM silver.clientes VERSION AS OF 41;  -- antes\nSELECT count(*) FROM silver.clientes VERSION AS OF 42;  -- depois do MERGE"
                    },
                    {
                        "type": "quote",
                        "value": "ACID garante que cada transação seja tudo ou nada; o MERGE usa essa garantia para fazer upsert com segurança; o time travel guarda cada versão para que nenhuma mudança seja definitiva demais para ser investigada depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dois jobs tentam escrever, ao mesmo tempo, numa tabela silver mantida com um table format aberto. Um deles insere pedidos novos; o outro faz um MERGE que atualiza pedidos existentes. Qual propriedade garante que essas duas escritas concorrentes não corrompam uma à outra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Isolamento: o table format detecta o conflito entre as transações e rejeita a que não pode ser aplicada com segurança.",
                                "isCorrect": true
                            },
                            {
                                "text": "Durabilidade: o table format grava as duas escritas em réplicas separadas do object storage, sem qualquer conflito possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Atomicidade: o table format executa as duas transações em sequência, uma travando a tabela inteira até a outra terminar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consistência: o table format converte automaticamente as duas escritas concorrentes numa única transação combinada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de adotar um table format, atualizar o e-mail de um cliente exigia reescrever o arquivo Parquet inteiro da partição correspondente, torcendo para nenhum leitor acessar o arquivo durante a reescrita. Depois de migrar para uma tabela lakehouse, essa atualização passa a ser feita com um MERGE. O que muda, na prática, para quem lê a tabela durante essa operação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada muda: leitores concorrentes ainda podem ler um arquivo parcialmente reescrito enquanto o MERGE inteiro está em andamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela fica bloqueada para leitura enquanto o MERGE roda, e volta a ficar disponível só depois que ele termina.",
                                "isCorrect": false
                            },
                            {
                                "text": "O MERGE inteiro vira uma única transação: leitores veem a versão anterior completa ou a versão nova completa, nunca uma mistura.",
                                "isCorrect": true
                            },
                            {
                                "text": "O MERGE grava os dados novos numa tabela temporária separada, que precisa ser renomeada manualmente depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um MERGE aplicado por engano removeu, via DELETE, um grupo de clientes que na verdade deveriam ter sido apenas atualizados. A equipe precisa entender exatamente quais clientes existiam antes desse MERGE específico, para decidir como corrigir. Qual recurso do lakehouse resolve isso diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Vacuum, consultando os arquivos físicos que ainda não foram removidos do object storage pela limpeza de versões antigas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema evolution, adicionando uma coluna que registre o instante exato em que cada cliente foi removido da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um novo MERGE, comparando a tabela atual com um backup manual feito antes da operação que causou o problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Time travel, consultando a versão da tabela imediatamente anterior ao MERGE que executou o DELETE indevido.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Durante um MERGE que atualiza 2 milhões de linhas, o cluster que executa o job cai depois de gravar metade dos arquivos de dados novos, mas antes de registrar o commit no log da tabela. O que um leitor vê ao consultar a tabela logo depois dessa falha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma mistura dos dados antigos com os arquivos novos já gravados, já que a leitura não espera por nenhum commit em específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão anterior completa da tabela, porque sem o commit no log os arquivos novos nunca chegam a ser considerados parte dela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de leitura, porque a tabela fica inacessível até que o job seja executado de novo do início ao fim.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só as linhas que não foram afetadas pelo MERGE, com as demais aparecendo como valores nulos até o reprocessamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de aprender sobre time travel, um engenheiro propõe eliminar a política de backup da equipe, argumentando que qualquer versão antiga da tabela sempre poderá ser consultada com VERSION AS OF. Por que essa proposta é arriscada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque versões antigas são removidas por rotinas de limpeza e retenção, então o time travel tem um alcance limitado no tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o comando VERSION AS OF só funciona em tabelas Iceberg, deixando tabelas Delta Lake sem nenhuma forma de time travel.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque consultar uma versão antiga exige reprocessar a tabela inteira desde a primeira carga, um custo alto a cada consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o time travel só guarda o schema de versões antigas, sem manter os dados de fato disponíveis para consulta.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Schema enforcement e schema evolution",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Schema enforcement e schema evolution\n\nO módulo 3 desta trilha mostrou o schema drift: num data lake cru, nada impede que um produtor mude o tipo de uma coluna ou pare de enviar um campo, e cada arquivo Parquet carrega o schema que tinha no momento em que foi escrito. O resultado é uma tabela lógica com arquivos incompatíveis entre si, descoberta geralmente quando uma consulta quebra. O lakehouse ataca esse problema com dois mecanismos complementares: **schema enforcement**, que barra escritas incompatíveis, e **schema evolution**, que permite evoluir o schema de forma controlada."
                    },
                    {
                        "type": "text",
                        "value": "## Schema enforcement\n\nUma tabela lakehouse guarda o schema esperado no seu próprio log de metadados, não apenas \"o que o último arquivo Parquet disser\". Toda escrita nova é validada contra esse schema antes de virar um commit: uma coluna com tipo incompatível, uma coluna obrigatória faltando ou uma coluna extra não esperada faz a escrita inteira ser **rejeitada**, com um erro explícito, em vez de aceita silenciosamente. É a diferença entre travar no momento da escrita e descobrir a inconsistência semanas depois, numa consulta qualquer."
                    },
                    {
                        "type": "code",
                        "value": "# tabela silver.pedidos tem a coluna valor definida como double\nnovos_pedidos.printSchema()\n# root\n#  |-- pedido_id: string\n#  |-- valor: string      <- deveria ser double\n\nnovos_pedidos.write.format(\"delta\").mode(\"append\").saveAsTable(\"silver.pedidos\")\n\n# a escrita e rejeitada antes de qualquer commit no log da tabela:\n# AnalysisException: Failed to merge fields 'valor' and 'valor'.\n# Failed to merge incompatible data types StringType and DoubleType"
                    },
                    {
                        "type": "text",
                        "value": "## Schema evolution\n\nNem toda mudança de schema é um erro: às vezes o sistema de origem passa a mandar um campo novo de verdade, e a tabela precisa acompanhar isso. É para esse caso que serve o schema evolution: em vez de travar a escrita, o motor aceita explicitamente incorporar a mudança ao schema da tabela, quando quem escreve pede isso de forma deliberada. Adicionar uma coluna nova é uma evolução segura, linhas antigas simplesmente recebem nulo naquele campo; mudar o tipo ou remover uma coluna existente já é mais arriscado e costuma exigir uma migração pensada, não só uma opção automática."
                    },
                    {
                        "type": "code",
                        "value": "# a origem passou a enviar um campo novo: canal_venda\nnovos_pedidos.printSchema()\n# root\n#  |-- pedido_id: string\n#  |-- valor: double\n#  |-- canal_venda: string    <- coluna nova\n\n(\n    novos_pedidos.write\n    .format(\"delta\")\n    .mode(\"append\")\n    .option(\"mergeSchema\", \"true\")  # opt-in explicito para evoluir o schema\n    .saveAsTable(\"silver.pedidos\")\n)\n\n# depois da escrita: linhas gravadas antes da mudanca ficam com\n# canal_venda = null; as linhas novas trazem o valor real do campo"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Data lake cru (Parquet solto)\",\"Lakehouse (table format)\"],[\"Coluna chega com tipo incompatível\",\"O arquivo é gravado normalmente, a inconsistência aparece só numa leitura futura\",\"A escrita é rejeitada na hora, antes de virar um commit na tabela\"],[\"Coluna nova aparece na origem\",\"Passa a existir em alguns arquivos e não em outros, sem aviso\",\"Só é incorporada se a escrita pedir schema evolution de forma explícita\"],[\"Quem decide aceitar a mudança\",\"Ninguém: a mudança entra junto com o próximo arquivo gravado\",\"Quem escreve, de forma deliberada, e o schema registrado na tabela\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando\n\nEnforcement e evolution resolvem lados opostos do mesmo problema: um impede que sujeira entre na tabela sem querer, o outro permite que o schema cresça quando o negócio pede, sem depender de sorte. Juntos, fecham o schema drift do módulo 3 sem travar a evolução legítima dos dados. Com ACID, upsert, time travel e schema sob controle, falta só uma pergunta para fechar o módulo: quando vale mesmo a pena optar pelo lakehouse, e quando um warehouse dedicado ainda ganha."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um job tenta gravar, numa tabela lakehouse cuja coluna valor é do tipo double, um lote onde essa mesma coluna vem como string. O que acontece com essa escrita?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É aceita, e a coluna valor passa a aceitar tanto números quanto texto de forma automática na tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "É aceita, mas os valores em string são convertidos silenciosamente para double antes de virar um commit.",
                                "isCorrect": false
                            },
                            {
                                "text": "É rejeitada: o schema enforcement barra a escrita antes que ela vire um commit no log da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "É aceita apenas nas linhas onde o valor for numérico, descartando silenciosamente as demais linhas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela silver recebe um lote com uma coluna nova, canal_venda, que não existia até então. O job de escrita não define nenhuma opção especial de schema. O que tende a acontecer, dado que schema evolution não é o comportamento padrão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A coluna nova é incorporada automaticamente à tabela, e as linhas antigas recebem o valor padrão zero para ela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela inteira é recriada do zero, já incluindo a coluna nova, sem preservar o histórico de versões anteriores.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna nova é ignorada silenciosamente, e a escrita é aceita normalmente sem nenhum aviso sobre a diferença.",
                                "isCorrect": false
                            },
                            {
                                "text": "A escrita é rejeitada pelo schema enforcement, já que a coluna nova não faz parte do schema registrado na tabela.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados propõe duas mudanças na mesma tabela silver: adicionar uma coluna nova, opcional, para um campo que passou a existir na origem; e mudar o tipo de uma coluna existente, de inteiro para texto, porque um novo sistema de origem manda o campo formatado diferente. Qual afirmação melhor descreve o risco relativo dessas duas mudanças?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As duas têm o mesmo risco, porque qualquer alteração de schema, seja adição ou mudança de tipo, exige recriar a tabela inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar a coluna nova é uma evolução segura; mudar o tipo de uma coluna existente é mais arriscado e pede uma migração pensada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mudar o tipo da coluna existente é mais seguro, porque não aumenta o número de colunas nem o tamanho da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas são igualmente seguras, desde que a opção de schema evolution esteja habilitada na escrita antes do job.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No lake cru, um produtor de dados mudou o tipo de uma coluna sem avisar ninguém, e o problema só foi percebido semanas depois, numa consulta que falhava de forma intermitente conforme o arquivo lido. Ao migrar essa tabela para um lakehouse com schema enforcement ativo, quando esse mesmo tipo de problema passaria a ser detectado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No momento da escrita incompatível, que seria rejeitada antes de qualquer commit na tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só quando alguém rodasse manualmente uma rotina de validação de schema sobre a tabela inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "No momento da leitura, quando o motor de consulta comparasse os tipos entre os arquivos afetados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só na próxima execução do OPTIMIZE, quando os arquivos pequenos fossem compactados em arquivos maiores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para evitar lidar com erros de escrita, um time passa a usar a opção de schema evolution em toda escrita da tabela, sem revisar as colunas novas que chegam. Meses depois, a tabela acumulou dezenas de colunas quase sempre nulas, vindas de campos que apareceram uma única vez por erro na origem. Qual é o principal risco de habilitar schema evolution sem critério, evidenciado por esse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A tabela deixa de suportar consultas por SQL, funcionando só através de bibliotecas específicas do Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "O table format passa a ignorar completamente o schema, voltando a se comportar como um data lake cru sem controle algum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colunas espúrias, vindas de erros pontuais na origem, entram na tabela como se fossem mudanças legítimas de schema.",
                                "isCorrect": true
                            },
                            {
                                "text": "As transações deixam de ser atômicas, permitindo que leitores concorrentes vejam commits pela metade durante a escrita.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Lake x warehouse x lakehouse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Lake x warehouse x lakehouse\n\nChegou a hora de fechar o círculo aberto lá no módulo 1. Data warehouse: ACID, SQL maduro e desempenho, mas caro por volume e rígido para dados fora do modelo relacional. Data lake: barato, flexível, guarda qualquer formato, mas cru, sem transação e sem schema garantido. Lakehouse: as garantias do warehouse aplicadas direto sobre o lake, através de um table format aberto, numa única cópia dos dados. Esta aula compara os três lado a lado e trata da pergunta que fecha o módulo: quando cada um é a escolha certa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Data warehouse\",\"Data lake\",\"Lakehouse\"],[\"Custo de armazenamento\",\"Alto por volume\",\"Baixo, object storage\",\"Baixo, o mesmo object storage\"],[\"Tipos de dado suportados\",\"Estruturado\",\"Qualquer formato\",\"Qualquer formato, com tabelas estruturadas por cima\"],[\"Schema\",\"Rígido, on-write\",\"Nenhum imposto, on-read\",\"Enforcement e evolution controlados\"],[\"ACID e upsert\",\"Nativos\",\"Ausentes no Parquet puro\",\"Entregues pelo table format\"],[\"Desempenho para SQL e BI\",\"Muito maduro\",\"Limitado sem otimizações\",\"Bom, evoluindo com o motor usado\"],[\"Suporte a ML e ciência de dados\",\"Limitado, fora do modelo relacional\",\"Nativo, arquivos abertos\",\"Nativo, mesmas tabelas do BI\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando o lakehouse é a escolha certa\n\nO lakehouse ganha quando a empresa precisa de um único lugar para BI e ciência de dados, sem manter cópias divergentes; quando o volume inclui dados semiestruturados ou não estruturados ao lado de tabelas tradicionais; quando a equipe já usa Spark ou um motor compatível com o table format escolhido; e quando o custo e a complexidade de operar lake e warehouse como sistemas separados já pesam mais do que o benefício de mantê-los apartados."
                    },
                    {
                        "type": "text",
                        "value": "## Quando um warehouse dedicado ainda faz sentido\n\nUm warehouse dedicado continua sendo uma escolha sólida quando a carga é essencialmente SQL, com muitos dashboards concorrentes e exigência forte de latência baixa, algo em que warehouses colunares maduros costumam ter vantagem; quando a equipe é pequena e prefere um serviço mais gerenciado, sem operar a camada extra do table format; ou quando o volume de dados é pequeno o bastante para que a vantagem de custo do object storage não compense a complexidade adicional de manter um lakehouse."
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta não é qual dos três vence de forma absoluta: é qual conjunto de garantias o caso de uso exige. Schema rígido e SQL puro pedem warehouse; dados brutos e variados pedem lake; os dois ao mesmo tempo, sem duplicar, pedem lakehouse."
                    },
                    {
                        "type": "code",
                        "value": "Precisa de ACID, upsert e desempenho de consulta sobre os dados?\n  nao -> um data lake cru (arquivos abertos, schema-on-read) resolve\n\n  sim -> os dados sao quase todos estruturados, com poucas\n         necessidades de ML sobre dados brutos e SLA de BI critico?\n           sim -> um data warehouse dedicado ainda e uma escolha solida\n           nao -> lakehouse: uma copia dos dados, tabelas com table\n                  format, servindo BI e ML ao mesmo tempo"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nO lakehouse não é o fim da jornada de quem trabalha com dados em escala, é a base sobre a qual as tabelas do dia a dia são operadas. O próximo módulo desta trilha entra justamente nessa operação: MERGE e CDC no dia a dia, time travel para auditar e reverter, compactação com OPTIMIZE e Z-ORDER, e o trade-off entre vacuum e retenção de versões antigas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma startup de dados vai decidir a arquitetura para os próximos anos. Ela precisa que o mesmo histórico de eventos sirva tanto para dashboards de BI quanto para treinar modelos de machine learning, sem manter duas cópias dos dados nem duplicar pipelines de carga. Qual arquitetura atende melhor a esse requisito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Data warehouse, porque é a única arquitetura das três capaz de armazenar histórico de eventos em qualquer volume.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data lake cru, porque arquivos Parquet sem table format já garantem ACID suficiente para os dashboards de BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duas arquiteturas separadas, um data lake para ML e um data warehouse para BI, ligadas por um ETL incremental.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lakehouse, porque as mesmas tabelas, numa única cópia dos dados, atendem BI e ML ao mesmo tempo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena mantém só relatórios financeiros em SQL, consultados por centenas de usuários simultâneos com exigência forte de resposta rápida, sem nenhum caso de uso de machine learning no horizonte. A equipe também prefere não operar uma camada extra de table format. Qual arquitetura tende a ser a mais adequada aqui?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um data warehouse dedicado, já que a carga é puramente SQL, com alta concorrência e pouco apetite para operar uma camada extra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um data lake cru, já que a ausência de ACID nos arquivos Parquet não chega a afetar relatórios financeiros consultados via SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um lakehouse, já que qualquer carga de trabalho baseada em SQL só atinge bom desempenho sobre um table format aberto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dois data warehouses redundantes, um para cada metade dos usuários simultâneos, dividindo a carga de consultas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto defende migrar todos os sistemas da empresa para lakehouse, incluindo um pequeno banco de relatórios internos com poucos usuários e volume estável há anos, sem nenhum caso de uso de dados não estruturados. Por que essa recomendação pode não ser a melhor decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque um lakehouse jamais consegue rodar consultas SQL com o mesmo desempenho de um data warehouse, em nenhuma situação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a decisão depende das garantias exigidas pelo caso de uso, não de um cenário pequeno e estável justificar sempre essa migração.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque tabelas lakehouse não suportam relatórios com poucos usuários, exigindo sempre algum volume mínimo de consultas simultâneas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque migrar para lakehouse exige descontinuar totalmente o uso de SQL, substituindo todas as consultas por código Spark.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe recebe logs semiestruturados em JSON, junto com tabelas transacionais tradicionais, e precisa de upsert e time travel sobre esse conjunto combinado, sem abrir mão de consultas SQL. Um data warehouse tradicional dificulta os logs semiestruturados; um data lake cru não entrega upsert nem time travel. Qual arquitetura resolve as duas exigências ao mesmo tempo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um data lake cru com arquivos Parquet particionados, já que o particionamento por si só entrega upsert e time travel.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um data warehouse tradicional, convertendo os logs semiestruturados em texto simples antes de qualquer carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um lakehouse, que aceita dados semiestruturados como o lake e entrega upsert e time travel como o warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dois data warehouses separados, um especializado em dados semiestruturados e outro em tabelas transacionais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa de médio porte mantém 80% dos dados em tabelas transacionais estáveis, consultadas quase só por SQL com boa concorrência de usuários, e 20% em eventos semiestruturados, explorados à parte por um time pequeno de ciência de dados que não precisa cruzar esses eventos com as tabelas transacionais. O volume total é modesto e a equipe de engenharia é enxuta. Qual decisão pesa melhor esses fatores?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Migrar tudo para lakehouse, porque a presença de qualquer dado semiestruturado já torna um warehouse dedicado tecnicamente inviável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter só o data lake cru para os dois conjuntos, já que arquivos Parquet sem table format atendem igualmente bem consultas SQL concorrentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar tudo para lakehouse, porque equipes enxutas sempre operam uma camada extra de table format com menos esforço do que dois sistemas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter um warehouse dedicado para os 80% estruturados e um lake simples para os eventos explorados à parte, sem cruzar os dois.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Operando tabelas do lakehouse",
        "aulas": [
            {
                "titulo": "MERGE/upsert e CDC no lakehouse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# MERGE/upsert e CDC no lakehouse\n\nNos módulos anteriores você viu que Parquet puro só aceita anexar dados, e que Delta Lake, Iceberg e Hudi existem justamente para resolver isso com uma camada de metadados transacional sobre esses arquivos. Este é o primeiro lugar onde essa promessa vira rotina: como inserir-ou-atualizar uma tabela do lakehouse por chave, todo dia, sem reprocessar a tabela inteira a cada carga."
                    },
                    {
                        "type": "text",
                        "value": "## O que o MERGE INTO faz\n\n`MERGE INTO` compara uma origem (o lote novo, vindo de staging ou de um feed de CDC) com uma tabela de destino, usando uma condição de casamento, tipicamente a chave de negócio. Para cada linha da origem, o Delta decide uma entre três ações: se a chave já existe no destino, atualiza (`WHEN MATCHED ... UPDATE`); se não existe, insere (`WHEN NOT MATCHED ... INSERT`); e, quando necessário, se uma chave do destino sumiu da origem, pode deletar (`WHEN NOT MATCHED BY SOURCE ... DELETE`). A operação inteira roda como uma única transação: o `_delta_log` ganha um commit novo com o resultado completo, ou nada muda se ela falhar no meio do caminho."
                    },
                    {
                        "type": "code",
                        "value": "-- MERGE INTO em SQL: upsert por chave de negócio\nMERGE INTO clientes_gold AS destino\nUSING clientes_stage AS origem\nON destino.id_cliente = origem.id_cliente\nWHEN MATCHED THEN\n  UPDATE SET *\nWHEN NOT MATCHED THEN\n  INSERT *\n\n# o mesmo upsert via PySpark, com a API DeltaTable\nfrom delta.tables import DeltaTable\n\ntabela_destino = DeltaTable.forPath(spark, \"/lake/gold/clientes\")\n\n(tabela_destino.alias(\"destino\")\n    .merge(origem_df.alias(\"origem\"), \"destino.id_cliente = origem.id_cliente\")\n    .whenMatchedUpdateAll()\n    .whenNotMatchedInsertAll()\n    .execute())"
                    },
                    {
                        "type": "text",
                        "value": "## CDC chegando no lakehouse\n\nUm feed de CDC (Change Data Capture) representa cada mudança que aconteceu numa origem, tipicamente com uma coluna indicando a operação (inserção, atualização ou exclusão) e uma marca de tempo ou sequência para ordenar mudanças concorrentes na mesma chave. Esse feed pousa primeiro numa zona raw ou staging do lake, como qualquer outra carga incremental do pipeline de ETL, e depois é aplicado à tabela silver ou gold com um `MERGE`: a tabela final passa a refletir o estado mais recente de cada chave, sem guardar o histórico bruto de cada mudança."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Operação no feed de CDC\",\"Cláusula do MERGE que trata\"],[\"Inserção (chave nova, não existe no destino)\",\"WHEN NOT MATCHED THEN INSERT\"],[\"Atualização (chave já existe no destino)\",\"WHEN MATCHED THEN UPDATE\"],[\"Exclusão (linha marcada como deletada na origem)\",\"WHEN MATCHED AND origem.operacao = 'D' THEN DELETE\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## MERGE e as SCDs no lakehouse\n\nA trilha de modelagem apresentou as slowly changing dimensions. `MERGE` implementa SCD Tipo 1 diretamente: `WHEN MATCHED THEN UPDATE SET *` sobrescreve o valor antigo pelo novo, sem guardar histórico. Para SCD Tipo 2, que precisa manter cada versão de um registro com seu período de vigência, o `MERGE` fica mais elaborado: uma cláusula fecha a versão vigente (marcando uma data de fim e uma flag de atual), e outra insere a nova versão como linha adicional, com uma chave técnica diferente da chave de negócio."
                    },
                    {
                        "type": "quote",
                        "value": "O MERGE troca um DELETE e um INSERT separados, ou reprocessar a tabela inteira, por uma única transação atômica: ou a tabela inteira reflete o novo estado, ou nada muda."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a cláusula MERGE INTO permite fazer numa única operação atômica sobre uma tabela do lakehouse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Apenas inserir linhas novas ao final da tabela, sem nenhuma possibilidade de atualizar as linhas já existentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Inserir linhas novas e atualizar linhas existentes na mesma tabela, combinando as duas ações numa única transação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas atualizar linhas já existentes na tabela, sem permitir a inserção de nenhuma linha nova vinda da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reescrever a tabela inteira do zero a cada execução, substituindo por completo o conteúdo gravado anteriormente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num MERGE que aplica um feed de CDC a uma tabela gold, a origem traz uma linha cuja chave já existe no destino, mas o valor de uma coluna mudou. Qual cláusula do MERGE trata esse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "WHEN NOT MATCHED THEN INSERT, porque toda mudança de valor deve ser tratada como uma linha nova na tabela de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "WHEN NOT MATCHED BY SOURCE THEN DELETE, já que a linha antiga deixou de refletir o estado correto da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "WHEN MATCHED THEN INSERT, que substitui a linha inteira do destino por uma nova linha com os valores atualizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "WHEN MATCHED THEN UPDATE, que atualiza os valores da linha existente no destino pelos valores vindos da origem.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela silver só recebe cargas em modo append, e uma mesma chave de negócio pode aparecer várias vezes com valores diferentes, já que updates da origem chegam como novas linhas em vez de sobrescrever a existente. Qual mudança no pipeline resolve isso, mantendo só o valor mais recente de cada chave na tabela gold?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar a carga append por um MERGE na gravação da gold, casando pela chave de negócio e atualizando o valor existente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar uma coluna de auditoria à tabela silver, registrando a data de chegada de cada linha carregada no append.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o formato de Parquet para CSV na zona silver, o que passa a permitir atualização direta de linhas existentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a frequência das cargas append, reduzindo o intervalo entre elas até que duplicidades parem de ocorrer.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela gold precisa refletir exclusões: quando uma linha desaparece da origem, ela deve ser removida também do destino, não apenas deixar de ser atualizada. O feed de CDC só traz as linhas que ainda existem na origem, sem nenhuma marca explícita de exclusão. Qual recurso do MERGE resolve esse caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "WHEN MATCHED THEN DELETE, aplicada a toda linha do destino cuja chave também aparece entre as linhas da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "WHEN NOT MATCHED THEN DELETE, aplicada às linhas da origem que não têm chave correspondente no destino atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "WHEN NOT MATCHED BY SOURCE THEN DELETE, aplicada às linhas do destino cuja chave não aparece mais na origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "WHEN MATCHED THEN UPDATE SET ativo = false, o que marca a linha como inativa sem de fato removê-la da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe implementa SCD Tipo 2 numa tabela gold usando MERGE: quando um atributo de uma dimensão muda, a versão antiga deve ser fechada (com data de fim e flag de atual falso) e uma nova versão deve ser inserida como linha adicional. Por que isso exige mais do que um único WHEN MATCHED THEN UPDATE SET *?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o MERGE só aceita uma cláusula WHEN MATCHED por execução, então o fechamento da versão precisa de um job separado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um UPDATE simples sobrescreveria a versão antiga no lugar, sem preservar o histórico que o SCD Tipo 2 exige.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o SCD Tipo 2 não pode ser implementado com MERGE, apenas com múltiplas execuções de INSERT em sequência.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o MERGE não permite atualizar colunas de data, exigindo um UPDATE separado só para a data de fim da versão.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Time travel e versionamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Time travel e versionamento\n\nCada escrita numa tabela Delta (um `INSERT`, um `MERGE`, um `DELETE`, até uma `OPTIMIZE`) gera uma nova versão, registrada como mais um commit no `_delta_log`. Nenhuma versão anterior é apagada nessa hora: o log inteiro funciona como uma trilha de auditoria, e o time travel é a capacidade de consultar, comparar e até reverter para qualquer uma dessas versões."
                    },
                    {
                        "type": "text",
                        "value": "## Consultando uma versão anterior\n\nExistem duas formas de apontar para uma versão específica: pelo número da versão (`VERSION AS OF`) ou por um instante no tempo (`TIMESTAMP AS OF`), que o Delta resolve para a versão mais recente até aquele momento. As duas funcionam tanto em SQL quanto como opções de leitura no PySpark, sem exigir nenhuma cópia da tabela: a consulta lê diretamente os arquivos que compunham a tabela naquela versão."
                    },
                    {
                        "type": "code",
                        "value": "-- consultando por número de versão\nSELECT * FROM lake.gold.pedidos VERSION AS OF 42;\n\n-- consultando por instante no tempo\nSELECT * FROM lake.gold.pedidos TIMESTAMP AS OF '2026-06-01 00:00:00';\n\n# as mesmas consultas via PySpark\ndf_v42 = spark.read.format(\"delta\").option(\"versionAsOf\", 42).load(\"/lake/gold/pedidos\")\n\ndf_junho = (spark.read.format(\"delta\")\n    .option(\"timestampAsOf\", \"2026-06-01 00:00:00\")\n    .load(\"/lake/gold/pedidos\"))"
                    },
                    {
                        "type": "text",
                        "value": "## Auditando com DESCRIBE HISTORY\n\n`DESCRIBE HISTORY` (ou `deltaTable.history()` no PySpark) lista cada versão da tabela com o timestamp, a operação executada (`WRITE`, `MERGE`, `DELETE`, `OPTIMIZE`, `VACUUM` etc.), os parâmetros daquela operação e quem a executou. É o primeiro lugar a olhar quando uma tabela mudou de um jeito inesperado: em vez de suspeitar, dá para confirmar exatamente qual job, e qual operação, alterou cada versão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Versão\",\"Operação\",\"O que mudou\"],[\"41\",\"MERGE\",\"Upsert do lote de pedidos do dia, 3.200 linhas atualizadas e 480 inseridas\"],[\"42\",\"DELETE\",\"Remoção de pedidos cancelados fora do prazo de retenção contratual\"],[\"43\",\"OPTIMIZE\",\"Compactação de small files na partição do mês corrente\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Revertendo com RESTORE e reproduzindo resultados\n\n`RESTORE TABLE tabela TO VERSION AS OF` uma versão anterior devolve a tabela àquele estado, útil depois de um job com bug que corrompeu dados. O `RESTORE` não apaga o histórico: ele cria uma nova versão cujo conteúdo é igual ao da versão restaurada, então o log continua crescendo, e é possível até desfazer um `RESTORE` indevido revertendo para a versão anterior a ele. Já para reproduzir um resultado antigo (um relatório, um modelo treinado com um snapshot específico), não é preciso restaurar nada: basta consultar a versão ou o timestamp correspondente, sem tocar no estado atual da tabela."
                    },
                    {
                        "type": "quote",
                        "value": "Time travel resolve auditoria, depuração e reversão de curto prazo; não é um backup de longo prazo, porque o período de retenção dos arquivos e do próprio log é finito, e versões velhas demais deixam de estar disponíveis."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista precisa consultar os dados de uma tabela Delta exatamente como estavam há três dias, sem alterar o estado atual da tabela. Qual comando atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "SELECT * FROM tabela TIMESTAMP AS OF a data desejada, lendo aquele instante sem alterar o estado atual da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "RESTORE TABLE tabela TO TIMESTAMP AS OF a data desejada, revertendo a tabela para o estado daquele instante.",
                                "isCorrect": false
                            },
                            {
                                "text": "DESCRIBE HISTORY tabela, que devolve os dados completos de cada versão registrada no log de transações dela.",
                                "isCorrect": false
                            },
                            {
                                "text": "VACUUM tabela RETAIN 72 HOURS, que restaura para leitura os arquivos referentes a três dias atrás na tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a saída de DESCRIBE HISTORY sobre uma tabela Delta mostra para cada versão registrada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O conteúdo completo dos dados da tabela naquela versão, permitindo reconstruí-la sem ler nenhum arquivo Parquet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o número da versão e o tamanho em bytes ocupado pelos arquivos que ela referencia no armazenamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A operação executada (write, merge, delete, optimize etc.), quando ocorreu e outros metadados daquela versão.",
                                "isCorrect": true
                            },
                            {
                                "text": "A lista de usuários com permissão de leitura sobre a tabela, controlada pelo catálogo de dados do lakehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job com um MERGE mal escrito sobrescreveu incorretamente boa parte de uma tabela Delta em produção. Pelo DESCRIBE HISTORY, a equipe confirma que a versão anterior ao MERGE estava correta. Qual é a forma mais direta de reverter a tabela para aquele estado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rodar VACUUM tabela, o que remove os arquivos gravados pelo MERGE incorreto e reverte o efeito dele na tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reprocessar a fonte original de dados desde o início, recriando a tabela inteira do zero de forma manual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar de novo o mesmo MERGE, o que desfaz a alteração anterior porque o Delta aplica mudanças em ordem inversa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar RESTORE TABLE tabela TO VERSION AS OF a versão anterior ao MERGE que causou o problema na tabela.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta a VERSION AS OF 5 de uma tabela Delta falha, embora essa versão apareça listada no DESCRIBE HISTORY. Qual é a explicação mais provável para essa falha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Delta Lake limita por padrão a consulta a apenas a versão mais recente e a versão imediatamente anterior a ela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um VACUUM já removeu, por estarem fora do período de retenção configurado, arquivos que a versão 5 referencia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Consultar uma versão antiga exige recriar a tabela num novo caminho do armazenamento antes de rodar VERSION AS OF.",
                                "isCorrect": false
                            },
                            {
                                "text": "O _delta_log guarda somente o número da última versão gravada, sem manter registro de nenhuma versão anterior.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório mensal precisa ser reproduzido exatamente como foi gerado na virada do mês passado, usando os mesmos dados que existiam naquele momento, mesmo que a tabela tenha recebido várias cargas depois disso. Qual abordagem resolve isso sem duplicar a tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aplicar um MERGE que reverte manualmente cada carga feita depois da data original do relatório, linha por linha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Filtrar a tabela atual por uma coluna de data de carga, assumindo que ela sempre reflete o estado histórico completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar a tabela com TIMESTAMP AS OF o instante da geração original do relatório, sem alterar o estado atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Exportar a tabela inteira para um arquivo à parte toda virada de mês, mantendo manualmente uma cópia paralela.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Compactação e otimização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Compactação e otimização\n\nO módulo sobre organização do data lake já mostrou o problema: streaming de baixa latência, cargas incrementais frequentes e MERGEs pequenos e repetidos vão deixando a tabela cheia de arquivos pequenos. Cada arquivo a mais custa uma chamada de listagem no object storage e uma task extra para o engine agendar, então uma tabela com milhões de arquivos de poucos megabytes fica lenta de ler mesmo que o volume total de dados seja modesto. `OPTIMIZE` existe para reverter exatamente isso."
                    },
                    {
                        "type": "text",
                        "value": "## OPTIMIZE: bin-packing de small files\n\n`OPTIMIZE` lê os arquivos pequenos de uma tabela (ou de uma partição específica) e os reagrupa em arquivos maiores, próximos de um tamanho-alvo, um processo chamado bin-packing. O resultado é uma tabela com muito menos arquivos, cada um maior, mantendo os dados idênticos. Como qualquer escrita numa tabela Delta, `OPTIMIZE` gera uma nova versão no `_delta_log`: os arquivos antigos não somem na hora, eles deixam de ser referenciados pela versão mais recente, mas continuam no armazenamento até uma limpeza posterior."
                    },
                    {
                        "type": "code",
                        "value": "-- compactar toda a tabela\nOPTIMIZE lake.gold.pedidos;\n\n-- compactar só uma partição (reduz o custo da operação)\nOPTIMIZE lake.gold.pedidos WHERE data_pedido = '2026-07-01';\n\n-- compactar e colocar dados relacionados juntos (Z-ORDER)\nOPTIMIZE lake.gold.pedidos ZORDER BY (id_cliente, uf);\n\n# o mesmo via PySpark, com a API DeltaTable\nfrom delta.tables import DeltaTable\n\ntabela = DeltaTable.forName(spark, \"lake.gold.pedidos\")\ntabela.optimize().executeCompaction()\ntabela.optimize().executeZOrderBy(\"id_cliente\", \"uf\")"
                    },
                    {
                        "type": "text",
                        "value": "## Z-ORDER: colocar dados relacionados juntos\n\n`OPTIMIZE ... ZORDER BY` faz mais do que bin-packing: ele ordena os dados de um jeito que linhas com valores parecidos, nas colunas indicadas, terminem fisicamente nos mesmos arquivos. Cada arquivo Parquet já guarda estatísticas (valor mínimo e máximo por coluna), e o engine usa essas estatísticas para pular arquivos inteiros que não podem satisfazer um filtro, uma técnica chamada data skipping. Sem Z-ORDER, linhas de um mesmo cliente ou de uma mesma UF ficam espalhadas por muitos arquivos, e um filtro por essa coluna precisa abrir quase todos eles; com Z-ORDER pelas colunas mais usadas em filtros, o mesmo filtro pula a maior parte dos arquivos sem nem abri-los."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Efeito na leitura\"],[\"Milhares de arquivos pequenos, sem Z-ORDER\",\"Muitas chamadas de listagem e tasks pequenas; filtros abrem quase todos os arquivos\"],[\"Depois de OPTIMIZE, sem ZORDER BY\",\"Menos arquivos, maiores; menos overhead de listagem e agendamento\"],[\"Depois de OPTIMIZE ZORDER BY na coluna do filtro\",\"Além do ganho anterior, filtros por essa coluna pulam a maioria dos arquivos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O ganho na leitura, e o custo de gerar esse ganho\n\n`OPTIMIZE` reduz o tempo de leitura, mas ele mesmo é uma operação de escrita: reescreve dados, consome cluster e gera uma versão nova, então não faz sentido rodá-la a cada micro-lote. A prática comum é agendar `OPTIMIZE` periodicamente (diário, por exemplo, ou depois de cada janela de cargas), em vez de a cada gravação individual, equilibrando o custo de compactar com o ganho de ler uma tabela já compactada. Os arquivos substituídos continuam ocupando espaço até serem removidos de fato, o que é assunto do vacuum."
                    },
                    {
                        "type": "quote",
                        "value": "OPTIMIZE compacta os arquivos; ZORDER BY também organiza o conteúdo deles. O primeiro ataca o excesso de arquivos, o segundo ataca quantos arquivos um filtro precisa abrir."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a operação OPTIMIZE faz, na sua forma mais básica, sobre uma tabela do lakehouse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Remove permanentemente do armazenamento os arquivos de versões antigas que não são mais referenciados pela tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reordena as colunas de cada arquivo Parquet, sem alterar a quantidade nem o tamanho dos arquivos da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplica automaticamente um filtro de qualidade nos dados, descartando linhas duplicadas encontradas na tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reagrupa arquivos pequenos em arquivos maiores, próximos de um tamanho-alvo, reduzindo o total de arquivos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela gold recebe MERGEs pequenos a cada poucos minutos, ao longo do dia inteiro. Depois de alguns meses, ela acumula milhões de arquivos de poucos megabytes cada, e consultas simples ficam visivelmente mais lentas mesmo filtrando por poucas partições. Qual prática ataca diretamente essa causa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Agendar OPTIMIZE periodicamente sobre a tabela, compactando os arquivos pequenos acumulados pelos MERGEs frequentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir a frequência dos MERGEs para uma vez por semana, mantendo os arquivos pequenos acumulados sem compactação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições da tabela, distribuindo os arquivos pequenos existentes entre mais pastas no lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a tabela de Delta Lake para Parquet puro, eliminando a camada de metadados responsável pelos arquivos pequenos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela é frequentemente filtrada por id_cliente, mas os dados de cada cliente estão espalhados por praticamente todos os arquivos da tabela. Um OPTIMIZE simples, sem ZORDER, já reduz o número de arquivos, mas os filtros por id_cliente continuam abrindo quase todos eles. O que resolve esse segundo problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reparticionar fisicamente a tabela por id_cliente, criando uma pasta separada no armazenamento para cada cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar OPTIMIZE ZORDER BY (id_cliente), colocando fisicamente juntos, nos mesmos arquivos, dados do mesmo cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar um índice secundário sobre id_cliente numa tabela relacional externa, referenciado pelas consultas ao lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir ainda mais o tamanho-alvo dos arquivos do OPTIMIZE, gerando mais arquivos menores para cada cliente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Logo depois de um OPTIMIZE ZORDER BY numa tabela grande, o espaço ocupado no armazenamento aumenta em vez de diminuir, mesmo a tabela tendo menos arquivos visíveis na versão mais recente. Qual é a explicação para esse comportamento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O ZORDER BY duplica cada linha da tabela em dois arquivos diferentes, um ordenado e outro na ordem original de chegada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O OPTIMIZE sempre falha silenciosamente ao final, deixando tanto os arquivos antigos quanto os novos como válidos ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A compactação converteu os arquivos de Parquet para um formato intermediário maior, usado só durante a ordenação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os arquivos antigos, substituídos pelos novos, continuam ocupando espaço até serem removidos por um VACUUM posterior.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide rodar OPTIMIZE a cada MERGE individual, imediatamente após cada pequena carga incremental, buscando manter a tabela sempre compactada. Qual é o principal problema prático dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "OPTIMIZE também é uma operação de escrita que consome cluster; rodá-la a cada carga pequena custa mais do que economiza.",
                                "isCorrect": true
                            },
                            {
                                "text": "OPTIMIZE não pode ser executado mais de uma vez por dia sobre a mesma tabela, por limitação do formato Delta Lake.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada execução de OPTIMIZE apaga o histórico de versões anteriores da tabela, impedindo qualquer time travel depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "OPTIMIZE muda o schema da tabela a cada execução, exigindo migração manual de todas as consultas feitas sobre ela.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Vacuum e retenção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Vacuum e retenção\n\nToda vez que um MERGE, um DELETE ou um OPTIMIZE substitui arquivos numa tabela Delta, os arquivos antigos não são apagados na hora: eles só deixam de ser referenciados pela versão mais recente. Isso é proposital, é o que sustenta o time travel do módulo anterior, mas também significa que uma tabela ativa acumula arquivos órfãos indefinidamente se nada os remover de verdade do armazenamento. É essa limpeza que o `VACUUM` faz."
                    },
                    {
                        "type": "text",
                        "value": "## O que o VACUUM remove\n\n`VACUUM` apaga, do armazenamento físico, os arquivos de dados que não são referenciados por nenhuma versão dentro do período de retenção configurado. Um arquivo só é candidato à remoção se duas condições forem verdadeiras ao mesmo tempo: ele não pertence à versão atual da tabela, e ele é mais antigo do que o limite de retenção. O `_delta_log` em si (os commits JSON e os checkpoints) segue uma retenção própria, tipicamente mais longa, e não é o alvo do `VACUUM`."
                    },
                    {
                        "type": "code",
                        "value": "-- vacuum com a retenção padrão (7 dias / 168 horas)\nVACUUM lake.gold.pedidos;\n\n-- vacuum com uma retenção explícita, em horas\nVACUUM lake.gold.pedidos RETAIN 168 HOURS;\n\n-- só lista os arquivos que seriam removidos, sem apagar nada\nVACUUM lake.gold.pedidos DRY RUN;\n\n# o mesmo via PySpark, com a API DeltaTable\nfrom delta.tables import DeltaTable\n\ntabela = DeltaTable.forName(spark, \"lake.gold.pedidos\")\ntabela.vacuum()        # usa a retenção padrão\ntabela.vacuum(168)     # retenção explícita, em horas"
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off: retenção curta economiza, mas quebra time travel\n\nO padrão do Delta Lake é reter 7 dias (168 horas) de arquivos removíveis antes de um `VACUUM` poder apagá-los de fato, e existe uma checagem de segurança que, por padrão, impede retenções menores do que essa. A razão é dupla: uma consulta de time travel para uma versão cujos arquivos já foram removidos passa a falhar, e uma leitura longa que começou antes do `VACUUM`, ainda usando arquivos antigos como referência, pode quebrar no meio se esses arquivos desaparecerem do armazenamento antes dela terminar. Reduzir a retenção para economizar espaço mais rápido é possível, mas troca alcance de auditoria e segurança de leituras em andamento por espaço em disco liberado antes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Configuração de retenção\",\"Efeito\"],[\"7 dias (padrão)\",\"Time travel garantido por pelo menos uma semana; leituras longas têm margem de sobra para terminar\"],[\"Poucas horas, com a checagem de segurança desativada\",\"Libera espaço mais rápido; quebra time travel para versões fora dessa janela\"],[\"DRY RUN antes de rodar de verdade\",\"Mostra quais arquivos seriam removidos, sem apagar nada, útil para validar antes\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Vacuum como rotina operacional\n\nNa prática, `VACUUM` costuma rodar como uma rotina agendada, depois de janelas de `OPTIMIZE`, e não a cada escrita individual. O período de retenção ideal depende de quem usa a tabela: pipelines com leituras longas ou exigências de auditoria pedem retenção mais generosa; tabelas de estágio, sem requisito de histórico, toleram uma limpeza mais agressiva. Essa decisão pertence a quem é dono da tabela, não é um valor único correto para o lakehouse inteiro."
                    },
                    {
                        "type": "quote",
                        "value": "VACUUM libera espaço apagando o que o OPTIMIZE e o MERGE deixaram para trás; o preço de apagar cedo demais é perder o alcance do time travel exatamente na janela que acabou de ser liberada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de um OPTIMIZE que compactou small files numa tabela Delta, os arquivos pequenos substituídos continuam ocupando espaço no armazenamento. Qual comando remove, de fato, esses arquivos que já não são referenciados pela versão atual?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "OPTIMIZE lake.gold.pedidos ZORDER BY, executado uma segunda vez, que também remove os arquivos da execução anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "DESCRIBE HISTORY lake.gold.pedidos, que localiza e apaga automaticamente qualquer arquivo órfão listado no log.",
                                "isCorrect": false
                            },
                            {
                                "text": "VACUUM lake.gold.pedidos, que apaga do armazenamento os arquivos fora do período de retenção configurado.",
                                "isCorrect": true
                            },
                            {
                                "text": "RESTORE TABLE lake.gold.pedidos, que reverte a tabela para antes do OPTIMIZE e libera o espaço usado por ele.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o período de retenção padrão que o VACUUM respeita antes de considerar um arquivo elegível para remoção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "24 horas, o suficiente apenas para leituras iniciadas no mesmo dia da execução do VACUUM sobre a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "7 dias (168 horas), tempo padrão pensado para não quebrar time travel nem leituras longas em andamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "30 dias, o mesmo período usado por padrão para a retenção dos commits armazenados no _delta_log da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não existe um padrão: toda execução de VACUUM exige que um período de retenção seja informado explicitamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe reduz a retenção do VACUUM para poucas horas, desativando a checagem de segurança padrão, para liberar espaço rapidamente numa tabela grande. Dias depois, uma consulta de time travel para uma versão de uma semana atrás passa a falhar. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os arquivos referenciados por aquela versão antiga já foram removidos pelo VACUUM, fora da janela curta de retenção.",
                                "isCorrect": true
                            },
                            {
                                "text": "O _delta_log foi corrompido pela redução da retenção, exigindo a recriação completa da tabela a partir da origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultas de time travel param de funcionar permanentemente depois da primeira execução de VACUUM sobre a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão de uma semana atrás nunca existiu de fato, pois o VACUUM reescreve o número de todas as versões da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de rodar VACUUM com uma retenção reduzida numa tabela de produção, um engenheiro quer confirmar exatamente quais arquivos seriam removidos, sem apagar nada ainda. Qual comando atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "VACUUM tabela RETAIN 0 HOURS, que remove só os arquivos mais recentes, deixando o restante intacto para conferência.",
                                "isCorrect": false
                            },
                            {
                                "text": "DESCRIBE HISTORY tabela, que lista, junto de cada versão, os arquivos físicos que seriam candidatos à remoção.",
                                "isCorrect": false
                            },
                            {
                                "text": "VACUUM tabela DRY RUN, que lista os arquivos elegíveis para remoção sem de fato apagar nenhum deles do armazenamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "OPTIMIZE tabela ZORDER BY, que reorganiza os arquivos antes da limpeza, tornando a lista de remoção mais precisa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de estágio, sem requisito de auditoria e sem consultas de time travel, acumula um volume grande de arquivos órfãos por causa de MERGEs diários. Uma tabela gold, usada por relatórios que às vezes precisam reproduzir um resultado de semanas atrás, tem o mesmo padrão de carga. Qual decisão de retenção faz mais sentido para as duas tabelas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar a mesma retenção padrão de 7 dias para as duas tabelas, já que o VACUUM não permite valores diferentes por tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar o VACUUM por completo nas duas tabelas, evitando qualquer risco de quebrar consultas de time travel futuras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar retenção agressiva na tabela gold, já que relatórios são mais críticos e toleram menos espaço ocupado em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter retenção mais curta na tabela de estágio e mais generosa na gold, de acordo com a necessidade real de cada uma.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Particionamento e ordenação para performance",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Particionamento e ordenação para performance\n\nO módulo sobre organização do data lake já apresentou particionamento como pastas no armazenamento, uma por valor (ou faixa de valores) de uma coluna. Numa tabela do lakehouse essa decisão de design continua central, só que agora ela compete com outra ferramenta deste módulo, o Z-ORDER, e a pergunta certa deixa de ser \"particiono por qual coluna\" e passa a ser \"particiono por essa coluna, ordeno por aquela outra, ou nenhum dos dois\"."
                    },
                    {
                        "type": "text",
                        "value": "## Particionar pela coluna de filtro comum\n\nParticionar bem significa escolher uma coluna que aparece com frequência num filtro das consultas mais comuns sobre a tabela, e que tem cardinalidade moderada, nem poucos valores demais, nem valores demais (o problema do próximo bloco). Datas truncadas por dia ou por mês costumam ser a escolha mais comum, porque a maioria dos pipelines e relatórios filtra por período. Com a tabela particionada assim, um filtro por data permite ao engine ignorar pastas inteiras sem abrir nenhum arquivo dentro delas, uma técnica chamada partition pruning."
                    },
                    {
                        "type": "code",
                        "value": "-- criando uma tabela Delta particionada por data\nCREATE TABLE lake.gold.pedidos (\n  id_pedido BIGINT,\n  id_cliente BIGINT,\n  valor DECIMAL(10,2),\n  data_pedido DATE\n)\nUSING DELTA\nPARTITIONED BY (data_pedido);\n\n# o mesmo via PySpark, na escrita\n(df.write\n    .format(\"delta\")\n    .partitionBy(\"data_pedido\")\n    .save(\"/lake/gold/pedidos\"))\n\n-- consulta que se beneficia do partition pruning:\n-- o engine lê somente a pasta data_pedido=2026-07-01,\n-- ignorando por completo as demais pastas de data\nSELECT * FROM lake.gold.pedidos WHERE data_pedido = '2026-07-01';"
                    },
                    {
                        "type": "text",
                        "value": "## O overpartitioning: quando particionar demais atrapalha\n\nParticionar por uma coluna de cardinalidade alta, como id_cliente ou um timestamp completo até o segundo, parece uma boa ideia à primeira vista, afinal também é filtrada com frequência, mas na prática cria milhares ou milhões de pastas, cada uma com pouquíssimos arquivos, muitas vezes pequenos. Isso reproduz o problema de small files discutido antes neste módulo, e ainda soma um custo próprio: o motor de consulta precisa listar e rastrear metadados de um número enorme de partições só para decidir quais delas abrir, o que pode custar mais do que o pruning economiza."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Coluna de particionamento\",\"Cardinalidade\",\"Resultado típico\"],[\"data_pedido (truncada por dia)\",\"Moderada (uma partição por dia)\",\"Partições com volume razoável; pruning eficaz em filtros por período\"],[\"id_cliente\",\"Alta (uma partição por cliente)\",\"Excesso de partições pequenas; overpartitioning e small files\"],[\"timestamp completo, até o segundo\",\"Praticamente única por linha\",\"Uma partição quase por registro; caso extremo de overpartitioning\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Ordenar e clusterizar dentro da partição\n\nQuando a coluna mais filtrada tem cardinalidade alta demais para particionar, a resposta não é particionar por ela mesmo assim: é usar `OPTIMIZE ... ZORDER BY`, do bloco anterior deste módulo, dentro de cada partição. A combinação comum é particionar pela coluna grosseira e comum a quase toda consulta (a data), e clusterizar com Z-ORDER pela coluna fina, de cardinalidade mais alta (o cliente, o produto), que aparece em filtros mais específicos. O resultado são poucas partições, cada uma já organizada internamente para um data skipping eficaz, em vez de uma partição minúscula por valor."
                    },
                    {
                        "type": "quote",
                        "value": "Particionar ataca quais pastas abrir; Z-ORDER ataca quais arquivos abrir dentro delas. Escolher mal a coluna de particionamento não se corrige com mais partições, se corrige trocando partição fina demais por ordenação."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o particionamento de uma tabela do lakehouse por uma coluna de data permite que o engine faça ao processar um filtro por período?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Comprimir os arquivos daquele período usando um algoritmo diferente do restante da tabela, reduzindo o espaço ocupado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar as pastas de outras datas, sem abrir nenhum arquivo dentro delas, um recurso chamado partition pruning.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criar automaticamente um índice secundário sobre a coluna de data, consultado antes de qualquer leitura de arquivo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reordenar os arquivos de todas as partições por data, mesmo os de partições que não fazem parte do filtro atual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela é particionada por id_cliente, coluna com milhões de valores distintos e poucos pedidos por cliente. Depois de algum tempo em produção, a tabela acumula milhões de pastas, cada uma com poucos arquivos pequenos, e o planejamento das consultas fica visivelmente mais lento, mesmo antes de qualquer arquivo ser lido. Qual é o diagnóstico mais direto desse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A tabela precisa de mais réplicas do catálogo de metadados, já que o problema está na infraestrutura do metastore.",
                                "isCorrect": false
                            },
                            {
                                "text": "O formato Parquet não suporta tabelas com mais de algumas centenas de milhares de partições, exigindo migrar para CSV.",
                                "isCorrect": false
                            },
                            {
                                "text": "O engine está aplicando Z-ORDER automaticamente sobre id_cliente, o que não deveria acontecer sem configuração explícita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Overpartitioning: id_cliente tem cardinalidade alta demais para ser coluna de partição, gerando excesso de pastas pequenas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela particionada por data_pedido também é filtrada com frequência por id_produto, coluna de cardinalidade alta. Particionar também por id_produto geraria um número excessivo de subpastas por dia. Qual abordagem atende esse segundo filtro sem recriar o problema de overpartitioning?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma segunda cópia completa da tabela, particionada exclusivamente por id_produto, mantida em paralelo à primeira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tamanho-alvo de arquivo do OPTIMIZE, o que compensa automaticamente a ausência de partição por id_produto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar OPTIMIZE ZORDER BY (id_produto) dentro das partições de data existentes, sem particionar por id_produto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover o particionamento por data_pedido, já que ele passa a ser redundante assim que id_produto entra nos filtros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas tabelas de mesmo volume total de dados são comparadas: a primeira é particionada por mês e cada partição tem poucos gigabytes; a segunda é particionada por dia e hora, e cada partição tem poucos megabytes. Consultas que filtram por um intervalo de várias semanas rodam mais devagar na segunda tabela. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A segunda tabela tem partições pequenas demais para o volume de dados, somando overhead de metadados que supera o pruning.",
                                "isCorrect": true
                            },
                            {
                                "text": "A primeira tabela não suporta partition pruning, já que partições mensais são grandes demais para esse recurso funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença de desempenho não tem relação com o particionamento, apenas com o formato de arquivo usado em cada tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A segunda tabela aplica Z-ORDER automaticamente por ter mais partições, o que deveria acelerar consultas, não desacelerar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está decidindo o layout de uma tabela gold nova: os filtros mais comuns são por mês, presente em quase toda consulta, e por região, coluna com poucas dezenas de valores distintos. Qual combinação de particionamento e ordenação costuma equilibrar melhor pruning e o número de partições?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Particionar só por região, já que ela tem cardinalidade menor do que o mês, e ignorar o filtro por mês no layout físico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Particionar pelo mês, a coluna presente em quase toda consulta, e usar Z-ORDER por região dentro de cada partição mensal.",
                                "isCorrect": true
                            },
                            {
                                "text": "Particionar por mês e por região ao mesmo tempo, multiplicando o número de partições pela combinação das duas colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não particionar por nenhuma das duas colunas, aplicando só Z-ORDER pelas duas ao mesmo tempo na tabela inteira.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Lakehouse na prática de engenharia de dados",
        "aulas": [
            {
                "titulo": "Governança: catálogo, controle de acesso e linhagem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Governança: catálogo, controle de acesso e linhagem\n\nUm lakehouse bem-sucedido atrai uso: mais times, mais pipelines, mais consultas ad-hoc, mais modelos de machine learning lendo as mesmas tabelas. Esse é o objetivo, mas também é o momento em que uma arquitetura sem governança começa a doer. Se qualquer pessoa com acesso ao object storage consegue ler qualquer arquivo, e não existe registro de quem alterou o quê nem de onde um dado veio, o lakehouse vira o data swamp que a trilha alertou lá no primeiro módulo, só que em escala maior e com mais gente dependendo dele."
                    },
                    {
                        "type": "text",
                        "value": "## Catálogo governado: além do metadado\n\nNos módulos anteriores, o catálogo (Hive Metastore, Glue) resolveu um problema pontual: guardar schema e localização das tabelas para que um engine soubesse onde ler cada arquivo Parquet. Um catálogo governado, como o Unity Catalog (aqui como ilustração do conceito), vai além:\n\n- **Controle de acesso central**: permissões de leitura e escrita definidas uma vez, aplicadas a qualquer engine que consulte a tabela (Spark, SQL, notebook, ferramenta de BI).\n- **Granularidade fina**: não só banco e tabela, mas coluna (mascarar um CPF) e linha (um analista só vê os pedidos da própria região).\n- **Auditoria**: um histórico de quem acessou o quê e quando, essencial em setores regulados.\n- **Linhagem automática**: de onde cada tabela e cada coluna vieram, capturada a partir das próprias consultas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Catálogo de metadados (Hive Metastore, Glue)\", \"Catálogo governado (Unity Catalog em conceito)\"], [\"Escopo\", \"Schema e localização das tabelas\", \"Schema, localização, acesso, auditoria e linhagem\"], [\"Granularidade de acesso\", \"Em geral por banco ou por tabela\", \"Por tabela, coluna e linha\"], [\"Quem aplica a permissão\", \"Cada engine decide sozinho, se decidir\", \"Um ponto central, válido para todos os engines\"], [\"Auditoria\", \"Não existe nativamente\", \"Trilha de quem leu ou alterou cada tabela\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Controle de acesso num catalogo governado (sintaxe ilustrativa do conceito)\n\n-- acesso de leitura por tabela, valido para qualquer engine conectado ao catalogo\nGRANT SELECT ON TABLE lakehouse.silver.pedidos TO ROLE analista_vendas;\n\n-- revogando acesso de um time que mudou de projeto\nREVOKE SELECT ON TABLE lakehouse.gold.metricas_financeiras FROM ROLE estagiario;\n\n-- mascaramento de coluna sensivel: fora do time de dados pessoais, o cpf aparece truncado\nCREATE VIEW lakehouse.silver.clientes_mascarada AS\nSELECT\n    id_cliente,\n    CASE\n        WHEN IS_MEMBER('time_dados_pessoais') THEN cpf\n        ELSE CONCAT('***.***.***-', SUBSTRING(cpf, -2))\n    END AS cpf,\n    cidade,\n    uf\nFROM lakehouse.silver.clientes;"
                    },
                    {
                        "type": "text",
                        "value": "## Linhagem de dados\n\nLinhagem (lineage) é o mapa de como um dado nasceu e se transformou: de qual fonte veio, quais jobs leram e escreveram cada tabela, e quais tabelas e dashboards dependem dela hoje. Em tabelas de table format aberto (Delta, Iceberg), boa parte dessa informação pode ser capturada automaticamente pelo catálogo, a partir das próprias consultas e jobs que leem e escrevem, sem depender de documentação mantida à mão.\n\nDois usos práticos:\n\n- **Análise de impacto**: antes de remover ou renomear uma coluna na camada silver, a linhagem mostra quais tabelas gold e quais dashboards quebram.\n- **Investigação de origem**: quando um número parece errado num relatório, a linhagem permite voltar até a tabela bronze e o job que introduziu o problema, em vez de reprocessar tudo tentando adivinhar."
                    },
                    {
                        "type": "quote",
                        "value": "Um lakehouse sem governança é um data lake com um nome mais bonito: os arquivos continuam abertos para qualquer engine ler, mas ninguém sabe ao certo quem pode ver o quê, nem de onde cada dado veio."
                    },
                    {
                        "type": "text",
                        "value": "## Quando priorizar governança\n\nGovernança tem custo de implementação e não é gratuita em complexidade. Para um time único, com um engine e poucas tabelas, um catálogo simples e boas práticas de nomenclatura já resolvem. Ela deixa de ser opcional quando o lakehouse passa a ser compartilhado: vários times, dados sensíveis misturados com dados públicos, e mais de um engine consultando as mesmas tabelas. É justamente essa leitura compartilhada, por engines diferentes, sobre o mesmo table format aberto, o assunto da próxima aula."
                    }
                ],
                "questions": [
                    {
                        "statement": "Além de guardar schema e localização das tabelas, como já faziam o Hive Metastore e o Glue, o que um catálogo governado (a exemplo do Unity Catalog) acrescenta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Controle de acesso central por tabela e coluna, auditoria e linhagem, válidos em qualquer engine.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um cache de resultados que evita reprocessar a mesma consulta repetida num engine de leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um formato de arquivo mais rápido para leitura, no lugar do Parquet usado pelas tabelas do lakehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compactação automática dos arquivos Parquet, reduzindo o espaço ocupado no object storage.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela silver.clientes tem uma coluna cpf. A regra é: qualquer pessoa pode consultar a tabela normalmente, mas só o time de dados pessoais deve ver o CPF sem máscara. Qual abordagem resolve isso no catálogo, sem duplicar a tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Criar uma cópia física da tabela sem a coluna cpf, exclusiva para quem não é do time de dados pessoais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir uma política de mascaramento de coluna no catálogo, conforme o grupo de quem consulta a tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mover a coluna cpf para uma tabela separada, liberada só mediante pedido manual ao time de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar o arquivo Parquet inteiro no storage, exigindo uma chave compartilhada para qualquer leitura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de remover uma coluna de uma tabela silver que alimenta vários relatórios, um engenheiro de dados quer saber quais tabelas gold e quais dashboards deixariam de funcionar. Qual recurso responde essa pergunta sem caçar manualmente cada pipeline?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O histórico de versões da tabela (time travel), que mostra como os dados estavam no passado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O log de auditoria de acesso, que registra quem consultou a tabela nos últimos meses.",
                                "isCorrect": false
                            },
                            {
                                "text": "A linhagem de dados do catálogo, que mapeia quais tabelas e consultas dependem dessa coluna.",
                                "isCorrect": true
                            },
                            {
                                "text": "O plano de execução (query plan) gerado na última consulta feita sobre essa tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time protegeu tabelas sensíveis só com permissões de bucket (IAM) no object storage, sem configurar nada no catálogo. Ao ligar um segundo engine de consulta, pessoas sem permissão passaram a enxergar dados que deveriam estar bloqueados. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O segundo engine tem, por padrão, acesso total a qualquer bucket conectado à própria conta na nuvem.",
                                "isCorrect": false
                            },
                            {
                                "text": "As permissões de bucket configuradas expiram sozinhas depois de alguns dias e precisam ser renovadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O novo engine ignora qualquer permissão que não esteja registrada no seu próprio metastore interno.",
                                "isCorrect": false
                            },
                            {
                                "text": "A permissão ficou só no storage, sem noção de tabela, e não é reforçada por um catálogo comum aos engines.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de compliance pede, a qualquer momento, provar quais pipelines leram uma tabela com dados de cartão de crédito nos últimos seis meses. Hoje isso está espalhado em documentação manual desatualizada. Qual mudança resolve isso de forma sustentável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adotar um catálogo governado, que registra auditoria e linhagem a partir das consultas e jobs reais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pedir que cada time atualize uma planilha compartilhada sempre que criar um pipeline que leia a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar a tabela para um formato de arquivo mais novo, que já guarda o histórico de leituras dentro de si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a frequência dos backups da tabela, para reconstruir o histórico de acessos a partir deles.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Engines sobre o lakehouse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Engines sobre o lakehouse\n\nNum data warehouse tradicional, os dados vivem dentro do próprio motor: para consultar de outra ferramenta, é preciso exportar ou replicar. O lakehouse inverte essa relação. Os dados moram em object storage, em Parquet, organizados por um table format aberto (Delta Lake, Iceberg ou Hudi), e o catálogo descreve onde cada tabela está. Qualquer engine que saiba ler esse formato pode consultar a mesma tabela, ao mesmo tempo, sem cópia."
                    },
                    {
                        "type": "text",
                        "value": "## Um formato, vários motores\n\nCada engine resolve a mesma pergunta antes de qualquer leitura: quais arquivos Parquet compõem esta tabela agora (ou nesta versão)? Essa resposta vem do transaction log (`_delta_log`, no Delta) ou dos metadados de snapshot (no Iceberg), não do engine. É por isso que motores bem diferentes conseguem coexistir sobre a mesma tabela:\n\n- **Spark**: processamento pesado, ETL em lote, jobs de machine learning, o motor já usado nas trilhas anteriores para escrever bronze, silver e gold.\n- **Trino ou Presto**: SQL interativo e federado, otimizado para consultas ad-hoc de baixa latência, comum em ferramentas de BI e exploração.\n- **Databricks SQL**: um warehouse otimizado para consultas sobre tabelas Delta, competindo em performance com bancos analíticos dedicados.\n- **Snowflake (em conceito)**: pode consultar tabelas Iceberg externas ao seu próprio storage, unindo dados do lakehouse aos dados nativos."
                    },
                    {
                        "type": "code",
                        "value": "Object storage (S3 / GCS / ADLS)\n        |\n        v\nArquivos Parquet + metadados do table format (_delta_log ou snapshots Iceberg)\n        |\n        v\nCatalogo (aponta cada tabela para seus arquivos e sua versao atual)\n   |          |             |              |\n Spark    Trino/Presto   Databricks SQL   Snowflake\n(ETL,     (SQL           (BI,             (consulta\n lote)     interativo)    dashboards)      tabela externa)\n\nMesma tabela, mesma versao, lida por motores diferentes, ao mesmo tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Engine\", \"Uso típico sobre o lakehouse\"], [\"Spark\", \"ETL pesado em lote, transformações complexas, jobs de machine learning\"], [\"Trino / Presto\", \"SQL federado e interativo, consultas ad-hoc de baixa latência\"], [\"Databricks SQL\", \"Consultas otimizadas sobre tabelas Delta, dashboards e BI\"], [\"Snowflake (conceito)\", \"SQL corporativo, lê tabelas Iceberg externas junto com dados nativos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O valor do formato aberto: sem lock-in\n\nNum warehouse fechado, trocar de fornecedor significa migrar os dados: exportar, converter, carregar de novo, meses de projeto. Num lakehouse com table format aberto, os dados já estão em Parquet mais um log de metadados público. Trocar (ou somar) um engine é, na prática, uma configuração de acesso ao mesmo storage e ao mesmo catálogo, não uma migração de dados.\n\nEsse desacoplamento tem outra consequência prática: storage e compute escalam de forma independente. O storage cresce de forma barata e contínua, e o compute é ligado sob demanda, no engine certo para cada carga de trabalho, sem precisar provisionar capacidade de pico o tempo todo."
                    },
                    {
                        "type": "quote",
                        "value": "Trocar de engine deixa de ser um projeto de migração de dados e passa a ser uma configuração de acesso: os dados continuam exatamente onde estavam."
                    },
                    {
                        "type": "text",
                        "value": "## Cuidados ao misturar engines\n\nCompartilhar uma tabela entre engines não dispensa cuidado. Escritas concorrentes de motores diferentes ainda dependem do controle de concorrência do table format, visto no módulo anterior, para não corromper a tabela. E nem todo engine implementa cada recurso do formato da mesma forma: um pode não suportar certas otimizações, ou ler apenas uma versão mais antiga do protocolo. Vale checar a compatibilidade antes de assumir que qualquer engine lê qualquer tabela sem restrição.\n\nUm dos usos mais comuns de múltiplos motores escrevendo na mesma tabela é a ingestão contínua: um job de streaming gravando eventos na camada bronze enquanto engines de lote leem e transformam essa mesma tabela. Esse cenário é o assunto da próxima aula."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que permite que Spark, Trino e Databricks SQL consultem a mesma tabela de um lakehouse, ao mesmo tempo, sem que cada um precise de uma cópia própria dos dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada engine mantém uma cópia própria da tabela, sincronizada em segundo plano, de forma transparente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados ficam em Parquet sobre object storage, num table format e catálogo comuns a todo engine.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os engines trocam mensagens entre si em tempo real para combinar o resultado final de cada consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O lakehouse converte os dados para o formato nativo de cada engine antes de toda leitura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa usava só Spark para consultar seu lakehouse. Para atender o time de BI com consultas interativas de baixa latência, quer somar o Trino, sem duplicar tabelas nem montar um pipeline de exportação. Isso é viável porque, principalmente, o quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Trino converte as tabelas para seu formato interno automaticamente, na primeira consulta feita.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark expõe uma API própria que o Trino consulta para buscar os dados já processados antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "As tabelas usam um table format aberto sobre object storage, e o Trino lê esse mesmo formato direto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O time de BI vai consultar uma réplica do lakehouse, atualizada em lote todas as noites.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante o fechamento mensal, o time de finanças precisa de muito mais poder de processamento por alguns dias; no resto do mês, o uso é baixo. Como esse pico costuma ser tratado no lakehouse, sem desperdiçar recursos o mês inteiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Redimensionando o object storage para aguentar mais requisições simultâneas durante o pico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrando as tabelas para um cluster maior de forma permanente, já prevendo os picos futuros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duplicando as tabelas num segundo catálogo dedicado exclusivamente ao time de finanças.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escalando o compute sob demanda só durante o pico, já que ele é independente do storage.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job Spark de ETL e uma escrita manual feita direto pelo Trino tentam gravar na mesma tabela Delta ao mesmo tempo. O que evita que essa concorrência corrompa a tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O controle de concorrência do table format, que faz a segunda escrita revalidar a versão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O catálogo bloqueia qualquer escrita adicional assim que percebe a primeira em andamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage rejeita, por padrão, gravações simultâneas no mesmo prefixo de pasta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada engine grava numa cópia temporária da tabela, unidas manualmente ao final do processo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time habilitou um recurso recente do table format numa tabela Delta usada por três engines diferentes. Depois disso, um dos engines mais antigos passou a falhar ao ler a tabela. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O recurso novo corrompeu os arquivos Parquet, tornando-os ilegíveis para qualquer engine.",
                                "isCorrect": false
                            },
                            {
                                "text": "O engine mais antigo do trio não acompanha a versão nova do protocolo do table format.",
                                "isCorrect": true
                            },
                            {
                                "text": "O catálogo perdeu a referência da tabela para os engines que não leram logo após a mudança.",
                                "isCorrect": false
                            },
                            {
                                "text": "O object storage passou a aplicar uma política de acesso diferente para cada engine.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Streaming para o lakehouse: uma introdução",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Streaming para o lakehouse: uma introdução\n\nAté aqui, a trilha tratou a ingestão como um processo em lote: um job roda, lê um recorte de dados (completo ou incremental), transforma e escreve, e fica parado até a próxima execução agendada pelo orquestrador. Isso cobre boa parte dos casos reais, mas não todos. Cliques num site, leituras de sensores, mudanças numa tabela transacional (CDC): essas fontes produzem eventos continuamente, e esperar um agendamento de hora em hora pode ser tarde demais. O lakehouse também sabe receber esse tipo de fonte."
                    },
                    {
                        "type": "text",
                        "value": "## De lote para streaming: o que muda\n\nUm job em lote roda, processa um recorte de dados e termina. Um job de streaming fica em execução contínua, processando os eventos (ou pequenos lotes de eventos, os chamados micro-batches) à medida que chegam, e escrevendo na tabela de destino repetidamente, em vez de uma vez só.\n\nO ponto importante para esta trilha: a tabela de destino continua sendo a mesma tabela do table format aberto já estudada, uma tabela Delta, por exemplo. Um job de streaming escreve nela; jobs em lote leem e escrevem na mesma tabela depois. Streaming e lote não são dois mundos de armazenamento separados, são duas formas de alimentar as mesmas tabelas do lakehouse."
                    },
                    {
                        "type": "code",
                        "value": "# Exemplo em conceito: Structured Streaming escrevendo numa tabela Delta bronze\n# (a fonte streaming aqui e ilustrativa; o foco e o padrao de escrita continua)\n\neventos = (\n    spark.readStream\n    .format('kafka')\n    .option('subscribe', 'eventos_pedidos')\n    .load()\n)\n\n(\n    eventos\n    .writeStream\n    .format('delta')\n    .outputMode('append')\n    .option('checkpointLocation', '/lakehouse/_checkpoints/bronze_pedidos')\n    .start('/lakehouse/bronze/pedidos')\n)\n\n# o checkpoint guarda o progresso: se o job cair e reiniciar,\n# ele retoma de onde parou, sem reprocessar nem perder eventos"
                    },
                    {
                        "type": "text",
                        "value": "## Streaming alimentando a camada bronze\n\nO padrão mais comum não substitui o pipeline em lote já estudado, ele o alimenta. Um job de streaming escreve continuamente na camada bronze, em modo append, com transformação mínima, o mesmo espírito da bronze em lote: guardar o dado como chegou. Jobs em lote, agendados pelo orquestrador, continuam responsáveis por consolidar, aplicar `MERGE`, compactar e promover os dados até silver e gold, exatamente como visto no módulo anterior.\n\nEssa combinação, streaming alimentando a bronze e lote consolidando o restante, costuma ser chamada de arquitetura em quase tempo real: os dados ficam disponíveis em minutos na bronze, mesmo que a curadoria mais pesada continue rodando de hora em hora ou uma vez por dia."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Ingestão em lote\", \"Ingestão em streaming\"], [\"Execução\", \"Roda, processa um recorte e termina\", \"Fica em execução contínua\"], [\"Latência típica\", \"Minutos a horas, conforme o agendamento\", \"Segundos a poucos minutos\"], [\"Camada mais comum\", \"Qualquer camada, inclusive consolidação\", \"Bronze, com transformação mínima\"], [\"Quem consolida depois\", \"O próprio job já processa e organiza\", \"Jobs em lote, rodando por cima da bronze\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Streaming e lote não são dois lakehouses diferentes: são duas formas de alimentar e consolidar as mesmas tabelas, cada uma no ritmo que a fonte de dados exige."
                    },
                    {
                        "type": "text",
                        "value": "## Onde esta aula termina, de propósito\n\nEste é só um primeiro contato com streaming no lakehouse, o suficiente para reconhecer o padrão quando aparecer num pipeline real. Temas como watermarking, semântica exactly-once de ponta a ponta, joins entre streams e a operação de um job que roda 24 horas por dia ficam para a trilha de Streaming, dedicada ao assunto logo depois desta. Por ora, o que importa é: a mesma tabela do lakehouse pode ser escrita por streaming e por lote, e a camada bronze é o ponto de encontro mais comum entre os dois."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal ponto de conexão entre um job de streaming e os pipelines em lote já usados nas trilhas anteriores, ao alimentar um lakehouse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O job de streaming grava numa área temporária separada, copiada manualmente depois para as tabelas em lote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada fonte de streaming precisa de um table format próprio, diferente do usado pelos jobs em lote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ambos leem e escrevem nas mesmas tabelas do table format aberto, só muda a frequência e o padrão de escrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "O streaming substitui o orquestrador, já que passa a decidir sozinho quando os dados estão prontos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo de Structured Streaming escrevendo numa tabela Delta bronze, qual é a função do checkpointLocation configurado no writeStream?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Define o local onde a tabela Delta final fica armazenada no object storage.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guarda uma cópia de segurança completa dos dados já processados, para restaurar em caso de falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Define a frequência com que o job processa novos micro-batches de eventos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guarda o progresso do job, para retomar de onde parou sem reprocessar nem perder eventos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que a camada bronze costuma ser o destino mais comum de um job de streaming num lakehouse, em vez da silver ou da gold?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a bronze pede um append com transformação mínima, no ritmo de um job contínuo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque só a camada bronze aceita tabelas escritas por mais de um engine ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a silver e a gold não suportam o table format aberto usado pelo streaming.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o checkpoint do streaming só funciona quando aponta para a primeira camada do medalhão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa que um painel de fraude reaja a transações suspeitas em poucos minutos, não em horas. Qual mudança no pipeline de ingestão atende melhor essa exigência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir o intervalo do agendamento em lote no orquestrador para rodar a cada um minuto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a ingestão em lote na bronze por streaming, escrevendo eventos continuamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mover o processamento da silver para a bronze, pulando uma etapa do medalhão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar os recursos do cluster Spark do job em lote já existente, sem mudar sua frequência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer implementar, ainda nesta trilha de Data Lake e Lakehouse, uma solução completa de streaming com garantias de exactly-once ponta a ponta e joins entre múltiplos streams. Qual é a orientação correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Implementar tudo com Structured Streaming, já que o Spark do módulo de ETL cobre esses recursos sem ajuste algum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o table format Iceberg no lugar do Delta, porque só ele oferece exactly-once ponta a ponta em streaming.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tratar essa aula como uma introdução ao padrão, e aprofundar esses tópicos na trilha de Streaming dedicada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar a ingestão para fora do lakehouse, já que tabelas de table format aberto não suportam streaming avançado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Custo e desempenho no lakehouse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Custo e desempenho no lakehouse\n\nObject storage é barato: pagar por gigabyte armazenado no S3, GCS ou ADLS custa uma fração do que custava o storage de um warehouse tradicional. É tentador concluir que, no lakehouse, custo deixou de ser um problema. Não é bem assim: a conta cara raramente vem do armazenamento em si, vem do compute que varre esse armazenamento toda vez que alguém roda uma consulta. Quanto pior organizada a tabela, mais compute cada consulta consome para entregar a mesma resposta."
                    },
                    {
                        "type": "text",
                        "value": "## Se paga para escanear, não para guardar\n\nNa maioria dos engines sobre o lakehouse, o custo e o tempo de uma consulta são proporcionais aos bytes efetivamente lidos do storage, não ao tamanho total da tabela. Uma tabela de 10 TB bem organizada pode responder uma consulta lendo poucos gigabytes; a mesma tabela mal organizada pode forçar a leitura de boa parte dos 10 TB para a mesma pergunta.\n\nAs decisões de layout já estudadas nesta trilha, particionamento, compactação, ordenação dos dados dentro dos arquivos, deixam de ser só uma questão de organização e passam a ser, na prática, a principal alavanca de custo do lakehouse."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Alavanca\", \"Como reduz o quanto é escaneado\"], [\"Particionamento\", \"O engine descarta partições inteiras que não batem com o filtro da consulta\"], [\"Z-ORDER / clustering\", \"Agrupa valores parecidos no mesmo arquivo, permitindo pular arquivos inteiros\"], [\"Compactação (OPTIMIZE)\", \"Reduz o número de arquivos pequenos, cortando a sobrecarga de abrir cada um\"], [\"Cache do engine\", \"Reaproveita dados já lidos numa consulta anterior, sem voltar ao storage\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Estatisticas por arquivo que o table format mantem (conceito), usadas para pular arquivos inteiros\n-- arquivo               min(data_pedido)   max(data_pedido)\n-- part-0001.parquet     2026-01-01         2026-01-15\n-- part-0002.parquet     2026-01-16         2026-01-31\n-- part-0003.parquet     2026-02-01         2026-02-15\n\n-- consulta filtrando por fevereiro\nSELECT total FROM lakehouse.gold.pedidos\nWHERE data_pedido >= '2026-02-01' AND data_pedido < '2026-03-01';\n\n-- o engine compara o filtro com o min/max de cada arquivo e le so o part-0003.parquet,\n-- sem abrir os outros dois: e o data skipping em acao"
                    },
                    {
                        "type": "quote",
                        "value": "Storage barato é o motivo pelo qual times relaxam com o layout, e o motivo pelo qual a conta some no fim do mês: ninguém paga para guardar o dado, todo mundo paga para escaneá-lo de novo, mal organizado, a cada consulta."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modelo de compute\", \"Vantagem\", \"Cuidado\"], [\"Cluster sempre ligado\", \"Sem espera para começar a consultar, sem cold start\", \"Custa mesmo parado, ocioso na maior parte do dia\"], [\"Sob demanda / serverless\", \"Paga só pelo tempo de uso real, escala conforme a carga\", \"Pode ter um tempo de início na primeira consulta\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Custo é uma decisão de design, não um relatório mensal\n\nNa prática, a equipe que trata custo e desempenho como parte do design da tabela, e não como um problema para revisar depois que a fatura chega, quase sempre gasta menos e responde consultas mais rápido. As mesmas alavancas que melhoram desempenho, partição, compactação, ordenação, são, ao mesmo tempo, as alavancas de custo. É esse raciocínio, aplicado de forma consistente, que a última aula da trilha organiza em boas práticas e antipadrões para evitar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na maioria dos engines que consultam um lakehouse, de que o custo e o tempo de uma consulta dependem mais diretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Do tamanho total da tabela armazenada no object storage, independente do que a consulta filtra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Do número de colunas existentes na tabela, mesmo que a consulta não leia todas elas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Da quantidade de versões antigas mantidas pelo table format para fins de time travel.",
                                "isCorrect": false
                            },
                            {
                                "text": "Da quantidade de bytes efetivamente lidos do storage para responder aquela consulta específica.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela gold particionada por mês tem, dentro de cada partição, estatísticas de min/max de data_pedido por arquivo. Uma consulta filtra por um intervalo de três dias específicos. O que essas estatísticas permitem ao engine fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pular por completo os arquivos cujo intervalo de datas não cruza com o filtro da consulta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reordenar fisicamente os arquivos no storage para colocar os dias filtrados no início.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar automaticamente uma nova partição só com os três dias pedidos pela consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprimir, na hora, os arquivos fora do intervalo filtrado para acelerar a resposta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cluster Spark do lakehouse fica ligado 24 horas por dia, mas é usado ativamente só durante o horário comercial. Qual é o principal problema dessa configuração, do ponto de vista de custo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O cluster perde performance com o tempo, exigindo reinícios frequentes para manter a velocidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cluster custa mesmo ocioso, fora do horário em que alguém realmente está consultando os dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O cluster acumula arquivos temporários que precisam ser limpos manualmente todo fim de semana.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cluster impede que outros engines leiam as mesmas tabelas enquanto estiver ligado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela bronze recebe milhares de arquivos pequenos por dia, vindos de um job de streaming, e nunca passa por compactação. O volume em gigabytes armazenados é baixo, mas as consultas sobre essa tabela estão lentas e caras. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque arquivos pequenos ocupam mais espaço em disco do que arquivos grandes com o mesmo conteúdo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o table format não gera estatísticas de min/max para arquivos muito pequenos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque abrir e ler muitos arquivos pequenos soma uma sobrecarga por arquivo, mesmo com pouco dado total.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque arquivos pequenos exigem uma versão diferente do table format, incompatível com compactação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta recorrente sobre uma tabela gold de 5 TB está cara e lenta. Ela sempre filtra por um intervalo de datas recente, mas a tabela não é particionada por data e tem poucos arquivos, cada um enorme. Qual mudança tende a reduzir mais o custo dessa consulta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o número de nós do cluster para paralelizar melhor a leitura dos arquivos enormes existentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar o cache do engine, mesmo sabendo que a consulta muda de intervalo de datas a cada execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a retenção de versões antigas da tabela, já que menos histórico deveria acelerar a leitura atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Particionar a tabela por data, para o engine descartar de cara as partições fora do filtro.",
                                "isCorrect": true
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
                        "value": "# Boas práticas e antipadrões\n\nEsta trilha caminhou dos limites do data warehouse tradicional até aqui: o data lake cru sobre object storage, os problemas que ele carrega sem um table format (sem ACID, sem upsert fácil, sem time travel), os table formats abertos (Delta Lake, Iceberg, Hudi) que resolvem esses problemas, a arquitetura lakehouse organizada em camadas, a operação do dia a dia (MERGE, compactação, vacuum, particionamento) e, neste último módulo, a governança, os múltiplos engines, o streaming e o custo. Esta aula fecha a trilha reunindo tudo isso num conjunto de práticas recomendadas e nos antipadrões que costumam derrubar um lakehouse na prática."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Boa prática\", \"Antipadrão correspondente\"], [\"Camadas bem definidas (bronze, silver, gold), cada uma com responsabilidade clara\", \"Camadas misturadas, com transformação pesada direto na bronze ou dado cru na gold\"], [\"Table format aberto desde a bronze, quando há update, delete ou schema mutável\", \"Parquet cru em toda parte, reescrevendo partições inteiras a cada correção\"], [\"Compactação e vacuum programados, com política de retenção definida\", \"Small files e versões antigas acumulando sem limite, até o custo aparecer\"], [\"Particionamento e ordenação escolhidos pelos filtros mais comuns das consultas\", \"Superparticionamento por uma coluna de alta cardinalidade, sem critério\"], [\"Catálogo governado, com controle de acesso, auditoria e linhagem\", \"Acesso liberado direto no storage, sem registro de quem lê ou altera o quê\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Table format desde a bronze: nem sempre, mas quando faz sentido\n\nNem todo dado cru precisa nascer como tabela de table format aberto: um arquivo de log verdadeiramente imutável, só de append, pode continuar em Parquet simples sem perda relevante. Mas isso deixou de ser a regra geral. Sempre que a bronze recebe CDC, correções vindas da fonte ou schema que muda com frequência, começar já em Delta, Iceberg ou Hudi evita reescrever a camada inteira mais tarde só para ganhar upsert ou schema evolution que poderiam ter existido desde o início."
                    },
                    {
                        "type": "code",
                        "value": "Checklist antes de considerar uma tabela do lakehouse pronta para producao\n\n[ ] A camada (bronze, silver ou gold) da tabela tem uma responsabilidade clara e documentada\n[ ] A tabela usa table format aberto se recebe update, delete ou schema mutavel\n[ ] Existe uma rotina programada de compactacao (OPTIMIZE) e de vacuum, com retencao definida\n[ ] O particionamento reflete os filtros mais comuns das consultas, sem superparticionar\n[ ] A tabela esta registrada num catalogo governado, com permissoes por tabela ou coluna\n[ ] Existe alguma checagem de qualidade (schema, nulos, duplicidade) antes de promover a proxima camada\n[ ] Alguem, alem de quem escreveu o pipeline, consegue entender a linhagem dessa tabela"
                    },
                    {
                        "type": "quote",
                        "value": "Lakehouse não é um produto que se compra pronto, é uma disciplina que se pratica: camadas claras, table format onde é preciso, manutenção regular e governança desde o início custam menos do que consertar um data swamp depois que ele já cresceu."
                    },
                    {
                        "type": "text",
                        "value": "## Antipadrões clássicos, resumidos\n\n- **O lakehouse que virou data swamp de novo**: table format adotado, mas sem catálogo, sem convenção de camadas e sem dono definido para cada tabela.\n- **Vacuum e OPTIMIZE nunca agendados**: rodam uma vez, manualmente, quando alguém lembra, em vez de fazerem parte da operação de rotina do pipeline.\n- **Particionar por tudo**: uma partição por cliente ou por ID gera milhões de pastas pequenas, o oposto do que particionamento deveria resolver.\n- **Streaming escrevendo direto na gold**: pula a consolidação da silver, misturando dado ainda não validado com o que o negócio já confia.\n- **Ignorar o custo de varredura**: tratar storage barato como sinônimo de consulta barata, sem olhar para o layout, e só perceber o problema quando a fatura chega."
                    },
                    {
                        "type": "text",
                        "value": "## Fim da trilha, início da prática\n\nEsta trilha percorreu o caminho do data warehouse ao data lake, do lake cru ao lakehouse, e da teoria dos table formats até a operação e a governança do dia a dia. O que fica é uma forma de pensar: guardar dados em escala, de forma aberta e sem lock-in, mas com a confiabilidade (ACID, schema, versionamento) que antes só um warehouse fechado oferecia. Duas frentes ficaram citadas de passagem e merecem trilha própria: streaming, aprofundado na trilha de Streaming logo a seguir, e dbt, para quem quer levar a transformação em SQL dentro do lakehouse a outro nível. Por ora, o próximo passo é prático: aplicar esse checklist na primeira tabela real que passar pelas suas mãos."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em qual cenário faz mais sentido manter uma tabela bronze em Parquet simples, sem adotar um table format aberto desde o início?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um log verdadeiramente imutável, só de append, sem update, delete ou schema evolutivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tabela que recebe CDC de um sistema transacional, com updates e deletes frequentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela cujo schema muda a cada poucas semanas, conforme a fonte upstream evolui.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela usada por vários times, que também precisa de controle de acesso por coluna.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide particionar uma tabela gold pelo id_cliente, imaginando que isso vai acelerar todas as consultas. Depois de implementado, o número de arquivos explode e as consultas ficam mais lentas. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O id_cliente é uma chave estrangeira, e chaves estrangeiras nunca devem ser usadas em partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "A coluna tem cardinalidade alta demais, gerando muitas partições pequenas em vez de poucas úteis.",
                                "isCorrect": true
                            },
                            {
                                "text": "Partições só funcionam corretamente em colunas de data, qualquer outra coluna quebra o layout.",
                                "isCorrect": false
                            },
                            {
                                "text": "O table format usado não suporta particionamento por colunas numéricas, só por texto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline foi configurado para o job de streaming escrever diretamente na camada gold, pulando a silver, para \"economizar uma etapa\". Qual é o risco mais direto dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O job de streaming deixa de conseguir usar checkpoint, perdendo a capacidade de retomar após uma falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela gold passa a exigir um table format diferente do usado nas demais camadas do lakehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dado ainda não validado se mistura, na gold, com o que o negócio já trata como confiável.",
                                "isCorrect": true
                            },
                            {
                                "text": "O catálogo deixa de conseguir registrar a linhagem de uma tabela alimentada por streaming.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time reduz a frequência de compactação de uma tabela bronze alegando que \"storage é barato, não precisa se preocupar\". Meses depois, as consultas sobre essa tabela estão caras e lentas. O que esse time confundiu?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Achou que compactação servia só para economizar espaço em disco, não para acelerar consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Achou que a bronze não precisa de manutenção nenhuma, já que é só uma cópia temporária dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Achou que o table format compacta os arquivos automaticamente, sem precisar de um job dedicado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confundiu o custo barato de armazenar com o custo de escanear arquivos pequenos a cada consulta.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de toda a trilha, qual frase resume melhor o que a arquitetura lakehouse busca entregar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Armazenamento aberto e barato do data lake, com a confiabilidade transacional que antes só um warehouse oferecia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um data warehouse tradicional hospedado na nuvem, trocando o servidor local por object storage, sem mudar mais nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um data lake que abandona totalmente SQL, exigindo que toda consulta seja feita via código Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um catálogo único que substitui a necessidade de qualquer table format aberto nas tabelas.",
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
