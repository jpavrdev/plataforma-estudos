// Seed da trilha Streaming de Dados (roadmap de Engenharia de Dados).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-streaming.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Streaming de Dados";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Trilha de streaming e dados em tempo real do roadmap de Engenharia de Dados: processar dados em movimento. Batch x streaming, o Apache Kafka como espinha dorsal (topicos, particoes, offsets, producers e consumers), produzir e consumir com garantias, as garantias de entrega (at-least-once, exactly-once), tempo de evento, watermark e janelas, o processamento com Spark Structured Streaming e o streaming na pratica de engenharia de dados. Assume base de Spark, ETL e lakehouse, com foco em decisoes e cenarios.";

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
        "titulo": "Módulo 1 - Batch x streaming: por que tempo real",
        "aulas": [
            {
                "titulo": "Dados em repouso x dados em movimento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dados em repouso x dados em movimento\n\nAté aqui, cada pipeline que você construiu partiu de uma pergunta parecida: “que dados eu tenho armazenados e como processo esse lote inteiro?”. Um job de ETL lê uma tabela, um arquivo Parquet ou uma partição inteira, aplica transformações e grava o resultado. O dado já está parado em algum lugar (um data lake, um banco, um data warehouse), esperando ser lido.\n\nStreaming inverte essa pergunta. Em vez de “que dados eu tenho parados”, ela vira “que evento acabou de acontecer, e o que eu faço com ele agora?”. O dado não espera: é processado no instante em que é produzido, um registro (ou um pequeno grupo de registros) de cada vez, por um processo que fica rodando indefinidamente.\n\nEssa troca de pergunta é a raiz do que vem nos próximos módulos: Kafka, garantias de entrega, janelas de tempo, Spark Structured Streaming. Antes de entrar em ferramenta, vale entender bem a mudança de mentalidade."
                    },
                    {
                        "type": "text",
                        "value": "## Dado em repouso\n\nDado em repouso (data at rest) é qualquer coisa já persistida, parada até alguém ler: uma tabela de data warehouse, um conjunto de arquivos Parquet num data lake, uma tabela transacional num banco OLTP. Um pipeline batch lê esse conjunto, que tem início e fim bem definidos, processa tudo (ou uma partição dele) e termina.\n\n## Dado em movimento\n\nDado em movimento (data in motion) é um fluxo contínuo de eventos sendo gerados: um clique num site, uma transação de cartão, a leitura de um sensor, uma atualização de estoque. Não existe “o conjunto inteiro” para ler, porque o fluxo não tem fim conhecido. Um processo de streaming não roda uma vez e termina: ele fica de pé, consumindo eventos conforme chegam, potencialmente para sempre."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Dados em repouso (batch)\", \"Dados em movimento (streaming)\"], [\"Onde o dado vive\", \"Armazenado em data lake, warehouse ou banco\", \"Em trânsito, num log ou tópico de mensageria\"], [\"Quando é processado\", \"Sob demanda ou em horário agendado\", \"No instante em que é produzido\"], [\"Limite do conjunto\", \"Finito e conhecido, com início e fim\", \"Sem fim conhecido, fluxo contínuo\"], [\"Duração do processo\", \"Job roda, termina e libera recursos\", \"Aplicação fica de pé, rodando sem parar\"], [\"Pergunta típica\", \"Quanto vendemos no mês passado, por região?\", \"Essa transação agora parece fraude?\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Dado em repouso (batch):\n\n  [ Data Lake / Tabela completa ]\n              |\n     (job agendado, 1x por dia)\n              |\n              v\n   lê tudo -> transforma -> grava resultado -> job termina\n\n\nDado em movimento (streaming):\n\n  evento -> evento -> evento -> evento -> ...\n    |         |         |         |\n    v         v         v         v\n  [   processo rodando continuamente, sem fim definido   ]\n    |         |         |         |\n    v         v         v         v\n resultado  resultado  resultado  resultado   (um por evento, ou por pequeno grupo)"
                    },
                    {
                        "type": "quote",
                        "value": "Em batch, o dado espera o processamento. Em streaming, o processamento espera o dado. É essa inversão que muda a forma de projetar o pipeline inteiro."
                    },
                    {
                        "type": "text",
                        "value": "## O que muda na prática de engenharia\n\n- **Unidade de trabalho**: em batch, a unidade é o lote (uma partição, um arquivo, uma tabela inteira). Em streaming, a unidade é o evento, ou um micro-lote de poucos segundos.\n- **Ciclo de vida do processo**: um job batch tem início, meio e fim. Uma aplicação de streaming, em geral, não tem fim: ela roda 24 horas por dia, e “terminar” costuma significar falha, não sucesso.\n- **Recomputar o passado**: em batch, se algo sair errado, geralmente basta rodar o job de novo sobre os mesmos dados parados. Em streaming, o evento já passou; reprocessar exige reler um histórico retido em algum log (é aqui que o log distribuído do Kafka, visto no próximo módulo, entra) ou aceitar que aquele instante se perdeu.\n- **Estado**: um job batch costuma ser sem estado entre execuções, ou reconstrói tudo do zero a cada rodada. Um job de streaming precisa manter estado vivo (contadores, agregações parciais, últimas chaves vistas) enquanto roda, porque não há “o conjunto todo” para reconsultar a qualquer momento."
                    },
                    {
                        "type": "text",
                        "value": "## O ponto não é abandonar o batch\n\nStreaming não substitui batch: ele complementa. A maioria das plataformas de dados maduras usa os dois, batch para relatórios, históricos e cargas pesadas em que uma janela de algumas horas é aceitável, streaming para os casos em que o valor do dado cai rápido com o tempo. Os próximos módulos tratam Kafka e streaming como mais uma ferramenta na caixa, não como substituto do que você já viu em ETL e orquestração."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica define melhor “dado em movimento” (data in motion), em contraste com dado em repouso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É produzido de forma contínua e processado assim que surge, sem conjunto final fechado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fica guardado numa tabela até que um job agendado faça a leitura completa dela.",
                                "isCorrect": false
                            },
                            {
                                "text": "É replicado em múltiplos data centers antes que qualquer consulta seja permitida.",
                                "isCorrect": false
                            },
                            {
                                "text": "É compactado em arquivos colunares para reduzir o custo de armazenamento em disco a longo prazo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista precisa saber quantos pedidos foram cancelados no mês passado, por região. Do ponto de vista de dado em repouso x dado em movimento, qual abordagem combina melhor com essa pergunta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Streaming, porque cancelamentos são eventos e só podem ser lidos no instante em que ocorrem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch, porque o conjunto de pedidos do mês passado é finito e já está parado em algum armazenamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Streaming, porque manter um processo rodando sem parar é sempre mais barato que agendar uma consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch, porque tabelas de data warehouse não conseguem guardar dados de mais de um mês por vez.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de reescrever um pipeline batch como uma aplicação de streaming, o time de infraestrutura notou que o processo nunca aparece como “concluído com sucesso” nos logs, mesmo com tudo saudável. Por que isso é esperado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque aplicações de streaming têm uma falha conhecida que impede o encerramento normal do processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o agendador de jobs da empresa não reconhece processos ligados a um tópico de mensageria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque uma aplicação de streaming roda continuamente por natureza, e terminar costuma indicar falha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o cluster ficou subdimensionado e o processo repete o mesmo lote sem nunca concluir.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job batch falhou por um bug, foi corrigido, e a equipe rodou o job de novo sobre a mesma partição sem problema. Um pipeline de streaming teve um bug parecido durante duas horas. Por que “rodar de novo” não é tão simples nesse segundo caso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o Kafka apaga cada evento automaticamente no instante em que ele é lido por um consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque aplicações de streaming nunca permitem qualquer tipo de reprocessamento, mesmo com o dado retido em log.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Spark Structured Streaming não oferece nenhum suporte a leitura de dados históricos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os eventos já passaram: reprocessar exige reler um histórico retido, não repetir sobre dados parados.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a relação entre pipelines batch e pipelines de streaming numa plataforma de dados madura, qual afirmação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As duas coexistem: batch ainda cobre históricos e cargas pesadas, streaming atende ao que perde valor rápido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Streaming substitui o batch por completo, porque todo processamento em lote pode virar evento sem custo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Batch substitui o streaming sempre, porque o hardware atual não sustenta processos rodando sem parar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Streaming só existe fora do data warehouse, porque as duas arquiteturas nunca operam lado a lado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que é processamento de streams e quando vale a pena",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é processamento de streams e quando vale a pena\n\nProcessar um stream não é apenas mover dados rapidamente de um lugar para outro. É aplicar lógica continuamente sobre um fluxo de eventos: filtrar, agregar, enriquecer, cruzar com outra fonte, detectar um padrão, tudo enquanto o dado ainda está “quente”. Mover dado rápido é condição necessária, mas quem faz o trabalho de processamento de streams é a computação contínua em cima desse fluxo, não o transporte em si.\n\nEssa distinção importa porque nem todo problema com “dado chegando rápido” precisa de streaming. Vale entender primeiro onde streaming resolve um problema real, para depois (nos módulos seguintes) aprender a ferramenta."
                    },
                    {
                        "type": "text",
                        "value": "## Casos de uso onde streaming compensa\n\n- **Detecção de fraude**: uma transação de cartão precisa ser avaliada em milissegundos ou poucos segundos, antes de ser aprovada. Analisar isso à noite, em lote, chega tarde demais: o dinheiro já saiu.\n- **Dashboards operacionais ao vivo**: pedidos por minuto, erros por segundo, fila de atendimento em tempo real. Um painel que atualiza de hora em hora não serve para quem precisa agir agora.\n- **Alertas e monitoramento**: detectar uma anomalia (queda de um sensor, pico de erro numa API) e agir antes que o problema se espalhe para o resto do sistema.\n- **Personalização em tempo real**: ajustar uma recomendação com base no clique que acabou de acontecer, não só no comportamento de ontem.\n- **Manutenção preditiva com IoT**: um sensor emite leituras continuamente, e o streaming detecta um desvio de padrão assim que ele aparece."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Caso de uso\", \"Por que streaming compensa\", \"O que aconteceria em batch\"], [\"Detecção de fraude\", \"A decisão de aprovar ou barrar precisa vir antes da transação se completar\", \"A fraude só seria descoberta horas depois, com o prejuízo já feito\"], [\"Dashboard operacional\", \"Métricas de operação perdem sentido se não refletem o agora\", \"O painel mostraria uma foto de várias horas atrás\"], [\"Personalização\", \"A próxima recomendação depende do clique que acabou de acontecer\", \"A recomendação usaria só o comportamento do dia anterior\"], [\"Manutenção preditiva\", \"Um desvio no sensor precisa virar alerta antes da falha do equipamento\", \"O desvio só apareceria no relatório do dia seguinte\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Streaming compensa quando o custo de chegar atrasado é maior que o custo extra de manter um processo rodando sem parar. Fora disso, é complexidade sem retorno."
                    },
                    {
                        "type": "text",
                        "value": "## Quando o batch ainda resolve, e resolve bem\n\nRelatório mensal de vendas, cálculo de folha de pagamento, treinamento de um modelo sobre um histórico grande, migração de dados, carga noturna de um data warehouse: nenhum desses casos perde valor se levar algumas horas. Forçar esses processos para streaming só adiciona complexidade operacional sem trazer benefício de negócio.\n\nUma pergunta de bolso ajuda a decidir: “se esse dado chegasse seis horas atrasado, alguém notaria, perderia dinheiro ou perderia uma oportunidade?”. Se a resposta for não, o batch resolve com bem menos esforço de operação."
                    },
                    {
                        "type": "code",
                        "value": "O dado atrasar importa de verdade?\n        |\n    -------------\n    |           |\n   sim          não\n    |           |\n    v           v\nStreaming    Batch resolve\ncompensa a   (mais simples\ncomplexidade  de operar e\nadicional      de manter)"
                    },
                    {
                        "type": "text",
                        "value": "## Streaming não é só “mover dados rápido”\n\nÉ comum confundir “ter um fluxo de eventos chegando rápido” com “fazer processamento de streams”. Kafka movendo eventos em milissegundos, sozinho, ainda não é processamento de streams: é transporte. O processamento acontece quando alguma lógica roda continuamente sobre esse fluxo, como o Spark Structured Streaming faz, filtrando, agregando ou cruzando dados a cada novo evento (assunto dos módulos seguintes)."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza, de fato, o processamento de streams, e não apenas o transporte rápido de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A entrega de cada evento em menos de um segundo entre o produtor e o consumidor final da cadeia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar alguma lógica de forma contínua sobre o fluxo, como filtrar, agregar ou detectar um padrão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O uso obrigatório de um cluster com mais de dez máquinas dedicado apenas à camada de mensageria.",
                                "isCorrect": false
                            },
                            {
                                "text": "A compactação dos eventos num formato binário compacto antes de qualquer envio pela rede interna.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de folha de pagamento pediu para migrar o cálculo mensal de salários para uma arquitetura de streaming, achando mais moderno. O cálculo já roda uma vez por mês, sem reclamação de atraso. O que essa mudança traria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Redução real de custo, porque manter um processo rodando sem parar é sempre mais barato que agendar uma execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Maior precisão no cálculo, porque folha de pagamento processada evento a evento erra menos que em lote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais complexidade operacional sem ganho de negócio, já que um atraso de horas nesse cálculo não afeta ninguém.",
                                "isCorrect": true
                            },
                            {
                                "text": "Melhor governança dos dados de salário, porque streaming aplica controle de acesso mais rígido que batch.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num sistema de detecção de fraude em cartão de crédito, por que rodar a análise em lote, uma vez por dia, costuma ser inadequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque jobs em lote não conseguem ler tabelas com informações de transações financeiras por restrição técnica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o volume de transações de um dia é sempre grande demais para caber num único job batch.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque times de fraude são obrigados por lei a usar apenas ferramentas de streaming em qualquer banco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a decisão de aprovar ou barrar a transação precisa vir antes de o dinheiro sair, e um dia já é tarde demais.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma fábrica instalou sensores de vibração em motores e quer detectar desvios que antecedem falhas mecânicas. Os dados fluem continuamente, mas o time de dados sugeriu processar tudo em lote, a cada hora. Qual é o risco principal dessa escolha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um desvio que antecede a falha pode passar despercebido por até uma hora antes de o equipamento quebrar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O lote horário vai custar mais processamento do que streaming, porque sensores geram muito mais dados que cliques.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sensores de vibração não produzem dados em formato compatível com jobs batch, exigindo conversão manual constante.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo de manutenção preditiva perde acurácia sempre que roda sobre dados agregados, independente do caso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual cenário é o que melhor se encaixa em batch, mesmo numa empresa que já usa streaming em outras partes do negócio?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aprovar ou recusar uma transação de cartão de crédito no momento em que ela é solicitada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar o relatório mensal de vendas por região para a diretoria revisar na reunião do mês seguinte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Atualizar um painel de erros por segundo para o time de plantão durante um incidente em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ajustar a recomendação de produto exibida ao cliente logo depois do clique que ele acabou de dar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Latência x throughput e o custo do tempo real",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Latência x throughput e o custo do tempo real\n\nDois números resumem boa parte da conversa sobre streaming: latência e throughput. Latência é o tempo entre um evento acontecer e o resultado daquele processamento ficar disponível. Throughput é o volume de eventos que o sistema consegue processar por unidade de tempo. Os dois raramente melhoram juntos de graça: otimizar para latência baixa costuma custar throughput, custo operacional, ou ambos.\n\nEntender esse trade-off é o que separa “queremos tempo real” de “meu sistema realmente precisa de tempo real, e está disposto a pagar por isso”."
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off na prática\n\nReduzir latência geralmente significa lotes menores (mais overhead relativo por lote processado), recursos sempre ativos (cluster de pé 24 horas por dia, mesmo com pouco tráfego às três da manhã) e checkpoints mais frequentes para tolerância a falha.\n\nAumentar throughput geralmente significa lotes maiores e mais paralelismo, aceitando que cada resultado individual demore mais para ficar pronto. Nenhuma das duas escolhas é “errada”: são pontos diferentes de uma mesma régua, e a escolha certa depende do que o negócio realmente precisa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Perfil\", \"Latência típica\", \"Throughput\", \"Custo operacional\"], [\"Batch diário\", \"Horas\", \"Alto, processa tudo de uma vez\", \"Baixo, roda numa janela e libera recursos\"], [\"Micro-batch\", \"Segundos a minutos\", \"Médio a alto\", \"Médio, cluster fica ativo por mais tempo\"], [\"Streaming por evento\", \"Milissegundos\", \"Depende do paralelismo configurado\", \"Alto, infraestrutura ativa o tempo todo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Latência baixa <-------------------------------------> Throughput alto\n (evento a evento)                                     (grandes lotes)\n\n     streaming          micro-batch               batch\n     por evento          (segundos)               (horas)\n        |                    |                       |\n   mais overhead        equilíbrio              menos overhead\n   por registro           típico                 por registro\n        |                                              |\n   custo operacional                           custo operacional\n       maior                                          menor"
                    },
                    {
                        "type": "quote",
                        "value": "Tempo real não é grátis: você paga com infraestrutura sempre ligada, engenharia mais cuidadosa e uma operação mais exigente. A pergunta certa não é “dá para deixar mais rápido?”, é “precisa ser mais rápido?”."
                    },
                    {
                        "type": "text",
                        "value": "## A pergunta que guia a decisão: quão fresco o dado precisa ser?\n\nEm vez de mirar “o mais rápido possível”, defina um SLA de frescor: o atraso máximo aceitável entre o evento acontecer e o resultado estar disponível. Dimensione a solução para esse número, não para o limite técnico da ferramenta.\n\nAlguns exemplos de SLA de frescor:\n- Fraude em cartão: segundos.\n- Nível de estoque num e-commerce: minutos.\n- Relatório executivo de vendas: um dia.\n\nCada um desses exemplos aceita um ponto diferente do espectro entre batch e streaming, e forçar todos para “o mais rápido possível” custaria caro sem necessidade."
                    },
                    {
                        "type": "text",
                        "value": "## O custo do tempo real vai além da infraestrutura\n\nStreaming também custa em operação: alguém precisa ficar de plantão para um processo que roda 24 horas por dia, depurar um problema é mais difícil quando não dá para simplesmente “rodar de novo o dia inteiro”, e o time precisa de familiaridade com conceitos que batch não exige, como janelas de tempo e watermark (módulo 5). Tratar streaming como padrão só porque parece mais moderno costuma trazer esse custo sem o benefício correspondente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um time reduziu o tamanho dos lotes de processamento para diminuir o tempo entre o evento acontecer e o resultado ficar pronto. Que métrica esse time está otimizando diretamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Throughput, porque lotes menores sempre aumentam o volume total processado por segundo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Retenção, porque lotes menores fazem o dado ficar armazenado por menos tempo no log.",
                                "isCorrect": false
                            },
                            {
                                "text": "Latência, porque o foco é reduzir o tempo entre o evento e o resultado disponível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Paralelismo, porque lotes menores exigem automaticamente mais máquinas no cluster.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista pediu para o time de engenharia entregar o relatório de vendas do mês “assim que cada venda acontecer”. O relatório é revisado uma vez por mês, na reunião de fechamento. Qual é a avaliação mais adequada desse pedido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O pedido está correto, porque todo relatório de negócio se beneficia de estar sempre atualizado ao segundo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pedido é tecnicamente impossível, porque não existe forma de agregar vendas em tempo real com precisão.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pedido é obrigatório por lei, porque relatórios financeiros exigem atualização contínua em qualquer empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pedido adiciona complexidade sem necessidade, já que o relatório só é olhado uma vez por mês.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um e-commerce quer manter o nível de estoque exibido no site atualizado. Testes internos mostram que os clientes não percebem diferença entre um atraso de trinta segundos e um de três minutos, mas notam quando o atraso passa de dez minutos. Qual SLA de frescor faz mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Poucos minutos, o suficiente para ficar bem abaixo do limite de dez minutos percebido pelos clientes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Milissegundos, processando cada venda individualmente para garantir a menor latência tecnicamente possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma hora, já que qualquer atualização de estoque abaixo desse tempo já seria considerada tempo real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dia, alinhado ao mesmo ritmo usado no relatório executivo de vendas da diretoria.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline foi desenhado para maximizar throughput, com lotes grandes processados a cada trinta minutos. O negócio, porém, precisa aprovar ou recusar transações em até dois segundos. Qual é a tensão nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não existe tensão real, porque throughput alto sempre implica automaticamente em latência baixa também.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline está otimizado para o eixo errado: o negócio exige latência baixa, não throughput alto.",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema é de volume, porque nenhum pipeline consegue aprovar mais de uma transação por vez ao todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é de custo, porque throughput alto é sempre a opção mais barata de operar na nuvem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além da infraestrutura sempre ligada, qual é outro custo real de operar um pipeline de streaming, em comparação com um pipeline batch equivalente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum: uma vez paga a infraestrutura, streaming não traz custo adicional de operação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um custo de licenciamento obrigatório, já que streaming não tem opções de código aberto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais exigência operacional: plantão para o processo contínuo e depuração mais difícil.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um custo de armazenamento maior, porque streaming sempre duplica todo o histórico em disco.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A arquitetura orientada a eventos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A arquitetura orientada a eventos\n\nArquitetura orientada a eventos (event-driven architecture) organiza um sistema em torno da produção, detecção e reação a eventos, em vez de chamadas diretas entre serviços. Um evento é o registro imutável de algo que aconteceu: “pedido_criado”, “pagamento_aprovado”, “sensor_leu_temperatura”. Ele descreve um fato, não uma ordem.\n\nEssa forma de organizar sistemas já apareceu na trilha de mensageria; aqui o foco é como ela vira a base concreta que sustenta o processamento de streams."
                    },
                    {
                        "type": "text",
                        "value": "## Produtores, eventos e consumidores\n\nUm **produtor** emite um evento quando algo acontece no sistema que ele representa. Ele não sabe, e não precisa saber, quem vai consumir esse evento, nem quantos consumidores existem.\n\nUm **consumidor** reage ao evento de forma independente: lê o que aconteceu e decide o que fazer com aquilo, sem depender de uma resposta síncrona do produtor.\n\nA diferença entre **evento** e **comando** importa: um evento diz “isso aconteceu” (fato, o passado), um comando diz “faça isso” (ordem, o futuro). Sistemas orientados a eventos trocam fatos, não ordens."
                    },
                    {
                        "type": "code",
                        "value": "Chamada síncrona (acoplamento direto):\n\n  Serviço A ---chama---> Serviço B ---chama---> Serviço C\n     (A só continua depois que B e C responderem)\n     (se C cair, A trava esperando)\n\n\nArquitetura orientada a eventos:\n\n                      +-----------------+\n  Produtor --emite--> |  Log de eventos | --evento--> Consumidor 1\n                      |     (broker)    | --evento--> Consumidor 2\n                      +-----------------+ --evento--> Consumidor 3\n\n     (o produtor não sabe quantos consumidores existem)\n     (cada consumidor lê no seu próprio ritmo)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Chamada síncrona (ponto a ponto)\", \"Arquitetura orientada a eventos\"], [\"Acoplamento\", \"Alto: quem chama precisa saber o endereço de quem responde\", \"Baixo: produtor não conhece os consumidores\"], [\"Adicionar novo consumo\", \"Exige alterar o serviço que originou a chamada\", \"Basta o novo consumidor se inscrever no evento\"], [\"Falha de um consumidor\", \"Pode travar quem fez a chamada, esperando resposta\", \"Não afeta o produtor nem os demais consumidores\"], [\"Quem sabe de quem\", \"As duas pontas se conhecem\", \"Produtor não sabe quem, nem quantos, consomem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O produtor não sabe, e não precisa saber, quem consome o evento. Esse desacoplamento é o que permite adicionar um novo consumidor sem tocar em uma linha do produtor."
                    },
                    {
                        "type": "text",
                        "value": "## O log de eventos como fonte central\n\nEm vez de mensagens efêmeras trocadas ponto a ponto, arquiteturas de streaming colocam um log de eventos durável e ordenado no centro: cada evento é gravado nesse log e permanece disponível por um período de retenção, não só no instante em que foi emitido. Um consumidor novo pode entrar e ler desde o início; um consumidor que ficou fora do ar por um tempo pode retomar de onde parou.\n\nEssa ideia de log central, ordenado e durável é exatamente o que o Kafka implementa, e é o assunto do próximo módulo."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa para streaming\n\nProcessamento de streams só existe porque há, antes dele, uma arquitetura orientada a eventos com um lugar durável para os eventos ficarem: sem produtores e consumidores desacoplados em torno de um log, não haveria onde plugar uma computação contínua. O módulo 2 detalha como o Kafka materializa essa ideia."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num sistema orientado a eventos, o que melhor descreve um evento como “pagamento_aprovado”?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma ordem enviada a um serviço específico, exigindo que ele execute uma ação em seguida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma pergunta enviada ao consumidor, que deve responder antes do produtor continuar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma cópia de segurança do banco de dados, gerada automaticamente a cada transação aprovada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O registro de um fato que já aconteceu, sem exigir uma ação imediata de quem o emitiu.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer adicionar um novo sistema de recomendação que reage ao evento “pedido_criado”, sem alterar o serviço que cria pedidos. Isso só é simples de fazer porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O produtor do evento não conhece nem depende de quem consome, então um novo consumidor entra sem mudar nada nele.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todo evento é automaticamente enviado a qualquer sistema novo criado na mesma empresa, por padrão de rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "O serviço de recomendação sempre roda no mesmo servidor do serviço que cria pedidos, lendo a memória direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eventos são reprocessados a cada minuto por um job batch, que distribui os dados para todos os sistemas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa cadeia de chamadas síncronas (A chama B, que chama C), o serviço C fica indisponível por alguns minutos. Qual é a consequência mais provável para o serviço A?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhuma: chamadas síncronas isolam automaticamente cada serviço da falha dos demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "A pode travar ou falhar esperando a resposta de B, que por sua vez depende da resposta de C.",
                                "isCorrect": true
                            },
                            {
                                "text": "A troca automaticamente para um modo assíncrono até que C volte a responder normalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas C perde as requisições recebidas nesse intervalo, sem qualquer efeito sobre A ou B.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor de eventos ficou fora do ar por uma hora por causa de uma manutenção. Num sistema de mensageria comum, sem retenção, esses eventos seriam perdidos. Por que um log de eventos durável evita esse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o log de eventos duplica cada evento automaticamente para todos os consumidores possíveis, mesmo os inativos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque consumidores em arquiteturas de streaming nunca ficam fora do ar, já que rodam em múltiplas réplicas sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o evento permanece gravado e disponível por um período de retenção, e o consumidor pode retomar de onde parou.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o produtor reenvia manualmente cada evento perdido assim que percebe que um consumidor ficou indisponível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre um “evento” e um “comando” numa arquitetura orientada a eventos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Evento é sempre menor em tamanho de dados; comando costuma carregar arquivos anexos maiores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evento trafega apenas dentro do mesmo serviço; comando sempre cruza os limites de uma rede externa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evento é processado por streaming; comando só pode ser processado por um job batch tradicional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evento descreve um fato que já ocorreu; comando é uma ordem para que algo aconteça.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Batch, micro-batch e streaming verdadeiro",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Batch, micro-batch e streaming verdadeiro\n\n“Tempo real” não é um interruptor ligado ou desligado: é um espectro. Numa ponta está o batch tradicional, rodando sobre um conjunto fechado de dados uma vez por dia ou por hora. Na outra ponta está o streaming verdadeiro, processando cada evento no instante em que ele chega. No meio, e é onde a maior parte dos sistemas de streaming do mundo real vive de fato, está o micro-batch.\n\nEste é o fechamento do módulo: juntar tudo que foi visto (o custo do tempo real, os casos de uso, a arquitetura orientada a eventos) num mapa de onde cada abordagem se encaixa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Abordagem\", \"Latência típica\", \"Como processa\", \"Exemplo de ferramenta\"], [\"Batch\", \"Horas\", \"Lê e processa uma partição ou tabela inteira de uma vez\", \"Spark em modo batch, jobs agendados no orquestrador\"], [\"Micro-batch\", \"Segundos a poucos minutos\", \"Acumula um pequeno lote e processa em ciclos curtos e repetidos\", \"Spark Structured Streaming, no modo padrão\"], [\"Streaming verdadeiro\", \"Milissegundos\", \"Processa cada evento (ou grupo mínimo) assim que ele chega\", \"Kafka Streams, Apache Flink\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Espectro de latência:\n\n Batch diário          Micro-batch            Streaming por evento\n   (horas)          (segundos a min)             (milissegundos)\n     |------------------|------------------------|\n     |                  |                         |\n   lê tudo          processa em              processa cada\n  de uma vez       ciclos curtos            evento assim que\n   e termina        e repetidos                ele chega\n\n       menos overhead                     mais overhead\n       por registro    <---------------->  por registro\n       custo menor                         custo maior"
                    },
                    {
                        "type": "quote",
                        "value": "Micro-batch não é “streaming fraco”: é um ponto de equilíbrio deliberado entre a simplicidade operacional do batch e a agilidade do streaming verdadeiro."
                    },
                    {
                        "type": "text",
                        "value": "## Micro-batch: o meio-termo mais usado na prática\n\nA maior parte dos pipelines chamados de “streaming” no mundo real roda em micro-batch: o Spark Structured Streaming, no seu modo padrão, acumula os eventos chegados num intervalo curto (poucos segundos) e processa esse pequeno lote de uma vez, repetindo o ciclo sem parar. Isso reaproveita boa parte do motor de execução batch, o que simplifica tolerância a falha e operação, e entrega uma latência baixa o suficiente para a grande maioria dos casos de uso.\n\nMotores de streaming verdadeiro, evento a evento, como Apache Flink e Kafka Streams (ou serviços gerenciados como o Amazon Kinesis), existem para os casos em que nem alguns segundos de espera são aceitáveis, ao custo de mais complexidade operacional."
                    },
                    {
                        "type": "text",
                        "value": "## Escolhendo o ponto do espectro\n\nVoltando ao SLA de frescor da aula anterior: a maioria das necessidades reais de negócio cabe confortavelmente dentro do micro-batch, com latência de segundos a poucos minutos. Migrar para streaming verdadeiro, evento a evento, deve ser uma decisão justificada por um requisito concreto de milissegundos, não pela sensação de que é “mais moderno” ou “mais correto”."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nEste módulo respondeu “por que tempo real”: o que muda quando o dado deixa de estar em repouso, quando streaming vale o investimento, o trade-off entre latência e throughput, e a arquitetura orientada a eventos que sustenta tudo isso. O módulo 2 entra na ferramenta que materializa essas ideias na prática: o Apache Kafka, o log distribuído que serve de espinha dorsal para qualquer ponto desse espectro, do micro-batch ao streaming verdadeiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Onde o micro-batch se encaixa no espectro entre batch tradicional e streaming verdadeiro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "No meio: latência menor que o batch tradicional, mas ainda em pequenos lotes, não evento a evento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Na mesma ponta do batch tradicional, apenas rodando com uma frequência de execução maior por dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na mesma ponta do streaming verdadeiro, processando cada evento individual no instante em que chega.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fora do espectro, porque micro-batch é uma técnica de armazenamento e não de processamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline em Spark Structured Streaming processa um novo micro-lote a cada trinta segundos, usando o modo de disparo (trigger) padrão. Como esse pipeline deve ser classificado dentro do espectro batch a streaming?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Como batch tradicional, porque qualquer processamento organizado em lotes conta como batch, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como micro-batch, porque processa pequenos lotes em ciclos curtos e repetidos, com latência de segundos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como streaming verdadeiro, porque o Spark Structured Streaming só sabe operar evento a evento, nunca em lotes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como uma arquitetura orientada a eventos, porque o conceito de lote deixa de existir dentro do Spark.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de reposição de estoque tolera até dois minutos de atraso entre a venda e a atualização do saldo disponível. A equipe avalia adotar Apache Flink, com processamento evento a evento, para esse caso. Qual é a avaliação mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Correta: qualquer sistema de estoque deve sempre processar evento a evento, sem exceção, para evitar overselling.",
                                "isCorrect": false
                            },
                            {
                                "text": "Incorreta: Apache Flink não é capaz de processar eventos ligados a controle de estoque em nenhuma hipótese.",
                                "isCorrect": false
                            },
                            {
                                "text": "Provavelmente desnecessária: micro-batch já entrega folga dentro dos dois minutos, com menos complexidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Incorreta: controle de estoque deve sempre rodar em batch diário, por ser um dado financeiro sensível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma mesa de operações financeiras precisa reagir a mudanças de preço em menos de cem milissegundos para tomar uma decisão automática. Um protótipo em micro-batch, com ciclos de dois segundos, não atende ao requisito. Qual caminho resolve o problema de latência descrito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduzir o período de retenção do log de eventos, o que diminui automaticamente a latência de qualquer consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições do tópico, já que mais partições sempre reduzem a latência para cem milissegundos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o micro-batch por um batch diário consolidado, processando as mudanças de preço num único job maior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adotar um motor de streaming verdadeiro, evento a evento, como Flink ou Kafka Streams, feito para milissegundos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que o micro-batch, e não o streaming evento a evento, é a abordagem mais comum na maioria dos pipelines chamados de “streaming” hoje?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque reaproveita o motor de execução batch, simplificando operação e falha, com latência baixa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque motores de streaming evento a evento, como Flink, foram descontinuados pelos mantenedores nos últimos anos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque micro-batch é a única abordagem compatível com o Apache Kafka como sistema de transporte de eventos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque órgãos reguladores de dados exigem que todo processamento contínuo seja feito em pequenos lotes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Apache Kafka: fundamentos",
        "aulas": [
            {
                "titulo": "O que é o Kafka: um log distribuído",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é o Kafka: um log distribuído\n\nO Apache Kafka é a peça de transporte que sustenta a maior parte das arquiteturas de streaming. A trilha de Spark tratou dados que já pousaram em algum lugar antes de serem processados; o Kafka existe para o momento anterior a esse, o trânsito dos eventos enquanto eles ainda estão em movimento entre um sistema e outro. Antes de entrar em produtores, consumidores ou garantias de entrega, vale entender a abstração que sustenta tudo isso: o log distribuído."
                    },
                    {
                        "type": "text",
                        "value": "## Um log, não uma fila\n\nUm log é a estrutura de dados mais simples que existe: uma sequência ordenada de registros, em que cada novo registro é adicionado ao final. Ninguém edita um registro já escrito, ninguém insere um registro no meio. O Kafka usa exatamente essa ideia para guardar eventos: cada mensagem publicada vira uma nova entrada no fim do log, e essa entrada não muda mais depois de escrita.\n\nIsso contrasta com uma fila de mensagens tradicional. Numa fila clássica, a mensagem é removida assim que um consumidor a processa e confirma o recebimento: ela existe para ser entregue uma vez e depois desaparece. No Kafka, o evento publicado continua guardado depois de ser lido. Ler um evento não é o mesmo que consumi-lo no sentido de apagá-lo."
                    },
                    {
                        "type": "code",
                        "value": "Log de eventos (visão simplificada)\n\n  posição:   0     1     2     3     4     5     6     7\n            [e0]  [e1]  [e2]  [e3]  [e4]  [e5]  [e6]  [e7]   <- próximo evento entra aqui\n                                     ^                 ^\n                              consumidor A        consumidor B\n                              já leu até aqui     já leu até aqui\n\n# cada consumidor guarda sua própria posição e avança no seu próprio ritmo\n# um evento lido continua no log: outro consumidor pode chegar depois e lê-lo desde o início"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Fila tradicional\",\"Kafka (log distribuído)\"],[\"Evento após a leitura\",\"Removido assim que um consumidor confirma o recebimento\",\"Permanece no log durante o período de retenção\"],[\"Consumidores independentes\",\"Concorrem pela mesma mensagem, entregue uma única vez\",\"Cada grupo lê sua própria cópia, no seu próprio ritmo\"],[\"Reler o passado\",\"Não é possível, a mensagem já foi descartada\",\"Possível, enquanto o evento ainda estiver retido\"],[\"Papel do consumidor\",\"Passivo: a mensagem é empurrada e depois some\",\"Ativo: o consumidor controla sua própria posição de leitura\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa\n\n- **Replay**: um consumidor novo pode entrar meses depois de o tópico existir e ler o histórico inteiro, respeitando a retenção configurada, útil para reprocessar dados ou alimentar um sistema recém-criado.\n- **Consumidores independentes**: o time de fraude e o time de BI podem ler os mesmos eventos de pedidos, cada um no seu próprio ritmo, sem que um interfira no outro.\n- **Desacoplamento no tempo**: quem publica o evento não precisa saber quem vai lê-lo, nem esperar que algum consumidor esteja pronto para escrever."
                    },
                    {
                        "type": "quote",
                        "value": "O Kafka não entrega uma mensagem e a esquece: ele guarda um histórico de eventos que pode ser lido, e relido, por quem precisar, no ritmo que for preciso."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nEsse log não é um arquivo único e infinito: ele é organizado em tópicos, divididos em partições, e cada posição dentro de uma partição tem um nome formal, o offset. É o assunto da próxima aula."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica descreve corretamente o que acontece com um evento no Kafka depois que um consumidor o lê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O evento permanece no log, disponível para outros consumidores, até o fim do período de retenção.",
                                "isCorrect": true
                            },
                            {
                                "text": "O evento é apagado do log assim que o primeiro consumidor confirma a leitura, como numa fila clássica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento é bloqueado para leitura por outros consumidores até ser reprocessado manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento é movido para uma partição de arquivamento, fora do alcance de novas leituras.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois times, fraude e BI, precisam ler os mesmos eventos de pagamentos publicados no Kafka, cada um processando no seu próprio ritmo e sem interferir no outro. Qual propriedade do Kafka viabiliza diretamente esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O balanceamento automático de carga entre os brokers do cluster, que redistribui eventos entre times.",
                                "isCorrect": false
                            },
                            {
                                "text": "A leitura não remove o evento do log: consumidores independentes leem cada um no seu ritmo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A compressão dos eventos no log, que reduz o espaço ocupado por cada mensagem publicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A criptografia dos eventos em trânsito, que isola o acesso de cada time aos dados publicados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe está migrando de uma fila de mensagens tradicional para o Kafka e espera que o comportamento de consumo continue idêntico. Qual mudança de comportamento essa equipe deveria esperar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As mensagens continuarão sendo removidas automaticamente assim que forem entregues a um consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "As mensagens passarão a exigir um único consumidor autorizado por tópico, diferente da fila anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "As mensagens deixarão de ser removidas na leitura e poderão ser relidas enquanto durar a retenção.",
                                "isCorrect": true
                            },
                            {
                                "text": "As mensagens passarão a ser entregues fora de ordem, já que o Kafka não preserva sequência alguma.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline publica eventos de sensores no Kafka, mas por uma falha na infraestrutura de consumo, nenhum consumidor lê o tópico durante três dias. A retenção do tópico está configurada para sete dias. O que acontece com os eventos publicados nesses três dias?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "São perdidos, porque o Kafka descarta eventos automaticamente quando não existe consumidor ativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficam retidos apenas parcialmente, já que a ausência de leitura acelera o descarte por espaço em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "São movidos para uma partição de reprocessamento, criada automaticamente após três dias sem leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuam disponíveis no log, porque a retenção depende do tempo configurado, não da leitura.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a analogia mais precisa para a forma como o Kafka armazena os eventos publicados num tópico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um log de registros, em que cada evento é adicionado ao final e permanece disponível depois disso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma fila de atendimento, em que cada evento sai de circulação assim que é atendido por um consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela mutável, em que cada evento pode ser atualizado conforme novos dados chegam ao sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma pilha de eventos, em que o último evento publicado é sempre o primeiro a ser consumido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tópicos, partições e offsets",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tópicos, partições e offsets\n\nUm tópico é o nome que o Kafka dá a uma categoria de eventos, algo como \"pedidos\", \"cliques\" ou \"pagamentos\". Mas um tópico não é um único log gigante: por baixo, ele é dividido em partições, e é essa divisão que permite ao Kafka escalar horizontalmente. Esta aula formaliza três conceitos que aparecem em qualquer conversa sobre Kafka: tópico, partição e offset."
                    },
                    {
                        "type": "text",
                        "value": "## Tópico: a categoria do evento\n\nUm tópico funciona como um canal nomeado para um tipo de evento: todo pedido criado vai para o tópico \"pedidos\", todo clique no site vai para o tópico \"cliques\". Produtores publicam num tópico sem saber quem vai consumir; consumidores se inscrevem num tópico sem saber quem publicou. É essa separação que desacopla os dois lados."
                    },
                    {
                        "type": "code",
                        "value": "Tópico \"pedidos\" (3 partições)\n\n  partição 0:  [e0][e1][e2][e3][e4]      offsets 0,1,2,3,4\n  partição 1:  [e0][e1][e2]              offsets 0,1,2\n  partição 2:  [e0][e1][e2][e3]          offsets 0,1,2,3\n\n# cada partição é um log independente, com sua própria sequência de offsets\n# a ordem só é garantida dentro de uma mesma partição, não entre partições diferentes"
                    },
                    {
                        "type": "text",
                        "value": "## Partição: a unidade de paralelismo e escala\n\nO número de partições é definido na criação do tópico, e pode ser aumentado depois, mas não reduzido. Cada partição pode ficar em um broker diferente do cluster, o que permite distribuir a carga de escrita e leitura entre várias máquinas. Mais partições significam mais paralelismo possível na leitura; menos partições significam menos overhead de coordenação. O número certo é uma decisão de capacidade, não um detalhe de configuração qualquer."
                    },
                    {
                        "type": "text",
                        "value": "## Offset: a posição dentro da partição\n\nO offset é um número inteiro sequencial que identifica a posição de um evento dentro da sua partição: o primeiro evento fica no offset 0, o segundo no offset 1, e assim por diante. O offset é local à partição, não ao tópico inteiro: o offset 5 da partição 0 e o offset 5 da partição 1 são eventos completamente diferentes. É por meio do offset que um consumidor sabe até onde já leu e de onde deve continuar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"O que representa\",\"Ordem garantida?\"],[\"Tópico\",\"Categoria lógica de eventos, como \\\"pedidos\\\"\",\"Não, apenas dentro de cada partição\"],[\"Partição\",\"Subdivisão do tópico, um log ordenado e imutável\",\"Sim, dentro da própria partição\"],[\"Offset\",\"Posição sequencial de um evento dentro de uma partição\",\"É o que define essa ordem\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um tópico não é um log: é um conjunto de logs paralelos, um por partição, e a ordem só existe dentro de cada um deles."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o offset de um evento no Kafka?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um identificador global e único do evento dentro de todo o tópico, independente da partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um número sequencial que identifica a posição do evento dentro da sua própria partição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um carimbo de tempo atribuído pelo broker no momento em que o evento é lido por um consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor calculado a partir da chave do evento, usado para localizar a partição de destino.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico 'cliques' tem 3 partições. Um evento está gravado no offset 10 da partição 0, e outro evento está gravado no offset 10 da partição 1. O que se pode afirmar sobre a relação entre esses dois eventos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São o mesmo evento, duplicado automaticamente pelo Kafka entre as partições do tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento da partição 1 foi necessariamente publicado depois do evento da partição 0.",
                                "isCorrect": false
                            },
                            {
                                "text": "São eventos distintos: o offset só identifica uma posição dentro da própria partição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um dos dois registros está corrompido, já que offsets não podem se repetir num tópico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa aumentar a capacidade de leitura paralela de um tópico que hoje tem apenas 1 partição e já virou gargalo. Qual ação resolve diretamente essa limitação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduzir o período de retenção do tópico, liberando espaço em disco para novas leituras simultâneas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o formato de serialização dos eventos para um formato mais compacto e rápido de ler.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o fator de replicação do tópico, criando mais cópias da partição existente nos brokers.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições do tópico, permitindo mais consumidores lendo em paralelo.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a relação entre tópico e partição no Kafka?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um tópico é dividido em uma ou mais partições, definidas na criação do tópico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma partição é dividida em um ou mais tópicos, conforme o volume de eventos publicados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tópico e partição são sinônimos: dois nomes para a mesma estrutura de armazenamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma partição existe de forma independente, sem estar associada a nenhum tópico específico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor lê a partição 2 de um tópico e observa que o próximo evento está no offset 47. Ele então passa a consumir a partição 0 do mesmo tópico. Que valor de offset ele deve esperar encontrar como ponto de partida coerente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Também 47, já que o offset avança de forma sincronizada entre todas as partições do tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer valor, porque cada partição mantém sua própria sequência de offsets, independente das demais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um valor menor que 47, porque partições com índice menor sempre têm menos eventos publicados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Zero, porque toda troca de partição reinicia a contagem de offsets do consumidor para aquele tópico.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Producers e a chave de particionamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Producers e a chave de particionamento\n\nQuem decide em qual partição um evento vai parar não é o broker, é o produtor. Essa decisão acontece a cada mensagem publicada e depende de uma escolha simples, mas com consequências grandes: enviar ou não uma chave junto com o evento. Esta aula explica como essa escolha afeta paralelismo e, principalmente, ordem."
                    },
                    {
                        "type": "text",
                        "value": "## Quem decide a partição\n\nAo publicar um evento, o produtor pode enviar uma chave (key) junto com o valor. Se uma chave é informada, o produtor aplica uma função determinística sobre ela para escolher a partição: a mesma chave sempre resulta na mesma partição, para aquele tópico. Se nenhuma chave é informada, o produtor distribui os eventos entre as partições disponíveis (round-robin), sem nenhuma relação com o conteúdo do evento."
                    },
                    {
                        "type": "code",
                        "value": "# produtor publica eventos de pedidos usando o id do pedido como chave\n\nprodutor.enviar(\n    topico=\"pedidos\",\n    chave=pedido.id,          # mesma chave -> sempre a mesma partição\n    valor=pedido.para_json(),\n)\n\n# sem chave, o evento vai para uma partição escolhida por distribuição,\n# sem relação alguma com o conteúdo do evento\nprodutor.enviar(topico=\"pedidos\", chave=None, valor=evento.para_json())"
                    },
                    {
                        "type": "code",
                        "value": "chave \"pedido-101\" -> partição 0\nchave \"pedido-102\" -> partição 2\nchave \"pedido-101\" -> partição 0     (mesma chave, sempre a mesma partição)\nchave \"pedido-103\" -> partição 1\nchave \"pedido-101\" -> partição 0     (de novo, sempre a mesma partição)\n\nsem chave (null): distribuição entre as partições disponíveis,\nsem relação com o conteúdo do evento"
                    },
                    {
                        "type": "text",
                        "value": "## Ordem é uma garantia por partição, não por tópico\n\nO Kafka garante ordem apenas dentro de uma mesma partição. Se os eventos de um mesmo pedido forem publicados sem chave, cada um pode cair numa partição diferente, e não existe garantia sobre em que ordem os consumidores vão processá-los entre si. Usar o id do pedido como chave resolve isso: todos os eventos daquele pedido caem sempre na mesma partição e, portanto, são lidos na ordem em que foram publicados."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Necessidade\",\"Estratégia de chave recomendada\"],[\"Ordem entre eventos do mesmo pedido\",\"Usar o id do pedido como chave\"],[\"Distribuir a carga o mais uniformemente possível, sem exigir ordem\",\"Publicar sem chave\"],[\"Eventos de um mesmo cliente processados sempre em sequência\",\"Usar o id do cliente como chave\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A chave não é um detalhe do payload: é a decisão que define se dois eventos relacionados caem na mesma partição e, por consequência, na mesma ordem."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que determina em qual partição um evento publicado no Kafka será armazenado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O broker que recebe a requisição, escolhido por menor carga no momento da publicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumidor que primeiro se inscrever no tópico, definindo a partição de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O produtor, com base na chave do evento ou por distribuição, quando não há chave.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tamanho em bytes do evento, que determina automaticamente a partição mais adequada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema publica eventos de pedidos sem informar chave, e o tópico tem 4 partições. Os eventos de um mesmo pedido, criado e depois atualizado, precisam ser processados na ordem correta. O que provavelmente vai dar errado nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os eventos serão rejeitados pelo broker, que exige chave obrigatória em tópicos com mais de uma partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os eventos serão duplicados automaticamente em todas as partições, gerando reprocessamento indevido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os eventos ficarão retidos por menos tempo, já que eventos sem chave têm retenção reduzida por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os eventos podem cair em partições diferentes e serem lidos fora da ordem em que foram publicados.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação publica todos os eventos de um mesmo cliente usando o id do cliente como chave. Qual comportamento o Kafka garante para esses eventos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Todos caem na mesma partição, preservando entre si a ordem em que foram publicados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos são replicados imediatamente para todas as partições do tópico, por segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos recebem prioridade de leitura sobre eventos de outros clientes no mesmo tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Todos são comprimidos juntos num único registro, reduzindo o número de offsets usados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico de eventos de login usa o país do usuário como chave de particionamento, e 90% dos usuários estão no mesmo país. O tópico tem 6 partições. Qual problema esse desenho de chave provavelmente causa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Perda de mensagens na partição que recebe mais tráfego, por exceder o limite de retenção configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma partição concentra a maior parte da carga, enquanto as demais ficam praticamente ociosas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O produtor passa a rejeitar novos eventos, já que uma chave não pode se repetir entre publicações.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cluster reequilibra automaticamente os dados, redistribuindo a chave entre as partições existentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente o comportamento padrão de um produtor Kafka quando um evento é publicado sem chave?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O evento é descartado, porque o Kafka exige uma chave para localizar a partição de destino.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento é replicado em todas as partições do tópico, para garantir que algum consumidor o leia.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento é distribuído entre as partições disponíveis, sem relação com o seu conteúdo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O evento é direcionado sempre para a partição 0, usada como destino padrão sem chave.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Consumers, consumer groups e rebalanceamento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Consumers, consumer groups e rebalanceamento\n\nUm consumidor sozinho lê eventos de um tópico. Um consumer group é o que permite que vários consumidores dividam esse trabalho entre si, cada um cuidando de uma parte das partições. Esta aula explica como essa divisão acontece, qual é o limite de paralelismo que ela impõe e o que muda quando um consumidor entra ou sai do grupo."
                    },
                    {
                        "type": "text",
                        "value": "## Consumer group: consumindo em equipe\n\nUm consumer group é um conjunto de consumidores que se identificam com o mesmo nome de grupo e dividem entre si a leitura das partições de um tópico. Dentro de um grupo, cada partição é atribuída a exatamente um consumidor por vez: dois consumidores do mesmo grupo nunca leem a mesma partição simultaneamente. Cada grupo mantém seu próprio controle de offset por partição, de forma independente de outros grupos que leiam o mesmo tópico."
                    },
                    {
                        "type": "code",
                        "value": "Tópico \"pedidos\" (4 partições: P0, P1, P2, P3)\n\n  grupo \"faturamento\"                grupo \"analytics\"\n  consumidor C1 -> lê P0, P1         consumidor C3 -> lê P0, P1, P2, P3\n  consumidor C2 -> lê P2, P3\n\n# os dois grupos leem o mesmo tópico de forma totalmente independente\n# cada grupo controla seu próprio offset por partição"
                    },
                    {
                        "type": "text",
                        "value": "## O limite do paralelismo\n\nDentro de um mesmo consumer group, o número de partições limita quantos consumidores conseguem trabalhar ao mesmo tempo. Com menos consumidores do que partições, alguns consumidores acumulam mais de uma partição. Com mais consumidores do que partições, os consumidores excedentes ficam ociosos, sem nenhuma partição atribuída, porque uma partição não pode ser dividida entre dois consumidores do mesmo grupo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Partições no tópico\",\"Consumidores no grupo\",\"O que acontece\"],[\"4\",\"4\",\"Cada consumidor lê exatamente uma partição\"],[\"4\",\"2\",\"Cada consumidor lê, em média, duas partições\"],[\"4\",\"6\",\"Quatro consumidores ativos, dois ficam ociosos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Rebalanceamento\n\nO rebalanceamento é o processo de redistribuir as partições entre os consumidores ativos de um grupo. Ele acontece quando um consumidor novo entra no grupo, quando um consumidor sai (de forma controlada ou por falha) ou quando o número de partições do tópico muda. Durante o rebalanceamento, o grupo pausa brevemente a leitura enquanto as partições são reatribuídas, o que é esperado, mas deve ser considerado ao dimensionar o grupo."
                    },
                    {
                        "type": "quote",
                        "value": "Um consumidor a mais do que partições disponíveis não acelera nada: ele fica esperando uma partição que nunca chega a ser atribuída a ele."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um consumer group no Kafka?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um conjunto de brokers que compartilham a responsabilidade de armazenar as partições de um tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conjunto de tópicos relacionados, agrupados para facilitar a administração do cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conjunto de partições que armazenam o mesmo evento, replicadas para maior disponibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conjunto de consumidores que dividem entre si a leitura das partições de um tópico.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico tem 6 partições e um consumer group tem 9 consumidores ativos. Qual é a consequência direta dessa configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Seis consumidores recebem uma partição cada, e três ficam sem nenhuma partição atribuída.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Kafka cria automaticamente três partições adicionais para atender aos consumidores excedentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os nove consumidores se revezam periodicamente na leitura de cada uma das seis partições.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo é dividido automaticamente em dois consumer groups menores, com nomes gerados pelo Kafka.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois consumer groups distintos, 'faturamento' e 'analytics', leem o mesmo tópico de pedidos. O grupo 'faturamento' está lendo eventos publicados há poucos segundos, enquanto o grupo 'analytics' está processando eventos de dois dias atrás. Isso é possível porque:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Kafka prioriza o grupo com nome alfabeticamente anterior, adiantando sua leitura em relação aos demais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada consumer group mantém seu próprio controle de offset, avançando de forma independente dos demais.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tópico mantém cópias separadas dos eventos para cada consumer group inscrito, isoladas entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo 'analytics' está lendo de uma réplica desatualizada da partição, ainda não sincronizada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um rebalanceamento causado pela queda inesperada de um consumidor, o que acontece com as partições que estavam atribuídas a ele?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ficam sem leitura até que o mesmo consumidor volte a ficar disponível e reassuma suas partições.",
                                "isCorrect": false
                            },
                            {
                                "text": "São descartadas do tópico, já que não há garantia de que os offsets do consumidor caído sejam recuperados.",
                                "isCorrect": false
                            },
                            {
                                "text": "São reatribuídas aos consumidores restantes do grupo, que retomam a leitura do último offset confirmado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Passam a ser lidas simultaneamente por todos os consumidores restantes do grupo, para garantir cobertura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer aumentar a velocidade de consumo de um tópico e decide adicionar mais consumidores ao consumer group existente, além do número de partições do tópico. Qual é o resultado esperado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A velocidade de leitura aumenta proporcionalmente ao número total de consumidores adicionados ao grupo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Kafka aumenta automaticamente o número de partições para acomodar os novos consumidores ativos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os consumidores excedentes assumem partições de outros consumer groups que leem o mesmo tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os consumidores excedentes ficam ociosos, já que o número de partições limita o paralelismo do grupo.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Retenção, replicação e durabilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Retenção, replicação e durabilidade\n\nAté aqui, vimos como um evento é organizado (tópico, partição, offset) e como ele chega e é lido (produtor, consumidor, consumer group). Faltam duas perguntas: por quanto tempo um evento fica disponível, e o que acontece se um broker cair no meio do caminho. São as perguntas desta aula: retenção e replicação."
                    },
                    {
                        "type": "text",
                        "value": "## Retenção: por quanto tempo o evento fica disponível\n\nCada tópico tem uma política de retenção, configurada por tempo, por tamanho, ou pelos dois ao mesmo tempo. Quando o limite é atingido, os eventos mais antigos são descartados por causa do tempo ou do espaço configurado, não por causa da leitura. Um evento nunca lido e um evento já lido por todos os consumidores são descartados exatamente na mesma hora, se a política de retenção for a mesma."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de retenção\",\"Critério de descarte\",\"Exemplo\"],[\"Por tempo\",\"Idade do evento ultrapassa o limite configurado\",\"Reter por 7 dias\"],[\"Por tamanho\",\"A partição ultrapassa o limite de espaço configurado\",\"Reter até 50 GB por partição\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Replicação: sobrevivendo à queda de um broker\n\nCada partição pode ser replicada em mais de um broker, conforme o fator de replicação (replication factor) definido no tópico. Entre as réplicas de uma partição, uma é a líder: é ela que recebe todas as escritas e leituras daquela partição. As demais são seguidoras, que replicam continuamente os dados a partir da líder, prontas para assumir se a líder falhar."
                    },
                    {
                        "type": "code",
                        "value": "Partição 0 do tópico \"pedidos\" (replication factor = 3)\n\n  broker 1: [líder]      <- produtor escreve aqui\n  broker 2: [seguidor]   <- replica continuamente a partir do líder\n  broker 3: [seguidor]   <- replica continuamente a partir do líder\n\n# se o broker 1 cair:\n\n  broker 1: [fora do ar]\n  broker 2: [novo líder]   <- eleito entre os seguidores em sincronia\n  broker 3: [seguidor]     <- passa a replicar a partir do novo líder"
                    },
                    {
                        "type": "text",
                        "value": "## O que garante durabilidade\n\nDurabilidade não é uma propriedade automática de gravar em disco uma vez: ela depende de existir mais de uma cópia da partição, com fator de replicação maior que 1, e de a escrita ser confirmada em réplicas suficientes antes de ser considerada concluída. Uma partição sem réplicas, com fator de replicação igual a 1, perde os dados se o broker que a hospeda falhar antes de qualquer cópia existir em outro lugar. A definição exata de \"confirmação\" é o assunto do próximo módulo."
                    },
                    {
                        "type": "quote",
                        "value": "Durabilidade não vem de gravar em disco uma vez: vem de ter cópias do mesmo dado em brokers diferentes, prontas para assumir se uma delas cair."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que determina quando um evento é descartado de um tópico Kafka, segundo a política de retenção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tempo decorrido ou o espaço ocupado pela partição, conforme o limite configurado no tópico.",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de consumidores que já confirmaram a leitura completa daquele evento específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "A prioridade atribuída ao evento no momento da publicação, definida pelo produtor de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho individual do evento, descartado automaticamente se ultrapassar um limite por mensagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico tem fator de replicação igual a 1, ou seja, cada partição existe em um único broker, sem seguidores. Qual é o risco direto dessa configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tópico não aceita publicação de eventos sem chave, exigindo ajuste no produtor antes de operar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dados da partição são perdidos se o broker que a hospeda falhar antes de serem replicados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O throughput de leitura cai significativamente, já que não há réplicas para distribuir consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O offset dos eventos passa a ser reiniciado periodicamente, por falta de réplicas de apoio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa partição com fator de replicação 3, o broker que hospeda a réplica líder falha repentinamente. O que acontece com a disponibilidade dessa partição, supondo que os seguidores estejam em sincronia com a líder?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A partição fica indisponível até que o broker original volte a funcionar e reassuma a liderança.",
                                "isCorrect": false
                            },
                            {
                                "text": "A partição é descartada do tópico, e uma nova partição vazia é criada para substituí-la no cluster.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dos seguidores em sincronia é eleito novo líder, e a partição continua disponível.",
                                "isCorrect": true
                            },
                            {
                                "text": "As escritas futuras nessa partição passam a ser distribuídas entre todos os seguidores restantes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe configura um tópico crítico com fator de replicação 3, mas exige que a escrita seja confirmada por apenas uma réplica, a líder, antes de considerar a publicação concluída. Que risco essa combinação ainda mantém?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhum: fator de replicação 3 já elimina qualquer risco de perda, independente de quantas réplicas confirmam.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tópico passa a aceitar no máximo 3 consumidores simultâneos, um por réplica configurada.",
                                "isCorrect": false
                            },
                            {
                                "text": "As partições desse tópico deixam de suportar mais de um consumer group lendo ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a líder falhar antes de replicar o dado para os seguidores, esse evento pode se perder.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o papel da réplica líder de uma partição, em contraste com as réplicas seguidoras?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A líder recebe todas as escritas e leituras da partição; as seguidoras replicam esses dados continuamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "A líder armazena apenas metadados da partição; as seguidoras armazenam os eventos publicados de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "A líder é escolhida uma única vez na criação do tópico e nunca muda durante a vida da partição.",
                                "isCorrect": false
                            },
                            {
                                "text": "A líder distribui as escritas recebidas entre as seguidoras, que processam parte de cada evento.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Produzindo e consumindo no Kafka",
        "aulas": [
            {
                "titulo": "O produtor: acks, batching e idempotência",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O produtor: acks, batching e idempotência\n\nNo módulo anterior o produtor já aparecia enviando eventos para um tópico e escolhendo a partição pela chave. Falta a parte que decide quanto o produtor espera antes de considerar a mensagem entregue, e como ele agrupa mensagens para não afogar o broker em requisições pequenas. Essas duas escolhas, mais o produtor idempotente, são o que separa um pipeline que perde ou duplica dado silenciosamente de um que não perde.\n\n## Acks: quanto o produtor espera pela durabilidade\n\n`acks` define quantas réplicas precisam confirmar a escrita antes do broker responder ao produtor. Não é uma configuração de velocidade, é uma configuração de risco de perda."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Config\",\"O que o produtor espera\",\"Risco de perda\"],[\"acks=0\",\"Nenhuma confirmação do broker\",\"Alto: perde silenciosamente se o broker cair antes de escrever\"],[\"acks=1\",\"Confirmação do broker líder, após escrever no log local\",\"Perde se o líder cair antes de replicar para o ISR\"],[\"acks=all (-1)\",\"Confirmação do líder e de todas as réplicas do ISR\",\"Mínimo: só perde se o ISR inteiro cair junto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Batching e linger.ms: throughput sem multiplicar requisições\n\nPor padrão o produtor já tenta agrupar, num único lote, os registros destinados à mesma partição, em vez de mandar uma requisição de rede por mensagem (o tamanho desse lote é o `batch.size`). `linger.ms` estica isso de propósito: o produtor espera alguns milissegundos a mais antes de enviar, na esperança de encher o lote com mais registros. O resultado é menos requisições, melhor compressão e menos I/O no broker, ao custo de uma latência extra pequena e previsível."
                    },
                    {
                        "type": "code",
                        "value": "linger.ms = 0 (envio imediato, sem agrupar)\n\n  msg1 --------> [ requisição 1 ]\n  msg2 --------> [ requisição 2 ]\n  msg3 --------> [ requisição 3 ]\n\n  3 mensagens = 3 idas e voltas na rede\n\nlinger.ms = 10 (agrupa por até 10ms antes de enviar)\n\n  msg1 -\\\n  msg2 --+--> [ lote único ] --------> [ requisição 1 ]\n  msg3 -/\n\n  3 mensagens = 1 ida e volta na rede, +10ms de espera no pior caso"
                    },
                    {
                        "type": "code",
                        "value": "config_produtor = {\n    \"bootstrap.servers\": \"kafka1:9092,kafka2:9092\",\n    \"acks\": \"all\",              # espera o líder e o ISR confirmarem\n    \"retries\": 5,                # reenvia em falha transitória (timeout, líder indisponível)\n    \"linger.ms\": 10,             # espera até 10ms para agrupar mais registros no lote\n    \"batch.size\": 32768,         # tamanho máximo do lote, em bytes\n}\n\nprodutor = Produtor(config_produtor)\nprodutor.enviar(\n    topico=\"pedidos\",\n    chave=str(pedido.cliente_id),   # mesma chave sempre cai na mesma partição\n    valor=serializar(pedido),\n    callback=confirmar_entrega,\n)\nprodutor.flush()   # espera as confirmações pendentes antes de encerrar"
                    },
                    {
                        "type": "text",
                        "value": "## O produtor idempotente: retry sem duplicar\n\nCom `retries` ativo, um timeout de rede depois que o broker já escreveu o registro, mas antes do ack voltar, faz o produtor reenviar a mesma mensagem e criar um duplicado no log. `enable.idempotence=true` resolve isso sem lógica extra na aplicação: o produtor ganha um identificador (producer ID) e numera cada registro por partição; o broker reconhece o par producer ID e número de sequência repetido e descarta o reenvio. Ativar idempotência também força `acks=all` automaticamente, é a base sobre a qual as transações do Kafka (módulo 4) são construídas."
                    },
                    {
                        "type": "quote",
                        "value": "Acks decide quanto o produtor espera pela durabilidade, linger.ms decide quanto ele espera pelo throughput, e o produtor idempotente resolve o duplicado que o próprio retry cria, sem exigir dedup na aplicação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um time configura o produtor Kafka com acks=0 em um pipeline de métricas de clique, buscando a menor latência possível. Qual é a consequência direta dessa escolha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O produtor não espera nenhuma confirmação do broker, então uma mensagem pode se perder sem que ele perceba.",
                                "isCorrect": true
                            },
                            {
                                "text": "O produtor espera a confirmação apenas do broker líder, então só perde mensagem se o líder cair antes de replicar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O produtor espera a confirmação do líder e de todas as réplicas do ISR, então a perda fica praticamente descartada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O produtor só envia a próxima mensagem depois que o consumidor confirma o processamento da mensagem anterior.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de pagamentos publica eventos de transação no Kafka e não pode aceitar perda de mensagem nem com a queda de um broker. Qual configuração de acks do produtor atende essa exigência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "acks=1, pois a confirmação do broker líder já garante que a mensagem foi replicada para as demais cópias.",
                                "isCorrect": false
                            },
                            {
                                "text": "acks=all, pois a mensagem só é confirmada depois que o líder e todas as réplicas do ISR escrevem o registro.",
                                "isCorrect": true
                            },
                            {
                                "text": "acks=0, pois desligar a confirmação evita que o produtor fique bloqueado esperando os brokers responderem.",
                                "isCorrect": false
                            },
                            {
                                "text": "acks=all, mas só funciona se o produtor também tiver enable.idempotence ligado, senão o ack é ignorado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação envia picos de milhares de eventos por segundo para o Kafka, e o time percebe muitas requisições pequenas saindo do produtor, sobrecarregando a rede. Qual ajuste tende a reduzir esse problema, sem trocar de broker?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir o número de partições do tópico, para que o produtor tenha menos destinos possíveis por mensagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar acks=all por acks=0, pois menos confirmações esperadas reduzem a quantidade de requisições enviadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar linger.ms e o batch.size, deixando o produtor agrupar mais registros por requisição antes de enviar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Diminuir o retries do produtor, para que ele pare de reenviar as mesmas mensagens em cada requisição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma requisição de escrita do produtor chega ao broker e é persistida, mas a confirmação se perde por timeout de rede antes de voltar ao produtor. Com enable.idempotence=true, o que evita que a mensagem fique duplicada quando o produtor reenviar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O consumidor identifica a chave repetida ao ler as duas cópias e descarta a segunda antes de processar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O produtor guarda um hash local de cada mensagem enviada e nunca reenvia duas mensagens com o mesmo hash.",
                                "isCorrect": false
                            },
                            {
                                "text": "O broker aceita as duas cópias no log, mas marca a segunda como duplicada para o consumidor ignorar depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O broker reconhece o par producer ID e número de sequência repetido e descarta o reenvio duplicado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um produtor Kafka está configurado com linger.ms=0. O que isso significa na prática para o envio das mensagens?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O produtor tenta enviar cada registro assim que possível, sem esperar para juntar mais registros no lote.",
                                "isCorrect": true
                            },
                            {
                                "text": "O produtor espera o batch.size encher completamente antes de fazer qualquer envio, mesmo que isso demore.",
                                "isCorrect": false
                            },
                            {
                                "text": "O produtor só respeita o linger.ms configurado quando o enable.idempotence está desligado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O produtor agrupa um lote por partição a cada um milissegundo, independente da quantidade de dados acumulada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O consumidor: poll, commit de offset e at-least-once",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O consumidor: poll, commit de offset e at-least-once\n\nO produtor decide acks e batching; o consumidor decide quando avisa o Kafka \"já processei até aqui\". Essa segunda decisão, o commit do offset, é tão importante quanto a primeira: é ela que determina se uma falha no meio do processamento vira mensagem reprocessada ou mensagem perdida.\n\n## O loop de poll\n\nUm consumidor Kafka não recebe mensagens via push, ele puxa. O `poll()` busca o próximo lote de registros das partições atribuídas ao consumidor dentro do consumer group (como já visto no módulo 2) e também delimita o tempo entre uma chamada e outra: não chamar `poll()` dentro do intervalo configurado em `max.poll.interval.ms` tira o consumidor do grupo e dispara um rebalanceamento, mesmo que o heartbeat continue rodando em paralelo numa thread separada."
                    },
                    {
                        "type": "code",
                        "value": "config_consumidor = {\n    \"bootstrap.servers\": \"kafka1:9092,kafka2:9092\",\n    \"group.id\": \"servico-notificacoes\",\n    \"enable.auto.commit\": False,     # commit manual, controlado pela aplicação\n    \"auto.offset.reset\": \"earliest\", # de onde começar se não houver offset salvo\n}\n\nconsumidor = Consumidor(config_consumidor)\nconsumidor.subscribe([\"pedidos\"])\n\nenquanto True:\n    lote = consumidor.poll(timeout=1000)\n    para registro em lote:\n        processar(registro.valor)     # só avança depois de processar com sucesso\n    consumidor.commitSync()           # confirma o offset do lote inteiro"
                    },
                    {
                        "type": "text",
                        "value": "## Commit automático x commit manual\n\n`enable.auto.commit=true` é o padrão mais simples: a cada `auto.commit.interval.ms` o cliente confirma o maior offset já entregue ao poll(), sem saber se a aplicação realmente terminou de processar aquele lote. Para controlar a semântica de entrega, a aplicação precisa desligar o auto-commit e chamar `commitSync()` (bloqueante, confirma e espera resposta) ou `commitAsync()` (não bloqueia, mas exige tratar falha de commit por callback) no momento certo do próprio código."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"Quando confirma o offset\",\"Quem controla o momento\"],[\"Auto-commit\",\"Em intervalo fixo, em paralelo ao processamento\",\"O cliente Kafka, não a aplicação\"],[\"commitSync()\",\"Síncrono, só retorna após o broker confirmar\",\"A aplicação, no ponto exato do código\"],[\"commitAsync()\",\"Assíncrono, não bloqueia o loop de poll\",\"A aplicação, com callback de erro\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Commit depois de processar: at-least-once na prática\n\nChamar o commit depois que o registro foi processado com sucesso é a base do at-least-once: se o processo cair entre o fim do processamento e o commit, o offset não avançou, e o consumidor reprocessa o mesmo lote ao reiniciar. Isso é seguro (nenhum dado se perde), mas exige que o processamento seja idempotente ou tolere duplicata, porque o mesmo registro pode ser entregue mais de uma vez."
                    },
                    {
                        "type": "code",
                        "value": "commit DEPOIS de processar (at-least-once)\n\n  poll -> processar registro -> [ crash aqui ] -> commit\n  reinício: offset não avançou -> registro é entregue de novo\n  resultado: pode reprocessar, nunca perde\n\ncommit ANTES de processar (at-most-once)\n\n  poll -> commit -> [ crash aqui ] -> processar registro\n  reinício: offset já avançou -> registro não é entregue de novo\n  resultado: pode perder, nunca reprocessa"
                    },
                    {
                        "type": "quote",
                        "value": "A ordem entre processar e confirmar o offset é a decisão: confirmar depois de processar dá at-least-once, que pode reprocessar; confirmar antes de processar dá at-most-once, que pode perder."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um consumidor Kafka fica preso processando um registro muito pesado e demora mais que o max.poll.interval.ms para chamar poll() de novo. O que o Kafka faz nesse caso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aumenta automaticamente o max.poll.interval.ms daquele consumidor, para dar mais tempo ao processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grupo considera o consumidor inativo e dispara um rebalanceamento das partições para os demais membros.",
                                "isCorrect": true
                            },
                            {
                                "text": "O broker armazena o registro pendente numa fila separada até o consumidor liberar o processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumidor perde a assinatura do tópico e precisa reiniciar a aplicação para voltar a consumir.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço usa enable.auto.commit=true com intervalo padrão de 5 segundos. Um lote é recebido do poll(), mas o processo cai 2 segundos depois, antes de terminar de processar todos os registros do lote. O que pode ter acontecido com esses registros?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum registro se perde, porque o auto-commit só confirma offsets de registros já processados pela aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os registros ficam automaticamente numa fila de retry interna do consumidor, aguardando o próximo poll().",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o auto-commit já confirmou aquele offset antes da queda, os registros pendentes ficam perdidos de vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Kafka percebe a queda pelo heartbeat do grupo e reenvia só os registros que ainda não foram processados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de cobrança processa um registro, gera a cobrança num sistema externo e só depois chama commitSync(). Em um teste, o processo é morto logo após o sistema externo responder com sucesso, mas antes do commitSync() retornar. O que acontece ao reiniciar o consumidor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O commitSync() é reexecutado automaticamente na inicialização, então o offset avança sem reprocessar nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O offset fica corrompido, e o consumidor precisa ser removido do grupo manualmente para voltar a funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Kafka detecta que o commit estava em andamento e completa a confirmação pendente antes de entregar novos registros.",
                                "isCorrect": false
                            },
                            {
                                "text": "O offset não foi confirmado, então o mesmo registro é entregue de novo, e a cobrança pode ser gerada duas vezes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline coleta métricas de monitoramento, onde a perda ocasional de um ponto é aceitável, mas reprocessar e gerar métrica duplicada distorce o gráfico. Qual estratégia de commit se encaixa melhor nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Confirmar o offset com commitSync() logo após o poll(), antes de processar o lote, aceitando perder registros em falha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Confirmar o offset com commitSync() logo após processar cada registro, garantindo que nenhuma métrica seja perdida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar o commit de offset por completo, e reprocessar o tópico inteiro a cada reinício do consumidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar commitAsync() apenas para os registros que falharem no processamento, mantendo o restante sem confirmar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca commitSync() por commitAsync() no loop de consumo para reduzir a latência entre lotes. Qual cuidado adicional essa troca exige?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum cuidado extra, porque commitAsync() é apenas uma variante síncrona por baixo, só muda o nome do método.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tratar falhas de commit via callback, porque commitAsync() não bloqueia o loop nem garante que o offset já foi confirmado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Desligar o consumer group, porque commitAsync() só funciona fora de um grupo, com atribuição manual de partições.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de partições do tópico, porque commitAsync() não suporta consumidores com mais de uma partição atribuída.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ordem, particionamento e paralelismo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ordem, particionamento e paralelismo\n\nO Kafka garante ordem, mas com um detalhe que costuma pegar gente de surpresa em entrevista: a ordem só é garantida dentro de uma partição, nunca entre partições diferentes do mesmo tópico. A partição é ao mesmo tempo a unidade de ordem e a unidade de paralelismo, e as duas coisas vêm do mesmo lugar: cada partição é lida por, no máximo, um consumidor por vez dentro do mesmo consumer group."
                    },
                    {
                        "type": "code",
                        "value": "Tópico \"pedidos\" com 3 partições\n\nPartição 0: [ evento A1 ][ evento A5 ][ evento A9 ]   -> ordem garantida dentro da partição 0\nPartição 1: [ evento B2 ][ evento B4 ][ evento B7 ]   -> ordem garantida dentro da partição 1\nPartição 2: [ evento B3 ][ evento A6 ][ evento B8 ]   -> ordem garantida dentro da partição 2\n\nOrdem entre partições (A1, B2, B3, A5, ...): NÃO garantida"
                    },
                    {
                        "type": "text",
                        "value": "## Mais partições, mais paralelismo (até um limite)\n\nDentro de um consumer group, cada partição é atribuída a no máximo um consumidor. Isso significa que o paralelismo real do consumo é limitado pelo número de partições: com 6 partições, no máximo 6 consumidores do mesmo grupo processam em paralelo. Adicionar um sétimo consumidor não acelera nada, ele fica ocioso, esperando um rebalanceamento lhe dar uma partição."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Consumidores no grupo\",\"Partições no tópico\",\"Resultado\"],[\"3\",\"6\",\"Cada consumidor recebe 2 partições, paralelismo parcial\"],[\"6\",\"6\",\"Cada consumidor recebe 1 partição, paralelismo máximo\"],[\"9\",\"6\",\"6 consumidores ativos, 3 ficam ociosos sem partição\"]]"
                    },
                    {
                        "type": "code",
                        "value": "6 partições, grupo com 3 consumidores:\n\n  Consumidor 1  <- partição 0, partição 1\n  Consumidor 2  <- partição 2, partição 3\n  Consumidor 3  <- partição 4, partição 5\n\n6 partições, grupo com 9 consumidores:\n\n  Consumidor 1..6     <- uma partição cada\n  Consumidor 7, 8, 9  <- ociosos, sem partição atribuída"
                    },
                    {
                        "type": "text",
                        "value": "## A chave de particionamento e a partição quente\n\nA chave do registro decide a partição via hash, e é ela que define o \"escopo\" da ordem: eventos com a mesma chave (o mesmo cliente_id, por exemplo) sempre caem na mesma partição e saem na ordem em que foram produzidos. O risco é escolher uma chave de baixa cardinalidade ou muito desbalanceada: se a maior parte dos eventos usa a mesma chave, essa partição vira uma partição quente, concentra a carga num consumidor só, e o resto do paralelismo fica ocioso, mesmo com várias partições disponíveis."
                    },
                    {
                        "type": "quote",
                        "value": "A partição é a unidade de paralelismo e a unidade de ordem ao mesmo tempo; aumentar partições só aumenta o paralelismo real se a chave distribuir a carga de forma razoavelmente uniforme entre elas."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um sistema precisa garantir que os eventos de um mesmo pedido (criado, pago, enviado) sejam processados na ordem exata em que aconteceram, sem abrir mão do paralelismo entre pedidos diferentes. Qual decisão de particionamento atende os dois requisitos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar uma única partição para o tópico inteiro, o que mantém a ordem global mas elimina o paralelismo entre pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições do tópico, contando que o consumidor cubra mais eventos em paralelo automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o id do pedido como chave de particionamento, mantendo os eventos de um mesmo pedido sempre na mesma partição.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configurar acks=all no produtor, para que o broker só confirme os eventos na ordem exata em que foram produzidos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um tópico Kafka com múltiplas partições, onde a ordem dos registros é garantida?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em todo o tópico, independente de quantas partições ele tenha configuradas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas entre registros que têm o mesmo timestamp de produção, dentro do tópico inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas entre os registros lidos pelo mesmo consumidor, independente da partição de origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas dentro de cada partição, entre os registros que são gravados naquela mesma partição.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico tem 4 partições e um consumer group com 4 consumidores, cada um processando uma partição. O time aumenta o tópico para 8 partições para ganhar paralelismo, mas mantém os mesmos 4 consumidores. O que acontece com o paralelismo de consumo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não aumenta, porque cada consumidor passa a receber 2 partições e continua processando uma de cada vez, só revezando.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dobra automaticamente, porque o Kafka distribui o processamento de cada partição entre todos os consumidores do grupo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dobra, mas só depois que o rebalanceamento termina de mover as partições novas para os consumidores existentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica igual a antes, porque partições novas só passam a receber registros depois de um reinício manual do tópico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico tem 12 partições, mas o produtor usa sempre a mesma chave fixa para 90% dos eventos, por engano. O time nota que um único consumidor do grupo está sobrecarregado, enquanto os outros ficam quase ociosos. Qual é a causa raiz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tópico tem partições demais para o volume de eventos, e o ideal é reduzir para 1 partição apenas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave de baixa cardinalidade concentra quase todos os eventos numa única partição, criando uma partição quente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O consumer group está mal configurado, e precisa de mais instâncias de consumidor para se equilibrar sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "O broker líder daquela partição está com replicação atrasada, o que faz o consumidor processar mais devagar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de criar um tópico de eventos de cliques com alto volume, o time discute quantas partições usar. Qual afirmação sobre esse número é verdadeira?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O número de partições pode ser reduzido livremente depois, sem nenhum impacto na chave de particionamento existente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número ideal de partições deve ser sempre igual ao número de brokers do cluster, nunca maior nem menor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar partições depois é possível, mas muda o mapeamento de chave para partição dos novos registros, exigindo cuidado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de partições só afeta a durabilidade dos dados, não tem relação nenhuma com paralelismo de consumo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Serialização e schema",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Serialização e schema\n\nO Kafka não sabe nem se importa com o que tem dentro de uma mensagem: para o broker, cada registro é só um array de bytes numa partição. Quem dá significado a esses bytes é o par serializador (no produtor) e desserializador (no consumidor), e os dois precisam concordar sobre o formato. Esse acordo é o contrato entre quem produz e quem consome, e é ele que quebra silenciosamente quando alguém muda um campo sem avisar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"JSON\",\"Avro\"],[\"Schema\",\"Não tem schema embutido por padrão\",\"Schema explícito, definido separadamente\"],[\"Tamanho da mensagem\",\"Maior, repete os nomes dos campos em cada registro\",\"Menor, os dados vêm sem os nomes dos campos\"],[\"Leitura humana\",\"Legível diretamente, fácil de debugar\",\"Binário, precisa do schema para ler\"],[\"Evolução de schema\",\"Não valida nada, a quebra só aparece em runtime\",\"Validada no Schema Registry, com regras de compatibilidade\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Mensagem em JSON (o que trafega na partição):\n\n{\n  \"pedido_id\": \"9f3a2e\",\n  \"cliente_id\": 4821,\n  \"valor_total\": 189.90,\n  \"status\": \"pago\"\n}\n\nO mesmo evento com schema Avro (.avsc):\n\n{\n  \"type\": \"record\",\n  \"name\": \"PedidoPago\",\n  \"fields\": [\n    { \"name\": \"pedido_id\", \"type\": \"string\" },\n    { \"name\": \"cliente_id\", \"type\": \"long\" },\n    { \"name\": \"valor_total\", \"type\": \"double\" },\n    { \"name\": \"status\", \"type\": \"string\" },\n    { \"name\": \"cupom\", \"type\": [\"null\", \"string\"], \"default\": null }\n  ]\n}\n\n// campo \"cupom\": novo, opcional, com default null -> evolução compatível"
                    },
                    {
                        "type": "text",
                        "value": "## O Schema Registry: o contrato centralizado\n\nO Schema Registry guarda as versões de cada schema e associa cada uma a um ID. O produtor, antes de enviar, registra (ou valida contra) o schema esperado para o tópico; o consumidor, ao ler, usa o ID embutido na mensagem para buscar o schema certo no registry e desserializar. O ganho prático: a mensagem carrega só o ID do schema, não o schema inteiro, e o registry aplica as regras de compatibilidade antes de aceitar qualquer mudança."
                    },
                    {
                        "type": "code",
                        "value": "Produtor              Schema Registry             Kafka                Consumidor\n\nregistra/valida   -->  guarda o schema,\n    schema             retorna um ID\n\nenvia [ID + bytes Avro] -----------------------> grava na partição\n\n                                                  entrega [ID + bytes] --> lê o ID\n                                                                            busca o schema pelo ID\n                                                                            (na Schema Registry)\n                                                                            desserializa com o\n                                                                            schema correto"
                    },
                    {
                        "type": "text",
                        "value": "## Evolução de schema: mudar sem quebrar quem já consome\n\nSchemas mudam: um campo novo, um tipo que precisa ajustar. O Schema Registry classifica a compatibilidade de uma mudança antes de aceitá-la. Na prática, o padrão mais seguro é a compatibilidade backward: todo campo novo entra como opcional, com valor padrão, e nenhum campo existente é removido ou muda de tipo sem uma migração planejada. É o mesmo cuidado de evolução de schema que já apareceu na trilha de ETL, só que aqui o consumidor pode estar lendo em tempo real, sem uma janela de manutenção para se ajustar."
                    },
                    {
                        "type": "quote",
                        "value": "Serializar é mais que escolher um formato, é assumir um contrato entre quem produz e quem consome; o Schema Registry existe para que esse contrato só mude de um jeito que não quebra quem já está lendo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Do ponto de vista do broker Kafka, o que de fato é armazenado dentro de uma partição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Objetos JSON estruturados, que o broker consegue ler e validar antes de gravar no log.",
                                "isCorrect": false
                            },
                            {
                                "text": "Registros no formato Avro, único formato nativamente suportado pelo protocolo do Kafka.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela relacional com colunas fixas, definidas no momento da criação do tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sequências de bytes, sem que o broker interprete ou valide o conteúdo de cada registro.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time está decidindo o formato de serialização para um tópico de altíssimo volume, onde o custo de armazenamento e rede importa, e já existe um Schema Registry disponível na empresa. Qual decisão tende a reduzir mais o volume de dados trafegado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar Avro com o Schema Registry, porque o registro não carrega os nomes dos campos em cada mensagem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar JSON com compressão gzip habilitada no produtor, porque a compressão elimina totalmente o overhead do schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar Avro sem o Schema Registry, incluindo o schema inteiro em cada mensagem para garantir compatibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar JSON sem alterações, porque o parser de JSON do broker já é otimizado para grandes volumes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um produtor adiciona ao schema Avro um campo obrigatório, sem valor default, e tenta registrar a mudança num Schema Registry com compatibilidade backward. O que provavelmente acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A mudança é aceita normalmente, porque adicionar campos nunca afeta a compatibilidade de um schema Avro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Schema Registry rejeita o novo schema, porque um campo obrigatório sem default quebra a compatibilidade backward.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Kafka reverte automaticamente a mensagem para o schema anterior, mantendo os consumidores funcionando sem alteração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os consumidores existentes passam a ignorar o Schema Registry e desserializam direto como JSON, sem erro aparente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um produtor adiciona um novo campo opcional, com valor default definido, a um schema Avro já usado em produção. Consumidores antigos, que não conhecem esse campo, continuam rodando sem atualização. O que tende a acontecer com esses consumidores?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Param de conseguir desserializar qualquer mensagem, porque todo consumidor precisa da versão mais recente do schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Passam a receber erro de compatibilidade do Schema Registry a cada mensagem lida, até serem atualizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Continuam funcionando normalmente, porque um campo novo opcional com default mantém a compatibilidade do schema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Continuam funcionando, mas o Kafka descarta silenciosamente o campo novo antes de gravar a mensagem na partição.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline lê um tópico Avro e grava os dados num data lake, e o job de ETL downstream depende de um campo específico do schema. O time precisa mudar o tipo desse campo, de int para string. Qual abordagem preserva a compatibilidade com quem já consome?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alterar o tipo do campo diretamente no schema existente, porque o Schema Registry converte o tipo automaticamente para os consumidores antigos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o campo antigo e adicionar um novo com outro nome e o tipo novo, sem nenhuma coordenação adicional com quem consome.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o schema no Schema Registry para o modo de compatibilidade \"none\", o que libera qualquer alteração de tipo sem quebrar ninguém.",
                                "isCorrect": false
                            },
                            {
                                "text": "Introduzir um campo novo com o tipo string, manter o campo antigo por um período de transição e migrar os consumidores antes de removê-lo.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Log compaction x retenção por tempo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Log compaction x retenção por tempo\n\nAté aqui todo tópico foi tratado como um log que cresce e, em algum momento, descarta o que é antigo. Essa é só uma das duas políticas de limpeza que o Kafka oferece. A outra, log compaction, não olha para a idade do registro, olha para a chave: em vez de apagar o que é velho, ela apaga o que está desatualizado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Retenção por tempo/tamanho (delete)\",\"Log compaction (compact)\"],[\"O que mantém\",\"Registros dentro da janela de tempo ou tamanho configurada\",\"Apenas o último valor gravado para cada chave\"],[\"O que remove\",\"Segmentos inteiros mais antigos que o limite\",\"Versões antigas da mesma chave, mesmo que recentes\"],[\"Histórico\",\"Preserva a sequência completa de eventos, até expirar\",\"Perde eventos intermediários, só o estado final de cada chave\"],[\"Uso típico\",\"Eventos: cliques, pedidos criados, logs de aplicação\",\"Changelog: último endereço do cliente, estado de uma sessão\"]]"
                    },
                    {
                        "type": "code",
                        "value": "retention.ms = 7 dias (cleanup.policy=delete)\n\n[ seg. dia1 ][ seg. dia2 ][ seg. dia3 ] ... [ seg. dia7 ][ seg. dia8 (novo) ]\n     ^ expira e é apagado assim que o segmento passa dos 7 dias\n\na partição só cresce até o limite e depois descarta os segmentos mais antigos"
                    },
                    {
                        "type": "code",
                        "value": "cleanup.policy=compact, chave = cliente_id\n\nantes da compactação (offsets em ordem):\n[ cliente_1=SP ][ cliente_2=RJ ][ cliente_1=MG ][ cliente_3=BA ][ cliente_1=RS ]\n\ndepois da compactação (só o último valor por chave):\n[ cliente_2=RJ ][ cliente_3=BA ][ cliente_1=RS ]\n\ncliente_1=SP e cliente_1=MG somem: já foram substituídos por um valor mais novo da mesma chave"
                    },
                    {
                        "type": "text",
                        "value": "## Tombstone: como apagar uma chave num tópico compactado\n\nUm tópico compactado não tem \"delete\" tradicional; para remover uma chave de vez, o produtor grava um registro com aquela chave e valor nulo, chamado de tombstone. A compactação remove a chave inteira (todas as versões antigas mais o próprio tombstone) depois que ele fica disponível por `delete.retention.ms`, tempo suficiente para consumidores lentos ainda conseguirem lê-lo antes de sumir de vez."
                    },
                    {
                        "type": "text",
                        "value": "## Quando usar cada política\n\nRetenção por tempo é a escolha natural para fluxos de eventos: um clique, um pedido criado, uma medição de sensor, cada registro é um fato imutável e todos importam, mesmo que velhos. Log compaction é a escolha para changelog e estado: o endereço atual de um cliente, o saldo mais recente de uma conta, o último status de um pedido, onde só o valor mais recente por chave importa, geralmente para reconstruir uma tabela a partir do tópico."
                    },
                    {
                        "type": "quote",
                        "value": "Retenção por tempo pergunta há quanto tempo isso foi gravado; log compaction pergunta se existe uma versão mais nova desta chave; escolher a política errada faz o tópico crescer sem necessidade ou perder histórico que deveria existir."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um time quer manter no Kafka o endereço de entrega mais recente de cada cliente, para reconstruir esse estado numa tabela sempre que precisar, sem guardar o histórico completo de mudanças de endereço. Qual política de limpeza do tópico atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "cleanup.policy=compact, usando o id do cliente como chave, para manter só o último endereço gravado por cliente.",
                                "isCorrect": true
                            },
                            {
                                "text": "cleanup.policy=delete, com retention.ms alto o suficiente para nunca expirar nenhum registro do tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "cleanup.policy=compact, usando o timestamp do evento como chave, para manter os endereços mais recentes em ordem.",
                                "isCorrect": false
                            },
                            {
                                "text": "cleanup.policy=delete, com retention.bytes baixo, para forçar o tópico a manter só os endereços mais recentes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um tópico com cleanup.policy=compact, o que a compactação mantém para cada chave?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Apenas o primeiro valor gravado para aquela chave, descartando todas as atualizações posteriores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o valor mais recente gravado para aquela chave, descartando as versões anteriores.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os valores gravados para aquela chave, sem nenhum descarte, igual à retenção por tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum valor: a compactação remove a chave inteira depois de um certo número de versões.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um produtor precisa remover definitivamente a chave cliente_42 de um tópico compactado, porque o cliente pediu exclusão dos dados. O time grava um tombstone (valor nulo) para essa chave. O que garante que consumidores lentos ainda consigam ver essa exclusão antes dela sumir de vez?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O tombstone fica marcado como imutável no log e nunca é removido, mesmo depois da compactação rodar novamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Schema Registry mantém uma cópia do tombstone separada do tópico, disponível sob demanda para consumidores atrasados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tombstone só é removido após delete.retention.ms, dando tempo para consumidores atrasados ainda lerem a exclusão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O consumer group bloqueia a compactação daquela partição até que todos os membros confirmem a leitura do tombstone.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico usado como changelog de estado de sessão (uma chave por usuário, valor = estado atual) está configurado com cleanup.policy=delete e retention.ms=24 horas. Usuários com sessão inativa por mais de um dia começam a sumir da tabela reconstruída a partir do tópico, mesmo sem ter sido explicitamente removidos. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O consumer group está com poucos consumidores para o volume de sessões, causando perda de registros no rebalanceamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave de particionamento está mal escolhida, criando uma partição quente que perde registros sob carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Schema Registry está rejeitando as atualizações de estado por incompatibilidade de schema após 24 horas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A política deveria ser cleanup.policy=compact, porque delete apaga o registro só pela idade da mensagem.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico de changelog precisa manter só o último valor por chave, mas o time também quer garantir que chaves não atualizadas há muito tempo eventualmente saiam do tópico, mesmo sem um tombstone explícito. Isso é possível no Kafka?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, configurando cleanup.policy=compact,delete no tópico, combinando as duas políticas de limpeza ao mesmo tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, um tópico só pode ter uma política de limpeza ativa por vez, compact ou delete, nunca as duas juntas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só gravando um tombstone manual para cada chave depois de um tempo, não existe combinação automática de políticas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, a única forma de expirar chaves antigas num tópico compactado é recriar o tópico do zero periodicamente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Garantias de entrega",
        "aulas": [
            {
                "titulo": "At-most-once, at-least-once e exactly-once",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# At-most-once, at-least-once e exactly-once\n\nVocê já viu, no módulo 3, um consumidor Kafka processando uma mensagem e só depois comitando o offset, sabendo que uma falha bem cronometrada pode levar à reentrega da mesma mensagem. Esta aula dá nome a esse comportamento, e às suas alternativas: existem exatamente três garantias de entrega possíveis, e todo sistema de streaming escolhe uma delas, mesmo quando ninguém decidiu conscientemente.\n\nChamam-se **at-most-once**, **at-least-once** e **exactly-once**. Elas não são detalhe de configuração isolado, são a base de qualquer decisão de design em streaming, do Kafka ao Spark Structured Streaming."
                    },
                    {
                        "type": "text",
                        "value": "## As três semânticas\n\n- **At-most-once** (no máximo uma vez): cada mensagem é entregue zero ou uma vez. Nunca duplica, mas pode se perder para sempre.\n- **At-least-once** (pelo menos uma vez): cada mensagem é entregue uma ou mais vezes. Nunca se perde, mas pode chegar duplicada.\n- **Exactly-once** (exatamente uma vez): o efeito de cada mensagem é aplicado uma única vez, sem perda e sem duplicidade. É a mais difícil de sustentar, e exige mecanismos extras (assunto das próximas aulas deste módulo).\n\nNenhuma das três é \"melhor\" isoladamente: cada uma troca um risco por outro, e a escolha certa depende do que está sendo processado."
                    },
                    {
                        "type": "code",
                        "value": "# At-most-once: commit do offset ANTES de processar\nconsumidor le a mensagem (offset 100)\nconsumidor faz commit do offset 100        <- offset avanca aqui\nconsumidor comeca a processar a mensagem\n   *** falha aqui ***                       <- mensagem NUNCA e reprocessada: perdida\n\n# At-least-once: commit do offset DEPOIS de processar\nconsumidor le a mensagem (offset 100)\nconsumidor processa a mensagem inteira\n   *** falha aqui ***                       <- offset ainda nao avancou\nconsumidor reinicia, le o offset 100 de novo\nconsumidor processa a MESMA mensagem outra vez   <- duplicata"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Semântica\",\"O que pode acontecer\",\"Onde o risco mora\"],[\"At-most-once\",\"Mensagem pode se perder e nunca ser reprocessada\",\"Commit do offset acontece antes do processamento terminar\"],[\"At-least-once\",\"Mensagem pode chegar duplicada, mas nunca se perde\",\"Processamento termina antes do commit, retry reprocessa\"],[\"Exactly-once\",\"Nenhuma perda e nenhuma duplicidade no efeito final\",\"Exige produtor idempotente, transação e consumidor coordenado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Qual é a mais comum na prática\n\nNa maioria dos pipelines reais, incluindo o comportamento padrão de um consumidor Kafka, a escolha é **at-least-once**. O motivo é simples: entre perder um dado silenciosamente e processá-lo duas vezes, duplicar é o erro mais barato de corrigir depois. Perder costuma ser irreversível.\n\nIsso empurra a responsabilidade para a camada seguinte: se o transporte garante at-least-once, quem consome precisa saber lidar com duplicata. Essa é exatamente a ligação com a próxima aula, sobre idempotência no consumidor."
                    },
                    {
                        "type": "quote",
                        "value": "Nenhuma garantia de entrega é gratuita: at-most-once troca confiabilidade por simplicidade, at-least-once troca duplicidade por segurança contra perda, e exactly-once troca simplicidade por coordenação extra em cada etapa."
                    },
                    {
                        "type": "text",
                        "value": "## Um cenário para cada semântica\n\n- **At-most-once** cabe bem numa métrica que se autocorrige a cada leitura, como uma temperatura reportada a cada poucos segundos: perder uma leitura isolada não muda o quadro geral.\n- **At-least-once** é a escolha padrão para pedidos, cliques e eventos de negócio: perder um pedido é inaceitável, e a duplicata pode ser tratada com idempotência no consumidor.\n- **Exactly-once** se justifica quando duplicar o efeito custa caro de verdade, como lançar duas vezes o mesmo débito numa conta ou contar duas vezes a mesma venda num fechamento financeiro."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um consumidor Kafka faz commit do offset de uma mensagem antes de processá-la, e falha logo em seguida, antes de terminar o processamento. Qual garantia de entrega esse comportamento produz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "At-most-once, porque o offset avança antes de garantir que o processamento terminou.",
                                "isCorrect": true
                            },
                            {
                                "text": "At-least-once, porque o consumidor volta a ler a mesma mensagem depois da falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exactly-once, porque o commit garante que a mensagem não será processada de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "At-least-once, porque o Kafka reenvia automaticamente qualquer mensagem não confirmada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de contagem de visualizações usa um consumidor que processa a mensagem e só depois comita o offset. Depois de um pico de tráfego, o processo foi reiniciado algumas vezes por falta de memória, e a contagem final ficou um pouco acima do número real. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O consumidor está em at-most-once, e o Kafka perdeu offsets durante os reinícios sucessivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumidor está em at-least-once, e mensagens já processadas foram reprocessadas nos reinícios.",
                                "isCorrect": true
                            },
                            {
                                "text": "O consumidor está em exactly-once, e um bug no código de contagem soma cada evento duas vezes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumidor está em at-least-once, mas o problema é do Kafka, sem relação com os reinícios.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um painel mostra a temperatura média de um sensor industrial, atualizada a cada 5 segundos a partir de um stream. Perder uma leitura isolada não muda a tendência exibida, mas duplicar uma leitura infla a média por um instante. Qual garantia de entrega é a mais adequada, considerando o custo de cada erro nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "At-least-once, porque perder qualquer leitura do sensor é sempre pior do que duplicar um valor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exactly-once, porque um painel de monitoramento sempre exige a garantia mais forte disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "At-most-once, porque perder uma leitura isolada é inofensivo e evitar duplicata importa mais aqui.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma garantia específica, já que painéis de monitoramento não sofrem com perda ou duplicata.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço debita o cartão do cliente sempre que recebe um evento de assinatura renovada. Processar o mesmo evento duas vezes cobra o cliente em dobro, e perder o evento significa deixar de cobrar uma renovação legítima. O que esse cenário exige da garantia de entrega escolhida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Exige apenas at-most-once, já que cobrar em dobro é mais grave do que deixar de cobrar uma vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exige apenas at-least-once, já que perder a cobrança é sempre pior do que duplicá-la depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exige um broker mais rápido, para reduzir a janela de tempo em que a falha pode ocorrer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exige exactly-once no efeito final: sem perda do evento e sem aplicar o débito duas vezes.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor afirma: 'meu consumidor processa e só depois comita o offset, então a garantia é at-least-once, o que significa que toda mensagem sempre vai chegar duplicada'. O que está errado nessa afirmação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada está errado, at-least-once de fato garante que toda mensagem chega duplicada ao menos uma vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "At-least-once significa que duplicata é possível se há falha entre processar e comitar, não garantida.",
                                "isCorrect": true
                            },
                            {
                                "text": "O erro é a ordem: comitar antes de processar é que caracteriza at-least-once, não o contrário.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro é achar que existe duplicata no Kafka, já que o protocolo elimina duplicatas no broker.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Duplicatas e idempotência",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Duplicatas e idempotência\n\nA aula anterior deixou um combinado: a garantia mais comum em streaming é at-least-once, e o preço dela é duplicata. Isso não é um bug do Kafka nem do consumidor, é a consequência direta de nunca arriscar perder uma mensagem. A pergunta que sobra é prática: o que fazer quando a mesma mensagem chega duas vezes?\n\nA resposta de novo tem nome: **idempotência**. Um consumidor idempotente processa a mesma mensagem uma, duas ou dez vezes e deixa o destino exatamente no mesmo estado que uma única execução deixaria."
                    },
                    {
                        "type": "text",
                        "value": "## De onde vêm as duplicatas, na prática\n\nAlém da janela clássica entre processar e comitar, duplicata aparece por outros motivos comuns:\n\n- Um rebalanceamento acontece logo depois de processar uma mensagem, mas antes de comitar. A partição é reatribuída a outro consumidor do grupo, que reprocessa a partir do último offset comitado.\n- Um produtor reenvia a mesma mensagem por causa de um timeout de rede, mesmo que a escrita original já tenha sido bem-sucedida no broker (assunto da próxima aula, sobre produtor idempotente).\n- Alguém reprocessa manualmente um intervalo do tópico, por exemplo para corrigir um bug já resolvido, e replays eventos que já tinham sido processados antes."
                    },
                    {
                        "type": "code",
                        "value": "# Consumidor NAO idempotente: acumula um delta a cada mensagem\ndef processar(evento):\n    saldo_cliente[evento.cliente_id] += evento.valor\n    # reprocessar o mesmo evento soma o valor de novo: saldo fica errado\n\n# Consumidor idempotente: upsert por chave de negocio\ndef processar(evento):\n    # grava o estado final da chave, nao acumula um delta\n    db.execute(\n        'INSERT INTO saldo (cliente_id, saldo) VALUES (%s, %s) '\n        'ON CONFLICT (cliente_id) DO UPDATE SET saldo = EXCLUDED.saldo',\n        [evento.cliente_id, evento.saldo_apos_evento]\n    )\n    # reprocessar o mesmo evento grava o mesmo saldo final: sem efeito colateral"
                    },
                    {
                        "type": "text",
                        "value": "## Duas técnicas para deduplicar\n\n- **Upsert por chave de negócio**: em vez de acumular um delta a cada evento, o consumidor grava o estado final daquela chave. Reprocessar o mesmo evento sobrescreve com o mesmo valor, sem duplicar efeito. Funciona quando o evento carrega o estado resultante, não só a variação.\n- **Deduplicar por id de evento**: quando o evento só carrega um delta (\"debitar R$ 50\") e não dá para simplesmente sobrescrever, o consumidor guarda os ids de evento já processados e ignora qualquer id repetido antes de aplicar o efeito de novo.\n\nAs duas técnicas já são familiares de outra trilha: são as mesmas ideias de upsert e deduplicação usadas na carga de um pipeline de ETL, agora aplicadas dentro de um consumidor que nunca para de rodar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\",\"Quando usar\",\"Exige\"],[\"Upsert por chave\",\"O evento carrega o estado final, não só a variação\",\"Uma chave de negócio estável, como cliente_id\"],[\"Deduplicar por id de evento\",\"O evento carrega um delta que não pode ser sobrescrito\",\"Um id único por evento e um registro do que já foi visto\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A ligação com o lakehouse\n\nO mesmo problema aparece na escrita de um stream numa tabela do lakehouse: um `MERGE INTO` por chave (Delta Lake, Iceberg) é o equivalente do upsert em streaming, e a deduplicação nativa do Spark Structured Streaming (`dropDuplicates`, aprofundada no módulo 6) implementa a segunda técnica direto na engine de processamento. A garantia de entrega do Kafka cuida do transporte; a idempotência na escrita é sempre responsabilidade de quem consome."
                    },
                    {
                        "type": "quote",
                        "value": "Idempotência não elimina a duplicata, ela elimina o efeito da duplicata. A mensagem pode chegar duas vezes; o estado final do destino não pode."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que um consumidor de streaming é idempotente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele nunca recebe uma mensagem duplicada, porque o broker filtra repetições antes da entrega.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele processa mais rápido a cada mensagem nova, porque reaproveita o estado da anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Processar a mesma mensagem mais de uma vez deixa o destino no mesmo estado de uma única vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele rejeita qualquer mensagem que não tenha um id de evento explícito no cabeçalho.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor mantém saldo_cliente[id] += evento.valor para calcular saldo a partir de eventos de crédito. Depois de um rebalanceamento, um evento já processado foi entregue de novo ao consumidor. Qual é a consequência mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O saldo fica maior do que deveria, porque o mesmo valor é somado uma segunda vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "O saldo fica menor do que deveria, porque o rebalanceamento desfaz a última soma aplicada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O saldo permanece correto, porque o consumer group evita reprocessar eventos automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumidor trava, porque um offset já lido antes não pode ser lido de novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um evento representa 'debitar R$ 30 da carteira do usuário', carregando apenas o valor do débito, não o saldo final. Duplicar o processamento não pode ser resolvido só com upsert, porque upsert sobrescreveria o mesmo delta em vez de aplicá-lo uma única vez. Qual técnica resolve esse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o número de partições do tópico, para reduzir a chance de reentrega da mensagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o consumidor para at-most-once, o que elimina a duplicata já na origem do problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer upsert pelo id do usuário, sobrescrevendo o saldo a cada novo evento recebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o id de cada evento processado e ignorar qualquer id repetido antes do débito.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de controle guarda os ids de evento já processados para deduplicar, mas o time apaga os registros com mais de 24 horas para economizar espaço. Um produtor com problema de rede reenviou um evento com 3 dias de atraso. O que acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O evento é aplicado normalmente pela primeira vez, sem nenhum risco, já que 3 dias é incomum.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento é tratado como novo e processado de novo, porque seu id de controle já foi apagado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O evento é rejeitado automaticamente pelo Kafka, que reconhece o atraso como inválido.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento é deduplicado normalmente, porque a chave de negócio ainda está na mensagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe escreve o resultado de um stream direto numa tabela Delta usando MERGE INTO por pedido_id. O time se pergunta se ainda precisa se preocupar com duplicata vinda do Kafka. Qual é a resposta correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não precisa, porque o Delta Lake nunca recebe uma linha duplicada vinda de um stream.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não precisa, porque o MERGE INTO só funciona quando a origem já garante exactly-once.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não precisa se preocupar com o efeito, porque o MERGE por chave já é a técnica de upsert na escrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Precisa, porque o MERGE INTO no Delta Lake só sobrescreve colunas, nunca gera efeito idempotente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O produtor idempotente e as transações no Kafka",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O produtor idempotente e as transações no Kafka\n\nO módulo 3 já citou o produtor idempotente de passagem, ao lado de acks e batching. Esta aula abre o mecanismo por dentro: como o Kafka evita que um retry de rede grave a mesma mensagem duas vezes, e como as transações vão além disso, permitindo escrever em vários tópicos e partições como uma única unidade atômica."
                    },
                    {
                        "type": "text",
                        "value": "## O problema que o produtor idempotente resolve\n\nSem idempotência, um retry de produtor é uma fonte silenciosa de duplicata:\n\n1. O produtor envia a mensagem para o broker.\n2. O broker grava a mensagem com sucesso e tenta responder com o ack.\n3. O ack se perde na rede antes de chegar ao produtor, ou demora além do timeout configurado.\n4. O produtor, sem receber confirmação, assume falha e reenvia a mesma mensagem.\n5. O broker grava a mensagem de novo: agora existem duas cópias no tópico.\n\nO dado nunca se perdeu, mas duplicou por causa de uma falha de comunicação sobre um sucesso que já tinha acontecido."
                    },
                    {
                        "type": "code",
                        "value": "# Produtor idempotente (enable.idempotence=true)\n# o broker atribui um Producer ID (PID) unico a sessao do produtor\n\nprodutor envia: PID=77, particao=2, sequencia=501, msg='pedido-123'\nbroker grava e responde ack\n   *** ack se perde na rede ***\nprodutor reenvia (retry): PID=77, particao=2, sequencia=501, msg='pedido-123'\nbroker reconhece a sequencia 501 do PID 77 como JA GRAVADA\nbroker descarta o reenvio, responde ack sem duplicar a mensagem\n   -> apenas UMA copia fica gravada na particao"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Produtor\",\"Retry por timeout de ack\",\"Requisito\"],[\"Produtor comum\",\"Pode duplicar a mensagem no broker\",\"Nenhum requisito extra\"],[\"Produtor idempotente\",\"Broker descarta o reenvio pela sequência já vista\",\"enable.idempotence=true, acks=all\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Transações: atomicidade entre partições e tópicos\n\nO produtor idempotente resolve duplicata dentro de uma única partição. Ele não resolve um problema diferente: um serviço que lê de um tópico, processa, e escreve o resultado em outro tópico (padrão consume-transform-produce) precisa que a leitura do offset de entrada e a escrita de saída aconteçam como uma coisa só, tudo ou nada.\n\nÉ para isso que existem as **transações** do Kafka. Um produtor transacional agrupa várias escritas, possivelmente em partições e tópicos diferentes, junto com o commit dos offsets de entrada, numa única transação: ou tudo fica visível, ou nada fica."
                    },
                    {
                        "type": "code",
                        "value": "produtor.initTransactions()\n\nprodutor.beginTransaction()\ntry {\n    resultado = transformar(mensagemLida)\n    produtor.send(new ProducerRecord('topico-saida', resultado))\n    produtor.sendOffsetsToTransaction(offsetsConsumidos, grupoConsumidor)\n    produtor.commitTransaction()\n} catch (erro) {\n    produtor.abortTransaction()\n    // nada do que foi enviado nesta transacao fica visivel\n    // para quem le com isolation.level=read_committed\n}"
                    },
                    {
                        "type": "text",
                        "value": "## O consumidor precisa optar por ver só o que foi commitado\n\nTransação só protege quem lê com `isolation.level=read_committed`. O padrão do Kafka é `read_uncommitted`, que enxerga inclusive mensagens de transações ainda abertas ou já abortadas. Sem configurar o isolamento certo do lado de quem consome, a atomicidade do produtor transacional não tem efeito prático nenhum."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o produtor idempotente do Kafka evita, especificamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que um consumidor processe a mesma mensagem duas vezes depois de um rebalanceamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que um retry do produtor, causado pela perda do ack, grave a mesma mensagem duas vezes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que uma mensagem seja perdida quando o líder da partição fica indisponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que duas partições diferentes recebam mensagens com a mesma chave de particionamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um produtor com enable.idempotence=true envia uma mensagem, o broker grava com sucesso, mas o ack se perde na rede. O produtor reenvia por timeout. O que o broker faz ao receber esse reenvio?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Grava a mensagem novamente, já que não tem como saber que o primeiro envio teve sucesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rejeita o reenvio inteiro e devolve um erro fatal, encerrando a sessão do produtor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Grava a mensagem numa partição diferente, para preservar as duas tentativas separadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhece o número de sequência já visto para aquele produtor e descarta o reenvio.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um serviço lê pedidos de um tópico, calcula o frete, e escreve o resultado em outro tópico. O time quer garantir que, se o processo cair no meio, ou o offset de entrada avança e o resultado é escrito, ou nenhum dos dois acontece. Que mecanismo do Kafka atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Transações, agrupando a escrita de saída e o commit do offset de entrada numa única unidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Produtor idempotente, que já garante atomicidade entre ler de um tópico e escrever em outro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar acks=all, garantindo que a escrita e o commit do offset fiquem sincronizados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um único consumer group compartilhado entre os dois tópicos envolvidos na operação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um produtor transacional escreve um lote de mensagens e a transação é abortada por causa de uma exceção na aplicação. Um consumidor lendo o mesmo tópico com isolation.level=read_uncommitted está rodando ao mesmo tempo. O que esse consumidor enxerga?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada, mensagens de uma transação abortada são removidas do tópico antes de qualquer leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas as mensagens que seriam válidas, porque read_uncommitted ignora transações por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "As mensagens da transação abortada também, porque read_uncommitted não distingue commitado de abortado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de leitura, porque read_uncommitted é incompatível com tópicos que recebem escrita transacional.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação ativa enable.idempotence=true no produtor, mas não usa transações. Ela lê de um tópico A, processa, e escreve em um tópico B, sem nenhum cuidado adicional no commit do offset. Contra o que essa aplicação está protegida, e contra o que ainda não está?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Protegida contra duplicata por retry na escrita em B, mas não contra inconsistência entre A e B.",
                                "isCorrect": true
                            },
                            {
                                "text": "Protegida contra as duas coisas, já que idempotência cobre tanto o retry quanto a consistência entre tópicos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não está protegida contra nenhuma das duas, já que toda idempotência exige transação para funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Protegida contra a inconsistência entre A e B, mas não contra duplicata por retry na escrita.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Exactly-once fim a fim",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Exactly-once fim a fim\n\nAs duas aulas anteriores mostraram duas peças que o Kafka oferece: o produtor idempotente, que evita duplicata de escrita por retry, e as transações, que tornam atômica a escrita em vários tópicos e partições. Nenhuma das duas, sozinha, é \"exactly-once\". Esta aula fecha o quadro: o que realmente é preciso para exactly-once fim a fim, e por que essa expressão é mais sutil do que parece."
                    },
                    {
                        "type": "text",
                        "value": "## As três peças, juntas\n\nExactly-once de ponta a ponta, da entrada até o destino final, exige as três coisas ao mesmo tempo:\n\n1. **Produtor idempotente**, para que retries de rede não dupliquem a escrita em nenhum tópico intermediário.\n2. **Transações**, para que a escrita de saída e o commit do offset de entrada sejam atômicos, sem um acontecer sem o outro.\n3. **Consumidor final com leitura transacional (read_committed) ou sink idempotente**, para que o destino de fato só enxergue, ou só aplique, cada efeito uma vez.\n\nFaltar qualquer uma das três reabre uma janela de duplicata ou de perda em algum ponto do caminho."
                    },
                    {
                        "type": "code",
                        "value": "topico A -> [consumidor le] -> [processa] -> [produtor transacional escreve] -> topico B\n                  |                                    |\n        offset de A comitado          escrita em B + commit do offset\n        DENTRO da mesma transacao (sendOffsetsToTransaction)\n\ntopico B -> [consumidor final, isolation.level=read_committed] -> sink\n\n  sink transacional (outro topico Kafka, outra transacao)\n        OU\n  sink idempotente (upsert por chave: reescrever o mesmo efeito nao duplica)"
                    },
                    {
                        "type": "text",
                        "value": "## Kafka-para-Kafka é o caso fácil\n\nQuando origem e destino são dois tópicos Kafka, produtor idempotente mais transação mais leitura com read_committed entregam exactly-once de verdade, ponta a ponta. O Kafka controla as duas pontas.\n\nO caso difícil é quando o destino final é um sistema fora do Kafka: um banco relacional, uma tabela do lakehouse, uma API de terceiro. Aí a transação do Kafka não alcança mais nada, porque ela não conversa com o sistema de fora. Nesse caso, exactly-once só existe se o sink for **idempotente** (aula 2), não porque o Kafka garante, mas porque reaplicar o mesmo efeito não muda o resultado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Destino final\",\"O que garante exactly-once\"],[\"Outro tópico Kafka\",\"Produtor idempotente, mais transação, mais consumidor com read_committed\"],[\"Banco relacional ou lakehouse\",\"Transação do Kafka até a saída, mais um sink idempotente (upsert/merge) no destino\"],[\"API externa sem idempotência própria\",\"Não existe exactly-once garantido, só mitigação com deduplicação por id de evento\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que exactly-once é um termo sutil\n\nNa prática, exactly-once quase sempre significa **exactly-once no efeito observável**, não que a mensagem fisicamente passou pelo pipeline uma única vez sem exceção. Um micro-batch do Spark Structured Streaming pode ser reprocessado depois de uma falha (módulo 6), e o resultado final ainda ser exactly-once, porque o sink é idempotente e reescrever o mesmo micro-batch produz o mesmo estado. O nome mais preciso, usado por parte da comunidade, é **effectively-once**: o efeito é único, mesmo que o processamento por trás não seja.\n\nVale lembrar que exactly-once tem custo: mais coordenação, mais latência, produtores e consumidores mais restritos. Muitos pipelines, como métricas agregadas ou painéis operacionais, toleram bem uma duplicata ocasional, e forçar exactly-once nesses casos é complexidade sem benefício real."
                    },
                    {
                        "type": "quote",
                        "value": "Exactly-once não é uma promessa de que nada nunca vai ser reprocessado. É uma promessa de que o efeito final, no destino, é como se tivesse sido processado uma única vez."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais três elementos, juntos, sustentam exactly-once fim a fim num pipeline Kafka-para-Kafka?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Alta replicação de partição, retenção longa de log e compactação de tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um consumer group grande, muitas partições e um broker dedicado por tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas transações, já que elas sozinhas cobrem produtor e consumidor ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Produtor idempotente, transações, e um consumidor final lendo com read_committed.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline lê de um tópico Kafka, processa e grava o resultado direto numa tabela de um banco relacional externo, sem usar transação nenhuma do Kafka nessa escrita. O que esse pipeline precisa para alcançar exactly-once no efeito final?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada além de aumentar o acks do produtor para all, garantindo durabilidade suficiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "É impossível nesse cenário, porque exactly-once só existe entre dois tópicos Kafka diretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a escrita no banco seja idempotente, pois a transação do Kafka não cobre sistemas externos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas ativar o produtor idempotente também no lado da leitura do tópico de entrada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de uma falha, um micro-batch do Spark Structured Streaming é reprocessado do zero. Ao final, a tabela de destino tem exatamente os mesmos valores que teria se o micro-batch tivesse rodado com sucesso uma única vez. Esse pipeline é considerado exactly-once?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, porque exactly-once exige que nenhum dado seja fisicamente reprocessado em hipótese alguma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o que importa é o efeito final no destino, não se algum processamento foi repetido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque reprocessar um micro-batch inteiro já é, por definição, apenas at-least-once.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só porque o Spark Structured Streaming nunca reprocessa um micro-batch já iniciado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline financeiro adota exactly-once completo: produtor idempotente, transações Kafka de ponta a ponta, e um sink idempotente no banco de destino. A latência de escrita sobe e o throughput cai, mesmo com o mesmo volume de dados de antes. Qual explicação é mais consistente com as trocas de exactly-once?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A coordenação extra de transações e commits atômicos tem custo real, é a troca que exactly-once exige.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma explicação técnica, o time provavelmente introduziu um bug sem relação com as garantias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exactly-once corretamente configurado reduz o número de partições disponíveis para leitura.",
                                "isCorrect": false
                            },
                            {
                                "text": "A queda é esperada só na primeira execução, enquanto o produtor idempotente gera seu Producer ID.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um painel interno mostra a contagem aproximada de cliques por hora, atualizada em streaming. Uma duplicata ocasional altera o número em uma unidade, num total que passa de milhares. O time cogita implementar exactly-once completo para esse painel. É uma boa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, porque qualquer pipeline em produção deveria buscar exactly-once sempre que possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque sem exactly-once o painel corre risco real de ficar com números incorretos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque exactly-once é tecnicamente impossível fora de um pipeline Kafka-para-Kafka.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, o custo extra de coordenação não se justifica para um erro de uma unidade.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dead-letter e mensagens problemáticas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dead-letter e mensagens problemáticas\n\nNem toda falha de processamento é igual. Um timeout de rede ao chamar uma API externa costuma se resolver sozinho numa nova tentativa. Já uma mensagem com um campo obrigatório nulo, um JSON malformado, ou um valor que viola uma regra de negócio, vai falhar de novo, e de novo, e de novo, não importa quantas vezes o consumidor tentar. Esse segundo tipo tem um apelido conhecido: **poison message** (mensagem venenosa)."
                    },
                    {
                        "type": "text",
                        "value": "## O risco específico do Kafka: a partição inteira trava\n\nNuma fila tradicional, uma mensagem problemática costuma poder ser descartada ou reencaminhada sozinha, sem afetar as vizinhas. No Kafka isso é mais delicado, porque uma partição é um log ordenado, consumido em sequência: se o consumidor insiste em reprocessar a mesma mensagem sem nunca avançar o offset, nenhuma mensagem depois dela naquela partição é processada, mesmo que sejam mensagens boas, sem nenhum problema.\n\nUma única poison message, sem tratamento, é suficiente para parar o consumo de uma partição inteira até alguém intervir manualmente."
                    },
                    {
                        "type": "code",
                        "value": "# Sem dead-letter: a particao trava na mensagem 104\nparticao: [101:ok] [102:ok] [103:ok] [104:falha] [105:...] [106:...]\nconsumidor:                            ^\n                       tenta 104 sem parar, nunca avanca o offset\n                       105 e 106 nunca sao processadas\n\n# Com dead-letter: a particao segue andando\nparticao: [101:ok] [102:ok] [103:ok] [104:falha] [105:ok] [106:ok]\nconsumidor:                            |\n                                        v\n                              topico-dead-letter (104 + motivo do erro)\n                       offset avanca, 105 e 106 sao processadas normalmente"
                    },
                    {
                        "type": "text",
                        "value": "## Retriável x não retriável\n\nAntes de mandar algo para a dead-letter, vale distinguir dois tipos de erro:\n\n- **Retriável**: falhas transitórias, como um timeout de rede ou uma dependência externa momentaneamente fora do ar. Tentar de novo, com um intervalo entre tentativas, costuma resolver.\n- **Não retriável**: um erro de desserialização, uma violação de schema, ou uma regra de negócio claramente quebrada. Tentar de novo sempre dá o mesmo erro: retry aqui só atrasa o inevitável e mantém a partição travada por mais tempo.\n\nMensagens não retriáveis, e mensagens retriáveis que já esgotaram um número razoável de tentativas, são candidatas diretas à dead-letter."
                    },
                    {
                        "type": "code",
                        "value": "def consumir(mensagem):\n    try:\n        processar(mensagem)\n        commit_offset(mensagem)\n    except ErroNaoRetriavel as erro:\n        # nao adianta tentar de novo: desvia e segue andando\n        produzir('pedidos-dead-letter', {\n            'mensagem_original': mensagem,\n            'erro': str(erro),\n            'topico_origem': mensagem.topico,\n            'offset_original': mensagem.offset,\n        })\n        commit_offset(mensagem)\n    except ErroRetriavel as erro:\n        # deixa o mecanismo de retry, com backoff, tentar de novo\n        raise erro"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\",\"O que acontece com a partição\",\"Quando usar\"],[\"Reprocessar sem limite\",\"Trava até alguém intervir manualmente\",\"Nunca, sozinha\"],[\"Descartar em silêncio\",\"Segue andando, mas perde o dado e a visibilidade do erro\",\"Quase nunca, esconde o problema\"],[\"Dead-letter (tópico ou tabela)\",\"Segue andando, e o dado problemático fica preservado\",\"Padrão recomendado para erros não retriáveis\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma poison message que trava a partição não é um problema de uma mensagem só, é um problema de todas as mensagens boas que ficam presas atrás dela na fila."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é uma poison message, num pipeline de streaming?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma mensagem que sempre falha no processamento, não importa quantas vezes seja reprocessada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Qualquer mensagem que chega duplicada ao consumidor por causa da garantia at-least-once.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma mensagem grande demais para caber no tamanho máximo configurado no tópico Kafka.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma mensagem enviada por um produtor sem enable.idempotence configurado corretamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor encontra uma mensagem com um campo obrigatório nulo e entra em loop: tenta processar, falha, e como não avança o offset, tenta a mesma mensagem de novo, indefinidamente. Qual é a consequência para as mensagens seguintes na mesma partição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhuma, o Kafka processa as mensagens seguintes em paralelo, independente da mensagem atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficam presas atrás da mensagem problemática, porque o consumidor não avança o offset da partição.",
                                "isCorrect": true
                            },
                            {
                                "text": "São redirecionadas automaticamente para outro consumidor do grupo até o problema ser resolvido.",
                                "isCorrect": false
                            },
                            {
                                "text": "São perdidas, porque o Kafka descarta mensagens de uma partição travada há muito tempo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor recebe uma mensagem cujo payload não corresponde ao schema Avro esperado, um erro de desserialização. O time configura 3 tentativas de retry antes de desistir. O que está errado nessa decisão, considerando a natureza desse erro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada, 3 tentativas é um número padrão razoável para qualquer tipo de falha de processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número deveria ser maior, erros de desserialização costumam se resolver após algumas tentativas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro deveria ser ignorado em silêncio, sem nenhuma tentativa nem envio à dead-letter.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de desserialização é não retriável: as 3 tentativas sempre falham igual, só atrasam a dead-letter.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide que, ao encontrar uma mensagem problemática, o consumidor deve simplesmente descartá-la e avançar o offset, sem registrar nada em lugar nenhum. A partição para de travar. Que problema essa decisão introduz, comparada a usar uma dead-letter?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhum, descartar e avançar o offset é tecnicamente equivalente a mandar para uma dead-letter.",
                                "isCorrect": false
                            },
                            {
                                "text": "A partição volta a travar do mesmo jeito, porque descartar sem registrar não libera o offset.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado problemático se perde de vez, sem nenhum registro do que falhou ou por quê.",
                                "isCorrect": true
                            },
                            {
                                "text": "O throughput do consumidor cai, porque descartar uma mensagem custa mais do que reprocessá-la.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor com lógica de dead-letter manda para o tópico pedidos-dead-letter tanto os erros de desserialização quanto os timeouts de uma API externa instável, sem distinguir os dois casos, e sem nenhum retry antes de desviar. Qual é o problema dessa implementação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum, toda mensagem problemática deve ir direto para a dead-letter, sem exceção, por simplicidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erros transitórios, como o timeout da API, deveriam ter uma chance de retry antes de virarem definitivos.",
                                "isCorrect": true
                            },
                            {
                                "text": "A dead-letter só deveria existir para timeouts de API, nunca para erros de desserialização.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é técnico: o Kafka não permite escrever numa dead-letter sem esgotar os retries antes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Tempo, janelas e estado",
        "aulas": [
            {
                "titulo": "Event time x processing time",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Event time x processing time\n\nEm qualquer pipeline de streaming, cada registro carrega dois horários possíveis: o momento em que o fato aconteceu no mundo real e o momento em que o motor de processamento colocou as mãos nesse registro. Confundir os dois é uma das causas mais comuns de agregação errada em streaming."
                    },
                    {
                        "type": "text",
                        "value": "## Os dois relógios do evento\n\n- **Event time**: o instante em que o evento de fato ocorreu. Normalmente vem dentro do próprio payload, escrito por quem gerou o dado (um app, um sensor, um serviço).\n- **Processing time**: o instante em que o motor de streaming (Spark, Flink, Kafka Streams) lê e processa aquele registro. É o relógio da máquina que está rodando o job.\n\nOs dois quase nunca coincidem. Rede lenta, fila cheia, particionamento, reprocessamento: qualquer coisa no caminho entre a origem e o motor de streaming empurra o processing time para depois do event time."
                    },
                    {
                        "type": "code",
                        "value": "linha do tempo real (quando o evento aconteceu)\n\n  evento gerado às 08:00:00\n        |\n        v\n  08:00:00 ------------------------------------------->\n\ncaminho até o motor de streaming (fila, rede, buffer)\n        |________________ atraso _________________|\n                                                   v\n  08:00:00 .......................... 08:00:07 (motor lê o registro)\n\n  event time no payload   = 08:00:00  (fixo, não muda nunca)\n  processing time do job  = 08:00:07  (varia a cada execução)"
                    },
                    {
                        "type": "text",
                        "value": "## Por que a diferença importa para agregação\n\nSe uma janela agrega por processing time, o resultado depende da velocidade do pipeline naquele momento: um pico de tráfego, um restart do job ou uma lentidão na rede empurram eventos para a janela seguinte, mesmo que eles tenham acontecido dentro da janela anterior. Reprocessar o mesmo dado histórico em outro dia, com outra velocidade de leitura, pode gerar um número diferente.\n\nAgregar por event time resolve isso: cada evento cai na janela que corresponde ao momento em que ele realmente aconteceu, não ao momento em que o pipeline conseguiu processá-lo. O resultado fica reprodutível e correto em relação ao mundo real, ao custo de um problema novo: dados atrasados podem chegar depois que a janela já parecia fechada (o tema das próximas aulas)."
                    },
                    {
                        "type": "text",
                        "value": "## O exemplo do celular offline\n\nUm app de corrida registra passos e distância com o horário do próprio celular. O usuário entra no metrô às 08:00 e fica sem sinal por 40 minutos; o app continua gravando localmente. Quando o sinal volta, às 08:40, o celular envia de uma vez os eventos acumulados desde as 08:00.\n\nSe a agregação usar processing time, todos esses eventos caem na janela das 08:40, o horário em que o servidor finalmente os recebeu: a janela das 08:00 fica sem os passos que realmente aconteceram ali, e a das 08:40 recebe um pico artificial. Se a agregação usar o event time gravado no próprio evento, cada registro volta para a janela correta, mesmo chegando 40 minutos atrasado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Event time\",\"Processing time\"],[\"Quando é definido\",\"No momento em que o evento aconteceu, dentro do payload\",\"No momento em que o motor de streaming lê o registro\"],[\"Varia com atraso de rede ou fila\",\"Não, é fixo no evento\",\"Sim, muda a cada execução\"],[\"Resultado ao reprocessar o histórico\",\"O mesmo, sempre\",\"Pode mudar conforme a velocidade da leitura\"],[\"Exige um campo de timestamp no dado\",\"Sim\",\"Não, usa o relógio da máquina\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# lê cliques de um tópico Kafka; cada mensagem traz \"event_ts\" no payload\ndf = spark.readStream.format(\"kafka\") \\\n    .option(\"kafka.bootstrap.servers\", \"broker:9092\") \\\n    .option(\"subscribe\", \"cliques\") \\\n    .load()\n\neventos = (\n    df.selectExpr(\"CAST(value AS STRING) AS json\")\n      .select(from_json(\"json\", esquema_clique).alias(\"c\"))\n      .select(\"c.event_ts\", \"c.usuario_id\", \"c.pagina\")\n)\n\n# agrupar por event_ts reflete quando o clique aconteceu de verdade,\n# não o instante em que este job leu a mensagem do Kafka\ncontagem = eventos.groupBy(window(\"event_ts\", \"5 minutes\")).count()"
                    }
                ],
                "questions": [
                    {
                        "statement": "Em um pipeline de streaming, qual é a definição correta de event time?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O instante em que o evento realmente aconteceu, segundo o horário registrado no payload.",
                                "isCorrect": true
                            },
                            {
                                "text": "O instante em que o broker do Kafka grava a mensagem no log da partição, segundo o offset atribuído.",
                                "isCorrect": false
                            },
                            {
                                "text": "O instante em que o motor de streaming lê e processa o registro, segundo o relógio da máquina local.",
                                "isCorrect": false
                            },
                            {
                                "text": "O instante em que o consumidor confirma o commit do offset, segundo o relógio do servidor atual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time agrega o faturamento em janelas de 1 minuto usando o horário em que o Spark processa cada registro (processing time), não o horário da venda. Depois de um pico de tráfego que atrasou o consumo do tópico em 3 minutos, o total de uma hora específica mudou ao reprocessar o mesmo histórico no dia seguinte. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tópico Kafka perdeu mensagens durante o pico de tráfego, reduzindo bastante o total contabilizado na nova execução inteira do job.",
                                "isCorrect": false
                            },
                            {
                                "text": "A agregação por processing time depende da velocidade de leitura do pipeline, e a mesma venda cai em janelas diferentes a cada execução.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Spark Structured Streaming corrompeu o checkpoint durante o pico, obrigando a nova execução a recomeçar do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "A chave de particionamento das vendas mudou entre as duas execuções, alterando a ordem de leitura dos registros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rede de sensores IoT grava, dentro do payload, o horário exato de cada leitura de temperatura. A equipe quer um relatório diário que reflita fielmente quando cada leitura ocorreu, mesmo com sensores de conectividade instável. Qual escolha de tempo a equipe deve usar para agrupar as leituras?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Processing time, porque reflete o momento exato em que o cluster Spark recebeu e processou cada leitura enviada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Processing time, porque garante que a janela feche assim que o último lote inteiro for processado, sem esperar atrasados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Event time, porque agrupa cada leitura no momento em que ela realmente ocorreu no sensor, independente do atraso de rede.",
                                "isCorrect": true
                            },
                            {
                                "text": "Processing time, porque elimina por completo a necessidade de sincronizar o relógio dos sensores com o servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um aplicativo de corrida grava localmente os passos de um usuário que ficou 40 minutos sem sinal no metrô e envia tudo de uma vez quando a conexão volta. Se a agregação horária for feita por event time, o que acontece com os passos registrados durante o período sem sinal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São descartados pelo pipeline, porque chegaram fora de ordem em relação ao restante do fluxo.",
                                "isCorrect": false
                            },
                            {
                                "text": "São contados todos na janela do momento em que o celular reconectou e enviou os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "São somados a uma janela especial de atrasados que o Spark cria automaticamente para eventos fora de ordem.",
                                "isCorrect": false
                            },
                            {
                                "text": "São contados nas janelas correspondentes ao horário real de cada passo, mesmo chegando 40 minutos depois.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Sobre event time e processing time em streaming, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Usar event time para agregações torna o resultado reprodutível ao reprocessar o mesmo histórico, pois cada registro sempre cai na mesma janela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Usar processing time para agregações torna o resultado reprodutível ao reprocessar o mesmo histórico, pois o relógio da máquina é sempre o mesmo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Event time e processing time sempre coincidem quando o cluster Spark tem recursos suficientes para processar sem fila.",
                                "isCorrect": false
                            },
                            {
                                "text": "Processing time exige um campo de timestamp no payload, enquanto event time usa apenas o relógio do sistema.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Dados atrasados e fora de ordem",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dados atrasados e fora de ordem\n\nEm um sistema distribuído, esperar que os eventos cheguem na mesma ordem em que aconteceram é uma expectativa que a realidade não cumpre. Redes têm caminhos diferentes, produtores têm latências diferentes, partições são lidas em paralelo. Streaming de dados precisa ser projetado assumindo que atraso e desordem são a regra, não a exceção."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso acontece\n\n- **Múltiplos produtores**: dois clientes emitem eventos quase ao mesmo tempo, mas um deles está numa rede mais lenta e chega depois.\n- **Múltiplas partições**: o Kafka garante ordem dentro de uma partição, mas não entre partições diferentes de um mesmo tópico. Um consumidor lê várias partições em paralelo e pode processar um evento mais novo de uma partição antes de um evento mais antigo de outra.\n- **Reentrega e retry**: uma falha de rede faz o produtor reenviar um evento que já tinha sido gerado minutos antes.\n- **Dispositivos offline**: sensores, celulares e aplicações desktop guardam eventos localmente e os enviam em lote quando a conexão volta, fora de ordem em relação ao que chegou nesse meio tempo."
                    },
                    {
                        "type": "code",
                        "value": "ordem de geração (event time):      E1(08:01)   E2(08:02)   E3(08:03)\n                                          \\           |           /\n                                     caminhos de rede diferentes\n                                          /           |           \\\nordem de chegada (processing time):  E2(08:02)   E3(08:03)   E1(08:01)\n                                                                  ^\n                                                        chegou por último,\n                                                        mas aconteceu primeiro"
                    },
                    {
                        "type": "text",
                        "value": "## O problema para janelas por event time\n\nUma janela agrupa eventos pelo intervalo de event time em que eles caem, por exemplo `[08:00, 08:05)`. O motor de streaming só sabe que uma janela está completa quando para de receber eventos que pertencem a ela. Mas em um fluxo com atraso e desordem, como saber se realmente não vai chegar mais nenhum evento com event time dentro daquele intervalo, ou se é só uma questão de tempo?\n\nSe o motor fechar a janela cedo demais, perde eventos legítimos que ainda estão a caminho. Se esperar demais antes de fechar qualquer janela, a latência do resultado cresce e o estado guardado em memória aumenta, porque mais janelas ficam abertas ao mesmo tempo."
                    },
                    {
                        "type": "quote",
                        "value": "Em streaming distribuído, ordem de chegada e ordem de acontecimento são coisas diferentes; o pipeline precisa decidir o que fazer quando as duas discordam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Escopo\",\"Ordem garantida\",\"Motivo\"],[\"Dentro de uma partição\",\"Sim\",\"O log da partição é append-only e o consumidor lê sequencialmente\"],[\"Entre partições do mesmo tópico\",\"Não\",\"Cada partição é lida de forma independente e em paralelo\"],[\"Entre tópicos diferentes\",\"Não\",\"Não há relação de ordem entre logs de tópicos distintos\"],[\"Após uma reentrega do produtor\",\"Não garantida sem configuração extra\",\"Um retry pode inserir um evento antigo depois de eventos mais novos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que fazer com um evento que chega tarde\n\nAlgumas saídas práticas, que os motores de streaming combinam:\n\n- **Atualizar o resultado da janela**, se ela ainda estiver aberta: o motor refaz a agregação incluindo o evento atrasado.\n- **Definir até quando vale a pena esperar**, usando um limite explícito (o watermark, tema da próxima aula) para decidir quando uma janela deixa de aceitar atualizações.\n- **Enviar para um fluxo separado de atrasados** (uma tabela ou tópico próprio), para auditoria ou reprocessamento manual, quando o evento chega depois do limite aceito.\n- **Descartar**, quando o caso de uso tolera perder uma fração pequena de eventos muito atrasados em troca de fechar janelas mais rápido."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Kafka, a garantia de ordem das mensagens vale:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Entre todas as partições de um mesmo tópico, na ordem em que os produtores enviaram.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro de uma mesma partição, na ordem em que as mensagens foram gravadas no log.",
                                "isCorrect": true
                            },
                            {
                                "text": "Entre todos os tópicos de um mesmo cluster Kafka, respeitando o horário de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas quando existe um único consumer group lendo o tópico inteiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um consumidor lê duas partições de um tópico de pedidos em paralelo. Ele processa um pedido com event time 09:05:10 vindo da partição 0 antes de processar um pedido com event time 09:05:02 vindo da partição 1. Por que isso acontece, mesmo com o Kafka garantindo ordem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o produtor enviou os dois pedidos fora de ordem, e o broker gravou exatamente na ordem recebida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a partição 1 sofreu perda de mensagens durante o envio e precisou reenviar o pedido das 09:05:02.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a garantia de ordem do Kafka vale dentro de cada partição, e as partições são lidas de forma independente e em paralelo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o consumer group ainda não tinha terminado o rebalanceamento quando os dois pedidos finalmente chegaram ao consumidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma janela de vendas por minuto é fechada assim que o pipeline para de receber eventos novos por alguns segundos. Um evento de venda com event time dentro dessa janela, mas atrasado por um problema de rede, chega logo depois do fechamento. Qual é a consequência direta, se nada for feito para tratar esse atraso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Spark rejeita a conexão do produtor até que o atraso na rede seja corrigido manualmente pela equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "O evento é automaticamente movido para a próxima janela, sem nenhuma perda de informação no resultado final.",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumer group inteiro entra em rebalanceamento para reprocessar a janela que já tinha sido fechada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A venda fica de fora do total daquela janela, distorcendo o resultado que já foi considerado fechado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide que eventos de cliques atrasados em mais de 10 minutos não valem a pena reprocessar, mas não quer perdê-los para investigações futuras. Qual estratégia atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Enviar os eventos muito atrasados para um tópico ou tabela separada, em vez de tentar atualizar a janela já fechada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Configurar o consumer para nunca fazer commit de offset, forçando a releitura de toda a partição a cada execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de partições do tópico para que os eventos atrasados cheguem mais rápido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativar o log compaction no tópico para manter apenas a versão mais recente de cada clique.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre desordem e atraso em streaming, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o número de partições de um tópico elimina totalmente a chance de eventos chegarem fora de ordem ao consumidor final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mesmo sem falha de rede, ler várias partições em paralelo pode entregar eventos ao consumidor fora da ordem em que aconteceram.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um evento só é considerado atrasado quando o produtor demora mais de um minuto inteiro para enviá-lo até o broker.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar acks=all no produtor garante que os consumidores sempre recebam os eventos na mesma ordem em que ocorreram.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Watermark: até quando esperar o atrasado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Watermark: até quando esperar o atrasado\n\nA aula anterior deixou uma pergunta em aberto: se os eventos podem chegar atrasados, quando um motor de streaming pode dizer que uma janela está finalmente completa? O watermark é a resposta que o Spark, o Flink e outros motores usam para essa pergunta."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um watermark\n\nUm watermark é uma marca de tempo que o motor de streaming propaga junto com os dados, dizendo, na prática: já vi eventos com event time até aqui, não espero mais ver nada com event time anterior a este ponto.\n\nEle costuma ser calculado como o maior event time já visto no fluxo, menos uma margem de tolerância definida pela equipe (por exemplo, 10 minutos). Se o maior event time visto foi `08:20` e a tolerância é de `10 minutes`, o watermark fica em `08:10`: qualquer evento novo com event time anterior a `08:10` é tratado como atrasado demais."
                    },
                    {
                        "type": "code",
                        "value": "maior event time já visto:  08:20\ntolerância definida:        10 minutos\nwatermark atual:            08:20 - 10min = 08:10\n\neventos que ainda chegam:\n  event time 08:12  -> aceito (está depois do watermark)\n  event time 08:07  -> atrasado demais (está antes do watermark)\n\nlinha do tempo (event time) --------------------------------->\n     08:00        08:10 (watermark)        08:20 (mais recente visto)\n                    |\n             tudo antes daqui é considerado já visto por completo"
                    },
                    {
                        "type": "text",
                        "value": "## Como o watermark fecha as janelas\n\nUma janela `[08:00, 08:05)` só emite ou fecha seu resultado quando o watermark ultrapassa o fim da janela, `08:05`. Até esse momento, qualquer evento com event time dentro do intervalo ainda pode chegar e atualizar o resultado.\n\nDepois que o watermark passa de `08:05`, o motor considera a janela encerrada. Um evento que chega depois disso com event time `08:03`, por exemplo, é tratado como tardio demais: dependendo da configuração, ele é descartado ou desviado para tratamento à parte, mas não volta a alterar o resultado já emitido."
                    },
                    {
                        "type": "quote",
                        "value": "O watermark não promete que nenhum evento vai chegar atrasado; ele só define o ponto em que o pipeline para de esperar e assume o risco de não ver mais nada antes dali."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Configuração do watermark\",\"Efeito na latência\",\"Efeito na completude\"],[\"Tolerância curta (ex.: 1 minuto)\",\"Janelas fecham rápido, resultado sai cedo\",\"Mais eventos atrasados chegam depois do fechamento e são perdidos\"],[\"Tolerância longa (ex.: 30 minutos)\",\"Janelas demoram mais para fechar, resultado sai depois\",\"Menos eventos atrasados são perdidos, mais dados chegam a tempo\"],[\"Tolerância mal dimensionada para o domínio\",\"Latência alta sem necessidade, ou perda evitável\",\"Não resolve nem latência nem completude direito\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# watermark de 10 minutos sobre o campo de event time \"event_ts\":\n# o Spark só considera uma janela encerrada quando o event time mais\n# recente visto no fluxo avança 10 minutos além do fim da janela\ncontagem = (\n    eventos\n    .withWatermark(\"event_ts\", \"10 minutes\")\n    .groupBy(window(\"event_ts\", \"5 minutes\"))\n    .count()\n)\n\n# eventos com event_ts anterior ao watermark atual chegam tarde demais\n# e são descartados da agregação acima"
                    }
                ],
                "questions": [
                    {
                        "statement": "O watermark, em um pipeline de streaming, representa:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número máximo de mensagens que uma partição inteira do Kafka pode reter antes de começar a descartar de vez as mais antigas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O identificador único que o Schema Registry atribui a cada nova versão registrada de um schema Avro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma marca de tempo que sinaliza até onde o motor já considera ter visto os eventos, usada para decidir quando fechar uma janela.",
                                "isCorrect": true
                            },
                            {
                                "text": "O offset mais recente que um consumer group confirmou, fazendo commit, em uma partição específica do tópico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe configura watermark de 2 minutos sobre event time para agregar pedidos por minuto. Durante um pico de tráfego, alguns pedidos chegam com 5 minutos de atraso em relação ao maior event time já visto. O que acontece com esses pedidos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São automaticamente movidos para a próxima janela que ainda estiver aberta, sem qualquer alteração no resultado total já calculado antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazem o Spark pausar por completo o consumo do tópico até que o atraso na rede seja resolvido pela equipe.",
                                "isCorrect": false
                            },
                            {
                                "text": "São somados normalmente ao resultado, porque o watermark só afeta janelas com mais de 5 minutos de duração total.",
                                "isCorrect": false
                            },
                            {
                                "text": "Chegam depois que o watermark já passou do fim da janela correspondente e são tratados como tardios demais para atualizar o resultado.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um painel de fraude precisa de alertas com a menor latência possível e tolera perder uma fração pequena de transações muito atrasadas. Qual ajuste de watermark é mais coerente com esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma tolerância curta, fechando as janelas mais rápido mesmo correndo o risco de descartar mais eventos atrasados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma tolerância longa, priorizando nunca perder nenhuma transação, mesmo que o alerta demore bem mais para sair.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum watermark configurado, deixando todas as janelas abertas indefinidamente até o job ser reiniciado manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um watermark calculado a partir do processing time em vez do event time, para não depender do relógio de origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como o watermark de um fluxo costuma ser calculado pelo motor de streaming?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pela média entre o event time e o processing time de todos os eventos recebidos na última hora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo maior event time já observado no fluxo, subtraída uma margem de tolerância definida pela equipe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pelo horário do relógio do servidor no momento em que a janela é criada, sem depender dos eventos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pelo menor event time entre os eventos que ainda estão na fila de entrada do tópico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre watermark em streaming, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um watermark garante que nenhum evento chegará atrasado depois que uma janela for fechada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Diminuir a tolerância do watermark reduz a latência e também reduz a quantidade de eventos descartados por atraso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a tolerância do watermark reduz a perda de eventos atrasados, ao custo de aumentar a latência dos resultados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O watermark é um mecanismo exclusivo do Kafka e não existe em motores de processamento como Spark ou Flink.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Janelas: tumbling, sliding e session",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Janelas: tumbling, sliding e session\n\nAgregar um fluxo sem fim (contar, somar, calcular uma média) exige recortar esse fluxo em pedaços finitos. Esses pedaços são as janelas. Os três formatos mais comuns, tumbling, sliding e session, recortam o tempo de jeitos diferentes, e a escolha certa depende da pergunta que a agregação precisa responder."
                    },
                    {
                        "type": "text",
                        "value": "## Tumbling windows (fixas, sem sobreposição)\n\nJanelas tumbling têm duração fixa e não se sobrepõem: cada evento pertence a exatamente uma janela. Uma janela de 5 minutos produz os intervalos `[08:00, 08:05)`, `[08:05, 08:10)`, `[08:10, 08:15)`, e assim por diante, sem nenhum instante contado duas vezes. É o formato natural para perguntas como quantos pedidos por minuto ou faturamento por hora.\n\n## Sliding windows (deslizantes, com sobreposição)\n\nJanelas sliding também têm duração fixa, mas avançam em passos menores que a própria duração, então se sobrepõem e um evento pode pertencer a mais de uma janela ao mesmo tempo. Uma janela de 10 minutos que desliza a cada 5 minutos produz `[08:00, 08:10)`, `[08:05, 08:15)`, `[08:10, 08:20)`. Serve para métricas suavizadas, como média móvel dos últimos 10 minutos, atualizada a cada 5."
                    },
                    {
                        "type": "code",
                        "value": "tumbling (janela de 5 min, sem sobreposição):\n08:00        08:05        08:10        08:15\n  |-----W1-----|-----W2-----|-----W3-----|\n  cada evento cai em exatamente uma janela\n\nsliding (janela de 10 min, deslizando a cada 5 min):\n08:00        08:05        08:10        08:15        08:20\n  |------------W1------------|\n              |------------W2------------|\n                          |------------W3------------|\n  um evento às 08:07 cai dentro de W1 e de W2 ao mesmo tempo"
                    },
                    {
                        "type": "text",
                        "value": "## Session windows (por inatividade)\n\nJanelas session não têm duração fixa: elas agrupam eventos que estão próximos no tempo e se encerram quando passa um intervalo de inatividade (o gap) sem nenhum evento novo daquela chave. Cada usuário, dispositivo ou chave tem suas próprias janelas, com tamanhos diferentes.\n\nSão o formato natural para sessão de navegação no site ou sequência de cliques de um usuário: o que importa é agrupar a atividade contínua, não um relógio fixo de parede."
                    },
                    {
                        "type": "code",
                        "value": "eventos de um mesmo usuário ao longo do tempo (gap de inatividade = 5 min):\n\n09:00  09:02  09:03                 09:12  09:14              09:25\n  |------|------|                     |------|                  |\n  \\____________/                     \\______/                  |\n     sessão 1                         sessão 2                sessão 3\n  (fecha: 8 min sem evento)      (fecha: 11 min sem evento)  (ainda aberta)\n\n  gap > 5 min entre 09:03 e 09:12  -> fecha a sessão 1 e abre a sessão 2\n  gap > 5 min entre 09:14 e 09:25  -> fecha a sessão 2 e abre a sessão 3"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta que a agregação precisa responder é que define a janela certa: um relógio fixo pede tumbling ou sliding, um comportamento contínuo por chave pede session."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de janela\",\"Sobreposição\",\"Quando usar\"],[\"Tumbling\",\"Não, cada evento cai em uma única janela\",\"Métricas por intervalo fixo: pedidos por minuto, faturamento por hora\"],[\"Sliding\",\"Sim, um evento pode cair em várias janelas\",\"Métricas suavizadas: média móvel, detecção de tendência recente\"],[\"Session\",\"Não entre sessões, mas a duração varia por chave\",\"Atividade contínua por usuário: sessão de navegação, sequência de cliques\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual característica define uma janela do tipo tumbling?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Sua duração varia de acordo com o intervalo de inatividade entre eventos de uma mesma chave.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela avança em passos menores que sua própria duração, fazendo com que um evento caia em mais de uma janela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela só existe em pipelines que usam processing time, nunca event time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela tem duração fixa e não se sobrepõe, então cada evento pertence a exatamente uma janela.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um painel precisa mostrar a média móvel de temperatura dos últimos 10 minutos, atualizada a cada 1 minuto, para detectar tendências de aquecimento rápido. Qual tipo de janela atende melhor esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sliding, com duração de 10 minutos e passo de 1 minuto, para suavizar a média e atualizá-la com frequência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Tumbling, com duração de 10 minutos, para evitar que uma mesma leitura seja contada em mais de uma janela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Session, com um gap de 1 minuto de inatividade entre leituras do sensor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tumbling, com duração de 1 minuto, somando as dez últimas janelas fechadas para formar a média.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um site quer medir a duração de cada visita, agrupando os cliques de um mesmo usuário enquanto ele estiver ativo, e fechando a contagem quando o usuário ficar 15 minutos sem interagir. Qual tipo de janela é o mais adequado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Tumbling de 15 minutos, reiniciando do zero a contagem de cliques a cada intervalo fixo de tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Session, com gap de inatividade de 15 minutos, encerrando a janela quando esse tempo passa sem nenhum clique novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sliding de 15 minutos com passo de 1 minuto, somando os cliques de todas as janelas sobrepostas ainda ativas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tumbling de 1 minuto, concatenando as janelas seguidas até encontrar uma sem nenhum clique registrado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma janela sliding de 20 minutos com passo de 5 minutos, um único evento pode ser contado em quantas janelas ao mesmo tempo, no máximo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Em exatamente uma janela, porque esse comportamento de não sobreposição é exclusivo das janelas tumbling.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em todas as janelas que já foram abertas desde o início do stream inteiro, já que as janelas sliding nunca fecham janelas antigas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em até quatro janelas, pois 20 minutos de duração com passo de 5 minutos geram quatro janelas sobrepostas cobrindo o mesmo instante.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em nenhuma janela, porque o watermark ainda precisa confirmar o fechamento da primeira antes de contar o evento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre tumbling, sliding e session windows, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Janelas session têm duração fixa, definida previamente pela equipe, exatamente igual ao que acontece nas janelas tumbling.",
                                "isCorrect": false
                            },
                            {
                                "text": "Janelas sliding garantem que cada evento seja contado em exatamente uma única janela, assim como as tumbling.",
                                "isCorrect": false
                            },
                            {
                                "text": "Janelas tumbling passam a se sobrepor quando o passo configurado fica menor do que a duração da própria janela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Janelas session variam de duração conforme a atividade de cada chave, ao contrário de tumbling e sliding, que são fixas.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Estado e agregações em streaming",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Estado e agregações em streaming\n\nFiltrar um campo ou transformar um valor são operações sem memória: o motor olha um registro, decide o que fazer com ele e esquece. Contar pedidos por minuto ou somar faturamento por cliente é diferente: o resultado de agora depende de tudo que já foi visto para aquela janela e aquela chave. Isso é processamento com estado (stateful), e é o que torna agregações em streaming mais caras e mais delicadas do que transformações simples."
                    },
                    {
                        "type": "text",
                        "value": "## Por que agregar exige estado\n\nUma transformação sem estado (stateless), como filtrar pedidos cancelados ou converter uma moeda, processa cada registro isoladamente: não precisa lembrar nada do registro anterior. Uma agregação com estado (stateful) é diferente: para responder quantos pedidos já chegaram nesta janela para este cliente, o motor precisa guardar um contador parcial em algum lugar entre um micro-batch e o próximo, atualizá-lo a cada novo evento e só descartá-lo quando a janela realmente se encerra, ou seja, quando o watermark passa do fim dela.\n\nEsse contador parcial, por chave e por janela, é o estado da aplicação."
                    },
                    {
                        "type": "code",
                        "value": "fluxo de eventos (chave = cliente, janela = 5 min)\n\nmicro-batch 1: chegam 3 pedidos do cliente A\n  state store: { (cliente=A, janela=[08:00,08:05)): contador=3 }\n\nmicro-batch 2: chegam 2 pedidos do cliente A e 1 do cliente B\n  state store: { (cliente=A, janela=[08:00,08:05)): contador=5,\n                  (cliente=B, janela=[08:00,08:05)): contador=1 }\n\nmicro-batch 3: watermark passa de 08:05\n  state store: emite o resultado final da janela [08:00,08:05) para A e B,\n               remove essas chaves do estado (a janela não existe mais)"
                    },
                    {
                        "type": "text",
                        "value": "## O custo do estado\n\nO estado precisa ficar disponível entre um micro-batch e o próximo, normalmente em memória no executor, com uma cópia durável em disco (o checkpoint, aprofundado na trilha de Spark Structured Streaming) para sobreviver a uma falha. Isso tem custo:\n\n- **Cresce com o número de chaves distintas em aberto**: contar por `usuario_id` em uma base com milhões de usuários ativos guarda muito mais estado do que contar por `regiao`.\n- **Cresce com o número de janelas abertas ao mesmo tempo**: um watermark com tolerância muito longa mantém mais janelas antigas vivas, cada uma com seu próprio estado.\n- **Pode crescer sem limite** se o watermark estiver mal configurado, ou ausente, e o motor nunca considerar nenhuma janela encerrada, acumulando estado até faltar memória.\n\nDimensionar o watermark, como visto na aula anterior, também é uma decisão sobre o tamanho do estado, não só sobre latência."
                    },
                    {
                        "type": "quote",
                        "value": "Toda agregação em streaming é uma promessa de guardar alguma coisa na memória até que o watermark diga que está na hora de soltar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Transformação sem estado (stateless)\",\"Agregação com estado (stateful)\"],[\"Exemplo\",\"Filtrar, converter um campo, validar um schema\",\"Contar, somar, calcular média por janela e chave\"],[\"Depende de eventos anteriores\",\"Não, cada registro é independente\",\"Sim, acumula um resultado parcial por chave\"],[\"Precisa de state store\",\"Não\",\"Sim, para guardar o resultado parcial entre micro-batches\"],[\"Custo de memória\",\"Constante, não cresce com o fluxo\",\"Cresce com o número de chaves e janelas em aberto\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# contagem de pedidos por cliente, em janelas de 5 minutos:\n# cada combinação (cliente_id, janela) mantém um contador no state store\n# do Spark até que o watermark feche a janela correspondente\ncontagem = (\n    pedidos\n    .withWatermark(\"event_ts\", \"10 minutes\")\n    .groupBy(col(\"cliente_id\"), window(\"event_ts\", \"5 minutes\"))\n    .count()\n)\n\n# o Spark guarda esse estado em memória no executor e faz checkpoint\n# em um storage durável, para conseguir retomar após uma falha\n# (checkpoint e tolerância a falha é o tema do próximo módulo)"
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que uma agregação como contar pedidos por cliente a cada janela de 5 minutos exige processamento com estado (stateful)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o resultado de cada janela depende de todos os eventos daquela chave já vistos até o momento, não só do evento atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Kafka exige que toda contagem seja feita dentro da própria partição, sem nenhuma passagem pelo Spark.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda operação de streaming, mesmo um filtro bem simples, precisa guardar o registro anterior inteiro na memória.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o watermark obriga o motor a guardar uma cópia de cada evento antes mesmo de poder descartá-lo depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline agrega o total gasto por usuario_id em janelas de 1 hora. Depois de alguns dias em produção, com dezenas de milhões de usuários distintos ativos por hora, o job começa a falhar por falta de memória nos executores. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Kafka está reenviando mensagens duplicadas para o tópico de origem, dobrando por completo o volume processado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O state store mantém um contador por combinação de usuário e janela, e a alta cardinalidade fez o estado crescer muito.",
                                "isCorrect": true
                            },
                            {
                                "text": "O watermark foi configurado com uma tolerância curta demais, fechando as janelas horárias muito antes da hora certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark está lendo a mesma partição do Kafka mais de uma vez por causa de um rebalanceamento mal sucedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job agrega vendas por janela de 10 minutos, mas a equipe esqueceu de configurar um watermark sobre o event time. Depois de rodar por vários dias sem reiniciar, o estado guardado pelo Spark só cresce, sem nunca diminuir. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sem watermark, o Spark passa a agregar automaticamente por processing time, dobrando o número total de janelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem watermark, o Kafka para completamente de fazer commit de offset, então o mesmo dado acaba sendo lido repetidas vezes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem watermark, o motor nunca tem um sinal para considerar uma janela encerrada, então nenhuma chave de estado é liberada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sem watermark, o state store deixa de gravar checkpoint em disco e passa a acumular tudo apenas em memória.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das operações a seguir é um exemplo de transformação sem estado (stateless) em um pipeline de streaming?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Somar o valor total de pedidos feitos por cada cliente dentro de janelas de 15 minutos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contar quantos eventos distintos de erro ocorreram em cada serviço a cada minuto corrido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular a média móvel da temperatura de cada sensor ao longo dos últimos 10 minutos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converter o campo de moeda de cada pedido de centavos para reais antes de gravar no sink.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Sobre estado em processamento de streams, qual afirmação está correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduzir a tolerância do watermark tende a diminuir o estado em aberto, pois as janelas fecham e liberam chaves mais cedo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tamanho do estado depende apenas do volume de eventos por segundo, e nunca do número de chaves distintas usadas na agregação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transformações sem estado também precisam manter um state store próprio, ainda que menor do que o das agregações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um job de streaming sem nenhuma agregação ainda assim guarda estado proporcional ao número total de janelas abertas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Processando streams com Spark Structured Streaming",
        "aulas": [
            {
                "titulo": "O modelo: uma tabela sem fim e micro-batch",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O modelo: uma tabela sem fim e micro-batch\n\nNos módulos anteriores desta trilha, o Kafka apareceu como um log distribuído e append-only: cada partição só cresce, um evento novo vira um offset novo. O Spark Structured Streaming parte dessa mesma ideia para processar esse log (ou qualquer outra fonte contínua): trata o stream inteiro como uma tabela que nunca para de crescer, e processa essa tabela em pequenos lotes automáticos, os micro-batches.\n\nA trilha de Spark já apresentou essa abstração numa introdução. Este módulo aprofunda: como ler e escrever de verdade (`readStream`/`writeStream`), os modos de saída, o checkpoint, e como as agregações com janela e watermark do módulo anterior viram código."
                    },
                    {
                        "type": "text",
                        "value": "## A tabela ilimitada (unbounded table)\n\nUma consulta em Structured Streaming é escrita contra uma tabela de entrada que, na cabeça do Spark, é ilimitada: a cada novo dado que chega na fonte (uma mensagem nova no tópico Kafka, um arquivo novo na pasta monitorada), uma linha é acrescentada ao final dessa tabela. A consulta (`select`, `filter`, `groupBy`, `join`) é escrita uma única vez, com a mesma API de DataFrame do batch, e é aplicada de forma incremental conforme a tabela cresce.\n\nO resultado dessa consulta também é modelado como uma tabela, a tabela de resultado. É ela que, a cada micro-batch, é total ou parcialmente escrita no sink, conforme o output mode (assunto da próxima aula)."
                    },
                    {
                        "type": "code",
                        "value": "-- a tabela de entrada cresce a cada offset novo consumido do topico\n\ntempo:          t1              t2              t3\nparticao 0:  [offsets 0-40]  [offsets 41-58] [offsets 59-77]\n                   |               |               |\n                   v               v               v\ntabela de     +----------+    +----------+    +----------+\nentrada       | linhas   | -> | linhas   | -> | linhas   |   (so cresce)\n(ilimitada)   | 0..40    |    | 0..58    |    | 0..77    |\n              +----------+    +----------+    +----------+\n                   |               |               |\n                   v               v               v\n             micro-batch 1   micro-batch 2   micro-batch 3\n             (consulta roda   (consulta roda   (consulta roda\n              sobre o que      sobre o que      sobre o que\n              e novo)          e novo)          e novo)"
                    },
                    {
                        "type": "text",
                        "value": "## Micro-batch: o motor por baixo do modelo\n\nPor padrão, o Structured Streaming não processa registro a registro: ele acumula o que chegou desde o último ciclo e roda essa fatia como um job Spark comum, pelo mesmo otimizador e pelo mesmo motor de execução usados em batch. Terminado um micro-batch, o Spark registra até onde avançou na fonte (quais offsets do Kafka já foram lidos, por exemplo) e dispara o próximo ciclo.\n\nIsso significa que tudo o que a trilha de Spark ensinou sobre plano de consulta, particionamento e tarefas continua valendo: um micro-batch é, na prática, um job Spark como outro qualquer, só que disparado automaticamente e de forma repetida."
                    },
                    {
                        "type": "text",
                        "value": "## Streaming verdadeiro x micro-batch\n\nNem todo motor de streaming processa em micro-batches. Um motor de streaming verdadeiro, como o modo padrão do Apache Flink, processa evento a evento, assim que cada um chega, o que reduz a latência mas exige um modelo de execução diferente do batch. O Spark tem um modo experimental de baixíssima latência, o processamento contínuo, mas o motor padrão e mais usado em produção continua sendo o micro-batch: a latência fica na casa de segundos, não de milissegundos, em troca de reaproveitar toda a engenharia de batch já madura do Spark."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Batch\", \"Structured Streaming (micro-batch)\"], [\"Quando roda\", \"Uma vez, do início ao fim, e termina\", \"Continuamente, em ciclos repetidos\"], [\"Tamanho da entrada\", \"Conhecido antes de começar\", \"Desconhecido, cresce sem parar\"], [\"API usada\", \"DataFrame (read, transformações, write)\", \"A mesma API de DataFrame (readStream, writeStream)\"], [\"Unidade de execução\", \"Um job Spark\", \"Vários jobs Spark, um por micro-batch\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Structured Streaming não troca a API de DataFrame por uma nova: ele reaplica a mesma consulta em fatias incrementais de uma tabela que nunca termina de crescer."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a abstração central que o Spark Structured Streaming usa para representar um stream de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma tabela que nunca para de crescer, onde cada dado novo vira uma linha ao final.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma fila que descarta cada mensagem assim que um consumidor confirma a leitura dela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um conjunto de RDDs isolados, um novo RDD criado a cada registro recebido da fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um índice reconstruído do zero a cada novo lote de dados que chega para processar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por padrão, como o Structured Streaming processa os dados recebidos desde o último ciclo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Processa cada registro isoladamente, no instante exato em que ele chega à fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acumula o que chegou e roda essa fatia como um job Spark comum, em ciclos repetidos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Espera acumular um volume fixo em disco antes de iniciar qualquer processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Recalcula a consulta inteira sobre todo o histórico a cada novo dado recebido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um micro-batch terminar, o que o Spark usa para saber até onde já avançou na leitura de um tópico Kafka?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O horário do relógio do cluster, comparado ao horário de criação de cada mensagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho em bytes acumulado do tópico, comparado ao tamanho no ciclo anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os offsets já lidos de cada partição, que também orientam o próximo ciclo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de linhas do micro-batch anterior, usado como meta para o próximo ciclo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal diferença entre um motor de streaming verdadeiro (processamento evento a evento) e o motor padrão de micro-batch do Structured Streaming?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O motor de micro-batch não consegue reaproveitar nenhum otimizador usado em batch.",
                                "isCorrect": false
                            },
                            {
                                "text": "O motor evento a evento não existe de fato, sendo só um nome alternativo para micro-batch.",
                                "isCorrect": false
                            },
                            {
                                "text": "O motor de micro-batch só funciona com fontes de arquivo, nunca com filas como o Kafka.",
                                "isCorrect": false
                            },
                            {
                                "text": "O motor evento a evento processa cada registro assim que chega, com latência menor.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta em Structured Streaming aplica um groupBy seguido de um count, escrita com a mesma sintaxe de uma consulta batch equivalente. Por que isso é possível sem aprender uma API nova?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o motor aplica a mesma API de DataFrame de forma incremental sobre a tabela ilimitada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Spark converte automaticamente o groupBy num join otimizado só em streaming.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda consulta em streaming roda primeiro em batch antes de virar streaming de fato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o groupBy em streaming ignora linhas antigas, considerando só o último micro-batch.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "readStream e writeStream",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# readStream e writeStream\n\nToda consulta em Structured Streaming tem duas pontas: `spark.readStream` cria a tabela ilimitada a partir de uma fonte, e `.writeStream` pega a tabela de resultado e escreve num sink, em ciclos controlados por um trigger. Fora essas duas pontas, o meio da consulta (as transformações) é DataFrame normal, exatamente como em batch."
                    },
                    {
                        "type": "text",
                        "value": "## Lendo com readStream\n\nLer de um tópico Kafka é o caso mais comum em produção. O DataFrame resultante traz colunas fixas (`key`, `value`, `topic`, `partition`, `offset`, `timestamp`), com `key` e `value` como binário, quase sempre desserializadas logo em seguida com `CAST` ou `from_json`. Ler de uma pasta monitorada (arquivos Parquet, JSON, CSV) usa o mesmo `readStream`, mas exige schema explícito: diferente do batch, o Structured Streaming não infere o schema de arquivos automaticamente."
                    },
                    {
                        "type": "code",
                        "value": "# lendo de um topico Kafka\neventos_raw = (\n    spark.readStream\n    .format(\"kafka\")\n    .option(\"kafka.bootstrap.servers\", \"broker1:9092,broker2:9092\")\n    .option(\"subscribe\", \"cliques\")\n    .option(\"startingOffsets\", \"latest\")\n    .load()\n)\n\n# key e value chegam em binario; desserializando o value como JSON\neventos = (\n    eventos_raw\n    .selectExpr(\"CAST(value AS STRING) AS json\")\n    .select(from_json(col(\"json\"), schema_cliques).alias(\"dado\"))\n    .select(\"dado.*\")\n)\n\n# lendo de uma pasta monitorada (schema explicito e obrigatorio)\npedidos = (\n    spark.readStream\n    .schema(schema_pedidos)\n    .format(\"json\")\n    .load(\"s3://bronze/pedidos/\")\n)"
                    },
                    {
                        "type": "text",
                        "value": "## Escrevendo com writeStream\n\n`.writeStream` define o `format` do sink (`kafka`, `delta`, `parquet`, `console`, entre outros), o `outputMode` (aula seguinte) e o `checkpointLocation` (aula depois desta), e é encerrado com `.start()`, que devolve uma `StreamingQuery` rodando em segundo plano. Escrever de volta no Kafka exige pelo menos uma coluna `value` (a `key` é opcional); escrever em Delta ou Parquet grava arquivos incrementalmente, como uma série de pequenas escritas em batch."
                    },
                    {
                        "type": "code",
                        "value": "# escrevendo de volta num topico Kafka\nconsulta = (\n    eventos.selectExpr(\"CAST(pagina_id AS STRING) AS key\", \"to_json(struct(*)) AS value\")\n    .writeStream\n    .format(\"kafka\")\n    .option(\"kafka.bootstrap.servers\", \"broker1:9092,broker2:9092\")\n    .option(\"topic\", \"cliques-validados\")\n    .option(\"checkpointLocation\", \"/chk/cliques-validados\")\n    .start()\n)\n\n# escrevendo numa tabela Delta\nconsulta_delta = (\n    eventos.writeStream\n    .format(\"delta\")\n    .option(\"checkpointLocation\", \"/chk/cliques-delta\")\n    .start(\"/lake/silver/cliques\")\n)\n\nconsulta.awaitTermination()"
                    },
                    {
                        "type": "text",
                        "value": "## O trigger: quando cada micro-batch dispara\n\nO `trigger` controla o ritmo dos micro-batches. Sem um trigger explícito, o Spark dispara o próximo micro-batch assim que o anterior termina, o mais rápido possível. `trigger(processingTime=\"1 minute\")` fixa um intervalo mínimo entre ciclos, útil para controlar custo e previsibilidade. `trigger(availableNow=True)` processa tudo o que já está disponível na fonte, em um ou mais micro-batches, e encerra a consulta sozinho, um jeito de rodar streaming como se fosse um job batch agendado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Trigger\", \"Comportamento\"], [\"Sem trigger (padrão)\", \"Dispara o próximo micro-batch assim que o anterior termina\"], [\"processingTime=\\\"1 minute\\\"\", \"Dispara em intervalos fixos, no mínimo a cada 1 minuto\"], [\"availableNow=True\", \"Processa tudo o que já chegou e encerra a consulta sozinho\"], [\"continuous=\\\"1 second\\\"\", \"Modo experimental de baixíssima latência, sem micro-batch\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao ler de um tópico Kafka com spark.readStream.format(\"kafka\"), em que formato as colunas key e value chegam no DataFrame?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Já como um struct tipado, com um campo para cada atributo do schema do tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em binário, normalmente desserializadas em seguida com CAST ou from_json.",
                                "isCorrect": true
                            },
                            {
                                "text": "Em texto puro, sempre no formato JSON pronto para leitura direta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como um array de inteiros, um valor por byte da mensagem original.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa ler arquivos Parquet de uma pasta que recebe novos arquivos continuamente, usando readStream. Diferente do mesmo código em batch, o que passa a ser obrigatório?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir um outputMode antes mesmo de chamar o load(), algo exigido só para arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um consumer group, do mesmo jeito exigido para ler um tópico Kafka qualquer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Declarar o schema manualmente, já que streaming de arquivos não infere schema sozinho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Converter cada arquivo Parquet para JSON antes da leitura, exigido pela API de streaming.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job precisa rodar em streaming mas ser disparado por um agendador externo uma vez por hora, processando de uma vez tudo o que se acumulou desde a última execução e encerrando sozinho. Qual trigger atende esse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "trigger(processingTime=\"1 hour\"), que mantém a consulta rodando indefinidamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "trigger(continuous=\"1 hour\"), que ativa o modo de processamento contínuo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum trigger definido, deixando o Spark disparar um micro-batch por hora sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "trigger(availableNow=True), que processa o disponível e encerra a consulta.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta escreve os resultados de volta em um tópico Kafka via writeStream.format(\"kafka\"). O job falha porque falta uma coluna obrigatória no DataFrame final. Qual coluna é essa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "value, a única coluna que o sink Kafka exige em toda escrita.",
                                "isCorrect": true
                            },
                            {
                                "text": "partition, exigida para o Spark decidir em qual partição gravar cada linha.",
                                "isCorrect": false
                            },
                            {
                                "text": "offset, exigida porque o sink Kafka recalcula a posição de cada mensagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "timestamp, exigida para o broker ordenar as mensagens recebidas na escrita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o método .start() retorna ao final da definição de um writeStream?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um número inteiro, o total de linhas processadas até aquele momento exato.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma StreamingQuery, que representa a execução em segundo plano da consulta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada: start() apenas inicia a consulta e não devolve nenhum valor ao chamador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um DataFrame estático, com o resultado do primeiro micro-batch já calculado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Output modes: append, update, complete",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Output modes: append, update, complete\n\nO `outputMode` decide o que exatamente é escrito no sink a cada micro-batch: só as linhas novas, só as linhas que mudaram, ou a tabela de resultado inteira. Escolher o modo errado para o tipo de consulta é um dos erros mais comuns de quem começa em Structured Streaming, e o Spark recusa algumas combinações de propósito."
                    },
                    {
                        "type": "text",
                        "value": "## append: só o que é novo\n\n`append` é o modo padrão. A cada micro-batch, só as linhas adicionadas à tabela de resultado desde o último ciclo são escritas, e uma linha escrita nunca é reescrita depois. Funciona bem para consultas sem agregação (filtros, transformações linha a linha, junções simples), onde cada linha de entrada gera uma linha de saída definitiva. Para consultas com agregação, `append` só é aceito se houver um watermark definido: sem ele, o Spark não tem como garantir que uma linha já escrita não vá mudar de valor depois."
                    },
                    {
                        "type": "text",
                        "value": "## update: só o que mudou\n\n`update` escreve, a cada micro-batch, apenas as linhas do resultado que mudaram de valor desde o último ciclo. É o modo natural para agregações que evoluem com o tempo, como uma contagem corrente por chave: a cada novo dado, só as chaves afetadas saem no micro-batch, em vez da tabela inteira. Sem watermark, o estado de todas as chaves fica guardado indefinidamente; com watermark, o Spark descarta o estado de janelas antigas, mas o modo de escrita continua sendo só o que mudou."
                    },
                    {
                        "type": "text",
                        "value": "## complete: a tabela inteira, sempre\n\n`complete` reescreve a tabela de resultado inteira a cada micro-batch, mesmo as linhas que não mudaram. Só faz sentido quando essa tabela é pequena, tipicamente uma agregação com poucas chaves de saída (um total geral, uma contagem por poucas categorias); usar `complete` numa consulta sem agregação não é suportado, porque reescrever toda a entrada bruta a cada ciclo não escala."
                    },
                    {
                        "type": "code",
                        "value": "# mesma agregacao, output modes diferentes\ncontagem = eventos.groupBy(\"categoria\").count()\n\n# complete: reescreve a tabela inteira (todas as categorias) a cada micro-batch\nconsulta_completa = (\n    contagem.writeStream\n    .outputMode(\"complete\")\n    .format(\"console\")\n    .option(\"checkpointLocation\", \"/chk/contagem-complete\")\n    .start()\n)\n\n# update: escreve so as categorias cujo count mudou neste micro-batch\nconsulta_update = (\n    contagem.writeStream\n    .outputMode(\"update\")\n    .format(\"console\")\n    .option(\"checkpointLocation\", \"/chk/contagem-update\")\n    .start()\n)\n\n# append numa agregacao exige watermark (a proxima aula cobre o motivo);\n# sem watermark, este start() falha com AnalysisException\nconsulta_append = (\n    contagem.writeStream\n    .outputMode(\"append\")\n    .format(\"console\")\n    .option(\"checkpointLocation\", \"/chk/contagem-append\")\n    .start()\n)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Output mode\", \"O que escreve a cada micro-batch\", \"Uso típico\"], [\"append\", \"Só as linhas novas, nunca reescritas depois\", \"Transformações sem agregação (filtro, join simples)\"], [\"update\", \"Só as linhas do resultado que mudaram\", \"Agregações que evoluem por chave ao longo do tempo\"], [\"complete\", \"A tabela de resultado inteira, do zero\", \"Agregações pequenas (poucas chaves de saída)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Sem agregação, append é a escolha natural. Com agregação, a pergunta é se o sink aguenta a tabela inteira a cada ciclo (complete) ou só o que mudou já basta (update)."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual output mode é o padrão do Structured Streaming quando nenhum é especificado explicitamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "complete, que reescreve a tabela de resultado inteira a cada ciclo.",
                                "isCorrect": false
                            },
                            {
                                "text": "update, que escreve apenas as linhas que mudaram desde o ciclo anterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "append, que escreve apenas as linhas novas da tabela de resultado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum: toda consulta em streaming exige um outputMode definido manualmente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta faz um groupBy por categoria seguido de count, sem nenhum watermark definido, e tenta rodar com outputMode(\"append\"). O que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A consulta roda, mas ignora silenciosamente todo micro-batch depois do primeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta roda normalmente, escrevendo cada categoria assim que aparece pela primeira vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark troca automaticamente o modo para complete, sem avisar quem escreveu a consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark recusa a consulta, porque append em agregação exige um watermark.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório precisa mostrar sempre a lista completa de todas as lojas com seus totais, inclusive lojas sem nenhum pedido novo no ciclo, sobrescrevendo o mesmo arquivo de saída a cada execução. Qual output mode atende esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "complete, que reescreve a tabela de resultado inteira a cada micro-batch.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um trigger específico, já que output mode não influencia esse comportamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "append, que nunca reescreve uma linha já emitida em ciclos anteriores.",
                                "isCorrect": false
                            },
                            {
                                "text": "update, que emite só as lojas cujo total mudou desde o último ciclo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma agregação por janela de tempo usa withWatermark e outputMode(\"append\"). Quando uma linha de resultado (uma janela fechada) é efetivamente escrita no sink?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Assim que a primeira mensagem daquela janela chega, antes de qualquer atualização.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só depois que o watermark ultrapassa o fim da janela, quando ela é considerada final.",
                                "isCorrect": true
                            },
                            {
                                "text": "A cada micro-batch, reescrevendo o valor mais recente daquela janela até o fim.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nunca: append não é compatível com agregações por janela, mesmo com watermark.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o Structured Streaming não aceita outputMode(\"complete\") numa consulta sem nenhuma agregação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o modo complete é exclusivo de sinks Kafka, incompatível com outras fontes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o modo complete exige um watermark configurado, mesmo sem nenhuma janela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque reescrever toda a entrada bruta a cada micro-batch não escalaria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque toda consulta sem agregação já usa complete por padrão, tornando-o redundante.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Checkpoint e tolerância a falha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Checkpoint e tolerância a falha\n\nUma consulta em streaming roda por dias, semanas, às vezes indefinidamente. Em algum momento o processo cai: um executor falha, o cluster reinicia, alguém faz o deploy de uma nova versão do job. O checkpoint é o que permite a consulta retomar exatamente de onde parou, sem reprocessar tudo desde o início nem perder o que já estava em andamento."
                    },
                    {
                        "type": "text",
                        "value": "## O que o checkpoint guarda\n\nUm `checkpointLocation` guarda três coisas: os offsets já processados de cada fonte (em que ponto do tópico Kafka, ou quais arquivos, a consulta já leu), o estado de operações com estado (o valor acumulado de cada chave numa agregação, por exemplo) e metadados da própria consulta (o plano da consulta, o schema). Ao reiniciar, o Spark lê esse diretório antes de tocar na fonte de novo, e retoma dali."
                    },
                    {
                        "type": "code",
                        "value": "consulta = (\n    contagem.writeStream\n    .outputMode(\"update\")\n    .format(\"delta\")\n    .option(\"checkpointLocation\", \"/chk/contagem-por-pagina\")\n    .start(\"/lake/gold/contagem_por_pagina\")\n)\n\n# se o processo cair e for reiniciado com o MESMO checkpointLocation:\n# - os offsets ja lidos do Kafka nao sao relidos\n# - o estado acumulado de cada chave (contagem corrente) e recuperado\n# - a consulta continua dali, sem reprocessar nem pular dados"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o checkpoint é praticamente obrigatório\n\nToda consulta pensada para durar em produção declara um `checkpointLocation` próprio: é esse caminho persistente que sustenta a garantia de retomada. Sem ele, reiniciar a consulta depois de uma queda é começar sem nenhuma memória do que já foi processado: dependendo da opção de offset inicial, isso pode significar reprocessar tudo (duplicando o que já tinha sido escrito no sink) ou pular direto para o que há de mais novo (perdendo o que ficou no meio)."
                    },
                    {
                        "type": "text",
                        "value": "## Um checkpoint por consulta, e cuidado ao trocar o código\n\nCada consulta em streaming precisa do seu próprio diretório de checkpoint: duas consultas nunca podem compartilhar o mesmo caminho. E o checkpoint não é compatível com qualquer mudança no código: alterar as colunas de uma agregação existente, por exemplo, pode fazer o Spark recusar retomar a partir de um checkpoint antigo, porque o estado guardado não corresponde mais ao novo plano de execução. Nesses casos, a saída costuma ser um checkpoint novo, o que custa o histórico de progresso."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"O checkpoint resolve sozinho?\"], [\"Processo caiu e foi reiniciado com o mesmo checkpoint e o mesmo código\", \"Sim, retoma de onde parou\"], [\"Checkpoint apagado manualmente antes do reinício\", \"Não, a consulta perde toda a memória de progresso\"], [\"Lógica da agregação mudou de forma incompatível com o estado salvo\", \"Não necessariamente, o Spark pode recusar retomar\"], [\"Duas consultas diferentes apontando para o mesmo checkpoint\", \"Não, é uma configuração inválida a evitar\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O checkpoint não é um detalhe operacional opcional: é o que transforma uma consulta que reinicia do zero numa consulta que retoma de onde parou."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o checkpointLocation de uma consulta em Structured Streaming guarda?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma cópia completa de todos os dados já lidos da fonte, para fins de auditoria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente os logs de erro gerados durante a execução da consulta em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o código-fonte da consulta, para permitir reiniciar com outra versão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os offsets já processados, o estado da consulta e metadados dela.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta cai depois de processar metade dos dados de um micro-batch. Ela é reiniciada com o mesmo checkpointLocation de antes. O que acontece com esses dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A consulta retoma a partir do último progresso salvo, sem pular nem duplicar dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todo o histórico da fonte é reprocessado do zero, para garantir que nada falte.",
                                "isCorrect": false
                            },
                            {
                                "text": "O micro-batch inteiro é pulado, e a consulta retoma só a partir do próximo ciclo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas os dados chegados depois do reinício são considerados, o resto é perdido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas consultas de streaming diferentes, escrevendo em sinks distintos, são configuradas por engano com o mesmo checkpointLocation. Qual é o problema dessa configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum: o checkpoint identifica a consulta pelo nome do sink, não pelo caminho.",
                                "isCorrect": false
                            },
                            {
                                "text": "É inválida: cada consulta precisa do próprio diretório de checkpoint, exclusivo.",
                                "isCorrect": true
                            },
                            {
                                "text": "É válida, mas a segunda consulta reescreve o checkpoint da primeira a cada ciclo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Só afeta a consulta que iniciar primeiro; a segunda ignora o checkpoint existente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe altera a lógica de uma agregação em produção (muda as colunas do groupBy) e reinicia a consulta apontando para o mesmo checkpointLocation de antes da mudança. Qual é o risco mais direto dessa operação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A consulta ignora o checkpoint automaticamente e recomeça sozinha do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark aplica a lógica nova só aos dados futuros, mantendo o estado antigo intacto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark pode recusar retomar, porque o estado salvo não bate com o novo plano.",
                                "isCorrect": true
                            },
                            {
                                "text": "O checkpoint é migrado automaticamente para o formato exigido pela lógica nova.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a consequência prática de rodar uma consulta de streaming em produção sem definir um checkpointLocation próprio e estável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O outputMode passa a ser ignorado, e a consulta sempre se comporta como complete.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta roda mais rápido, já que não precisa gravar progresso em disco a cada ciclo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark bloqueia por completo a escrita no sink, mesmo em modo append simples.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta perde a garantia de retomar de onde parou após uma falha real.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Agregações com janela e watermark na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Agregações com janela e watermark na prática\n\nO módulo anterior desta trilha cobriu event time, dados atrasados e watermark em conceito. Esta aula fecha o módulo mostrando como esses conceitos viram código: `window()` dentro de um `groupBy`, combinado com `withWatermark`, numa consulta de Structured Streaming completa, do `readStream` no Kafka até o `writeStream` no sink."
                    },
                    {
                        "type": "text",
                        "value": "## window() dentro do groupBy\n\nA função `window()` transforma uma coluna de tempo numa coluna de intervalos (a janela tumbling ou sliding vista no módulo anterior), e essa coluna entra no `groupBy` como mais uma chave de agrupamento. Agrupar por `window(coluna_tempo, \"5 minutes\")` produz uma linha de resultado por janela de 5 minutos; agrupar por `window(coluna_tempo, \"5 minutes\"), coluna_chave` produz uma linha por combinação de janela e chave, como página e intervalo de tempo."
                    },
                    {
                        "type": "text",
                        "value": "## withWatermark: dizendo ao Spark até quando esperar\n\n`withWatermark(\"coluna_tempo\", \"10 minutes\")` declara o quanto de atraso a consulta tolera: dados com event time mais de 10 minutos atrás do event time máximo já visto passam a ser considerados tarde demais. É o watermark que permite ao Spark descartar o estado de janelas antigas (sem ele, o estado de toda janela desde o início da consulta ficaria acumulado indefinidamente) e, em append, decidir quando uma janela está finalmente pronta para ser escrita."
                    },
                    {
                        "type": "code",
                        "value": "from pyspark.sql.functions import from_json, col, window\n\nschema_cliques = \"pagina_id STRING, horario_evento TIMESTAMP\"\n\ncliques = (\n    spark.readStream\n    .format(\"kafka\")\n    .option(\"kafka.bootstrap.servers\", \"broker1:9092,broker2:9092\")\n    .option(\"subscribe\", \"cliques\")\n    .load()\n    .selectExpr(\"CAST(value AS STRING) AS json\")\n    .select(from_json(col(\"json\"), schema_cliques).alias(\"dado\"))\n    .select(\"dado.*\")\n)\n\ncontagem_por_janela = (\n    cliques\n    .withWatermark(\"horario_evento\", \"10 minutes\")\n    .groupBy(\n        window(col(\"horario_evento\"), \"5 minutes\"),\n        col(\"pagina_id\")\n    )\n    .count()\n)\n\nconsulta = (\n    contagem_por_janela.writeStream\n    .outputMode(\"update\")\n    .format(\"console\")\n    .option(\"checkpointLocation\", \"/chk/contagem-por-janela\")\n    .trigger(processingTime=\"1 minute\")\n    .start()\n)\n\nconsulta.awaitTermination()"
                    },
                    {
                        "type": "text",
                        "value": "## A ordem importa: watermark antes do groupBy\n\n`withWatermark` precisa vir antes do `groupBy` que usa a mesma coluna de tempo, na mesma cadeia de transformações. Essa ordem não é estilo: é o que permite ao Spark associar o limite de atraso à agregação que vem depois, e sem essa associação o `outputMode(\"append\")` numa agregação por janela nem se comporta como esperado, pela mesma regra vista na aula sobre output modes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Peça\", \"Papel na consulta\"], [\"window(coluna_tempo, \\\"5 minutes\\\")\", \"Transforma o tempo do evento numa coluna de janelas, usada no groupBy\"], [\"withWatermark(coluna_tempo, \\\"10 minutes\\\")\", \"Define até quando um evento atrasado ainda é aceito\"], [\"groupBy(window(...), chave)\", \"Agrega por janela e, opcionalmente, por uma chave adicional\"], [\"outputMode(\\\"update\\\")\", \"Emite só as janelas cujo valor mudou neste micro-batch\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "window() diz por qual intervalo agrupar; withWatermark diz até quando vale a pena esperar um atrasado antes de considerar aquele intervalo fechado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Dentro de uma consulta de Structured Streaming, o que a função window() faz quando usada dentro de um groupBy?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Transforma uma coluna de tempo em intervalos, usados como chave de agrupamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Define quantos executores o Spark aloca para processar cada micro-batch da consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Filtra do stream qualquer evento que chegue fora da ordem cronológica esperada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Converte a agregação inteira para rodar em modo complete, ignorando outros modos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa consulta com withWatermark(\"horario_evento\", \"10 minutes\") seguida de groupBy(window(\"horario_evento\", \"5 minutes\")), o que o watermark de 10 minutos permite ao Spark fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Eliminar a necessidade de configurar um checkpointLocation para essa consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar o estado de janelas antigas, em vez de acumulá-lo para sempre.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignorar por completo qualquer evento que chegue fora de ordem, mesmo a tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o tamanho da janela de agregação automaticamente, de 5 para 10 minutos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa consulta de streaming, o withWatermark é escrito depois do groupBy que agrega pela mesma coluna de tempo, numa ordem diferente da usual. Qual é a consequência mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhuma: a ordem entre withWatermark e groupBy não influencia o resultado final.",
                                "isCorrect": false
                            },
                            {
                                "text": "O watermark passa a valer para todas as colunas de tempo do DataFrame, não só uma.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark não associa o limite de atraso à agregação, e o comportamento esperado falha.",
                                "isCorrect": true
                            },
                            {
                                "text": "A consulta roda normalmente, só que com o dobro do atraso tolerado configurado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma consulta agrupa por window(col(\"horario_evento\"), \"5 minutes\"), col(\"pagina_id\") e aplica count(). O que representa cada linha da tabela de resultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A contagem total de eventos de todas as páginas somadas em cada janela de 5 minutos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A contagem de janelas de 5 minutos que tiveram ao menos um evento daquela página.",
                                "isCorrect": false
                            },
                            {
                                "text": "A contagem de eventos de uma página em todas as janelas desde o início da consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A contagem de eventos de uma página específica dentro de uma janela de 5 minutos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Com withWatermark(\"horario_evento\", \"10 minutes\"), um evento chega com event time 15 minutos mais antigo que o event time máximo já visto pela consulta. O que acontece com esse evento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ele é tratado como tarde demais e descartado da agregação daquela janela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele gera um erro que interrompe a consulta até alguém tratar o caso manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é somado à janela seguinte, ainda em aberto, no lugar da janela original.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é reprocessado no próximo micro-batch, junto dos dados mais recentes recebidos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Streaming na prática de engenharia de dados",
        "aulas": [
            {
                "titulo": "Kafka como espinha dorsal e o streaming para o lakehouse",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Kafka como espinha dorsal e o streaming para o lakehouse\n\nOs módulos anteriores desta trilha cobriram o Kafka por dentro: tópicos, partições, offsets, garantias de entrega, tempo de evento e o processamento com Spark Structured Streaming. Este último módulo muda de ângulo: como esse conhecimento aparece no dia a dia de uma plataforma de dados real, quando o Kafka deixa de ser um tópico isolado de estudo e passa a ser a peça que conecta sistemas operacionais à camada analítica.\n\n## Kafka como espinha dorsal\n\nNuma plataforma de dados madura, dezenas de sistemas produzem eventos o tempo todo: o serviço de pedidos, o de pagamentos, o de catálogo, cada aplicação publicando o que acontece assim que acontece. Em vez de cada consumidor se conectar diretamente a cada produtor, uma malha de integrações ponto a ponto cara de manter, todos publicam no Kafka e todos os interessados assinam de lá. O Kafka funciona como o sistema nervoso central da plataforma: quem produz um evento não precisa saber quem vai consumi-lo, e quantos consumidores diferentes lerem o mesmo tópico, o produtor nem percebe."
                    },
                    {
                        "type": "code",
                        "value": "  [app pedidos]      [app pagamentos]      [app catalogo]\n         |                   |                    |\n         +-------------------+--------------------+\n                             |\n                             v\n                 topico: eventos.pedidos\n             (particoes 0, 1, 2, 3, ..., N)\n                             |\n              ---------------------------------\n              |                               |\n              v                               v\n   job Structured Streaming            consumidor de alertas\n   (grava a camada bronze)              (regras quase em tempo real)\n              |\n              v\n   lakehouse: bronze/eventos_pedidos/\n   (append-only, particionado por data de ingestao)"
                    },
                    {
                        "type": "text",
                        "value": "## O padrão streaming-para-o-lakehouse\n\nO padrão mais comum de usar o Kafka numa plataforma de engenharia de dados é como porta de entrada da camada bronze do lakehouse (a trilha de Data Lake já cobriu o papel de cada camada: bronze crua, silver limpa, gold agregada). Um job de Structured Streaming lê continuamente um ou mais tópicos e grava na bronze fazendo o mínimo de transformação possível: decodifica o payload, talvez adicione metadados de ingestão, mas deixa a limpeza e as regras de negócio para as camadas seguintes.\n\nManter a bronze próxima do formato original do evento tem um motivo prático: se uma regra de transformação mudar ou tiver um bug, a silver pode ser reconstruída reprocessando a bronze, sem depender de o Kafka ainda ter aquele evento disponível. Isso importa porque o Kafka não guarda dado para sempre."
                    },
                    {
                        "type": "code",
                        "value": "# le o topico Kafka de eventos de pedidos em streaming\neventos = (\n    spark.readStream\n    .format('kafka')\n    .option('kafka.bootstrap.servers', 'broker1:9092,broker2:9092')\n    .option('subscribe', 'eventos.pedidos')\n    .option('startingOffsets', 'latest')\n    .load()\n)\n\n# bronze: decodifica o value e adiciona metadados de ingestao, sem regra de negocio\nbronze = (\n    eventos\n    .selectExpr('CAST(value AS STRING) AS payload', 'timestamp AS kafka_timestamp')\n    .withColumn('data_ingestao', F.current_timestamp())\n)\n\n(\n    bronze.writeStream\n    .format('delta')\n    .option('checkpointLocation', 's3://checkpoints/bronze_pedidos/')\n    .outputMode('append')\n    .trigger(processingTime='30 seconds')\n    .start('s3://bronze/eventos_pedidos/')\n)"
                    },
                    {
                        "type": "text",
                        "value": "## Retenção do Kafka x retenção do lakehouse\n\nO Kafka e o lakehouse guardam o mesmo dado por motivos diferentes. O tópico existe para transportar o evento entre quem produz e quem consome, e sua retenção costuma ser curta (horas a poucos dias), configurada para o tópico não crescer indefinidamente. A bronze existe para guardar o histórico: uma vez materializada, ela conserva o evento por meses ou anos, pelo custo baixo do object storage.\n\nEssa diferença é o motivo pelo qual o job de ingestão para a bronze deve rodar continuamente e sem grandes intervalos de inatividade: um consumidor que fica muito tempo parado corre o risco de o Kafka já ter descartado, pela retenção, eventos que ele ainda não processou."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Kafka\",\"Camada bronze do lakehouse\"],[\"Retenção típica\",\"Horas a poucos dias, definida por tópico\",\"Meses a anos, limitada pelo custo de storage\"],[\"Papel principal\",\"Transporte entre produtores e consumidores\",\"Cópia durável e consultável do evento\"],[\"Reprocessamento histórico\",\"Só dentro da janela de retenção configurada\",\"Qualquer período já materializado na bronze\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O Kafka carrega o evento enquanto ele está em trânsito; o lakehouse guarda o evento depois que ele já aconteceu."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que o Kafka costuma ser descrito como a espinha dorsal de uma plataforma de dados moderna?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque desacopla produtores de consumidores: quem publica não sabe quem vai ler.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque substitui a necessidade de qualquer camada de armazenamento no lakehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque aplica sozinho as regras de negócio antes de o dado chegar à camada bronze.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque garante, por padrão, que nenhum tópico jamais perca uma mensagem publicada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de Structured Streaming consome um tópico Kafka e grava a camada bronze de um lakehouse. Seguindo o padrão de ingestão em streaming, o que essa etapa deve priorizar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aplicar todas as regras de negócio já na bronze, deixando a silver praticamente pronta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Decodificar o payload e gravar próximo do formato original, deixando a limpeza para depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pular a bronze e gravar direto na gold, já agregado por dia e por loja.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar os metadados de offset do Kafka assim que a mensagem é gravada em disco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico Kafka está configurado com retenção de 3 dias, e a equipe assume que não precisa materializar o dado em lugar nenhum, já que ele fica salvo no Kafka. Qual é o risco dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Kafka passa a rejeitar novas mensagens no tópico assim que a retenção é atingida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os consumidores existentes perdem automaticamente o offset commitado após 3 dias.",
                                "isCorrect": false
                            },
                            {
                                "text": "As mensagens mais antigas que a retenção são descartadas, perdendo o reprocessamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tópico troca sozinho o número de partições configurado após o prazo de retenção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de ingestão para a bronze fica parado por 2 dias por uma falha de infraestrutura, e o tópico de origem está configurado com retenção de 24 horas. Ao voltar, o job não consegue recuperar os eventos do primeiro dia da parada. O que essa situação evidencia sobre o padrão streaming-para-o-lakehouse?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a bronze deveria ter sido descartada em favor de consultar o Kafka a cada relatório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Kafka deveria substituir a bronze por completo, eliminando a necessidade do lakehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a retenção do tópico deveria ser reduzida ainda mais, forçando reprocessamentos frequentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o job de ingestão precisa rodar de forma contínua, perto da janela de retenção do tópico.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um mesmo tópico eventos.pedidos alimenta, ao mesmo tempo, o job que grava a bronze e um consumidor separado que dispara alertas quase em tempo real. O que permite que os dois leiam o mesmo tópico de forma independente, sem que um afete o outro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada um pertence a um consumer group diferente, com seu próprio controle de offset.",
                                "isCorrect": true
                            },
                            {
                                "text": "O tópico duplica fisicamente as mensagens, uma cópia para cada consumidor inscrito.",
                                "isCorrect": false
                            },
                            {
                                "text": "O producer envia a mensagem duas vezes, uma para cada consumidor configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Kafka prioriza automaticamente o consumidor mais rápido, atrasando o mais lento.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Kafka Connect e a integração",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Kafka Connect e a integração\n\nA aula anterior mostrou o Kafka no centro da plataforma, recebendo eventos de aplicações e alimentando a camada bronze do lakehouse. Uma pergunta prática fica em aberto: como os dados de um banco relacional ou de um sistema legado chegam até um tópico, e como o conteúdo de um tópico chega até um data warehouse, sem que alguém escreva um producer ou um consumer customizado para cada integração?\n\n## O que é o Kafka Connect\n\nKafka Connect é o componente do ecossistema Kafka dedicado a integração: um framework que roda como seu próprio cluster de workers e distribui o trabalho de mover dados entre o Kafka e sistemas externos por meio de connectors configurados, não de código escrito à mão. Cada connector se divide internamente em tasks, unidades de trabalho que os workers distribuem entre si para paralelizar a carga, da mesma forma que partições paralelizam o trabalho de um consumer group."
                    },
                    {
                        "type": "code",
                        "value": "   [banco de dados transacional]\n               |\n               v   (write-ahead log / binlog)\n   source connector (ex.: Debezium)\n               |\n               v\n   topicos Kafka (um por tabela, ex.: db.public.pedidos)\n               |\n               v\n   sink connector (ex.: S3 Sink Connector)\n               |\n               v\n   [data lake / data warehouse]"
                    },
                    {
                        "type": "text",
                        "value": "## Source connectors: trazer dados para dentro do Kafka\n\nUm source connector lê de um sistema externo e publica em um tópico. O caso mais comum em engenharia de dados é o CDC (change data capture, já visto na trilha de ETL): um connector como o Debezium lê o log de transações do banco (o write-ahead log no Postgres, o binlog no MySQL) e publica um evento para cada INSERT, UPDATE ou DELETE, normalmente um tópico por tabela. A vantagem sobre consultar a tabela periodicamente é não gerar carga extra de leitura no banco de produção e não perder nenhuma mudança entre uma consulta e outra."
                    },
                    {
                        "type": "code",
                        "value": "// connector fonte (source): captura mudancas da tabela pedidos via CDC\n{\n  \"name\": \"source-pedidos\",\n  \"connector.class\": \"io.debezium.connector.postgresql.PostgresConnector\",\n  \"database.hostname\": \"db-pedidos.interno\",\n  \"database.dbname\": \"loja\",\n  \"table.include.list\": \"public.pedidos\",\n  \"topic.prefix\": \"db\"\n}\n\n// connector destino (sink): leva o topico para o data lake em S3\n{\n  \"name\": \"sink-pedidos-s3\",\n  \"connector.class\": \"io.confluent.connect.s3.S3SinkConnector\",\n  \"topics\": \"db.public.pedidos\",\n  \"s3.bucket.name\": \"bronze-datalake\",\n  \"tasks.max\": \"4\"\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Sink connectors: levar dados do Kafka para fora\n\nUm sink connector faz o caminho inverso: lê de um ou mais tópicos e escreve num sistema externo, como um bucket S3, um data warehouse via JDBC ou um índice de busca. É a alternativa configurada a escrever um consumer customizado só para copiar dados de um tópico para outro lugar sem transformação nenhuma.\n\nNem toda garantia de entrega é igual entre connectors: a maioria opera com at-least-once por padrão, então o destino pode receber a mesma mensagem mais de uma vez após um restart de task, e cabe a quem configura o sink garantir que a escrita do outro lado seja idempotente, como um upsert por chave, quando isso importa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo\",\"Direção\",\"Exemplos\"],[\"Source connector\",\"De um sistema externo para dentro do Kafka\",\"Debezium (CDC), JDBC Source, FileStream Source\"],[\"Sink connector\",\"De dentro do Kafka para um sistema externo\",\"S3 Sink, JDBC Sink, Elasticsearch Sink\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Kafka Connect transforma integração em configuração: o código de mover dado já existe pronto, resta descrever de onde e para onde."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal papel do Kafka Connect dentro do ecossistema Kafka?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Substituir os brokers do Kafka pelo armazenamento direto das mensagens em disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Integrar sistemas externos ao Kafka usando connectors configurados, sem código customizado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar joins SQL entre tópicos diferentes antes de qualquer consumidor ler os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerenciar sozinho as transações do producer idempotente em todos os tópicos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa replicar continuamente cada INSERT, UPDATE e DELETE de uma tabela de um banco relacional para um tópico Kafka, sem sobrecarregar o banco com consultas repetidas. Qual abordagem resolve isso sem escrever um producer customizado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um sink connector apontado para o banco, configurado para ler a cada poucos segundos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um producer customizado consultando a tabela inteira a cada minuto via SELECT.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um source connector de CDC, como o Debezium, lendo o log de transações do banco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um job de batch no Spark, agendado de hora em hora para copiar a tabela inteira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer enviar automaticamente o conteúdo de um tópico Kafka para um índice do Elasticsearch, usado por um sistema de busca. Sem escrever um consumer customizado, qual tipo de connector atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um source connector, configurado para ler o índice do Elasticsearch periodicamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um connector de replicação entre clusters, apontado para o Elasticsearch como broker.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um schema registry conectado ao tópico, exportando os dados automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um sink connector, configurado para escrever no índice a partir do tópico.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um source connector de CDC configurado para uma tabela de altíssimo volume está com tasks.max definido como 4 num cluster de Kafka Connect com workers disponíveis. Qual é o efeito esperado dessa configuração?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O trabalho do connector é dividido em até 4 tasks, paralelizadas entre os workers.",
                                "isCorrect": true
                            },
                            {
                                "text": "O connector cria 4 tópicos separados, um para cada task, sem intervenção manual.",
                                "isCorrect": false
                            },
                            {
                                "text": "O connector passa a garantir exactly-once automaticamente a partir de 4 tasks.",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de partições do tópico de destino é ajustado para 4 automaticamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma task de um sink connector cai e é reiniciada automaticamente pelo Kafka Connect. Depois do restart, o time percebe registros repetidos no destino. O que explica esse comportamento, considerando o padrão de entrega da maioria dos connectors?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Kafka Connect descarta mensagens antigas sempre que uma task reinicia sem checkpoint.",
                                "isCorrect": false
                            },
                            {
                                "text": "A maioria dos connectors opera com at-least-once por padrão, reprocessando após uma falha.",
                                "isCorrect": true
                            },
                            {
                                "text": "O connector trocou sozinho de sink connector para source connector após a falha.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tópico de origem perdeu partições durante o restart, duplicando os offsets restantes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Stream x tabela e a dualidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Stream x tabela e a dualidade\n\nAté aqui, a trilha tratou stream e tabela como dois mundos separados: o stream é o que o Kafka transporta, a tabela é o que um banco ou o lakehouse guarda. Na prática, essa separação é só de perspectiva. Um stream e uma tabela são duas formas de olhar para o mesmo dado, e é possível transformar um no outro nas duas direções.\n\n## A dualidade stream-tabela\n\nUma tabela é um retrato do estado acumulado num instante: o saldo atual de uma conta, o status atual de um pedido. Um stream é a sequência de eventos que, aplicados em ordem, produz esse estado: cada depósito e saque que levou ao saldo, cada mudança de status que levou ao estado atual do pedido. Dessa relação nascem as duas conversões da dualidade: fazer o replay do stream inteiro, aplicando cada evento em ordem, chega à tabela; capturar cada mudança feita numa tabela como um evento chega a um stream."
                    },
                    {
                        "type": "code",
                        "value": "sentido stream -> tabela (agregar por chave, mantendo so o ultimo estado)\n\n  pedido_criado(id=1)\n  pedido_pago(id=1)\n  pedido_criado(id=2)\n  pedido_cancelado(id=2)\n        |\n        v   agrega por pedido_id, mantem o ultimo evento\n  tabela:  id=1 -> status=pago\n           id=2 -> status=cancelado\n\nsentido tabela -> stream (capturar cada mudanca, CDC)\n\n  tabela pedidos\n        |\n        v   cada INSERT/UPDATE/DELETE vira um evento\n  stream:  pedido_atualizado(id=1, status=pago), pedido_atualizado(id=2, status=cancelado), ..."
                    },
                    {
                        "type": "text",
                        "value": "## Materializar uma tabela a partir do stream\n\nMaterializar significa manter, de forma contínua e persistida, o resultado dessa agregação: não é uma consulta feita uma vez, é uma tabela que se atualiza sozinha a cada novo evento que chega no stream. O Structured Streaming faz exatamente isso quando uma agregação com estado, como as agregações por chave e janela já vistas nos módulos anteriores, roda em modo update: cada micro-batch atualiza só as linhas cuja chave recebeu um evento novo, e o restante da tabela permanece como estava."
                    },
                    {
                        "type": "code",
                        "value": "# stream de eventos de pedido, materializando o status atual por pedido\neventos = (\n    spark.readStream\n    .format('kafka')\n    .option('kafka.bootstrap.servers', 'broker1:9092')\n    .option('subscribe', 'eventos.pedidos')\n    .load()\n)\n\nstatus_atual = (\n    eventos\n    .selectExpr('CAST(key AS STRING) AS pedido_id', 'CAST(value AS STRING) AS evento')\n    .groupBy('pedido_id')\n    # mantem so o ultimo evento de cada pedido: a tabela e o resultado sempre atualizado\n    .agg(F.last('evento').alias('status'))\n)\n\n(\n    status_atual.writeStream\n    .format('delta')\n    .option('checkpointLocation', 's3://checkpoints/status_pedidos/')\n    .outputMode('update')\n    .start('s3://silver/status_pedidos/')\n)"
                    },
                    {
                        "type": "text",
                        "value": "## O changelog e a log compaction\n\nO módulo de fundamentos do Kafka já cobriu a log compaction: uma política de retenção que mantém só a mensagem mais recente de cada chave, descartando as versões antigas. Um tópico compactado é, na prática, a dualidade stream-tabela materializada dentro do próprio Kafka: ler o tópico do início ao fim entrega o estado atual de cada chave, como uma tabela, mesmo o dado tendo sido escrito como uma sequência de eventos ao longo do tempo. É esse mecanismo de changelog que sistemas de processamento de stream usam por baixo para tornar uma tabela de estado tolerante a falha, sem depender só da memória do processo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Stream\",\"Tabela\"],[\"O que representa\",\"Uma sequência de eventos ao longo do tempo\",\"O estado acumulado num instante\"],[\"Pergunta que responde\",\"O que aconteceu, e em que ordem\",\"O que é verdade agora\"],[\"Exemplo\",\"pedido_criado, pedido_pago, pedido_cancelado\",\"status atual de cada pedido\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma tabela é um retrato de um stream num instante; um stream é a tabela contada evento a evento."
                    }
                ],
                "questions": [
                    {
                        "statement": "Como a dualidade stream-tabela descreve a relação entre os dois conceitos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Stream e tabela são formatos de armazenamento incompatíveis, sem conversão possível entre eles.",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda tabela precisa ser exportada por completo, todo dia, para alimentar um stream de eventos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma tabela nasce do replay do stream; um stream nasce ao capturar as mudanças da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "A dualidade só existe dentro do Structured Streaming, sem relação com o funcionamento do Kafka.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de e-commerce publica eventos pedido_criado, pedido_pago e pedido_cancelado num tópico. O time quer uma tabela que mostre sempre o status mais recente de cada pedido, não o histórico completo de eventos. Qual abordagem atende essa necessidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gravar cada evento como uma nova linha na tabela, sem nenhuma agregação por chave.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a retenção do tópico para garantir que nenhum evento antigo seja descartado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar o producer para reenviar o último evento de cada pedido a cada hora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Agregar o stream por pedido_id, mantendo apenas o último evento recebido de cada chave.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema legado guarda o cadastro de clientes numa tabela relacional, e outra equipe precisa receber um stream com cada mudança feita nesse cadastro assim que ela acontece. Qual caminho transforma essa tabela num stream de forma confiável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Capturar cada INSERT, UPDATE e DELETE da tabela como evento, via CDC.",
                                "isCorrect": true
                            },
                            {
                                "text": "Consultar a tabela inteira a cada poucos segundos, reemitindo todas as linhas mesmo sem mudança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar um sink connector apontado para a tabela, publicando o resultado num tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exportar um snapshot completo da tabela uma vez por dia, num arquivo compactado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico Kafka está configurado com log compaction, mantendo só a última mensagem de cada chave. O que uma leitura desse tópico do início ao fim efetivamente reconstrói?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O volume total de mensagens já publicadas, incluindo cada versão antiga de cada chave.",
                                "isCorrect": false
                            },
                            {
                                "text": "O estado atual de cada chave, funcionando como uma tabela codificada dentro do tópico.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma cópia idêntica de um tópico configurado com retenção por tempo, sem diferença prática.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas as chaves que nunca mais receberam uma nova mensagem depois da primeira.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de Structured Streaming mantém o saldo atual por conta a partir de um stream de transações, com checkpoint configurado. Depois de uma queda e um restart, os saldos continuam corretos sem reprocessar todas as transações desde o início. O que explica isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tópico de transações foi configurado com retenção infinita, guardando tudo para sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Kafka recalcula o saldo de cada conta sozinho, antes mesmo de o consumidor reiniciar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O estado da agregação é persistido junto ao checkpoint, permitindo retomar de onde parou.",
                                "isCorrect": true
                            },
                            {
                                "text": "A log compaction do tópico de origem soma automaticamente os valores de cada chave.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O ecossistema: Flink, Kinesis, Pulsar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O ecossistema: Flink, Kinesis, Pulsar\n\nA trilha inteira usou Kafka como transporte e Spark Structured Streaming como motor de processamento, a combinação mais comum em engenharia de dados e uma base sólida para entender streaming em qualquer stack. Não é, porém, a única combinação que existe no mercado. Esta aula apresenta em conceito as alternativas mais relevantes, e quando cada uma tende a fazer mais sentido que a dupla Kafka e Spark.\n\n## Apache Flink: streaming nativo\n\nA diferença mais importante entre Flink e Spark está no modelo de execução. O Spark Structured Streaming, como os módulos anteriores mostraram, processa em micro-batches: agrupa os dados chegados num intervalo e roda cada lote como um job Spark comum. O Flink nasceu como motor de streaming nativo: cada evento é processado assim que chega, sem esperar um lote se formar, o que tende a produzir latências menores. O Flink também trouxe o caminho inverso do Spark: em vez de um motor batch que ganhou streaming, ele trata batch como um caso particular de streaming, um stream finito, com um único motor para os dois. Sua gestão de estado, usada em agregações e janelas, é reconhecida como particularmente robusta para pipelines complexos e de longa duração."
                    },
                    {
                        "type": "code",
                        "value": "Spark Structured Streaming (micro-batch)\n\ntempo:  |---lote 1---|---lote 2---|---lote 3---|---lote 4---|\n        processa em ciclos, por exemplo a cada 10 segundos\n\nApache Flink (streaming nativo)\n\ntempo:  evento -> processa -> evento -> processa -> evento -> processa\n        cada evento e tratado assim que chega, sem esperar um ciclo fechar"
                    },
                    {
                        "type": "text",
                        "value": "## Amazon Kinesis: streaming gerenciado na AWS\n\nO Kinesis Data Streams cobre um espaço conceitualmente parecido com o do Kafka: shards fazem o papel das partições, cada registro tem uma chave e uma ordem dentro do shard, e produtores e consumidores publicam e leem de forma parecida. A diferença central é operacional: o Kinesis é um serviço totalmente gerenciado pela AWS, sem broker para provisionar ou atualizar.\n\nO Kinesis Data Firehose vai um passo além: entrega o conteúdo de um stream direto num destino como S3, Redshift ou OpenSearch, sem exigir nenhum consumidor escrito por quem usa o serviço, um pouco como um sink connector totalmente gerenciado. O outro lado dessa comodidade é o vínculo com a AWS: portar um pipeline construído sobre Kinesis para outra nuvem exige trocar a peça de transporte inteira."
                    },
                    {
                        "type": "text",
                        "value": "## Apache Pulsar: multi-tenant e armazenamento em camadas\n\nO Pulsar separa duas responsabilidades que o Kafka mantém juntas: os brokers, que atendem produtores e consumidores, e a camada de armazenamento (Apache BookKeeper), que persiste os dados. Essa separação facilita a multi-tenancy nativa: muitos times isolados, com namespaces e permissões próprias, compartilhando um único cluster sem interferir uns nos outros. O Pulsar também oferece geo-replicação embutida entre regiões e tiered storage, movendo segmentos antigos automaticamente para um object storage mais barato, sem deixar de expô-los para consulta. O Kafka chega a resultados parecidos, mas normalmente com ferramentas adicionais por cima, como o MirrorMaker para replicação entre regiões, não como parte nativa do broker.\n\n## Quando ainda faz sentido ficar com Kafka e Spark\n\nTrocar de ferramenta tem custo: aprender um motor novo, treinar o time, migrar operação. Para a maioria dos pipelines de engenharia de dados, latência de alguns segundos é suficiente, o volume não exige um motor especializado em estado, e a portabilidade entre nuvens com um ecossistema maduro de conectores pesam mais do que qualquer ganho pontual de outra ferramenta. Reconhecer as alternativas não significa trocar de stack a cada projeto, nem sempre que aparece uma novidade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Necessidade\",\"Ferramenta mais indicada\"],[\"Latência sub-segundo com estado complexo por evento\",\"Apache Flink\"],[\"Streaming gerenciado dentro da AWS, sem operar broker\",\"Amazon Kinesis\"],[\"Multi-tenancy nativa e geo-replicação sem ferramenta extra\",\"Apache Pulsar\"],[\"Ecossistema amplo de conectores e portabilidade entre nuvens\",\"Apache Kafka\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A dupla Kafka e Spark é a referência desta trilha, não a única resposta certa: a ferramenta certa depende do requisito, não da popularidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença fundamental entre o modelo de execução do Spark Structured Streaming e o do Apache Flink?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Flink não guarda estado entre eventos; só o Spark suporta agregações com estado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark não oferece checkpoint; a tolerância a falha existe somente no Flink.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Flink funciona apenas como sistema de armazenamento, sem motor de processamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Spark processa em micro-batches; o Flink processa evento a evento, nativamente.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de detecção de fraude precisa pontuar cada evento em poucos milissegundos após ele acontecer, e os ciclos de micro-batch do Structured Streaming, mesmo no menor intervalo configurável, ainda somam uma latência alta demais. Qual mudança atende melhor esse requisito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o motor de processamento para o Apache Flink, com execução nativa evento a evento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reduzir o intervalo do trigger do Structured Streaming até chegar a um valor de zero segundos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o transporte para o Kinesis Data Firehose, mantendo o Spark como motor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o transporte para o Apache Pulsar, mantendo o Spark como motor de processamento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time na AWS precisa entregar dados de um stream direto em S3 e Redshift, sem operar nenhum broker nem escrever um consumidor próprio para essa entrega. Qual serviço atende essa necessidade da forma mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Kafka Connect, com um sink connector operado pelo próprio time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Kinesis Data Firehose, como entrega totalmente gerenciada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apache Pulsar, configurado com tiered storage apontando para o S3.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apache Flink, com um sink customizado escrito para o Redshift.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma central atende dezenas de times isolados num único cluster de streaming, e precisa replicar nativamente alguns namespaces entre duas regiões, sem somar ferramentas externas de replicação. Qual tecnologia atende as duas exigências por design?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Apache Kafka, com um cluster único compartilhado e ACLs por tópico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Amazon Kinesis, com um stream separado por time e replicação em nível de aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apache Pulsar, com multi-tenancy e geo-replicação nativas do broker.",
                                "isCorrect": true
                            },
                            {
                                "text": "Spark Structured Streaming, com um job isolado por time e checkpoint por região.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe escolhe a stack de streaming de um novo projeto valorizando um ecossistema maduro de conectores e a possibilidade de rodar a mesma arquitetura em qualquer nuvem, sem depender de um único provedor. Qual escolha reflete melhor essa prioridade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Amazon Kinesis, pela integração profunda com os demais serviços da AWS.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apache Pulsar, ainda consolidando um ecossistema de conectores tão amplo quanto o do Kafka.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apache Flink isolado, sem um sistema de transporte de mensagens dedicado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apache Kafka, pela maturidade do ecossistema e portabilidade entre nuvens.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Boas práticas, monitoramento e antipadrões",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Boas práticas, monitoramento e antipadrões\n\nEsta é a última aula da trilha de Streaming de Dados, e o objetivo é reunir, numa lista prática, o que os módulos anteriores construíram peça por peça: garantias de entrega, tempo de evento e janelas, o processamento com Spark Structured Streaming, o Kafka Connect e a dualidade stream-tabela. Cada item apareceu isolado em algum momento; a diferença agora é olhar para eles como uma checklist de produção.\n\n## Consumer lag: o consumidor está acompanhando?\n\nConsumer lag é a distância entre o offset mais recente já publicado numa partição e o offset que o consumer group já processou. Lag zero significa que o consumidor está em dia; lag crescendo significa que ele está ficando para trás, seja por falta de paralelismo, processamento lento por mensagem, ou um pico de produção acima do que o consumidor aguenta. De todas as métricas de um pipeline de streaming, lag é a que mais diretamente responde à pergunta se o pipeline está saudável agora, mais até do que o throughput sozinho, que não diz se o consumidor está acompanhando ou só processando devagar um volume que já se acumulou."
                    },
                    {
                        "type": "code",
                        "value": "$ kafka-consumer-groups.sh --bootstrap-server broker1:9092 --describe --group grupo-ingestao-bronze\n\nTOPIC             PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG\neventos.pedidos   0          184023          184023          0\neventos.pedidos   1          179884          181950          2066\neventos.pedidos   2          190112          190112          0\neventos.pedidos   3          177200          185430          8230\n\n# LAG = LOG-END-OFFSET menos CURRENT-OFFSET: quanto falta o consumidor processar\n# particoes 1 e 3 estao acumulando atraso; e ali que investigar o gargalo primeiro"
                    },
                    {
                        "type": "text",
                        "value": "## Dimensionar partições para aguentar a carga\n\nO número de partições de um tópico define o teto de paralelismo de um consumer group: como cada partição só é lida por um consumidor do grupo por vez, um tópico com poucas partições limita quantos consumidores conseguem trabalhar em paralelo, não importa quantas instâncias o time suba. Poucas partições também travam o throughput de gravação, já que o producer não consegue distribuir a carga.\n\nO excesso também custa: cada partição soma overhead de réplica entre os brokers e aumenta o tempo de um rebalanceamento. E aumentar o número de partições de um tópico existente não é uma operação neutra: como a partição de uma chave normalmente vem de um hash sobre a chave, adicionar partições muda esse mapeamento, e mensagens da mesma chave podem passar a cair numa partição diferente da que caíam antes, quebrando a ordem que o consumidor esperava para aquela chave. Por isso, dimensionar para o pico esperado de antemão vale mais do que corrigir depois."
                    },
                    {
                        "type": "text",
                        "value": "## Idempotência como rede de segurança\n\nOs módulos de garantias de entrega já deixaram claro: at-least-once é o padrão realista da maioria dos pipelines, e duplicatas eventualmente acontecem, depois de um restart de consumidor ou de uma task de connector. A defesa prática não é perseguir exactly-once em cada etapa do pipeline, e sim projetar a escrita final para ser idempotente, como um upsert por uma chave única do evento, de forma que reprocessar a mesma mensagem não mude o resultado."
                    },
                    {
                        "type": "text",
                        "value": "## O antipadrão de usar streaming sem necessidade\n\nStreaming tem um custo de operação que o batch não tem: infraestrutura sempre ligada, checkpoint para gerenciar, lag para monitorar, um tipo de depuração mais difícil que a de um job que roda e termina. Quando o requisito de negócio aceita uma atualização a cada hora ou uma vez por dia, um job batch agendado por um orquestrador entrega o mesmo resultado com uma operação bem mais simples. O primeiro módulo desta trilha já colocou essa pergunta: o motivo de usar streaming precisa ser a exigência real de baixa latência, não o hábito de tratar todo pipeline novo como um caso de tempo real."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Prática\",\"Pergunta a fazer\"],[\"Consumer lag\",\"O consumidor está acompanhando o ritmo de produção, partição por partição?\"],[\"Partições\",\"O número atual sustenta o pico de throughput sem exagerar no overhead?\"],[\"Idempotência\",\"Uma mensagem duplicada corrompe o resultado, ou a escrita é segura para repetir?\"],[\"Necessidade real de streaming\",\"O requisito exige tempo real de fato, ou um lote periódico já resolve?\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Streaming não é o padrão a aplicar sempre que existe um evento: é a resposta certa quando o tempo entre o evento e a decisão realmente precisa ser curto."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa consumer lag crescendo numa partição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O consumidor está ficando para trás em relação ao ritmo de produção naquela partição.",
                                "isCorrect": true
                            },
                            {
                                "text": "O broker responsável pela partição está sem espaço em disco para novas mensagens.",
                                "isCorrect": false
                            },
                            {
                                "text": "O producer parou de aguardar confirmação (acks) antes de enviar a próxima mensagem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A partição está configurada com um fator de replicação abaixo do recomendado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um tópico tem 6 partições, e um consumer group sobe 10 instâncias para lê-lo, na esperança de acelerar o processamento. O que acontece com as 4 instâncias além do número de partições?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dividem o consumo de cada partição em turnos de tempo com as demais instâncias.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficam ociosas, já que cada partição só é lida por um consumidor do grupo por vez.",
                                "isCorrect": true
                            },
                            {
                                "text": "Forçam o Kafka a criar automaticamente mais partições para o tópico em questão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Processam as mesmas mensagens das outras instâncias, como uma réplica de leitura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para aumentar o throughput, um time eleva o número de partições de um tópico já em produção, particionado pela chave cliente_id para preservar a ordem por cliente. Qual é o risco dessa mudança para os consumidores existentes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Todo o histórico do tópico é redistribuído automaticamente entre as novas partições à noite.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os consumidores existentes são obrigados a reiniciar com uma nova versão do client Kafka.",
                                "isCorrect": false
                            },
                            {
                                "text": "O hash da chave para partição muda, e eventos do mesmo cliente podem cair numa partição diferente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O producer perde a capacidade de definir uma chave de particionamento a partir dessa mudança.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline opera com at-least-once e, ocasionalmente, reprocessa o mesmo evento após um restart do consumidor. O destino é uma tabela que deve refletir cada evento uma única vez. Qual prática evita que a duplicata corrompa o resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Configurar o producer com acks igual a zero, para acelerar o envio das mensagens.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contar com o Kafka para deduplicar mensagens repetidas automaticamente por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar o checkpoint do consumidor, para que ele nunca retome de onde parou.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever como um upsert idempotente, usando o identificador único do evento como chave.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um painel só precisa exibir o total do dia anterior, atualizado uma vez por noite, mas a equipe já mantém um tópico Kafka com os eventos e, por padrão, sobe um job de streaming rodando 24 horas para manter um agregado sempre atualizado. Qual decisão melhor se encaixa nesse requisito?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Substituir o job de streaming por um lote agendado uma vez por dia, já que a SLA não exige tempo real.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar a retenção do tópico para infinita, sem mudar a forma como o agregado é calculado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o motor de streaming para o Flink, reduzindo o custo de manter o job ligado o tempo todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter o streaming, já que dados publicados num tópico Kafka só podem ser lidos por outro job de streaming.",
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
