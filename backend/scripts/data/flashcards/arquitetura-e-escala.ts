import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Arquitetura e Escala, trilha que fecha o roadmap de DevOps.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam as listas fechadas de sinal e sintoma, os
 * critérios de decisão e as trocas que cada escolha cobra.
 */
export const arquiteturaEEscala: CartasDaTrilha = {
    trilha: "Arquitetura e Escala",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Por que o tamanho do commit não define uma decisão de arquitetura?",
                        verso: "Uma linha pode ser arquitetural e uma mudança grande pode não ser.",
                    },
                    {
                        frente: "Que duas perguntas medem se uma decisão é arquitetural?",
                        verso: "Quanto do sistema depende dela e quão fundo construíram em cima.",
                    },
                    {
                        frente: "Que exemplo de uma linha só a aula dá como arquitetural?",
                        verso: "Toda escrita no banco gravar também um evento numa fila.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que diz um p99 que sobe bem mais do que o p50?",
                        verso: "Uma fatia das requisições esbarra num recurso disputado.",
                    },
                    {
                        frente: "Que efeito perverso o health check falhando tem no pico?",
                        verso: "A instância sai do load balancer bem na hora de mais acesso.",
                    },
                    {
                        frente: "Que gatilho decide a hora de escalar, e qual não decide?",
                        verso: "O número medido decide; o tempo desde o lançamento não.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como o custo da escala vertical cresce ante a capacidade?",
                        verso: "Mais que proporcional: dobrar uma máquina grande custa mais que o dobro.",
                    },
                    {
                        frente: "Que preço de entrada a escala horizontal cobra?",
                        verso: "A aplicação precisa rodar em vários lugares sem estado local.",
                    },
                    {
                        frente: "Como as duas escalas se combinam na prática?",
                        verso: "Máquinas de tamanho razoável, com autoscaling mexendo no número.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em que unidades latência e throughput são medidos?",
                        verso: "Latência em milissegundos e throughput em requisições por segundo.",
                    },
                    {
                        frente: "Que custo o load balancer soma a cada requisição?",
                        verso: "Um salto de rede a mais entre o cliente e a réplica.",
                    },
                    {
                        frente: "Quando a fila volta a aumentar a latência de ponta a ponta?",
                        verso: "Quando ela cresce mais rápido do que os workers esvaziam.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que troca a escala horizontal faz, dita nos dois sentidos?",
                        verso: "Troca o teto físico pela exigência de não ter estado local.",
                    },
                    {
                        frente: "Em que ordem a trilha propõe escalar o sistema?",
                        verso: "Monólito, depois banco, depois fila e só então serviços.",
                    },
                    {
                        frente: "Que troca o cache faz, e o que ela exige em seguida?",
                        verso: "Troca dado atualizado por resposta rápida e exige invalidação.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que cinco facilidades a aula credita ao monólito?",
                        verso: "Entender, testar, deployar, debugar e não ter rede interna.",
                    },
                    {
                        frente: "Por que monólito não é sinônimo de bagunça?",
                        verso: "Ele aceita módulos internos bem definidos no mesmo processo.",
                    },
                    {
                        frente: "O que uma chamada entre módulos do monólito não pode fazer?",
                        verso: "Falhar na rede, atrasar ou cair no meio do caminho.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que duas estratégias de distribuição a aula compara?",
                        verso: "O round-robin em sequência e o least connections, por conexão aberta.",
                    },
                    {
                        frente: "Quando o least connections ganha do round-robin?",
                        verso: "Quando as requisições têm duração bem desigual entre si.",
                    },
                    {
                        frente: "Que ferramentas fazem o papel de load balancer?",
                        verso: "O nginx, o HAProxy ou o balanceador gerenciado da nuvem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que quatro esconderijos de estado local a aula lista?",
                        verso: "Sessão, cache manual, arquivo enviado e contador em memória.",
                    },
                    {
                        frente: "Que teste prático confirma que a aplicação é stateless?",
                        verso: "Desligar uma réplica agora e ninguém perceber.",
                    },
                    {
                        frente: "Por que o JWT dispensa estado no servidor?",
                        verso: "O token carrega os dados e qualquer réplica valida a assinatura.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em que o load balancer se apoia para grudar o cliente?",
                        verso: "Num cookie ou no IP de origem daquele cliente.",
                    },
                    {
                        frente: "Que exceção honesta a aula concede ao sticky session?",
                        verso: "Conexão longa como WebSocket, presa a quem a abriu.",
                    },
                    {
                        frente: "Por que uma réplica nova pouco ajuda com sticky session?",
                        verso: "Ela não recebe quem já está preso nas antigas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três sinais mostram o monólito em si começando a doer?",
                        verso: "Deploy lento, times disputando o repositório e subida tudo ou nada.",
                    },
                    {
                        frente: "Que quatro remédios resolvem a dor dentro do monólito?",
                        verso: "Índice, connection pooling, cache na frente e módulos mais claros.",
                    },
                    {
                        frente: "O que multiplicar réplicas da aplicação não multiplica?",
                        verso: "O banco, que segue sendo uma instância só para todas.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro recursos físicos leitura e escrita disputam?",
                        verso: "CPU, memória de páginas, disco para o WAL e locks de linha.",
                    },
                    {
                        frente: "O que a sigla WAL guarda dentro do banco?",
                        verso: "O log de escrita à prova de falhas, gravado em disco.",
                    },
                    {
                        frente: "Por que multiplicar réplicas pressiona o teto de conexões?",
                        verso: "Cada réplica traz o próprio pool e todos somam no mesmo banco.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome o Postgres dá ao mecanismo dessa cópia contínua?",
                        verso: "Replicação por streaming, da primária para as réplicas.",
                    },
                    {
                        frente: "Que nome tem o intervalo entre a gravação e a cópia chegar?",
                        verso: "Lag de replicação, quase sempre de milissegundos.",
                    },
                    {
                        frente: "O que muda quando cai a primária, e quando cai uma réplica?",
                        verso: "Sem primária o sistema para de escrever; sem uma réplica as outras seguem.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que custo uma conexão aberta e parada gera no banco?",
                        verso: "Memória e recursos do lado do Postgres, mesmo sem query.",
                    },
                    {
                        frente: "Que pooler externo a aula cita, e onde ele fica?",
                        verso: "O PgBouncer, entre a aplicação e o Postgres.",
                    },
                    {
                        frente: "O que denuncia um pool grande demais em várias réplicas?",
                        verso: "A soma dos pools estoura o teto de conexões do banco.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois planos o Postgres escolhe entre si numa busca?",
                        verso: "O sequential scan, que varre tudo, e o index scan, que pula direto.",
                    },
                    {
                        frente: "Por que o N+1 dói mais em escala do que em desenvolvimento?",
                        verso: "Cada query extra prende uma conexão do pool, vezes as réplicas.",
                    },
                    {
                        frente: "Que condição revela cada um dos dois vilões?",
                        verso: "O índice pede EXPLAIN; o N+1 pede carga parecida com produção.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que nome alternativo o sharding recebe, e o que ele divide?",
                        verso: "Particionamento horizontal, que divide os dados entre instâncias.",
                    },
                    {
                        frente: "Quando nenhuma técnica de leitura resolve, e sobra o sharding?",
                        verso: "Quando o gargalo é a escrita, que ainda converge para a primária.",
                    },
                    {
                        frente: "Diante de uma partição de rede, o que o CAP obriga a escolher?",
                        verso: "Entre consistência total e disponibilidade, enquanto a falha durar.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que código HTTP a rota devolve ao só enfileirar o trabalho?",
                        verso: "O 202 Accepted, dizendo que aceitou sem ter terminado.",
                    },
                    {
                        frente: "O que acontece com a latência numa cadeia síncrona?",
                        verso: "Ela vira a soma de todos os serviços encadeados.",
                    },
                    {
                        frente: "Que pista prática indica trabalho que deveria ir para a fila?",
                        verso: "A resposta precisaria mentir que deu certo sem saber ainda.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que campo limita quantos jobs um worker pega ao mesmo tempo?",
                        verso: "O concurrency configurado naquele worker.",
                    },
                    {
                        frente: "Que escala independente a fila abre além da API?",
                        verso: "Dá para aumentar os workers sem tocar nas réplicas da API.",
                    },
                    {
                        frente: "Que unidade nova a fila acrescenta ao deploy?",
                        verso: "O worker, com saúde, logs e versão próprios.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que broker se destaca por roteamento flexível de mensagens?",
                        verso: "O RabbitMQ, focado em distribuir tarefas entre consumidores.",
                    },
                    {
                        frente: "Que três critérios decidem qual broker adotar?",
                        verso: "O volume, o tempo de guarda e o que a equipe já opera.",
                    },
                    {
                        frente: "Quantos consumidores recebem cada mensagem, em fila e tópico?",
                        verso: "Um só na fila; no tópico, todo assinante ganha uma cópia.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois nomes separam quem decide o próximo passo?",
                        verso: "Orquestração, com quem inicia chamando, e coreografia por evento.",
                    },
                    {
                        frente: "Que preço de leitura o desacoplamento por eventos cobra?",
                        verso: "Some o lugar único onde se lia a história inteira do fluxo.",
                    },
                    {
                        frente: "Que dilema o payload de um evento carrega?",
                        verso: "Dado demais pesa em todos; de menos faz consultar a origem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três garantias de entrega um broker pode oferecer?",
                        verso: "At-most-once, at-least-once e o caro exactly-once.",
                    },
                    {
                        frente: "Onde mora a janela que gera a mensagem repetida?",
                        verso: "Entre processar a mensagem e confirmar o ack ao broker.",
                    },
                    {
                        frente: "Que duas guardas de idempotência a aula compara?",
                        verso: "A chave no Redis, que expira, e a tabela no banco, que dura.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que dois problemas os microsserviços de fato resolvem?",
                        verso: "Time grande demais para uma base só e escala desigual entre partes.",
                    },
                    {
                        frente: "Que erro comum a aula atribui a copiar Netflix e Amazon?",
                        verso: "Adotar a solução sem ter o problema que elas tinham.",
                    },
                    {
                        frente: "Que terceira pergunta a aula faz sobre a estrutura do time?",
                        verso: "Se ele opera mais pipeline, banco e observabilidade sem virar projeto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas dois serviços precisam fazer sozinhos?",
                        verso: "Ser deployados, escalados e derrubados sem coordenar os outros.",
                    },
                    {
                        frente: "O que nunca deve virar meta ao adotar microsserviços?",
                        verso: "O número de serviços, que é consequência da divisão.",
                    },
                    {
                        frente: "Que ganho de escala os microsserviços trazem sobre o monólito?",
                        verso: "Cada serviço ganha réplicas por conta, sem escalar o sistema todo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para onde os microsserviços movem a complexidade?",
                        verso: "Da lógica dentro do processo para a conversa entre processos.",
                    },
                    {
                        frente: "Que duas ferramentas do banco único somem entre serviços?",
                        verso: "O JOIN entre tabelas e a transação única com commit.",
                    },
                    {
                        frente: "Que infraestrutura cada serviço novo passa a exigir?",
                        verso: "Pipeline, monitoramento, banco e forma de escalar próprios.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que contrato e formato o gRPC usa no lugar do JSON?",
                        verso: "Contratos tipados em Protocol Buffers, num formato binário.",
                    },
                    {
                        frente: "Que diferença separa o API Gateway do load balancer?",
                        verso: "O gateway roteia entre serviços; o balanceador, entre réplicas iguais.",
                    },
                    {
                        frente: "Que teste prático revela uma fronteira bem desenhada?",
                        verso: "Uma mudança de negócio comum mexe num serviço só.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três coisas o monólito modular mantém únicas?",
                        verso: "A aplicação, o deploy e o banco continuam sendo um só.",
                    },
                    {
                        frente: "Que regra de acesso as tabelas de um módulo seguem?",
                        verso: "Só o código do próprio módulo as acessa, nunca outro.",
                    },
                    {
                        frente: "Por que extrair um serviço por vez vence a reescrita?",
                        verso: "O sistema segue no ar e o dano fica contido num serviço.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que nome tem a lista de suposições sobre a rede confiável?",
                        verso: "As falácias da computação distribuída.",
                    },
                    {
                        frente: "Que duas perguntas a aula separa diante de uma falha?",
                        verso: "Como evitar que ela ocorra e como conter quando ocorrer.",
                    },
                    {
                        frente: "Como um processo único falha, comparado ao distribuído?",
                        verso: "De um jeito só; o distribuído falha de dezenas parciais.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que problema o jitter resolve no retry?",
                        verso: "Evita que réplicas que erraram juntas tentem de novo no mesmo instante.",
                    },
                    {
                        frente: "Como o backoff exponencial espaça as tentativas?",
                        verso: "Dobrando a espera, por exemplo 200ms, depois 400ms e 800ms.",
                    },
                    {
                        frente: "Que erros merecem nova tentativa, e quais não merecem?",
                        verso: "Timeout, conexão recusada e 503 merecem; o 400 e o 404 não.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três estados um circuit breaker percorre?",
                        verso: "Fechado contando falhas, aberto e meio-aberto testando.",
                    },
                    {
                        frente: "De onde vem o nome circuit breaker?",
                        verso: "Do disjuntor elétrico, que desarma antes de queimar a fiação.",
                    },
                    {
                        frente: "Que ganho o fail fast traz além de responder antes?",
                        verso: "Libera recursos que ficariam presos esperando o timeout.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois UPDATEs a aula contrasta quanto a repetir?",
                        verso: "Definir o status é seguro; somar ao saldo repete o efeito.",
                    },
                    {
                        frente: "O que o servidor guarda junto de uma chave de idempotência?",
                        verso: "O resultado já processado, devolvido se a chave repetir.",
                    },
                    {
                        frente: "Onde vale degradar com dado velho, e onde não vale?",
                        verso: "Vale na leitura; escrita e dinheiro devem falhar de forma clara.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a estratégia multi-AZ espalha, e contra o quê?",
                        verso: "Réplicas por zonas separadas, contra uma zona inteira cair.",
                    },
                    {
                        frente: "Quanto tempo por ano cada nível de nove admite fora do ar?",
                        verso: "Cerca de 3,65 dias com dois noves e 53 minutos com quatro.",
                    },
                    {
                        frente: "Por que subir um nove não é questão de configuração?",
                        verso: "Exige mais réplicas, zonas, failover e operação para sustentar.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que a sigla CDN significa, e que serviços a representam?",
                        verso: "Content Delivery Network, como a Cloudflare e o CloudFront.",
                    },
                    {
                        frente: "Que bifurcação a requisição encontra antes de tudo?",
                        verso: "Se é arquivo estático ou chamada dinâmica para a API.",
                    },
                    {
                        frente: "Que três válvulas de alívio a réplica usa para não travar?",
                        verso: "O cache, a fila com workers e o banco com réplica de leitura.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que nome tem cada salto medido no distributed tracing?",
                        verso: "Um span, com início, fim e duração próprios.",
                    },
                    {
                        frente: "Que três ferramentas instrumentam tracing distribuído?",
                        verso: "O OpenTelemetry, o Jaeger e o Zipkin.",
                    },
                    {
                        frente: "Que documento deve existir antes de o alerta disparar?",
                        verso: "O runbook, dizendo o que fazer quando aquele alerta soar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que ordem de evolução a aula sugere para a arquitetura?",
                        verso: "Medir, cachear, tirar trabalho com fila e só então escalar.",
                    },
                    {
                        frente: "O que uma peça adicionada cedo demais cobra do time?",
                        verso: "Complexidade paga todo dia, sem benefício até o tráfego chegar.",
                    },
                    {
                        frente: "Que custo próprio a fila cobra de quem a adota?",
                        verso: "Idempotência e alguém de olho na fila que cresce.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que ajuste vem antes de subir réplicas atrás do balanceador?",
                        verso: "Tornar a aplicação stateless, com sessão no Redis ou JWT.",
                    },
                    {
                        frente: "Que leituras não cabem no cache e sobram para a réplica?",
                        verso: "Relatórios e buscas variadas, que mudam a cada consulta.",
                    },
                    {
                        frente: "Que passo a aula recusa como automático depois dessas peças?",
                        verso: "Quebrar o monólito em serviços, que exige dor medida.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que quatro caminhos a aula sugere depois do fim da trilha?",
                        verso: "Construir do zero, aprofundar um tema, ler sistemas reais e contribuir.",
                    },
                    {
                        frente: "Por que um mapa completo não basta para dominar o ofício?",
                        verso: "O território muda: ferramenta e padrão de hoje serão trocados.",
                    },
                    {
                        frente: "Que diferença separa projeto próprio de exercício guiado?",
                        verso: "No próprio você decide o desenho inteiro, do banco à esteira.",
                    },
                ],
            },
        },
    },
};
