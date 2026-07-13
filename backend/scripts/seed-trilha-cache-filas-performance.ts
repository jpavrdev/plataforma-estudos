// Seed da trilha Cache, Filas e Performance (intermediario), estagio 6 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-cache-filas-performance.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Cache, Filas e Performance";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Deixe seu back-end rápido e escalável: medir performance, cache com Redis e sua invalidação, filas e processamento assíncrono com workers, e como escalar. A camada que segura o crescimento da aplicação.";

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
        "titulo": "Módulo 1 - Por que performance importa e como medir",
        "aulas": [
            {
                "titulo": "O que deixa um back-end lento",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que deixa um back-end lento\n\nAté agora você construiu APIs que funcionam: rotas com Express, dados modelados e consultados no banco, autenticação com JWT protegendo o que precisa ser protegido. O próximo passo não é aprender mais uma feature, é aprender a fazer tudo isso rodar rápido e aguentar mais gente ao mesmo tempo.\n\nEsse é o assunto desta trilha inteira: medir onde o tempo vai embora, cachear o que não precisa ser recalculado, tirar trabalho pesado da frente do usuário e escalar quando um servidor só não é mais suficiente. Mas antes de otimizar qualquer coisa, precisa entender o que, de fato, deixa um back-end lento."
                    },
                    {
                        "type": "text",
                        "value": "## Por que performance importa\n\nPerformance não é luxo nem perfeccionismo de quem gosta de código bonito. Ela afeta três coisas bem concretas:\n\n- **Experiência do usuário**: ninguém gosta de esperar. Atrasos de poucos segundos já derrubam conversão e satisfação, e em produtos com concorrência o usuário simplesmente vai para outro lugar.\n- **Custo de servidor**: uma rota lenta consome mais tempo de CPU, mais conexões de banco abertas por mais tempo, mais memória segurando requisições em andamento. Isso vira direto máquina maior, ou mais máquinas, para dar conta do mesmo tráfego.\n- **Capacidade de aguentar mais gente**: um back-end rápido atende mais usuários com a mesma infraestrutura. Você já viu, na trilha de autenticação, como o rate limit protege o servidor limitando quantas requisições cada cliente pode fazer. Performance é o outro lado dessa moeda: quanto mais eficiente cada requisição, mais gente o mesmo servidor aguenta sem precisar limitar ninguém."
                    },
                    {
                        "type": "text",
                        "value": "## Onde o tempo se perde\n\nUm back-end lento quase sempre cai em uma (ou mais) dessas categorias:\n\n- **I/O em geral**: ler e escrever em disco, rede, qualquer operação que espera por algo fora do processo Node.\n- **Consultas ao banco**: a causa mais comum na prática. Uma query sem índice pode levar segundos numa tabela grande, enquanto a mesma consulta com o índice certo leva milissegundos. Multiplicar queries (o problema de N+1 que você viu na trilha de banco) piora tudo: uma lista de 200 itens pode virar 201 idas ao banco numa única requisição.\n- **Trabalho bloqueante síncrono**: código que ocupa o processo Node fazendo cálculo pesado (hash de senha com custo alto, processar uma imagem, montar um relatório gigante em memória) sem devolver o controle para o event loop. Enquanto isso roda, nenhuma outra requisição é atendida.\n- **Chamadas externas**: APIs de terceiros, serviços de pagamento, provedores de email. O tempo de resposta deles vira o seu tempo de resposta, e você não controla a velocidade deles."
                    },
                    {
                        "type": "code",
                        "value": "// Exemplo 1: trabalho síncrono pesado, trava o event loop inteiro\napp.get('/relatorio-pesado', (req, res) => {\n  let total = 0;\n  for (let i = 0; i < 5_000_000_000; i++) {\n    total += i;\n  }\n  res.json({ total });\n});\n\n// Enquanto essa rota roda, o processo Node não atende MAIS NINGUÉM,\n// porque o loop ocupa o único thread principal sem devolver o controle.\n\n// Exemplo 2: I/O de banco, não trava o event loop, mas ainda assim é lento\napp.get('/produtos', async (req, res) => {\n  // aqui o Node fica esperando a resposta do banco, e nesse meio tempo\n  // consegue atender outras requisições normalmente\n  const produtos = await db.query('SELECT * FROM produtos');\n  res.json(produtos.rows);\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de gargalo\", \"Exemplo comum\", \"O que acontece\", \"Pista para investigar\"], [\"I/O de banco\", \"Query sem índice, N+1 (uma query por item de uma lista)\", \"O Node fica esperando a resposta do banco, mas o event loop continua livre\", \"Tempo de resposta cresce junto com o tamanho dos dados\"], [\"Trabalho síncrono pesado\", \"Loop grande, hash de senha custoso, processar imagem no mesmo processo\", \"O event loop trava, nenhuma outra requisição é atendida enquanto isso roda\", \"Uma rota lenta derruba o throughput de todas as outras\"], [\"Chamada externa\", \"API de pagamento, envio de email, serviço de terceiro\", \"O Node espera a resposta de outro servidor pela rede\", \"O tempo de resposta varia junto com a saúde do serviço externo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Conectando com o que você já viu\n\nSe você lembra do problema de N+1 da trilha de banco de dados: buscar uma lista de pedidos e, para cada pedido, disparar uma query separada para buscar o cliente é exatamente esse tipo de gargalo. Uma única requisição HTTP acaba escondendo dezenas ou centenas de idas ao banco, e cada uma delas soma tempo de rede e de disco.\n\nO mesmo vale para índice: uma tabela de pedidos com um milhão de linhas e uma busca por cliente_id sem índice obriga o banco a varrer a tabela inteira. Isso não é culpa do Node, é o banco fazendo um trabalho muito maior do que precisava."
                    },
                    {
                        "type": "quote",
                        "value": "Performance não é sobre deixar tudo instantâneo. É sobre saber, com precisão, para onde o tempo da sua requisição está indo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma rota fica cada vez mais lenta conforme a quantidade de produtos no banco cresce, mesmo sem nenhum loop pesado no código Node. Qual é a causa mais provável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O event loop está travado por um cálculo síncrono que fica pesado a cada produto",
                                "isCorrect": false
                            },
                            {
                                "text": "A memória RAM do servidor se esgota conforme a tabela de produtos cresce",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma query ao banco sem índice adequado, que fica mais lenta conforme a tabela cresce",
                                "isCorrect": true
                            },
                            {
                                "text": "O rate limit da API é acionado mais cedo quando há mais produtos cadastrados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza trabalho bloqueante síncrono numa API Node.js?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele sempre consome mais memória RAM do que uma operação assíncrona equivalente",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele ocupa o processo sem devolver o controle, e nada mais roda enquanto isso",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele só pode acontecer dentro de chamadas de rede feitas ao banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é movido automaticamente pelo Node para rodar numa thread separada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint que consulta uma API de pagamentos de terceiros está deixando toda a aplicação lenta nos horários de pico, mesmo com o banco de dados respondendo rápido. Qual é a natureza mais provável desse gargalo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta de índice numa tabela consultada com frequência por esse endpoint",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cálculo pesado em JavaScript travando o event loop do processo Node",
                                "isCorrect": false
                            },
                            {
                                "text": "Memória demais alocada para o cache de sessão dos usuários ativos",
                                "isCorrect": false
                            },
                            {
                                "text": "I/O de rede: o Node espera a resposta de um serviço externo que não controla",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Ao revisar os logs, o time percebe que uma rota de listagem de pedidos faz uma query para buscar os pedidos e, em seguida, uma query adicional para cada pedido para buscar o cliente associado. Isso é um exemplo de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "N+1: o número de idas ao banco cresce junto com o tamanho da lista",
                                "isCorrect": true
                            },
                            {
                                "text": "Cache stampede: muitos misses de cache batendo no banco ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloqueio do event loop: trabalho síncrono pesado dentro dessa rota",
                                "isCorrect": false
                            },
                            {
                                "text": "Vazamento de conexão: conexões com o banco que nunca são fechadas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe troca o servidor de aplicação por uma máquina com CPU bem mais rápida para tentar resolver a lentidão de uma rota, mas o tempo de resposta quase não muda. Ao medir, descobrem que quase todo o tempo da rota é gasto esperando a resposta de uma query no banco. Por que trocar a CPU não ajudou?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o Node.js não aproveita bem os recursos de CPUs mais modernas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o gargalo é a espera de I/O do banco, não a CPU do servidor",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o gargalo real era o event loop travado pelo JavaScript da rota",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque trocar de servidor exige reconstruir os índices de todas as tabelas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Latência e throughput",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Latência e throughput: duas métricas, dois problemas diferentes\n\nDepois de entender onde o tempo se perde, o próximo passo é aprender a falar sobre performance com precisão. Duas palavras aparecem o tempo todo nesse assunto e não são sinônimas:\n\n- **Latência**: quanto tempo UMA requisição leva, do momento em que ela chega até o momento em que a resposta sai. Medida em milissegundos, é o tempo de uma viagem só.\n- **Throughput**: quantas requisições o sistema consegue processar num intervalo de tempo, normalmente medido em requisições por segundo. É a capacidade do sistema como um todo, não de uma requisição isolada."
                    },
                    {
                        "type": "text",
                        "value": "## Por que os dois importam\n\nUm sistema pode ter latência baixa e throughput baixo: cada requisição individual é rápida, mas o sistema não aguenta muita gente ao mesmo tempo (por exemplo, porque só processa uma requisição de cada vez, ou porque o banco tem poucas conexões disponíveis).\n\nTambém pode acontecer o contrário: um sistema com throughput alto, processando um volume grande de requisições por segundo, mas cada uma delas demorando mais para voltar, porque está competindo por recursos com todas as outras rodando ao mesmo tempo.\n\nNenhuma das duas métricas sozinha conta a história inteira. Uma API de uso interno, com poucos usuários, pode viver bem com throughput baixo desde que a latência seja boa. Já uma API pública com milhares de usuários simultâneos precisa de throughput alto, mesmo que isso signifique aceitar uma latência um pouco maior por requisição."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Métrica\", \"O que mede\", \"Pergunta que responde\", \"Unidade comum\"], [\"Latência\", \"O tempo de uma requisição isolada\", \"Quanto tempo esse usuário esperou pela resposta?\", \"milissegundos (ms)\"], [\"Throughput\", \"A capacidade do sistema de processar volume\", \"Quantas requisições o sistema aguenta por segundo?\", \"requisições por segundo (req/s)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off: quando melhorar um piora o outro\n\nLatência e throughput às vezes competem entre si. Dois exemplos comuns:\n\n- **Processar em lote (batch)**: agrupar várias operações e processá-las juntas de tempos em tempos reduz a carga no banco e pode aumentar o throughput total, mas cada item individual passa a esperar até o próximo lote ser processado, o que aumenta a latência dele.\n- **Concorrência disputando recursos**: aumentar quantas requisições rodam ao mesmo tempo pode elevar o throughput, mas se todas competem pelas mesmas conexões de banco ou pelo mesmo CPU, cada requisição individual pode ficar um pouco mais lenta.\n\nNão existe uma resposta única sobre qual métrica priorizar. Depende do que o produto precisa: um endpoint de checkout provavelmente prioriza latência baixa (ninguém quer esperar para pagar), enquanto um endpoint de importação em massa de dados pode aceitar mais latência por item em troca de mais throughput total."
                    },
                    {
                        "type": "code",
                        "value": "function delay(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms));\n}\n\napp.get('/produtos/:id', async (req, res) => {\n  const inicio = Date.now();\n\n  // simula uma consulta ao banco que demora 200ms\n  await delay(200);\n  const produto = { id: req.params.id, nome: 'Teclado mecânico' };\n\n  console.log(`Latência dessa requisição: ${Date.now() - inicio}ms`);\n  res.json(produto);\n});\n\n// A latência dessa rota fica sempre por volta de 200ms.\n// Mas como o tempo é gasto esperando (I/O), o processo Node fica livre\n// para atender outras requisições enquanto espera, e o throughput\n// pode ser bem maior do que '1 requisição a cada 200ms'."
                    },
                    {
                        "type": "text",
                        "value": "## Throughput não é só \"quantos núcleos de CPU eu tenho\"\n\nNum servidor tradicional que usa uma thread por requisição, o throughput fica bem próximo de 1 dividido pela latência, multiplicado pelo número de threads disponíveis. Mas o Node.js funciona diferente: como ele é single-threaded e usa um event loop, uma requisição que está esperando I/O (banco, rede, disco) não ocupa o processo enquanto espera.\n\nIsso quer dizer que uma rota com latência de 200ms, se esse tempo é quase todo I/O, pode ter um throughput muito maior do que 5 requisições por segundo (1000ms dividido por 200ms). Dezenas de requisições podem estar \"em voo\" ao mesmo tempo, todas esperando suas respectivas respostas de I/O em paralelo. Já se aqueles 200ms fossem CPU pura, um cálculo pesado, por exemplo, aí sim o throughput ficaria travado perto de 5 requisições por segundo, porque o processo só consegue fazer uma coisa de cada vez."
                    },
                    {
                        "type": "quote",
                        "value": "Latência é a experiência de uma pessoa. Throughput é a capacidade do sistema de sustentar essa experiência boa com muita gente ao mesmo tempo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a latência de uma requisição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A quantidade de requisições que o servidor processa a cada segundo",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de memória usada para processar aquela requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de queries ao banco feitas durante aquela requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo entre o envio da requisição e o recebimento da resposta",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que é throughput?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tempo médio de resposta de uma rota específica da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de dados retornada dentro de uma resposta única",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas requisições o sistema consegue processar num intervalo de tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "O número de usuários autenticados na aplicação ao mesmo tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API responde cada requisição em 50ms (latência baixa), mas quando 200 usuários acessam ao mesmo tempo, o servidor começa a enfileirar pedidos e o tempo de resposta sobe bastante. O que esse cenário mostra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Latência baixa não garante throughput alto: pode não aguentar muita gente junta",
                                "isCorrect": true
                            },
                            {
                                "text": "O gargalo está sempre no banco de dados sempre que o tempo de resposta sobe",
                                "isCorrect": false
                            },
                            {
                                "text": "Latência e throughput são na verdade a mesma métrica em formas diferentes",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o TTL do cache seria a única forma de resolver essa situação toda",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide agrupar pedidos e processá-los em lote a cada 5 segundos, em vez de processar cada um assim que chega, para reduzir a carga no banco. O que provavelmente acontece com a latência de um pedido individual?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cai para perto de zero, porque o lote inteiro é processado de uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Tende a aumentar, porque o pedido espera até o próximo lote ser processado",
                                "isCorrect": true
                            },
                            {
                                "text": "Não muda em nada, já que o lote afeta somente o throughput do sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Cai junto com o throughput, pois os dois sempre andam na mesma direção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota tem latência média de 100ms rodando num único processo Node.js, e faz apenas I/O (aguardando o banco) durante quase todo esse tempo. Por que o throughput desse servidor pode ser bem maior que 10 requisições por segundo, a conta simples de 1000ms dividido por 100ms?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o Node cria uma thread nova do sistema para cada requisição recebida",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a latência medida é sempre menor do que a reportada pelo servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque durante a espera de I/O o event loop atende outras requisições",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque throughput e latência não guardam relação matemática entre si",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Percentis: p50, p95, p99 e por que a média engana",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A régua do usuário\n\nDepois de medir latência e throughput, surge a pergunta natural: qual número representa a experiência real de quem usa o sistema? A resposta mais comum, e mais enganosa, costuma ser \"a latência média\". Só que a média raramente é a régua certa para medir experiência do usuário."
                    },
                    {
                        "type": "text",
                        "value": "## Por que a média engana\n\nImagine uma rota que atende 100 requisições. 99 delas respondem em 50ms, e 1 responde em 5000ms porque bateu numa query lenta. A média fica assim: (99 × 50 + 5000) dividido por 100, por volta de 99,5ms. Esse número não representa nem a experiência da maioria (que foi de 50ms) nem a experiência de quem teve o problema real (5000ms). A média mistura tudo e entrega um valor que não é a experiência de ninguém.\n\nPior: a média pode parecer ótima mesmo quando uma fatia real de usuários está tendo uma experiência péssima, porque os poucos casos muito lentos ficam diluídos entre muitos casos rápidos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Métrica\", \"O que ela responde\", \"Limitação ou força\"], [\"Média\", \"Qual é o tempo somando tudo e dividindo pela quantidade\", \"Poucas requisições muito lentas distorcem o número, e ele não diz quantos usuários tiveram experiência ruim\"], [\"p50 (mediana)\", \"Metade das requisições foi mais rápida que esse valor\", \"Retrata bem o caso comum, mas esconde totalmente a cauda lenta\"], [\"p95\", \"95% das requisições foram mais rápidas que esse valor\", \"Já revela parte da cauda, mais realista que a média para achar problemas\"], [\"p99\", \"99% das requisições foram mais rápidas que esse valor, só 1% foi pior\", \"Mostra o pior caso relevante; em escala, 1% pode ser milhares de usuários\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que são p50, p95 e p99, de verdade\n\nPercentil é só uma forma de ordenar as medições e perguntar: \"que valor separa os X% mais rápidos do resto?\".\n\n- **p50** (mediana): ordene todas as latências medidas, pegue a do meio. Metade das requisições foi mais rápida que esse número, metade foi mais lenta.\n- **p95**: o valor abaixo do qual estão 95% das requisições. Só 5% foram mais lentas que ele.\n- **p99**: o valor abaixo do qual estão 99% das requisições. Apenas 1% foi mais lenta que ele, mas esse 1% é a experiência real de uma fatia de usuários, não é um erro de medição nem um caso raro demais para importar."
                    },
                    {
                        "type": "code",
                        "value": "function calcularPercentil(latencias, percentil) {\n  const ordenadas = [...latencias].sort((a, b) => a - b);\n  const indice = Math.ceil((percentil / 100) * ordenadas.length) - 1;\n  return ordenadas[indice];\n}\n\nconst latencias = [];\nfor (let i = 0; i < 98; i++) {\n  latencias.push(45 + Math.floor(Math.random() * 10)); // maioria: 45-54ms\n}\nlatencias.push(480, 520); // duas requisições que esbarraram numa query lenta\n\nconsole.log('p50:', calcularPercentil(latencias, 50)); // continua baixo\nconsole.log('p95:', calcularPercentil(latencias, 95)); // ainda baixo, a maioria é rápida\nconsole.log('p99:', calcularPercentil(latencias, 99)); // aqui a cauda lenta aparece"
                    },
                    {
                        "type": "text",
                        "value": "## O p99 é a experiência do pior caso, e ela acontece bastante\n\nEm uma aplicação pequena, com poucas requisições por dia, um p99 ruim pode parecer irrelevante. O problema é que a maioria dos sistemas em produção não trabalha com poucas requisições. Se uma API recebe 1 milhão de requisições por dia e o p99 é de 3 segundos, isso significa cerca de 10 mil requisições por dia (1% do total) demorando 3 segundos ou mais. Dez mil experiências ruins por dia não é um caso raro, é rotina para uma fatia real de usuários, todo santo dia.\n\nE tem outro detalhe: um usuário costuma fazer várias requisições numa sessão (abrir a página, carregar o carrinho, finalizar a compra). Quanto mais requisições ele faz, maior a chance de pelo menos uma delas cair na cauda lenta do p99. Por isso o p99 importa tanto quanto, às vezes mais que, a média ou o p50."
                    },
                    {
                        "type": "quote",
                        "value": "A média conta uma história confortável. O p99 conta a história de quem teve a pior experiência, e essa pessoa existe de verdade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que o p95 de latência de uma rota é 200ms?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A requisição mais lenta registrada demorou 95% de 200ms para responder",
                                "isCorrect": false
                            },
                            {
                                "text": "95% das requisições foram respondidas em 200ms ou menos nesse período",
                                "isCorrect": true
                            },
                            {
                                "text": "Em média, a rota leva cerca de 200ms para responder às requisições",
                                "isCorrect": false
                            },
                            {
                                "text": "95% das requisições demoraram mais do que 200ms para responder",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a latência média pode enganar quem está avaliando a experiência do usuário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a média é sempre igual à mediana em qualquer conjunto de medições",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a média só faz sentido em sistemas com pouquíssimos usuários",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a média se aplica só a valores monetários, nunca a tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque poucas requisições muito lentas distorcem o valor e escondem a cauda",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O time de uma API vê que a latência média das últimas 24 horas é de 80ms e comemora, mas o suporte continua recebendo reclamações de lentidão. Ao olhar o p99, descobrem que ele está em 4 segundos. O que isso indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O valor do p99 está errado, pois nunca pode ficar acima da média medida",
                                "isCorrect": false
                            },
                            {
                                "text": "As reclamações do suporte não têm relação com o tempo de resposta da API",
                                "isCorrect": false
                            },
                            {
                                "text": "Existe uma fatia pequena mas real de requisições lentas que a média esconde",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma média de 80ms já garante que nenhum usuário teve experiência ruim",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma recebe 1 milhão de requisições por dia num endpoint, e o p99 de latência desse endpoint é 3 segundos. Aproximadamente quantas requisições por dia tiveram 3 segundos ou mais de latência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cerca de 10 mil, ou seja, 1% de 1 milhão",
                                "isCorrect": true
                            },
                            {
                                "text": "Cerca de 100, ou seja, 0,01% de 1 milhão",
                                "isCorrect": false
                            },
                            {
                                "text": "Cerca de 1 mil, ou seja, 0,1% de 1 milhão",
                                "isCorrect": false
                            },
                            {
                                "text": "Cerca de 100 mil, ou seja, 10% de 1 milhão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe investe bastante tempo de engenharia otimizando o p50 de uma rota que já respondia em 20ms, enquanto o p99 continua em 5 segundos por causa de uma query sem índice que só afeta consultas com muitos filtros. Do ponto de vista da experiência do usuário, qual é o problema dessa priorização?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhum, pois o p50 é sempre a métrica mais importante em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "O p99 alto não importa muito, porque atinge só requisições raras e isoladas",
                                "isCorrect": false
                            },
                            {
                                "text": "Melhorar o p50 sempre reduz o p99 na mesma proporção, então estava certo",
                                "isCorrect": false
                            },
                            {
                                "text": "Otimizar um p50 já bom rende pouco, e o p99 alto segue afetando usuários",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Meça antes de otimizar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Meça antes de otimizar\n\nDepois de saber o que costuma deixar um back-end lento e como enxergar a experiência real dos usuários com percentis, chega a pergunta prática: como descobrir, numa aplicação específica, onde o tempo está realmente sendo gasto? A resposta curta é: medindo. A resposta longa é o resto desta aula."
                    },
                    {
                        "type": "text",
                        "value": "## O perigo do achismo\n\nÉ extremamente comum um desenvolvedor \"sentir\" que sabe onde está o problema de performance. \"Deve ser a serialização do JSON\", \"deve ser aquele forEach\", \"deve ser o middleware de autenticação\". Às vezes o palpite acerta. Na maioria das vezes, não.\n\nExiste uma frase famosa do cientista da computação Donald Knuth, escrita ainda nos anos 1970, dizendo que otimização prematura é a raiz de todo mal em programação. Ele não estava dizendo para nunca se preocupar com performance, estava avisando sobre o hábito de otimizar partes do código só porque parecem lentas, sem antes medir se são de fato o problema. O resultado costuma ser código mais complexo, tempo de engenharia gasto, e o gargalo real continuando lá, intocado."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/relatorio', async (req, res) => {\n  console.time('relatorio-total');\n\n  console.time('buscar-pedidos');\n  const pedidos = await db.query('SELECT * FROM pedidos WHERE status = $1', ['pago']);\n  console.timeEnd('buscar-pedidos');\n\n  console.time('montar-resposta');\n  const resposta = pedidos.rows.map(formatarPedido);\n  console.timeEnd('montar-resposta');\n\n  console.timeEnd('relatorio-total');\n  res.json(resposta);\n});\n\n// Saída no terminal, por exemplo:\n// buscar-pedidos: 812.441ms\n// montar-resposta: 3.128ms\n// relatorio-total: 816.209ms\n//\n// Sem medir cada etapa separadamente, seria fácil suspeitar do 'map' que\n// monta a resposta. Medindo, fica claro que o tempo está quase todo na query."
                    },
                    {
                        "type": "code",
                        "value": "function medirDuracao(req, res, next) {\n  const inicio = Date.now();\n\n  res.on('finish', () => {\n    const duracao = Date.now() - inicio;\n    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duracao}ms`);\n  });\n\n  next();\n}\n\napp.use(medirDuracao);\n\n// Esse middleware loga a duração de TODA requisição que passa pela aplicação,\n// sem precisar espalhar console.time em cada rota manualmente. É o primeiro\n// passo para começar a enxergar, com dados reais, quais rotas merecem atenção."
                    },
                    {
                        "type": "text",
                        "value": "## Profiler: uma lupa mais precisa\n\nconsole.time e um middleware de duração já resolvem boa parte dos casos: eles mostram qual rota, ou qual trecho marcado manualmente, está lento. Mas às vezes o problema está espalhado dentro de uma função complexa, ou numa dependência que você nem cogitou medir.\n\nPara esses casos existe a ideia de profiler: uma ferramenta que observa a execução do programa e mostra, função por função, quanto tempo foi gasto em cada uma, sem você precisar adivinhar onde colocar um console.time. O próprio Node.js tem um profiler embutido (a flag `--prof`), e existem ferramentas como o Chrome DevTools conectado via `node --inspect`, ou pacotes como o clinic.js, que geram um relatório visual de onde o tempo da CPU foi parar. Não é algo que você vai usar toda hora, mas é bom saber que existe quando console.time não é preciso o suficiente."
                    },
                    {
                        "type": "text",
                        "value": "## Medir não é frescura, é o que separa engenharia de achismo\n\nToda otimização de performance de verdade começa com uma medição, não com uma suspeita. Isso vale para uma rota que parece lenta, para uma query que \"deve\" estar demorando, para qualquer mudança que alguém queira fazer \"para melhorar a performance\". Sem número antes e depois, não dá nem para saber se a mudança ajudou."
                    },
                    {
                        "type": "quote",
                        "value": "Sem medir, otimizar é só adivinhar, e o achismo raramente acerta onde o tempo realmente está sendo gasto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal risco de otimizar uma rota sem antes medir onde o tempo está sendo gasto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Otimizar uma parte que não é o gargalo real, e o problema verdadeiro continua",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixar o código rápido demais para o servidor conseguir acompanhar as respostas",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer o Node.js recusar a execução de código que não foi medido antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer o console.time parar de funcionar após algumas chamadas seguidas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a função console.timeEnd faz em Node.js?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pausa a execução do código até que um tempo definido tenha se passado",
                                "isCorrect": false
                            },
                            {
                                "text": "Encerra o servidor Express de forma segura ao final da medição",
                                "isCorrect": false
                            },
                            {
                                "text": "Imprime o tempo decorrido desde o console.time com o mesmo rótulo",
                                "isCorrect": true
                            },
                            {
                                "text": "Mede quanta memória RAM o processo Node está usando naquele momento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sem medir nada, um desenvolvedor assume que a serialização do JSON de resposta é o motivo da lentidão de uma rota e passa dois dias otimizando essa parte. Depois, usando console.time em cada etapa, descobre que 95% do tempo estava numa query sem índice. O que esse caso ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a serialização de JSON costuma ser o gargalo principal de APIs Node.js",
                                "isCorrect": false
                            },
                            {
                                "text": "O perigo do achismo: sem medir, o esforço vai parar no lugar errado",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o console.time não deveria ser usado fora de um ambiente de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Que otimizar qualquer trecho do código sempre traz algum ganho de tempo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware de log de duração mostra que a rota GET /produtos responde em 15ms na maioria das vezes, mas o time recebe reclamações de lentidão nessa rota. Considerando o que você aprendeu sobre percentis, qual é uma explicação plausível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reclamações de usuários não têm relação com o tempo de resposta de uma API",
                                "isCorrect": false
                            },
                            {
                                "text": "O middleware tem um bug, pois toda requisição deveria levar o mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "15ms já é lento o bastante para gerar reclamações, não há o que investigar",
                                "isCorrect": false
                            },
                            {
                                "text": "15ms é o caso comum (p50), mas pode haver uma cauda lenta no p95 ou p99",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe considera investir num profiler (como o --prof do Node ou o clinic.js) em vez de continuar espalhando console.time pelo código. Em qual cenário essa troca faz mais sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Quando o gargalo não aparece nem medindo os trechos óbvios, e é preciso ver função a função",
                                "isCorrect": true
                            },
                            {
                                "text": "Quando o time já sabe exatamente qual linha específica do código está causando a lentidão",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando a rota já está rápida o suficiente e não sobrou mais nada para ser investigado",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando basta medir apenas o tempo total da requisição, sem detalhar nada do seu interior",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Achando o gargalo: o ciclo da otimização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O ciclo: medir, achar o gargalo, otimizar, medir de novo\n\nTudo que você viu neste módulo se junta numa disciplina só, que vai se repetir em cada módulo desta trilha, com uma técnica diferente (cache, fila, escala): primeiro mede, depois acha o gargalo real, só então otimiza, e mede de novo para confirmar. Pular a primeira medição transforma qualquer otimização em achismo, não importa quão experiente seja quem está escrevendo o código."
                    },
                    {
                        "type": "text",
                        "value": "## Onde os gargalos costumam estar, na prática\n\nDepois de medir muitas aplicações Node.js em produção, um padrão se repete: a esmagadora maioria dos gargalos vem de duas fontes.\n\n- **O banco de dados**: query sem índice, N+1, buscar colunas ou linhas demais quando só uma parte é necessária.\n- **Trabalho síncrono pesado dentro da requisição**: cálculo caro, processamento de arquivo, qualquer coisa que ocupe o processo Node sem devolver o controle.\n\nChamadas a serviços externos aparecem também, mas costumam ser mais fáceis de apontar (o time sabe que aquela integração é lenta) do que o banco, que esconde queries ruins atrás de um await inocente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Métrica (exemplo hipotético, lista com 50 pedidos)\", \"Antes (N+1)\", \"Depois (uma query só)\"], [\"Queries ao banco\", \"51 queries (1 + 50)\", \"1 query\"], [\"p50\", \"180ms\", \"12ms\"], [\"p99\", \"900ms\", \"40ms\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// ANTES: uma query para os pedidos, mais uma query por pedido (N+1)\nasync function buscarPedidosComCliente() {\n  const pedidos = await db.query('SELECT * FROM pedidos');\n\n  for (const pedido of pedidos.rows) {\n    const cliente = await db.query(\n      'SELECT * FROM clientes WHERE id = $1',\n      [pedido.cliente_id]\n    );\n    pedido.cliente = cliente.rows[0];\n  }\n\n  return pedidos.rows;\n}\n\n// DEPOIS: uma única query, trazendo pedido e cliente juntos com JOIN\nasync function buscarPedidosComCliente() {\n  const resultado = await db.query(`\n    SELECT pedidos.*, clientes.nome AS cliente_nome, clientes.email AS cliente_email\n    FROM pedidos\n    JOIN clientes ON clientes.id = pedidos.cliente_id\n  `);\n\n  return resultado.rows;\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Depois de otimizar, meça de novo\n\nTrocar o N+1 por uma única query com JOIN não é o fim do ciclo, é só uma volta dele. Medir de novo depois da mudança serve para duas coisas:\n\n1. **Confirmar que a otimização realmente funcionou**, com número antes e depois, não com a sensação de que \"ficou mais rápido\".\n2. **Descobrir qual é o próximo gargalo**. Depois de resolver o N+1, o tempo que sobrar vai estar concentrado em outra coisa (talvez a formatação da resposta, talvez outra query, talvez uma chamada externa). Sem medir de novo, esse próximo gargalo fica escondido atrás do que você acabou de arrumar."
                    },
                    {
                        "type": "text",
                        "value": "## Nunca pule a primeira medição\n\nVale reforçar o que amarra este módulo inteiro: performance importa porque afeta gente de verdade e custa dinheiro de verdade; latência e throughput são métricas diferentes e às vezes competem entre si; a média mente, o p99 é onde mora a experiência de quem está tendo o pior caso; e nada disso serve de nada se a otimização não começar pela medição.\n\nNos próximos módulos desta trilha você vai aprender técnicas concretas, cache sendo a primeira delas, para atacar os gargalos que você aprendeu a encontrar aqui. Mas nenhuma técnica substitui medir antes de otimizar. Uma equipe que cacheia a coisa errada, ou que enfileira um trabalho que nunca foi o gargalo, só está trocando um achismo por outro, com mais complexidade no meio do caminho."
                    },
                    {
                        "type": "quote",
                        "value": "Medir, achar o gargalo, otimizar, medir de novo. Pule a primeira medição e todo o resto vira achismo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ordem correta do ciclo de otimização de performance apresentado neste módulo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Otimizar, medir, achar o gargalo e por fim otimizar mais uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Medir, achar o gargalo, otimizar e então medir de novo",
                                "isCorrect": true
                            },
                            {
                                "text": "Achar o gargalo, otimizar, medir e publicar direto em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Medir, publicar em produção, otimizar e então medir de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é importante medir de novo depois de aplicar uma otimização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para confirmar que a mudança melhorou o tempo e achar o próximo gargalo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o código para de funcionar se não for medido novamente depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Node.js exige uma nova medição registrada a cada deploy feito",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque medir de novo dispensa a necessidade de testar o código alterado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de trocar uma query com N+1 por uma única query com JOIN, uma rota que respondia em 180ms no p50 passa a responder em 12ms. Mas o p99 continua alto, em 800ms. O que o time deveria fazer a seguir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Parar por aqui, porque o p50 já melhorou bastante e costuma ser suficiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Assumir que esse p99 alto é normal e que não há como investigá-lo melhor",
                                "isCorrect": false
                            },
                            {
                                "text": "Refazer a mesma otimização de N+1 numa outra rota que não tem o problema",
                                "isCorrect": false
                            },
                            {
                                "text": "Medir de novo para achar o novo gargalo que está mantendo o p99 alto",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de listagem faz 1 query para buscar pedidos e, para cada pedido, mais uma query para buscar os itens daquele pedido. Com 200 pedidos na lista, isso gera 201 queries numa única requisição HTTP. Qual é o nome desse padrão problemático e qual é a estratégia mais direta para resolvê-lo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cache stampede, resolvido diminuindo o TTL das chaves de cache da rota",
                                "isCorrect": false
                            },
                            {
                                "text": "Vazamento de memória, resolvido reiniciando o servidor de tempos em tempos",
                                "isCorrect": false
                            },
                            {
                                "text": "N+1, resolvido buscando os itens de todos os pedidos numa query só com JOIN",
                                "isCorrect": true
                            },
                            {
                                "text": "Estouro de rate limit, resolvido aumentando o limite de requisições da API",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de otimizar a query mais lenta de uma rota, o time percebe que o p99 caiu de 900ms para 300ms, mas ainda está bem acima do p50, que é 15ms. Investigando com um middleware de duração, descobrem que as requisições mais lentas são justamente aquelas que, além da query já otimizada, também chamam uma API de frete de um parceiro externo. O que essa investigação demonstra sobre o ciclo de otimização?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a otimização da query não funcionou, já que o p99 ainda continua elevado",
                                "isCorrect": false
                            },
                            {
                                "text": "Que resolver um gargalo não elimina os outros, e o ciclo de medir continua",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o p99 pode ser ignorado a partir daqui, porque já caiu bastante do início",
                                "isCorrect": false
                            },
                            {
                                "text": "Que uma chamada a API externa nunca afeta o p99, apenas o banco de dados afeta",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Cache: a arte de não repetir trabalho",
        "aulas": [
            {
                "titulo": "O que é cache e por que ele acelera tudo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é cache e por que ele acelera tudo\n\nLá no Módulo 1 você aprendeu a medir antes de otimizar: rodar o profiler, olhar o p95 da rota, achar o gargalo. Na maioria das APIs esse gargalo tem o mesmo motivo: uma consulta pesada no banco, uma agregação cara, uma chamada para um serviço externo. O trabalho é feito, a resposta sai correta, só que ele é refeito do zero a cada requisição, mesmo quando o resultado seria exatamente o mesmo de segundos atrás.\n\nCache resolve exatamente esse desperdício: guardar o resultado de um trabalho caro em algum lugar rápido de consultar, para reusar em vez de recalcular ou rebuscar toda vez."
                    },
                    {
                        "type": "text",
                        "value": "## A ideia central\n\nCache é, no fundo, uma cópia temporária de uma resposta pronta. Em vez de refazer todo o trabalho toda vez que alguém pergunta algo, o sistema pergunta primeiro: esse resultado já foi calculado há pouco? Se sim, usa na hora. Se não, aí sim faz o trabalho, mas guarda o resultado para a próxima pergunta igual.\n\nRepare que cache não muda o que a resposta é, só muda de onde ela vem. A resposta de uma rota com cache deveria ser a mesma resposta que ela daria sem cache, só que mais rápido."
                    },
                    {
                        "type": "text",
                        "value": "## A analogia da conta já feita\n\nPense numa multiplicação chata de cabeça, tipo 47 vezes 83. Na primeira vez você para, faz a conta e chega em 3901. Se alguém perguntar de novo um minuto depois, você não vai refazer a conta: vai lembrar (ou olhar o que anotou) e responder na hora.\n\nUm sistema sem cache é alguém que refaz a conta inteira toda vez que é perguntado, mesmo já sabendo a resposta. Um sistema com cache anota o resultado na primeira vez e só relê depois, enquanto essa anotação ainda vale."
                    },
                    {
                        "type": "code",
                        "value": "function calcularRelatorioPesado() {\n  let soma = 0;\n  for (let i = 0; i < 1e9; i++) {\n    soma += i % 7;\n  }\n  return soma;\n}\n\nconst cache = new Map();\n\nfunction getRelatorio(chave) {\n  if (cache.has(chave)) {\n    return cache.get(chave);\n  }\n\n  const resultado = calcularRelatorioPesado();\n  cache.set(chave, resultado);\n  return resultado;\n}\n\nconsole.time('primeira chamada');\ngetRelatorio('relatorio-mensal');\nconsole.timeEnd('primeira chamada'); // caro, o trabalho é feito de verdade\n\nconsole.time('segunda chamada');\ngetRelatorio('relatorio-mensal');\nconsole.timeEnd('segunda chamada'); // quase 0ms, só leu do Map"
                    },
                    {
                        "type": "text",
                        "value": "## De onde vem o custo que o cache economiza\n\nO trabalho caro que vale a pena cachear costuma vir de um destes lugares:\n\n- **Consulta pesada ao banco.** Um join complexo ou uma agregação (`COUNT`, `SUM`, `GROUP BY` em muita linha).\n- **Chamada a uma API externa.** Depende de rede e do tempo de resposta de outro serviço.\n- **Cálculo pesado na própria aplicação.** Montar um relatório, formatar um payload grande.\n- **Muitas consultas somadas, o N+1.** Aquele problema que você aprendeu a evitar na trilha de banco: mesmo depois de otimizado, se o total ainda é caro e o resultado se repete entre requisições, cachear o resultado final evita pagar esse custo de novo a cada chamada.\n\nCache não substitui um índice ruim nem resolve um N+1 por conta própria, mas evita pagar de novo por um trabalho que já foi bem feito uma vez."
                    },
                    {
                        "type": "quote",
                        "value": "Cache não é mágica: é memória de trabalho já feito. A pergunta que ele responde não é 'como faço isso mais rápido', e sim 'eu preciso mesmo fazer isso de novo?'"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ideia central por trás de um cache?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar o resultado de um trabalho caro para reusar depois, evitando refazer o mesmo trabalho a cada vez",
                                "isCorrect": true
                            },
                            {
                                "text": "Comprimir os dados antes de enviá-los ao cliente, reduzindo o tamanho de cada resposta que trafega na rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Reescrever as consultas enviadas ao banco de dados para que ele consiga executá-las mais rápido internamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Separar a lógica de negócio em funções menores e reutilizáveis, deixando o código do projeto mais curto de ler",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota recalcula do zero, a cada requisição, uma lista de categorias que só muda quando um administrador cria uma categoria nova (algo raro). Sem alterar o que o cliente recebe, qual é o ganho esperado ao colocar cache nessa rota?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A lista de categorias passa a ser recalculada com mais frequência, ficando sempre mais atual que o próprio banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Respostas mais rápidas na maioria das requisições, porque montar a lista deixa de ser refeito a cada chamada",
                                "isCorrect": true
                            },
                            {
                                "text": "O endpoint passa a aceitar mais parâmetros de filtro na query, porque o cache amplia o alcance da rota",
                                "isCorrect": false
                            },
                            {
                                "text": "As validações do banco de dados ficam mais rígidas, porque o cache confere os dados antes de deixar gravar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de relatório mensal demora 4 segundos por causa de uma agregação pesada no banco. O relatório é igual para todos os usuários que o pedem no mesmo mês e é acessado centenas de vezes por dia. Depois de medir e confirmar que essa agregação é o gargalo (Módulo 1), qual ação está mais alinhada com a ideia de cache?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o tamanho da instância do banco de dados, para que a mesma agregação pesada rode em bem menos tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Quebrar a agregação pesada em várias consultas linha a linha, para distribuir o seu custo ao longo do tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o resultado da agregação já no primeiro cálculo e reutilizá-lo nas próximas chamadas, até precisar atualizar",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover a agregação da rota e devolver os dados brutos, deixando que o próprio cliente da API faça a soma do lado dele",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar o profiler e olhar o p95 de uma rota (Módulo 1), você percebe que o tempo é quase todo gasto numa chamada a uma API externa de cotação de frete, cujo valor muda a cada poucos minutos e é usado por várias requisições parecidas nesse intervalo. O que justifica cachear essa chamada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O valor é lido com frequência e é caro de buscar por rede, então guardá-lo por um tempo evita pagar esse custo toda vez",
                                "isCorrect": true
                            },
                            {
                                "text": "Chamadas a serviços externos nunca podem ser cacheadas, então a única saída é otimizar a camada de rede do servidor",
                                "isCorrect": false
                            },
                            {
                                "text": "O profiler do módulo anterior resolve o gargalo sozinho, então nenhuma mudança no código da rota chega a ser necessária",
                                "isCorrect": false
                            },
                            {
                                "text": "Cachear a chamada elimina de vez a necessidade de voltar a medir o p95 dessa rota lenta em qualquer momento futuro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint recebe dois números na query string e devolve a soma deles. Um desenvolvedor decide colocar um cache na frente desse endpoint, guardando a resposta por uma chave formada pelos dois números recebidos. Por que essa é provavelmente uma má aplicação de cache?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque cache só funciona em rotas que leem do banco de dados, e uma soma simples não chega a tocar no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque somar sempre gera um resultado diferente a cada vez, o que tornaria impossível guardar qualquer soma em cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque essa rota precisaria de autenticação obrigatória antes de qualquer uma das suas respostas poder ser cacheada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque somar é barato e os números variam a cada chamada, então o hit ratio fica baixo e o cache só adiciona complexidade",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Onde cachear: memória do processo x cache distribuído",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Onde cachear: memória do processo x cache distribuído\n\nDepois de decidir que vale a pena cachear alguma coisa, sobra a pergunta seguinte: cachear onde? As duas respostas mais comuns são bem diferentes entre si: guardar o dado na própria memória do processo Node, ou guardar num serviço de cache à parte, compartilhado por todos os processos."
                    },
                    {
                        "type": "text",
                        "value": "## Cache em memória do processo\n\nA forma mais simples de cache é uma variável: um objeto ou um `Map` guardado na memória do próprio processo Node, vivo enquanto o processo está de pé. O acesso é o mais rápido possível, porque não existe rede envolvida, é só ler uma posição de memória que já está ali.\n\nO problema aparece em duas situações comuns em produção: quando o processo reinicia (um novo deploy, um crash, um restart do container) o `Map` some inteiro e o cache volta a zero; e quando existe mais de uma instância da aplicação rodando ao mesmo tempo, cada uma tem a sua própria cópia, isolada das outras."
                    },
                    {
                        "type": "code",
                        "value": "const cacheDeCategorias = new Map();\n\napp.get('/categorias', async (req, res) => {\n  if (cacheDeCategorias.has('todas')) {\n    return res.json(cacheDeCategorias.get('todas'));\n  }\n\n  const categorias = await prisma.categoria.findMany();\n  cacheDeCategorias.set('todas', categorias);\n\n  res.json(categorias);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O problema de ter mais de um servidor\n\nImagine essa mesma rota rodando atrás de um load balancer, com 3 instâncias do processo Node (o cenário que você vai ver com mais detalhe no Módulo 7, sobre escalar). O load balancer manda cada requisição para uma instância qualquer, sem saber nada sobre cache.\n\nA primeira requisição cai na instância A, que não tem nada guardado: miss, busca no banco, guarda no seu próprio `Map`. A segunda requisição cai na instância B, que nunca viu esse pedido: miss de novo, mesmo o dado já estando guardado na instância A. Na prática, com 3 instâncias, cada uma enxerga só uma fatia das requisições, e o hit ratio geral do sistema fica bem pior do que seria com um único cache compartilhado.\n\nÉ o mesmo tipo de problema que motivou deixar a autenticação sem estado com JWT: guardar sessão na memória de um servidor só quebra assim que existe mais de uma instância. Cache em memória do processo tem essa mesma limitação, só que o efeito colateral é performance ruim em vez de usuário deslogado."
                    },
                    {
                        "type": "text",
                        "value": "## Cache distribuído\n\nA alternativa é tirar o cache de dentro do processo e colocar num serviço à parte, compartilhado por todas as instâncias da aplicação. Redis é o exemplo mais comum disso (você vai usá-lo de verdade a partir do Módulo 3), mas a ideia vale para qualquer cache distribuído: existe um serviço rodando separado da aplicação, e todas as instâncias falam com ele pela rede.\n\nIsso custa uma coisa que o cache em memória não custa, que é o tempo de ida e volta pela rede até o serviço de cache. Ainda assim, esse tempo costuma ser muito menor do que o de uma consulta pesada no banco, e a vantagem de compartilhar o mesmo cache entre todas as instâncias geralmente compensa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Memória do processo\", \"Cache distribuído\"], [\"Velocidade de acesso\", \"Muito rápida, sem rede envolvida\", \"Rápida, mas paga uma ida e volta pela rede\"], [\"Sobrevive a reiniciar o processo\", \"Não, o cache some inteiro\", \"Sim, o serviço de cache continua no ar\"], [\"Compartilhado entre instâncias\", \"Não, cada instância tem sua própria cópia\", \"Sim, todas as instâncias enxergam o mesmo dado\"], [\"Exemplo típico\", \"Um Map ou objeto na aplicação\", \"Redis, Memcached\"], [\"Melhor cenário de uso\", \"Uma instância só, dado pequeno\", \"Vários servidores atrás de um load balancer\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Cache em memória do processo é rápido, mas é um segredo só daquela instância. Cache distribuído é um pouco mais lento por causa da rede, mas é a mesma verdade para todo mundo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece com um cache guardado em memória do processo (um Map, por exemplo) quando a aplicação reinicia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É perdido por completo, porque ele vivia na memória do processo que acabou de deixar de existir",
                                "isCorrect": true
                            },
                            {
                                "text": "Continua disponível, porque o Node grava o conteúdo do Map em disco de forma automática antes de sair",
                                "isCorrect": false
                            },
                            {
                                "text": "É migrado sozinho para a próxima instância que subir, sem que nenhuma entrada chegue a ser perdida",
                                "isCorrect": false
                            },
                            {
                                "text": "Só some se o TTL das entradas já tiver vencido bem antes de o reinício da aplicação acontecer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal vantagem de um cache distribuído (como o Redis) sobre um cache em memória do processo, quando a aplicação roda em várias instâncias?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele nunca expira as entradas, então o dado guardado jamais fica desatualizado em relação ao banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é compartilhado, então um dado guardado por uma instância fica disponível para todas as outras instâncias",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele é sempre mais rápido de acessar do que uma variável guardada na memória do próprio processo da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele dispensa a definição de TTL, porque o serviço de cache gerencia toda a validade das entradas sem prazos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API roda com 4 instâncias atrás de um load balancer e usa um Map na memória de cada processo para cachear a lista de categorias. O time percebe que o hit ratio observado nos logs é bem mais baixo do que o esperado para um dado que quase não muda. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O TTL das entradas está todo configurado em zero, então nenhuma entrada do cache chega a ser reaproveitada",
                                "isCorrect": false
                            },
                            {
                                "text": "Um Map na memória não consegue guardar arrays de objetos, então a lista de categorias nunca chega a ser armazenada",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada instância tem o seu próprio Map isolado, então o load balancer espalha as chamadas e cada uma só junta hits das que caem nela",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer manda todas as requisições sempre para uma mesma instância só, o que na verdade até deveria elevar o hit ratio geral do sistema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de aprender, na trilha de autenticação, por que sessão guardada na memória de um servidor só é um problema para escalar horizontalmente, um desenvolvedor pergunta se cache em memória do processo tem alguma relação com aquilo. Qual é a resposta mais correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não têm relação alguma: sessão é um problema de autenticação, e cache jamais lida com estado preso a uma instância",
                                "isCorrect": false
                            },
                            {
                                "text": "Têm relação, mas a conclusão certa a tirar disso é que cache em memória do processo deveria ser proibido em toda e qualquer aplicação nova",
                                "isCorrect": false
                            },
                            {
                                "text": "Não têm relação: o JWT sem estado que você já usou elimina por completo qualquer necessidade de manter um cache no sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Têm relação: ambos são estado preso a uma instância; sessão em memória quebra o login em outra, cache derruba o hit ratio com várias",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação roda hoje numa única instância, sem plano imediato de escalar horizontalmente. Ainda assim, um desenvolvedor decide usar um cache distribuído em vez de um Map em memória para cachear a lista de categorias. Qual é uma razão legítima para essa escolha, mesmo com uma instância só?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque um cache distribuído é sempre mais rápido de acessar do que uma variável guardada na memória do próprio processo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o cache sobrevive a reinícios do processo sem ser reconstruído do zero e já deixa a aplicação pronta para escalar depois",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque um Map na memória do processo só consegue guardar uma chave por vez, e a aplicação precisa de várias chaves de cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem um serviço de cache à parte rodando, a aplicação não teria como definir TTL para nenhuma das suas entradas",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que vale (e o que não vale) cachear",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que vale (e o que não vale) cachear\n\nNem tudo merece cache. Colocar cache em cima de qualquer rota, sem critério, adiciona complexidade (mais uma coisa para gerenciar, mais uma forma de mostrar dado errado) sem necessariamente trazer ganho. Vale a pena parar e perguntar o que realmente compensa guardar."
                    },
                    {
                        "type": "text",
                        "value": "## As três perguntas que decidem\n\nUm bom candidato a cache costuma responder sim para três perguntas:\n\n- **É lido com frequência?** Cachear algo que quase ninguém pede não economiza quase nada.\n- **É caro de produzir?** Se calcular ou buscar o dado já é barato, o cache não tem muito o que economizar, e ainda soma o custo de gerenciar a entrada.\n- **Muda pouco?** Se o dado muda a cada segundo, o cache vai estar desatualizado quase o tempo todo, ou vai precisar de um TTL tão curto que quase não ajuda.\n\nExemplos clássicos que respondem sim para as três: a lista de categorias de um catálogo, o perfil público de um usuário, o resultado de um relatório agregado que só muda uma vez por dia."
                    },
                    {
                        "type": "text",
                        "value": "## Quando não vale a pena\n\nDo outro lado, tem dado que muda a cada requisição, como o estoque de um produto durante uma queima de estoque ou a cotação de um ativo em tempo real: cachear esse tipo de dado significa entregar informação errada com frequência alta, o que pode ser pior do que não cachear nada.\n\nTem também o caso do dado sensível por usuário: cachear o saldo de uma carteira, um extrato ou qualquer informação privada exige cuidado redobrado com a chave do cache (nunca misturar dado de um usuário com o de outro) e, muitas vezes, nem vale o risco perto do ganho de performance."
                    },
                    {
                        "type": "code",
                        "value": "// Bom candidato: poucas mudanças, mesma resposta para todo mundo\napp.get('/categorias', async (req, res) => {\n  const cacheada = cache.get('categorias');\n  if (cacheada) {\n    return res.json(cacheada);\n  }\n\n  const categorias = await prisma.categoria.findMany();\n  cache.set('categorias', categorias);\n  res.json(categorias);\n});\n\n// Mau candidato: muda a cada compra, dado errado pode causar overselling\napp.get('/produtos/:id/estoque', async (req, res) => {\n  const produto = await prisma.produto.findUnique({\n    where: { id: req.params.id },\n    select: { estoque: true },\n  });\n\n  res.json(produto); // sem cache, de propósito\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Cenário\", \"Vale cachear?\", \"Por quê\"], [\"Lista de categorias do catálogo\", \"Sim\", \"Poucas mudanças, lida por todo mundo, mesma resposta para todo mundo\"], [\"Perfil público de um usuário\", \"Sim\", \"Lido com frequência, muda raramente, custo de montar o perfil é maior que uma leitura simples\"], [\"Resultado de relatório agregado pesado\", \"Sim\", \"Consulta cara no banco, o mesmo resultado serve por minutos ou horas\"], [\"Saldo da carteira do usuário\", \"Não, ou com muito cuidado\", \"Precisa estar sempre correto, servir valor errado é grave\"], [\"Estoque de um produto em queima de estoque\", \"Não\", \"Muda a cada venda, servir número velho gera overselling\"], [\"Soma de dois números recebidos na requisição\", \"Não\", \"Calcular é mais barato do que consultar e gravar um cache\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Cache bom é aquele que ninguém percebe que existe, porque a resposta está sempre certa e sai rápido. Cache no lugar errado é aquele que faz um usuário ver o saldo de ontem ou o estoque de um produto que já acabou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são as três características que tornam um dado um bom candidato a cache?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É escrito com frequência, é barato de produzir e muda a cada segundo",
                                "isCorrect": false
                            },
                            {
                                "text": "É acessado só por administradores, ocupa pouco espaço e nunca é lido duas vezes",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica numa tabela grande do banco, tem muitas colunas e aparece em vários joins",
                                "isCorrect": false
                            },
                            {
                                "text": "É lido com frequência, é caro de produzir e muda pouco ao longo do tempo",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Durante uma queima de estoque, a quantidade disponível de um produto muda a cada poucos segundos conforme as vendas acontecem. Por que cachear essa contagem de estoque é arriscado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O cache pode devolver um estoque desatualizado, levando a vender mais unidades do que existem de fato",
                                "isCorrect": true
                            },
                            {
                                "text": "O cache sempre deixa a resposta bem mais lenta do que consultar o estoque direto no banco de dados de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Bancos de dados não conseguem lidar com muitas escritas de estoque acontecendo em pouco tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de estoque costuma ser grande demais para caber em uma única entrada de cache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota devolve a lista de categorias do catálogo, que só muda quando um administrador cria ou renomeia uma categoria (algo raro). Essa lista é consultada em praticamente toda página do site. Por que esse é um exemplo quase perfeito para cache?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque listas de catálogo são sempre mais rápidas de cachear do que objetos únicos buscados por id no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é lida com muita frequência, quase sempre com o mesmo resultado, e muda raramente, economizando trabalho repetido",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque categorias jamais precisam ser lidas do banco de dados em nenhuma situação real da aplicação em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o cache impede que os administradores criem novas categorias por engano no catálogo enquanto ele estiver ativo no ar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor decide cachear o saldo da carteira de cada usuário por 5 minutos, para deixar a tela de perfil mais rápida. Qual é o principal risco dessa decisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O banco de dados acaba muito sobrecarregado, já que o cache só aumenta o número total de consultas feitas ao saldo do usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Saldos de carteira não podem, por uma limitação técnica, ser guardados em nenhum tipo de cache que exista hoje",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário pode ver um saldo desatualizado logo após uma transação, algo grave para um dado financeiro que tem de estar certo",
                                "isCorrect": true
                            },
                            {
                                "text": "O TTL de 5 minutos é tecnicamente impossível de implementar num cache que tenha prazo de expiração próprio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor cria um cache para a rota que soma dois valores recebidos via query string (ex.: /soma?a=2&b=3), usando a própria query string como chave do cache. Depois de medir, ele percebe que o hit ratio está próximo de zero, mesmo com muitos acessos à rota. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Como os valores variam muito entre as chamadas, cada uma gera uma chave diferente e quase nunca há entrada prévia a reaproveitar",
                                "isCorrect": true
                            },
                            {
                                "text": "Como o cache está apenas mal configurado, um TTL bem maior resolveria o problema e elevaria bastante o hit ratio",
                                "isCorrect": false
                            },
                            {
                                "text": "Como somas só podem ser guardadas em cache quando o resultado final é um número inteiro positivo, muitas das chamadas acabam ficando de fora",
                                "isCorrect": false
                            },
                            {
                                "text": "Como o hit ratio baixo indica que o banco de dados está indisponível, as gravações no cache estão todas falhando",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "TTL: dando prazo de validade ao cache",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## TTL: dando prazo de validade ao cache\n\nTTL é a sigla de time to live, tempo de vida. É o prazo de validade que se dá para uma entrada de cache: depois desse tempo, ela é considerada vencida e deixa de ser usada como está, mesmo que ainda esteja fisicamente guardada em algum lugar."
                    },
                    {
                        "type": "text",
                        "value": "## Por que todo cache precisa de um prazo\n\nSem TTL, uma entrada de cache guardada hoje continuaria sendo servida para sempre, mesmo que o dado original no banco tenha mudado há meses. É o problema do dado velho (stale) levado ao extremo: o cache vira uma fonte permanentemente desatualizada, e a única forma de corrigir seria alguém lembrar de apagar a entrada manualmente (o que é assunto do Módulo 4, sobre invalidação).\n\nTTL resolve a parte mais simples desse problema: garante que, no pior caso, o dado velho tem prazo para sumir sozinho, sem depender de ninguém lembrar de limpar nada."
                    },
                    {
                        "type": "text",
                        "value": "## Curto ou longo: o equilíbrio entre frescor e reuso\n\nEscolher o TTL é balancear dois lados que puxam para direções opostas:\n\n- **TTL curto** deixa o dado mais fresco (mais parecido com o que está no banco agora), mas força mais idas até a fonte original, porque as entradas expiram rápido e o hit ratio cai.\n- **TTL longo** aumenta o reuso (mais hits, menos carga na fonte original), mas aumenta o risco de servir um dado que já mudou desde que foi guardado.\n\nNão existe um TTL certo universal: a escolha depende de com que frequência o dado muda de verdade, e de quão grave é, para aquele caso de uso, servir uma versão de alguns segundos, minutos ou horas atrás. Cache distribuído como o Redis, que você conhece de verdade a partir do Módulo 3, também trabalha com TTL nativo: o raciocínio é o mesmo do exemplo abaixo, só que o próprio serviço de cache cuida da expiração para você."
                    },
                    {
                        "type": "code",
                        "value": "function guardarComTTL(cache, chave, valor, ttlMs) {\n  cache.set(chave, {\n    valor,\n    expiraEm: Date.now() + ttlMs,\n  });\n}\n\nfunction lerComTTL(cache, chave) {\n  const entrada = cache.get(chave);\n\n  if (!entrada) {\n    return undefined; // nunca foi guardado: miss\n  }\n\n  if (Date.now() > entrada.expiraEm) {\n    cache.delete(chave); // venceu: trata como miss\n    return undefined;\n  }\n\n  return entrada.valor; // ainda válido: hit\n}\n\nconst cache = new Map();\nguardarComTTL(cache, 'categorias', ['livros', 'games'], 60 * 60 * 1000); // 1 hora"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de dado\", \"TTL sugerido\", \"Por quê\"], [\"Lista de categorias do catálogo\", \"Ex.: 1 hora\", \"Muda raramente, pode ficar defasada um pouco sem problema\"], [\"Perfil público de usuário\", \"Ex.: 10 minutos\", \"Muda de vez em quando (bio, foto), tolera um atraso pequeno\"], [\"Cotação de moeda ou preço que varia\", \"Ex.: 30 segundos\", \"Muda rápido, um TTL longo entregaria preço errado\"], [\"Resultado de relatório agregado noturno\", \"Ex.: 24 horas\", \"Só é recalculado uma vez por dia de qualquer forma\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "TTL não é sobre achar o número perfeito, é sobre aceitar que todo cache tem prazo de validade e escolher esse prazo de propósito, não por acaso."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa o TTL de uma entrada de cache?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número máximo de vezes que a entrada pode ser lida antes de ser apagada",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo em que essa entrada é considerada válida antes de ser tratada como vencida",
                                "isCorrect": true
                            },
                            {
                                "text": "O tamanho máximo, em bytes, que a entrada pode chegar a ocupar dentro do cache",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo que o banco de dados leva para responder à consulta original daquela chave",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma entrada de cache tem TTL de 1 hora, mas o dado original no banco mudou 10 minutos depois de ela ter sido guardada. Durante o restante da hora, o que a aplicação tende a servir para quem consultar essa chave?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A aplicação percebe a mudança na hora em que ela ocorre e atualiza sozinha a entrada do cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro, porque o cache não deixa servir dado nenhum depois que a fonte original é alterada",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre a versão mais recente, porque o TTL afeta só o tempo de resposta, não o conteúdo servido",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão antiga guardada no cache, já defasada em relação ao banco, até o TTL daquela entrada vencer",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma entrada cara de calcular (um relatório agregado) muda só uma vez por dia, mas está com TTL de 10 segundos. Qual é a consequência mais provável dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O hit ratio fica baixo e o relatório é recalculado quase o tempo inteiro, anulando boa parte do ganho de ter um cache",
                                "isCorrect": true
                            },
                            {
                                "text": "O relatório acaba ficando desatualizado por até 24 horas inteiras seguidas antes de finalmente chegar a ser recalculado de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados deixa de receber qualquer consulta ligada a esse relatório pesado a partir desse ponto",
                                "isCorrect": false
                            },
                            {
                                "text": "O TTL curto força o relatório a ficar sempre exato, sem correr risco nenhum de servir um dado velho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa escolher o TTL do cache da cotação de uma moeda estrangeira, que muda a cada poucos segundos no mercado e é usada para calcular o preço de produtos importados no momento da compra. Qual abordagem de TTL faz mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um TTL de 24 horas, já que o cache serve justamente para reduzir ao máximo o número de consultas à fonte",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum TTL, deixando a entrada do cache valer para sempre até o processo acabar sendo reiniciado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um TTL bem curto, de segundos, aceitando mais idas à fonte em troca de um valor sempre perto do valor real",
                                "isCorrect": true
                            },
                            {
                                "text": "Um TTL igual ao das categorias do catálogo, já que o prazo deveria ser padronizado para todo o sistema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um usuário edita o próprio perfil público (cacheado com TTL de 10 minutos) e, ao atualizar a página logo em seguida, ainda vê os dados antigos. O TTL de 10 minutos, isoladamente, resolve esse tipo de situação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim: o TTL foi criado justamente para atualizar a entrada do cache no exato instante em que o dado original for alterado lá no banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: o TTL só dá prazo para o dado velho expirar sozinho, não atualiza na hora; para isso é preciso invalidar a entrada na escrita",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, desde que esse TTL seja sempre configurado com um número par de minutos, o que dispara a atualização na hora",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o TTL só tem efeito em cache guardado na memória do processo, nunca em cache distribuído como o Redis",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O padrão cache-aside: consulta, miss, grava",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O padrão cache-aside: consulta, miss, grava\n\nCache-aside (também chamado de lazy loading) é o padrão mais comum de todos para usar cache, e provavelmente já apareceu, sem esse nome, em quase todo exemplo deste módulo até aqui. A ideia é simples: a própria aplicação decide quando consultar o cache, quando ir até a fonte original e quando gravar de volta."
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo, passo a passo\n\n1. A aplicação recebe um pedido (uma requisição HTTP, por exemplo).\n2. Ela consulta o cache primeiro, antes de tocar no banco.\n3. Se a entrada estiver lá e ainda válida (cache hit), usa esse valor direto e responde.\n4. Se não estiver (cache miss, seja porque nunca foi guardada ou porque o TTL venceu), busca o dado na fonte original, grava esse resultado no cache com um TTL, e só depois responde.\n\nO nome 'aside' (à parte) vem daí: o cache fica ao lado do fluxo normal da aplicação, e é a própria aplicação que consulta e alimenta o cache, em vez de o banco ou algum outro componente fazerem isso por conta própria."
                    },
                    {
                        "type": "code",
                        "value": "const cache = new Map();\nconst TTL_MS = 60 * 1000; // 1 minuto\n\nasync function getProduto(id) {\n  const agora = Date.now();\n  const emCache = cache.get(id);\n\n  if (emCache && emCache.expiraEm > agora) {\n    console.log('cache hit para produto', id);\n    return emCache.valor;\n  }\n\n  console.log('cache miss para produto', id);\n  const produto = await prisma.produto.findUnique({ where: { id } }); // fonte original: o banco\n\n  cache.set(id, {\n    valor: produto,\n    expiraEm: agora + TTL_MS,\n  });\n\n  return produto;\n}\n\napp.get('/produtos/:id', async (req, res) => {\n  const produto = await getProduto(req.params.id);\n\n  if (!produto) {\n    return res.status(404).json({ erro: 'produto não encontrado' });\n  }\n\n  res.json(produto);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Hit ratio: a taxa de acerto\n\nHit ratio é a proporção de vezes que o cache respondeu com um hit em vez de um miss: hits dividido pela soma de hits e misses. Um hit ratio de 90% quer dizer que, de cada 10 pedidos, 9 foram resolvidos direto do cache e só 1 precisou ir até o banco.\n\nHit ratio importa porque é ele que mede, na prática, quanto do trabalho caro está de fato sendo evitado. Um cache-aside bem configurado (bons candidatos a cache, TTL adequado) tende a um hit ratio alto; um cache mal configurado (TTL curto demais, chave errada, dado que muda demais) pode ter um hit ratio tão baixo que quase não sobra ganho nenhum, mesmo com o código do cache funcionando."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Cache hit\", \"Cache miss\"], [\"O que aconteceu\", \"O dado já estava no cache e ainda válido\", \"O dado não estava no cache, ou tinha expirado\"], [\"De onde vem a resposta\", \"Direto do cache\", \"Da fonte original (banco, API), depois grava no cache\"], [\"Latência típica\", \"Baixa\", \"Mais alta, paga o custo da consulta original\"], [\"Efeito colateral\", \"Nenhum\", \"Escreve uma nova entrada no cache com TTL\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O trade-off do dado velho (stale)\n\nEntre o momento em que um valor é gravado no cache e o momento em que seu TTL vence, o cache-aside pode servir uma resposta desatualizada (stale) mesmo que o dado original já tenha mudado no banco nesse intervalo. Esse é o preço do ganho de performance: o padrão troca uma certeza (a resposta é sempre a mais atual) por uma alta probabilidade de resposta rápida, aceitando um atraso limitado pelo TTL.\n\nPara muita coisa (lista de categorias, perfil público) esse atraso é perfeitamente aceitável. Para outras (saldo, estoque em tempo real) pode não ser, e é aí que entram as estratégias de invalidação que você vai ver no Módulo 4."
                    },
                    {
                        "type": "quote",
                        "value": "Cache-aside em uma frase: pergunte ao cache primeiro, só vá até a fonte original se precisar, e deixe o resultado anotado para a próxima vez."
                    }
                ],
                "questions": [
                    {
                        "statement": "No padrão cache-aside, o que a aplicação faz quando ocorre um cache miss?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Devolve na hora um erro 404 para o cliente, sem nem chegar a consultar o banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica esperando o próximo cache hit acontecer para só então conseguir responder ao usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Vai buscar o dado na fonte original, grava o resultado no cache com um TTL e devolve a resposta",
                                "isCorrect": true
                            },
                            {
                                "text": "Apaga todas as outras entradas guardadas no cache antes de montar e enviar a resposta ao cliente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como se calcula o hit ratio de um cache?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Número de hits dividido pela soma de hits e misses",
                                "isCorrect": true
                            },
                            {
                                "text": "Número de misses dividido pelo número total de hits",
                                "isCorrect": false
                            },
                            {
                                "text": "Número de entradas no cache dividido pelo TTL médio delas",
                                "isCorrect": false
                            },
                            {
                                "text": "Tempo de resposta com cache dividido pelo tempo sem cache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Logo depois de um deploy que reiniciou todas as instâncias da aplicação, o hit ratio do cache-aside despenca por alguns minutos e depois volta ao normal. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O deploy acabou corrompendo o banco de dados, fazendo cada consulta à fonte original da rota falhar",
                                "isCorrect": false
                            },
                            {
                                "text": "O hit ratio cair logo após um deploy aponta sempre um bug grave no cache-aside que precisa ser corrigido bem ali na hora",
                                "isCorrect": false
                            },
                            {
                                "text": "O TTL de todas as entradas dobra de valor sozinho logo depois de cada deploy que a aplicação recebe",
                                "isCorrect": false
                            },
                            {
                                "text": "O cache foi esvaziado no restart e precisa reaquecer, então as primeiras chamadas viram misses até ele repopular",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor implementa uma rota seguindo o padrão cache-aside, mas esquece de gravar o resultado no cache depois de buscar no banco em um cache miss (ele só lê o cache, nunca escreve nele). Qual é o efeito prático desse esquecimento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A rota passa a responder com um erro 500 em praticamente todas as chamadas que ela recebe dali em diante",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda requisição vira um miss, porque a entrada nunca chega a ser criada, e a rota sempre vai ao banco, perdendo o ganho",
                                "isCorrect": true
                            },
                            {
                                "text": "O hit ratio sobe direto para 100%, porque toda consulta recebida passa a ser tratada como se já estivesse cacheada de antemão",
                                "isCorrect": false
                            },
                            {
                                "text": "O TTL passa a ser totalmente ignorado, mas de resto o cache continua a funcionar de forma normal",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A rota GET /produtos/:id usa cache-aside com TTL de 1 minuto. O preço de um produto muda no banco às 10:00:05, mas a rota continua devolvendo o preço antigo para quem pedir esse produto até aproximadamente as 10:01:00, quando o TTL da entrada vence. Isso é necessariamente um bug no cache-aside?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim: um cache-aside implementado corretamente nunca chega a servir dado desatualizado, então isso aponta um bug no código",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é bug, mas a única correção possível nesse caso é remover por completo o cache dessa rota e voltar a sempre ir ao banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, e a causa raiz desse tipo de atraso é sempre um TTL configurado com um valor baixo demais para aquele dado",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: é o trade-off esperado do padrão, que serve stale até o TTL vencer; se for inaceitável, invalida-se a entrada na escrita",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Redis na prática",
        "aulas": [
            {
                "titulo": "O que é o Redis e para que serve",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é o Redis e para que serve\n\nAté agora você guardou dados de forma durável: tabelas num banco relacional, linhas que sobrevivem a um reinício do servidor. O Redis é outra categoria de armazém de dados: um banco de **chave-valor** que mantém tudo na memória RAM, em vez de disco.\n\nIsso muda a velocidade das operações. Uma consulta numa tabela relacional passa por I/O de disco, índices, parsing de SQL. Uma leitura no Redis é, no fundo, buscar um valor num mapa em memória: leva microssegundos, não milissegundos."
                    },
                    {
                        "type": "text",
                        "value": "## Por que estar em memória faz diferença\n\nRAM é ordens de grandeza mais rápida que disco, mesmo SSD. O preço dessa velocidade é que a RAM é mais cara e menor em capacidade, então o Redis não substitui o seu banco relacional: ele guarda um subconjunto dos dados, pensado para acesso rápido e repetido.\n\nO modelo de dados também é mais simples que o de um banco relacional: sem tabelas, sem joins, sem schema fixo. Você guarda uma chave (uma string) e um valor associado a ela.\n\nVale uma nota sobre sessão: a trilha de autenticação te mostrou o JWT, que guarda os dados da sessão no próprio token, sem estado no servidor. Guardar sessão no Redis é a alternativa mais tradicional: o servidor guarda um identificador curto num cookie e busca os dados de sessão correspondentes no Redis a cada requisição. São dois jeitos diferentes de resolver o mesmo problema."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Uso comum\",\"Para que serve\"],[\"Cache\",\"Guardar o resultado de uma consulta cara ou de uma chamada de API, evitando repetir o trabalho a cada requisição\"],[\"Sessão\",\"Guardar dados de sessão de usuários logados, compartilhados entre várias instâncias do servidor\"],[\"Contador\",\"Contar visualizações, curtidas, tentativas: qualquer coisa que precise incrementar de forma atômica\"],[\"Rate limit\",\"Controlar quantas requisições um cliente pode fazer num intervalo de tempo\"],[\"Fila\",\"Guardar jobs que um worker vai processar depois (você vai ver isso a fundo nos módulos 5 e 6)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde o Redis mora\n\nO Redis não é uma biblioteca que você importa: é um serviço que roda à parte da sua aplicação Node, do mesmo jeito que o Postgres ou o MySQL rodam à parte. Sua API vira um cliente que se conecta a esse serviço pela rede, mesmo que, em desenvolvimento, ele esteja rodando na sua própria máquina.\n\nNa prática, a forma mais comum de subir um Redis localmente hoje em dia é com Docker: você baixa a imagem oficial e sobe um container escutando na porta padrão, 6379, sem instalar nada direto no seu sistema."
                    },
                    {
                        "type": "code",
                        "value": "docker run --name redis-estudos -p 6379:6379 -d redis:7\n\ndocker exec -it redis-estudos redis-cli\n127.0.0.1:6379> PING\nPONG"
                    },
                    {
                        "type": "quote",
                        "value": "O Redis é um banco de chave-valor em memória: rápido porque não toca disco, limitado porque a memória é finita. Cache, sessão, contador, rate limit e fila são os mesmos dados guardados de formas diferentes, todos se aproveitando da mesma velocidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza o Redis como um banco de dados diferente de um banco relacional como o Postgres?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guarda os dados em tabelas com linhas, colunas e um schema fixo",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda embutido no processo da aplicação Node, como uma biblioteca",
                                "isCorrect": false
                            },
                            {
                                "text": "Guarda os dados em formato chave-valor, mantidos na memória RAM",
                                "isCorrect": true
                            },
                            {
                                "text": "Organiza os dados em documentos consultados por uma linguagem própria",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que operações no Redis costumam ser muito mais rápidas que uma consulta num banco relacional tradicional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque mantém os dados na memória RAM, evitando a leitura em disco",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque comprime os dados antes de gravar, deixando as leituras mais leves",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque usa uma linguagem de consulta mais enxuta e rápida que o SQL",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque roda sempre na mesma máquina da aplicação, sem custo de rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API Node com três instâncias rodando atrás de um load balancer precisa contar quantas vezes cada post foi visualizado, com o mesmo total valendo para as três instâncias. Por que guardar esse contador numa variável comum do processo Node não resolve?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque variáveis de processo são zeradas a cada requisição, perdendo a contagem",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Node bloqueia a escrita concorrente na mesma variável entre duas requisições",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque uma variável suporta valores só até certo limite e estoura com muitas views",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada instância tem a própria memória, e o contador fica dividido entre elas",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time quer limitar quantas requisições de login um mesmo IP pode fazer por minuto, para dificultar um ataque de força bruta. Qual uso do Redis, entre os apresentados nesta aula, resolve diretamente esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Rate limit",
                                "isCorrect": true
                            },
                            {
                                "text": "Sessão",
                                "isCorrect": false
                            },
                            {
                                "text": "Fila",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide usar o Redis como único lugar onde os dados de pedidos dos clientes ficam gravados, sem persistir em nenhum banco relacional. Considerando que o Redis mantém os dados na memória, qual o principal risco dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Num reinício ou falha do processo, os dados que só existem na memória podem se perder",
                                "isCorrect": true
                            },
                            {
                                "text": "O Redis limita cada cliente a um único pedido gravado por vez, travando novas escritas",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar pedidos por filtros deixa de ser possível, pois o Redis não faz nenhuma leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "A gravação em memória é lenta demais para o volume de pedidos de uma loja movimentada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Conectando o Node ao Redis com ioredis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do redis-cli para dentro da sua aplicação\n\nNa aula anterior você conversou com o Redis pelo terminal, com o redis-cli. Agora é a vez de conectar sua aplicação Node a ele. O cliente que vamos usar é o **ioredis**, uma das bibliotecas mais usadas para isso no ecossistema Node: cobre praticamente todos os comandos do Redis, trabalha com Promises (então dá pra usar com async/await, como você já faz com o banco) e cuida sozinho de reconexão."
                    },
                    {
                        "type": "code",
                        "value": "npm install ioredis"
                    },
                    {
                        "type": "text",
                        "value": "## Conectar local, conectar remoto\n\nQuando o Redis está rodando na sua própria máquina, na porta padrão 6379, não é preciso passar nenhuma configuração: o ioredis já assume esse endereço. Em produção, o Redis quase nunca está em localhost: geralmente é um serviço à parte, com host, porta e senha próprios, configurados por variável de ambiente, o mesmo padrão que você já usa para a string de conexão do banco."
                    },
                    {
                        "type": "code",
                        "value": "import Redis from \"ioredis\";\n\n// desenvolvimento: redis local, na porta padrao\nconst redis = new Redis();\n\n// producao: host, porta e senha vindos de variavel de ambiente\nconst redisProd = new Redis({\n  host: process.env.REDIS_HOST,\n  port: Number(process.env.REDIS_PORT) || 6379,\n  password: process.env.REDIS_PASSWORD,\n});\n\n// ou uma URL de conexao completa\nconst redisPorUrl = new Redis(process.env.REDIS_URL);\n// REDIS_URL=redis://usuario:senha@meu-redis.exemplo.com:6379\n\nredis.on(\"connect\", () => console.log(\"conectado ao redis\"));\nredis.on(\"error\", (erro) => console.error(\"erro na conexao com o redis:\", erro));"
                    },
                    {
                        "type": "text",
                        "value": "## Uma conexão, reaproveitada\n\nnew Redis() abre uma conexão com o servidor, e manter essa conexão aberta é bem mais barato do que abrir uma nova a cada requisição, o mesmo raciocínio de reaproveitar conexão que você já aplica com o banco. Por isso o padrão é criar a instância **uma vez só**, num módulo próprio, e importar essa mesma instância em todo lugar que precisar dela."
                    },
                    {
                        "type": "code",
                        "value": "// redis.js: cria a conexao uma unica vez\nimport Redis from \"ioredis\";\n\nexport const redis = new Redis();\n\n// produtosRoutes.js: reaproveita a mesma conexao\nimport { Router } from \"express\";\nimport { redis } from \"./redis.js\";\n\nconst router = Router();\n\nrouter.get(\"/produtos/:id\", async (req, res) => {\n  const valor = await redis.get(`produto:${req.params.id}`);\n  res.json({ cache: valor });\n});\n\nexport default router;"
                    },
                    {
                        "type": "quote",
                        "value": "O ioredis conecta sua aplicação ao Redis do mesmo jeito que um driver conecta ao banco: uma instância criada uma vez, configurada por variável de ambiente, reaproveitada em toda a aplicação."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando instala o cliente ioredis num projeto Node?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm install redis-client",
                                "isCorrect": false
                            },
                            {
                                "text": "npm install ioredis",
                                "isCorrect": true
                            },
                            {
                                "text": "npm install node-redis-cli",
                                "isCorrect": false
                            },
                            {
                                "text": "npm install @redis/ioredis",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como criar, com ioredis, uma conexão com um Redis rodando na própria máquina, na porta padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "const redis = Redis.connect();",
                                "isCorrect": false
                            },
                            {
                                "text": "const redis = new Redis.Client();",
                                "isCorrect": false
                            },
                            {
                                "text": "const redis = Redis.local();",
                                "isCorrect": false
                            },
                            {
                                "text": "const redis = new Redis();",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota Express cria \"const redis = new Redis()\" dentro do handler, ou seja, uma instância nova a cada requisição que chega. Qual o problema dessa abordagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cada requisição abre uma conexão nova, desperdiçando o que uma conexão reaproveitada pouparia",
                                "isCorrect": true
                            },
                            {
                                "text": "O ioredis proíbe criar mais de uma instância por processo e lança um erro na segunda",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis bloqueia conexões repetidas do mesmo IP e recusa as requisições seguintes",
                                "isCorrect": false
                            },
                            {
                                "text": "As requisições passam a ser atendidas em fila, uma de cada vez, por causa disso",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em produção, a aplicação precisa se conectar a um Redis hospedado em outro servidor, numa porta diferente da padrão e protegido por senha. Qual das opções abaixo é a forma correta de fazer isso com ioredis?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "new Redis.connectRemote(host, port, password)",
                                "isCorrect": false
                            },
                            {
                                "text": "Redis.setHost(host).setPort(port).setPassword(password)",
                                "isCorrect": false
                            },
                            {
                                "text": "new Redis({ host, port, password })",
                                "isCorrect": true
                            },
                            {
                                "text": "new Redis(host, port, password)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é uma boa prática configurar a conexão do ioredis (host, porta, senha ou URL) a partir de variáveis de ambiente, em vez de escrever esses valores fixos no código?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o ioredis aceita configuração de conexão apenas por meio de variáveis de ambiente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque variáveis de ambiente deixam a abertura da conexão com o Redis bem mais rápida e estável",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, sem a variável definida corretamente, o Redis recusa qualquer tentativa de conexão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada ambiente pode ter um Redis próprio, e a variável troca o endereço sem mexer no código",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Comandos essenciais: SET, GET, EXPIRE, DEL, INCR",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A caixa de ferramentas básica\n\nCom a conexão pronta, é hora de manipular dados de verdade. O Redis tem dezenas de comandos, mas boa parte do que você vai usar no dia a dia se resume a cinco: gravar, ler, apagar, dar um tempo de vida e incrementar.\n\nO INCR merece destaque: ele é a peça central por trás de contadores de visualização e do rate limit que você viu na trilha de autenticação. Contar quantas requisições um cliente fez numa janela de tempo é, no fundo, um INCR com um TTL do lado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Comando\",\"O que faz\",\"redis-cli\",\"ioredis\"],[\"SET\",\"Grava um valor numa chave\",\"SET produto:123 \\\"Teclado\\\"\",\"redis.set(\\\"produto:123\\\", \\\"Teclado\\\")\"],[\"GET\",\"Lê o valor de uma chave (retorna nulo se ela não existir)\",\"GET produto:123\",\"redis.get(\\\"produto:123\\\")\"],[\"DEL\",\"Remove uma chave\",\"DEL produto:123\",\"redis.del(\\\"produto:123\\\")\"],[\"EXPIRE / TTL\",\"Define (EXPIRE) ou consulta (TTL) o tempo de vida de uma chave, em segundos\",\"EXPIRE produto:123 60, depois TTL produto:123\",\"redis.expire(\\\"produto:123\\\", 60), depois redis.ttl(\\\"produto:123\\\")\"],[\"INCR\",\"Incrementa em 1 o valor numérico de uma chave, de forma atômica\",\"INCR contador:views\",\"redis.incr(\\\"contador:views\\\")\"]]"
                    },
                    {
                        "type": "code",
                        "value": "127.0.0.1:6379> SET produto:123 \"Teclado mecanico\"\nOK\n127.0.0.1:6379> GET produto:123\n\"Teclado mecanico\"\n127.0.0.1:6379> EXPIRE produto:123 60\n(integer) 1\n127.0.0.1:6379> TTL produto:123\n(integer) 57\n127.0.0.1:6379> INCR contador:views\n(integer) 1\n127.0.0.1:6379> INCR contador:views\n(integer) 2\n127.0.0.1:6379> DEL produto:123\n(integer) 1\n127.0.0.1:6379> GET produto:123\n(nil)"
                    },
                    {
                        "type": "code",
                        "value": "import Redis from \"ioredis\";\n\nconst redis = new Redis();\n\nasync function exemplo() {\n  await redis.set(\"produto:123\", \"Teclado mecanico\");\n  console.log(await redis.get(\"produto:123\")); // \"Teclado mecanico\"\n\n  // grava e ja define expiracao de 60 segundos, numa chamada so\n  await redis.set(\"sessao:abc\", \"token-do-usuario\", \"EX\", 60);\n  console.log(await redis.ttl(\"sessao:abc\")); // 60 (ou um pouco menos)\n\n  console.log(await redis.incr(\"contador:views\")); // 1\n  console.log(await redis.incr(\"contador:views\")); // 2\n\n  await redis.del(\"produto:123\");\n  console.log(await redis.get(\"produto:123\")); // null\n}\n\nexemplo();"
                    },
                    {
                        "type": "text",
                        "value": "## Redis só guarda strings\n\nRepare que todo valor devolvido pelo redis-cli aparece entre aspas: por baixo dos panos, o Redis guarda strings (e alguns tipos derivados, como listas e hashes, mas o SET simples é sempre string). Se você tenta guardar um objeto JavaScript diretamente, ele vira o texto \"[object Object]\", inútil na hora de ler de volta.\n\nA saída é serializar: transformar o objeto numa string JSON antes de gravar, e desfazer isso na leitura."
                    },
                    {
                        "type": "code",
                        "value": "const produto = { id: 123, nome: \"Teclado mecanico\", preco: 349.9 };\n\nawait redis.set(\"produto:123\", JSON.stringify(produto), \"EX\", 300);\n\nconst bruto = await redis.get(\"produto:123\");\nconst produtoCache = bruto ? JSON.parse(bruto) : null;\n\nconsole.log(produtoCache.nome); // \"Teclado mecanico\""
                    },
                    {
                        "type": "quote",
                        "value": "SET grava, GET lê, DEL apaga, EXPIRE e TTL controlam o tempo de vida, INCR incrementa de forma atômica. Junte SET com EX numa chamada só, serialize objetos com JSON.stringify, e você já tem o essencial pra cachear qualquer coisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando do ioredis incrementa em 1, de forma atômica, o valor de uma chave numérica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "redis.add()",
                                "isCorrect": false
                            },
                            {
                                "text": "redis.plus()",
                                "isCorrect": false
                            },
                            {
                                "text": "redis.set()",
                                "isCorrect": false
                            },
                            {
                                "text": "redis.incr()",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que redis.get() retorna quando a chave consultada não existe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O valor null",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma string vazia",
                                "isCorrect": false
                            },
                            {
                                "text": "O número zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de execução",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer gravar o resultado de uma consulta no Redis e fazer essa chave expirar automaticamente em 5 minutos. Qual chamada de ioredis faz isso corretamente numa única operação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "redis.set('chave', valor, 300)",
                                "isCorrect": false
                            },
                            {
                                "text": "redis.get('chave', 'EX', 300)",
                                "isCorrect": false
                            },
                            {
                                "text": "redis.set('chave', valor, 'EX', 300)",
                                "isCorrect": true
                            },
                            {
                                "text": "redis.set('chave', valor, 'EX', 5)",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota precisa contar quantas vezes um post foi visualizado, e várias instâncias do servidor recebem requisições para o mesmo post ao mesmo tempo. Qual comando garante que o contador incremente corretamente mesmo com requisições simultâneas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "redis.expire() renovando o tempo de vida da chave a cada acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "redis.incr() somando 1 de forma atômica a cada requisição",
                                "isCorrect": true
                            },
                            {
                                "text": "redis.get() e depois redis.set() com o valor lido mais um",
                                "isCorrect": false
                            },
                            {
                                "text": "redis.del() seguido de um novo redis.set() com o total",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é necessário usar JSON.stringify antes de gravar um objeto JavaScript com redis.set(), em vez de passar o objeto diretamente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o Redis guarda o valor como string, e um objeto viraria o texto inútil '[object Object]'",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o ioredis só aceita gravar valores que sejam números inteiros válidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque strings ocupam bem menos memória no Redis do que qualquer outra estrutura de dado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o comando SET foi desenhado para gravar apenas arrays, e não objetos soltos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cache-aside na prática com Redis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Do conceito para o código\n\nNo módulo anterior você conheceu o cache-aside: consulta o cache, se achou (hit) responde direto, se não achou (miss) busca na fonte de verdade e grava no cache antes de responder. Pense naquela consulta com JOIN que você otimizou para evitar o N+1, lá na trilha de banco de dados: mesmo otimizada, ela ainda bate no banco a cada requisição.\n\nCache-aside é o próximo passo: rodar essa consulta uma vez a cada TTL e servir da memória enquanto o dado não muda. Agora é hora de implementar isso de verdade, numa rota Express, usando os comandos que você acabou de aprender."
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo, passo a passo\n\n- A rota monta a chave a partir do identificador do recurso, por exemplo `produto:123`\n- Tenta `redis.get(chave)`\n- Se veio algo (hit): `JSON.parse` no valor e responde direto, sem tocar no banco\n- Se veio `null` (miss): busca no banco, grava no Redis com `redis.set(chave, JSON.stringify(dado), \"EX\", ttl)`, e só depois responde"
                    },
                    {
                        "type": "code",
                        "value": "import express from \"express\";\nimport Redis from \"ioredis\";\nimport { buscarProdutoPorId } from \"./repositorioProdutos.js\";\n\nconst app = express();\nconst redis = new Redis();\n\napp.get(\"/produtos/:id\", async (req, res) => {\n  const chave = `produto:${req.params.id}`;\n\n  try {\n    const emCache = await redis.get(chave);\n\n    if (emCache) {\n      console.log(\"cache hit:\", chave);\n      return res.json(JSON.parse(emCache));\n    }\n\n    console.log(\"cache miss:\", chave);\n    const produto = await buscarProdutoPorId(req.params.id);\n\n    if (!produto) {\n      return res.status(404).json({ erro: \"produto nao encontrado\" });\n    }\n\n    await redis.set(chave, JSON.stringify(produto), \"EX\", 300);\n\n    return res.json(produto);\n  } catch (erro) {\n    console.error(\"falha ao consultar produto:\", erro);\n    return res.status(500).json({ erro: \"erro interno\" });\n  }\n});\n\napp.listen(3000);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"De onde vem o dado\",\"O que a rota faz\"],[\"Cache hit\",\"Redis (memória)\",\"Faz JSON.parse no valor e responde direto, sem consultar o banco\"],[\"Cache miss\",\"Banco de dados\",\"Busca no banco, grava no Redis com EX, e só então responde\"]]"
                    },
                    {
                        "type": "code",
                        "value": "$ curl -w \"\\ntempo: %{time_total}s\\n\" http://localhost:3000/produtos/123\n{\"id\":123,\"nome\":\"Teclado mecanico\",\"preco\":349.9}\ntempo: 0.182s\n\n$ curl -w \"\\ntempo: %{time_total}s\\n\" http://localhost:3000/produtos/123\n{\"id\":123,\"nome\":\"Teclado mecanico\",\"preco\":349.9}\ntempo: 0.003s"
                    },
                    {
                        "type": "text",
                        "value": "## Por que checar o produto antes de cachear\n\nRepare que o redis.set só acontece depois de confirmar que o produto existe. Se cacheasse antes dessa checagem, ou cacheasse um resultado vazio, a rota passaria a responder \"não encontrado\" para um produto que existe, até a chave expirar. O mesmo cuidado vale para qualquer resposta de erro: cache-aside guarda o resultado bom, não a ausência dele."
                    },
                    {
                        "type": "quote",
                        "value": "Cache-aside numa linha: tenta o cache, se faltar busca na fonte e preenche o cache antes de responder. A diferença entre um miss e um hit, na prática, é a diferença entre bater no banco e ler da memória."
                    }
                ],
                "questions": [
                    {
                        "statement": "No padrão cache-aside, o que a aplicação faz quando redis.get(chave) retorna null?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Busca o dado na fonte de verdade e grava no cache antes de responder",
                                "isCorrect": true
                            },
                            {
                                "text": "Responde direto ao cliente com null, sem consultar nenhuma outra fonte",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga a chave do Redis e devolve um erro de cache para o cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Aguarda alguns segundos e repete o redis.get até a chave aparecer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a rota deve fazer quando redis.get(chave) retorna um valor (cache hit)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Consultar o banco mesmo assim, para confirmar se o valor ainda está correto",
                                "isCorrect": false
                            },
                            {
                                "text": "Gravar o valor de volta no Redis com um novo TTL antes de responder",
                                "isCorrect": false
                            },
                            {
                                "text": "Fazer JSON.parse no valor e responder direto, sem consultar o banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Apagar a chave do cache, já que ela acabou de ser utilizada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor grava o produto no cache com redis.set(chave, produto, \"EX\", 300), esquecendo do JSON.stringify. O que provavelmente acontece na próxima leitura, ao tentar JSON.parse no valor devolvido pelo redis.get?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Funciona normalmente, porque o ioredis serializa o objeto sozinho ao gravar",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor gravado virou algo como '[object Object]', e o JSON.parse falha ao lê-lo",
                                "isCorrect": true
                            },
                            {
                                "text": "O Redis recusou o SET por tipo inválido, então o get devolve null e tudo segue",
                                "isCorrect": false
                            },
                            {
                                "text": "O objeto foi gravado num tipo próprio do Redis e volta pronto, sem precisar de parse",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na rota de cache-aside desta aula, por que o redis.set só é chamado depois de confirmar que o produto foi encontrado no banco, e não antes, ou quando o produto não existe?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque chamar redis.set antes de uma consulta ao banco deixa a gravação bem mais lenta e cara",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Express não permite executar redis.set antes de um bloco if na rota",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o ioredis exige que a chave já exista no Redis antes de qualquer SET",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cachear um resultado vazio faria a rota responder 'não encontrado' durante o TTL",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Se o redis.set da rota de cache-aside fosse chamado sem o \"EX\" (sem TTL), o que aconteceria com a chave gravada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Expiraria em 24 horas, que é o tempo de vida padrão de toda chave no Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficaria no Redis por tempo indefinido, podendo servir dado velho até ser removida",
                                "isCorrect": true
                            },
                            {
                                "text": "Seria rejeitada pelo Redis, pois definir um TTL no comando SET é obrigatório",
                                "isCorrect": false
                            },
                            {
                                "text": "Faria a rota ignorar o cache e passar a consultar sempre o banco de dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Chaves, memória e eviction",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Memória é recurso finito\n\nTudo que dá ao Redis a sua velocidade, guardar dados na RAM, é também o que o limita: RAM é cara e existe em quantidade bem menor que espaço em disco. Um banco relacional, quando precisa de mais espaço, escreve mais um arquivo em disco. O Redis não tem esse caminho: em algum momento, a memória configurada para ele enche."
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece quando a memória enche\n\nQuando isso acontece, o Redis segue uma política de eviction (descarte) configurada pelo parâmetro maxmemory-policy. Por padrão, ele recusa novas escritas. Mas, num cache, isso raramente é o que você quer: melhor descartar algo velho do que travar a aplicação. Por isso, caches costumam configurar o Redis para descartar chaves automaticamente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Política\",\"O que faz\"],[\"noeviction\",\"Recusa novas escritas quando a memória enche (comportamento padrão), sem descartar nada sozinho\"],[\"allkeys-lru\",\"Descarta as chaves menos recentemente usadas (Least Recently Used), entre todas as chaves\"],[\"volatile-lru\",\"Descarta as chaves menos recentemente usadas, mas só entre as que têm TTL definido\"],[\"allkeys-lfu\",\"Descarta as chaves menos frequentemente usadas (Least Frequently Used), entre todas as chaves\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Nomeando chaves com padrão\n\nSem um padrão de nomes, um Redis com milhares de chaves vira uma bagunça indecifrável. A convenção mais comum é namespace:identificador, às vezes com mais de um nível: produto:123, sessao:usuario:55, contador:views:post:42.\n\nIsso deixa claro o que cada chave representa, evita colisão entre chaves de partes diferentes da aplicação e permite reconhecer, só de olhar, de onde cada chave veio."
                    },
                    {
                        "type": "code",
                        "value": "// bom: namespace claro, identificador especifico\nawait redis.set(\"produto:123\", JSON.stringify(produto), \"EX\", 300);\nawait redis.set(\"sessao:usuario:55\", token, \"EX\", 3600);\nawait redis.incr(\"contador:views:post:42\");\n\n// ruim: nomes vagos, sem padrao, dificeis de reconhecer depois\nawait redis.set(\"p123\", JSON.stringify(produto));\nawait redis.set(\"dados1\", token);\n\n// no redis-cli, o padrao de nomes permite explorar chaves (uso pontual, evitar em producao com muitas chaves)\n127.0.0.1:6379> KEYS produto:*\n1) \"produto:123\"\n2) \"produto:456\""
                    },
                    {
                        "type": "text",
                        "value": "## Não guarde algo gigante\n\nUma chave grande demais, uma lista com o catálogo inteiro, uma resposta de API enorme, um arquivo, consome de uma vez uma fatia grande da memória cara e finita do Redis, além de ser mais difícil de invalidar ou substituir de forma seletiva.\n\nPrefira cachear por item, um produto por chave, não o catálogo inteiro numa chave só, e deixe coisas grandes ou pouco acessadas fora do Redis."
                    },
                    {
                        "type": "quote",
                        "value": "O Redis é rápido porque vive na memória, e é por isso que essa memória precisa ser tratada como recurso escasso: TTL em toda chave de cache, nomes previsíveis com namespace, e nada de transformar o Redis num segundo banco de dados para guardar qualquer coisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que a memória usada pelo Redis é considerada um recurso mais limitado do que o espaço em disco de um banco relacional?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o Redis só roda em servidores que não têm disco rígido instalado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Redis limita o total de chaves a mil, seja qual for o hardware",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um banco relacional nunca usa memória RAM em nenhuma de suas operações",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a RAM é mais cara e existe em capacidade bem menor que o espaço em disco",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que é uma política de eviction no Redis?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A forma como o Redis criptografa as chaves guardadas na memória",
                                "isCorrect": false
                            },
                            {
                                "text": "A regra que decide quais chaves descartar quando a memória do Redis enche",
                                "isCorrect": true
                            },
                            {
                                "text": "O comando que apaga de uma só vez todas as chaves existentes no Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "O mecanismo que replica as chaves entre vários servidores Redis em rede",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um cache está configurado com a política allkeys-lru, e a memória do Redis enche. O que o Redis faz nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Descarta as chaves menos recentemente usadas para abrir espaço às novas",
                                "isCorrect": true
                            },
                            {
                                "text": "Recusa todas as novas escritas até alguém apagar chaves manualmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Apaga todas as chaves de uma só vez, zerando o cache por completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Passa a gravar as chaves novas em disco de forma temporária",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das chaves abaixo segue um bom padrão de nomenclatura para guardar o carrinho de compras do usuário de id 42?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "c42",
                                "isCorrect": false
                            },
                            {
                                "text": "carrinho42",
                                "isCorrect": false
                            },
                            {
                                "text": "carrinho:usuario:42",
                                "isCorrect": true
                            },
                            {
                                "text": "dadosDoCarrinhoDoUsuario42",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação guarda, numa única chave do Redis, uma lista em JSON com todos os 200 mil produtos do catálogo, para servir de cache. Qual o problema dessa abordagem?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Redis rejeita automaticamente qualquer string que passe de alguns kilobytes",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há problema real: guardar tudo em uma chave é o jeito recomendado para listas",
                                "isCorrect": false
                            },
                            {
                                "text": "Essa chave toma uma fatia enorme da memória de uma vez e é difícil de invalidar em parte",
                                "isCorrect": true
                            },
                            {
                                "text": "É só uma questão de estilo do código, sem qualquer efeito no uso de memória do Redis",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Invalidação de cache: o problema difícil",
        "aulas": [
            {
                "titulo": "O problema: cache que serve dado velho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O problema: cache que serve dado velho\n\nNos módulos anteriores você aprendeu a guardar dados no Redis para não bater no banco toda hora. Cache-aside, TTL, GET, SET, EXPIRE: a mecânica básica já faz sentido. Só que existe um problema que ainda não apareceu: o que acontece quando o dado original muda?\n\nUm cache é, por definição, uma cópia. E toda cópia corre o risco de ficar desatualizada em relação ao original. Se o banco de dados diz que o produto custa R$ 80 e o Redis ainda responde R$ 100, o cache não está ajudando, está atrapalhando: virou uma fonte de informação errada, só que rápida."
                    },
                    {
                        "type": "text",
                        "value": "## A piada que todo backend dev já ouviu\n\nExiste uma frase clássica na computação, atribuída ao engenheiro Phil Karlton:\n\n\"Só existem duas coisas difíceis em ciência da computação: invalidar cache e nomear coisas.\"\n\nNão é exagero. Cachear um dado é fácil: você guarda uma cópia e define um tempo de vida. O difícil é saber, com certeza, o momento em que aquela cópia deixou de ser verdade, e fazer alguma coisa a respeito antes que um usuário veja o valor errado."
                    },
                    {
                        "type": "code",
                        "value": "// Rota de leitura, com cache-aside (do módulo 3)\napp.get(\"/produtos/:id\", async (req, res) => {\n  const { id } = req.params;\n  const chave = `produto:${id}`;\n\n  const cacheado = await redis.get(chave);\n  if (cacheado) {\n    return res.json(JSON.parse(cacheado));\n  }\n\n  const resultado = await db.query(\"SELECT * FROM produtos WHERE id = $1\", [id]);\n  const produto = resultado.rows[0];\n\n  await redis.set(chave, JSON.stringify(produto), \"EX\", 300);\n  return res.json(produto);\n});\n\n// Rota de escrita, sem tocar no cache\napp.put(\"/produtos/:id\", async (req, res) => {\n  const { id } = req.params;\n  const { preco } = req.body;\n\n  await db.query(\"UPDATE produtos SET preco = $1 WHERE id = $2\", [preco, id]);\n\n  return res.json({ ok: true });\n  // o banco já tem o preço novo, mas o Redis nem ficou sabendo\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Uma linha do tempo do problema\n\nPensa no produto 123, que custa R$ 100:\n\n1. Um cliente acessa `/produtos/123`. Cache miss, busca no banco, grava no Redis com TTL de 5 minutos (`EX 300`). Resposta: R$ 100.\n2. Um minuto depois, o time administrativo edita o preço para R$ 80 pela rota de UPDATE.\n3. O banco agora diz R$ 80. O Redis, que não foi avisado, continua dizendo R$ 100.\n4. Pelos próximos 4 minutos, até o TTL vencer, todo cliente que acessar `/produtos/123` vai ver R$ 100, mesmo com o banco já corrigido.\n\nO bug não está no Redis, ele fez exatamente o que foi mandado: guardar por 5 minutos. O problema é que ninguém avisou que o dado original mudou no meio do caminho."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Momento\", \"Banco de dados\", \"Cache (Redis)\", \"O que o cliente vê\"], [\"00:00, primeira leitura\", \"R$ 100\", \"vazio, grava R$ 100\", \"R$ 100\"], [\"00:01, UPDATE do preço\", \"R$ 80\", \"ainda R$ 100\", \"R$ 100 (errado)\"], [\"00:02 a 00:04\", \"R$ 80\", \"ainda R$ 100\", \"R$ 100 (errado)\"], [\"00:05, TTL expira\", \"R$ 80\", \"vazio, próxima leitura recarrega\", \"R$ 80 (correto de novo)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Isso não é um defeito do Redis\n\nVale reforçar: nenhuma ferramenta de cache resolve esse problema sozinha. EXPIRE, TTL, política de eviction, nada disso avisa o Redis que o UPDATE aconteceu no banco. Essa ponte quem constrói é você, no código da aplicação. É exatamente disso que trata o resto deste módulo: as estratégias para manter o cache honesto com a realidade do banco."
                    },
                    {
                        "type": "quote",
                        "value": "Cache é uma cópia otimista: ele aposta que o dado não vai mudar até o TTL vencer. Quando essa aposta é errada, alguém recebe um valor que já não existe mais."
                    }
                ],
                "questions": [
                    {
                        "statement": "No contexto de cache, o que significa dizer que um dado está \"stale\" (velho, desatualizado)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A chave expirou e foi removida do Redis automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor no cache está corrompido em disco e não pode mais ser lido pela aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor no cache não corresponde mais ao valor atual no banco",
                                "isCorrect": true
                            },
                            {
                                "text": "A chave ainda não foi gravada e a leitura deu cache miss",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que uma rota de UPDATE altera um registro no banco, mas não faz nada com o Redis, o que acontece com a chave de cache correspondente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Continua existindo com o valor antigo até o TTL expirar",
                                "isCorrect": true
                            },
                            {
                                "text": "É apagada automaticamente pelo Redis assim que o UPDATE roda",
                                "isCorrect": false
                            },
                            {
                                "text": "É atualizada pelo Redis com o novo valor do banco na hora",
                                "isCorrect": false
                            },
                            {
                                "text": "Passa a ser ignorada pela próxima leitura, que vai direto ao banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um catálogo cacheia o preço de cada produto com EX 300 (5 minutos). Às 14:00 o preço do produto 123 é alterado no banco via rota de UPDATE, que não mexe no Redis. A última leitura desse produto, que populou o cache, tinha acontecido às 13:58. Até que horas, aproximadamente, os clientes vão ver o preço antigo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Até as 14:00 em ponto, porque o UPDATE reinicia o TTL da chave no Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "Até a próxima requisição, porque o Redis revalida com o banco antes de responder",
                                "isCorrect": false
                            },
                            {
                                "text": "Para sempre, porque só um restart do Redis limpa a chave da memória",
                                "isCorrect": false
                            },
                            {
                                "text": "Até por volta das 14:03, quando os 5 minutos contados desde as 13:58 vencem",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que, depois de editar a descrição de um curso, a mudança demora minutos para aparecer para os alunos. Investigando, encontram uma rota de cache-aside na leitura e uma rota de UPDATE que só grava no banco. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A política de eviction do Redis está errada e trava a chave desatualizada no lugar",
                                "isCorrect": false
                            },
                            {
                                "text": "A rota de UPDATE não invalida a chave, então o cache serve o valor antigo até o TTL vencer",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta um índice na tabela de cursos, e isso atrasa a propagação da escrita para a leitura",
                                "isCorrect": false
                            },
                            {
                                "text": "O TTL da chave está em zero, o que desliga o cache e deixa toda a leitura mais lenta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação tem duas instâncias do servidor Node rodando atrás de um load balancer, ambas conectadas ao mesmo Redis. Uma delas processa o UPDATE do preço de um produto. Supondo que nenhuma estratégia de invalidação foi implementada ainda, o que se pode afirmar sobre o cache visto pelas duas instâncias?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As duas usam o mesmo Redis, então ambas servem o preço antigo até o TTL vencer",
                                "isCorrect": true
                            },
                            {
                                "text": "Só a instância que processou o UPDATE serve o preço antigo, a outra já reflete o novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada instância tem um cache isolado, então o problema afeta apenas quem fez o UPDATE",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis sincroniza as instâncias automaticamente e nenhuma delas serve o preço antigo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Invalidar por TTL",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Deixar o dado morrer sozinho\n\nA estratégia mais simples de todas nem parece uma estratégia: você já usa ela desde o módulo 3. É o TTL, o tempo de vida que você passa no EX do SET. Em vez de se preocupar em avisar o cache toda vez que o dado muda, você aceita que ele vai ficar desatualizado por um tempo determinado, e configura esse tempo para não doer."
                    },
                    {
                        "type": "code",
                        "value": "// TTL de 5 minutos: depois disso a chave simplesmente some\nawait redis.set(`produto:${id}`, JSON.stringify(produto), \"EX\", 300);\n\n// TTL de 30 segundos: janela de dado velho bem mais curta\nawait redis.set(\"cotacao:dolar\", JSON.stringify(cotacao), \"EX\", 30);\n\n// TTL de 1 dia: para dado que quase nunca muda\nawait redis.set(\"config:frete\", JSON.stringify(configFrete), \"EX\", 86400);"
                    },
                    {
                        "type": "text",
                        "value": "## Por que funciona (às vezes)\n\nQuando a chave expira, o Redis apaga ela sozinho. A próxima leitura dá cache miss, o cache-aside entra em ação, busca a versão atual no banco e recarrega. Nenhum código de invalidação precisa ser escrito na rota de UPDATE. É a estratégia com menos código e menos chance de bug de esquecimento, porque não depende de ninguém lembrar de chamar DEL em lugar nenhum.\n\nO preço dessa simplicidade: entre o momento em que o dado muda no banco e o momento em que o TTL vence, qualquer leitura pode devolver o valor antigo. Quanto maior o TTL, maior essa janela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"TTL curto (ex: 30 segundos)\", \"TTL longo (ex: horas ou dias)\"], [\"Janela de dado velho\", \"Pequena\", \"Grande\"], [\"Carga no banco (taxa de miss)\", \"Alta, recarrega com frequência\", \"Baixa, recarrega raramente\"], [\"Bom para\", \"Dado que muda com frequência (cotação, estoque)\", \"Dado que quase não muda (configuração, categorias)\"], [\"Risco principal\", \"Cache quase não ajuda a poupar o banco\", \"Dado errado por mais tempo se alguém editar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando TTL sozinho é suficiente\n\nTTL puro funciona bem quando um pouco de atraso não quebra nada: uma lista de posts do blog, a contagem aproximada de visualizações, o dashboard interno que ninguém confere segundo a segundo. Ele já não é suficiente sozinho quando o dado precisa refletir uma mudança imediatamente, como o preço no carrinho de compras ou o status de um pagamento. Nesses casos entra a estratégia da próxima aula: invalidar ativamente na escrita."
                    },
                    {
                        "type": "quote",
                        "value": "TTL não corrige o dado errado, ele só garante que o dado errado não dura para sempre. Para muita coisa, isso já é o bastante."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece com uma chave do Redis quando o tempo definido em EX termina?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O Redis busca o valor novo no banco e regrava a chave sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis apaga a chave e ela deixa de existir",
                                "isCorrect": true
                            },
                            {
                                "text": "O Redis bloqueia novas escritas naquela chave até liberar",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis passa a retornar um erro toda vez que a chave é lida",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal desvantagem de confiar só no TTL para manter o cache atualizado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O TTL consome muita memória do Redis e derruba o servidor com o tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis não aceita definir TTL junto com valores gravados via JSON.stringify",
                                "isCorrect": false
                            },
                            {
                                "text": "O TTL só pode ser aplicado a chaves cujo valor seja um número inteiro",
                                "isCorrect": false
                            },
                            {
                                "text": "Entre a mudança no banco e o vencimento do TTL, o cache serve dado velho",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma página lista as categorias de cursos disponíveis, algo que muda talvez uma vez por mês. Qual TTL faz mais sentido para essa chave, considerando que não existe rota de invalidação implementada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um TTL longo, de horas ou até um dia, já que o dado muda muito raramente",
                                "isCorrect": true
                            },
                            {
                                "text": "Um TTL de 1 segundo, para nunca correr o risco de servir algo desatualizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum TTL, deixando a chave permanente no Redis para sempre sem expirar",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo TTL usado na cotação de moeda, para padronizar o cache inteiro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint mostra o saldo disponível em uma carteira digital dentro do app. O time decide cachear esse valor com EX 300 (5 minutos) só para baratear a leitura. Por que essa escolha é arriscada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Guardar números no Redis exige convertê-los para string manualmente antes de cada SET",
                                "isCorrect": false
                            },
                            {
                                "text": "Um TTL de 5 minutos é inválido, porque o Redis aceita no máximo 60 segundos por chave",
                                "isCorrect": false
                            },
                            {
                                "text": "Saldo é sensível a atraso: o usuário pode ver um valor errado por até 5 minutos",
                                "isCorrect": true
                            },
                            {
                                "text": "Dado financeiro nunca pode ser cacheado no Redis sob nenhuma circunstância possível",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de estoque usa só TTL de 2 minutos para cachear a quantidade disponível de cada produto. Durante uma promoção, o estoque de um item zera, mas por até 2 minutos o cache ainda mostra unidades disponíveis, permitindo que clientes finalizem compras de um produto que já acabou. Qual mudança de estratégia resolveria esse problema de forma mais direta, sem abandonar o cache?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o TTL para 10 minutos, para reduzir bastante a carga de leitura sobre o banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar a chave de estoque no cache assim que uma compra decrementa o estoque no banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o Redis por um banco relacional dedicado apenas a esse dado de estoque",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o cache-aside e passar a contar o estoque com INCR no lugar de SET",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Invalidar na escrita (del na hora do update)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## A ideia: avisar o cache quando o dado muda\n\nEm vez de esperar o TTL vencer, dá para agir no exato momento em que o dado muda: assim que o UPDATE roda no banco, você também apaga a chave correspondente no Redis. É a forma mais direta de fechar o buraco que apareceu na primeira aula deste módulo. O preço não fica errado por minutos, fica errado por milissegundos, o tempo entre o commit no banco e o DEL no Redis."
                    },
                    {
                        "type": "code",
                        "value": "app.put(\"/produtos/:id\", async (req, res) => {\n  const { id } = req.params;\n  const { preco, nome } = req.body;\n\n  const resultado = await db.query(\n    \"UPDATE produtos SET preco = $1, nome = $2 WHERE id = $3 RETURNING *\",\n    [preco, nome, id]\n  );\n\n  // só depois que o banco confirmou a escrita, apaga a chave do cache\n  await redis.del(`produto:${id}`);\n\n  return res.json(resultado.rows[0]);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece na próxima leitura\n\nDepois do DEL, a chave `produto:123` não existe mais no Redis. Na próxima vez que alguém acessar `GET /produtos/123`, o cache-aside do módulo 3 entra em ação: dá miss, busca no banco (que já tem o valor novo), grava de novo no cache. O ciclo se autocorrige sozinho, o DEL só precisa garantir que a versão velha não sobrevive.\n\nA mesma lógica vale para a rota de exclusão: depois de `DELETE FROM produtos WHERE id = $1` no banco, chame `await redis.del(chave)` também, senão o produto apagado continua \"existindo\" no cache até o TTL vencer."
                    },
                    {
                        "type": "text",
                        "value": "## Uma variação: escrever o valor novo em vez de só apagar\n\nExiste uma segunda forma de fazer a mesma coisa: em vez de apagar a chave com DEL, você escreve o valor novo direto no cache, com SET, logo depois de salvar no banco. Essa técnica se chama write-through (escrever através do cache). A vantagem é que a próxima leitura já encontra a chave populada, sem passar pelo cache miss; a desvantagem é que você precisa montar o objeto certinho toda vez que escreve, o que é mais código e mais uma chance de gravar algo com formato diferente do que o cache-aside grava na rota de leitura."
                    },
                    {
                        "type": "code",
                        "value": "app.put(\"/produtos/:id\", async (req, res) => {\n  const { id } = req.params;\n  const { preco, nome } = req.body;\n\n  const resultado = await db.query(\n    \"UPDATE produtos SET preco = $1, nome = $2 WHERE id = $3 RETURNING *\",\n    [preco, nome, id]\n  );\n\n  // write-through: grava o valor novo em vez de apagar a chave\n  await redis.set(`produto:${id}`, JSON.stringify(resultado.rows[0]), \"EX\", 300);\n\n  return res.json(resultado.rows[0]);\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\", \"Quando o dado fica fresco\", \"Esforço de implementação\", \"Risco principal\"], [\"TTL sozinho\", \"Só depois que o TTL vence\", \"Nenhum, já vem do cache-aside\", \"Janela de dado velho pode ser longa\"], [\"Invalidar na escrita (DEL)\", \"No próximo GET após o DEL\", \"Baixo, uma linha por rota de escrita\", \"Esquecer de invalidar em algum caminho de escrita\"], [\"Write-through (SET)\", \"Imediatamente, sem miss\", \"Médio, precisa montar o objeto certo\", \"Gravar um formato diferente do que o cache-aside espera\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Apagar o cache na escrita não é sofisticado, é disciplina: todo lugar que muda o dado no banco precisa lembrar de avisar o Redis."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o comando redis.del(\"produto:123\") faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Remove a chave produto:123 do Redis, se ela existir",
                                "isCorrect": true
                            },
                            {
                                "text": "Apaga o registro do produto 123 do banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Renova o TTL da chave produto:123 por mais um ciclo",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloqueia a chave produto:123 contra novas escritas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que uma rota chama redis.del(chave) logo após o UPDATE no banco, o que acontece na próxima leitura dessa chave?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A leitura falha com erro, porque a chave apagada não existe mais",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis devolve o último valor que a chave tinha antes do DEL",
                                "isCorrect": false
                            },
                            {
                                "text": "É preciso reabrir a conexão com o Redis antes de conseguir ler",
                                "isCorrect": false
                            },
                            {
                                "text": "Dá cache miss e o cache-aside busca o valor novo no banco e regrava",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor implementa a rota de UPDATE de pedidos, mas esquece de chamar redis.del depois do db.query. O que os usuários vão ver ao consultar esse pedido logo depois da edição?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um erro 500, porque o cache ficou inconsistente com o banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor novo, porque o Redis percebe mudanças no banco automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "O valor antigo, porque o cache serve a versão velha até o TTL expirar",
                                "isCorrect": true
                            },
                            {
                                "text": "Nada, porque sem redis.del o cache-aside para de funcionar por completo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal desvantagem do write-through comparado a apenas apagar a chave (DEL) na escrita?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O write-through não permite definir um TTL para a chave que ele grava",
                                "isCorrect": false
                            },
                            {
                                "text": "Exige montar e gravar o objeto certo a cada escrita, com risco de formato divergente",
                                "isCorrect": true
                            },
                            {
                                "text": "O write-through obriga sempre a gravar no cache antes de confirmar a escrita no banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "O write-through força apagar todas as outras chaves do Redis a cada escrita",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma rota de UPDATE que precisa manter o cache consistente, por que é mais seguro primeiro confirmar a escrita no banco e só depois chamar redis.del, em vez de apagar a chave no cache antes de escrever no banco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o redis.del só roda depois de uma transação SQL ser commitada, é limitação do Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o db.query é sempre mais rápido que o redis.del e deve rodar antes por performance",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Node não deixa chamar redis.del antes de uma query no banco no mesmo handler",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque uma leitura concorrente pode repovoar a chave com o valor antigo entre o DEL e o commit",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Escolhendo boas chaves de cache",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O nome da chave também é uma decisão de arquitetura\n\nAté aqui, toda chave que usamos identifica um registro só: `produto:123`. Isso não é acaso, é a escolha mais simples para fazer o que vimos nas últimas duas aulas funcionar. Mas cache também serve para guardar listas, resultados de busca, contagens agregadas, e aí a escolha da chave fica bem mais delicada."
                    },
                    {
                        "type": "code",
                        "value": "// chave por id: aponta para um registro específico\nconst chaveProduto = `produto:${id}`;\n\nawait redis.set(chaveProduto, JSON.stringify(produto), \"EX\", 300);\n\n// para invalidar, você sabe exatamente qual chave apagar\nawait redis.del(chaveProduto);"
                    },
                    {
                        "type": "text",
                        "value": "## Por que cache por id é o caso fácil\n\nQuando a chave carrega o id do registro, invalidar é trivial: o UPDATE do produto 123 sabe exatamente qual chave apagar, `produto:123`. Não tem ambiguidade. É por isso que as duas últimas aulas usaram esse padrão o tempo todo."
                    },
                    {
                        "type": "code",
                        "value": "// chave por lista filtrada: uma página de resultados\nconst chaveLista = `produtos:categoria:${categoria}:pagina:${pagina}`;\n\nconst cacheado = await redis.get(chaveLista);\nif (cacheado) {\n  return res.json(JSON.parse(cacheado));\n}\n\nconst produtos = await db.query(\n  \"SELECT * FROM produtos WHERE categoria = $1 ORDER BY nome LIMIT 20 OFFSET $2\",\n  [categoria, pagina * 20]\n);\n\nawait redis.set(chaveLista, JSON.stringify(produtos.rows), \"EX\", 60);"
                    },
                    {
                        "type": "text",
                        "value": "## Por que cache de lista é o caso difícil\n\nPensa no seguinte: o produto 123, categoria eletrônicos, tem o preço editado. Quantas chaves de lista podem estar mostrando esse produto? `produtos:categoria:eletronicos:pagina:1`, talvez `pagina:2` se ele mudou de posição na ordenação, resultados de busca que incluem esse produto, uma lista de mais vendidos. Um `redis.del(\"produto:123\")` não limpa nenhuma dessas chaves, porque nenhuma delas se chama `produto:123`. A invalidação por id que funciona tão bem na aula anterior simplesmente não enxerga essas chaves.\n\nRastrear manualmente quais listas contêm o produto X, para apagar todas elas em cada UPDATE, é possível, mas complexo e frágil: qualquer combinação de filtro, ordenação e página vira uma chave nova em potencial."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Dado velho é aceitável?\", \"Por quê\"], [\"Feed de posts de uma rede social\", \"Sim, por segundos ou minutos\", \"Ordem e novidade aproximadas não incomodam o usuário\"], [\"Contagem de curtidas exibida na tela\", \"Sim, com folga\", \"Ninguém confere o número exato em tempo real\"], [\"Lista de produtos por categoria\", \"Parcialmente, com TTL curto\", \"Um produto sumir ou aparecer com pequeno atraso é tolerável\"], [\"Saldo de conta bancária ou carteira digital\", \"Não\", \"Decisão financeira do usuário depende do valor exato agora\"], [\"Estoque no momento do checkout\", \"Não\", \"Vender um item que já zerou é um erro caro, não só visual\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Cache por id você invalida com precisão cirúrgica. Cache de lista você geralmente só consegue expirar: escolha um TTL curto o bastante para doer pouco."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que uma chave como produto:123 é mais fácil de invalidar do que uma chave como produtos:categoria:eletronicos:pagina:1?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque chaves com dois pontos são lidas mais rápido pelo Redis do que as mais longas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque chaves de lista não aceitam TTL e por isso nunca podem ser invalidadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o UPDATE sabe qual chave por id apagar, mas uma mudança afeta várias listas",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Redis limita cada chave de lista a no máximo vinte itens guardados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de dado onde um pouco de atraso (stale) costuma ser aceitável?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A contagem de curtidas exibida embaixo de um post",
                                "isCorrect": true
                            },
                            {
                                "text": "O saldo disponível na carteira digital do usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade em estoque no instante do checkout",
                                "isCorrect": false
                            },
                            {
                                "text": "O status de aprovação de um pagamento recém-feito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja cacheia produtos:categoria:eletronicos:pagina:1 com os produtos mais vendidos dessa categoria. Um produto novo entra entre os mais vendidos depois de uma promoção, mas o redis.del(\"produto:456\") feito na rota de UPDATE desse produto não afeta a chave da lista. Por que isso acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Redis permite executar apenas um comando DEL a cada segundo",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque listas no Redis não podem ser invalidadas, só produtos individuais",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a chave produto:456 fica em um banco Redis diferente do da lista",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a chave da lista tem um nome diferente e apagar uma não afeta a outra",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide cachear a lista de produtos por categoria com EX 60 (1 minuto) em vez de tentar invalidar essa chave manualmente a cada UPDATE de produto. Que raciocínio justifica essa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o EX 60 faz o Redis invalidar a chave assim que qualquer produto daquela categoria muda",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é difícil saber quais listas um produto afeta, e 1 minuto de atraso é tolerável",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque listas no Redis não aceitam redis.del e só podem usar o comando EXPIRE",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque 60 segundos é o menor valor de TTL que o Redis permite configurar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um e-commerce cacheia tanto produto:123 (por id, invalidado na escrita) quanto produtos:busca:tenis (resultado de busca, só com TTL de 2 minutos). Um cliente edita o nome do produto 123 de \"Tênis Runner\" para \"Tênis Runner Pro\". Qual afirmação descreve corretamente o comportamento esperado do sistema logo após a edição?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As duas chaves mostram o nome novo na hora, porque o del do produto limpa ambas",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das duas chaves atualiza o nome até o servidor Node ser reiniciado por completo",
                                "isCorrect": false
                            },
                            {
                                "text": "A página do produto mostra o nome novo na hora, mas a busca pode levar até 2 minutos",
                                "isCorrect": true
                            },
                            {
                                "text": "A busca atualiza na hora, mas a página do produto fica com o nome antigo por 2 minutos",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Cache stampede e o custo do dado velho",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando o cache expira e todo mundo bate no banco ao mesmo tempo\n\nExiste um jeito de o cache causar um problema pior do que resolver: o cache stampede. Acontece quando uma chave muito acessada expira e, no instante seguinte, um monte de requisições simultâneas dá cache miss ao mesmo tempo e todas correm para o banco de dados buscar o mesmo valor. É parecido com o problema que o rate limit resolve do outro lado: lá você protege a API de excesso de tráfego externo; aqui é o seu próprio cache que, mal configurado, gera um pico de tráfego interno contra o banco."
                    },
                    {
                        "type": "text",
                        "value": "## Um cenário concreto\n\nImagina uma chave produto:destaque que aparece na home da loja e recebe 2 mil requisições por segundo. Ela foi gravada com EX 60. Sessenta segundos depois, a chave expira. No próximo instante, não é uma requisição que dá miss, são centenas, quase simultâneas, porque todas chegaram no mesmo intervalo de tempo. Sem nenhuma proteção, cada uma delas roda a mesma consulta no banco ao mesmo tempo. Um banco que aguentava tranquilamente 2 mil leituras por segundo vindas do Redis pode não aguentar centenas de queries idênticas disparadas no mesmo instante."
                    },
                    {
                        "type": "code",
                        "value": "// cache-aside \"normal\", sem nenhuma defesa contra stampede\napp.get(\"/produtos/destaque\", async (req, res) => {\n  const cacheado = await redis.get(\"produto:destaque\");\n  if (cacheado) {\n    return res.json(JSON.parse(cacheado));\n  }\n\n  // se a chave acabou de expirar, todas as requisições concorrentes\n  // caem aqui ao mesmo tempo e disparam a mesma query\n  const resultado = await db.query(\"SELECT * FROM produtos WHERE destaque = true LIMIT 1\");\n  await redis.set(\"produto:destaque\", JSON.stringify(resultado.rows[0]), \"EX\", 60);\n\n  return res.json(resultado.rows[0]);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Duas defesas comuns\n\nBloqueio (lock): a primeira requisição que encontra a chave expirada marca, no próprio Redis, que já está recalculando o valor, por exemplo com um SET usando a opção NX, que só grava se a chave ainda não existir. Enquanto esse cadeado existe, as outras requisições não repetem a consulta ao banco: esperam um pouco ou servem uma resposta provisória, e só a primeira requisição efetivamente busca no banco e recarrega o cache.\n\nJitter no TTL: em vez de toda chave (ou várias chaves parecidas) expirar exatamente no mesmo segundo, você soma uma variação aleatória pequena ao TTL. Assim, chaves que seriam gravadas ao mesmo tempo não vencem todas juntas, o que espalha os misses ao longo do tempo em vez de concentrar todos no mesmo instante."
                    },
                    {
                        "type": "code",
                        "value": "// bloqueio simples com SET ... NX\nconst chaveLock = \"lock:produto:destaque\";\nconst conseguiuLock = await redis.set(chaveLock, \"1\", \"EX\", 10, \"NX\");\n\nif (conseguiuLock === \"OK\") {\n  // só essa requisição busca no banco e recarrega o cache\n  const resultado = await db.query(\"SELECT * FROM produtos WHERE destaque = true LIMIT 1\");\n  await redis.set(\"produto:destaque\", JSON.stringify(resultado.rows[0]), \"EX\", 60);\n}\n\n// jitter: TTL de 60s mais uma variação aleatória de até 15s\nconst ttlComJitter = 60 + Math.floor(Math.random() * 15);\nawait redis.set(\"produto:destaque\", JSON.stringify(produto), \"EX\", ttlComJitter);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estratégia\", \"Quando o dado fica fresco\", \"Quando usar\"], [\"TTL sozinho\", \"Só depois que o TTL vence\", \"Dado onde um pouco de atraso é tolerável, ou chaves difíceis de invalidar com precisão (listas, buscas)\"], [\"Invalidar na escrita (DEL)\", \"No próximo GET após o UPDATE\", \"Dado com chave clara por id e poucos caminhos de escrita para lembrar de invalidar\"], [\"Write-through (SET)\", \"Imediatamente, sem cache miss\", \"Dado sempre lido logo depois de escrito, quando vale a pena evitar até o primeiro miss\"], [\"Jitter e bloqueio\", \"Não muda o frescor, protege o banco\", \"Chaves muito acessadas (hot keys), onde o miss simultâneo de muitas requisições pode derrubar o banco\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Invalidar cache não tem uma resposta única certa: é sempre uma troca entre frescor do dado, complexidade do código e carga no banco. O trabalho de quem projeta o cache é escolher, dado por dado, qual dessas três coisas pode ceder um pouco."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um cache stampede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quando o Redis fica sem memória disponível e começa a apagar várias chaves de forma aleatória",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando duas chaves diferentes acabam guardando exatamente o mesmo valor",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o TTL de uma chave é configurado com um número negativo por engano",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando uma chave popular expira e muitas requisições dão miss juntas e batem no banco",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que o jitter faz no TTL de chaves de cache?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Soma uma pequena variação aleatória ao tempo de expiração de cada chave",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumenta o TTL de todas as chaves automaticamente durante os picos de tráfego",
                                "isCorrect": false
                            },
                            {
                                "text": "Remove o TTL das chaves mais acessadas para que elas nunca expirem",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz o Redis replicar cada chave em vários servidores por segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma home page cacheia produtos em destaque com EX 60 para todos os visitantes, usando sempre o mesmo valor de TTL. A cada 60 segundos, o time nota um pico de latência no banco. Qual é a explicação mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O banco está sem índice na tabela de produtos, o que deixa cada leitura lenta",
                                "isCorrect": false
                            },
                            {
                                "text": "As chaves expiram quase juntas, muitas requisições dão miss e batem no banco de uma vez",
                                "isCorrect": true
                            },
                            {
                                "text": "O Redis está com pouca memória e faz eviction agressiva de chaves a cada minuto",
                                "isCorrect": false
                            },
                            {
                                "text": "O TTL de 60 segundos é baixo demais para qualquer aplicação e deveria ser removido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa defesa por bloqueio contra cache stampede, a primeira requisição consegue gravar a chave lock:produto:destaque com SET ... NX. O que as outras requisições concorrentes devem fazer nesse momento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Gravar a mesma chave de lock também, sobrescrevendo a que a primeira criou",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar a chave de lock na hora, para liberar logo a próxima requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "Não repetir a query: esperar e reler o cache, pois outra já está recarregando",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o TTL da chave de lock em vez de esperar o valor voltar ao cache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint de produto em destaque recebe milhares de requisições por segundo e tem TTL de 60 segundos sem nenhuma proteção contra stampede. O time tem duas opções: (1) implementar bloqueio com SET NX, que exige controlar o que as requisições concorrentes fazem enquanto esperam, ou (2) aumentar bastante o TTL, aceitando dado mais velho, mas sem nenhum código novo. Em que cenário a opção 2 é razoável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nunca, porque aumentar o TTL não muda em nada a frequência do cache stampede",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre, porque um TTL maior é estritamente melhor do que implementar bloqueio",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas quando o Redis estiver rodando em modo cluster distribuído com várias réplicas ativas",
                                "isCorrect": false
                            },
                            {
                                "text": "Quando o destaque muda raramente e um atraso de alguns minutos não prejudica o negócio",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Filas e processamento assíncrono",
        "aulas": [
            {
                "titulo": "O problema do trabalho lento na requisição",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Filas: tirando o trabalho pesado de dentro da requisição\n\nAté aqui você aprendeu a medir (módulo 1), cachear leituras caras (módulos 2 e 3) e manter esse cache coerente quando o dado muda (módulo 4). Cache resolve um problema específico: não repetir uma leitura que já foi feita.\n\nMas nem toda lentidão vem de reler o banco. Às vezes a requisição precisa **fazer** alguma coisa, não só **buscar** alguma coisa. E fazer coisas pode ser lento de um jeito que cache nenhum resolve."
                    },
                    {
                        "type": "text",
                        "value": "## O que trava a requisição\n\nAlguns exemplos comuns de trabalho pesado dentro de uma rota:\n\n- **Enviar um e-mail de confirmação**: sua aplicação precisa conversar com um provedor de e-mail (SMTP ou uma API tipo SendGrid, SES). Esse provedor está em outro servidor, na internet, e pode demorar segundos para responder.\n- **Gerar um PDF ou relatório**: montar um documento com centenas de linhas consome CPU de verdade, não é uma operação instantânea.\n- **Processar upload de imagem**: redimensionar, cortar ou converter uma imagem grande também é trabalho pesado de CPU.\n- **Chamar uma API externa lenta**: um gateway de pagamento, um serviço de CEP, uma integração de terceiro. Você não controla o tempo de resposta deles.\n\nRepare que nenhum desses casos é 'consultar o banco de novo'. São coisas novas, que ainda não tinham acontecido, então não tem cache que ajude."
                    },
                    {
                        "type": "code",
                        "value": "// rota de cadastro fazendo tudo na hora (aqui está o problema)\napp.post('/cadastro', async (req, res) => {\n  const { nome, email, senha } = req.body;\n\n  const usuario = await db.usuarios.criar({ nome, email, senha });\n\n  // isso aqui pode levar de 1 a alguns segundos, dependendo do provedor\n  await enviarEmailBoasVindas(usuario.email);\n\n  res.status(201).json(usuario);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O efeito na latência\n\nO tempo de resposta dessa rota agora é: tempo de salvar no banco, mais o tempo de enviar o e-mail. Se o provedor está rápido, ninguém percebe. Se ele engasgar (e serviços externos engasgam), a sua rota engasga junto.\n\nLembra do p95 e do p99 do módulo 1? Esse é exatamente o tipo de coisa que estica a cauda da distribuição: a maioria dos cadastros fica rápida, mas uma fatia fica presa esperando um serviço que você nem controla. E se o provedor cair de vez, a sua rota de cadastro cai junto, mesmo que salvar o usuário no banco continue funcionando perfeitamente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de trabalho\", \"Exemplo\", \"Por que é lento\", \"Cache resolve?\"], [\"Chamada externa\", \"Chamar gateway de pagamento\", \"Depende do tempo de resposta de outro serviço, fora do seu controle\", \"Não\"], [\"Processamento (CPU)\", \"Gerar PDF de relatório\", \"Processar de verdade consome tempo de CPU\", \"Não\"], [\"Processamento (CPU)\", \"Redimensionar imagem de upload\", \"Processar imagem consome CPU\", \"Não\"], [\"Chamada externa\", \"Enviar e-mail de confirmação\", \"Espera a resposta do provedor de e-mail\", \"Não\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Cache evita reler o que não mudou. Mas enviar um e-mail, gerar um PDF ou chamar uma API externa não é releitura, é trabalho novo. Para esse tipo de lentidão, a resposta não é cachear, é tirar esse trabalho de dentro da requisição."
                    }
                ],
                "questions": [
                    {
                        "statement": "Depois de cadastrar o usuário, a rota chama o provedor de e-mail e espera a resposta antes de devolver o JSON ao cliente. Esse envio às vezes demora 3 segundos até o provedor aceitar a mensagem. O que isso causa diretamente no tempo de resposta da rota?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tempo de resposta cresce, porque a rota só devolve depois que o envio termina",
                                "isCorrect": true
                            },
                            {
                                "text": "O tempo de resposta não muda, porque enviar e-mail é uma leitura sem custo",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de resposta cai, porque o Node envia o e-mail em outra thread em paralelo",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo do banco cresce, porque o envio de e-mail consome conexões do pool",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de trabalho que deixa uma requisição lenta por depender de rede (chamar um serviço externo), e não por consumir CPU?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Gerar um PDF de relatório com muitas linhas de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Chamar a API de um gateway de pagamento externo",
                                "isCorrect": true
                            },
                            {
                                "text": "Redimensionar uma imagem grande em uma miniatura",
                                "isCorrect": false
                            },
                            {
                                "text": "Calcular o hash de uma senha com muitas iterações",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você percebe que o p95 de uma rota de cadastro subiu bastante depois que ela passou a enviar um e-mail de boas-vindas na hora. A maior parte das requisições continua rápida, mas uma fatia significativa demora vários segundos porque o provedor de e-mail está instável. O que essa observação sugere?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O banco ficou lento e precisa ser trocado por um mais rápido para baixar o p95",
                                "isCorrect": false
                            },
                            {
                                "text": "O p95 ignora chamadas de rede e reflete apenas o número de consultas ao banco",
                                "isCorrect": false
                            },
                            {
                                "text": "O envio de e-mail depende de um serviço externo instável e puxa a cauda da latência",
                                "isCorrect": true
                            },
                            {
                                "text": "O gargalo está no cliente, já que o servidor não tem efeito algum sobre o p95",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide colocar um cache (Redis, com TTL) na frente do envio do e-mail de boas-vindas, achando que isso vai resolver a lentidão da rota. Por que essa solução não funciona nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o Redis só guarda números e o corpo de um e-mail é texto puro",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o cache-aside funciona com o PostgreSQL, mas não com provedores de e-mail",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o TTL do cache não pode ser aplicado a rotas de cadastro de usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque enviar o e-mail é uma ação única por usuário, não uma leitura repetida cacheável",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Hoje a rota de cadastro faz, em sequência: salva o usuário no banco, chama o provedor de e-mail e espera a confirmação, devolve 201 com os dados do usuário. Em um pico de tráfego, o provedor de e-mail passa a responder em 8 a 10 segundos. Considerando um timeout comum de 5 segundos no proxy/load balancer, o que provavelmente acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O Node cancela o envio após 5 segundos e ainda assim devolve 201 ao cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "As requisições estouram o timeout do proxy e falham, mesmo com o usuário já salvo",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco desfaz a criação do usuário automaticamente porque o e-mail demorou demais",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada acontece, pois o timeout do proxy afeta apenas requisições do tipo GET",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A ideia de fila: produtor, job e consumidor",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tirar senha e sentar\n\nPensa numa agência dos Correios ou num banco com aquelas senhas de atendimento. Você chega, tira uma senha (um número que descreve que você precisa de atendimento) e senta. Você não fica em pé no balcão esperando o atendente ficar livre. Alguém vai te chamar quando for a sua vez, e até lá você faz outra coisa.\n\nÉ essa a ideia por trás de uma fila de processamento: em vez de fazer o trabalho pesado na hora, dentro da requisição, você descreve o trabalho, entrega essa descrição para a fila, e segue em frente."
                    },
                    {
                        "type": "text",
                        "value": "## Três peças\n\n- **Job**: a descrição do trabalho a ser feito. No caso do e-mail de boas-vindas, o job carrega o que é preciso para enviar aquele e-mail (por exemplo, o id do usuário e o endereço).\n- **Produtor**: quem cria o job e coloca na fila. Normalmente é o código da sua rota, no momento em que a requisição chega.\n- **Consumidor (worker)**: um processo separado, que roda por conta própria, pegando jobs da fila e executando o trabalho de verdade.\n\nA fila em si (guardada no Redis, o mesmo Redis do módulo 3) é só o lugar onde o job espera entre o momento em que foi criado e o momento em que alguém vai processá-lo."
                    },
                    {
                        "type": "text",
                        "value": "## O caminho de um job\n\n1. A requisição chega na rota (por exemplo, `POST /cadastro`).\n2. A rota monta um job com os dados necessários e coloca na fila.\n3. A rota responde ao cliente. Ela não espera o job ser processado.\n4. Em outro processo, rodando separadamente, o worker está de olho na fila. Quando um job aparece, ele pega e processa.\n\nRepare que os passos 3 e 4 acontecem sem relação direta de tempo. O worker pode pegar o job um milissegundo depois, ou alguns segundos depois, dependendo de quantos jobs já estão na fila e de quão rápido o worker consegue processar."
                    },
                    {
                        "type": "code",
                        "value": "// PRODUTOR: roda dentro da rota, só descreve o trabalho e entrega\nawait emailQueue.add('enviar-boas-vindas', { userId: usuario.id, email: usuario.email });\n\n// CONSUMIDOR: roda num processo separado (o worker)\n// é ele que vai pegar esse job e de fato enviar o e-mail\n// (como escrever esse worker é assunto do módulo 6)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Produtor\", \"Consumidor (worker)\"], [\"Onde roda\", \"Dentro da rota, no processo da API\", \"Em um processo separado, dedicado\"], [\"Quando roda\", \"No momento da requisição\", \"Quando aparece um job disponível na fila\"], [\"O que faz\", \"Descreve o job e entrega para a fila\", \"Pega o job e executa o trabalho de verdade\"], [\"Devolve o quê\", \"Confirmação de que o job foi enfileirado\", \"O resultado do processamento (não vai direto para quem fez a requisição original)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Produtor e consumidor são responsabilidades separadas, rodando em processos separados. Quem enfileira não precisa saber quando (nem exatamente como) o trabalho vai ser feito, só precisa descrever o que precisa ser feito."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na analogia da fila de atendimento (tirar senha e sentar, em vez de ficar no balcão), o que representa a senha que você tira?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O worker, que é quem vai de fato te atender no balcão",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados onde o atendimento fica registrado",
                                "isCorrect": false
                            },
                            {
                                "text": "O job, a descrição do trabalho colocada na fila",
                                "isCorrect": true
                            },
                            {
                                "text": "A conexão HTTP aberta entre o cliente e a API",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma arquitetura com fila, quem é o produtor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quem processa o job e executa o trabalho pesado de verdade",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis, que é onde os jobs ficam armazenados na fila",
                                "isCorrect": false
                            },
                            {
                                "text": "O cliente que disparou a requisição HTTP para a API",
                                "isCorrect": false
                            },
                            {
                                "text": "Quem cria o job e o coloca na fila, em geral a rota",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor quer colocar no job de 'gerar relatório' o objeto inteiro do usuário, já com todos os pedidos e itens carregados do banco, para o worker não precisar consultar nada depois. Por que essa prática costuma ser problemática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O job é serializado na fila, então um payload grande pesa e pode ficar desatualizado",
                                "isCorrect": true
                            },
                            {
                                "text": "O BullMQ não aceita objetos como dados de job, somente strings simples de texto",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis impõe um limite fixo de dez jobs por fila e recusa todo o restante",
                                "isCorrect": false
                            },
                            {
                                "text": "O worker sempre descarta os dados do job e busca tudo de novo no banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença fundamental entre o produtor e o consumidor (worker) numa fila?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São sempre o mesmo processo, que só troca de nome conforme o horário do dia",
                                "isCorrect": false
                            },
                            {
                                "text": "O produtor entrega o trabalho na requisição; o consumidor o executa em outro processo",
                                "isCorrect": true
                            },
                            {
                                "text": "O produtor só existe em sistemas que usam um banco de dados relacional",
                                "isCorrect": false
                            },
                            {
                                "text": "O consumidor roda antes do produtor para preparar os dados que serão enfileirados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa API de e-commerce, a rota de finalizar pedido enfileira um job 'gerar-nota-fiscal' passando apenas { pedidoId }. Alguém sugere passar o pedido inteiro (itens, valores, endereço) para evitar uma consulta no worker. Qual é o principal argumento para manter só o pedidoId no job?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O BullMQ não permite mais de um campo dentro do objeto de dados do job",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar o banco no worker é sempre mais rápido do que ler o dado do job",
                                "isCorrect": false
                            },
                            {
                                "text": "Se o pedido mudar até processar, o worker lê o dado atual e emite a nota correta",
                                "isCorrect": true
                            },
                            {
                                "text": "Jobs com muitos campos travam o Redis de forma permanente e causam perda de dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Responder rápido: 202 e o trabalho em segundo plano",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que devolver quando o trabalho ainda não terminou\n\nSe a rota de cadastro agora só enfileira o e-mail em vez de enviar na hora, o que ela devolve para o cliente? O usuário foi criado, isso já aconteceu de verdade. Mas o e-mail ainda nem começou a ser processado.\n\nPara esse tipo de situação existe um status HTTP específico: **202 Accepted**. Ele diz 'recebi a sua solicitação e vou cuidar dela', sem prometer que o trabalho já terminou."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Status\", \"Significado\", \"Quando usar\"], [\"200 OK\", \"A operação terminou e o resultado está na resposta\", \"Uma leitura, ou uma escrita que já foi concluída de ponta a ponta\"], [\"201 Created\", \"Um recurso foi criado e já existe\", \"O usuário foi salvo no banco com sucesso\"], [\"202 Accepted\", \"A solicitação foi aceita, mas o processamento ainda vai acontecer\", \"O job foi enfileirado; o trabalho de verdade roda depois, no worker\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// emailQueue já está configurado com BullMQ (o setup completo vem na próxima aula)\napp.post('/cadastro', async (req, res) => {\n  const { nome, email, senha } = req.body;\n\n  const usuario = await db.usuarios.criar({ nome, email, senha });\n\n  // só entrega o job para a fila, não espera o e-mail ser enviado de fato\n  await emailQueue.add('enviar-boas-vindas', { userId: usuario.id, email: usuario.email });\n\n  res.status(202).json({\n    usuario,\n    mensagem: 'Cadastro recebido. Você vai receber um e-mail de confirmação em breve.'\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O que 202 não quer dizer\n\n202 não é 'deu certo, terminou tudo'. É 'aceitei, vou processar'. O cliente que recebe um 202 sabe que existe um trabalho em andamento, mas não sabe o resultado final ainda.\n\nIsso muda um pouco a conversa com quem consome a API. Se o front-end precisa saber quando o e-mail realmente foi enviado (ou quando o relatório ficou pronto), a resposta imediata da rota não é o lugar certo para isso. Esse tipo de acompanhamento (consultar o status depois, ou ser avisado quando terminar) é um problema à parte, que a fila sozinha não resolve."
                    },
                    {
                        "type": "text",
                        "value": "## O ganho direto\n\nCompare os dois cenários: sem fila, o tempo de resposta da rota inclui o tempo de enviar o e-mail. Com fila, o tempo de resposta é só o tempo de salvar o usuário e colocar o job no Redis, que costuma ser questão de milissegundos.\n\nÉ o mesmo cadastro, o mesmo trabalho sendo feito, só que a parte lenta saiu de dentro da requisição. O p95 e o p99 dessa rota devem cair bastante, porque a variação de tempo do provedor de e-mail não afeta mais a resposta ao cliente."
                    },
                    {
                        "type": "quote",
                        "value": "202 Accepted é uma promessa de início, não de fim. Ele tira o tempo do trabalho pesado de dentro da resposta, mas o resultado desse trabalho só existe depois, em outro momento."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual status HTTP é o mais adequado para uma rota que aceitou a solicitação e vai processá-la depois, em segundo plano, mas ainda não completou o trabalho?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "200 OK",
                                "isCorrect": false
                            },
                            {
                                "text": "404 Not Found",
                                "isCorrect": false
                            },
                            {
                                "text": "500 Internal Server Error",
                                "isCorrect": false
                            },
                            {
                                "text": "202 Accepted",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A rota de cadastro agora enfileira o e-mail de boas-vindas em vez de enviar na hora. O que ela deve fazer imediatamente depois de chamar emailQueue.add()?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Responder ao cliente sem esperar o e-mail ser realmente enviado",
                                "isCorrect": true
                            },
                            {
                                "text": "Esperar o worker confirmar a entrega do e-mail antes de responder",
                                "isCorrect": false
                            },
                            {
                                "text": "Fechar a conexão com o Redis e tentar enfileirar o job de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Repetir a chamada de add três vezes para garantir a entrega",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um front-end recebe 202 Accepted da rota de cadastro e, logo em seguida, mostra na tela a mensagem 'seu e-mail de confirmação foi enviado com sucesso'. Qual é o problema dessa mensagem?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não há problema algum, porque 202 é sinônimo de operação concluída com sucesso",
                                "isCorrect": false
                            },
                            {
                                "text": "O 202 diz que a solicitação foi aceita, não que o e-mail já foi enviado",
                                "isCorrect": true
                            },
                            {
                                "text": "O front deveria exibir um erro, já que 202 sempre representa uma falha",
                                "isCorrect": false
                            },
                            {
                                "text": "O 202 já traz a confirmação de entrega do e-mail dentro do corpo da resposta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota POST /relatorios não cria nenhum recurso imediato: ela só enfileira o job que vai gerar um PDF, que ficará pronto minutos depois. Qual status descreve melhor essa resposta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "201 Created, porque um arquivo PDF já foi criado no disco neste instante",
                                "isCorrect": false
                            },
                            {
                                "text": "200 OK, porque o relatório já está pronto e pode ser baixado agora",
                                "isCorrect": false
                            },
                            {
                                "text": "202 Accepted, porque a solicitação foi aceita mas o PDF ainda não existe",
                                "isCorrect": true
                            },
                            {
                                "text": "204 No Content, porque não há nenhum trabalho a ser processado aqui",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe muda a rota de cadastro para enfileirar o e-mail e responder 202 imediatamente. Depois da mudança, o suporte recebe reclamações de usuários dizendo 'me cadastrei mas não sei se deu certo, não recebi nada'. A fila e o worker estão funcionando corretamente. Qual é a explicação mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A fila perdeu os jobs, pois o Redis não guarda dados depois de enviar o 202",
                                "isCorrect": false
                            },
                            {
                                "text": "O 202 é um código de erro e por isso o cadastro na verdade falhou",
                                "isCorrect": false
                            },
                            {
                                "text": "O BullMQ exige confirmação síncrona do cliente antes de processar cada job",
                                "isCorrect": false
                            },
                            {
                                "text": "O 202 só garante o aceite; sem status visível, a experiência parece incerta",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Enfileirando com BullMQ (o produtor)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## BullMQ por cima do Redis\n\nVocê já conhece o Redis desde o módulo 3: um armazém de chave-valor rápido, que você acessa do Node com ioredis. O BullMQ é uma biblioteca de filas que usa o Redis por baixo dos panos para guardar os jobs, controlar a ordem e coordenar quem está processando o quê.\n\nOu seja: você não precisa reinventar fila usando SET e GET na mão. O BullMQ já resolve isso, você só usa a API dele."
                    },
                    {
                        "type": "code",
                        "value": "import { Queue } from 'bullmq';\n\nconst connection = {\n  host: '127.0.0.1',\n  port: 6379\n};\n\nconst emailQueue = new Queue('emails', { connection });"
                    },
                    {
                        "type": "text",
                        "value": "## O nome da fila\n\nO primeiro argumento de `new Queue(...)`, aqui `'emails'`, é o nome da fila. É esse nome que liga o produtor ao consumidor: um worker que escuta a fila `'emails'` só vai pegar jobs colocados nessa fila.\n\nNuma aplicação real você costuma ter mais de uma fila, uma para cada tipo de trabalho: `'emails'`, `'relatorios'`, `'processamento-imagem'`. Isso deixa claro o que cada fila faz e permite escalar cada uma de um jeito diferente (por exemplo, mais workers na fila que processa imagem, que é mais pesada)."
                    },
                    {
                        "type": "code",
                        "value": "import { Queue } from 'bullmq';\n\nconst connection = { host: '127.0.0.1', port: 6379 };\nconst emailQueue = new Queue('emails', { connection });\n\napp.post('/cadastro', async (req, res) => {\n  const { nome, email, senha } = req.body;\n\n  const usuario = await db.usuarios.criar({ nome, email, senha });\n\n  await emailQueue.add('enviar-boas-vindas', {\n    userId: usuario.id,\n    email: usuario.email\n  });\n\n  res.status(202).json({ usuario, mensagem: 'Cadastro recebido, e-mail a caminho.' });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O que colocar nos dados do job\n\nO segundo argumento de `queue.add(nome, dados)` vira JSON guardado no Redis. Por isso, prefira mandar pouca coisa: ids e informações essenciais, não o objeto inteiro carregado do banco.\n\nRepare no exemplo acima: o job carrega `userId` e `email`, não o usuário inteiro com todos os campos. Quando o worker for processar (módulo 6), ele pode buscar o que precisar com dado atualizado, em vez de trabalhar com uma fotografia do usuário que pode estar velha na hora em que o job realmente rodar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fila\", \"Nome do job\", \"Dados enviados\", \"Quem processa depois\"], [\"emails\", \"enviar-boas-vindas\", \"{ userId, email }\", \"worker de e-mail (módulo 6)\"], [\"relatorios\", \"gerar-relatorio-vendas\", \"{ pedidoId, formato }\", \"worker de relatório\"], [\"processamento-imagem\", \"gerar-miniaturas\", \"{ caminhoArquivo, usuarioId }\", \"worker de imagem\"], [\"pagamentos\", \"consultar-status-pagamento\", \"{ pagamentoId }\", \"worker que chama a API externa\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O produtor tem uma responsabilidade só: descrever o trabalho e entregar para a fila com queue.add. Ele não processa nada, não sabe quando o job vai rodar, e isso é exatamente o ponto: a rota fica livre para responder assim que entrega o job."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual classe do BullMQ é usada no lado do produtor para colocar jobs em uma fila?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Queue",
                                "isCorrect": true
                            },
                            {
                                "text": "Worker",
                                "isCorrect": false
                            },
                            {
                                "text": "Connection",
                                "isCorrect": false
                            },
                            {
                                "text": "Scheduler",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No trecho const emailQueue = new Queue('emails', { connection }), o que representa a string 'emails'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O nome do banco PostgreSQL que a aplicação usa por baixo dos panos",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome da fila, onde os jobs ficam e de onde os workers consomem",
                                "isCorrect": true
                            },
                            {
                                "text": "O endereço do servidor Redis ao qual o BullMQ se conecta por baixo",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do usuário que está fazendo a requisição HTTP no momento",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de criar o usuário no banco, você quer enfileirar o envio do e-mail de boas-vindas com BullMQ. Dado const emailQueue = new Queue('emails', { connection }), qual chamada enfileira corretamente um job chamado 'enviar-boas-vindas' com os dados { userId, email }?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "await emailQueue.send('enviar-boas-vindas', { userId, email })",
                                "isCorrect": false
                            },
                            {
                                "text": "await emailQueue.push('enviar-boas-vindas', { userId, email })",
                                "isCorrect": false
                            },
                            {
                                "text": "await emailQueue.add('enviar-boas-vindas', { userId, email })",
                                "isCorrect": true
                            },
                            {
                                "text": "await emailQueue.emit('enviar-boas-vindas', { userId, email })",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de cadastro cria o usuário no banco, depois chama await emailQueue.add(...), e só então devolve a resposta. Um colega sugere colocar o await emailQueue.add(...) num try/catch separado do try/catch usado para salvar o usuário. Por que essa separação faz sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o JavaScript permite apenas um bloco try/catch por função declarada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o BullMQ exige que cada chamada de add fique em um arquivo separado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque separar os blocos try/catch faz o Redis responder mais rápido às chamadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque falhar ao enfileirar difere de falhar ao salvar, e não deve desfazer o cadastro",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de upload de imagem salva o arquivo original, cria a fila com const imageQueue = new Queue('imagens', { connection }) e enfileira com await imageQueue.add('processar-imagem', { caminhoArquivo, usuarioId }). Por que passar caminhoArquivo (em vez do buffer da imagem inteira) como dado do job é a escolha mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O job é serializado no Redis; um buffer pesaria, e o caminho é uma referência leve",
                                "isCorrect": true
                            },
                            {
                                "text": "O BullMQ não aceita buffers como tipo de dado de job em nenhuma hipótese",
                                "isCorrect": false
                            },
                            {
                                "text": "Caminhos de arquivo são processados mais rápido que qualquer outro dado no Node",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis apaga sozinho qualquer job que tenha mais de um campo de dados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que a fila te dá (e o que ela cobra)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que você ganha\n\nDepois de mover o e-mail de boas-vindas (ou o relatório, ou o processamento de imagem) para uma fila, alguns ganhos aparecem direto:\n\n- **O usuário não espera** o trabalho pesado. A resposta da rota fica rápida e previsível.\n- **Resiliência**: se o provedor de e-mail cair, o job simplesmente fica esperando na fila (guardado no Redis) até que um worker consiga processá-lo, em vez de a requisição inteira falhar. Como o worker lida com falha e tentativa de novo é assunto do módulo 6.\n- **Controle de vazão**: dá para decidir quantos jobs são processados ao mesmo tempo, em vez de deixar todo mundo bater no provedor externo (ou no processador de imagem) ao mesmo tempo."
                    },
                    {
                        "type": "text",
                        "value": "## O que você paga\n\nFila não é de graça. Ela troca 'a rota demorar' por outras coisas:\n\n- **Mais peças rodando**: agora existe o Redis guardando os jobs e, além da API, um processo de worker que também precisa estar no ar, ser implantado e monitorado.\n- **Resultado não é imediato**: o trabalho termina depois, não durante a resposta da requisição. Se alguém precisa saber quando terminou, isso é um problema à parte para resolver.\n- **Mais um lugar para depurar**: quando algo dá errado, o erro não aparece mais só no log da rota, pode estar no worker, rodando em outro momento, possivelmente em outro processo ou máquina."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Síncrono na requisição\", \"Assíncrono via fila\"], [\"Tempo de resposta da rota\", \"Inclui o tempo do trabalho pesado\", \"Só o tempo de enfileirar (rápido)\"], [\"Se o serviço externo cair\", \"A requisição falha ou trava\", \"O job espera na fila até poder ser processado\"], [\"Quando o resultado fica pronto\", \"Junto com a resposta HTTP\", \"Depois, de forma independente\"], [\"Peças de infraestrutura\", \"Só a API\", \"API, Redis e worker\"], [\"Controle de vazão\", \"Difícil, cada requisição dispara o trabalho na hora\", \"Dá para limitar quantos jobs processam ao mesmo tempo\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// o worker pode estar fora do ar no momento em que você enfileira, sem problema:\n// o job já fica guardado no Redis esperando\nawait emailQueue.add('enviar-boas-vindas', { userId: usuario.id, email: usuario.email });\n\n// quando algum worker (módulo 6) subir e começar a escutar a fila 'emails',\n// ele encontra esse job esperando e processa"
                    },
                    {
                        "type": "text",
                        "value": "## Quando vale a pena\n\nFila compensa quando o trabalho é lento, depende de algo externo, ou é pesado o suficiente para atrapalhar a resposta da rota. Para um INSERT rápido de poucos milissegundos, sem chamada externa nenhuma, colocar uma fila no meio só adiciona complexidade sem resolver problema nenhum.\n\nA pergunta que vale fazer antes de enfileirar algo é: esse trabalho está deixando a requisição lenta ou frágil de um jeito que o usuário sente? Se sim, fila ajuda. Se não, provavelmente é complexidade desnecessária."
                    },
                    {
                        "type": "quote",
                        "value": "Fila troca demora perceptível por complexidade de operação: mais uma peça de infraestrutura, um processo a mais rodando, um resultado que chega depois. Vale a troca quando o trabalho é pesado, externo ou pode esperar; não vale quando o trabalho já era rápido."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo é um benefício direto de processar o envio de e-mail numa fila em vez de dentro da requisição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O e-mail é enviado antes mesmo de o usuário concluir o cadastro no sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "O usuário não espera o tempo de envio do e-mail para receber a resposta",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados deixa de precisar guardar o registro do novo usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "A fila elimina por completo a necessidade de existir um worker rodando",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das situações abaixo é um custo real de adotar filas com BullMQ, comparado a fazer tudo direto na requisição?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O código da rota fica maior do que fazer o trabalho de forma síncrona",
                                "isCorrect": false
                            },
                            {
                                "text": "A fila deixa a resposta da requisição mais lenta do que fazer o trabalho na hora",
                                "isCorrect": false
                            },
                            {
                                "text": "Passam a existir mais peças no ar: o Redis guardando jobs e um worker separado",
                                "isCorrect": true
                            },
                            {
                                "text": "O BullMQ substitui o banco de dados e dispensa a persistência dos registros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O provedor de e-mail fica fora do ar por 20 minutos. Durante esse período, a aplicação continua recebendo cadastros normalmente e enfileirando os jobs de boas-vindas. O que acontece com esses jobs enquanto não há worker conseguindo processá-los com sucesso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São apagados da fila automaticamente após cinco segundos sem processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "A aplicação para de aceitar novos cadastros até o provedor de e-mail voltar",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis transforma os jobs pendentes em erros HTTP 500 para o cliente",
                                "isCorrect": false
                            },
                            {
                                "text": "Ficam guardados na fila, no Redis, esperando o worker conseguir processar depois",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Comparando trabalho síncrono na requisição com trabalho assíncrono via fila, qual afirmação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No síncrono o resultado vem na resposta; com fila ele fica pronto depois do aceite",
                                "isCorrect": true
                            },
                            {
                                "text": "Com fila, a resposta HTTP já traz o resultado final do processamento pronto",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo síncrono escala melhor que o de fila em qualquer volume de trabalho",
                                "isCorrect": false
                            },
                            {
                                "text": "Filas eliminam por completo a necessidade de medir o p95 e o p99 das rotas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe pequena, com um único servidor e baixíssimo tráfego, tem uma rota que só faz um INSERT rápido no banco (menos de 10ms) e nada mais, sem chamadas externas nem processamento pesado. Alguém sugere colocar esse INSERT numa fila do BullMQ para 'seguir a boa prática'. Isso faz sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, toda escrita no banco de dados deveria obrigatoriamente passar por uma fila",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o BullMQ torna qualquer operação de banco automaticamente mais rápida",
                                "isCorrect": false
                            },
                            {
                                "text": "Não: um INSERT rápido não tem o problema que a fila resolve, só somaria complexidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque o BullMQ funciona apenas com leituras e nunca com comandos de INSERT",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Workers, retries e idempotência",
        "aulas": [
            {
                "titulo": "O worker: consumindo a fila",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 6 - Workers, retries e idempotência\n\nNo módulo anterior você viu a metade produtora da fila: uma rota Express que enfileira um job com `queue.add` e responde rápido, enquanto o trabalho pesado (mandar um email, gerar um relatório) fica para depois. Mas um job parado na fila não faz nada sozinho. Alguém precisa pegar aquele job e executar o trabalho de verdade: esse alguém é o worker.\n\n## O worker: quem consome a fila\n\nO worker é um processo que fica escutando uma fila continuamente. Quando aparece um job novo, ele pega o job, roda a função de processamento com os dados daquele job e, no final, marca o resultado (deu certo ou deu erro). No BullMQ, isso é a classe Worker."
                    },
                    {
                        "type": "code",
                        "value": "import { Worker } from \"bullmq\";\n\nconst connection = { host: \"127.0.0.1\", port: 6379 };\n\nconst emailWorker = new Worker(\n  \"emails\",\n  async (job) => {\n    const { to, subject, body } = job.data;\n\n    console.log(`Enviando email para ${to}`);\n    await enviarEmail(to, subject, body);\n\n    return { enviadoEm: new Date().toISOString() };\n  },\n  { connection }\n);\n\nemailWorker.on(\"completed\", (job) => {\n  console.log(`Job ${job.id} concluído`);\n});\n\nemailWorker.on(\"failed\", (job, err) => {\n  console.error(`Job ${job?.id} falhou: ${err.message}`);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Um processo à parte\n\nEsse worker roda separado do servidor web, normalmente em outro arquivo (por exemplo, worker.js) executado com node worker.js, em outro processo do PM2, outro container ou outro serviço. A rota Express que faz queue.add nunca espera o worker terminar: ela só entrega o job e segue a vida.\n\nIsso importa por dois motivos. Se o worker cair, a API continua respondendo normalmente (os jobs só se acumulam esperando um worker voltar). Se a API cair, os jobs que já estão na fila continuam guardados no Redis, esperando um worker vir buscar. Um problema não derruba o outro.\n\n## Concorrência: mais de um job ao mesmo tempo"
                    },
                    {
                        "type": "code",
                        "value": "const emailWorker = new Worker(\n  \"emails\",\n  async (job) => {\n    await enviarEmail(job.data.to, job.data.subject, job.data.body);\n  },\n  {\n    connection,\n    concurrency: 5,\n  }\n);"
                    },
                    {
                        "type": "text",
                        "value": "Com concurrency: 5, esse único processo worker processa até 5 jobs em paralelo (o Node consegue, porque enviar um email é trabalho de I/O: o processo fica esperando resposta da rede, não é uma conta pesada de CPU). Além disso, nada impede rodar vários processos worker consumindo a mesma fila: o BullMQ distribui os jobs entre eles automaticamente, sem que um pegue o job que o outro já pegou.\n\n## O ciclo de vida de um job\n\nEnquanto caminha entre produtor e worker, um job passa por estados bem definidos, guardados no Redis:"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Estado\", \"O que significa\"], [\"waiting\", \"o job está na fila, esperando um worker livre pegar ele\"], [\"delayed\", \"o job está agendado para rodar só depois de um tempo, ou aguardando a próxima tentativa de retry\"], [\"active\", \"um worker pegou o job e está executando a função de processamento agora\"], [\"completed\", \"a função rodou até o fim sem lançar erro\"], [\"failed\", \"a função lançou um erro e as tentativas configuradas se esgotaram\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Quem enfileira e quem processa são dois processos diferentes: a rota web só entrega o job e segue em frente; o worker é quem, de fato, faz o trabalho, no seu próprio ritmo."
                    }
                ],
                "questions": [
                    {
                        "statement": "No BullMQ, qual classe é responsável por executar de fato o código que processa um job?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Queue",
                                "isCorrect": false
                            },
                            {
                                "text": "Worker",
                                "isCorrect": true
                            },
                            {
                                "text": "QueueEvents",
                                "isCorrect": false
                            },
                            {
                                "text": "FlowProducer",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Além do nome da fila e da função que processa o job, o que new Worker(...) precisa receber para saber em qual Redis se conectar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número de tentativas definido em attempts",
                                "isCorrect": false
                            },
                            {
                                "text": "A URL da rota que enfileirou o job",
                                "isCorrect": false
                            },
                            {
                                "text": "Um objeto connection apontando para o Redis",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome do banco de dados relacional da aplicação",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe roda o servidor Express e o worker de emails no mesmo processo Node. Quando o envio de email trava (o serviço externo está lento), as rotas da API também ficam lentas. Qual é a explicação mais provável e a correção?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Redis está sobrecarregado e reiniciá-lo restaura a velocidade das rotas",
                                "isCorrect": false
                            },
                            {
                                "text": "O concurrency está baixo e subi-lo para 100 desafoga as rotas da API",
                                "isCorrect": false
                            },
                            {
                                "text": "O attempts está baixo e aumentar as tentativas destrava as rotas",
                                "isCorrect": false
                            },
                            {
                                "text": "O worker divide o processo com a API e movê-lo para fora isola o bloqueio",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que a opção concurrency em new Worker(...) controla?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quantos jobs o worker processa em paralelo",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantas vezes um job falho é tentado de novo",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantos workers o BullMQ cria automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Quanto tempo um job espera antes de expirar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A fila \"emails\" tem 1000 jobs no estado waiting e um único worker rodando com concurrency: 1. Sem mudar o código de processamento do job, o que reduz o tempo até a fila esvaziar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o attempts dos jobs da fila",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o TTL usado no cache-aside da aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Subir o concurrency e rodar mais processos worker",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar um backoff exponential aos jobs",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Quando o job falha: retries e backoff",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Jobs falham, e nem sempre por bug no seu código: o serviço de email pode estar fora do ar, uma API externa pode demorar demais e estourar timeout, a conexão pode cair no meio do processamento. Nesses casos, desistir na primeira falha joga fora um trabalho que provavelmente daria certo minutos depois. O BullMQ resolve isso com duas opções: attempts (quantas vezes tentar) e backoff (quanto esperar entre uma tentativa e a próxima).\n\n## attempts e backoff na prática"
                    },
                    {
                        "type": "code",
                        "value": "await emailQueue.add(\n  \"boas-vindas\",\n  { to: \"usuaria@example.com\", subject: \"Bem-vinda!\", body: \"...\" },\n  {\n    attempts: 5,\n    backoff: {\n      type: \"exponential\",\n      delay: 1000,\n    },\n  }\n);"
                    },
                    {
                        "type": "text",
                        "value": "Com attempts: 5, o BullMQ tenta rodar esse job até 5 vezes antes de desistir. O backoff define a espera entre uma tentativa e a próxima: com type: \"exponential\" e delay: 1000, a espera dobra a cada nova tentativa (1s, depois 2s, depois 4s, e assim por diante), dando tempo real para o serviço externo se recuperar em vez de martelar ele de novo imediatamente. Existe também type: \"fixed\", em que a espera é sempre a mesma.\n\n## Fixed x exponential"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tentativa\", \"backoff fixed (delay: 1000)\", \"backoff exponential (delay: 1000)\"], [\"1ª nova tentativa\", \"1000ms depois\", \"1000ms depois\"], [\"2ª nova tentativa\", \"1000ms depois\", \"2000ms depois\"], [\"3ª nova tentativa\", \"1000ms depois\", \"4000ms depois\"], [\"4ª nova tentativa\", \"1000ms depois\", \"8000ms depois\"]]"
                    },
                    {
                        "type": "text",
                        "value": "Escrever attempts e backoff em todo queue.add cansa e é fácil esquecer em algum lugar. Por isso o BullMQ permite configurar isso uma vez só, na criação da fila, com defaultJobOptions: todo job adicionado nessa fila herda essa configuração, a menos que informe algo diferente no add."
                    },
                    {
                        "type": "code",
                        "value": "const emailQueue = new Queue(\"emails\", {\n  connection,\n  defaultJobOptions: {\n    attempts: 3,\n    backoff: { type: \"exponential\", delay: 2000 },\n    removeOnComplete: 100, // mantém só os 100 jobs completed mais recentes\n  },\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Falhar uma vez não é o fim: é um sinal para tentar de novo, com calma. attempts e backoff dão essa paciência ao BullMQ, sem que você precise escrever um loop de retry na mão."
                    }
                ],
                "questions": [
                    {
                        "statement": "No BullMQ, qual opção define quantas vezes um job será tentado antes de ser marcado como failed?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "backoff",
                                "isCorrect": false
                            },
                            {
                                "text": "concurrency",
                                "isCorrect": false
                            },
                            {
                                "text": "delay",
                                "isCorrect": false
                            },
                            {
                                "text": "attempts",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um job de envio de email falha porque o serviço de terceiros está fora do ar, e a fila não tem nenhuma configuração de retry (nem attempts, nem defaultJobOptions). O que o BullMQ faz por padrão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Tenta de novo para sempre, sem parar, até o serviço externo enfim voltar ao ar",
                                "isCorrect": false
                            },
                            {
                                "text": "Marca o job como failed na primeira falha, pois o padrão é uma tentativa",
                                "isCorrect": true
                            },
                            {
                                "text": "Aguarda 24 horas e então tenta enviar o email mais uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Move o job sozinho para uma fila separada só de erros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a função do backoff quando usado junto com attempts?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir quanto esperar entre uma tentativa e a próxima",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir quantos jobs o worker processa ao mesmo tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir em quanto tempo um job parado sai da fila",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir a prioridade de um job diante dos outros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time configurou backoff: { type: \"fixed\", delay: 500 } com attempts: 10 para chamadas a uma API externa que está fora do ar há alguns minutos. Qual é o problema mais provável dessa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "attempts: 10 é baixo demais e deveria ser um número bem maior",
                                "isCorrect": false
                            },
                            {
                                "text": "backoff do tipo fixed não existe no BullMQ e acaba sendo ignorado",
                                "isCorrect": false
                            },
                            {
                                "text": "Repete a cada 500ms e martela a API sem deixar ela se recuperar",
                                "isCorrect": true
                            },
                            {
                                "text": "Com o tipo fixed o job nunca chega a ser tentado de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de esgotar as 5 tentativas configuradas em attempts: 5, um job de envio de email continua falhando. O que o BullMQ faz com esse job?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Devolve o job para waiting e zera a contagem de tentativas",
                                "isCorrect": false
                            },
                            {
                                "text": "Passa o job para o estado failed, onde ele fica registrado",
                                "isCorrect": true
                            },
                            {
                                "text": "Apaga o job do Redis na hora, sem deixar nenhum rastro",
                                "isCorrect": false
                            },
                            {
                                "text": "Pausa o worker inteiro até alguém intervir na mão",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Idempotência: seguro para rodar duas vezes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Retry resolve o problema de \"o serviço caiu por um instante\", mas cria outro: o mesmo job pode acabar rodando mais de uma vez. E não é só por causa de retry depois de falha: o worker pode terminar o trabalho e cair antes de confirmar isso para o Redis, e quando voltar, pega esse job de novo, achando que ainda não foi feito. Se o job manda um email, o cliente recebe dois emails. Se o job cobra um cartão, o cliente é cobrado duas vezes.\n\n## Operação segura de repetir\n\nUma operação é idempotente quando executá-la uma vez ou várias vezes produz o mesmo resultado final, ou seja, é uma operação segura de repetir. Marcar um pedido como pago (status = \"pago\") é idempotente: rodar esse update dez vezes deixa o pedido no mesmo estado de rodar uma vez. Já cobrar um cartão não é idempotente por padrão: cada chamada ao gateway de pagamento é uma cobrança nova, então rodar o job duas vezes cobra duas vezes."
                    },
                    {
                        "type": "code",
                        "value": "const paymentWorker = new Worker(\n  \"pagamentos\",\n  async (job) => {\n    const { pedidoId, valor, cartaoToken } = job.data;\n\n    // sem nenhuma checagem: se esse job rodar de novo, cobra de novo\n    await cobrarCartao(cartaoToken, valor);\n    await marcarPedidoComoPago(pedidoId);\n  },\n  { connection }\n);"
                    },
                    {
                        "type": "text",
                        "value": "O jeito de consertar isso é sempre o mesmo: antes de fazer a parte arriscada (cobrar, enviar, criar), perguntar \"eu já fiz isso?\". A resposta pode vir do próprio domínio, como no exemplo abaixo (checar o status do pedido no banco), ou de uma chave de idempotência dedicada no Redis: gravar SET idempotencia:pedido:123 1 EX 86400 NX antes de processar. Como o NX só grava se a chave ainda não existe, a segunda tentativa do mesmo job encontra a chave já lá e sabe que deve pular o trabalho arriscado."
                    },
                    {
                        "type": "code",
                        "value": "const paymentWorker = new Worker(\n  \"pagamentos\",\n  async (job) => {\n    const { pedidoId, valor, cartaoToken } = job.data;\n\n    const pedido = await buscarPedido(pedidoId);\n\n    if (pedido.status === \"pago\") {\n      console.log(`Pedido ${pedidoId} já está pago, ignorando job repetido`);\n      return;\n    }\n\n    await cobrarCartao(cartaoToken, valor);\n    await marcarPedidoComoPago(pedidoId);\n  },\n  { connection }\n);"
                    },
                    {
                        "type": "code",
                        "value": "const chave = `idempotencia:pedido:${pedidoId}`;\nconst primeiraVez = await redis.set(chave, \"1\", \"EX\", 86400, \"NX\");\n\nif (primeiraVez === null) {\n  console.log(`Pedido ${pedidoId} já foi processado, ignorando job repetido`);\n  return;\n}\n\nawait cobrarCartao(cartaoToken, valor);\nawait marcarPedidoComoPago(pedidoId);"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ação\", \"Idempotente por natureza\", \"O que fazer no worker\"], [\"Marcar pedido como pago\", \"sim\", \"pode rodar várias vezes sem checagem extra\"], [\"Cobrar cartão de crédito\", \"não\", \"checar se já foi cobrado antes de chamar o gateway\"], [\"Enviar email de confirmação\", \"não\", \"checar uma chave de idempotência antes de enviar\"], [\"Somar 1 em um contador (INCR)\", \"não\", \"cada chamada muda o resultado, repetir não é seguro\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um job vai rodar mais de uma vez cedo ou tarde, seja por retry, seja por uma falha de infraestrutura. A pergunta não é se isso vai acontecer, é o que acontece com o seu sistema quando acontecer. Idempotência é essa resposta."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que uma operação é idempotente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela roda mais rápido do que as operações comuns",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela nunca falha, nem mesmo diante de um erro de rede ou de disco",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodá-la uma ou várias vezes leva ao mesmo resultado final",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela só pode ser executada de dentro de um worker",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um job que cobra um cartão de crédito precisa ser escrito de forma idempotente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o Redis apaga o job antes de ele ser processado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o worker roda cada job exatamente uma vez, sem risco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a assinatura de new Worker exige um job idempotente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ele pode ser reprocessado e, sem cuidado, cobraria duas vezes",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O worker reprocessou um job de cobrança depois de uma queda, e o cliente foi cobrado duas vezes pelo mesmo pedido. O que faltou no código do worker?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um valor consideravelmente mais alto configurado na opção attempts",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma checagem de \"já cobrei este pedido?\" antes do gateway",
                                "isCorrect": true
                            },
                            {
                                "text": "Um número de concurrency maior configurado no worker",
                                "isCorrect": false
                            },
                            {
                                "text": "Um backoff exponential no lugar do tipo fixed",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo redis.set(chave, \"1\", \"EX\", 86400, \"NX\"), o que significa esse comando retornar null?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A chave já existia, então esse job já tinha sido feito antes",
                                "isCorrect": true
                            },
                            {
                                "text": "A chave foi criada agora, neste primeiro processamento",
                                "isCorrect": false
                            },
                            {
                                "text": "Houve um erro de conexão entre o Node e o Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "O TTL da chave expirou antes do tempo previsto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de checkout enfileira um job de cobrança sem nenhuma chave de idempotência. O job chama o gateway de pagamento (o cartão é cobrado), mas o worker cai antes de marcar o pedido como pago. Com attempts: 3 configurado, o BullMQ tenta o job de novo automaticamente. O que provavelmente acontece?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O BullMQ percebe que o pagamento já ocorreu e pula essa etapa",
                                "isCorrect": false
                            },
                            {
                                "text": "O job vira completed sem rodar, pois o gateway já foi chamado",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis barra a segunda tentativa sozinho, sem precisar de código",
                                "isCorrect": false
                            },
                            {
                                "text": "O job roda do zero, chama o gateway de novo e cobra outra vez",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Jobs que falham para sempre (dead-letter)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Às vezes um job não é \"falha temporária, tenta de novo\": ele falha por um motivo que nenhum retry resolve. Um dado inválido em job.data, um bug no código de processamento, um cartão recusado de verdade (não por instabilidade, mas porque foi recusado mesmo). Depois de esgotar as tentativas configuradas em attempts, o BullMQ marca o job como failed e para ali. Não tenta mais sozinho.\n\n## Por que esse job não pode simplesmente sumir\n\nSe ninguém olha para os jobs em failed, o time perde, sem perceber, emails que nunca foram enviados, relatórios que nunca foram gerados, pedidos que nunca foram processados. Por isso o BullMQ, por padrão, mantém os jobs failed guardados no Redis (a menos que você configure removeOnFail para limitar isso), junto com informações para investigar: o erro (failedReason), o rastro da exceção (stacktrace) e quantas tentativas já foram feitas (attemptsMade)."
                    },
                    {
                        "type": "code",
                        "value": "emailWorker.on(\"failed\", (job, err) => {\n  console.error(\n    `Job ${job?.id} falhou depois de ${job?.attemptsMade} tentativas: ${err.message}`\n  );\n\n  // aqui é o lugar para alertar: log estruturado, Sentry, Slack, etc.\n});"
                    },
                    {
                        "type": "code",
                        "value": "const jobsFalhos = await emailQueue.getFailed();\n\nfor (const job of jobsFalhos) {\n  console.log(job.id, job.data, job.failedReason);\n}"
                    },
                    {
                        "type": "text",
                        "value": "Esse tipo de consulta é o que dá visibilidade sobre o que ficou para trás: quantos jobs falharam, quais dados tinham, por qual motivo. A partir daí, o time corrige a causa raiz (o bug, o dado inválido, o serviço externo) e decide o que fazer com aqueles jobs específicos: reprocessar manualmente, ou descartar, se já não fizer mais sentido (por exemplo, um relatório de um dia que já passou)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sem observar jobs failed\", \"Observando jobs failed\"], [\"Emails nunca enviados somem sem ninguém perceber\", \"Um alerta dispara e o time investiga o motivo\"], [\"O mesmo bug pode voltar a causar falhas sem ninguém notar\", \"A causa raiz é corrigida e os jobs podem ser reprocessados\"], [\"O cliente percebe o problema antes da equipe\", \"A equipe percebe antes do cliente reclamar\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um job em failed não é lixo: é um evento que prometeu um trabalho e não terminou. Ignorá-lo é decidir, sem querer, que aquele email, aquela cobrança ou aquele relatório não importava."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que acontece com um job no BullMQ depois que ele esgota todas as tentativas definidas em attempts?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele passa para o estado failed e fica registrado ali",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele volta para waiting e tenta de novo sem parar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é apagado do Redis de forma automática",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele vira completed, com um aviso de erro anexado no final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual método de uma Queue do BullMQ retorna os jobs que estão no estado failed?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "queue.getWaiting()",
                                "isCorrect": false
                            },
                            {
                                "text": "queue.getActive()",
                                "isCorrect": false
                            },
                            {
                                "text": "queue.getFailed()",
                                "isCorrect": true
                            },
                            {
                                "text": "queue.getCompleted()",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job de geração de relatório falha porque job.data chegou sem o campo obrigatório userId (um bug de quem enfileirou o job). Mesmo com attempts: 5 configurado, o que provavelmente acontece nas próximas tentativas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na segunda tentativa o BullMQ preenche o userId com um padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Falha as 5 vezes igual, pois o defeito está no dado, não no tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "O job nem é tentado, pois um dado inválido cancela o retry",
                                "isCorrect": false
                            },
                            {
                                "text": "O job vira completed só por ter passado pelas 5 tentativas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é importante manter (e não apagar) os jobs que ficam no estado failed?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o BullMQ precisa de ao menos um failed para operar",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os jobs em failed liberam memória do Redis por conta própria",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque manter os failed aumenta o throughput da fila",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque guardam o erro e os dados para investigar e reprocessar",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um incidente, o time descobre que um bug fez centenas de jobs de cobrança falharem e ficarem parados em failed por dias, sem que ninguém percebesse. Qual mudança evita que isso se repita?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um alerta no worker.on(\"failed\") que avisa o time a cada falha",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o attempts para um número bem alto, tipo 1000",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o backoff para os jobs falharem e sumirem logo",
                                "isCorrect": false
                            },
                            {
                                "text": "Desligar o evento failed para não poluir os logs da aplicação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Agendamento, recorrência e monitorar a fila",
                "blocks": [
                    {
                        "type": "text",
                        "value": "Até aqui, todo job era processado assim que um worker ficava livre. Mas nem todo trabalho é para agora: às vezes você quer rodar um job só daqui a um tempo (lembrar o usuário do carrinho abandonado amanhã, expirar um convite em 7 dias), ou repetir um job sozinho, sem ninguém precisar enfileirar de novo toda hora (relatório diário, limpeza de arquivos temporários à meia-noite). O BullMQ cobre os dois casos com opções na hora de enfileirar.\n\n## Jobs com delay"
                    },
                    {
                        "type": "code",
                        "value": "await notificacaoQueue.add(\n  \"lembrete-carrinho\",\n  { usuarioId: 42 },\n  { delay: 24 * 60 * 60 * 1000 } // roda só daqui a 24 horas\n);"
                    },
                    {
                        "type": "text",
                        "value": "Enquanto espera, esse job fica no estado delayed; quando o tempo passa, ele vira waiting normalmente, como qualquer outro job na fila.\n\n## Jobs recorrentes com repeat\n\nPara tarefas periódicas, o BullMQ tem a opção repeat, que reagenda o job automaticamente depois de cada execução, seguindo um padrão de cron. Isso substitui um cron tradicional rodando fora da aplicação: a recorrência fica registrada na própria fila (no Redis), com os mesmos workers e a mesma visibilidade dos outros jobs."
                    },
                    {
                        "type": "code",
                        "value": "await relatorioQueue.add(\n  \"relatorio-diario\",\n  { tipo: \"vendas\" },\n  {\n    repeat: {\n      pattern: \"0 6 * * *\", // todo dia às 6h da manhã\n    },\n  }\n);"
                    },
                    {
                        "type": "code",
                        "value": "const contagem = await emailQueue.getJobCounts(\n  \"waiting\",\n  \"active\",\n  \"completed\",\n  \"failed\",\n  \"delayed\"\n);\n\nconsole.log(contagem);\n// { waiting: 12, active: 2, completed: 340, failed: 3, delayed: 5 }"
                    },
                    {
                        "type": "text",
                        "value": "## Por que observar a fila importa\n\nEsses números contam a saúde do sistema. waiting crescendo sem parar é sinal de que os workers não estão dando conta do ritmo de chegada dos jobs (ou caíram). failed subindo é sinal de um problema sistêmico, não passageiro. Um job preso em active por muito tempo pode indicar uma trava sem timeout. Em produção, esses números costumam ir para um painel (o bull-board é uma ferramenta comum para visualizar filas BullMQ) em vez de um console.log manual, mas a ideia é a mesma do módulo 1: a fila é um dos indicadores mais diretos da saúde do sistema, ao lado da régua de p95 que você já viu lá no início da trilha."
                    },
                    {
                        "type": "quote",
                        "value": "Uma fila saudável é uma fila que anda: jobs entram em waiting e saem por completed. Quando eles começam a se acumular ou a cair demais em failed, a fila está avisando alguma coisa, e vale a pena escutar antes que o usuário sinta."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual opção faz um job ser processado só depois de um tempo, em vez de imediatamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "backoff",
                                "isCorrect": false
                            },
                            {
                                "text": "delay",
                                "isCorrect": true
                            },
                            {
                                "text": "attempts",
                                "isCorrect": false
                            },
                            {
                                "text": "concurrency",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para criar um job que se repete automaticamente todo dia às 6h, qual opção do BullMQ é usada ao enfileirar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "repeat, com um pattern no formato de cron",
                                "isCorrect": true
                            },
                            {
                                "text": "delay com um valor fixo de 24 horas",
                                "isCorrect": false
                            },
                            {
                                "text": "attempts ajustado para rodar só uma vez por dia",
                                "isCorrect": false
                            },
                            {
                                "text": "concurrency configurado com o valor 24",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time percebe que o número de jobs no estado waiting da fila emails só cresce ao longo do dia e nunca diminui. O que isso provavelmente indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Redis está com pouca memória livre para novos jobs",
                                "isCorrect": false
                            },
                            {
                                "text": "O attempts está configurado com um valor baixo demais",
                                "isCorrect": false
                            },
                            {
                                "text": "Os jobs estão virando completed rápido demais para contar",
                                "isCorrect": false
                            },
                            {
                                "text": "Os workers não vencem o ritmo de chegada dos jobs",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que monitorar o número de jobs em failed é importante, mesmo com retries configurados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o BullMQ trava novos jobs enquanto houver algum failed",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque jobs failed gastam mais memória do Redis que os outros",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque failed subindo aponta um problema que o retry não resolveu",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque essa seria a única forma de saber se o worker ainda está rodando",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tarefa de limpeza de arquivos temporários precisa rodar todo dia à meia-noite, mesmo que o servidor reinicie várias vezes ao longo do dia. Qual abordagem do BullMQ resolve isso, e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "delay de 24 horas a cada boot, pois garante uma rodada por dia",
                                "isCorrect": false
                            },
                            {
                                "text": "repeat com pattern de cron, pois a recorrência fica no Redis, não no processo",
                                "isCorrect": true
                            },
                            {
                                "text": "attempts alto, pois faz o job repetir várias vezes em sequência",
                                "isCorrect": false
                            },
                            {
                                "text": "concurrency bem alto, pois divide a tarefa de limpeza em várias partes rodando em paralelo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Escalar e juntar tudo",
        "aulas": [
            {
                "titulo": "Escala vertical x horizontal e o load balancer",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Chegou mais gente\n\nA essa altura, a API de produtos e pedidos que você vem evoluindo ao longo da trilha já está bem mais rápida: cache nas leituras mais pesadas (Módulos 2 e 3), invalidação decente quando o dado muda (Módulo 4), fila e worker tirando trabalho lento de dentro da requisição (Módulos 5 e 6).\n\nSó que performance por requisição é uma coisa. Aguentar **muito mais gente ao mesmo tempo** é outra. Em algum momento, um único processo Node, rodando numa única máquina, não dá conta do volume de requisições, não importa o quanto ele esteja otimizado. É aí que entra escalar.\n\nExistem dois caminhos: escala vertical e escala horizontal."
                    },
                    {
                        "type": "text",
                        "value": "### Escala vertical: uma máquina maior\n\nEscala vertical é aumentar os recursos da máquina que já roda a aplicação: mais CPU, mais RAM, disco mais rápido. É o caminho mais simples de entender e, no começo, o mais simples de fazer: você troca o plano do servidor e pronto, a mesma aplicação, sem nenhuma mudança de código, aguenta mais carga.\n\nO problema é o teto. Toda máquina tem um limite físico de CPU e memória que dá pra colocar nela, e esse limite chega bem antes do que a maioria imagina. Além disso, o custo não cresce de forma linear: uma máquina com o dobro da capacidade costuma custar bem mais que o dobro do preço. E tem o risco: se essa única máquina cair, o sistema inteiro cai junto."
                    },
                    {
                        "type": "text",
                        "value": "### Escala horizontal: mais máquinas, em paralelo\n\nEscala horizontal é rodar **várias cópias** da mesma aplicação, em máquinas diferentes, atendendo requisições em paralelo. Em vez de uma máquina gigante, três, dez ou cem máquinas menores, cada uma cuidando de uma fatia do tráfego.\n\nEsse é o caminho que escala de verdade: não existe teto físico (sempre dá pra somar mais uma instância) e o custo cresce de forma bem mais previsível, quase proporcional ao tráfego. Se uma instância cai, as outras continuam de pé.\n\nO preço a pagar é complexidade: alguém precisa decidir, a cada requisição, qual das instâncias vai atender, e a aplicação precisa se comportar bem quando não sabe de antemão qual cópia dela vai rodar aquele request. Essa segunda parte é assunto da próxima aula."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Escala vertical\",\"Escala horizontal\"],[\"O que muda\",\"Aumenta CPU, RAM e disco de uma única máquina\",\"Adiciona mais máquinas rodando a mesma aplicação\"],[\"Limite\",\"Físico: existe um teto de hardware disponível\",\"Praticamente sem teto, dá pra somar quantas instâncias precisar\"],[\"Custo\",\"Cresce rápido: máquinas maiores custam desproporcionalmente mais\",\"Cresce de forma mais previsível, quase proporcional ao tráfego\"],[\"Ponto único de falha\",\"Sim: se a máquina cai, o sistema cai inteiro\",\"Não: se uma instância cai, as outras continuam respondendo\"],[\"Pré-requisito\",\"Nenhum, funciona com a aplicação como está\",\"Aplicação sem estado local (stateless) e um load balancer\"]]"
                    },
                    {
                        "type": "text",
                        "value": "### O load balancer\n\nQuem decide qual instância atende cada requisição é o **load balancer** (balanceador de carga). Ele fica na frente de todas as instâncias, recebe o tráfego num único endereço e distribui cada requisição entre as instâncias disponíveis, geralmente em rodízio (round robin) ou por alguma métrica de carga.\n\nDo ponto de vista de quem chama a API, nada muda: é uma URL só. Por trás, pode ter 1 instância ou 50. O load balancer também costuma checar a saúde de cada instância, batendo periodicamente num endpoint de health check, e parar de mandar tráfego pra qualquer uma que pare de responder.\n\nImplementar um load balancer do zero foge do escopo aqui (na prática, você usa um já pronto, de um provedor de nuvem ou um proxy como Nginx). O que importa é entender o papel dele: ele é o motivo pelo qual você pode simplesmente ligar mais uma instância e o sistema aguenta mais tráfego."
                    },
                    {
                        "type": "code",
                        "value": "// server.js: cada instância roda esse mesmo código, só muda a porta\nconst express = require('express');\nconst app = express();\n\nconst PORT = process.env.PORT || 3000;\nconst INSTANCE_ID = process.env.INSTANCE_ID || 'local';\n\napp.get('/produtos', (req, res) => {\n  res.json({\n    produtos: [{ id: 1, nome: 'Teclado' }, { id: 2, nome: 'Mouse' }],\n    atendidoPor: INSTANCE_ID, // só pra enxergar qual instância respondeu\n  });\n});\n\napp.listen(PORT, () => {\n  console.log('Instância ' + INSTANCE_ID + ' ouvindo na porta ' + PORT);\n});\n\n// rodando 3 cópias da mesma aplicação:\n// INSTANCE_ID=api-1 PORT=3001 node server.js\n// INSTANCE_ID=api-2 PORT=3002 node server.js\n// INSTANCE_ID=api-3 PORT=3003 node server.js\n//\n// o load balancer escuta numa porta única e distribui cada\n// requisição entre 3001, 3002 e 3003."
                    },
                    {
                        "type": "quote",
                        "value": "Escala vertical compra tempo. Escala horizontal é o que aguenta o crescimento de verdade, mas só funciona se a aplicação puder rodar em várias cópias ao mesmo tempo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza a escala vertical de um sistema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Aumentar CPU, RAM e disco de uma única máquina",
                                "isCorrect": true
                            },
                            {
                                "text": "Adicionar mais máquinas rodando a mesma aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "Dividir a aplicação em vários serviços menores",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco relacional por um cache em memória",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a função principal de um load balancer numa arquitetura com várias instâncias da API?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Armazenar o cache compartilhado entre as instâncias",
                                "isCorrect": false
                            },
                            {
                                "text": "Executar os jobs pesados que rodariam num worker",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuir as requisições recebidas entre as instâncias",
                                "isCorrect": true
                            },
                            {
                                "text": "Substituir o banco de dados por um cache em memória",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe aumenta repetidamente a RAM e a CPU do único servidor da aplicação para aguentar mais tráfego. Depois de um tempo, esse caminho volta a esbarrar num limite, mesmo pagando mais caro a cada upgrade. Qual é a explicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O sistema operacional impede, por design, qualquer máquina de passar de 16GB de RAM instalada",
                                "isCorrect": false
                            },
                            {
                                "text": "Escala vertical tem um teto físico e de preço: chega um ponto sem máquina maior que compense",
                                "isCorrect": true
                            },
                            {
                                "text": "Bancos relacionais ficam instáveis com muita memória, e o ganho do hardware acaba se perdendo",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse teto só aparece em aplicações que usam Redis, por causa do eviction de memória do cache",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação passa a rodar em 4 instâncias idênticas atrás de um load balancer. Para essa arquitetura funcionar corretamente, o que precisa ser verdade sobre as requisições de um mesmo cliente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Precisam sempre cair na mesma instância fixa, escolhida no primeiro acesso",
                                "isCorrect": false
                            },
                            {
                                "text": "O cliente precisa indicar manualmente qual instância deve atendê-lo",
                                "isCorrect": false
                            },
                            {
                                "text": "Precisam chegar em ordem, sendo enviadas a uma instância de cada vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Qualquer uma das instâncias precisa atendê-las com o mesmo resultado",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que só colocar mais servidores atrás de um load balancer não é suficiente pra escalar de verdade, se a aplicação guarda dados de sessão numa variável dentro do próprio processo Node?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque load balancers só aceitam até duas instâncias ativas ao mesmo tempo, por padrão de fábrica",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque várias instâncias sempre saem mais caras que uma única máquina vertical equivalente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada instância teria a própria cópia do estado, e a requisição pode cair numa que nunca viu",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Redis é peça obrigatória de todo load balancer e ainda faltaria configurá-lo direito",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Sem estado escala: onde o JWT e o Redis entram",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O problema escondido da escala horizontal\n\nRodar 5 instâncias atrás de um load balancer só funciona de verdade se qualquer uma dessas 5 instâncias conseguir atender qualquer requisição, com o mesmo resultado. Isso só é possível se a aplicação for **stateless**: sem estado guardado na memória do próprio processo.\n\nSe alguma parte da aplicação depende de algo que só existe na memória daquele processo específico, ela quebra assim que o load balancer manda a próxima requisição pra uma instância diferente.\n\n### O clássico: sessão na memória do processo\n\nUm jeito comum (e arriscado, em produção com mais de um servidor) de guardar quem está logado é um objeto na memória do processo Node: o login grava a sessão nesse objeto, as próximas requisições consultam esse mesmo objeto pra saber quem é o usuário.\n\nCom 1 servidor, funciona sem problema. Com 3 servidores atrás de um load balancer sem sticky session, o login pode cair na instância A, e a próxima requisição desse mesmo usuário cair na instância B, que nunca viu aquele login. O resultado é um usuário que aparentemente desloga sozinho, de forma aleatória, dependendo de qual instância atende cada requisição."
                    },
                    {
                        "type": "code",
                        "value": "// ANTI-PADRAO: sessão guardada na memória do próprio processo\nconst sessoesPorUsuario = {}; // objeto vive só dentro deste processo Node\n\napp.post('/login', (req, res) => {\n  const usuario = autentica(req.body);\n  sessoesPorUsuario[usuario.id] = { logadoEm: Date.now() };\n  res.json({ ok: true });\n});\n\napp.get('/perfil', (req, res) => {\n  const sessao = sessoesPorUsuario[req.usuarioId];\n  if (!sessao) return res.status(401).json({ erro: 'não autenticado' });\n  res.json({ perfil: '...' });\n});\n\n// com 1 servidor: funciona.\n// com 3 servidores atrás de um load balancer: o login pode cair na\n// instância A e a chamada seguinte a /perfil pode cair na instância B,\n// que nunca viu esse usuário. resultado: usuário aparece deslogado\n// sem motivo aparente."
                    },
                    {
                        "type": "text",
                        "value": "### Por que o JWT resolve isso\n\nNa trilha de autenticação você já viu o JWT: um token assinado, que o próprio cliente guarda e manda em cada requisição, contendo as informações do usuário dentro dele mesmo.\n\nO ponto chave pra escala é esse: o token é **auto-contido**. Qualquer instância consegue verificar a assinatura e extrair a identidade do usuário sozinha, sem perguntar pra ninguém, sem consultar um banco de sessões, sem depender de já ter visto aquele usuário antes. Não existe a instância que sabe quem é esse usuário: todas sabem, porque a informação viaja dentro do próprio request."
                    },
                    {
                        "type": "code",
                        "value": "const jwt = require('jsonwebtoken');\n\nfunction autenticar(req, res, next) {\n  const token = (req.headers.authorization || '').replace('Bearer ', '');\n  try {\n    // a identidade inteira está dentro do token, verificada pela\n    // assinatura. nenhuma consulta a sessão, banco ou cache aqui.\n    req.usuario = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (erro) {\n    res.status(401).json({ erro: 'token inválido' });\n  }\n}\n\napp.get('/perfil', autenticar, (req, res) => {\n  res.json({ perfil: req.usuario });\n});\n\n// qualquer uma das N instâncias roda esse mesmo middleware e chega\n// no mesmo resultado, porque nada fica guardado localmente."
                    },
                    {
                        "type": "text",
                        "value": "### Mas nem todo estado pode sumir\n\nSer stateless não significa que a aplicação nunca guarda nada compartilhado. Cache de produtos, contador de rate limit, sessão de um fluxo mais tradicional sem JWT: tudo isso é estado que mais de uma instância precisa enxergar igual, ao mesmo tempo.\n\nA regra prática: esse tipo de estado compartilhado não vai pra uma variável dentro do processo Node, vai pro **Redis**. Como o Redis roda como um processo separado (e único) que todas as instâncias acessam pela rede, ele funciona como a memória compartilhada que a aplicação, sozinha, não tem."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de estado\",\"Memória do processo\",\"Redis\"],[\"Visibilidade\",\"Só a própria instância enxerga\",\"Todas as instâncias enxergam o mesmo valor\"],[\"Sessão de usuário logado\",\"Quebra com mais de uma instância sem sticky session\",\"Funciona igual, não importa qual instância atende\"],[\"Contador de rate limit\",\"Cada instância conta separado, o limite real vira instâncias vezes limite\",\"Contador único e compartilhado, o limite vale de verdade\"],[\"Cache de dados (produtos, pedidos)\",\"Cada instância tem sua cópia, pode ficar divergente\",\"Cache único, invalidar em um lugar vale pra todo mundo\"],[\"Sobrevive a reiniciar o processo\",\"Não, se perde\",\"Sim, o Redis é um processo separado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Sem estado na memória do processo, qualquer instância serve qualquer requisição. Estado que precisa ser compartilhado vai pro Redis, nunca pra uma variável local."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que um back-end é stateless (sem estado)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que ele não usa nenhum banco de dados durante as requisições",
                                "isCorrect": false
                            },
                            {
                                "text": "Que ele não guarda a sessão na memória do próprio processo",
                                "isCorrect": true
                            },
                            {
                                "text": "Que ele não pode manter nenhum tipo de cache em lugar algum",
                                "isCorrect": false
                            },
                            {
                                "text": "Que ele roda sempre numa única instância, nunca em várias",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que permite que qualquer instância valide sozinha um usuário autenticado por JWT, sem consultar outro serviço?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todas as instâncias compartilham a mesma variável de memória",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer decodifica o token antes de encaminhar a requisição",
                                "isCorrect": false
                            },
                            {
                                "text": "O token fica salvo numa tabela de sessões no banco principal",
                                "isCorrect": false
                            },
                            {
                                "text": "O token é assinado e carrega os dados do usuário dentro dele",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema guarda a sessão do usuário logado num objeto na memória do processo Node. Ele passa a rodar em 3 servidores atrás de um load balancer, sem sticky session. Um usuário loga e, na requisição seguinte, é encaminhado a um servidor diferente. O que tende a acontecer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O outro servidor não tem essa sessão na própria memória, e o usuário aparece deslogado",
                                "isCorrect": true
                            },
                            {
                                "text": "O load balancer copia a sessão entre os 3 servidores automaticamente, sem configuração",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis assume a sessão sozinho, mesmo que a aplicação não grave nada nele",
                                "isCorrect": false
                            },
                            {
                                "text": "O token do usuário expira automaticamente assim que ele troca de servidor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de estado que deveria ficar no Redis, e não numa variável dentro do processo Node?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A lista de rotas registradas no Express quando a aplicação sobe",
                                "isCorrect": false
                            },
                            {
                                "text": "As variáveis de ambiente lidas uma vez na inicialização do processo",
                                "isCorrect": false
                            },
                            {
                                "text": "O contador de rate limit de um cliente, igual para todas as instâncias",
                                "isCorrect": true
                            },
                            {
                                "text": "O código-fonte já compilado que a aplicação carrega ao iniciar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe autentica os usuários com JWT (sem sessão em memória), mas guarda o carrinho de compras de cada usuário numa variável dentro do processo Node, indexada pelo id do usuário. Rodando 3 instâncias atrás de um load balancer sem sticky session, o que provavelmente acontece com esse carrinho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada, porque o JWT já garante a consistência de qualquer estado guardado na aplicação",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis sincroniza essa variável entre os processos sozinho, sem nenhuma configuração",
                                "isCorrect": false
                            },
                            {
                                "text": "O load balancer bloqueia essas requisições por segurança, protegendo o carrinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Pode sumir ou vir incompleto, pois cada instância tem seu carrinho e não o compartilha",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O banco como gargalo: pool, paginação, índices e N+1",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O banco não desapareceu\n\nCache tira a maior parte das leituras repetidas de cima do banco. Fila tira o processamento pesado de dentro da requisição. Mesmo assim, o banco continua sendo consultado o tempo todo: todo miss de cache cai nele, toda escrita passa por ele, todo job da fila que precisa ler ou gravar dado também passa por ele.\n\nDepois de cachear e enfileirar tudo que dá, o banco costuma ser o próximo (e o último) gargalo grande. E, com escala horizontal, o problema fica mais visível: agora não é uma instância batendo no banco, são várias, ao mesmo tempo."
                    },
                    {
                        "type": "text",
                        "value": "### Pool de conexão\n\nAbrir uma conexão com o banco não é barato: tem handshake, autenticação, alocação de recursos do lado do banco. Se a aplicação abre (e fecha) uma conexão nova a cada requisição, esse custo se paga em toda requisição, e o banco ainda tem um limite de conexões simultâneas que ele aceita.\n\nA solução é manter um **pool de conexões**: um conjunto de conexões já abertas, reutilizadas entre requisições. A requisição pega uma conexão emprestada do pool, usa, devolve. Nenhuma conexão nova é aberta na maioria das vezes."
                    },
                    {
                        "type": "code",
                        "value": "const { Pool } = require('pg');\n\n// pool de conexões reutilizáveis, em vez de abrir uma conexão nova\n// (cara: handshake, autenticação) a cada requisição\nconst pool = new Pool({\n  host: process.env.DB_HOST,\n  max: 20,                     // no máximo 20 conexões abertas por instância\n  idleTimeoutMillis: 30000,\n  connectionTimeoutMillis: 5000,\n});\n\napp.get('/pedidos/:id', async (req, res) => {\n  const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [req.params.id]);\n  res.json(rows[0]);\n});\n\n// com 5 instâncias e max: 20, essa API pode abrir até 100 conexões\n// simultâneas com o banco. isso precisa caber no limite de conexões\n// configurado no Postgres."
                    },
                    {
                        "type": "text",
                        "value": "### Paginação: parar de trazer tudo\n\nUma listagem que traz todos os registros de uma tabela funciona bem com 100 linhas e vira um problema com 100 mil: mais dado trafegando, mais memória usada, mais tempo de consulta, mais tempo serializando a resposta em JSON.\n\nA solução de sempre é a **paginação**: trazer uma fatia por vez, usando **LIMIT** (quantas linhas) e **OFFSET** (a partir de onde), e o cliente pede a próxima página quando precisar. Isso vale tanto pra uma listagem de produtos quanto pra qualquer endpoint que devolve uma coleção que só cresce."
                    },
                    {
                        "type": "code",
                        "value": "app.get('/produtos', async (req, res) => {\n  const pagina = Number(req.query.pagina) || 1;\n  const porPagina = Math.min(Number(req.query.porPagina) || 20, 100); // teto de segurança\n  const offset = (pagina - 1) * porPagina;\n\n  const { rows } = await pool.query(\n    'SELECT id, nome, preco FROM produtos ORDER BY id LIMIT $1 OFFSET $2',\n    [porPagina, offset],\n  );\n\n  res.json({ pagina, porPagina, produtos: rows });\n});\n\n// GET /produtos?pagina=3&porPagina=20\n// traz só 20 linhas daquela posição em diante, não a tabela inteira"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Sintoma no banco\",\"Causa comum\",\"Remédio\"],[\"Erro do tipo too many connections no Postgres\",\"Abrir uma conexão nova por requisição, sem pool\",\"Pool de conexões com um máximo por instância\"],[\"Listagem fica mais lenta conforme a tabela cresce\",\"Trazer a tabela inteira numa consulta só\",\"Paginação com LIMIT e OFFSET\"],[\"Consulta demora mesmo filtrando por uma coluna\",\"Falta de índice na coluna usada no WHERE\",\"Criar o índice certo (recap da trilha de banco)\"],[\"Uma rota dispara dezenas de queries pra montar uma lista\",\"O problema N+1: uma consulta por item, dentro de um laço\",\"Trazer os dados relacionados junto, com join ou include (recap da trilha de banco)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Cache e fila tiram peso do banco, mas não o aposentam. Pool, paginação, índice certo e réplica de leitura são o que sobra pra fazer quando o gargalo, no fim, continua sendo o banco."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que abrir uma conexão nova com o banco a cada requisição é considerado uma prática ruim?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o banco não aceita mais de uma conexão simultânea aberta",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda conexão nova apaga os dados guardados no cache do Redis",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque abrir conexão tem custo, e um pool reaproveita conexões prontas",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque conexões novas sempre retornam dados desatualizados do banco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para que serve a paginação com LIMIT e OFFSET numa listagem?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Para trazer só uma fatia dos resultados por vez, não a tabela inteira",
                                "isCorrect": true
                            },
                            {
                                "text": "Para criptografar os dados da tabela antes de enviá-los na resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "Para invalidar o cache relacionado àquela consulta automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Para criar um novo índice na tabela sempre que ela é consultada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma API escalada em 5 instâncias, cada uma com um pool configurado para até 20 conexões, passa a receber erros de conexões em excesso vindos do Postgres, que aceita no máximo 100 conexões simultâneas. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta um índice na tabela mais consultada, o que abre conexões extras no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "A paginação da listagem principal está mal configurada e vaza conexões abertas",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis está consumindo as conexões livres do Postgres para manter o cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Somadas, as 5 instâncias vezes 20 conexões já batem no teto de 100 do banco",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota de listagem de pedidos fica cada vez mais lenta conforme a tabela cresce, mesmo existindo índice na coluna usada no filtro. Ao investigar, percebe-se que a rota busca todos os pedidos de uma vez e depois faz uma consulta ao banco para cada pedido individualmente, para trazer os itens dele. Que problema é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Cache stampede, aliviado com um TTL um pouco mais curto na chave",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema N+1: uma consulta extra por item, dentro de um laço",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta de rate limit protegendo a rota contra excesso de acessos",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta de uma réplica de leitura para dividir a carga de consultas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação já usa cache-aside nas leituras mais frequentes e fila para os processamentos pesados, mas o banco principal continua sendo o gargalo em horários de pico, principalmente por causa de relatórios que fazem leituras pesadas e variadas. Qual estratégia, aplicada por cima das anteriores, ajuda a tirar essa carga de leitura do banco principal sem duplicar a lógica de escrita?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Réplicas de leitura: as consultas pesadas vão para uma cópia e a escrita fica no principal",
                                "isCorrect": true
                            },
                            {
                                "text": "TTL infinito no cache, para as leituras nunca mais precisarem tocar o banco principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o pool de conexões, liberando mais conexões simultâneas no banco principal",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco relacional pelo Redis como o armazenamento principal da aplicação",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Protegendo o sistema: rate limit com Redis e timeouts",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Escalar não é o mesmo que estar protegido\n\nRodar várias instâncias atrás de um load balancer resolve volume de tráfego normal. Não resolve tráfego anormal: um cliente com um bug que dispara a mesma requisição centenas de vezes, alguém tentando abusar de um endpoint, uma dependência externa que fica lenta e ameaça travar tudo junto com ela.\n\nEscalar sem proteger é só adiar o problema pra um volume maior. As três ferramentas desta aula: rate limiting, timeout e degradação elegante."
                    },
                    {
                        "type": "text",
                        "value": "### Rate limit, agora de verdade\n\nNa trilha de autenticação, rate limiting apareceu como conceito: limitar quantas requisições um cliente pode fazer num período, pra evitar abuso. Na prática, isso é um contador por cliente (por usuário, por IP, por chave de API) que precisa ser incrementado a cada requisição e comparado com um limite.\n\nSe esse contador vivesse na memória do processo, cada instância teria o seu próprio, separado, e o limite real acabaria sendo o limite configurado multiplicado pelo número de instâncias, porque nada impede o cliente de bater em instâncias diferentes. O contador precisa ser compartilhado, e é exatamente pra isso que o Redis serve aqui: um **INCR** atômico numa chave por cliente, com **EXPIRE** pra a janela de tempo reiniciar sozinha."
                    },
                    {
                        "type": "code",
                        "value": "const Redis = require('ioredis');\nconst redis = new Redis();\n\nconst LIMITE = 100;         // no máximo 100 requisições\nconst JANELA_SEGUNDOS = 60; // por minuto\n\nasync function rateLimit(req, res, next) {\n  const chave = 'rate:' + req.usuario.id; // um contador por cliente\n\n  const total = await redis.incr(chave);\n  if (total === 1) {\n    // primeira requisição da janela: define quando o contador expira\n    await redis.expire(chave, JANELA_SEGUNDOS);\n  }\n\n  if (total > LIMITE) {\n    return res.status(429).json({ erro: 'muitas requisições, tente novamente em instantes' });\n  }\n\n  next();\n}\n\napp.post('/pedidos', rateLimit, criarPedido);"
                    },
                    {
                        "type": "text",
                        "value": "### Timeout: não esperar pra sempre\n\nToda chamada pra fora da aplicação (banco, uma API externa, outro serviço interno) pode demorar mais do que o normal, ou nunca responder. Sem um limite de tempo, a requisição que fez essa chamada fica presa esperando, e junto dela fica presa a conexão do pool, o worker, o que quer que estivesse segurando aquele processamento.\n\nSob carga, isso é o começo de uma cascata: se muitas requisições ficam presas esperando a mesma dependência lenta, o pool de conexões esgota, requisições novas não conseguem nem começar, e um problema pontual numa dependência derruba a aplicação inteira. Um **timeout** limita até onde vale a pena esperar, e falha rápido depois disso."
                    },
                    {
                        "type": "code",
                        "value": "async function chamarPagamentoComTimeout(pedido) {\n  const controller = new AbortController();\n  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s de limite\n\n  try {\n    const resposta = await fetch('https://api.pagamentos.com/cobrar', {\n      method: 'POST',\n      body: JSON.stringify(pedido),\n      signal: controller.signal,\n    });\n    return await resposta.json();\n  } catch (erro) {\n    if (erro.name === 'AbortError') {\n      throw new Error('serviço de pagamento demorou demais, tente novamente');\n    }\n    throw erro;\n  } finally {\n    clearTimeout(timeoutId);\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "### Degradar com elegância\n\nQuando algo falha ou demora demais, a pior resposta costuma ser deixar o usuário esperando sem limite. A melhor costuma ser devolver alguma coisa, mesmo que não seja o ideal: uma versão sem uma parte não essencial (por exemplo, sem recomendações personalizadas), um dado de cache mesmo que um pouco velho, ou uma mensagem clara de tente de novo em instantes, em vez de travar.\n\nO objetivo não é esconder o problema, é não deixar um problema pequeno, como uma dependência lenta, virar um problema grande, como o sistema inteiro fora do ar."
                    },
                    {
                        "type": "quote",
                        "value": "Rate limit, timeout e degradação elegante não deixam o sistema mais rápido: deixam ele sobreviver quando algo dá errado, e algo sempre dá errado."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o objetivo do rate limiting numa API?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Acelerar o tempo de resposta de todas as requisições da API",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir a autenticação do usuário por uma simples chave de API",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o TTL do cache automaticamente sempre que há carga",
                                "isCorrect": false
                            },
                            {
                                "text": "Limitar quantas requisições um cliente faz num período de tempo",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Num rate limit implementado com Redis, para que servem os comandos INCR e EXPIRE usados juntos numa chave por cliente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "INCR checa se o cliente ainda está logado e EXPIRE faz o logout dele automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "INCR soma 1 ao contador do cliente e EXPIRE reinicia o contador depois de um tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "INCR grava a resposta da rota no cache e EXPIRE define o TTL dessa resposta guardada",
                                "isCorrect": false
                            },
                            {
                                "text": "INCR apaga a chave do cliente e EXPIRE cria uma chave nova a cada nova requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que implementar o contador de rate limit na memória do processo Node não funciona direito quando a API roda em várias instâncias atrás de um load balancer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque contadores guardados em memória são sempre bem mais lentos que uma ida ao banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Node simplesmente não permite guardar números que crescem dentro de variáveis",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada instância teria o próprio contador, multiplicando o limite pelo número delas",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o load balancer bloqueia qualquer contador guardado localmente, por segurança",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma rota chama uma API de pagamento externa que, às vezes, demora muito mais que o normal pra responder. Sem nenhum tratamento de timeout, o que tende a acontecer com o back-end enquanto espera essa chamada, especialmente sob carga?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Conexões do pool ficam presas esperando, podem esgotar e travar outras requisições",
                                "isCorrect": true
                            },
                            {
                                "text": "O Node cancela a chamada sozinho depois de 1 segundo, sem configurar nada",
                                "isCorrect": false
                            },
                            {
                                "text": "O Redis intercepta a chamada lenta e responde no lugar da API de pagamento",
                                "isCorrect": false
                            },
                            {
                                "text": "O JWT do usuário expira antes de a resposta da API de pagamento chegar de volta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de degradar com elegância quando uma dependência (por exemplo, um serviço de recomendações) está fora do ar ou muito lenta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Deixar a requisição travada esperando a dependência voltar, sem limite de tempo",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar timeout e responder uma versão reduzida, sem recomendações, em vez de travar",
                                "isCorrect": true
                            },
                            {
                                "text": "Desligar na mão a instância com problema e esperar até alguém perceber a falha",
                                "isCorrect": false
                            },
                            {
                                "text": "Devolver um erro 500 genérico, sem informação nenhuma, e deixar o cliente se virar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Recapitulando e o próximo passo: testes e qualidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O fim da trilha, o começo do resto\n\nChegou a última aula de Cache, Filas e Performance. A API de produtos e pedidos que serviu de fio condutor começou lenta, sem cache, síncrona em tudo, rodando numa instância só, e termina aqui com cache-aside no Redis, invalidação pensada por caso de uso, fila e worker pra trabalho pesado, e o caminho pra rodar em várias instâncias, sem estado, protegida contra abuso.\n\nVale a pena ver a jornada inteira de uma vez."
                    },
                    {
                        "type": "text",
                        "value": "### A jornada, do início ao fim\n\n- **Medir** (Módulo 1): antes de otimizar qualquer coisa, medir onde o tempo realmente vai, com p50, p95 e p99, em vez de chutar.\n- **Cache** (Módulos 2 e 3): parar de repetir trabalho caro, guardando o resultado em algum lugar rápido de ler, primeiro o conceito, depois o Redis na prática.\n- **Invalidação** (Módulo 4): a parte difícil do cache, garantir que o dado guardado acompanha o dado real quando ele muda.\n- **Filas e workers** (Módulos 5 e 6): tirar trabalho lento de dentro da requisição, processar em segundo plano, com retries e idempotência pra aguentar falha.\n- **Escalar** (Módulo 7, este aqui): rodar em várias instâncias, sem estado, com o banco protegido e o sistema defendido contra abuso.\n\nCada peça resolve um problema que a anterior deixa: cache reduz trabalho repetido, mas não ajuda se o gargalo é um processamento síncrono pesado; fila resolve o síncrono, mas só ajuda até onde uma instância aguenta; escalar resolve o volume, mas só funciona se o resto (cache, sessão, estado) já estiver nos lugares certos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Módulo\",\"Tema\",\"O que resolve\"],[\"1\",\"Medir performance\",\"Achar o gargalo de verdade, com p50, p95 e p99, em vez de chutar\"],[\"2\",\"Cache: a arte de não repetir trabalho\",\"Evita recalcular ou rebuscar o que não mudou\"],[\"3\",\"Redis na prática\",\"Onde cachear de forma compartilhada entre instâncias\"],[\"4\",\"Invalidação de cache\",\"Mantém o cache correto quando o dado muda\"],[\"5\",\"Filas e processamento assíncrono\",\"Tira trabalho lento de dentro da requisição\"],[\"6\",\"Workers, retries e idempotência\",\"Processa em segundo plano com confiabilidade\"],[\"7\",\"Escalar e juntar tudo\",\"Roda em várias instâncias, sem estado, protegido contra abuso\"]]"
                    },
                    {
                        "type": "text",
                        "value": "### E o roadmap de Back-end até aqui\n\nEssa trilha não vive sozinha. No roadmap de Back-end, você já tinha construído APIs com Express, modelado e consultado banco de dados (SQL, índices, o problema N+1, um ORM) e implementado autenticação (JWT, sem estado, rate limit como conceito). Cache, Filas e Performance pegou tudo isso e respondeu a pergunta seguinte: como fazer esse back-end aguentar crescer, em vez de só funcionar."
                    },
                    {
                        "type": "text",
                        "value": "### O próximo passo: Testes e qualidade\n\nTem um efeito colateral de tudo que essa trilha ensinou: o sistema ficou mais complexo. Agora tem cache que pode servir dado velho se a invalidação estiver errada, um worker que pode processar um job duas vezes se a idempotência estiver errada, várias instâncias que precisam se comportar de forma idêntica. Mais peças, mais formas de quebrar algo sem perceber ao mexer no código.\n\nÉ exatamente esse o motivo do próximo estágio do roadmap de Back-end ser **Testes e qualidade**. Um teste automatizado não deixa o sistema mais rápido nem mais escalável: ele garante que a próxima mudança não vai quebrar o cache, perder um job ou introduzir um bug que só aparece com 3 instâncias rodando ao mesmo tempo. É a camada de confiança por cima de tudo que você construiu até aqui."
                    },
                    {
                        "type": "code",
                        "value": "// um gostinho do que vem na próxima trilha: um teste garantindo que\n// o cache-aside realmente evita ir ao banco de novo\n\ntest('GET /produtos/1 usa o cache na segunda chamada', async () => {\n  const buscarNoBancoSpy = jest.spyOn(bancoDeProdutos, 'buscarPorId');\n\n  await request(app).get('/produtos/1'); // primeira chamada: miss, vai ao banco\n  await request(app).get('/produtos/1'); // segunda chamada: deveria vir do cache\n\n  expect(buscarNoBancoSpy).toHaveBeenCalledTimes(1);\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Medir, cachear, invalidar direito, tirar trabalho pesado da requisição, escalar sem quebrar: é assim que um back-end aguenta crescer. O próximo passo é garantir, com testes, que ele continua aguentando depois que o código muda."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual dessas sequências representa, em ordem, a jornada construída ao longo da trilha Cache, Filas e Performance?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Medir, cachear, invalidar, enfileirar, escalar",
                                "isCorrect": true
                            },
                            {
                                "text": "Escalar, medir, cachear, invalidar, enfileirar",
                                "isCorrect": false
                            },
                            {
                                "text": "Enfileirar, escalar, cachear, medir, invalidar",
                                "isCorrect": false
                            },
                            {
                                "text": "Cachear, invalidar, escalar, enfileirar, medir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o próximo estágio do roadmap de Back-end depois da trilha Cache, Filas e Performance?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Introdução ao Node.js",
                                "isCorrect": false
                            },
                            {
                                "text": "Modelagem de banco de dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes e qualidade",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação e autorização",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido que o estágio de Testes e qualidade venha logo depois de uma trilha que ensina cache, filas e escala, e não antes dela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque testes só fazem sentido em sistemas que não guardam estado nenhum, como cache",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes automatizados substituem a necessidade de medir o sistema em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só é possível escrever testes depois de o sistema rodar meses em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o sistema ficou mais complexo, e testes garantem que uma mudança não quebrou nada",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe corrige um bug na lógica de invalidação de cache e, sem perceber, quebra o comportamento do worker que marca os jobs de pagamento como concluídos. O problema só é percebido dias depois, em produção. O que, aplicado antes de colocar essa mudança no ar, poderia ter pego esse erro mais cedo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um TTL bem mais curto configurado nas chaves de cache envolvidas no bug",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes automatizados do cache e do worker, rodados antes do deploy",
                                "isCorrect": true
                            },
                            {
                                "text": "Um número maior de instâncias rodando atrás do load balancer da API",
                                "isCorrect": false
                            },
                            {
                                "text": "Um rate limit bem mais agressivo aplicado nas rotas envolvidas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de aplicar cache, filas e escala horizontal num sistema, qual afirmação melhor explica por que medir (o assunto do Módulo 1) continua sendo necessário, mesmo com tudo já otimizado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Medir só valia no comecinho, antes de qualquer otimização estar aplicada",
                                "isCorrect": false
                            },
                            {
                                "text": "Com o sistema otimizado, os números param de mudar e medir perde utilidade",
                                "isCorrect": false
                            },
                            {
                                "text": "Medir é uma etapa burocrática que não influencia nenhuma decisão técnica",
                                "isCorrect": false
                            },
                            {
                                "text": "Otimizar move o gargalo: resolvido um, outro surge, e só medir mostra qual é",
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
