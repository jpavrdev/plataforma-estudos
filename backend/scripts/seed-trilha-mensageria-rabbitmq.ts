// Seed da trilha Mensageria com RabbitMQ. Conteúdo autoral, quiz-only, com exemplos de código em
// C#. As resoluções comentadas ficam em scripts/solucoes/mensageria-rabbitmq.json e entram
// por mesclarSolucoes. Idempotente: se a trilha já tiver aulas, só atualiza as
// explicações.
//
// As alternativas já saem embaralhadas do gerador, com semente no enunciado. Sem
// isso a correta ficaria em position 1 em toda questão e o gabarito do e-book, que
// não passa pelo backend, sairia todo em A.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-mensageria-rabbitmq.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "Mensageria com RabbitMQ";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const HORAS = 20;
const DESCRICAO =
    "Mensageria de verdade com RabbitMQ 4 e C#: por que desacoplar, o modelo de exchanges, filas e bindings, publicar e consumir com o cliente .NET assíncrono, durabilidade, publisher confirms e quorum queues, dead letter, retry com atraso e mensagem venenosa, idempotência e ordem, outbox, sagas e versionamento de contratos, e a operação em produção com monitoramento, cluster e segurança.";

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
        titulo: "Módulo 1 - Por que mensageria",
        aulas: [
            {
                titulo: "O problema do acoplamento síncrono",
                blocks: [
                    {
                        type: "text",
                        value: "# O problema do acoplamento síncrono\n\nBlack Friday, oito da noite. A API de pedidos de uma loja virtual recebe o clique em \"Finalizar compra\" e, antes de responder, chama quatro serviços por HTTP: reserva o estoque, cobra o cartão, emite a nota fiscal e manda o e-mail de confirmação. Nos testes, tudo respondia em um segundo. Às 20h05, o provedor de e-mail passa a demorar 30 segundos por envio. Às 20h10, ninguém mais consegue comprar. O serviço menos importante da cadeia derrubou o mais importante.\n\nÉ esse problema que justifica a mensageria, e vale entendê-lo com precisão antes de falar de fila.\n\n## A cadeia de chamadas\n\nO desenho mais comum é um endpoint que só responde depois que todos os serviços responderem, um depois do outro:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da API de pedidos: tudo síncrono, em sequência\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddHttpClient(\"estoque\", c => c.BaseAddress = new Uri(\"http://estoque\"));\nbuilder.Services.AddHttpClient(\"pagamento\", c => c.BaseAddress = new Uri(\"http://pagamento\"));\nbuilder.Services.AddHttpClient(\"fiscal\", c => c.BaseAddress = new Uri(\"http://fiscal\"));\nbuilder.Services.AddHttpClient(\"email\", c => c.BaseAddress = new Uri(\"http://email\"));\nvar app = builder.Build();\n\napp.MapPost(\"/pedidos\", async (Pedido pedido, IHttpClientFactory http, CancellationToken ct) =>\n{\n    // cada await espera o anterior: o cliente espera a soma de todos\n    (await http.CreateClient(\"estoque\").PostAsJsonAsync(\"/reservas\", pedido, ct)).EnsureSuccessStatusCode();\n    (await http.CreateClient(\"pagamento\").PostAsJsonAsync(\"/cobrancas\", pedido, ct)).EnsureSuccessStatusCode();\n    (await http.CreateClient(\"fiscal\").PostAsJsonAsync(\"/notas\", pedido, ct)).EnsureSuccessStatusCode();\n    (await http.CreateClient(\"email\").PostAsJsonAsync(\"/confirmacoes\", pedido, ct)).EnsureSuccessStatusCode();\n\n    return TypedResults.Created($\"/pedidos/{pedido.Id}\", pedido);\n});\n\napp.Run();\n\npublic record Pedido(Guid Id, Guid ClienteId, decimal Total);",
                    },
                    {
                        type: "text",
                        value: "## A latência soma\n\nSe o estoque responde em 50 ms, o pagamento em 300 ms, a nota em 400 ms e o e-mail em 250 ms, o cliente espera pelo menos 1.000 ms, a soma das quatro, mais a rede entre elas. E a soma piora justamente quando importa. A latência que o usuário sente não é a média, é a dos piores casos (o p99, o tempo que só 1% das requisições ultrapassa), e o pior caso de uma cadeia junta o pior momento de cada elo.\n\n## A disponibilidade multiplica\n\nUm serviço com 99,9% de disponibilidade parece ótimo sozinho. Mas o pedido só fecha se os quatro estiverem respondendo ao mesmo tempo, e falhas independentes se multiplicam: 0,999 elevado a 4 dá cerca de 99,6%. Num mês de 30 dias, a indisponibilidade esperada do checkout passa de uns 43 minutos para quase 3 horas, sem que nenhum serviço tenha piorado. É o **acoplamento temporal**: quem chama só termina o trabalho se o chamado estiver no ar naquele mesmo instante.\n\n## A falha em cascata\n\nQuando o e-mail fica lento, os pedidos não falham logo: ficam esperando. O `HttpClient` tem timeout padrão de 100 segundos, então cada pedido parado segura memória, uma conexão aberta e a paciência do usuário. Pela lei de Little (itens em andamento = taxa de chegada × tempo de permanência), 100 pedidos por segundo esperando 30 segundos são 3.000 requisições penduradas ao mesmo tempo. O balanceador desiste antes, o aplicativo tenta de novo, e cada nova tentativa é mais carga em cima de quem já estava sufocando. A lentidão do e-mail virou indisponibilidade do checkout.",
                    },
                    {
                        type: "table",
                        value: "[[\"Sintoma\",\"O que acontece\",\"Por que a chamada síncrona agrava\"],[\"Latência que soma\",\"O cliente espera a soma dos tempos de toda a cadeia\",\"Cada `await` só começa quando o anterior termina\"],[\"Disponibilidade que multiplica\",\"Quatro serviços de 99,9% viram um teto de cerca de 99,6%\",\"O pedido exige todos no ar no mesmo instante\"],[\"Falha em cascata\",\"Um serviço lento prende as requisições de quem o chama\",\"Quem chama segura recursos enquanto espera, e ainda tenta de novo\"],[\"Pico que derruba o mais lento\",\"O serviço de menor capacidade recebe o ritmo do mais rápido\",\"Não existe lugar para o excesso esperar\"]]",
                    },
                    {
                        type: "text",
                        value: "## O pico que derruba o mais lento\n\nNa chamada síncrona, quem chama dita o ritmo. Se o checkout recebe 200 pedidos por segundo e o serviço fiscal emite 50 notas por segundo, o pico chega inteiro ao fiscal, que satura, fica lento e devolve a lentidão para cima pela cadeia. Ou o fiscal dá conta, ou alguém recebe erro.\n\nCom uma fila entre os dois, o checkout registra \"emita a nota deste pedido\" e segue em frente. O fiscal consome no ritmo dele, 50 por segundo, e a fila absorve a diferença durante o pico: 150 por segundo a mais, por 10 minutos, são 90 mil notas esperando. Quando o pico passa, a fila esvazia. O padrão tem nome, **nivelamento de carga** (*queue-based load leveling*): a fila transforma um pico que derrubaria o serviço num atraso que ele consegue pagar depois.\n\n## Paralelizar não desacopla\n\nMuita gente, ao ver a latência somar, troca os `await` em sequência por `Task.WhenAll` no que não depende entre si. A latência melhora, mas o acoplamento continua inteiro:",
                    },
                    {
                        type: "code",
                        value: "// Paralelizar o que não depende entre si: a latência cai, o acoplamento não\nvar nota = http.CreateClient(\"fiscal\").PostAsJsonAsync(\"/notas\", pedido, ct);\nvar email = http.CreateClient(\"email\").PostAsJsonAsync(\"/confirmacoes\", pedido, ct);\nforeach (var resposta in await Task.WhenAll(nota, email))\n    resposta.EnsureSuccessStatusCode(); // se qualquer um falhar, o pedido ainda falha",
                    },
                    {
                        type: "text",
                        value: "Com estoque e pagamento em sequência e nota e e-mail em paralelo, os 1.000 ms viram 750 ms (50 + 300 + o maior entre 400 e 250). Mas o pedido continua precisando dos quatro serviços no ar ao mesmo tempo, e o pico do checkout continua chegando inteiro ao fiscal. Paralelizar ataca a latência; não ataca a disponibilidade nem o ritmo.\n\n## Os remédios do mundo síncrono\n\nDentro do HTTP, o arsenal é conhecido: **timeout** curto (desistir cedo em vez de esperar 100 segundos), **retry** com espera crescente (tentar de novo uma falha passageira) e **circuit breaker** (parar de chamar, por um tempo, quem está falhando, para não piorar a situação dele). No .NET, o pacote `Microsoft.Extensions.Http.Resilience` monta essa pilha num `HttpClient`:",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: timeout, retry e circuit breaker na chamada ao e-mail\n// dotnet add package Microsoft.Extensions.Http.Resilience\nbuilder.Services.AddHttpClient(\"email\", c => c.BaseAddress = new Uri(\"http://email\"))\n    .AddStandardResilienceHandler(o =>\n    {\n        o.AttemptTimeout.Timeout = TimeSpan.FromSeconds(2);      // cada tentativa\n        o.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(6); // todas as tentativas somadas\n    });",
                    },
                    {
                        type: "text",
                        value: "Isso é obrigatório em qualquer chamada HTTP de produção e corta a cascata: o checkout desiste do e-mail em segundos em vez de pendurar. Mas repare no que sobra. Se o e-mail estiver fora, o pedido falha rápido, o que é melhor do que falhar devagar, e continua falhando. Resiliência no HTTP reduz o estrago; não tira a dependência.\n\n## O que a fila muda\n\nA pergunta que organiza o desenho é: o que o cliente precisa saber **agora** para a resposta fazer sentido? Que o estoque foi reservado e o pagamento, autorizado. A nota e o e-mail podem acontecer segundos depois sem ninguém perceber, então viram mensagens entregues a um **broker** (o servidor de mensageria, como o RabbitMQ, que recebe, guarda e entrega as mensagens). O checkout responde em 350 ms, e fiscal e e-mail trabalham no tempo deles. Se o e-mail cair por uma hora, as mensagens esperam na fila e saem quando ele voltar. Nenhuma venda se perdeu.\n\nNem tudo vira mensagem. Consultar um preço, validar um cupom ou qualquer chamada cuja resposta muda o que a tela mostra continua síncrona, porque quem chama precisa da resposta para seguir. A fila serve ao trabalho que pode terminar depois.",
                    },
                    {
                        type: "quote",
                        value: "Chamada síncrona soma latências, multiplica indisponibilidades e entrega o pico de quem chama a quem é chamado. A fila não torna o trabalho mais rápido: tira do caminho do usuário o que pode terminar depois e deixa cada serviço trabalhar no próprio ritmo.",
                    },
                ],
                questions: [
                    {
                        statement: "Um endpoint chama em sequência, com um `await` depois do outro, quatro serviços que respondem em 50 ms, 300 ms, 400 ms e 250 ms. Quanto tempo, no mínimo, o cliente espera pela resposta?",
                        difficulty: "facil",
                        options: [
                            { text: "Cerca de 400 ms, o tempo da chamada mais lenta", isCorrect: false },
                            { text: "Cerca de 50 ms, o tempo da chamada mais rápida", isCorrect: false },
                            { text: "Cerca de 250 ms, a média das quatro chamadas", isCorrect: false },
                            { text: "Cerca de 1.000 ms, a soma das quatro chamadas", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que é **acoplamento temporal** entre dois serviços?",
                        difficulty: "facil",
                        options: [
                            { text: "Os dois serviços leem e gravam as mesmas tabelas dentro do mesmo banco", isCorrect: false },
                            { text: "Quem chama precisa conhecer o endereço de rede de cada serviço que usa", isCorrect: false },
                            { text: "Quem chama só termina o trabalho se o chamado estiver no ar na mesma hora", isCorrect: true },
                            { text: "Os dois serviços precisam ser escritos na mesma linguagem e na mesma versão", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O checkout só fecha um pedido se quatro serviços responderem, e cada um tem 99,9% de disponibilidade, com falhas independentes. Qual é, aproximadamente, o teto de disponibilidade do checkout imposto por essa dependência?",
                        difficulty: "medio",
                        options: [
                            { text: "Cerca de 96%, porque cada serviço tira um ponto percentual", isCorrect: false },
                            { text: "Cerca de 99,9%, porque vale a do serviço menos disponível", isCorrect: false },
                            { text: "Cerca de 99,99%, porque um serviço cobre a falha do outro", isCorrect: false },
                            { text: "Cerca de 99,6%, porque as disponibilidades se multiplicam", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Depois de reservar o estoque e cobrar, uma equipe passou a chamar o serviço fiscal e o de e-mail ao mesmo tempo, com `Task.WhenAll`, e a conferir as duas respostas. O que essa mudança resolve?",
                        difficulty: "medio",
                        options: [
                            { text: "Reduz a latência e faz o pedido sobreviver à queda de um dos dois", isCorrect: false },
                            { text: "Nada, porque os `await` em sequência já rodavam as chamadas em paralelo", isCorrect: false },
                            { text: "Mantém a latência, mas protege o serviço fiscal dos picos do checkout", isCorrect: false },
                            { text: "Reduz a latência, mas o pedido ainda falha se um dos dois estiver fora", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma fila fica na frente do serviço fiscal, que emite 50 notas por segundo. Num pico de 10 minutos chegam 200 pedidos por segundo, e depois do pico o movimento cai para 20 pedidos por segundo. Quanto tempo depois do fim do pico a fila zera?",
                        difficulty: "dificil",
                        options: [
                            { text: "Nunca, porque o fiscal é mais lento do que o pico e não alcança a fila", isCorrect: false },
                            { text: "Cerca de 50 minutos, com 90 mil notas e a fila caindo 30 por segundo", isCorrect: true },
                            { text: "Cerca de 10 minutos, o mesmo tempo que o pico levou para encher a fila", isCorrect: false },
                            { text: "Cerca de 30 minutos, com 90 mil notas e a fila caindo 50 por segundo", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Comando, evento e fila",
                blocks: [
                    {
                        type: "text",
                        value: "# Comando, evento e fila\n\nO pedido foi confirmado, e agora quatro coisas precisam acontecer em outros serviços: emitir a nota, mandar o e-mail, somar os pontos de fidelidade e atualizar o painel de vendas. Há duas maneiras de contar isso a eles, e a escolha define quem depende de quem pelo resto da vida do sistema. Dá para **mandar** cada serviço fazer a sua parte, ou **anunciar** que o pedido foi confirmado e deixar cada interessado decidir o que fazer.\n\nAntes do tipo de mensagem, vale ver o caminho que ela percorre. São dois.\n\n## Ponto a ponto: uma fila, um processamento\n\nNo modelo ponto a ponto, a mensagem entra numa fila e é processada por **um** consumidor. Se três réplicas do serviço fiscal leem da mesma fila, elas competem pelas mensagens (o padrão se chama *competing consumers*): cada nota é emitida por uma réplica só, e para dar conta de mais trabalho basta subir mais réplicas. É o modelo da fila de tarefas.",
                    },
                    {
                        type: "text",
                        value: "## Publicar/assinar: cada interessado com a sua cópia\n\nNo modelo publicar/assinar (*publish/subscribe*), quem publica não entrega a um destinatário: anuncia para quem quiser ouvir. Cada assinante recebe a sua própria cópia, e um assinante a mais não muda nada para os outros. No RabbitMQ isso se monta com uma fila por assinante (a do fiscal, a do e-mail, a dos pontos), cada uma recebendo uma cópia de cada anúncio. Quem faz a cópia é a exchange, o ponto do broker que recebe as publicações e decide para quais filas mandá-las, assunto que aparece mais adiante na trilha. Por ora, guarde a consequência: se o serviço de e-mail ficar fora do ar por uma hora, só a fila dele cresce, e os outros seguem consumindo as suas.\n\nOs dois modelos se combinam. Entre serviços, cada assinante tem a sua fila; dentro de um serviço, as réplicas dividem essa fila. O erro clássico é inverter isso e dar uma fila para cada **réplica** do mesmo serviço. Aí cada réplica vira um assinante, recebe a sua cópia, e o pedido é processado duas, três vezes. Com e-mail é constrangedor; com cobrança é prejuízo.",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\",\"Ponto a ponto\",\"Publicar/assinar\"],[\"Quem processa cada mensagem\",\"Um consumidor, entre os que competem pela fila\",\"Cada assinante, com a sua própria cópia\"],[\"Quem envia conhece quem recebe?\",\"Conhece o destino: quem faz o trabalho\",\"Não: publica sem saber quem assina\"],[\"Como escala\",\"Mais consumidores na mesma fila\",\"Assinante novo não pesa para quem publica\"],[\"No RabbitMQ\",\"Uma fila com vários consumidores\",\"Uma fila por assinante\"],[\"Combina com\",\"Comando\",\"Evento\"]]",
                    },
                    {
                        type: "text",
                        value: "## Comando: \"faça\"\n\nUm comando pede uma ação a um destinatário específico: `EmitirNotaFiscal`, `ReservarEstoque`, `CancelarPedido`. O nome vem no imperativo, existe um único serviço responsável por executá-lo, e esse serviço **pode recusar**: documento inválido, estoque insuficiente, pedido já cancelado. Quem envia o comando depende de que alguém o execute, só não precisa esperar a execução acontecer.\n\n## Evento: \"aconteceu\"\n\nUm evento registra um fato do passado: `PedidoConfirmado`, `PagamentoRecusado`, `EstoqueEsgotado`. O nome vem no particípio, porque o fato já ocorreu e não há como recusá-lo; o assinante só decide o que fazer com ele. Quem publica não sabe quantos assinantes existem, e pode não haver nenhum. É isso que permite ligar um serviço novo, como um antifraude ou uma integração com o ERP, sem tocar em quem publica.\n\nNo código, a diferença começa no nome e no lugar onde o contrato mora:",
                    },
                    {
                        type: "code",
                        value: "// Contratos.cs: o nome e o dono de cada mensagem\nnamespace Loja.Pedidos.Contratos\n{\n    // Evento: um fato que já aconteceu. Quem define o contrato é quem publica (Pedidos).\n    public sealed record PedidoConfirmado(\n        Guid PedidoId,\n        Guid ClienteId,\n        decimal Total,\n        DateTimeOffset ConfirmadoEm);\n}\n\nnamespace Loja.Fiscal.Contratos\n{\n    // Comando: um pedido de ação a um destinatário. Quem define o contrato é quem executa (Fiscal).\n    public sealed record EmitirNotaFiscal(\n        Guid PedidoId,\n        string DocumentoDoCliente,\n        decimal Valor);\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\",\"Comando\",\"Evento\"],[\"Significado\",\"Faça isto\",\"Isto aconteceu\"],[\"Nome\",\"Imperativo: `EmitirNotaFiscal`\",\"Particípio: `PedidoConfirmado`\"],[\"Destinatários\",\"Exatamente um responsável\",\"Zero ou mais assinantes\"],[\"Pode ser recusado?\",\"Sim: quem executa valida e pode negar\",\"Não: o fato já ocorreu\"],[\"Dono do contrato\",\"Quem executa\",\"Quem publica\"],[\"Modelo de entrega\",\"Ponto a ponto\",\"Publicar/assinar\"]]",
                    },
                    {
                        type: "text",
                        value: "## Quem é dono do contrato\n\nO contrato é o formato da mensagem: o nome, os campos e o significado de cada campo. A regra prática segue a direção da dependência. No **comando**, o dono é quem executa, como numa API: o serviço fiscal define o formato de `EmitirNotaFiscal` que aceita, e quem quiser uma nota se adapta. No **evento**, o dono é quem publica: Pedidos descreve `PedidoConfirmado` na língua de Pedidos, e cada assinante traduz para a sua.\n\nO erro comum é o evento sob medida. A equipe de e-mail pede para Pedidos incluir `AssuntoDoEmail` no `PedidoConfirmado`; depois a de pontos pede `PontosACreditar`. Cada campo desses faz Pedidos conhecer a necessidade de um assinante, e o desacoplamento que justificou o evento some: qualquer mudança no e-mail vira mudança em Pedidos. O assinante monta o que precisa a partir do fato.\n\nO oposto também machuca. Um evento magro demais, só com o `PedidoId`, obriga cada assinante a chamar Pedidos por HTTP para descobrir o resto, e o acoplamento temporal volta pela porta dos fundos. O meio-termo saudável é o evento carregar os dados do fato que os assinantes costumam precisar, todos com significado em Pedidos: cliente, itens, total, momento da confirmação.",
                    },
                    {
                        type: "table",
                        value: "[[\"Mensagem\",\"Tipo\",\"Por quê\"],[\"`ReservarEstoque`\",\"Comando\",\"Pede uma ação a um responsável, que pode recusar por falta de produto\"],[\"`EstoqueReservado`\",\"Evento\",\"Relata um fato; quem tiver interesse reage\"],[\"`CobrarPedido`\",\"Comando\",\"Um único serviço de pagamento executa; dois executando seria cobrança em dobro\"],[\"`PagamentoRecusado`\",\"Evento\",\"Fato consumado; pedidos, e-mail e antifraude reagem cada um a seu modo\"],[\"`EnviarEmailDeBoasVindas`\",\"Comando\",\"Tem destinatário certo (o serviço de e-mail) e pede uma ação\"],[\"`ClienteCadastrado`\",\"Evento\",\"O e-mail de boas-vindas é só uma das reações possíveis\"]]",
                    },
                    {
                        type: "quote",
                        value: "Comando pede uma ação a um dono que pode recusar e viaja ponto a ponto; evento anuncia um fato que ninguém recusa e chega a cada assinante na sua própria fila. Do comando, o dono do contrato é quem executa; do evento, é quem publica.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual destes nomes de mensagem descreve um **evento**?",
                        difficulty: "facil",
                        options: [
                            { text: "`ReservarEstoque`", isCorrect: false },
                            { text: "`ConfirmarPedido`", isCorrect: false },
                            { text: "`PedidoConfirmado`", isCorrect: true },
                            { text: "`EmitirNotaFiscal`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Três réplicas do serviço fiscal consomem da **mesma** fila, no modelo ponto a ponto. Quantas réplicas processam cada mensagem?",
                        difficulty: "facil",
                        options: [
                            { text: "As três, porque cada réplica recebe a sua própria cópia", isCorrect: false },
                            { text: "Nenhuma, até que as três confirmem juntas o recebimento", isCorrect: false },
                            { text: "Duas delas, uma que processa e outra que fica de reserva", isCorrect: false },
                            { text: "Uma delas, porque as réplicas competem pelas mensagens", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Quem deve ser o dono do contrato do evento `PagamentoAprovado`?",
                        difficulty: "medio",
                        options: [
                            { text: "A equipe do maior assinante, que mais depende do evento", isCorrect: false },
                            { text: "Cada assinante, que define a versão do evento que aceita", isCorrect: false },
                            { text: "O broker, que valida o formato antes de rotear a mensagem", isCorrect: false },
                            { text: "O serviço de pagamento, que publica o fato na língua dele", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O serviço de pontos assina o evento `PedidoConfirmado`. Ao subir uma segunda réplica, cada réplica passou a declarar a sua própria fila ligada ao evento, e os clientes começaram a receber pontos em dobro. Qual é a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "O publicador deve passar a mandar o evento só para uma das duas réplicas", isCorrect: false },
                            { text: "Cada réplica deve ficar só com os pedidos pares ou só com os ímpares", isCorrect: false },
                            { text: "O evento deve virar um comando `CreditarPontos` enviado às réplicas", isCorrect: false },
                            { text: "As réplicas devem consumir da mesma fila, competindo pelas mensagens", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A equipe de Pedidos publica `PedidoConfirmado` só com o `PedidoId`, e cada assinante chama a API de Pedidos por HTTP para buscar cliente, itens e total. Que acoplamento esse desenho traz de volta?",
                        difficulty: "dificil",
                        options: [
                            { text: "De entrega: os assinantes passam a competir pelas mensagens da mesma fila", isCorrect: false },
                            { text: "De contrato: Pedidos passa a moldar o evento ao que cada assinante pede", isCorrect: false },
                            { text: "De plataforma: os assinantes precisam usar o mesmo cliente HTTP de Pedidos", isCorrect: false },
                            { text: "Temporal: os assinantes só trabalham se a API de Pedidos estiver no ar", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Garantias de entrega",
                blocks: [
                    {
                        type: "text",
                        value: "# Garantias de entrega\n\nToda mensagem atravessa três trechos: do produtor ao broker, do broker ao consumidor e do consumidor ao efeito (a linha no banco, a nota emitida, o cartão cobrado). Em qualquer trecho a rede pode cair, o processo pode morrer, a confirmação pode se perder no caminho. A pergunta das garantias de entrega é o que acontece com a mensagem quando isso ocorre, e a resposta honesta é que você escolhe entre poder **perder** e poder **duplicar**. Evitar as duas coisas ao mesmo tempo nenhum sistema distribuído consegue de graça.\n\nO que decide o lado é a confirmação. O consumidor avisa o broker que terminou uma mensagem (o *ack*, de *acknowledgement*), e só então o broker a apaga. O produtor, se quiser, espera o broker avisar que guardou a mensagem (o *publisher confirm*). Como cada um funciona no RabbitMQ aparece mais adiante na trilha; aqui importa a ordem das coisas.\n\n## No máximo uma vez\n\nO consumidor confirma assim que recebe e só depois processa. Se ele morrer no meio do processamento, a mensagem já saiu do broker e está perdida. Duplicata não existe, porque nada é reentregue. Do lado do produtor, é publicar sem esperar confirmação: se a mensagem se perder no caminho, ninguém fica sabendo.\n\nServe quando perder um pouco não dói: amostras de telemetria, a posição de um entregador que será atualizada de novo em cinco segundos, um aviso para limpar um cache que expira sozinho.",
                    },
                    {
                        type: "text",
                        value: "## Pelo menos uma vez\n\nO consumidor processa e só então confirma. Se ele morrer antes de confirmar, o broker entrega a mensagem de novo, para ele ou para outro consumidor. Nada se perde, mas a mesma mensagem pode ser processada mais de uma vez. As duplicatas nascem em dois lugares:\n\n- **No produtor.** Ele publica, o broker guarda, e a confirmação se perde porque a conexão caiu naquele instante. Sem saber se deu certo, o produtor publica de novo, e agora há duas cópias.\n- **No consumidor.** Ele cobra o cartão, grava no banco e morre antes de mandar o ack. O broker não tem como saber que o trabalho foi feito e entrega de novo. Sem cuidado, o cartão é cobrado duas vezes.\n\nPara mensagem de negócio (pedido, pagamento, nota), pelo menos uma vez é o padrão: perder um pedido é inaceitável, e a duplicata tem solução.",
                    },
                    {
                        type: "table",
                        value: "[[\"Garantia\",\"Ordem no consumidor\",\"Se cair no meio\",\"Resultado\"],[\"No máximo uma vez\",\"Confirma, depois processa\",\"A mensagem já saiu do broker\",\"Pode perder, nunca duplica\"],[\"Pelo menos uma vez\",\"Processa, depois confirma\",\"O broker entrega de novo\",\"Nunca perde, pode duplicar\"],[\"Exatamente uma vez\",\"Processa e confirma num passo só\",\"Esse passo não existe entre dois sistemas\",\"Promessa que não se cumpre de ponta a ponta\"]]",
                    },
                    {
                        type: "text",
                        value: "## A promessa vazia do \"exatamente uma vez\"\n\nPara entregar exatamente uma vez, o efeito (gravar no banco, chamar o gateway) e a confirmação ao broker teriam de acontecer juntos, num passo atômico. Só que são dois sistemas diferentes, e entre eles sempre existe um instante em que um já foi e o outro ainda não. Se o processo morrer ali, ou o efeito aconteceu sem confirmação, e virá duplicata, ou a confirmação foi sem o efeito, e a mensagem se perdeu. Trocar a ordem só escolhe qual dos dois erros você aceita.\n\nQuando um fornecedor anuncia *exactly-once*, leia o escopo. O do Kafka, por exemplo, combina produtor idempotente e transações para que ler de tópicos, processar e escrever em tópicos aconteça como uma unidade dentro do próprio Kafka. O e-mail que o seu consumidor manda no meio do caminho, o INSERT no PostgreSQL e a chamada ao gateway de pagamento ficam fora dessa transação. Dentro da fronteira do broker, a garantia é real; na fronteira com o resto do mundo, você volta a ter pelo menos uma vez.",
                    },
                    {
                        type: "text",
                        value: "## Idempotência: a resposta prática\n\nSe a duplicata é inevitável, o caminho é fazer com que ela não cause estrago. Uma operação é **idempotente** quando executá-la várias vezes tem o mesmo efeito que executá-la uma vez. Pelo menos uma vez, somado a um consumidor idempotente, dá o que todo mundo queria do \"exatamente uma vez\": o **efeito** acontece uma vez só, mesmo que a mensagem chegue duas.\n\nHá três jeitos de chegar lá:\n\n- **Pela natureza da operação.** \"Marcar o pedido como pago\" pode rodar dez vezes: o status termina Pago. \"Somar 10 pontos ao saldo\" não pode.\n- **Por uma chave.** A mensagem carrega um identificador único do que ela representa (o id do lançamento, o id do pedido), e o consumidor grava esse id **na mesma transação** do efeito. Na segunda entrega, o id já está lá e a mensagem é ignorada. A versão completa, com uma tabela de mensagens processadas, vem mais adiante na trilha.\n- **Pela chave de idempotência do outro lado.** Para efeito externo, como cobrar um cartão, muitos gateways de pagamento aceitam uma chave de idempotência na requisição: a segunda chamada com a mesma chave devolve o resultado da primeira em vez de cobrar de novo.",
                    },
                    {
                        type: "code",
                        value: "// Dominio.cs: o mesmo crédito entregue duas vezes\npublic sealed class Conta\n{\n    public decimal Saldo { get; private set; }\n\n    // ids dos créditos já aplicados: persistidos junto com o saldo, na mesma transação\n    public HashSet<Guid> CreditosAplicados { get; } = [];\n\n    // NÃO idempotente: cada reentrega soma de novo\n    public void Creditar(decimal valor) => Saldo += valor;\n\n    // Idempotente pela chave: o id do crédito vem na mensagem\n    public void Creditar(Guid creditoId, decimal valor)\n    {\n        if (!CreditosAplicados.Add(creditoId))\n            return; // já aplicado: a repetição não muda nada\n        Saldo += valor;\n    }\n}\n\npublic sealed class Pedido\n{\n    public StatusPedido Status { get; private set; } = StatusPedido.Aberto;\n\n    // Idempotente por natureza: define um estado em vez de somar\n    public void MarcarComoPago() => Status = StatusPedido.Pago;\n}\n\npublic enum StatusPedido { Aberto, Pago, Cancelado }",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns\n\n- **Confirmar antes para ganhar desempenho.** Confirmar na chegada deixa o consumidor mais rápido e, sem ninguém perceber, troca a garantia para no máximo uma vez. A primeira queda do processo leva junto as mensagens que estavam em processamento.\n- **Deduplicar na memória do processo.** Um `HashSet` estático com os ids processados parece resolver nos testes. Em produção, ele some a cada reinício (justamente quando chegam as reentregas) e não é compartilhado entre réplicas. A chave tem de ser gravada no mesmo lugar e na mesma transação do efeito.\n- **Gravar a chave depois de um efeito externo.** Cobrar o cartão e só então anotar o id no banco deixa a janela aberta: se o processo morrer entre um e outro, a reentrega cobra de novo. Para efeito fora do seu banco, a chave precisa ir junto com a chamada.\n- **Confiar no rótulo.** Ligar uma opção chamada *exactly-once* e tratar o consumidor como se duplicata não existisse. O rótulo descreve o que acontece dentro do broker, não o que o seu código faz fora dele.",
                    },
                    {
                        type: "quote",
                        value: "Entre perder e duplicar, mensagem de negócio fica com pelo menos uma vez. O \"exatamente uma vez\" não existe de ponta a ponta, e é a idempotência do consumidor que faz o efeito acontecer uma vez só.",
                    },
                ],
                questions: [
                    {
                        statement: "Um consumidor confirma cada mensagem assim que a recebe e só depois processa. O processo morre no meio do processamento. Que garantia esse consumidor oferece?",
                        difficulty: "facil",
                        options: [
                            { text: "No máximo uma vez: a mensagem em processamento se perdeu", isCorrect: true },
                            { text: "Nenhuma: o broker devolve a mensagem para o produtor reenviar", isCorrect: false },
                            { text: "Exatamente uma vez: a confirmação impede qualquer repetição", isCorrect: false },
                            { text: "Pelo menos uma vez: o broker vai entregar a mensagem de novo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destas operações é **idempotente**?",
                        difficulty: "facil",
                        options: [
                            { text: "Somar 10 pontos ao saldo do cliente", isCorrect: false },
                            { text: "Enviar o e-mail de confirmação ao cliente", isCorrect: false },
                            { text: "Inserir uma linha nova no extrato", isCorrect: false },
                            { text: "Definir o status do pedido como Pago", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O produtor publica uma mensagem, o broker a guarda, mas a conexão cai antes de a confirmação chegar ao produtor, que então publica de novo. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "A segunda publicação falha, porque a mensagem já está guardada no broker", isCorrect: false },
                            { text: "O broker reconhece o mesmo corpo e descarta sozinho a segunda cópia", isCorrect: false },
                            { text: "O broker guarda duas cópias, e o consumidor precisa tolerar a repetição", isCorrect: true },
                            { text: "A primeira cópia é apagada, porque a confirmação dela não foi entregue", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um fornecedor de broker anuncia garantia *exactly-once*, como o Kafka faz com as suas transações. O que essa garantia cobre de fato?",
                        difficulty: "medio",
                        options: [
                            { text: "Ler, processar e gravar em tópicos numa transação do próprio broker", isCorrect: true },
                            { text: "O e-mail que o consumidor envia enquanto processa cada mensagem", isCorrect: false },
                            { text: "O INSERT que o consumidor faz no banco relacional da aplicação", isCorrect: false },
                            { text: "Qualquer efeito do consumidor, desde que o produtor seja idempotente", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um consumidor recebe `CobrarPedido`, chama o gateway de pagamento por HTTP, grava o id da mensagem numa tabela de processadas e só então confirma ao broker. Que mudança evita a cobrança em dobro se o processo morrer logo depois da chamada ao gateway, sem correr o risco de o pedido ficar sem cobrança?",
                        difficulty: "dificil",
                        options: [
                            { text: "Enviar ao gateway uma chave de idempotência derivada do id do pedido", isCorrect: true },
                            { text: "Confirmar a mensagem ao broker antes de chamar o gateway de pagamento", isCorrect: false },
                            { text: "Consultar a tabela de processadas antes de chamar o gateway", isCorrect: false },
                            { text: "Gravar o id da mensagem na tabela de processadas antes de cobrar", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "RabbitMQ, Kafka e RabbitMQ Streams",
                blocks: [
                    {
                        type: "text",
                        value: "# RabbitMQ, Kafka e RabbitMQ Streams\n\nEm toda discussão de arquitetura com mensageria alguém pergunta \"por que não Kafka?\". A pergunta é boa, mas a resposta não é sobre qual ferramenta é melhor, e sim sobre qual **modelo** o problema pede. O RabbitMQ nasceu como broker de filas: a mensagem é um trabalho a fazer, e depois de feito ela sai. O Kafka nasceu como log distribuído: a mensagem é um registro, fica guardada pelo tempo de retenção, e cada leitor anda por ela no seu próprio ritmo. Em 2026, cada um já invadiu um pouco o terreno do outro, e é por isso que vale aprender o critério, não o slogan.\n\n## O modelo da fila: RabbitMQ\n\nO produtor publica numa exchange, que manda cópias para as filas segundo regras de roteamento: por chave exata, por padrão de nome, para todas. O consumidor recebe a mensagem, processa e confirma; confirmada, ela sai da fila. O broker cuida de cada mensagem individualmente: reentrega o que não foi confirmado, desvia para uma fila de mensagens mortas (*dead letter*) o que falhou demais, respeita prioridade e prazo de validade. Para escalar o consumo, basta pôr mais consumidores na mesma fila. É um broker esperto com consumidores simples.\n\nO preço desse modelo é que, depois de confirmada, a mensagem não existe mais. Um serviço que nasceu hoje não tem como ler os pedidos de ontem.",
                    },
                    {
                        type: "text",
                        value: "## O modelo do log: Kafka\n\nNo Kafka, o tópico é dividido em partições, e cada mensagem é anexada ao fim de uma partição com um número de posição, o *offset*. Ler não apaga nada: as mensagens ficam até vencer a retenção (sete dias por padrão, configurável por tempo ou por tamanho). Cada grupo de consumidores (*consumer group*) guarda o offset até onde leu e pode voltar atrás para reler, o que se chama *replay*. Dez sistemas diferentes leem o mesmo tópico sem atrapalhar um ao outro.\n\nNo consumer group clássico, cada partição é lida por um único consumidor do grupo. A ordem é garantida dentro da partição, e o paralelismo máximo do grupo é o número de partições: com 6 partições, o sétimo consumidor fica parado. Não há ack por mensagem: o consumidor avança o offset, e reprocessar uma mensagem que falhou sem segurar as que vêm atrás dela é trabalho da aplicação. É um broker simples com consumidores espertos.\n\nDuas datas para ter no radar. O **Kafka 4.0** (março de 2025) removeu o ZooKeeper: o cluster roda só no modo KRaft, o que simplificou a operação. O **Kafka 4.2** (fevereiro de 2026) declarou prontos para produção os *share groups* (KIP-932, \"Queues for Kafka\"), que tinham estreado em acesso antecipado no 4.0. Os consumidores de um share group dividem as mensagens sem que cada partição fique presa a um deles, com ack por mensagem e contagem de tentativas: é semântica de fila dentro do Kafka, pensada para mensagens tratadas uma a uma, não como fluxo ordenado. Um cuidado para quem programa em C#: em outubro de 2026, o librdkafka (a biblioteca em C por baixo do cliente .NET `Confluent.Kafka`) tinha o consumidor de share group só como prévia, e o `Confluent.Kafka` ainda não o oferecia. Recurso do broker não é recurso do seu cliente.",
                    },
                    {
                        type: "text",
                        value: "## RabbitMQ Streams: o log dentro do RabbitMQ\n\nDesde o RabbitMQ 3.9, de 2021, existe um tipo de fila diferente, o **stream**: um log só de anexar, com consumo que não apaga. O consumidor escolhe de onde começar a ler, do início (`first`), do fim (`last`), só o que chegar depois (`next`, o padrão), de um offset ou de um instante no tempo, e pode reler à vontade. O que apaga é a retenção, por idade (`x-max-age`) ou por tamanho (`x-max-length-bytes`).\n\nDá para ler um stream pelo próprio AMQP 0.9.1, com ack manual e prefetch configurado, ou pelo protocolo binário próprio dos streams (plugin `rabbitmq_stream`, porta 5552), que tem cliente .NET oficial, o `RabbitMQ.Stream.Client`. Desde o 3.11 existem também os *super streams*, um stream dividido em partições, como um tópico do Kafka.\n\nA documentação do RabbitMQ diz com todas as letras que streams não vieram substituir as filas, e sim complementá-las. Os casos que ela lista são os de log: muitos leitores para os mesmos dados (*fan-out* grande), releitura, vazão alta e acúmulo grande de mensagens.",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\",\"Fila do RabbitMQ\",\"Kafka\",\"RabbitMQ Streams\"],[\"Unidade\",\"Mensagem como tarefa\",\"Registro num log particionado\",\"Registro num log\"],[\"Depois de lida\",\"Sai da fila após o ack\",\"Fica até vencer a retenção\",\"Fica até vencer a retenção\"],[\"Releitura\",\"Não existe\",\"Sim, voltando o offset\",\"Sim, por offset ou por instante no tempo\"],[\"Roteamento\",\"Rico, por exchanges e bindings\",\"Por tópico e chave de partição\",\"Recebe de exchanges, como uma fila\"],[\"Ack e retry por mensagem\",\"Sim, com dead letter\",\"Não no consumer group clássico; sim nos share groups (4.2)\",\"Não: o leitor controla o offset\"],[\"Vários consumidores\",\"Competem pela mesma fila\",\"Até um por partição no grupo clássico\",\"Cada leitor lê tudo; super streams particionam\"],[\"Ordem\",\"Por fila, até haver consumidores concorrentes\",\"Por partição\",\"Por stream ou por partição\"]]",
                    },
                    {
                        type: "text",
                        value: "## Critérios de escolha\n\nEsqueça \"qual é mais rápido\": os dois aguentam muito mais do que a maioria dos sistemas produz, e benchmark de fornecedor mede o caso que favorece o fornecedor. As perguntas que decidem são estas:\n\n1. **Alguém precisa ler o passado?** Um serviço novo que precisa do histórico, reprocessar tudo depois de corrigir um bug, auditoria. Se sim, você precisa de log: Kafka ou RabbitMQ Streams.\n2. **A mensagem é um trabalho a ser feito uma vez, por alguém?** Emitir nota, cobrar, gerar relatório, com retry por mensagem, dead letter e prioridade. Isso é fila, o terreno natural do RabbitMQ.\n3. **O roteamento tem regras?** Mandar para filas diferentes conforme o tipo do evento, a região ou o cliente. As exchanges do RabbitMQ fazem isso no broker; num tópico do Kafka, quem filtra é cada consumidor.\n4. **Quantos leitores independentes e quanto histórico?** Dezenas de sistemas lendo o mesmo fluxo, com dias de retenção, é o caso típico do log.\n5. **O que existe em volta?** O Kafka tem um ecossistema grande de integração e processamento de fluxo (Kafka Connect, captura de mudanças de banco de dados, Kafka Streams). Se o problema é alimentar pipelines de dados, isso pesa.\n6. **Quem vai operar?** Os dois exigem gente que saiba monitorar, atualizar e recuperar de falha. Pese o que a equipe já domina e o que a sua nuvem oferece como serviço gerenciado.",
                    },
                    {
                        type: "table",
                        value: "[[\"Cenário\",\"Escolha comum\",\"Por quê\"],[\"Emissão de notas fiscais com retry e dead letter\",\"Fila do RabbitMQ\",\"Trabalho por mensagem, com ack, reentrega e desvio do que falhou\"],[\"Eventos de pedido lidos por 15 sistemas, com 7 dias de histórico\",\"Kafka ou RabbitMQ Streams\",\"Muitos leitores independentes e releitura\"],[\"Alertas roteados por severidade e por região\",\"Exchanges do RabbitMQ\",\"O broker roteia pelas regras, sem filtrar no consumidor\"],[\"Pipeline que alimenta data lake e motor de busca\",\"Kafka\",\"Ecossistema de conectores e processamento de fluxo\"],[\"Já há RabbitMQ e surgiu uma necessidade de releitura\",\"RabbitMQ Streams\",\"Log com releitura sem operar um segundo broker\"]]",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns\n\n- **Kafka como fila de tarefas com poucas partições.** Um tópico de 3 partições com 10 consumidores no mesmo consumer group clássico deixa 7 parados, e uma mensagem que falha segura a partição até alguém decidir o que fazer com ela. Os share groups resolvem parte disso, a partir do Kafka 4.2 e de um cliente que os suporte.\n- **Fila do RabbitMQ como histórico.** \"Depois a gente relê da fila\" não existe: mensagem confirmada saiu. Se o histórico importa, ele vai para um stream, um tópico ou um banco.\n- **Escolher pelo currículo.** Subir um cluster Kafka para trocar algumas centenas de mensagens por minuto entre três serviços traz o custo de operar um log distribuído sem usar o que ele tem de melhor. O inverso também acontece: forçar filas onde todo mundo precisa reler.",
                    },
                    {
                        type: "quote",
                        value: "Fila é trabalho que sai depois de feito; log é registro que fica para ser relido. O RabbitMQ é o broker de filas com roteamento rico, o Kafka é o log distribuído com o maior ecossistema, e os RabbitMQ Streams põem o log dentro do RabbitMQ: escolha pelo modelo que o problema pede.",
                    },
                ],
                questions: [
                    {
                        statement: "Um serviço novo precisa processar os pedidos dos últimos três dias, que passaram por uma fila clássica do RabbitMQ e foram confirmados pelos consumidores da época. O que ele consegue ler dessa fila?",
                        difficulty: "facil",
                        options: [
                            { text: "Nada do passado: a mensagem confirmada já saiu da fila", isCorrect: true },
                            { text: "Tudo, desde que ele entre na fila com um consumer group novo", isCorrect: false },
                            { text: "Só as mensagens das últimas 24 horas, que a fila retém", isCorrect: false },
                            { text: "Tudo, voltando o offset da fila para três dias atrás", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um tópico do Kafka tem 4 partições, e 6 consumidores entram no mesmo consumer group clássico. Quantos deles recebem mensagens?",
                        difficulty: "facil",
                        options: [
                            { text: "6, cada um recebendo uma cópia de cada mensagem", isCorrect: false },
                            { text: "4, um por partição, e os outros 2 ficam parados", isCorrect: true },
                            { text: "1, porque um consumer group lê o tópico inteiro", isCorrect: false },
                            { text: "6, porque as mensagens são divididas entre todos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual afirmação sobre os **RabbitMQ Streams** está correta?",
                        difficulty: "medio",
                        options: [
                            { text: "A mensagem sai do stream quando o primeiro consumidor envia o ack dela", isCorrect: false },
                            { text: "O consumidor escolhe de onde ler: do início, do fim ou de um instante", isCorrect: true },
                            { text: "O stream guarda as mensagens só em memória e as perde ao reiniciar", isCorrect: false },
                            { text: "Um stream só é lido pelo protocolo de stream, nunca pelo AMQP 0.9.1", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma equipe precisa distribuir a emissão de notas fiscais entre réplicas, com retry por mensagem, desvio das que falham demais para uma fila de mortas e prioridade para clientes corporativos. Que modelo atende melhor?",
                        difficulty: "medio",
                        options: [
                            { text: "Uma fila do RabbitMQ, com ack, reentrega e dead letter por mensagem", isCorrect: true },
                            { text: "Um RabbitMQ Stream lido do início por cada réplica, com offset próprio", isCorrect: false },
                            { text: "Um tópico do Kafka com consumer group clássico, avançando o offset", isCorrect: false },
                            { text: "Um tópico do Kafka com uma partição exclusiva para cada réplica", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que os share groups (KIP-932), prontos para produção desde o Kafka 4.2, mudam no modelo de consumo do Kafka, e por que isso o aproxima de uma fila?",
                        difficulty: "dificil",
                        options: [
                            { text: "A mensagem confirmada por um consumidor sai do tópico, como sai da fila depois do ack", isCorrect: false },
                            { text: "Consumidores do mesmo grupo dividem uma partição, com ack por mensagem, como numa fila", isCorrect: true },
                            { text: "O grupo passa a rebalancear mais rápido, como consumidores entrando e saindo de uma fila", isCorrect: false },
                            { text: "O broker passa a garantir a ordem entre todos os consumidores, como uma fila FIFO faz", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Subindo o RabbitMQ",
                blocks: [
                    {
                        type: "text",
                        value: "# Subindo o RabbitMQ\n\nPara estudar e desenvolver, o jeito mais rápido de ter um RabbitMQ é um contêiner. É um comando só, e mesmo assim três detalhes costumam morder quem sobe pela primeira vez: a tag da imagem, o nome do nó e o usuário `guest`. Esta aula sobe o broker, explica cada um deles e deixa o ambiente pronto para os exemplos de código.\n\n## Um comando e o broker no ar\n\nA imagem oficial no Docker Hub se chama `rabbitmq`. As tags com `-management` no nome vêm com o plugin de gerenciamento ligado, que serve o painel web e a API HTTP.",
                    },
                    {
                        type: "code",
                        value: "# terminal: sobe o broker com o painel de gerenciamento\ndocker run -d --name rabbitmq --hostname rabbitmq \\\n  -p 5672:5672 -p 15672:15672 \\\n  rabbitmq:4.3-management\n\n# acompanhe o log até aparecer \"Server startup complete\" (Ctrl+C sai do log)\ndocker logs -f rabbitmq\n\n# confira a versão e se as portas aceitam conexão\ndocker exec rabbitmq rabbitmq-diagnostics -q server_version\ndocker exec rabbitmq rabbitmq-diagnostics -q check_port_connectivity",
                    },
                    {
                        type: "table",
                        value: "[[\"Tag\",\"O que você recebe\",\"Quando usar\"],[\"`rabbitmq:4.3-management`\",\"A série 4.3 com o painel; acompanha as correções 4.3.x\",\"Estudo e desenvolvimento: é a referência desta trilha\"],[\"`rabbitmq:4.3.6-management`\",\"A versão 4.3.6 exata, com o painel\",\"Quando o ambiente precisa de versão fixa, como em produção\"],[\"`rabbitmq:4-management`\",\"A série 4 mais nova; em 20/10/2026 passou a ser a 4.4.0\",\"Raramente: muda de versão menor sem avisar\"],[\"`rabbitmq:4.3`\",\"A série 4.3 sem o plugin de gerenciamento ligado\",\"Quando o painel não é necessário\"],[\"Variantes `-alpine`\",\"A mesma versão sobre Alpine Linux, com imagem menor\",\"Quando o tamanho da imagem pesa\"]]",
                    },
                    {
                        type: "table",
                        value: "[[\"Porta\",\"Para quê\",\"Observação\"],[\"5672\",\"AMQP 0.9.1 e AMQP 1.0\",\"A porta das aplicações; desde o 4.0, o AMQP 1.0 faz parte do núcleo, sempre ligado\"],[\"15672\",\"Painel web e API HTTP de gerenciamento\",\"Existe com o plugin de gerenciamento (tags `-management`)\"],[\"15692\",\"Métricas no formato do Prometheus\",\"Plugin `rabbitmq_prometheus`, já ligado na imagem oficial\"],[\"25672\",\"Comunicação entre nós e ferramentas de linha de comando\",\"Não publique fora da rede do cluster\"],[\"4369\",\"epmd, o serviço de nomes do Erlang\",\"Usado para os nós se encontrarem\"],[\"5671\",\"AMQP com TLS\",\"Só escuta depois que o TLS é configurado\"],[\"5552\",\"Protocolo binário dos streams\",\"Só com o plugin `rabbitmq_stream` ligado\"]]",
                    },
                    {
                        type: "text",
                        value: "## O usuário guest\n\nAbra `http://localhost:15672` e entre com `guest`, senha `guest`. Funciona, mas por um motivo que vale entender.\n\nNa primeira inicialização, o RabbitMQ cria o usuário `guest` com a tag `administrator` e permissão total no vhost `/`. Como a senha é conhecida por todo mundo, o padrão é o `guest` **só entrar pelo localhost**: a configuração `loopback_users` o restringe à interface de loopback. Num RabbitMQ instalado numa VM, uma aplicação em outra máquina que tenta entrar como `guest` recebe `ACCESS_REFUSED`, e o painel responde \"User can only log in via localhost\".\n\nCom Docker, a pegadinha é dupla. Primeiro, o localhost do seu computador não é o localhost do contêiner: a conexão que entra pela porta publicada chega vinda da rede do Docker, não da loopback dele, e com a restrição padrão o `guest` seria barrado até no seu navegador. Segundo, a imagem oficial **desliga a restrição**: ela traz o arquivo `/etc/rabbitmq/conf.d/10-defaults.conf` com `loopback_users.guest = false`, e o próprio arquivo avisa que esses padrões não foram feitos para produção. É por isso que o `guest` funciona no seu navegador, e é por isso que um contêiner desses com a 5672 e a 15672 publicadas numa máquina exposta à internet entrega o painel de administrador a quem tentar `guest`/`guest`.\n\n## Vhost: o broker dividido em partes isoladas\n\nUm *virtual host* (vhost) é uma divisão lógica do broker: cada vhost tem as suas exchanges, filas e bindings, e as permissões dos usuários são dadas por vhost. A conexão escolhe o vhost ao abrir, e um usuário sem permissão naquele vhost é recusado. O vhost padrão se chama `/`. É comum usar um vhost por aplicação ou por ambiente no mesmo broker, para que nomes de fila não colidam e uma aplicação não enxergue as filas da outra.\n\nPara o dia a dia, um `compose.yaml` com usuário, vhost, volume e verificação de saúde (*healthcheck*) é mais prático do que lembrar o comando:",
                    },
                    {
                        type: "code",
                        value: "# compose.yaml\nservices:\n  rabbitmq:\n    image: rabbitmq:4.3-management\n    hostname: rabbitmq\n    ports:\n      - \"5672:5672\"\n      - \"15672:15672\"\n    environment:\n      RABBITMQ_DEFAULT_USER: loja\n      RABBITMQ_DEFAULT_PASS: troque-esta-senha\n      RABBITMQ_DEFAULT_VHOST: loja\n    volumes:\n      - rabbitmq-dados:/var/lib/rabbitmq\n    healthcheck:\n      test: [\"CMD\", \"rabbitmq-diagnostics\", \"-q\", \"check_port_connectivity\"]\n      interval: 10s\n      timeout: 10s\n      retries: 6\n      start_period: 20s\n\nvolumes:\n  rabbitmq-dados:",
                    },
                    {
                        type: "text",
                        value: "Três coisas acontecem nesse arquivo. As variáveis `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS` e `RABBITMQ_DEFAULT_VHOST` trocam o que o RabbitMQ cria na primeira inicialização: no lugar do `guest` e do vhost `/`, nascem o usuário `loja`, com a tag `administrator`, e o vhost `loja`. O `guest` nem chega a existir, e o vhost `/` também não, então uma aplicação configurada com o vhost padrão recebe `NOT_ALLOWED - vhost / not found`. Repare no \"primeira\": com o volume já preenchido, trocar a senha no arquivo não muda a senha do usuário que já existe.\n\nO `hostname` fixo dá ao nó um nome estável, `rabbit@rabbitmq`, e o volume guarda os dados em `/var/lib/rabbitmq/mnesia/rabbit@rabbitmq` (a pasta ainda se chama mnesia por herança, embora desde o 4.3 o Khepri seja o único armazenamento de metadados). E o healthcheck só declara o serviço saudável quando as portas aceitam conexão, o que permite a outros serviços do compose esperarem por ele com `depends_on` e `condition: service_healthy`.\n\n## Usuário e vhost na mão\n\nCom o broker no ar, `rabbitmqctl` cria o resto:",
                    },
                    {
                        type: "code",
                        value: "# terminal: um vhost, um usuário e a permissão dele nesse vhost\ndocker exec rabbitmq rabbitmqctl add_vhost loja\ndocker exec rabbitmq rabbitmqctl add_user pedidos-api 'Senha-Forte-123'\ndocker exec rabbitmq rabbitmqctl set_permissions -p loja pedidos-api '.*' '.*' '.*'\n\n# a tag management deixa o usuário entrar no painel (sem tag, só AMQP)\ndocker exec rabbitmq rabbitmqctl set_user_tags pedidos-api management\n\n# conferências\ndocker exec rabbitmq rabbitmqctl list_users\ndocker exec rabbitmq rabbitmqctl list_permissions -p loja\n\n# fora do computador de estudo, o guest sai\ndocker exec rabbitmq rabbitmqctl delete_user guest",
                    },
                    {
                        type: "text",
                        value: "As três expressões regulares de `set_permissions` são, nesta ordem, as permissões de **configurar** (declarar e apagar filas e exchanges), **escrever** (publicar) e **ler** (consumir), valendo para os recursos cujo nome casa com a expressão. `'.*'` libera tudo no vhost, o que serve no seu computador; em produção, cada aplicação recebe só o que usa, assunto que volta mais adiante na trilha. Um usuário sem tag conecta por AMQP normalmente, mas o painel o recusa com \"Not management user\". E as aspas em `'.*'` não são enfeite: sem elas, o shell pode trocar `.*` pelos arquivos ocultos da pasta onde você está (`.git`, `.env` e companhia), e o `rabbitmqctl` responde com \"too many arguments\".\n\n## Erros comuns\n\n- **Volume sem hostname fixo.** Sem `--hostname` (ou `hostname:` no compose), cada contêiner novo ganha um nome aleatório, o nó vira `rabbit@<id do contêiner>` e cria outro diretório dentro do mesmo volume. As filas duráveis continuam lá, no diretório do nó antigo, que o nó novo não lê. Parece perda de dados.\n- **Usar o `rabbitmqctl` antes da hora.** Rodar `docker exec ... rabbitmqctl` antes do \"Server startup complete\" pode criar o arquivo de cookie do Erlang com o usuário root. O servidor não consegue lê-lo, registra `eacces` no log e não sobe.\n- **Tag que anda sozinha.** `rabbitmq:4-management` e `rabbitmq:management` mudam de versão menor quando sai uma nova. Em 20/10/2026, dia do lançamento do 4.4.0, as duas já apontavam para ele. Fixe pelo menos a série, como em `4.3-management`.\n- **Achar que `docker compose down` apaga os dados.** Não apaga: o volume nomeado sobrevive. Quem apaga é `docker compose down -v`, útil para começar do zero.",
                    },
                    {
                        type: "quote",
                        value: "Um contêiner `rabbitmq:4.3-management` com hostname fixo e volume dá um broker de estudo em segundos, com AMQP na 5672 e painel na 15672. Só não leve os padrões da imagem para produção: o `guest` liberado para a rede é conveniência de desenvolvimento, não configuração.",
                    },
                ],
                questions: [
                    {
                        statement: "Com o contêiner `rabbitmq:4.3-management` rodando e as portas padrão publicadas, em que porta fica o painel web de gerenciamento?",
                        difficulty: "facil",
                        options: [
                            { text: "15692", isCorrect: false },
                            { text: "15672", isCorrect: true },
                            { text: "5672", isCorrect: false },
                            { text: "25672", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O RabbitMQ foi instalado numa VM, sem mudar a configuração. Uma aplicação em outra máquina tenta conectar com `guest`/`guest` e recebe `ACCESS_REFUSED`. Por quê?",
                        difficulty: "facil",
                        options: [
                            { text: "A senha padrão do guest muda a cada inicialização do broker", isCorrect: false },
                            { text: "O vhost / só é criado no primeiro login pelo painel web", isCorrect: false },
                            { text: "A porta 5672 só aceita conexão com TLS a partir do 4.0", isCorrect: false },
                            { text: "Por padrão, o guest só entra pela interface de loopback", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No contêiner da imagem oficial `rabbitmq:4.3-management`, o login `guest`/`guest` funciona no navegador em `http://localhost:15672`, embora o RabbitMQ restrinja o `guest` ao localhost por padrão. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "A imagem traz um arquivo de configuração que desliga a restrição", isCorrect: true },
                            { text: "O RabbitMQ 4.x deixou de restringir o guest na configuração padrão", isCorrect: false },
                            { text: "O painel não aplica a restrição, que só vale para conexões AMQP", isCorrect: false },
                            { text: "A porta publicada faz a conexão chegar pela loopback do contêiner", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma equipe quer receber as correções da série 4.3 do RabbitMQ sem correr o risco de pular para outra versão menor sem perceber. Qual tag usar no compose?",
                        difficulty: "medio",
                        options: [
                            { text: "`rabbitmq:4.3-management`", isCorrect: true },
                            { text: "`rabbitmq:4.3.6-management`", isCorrect: false },
                            { text: "`rabbitmq:4-management`", isCorrect: false },
                            { text: "`rabbitmq:management`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um compose sobe o RabbitMQ com volume nomeado em `/var/lib/rabbitmq`, mas sem `hostname`. Depois de `docker compose down` e `docker compose up`, as filas duráveis criadas antes não aparecem, embora o volume continue lá. O que aconteceu?",
                        difficulty: "dificil",
                        options: [
                            { text: "O Khepri, único armazenamento de metadados no 4.3, guarda as filas só em memória", isCorrect: false },
                            { text: "O usuário `rabbitmq` perdeu a permissão no diretório do volume, e o nó subiu vazio", isCorrect: false },
                            { text: "Filas duráveis só sobrevivem a reinício quando são do tipo quorum queue", isCorrect: false },
                            { text: "O contêiner novo ganhou outro hostname, e o nó passou a usar outro diretório", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - O modelo do RabbitMQ",
        aulas: [
            {
                titulo: "Conexão, canal, exchange, fila e binding",
                blocks: [
                    {
                        type: "text",
                        value: "# Conexão, canal, exchange, fila e binding\n\nO serviço de pedidos precisa avisar o faturamento de que um pedido foi criado. A primeira ideia é \"pôr a mensagem na fila do faturamento\". Funciona até o dia em que o estoque e a notificação também querem saber do pedido: o serviço de pedidos passa a conhecer três filas, e cada consumidor novo vira um deploy do produtor.\n\nO RabbitMQ resolve isso com uma peça no meio do caminho. O produtor publica numa **exchange**, junto com uma etiqueta chamada **routing key**, e o broker decide, por regras guardadas nele, em quais filas a mensagem entra. Esse é o modelo do **AMQP 0.9.1**, o protocolo que o cliente `RabbitMQ.Client` usa. Desde o RabbitMQ 4.0 o broker também fala AMQP 1.0 no núcleo, mas exchanges, filas e bindings continuam sendo o modelo interno do broker.",
                    },
                    {
                        type: "text",
                        value: "## As cinco peças\n\n- **Conexão** (`IConnection`): uma conexão TCP autenticada com o broker, presa a um vhost. Abrir custa caro (TCP, TLS quando houver, handshake do protocolo, autenticação), por isso a aplicação abre poucas e as mantém abertas por horas ou dias.\n- **Canal** (`IChannel`): uma sessão leve dentro da conexão. Tudo acontece num canal: declarar, publicar, consumir. Vários canais dividem o mesmo TCP, cada um com o seu número.\n- **Exchange**: recebe a mensagem do produtor e decide para onde ela vai, de acordo com o seu tipo e os seus bindings. Exchange **não guarda mensagem**: por padrão, o que ela não consegue entregar é descartado.\n- **Fila** (queue): guarda as mensagens até um consumidor pegar. É o único lugar onde a mensagem espera.\n- **Binding**: a regra que liga uma exchange a uma fila, com uma **binding key** (ou com argumentos, num dos tipos). A exchange compara a routing key da mensagem com as binding keys para escolher as filas.\n\nNo exemplo abaixo, a exchange é do tipo topic. Com uma chave sem curinga, como `pedido.criado`, a regra é simples: entrega quando a routing key é igual à binding key. Os tipos e as diferenças entre eles vêm nas próximas aulas.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (projeto console com o pacote RabbitMQ.Client 7.x)\nusing System.Text;\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\n\n// Uma conexão longa para a aplicação; o trabalho acontece dentro de um canal\nawait using IConnection conexao = await factory.CreateConnectionAsync();\nawait using IChannel canal = await conexao.CreateChannelAsync();\n\n// Topologia: a exchange, a fila e o binding que liga as duas\nawait canal.ExchangeDeclareAsync(\"pedidos\", ExchangeType.Topic, durable: true);\nawait canal.QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false,\n    autoDelete: false, arguments: null);\nawait canal.QueueBindAsync(queue: \"faturamento\", exchange: \"pedidos\",\n    routingKey: \"pedido.criado\");\nawait canal.QueuePurgeAsync(\"faturamento\"); // começa do zero a cada execução\n\n// O produtor só conhece a exchange e a routing key, nunca a fila\nbyte[] corpo = Encoding.UTF8.GetBytes(\"\"\"{\"pedidoId\":42}\"\"\");\nawait canal.BasicPublishAsync(exchange: \"pedidos\", routingKey: \"pedido.criado\", body: corpo);\nawait canal.BasicPublishAsync(exchange: \"pedidos\", routingKey: \"pedido.devolvido\", body: corpo);\n\n// Sem publisher confirms, o await só garante que a mensagem saiu do cliente.\n// A pausa dá tempo de o broker rotear antes da contagem (só na demonstração).\nawait Task.Delay(500);\nuint naFila = await canal.MessageCountAsync(\"faturamento\");\nConsole.WriteLine($\"faturamento: {naFila} mensagem\");\n// faturamento: 1 mensagem\n// (pedido.devolvido não casou com nenhum binding e foi descartada)",
                    },
                    {
                        type: "text",
                        value: "## Por que publicar na exchange e não na fila\n\nNo exemplo, o produtor não sabe que a fila `faturamento` existe: ele publica em `pedidos` com a chave `pedido.criado`, e o binding faz o resto. Quando o estoque também quiser os pedidos criados, o time do estoque declara a fila `estoque` e a liga na mesma exchange, com a mesma chave. **Cada fila ligada recebe a sua própria cópia**, e o produtor não muda uma linha.\n\nDuas regras do modelo explicam quase tudo o que vem pela frente:\n\n- **A cópia é por fila, não por consumidor.** Dois processos lendo da mesma fila dividem as mensagens entre si. Dois serviços que precisam receber tudo precisam de duas filas.\n- **Mensagem que não casa com nenhum binding é descartada em silêncio.** O `BasicPublishAsync` não lança exceção, e o broker não avisa, a não ser que você peça (há mecanismos para isso, vistos ao tratar de publicação). Muita gente sobe o produtor antes de o consumidor declarar a fila e o binding, e as primeiras mensagens somem sem rastro. Foi o que aconteceu com `pedido.devolvido` no exemplo.\n\nMesmo quando parece que você publica direto numa fila, existe uma exchange no meio. A próxima aula mostra qual.",
                    },
                    {
                        type: "table",
                        value: "[[\"Peça\", \"No cliente 7.x\", \"Vida útil\", \"Erro comum\"], [\"Conexão\", \"`IConnection`, de `CreateConnectionAsync`\", \"longa, a da aplicação\", \"abrir uma conexão por mensagem\"], [\"Canal\", \"`IChannel`, de `CreateChannelAsync`\", \"longa, reaproveitado\", \"abrir e fechar um canal a cada publicação\"], [\"Exchange\", \"`ExchangeDeclareAsync`\", \"permanente, se `durable`\", \"publicar antes de existir o binding\"], [\"Fila\", \"`QueueDeclareAsync`\", \"permanente, se `durable`; da conexão, se `exclusive`\", \"dois serviços na mesma fila, esperando uma cópia cada\"], [\"Binding\", \"`QueueBindAsync`\", \"enquanto a exchange e a fila existirem\", \"chave errada, que não dá erro nenhum\"]]",
                    },
                    {
                        type: "text",
                        value: "## Declarar é idempotente, desde que bata\n\nDeclarar uma exchange ou uma fila que já existe, com os mesmos atributos, não faz nada; por isso o exemplo pode rodar a cada subida da aplicação. Com um atributo diferente, o broker responde `PRECONDITION_FAILED` (código 406), fecha o canal e deixa a exchange ou a fila como estava. O caso clássico: um serviço declara `pedidos` como topic e outro, como direct. A mensagem de erro diz o que divergiu: `inequivalent arg 'type' for exchange 'pedidos'`.\n\nQuem declara o quê é decisão de time. Uma convenção que funciona: o produtor declara a exchange em que publica; o consumidor declara a mesma exchange (é idempotente), a sua fila e o binding. Em produção, muitos times definem a topologia fora do código, num arquivo de definições ou numa ferramenta de infraestrutura, e as aplicações só a conferem.\n\nCuidado com tutorial antigo. Declarar fila com `durable: false` e `exclusive: false` era comum, e **desde o RabbitMQ 4.3 essa combinação é recusada por padrão** (é o recurso depreciado `transient_nonexcl_queues`). O broker fecha a conexão inteira com `INTERNAL_ERROR` (541). Use fila durável, ou fila exclusiva quando ela deve morrer junto com a conexão.",
                    },
                    {
                        type: "text",
                        value: "## Erro de canal e erro de conexão\n\nOs erros do AMQP têm dois alcances, e confundir os dois atrapalha o diagnóstico:\n\n- **Erro de canal** fecha só aquele canal: `NOT_FOUND` (404, exchange ou fila inexistente), `PRECONDITION_FAILED` (406), `ACCESS_REFUSED` (403). A conexão e os outros canais seguem vivos.\n- **Erro de conexão** derruba a conexão e todos os canais dela, como o `INTERNAL_ERROR` da fila transitória no 4.3.\n\nUm detalhe do cliente 7.x: sem publisher confirms, publicar numa exchange que não existe **não lança exceção no `await`**. O broker fecha o canal logo depois com `NOT_FOUND`, e o erro só aparece na operação seguinte, como `AlreadyClosedException`, longe da linha que o causou. Ao ver essa exceção, leia a `CloseReason` do canal: ela traz o código e o texto do broker, com o nome da exchange.",
                    },
                    {
                        type: "quote",
                        value: "O produtor fala com a exchange, a exchange consulta os bindings e cada fila ligada recebe a sua cópia. Conexão é cara e longa, canal é leve, e mensagem que não casa com nenhum binding some sem aviso.",
                    },
                ],
                questions: [
                    {
                        statement: "No AMQP 0.9.1, para onde vai a mensagem quando o produtor chama `BasicPublishAsync`?",
                        difficulty: "facil",
                        options: [
                            { text: "Para o canal, que guarda a mensagem até algum consumidor se conectar a ele", isCorrect: false },
                            { text: "Para uma exchange, que escolhe as filas de destino de acordo com os bindings", isCorrect: true },
                            { text: "Direto para uma fila, que depois repassa a mensagem às exchanges ligadas a ela", isCorrect: false },
                            { text: "Para o binding, que funciona como uma fila entre o produtor e os consumidores", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a relação entre conexão e canal no cliente `RabbitMQ.Client` 7.x?",
                        difficulty: "facil",
                        options: [
                            { text: "Canal é outro nome para fila: cada canal guarda as mensagens de uma única fila", isCorrect: false },
                            { text: "Uma conexão TCP carrega vários canais leves, e os comandos trafegam nos canais", isCorrect: true },
                            { text: "A conexão serve só para publicar, e o canal serve só para consumir mensagens", isCorrect: false },
                            { text: "Cada canal abre a sua própria conexão TCP, e a conexão só guarda as credenciais", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A exchange direct `pedidos` tem um único binding: a fila `faturamento`, ligada com a chave `pedido.criado`. O produtor publica, com as opções padrão, uma mensagem com a routing key `pedido.cancelado`. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker fecha o canal com `NOT_FOUND`, porque nenhuma fila casa com a chave", isCorrect: false },
                            { text: "O broker descarta a mensagem, e o produtor não recebe erro nenhum por isso", isCorrect: true },
                            { text: "A mensagem fica guardada na exchange até surgir um binding para a chave", isCorrect: false },
                            { text: "A mensagem vai para faturamento, a única fila ligada à exchange pedidos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A exchange `pedidos` já existe como topic. Um serviço novo sobe e executa a linha abaixo. O que acontece?\n\n```csharp\nawait canal.ExchangeDeclareAsync(\"pedidos\", ExchangeType.Direct, durable: true);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "O broker responde ok sem mudar nada, porque declarar uma exchange é idempotente", isCorrect: false },
                            { text: "A exchange passa a ser direct, e os bindings antigos continuam valendo como antes", isCorrect: false },
                            { text: "O broker cria uma segunda exchange pedidos, do tipo direct, separada da primeira", isCorrect: false },
                            { text: "O broker recusa com `PRECONDITION_FAILED`, fecha o canal e a exchange segue topic", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com o cliente 7.x e sem publisher confirms, o código publica numa exchange que não existe, porque o nome foi digitado errado. O que o programa observa?",
                        difficulty: "dificil",
                        options: [
                            { text: "O `await` termina sem erro; o broker fecha o canal com `NOT_FOUND` e usá-lo de novo dá exceção", isCorrect: true },
                            { text: "O broker cria a exchange na hora, do tipo direct, e descarta a mensagem por falta de binding", isCorrect: false },
                            { text: "O `await` termina sem erro, e a mensagem é descartada em silêncio com o canal ainda aberto", isCorrect: false },
                            { text: "O `await` lança `NOT_FOUND` na hora, e o broker fecha a conexão inteira junto com os outros canais", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Default exchange e exchange direct",
                blocks: [
                    {
                        type: "text",
                        value: "# Default exchange e exchange direct\n\nQuase todo mundo começa no RabbitMQ publicando \"direto na fila\": exchange vazia e routing key igual ao nome da fila. Parece que a exchange é opcional. Não é: existe uma exchange ali, a **default exchange**, e ela é do tipo mais simples que o broker oferece, o **direct**. Entender as duas ajuda a decidir quando publicar pelo nome da fila basta e quando isso vira um acoplamento caro.",
                    },
                    {
                        type: "text",
                        value: "## A default exchange\n\nTodo vhost já nasce com uma exchange cujo nome é a string vazia (`\"\"`), do tipo direct, que o painel de gerenciamento mostra como `(AMQP default)`. A regra dela é fixa: **toda fila declarada é ligada automaticamente a ela, com binding key igual ao nome da fila**. Por isso `BasicPublishAsync(exchange: \"\", routingKey: \"faturamento\", body: corpo)` entrega na fila `faturamento`.\n\nNão dá para mexer nessa regra. Criar um binding na default exchange (`QueueBindAsync` com a exchange `\"\"`) é recusado com `ACCESS_REFUSED` (403), e o canal fecha. Nomes que começam com `amq.` também são reservados: o broker já traz exchanges como `amq.direct`, `amq.fanout`, `amq.topic` e `amq.headers`, e declarar uma `amq.minha` também dá 403.",
                    },
                    {
                        type: "code",
                        value: "# terminal: os bindings do vhost depois do programa da aula anterior\n# (o contêiner deste exemplo se chama rabbitmq)\ndocker exec rabbitmq rabbitmqctl list_bindings source_name destination_name routing_key\nListing bindings for vhost /...\nsource_name\tdestination_name\trouting_key\n\tfaturamento\tfaturamento\npedidos\tfaturamento\tpedido.criado\n\n# A primeira linha tem a origem vazia: é a default exchange ligando a fila pelo nome.",
                    },
                    {
                        type: "text",
                        value: "## Quando publicar pelo nome da fila basta\n\nA default exchange serve bem quando existe **um destino só, e ele é conhecido**: um comando para uma fila de trabalho (\"emita a nota fiscal deste pedido\") ou a resposta de um request/reply, que vai para a fila indicada por quem pediu.\n\nO preço é o acoplamento: o produtor carrega o nome da fila no código. Quando aparece um segundo interessado (a auditoria quer uma cópia de cada comando de nota), não há onde ligar a fila nova, porque a default exchange não aceita bindings. A saída é o produtor passar a publicar numa exchange própria, ou seja, mudar o produtor e fazer deploy de novo. E o erro silencioso continua valendo: com o nome da fila errado, ou antes de a fila existir, a mensagem é descartada sem aviso.",
                    },
                    {
                        type: "text",
                        value: "## Exchange direct: chave exata\n\nA exchange direct entrega a mensagem a **toda fila cuja binding key é igual à routing key**. Igual quer dizer byte a byte: `Pix` não casa com `pix`, e `pedido.*` é só um texto que termina em asterisco, sem significado especial.\n\n- Uma fila pode ter vários bindings: a auditoria se liga com `email`, `sms` e `push`.\n- Várias filas podem usar a mesma chave, e cada uma recebe a sua cópia.\n- A routing key costuma ser um valor discreto, com poucos valores possíveis: severidade de log, canal de envio, tipo de comando.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: exchange direct com notificações por tipo de envio\nusing System.Text;\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\nawait using IConnection conexao = await factory.CreateConnectionAsync();\nawait using IChannel canal = await conexao.CreateChannelAsync();\n\nawait canal.ExchangeDeclareAsync(\"notificacoes\", ExchangeType.Direct, durable: true);\n\n// fila => binding keys\nvar bindings = new Dictionary<string, string[]>\n{\n    [\"envio-email\"] = [\"email\"],\n    [\"envio-sms\"] = [\"sms\"],\n    [\"auditoria-notificacoes\"] = [\"email\", \"sms\", \"push\"],\n};\nforeach (var (fila, chaves) in bindings)\n{\n    await canal.QueueDeclareAsync(fila, durable: true, exclusive: false, autoDelete: false);\n    await canal.QueuePurgeAsync(fila); // começa do zero a cada execução\n    foreach (var chave in chaves)\n        await canal.QueueBindAsync(fila, \"notificacoes\", chave);\n}\n\nforeach (var tipo in new[] { \"email\", \"sms\", \"push\", \"whatsapp\" })\n    await canal.BasicPublishAsync(\"notificacoes\", tipo, Encoding.UTF8.GetBytes(tipo));\n\nawait Task.Delay(500); // sem confirms: espera o broker rotear antes de olhar\n\n// BasicGetAsync busca uma mensagem por vez: serve para inspecionar, não para produção\nforeach (var fila in bindings.Keys)\n{\n    var recebidas = new List<string>();\n    while (await canal.BasicGetAsync(fila, autoAck: true) is { } msg)\n        recebidas.Add(msg.RoutingKey);\n    Console.WriteLine($\"{fila,-23} {string.Join(\", \", recebidas)}\");\n}\n// envio-email             email\n// envio-sms               sms\n// auditoria-notificacoes  email, sms, push\n// (whatsapp não casou com nenhum binding e foi descartada)",
                    },
                    {
                        type: "table",
                        value: "[[\"Routing key publicada\", \"envio-email\", \"envio-sms\", \"auditoria-notificacoes\"], [\"`email`\", \"recebe\", \"não\", \"recebe\"], [\"`sms`\", \"não\", \"recebe\", \"recebe\"], [\"`push`\", \"não\", \"não\", \"recebe\"], [\"`whatsapp`\", \"não\", \"não\", \"não (descartada)\"]]",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns com direct\n\n- **Esperar padrão numa direct.** Muita gente liga uma fila com `pedido.*` numa direct esperando receber todos os eventos de pedido. Ela só recebe mensagens publicadas com a chave literal `pedido.*`, ou seja, nenhuma, e nada dá erro. Padrão é coisa da topic.\n- **Maiúsculas diferentes.** O produtor publica `Email` e o binding é `email`: nada chega. Centralize as chaves em constantes compartilhadas pelo contrato, em vez de digitá-las em cada serviço.\n- **Identidade na routing key.** Usar o id do cliente como routing key obriga um binding por cliente. A chave descreve categoria; o id vai no corpo ou nos headers.",
                    },
                    {
                        type: "quote",
                        value: "A default exchange liga cada fila pelo próprio nome e não aceita outros bindings; a direct entrega a toda fila cuja binding key é igual à routing key, byte a byte. Quando o destino pode crescer, publique numa exchange sua.",
                    },
                ],
                questions: [
                    {
                        statement: "O que faz `await canal.BasicPublishAsync(exchange: \"\", routingKey: \"faturamento\", body: corpo);` quando a fila `faturamento` existe?",
                        difficulty: "facil",
                        options: [
                            { text: "Entrega na fila faturamento, pela default exchange, que liga cada fila pelo nome", isCorrect: true },
                            { text: "Falha com erro, porque o nome da exchange não pode ser uma string vazia no AMQP", isCorrect: false },
                            { text: "Entrega na exchange chamada faturamento, caso alguém tenha declarado essa exchange", isCorrect: false },
                            { text: "Copia a mensagem para todas as filas do vhost, já que nenhuma exchange foi indicada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa exchange direct, as filas `envio-email` e `auditoria` estão ligadas com a mesma binding key, `email`. Uma mensagem é publicada com a routing key `email`. Quem recebe?",
                        difficulty: "facil",
                        options: [
                            { text: "Nenhuma, porque a direct recusa duas filas com a mesma chave", isCorrect: false },
                            { text: "As duas filas, cada uma com a sua própria cópia da mensagem", isCorrect: true },
                            { text: "Uma das duas, em rodízio, alternando a fila a cada mensagem", isCorrect: false },
                            { text: "Só envio-email, a fila que foi ligada primeiro com essa chave", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa exchange direct, a fila `vendas` está ligada com a binding key `pedido.*`. O produtor publica com a routing key `pedido.criado`. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "Chega: o asterisco casa com exatamente uma palavra depois do ponto da chave", isCorrect: false },
                            { text: "Dá erro já no binding, porque a direct não aceita asterisco na binding key", isCorrect: false },
                            { text: "Não chega: a direct compara texto exato, e o asterisco é um caractere comum", isCorrect: true },
                            { text: "Chega: o asterisco casa com qualquer sequência de caracteres, como num glob do shell", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Hoje o produtor publica comandos pela default exchange, com a routing key `emitir-nota`. A auditoria quer receber uma cópia de cada comando. Qual mudança resolve?",
                        difficulty: "medio",
                        options: [
                            { text: "A auditoria passa a consumir da fila emitir-nota, junto com o emissor de notas", isCorrect: false },
                            { text: "Ligar a fila de auditoria na default exchange, com a chave emitir-nota, basta", isCorrect: false },
                            { text: "Criar a fila emitir-nota-auditoria basta, porque a default exchange já a liga", isCorrect: false },
                            { text: "O produtor passa a publicar numa exchange própria, onde as duas filas se ligam", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Numa exchange direct chamada `logs`, os bindings são estes:\n\n```text\nfila A: erro, aviso\nfila B: erro.*\nfila C: ERRO\n```\n\nO produtor publica três mensagens, com as routing keys `erro`, `aviso` e `erro.disco`. Quantas mensagens ficam em cada fila?",
                        difficulty: "dificil",
                        options: [
                            { text: "A com 2, B com 0 e C com 1", isCorrect: false },
                            { text: "A com 2, B com 1 e C com 1", isCorrect: false },
                            { text: "A com 2, B com 0 e C com 0", isCorrect: true },
                            { text: "A com 2, B com 1 e C com 0", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Fanout e topic",
                blocks: [
                    {
                        type: "text",
                        value: "# Fanout e topic\n\nO preço de um produto mudou, e as quatro instâncias da API guardam o catálogo em cache na memória: todas precisam saber, não só uma. No mesmo sistema, a logística quer só os eventos de São Paulo, o financeiro quer todo pedido criado e a auditoria quer tudo. Com direct, cada recorte viraria uma lista de chaves exatas para manter à mão. Dois tipos de exchange resolvem esses casos: a **fanout** espalha para todo mundo, e a **topic** filtra por padrão.",
                    },
                    {
                        type: "text",
                        value: "## Fanout: toda fila ligada recebe\n\nA fanout ignora a routing key e a binding key: **toda fila ligada a ela recebe uma cópia** de cada mensagem. Serve para avisos que todo interessado precisa ouvir: cache a invalidar, configuração que mudou, evento que vários serviços acompanham sem filtro.\n\nO erro clássico está do lado de quem consome. A cópia é por fila, e muita gente põe as quatro instâncias da API consumindo da mesma fila `invalida-cache`: elas dividem as mensagens, cada aviso chega a uma instância só, e três delas seguem com o preço velho. **Cada instância precisa da sua fila.** O padrão para esse caso é uma fila exclusiva, com nome gerado pelo broker, que some quando a instância desconecta.",
                    },
                    {
                        type: "code",
                        value: "// Na subida de cada instância da API\nawait canal.ExchangeDeclareAsync(\"catalogo-alterado\", ExchangeType.Fanout, durable: true);\n\n// Sem argumentos: nome gerado pelo broker (amq.gen-...), fila exclusiva desta\n// conexão e apagada quando ela fecha. Cada instância ganha a sua cópia.\nQueueDeclareOk minhaFila = await canal.QueueDeclareAsync();\nawait canal.QueueBindAsync(minhaFila.QueueName, \"catalogo-alterado\", routingKey: \"\");\nConsole.WriteLine($\"fila desta instância: {minhaFila.QueueName}\");\n// fila desta instância: amq.gen-0RAUXB06WjhJAFTd0H6iMA (muda a cada execução)",
                    },
                    {
                        type: "text",
                        value: "## Topic: padrões sobre palavras\n\nNa topic, a routing key é uma lista de **palavras separadas por ponto** (até 255 bytes), como `pedido.criado.sp`. A binding key é um padrão com dois curingas:\n\n- `*` casa com **exatamente uma** palavra;\n- `#` casa com **zero ou mais** palavras.\n\nAssim, `pedido.criado.*` recebe pedido criado de qualquer estado, `*.*.sp` recebe tudo de SP, e `#` sozinho recebe tudo (a topic vira uma fanout). Padrão sem curinga se comporta como direct. E se dois bindings da mesma fila casarem com a mesma mensagem, a fila recebe **uma cópia só**.\n\nDesenhe a chave do mais geral para o mais específico (`entidade.evento.estado`) e trate esse formato como contrato: mudar a ordem das palavras depois quebra os bindings de quem já assinou.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: laboratório de padrões da exchange topic\nusing System.Text;\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\nawait using IConnection conexao = await factory.CreateConnectionAsync();\nawait using IChannel canal = await conexao.CreateChannelAsync();\n\nawait canal.ExchangeDeclareAsync(\"eventos-loja\", ExchangeType.Topic, durable: true);\n\n// fila => padrão do binding\nvar padroes = new Dictionary<string, string>\n{\n    [\"pedidos-asterisco\"] = \"pedido.*\",\n    [\"pedidos-geral\"] = \"pedido.#\",\n    [\"financeiro\"] = \"pedido.criado.#\",\n    [\"logistica-sp\"] = \"*.*.sp\",\n    [\"auditoria\"] = \"#\",\n};\nforeach (var (fila, padrao) in padroes)\n{\n    await canal.QueueDeclareAsync(fila, durable: true, exclusive: false, autoDelete: false);\n    await canal.QueuePurgeAsync(fila); // começa do zero a cada execução\n    await canal.QueueBindAsync(fila, \"eventos-loja\", padrao);\n}\n\nstring[] chaves = [\"pedido.criado\", \"pedido.criado.sp\", \"pedido.cancelado.rj\", \"estoque.baixado.sp\"];\nforeach (var chave in chaves)\n    await canal.BasicPublishAsync(\"eventos-loja\", chave, Encoding.UTF8.GetBytes(chave));\n\nawait Task.Delay(500); // sem confirms: espera o broker rotear antes de olhar\nforeach (var (fila, padrao) in padroes)\n{\n    var recebidas = new List<string>();\n    while (await canal.BasicGetAsync(fila, autoAck: true) is { } msg)\n        recebidas.Add(msg.RoutingKey);\n    Console.WriteLine($\"{padrao,-16} {string.Join(\", \", recebidas)}\");\n}\n// pedido.*         pedido.criado\n// pedido.#         pedido.criado, pedido.criado.sp, pedido.cancelado.rj\n// pedido.criado.#  pedido.criado, pedido.criado.sp\n// *.*.sp           pedido.criado.sp, estoque.baixado.sp\n// #                pedido.criado, pedido.criado.sp, pedido.cancelado.rj, estoque.baixado.sp",
                    },
                    {
                        type: "table",
                        value: "[[\"Binding\", \"`pedido.criado`\", \"`pedido.criado.sp`\", \"`pedido.cancelado.rj`\", \"`estoque.baixado.sp`\"], [\"`pedido.*`\", \"sim\", \"não\", \"não\", \"não\"], [\"`pedido.#`\", \"sim\", \"sim\", \"sim\", \"não\"], [\"`pedido.criado.#`\", \"sim\", \"sim\", \"não\", \"não\"], [\"`*.*.sp`\", \"não\", \"sim\", \"não\", \"sim\"], [\"`#`\", \"sim\", \"sim\", \"sim\", \"sim\"]]",
                    },
                    {
                        type: "text",
                        value: "## Os enganos mais comuns com topic\n\n- **Ler `*` como \"qualquer coisa\".** `pedido.*` não recebe `pedido.criado.sp`: o asterisco cobre uma palavra, e sobram duas. Quem quer todo o resto da chave usa `#`.\n- **Esquecer que `#` aceita zero palavras.** `pedido.criado.#` recebe também `pedido.criado`, e `pedido.#.sp` recebe `pedido.sp`. Às vezes é o que se quer; às vezes é surpresa.\n- **Maiúsculas.** Como na direct, `Pedido.criado` não casa com `pedido.*`.\n- **Achar que o padrão mais específico ganha.** Não há prioridade entre bindings: a topic entrega a **toda** fila que casa.",
                    },
                    {
                        type: "quote",
                        value: "Fanout copia para toda fila ligada, sem olhar chave nenhuma; topic casa padrões em que `*` vale uma palavra e `#` vale zero ou mais. Nos dois casos, a cópia é por fila, nunca por consumidor.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma exchange fanout tem três filas ligadas, cada uma com uma binding key diferente. O produtor publica com a routing key `preco.alterado`. Quem recebe?",
                        difficulty: "facil",
                        options: [
                            { text: "Só a fila cuja binding key for igual a preco.alterado, se houver uma", isCorrect: false },
                            { text: "Uma das três, escolhida em rodízio a cada nova mensagem que chega", isCorrect: false },
                            { text: "Nenhuma, porque a fanout só entrega mensagens com a routing key vazia", isCorrect: false },
                            { text: "As três filas, porque a fanout não olha routing key nem binding key", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Numa exchange topic, o que significam os curingas `*` e `#` na binding key?",
                        difficulty: "facil",
                        options: [
                            { text: "`*` casa com exatamente uma palavra, e `#` casa com zero ou mais palavras", isCorrect: true },
                            { text: "`*` casa com qualquer sequência de letras, e `#` casa só com números", isCorrect: false },
                            { text: "`*` casa com uma ou mais palavras, e `#` casa com a última palavra da chave", isCorrect: false },
                            { text: "`*` casa com zero ou mais palavras, e `#` casa com exatamente uma palavra", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa exchange topic, a fila `x` está ligada com `pedido.*` e a fila `y`, com `pedido.#`. O produtor publica com a routing key `pedido.criado.sp`. Quem recebe?",
                        difficulty: "medio",
                        options: [
                            { text: "As duas filas, porque os dois padrões começam com a palavra pedido", isCorrect: false },
                            { text: "Nenhuma das duas, porque a chave tem mais palavras que os padrões", isCorrect: false },
                            { text: "Só a fila x, porque o padrão mais específico tem prioridade na topic", isCorrect: false },
                            { text: "Só a fila y, porque o asterisco cobre uma palavra e ali sobram duas", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Quatro instâncias da API consomem da mesma fila durável `invalida-cache`, ligada a uma exchange fanout. Chega um evento de preço alterado. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "Só uma recebe; a correção é trocar a fanout por uma topic com o binding `#`", isCorrect: false },
                            { text: "As quatro recebem, porque a fanout copia a mensagem para cada consumidor ligado", isCorrect: false },
                            { text: "As quatro recebem, desde que a mensagem seja publicada como persistente", isCorrect: false },
                            { text: "Só uma recebe; cada instância precisa de uma fila própria ligada à fanout", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Numa exchange topic, qual binding key recebe as mensagens com routing key `pedido.criado` e `pedido.criado.sp`, mas não recebe `pedido.cancelado`?",
                        difficulty: "dificil",
                        options: [
                            { text: "`pedido.criado.#`", isCorrect: true },
                            { text: "`pedido.#`", isCorrect: false },
                            { text: "`*.criado`", isCorrect: false },
                            { text: "`pedido.criado.*`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Headers exchange e a escolha do tipo",
                blocks: [
                    {
                        type: "text",
                        value: "# Headers exchange e a escolha do tipo\n\nUm serviço gera documentos, e cada documento tem formato, idioma e urgência. A impressão quer só PDF em português; a triagem quer tudo o que for urgente ou XML. Dá para espremer isso numa routing key (`pdf.pt.urgente`), mas a ordem das palavras vira contrato, e um atributo novo quebra todos os padrões. A **headers exchange** roteia por atributos com nome, levados nos headers da mensagem. Com ela, os quatro tipos estão na mesa. Falta o critério para escolher entre eles, e um recurso que deixa a topologia crescer sem tocar nos produtores: ligar uma exchange em outra.",
                    },
                    {
                        type: "text",
                        value: "## Como a headers exchange decide\n\nA headers exchange ignora a routing key. O binding traz **argumentos**: pares de nome e valor que precisam aparecer nos headers da mensagem, mais o argumento `x-match`, que diz como combiná-los:\n\n- `all` (o padrão, se `x-match` faltar): todos os pares precisam bater;\n- `any`: basta um par bater.\n\nHeaders a mais na mensagem não atrapalham. Texto e número não se misturam: o texto `\"2\"` não casa com o número `2`. E texto é comparado exatamente, com maiúsculas: `PDF` não casa com `pdf`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: roteamento por headers\nusing System.Text;\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\nawait using IConnection conexao = await factory.CreateConnectionAsync();\nawait using IChannel canal = await conexao.CreateChannelAsync();\n\nawait canal.ExchangeDeclareAsync(\"documentos\", ExchangeType.Headers, durable: true);\n\n// fila => argumentos do binding (x-match diz como combinar as condições)\nvar bindings = new Dictionary<string, Dictionary<string, object?>>\n{\n    [\"impressao-pt\"] = new() { [\"x-match\"] = \"all\", [\"formato\"] = \"pdf\", [\"idioma\"] = \"pt\" },\n    [\"triagem\"] = new() { [\"x-match\"] = \"any\", [\"urgente\"] = \"sim\", [\"formato\"] = \"xml\" },\n};\nforeach (var (fila, argumentos) in bindings)\n{\n    await canal.QueueDeclareAsync(fila, durable: true, exclusive: false, autoDelete: false);\n    await canal.QueuePurgeAsync(fila); // começa do zero a cada execução\n    await canal.QueueBindAsync(fila, \"documentos\", routingKey: \"\", arguments: argumentos);\n}\n\n// documento => headers da mensagem (a routing key é ignorada por este tipo)\nvar documentos = new Dictionary<string, Dictionary<string, object?>>\n{\n    [\"contrato\"] = new() { [\"formato\"] = \"pdf\", [\"idioma\"] = \"pt\" },\n    [\"invoice\"] = new() { [\"formato\"] = \"pdf\", [\"idioma\"] = \"en\", [\"urgente\"] = \"sim\" },\n    [\"nfe\"] = new() { [\"formato\"] = \"xml\", [\"idioma\"] = \"pt\" },\n    [\"boleto\"] = new() { [\"formato\"] = \"pdf\", [\"idioma\"] = \"pt\", [\"urgente\"] = \"sim\" },\n};\nforeach (var (nome, headers) in documentos)\n{\n    var props = new BasicProperties { Headers = headers };\n    await canal.BasicPublishAsync(\"documentos\", routingKey: \"\", mandatory: false,\n        basicProperties: props, body: Encoding.UTF8.GetBytes(nome));\n}\n\nawait Task.Delay(500); // sem confirms: espera o broker rotear antes de olhar\nforeach (var fila in bindings.Keys)\n{\n    var recebidos = new List<string>();\n    while (await canal.BasicGetAsync(fila, autoAck: true) is { } msg)\n        recebidos.Add(Encoding.UTF8.GetString(msg.Body.Span));\n    Console.WriteLine($\"{fila,-13} {string.Join(\", \", recebidos)}\");\n}\n// impressao-pt  contrato, boleto\n// triagem       invoice, nfe, boleto",
                    },
                    {
                        type: "text",
                        value: "## A pegadinha do prefixo `x-`\n\nNos modos `all` e `any`, os pares do binding cujo nome começa com `x-` **ficam fora da comparação**. Muita gente traz o costume dos headers do HTTP e liga uma fila com `x-match = all` e `x-tenant = loja-a`: o binding fica sem nenhuma condição válida, e a fila passa a receber **todas** as mensagens da exchange, de qualquer tenant. Para nomes com `x-` contarem, use `all-with-x` ou `any-with-x`; mais simples ainda, não use esse prefixo nos seus headers. Já o valor de `x-match` é validado: um valor fora desses quatro faz o broker recusar o binding com `PRECONDITION_FAILED`.",
                    },
                    {
                        type: "text",
                        value: "## Exchange ligada em exchange\n\nO RabbitMQ estende o AMQP 0.9.1 com bindings de **exchange para exchange**: `ExchangeBindAsync(destination, source, routingKey)` faz a exchange de origem rotear também para a de destino, que então aplica as próprias regras. Daí nasce a **exchange de passagem**: os produtores publicam numa entrada estável, e a topologia atrás dela se reorganiza sem que nenhum produtor mude. Um time ganha uma exchange só sua, ligada à entrada por um padrão, e pendura nela as filas que quiser.\n\nAtenção à ordem dos parâmetros: **o destino vem primeiro**. Invertidos, eles criam o caminho ao contrário, sem erro nenhum; argumentos nomeados, como no exemplo, evitam o engano. E se a mesma fila for alcançada por dois caminhos, ela recebe uma cópia só.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: exchange de passagem\nusing System.Text;\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\nawait using IConnection conexao = await factory.CreateConnectionAsync();\nawait using IChannel canal = await conexao.CreateChannelAsync();\n\n// \"loja\" é a entrada única dos produtores; \"financeiro\" pertence ao time financeiro\nawait canal.ExchangeDeclareAsync(\"loja\", ExchangeType.Topic, durable: true);\nawait canal.ExchangeDeclareAsync(\"financeiro\", ExchangeType.Fanout, durable: true);\n\n// Tudo que entra em \"loja\" com chave pedido.# passa também por \"financeiro\"\nawait canal.ExchangeBindAsync(destination: \"financeiro\", source: \"loja\", routingKey: \"pedido.#\");\n\n// Cada time pendura as próprias filas, sem tocar nos produtores\nawait canal.QueueDeclareAsync(\"conciliacao\", durable: true, exclusive: false, autoDelete: false);\nawait canal.QueueBindAsync(\"conciliacao\", \"financeiro\", routingKey: \"\");\nawait canal.QueueDeclareAsync(\"separacao\", durable: true, exclusive: false, autoDelete: false);\nawait canal.QueueBindAsync(\"separacao\", \"loja\", routingKey: \"pedido.criado\");\nawait canal.QueuePurgeAsync(\"conciliacao\"); // começa do zero a cada execução\nawait canal.QueuePurgeAsync(\"separacao\");\n\nforeach (var chave in new[] { \"pedido.criado\", \"pedido.cancelado\", \"estoque.baixado\" })\n    await canal.BasicPublishAsync(\"loja\", chave, Encoding.UTF8.GetBytes(chave));\n\nawait Task.Delay(500); // sem confirms: espera o broker rotear antes de contar\nConsole.WriteLine($\"conciliacao: {await canal.MessageCountAsync(\"conciliacao\")}\");\nConsole.WriteLine($\"separacao: {await canal.MessageCountAsync(\"separacao\")}\");\n// conciliacao: 2   (pedido.criado e pedido.cancelado, pelo caminho loja > financeiro)\n// separacao: 1     (só pedido.criado; estoque.baixado não casou com nada)",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\", \"Roteia por\", \"Uso típico\", \"Cuidado\"], [\"default (`\\\"\\\"`)\", \"nome da fila, na routing key\", \"comando para uma fila conhecida; resposta de request/reply\", \"não aceita binding: um segundo destino exige mudar o produtor\"], [\"direct\", \"routing key igual à binding key\", \"valor discreto: severidade, canal de envio, tipo de comando\", \"sem curinga; diferencia maiúsculas\"], [\"fanout\", \"nada: toda fila ligada recebe\", \"aviso para todos: cache, configuração\", \"uma fila por interessado, nunca compartilhada\"], [\"topic\", \"padrão com `*` e `#` sobre palavras\", \"eventos de domínio com recortes variados\", \"o formato da chave vira contrato\"], [\"headers\", \"pares nos headers, conforme o `x-match`\", \"atributos sem ordem natural, combinados com e/ou\", \"nomes com `x-` ignorados em `all` e `any`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Como escolher\n\nComece pela pergunta \"quem decide quem recebe?\":\n\n1. Todo interessado recebe tudo: **fanout**.\n2. Um valor discreto decide, e ninguém vai precisar de padrão: **direct**.\n3. Os eventos têm hierarquia e cada consumidor quer um recorte: **topic**. É a escolha mais comum para eventos de domínio, porque com chaves exatas ela já se comporta como direct e deixa espaço para padrões depois.\n4. A decisão depende de atributos sem ordem natural, combinados com \"e\" ou \"ou\": **headers**, pouco usada na prática.\n\nA default exchange fica para o destino único e conhecido. Em qualquer caso, a exchange é escolha de quem publica, e os bindings são escolha de quem consome.",
                    },
                    {
                        type: "quote",
                        value: "A headers exchange casa pares de nome e valor conforme o `x-match` e ignora nomes com `x-` nos modos `all` e `any`. A escolha do tipo começa pela pergunta de quem decide quem recebe, e a exchange de passagem deixa a topologia mudar sem que os produtores mudem junto.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa headers exchange, o que decide para quais filas a mensagem vai?",
                        difficulty: "facil",
                        options: [
                            { text: "Os headers da mensagem, comparados com os argumentos de cada binding", isCorrect: true },
                            { text: "O corpo da mensagem, lido como JSON e comparado campo a campo", isCorrect: false },
                            { text: "A routing key, comparada com padrões que usam asterisco e cerquilha", isCorrect: false },
                            { text: "O ContentType da mensagem, comparado com o tipo declarado em cada fila", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Os eventos de uma loja usam a routing key `entidade.evento.estado`, como `pedido.criado.sp`. O financeiro quer todo pedido criado, a logística quer tudo de SP e a auditoria quer tudo. Cada fila deve receber só o próprio recorte, sem listar nos bindings cada combinação de chave. Qual tipo de exchange atende?",
                        difficulty: "facil",
                        options: [
                            { text: "Headers, com `x-match = any` comparando a routing key", isCorrect: false },
                            { text: "Direct, com bindings como `pedido.criado.*`, `*.*.sp` e `#`", isCorrect: false },
                            { text: "Fanout, com cada consumidor descartando o que não quiser", isCorrect: false },
                            { text: "Topic, com bindings como `pedido.criado.*`, `*.*.sp` e `#`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um binding numa headers exchange tem `x-match = all`, `formato = pdf` e `idioma = pt`. Chega uma mensagem cujo único header é `formato = pdf`. Ela chega à fila? E se o binding usasse `x-match = any`?",
                        difficulty: "medio",
                        options: [
                            { text: "Não chega com all nem com any, porque falta o header idioma", isCorrect: false },
                            { text: "Com all não chega, porque falta o idioma; com any chegaria", isCorrect: true },
                            { text: "Com all chega só se a routing key também for igual a pdf", isCorrect: false },
                            { text: "Com all chega, porque o único header presente bate com o binding", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A exchange topic `loja` está ligada à exchange fanout `financeiro` por `ExchangeBindAsync(destination: \"financeiro\", source: \"loja\", routingKey: \"pedido.#\")`. A fila `conciliacao` está ligada a `financeiro`, e a fila `separacao` está ligada a `loja` com `pedido.criado`. O produtor publica em `loja` as chaves `pedido.criado`, `pedido.cancelado` e `estoque.baixado`. Quantas mensagens ficam em cada fila?",
                        difficulty: "medio",
                        options: [
                            { text: "conciliacao com 0 e separacao com 1", isCorrect: false },
                            { text: "conciliacao com 2 e separacao com 1", isCorrect: true },
                            { text: "conciliacao com 3 e separacao com 1", isCorrect: false },
                            { text: "conciliacao com 2 e separacao com 2", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa headers exchange, a fila `faturas-loja-a` foi ligada com os argumentos `x-match = all` e `x-tenant = loja-a`. Os produtores publicam faturas de vários tenants, cada uma com o header `x-tenant`. O que essa fila recebe?",
                        difficulty: "dificil",
                        options: [
                            { text: "Nada, porque o broker recusa um binding com argumento `x-` que ele não conhece", isCorrect: false },
                            { text: "Nenhuma fatura, porque headers que começam com `x-` são removidos na entrega", isCorrect: false },
                            { text: "As faturas de todos os tenants, porque `all` ignora nomes que começam com `x-`", isCorrect: true },
                            { text: "Só as faturas com `x-tenant` igual a `loja-a`, que é o efeito esperado do binding", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "A mensagem",
                blocks: [
                    {
                        type: "text",
                        value: "# A mensagem\n\nO consumidor recebe um punhado de bytes e precisa responder a algumas perguntas antes de processar: isso é JSON? De que versão? Já vi essa mensagem antes? Ela ainda vale? A mensagem do AMQP 0.9.1 tem duas partes para isso: o **corpo**, que o broker nunca abre, e as **propriedades**, um conjunto fixo de campos que o broker e o consumidor leem sem desserializar nada. No cliente 7.x, as propriedades são a classe `BasicProperties`.",
                    },
                    {
                        type: "text",
                        value: "## O corpo são bytes, e o formato é seu\n\nO `body` do `BasicPublishAsync` é um `ReadOnlyMemory<byte>`. O broker não valida, não converte e não comprime: um XML publicado com `ContentType = \"application/json\"` é entregue do jeito que saiu. Serializar e desserializar é trabalho das pontas. No .NET, o caminho direto é `JsonSerializer.SerializeToUtf8Bytes` na publicação e `JsonSerializer.Deserialize` sobre `Body.Span` na leitura.\n\nO erro comum é cada ponta decidir o formato por conta própria: o produtor muda o nome de um campo ou a codificação do texto, e o consumidor quebra sem que o broker perceba nada. O `ContentType` existe para o consumidor saber como ler, e só ajuda se as duas pontas o respeitarem.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: uma mensagem com as propriedades preenchidas, e a leitura de volta\nusing System.Text;\nusing System.Text.Json;\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\nawait using IConnection conexao = await factory.CreateConnectionAsync();\nawait using IChannel canal = await conexao.CreateChannelAsync();\n\n// A mesma topologia da primeira aula do módulo\nawait canal.ExchangeDeclareAsync(\"pedidos\", ExchangeType.Topic, durable: true);\nawait canal.QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false, autoDelete: false);\nawait canal.QueueBindAsync(\"faturamento\", \"pedidos\", \"pedido.criado\");\nawait canal.QueuePurgeAsync(\"faturamento\"); // começa do zero a cada execução\n\nbyte[] corpo = JsonSerializer.SerializeToUtf8Bytes(new PedidoCriado(PedidoId: 42, Itens: 3));\n\nvar props = new BasicProperties\n{\n    ContentType = \"application/json\",\n    MessageId = Guid.CreateVersion7().ToString(), // identidade desta mensagem\n    CorrelationId = \"checkout-7f3a\",              // o fluxo a que ela pertence\n    Type = \"pedido-criado.v1\",\n    AppId = \"loja-api\",\n    Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds()),\n    Headers = new Dictionary<string, object?> { [\"origem\"] = \"loja-web\", [\"tentativa\"] = 1 },\n    Persistent = true,                            // gravar em disco (vale em fila durável)\n    Expiration = \"60000\",                         // milissegundos, em texto\n};\nawait canal.BasicPublishAsync(exchange: \"pedidos\", routingKey: \"pedido.criado\",\n    mandatory: false, basicProperties: props, body: corpo);\n\n// Leitura mínima, só para inspecionar o que chegou\nawait Task.Delay(500);\nBasicGetResult? msg = await canal.BasicGetAsync(\"faturamento\", autoAck: true);\nif (msg is null) return;\n\nIReadOnlyBasicProperties p = msg.BasicProperties;\nPedidoCriado? pedido = JsonSerializer.Deserialize<PedidoCriado>(msg.Body.Span);\nConsole.WriteLine($\"{p.Type} de {p.AppId}, correlação {p.CorrelationId}\");\nConsole.WriteLine($\"pedido {pedido?.PedidoId}, persistente {p.Persistent}, expira em {p.Expiration} ms\");\n\n// Header de texto volta como byte[]; número volta como número\nobject? origem = p.Headers?[\"origem\"];\nobject? tentativa = p.Headers?[\"tentativa\"];\nConsole.WriteLine($\"origem: {origem?.GetType().Name}, tentativa: {tentativa?.GetType().Name}\");\nConsole.WriteLine($\"origem decodificada: {Encoding.UTF8.GetString((byte[])origem!)}\");\n// pedido-criado.v1 de loja-api, correlação checkout-7f3a\n// pedido 42, persistente True, expira em 60000 ms\n// origem: Byte[], tentativa: Int32\n// origem decodificada: loja-web\n\nrecord PedidoCriado(int PedidoId, int Itens);",
                    },
                    {
                        type: "table",
                        value: "[[\"Propriedade\", \"Para que serve\", \"Cuidado\"], [\"`ContentType`\", \"formato do corpo, como `application/json`\", \"o broker não confere\"], [\"`ContentEncoding`\", \"compressão do corpo, como `gzip`\", \"o broker não descompacta\"], [\"`MessageId`\", \"identidade da mensagem, para deduplicar\", \"o cliente não gera e o broker não deduplica\"], [\"`CorrelationId`\", \"liga as mensagens de um mesmo fluxo, ou a resposta ao pedido\", \"não identifica a mensagem\"], [\"`Headers`\", \"pares de nome e valor livres\", \"texto volta como `byte[]` no cliente .NET\"], [\"`Persistent`\", \"pede gravação em disco (`DeliveryMode` 2)\", \"só protege se a fila for durável\"], [\"`Expiration`\", \"validade em milissegundos\", \"é texto: `\\\"60000\\\"`, não `60`\"], [\"`Type`, `AppId`, `Timestamp`\", \"tipo do evento, quem publicou, quando\", \"`Timestamp` em segundos desde 1970\"], [\"`UserId`\", \"usuário que publicou\", \"se preenchido, tem que ser o usuário da conexão\"]]",
                    },
                    {
                        type: "text",
                        value: "## MessageId e CorrelationId\n\nO **MessageId** identifica a mensagem. O cliente não gera um (sem você preencher, ele vai vazio) e o broker não usa para nada: publicar duas vezes com o mesmo MessageId põe duas mensagens na fila. Ele existe para o consumidor reconhecer repetição e não aplicar o mesmo efeito duas vezes. Por isso, gere o id **na origem, uma vez por evento**, e reaproveite o mesmo id quando reenviar aquele evento. Muita gente gera um `Guid` novo a cada tentativa de publicação, e a deduplicação do consumidor nunca encontra nada.\n\nO **CorrelationId** responde a outra pergunta: a que fluxo esta mensagem pertence? Todas as mensagens disparadas pelo mesmo checkout podem levar o mesmo CorrelationId, e em request/reply a resposta copia o CorrelationId do pedido. Ele não precisa ser único por mensagem; o MessageId precisa.",
                    },
                    {
                        type: "text",
                        value: "## Headers: o que não cabe nas propriedades fixas\n\nO dicionário `Headers` (`IDictionary<string, object?>`) leva metadados livres: origem, tenant, versão do esquema, contexto de rastreamento. A headers exchange roteia por eles, e o consumidor lê sem abrir o corpo.\n\nA pegadinha do cliente .NET está na volta: **texto publicado como `string` chega como `byte[]`**, porque o AMQP guarda texto como sequência de bytes. Um `(string)headers[\"origem\"]` lança `InvalidCastException`; o certo é `Encoding.UTF8.GetString((byte[])valor)`, como no exemplo. Números e booleanos voltam como número e booleano (`int`, `long`, `bool`), o que deixa a diferença ainda mais fácil de esquecer.",
                    },
                    {
                        type: "text",
                        value: "## Persistência e Expiration\n\n`Persistent = true` (o mesmo que `DeliveryMode = DeliveryModes.Persistent`) pede ao broker que grave a mensagem em disco. Só protege se a fila também for durável; o que sobrevive a um restart, e em que condições, fica para o estudo de confiabilidade.\n\n`Expiration` dá prazo de validade à mensagem, em **milissegundos, num texto**: `\"60000\"` é um minuto, e `\"60\"` são 60 milissegundos. Qualquer coisa que não seja um inteiro de zero para cima (`\"30s\"`, `\"1.5\"`, `\"-1\"`) faz o broker fechar o canal com `PRECONDITION_FAILED`. Se a fila também tiver TTL (o argumento `x-message-ttl`), vale o menor dos dois.\n\nMensagem vencida nunca é entregue, mas ela **só sai da fila quando chega à frente**. Uma mensagem de 1 segundo que entrou atrás de uma de 1 minuto continua na contagem da fila até a da frente sair. Quem monitora fila com TTL por mensagem precisa lembrar disso.",
                    },
                    {
                        type: "quote",
                        value: "O corpo são bytes que o broker não abre; as propriedades dizem formato, identidade, fluxo e validade da mensagem. MessageId gerado uma vez na origem, header de texto lido como `byte[]` e Expiration em milissegundos evitam os três tropeços mais comuns.",
                    },
                ],
                questions: [
                    {
                        statement: "O produtor publica um corpo em XML com `ContentType = \"application/json\"`. O que o broker faz?",
                        difficulty: "facil",
                        options: [
                            { text: "Entrega, mas troca o ContentType para application/xml ao detectar XML", isCorrect: false },
                            { text: "Converte o XML para JSON antes de pôr a mensagem na fila de destino", isCorrect: false },
                            { text: "Entrega normalmente, porque o corpo são bytes que ele não abre nem valida", isCorrect: true },
                            { text: "Recusa a publicação, porque o corpo não é um JSON válido para esse ContentType", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual valor de `Expiration` faz a mensagem vencer em 30 segundos?",
                        difficulty: "facil",
                        options: [
                            { text: "`\"30000\"`", isCorrect: true },
                            { text: "`\"30\"`", isCorrect: false },
                            { text: "`\"30s\"`", isCorrect: false },
                            { text: "`\"00:00:30\"`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de um timeout, o produtor reenvia o mesmo evento com o mesmo `MessageId`, e as duas publicações chegam ao broker. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "A segunda substitui a primeira, e a fila fica só com a versão mais recente", isCorrect: false },
                            { text: "O broker recusa a segunda com `PRECONDITION_FAILED` e fecha o canal do produtor", isCorrect: false },
                            { text: "As duas entram na fila; detectar repetição pelo MessageId cabe ao consumidor", isCorrect: true },
                            { text: "A segunda é descartada, porque aquele MessageId já existe na fila de destino", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O produtor publicou com `Headers = new Dictionary<string, object?> { [\"origem\"] = \"loja-web\" }`. No consumidor, a linha abaixo lança `InvalidCastException`. Por quê?\n\n```csharp\nvar origem = (string)ea.BasicProperties.Headers![\"origem\"]!;\n```",
                        difficulty: "medio",
                        options: [
                            { text: "O texto chega como `JsonElement`, porque o cliente serializa os headers em JSON", isCorrect: false },
                            { text: "O texto chega como `char[]`, porque o AMQP guarda string como lista de caracteres", isCorrect: false },
                            { text: "O texto chega como `byte[]` no cliente .NET e precisa ser decodificado em UTF-8", isCorrect: true },
                            { text: "O texto chega como `ReadOnlyMemory<byte>`, o mesmo tipo usado no corpo da mensagem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa fila sem consumidores, entra primeiro a mensagem A, com `Expiration = \"60000\"`, e logo depois a B, com `Expiration = \"1000\"`. Após cinco segundos, quantas mensagens a fila mostra, e o que recebe quem consumir em seguida?",
                        difficulty: "dificil",
                        options: [
                            { text: "Mostra 2; quem consumir recebe a A e depois a B, que ainda estava na fila", isCorrect: false },
                            { text: "Mostra 2; quem consumir recebe a B primeiro, porque a que vence antes sai antes", isCorrect: false },
                            { text: "Mostra 2; quem consumir recebe só a A, e a B é descartada ao chegar à frente", isCorrect: true },
                            { text: "Mostra 1; a B saiu ao vencer, mesmo atrás da A, e quem consumir recebe a A", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Publicando e consumindo em C#",
        aulas: [
            {
                titulo: "O cliente 7.x: conexão, canal e API assíncrona",
                blocks: [
                    {
                        type: "text",
                        value: "# O cliente 7.x: conexão, canal e API assíncrona\n\nUm serviço de pedidos começa a publicar eventos, e alguém escreve o caminho mais curto: dentro do método que publica, abre uma conexão, abre um canal, publica e fecha tudo. No teste funciona. Em produção, cada pedido paga o handshake TCP, a negociação do AMQP e, com TLS, mais idas e voltas, enquanto o painel do broker mostra conexões nascendo e morrendo sem parar.\n\nNo laboratório desta aula (RabbitMQ 4.3 num contêiner local, sem TLS e sem rede de verdade no caminho), 300 publicações levaram cerca de **1,1 segundo** abrindo uma conexão por mensagem e **7 milissegundos** reaproveitando a mesma conexão e o mesmo canal. Com TLS e latência de rede, a diferença só cresce.\n\nO cliente oficial para .NET, o pacote `RabbitMQ.Client`, gira em torno de dois objetos:\n\n- **`IConnection`**: a conexão TCP com o broker. Cara de abrir, feita para durar a vida inteira do processo.\n- **`IChannel`**: o canal, uma sessão leve que trafega dentro da conexão. Uma conexão carrega muitos canais, e quase tudo (declarar, publicar, consumir, confirmar) acontece num canal.\n\nO programa abaixo é o mínimo completo na linha 7.x, a atual (em outubro de 2026, a versão mais recente era a 7.2.2).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (RabbitMQ.Client 7.x)\nusing System.Text;\nusing RabbitMQ.Client;\n\nvar fabrica = new ConnectionFactory\n{\n    HostName = \"localhost\",             // porta padrão: 5672\n    ClientProvidedName = \"pedidos-api\", // nome que aparece no painel de gerenciamento\n};\n\n// Uma conexão para o processo inteiro\nawait using IConnection conexao = await fabrica.CreateConnectionAsync();\n\n// Um canal por uso concorrente; aqui só há um\nawait using IChannel canal = await conexao.CreateChannelAsync();\n\nawait canal.QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false,\n    autoDelete: false, arguments: null);\n\nbyte[] corpo = Encoding.UTF8.GetBytes(\"\"\"{\"pedidoId\":42}\"\"\");\nawait canal.BasicPublishAsync(exchange: \"\", routingKey: \"faturamento\", body: corpo);",
                    },
                    {
                        type: "text",
                        value: "## O que mudou do 6.x para o 7.x\n\nA versão 7.0 refez a API pública e o interior da biblioteca no modelo assíncrono do .NET (TAP): todo método que conversa com o broker termina em `Async` e é aguardado com `await`. No 6.x as chamadas eram síncronas, e quem declarava uma fila ou esperava uma confirmação ficava com a thread parada até a resposta chegar. Numa API ASP.NET Core sob carga, thread parada esperando rede é o caminho clássico para esgotar o pool de threads (thread pool starvation): as requisições passam a esperar por thread livre, não por trabalho.\n\nJunto veio uma faxina de nomes. O `IModel` virou `IChannel`, as propriedades da mensagem viraram a classe `BasicProperties` (criada com `new`), e o consumidor síncrono deixou de existir. Muito material na internet ainda é do 6.x, então vale reconhecer a API antiga quando ela aparecer:",
                    },
                    {
                        type: "table",
                        value: "[[\"O que\", \"6.x (API antiga)\", \"7.x (atual)\"], [\"Abrir a conexão\", \"`fabrica.CreateConnection()`\", \"`await fabrica.CreateConnectionAsync()`\"], [\"Canal\", \"`IModel`, criado com `conexao.CreateModel()`\", \"`IChannel`, criado com `await conexao.CreateChannelAsync()`\"], [\"Propriedades\", \"`canal.CreateBasicProperties()`\", \"`new BasicProperties { ... }`\"], [\"Publicar\", \"`canal.BasicPublish(...)`\", \"`await canal.BasicPublishAsync(...)`\"], [\"Consumidor\", \"`EventingBasicConsumer` (síncrono), ou `AsyncEventingBasicConsumer` com `DispatchConsumersAsync = true` e o evento `Received`\", \"Só o `AsyncEventingBasicConsumer`, com o evento `ReceivedAsync`\"], [\"Ack\", \"`canal.BasicAck(tag, false)`\", \"`await canal.BasicAckAsync(tag, false)`\"]]",
                    },
                    {
                        type: "text",
                        value: "Um tropeço comum na migração é trocar `canal.BasicPublish(...)` por `canal.BasicPublishAsync(...).GetAwaiter().GetResult()` para não mexer no resto do código. Compila, mas devolve o problema que a versão 7 resolveu: sempre que a operação precisa esperar a rede (a resposta de uma declaração, uma publicação travada porque o broker bloqueou a conexão), a thread fica parada. Assíncrono vai até a ponta: `async` no endpoint, no serviço e no handler do consumidor.\n\n## Conexão: uma por processo, aberta uma vez\n\nA documentação do cliente é direta: conexões são feitas para durar, e abrir uma por operação (por mensagem publicada, por exemplo) é desnecessário e fortemente desaconselhado. Na prática:\n\n- Abra a conexão na subida da aplicação e guarde num singleton. A recuperação automática depois de queda de rede (`AutomaticRecoveryEnabled`) já vem ligada; os detalhes ficam para mais adiante na trilha.\n- Dê um nome com `ClientProvidedName`. Quando uma fila trava e você abre o painel (porta 15672) para ver quem está conectado, \"pedidos-api\" diz muito mais que um IP e uma porta.\n- Cada conexão custa memória e processos no broker, além de um descritor de arquivo no servidor. Com conexão por requisição, cada pico de tráfego vira um pico de conexões abrindo e fechando no broker.",
                    },
                    {
                        type: "text",
                        value: "## Canal: um por uso concorrente\n\nO canal é barato, mas não é de graça. Abrir e fechar um canal por mensagem, mesmo reaproveitando a conexão, levou cerca de **290 milissegundos** para as mesmas 300 publicações do laboratório (contra 7 reaproveitando o canal). Canal também é feito para durar.\n\nO que o canal não aceita é uso simultâneo por várias threads. A documentação do 7.x trata isso como requisito duro para quem publica: **um canal não é compartilhado entre threads que publicam nele**. A regra prática:\n\n- **Um canal por consumidor**: cada `BasicConsumeAsync` no seu próprio canal.\n- **Um canal por fluxo de publicação concorrente**, ou um canal só com acesso serializado, uma chamada de cada vez, como no publicador abaixo.\n\nHá um segundo motivo para não espalhar o mesmo canal pelo código: **erro de protocolo fecha o canal inteiro**. No laboratório, uma parte do código pediu a declaração passiva de uma fila que não existia; o broker respondeu 404 NOT_FOUND e fechou o canal. A outra parte, que só queria publicar e não tinha feito nada de errado, recebeu `AlreadyClosedException`. A conexão continuou aberta: o estrago ficou com quem dividia aquele canal.",
                    },
                    {
                        type: "code",
                        value: "// PublicadorDePedidos.cs: um canal só, usado por uma chamada de cada vez\nusing RabbitMQ.Client;\n\npublic sealed class PublicadorDePedidos : IAsyncDisposable\n{\n    private readonly IChannel _canal;\n    private readonly SemaphoreSlim _umDeCadaVez = new(1, 1); // lock não aceita await dentro\n\n    private PublicadorDePedidos(IChannel canal) => _canal = canal;\n\n    public static async Task<PublicadorDePedidos> CriarAsync(IConnection conexao) =>\n        new(await conexao.CreateChannelAsync());\n\n    public async Task PublicarAsync(string routingKey, ReadOnlyMemory<byte> corpo,\n        CancellationToken ct = default)\n    {\n        await _umDeCadaVez.WaitAsync(ct);\n        try\n        {\n            await _canal.BasicPublishAsync(\"pedidos\", routingKey, corpo, ct);\n        }\n        finally\n        {\n            _umDeCadaVez.Release();\n        }\n    }\n\n    public async ValueTask DisposeAsync()\n    {\n        await _canal.CloseAsync();\n        _umDeCadaVez.Dispose();\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "O `SemaphoreSlim` garante uma publicação por vez no canal; `lock` não serve porque não aceita `await` dentro. No laboratório, 50 tarefas publicando 20 mensagens cada pelo mesmo publicador colocaram as 1000 mensagens na fila, sem erro. Para volume muito alto, o passo seguinte é um pequeno conjunto (pool) de canais, cada um usado por uma chamada de cada vez.\n\n## Armadilha de quem copia exemplo antigo\n\nO tutorial clássico declara a fila com `durable: false, exclusive: false`. **Desde o RabbitMQ 4.3, essa combinação (o recurso depreciado `transient_nonexcl_queues`) vem negada por padrão**, e o efeito não é pequeno: no laboratório, o broker respondeu 541 INTERNAL_ERROR e **fechou a conexão inteira**, levando junto todos os canais dela. Fila que precisa durar é durável; fila temporária, só exclusiva.",
                    },
                    {
                        type: "quote",
                        value: "No 7.x tudo é assíncrono, do `CreateConnectionAsync` ao ack: uma conexão longa por processo, um canal para cada uso concorrente e `await` até a ponta. Como erro de protocolo derruba o canal inteiro, canal não se espalha pelo código.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que o `RabbitMQ.Client` 7.x deixou de ter métodos síncronos?",
                        difficulty: "facil",
                        options: [
                            { text: "Porque o RabbitMQ 4.x passou a recusar as chamadas síncronas do AMQP 0.9.1", isCorrect: false },
                            { text: "Porque o AMQP 1.0, que entrou no núcleo do RabbitMQ 4, exige clientes assíncronos", isCorrect: false },
                            { text: "Para a espera pela rede não segurar threads, o que esgota o pool sob carga", isCorrect: true },
                            { text: "Para várias threads poderem publicar no mesmo canal sem nenhuma coordenação", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço abre uma conexão nova com o RabbitMQ para cada mensagem que publica e a fecha logo depois. O que a documentação do cliente diz sobre isso?",
                        difficulty: "facil",
                        options: [
                            { text: "É fortemente desaconselhado, porque conexão é feita para durar o processo todo", isCorrect: true },
                            { text: "É o recomendado, porque o broker derruba conexão que fica muito tempo parada", isCorrect: false },
                            { text: "É obrigatório quando cada mensagem vai para uma exchange diferente", isCorrect: false },
                            { text: "É indiferente, porque o cliente 7.x mantém um pool de conexões por baixo dos panos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API ASP.NET Core guarda um único `IChannel` num singleton, e as requisições publicam nele ao mesmo tempo, sem nenhuma coordenação. Como a documentação do cliente 7.x trata esse uso?",
                        difficulty: "medio",
                        options: [
                            { text: "Como problema só com `autoAck`, porque a ordem dos acks depende da thread que publicou cada mensagem", isCorrect: false },
                            { text: "Como aceitável, desde que todas as publicações usem a mesma exchange e a mesma routing key", isCorrect: false },
                            { text: "Como proibido para publicadores: um canal não pode ser usado por várias threads ao mesmo tempo", isCorrect: true },
                            { text: "Como recomendado, porque o cliente 7.x serializa internamente as publicações de cada canal", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Duas partes do código compartilham o mesmo `IChannel`. Uma delas chama `QueueDeclarePassiveAsync` para uma fila que não existe. O que acontece quando a outra parte, em seguida, tenta publicar nesse canal?",
                        difficulty: "medio",
                        options: [
                            { text: "Publica normalmente, porque o 404 só afeta a chamada que pediu a fila inexistente", isCorrect: false },
                            { text: "Perde a conexão inteira, porque todo erro de canal derruba também a conexão", isCorrect: false },
                            { text: "Recebe o mesmo 404, mas o canal se reabre sozinho logo para a chamada seguinte", isCorrect: false },
                            { text: "Recebe `AlreadyClosedException`, porque o 404 fechou o canal para todo mundo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Para não mexer num serviço antigo, um time migra para o cliente 7.x chamando os métodos assíncronos com `.GetAwaiter().GetResult()` dentro de endpoints síncronos do ASP.NET Core. Em carga baixa tudo funciona. O que esperar quando a carga sobe?",
                        difficulty: "dificil",
                        options: [
                            { text: "Threads do pool ficam paradas esperando o broker, e as requisições começam a esperar por thread livre", isCorrect: true },
                            { text: "Nada muda, porque o cliente 7.x percebe a espera síncrona e libera a thread enquanto a rede responde", isCorrect: false },
                            { text: "Deadlock já na primeira requisição, porque o ASP.NET Core tem um SynchronizationContext próprio", isCorrect: false },
                            { text: "O cliente lança `InvalidOperationException` assim que percebe a chamada síncrona sobre a API assíncrona", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Publicando: JSON, propriedades e mandatory",
                blocks: [
                    {
                        type: "text",
                        value: "# Publicando: JSON, propriedades e mandatory\n\nO serviço de pedidos precisa avisar o resto do sistema que um pedido foi criado. Três perguntas aparecem já na primeira linha de código: como transformar o objeto em bytes, como etiquetar a mensagem para quem vai ler, e o que acontece se nenhuma fila estiver ligada à exchange naquele momento.\n\nA terceira é a que machuca em produção. Imagine o primeiro deploy: o serviço de pedidos sobe antes do faturamento, a exchange `pedidos` já existe e a fila do faturamento ainda não. Tudo o que foi publicado nesse intervalo **some, sem erro nenhum**. O código abaixo publica o evento já preparado para esse caso.",
                    },
                    {
                        type: "code",
                        value: "// Publicando o PedidoCriado (conexao é a IConnection longa do processo)\nusing System.Text.Json;\nusing RabbitMQ.Client;\n\nawait using IChannel canal = await conexao.CreateChannelAsync();\n// Aqui entra o handler de BasicReturnAsync, mostrado mais abaixo\nawait canal.ExchangeDeclareAsync(\"pedidos\", ExchangeType.Topic, durable: true);\n\nvar evento = new PedidoCriado(Guid.NewGuid(), \"cliente-42\", 199.90m);\nbyte[] corpo = JsonSerializer.SerializeToUtf8Bytes(evento, JsonSerializerOptions.Web);\n\nvar props = new BasicProperties\n{\n    ContentType = \"application/json\",\n    MessageId = Guid.NewGuid().ToString(),\n    Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds()),\n    Persistent = true,\n};\n\nawait canal.BasicPublishAsync(exchange: \"pedidos\", routingKey: \"pedido.criado\",\n    mandatory: true, basicProperties: props, body: corpo);\n\n// O contrato do evento, o mesmo nas duas pontas\npublic sealed record PedidoCriado(Guid PedidoId, string ClienteId, decimal Total);",
                    },
                    {
                        type: "text",
                        value: "## Bytes, contrato e propriedades\n\n- `JsonSerializer.SerializeToUtf8Bytes` gera o UTF-8 direto, sem passar por `string`, e o resultado vai como `body`.\n- **As duas pontas precisam usar as mesmas opções de JSON.** `JsonSerializerOptions.Web` escreve `pedidoId` e `clienteId` (camelCase) e lê sem diferenciar maiúsculas. No laboratório, esse mesmo JSON lido com as opções padrão do `JsonSerializer`, que procuram `PedidoId` com a caixa exata, não gerou exceção nenhuma: virou um pedido com `Guid` zerado, `ClienteId` nulo e `Total` 0. Erro silencioso assim passa nos testes de cada lado e só aparece com os dois integrados.\n- `ContentType` diz como ler o corpo. `MessageId` dá identidade à mensagem, e é ele que o consumidor vai usar para descartar duplicata, tema de mais adiante na trilha. `Timestamp` registra quando o evento nasceu, em segundos no padrão Unix.\n- `Persistent = true` marca a mensagem como persistente; ela só sobrevive a um restart do broker se a fila também for durável, assunto da parte de confiabilidade.",
                    },
                    {
                        type: "text",
                        value: "## O que o await garante, e o que não garante\n\nSem publisher confirms, o `await` do `BasicPublishAsync` volta quando o cliente aceitou a mensagem para escrever no socket. **Não** quer dizer que o broker recebeu, roteou ou gravou: por padrão, publicar é \"dispare e esqueça\". A resposta do broker para cada mensagem vem com os publisher confirms, ligados na criação do canal e tratados mais adiante na trilha.\n\nEsta aula cuida de outro ponto: a mensagem que chega ao broker e não tem para onde ir. O laboratório conferiu os três casos possíveis.",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação na hora de publicar\", \"Sem `mandatory`\", \"Com `mandatory: true`\"], [\"A exchange existe e algum binding casa com a routing key\", \"Vai para as filas ligadas\", \"Vai para as filas ligadas\"], [\"A exchange existe, mas nenhum binding casa\", \"Descartada em silêncio\", \"Devolvida pelo evento `BasicReturnAsync`, com 312 NO_ROUTE\"], [\"A exchange não existe\", \"O broker fecha o canal com 404 NOT_FOUND\", \"O broker fecha o canal com 404 NOT_FOUND\"]]",
                    },
                    {
                        type: "code",
                        value: "// Registrado antes de publicar: é por aqui que volta a mensagem sem rota\ncanal.BasicReturnAsync += (_, ea) =>\n{\n    logger.LogError(\n        \"Mensagem sem rota ({Codigo} {Motivo}): exchange {Exchange}, routing key {RoutingKey}, id {MessageId}\",\n        ea.ReplyCode, ea.ReplyText, ea.Exchange, ea.RoutingKey, ea.BasicProperties.MessageId);\n    return Task.CompletedTask;\n};",
                    },
                    {
                        type: "text",
                        value: "## Detalhes que pegam\n\n- **A devolução é assíncrona.** O `BasicPublishAsync` com `mandatory: true` volta sem erro; a mensagem devolvida chega depois, pelo evento. Sem handler registrado, o cliente descarta a devolução calado, e o `mandatory` vira enfeite. Com o rastreamento de publisher confirms ligado, o próprio `await` lança `PublishReturnException` (o laboratório viu \"312 NO_ROUTE\" na mensagem da exceção), mas isso fica para quando os confirms entrarem em cena.\n- **Nome de exchange errado aparece longe da causa.** No laboratório, publicar na exchange `nao.existe` voltou sem erro. Meio segundo depois o canal estava fechado com 404 NOT_FOUND, e só a **operação seguinte** lançou `AlreadyClosedException`. Declare (ou confira) as exchanges na subida e guarde o nome numa constante, não em string solta espalhada pelo código.\n- **`mandatory` só fala de roteamento.** Ele avisa quando nenhuma fila casou. Se a mensagem foi roteada, ele fica quieto, mesmo que ninguém esteja consumindo aquela fila.",
                    },
                    {
                        type: "quote",
                        value: "Publicar bem é serializar com as mesmas opções nas duas pontas, etiquetar com `ContentType` e `MessageId` e decidir o destino da mensagem sem rota: sem `mandatory` ela some calada; com `mandatory` e um handler em `BasicReturnAsync`, ela volta para você.",
                    },
                ],
                questions: [
                    {
                        statement: "A exchange `pedidos` existe, mas nenhum binding casa com a routing key `pedido.cancelado`. O publicador chama `BasicPublishAsync` sem `mandatory`. Qual é o destino da mensagem?",
                        difficulty: "facil",
                        options: [
                            { text: "Fica guardada na exchange até surgir um binding", isCorrect: false },
                            { text: "Volta ao publicador pelo evento `BasicReturnAsync`", isCorrect: false },
                            { text: "O broker fecha o canal com 404 NOT_FOUND", isCorrect: false },
                            { text: "O broker a descarta, sem avisar o publicador", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Sem publisher confirms, o que o término do `await canal.BasicPublishAsync(...)` garante?",
                        difficulty: "facil",
                        options: [
                            { text: "Que a mensagem foi roteada para pelo menos uma das filas", isCorrect: false },
                            { text: "Que o cliente aceitou a mensagem para mandar pelo socket", isCorrect: true },
                            { text: "Que algum consumidor recebeu a mensagem e mandou o ack", isCorrect: false },
                            { text: "Que o broker recebeu a mensagem e já a gravou no disco", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O publicador serializa com `JsonSerializerOptions.Web`, e o consumidor lê com `JsonSerializer.Deserialize<PedidoCriado>(ea.Body.Span)`, sem passar opções. O contrato é `record PedidoCriado(Guid PedidoId, string ClienteId, decimal Total)`. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "Não lança exceção: o pedido chega com `Guid` zerado, `ClienteId` nulo e `Total` igual a 0", isCorrect: true },
                            { text: "Funciona, porque o `ContentType` da mensagem informa ao desserializador as opções usadas", isCorrect: false },
                            { text: "Funciona, porque o desserializador padrão do .NET ignora a diferença entre maiúsculas e minúsculas", isCorrect: false },
                            { text: "Lança `JsonException`, porque os nomes em camelCase não batem com as propriedades do record", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `mandatory: true` e um handler registrado em `BasicReturnAsync`, o publicador envia uma mensagem que não casa com nenhum binding. Os publisher confirms estão desligados. Como o código fica sabendo?",
                        difficulty: "medio",
                        options: [
                            { text: "O cliente republica a mensagem sozinho até aparecer uma fila ligada à exchange", isCorrect: false },
                            { text: "O `await` lança `PublishReturnException`, com o código 312 NO_ROUTE na mensagem", isCorrect: false },
                            { text: "O `await` volta sem erro, e o handler recebe a devolução com o 312 NO_ROUTE", isCorrect: true },
                            { text: "O broker fecha o canal com o código 312, e a operação seguinte lança exceção", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num canal sem publisher confirms, o publicador chama `BasicPublishAsync` numa exchange que não existe, por um erro de digitação no nome. O que o código observa?",
                        difficulty: "dificil",
                        options: [
                            { text: "O broker cria a exchange na hora, com o tipo direct, e descarta a mensagem por falta de binding", isCorrect: false },
                            { text: "A chamada volta sem erro; o broker fecha o canal com 404, e a falha só aparece numa operação seguinte", isCorrect: true },
                            { text: "A mensagem volta pelo `BasicReturnAsync` com 404 NOT_FOUND, desde que `mandatory` esteja ligado", isCorrect: false },
                            { text: "A chamada lança `OperationInterruptedException` com 404 NOT_FOUND, e o canal segue aberto para a próxima", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Consumindo com AsyncEventingBasicConsumer",
                blocks: [
                    {
                        type: "text",
                        value: "# Consumindo com AsyncEventingBasicConsumer\n\nO faturamento precisa emitir uma nota para cada pedido criado. Ele poderia perguntar à fila de tempos em tempos (`BasicGetAsync` existe), mas polling gasta viagens quando a fila está vazia e atrasa quando ela enche. O caminho normal é o inverso: o consumidor se registra com `BasicConsumeAsync` e o broker **empurra** as mensagens conforme elas chegam. No cliente 7.x, quem recebe é o `AsyncEventingBasicConsumer`, e o seu código entra no evento `ReceivedAsync`.\n\nA outra decisão é quando a mensagem sai da fila. Com **`autoAck: true`**, o broker considera a mensagem entregue no instante em que a envia. Com **ack manual** (`autoAck: false`), ela fica reservada para o consumidor, como \"unacked\", até ele confirmar com `BasicAckAsync`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs do consumidor de faturamento\nusing System.Text.Json;\nusing RabbitMQ.Client;\nusing RabbitMQ.Client.Events;\n\nvar fabrica = new ConnectionFactory { HostName = \"localhost\", ClientProvidedName = \"faturamento\" };\nawait using IConnection conexao = await fabrica.CreateConnectionAsync();\nawait using IChannel canal = await conexao.CreateChannelAsync();\nawait canal.QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false, autoDelete: false);\n\nvar consumidor = new AsyncEventingBasicConsumer(canal);\nconsumidor.ReceivedAsync += async (_, ea) =>\n{\n    try\n    {\n        // Lido aqui dentro: ea.Body só vale enquanto o handler roda\n        var pedido = JsonSerializer.Deserialize<PedidoCriado>(ea.Body.Span, JsonSerializerOptions.Web)!;\n        await EmitirNotaAsync(pedido);\n        await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n    catch (Exception ex)\n    {\n        Console.Error.WriteLine($\"Falha na entrega {ea.DeliveryTag}: {ex.Message}\");\n        // Responder sempre: sem ack nem nack, a mensagem fica presa\n        await canal.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true);\n    }\n};\n\nawait canal.BasicConsumeAsync(\"faturamento\", autoAck: false, consumer: consumidor);\nConsole.WriteLine(\"Consumindo. Ctrl+C para sair.\");\nawait Task.Delay(Timeout.Infinite);\n\nstatic async Task EmitirNotaAsync(PedidoCriado pedido)\n{\n    await Task.Delay(100); // aqui entraria a chamada ao emissor de notas\n    Console.WriteLine($\"Nota emitida para o pedido {pedido.PedidoId}\");\n}",
                    },
                    {
                        type: "text",
                        value: "## O corpo só vale dentro do handler\n\nO `ea.Body` é um `ReadOnlyMemory<byte>` que **pertence ao cliente**: a memória vem de um pool e volta para ele, para ser reaproveitada, assim que o handler termina. Dentro do handler pode tudo, inclusive usar o corpo depois de um `await`, porque o cliente espera a `Task` do handler acabar (no laboratório, 2000 corpos lidos depois de um `await` saíram todos certos). Fora dele, o guia de migração do 7.x é taxativo: quem quiser os bytes depois **tem que copiá-los**.\n\nO laboratório mostrou o que acontece quando não copia. Um consumidor guardou o `ea.Body` de seis mensagens numa lista e só leu depois: a referência da mensagem 2 devolveu o conteúdo da mensagem 6, e a da mensagem 1 devolveu bytes sem sentido. Nenhuma exceção. Num segundo teste, com o padrão errado abaixo (um `Task.Run` que lê o corpo depois de o handler retornar), duas rodadas de 2000 pedidos tiveram entre 842 e 1049 leituras erradas: pedidos com o conteúdo de outro pedido ou `JsonException`.",
                    },
                    {
                        type: "code",
                        value: "// ERRADO: o Task.Run lê ea.Body depois que o handler já retornou\nconsumidor.ReceivedAsync += (_, ea) =>\n{\n    _ = Task.Run(async () =>\n    {\n        var pedido = JsonSerializer.Deserialize<PedidoCriado>(ea.Body.Span, JsonSerializerOptions.Web)!;\n        await EmitirNotaAsync(pedido);\n        await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    });\n    return Task.CompletedTask;\n};\n\n// CERTO: tudo que lê ea.Body acontece antes de o handler terminar.\n// Bytes que precisam viver além dele (cache, fila interna): ea.Body.ToArray()\nconsumidor.ReceivedAsync += async (_, ea) =>\n{\n    var pedido = JsonSerializer.Deserialize<PedidoCriado>(ea.Body.Span, JsonSerializerOptions.Web)!;\n    await EmitirNotaAsync(pedido);\n    await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n};",
                    },
                    {
                        type: "text",
                        value: "## autoAck ou ack manual: o teste da queda\n\nO laboratório publicou 20 mensagens numa fila, cada uma levando meio segundo para processar, e matou o consumidor com `kill -9` depois de 5 processadas.\n\n- Com **`autoAck: true`**, o painel mostrava 0 mensagens prontas e 0 unacked com o consumidor ainda vivo: o broker já tinha empurrado as 20 para o processo e esquecido delas. Depois da queda, **15 mensagens tinham sumido**. Configurar prefetch 1 não mudou nada, porque o limite de prefetch só vale para entregas que esperam ack.\n- Com **ack manual**, as 15 sem confirmação voltaram para a fila assim que a conexão caiu, e o consumidor seguinte recebeu as que estavam em voo com `ea.Redelivered` verdadeiro.\n\nO preço do ack manual é a reentrega. Se o processo cai entre emitir a nota e mandar o ack, a mensagem volta e a nota é emitida de novo. Isso é \"pelo menos uma vez\", e a resposta para a duplicata é consumidor idempotente, tema de mais adiante na trilha.",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\", \"`autoAck: true`\", \"Ack manual (`autoAck: false`)\"], [\"Quando a mensagem sai da fila\", \"Assim que o broker a envia\", \"Quando chega o `BasicAckAsync`\"], [\"Se o consumidor cai no meio\", \"Perde tudo o que já tinha recebido\", \"O que não teve ack volta e é reentregue\"], [\"Prefetch (`BasicQosAsync`)\", \"Não limita nada\", \"Limita quantas ficam sem ack ao mesmo tempo\"], [\"Garantia\", \"No máximo uma vez\", \"Pelo menos uma vez (pode duplicar)\"], [\"Quando usar\", \"Dado descartável (telemetria, cotação que logo envelhece)\", \"Quase sempre\"]]",
                    },
                    {
                        type: "text",
                        value: "## A mensagem presa: ack esquecido e exceção engolida\n\nAck manual tem um modo de falha silencioso: a entrega que nunca recebe resposta. Ela não volta para a fila nem vai para outro consumidor; fica unacked com aquele consumidor até o **canal fechar**. Desde o RabbitMQ 4.3, o prazo para o ack (consumer timeout, padrão de 30 minutos) só vale para quorum queues; em fila clássica, não há prazo nenhum.\n\nO laboratório reproduziu os dois jeitos comuns de cair nisso:\n\n- **Ack esquecido.** Com prefetch 10 e um handler sem `BasicAckAsync`, o consumidor recebeu 10 mensagens e parou. O broker mostrava 10 unacked e 20 prontas, esperando para sempre.\n- **Exceção que escapa do handler.** O cliente captura a exceção, dispara o evento `CallbackExceptionAsync` do canal e segue em frente: o canal continua aberto, as mensagens seguintes são processadas, e a que falhou fica unacked sem ninguém perceber.\n\nPor isso o handler do exemplo tem `try/catch` e responde toda entrega: `BasicAckAsync` no sucesso, `BasicNackAsync` na falha. As variações (nack, reject, requeue) e o laço infinito que o requeue pode criar ficam para mais adiante na trilha.",
                    },
                    {
                        type: "quote",
                        value: "Consumir no 7.x é registrar um `AsyncEventingBasicConsumer`, ler o corpo dentro do `ReceivedAsync` e responder toda entrega. Ack manual troca perda por reentrega, e entrega sem resposta fica presa até o canal fechar.",
                    },
                ],
                questions: [
                    {
                        statement: "Um consumidor usa `autoAck: true` e o processo cai no meio do processamento. O que acontece com as mensagens que o broker já tinha enviado a ele?",
                        difficulty: "facil",
                        options: [
                            { text: "Ficam unacked até o consumer timeout devolvê-las à fila", isCorrect: false },
                            { text: "Se perdem, porque o broker as deu como entregues ao enviar", isCorrect: true },
                            { text: "Voltam para a fila, marcadas com `Redelivered` verdadeiro", isCorrect: false },
                            { text: "Vão para a dead letter exchange que o broker cria por padrão", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num consumidor registrado com `BasicConsumeAsync` no cliente 7.x, onde entra o código que processa cada entrega?",
                        difficulty: "facil",
                        options: [
                            { text: "No evento `Received` de um `EventingBasicConsumer` síncrono", isCorrect: false },
                            { text: "No evento `ReceivedAsync` de um `AsyncEventingBasicConsumer`", isCorrect: true },
                            { text: "Na `Task<string>` que o `BasicConsumeAsync` devolve ao registrar", isCorrect: false },
                            { text: "No evento `BasicReturnAsync`, que o canal dispara a cada entrega", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um handler de `ReceivedAsync` guarda `ea.Body` numa lista para processar as mensagens em lote depois que o handler retorna. O que tende a acontecer quando o lote é processado?",
                        difficulty: "medio",
                        options: [
                            { text: "O cliente lança `ObjectDisposedException` na primeira leitura fora do handler", isCorrect: false },
                            { text: "Os bytes lidos depois podem ser de outra mensagem ou lixo, sem exceção nenhuma", isCorrect: true },
                            { text: "Funciona, porque a referência guardada impede o coletor de lixo de liberar a memória", isCorrect: false },
                            { text: "Funciona só com ack manual, porque o cliente segura a memória até o ack chegar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um consumidor de uma fila clássica usa ack manual e prefetch 10, mas o handler tem um bug: nunca chama `BasicAckAsync`. A fila tinha 30 mensagens. O que o painel mostra alguns segundos depois, com o processo ainda vivo?",
                        difficulty: "medio",
                        options: [
                            { text: "20 prontas e 10 devolvidas à fila a cada consumer timeout", isCorrect: false },
                            { text: "10 unacked e 20 prontas, com o consumidor conectado e parado", isCorrect: true },
                            { text: "30 unacked, porque o broker entrega tudo e fica esperando os acks", isCorrect: false },
                            { text: "0 prontas e 0 unacked, porque sem ack o broker apaga a entrega", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um consumidor com `autoAck: true` chama `BasicQosAsync(0, 1, false)` antes do `BasicConsumeAsync`, numa fila clássica com 500 mensagens. O que se vê no broker pouco depois de ele começar a consumir?",
                        difficulty: "dificil",
                        options: [
                            { text: "Sai uma mensagem por vez da fila, no ritmo em que o consumidor processa", isCorrect: false },
                            { text: "O broker recusa o consumo, porque prefetch só é aceito com ack manual", isCorrect: false },
                            { text: "As 500 saem da fila, mas ficam como unacked até o processamento de cada uma terminar", isCorrect: false },
                            { text: "A fila esvazia, porque o prefetch não limita entregas que não esperam ack", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Prefetch e consumidores concorrentes",
                blocks: [
                    {
                        type: "text",
                        value: "# Prefetch e consumidores concorrentes\n\nA fila de faturamento acumulou mil mensagens. Alguém sobe uma segunda instância do consumidor para dar vazão e, no painel, a instância nova fica parada. O laboratório reproduziu a cena com 50 ms por mensagem: a instância A conectou primeiro e a B, um segundo depois. Dois segundos mais tarde, A tinha processado 59 mensagens e **segurava 918 sem ack**; B tinha processado **zero**. A primeira instância puxou a fila inteira para si no instante em que se conectou.\n\nO responsável é o **prefetch**: quantas entregas o broker faz a um consumidor sem receber ack. O padrão é **0, que significa ilimitado**. Com ack manual e prefetch ilimitado, o broker empurra tudo o que tem para o primeiro consumidor que aparecer.\n\nVárias instâncias lendo a mesma fila formam o padrão **competing consumers** (consumidores concorrentes): cada mensagem vai para um só deles, e o broker reparte em rodízio (round-robin). O rodízio só reparte de verdade se cada um pegar pouco de cada vez.",
                    },
                    {
                        type: "code",
                        value: "// Prefetch configurado ANTES do BasicConsumeAsync\nawait using IChannel canal = await conexao.CreateChannelAsync();\nawait canal.QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false, autoDelete: false);\n\nawait canal.BasicQosAsync(prefetchSize: 0, prefetchCount: 20, global: false);\n\nvar consumidor = new AsyncEventingBasicConsumer(canal);\nconsumidor.ReceivedAsync += async (_, ea) =>\n{\n    // (o try/catch com nack da aula anterior foi omitido para encurtar)\n    var pedido = JsonSerializer.Deserialize<PedidoCriado>(ea.Body.Span, JsonSerializerOptions.Web)!;\n    await EmitirNotaAsync(pedido);\n    await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n};\nawait canal.BasicConsumeAsync(\"faturamento\", autoAck: false, consumer: consumidor);",
                    },
                    {
                        type: "text",
                        value: "## Os três parâmetros do BasicQosAsync\n\n- **`prefetchCount`**: o máximo de entregas sem ack por consumidor. Com 20, o broker manda 20 e só manda a 21ª quando chega um ack.\n- **`prefetchSize`**: limite em bytes, que o RabbitMQ não implementa. Tem que ser 0: no laboratório, pedir 1024 fez o broker fechar a conexão com 540 NOT_IMPLEMENTED.\n- **`global`**: no RabbitMQ, `false` aplica o limite a cada consumidor criado depois no canal, e é o que você quer. O `true` (um limite para o canal inteiro) está depreciado e, desde o 4.3, vem negado por padrão: no 4.3.6 do laboratório, o broker aceitou a chamada sem erro, mas aplicou o limite por consumidor.\n\n**A ordem importa.** O limite vale para os consumidores registrados **depois** da chamada. No laboratório, um `BasicQosAsync(0, 5, false)` feito logo depois do `BasicConsumeAsync` não teve efeito nenhum: o consumidor recebeu as 50 mensagens da fila de uma vez.\n\nO efeito do número aparece quando os consumidores têm velocidades diferentes. Dois consumidores na mesma fila, um rápido (10 ms por mensagem) e um lento (500 ms), recebendo 40 mensagens publicadas com os dois já conectados:",
                    },
                    {
                        type: "table",
                        value: "[[\"Prefetch\", \"Rápido processou\", \"Lento processou\", \"Tempo para esvaziar a fila\"], [\"0 (ilimitado)\", \"20\", \"20\", \"10 s\"], [\"1\", \"39\", \"1\", \"0,5 s\"], [\"10\", \"30\", \"10\", \"5 s\"]]",
                    },
                    {
                        type: "text",
                        value: "## Como escolher o número\n\nCom prefetch ilimitado, o rodízio dividiu meio a meio e o rápido ficou à toa esperando o lento terminar as 20 dele. Com 10, o lento ainda abocanhou 10 de uma vez e esticou a cauda para 5 segundos. Com 1, a distribuição seguiu a capacidade real de cada um.\n\nIsso não faz do 1 a resposta universal. Com prefetch 1, cada mensagem espera uma ida e volta inteira até o broker antes da próxima, e a documentação do RabbitMQ chama esse valor de o mais conservador, com queda forte de vazão quando há latência entre consumidor e broker. A mesma documentação diz que valores entre 100 e 300 costumam dar a melhor vazão sem sobrecarregar o consumidor, e que acima disso o ganho diminui. O critério:\n\n- **Processamento rápido e uniforme** (milissegundos): prefetch na faixa das centenas, para o consumidor nunca ficar ocioso esperando a rede.\n- **Processamento lento ou desigual** (segundos, chamada externa): prefetch baixo, para uma instância não sequestrar trabalho que outra poderia estar fazendo.\n- **Nunca ilimitado com ack manual**: além de travar as outras instâncias, a memória do consumidor vira a fila.",
                    },
                    {
                        type: "text",
                        value: "## Prefetch não é paralelismo\n\nCom prefetch 20, o consumidor tem 20 mensagens na mão, mas o handler continua rodando **uma de cada vez** naquele canal: o cliente 7.x despacha as entregas em sequência por padrão (`ConsumerDispatchConcurrency` igual a 1). No laboratório, 40 mensagens de 100 ms com prefetch 10 levaram 4 segundos, sem nunca haver dois handlers rodando juntos.\n\nPara processar em paralelo dentro do mesmo processo há dois caminhos: abrir mais canais, cada um com o seu consumidor (mais consumidores concorrentes, só que no mesmo processo), ou aumentar o `ConsumerDispatchConcurrency`. O paralelismo efetivo é **o menor valor entre o despacho e o prefetch**: com despacho 4 e prefetch 10, o laboratório viu 4 handlers simultâneos e cerca de 1 segundo no total; com despacho 4 e prefetch 2, só 2 ao mesmo tempo.",
                    },
                    {
                        type: "code",
                        value: "// Até 4 handlers ao mesmo tempo neste canal (o prefetch precisa ser pelo menos 4)\nawait using IChannel canal = await conexao.CreateChannelAsync(\n    new CreateChannelOptions(\n        publisherConfirmationsEnabled: false,\n        publisherConfirmationTrackingEnabled: false,\n        consumerDispatchConcurrency: 4));\nawait canal.BasicQosAsync(prefetchSize: 0, prefetchCount: 20, global: false);\n\n// Ou, para todos os canais de uma conexão:\n// new ConnectionFactory { HostName = \"localhost\", ConsumerDispatchConcurrency = 4 }",
                    },
                    {
                        type: "text",
                        value: "Com despacho maior que 1, o handler roda em várias threads ao mesmo tempo: estado compartilhado precisa ser seguro para concorrência, e a ordem de processamento deixa de seguir a ordem da fila (consumidores concorrentes já embaralham a ordem entre instâncias; ordem é tema de mais adiante). A documentação do cliente avisa que o despacho concorrente usa o pool de threads, então o número sai do que o handler faz: espera de I/O tolera mais paralelismo que trabalho pesado de CPU. E escalar instâncias só ajuda se o prefetch deixar mensagem na fila para as novas.",
                    },
                    {
                        type: "quote",
                        value: "Prefetch é quanto cada consumidor pode segurar sem ack, e o padrão ilimitado deixa o primeiro sequestrar a fila. Configure antes do `BasicConsumeAsync`, com `global: false`, e lembre que paralelismo vem do `ConsumerDispatchConcurrency` ou de mais canais, sempre limitado pelo prefetch.",
                    },
                ],
                questions: [
                    {
                        statement: "Se ninguém chamar `BasicQosAsync`, qual é o prefetch de um consumidor com ack manual, e o que isso significa?",
                        difficulty: "facil",
                        options: [
                            { text: "Zero, que o broker trata como ilimitado", isCorrect: true },
                            { text: "Dez, o valor padrão do cliente 7.x", isCorrect: false },
                            { text: "Zero, que bloqueia as entregas até configurar", isCorrect: false },
                            { text: "Um, uma entrega sem ack por vez", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Três instâncias de um serviço consomem a mesma fila (competing consumers). Como o RabbitMQ reparte as mensagens entre elas?",
                        difficulty: "facil",
                        options: [
                            { text: "Cada instância recebe uma cópia, e o ack de uma apaga as outras", isCorrect: false },
                            { text: "Cada mensagem vai para as três, e cada uma decide se processa", isCorrect: false },
                            { text: "Cada instância recebe só as mensagens da própria routing key", isCorrect: false },
                            { text: "Cada mensagem vai para uma só instância, em rodízio entre elas", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um consumidor chama `BasicConsumeAsync` e, na linha seguinte, `BasicQosAsync(0, 5, false)`. A fila tem 50 mensagens e o ack é manual. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker recusa o `BasicQosAsync`, porque o canal já tem consumidor", isCorrect: false },
                            { text: "O limite não vale para esse consumidor, que recebe as 50 de uma vez", isCorrect: true },
                            { text: "O limite passa a valer na hora, e o consumidor fica só com 5 por vez", isCorrect: false },
                            { text: "O consumidor recebe as 50, e o broker devolve 45 delas para a fila", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um consumidor tem prefetch 10 e `ConsumerDispatchConcurrency` no padrão. Cada mensagem leva 100 ms no handler. Quantos handlers rodam ao mesmo tempo nesse canal?",
                        difficulty: "medio",
                        options: [
                            { text: "Depende dos núcleos, porque o cliente usa o pool de threads", isCorrect: false },
                            { text: "Dez, porque o prefetch define quantas entregas rodam em paralelo", isCorrect: false },
                            { text: "Um, porque o despacho padrão processa uma entrega de cada vez", isCorrect: true },
                            { text: "Dois, porque o cliente sobrepõe a próxima entrega ao ack anterior", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dois consumidores dividem uma fila: um processa cada mensagem em 10 ms, o outro em 500 ms. Chegam 40 mensagens com os dois já conectados, ambos com ack manual. Com qual prefetch a fila esvazia mais rápido, e por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "Ilimitado, porque o broker manda tudo de uma vez e ninguém espera a rede", isCorrect: false },
                            { text: "Prefetch 10, porque equilibra a ida e volta da rede com a divisão do trabalho", isCorrect: false },
                            { text: "Prefetch 1, porque o lento fica com uma só e o rápido absorve o resto", isCorrect: true },
                            { text: "Tanto faz, porque o rodízio divide meio a meio com qualquer prefetch", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Worker no ASP.NET Core com desligamento limpo",
                blocks: [
                    {
                        type: "text",
                        value: "# Worker no ASP.NET Core com desligamento limpo\n\nNum serviço de verdade, o consumidor não é um `Program.cs` com `Task.Delay(Timeout.Infinite)`. Ele roda dentro da aplicação (uma API ASP.NET Core ou um processo de worker), sobe junto com ela e, o que mais importa, **para** junto com ela. A cada deploy o orquestrador manda SIGTERM, e o que estava em processamento naquele instante decide se o deploy foi limpo ou se algum cliente vai ser cobrado duas vezes.\n\nA peça do .NET para isso é o `BackgroundService`, e a divisão de responsabilidades fica assim:\n\n- **A conexão é da aplicação**: aberta uma vez na subida, registrada como singleton e compartilhada por quem precisar.\n- **O canal é do worker**: cada consumidor abre o seu, configura o prefetch e cuida do próprio desligamento.\n- **Cada mensagem ganha um escopo de DI**, porque o worker é singleton e serviços como o `DbContext` são scoped.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing RabbitMQ.Client;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nvar fabrica = new ConnectionFactory\n{\n    // Na configuração: \"amqp://usuario:senha@host:5672/vhost\"\n    Uri = new Uri(builder.Configuration.GetConnectionString(\"rabbitmq\")!),\n};\n\n// Aberta antes do Build: as fábricas do contêiner de DI são síncronas.\n// Sem broker, a aplicação nem sobe.\nawait using IConnection conexao = await fabrica.CreateConnectionAsync(\"faturamento-worker\");\n\nbuilder.Services.AddSingleton(conexao);\nbuilder.Services.AddScoped<IFaturamento, Faturamento>();\nbuilder.Services.AddHostedService<FaturamentoWorker>();\n\nvar app = builder.Build();\napp.MapGet(\"/saude\", () => TypedResults.Ok());\nawait app.RunAsync();\n// Aqui o host já parou o worker; o await using fecha a conexão por último.",
                    },
                    {
                        type: "text",
                        value: "## A conexão no contêiner de DI\n\nO `CreateConnectionAsync` é assíncrono e as fábricas do contêiner de DI são síncronas, então a conexão é criada **antes** do `Build` e registrada como instância pronta. Dois efeitos, ambos bons:\n\n- **Falha cedo.** Sem broker, a aplicação nem sobe, em vez de subir \"saudável\" e quebrar na primeira mensagem. A recuperação automática do cliente não ajuda aqui: segundo a documentação, ela não entra em ação se a primeira conexão falhar.\n- **Quem criou, fecha.** O contêiner não descarta instâncias que recebeu prontas (o laboratório conferiu). O `await using` fecha a conexão quando o `RunAsync` termina, ou seja, depois que o host já parou o worker.\n\nO atalho que aparece muito por aí, `AddSingleton<IConnection>(_ => fabrica.CreateConnectionAsync().GetAwaiter().GetResult())`, bloqueia uma thread esperando a rede e adia o erro de conexão para a primeira vez que alguém pedir o serviço. E se o mesmo processo também publica bastante, a documentação do RabbitMQ aconselha uma conexão só para publicar e outra só para consumir: quando o broker freia publicadores (alarme de memória ou de disco), ele para de ler a conexão que publica, e os acks dos consumidores que dividem essa conexão ficam presos junto. Duas conexões no mesmo contêiner se registram com chave (`AddKeyedSingleton`).",
                    },
                    {
                        type: "code",
                        value: "// FaturamentoWorker.cs\nusing System.Text.Json;\nusing RabbitMQ.Client;\nusing RabbitMQ.Client.Events;\n\npublic sealed class FaturamentoWorker(\n    IConnection conexao,\n    IServiceScopeFactory scopes,\n    ILogger<FaturamentoWorker> logger) : BackgroundService\n{\n    private const string Fila = \"faturamento\";\n    private int _emAndamento;\n\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        // A conexão é compartilhada; o canal é só deste worker\n        await using IChannel canal = await conexao.CreateChannelAsync(cancellationToken: stoppingToken);\n        await canal.QueueDeclareAsync(Fila, durable: true, exclusive: false, autoDelete: false,\n            cancellationToken: stoppingToken);\n        await canal.BasicQosAsync(prefetchSize: 0, prefetchCount: 20, global: false, stoppingToken);\n\n        var consumidor = new AsyncEventingBasicConsumer(canal);\n        consumidor.ReceivedAsync += async (_, ea) =>\n        {\n            Interlocked.Increment(ref _emAndamento);\n            try\n            {\n                // Desligando: não começa trabalho novo. Sem ack, a entrega volta\n                // para a fila quando o canal fechar.\n                if (stoppingToken.IsCancellationRequested) return;\n\n                var pedido = JsonSerializer.Deserialize<PedidoCriado>(ea.Body.Span, JsonSerializerOptions.Web)!;\n                await using var scope = scopes.CreateAsyncScope();\n                var faturamento = scope.ServiceProvider.GetRequiredService<IFaturamento>();\n                await faturamento.EmitirAsync(pedido, CancellationToken.None);\n                await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n            }\n            catch (Exception ex)\n            {\n                logger.LogError(ex, \"Falha ao faturar a entrega {DeliveryTag}\", ea.DeliveryTag);\n                // Devolve para a fila. Mensagem que sempre falha vira laço:\n                // limite de tentativas e dead letter vêm mais adiante na trilha.\n                await canal.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true);\n            }\n            finally\n            {\n                Interlocked.Decrement(ref _emAndamento);\n            }\n        };\n\n        string consumerTag = await canal.BasicConsumeAsync(Fila, autoAck: false, consumidor, stoppingToken);\n\n        try\n        {\n            await Task.Delay(Timeout.Infinite, stoppingToken);\n        }\n        catch (OperationCanceledException)\n        {\n            logger.LogInformation(\"Desligando o consumo da fila {Fila}\", Fila);\n        }\n\n        await canal.BasicCancelAsync(consumerTag);   // 1. o broker para de entregar\n        while (Volatile.Read(ref _emAndamento) > 0)  // 2. espera quem já começou\n            await Task.Delay(100);\n        await canal.CloseAsync();                    // 3. o que ficou sem ack volta para a fila\n        logger.LogInformation(\"Canal fechado sem mensagem em processamento\");\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O que acontece em cada fase\n\n- **Subida.** Desde o .NET 10, o `ExecuteAsync` inteiro roda em segundo plano; antes, o trecho até o primeiro `await` rodava na thread de inicialização e podia atrasar a subida dos outros serviços. O worker abre o próprio canal, declara a fila e configura o prefetch **antes** de registrar o consumidor.\n- **Cada mensagem.** Desserializa dentro do handler (o `ea.Body` só vale ali), cria um escopo para os serviços scoped, processa e responde com ack; na falha, registra o erro e devolve com nack. O processamento recebe `CancellationToken.None` de propósito: no desligamento, a ideia é terminar o que começou, não abortar no meio. O contador `_emAndamento` sabe quantos handlers estão trabalhando.\n- **Erro fatal.** Exceção que escapa do `ExecuteAsync` (o broker sumiu na hora de declarar a fila, por exemplo) para a aplicação inteira. É o comportamento padrão do host desde o .NET 6, e é melhor que um processo vivo com o worker morto.",
                    },
                    {
                        type: "text",
                        value: "## Desligar sem perder e sem repetir\n\nCom ack manual, nenhuma forma de desligar **perde** mensagem: o que não teve ack volta para a fila quando o canal fecha. O que muda é quanto trabalho é **refeito**. O laboratório publicou 30 pedidos (400 ms cada, prefetch 20) e mandou SIGTERM três segundos depois, com três versões do worker:\n\n- **Ingênua**: o `ExecuteAsync` retorna logo depois do `BasicConsumeAsync`, e a conexão cai no fim do processo. O pedido em andamento terminou, o ack falhou com `AlreadyClosedException`, e esse pedido foi **faturado duas vezes** quando o worker voltou.\n- **Cancela e fecha**: `BasicCancelAsync` seguido de `CloseAsync`. Parece a certa e foi a pior. Cancelar o consumidor não descarta nem devolve o que já está no buffer do cliente, e o cliente seguiu entregando ao handler as 20 mensagens que tinha na mão, com o canal já fechado: **20 acks falharam, 20 pedidos faturados duas vezes**, e o desligamento levou quase 8 segundos.\n- **A do exemplo**: terminou com ack o pedido em andamento, não começou nenhum outro e saiu em menos de meio segundo. As entregas que estavam no buffer voltaram intactas para a fila, e na volta do worker nenhum pedido foi faturado duas vezes.\n\nA sequência que funciona: **(1)** `BasicCancelAsync`, para o broker parar de entregar; **(2)** o handler não começa trabalho novo depois do sinal de parada; **(3)** esperar o contador zerar; **(4)** `CloseAsync`, que devolve à fila tudo o que ficou sem ack.",
                    },
                    {
                        type: "table",
                        value: "[[\"Quem manda parar\", \"Prazo padrão\", \"Quando o prazo estoura\"], [\"Host do .NET (`HostOptions.ShutdownTimeout`)\", \"30 segundos\", \"O host para de esperar os serviços e segue encerrando\"], [\"`docker stop` (contêiner Linux)\", \"10 segundos\", \"SIGKILL no processo\"], [\"Kubernetes (`terminationGracePeriodSeconds`)\", \"30 segundos\", \"SIGKILL no processo\"]]",
                    },
                    {
                        type: "text",
                        value: "O menor prazo manda. Se uma mensagem pode levar mais que isso, aumente o prazo do orquestrador ou aceite que ela será refeita no próximo deploy; com ack manual, de novo, nada se perde.\n\n## Erros comuns no worker\n\n- **`DbContext` (scoped) no construtor do worker.** O worker é singleton. Em ambiente de desenvolvimento o contêiner recusa na subida; em produção ele aceita, e a mesma instância de contexto atravessa mensagens e threads. Escopo por mensagem, como no exemplo.\n- **`Task.Run` no handler para ir mais rápido.** Perde o controle do prefetch, do ack e da vida do `ea.Body`. Paralelismo é `ConsumerDispatchConcurrency` ou mais canais.\n- **Processamento mais longo que o prazo.** Com o `docker stop` padrão, um pedido de 15 segundos é morto no meio a cada deploy, e refeito depois.",
                    },
                    {
                        type: "quote",
                        value: "No ASP.NET Core, a conexão é da aplicação e o canal é do worker. Desligar bem é parar de receber, não começar nada novo, terminar o que está na mão e só então fechar o canal: com ack manual nada se perde, e com essa ordem nada se repete.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que o worker cria um escopo de DI para cada mensagem em vez de receber o `DbContext` pelo construtor?",
                        difficulty: "facil",
                        options: [
                            { text: "Um singleton não pode receber pelo construtor nada que implemente `IDisposable`, como o `DbContext`", isCorrect: false },
                            { text: "O escopo por mensagem é o que garante que o ack saia pelo canal certo da entrega", isCorrect: false },
                            { text: "O worker é singleton e o `DbContext` é scoped, então cada mensagem precisa do seu", isCorrect: true },
                            { text: "Classes que herdam de `BackgroundService` não recebem dependências pelo construtor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa aplicação ASP.NET Core com um worker que consome uma fila, qual é a divisão recomendada entre conexão e canal?",
                        difficulty: "facil",
                        options: [
                            { text: "Um canal da aplicação, em singleton; cada worker abre a própria conexão com o broker", isCorrect: false },
                            { text: "Uma conexão por worker, com todos os workers dividindo um canal só", isCorrect: false },
                            { text: "Uma conexão da aplicação, em singleton; cada worker abre o próprio canal", isCorrect: true },
                            { text: "Uma conexão e um canal novos para cada mensagem que o worker recebe", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No desligamento, um worker chama `BasicCancelAsync` e, logo em seguida, `CloseAsync` no canal, com 20 entregas ainda no buffer do cliente. O que o laboratório da aula mostrou?",
                        difficulty: "medio",
                        options: [
                            { text: "O cancelamento descartou as 20 entregas do buffer, que se perderam", isCorrect: false },
                            { text: "O `CloseAsync` esperou as 20 terminarem e confirmou todas com ack", isCorrect: false },
                            { text: "O handler rodou as 20 com o canal já fechado, e todos os acks falharam", isCorrect: true },
                            { text: "O cancelamento devolveu as 20 entregas à fila antes de o canal terminar de fechar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No `Program.cs` da aula, a conexão é criada com `await using` e registrada com `builder.Services.AddSingleton(conexao)`. Quando ela é fechada?",
                        difficulty: "medio",
                        options: [
                            { text: "No fim do `await using`, depois que o `RunAsync` termina e o worker já parou", isCorrect: true },
                            { text: "Logo depois do `Build`, quando o contêiner passa a ser dono da instância", isCorrect: false },
                            { text: "Nunca: ela fica aberta até o broker derrubá-la por falta de heartbeat", isCorrect: false },
                            { text: "Quando o contêiner de DI é descartado, porque ele descarta todo singleton registrado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um worker com ack manual roda num contêiner Linux parado com `docker stop`, sem configuração extra de prazo. Durante um deploy, ele acabou de pegar uma mensagem que leva 20 segundos para processar. O que acontece com ela?",
                        difficulty: "dificil",
                        options: [
                            { text: "O SIGKILL chega aos 10 segundos; sem ack, ela volta para a fila e será refeita", isCorrect: true },
                            { text: "Ela fica presa até o consumer timeout de 30 minutos devolvê-la para a fila", isCorrect: false },
                            { text: "Ela se perde, porque o processo morre antes do ack e o broker a dá como entregue", isCorrect: false },
                            { text: "O host do .NET segura o processo por 30 segundos, e a mensagem termina com ack", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Confiabilidade",
        aulas: [
            {
                titulo: "Durabilidade: o que sobrevive a um restart",
                blocks: [
                    {
                        type: "text",
                        value: "# Durabilidade: o que sobrevive a um restart\n\nSexta à noite, a equipe de infraestrutura atualiza o broker e reinicia o nó. Na segunda de manhã, a fila `faturamento` está lá, com o mesmo nome e os mesmos bindings, mas vazia: os 3 mil pedidos que esperavam processamento sumiram. Ninguém apagou nada. A fila tinha sido declarada durável, e o time achou que isso bastava.\n\nA durabilidade no RabbitMQ depende de **duas chaves independentes**, e as duas precisam estar ligadas:\n\n- **Fila durável** (`durable: true` na declaração): a *definição* da fila (nome, argumentos, bindings) é gravada e volta depois do restart.\n- **Mensagem persistente** (`Persistent = true` nas propriedades): a *mensagem* é gravada em disco pelo broker. Uma `BasicProperties` nova vem sem modo de entrega, e mensagem sem modo de entrega é **transiente**: o broker não a guarda para depois de um restart.\n\nFila durável com mensagem transiente é exatamente o cenário da segunda-feira: a fila volta, o conteúdo não. O programa abaixo liga as duas chaves.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: fila durável e mensagem persistente, as duas chaves ligadas\nusing System.Text;\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\nawait using IConnection conn = await factory.CreateConnectionAsync();\nawait using IChannel channel = await conn.CreateChannelAsync();\n\nawait channel.ExchangeDeclareAsync(\"pedidos\", ExchangeType.Topic, durable: true);\nawait channel.QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false,\n    autoDelete: false, arguments: null);\nawait channel.QueueBindAsync(\"faturamento\", \"pedidos\", \"pedido.criado\");\n\nvar props = new BasicProperties\n{\n    Persistent = true, // o mesmo que DeliveryMode = DeliveryModes.Persistent\n    ContentType = \"application/json\",\n    MessageId = Guid.NewGuid().ToString()\n};\nbyte[] corpo = Encoding.UTF8.GetBytes(\"\"\"{\"pedidoId\":42,\"total\":199.90}\"\"\");\n\nawait channel.BasicPublishAsync(exchange: \"pedidos\", routingKey: \"pedido.criado\",\n    mandatory: true, basicProperties: props, body: corpo);\nConsole.WriteLine(\"publicada como persistente\");",
                    },
                    {
                        type: "text",
                        value: "## O experimento do restart\n\nDá para ver isso acontecer em dois minutos, com o broker num contêiner chamado `rabbitmq`. Depois de rodar o programa acima (uma mensagem persistente na fila `faturamento`), publique mais uma mensagem **sem** `Persistent` na mesma fila e outra, também sem `Persistent`, numa quorum queue chamada `faturamento.quorum` (o tipo de fila replicada que aparece mais adiante neste módulo). Liste as filas, reinicie o contêiner e liste de novo. A saída abaixo é de um teste real com o RabbitMQ 4.3.",
                    },
                    {
                        type: "code",
                        value: "# terminal: antes do restart\ndocker exec rabbitmq rabbitmqctl -q list_queues name type durable messages\nname                type     durable  messages\nfaturamento         classic  true     2\nfaturamento.quorum  quorum   true     1\n\ndocker restart rabbitmq\n\n# terminal: depois do restart\ndocker exec rabbitmq rabbitmqctl -q list_queues name type durable messages\nname                type     durable  messages\nfaturamento         classic  true     1\nfaturamento.quorum  quorum   true     1",
                    },
                    {
                        type: "text",
                        value: "O `docker restart` faz um desligamento limpo (o broker recebe o sinal, fecha as conexões e para), e mesmo assim a mensagem transiente da fila clássica foi descartada: mensagem transiente não atravessa restart nenhum, limpo ou não. A fila clássica voltou só com a persistente. Já a quorum queue manteve a mensagem publicada como transiente, porque quorum queue **grava toda mensagem em disco**, seja qual for o modo de entrega; nela, deixar `Persistent` desligado não economiza nada.\n\nPersistência custa escrita em disco a cada mensagem. Para o que pode se perder sem dano (um aviso para invalidar cache, uma métrica de passagem), mensagem transiente numa fila clássica é uma escolha legítima, desde que seja uma escolha e não um esquecimento.",
                    },
                    {
                        type: "table",
                        value: "[[\"Fila\", \"Mensagem\", \"Depois de um restart do broker\"], [\"Clássica durável\", \"Persistente\", \"Fila e mensagem voltam\"], [\"Clássica durável\", \"Transiente\", \"A fila volta, a mensagem se perde\"], [\"Quorum queue (sempre durável)\", \"Qualquer uma\", \"Fila e mensagem voltam\"], [\"Não durável e exclusiva\", \"Qualquer uma\", \"Some antes, quando a conexão dona fecha\"], [\"Não durável e não exclusiva\", \"Nenhuma\", \"Nem é criada: recusada por padrão desde o 4.3\"]]",
                    },
                    {
                        type: "text",
                        value: "## Duas armadilhas na declaração\n\n**Fila transitória não exclusiva.** Muito tutorial antigo declara fila com `durable: false, exclusive: false`. No RabbitMQ 4.3 esse recurso (`transient_nonexcl_queues`, que já estava marcado como obsoleto) passou a ser **negado por padrão**: o broker responde `541 INTERNAL_ERROR` e fecha a **conexão inteira**, não só o canal, derrubando junto tudo o que usava aquela conexão. Fila não durável hoje só faz sentido como `exclusive: true`, que morre com a conexão dona (uma fila de respostas, por exemplo). Para o resto, as notas da versão indicam fila durável, se preciso com prazo de expiração.\n\n**Redeclarar com outra durabilidade.** Declarar é idempotente só quando os parâmetros batem com os da fila existente. Se `faturamento` existe como durável e um deploy novo a declara com `durable: false`, a resposta é `406 PRECONDITION_FAILED - inequivalent arg 'durable' for queue 'faturamento'`, e o canal é fechado. Muita gente tenta \"corrigir\" a durabilidade mudando só o código e o serviço passa a falhar na subida, porque a fila existente não muda de propriedade: o caminho é criar a fila nova e migrar, ou apagar e recriar numa janela controlada. Exchange também tem `durable`, e as suas devem ser duráveis.",
                    },
                    {
                        type: "text",
                        value: "## O disco também precisa sobreviver\n\nDurável e persistente quer dizer \"gravado no disco **deste nó**\". Isso tem três consequências práticas:\n\n- **No Docker, o disco é o volume.** O RabbitMQ guarda os dados numa pasta com o nome do nó, `rabbit@` seguido do hostname. Sem volume, `docker rm` leva tudo embora. Com volume mas sem `--hostname`, o contêiner recriado ganha outro hostname, o nó ganha outro nome e sobe vazio. Num teste, recriar o contêiner com outro hostname sobre o mesmo volume trouxe zero filas; voltar ao hostname original trouxe tudo de volta.\n- **Gravar não é instantâneo.** Entre o broker receber a mensagem e ela chegar ao disco existe uma janela. Se o nó cai nela, a mensagem se perde, e o produtor só fica sabendo se esperar a confirmação do broker, assunto da próxima aula.\n- **Disco que morre leva tudo.** Durabilidade protege contra restart, não contra perder a máquina. Para isso é preciso réplica em outro nó.",
                    },
                    {
                        type: "code",
                        value: "# terminal: volume nomeado e hostname fixo, para os dados sobreviverem ao contêiner\ndocker run -d --name rabbitmq --hostname rabbitmq \\\n  -p 5672:5672 -p 15672:15672 \\\n  -v rabbitmq-dados:/var/lib/rabbitmq \\\n  rabbitmq:4.3-management",
                    },
                    {
                        type: "quote",
                        value: "Fila durável guarda a definição, mensagem persistente guarda o conteúdo, e só as duas juntas atravessam um restart; a quorum queue grava tudo em disco, e no 4.3 fila não durável só existe como exclusiva.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma fila clássica foi declarada com `durable: true`, e o produtor publica com `new BasicProperties()`, sem mexer em mais nada. O broker reinicia. O que acontece?",
                        difficulty: "facil",
                        options: [
                            { text: "A fila some no restart, porque mensagem transiente torna a fila transitória", isCorrect: false },
                            { text: "A fila e as mensagens voltam, porque a durabilidade da fila cobre o conteúdo", isCorrect: false },
                            { text: "As mensagens voltam, mas a fila precisa ser declarada de novo pela aplicação", isCorrect: false },
                            { text: "A fila volta depois do restart, mas as mensagens que estavam nela se perdem", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No cliente `RabbitMQ.Client` 7.x, o que marca a mensagem para sobreviver a um restart numa fila clássica durável?",
                        difficulty: "facil",
                        options: [
                            { text: "`Persistent = true` na `BasicProperties`, o mesmo que `DeliveryModes.Persistent`", isCorrect: true },
                            { text: "`Durable = true` na `BasicProperties`, o mesmo que declarar a fila durável", isCorrect: false },
                            { text: "`mandatory: true` no `BasicPublishAsync`, que obriga o broker a guardar em disco", isCorrect: false },
                            { text: "`ContentType = \"application/json\"`, que marca o corpo como dado de negócio", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A fila `faturamento` existe no broker como durável. Um deploy novo passa a declará-la com `durable: false`. O que acontece quando o serviço sobe?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker converte a fila para não durável e preserva as mensagens atuais", isCorrect: false },
                            { text: "O broker apaga a fila antiga e cria uma nova, perdendo as mensagens", isCorrect: false },
                            { text: "O broker ignora a diferença e entrega a fila durável que já existia lá", isCorrect: false },
                            { text: "O broker recusa a declaração com 406 PRECONDITION_FAILED e fecha o canal", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No RabbitMQ 4.3, um serviço declara uma fila nova com `durable: false, exclusive: false, autoDelete: false`, como num tutorial antigo. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "A fila é criada como quorum queue, que virou o tipo padrão de todo vhost", isCorrect: false },
                            { text: "A declaração é negada por padrão, e o broker fecha a conexão com erro 541", isCorrect: true },
                            { text: "A fila é criada como durável, e o broker só registra um aviso no log", isCorrect: false },
                            { text: "A fila é criada e some no próximo restart, como acontecia nas versões 3.x", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para economizar disco, um time publica os eventos de pedido como transientes (`Persistent = false`) numa quorum queue, achando que assim eles ficam só em memória. O broker reinicia. O que acontece com esses eventos?",
                        difficulty: "dificil",
                        options: [
                            { text: "Se perdem, porque a quorum queue respeita o modo transiente e guarda tudo só em memória", isCorrect: false },
                            { text: "Voltam só se a fila tiver réplicas em três nós, porque a cópia vem de outro nó", isCorrect: false },
                            { text: "Voltam, porque a quorum queue grava toda mensagem em disco, qualquer que seja o modo", isCorrect: true },
                            { text: "Se perdem com a fila, porque mensagem transiente torna a quorum queue transitória", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Publisher confirms: a prova de que o broker guardou",
                blocks: [
                    {
                        type: "text",
                        value: "# Publisher confirms: a prova de que o broker guardou\n\nO serviço de pedidos grava no log \"evento pedido.criado publicado\" e segue a vida. O faturamento nunca recebe o evento. O log não mentiu: sem confirmação, o `await channel.BasicPublishAsync(...)` termina quando o cliente entregou os bytes para a conexão, não quando o broker assumiu a mensagem. Entre um momento e outro o broker pode cair, a mensagem pode não ter fila nenhuma para ir, ou o broker pode recusá-la, e o produtor não fica sabendo de nada.\n\n**Publisher confirms** (confirmações para o publicador) resolvem isso: para cada mensagem, o broker manda de volta um **ack** (assumi a responsabilidade) ou um **nack** (não assumi). Com eles, \"publicado\" passa a significar \"o broker confirmou\", e o que não foi confirmado pode ser reenviado.\n\n## Ligando confirms no cliente 7.x\n\nNo 7.x, confirmação é opção do canal, escolhida na criação com `CreateChannelOptions`. (No cliente 6.x era `ConfirmSelect()` seguido de `WaitForConfirmsOrDie()`, que não existem mais.) São três peças:\n\n- `publisherConfirmationsEnabled`: liga o modo de confirmação; o broker passa a mandar ack ou nack para cada publicação daquele canal.\n- `publisherConfirmationTrackingEnabled`: o cliente acompanha cada publicação por você. Com ele ligado, o `await` do `BasicPublishAsync` **só termina quando o broker confirma**, e lança exceção em nack ou em devolução.\n- `outstandingPublisherConfirmationsRateLimiter`: apesar do nome, um limitador de publicações em andamento ao mesmo tempo, assunto do fim da aula.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: publicar e só seguir quando o broker confirmar\nusing System.Text;\nusing RabbitMQ.Client;\nusing RabbitMQ.Client.Exceptions;\n\nvar factory = new ConnectionFactory { HostName = \"localhost\" };\nawait using IConnection conn = await factory.CreateConnectionAsync();\n\nvar opcoes = new CreateChannelOptions(\n    publisherConfirmationsEnabled: true,\n    publisherConfirmationTrackingEnabled: true,\n    outstandingPublisherConfirmationsRateLimiter: new ThrottlingRateLimiter(256));\nawait using IChannel channel = await conn.CreateChannelAsync(opcoes);\n\nawait channel.QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false,\n    autoDelete: false, arguments: null);\n\nvar props = new BasicProperties { Persistent = true, ContentType = \"application/json\" };\nbyte[] corpo = Encoding.UTF8.GetBytes(\"\"\"{\"pedidoId\":42}\"\"\");\nstring routingKey = args.Length > 0 ? args[0] : \"faturamento\";\n\ntry\n{\n    await channel.BasicPublishAsync(exchange: \"\", routingKey: routingKey,\n        mandatory: true, basicProperties: props, body: corpo);\n    Console.WriteLine(\"confirmada: o broker assumiu a mensagem\");\n}\ncatch (PublishReturnException ex)\n{\n    // mandatory: true e nenhuma fila recebeu a mensagem\n    Console.WriteLine($\"sem rota: {ex.ReplyCode} {ex.ReplyText}\");\n}\ncatch (PublishException ex)\n{\n    // nack: o broker não assumiu a mensagem\n    Console.WriteLine($\"recusada pelo broker, sequência {ex.PublishSequenceNumber}\");\n}",
                    },
                    {
                        type: "text",
                        value: "A ordem dos `catch` importa: `PublishReturnException` herda de `PublishException`, então vem primeiro (na ordem inversa, o compilador recusa com o erro CS0160). Rodando com `dotnet run -- rota.que.nao.existe`, a saída é `sem rota: 312 NO_ROUTE`: com `mandatory: true`, o broker devolve a mensagem antes do ack, o cliente transforma a devolução em exceção, e o canal continua aberto.\n\n## O que o ack quer dizer\n\nO broker só manda o ack quando assumiu a mensagem de verdade. Para mensagem persistente numa fila clássica durável, isso é **depois de gravar em disco**; numa quorum queue, **depois que a maioria das réplicas** aceitou a mensagem. Por isso confirm e persistência andam juntos: um sem o outro deixa aberta a janela entre receber e gravar, vista na aula anterior. A tabela resume o que cada situação vira no 7.x com rastreamento ligado (todas conferidas contra um RabbitMQ 4.3).",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\", \"O que o broker faz\", \"O que o await faz\"], [\"Roteada para fila durável e gravada\", \"Manda ack\", \"Termina normalmente\"], [\"Sem fila de destino, `mandatory: false`\", \"Manda ack e **descarta** a mensagem\", \"Termina normalmente\"], [\"Sem fila de destino, `mandatory: true`\", \"Devolve (312 NO_ROUTE) e manda ack\", \"Lança `PublishReturnException`\"], [\"A fila recusou a mensagem\", \"Manda nack\", \"Lança `PublishException` com `IsReturn` falso\"], [\"A exchange não existe\", \"Fecha o canal com 404 NOT_FOUND\", \"Lança `AlreadyClosedException`\"]]",
                    },
                    {
                        type: "text",
                        value: "A linha que mais engana é a segunda: sem `mandatory`, mensagem sem rota é **confirmada** e jogada fora. Confirm diz que o broker assumiu a mensagem, não que alguma fila a recebeu; publique com `mandatory: true` sempre que a mensagem precisar chegar a algum lugar. Já o nack é raro: aparece quando uma fila não consegue aceitar a mensagem, seja por erro interno no processo da fila, seja por limite de tamanho configurado para recusar publicação.\n\n## O custo de confirmar uma a uma\n\nEsperar cada confirmação deixa o produtor parado uma ida e volta inteira, mais a gravação em disco, por mensagem. Num teste com o broker no Docker da mesma máquina (latência quase zero), publicando 5.000 mensagens persistentes de 200 bytes: sem confirms, cerca de 40 ms; confirmando uma a uma, cerca de 700 ms; em lotes de 100, cerca de 75 ms. Numa rede de verdade a diferença cresce: com 2 ms de ida e volta, confirmar uma a uma nunca fica abaixo de 10 segundos para as mesmas 5.000. O caminho é deixar várias confirmações em voo ao mesmo tempo: disparar as publicações sem esperar cada uma e aguardar o lote, que é o padrão do tutorial oficial do cliente 7.x.",
                    },
                    {
                        type: "code",
                        value: "// Publicar em lotes: até 100 confirmações em voo ao mesmo tempo\nvar pendentes = new List<(Pedido Pedido, ValueTask Envio)>(capacity: 100);\nvar falharam = new List<Pedido>();\n\nforeach (Pedido pedido in pedidos)\n{\n    byte[] corpo = JsonSerializer.SerializeToUtf8Bytes(pedido);\n    ValueTask envio = channel.BasicPublishAsync(exchange: \"\", routingKey: \"faturamento\",\n        mandatory: true, basicProperties: props, body: corpo);\n    pendentes.Add((pedido, envio));\n\n    if (pendentes.Count == 100)\n        await AguardarLoteAsync(pendentes, falharam);\n}\nawait AguardarLoteAsync(pendentes, falharam);\nConsole.WriteLine($\"falharam {falharam.Count}: republicar\");\n\nstatic async Task AguardarLoteAsync(List<(Pedido Pedido, ValueTask Envio)> pendentes,\n    List<Pedido> falharam)\n{\n    foreach (var (pedido, envio) in pendentes)\n    {\n        try\n        {\n            await envio;\n        }\n        catch (PublishException ex)\n        {\n            Console.WriteLine($\"pedido {pedido.Id} sem confirmação: {ex.Message}\");\n            falharam.Add(pedido);\n        }\n    }\n    pendentes.Clear();\n}",
                    },
                    {
                        type: "text",
                        value: "## Quem segura as confirmações pendentes\n\nCada publicação esperando ack ocupa memória no cliente até a confirmação chegar, e um laço que dispara sem aguardar acumula milhares delas. O nome do terceiro argumento engana: `outstandingPublisherConfirmationsRateLimiter` **não** conta confirmações pendentes. O cliente devolve a permissão do limitador logo depois de enviar a mensagem, antes de esperar o ack, então o que ele controla são as chamadas de publicação em andamento ao mesmo tempo. Com `ThrottlingRateLimiter(256)`, quando mais da metade das permissões está em uso, cada chamada nova espera um atraso proporcional (até 1 segundo); quando a fila de espera dele, do mesmo tamanho do limite, enche, a chamada falha com `InvalidOperationException` (`Could not acquire a lease from the rate limiter`). Num teste com `ThrottlingRateLimiter(128)` e 50 mil publicações disparadas sem `await`, mais de 47 mil falharam assim; sem limitador, as 50 mil passaram, com dezenas de milhares pendentes ao mesmo tempo.\n\nSegurar a quantidade de confirmações pendentes é trabalho da aplicação: publicar em lotes e aguardar cada lote antes do próximo, como no exemplo acima, que nunca passa de 100 pendentes nem chega perto do freio do limitador. O limitador fica como proteção extra, e no 7.x ele só existe se você passar: sem o terceiro argumento, o construtor de `CreateChannelOptions` deixa `null` (apesar de o comentário da biblioteca falar em 128), e `null` desliga até esse freio.\n\nCom o rastreamento desligado, o broker continua mandando ack e nack, mas a correlação fica com você: anotar o `GetNextPublishSequenceNumberAsync` antes de cada publicação e tratar os eventos `BasicAcksAsync` e `BasicNacksAsync`, lembrando que um ack pode valer para várias mensagens de uma vez (`Multiple`). Só compensa quando você precisa desse controle fino; no dia a dia, deixe o cliente rastrear.",
                    },
                    {
                        type: "quote",
                        value: "Sem confirmação, publicar é torcer; com ela, o `await` só termina quando o broker assumiu a mensagem, e o que falhou vira exceção para reenviar. Confirme em lotes aguardados, com `mandatory: true`: é o lote, não o limitador, que segura as pendências.",
                    },
                ],
                questions: [
                    {
                        statement: "No cliente `RabbitMQ.Client` 7.x, onde se ligam os publisher confirms?",
                        difficulty: "facil",
                        options: [
                            { text: "No `ConfirmSelect()` chamado no canal logo depois de abri-lo, antes de publicar", isCorrect: false },
                            { text: "No `CreateChannelOptions` passado ao criar o canal, com as confirmações ligadas", isCorrect: true },
                            { text: "No `BasicProperties` de cada mensagem, marcando `Persistent = true` no envio", isCorrect: false },
                            { text: "No `QueueDeclareAsync`, com o argumento `x-confirm` igual a `true` na fila", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com o rastreamento de confirmação ligado no cliente 7.x, quando o `await channel.BasicPublishAsync(...)` termina?",
                        difficulty: "facil",
                        options: [
                            { text: "Quando o broker confirma a mensagem; em nack ou devolução, ele lança exceção", isCorrect: true },
                            { text: "Quando a mensagem é entregue a pelo menos um consumidor conectado à fila", isCorrect: false },
                            { text: "Quando um consumidor processa a mensagem e manda o ack dele para o broker", isCorrect: false },
                            { text: "Quando os bytes saem do cliente; a confirmação chega mais tarde, por um evento", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um produtor com confirms ligados publica com `mandatory: false` numa routing key que não casa com binding nenhum. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker manda nack, e o `await` lança `PublishException` com `IsReturn` falso", isCorrect: false },
                            { text: "O broker devolve a mensagem com 312 NO_ROUTE, e o `await` lança exceção", isCorrect: false },
                            { text: "O broker guarda a mensagem na exchange até aparecer um binding que case", isCorrect: false },
                            { text: "O broker manda ack e descarta a mensagem, e o `await` termina sem erro nenhum", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um job publica 50 mil mensagens persistentes com `await` em cada `BasicPublishAsync`, com confirms ligados, e leva quase dois minutos. A latência de rede até o broker é de 2 ms. Qual é a causa e a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "Confirmação pesa no broker; desligar a persistência das mensagens resolve o tempo", isCorrect: false },
                            { text: "Cada envio espera uma ida e volta; manter várias em voo e aguardar o lote resolve", isCorrect: true },
                            { text: "Um canal só é lento por natureza; abrir uma conexão nova por mensagem resolve", isCorrect: false },
                            { text: "O limitador de publicações trava os envios; passar `null` como limitador resolve", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um time cria o canal com `new CreateChannelOptions(publisherConfirmationsEnabled: true, publisherConfirmationTrackingEnabled: true)`, dispara 200 mil `BasicPublishAsync` guardando as `ValueTask` numa lista e só aguarda tudo no fim. No cliente 7.x, o que limita quantas confirmações ficam pendentes ao mesmo tempo?",
                        difficulty: "dificil",
                        options: [
                            { text: "O limite padrão de 128 pendentes, que segura novas publicações até chegarem os acks", isCorrect: false },
                            { text: "O broker, que fecha o canal quando passa de 65.535 confirmações sem resposta", isCorrect: false },
                            { text: "Nada no cliente: só o próprio código, aguardando em lotes, segura as pendências", isCorrect: true },
                            { text: "O prefetch do canal, que também vale para as publicações aguardando confirmação", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Ack, nack e reject: o consumidor decide o destino",
                blocks: [
                    {
                        type: "text",
                        value: "# Ack, nack e reject: o consumidor decide o destino\n\nO consumidor do faturamento recebe um pedido e tenta cobrar; o gateway de pagamento está fora do ar. E agora? Com `autoAck: false`, a mensagem continua sob responsabilidade do broker até o consumidor dizer o que fazer com ela, identificando a entrega pela **delivery tag** (o número que o canal dá a cada entrega). Há três respostas: **ack** (deu certo, pode apagar), **reject** e **nack** (não deu certo), e as duas últimas trazem a escolha entre devolver a mensagem para a fila (**requeue**) ou tirá-la de lá.\n\nErrar custa caro nos dois sentidos: ack de mensagem que não foi processada é mensagem perdida, e devolver para a fila sem critério cria um laço que roda para sempre.",
                    },
                    {
                        type: "table",
                        value: "[[\"Método\", \"Quantas mensagens\", \"Devolve para a fila?\", \"Quando usar\"], [\"`BasicAckAsync(tag, multiple)`\", \"Uma, ou todas até a tag com `multiple: true`\", \"Não se aplica\", \"Processou com sucesso\"], [\"`BasicRejectAsync(tag, requeue)`\", \"Só uma\", \"Sim, com `requeue: true`\", \"Recusar uma entrega (método do AMQP 0.9.1)\"], [\"`BasicNackAsync(tag, multiple, requeue)`\", \"Uma, ou todas até a tag com `multiple: true`\", \"Sim, com `requeue: true`\", \"Recusar várias de uma vez (extensão do RabbitMQ)\"]]",
                    },
                    {
                        type: "text",
                        value: "## requeue: devolver ou tirar da fila\n\nCom `requeue: true`, a mensagem volta para a fila (na posição original, quando dá) e é entregue de novo, a este ou a outro consumidor, com `Redelivered = true`. A devolução é **imediata**: a nova entrega acontece em milissegundos, então ela só ajuda quando a falha passa muito rápido ou é coisa de uma instância só, que outro consumidor pode não ter.\n\nCom `requeue: false`, a mensagem sai da fila. Numa fila sem configuração extra, isso é descarte puro: num teste, depois de um reject sem requeue, a fila ficou com zero mensagens. Para onde a mensagem recusada pode ir em vez de sumir é assunto do próximo módulo.",
                    },
                    {
                        type: "code",
                        value: "// Consumidor que decide entre ack, devolver uma vez e descartar\nconsumer.ReceivedAsync += async (_, ea) =>\n{\n    try\n    {\n        Pedido pedido = JsonSerializer.Deserialize<Pedido>(ea.Body.Span)\n            ?? throw new JsonException(\"corpo vazio\");\n        await faturamento.FaturarAsync(pedido);\n        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n    catch (JsonException ex)\n    {\n        // malformada: tentar de novo não conserta\n        Console.WriteLine($\"descartando mensagem malformada: {ex.Message}\");\n        await channel.BasicRejectAsync(ea.DeliveryTag, requeue: false);\n    }\n    catch (HttpRequestException ex) when (!ea.Redelivered)\n    {\n        // primeira falha passageira: devolve para a fila uma vez\n        Console.WriteLine($\"devolvendo para nova tentativa: {ex.Message}\");\n        await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true);\n    }\n    catch (Exception ex)\n    {\n        // já tinha voltado e falhou de novo: não deixa girar em laço\n        Console.WriteLine($\"desistindo da mensagem: {ex.Message}\");\n        await channel.BasicRejectAsync(ea.DeliveryTag, requeue: false);\n    }\n};",
                    },
                    {
                        type: "text",
                        value: "Cada tipo de falha tem a sua resposta. Mensagem malformada não melhora com nova tentativa e sai com `requeue: false`. Falha passageira ganha **uma** devolução, e o `when (!ea.Redelivered)` garante que seja uma só: na segunda falha, a mensagem cai no último `catch` e é descartada. Rodando com três mensagens (uma válida, uma com JSON quebrado e uma cujo pagamento falha), a saída foi o pedido 1 faturado, a malformada descartada, a terceira devolvida uma vez e depois abandonada, e a fila vazia no fim.\n\nO `Redelivered` é uma pista, não um contador: ele também vem `true` quando a mensagem voltou porque um consumidor caiu antes do ack, e nesse caso ela ganha uma tentativa a menos. Para a decisão de devolver no máximo uma vez, é bom o bastante.",
                    },
                    {
                        type: "text",
                        value: "## O laço infinito de requeue\n\nO erro mais comum com requeue é um `catch` genérico que faz nack com `requeue: true` para qualquer falha. Uma mensagem que **sempre** falha (um campo que o código não sabe tratar, um pedido de um cliente que já foi apagado) volta para a fila, é entregue de novo na hora, falha de novo, e assim para sempre: a fila clássica não tem freio nenhum para isso. O código abaixo reproduz o laço com uma única mensagem.",
                    },
                    {
                        type: "code",
                        value: "// O laço: uma mensagem que sempre falha, rejeitada sempre com requeue\nint entregas = 0;\nvar consumer = new AsyncEventingBasicConsumer(channel);\nconsumer.ReceivedAsync += async (_, ea) =>\n{\n    entregas++; // o processamento falharia aqui, toda vez\n    await channel.BasicRejectAsync(ea.DeliveryTag, requeue: true);\n};\nawait channel.BasicConsumeAsync(\"pedidos.envenenados\", autoAck: false, consumer: consumer);\nawait Task.Delay(TimeSpan.FromSeconds(2));\nConsole.WriteLine($\"entregas da mesma mensagem em 2 s: {entregas}\");\n// saída num teste com o broker local: entregas da mesma mensagem em 2 s: 23834",
                    },
                    {
                        type: "text",
                        value: "Mais de 20 mil entregas da mesma mensagem em 2 segundos, num broker local: CPU do consumidor e do broker queimando, log enchendo com o mesmo erro, e as outras mensagens da fila disputando espaço com a envenenada. A regra é **nunca devolver sem critério**: devolva só falha passageira, no máximo uma vez, e tire da fila o resto.\n\n## multiple: true\n\nAck com `multiple: true` confirma todas as entregas pendentes do canal com tag até a informada, inclusive; nack com `multiple: true` faz o mesmo para recusar. Num teste com cinco entregas (tags 1 a 5), um nack múltiplo com requeue na tag 3 devolveu as três primeiras, e um ack múltiplo na 5 confirmou a 4 e a 5. Funciona bem quando o processamento é em ordem. Com consumidor paralelo (`ConsumerDispatchConcurrency` maior que 1) é uma armadilha dupla: o ack múltiplo da tag 12 confirma também a 10, que ainda pode estar em processamento e falhar depois, e quando o handler da 10 termina e confirma a própria tag, ela já não existe, e o broker fecha o canal com 406. Num teste com quatro handlers em paralelo, o canal caiu assim logo nas primeiras mensagens.",
                    },
                    {
                        type: "text",
                        value: "## Erros que derrubam o canal ou prendem a mensagem\n\n- **Ack duplicado.** Confirmar a mesma tag duas vezes (no `try` e de novo num `finally`, por exemplo) faz o broker fechar o canal com `406 PRECONDITION_FAILED - unknown delivery tag`, e todas as entregas sem ack daquele canal voltam para a fila. Num teste com o cliente 7.2.2 e um consumidor ativo, o estrago foi além: logo depois do 406, o próprio cliente derrubou a conexão inteira com um erro interno, e a recuperação automática religou tudo só para o erro se repetir na mensagem seguinte.\n- **Ack no canal errado.** A delivery tag é numerada por canal, e dois canais recebem cada um a sua tag 1. Confirmar num canal a entrega que chegou por outro dá o mesmo 406 quando aquele número não existe ali. Quando existe, é pior: num teste, o ack feito no canal errado confirmou em silêncio outra mensagem, a que aquele canal tinha recebido com o mesmo número, e nenhum erro apareceu.\n- **Exceção no handler.** Se o `ReceivedAsync` lança exceção sem ack nem nack, o cliente 7.x só dispara o evento `CallbackExceptionAsync` do canal: a mensagem fica `unacked` enquanto o canal viver. Com prefetch 10, dez exceções dessas e o consumidor para de receber. No 4.3, o consumer timeout (30 minutos por padrão) só existe em quorum queue: estourado o prazo, o broker cancela o consumidor e devolve a mensagem para a fila. Em fila clássica, ela fica presa até o canal fechar.",
                    },
                    {
                        type: "quote",
                        value: "Ack só depois de processar, reject ou nack quando não deu, e requeue apenas para falha passageira, uma vez só. Ack repetido ou no canal errado é bug que derruba o canal ou confirma a mensagem errada, e exceção no handler deixa a mensagem presa como `unacked`.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre `BasicRejectAsync` e `BasicNackAsync`?",
                        difficulty: "facil",
                        options: [
                            { text: "O reject sempre descarta; só o nack consegue devolver a mensagem para a fila", isCorrect: false },
                            { text: "O nack avisa o produtor da falha; o reject avisa só o broker e mais ninguém", isCorrect: false },
                            { text: "O reject só vale em fila clássica; em quorum queue o broker aceita só nack", isCorrect: false },
                            { text: "O nack aceita `multiple` e recusa várias de uma vez; o reject recusa só uma", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Numa fila sem nenhuma configuração extra, o que acontece com a mensagem recusada com `BasicRejectAsync(tag, requeue: false)`?",
                        difficulty: "facil",
                        options: [
                            { text: "Sai da fila e é descartada, sem ir para outro consumidor", isCorrect: true },
                            { text: "Volta para o fim da fila e é entregue a outro consumidor", isCorrect: false },
                            { text: "Fica como `unacked` no canal até ele ser fechado", isCorrect: false },
                            { text: "Volta para o produtor, que recebe um nack da publicação", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O `ReceivedAsync` de um consumidor (cliente 7.x, `autoAck: false`) lança exceção antes de chamar ack, nack ou reject. O que acontece com a mensagem?",
                        difficulty: "medio",
                        options: [
                            { text: "O cliente faz reject sem requeue sozinho, e a mensagem é descartada pelo broker", isCorrect: false },
                            { text: "O broker fecha o canal com erro 406, e a mensagem volta para a fila na hora", isCorrect: false },
                            { text: "Fica `unacked` até o canal fechar; o cliente só dispara `CallbackExceptionAsync`", isCorrect: true },
                            { text: "O cliente faz nack com requeue sozinho, e a mensagem volta na mesma hora para a fila", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Este consumidor confirma no `try` e, por garantia, de novo no `finally`. O que acontece quando a primeira mensagem é processada com sucesso?\n\n```csharp\nconsumer.ReceivedAsync += async (_, ea) =>\n{\n    try\n    {\n        await ProcessarAsync(ea.Body);\n        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n    finally\n    {\n        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n};\n```",
                        difficulty: "medio",
                        options: [
                            { text: "O segundo ack é ignorado, porque ack repetido é idempotente no protocolo", isCorrect: false },
                            { text: "O segundo ack usa uma tag já confirmada, e o broker fecha o canal com 406", isCorrect: true },
                            { text: "O cliente percebe a repetição e lança exceção antes de enviar o segundo ack", isCorrect: false },
                            { text: "O segundo ack confirma a próxima entrega da fila, que some sem ser processada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um consumidor usa `ConsumerDispatchConcurrency = 4` e prefetch 20. Para economizar idas ao broker, cada handler, ao terminar, chama `BasicAckAsync(ea.DeliveryTag, multiple: true)`. Qual é o risco?",
                        difficulty: "dificil",
                        options: [
                            { text: "O ack múltiplo devolve para a fila as tags menores que ainda estão em processamento", isCorrect: false },
                            { text: "O ack da 12 leva junto a 10 em andamento, e o ack que a 10 manda depois dá 406", isCorrect: true },
                            { text: "Nenhum, porque o cliente segura o ack múltiplo até as tags menores terminarem", isCorrect: false },
                            { text: "O broker ignora `multiple: true` quando o prefetch passa de 1 e confirma só a tag", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Quorum queues: a fila replicada por Raft",
                blocks: [
                    {
                        type: "text",
                        value: "# Quorum queues: a fila replicada por Raft\n\nTudo o que vimos até aqui protege contra o restart do broker, não contra perder o nó. Fila durável com mensagem persistente vive no disco de **um** nó: se a máquina some (disco queimado, instância encerrada, zona fora do ar), a fila vai junto, e com ela os pedidos. Para sobreviver a isso é preciso ter cópias em outros nós do cluster, e no RabbitMQ 4.x esse recurso tem nome: **quorum queue**.\n\n## Do espelhamento ao Raft\n\nDurante anos, a resposta foi o espelhamento de fila clássica, configurado por policies `ha-mode`. Ele foi marcado como obsoleto em 2021 e **removido no RabbitMQ 4.0**, por problemas de projeto: sincronizar uma réplica nova bloqueava a fila inteira, e numa falha uma réplica atrasada podia ser promovida e perder mensagens que já tinham sido confirmadas.\n\nA quorum queue usa o algoritmo de consenso **Raft**. Cada fila tem um **líder**, que recebe as publicações e faz as entregas, e **seguidores** em outros nós. Toda operação entra num log replicado, e uma mensagem só é aceita (e só então o publisher confirm sai) quando a **maioria** das réplicas a gravou. Se o líder cai, os seguidores elegem outro entre os que têm o log em dia. No 4.x, fila replicada é quorum queue (ou stream, para log com releitura); a fila clássica continua existindo, mas mora num nó só.",
                    },
                    {
                        type: "code",
                        value: "// Quorum queue: o tipo vai no argumento x-queue-type, só na declaração\nvar argumentos = new Dictionary<string, object?>\n{\n    [\"x-queue-type\"] = \"quorum\",\n    [\"x-quorum-initial-group-size\"] = 3 // réplicas na criação; 3 já é o padrão\n};\nawait channel.QueueDeclareAsync(\"pagamentos\", durable: true, exclusive: false,\n    autoDelete: false, arguments: argumentos);",
                    },
                    {
                        type: "text",
                        value: "## Maioria, e por que número ímpar\n\nA maioria de N réplicas é N/2 + 1 (com divisão inteira), e a fila só funciona enquanto a maioria estiver de pé. A conta mostra por que o número de réplicas deve ser **ímpar**:",
                    },
                    {
                        type: "table",
                        value: "[[\"Réplicas\", \"Maioria\", \"Réplicas que podem cair\"], [\"1\", \"1\", \"0\"], [\"2\", \"2\", \"0\"], [\"3\", \"2\", \"1\"], [\"4\", \"3\", \"1\"], [\"5\", \"3\", \"2\"], [\"7\", \"4\", \"3\"]]",
                    },
                    {
                        type: "text",
                        value: "Passar de 3 para 4 réplicas aumenta o custo (mais disco, mais rede, mais nós para confirmar cada escrita) sem tolerar uma falha a mais. Por isso o padrão de `x-quorum-initial-group-size` é **3**, o mínimo prático para alta disponibilidade, e a recomendação oficial é grupo de tamanho ímpar. Perdida a maioria, a fila **para**: sem confirm para quem publica e sem entrega para quem consome, até a maioria voltar. É a escolha do Raft pela consistência: melhor parar do que aceitar uma mensagem que pode sumir.\n\n## O que muda para quem programa\n\n- **O tipo é decidido na declaração e nunca muda.** `x-queue-type` não pode ser definido nem alterado por policy. Todo serviço que declara a fila precisa mandar o mesmo tipo, e muita gente migra o serviço novo e esquece o antigo, que continua declarando sem o argumento: no vhost padrão, isso conta como `classic`, e num teste com o 4.3 a declaração contra a quorum queue existente deu `406 PRECONDITION_FAILED - inequivalent arg 'x-queue-type'`. Para levar uma fila clássica para quorum, crie a fila nova e migre os consumidores.\n- **Sem exclusiva, sem auto-delete, sem transitória.** Quorum queue é sempre durável, e `exclusive: true` ou `autoDelete: true` são recusados com 406.\n- **Tudo vai para o disco**, com ou sem `Persistent`, e o confirm espera a maioria: publicar fica um pouco mais lento que numa fila clássica.\n- **Tipo padrão por vhost.** Um vhost criado com `--default-queue-type quorum` faz a fila declarada sem `x-queue-type` nascer quorum, e a redeclaração sem o argumento deixa de dar erro: uma proteção contra o serviço que esqueceu de mandar o tipo.",
                    },
                    {
                        type: "code",
                        value: "# terminal: quem é o líder e onde estão as réplicas (aqui, um nó só no Docker)\ndocker exec rabbitmq rabbitmqctl -q list_queues name type leader members\nname        type    leader           members\npagamentos  quorum  rabbit@rabbitmq  [rabbit@rabbitmq]\n\n# vhost em que fila declarada sem tipo já nasce quorum queue\ndocker exec rabbitmq rabbitmqctl add_vhost loja --default-queue-type quorum\nAdding vhost \"loja\" ...",
                    },
                    {
                        type: "text",
                        value: "## Quando a fila clássica ainda serve\n\nA própria documentação avisa que quorum queue não foi feita para todo caso de fila. A clássica continua sendo a escolha certa para:\n\n- **Fila temporária**: a fila exclusiva de respostas de cada instância, a fila de notificações que nasce e morre com o processo. Quorum queue não aceita exclusiva, e criar e apagar filas replicadas o tempo todo custa caro.\n- **Dado que pode se perder**: um aviso para invalidar cache, uma métrica de passagem, em que perder mensagens quando o nó cai não faz diferença.\n- **Ambiente de um nó só** (desenvolvimento, teste), em que não há réplica a ganhar.\n\nPedido, pagamento, nota fiscal, tudo o que não pode sumir quando um nó cai vai em quorum queue.",
                    },
                    {
                        type: "quote",
                        value: "Quorum queue replica a fila por Raft e só confirma quando a maioria gravou; use número ímpar de réplicas (3 é o padrão), declare o tipo do mesmo jeito em todo serviço, e deixe a fila clássica para o que é temporário ou descartável.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que fila clássica espelhada não é opção num RabbitMQ 4.x?",
                        difficulty: "facil",
                        options: [
                            { text: "O espelhamento virou automático, e toda fila clássica já nasce replicada", isCorrect: false },
                            { text: "O espelhamento passou a exigir licença comercial a partir da versão 4.0", isCorrect: false },
                            { text: "O espelhamento só funciona com AMQP 1.0, que virou o protocolo do núcleo", isCorrect: false },
                            { text: "O espelhamento foi removido no 4.0; fila replicada agora é quorum queue", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Como se declara uma quorum queue pelo cliente .NET?",
                        difficulty: "facil",
                        options: [
                            { text: "Com `exclusive: true` e o argumento `x-queue-mode` igual a `quorum`", isCorrect: false },
                            { text: "Com `durable: false` e o argumento `x-quorum-initial-group-size`", isCorrect: false },
                            { text: "Com `durable: true` e o argumento `x-queue-type` igual a `quorum`", isCorrect: true },
                            { text: "Com uma policy `ha-mode: quorum` aplicada depois de criar a fila", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma quorum queue tem 4 réplicas, uma em cada nó. Quantos desses nós podem cair sem que a fila pare?",
                        difficulty: "medio",
                        options: [
                            { text: "Três, porque basta o líder estar de pé para a fila funcionar", isCorrect: false },
                            { text: "Nenhum, porque com número par de réplicas não existe eleição", isCorrect: false },
                            { text: "Dois, porque metade das réplicas continua de pé para atender", isCorrect: false },
                            { text: "Um só, o mesmo que com 3 réplicas, porque a maioria de 4 é 3", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em qual destes casos a fila clássica continua sendo a escolha certa no RabbitMQ 4.x?",
                        difficulty: "medio",
                        options: [
                            { text: "A fila exclusiva de respostas de cada instância, criada e apagada o tempo todo", isCorrect: true },
                            { text: "A fila de pagamentos, que não pode perder mensagem quando um nó do cluster cai", isCorrect: false },
                            { text: "A fila de notas fiscais, com consumidores rodando em três zonas diferentes", isCorrect: false },
                            { text: "A fila de faturamento, que precisa seguir de pé durante o upgrade do cluster", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O serviço novo declara `faturamento` como quorum queue. Um serviço antigo, no mesmo vhost (de tipo padrão `classic`), declara a mesma fila com `QueueDeclareAsync(\"faturamento\", durable: true, exclusive: false, autoDelete: false)`, sem argumentos. O que acontece com o serviço antigo no RabbitMQ 4.3?",
                        difficulty: "dificil",
                        options: [
                            { text: "Converte a fila de volta para clássica e mantém as mensagens que estavam nela", isCorrect: false },
                            { text: "Recebe a quorum queue existente, porque o tipo omitido é simplesmente ignorado", isCorrect: false },
                            { text: "Recebe 406 por argumento `x-queue-type` divergente, e o canal é fechado", isCorrect: true },
                            { text: "Cria uma segunda fila clássica com o mesmo nome, em outro nó do cluster", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Queda e reconexão: o que o cliente recupera sozinho",
                blocks: [
                    {
                        type: "text",
                        value: "# Queda e reconexão: o que o cliente recupera sozinho\n\nA conexão longa e reaproveitada, que é o jeito certo de usar o cliente, vai cair um dia: um upgrade do broker com reinício dos nós, uma falha de rede de alguns segundos, um load balancer que derruba conexão TCP ociosa. Três perguntas decidem se isso vira incidente: quanto tempo leva para perceber que a conexão morreu, quem reconecta, e o que acontece com as mensagens que estavam no meio do caminho.\n\n## Heartbeat: descobrir que a conexão morreu\n\nO TCP sozinho pode levar muito tempo para notar que o outro lado sumiu (uma máquina que desligou sem fechar a conexão, um firewall que descartou o estado). O **heartbeat** do AMQP resolve isso: cliente e servidor combinam um timeout na abertura da conexão (vale o menor dos dois; se um lado pedir 0, vale o do outro), trocam um quadro de heartbeat a cada metade desse tempo e, depois de dois quadros perdidos, consideram o outro lado inalcançável. O servidor sugere 60 segundos, e o `RequestedHeartbeat` do cliente .NET também é 60 por padrão.\n\nA documentação recomenda valores **entre 5 e 20 segundos** para a maioria dos ambientes: abaixo de 5, falso positivo é provável. O tráfego do heartbeat ainda impede que um proxy ou load balancer derrube a conexão por ociosidade. Desligar (valor 0) é fortemente desaconselhado.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: uma conexão preparada para cair e voltar\nvar factory = new ConnectionFactory\n{\n    HostName = \"localhost\",\n    ClientProvidedName = \"pedidos-api\",  // nome que aparece no painel\n    RequestedHeartbeat = TimeSpan.FromSeconds(15),\n    AutomaticRecoveryEnabled = true,     // já é o padrão no 7.x\n    TopologyRecoveryEnabled = true,      // redeclara filas, bindings e consumidores\n    NetworkRecoveryInterval = TimeSpan.FromSeconds(5)\n};\nawait using IConnection conn = await factory.CreateConnectionAsync();\n\nconn.ConnectionShutdownAsync += (_, ea) =>\n{\n    Console.WriteLine($\"{DateTime.Now:HH:mm:ss} conexão caiu: {ea.ReplyCode} {ea.ReplyText}\");\n    return Task.CompletedTask;\n};\nconn.RecoverySucceededAsync += (_, _) =>\n{\n    Console.WriteLine($\"{DateTime.Now:HH:mm:ss} conexão recuperada\");\n    return Task.CompletedTask;\n};\nconn.ConnectionRecoveryErrorAsync += (_, ea) =>\n{\n    Console.WriteLine($\"{DateTime.Now:HH:mm:ss} recuperação falhou: {ea.Exception.Message}\");\n    return Task.CompletedTask;\n};",
                    },
                    {
                        type: "text",
                        value: "## O que a recuperação automática faz, e o que não faz\n\nNo 7.x, a recuperação automática vem **ligada por padrão**; o exemplo só deixa isso explícito. Quando a conexão cai por falha de rede, heartbeat perdido ou fechamento forçado pelo broker, o cliente tenta de novo a cada `NetworkRecoveryInterval` (5 segundos por padrão) e, ao conseguir, reabre os canais, redeclara as exchanges, filas e bindings que aquela conexão declarou e registra de novo os consumidores. Os mesmos objetos `IConnection` e `IChannel` continuam valendo, sem precisar recriar nada.\n\nO que ela **não** faz:\n\n- **Não cuida da primeira conexão.** Se o broker está fora quando o serviço sobe, `CreateConnectionAsync` lança `BrokerUnreachableException` e ninguém tenta de novo por você: a subida precisa do seu próprio laço de retentativa.\n- **Não age sobre erro de canal.** Um 406 ou um 404 fecham o canal por erro de lógica, e isso não dispara recuperação nenhuma: o canal fica fechado, e o erro precisa ser corrigido.\n- **Não guarda o que você publicou durante a queda.** Enquanto a conexão está caída ou em recuperação, `BasicPublishAsync` lança `AlreadyClosedException`, e o cliente não enfileira nada para mandar depois. Muita gente só descobre isso no primeiro upgrade do broker, com eventos faltando e um punhado de exceções no log.\n\nA saída abaixo é de um publicador com o código de retentativa desta aula, rodando enquanto o broker passava por um `docker restart`.",
                    },
                    {
                        type: "code",
                        value: "# saída do publicador durante um docker restart do broker\n09:50:33 conexão caiu: 320 CONNECTION_FORCED - broker forced connection closure with reason 'shutdown'\n09:50:33 pedido-103: tentativa 1 falhou (320), nova em 1 s\n09:50:34 pedido-103: tentativa 2 falhou (320), nova em 2 s\n09:50:36 pedido-103: tentativa 3 falhou (320), nova em 3 s\n09:50:38 conexão recuperada\n09:50:50 na fila: 200 de 200",
                    },
                    {
                        type: "text",
                        value: "## O que estava em voo\n\n**Do lado do consumidor**, quando a conexão cai, o broker devolve para a fila tudo o que estava entregue e sem ack. Depois da recuperação essas mensagens chegam de novo, com `Redelivered = true` e delivery tags novas. Num teste com um consumidor que levava 15 segundos por mensagem e um restart no meio do processamento, a mesma mensagem foi entregue de novo logo após a recuperação e processada outra vez. Quando o primeiro processamento terminou e chamou `BasicAckAsync` com a tag antiga, o cliente **descartou o ack em silêncio**: ele sabe que a tag é de antes da queda e não a envia, porque mandá-la daria 406. Resultado: a mesma mensagem processada duas vezes, sem nenhum erro no log. Não é defeito, é a garantia de \"pelo menos uma vez\" funcionando, e é por isso que o consumidor precisa ser idempotente.\n\n**Do lado do produtor**, a publicação cuja confirmação não chegou antes da queda termina em exceção, e você não sabe se o broker gravou a mensagem ou não. Num teste com `docker kill` (morte abrupta) no meio de uma rajada, as 44.411 mensagens confirmadas estavam todas na fila depois do restart, e nenhuma das 8.689 que falharam. Isso não é regra: se o broker grava e a conexão cai antes de o ack chegar, a mensagem está lá e o produtor acha que falhou. A prática é **republicar tudo o que não foi confirmado, com o mesmo `MessageId`**, e deixar o consumidor descartar a duplicata.",
                    },
                    {
                        type: "code",
                        value: "// O MessageId nasce uma vez por pedido: a retentativa reenvia o mesmo id\nfor (int i = 1; i <= total; i++)\n{\n    var props = new BasicProperties { Persistent = true, MessageId = $\"pedido-{i}\" };\n    byte[] corpo = JsonSerializer.SerializeToUtf8Bytes(new { PedidoId = i });\n    await PublicarComRetentativaAsync(channel, \"faturamento.reconexao\", props, corpo);\n    await Task.Delay(100);\n}\n\nstatic async Task PublicarComRetentativaAsync(IChannel channel, string routingKey,\n    BasicProperties props, ReadOnlyMemory<byte> corpo, CancellationToken ct = default)\n{\n    for (int tentativa = 1; ; tentativa++)\n    {\n        try\n        {\n            await channel.BasicPublishAsync(exchange: \"\", routingKey: routingKey,\n                mandatory: true, basicProperties: props, body: corpo, cancellationToken: ct);\n            return;\n        }\n        catch (AlreadyClosedException ex) when (tentativa < 10)\n        {\n            // conexão caída ou em recuperação: o cliente não guarda a mensagem\n            int espera = Math.Min(tentativa, 5);\n            Console.WriteLine($\"{DateTime.Now:HH:mm:ss} {props.MessageId}: tentativa {tentativa} \" +\n                $\"falhou ({ex.ShutdownReason?.ReplyCode}), nova em {espera} s\");\n            await Task.Delay(TimeSpan.FromSeconds(espera), ct);\n        }\n    }\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\", \"O que acontece\", \"O que fazer\"], [\"Broker fora do ar na subida\", \"`CreateConnectionAsync` lança `BrokerUnreachableException`\", \"Laço de retentativa na inicialização\"], [\"Queda com mensagem em processamento\", \"O broker devolve a mensagem; o ack antigo é descartado pelo cliente\", \"Consumidor idempotente\"], [\"Queda com publicação sem confirmação\", \"O await lança exceção; a mensagem pode ou não estar no broker\", \"Republicar com o mesmo `MessageId`\"], [\"Publicação durante a queda\", \"`BasicPublishAsync` lança `AlreadyClosedException`\", \"Esperar e tentar de novo\"], [\"Canal fechado por 406 ou 404\", \"Não dispara recuperação; o canal fica fechado\", \"Corrigir o erro de lógica\"]]",
                    },
                    {
                        type: "quote",
                        value: "Heartbeat entre 5 e 20 segundos descobre a queda, e a recuperação automática refaz conexão, canais, topologia e consumidores; o que estava em voo é com você: republique o que não foi confirmado e aguente a mensagem que chega duas vezes.",
                    },
                ],
                questions: [
                    {
                        statement: "Para que serve o heartbeat de uma conexão AMQP?",
                        difficulty: "facil",
                        options: [
                            { text: "Para medir a latência de cada publicação e ajustar o prefetch dos consumidores", isCorrect: false },
                            { text: "Para acertar o relógio do cliente com o do broker e calcular o TTL de cada mensagem", isCorrect: false },
                            { text: "Para descobrir uma conexão morta que o TCP não percebeu e manter tráfego na ociosa", isCorrect: true },
                            { text: "Para avisar o broker de que o consumidor terminou de processar cada mensagem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O serviço sobe com o broker fora do ar, e o `CreateConnectionAsync` lança `BrokerUnreachableException`. A recuperação automática do cliente 7.x resolve isso sozinha?",
                        difficulty: "facil",
                        options: [
                            { text: "Não: a recuperação automática vem desligada no 7.x e precisa ser ligada no código", isCorrect: false },
                            { text: "Sim: o cliente tenta de novo a cada `NetworkRecoveryInterval` até o broker responder", isCorrect: false },
                            { text: "Sim, desde que o `TopologyRecoveryEnabled` esteja ligado na `ConnectionFactory`", isCorrect: false },
                            { text: "Não: ela só age em conexão que já abriu uma vez, e a subida precisa de retentativa", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Durante uma queda de conexão de cinco segundos, com a recuperação automática ligada, o produtor continua chamando `BasicPublishAsync`. O que acontece com essas publicações?",
                        difficulty: "medio",
                        options: [
                            { text: "Ficam paradas no `await` até a recuperação e então são confirmadas pelo broker", isCorrect: false },
                            { text: "Ficam num buffer do cliente e são enviadas quando a conexão for recuperada", isCorrect: false },
                            { text: "Lançam `AlreadyClosedException`, e o cliente não guarda nada para enviar depois", isCorrect: true },
                            { text: "São gravadas num arquivo local, que o cliente reenvia na próxima conexão aberta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A conexão com o broker passa por um load balancer que derruba conexões TCP sem tráfego depois de 20 segundos. Qual `RequestedHeartbeat` evita essas quedas sem gerar falso positivo?",
                        difficulty: "medio",
                        options: [
                            { text: "`TimeSpan.FromSeconds(1)`, com quadros a cada meio segundo, por garantia", isCorrect: false },
                            { text: "`TimeSpan.Zero`, desligando o heartbeat para o balanceador não interferir", isCorrect: false },
                            { text: "`TimeSpan.FromSeconds(10)`, com quadros de heartbeat a cada 5 segundos", isCorrect: true },
                            { text: "`TimeSpan.FromSeconds(60)`, o padrão, com quadros a cada 30 segundos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um consumidor (cliente 7.x, recuperação automática ligada) recebe uma mensagem com a tag 7 e começa a processar. No meio, a conexão cai e é recuperada. Quando o processamento termina, o código chama `BasicAckAsync(7, multiple: false)`. O que acontece?",
                        difficulty: "dificil",
                        options: [
                            { text: "O cliente descarta o ack de antes da queda, e a mensagem, já devolvida, é processada de novo", isCorrect: true },
                            { text: "O canal é fechado com 406 por tag desconhecida, e o consumidor para até reiniciar o serviço", isCorrect: false },
                            { text: "O ack chega ao broker e confirma a mensagem, porque a tag 7 continua valendo depois da queda", isCorrect: false },
                            { text: "O cliente lança exceção no ack, e a mensagem fica `unacked` até o próximo restart do broker", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Quando dá errado",
        aulas: [
            {
                titulo: "Dead letter exchange",
                blocks: [
                    {
                        type: "text",
                        value: "# Dead letter exchange\n\nUma mensagem de pedido chega com o JSON cortado no meio. O consumidor de faturamento tenta desserializar, falha, e precisa decidir o que fazer com ela. Dar ack apaga a mensagem sem deixar rastro. Devolver com `requeue: true` cria o laço que você já conhece: ela volta, falha de novo e prende o consumidor. Rejeitar com `requeue: false` tira a mensagem da fila, mas, sem mais nada configurado, ela simplesmente some.\n\nA **dead letter exchange** (DLX) resolve esse último caso. É uma exchange comum, de qualquer tipo, que você associa a uma fila: quando uma mensagem \"morre\" ali, o RabbitMQ a republica na DLX em vez de descartá-la, com headers que contam onde e por que ela morreu. A fila ligada à DLX costuma ser chamada de **dead letter queue** (DLQ), e é nela que você investiga a mensagem, corrige a causa e decide se reprocessa.",
                    },
                    {
                        type: "table",
                        value: "[[\"Evento\", \"Como acontece\", \"Motivo registrado\"], [\"Rejeição sem requeue\", \"`BasicRejectAsync` ou `BasicNackAsync` com `requeue: false`\", \"`rejected`\"], [\"Expiração\", \"Venceu o TTL da mensagem (`Expiration`) ou o da fila (`x-message-ttl`)\", \"`expired`\"], [\"Fila cheia\", \"Atingiu `x-max-length` ou `x-max-length-bytes` com o overflow padrão (`drop-head`)\", \"`maxlen`\"], [\"Delivery-limit\", \"Quorum queue devolveu a mensagem mais vezes que o limite\", \"`delivery_limit`\"], [\"Fila apagada ou expirada (`x-expires`)\", \"A fila deixa de existir com mensagens dentro\", \"Nenhum: as mensagens somem sem passar pela DLX\"]]",
                    },
                    {
                        type: "text",
                        value: "## Detalhes que pegam\n\n- No limite de tamanho, quem morre é a mensagem **mais antiga**, que sai pela cabeça da fila para abrir espaço. A que acabou de chegar entra normalmente.\n- `BasicNackAsync` e `BasicRejectAsync` com `requeue: false` dão no mesmo para a dead letter: as duas registram o motivo `rejected`.\n- Ack nunca passa pela DLX, e a fila que some leva as mensagens junto. Num teste com o RabbitMQ 4.3, uma fila com `x-expires` expirou com uma mensagem dentro, e a DLQ continuou vazia.\n- Em quorum queue, a dead letter padrão é *at-most-once*: se a DLQ não puder receber naquele instante, a mensagem pode se perder. Para não perder, existe a chave de policy `dead-letter-strategy` com o valor `at-least-once`, que exige `overflow` igual a `reject-publish`, consome mais memória e CPU e pode gerar duplicatas na DLQ.",
                    },
                    {
                        type: "text",
                        value: "## Policy ou argumento de fila\n\nHá dois jeitos de ligar a dead letter. O primeiro é o argumento `x-dead-letter-exchange` na declaração da fila, com o opcional `x-dead-letter-routing-key`. O segundo é uma **policy** com as chaves `dead-letter-exchange` e `dead-letter-routing-key`, que o broker aplica a todas as filas cujo nome casa com um padrão.\n\nA documentação do RabbitMQ recomenda a policy por um motivo prático: o argumento fica gravado na declaração e não muda mais. Redeclarar a fila com outro valor dá `PRECONDITION_FAILED` e derruba o canal; para trocar, só apagando a fila. A policy muda a qualquer hora, sem deploy e sem apagar nada. Se os dois existirem, o argumento vence.\n\nUm detalhe que pega muita gente: **só uma policy vale por fila**, a de maior prioridade entre as que casam com o nome. Se uma policy define a dead letter e outra, com prioridade maior, define o limite de entregas para as mesmas filas, a dead letter simplesmente não é aplicada. Junte as chaves numa policy só.",
                    },
                    {
                        type: "code",
                        value: "# terminal: dead letter em todas as filas cujo nome começa com \"pedidos.\"\nrabbitmqctl set_policy dlx-pedidos \"^pedidos\\.\" \\\n  '{\"dead-letter-exchange\":\"dlx.pedidos\"}' \\\n  --priority 10 --apply-to queues",
                    },
                    {
                        type: "code",
                        value: "// Topologia.cs: DLX fanout, DLQ e a fila de trabalho apontando para a DLX\nawait channel.ExchangeDeclareAsync(\"dlx.pedidos\", ExchangeType.Fanout, durable: true);\nawait channel.QueueDeclareAsync(\"dlq.pedidos\", durable: true, exclusive: false, autoDelete: false,\n    arguments: new Dictionary<string, object?> { [\"x-queue-type\"] = \"quorum\" });\nawait channel.QueueBindAsync(\"dlq.pedidos\", \"dlx.pedidos\", routingKey: \"\");\n\n// Argumento só para o exemplo ficar autocontido; em produção, prefira a policy\nawait channel.QueueDeclareAsync(\"pedidos.faturamento\", durable: true, exclusive: false, autoDelete: false,\n    arguments: new Dictionary<string, object?>\n    {\n        [\"x-queue-type\"] = \"quorum\",\n        [\"x-dead-letter-exchange\"] = \"dlx.pedidos\"\n    });\n\nvar consumer = new AsyncEventingBasicConsumer(channel);\nconsumer.ReceivedAsync += async (_, ea) =>\n{\n    Pedido? pedido;\n    try\n    {\n        pedido = JsonSerializer.Deserialize<Pedido>(ea.Body.Span);\n    }\n    catch (JsonException ex)\n    {\n        Console.WriteLine($\"Pedido ilegível, indo para a DLQ: {ex.Message}\");\n        await channel.BasicRejectAsync(ea.DeliveryTag, requeue: false);\n        return;\n    }\n    Console.WriteLine($\"Faturando o pedido {pedido?.Id}\");\n    await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n};\nawait channel.BasicConsumeAsync(\"pedidos.faturamento\", autoAck: false, consumer: consumer);",
                    },
                    {
                        type: "text",
                        value: "## A routing key da mensagem morta\n\nA mensagem morta é republicada na DLX **com a routing key original**, a menos que a fila defina `dead-letter-routing-key`. É por isso que o exemplo usa uma DLX do tipo fanout: ela ignora a chave e entrega tudo à DLQ.\n\nO erro comum é criar uma DLX direct, ligar a DLQ pela chave `erros` e esquecer a `dead-letter-routing-key`. A mensagem rejeitada chega à DLX com a chave `pedido.criado`, não casa com binding nenhum e é descartada sem aviso. A DLX que não existe falha do mesmo jeito silencioso: o broker aceita declarar uma fila apontando para uma exchange que ninguém criou, e a mensagem só se perde na hora em que morre. Antes de confiar na dead letter, rejeite uma mensagem de propósito e veja-a chegar à DLQ.",
                    },
                    {
                        type: "text",
                        value: "## O que chega à DLQ\n\nO corpo chega intacto, acompanhado de headers novos. O `x-death` é uma lista com uma entrada por par de fila e motivo, cada uma com `queue`, `reason`, `count` (quantas vezes aquilo aconteceu), `exchange`, `routing-keys` e `time`. Os headers `x-first-death-queue`, `x-first-death-reason` e `x-first-death-exchange` guardam a primeira morte e nunca mudam; os `x-last-death-*` acompanham a mais recente. Quando a causa é TTL, o RabbitMQ tira a expiração da mensagem, para ela não morrer de novo na DLQ, e guarda o valor antigo em `original-expiration`, dentro do `x-death`.\n\nNo cliente .NET, os textos desses headers chegam como `byte[]`, não como `string`. Quem faz um cast direto para `string` toma `InvalidCastException` no primeiro teste. E a DLQ não é lixeira: ela precisa de alguém olhando (um alerta quando deixa de estar vazia já resolve muito), de uma causa corrigida e de um caminho de volta para a fila de trabalho.",
                    },
                    {
                        type: "code",
                        value: "// DlqConsumer.cs: onde e por que a mensagem morreu\nstatic string? Texto(IDictionary<string, object?>? headers, string chave) =>\n    headers is not null && headers.TryGetValue(chave, out var valor) && valor is byte[] bytes\n        ? Encoding.UTF8.GetString(bytes)\n        : null;\n\nvar consumerDlq = new AsyncEventingBasicConsumer(canalDlq);\nconsumerDlq.ReceivedAsync += async (_, ea) =>\n{\n    var fila = Texto(ea.BasicProperties.Headers, \"x-first-death-queue\");\n    var motivo = Texto(ea.BasicProperties.Headers, \"x-first-death-reason\");\n    Console.WriteLine($\"Morreu em {fila} por {motivo}\");\n    await canalDlq.BasicAckAsync(ea.DeliveryTag, multiple: false);\n};\nawait canalDlq.BasicConsumeAsync(\"dlq.pedidos\", autoAck: false, consumer: consumerDlq);\n// Saída para o pedido ilegível: Morreu em pedidos.faturamento por rejected",
                    },
                    {
                        type: "quote",
                        value: "A DLX transforma a mensagem que falhou em mensagem guardada, com o motivo anotado. Configure por policy, garanta que a routing key chegue a uma fila e trate a DLQ como trabalho pendente, não como lixeira.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma quorum queue tem dead letter exchange configurada. Qual destes eventos **não** faz a mensagem passar pela DLX?",
                        difficulty: "facil",
                        options: [
                            { text: "A fila atinge o `x-max-length` e descarta a mais antiga", isCorrect: false },
                            { text: "A fila expira por `x-expires` com a mensagem ainda dentro", isCorrect: true },
                            { text: "O TTL da mensagem vence antes de algum consumidor pegá-la", isCorrect: false },
                            { text: "O consumidor chama `BasicNackAsync` com `requeue: false`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a documentação do RabbitMQ recomenda ligar a dead letter por policy, e não pelo argumento `x-dead-letter-exchange`?",
                        difficulty: "facil",
                        options: [
                            { text: "A policy muda a qualquer hora; o argumento exige apagar e recriar a fila", isCorrect: true },
                            { text: "A policy garante entrega at-least-once à DLQ; o argumento é at-most-once", isCorrect: false },
                            { text: "O argumento só vale em fila clássica; quorum queue aceita apenas a policy", isCorrect: false },
                            { text: "O argumento é lido só pelo cliente .NET; os outros clientes o ignoram", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A fila `pedidos.faturamento` recebe mensagens com routing key `pedido.criado` e tem `x-dead-letter-exchange` apontando para uma exchange direct. A DLQ está ligada a essa exchange pela chave `erros`, e a fila não define `x-dead-letter-routing-key`. O que acontece com uma mensagem rejeitada com `requeue: false`?",
                        difficulty: "dificil",
                        options: [
                            { text: "É republicada com a chave `pedido.criado`, não casa com o binding e se perde", isCorrect: true },
                            { text: "Volta para `pedidos.faturamento`, porque a DLX não tinha rota para ela", isCorrect: false },
                            { text: "Chega à DLQ, porque a DLX ignora a routing key ao republicar mensagens mortas", isCorrect: false },
                            { text: "O broker fecha o canal do consumidor, avisando que a DLX ficou sem rota", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um consumidor da DLQ lê o header `x-first-death-reason` com um cast direto para `string` e recebe `InvalidCastException`. Qual é a causa?",
                        difficulty: "medio",
                        options: [
                            { text: "O header fica dentro do `x-death`, e o nível de cima da mensagem não tem esse campo", isCorrect: false },
                            { text: "O cliente .NET entrega texto de header como `byte[]`, a ser decodificado em UTF-8", isCorrect: true },
                            { text: "O motivo vem como número inteiro, um código que precisa ser convertido em texto", isCorrect: false },
                            { text: "O header só existe quando a DLX é ligada por policy; por argumento, vem vazio", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma quorum queue tem `x-max-length` igual a 1000, o overflow padrão e dead letter configurada. Ela está cheia quando chega a mensagem número 1001. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "A fila aceita a nova e para de entregar até voltar abaixo do limite", isCorrect: false },
                            { text: "A nova é recusada ao publicador, e nenhuma mensagem vai para a DLX", isCorrect: false },
                            { text: "A mais antiga sai pela cabeça e vai para a DLX com motivo `maxlen`", isCorrect: true },
                            { text: "A nova é recusada na entrada e vai para a DLX com motivo `maxlen`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Mensagem venenosa e o delivery-limit",
                blocks: [
                    {
                        type: "text",
                        value: "# Mensagem venenosa e o delivery-limit\n\nUm pedido chega com 40 mil itens. O consumidor carrega tudo em memória, estoura o limite do contêiner e o processo é morto antes de chegar a qualquer `catch`. Sem ack, o broker devolve a mensagem à fila e a entrega à próxima instância, que morre do mesmo jeito. Em poucos minutos todas as instâncias estão reiniciando em sequência por causa de **uma** mensagem, e o resto da fila anda aos trancos.\n\nIsso é uma **mensagem venenosa** (poison message): uma mensagem que falha sempre, não importa quantas vezes seja tentada. O estrago não vem de ela falhar, vem de ela falhar em laço, consumindo CPU, log e a atenção de todos os consumidores. A versão mais branda do mesmo problema você já viu: o consumidor que devolve com requeue em toda exceção. Sem um teto, ninguém tira a mensagem da roda.",
                    },
                    {
                        type: "text",
                        value: "## O delivery-limit das quorum queues\n\nA quorum queue conta, para cada mensagem, quantas entregas falharam: é o `delivery-count`. Quando ele passa do **delivery-limit**, a mensagem sai da fila. Se houver dead letter, vai para a DLX com motivo `delivery_limit`; se não houver, é **descartada**.\n\nDesde o RabbitMQ 4.0, o limite padrão é **20** (antes não havia limite). O valor muda pelo argumento `x-delivery-limit` ou pela chave de policy `delivery-limit`, e `-1` desliga a proteção, o que a documentação desaconselha. Fila clássica não tem delivery-limit (declarar `x-delivery-limit` nela dá `PRECONDITION_FAILED`): ali, a defesa contra o laço fica toda no seu código.\n\nO limite conta falhas, não entregas. Com limite 3, o consumidor vê a mensagem **4 vezes**: a entrega original e três reentregas. Na quarta falha, o contador chega a 4, passa do limite e a mensagem sai.",
                    },
                    {
                        type: "text",
                        value: "## Limite sem DLX é perda silenciosa\n\nMuita gente atualizou para o 4.0 sem saber do limite padrão e descobriu do pior jeito: mensagens sumindo ao estourar o limite, sem erro em lugar nenhum, porque a fila não tinha dead letter. Delivery-limit e DLX andam juntos, e o jeito mais seguro de garantir isso é configurar os dois na mesma policy (lembre que só uma policy vale por fila):",
                    },
                    {
                        type: "code",
                        value: "# terminal: limite de 5 falhas e dead letter, numa policy só\nrabbitmqctl set_policy pedidos \"^pedidos\\.\" \\\n  '{\"delivery-limit\":5,\"dead-letter-exchange\":\"dlx.pedidos\"}' \\\n  --priority 10 --apply-to quorum_queues",
                    },
                    {
                        type: "text",
                        value: "## O header x-delivery-count\n\nNas reentregas, a quorum queue coloca na mensagem o header `x-delivery-count` com o número de falhas até ali. Na primeira entrega ele não existe, e no cliente .NET o valor chega como `long`.\n\nCom ele, o consumidor para de tratar toda exceção do mesmo jeito. Erro **permanente** (JSON inválido, regra de negócio violada, cliente inexistente) não melhora com nova tentativa: rejeite com `requeue: false` e mande direto para a DLQ, sem gastar as tentativas. Erro **transitório** (banco fora do ar, timeout de outro serviço) pode passar sozinho: devolva com `BasicRejectAsync` e `requeue: true`, e deixe o delivery-limit pôr o teto. O número da tentativa vai para o log, para ninguém confundir a sexta falha com a primeira.\n\nA propriedade `ea.Redelivered` não substitui o header: ela só diz que a mensagem **talvez** já tenha sido entregue antes, sem dizer quantas vezes.",
                    },
                    {
                        type: "code",
                        value: "// PedidosConsumer.cs: erro permanente vai direto para a DLQ; transitório volta como falha\nconsumer.ReceivedAsync += async (_, ea) =>\n{\n    var falhas = ea.BasicProperties.Headers?.TryGetValue(\"x-delivery-count\", out var valor) == true\n        ? Convert.ToInt64(valor)\n        : 0L;\n    try\n    {\n        var pedido = JsonSerializer.Deserialize<Pedido>(ea.Body.Span)\n            ?? throw new JsonException(\"corpo vazio\");\n        await faturamento.FaturarAsync(pedido);\n        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n    catch (JsonException ex)\n    {\n        Console.WriteLine($\"Mensagem inválida, direto para a DLQ: {ex.Message}\");\n        await channel.BasicRejectAsync(ea.DeliveryTag, requeue: false);\n    }\n    catch (Exception ex)\n    {\n        Console.WriteLine($\"Falha transitória na tentativa {falhas + 1}: {ex.Message}\");\n        await channel.BasicRejectAsync(ea.DeliveryTag, requeue: true);\n    }\n};",
                    },
                    {
                        type: "text",
                        value: "## No 4.3, só falha conta\n\nAté o 4.2, toda devolução somava 1 no `delivery-count`. A partir do RabbitMQ 4.3, o contador só sobe quando a entrega **falhou**: `basic.reject` com requeue, canal fechado ou conexão caída com a mensagem sem ack. Devoluções que não são falha, como `basic.nack` com requeue e o consumer timeout, não contam. Para acompanhar todas as entregas existe outro header, o `x-acquired-count`, que soma a cada vez que a mensagem é entregue a um consumidor.\n\nIsso muda um hábito antigo. O consumidor que devolve com `BasicNackAsync` e `requeue: true` em toda exceção não é mais freado pelo delivery-limit: num teste com limite 3 no 4.3, a mensagem voltou oito vezes, com o `x-acquired-count` subindo e sem `x-delivery-count`. Se você quer que o limite valha, sinalize a falha com `BasicRejectAsync`, como no exemplo acima.",
                    },
                    {
                        type: "table",
                        value: "[[\"Como a mensagem volta para a fila\", \"Soma no `delivery-count` (4.3)\"], [\"`BasicRejectAsync` com `requeue: true`\", \"Sim\"], [\"Canal fechado ou conexão caída com a mensagem sem ack\", \"Sim\"], [\"`BasicNackAsync` com `requeue: true`\", \"Não\"], [\"Consumer timeout\", \"Não\"]]",
                    },
                    {
                        type: "text",
                        value: "## O caso em que nenhum catch roda\n\nA linha mais importante da tabela é a segunda. Quando a mensagem derruba o processo (falta de memória, `StackOverflowException`, o orquestrador matando o contêiner), nenhum `catch` roda e nenhum contador em memória sobrevive. Mesmo assim o broker vê a conexão cair com a mensagem sem ack, soma uma falha e, passado o limite, tira a mensagem da roda. É a única proteção que funciona contra a mensagem que mata o consumidor, e ela vem do broker, não do seu código.\n\nO desenho que se sustenta em produção tem três peças: quorum queue com delivery-limit ajustado ao seu caso, DLX na mesma policy e alguém avisado quando a DLQ recebe mensagem.",
                    },
                    {
                        type: "quote",
                        value: "Mensagem venenosa é a que falha sempre, e o perigo é o laço. O delivery-limit da quorum queue põe o teto até quando o processo morre, mas só com DLX a mensagem tirada da roda fica guardada em vez de sumir.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma quorum queue **sem** dead letter configurada tem uma mensagem que estoura o delivery-limit. Qual é o destino dela?",
                        difficulty: "facil",
                        options: [
                            { text: "Fica parada na cabeça da fila até alguém removê-la pelo painel", isCorrect: false },
                            { text: "É descartada, sem nenhum aviso ao publicador nem ao consumidor", isCorrect: true },
                            { text: "Vai para uma fila criada pelo broker com o sufixo `.dlq` no nome", isCorrect: false },
                            { text: "Volta ao publicador por `basic.return`, como mensagem sem rota", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Desde o RabbitMQ 4.0, qual é o delivery-limit de uma quorum queue declarada sem configurar o limite?",
                        difficulty: "facil",
                        options: [
                            { text: "10 falhas de entrega", isCorrect: false },
                            { text: "20 falhas de entrega", isCorrect: true },
                            { text: "Nenhum, como nas versões 3.x", isCorrect: false },
                            { text: "5 falhas de entrega", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma quorum queue tem `x-delivery-limit` igual a 3 e dead letter configurada. O consumidor falha sempre com uma mensagem específica e a devolve com `BasicRejectAsync(ea.DeliveryTag, requeue: true)`. Quantas vezes o consumidor recebe essa mensagem antes de ela ir para a DLQ?",
                        difficulty: "medio",
                        options: [
                            { text: "5 vezes: o contador só começa na primeira reentrega", isCorrect: false },
                            { text: "3 vezes: o limite conta todas as entregas, inclusive a primeira", isCorrect: false },
                            { text: "4 vezes: a entrega original e mais as 3 reentregas permitidas", isCorrect: true },
                            { text: "1 vez: com DLX configurada, a primeira falha já desvia", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O consumidor recebe uma mensagem cujo JSON não desserializa. A fila é uma quorum queue com delivery-limit e DLQ. O que ele deve fazer?",
                        difficulty: "medio",
                        options: [
                            { text: "Devolver com `requeue: true` e deixar o delivery-limit encerrar o laço", isCorrect: false },
                            { text: "Rejeitar com `requeue: false`, pois nova tentativa não conserta o JSON", isCorrect: true },
                            { text: "Esperar alguns segundos no handler e então devolver com `requeue: true`", isCorrect: false },
                            { text: "Dar ack e registrar no log, porque mensagem inválida não tem conserto", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A fila é uma quorum queue com dead letter configurada. Uma mensagem específica faz o processo do consumidor morrer por falta de memória, sem que nenhum `catch` rode, e o mesmo acontece em cada instância que a recebe. O que leva essa mensagem para a DLQ sem descartar reentregas legítimas?",
                        difficulty: "dificil",
                        options: [
                            { text: "Um dicionário em memória no consumidor que conta as tentativas de cada `MessageId`", isCorrect: false },
                            { text: "O broker contar a conexão caída como falha e desviar a mensagem passado o limite", isCorrect: true },
                            { text: "Um try/catch em volta do handler que rejeita com `requeue: false` qualquer exceção", isCorrect: false },
                            { text: "A flag `Redelivered`: o consumidor dá ack sem processar quando ela vem verdadeira", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Retry com espera",
                blocks: [
                    {
                        type: "text",
                        value: "# Retry com espera\n\nO gateway de pagamento fica fora do ar por dois minutos. O consumidor tenta cobrar, recebe erro e devolve a mensagem. O broker a entrega de novo em milissegundos, a chamada falha de novo, e o delivery-limit padrão, de 20 falhas, se esgota em menos de um segundo. A mensagem vai para a DLQ enquanto o gateway ainda está fora, por uma falha que teria passado sozinha se alguém tivesse esperado.\n\nRetry imediato só serve para falha que some em milissegundos. Para indisponibilidade de verdade (outro serviço reiniciando, banco em failover, limite de requisições estourado) é preciso **esperar entre as tentativas**, de preferência cada vez mais. Até o RabbitMQ 4.2, isso se montava com TTL e dead letter; no 4.3, a quorum queue passou a fazer sozinha.",
                    },
                    {
                        type: "text",
                        value: "## O padrão antigo: fila de espera com TTL\n\nA ideia é usar a dead letter como caminho de volta. A fila de trabalho `pedidos` tem como DLX a exchange `pedidos.retry`. Ligada a ela fica a fila `pedidos.espera`, **sem consumidor**, com `x-message-ttl` de 30 segundos. A fila de espera, por sua vez, tem como DLX a default exchange (nome vazio) e como `x-dead-letter-routing-key` o nome da fila de trabalho.\n\nO ciclo: o consumidor rejeita com `requeue: false`, a mensagem morre em `pedidos` e cai em `pedidos.espera`; 30 segundos depois ela expira, morre de novo e a default exchange a entrega de volta em `pedidos`.",
                    },
                    {
                        type: "code",
                        value: "// Padrão antigo: pedidos -> (reject) -> pedidos.retry -> pedidos.espera -> (30 s) -> pedidos\nawait channel.ExchangeDeclareAsync(\"pedidos.retry\", ExchangeType.Fanout, durable: true);\nawait channel.QueueDeclareAsync(\"pedidos.espera\", durable: true, exclusive: false, autoDelete: false,\n    arguments: new Dictionary<string, object?>\n    {\n        [\"x-queue-type\"] = \"quorum\",\n        [\"x-message-ttl\"] = 30_000,\n        [\"x-dead-letter-exchange\"] = \"\",          // default exchange\n        [\"x-dead-letter-routing-key\"] = \"pedidos\" // nome da fila de trabalho\n    });\nawait channel.QueueBindAsync(\"pedidos.espera\", \"pedidos.retry\", routingKey: \"\");\n\nawait channel.QueueDeclareAsync(\"pedidos\", durable: true, exclusive: false, autoDelete: false,\n    arguments: new Dictionary<string, object?>\n    {\n        [\"x-queue-type\"] = \"quorum\",\n        [\"x-dead-letter-exchange\"] = \"pedidos.retry\"\n    });",
                    },
                    {
                        type: "text",
                        value: "## Quem para o ciclo\n\nO broker não para esse ciclo sozinho. O RabbitMQ descarta mensagens que voltam à mesma fila **sem** nenhuma rejeição no caminho, mas aqui cada volta tem uma; e o delivery-limit também não age, porque ele só é verificado quando a mensagem é devolvida à própria fila. Num teste com TTL curto no RabbitMQ 4.3, a mensagem deu 25 voltas sem nada interromper.\n\nQuem para é o consumidor. O `x-death` traz uma entrada para o par (`pedidos`, `rejected`) com o `count` de rejeições até ali. Passado o seu limite, o consumidor publica a mensagem numa fila de estacionamento (parking lot), onde ela aguarda intervenção, e dá ack. Rodando o exemplo abaixo com o gateway sempre fora, foram cinco esperas de 30 segundos e, na sexta falha, a mensagem foi estacionada.",
                    },
                    {
                        type: "code",
                        value: "// Quantas vezes esta mensagem já foi rejeitada na fila de trabalho?\nstatic long Rejeicoes(IReadOnlyBasicProperties props, string fila)\n{\n    if (props.Headers?.TryGetValue(\"x-death\", out var valor) != true || valor is not IList<object> mortes)\n        return 0;\n\n    foreach (var item in mortes)\n    {\n        if (item is IDictionary<string, object?> morte\n            && morte.TryGetValue(\"queue\", out var q) && q is byte[] nomeFila\n            && morte.TryGetValue(\"reason\", out var r) && r is byte[] motivo\n            && Encoding.UTF8.GetString(nomeFila) == fila\n            && Encoding.UTF8.GetString(motivo) == \"rejected\")\n        {\n            return Convert.ToInt64(morte[\"count\"]);\n        }\n    }\n    return 0;\n}\n\nconsumer.ReceivedAsync += async (_, ea) =>\n{\n    try\n    {\n        await cobranca.CobrarAsync(ea.Body);\n        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n    catch (HttpRequestException ex) when (Rejeicoes(ea.BasicProperties, \"pedidos\") < 5)\n    {\n        Console.WriteLine($\"Gateway fora, nova tentativa em 30 s: {ex.Message}\");\n        await channel.BasicRejectAsync(ea.DeliveryTag, requeue: false); // vai esperar em pedidos.espera\n    }\n    catch (Exception ex)\n    {\n        Console.WriteLine($\"Desistindo, mensagem estacionada: {ex.Message}\");\n        await estacionamento.GuardarAsync(ea); // publica em pedidos.parking\n        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n    }\n};",
                    },
                    {
                        type: "text",
                        value: "## Onde o padrão antigo cansa\n\nA espera é fixa por fila. O caminho óbvio para variar, um `Expiration` diferente em cada mensagem numa fila de espera só, não funciona: a expiração só é avaliada na **cabeça** da fila. Uma mensagem de 5 segundos atrás de uma de 5 minutos espera os 5 minutos; num teste, a de 500 ms ficou presa atrás da de 3 s, em quorum queue e em fila clássica. Backoff crescente vira uma fila de espera por degrau (`espera.5s`, `espera.30s`, `espera.5min`), com mais exchanges, mais bindings e mais coisas para monitorar.\n\n## Delayed retry nativo (RabbitMQ 4.3)\n\nDesde o 4.3, a quorum queue segura a mensagem devolvida por um tempo antes de entregá-la de novo. Três argumentos controlam isso: `x-delayed-retry-type` diz quais devoluções esperam; `x-delayed-retry-min` é a espera mínima, em milissegundos; `x-delayed-retry-max` é o teto, também em milissegundos (se omitido, assume o valor do mínimo e a espera fica fixa).\n\nA espera é **linear** no `delivery-count`: `min(minimo * delivery-count, maximo)`. Com mínimo de 1000 e máximo de 30000, a primeira falha espera 1 s, a segunda 2 s, a terceira 3 s, até travar em 30 s. Junto com o delivery-limit e a DLX, a mesma fila faz retry com espera, desiste da venenosa e guarda o que falhou, sem fila extra.",
                    },
                    {
                        type: "table",
                        value: "[[\"`x-delayed-retry-type`\", \"Quais devoluções esperam\"], [\"`disabled`\", \"Nenhuma (é o padrão)\"], [\"`all`\", \"Todas\"], [\"`failed`\", \"Só as que sobem o `delivery-count`: reject, canal fechado, conexão caída\"], [\"`returned`\", \"Só as que não sobem o `delivery-count`, como o nack\"]]",
                    },
                    {
                        type: "code",
                        value: "// pagamentos: espera 2 s, 4 s, 6 s... até travar em 30 s; na 21ª falha, vai para a DLQ\nawait channel.QueueDeclareAsync(\"pagamentos\", durable: true, exclusive: false, autoDelete: false,\n    arguments: new Dictionary<string, object?>\n    {\n        [\"x-queue-type\"] = \"quorum\",\n        [\"x-delayed-retry-type\"] = \"failed\",\n        [\"x-delayed-retry-min\"] = 2_000,\n        [\"x-delayed-retry-max\"] = 30_000,\n        [\"x-delivery-limit\"] = 20,\n        [\"x-dead-letter-exchange\"] = \"dlx.pagamentos\"\n    });\n\n// No consumidor, a falha transitória só precisa devolver a mensagem como falha\nawait channel.BasicRejectAsync(ea.DeliveryTag, requeue: true);",
                    },
                    {
                        type: "text",
                        value: "## Antes de ligar em produção\n\n- **Sem `x-delayed-retry-min`, nada espera.** A fila aceita a declaração só com o tipo, sem erro, e as reentregas continuam imediatas. Declare o mínimo sempre.\n- **Pela policy**, as chaves são `delayed-retry-type`, `delayed-retry-min` e `delayed-retry-max`. Elas passaram a ser aceitas em policy no 4.3.1; no 4.3.0, só o argumento funciona.\n- **Só a falha faz a espera crescer.** O nack não sobe o `delivery-count`: com `failed` ele volta sem esperar e, com `all`, espera sempre o mínimo.\n- **A mensagem em espera não está pronta.** Ela não aparece no `MessageCount` do declare passivo nem num `basic.get`; a API de gerenciamento a conta à parte, em `messages_delayed`. Um alerta que só olha mensagens prontas acha que a fila está vazia.\n- **A espera não segura a fila.** As mensagens de trás passam na frente da que está esperando, e isso pesa quando a ordem importa.\n\nO plugin comunitário `rabbitmq-delayed-message-exchange`, que muita gente usava para atrasar mensagens, foi descontinuado e arquivado em 2026, junto com o 4.3. Ele guardava as mensagens atrasadas num único nó, sem replicação, e não foi feito para volume alto. Não use em projeto novo; agendar publicação para o futuro virou recurso de um plugin comercial do Tanzu RabbitMQ.",
                    },
                    {
                        type: "quote",
                        value: "Retry com espera dá tempo para a falha passageira passar. O ciclo com TTL e dead letter ainda funciona, mas no 4.3 a quorum queue faz isso sozinha com os argumentos `x-delayed-retry-*`, e o plugin comunitário de atraso ficou para trás.",
                    },
                ],
                questions: [
                    {
                        statement: "A fila de pagamentos é uma quorum queue com o delivery-limit padrão e DLQ. O gateway fica fora do ar por dois minutos, e o consumidor devolve cada falha na hora com `BasicRejectAsync(ea.DeliveryTag, requeue: true)`. Por que isso não resolve?",
                        difficulty: "facil",
                        options: [
                            { text: "O requeue apaga os headers, e o consumidor perde o contexto do pedido", isCorrect: false },
                            { text: "O broker bloqueia a fila enquanto houver mensagem devolvida sem ack", isCorrect: false },
                            { text: "As tentativas acabam em segundos, muito antes de o gateway voltar", isCorrect: true },
                            { text: "A mensagem devolvida vai para o fim da fila e perde a vez para sempre", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em 2026, qual é a situação do plugin `rabbitmq-delayed-message-exchange`?",
                        difficulty: "facil",
                        options: [
                            { text: "Segue mantido e é o jeito recomendado de fazer retry com espera", isCorrect: false },
                            { text: "Passou a exigir quorum queues, mas segue como opção recomendada", isCorrect: false },
                            { text: "Foi incorporado ao núcleo do RabbitMQ e vem habilitado no 4.3", isCorrect: false },
                            { text: "Foi descontinuado e arquivado; não deve entrar em projeto novo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma quorum queue no 4.3 tem `x-delayed-retry-type` igual a `all`, `x-delayed-retry-min` igual a 1000 e `x-delayed-retry-max` igual a 5000. O consumidor falha sempre e devolve com `BasicRejectAsync(ea.DeliveryTag, requeue: true)`. Quanto tempo a mensagem espera após a sexta falha?",
                        difficulty: "medio",
                        options: [
                            { text: "32 segundos, porque a espera dobra a cada falha a partir do mínimo", isCorrect: false },
                            { text: "6 segundos, porque a espera é o mínimo vezes o número de falhas", isCorrect: false },
                            { text: "1 segundo, porque o mínimo vale para todas as devoluções da fila", isCorrect: false },
                            { text: "5 segundos, porque a espera cresce linear e para no teto definido", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No padrão antigo de retry, um time usa uma única fila de espera e define um `Expiration` por mensagem: 5 segundos na primeira falha, 5 minutos na quinta. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker reordena a fila pelo vencimento, e as de 5 s saem primeiro", isCorrect: false },
                            { text: "Cada mensagem expira no seu tempo, porque o TTL por mensagem vence o da fila", isCorrect: false },
                            { text: "As mensagens expiram juntas quando a mais antiga vence, e voltam em lote", isCorrect: false },
                            { text: "Uma de 5 s atrás de uma de 5 min espera os 5 min, porque só a cabeça expira", isCorrect: true },
                        ],
                    },
                    {
                        statement: "No padrão antigo, a fila de trabalho tem DLX para uma fila de espera com TTL, que devolve as mensagens à fila de trabalho. O consumidor sempre rejeita com `requeue: false` e nunca lê o `x-death`. O que interrompe o ciclo de uma mensagem que falha sempre?",
                        difficulty: "dificil",
                        options: [
                            { text: "Nada: cada volta tem uma rejeição, e a proteção do broker contra ciclos não age", isCorrect: true },
                            { text: "A proteção do broker contra ciclos, que descarta a mensagem na segunda passagem", isCorrect: false },
                            { text: "O TTL da fila de espera, que dobra a cada volta até a mensagem expirar de vez", isCorrect: false },
                            { text: "O delivery-limit da quorum queue de trabalho, que desvia a mensagem em 20 voltas", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Idempotência no consumidor",
                blocks: [
                    {
                        type: "text",
                        value: "# Idempotência no consumidor\n\nO consumidor de faturamento recebe \"pedido 812 pago\", grava a fatura, faz commit e, um instante antes do ack, o contêiner é reiniciado por um deploy. Para o broker, a mensagem nunca foi confirmada: ela volta para a fila, outra instância processa de novo e o cliente ganha duas faturas.\n\nNada disso é defeito do RabbitMQ. Entrega **pelo menos uma vez** significa exatamente isto: o broker prefere entregar duas vezes a perder. Duplicatas chegam por vários caminhos: queda do consumidor entre o trabalho e o ack, publicador que reenvia porque a confirmação não chegou, reentrega por retry, reprocessamento da DLQ, dead letter at-least-once. Como não dá para eliminar a duplicata na entrega, o consumidor precisa ser **idempotente**: processar a mesma mensagem duas vezes tem que dar o mesmo resultado que processar uma.\n\n## Primeiro, a operação idempotente por natureza\n\nAntes de criar mecanismo, veja se a própria operação já é idempotente. Gravar um estado absoluto é: marcar o pedido como pago duas vezes deixa o pedido pago. Somar a um saldo não é: cada execução soma de novo. Muitas vezes dá para trocar uma pela outra, por exemplo registrando o lançamento com chave própria em vez de incrementar um total.",
                    },
                    {
                        type: "table",
                        value: "[[\"Operação\", \"Idempotente?\", \"Por quê\"], [\"`UPDATE pedidos SET status = 'pago' WHERE id = @id`\", \"Sim\", \"A segunda execução grava o mesmo valor\"], [\"`UPDATE contas SET saldo = saldo + @valor WHERE id = @id`\", \"Não\", \"Cada execução soma de novo\"], [\"`INSERT` com chave natural e `ON CONFLICT DO NOTHING`\", \"Sim\", \"A chave barra a segunda linha\"], [\"`INSERT` com id gerado na hora pelo consumidor\", \"Não\", \"Cada execução cria uma linha nova\"], [\"Enviar e-mail ou cobrar no cartão\", \"Não\", \"O efeito sai do seu banco e não volta\"]]",
                    },
                    {
                        type: "text",
                        value: "## A chave de deduplicação\n\nQuando a operação não é idempotente por natureza, o consumidor precisa reconhecer a repetida, e para isso a mensagem precisa de uma identidade estável. O lugar padrão é a propriedade `MessageId`, preenchida pelo produtor. O que importa é **quando** esse id nasce: junto com o evento, uma vez só, e não a cada tentativa de publicação.\n\nO erro comum é gerar o id dentro do método que publica, com `Guid.NewGuid()` na hora do envio. Se a confirmação não chega e o produtor publica de novo, a segunda cópia sai com outro id, e o consumidor vê duas mensagens diferentes. Gere o id quando o evento é criado e guarde-o com ele, ou derive-o do negócio (`pedido-812-pago`). E não use o `DeliveryTag`: ele é um contador do canal e muda a cada entrega.\n\n## A tabela de mensagens processadas (inbox)\n\nO mecanismo clássico é uma tabela em que cada linha diz \"o consumidor X já processou a mensagem Y\", com chave primária nesse par. O consumidor faz tudo numa transação só:\n\n1. Tenta inserir a linha (consumidor, `MessageId`) com `ON CONFLICT DO NOTHING`.\n2. Se nenhuma linha entrou, a mensagem é repetida: desfaz a transação, dá ack e sai.\n3. Se entrou, faz o trabalho de negócio **na mesma transação**, faz commit e só então dá ack.\n\nSe o processo cair depois do commit e antes do ack, a reentrega bate na chave primária e é descartada com ack. Se cair antes do commit, nada foi gravado, nem o trabalho nem a marca, e a reentrega processa normalmente.",
                    },
                    {
                        type: "code",
                        value: "-- inbox.sql (PostgreSQL): uma linha por mensagem processada, por consumidor\nCREATE TABLE mensagens_processadas (\n    consumidor    text        NOT NULL,\n    message_id    text        NOT NULL,\n    processada_em timestamptz NOT NULL DEFAULT now(),\n    PRIMARY KEY (consumidor, message_id)\n);",
                    },
                    {
                        type: "code",
                        value: "// FaturamentoConsumer.cs: marca e fatura na mesma transação; ack só depois do commit\nconsumer.ReceivedAsync += async (_, ea) =>\n{\n    var messageId = ea.BasicProperties.MessageId;\n    if (string.IsNullOrEmpty(messageId))\n    {\n        Console.WriteLine(\"Mensagem sem MessageId não tem como ser deduplicada, indo para a DLQ\");\n        await channel.BasicRejectAsync(ea.DeliveryTag, requeue: false);\n        return;\n    }\n    var evento = JsonSerializer.Deserialize<PedidoPago>(ea.Body.Span)!;\n\n    await using var conexao = await dataSource.OpenConnectionAsync();\n    await using var tx = await conexao.BeginTransactionAsync();\n\n    await using var marca = new NpgsqlCommand(\n        \"INSERT INTO mensagens_processadas (consumidor, message_id) VALUES ('faturamento', @id) \" +\n        \"ON CONFLICT DO NOTHING\", conexao, tx);\n    marca.Parameters.AddWithValue(\"id\", messageId);\n    if (await marca.ExecuteNonQueryAsync() == 0)\n    {\n        await tx.RollbackAsync();\n        Console.WriteLine($\"Repetida, já faturada: {messageId}\");\n        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n        return;\n    }\n\n    await using var fatura = new NpgsqlCommand(\n        \"INSERT INTO faturas (pedido_id, valor) VALUES (@pedido, @valor)\", conexao, tx);\n    fatura.Parameters.AddWithValue(\"pedido\", evento.PedidoId);\n    fatura.Parameters.AddWithValue(\"valor\", evento.Valor);\n    await fatura.ExecuteNonQueryAsync();\n\n    await tx.CommitAsync();\n    await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);\n};",
                    },
                    {
                        type: "text",
                        value: "## O erro do SELECT antes\n\nMuita gente implementa a inbox com um `SELECT` para perguntar se a mensagem já foi processada e um `INSERT` lá no fim. Funciona no teste e quebra em produção: quando a mesma mensagem está com dois consumidores ao mesmo tempo (o primeiro demorou, a conexão dele caiu e o broker reentregou para outro), os dois fazem o `SELECT`, os dois ouvem \"não\" e os dois faturam. Quem decide é a chave primária. No PostgreSQL, o `INSERT ... ON CONFLICT DO NOTHING` do segundo espera a transação do primeiro terminar e então não insere nada; num teste com duas transações concorrentes, foi exatamente o que aconteceu.\n\n## Efeito colateral fora do banco\n\nA transação protege o que está no seu banco. E-mail, cobrança no cartão e chamada HTTP para outro serviço ficam de fora: o rollback não desfaz a cobrança. O erro clássico é chamar a API de pagamento dentro da transação e achar que, se algo falhar depois, o rollback resolve.\n\nO caminho mais sólido é passar a chave adiante. Muitos provedores de pagamento aceitam uma **chave de idempotência** num header da requisição (`Idempotency-Key` é um nome comum; confira o do seu provedor): duas chamadas com a mesma chave geram uma cobrança só. Derive a chave da mensagem, e a reentrega vira repetição inofensiva.",
                    },
                    {
                        type: "code",
                        value: "// A chave da mensagem vira a chave de idempotência da cobrança\nusing var requisicao = new HttpRequestMessage(HttpMethod.Post, \"v1/cobrancas\")\n{\n    Content = JsonContent.Create(new { evento.PedidoId, evento.Valor })\n};\nrequisicao.Headers.Add(\"Idempotency-Key\", $\"cobranca-{messageId}\");\n\nusing var resposta = await http.SendAsync(requisicao);\nresposta.EnsureSuccessStatusCode();",
                    },
                    {
                        type: "text",
                        value: "Quando o serviço externo não aceita chave, registre o estado em volta da chamada: grave \"cobrança em andamento\" e faça commit antes de chamar; com a resposta, grave \"concluída\". Na reentrega, \"concluída\" se descarta, e \"em andamento\" significa resultado desconhecido: consulte o provedor antes de tentar de novo. E há casos em que a duplicata é aceitável, como um e-mail de \"pedido recebido\" repetido. Aceitar é legítimo, desde que seja uma decisão e não um esquecimento.\n\n## Até quando guardar\n\nA tabela cresce para sempre se ninguém limpar. Apague as linhas antigas em lote pela coluna `processada_em`, com prazo maior que a janela em que uma duplicata ainda pode chegar. Essa janela inclui o retry com espera e, principalmente, o reprocessamento da DLQ, que às vezes acontece dias depois. Limpar com uma hora de retenção e reprocessar a DLQ na semana seguinte deixa passar todas as duplicatas.",
                    },
                    {
                        type: "quote",
                        value: "Pelo menos uma vez quer dizer duplicata, e é o consumidor que precisa absorvê-la. Prefira a operação idempotente por natureza; quando não der, use um `MessageId` estável, marque na mesma transação do trabalho e passe a chave adiante para o que estiver fora do seu banco.",
                    },
                ],
                questions: [
                    {
                        statement: "Um consumidor grava a fatura, faz commit no banco e o processo cai antes de enviar o ack. O que o RabbitMQ faz com a mensagem nessa situação?",
                        difficulty: "facil",
                        options: [
                            { text: "Guarda até o mesmo consumidor voltar, para evitar trabalho duplicado", isCorrect: false },
                            { text: "Descarta, porque ela já tinha sido entregue antes de a conexão cair", isCorrect: false },
                            { text: "Entrega de novo, porque para ele a mensagem nunca foi confirmada", isCorrect: true },
                            { text: "Manda para a DLX, porque a entrega terminou sem ack e sem nack", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual destas operações é idempotente por natureza?",
                        difficulty: "facil",
                        options: [
                            { text: "`UPDATE pedidos SET status = 'pago' WHERE id = @id`", isCorrect: true },
                            { text: "`UPDATE contas SET saldo = saldo + @valor WHERE id = @id`", isCorrect: false },
                            { text: "`INSERT INTO faturas (id) VALUES (gen_random_uuid())`", isCorrect: false },
                            { text: "`UPDATE estoque SET qtd = qtd - 1 WHERE produto = @id`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O produtor gera o `MessageId` com `Guid.NewGuid()` dentro do método que publica e, quando a confirmação não chega, chama o método de novo. Por que a deduplicação no consumidor falha?",
                        difficulty: "medio",
                        options: [
                            { text: "O broker troca o `MessageId` por um id próprio quando a mensagem é reenviada", isCorrect: false },
                            { text: "Cada reenvio sai com um id novo, e o consumidor vê mensagens diferentes", isCorrect: true },
                            { text: "O broker já descarta o reenvio pelo `MessageId`, e a inbox nunca é usada", isCorrect: false },
                            { text: "O `Guid` não é aceito como `MessageId`, e o cliente .NET envia o campo vazio", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a marca na tabela de mensagens processadas precisa ser gravada na mesma transação que a fatura?",
                        difficulty: "medio",
                        options: [
                            { text: "Para gravar as duas juntas ou nenhuma, sem duplicar nem perder numa queda", isCorrect: true },
                            { text: "Porque o PostgreSQL só aceita `ON CONFLICT` dentro de uma transação explícita", isCorrect: false },
                            { text: "Para que o broker só reentregue a mensagem depois do commit da transação", isCorrect: false },
                            { text: "Para que o ack seja enviado ao broker pelo próprio banco, junto com o commit", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O consumidor chama a API de cobrança e, quando ela responde com sucesso, grava a marca na inbox e faz commit. O processo cai entre a resposta da API e o commit. O que evita a segunda cobrança quando a mensagem for reentregue?",
                        difficulty: "dificil",
                        options: [
                            { text: "A marca na inbox, que barra a reentrega pela chave (consumidor, `MessageId`)", isCorrect: false },
                            { text: "Ter enviado à API uma chave de idempotência derivada do `MessageId` recebido", isCorrect: true },
                            { text: "O delivery-limit da quorum queue, que impede a segunda entrega da mensagem", isCorrect: false },
                            { text: "Ter aberto a transação antes da chamada, para o rollback desfazer a cobrança", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Ordem das mensagens",
                blocks: [
                    {
                        type: "text",
                        value: "# Ordem das mensagens\n\nO pedido 812 gera três eventos em sequência: criado, pago, cancelado. O consumidor que mantém o status do pedido roda em três instâncias. A instância A pega \"pago\" e espera um lock do banco; a instância B pega \"cancelado\" e termina antes. Quando A finalmente grava, o pedido cancelado volta a constar como pago, e assim fica.\n\nOrdem importa quando mensagens mexem no **mesmo** estado: o status de um pedido, o saldo de uma conta, a réplica de uma tabela. Não importa quando elas são independentes (e-mails para clientes diferentes, miniaturas de imagens) ou quando a operação é comutativa. E quase nunca o sistema precisa de ordem **global**; precisa de ordem **por entidade**. Essa diferença decide a solução.",
                    },
                    {
                        type: "text",
                        value: "## O que o RabbitMQ garante, e o que embaralha\n\nA fila guarda as mensagens na ordem em que foram publicadas (para as que vieram pelo mesmo canal) e as entrega nessa ordem. O embaralhamento acontece depois:\n\n- **Consumidores concorrentes.** A entrega sai em ordem, mas cada instância termina no seu tempo.\n- **Paralelismo dentro do consumidor.** Com `ConsumerDispatchConcurrency` maior que 1, o cliente roda vários handlers do mesmo canal ao mesmo tempo. O padrão é 1, um por vez; num teste com 4, as mensagens terminaram fora de ordem.\n- **Devolução com prefetch alto.** Com prefetch 10, se a primeira mensagem é devolvida, as seguintes já estão no consumidor e são processadas antes de ela voltar. No teste, a ordem processada foi m1 (devolvida), m2, m3, m4, m5, m1.\n- **Retry com espera.** A mensagem que espera é ultrapassada pelas de trás. Com delayed retry, mesmo com um consumidor só, a ordem foi m1 (falhou), m2, m3, m4, m1.\n- **Vários produtores.** Não existe ordem entre mensagens publicadas por canais ou serviços diferentes.",
                    },
                    {
                        type: "table",
                        value: "[[\"Causa\", \"Por que embaralha\", \"Saída\"], [\"Consumidores concorrentes\", \"Cada instância termina no seu tempo\", \"Single active consumer ou partição por chave\"], [\"`ConsumerDispatchConcurrency` maior que 1\", \"Handlers do mesmo canal rodam em paralelo\", \"Manter 1 onde a ordem importa\"], [\"Devolução com prefetch maior que 1\", \"As seguintes já estão no consumidor\", \"Prefetch 1 ou retry dentro do handler\"], [\"Retry com espera\", \"A que espera é ultrapassada\", \"Retry dentro do handler ou número de sequência\"], [\"Vários produtores\", \"Não há ordem entre canais diferentes\", \"Número de sequência gerado na origem\"]]",
                    },
                    {
                        type: "text",
                        value: "## Single active consumer\n\nCom o argumento `x-single-active-consumer` igual a `true`, a fila aceita vários consumidores, mas entrega para **um só** de cada vez. Os outros ficam registrados e parados, e quando o ativo cai o broker passa a entregar para o próximo, sem nenhum código de failover do seu lado. Funciona em fila clássica e em quorum queue. Num teste com duas instâncias, A recebeu as seis primeiras mensagens; derrubada a conexão de A, B assumiu e recebeu as quatro seguintes.\n\nO argumento só vale na declaração: não existe chave de policy para ele, porque uma policy pode ser removida a qualquer momento e a garantia sumiria junto. O preço é a vazão, já que a fila anda no ritmo de um consumidor. Para a ordem resistir a falhas, mantenha o processamento sequencial, o prefetch baixo e, se precisar de retry, faça-o dentro do handler, antes do ack: a fila espera, mas não embaralha.",
                    },
                    {
                        type: "code",
                        value: "// Todas as instâncias declaram e consomem; o broker entrega para uma de cada vez\nawait channel.QueueDeclareAsync(\"pedidos.status\", durable: true, exclusive: false, autoDelete: false,\n    arguments: new Dictionary<string, object?>\n    {\n        [\"x-queue-type\"] = \"quorum\",\n        [\"x-single-active-consumer\"] = true\n    });\nawait channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 1, global: false);\nawait channel.BasicConsumeAsync(\"pedidos.status\", autoAck: false, consumer: consumer);",
                    },
                    {
                        type: "text",
                        value: "## Particionar por chave\n\nSingle active consumer sozinho põe todos os pedidos numa fila só, atrás de um consumidor. Como a ordem só importa dentro do mesmo pedido, dá para dividir: N filas, cada uma com single active consumer, e o produtor manda todos os eventos de um pedido sempre para a mesma fila, escolhida pelo hash do id. A ordem vale por pedido, e N pedidos andam em paralelo.\n\nO erro que derruba esse desenho no .NET é usar `string.GetHashCode()`. O hash de string é aleatório **por processo**: duas instâncias do produtor, ou a mesma depois de reiniciar, calculam números diferentes para \"pedido-812\" e mandam eventos do mesmo pedido para filas diferentes. Num teste, duas execuções seguidas deram -1314338932 e 1534920667 para a mesma string. Use um hash estável, como o `XxHash32` do pacote `System.IO.Hashing`.",
                    },
                    {
                        type: "code",
                        value: "// Particao.cs (pacote System.IO.Hashing)\nusing System.IO.Hashing;\nusing System.Text;\n\npublic static class Particao\n{\n    public const int Total = 4;\n\n    // XxHash32 dá o mesmo número em qualquer processo e em qualquer máquina\n    public static int Da(string chave) =>\n        (int)(XxHash32.HashToUInt32(Encoding.UTF8.GetBytes(chave)) % Total);\n}\n\n// Topologia: exchange direct pedidos.particoes e as filas pedidos.status.p0 a p3,\n// cada uma com single active consumer, ligadas pelas chaves p0 a p3.\n// Publicação: todo evento do pedido 812 cai sempre na mesma partição.\nvar particao = Particao.Da($\"pedido-{evento.PedidoId}\");\nawait channel.BasicPublishAsync(exchange: \"pedidos.particoes\", routingKey: $\"p{particao}\",\n    mandatory: true, basicProperties: props, body: corpo);",
                    },
                    {
                        type: "text",
                        value: "Mudar o número de partições muda o destino de boa parte das chaves, e durante a troca eventos do mesmo pedido podem estar em duas filas. Escolha N com folga e, para mudar, esvazie as filas antes. Se preferir que o broker calcule o hash, o plugin `rabbitmq_consistent_hash_exchange`, que acompanha o RabbitMQ mas vem desligado, cria o tipo de exchange `x-consistent-hash`: cada fila é ligada com um peso como binding key (por exemplo `1`), o produtor publica com o id do pedido como routing key, e a exchange espalha os pedidos pelas filas, sempre o mesmo pedido na mesma fila.\n\n## Quando não dá para garantir: número de sequência\n\nÀs vezes a ordem não tem como ser garantida na entrega: vários produtores, retry com espera, reprocessamento da DLQ. Aí o consumidor precisa tolerar a desordem. Cada evento leva um número de sequência por entidade, gerado na origem, e o consumidor só aplica o que for mais novo que o último aplicado:\n\n`UPDATE pedidos SET status = @status, sequencia = @seq WHERE id = @id AND sequencia < @seq`\n\nSe nenhuma linha mudou, o evento é velho e recebe só o ack. Não use o relógio de máquinas diferentes como ordem: dois servidores nunca concordam no milissegundo.",
                    },
                    {
                        type: "quote",
                        value: "A fila entrega em ordem; quem embaralha é o processamento concorrente, a devolução e a espera. Decida se a ordem importa por entidade, garanta-a com single active consumer e partição por chave, e use número de sequência para tolerar o que escapar.",
                    },
                ],
                questions: [
                    {
                        statement: "Os eventos de um pedido entram em ordem numa fila consumida por três instâncias. Por que o status final do pedido pode sair errado?",
                        difficulty: "facil",
                        options: [
                            { text: "A quorum queue sorteia a ordem de entrega quando há mais de um consumidor", isCorrect: false },
                            { text: "O broker só mantém a ordem de mensagens publicadas com o mesmo `MessageId`", isCorrect: false },
                            { text: "Cada instância tem seu ritmo, e um evento posterior pode terminar antes", isCorrect: true },
                            { text: "O prefetch reordena as mensagens por tamanho antes de entregá-las", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Como se liga o single active consumer numa fila do RabbitMQ?",
                        difficulty: "facil",
                        options: [
                            { text: "Com o argumento `x-single-active-consumer` igual a `true` ao declarar a fila", isCorrect: true },
                            { text: "Com a chave `single-active-consumer` numa policy aplicada às filas pelo nome", isCorrect: false },
                            { text: "Com `prefetchCount` igual a 1 no `BasicQosAsync` de todos os consumidores", isCorrect: false },
                            { text: "Com `exclusive: true` no `BasicConsumeAsync` de cada instância do consumidor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O produtor escolhe a partição de cada evento com `Math.Abs(pedidoId.GetHashCode()) % 4`, sendo `pedidoId` uma `string`. Em produção, eventos do mesmo pedido aparecem em filas diferentes. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "Strings iguais têm hash diferente quando uma vem do JSON e a outra do banco", isCorrect: false },
                            { text: "O hash de string do .NET é aleatório por processo, e muda entre instâncias", isCorrect: true },
                            { text: "O `GetHashCode` muda depois da serialização, quando o corpo vira bytes", isCorrect: false },
                            { text: "O RabbitMQ reescreve a routing key quando a fila de destino está muito cheia", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um sistema precisa de ordem só entre os eventos do mesmo pedido e tem volume alto. Qual desenho atende melhor?",
                        difficulty: "medio",
                        options: [
                            { text: "Uma fila com vários consumidores, todos com prefetch 1 para manter a sequência", isCorrect: false },
                            { text: "Uma fila com single active consumer e `ConsumerDispatchConcurrency` alto", isCorrect: false },
                            { text: "Uma fila só com single active consumer, servindo todos os pedidos em sequência", isCorrect: false },
                            { text: "N filas com single active consumer, e o hash do id fixa a fila de cada pedido", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma quorum queue tem single active consumer, prefetch 1, `x-delayed-retry-type` igual a `all` e `x-delayed-retry-min` igual a 3000. O consumidor falha na m1 e a devolve com `BasicRejectAsync(ea.DeliveryTag, requeue: true)`; m2 e m3 estão logo atrás na fila. Em que ordem as mensagens são processadas?",
                        difficulty: "dificil",
                        options: [
                            { text: "m1 de novo primeiro, porque com prefetch 1 a devolvida volta à cabeça", isCorrect: false },
                            { text: "m1 depois da espera, e m2 e m3 aguardam, porque a fila preserva a ordem", isCorrect: false },
                            { text: "m2 e m3 primeiro; a m1 só volta depois da espera, já fora de ordem", isCorrect: true },
                            { text: "m2 e m3 vão para a DLQ, porque a fila trava enquanto a m1 espera", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Padrões de integração",
        aulas: [
            {
                titulo: "Outbox transacional",
                blocks: [
                    {
                        type: "text",
                        value: "# Outbox transacional\n\nO serviço de pedidos grava o pedido no PostgreSQL e publica `pedido.criado` no RabbitMQ para o faturamento e o estoque reagirem. São dois sistemas, e nenhuma transação abraça os dois. Em algum momento o processo vai morrer entre uma escrita e a outra: um deploy que derruba o pod, o processo morto por falta de memória (OOM), a máquina que reinicia. A questão não é se isso vai acontecer, e sim o que sobra quando acontecer.\n\nEsse é o problema da **escrita dupla** (dual write): duas gravações em sistemas diferentes que precisam acontecer juntas, sem nada que garanta isso.\n\n- **Grava e depois publica**: se o processo cai no meio, o pedido existe e o evento nunca sai. O faturamento não cobra, o estoque não separa, e ninguém percebe até o cliente reclamar.\n- **Publica e depois grava**: se o commit falha (constraint violada, banco fora, timeout), o evento já saiu anunciando um pedido que não existe, e o faturamento cobra um fantasma.",
                    },
                    {
                        type: "code",
                        value: "// PedidoService.cs (escrita dupla: o jeito que perde evento)\npublic async Task<Guid> CriarAsync(Guid clienteId, decimal total, CancellationToken ct)\n{\n    var pedido = new Pedido { Id = Guid.CreateVersion7(), ClienteId = clienteId, Total = total };\n    db.Pedidos.Add(pedido);\n    await db.SaveChangesAsync(ct); // 1. commit no PostgreSQL\n\n    // se o processo morrer aqui (deploy, OOM, queda do nó), o pedido existe\n    // e o evento pedido.criado nunca sai: o faturamento não fica sabendo\n\n    var corpo = JsonSerializer.SerializeToUtf8Bytes(\n        new PedidoCriado(pedido.Id, clienteId, total), JsonSerializerOptions.Web);\n    await canal.BasicPublishAsync(\"pedidos\", \"pedido.criado\", mandatory: false,\n        basicProperties: new BasicProperties { Persistent = true },\n        body: corpo, cancellationToken: ct); // 2. publica no RabbitMQ\n    return pedido.Id;\n}",
                    },
                    {
                        type: "text",
                        value: "## Por que as saídas óbvias não resolvem\n\n- **Retry** resolve falha passageira de rede, não processo morto: quem ia tentar de novo morreu junto.\n- **Publicar antes do commit, dentro da transação do banco**, só troca o lado do problema. O RabbitMQ não participa da transação do PostgreSQL, então um rollback não desfaz a publicação já feita.\n- **Transação distribuída** (commit em duas fases) não está disponível: o RabbitMQ não oferece isso junto com o seu banco, e a transação do canal AMQP (`TxSelectAsync`) vale só dentro do broker.\n- **Publicar num `Task.Run` depois do commit**, para não atrasar a resposta da API, piora: o evento se perde quando o processo cai e também quando a tarefa falha sem ninguém olhar.\n\n## A ideia da outbox\n\nEm vez de falar com dois sistemas, o serviço fala com **um só**. Ele grava o pedido e, **na mesma transação**, grava o evento numa tabela `outbox` do próprio banco. Ou os dois são confirmados, ou nenhum. A partir daí o banco é a fonte da verdade sobre o que precisa ser publicado, e um processo separado, o **publicador da outbox**, lê as linhas pendentes e manda para o RabbitMQ. No código abaixo, `Pedido` é a entidade de sempre e `PedidoCriado` é o record do evento.",
                    },
                    {
                        type: "code",
                        value: "// Outbox.cs\nusing System.Text.Json;\nusing Microsoft.EntityFrameworkCore;\n\npublic sealed class MensagemOutbox\n{\n    public Guid Id { get; set; }\n    public required string Tipo { get; set; }\n    public required string Conteudo { get; set; }\n    public DateTimeOffset CriadaEm { get; set; }\n    public DateTimeOffset? PublicadaEm { get; set; }\n    public int Tentativas { get; set; }\n}\n\npublic sealed class LojaDb(DbContextOptions<LojaDb> options) : DbContext(options)\n{\n    public DbSet<Pedido> Pedidos => Set<Pedido>();\n    public DbSet<MensagemOutbox> Outbox => Set<MensagemOutbox>();\n\n    protected override void OnModelCreating(ModelBuilder modelo)\n    {\n        modelo.Entity<MensagemOutbox>(e =>\n        {\n            e.ToTable(\"outbox\");\n            e.Property(m => m.Conteudo).HasColumnType(\"jsonb\");\n            e.HasIndex(m => m.CriadaEm).HasFilter(\"\\\"PublicadaEm\\\" IS NULL\");\n        });\n    }\n}\n\npublic sealed class PedidoService(LojaDb db)\n{\n    public async Task<Guid> CriarAsync(Guid clienteId, decimal total, CancellationToken ct)\n    {\n        var pedido = new Pedido { Id = Guid.CreateVersion7(), ClienteId = clienteId, Total = total };\n        db.Pedidos.Add(pedido);\n        db.Outbox.Add(new MensagemOutbox\n        {\n            Id = Guid.CreateVersion7(),\n            Tipo = \"pedido.criado\",\n            Conteudo = JsonSerializer.Serialize(\n                new PedidoCriado(pedido.Id, clienteId, total), JsonSerializerOptions.Web),\n            CriadaEm = DateTimeOffset.UtcNow\n        });\n        await db.SaveChangesAsync(ct); // pedido e evento na mesma transação\n        return pedido.Id;\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O publicador da outbox\n\nO publicador é um `BackgroundService` que roda em laço: abre uma transação, pega um lote de linhas pendentes na ordem de criação, publica cada uma com publisher confirms e marca como publicada **só depois** do confirm do broker. Marcar antes e publicar depois recria a escrita dupla dentro do próprio publicador.\n\nQuatro detalhes do código fazem diferença em produção:\n\n- `FOR UPDATE SKIP LOCKED` trava as linhas do lote e faz outra instância **pular** as travadas em vez de esperar. Com duas réplicas da API, cada uma pega um lote diferente e nenhuma linha sai pelas duas ao mesmo tempo.\n- O `MessageId` da mensagem é o `Id` da linha da outbox: é por ele que a inbox do consumidor reconhece uma repetição.\n- Na primeira falha o laço **para** (`break`). Publicar as seguintes deixaria um evento passar na frente de outro que aconteceu antes.\n- `mandatory: false` é de propósito. Evento sem assinante não é erro, e com o rastreamento de confirms ligado um `mandatory: true` sem rota vira `PublishReturnException`: o `break` travaria a outbox inteira atrás de um evento que ninguém assina.",
                    },
                    {
                        type: "code",
                        value: "// PublicadorOutbox.cs\nusing System.Text;\nusing Microsoft.EntityFrameworkCore;\nusing Microsoft.Extensions.DependencyInjection;\nusing Microsoft.Extensions.Hosting;\nusing Microsoft.Extensions.Logging;\nusing RabbitMQ.Client;\n\npublic sealed class PublicadorOutbox(IServiceScopeFactory escopos, IConnection conexao,\n    ILogger<PublicadorOutbox> logger) : BackgroundService\n{\n    private const int TamanhoLote = 50;\n\n    protected override async Task ExecuteAsync(CancellationToken ct)\n    {\n        var opcoes = new CreateChannelOptions(publisherConfirmationsEnabled: true,\n            publisherConfirmationTrackingEnabled: true);\n        await using var canal = await conexao.CreateChannelAsync(opcoes, ct);\n        await canal.ExchangeDeclareAsync(\"pedidos\", ExchangeType.Topic, durable: true,\n            cancellationToken: ct);\n\n        while (!ct.IsCancellationRequested)\n        {\n            var publicadas = 0;\n            try\n            {\n                publicadas = await PublicarLoteAsync(canal, ct);\n            }\n            catch (Exception ex) when (ex is not OperationCanceledException)\n            {\n                logger.LogError(ex, \"Falha ao ler ou gravar a outbox\");\n            }\n            if (publicadas < TamanhoLote)\n                await Task.Delay(TimeSpan.FromSeconds(1), ct); // fila vazia ou erro: respira\n        }\n    }\n\n    private async Task<int> PublicarLoteAsync(IChannel canal, CancellationToken ct)\n    {\n        await using var escopo = escopos.CreateAsyncScope();\n        var db = escopo.ServiceProvider.GetRequiredService<LojaDb>();\n        await using var tx = await db.Database.BeginTransactionAsync(ct);\n\n        var lote = await db.Outbox.FromSql($\"\"\"\n            SELECT * FROM outbox WHERE \"PublicadaEm\" IS NULL\n            ORDER BY \"CriadaEm\" LIMIT {TamanhoLote}\n            FOR UPDATE SKIP LOCKED\n            \"\"\").ToListAsync(ct);\n\n        var publicadas = 0;\n        foreach (var msg in lote)\n        {\n            var props = new BasicProperties\n            {\n                MessageId = msg.Id.ToString(), // a inbox do consumidor deduplica por aqui\n                Type = msg.Tipo,\n                ContentType = \"application/json\",\n                Persistent = true\n            };\n            try\n            {\n                // com o rastreamento ligado, o await só volta depois do confirm do broker.\n                // mandatory false: evento sem assinante não é erro, e o retorno viraria\n                // exceção e travaria a outbox inteira atrás dele\n                await canal.BasicPublishAsync(\"pedidos\", msg.Tipo, mandatory: false,\n                    basicProperties: props, body: Encoding.UTF8.GetBytes(msg.Conteudo),\n                    cancellationToken: ct);\n                msg.PublicadaEm = DateTimeOffset.UtcNow;\n                publicadas++;\n            }\n            catch (Exception ex) when (ex is not OperationCanceledException)\n            {\n                msg.Tentativas++;\n                logger.LogWarning(ex, \"Mensagem {MensagemId} sem confirmação\", msg.Id);\n                break; // não deixa as seguintes passarem na frente da que falhou\n            }\n        }\n\n        await db.SaveChangesAsync(ct);\n        await tx.CommitAsync(ct);\n        return publicadas;\n    }\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Onde o processo cai\", \"O que fica gravado\", \"O que acontece depois\"], [\"Antes do commit do pedido\", \"Nada: nem pedido nem linha na outbox\", \"A API devolve erro e o cliente tenta de novo\"], [\"Depois do commit, antes de publicar\", \"Pedido e linha pendente\", \"O publicador publica no próximo ciclo\"], [\"Depois do confirm, antes de marcar\", \"Linha pendente de um evento já entregue\", \"Sai de novo, e a inbox do consumidor descarta pelo MessageId\"], [\"Broker fora do ar\", \"Linhas pendentes acumulando\", \"Saem em ordem quando o cliente se reconecta\"]]",
                    },
                    {
                        type: "text",
                        value: "## O que a outbox promete\n\nA outbox garante que todo evento de um pedido confirmado **sai pelo menos uma vez**. Não garante \"exatamente uma vez\": a terceira linha da tabela mostra a duplicata. Por isso ela faz par com a inbox do consumidor. A outbox garante que o evento sai; a inbox garante que o efeito acontece uma vez só.\n\nCuidados de quem já rodou isso em produção:\n\n- **Ordem com várias instâncias.** Com `SKIP LOCKED`, duas instâncias não publicam a mesma linha, mas publicam lotes em paralelo, e a ordem global se perde. Faça o teste: com 1.000 pedidos e dois publicadores, chegam 1.000 mensagens, nenhuma repetida, fora da ordem de criação. Se a ordem importa, deixe um publicador só.\n- **Lote pequeno.** A transação fica aberta enquanto o lote é publicado: dezenas de linhas, não milhares.\n- **Limpeza.** Um job apaga as linhas publicadas há alguns dias; sem ele, a tabela cresce para sempre. A coluna `Tentativas` mostra qual linha está segurando a fila.\n- **Vazão.** Confirmar uma a uma é o jeito mais simples de saber exatamente o que saiu. Para mais vazão, dispare o lote e aguarde os confirms juntos, marcando só os que voltaram confirmados.\n- **Outras formas de ler.** Em vez de consultar a tabela, dá para ler o log de replicação do banco (CDC, change data capture). Muda a leitura, não a ideia.",
                    },
                    {
                        type: "quote",
                        value: "Escrita dupla perde evento sem avisar. A outbox troca dois sistemas por uma transação só e deixa a publicação para um processo que pode tentar de novo; o preço é a duplicata ocasional, que a inbox do consumidor existe para absorver.",
                    },
                ],
                questions: [
                    {
                        statement: "O serviço de pedidos grava o pedido no PostgreSQL e, na linha seguinte, publica `pedido.criado` no RabbitMQ. Se o processo cair entre o commit e a publicação, o que acontece?",
                        difficulty: "facil",
                        options: [
                            { text: "O pedido fica gravado e o evento nunca chega ao broker", isCorrect: true },
                            { text: "O pedido é gravado duas vezes quando o serviço reinicia", isCorrect: false },
                            { text: "O cliente .NET reenvia o evento sozinho ao reconectar", isCorrect: false },
                            { text: "Nada se perde, porque a mensagem foi marcada como persistente", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No padrão outbox, o que o serviço grava na mesma transação em que salva o pedido?",
                        difficulty: "facil",
                        options: [
                            { text: "O evento serializado, na tabela inbox do serviço consumidor", isCorrect: false },
                            { text: "O evento serializado, num arquivo local lido depois do commit", isCorrect: false },
                            { text: "O evento serializado, numa fila do RabbitMQ em modo transacional", isCorrect: false },
                            { text: "O evento serializado, numa tabela do próprio banco do serviço", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O publicador da outbox já publicou uma mensagem, recebeu o confirm do broker e caiu antes de marcar a linha como publicada. O que acontece quando ele volta?",
                        difficulty: "medio",
                        options: [
                            { text: "Consulta o confirm guardado no broker, vê que a linha já saiu e só a marca como publicada", isCorrect: false },
                            { text: "Publica a linha de novo com um MessageId novo, e o consumidor processa as duas cópias", isCorrect: false },
                            { text: "Publica de novo com o mesmo MessageId, e a inbox do consumidor descarta a repetição", isCorrect: true },
                            { text: "Pula a linha, que ficou travada pelo FOR UPDATE da transação que foi interrompida", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a consulta do publicador da outbox termina com `FOR UPDATE SKIP LOCKED`?",
                        difficulty: "medio",
                        options: [
                            { text: "Para as linhas travadas por outra instância serem publicadas em dobro, por garantia", isCorrect: false },
                            { text: "Para duas instâncias do publicador pegarem lotes diferentes sem esperar uma pela outra", isCorrect: true },
                            { text: "Para o PostgreSQL apagar as linhas do lote assim que a transação do publicador terminar", isCorrect: false },
                            { text: "Para a publicação no RabbitMQ entrar na mesma transação que as linhas do PostgreSQL", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um colega mudou o laço do publicador da outbox para \"não segurar a transação aberta durante a rede\":\n\n```csharp\nforeach (var msg in lote)\n    msg.PublicadaEm = DateTimeOffset.UtcNow;\nawait db.SaveChangesAsync(ct);\nawait tx.CommitAsync(ct);\n\nforeach (var msg in lote)\n    await canal.BasicPublishAsync(\"pedidos\", msg.Tipo, mandatory: false,\n        basicProperties: Props(msg), body: Corpo(msg), cancellationToken: ct);\n```\n\nO que essa mudança introduz?",
                        difficulty: "dificil",
                        options: [
                            { text: "Nenhum risco novo: um nack do broker devolve as linhas marcadas para o estado pendente", isCorrect: false },
                            { text: "Evento duplicado: se o processo cair depois do commit, as linhas voltam a ficar pendentes", isCorrect: false },
                            { text: "Bloqueio: as linhas seguem travadas pelo FOR UPDATE até a última publicação do lote", isCorrect: false },
                            { text: "Evento perdido: se o processo cair depois do commit, as linhas já constam como publicadas", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Request/reply sobre fila",
                blocks: [
                    {
                        type: "text",
                        value: "# Request/reply sobre fila\n\nO checkout precisa do valor do frete antes de mostrar o total, e o cálculo mora no serviço de logística. Alguém sugere: \"já temos RabbitMQ, manda uma mensagem pedindo a cotação e espera a resposta\". Funciona, e o RabbitMQ tem o mecanismo para isso. Antes de decidir se vale a pena, é preciso entender como funciona e quanto custa.\n\nO padrão **request/reply** (pedido e resposta) sobre fila usa duas propriedades da mensagem:\n\n- **`ReplyTo`**: o nome da fila em que quem pergunta quer receber a resposta.\n- **`CorrelationId`**: um identificador único por pedido, que o servidor copia na resposta. É assim que o cliente sabe a qual pedido cada resposta pertence, já que várias chamadas podem estar em andamento ao mesmo tempo.\n\n## O lado de quem pergunta\n\nO cliente cria uma fila de resposta só dele: `QueueDeclareAsync()` sem argumentos devolve uma fila com nome gerado pelo broker, não durável, exclusiva da conexão e apagada quando ela fecha. A exclusividade não é detalhe: desde o RabbitMQ 4.3, declarar fila com `durable: false` e `exclusive: false`, combinação comum em tutorial antigo, é recusado por padrão, e o broker fecha a conexão inteira com o erro 541. O cliente consome essa fila com ack automático e guarda num dicionário um `TaskCompletionSource` por `CorrelationId` em aberto. Quando a resposta chega, o handler acha a espera pelo id e a completa.\n\nDois detalhes costumam faltar no primeiro rascunho:\n\n- **Timeout.** Sem ele, uma resposta que nunca vem trava a chamada para sempre. `WaitAsync(timeout)` lança `TimeoutException`, e o `finally` limpa o dicionário.\n- **`Expiration` igual ao timeout.** O valor é texto com milissegundos (`\"2000\"`). Se o pedido ficou na fila mais tempo do que o cliente aceita esperar, ele vence e é descartado quando chega à frente da fila, antes de alguém gastar trabalho com ele.",
                    },
                    {
                        type: "code",
                        value: "// ClienteCotacao.cs\nusing System.Collections.Concurrent;\nusing System.Text;\nusing RabbitMQ.Client;\nusing RabbitMQ.Client.Events;\n\npublic sealed class ClienteCotacao(IChannel canal, string filaResposta) : IAsyncDisposable\n{\n    private readonly ConcurrentDictionary<string, TaskCompletionSource<string>> pendentes = new();\n\n    public static async Task<ClienteCotacao> CriarAsync(IConnection conexao)\n    {\n        var canal = await conexao.CreateChannelAsync();\n        var fila = await canal.QueueDeclareAsync(); // nome gerado pelo broker, exclusiva\n        var cliente = new ClienteCotacao(canal, fila.QueueName);\n\n        var consumidor = new AsyncEventingBasicConsumer(canal);\n        consumidor.ReceivedAsync += (_, ea) =>\n        {\n            // resposta sem dono (chegou depois do timeout) é descartada aqui\n            if (ea.BasicProperties.CorrelationId is { } id &&\n                cliente.pendentes.TryRemove(id, out var espera))\n                espera.TrySetResult(Encoding.UTF8.GetString(ea.Body.Span));\n            return Task.CompletedTask;\n        };\n        await canal.BasicConsumeAsync(fila.QueueName, autoAck: true, consumer: consumidor);\n        return cliente;\n    }\n\n    public async Task<string> CotarAsync(string pedidoJson, TimeSpan timeout)\n    {\n        var id = Guid.NewGuid().ToString();\n        var espera = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);\n        pendentes[id] = espera;\n        var props = new BasicProperties\n        {\n            CorrelationId = id,\n            ReplyTo = filaResposta,\n            Expiration = ((long)timeout.TotalMilliseconds).ToString() // vencido, nem processa\n        };\n        try\n        {\n            await canal.BasicPublishAsync(\"\", \"cotacao\", mandatory: false,\n                basicProperties: props, body: Encoding.UTF8.GetBytes(pedidoJson));\n            return await espera.Task.WaitAsync(timeout); // TimeoutException se não vier\n        }\n        finally\n        {\n            pendentes.TryRemove(id, out _);\n        }\n    }\n\n    public ValueTask DisposeAsync() => canal.DisposeAsync();\n}",
                    },
                    {
                        type: "text",
                        value: "## O lado de quem responde\n\nO servidor é um consumidor comum. Depois de processar, ele publica a resposta na **default exchange** (nome vazio) com o `ReplyTo` como routing key, copia o `CorrelationId` e só então dá o ack no pedido. Toda fila está ligada à default exchange pelo próprio nome, então a resposta cai direto na fila do cliente.",
                    },
                    {
                        type: "code",
                        value: "// ServidorCotacao.cs (o consumidor da fila \"cotacao\")\nconsumidor.ReceivedAsync += async (_, ea) =>\n{\n    var pedido = Encoding.UTF8.GetString(ea.Body.Span);\n    var resposta = await calcularCotacaoAsync(pedido);\n\n    if (ea.BasicProperties.ReplyTo is { } replyTo)\n    {\n        var props = new BasicProperties { CorrelationId = ea.BasicProperties.CorrelationId };\n        // default exchange: a routing key é o nome da fila de resposta\n        await canal.BasicPublishAsync(\"\", replyTo, mandatory: false,\n            basicProperties: props, body: Encoding.UTF8.GetBytes(resposta));\n    }\n    await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n};",
                    },
                    {
                        type: "text",
                        value: "Se o servidor cair depois de responder e antes do ack, o pedido volta para a fila e é processado de novo. A segunda resposta chega com um `CorrelationId` que o cliente já tirou do dicionário e é descartada, mas o processamento aconteceu duas vezes: se ele tem efeito colateral, precisa ser idempotente como qualquer consumidor.\n\nPara não criar uma fila por cliente, o RabbitMQ oferece o **direct reply-to**. O cliente consome a pseudofila `amq.rabbitmq.reply-to` com ack automático e publica o pedido **na mesma conexão e no mesmo canal**, com `ReplyTo` apontando para ela. Nenhuma fila guarda a resposta: se o cliente desconectar antes de ela chegar, ela é descartada.",
                    },
                    {
                        type: "code",
                        value: "// id é o CorrelationId do pedido; resposta, um TaskCompletionSource<string>.\n// Mesma conexão e mesmo canal para consumir a resposta e publicar o pedido.\nawait using var canal = await conexao.CreateChannelAsync();\nvar consumidor = new AsyncEventingBasicConsumer(canal);\nconsumidor.ReceivedAsync += (_, ea) =>\n{\n    if (ea.BasicProperties.CorrelationId == id)\n        resposta.TrySetResult(Encoding.UTF8.GetString(ea.Body.Span));\n    return Task.CompletedTask;\n};\nawait canal.BasicConsumeAsync(\"amq.rabbitmq.reply-to\", autoAck: true, consumer: consumidor);\n\nvar props = new BasicProperties { CorrelationId = id, ReplyTo = \"amq.rabbitmq.reply-to\" };\nawait canal.BasicPublishAsync(\"\", \"cotacao\", mandatory: false,\n    basicProperties: props, body: Encoding.UTF8.GetBytes(pedidoJson));",
                    },
                    {
                        type: "text",
                        value: "## Por que RPC sobre fila costuma ser má ideia\n\nRepare no que sobrou do desacoplamento: o checkout continua **parado esperando** a logística. Se ela estiver fora do ar, a chamada não falha na hora; espera o timeout inteiro e falha depois. Os problemas do acoplamento síncrono continuam todos lá, agora com o broker no meio:\n\n- **Mais uma peça no caminho**: ida e volta pelo broker, mais um ponto de falha, rastreamento mais difícil.\n- **Trabalho jogado fora**: com o servidor lento, os pedidos se acumulam e, quando ele chega neles, o cliente já desistiu. Sem `Expiration`, o servidor atravessa uma fila inteira de pedidos que ninguém mais espera.\n- **Resposta órfã**: se o cliente reinicia, a fila de resposta some com a conexão e as respostas em voo vão para lugar nenhum. Se o pedido era \"cobrar\", a cobrança aconteceu e o cliente não sabe.\n\nMuita gente adota RPC sobre fila para \"não depender de HTTP\" e termina com uma chamada síncrona mais lenta e mais difícil de depurar. O tutorial oficial do RabbitMQ fecha o assunto com um conselho: na dúvida, evite RPC.",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\", \"Caminho melhor\"], [\"A tela precisa da resposta agora para continuar\", \"Chamada direta (HTTP ou gRPC) com timeout\"], [\"O trabalho é longo e o resultado pode vir depois\", \"Comando na fila e um evento quando terminar\"], [\"Quem responde só alcança o broker (rede isolada)\", \"Request/reply sobre fila, com timeout e Expiration\"], [\"Ferramenta interna, pouco volume, tudo já no RabbitMQ\", \"Request/reply aceitável, com servidor idempotente\"]]",
                    },
                    {
                        type: "quote",
                        value: "Request/reply sobre fila funciona com `ReplyTo`, `CorrelationId`, timeout e `Expiration`, mas deixa quem chama esperando, que é o acoplamento que a fila deveria tirar. Use quando a rede obriga; se a resposta pode chegar depois, troque por comando e evento, e para resposta imediata chame direto.",
                    },
                ],
                questions: [
                    {
                        statement: "Num request/reply sobre fila, para que serve o `CorrelationId`?",
                        difficulty: "facil",
                        options: [
                            { text: "Para o broker entregar a resposta na mesma conexão que fez o pedido", isCorrect: false },
                            { text: "Para o broker descartar os pedidos que passaram do tempo de espera", isCorrect: false },
                            { text: "Para o servidor descobrir em qual fila deve publicar a resposta do pedido", isCorrect: false },
                            { text: "Para o cliente saber a qual pedido em andamento cada resposta pertence", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Onde o servidor publica a resposta de um pedido que chegou com `ReplyTo` preenchido?",
                        difficulty: "facil",
                        options: [
                            { text: "Na default exchange, com o CorrelationId como routing key", isCorrect: false },
                            { text: "Na default exchange, com o valor de ReplyTo como routing key", isCorrect: true },
                            { text: "Na fila do pedido, com o ReplyTo copiado num cabeçalho", isCorrect: false },
                            { text: "Na exchange do pedido, com o valor de ReplyTo como routing key", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O servidor de cotação ficou lento e a fila `cotacao` acumulou pedidos. Os clientes desistem depois de 2 segundos. Que ajuste evita que o servidor gaste tempo com pedidos que ninguém mais espera?",
                        difficulty: "medio",
                        options: [
                            { text: "Aumentar o prefetch do servidor, para ele puxar os pedidos antes que vençam", isCorrect: false },
                            { text: "Publicar cada pedido com prioridade alta, para o servidor atender primeiro os novos", isCorrect: false },
                            { text: "Pôr x-message-ttl de 2000 na fila de resposta, para as respostas vencidas sumirem", isCorrect: false },
                            { text: "Publicar cada pedido com Expiration de 2000, para o broker descartar os vencidos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Por que request/reply sobre fila costuma ser má escolha para buscar um dado de que a tela do usuário precisa na hora?",
                        difficulty: "medio",
                        options: [
                            { text: "Porque quem chama continua parado esperando, e o broker só acrescenta latência e falhas", isCorrect: true },
                            { text: "Porque o CorrelationId só existe no AMQP 1.0, e o cliente .NET clássico usa o 0.9.1", isCorrect: false },
                            { text: "Porque a resposta precisa ser persistente, e isso exige quorum queue do lado do cliente", isCorrect: false },
                            { text: "Porque o RabbitMQ aceita uma única chamada de request/reply por conexão de cada vez", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O cliente de pagamentos faz `cobrar` via request/reply, com a fila de resposta criada por `QueueDeclareAsync()` sem argumentos, e é reiniciado por um deploy logo depois de publicar o pedido. O servidor processa a cobrança e publica a resposta. O que acontece, e o que o sistema precisa ter?",
                        difficulty: "dificil",
                        options: [
                            { text: "A resposta vai para a dead letter exchange do servidor, e o cliente a recupera quando volta ao ar", isCorrect: false },
                            { text: "A resposta espera na fila exclusiva, que é durável por padrão; basta o cliente reconectar e consumir", isCorrect: false },
                            { text: "A resposta se perde com a fila exclusiva; a cobrança ocorreu, e o servidor precisa ser idempotente", isCorrect: true },
                            { text: "O broker devolve o pedido à fila ao perceber a queda; a cobrança é desfeita e feita de novo depois", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Sagas: transação entre serviços",
                blocks: [
                    {
                        type: "text",
                        value: "# Sagas: transação entre serviços\n\nFechar um pedido envolve três serviços, cada um com o seu banco: o estoque reserva os itens, o pagamento cobra o cartão e a logística agenda a entrega. Num monolito, isso seria uma transação só: cartão recusado, rollback, e a reserva sumia junto. Entre serviços não existe esse rollback. Cada passo é uma transação local, já confirmada quando o próximo começa.\n\nUma **saga** é essa sequência de transações locais ligadas por mensagens, em que cada passo que pode ser desfeito tem uma **transação de compensação**: a ação de negócio que anula o efeito dele. Reserva se compensa liberando a reserva; cobrança se compensa com estorno.\n\n## Compensar não é desfazer\n\nA compensação não apaga o passado; registra um fato novo que anula o anterior. O estorno aparece na fatura ao lado da cobrança, e e-mail enviado não volta (compensa-se com outro e-mail). Por isso a ordem dos passos é decisão de projeto:\n\n- **Passos compensáveis primeiro**: reservas e validações, baratos de desfazer.\n- **O pivô**: o ponto sem volta. Depois dele, a saga vai até o fim.\n- **Passos que só andam para frente por último**: depois do pivô, falha não se compensa, se **tenta de novo** até dar certo.\n\nNa saga do pedido, cobrar é o pivô: se a logística falhar, a saga insiste no agendamento em vez de estornar. Se o negócio admite que a entrega falhe de vez, a cobrança deixa de ser o pivô e passa a precisar de compensação também. E a compensação é mensagem como qualquer outra: pode chegar repetida, então precisa ser idempotente.",
                    },
                    {
                        type: "text",
                        value: "## Coreografia: cada serviço reage aos eventos\n\nNa **coreografia** não há coordenador. O serviço de pedidos publica `pedido.criado`; o estoque reage, reserva e publica `estoque.reservado`; o pagamento reage e publica `pagamento.aprovado` ou `pagamento.recusado`; o estoque também escuta `pagamento.recusado` para liberar a reserva. Cada serviço conhece só os eventos de que precisa.\n\nFunciona bem com dois ou três passos. Com mais, o fluxo se espalha: responder \"em que pé está o pedido 123?\" exige juntar logs de vários serviços, e mudar a ordem dos passos exige deploy coordenado de vários times. O erro clássico é o ciclo que ninguém desenhou: A reage a B, que reage a C, que reage a A.\n\n## Orquestração: um coordenador com estado\n\nNa **orquestração**, um orquestrador guarda o estado da saga e manda **comandos** a cada participante (\"reserve\", \"cobre\", \"agende\"), reagindo às respostas. O fluxo fica num lugar só, legível e testável. O risco é o orquestrador saber demais: ele decide a ordem dos passos, mas a regra de cada passo continua no serviço dono dela.\n\nO coração do orquestrador é uma máquina de estados: dada a etapa atual e o evento que chegou, qual a próxima etapa e quais comandos enviar. Eventos e comandos são records simples, como `EstoqueReservado(Guid PedidoId)` e `CobrarPagamento(Guid PedidoId, decimal Valor)`.",
                    },
                    {
                        type: "code",
                        value: "// SagaPedido.cs: o estado da saga e o que fazer a cada evento\npublic enum EtapaSaga { ReservandoEstoque, Cobrando, AgendandoEntrega, Concluida, Cancelada }\n\npublic sealed class SagaPedido\n{\n    public Guid PedidoId { get; init; }\n    public decimal Valor { get; init; }\n    public EtapaSaga Etapa { get; private set; } = EtapaSaga.ReservandoEstoque;\n    public DateTimeOffset AtualizadaEm { get; private set; } = DateTimeOffset.UtcNow;\n    public uint Versao { get; private set; } // concorrência otimista (xmin no PostgreSQL)\n\n    public IReadOnlyList<Comando> Tratar(Evento evento) => (Etapa, evento) switch\n    {\n        (EtapaSaga.ReservandoEstoque, EstoqueReservado) =>\n            IrPara(EtapaSaga.Cobrando, new CobrarPagamento(PedidoId, Valor)),\n        (EtapaSaga.ReservandoEstoque, EstoqueIndisponivel) =>\n            IrPara(EtapaSaga.Cancelada, new CancelarPedido(PedidoId, \"sem estoque\")),\n        (EtapaSaga.Cobrando, PagamentoAprovado) =>\n            IrPara(EtapaSaga.AgendandoEntrega, new AgendarEntrega(PedidoId)),\n        (EtapaSaga.Cobrando, PagamentoRecusado) => // compensa o que já tinha dado certo\n            IrPara(EtapaSaga.Cancelada, new LiberarEstoque(PedidoId),\n                new CancelarPedido(PedidoId, \"pagamento recusado\")),\n        (EtapaSaga.AgendandoEntrega, EntregaAgendada) =>\n            IrPara(EtapaSaga.Concluida),\n        _ => [] // evento repetido ou fora de hora: nada de novo a fazer\n    };\n\n    private Comando[] IrPara(EtapaSaga proxima, params Comando[] comandos)\n    {\n        Etapa = proxima;\n        AtualizadaEm = DateTimeOffset.UtcNow;\n        return comandos;\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "O último braço do `switch` é tão importante quanto os outros: evento repetido ou fora de hora não produz nada. Com entrega pelo menos uma vez, `EstoqueReservado` pode chegar duas vezes, e a segunda não pode cobrar o cliente de novo.\n\nO estado da saga mora no banco do orquestrador, e cada transição precisa salvar **a etapa nova e os comandos juntos**. Se salvar a etapa e o processo cair antes de publicar, a saga fica em `Cobrando` para sempre, esperando a resposta de uma cobrança que ninguém pediu. É a escrita dupla de novo, com a mesma resposta: os comandos vão para a outbox, na mesma transação. No trecho abaixo, `MensagemOutbox.Para` só monta a linha da outbox a partir do comando (o nome do tipo e o JSON).",
                    },
                    {
                        type: "code",
                        value: "// OrquestradorPedido.cs: chamado pelo consumidor da fila de eventos da saga\npublic async Task TratarAsync(Evento evento, CancellationToken ct)\n{\n    var saga = await db.Sagas.SingleAsync(s => s.PedidoId == evento.PedidoId, ct);\n    foreach (var comando in saga.Tratar(evento))\n        db.Outbox.Add(MensagemOutbox.Para(comando));\n\n    // etapa nova e comandos na mesma transação: os dois ou nenhum.\n    // Se outro consumidor mexeu na mesma saga, a Versao não bate e o\n    // SaveChanges lança DbUpdateConcurrencyException: nack e tenta de novo.\n    await db.SaveChangesAsync(ct);\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Aspecto\", \"Coreografia\", \"Orquestração\"], [\"Onde está o fluxo\", \"Espalhado pelos serviços\", \"No orquestrador\"], [\"Mensagens\", \"Eventos\", \"Comandos e respostas\"], [\"Estado de um pedido\", \"Juntar logs de vários serviços\", \"Consultar a tabela da saga\"], [\"Mudar a ordem dos passos\", \"Deploy em vários serviços\", \"Mudança num lugar só\"], [\"Risco típico\", \"Ciclo de eventos sem dono\", \"Orquestrador concentrando regra de negócio\"], [\"Combina com\", \"Poucos passos, times independentes\", \"Fluxos longos, com compensação e prazo\"]]",
                    },
                    {
                        type: "text",
                        value: "## Prazo: a saga que nunca termina\n\nE se o pagamento nunca responder? Sem prazo, o pedido fica \"aguardando pagamento\" para sempre, que é o defeito mais comum em saga. Um job periódico procura sagas paradas na mesma etapa há mais tempo que o aceitável (a coluna `AtualizadaEm` existe para isso) e decide: consultar o participante, reenviar o comando (que é idempotente) ou compensar e cancelar.\n\nEnquanto a saga anda, o pedido fica num estado intermediário visível para todo mundo. É o \"I\" do ACID, o isolamento, que a saga não tem: em vez de esconder o estado intermediário, deixe-o explícito (\"aguardando pagamento\") e faça o resto do sistema respeitá-lo.",
                    },
                    {
                        type: "quote",
                        value: "Saga troca o rollback que não existe entre serviços por compensações de negócio, com os passos compensáveis antes do pivô. Coreografia serve para fluxos curtos; para fluxos longos, um orquestrador com estado no banco, comandos na outbox e prazo para cada etapa.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa saga, o que é uma transação de compensação?",
                        difficulty: "facil",
                        options: [
                            { text: "Um registro de auditoria que guarda o estado anterior dos bancos de cada serviço", isCorrect: false },
                            { text: "Uma ação de negócio que anula um passo já confirmado, como estornar uma cobrança", isCorrect: true },
                            { text: "Um rollback distribuído que o broker aplica em todos os bancos que entraram na saga", isCorrect: false },
                            { text: "Uma nova tentativa automática do passo que falhou, repetida até ele ser confirmado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a diferença entre coreografia e orquestração numa saga?",
                        difficulty: "facil",
                        options: [
                            { text: "Na coreografia a compensação é automática; na orquestração cada serviço precisa desfazer o próprio passo", isCorrect: false },
                            { text: "Na coreografia os passos rodam em paralelo; na orquestração eles rodam numa transação distribuída única", isCorrect: false },
                            { text: "Na coreografia um coordenador manda comandos; na orquestração os serviços reagem aos eventos uns dos outros", isCorrect: false },
                            { text: "Na coreografia os serviços reagem aos eventos uns dos outros; na orquestração um coordenador manda comandos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Na saga do pedido, o estoque já foi reservado e o pagamento acabou de ser recusado. O que o orquestrador deve fazer?",
                        difficulty: "medio",
                        options: [
                            { text: "Mandar estornar o pagamento recusado e cancelar o pedido", isCorrect: false },
                            { text: "Pedir ao estoque um rollback da transação que reservou os itens", isCorrect: false },
                            { text: "Mandar liberar a reserva de estoque e cancelar o pedido", isCorrect: true },
                            { text: "Reenviar a cobrança até ela ser aprovada, mantendo a reserva", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que o passo sem volta da saga (o pivô) deve vir depois dos passos que podem ser compensados?",
                        difficulty: "medio",
                        options: [
                            { text: "Porque os passos compensáveis deixam de falhar depois que o pivô é confirmado", isCorrect: false },
                            { text: "Porque o broker só entrega comandos de passos compensáveis antes do pivô", isCorrect: false },
                            { text: "Porque depois do pivô a saga não compensa mais, só tenta de novo até concluir", isCorrect: true },
                            { text: "Porque o pivô depende da transação distribuída que os passos anteriores abrem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O orquestrador salva a nova etapa da saga com `SaveChangesAsync` e, na linha seguinte, publica `CobrarPagamento` direto no canal. Em produção, algumas sagas ficam paradas em `Cobrando` para sempre. Qual é a causa provável e a correção?",
                        difficulty: "dificil",
                        options: [
                            { text: "O switch descarta eventos repetidos; o orquestrador deve reprocessar todo evento que chegar", isCorrect: false },
                            { text: "O pagamento perde o comando por falta de prefetch; o comando deve sair com prioridade mais alta", isCorrect: false },
                            { text: "Falta concorrência otimista; a etapa deve ser salva só depois de o comando ser publicado", isCorrect: false },
                            { text: "O processo cai entre o commit e a publicação; o comando deve entrar na outbox junto com a etapa", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Contratos e versões de mensagem",
                blocks: [
                    {
                        type: "text",
                        value: "# Contratos e versões de mensagem\n\nNuma sexta-feira, o time de pedidos renomeou o campo `total` para `valorTotal` no evento `pedido.criado`, porque o nome novo era mais claro. O deploy passou em todos os testes do serviço de pedidos. O faturamento, que lia `total`, passou a receber zero e a emitir faturas zeradas, sem erro nenhum no log: o campo simplesmente não vinha mais, e o desserializador preencheu o valor padrão.\n\nCom fila, produtor e consumidor sobem em momentos diferentes, e a compatibilidade precisa valer nas duas direções:\n\n- **Consumidor novo lendo mensagem velha**: quando a versão nova do consumidor sobe, a fila (e a DLQ) ainda tem mensagens no formato antigo.\n- **Consumidor velho lendo mensagem nova**: o produtor atualiza primeiro, e por horas ou semanas há consumidores rodando o código antigo.",
                    },
                    {
                        type: "table",
                        value: "[[\"Mudança no contrato\", \"Quem quebra\", \"Como fazer\"], [\"Acrescentar campo opcional\", \"Ninguém, se o consumidor ignora o que não conhece\", \"Direto\"], [\"Acrescentar campo obrigatório\", \"Consumidor novo lendo mensagem antiga\", \"Entra opcional, com valor padrão\"], [\"Remover campo\", \"Quem ainda lê o campo\", \"Só depois que nenhum consumidor usar\"], [\"Renomear campo\", \"Quem lê o nome antigo (é remover e acrescentar)\", \"Mandar os dois, migrar, remover o antigo\"], [\"Mudar o tipo do campo\", \"Todo mundo que lê o campo\", \"Campo novo ou versão nova do tipo\"], [\"Mudar o significado (reais para centavos)\", \"Todo mundo, sem erro nenhum\", \"Campo novo ou versão nova do tipo\"], [\"Valor novo num enum\", \"Consumidor com enum fechado\", \"Consumidor trata valor desconhecido\"]]",
                    },
                    {
                        type: "text",
                        value: "## Consumidor tolerante\n\nO **consumidor tolerante** (tolerant reader) lê só os campos de que precisa, ignora o resto e dá valor padrão ao que pode faltar. Cada consumidor declara o próprio record com os campos que usa, em vez de reaproveitar a classe inteira do produtor. O System.Text.Json ajuda: por padrão ele **ignora campo desconhecido** e, quando um parâmetro do construtor não vem no JSON, usa o valor padrão desse parâmetro.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: o mesmo evento, antes e depois de ganhar campos\nusing System.Text.Json;\n\nconst string antiga = \"\"\"\n    { \"pedidoId\": \"0199f3c2-0b7e-7c4e-9d0a-5f1e2a3b4c5d\", \"total\": 150.00 }\n    \"\"\";\nconst string nova = \"\"\"\n    { \"pedidoId\": \"0199f3c2-0b7e-7c4e-9d0a-5f1e2a3b4c5d\", \"total\": 150.00,\n      \"cupom\": \"BEMVINDO10\", \"canal\": \"app\" }\n    \"\"\";\n\nvar opcoes = JsonSerializerOptions.Web; // camelCase, sem diferenciar maiúsculas\n\n// consumidor antigo lendo a mensagem nova: o que ele não conhece é ignorado\nvar fat = JsonSerializer.Deserialize<PedidoParaFaturamento>(nova, opcoes)!;\nConsole.WriteLine($\"faturamento: total {fat.Total}\"); // faturamento: total 150,00\n\n// consumidor novo lendo a mensagem antiga, que ainda está na fila ou na DLQ\nvar mkt = JsonSerializer.Deserialize<PedidoParaMarketing>(antiga, opcoes)!;\nConsole.WriteLine($\"marketing: cupom {mkt.Cupom ?? \"(nenhum)\"}\"); // marketing: cupom (nenhum)\n\n// cada consumidor declara só os campos que usa, e o que pode faltar é opcional\nrecord PedidoParaFaturamento(Guid PedidoId, decimal Total);\nrecord PedidoParaMarketing(Guid PedidoId, string? Cupom = null);",
                    },
                    {
                        type: "text",
                        value: "## Três jeitos de quebrar o que funcionava\n\nMuita gente endurece o consumidor achando que está validando e transforma toda evolução do produtor em mensagem venenosa:\n\n- **`required` em campo novo**: o System.Text.Json passa a exigir o campo, e toda mensagem antiga na fila ou na DLQ lança `JsonException`.\n- **`JsonUnmappedMemberHandling.Disallow`**: recusar campo desconhecido derruba o consumidor no dia em que o produtor acrescenta qualquer coisa, que é justamente a mudança compatível.\n- **Enum fechado**: com `JsonStringEnumConverter`, um valor que o consumidor não conhece (`\"whatsapp\"`) quebra a leitura. Leia como `string` e trate o desconhecido.\n\nA regra prática: tolerante com o que você não usa, rigoroso com o que usa. O faturamento precisa do total; se o campo sumiu, a mensagem deve ir para a DLQ com erro claro, não virar fatura zerada.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: três jeitos de um campo novo virar mensagem venenosa\nusing System.Text.Json;\nusing System.Text.Json.Serialization;\n\nconst string antiga = \"\"\"\n    { \"pedidoId\": \"0199f3c2-0b7e-7c4e-9d0a-5f1e2a3b4c5d\", \"total\": 150.00 }\n    \"\"\";\nconst string nova = \"\"\"\n    { \"pedidoId\": \"0199f3c2-0b7e-7c4e-9d0a-5f1e2a3b4c5d\", \"total\": 150.00,\n      \"canal\": \"whatsapp\" }\n    \"\"\";\n\n// 1. required num campo que as mensagens antigas não têm\nLer<ComCupomObrigatorio>(antiga, JsonSerializerOptions.Web);\n// JsonException: ... was missing required properties including: 'cupom'.\n\n// 2. recusar campo desconhecido: o produtor acrescenta \"canal\" e o consumidor cai\nLer<SoTotal>(nova, new JsonSerializerOptions(JsonSerializerOptions.Web)\n{\n    UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow\n}); // JsonException: The JSON property 'canal' could not be mapped ...\n\n// 3. enum fechado: chega um valor que o consumidor não conhece\nLer<ComCanal>(nova, new JsonSerializerOptions(JsonSerializerOptions.Web)\n{\n    Converters = { new JsonStringEnumConverter() }\n}); // JsonException: The JSON value could not be converted ... Path: $.canal\n\nstatic void Ler<T>(string json, JsonSerializerOptions opcoes)\n{\n    try\n    {\n        JsonSerializer.Deserialize<T>(json, opcoes);\n        Console.WriteLine($\"{typeof(T).Name}: leu\");\n    }\n    catch (JsonException ex)\n    {\n        Console.WriteLine($\"{typeof(T).Name}: {ex.Message}\");\n    }\n}\n\nclass ComCupomObrigatorio\n{\n    public Guid PedidoId { get; init; }\n    public required string Cupom { get; init; }\n}\nrecord SoTotal(Guid PedidoId, decimal Total);\nenum Canal { Site, App }\nrecord ComCanal(Guid PedidoId, Canal Canal);",
                    },
                    {
                        type: "text",
                        value: "## Quando a quebra é inevitável: versão no tipo\n\nÀs vezes o contrato precisa mudar de verdade: `total`, que era um número em reais, vira um objeto com valor e moeda. Não há como fazer isso de forma compatível. Em vez de editar o tipo que existe, crie **outro**, com a versão no nome, na propriedade `Type` e na routing key. Por isso vale nomear com versão desde o primeiro dia: o evento sai como `pedido.criado.v1` mesmo antes de existir a v2, porque acrescentar o sufixo depois muda a routing key e quebra os bindings que já existem. A transição para `pedido.criado.v2` segue um roteiro:\n\n1. O produtor publica **as duas versões** de cada evento (duas linhas na outbox, na mesma transação).\n2. Cada consumidor migra no seu ritmo: o código novo entende v1 e v2, porque a fila ainda tem v1 antigas, e o binding passa de `pedido.criado.v1` para `pedido.criado.v2`. Ligue a v2 antes de desligar a v1, senão o que for publicado no intervalo se perde; e nesse intervalo curto o mesmo pedido pode chegar nas duas versões, o que só a idempotência pela chave de negócio (o `pedidoId`) segura, já que os `MessageId` são diferentes.\n3. Quando nenhum binding aponta mais para a v1 e não há v1 em fila nem em DLQ, o produtor para de publicar a v1.\n\nCuidado com o binding curinga: uma fila ligada em `pedido.criado.*` recebe as duas versões o tempo todo, ou seja, **o mesmo pedido duas vezes**, com `MessageId` diferentes, e uma inbox que deduplica pelo `MessageId` não percebe. Cada fila assina exatamente uma versão.",
                    },
                    {
                        type: "code",
                        value: "// ConsumidorFaturamento.cs: o contrato é escolhido pelo tipo da mensagem\nconsumidor.ReceivedAsync += async (_, ea) =>\n{\n    switch (ea.BasicProperties.Type)\n    {\n        case \"pedido.criado.v1\": // ainda há v1 na fila durante a troca\n            var v1 = JsonSerializer.Deserialize<PedidoCriadoV1>(ea.Body.Span, JsonSerializerOptions.Web)!;\n            await faturamento.FaturarAsync(v1.PedidoId, v1.Total);\n            break;\n        case \"pedido.criado.v2\": // total virou objeto com valor e moeda\n            var v2 = JsonSerializer.Deserialize<PedidoCriadoV2>(ea.Body.Span, JsonSerializerOptions.Web)!;\n            await faturamento.FaturarAsync(v2.PedidoId, v2.Total.Valor);\n            break;\n        default: // tipo que este consumidor não conhece: não adivinha\n            logger.LogWarning(\"Tipo {Tipo} desconhecido\", ea.BasicProperties.Type);\n            await canal.BasicRejectAsync(ea.DeliveryTag, requeue: false); // vai para a DLQ\n            return;\n    }\n    await canal.BasicAckAsync(ea.DeliveryTag, multiple: false);\n};",
                    },
                    {
                        type: "text",
                        value: "## De quem é o contrato\n\nNo caso de eventos, o contrato é do produtor, e ele precisa estar escrito em algum lugar além do código: JSON Schema, AsyncAPI (o equivalente do OpenAPI para mensageria) ou um documento versionado junto com o serviço. Muita gente publica um pacote NuGet com as classes das mensagens para todos os serviços usarem. Parece economia, mas amarra o deploy de todo mundo à versão do pacote e incentiva o consumidor a depender de campos que não usa. Melhor cada consumidor declarar a própria leitura, com um teste que lê exemplos reais das mensagens.",
                    },
                    {
                        type: "quote",
                        value: "Mensagem velha e consumidor velho convivem com o novo por mais tempo do que parece: o contrato evolui acrescentando campo opcional, e o consumidor ignora o que não conhece e confere o que usa. Quando a quebra é inevitável, ela vira um tipo novo, publicado em paralelo até o antigo sair de cena.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual destas mudanças no evento `pedido.criado` é compatível com os consumidores que já existem?",
                        difficulty: "facil",
                        options: [
                            { text: "Acrescentar o campo opcional cupom, sem mexer nos demais", isCorrect: true },
                            { text: "Remover o campo clienteId, que quase ninguém usa", isCorrect: false },
                            { text: "Passar o campo total de reais para centavos, mesmo nome", isCorrect: false },
                            { text: "Renomear o campo total para valorTotal, que é mais claro", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que caracteriza um consumidor tolerante?",
                        difficulty: "facil",
                        options: [
                            { text: "Rejeita a mensagem que traz campo que ele não conhece", isCorrect: false },
                            { text: "Lê só os campos que usa e ignora os que ele não conhece", isCorrect: true },
                            { text: "Converte a mensagem para a versão mais nova do contrato", isCorrect: false },
                            { text: "Aceita qualquer mensagem e corrige os campos inválidos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O consumidor de marketing passou a ler o campo novo `cupom` com `JsonSerializer.Deserialize<PedidoCriado>`, do System.Text.Json, nesta classe:\n\n```csharp\npublic class PedidoCriado\n{\n    public Guid PedidoId { get; init; }\n    public required string Cupom { get; init; }\n}\n```\n\nNa fila ainda há mensagens publicadas antes de o produtor mandar `cupom`. O que acontece com elas?",
                        difficulty: "medio",
                        options: [
                            { text: "A leitura ignora as mensagens antigas e o consumidor dá ack sem chamar o handler", isCorrect: false },
                            { text: "A leitura preenche Cupom com null, porque o required só vale para o compilador do C#", isCorrect: false },
                            { text: "A leitura preenche Cupom com string vazia, porque string sem ? não aceita valor nulo", isCorrect: false },
                            { text: "A leitura lança JsonException por falta do campo obrigatório, e elas viram venenosas", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O produtor precisa renomear o campo `total` para `valorTotal`. Qual caminho não quebra os consumidores?",
                        difficulty: "medio",
                        options: [
                            { text: "Trocar o nome depois de esvaziar as filas, para não sobrar mensagem antiga", isCorrect: false },
                            { text: "Trocar o nome no produtor e nos consumidores no mesmo deploy coordenado", isCorrect: false },
                            { text: "Trocar o nome e configurar os consumidores para ignorar campo desconhecido", isCorrect: false },
                            { text: "Publicar os dois campos, migrar os consumidores e só então remover o total", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Durante a migração para a v2, o produtor publica cada pedido duas vezes, com as routing keys `pedido.criado.v1` e `pedido.criado.v2`, cada publicação com o seu `MessageId`. A fila do faturamento tem binding `pedido.criado.*` e deduplica por `MessageId` numa inbox. O que acontece?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cada pedido é faturado uma vez, porque a inbox percebe que v1 e v2 são o mesmo evento", isCorrect: false },
                            { text: "Nenhum pedido é faturado, porque o curinga * não casa com o sufixo de versão da chave", isCorrect: false },
                            { text: "Cada pedido é faturado duas vezes, porque a v1 e a v2 chegam com MessageId diferentes", isCorrect: true },
                            { text: "Cada pedido é faturado uma vez, porque o topic exchange entrega só a versão mais nova", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Bibliotecas de mensageria no .NET",
                blocks: [
                    {
                        type: "text",
                        value: "# Bibliotecas de mensageria no .NET\n\nSome o que foi escrito em volta do `RabbitMQ.Client` ao longo deste estudo: conexão longa e canais, serialização, declaração de exchanges e filas, retry com espera, dead letter, inbox, outbox com publicador, request/reply com timeout, máquina de estados de saga. Cada peça é pequena; juntas, viram um framework caseiro que alguém precisa manter.\n\nÉ esse encanamento que as bibliotecas de mensageria do .NET entregam pronto. Elas **não substituem** o cliente oficial: em outubro de 2026, MassTransit, Wolverine e Rebus usam o `RabbitMQ.Client` 7.x por baixo. O que acrescentam é convenção e infraestrutura.",
                    },
                    {
                        type: "table",
                        value: "[[\"Problema\", \"Com o cliente puro\", \"Com uma biblioteca\"], [\"Topologia\", \"Você declara exchanges, filas e bindings\", \"Criada por convenção a partir dos tipos de mensagem\"], [\"Serialização e despacho\", \"Você escolhe o formato e despacha pelo Type\", \"Formato padrão e despacho automático para o handler\"], [\"Retry e erro\", \"Você monta atraso, limite e DLQ\", \"Política configurável, com fila de erro\"], [\"Outbox e inbox\", \"Você escreve tabela, publicador e deduplicação\", \"Integradas ao banco (o suporte varia por biblioteca e banco)\"], [\"Sagas\", \"Você persiste estado e trata concorrência\", \"Estado persistido, correlação e concorrência prontos\"], [\"Testes\", \"Broker em contêiner ou dublês feitos à mão\", \"Transporte em memória e apoio a testes\"], [\"Trocar de broker\", \"Reescrever a camada de transporte\", \"Trocar a configuração do transporte\"]]",
                    },
                    {
                        type: "text",
                        value: "## As três mais usadas\n\n- **MassTransit**: a mais adotada no .NET, com sagas em máquina de estados, outbox, request/response e suporte a vários brokers. A versão 9 (primeiro trimestre de 2026) tem **licença comercial**, vendida pela Massient, a empresa que hoje mantém o projeto. A linha 8.x continua sob Apache 2.0, porque a licença de uma versão publicada não muda para trás, e recebeu versões 8.5.x ao longo de 2026 (a 8.5.11 em setembro). O fornecedor não publicou data oficial para o fim das correções da 8.x.\n- **Wolverine**: mantida pela JasperFx, junta mediator (despacho de comandos dentro do processo) e mensageria. Tem outbox e inbox transacionais integradas ao EF Core e ao Marten, sagas e transporte para RabbitMQ. Licença MIT; a empresa vende suporte à parte.\n- **Rebus**: enxuta e direta, com handlers, sagas, retentativas com fila de erro e transporte para RabbitMQ. Licença MIT, com suporte pago opcional (Rebus Pro). Em 2026, o outbox dela está documentado para SQL Server: confira se o seu banco tem suporte antes de contar com ele.\n\nBrighter (MIT) e NServiceBus (comercial) completam o quadro. Nenhuma delas muda o que você aprendeu sobre o broker: por baixo continuam as mesmas exchanges, filas, acks e DLQs.",
                    },
                    {
                        type: "table",
                        value: "[[\"Biblioteca\", \"Licença em outubro de 2026\", \"Transporte RabbitMQ\"], [\"MassTransit 9\", \"Comercial\", \"Sim\"], [\"MassTransit 8.x\", \"Apache 2.0, sem data oficial para o fim das correções\", \"Sim\"], [\"Wolverine\", \"MIT, com suporte pago à parte\", \"Sim\"], [\"Rebus\", \"MIT, com suporte pago à parte (Rebus Pro)\", \"Sim\"], [\"Brighter\", \"MIT\", \"Sim\"], [\"NServiceBus\", \"Comercial\", \"Sim\"]]",
                    },
                    {
                        type: "text",
                        value: "## A licença também é requisito técnico\n\nA mudança do MassTransit não foi caso isolado: nas versões novas, MediatR, AutoMapper e FluentAssertions também passaram a ter licença comercial (as duas primeiras com edição gratuita para empresas pequenas). Biblioteca de infraestrutura entra fundo no código, e sair dela depois custa caro. Antes de adotar, olhe:\n\n- **A licença da versão exata** que você vai usar, não a do projeto em geral: a 8.x e a 9 do MassTransit têm licenças diferentes.\n- **Quem paga a manutenção**: um voluntário, uma empresa que vende suporte ou uma empresa que vende licença. Cada modelo traz um risco diferente.\n- **Quanto do seu código depende dela**: handlers como classes simples e contratos como records seus facilitam uma troca futura; tipos e atributos da biblioteca espalhados pelo domínio dificultam.\n\nQuem roda MassTransit 8.x em outubro de 2026 está numa linha livre, que ainda recebe versões, mas sem data publicada para o fim das correções. O critério é não esperar a primeira falha sem correção: acompanhar os avisos de segurança e decidir com antecedência entre licenciar a 9, migrar para uma alternativa livre (ou para o cliente puro) e aceitar o risco de forma consciente. Enquanto decide, garanta que nenhuma atualização automática leve o projeto para a 9 sem ninguém perceber.",
                    },
                    {
                        type: "code",
                        value: "# terminal: em que versão o projeto está e o que \"atualizar tudo\" faria\n# (o .NET 10 trouxe dotnet package list, que convive com o antigo dotnet list package)\ndotnet package list --outdated\n#   Pacote de Nível Superior    Solicitado   Resolvido   Mais Recente\n#   > MassTransit.RabbitMQ      8.5.11       8.5.11      9.2.3\n\n# só o que há de novo dentro da mesma major\ndotnet package list --outdated --highest-minor",
                    },
                    {
                        type: "code",
                        value: "# .github/dependabot.yml: correções da 8.x, nunca o salto para a 9\nversion: 2\nupdates:\n  - package-ecosystem: \"nuget\"\n    directory: \"/\"\n    schedule:\n      interval: \"weekly\"\n    ignore:\n      - dependency-name: \"MassTransit*\"\n        update-types: [\"version-update:semver-major\"]",
                    },
                    {
                        type: "text",
                        value: "## Quando o cliente puro basta\n\nO cliente puro é a escolha certa mais vezes do que parece:\n\n- **Poucas filas e poucos tipos de mensagem**, com consumidores simples.\n- **Interoperabilidade**: um serviço em Python ou Go consome as mesmas filas, e as convenções da biblioteca (nomes de exchange, formato do corpo, cabeçalhos) virariam um contrato que o outro lado teria de imitar.\n- **Controle da topologia**: argumentos de quorum queue, delayed retry do 4.3, single active consumer, tudo declarado do jeito que o time decidiu.\n- **Time que conhece o broker**: o código deste módulo cabe em poucas centenas de linhas e não esconde nada.\n\nA biblioteca se paga com dezenas de tipos de mensagem, sagas com prazo e compensação, outbox e inbox em vários serviços, ou quando o time precisa produzir antes de dominar o broker. Dois erros comuns, em direções opostas: adotar uma biblioteca para \"não precisar aprender RabbitMQ\" (quando algo quebrar em produção, você vai depurar as filas, os bindings e as DLQs que ela criou) e reescrever, peça por peça, uma biblioteca inteira dentro de casa sem perceber.",
                    },
                    {
                        type: "quote",
                        value: "MassTransit, Wolverine e Rebus resolvem o encanamento em volta do cliente oficial (topologia, retry, outbox, sagas), e a licença da versão exata faz parte da escolha. Com poucas filas, interoperabilidade ou necessidade de controle fino, o cliente puro continua sendo a resposta mais simples.",
                    },
                ],
                questions: [
                    {
                        statement: "O que MassTransit, Wolverine e Rebus acrescentam por cima do `RabbitMQ.Client`?",
                        difficulty: "facil",
                        options: [
                            { text: "Um protocolo próprio que substitui o AMQP na conversa com o broker", isCorrect: false },
                            { text: "Entrega exatamente uma vez, o que dispensa a idempotência no consumidor", isCorrect: false },
                            { text: "Topologia por convenção, retry com fila de erro, outbox e sagas prontos", isCorrect: true },
                            { text: "Um broker embutido que dispensa o servidor RabbitMQ em produção", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a situação de licença do MassTransit em outubro de 2026?",
                        difficulty: "facil",
                        options: [
                            { text: "As duas linhas são comerciais, com edição gratuita só para projetos sem fins lucrativos", isCorrect: false },
                            { text: "A 9 segue Apache 2.0; a 8.x passou a exigir licença comercial para uso em produção", isCorrect: false },
                            { text: "A 9 tem licença comercial; a 8.x continua sob Apache 2.0, que não muda para trás", isCorrect: true },
                            { text: "As duas linhas passaram para a licença MIT depois que o projeto trocou de mantenedor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em qual cenário o `RabbitMQ.Client` puro tende a ser a melhor escolha?",
                        difficulty: "medio",
                        options: [
                            { text: "Um sistema que precisa trocar o RabbitMQ pelo Azure Service Bus no ano que vem", isCorrect: false },
                            { text: "Um fluxo de pedido com compensações e estado persistido passando por vários serviços", isCorrect: false },
                            { text: "Trinta tipos de mensagem, sagas com prazo e outbox em cinco serviços de um time pequeno", isCorrect: false },
                            { text: "Duas filas, consumidas também por um serviço em Python, com formato definido pelo time", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um time roda MassTransit 8.5 em produção em outubro de 2026, e o fornecedor não publicou data oficial para o fim das correções da linha 8.x. Qual é a postura responsável?",
                        difficulty: "medio",
                        options: [
                            { text: "Não fazer nada, porque a Apache 2.0 obriga o mantenedor a corrigir a 8.x enquanto houver uso", isCorrect: false },
                            { text: "Acompanhar os avisos de segurança e decidir cedo: licenciar a 9, migrar ou aceitar o risco", isCorrect: true },
                            { text: "Trocar de biblioteca às pressas, porque a licença da 8.x foi revogada com a chegada da 9", isCorrect: false },
                            { text: "Deixar o Dependabot subir para a 9, já que a Apache 2.0 vale para todas as versões", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O time quer que o Dependabot continue propondo as correções da linha 8.x do MassTransit, mas nunca o salto para a 9. Qual trecho do `dependabot.yml` faz isso?",
                        difficulty: "dificil",
                        options: [
                            { text: "```yaml\nignore:\n  - dependency-name: \"MassTransit*\"\n    update-types: [\"version-update:semver-patch\"]\n```", isCorrect: false },
                            { text: "```yaml\nignore:\n  - dependency-name: \"MassTransit*\"\n    update-types: [\"version-update:semver-minor\"]\n```", isCorrect: false },
                            { text: "```yaml\nignore:\n  - dependency-name: \"MassTransit*\"\n```", isCorrect: false },
                            { text: "```yaml\nignore:\n  - dependency-name: \"MassTransit*\"\n    update-types: [\"version-update:semver-major\"]\n```", isCorrect: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Operação em produção",
        aulas: [
            {
                titulo: "Monitoramento: o que olhar numa fila",
                blocks: [
                    {
                        type: "text",
                        value: "# Monitoramento: o que olhar numa fila\n\nSexta-feira, seis da tarde. A API de pedidos responde 202 em 30 milissegundos, os painéis de HTTP estão verdes, e mesmo assim o suporte avisa que nenhuma nota fiscal saiu desde as três. O worker de faturamento caiu num deploy, e desde então 40 mil pedidos esperam numa fila que ninguém olhava.\n\nMensageria desacopla quem publica de quem consome, e isso vale para os sintomas também: a lentidão do consumidor não vira erro em lugar nenhum, vira **acúmulo**. A API continua feliz, o broker continua de pé, e a fila cresce em silêncio até alguém perceber pelo pior caminho (o cliente reclamando ou o disco do broker enchendo).\n\n## Os quatro sinais de uma fila\n\n- **Mensagens prontas** (ready): esperando um consumidor. É o tamanho real da fila.\n- **Mensagens sem ack** (unacked): já entregues a um consumidor e ainda sem confirmação. Ficam presas a ele até o ack, o nack ou a queda do canal.\n- **Consumidores**: quantos consumidores estão registrados na fila neste momento.\n- **Taxa de entrada x taxa de saída**: quantas mensagens por segundo chegam e quantas são confirmadas. Fila saudável não é fila vazia: é fila em que a saída acompanha a entrada.\n\nAlém desses, o broker tem os seus: os **alarmes de recurso** (memória e disco), que fazem o RabbitMQ parar de aceitar publicações.",
                    },
                    {
                        type: "table",
                        value: "[[\"Sinal\",\"Métrica (endpoint detalhado)\",\"O que significa\",\"Quando preocupa\"],[\"Prontas\",\"`rabbitmq_detailed_queue_messages_ready`\",\"Trabalho acumulado esperando consumidor\",\"Cresce sem parar ou demora demais para zerar\"],[\"Sem ack\",\"`rabbitmq_detailed_queue_messages_unacked`\",\"Trabalho em andamento nos consumidores\",\"Colado no teto (prefetch vezes consumidores) por muito tempo\"],[\"Consumidores\",\"`rabbitmq_detailed_queue_consumers`\",\"Quem está ouvindo a fila\",\"Zero com mensagens prontas\"],[\"Entrada\",\"`rabbitmq_detailed_queue_exchange_messages_published_total`\",\"Mensagens roteadas para a fila (contador)\",\"Maior que a saída por muito tempo\"],[\"Saída\",\"`rabbitmq_detailed_queue_messages_acked_total`\",\"Mensagens confirmadas pelos consumidores (contador)\",\"Cai a zero com a fila cheia\"],[\"Reentregas\",\"`rabbitmq_detailed_queue_messages_redelivered_total`\",\"Mensagens entregues de novo depois de nack ou queda\",\"Sobe junto com erro no consumidor\"],[\"Alarmes\",\"`rabbitmq_alarms_memory_used_watermark` e `rabbitmq_alarms_free_disk_space_watermark`\",\"Broker bloqueando quem publica\",\"Qualquer valor 1\"]]",
                    },
                    {
                        type: "text",
                        value: "## O plugin rabbitmq_prometheus\n\nO RabbitMQ expõe as métricas no formato do Prometheus pelo plugin `rabbitmq_prometheus`, na porta **15692** de cada nó. Na imagem oficial `rabbitmq:4.3-management` ele já vem habilitado; numa instalação por pacote, liga com `rabbitmq-plugins enable rabbitmq_prometheus`. Cada nó responde pelo que hospeda, então colete de **todos os nós** do cluster.\n\nSão três caminhos, e a escolha importa:\n\n- `/metrics`: **agregado**. Soma as filas do nó num número só. Ótimo para a visão geral do broker (conexões, alarmes, taxas globais), inútil para saber qual fila parou.\n- `/metrics/per-object`: uma série por objeto (fila, conexão, canal). Funciona, mas fica caro com milhares de filas e conexões.\n- `/metrics/detailed`: você pede só as famílias que quer (`queue_coarse_metrics`, `queue_consumer_count`, `queue_delivery_metrics`, `queue_exchange_metrics`), pode filtrar por vhost e por nome de fila, e as métricas saem com o prefixo `rabbitmq_detailed_`. A documentação cita casos em que ele é até 60 vezes mais eficiente que o per-object.\n\nO erro comum: apontar o Prometheus para `/metrics`, montar o alerta em `rabbitmq_queue_messages_ready` e descobrir no incidente que o número é a soma de todas as filas. O alerta não diz qual fila parou, e o limiar que faz sentido para a soma não faz sentido para nenhuma fila específica.",
                    },
                    {
                        type: "code",
                        value: "# terminal: métricas por fila no endpoint detalhado (um nó, fila com consumidor lento)\ncurl -s 'http://localhost:15692/metrics/detailed?family=queue_coarse_metrics&family=queue_consumer_count&family=queue_delivery_metrics' | grep 'queue=\"faturamento\"'\n\nrabbitmq_detailed_queue_messages_ready{vhost=\"/\",queue=\"faturamento\"} 636\nrabbitmq_detailed_queue_messages_unacked{vhost=\"/\",queue=\"faturamento\"} 10\nrabbitmq_detailed_queue_messages{vhost=\"/\",queue=\"faturamento\"} 646\nrabbitmq_detailed_queue_consumers{vhost=\"/\",queue=\"faturamento\"} 1\nrabbitmq_detailed_queue_messages_delivered_ack_total{vhost=\"/\",queue=\"faturamento\"} 596\nrabbitmq_detailed_queue_messages_redelivered_total{vhost=\"/\",queue=\"faturamento\"} 0\nrabbitmq_detailed_queue_messages_acked_total{vhost=\"/\",queue=\"faturamento\"} 586\n\n# no endpoint padrão, o mesmo número vem somado, sem dizer de qual fila é\ncurl -s http://localhost:15692/metrics | grep '^rabbitmq_queue_messages_ready'\n\nrabbitmq_queue_messages_ready 636",
                    },
                    {
                        type: "text",
                        value: "## Lendo os números juntos\n\nA saída acima é de uma fila com um consumidor de prefetch 10 que processa umas 20 mensagens por segundo, enquanto chegam 45. Os números contam a história sozinhos:\n\n- **Sem ack cravado em 10**: é o prefetch vezes o número de consumidores. O consumidor está sempre com a mão cheia, trabalhando no limite.\n- **Prontas em 636 e subindo**: a saída não acompanha a entrada.\n\nA correção é aumentar a **vazão de processamento**: mais consumidores concorrentes ou um handler mais rápido. Muita gente sobe o prefetch para 1000 achando que acelera, e só tira as mensagens da coluna de prontas e põe na de sem ack, presas a um consumidor que segue no mesmo ritmo (e que, se cair, devolve mil mensagens de uma vez para reentrega).\n\nOutros padrões que se reconhecem de longe:\n\n- **Consumidores em zero e prontas subindo**: o consumidor caiu (deploy, credencial trocada, exceção que fechou o canal).\n- **Prontas perto de zero, sem ack alto e parado, saída em zero**: o consumidor está vivo, mas travado segurando mensagens, por exemplo num I/O sem timeout. O consumer timeout (30 minutos por padrão; no 4.3, só em quorum queue) acaba fechando o canal e devolvendo as entregas, mas meia hora é tempo demais para descobrir.\n- **Reentregas subindo**: consumidor dando nack ou caindo no meio do processamento; hora de olhar a dead letter e o `delivery-limit`.\n- **Entrada maior que a saída de dia e fila zerando de madrugada**: pico normal. O que importa é quanto tempo a fila leva para esvaziar no ritmo atual, e é isso que o segundo alerta abaixo mede.",
                    },
                    {
                        type: "code",
                        value: "# prometheus.yml (trecho): a visão geral e as métricas por fila de cada nó\nscrape_configs:\n  - job_name: rabbitmq\n    static_configs:\n      - targets: [\"rabbit-1:15692\", \"rabbit-2:15692\", \"rabbit-3:15692\"]\n\n  - job_name: rabbitmq-filas\n    metrics_path: /metrics/detailed\n    params:\n      family: [queue_coarse_metrics, queue_consumer_count, queue_delivery_metrics, queue_exchange_metrics]\n    static_configs:\n      - targets: [\"rabbit-1:15692\", \"rabbit-2:15692\", \"rabbit-3:15692\"]\n\n# rabbitmq-alertas.yml: alerta no sintoma, não em cada número\ngroups:\n  - name: rabbitmq\n    rules:\n      - alert: FilaSemConsumidor\n        expr: rabbitmq_detailed_queue_consumers == 0 and on (vhost, queue) rabbitmq_detailed_queue_messages_ready > 0\n        for: 5m\n\n      - alert: FilaDemoraParaEsvaziar\n        # prontas divididas pela vazão de ack: segundos para zerar a fila no ritmo atual\n        expr: |\n          sum by (vhost, queue) (rabbitmq_detailed_queue_messages_ready)\n            / sum by (vhost, queue) (rate(rabbitmq_detailed_queue_messages_acked_total[5m]))\n            > 600\n        for: 10m\n\n      - alert: AlarmeDeRecursoNoBroker\n        expr: rabbitmq_alarms_memory_used_watermark == 1 or rabbitmq_alarms_free_disk_space_watermark == 1\n        for: 1m",
                    },
                    {
                        type: "text",
                        value: "## Alarmes, terminal e painel\n\nO broker também adoece. Quando a memória passa de 60% da RAM (`vm_memory_high_watermark.relative = 0.6`, o padrão) ou o disco livre cai abaixo do limite (50 MB por padrão, valor pensado para desenvolvimento), o RabbitMQ **bloqueia as conexões que publicam**, no cluster inteiro, até a situação normalizar. Conexões que só consomem continuam recebendo. Por isso a documentação recomenda conexões separadas para publicar e para consumir: se a mesma conexão faz as duas coisas, o bloqueio segura também os acks, e a fila para de esvaziar justamente quando precisava. No cliente 7.x, o evento `ConnectionBlockedAsync` da conexão avisa a aplicação.\n\nPara uma conferência rápida, o terminal resolve. O painel de gerenciamento, na porta 15672, é ótimo para olhar o agora, mas guarda só dados recentes (horas, não meses) e pesa mais no nó: histórico e alerta ficam com o Prometheus. E dê nome às conexões com `ClientProvidedName`: no painel, \"faturamento-worker\" diz muito mais que um IP e uma porta. Uma taxa alta em `rabbitmq_connections_opened_total` denuncia que alguma aplicação abre uma conexão por mensagem; o nome mostra qual.",
                    },
                    {
                        type: "code",
                        value: "# terminal: conferência rápida, direto num nó\nrabbitmqctl list_queues name type messages_ready messages_unacknowledged consumers\n\nname         type    messages_ready  messages_unacknowledged  consumers\nfaturamento  quorum  763             10                       1\n\nrabbitmq-diagnostics check_alarms\n\nNode rabbit@rabbit-1 reported no alarms, local or clusterwide",
                    },
                    {
                        type: "quote",
                        value: "Fila saudável não é fila vazia: é fila em que a saída acompanha a entrada. Colete o endpoint detalhado de todos os nós, leia prontas, sem ack, consumidores e as duas taxas juntos, e alerte no sintoma: fila sem consumidor, fila que demora para esvaziar e alarme de recurso.",
                    },
                ],
                questions: [
                    {
                        statement: "Sem configuração extra, o que o endpoint `/metrics` do plugin `rabbitmq_prometheus` devolve para `rabbitmq_queue_messages_ready`?",
                        difficulty: "facil",
                        options: [
                            { text: "Um único valor que soma as filas do nó, sem rótulo indicando a fila", isCorrect: true },
                            { text: "Uma série para cada fila, com os rótulos vhost e queue preenchidos", isCorrect: false },
                            { text: "Nada, porque números de fila só aparecem no painel de gerenciamento", isCorrect: false },
                            { text: "Só as filas do vhost padrão, uma série por fila, sem os outros vhosts", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual combinação de sinais indica que o consumidor de uma fila caiu?",
                        difficulty: "facil",
                        options: [
                            { text: "Mensagens prontas e mensagens sem ack, ambas em zero", isCorrect: false },
                            { text: "Saída igual à entrada e consumidores estáveis", isCorrect: false },
                            { text: "Mensagens sem ack altas e prontas perto de zero", isCorrect: false },
                            { text: "Consumidores em zero e mensagens prontas subindo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma fila tem um consumidor com prefetch 10. As métricas mostram sem ack parado em 10, prontas subindo há 20 minutos, entrada de 45 e saída de 20 mensagens por segundo. Qual é a correção mais direta?",
                        difficulty: "medio",
                        options: [
                            { text: "Ligar o autoAck para não gastar tempo com confirmações", isCorrect: false },
                            { text: "Adicionar consumidores concorrentes para aumentar a vazão", isCorrect: true },
                            { text: "Subir o prefetch para 1000 para o consumidor puxar mais", isCorrect: false },
                            { text: "Trocar para quorum queue, que divide a carga entre os nós", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a documentação do RabbitMQ recomenda que publicadores e consumidores usem conexões separadas, mesmo dentro da mesma aplicação?",
                        difficulty: "medio",
                        options: [
                            { text: "No cliente 7.x, uma mesma conexão não consegue publicar e consumir mensagens ao mesmo tempo", isCorrect: false },
                            { text: "Num alarme, o broker bloqueia a conexão que publica, e o consumidor nela para junto", isCorrect: true },
                            { text: "O heartbeat de uma conexão que publica é mais curto e derrubaria o consumidor", isCorrect: false },
                            { text: "O prefetch é contado por conexão, e o publicador gastaria o limite do consumidor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Considere a regra `sum by (vhost, queue) (rabbitmq_detailed_queue_messages_ready) / sum by (vhost, queue) (rate(rabbitmq_detailed_queue_messages_acked_total[5m])) > 600`. Qual situação ela pega e um limite fixo como `messages_ready > 10000` deixaria passar?",
                        difficulty: "dificil",
                        options: [
                            { text: "Fila vazia e sem consumidor, porque a divisão por zero dispara a regra", isCorrect: false },
                            { text: "Fila com 300 prontas que recebe 45 e confirma 45 por segundo", isCorrect: false },
                            { text: "Fila de muito volume com 50 mil prontas e 500 confirmações por segundo", isCorrect: false },
                            { text: "Fila de pouco volume com 800 prontas e uma confirmação por segundo", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Rastreando a mensagem através da fila",
                blocks: [
                    {
                        type: "text",
                        value: "# Rastreando a mensagem através da fila\n\nO cliente reclama que o pedido 8812 levou seis minutos para ser faturado. No trace da API, o `POST /pedidos` levou 40 milissegundos e terminou em 202. No worker de faturamento, cada mensagem leva 300 milissegundos. Os dois serviços juram que estão rápidos, e os seis minutos sumiram exatamente no lugar que nenhum deles mede: **a fila**.\n\nEsta aula resolve duas coisas:\n\n1. **O trace atravessar a fila**: o span do consumidor continuar o trace do publicador, com o mesmo trace id dos dois lados, para a investigação começar no POST e chegar até o processamento.\n2. **O tempo de espera virar métrica**: trace é amostrado e se lê um por um; para alertar e ver tendência, a espera precisa ser um histograma.\n\nFica aqui só o necessário para o trace atravessar a fila. Coletor, backend de traces e painéis são assunto do estudo de observabilidade.",
                    },
                    {
                        type: "text",
                        value: "## Como o contexto atravessa o broker\n\nO padrão é o **W3C Trace Context**: o header `traceparent` leva o trace id e o span id do pai. Em HTTP ele vai no header da requisição; numa mensagem AMQP ele vai nos **headers da mensagem** (`BasicProperties.Headers`). O publicador grava, o consumidor lê e abre o próprio span como filho. O broker não participa: para o RabbitMQ, é só mais um header.\n\nO cliente 7.x já faz esse trabalho por conta própria. Ele tem duas `ActivitySource`, `RabbitMQ.Client.Publisher` e `RabbitMQ.Client.Subscriber`, e, quando alguém escuta essas fontes, o 7.2 faz assim:\n\n- o `BasicPublishAsync` abre um span `publish <routing key>` (kind Producer), filho do que estiver ativo (o span do POST, por exemplo), e grava o `traceparent` nos headers;\n- do lado do consumidor, o cliente abre `deliver <routing key>` (kind Consumer) **em volta do seu handler** `ReceivedAsync`, com o span do publish como pai (e também como link). Como o span envolve o handler, tudo o que você faz lá dentro (SQL, HTTP) vira filho dele.\n\nEsse detalhe mudou dentro da própria série 7: no 7.0 e no 7.1, o span do consumidor nascia num trace novo, ligado ao publish só por link, e os nomes dos spans também eram outros. Se o seu backend mostra o consumidor como um trace separado, confira a versão do cliente antes de procurar defeito na configuração.",
                    },
                    {
                        type: "code",
                        value: "# header gravado pelo publicador (saída real, cliente 7.2.2)\ntraceparent: 00-d9c2c5db82bd8ba736be67bb99c60242-3e4842754427f192-01\n\n# 00                                 versão do formato\n# d9c2c5db82bd8ba736be67bb99c60242   trace id: o mesmo na API e no worker\n# 3e4842754427f192                   span id do \"publish\": vira o pai do \"deliver\"\n# 01                                 flags: este trace foi amostrado",
                    },
                    {
                        type: "text",
                        value: "## O pacote RabbitMQ.Client.OpenTelemetry\n\nPara ligar isso ao OpenTelemetry, o pacote oficial é o `RabbitMQ.Client.OpenTelemetry`, com a extensão `AddRabbitMQInstrumentation()` (no namespace `OpenTelemetry.Trace`). Ela registra as fontes `RabbitMQ.Client.*` e passa a gravar e ler os headers com o propagador do OpenTelemetry (`traceparent` e baggage).\n\nUm fato que muda com o tempo, então vai com data: **em outubro de 2026, a versão publicada é a 1.0.0-rc.2**, de novembro de 2025, uma release candidate. Ela instala com `--prerelease`, declara dependência do `RabbitMQ.Client` 7.2.0 ou mais novo e do `OpenTelemetry.Api` 1.9 ou mais novo, e foi compilada e executada para esta aula com o cliente 7.2.2 e o OpenTelemetry 1.20.1: o trace atravessou a fila.\n\nSe a política da empresa proíbe pacote prerelease em produção, registrar só `AddSource(\"RabbitMQ.Client.*\")` também faz o trace atravessar no 7.2.2, porque o próprio cliente grava o `traceparent` com o propagador padrão do .NET; você perde apenas os ajustes do pacote. O critério vale para qualquer instrumentação: confira a versão e o estado (estável ou não) antes de pôr no caminho crítico.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs da API de pedidos\n// dotnet add package OpenTelemetry.Extensions.Hosting\n// dotnet add package OpenTelemetry.Instrumentation.AspNetCore\n// dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol\n// dotnet add package RabbitMQ.Client.OpenTelemetry --prerelease\nusing OpenTelemetry.Resources;\nusing OpenTelemetry.Trace;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"pedidos-api\"))\n    .WithTracing(t => t\n        .AddAspNetCoreInstrumentation()\n        .AddRabbitMQInstrumentation()   // fontes RabbitMQ.Client.* e propagação pelos headers\n        .AddOtlpExporter());\n\n// O publicador não muda por causa do trace: o span e o header saem do próprio cliente.\nbuilder.Services.AddSingleton<PublicadorDePedidos>();\n\nvar app = builder.Build();\n\napp.MapPost(\"/pedidos\", async (Pedido pedido, PublicadorDePedidos publicador, CancellationToken ct) =>\n{\n    // Dentro do span do POST, o BasicPublishAsync abre \"publish pedido.criado\" como filho.\n    await publicador.PublicarAsync(pedido, ct);\n    return TypedResults.Accepted($\"/pedidos/{pedido.Id}\");\n});\n\napp.Run();",
                    },
                    {
                        type: "table",
                        value: "[[\"Onde\",\"Span\",\"Kind\",\"Pai\"],[\"API\",\"`POST /pedidos`\",\"Server\",\"Nenhum (raiz do trace)\"],[\"API\",\"`publish pedido.criado`\",\"Producer\",\"`POST /pedidos`\"],[\"Worker\",\"`deliver pedido.criado`\",\"Consumer\",\"`publish pedido.criado` (também como link)\"],[\"Worker\",\"SQL e HTTP feitos dentro do handler\",\"Client\",\"`deliver pedido.criado`\"]]",
                    },
                    {
                        type: "text",
                        value: "## O tempo na fila como métrica\n\nNo trace, a espera aparece como o vão entre o fim do `publish` e o começo do `deliver`. Serve para investigar um pedido, mas não para alertar: o trace é amostrado e se lê um por um. Para responder \"quanto as mensagens esperam nesta fila, no p95?\", a espera precisa virar um **histograma**.\n\nA receita: o publicador carimba a hora de saída num header, e o consumidor, ao receber, registra a diferença. Três cuidados separam a métrica útil da enganosa:\n\n- **Resolução**: muita gente usa a propriedade `Timestamp` do AMQP e descobre que ela guarda segundos inteiros (Unix time), o que apaga tudo abaixo de um segundo. Use milissegundos num header próprio.\n- **Relógios**: publicador e consumidor rodam em máquinas diferentes, e a diferença entre os relógios entra na conta. NTP mantém isso na casa dos milissegundos; valor negativo vira zero. Se você controla o broker, o RabbitMQ 4.3 pode carimbar a entrada com o relógio dele (`message_interceptors.incoming.set_header_timestamp.overwrite = true` no `rabbitmq.conf`, header `timestamp_in_ms`), mas broker gerenciado nem sempre deixa ligar isso.\n- **Baldes**: sem limites explícitos, um instrumento próprio recebe do SDK do OpenTelemetry baldes pensados para milissegundos (0, 5, 10, 25...). Com a unidade em segundos, toda espera abaixo de 5 segundos cai no mesmo balde, e o p95 vira chute. O `InstrumentAdvice` resolve.\n\nE um limite que não tem conserto: o consumidor só mede o que processa. Se ele para, o histograma fica em silêncio exatamente quando a espera explode. A métrica de espera **complementa** os sinais da fila vistos na aula anterior (prontas e consumidores), não os substitui.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs do worker de faturamento (dotnet new worker) e a classe EsperaNaFila\nusing System.Diagnostics.Metrics;\nusing OpenTelemetry.Metrics;\nusing OpenTelemetry.Resources;\nusing OpenTelemetry.Trace;\nusing RabbitMQ.Client;\n\nvar builder = Host.CreateApplicationBuilder(args);\n\nbuilder.Services.AddOpenTelemetry()\n    .ConfigureResource(r => r.AddService(\"faturamento-worker\"))\n    .WithTracing(t => t.AddRabbitMQInstrumentation().AddOtlpExporter())\n    .WithMetrics(m => m.AddMeter(EsperaNaFila.NomeDoMedidor).AddOtlpExporter());\n\n// O consumidor chama EsperaNaFila.Registrar na primeira linha do ReceivedAsync.\nbuilder.Services.AddHostedService<ConsumidorDeFaturamento>();\n\nbuilder.Build().Run();\n\npublic static class EsperaNaFila\n{\n    public const string NomeDoMedidor = \"Faturamento.Mensageria\";\n    private const string Header = \"publicado-em-ms\";\n\n    private static readonly Meter Medidor = new(NomeDoMedidor);\n\n    // Sem limites explícitos, o SDK usa baldes pensados para milissegundos\n    // (0, 5, 10, 25...), e toda espera abaixo de 5 segundos cai no mesmo balde.\n    private static readonly Histogram<double> Espera = Medidor.CreateHistogram<double>(\n        \"mensageria.fila.espera\",\n        unit: \"s\",\n        description: \"Tempo entre a publicação e o início do processamento\",\n        advice: new InstrumentAdvice<double>\n        {\n            HistogramBucketBoundaries = [0.05, 0.1, 0.5, 1, 5, 30, 60, 300, 900]\n        });\n\n    // No publicador, antes do BasicPublishAsync.\n    public static void Carimbar(BasicProperties props)\n    {\n        props.Headers ??= new Dictionary<string, object?>();\n        props.Headers[Header] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();\n    }\n\n    // No consumidor, antes de processar.\n    public static void Registrar(IReadOnlyBasicProperties props, string fila)\n    {\n        if (props.Headers?.TryGetValue(Header, out var valor) == true && valor is long ms)\n        {\n            var segundos = (DateTimeOffset.UtcNow - DateTimeOffset.FromUnixTimeMilliseconds(ms)).TotalSeconds;\n            // Relógios de máquinas diferentes podem dar valor negativo: zero é o piso honesto.\n            Espera.Record(Math.Max(segundos, 0), new KeyValuePair<string, object?>(\"fila\", fila));\n        }\n    }\n}",
                    },
                    {
                        type: "quote",
                        value: "O contexto do trace viaja no header `traceparent` da mensagem: o cliente 7.2 abre o span `publish` ao publicar e o `deliver` em volta do handler, no mesmo trace, e o `AddRabbitMQInstrumentation()` liga isso ao OpenTelemetry. A espera na fila vira histograma com carimbo em milissegundos e baldes em segundos, sempre ao lado das métricas da fila, porque consumidor parado não mede nada.",
                    },
                ],
                questions: [
                    {
                        statement: "Numa mensagem AMQP 0.9.1 publicada com o trace ligado, por onde o contexto do trace chega ao consumidor?",
                        difficulty: "facil",
                        options: [
                            { text: "Pelo `CorrelationId`, que o cliente preenche com o trace id ao publicar", isCorrect: false },
                            { text: "Pelo header `traceparent`, gravado pelo cliente nos headers da mensagem", isCorrect: true },
                            { text: "Pela routing key, que ganha o trace id como sufixo ao publicar", isCorrect: false },
                            { text: "Pelo broker, que cria um span de fila e o repassa ao consumidor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com o trace ligado no consumidor (cliente 7.2), qual span está ativo enquanto o seu handler `ReceivedAsync` executa?",
                        difficulty: "facil",
                        options: [
                            { text: "O `publish <routing key>`, kind Producer, reaberto do lado do consumidor", isCorrect: false },
                            { text: "O `POST /pedidos` da API, que fica aberto até o ack chegar", isCorrect: false },
                            { text: "Nenhum: o handler roda fora de span e precisa abrir o próprio", isCorrect: false },
                            { text: "O `deliver <routing key>`, kind Consumer, filho do span de publish", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Para medir a espera na fila, a equipe usou a propriedade `Timestamp` do AMQP, preenchida pelo publicador. Quase todas as medições saem 0 ou 1 segundo, embora a espera real varie de 50 a 900 milissegundos. Qual é a causa?",
                        difficulty: "medio",
                        options: [
                            { text: "Publicador e consumidor estão configurados em fusos horários diferentes", isCorrect: false },
                            { text: "O cliente 7.x arredonda todo header numérico para segundos", isCorrect: false },
                            { text: "O `Timestamp` só é gravado em mensagens marcadas persistentes", isCorrect: false },
                            { text: "O `Timestamp` do AMQP guarda o Unix time em segundos inteiros", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O worker de faturamento registra a espera na fila num histograma a cada mensagem processada. Por que essa métrica, sozinha, não serve para alertar que a fila parou?",
                        difficulty: "medio",
                        options: [
                            { text: "Com o consumidor parado, nada é registrado e o histograma fica em silêncio", isCorrect: true },
                            { text: "Histograma não entra em regra de alerta, só contador e gauge entram", isCorrect: false },
                            { text: "A espera é calculada no publicador, que não sabe quando a fila parou", isCorrect: false },
                            { text: "O histograma só mede as mensagens com trace amostrado, e a maioria se perde", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um histograma com unidade `s` foi criado com `CreateHistogram<double>` sem `InstrumentAdvice`, e o OpenTelemetry .NET o exporta com a agregação padrão. As esperas reais ficam entre 0,1 e 3 segundos. Como essas medições aparecem nos baldes?",
                        difficulty: "dificil",
                        options: [
                            { text: "Todas no balde de 0 a 5, porque os limites padrão foram pensados para milissegundos", isCorrect: true },
                            { text: "Cada uma num balde próprio, porque o SDK cria os limites conforme os valores chegam", isCorrect: false },
                            { text: "Espalhadas nos baldes padrão, porque o SDK converte segundos em milissegundos", isCorrect: false },
                            { text: "Descartadas, porque o primeiro balde padrão começa em 1 e ignora valores menores", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Cluster: quorum e a perda de um nó",
                blocks: [
                    {
                        type: "text",
                        value: "# Cluster: quorum e a perda de um nó\n\nUm RabbitMQ de um nó só é um ponto único de falha com disco: se a máquina cai, as filas param; se o disco se perde, as mensagens vão junto. Cluster resolve parte disso, mas não do jeito que muita gente imagina. **Juntar três nós não replica mensagem nenhuma por si só.**\n\nO que todos os nós compartilham são os **metadados**: usuários, vhosts, permissões, exchanges, bindings, policies e a definição das filas. Desde o 4.3, eles vivem no **Khepri**, o único armazenamento de metadados (o Mnesia saiu), que também é replicado por Raft. Já o **conteúdo** das filas depende do tipo:\n\n- **fila clássica**: mora num nó só. É visível e alcançável de qualquer nó, mas, se aquele nó cai, ela para junto (o espelhamento clássico foi removido no 4.0);\n- **quorum queue**: replicada por Raft entre os seus membros;\n- **stream**: também replicado, para o caso de log com releitura.\n\nO cliente pode se conectar a qualquer nó; o nó encaminha as operações ao líder da fila de forma transparente.",
                    },
                    {
                        type: "text",
                        value: "## Quorum: a maioria que decide\n\nCada quorum queue tem um **líder** e **seguidores**. A publicação passa pelo líder, que replica para os seguidores, e o publisher confirm só volta quando a **maioria** dos membros gravou a mensagem: (N/2)+1, com divisão inteira.\n\nOs números padrão do 4.3:\n\n- **3 membros** por quorum queue (`quorum_cluster_size`), nunca dois no mesmo nó. Num cluster de cinco nós, três hospedam um membro da fila e dois não hospedam nada dela. O argumento `x-quorum-initial-group-size` muda isso na declaração.\n- Nó novo no cluster **não ganha réplica sozinho**: é preciso `rabbitmq-queues grow` (ou ligar a reconciliação contínua de membros).\n- A documentação não recomenda quorum queue com mais de 7 membros; o desempenho cai bastante acima de 5.\n\nA conta da maioria explica a regra do **número ímpar**:",
                    },
                    {
                        type: "table",
                        value: "[[\"Nós (ou membros da fila)\",\"Maioria\",\"Falhas toleradas\",\"Comentário\"],[\"1\",\"1\",\"0\",\"Só para desenvolvimento\"],[\"2\",\"2\",\"0\",\"Nenhum ganho sobre um: qualquer queda tira a maioria\"],[\"3\",\"2\",\"1\",\"O mínimo para alta disponibilidade\"],[\"4\",\"3\",\"1\",\"Um nó a mais de custo e nenhuma falha a mais tolerada\"],[\"5\",\"3\",\"2\",\"Tolera duas falhas\"],[\"7\",\"4\",\"3\",\"Teto recomendado de membros por quorum queue\"]]",
                    },
                    {
                        type: "text",
                        value: "## O que acontece ao perder um nó\n\nPara esta aula, um cluster de três nós do 4.3.6, com uma quorum queue de três membros, recebeu publicações com confirms enquanto os nós eram derrubados um a um. O que se viu bate com a documentação:\n\n1. **Cai o nó do líder.** Os seguidores percebem e elegem um novo líder em segundos. O cliente conectado a outro nó mal notou: as confirmações continuaram chegando.\n2. **Quem estava conectado ao nó que caiu perde a conexão.** O cliente 7.x reconecta sozinho (recuperação automática ligada por padrão, nova tentativa a cada 5 segundos) num dos outros nós da lista. No intervalo, `BasicPublishAsync` lança `AlreadyClosedException`, e as mensagens entregues sem ack voltam para a fila e são reentregues com o flag redelivered: duplicata possível, idempotência obrigatória.\n3. **Cai o segundo nó.** Sem maioria, a fila para. No teste não veio nack (a documentação avisa que, em alguns cenários, pode vir): a publicação ficou esperando confirmação até o cliente desistir pelo próprio timeout. Quando a maioria voltou, mensagens cuja espera tinha sido cancelada no cliente **entraram na fila mesmo assim**. Um publicador que tivesse republicado ao cancelar teria gerado duplicata.\n4. **Metadados também precisam de maioria**: sem ela, declarar fila ou criar usuário não avança.\n\nE, se dois dos três nós se perderem de vez (disco junto), a documentação é direta: a fila fica indisponível para sempre e precisa ser apagada à força e recriada. Por isso o dado que não pode sumir mora no banco do serviço (é para isso que existe a outbox), e a fila é caminho, não arquivo.",
                    },
                    {
                        type: "code",
                        value: "# terminal: quem é o líder da fila (colunas resumidas)\nrabbitmq-queues quorum_status pedidos-cluster\n\nrabbit@rabbit1  follower\nrabbit@rabbit2  leader\nrabbit@rabbit3  follower\n\n# depois de derrubar o rabbit2: novo líder eleito em segundos\nrabbit@rabbit1  leader\nrabbit@rabbit2  noconnection\nrabbit@rabbit3  follower\n\n# antes de parar outro nó para manutenção\nrabbitmq-diagnostics check_if_node_is_quorum_critical\n\nqueue 'pedidos-cluster' in vhost '/' will become unavailable if node rabbit@rabbit1 stops\nrabbitmq_metadata will become unavailable if node rabbit@rabbit1 stops",
                    },
                    {
                        type: "text",
                        value: "## Do lado do cliente e na manutenção\n\nO cliente precisa conhecer mais de um nó. Ou ele recebe a lista de nós (o resolvedor padrão do 7.x embaralha a lista a cada tentativa, o que espalha as conexões), ou fala com um balanceador de carga na frente do cluster, que é como os brokers gerenciados costumam expor o serviço. Cliente apontado para um nó só transforma a queda desse nó em queda da aplicação, com cluster e tudo.\n\nNa manutenção, o roteiro é um nó por vez:\n\n- `rabbitmq-diagnostics check_if_node_is_quorum_critical` antes de parar: falha se a parada deixaria alguma quorum queue (ou os metadados) sem maioria;\n- `rabbitmq-upgrade drain` põe o nó em modo de manutenção (ele deixa de atender clientes e de hospedar líderes), e `rabbitmq-upgrade revive` o traz de volta;\n- só passe ao próximo nó quando o que voltou estiver em dia.\n\nDuas notas que envelhecem bem. Primeira: **desde o 4.3 não existe estratégia de partição para escolher**; `pause_minority` e companhia eram da era Mnesia, e as chaves `cluster_partition_handling` são aceitas e ignoradas. Muito guia antigo ainda manda configurar isso. Segunda: cluster foi feito para rede local e funciona bem entre zonas de disponibilidade da mesma região, desde que sejam **três zonas**: com dois data centers, um deles sempre fica com a maioria dos nós, e perder justamente esse derruba o cluster. Para ligar regiões distantes ou links instáveis, use Shovel ou Federation entre clusters independentes.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: um cliente que conhece os três nós do cluster\nusing RabbitMQ.Client;\n\nvar factory = new ConnectionFactory\n{\n    UserName = \"faturamento-worker\",\n    Password = Environment.GetEnvironmentVariable(\"RABBITMQ_SENHA\")\n        ?? throw new InvalidOperationException(\"RABBITMQ_SENHA não definida\"),\n    VirtualHost = \"pedidos\",\n    AutomaticRecoveryEnabled = true,                   // já é o padrão no 7.x; explícito para quem lê\n    NetworkRecoveryInterval = TimeSpan.FromSeconds(5)  // espera entre tentativas de reconexão\n};\n\n// O resolvedor padrão embaralha a lista a cada tentativa: as conexões se espalham\n// pelos nós, e a reconexão tenta outro nó quando o primeiro não responde.\nawait using IConnection conexao = await factory.CreateConnectionAsync(\n    [\"rabbit-1.interno\", \"rabbit-2.interno\", \"rabbit-3.interno\"], \"faturamento-worker\");\n\nconexao.ConnectionShutdownAsync += (_, e) =>\n{\n    Console.WriteLine($\"Conexão caiu: {e.ReplyText}\");\n    return Task.CompletedTask;\n};\n\nconexao.RecoverySucceededAsync += (_, _) =>\n{\n    Console.WriteLine($\"Reconectado em {conexao.Endpoint.HostName}\");\n    return Task.CompletedTask;\n};",
                    },
                    {
                        type: "quote",
                        value: "Cluster replica metadados; mensagem só é replicada em quorum queue (ou stream), que decide por maioria, e por isso três nós toleram uma falha e quatro também. Ao perder um nó, o líder muda em segundos, quem estava nele reconecta em outro nó da lista, e o que estava em voo pode chegar duas vezes: confirms, reconexão e idempotência são o que faz o cluster valer.",
                    },
                ],
                questions: [
                    {
                        statement: "Num cluster de três nós, o que fica replicado em todos os nós sem nenhuma configuração extra?",
                        difficulty: "facil",
                        options: [
                            { text: "Nada: cada nó guarda os próprios usuários, exchanges, bindings e filas", isCorrect: false },
                            { text: "Os metadados: usuários, vhosts, exchanges, bindings e definição das filas", isCorrect: true },
                            { text: "As mensagens das filas clássicas duráveis, mas não as das quorum queues", isCorrect: false },
                            { text: "As mensagens de todas as filas, inclusive as que moram em filas clássicas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que um cluster de quatro nós não tolera mais falhas que um de três?",
                        difficulty: "facil",
                        options: [
                            { text: "O quarto nó fica de reserva e só entra na votação quando outro cai", isCorrect: false },
                            { text: "O Khepri usa só três nós e deixa o quarto apenas com mensagens", isCorrect: false },
                            { text: "Com número par de nós, o RabbitMQ desliga as quorum queues por segurança", isCorrect: false },
                            { text: "A maioria de quatro é três, então ele também só aguenta perder um nó", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma quorum queue de três membros perde o nó onde estava o líder. O publicador está conectado a outro nó e usa publisher confirms. O que ele observa?",
                        difficulty: "medio",
                        options: [
                            { text: "Queda da própria conexão, porque todo cliente reconecta quando o líder muda", isCorrect: false },
                            { text: "Nack em todas as mensagens até o nó antigo voltar e reassumir o posto", isCorrect: false },
                            { text: "Nenhum efeito, porque cada membro aceita escrita direto, sem o líder", isCorrect: false },
                            { text: "Uma pausa curta enquanto o novo líder é eleito, e depois tudo normal", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Antes de parar um nó para atualizar a versão, qual comando diz se essa parada deixaria alguma quorum queue sem maioria?",
                        difficulty: "medio",
                        options: [
                            { text: "`rabbitmq-diagnostics check_if_node_is_quorum_critical`, que falha nesse caso", isCorrect: true },
                            { text: "`rabbitmq-diagnostics check_alarms`, que trata fila sem maioria como alarme", isCorrect: false },
                            { text: "`rabbitmqctl cluster_status`, que recusa a parada se alguma fila ficar sem líder", isCorrect: false },
                            { text: "`rabbitmq-diagnostics check_running`, que só passa se o nó puder parar sem perda", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num cluster de três nós, dois caem ao mesmo tempo. O publicador, ligado ao nó que sobrou, usa confirms, cancela a espera depois de 5 segundos e republica a mensagem quando cancela. Quando os nós voltam, o consumidor recebe algumas mensagens duas vezes. O que explica isso?",
                        difficulty: "dificil",
                        options: [
                            { text: "O cliente 7.x republica sozinho, ao reconectar, o que estava sem confirmação", isCorrect: false },
                            { text: "A quorum queue duplica as mensagens em voo quando elege um líder novo", isCorrect: false },
                            { text: "O nó que sobrou confirmou sozinho, e a maioria que voltou regravou tudo", isCorrect: false },
                            { text: "A mensagem sem confirmação ficou retida e entrou quando a maioria voltou", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Segurança e limites",
                blocks: [
                    {
                        type: "text",
                        value: "# Segurança e limites\n\nEm muita empresa, o RabbitMQ de produção roda com um usuário só, criado no primeiro dia, com permissão `.*` em tudo, e a senha está no `appsettings` de seis serviços. Funciona até o dia em que um serviço com bug apaga a fila de outro, ou em que a senha vaza num repositório e não há como trocá-la sem derrubar todo mundo junto. Do outro lado, o broker sem limite nenhum: uma fila esquecida cresce até encher o disco e parar o cluster inteiro.\n\n## Um usuário por aplicação\n\n- **O `guest` sai.** Por padrão, o RabbitMQ só aceita o `guest` pela interface de loopback, **mas a imagem oficial do Docker** traz `loopback_users.guest = false` em `/etc/rabbitmq/conf.d/10-defaults.conf`: no contêiner, `guest`/`guest` entra de qualquer lugar da rede. Em produção, apague o usuário.\n- **O login anônimo sai.** No 4.x, o mecanismo SASL `ANONYMOUS` vem ligado e autentica o cliente sem credencial como `guest`; a documentação manda removê-lo em produção (a configuração está na última aula).\n- **Cada aplicação tem o seu usuário.** Fica fácil saber de quem é cada conexão, dar a permissão mínima e trocar a senha de um serviço sem mexer nos outros.\n- **Tags** (`administrator`, `monitoring`...) só controlam o acesso ao painel. Aplicação não precisa de tag nenhuma.\n\nA permissão é por vhost e tem três expressões regulares, nesta ordem: **configure** (declarar e apagar), **write** (publicar, e o lado da fila no bind) e **read** (consumir, e o lado da exchange no bind). O nome do recurso precisa casar com a expressão da operação, e a expressão vazia, que não casa com nome nenhum, bloqueia aquela operação (no bloco abaixo, ela aparece na forma explícita, com âncoras de início e fim).",
                    },
                    {
                        type: "table",
                        value: "[[\"Operação\",\"configure\",\"write\",\"read\"],[\"Declarar ou apagar fila ou exchange\",\"Na fila ou exchange\",\"-\",\"-\"],[\"Publicar\",\"-\",\"Na exchange\",\"-\"],[\"Consumir (ou basic.get)\",\"-\",\"-\",\"Na fila\"],[\"Ligar fila a exchange (bind)\",\"-\",\"Na fila\",\"Na exchange\"],[\"Declarar fila com dead letter exchange\",\"Na fila\",\"Na DLX\",\"Na fila\"]]",
                    },
                    {
                        type: "code",
                        value: "# terminal: um usuário por aplicação, cada um com o mínimo\n# (permissões na ordem configure, write, read; '^$' não casa com nada)\nrabbitmqctl add_vhost pedidos\n\nrabbitmqctl add_user pedidos-api \"$SENHA_PEDIDOS_API\"\nrabbitmqctl set_permissions -p pedidos pedidos-api '^$' '^pedidos\\.eventos$' '^$'\n\nrabbitmqctl add_user faturamento-worker \"$SENHA_FATURAMENTO\"\nrabbitmqctl set_permissions -p pedidos faturamento-worker '^$' '^$' '^faturamento\\.pedidos$'\n\nrabbitmqctl delete_user guest\n\n# o worker que tenta redeclarar a própria fila sem configure recebe (canal fechado):\n# ACCESS_REFUSED - configure access to queue 'faturamento.pedidos' in vhost 'pedidos'\n# refused for user 'faturamento-worker'",
                    },
                    {
                        type: "text",
                        value: "Repare no fim do bloco: com a topologia criada pelo deploy, o worker não tem `configure`, e qualquer `QueueDeclareAsync` comum, mesmo para a fila que já existe, é recusado, porque redeclarar é operação de configuração. Ou a aplicação não declara nada, ou declara de forma passiva (`QueueDeclarePassiveAsync`), que desde o 4.3.1 exige só alguma das três permissões no recurso.\n\n## TLS\n\nSem TLS, usuário, senha e o corpo de cada mensagem atravessam a rede em texto puro. No servidor, o listener TLS vem do `rabbitmq.conf`: `listeners.ssl.default = 5671` mais as chaves `ssl_options.cacertfile`, `ssl_options.certfile` e `ssl_options.keyfile`; `listeners.tcp = none` desliga a porta sem TLS. O painel (15672) e as métricas (15692) são listeners separados: ponha TLS neles também ou, no mínimo, não os exponha fora da rede interna (o endpoint de métricas tem autenticação opcional, com `prometheus.authentication.enabled = true`).\n\nNo cliente, há uma armadilha conferida no `RabbitMQ.Client` 7.2: a URI `amqps://` liga o TLS, mas também põe `AcceptablePolicyErrors = RemoteCertificateNameMismatch`, ou seja, **aceita certificado emitido para outro nome**. No teste desta aula, a conexão por `amqps://` num servidor cujo certificado era de outro nome abriu normalmente; com `SslOption` explícita, ou com `AcceptablePolicyErrors` de volta para `SslPolicyErrors.None`, foi recusada. Sem conferir o nome, quem consegue se pôr no meio do caminho com qualquer certificado assinado por uma CA em que o cliente confia lê tudo.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: duas formas de ligar TLS no cliente 7.x\nusing System.Net.Security;\nusing RabbitMQ.Client;\n\nstring senha = Environment.GetEnvironmentVariable(\"RABBITMQ_SENHA\")\n    ?? throw new InvalidOperationException(\"RABBITMQ_SENHA não definida\");\n\n// 1. SslOption explícita: confere a cadeia e o nome do certificado; a porta padrão vira 5671.\nvar porOpcao = new ConnectionFactory\n{\n    HostName = \"rabbit.interno\",\n    VirtualHost = \"pedidos\",\n    UserName = \"faturamento-worker\",\n    Password = senha,\n    Ssl = new SslOption { Enabled = true, ServerName = \"rabbit.interno\" }\n};\n\n// 2. URI amqps: no 7.2 ela liga o TLS com AcceptablePolicyErrors = RemoteCertificateNameMismatch,\n//    ou seja, aceita certificado emitido para outro nome. Desfaça isso logo depois de atribuir.\nvar porUri = new ConnectionFactory\n{\n    Uri = new Uri($\"amqps://faturamento-worker:{Uri.EscapeDataString(senha)}@rabbit.interno/pedidos\")\n};\nporUri.Ssl.AcceptablePolicyErrors = SslPolicyErrors.None;\n\nawait using IConnection conexao = await porOpcao.CreateConnectionAsync(\"faturamento-worker\");",
                    },
                    {
                        type: "text",
                        value: "## Limites de fila\n\nToda fila de produção precisa de um teto. O `max-length` limita o número de mensagens, e o `max-length-bytes`, o total de bytes dos corpos; os dois contam **só as mensagens prontas** (as sem ack ficam de fora). O `overflow` decide o que acontece no teto:\n\n- **`drop-head`** (o padrão): as mensagens mais antigas saem pela cabeça da fila, descartadas ou enviadas para a dead letter, se houver. Serve para dado em que só o recente importa.\n- **`reject-publish`**: a fila recusa as novas. Com publisher confirms, o publicador recebe nack; no cliente 7.x com rastreamento ligado, o `BasicPublishAsync` lança `PublishException` (com `IsReturn` falso), e a mensagem **não entrou**. Sem confirms, ela some em silêncio.\n- **`reject-publish-dlx`**: recusa e manda para a dead letter. Só em fila clássica; quorum queue aceita `drop-head` e `reject-publish`.\n\nNum teste com `max-length` 3 e `reject-publish`, a fila clássica parou em 3 e a quorum queue aceitou a quarta: a documentação avisa que a quorum queue pode passar do limite por algumas mensagens (as que estavam em voo). Use **policy**, e não argumento de fila: o argumento fica gravado na declaração e não muda sem apagar a fila, enquanto a policy muda a qualquer momento. E a **operator policy** é o teto do operador: quando ela e a policy da aplicação definem o mesmo limite, vale o mais conservador.",
                    },
                    {
                        type: "code",
                        value: "# terminal: limite por policy, que muda sem redeclarar a fila\nrabbitmqctl set_policy -p pedidos limite-faturamento '^faturamento\\.' \\\n  '{\"max-length\":100000,\"overflow\":\"reject-publish\"}' --apply-to quorum_queues\n\n# teto do operador: vale mesmo que a aplicação peça mais (fica o menor valor)\nrabbitmqctl set_operator_policy -p pedidos teto-filas '.*' \\\n  '{\"max-length-bytes\":1073741824}' --apply-to queues\n\nrabbitmqctl list_queues -p pedidos name policy operator_policy effective_policy_definition",
                    },
                    {
                        type: "text",
                        value: "## Mensagem grande e claim check\n\nO RabbitMQ 4.x recusa mensagem acima de `max_message_size`, que vale **16 MiB** por padrão (dá para subir até 512 MiB). Passou disso, o broker fecha o **canal** com `PRECONDITION_FAILED`: no teste, um corpo de 17 MiB derrubou o canal com \"message size 17825792 is larger than configured max size 16777216\", e a conexão seguiu aberta. Mas o limite não é meta: mensagem grande custa memória, rede e disco em cada réplica da quorum queue, atrasa as confirmações e segura a fila atrás dela.\n\nO padrão para isso é o **claim check** (o \"canhoto\"): o arquivo vai para um armazenamento de objetos (S3, Blob Storage, MinIO) e a mensagem leva só a **referência**, com tamanho e hash para conferência. Três regras:\n\n- **grave o arquivo antes de publicar**, senão o consumidor busca algo que ainda não existe;\n- **não apague o arquivo ao consumir**: pode haver outro consumidor (fanout) ou uma reentrega; deixe a expiração para a regra de ciclo de vida do armazenamento;\n- **confira o hash** ao baixar, para não processar arquivo trocado ou corrompido.\n\nNo teste, um PDF de 3 MiB virou uma mensagem de 202 bytes.",
                    },
                    {
                        type: "code",
                        value: "// NotaFiscal.cs: claim check, o arquivo vai para o armazenamento e a mensagem leva a referência\nusing System.Security.Cryptography;\nusing System.Text.Json;\nusing RabbitMQ.Client;\n\n// S3, Blob Storage, MinIO ou o que a empresa usar: a mensageria só precisa disto.\npublic interface IArmazemDeArquivos\n{\n    Task GravarAsync(string chave, ReadOnlyMemory<byte> conteudo, string contentType, CancellationToken ct);\n    Task<byte[]> LerAsync(string chave, CancellationToken ct);\n}\n\npublic sealed record NotaFiscalGerada(Guid PedidoId, string Chave, long Tamanho, string Sha256);\n\npublic sealed class PublicadorDeNotas(IChannel canal, IArmazemDeArquivos armazem)\n{\n    public async Task PublicarAsync(Guid pedidoId, byte[] pdf, CancellationToken ct)\n    {\n        // 1. Primeiro o arquivo: publicar antes faria o consumidor buscar algo que ainda não existe.\n        var chave = $\"notas/{pedidoId}.pdf\";\n        await armazem.GravarAsync(chave, pdf, \"application/pdf\", ct);\n\n        // 2. Depois a mensagem, pequena: a referência e o que permite conferir o arquivo.\n        var evento = new NotaFiscalGerada(pedidoId, chave, pdf.Length, Convert.ToHexString(SHA256.HashData(pdf)));\n        var props = new BasicProperties { Persistent = true, ContentType = \"application/json\", MessageId = pedidoId.ToString() };\n        await canal.BasicPublishAsync(\"faturamento.eventos\", \"nota.gerada\", mandatory: true,\n            basicProperties: props, body: JsonSerializer.SerializeToUtf8Bytes(evento), cancellationToken: ct);\n    }\n}\n\npublic static class LeitorDeNotas\n{\n    // No consumidor: busca pela chave e confere o hash antes de usar.\n    public static async Task<byte[]> BaixarAsync(NotaFiscalGerada evento, IArmazemDeArquivos armazem, CancellationToken ct)\n    {\n        var pdf = await armazem.LerAsync(evento.Chave, ct);\n        if (Convert.ToHexString(SHA256.HashData(pdf)) != evento.Sha256)\n            throw new InvalidDataException($\"O arquivo {evento.Chave} não confere com o hash da mensagem\");\n        return pdf;\n    }\n}",
                    },
                    {
                        type: "quote",
                        value: "Um usuário por aplicação, com o mínimo de configure, write e read, sem `guest` e sem login anônimo, e TLS que confere o nome do servidor. Toda fila com teto por policy e o overflow certo para o caso, e arquivo grande no armazenamento de objetos, com a mensagem levando só a referência.",
                    },
                ],
                questions: [
                    {
                        statement: "No padrão claim check, o que vai no corpo da mensagem publicada no RabbitMQ?",
                        difficulty: "facil",
                        options: [
                            { text: "O arquivo em pedaços de 1 MiB, um por mensagem, na mesma fila", isCorrect: false },
                            { text: "O caminho de uma pasta compartilhada que o broker monta nos nós", isCorrect: false },
                            { text: "O arquivo inteiro, compactado para caber no limite do broker", isCorrect: false },
                            { text: "Uma referência ao arquivo no armazenamento, com tamanho e hash", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma fila tem `max-length` definido e nenhum `overflow` configurado. O que acontece quando ela chega ao limite?",
                        difficulty: "facil",
                        options: [
                            { text: "As mais antigas saem pela cabeça, descartadas ou para a dead letter", isCorrect: true },
                            { text: "As publicações novas são recusadas com nack para o publicador", isCorrect: false },
                            { text: "O broker bloqueia a conexão do publicador até a fila esvaziar", isCorrect: false },
                            { text: "O excedente vai para o disco, e o limite passa a valer só na memória", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O worker de faturamento tem `read` na própria fila e nada de `configure`. Na subida, ele chama `QueueDeclareAsync` (não passivo) para a fila que o deploy já criou e recebe `ACCESS_REFUSED`. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "Declarar sem `passive` exige `configure`, mesmo com a fila já existente", isCorrect: true },
                            { text: "A fila é quorum, e redeclarar quorum queue exige a tag `administrator`", isCorrect: false },
                            { text: "O `read` só passa a valer depois do primeiro `BasicConsumeAsync`", isCorrect: false },
                            { text: "Só o usuário que criou a fila pode declará-la de novo, nenhum outro usuário", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma quorum queue tem a policy `{\"max-length\":10000,\"overflow\":\"reject-publish\"}` e já passou do limite (em quorum queue o `reject-publish` deixa entrar uma mensagem além do `max-length`). O publicador usa o cliente 7.x com confirms e rastreamento ligados. O que acontece na próxima publicação?",
                        difficulty: "medio",
                        options: [
                            { text: "O `BasicPublishAsync` retorna normalmente, e a mensagem é descartada", isCorrect: false },
                            { text: "A mensagem vai para a dead letter exchange configurada na fila", isCorrect: false },
                            { text: "A mensagem mais antiga sai da fila pela cabeça, e a nova entra no lugar dela", isCorrect: false },
                            { text: "O `BasicPublishAsync` lança `PublishException`, e a mensagem não entra", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com o `RabbitMQ.Client` 7.2, a equipe configura `factory.Uri = new Uri(\"amqps://...\")`. Num teste de segurança, o cliente conecta num servidor cujo certificado, assinado por uma CA confiável, foi emitido para outro nome, e a conexão abre. Por quê?",
                        difficulty: "dificil",
                        options: [
                            { text: "O nome só é conferido quando `CheckCertificateRevocation` está ligado", isCorrect: false },
                            { text: "O TLS 1.3 confere só a cadeia do certificado, nunca o nome do servidor", isCorrect: false },
                            { text: "A URI `amqps` liga o TLS aceitando divergência de nome no certificado", isCorrect: true },
                            { text: "Na porta 5671, o cliente pula a validação se não enviar certificado próprio", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "RabbitMQ gerenciado e o checklist de produção",
                blocks: [
                    {
                        type: "text",
                        value: "# RabbitMQ gerenciado e o checklist de produção\n\nManter um cluster RabbitMQ é trabalho de verdade: atualizar RabbitMQ e Erlang, trocar disco, substituir nó, renovar certificado, ler as notas de versão para não ser pego por uma remoção como a do espelhamento clássico no 4.0. Um broker gerenciado tira parte disso da sua mesa. **Parte**: o que o provedor não enxerga (a topologia, o contrato das mensagens, o comportamento do seu cliente) continua com você.\n\n## O Amazon MQ em linhas gerais\n\nOs fatos abaixo são da documentação da AWS em outubro de 2026 e mudam com o tempo:\n\n- **Versões**: o Amazon MQ for RabbitMQ oferece o 4.2 e o 4.3 (na série 4, só em instâncias `mq.m7g`). Você escolhe a versão major.minor; os patches, a AWS aplica.\n- **Dois modos**: instância única (um nó, numa zona de disponibilidade, atrás de um Network Load Balancer) ou **cluster** (três nós em zonas diferentes, também atrás de um Network Load Balancer).\n- **Janela de manutenção semanal**, de até duas horas: no cluster, um nó por vez, com pelo menos dois de pé, e quem estava conectado ao nó reiniciado perde a conexão e **precisa reconectar sozinho**. É a queda de nó da aula de cluster, agora com hora marcada. Na instância única, manutenção significa broker fora do ar.\n- **Quorum queue é o tipo padrão** nos brokers 4.x: fila declarada sem tipo vira quorum. A AWS avisa que, ali, fila clássica não tem durabilidade garantida em todos os casos.\n- **Administração pela API**: usuários, vhosts e policies passam pela API de gerenciamento do RabbitMQ e pelo painel web; a configuração do broker, por um subconjunto de chaves que a AWS deixa editar (como `consumer_timeout` e `heartbeat`); plugins, só os de uma lista fechada (shovel, federation, consistent hash, OAuth 2 e LDAP, entre outros).\n- **O que não existe lá** (RabbitMQ 4 no Amazon MQ): streams, exchange local random e **interceptadores de mensagem**. Ou seja, o carimbo de horário da espera na fila precisa vir do publicador, como na aula de rastreamento. Métrica por fila não vai para o CloudWatch; o endpoint do Prometheus continua disponível.\n\nFora da AWS, há empresas especializadas em RabbitMQ como serviço (a CloudAMQP é um exemplo) e, em Kubernetes, o RabbitMQ Cluster Operator, que automatiza a instalação mas deixa a operação com você. Rede, IAM e o resto da infraestrutura de nuvem são assunto de outro estudo.",
                    },
                    {
                        type: "table",
                        value: "[[\"Responsabilidade\",\"Com o provedor\",\"Com você\"],[\"Hardware, sistema operacional e troca de nó\",\"Sim\",\"Não\"],[\"Patches de versão do RabbitMQ\",\"Aplica na janela de manutenção\",\"Escolher a versão major.minor e testar a subida\"],[\"Cluster em várias zonas\",\"Monta e mantém\",\"Escolher o modo e pagar por ele\"],[\"Topologia, tipos de fila, policies e limites\",\"Não\",\"Sim, inteira\"],[\"Usuários e permissões\",\"Oferece as ferramentas\",\"Um usuário por aplicação, com o mínimo\"],[\"Reconexão, confirms e idempotência\",\"Não\",\"Sim, no código\"],[\"Alertas de fila e de negócio\",\"Expõe as métricas do broker\",\"Decidir o que alerta e quem é acordado\"]]",
                    },
                    {
                        type: "text",
                        value: "## O checklist de produção\n\nA tabela abaixo junta, num lugar só, o que a trilha construiu módulo a módulo. Ela vale para broker próprio ou gerenciado; o que muda é quem executa alguns itens, não se eles existem.",
                    },
                    {
                        type: "table",
                        value: "[[\"Área\",\"O que conferir\",\"Por quê\"],[\"Filas\",\"Quorum queue para o que não pode se perder; clássica só para o descartável, e fila transitória só exclusiva\",\"Só quorum queue e stream replicam; desde o 4.3, fila não durável e não exclusiva derruba a conexão\"],[\"Publicação\",\"Publisher confirms com rastreamento e tratamento de PublishException\",\"Sem confirmação, nada garante que a mensagem entrou\"],[\"Consumo\",\"Ack manual, prefetch dimensionado e consumidor idempotente\",\"Pelo menos uma vez significa duplicata em algum momento\"],[\"Falhas\",\"Dead letter, delivery-limit e retry com espera\",\"Mensagem venenosa não pode travar a fila nem sumir sem rastro\"],[\"Limites\",\"max-length com overflow por policy, operator policy e claim check\",\"Fila sem teto vira disco cheio e cluster parado\"],[\"Acesso\",\"Um usuário por aplicação, sem guest, sem login anônimo, com TLS\",\"Menor privilégio e credencial que se troca sem parar tudo\"],[\"Cluster\",\"Três nós em zonas diferentes, cliente com lista de nós ou balanceador\",\"A perda de um nó vira pausa de segundos, não incidente\"],[\"Observação\",\"Prontas, sem ack, consumidores, taxas, alarmes, trace e espera na fila\",\"Fila doente não dá erro, dá acúmulo\"],[\"Mudança\",\"Topologia e policies versionadas, atualização nó a nó\",\"O que não está versionado não se recria às três da manhã\"]]",
                    },
                    {
                        type: "text",
                        value: "## Antes de ligar o tráfego\n\nTrês cuidados que costumam faltar mesmo em checklist bonito:\n\n- **Teste a falha, não só o caminho feliz.** Em homologação, com carga, derrube um nó e veja o cliente reconectar, as confirmações voltarem e as duplicatas serem absorvidas pela idempotência. O experimento da aula de cluster cabe em três contêineres.\n- **Versione a topologia, não as senhas.** O `rabbitmqctl export_definitions` gera um JSON com vhosts, filas, exchanges, bindings e policies, e também com os **usuários e o hash das senhas**. Trate o arquivo como segredo, ou versione só a topologia e gere a parte dos usuários no deploy, a partir do cofre de segredos.\n- **Dimensione a margem de disco.** O `disk_free_limit` padrão de 50 MB é pensado para desenvolvimento; em produção, a documentação recomenda algo da ordem do limite de memória. Abaixo da margem, o broker bloqueia toda publicação.\n\nO trecho de `rabbitmq.conf` abaixo junta os ajustes de produção desta aula e da aula de segurança que não dependem do seu certificado. Ele foi conferido subindo um nó 4.3.6: o login anônimo sumiu, o limite de disco subiu e as definições foram importadas na subida, sem criar o `guest`.",
                    },
                    {
                        type: "code",
                        value: "# rabbitmq.conf (trecho de produção, conferido no 4.3.6)\n\n# sem login anônimo: no 4.x o mecanismo ANONYMOUS vem ligado e entra como guest\nauth_mechanisms.1 = PLAIN\nauth_mechanisms.2 = AMQPLAIN\nanonymous_login_user = none\n\n# margem de disco de produção: o padrão de 50 MB é pensado para desenvolvimento\ndisk_free_limit.absolute = 4GB\n\n# topologia, permissões e policies carregadas de arquivo na subida;\n# um nó novo que importa definições não cria o vhost padrão nem o usuário guest\ndefinitions.import_backend = local_filesystem\ndefinitions.local.path = /etc/rabbitmq/definicoes.json",
                    },
                    {
                        type: "quote",
                        value: "Mensageria em produção é a soma de escolhas pequenas e verificáveis: quorum queue, confirm, ack manual, consumidor idempotente, fila com teto, usuário mínimo, três nós e uma fila observada. O broker, seu ou gerenciado, guarda e entrega; o resto do caminho, do publish ao ack, é do seu código e da sua operação.",
                    },
                ],
                questions: [
                    {
                        statement: "No modo cluster do Amazon MQ for RabbitMQ, o que acontece com os clientes durante a janela de manutenção?",
                        difficulty: "facil",
                        options: [
                            { text: "Só os consumidores caem; as conexões que publicam são mantidas abertas", isCorrect: false },
                            { text: "O broker inteiro para durante a janela, e as mensagens ficam esperando na AWS", isCorrect: false },
                            { text: "Nada: a AWS move as conexões abertas para outro nó sem derrubar nenhuma delas", isCorrect: false },
                            { text: "Os nós reiniciam um a um, e quem estava no nó reiniciado precisa reconectar", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num broker gerenciado, qual destas responsabilidades continua com a sua equipe?",
                        difficulty: "facil",
                        options: [
                            { text: "Aplicar os patches de segurança do RabbitMQ em cada um dos nós do cluster", isCorrect: false },
                            { text: "Substituir o nó quando o hardware da máquina dele falhar", isCorrect: false },
                            { text: "Montar o disco e o balanceador de carga na frente dos nós", isCorrect: false },
                            { text: "Escolher tipos de fila, limites e as permissões de cada aplicação", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Você leva para o Amazon MQ (RabbitMQ 4.3) um worker que mede a espera na fila pelo header `timestamp_in_ms`, posto pelo interceptador de mensagens do broker. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "O header não chega, porque lá não há interceptador; o carimbo vai para o publicador", isCorrect: true },
                            { text: "Funciona igual, porque o Amazon MQ liga o interceptador por padrão em todos os brokers 4.x", isCorrect: false },
                            { text: "O header chega em segundos, porque o Amazon MQ converte o carimbo para o Timestamp", isCorrect: false },
                            { text: "A conexão é recusada, porque headers que começam com timestamp são reservados lá", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Ao versionar a topologia do broker, alguém propõe guardar no repositório a saída inteira de `rabbitmqctl export_definitions`. Qual é o cuidado?",
                        difficulty: "medio",
                        options: [
                            { text: "O arquivo não inclui as policies, e os limites das filas se perdem", isCorrect: false },
                            { text: "O arquivo só pode ser importado na mesma versão exata que o gerou", isCorrect: false },
                            { text: "O arquivo inclui as mensagens das filas e cresce sem nenhum controle", isCorrect: false },
                            { text: "O arquivo traz os usuários com o hash das senhas, então é um segredo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um sistema usa quorum queues num cluster de três nós, publisher confirms e ack manual. O consumidor grava o pedido no banco e só depois dá ack, sem checar duplicata. Na manutenção, o nó em que o consumidor está conectado reinicia logo depois da gravação e antes do ack. O que acontece, e qual item do checklist evita o estrago?",
                        difficulty: "dificil",
                        options: [
                            { text: "A mensagem se perde com o nó reiniciado; o item é aumentar o número de réplicas da fila", isCorrect: false },
                            { text: "A mensagem volta para a fila e é gravada de novo; o item é o consumidor idempotente", isCorrect: true },
                            { text: "O publicador recebe nack do que estava em voo; o item é desligar os confirms", isCorrect: false },
                            { text: "A fila fica sem líder até o fim da janela; o item é trocar para fila clássica durável", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    mesclarSolucoes(MODULOS, "mensageria-rabbitmq");
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
