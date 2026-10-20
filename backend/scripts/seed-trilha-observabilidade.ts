// Seed da trilha Observabilidade. Conteúdo autoral, quiz-only, com exemplos de código em
// C#. As resoluções comentadas ficam em scripts/solucoes/observabilidade.json e entram
// por mesclarSolucoes. Idempotente: se a trilha já tiver aulas, só atualiza as
// explicações.
//
// As alternativas já saem embaralhadas do gerador, com semente no enunciado. Sem
// isso a correta ficaria em position 1 em toda questão e o gabarito do e-book, que
// não passa pelo backend, sairia todo em A.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-observabilidade.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "Observabilidade";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const HORAS = 20;
const DESCRICAO =
    "Observabilidade com OpenTelemetry, do log ao SLO: logs estruturados, métricas e traces distribuídos instrumentados em .NET, o Collector e o pipeline de telemetria, Prometheus, Grafana, Loki e Tempo, painéis, alertas por sintoma, SLO e error budget, e um roteiro para investigar latência e erro em produção, inclusive através de filas.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    explanation?: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS = [
    {
        titulo: "Módulo 1 - O que é observabilidade",
        aulas: [
            {
                titulo: "Monitoramento x observabilidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Monitoramento x observabilidade\n\nTrês e sete da manhã. O alerta toca: a taxa de erro do checkout passou de 2%. Você abre o painel do serviço, e ele responde com precisão tudo o que alguém pensou em perguntar quando o montou: a taxa de erro subiu, a latência subiu um pouco, a CPU está normal, o banco está normal e não houve deploy nas últimas seis horas. O painel confirma que existe um problema e não diz nada sobre ele.\n\nA pergunta que importa agora é outra: **quem** está falhando? Todos os clientes ou só alguns? Se são alguns, o que eles têm em comum? Ninguém criou um gráfico de erros por versão do aplicativo, por bandeira de cartão e por banco emissor, porque ninguém imaginou que essa combinação importaria. Às três da manhã, ela importa.\n\nA distância entre essas duas perguntas é a distância entre monitoramento e observabilidade.\n\n## Monitoramento: as perguntas que você previu\n\nMonitorar é acompanhar sinais escolhidos com antecedência e ser avisado quando eles saem da faixa esperada: taxa de erro, latência, disco, tamanho de fila. Cada painel e cada alerta é uma pergunta feita **antes** do problema. Isso funciona muito bem para falhas conhecidas (o disco que enche, o certificado que vence, o serviço que cai) e continua indispensável, porque é o monitoramento que acorda você.\n\nO limite está no próprio desenho: ele só responde ao que foi previsto. Quando a falha é nova, uma combinação que ninguém imaginou, o painel mostra o sintoma e para aí.",
                    },
                    {
                        type: "text",
                        value: "## Observabilidade: a pergunta nova, sem deploy novo\n\nO termo vem da teoria de controle (Rudolf Kálmán, 1960): um sistema é observável quando dá para deduzir o estado interno dele a partir do que ele emite para fora. Em software, a ideia virou um teste prático: **dá para responder uma pergunta que ninguém fez antes, sem escrever código novo e sem fazer deploy?**\n\nSe a única forma de descobrir quais clientes estão falhando é acrescentar um log, publicar uma versão e esperar o erro acontecer de novo, o sistema não é observável para essa pergunta. Se cada requisição já sai do serviço como um evento rico, com a versão do aplicativo, o meio de pagamento, o emissor do cartão, o plano do cliente e a duração de cada etapa, a pergunta vira um filtro e um agrupamento feitos na hora.\n\nObservabilidade, portanto, não é uma ferramenta que se compra nem um painel bonito: é uma propriedade do sistema, construída na instrumentação. A ferramenta só consegue mostrar o que a aplicação emitiu. Um evento rico se parece com o exemplo abaixo, um *span*: o registro de uma operação dentro da requisição, com a duração e os atributos dela (a aula seguinte detalha cada sinal).",
                    },
                    {
                        type: "code",
                        value: "// O span de uma requisição do checkout, com contexto de negócio (simplificado)\n{\n  \"name\": \"POST /checkout\",\n  \"trace_id\": \"4bf92f3577b34da6a3ce929d0e0e4736\",\n  \"duration_ms\": 1840,\n  \"status\": \"ERROR\",\n  \"attributes\": {\n    \"http.route\": \"/checkout\",\n    \"http.response.status_code\": 502,\n    \"loja.app.versao\": \"5.2.0\",\n    \"loja.app.plataforma\": \"android\",\n    \"loja.pagamento.bandeira\": \"elo\",\n    \"loja.pagamento.emissor\": \"banco-x\",\n    \"loja.cliente.plano\": \"premium\"\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## A mesma madrugada, com eventos ricos\n\nCom spans assim chegando, a investigação muda de natureza. Você filtra os spans do checkout com erro na última hora e agrupa por um atributo de cada vez. Por plataforma: Android e iOS falham na mesma proporção, então o problema não é de uma plataforma. Por bandeira: 97% dos erros são de uma bandeira só. Por emissor, dentro dessa bandeira: um banco. Em dez minutos, a hipótese \"o autorizador do banco X está recusando essa bandeira\" está na mesa, com os identificadores de algumas requisições (os *trace ids*) para mostrar ao parceiro, sem uma linha de código nova.\n\nRepare no que tornou isso possível: os atributos estavam no evento **antes** de a pergunta existir. É o terreno dos *unknown unknowns*, os problemas que você nem sabia que podia ter. O monitoramento cobre os *known unknowns*: você sabe que o disco pode encher, só não sabe quando.",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\",\"Monitoramento\",\"Observabilidade\"],[\"Quando a pergunta é feita\",\"Antes do problema, ao montar o painel e o alerta\",\"Durante a investigação, na hora\"],[\"Tipo de falha que cobre\",\"Conhecida: disco cheio, serviço fora, fila crescendo\",\"Nova: a combinação que ninguém previu\"],[\"Dado típico\",\"Métricas agregadas, com poucas dimensões\",\"Eventos com muitos atributos: traces e logs estruturados\"],[\"O que entrega\",\"\\\"Algo está errado\\\"\",\"\\\"O que está errado, para quem e por quê\\\"\"],[\"Sintoma de quando falta\",\"Ninguém é avisado do problema\",\"Toda investigação exige um deploy com log novo\"]]",
                    },
                    {
                        type: "text",
                        value: "## Um não substitui o outro\n\nObservabilidade não aposenta o monitoramento. Alertas continuam vindo de métricas previstas, porque elas são baratas, estáveis e boas de comparar com um limite. Os eventos ricos entram depois que o alerta toca, para explicar o que ele mostrou. Uma equipe madura tem os dois: poucos alertas bem escolhidos e telemetria rica o bastante para investigar o que o alerta não explica.\n\nTrês erros comuns:\n\n- **Comprar a ferramenta e achar que acabou.** Sem instrumentação com contexto, a ferramenta mais cara do mercado mostra o mesmo painel de CPU e taxa de erro. O trabalho está em decidir o que cada evento carrega.\n- **O painel com 80 gráficos.** Cada gráfico é uma pergunta prevista. O painel gigante prevê muitas perguntas e, mesmo assim, não responde a nova; só fica mais difícil de ler às três da manhã.\n- **O log sem contexto.** `Erro ao processar pagamento`, sem pedido, sem cliente, sem bandeira e sem trace id, não dá para filtrar nem agrupar. É texto, não evidência.",
                    },
                    {
                        type: "quote",
                        value: "Monitoramento responde às perguntas que você fez antes do problema; observabilidade é poder fazer a pergunta nova durante o problema, sem deploy. Os dois andam juntos: o alerta avisa, e os eventos ricos explicam.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual teste prático diz se um sistema é observável para uma pergunta nova?",
                        difficulty: "facil",
                        options: [
                            { text: "Dá para respondê-la com a telemetria que já existe, sem deploy", isCorrect: true },
                            { text: "Existe um alerta configurado para disparar quando ela importar", isCorrect: false },
                            { text: "Existe um painel pronto com um gráfico feito para essa pergunta", isCorrect: false },
                            { text: "A ferramenta contratada tem um relatório pronto para essa pergunta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para que tipo de falha os painéis e alertas definidos com antecedência funcionam bem?",
                        difficulty: "facil",
                        options: [
                            { text: "Falhas conhecidas, como disco enchendo ou serviço fora do ar", isCorrect: true },
                            { text: "Falhas novas, que dependem de uma combinação nunca vista antes", isCorrect: false },
                            { text: "Qualquer falha, desde que o painel tenha gráficos suficientes", isCorrect: false },
                            { text: "Falhas de um único cliente, investigadas pelo identificador dele", isCorrect: false },
                        ],
                    },
                    {
                        statement: "De madrugada, a taxa de erro do checkout sobe. As métricas do serviço só têm os rótulos de rota e de código de status, e os erros parecem concentrados num grupo de clientes ainda desconhecido. O que permitiria descobrir esse grupo sem fazer deploy?",
                        difficulty: "medio",
                        options: [
                            { text: "Coletar as métricas de CPU e de memória com uma frequência maior", isCorrect: false },
                            { text: "Spans que já carregam atributos como versão do app e meio de pagamento", isCorrect: true },
                            { text: "Um log novo com os dados do cliente, publicado numa versão de emergência", isCorrect: false },
                            { text: "Um painel novo da taxa de erro quebrada por versão, montado na hora", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma equipe anuncia: \"agora temos observabilidade, contratamos uma ferramenta e importamos 80 painéis prontos\". O que falta nessa conta?",
                        difficulty: "medio",
                        options: [
                            { text: "Uma ferramenta de código aberto, porque as pagas não aceitam perguntas novas", isCorrect: false },
                            { text: "Mais painéis, porque 80 é pouco para cobrir um sistema distribuído", isCorrect: false },
                            { text: "Eventos com contexto, porque painéis só respondem perguntas previstas", isCorrect: true },
                            { text: "Alertas em todos os painéis, porque painel sem alerta ninguém consulta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço emite só três métricas: uso de CPU, uso de memória e taxa de erro por rota. Pela definição da teoria de controle, por que ele é pouco observável?",
                        difficulty: "dificil",
                        options: [
                            { text: "As saídas são coletadas em intervalos, e só a coleta contínua revela o estado", isCorrect: false },
                            { text: "Estados internos diferentes geram saídas iguais, que não distinguem a causa", isCorrect: true },
                            { text: "O serviço emite saídas demais, e o excesso de sinais esconde o estado", isCorrect: false },
                            { text: "As saídas são números, e deduzir o estado exigiria saídas em texto livre", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Os sinais: logs, métricas e traces",
                blocks: [
                    {
                        type: "text",
                        value: "# Os sinais: logs, métricas e traces\n\nUma requisição lenta no checkout pode ser contada de três jeitos. O **log** diz o que aconteceu, com palavras e campos: \"pagamento recusado pelo emissor, pedido 81723\". A **métrica** diz quanto e com que frequência: \"o p99 do checkout passou de 300 ms para 1,8 s nos últimos dez minutos\" (p99 é o tempo que só 1% das requisições ultrapassa). O **trace** diz por onde a requisição passou e onde o tempo foi gasto: \"dos 1,8 s, 1,6 s foram esperando o emissor do cartão\". Cada sinal responde a um tipo de pergunta, custa de um jeito diferente e engana quando é usado para a pergunta errada.\n\n## Logs: o registro de cada evento\n\nUm log é o registro, com data e hora, de algo que aconteceu. O log útil hoje é **estruturado**: em vez de uma frase solta, um registro com campos que dá para filtrar e agrupar. Este chegou ao Loki no laboratório que você monta na última aula deste módulo, enviado por um `ILogger` comum do .NET:",
                    },
                    {
                        type: "code",
                        value: "// Um log estruturado, como chegou ao Loki no laboratório (campos resumidos)\n{\n  \"timestamp\": \"2026-10-20T13:27:22.585Z\",\n  \"severity_text\": \"Information\",\n  \"body\": \"Consultando o pedido {PedidoId}\",\n  \"PedidoId\": \"29\",\n  \"service_name\": \"pedidos-api\",\n  \"trace_id\": \"91bd320c2c5d5ab8bed4cedc929543e2\",\n  \"span_id\": \"da55da5b31ac4207\"\n}",
                    },
                    {
                        type: "text",
                        value: "O log responde \"o que aconteceu neste evento, com que detalhe\". É o sinal mais familiar e o que carrega mais contexto de negócio. O custo dele cresce com o **volume**: cada linha é transmitida, indexada de algum jeito e guardada. Um serviço com mil requisições por segundo e cinco logs por requisição produz 432 milhões de linhas por dia; a 500 bytes cada, são mais de 200 GB diários, e o dobro de tráfego é o dobro da conta.\n\n## Métricas: números agregados no tempo\n\nUma métrica é uma medida numérica agregada: contador de requisições, histograma de duração, número de conexões abertas. A agregação acontece dentro do processo, antes de a telemetria sair: mil requisições viram um contador que avançou mil, não mil registros. Cada combinação de nome e valores de rótulos forma uma **série temporal**, e é por série que a métrica custa, não por requisição. No laboratório, a duração das requisições virou séries assim no Prometheus:",
                    },
                    {
                        type: "code",
                        value: "# Uma série do Prometheus no laboratório (rótulos resumidos) e o valor dela\nhttp_server_request_duration_seconds_count{job=\"pedidos-api\", http_request_method=\"GET\", http_route=\"/pedidos/{id:int}\", http_response_status_code=\"200\"}  30",
                    },
                    {
                        type: "text",
                        value: "Métrica é o sinal do alerta e da tendência: pequena, barata de guardar por meses e rápida de consultar. O Prometheus guarda 15 dias por padrão, e soluções de longo prazo levam isso a anos. O preço é a agregação: a métrica sabe que 2% das requisições falharam, mas não sabe **quais**.\n\n## Traces: o caminho de uma requisição\n\nUm trace é a história de uma requisição atravessando o sistema. Ele é feito de **spans**: cada span é uma operação com início, duração, atributos e o span pai, e o conjunto forma uma árvore.",
                    },
                    {
                        type: "code",
                        value: "# Um trace do checkout: cada linha é um span, com o serviço e a duração\nPOST /checkout                      checkout-api     1.840 ms\n  SELECT carrinho                   checkout-api        12 ms\n  POST /reservas                    estoque-api         45 ms\n  POST /cobrancas                   pagamentos-api   1.702 ms\n    POST /autorizacoes              pagamentos-api   1.651 ms   (emissor do cartão)",
                    },
                    {
                        type: "text",
                        value: "O trace responde \"onde o tempo foi gasto e qual dependência falhou **nesta** requisição\", inclusive entre serviços diferentes. Custa por volume de spans, e uma requisição gera vários, cada um com atributos. Por isso traces costumam ser **amostrados**: guarda-se uma fração das requisições, e as regras de quais guardar são assunto que volta mais adiante no estudo.\n\n## Profiles, de passagem\n\nO trace para no limite da operação: mostra que `CalcularFrete` levou 900 ms sem chamar nenhum outro serviço, mas não qual função gastou esse tempo. Quem responde é o **profiling contínuo**, que amostra a pilha de chamadas do processo dezenas de vezes por segundo e mostra, num *flame graph*, as funções que consomem CPU ou alocam memória. Em outubro de 2026, profiles é um sinal em desenvolvimento no OpenTelemetry: o protocolo ainda não é estável e o SDK do .NET não o oferece. Quem faz profiling contínuo hoje usa ferramentas próprias, como o Grafana Pyroscope.",
                    },
                    {
                        type: "table",
                        value: "[[\"Sinal\",\"Responde\",\"O custo cresce com\",\"Ponto forte\",\"Limite\"],[\"Log\",\"O que aconteceu neste evento, com detalhe\",\"Volume de linhas e de bytes\",\"Contexto de negócio e texto\",\"Caro em volume; ruim de agregar se não for estruturado\"],[\"Métrica\",\"Quanto, com que frequência, se piorou\",\"Número de séries (combinações de rótulos)\",\"Barata, ideal para alerta e tendência\",\"Perde o caso individual\"],[\"Trace\",\"Por onde a requisição passou e onde gastou tempo\",\"Volume de spans\",\"Mostra a causa entre serviços\",\"Quase sempre amostrado\"],[\"Profile\",\"Qual função gasta CPU ou memória\",\"Frequência de amostragem e retenção\",\"Aponta o trecho de código caro\",\"Em desenvolvimento no OpenTelemetry (2026)\"]]",
                    },
                    {
                        type: "text",
                        value: "## Os sinais trabalham juntos\n\nNa investigação típica, a métrica avisa (o p99 subiu), o trace mostra onde (o span do emissor) e o log conta o detalhe (o código de recusa que o emissor devolveu). A ponte entre eles é o contexto: repare que o log do laboratório chegou com `trace_id` e `span_id`, então dá para sair da linha de log direto para o trace da mesma requisição.\n\nDois erros custam caro:\n\n- **Contar com logs.** Procurar linhas com \"erro\" e contá-las para fazer o gráfico da taxa de erro paga a ingestão de cada linha e quebra no dia em que alguém muda a frase. Contar é trabalho de métrica.\n- **Contar com traces amostrados.** Com 10% de amostragem, o backend de traces vê uma em cada dez requisições, e qualquer contagem feita ali sai errada. O trace explica casos; quem conta é a métrica.",
                    },
                    {
                        type: "quote",
                        value: "A métrica avisa e mostra tendência, o trace mostra onde estão o tempo e o erro, e o log conta o detalhe do evento. Métrica custa por série; log e trace custam por volume, e é isso que decide o que vai em cada um.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual sinal responde melhor à pergunta \"a taxa de erro do checkout subiu nos últimos 15 minutos\"?",
                        difficulty: "facil",
                        options: [
                            { text: "Trace, porque mostra o caminho de cada requisição", isCorrect: false },
                            { text: "Profile, porque mostra as funções que gastam CPU", isCorrect: false },
                            { text: "Log, porque registra o texto de cada erro ocorrido", isCorrect: false },
                            { text: "Métrica, porque guarda números agregados no tempo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O custo de armazenar logs cresce principalmente com o quê?",
                        difficulty: "facil",
                        options: [
                            { text: "Com a quantidade de serviços que consultam os logs", isCorrect: false },
                            { text: "Com o número de painéis e alertas montados sobre os logs", isCorrect: false },
                            { text: "Com o número de combinações distintas de rótulos", isCorrect: false },
                            { text: "Com o volume de linhas e de bytes ingeridos por dia", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma equipe guarda 10% dos traces e monta o gráfico de requisições por minuto contando os traces no backend. Em produção entram 6.000 requisições por minuto. O que o gráfico mostra?",
                        difficulty: "medio",
                        options: [
                            { text: "Cerca de 6.000, porque a amostragem corta spans, não traces inteiros", isCorrect: false },
                            { text: "Cerca de 600, porque só um em cada dez traces chega ao backend", isCorrect: true },
                            { text: "Cerca de 60.000, porque cada trace soma uns dez spans em média", isCorrect: false },
                            { text: "Cerca de 6.000, porque o SDK informa ao backend o total de requisições", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um span mostra que a operação `CalcularFrete` levou 900 ms, quase todos de CPU, sem nenhuma chamada externa. Que sinal aponta a função culpada sem instrumentar cada função à mão, e qual a situação dele no OpenTelemetry em outubro de 2026?",
                        difficulty: "medio",
                        options: [
                            { text: "Métrica, com um histograma por função; estável no SDK do .NET", isCorrect: false },
                            { text: "Trace, com um span por linha de código; estável e pronto para isso", isCorrect: false },
                            { text: "Log, com uma linha por função chamada; estável no OpenTelemetry", isCorrect: false },
                            { text: "Profile, que amostra a pilha de chamadas; ainda em desenvolvimento", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Por requisição, um serviço escreve quatro linhas de log e registra a duração num histograma com os rótulos de rota, método e status. O tráfego dobra, com as mesmas rotas e os mesmos status de antes. O que acontece com o custo de cada sinal?",
                        difficulty: "dificil",
                        options: [
                            { text: "Os dois dobram, porque cada requisição gera dados nos dois sinais", isCorrect: false },
                            { text: "O de logs dobra, e o do histograma fica igual, porque as séries não mudam", isCorrect: true },
                            { text: "Nenhum muda, porque os dois sinais são agregados antes de sair do processo", isCorrect: false },
                            { text: "O de logs fica igual, porque linhas parecidas comprimem, e o do histograma dobra", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Cardinalidade e custo",
                blocks: [
                    {
                        type: "text",
                        value: "# Cardinalidade e custo\n\nUma equipe quer saber quais clientes compram mais pelo aplicativo e tem um contador de pedidos à mão. Alguém acrescenta o id do cliente como rótulo, o painel fica ótimo por uma semana, e a fatura do serviço de métricas no fim do mês vem várias vezes maior. Ou, com um Prometheus próprio, a memória dispara e as consultas começam a estourar o tempo limite. Ninguém mudou o tráfego: mudou a **cardinalidade**.\n\n## Série temporal e cardinalidade\n\nNo Prometheus, e em quase todo banco de métricas, cada combinação única de nome da métrica e valores dos rótulos é uma **série temporal** separada, com o próprio histórico. Cardinalidade é o número de séries, e o teto é uma multiplicação: o produto da quantidade de valores de cada rótulo.\n\nNo laboratório da última aula do módulo, o histograma de duração das requisições do ASP.NET Core virou 17 séries no Prometheus para **cada** combinação de rótulos: 15 de buckets (as faixas do histograma, de 5 ms a 10 s, mais a faixa infinita), uma de soma e uma de contagem. Num serviço com 40 combinações reais de rota e método e 4 códigos de status em uso, são 160 combinações, ou 2.720 séries por instância; com 10 instâncias, 27.200. Parece muito, mas é um número **limitado**: dobrar o tráfego não cria nenhuma série nova.",
                    },
                    {
                        type: "text",
                        value: "## O rótulo sem limite\n\nAgora acrescente `user_id` a um contador de pedidos. Com 200 mil clientes comprando no mês, aquele contador sai de um punhado de séries para até 200 mil. Coloque o mesmo rótulo no histograma de duração e cada combinação de rota, método e status pode virar 200 mil vezes 17: 3,4 milhões de séries. E a conta cresce com o número de clientes, justamente o crescimento que a empresa quer.\n\nCada série custa memória (no Prometheus, as séries ativas ficam em memória), disco e tempo de consulta. Nos serviços gerenciados, o preço costuma ser por série ativa ou por combinação única de rótulos. O erro aparece no código assim, e o conserto também:",
                    },
                    {
                        type: "code",
                        value: "// O erro: o id do cliente como atributo de métrica, uma série por cliente\nTelemetria.PedidosCriados.Add(1,\n    new KeyValuePair<string, object?>(\"user_id\", pedido.ClienteId));\n\n// O conserto: na métrica, só dimensões de poucos valores...\nTelemetria.PedidosCriados.Add(1,\n    new KeyValuePair<string, object?>(\"loja.cliente.plano\", pedido.Plano));\n\n// ...e o id vai para o span e para o log, que custam por evento\nActivity.Current?.SetTag(\"enduser.id\", pedido.ClienteId);\nlogger.LogInformation(\"Pedido {PedidoId} criado para o cliente {ClienteId}\",\n    pedido.Id, pedido.ClienteId);",
                    },
                    {
                        type: "table",
                        value: "[[\"Atributo\",\"Valores possíveis\",\"Vai na métrica?\"],[\"`http.request.method`\",\"Meia dúzia (GET, POST...)\",\"Sim\"],[\"`http.response.status_code`\",\"Poucos em uso de verdade\",\"Sim\"],[\"`http.route` (`/pedidos/{id:int}`)\",\"Um por rota declarada\",\"Sim\"],[\"`loja.cliente.plano`\",\"Três: free, pro e premium\",\"Sim\"],[\"`url.path` (`/pedidos/81723`)\",\"Um por id que já apareceu\",\"Não: fica no span\"],[\"`user_id` (identificador interno)\",\"Um por cliente\",\"Não: span e log\"],[\"E-mail, CPF\",\"Um por pessoa\",\"Não: dado pessoal fica fora da telemetria\"],[\"Id do pedido, trace id\",\"Um por requisição\",\"Não: span e log\"],[\"Mensagem de erro com dados dentro\",\"Sem limite (texto livre)\",\"Não: use o tipo do erro, `error.type`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Onde o `user_id` deve ir\n\nA regra que resolve quase todos os casos: **alta cardinalidade é bem-vinda no evento e cara na métrica**. Span e log custam por evento, não por valor distinto: um span com o atributo `enduser.id` (o nome que as semantic conventions propõem) custa o mesmo que um span sem ele, uns bytes a mais. Com o id no span e no log, a pergunta \"o que aconteceu com o cliente 81723 ontem à noite?\" vira uma busca. A métrica fica com a dimensão de poucos valores, o plano do cliente, e responde \"quantos pedidos por plano, por minuto\". Use um identificador interno, nunca o e-mail ou o CPF: dado pessoal na telemetria é outro problema, e sério.\n\nE \"os dez clientes que mais compraram no mês\" não é pergunta de observabilidade: é relatório de negócio, e mora no banco de dados ou no data warehouse, não num banco de métricas.\n\nAs ferramentas já seguem essa regra. No laboratório, o span do ASP.NET Core chegou com `url.path` igual a `/pedidos/1`, mas a métrica só tinha `http_route=\"/pedidos/{id:int}\"`: as convenções põem o caminho concreto no evento e o modelo da rota na métrica. No Loki, o `trace_id` dos logs chegou como metadado estruturado, não como rótulo de índice, pelo mesmo motivo.",
                    },
                    {
                        type: "text",
                        value: "## Redes de proteção, e por que não bastam\n\nO SDK do OpenTelemetry para .NET tem um **limite de cardinalidade**: por padrão, 2.000 combinações de atributos por métrica. Passou disso, as medições de combinações novas caem numa série única de transbordo, marcada com `otel.metric.overflow=true`. A aplicação não cai e a conta não explode, mas qualquer consulta que filtre por atributo deixa de ser confiável, e nada avisa você na tela. A rede impede o desastre; não conserta o desenho.\n\nTambém há cardinalidade que não vem de rótulo seu. O `AddService` gera um `service.instance.id` novo a cada vez que o processo sobe, e o Prometheus o transforma no rótulo `instance`: cada deploy ou reinício cria um conjunto novo de séries e aposenta o anterior. É a **rotatividade** de séries (*churn*), normal com contêineres, mas que pesa quando os reinícios são muito frequentes.\n\nOs erros que mais aparecem em revisão de código:\n\n- **Caminho cru como rótulo.** Middleware próprio que registra `context.Request.Path` em vez da rota cria uma série por id.\n- **Mensagem de exceção como rótulo.** Texto livre com ids e valores dentro: cardinalidade sem limite.\n- **Trace id na métrica para \"correlacionar\".** O jeito certo de ligar métrica e trace são os *exemplars*, assunto que volta mais adiante no estudo.",
                    },
                    {
                        type: "quote",
                        value: "Métrica custa por série, e cada valor distinto de rótulo multiplica as séries. Identificador de cliente, de pedido ou de trace vai no span e no log, que custam por evento; na métrica ficam só as dimensões de poucos valores.",
                    },
                ],
                questions: [
                    {
                        statement: "No Prometheus, o que forma uma série temporal?",
                        difficulty: "facil",
                        options: [
                            { text: "Cada combinação única de nome da métrica e valores de rótulos", isCorrect: true },
                            { text: "Cada métrica, somando todos os valores de rótulos que ela recebe", isCorrect: false },
                            { text: "Cada instância da aplicação, com todas as métricas que ela envia", isCorrect: false },
                            { text: "Cada requisição registrada pela aplicação no período de coleta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destes atributos é seguro como rótulo de uma métrica de requisições HTTP?",
                        difficulty: "facil",
                        options: [
                            { text: "`http.route`, com o modelo da rota, como `/pedidos/{id:int}`", isCorrect: true },
                            { text: "`url.path`, com o caminho concreto, como `/pedidos/81723`", isCorrect: false },
                            { text: "`trace_id`, com o identificador do trace daquela requisição", isCorrect: false },
                            { text: "`enduser.id`, com o identificador do cliente que fez a chamada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um histograma de duração gera 17 séries por combinação de rótulos. O serviço tem 50 combinações de rota e método, 4 códigos de status em uso e roda em 6 instâncias. Quantas séries esse histograma produz, no máximo, se toda combinação aparecer em todas as instâncias?",
                        difficulty: "medio",
                        options: [
                            { text: "1.200", isCorrect: false },
                            { text: "20.400", isCorrect: true },
                            { text: "3.400", isCorrect: false },
                            { text: "81.600", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para descobrir o que aconteceu com o pedido de um cliente específico ontem à noite, onde o id do cliente deve estar?",
                        difficulty: "medio",
                        options: [
                            { text: "No nome da métrica, criando uma métrica nova para cada cliente", isCorrect: false },
                            { text: "No recurso da aplicação, junto com o `service.name` do serviço", isCorrect: false },
                            { text: "Num rótulo da métrica de pedidos, para filtrar o cliente no gráfico", isCorrect: false },
                            { text: "Nos atributos do span e nos campos do log daquela requisição", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um deploy acrescentou o atributo `loja.cliente.cidade` ao contador de pedidos. Desde então, os gráficos filtrados por cidade somam menos pedidos do que o total, e surgiu uma série com `otel.metric.overflow=true`. A aplicação usa o SDK do OpenTelemetry para .NET com a configuração padrão. O que aconteceu?",
                        difficulty: "dificil",
                        options: [
                            { text: "O contador passou de 2.000 combinações, e o excedente foi para a série de transbordo", isCorrect: true },
                            { text: "O SDK passou a amostrar as medições do contador para economizar, como faz com traces", isCorrect: false },
                            { text: "O Collector descartou as séries novas por falta de memória e marcou o lote que sobrou", isCorrect: false },
                            { text: "O Prometheus recusou rótulos com ponto no nome e agrupou as séries como transbordo", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "OpenTelemetry: API, SDK, OTLP e Collector",
                blocks: [
                    {
                        type: "text",
                        value: "# OpenTelemetry: API, SDK, OTLP e Collector\n\nAté o fim da década passada, instrumentar uma aplicação era casar com um fornecedor. Cada ferramenta de APM (monitoramento de desempenho de aplicações) tinha o próprio agente, a própria biblioteca e o próprio formato, e trocar de ferramenta significava refazer a instrumentação do sistema inteiro. Dois projetos abertos atacaram o problema ao mesmo tempo, o OpenTracing e o OpenCensus, e em 2019 se fundiram no **OpenTelemetry**, projeto da CNCF (a fundação que também abriga o Kubernetes) que hoje tem o apoio de praticamente todos os fornecedores de observabilidade.\n\nA promessa: você instrumenta uma vez, num padrão aberto, e escolhe o destino da telemetria por configuração. Para cumprir isso, o projeto é dividido em peças com papéis separados.",
                    },
                    {
                        type: "table",
                        value: "[[\"Peça\",\"O que é\",\"No .NET\"],[\"API\",\"As interfaces para criar spans, métricas e logs, sem implementação\",\"`ActivitySource`, `Meter` e `ILogger`, do próprio .NET\"],[\"SDK\",\"A implementação: amostragem, agregação, lotes e envio\",\"Pacote `OpenTelemetry`, ligado por `OpenTelemetry.Extensions.Hosting`\"],[\"Instrumentação\",\"Bibliotecas que geram telemetria de frameworks prontos\",\"`OpenTelemetry.Instrumentation.AspNetCore`, `.Http` e outras\"],[\"Exporter\",\"A parte do SDK que envia a telemetria para fora\",\"`OpenTelemetry.Exporter.OpenTelemetryProtocol`\"],[\"OTLP\",\"O protocolo de envio, por gRPC (porta 4317) ou HTTP (porta 4318)\",\"O que o exporter fala\"],[\"Collector\",\"Um serviço separado que recebe, processa e reenvia\",\"Um binário próprio, fora da aplicação\"],[\"Semantic conventions\",\"Os nomes padronizados de atributos e métricas\",\"`service.name`, `http.route`, `http.response.status_code`\"]]",
                    },
                    {
                        type: "text",
                        value: "## API e SDK: por que separar\n\nA API é o que o código chama; o SDK é o que faz o trabalho. Uma biblioteca (um pacote NuGet, uma biblioteca interna da empresa) depende só da API e emite telemetria sem saber se alguém vai coletá-la. Quem decide é a aplicação, ao instalar o SDK. Sem SDK, as chamadas da API quase não custam: não há ninguém ouvindo, e nada é medido nem enviado.\n\nNo .NET, a API é a própria biblioteca padrão. A equipe do .NET adotou o modelo do OpenTelemetry dentro de `System.Diagnostics`: `Activity` é o span, `ActivitySource` é quem cria spans (o *tracer*), e `Meter` cria instrumentos de métrica. Para logs, o OpenTelemetry não inventou uma API nova: ele faz a ponte com o `ILogger` que você já usa.\n\nPor isso a biblioteca abaixo não referencia pacote nenhum do OpenTelemetry. Quem liga o SDK é a aplicação, no `Program.cs` logo depois dela, o mesmo que o laboratório deste módulo usa, com quatro pacotes: `OpenTelemetry.Extensions.Hosting`, `OpenTelemetry.Exporter.OpenTelemetryProtocol`, `OpenTelemetry.Instrumentation.AspNetCore` e `OpenTelemetry.Instrumentation.Http` (versão 1.20.1 em outubro de 2026).",
                    },
                    {
                        type: "code",
                        value: "// CalculadoraDeFrete.cs: só System.Diagnostics, nenhum pacote do OpenTelemetry\nusing System.Diagnostics;\nusing System.Diagnostics.Metrics;\n\nnamespace Loja.Frete;\n\npublic class CalculadoraDeFrete\n{\n    public const string Nome = \"Loja.Frete\";\n    private static readonly ActivitySource Fonte = new(Nome);\n    private static readonly Meter Medidor = new(Nome);\n    private static readonly Counter<long> Calculos =\n        Medidor.CreateCounter<long>(\"loja.frete.calculos\");\n\n    public decimal Calcular(decimal pesoKg, string modalidade)\n    {\n        // sem SDK ouvindo, StartActivity devolve null: daí o ?. abaixo\n        using var atividade = Fonte.StartActivity(\"CalcularFrete\");\n        atividade?.SetTag(\"loja.frete.modalidade\", modalidade);\n\n        var valor = modalidade == \"expresso\" ? 25m + pesoKg * 4m : 12m + pesoKg * 2m;\n\n        Calculos.Add(1, new KeyValuePair<string, object?>(\"loja.frete.modalidade\", modalidade));\n        return valor;\n    }\n}\n\n// Na aplicação, o SDK passa a ouvir essa fonte e esse medidor pelo nome:\n//   .WithTracing(t => t.AddSource(CalculadoraDeFrete.Nome))\n//   .WithMetrics(m => m.AddMeter(CalculadoraDeFrete.Nome))",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing OpenTelemetry;\nusing OpenTelemetry.Metrics;\nusing OpenTelemetry.Resources;\nusing OpenTelemetry.Trace;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(recurso => recurso.AddService(\"pedidos-api\"))\n    .WithTracing(tracing => tracing\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation())\n    .WithMetrics(metricas => metricas\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation())\n    .WithLogging()\n    .UseOtlpExporter();\n\nvar app = builder.Build();\n\napp.MapGet(\"/pedidos/{id:int}\", (int id, ILogger<Program> logger) =>\n{\n    logger.LogInformation(\"Consultando o pedido {PedidoId}\", id);\n    return TypedResults.Ok(new Pedido(id, \"pago\"));\n});\n\napp.Run();\n\nrecord Pedido(int Id, string Status);",
                    },
                    {
                        type: "text",
                        value: "## O Program.cs, linha a linha\n\n- **`ConfigureResource`** descreve quem emite a telemetria, o *recurso*. O `AddService` grava o `service.name` e gera um `service.instance.id`. Sem ele, o serviço aparece no backend como `unknown_service:PedidosApi`, o nome do processo, e ninguém acha nada.\n- **`WithTracing` e `WithMetrics`** ligam as instrumentações: requisições recebidas pelo ASP.NET Core e chamadas feitas pelo `HttpClient` viram spans e métricas sem código seu.\n- **`WithLogging`** faz a ponte do `ILogger` para o OpenTelemetry. Repare que o handler só usa o `ILogger` comum.\n- **`UseOtlpExporter`** liga o exporter OTLP para os três sinais. Sem configuração, ele manda por gRPC para `http://localhost:4317`; as variáveis de ambiente `OTEL_EXPORTER_OTLP_ENDPOINT` e `OTEL_EXPORTER_OTLP_PROTOCOL` (`grpc` ou `http/protobuf`) mudam isso sem recompilar.\n\nDuas armadilhas desse último método. Ele mora no namespace `OpenTelemetry`: sem o `using OpenTelemetry;`, o código não compila. E ele não convive com o `AddOtlpExporter` de um sinal só: com os dois, o código compila, mas a aplicação cai ao iniciar com `NotSupportedException`.\n\nTrate o SDK como qualquer dependência que fica na borda da aplicação e mantenha-o atualizado: em abril de 2026, a versão 1.15.3 corrigiu uma falha de negação de serviço no propagador de *baggage*, o mecanismo que leva pares de chave e valor de um serviço a outro junto com o trace (CVE-2026-40894).",
                    },
                    {
                        type: "text",
                        value: "## OTLP e o Collector\n\nO **OTLP** é o protocolo comum aos três sinais: mensagens em protobuf, por gRPC na porta 4317 ou por HTTP na 4318, nos caminhos `/v1/traces`, `/v1/metrics` e `/v1/logs`. Tempo, Loki, o painel do Aspire e os serviços gerenciados dos fornecedores recebem OTLP diretamente, e o Prometheus 3 também, com uma flag.\n\nO **Collector** é um serviço separado, escrito em Go, que recebe telemetria (*receivers*), opcionalmente a transforma (*processors*) e a envia (*exporters*), em pipelines separados por sinal. A aplicação poderia mandar direto para o backend; o Collector no meio compra três coisas:\n\n- **Neutralidade na prática.** Trocar de fornecedor, ou mandar para dois ao mesmo tempo durante uma avaliação, é mudar a configuração do Collector, sem deploy das aplicações.\n- **Aplicação leve.** Ela entrega rápido a um endereço próximo e segue a vida; filas e novas tentativas ficam no Collector.\n- **Um ponto central de controle** para amostrar, filtrar e tirar dado sensível antes de a telemetria sair da sua rede.\n\nO Collector existe em distribuições: a *core*, com o básico, e a *contrib*, com centenas de componentes; o Grafana Alloy é a distribuição da Grafana. A configuração em detalhe volta mais adiante no estudo; no laboratório da aula seguinte, ele aparece no mínimo necessário.\n\nO erro que desfaz tudo isso é chamar a biblioteca de um fornecedor dentro do código de negócio. A neutralidade só existe enquanto o código fala com a API do OpenTelemetry e o destino fica na configuração.",
                    },
                    {
                        type: "text",
                        value: "## Semantic conventions: os nomes combinados\n\nSe cada equipe batizasse os atributos do seu jeito (`statusCode`, `http_status`, `status`), nenhum painel pronto funcionaria e nenhuma consulta atravessaria dois serviços. As **semantic conventions** fixam os nomes: `http.request.method`, `http.response.status_code`, `http.route`, `url.path`, `service.name`, `deployment.environment.name`. É por segui-las que o painel do Aspire sabe mostrar método e rota de cada span, e que o histograma `http.server.request.duration` tem o mesmo nome em .NET, Java ou Go. Para o que é do seu negócio não há convenção: use um prefixo próprio (`loja.pedido.canal`) e nunca reaproveite um nome da convenção com outro significado.\n\nAs convenções de HTTP são estáveis desde novembro de 2023 (versão 1.23), e o núcleo das de banco de dados desde maio de 2025 (versão 1.33). Tutoriais mais antigos usam nomes que mudaram:",
                    },
                    {
                        type: "table",
                        value: "[[\"Nome antigo\",\"Nome atual\"],[\"`http.method`\",\"`http.request.method`\"],[\"`http.status_code`\",\"`http.response.status_code`\"],[\"`http.url`\",\"`url.full`\"],[\"`deployment.environment`\",\"`deployment.environment.name`, estável desde abril de 2026\"]]",
                    },
                    {
                        type: "quote",
                        value: "O OpenTelemetry separa quem gera a telemetria (API e instrumentação) de quem a processa e envia (SDK e Collector), com um protocolo comum, o OTLP, e nomes comuns, as semantic conventions. É essa separação que deixa trocar de destino sem tocar no código.",
                    },
                ],
                questions: [
                    {
                        statement: "No .NET, qual tipo faz o papel do span do OpenTelemetry?",
                        difficulty: "facil",
                        options: [
                            { text: "`System.Diagnostics.Metrics.Meter`", isCorrect: false },
                            { text: "`System.Diagnostics.Activity`", isCorrect: true },
                            { text: "`Microsoft.Extensions.Logging.ILogger`", isCorrect: false },
                            { text: "`System.Diagnostics.Stopwatch`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por padrão, em quais portas um receptor OTLP escuta?",
                        difficulty: "facil",
                        options: [
                            { text: "9090 para gRPC e 3000 para HTTP", isCorrect: false },
                            { text: "4317 para os dois, com caminhos diferentes", isCorrect: false },
                            { text: "4317 para gRPC e 4318 para HTTP", isCorrect: true },
                            { text: "4318 para gRPC e 4317 para HTTP", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma equipe mantém uma biblioteca interna de cálculo de frete, usada por vários serviços. Ela quer emitir spans das operações sem obrigar quem usa a biblioteca a adotar OpenTelemetry. Do que a biblioteca deve depender?",
                        difficulty: "medio",
                        options: [
                            { text: "Do SDK do fornecedor de APM, que já traz o exporter embutido", isCorrect: false },
                            { text: "Do SDK do OpenTelemetry, configurado dentro da própria biblioteca", isCorrect: false },
                            { text: "Do exporter OTLP, apontando para o Collector padrão da empresa", isCorrect: false },
                            { text: "Só do `ActivitySource` do .NET; quem usa decide se instala o SDK", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma empresa quer mandar os traces das suas 40 aplicações ao Tempo e, durante 30 dias, também a um fornecedor que está avaliando. Todas mandam OTLP para um Collector. Qual é o caminho com menos trabalho?",
                        difficulty: "medio",
                        options: [
                            { text: "Instalar o SDK do fornecedor nas 40 aplicações e publicar todas de novo", isCorrect: false },
                            { text: "Incluir um exporter do fornecedor no pipeline de traces do Collector", isCorrect: true },
                            { text: "Trocar o protocolo das aplicações para HTTP, que aceita dois destinos", isCorrect: false },
                            { text: "Configurar o Grafana para copiar os traces do Tempo para o fornecedor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um painel antigo filtra spans por `http.status_code = 500` e parou de mostrar erros depois que a aplicação passou a usar o OpenTelemetry atual no .NET 10. Os erros continuam acontecendo. Qual é a causa mais provável?",
                        difficulty: "dificil",
                        options: [
                            { text: "O .NET 10 passou a registrar o status como evento do span, não como atributo", isCorrect: false },
                            { text: "A instrumentação segue a convenção estável, que usa `http.response.status_code`", isCorrect: true },
                            { text: "O Collector descarta atributos cujo nome não consta das convenções estáveis", isCorrect: false },
                            { text: "O OpenTelemetry atual deixou de gravar o código de status em spans de servidor HTTP", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "O laboratório",
                blocks: [
                    {
                        type: "text",
                        value: "# O laboratório\n\nLer sobre spans e séries ajuda pouco até você ver os seus. Esta aula monta dois ambientes para receber a telemetria do `Program.cs` da aula anterior: o **painel do Aspire**, um contêiner só, para começar em um minuto no próprio computador; e a **pilha aberta** completa, com Collector, Prometheus, Tempo, Loki e Grafana, que é como a telemetria costuma circular em produção. As versões estão fixadas como estavam em outubro de 2026, e a regra vale além delas: fixe a versão e atualize de propósito, nunca use `latest`. Quando esta aula foi escrita, a tag `latest` do Tempo ainda apontava para uma imagem de junho, e não para a 3.1.0.\n\n## Caminho 1: o painel do Aspire\n\nO Aspire tem um painel que recebe OTLP e mostra traces, logs estruturados e métricas sem banco nenhum por trás: guarda tudo em memória. Ele vem junto quando você usa o AppHost do Aspire, e também existe como contêiner avulso, que serve para qualquer aplicação que fale OTLP, em qualquer linguagem:",
                    },
                    {
                        type: "code",
                        value: "# terminal: o painel do Aspire num contêiner\ndocker run --rm -d --name aspire-dashboard \\\n  -p 18888:18888 -p 4317:18889 -p 4318:18890 \\\n  mcr.microsoft.com/aspire/dashboard:13.6\n\n# o link de login, com o token, aparece no log do contêiner\ndocker logs aspire-dashboard\n\n# a aplicação da aula anterior (troque o Program.cs gerado pelo da aula)\ndotnet new web -o PedidosApi && cd PedidosApi\ndotnet add package OpenTelemetry.Extensions.Hosting\ndotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol\ndotnet add package OpenTelemetry.Instrumentation.AspNetCore\ndotnet add package OpenTelemetry.Instrumentation.Http\n\n# métricas a cada 5 s em vez de 60 s, só para estudar\nOTEL_METRIC_EXPORT_INTERVAL=5000 dotnet run --urls http://localhost:5080\n\n# em outro terminal: tráfego\nfor i in $(seq 1 30); do curl -s http://localhost:5080/pedidos/$i > /dev/null; done",
                    },
                    {
                        type: "text",
                        value: "Abra o link que o log mostrou e explore. Cada requisição aparece como um trace com o span `GET /pedidos/{id:int}` e os atributos das semantic conventions (`http.route`, `url.path`, `http.response.status_code`); nos logs estruturados, a linha \"Consultando o pedido {PedidoId}\" traz o campo `PedidoId` à parte e o link para o trace; nas métricas, o histograma `http.server.request.duration`.\n\nFunciona sem configurar nada por causa do `-p`: dentro do contêiner, o OTLP escuta na 18889 (gRPC) e na 18890 (HTTP), e o comando as publica no computador como 4317 e 4318, as portas padrão, para onde o exporter do .NET já manda. O OTLP do painel aceita telemetria sem autenticação por padrão, e o próprio log avisa disso; a tela pede o token. Tudo fica em memória: parou o contêiner, perdeu tudo, o que é exatamente o que se quer em desenvolvimento. O caminho atual da imagem é `mcr.microsoft.com/aspire/dashboard`; tutoriais antigos usam `mcr.microsoft.com/dotnet/aspire-dashboard`, que em outubro de 2026 ainda entregava a mesma imagem.\n\n## Caminho 2: a pilha aberta\n\nNuma pasta, quatro arquivos. A aplicação fala só OTLP com o Collector; ele manda traces ao Tempo, métricas ao Prometheus e logs ao Loki, e o Grafana consulta os três:",
                    },
                    {
                        type: "code",
                        value: "# compose.yaml\nservices:\n  collector:\n    image: otel/opentelemetry-collector-contrib:0.163.1\n    volumes:\n      - ./otel-collector.yaml:/etc/otelcol-contrib/config.yaml:ro\n    ports:\n      - \"4317:4317\" # OTLP por gRPC\n      - \"4318:4318\" # OTLP por HTTP\n    depends_on: [prometheus, tempo, loki]\n\n  prometheus:\n    image: prom/prometheus:v3.13.4\n    command:\n      - --config.file=/etc/prometheus/prometheus.yml\n      - --storage.tsdb.path=/prometheus\n      - --web.enable-otlp-receiver\n    volumes:\n      - prometheus-dados:/prometheus\n    ports:\n      - \"9090:9090\"\n\n  tempo:\n    image: grafana/tempo:3.1.0\n    command: [\"-config.file=/etc/tempo.yaml\"]\n    volumes:\n      - ./tempo.yaml:/etc/tempo.yaml:ro\n      - tempo-dados:/var/tempo\n\n  loki:\n    image: grafana/loki:3.7.8\n    volumes:\n      - loki-dados:/loki\n\n  grafana:\n    image: grafana/grafana:13.2.4\n    volumes:\n      - ./grafana-datasources.yaml:/etc/grafana/provisioning/datasources/datasources.yaml:ro\n    ports:\n      - \"3000:3000\"\n    depends_on: [prometheus, tempo, loki]\n\nvolumes:\n  prometheus-dados:\n  tempo-dados:\n  loki-dados:",
                    },
                    {
                        type: "text",
                        value: "O que vale notar no compose:\n\n- **Só o necessário fica exposto.** Collector (4317 e 4318), Prometheus (9090) e Grafana (3000) publicam portas; Tempo e Loki só existem na rede interna do compose, onde Collector e Grafana os acham pelo nome do serviço.\n- **O Prometheus recebe OTLP por uma flag.** O receptor OTLP do Prometheus 3 vem desligado, porque não tem autenticação própria; `--web.enable-otlp-receiver` liga o caminho `/api/v1/otlp/v1/metrics`. E trocar o `command` substitui todos os argumentos padrão da imagem, por isso `--config.file` e `--storage.tsdb.path` aparecem de novo.\n- **O Prometheus está na linha LTS.** A 3.13 tem suporte até julho de 2027; a 3.15 é a mais nova da linha regular.\n- **O Loki usa a configuração que vem na imagem**, que já aceita OTLP.\n\nA configuração do Collector fica no mínimo necessário: um receiver OTLP nas duas portas, um exporter por destino e um pipeline por sinal. O nome depois da barra, como em `otlp_http/loki`, só diferencia dois exporters do mesmo tipo. Em seguida, o Tempo com armazenamento em disco local, dentro do volume, e as fontes de dados que fazem o Grafana já nascer ligado aos três:",
                    },
                    {
                        type: "code",
                        value: "# otel-collector.yaml\nreceivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317\n      http:\n        endpoint: 0.0.0.0:4318\n\nexporters:\n  otlp_grpc/tempo:\n    endpoint: tempo:4317\n    tls:\n      insecure: true\n  otlp_http/prometheus:\n    endpoint: http://prometheus:9090/api/v1/otlp\n  otlp_http/loki:\n    endpoint: http://loki:3100/otlp\n  debug: # uma linha no log do Collector por lote recebido\n\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      exporters: [otlp_grpc/tempo, debug]\n    metrics:\n      receivers: [otlp]\n      exporters: [otlp_http/prometheus, debug]\n    logs:\n      receivers: [otlp]\n      exporters: [otlp_http/loki, debug]",
                    },
                    {
                        type: "code",
                        value: "# tempo.yaml\nstream_over_http_enabled: true\nserver:\n  http_listen_port: 3200\ndistributor:\n  receivers:\n    otlp:\n      protocols:\n        grpc:\n          endpoint: 0.0.0.0:4317\nstorage:\n  trace:\n    backend: local\n    wal:\n      path: /var/tempo/wal\n    local:\n      path: /var/tempo/blocks\n\n# grafana-datasources.yaml\napiVersion: 1\ndatasources:\n  - name: Prometheus\n    type: prometheus\n    uid: prometheus\n    url: http://prometheus:9090\n    isDefault: true\n  - name: Tempo\n    type: tempo\n    uid: tempo\n    url: http://tempo:3200\n  - name: Loki\n    type: loki\n    uid: loki\n    url: http://loki:3100",
                    },
                    {
                        type: "table",
                        value: "[[\"Componente\",\"Imagem (outubro de 2026)\",\"Porta no computador\",\"Papel\"],[\"Collector\",\"`otel/opentelemetry-collector-contrib:0.163.1`\",\"4317 e 4318\",\"Recebe OTLP da aplicação e distribui por sinal\"],[\"Prometheus\",\"`prom/prometheus:v3.13.4`\",\"9090\",\"Guarda as métricas; recebe OTLP em `/api/v1/otlp`\"],[\"Tempo\",\"`grafana/tempo:3.1.0`\",\"Nenhuma\",\"Guarda os traces\"],[\"Loki\",\"`grafana/loki:3.7.8`\",\"Nenhuma\",\"Guarda os logs\"],[\"Grafana\",\"`grafana/grafana:13.2.4`\",\"3000\",\"Consulta os três e monta painéis\"],[\"Painel do Aspire\",\"`mcr.microsoft.com/aspire/dashboard:13.6`\",\"18888, 4317 e 4318\",\"Alternativa de um contêiner só, em memória\"]]",
                    },
                    {
                        type: "text",
                        value: "## Subir e conferir\n\nPare o painel do Aspire antes (`docker stop aspire-dashboard`), porque os dois querem a porta 4317. Na pasta, `docker compose up -d`, e `docker compose ps` deve mostrar os cinco no ar. Rode a aplicação e gere tráfego como no caminho 1. No Grafana, em `http://localhost:3000`, entre com `admin` e senha `admin` (ele pede uma senha nova no primeiro acesso) e abra o **Explore**:\n\n- **Prometheus:** `http_server_request_duration_seconds_count{job=\"pedidos-api\"}`. O `service.name` virou o rótulo `job`, e o nome da métrica ganhou unidade e sufixo na tradução para o padrão do Prometheus.\n- **Tempo:** busque pelo serviço `pedidos-api`.\n- **Loki:** `{service_name=\"pedidos-api\"}`. Cada linha traz `trace_id` e `span_id`.\n\nSe nada aparecer, não espere ajuda da aplicação: quando o envio falha, ela segue respondendo normalmente e a telemetria se perde em silêncio. Olhe primeiro `docker compose logs collector`: o exporter `debug` escreve uma linha por lote recebido, como `Traces ... \"spans\": 30`. Sem essa linha, o problema está entre a aplicação e o Collector; com ela, entre o Collector e o destino. E conte com dois atrasos normais: o SDK exporta métricas a cada 60 s por padrão, e a busca do Tempo 3 ignora os últimos 30 s.\n\nOs tropeços mais comuns, todos reproduzidos na preparação desta aula:\n\n- **Receiver sem `endpoint`.** Desde a versão 0.104 do Collector, de julho de 2024, o receiver OTLP escuta só em `localhost` quando o endereço não é dito. Dentro do contêiner, nada de fora chega: a porta publicada aceita a conexão, que logo cai. Daí o `0.0.0.0` explícito, no Collector e no Tempo.\n- **Nomes antigos dos exporters.** Até a versão 0.144, de janeiro de 2026, eles se chamavam `otlp` e `otlphttp`; hoje são `otlp_grpc` e `otlp_http`. Os nomes antigos ainda funcionam, com um aviso de obsoleto no log, e são os que a maioria dos tutoriais mostra.\n- **Prometheus sem a flag.** O Collector registra 404, e o Prometheus explica: `otlp write receiver needs to be enabled with --web.enable-otlp-receiver`.\n- **`down -v` apaga os dados.** `docker compose down` remove os contêineres e mantém os volumes; com `-v`, você começa do zero.",
                    },
                    {
                        type: "quote",
                        value: "O painel do Aspire é o caminho de um minuto: um contêiner, OTLP na 4317 e tudo em memória. A pilha aberta é a produção em miniatura: a aplicação fala só OTLP com o Collector, que distribui métricas ao Prometheus, traces ao Tempo e logs ao Loki, com o Grafana lendo os três.",
                    },
                ],
                questions: [
                    {
                        statement: "O painel do Aspire foi iniciado com `-p 18888:18888 -p 4317:18889`. Para onde a aplicação manda OTLP por gRPC, sem configuração extra, e onde se abre a tela?",
                        difficulty: "facil",
                        options: [
                            { text: "OTLP em `localhost:4318` e a tela em `localhost:3000`", isCorrect: false },
                            { text: "OTLP em `localhost:4317` e a tela em `localhost:18888`", isCorrect: true },
                            { text: "OTLP em `localhost:18889` e a tela em `localhost:4317`", isCorrect: false },
                            { text: "OTLP em `localhost:18888` e a tela em `localhost:18889`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na pilha aberta do laboratório, qual serviço recebe a telemetria que sai da aplicação?",
                        difficulty: "facil",
                        options: [
                            { text: "O Collector, que manda cada sinal ao destino certo", isCorrect: true },
                            { text: "O Tempo, que é o único que entende o protocolo OTLP", isCorrect: false },
                            { text: "O Prometheus, que repassa traces e logs aos outros", isCorrect: false },
                            { text: "O Grafana, que guarda os três sinais e os mostra", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um aluno escreveu a configuração do Collector com o receiver `receivers.otlp.protocols.grpc` declarado sem `endpoint`, e publicou `-p 4317:4317`. A aplicação, rodando no computador, não consegue entregar nada, e a conexão cai logo depois de aberta. Qual é a causa?",
                        difficulty: "medio",
                        options: [
                            { text: "O receiver só aceita conexões de fora do contêiner quando há TLS configurado", isCorrect: false },
                            { text: "O gRPC só funciona entre contêineres da mesma rede do compose", isCorrect: false },
                            { text: "Sem `endpoint`, o receiver escuta na 55680, a porta antiga do OTLP", isCorrect: false },
                            { text: "Sem `endpoint`, o receiver escuta só em localhost dentro do contêiner", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O log do Collector mostra `\"otlphttp\" alias is deprecated; use \"otlp_http\" instead`. O que isso significa?",
                        difficulty: "medio",
                        options: [
                            { text: "O destino recusou OTLP por HTTP, e o Collector passou a usar gRPC", isCorrect: false },
                            { text: "A configuração foi recusada, e o Collector subiu com a configuração padrão", isCorrect: false },
                            { text: "O nome antigo ainda funciona, mas o nome atual do exporter é `otlp_http`", isCorrect: true },
                            { text: "O exporter HTTP foi removido, e os dados desse pipeline se perdem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para simplificar, alguém tirou o `command` do serviço do Prometheus no compose. Ele subiu normalmente com a configuração da imagem, mas as métricas pararam de chegar, e o Collector registra 404 em `/api/v1/otlp/v1/metrics`. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "O Prometheus 3 só aceita OTLP por gRPC, e o exporter usado fala HTTP", isCorrect: false },
                            { text: "O receptor OTLP do Prometheus vem desligado e só liga com a flag que saiu", isCorrect: true },
                            { text: "A configuração padrão da imagem não declara o Collector como alvo de coleta", isCorrect: false },
                            { text: "Sem `command`, o caminho do OTLP muda para `/otlp/v1/metrics` no Prometheus", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Logs que ajudam",
        aulas: [
            {
                titulo: "Log estruturado",
                blocks: [
                    {
                        type: "text",
                        value: "# Log estruturado\n\nSão três da manhã e o suporte avisa: o pedido 8812 foi cobrado duas vezes. Você abre a ferramenta de logs e procura por \"8812\". Vêm milhares de linhas: o pedido 8812, o cliente 8812, uma chamada que levou 8812 ms, a linha 8812 de um arquivo importado. E a linha que interessa talvez nem esteja ali, porque alguém escreveu \"pedido nº 8.812\". A ferramenta não é o problema: o log foi escrito como frase, e frase só se busca por texto.\n\n**Log estruturado** é o log em que cada evento sai como um registro com **campos nomeados** (`PedidoId = 8812`, `ClienteId = 31`) ao lado do texto para humanos. A pergunta deixa de ser \"quais linhas contêm 8812\" e passa a ser \"quais eventos têm `PedidoId` igual a 8812\", em todos os serviços, sem depender de como cada pessoa redigiu a frase.\n\n## Message template\n\nNo .NET, o caminho é o `ILogger` com **message template**: um texto fixo com nomes entre chaves, seguido dos valores. O provedor de log recebe três coisas separadas (o template, os nomes e os valores) e com elas monta a frase para quem lê e guarda cada valor como campo para quem busca. No exemplo, o mesmo evento é registrado duas vezes, com template e com interpolação de string, e o console usa o formatador JSON para mostrar o que o provedor recebeu.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (console com host; numa API, o builder é o WebApplication.CreateBuilder)\nusing Loja.Pedidos;\nusing Microsoft.Extensions.DependencyInjection;\nusing Microsoft.Extensions.Hosting;\nusing Microsoft.Extensions.Logging;\n\nvar builder = Host.CreateApplicationBuilder(args);\nbuilder.Logging.AddJsonConsole(o => o.JsonWriterOptions = new() { Indented = true });\nbuilder.Services.AddSingleton<PedidoService>();\n\nusing var host = builder.Build();\nvar pedidos = host.Services.GetRequiredService<PedidoService>();\npedidos.Criar(pedidoId: 8812, clienteId: 31, total: 199.90m);\n\n// PedidoService.cs\nusing Microsoft.Extensions.Logging;\n\nnamespace Loja.Pedidos;\n\npublic sealed class PedidoService(ILogger<PedidoService> logger)\n{\n    public void Criar(int pedidoId, int clienteId, decimal total)\n    {\n        // message template: cada {Nome} vira um campo com o valor do argumento\n        logger.LogInformation(\"Pedido {PedidoId} criado para o cliente {ClienteId}, total {Total}\",\n            pedidoId, clienteId, total);\n\n        // interpolação: o texto fica parecido, mas os campos somem\n        logger.LogInformation($\"Pedido {pedidoId} criado para o cliente {clienteId}, total {total}\");\n    }\n}",
                    },
                    {
                        type: "code",
                        value: "# saída no console (formatador JSON, indentado aqui para leitura; em produção sai uma linha por evento)\n{\n  \"EventId\": 0,\n  \"LogLevel\": \"Information\",\n  \"Category\": \"Loja.Pedidos.PedidoService\",\n  \"Message\": \"Pedido 8812 criado para o cliente 31, total 199.90\",\n  \"State\": {\n    \"PedidoId\": 8812,\n    \"ClienteId\": 31,\n    \"Total\": 199.90,\n    \"{OriginalFormat}\": \"Pedido {PedidoId} criado para o cliente {ClienteId}, total {Total}\"\n  }\n}\n{\n  \"EventId\": 0,\n  \"LogLevel\": \"Information\",\n  \"Category\": \"Loja.Pedidos.PedidoService\",\n  \"Message\": \"Pedido 8812 criado para o cliente 31, total 199,90\",\n  \"State\": {\n    \"{OriginalFormat}\": \"Pedido 8812 criado para o cliente 31, total 199,90\"\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## O que a interpolação tira\n\nNa tela as duas mensagens quase não se distinguem. A diferença está no `State`, que é o que o provedor recebeu:\n\n- Com template, `PedidoId`, `ClienteId` e `Total` chegam como **campos**, com o tipo preservado (número continua número), e o `{OriginalFormat}` guarda o template, igual para todo pedido. Dá para buscar `PedidoId = 8812` e também contar quantas vezes o evento \"pedido criado\" aconteceu, porque o template não muda de um pedido para outro.\n- Com interpolação, a string fica pronta **antes** de chegar ao `ILogger`. O provedor recebe só um texto, diferente a cada pedido: nenhum campo, nenhum template em comum, nada para agrupar.\n- Repare no total: o template formatou `199.90` (cultura invariante) e a interpolação formatou `199,90`, pela cultura da máquina. O mesmo código gera texto diferente conforme o servidor em que roda.\n\nMuita gente escreve `logger.LogInformation($\"Pedido {id} criado\")` porque a frase sai igual e o código fica mais curto. O defeito só aparece no dia do incidente, quando alguém precisa filtrar pelo pedido e o campo não existe. O analisador CA2254 aponta essa chamada, mas só como sugestão no editor: o build passa limpo. E a interpolação ainda tem um custo a mais, porque a string é montada mesmo quando o nível do log está desligado.",
                    },
                    {
                        type: "table",
                        value: "[[\"Forma\", \"Como fica no código\", \"O que chega ao provedor\", \"Busca pelo pedido\"], [\"Message template\", \"`LogInformation(\\\"Pedido {PedidoId} criado\\\", id)`\", \"template, nome e valor separados\", \"campo PedidoId igual a 8812\"], [\"Interpolação\", \"`LogInformation($\\\"Pedido {id} criado\\\")`\", \"só o texto já montado\", \"texto 8812 em qualquer parte da linha\"], [\"Concatenação\", \"`LogInformation(\\\"Pedido \\\" + id + \\\" criado\\\")`\", \"só o texto já montado\", \"texto 8812 em qualquer parte da linha\"], [\"Template com nome genérico\", \"`LogInformation(\\\"Pedido {Id} criado\\\", id)`\", \"campo Id, que em outro evento é o id do cliente\", \"campo ambíguo entre eventos\"]]",
                    },
                    {
                        type: "text",
                        value: "## Nomes de campo\n\nO nome entre chaves vira o nome do campo, então trate-o como parte do contrato do serviço:\n\n- **Específico e em PascalCase**: `PedidoId`, `ClienteId`, `DuracaoMs`. Um `{Id}` genérico é pedido num evento e cliente no outro, e a busca por `Id = 31` mistura os dois.\n- **O mesmo nome em todo serviço**: se o checkout grava `PedidoId` e o faturamento grava `IdPedido`, ninguém acha a história inteira do pedido com um filtro só.\n- **Template constante**: o texto não muda entre chamadas; o que muda vai nos valores.\n\n## Os nomes ligam por posição\n\nO nome entre chaves é um rótulo para o argumento **na mesma posição**. As extensões `LogInformation`, `LogWarning` e companhia não olham o nome das suas variáveis: o primeiro valor vai para o primeiro nome, o segundo para o segundo. Troque a ordem e o log mente com toda a confiança:",
                    },
                    {
                        type: "code",
                        value: "// pedidoId = 8812 e clienteId = 31, passados na ordem errada\nlogger.LogInformation(\"Pedido {PedidoId} do cliente {ClienteId}\", clienteId, pedidoId);\n\n# saída\n{\n  \"EventId\": 0,\n  \"LogLevel\": \"Information\",\n  \"Category\": \"Loja.Pedidos.PedidoService\",\n  \"Message\": \"Pedido 31 do cliente 8812\",\n  \"State\": {\n    \"PedidoId\": 31,\n    \"ClienteId\": 8812,\n    \"{OriginalFormat}\": \"Pedido {PedidoId} do cliente {ClienteId}\"\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "A contagem também importa. Em tempo de execução, argumento sobrando é descartado em silêncio. Argumento faltando é pior: na hora de formatar a mensagem, o `ILogger` lança `AggregateException` com um `FormatException` dentro, e a linha que devia só registrar derruba a operação. O compilador ajuda: o analisador **CA2017** vem ligado como aviso no SDK e aponta, no build, chamada com número de argumentos diferente do número de nomes no template. Trate esse aviso como erro.\n\n## Exceção vai no primeiro argumento\n\nNum `catch`, o reflexo de pôr `ex.Message` no template joga fora o tipo da exceção e a pilha, que é justamente o que mostra onde quebrou. As extensões do `ILogger` recebem a exceção como **primeiro argumento**, separada do template:",
                    },
                    {
                        type: "code",
                        value: "// CobrancaService.cs, dentro do catch (TimeoutException ex)\n// perde o tipo e a pilha: só sobra o texto da mensagem\nlogger.LogError(\"Falha ao cobrar o pedido {PedidoId}: {Erro}\", pedidoId, ex.Message);\n\n// a exceção vai no primeiro argumento, separada do template\nlogger.LogError(ex, \"Falha ao cobrar o pedido {PedidoId}\", pedidoId);\n\n# saída\n{\n  \"EventId\": 0,\n  \"LogLevel\": \"Error\",\n  \"Category\": \"Loja.Pedidos.CobrancaService\",\n  \"Message\": \"Falha ao cobrar o pedido 8812: Gateway de pagamento sem resposta em 5 s\",\n  \"State\": {\n    \"PedidoId\": 8812,\n    \"Erro\": \"Gateway de pagamento sem resposta em 5 s\",\n    \"{OriginalFormat}\": \"Falha ao cobrar o pedido {PedidoId}: {Erro}\"\n  }\n}\n{\n  \"EventId\": 0,\n  \"LogLevel\": \"Error\",\n  \"Category\": \"Loja.Pedidos.CobrancaService\",\n  \"Message\": \"Falha ao cobrar o pedido 8812\",\n  \"Exception\": \"System.TimeoutException: Gateway de pagamento sem resposta em 5 s\\n   at Loja.Pedidos.CobrancaService.ChamarGateway(Int32 pedidoId) in /src/CobrancaService.cs:line 26\\n   at Loja.Pedidos.CobrancaService.Cobrar(Int32 pedidoId) in /src/CobrancaService.cs:line 11\",\n  \"State\": {\n    \"PedidoId\": 8812,\n    \"{OriginalFormat}\": \"Falha ao cobrar o pedido {PedidoId}\"\n  }\n}",
                    },
                    {
                        type: "quote",
                        value: "Log estruturado é template constante, com nomes específicos entre chaves e valores na ordem certa: o provedor guarda cada valor como campo, e a busca deixa de depender da frase. Interpolação e concatenação entregam só texto, e a exceção vai inteira no primeiro argumento, nunca resumida em `ex.Message`.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual chamada grava o número do pedido como um campo pesquisável, separado do texto da mensagem?",
                        difficulty: "facil",
                        options: [
                            { text: "`logger.LogInformation(string.Format(\"Pedido {0} criado\", pedido.Id));`", isCorrect: false },
                            { text: "`logger.LogInformation(\"Pedido \" + pedido.Id + \" criado\");`", isCorrect: false },
                            { text: "`logger.LogInformation($\"Pedido {pedido.Id} criado\");`", isCorrect: false },
                            { text: "`logger.LogInformation(\"Pedido {PedidoId} criado\", pedido.Id);`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No formatador JSON do console, o que aparece em `State` para um log escrito com interpolação, como `logger.LogInformation($\"Pedido {id} criado\")`?",
                        difficulty: "facil",
                        options: [
                            { text: "Só o `{OriginalFormat}`, com o texto montado e o número dentro dele", isCorrect: true },
                            { text: "Campos com nomes gerados, como `arg0`, um para cada valor interpolado", isCorrect: false },
                            { text: "Nenhum `State`, porque o formatador JSON descarta texto interpolado", isCorrect: false },
                            { text: "Um campo `id` com o valor, que o compilador extrai da interpolação", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `pedidoId = 8812` e `clienteId = 31`, que valor fica no campo `PedidoId` desta chamada?\n\n```csharp\nlogger.LogInformation(\"Pedido {PedidoId} do cliente {ClienteId}\", clienteId, pedidoId);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "31, porque o primeiro valor vai para o primeiro nome do template", isCorrect: true },
                            { text: "8812, porque o provedor reordena os valores pelos nomes do template", isCorrect: false },
                            { text: "Nenhum, porque a chamada lança exceção com os nomes fora de ordem", isCorrect: false },
                            { text: "8812, porque o nome do placeholder é ligado ao nome da variável", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num `catch (TimeoutException ex)`, qual chamada preserva o tipo da exceção e a pilha no log e ainda grava `PedidoId` como campo?",
                        difficulty: "medio",
                        options: [
                            { text: "`logger.LogError($\"Falha ao cobrar o pedido {id}: {ex}\");`", isCorrect: false },
                            { text: "`logger.LogError(ex, \"Falha ao cobrar o pedido {PedidoId}\", id);`", isCorrect: true },
                            { text: "`logger.LogError(\"Falha ao cobrar o pedido {PedidoId}: {Erro}\", id, ex.Message);`", isCorrect: false },
                            { text: "`logger.LogError(\"Falha ao cobrar o pedido {PedidoId}\", id, ex);`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com o provedor de console ligado, o que acontece com esta chamada, que tem dois nomes no template e um valor só?\n\n```csharp\nlogger.LogWarning(\"Estorno do pedido {PedidoId} de {Valor} recusado\", pedidoId);\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "O build não avisa nada, e o campo Valor sai vazio na mensagem gravada", isCorrect: false },
                            { text: "O build avisa (CA2017), e a chamada lança exceção ao formatar a mensagem", isCorrect: true },
                            { text: "O build não avisa nada, e a mensagem sai com o texto {Valor} literal", isCorrect: false },
                            { text: "O build falha com erro de compilação, porque o template pede dois valores", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Níveis, categorias e filtros",
                blocks: [
                    {
                        type: "text",
                        value: "# Níveis, categorias e filtros\n\nUm incidente difícil, e alguém decide ligar o Debug de tudo em produção \"para entender\". Em minutos o volume de log sobe dez vezes, o coletor começa a descartar, a conta de ingestão dispara e as linhas que interessavam se perdem no meio do resto. Na semana seguinte acontece o contrário: o componente suspeito tinha logs de Debug úteis, mas ligar o nível exigia um deploy no meio da madrugada.\n\nNíveis e filtros existem para escolher **o que** é escrito e **de qual parte** do sistema, sem mexer no código. Três peças trabalham juntas: o **nível** de cada chamada, a **categoria** do logger e as **regras de filtro** da configuração.\n\n## Os níveis\n\n`LogLevel` vai de `Trace` (0) a `Critical` (5), e `None` (6) serve só em filtro, para desligar. Um log passa quando o nível dele é **igual ou maior** que o mínimo configurado: com mínimo Information, passam Information, Warning, Error e Critical.",
                    },
                    {
                        type: "table",
                        value: "[[\"Nível\", \"Quando usar\", \"Exemplo\"], [\"Trace (0)\", \"passo a passo interno, desligado em produção\", \"Entrando no cálculo de frete com 3 itens\"], [\"Debug (1)\", \"diagnóstico detalhado de um componente\", \"Adquirente respondeu com o código 51\"], [\"Information (2)\", \"o fluxo normal que vale registrar\", \"Pagamento do pedido 8812 autorizado\"], [\"Warning (3)\", \"anormal, mas a operação seguiu\", \"Adquirente respondeu em 2300 ms\"], [\"Error (4)\", \"a operação atual falhou\", \"Falha ao cobrar o pedido 8812\"], [\"Critical (5)\", \"o serviço não consegue atender ninguém\", \"Sem conexão com o banco de dados\"], [\"None (6)\", \"só em filtro, para desligar uma categoria\", \"nunca usado numa chamada de log\"]]",
                    },
                    {
                        type: "text",
                        value: "## Categoria\n\nTodo logger tem uma **categoria**. Com `ILogger<T>`, ela é o nome completo do tipo: `ILogger<GatewayCartao>` no namespace `Loja.Pagamentos` vira `Loja.Pagamentos.GatewayCartao`. Com `ILoggerFactory.CreateLogger(\"Loja.Pagamentos\")`, você escolhe o texto. A categoria segue o namespace de propósito: as regras de filtro casam por **prefixo**, e uma regra para `Loja.Pagamentos` vale para tudo o que começa assim. O próprio .NET segue a convenção: `Microsoft.AspNetCore` para o servidor web, `Microsoft.EntityFrameworkCore.Database.Command` para o SQL que o EF Core executa, `System.Net.Http.HttpClient` para as chamadas HTTP de saída.\n\n## Filtro por configuração\n\nAs regras ficam na seção `Logging` do `appsettings.json`. `Default` vale para quem não casou com nenhum prefixo; cada outra chave é um prefixo de categoria. Aqui o time quer o Debug de pagamentos e o resto em Information:",
                    },
                    {
                        type: "code",
                        value: "# appsettings.json\n{\n  \"Logging\": {\n    \"LogLevel\": {\n      \"Default\": \"Information\",\n      \"Microsoft.AspNetCore\": \"Warning\",\n      \"Loja.Pagamentos\": \"Debug\"\n    }\n  }\n}\n\n# saída (formatador simples do console): Debug só de Loja.Pagamentos\ndbug: Loja.Pagamentos.GatewayCartao[0]\n      Enviando autorização do pedido 8812 ao adquirente\ninfo: Loja.Pagamentos.GatewayCartao[0]\n      Pagamento do pedido 8812 autorizado\nwarn: Loja.Pagamentos.GatewayCartao[0]\n      Adquirente respondeu em 2300 ms para o pedido 8812\ninfo: Loja.Estoque.ReservaService[0]\n      Estoque reservado para o pedido 8812",
                    },
                    {
                        type: "text",
                        value: "## Como a regra é escolhida\n\nPara cada provedor (console, OpenTelemetry e outros), o .NET escolhe **uma** regra por categoria:\n\n1. Ficam as regras daquele provedor, escritas numa seção com o nome dele dentro de `Logging` (`Console`, `OpenTelemetry`). Se o provedor não tem seção própria, ficam as regras gerais.\n2. Entre elas, vence a de **prefixo mais longo** que casa com a categoria; se nenhuma casa, vale `Default`.\n3. Sem configuração nenhuma, o mínimo é Information.\n\nO passo 1 pega muita gente: ao criar uma seção para um provedor, as regras gerais **deixam de valer para ele**, inclusive as de categoria. No exemplo, o Debug de pagamentos continuou no console, mas o exportador do OpenTelemetry recebeu só o Warning:",
                    },
                    {
                        type: "code",
                        value: "# appsettings.Otel.json (somado ao appsettings.json acima)\n{\n  \"Logging\": {\n    \"OpenTelemetry\": {\n      \"LogLevel\": {\n        \"Default\": \"Warning\"\n      }\n    }\n  }\n}\n\n// Program.cs: o provedor do OpenTelemetry, com o exportador que escreve no console\nbuilder.Logging.AddOpenTelemetry(o => o.AddConsoleExporter());\n\n# console: regras gerais, Loja.Pagamentos em Debug\ndbug: Loja.Pagamentos.GatewayCartao[0]\n      Enviando autorização do pedido 8812 ao adquirente\ninfo: Loja.Pagamentos.GatewayCartao[0]\n      Pagamento do pedido 8812 autorizado\nwarn: Loja.Pagamentos.GatewayCartao[0]\n      Adquirente respondeu em 2300 ms para o pedido 8812\ninfo: Loja.Estoque.ReservaService[0]\n      Estoque reservado para o pedido 8812\n\n# exportador do OpenTelemetry: seção própria, Default em Warning\nLogRecord.CategoryName:            Loja.Pagamentos.GatewayCartao\nLogRecord.SeverityText:            Warning\nLogRecord.Body:                    Adquirente respondeu em {DuracaoMs} ms para o pedido {PedidoId}",
                    },
                    {
                        type: "text",
                        value: "## Mudar o nível sem deploy\n\nO host carrega o `appsettings.json` com recarga ligada: quando o arquivo muda, o filtro novo vale na hora. No teste, o app registrava uma reserva por segundo com `Loja.Estoque` em Information; ao acrescentar `\"Loja.Estoque\": \"Debug\"` no arquivo com o processo rodando, as linhas de Debug apareceram a partir da quinta reserva, sem reiniciar. Em contêiner o arquivo vem da imagem, então essa recarga depende de montar a configuração de fora (um volume, um ConfigMap do Kubernetes) ou de um provedor de configuração que recarregue.\n\nVariável de ambiente também sobrescreve o arquivo, com `__` no lugar dos dois-pontos: `Logging__LogLevel__Default=Warning`, ou `Logging__LogLevel__Loja.Pagamentos=Debug` para uma categoria. Ela é lida na partida, então vale a partir do próximo restart. Regra no código (`builder.Logging.AddFilter(\"Loja.Pagamentos\", LogLevel.Debug)`) também funciona, mas mudar exige deploy.\n\n## O custo de Debug em produção\n\nO primeiro custo é **volume**. Um serviço com 2.000 requisições por segundo que escreve 3 linhas de Information por requisição gera 6.000 linhas por segundo, cerca de 200 GB por dia com linhas de 400 bytes. Com Debug ligado, cada requisição passa a escrever 15 linhas: 30.000 por segundo, perto de 1 TB por dia, pago na ingestão, no armazenamento e em cada consulta.\n\nO segundo custo aparece **mesmo com Debug desligado**: em C#, os argumentos são calculados antes da chamada, e o `ILogger` só descobre que o nível está desligado depois que o trabalho já foi feito.",
                    },
                    {
                        type: "code",
                        value: "// CarrinhoService.cs (cada método chamado 10.000 vezes, com Debug desligado para a categoria)\nusing System.Text.Json;\nusing Microsoft.Extensions.Logging;\n\nnamespace Loja.Estoque;\n\npublic sealed record Item(int ProdutoId, int Quantidade);\npublic sealed record Carrinho(List<Item> Itens);\n\npublic sealed class CarrinhoService(ILogger<CarrinhoService> logger)\n{\n    public int Serializacoes { get; private set; }\n\n    public void Fechar(Carrinho carrinho)\n    {\n        // o argumento é calculado antes da chamada, com Debug ligado ou não\n        logger.LogDebug(\"Carrinho fechado: {Carrinho}\", Serializar(carrinho));\n    }\n\n    public void FecharComGuarda(Carrinho carrinho)\n    {\n        // só paga a serialização quando alguém vai ler\n        if (logger.IsEnabled(LogLevel.Debug))\n            logger.LogDebug(\"Carrinho fechado: {Carrinho}\", Serializar(carrinho));\n    }\n\n    private string Serializar(Carrinho carrinho)\n    {\n        Serializacoes++;\n        return JsonSerializer.Serialize(carrinho);\n    }\n}\n\n# saída\nDebug ligado: False\nSerializações em Fechar (sem guarda): 10000\nSerializações em FecharComGuarda: 0",
                    },
                    {
                        type: "text",
                        value: "Dez mil serializações de um carrinho de 50 itens, para nada. A guarda `if (logger.IsEnabled(LogLevel.Debug))` resolve quando o argumento é caro, e no .NET 10 o analisador CA1873 aponta esse tipo de argumento como sugestão no editor. Há ainda um custo menor e constante: as extensões `LogDebug`, `LogInformation` e companhia recebem os valores num `params object[]`, então cada chamada aloca o array e faz boxing dos números, mesmo com o nível desligado. O `[LoggerMessage]`, no fim deste módulo, elimina esse custo constante; o argumento caro continua pedindo a guarda, porque ele é calculado antes de qualquer método ser chamado.\n\nO terceiro custo é uma bomba-relógio: um `LogDebug` com argumento faltando no template passa meses calado, porque a mensagem nunca é formatada com o nível desligado, e começa a lançar exceção no dia em que alguém liga o Debug para investigar um incidente.\n\nA política que funciona: Information como padrão, Warning para as categorias barulhentas do framework, e Debug só na categoria sob investigação, por tempo limitado, desligando depois.",
                    },
                    {
                        type: "quote",
                        value: "Nível diz a gravidade, categoria diz de onde veio, e a regra de prefixo mais longo, escolhida por provedor, decide o que passa. Debug em produção custa volume, CPU para montar argumentos que ninguém lê e até exceção escondida: ligue por categoria, pela configuração e por pouco tempo.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma cobrança falhou por tempo esgotado no gateway, a API devolveu erro para esse cliente e segue atendendo os outros normalmente. Qual nível descreve esse log?",
                        difficulty: "facil",
                        options: [
                            { text: "Critical, porque houve falha numa dependência externa do serviço", isCorrect: false },
                            { text: "Information, porque o erro já foi devolvido ao cliente na resposta", isCorrect: false },
                            { text: "Error, porque a operação atual falhou e o serviço segue atendendo", isCorrect: true },
                            { text: "Warning, porque o cliente pode tentar de novo e a cobrança passar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A classe `GatewayCartao` fica no namespace `Loja.Pagamentos` e recebe um `ILogger<GatewayCartao>`. Qual a categoria dos logs que ela escreve?",
                        difficulty: "facil",
                        options: [
                            { text: "`GatewayCartao`", isCorrect: false },
                            { text: "`Microsoft.Extensions.Logging.ILogger`", isCorrect: false },
                            { text: "`Loja.Pagamentos.GatewayCartao.Autorizar`", isCorrect: false },
                            { text: "`Loja.Pagamentos.GatewayCartao`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com esta configuração, qual destes logs é escrito?\n\n```json\n\"LogLevel\": {\n  \"Default\": \"Warning\",\n  \"Loja\": \"Information\",\n  \"Loja.Pagamentos\": \"Debug\"\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Trace da categoria `Loja.Pagamentos.GatewayCartao`", isCorrect: false },
                            { text: "Debug da categoria `Loja.Pagamentos.GatewayCartao`", isCorrect: true },
                            { text: "Debug da categoria `Loja.Estoque.ReservaService`", isCorrect: false },
                            { text: "Information da categoria `Microsoft.AspNetCore.Routing`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em produção, com Debug desligado para a categoria, este trecho roda 10.000 vezes. Quantas vezes o carrinho é serializado?\n\n```csharp\nlogger.LogDebug(\"Carrinho fechado: {Carrinho}\", JsonSerializer.Serialize(carrinho));\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Uma só, porque o logger guarda em cache o argumento já calculado", isCorrect: false },
                            { text: "Nenhuma, porque o build de Release remove todas as chamadas de LogDebug", isCorrect: false },
                            { text: "Nenhuma, porque o logger checa o nível antes de avaliar os argumentos", isCorrect: false },
                            { text: "10.000, porque o argumento é calculado antes de o logger olhar o nível", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com a configuração abaixo, para onde vai um log de Debug da categoria `Loja.Pagamentos.GatewayCartao`?\n\n```json\n\"Logging\": {\n  \"LogLevel\": {\n    \"Default\": \"Information\",\n    \"Loja.Pagamentos\": \"Debug\"\n  },\n  \"OpenTelemetry\": {\n    \"LogLevel\": { \"Default\": \"Warning\" }\n  }\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Para o console, e não para o exportador do OpenTelemetry", isCorrect: true },
                            { text: "Para lugar nenhum, porque o Warning do provedor vale para todos", isCorrect: false },
                            { text: "Para o console e o exportador, pela regra da categoria", isCorrect: false },
                            { text: "Só para o exportador, porque a seção dele tem prioridade geral", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Contexto: scopes e trace id",
                blocks: [
                    {
                        type: "text",
                        value: "# Contexto: scopes e trace id\n\nO checkout de um pedido escreve seis linhas de log em três classes, e no mesmo segundo outras trezentas requisições estão escrevendo as delas. Na ferramenta de logs, tudo chega intercalado. Quais linhas são da requisição do pedido 8812? E quando o checkout chama o serviço de estoque por HTTP, as linhas do outro lado estão em outro processo, outro contêiner, talvez outra máquina.\n\n**Contexto** é o conjunto de campos que toda linha de uma mesma operação carrega sem que cada chamada de log precise repetir os valores. No .NET ele vem de dois lugares: os **scopes**, que você abre, e os ids da **atividade** em andamento (`TraceId` e `SpanId`), que o ASP.NET Core abre a cada requisição.\n\n## Scopes\n\n`logger.BeginScope(\"Pedido {PedidoId}\", pedidoId)` abre um scope que dura até o fim do `using`. Todo log escrito dentro dele, **em qualquer classe** e mesmo depois de um `await`, carrega `PedidoId`, porque o scope viaja com o contexto assíncrono da execução. Para vários campos de uma vez, `BeginScope` também aceita um `Dictionary<string, object>`. No exemplo, checkout e estoque são dois endpoints do mesmo processo, para caber num programa só, mas a chamada entre eles passa por HTTP de verdade.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (a API escuta na porta 6210, e o HttpClient chama a própria API)\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Logging.AddJsonConsole(o =>\n{\n    o.IncludeScopes = true; // sem isto o scope não aparece na saída\n    o.JsonWriterOptions = new() { Indented = true };\n});\nbuilder.Services.AddHttpClient(\"estoque\", c => c.BaseAddress = new Uri(\"http://localhost:6210\"));\n\nvar app = builder.Build();\n\n// serviço de checkout\napp.MapPost(\"/checkout/{pedidoId:int}\", async (int pedidoId, IHttpClientFactory http,\n    ILoggerFactory loggers) =>\n{\n    var logger = loggers.CreateLogger(\"Loja.Checkout\");\n    using (logger.BeginScope(\"Pedido {PedidoId}\", pedidoId))\n    {\n        logger.LogInformation(\"Checkout iniciado\");\n        var resposta = await http.CreateClient(\"estoque\")\n            .PostAsync($\"/estoque/reservas/{pedidoId}\", content: null);\n        logger.LogInformation(\"Estoque respondeu {Status}\", (int)resposta.StatusCode);\n    }\n    return Results.Accepted();\n});\n\n// serviço de estoque (outro processo na vida real; aqui, outro endpoint)\napp.MapPost(\"/estoque/reservas/{pedidoId:int}\", (int pedidoId, ILoggerFactory loggers) =>\n{\n    loggers.CreateLogger(\"Loja.Estoque\").LogInformation(\"Reservando estoque do pedido {PedidoId}\", pedidoId);\n    return Results.NoContent();\n});\n\napp.Run();",
                    },
                    {
                        type: "code",
                        value: "# saída do log \"Checkout iniciado\" (formatador JSON com IncludeScopes)\n{\n  \"EventId\": 0,\n  \"LogLevel\": \"Information\",\n  \"Category\": \"Loja.Checkout\",\n  \"Message\": \"Checkout iniciado\",\n  \"State\": {\n    \"{OriginalFormat}\": \"Checkout iniciado\"\n  },\n  \"Scopes\": [\n    {\n      \"Message\": \"SpanId:3c910653213aca47, TraceId:3b673f846f38bbf8dd4476eea6143dfa, ParentId:0000000000000000\",\n      \"SpanId\": \"3c910653213aca47\",\n      \"TraceId\": \"3b673f846f38bbf8dd4476eea6143dfa\",\n      \"ParentId\": \"0000000000000000\"\n    },\n    {\n      \"Message\": \"ConnectionId:0HNPELK67BU8S\",\n      \"ConnectionId\": \"0HNPELK67BU8S\"\n    },\n    {\n      \"Message\": \"RequestPath:/checkout/8812 RequestId:0HNPELK67BU8S:00000001\",\n      \"RequestId\": \"0HNPELK67BU8S:00000001\",\n      \"RequestPath\": \"/checkout/8812\"\n    },\n    {\n      \"Message\": \"Pedido 8812\",\n      \"PedidoId\": 8812,\n      \"{OriginalFormat}\": \"Pedido {PedidoId}\"\n    }\n  ]\n}",
                    },
                    {
                        type: "text",
                        value: "## O que o ASP.NET Core põe sozinho\n\nO `PedidoId` foi o único scope aberto pelo código. Os outros vieram de graça:\n\n- `SpanId`, `TraceId` e `ParentId`: os ids da atividade (`Activity`) que o ASP.NET Core abre para a requisição, no formato do W3C Trace Context: trace id com 32 caracteres hexadecimais, span id com 16. Quem põe esses ids no scope é a opção `ActivityTrackingOptions` da fábrica de loggers, que o host já configura com os três.\n- `ConnectionId`, `RequestId` e `RequestPath`: o servidor web.\n\nNada disso aparece se o provedor não incluir scopes. `IncludeScopes` vem **desligado** no formatador JSON do console e no provedor do OpenTelemetry; muita gente abre scopes pelo código inteiro, olha a saída, não vê nada e conclui que scope não funciona.\n\n## Correlação entre serviços\n\nNa mesma requisição, o checkout chamou o estoque. Os ids de cada linha que o código escreveu:",
                    },
                    {
                        type: "table",
                        value: "[[\"Serviço\", \"Linha\", \"TraceId\", \"SpanId\", \"ParentId\"], [\"checkout\", \"Checkout iniciado\", \"3b673f846f38bbf8dd4476eea6143dfa\", \"3c910653213aca47\", \"0000000000000000\"], [\"estoque\", \"Reservando estoque do pedido 8812\", \"3b673f846f38bbf8dd4476eea6143dfa\", \"b59e4174ca9cb7b2\", \"c84c903a76f062c1\"], [\"checkout\", \"Estoque respondeu 204\", \"3b673f846f38bbf8dd4476eea6143dfa\", \"3c910653213aca47\", \"0000000000000000\"]]",
                    },
                    {
                        type: "text",
                        value: "O `HttpClient` levou o contexto no cabeçalho `traceparent`, do padrão W3C Trace Context, e o ASP.NET Core do estoque continuou o mesmo trace: **mesmo TraceId, SpanId novo**. O `ParentId` do estoque não é o span do checkout, e sim o da chamada HTTP que o `HttpClient` abriu, que não escreveu linha de log nenhuma (com o tracing ligado, ele aparece no trace). Como o contexto atravessa HTTP e filas é assunto do estudo de traces. Para o log, o que importa é isto: filtrar por um trace id traz as linhas de **todos** os serviços que participaram da requisição, e, com o tracing configurado, o mesmo id abre o trace completo no Tempo.\n\nDois cuidados:\n\n- **Trace id não substitui id de negócio.** O trace id junta uma execução. A história de um pedido atravessa várias: a cobrança que falhou hoje, a nova tentativa amanhã, o estorno da semana que vem. Mantenha `PedidoId` como campo, no scope ou no template, para costurar essa história.\n- **Fora de requisição, ninguém abre atividade por você.** Um worker que processa um lote não tem o ASP.NET Core abrindo `Activity`. E uma fábrica criada com `LoggerFactory.Create`, sem host, começa com `ActivityTrackingOptions` em `None`: mesmo dentro de uma atividade, os ids não entram no log.",
                    },
                    {
                        type: "code",
                        value: "// trecho de uma ferramenta sem host, que escreve os logs dentro de uma Activity iniciada\nusing var fabrica = LoggerFactory.Create(b =>\n{\n    b.AddJsonConsole(o => o.IncludeScopes = true);\n    b.Configure(o => o.ActivityTrackingOptions =\n        ActivityTrackingOptions.TraceId | ActivityTrackingOptions.SpanId); // sem isto, nada de TraceId\n});\n\n# saída sem a linha do Configure\n{\"EventId\":0,\"LogLevel\":\"Information\",\"Category\":\"Worker\",\"Message\":\"Lote 77 processado\",\"State\":{\"LoteId\":77,\"{OriginalFormat}\":\"Lote {LoteId} processado\"},\"Scopes\":[]}\n\n# saída com a linha do Configure\n{\"EventId\":0,\"LogLevel\":\"Information\",\"Category\":\"Worker\",\"Message\":\"Lote 77 processado\",\"State\":{\"LoteId\":77,\"{OriginalFormat}\":\"Lote {LoteId} processado\"},\"Scopes\":[{\"Message\":\"SpanId:d044ced0b8eae198, TraceId:5e1a0d5bb0853cbe5ac61a3ff326006d\",\"SpanId\":\"d044ced0b8eae198\",\"TraceId\":\"5e1a0d5bb0853cbe5ac61a3ff326006d\"}]}",
                    },
                    {
                        type: "text",
                        value: "## No provedor do OpenTelemetry\n\nNo provedor do OpenTelemetry, trace id e span id não dependem de scope: o SDK lê a atividade corrente e grava os dois em campos próprios do registro, que no OTLP viajam como `trace_id` e `span_id`. Os scopes, com `IncludeScopes` ligado, viram atributos do registro, ao lado dos campos do template; inclusive o scope de ids que o host cria, então o trace id aparece duas vezes, no campo do registro e no atributo `TraceId`. Abaixo, o registro do estoque numa outra execução do mesmo exemplo, como o exportador de console do OpenTelemetry mostrou:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: troca o formatador JSON pelo provedor do OpenTelemetry\n// (pacotes OpenTelemetry.Extensions.Hosting e OpenTelemetry.Exporter.Console)\nusing OpenTelemetry.Logs;\n// ...\nbuilder.Logging.AddOpenTelemetry(o =>\n{\n    o.IncludeScopes = true;          // scope vira atributo do registro\n    o.IncludeFormattedMessage = true; // além do template, a mensagem pronta\n    o.AddConsoleExporter();\n});\n\n# registro do estoque montado pelo SDK (trecho)\nLogRecord.TraceId:                 007e74f0aa01c7b8792f06655b8be776\nLogRecord.SpanId:                  a102704ef241f64a\nLogRecord.CategoryName:            Loja.Estoque\nLogRecord.Severity:                Info\nLogRecord.SeverityText:            Information\nLogRecord.FormattedMessage:        Reservando estoque do pedido 8812\nLogRecord.Body:                    Reservando estoque do pedido {PedidoId}\nLogRecord.Attributes (Key:Value):\n    PedidoId: 8812\n    OriginalFormat (a.k.a Body): Reservando estoque do pedido {PedidoId}\nLogRecord.ScopeValues (Key:Value):\n[Scope.0]:SpanId: a102704ef241f64a\n[Scope.0]:TraceId: 007e74f0aa01c7b8792f06655b8be776\n[Scope.0]:ParentId: e177087ad3f96c4c\n[Scope.1]:ConnectionId: 0HNPELK6L8TKG\n[Scope.2]:RequestId: 0HNPELK6L8TKG:00000001\n[Scope.2]:RequestPath: /estoque/reservas/8812",
                    },
                    {
                        type: "quote",
                        value: "Scope põe o mesmo campo em todas as linhas de uma operação, e o ASP.NET Core já põe TraceId e SpanId em cada requisição, mas nada aparece sem `IncludeScopes`. O trace id costura os serviços de uma execução; o id de negócio costura a história do pedido entre execuções.",
                    },
                ],
                questions: [
                    {
                        statement: "Um serviço abre `BeginScope` pelo código inteiro, mas os campos dos scopes não aparecem na saída do formatador JSON do console. Qual a causa mais provável?",
                        difficulty: "facil",
                        options: [
                            { text: "`IncludeScopes` está desligado, que é o padrão desse formatador", isCorrect: true },
                            { text: "O `BeginScope` precisa ser chamado antes do `builder.Build()`", isCorrect: false },
                            { text: "O scope só aparece em logs de nível Warning ou acima desse nível", isCorrect: false },
                            { text: "O scope só é gravado quando o exportador do OpenTelemetry está ligado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No exemplo, o checkout chama o estoque por HTTP durante a mesma requisição. O que o log do checkout e o log do estoque têm em comum?",
                        difficulty: "facil",
                        options: [
                            { text: "O mesmo TraceId, com um SpanId diferente em cada serviço", isCorrect: true },
                            { text: "O mesmo SpanId, com um TraceId diferente em cada serviço", isCorrect: false },
                            { text: "O mesmo RequestId, gerado no checkout e repassado ao estoque", isCorrect: false },
                            { text: "O mesmo ConnectionId, porque as duas pontas usam a mesma conexão", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma ferramenta de linha de comando cria o logger com `LoggerFactory.Create(b => b.AddJsonConsole(o => o.IncludeScopes = true))` e escreve os logs dentro de uma `Activity` iniciada. Os logs saem sem TraceId. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "O TraceId só entra no scope quando o nível Debug está ligado na categoria", isCorrect: false },
                            { text: "Sem host, `ActivityTrackingOptions` fica em `None`, e os ids não vão ao scope", isCorrect: true },
                            { text: "O formatador JSON não escreve TraceId; só o exportador do OpenTelemetry escreve", isCorrect: false },
                            { text: "Uma `Activity` iniciada à mão não tem TraceId; só a do ASP.NET Core tem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O serviço já grava TraceId em todo log. Por que ainda vale manter `PedidoId` como campo nos logs do pedido?",
                        difficulty: "medio",
                        options: [
                            { text: "O TraceId muda a cada execução, e a história do pedido atravessa várias delas", isCorrect: true },
                            { text: "O TraceId se perde quando o log sai do processo pelo exportador OTLP", isCorrect: false },
                            { text: "O TraceId só existe quando o tracing está configurado e exportando para o Tempo", isCorrect: false },
                            { text: "O TraceId muda a cada linha, e só o PedidoId junta as linhas da requisição", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `IncludeScopes` ligado, quais logs carregam `PedidoId` neste trecho? O `ReservarAsync` escreve um log com o `ILogger` da sua própria classe.\n\n```csharp\nusing (logger.BeginScope(\"Pedido {PedidoId}\", pedidoId))\n{\n    await estoque.ReservarAsync(pedidoId);\n}\nlogger.LogInformation(\"Checkout concluído\");\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Só o \"Checkout concluído\", que usa o mesmo logger que abriu o scope", isCorrect: false },
                            { text: "Nenhum dos dois, porque o scope não atravessa o await nem outra classe", isCorrect: false },
                            { text: "Os dois, porque o scope vale até o fim da requisição em andamento", isCorrect: false },
                            { text: "O log de dentro do ReservarAsync, e não o \"Checkout concluído\"", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Consultando logs no Loki",
                blocks: [
                    {
                        type: "text",
                        value: "# Consultando logs no Loki\n\nDoze réplicas do serviço de pedidos espalhadas em três máquinas. Para investigar, alguém roda `docker logs` (ou `kubectl logs`) em cada uma, copia trechos para um editor e cruza os horários à mão. Quando o contêiner reinicia, os logs dele vão junto. Isso não aguenta a primeira madrugada. Log útil precisa ser **coletado** de todo lugar, **guardado** num lugar só por um tempo definido e **consultado** com filtros. Na pilha aberta, quem guarda é o **Loki**, e quem coleta é o **Collector** do OpenTelemetry ou o **Grafana Alloy**, a distribuição do Collector mantida pela Grafana.\n\nO log chega lá por um de dois caminhos:",
                    },
                    {
                        type: "table",
                        value: "[[\"Caminho\", \"Como o log viaja\", \"O que chega ao Loki\", \"Quando faz sentido\"], [\"OTLP pelo SDK\", \"o app exporta por OTLP para o Collector ou o Alloy, que repassa ao Loki\", \"a mensagem como linha; campos do template e dos scopes, trace_id e span_id como metadados\", \"serviço que você instrumenta\"], [\"stdout em JSON\", \"o app escreve no console, e o agente lê o arquivo de log do contêiner\", \"a linha JSON inteira, que a consulta abre com o parser json\", \"software de terceiro, legado, ou plataforma que já padronizou o stdout\"]]",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: provedor de log do OpenTelemetry com o exportador OTLP\n// (pacotes OpenTelemetry.Extensions.Hosting e OpenTelemetry.Exporter.OpenTelemetryProtocol)\nusing OpenTelemetry.Logs;\nusing OpenTelemetry.Resources;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pedidos\"))\n    .WithLogging(\n        logging => logging.AddOtlpExporter(), // endereço e protocolo vêm de OTEL_EXPORTER_OTLP_*\n        options =>\n        {\n            options.IncludeScopes = true;\n            options.IncludeFormattedMessage = true; // a linha no Loki com os valores preenchidos\n        });\n\n// variáveis de ambiente do contêiner do app:\n// OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317\n// OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=producao",
                    },
                    {
                        type: "code",
                        value: "# otel-collector.yaml (só o necessário para os logs chegarem ao Loki)\nreceivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317   # sem endpoint, só 127.0.0.1: de fora do contêiner, ninguém alcança\n      http:\n        endpoint: 0.0.0.0:4318\n\nexporters:\n  otlp_http/loki:\n    endpoint: http://loki:3100/otlp   # o exportador acrescenta /v1/logs\n\nservice:\n  pipelines:\n    logs:\n      receivers: [otlp]\n      exporters: [otlp_http/loki]\n\n// config.alloy: o mesmo caminho no Grafana Alloy\notelcol.receiver.otlp \"default\" {\n  grpc {}\n  http {}\n\n  output {\n    logs = [otelcol.exporter.otlphttp.loki.input]\n  }\n}\n\notelcol.exporter.otlphttp \"loki\" {\n  client {\n    endpoint = \"http://loki:3100/otlp\"\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## O que cada peça faz\n\n- Sem `OTEL_EXPORTER_OTLP_ENDPOINT`, o exportador manda gRPC para `http://localhost:4317`. Para usar HTTP, `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`; aí a variável de endereço é a base, e o SDK acrescenta `/v1/logs`. Dá até para mandar direto ao Loki, sem coletor, com `OTEL_EXPORTER_OTLP_ENDPOINT=http://loki:3100/otlp`, mas o coletor no meio é que permite filtrar, rotear e trocar de destino sem mexer no app.\n- `IncludeFormattedMessage` vem desligado, e aí o corpo do registro vai com o template: no Loki, a linha aparece como `Pagamento do pedido {PedidoId} aprovado em {DuracaoMs} ms`, com as chaves. Os valores continuam nos metadados, mas quem lê a tela estranha.\n- O receiver OTLP sem `endpoint` escuta só em `127.0.0.1`, e dentro de um contêiner isso quer dizer que ninguém de fora alcança. Por isso o `0.0.0.0`.\n- O Loki recebe OTLP nativo no caminho `/otlp` desde a versão 3. O exportador `loki` do Collector, que aparece em tutoriais antigos, foi descontinuado e já não existe na distribuição contrib atual (conferido na 0.163), e o Promtail, antigo agente do Loki, chegou ao fim da vida em março de 2026. E desde a versão 0.144 do Collector (janeiro de 2026), os exportadores OTLP se chamam `otlp_grpc` e `otlp_http`: os nomes antigos `otlp` e `otlphttp`, que a documentação do Loki ainda usa, funcionam com um aviso de obsoleto no log do Collector. No Alloy, o componente continua se chamando `otelcol.exporter.otlphttp` (conferido na versão 1.21).\n- Em produção, processadores como `memory_limiter` e `batch` entram nesse pipeline; o Collector em detalhe fica para o estudo do pipeline.\n\n## O que o Loki faz com o OTLP\n\n- **Rótulos de índice**: só alguns atributos de recurso, como `service.name`, `service.namespace`, `service.instance.id`, `deployment.environment.name` e os do Kubernetes (`k8s.namespace.name`, `k8s.pod.name` e outros). Os pontos viram sublinhado: `service_name`. Cada combinação de valores de rótulo forma um **stream**.\n- **Metadados estruturados** (structured metadata): todo o resto, guardado junto de cada linha, fora do índice. Ali ficam os campos do template (`PedidoId`), dos scopes (`ClienteId`, `RequestPath`), `trace_id`, `span_id`, `severity_text`, `scope_name` (a categoria do logger), `exception_type` e o `detected_level`, que o Loki calcula pela severidade. Até o `{OriginalFormat}` vai, com o nome `_OriginalFormat_`.\n- **A linha**: o corpo do registro, a mensagem.\n\nO índice é pequeno de propósito. O erro clássico é promover `PedidoId` ou `ClienteId` a rótulo \"para a busca ficar rápida\": cada valor novo cria um stream, e milhões de pedidos viram milhões de streams. É o mesmo problema de cardinalidade das métricas. Valor de alta cardinalidade fica no metadado e se filtra depois do seletor. E quando um stream chega sem `service_name`, como o do stdout, o Loki 3 preenche o rótulo a partir de outros, como `container`.",
                    },
                    {
                        type: "text",
                        value: "## LogQL básico\n\nToda consulta começa com um **seletor de stream** entre chaves, que só enxerga rótulos de índice (`=`, `!=`, `=~`, `!~`) e precisa de pelo menos um que não case com vazio: `{service_name=~\".*\"}` é recusado. Depois vem o pipeline, estágio por estágio, separado por `|`:\n\n- **filtro de linha**: `|=` contém, `!=` não contém, `|~` casa com regex, `!~` não casa. Diferencia maiúsculas: `|= \"Recusado\"` não acha \"recusado\"; para ignorar, `|~ \"(?i)recusado\"`.\n- **filtro de rótulo**: `| PedidoId=\"8812\"`, `| DuracaoMs > 100`, `| detected_level=\"error\"`; vale para rótulos, metadados estruturados e campos extraídos.\n- **parser**: `| json` abre uma linha JSON (o caminho do stdout) e achata os campos aninhados com sublinhado, então o `PedidoId` dentro de `State` vira `State_PedidoId`.\n- **formatação**: `| line_format \"{{.PedidoId}}\"` reescreve a linha exibida.\n\nPonha o filtro de linha logo depois do seletor: é o estágio mais barato, e a documentação do Loki recomenda começar por ele. Qualquer consulta de log também vira métrica com `count_over_time` ou `rate` sobre uma janela, agregada com `sum by`.",
                    },
                    {
                        type: "code",
                        value: "# consultas LogQL rodadas no Loki 3.7.8 com os logs do exemplo; o resultado vem logo abaixo\n\n# linhas do serviço que contêm o texto\n{service_name=\"pedidos\"} |= \"recusado\"\n#   Pagamento do pedido 8814 recusado: saldo insuficiente\n\n# o pedido, pelo campo do template (metadado estruturado)\n{service_name=\"pedidos\"} | PedidoId=\"8812\"\n#   Cobrando o pedido 8812 no gateway\n#   Falha ao cobrar o pedido 8812\n\n# todas as linhas da requisição que falhou, pelo trace id\n{service_name=\"pedidos\"} | trace_id=\"9a6e6177c45cd87f61b4b1f1dd648e51\"\n#   Cobrando o pedido 8812 no gateway\n#   Falha ao cobrar o pedido 8812\n\n# erros, reescritos com o campo e o tipo da exceção\n{service_name=\"pedidos\"} | detected_level=\"error\" | line_format \"{{.PedidoId}} {{.exception_type}}\"\n#   8812 TimeoutException\n\n# quantos erros por categoria nos últimos 5 minutos\nsum by (scope_name) (count_over_time({service_name=\"pedidos\"} | detected_level=\"error\" [5m]))\n#   {scope_name=\"Loja.Pagamentos\"} 1\n\n# quantas vezes cada evento aconteceu (agrupado pelo template)\nsum by (_OriginalFormat_) (count_over_time({service_name=\"pedidos\"} | scope_name=\"Loja.Pagamentos\" [5m]))\n#   {_OriginalFormat_=\"Cobrando o pedido {PedidoId} no gateway\"} 4\n#   {_OriginalFormat_=\"Falha ao cobrar o pedido {PedidoId}\"} 1\n#   {_OriginalFormat_=\"Pagamento do pedido {PedidoId} aprovado em {DuracaoMs} ms\"} 2\n#   {_OriginalFormat_=\"Pagamento do pedido {PedidoId} recusado: {Motivo}\"} 1\n\n# caminho do stdout: a linha é JSON e o parser abre os campos\n{container=\"pedidos-worker\"} | json | State_PedidoId=\"8814\" | line_format \"{{.LogLevel}} {{.State_Motivo}}\"\n#   Warning saldo insuficiente",
                    },
                    {
                        type: "text",
                        value: "## Retenção\n\nPor padrão o Loki não apaga nada: `retention_period` vale `0s`, que significa guardar para sempre. Quem apaga é o **compactor**, e só com `retention_enabled: true`. Sem isso, o disco ou o bucket cresce sem fim, e um dado pessoal que escapou para o log fica guardado indefinidamente, o contrário do que a LGPD pede (assunto da última aula do módulo).\n\nA retenção pode variar por stream com `retention_stream`, usando seletor de rótulos de índice: homologação por 7 dias e o resto por 30, por exemplo. Três detalhes: a retenção exige o índice com período de 24h, que é o do esquema atual (`v13` com `tsdb`); mudar o prazo não é retroativo; e a remoção é assíncrona, depois de um atraso (`retention_delete_delay`, 2 horas por padrão). Escolha o prazo pelo uso: até quando o time volta ao log para investigar? Exigência de auditoria pede outro armazenamento, com outras regras, porque log de diagnóstico não é registro de auditoria.",
                    },
                    {
                        type: "code",
                        value: "# loki-config.yaml (trecho acrescentado à configuração padrão da imagem; conferido com -verify-config)\ncompactor:\n  working_directory: /loki/compactor\n  retention_enabled: true          # sem isto o compactor só compacta, não apaga\n  delete_request_store: filesystem\n\nlimits_config:\n  retention_period: 720h           # 30 dias para todo mundo\n  retention_stream:\n    - selector: '{deployment_environment_name=\"homologacao\"}'\n      priority: 1\n      period: 168h                 # homologação: 7 dias",
                    },
                    {
                        type: "quote",
                        value: "O app manda OTLP, o Collector ou o Alloy repassa ao endpoint `/otlp` do Loki, e o Loki indexa poucos rótulos de recurso e guarda o resto como metadado. No LogQL, o seletor escolhe streams pelos rótulos, o pipeline filtra linha e campo, e a retenção só existe se você ligar o compactor.",
                    },
                ],
                questions: [
                    {
                        statement: "Na consulta `{service_name=\"pedidos\"} |= \"recusado\"`, qual é o papel de cada parte?",
                        difficulty: "facil",
                        options: [
                            { text: "As chaves são opcionais, e o `|=` procura o texto em todos os streams guardados", isCorrect: false },
                            { text: "As chaves filtram as linhas pelo texto, e o `|=` escolhe os streams pelos rótulos", isCorrect: false },
                            { text: "As chaves filtram os metadados estruturados, e o `|=` filtra os rótulos do índice", isCorrect: false },
                            { text: "As chaves escolhem os streams pelos rótulos, e o `|=` filtra as linhas pelo texto", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Os logs do serviço chegam ao Loki por OTLP. Onde fica o campo `PedidoId` de um log escrito com template, e como se filtra por ele?",
                        difficulty: "facil",
                        options: [
                            { text: "Como atributo de recurso, filtrado junto do `service_name` dentro das chaves", isCorrect: false },
                            { text: "Só no texto da linha, filtrado com `|= \"8812\"` logo depois do seletor", isCorrect: false },
                            { text: "Como metadado estruturado, filtrado com `| PedidoId=\"8812\"` após o seletor", isCorrect: true },
                            { text: "Como rótulo de índice, filtrado com `{PedidoId=\"8812\"}` dentro das chaves", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os logs chegam ao Loki pelo exportador OTLP do .NET, e as linhas aparecem como `Pagamento do pedido {PedidoId} aprovado em {DuracaoMs} ms`, com as chaves no lugar dos valores. Qual é a explicação?",
                        difficulty: "medio",
                        options: [
                            { text: "`IncludeFormattedMessage` está desligado, que é o padrão, e o corpo vai com o template", isCorrect: true },
                            { text: "O Loki guarda só o template e preenche os valores quando o Grafana exibe a linha", isCorrect: false },
                            { text: "`IncludeScopes` está desligado, que é o padrão, e os valores ficam de fora do registro", isCorrect: false },
                            { text: "O código usou interpolação, e o exportador não consegue substituir os valores", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para a busca por pedido ficar mais rápida, alguém propõe configurar o Loki para indexar `PedidoId` como rótulo. Qual o problema?",
                        difficulty: "medio",
                        options: [
                            { text: "Nenhum, porque rótulo de índice é sempre mais rápido e só custa mais disco", isCorrect: false },
                            { text: "Cada valor novo cria um stream, e milhões de pedidos viram milhões de streams", isCorrect: true },
                            { text: "O índice só guarda rótulos por 24 horas, e pedidos antigos somem da busca", isCorrect: false },
                            { text: "Rótulo de índice só casa com regex, e a busca por igualdade para de funcionar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os logs chegam por OTLP, então `detected_level` e `scope_name` são metadados estruturados. Qual consulta conta, por categoria do logger, quantos logs de erro o serviço `pedidos` gravou nos últimos 5 minutos?",
                        difficulty: "dificil",
                        options: [
                            { text: "`sum by (scope_name) (count_over_time({service_name=\"pedidos\", detected_level=\"error\"} [5m]))`", isCorrect: false },
                            { text: "`sum by (scope_name) (rate({service_name=\"pedidos\"} |= \"error\" [5m]))`", isCorrect: false },
                            { text: "`sum by (scope_name) (count_over_time({service_name=\"pedidos\"} | detected_level=\"error\" [5m]))`", isCorrect: true },
                            { text: "`count_over_time(sum by (scope_name) ({service_name=\"pedidos\"} | detected_level=\"error\") [5m])`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "O que não vai para o log",
                blocks: [
                    {
                        type: "text",
                        value: "# O que não vai para o log\n\nLog é o dado mais copiado da empresa. Sai do processo pelo stdout, passa pelo coletor, fica no Loki, vai para o backup, às vezes para um fornecedor de observabilidade em outro país, e acaba exportado em planilha para alguém investigar um chamado. Fica meses guardado e é lido pelo time de engenharia inteiro. Um CPF numa linha de log está em todos esses lugares, sem finalidade, sem controle de acesso e sem prazo.\n\nA LGPD (Lei 13.709/2018) chama isso de tratamento de **dado pessoal**: \"informação relacionada a pessoa natural identificada ou identificável\" (art. 5º, I). O princípio da **necessidade** (art. 6º, III) limita o tratamento \"ao mínimo necessário para a realização de suas finalidades\", e o art. 46 exige medidas de segurança contra acesso não autorizado. Se o log vaza e isso pode trazer risco ou dano relevante aos titulares, é incidente de segurança que o controlador deve comunicar à ANPD e aos titulares (art. 48), e a multa simples chega a 2% do faturamento no Brasil, limitada a 50 milhões de reais por infração (art. 52, II).",
                    },
                    {
                        type: "table",
                        value: "[[\"O que fica de fora\", \"Por quê\", \"O que registrar no lugar\"], [\"CPF, e-mail, telefone, nome, endereço\", \"dado pessoal, e o diagnóstico quase nunca precisa dele\", \"o id interno, como ClienteId\"], [\"Saúde, biometria, religião, opinião política\", \"dado pessoal sensível (art. 5º, II)\", \"nada, ou só o id do registro\"], [\"Senha, token, chave de API, cookie, cabeçalho Authorization, connection string\", \"segredo: quem lê o log passa a ter o acesso\", \"o nome do cliente da API ou o id da chave, nunca o valor\"], [\"Número do cartão e código de segurança\", \"o padrão PCI DSS proíbe guardar o código de segurança depois da autorização\", \"bandeira e últimos 4 dígitos\"], [\"Corpo inteiro de requisição e de resposta\", \"carrega tudo o que está acima e multiplica o volume\", \"os campos que o diagnóstico precisa, um a um\"]]",
                    },
                    {
                        type: "text",
                        value: "## Como o dado entra sem ninguém querer\n\nQuase ninguém escreve `logger.LogInformation(\"CPF {Cpf}\", cpf)`. O vazamento entra por caminhos indiretos:\n\n- **Objeto inteiro no template.** Um `record` gera `ToString` com todas as propriedades, e `{Cliente}` grava o CPF e o e-mail junto, como mostra a saída abaixo. Uma classe comum grava só o nome do tipo, que é inútil, e alguém \"conserta\" sobrescrevendo `ToString`, com tudo dentro.\n- **URL com token.** `Chamando {Url}` com `?access_token=...` na query string.\n- **Corpo de requisição** logado \"para investigar\", e **Debug** ligado em produção com o payload dentro.\n- **Mensagem de exceção** que repete o valor que falhou na validação.\n\nA regra que resolve quase tudo: **logue campos escolhidos, um a um, nunca o objeto**. Se o diagnóstico precisa saber de qual cliente se trata, o `ClienteId` resolve; quem precisar do resto consulta o sistema, que tem controle de acesso. O id interno ainda leva a uma pessoa para quem tem o cadastro (é um dado pseudonimizado), mas expõe muito menos que CPF e e-mail espalhados em cópias de log.",
                    },
                    {
                        type: "code",
                        value: "// Cliente.cs\npublic sealed record Cliente(int Id, string Nome, string Cpf, string Email);\n\n// ao atualizar o cadastro\nlog.LogInformation(\"Cadastro atualizado: {Cliente}\", cliente);   // o record inteiro vai junto\nlog.LogInformation(\"Cadastro do cliente {ClienteId} atualizado\", cliente.Id);\n\n# saída\ninfo: Loja.Clientes[0]\n      Cadastro atualizado: Cliente { Id = 31, Nome = Maria Souza, Cpf = 123.456.789-09, Email = maria@exemplo.com }\ninfo: Loja.Clientes[0]\n      Cadastro do cliente 31 atualizado",
                    },
                    {
                        type: "text",
                        value: "## HTTP logging sem segredo\n\nO middleware de HTTP logging do ASP.NET Core é útil para investigar integração e já vem com proteções que vale conhecer antes de mexer:\n\n- cabeçalho fora da lista `RequestHeaders` sai como `[Redacted]`. A lista padrão só tem os inofensivos (`Accept`, `Content-Type`, `User-Agent` e afins), então `Authorization`, `Cookie` e chaves de API saem mascarados. Libere só o que o diagnóstico precisa, como um id de correlação;\n- a query string só entra com `HttpLoggingFields.RequestQuery`;\n- o corpo só entra com `RequestBody` e `ResponseBody`.\n\nO erro clássico é trocar para `HttpLoggingFields.All` \"só para investigar\" e esquecer ligado. Repare também que o middleware loga em Information na categoria `Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware`, que o `appsettings.json` padrão silencia (`Microsoft.AspNetCore` fica em Warning): sem liberar essa categoria, nada aparece.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing Microsoft.AspNetCore.HttpLogging;\n// ...\nbuilder.Services.AddHttpLogging(o =>\n{\n    o.LoggingFields = HttpLoggingFields.RequestPropertiesAndHeaders\n                    | HttpLoggingFields.ResponseStatusCode;\n    o.RequestHeaders.Add(\"X-Correlation-Id\"); // cabeçalho fora da lista sai como [Redacted]\n});\n// ... e, depois do builder.Build():\napp.UseHttpLogging();\n\n# appsettings.json: a categoria do middleware precisa estar liberada\n\"Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware\": \"Information\"\n\n# saída de um PUT em /clientes/31?token=abc123 com Authorization, Cookie, X-Api-Key e X-Correlation-Id\ninfo: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[1]\n      Request:\n      Protocol: HTTP/1.1\n      Method: PUT\n      Scheme: http\n      PathBase: \n      Path: /clientes/31\n      Accept: */*\n      Host: localhost:6212\n      User-Agent: curl/8.5.0\n      Authorization: [Redacted]\n      Content-Type: application/json\n      Cookie: [Redacted]\n      Content-Length: 24\n      X-Correlation-Id: 7f1c\n      X-Api-Key: [Redacted]\ninfo: Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware[2]\n      Response:\n      StatusCode: 204",
                    },
                    {
                        type: "text",
                        value: "## Volume e amostragem\n\nCada linha de log custa três vezes: na ingestão, no armazenamento durante toda a retenção e em cada consulta que passa por ela. Antes de amostrar, corte na origem: um log por evento de negócio, não por passo; nada de log por item dentro de laço; requisição de health check fora do log; categorias do framework em Warning.\n\nO que sobra pode ser **amostrado**. No .NET 10, o pacote `Microsoft.Extensions.Telemetry` traz amostradores para o pipeline de log. Com `builder.Logging.AddRandomProbabilisticSampler(0.1, LogLevel.Information)`, passam 10% dos logs de Information e dos níveis abaixo, e Warning, Error e Critical passam inteiros. No teste, com 10.000 logs de Information e 20 de Error, três rodadas deixaram passar 1.018, 1.000 e 993 logs de Information, e os 20 de Error todas as vezes. As regras também podem ir por categoria, nível e id de evento na seção `RandomProbabilisticSampler` da configuração, recarregável como os filtros. Só um amostrador vale por vez (o último registrado), e a própria documentação recomenda nunca amostrar Error e Critical.\n\nA alternativa é `AddTraceBasedSampler()`, que segue a decisão de amostragem do trace: o log sai só se a atividade foi gravada, e os logs ficam coerentes com os traces guardados (amostragem de trace é assunto do estudo de traces).\n\n## `[LoggerMessage]` para desempenho\n\nAs extensões `LogDebug`, `LogInformation` e companhia recebem os valores num `params object[]`: cada chamada aloca o array e faz boxing de cada número **antes** de checar o nível. Num laço de um milhão de chamadas de `LogDebug` com dois `int` e Debug desligado, foram 83 MB alocados, 88 bytes por chamada, para nenhum log escrito.\n\nCom `[LoggerMessage]`, você declara um método `partial` com o nível, o template e um `EventId`, e o gerador de código do .NET escreve a implementação: ela checa `IsEnabled` antes de tudo e chama um delegate criado uma vez com `LoggerMessage.Define`, genérico nos tipos dos parâmetros. O template é interpretado uma vez só, e com o nível desligado a chamada não aloca nada. De quebra:\n\n- o gerador liga os nomes do template aos parâmetros **pelo nome**, não pela posição;\n- nome no template sem parâmetro é erro de compilação (SYSLIB1014), e parâmetro fora do template gera aviso (SYSLIB1015);\n- o `EventId` fixo identifica o evento para contar, filtrar e alertar.\n\nUse nos caminhos quentes e para o catálogo de eventos do serviço; as extensões continuam boas para o log raro.",
                    },
                    {
                        type: "code",
                        value: "// LogPagamentos.cs\nusing Microsoft.Extensions.Logging;\n\nnamespace Loja.Pagamentos;\n\ninternal static partial class LogPagamentos\n{\n    [LoggerMessage(EventId = 2001, Level = LogLevel.Information,\n        Message = \"Pagamento do pedido {PedidoId} aprovado em {DuracaoMs} ms\")]\n    public static partial void PagamentoAprovado(this ILogger logger, int pedidoId, long duracaoMs);\n\n    [LoggerMessage(EventId = 2002, Level = LogLevel.Warning,\n        Message = \"Pagamento do pedido {PedidoId} recusado: {Motivo}\")]\n    public static partial void PagamentoRecusado(this ILogger logger, int pedidoId, string motivo);\n\n    [LoggerMessage(EventId = 2003, Level = LogLevel.Debug,\n        Message = \"Adquirente respondeu ao pedido {PedidoId} com o código {Codigo}\")]\n    public static partial void RespostaAdquirente(this ILogger logger, int pedidoId, int codigo);\n}\n\n// uso\nlogger.PagamentoAprovado(8812, 120);\nlogger.PagamentoRecusado(8814, \"saldo insuficiente\");\n\n# saída\ninfo: Loja.Pagamentos[2001]\n      Pagamento do pedido 8812 aprovado em 120 ms\nwarn: Loja.Pagamentos[2002]\n      Pagamento do pedido 8814 recusado: saldo insuficiente\n\n# um milhão de chamadas com Debug desligado, build Release (o tempo varia com a máquina)\nDebug ligado: False\nLogDebug (extensão):  83 MB alocados em 1.000.000 chamadas, 90 ms\n[LoggerMessage]:      0 MB alocados em 1.000.000 chamadas, 10 ms\nBytes por chamada: 88 contra 0",
                    },
                    {
                        type: "quote",
                        value: "O melhor filtro de dado pessoal e de segredo é não escrever: logue campos escolhidos, nunca o objeto, o corpo ou o cabeçalho inteiro. Corte volume na origem, amostre Information e nunca Error, e use `[LoggerMessage]` nos caminhos quentes para não pagar por log desligado.",
                    },
                ],
                questions: [
                    {
                        statement: "Para o suporte encontrar no log as operações de um cliente que reclamou, o que o serviço deve gravar?",
                        difficulty: "facil",
                        options: [
                            { text: "O nome completo do cliente, que permite a busca por texto no Loki", isCorrect: false },
                            { text: "O `ClienteId` interno, que o suporte cruza com o cadastro no sistema", isCorrect: true },
                            { text: "O e-mail do cliente, que o time de suporte já vê durante o atendimento", isCorrect: false },
                            { text: "O CPF completo, que é o dado que o suporte recebe do próprio cliente", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que vai para o log nesta chamada?\n\n```csharp\npublic sealed record Cliente(int Id, string Nome, string Cpf, string Email);\n\nlogger.LogInformation(\"Cadastro atualizado: {Cliente}\", cliente);\n```",
                        difficulty: "facil",
                        options: [
                            { text: "Um campo por propriedade, com o Cpf mascarado pelo próprio `ILogger`", isCorrect: false },
                            { text: "Só o nome do tipo, `Loja.Clientes.Cliente`, como acontece com uma classe", isCorrect: false },
                            { text: "Nada, porque o `ILogger` recusa objetos e só aceita tipos primitivos", isCorrect: false },
                            { text: "O `ToString` gerado pelo record, com Id, Nome, Cpf e Email preenchidos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma API liga `AddHttpLogging` com `LoggingFields = HttpLoggingFields.RequestPropertiesAndHeaders` e não mexe na lista de cabeçalhos. Chega uma requisição com `Authorization: Bearer ...` e `X-Correlation-Id: 7f1c`. O que vai para o log?",
                        difficulty: "medio",
                        options: [
                            { text: "Os dois com o valor, porque a proteção padrão vale só para o corpo da requisição", isCorrect: false },
                            { text: "Os dois como `[Redacted]`, porque nenhum está na lista padrão de cabeçalhos", isCorrect: true },
                            { text: "Nenhum dos dois, porque cabeçalho só entra com `HttpLoggingFields.All`", isCorrect: false },
                            { text: "O Authorization como `[Redacted]` e o X-Correlation-Id com o valor enviado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `builder.Logging.AddRandomProbabilisticSampler(0.1, LogLevel.Information)`, o que acontece com os logs de Error?",
                        difficulty: "medio",
                        options: [
                            { text: "Passam todos, porque a regra vale para Information e para os níveis abaixo", isCorrect: true },
                            { text: "Passam 10%, porque a probabilidade configurada vale para todos os níveis", isCorrect: false },
                            { text: "São descartados, porque o amostrador deixa passar só o nível que foi informado", isCorrect: false },
                            { text: "Passam 10% de cada categoria, sorteados uma vez a cada minuto de execução", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com Debug desligado, um milhão de chamadas `logger.LogDebug(\"... {PedidoId} ... {Codigo}\", pedidoId, codigo)`, com dois `int`, alocaram 83 MB, e a versão com `[LoggerMessage]` não alocou nada. De onde vem a alocação da primeira?",
                        difficulty: "dificil",
                        options: [
                            { text: "Do array de argumentos e do boxing dos dois `int`, feitos antes de checar o nível", isCorrect: true },
                            { text: "Do scope que o `ILogger` abre a cada chamada, mesmo com `IncludeScopes` desligado", isCorrect: false },
                            { text: "Da formatação da mensagem, que o `ILogger` monta antes de checar o nível do log", isCorrect: false },
                            { text: "Do parse do template, refeito a cada chamada porque o `ILogger` não guarda cache", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Métricas",
        aulas: [
            {
                titulo: "Tipos de instrumento",
                blocks: [
                    {
                        type: "text",
                        value: "# Tipos de instrumento\n\nO time quer saber quantos pedidos a loja recebe por minuto. Alguém cria uma variável que soma os pedidos, zera a cada 60 segundos e publica o resultado como métrica. No computador de quem escreveu, funciona. Em produção, com quatro instâncias, cada uma publica a contagem do próprio minuto, que começa e termina em momentos diferentes; quando uma instância reinicia, o minuto em andamento some; e ninguém consegue responder \"quantos pedidos entre 14h e 14h05\", porque o número já chegou mastigado.\n\nO erro não está na conta, está na escolha do **instrumento**. Uma métrica é um número agregado ao longo do tempo, e o instrumento diz como esse número se comporta: se só cresce, se sobe e desce, se é a leitura de um momento ou uma distribuição de valores. Quem consulta depende dessa informação para agregar do jeito certo. No OpenTelemetry e no .NET (`System.Diagnostics.Metrics`), são quatro famílias, e cada uma responde a uma pergunta.",
                    },
                    {
                        type: "text",
                        value: "## Counter: quantas vezes aconteceu\n\nO **Counter** só cresce: a cada evento, você soma. Pedidos criados, requisições recebidas, bytes enviados, pagamentos recusados. O valor bruto, acumulado desde que o processo subiu, quase nunca interessa. O que interessa é a **taxa** (\"pedidos por segundo nos últimos 5 minutos\"), e quem calcula a taxa é o backend, na hora da consulta. Por isso a aplicação não faz a conta por minuto que abriu esta aula: ela só soma, e a pergunta fica livre para qualquer janela.\n\nO .NET não impede `Add` com valor negativo num `Counter<T>`. A especificação do OpenTelemetry deixa essa validação para cada implementação, e o SDK do .NET, na versão 1.20, soma o negativo sem reclamar: `Add(5)` seguido de `Add(-2)` exportou 3. O problema aparece do outro lado: um contador que diminui parece, para o Prometheus, um processo que reiniciou e voltou a zero, e a taxa calculada mostra um crescimento que não existiu. Se o valor desce, o instrumento certo é outro.\n\nNo exemplo abaixo, os quatro instrumentos saem do mesmo `Meter`, que a classe recebe pronto; de onde ele vem numa aplicação ASP.NET Core fica para a aula sobre métricas no .NET.",
                    },
                    {
                        type: "code",
                        value: "// MetricasDaLoja.cs: um instrumento para cada pergunta\nusing System.Diagnostics.Metrics;\n\npublic sealed class MetricasDaLoja\n{\n    private readonly Counter<long> _pedidosCriados;\n    private readonly UpDownCounter<int> _pedidosEmProcessamento;\n    private readonly Gauge<double> _cotacaoDolar;\n    private readonly Histogram<double> _duracaoPedido;\n\n    public MetricasDaLoja(Meter meter)\n    {\n        // Quantos pedidos foram criados? Só cresce.\n        _pedidosCriados = meter.CreateCounter<long>(\"loja.pedidos.criados\", unit: \"{pedido}\");\n\n        // Quantos estão em processamento agora? Sobe e desce, e a soma das instâncias faz sentido.\n        _pedidosEmProcessamento = meter.CreateUpDownCounter<int>(\n            \"loja.pedidos.em_processamento\", unit: \"{pedido}\");\n\n        // Qual cotação está valendo? Valor atual, e somar instâncias não faz sentido.\n        _cotacaoDolar = meter.CreateGauge<double>(\"loja.cambio.cotacao\", unit: \"{BRL}\");\n\n        // Quanto tempo leva um pedido? Distribuição, para tirar percentis.\n        // Os buckets vão em segundos; sem a sugestão, o SDK usa buckets pensados para milissegundos.\n        _duracaoPedido = meter.CreateHistogram<double>(\"loja.pedidos.duracao\", unit: \"s\",\n            advice: new InstrumentAdvice<double> { HistogramBucketBoundaries = [0.05, 0.1, 0.25, 0.5, 1, 2.5] });\n    }\n\n    public void PedidoEntrou() => _pedidosEmProcessamento.Add(1);\n\n    public void PedidoSaiu(TimeSpan duracao, bool criado)\n    {\n        _pedidosEmProcessamento.Add(-1);\n        _duracaoPedido.Record(duracao.TotalSeconds);\n        if (criado)\n        {\n            _pedidosCriados.Add(1);\n        }\n    }\n\n    public void CotacaoAtualizada(double valor) => _cotacaoDolar.Record(valor);\n}",
                    },
                    {
                        type: "text",
                        value: "## UpDownCounter e Gauge: o valor agora\n\nOs dois representam um valor que sobe e desce, e no Prometheus os dois viram o mesmo tipo, gauge. A diferença está em como você registra e no que a soma significa.\n\nO **UpDownCounter** recebe variações: `Add(1)` quando o pedido entra em processamento, `Add(-1)` quando sai. Ele é **aditivo**: somar as séries das quatro instâncias dá o total de pedidos em processamento no sistema, e esse total faz sentido. Requisições em andamento, conexões abertas e itens numa fila em memória entram aqui.\n\nO **Gauge** recebe o valor atual com `Record`: a cotação que a instância acabou de buscar, o uso de CPU, a leitura de um sensor. Ele **não é aditivo**: se as quatro instâncias usam a mesma cotação de 5,42, a soma dá 21,68, um número sem significado. Nesse caso, o que faz sentido é média, máximo ou o valor de uma instância. O `Gauge<T>` síncrono só existe a partir do .NET 9; antes, o caminho era o `ObservableGauge<T>`, que aparece mais adiante nesta aula.",
                    },
                    {
                        type: "text",
                        value: "## Histogram: como os valores se distribuem\n\nDuração de requisição, tamanho de mensagem, quantidade de itens por pedido: quando cada evento traz um valor e a pergunta é sobre a distribuição deles, o instrumento é o **Histogram**. Ele não guarda cada medição. Guarda quantas caíram em cada faixa de valores (os **buckets**), mais a soma e a contagem. Com isso o backend responde três perguntas: quantas por segundo (pela contagem), qual a média (soma dividida pela contagem) e quais os percentis (pelos buckets).\n\nA média sozinha engana. Imagine 100 requisições: 95 levam 50 ms e 5 levam 5 segundos. A média dá cerca de 298 ms, um tempo que nenhuma requisição levou; a mediana diz 50 ms; e o p99 mostra os 5 segundos que 1 cliente em cada 20 esperou. Muita gente mede latência com um gauge \"duração da última requisição\": só a última antes de cada coleta aparece, e as outras milhares somem. Outros usam um counter com o total de milissegundos, que só entrega a média. Latência é histograma.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pergunta\",\"Instrumento\",\"Exemplos\",\"No Prometheus\"],[\"Quantas vezes aconteceu, e a que taxa?\",\"Counter\",\"pedidos criados, erros, bytes enviados\",\"counter com sufixo `_total`, lido com `rate`\"],[\"Quantos existem agora, se a soma das instâncias faz sentido?\",\"UpDownCounter\",\"requisições em andamento, conexões abertas\",\"gauge\"],[\"Qual é o valor atual, se somar não faz sentido?\",\"Gauge\",\"cotação, uso de CPU, idade de um cache\",\"gauge\"],[\"Como os valores se distribuem?\",\"Histogram\",\"duração, tamanho de corpo, itens por pedido\",\"séries `_bucket`, `_sum` e `_count`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Síncrono ou observável\n\nOs instrumentos acima são **síncronos**: seu código chama `Add` ou `Record` no momento em que o evento acontece. Três deles têm uma versão **observável** (`ObservableCounter<T>`, `ObservableUpDownCounter<T>` e `ObservableGauge<T>`), em que você entrega uma função e o SDK a chama a cada coleta. Ela serve quando o valor já existe em algum lugar e só precisa ser lido: o tamanho de uma fila em memória, o tempo desde a última sincronização, o tempo de CPU que o sistema operacional já contabiliza.\n\nA função roda na thread da coleta, a cada exportação, e precisa ser rápida e segura para leitura concorrente (no exemplo abaixo, o horário da última sincronização é lido com `Interlocked`). Um erro comum é consultar o banco dentro dela: a coleta espera a consulta terminar, e a lentidão do banco atrasa a exportação de todas as métricas do processo.",
                    },
                    {
                        type: "code",
                        value: "// SincronizacaoDeEstoque.cs: instrumentos observáveis, lidos pelo SDK a cada coleta\nusing System.Diagnostics;\nusing System.Diagnostics.Metrics;\nusing System.Threading.Channels;\n\npublic sealed class SincronizacaoDeEstoque\n{\n    private readonly Channel<AjusteDeEstoque> _pendentes = Channel.CreateBounded<AjusteDeEstoque>(10_000);\n    private long _ultimaSincronizacao = Stopwatch.GetTimestamp();\n\n    public SincronizacaoDeEstoque(Meter meter)\n    {\n        // Quantos ajustes esperam envio ao ERP? A soma das instâncias é o total pendente.\n        meter.CreateObservableUpDownCounter(\"loja.estoque.ajustes_pendentes\",\n            () => _pendentes.Reader.Count, unit: \"{ajuste}\");\n\n        // Há quanto tempo o estoque não sincroniza? Somar instâncias não faz sentido.\n        meter.CreateObservableGauge(\"loja.estoque.sincronizacao.idade\",\n            () => Stopwatch.GetElapsedTime(Interlocked.Read(ref _ultimaSincronizacao)).TotalSeconds,\n            unit: \"s\");\n    }\n\n    public ValueTask EnfileirarAsync(AjusteDeEstoque ajuste) => _pendentes.Writer.WriteAsync(ajuste);\n\n    public void Sincronizou() => Interlocked.Exchange(ref _ultimaSincronizacao, Stopwatch.GetTimestamp());\n}\n\npublic record AjusteDeEstoque(string Sku, int Quantidade);",
                    },
                    {
                        type: "quote",
                        value: "Escolha o instrumento pela pergunta: Counter para quantas vezes, UpDownCounter para quantos agora quando a soma faz sentido, Gauge para o valor atual que não se soma e Histogram para a distribuição. A aplicação registra o fato; a taxa, a média e o percentil saem da consulta.",
                    },
                ],
                questions: [
                    {
                        statement: "A loja quer acompanhar quantos pedidos são criados por segundo, somando as quatro instâncias da API. Que registro, feito na aplicação, permite responder isso?",
                        difficulty: "facil",
                        options: [
                            { text: "Um `Gauge<int>` que recebe, a cada minuto, quantos pedidos a instância criou no minuto", isCorrect: false },
                            { text: "Um `UpDownCounter<int>` com `Add(1)` a cada pedido e um `Add` negativo a cada minuto", isCorrect: false },
                            { text: "Um `Histogram<int>` que registra, a cada minuto, o total de pedidos da instância", isCorrect: false },
                            { text: "Um `Counter<long>` com `Add(1)` a cada pedido criado, e a taxa calculada na consulta", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Você quer saber quantas requisições estão sendo processadas neste instante, e o total do sistema deve ser a soma das instâncias. Que instrumento combina com essa pergunta?",
                        difficulty: "facil",
                        options: [
                            { text: "`UpDownCounter<int>`, com `Add(1)` na entrada e `Add(-1)` na saída da requisição", isCorrect: true },
                            { text: "`Counter<long>`, com `Add(1)` na entrada e `Add(-1)` na saída da requisição", isCorrect: false },
                            { text: "`Gauge<int>`, com `Record(1)` na entrada e `Record(0)` na saída da requisição", isCorrect: false },
                            { text: "`Histogram<int>`, registrando o valor 1 na entrada e o valor 0 na saída da requisição", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A média de latência da API está em 120 ms, mas os clientes reclamam de lentidão. Que forma de medir permite descobrir quanto esperam os 1% mais lentos?",
                        difficulty: "medio",
                        options: [
                            { text: "Um `Counter<double>` com a soma das durações, dividido pela contagem total", isCorrect: false },
                            { text: "Um `UpDownCounter<double>` que soma a duração e a subtrai no fim do minuto", isCorrect: false },
                            { text: "Um `Histogram<double>` com a duração de cada requisição, de onde sai o p99", isCorrect: true },
                            { text: "Um `Gauge<double>` com a duração da última requisição, lido a cada coleta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Cada uma das quatro instâncias busca a cotação do dólar a cada minuto e publica o valor em uso. Um colega propõe um `UpDownCounter<double>`, somando a diferença entre a cotação nova e a anterior. Por que `Gauge<double>` é a escolha certa?",
                        difficulty: "medio",
                        options: [
                            { text: "O `UpDownCounter<double>` não existe: esse instrumento só aceita os tipos `int` e `long`", isCorrect: false },
                            { text: "Só o `Gauge<double>` preserva as casas decimais quando a métrica sai do processo por OTLP", isCorrect: false },
                            { text: "O `UpDownCounter` exige uma função de callback e não aceita registrar valores direto", isCorrect: false },
                            { text: "A cotação não é aditiva: somar as séries das quatro instâncias dá um valor sem sentido", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um desenvolvedor usa um `Counter<long>` para os itens nos carrinhos abertos: `Add(1)` quando um item entra e `Add(-1)` quando sai. O SDK do .NET aceita o negativo, então o valor exportado sobe e desce, sempre como contador, com `_total`. O que acontece quando o painel aplica `rate` ou `increase` sobre essa série?",
                        difficulty: "dificil",
                        options: [
                            { text: "O Prometheus recusa a amostra menor que a anterior e mantém o maior valor que já recebeu da série", isCorrect: false },
                            { text: "Cada queda é lida como reinício do contador, e o resultado mostra aumentos que nunca aconteceram", isCorrect: true },
                            { text: "Nada muda no resultado, porque `rate` e `increase` usam só o primeiro e o último ponto da janela", isCorrect: false },
                            { text: "As quedas viram taxa negativa, e o painel mostra a saída de itens como valores abaixo de zero", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Métricas no .NET",
                blocks: [
                    {
                        type: "text",
                        value: "# Métricas no .NET\n\nVocê cria um contador, faz o deploy, gera alguns pedidos e abre o Prometheus: nada. O código chama `Add(1)`, nenhum erro aparece, e a métrica simplesmente não existe. É o tropeço mais comum de quem começa, e ele vem de não saber quem faz o quê.\n\nNo .NET, a **API** de métricas está no próprio runtime, em `System.Diagnostics.Metrics`: `Meter`, `Counter<T>`, `Histogram<T>` e os outros instrumentos. Ela não depende do OpenTelemetry, assim como o `ILogger` não depende de onde o log vai parar. Registrar uma medição sem ninguém ouvindo custa quase nada e não vai a lugar nenhum. Quem ouve é um **listener**: o SDK do OpenTelemetry, a ferramenta `dotnet-counters`, um teste. O SDK só ouve os meters que você mandar ouvir, agrega as medições e exporta. A métrica que não aparece quase sempre é um meter que ninguém mandou ouvir.",
                    },
                    {
                        type: "text",
                        value: "## Meter, IMeterFactory e onde criar os instrumentos\n\nO **Meter** agrupa os instrumentos de um componente e tem um nome, que é o que o SDK usa para escolher o que ouvir: `Loja.Pedidos`, `Loja.Pagamentos`. Numa aplicação ASP.NET Core, crie o meter pela **`IMeterFactory`**, que o host já registra na injeção de dependência. O meter fica ligado ao contêiner de DI e é descartado junto com ele, e cada teste com o próprio contêiner ganha meters isolados, sem medições vazando de um teste para outro.\n\nO padrão é uma classe registrada como singleton que cria os instrumentos uma vez, no construtor, e expõe métodos com nome de negócio. O endpoint chama `metricas.PedidoCriado(...)` e não sabe nada de instrumento, unidade ou tag. Criar o instrumento dentro do handler, a cada requisição, é um desperdício que se repete milhares de vezes por minuto.",
                    },
                    {
                        type: "code",
                        value: "// PedidoMetricas.cs: instrumentos criados uma vez, numa classe singleton\nusing System.Diagnostics;\nusing System.Diagnostics.Metrics;\n\npublic sealed class PedidoMetricas\n{\n    public const string NomeDoMeter = \"Loja.Pedidos\";\n\n    private readonly Counter<long> _criados;\n    private readonly Histogram<double> _duracao;\n\n    public PedidoMetricas(IMeterFactory meterFactory)\n    {\n        var meter = meterFactory.Create(NomeDoMeter);\n\n        _criados = meter.CreateCounter<long>(\n            \"loja.pedidos.criados\",\n            unit: \"{pedido}\",\n            description: \"Pedidos criados com sucesso\");\n\n        _duracao = meter.CreateHistogram<double>(\n            \"loja.pedidos.duracao\",\n            unit: \"s\",\n            description: \"Tempo para processar um pedido\",\n            tags: null,\n            advice: new InstrumentAdvice<double>\n            {\n                HistogramBucketBoundaries = [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]\n            });\n    }\n\n    public void PedidoCriado(string canal, string formaDePagamento)\n    {\n        var tags = new TagList\n        {\n            { \"loja.canal\", CanalConhecido(canal) },\n            { \"loja.pagamento.forma\", formaDePagamento is \"pix\" or \"cartao\" or \"boleto\" ? formaDePagamento : \"outra\" }\n        };\n        _criados.Add(1, tags);\n    }\n\n    public void Processado(TimeSpan duracao, string canal) =>\n        _duracao.Record(duracao.TotalSeconds, new KeyValuePair<string, object?>(\"loja.canal\", CanalConhecido(canal)));\n\n    // o canal vem do corpo da requisição: texto livre virando tag criaria uma série por valor inventado\n    private static string CanalConhecido(string canal) => canal is \"app\" or \"site\" ? canal : \"outro\";\n}",
                    },
                    {
                        type: "text",
                        value: "## Nome, unidade e tags\n\nSiga o estilo das semantic conventions do OpenTelemetry: nome em minúsculas, com pontos separando os níveis (`loja.pedidos.criados`), e a unidade no parâmetro `unit`, no padrão UCUM: `s` para segundos, `By` para bytes e chaves para contagens (`{pedido}`). Duração vai em **segundos**, como `double`. Não coloque a unidade nem `_total` no nome: quem traduz para o Prometheus acrescenta os sufixos sozinho, como você vai ver no fim desta aula. O `advice` do histograma sugere os buckets em segundos; o motivo fica claro quando o módulo chegar às métricas prontas.\n\nAs **tags** (no OpenTelemetry, atributos) quebram a métrica em séries: `loja.canal` com 3 valores e `loja.pagamento.forma` com 4 dão até 12 séries do contador. Passe as tags como `KeyValuePair<string, object?>` ou monte um `TagList`, um struct que guarda até 8 tags sem alocar no heap. Cada combinação nova de valores é uma série nova, por isso tag boa tem poucos valores possíveis e conhecidos. Repare que a classe só deixa passar valores esperados: o canal chega no corpo da requisição, e se o texto do cliente virasse tag, cada valor inventado criaria uma série. Id de pedido, e-mail ou URL com o id dentro multiplicam as séries sem limite: esse dado pertence ao log ou ao trace, como você viu ao estudar cardinalidade.",
                    },
                    {
                        type: "text",
                        value: "## Ligar o SDK e exportar por OTLP\n\nNo `Program.cs`, o SDK entra com `AddOpenTelemetry()`. O `AddService` define o `service.name`, e o `AddMeter` diz quais meters ouvir (aceita curinga, como `Loja.*`). Sem o `AddMeter`, ou com o nome escrito diferente (`Loja.Pedido` em vez de `Loja.Pedidos`), o SDK ignora o meter em silêncio: é a métrica sumida da abertura desta aula.\n\nO exportador OTLP, sem configuração, manda por gRPC para `localhost:4317`, a porta do Collector. Para mandar direto ao Prometheus 3, ligue nele o receptor OTLP com a flag `--web.enable-otlp-receiver` (ele vem desligado porque não tem autenticação própria) e aponte o exportador para `/api/v1/otlp/v1/metrics`, com HTTP/protobuf. Com o endpoint no código e HTTP/protobuf, a URL vai **completa**: num teste, apontar só para `/api/v1/otlp` rendeu 404 e nenhuma métrica. A exportação é periódica, a cada 60 segundos por padrão; no laboratório, 10 segundos deixam o retorno mais rápido.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: métricas da aplicação saindo por OTLP\nusing System.Diagnostics;\nusing OpenTelemetry.Exporter;\nusing OpenTelemetry.Metrics;\nusing OpenTelemetry.Resources;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddSingleton<PedidoMetricas>();\n\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"loja-api\"))\n    .WithMetrics(m => m\n        .AddMeter(PedidoMetricas.NomeDoMeter)\n        .AddOtlpExporter((exportador, leitor) =>\n        {\n            // direto no receptor OTLP do Prometheus: URL completa e HTTP/protobuf\n            exportador.Endpoint = new Uri(\"http://localhost:9090/api/v1/otlp/v1/metrics\");\n            exportador.Protocol = OtlpExportProtocol.HttpProtobuf;\n            leitor.PeriodicExportingMetricReaderOptions.ExportIntervalMilliseconds = 10_000;\n        }));\n\nvar app = builder.Build();\n\napp.MapPost(\"/pedidos\", async (NovoPedido pedido, PedidoMetricas metricas) =>\n{\n    var inicio = Stopwatch.GetTimestamp();\n    await Task.Delay(Random.Shared.Next(20, 300)); // simula a gravação do pedido\n    metricas.PedidoCriado(pedido.Canal, pedido.FormaDePagamento);\n    metricas.Processado(Stopwatch.GetElapsedTime(inicio), pedido.Canal);\n    return TypedResults.Created($\"/pedidos/{pedido.Id}\");\n});\n\napp.Run();\n\npublic record NovoPedido(Guid Id, string Canal, string FormaDePagamento);",
                    },
                    {
                        type: "code",
                        value: "# terminal: com AddOtlpExporter() sem configuração no código, as variáveis decidem o destino\nexport OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:9090/api/v1/otlp\nexport OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf\nexport OTEL_METRIC_EXPORT_INTERVAL=10000\n\n# OTEL_EXPORTER_OTLP_ENDPOINT é a base: o SDK acrescenta /v1/metrics sozinho.\n# OTEL_EXPORTER_OTLP_METRICS_ENDPOINT só vale com UseOtlpExporter(); o AddOtlpExporter() ignora.",
                    },
                    {
                        type: "text",
                        value: "## O nome que chega no Prometheus\n\nO Prometheus não guarda o nome do OpenTelemetry como está. No Prometheus 3 (conferido na versão 3.13, em outubro de 2026), o receptor OTLP usa por padrão a estratégia de tradução `UnderscoreEscapingWithSuffixes`: troca pontos por sublinhado, acrescenta a unidade por extenso e, no contador, o `_total`. Unidade entre chaves, como `{pedido}`, é só anotação e some. Quando a métrica passa pelo Collector e chega ao Prometheus por OTLP, como no laboratório, o resultado é o mesmo, porque quem traduz é o receptor do Prometheus. O `service.name` vira o rótulo `job`, o `service.instance.id` vira `instance`, e os demais atributos do resource ficam numa série à parte, a `target_info`.\n\nExistem outras estratégias, escolhidas em `otlp.translation_strategy` no `prometheus.yml`: `NoUTF8EscapingWithSuffixes` mantém os pontos (o Prometheus 3 aceita UTF-8 em nomes, mas a consulta passa a exigir aspas) e `UnderscoreEscapingWithoutSuffixes` não acrescenta sufixos. Antes de escrever consultas, confira qual está valendo, porque a mesma métrica muda de nome entre elas.",
                    },
                    {
                        type: "table",
                        value: "[[\"No código\",\"Instrumento\",\"No Prometheus, com a estratégia padrão\"],[\"`loja.pedidos.criados`, unidade `{pedido}`\",\"Counter\",\"`loja_pedidos_criados_total`\"],[\"`loja.pedidos.em_processamento`, unidade `{pedido}`\",\"UpDownCounter\",\"`loja_pedidos_em_processamento`\"],[\"`loja.pedidos.duracao`, unidade `s`\",\"Histogram\",\"`loja_pedidos_duracao_seconds_bucket`, `_sum` e `_count`\"],[\"`dotnet.process.memory.working_set`, unidade `By`\",\"ObservableUpDownCounter\",\"`dotnet_process_memory_working_set_bytes`\"],[\"`loja.estoque.ocupacao`, unidade `1`\",\"Gauge\",\"`loja_estoque_ocupacao_ratio`\"]]",
                    },
                    {
                        type: "quote",
                        value: "A API de métricas é do .NET e o destino é configuração: crie os instrumentos uma vez com `IMeterFactory`, mande o SDK ouvir o meter com `AddMeter` e lembre que o nome consultado no Prometheus é a tradução do nome do código, com sublinhados, unidade e `_total`.",
                    },
                ],
                questions: [
                    {
                        statement: "A API registra pedidos num `Counter<long>` criado no meter `Loja.Pedidos`. O SDK do OpenTelemetry está configurado com `AddAspNetCoreInstrumentation()` e `AddOtlpExporter()`, as métricas HTTP chegam ao Prometheus, mas a de pedidos nunca aparece. Qual é a causa mais provável?",
                        difficulty: "facil",
                        options: [
                            { text: "O meter precisa ser `static`, porque o SDK só encontra campos estáticos", isCorrect: false },
                            { text: "O contador precisa de ao menos uma tag, porque série sem rótulo é descartada", isCorrect: false },
                            { text: "Falta `AddMeter(\"Loja.Pedidos\")`: o SDK só ouve os meters que você nomeia", isCorrect: true },
                            { text: "Falta chamar `Flush()` no contador depois de cada `Add` para enviar a medição", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Seguindo as semantic conventions, qual é a declaração certa para o histograma do tempo de processamento de um pedido?",
                        difficulty: "facil",
                        options: [
                            { text: "`CreateHistogram<long>(\"loja.pedidos.duracao.ms\", unit: null)`, registrando milissegundos", isCorrect: false },
                            { text: "`CreateHistogram<double>(\"loja_pedidos_duracao_seconds\", unit: \"s\")`, registrando segundos", isCorrect: false },
                            { text: "`CreateHistogram<double>(\"loja.pedidos.duracao\", unit: \"s\")`, registrando em segundos", isCorrect: true },
                            { text: "`CreateHistogram<long>(\"LojaPedidosDuracao\", unit: \"ms\")`, registrando milissegundos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um `Counter<long>` chamado `loja.pedidos.criados`, com unidade `{pedido}`, é exportado por OTLP para um Prometheus 3 com a configuração padrão. Qual nome você usa na consulta?",
                        difficulty: "medio",
                        options: [
                            { text: "`loja.pedidos.criados_total`", isCorrect: false },
                            { text: "`loja_pedidos_criados_pedido_total`", isCorrect: false },
                            { text: "`loja_pedidos_criados_total`", isCorrect: true },
                            { text: "`loja_pedidos_criados`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O exportador está configurado no código com `Protocol = OtlpExportProtocol.HttpProtobuf` e `Endpoint = new Uri(\"http://prometheus:9090/api/v1/otlp\")`. O receptor OTLP do Prometheus está ligado, mas nenhuma métrica chega. O que corrigir?",
                        difficulty: "medio",
                        options: [
                            { text: "Acrescentar `/metrics` ao fim da URL, que é o caminho de coleta do Prometheus", isCorrect: false },
                            { text: "Usar a URL completa no código, com `/api/v1/otlp/v1/metrics` no final dela", isCorrect: true },
                            { text: "Usar a porta 4318, que é a porta HTTP padrão do receptor do Prometheus", isCorrect: false },
                            { text: "Trocar o protocolo para gRPC, que é o protocolo do receptor do Prometheus", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A aplicação define no resource `service.name = loja-api` e `deployment.environment.name = producao`, e exporta por OTLP para um Prometheus 3 sem nenhuma configuração extra na seção `otlp`. Onde está o ambiente na hora de consultar?",
                        difficulty: "dificil",
                        options: [
                            { text: "No rótulo `deployment_environment_name`, presente em toda série da aplicação", isCorrect: false },
                            { text: "No rótulo `job`, que vira `producao/loja-api` em toda série da aplicação", isCorrect: false },
                            { text: "Na série `target_info`, ligada às métricas pelos rótulos `job` e `instance`", isCorrect: true },
                            { text: "Em lugar nenhum, porque o receptor descarta atributos fora de `service.*`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Prometheus e PromQL",
                blocks: [
                    {
                        type: "text",
                        value: "# Prometheus e PromQL\n\nLogo depois do deploy das 15h, alguém abre o Prometheus, digita `loja_pedidos_criados_total` e vê a linha despencar para perto de zero. O time se assusta: as vendas pararam? Não pararam. O contador é o acumulado desde que **cada processo** subiu, e o deploy trocou os processos. A linha que sobe sem parar até o deploy e recomeça do zero depois não diz nada sobre vendas. A pergunta certa é \"quantos pedidos por segundo agora\", e ela se responde com uma função, não com o valor bruto.\n\nO Prometheus guarda **séries temporais**. Uma série é um nome de métrica com um conjunto de rótulos, como `loja_pedidos_criados_total{job=\"loja-api\", loja_canal=\"app\"}`, e cada amostra é um par de horário e valor. As amostras chegam por scrape (o Prometheus busca o `/metrics` da aplicação em intervalos fixos) ou por push OTLP, como na aplicação que você configurou. No .NET, o exportador de pull do OpenTelemetry para ASP.NET Core ainda estava em beta em outubro de 2026 (versão 1.20.0-beta.1), e por isso o caminho deste estudo é o push. A interface fica na porta 9090, e a linguagem de consulta é a **PromQL**.",
                    },
                    {
                        type: "text",
                        value: "## Seletores e janelas\n\nUm **seletor** escolhe séries pelo nome e pelos rótulos: `loja_pedidos_criados_total{loja_canal=\"app\"}`. Os operadores de rótulo são `=`, `!=`, `=~` e `!~`, os dois últimos com expressão regular, como em `http_response_status_code=~\"5..\"` para qualquer 5xx. O resultado é um **vetor instantâneo**: o valor mais recente de cada série.\n\nCom uma janela entre colchetes, como `[5m]`, o seletor vira um **vetor de intervalo**: todas as amostras dos últimos 5 minutos de cada série. Vetor de intervalo não vira gráfico sozinho; ele é a entrada das funções que olham para o tempo, como `rate`.",
                    },
                    {
                        type: "code",
                        value: "# PromQL: o acumulado desde que cada processo subiu (quase nunca é o que você quer)\nloja_pedidos_criados_total\n\n# pedidos por segundo, média dos últimos 5 minutos, uma série por instância e canal\nrate(loja_pedidos_criados_total[5m])\n\n# quantos pedidos na última hora (a taxa vezes os segundos da janela)\nincrease(loja_pedidos_criados_total[1h])\n\n# pedidos por segundo somando as instâncias, um resultado por canal\nsum by (loja_canal) (rate(loja_pedidos_criados_total[5m]))",
                    },
                    {
                        type: "text",
                        value: "## rate: do contador para a taxa\n\n`rate` calcula a **taxa média por segundo** com que o contador cresceu dentro da janela. Ela trata reinícios: quando o valor cai, a função entende que o processo recomeçou do zero e continua a conta, e por isso o deploy da abertura não aparece na taxa. Ela também extrapola até as bordas da janela, e é por isso que `increase` (a `rate` multiplicada pelos segundos da janela) pode devolver 550,9 pedidos com o contador só somando inteiros. Já `irate` usa só as duas últimas amostras: reage a picos curtos e serve para gráficos de detalhe, mas oscila demais para mostrar tendência.\n\nA janela precisa conter pelo menos duas amostras. Num teste com exportação OTLP a cada 5 segundos, `rate(...[5s])` voltou vazio, e com `[10s]` já respondeu. A regra prática é usar janela de pelo menos quatro vezes o intervalo de coleta ou de exportação: com o padrão de 60 segundos do SDK, `[5m]` é o mínimo confortável.",
                    },
                    {
                        type: "text",
                        value: "## Primeiro a taxa, depois a soma\n\n`sum`, `avg`, `max` e `count` agregam séries, e `by` diz quais rótulos sobrevivem: `sum by (loja_canal) (...)` devolve uma série por canal, somando todas as instâncias. `without` faz o contrário e diz qual rótulo sai, como em `sum without (instance) (...)`.\n\nA ordem importa: **primeiro `rate`, depois `sum`**. A taxa precisa ver cada série sozinha para perceber o reinício de uma instância; se as séries fossem somadas antes, a queda de uma delas viraria uma queda da soma, e a correção de reinício daria números errados. A própria sintaxe ajuda: `rate(sum(loja_pedidos_criados_total)[5m])` nem é aceita, e o Prometheus responde \"ranges only allowed for vector selectors\". A forma certa é `sum(rate(loja_pedidos_criados_total[5m]))`.",
                    },
                    {
                        type: "text",
                        value: "## histogram_quantile\n\nOs buckets de um histograma chegam como contadores cumulativos com o rótulo `le` (menor ou igual): o bucket `le=\"0.25\"` conta todas as medições de até 0,25 segundo. A função `histogram_quantile` recebe a taxa desses buckets e estima o percentil. Para isso ela precisa do `le`, que diz qual série é qual bucket: se o `le` não estiver no `by` da agregação, o resultado vem vazio, com um aviso de que falta o rótulo.\n\nO valor é uma **estimativa**. A função acha o bucket em que o percentil cai e faz interpolação linear dentro dele, como se os valores estivessem espalhados por igual. Num teste com pedidos entre 10 e 400 ms, o p95 saiu 0,46 s: o percentil caiu no bucket de 0,25 a 0,5, e a interpolação não tem como saber que nenhum pedido passou de 0,4. Quanto mais estreitos os buckets perto dos valores que importam, melhor a estimativa.",
                    },
                    {
                        type: "code",
                        value: "# PromQL: p95 da duração dos pedidos, todas as instâncias juntas\nhistogram_quantile(0.95, sum by (le) (rate(loja_pedidos_duracao_seconds_bucket[5m])))\n\n# p95 por canal: o le continua no by\nhistogram_quantile(0.95, sum by (le, loja_canal) (rate(loja_pedidos_duracao_seconds_bucket[5m])))\n\n# duração média: soma das durações dividida pela contagem\nsum(rate(loja_pedidos_duracao_seconds_sum[5m])) / sum(rate(loja_pedidos_duracao_seconds_count[5m]))",
                    },
                    {
                        type: "table",
                        value: "[[\"Consulta\",\"O que acontece\",\"Em vez disso\"],[\"`loja_pedidos_criados_total` num gráfico\",\"mostra o acumulado, que recomeça a cada deploy\",\"`rate(loja_pedidos_criados_total[5m])`\"],[\"`rate(sum(loja_pedidos_criados_total)[5m])`\",\"erro de sintaxe\",\"`sum(rate(loja_pedidos_criados_total[5m]))`\"],[\"`rate(loja_pedidos_em_processamento[5m])`\",\"`rate` num gauge: aviso \\\"metric might not be a counter\\\" e número sem sentido\",\"o gauge direto, ou `max_over_time(loja_pedidos_em_processamento[5m])`\"],[\"`histogram_quantile(0.95, sum by (loja_canal) (rate(loja_pedidos_duracao_seconds_bucket[5m])))`\",\"vazio, porque o `le` sumiu\",\"`sum by (le, loja_canal)`\"],[\"média dos p95 de cada instância\",\"média de percentis não é percentil\",\"somar os buckets e calcular uma vez\"],[\"`rate(loja_pedidos_criados_total[5s])` com exportação a cada 5 segundos\",\"vazio ou instável\",\"janela de pelo menos 4 vezes o intervalo\"]]",
                    },
                    {
                        type: "quote",
                        value: "O valor bruto de um contador só diz há quanto tempo o processo está de pé; a informação está na taxa. Em PromQL, aplique `rate` em cada série, agregue depois com `sum by` e, no histograma, mantenha o `le` até o `histogram_quantile`.",
                    },
                ],
                questions: [
                    {
                        statement: "O painel mostra `loja_pedidos_criados_total` subindo o dia todo e caindo para perto de zero a cada deploy. Qual consulta mostra os pedidos por segundo, sem esse efeito de reinício?",
                        difficulty: "facil",
                        options: [
                            { text: "`loja_pedidos_criados_total / 300`", isCorrect: false },
                            { text: "`delta(loja_pedidos_criados_total[5m])`", isCorrect: false },
                            { text: "`deriv(loja_pedidos_criados_total[5m])`", isCorrect: false },
                            { text: "`rate(loja_pedidos_criados_total[5m])`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que a consulta `sum by (loja_canal) (rate(loja_pedidos_criados_total[5m]))` devolve?",
                        difficulty: "facil",
                        options: [
                            { text: "Uma série por instância, com o rótulo `loja_canal` retirado", isCorrect: false },
                            { text: "Só as séries que têm `loja_canal`, cada uma com a própria taxa", isCorrect: false },
                            { text: "Uma série por canal, somando a taxa de todas as instâncias", isCorrect: true },
                            { text: "Uma série só com o total, ordenada pelo valor de `loja_canal`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para ter o p95 por rota, alguém escreveu `histogram_quantile(0.95, sum by (http_route) (rate(http_server_request_duration_seconds_bucket[5m])))`, e o resultado veio vazio. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "A função não aceita entrada agregada e espera os buckets crus de cada série", isCorrect: false },
                            { text: "A série certa é `http_server_request_duration_seconds`, sem o `_bucket`", isCorrect: false },
                            { text: "A janela de 5 minutos é curta demais para estimar percentil por buckets", isCorrect: false },
                            { text: "O `sum by` tirou o rótulo `le`, que diz à função o limite de cada bucket", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Você quer pedidos por segundo somando as três instâncias da API. Qual consulta está certa?",
                        difficulty: "medio",
                        options: [
                            { text: "`rate(sum(loja_pedidos_criados_total)[5m])`", isCorrect: false },
                            { text: "`sum(rate(loja_pedidos_criados_total[5m]))`", isCorrect: true },
                            { text: "`rate(loja_pedidos_criados_total[5m]) * 3`", isCorrect: false },
                            { text: "`sum(loja_pedidos_criados_total[5m]) / 300`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API roda em três instâncias. Para o p99 do serviço, um colega usa `avg(histogram_quantile(0.99, sum by (le, instance) (rate(http_server_request_duration_seconds_bucket[5m]))))`. Qual é o problema?",
                        difficulty: "dificil",
                        options: [
                            { text: "Basta trocar `avg` por `max`, porque o maior p99 entre as instâncias é o p99 do serviço", isCorrect: false },
                            { text: "A função não aceita `instance` no `by`, e o resultado volta vazio para todas as três instâncias", isCorrect: false },
                            { text: "Média de percentis não é o percentil do todo; some os buckets das instâncias e calcule uma vez", isCorrect: true },
                            { text: "Nenhum, desde que as três instâncias recebam exatamente a mesma quantidade de requisições por segundo", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "RED e USE",
                blocks: [
                    {
                        type: "text",
                        value: "# RED e USE\n\nUm serviço novo entra em produção com 40 métricas criadas \"para garantir\" e um painel de 30 gráficos. Na primeira madrugada de incidente, ninguém sabe por onde começar: cada gráfico tem uma linha que parece estranha, e nenhum responde se o cliente está sendo afetado. Medir tudo não é o mesmo que saber o que olhar.\n\nDois métodos curtos resolvem o ponto de partida. O **RED**, proposto por Tom Wilkie, olha o serviço pelo lado de quem chama: **R**ate (taxa de requisições), **E**rrors (erros) e **D**uration (duração). O **USE**, de Brendan Gregg, olha cada recurso por dentro: **U**tilization (utilização), **S**aturation (saturação) e **E**rrors (erros). Os quatro sinais de ouro do livro de SRE do Google (latência, tráfego, erros e saturação) cobrem o mesmo terreno com outros nomes. O RED diz se o serviço está bem; o USE ajuda a achar o recurso que explica quando não está.",
                    },
                    {
                        type: "text",
                        value: "## RED a partir de um histograma\n\nNum serviço HTTP em ASP.NET Core, as três letras saem de uma única métrica pronta, `http.server.request.duration`, que no Prometheus vira `http_server_request_duration_seconds`. A contagem (`_count`) dá a taxa; a contagem filtrada pelos status 5xx dá os erros; os buckets dão a duração. Não é preciso criar contador de requisições nem de erros: o histograma já conta tudo.\n\nO que conta como erro pede uma decisão. **5xx** é falha do serviço e entra. **4xx** em geral é o cliente pedindo algo inválido ou inexistente, e misturar isso na taxa de erro faz o serviço parecer quebrado quando alguém digita uma URL errada. Mesmo assim, acompanhe os 4xx à parte: um salto de 401 logo depois do deploy costuma ser bug seu. No ASP.NET Core, a requisição que termina em exceção não tratada ainda ganha o rótulo `error_type` com o tipo da exceção, como `System.InvalidOperationException`, o que ajuda a separar uma falha da outra.",
                    },
                    {
                        type: "code",
                        value: "# PromQL: RED do serviço a partir de um único histograma\n# R: requisições por segundo, por rota\nsum by (http_route) (rate(http_server_request_duration_seconds_count[5m]))\n\n# E: fração das requisições que terminaram em 5xx, por rota\nsum by (http_route) (rate(http_server_request_duration_seconds_count{http_response_status_code=~\"5..\"}[5m]))\n  / sum by (http_route) (rate(http_server_request_duration_seconds_count[5m]))\n\n# D: p95 da duração, por rota\nhistogram_quantile(0.95,\n  sum by (le, http_route) (rate(http_server_request_duration_seconds_bucket[5m])))",
                    },
                    {
                        type: "text",
                        value: "## O que o RED esconde\n\nErro costuma ser **rápido**. Se o banco cai e cada requisição devolve 500 em 3 ms, o p95 despenca, e o gráfico de duração sugere que tudo melhorou. Olhe duração e erros sempre juntos e, quando precisar da latência de quem foi atendido, filtre só os sucessos com `http_response_status_code!~\"5..\"`.\n\nA taxa de erro em fração também engana com pouco tráfego: às 4h, 1 erro em 2 requisições é 50%. E repare na consulta de erros acima: a divisão só devolve as rotas que tiveram algum 5xx na janela, porque rota sem erro não tem série no numerador. Por fim, o histograma da aplicação só vê o que chegou à aplicação. Requisição recusada antes, no balanceador, na fila de conexões do Kestrel ou durante o reinício do processo, não entra em `http_server_request_duration_seconds`. Para essas, meça também na borda: no balanceador ou no gateway.",
                    },
                    {
                        type: "text",
                        value: "## USE: cada recurso por dentro\n\nPara cada recurso que o serviço usa (CPU, memória, disco, rede, pool de conexões, thread pool, fila), faça três perguntas. **Utilização**: quanto da capacidade está ocupada, ou quanto do tempo o recurso passou ocupado. **Saturação**: quanto trabalho está **esperando** porque o recurso não deu conta, como fila e tempo de espera. **Erros**: quantas operações do recurso falharam.\n\nA saturação é a mais esquecida e a que mais explica lentidão. CPU em 40% na média de 5 minutos pode esconder rajadas de 100% em que o trabalho fica na fila. Um pool com 10 conexões ocupadas de 10 está com 100% de utilização, e o número que mostra o estrago é o tempo que as requisições esperam por uma conexão livre. Para a máquina e o contêiner, as mesmas perguntas valem com as métricas do node_exporter ou do receiver hostmetrics do Collector; para o processo .NET, o runtime e o HttpClient já publicam quase tudo.",
                    },
                    {
                        type: "table",
                        value: "[[\"Recurso\",\"Utilização\",\"Saturação\",\"Erros\"],[\"CPU do processo\",\"`rate(dotnet_process_cpu_time_seconds_total[5m])` dividido por `dotnet_process_cpu_count`\",\"fila do thread pool, `dotnet_thread_pool_queue_length_total`\",\"raro no nível da aplicação\"],[\"Memória gerenciada\",\"`dotnet_gc_last_collection_heap_size_bytes` e `dotnet_process_memory_working_set_bytes`\",\"tempo parado em coleta de lixo, `rate(dotnet_gc_pause_time_seconds_total[5m])`\",\"`OutOfMemoryException` em `dotnet_exceptions_total`\"],[\"Conexões HTTP de saída\",\"`http_client_open_connections{http_connection_state=\\\"active\\\"}`\",\"espera por conexão livre, `http_client_request_time_in_queue_seconds`\",\"`http_client_request_duration_seconds_count` com `error_type`, como `connection_error`\"],[\"Conexões de entrada (Kestrel)\",\"`kestrel_active_connections`\",\"`kestrel_queued_connections`\",\"conexões recusadas, vistas no balanceador\"]]",
                    },
                    {
                        type: "text",
                        value: "## A fila do thread pool no .NET 10\n\nA saturação mais reveladora de um serviço .NET é a fila do thread pool: trabalho pronto para rodar, esperando uma thread livre. Fila crescendo com CPU baixa costuma ser código síncrono bloqueando threads (um `.Result`, um `Thread.Sleep`, I/O sem `await`), e a latência sobe sem que nenhum recurso pareça cheio.\n\nUm detalhe confunde quem consulta. No .NET 10 (conferido no runtime 10.0.12, em outubro de 2026), `dotnet.thread_pool.queue.length` e `dotnet.thread_pool.thread.count` são publicados como contadores observáveis, embora a documentação da Microsoft os descreva como UpDownCounter (o código-fonte do runtime no GitHub já foi corrigido). Por isso chegam ao Prometheus com `_total`, como `dotnet_thread_pool_queue_length_total`, mas o valor é o tamanho da fila naquele instante, não um acumulado. Leia direto ou com `max_over_time`, nunca com `rate`, e confira no seu Prometheus o nome e o comportamento de cada métrica antes de escrever a consulta.",
                    },
                    {
                        type: "code",
                        value: "# PromQL: USE dos recursos de um processo .NET\n# U: fração da CPU disponível que cada instância usou (de 0 a 1)\nsum without (cpu_mode) (rate(dotnet_process_cpu_time_seconds_total[5m]))\n  / dotnet_process_cpu_count\n\n# S: maior fila do thread pool nos últimos 5 minutos\n# (no .NET 10 o nome sai com _total, mas o valor é o tamanho da fila naquele instante)\nmax_over_time(dotnet_thread_pool_queue_length_total[5m])\n\n# S: p95 do tempo que as chamadas do HttpClient esperaram por uma conexão livre\nhistogram_quantile(0.95,\n  sum by (le, server_address) (rate(http_client_request_time_in_queue_seconds_bucket[5m])))\n\n# E: exceções por segundo, por tipo\nsum by (error_type) (rate(dotnet_exceptions_total[5m]))",
                    },
                    {
                        type: "text",
                        value: "## Do sintoma ao recurso\n\nOs dois métodos se encaixam numa investigação. O RED mostra o sintoma: o p95 de `/frete` saiu de 80 ms para 2 s, sem erro. O USE dos recursos que essa rota usa procura a causa: CPU em 30%, fila do thread pool vazia, mas `http_client_request_time_in_queue_seconds` da transportadora subindo junto com a latência. O handler foi configurado com `MaxConnectionsPerServer = 10`, e as chamadas estão esperando conexão livre. Sem olhar a saturação, o diagnóstico seria \"a transportadora ficou lenta\", e a correção iria para o lugar errado.",
                    },
                    {
                        type: "quote",
                        value: "RED mede o serviço como o cliente sente, com taxa, erros e duração saindo do mesmo histograma; USE mede cada recurso por utilização, saturação e erros. Comece pelo sintoma no RED e use a saturação do USE para chegar à causa.",
                    },
                ],
                questions: [
                    {
                        statement: "Pelo método RED, quais três medidas acompanham um serviço HTTP?",
                        difficulty: "facil",
                        options: [
                            { text: "Requisições por segundo, uso de memória e quantidade de deploys no dia", isCorrect: false },
                            { text: "Duração média, maior duração do dia e quantidade de instâncias ativas", isCorrect: false },
                            { text: "Uso de CPU, trabalho esperando na fila e erros de hardware do próprio servidor", isCorrect: false },
                            { text: "Requisições por segundo, requisições com erro e duração das requisições", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No método USE, qual destas medidas indica **saturação** de um pool de conexões com o banco?",
                        difficulty: "facil",
                        options: [
                            { text: "A quantidade de conexões que falharam ao tentar abrir no último minuto", isCorrect: false },
                            { text: "O tempo médio das consultas que já conseguiram uma conexão livre", isCorrect: false },
                            { text: "O tempo que as requisições esperam até conseguir uma conexão livre", isCorrect: true },
                            { text: "A fração das conexões do pool que está em uso neste exato momento", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Ao montar a taxa de erros do RED de uma API, por que em geral se contam os 5xx e se deixam os 4xx de fora?",
                        difficulty: "medio",
                        options: [
                            { text: "4xx costuma ser pedido inválido do cliente, e contá-lo faria a API parecer quebrada sem estar", isCorrect: true },
                            { text: "Os 4xx já são contados pelo balanceador, e somá-los na aplicação contaria o erro duas vezes", isCorrect: false },
                            { text: "O Prometheus descarta as séries com status abaixo de 500 para economizar espaço de armazenamento", isCorrect: false },
                            { text: "O ASP.NET Core não registra respostas 4xx em `http.server.request.duration`, só 2xx e 5xx", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de um deploy, a taxa de 5xx de `/pedidos` subiu para 30% e, ao mesmo tempo, o p95 da rota caiu de 300 ms para 40 ms. Qual é a leitura mais provável?",
                        difficulty: "medio",
                        options: [
                            { text: "O deploy trouxe uma otimização real, e a taxa de erro alta vem do cache frio nas instâncias recém-criadas", isCorrect: false },
                            { text: "O histograma perdeu as requisições lentas, porque os buckets acima de 1 segundo acabam descartados", isCorrect: false },
                            { text: "As falhas respondem rápido e puxam o p95 para baixo; a duração dos sucessos tem de ser vista à parte", isCorrect: true },
                            { text: "A janela de 5 minutos mistura instâncias antigas e novas, e o p95 só vale depois de uma hora", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O balanceador de carga registrou muitos 502 (Bad Gateway) durante 10 minutos, mas a taxa de 5xx calculada a partir de `http_server_request_duration_seconds_count` ficou em zero no mesmo período. Qual é a explicação mais provável?",
                        difficulty: "dificil",
                        options: [
                            { text: "As requisições falharam antes de chegar ao pipeline do ASP.NET Core, e a aplicação não as mediu", isCorrect: true },
                            { text: "O ASP.NET Core só registra a duração das requisições que terminam bem, e as falhas ficam de fora", isCorrect: false },
                            { text: "Sem exceção, o rótulo `error_type` não aparece, e a consulta por status ignora as outras falhas", isCorrect: false },
                            { text: "A exportação OTLP descarta as medições das requisições que demoram mais que o intervalo de envio", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Métricas prontas",
                blocks: [
                    {
                        type: "text",
                        value: "# Métricas prontas\n\nMuita equipe começa a medir uma API escrevendo um middleware que cronometra cada requisição com `Stopwatch` e publica num histograma próprio. Funciona, mas sai pior do que o que já existe: nomes inventados, rótulo com a URL inteira, buckets errados e nada sobre conexões, coleta de lixo ou thread pool. No .NET 10, o ASP.NET Core, o HttpClient e o runtime já publicam métricas com os nomes das semantic conventions. O trabalho é ouvir, escolher o que guardar e ajustar o que precisar.",
                    },
                    {
                        type: "text",
                        value: "## Quem publica o quê\n\nDesde o .NET 8, o ASP.NET Core e o `System.Net` publicam métricas nativas pela mesma API `System.Diagnostics.Metrics` que você usa no seu código; desde o .NET 9, o runtime também, no meter `System.Runtime`. No .NET 10, os pacotes `OpenTelemetry.Instrumentation.AspNetCore`, `.Http` e `.Runtime` praticamente só ligam esses meters: a documentação dos pacotes de ASP.NET Core e de HttpClient diz que não há diferença entre chamar `AddAspNetCoreInstrumentation()` ou `AddHttpClientInstrumentation()` e registrar os meters nativos com `AddMeter`.\n\nO pacote de runtime mudou de comportamento no caminho. Em aplicações até o .NET 8, ele mesmo calcula as métricas, com nomes como `process.runtime.dotnet.gc.collections.count`. A partir do .NET 9, ele só liga o meter `System.Runtime`, e os nomes passam a ser `dotnet.gc.collections` e companhia. O painel montado em cima dos nomes antigos fica vazio depois da migração, e ninguém recebe erro nenhum.",
                    },
                    {
                        type: "table",
                        value: "[[\"Meter\",\"Métricas principais, como chegam ao Prometheus\",\"Para que servem\"],[\"`Microsoft.AspNetCore.Hosting`\",\"`http_server_request_duration_seconds`, `http_server_active_requests`\",\"RED do servidor HTTP\"],[\"`Microsoft.AspNetCore.Server.Kestrel`\",\"`kestrel_active_connections`, `kestrel_queued_connections`, `kestrel_connection_duration_seconds`\",\"conexões de entrada\"],[\"`System.Net.Http`\",\"`http_client_request_duration_seconds`, `http_client_open_connections`, `http_client_request_time_in_queue_seconds`\",\"chamadas a outros serviços\"],[\"`System.Net.NameResolution`\",\"`dns_lookup_duration_seconds`\",\"tempo de resolução de DNS\"],[\"`System.Runtime`\",\"`dotnet_gc_collections_total`, `dotnet_gc_pause_time_seconds_total`, `dotnet_process_cpu_time_seconds_total`, `dotnet_process_memory_working_set_bytes`, `dotnet_exceptions_total`\",\"processo, coleta de lixo e exceções\"]]",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: ligando as métricas prontas\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"loja-api\"))\n    .WithMetrics(m => m\n        .AddMeter(PedidoMetricas.NomeDoMeter)\n        .AddAspNetCoreInstrumentation()   // Hosting, Kestrel, Routing e os outros meters do ASP.NET Core\n        .AddHttpClientInstrumentation()   // System.Net.Http e System.Net.NameResolution\n        .AddRuntimeInstrumentation()      // a partir do .NET 9, só liga o meter System.Runtime\n        .AddOtlpExporter());",
                    },
                    {
                        type: "text",
                        value: "## Os rótulos da métrica de requisição\n\nA métrica de requisição do ASP.NET Core chega com poucos rótulos, todos de baixa cardinalidade: `http_request_method`, `http_response_status_code`, `http_route`, `url_scheme`, `network_protocol_version` e, só quando a requisição falha, `error_type`. O `http_route` é o **modelo da rota**, `/pedidos/{id:int}`, e não o caminho `/pedidos/42`: é isso que mantém uma série por rota, e não uma por pedido. Requisição que não casou com nenhuma rota (o 404 de uma URL inexistente) chega sem `http_route` e com `aspnetcore_request_is_unhandled=\"true\"`.\n\nDois ajustes são comuns. O primeiro é tirar o health check da métrica: o orquestrador chama `/healthz` a cada poucos segundos em cada instância, e essas requisições rápidas inflam a taxa e puxam a duração para baixo. `DisableHttpMetrics()` no endpoint resolve na origem. O segundo é acrescentar uma tag de negócio à métrica pronta com `IHttpMetricsTagsFeature`, sempre com um conjunto fechado de valores.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: health check fora da métrica e uma tag extra com valores fechados\nusing Microsoft.AspNetCore.Http.Features;\n\n// ... (antes do Build, o registro: builder.Services.AddHealthChecks();)\n\napp.MapHealthChecks(\"/healthz\").DisableHttpMetrics();\n\napp.Use(async (context, next) =>\n{\n    var canal = context.Request.Headers[\"X-Canal\"].ToString() switch\n    {\n        \"app\" => \"app\",\n        \"site\" => \"site\",\n        _ => \"outro\" // nunca o valor cru do header: cada valor novo seria uma série nova\n    };\n    context.Features.Get<IHttpMetricsTagsFeature>()?.Tags.Add(new(\"loja.canal\", canal));\n    await next(context);\n});",
                    },
                    {
                        type: "text",
                        value: "## Buckets de histograma\n\nO ASP.NET Core e o HttpClient sugerem os próprios buckets, em segundos: 0,005, 0,01, 0,025, 0,05, 0,075, 0,1, 0,25, 0,5, 0,75, 1, 2,5, 5, 7,5 e 10. O seu histograma não ganha isso de graça. Sem sugestão no instrumento (o `InstrumentAdvice` da aula sobre métricas no .NET) e sem View, o SDK usa os buckets padrão 0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500 e 10000, pensados para milissegundos.\n\nO estrago é grande e silencioso. Num teste, pedidos entre 10 e 400 ms registrados em segundos caíram todos no bucket de 0 a 5, e o p95 calculado saiu **4,75 s**; os mesmos pedidos, com buckets em segundos, deram 0,46 s. Enquanto todos os valores couberem nesse bucket, a interpolação devolve 95% de 5, seja qual for a latência real. Se um histograma em segundos mostra percentis redondos demais, confira os valores de `le`. Para corrigir sem mexer no instrumento, ou para mudar os buckets de uma métrica pronta, use uma **View**.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: Views mudam a agregação sem tocar no instrumento\n.WithMetrics(m => m\n    .AddMeter(PedidoMetricas.NomeDoMeter)\n    .AddAspNetCoreInstrumentation()\n    // mais fronteiras perto de 300 ms, menos onde ninguém olha\n    .AddView(\"http.server.request.duration\", new ExplicitBucketHistogramConfiguration\n    {\n        Boundaries = [0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2.5]\n    })\n    // métrica que ninguém consulta não precisa ser guardada\n    .AddView(\"kestrel.connection.duration\", MetricStreamConfiguration.Drop)\n    .AddOtlpExporter());",
                    },
                    {
                        type: "text",
                        value: "## Cada bucket custa séries\n\nCada fronteira vira uma série `_bucket` para cada combinação de rótulos, mais `_sum` e `_count`. Os 14 limites sugeridos para `http.server.request.duration` dão 17 séries por combinação de rota, método e status; 30 rotas com 3 métodos e 4 status podem passar de 6 mil séries. Por isso a View acima troca precisão onde ninguém olha por precisão perto do valor que importa, e descarta o que ninguém consulta.\n\nOutra saída é o histograma exponencial (`Base2ExponentialBucketHistogramConfiguration` numa View), que ajusta os buckets sozinho. Por OTLP, o Prometheus 3 guarda esse formato como **histograma nativo**: uma série só, sem `_bucket`, consultada com `histogram_quantile(0.95, sum(rate(loja_pedidos_duracao_seconds[5m])))`. Num teste com o Prometheus 3.13, isso funcionou sem nenhuma flag. Antes de trocar, confira se as ferramentas que consultam essas métricas entendem histograma nativo, porque as consultas com `_bucket` deixam de funcionar.",
                    },
                    {
                        type: "quote",
                        value: "O .NET 10 já publica as métricas de HTTP, conexões, coleta de lixo e thread pool com nomes padronizados: ligue os meters, tire o ruído com `DisableHttpMetrics` e Views, e confira os buckets de todo histograma em segundos, porque os padrões do SDK foram pensados para milissegundos.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa API ASP.NET Core no .NET 10, o que é preciso para o OpenTelemetry exportar a métrica `http.server.request.duration`?",
                        difficulty: "facil",
                        options: [
                            { text: "Chamar `app.UseHttpMetrics()` logo depois de `UseRouting()` no pipeline da aplicação", isCorrect: false },
                            { text: "Ligar o meter do ASP.NET Core, com `AddAspNetCoreInstrumentation()` ou `AddMeter`", isCorrect: true },
                            { text: "Instalar o exportador de Prometheus e expor o endpoint `/metrics` na aplicação", isCorrect: false },
                            { text: "Escrever um middleware com `Stopwatch` que registre a duração num histograma", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na métrica `http_server_request_duration_seconds`, por que o rótulo `http_route` vem como `/pedidos/{id:int}`, e não como `/pedidos/42`?",
                        difficulty: "facil",
                        options: [
                            { text: "Com o modelo da rota, cada endpoint gera poucas séries, e não uma série por id", isCorrect: true },
                            { text: "O caminho real fica no rótulo `url_path`, que o ASP.NET Core publica junto", isCorrect: false },
                            { text: "O Prometheus troca números por chaves ao receber o rótulo, para poupar espaço", isCorrect: false },
                            { text: "O ASP.NET Core esconde o id do pedido porque o trata como dado pessoal sensível", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um `Histogram<double>` próprio registra a duração dos pedidos em segundos, sem `InstrumentAdvice` e sem View. Os pedidos levam de 10 a 400 ms, mas o p95 calculado com `histogram_quantile` sai 4,75 s. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "O Prometheus converte segundos em milissegundos ao receber a unidade `s` do OTLP", isCorrect: false },
                            { text: "O SDK arredonda os valores `double` para inteiro antes de escolher o bucket certo", isCorrect: false },
                            { text: "Os buckets padrão do SDK são para milissegundos, e tudo cai no bucket de 0 a 5", isCorrect: true },
                            { text: "O `histogram_quantile` só fica preciso com janela de 1 hora em histograma próprio", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O orquestrador chama `/healthz` a cada 5 segundos em cada instância. Desde então, a taxa de requisições do serviço subiu muito e o p95 caiu. Qual ajuste resolve na origem?",
                        difficulty: "medio",
                        options: [
                            { text: "Remover `AddAspNetCoreInstrumentation()` e medir só as rotas de negócio", isCorrect: false },
                            { text: "Chamar `DisableHttpMetrics()` no endpoint que atende o health check", isCorrect: true },
                            { text: "Trocar o método do health check de GET para POST no orquestrador", isCorrect: false },
                            { text: "Aumentar o intervalo de exportação do SDK para cinco minutos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um painel antigo consulta métricas de runtime pelos nomes `process.runtime.dotnet.*`, como `process.runtime.dotnet.gc.collections.count`. Depois que a API migrou para o .NET 10, mantendo `AddRuntimeInstrumentation()`, os gráficos ficaram vazios. O que aconteceu?",
                        difficulty: "dificil",
                        options: [
                            { text: "O pacote passou a exigir `AddMeter(\"OpenTelemetry.Instrumentation.Runtime\")` para continuar ativo", isCorrect: false },
                            { text: "O .NET 10 deixou de publicar métricas de coleta de lixo, que agora só aparecem no `dotnet-counters`", isCorrect: false },
                            { text: "O Prometheus 3 renomeia a métrica para `dotnet_runtime_gc_collections_count` durante a tradução do OTLP", isCorrect: false },
                            { text: "A partir do .NET 9, o pacote só liga o meter `System.Runtime`, com nomes como `dotnet.gc.collections`", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Traces distribuídos",
        aulas: [
            {
                titulo: "Anatomia de um trace",
                blocks: [
                    {
                        type: "text",
                        value: "# Anatomia de um trace\n\nSexta-feira, seis da tarde: um cliente reclama que finalizar a compra levou oito segundos. A requisição passou pelo checkout, pelo estoque, pelo gateway de pagamento e pelo banco. Cada serviço tem os seus logs e as suas métricas, e cada um, olhado sozinho, parece normal. O que falta é a história **daquela** requisição, do começo ao fim, atravessando os serviços: quem chamou quem, em que ordem, quanto cada passo levou e onde deu errado. Essa história é o **trace**.\n\n## Trace, span e span pai\n\n- **Trace** é o registro de uma operação de ponta a ponta, como uma requisição HTTP ou o processamento de uma mensagem. Ele é identificado por um **trace id** de 16 bytes (32 caracteres hexadecimais), o mesmo em todos os serviços por onde a operação passou.\n- **Span** é um pedaço do trace: uma unidade de trabalho com nome, início e duração, como \"receber a requisição\", \"reservar o estoque\" ou \"cobrar o cartão\". Cada span tem o seu **span id**, de 8 bytes (16 caracteres hexadecimais).\n- **Span pai**: todo span, menos o primeiro, guarda o span id de quem o originou, o **parent span id**. O primeiro, sem pai, é o **span raiz**. É essa ligação que transforma uma pilha de spans soltos numa árvore.\n\nNo .NET, o span do OpenTelemetry é a classe `Activity`, de `System.Diagnostics`, e quem cria spans é uma `ActivitySource`. O SDK do OpenTelemetry escuta essas fontes, coleta os spans e os exporta. O programa abaixo monta à mão o trace de uma compra com três spans e manda tudo para o console. Os detalhes de `ActivitySource` e `StartActivity` ficam para a aula de spans manuais; aqui o foco é o que sai do outro lado.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (dotnet add package OpenTelemetry.Exporter.Console)\nusing System.Diagnostics;\nusing OpenTelemetry;\nusing OpenTelemetry.Resources;\nusing OpenTelemetry.Trace;\n\nvar fonte = new ActivitySource(\"Loja.Checkout\");\n\nusing var tracerProvider = Sdk.CreateTracerProviderBuilder()\n    .ConfigureResource(r => r.AddService(\"checkout\"))\n    .AddSource(\"Loja.Checkout\")\n    .AddConsoleExporter()\n    .Build();\n\nusing (var compra = fonte.StartActivity(\"finalizar compra\", ActivityKind.Server))\n{\n    compra?.SetTag(\"pedido.id\", 8812);\n\n    using (var estoque = fonte.StartActivity(\"reservar estoque\"))\n    {\n        estoque?.SetTag(\"estoque.itens\", 3);\n        await Task.Delay(20);                          // simula a consulta ao estoque\n        estoque?.AddEvent(new ActivityEvent(\"reserva confirmada\"));\n    }\n\n    using (var cobranca = fonte.StartActivity(\"cobrar cartão\", ActivityKind.Client))\n    {\n        cobranca?.SetTag(\"pagamento.metodo\", \"credito\");\n        await Task.Delay(150);                         // simula o gateway de pagamento\n        cobranca?.SetStatus(ActivityStatusCode.Error, \"cartão recusado\");\n    }\n}",
                    },
                    {
                        type: "code",
                        value: "# saída real do exportador de console (resumida): cada span sai quando termina\nActivity.TraceId:            d13dd7469392cfe43097f3582ddc917d\nActivity.SpanId:             bb4fd59ffbd578ce\nActivity.ParentSpanId:       1fe625814f1a671e\nActivity.DisplayName:        reservar estoque\nActivity.Kind:               Internal\nActivity.StartTime:          2026-10-20T13:31:46.9995414Z\nActivity.Duration:           00:00:00.0205524\nActivity.Tags:\n    estoque.itens: 3\nActivity.Events:\n    reserva confirmada [20/10/2026 13:31:47 +00:00]\n\nActivity.TraceId:            d13dd7469392cfe43097f3582ddc917d\nActivity.SpanId:             61cd5b0ed5d06c19\nActivity.ParentSpanId:       1fe625814f1a671e\nActivity.DisplayName:        cobrar cartão\nActivity.Kind:               Client\nActivity.StartTime:          2026-10-20T13:31:47.0368586Z\nActivity.Duration:           00:00:00.1502704\nActivity.Tags:\n    pagamento.metodo: credito\nStatusCode: Error\nActivity.StatusDescription:  cartão recusado\n\nActivity.TraceId:            d13dd7469392cfe43097f3582ddc917d\nActivity.SpanId:             1fe625814f1a671e\nActivity.DisplayName:        finalizar compra\nActivity.Kind:               Server\nActivity.StartTime:          2026-10-20T13:31:46.9991032Z\nActivity.Duration:           00:00:00.1889950\nActivity.Tags:\n    pedido.id: 8812\nResource associated with Activity:\n    service.name: checkout\n    telemetry.sdk.language: dotnet",
                    },
                    {
                        type: "text",
                        value: "## Lendo a saída\n\nTrês coisas amarram os spans num trace só:\n\n- Os três blocos têm o **mesmo trace id** (`d13dd746...`). É isso que permite à ferramenta juntar spans que chegaram em momentos diferentes, vindos de serviços diferentes.\n- `reservar estoque` e `cobrar cartão` têm **parent span id** `1fe625814f1a671e`, que é o span id de `finalizar compra`. A raiz não tem a linha de pai.\n- A **ordem de saída é a de término**, não a de início. O exportador recebe o span quando ele termina, e o pai só termina depois dos filhos; por isso a raiz sai por último, embora tenha começado primeiro. Guarde esse detalhe: span que nunca termina nunca é exportado.\n\nAlém dos ids, cada span carrega **atributos** (pares de chave e valor, como `pedido.id: 8812`), **eventos** (instantes com horário dentro do span, como `reserva confirmada`), o **status** e o **kind**. Repare também no bloco `Resource associated with Activity`: `service.name: checkout` não é atributo de span nenhum. Ele pertence ao **resource**, a descrição de quem emitiu a telemetria (serviço, instância, versão do SDK), que vale para tudo o que o processo exporta. É pelo resource que a ferramenta separa os spans do checkout dos spans do estoque.",
                    },
                    {
                        type: "table",
                        value: "[[\"Campo\",\"O que é\",\"No exemplo\"],[\"Trace id\",\"Identifica o trace inteiro, igual em todos os spans e serviços\",\"`d13dd7469392cfe43097f3582ddc917d`\"],[\"Span id\",\"Identifica um span\",\"`1fe625814f1a671e` (finalizar compra)\"],[\"Parent span id\",\"O span id do pai; a raiz não tem\",\"`1fe625814f1a671e` nos dois filhos\"],[\"Nome\",\"O que o span faz, com poucos valores possíveis\",\"`cobrar cartão`\"],[\"Kind\",\"O papel do span na conversa entre serviços\",\"`Server`, `Internal`, `Client`\"],[\"Início e duração\",\"Quando começou e quanto levou\",\"`cobrar cartão`: 150 ms\"],[\"Atributos\",\"Contexto em chave e valor\",\"`pagamento.metodo: credito`\"],[\"Eventos\",\"Instantes com horário, sem duração\",\"`reserva confirmada`\"],[\"Status\",\"`Unset`, `Ok` ou `Error`, com descrição no erro\",\"`Error`: `cartão recusado`\"]]",
                    },
                    {
                        type: "text",
                        value: "## A cascata\n\nAs ferramentas de trace, como o Tempo (consultado pelo Grafana) e o painel do Aspire no computador do desenvolvedor, desenham o trace como uma **cascata**: uma linha por span, recuada sob o pai, com uma barra que começa no instante de início e tem o comprimento da duração. É a mesma informação da saída acima, arrumada para o olho:",
                    },
                    {
                        type: "code",
                        value: "# o mesmo trace em cascata, como as ferramentas de trace desenham (medidas da execução real)\n# trace d13dd7469392cfe43097f3582ddc917d\n                                                0 ms                       189 ms\nfinalizar compra    Server    1fe625814f1a671e  |==============================|  189 ms\n  reservar estoque  Internal  bb4fd59ffbd578ce  |===                           |   21 ms\n  cobrar cartão     Client    61cd5b0ed5d06c19  |      ========================|  150 ms  Error",
                    },
                    {
                        type: "text",
                        value: "Três leituras que a cascata entrega de cara:\n\n- **Onde foi o tempo**: dos 189 ms da compra, 150 ms são do gateway de pagamento. A investigação começa ali, não no estoque.\n- **O tempo próprio do pai**: os filhos somam 171 ms e o pai durou 189 ms. Os 18 ms que sobram foram gastos no código do próprio `finalizar compra` ou em trabalho que ninguém instrumentou (neste programa, a retomada depois do `await` e o próprio exportador de console escrevendo na tela). Um vão grande entre filhos é um convite para criar spans ali.\n- **Sequência ou paralelo**: uma barra que começa quando a anterior termina rodou em sequência. Duas chamadas independentes em sequência são tempo que dá para economizar.\n\n## Status, eventos e kind\n\nO **status** tem três valores: `Unset` (o padrão, nada a declarar), `Ok` e `Error`. Marque `Error` quando a operação falhou, com uma descrição curta; a descrição só é guardada junto com `Error`. O `Ok` existe para quem quer afirmar sucesso por cima de uma regra da instrumentação, e quase todo código deixa `Unset` nos casos de sucesso. Muita gente marca falha com um atributo `error=true`, costume herdado do OpenTracing, e o span não aparece como erro: para o OpenTelemetry, quem diz que falhou é o status.\n\nUm **evento** é um instante com nome, horário e atributos opcionais, sem duração, como \"reserva confirmada\" ou \"cache vazio\". Se o trabalho tem duração que interessa medir, ele é um span filho, não um evento. Fato datado: em 2026 o projeto OpenTelemetry anunciou a descontinuação da API de span events, em favor de eventos emitidos como **logs correlacionados ao span**. Nada quebra agora: os eventos que já existem continuam válidos e aparecendo nas ferramentas, mas, para eventos novos, o caminho recomendado passa a ser o log, que já carrega trace id e span id.\n\nO **kind** diz o papel do span na conversa entre serviços, e as ferramentas usam essa informação para desenhar o mapa de dependências:",
                    },
                    {
                        type: "table",
                        value: "[[\"Kind\",\"Quando usar\",\"Exemplo\"],[\"Server\",\"Atende uma requisição síncrona que chegou de fora\",\"`GET /pedidos/{id}` no ASP.NET Core\"],[\"Client\",\"Faz uma chamada síncrona para fora do processo\",\"chamada com HttpClient, consulta SQL\"],[\"Producer\",\"Publica uma mensagem para ser processada depois\",\"publicar o pedido numa fila\"],[\"Consumer\",\"Processa uma mensagem recebida\",\"o handler que consome a fila\"],[\"Internal\",\"Trabalho dentro do processo, sem atravessar a rede\",\"`reservar estoque` no exemplo\"]]",
                    },
                    {
                        type: "quote",
                        value: "Um trace é a árvore de spans de uma operação, amarrada pelo trace id e pelo parent span id de cada span. Leia a cascata procurando onde está o tempo, marque falha pelo status `Error` e lembre que o span só sai para o exportador quando termina.",
                    },
                ],
                questions: [
                    {
                        statement: "Num trace com três spans (a requisição de checkout, a reserva de estoque e a cobrança no cartão), o que os três spans têm em comum?",
                        difficulty: "facil",
                        options: [
                            { text: "O mesmo parent span id, que identifica o serviço de origem", isCorrect: false },
                            { text: "O mesmo trace id, e cada um com o seu próprio span id", isCorrect: true },
                            { text: "A mesma duração, que é sempre a duração do trace inteiro", isCorrect: false },
                            { text: "O mesmo span id, e cada um com o seu próprio trace id", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A cobrança no gateway terminou com cartão recusado, e você quer que esse span apareça como falha na ferramenta de trace. O que deve ser marcado no span?",
                        difficulty: "facil",
                        options: [
                            { text: "Um atributo error=true, que as ferramentas leem como falha", isCorrect: false },
                            { text: "O status Error, com uma descrição curta do motivo da falha", isCorrect: true },
                            { text: "Um evento chamado erro, que muda a cor do span na cascata", isCorrect: false },
                            { text: "O kind Client, que indica uma chamada externa que falhou", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você quer registrar no trace o momento em que a reserva de estoque foi confirmada, sem medir duração nenhuma. Qual recurso do span serve para isso?",
                        difficulty: "medio",
                        options: [
                            { text: "Um atributo com o horário, que vira um ponto na cascata", isCorrect: false },
                            { text: "O status Ok, que registra o instante em que a etapa deu certo", isCorrect: false },
                            { text: "Um span filho, que é a única forma de anotar um horário", isCorrect: false },
                            { text: "Um evento, que é um instante com nome, horário e atributos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Na saída do exportador, `service.name: checkout` apareceu no bloco de todos os spans, enquanto `pagamento.metodo` apareceu só no span da cobrança. Por que essa diferença?",
                        difficulty: "medio",
                        options: [
                            { text: "O service.name vem do nome da ActivitySource, repetido em cada span criado", isCorrect: false },
                            { text: "O service.name é do resource, que vale para tudo o que o processo exporta", isCorrect: true },
                            { text: "O service.name é atributo da raiz, que o SDK copia para os filhos do trace", isCorrect: false },
                            { text: "O service.name é gravado pelo exportador de console, só para facilitar a leitura", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O exportador de console imprimiu primeiro `reservar estoque`, depois `cobrar cartão` e só no fim `finalizar compra`, que é a raiz. Um colega concluiu que a raiz começou por último. O que explica de fato essa ordem?",
                        difficulty: "dificil",
                        options: [
                            { text: "A raiz só é criada depois que os filhos terminam, para receber a duração", isCorrect: false },
                            { text: "O span é exportado quando termina, e a raiz só termina depois dos filhos", isCorrect: true },
                            { text: "O exportador junta o lote inteiro e, por convenção, deixa a raiz para o fim", isCorrect: false },
                            { text: "O exportador ordena os spans pela duração, do mais curto para o mais longo", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Instrumentação automática no .NET",
                blocks: [
                    {
                        type: "text",
                        value: "# Instrumentação automática no .NET\n\nUma API com trinta endpoints, um banco e quatro serviços vizinhos. Escrever span à mão em cada endpoint, cada consulta e cada chamada HTTP é trabalho para semanas, e alguém vai esquecer metade. A boa notícia é que a maior parte do tempo de uma requisição costuma estar nas bordas (a requisição que chega, o banco, as chamadas para fora), e essas bordas são justamente o que as **bibliotecas de instrumentação** cobrem com uma linha cada.\n\n\"Instrumentação automática\" aparece com dois sentidos no OpenTelemetry:\n\n- **Bibliotecas de instrumentação** registradas no código, como `AddAspNetCoreInstrumentation()`: você escolhe o que liga, filtra e enriquece. É o assunto desta aula.\n- **Instrumentação sem código** (zero-code): o projeto OpenTelemetry .NET Automatic Instrumentation (versão 1.17 em setembro de 2026) liga as instrumentações por variáveis de ambiente, sem alterar o código-fonte. Serve para aplicação que você não pode recompilar, ao custo de menos controle.\n\nO exemplo abaixo é uma API de pedidos que consulta o PostgreSQL pelo Npgsql e chama um serviço de frete. Nenhum span foi escrito à mão.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\n// pacotes: OpenTelemetry.Extensions.Hosting, OpenTelemetry.Exporter.Console,\n// OpenTelemetry.Instrumentation.AspNetCore, OpenTelemetry.Instrumentation.Http,\n// Npgsql.OpenTelemetry e Npgsql.DependencyInjection\nusing Microsoft.AspNetCore.Http.HttpResults;\nusing Npgsql;                                   // o AddNpgsql() mora neste namespace\nusing OpenTelemetry.Resources;\nusing OpenTelemetry.Trace;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddNpgsqlDataSource(builder.Configuration.GetConnectionString(\"Loja\")!);\nbuilder.Services.AddHttpClient(\"frete\", c => c.BaseAddress = new Uri(builder.Configuration[\"Frete:Url\"]!));\n\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pedidos-api\"))\n    .WithTracing(t => t\n        .AddAspNetCoreInstrumentation(o => o.Filter = ctx => ctx.Request.Path != \"/health\")\n        .AddHttpClientInstrumentation()\n        .AddNpgsql()\n        .AddConsoleExporter());\n\nvar app = builder.Build();\n\napp.MapGet(\"/health\", () => \"ok\");\n\napp.MapGet(\"/pedidos/{id:int}\", async Task<Results<Ok<PedidoResposta>, NotFound>> (\n    int id, NpgsqlDataSource banco, IHttpClientFactory fabrica) =>\n{\n    string cliente;\n    decimal total;\n    await using (var comando = banco.CreateCommand(\"select cliente, total from pedidos where id = $1\"))\n    {\n        comando.Parameters.AddWithValue(id);\n        await using var leitor = await comando.ExecuteReaderAsync();\n        if (!await leitor.ReadAsync())\n            return TypedResults.NotFound();\n        (cliente, total) = (leitor.GetString(0), leitor.GetDecimal(1));\n    }   // o span do comando só termina quando o leitor fecha\n\n    var frete = await fabrica.CreateClient(\"frete\").GetStringAsync(\"/frete/01310-100\");\n    return TypedResults.Ok(new PedidoResposta(id, cliente, total, frete));\n});\n\n// o frete é outro serviço; aqui ele mora no mesmo processo só para o exemplo caber num arquivo\napp.MapGet(\"/frete/{cep}\", (string cep) => \"12.50\");\n\napp.Run();\n\nrecord PedidoResposta(int Id, string Cliente, decimal Total, string Frete);",
                    },
                    {
                        type: "text",
                        value: "## O que sai de graça\n\nUma chamada a `GET /pedidos/8812` produziu cinco spans, todos com o mesmo trace id. A saída real do exportador de console, arrumada em árvore:",
                    },
                    {
                        type: "code",
                        value: "# GET /pedidos/8812: saída real do console, arrumada em árvore\n# trace 151d1265d06e9abeabb8bc70ba3105a5 (fonte de cada span entre colchetes)\nGET /pedidos/{id:int}    Server  [Microsoft.AspNetCore]  238 ms\n    http.route=/pedidos/{id:int}  url.path=/pedidos/8812  http.response.status_code=200\n  CONNECT loja           Client  [Npgsql]                 71 ms   abertura da conexão física\n  postgresql             Client  [Npgsql]                 25 ms\n      db.system.name=postgresql  db.namespace=loja\n      db.query.text=select cliente, total from pedidos where id = $1\n  GET                    Client  [System.Net.Http]        19 ms\n      url.full=http://localhost:6401/frete/01310-100  http.response.status_code=200\n    GET /frete/{cep}     Server  [Microsoft.AspNetCore]    1 ms   filho do GET de saída\n\n# a chamada seguinte, com a conexão já no pool: 8 ms no total, 4 ms de banco, 1,6 ms de frete",
                    },
                    {
                        type: "text",
                        value: "O que cada instrumentação entregou sem nenhuma linha sua:\n\n- **ASP.NET Core** abriu o span do servidor com o nome no formato método mais rota, usando o **template** da rota (`GET /pedidos/{id:int}`) e não o caminho com o id. Todas as consultas de pedido caem no mesmo nome, e o id fica em `url.path`.\n- **Npgsql** abriu um span por comando, com o SQL em `db.query.text`. O valor do parâmetro não vai para o span: aparece só o `$1`. Na primeira requisição veio também o `CONNECT loja`, a abertura da conexão física, que o pool reaproveita nas chamadas seguintes. Na versão 10.0.3 do Npgsql, o span do comando se chama `postgresql`.\n- **HttpClient** abriu o span de saída e gravou o header `traceparent` na requisição. Do outro lado, a instrumentação de ASP.NET Core do frete leu esse header e abriu o seu span como filho do span de saída: é por isso que `GET /frete/{cep}` está no mesmo trace. Esse mecanismo é a propagação de contexto, que tem uma aula própria neste módulo.\n\nUm detalhe que o código do exemplo resolve: **o span do comando SQL só termina quando o leitor fecha**. Na primeira versão deste exemplo, o leitor ficava aberto durante a chamada ao frete, e o span do banco passou a conter o tempo da chamada HTTP. Quem olhasse a cascata culparia o banco por uma lentidão que era do frete. Feche o leitor antes de seguir.",
                    },
                    {
                        type: "table",
                        value: "[[\"Instrumentação\",\"Pacote e registro\",\"Span gerado\",\"Atributos principais\"],[\"ASP.NET Core\",\"`OpenTelemetry.Instrumentation.AspNetCore`, `AddAspNetCoreInstrumentation()`\",\"Server, `GET /pedidos/{id:int}`\",\"método, rota, caminho, status HTTP, `error.type`\"],[\"HttpClient\",\"`OpenTelemetry.Instrumentation.Http`, `AddHttpClientInstrumentation()`\",\"Client, `GET`\",\"`url.full` (valores da query string mascarados), servidor, status HTTP\"],[\"Npgsql\",\"`Npgsql.OpenTelemetry`, `AddNpgsql()` (namespace `Npgsql`)\",\"Client, `postgresql` e `CONNECT loja`\",\"`db.query.text`, `db.namespace`, servidor; valores de parâmetro ficam de fora\"],[\"EF Core com PostgreSQL\",\"nada a mais: os comandos passam pelo Npgsql\",\"Client, `postgresql`\",\"o SQL que o EF Core gerou\"]]",
                    },
                    {
                        type: "text",
                        value: "## Status: a convenção decide\n\nAs instrumentações seguem as convenções semânticas do OpenTelemetry para marcar erro, e a regra muda conforme o lado da conversa. No mesmo serviço do exemplo, com algumas rotas a mais para o teste, rodando de verdade:",
                    },
                    {
                        type: "table",
                        value: "[[\"Requisição\",\"Span\",\"Status\",\"Por quê\"],[\"`GET /pedidos/9999`, que devolveu 404\",\"Server\",\"`Unset`\",\"4xx no servidor é erro de quem chamou, não falha do serviço\"],[\"Rota que lançou exceção e devolveu 500\",\"Server\",\"`Error`, com `error.type` igual ao tipo da exceção\",\"5xx e exceção não tratada são falha do serviço\"],[\"HttpClient que recebeu 404\",\"Client\",\"`Error`, com `error.type` igual a 404\",\"para quem chama, 4xx é chamada que falhou\"],[\"`GET /health` com o `Filter`\",\"nenhum\",\"não gera span\",\"o filtro descarta a requisição antes de virar telemetria\"]]",
                    },
                    {
                        type: "text",
                        value: "## Armadilhas e o que fica de fora\n\n- **Health check enchendo o trace**: o orquestrador chama `/health` a cada poucos segundos. O `Filter` da instrumentação de ASP.NET Core, devolvendo `false`, corta esse ruído na origem.\n- **Dado sensível no SQL**: o Npgsql grava o texto do comando, não os parâmetros. Consulta parametrizada mostra `$1`; consulta montada por concatenação mostra o CPF do cliente no trace. No EF Core, uma variável vira parâmetro (`@id`), mas uma constante escrita no LINQ vai literal para o SQL e, portanto, para o span (conferido rodando).\n- **Trocar o pacote pela fonte nativa**: no .NET 10, registrar só `AddSource(\"Microsoft.AspNetCore\")` ainda gera o span do servidor, mas com o nome `Microsoft.AspNetCore.Hosting.HttpRequestIn`, sem atributos HTTP e sem status de erro num 500 (também conferido rodando). O HttpClient é diferente: desde o .NET 9 o próprio runtime preenche os atributos do span de saída, e o pacote continua servindo para propagar com o propagador do OpenTelemetry, filtrar e enriquecer.\n- **O que nenhuma biblioteca sabe**: o plano do cliente, a regra de desconto aplicada, o tempo de um cálculo em memória. O trace mostra que `POST /pedidos` levou 2 segundos e que o banco levou 40 ms, mas não mostra onde está o resto. Isso é trabalho de span manual.\n\nPara ver a cascata no Tempo ou no painel do Aspire do laboratório, troque `AddConsoleExporter()` por `AddOtlpExporter()` (pacote `OpenTelemetry.Exporter.OpenTelemetryProtocol`) e aponte a variável `OTEL_EXPORTER_OTLP_ENDPOINT` para o Collector ou para o painel.",
                    },
                    {
                        type: "quote",
                        value: "Com uma linha por biblioteca, o trace ganha a requisição recebida, cada comando SQL e cada chamada HTTP de saída, já amarrados pelo `traceparent`. Filtre o ruído, cuide do SQL que vai para o span e deixe para os spans manuais o que só o seu código sabe.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa API ASP.NET Core com `AddAspNetCoreInstrumentation()`, `AddHttpClientInstrumentation()` e `AddNpgsql()`, o que aparece no trace sem nenhum span escrito à mão?",
                        difficulty: "facil",
                        options: [
                            { text: "O span de cada requisição recebida, de cada comando SQL e de cada chamada de saída", isCorrect: true },
                            { text: "O span de cada comando SQL, mas só quando o comando passa de um segundo de duração", isCorrect: false },
                            { text: "Um span por método dos seus serviços, gerado a partir dos nomes das classes e métodos", isCorrect: false },
                            { text: "Só o span da requisição recebida; comandos SQL e chamadas de saída exigem span manual", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O trace está cheio de spans de `GET /health`, chamado pelo orquestrador a cada cinco segundos. Qual é o ajuste indicado?",
                        difficulty: "facil",
                        options: [
                            { text: "Desligar a instrumentação de ASP.NET Core e criar spans manuais nos endpoints", isCorrect: false },
                            { text: "Baixar a amostragem de todos os traces para 1% até o ruído ficar aceitável", isCorrect: false },
                            { text: "Um Filter na instrumentação de ASP.NET Core que devolva false para /health", isCorrect: true },
                            { text: "Apagar os spans de /health no backend com uma consulta agendada todo dia", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na mesma API, `GET /pedidos/9999` devolveu 404, e uma chamada do HttpClient para outro serviço também recebeu 404. Como ficam os status dos dois spans?",
                        difficulty: "medio",
                        options: [
                            { text: "O span Server fica com Error, e o span Client fica Unset", isCorrect: false },
                            { text: "O span Server fica Unset, e o span Client fica com Error", isCorrect: true },
                            { text: "Os dois ficam Unset, porque só 5xx marca falha nos spans", isCorrect: false },
                            { text: "Os dois ficam com Error, porque todo status 4xx é falha", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `AddNpgsql()` ligado, qual consulta faz o CPF do cliente aparecer no atributo `db.query.text` do span?",
                        difficulty: "medio",
                        options: [
                            { text: "Uma consulta do EF Core que filtra por uma variável com o CPF", isCorrect: false },
                            { text: "Uma consulta com o CPF passado como parâmetro posicional `$1`", isCorrect: false },
                            { text: "Uma consulta com o CPF concatenado no texto do comando SQL", isCorrect: true },
                            { text: "Qualquer consulta, porque o Npgsql grava os valores dos parâmetros", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para economizar um pacote, um colega trocou `AddAspNetCoreInstrumentation()` por `AddSource(\"Microsoft.AspNetCore\")` numa API no .NET 10. O que acontece com os spans das requisições recebidas?",
                        difficulty: "dificil",
                        options: [
                            { text: "Saem completos, mas perdem o trace id que chegou pelo traceparent", isCorrect: false },
                            { text: "Saem com nome HttpRequestIn, sem atributos HTTP nem status de erro", isCorrect: true },
                            { text: "Deixam de sair, porque o ASP.NET Core não cria o span sem o pacote", isCorrect: false },
                            { text: "Saem iguais, porque desde o .NET 9 o próprio runtime preenche tudo", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Spans manuais",
                blocks: [
                    {
                        type: "text",
                        value: "# Spans manuais\n\nO trace de `POST /pedidos/{id}/fechar` mostra 2,3 segundos no span do servidor. Dentro dele, o banco levou 40 ms e a chamada ao gateway, 300 ms. O resto é uma faixa vazia na cascata: código seu, entre uma borda e outra (regra de desconto, cálculo de frete, montagem da nota), que nenhuma biblioteca de instrumentação conhece. Span manual é como você acende a luz nessa faixa e, de quebra, pendura no trace o contexto de negócio que só o seu código tem.\n\n## ActivitySource e StartActivity\n\nCrie **uma `ActivitySource` por componente**, estática, com nome no estilo de namespace (`Loja.Pedidos`) e, de preferência, a versão. Ela não é criada por requisição: é um objeto de vida longa que todos os spans daquele componente compartilham. O SDK só escuta as fontes registradas com `AddSource`, pelo nome (aceita curinga, como `Loja.*`). Guardar o nome numa constante e usar a mesma constante dos dois lados elimina o erro de digitação mais caro deste assunto.",
                    },
                    {
                        type: "code",
                        value: "// Telemetria.cs\nusing System.Diagnostics;\n\npublic static class Telemetria\n{\n    public const string NomeDaFonte = \"Loja.Pedidos\";\n    public static readonly ActivitySource Fonte = new(NomeDaFonte, \"1.0.0\");   // uma por componente, estática\n}\n\n// Program.cs (trecho): a fonte entra no AddSource pelo mesmo nome\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pedidos-api\"))\n    .WithTracing(t => t\n        .AddSource(Telemetria.NomeDaFonte)          // sem esta linha, StartActivity devolve null\n        .AddAspNetCoreInstrumentation()\n        .AddConsoleExporter());",
                    },
                    {
                        type: "text",
                        value: "`StartActivity(nome, kind)` cria o span, marca o início e o torna o `Activity.Current`, de modo que o próximo span aberto naquele fluxo vira filho dele, inclusive através de `await`. O `using` chama o `Dispose`, que encerra o span e devolve o `Activity.Current` ao pai.\n\n**O detalhe que pega muita gente: `StartActivity` pode devolver `null`.** Se ninguém está ouvindo aquela fonte, o .NET nem cria o objeto, para não gastar nada. Código que faz `activity.SetTag(...)` sem o `?.` funciona no seu computador, onde o OpenTelemetry está ligado, e lança `NullReferenceException` no teste unitário ou no serviço em que alguém esqueceu o `AddSource`. Os casos, conferidos rodando com o SDK 1.20:",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\",\"O que StartActivity devolve\"],[\"Fonte registrada e span amostrado\",\"Um `Activity` com `IsAllDataRequested` igual a `true`\"],[\"Nome no `AddSource` diferente do nome da fonte (`Loja.Pedido` contra `Loja.Pedidos`)\",\"`null`\"],[\"Nenhum OpenTelemetry configurado (teste unitário, ferramenta de linha de comando)\",\"`null`\"],[\"Span raiz descartado pelo sampler\",\"Um `Activity` com `IsAllDataRequested` igual a `false`, que existe só para levar o trace id adiante\"],[\"Filho de um span descartado, no mesmo processo\",\"`null`\"]]",
                    },
                    {
                        type: "text",
                        value: "Daí as duas regras do código abaixo: sempre `activity?.` e, quando montar um atributo custa caro (juntar uma lista, serializar um objeto), conferir `IsAllDataRequested` antes, porque o span pode existir só para propagar o contexto, sem nada a ser gravado.\n\n## Atributos de negócio\n\nO valor do span manual está no contexto que só o seu código conhece. Algumas regras:\n\n- **Nome do span com poucos valores possíveis**: `fechar pedido`, nunca `fechar pedido 8812`. As ferramentas agrupam e calculam estatísticas pelo nome; com o id no nome, cada pedido vira uma operação diferente. O id vai num atributo.\n- **Atributo pode ter alta cardinalidade**, ao contrário do rótulo de métrica: `pedido.id` cabe no span, porque cada span é um registro, não uma série temporal. O limite aqui é outro: **dado pessoal e segredo não entram** (CPF, e-mail, token), pelos mesmos motivos que não entram no log.\n- **Nomes com o prefixo do seu domínio** (`pedido.`, `pagamento.`) e as convenções semânticas para o que já tem nome padrão (`http.`, `db.`, `messaging.`). Não invente `httpMethod` quando existe `http.request.method`.\n- **Tipos que o protocolo conhece**: texto, inteiro, `double`, booleano e listas desses. O OTLP não tem `decimal`, então converta.\n- `SetTag` substitui o valor de uma chave; `AddTag` acrescenta outra entrada com a mesma chave. Use `SetTag`.",
                    },
                    {
                        type: "code",
                        value: "// ServicoDePedidos.cs\nusing System.Diagnostics;\n\npublic class ServicoDePedidos(IGatewayDePagamento gateway)\n{\n    public async Task<Recibo> FecharAsync(Pedido pedido, CancellationToken ct)\n    {\n        using var activity = Telemetria.Fonte.StartActivity(\"fechar pedido\");\n        activity?.SetTag(\"pedido.id\", pedido.Id);\n        activity?.SetTag(\"pedido.itens\", pedido.Itens.Count);\n        activity?.SetTag(\"pedido.valor_total\", (double)pedido.Total);   // OTLP não tem decimal\n\n        if (activity is { IsAllDataRequested: true })   // só monta o texto se o span vai ser gravado\n        {\n            activity.SetTag(\"pedido.categorias\",\n                string.Join(\",\", pedido.Itens.Select(i => i.Categoria).Distinct()));\n        }\n\n        try\n        {\n            var recibo = await gateway.CobrarAsync(pedido.Total, ct);\n            activity?.SetTag(\"pagamento.autorizacao\", recibo.Autorizacao);\n            return recibo;\n        }\n        catch (Exception ex)\n        {\n            activity?.AddException(ex);                                         // evento \"exception\"\n            activity?.SetStatus(ActivityStatusCode.Error, \"falha ao cobrar\");   // o que marca o erro\n            throw;\n        }\n    }\n}",
                    },
                    {
                        type: "code",
                        value: "# saída real do console para POST /pedidos/8812/fechar (resumida, pilha cortada)\nActivity.TraceId:            d2dc5027d7800ae5f2ccbc752d590ec5\nActivity.SpanId:             30e7c470e95b818d\nActivity.ParentSpanId:       c18685beca757b79\nActivity.DisplayName:        fechar pedido\nActivity.Kind:               Internal\nActivity.Duration:           00:00:00.3236332\nActivity.Tags:\n    pedido.id: 8812\n    pedido.itens: 2\n    pedido.valor_total: 159.7\n    pedido.categorias: livros,canecas\nStatusCode: Error\nActivity.StatusDescription:  falha ao cobrar\nActivity.Events:\n    exception [20/10/2026 13:33:25 +00:00]\n        exception.message: gateway não respondeu a tempo\n        exception.stacktrace: System.TimeoutException: gateway não respondeu a tempo\n   at GatewayLento.CobrarAsync(Decimal valor, CancellationToken ct)\n   at ServicoDePedidos.FecharAsync(Pedido pedido, CancellationToken ct)\n        exception.type: System.TimeoutException\n\nfail: Microsoft.AspNetCore.Server.Kestrel[13]\n      Connection id \"0HNPELQRU26P1\", Request id \"0HNPELQRU26P1:00000001\": An unhandled exception was thrown by the application.\n      System.TimeoutException: gateway não respondeu a tempo\n\nActivity.TraceId:            d2dc5027d7800ae5f2ccbc752d590ec5\nActivity.SpanId:             c18685beca757b79\nActivity.DisplayName:        POST /pedidos/{id:int}/fechar\nActivity.Kind:               Server\nActivity.Tags:\n    error.type: System.TimeoutException\n    http.response.status_code: 500\nStatusCode: Error",
                    },
                    {
                        type: "text",
                        value: "## Registrando a exceção\n\nNo `catch`, duas chamadas com papéis diferentes:\n\n- `SetStatus(ActivityStatusCode.Error, \"falha ao cobrar\")` é o que **marca o span como falho**: é por ele que a ferramenta destaca o span, que a busca por erros encontra o trace e que a amostragem por erro funciona. Use uma descrição curta e estável, porque a mensagem da exceção pode carregar dado variável.\n- `AddException(ex)` grava o evento `exception`, com tipo, mensagem e pilha. **Ele não muda o status**: chamado sozinho, o span continua `Unset` (conferido rodando).\n\nEm material antigo você vai achar `activity?.RecordException(ex)` e `activity?.SetStatus(Status.Error)`. São extensões do pacote do OpenTelemetry marcadas como obsoletas desde a versão 1.10 da API, de novembro de 2024: o compilador acusa CS0618 e manda usar `Activity.AddException` e `Activity.SetStatus`, que são métodos do próprio .NET. Em outubro de 2026, até a página de exceções da documentação do OpenTelemetry para .NET ainda mostra o jeito antigo; vale o aviso do compilador.\n\nE a direção para os próximos anos: as convenções semânticas do OpenTelemetry já marcam como descontinuada a exceção registrada como evento de span e recomendam registrá-la como log correlacionado ao span. No .NET, esse log sai pelo `ILogger`, com trace id e span id. Repare que, no exemplo, o ASP.NET Core já registrou em log a exceção que escapou da requisição. O que não muda: **status de erro no span, sempre** que a operação falhar. Exceção tratada que não derrubou a operação, como uma nova tentativa que deu certo, não vira erro.\n\n## O span que nunca termina\n\nO exportador só recebe o span quando ele termina. Span aberto sem `using`, com um `return` antecipado ou uma exceção no caminho, **nunca termina**: não é exportado e, em código síncrono, continua como `Activity.Current`, adotando como filhos os spans abertos depois dele. Na ferramenta, o resultado é um trace com spans órfãos, pendurados num pai que nunca chegou. Em código `async`, o `Activity.Current` alterado dentro do método não vaza para quem chamou, mas o span esquecido continua sem ser exportado.",
                    },
                    {
                        type: "code",
                        value: "// O bug: StartActivity sem using e um retorno antecipado\nstatic decimal CalcularFrete(string cep)\n{\n    var activity = Telemetria.Fonte.StartActivity(\"calcular frete\");\n    if (string.IsNullOrEmpty(cep))\n        return 0m;                       // sai sem Stop: o span nunca termina\n    activity?.Stop();\n    return 12.50m;\n}\n\n// Quem chama, dentro do span \"POST /pedidos\"\nstatic void ProcessarPedido()\n{\n    CalcularFrete(cep: \"\");\n    using var gravar = Telemetria.Fonte.StartActivity(\"gravar pedido\");\n    Console.WriteLine($\"pai de 'gravar pedido': {gravar?.Parent?.DisplayName} ({gravar?.ParentSpanId})\");\n}\n\n// Saída real (os ids mudam a cada execução):\n// pai de 'gravar pedido': calcular frete (293413d6af787514)\n// exportados: gravar pedido (span 1d2ad2a186ebbf73, pai 293413d6af787514),\n//             POST /pedidos (raiz, span 8e7275ddf117a466)\n// O span 293413d6af787514 nunca chegou ao exportador: \"gravar pedido\" ficou órfão.\n\n// A correção: using var faz o Stop em qualquer saída do método, até numa exceção\nstatic decimal CalcularFreteCorrigido(string cep)\n{\n    using var activity = Telemetria.Fonte.StartActivity(\"calcular frete\");\n    if (string.IsNullOrEmpty(cep))\n        return 0m;\n    return 12.50m;\n}",
                    },
                    {
                        type: "quote",
                        value: "Uma `ActivitySource` estática por componente, registrada pelo mesmo nome no `AddSource`, e todo span com `using` e `?.`. Atributo de negócio no span e id fora do nome; na falha, `SetStatus` marca o erro e `AddException` guarda os detalhes, porque o `RecordException` ficou para trás.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que o código usa `activity?.SetTag(...)`, com o operador `?.`, logo depois de `StartActivity`?",
                        difficulty: "facil",
                        options: [
                            { text: "StartActivity devolve null quando ninguém está ouvindo a fonte", isCorrect: true },
                            { text: "O operador impede que o atributo seja enviado em spans com erro", isCorrect: false },
                            { text: "SetTag lança exceção quando a chave já existe naquele mesmo span", isCorrect: false },
                            { text: "StartActivity lança exceção quando o exportador fica fora do ar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Que nome você dá ao span manual que envolve o fechamento de um pedido, sabendo que a loja fecha milhares de pedidos por hora?",
                        difficulty: "facil",
                        options: [
                            { text: "`fechar pedido`, com o número do pedido num atributo do span", isCorrect: true },
                            { text: "`fechar pedido 8812`, com o número do pedido no próprio nome", isCorrect: false },
                            { text: "Um nome por cliente, como `fechar pedido da Ana`, para buscar", isCorrect: false },
                            { text: "O texto do erro, quando houver, como `cartão recusado no gateway`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No `catch`, o código chama só `activity?.AddException(ex)` e relança a exceção. Na ferramenta, o span aparece sem erro. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "AddException só marca erro quando a exceção não é relançada depois", isCorrect: false },
                            { text: "AddException só grava o evento exception; o erro vem do SetStatus", isCorrect: true },
                            { text: "AddException foi descontinuado e virou uma chamada que não faz nada", isCorrect: false },
                            { text: "AddException só funciona com o exportador OTLP, não com o console", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Ao compilar código antigo com o OpenTelemetry 1.20, a linha `activity?.RecordException(ex)` gerou o aviso CS0618. Qual é a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "Trocar por `activity?.AddException(ex)`, que grava o mesmo evento exception", isCorrect: true },
                            { text: "Trocar por `activity?.AddEvent(new ActivityEvent(ex.Message))`, que é igual", isCorrect: false },
                            { text: "Manter como está, porque o aviso só aparece nas compilações em modo Debug", isCorrect: false },
                            { text: "Trocar por `activity?.SetTag(\"exception\", ex)`, que guarda a exceção inteira", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Este método síncrono é chamado com um pedido sem itens, dentro do span `POST /pedidos`, e logo depois o código abre o span `gravar pedido`. O que a ferramenta de trace vai mostrar?\n\n```csharp\nstatic void Validar(Pedido pedido)\n{\n    var activity = Telemetria.Fonte.StartActivity(\"validar pedido\");\n    if (pedido.Itens.Count == 0)\n        return;\n    // ... outras validações\n    activity?.Stop();\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`gravar pedido` como filho de `POST /pedidos`, e `validar pedido` sem duração", isCorrect: false },
                            { text: "`gravar pedido` filho de um pai que nunca chega, e nada de `validar pedido`", isCorrect: true },
                            { text: "`validar pedido` com duração zero, encerrado pelo coletor de lixo do runtime", isCorrect: false },
                            { text: "`validar pedido` encerrado junto com `POST /pedidos`, como último filho dele", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Propagação de contexto",
                blocks: [
                    {
                        type: "text",
                        value: "# Propagação de contexto\n\nO checkout chama o estoque por HTTP e publica o pedido numa fila que o faturamento consome. Se o contexto se perde no caminho, a ferramenta mostra três traces independentes, e a investigação que começa no `POST /checkout` para na porta do primeiro vizinho. Propagar contexto é fazer o trace id e o span pai atravessarem a fronteira entre processos: quem envia **injeta** o contexto no transporte (um header HTTP, um header da mensagem) e quem recebe **extrai** e continua o mesmo trace.\n\n## O header traceparent\n\nO formato padrão é o **W3C Trace Context**, adotado pelo OpenTelemetry. O header principal é o `traceparent`, com quatro campos separados por hífen. Este chegou de verdade ao serviço de estoque, no exemplo desta aula:",
                    },
                    {
                        type: "code",
                        value: "# headers que chegaram ao serviço de estoque (saída real)\ntraceparent: 00-86678605b2a19ada722ef58d5ce62c71-5f29b19563acca7a-01\nbaggage: cliente.plano=premium\n\n# 00                                 versão do formato\n# 86678605b2a19ada722ef58d5ce62c71   trace id (16 bytes): o mesmo nos dois serviços\n# 5f29b19563acca7a                   parent id (8 bytes): o span de quem fez a chamada\n# 01                                 flags: 01 = amostrado (gravado), 00 = não amostrado",
                    },
                    {
                        type: "text",
                        value: "O **parent id** é o span id de quem fez a chamada, que no checkout é o span do HttpClient, e não o span do servidor do checkout. É ele que vira o pai do span do estoque. Ao lado do `traceparent` podem vir o `tracestate`, com dados específicos de fornecedor, e o `baggage`, assunto logo abaixo.\n\n## Atravessando HTTP\n\nCom as instrumentações de HttpClient e de ASP.NET Core ligadas, você não escreve nada: o cliente injeta o header na requisição que sai, e o servidor extrai na que chega. O primeiro serviço da cadeia não recebe `traceparent` nenhum: sem header, ele começa um trace novo e vira a raiz. No próprio runtime, o .NET 10 também passou a usar o W3C no propagador padrão (`DistributedContextPropagator.Current`): antes, o baggage saía num header fora do padrão, o `Correlation-Context`; agora sai no `baggage`.\n\n## Baggage\n\n**Baggage** é um conjunto de pares de chave e valor que viaja junto com o contexto para todos os serviços seguintes, no header `baggage`. Serve para informação que muitos serviços precisam e que não está no pedido de cada um, como o plano do cliente ou o id do tenant. Dois serviços de verdade, checkout e estoque, em processos separados:",
                    },
                    {
                        type: "code",
                        value: "// checkout (trecho do Program.cs): grava o baggage e chama o estoque\napp.MapPost(\"/checkout\", async (IHttpClientFactory fabrica) =>\n{\n    Baggage.SetBaggage(\"cliente.plano\", \"premium\");   // vale para as chamadas que saem daqui\n    var resposta = await fabrica.CreateClient(\"estoque\").PostAsync(\"/reservas\", content: null);\n    return TypedResults.Ok($\"estoque respondeu {(int)resposta.StatusCode}\");\n});\n\n// estoque (trecho do Program.cs): lê o baggage e decide o que vira atributo\napp.MapPost(\"/reservas\", () =>\n{\n    var plano = Baggage.GetBaggage(\"cliente.plano\");    // \"premium\", vindo do header baggage\n    Activity.Current?.SetTag(\"cliente.plano\", plano);   // sem esta linha, o span não tem o plano\n    return TypedResults.Created(\"/reservas/1\");\n});",
                    },
                    {
                        type: "code",
                        value: "# spans dos dois processos (saída real): um trace só, atravessando o HTTP\n[checkout]  POST /checkout   Server  span 13775b76350bfb6d  pai: nenhum (raiz)\n[checkout]  POST             Client  span 5f29b19563acca7a  pai: 13775b76350bfb6d\n[estoque]   POST /reservas   Server  span 48d9276868b34cf3  pai: 5f29b19563acca7a (remoto)\n            cliente.plano=premium  (atributo gravado pelo SetTag do estoque)\n# trace id dos três: 86678605b2a19ada722ef58d5ce62c71",
                    },
                    {
                        type: "text",
                        value: "Três cuidados com baggage, todos de produção:\n\n- **Não vira atributo sozinho.** O estoque recebe o valor (`Baggage.GetBaggage` devolveu `premium`), mas o span dele só tem `cliente.plano` porque o código copiou com `SetTag`. Sem essa linha, ninguém filtra os spans do estoque por plano.\n- **Viaja em texto puro para todo mundo que vem depois**, inclusive APIs de terceiros chamadas pelo HttpClient. Nada de token, CPF ou e-mail no baggage. A especificação da W3C só obriga a propagar até 64 itens e 8192 bytes; acima disso, itens podem ser descartados no caminho.\n- **É dado de entrada que o seu serviço interpreta.** Em abril de 2026, a versão 1.15.3 do OpenTelemetry .NET corrigiu uma falha de negação de serviço no propagador de baggage (CVE-2026-40894): mais um motivo para manter o SDK atualizado.\n\n## Atravessando a fila\n\nNuma fila não há requisição HTTP, mas a mensagem tem headers, e o mecanismo é o mesmo: o publicador injeta o contexto nos headers da mensagem, e o consumidor extrai e abre o span como filho. O exemplo usa o `RabbitMQ.Client` 7 e o propagador do OpenTelemetry diretamente, o que vale para qualquer transporte com headers (declaração de exchange e fila omitida):",
                    },
                    {
                        type: "code",
                        value: "// Mensageria.cs: o contexto do trace viajando nos headers da mensagem (RabbitMQ.Client 7)\nusing System.Diagnostics;\nusing System.Text;\nusing OpenTelemetry;\nusing OpenTelemetry.Context.Propagation;\nusing RabbitMQ.Client;\nusing RabbitMQ.Client.Events;\n\npublic static class Mensageria\n{\n    public static async Task PublicarAsync(IChannel canal, byte[] corpo)\n    {\n        using var activity = Telemetria.Fonte.StartActivity(\"publish pedidos\", ActivityKind.Producer);\n        var headers = new Dictionary<string, object?>();\n        if (activity is not null)\n        {\n            // lido na hora do uso: antes de o SDK iniciar, o padrão é um propagador que não faz nada\n            Propagators.DefaultTextMapPropagator.Inject(\n                new PropagationContext(activity.Context, Baggage.Current), headers,\n                static (h, chave, valor) => h[chave] = valor);\n        }\n        var props = new BasicProperties { Persistent = true, Headers = headers };\n        await canal.BasicPublishAsync(\"pedidos\", \"pedido.criado\", mandatory: true,\n            basicProperties: props, body: corpo);\n    }\n\n    public static async Task ConsumirAsync(IChannel canal, BasicDeliverEventArgs ea)\n    {\n        var pai = Propagators.DefaultTextMapPropagator.Extract(default, ea.BasicProperties.Headers, LerHeader);\n        Baggage.Current = pai.Baggage;\n        using var activity = Telemetria.Fonte.StartActivity(\"process pedidos\", ActivityKind.Consumer,\n            pai.ActivityContext);\n        // ... processa a mensagem; o que for feito aqui vira filho de \"process pedidos\"\n        await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n\n    // no consumidor do RabbitMQ.Client, header de texto chega como byte[]\n    private static IEnumerable<string> LerHeader(IDictionary<string, object?>? headers, string chave) =>\n        headers is not null && headers.TryGetValue(chave, out var valor) && valor is byte[] bytes\n            ? [Encoding.UTF8.GetString(bytes)]\n            : [];\n}",
                    },
                    {
                        type: "text",
                        value: "Rodando contra um RabbitMQ 4.3 local, o `process pedidos` do consumidor saiu com o mesmo trace id do `POST /pedidos`, com o `publish pedidos` como pai, e o baggage `cliente.plano=premium` chegou junto. Duas armadilhas apareceram de verdade no caminho:\n\n- **O header chega como `byte[]`.** No consumidor do `RabbitMQ.Client`, header de texto chega em bytes. Um getter que procura `string` não acha nada, o `Extract` devolve um contexto vazio, e cada mensagem abre um trace novo, sem pai e sem baggage. Foi o que aconteceu ao trocar `valor is byte[] bytes` por `valor is string texto`.\n- **O propagador padrão só existe depois que o SDK inicia.** Antes disso, `Propagators.DefaultTextMapPropagator` é um propagador que não faz nada (`NoopTextMapPropagator`). Guardado numa variável no começo do programa, antes de o `TracerProvider` ser criado, ele \"injeta\" sem gravar header nenhum. Leia o propagador na hora de usar.\n\nDá para não escrever nada disso usando a instrumentação do próprio cliente: o pacote `RabbitMQ.Client.OpenTelemetry`, com `AddRabbitMQInstrumentation()`, abre os spans `publish` e `deliver` e grava o `traceparent` sozinho. Em outubro de 2026, ele só existe como 1.0.0-rc.2 (release candidate) e exige o cliente 7.2 ou mais novo; nos clientes 7.0 e 7.1, o span do consumidor nascia num trace separado, ligado ao publish só por link. Confira versão e estabilidade antes de pôr pacote de pré-lançamento no caminho crítico.\n\nUm último caso: o consumidor que processa um **lote** de mensagens vindas de traces diferentes não pode ter vários pais. Ele abre um span para o lote e guarda o contexto de cada mensagem como **link** (`ActivityLink`), que as ferramentas mostram como ligação entre traces.",
                    },
                    {
                        type: "table",
                        value: "[[\"Onde o contexto viaja\",\"Quem injeta\",\"Quem extrai\",\"Armadilha comum\"],[\"Requisição HTTP\",\"instrumentação de HttpClient\",\"instrumentação de ASP.NET Core\",\"serviço legado que só fala B3 (formato do Zipkin) e outro que só lê W3C: o trace parte em dois\"],[\"Mensagem do RabbitMQ\",\"`Inject` no publicador ou `AddRabbitMQInstrumentation()`\",\"`Extract` no consumidor ou o mesmo pacote\",\"header de texto chega como `byte[]`\"],[\"Outros transportes com metadados por mensagem (Kafka, SQS)\",\"o mesmo `Inject`, nos metadados do transporte\",\"o mesmo `Extract`\",\"republicar a mensagem sem copiar os headers e cortar a cadeia\"],[\"Processamento em lote\",\"cada mensagem traz o seu contexto\",\"um span para o lote, com um link por mensagem\",\"forçar um pai único e misturar traces diferentes\"]]",
                    },
                    {
                        type: "quote",
                        value: "O contexto atravessa processos no `traceparent`: quem envia injeta, quem recebe extrai e continua o trace. Em HTTP as instrumentações fazem isso sozinhas; na fila, o contexto vai nos headers da mensagem, e o baggage leva junto o que todos precisam saber, nunca o que ninguém pode ver.",
                    },
                ],
                questions: [
                    {
                        statement: "O serviço de estoque recebeu `traceparent: 00-86678605b2a19ada722ef58d5ce62c71-5f29b19563acca7a-01`. O que é o trecho `5f29b19563acca7a`?",
                        difficulty: "facil",
                        options: [
                            { text: "Um trace id curto, usado quando o trace tem menos de 16 spans no total", isCorrect: false },
                            { text: "O número da requisição, que o estoque usa para evitar duplicidade", isCorrect: false },
                            { text: "O span id de quem fez a chamada, que vira o pai do span no estoque", isCorrect: true },
                            { text: "O id do serviço de origem, calculado a partir do service.name", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destes dados pode ir no baggage sem problema?",
                        difficulty: "facil",
                        options: [
                            { text: "O corpo inteiro do pedido, para o consumidor não precisar buscar no banco", isCorrect: false },
                            { text: "O CPF do cliente, para cada serviço registrar no log quem fez a compra", isCorrect: false },
                            { text: "O plano do cliente, como `premium`, para os serviços ajustarem regras", isCorrect: true },
                            { text: "O token de acesso do usuário, para os serviços seguintes não pedirem login", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O consumidor lê os headers da mensagem com o getter abaixo, e todo pedido processado aparece num trace novo, sem pai. Qual é a causa?\n\n```csharp\nstatic IEnumerable<string> LerHeader(IDictionary<string, object?>? headers, string chave) =>\n    headers is not null && headers.TryGetValue(chave, out var valor) && valor is string texto\n        ? [texto]\n        : [];\n```",
                        difficulty: "medio",
                        options: [
                            { text: "O traceparent só atravessa a fila quando a mensagem é publicada como persistente", isCorrect: false },
                            { text: "O RabbitMQ remove os headers que começam com trace antes de entregar a mensagem", isCorrect: false },
                            { text: "O cliente entrega o header de texto como byte[], e o getter só procura string", isCorrect: true },
                            { text: "O Extract exige que publicador e consumidor rodem dentro do mesmo processo .NET", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O checkout faz `Baggage.SetBaggage(\"cliente.plano\", \"premium\")`, e o estoque recebe o header `baggage`. Mesmo assim, ninguém consegue filtrar os spans do estoque por plano na ferramenta. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "O baggage só é propagado em chamadas gRPC, e a chamada ao estoque foi feita por HTTP", isCorrect: false },
                            { text: "O exportador descarta o baggage e só envia atributos que começam com o prefixo otel", isCorrect: false },
                            { text: "O baggage chega ao estoque, mas o SDK apaga o valor quando abre o span do servidor", isCorrect: false },
                            { text: "O baggage viaja entre os serviços, mas só vira atributo se alguém copiar para o span", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um worker publica mensagens com o trecho abaixo, e as mensagens chegam ao consumidor sem o header `traceparent`, embora o span `publish pedidos` exista e seja exportado. Por quê?\n\n```csharp\nvar propagador = Propagators.DefaultTextMapPropagator;   // primeira linha do programa\n\nusing var tracerProvider = Sdk.CreateTracerProviderBuilder()\n    .AddSource(\"Loja.Pedidos\")\n    .AddOtlpExporter()\n    .Build();\n\n// mais adiante, dentro do span \"publish pedidos\"\npropagador.Inject(new PropagationContext(activity.Context, Baggage.Current), headers,\n    static (h, chave, valor) => h[chave] = valor);\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "O Inject só grava o header quando o AddRabbitMQInstrumentation está ligado", isCorrect: false },
                            { text: "O baggage vazio faz o Inject desistir de gravar o traceparent da mensagem", isCorrect: false },
                            { text: "O Inject exige o propagador B3, porque mensagens não aceitam o formato W3C", isCorrect: false },
                            { text: "O propagador foi lido antes de o SDK iniciar, quando o padrão era o Noop", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Amostragem",
                blocks: [
                    {
                        type: "text",
                        value: "# Amostragem\n\nUma API com 500 requisições por segundo e 20 spans por requisição gera 10 mil spans por segundo: 864 milhões por dia. Com algo perto de 1 KB por span, são mais de 800 GB por dia só de traces, pagos na rede, no armazenamento e, em muitos fornecedores, por GB recebido. E a imensa maioria desses traces é de requisições bem-sucedidas e parecidas entre si. **Amostragem** é guardar uma parte representativa e descartar o resto, escolhendo bem o que fica.\n\n## Head sampling: decidir na entrada\n\nNo **head sampling** (amostragem na cabeça), a decisão é tomada quando o span raiz começa, antes de qualquer trabalho. O sampler olha o que existe naquele instante (o trace id, o nome e o kind do span) e decide entre gravar e descartar. A decisão viaja no último campo do `traceparent` (`01` amostrado, `00` não amostrado), e os serviços seguintes, configurados para respeitar o pai, repetem a mesma decisão. Resultado: o trace é guardado inteiro ou descartado inteiro, nunca pela metade.\n\nNo SDK do .NET, o padrão sem configuração é `ParentBased` com raiz `AlwaysOn`: **100% dos traces**. Muita equipe vai para produção assim e descobre o custo na primeira fatura. A taxa fixa se configura no código ou por variável de ambiente:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (trecho): 10% das raízes; quem chega com pai segue a decisão do pai\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pedidos-api\"))\n    .WithTracing(t => t\n        .SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(0.10)))\n        .AddSource(Telemetria.NomeDaFonte)\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation()\n        .AddOtlpExporter());\n\n// O mesmo sem tocar no código (e sem o SetSampler acima), por variáveis de ambiente:\n// OTEL_TRACES_SAMPLER=parentbased_traceidratio\n// OTEL_TRACES_SAMPLER_ARG=0.10",
                    },
                    {
                        type: "text",
                        value: "O `TraceIdRatioBasedSampler` decide pelo próprio trace id, de forma determinística: o mesmo trace id recebe a mesma decisão em qualquer serviço com a mesma proporção, e todo trace aceito a 10% também é aceito a 50%. O `ParentBasedSampler` em volta faz a proporção valer só para as raízes; quem chega com pai segue a flag do pai. Resultados de testes reais com requisições simuladas, cada uma com três spans:",
                    },
                    {
                        type: "code",
                        value: "# testes reais com o SDK 1.20.1, requisições simuladas com 3 spans cada\nParentBased(TraceIdRatioBased 0.10), 1000 req.   102 traces guardados, 306 spans, 0 incompletos\nSem sampler configurado (padrão), 1000 req.      1000 de 1000 guardados\nOTEL_TRACES_SAMPLER=parentbased_traceidratio\nOTEL_TRACES_SAMPLER_ARG=0.25, 1000 req.          228 de 1000 guardados\n\n# 1000 requisições que chegam com pai remoto NÃO amostrado (flag 00)\nTraceIdRatioBased(0.5) sem ParentBased           483 spans gravados, todos sem a raiz\nParentBased(TraceIdRatioBased(0.5))              0 gravados\n\n# 100000 trace ids sorteados\naceitos a 10%: 9990; destes, aceitos também a 50%: 9990\n\n# raiz descartada pelo sampler (AlwaysOff): o span nasce só para levar a flag adiante\nraiz:  não nulo, IsAllDataRequested=False, Id=00-546ef8f0f4a341a8318d12d9fbd91e50-0ed03a74e264de0b-00\nfilho: StartActivity devolveu null",
                    },
                    {
                        type: "text",
                        value: "O segundo grupo de resultados mostra o erro clássico de configuração: um serviço com proporção maior e **sem** `ParentBased` grava spans de traces que o serviço anterior descartou. No backend aparecem pedaços de trace sem raiz, que custam dinheiro e não servem para investigar nada.\n\nO último grupo mostra o que acontece com o span descartado no código. A raiz descartada ainda nasce, com `IsAllDataRequested` igual a `false`, só para o trace id e a flag `00` seguirem adiante; os filhos dela, no mesmo processo, recebem `null` do `StartActivity`. Mais uma razão para o `activity?.` em todo span manual.\n\n## O que a decisão na entrada não consegue\n\nO head sampling é barato e simples, mas decide **antes** de saber como a requisição termina. Com 10%, nove em cada dez requisições com erro somem junto com as bem-sucedidas, e a requisição de 9 segundos de que o cliente reclamou tem 90% de chance de não estar lá. Endpoint raro sofre mais: com 50 chamadas por dia, sobram uns cinco traces.\n\n## Tail sampling: decidir na saída\n\nNo **tail sampling** (amostragem na cauda), a decisão é tomada **depois** que o trace termina, olhando o trace inteiro: por exemplo, guardar 100% dos traces com erro, 100% dos mais lentos que 2 segundos e 5% do resto. O preço:\n\n- **Memória e espera**: os spans de cada trace ficam guardados por alguns segundos, até a hora de decidir.\n- **Tudo no mesmo lugar**: todos os spans de um trace, vindos de todos os serviços, precisam chegar à mesma instância que decide. Com várias instâncias, o roteamento tem de ser por trace id.\n- **Os serviços mandam tudo**: para a decisão enxergar os erros, os SDKs enviam 100% dos spans (ou uma fração alta) até lá, e o tráfego interno sobe.\n\nEsse trabalho mora no Collector, e a configuração dele fica para quando o pipeline for o assunto. Aqui importam a ideia e a comparação:",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\",\"Head sampling\",\"Tail sampling\"],[\"Quando decide\",\"No início do span raiz\",\"Depois que o trace termina\"],[\"Onde roda\",\"No SDK de cada serviço\",\"No Collector\"],[\"Guarda todo erro e toda requisição lenta\",\"Não: decide antes de saber\",\"Sim, por política\"],[\"Custo\",\"Quase nenhum: descarta antes de gravar\",\"Memória para segurar os traces e tráfego interno com todos os spans\"],[\"Trace completo\",\"Sim, com `ParentBased` em todos os serviços\",\"Sim, se todos os spans do trace chegarem à mesma instância\"],[\"Configuração\",\"`SetSampler` ou `OTEL_TRACES_SAMPLER`\",\"Políticas no Collector\"]]",
                    },
                    {
                        type: "text",
                        value: "## Guardar todo erro e toda requisição lenta\n\nNa prática, as estratégias se combinam:\n\n- **Métricas não são amostradas.** Taxa de erro e percentis de latência vêm das métricas, que contam 100% das requisições. O painel e o alerta não dependem de quantos traces sobraram; o trace serve para investigar um caso.\n- **Head sampling moderado no SDK** quando o volume é alto e o orçamento é curto, sabendo que erros raros podem sumir.\n- **Tail sampling no Collector** quando perder o trace de um erro não é aceitável: os SDKs mandam tudo, e a decisão de guardar erro, lentidão e uma fração do resto acontece no fim.\n- **Log de erro de trace descartado é um sinal.** O log escrito dentro de um trace descartado continua saindo com o trace id (conferido rodando: o log de erro trouxe o trace id e a flag de não amostrado, e nenhum span foi exportado). Quem clicar nesse trace id não vai achar nada. Se isso acontece com frequência nos erros, a amostragem está agressiva demais para o caso.\n\nUm fato com data: em outubro de 2026, a especificação do OpenTelemetry marca o `TraceIdRatioBased` como descontinuado em favor de um `ProbabilitySampler` baseado no nível 2 do W3C Trace Context, ainda em desenvolvimento, e garante o comportamento do antigo até pelo menos janeiro de 2027. O SDK .NET 1.20 ainda traz só o `TraceIdRatioBased`. O critério não muda com o nome: proporção fixa nas raízes e respeito à decisão do pai.",
                    },
                    {
                        type: "quote",
                        value: "Head sampling decide na entrada, custa quase nada e mantém o trace inteiro quando todos os serviços respeitam o pai; tail sampling decide na saída, guarda erro e lentidão e cobra memória e tráfego. Proporção nas raízes, `ParentBased` em todo serviço e métricas para o que precisa ser exato.",
                    },
                ],
                questions: [
                    {
                        statement: "No head sampling, em que momento é tomada a decisão de guardar ou descartar um trace?",
                        difficulty: "facil",
                        options: [
                            { text: "No fim do trace, depois de olhar o status e a duração de todos os spans", isCorrect: false },
                            { text: "No backend, depois de os spans ficarem gravados por um período de teste", isCorrect: false },
                            { text: "No exportador, quando o lote de spans está para ser enviado ao Collector", isCorrect: false },
                            { text: "No início do span raiz, antes de saber como a requisição vai terminar", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma API foi para produção com o OpenTelemetry configurado sem `SetSampler` e sem as variáveis `OTEL_TRACES_SAMPLER`. Quanto dos traces é gravado?",
                        difficulty: "facil",
                        options: [
                            { text: "Nenhum: sem sampler definido, o SDK descarta tudo", isCorrect: false },
                            { text: "Metade: o padrão é TraceIdRatioBased em 0.5", isCorrect: false },
                            { text: "Todos: o padrão é ParentBased com a raiz AlwaysOn", isCorrect: true },
                            { text: "Dez por cento: o padrão é TraceIdRatioBased em 0.1", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O serviço A usa `ParentBasedSampler(new TraceIdRatioBasedSampler(0.10))`. O serviço B, chamado por A, foi configurado só com `new TraceIdRatioBasedSampler(0.5)`. O que aparece no backend?",
                        difficulty: "medio",
                        options: [
                            { text: "Nenhum span de B, porque sampler sem ParentBased ignora o pai remoto", isCorrect: false },
                            { text: "Metade dos traces que A guardou, porque B descarta metade do que chega", isCorrect: false },
                            { text: "Os mesmos traces nos dois serviços, porque o trace id é igual nos dois", isCorrect: false },
                            { text: "Além dos traces de A, spans de B em traces que A descartou, sem a raiz", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com head sampling a 10%, por que não dá para garantir que todo trace com erro seja guardado?",
                        difficulty: "medio",
                        options: [
                            { text: "O status Error só é gravado nos traces que ficaram de fora da amostra", isCorrect: false },
                            { text: "A decisão é tomada no começo, quando ainda não se sabe se vai dar erro", isCorrect: true },
                            { text: "O SDK descarta os spans com status Error para economizar banda de rede", isCorrect: false },
                            { text: "Spans com erro não carregam trace id, então ficam fora da amostra feita", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A equipe quer guardar todo trace com erro, todo trace acima de 2 segundos e 5% do resto, decidindo no Collector. Que condição o pipeline precisa garantir para essa decisão funcionar?",
                        difficulty: "dificil",
                        options: [
                            { text: "O span raiz chega antes dos outros, porque a decisão olha só para ele mesmo", isCorrect: false },
                            { text: "Cada serviço amostra 5% no SDK antes de enviar, e o Collector filtra o restante", isCorrect: false },
                            { text: "Os spans chegam em ordem de início, para o Collector conseguir montar a cascata", isCorrect: false },
                            { text: "Todos os spans de um trace chegam à mesma instância, que os segura até decidir", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - O Collector e o pipeline",
        aulas: [
            {
                titulo: "Receivers, processors e exporters",
                blocks: [
                    {
                        type: "text",
                        value: "# Receivers, processors e exporters\n\nDoze serviços .NET mandam traces direto para o Tempo e logs direto para o Loki, cada um com endereço, credencial e política de retry no próprio `appsettings.json`. No dia em que o Tempo muda de endereço, ou alguém decide mandar os logs também para um fornecedor, são doze mudanças e doze deploys. O **OpenTelemetry Collector** tira esse trabalho do código: a aplicação manda tudo por OTLP para um endereço só, e o que acontece depois (filtrar, enriquecer, amostrar, entregar em um ou vários destinos) vira configuração de um processo separado.\n\nO Collector é um binário escrito em Go e configurado por um arquivo YAML. Ele não é banco de dados: recebe, processa em memória e entrega. Tudo nele é montado com poucos tipos de peça:\n\n- **receivers**: a porta de entrada. O `otlp` escuta gRPC na porta 4317 e HTTP na 4318; outros leem arquivo de log, coletam métricas da máquina ou raspam endpoints no formato do Prometheus.\n- **processors**: as etapas do meio, em ordem: limitar memória, juntar em lotes, mexer em atributos, amostrar.\n- **exporters**: a porta de saída, um por destino. Há exporter OTLP, exporter para o Prometheus, exporters de fornecedores e o `debug`, que só imprime no log do próprio Collector.\n- **connectors**: ligam o fim de um pipeline ao começo de outro, quando um sinal gera outro (métricas calculadas a partir de spans, por exemplo).\n- **extensions**: não tocam nos dados; oferecem health check, autenticação, armazenamento em disco.",
                    },
                    {
                        type: "text",
                        value: "## Declarar não é ligar\n\nO arquivo tem uma seção para cada tipo de peça e, no fim, a seção `service`. As seções de cima só **declaram** componentes; quem liga é `service.pipelines`. Um pipeline pertence a um sinal (`traces`, `metrics` ou `logs`) e diz de quais receivers lê, por quais processors passa (na ordem da lista) e para quais exporters entrega. Cada exporter da lista recebe uma cópia: listar dois é mandar para dois destinos.\n\nCada componente tem um identificador no formato `tipo/nome`. O tipo diz qual componente é; o nome, opcional, permite ter dois do mesmo tipo com configurações diferentes, como `otlp_grpc/tempo` e `otlp_grpc/jaeger`. Pipelines seguem a mesma regra: `traces` e `traces/saas` convivem no mesmo arquivo.",
                    },
                    {
                        type: "code",
                        value: "# otelcol.yaml: o esqueleto de um Collector de verdade\nreceivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317\n      http:\n        endpoint: 0.0.0.0:4318\n\nprocessors:\n  memory_limiter:\n    check_interval: 1s\n    limit_percentage: 80\n    spike_limit_percentage: 20\n  batch:\n\nexporters:\n  otlp_grpc/tempo:\n    endpoint: tempo:4317\n    tls:\n      insecure: true\n  debug:\n    verbosity: basic\n\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [otlp_grpc/tempo]\n    metrics:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [debug]\n    logs:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [debug]",
                    },
                    {
                        type: "text",
                        value: "## O que derruba muita gente no primeiro dia\n\n- **`0.0.0.0` no endpoint.** Desde 2024, o receiver OTLP sem `endpoint` escuta só em `localhost` (127.0.0.1), por segurança. Dentro de um contêiner, `localhost` é o próprio contêiner: a porta 4317 está publicada, a aplicação conecta de fora e ninguém responde. Em Docker, declare `0.0.0.0:4317`; em Kubernetes, a recomendação de segurança do projeto é usar o IP do pod (por exemplo `${env:MY_POD_IP}:4317`) em vez de abrir todas as interfaces.\n- **TLS ligado por padrão no exporter OTLP.** O `otlp_grpc` tenta TLS a menos que você diga o contrário. Para um Tempo interno sem TLS, o `tls: insecure: true` é obrigatório; sem ele, a entrega falha na negociação do TLS (o handshake).\n- **Componente esquecido fora do pipeline.** Componente declarado e ausente de todos os pipelines simplesmente não roda, sem erro nem aviso. O contrário é erro: pipeline que cita componente não declarado não sobe (`references processor \"batch\" which is not configured`).\n- **Nomes que mudaram em 2026.** Entre janeiro e maio de 2026, o projeto passou os nomes de componente para snake_case (minúsculas com sublinhado entre as palavras): o exporter `otlp` virou `otlp_grpc`, `otlphttp` virou `otlp_http`, `loadbalancing` virou `load_balancing`, `k8sattributes` virou `k8s_attributes` e `filelog` virou `file_log`. Os nomes antigos ainda funcionam como apelidos obsoletos e só geram um aviso na partida (`\"otlp\" alias is deprecated; use \"otlp_grpc\" instead`). Configuração antiga não quebra hoje, mas vai quebrar quando o apelido sair. O receiver continua se chamando `otlp`.\n- **`logging` não existe mais.** O exporter de depuração é o `debug`; o antigo `logging` foi removido na versão 0.111, em outubro de 2024. Tutorial que usa `logging` dá erro de tipo desconhecido.",
                    },
                    {
                        type: "text",
                        value: "## Distribuição: o componente precisa existir no binário\n\nO Collector é montado na compilação: só existe nele o componente que foi compilado no binário. O projeto publica algumas **distribuições** prontas, e escolher a imagem errada é o erro mais comum depois do endpoint. Acrescente um `tail_sampling` à configuração acima e suba com a imagem core: o Collector para com `'processors' unknown type: \"tail_sampling\"`.\n\nPara saber o que uma imagem tem, use o subcomando `components`. Para conferir o arquivo antes de subir, use o `validate`, com **a mesma imagem e a mesma versão** que vão para produção.",
                    },
                    {
                        type: "table",
                        value: "[[\"Distribuição\",\"Imagem\",\"O que traz\"],[\"core\",\"`otel/opentelemetry-collector`\",\"Um recorte enxuto: OTLP, `batch`, `memory_limiter`, `attributes`, `resource`, `filter`, `debug`, Prometheus, Jaeger, Zipkin, Kafka\"],[\"contrib\",\"`otel/opentelemetry-collector-contrib`\",\"Quase tudo do repositório contrib: `tail_sampling`, `transform`, `redaction`, `load_balancing`, exporters de fornecedores\"],[\"k8s\",\"`otel/opentelemetry-collector-k8s`\",\"O recorte para Kubernetes: `k8s_attributes`, `file_log`, `host_metrics`, `tail_sampling`, `load_balancing`\"],[\"otlp\",\"`otel/opentelemetry-collector-otlp`\",\"Só o receiver e os exporters OTLP, sem nenhum processador\"]]",
                    },
                    {
                        type: "code",
                        value: "# terminal: conferir antes de subir, com a mesma imagem que vai para produção\ndocker run --rm -v \"$PWD\":/cfg otel/opentelemetry-collector-contrib:0.163.1 \\\n  validate --config=/cfg/otelcol.yaml\necho $?   # 0 é sucesso: quando dá certo, o validate não imprime nada\n\n# o que essa imagem tem compilado dentro\ndocker run --rm otel/opentelemetry-collector-contrib:0.163.1 components",
                    },
                    {
                        type: "text",
                        value: "## O que o validate pega e o que deixa passar\n\nO `validate` lê o arquivo, expande as variáveis `${env:...}`, monta cada componente declarado e confere as chaves. Ele pega tipo desconhecido, chave escrita errado (`limit_mb` no lugar de `limit_mib` dá `has invalid keys: limit_mb`), valor obrigatório faltando e pipeline citando componente que não existe. Confere até componente declarado e fora de pipeline, embora esse nunca vá rodar.\n\nO que ele não pega: destino errado ou fora do ar (o exporter só descobre ao tentar entregar, e o erro aparece no log do Collector em execução), apelido obsoleto (o aviso só sai na partida) e lógica errada, como um processador que apaga o atributo que você queria guardar. Por isso o roteiro completo é: `validate`, subir, procurar `Everything is ready` no log e mandar dados de teste olhando a saída do `debug`.",
                    },
                    {
                        type: "quote",
                        value: "O Collector é feito de receivers, processors e exporters ligados por pipelines de um sinal cada, e só roda o que aparece em `service.pipelines`. Confira cada arquivo com `validate` na mesma imagem e versão de produção, sabendo que ele pega erro de configuração, mas não destino fora do ar nem lógica errada.",
                    },
                ],
                questions: [
                    {
                        statement: "Um exporter `otlp_grpc/tempo` está declarado em `exporters`, com o endpoint certo, mas nenhum span chega ao Tempo e o log do Collector não mostra erro algum. Qual é a causa mais provável?",
                        difficulty: "facil",
                        options: [
                            { text: "O exporter não está na lista `exporters` de nenhum pipeline em `service.pipelines`", isCorrect: true },
                            { text: "O exporter precisa de `enabled: true`, que vem desligado em toda declaração nova de exporter", isCorrect: false },
                            { text: "Exporter com nome depois da barra só roda se for citado em `service.extensions`", isCorrect: false },
                            { text: "O Tempo só aceita OTLP por HTTP, e o `otlp_grpc` descarta os spans em silêncio", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O Collector roda em Docker com a porta 4317 publicada, e o receiver `otlp` declara `grpc:` sem `endpoint`. A aplicação, fora do contêiner, não consegue entregar nada. O que resolve?",
                        difficulty: "facil",
                        options: [
                            { text: "Declarar `endpoint: 0.0.0.0:4317`, porque o padrão `localhost` só atende quem está dentro do contêiner", isCorrect: true },
                            { text: "Acrescentar `enabled: true` sob `grpc:`, porque o protocolo vem desligado enquanto falta essa chave", isCorrect: false },
                            { text: "Declarar `endpoint: 0.0.0.0:4318`, porque a 4318 é a porta padrão do gRPC no receiver OTLP do Collector", isCorrect: false },
                            { text: "Acrescentar `tls: insecure: true` ao receiver, porque ele exige TLS de todo cliente que se conecta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O Tempo da rede interna recebe OTLP por gRPC sem TLS, e o Collector declara o exporter assim, usado no pipeline de traces:\n\n```yaml\nexporters:\n  otlp_grpc/tempo:\n    endpoint: tempo:4317\n```\n\nO arquivo passa no `validate`, mas nenhum span chega ao Tempo. O que está acontecendo?",
                        difficulty: "medio",
                        options: [
                            { text: "O `otlp_grpc` só entrega depois de juntar 8192 spans, porque o lote do exporter vem ligado", isCorrect: false },
                            { text: "O exporter percebe que o Tempo não tem TLS e troca para HTTP na 4318, onde ninguém escuta nada", isCorrect: false },
                            { text: "O exporter comprime com gzip por padrão, e o Tempo recusa o envio comprimido sem dar aviso", isCorrect: false },
                            { text: "O exporter usa TLS por padrão, a negociação com o Tempo falha e falta `tls: insecure: true`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Ao subir com a imagem `otel/opentelemetry-collector:0.163.1`, o Collector para com o erro `'processors' unknown type: \"tail_sampling\"`. O mesmo arquivo passa no `validate` da imagem contrib. O que explica a diferença?",
                        difficulty: "medio",
                        options: [
                            { text: "A imagem core não traz o `tail_sampling`, que está nas distribuições contrib e k8s", isCorrect: true },
                            { text: "Na imagem core, o `tail_sampling` precisa ser listado também em `service.extensions`", isCorrect: false },
                            { text: "Falta `decision_wait`, chave obrigatória que a core confere e a contrib deixa passar", isCorrect: false },
                            { text: "O processador mudou de nome para `tailsampling` na 0.163, e a core só aceita o nome novo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destes problemas passa pelo `validate` sem erro e só aparece com o Collector rodando?",
                        difficulty: "dificil",
                        options: [
                            { text: "Um `memory_limiter` sem `check_interval` está declarado, mas fora de qualquer pipeline", isCorrect: false },
                            { text: "O exporter aponta para `tempo:4317`, mas o serviço na rede se chama `tempo-distributor`", isCorrect: true },
                            { text: "O `memory_limiter` usa a chave `limit_mb`, quando o nome certo é a chave `limit_mib`", isCorrect: false },
                            { text: "O pipeline de logs cita o processador `batch`, que não foi declarado na seção `processors`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Processadores essenciais",
                blocks: [
                    {
                        type: "text",
                        value: "# Processadores essenciais\n\nBlack Friday: o tráfego quintuplica, o Tempo demora para responder e o Collector passa a segurar cada vez mais dados esperando a vez de entregar. A memória sobe até o limite do contêiner, o kernel mata o processo (OOMKilled) e, junto com ele, vai tudo o que estava na fila. Enquanto o Collector reinicia, os SDKs das aplicações tentam reenviar e encontram a porta fechada. Os processadores que toda configuração de produção tem existem para que isso não aconteça, e para que o dado saia do Collector do jeito certo.\n\n## memory_limiter: recusar antes de morrer\n\nO `memory_limiter` mede a memória do processo a cada `check_interval` e trabalha com dois limites. O **rígido** vem de `limit_mib` (em MiB) ou de `limit_percentage` (porcentagem da memória total, que em contêiner é o limite do cgroup). O **flexível** é o rígido menos a folga para picos, `spike_limit_mib` ou `spike_limit_percentage`, que vale 20% do limite quando você não informa. Acima do flexível, ele passa a **recusar** dados novos com um erro temporário, que volta pelo pipeline até o receiver; o receiver OTLP repassa a falha ao cliente, e um SDK que sabe reenviar tenta de novo mais tarde. Acima do rígido, além de recusar, ele força a coleta de lixo do Go. É uma válvula de alívio: o que ninguém reenviar se perde, mas o processo fica de pé, com tudo o que já estava na fila.",
                    },
                    {
                        type: "code",
                        value: "# otelcol.yaml (trecho): contêiner com limite de 1 GiB\nprocessors:\n  memory_limiter:\n    check_interval: 1s          # sem ele, o validate recusa a configuração\n    limit_percentage: 80        # limite rígido: 80% de 1 GiB, uns 819 MiB\n    spike_limit_percentage: 20  # limite flexível: 80% menos 20% = 60%, uns 614 MiB",
                    },
                    {
                        type: "text",
                        value: "Três regras para o `memory_limiter`:\n\n- **É o primeiro da lista.** Se outro processador vier antes, a memória já foi gasta quando ele decide recusar.\n- **Em contêiner, prefira porcentagem.** O Collector lê o limite do contêiner e calcula os valores a partir dele: num teste com contêiner de 256 MiB e a configuração acima, o log da partida mostrou `limit_mib: 204` e `spike_limit_mib: 51`. Mudou o limite no orquestrador, o Collector acompanha sem mexer no YAML. O `limit_mib` serve para máquina sem limite de contêiner.\n- **`check_interval` não tem padrão útil.** O padrão é zero, e o `validate` recusa a configuração sem ele (`'check_interval' must be greater than zero`). A documentação recomenda 1 segundo e recomenda também a variável de ambiente `GOMEMLIMIT` em torno de 80% do limite rígido de memória do Collector, para o coletor de lixo do Go trabalhar a favor.",
                    },
                    {
                        type: "text",
                        value: "## batch: lotes, e o plano de mudá-los de lugar\n\nO `batch` junta itens antes de entregar: menos requisições e compressão melhor. Ele envia quando junta 8192 itens (`send_batch_size`) ou a cada 200 ms (`timeout`), o que vier primeiro, e não impõe tamanho máximo a menos que você configure `send_batch_max_size`.\n\nA ordem recomendada pela documentação oficial é esta: `memory_limiter`; processadores que descartam dados (amostragem, filtro); os que dependem do contexto da conexão, como o `k8s_attributes`; os que transformam ou enriquecem (`attributes`, `transform`, `redaction`); e o `batch` por último. A versão antiga dessa lista punha o `batch` antes das transformações, e muito tutorial ainda está assim: o resultado é montar lote com dado que ainda vai ser mexido ou jogado fora.\n\nO lote também está mudando de lugar. Cada exporter tem uma fila de envio (`sending_queue`) que sabe montar lotes sozinha, e a documentação dos processadores já recomenda preferir o lote do exporter quando ele existir. Em junho de 2026, o projeto publicou um plano para descontinuar o processador `batch` e tirá-lo da distribuição padrão, com um substituto (`queue_batch`) para os casos em que um lote compartilhado ainda fizer falta. Na versão 0.163, o `batch` funciona e não imprime aviso; os exemplos deste módulo usam o `batch` porque ele ainda é o mais comum, mas configuração nova pode nascer com o lote no exporter:",
                    },
                    {
                        type: "code",
                        value: "# otelcol.yaml (trecho): o lote montado pelo próprio exporter\nexporters:\n  otlp_grpc/tempo:\n    endpoint: tempo:4317\n    tls:\n      insecure: true\n    sending_queue:\n      batch:\n        flush_timeout: 200ms   # envia a cada 200 ms...\n        min_size: 8192         # ...ou ao juntar 8192 itens, o que vier primeiro",
                    },
                    {
                        type: "text",
                        value: "## Atributos: carimbar, trocar, apagar\n\nO `resource` mexe nos atributos de recurso, que descrevem quem gerou o dado (`service.name`, ambiente, região). O `attributes` mexe nos atributos de cada span, registro de log ou ponto de métrica. As ações são `insert`, `update`, `upsert`, `delete`, `hash`, `extract` e `convert`, aplicadas a uma chave exata (`key`) ou às chaves que casam com uma expressão regular (`pattern`). Uso típico: o Collector de produção carimba `deployment.environment.name: producao` em tudo o que passa, em vez de cada serviço lembrar de configurar.\n\n## Dado sensível: a última barreira antes de sair da rede\n\nA primeira defesa é não emitir: dado pessoal não entra em atributo nem em log. Mas o código muda toda semana, e alguém sempre deixa escapar alguma coisa. O Collector é o lugar de pegar o que escapou **antes** de o dado atravessar para um fornecedor fora da sua rede. O trecho abaixo tem os dois vazamentos mais comuns:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (trecho): o que escapou para a telemetria\napp.MapPost(\"/pagamentos\", (Pagamento pagamento, ILogger<Program> logger) =>\n{\n    using var activity = Telemetria.Pagamentos.StartActivity(\"AutorizarPagamento\");\n    activity?.SetTag(\"cliente.email\", pagamento.Email); // posto para depurar e esquecido\n    activity?.SetTag(\"cliente.cpf\", pagamento.Cpf);\n\n    // template: o CPF vira o atributo Cpf do registro, e o corpo leva só o template\n    logger.LogWarning(\"Pagamento recusado para o CPF {Cpf}\", pagamento.Cpf);\n\n    // interpolação: o CPF vai parar no corpo do log, como texto livre\n    logger.LogWarning($\"Pagamento recusado para o CPF {pagamento.Cpf}\");\n\n    return TypedResults.UnprocessableEntity();\n});",
                    },
                    {
                        type: "text",
                        value: "Cada formato de vazamento pede uma ferramenta. As três abaixo estão nas distribuições contrib e k8s; na core, só o `attributes`.\n\n- **Atributo com nome conhecido.** O `attributes` com `delete` por `pattern` apaga o `cliente.cpf` do span e o `Cpf` que o template criou no log. Num teste com o OpenTelemetry .NET 1.20, o registro chegou ao Collector com o corpo `Pagamento recusado para o CPF {Cpf}` e o número no atributo `Cpf`.\n- **Atributo que precisa continuar correlacionável.** O `hash` do `attributes` é SHA-256 sem chave: o valor coletado no teste era exatamente o SHA-256 do e-mail. Para e-mail, CPF e telefone, isso não esconde nada. O CPF tem 9 dígitos livres, um bilhão de combinações que qualquer computador calcula, e quem tem uma lista de e-mails calcula o hash de cada um e compara. O `redaction` com `hash_function: hmac-sha256` usa uma chave secreta, vinda de variável de ambiente, de pelo menos 32 bytes (com menos, o Collector não sobe; sem a variável, nem o `validate` passa).\n- **Texto livre.** No corpo do log interpolado, só uma expressão regular acha o CPF. O `transform`, com a linguagem OTTL, faz `replace_pattern` no corpo; no teste, a linha saiu como `Pagamento recusado para o CPF ***.***.***-**`.",
                    },
                    {
                        type: "code",
                        value: "# otelcol.yaml (trecho): uma ferramenta para cada formato de vazamento\nprocessors:\n  attributes/pii:\n    actions:\n      - pattern: (?i)cpf         # apaga cliente.cpf do span e o Cpf do log\n        action: delete\n  redaction/pii:\n    allow_all_keys: true\n    blocked_key_patterns:\n      - (?i).*email.*            # o valor vira um HMAC: some, mas ainda correlaciona\n    hash_function: hmac-sha256\n    hmac_key: ${env:REDACTION_HMAC_KEY}\n    summary: silent\n  transform/cpf:\n    log_statements:\n      - replace_pattern(log.body, \"\\\\d{3}\\\\.?\\\\d{3}\\\\.?\\\\d{3}-?\\\\d{2}\", \"***.***.***-**\")\n\nservice:\n  pipelines:\n    logs:\n      receivers: [otlp]\n      processors: [memory_limiter, attributes/pii, redaction/pii, transform/cpf, batch]\n      exporters: [otlp_http/loki]",
                    },
                    {
                        type: "quote",
                        value: "Todo pipeline de produção começa com o `memory_limiter` e termina com o lote, no `batch` ou no próprio exporter. No meio, o Collector é a última barreira para dado sensível: apague o que der, use HMAC com chave quando precisar correlacionar e não confunda hash sem chave com anonimização.",
                    },
                ],
                questions: [
                    {
                        statement: "Em que posição o `memory_limiter` deve ficar na lista de processors de um pipeline, e por quê?",
                        difficulty: "facil",
                        options: [
                            { text: "Em qualquer posição, porque ele mede a memória do processo e não a de cada pipeline", isCorrect: false },
                            { text: "Em primeiro, para recusar dados antes que outros processadores gastem memória com eles", isCorrect: true },
                            { text: "Logo depois do `batch`, para recusar lotes inteiros em vez de itens soltos e espalhados", isCorrect: false },
                            { text: "Em último, para medir a memória depois que todos os outros processadores já trabalharam", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o `memory_limiter` faz quando a memória do Collector passa do limite flexível?",
                        difficulty: "facil",
                        options: [
                            { text: "Reinicia o processo do Collector de forma controlada, sem perder o que estava na fila", isCorrect: false },
                            { text: "Recusa dados novos com um erro temporário, que volta até o receiver e a quem enviou", isCorrect: true },
                            { text: "Passa a gravar os dados recebidos em disco até a memória voltar abaixo do limite", isCorrect: false },
                            { text: "Apaga os itens mais antigos das filas dos exporters até a memória baixar de novo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com a configuração abaixo, a partir de quanta memória o Collector começa a recusar dados?\n\n```yaml\nprocessors:\n  memory_limiter:\n    check_interval: 1s\n    limit_mib: 1000\n```",
                        difficulty: "medio",
                        options: [
                            { text: "200 MiB: sem `spike_limit_mib`, o limite flexível passa a ser 20% do limite configurado", isCorrect: false },
                            { text: "900 MiB: sem `spike_limit_mib`, a folga padrão é fixa em 100 MiB para qualquer limite", isCorrect: false },
                            { text: "800 MiB: sem `spike_limit_mib`, a folga é 20% de 1000, e o flexível fica em 1000 menos 200", isCorrect: true },
                            { text: "1000 MiB: sem `spike_limit_mib`, o limite flexível e o rígido ficam no mesmo valor de 1000", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Antes de mandar os spans a um fornecedor, a equipe aplicou a ação `hash` do processador `attributes` ao atributo com o e-mail do cliente. Por que isso não esconde o e-mail?",
                        difficulty: "medio",
                        options: [
                            { text: "O `hash` só vale para atributos de log, e os spans seguem com o e-mail original no atributo", isCorrect: false },
                            { text: "O `hash` só troca a parte antes da arroba, e o domínio do e-mail continua visível no valor", isCorrect: false },
                            { text: "O hash é SHA-256 sem chave: quem tem uma lista de e-mails calcula cada um e acha o dono", isCorrect: true },
                            { text: "O processador guarda o valor original num atributo de auditoria, enviado junto com o span", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API .NET registra `logger.LogWarning(\"Pagamento recusado para o CPF {Cpf}\", cpf)`, com a configuração padrão do OpenTelemetry .NET. No pipeline de logs do Collector, a única proteção é esta:\n\n```yaml\ntransform/cpf:\n  log_statements:\n    - replace_pattern(log.body, \"\\\\d{3}\\\\.?\\\\d{3}\\\\.?\\\\d{3}-?\\\\d{2}\", \"***.***.***-**\")\n```\n\nO CPF continua chegando ao destino. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "Com template, o CPF vai no atributo `Cpf`, e o corpo do registro leva só o texto do template", isCorrect: true },
                            { text: "O `replace_pattern` só funciona em spans; para logs, o caminho seria `log.attributes`", isCorrect: false },
                            { text: "O YAML entrega `\\\\d` ao OTTL, que então procura uma barra invertida antes de cada dígito", isCorrect: false },
                            { text: "O `transform` roda depois do exporter, quando o corpo do log já foi serializado para o envio", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Tail sampling no Collector",
                blocks: [
                    {
                        type: "text",
                        value: "# Tail sampling no Collector\n\nA regra que todo time quer é simples: guardar todo trace com erro, todo trace lento e uma amostra pequena do resto. No SDK ela é impossível, porque o head sampling decide quando o primeiro span nasce, antes de saber se a requisição vai falhar ou demorar. Quem consegue aplicar a regra é quem olha o trace **depois** de pronto: o processador `tail_sampling` do Collector, presente nas distribuições contrib e k8s (não na core).\n\nO preço é a espera. O Collector não sabe quando um trace acabou, porque um span de outro serviço pode chegar segundos depois. Então ele agrupa os spans por trace ID, segura tudo em memória e espera o `decision_wait` (30 segundos por padrão), contado a partir do primeiro span daquele trace. Só então avalia as políticas e solta o trace inteiro, ou descarta o trace inteiro.\n\n## O SDK precisa mandar tudo\n\nO tail sampling só escolhe entre o que chegou. Se a aplicação continua amostrando 10% na origem, a regra \"todo erro\" vira \"10% dos erros\", sem aviso nenhum. Com tail sampling no Collector, o SDK fica no padrão, que envia todo trace iniciado na aplicação e segue a decisão de quem chamou; por isso todos os serviços do caminho precisam estar assim.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: com tail sampling no Collector, a aplicação envia 100% dos traces\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pagamentos-api\"))\n    .WithTracing(t => t\n        // é o padrão do SDK, escrito aqui para ninguém trocar sem saber o motivo\n        .SetSampler(new ParentBasedSampler(new AlwaysOnSampler()))\n        // errado junto com tail sampling: só 10% dos traces chegariam ao Collector\n        // .SetSampler(new TraceIdRatioBasedSampler(0.1))\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation())\n    .UseOtlpExporter();",
                    },
                    {
                        type: "text",
                        value: "## Como as políticas se combinam\n\n- **Uma política que guarda basta.** As políticas da lista funcionam como um OU: se qualquer uma votar por guardar, o trace fica. Para exigir duas condições juntas existe a política `and`.\n- **Uma política `drop` que casa vence tudo**, inclusive o erro. É o que se quer para health check, e é o que derruba traces importantes quando a regra fica larga demais. As decisões invertidas do `invert_match`, comuns em exemplos antigos, estão obsoletas; o caminho atual é `drop` ou `not`.\n- **`status_code` olha o status do span, não o código HTTP.** A instrumentação do ASP.NET Core marca `Error` em resposta 5xx do servidor; 404 e 422 ficam `Unset` (conferido com o OpenTelemetry .NET 1.20). Se o negócio quer guardar 4xx, a política tem que olhar o atributo `http.response.status_code`.\n- **`latency` mede do início mais cedo ao fim mais tarde** entre os spans que chegaram, sem olhar o que aconteceu no meio.\n\nA regra do começo da aula, em YAML (num teste com a 0.163, a `drop` derrubou até um trace que a política de latência mandava guardar):",
                    },
                    {
                        type: "code",
                        value: "# otelcol.yaml (trecho): todo erro, todo trace lento, 5% do resto, nada de health check\nprocessors:\n  tail_sampling:\n    decision_wait: 10s\n    num_traces: 100000\n    expected_new_traces_per_sec: 2000\n    decision_cache:\n      sampled_cache_size: 500000\n    policies:\n      - name: erros\n        type: status_code\n        status_code:\n          status_codes: [ERROR]\n      - name: lentos\n        type: latency\n        latency:\n          threshold_ms: 2000\n      - name: amostra-do-resto\n        type: probabilistic\n        probabilistic:\n          sampling_percentage: 5\n      - name: sem-health-check\n        type: drop\n        drop:\n          drop_sub_policy:\n            - name: rotas-de-saude\n              type: string_attribute\n              string_attribute:\n                key: url.path\n                values: [/health, /alive]",
                    },
                    {
                        type: "text",
                        value: "## O custo: tudo em memória\n\nCada span de cada trace fica em memória durante a espera. Uma conta de ordem de grandeza: 2.000 traces novos por segundo vezes 10 segundos de espera dão 20.000 traces sempre em memória; com 30 spans de cerca de 1 KB cada, são uns 600 MB só de spans. Com o `decision_wait` padrão de 30 segundos, o triplo.\n\nO `num_traces` é o teto desse buffer, a área de memória onde os traces esperam a decisão. Quando ele enche, o trace mais antigo sai **antes** de ser decidido e se perde, tenha erro ou não; a métrica `otelcol_processor_tail_sampling_sampling_trace_dropped_too_early` conta esses casos. As saídas são reduzir a espera (mais spans atrasados) ou aumentar o teto (mais memória), sempre com o `memory_limiter` na frente.\n\nSpan atrasado é o que chega depois da decisão. Se a decisão ainda está no buffer, ele a herda. Se já saiu e não há cache de decisão, o Collector trata o span como um trace novo e decide sobre um pedaço. O `decision_cache` guarda só os IDs dos traces decididos, por muito mais tempo que os spans, e resolve a maior parte desses casos.",
                    },
                    {
                        type: "table",
                        value: "[[\"Configuração\",\"Padrão\",\"Aumentar significa\"],[\"`decision_wait`\",\"30s\",\"menos spans atrasados, mais memória\"],[\"`num_traces`\",\"50000\",\"menos traces perdidos antes da decisão, mais memória\"],[\"`decision_cache.sampled_cache_size`\",\"0 (desligado)\",\"spans atrasados de traces guardados continuam sendo guardados\"],[\"`expected_new_traces_per_sec`\",\"0\",\"só ajuda a reservar estruturas internas de antemão\"]]",
                    },
                    {
                        type: "text",
                        value: "## Todos os spans de um trace no mesmo Collector\n\nA documentação é taxativa: todos os spans de um trace precisam chegar à mesma instância. Com três réplicas atrás de um balanceador comum, o span com erro cai na réplica A e os outros nas réplicas B e C. A guarda o seu pedaço; B e C não veem erro nenhum e descartam os seus (salvo os 5%). No Tempo aparece um trace com um span só, justamente o que deveria estar inteiro.\n\nA saída é ter duas camadas. A primeira recebe das aplicações e usa o exporter `load_balancing` (chamado `loadbalancing` até maio de 2026, nome que continua como apelido obsoleto), que calcula o destino pelo trace ID e manda todos os spans do mesmo trace para a mesma instância da segunda camada, onde roda o `tail_sampling`. A lista de instâncias vem de um resolver: `static` (lista fixa), `dns` (um Service headless do Kubernetes, que devolve o IP de cada réplica) ou `k8s`. Quando o número de instâncias muda, parte dos traces passa a ir para outro destino, e alguns ficam partidos durante a mudança.",
                    },
                    {
                        type: "code",
                        value: "# camada1.yaml: recebe das aplicações e espalha os spans por trace ID\nreceivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317\n\nprocessors:\n  memory_limiter:\n    check_interval: 1s\n    limit_percentage: 80\n    spike_limit_percentage: 20\n\nexporters:\n  load_balancing:\n    routing_key: traceID\n    protocol:\n      otlp:\n        tls:\n          insecure: true\n    resolver:\n      dns:\n        hostname: otel-amostragem-headless.observabilidade.svc.cluster.local\n        port: \"4317\"   # texto: com número, o validate recusa\n\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [memory_limiter]\n      exporters: [load_balancing]",
                    },
                    {
                        type: "quote",
                        value: "Tail sampling decide depois de ver o trace e paga com memória: cada span espera o `decision_wait` dentro do Collector, e o `num_traces` limita quantos traces cabem. Só funciona se o SDK mandar tudo e se todos os spans de um trace chegarem à mesma instância, o que pede uma camada com `load_balancing` na frente.",
                    },
                ],
                questions: [
                    {
                        statement: "A aplicação configura `TraceIdRatioBasedSampler(0.1)` no SDK, e o Collector tem `tail_sampling` com uma política que guarda todo trace com erro. Que parte dos traces com erro chega ao backend?",
                        difficulty: "facil",
                        options: [
                            { text: "Todos, porque span com erro passa por cima do amostrador do SDK e é enviado", isCorrect: false },
                            { text: "Todos, porque o tail sampling reconstrói os traces que o SDK deixou de enviar", isCorrect: false },
                            { text: "Nenhum, porque head e tail sampling ligados juntos se anulam no Collector", isCorrect: false },
                            { text: "Cerca de 10%, porque o Collector só escolhe entre os traces que o SDK enviou", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O `tail_sampling` tem três políticas: `status_code` guardando `ERROR`, `probabilistic` com 5% e uma `drop` para `url.path` igual a `/health`. Uma chamada a `/health` falha com 500 e o span fica com status `Error`. O trace é guardado?",
                        difficulty: "facil",
                        options: [
                            { text: "Sim, porque trace com erro é sempre guardado, qualquer que seja a lista de políticas", isCorrect: false },
                            { text: "Sim, porque a política de erro vem antes da `drop` na lista e decide primeiro", isCorrect: false },
                            { text: "Só em 5% dos casos, porque a `drop` devolve o trace para a política probabilística", isCorrect: false },
                            { text: "Não, porque uma política `drop` que casa vence qualquer voto para guardar o trace", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Três réplicas do Collector com `tail_sampling` ficam atrás de um balanceador que distribui as conexões em rodízio. No Tempo, muitos traces com erro aparecem com poucos spans. Qual é a causa e a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "O balanceador precisa de afinidade pelo IP do cliente, para manter cada trace inteiro numa só réplica", isCorrect: false },
                            { text: "O `decision_wait` é curto; aumentá-lo dá tempo de cada réplica juntar todos os pedaços de cada trace", isCorrect: false },
                            { text: "Falta `decision_cache`; com ele, as três réplicas passam a compartilhar as decisões que cada uma toma", isCorrect: false },
                            { text: "Cada réplica vê só parte dos spans de um trace; uma camada de `load_balancing` por trace ID resolve", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma API ASP.NET Core, instrumentada com o OpenTelemetry .NET, responde 404 a um cliente externo sem instrumentação, e o trace tem só o span de servidor da API. O `tail_sampling` tem uma política `status_code` que guarda `ERROR`. Essa política guarda o trace?",
                        difficulty: "medio",
                        options: [
                            { text: "Não: a política `status_code` só enxerga spans criados à mão com `ActivitySource`", isCorrect: false },
                            { text: "Sim: a política converte o código HTTP em status antes de comparar com `ERROR`", isCorrect: false },
                            { text: "Não: em span de servidor, 4xx fica com status `Unset`, e só 5xx vira `Error`", isCorrect: true },
                            { text: "Sim: toda resposta de 400 para cima marca o span de servidor com `Error`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um Collector com `tail_sampling` usa `decision_wait: 30s` e `num_traces: 50000`. O tráfego sobe para 2.500 traces novos por segundo, e a métrica `otelcol_processor_tail_sampling_sampling_trace_dropped_too_early` passa a crescer. O que está acontecendo?",
                        difficulty: "dificil",
                        options: [
                            { text: "30 s de espera a 2.500 traces por segundo pedem 75 mil vagas; os mais antigos saem antes da decisão", isCorrect: true },
                            { text: "Os traces passaram de 30 s de duração, e a política de latência os descarta antes da decisão", isCorrect: false },
                            { text: "O `memory_limiter` recusou spans, e os traces incompletos são marcados como chegados cedo demais", isCorrect: false },
                            { text: "A taxa passou do `expected_new_traces_per_sec`, e o excedente é recusado assim que chega ao Collector", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Vários destinos ao mesmo tempo",
                blocks: [
                    {
                        type: "text",
                        value: "# Vários destinos ao mesmo tempo\n\nA empresa usa Prometheus, Tempo e Loki e vai avaliar um fornecedor SaaS por três meses, mandando os mesmos dados para os dois lados para comparar. No fim, pode ficar com o fornecedor, trocar por outro ou voltar só para a pilha aberta. Se cada serviço usasse o agente ou a biblioteca proprietária do fornecedor, cada uma dessas etapas seria mudança de código em dezenas de serviços. Com as aplicações falando só OTLP com o Collector, cada etapa é uma mudança de YAML, num lugar só.\n\n## A aplicação só conhece o Collector\n\nO `UseOtlpExporter()` registra o exporter OTLP para traces, métricas e logs de uma vez e lê o endereço da variável `OTEL_EXPORTER_OTLP_ENDPOINT`. Trocar de fornecedor não toca neste arquivo nem na variável: a aplicação continua mandando para o mesmo Collector. Só não misture com o `AddOtlpExporter()` de um sinal: os dois juntos compilam, mas a aplicação cai na partida com `NotSupportedException` (conferido com o OpenTelemetry .NET 1.20).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: nada aqui sabe para onde os dados vão depois do Collector\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pedidos-api\"))\n    .WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation())\n    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation())\n    .WithLogging()\n    .UseOtlpExporter(); // lê OTEL_EXPORTER_OTLP_ENDPOINT, por exemplo http://otel-collector:4317",
                    },
                    {
                        type: "text",
                        value: "## Um exporter por destino\n\n- **Tempo** recebe OTLP nativo: `otlp_grpc` na porta 4317.\n- **Loki** aceita OTLP nativo no caminho `/otlp`, e o `otlp_http` acrescenta `/v1/logs` sozinho. O exporter `loki` antigo foi descontinuado em julho de 2024 e removido na versão 0.131, em 2025: configuração com `loki:` em `exporters` não sobe mais. A documentação do Loki ainda escreve `otlphttp`, o nome antigo, que funciona como apelido.\n- **Prometheus** tem três caminhos, na tabela abaixo. No Prometheus 3, o mais direto é o receiver OTLP; desligado, ele responde 404 com a mensagem `otlp write receiver needs to be enabled with --web.enable-otlp-receiver` (conferido no 3.13).\n- **Fornecedor SaaS**: a maioria aceita OTLP direto, então basta um `otlp_http` (ou `otlp_grpc`) com o endereço e a chave de API num cabeçalho. Alguns têm exporter próprio no contrib. A chave vem de variável de ambiente com `${env:...}` e nunca fica escrita no YAML que vai para o repositório.",
                    },
                    {
                        type: "table",
                        value: "[[\"Caminho até o Prometheus\",\"No Collector\",\"No Prometheus\",\"Observação\"],[\"OTLP (empurra)\",\"`otlp_http` para `http://prometheus:9090/api/v1/otlp`\",\"`--web.enable-otlp-receiver`\",\"desligado por padrão, porque o endpoint não tem autenticação própria\"],[\"Remote write (empurra)\",\"`prometheus_remote_write` para `/api/v1/write`\",\"`--web.enable-remote-write-receiver`\",\"protocolo nativo do ecossistema, aceito também pelo Mimir\"],[\"Scrape (puxa)\",\"`prometheus`, que expõe `/metrics` numa porta do Collector\",\"um `scrape_config` apontando para o Collector\",\"o Prometheus dita o ritmo, e o Collector vira um alvo como outro qualquer\"]]",
                    },
                    {
                        type: "code",
                        value: "# otelcol.yaml: pilha aberta e fornecedor SaaS recebendo ao mesmo tempo\nreceivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317\n      http:\n        endpoint: 0.0.0.0:4318\n\nprocessors:\n  memory_limiter:\n    check_interval: 1s\n    limit_percentage: 80\n    spike_limit_percentage: 20\n  batch:\n\nexporters:\n  otlp_grpc/tempo:\n    endpoint: tempo:4317\n    tls:\n      insecure: true\n  otlp_http/loki:\n    endpoint: http://loki:3100/otlp\n  otlp_http/prometheus:\n    endpoint: http://prometheus:9090/api/v1/otlp\n  otlp_http/saas:\n    endpoint: https://otlp.fornecedor.example\n    headers:\n      api-key: ${env:SAAS_API_KEY}\n\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [otlp_grpc/tempo, otlp_http/saas]\n    metrics:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [otlp_http/prometheus, otlp_http/saas]\n    logs:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [otlp_http/loki, otlp_http/saas]",
                    },
                    {
                        type: "text",
                        value: "## Cada destino com a sua fila\n\nCada exporter tem a sua fila de envio (`sending_queue`, ligada por padrão, com até 1.000 requisições em memória) e a sua política de retry (`retry_on_failure`: primeira nova tentativa em 5 segundos, intervalo crescendo até 30 segundos, desistência depois de 5 minutos). Quando o fornecedor cai, a fila dele enche e as tentativas seguem; Tempo, Loki e Prometheus continuam recebendo, porque a entrega a eles não espera a do fornecedor. Quando a fila lota, o que não cabe é descartado para aquele destino e aparece nas métricas `otelcol_exporter_enqueue_failed_*` do Collector. Para a fila sobreviver a um reinício, `sending_queue.storage` com a extensão `file_storage` guarda a fila em disco.\n\n## Tratamento diferente por destino\n\nO mesmo receiver pode alimentar dois pipelines do mesmo sinal, e cada pipeline recebe a sua cópia: o que um processador faz num pipeline não aparece no outro. Assim dá para mandar tudo para a pilha interna e só uma parte para o fornecedor, que cobra por volume. O `filter` descarta o que casar com a condição; desde a versão 0.146 ele usa `log_conditions` com caminhos como `log.severity_number`, e a sintaxe antiga, com `logs:` e `log_record:`, ainda é aceita, mas saiu da documentação.",
                    },
                    {
                        type: "code",
                        value: "# otelcol.yaml (trecho): o SaaS cobra por volume e só recebe aviso e erro\nprocessors:\n  filter/so-avisos:\n    error_mode: ignore\n    log_conditions:\n      - log.severity_number < SEVERITY_NUMBER_WARN\n\nservice:\n  pipelines:\n    logs:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [otlp_http/loki]\n    logs/saas:\n      receivers: [otlp]\n      processors: [memory_limiter, filter/so-avisos, batch]\n      exporters: [otlp_http/saas]",
                    },
                    {
                        type: "text",
                        value: "## Trocar de fornecedor\n\nCom essa estrutura, a troca é um roteiro de configuração:\n\n1. Acrescente o exporter do fornecedor novo ao lado do antigo e mande para os dois durante algumas semanas, comparando o que cada um mostra.\n2. Tire o exporter antigo da lista dos pipelines e, depois, a declaração dele.\n3. Publique a configuração nova do Collector. Nenhuma aplicação é recompilada nem reiniciada.\n\nO que prende a um fornecedor não é o Collector: é biblioteca proprietária dentro do código, atributo com nome inventado pelo fornecedor em vez das convenções semânticas do OpenTelemetry e tudo o que foi construído dentro da ferramenta dele, que se refaz de qualquer jeito.",
                    },
                    {
                        type: "quote",
                        value: "Com a aplicação falando só OTLP, cada destino vira um exporter, com fila e retry próprios, e cada tratamento diferente vira um pipeline. Trocar de fornecedor passa a ser mudar o YAML do Collector, sem tocar em código nem reiniciar aplicação.",
                    },
                ],
                questions: [
                    {
                        statement: "As aplicações mandam OTLP para o Collector, que entrega a um fornecedor SaaS. A empresa decide trocar de fornecedor. O que precisa mudar?",
                        difficulty: "facil",
                        options: [
                            { text: "O exporter do fornecedor na configuração do Collector, sem deploy das aplicações", isCorrect: true },
                            { text: "O receiver do Collector, que passa a falar o protocolo próprio do fornecedor novo", isCorrect: false },
                            { text: "A variável `OTEL_EXPORTER_OTLP_ENDPOINT` de cada serviço, apontando para o fornecedor", isCorrect: false },
                            { text: "O pacote de exporter do fornecedor em cada aplicação, com novo deploy de cada uma", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em 2026, como o Collector entrega logs ao Loki?",
                        difficulty: "facil",
                        options: [
                            { text: "Por um `otlp_http` apontando para o caminho `/otlp` do Loki, que aceita OTLP", isCorrect: true },
                            { text: "Pelo exporter `loki`, que converte OTLP para o formato de push próprio do Loki", isCorrect: false },
                            { text: "Pelo exporter `prometheus_remote_write`, que o Loki aceita no caminho de push", isCorrect: false },
                            { text: "Pelo Promtail como intermediário, recebendo do Collector e repassando ao Loki", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O Collector manda métricas pelo exporter `otlp_http`, configurado com `endpoint: http://prometheus:9090/api/v1/otlp`, e o log do exporter mostra respostas 404 do Prometheus 3. O que falta?",
                        difficulty: "medio",
                        options: [
                            { text: "Trocar o exporter por `otlp_grpc`, porque o receiver OTLP do Prometheus só fala gRPC", isCorrect: false },
                            { text: "Acrescentar `/v1/metrics` ao endpoint, porque o `otlp_http` não completa o caminho sozinho", isCorrect: false },
                            { text: "Iniciar o Prometheus com `--web.enable-otlp-receiver`: o receiver OTLP vem desligado", isCorrect: true },
                            { text: "Trocar o caminho para `/api/v1/write`, porque o Prometheus só recebe push por esse caminho", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O fornecedor SaaS fica fora do ar por 20 minutos. O pipeline de traces entrega ao Tempo e ao fornecedor, com fila e retry nos valores padrão. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "Tudo para, porque o pipeline espera o exporter mais lento antes de entregar ao próximo exporter da lista", isCorrect: false },
                            { text: "Nada se perde, porque a fila em memória guarda os 20 minutos e reenvia tudo assim que o fornecedor volta", isCorrect: false },
                            { text: "O Tempo segue recebendo; para o fornecedor, a fila enche, cada envio desiste após 5 minutos e há perda", isCorrect: true },
                            { text: "O Collector desvia para o Tempo o que era do fornecedor e reenvia tudo ao fornecedor quando ele voltar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dois pipelines de traces leem do mesmo receiver:\n\n```yaml\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [memory_limiter, batch]\n      exporters: [otlp_grpc/tempo]\n    traces/saas:\n      receivers: [otlp]\n      processors: [memory_limiter, attributes/sem-email, batch]\n      exporters: [otlp_http/saas]\n```\n\nO `attributes/sem-email` apaga o atributo `cliente.email`. O que chega ao Tempo?",
                        difficulty: "dificil",
                        options: [
                            { text: "Spans sem `cliente.email`, porque os dois pipelines compartilham os mesmos dados", isCorrect: false },
                            { text: "Nada, porque o Collector recusa dois pipelines do mesmo sinal com o mesmo receiver", isCorrect: false },
                            { text: "Depende da ordem: o pipeline declarado primeiro recebe os dados antes da alteração", isCorrect: false },
                            { text: "Spans com `cliente.email`, porque cada pipeline recebe a própria cópia dos dados", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Onde rodar o Collector",
                blocks: [
                    {
                        type: "text",
                        value: "# Onde rodar o Collector\n\nAté aqui, \"o Collector\" foi uma caixa só. Em produção, a pergunta é onde ela fica: ao lado de cada aplicação, no meio da rede ou nos dois lugares. A resposta muda o que o Collector consegue enxergar, o que ele protege e quanto custa operá-lo.\n\n## Agente: perto de quem gera\n\nNo padrão **agente**, roda um Collector por máquina (no Kubernetes, um DaemonSet) ou um por aplicação (sidecar). A aplicação manda para um endereço próximo, num salto curto, e o agente enxerga o que só existe ali: as métricas da própria máquina (`host_metrics`), os arquivos de log dos contêineres (`file_log`), os metadados de nuvem (`resource_detection`) e o IP de quem abriu a conexão, que o `k8s_attributes` usa para descobrir qual pod mandou o dado. Como a associação padrão é por esse IP, com a configuração padrão o `k8s_attributes` precisa rodar no primeiro salto: no gateway, o IP de origem é o do agente, não o do pod.\n\nPara a aplicação achar o agente do próprio nó, o agente publica a porta 4317 no nó (hostPort) e a aplicação recebe o IP do nó pela API do Kubernetes:",
                    },
                    {
                        type: "code",
                        value: "# deployment.yaml (trecho): a aplicação fala com o agente do próprio nó\nenv:\n  - name: NODE_IP\n    valueFrom:\n      fieldRef:\n        fieldPath: status.hostIP\n  - name: OTEL_EXPORTER_OTLP_ENDPOINT\n    value: http://$(NODE_IP):4317",
                    },
                    {
                        type: "text",
                        value: "O agente em si recebe OTLP, coleta métricas da máquina, carimba os metadados do pod e do ambiente e entrega tudo ao gateway. Note o `k8s_attributes` antes do `batch`: o lote apaga o contexto da conexão de onde ele tira o IP. O processador consulta a API do Kubernetes, então a conta de serviço do agente precisa de permissão de leitura para pods e namespaces. E o `root_path` aponta para o disco do nó, montado no contêiner do agente: sem ele, o `host_metrics` mede o próprio contêiner, e sem a montagem o `validate` recusa o caminho (`invalid root_path: stat /hostfs: no such file or directory`).",
                    },
                    {
                        type: "code",
                        value: "# agente.yaml: um por nó (DaemonSet), entrega tudo ao gateway\nreceivers:\n  otlp:\n    protocols:\n      grpc:\n        endpoint: 0.0.0.0:4317\n  host_metrics:\n    collection_interval: 30s\n    root_path: /hostfs   # o / do nó, montado no contêiner do agente\n    scrapers:\n      cpu:\n      memory:\n      filesystem:\n\nprocessors:\n  memory_limiter:\n    check_interval: 1s\n    limit_percentage: 80\n    spike_limit_percentage: 20\n  k8s_attributes:\n    filter:\n      node_from_env_var: K8S_NODE_NAME   # nome do nó (spec.nodeName), injetado no DaemonSet\n    extract:\n      metadata:\n        - k8s.namespace.name\n        - k8s.pod.name\n        - k8s.deployment.name\n  resource_detection:\n    detectors: [env, system]\n  batch:\n\nexporters:\n  otlp_grpc/gateway:\n    endpoint: otel-gateway.observabilidade.svc.cluster.local:4317\n    tls:\n      insecure: true\n\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [memory_limiter, k8s_attributes, resource_detection, batch]\n      exporters: [otlp_grpc/gateway]\n    metrics:\n      receivers: [otlp, host_metrics]\n      processors: [memory_limiter, k8s_attributes, resource_detection, batch]\n      exporters: [otlp_grpc/gateway]\n    logs:\n      receivers: [otlp]\n      processors: [memory_limiter, k8s_attributes, resource_detection, batch]\n      exporters: [otlp_grpc/gateway]",
                    },
                    {
                        type: "text",
                        value: "## Gateway: um ponto de saída\n\nNo padrão **gateway**, um grupo de Collectors fica no meio da rede, atrás de um balanceador (no Kubernetes, um Deployment com várias réplicas e um Service). Ele concentra o que não deve se repetir em cada máquina: a chave de API do fornecedor, guardada em poucas instâncias; a política de dado sensível, num lugar só; o tail sampling, com a camada de `load_balancing` na frente; e a saída para a internet, que só o gateway precisa ter. O custo é mais um salto de rede e mais um serviço para escalar e manter de pé.\n\nO desenho mais comum junta os dois: agentes nos nós cuidam do que é local e entregam a um gateway, que cuida do que é central.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pergunta\",\"Agente\",\"Gateway\"],[\"Onde roda\",\"em cada nó (DaemonSet) ou ao lado do pod (sidecar)\",\"grupo central atrás de um balanceador\"],[\"Enxerga o que é local\",\"sim: arquivos de log, métricas do host, IP de quem conectou\",\"não: só o que chega pela rede\"],[\"Chave do fornecedor\",\"espalhada por todos os nós\",\"em poucas instâncias\"],[\"Tail sampling\",\"não: cada nó vê pedaços de traces\",\"sim, com `load_balancing` na frente\"],[\"Custo de operar\",\"um processo por nó, configuração repetida\",\"poucas instâncias, mas precisa escalar e ter alta disponibilidade\"]]",
                    },
                    {
                        type: "text",
                        value: "## Distribuição própria ou de fornecedor\n\nA distribuição contrib traz centenas de componentes, e quase nenhuma empresa usa mais que uma dúzia. A recomendação de segurança do projeto é limitar os componentes aos necessários e montar uma distribuição própria com o **OpenTelemetry Collector Builder** (`ocb`): você lista os componentes num manifesto e ganha um binário menor, com menos superfície de ataque. Fornecedores fazem o mesmo e publicam as suas distribuições, como o ADOT da AWS e o **Grafana Alloy**.\n\nO Alloy é a distribuição do OpenTelemetry Collector da Grafana. O modo padrão (`alloy run`) usa uma sintaxe própria, em arquivos `.alloy`, em que cada componente declara para onde manda a saída; ele junta os componentes do Collector (`otelcol.*`) aos do ecossistema Prometheus e Loki e tem interface web para depurar o pipeline. As versões recentes trazem também o `alloy otel`, que roda o YAML padrão do Collector; no Alloy 1.21, de outubro de 2026, esse modo está em public preview (prévia pública, ainda sujeita a mudanças). Um agente simples, que recebe OTLP e entrega ao gateway, fica assim na sintaxe do Alloy:",
                    },
                    {
                        type: "code",
                        value: "// agente.alloy: um agente simples, que recebe OTLP e entrega ao gateway\notelcol.receiver.otlp \"apps\" {\n  grpc {\n    endpoint = \"0.0.0.0:4317\"\n  }\n\n  output {\n    traces  = [otelcol.processor.batch.padrao.input]\n    metrics = [otelcol.processor.batch.padrao.input]\n    logs    = [otelcol.processor.batch.padrao.input]\n  }\n}\n\notelcol.processor.batch \"padrao\" {\n  output {\n    traces  = [otelcol.exporter.otlp.gateway.input]\n    metrics = [otelcol.exporter.otlp.gateway.input]\n    logs    = [otelcol.exporter.otlp.gateway.input]\n  }\n}\n\notelcol.exporter.otlp \"gateway\" {\n  client {\n    endpoint = \"otel-gateway.observabilidade.svc.cluster.local:4317\"\n\n    tls {\n      insecure = true\n    }\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## O fim do Grafana Agent e do Promtail\n\nO **Grafana Agent** chegou ao fim da vida em 1º de novembro de 2025, e o **Promtail**, que levava logs ao Loki, em março de 2026. Fim da vida quer dizer nenhuma correção, nem de segurança. O substituto dos dois é o Alloy, e a migração começa pelo conversor: `alloy convert --source-format=promtail` para configuração do Promtail e `--source-format=static` para a do Grafana Agent (o mesmo comando converte configuração do Prometheus e do Collector).\n\nFica a lição de engenharia: a peça do meio do caminho envelhece, troca de nome e sai de linha, e a aplicação que fala OTLP e segue as convenções semânticas não precisa saber de nada disso. Escolha agente e gateway pelo que cada um enxerga e protege, e trate a distribuição como uma dependência com ciclo de vida.",
                    },
                    {
                        type: "quote",
                        value: "O agente enxerga o que é local e fica perto da aplicação; o gateway concentra chave, política e tail sampling num ponto de saída. Distribuição é escolha com ciclo de vida: prefira a enxuta e, quando ela sair de linha, como o Grafana Agent e o Promtail, migre a configuração sem mexer na aplicação.",
                    },
                ],
                questions: [
                    {
                        statement: "O que um Collector no papel de agente, rodando em cada nó, consegue fazer e um gateway central não consegue?",
                        difficulty: "facil",
                        options: [
                            { text: "Guardar a chave de API do fornecedor num lugar só, longe dos nós de aplicação", isCorrect: false },
                            { text: "Ler os arquivos de log e as métricas da máquina onde as aplicações rodam", isCorrect: true },
                            { text: "Aplicar tail sampling vendo todos os spans de cada trace, de todos os serviços", isCorrect: false },
                            { text: "Dispensar o `memory_limiter`, porque o volume que chega a cada nó é pequeno", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em 2026, o que fazer com uma instalação que ainda coleta logs com o Promtail?",
                        difficulty: "facil",
                        options: [
                            { text: "Migrar para o Grafana Alloy, começando pelo `alloy convert --source-format=promtail`", isCorrect: true },
                            { text: "Atualizar para a linha de suporte estendido do Promtail, que segue recebendo correções", isCorrect: false },
                            { text: "Trocar pelo Grafana Agent em modo flow, indicado como sucessor do Promtail", isCorrect: false },
                            { text: "Manter como está, porque o fim da vida só corta recursos novos e não correções", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a chave de API do fornecedor SaaS costuma ficar no gateway, e não nos agentes de cada nó?",
                        difficulty: "medio",
                        options: [
                            { text: "Assim ela fica em poucas instâncias, e só o gateway precisa de saída para a internet", isCorrect: true },
                            { text: "Porque o exporter OTLP só aceita cabeçalho de autenticação quando roda num gateway", isCorrect: false },
                            { text: "Porque o agente não tem fila de envio e perderia dados falando direto com o fornecedor", isCorrect: false },
                            { text: "Porque o agente não expande `${env:...}`, recurso exclusivo da configuração de gateway", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um `k8s_attributes` com a configuração padrão foi posto só no gateway, que recebe dos agentes. Os spans chegam sem `k8s.pod.name` ou com o nome do pod do agente. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "Os agentes apagam os atributos `k8s.*` ao exportar os dados por OTLP ao gateway", isCorrect: false },
                            { text: "Ele depende de um `resource_detection` antes dele na lista, que só existe nos agentes", isCorrect: false },
                            { text: "Ele associa o dado ao pod pelo IP da conexão, e no gateway esse IP é o do agente", isCorrect: true },
                            { text: "Ele só funciona dentro de DaemonSet, e num Deployment fica desligado sem aviso", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma equipe tem várias configurações YAML do OpenTelemetry Collector e quer padronizar no Grafana Alloy 1.21 (outubro de 2026). Qual afirmação está correta?",
                        difficulty: "dificil",
                        options: [
                            { text: "O `alloy run` lê o YAML do Collector direto, porque a sintaxe `.alloy` foi aposentada na versão 1.0", isCorrect: false },
                            { text: "O Alloy só aceita a sintaxe própria, e o YAML do Collector precisa ser reescrito à mão, bloco por bloco", isCorrect: false },
                            { text: "O Alloy aceita o YAML do Collector, mas só com componentes da core, sem os do repositório contrib", isCorrect: false },
                            { text: "O `alloy otel` roda o YAML como está, em public preview, e o `alloy convert` o traduz para `.alloy`", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Painéis, alertas e SLOs",
        aulas: [
            {
                titulo: "Painéis que respondem perguntas",
                blocks: [
                    {
                        type: "text",
                        value: "# Painéis que respondem perguntas\n\nSão três da manhã e o alerta de erro do checkout disparou. Quem está de plantão abre o painel \"Visão geral da loja\" e encontra 48 gráficos: CPU de cada nó, coleta de lixo do .NET, threads, memória, fila do RabbitMQ, conexões do banco. Tudo oscila um pouco, nada está vermelho, e depois de dez minutos rolando a tela a pessoa ainda não sabe responder o básico: os clientes estão conseguindo comprar?\n\nEsse painel nasceu do jeito mais comum. Alguém criou uma métrica, outra pessoa achou que ela merecia um gráfico, cada incidente antigo deixou mais três de lembrança. Ninguém decidiu **qual pergunta** ele responde. Um painel útil (o dashboard, no Grafana) é o contrário disso: um público definido, poucas perguntas, e cada gráfico respondendo uma delas. Se ninguém consegue dizer que pergunta um gráfico responde, ele sai.",
                    },
                    {
                        type: "text",
                        value: "## Comece pela pergunta\n\nAntes de abrir o Grafana, escreva as perguntas. Para o painel de um serviço, costumam ser estas:\n\n1. **Está atendendo?** Requisições por segundo, por rota.\n2. **Está falhando?** Que proporção das respostas é erro.\n3. **Está lento?** Quanto tempo leva, em percentis (p95, p99), por rota.\n4. **Está perto do limite?** A saturação do que acaba primeiro: pool de conexões, fila, CPU.\n5. **O que mudou?** Deploys e mudanças de configuração marcados como anotações no tempo; a própria esteira de deploy pode criar a anotação pela API do Grafana.\n\nSó depois vem a consulta, e por último o tipo de gráfico. A ordem importa: quem começa pela métrica disponível termina com o painel de 48 gráficos.\n\nOs painéis também se organizam em camadas. Uma **visão geral** com uma linha por serviço (saudável ou não), o **painel do serviço** para o time dono e para o plantão, e os **painéis de detalhe** (banco, runtime, uma dependência), abertos só quando o painel do serviço aponta para lá. Links entre eles e uma variável de serviço no topo fazem o caminho da visão geral até o detalhe em dois cliques.",
                    },
                    {
                        type: "table",
                        value: "[[\"Painel\", \"Quem olha\", \"Pergunta principal\", \"Gráficos típicos\"], [\"Do serviço\", \"O time dono e o plantão\", \"Os usuários deste serviço estão sendo bem atendidos agora?\", \"Taxa, proporção de erro e latência por rota (o RED), saturação, deploys\"], [\"Do negócio\", \"Produto, operação e também o plantão\", \"O negócio está acontecendo como de costume?\", \"Pedidos por minuto, aprovação de pagamento, comparação com a semana passada\"], [\"Da infraestrutura\", \"O time de plataforma\", \"Os recursos aguentam, e onde está o gargalo?\", \"Uso, saturação e erros (o USE) de CPU, memória, disco, rede e pools\"]]",
                    },
                    {
                        type: "text",
                        value: "## O painel do serviço\n\nA primeira linha do painel do serviço é o RED, nesta ordem e com o mesmo eixo de tempo: taxa, erros, duração. Três cuidados separam o painel que ajuda do painel que engana:\n\n- **Erro como proporção, não como contagem.** Dez erros por segundo é muito às quatro da manhã e é pouco no pico da Black Friday. A contagem sobe junto com o tráfego; a proporção mostra se o serviço piorou.\n- **Janela do `rate` que acompanha o zoom.** No Grafana, use `$__rate_interval` no lugar de uma janela fixa. Ele vale o maior entre o intervalo do gráfico somado a um intervalo de raspagem e quatro intervalos de raspagem, então nunca fica curto demais para ter amostras, com zoom de cinco minutos ou de uma semana.\n- **Os dois lados da divisão com o mesmo agrupamento.** O Prometheus casa as séries de uma divisão pelos rótulos. Com `sum by (http_route)` só no numerador, um lado tem o rótulo `http_route` e o outro não tem rótulo nenhum, e o resultado é vazio. O gráfico mostra \"No data\", e quem olha com pressa conclui que não há erro.\n\nAs consultas abaixo usam a métrica de duração de requisições que o ASP.NET Core já publica, com a variável `$servico` escolhida no topo do painel.",
                    },
                    {
                        type: "code",
                        value: "# Gráfico \"Requisições por segundo, por rota\"\nsum by (http_route) (\n  rate(http_server_request_duration_seconds_count{job=\"$servico\"}[$__rate_interval])\n)\n\n# Gráfico \"Proporção de respostas 5xx, por rota\" (by nos dois lados da divisão)\nsum by (http_route) (rate(http_server_request_duration_seconds_count{job=\"$servico\", http_response_status_code=~\"5..\"}[$__rate_interval]))\n/\nsum by (http_route) (rate(http_server_request_duration_seconds_count{job=\"$servico\"}[$__rate_interval]))\n\n# Gráfico \"Latência p99, por rota\", a partir dos buckets do histograma\nhistogram_quantile(0.99,\n  sum by (le, http_route) (\n    rate(http_server_request_duration_seconds_bucket{job=\"$servico\"}[$__rate_interval])\n  )\n)\n\n# Painel do negócio: pedidos por minuto agora e na mesma hora da semana passada\nsum(rate(loja_pedidos_criados_total[$__rate_interval])) * 60\n\nsum(rate(loja_pedidos_criados_total[$__rate_interval] offset 1w)) * 60",
                    },
                    {
                        type: "text",
                        value: "## O painel do negócio\n\nO painel do negócio pega o que nenhuma métrica técnica vê. Um erro de JavaScript no botão de pagar não gera 5xx, não deixa a API lenta e não mexe na CPU, mas derruba os pedidos por minuto pela metade. Os gráficos daqui saem de contadores que o próprio código publica, como `loja.pedidos.criados` (que chega ao Prometheus como `loja_pedidos_criados_total`), com rótulos de poucos valores, como o meio de pagamento, e nunca o id do cliente.\n\nNegócio tem sazonalidade: segunda de manhã não se compara com domingo à noite. Por isso o gráfico mais útil aqui é a **comparação com a mesma hora da semana passada**, com `offset 1w` logo depois do seletor. Muita gente escreve o `offset` depois do `sum(...)`, e o Prometheus recusa a consulta: o modificador precisa vir colado a um seletor (ou a uma subconsulta). Também não serve trocar a janela por `[1w]`: isso dá a média da semana inteira, uma linha quase reta que esconde o pico do almoço.\n\nEsse painel interessa ao plantão também. Quando os pedidos caem e o RED está verde, o problema está em algo que o RED não mede (o front, o funil, um provedor externo), e saber disso cedo economiza uma hora de busca no lugar errado.",
                    },
                    {
                        type: "text",
                        value: "## O painel da infraestrutura e o painel que ninguém olha\n\nO painel da infraestrutura segue o USE: uso, saturação e erros de cada recurso. Ele diz onde está o gargalo depois que o painel do serviço mostrou que existe um, e quase nunca é o primeiro a ser aberto num incidente.\n\nE existe o painel que ninguém olha. Ele se reconhece fácil: dezenas de gráficos sem título claro, unidades misturadas (milissegundos num, segundos no outro), um \"uptime\" de 100% que nunca mudou, gráficos criados num incidente de dois anos atrás, nenhum dono. Ele custa caro duas vezes: cada abertura dispara dezenas de consultas no Prometheus, e no incidente ele rouba minutos de quem procura a resposta. O remédio é tratar painel como código:\n\n- **Dono e propósito** escritos na descrição do painel.\n- **Arquivo no repositório**, carregado pelo provisionamento do Grafana, para que toda mudança passe por revisão.\n- **Revisão periódica**: o gráfico que ninguém consegue justificar sai. Apagar painel é manutenção, não perda.",
                    },
                    {
                        type: "code",
                        value: "# grafana/provisioning/dashboards/servicos.yaml\n# os JSON dos painéis ficam no repositório e mudam por pull request\napiVersion: 1\nproviders:\n  - name: paineis-do-repositorio\n    folder: Serviços\n    type: file\n    disableDeletion: true\n    allowUiUpdates: false   # editar pela interface não grava por cima do arquivo\n    options:\n      path: /var/lib/grafana/dashboards/servicos",
                    },
                    {
                        type: "quote",
                        value: "Painel bom começa por um público e por perguntas: o do serviço mostra taxa, erro em proporção e latência em percentis, o do negócio compara com a semana passada, o da infraestrutura aponta o gargalo. Gráfico que não responde pergunta nenhuma sai, e o painel mora no repositório, com dono.",
                    },
                ],
                questions: [
                    {
                        statement: "Ao montar do zero o painel de um serviço, qual é o primeiro passo?",
                        difficulty: "facil",
                        options: [
                            { text: "Escrever as perguntas que o painel precisa responder, e para quem", isCorrect: true },
                            { text: "Listar as métricas que o serviço já exporta e criar um gráfico de cada", isCorrect: false },
                            { text: "Definir as cores e os limites de alerta de cada gráfico do painel", isCorrect: false },
                            { text: "Importar o painel mais completo da comunidade e apagar o que sobrar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que o gráfico de erros do painel do serviço deve mostrar a proporção de respostas 5xx, e não a contagem de erros por segundo?",
                        difficulty: "facil",
                        options: [
                            { text: "Porque a contagem sobe junto com o tráfego, e a proporção mostra se o serviço piorou", isCorrect: true },
                            { text: "Porque o Prometheus não consegue somar contadores com códigos de status diferentes", isCorrect: false },
                            { text: "Porque a contagem de erros exige um histograma, e a proporção funciona com contador", isCorrect: false },
                            { text: "Porque a proporção gera menos séries no banco e deixa a consulta do gráfico mais leve", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No painel do negócio, você quer uma segunda linha com os pedidos por minuto da mesma hora da semana passada, para comparar com a linha atual. Qual consulta desenha essa linha?",
                        difficulty: "medio",
                        options: [
                            { text: "`sum(rate(loja_pedidos_criados_total[5m])) offset 1w * 60`", isCorrect: false },
                            { text: "`sum(rate(loja_pedidos_criados_total[1w])) * 60`", isCorrect: false },
                            { text: "`sum(increase(loja_pedidos_criados_total[1w])) / 7`", isCorrect: false },
                            { text: "`sum(rate(loja_pedidos_criados_total[5m] offset 1w)) * 60`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um gráfico do Grafana usa `rate(...[1m])` com o Prometheus raspando a cada 30 segundos (e a fonte de dados do Grafana configurada com o mesmo intervalo), e a linha aparece com falhas: de vez em quando, pontos somem. Por que trocar a janela fixa por `$__rate_interval` resolve?",
                        difficulty: "medio",
                        options: [
                            { text: "Porque a variável troca o `rate` por `irate`, que funciona com uma amostra só na janela", isCorrect: false },
                            { text: "Porque a janela passa a ter pelo menos quatro intervalos de raspagem e cresce com o zoom", isCorrect: true },
                            { text: "Porque o Grafana passa a calcular a taxa por conta própria, sem depender das amostras salvas", isCorrect: false },
                            { text: "Porque a janela passa a ser igual ao intervalo de raspagem, sem amostras repetidas nela", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O gráfico \"Proporção de erro por rota\" mostra \"No data\" o tempo todo, mesmo com o serviço devolvendo 500 numa das rotas. A consulta é esta:\n\n```promql\nsum by (http_route) (rate(http_server_request_duration_seconds_count{http_response_status_code=~\"5..\"}[5m]))\n/\nsum(rate(http_server_request_duration_seconds_count[5m]))\n```\n\nO que está errado?",
                        difficulty: "dificil",
                        options: [
                            { text: "O numerador tem o rótulo `http_route` e o denominador não; sem rótulos iguais, nada casa na divisão", isCorrect: true },
                            { text: "A regex `5..` não casa com o status, que o Prometheus guarda como número inteiro, e não como texto puro", isCorrect: false },
                            { text: "A janela de 5 minutos é curta demais para um contador de erros que só cresce nos momentos de falha", isCorrect: false },
                            { text: "O `sum` sem `by` no denominador soma todas as rotas, a razão passa de 100% e acaba descartada", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "SLI, SLO e error budget",
                blocks: [
                    {
                        type: "text",
                        value: "# SLI, SLO e error budget\n\nToda semana a mesma discussão: o time de produto quer entregar mais rápido, quem cuida da produção quer segurar os deploys porque \"o sistema está instável\". Ninguém prova nada, porque \"estável\" não tem número. O SLO resolve isso transformando confiabilidade numa meta medida, combinada antes da briga.\n\nTrês siglas, em ordem:\n\n- **SLI** (service level indicator): o indicador, uma proporção de eventos bons sobre eventos válidos. Exemplo: requisições do checkout respondidas sem erro, divididas por todas as requisições do checkout.\n- **SLO** (service level objective): a meta para esse indicador numa janela. Exemplo: 99,9% nos últimos 30 dias.\n- **Error budget** (orçamento de erro): o que sobra até 100%. Com 99,9%, o orçamento é 0,1% das requisições do período, e ele existe para ser gasto.\n\nJá o **SLA** é o contrato com o cliente, com multa se não for cumprido. Ele costuma ser mais frouxo que o SLO interno, justamente para o time ser avisado antes de a multa chegar. E 100% nunca é a meta: o caminho até o usuário passa por redes e aparelhos que você não controla, cada nove a mais custa bem mais caro, e um sistema que não pode falhar nunca também não pode mudar.",
                    },
                    {
                        type: "text",
                        value: "## Escolhendo o indicador\n\nO bom SLI mede o que o usuário sente, e o jeito mais simples é contar eventos: **eventos bons ÷ eventos válidos**. Cada palavra é uma decisão:\n\n- **Válido.** Health check e o `/metrics` raspado pelo Prometheus não são usuários; contá-los enche o denominador de sucessos fáceis e dilui a falha real. Erro 4xx costuma ser culpa de quem chamou e fica como bom (ou fora da conta), mas um 429 do seu próprio limitador, por falta de capacidade, é falha sua.\n- **Bom.** Para disponibilidade, resposta sem 5xx. Para latência, resposta abaixo de um limite, como 500 ms.\n- **Onde medir.** No servidor é o mais fácil, mas ele não vê a requisição que nem chegou até ele; no balanceador de carga ou no cliente, a medida fica mais perto do que o usuário vive.\n\nRepare que o SLI de latência é \"proporção de requisições abaixo de 500 ms\", e não \"p99 abaixo de 500 ms\". A proporção é contagem de eventos e vira orçamento; o percentil de uma janela não se soma ao de outra.",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo de serviço\", \"SLI\", \"Evento bom (exemplo)\"], [\"API de requisição e resposta\", \"Disponibilidade\", \"Resposta sem erro 5xx\"], [\"API de requisição e resposta\", \"Latência\", \"Resposta em até 500 ms\"], [\"Consumidor de fila, pipeline\", \"Frescor\", \"Pedido faturado até 5 minutos depois de criado\"], [\"Consumidor de fila, pipeline\", \"Correção\", \"Registro processado sem divergência na conferência\"], [\"Armazenamento\", \"Durabilidade\", \"Arquivo gravado que pode ser lido de volta\"]]",
                    },
                    {
                        type: "code",
                        value: "# SLI de disponibilidade da pedidos-api: respostas sem 5xx / todas as respostas\nsum(rate(http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code!~\"5..\"}[5m]))\n/\nsum(rate(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[5m]))\n\n# SLI de latência: proporção que respondeu em até 0,5 s (o limite tem que ser fronteira de bucket)\nsum(rate(http_server_request_duration_seconds_bucket{job=\"pedidos-api\", le=\"0.5\"}[5m]))\n/\nsum(rate(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[5m]))\n\n# Orçamento restante em 30 dias, SLO de 99,9% (1 = intacto, 0 = gasto, negativo = estourado)\n1 - (\n  (\n    sum(increase(http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=~\"5..\"}[30d]))\n    /\n    sum(increase(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[30d]))\n  ) / 0.001\n)",
                    },
                    {
                        type: "text",
                        value: "## O limite tem que existir no histograma\n\nO SLI de latência conta quem ficou abaixo do limite lendo o bucket cujo `le` é o limite. Se o SLO diz 300 ms e as fronteiras do histograma de duração do ASP.NET Core são 0,25 e 0,5 segundo, não existe série para 0,3: o seletor `le=\"0.3\"` devolve vazio, e interpolar entre buckets dá estimativa, não contagem. Ou o limite vira uma fronteira que existe (250 ou 500 ms), ou as fronteiras mudam para incluir o limite.\n\nNum histograma seu, as fronteiras se escolhem no código, a partir do SLO. O serviço de faturamento abaixo mede o frescor (quanto tempo o pedido levou da criação ao fim do faturamento) com uma fronteira em 300 segundos, o limite do SLO. No mesmo arquivo, o health check sai das métricas HTTP com `DisableHttpMetrics()` e não entra no denominador de SLI nenhum.\n\nUm detalhe que pega muita gente: no Prometheus 3 (conferido na 3.13, em outubro de 2026), o valor do rótulo `le` de uma fronteira inteira depende do caminho. Por OTLP chega `le=\"300\"`; raspado, chega `le=\"300.0\"`. Confira o valor real numa consulta antes de escrever a regra, ou o SLI sai vazio.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs do serviço de faturamento: o que entra no SLI começa no código\nusing System.Diagnostics.Metrics;\nusing OpenTelemetry.Metrics;\nusing OpenTelemetry.Resources;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddHealthChecks();\nbuilder.Services.AddSingleton<MetricasFaturamento>();\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"faturamento\"))\n    .WithMetrics(m => m\n        .AddAspNetCoreInstrumentation()\n        .AddMeter(MetricasFaturamento.NomeDoMeter)\n        .AddOtlpExporter());\n\nvar app = builder.Build();\n\n// o health check sai de http.server.request.duration e não engorda o denominador do SLI\napp.MapHealthChecks(\"/healthz\").DisableHttpMetrics();\n\napp.Run();\n\n// SLI de frescor: tempo entre a criação do pedido e o fim do faturamento.\n// O limite do SLO (300 s) é uma das fronteiras, então a proporção sai exata.\npublic sealed class MetricasFaturamento\n{\n    public const string NomeDoMeter = \"Loja.Faturamento\";\n    private readonly Histogram<double> atraso;\n\n    public MetricasFaturamento(IMeterFactory fabrica) =>\n        atraso = fabrica.Create(NomeDoMeter).CreateHistogram<double>(\n            \"faturamento.pedido.atraso\",\n            unit: \"s\",\n            description: \"Tempo entre a criação do pedido e o fim do faturamento\",\n            advice: new InstrumentAdvice<double> { HistogramBucketBoundaries = [5, 30, 60, 120, 300, 600, 1800] });\n\n    // chamado pelo consumidor da fila depois de faturar o pedido\n    public void Registrar(DateTimeOffset criadoEm) =>\n        atraso.Record((DateTimeOffset.UtcNow - criadoEm).TotalSeconds);\n}",
                    },
                    {
                        type: "text",
                        value: "## Definindo a meta\n\nA meta sai de três lugares. Do que o serviço **entregou nas últimas semanas**: prometer 99,99% para quem entregou 99,7% é pedir para falhar. Do que o **usuário percebe**: ninguém nota a diferença entre 99,95% e 99,99% num mês, mas nota 98%. E das **dependências**: um serviço que chama três outros em série, sem fallback, não entrega mais do que o produto da disponibilidade deles. Três dependências de 99,9% dão 0,999 × 0,999 × 0,999, perto de 99,7%, antes de contar as falhas do próprio serviço.\n\nA janela costuma ser móvel, de 28 ou 30 dias. O workbook de SRE do Google recomenda quatro semanas móveis como intervalo de uso geral, porque a janela de calendário \"esquece\" no dia 1 a queda do dia 31. A tabela mostra quanto tempo de indisponibilidade total cada meta permite. Ela ajuda a sentir a escala, mas o orçamento de verdade é contado em requisições: com 1,2 milhão de requisições por dia, 99,9% em 30 dias permite 36 mil respostas com falha.",
                    },
                    {
                        type: "table",
                        value: "[[\"SLO\", \"Orçamento\", \"Em 30 dias\", \"Em um ano\"], [\"99%\", \"1%\", \"7 h 12 min\", \"87 h 36 min\"], [\"99,5%\", \"0,5%\", \"3 h 36 min\", \"43 h 48 min\"], [\"99,9%\", \"0,1%\", \"43 min 12 s\", \"8 h 45 min 36 s\"], [\"99,95%\", \"0,05%\", \"21 min 36 s\", \"4 h 22 min 48 s\"], [\"99,99%\", \"0,01%\", \"4 min 19 s\", \"52 min 34 s\"]]",
                    },
                    {
                        type: "text",
                        value: "## Gastando o orçamento\n\nO orçamento muda a conversa. Enquanto sobra, o time **gasta**: deploy mais frequente, experimento, migração arriscada, janela de manutenção. Quando acaba, vale a **política de error budget**, combinada antes e por escrito. Por exemplo: só entram correções de confiabilidade e de segurança até o SLI voltar para dentro da meta, e o time prioriza os defeitos que mais gastaram orçamento nas últimas quatro semanas. Sem política combinada, o SLO vira só mais um gráfico.\n\nDuas armadilhas comuns. A primeira é gastar o orçamento com manutenção planejada sem perceber: uma janela de 30 minutos fora do ar leva quase 70% dos 43 minutos do mês, em 99,9%. A segunda é calcular o orçamento restante com `increase` de 30 dias a cada abertura do painel, o que pesa no Prometheus; na prática, as razões são pré-calculadas por regras de gravação, como nas regras de alerta deste módulo.",
                    },
                    {
                        type: "quote",
                        value: "SLI é eventos bons sobre eventos válidos, SLO é a meta numa janela móvel, e o error budget é o que sobra até 100%, feito para ser gasto com mudança. A meta sai do histórico, do que o usuário percebe e das dependências, e o limite de latência precisa ser uma fronteira do histograma.",
                    },
                ],
                questions: [
                    {
                        statement: "Um serviço tem SLO de 99,9% de disponibilidade numa janela de 30 dias. Quanto tempo de indisponibilidade total cabe no orçamento do período?",
                        difficulty: "facil",
                        options: [
                            { text: "7 horas e 12 minutos", isCorrect: false },
                            { text: "8 horas, 45 minutos e 36 segundos", isCorrect: false },
                            { text: "43 minutos e 12 segundos", isCorrect: true },
                            { text: "4 minutos e 19 segundos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destas definições é um SLI no formato recomendado?",
                        difficulty: "facil",
                        options: [
                            { text: "Proporção das requisições do checkout que responderam sem erro 5xx", isCorrect: true },
                            { text: "Tempo médio de resposta do checkout, calculado ao fim de cada dia útil", isCorrect: false },
                            { text: "Uso médio de CPU das instâncias do checkout na última hora medida", isCorrect: false },
                            { text: "Quantidade de incidentes do checkout abertos pelo plantão no mês", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API recebe 500 mil requisições por dia e tem SLO de 99,9% de disponibilidade em 30 dias. Quantas requisições com falha cabem no orçamento do período?",
                        difficulty: "medio",
                        options: [
                            { text: "150 mil requisições", isCorrect: false },
                            { text: "500 requisições", isCorrect: false },
                            { text: "15 mil requisições", isCorrect: true },
                            { text: "1.500 requisições", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O SLO de latência da pedidos-api diz que 99% das requisições respondem em até 300 ms. O histograma de duração que o ASP.NET Core publica tem fronteiras em 0,25 e 0,5 segundo, sem nada entre elas. O que acontece com o SLI?",
                        difficulty: "medio",
                        options: [
                            { text: "O SLI passa a contar como bom tudo que ficou abaixo de 0,5 s, e o resultado segue exato", isCorrect: false },
                            { text: "O `histogram_quantile` interpola entre 0,25 e 0,5 e entrega a proporção exata de quem ficou até 300 ms", isCorrect: false },
                            { text: "Não dá para contar quem ficou abaixo de 300 ms: ou o limite vira uma fronteira, ou as fronteiras mudam", isCorrect: true },
                            { text: "O Prometheus cria na consulta a série de `le=\"0.3\"`, a partir das duas fronteiras vizinhas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O checkout depende, em série e sem fallback, de três serviços internos com 99,9% de disponibilidade cada. O time de produto pede um SLO de 99,95% para o checkout. O que a conta mostra?",
                        difficulty: "dificil",
                        options: [
                            { text: "Que dependência interna não entra na conta do SLO, e a meta depende só do código do checkout", isCorrect: false },
                            { text: "Que o checkout fica perto de 99,97%, porque as falhas das três se diluem, e a meta cabe com folga de sobra", isCorrect: false },
                            { text: "Que o checkout fica em 99,9%, a disponibilidade da dependência pior, e a meta cabe com um ajuste", isCorrect: false },
                            { text: "Que o checkout fica perto de 99,7% só pelas dependências, e a meta não cabe sem mudar a arquitetura", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Alertas",
                blocks: [
                    {
                        type: "text",
                        value: "# Alertas\n\nO alerta \"CPU acima de 85%\" toca às três da manhã. Quem está de plantão acorda, abre o painel, vê que os clientes compram normalmente e que é só o processamento noturno. Na semana seguinte o mesmo alerta toca e é ignorado em dois minutos. No mês seguinte, o checkout devolve erro 500 por vinte minutos por causa de um certificado vencido numa dependência, e nada toca: a CPU estava em 30%.\n\nAs duas falhas têm a mesma origem: o alerta olhava para uma **causa** possível, e não para o **sintoma** que o usuário sente. O livro de SRE do Google separa as duas perguntas: o sintoma é o que está quebrado (erro, lentidão), a causa é o porquê (banco recusando conexão, CPU no limite). Alerta que acorda alguém olha para o sintoma, de preferência para o SLO. A causa vai para o painel, onde ajuda a explicar o sintoma.",
                    },
                    {
                        type: "table",
                        value: "[[\"Sinal\", \"Tipo\", \"Destino\"], [\"Erro 5xx do checkout gastando o error budget\", \"Sintoma\", \"Alerta que acorda alguém (page)\"], [\"Requisições acima do limite de latência do SLO\", \"Sintoma\", \"Page ou ticket, conforme o ritmo de gasto\"], [\"CPU a 90% num nó\", \"Causa\", \"Painel; alerta só se virar sintoma\"], [\"Pod reiniciado uma vez\", \"Causa\", \"Painel e log, sem alerta\"], [\"Disco enche em 4 horas no ritmo atual\", \"Causa com hora marcada\", \"Ticket com antecedência, por previsão de tendência\"], [\"Certificado TLS vence em 14 dias\", \"Causa com hora marcada\", \"Ticket\"]]",
                    },
                    {
                        type: "text",
                        value: "## Burn rate: o ritmo de gasto do orçamento\n\nO limiar fixo (\"erro acima de 1% por 5 minutos\") parece sensato e falha dos dois lados. De madrugada, 1 erro em 50 requisições já passa de 1% e acorda alguém por nada. E uma taxa de erro de 0,8% que dura a semana inteira nunca dispara, mas com SLO de 99,9% gasta o orçamento do mês em menos de quatro dias.\n\nO alerta bom pergunta outra coisa: **em que ritmo o orçamento está sendo gasto?** Esse ritmo é o **burn rate**, a taxa de erro observada dividida pelo orçamento (1 − SLO). Burn rate 1 gasta o orçamento exatamente no fim da janela do SLO; burn rate 2 gasta na metade do tempo. Com SLO de 99,9% em 30 dias:\n\n- erro de 0,1%: burn rate 1, o orçamento dura os 30 dias;\n- erro de 0,2%: burn rate 2, dura 15 dias;\n- erro de 1%: burn rate 10, dura 3 dias;\n- erro de 100%: burn rate 1.000, dura 43 minutos.\n\nO orçamento gasto numa janela é o burn rate vezes a janela, dividido pelo período: burn rate 14,4 durante 1 hora gasta 14,4 ÷ 720 horas, ou 2% do orçamento do mês.",
                    },
                    {
                        type: "text",
                        value: "## Múltiplas janelas, múltiplos burn rates\n\nO capítulo sobre alertas em SLO do workbook de SRE do Google chega a uma combinação que virou padrão: alertar quando uma **fração significativa do orçamento** já foi gasta, em mais de uma escala de tempo. Para um SLO de 99,9%, os parâmetros recomendados são os da tabela abaixo.\n\nA janela longa dá precisão: o alerta só dispara depois que um pedaço relevante do orçamento foi embora. Com 2% de erro (burn rate 20), a regra de 1 hora dispara depois de uns 43 minutos, o tempo de gastar 2% do orçamento nesse ritmo; com 100% de erro, em menos de um minuto. A janela curta resolve o outro lado: sem ela, o alerta continuaria disparando por quase uma hora depois da correção, enquanto a janela longa ainda \"lembra\" dos erros. Exigir que a janela curta também passe do limite faz o alerta parar poucos minutos depois que o erro para. A regra prática do workbook é a janela curta ter 1/12 da longa.",
                    },
                    {
                        type: "table",
                        value: "[[\"Severidade\", \"Janela longa\", \"Janela curta\", \"Burn rate\", \"Orçamento gasto ao disparar\", \"Limiar de erro (SLO de 99,9%)\"], [\"Page\", \"1 hora\", \"5 minutos\", \"14,4\", \"2%\", \"1,44%\"], [\"Page\", \"6 horas\", \"30 minutos\", \"6\", \"5%\", \"0,6%\"], [\"Ticket\", \"3 dias\", \"6 horas\", \"1\", \"10%\", \"0,1%\"]]",
                    },
                    {
                        type: "code",
                        value: "# slo-pedidos.rules.yml: SLO de 99,9% de disponibilidade da pedidos-api em 30 dias\ngroups:\n  - name: slo-pedidos\n    rules:\n      - record: job:slo_erros_por_requisicao:razao5m\n        expr: |\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=~\"5..\"}[5m]))\n          /\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[5m]))\n      - record: job:slo_erros_por_requisicao:razao30m\n        expr: |\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=~\"5..\"}[30m]))\n          /\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[30m]))\n      - record: job:slo_erros_por_requisicao:razao1h\n        expr: |\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=~\"5..\"}[1h]))\n          /\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[1h]))\n      - record: job:slo_erros_por_requisicao:razao6h\n        expr: |\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=~\"5..\"}[6h]))\n          /\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[6h]))\n      - record: job:slo_erros_por_requisicao:razao3d\n        expr: |\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=~\"5..\"}[3d]))\n          /\n          sum by (job) (rate(http_server_request_duration_seconds_count{job=\"pedidos-api\"}[3d]))\n\n      # no mesmo grupo, as regras rodam em ordem: o alerta lê os valores desta avaliação\n      - alert: PedidosOrcamentoQueimaRapida\n        expr: |\n          (\n            job:slo_erros_por_requisicao:razao1h{job=\"pedidos-api\"} > (14.4 * 0.001)\n            and\n            job:slo_erros_por_requisicao:razao5m{job=\"pedidos-api\"} > (14.4 * 0.001)\n          )\n          or\n          (\n            job:slo_erros_por_requisicao:razao6h{job=\"pedidos-api\"} > (6 * 0.001)\n            and\n            job:slo_erros_por_requisicao:razao30m{job=\"pedidos-api\"} > (6 * 0.001)\n          )\n        labels:\n          severity: page\n          time: pedidos\n        annotations:\n          summary: \"pedidos-api com {{ $value | humanizePercentage }} de erro: error budget queimando rápido\"\n          runbook_url: \"https://runbooks.exemplo.com.br/pedidos-api/orcamento-de-erro\"\n\n      - alert: PedidosOrcamentoQueimaLenta\n        expr: |\n          job:slo_erros_por_requisicao:razao3d{job=\"pedidos-api\"} > (1 * 0.001)\n          and\n          job:slo_erros_por_requisicao:razao6h{job=\"pedidos-api\"} > (1 * 0.001)\n        labels:\n          severity: ticket\n          time: pedidos\n        annotations:\n          summary: \"pedidos-api no ritmo de estourar o error budget do mês\"\n          runbook_url: \"https://runbooks.exemplo.com.br/pedidos-api/orcamento-de-erro\"",
                    },
                    {
                        type: "text",
                        value: "## Alerta que acorda alguém tem que exigir ação\n\nRepare nas duas severidades. **Page** acorda alguém: o orçamento está indo embora em horas e alguém precisa agir agora. **Ticket** vira tarefa para o horário de trabalho: no ritmo atual o mês estoura, mas dá para tratar amanhã. Antes de criar qualquer page, passe pelas perguntas do livro de SRE do Google: ele detecta algo urgente, que exige ação e que o usuário sente (ou vai sentir logo)? Dá para ignorá-lo sabendo que é benigno? Alguém já está sendo chamado pelo mesmo problema? Page que não exige ação vira ruído, e ruído ensina o plantão a ignorar o próximo, inclusive o verdadeiro.\n\nMais três detalhes. As regras de gravação e os alertas ficam **no mesmo grupo**, porque dentro de um grupo as regras rodam em sequência, com o mesmo horário de avaliação, e o alerta lê as razões que acabaram de ser calculadas; em grupos separados, ele pode ler o valor da avaliação anterior. Todo alerta leva `runbook_url`, o primeiro passo de quem atende. E alerta também se testa: o `promtool test rules` alimenta séries sintéticas e confere quando a regra dispara e quando para, como no teste abaixo, que mostra a janela curta encerrando o alerta.\n\nFerramentas abertas como Sloth e Pyrra geram esse conjunto de regras a partir de uma definição curta do SLO, e o Grafana tem regras de alerta próprias que seguem as mesmas ideias.",
                    },
                    {
                        type: "code",
                        value: "# teste-slo-pedidos.yml: rodar com promtool test rules teste-slo-pedidos.yml\nrule_files:\n  - slo-pedidos.rules.yml\nevaluation_interval: 1m\ntests:\n  - interval: 1m\n    input_series:\n      # 98 respostas boas por minuto durante 8 horas\n      - series: 'http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=\"200\"}'\n        values: '0+98x480'\n      # 6 horas sem erro, 1 hora com 2 erros por minuto (2% de erro, burn rate 20), depois nenhum\n      - series: 'http_server_request_duration_seconds_count{job=\"pedidos-api\", http_response_status_code=\"500\"}'\n        values: '0x360 2+2x59 120x60'\n    alert_rule_test:\n      # 40 minutos de incidente: menos de 2% do orçamento gasto, ainda não dispara\n      - eval_time: 400m\n        alertname: PedidosOrcamentoQueimaRapida\n        exp_alerts: []\n      # 45 minutos: passou de 2% do orçamento, dispara\n      - eval_time: 405m\n        alertname: PedidosOrcamentoQueimaRapida\n        exp_alerts:\n          - exp_labels: { job: pedidos-api, severity: page, time: pedidos }\n            exp_annotations:\n              summary: \"pedidos-api com 1.508% de erro: error budget queimando rápido\"\n              runbook_url: \"https://runbooks.exemplo.com.br/pedidos-api/orcamento-de-erro\"\n      # 6 minutos depois do fim dos erros: a janela de 1 h ainda passa de 1,44%, a de 5 min zerou\n      - eval_time: 426m\n        alertname: PedidosOrcamentoQueimaRapida\n        exp_alerts: []\n    promql_expr_test:\n      - expr: job:slo_erros_por_requisicao:razao1h > (14.4 * 0.001)\n        eval_time: 426m\n        exp_samples:\n          - labels: 'job:slo_erros_por_requisicao:razao1h{job=\"pedidos-api\"}'\n            value: 0.018002717391304348",
                    },
                    {
                        type: "quote",
                        value: "Alerte no sintoma, de preferência no ritmo de gasto do error budget: burn rate alto na janela longa e na curta ao mesmo tempo acorda alguém, burn rate baixo e persistente vira ticket. Todo page precisa exigir ação, e a regra se testa com o `promtool` antes de ir para produção.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual destes alertas olha para um sintoma e é bom candidato a acordar o plantão?",
                        difficulty: "facil",
                        options: [
                            { text: "Proporção de respostas 5xx do checkout gastando o error budget rápido", isCorrect: true },
                            { text: "CPU acima de 85% em um dos nós do cluster por mais de 10 minutos seguidos", isCorrect: false },
                            { text: "Pod da pedidos-api reiniciado duas vezes nos últimos 30 minutos", isCorrect: false },
                            { text: "Memória do processo da pedidos-api acima de 2 GB na última hora", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com SLO de 99,9% em 30 dias, o que significa o serviço estar com burn rate 1?",
                        difficulty: "facil",
                        options: [
                            { text: "Uma em cada cem requisições está falhando nas últimas horas de medição", isCorrect: false },
                            { text: "O orçamento do período já acabou e o SLO do mês foi oficialmente violado", isCorrect: false },
                            { text: "O alerta de page dispara uma vez por hora enquanto o erro se mantiver", isCorrect: false },
                            { text: "O orçamento está sendo gasto no ritmo exato de acabar no fim dos 30 dias", isCorrect: true },
                        ],
                    },
                    {
                        statement: "SLO de 99,9% em 30 dias. Nas últimas 6 horas, a taxa de erro ficou estável em 0,6%. Quanto do orçamento do mês essas 6 horas gastaram?",
                        difficulty: "medio",
                        options: [
                            { text: "0,83% do orçamento", isCorrect: false },
                            { text: "6% do orçamento", isCorrect: false },
                            { text: "0,6% do orçamento", isCorrect: false },
                            { text: "5% do orçamento", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Na regra de múltiplas janelas, a condição de 1 hora vem acompanhada de uma condição de 5 minutos com o mesmo limiar. Para que serve a janela de 5 minutos?",
                        difficulty: "medio",
                        options: [
                            { text: "Para o alerta parar poucos minutos depois que o erro acaba, e não quase uma hora depois", isCorrect: true },
                            { text: "Para pegar picos curtos de erro, que a janela de 1 hora sozinha não consegue enxergar a tempo", isCorrect: false },
                            { text: "Para dar tempo de um deploy terminar antes de o alerta disparar e acordar alguém", isCorrect: false },
                            { text: "Para a regra ficar mais barata, já que o Prometheus calcula a de 1 hora a partir dela", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma regra copiada do workbook de SRE usa `> (14.4 * 0.001)`, feita para SLO de 99,9%. O serviço novo tem SLO de 99,5% em 30 dias, e o time quer o mesmo critério: page quando 2% do orçamento for gasto em 1 hora. Qual limiar usar?",
                        difficulty: "dificil",
                        options: [
                            { text: "`> (14.4 * 0.995)`, que usa o próprio SLO como multiplicador", isCorrect: false },
                            { text: "`> (14.4 * 0.005)`, que dispara quando o erro passa de 7,2%", isCorrect: true },
                            { text: "`> (14.4 * 0.0005)`, que dispara quando o erro passa de 0,72%", isCorrect: false },
                            { text: "`> (14.4 * 0.001)`, porque o burn rate já é relativo ao SLO", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Exemplars",
                blocks: [
                    {
                        type: "text",
                        value: "# Exemplars\n\nÀs 14h05, o p99 do checkout saltou de 300 ms para 2,4 segundos. O gráfico mostra que ficou lento, mas não mostra **qual** requisição ficou lenta, nem por quê: métrica é agregado, e agregado não tem trace id. O caminho sem ajuda é abrir o Tempo e procurar traces lentos naquela janela, com uma busca TraceQL como `{ resource.service.name = \"pedidos-api\" && span:duration > 2s }`, e torcer para o primeiro resultado ser representativo.\n\nO **exemplar** encurta esse caminho. Ele é uma medição de amostra presa a um ponto da métrica: o valor medido, o instante, e o `trace_id` e o `span_id` da requisição que o produziu. No gráfico de latência do Grafana, os exemplars aparecem como pontos sobre a linha; o ponto lá em cima, em 2,4 segundos, tem um botão que abre aquele trace no Tempo. É a ponte direta do agregado para o caso individual.",
                    },
                    {
                        type: "text",
                        value: "## Um exemplar por bucket\n\nExemplar não é a lista de todas as requisições: é amostra. No SDK do .NET, um histograma com fronteiras guarda **no máximo um exemplar por bucket** a cada coleta, e a medição mais recente sobrescreve a anterior. Para investigar, é exatamente o que se quer: o bucket de 2,5 segundos, onde caem as requisições lentas, carrega o trace de uma requisição lenta de verdade.\n\nDuas condições decidem se uma medição vira exemplar:\n\n- **O filtro de exemplar.** No SDK do .NET ele vem **desligado** (`AlwaysOff`). As outras opções são `AlwaysOn` (qualquer medição) e `TraceBased` (só a medição feita dentro de um span amostrado), que é a escolha certa: o exemplar sempre aponta para um trace que foi gravado. Dá para ligar sem mexer no código, com a variável de ambiente `OTEL_METRICS_EXEMPLAR_FILTER=trace_based`.\n- **O span ativo.** A medição precisa acontecer enquanto o span da requisição está ativo. O histograma de duração do ASP.NET Core já é gravado assim. Num histograma seu, grave dentro do handler, e não numa tarefa que roda depois de a requisição terminar.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da pedidos-api: métricas e traces por OTLP, com exemplars ligados\nusing System.Diagnostics;\nusing System.Diagnostics.Metrics;\nusing OpenTelemetry.Metrics;\nusing OpenTelemetry.Resources;\nusing OpenTelemetry.Trace;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddSingleton<MetricasPagamento>();\nbuilder.Services.AddHttpClient(\"pagamentos\", c => c.BaseAddress = new Uri(\"http://pagamentos\"));\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pedidos-api\"))\n    .WithTracing(t => t\n        .AddAspNetCoreInstrumentation()\n        .AddHttpClientInstrumentation()\n        .AddOtlpExporter())\n    .WithMetrics(m => m\n        .AddAspNetCoreInstrumentation()\n        .AddMeter(MetricasPagamento.NomeDoMeter)\n        // vem desligado no SDK do .NET; TraceBased só aceita medição feita dentro de span amostrado\n        .SetExemplarFilter(ExemplarFilterType.TraceBased)\n        .AddOtlpExporter());\n\nvar app = builder.Build();\n\napp.MapPost(\"/pedidos/{id:int}/pagar\", async (int id, IHttpClientFactory fabrica, MetricasPagamento metricas) =>\n{\n    var inicio = Stopwatch.GetTimestamp();\n    using var resposta = await fabrica.CreateClient(\"pagamentos\").PostAsync($\"/autorizacoes/{id}\", null);\n\n    // gravado dentro do span da requisição: o exemplar sai com o trace_id dela\n    metricas.Autorizacao.Record(Stopwatch.GetElapsedTime(inicio).TotalSeconds,\n        new KeyValuePair<string, object?>(\"pagamento.aprovado\", resposta.IsSuccessStatusCode));\n\n    resposta.EnsureSuccessStatusCode();\n    return TypedResults.Ok();\n});\n\napp.Run();\n\npublic sealed class MetricasPagamento\n{\n    public const string NomeDoMeter = \"Loja.Pagamentos\";\n    public Histogram<double> Autorizacao { get; }\n\n    public MetricasPagamento(IMeterFactory fabrica) =>\n        Autorizacao = fabrica.Create(NomeDoMeter).CreateHistogram<double>(\n            \"pagamentos.autorizacao.duracao\", unit: \"s\",\n            description: \"Tempo de resposta do provedor de pagamento\");\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Etapa\", \"O que precisa\", \"Se faltar\"], [\"SDK do .NET\", \"Filtro de exemplar TraceBased (vem desligado)\", \"Nenhum exemplar sai da aplicação\"], [\"Medição\", \"Gravada com o span da requisição ativo\", \"A medição não vira exemplar\"], [\"Transporte\", \"OTLP, ou raspagem no formato OpenMetrics\", \"O formato de texto clássico perde o exemplar\"], [\"Prometheus\", \"O flag de armazenamento de exemplars\", \"As séries chegam e os exemplars somem, sem erro\"], [\"Grafana\", \"Destino de exemplar com o rótulo trace_id, apontando para o Tempo\", \"Os pontos aparecem, mas sem link para o trace\"], [\"Tempo\", \"O trace guardado pela amostragem\", \"O link abre e o trace não existe\"]]",
                    },
                    {
                        type: "text",
                        value: "## Do lado do Prometheus e do Grafana\n\nNo laboratório, o Collector entrega as métricas ao receptor OTLP do Prometheus e os traces ao Tempo. O Prometheus 3 precisa de **dois** flags: `--web.enable-otlp-receiver`, para receber OTLP, e `--enable-feature=exemplar-storage`, para guardar exemplars. Em outubro de 2026 (conferido na 3.13), o armazenamento de exemplars ainda é recurso atrás de flag: um buffer circular em memória, compartilhado por todas as séries, de 100 mil exemplars por padrão (`max_exemplars`, no bloco `storage` da configuração), também gravado no WAL. Sem o flag, nada reclama: as séries chegam, as consultas funcionam, e os exemplars são descartados em silêncio.\n\nE a raspagem? Até meados de 2026, a resposta para o .NET era não: o exportador Prometheus do SDK, pacote ainda em beta, só passou a escrever exemplars de contadores e de buckets na versão 1.16.0-beta.1, de junho de 2026, e só no formato OpenMetrics, que o Prometheus 3 pede por padrão. Com versão anterior, ou com o formato de texto clássico, o exemplar se perde no caminho. O README do pacote recomenda OTLP para produção, e o OTLP leva exemplars no próprio protocolo.\n\nNo Grafana, a fonte de dados Prometheus precisa de um **destino de exemplar**: o nome do rótulo que guarda o id do trace e a fonte Tempo para onde o link aponta. O OpenTelemetry grava esse rótulo como `trace_id`. Muitos exemplos na internet usam `traceID`, vindo de outras instrumentações; copiado assim, os pontos aparecem no gráfico, e o botão para abrir o trace não.",
                    },
                    {
                        type: "code",
                        value: "# compose.yaml (trecho): Prometheus recebendo OTLP e guardando exemplars\nservices:\n  prometheus:\n    image: prom/prometheus:v3.13.4\n    command:\n      - --config.file=/etc/prometheus/prometheus.yml\n      - --storage.tsdb.path=/prometheus\n      - --web.enable-otlp-receiver\n      - --enable-feature=exemplar-storage\n\n# grafana/provisioning/datasources/fontes.yaml\napiVersion: 1\ndatasources:\n  - name: Prometheus\n    type: prometheus\n    uid: prometheus\n    access: proxy\n    url: http://prometheus:9090\n    jsonData:\n      exemplarTraceIdDestinations:\n        - name: trace_id          # o rótulo em que o OpenTelemetry grava o id do trace\n          datasourceUid: tempo    # a fonte Tempo, logo abaixo\n  - name: Tempo\n    type: tempo\n    uid: tempo\n    access: proxy\n    url: http://tempo:3200",
                    },
                    {
                        type: "text",
                        value: "## Quando o link quebra\n\nO exemplar aponta para um trace, mas não garante que o trace exista. As quebras mais comuns:\n\n- **Tail sampling depois do exemplar.** O SDK amostrou o span e mandou o exemplar com o `trace_id` dele; depois, o Collector decidiu descartar o trace inteiro. O link abre \"trace não encontrado\". A política de tail sampling que guarda todo trace lento e todo trace com erro cobre justamente os exemplars que interessam, os dos buckets altos.\n- **Retenções diferentes.** Se o Tempo guarda traces por 7 dias e o Prometheus guarda métricas por 30, um exemplar antigo aponta para um trace que já foi apagado. O buffer de exemplars também tem tamanho fixo e descarta os mais antigos.\n- **Medição fora do span.** Histograma gravado numa tarefa em segundo plano, depois que a requisição terminou, não tem span ativo e não vira exemplar com `TraceBased`.\n\nQuando os pontos não aparecem, confira de trás para frente. A API de exemplars do Prometheus devolve alguma coisa? Se não, o problema está antes dela (filtro, flag, transporte). Se devolve, o problema está no Grafana.",
                    },
                    {
                        type: "code",
                        value: "# terminal: os exemplars guardados para a duração de requisições da pedidos-api\ncurl -sG http://localhost:9090/api/v1/query_exemplars \\\n  --data-urlencode 'query=http_server_request_duration_seconds_bucket{job=\"pedidos-api\"}' \\\n  --data-urlencode \"start=$(date -d '-15 min' +%s)\" \\\n  --data-urlencode \"end=$(date +%s)\"\n\n# resposta (trecho): cada série de bucket traz o exemplar dela\n{\"seriesLabels\": {\"job\": \"pedidos-api\", \"http_route\": \"/pedidos/{id:int}\", \"le\": \"0.75\", ...},\n \"exemplars\": [{\"labels\": {\"trace_id\": \"123ae0198c50585054fdad6c9fde74c1\", \"span_id\": \"7749b543421d165b\"},\n                \"value\": \"0.7012935\", \"timestamp\": 1792502129.203}]}",
                    },
                    {
                        type: "quote",
                        value: "O exemplar liga o ponto da métrica ao trace de uma requisição real. Ele exige o filtro TraceBased no SDK do .NET (que vem desligado), transporte que o carregue, o flag de armazenamento no Prometheus e o rótulo `trace_id` no Grafana, e só funciona se a amostragem tiver guardado o trace.",
                    },
                ],
                questions: [
                    {
                        statement: "O que um exemplar acrescenta a um ponto da métrica de latência?",
                        difficulty: "facil",
                        options: [
                            { text: "O percentil exato daquele intervalo, sem a estimativa feita pelo histograma", isCorrect: false },
                            { text: "Uma medição de amostra com o `trace_id` e o `span_id` da requisição que a produziu", isCorrect: true },
                            { text: "A lista de todas as requisições que caíram naquele bucket durante a última coleta", isCorrect: false },
                            { text: "O log de erro completo da requisição mais lenta que caiu naquele intervalo de coleta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço .NET manda métricas por OTLP para um Prometheus que já guarda exemplars de outros serviços, e os traces dele aparecem normalmente no Tempo. Os exemplars deste serviço nunca aparecem. O que falta na configuração de métricas do serviço?",
                        difficulty: "facil",
                        options: [
                            { text: "Dar ao `Meter` o mesmo nome do `ActivitySource`, para o SDK conseguir ligar as medições aos traces", isCorrect: false },
                            { text: "Trocar os histogramas por contadores, porque o SDK do .NET só gera exemplar para medições de contador", isCorrect: false },
                            { text: "Trocar o OTLP pelo exportador Prometheus de raspagem, que é o único caminho que leva exemplars", isCorrect: false },
                            { text: "Ligar o filtro `TraceBased` com `SetExemplarFilter`, porque o padrão do SDK é não gerar exemplar", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No Prometheus 3, as séries de um serviço chegam pelo receptor OTLP e respondem às consultas normalmente, mas a API `query_exemplars` devolve uma lista vazia, sem erro nenhum em log. O serviço comprovadamente envia exemplars. O que falta?",
                        difficulty: "medio",
                        options: [
                            { text: "Subir o Prometheus com `--enable-feature=exemplar-storage`, que liga o armazenamento", isCorrect: true },
                            { text: "Ligar `--web.enable-remote-write-receiver`, que é por onde entram os exemplars", isCorrect: false },
                            { text: "Aumentar o `max_exemplars`, porque o valor padrão zero deixa o buffer desligado", isCorrect: false },
                            { text: "Trocar o receptor OTLP pela raspagem, porque o receptor OTLP descarta os exemplars recebidos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No Grafana, os pontos de exemplar aparecem sobre o gráfico de latência, mas o detalhe do ponto não traz o botão para abrir o trace no Tempo. A fonte Prometheus tem um destino de exemplar com o nome de rótulo `traceID`, apontando para a fonte Tempo. O que corrigir?",
                        difficulty: "medio",
                        options: [
                            { text: "Ligar a opção de exemplars na consulta do gráfico, que hoje está desligada nesse painel", isCorrect: false },
                            { text: "Ligar o receptor OTLP no Tempo, que hoje não recebe os exemplars mandados pelo Prometheus", isCorrect: false },
                            { text: "Trocar a fonte Tempo por uma fonte Jaeger, que é a única que entende o formato desse exemplar", isCorrect: false },
                            { text: "Trocar o nome do rótulo para `trace_id`, que é como o OpenTelemetry grava o id no exemplar", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O link do exemplar de uma requisição lenta abre \"trace não encontrado\" no Tempo. A aplicação usa filtro `TraceBased` e amostragem de cabeça de 100%; o Collector faz tail sampling guardando 10% dos traces normais e todos os traces com erro. Qual é a explicação mais provável, e a correção?",
                        difficulty: "dificil",
                        options: [
                            { text: "O exemplar aponta para o span, e não para o trace inteiro; configurar o rótulo `span_id` no Grafana resolve", isCorrect: false },
                            { text: "O Prometheus guarda o `trace_id` truncado no exemplar; aumentar o `max_exemplars` resolve o corte", isCorrect: false },
                            { text: "O `TraceBased` escolheu a medição de um span não amostrado; trocar o filtro para `AlwaysOn` resolve", isCorrect: false },
                            { text: "O tail sampling descartou o trace depois que o exemplar saiu; uma política para traces lentos resolve", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Plantão",
                blocks: [
                    {
                        type: "text",
                        value: "# Plantão\n\nUma semana de plantão com 140 notificações: 90 de um alerta de disco que dispara e some sozinho em três minutos, 30 do mesmo incidente (uma por instância), 15 de um alerta de teste que ninguém lembra quem criou, e 5 problemas reais. Na quarta-feira, quem está de plantão já silenciou o celular. Na quinta, um dos cinco reais passa batido.\n\nIsso é **fadiga de alerta**: quando a maior parte do que toca é ruído, as pessoas aprendem a ignorar o que toca, inclusive o que importa. O remédio não é pedir mais atenção, é ter menos alertas e melhores. O livro de SRE do Google dá a escala: um incidente leva em média 6 horas de trabalho entre análise, correção e acompanhamento, então um turno de 12 horas comporta no máximo 2 incidentes; e o plantão não deveria passar de 25% do tempo de quem faz SRE. Ruído consome essa margem sem resolver nada.",
                    },
                    {
                        type: "text",
                        value: "## Runbook: o alerta chega com o primeiro passo\n\nTodo alerta que acorda alguém leva um `runbook_url`. O runbook não é tutorial nem análise de causa: é o que a pessoa precisa nos primeiros minutos, com sono e sem contexto. Um bom runbook responde:\n\n- **O que o alerta significa**, em linguagem simples, e qual é o impacto para o usuário.\n- **Onde olhar**: o link do painel do serviço, já filtrado.\n- **Como mitigar antes de entender**: voltar o deploy, desligar a feature flag, aumentar réplicas, tirar a instância doente do balanceador. Mitigar vem antes de achar a causa.\n- **Quando e para quem escalar.**\n\nRunbook envelhece. Quem atende o alerta corrige no mesmo dia o que estava errado nele, e um runbook que se resume a \"rode este comando\" é candidato a virar automação, não leitura.",
                    },
                    {
                        type: "code",
                        value: "# runbooks/pedidos-api/orcamento-de-erro.md\n\n## PedidosOrcamentoQueimaRapida\n\nO que é: a pedidos-api está gastando o error budget de 30 dias rápido demais\n(2% em 1 hora ou 5% em 6 horas). Clientes estão recebendo erro ao fechar pedido agora.\n\nPainel: https://grafana.exemplo.com.br/d/pedidos-api (rotas, status e deploys no topo)\n\nPrimeiros 10 minutos\n1. No painel, os 5xx estão em todas as rotas ou em uma só?\n2. Houve deploy nas últimas 2 horas? Se sim, volte a versão anterior antes de investigar.\n3. Os 5xx vêm de uma dependência (pagamentos, banco)? Abra o painel dela e acione o time dono.\n4. É uma instância só? Tire-a do balanceador e deixe as outras atenderem.\n\nEscalar: sem melhora em 30 minutos, chame a liderança técnica de pedidos pela escala de plantão.\nSilenciar: só com incidente aberto, com hora para acabar e o número do incidente no comentário.",
                    },
                    {
                        type: "text",
                        value: "## Menos ruído: agrupar, inibir, silenciar\n\nO Prometheus decide **quando** um alerta dispara; o Alertmanager decide **quem recebe, como e quantas vezes**. É nele que mora a maior parte da redução de ruído:\n\n- **Agrupamento** (`group_by`): alertas com os mesmos valores nos rótulos escolhidos viram uma notificação só. Trinta instâncias com o mesmo alerta chegam como uma mensagem com trinta itens. O grupo novo espera o `group_wait` (30 segundos, por padrão) para juntar o que chega junto; alerta novo num grupo que já notificou espera o `group_interval` (5 minutos); e o lembrete de um grupo que continua disparando sai a cada `repeat_interval` (4 horas).\n- **Inibição** (`inhibit_rules`): enquanto um alerta de origem dispara, os alertas de destino com os mesmos valores nos rótulos de `equal` ficam mudos. Se o page de queima rápida já tocou, o ticket de queima lenta do mesmo serviço não acrescenta nada; o workbook de SRE cita essa supressão como parte da estratégia de múltiplos burn rates.\n- **Silêncio**: para manutenção planejada ou incidente já em atendimento, sempre com hora para acabar e um comentário que diga por quê.\n- **Rotas**: page vai para quem está de plantão; ticket vai para a fila do time, com lembrete uma vez por dia.\n\nCuidado com um engano comum: `group_by: ['...']` não junta tudo num grupo só. Esse valor especial agrupa por **todos** os rótulos, o que na prática desliga o agrupamento.",
                    },
                    {
                        type: "code",
                        value: "# alertmanager.yml\nroute:\n  receiver: chamados-pedidos\n  group_by: [alertname, job]\n  group_wait: 30s\n  group_interval: 5m\n  repeat_interval: 4h\n  routes:\n    - matchers: ['severity=\"page\"']\n      receiver: plantao-pedidos\n    - matchers: ['severity=\"ticket\"']\n      receiver: chamados-pedidos\n      repeat_interval: 24h\n\ninhibit_rules:\n  # o page do orçamento já disparou: o ticket do mesmo serviço só repete a notícia\n  - source_matchers: ['severity=\"page\"']\n    target_matchers: ['severity=\"ticket\"']\n    equal: [job]\n\nreceivers:\n  - name: plantao-pedidos\n    webhook_configs:\n      - url: http://ponte-plantao:8080/alertas\n  - name: chamados-pedidos\n    webhook_configs:\n      - url: http://ponte-chamados:8080/alertas",
                    },
                    {
                        type: "table",
                        value: "[[\"Fonte de ruído\", \"Correção\"], [\"Alerta que dispara e some sozinho em minutos\", \"Um for maior, keep_firing_for, ou trocar o limiar fixo por burn rate\"], [\"Um incidente, uma notificação por instância\", \"group_by pelo serviço, e o alerta escrito no nível do serviço\"], [\"Alerta de causa sem impacto no usuário\", \"Rebaixar para painel ou ticket\"], [\"Page e ticket do mesmo problema ao mesmo tempo\", \"Regra de inibição, com equal no rótulo do serviço\"], [\"Manutenção planejada tocando o telefone\", \"Silêncio com hora para acabar\"], [\"Alerta que ninguém sabe o que fazer\", \"Escrever o runbook, ou apagar o alerta\"], [\"Causa previsível descoberta tarde demais\", \"Previsão de tendência em ticket, com antecedência\"]]",
                    },
                    {
                        type: "code",
                        value: "# disco.rules.yml: causa com hora marcada vira ticket com antecedência\ngroups:\n  - name: infraestrutura\n    rules:\n      - alert: DiscoEnchendoEmQuatroHoras\n        expr: predict_linear(node_filesystem_avail_bytes{mountpoint=\"/\"}[6h], 4 * 3600) < 0\n        for: 30m              # a previsão precisa se sustentar por meia hora\n        keep_firing_for: 15m  # não resolve e dispara de novo a cada oscilação\n        labels:\n          severity: ticket\n          time: plataforma\n        annotations:\n          summary: \"{{ $labels.instance }}: no ritmo das últimas 6 h, o disco enche em menos de 4 h\"\n          runbook_url: \"https://runbooks.exemplo.com.br/infra/disco-cheio\"\n\n# terminal: silêncio de 2 horas durante a troca de disco planejada\namtool silence add alertname=DiscoEnchendoEmQuatroHoras instance=db-01 \\\n  --duration=2h --author=plantao --comment=\"troca de disco planejada\" \\\n  --alertmanager.url=http://localhost:9093",
                    },
                    {
                        type: "text",
                        value: "## A fadiga se mede\n\nRuído não diminui sozinho; diminui quando alguém olha os números toda semana. Os mais úteis:\n\n- **Notificações por turno**, e quantas foram de madrugada.\n- **Proporção que exigiu ação.** Page que não levou a ação nenhuma é candidato a virar ticket ou a sumir.\n- **Os alertas que mais tocaram.** Quase sempre, três ou quatro alertas respondem pela maior parte do ruído.\n- **Tempo até alguém reconhecer o alerta.** Quando ele cresce, o plantão já está ignorando.\n\nNa passagem de plantão, quem sai conta o que ficou aberto, quais silêncios estão ativos e o que tocou sem motivo. Cada alerta que tocou à toa sai da conversa com um destino: apagar, rebaixar para ticket, ajustar o limiar ou ganhar runbook. Plantão saudável é aquele em que, quando o telefone toca, a pessoa confia que é sério.",
                    },
                    {
                        type: "quote",
                        value: "Plantão funciona com poucos alertas, todos com runbook e todos exigindo ação. O Alertmanager agrupa, inibe e silencia, e a revisão semanal apaga ou rebaixa o que tocou à toa, porque alerta ignorado ensina a ignorar o próximo.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o runbook ligado a um alerta de page precisa trazer, antes de qualquer outra coisa?",
                        difficulty: "facil",
                        options: [
                            { text: "O histórico completo de todos os incidentes que o serviço já teve até hoje", isCorrect: false },
                            { text: "O que o alerta significa, o impacto no usuário e os primeiros passos para mitigar", isCorrect: true },
                            { text: "A causa raiz do problema e a correção definitiva que precisa entrar no código do serviço", isCorrect: false },
                            { text: "A consulta PromQL do alerta e a justificativa matemática de cada limiar usado na regra", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um banco cai e trinta instâncias da pedidos-api disparam o mesmo alerta ao mesmo tempo. Qual recurso do Alertmanager faz isso chegar ao plantão como uma notificação só?",
                        difficulty: "facil",
                        options: [
                            { text: "O agrupamento por rótulos, configurado em `group_by`", isCorrect: true },
                            { text: "Um `repeat_interval` mais longo na rota do plantão", isCorrect: false },
                            { text: "A regra de inibição, configurada em `inhibit_rules`", isCorrect: false },
                            { text: "Um silêncio criado na hora pela interface do Alertmanager", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A pedidos-api tem dois alertas de error budget: o page de queima rápida e o ticket de queima lenta. Num incidente forte, os dois disparam juntos e o ticket só repete a notícia. Qual configuração tira o ticket redundante sem perder nenhum dos dois quando cada um dispara sozinho?",
                        difficulty: "medio",
                        options: [
                            { text: "Inibição com o ticket como origem, o page como alvo e `equal: [job]`", isCorrect: false },
                            { text: "Um `group_by: [severity]` na rota principal, juntando os dois avisos", isCorrect: false },
                            { text: "Um silêncio permanente para o ticket, já que o page cobre o mesmo caso", isCorrect: false },
                            { text: "Inibição com o page como origem, o ticket como alvo e `equal: [job]`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um grupo de alertas já notificou o plantão. Dois minutos depois, um alerta novo entra no mesmo grupo. Com os tempos padrão do Alertmanager, quando sai a notificação que inclui o alerta novo?",
                        difficulty: "medio",
                        options: [
                            { text: "Logo depois do `group_wait` de 30 segundos, como acontece com todo grupo novo", isCorrect: false },
                            { text: "Só quando vencer o `repeat_interval` de 4 horas desde o último envio do grupo", isCorrect: false },
                            { text: "Na mesma hora, porque alerta novo num grupo que já existe nunca espera para sair", isCorrect: false },
                            { text: "Quando completar o `group_interval` de 5 minutos desde o último envio do grupo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num mês, o plantão recebeu 300 notificações: 180 de um alerta de disco que dispara e some em 3 minutos, 80 de um alerta de CPU alta sem impacto no usuário e 40 de incidentes reais, vindas dos alertas de error budget. Qual plano reduz o ruído sem perder os incidentes reais?",
                        difficulty: "dificil",
                        options: [
                            { text: "Trocar o alerta de disco por previsão de esgotamento em ticket e tirar a CPU da paginação", isCorrect: true },
                            { text: "Usar `group_by: ['...']` na rota principal, para juntar todos os alertas numa mensagem só", isCorrect: false },
                            { text: "Aumentar o `repeat_interval` para 24 horas em todas as rotas, cortando as notificações repetidas", isCorrect: false },
                            { text: "Silenciar os três alertas toda noite e revisar pela manhã o que tiver disparado durante a madrugada", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Investigando em produção",
        aulas: [
            {
                titulo: "Do alerta à causa",
                blocks: [
                    {
                        type: "text",
                        value: "# Do alerta à causa\n\nSão 14:20 de uma terça-feira e dispara o alerta do SLO de disponibilidade do checkout. Em dois minutos o canal do plantão tem seis pessoas: uma abriu o painel do banco, outra lê logs de erro do gateway, uma terceira sugere reiniciar tudo. Cada uma olha uma coisa diferente, ninguém sabe dizer quantos clientes estão sendo afetados, e o tempo passa.\n\nAo longo deste estudo você montou as peças: log estruturado com `trace_id`, métricas RED, traces que atravessam serviços, o pipeline no Collector, painéis e alertas por sintoma. Esta aula junta as peças num **roteiro de investigação**, uma ordem de perguntas que leva do alerta à causa sem depender de sorte nem de alguém que conheça o sistema de cor.\n\nA ideia central cabe numa frase: **a métrica diz que algo está errado e quanto, o trace diz onde, o log diz por quê.** Cada sinal responde bem a uma pergunta e mal às outras. A investigação anda quando cada sinal é usado para o que faz bem e um leva ao outro: do painel ao trace, do trace aos logs pelo `trace_id`.",
                    },
                    {
                        type: "table",
                        value: "[[\"Passo\", \"Pergunta\", \"Onde olhar\"], [\"1. Sintoma\", \"O que o usuário sente, desde quando e quanto?\", \"Métricas RED e o SLO do serviço\"], [\"2. Mudança\", \"O que mudou perto do início?\", \"Anotações de deploy, mudança de configuração, tráfego\"], [\"3. Recorte\", \"O que o grupo afetado tem em comum?\", \"A mesma métrica quebrada por rota, método e instância\"], [\"4. Exemplo\", \"Onde a requisição falha ou demora?\", \"Um trace, pela busca no Tempo ou por um exemplar\"], [\"5. Detalhe\", \"Por que falha?\", \"Logs filtrados pelo trace_id do exemplo\"], [\"6. Confirmação\", \"A explicação vale para todas as requisições afetadas?\", \"Métricas e busca de traces, de novo\"], [\"7. Mitigação\", \"Como parar o dano agora?\", \"A métrica do passo 1, depois da ação\"]]",
                    },
                    {
                        type: "text",
                        value: "## Passos 1 a 3: o tamanho e o recorte\n\nO caso que vamos seguir: o checkout recebe cerca de 20 pedidos por segundo, distribuídos por quatro instâncias. O painel RED mostra a taxa de requisições normal e a latência normal, mas o erro 5xx do `POST /pedidos` saiu de 0,1%, a linha de base de sempre, para 2,6%, e a subida começa às 14:05. As outras rotas do checkout seguem na linha de base. Isso já é muita informação: o problema é de erro e não de lentidão, atinge uma rota só e tem hora para começar.\n\nHora de início pede a pergunta do passo 2: **o que mudou às 14:05?** A anotação de deploy no painel responde. Às 14:05 a versão 2.8.0 entrou como **canário** (a versão nova recebendo só uma fatia do tráfego, para ser comparada com a estável) em uma das quatro instâncias, com um quarto dos pedidos.\n\nO passo 3 quebra a mesma métrica por instância. Três instâncias seguem em 0,1%; a do canário está em 10,1%. Repare no que o total escondia: 2,6% parece um problema moderado, mas um em cada dez pedidos que caem no canário falha. **A taxa geral dilui o grupo afetado**, e por isso o recorte vem antes de qualquer teoria. Muita gente pula direto para os logs nessa hora e se perde; o recorte custou uma consulta e já reduziu o problema a uma instância e uma versão.\n\nO recorte na métrica só funciona com dimensões que existem como rótulo, como rota, método e instância. Se a pergunta for \"é um cliente específico?\", a métrica não tem `cliente_id` (e não deve ter, pela cardinalidade); esse recorte se faz nos traces e nos logs, onde o atributo existe.",
                    },
                    {
                        type: "code",
                        value: "# Passo 1: taxa de erro do POST /pedidos nos últimos 5 minutos (5xx sobre o total)\nsum(rate(http_server_request_duration_seconds_count{http_request_method=\"POST\", http_route=\"/pedidos\", http_response_status_code=~\"5..\"}[5m]))\n/\nsum(rate(http_server_request_duration_seconds_count{http_request_method=\"POST\", http_route=\"/pedidos\"}[5m]))\n\n# Passo 3: a mesma conta, uma linha por instância\nsum by (instance) (rate(http_server_request_duration_seconds_count{http_request_method=\"POST\", http_route=\"/pedidos\", http_response_status_code=~\"5..\"}[5m]))\n/\nsum by (instance) (rate(http_server_request_duration_seconds_count{http_request_method=\"POST\", http_route=\"/pedidos\"}[5m]))\n\n# Resultado às 14:20\n# {instance=\"checkout-1\"}  0.001\n# {instance=\"checkout-2\"}  0.001\n# {instance=\"checkout-3\"}  0.001\n# {instance=\"checkout-4\"}  0.101   <- o canário da 2.8.0",
                    },
                    {
                        type: "text",
                        value: "## Passos 4 e 5: do exemplo ao detalhe\n\nCom o grupo isolado, o próximo passo é olhar **uma requisição** que falhou. A busca de traces do Tempo, filtrando por serviço, rota, status de erro e a instância do canário, traz exemplos em segundos (um exemplar no painel de latência leva ao mesmo lugar). O trace mostra onde a falha nasce: o span `AplicarCupom`, um span manual do checkout, termina com status de erro e um evento de exceção. Os atributos do resource confirmam `service.version` igual a 2.8.0.\n\nO trace diz onde; o porquê está no log. Filtrando os logs pelo `trace_id` daquele trace, aparece a linha de erro com o contexto que o span não tem: qual cupom, qual pedido, a pilha da exceção. O cupom é o `BEMVINDO10`, um cupom permanente, sem data de validade, e a pilha aponta para a regra nova de validade da 2.8.0, mostrada logo abaixo.",
                    },
                    {
                        type: "code",
                        value: "# Trace 4bf92f3577b34da6a3ce929d0e0e4736 (service.version = 2.8.0, instance = checkout-4)\nPOST /pedidos ................................. 38 ms   Error  500\n  SELECT carrinho .............................. 6 ms\n  AplicarCupom ................................. 2 ms   Error\n    evento exception: System.InvalidOperationException: Nullable object must have a value.\n\n# Logs do mesmo trace no Loki (pelo OTLP, o trace_id chega como metadado estruturado)\n{service_name=\"checkout\"} | trace_id=\"4bf92f3577b34da6a3ce929d0e0e4736\"\n\n14:21:07.412 ERR Falha ao aplicar o cupom BEMVINDO10 no pedido 81234\nSystem.InvalidOperationException: Nullable object must have a value.\n   at Cupons.Validar(Cupom cupom, DateTimeOffset agora) in Cupons.cs:line 9",
                    },
                    {
                        type: "code",
                        value: "// Cupons.cs na versão 2.8.0: a regra nova de validade\npublic sealed record Cupom(string Codigo, bool Ativo, DateTimeOffset? ValidoAte);\n\npublic static class Cupons\n{\n    public static bool Validar(Cupom cupom, DateTimeOffset agora)\n    {\n        // cupom permanente, como o BEMVINDO10, tem ValidoAte nulo\n        if (cupom.ValidoAte.Value < agora) // aviso CS8629 no build, que ninguém leu\n            return false;\n        return cupom.Ativo;\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Passos 6 e 7: confirmar e mitigar\n\nUm trace é uma anedota. Antes de declarar a causa, confira se a explicação vale para a população. A busca de traces com erro na instância do canário, nos últimos 15 minutos, mostra o `AplicarCupom` com erro em todos eles. E a conta fecha: a métrica de negócio diz que 10% dos pedidos usam cupom; se todo pedido com cupom falha na 2.8.0, o canário deveria ter 10% de erro mais a linha de base de 0,1% sobre o resto, perto dos 10,1% medidos. Quando a previsão não bate com a medida, a hipótese está errada ou incompleta (larga demais, ou explicando só parte dos erros), e o roteiro volta ao passo 3.\n\nA mitigação, por sua vez, **não precisava esperar** a confirmação. Desde o passo 2 havia uma mudança coincidindo com o início do sintoma e uma ação segura para desfazê-la. Tirar o canário às 14:21, um minuto depois do alerta, teria poupado dez minutos de pedidos recusados. Em incidente, a ordem é parar o dano e depois entender; a causa continua lá para o postmortem. O time tirou o canário às 14:31, e a taxa de erro voltou a 0,1% nos minutos seguintes, o tempo de a janela de 5 minutos do `rate` se renovar.\n\nA correção, sem pressa e com teste: comparar sem `.Value`. Em C#, `cupom.ValidoAte < agora` dá `false` quando a validade é nula, e o cupom permanente deixa de vencer.",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns numa investigação\n\n- **Começar pelos logs, procurando \"error\".** Todo sistema tem erro o tempo inteiro: sessão vencida, cliente que cancelou, validação recusada. Sem comparar com a linha de base (a mesma hora de ontem, a semana passada), você persegue o erro que sempre esteve lá.\n- **Confiar num trace só.** O trace que você abriu pode ser a exceção. É a métrica que diz se ele representa o problema.\n- **Olhar só o total.** Os 2,6% do serviço escondiam os 10,1% do canário. Quebre por rota, instância e versão antes de teorizar.\n- **Mexer em três coisas ao mesmo tempo.** Reiniciar, escalar e voltar a versão juntos tira o sintoma e apaga a pista: ninguém sabe o que resolveu. Uma ação por vez, olhando a métrica do passo 1.\n- **Investigar de memória.** Anote cada observação e cada ação, com horário, no canal do incidente. Essa linha do tempo vira o postmortem.",
                    },
                    {
                        type: "quote",
                        value: "Métrica para saber o que e quanto, recorte para achar o grupo afetado, trace para achar onde, log para entender por quê, e a métrica de novo para confirmar. Quando o sintoma começa junto com uma mudança, desfaça a mudança primeiro e explique depois.",
                    },
                ],
                questions: [
                    {
                        statement: "No roteiro de investigação, qual sinal responde melhor à pergunta \"em que ponto do caminho esta requisição falhou\"?",
                        difficulty: "facil",
                        options: [
                            { text: "A métrica de erro, que mostra a taxa de falhas de cada rota no tempo", isCorrect: false },
                            { text: "O alerta de SLO, que indica qual serviço está gastando o orçamento", isCorrect: false },
                            { text: "O trace, que mostra cada span da requisição com duração e status", isCorrect: true },
                            { text: "O log de acesso, que registra o status final de cada requisição", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O alerta disparou às 14:20, o painel mostra que os erros começaram às 14:05, e a anotação de deploy marca a entrada de um canário às 14:05. Voltar a versão é seguro e leva um minuto. Qual é a melhor próxima ação?",
                        difficulty: "facil",
                        options: [
                            { text: "Esperar a próxima janela do alerta para confirmar que não é ruído", isCorrect: false },
                            { text: "Reiniciar as quatro instâncias para limpar o estado acumulado", isCorrect: false },
                            { text: "Tirar o canário agora e investigar a causa com o sistema estável", isCorrect: true },
                            { text: "Achar a linha exata do defeito antes de mexer em produção de novo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A taxa de erro geral do `POST /pedidos` está em 2,6%. Três das quatro instâncias, que recebem 75% do tráfego, seguem na linha de base de 0,1%; a quarta roda o canário e recebe os outros 25%. Qual é, aproximadamente, a taxa de erro no canário?",
                        difficulty: "medio",
                        options: [
                            { text: "Cerca de 3,5%", isCorrect: false },
                            { text: "Cerca de 0,65%", isCorrect: false },
                            { text: "Cerca de 2,6%", isCorrect: false },
                            { text: "Cerca de 10,1%", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Durante a investigação, a busca por logs de nível Error do checkout no Loki traz 3.000 linhas de \"Falha ao publicar evento de auditoria, nova tentativa agendada\" na última hora, bem mais que qualquer outra mensagem. O que fazer com essa pista antes de segui-la?",
                        difficulty: "medio",
                        options: [
                            { text: "Comparar com a mesma hora de ontem, para ver se ela já existia antes", isCorrect: true },
                            { text: "Tratar como a causa, porque é o erro mais frequente do período do alerta", isCorrect: false },
                            { text: "Descartar, porque a própria mensagem diz que haverá uma nova tentativa", isCorrect: false },
                            { text: "Ligar o nível Debug no checkout para ver mais detalhes sobre a auditoria", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num outro incidente, o canário tem 4,1% de erro, a linha de base é 0,1% e 10% dos pedidos usam cupom. Os três traces de erro que você abriu mostram exceção em `AplicarCupom`. O que os números dizem sobre a hipótese \"todo pedido com cupom falha na versão nova\"?",
                        difficulty: "dificil",
                        options: [
                            { text: "Não fecha: com cupom em 10% dos pedidos, o erro previsto seria de só 1%", isCorrect: false },
                            { text: "Não fecha: ela preveria uns 10% de erro, então só parte dos cupons falha", isCorrect: true },
                            { text: "Fecha: 4,1% cabe dentro dos 10% de pedidos que usam algum tipo de cupom", isCorrect: false },
                            { text: "Fecha: os três traces abertos mostram a exceção no mesmo span, o AplicarCupom", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Latência",
                blocks: [
                    {
                        type: "text",
                        value: "# Latência\n\nO painel do catálogo mostra latência média de 139 ms, estável há semanas, e o suporte recebe reclamação de página de produto que leva quatro segundos para abrir. As duas coisas são verdade ao mesmo tempo. Num minuto com 1.000 requisições, 985 levaram 80 ms e 15 levaram 4 segundos: a média dá 138,8 ms, um número que parece saudável e que descreve uma requisição que não aconteceu. Ninguém esperou 139 ms. Quase todos esperaram 80, e um em cada 67 esperou 4 segundos.\n\nLatência não é um número, é uma **distribuição**, e a média mistura o caso comum com a cauda (as requisições raras e lentas da ponta da distribuição, a **cauda longa**) sem mostrar nenhum dos dois. Esta aula aplica o que você já sabe de histogramas e `histogram_quantile` às perguntas de uma investigação: o que a média esconde, como ler percentis, por que não existe média de percentil e por que a cauda de um serviço vira o caso comum de quem chama muitos deles.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: média e percentis de 20 requisições (tempos em ms)\nint[] latencias = [48, 52, 55, 57, 58, 60, 61, 63, 64, 66,\n                   68, 70, 72, 75, 79, 84, 90, 118, 1900, 2300];\n\nConsole.WriteLine($\"média: {latencias.Average()} ms\");\nforeach (var p in new[] { 50, 90, 95, 99 })\n    Console.WriteLine($\"p{p}: {Percentil(latencias, p)} ms\");\n\n// posto mais próximo: o menor valor que cobre p% da amostra\nstatic int Percentil(int[] valores, int p)\n{\n    var ordenados = valores.Order().ToArray();\n    var posto = (int)Math.Ceiling(p / 100.0 * ordenados.Length);\n    return ordenados[posto - 1];\n}\n\n// Saída:\n// média: 272 ms\n// p50: 66 ms\n// p90: 118 ms\n// p95: 1900 ms\n// p99: 2300 ms",
                    },
                    {
                        type: "text",
                        value: "## O que a amostra mostra\n\nDezoito das vinte requisições levaram entre 48 e 118 ms, e duas levaram 1,9 e 2,3 segundos. A média de 272 ms fica **acima do p90**: nenhuma requisição levou algo perto de 272 ms, e o número sobe só por causa das duas lentas. Média acima do p90 é sinal de cauda pesada puxando a conta.\n\nOs percentis contam a história por partes:\n\n- **p50** (a mediana), 66 ms: metade das requisições levou até isso. É a experiência típica.\n- **p90**, 118 ms: nove em cada dez levaram até isso.\n- **p95 e p99**: aqui mora a cauda. Com só 20 amostras, o p99 é o próprio máximo, porque um centésimo de 20 requisições não chega a uma. Percentil alto precisa de volume; em produção, com milhares de requisições por minuto, ele fica estável e significa alguma coisa.\n\nEm amostra pequena, o método de cálculo muda o número: pelo posto mais próximo, usado no código, o p90 é 118 ms; por interpolação linear entre vizinhos, daria cerca de 296 ms. Em produção, o `histogram_quantile` interpola dentro do balde em que o percentil caiu, e a precisão do resultado é a largura desse balde.\n\n**1% é muita gente.** Com 1.000 requisições por segundo, o 1% acima do p99 são 10 requisições por segundo, 36 mil por hora. E uma pessoa não faz uma requisição só: uma página que dispara 20 chamadas à API pega ao menos uma na cauda com chance de `1 - 0,99^20`, cerca de 18%. O p99 do servidor é o que quase um em cada cinco carregamentos de página sente.",
                    },
                    {
                        type: "table",
                        value: "[[\"Número\", \"O que responde\", \"Onde engana\"], [\"Média\", \"Tempo total gasto dividido pelas requisições; serve para capacidade\", \"Mistura caso comum e cauda; descreve uma requisição que não existe\"], [\"p50\", \"A experiência típica\", \"Não se mexe quando só a cauda piora\"], [\"p95 e p99\", \"A experiência da cauda; base comum para SLO de latência\", \"Precisa de volume: com poucas amostras, vira o máximo\"], [\"Máximo\", \"O pior caso; bom para achar timeout\", \"Um único evento estranho domina o número\"], [\"Heatmap (mapa de calor) do histograma\", \"A forma inteira da distribuição ao longo do tempo\", \"Difícil de pôr num alerta; é para olhar e investigar\"]]",
                    },
                    {
                        type: "text",
                        value: "## Não existe média de percentil\n\nCom quatro instâncias, é tentador pegar o p99 de cada uma e tirar a média. O resultado não é o p99 de nada. Imagine quatro instâncias, cada uma com um quarto do tráfego: três saudáveis, com p99 de 200 ms, e uma doente, em que 20% das requisições levam 2 s. A média dos quatro p99 dá 650 ms. O p99 do serviço, calculado sobre todas as requisições juntas, é **2 s**: 5% de todas as requisições passaram pela instância doente e levaram 2 s, então o centésimo mais lento inteiro está lá. A média dos percentis subestimou o problema em três vezes.\n\nNenhuma conta feita sobre os percentis das partes (média, soma, máximo) dá o percentil do todo, a não ser por coincidência. O que se combina são os **baldes do histograma**: some as contagens de todas as instâncias e calcule o percentil uma vez, no fim. Vale para instâncias, regiões e rotas, e é o que a consulta certa abaixo faz.",
                    },
                    {
                        type: "code",
                        value: "# Errado: média dos p99 de cada instância (não é o p99 de nada)\navg(\n  histogram_quantile(0.99,\n    sum by (instance, le) (rate(http_server_request_duration_seconds_bucket{http_route=\"/produtos/{id}\"}[5m])))\n)\n\n# Certo: soma os baldes de todas as instâncias e calcula o percentil uma vez\nhistogram_quantile(0.99,\n  sum by (le) (rate(http_server_request_duration_seconds_bucket{http_route=\"/produtos/{id}\"}[5m])))",
                    },
                    {
                        type: "text",
                        value: "## Latência em cascata\n\nQuando um serviço chama outros, a cauda deles vira parte da latência dele, de dois jeitos.\n\n**Em sequência, os tempos se somam.** O checkout que consulta o estoque, depois o pagamentos, depois o frete, espera a soma dos três, e qualquer um que caia na cauda arrasta a requisição inteira. No trace, isso aparece como spans filhos um depois do outro.\n\n**Em paralelo, a requisição espera a mais lenta.** É o **fan-out**: uma requisição que dispara várias chamadas ao mesmo tempo, como a busca que consulta 100 partições e só responde quando a última volta. Se cada chamada tem 1% de chance de passar do p99 do serviço chamado, a chance de pelo menos uma de N chamadas passar é `1 - 0,99^N`. Jeffrey Dean e Luiz André Barroso mostraram essa conta no artigo \"The Tail at Scale\" (2013): servidores que respondem em 10 ms no caso típico e em 1 s no p99, chamados 100 de cada vez, deixam 63% das requisições do usuário com mais de 1 segundo. **O p99 de quem é chamado vira o caso típico de quem chama muitos.**\n\nPor isso, serviço que fica no meio de um fan-out se acompanha pela cauda (p99, p99,9), não pela mediana. E cortar o fan-out (menos chamadas, cache, chamadas em lote) costuma render mais que otimizar cada chamada.",
                    },
                    {
                        type: "table",
                        value: "[[\"Chamadas em paralelo\", \"Chance de ao menos uma passar do p99\"], [\"1\", \"1%\"], [\"5\", \"4,9%\"], [\"10\", \"9,6%\"], [\"20\", \"18,2%\"], [\"50\", \"39,5%\"], [\"100\", \"63,4%\"]]",
                    },
                    {
                        type: "text",
                        value: "## Duas armadilhas do gráfico de latência\n\n**Erro rápido melhora o gráfico.** Depois de um deploy, o p99 do `POST /pedidos` caiu de 900 ms para 300 ms e o time comemorou. A taxa de erro tinha subido de 0,2% para 30%: uma dependência passou a recusar chamadas em 5 ms com 503, e falha rápida puxa a latência para baixo. Latência se lê junto com a taxa de erro (é por isso que o RED traz as duas), e o percentil que importa para o usuário é o das respostas de sucesso, filtrando por `http_response_status_code`.\n\n**Distribuição com dois picos.** Um endpoint responde em 5 ms quando acha o dado no cache e em 200 ms quando não acha. Com 80% de acerto, a média é 44 ms, e nenhuma requisição leva 44 ms: ou são 5, ou são 200. Numa distribuição assim, média e percentis reagem de jeitos diferentes quando a proporção muda, e só o heatmap mostra os dois picos. Diante de um número estranho, olhe a distribuição antes de tirar conclusão.",
                    },
                    {
                        type: "quote",
                        value: "Latência é distribuição: a média mistura o caso comum com a cauda e não mostra nenhum dos dois. Leia percentis junto com a taxa de erro, combine baldes e nunca percentis, e lembre que quem chama muitos serviços em paralelo sente a cauda de todos eles.",
                    },
                ],
                questions: [
                    {
                        statement: "O `GET /produtos/{id}` tem p99 de 800 ms na última hora. O que isso significa?",
                        difficulty: "facil",
                        options: [
                            { text: "99% das requisições levaram até 800 ms, e 1% levou mais que isso", isCorrect: true },
                            { text: "A média das requisições mais lentas da última hora foi de 800 ms", isCorrect: false },
                            { text: "A latência ficou abaixo de 800 ms durante 99% do tempo da hora", isCorrect: false },
                            { text: "A requisição mais lenta da última hora levou exatamente 800 ms", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Quatro instâncias do catálogo têm p99 de 180, 190, 200 e 1.800 ms. Um painel mostra a média desses valores, 592,5 ms, como \"p99 do serviço\". Como interpretar esse número?",
                        difficulty: "facil",
                        options: [
                            { text: "Não é o p99 de nada: percentis das partes não se combinam por média", isCorrect: true },
                            { text: "É o p99 do serviço ponderado pelas instâncias, como o PromQL calcula", isCorrect: false },
                            { text: "É uma estimativa conservadora, sempre acima do p99 real do serviço", isCorrect: false },
                            { text: "É o p99 do serviço, desde que o tráfego seja igual nas quatro instâncias", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma página consulta 40 serviços em paralelo e só responde quando todos voltam. Cada chamada passa do p99 do serviço chamado em 1% das vezes, de forma independente. Em que fração dos carregamentos ao menos uma chamada passa do p99?",
                        difficulty: "medio",
                        options: [
                            { text: "Cerca de 67%", isCorrect: false },
                            { text: "Cerca de 33%", isCorrect: true },
                            { text: "Cerca de 1%", isCorrect: false },
                            { text: "Cerca de 40%", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Logo depois de um deploy, o p99 do `POST /pedidos` caiu de 900 ms para 300 ms. Antes de comemorar, o que conferir primeiro?",
                        difficulty: "medio",
                        options: [
                            { text: "A taxa de erro, porque falha rápida também puxa a latência para baixo", isCorrect: true },
                            { text: "O p50, porque ele confirma se a melhora chegou à maioria das requisições", isCorrect: false },
                            { text: "O uso de CPU, porque ele mostra se o código novo ficou mais eficiente", isCorrect: false },
                            { text: "O número de instâncias, porque réplicas a mais também reduzem a fila", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um endpoint responde em 5 ms quando acha o dado no cache e em 200 ms quando não acha. A taxa de acerto do cache caiu de 80% para 60%. O que acontece com o p50, o p90 e a média?",
                        difficulty: "dificil",
                        options: [
                            { text: "p50 e p90 continuam em 5 e 200 ms; a média também continua em 44 ms", isCorrect: false },
                            { text: "p50 sobe de 5 para 200 ms; p90 continua em 200; a média sobe para 83 ms", isCorrect: false },
                            { text: "p50 continua em 5 ms; p90 sobe de 44 para 200; a média sobe para 83 ms", isCorrect: false },
                            { text: "p50 e p90 continuam em 5 e 200 ms; a média sobe de 44 para 83 ms", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Dependência lenta e erro em cascata",
                blocks: [
                    {
                        type: "text",
                        value: "# Dependência lenta e erro em cascata\n\nSexta-feira de promoção, 50 pedidos por segundo. Às 10:00 o provedor externo que o antifraude consulta começa a responder em 3 segundos em vez de 40 ms. Ninguém mudou nada no checkout, no pagamentos nem no banco. Às 10:04 o checkout recusa a maior parte dos pedidos, o pagamentos mostra 100 de 100 conexões do pool em uso, e o painel do banco marca CPU em 8%. Três serviços parecem doentes, e só um deles tem um problema de verdade.\n\nIsso é uma **falha em cascata**: a dependência lenta prende recursos de quem a chama (conexões, threads, memória), quem chama fica lento, e a lentidão sobe a pilha até o usuário. No caminho, timeouts mal escolhidos e retries bem-intencionados multiplicam a carga sobre o serviço que já estava sofrendo. Esta aula mostra como achar o culpado no trace e por que as defesas mais comuns, mal configuradas, pioram tudo.",
                    },
                    {
                        type: "code",
                        value: "# Trace de um pedido recusado às 10:04 (durações em ms)\nPOST /pedidos (checkout) ............................... 6.104  Error\n  POST pagamentos (cliente HTTP, tentativa 1) .......... 2.000  Error: timeout\n    POST /pagamentos (pagamentos) ...................... 3.410\n      [390 ms sem nenhum span filho]\n      POST antifraude (cliente HTTP) ................... 3.012\n        POST /analise (antifraude) ..................... 3.005\n          POST provedor externo (cliente HTTP) ......... 2.990\n      INSERT pagamento (Npgsql) ............................ 4\n  POST pagamentos (cliente HTTP, tentativa 2) .......... 2.000  Error: timeout\n  POST pagamentos (cliente HTTP, tentativa 3) .......... 2.000  Error: timeout\n# os filhos das tentativas 2 e 3 têm a mesma forma e estão recolhidos",
                    },
                    {
                        type: "text",
                        value: "## Achar o culpado no trace\n\nA regra é descer pelo filho que explica o tempo do pai, até chegar a um span cujo tempo **é dele mesmo**, sem filho que o explique. No trace acima, os 6.104 ms do checkout são três tentativas de 2 s; a primeira leva ao pagamentos (3.410 ms), que passa 3.012 ms chamando o antifraude, que passa 2.990 ms esperando o provedor externo. O provedor é a folha com o tempo: é ali que a lentidão nasce. A métrica confirma: o p99 do `http.client.request.duration` do antifraude para o endereço do provedor saiu de 60 ms para 3 s às 10:00, e a latência de todo o resto subiu **depois** disso.\n\nTrês detalhes do trace contam o resto da história:\n\n- **O buraco de 390 ms** no começo do span do pagamentos é tempo gasto dentro do pagamentos em algo que não gerou span: esperar conexão do pool, esperar um lock, CPU, pausa de GC ou uma chamada sem instrumentação. Aqui era a fila por uma conexão do banco, como o log do pagamentos e a métrica do pool mostram.\n- **O span de servidor do pagamentos (3.410 ms) dura mais que o span de cliente que o chamou (2.000 ms).** O checkout desistiu aos 2 s, e o pagamentos continuou trabalhando para ninguém, segurando uma conexão do banco o tempo todo. Cada máquina mede a duração no próprio relógio, então diferença de relógio entre servidores não explica isso: o trabalho continuou mesmo.\n- **Três tentativas idênticas** do checkout, todas com timeout: o retry triplicou a carga num serviço que já não dava conta.\n\nNuma cascata quase todo span fica lento, e muita gente culpa o primeiro serviço lento que encontra, quase sempre o banco. O culpado é o que ficou lento **primeiro** e cuja lentidão explica a dos outros; quando o trace não basta, a linha do tempo das métricas de cada serviço desempata.",
                    },
                    {
                        type: "text",
                        value: "## Como a lentidão vira erro\n\nA lei de Little dá a conta: **requisições em andamento = taxa de chegada × tempo de cada uma**. O pagamentos recebe 50 requisições por segundo e, por um defeito de desenho, abre a transação no banco antes de chamar o antifraude, segurando uma conexão do pool durante a chamada. Com o antifraude em 40 ms, cada requisição prende a conexão por uns 60 ms: 50 × 0,06 = 3 conexões ocupadas, em média. Com o antifraude em 3 s, seriam 150, e o pool do Npgsql tem no máximo 100 por padrão (`Max Pool Size`). As requisições que sobram esperam na fila do pool, e nessa fila entram também as rotas que **nem chamam o antifraude**, como o `GET /pagamentos/{id}`, que responde em 5 ms quando há conexão livre.\n\nÉ por isso que o banco aparece ocioso, com CPU em 8%, enquanto o serviço jura que o banco está lento: o gargalo é o pool, do lado do cliente, preso por requisições que esperam a rede. E o retry do checkout piora a conta. Com três tentativas, chegam 150 requisições por segundo ao pagamentos, que precisaria de 450 conexões, enquanto 100 conexões presas por 3 s dão vazão a uns 33 pagamentos por segundo.",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\", \"Chegada no pagamentos\", \"Conexão presa por\", \"Conexões necessárias\", \"Pool\"], [\"Normal\", \"50 por segundo\", \"0,06 s\", \"3\", \"100\"], [\"Antifraude em 3 s\", \"50 por segundo\", \"3 s\", \"150\", \"100\"], [\"Antifraude em 3 s e checkout com 3 tentativas\", \"150 por segundo\", \"3 s\", \"450\", \"100\"]]",
                    },
                    {
                        type: "text",
                        value: "## Timeout e retry que pioram tudo\n\n- **Sem timeout explícito.** O `HttpClient.Timeout` padrão é de 100 segundos. Sem configurar, cada chamada ao antifraude lento pode prender conexão, memória e, aqui, uma conexão do banco por até 100 s.\n- **Timeout de quem chama menor que o de quem é chamado.** O checkout desiste em 2 s, mas o pagamentos espera o antifraude por até 100 s, e o trabalho segue depois que ninguém mais espera a resposta. Os timeouts precisam encolher ao descer a cadeia, cada chamada cabendo no tempo que sobra a quem chamou, e o serviço chamado precisa parar quando quem chamou desiste: no ASP.NET Core, é repassar o `CancellationToken` da requisição para as chamadas de saída.\n- **Retry em todas as camadas.** Se gateway, checkout e pagamentos fazem até 3 tentativas cada, um clique do usuário vira até 3 × 3 × 3 = 27 chamadas ao antifraude quando ele falha. Retry fica numa camada só, em geral a mais próxima de quem falhou.\n- **Retry imediato e sem limite.** Tentar de novo na hora, contra um serviço saturado, é só mais carga. Use espera crescente com **jitter** (um sorteio no intervalo de espera, para as retentativas de muitos clientes não chegarem juntas) e um teto de retentativas.\n- **Retry de operação que não é idempotente.** A tentativa que deu timeout no cliente pode ter terminado no servidor, como o span de 3.410 ms mostrou. Retentar uma cobrança sem chave de idempotência cobra duas vezes.\n\nO código abaixo aplica as regras no cliente do checkout: um orçamento de 2 s para tudo, 900 ms por tentativa, uma retentativa só, com jitter, a mesma chave de idempotência nas duas, e cada tentativa como um span com o número dela.",
                    },
                    {
                        type: "code",
                        value: "// ClientePagamentos.cs: orçamento de 2 s, uma retentativa e cada tentativa visível no trace\nusing System.Diagnostics;\nusing System.Net.Http.Json;\n\npublic sealed record Cobranca(Guid PedidoId, decimal Valor);\n\n// http vem do AddHttpClient<ClientePagamentos>, com BaseAddress apontando para o pagamentos\npublic sealed class ClientePagamentos(HttpClient http)\n{\n    private static readonly ActivitySource Fonte = new(\"Loja.Checkout\");\n    private static readonly TimeSpan Orcamento = TimeSpan.FromSeconds(2);\n    private static readonly TimeSpan PorTentativa = TimeSpan.FromMilliseconds(900);\n\n    // ct é o token da requisição do checkout: se o cliente desistir, tudo aqui para junto\n    public async Task<HttpResponseMessage> CobrarAsync(Cobranca cobranca, CancellationToken ct)\n    {\n        using var total = CancellationTokenSource.CreateLinkedTokenSource(ct);\n        total.CancelAfter(Orcamento);\n\n        for (var tentativa = 1; ; tentativa++)\n        {\n            using var span = Fonte.StartActivity(\"cobrar\");\n            span?.SetTag(\"loja.tentativa\", tentativa);\n            using var limite = CancellationTokenSource.CreateLinkedTokenSource(total.Token);\n            limite.CancelAfter(PorTentativa);\n            try\n            {\n                using var requisicao = new HttpRequestMessage(HttpMethod.Post, \"pagamentos\")\n                {\n                    Content = JsonContent.Create(cobranca)\n                };\n                // mesma chave nas duas tentativas: o pagamentos não cobra duas vezes\n                requisicao.Headers.Add(\"Idempotency-Key\", cobranca.PedidoId.ToString());\n                return await http.SendAsync(requisicao, limite.Token);\n            }\n            catch (OperationCanceledException)\n            {\n                span?.SetStatus(ActivityStatusCode.Error, ct.IsCancellationRequested ? \"cliente desistiu\" : \"timeout\");\n                if (tentativa == 2 || total.IsCancellationRequested) throw;\n                await Task.Delay(Random.Shared.Next(50, 150), total.Token); // espera com jitter\n            }\n        }\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O que olhar para enxergar a cascata\n\nO código deixa a defesa visível: cada tentativa vira um span com o número dela e o motivo do erro, e timeout aparece separado de cliente que desistiu. No painel, três leituras mostram uma cascata antes de ela chegar ao usuário:\n\n- **Chamadas de saída por requisição de entrada.** Se o checkout recebe 50 pedidos por segundo e faz 150 chamadas por segundo ao pagamentos, cada pedido está virando três chamadas: retry acontecendo. A razão sai de métricas que você já tem, como na consulta abaixo.\n- **Recursos esperando.** Conexões do pool em uso contra o máximo, a fila do thread pool (`dotnet.thread_pool.queue.length`, da instrumentação de runtime), requisições em andamento. Recurso no teto com o sistema ocioso por trás aponta para espera, não para trabalho.\n- **Latência das dependências pelo lado de quem chama.** O p99 de cada destino no `http.client.request.duration` mostra quem ficou lento primeiro.",
                    },
                    {
                        type: "code",
                        value: "# Chamadas do checkout ao pagamentos por pedido recebido (1 = sem retry; 3 = todo pedido tentou três vezes)\nsum(rate(http_client_request_duration_seconds_count{job=\"checkout\", server_address=\"pagamentos\"}[5m]))\n/\nsum(rate(http_server_request_duration_seconds_count{job=\"checkout\", http_route=\"/pedidos\"}[5m]))",
                    },
                    {
                        type: "quote",
                        value: "No trace, desça pelo filho que explica o tempo do pai até o span cujo tempo é dele mesmo; numa cascata quase tudo fica lento, e só um começou. Timeout que encolhe ao descer a cadeia, retry numa camada só, com espera e limite, e operação idempotente impedem que a defesa vire o ataque.",
                    },
                ],
                questions: [
                    {
                        statement: "Num trace, o span `POST /pagamentos` dura 3.410 ms, e o único filho dele, a chamada ao antifraude, dura 3.012 ms e começa 390 ms depois do pai. O que indicam esses 390 ms?",
                        difficulty: "facil",
                        options: [
                            { text: "Tempo gasto no próprio pagamentos em algo que não gerou span", isCorrect: true },
                            { text: "Tempo que o antifraude levou para aceitar a conexão TCP do cliente", isCorrect: false },
                            { text: "Diferença de relógio entre as máquinas do pagamentos e do antifraude", isCorrect: false },
                            { text: "Latência de rede entre o pagamentos e o antifraude, na ida", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O `HttpClient` que o pagamentos usa para chamar o antifraude foi criado sem configurar timeout. Por quanto tempo uma chamada pode ficar esperando uma resposta que não vem?",
                        difficulty: "facil",
                        options: [
                            { text: "Até 100 segundos, o valor padrão de `HttpClient.Timeout`", isCorrect: true },
                            { text: "Até 30 segundos, o valor padrão de `HttpClient.Timeout`", isCorrect: false },
                            { text: "Até 15 segundos, o valor padrão de `HttpClient.Timeout`", isCorrect: false },
                            { text: "Sem limite, porque o padrão de `HttpClient.Timeout` é infinito", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O pagamentos recebe 80 requisições por segundo, e cada uma segura uma conexão do banco enquanto espera o antifraude. Com o antifraude respondendo em 2 s, quantas conexões seriam necessárias ao mesmo tempo, e o que acontece com um pool de 100?",
                        difficulty: "medio",
                        options: [
                            { text: "40; o pool aguenta, porque cada conexão atende duas requisições por segundo", isCorrect: false },
                            { text: "160; o banco satura e a CPU dele vai a 100% com as consultas paradas", isCorrect: false },
                            { text: "80; o pool aguenta, porque cada requisição usa uma conexão por vez", isCorrect: false },
                            { text: "160; o pool esgota e até as rotas que não chamam o antifraude esperam", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Gateway, checkout e pagamentos fazem, cada um, até 3 tentativas (a original e 2 retries) na chamada ao serviço seguinte da cadeia, que termina no antifraude. Se o antifraude falhar sempre, quantas chamadas ele recebe por clique do usuário?",
                        difficulty: "medio",
                        options: [
                            { text: "27 chamadas", isCorrect: true },
                            { text: "6 chamadas", isCorrect: false },
                            { text: "81 chamadas", isCorrect: false },
                            { text: "9 chamadas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O checkout chama o pagamentos com timeout de 2 s e uma retentativa, sem chave de idempotência. No trace de um pedido cobrado duas vezes, a primeira tentativa do checkout terminou em timeout aos 2.000 ms, e o span de servidor do pagamentos dessa tentativa durou 3.410 ms, com status OK. O que aconteceu?",
                        difficulty: "dificil",
                        options: [
                            { text: "O span de servidor somou o tempo da retentativa, que reaproveitou a mesma conexão HTTP", isCorrect: false },
                            { text: "O pagamentos concluiu a cobrança depois que o checkout desistiu, e a retentativa cobrou de novo", isCorrect: true },
                            { text: "O relógio do pagamentos está adiantado, por isso o span de servidor parece maior que o de cliente", isCorrect: false },
                            { text: "O timeout cancelou a cobrança no pagamentos, e o OK do span vale só para o envio da resposta", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Mensageria observada",
                blocks: [
                    {
                        type: "text",
                        value: "# Mensageria observada\n\nO cliente paga às 10:02 e o e-mail de confirmação chega às 10:41. Nenhum alerta disparou: a API respondeu o `POST /pagamentos` em 118 ms, a taxa de erro está na linha de base, e o serviço de e-mail não registrou falha nenhuma. Mesmo assim o cliente esperou 39 minutos por algo que costuma levar segundos.\n\nNum fluxo assíncrono, a API termina o trabalho dela quando publica a mensagem. O resto acontece depois, num consumidor, e o tempo que a mensagem passa parada na fila não entra em nenhuma métrica de latência HTTP. Um painel RED impecável da API convive com um cliente esperando há meia hora. Esta aula mostra o que medir numa fila, como estimar a espera com os números que o broker já publica, como medir a espera de verdade e como ler o trace que atravessa o broker.",
                    },
                    {
                        type: "text",
                        value: "## Tamanho não é atraso\n\nPara uma investigação, quatro números do broker importam em cada fila: mensagens **prontas** (esperando um consumidor), mensagens **não confirmadas** (já entregues a um consumidor, ainda sem ack), o número de **consumidores** e as taxas de entrada e de saída (publicações e acks por segundo).\n\nO erro mais comum é alertar e investigar pelo tamanho da fila. Tamanho sozinho não diz quanto alguém espera; o que diz é o tamanho **dividido pela taxa de consumo**. É a lei de Little de novo, agora numa fila: a mensagem que chega agora espera todas as que estão na frente, e a **espera ≈ prontas / consumo por segundo**. Uma fila com 50.000 mensagens consumidas a 10.000 por segundo faz a mensagem nova esperar 5 s; uma com 300 mensagens consumidas a 0,5 por segundo faz esperar 10 minutos. Perguntar pela **idade da fila** (há quanto tempo a mensagem da frente está esperando) é a mesma pergunta vista do outro lado: numa fila em ordem, a idade da mensagem da frente é a espera de quem está sendo entregue agora.\n\nA diferença entre entrada e saída diz para onde a fila vai. Com 300 mensagens por segundo entrando e 200 saindo, a fila cresce 100 por segundo, 6.000 por minuto, e a espera cresce junto. Depois do pico, ela esvazia na velocidade da diferença entre saída e entrada, não na velocidade da saída.",
                    },
                    {
                        type: "table",
                        value: "[[\"Fila\", \"Mensagens prontas\", \"Consumo\", \"Espera da mensagem nova\"], [\"e-mail\", \"50.000\", \"10.000 por segundo\", \"5 s\"], [\"nota fiscal\", \"300\", \"0,5 por segundo\", \"10 min\"], [\"estoque\", \"12.000\", \"200 por segundo\", \"60 s\"]]",
                    },
                    {
                        type: "text",
                        value: "## Medir a espera de verdade\n\nA conta pela lei de Little é uma boa estimativa em regime estável. Para saber quanto as mensagens esperaram de fato, com percentis, meça no consumidor: o publicador carimba a hora da publicação e o consumidor, ao começar a processar, registra a diferença num histograma. Com isso você tem o p99 da espera e pode alertar no sintoma (\"p99 da espera acima de 60 s por 10 minutos\") em vez de alertar no tamanho da fila, que é causa.\n\nDois cuidados. O relógio de quem publica e o de quem consome são de máquinas diferentes; sincronizados por NTP, a diferença fica em milissegundos, irrelevante para esperas de segundos ou minutos. E o timestamp do AMQP guarda segundos inteiros: a medida sai entre a espera real e a espera real mais 1 s. Para resolução de milissegundos, mande a hora num header. Os baldes do histograma abaixo foram escolhidos para a pergunta que interessa aqui, segundos ou minutos: o `InstrumentAdvice` sugere os baldes no próprio instrumento, e o SDK do OpenTelemetry para .NET usa a sugestão (conferido na versão 1.20).",
                    },
                    {
                        type: "code",
                        value: "// EsperaNaFila.cs: o publicador carimba a hora e o consumidor mede quanto a mensagem esperou\nusing System.Diagnostics.Metrics;\nusing RabbitMQ.Client;\nusing RabbitMQ.Client.Events;\n\npublic static class EsperaNaFila\n{\n    private static readonly Meter Medidor = new(\"Loja.Email\");\n\n    // baldes de 1 s a 30 min: aqui a pergunta é \"segundos ou minutos?\"\n    private static readonly Histogram<double> Espera = Medidor.CreateHistogram(\n        \"loja.fila.espera\", unit: \"s\",\n        description: \"Tempo entre a publicação e o início do processamento\",\n        tags: null,\n        advice: new InstrumentAdvice<double> { HistogramBucketBoundaries = [1, 5, 15, 30, 60, 120, 300, 600, 1800] });\n\n    // no publicador: o timestamp do AMQP guarda segundos inteiros\n    public static BasicProperties Propriedades() => new()\n    {\n        Persistent = true,\n        Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds())\n    };\n\n    // no consumidor, antes de processar a mensagem\n    public static void Registrar(BasicDeliverEventArgs ea, string fila)\n    {\n        if (!ea.BasicProperties.IsTimestampPresent()) return;\n        var publicadaEm = DateTimeOffset.FromUnixTimeSeconds(ea.BasicProperties.Timestamp.UnixTime);\n        var espera = Math.Max(0, (DateTimeOffset.UtcNow - publicadaEm).TotalSeconds);\n        Espera.Record(espera, new KeyValuePair<string, object?>(\"fila\", fila));\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O trace que atravessa o broker\n\nCom a instrumentação do cliente, o span de publicação (`publish pagamento.aprovado`, do tipo Producer) leva o contexto no header `traceparent`, e o consumidor abre o span `deliver pagamento.aprovado` (tipo Consumer) **como filho do publish, no mesmo trace**. Isso vale para o `RabbitMQ.Client` 7.2 ou mais novo, registrado como você viu ao estudar propagação de contexto; o pacote `RabbitMQ.Client.OpenTelemetry`, em outubro de 2026, só existe como versão 1.0.0-rc.2. Nos clientes 7.0 e 7.1, o span do consumidor nascia num trace separado, ligado ao publish só por um link: se os traces do seu sistema \"terminam na fila\", confira a versão do cliente antes de qualquer outra coisa.\n\nLendo o trace:\n\n- A **duração do `deliver`** é o tempo do handler do consumidor, do começo ao fim do processamento da mensagem.\n- O **intervalo entre o fim do `publish` e o começo do `deliver`** é a espera: a fila no broker mais o tempo no buffer do consumidor, onde mensagens entregues adiantado pelo **prefetch** (o lote que o broker manda a cada consumidor antes dos acks) aguardam a vez.\n- `deliver` curto com intervalo longo é falta de vazão (poucos consumidores para a entrada), não lentidão de cada mensagem. `deliver` longo é lentidão no processamento: desça pelos filhos dele, como na aula anterior.\n\nO trace, porém, é amostrado. Com amostragem na cabeça de 10% na API, o consumidor, com o amostrador padrão baseado no pai, segue a decisão que veio no `traceparent`, e só uma em cada dez mensagens tem trace. O histograma da espera conta todas: o trace mostra um exemplo, a métrica mostra a população.",
                    },
                    {
                        type: "code",
                        value: "# Trace do pagamento do pedido 81234 (início de cada span e duração)\n10:02:04.192  POST /pagamentos (api, Server) ........................ 118 ms\n10:02:04.240    INSERT pagamento (Npgsql) ............................. 6 ms\n10:02:04.301    publish pagamento.aprovado (Producer) ................. 3 ms\n10:41:16.502      deliver pagamento.aprovado (Consumer, email) ...... 240 ms\n10:41:16.510        POST envio (provedor de e-mail, cliente HTTP) ... 225 ms\n\n# Fim do publish: 10:02:04.304. Começo do deliver: 10:41:16.502.\n# Espera entre os dois: 39 min 12 s. Processamento da mensagem: 240 ms.",
                    },
                    {
                        type: "text",
                        value: "## Ler os números da fila numa investigação\n\nCada combinação dos números do broker aponta para um lugar diferente:\n\n- **Prontas crescendo e consumidores em zero**: o consumidor morreu ou não subiu (deploy com zero réplicas, crash em laço). Nada é processado, e o histograma de espera fica **mudo**, porque só registra quando uma mensagem é processada. É o pior momento, e a métrica do consumidor não vê; quem vê é o broker.\n- **Prontas crescendo com consumidores no ar**: falta vazão. Compare a taxa de ack com a de entrada e a duração do `deliver`: ou há poucos consumidores, ou cada mensagem ficou mais lenta, e aí a causa costuma ser uma dependência do consumidor.\n- **Prontas perto de zero e não confirmadas altas**: as mensagens já estão com os consumidores, esperando no buffer do prefetch. Um alerta em prontas não vê nada, e o atraso existe. Olhe o total (prontas mais não confirmadas) e o histograma de espera.\n- **A mesma mensagem processada várias vezes**: mensagem venenosa voltando para a fila. Aparece como o mesmo `MessageId` repetido nos logs do consumidor e como reentregas subindo no broker.\n\nO plugin `rabbitmq_prometheus` (porta 15692) publica esses números, com um detalhe que confunde: o `/metrics` padrão soma todas as filas, sem rótulo de fila. Número por fila fica no `/metrics/detailed`, escolhendo as famílias de métricas no parâmetro `family`, com prefixo `rabbitmq_detailed_` (conferido no RabbitMQ 4.3).",
                    },
                    {
                        type: "code",
                        value: "# prometheus.yml: números por fila vêm do endpoint detalhado do rabbitmq_prometheus\nscrape_configs:\n  - job_name: rabbitmq-filas\n    metrics_path: /metrics/detailed\n    params:\n      family: [queue_coarse_metrics, queue_consumer_count, queue_delivery_metrics]\n    static_configs:\n      - targets: [\"rabbitmq:15692\"]\n\n# PromQL: espera estimada na fila de e-mail, em segundos (prontas / acks por segundo)\n# com mensagens prontas e consumo zero o resultado é +Inf, e está certo: a espera não tem fim\nsum by (queue) (rabbitmq_detailed_queue_messages_ready{queue=\"email\"})\n/\nsum by (queue) (rate(rabbitmq_detailed_queue_messages_acked_total{queue=\"email\"}[5m]))\n\n# PromQL: p99 da espera medida pelo consumidor\nhistogram_quantile(0.99, sum by (le) (rate(loja_fila_espera_seconds_bucket{fila=\"email\"}[5m])))\n\n# Alerta que o histograma não substitui: fila sem consumidor\nrabbitmq_detailed_queue_consumers{queue=\"email\"} == 0",
                    },
                    {
                        type: "quote",
                        value: "Numa fila, o que o usuário sente é a espera, não o tamanho: estime com prontas divididas pela taxa de consumo, meça com um histograma no consumidor e leia o intervalo entre o publish e o deliver no trace. E vigie o lado do broker também, porque consumidor parado não registra espera nenhuma.",
                    },
                ],
                questions: [
                    {
                        statement: "O cliente pagou às 10:02 e o e-mail de confirmação chegou às 10:41. O painel RED da API mostra latência de 118 ms e erro na linha de base. Por que o painel não mostrou o problema?",
                        difficulty: "facil",
                        options: [
                            { text: "O envio do e-mail não é instrumentado, então o consumidor não gera métrica nenhuma", isCorrect: false },
                            { text: "A API termina ao publicar a mensagem; a espera na fila fica fora da latência HTTP", isCorrect: true },
                            { text: "O Prometheus coleta a cada 15 s e perde os eventos que duram mais que a janela", isCorrect: false },
                            { text: "O painel usa média, e a média esconde a cauda de 39 minutos de algumas requisições", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destas filas faz a mensagem que acabou de chegar esperar mais para ser processada?",
                        difficulty: "facil",
                        options: [
                            { text: "900 prontas, consumo de 30 por segundo", isCorrect: false },
                            { text: "8.000 prontas, consumo de 400 por segundo", isCorrect: false },
                            { text: "50.000 prontas, consumo de 5.000 por segundo", isCorrect: false },
                            { text: "1.200 prontas, consumo de 4 por segundo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Durante uma promoção que começa com a fila vazia, a fila de nota fiscal recebe 500 mensagens por segundo e os consumidores processam 400. Depois de 30 minutos assim, a entrada cai para 250 por segundo e o consumo continua em 400. Quanto tempo a fila leva para esvaziar?",
                        difficulty: "medio",
                        options: [
                            { text: "20 minutos", isCorrect: true },
                            { text: "7,5 minutos", isCorrect: false },
                            { text: "30 minutos", isCorrect: false },
                            { text: "12 minutos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O alerta de mensagens prontas da fila de e-mail está verde, com a fila perto de zero, mas os e-mails chegam com quase um minuto de atraso. O broker mostra 5 consumidores e 5.000 mensagens não confirmadas. O que está acontecendo?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker está perdendo mensagens, e por isso a fila de prontas parece vazia", isCorrect: false },
                            { text: "As mensagens estão nos buffers dos consumidores, entregues adiantado pelo prefetch", isCorrect: true },
                            { text: "Os consumidores estão parados, e o broker já conta as mensagens como entregues", isCorrect: false },
                            { text: "Os consumidores processaram tudo, e o broker está atrasando o registro dos acks recebidos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O único alerta da fila de e-mail é sobre o p99 do histograma de espera, registrado pelo consumidor no início de cada mensagem. Às 03:00 um deploy deixou o consumidor com zero réplicas, e nada disparou até as 07:00. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "O p99 ignora o 1% mais lento; faltava alertar no valor máximo registrado no histograma", isCorrect: false },
                            { text: "Os baldes do histograma vão só até 30 minutos; faltava um balde para esperas de horas", isCorrect: false },
                            { text: "Sem consumo, nada é registrado; faltava alertar no broker, com consumidores em zero", isCorrect: true },
                            { text: "O histograma zera a cada deploy; faltava trocar o histograma por um contador simples", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Cultura e fechamento",
                blocks: [
                    {
                        type: "text",
                        value: "# Cultura e fechamento\n\nO incidente do cupom, da primeira aula deste módulo, durou 26 minutos. O canário da versão 2.8.0 entrou às 14:05, o alerta disparou às 14:20 e o canário saiu às 14:31. A 20 pedidos por segundo, com um quarto deles no canário e 10% usando cupom, foram cerca de 780 pedidos com cupom recusados com erro 500.\n\nNa reunião da semana seguinte, a primeira pergunta pode ser \"quem subiu a versão sem testar cupom permanente?\" ou \"o que no nosso processo deixou esse defeito chegar à produção, e por que levamos 15 minutos para perceber?\". A primeira encontra um culpado e encerra a conversa. A segunda encontra as falhas do sistema, que continuam lá depois que a pessoa sai da sala. Esta última aula trata do que fica em volta da técnica: o postmortem sem culpa, a observabilidade pensada desde o design e o custo da telemetria tratado como requisito.",
                    },
                    {
                        type: "text",
                        value: "## Postmortem sem culpa\n\nO postmortem sem culpa (blameless) parte de uma premissa: quem estava de plantão ou fez o deploy agiu de forma razoável com a informação que tinha. Se uma ação razoável derrubou a produção, o defeito está no sistema que permitiu isso, e é ele que precisa mudar. A premissa não é bondade, é método: só assim as pessoas contam o que fizeram e o que viram sem esconder nada. Time que procura culpado aprende a contar a versão que protege, e o próximo incidente repete o anterior. O livro de SRE do Google (Site Reliability Engineering, 2016) tem um capítulo inteiro sobre essa cultura de postmortem.\n\nUm bom postmortem tem:\n\n- **Resumo e impacto em números**, tirados da telemetria: duração, pedidos afetados, quanto do error budget foi gasto.\n- **Linha do tempo** com horários vindos dos sinais e do canal do incidente, não da memória de ninguém.\n- **Fatores que contribuíram**, no plural: incidente quase nunca tem uma causa só.\n- **O que ajudou e o que atrapalhou** na detecção e na resposta.\n- **Ações com dono e prazo**, que mudam o sistema.\n\nDois números saem direto da linha do tempo: o **tempo até detectar** (14:05 a 14:20, 15 minutos) e o **tempo até mitigar** depois do alerta (14:20 a 14:31, 11 minutos). São esses números que as ações precisam encurtar.",
                    },
                    {
                        type: "table",
                        value: "[[\"Hora\", \"O que aconteceu\", \"De onde vem o dado\"], [\"14:05\", \"Canário da 2.8.0 entra em uma das quatro instâncias\", \"Anotação de deploy no painel\"], [\"14:05\", \"Erro do POST /pedidos sobe de 0,1% para 2,6%\", \"Métrica RED do checkout\"], [\"14:20\", \"Alerta do SLO de disponibilidade dispara\", \"Histórico de alertas\"], [\"14:24\", \"Recorte por instância isola o canário com 10,1% de erro\", \"Consulta PromQL colada no canal do incidente\"], [\"14:27\", \"Trace e logs mostram a exceção em AplicarCupom\", \"Tempo e Loki, pelo trace_id\"], [\"14:31\", \"Canário retirado; o erro volta a 0,1% nos minutos seguintes\", \"Registro do deploy e métrica RED\"]]",
                    },
                    {
                        type: "text",
                        value: "## Fatores e ações\n\nNo caso do cupom, a pergunta \"por que levamos 15 minutos para perceber?\" rende mais que \"quem errou?\". Três fatores contribuíram:\n\n- O código usou `.Value` num `DateTimeOffset?`, e o compilador avisou (CS8629). O build aceita aviso, e ninguém leu.\n- Nenhum teste cobria cupom sem data de validade, que existe desde sempre no cadastro.\n- **O canário era observado pelo total.** Com um quarto do tráfego, os 10,1% de erro do canário viraram 2,6% no painel do serviço, e o alerta do SLO, feito para o serviço inteiro, levou 15 minutos para juntar orçamento queimado suficiente.\n\nCompare as ações possíveis. \"Ter mais atenção nos deploys\" não muda nada no sistema e não tem como ser verificada. \"Erro humano\" como causa raiz encerra a investigação no ponto em que ela ficaria interessante. Ações que mudam o sistema:\n\n- Tratar aviso de nulidade como erro no build do checkout, com `<WarningsAsErrors>Nullable</WarningsAsErrors>` no projeto (dono: time do checkout).\n- Teste da regra de cupom com validade nula (dono: time do checkout).\n- Comparação automática do canário com a versão estável, bloqueando a promoção quando o erro do canário passar do dobro do estável por 5 minutos (dono: time de plataforma). É uma ação de observabilidade: o mesmo recorte do passo 3 da investigação, agora feito pela máquina antes de qualquer alerta.",
                    },
                    {
                        type: "text",
                        value: "## Observabilidade desde o design\n\nQuase todo time instrumenta depois do primeiro incidente, que é justamente quando a instrumentação fazia falta. Observabilidade desde o design é tratar a pergunta \"como vamos saber que isso quebrou, e como vamos achar o porquê?\" como parte da revisão de design, junto com desempenho e segurança. Funcionalidade sem um jeito de saber se funciona não está pronta.\n\nAs perguntas são as mesmas para qualquer funcionalidade, e as respostas usam tudo o que este estudo cobriu. A tabela aplica as perguntas ao e-mail de confirmação da aula anterior, antes de a primeira linha de código ser escrita.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pergunta de design\", \"Resposta para o e-mail de confirmação\"], [\"Que indicador mostra que funciona para o cliente?\", \"Tempo entre o pagamento aprovado e o e-mail enviado\"], [\"Qual é a meta?\", \"99% dos e-mails em até 5 minutos, em janela de 30 dias\"], [\"Como vamos saber que quebrou?\", \"Alerta de burn rate sobre esse indicador e alerta de fila sem consumidor\"], [\"Como vamos achar o porquê?\", \"Trace do pagamento atravessando a fila, com o pedido como atributo do span, e logs com trace_id\"], [\"Onde o contexto se perde?\", \"Na fila: conferir que o deliver nasce como filho do publish\"], [\"Quanto vai custar?\", \"Um histograma sem rótulo de cliente, traces com amostragem, logs em Information\"]]",
                    },
                    {
                        type: "text",
                        value: "## Custo como requisito\n\nTelemetria tem conta: volume ingerido, armazenamento pelo tempo de retenção, séries ativas, consultas. Ela cresce com o tráfego e com cada rótulo, atributo e linha de log novos, e sem orçamento cresce até alguém cortar no susto, normalmente o que mais faria falta no próximo incidente.\n\nFaça a conta antes. Um serviço com 2.000 requisições por segundo que grava 5 linhas de log de 500 bytes por requisição produz 5 MB por segundo: 432 GB por dia, perto de 13 TB por mês. A um preço hipotético de 0,50 dólar por GB ingerido, são 6.480 dólares por mês só de logs desse serviço. Deixar uma linha por requisição em Information e o resto em Debug, desligado em produção, leva a conta a um quinto.\n\nTratar custo como requisito é ter um orçamento de telemetria por serviço, como se tem orçamento de latência, e revisá-lo no design (\"quanto vai custar?\") e sempre que a conta mudar de patamar. O erro clássico é cortar custo desligando traces ou logs do que mais falha. O corte certo guarda tudo que é erro e lentidão e amostra o que deu certo, que a métrica já conta inteiro.",
                    },
                    {
                        type: "table",
                        value: "[[\"Alavanca\", \"Exemplo\", \"O que se perde\"], [\"Nível de log\", \"Debug desligado em produção: 5 linhas por requisição viram 1\", \"Detalhe que pode ser religado por configuração durante um incidente\"], [\"Amostragem de traces\", \"Tail sampling: todos os erros e lentos, 5% do resto\", \"Traces individuais de sucesso; a métrica continua contando todos\"], [\"Cardinalidade\", \"Nada de identificador de cliente em rótulo de métrica\", \"O recorte por cliente na métrica, que fica nos traces e logs\"], [\"Retenção\", \"Logs de 30 para 7 dias no armazenamento rápido\", \"Consulta rápida de incidentes antigos\"], [\"Filtro no Collector\", \"Descartar métricas que nenhum painel ou alerta usa\", \"Nada, se a lista estiver certa\"]]",
                    },
                    {
                        type: "text",
                        value: "## O que fica deste estudo\n\nEste estudo começou separando monitoramento, o painel que responde o que alguém previu, de observabilidade, a capacidade de responder uma pergunta nova sobre a produção sem subir código novo. Depois vieram as peças: logs estruturados e com contexto, métricas com o instrumento certo para cada pergunta, traces que atravessam serviços e filas, o Collector como pipeline neutro, painéis, SLOs e alertas que acordam alguém só quando há o que fazer. Este módulo usou tudo junto: um roteiro do alerta à causa, a leitura honesta da latência, a cascata de uma dependência lenta e a espera que só aparece quando se olha a fila.\n\nFerramentas vão mudar, e algumas mudaram enquanto este material era escrito: o Grafana Agent chegou ao fim da vida em novembro de 2025, o Promtail em março de 2026, e o Grafana Alloy ocupou o lugar dos dois. O que não muda é o critério. Instrumente com o padrão aberto, para trocar o destino sem mexer no código; meça o que o usuário sente; corte cardinalidade e volume com intenção; e trate cada incidente como dado sobre o sistema, nunca como julgamento sobre pessoas.",
                    },
                    {
                        type: "quote",
                        value: "Observabilidade não é a pilha de ferramentas: é conseguir responder em produção a pergunta que ninguém previu. Instrumente desde o design, investigue com os três sinais juntos, trate custo e cultura como parte da engenharia, e cada incidente vai deixar o sistema mais fácil de entender do que estava antes.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o objetivo central de um postmortem sem culpa?",
                        difficulty: "facil",
                        options: [
                            { text: "Decidir se o rollback foi a ação certa e quem deveria ter agido mais cedo", isCorrect: false },
                            { text: "Registrar o incidente para auditoria, evitando discutir causas com o time todo", isCorrect: false },
                            { text: "Identificar quem causou o incidente, para direcionar o treinamento certo a essa pessoa", isCorrect: false },
                            { text: "Entender como o sistema permitiu a falha, com as pessoas contando tudo sem medo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual destas ações de postmortem tem mais chance de evitar a repetição do incidente do cupom?",
                        difficulty: "facil",
                        options: [
                            { text: "Registrar como causa raiz o erro humano de quem escreveu a regra de validade", isCorrect: false },
                            { text: "Suspender os deploys em canário até o fim do trimestre, por precaução", isCorrect: false },
                            { text: "Bloquear a promoção do canário quando o erro dele passar do dobro do estável", isCorrect: true },
                            { text: "Pedir mais atenção ao time nos próximos deploys de versões com regras novas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço atende 1.000 requisições por segundo e grava 4 linhas de log por requisição, com 400 bytes cada. Quanto volume de log ele gera por dia, aproximadamente?",
                        difficulty: "medio",
                        options: [
                            { text: "Cerca de 5,8 GB por dia", isCorrect: false },
                            { text: "Cerca de 4,1 TB por dia", isCorrect: false },
                            { text: "Cerca de 138 GB por dia", isCorrect: true },
                            { text: "Cerca de 1,6 GB por dia", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No design do e-mail de confirmação, qual indicador representa melhor o que o cliente sente?",
                        difficulty: "medio",
                        options: [
                            { text: "O número de mensagens prontas na fila de e-mail do broker", isCorrect: false },
                            { text: "O uso de CPU das réplicas do consumidor de e-mail", isCorrect: false },
                            { text: "O tempo entre o pagamento aprovado e o envio do e-mail", isCorrect: true },
                            { text: "A latência do `POST /pagamentos` medida na própria API", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Hoje o serviço guarda 100% dos traces, 1.200 GB por mês. A proposta é tail sampling guardando todos os traces com erro (1% do total), todos os lentos (2%, sem sobreposição com os de erro) e 5% dos demais. Supondo traces de tamanho parecido, quanto volume sobra por mês?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cerca de 94 GB por mês", isCorrect: true },
                            { text: "Cerca de 60 GB por mês", isCorrect: false },
                            { text: "Cerca de 36 GB por mês", isCorrect: false },
                            { text: "Cerca de 1.106 GB por mês", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    mesclarSolucoes(MODULOS, "observabilidade");
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO, workloadHours: HORAS })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        const n = await backfillExplicacoes(trilha.id, MODULOS);
        console.log("Trilha " + NOME + " já existe; " + n + " explicações atualizadas.");
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
                        explanation: q.explanation ?? null,
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
    console.log(
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
