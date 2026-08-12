// Seed da trilha System Design (avancado). Trilha avulsa, sem roadmap fixo: o
// assunto atravessa back-end, DevOps e engenharia de IA.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-system-design.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "System Design";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "O método de projetar sistemas antes de escrever código: separar requisito funcional de não funcional, estimar carga na conta de guardanapo, montar o desenho com os blocos de sempre (DNS, CDN, balanceador, fila, blob), decidir replicação e sharding com CAP e PACELC na mão, e defender os trade-offs. Fecha com os estudos de caso clássicos e com o desenho de sistemas de IA.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O método do System Design",
    aulas: [
        {
            titulo: "O que é System Design (e o que não é)",
            blocks: [
                {
                    type: "text",
                    value: "# O que é System Design\n\nVocê já sabe construir. Sabe subir uma API, modelar tabela, colocar cache na frente do banco, jogar trabalho pesado numa fila, empacotar em container e mandar pro ar. System Design não é mais uma ferramenta em cima dessa pilha. É o passo anterior: decidir **quais** peças entram, **como** elas se ligam e **por que** essa combinação, e não outra, resolve o problema que te deram.\n\nA diferença é que o problema chega vago de propósito. Ninguém entrega um documento dizendo \"faça um encurtador de URL que aguente 8 mil redirecionamentos por segundo, com 99,9% de disponibilidade e latência abaixo de 100ms\". O que chega é \"projete um encurtador de URL\". Transformar essa frase de cinco palavras num desenho defensável é a habilidade inteira.",
                },
                {
                    type: "quote",
                    value: "**System Design** é o processo de definir a arquitetura, os componentes e as interfaces de um sistema para atender a um conjunto de requisitos. O produto do trabalho não é código: é um **desenho justificado**, com as escolhas amarradas aos requisitos e os custos de cada escolha declarados.",
                },
                {
                    type: "text",
                    value: "## Não é decorar arquitetura de empresa grande\n\nExiste uma armadilha comum: estudar System Design lendo como o Instagram ou a Netflix fazem, e sair repetindo aquele desenho em qualquer pergunta. O desenho da Netflix resolve o problema da Netflix, com o dinheiro da Netflix e a equipe da Netflix. Reproduzir aquilo para um sistema com dez mil usuários é o erro clássico de over-engineering, e quem avalia percebe na hora.\n\nO que se aprende dessas empresas não é o desenho final, é o **encadeamento de decisões**: qual gargalo apareceu primeiro, o que foi tentado, por que aquilo não bastou, o que entrou no lugar. Esse encadeamento se reaproveita. O diagrama pronto, não.",
                },
                {
                    type: "text",
                    value: "## Também não é o mesmo que arquitetura de código\n\nArquitetura em camadas, injeção de dependência, hexagonal, SOLID: isso organiza o código **dentro** de um serviço, e é assunto importante, mas é outro assunto. System Design olha de fora do processo: quantas máquinas, quem fala com quem pela rede, onde o dado mora, o que acontece quando um pedaço cai.\n\nUm sinal prático de que você saiu da arquitetura de código e entrou em System Design: as perguntas passam a envolver **rede, falha parcial e números**. Quantas requisições por segundo. Quanto o disco cresce por dia. O que o usuário vê quando a réplica está atrasada. Nada disso aparece num diagrama de classes.",
                },
                {
                    type: "table",
                    value: '[["Pergunta", "É arquitetura de código", "É System Design"], ["Onde fica a regra de negócio dentro do serviço", "Sim", "Não"], ["Quantas réplicas do banco e onde ficam", "Não", "Sim"], ["Como testar essa classe sem tocar o banco", "Sim", "Não"], ["O que o usuário vê quando a fila entope", "Não", "Sim"], ["Quanto isso custa por mês em nuvem", "Não", "Sim"]]',
                },
                {
                    type: "text",
                    value: "## Por que isso virou uma etapa de entrevista\n\nSystem Design virou etapa própria porque é o que mais separa gente sênior de gente júnior no dia a dia. Escrever a função que resolve o caso feliz é trabalho que se aprende rápido. Decidir que aquele caso feliz vai rodar 40 mil vezes por segundo, que 3% vai falhar, e que o time precisa conseguir operar isso às três da manhã, é outra conversa.\n\nEm 2026 a régua subiu de novo. Não basta mais desenhar caixas certas: quem avalia cobra **custo, modo de falha e operação**. Duas soluções que atendem o mesmo requisito, e uma custa cinco vezes mais ou acorda alguém de madrugada, não são equivalentes. Ao longo da trilha, toda decisão vai vir acompanhada dessas três perguntas.",
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** System Design é transformar um enunciado vago num **desenho justificado**, olhando de fora do processo: rede, falha parcial e números. Não é decorar o diagrama de empresa grande, e não é arquitetura de código. O que se reaproveita das empresas grandes é o **encadeamento de decisões**, nunca o desenho pronto.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o produto do trabalho de System Design?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um desenho justificado, ligado aos requisitos.",
                            isCorrect: true,
                        },
                        {
                            text: "O código da primeira versão, já testado e revisado pelo time.",
                            isCorrect: false,
                        },
                        { text: "O diagrama de classes dos módulos internos do serviço.", isCorrect: false },
                        { text: "A lista de tarefas priorizada para a próxima sprint.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Numa entrevista, o candidato desenha para um sistema de dez mil usuários a mesma arquitetura que a Netflix usa. Qual é o problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O desenho resolve um problema de escala que aquele sistema não tem.",
                            isCorrect: true,
                        },
                        {
                            text: "Copiar arquitetura de terceiros é proibido nesse tipo de avaliação.",
                            isCorrect: false,
                        },
                        {
                            text: "A arquitetura da Netflix é secreta e não pode ser reproduzida.",
                            isCorrect: false,
                        },
                        {
                            text: "Falta o time de plantão que aquele desenho exige para operar.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que se reaproveita ao estudar a arquitetura de uma empresa grande?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O encadeamento das decisões e o gargalo que veio primeiro.",
                            isCorrect: true,
                        },
                        {
                            text: "O diagrama final, que serve de ponto de partida já validado.",
                            isCorrect: false,
                        },
                        { text: "A lista de tecnologias, que indica as escolhas maduras.", isCorrect: false },
                        { text: "Os números de carga, que servem de referência de mercado.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual destas perguntas indica que a conversa saiu de arquitetura de código e entrou em System Design?",
                    difficulty: "facil",
                    options: [
                        { text: "O que o usuário vê quando uma réplica está atrasada?", isCorrect: true },
                        { text: "Essa regra deveria ficar no serviço ou no repositório?", isCorrect: false },
                        { text: "Como testar essa classe sem depender do banco real?", isCorrect: false },
                        { text: "Vale extrair essa função repetida para um helper?", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Segundo a régua atual, o que separa duas soluções que atendem exatamente ao mesmo requisito funcional?",
                    difficulty: "dificil",
                    options: [
                        { text: "Custo, modo de falha e esforço de operação.", isCorrect: true },
                        { text: "A quantidade de componentes no diagrama final.", isCorrect: false },
                        { text: "A popularidade das tecnologias escolhidas.", isCorrect: false },
                        { text: "O tempo que cada uma leva para ser implementada.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Requisitos funcionais e não funcionais",
            blocks: [
                {
                    type: "text",
                    value: '# Requisitos funcionais e não funcionais\n\nO enunciado que você recebe é curto de propósito. "Projete um sistema de chat." Quem escreveu isso sabe exatamente o que quer ver: se você vai sair desenhando caixas, ou se vai primeiro descobrir **que sistema é esse**.\n\nDescobrir significa separar duas famílias de requisito que costumam vir embaralhadas na cabeça de quem começa. Uma diz **o que o sistema faz**. A outra diz **como ele precisa se comportar enquanto faz**. As duas mandam no desenho, mas de jeitos diferentes: a primeira define as caixas, a segunda define o tamanho e a ligação entre elas.',
                },
                {
                    type: "quote",
                    value: "**Requisito funcional** é um comportamento observável do sistema: enviar mensagem, ver histórico, marcar como lida. **Requisito não funcional** é uma qualidade que atravessa esses comportamentos: latência, disponibilidade, consistência, durabilidade, custo, segurança.",
                },
                {
                    type: "text",
                    value: '## O funcional define o escopo, e escopo se corta\n\nNum sistema de chat cabe quase tudo: mensagem um a um, grupo, anexo, chamada de vídeo, reação, mensagem que some, busca no histórico, notificação push. Tentar desenhar tudo isso no tempo que você tem é a receita para não desenhar nada direito.\n\nPor isso a primeira coisa é **cortar**. Escolha de três a cinco funcionalidades centrais, diga em voz alta que está deixando o resto de fora e siga. "Vou focar em mensagem um a um, grupo e histórico. Chamada de vídeo e reações eu deixo fora do escopo." Isso não é fraqueza, é a decisão que mostra que você sabe priorizar.',
                },
                {
                    type: "text",
                    value: '## O não funcional é o que realmente muda o desenho\n\nDuas pessoas podem receber a mesma lista funcional e desenhar sistemas radicalmente diferentes, porque os requisitos não funcionais mudaram. Um chat interno de mil funcionários e um chat com um bilhão de contas fazem "enviar mensagem" da mesma forma na tela, e de formas incomparáveis por baixo.\n\nOs eixos que mais mexem no desenho são poucos e vale saber de cor: **escala** (quantos usuários e quantas operações por segundo), **latência** (quanto tempo é aceitável), **disponibilidade** (quanto de indisponibilidade cabe), **consistência** (o usuário pode ver dado velho?), **durabilidade** (pode perder dado?) e **custo**. Cada resposta elimina alternativas de arquitetura antes mesmo de você desenhar.',
                },
                {
                    type: "table",
                    value: '[["Resposta do requisito não funcional", "O que isso já decide no desenho"], ["Leitura pode ver dado com segundos de atraso", "Abre espaço para réplica de leitura e cache"], ["Nenhuma mensagem pode ser perdida", "Exige escrita replicada e confirmação, não fire and forget"], ["Latência abaixo de 100ms para usuário global", "Exige presença em várias regiões ou CDN"], ["Pico de dez vezes a média em horário nobre", "Exige fila absorvendo pico, não escala só por réplica"], ["Orçamento apertado", "Empurra para menos componentes e serviços gerenciados"]]',
                },
                {
                    type: "text",
                    value: '## Como perguntar sem gastar a sessão inteira\n\nO erro do outro lado existe: gastar quinze minutos perguntando detalhe irrelevante. A saída é perguntar em bloco e propor a resposta você mesmo, deixando o outro corrigir. Em vez de "qual é a escala?", diga: "vou assumir 50 milhões de usuários ativos por dia, cada um mandando 40 mensagens, com pico de três vezes a média no fim do dia. Faz sentido?".\n\nIsso resolve duas coisas de uma vez. Você fixa um número para poder calcular, e mostra que sabe quais números importam. Se a suposição estiver longe do que a pessoa queria, ela corrige, e você ganha a informação sem ter gastado a sessão perguntando.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** requisito **funcional** é o que o sistema faz, e serve para **cortar escopo** para três a cinco itens centrais. Requisito **não funcional** é como ele se comporta, e é o que de fato muda a arquitetura: escala, latência, disponibilidade, consistência, durabilidade e custo. Pergunte **propondo** a suposição, para fixar números sem gastar a sessão.",
                },
            ],
            questions: [
                {
                    statement: 'Em um sistema de chat, "toda mensagem enviada precisa aparecer no histórico" é qual tipo de requisito?',
                    difficulty: "facil",
                    options: [
                        { text: "Funcional, porque descreve um comportamento do sistema.", isCorrect: true },
                        { text: "Não funcional, porque trata de durabilidade do dado.", isCorrect: false },
                        { text: "Não funcional, porque define uma garantia de consistência.", isCorrect: false },
                        { text: "Funcional, porque estabelece um acordo de nível de serviço.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que dois sistemas com a mesma lista de requisitos funcionais podem ter arquiteturas muito diferentes?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque os requisitos não funcionais deles são diferentes.", isCorrect: true },
                        { text: "Porque cada equipe domina um conjunto de tecnologias.", isCorrect: false },
                        { text: "Porque o orçamento é sempre o fator que decide o desenho.", isCorrect: false },
                        { text: "Porque a linguagem de programação limita as opções viáveis.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O requisito diz que a leitura pode mostrar dado com alguns segundos de atraso. O que isso libera no desenho?",
                    difficulty: "medio",
                    options: [
                        { text: "Servir leitura por réplica e por cache.", isCorrect: true },
                        { text: "Dispensar qualquer forma de replicação do banco.", isCorrect: false },
                        { text: "Gravar sem confirmação de escrita no banco primário.", isCorrect: false },
                        { text: "Eliminar a necessidade de balanceador na frente.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual é a melhor forma de tratar a escala quando o enunciado não informa números?",
                    difficulty: "medio",
                    options: [
                        { text: "Propor uma suposição em voz alta e pedir confirmação.", isCorrect: true },
                        { text: "Seguir sem números e desenhar o caso mais genérico possível.", isCorrect: false },
                        { text: "Perguntar item por item até ter todos os dados exatos.", isCorrect: false },
                        { text: "Assumir a maior escala possível, porque cobre os outros casos.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Diante de um enunciado amplo como \"projete um sistema de chat\", qual é o primeiro movimento correto?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cortar o escopo para poucas funcionalidades centrais.", isCorrect: true },
                        { text: "Listar todas as funcionalidades possíveis antes de decidir.", isCorrect: false },
                        { text: "Escolher o banco de dados, que é a decisão mais cara de mudar.", isCorrect: false },
                        { text: "Desenhar o fluxo completo de envio de uma mensagem na tela.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "SLA, SLO e os noves na prática",
            blocks: [
                {
                    type: "text",
                    value: '# SLA, SLO e os noves na prática\n\n"O sistema precisa ser altamente disponível" não é requisito, é desejo. Requisito é número. E o número da disponibilidade tem um jeito próprio de ser escrito, com uma fileira de noves que parece detalhe de marketing e não é: cada nove a mais multiplica por dez o custo e o esforço de operar.\n\nA conversa fica concreta quando você traduz o nove em tempo parado. É a única tradução que faz todo mundo na sala entender o que está sendo pedido.',
                },
                {
                    type: "table",
                    value: '[["Disponibilidade", "Parada por dia", "Parada por mês", "Parada por ano"], ["99% (dois noves)", "14min 24s", "7h 18min", "3d 15h"], ["99,9% (três noves)", "1min 26s", "43min 50s", "8h 46min"], ["99,99% (quatro noves)", "8,6s", "4min 23s", "52min 36s"], ["99,999% (cinco noves)", "0,86s", "26,3s", "5min 15s"]]',
                },
                {
                    type: "text",
                    value: "## Por que cada nove custa tanto\n\nTrês noves ainda cabem em operação humana: alguém é acordado, entra, conserta em meia hora e o mês fecha dentro do acordo. Quatro noves já não cabem: quatro minutos por mês é menos do que o tempo de alguém acordar e abrir o notebook, então a recuperação precisa ser **automática**. Cinco noves exigem que a falha seja absorvida sem ninguém perceber, o que significa redundância em tudo, em mais de uma região, com troca automática e testada.\n\nPor isso a resposta certa quase nunca é o número mais alto. Perguntar \"quanto de indisponibilidade o negócio tolera?\" e ouvir \"algumas horas por ano\" já te dá permissão para um desenho muito mais simples e barato.",
                },
                {
                    type: "quote",
                    value: "**SLI** é o que você mede (por exemplo, o percentual de requisições que respondem em menos de 300ms). **SLO** é a meta interna sobre esse indicador (99,9% delas). **SLA** é o contrato com o cliente, com penalidade se for descumprido, e por isso costuma ser mais frouxo que o SLO.",
                },
                {
                    type: "text",
                    value: '## O SLA é mais frouxo que o SLO de propósito\n\nParece estranho prometer menos do que se persegue, mas é deliberado. Se o contrato promete 99,9% e a meta interna também é 99,9%, qualquer tropeço vira multa. Perseguindo 99,95% internamente, o time tem margem para errar antes de o cliente ter direito a algo.\n\nEssa folga tem nome: **error budget**, o orçamento de erro. Se o SLO é 99,9% ao mês, sobram cerca de 43 minutos de falha por mês para gastar. Enquanto o orçamento não acabou, o time pode arriscar deploy e mudança. Quando acaba, a regra é congelar mudança e gastar o tempo em confiabilidade. É o que impede a discussão entre "entregar rápido" e "manter estável" de virar briga de opinião.',
                },
                {
                    type: "text",
                    value: "## Disponibilidade se multiplica, e é aí que a conta assusta\n\nUma requisição que atravessa cinco serviços em sequência só dá certo se os cinco derem certo. Se cada um tem 99,9%, o resultado não é 99,9%: é 0,999 elevado a cinco, cerca de **99,5%**, quase quatro horas de falha por mês em vez de 44 minutos.\n\nEsse é um dos custos escondidos de quebrar o sistema em muitos serviços, e é um ótimo argumento para usar numa discussão de desenho. Redundância inverte a conta: dois componentes independentes de 99% em paralelo, onde basta um funcionar, entregam 99,99%, porque a falha simultânea é o produto das duas probabilidades de falha.",
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** traduza o nove em **tempo parado** para a conversa ficar concreta. Acima de três noves a recuperação precisa ser automática, e o custo dispara. **SLI** mede, **SLO** é a meta interna, **SLA** é o contrato e vem mais frouxo. A folga entre eles é o **error budget**. Em série a disponibilidade **multiplica** e piora; em paralelo, com redundância, melhora.",
                },
            ],
            questions: [
                {
                    statement: "Aproximadamente quanto tempo de parada por mês permite um SLO de 99,9%?",
                    difficulty: "facil",
                    options: [
                        { text: "Cerca de 44 minutos.", isCorrect: true },
                        { text: "Cerca de 4 minutos e meio.", isCorrect: false },
                        { text: "Cerca de 7 horas.", isCorrect: false },
                        { text: "Cerca de 9 horas.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a diferença entre SLO e SLA?",
                    difficulty: "medio",
                    options: [
                        { text: "O SLO é a meta interna e o SLA é o contrato com penalidade.", isCorrect: true },
                        { text: "O SLO mede o indicador e o SLA define como coletá-lo.", isCorrect: false },
                        { text: "O SLO vale para latência e o SLA vale para disponibilidade.", isCorrect: false },
                        { text: "O SLO é anual e o SLA é apurado mês a mês pelo cliente.", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o error budget quando ele ainda não foi consumido no mês?",
                    difficulty: "medio",
                    options: [
                        { text: "Autoriza o time a arriscar mudanças e deploys.", isCorrect: true },
                        { text: "Obriga o time a congelar mudanças até o mês virar.", isCorrect: false },
                        { text: "Permite renegociar o SLA para um valor mais folgado.", isCorrect: false },
                        { text: "Indica que o SLO foi definido acima do necessário.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma requisição percorre cinco serviços em sequência, cada um com 99,9% de disponibilidade. Qual é a disponibilidade do caminho?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cerca de 99,5%, porque as disponibilidades se multiplicam.", isCorrect: true },
                        { text: "Continua 99,9%, porque é o valor de cada serviço.", isCorrect: false },
                        { text: "Cerca de 99,99%, porque um serviço cobre a falha do outro.", isCorrect: false },
                        { text: "Cerca de 95%, porque cada salto de rede também falha.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que subir de três para quatro noves muda a natureza da operação?",
                    difficulty: "dificil",
                    options: [
                        { text: "A recuperação precisa deixar de ser humana e virar automática.", isCorrect: true },
                        { text: "O contrato passa a exigir presença em mais de uma região do provedor.", isCorrect: false },
                        { text: "O error budget deixa de existir nesse patamar de meta.", isCorrect: false },
                        { text: "A medição passa a exigir instrumentação dentro do cliente.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O roteiro de uma sessão de design",
            blocks: [
                {
                    type: "text",
                    value: "# O roteiro de uma sessão de design\n\nO maior inimigo numa sessão de System Design não é a falta de conhecimento técnico. É a falta de método. Sem roteiro, a conversa vira um passeio: começa pelo banco, pula para o cache, volta para a API, e no fim sobrou muita caixa desenhada e nenhuma justificativa.\n\nO roteiro resolve isso porque impõe uma ordem em que cada etapa alimenta a seguinte. Requisito vira número, número vira dimensionamento, dimensionamento vira desenho, e o desenho é então atacado nos pontos fracos. Quem segue essa ordem consegue defender qualquer caixa que desenhou, porque cada uma apareceu por um motivo declarado antes.",
                },
                {
                    type: "table",
                    value: '[["Etapa", "O que sai dela", "Tempo típico em 45min"], ["Requisitos", "3 a 5 funcionais e os não funcionais com número", "5 a 8 min"], ["Estimativas", "Requisições por segundo, armazenamento, banda", "5 min"], ["Interface e dados", "Endpoints principais e o modelo de dados", "5 min"], ["Desenho de alto nível", "As caixas e o fluxo de uma requisição", "10 min"], ["Aprofundar", "1 ou 2 componentes por dentro", "10 min"], ["Avaliar", "Gargalos, falhas, custo e o que ficou de fora", "5 min"]]',
                },
                {
                    type: "text",
                    value: "## Comece pelo caminho de uma requisição\n\nAo chegar no desenho de alto nível, existe um truque que organiza tudo: em vez de desenhar componentes soltos, siga **uma requisição do começo ao fim**. O usuário abre o app, a chamada sai do celular, resolve o DNS, chega no balanceador, cai numa instância, consulta o cache, erra o cache, vai ao banco, volta.\n\nDesenhado assim, cada caixa entra na tela porque a requisição precisou dela. Ninguém desenha um Kafka no meio do diagrama sem saber quem produz e quem consome, porque o traçado do fluxo não deixa. Depois você repete o exercício para o caminho de escrita, que costuma ser o interessante, e as diferenças entre leitura e escrita aparecem sozinhas.",
                },
                {
                    type: "text",
                    value: '## Aprofundar é onde a avaliação acontece de verdade\n\nO desenho de alto nível quase todo mundo consegue fazer. A parte que separa é o aprofundamento: escolher um ou dois pontos e mostrar que você sabe o que acontece lá dentro. Bons candidatos a aprofundar são o componente com maior carga, o que guarda o dado mais crítico, ou aquele que o próprio requisito não funcional apontou.\n\nSe você não escolher, quem avalia escolhe por você, e normalmente aponta justo o ponto mais desconfortável. Melhor tomar a iniciativa: "o gargalo aqui é a leitura do feed, então quero abrir essa parte". Isso mostra que você sabe onde o sistema dói.',
                },
                {
                    type: "text",
                    value: '## Pense em voz alta e declare o trade-off\n\nUma sessão de design é também uma avaliação de comunicação. Decisão tomada em silêncio não conta, porque ninguém vê o raciocínio. O formato que funciona é sempre o mesmo: **opções, escolha, preço**. "Dá para servir o feed montando na hora da leitura ou pré-montando na escrita. Vou pré-montar, porque a leitura é muito mais frequente. O preço é escrita mais cara e um problema com contas de milhões de seguidores, que eu trato com um caminho separado."\n\nRepare que a frase entrega três coisas: você conhece as alternativas, decidiu com base no requisito, e já sabe onde vai doer. É exatamente o que se espera de quem vai tomar essa decisão na vida real.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** siga o roteiro **requisitos, estimativas, interface e dados, desenho, aprofundar, avaliar**, porque cada etapa alimenta a seguinte. No desenho, trace o **caminho de uma requisição** em vez de espalhar caixas. Escolha você mesmo o que aprofundar. E fale em **opções, escolha, preço**: decisão tomada em silêncio não conta.",
                },
            ],
            questions: [
                {
                    statement: "Por que o roteiro impõe estimativas antes do desenho de alto nível?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque o número é o que dimensiona os componentes.", isCorrect: true },
                        { text: "Porque a estimativa é a parte mais valorizada da avaliação.", isCorrect: false },
                        { text: "Porque sem ela não é possível definir os endpoints da API.", isCorrect: false },
                        { text: "Porque o cálculo precisa ser feito enquanto sobra tempo na sessão.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual é a vantagem de desenhar seguindo o caminho de uma requisição, em vez de posicionar componentes soltos?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada caixa aparece porque a requisição precisou dela.", isCorrect: true },
                        { text: "O diagrama fica visualmente mais organizado e simétrico.", isCorrect: false },
                        { text: "Evita ter que desenhar o caminho de escrita separadamente.", isCorrect: false },
                        { text: "Permite pular a etapa de definição do modelo de dados.", isCorrect: false },
                    ],
                },
                {
                    statement: "Quem deve escolher o componente a ser aprofundado na sessão?",
                    difficulty: "facil",
                    options: [
                        { text: "Você, apontando onde o sistema dói.", isCorrect: true },
                        { text: "Quem avalia, porque conhece o gabarito esperado.", isCorrect: false },
                        { text: "Ninguém: aprofundar todos os componentes por igual é o correto.", isCorrect: false },
                        { text: "A ordem do roteiro, que já define qual componente abrir.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma boa declaração de trade-off precisa conter?",
                    difficulty: "medio",
                    options: [
                        { text: "As opções, a escolha e o preço que ela cobra.", isCorrect: true },
                        { text: "A opção escolhida e as tecnologias que a implementam.", isCorrect: false },
                        { text: "O requisito de origem e a estimativa de carga associada.", isCorrect: false },
                        { text: "O componente afetado e o plano de migração para trocá-lo.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um candidato desenha um diagrama correto, mas em silêncio, explicando só no fim. Qual é o principal prejuízo?",
                    difficulty: "dificil",
                    options: [
                        { text: "O raciocínio por trás de cada escolha não é observado.", isCorrect: true },
                        { text: "O diagrama fica desatualizado em relação à fala final.", isCorrect: false },
                        { text: "Sobra pouco tempo para a etapa de estimativas de carga.", isCorrect: false },
                        { text: "As alternativas descartadas acabam entrando no desenho.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Os erros que reprovam em System Design",
            blocks: [
                {
                    type: "text",
                    value: "# Os erros que reprovam em System Design\n\nExiste um conjunto pequeno de erros que aparece na maioria das sessões mal avaliadas, e quase nenhum deles é falta de conhecimento. São erros de postura e de método, o que é uma boa notícia: dá para eliminar todos conscientemente.\n\nVale ler esta aula como um checklist. No final da trilha, quando você estiver praticando os estudos de caso, volte aqui e confira quantos você cometeu.",
                },
                {
                    type: "text",
                    value: '## Sair desenhando antes de entender\n\nÉ o erro mais comum e o mais caro. O enunciado tem cinco palavras, e em trinta segundos já tem um banco e um balanceador na tela. O problema é que tudo o que vem depois fica preso a um sistema imaginado, não ao pedido.\n\nO antídoto é mecânico: nada de caixa antes de ter os requisitos funcionais cortados e pelo menos um número de escala na mão. Se der vontade de desenhar, desenhe a lista de requisitos.',
                },
                {
                    type: "text",
                    value: '## Over-engineering e a lista de tecnologias\n\nO segundo erro é encher o desenho de componentes que o requisito não pediu. Kafka, Elasticsearch, service mesh, CQRS e event sourcing num sistema com dez mil usuários. Quem avalia lê isso como "essa pessoa vai me criar um problema operacional que ninguém pediu".\n\nO parente próximo é responder com marca em vez de conceito: dizer "uso Redis" quando a pergunta era por que cachear, e o que fazer quando o cache invalida. A ordem certa é conceito primeiro, marca depois e só se perguntarem: "preciso de um cache em memória compartilhado entre as instâncias, na prática um Redis".',
                },
                {
                    type: "table",
                    value: '[["Erro", "Como soa para quem avalia", "O que fazer no lugar"], ["Desenhar antes de perguntar", "Não escuta o problema", "Cortar escopo e fixar um número primeiro"], ["Encher de componentes", "Vai gerar custo e plantão à toa", "Justificar cada caixa por um requisito"], ["Responder com marca", "Decorou ferramenta, não entende o problema", "Conceito primeiro, produto depois"], ["Ignorar falha", "Só pensou no caso feliz", "Dizer o que acontece quando a peça cai"], ["Não citar número", "Não sabe dimensionar", "Trazer requisições por segundo e volume de dado"]]',
                },
                {
                    type: "text",
                    value: '## Esquecer que as coisas quebram\n\nDesenhos de caso feliz são fáceis de reconhecer: uma única caixa de cada tipo, nenhuma menção a falha, nenhuma palavra sobre o que acontece se o banco cair no meio de uma escrita. Em 2026 essa omissão pesa mais do que pesava, porque o mercado passou a cobrar julgamento operacional.\n\nUm hábito simples resolve: ao terminar o desenho, aponte para cada componente e responda em voz alta "se este aqui cair agora, o que o usuário vê?". As respostas viram réplica, timeout, retry com backoff, circuit breaker e degradação graciosa. Você não precisa ter tudo isso desenhado, precisa mostrar que sabe onde entra.',
                },
                {
                    type: "text",
                    value: '## Defender demais a primeira ideia\n\nQuando alguém questiona sua escolha, existem duas reações ruins: mudar de ideia na hora, ao menor empurrão, ou insistir sem argumento. As duas passam a mesma impressão, a de que a decisão original não tinha base.\n\nA reação boa é tratar a pergunta como informação nova. "Se a leitura for muito maior do que eu supus, aí o pré-cálculo na escrita compensa mesmo. Vou mudar por causa disso." Mudar com motivo declarado é sinal de senioridade. Mudar porque alguém franziu a testa, não.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** os erros que mais reprovam são de método, não de conhecimento: **desenhar antes de entender**, **encher o desenho** de componentes não pedidos, **responder com marca** em vez de conceito, **ignorar falha** e **defender ou abandonar** a primeira ideia sem argumento. Ao fechar o desenho, pergunte de cada peça: se cair agora, o que o usuário vê?",
                },
            ],
            questions: [
                {
                    statement: "Qual é o antídoto para o erro de sair desenhando antes de entender o problema?",
                    difficulty: "facil",
                    options: [
                        { text: "Só desenhar depois de cortar escopo e fixar um número.", isCorrect: true },
                        { text: "Desenhar em rascunho e apagar tudo ao final da etapa.", isCorrect: false },
                        { text: "Começar sempre pelo banco, que é a decisão mais cara.", isCorrect: false },
                        { text: "Pedir que quem avalia liste os requisitos por escrito antes.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um candidato inclui Kafka, Elasticsearch e service mesh num sistema de dez mil usuários. Como isso é lido?",
                    difficulty: "medio",
                    options: [
                        { text: "Como custo e plantão criados sem requisito que peça.", isCorrect: true },
                        { text: "Como domínio de ferramentas modernas de mercado.", isCorrect: false },
                        { text: "Como preparo para um crescimento futuro do produto.", isCorrect: false },
                        { text: "Como falta de conhecimento das alternativas mais simples.", isCorrect: false },
                    ],
                },
                {
                    statement: 'Qual é a ordem correta ao responder "como você resolveria a leitura repetida"?',
                    difficulty: "medio",
                    options: [
                        { text: "Explicar o conceito e só então citar o produto.", isCorrect: true },
                        { text: "Citar o produto e detalhar sua configuração recomendada.", isCorrect: false },
                        { text: "Comparar os produtos disponíveis e escolher o mais usado.", isCorrect: false },
                        { text: "Perguntar qual produto a empresa já usa hoje em produção.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual hábito ajuda a não entregar um desenho de caso feliz?",
                    difficulty: "medio",
                    options: [
                        { text: 'Perguntar de cada peça: se cair agora, o que o usuário vê?', isCorrect: true },
                        { text: "Duplicar todos os componentes desenhados no diagrama.", isCorrect: false },
                        { text: "Adicionar um circuit breaker entre cada par de serviços.", isCorrect: false },
                        { text: "Reservar os últimos minutos para desenhar o plano de backup.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Quem avalia questiona uma escolha sua. Qual reação demonstra senioridade?",
                    difficulty: "dificil",
                    options: [
                        { text: "Mudar apenas se houver um motivo novo, e declará-lo.", isCorrect: true },
                        { text: "Manter a escolha, já que ela foi justificada antes.", isCorrect: false },
                        { text: "Trocar pela alternativa sugerida, que veio de quem avalia.", isCorrect: false },
                        { text: "Apresentar as duas opções e deixar a decisão em aberto.", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Estimativas de capacidade",
    aulas: [
        {
            titulo: "Ordens de grandeza e os números que valem decorar",
            blocks: [
                {
                    type: "text",
                    value: "# Ordens de grandeza\n\nA conta de guardanapo assusta quem nunca fez, e é a parte mais simples da trilha, porque ninguém espera precisão. Espera-se **ordem de grandeza**: saber se o resultado dá mil ou um milhão, gigabyte ou petabyte. Errar por 20% não muda decisão nenhuma. Errar por mil vezes muda tudo, porque leva a comprar uma arquitetura que o problema não pede, ou a subestimar uma que ele exige.\n\nPor isso a regra número um é arredondar sem dó. Um dia tem 86.400 segundos, e todo mundo usa **100 mil**. Um mês tem 30 dias, um ano tem 365 e vira 400 quando conveniente. O erro que isso introduz é irrelevante perto da decisão que a conta vai apoiar.",
                },
                {
                    type: "table",
                    value: '[["Arredondamento", "Valor real", "O que usar"], ["Segundos por dia", "86.400", "100 mil"], ["Dias por mês", "30 ou 31", "30"], ["Dias por ano", "365", "400 quando facilitar"], ["Kilo, mega, giga, tera", "2^10, 2^20, 2^30, 2^40", "mil, milhão, bilhão, trilhão"], ["Caractere ASCII", "1 byte", "1 byte"], ["UUID", "16 bytes binário, 36 texto", "16 bytes"]]',
                },
                {
                    type: "text",
                    value: "## Os números de latência que mudam decisão\n\nExiste uma tabela clássica de latências que vale carregar na cabeça, não para recitar, mas porque ela responde sozinha várias perguntas de desenho. O ponto não são os valores exatos: é a **distância entre eles**.\n\nLer da memória é da ordem de 100 nanossegundos. Ler de SSD é da ordem de 100 microssegundos, mil vezes mais. Uma ida e volta de rede no mesmo datacenter é da ordem de 500 microssegundos. Atravessar o Atlântico é da ordem de 150 milissegundos, cem mil vezes a leitura de memória. É por isso que cache em memória compensa tanto, e por isso que servir usuário europeu a partir de um datacenter na Virgínia é uma decisão de arquitetura, não um detalhe.",
                },
                {
                    type: "table",
                    value: '[["Operação", "Ordem de grandeza", "Comparando com memória"], ["Leitura de memória", "100 nanossegundos", "1x"], ["Leitura de SSD", "100 microssegundos", "1.000x"], ["Ida e volta no mesmo datacenter", "500 microssegundos", "5.000x"], ["Leitura de disco rígido", "10 milissegundos", "100.000x"], ["Ida e volta entre continentes", "150 milissegundos", "1.500.000x"]]',
                },
                {
                    type: "text",
                    value: "## Média não descreve carga, e é aí que muita gente erra\n\nDividir o total do dia pelos 100 mil segundos dá a média, e nenhum sistema real vive na média. Existe hora de pico, e existe evento. Um app social brasileiro tem pico no início da noite; um sistema de ingressos tem pico de mil vezes a média no minuto em que a venda abre.\n\nA convenção prática é dimensionar o caminho crítico para o **pico**, usando um multiplicador declarado. Duas a três vezes a média cobre a variação diária normal. Dez vezes ou mais é evento, e evento não se resolve comprando máquina: se resolve com fila absorvendo a entrada, ou com limitação de taxa, ou com sala de espera. Dizer isso em voz alta na sessão vale mais do que a conta em si.",
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** o alvo é **ordem de grandeza**, não precisão, então arredonde: o dia tem **100 mil segundos**. Guarde a distância entre as latências (memória, SSD, rede local, disco, intercontinental), porque é ela que justifica cache e presença regional. E nunca dimensione pela média: declare um **multiplicador de pico**, lembrando que pico de dez vezes ou mais se resolve com fila e limitação, não com máquina maior.",
                },
            ],
            questions: [
                {
                    statement: "Qual arredondamento é convenção na conta de guardanapo para os segundos de um dia?",
                    difficulty: "facil",
                    options: [
                        { text: "100 mil segundos.", isCorrect: true },
                        { text: "86.400 segundos, sem arredondar.", isCorrect: false },
                        { text: "50 mil segundos.", isCorrect: false },
                        { text: "1 milhão de segundos.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a precisão importa pouco numa estimativa de capacidade?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque só a ordem de grandeza muda a decisão de desenho.", isCorrect: true },
                        { text: "Porque o número real será medido depois, em produção.", isCorrect: false },
                        { text: "Porque quem avalia não confere a aritmética apresentada.", isCorrect: false },
                        { text: "Porque a carga varia demais para qualquer conta se sustentar.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Aproximadamente quantas vezes mais lenta que uma leitura de memória é uma ida e volta entre continentes?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cerca de um milhão de vezes.", isCorrect: true },
                        { text: "Cerca de mil vezes.", isCorrect: false },
                        { text: "Cerca de cem vezes.", isCorrect: false },
                        { text: "Cerca de dez bilhões de vezes.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual decisão de arquitetura a distância entre as latências justifica de forma mais direta?",
                    difficulty: "medio",
                    options: [
                        { text: "Cachear em memória e ficar perto do usuário.", isCorrect: true },
                        { text: "Trocar o banco relacional por um não relacional.", isCorrect: false },
                        { text: "Quebrar o monólito em serviços independentes.", isCorrect: false },
                        { text: "Usar disco rígido no lugar de SSD por causa do custo.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um sistema de venda de ingressos espera pico de mil vezes a média no minuto de abertura. Qual é a resposta correta de desenho?",
                    difficulty: "dificil",
                    options: [
                        { text: "Absorver com fila, limitação de taxa e sala de espera.", isCorrect: true },
                        { text: "Dimensionar as máquinas para o pico e mantê-las ligadas.", isCorrect: false },
                        { text: "Escalar na horizontal automaticamente ao detectar a carga.", isCorrect: false },
                        { text: "Servir a página de compra por CDN para aliviar o servidor.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Estimando requisições por segundo",
            blocks: [
                {
                    type: "text",
                    value: "# Estimando requisições por segundo\n\nRequisições por segundo, ou RPS, é o número que abre todas as outras contas. Ele diz quantas máquinas atendem a carga, se o banco aguenta sozinho, e se a leitura precisa de cache. E sai de uma cadeia curta e sempre igual: **usuários ativos por dia, ações por usuário, segundos do dia, multiplicador de pico**.\n\nO truque é enunciar cada elo em voz alta enquanto calcula. Quem escuta consegue corrigir uma suposição no meio, e o resultado passa a ser um número acordado, não um chute seu.",
                },
                {
                    type: "code",
                    value: "Cadeia da conta:\n\n  RPS medio = (usuarios ativos por dia x acoes por usuario) / 100.000\n  RPS de pico = RPS medio x multiplicador de pico\n\nExemplo, uma rede social:\n\n  50.000.000 usuarios ativos por dia\n  x 20 leituras de feed por usuario\n  = 1.000.000.000 leituras por dia\n\n  1.000.000.000 / 100.000 = 10.000 leituras por segundo (media)\n  10.000 x 3 (pico da noite)  = 30.000 leituras por segundo (pico)",
                },
                {
                    type: "text",
                    value: "## Separe leitura de escrita desde o começo\n\nEssa é a parte que mais rende na conversa. Quase todo sistema de consumo tem muito mais leitura do que escrita, e a proporção entre as duas é o que decide o desenho.\n\nNa mesma rede social: 50 milhões de pessoas leem 20 vezes por dia, mas talvez só 2 milhões publiquem, uma vez por dia. Isso dá 1 bilhão de leituras contra 2 milhões de escritas, uma proporção de **500 para 1**. Com essa proporção na mão, cache de leitura e réplicas deixam de ser opinião e viram consequência. Se a proporção fosse 2 para 1, como num sistema de coleta de eventos, o desenho seria outro: o gargalo estaria na escrita, e a conversa iria para particionamento e escrita em lote.",
                },
                {
                    type: "table",
                    value: '[["Proporção leitura/escrita", "Exemplo típico", "Para onde o desenho vai"], ["500 para 1", "Rede social, portal de notícia", "Cache agressivo, réplicas de leitura, CDN"], ["10 para 1", "Comércio eletrônico", "Cache do catálogo, banco primário para pedido"], ["2 para 1", "Coleta de eventos, telemetria", "Escrita em lote, particionamento, banco de série temporal"], ["1 para 10", "Ingestão de sensores", "Fila na entrada, escrita sequencial, agregação"]]',
                },
                {
                    type: "text",
                    value: "## Do RPS para o número de máquinas\n\nCom o RPS de pico, dá para estimar a frota. Uma instância de aplicação bem comportada, com resposta rápida e sem trabalho pesado, atende de forma conservadora algo entre 1.000 e 5.000 requisições por segundo. Use mil para ficar seguro e declare a suposição.\n\n30 mil requisições por segundo dividido por mil dá 30 instâncias. Some folga para falha e para deploy, e vire 40. Esse número tem uma virtude enorme: torna concreta a conversa sobre custo, e mostra na hora se o desenho é razoável. Se a conta der 4.000 instâncias, alguma suposição está errada ou o desenho precisa mudar de estratégia, não de tamanho.",
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** RPS sai de **usuários ativos por dia x ações por usuário / 100 mil**, multiplicado pelo **pico**. Calcule **leitura e escrita separadamente**: a proporção entre elas é o que decide se o desenho vai para cache e réplica ou para particionamento e escrita em lote. Do RPS de pico saem as instâncias, assumindo mil requisições por segundo por instância, mais folga.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um sistema tem 20 milhões de usuários ativos por dia, cada um fazendo 5 buscas. Qual é o RPS médio aproximado?",
                    difficulty: "medio",
                    options: [
                        { text: "Cerca de 1.000 por segundo.", isCorrect: true },
                        { text: "Cerca de 100 por segundo.", isCorrect: false },
                        { text: "Cerca de 10.000 por segundo.", isCorrect: false },
                        { text: "Cerca de 100.000 por segundo.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que calcular leitura e escrita separadamente muda o desenho?",
                    difficulty: "medio",
                    options: [
                        { text: "A proporção entre elas aponta onde fica o gargalo.", isCorrect: true },
                        { text: "A escrita sempre custa mais caro do que a leitura em nuvem.", isCorrect: false },
                        { text: "Só a escrita precisa ser dimensionada para o horário de pico.", isCorrect: false },
                        { text: "O banco cobra por operação e separa as duas na fatura mensal.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um sistema de telemetria tem proporção de 1 leitura para 10 escritas. Para onde o desenho tende?",
                    difficulty: "dificil",
                    options: [
                        { text: "Fila na entrada, escrita sequencial e agregação.", isCorrect: true },
                        { text: "Cache agressivo e réplicas de leitura na frente do banco.", isCorrect: false },
                        { text: "CDN para servir o conteúdo mais requisitado na borda.", isCorrect: false },
                        { text: "Índice de busca dedicado para acelerar as consultas.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Assumindo 1.000 requisições por segundo por instância, quantas instâncias atendem um pico de 30 mil?",
                    difficulty: "facil",
                    options: [
                        { text: "Cerca de 30, mais folga para falha e deploy.", isCorrect: true },
                        { text: "Cerca de 3, porque o pico dura pouco tempo.", isCorrect: false },
                        { text: "Cerca de 300, contando a margem de segurança.", isCorrect: false },
                        { text: "Cerca de 3.000, uma por cada dez requisições.", isCorrect: false },
                    ],
                },
                {
                    statement: "A estimativa de frota resulta em 4.000 instâncias. Qual é a leitura correta desse número?",
                    difficulty: "dificil",
                    options: [
                        { text: "Alguma suposição está errada ou a estratégia precisa mudar.", isCorrect: true },
                        { text: "O desenho está certo e o custo é inerente àquela escala.", isCorrect: false },
                        { text: "Basta aumentar o tamanho de cada instância para reduzir a conta.", isCorrect: false },
                        { text: "O multiplicador de pico deveria ter sido aplicado no final.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Estimando armazenamento",
            blocks: [
                {
                    type: "text",
                    value: "# Estimando armazenamento\n\nA conta de armazenamento responde perguntas que o RPS não responde: cabe num banco só? Precisa particionar? Quanto custa guardar isso por cinco anos? E ela tem uma característica que assusta na primeira vez: o resultado **acumula**. RPS é uma foto, armazenamento é um filme.\n\nA cadeia é igual à do RPS até certo ponto, e depois multiplica pelo tempo de retenção: **escritas por dia x tamanho de cada registro x dias guardados**.",
                },
                {
                    type: "code",
                    value: "Exemplo, o mesmo sistema de rede social:\n\n  2.000.000 publicacoes por dia\n  x 1 KB por publicacao (texto + metadados)\n  = 2 GB por dia\n\n  2 GB x 400 dias   = 800 GB por ano\n  800 GB x 5 anos   = 4 TB em cinco anos\n\nAgora com imagem, 20% das publicacoes com uma foto de 300 KB:\n\n  400.000 fotos por dia x 300 KB = 120 GB por dia\n  120 GB x 400 x 5               = 240 TB em cinco anos",
                },
                {
                    type: "text",
                    value: "## O tamanho do registro é onde mora o erro\n\nA parte que mais erra é o tamanho de cada linha. Uma publicação não é só o texto: tem identificador, autor, data, contadores, índices. A regra prática é somar os campos, arredondar para cima e declarar. Um registro de texto curto com metadados fica na casa de 1 KB. Um evento de telemetria fica na casa de 100 bytes a 1 KB. Uma linha de log fica na casa de 500 bytes.\n\nE existe um multiplicador que quase todo mundo esquece: **índice e réplica**. Índices costumam somar de 20% a 100% do tamanho dos dados. Replicação de três cópias triplica tudo. Quatro terabytes de dado viram doze terabytes de disco comprado, e é esse o número que vira custo.",
                },
                {
                    type: "table",
                    value: '[["Tipo de dado", "Tamanho típico por registro", "Observação"], ["Publicação de texto com metadados", "1 KB", "O texto é a menor parte"], ["Evento de telemetria", "100 bytes a 1 KB", "Muitos por segundo, cada um pequeno"], ["Linha de log", "500 bytes", "Retenção curta resolve o volume"], ["Foto comprimida", "200 a 500 KB", "Vai para blob, não para o banco"], ["Minuto de vídeo em 1080p", "50 MB", "Domina qualquer outra conta"]]',
                },
                {
                    type: "text",
                    value: "## Retenção é decisão de produto, e é a alavanca mais forte\n\nQuando a conta de armazenamento dá um número desconfortável, a primeira reação costuma ser técnica: comprimir, particionar, trocar de banco. Existe uma alavanca mais barata antes dessas: **guardar menos tempo**.\n\nLog bruto de sete dias e agregado depois. Vídeo em resolução original por 30 dias e só a versão transcodificada depois. Dado quente no banco e dado frio movido para armazenamento de arquivo, que custa uma fração. Trazer essa possibilidade para a mesa mostra que você entende que armazenamento é decisão de produto e de custo, não só de tecnologia.",
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** armazenamento **acumula**: escritas por dia x tamanho do registro x dias de retenção. Some **índice e réplica** ao resultado, que facilmente triplicam o disco comprado. Mídia domina qualquer conta e vai para blob, não para o banco. E antes de otimizar tecnicamente, negocie **retenção**, que é a alavanca mais barata.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um sistema grava 5 milhões de registros por dia, de 1 KB cada. Quanto isso acumula em um ano, aproximadamente?",
                    difficulty: "medio",
                    options: [
                        { text: "Cerca de 2 TB.", isCorrect: true },
                        { text: "Cerca de 5 GB.", isCorrect: false },
                        { text: "Cerca de 200 GB.", isCorrect: false },
                        { text: "Cerca de 20 TB.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que costuma ficar de fora e faz a estimativa de disco ficar abaixo do real?",
                    difficulty: "medio",
                    options: [
                        { text: "O espaço de índices e das réplicas.", isCorrect: true },
                        { text: "O espaço ocupado pelo sistema operacional das máquinas.", isCorrect: false },
                        { text: "O crescimento anual do número de usuários do produto.", isCorrect: false },
                        { text: "O custo de transferência de dados entre regiões da nuvem.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que mídia costuma dominar a conta de armazenamento?",
                    difficulty: "facil",
                    options: [
                        { text: "Um arquivo é ordens de grandeza maior que um registro.", isCorrect: true },
                        { text: "Mídia precisa ser replicada mais vezes que dado estruturado.", isCorrect: false },
                        { text: "Arquivos não podem ser comprimidos como texto pode.", isCorrect: false },
                        { text: "O banco relacional guarda mídia de forma pouco eficiente.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "A estimativa de armazenamento deu um número alto demais. Qual é a alavanca mais barata a considerar primeiro?",
                    difficulty: "medio",
                    options: [
                        { text: "Reduzir o tempo de retenção do dado.", isCorrect: true },
                        { text: "Comprimir os registros antes de gravar no banco.", isCorrect: false },
                        { text: "Particionar a tabela entre vários bancos menores.", isCorrect: false },
                        { text: "Trocar o banco relacional por um de série temporal.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a diferença de natureza entre a conta de RPS e a de armazenamento?",
                    difficulty: "dificil",
                    options: [
                        { text: "RPS é instantâneo e armazenamento acumula no tempo.", isCorrect: true },
                        { text: "RPS depende do pico e armazenamento depende só da média.", isCorrect: false },
                        { text: "RPS dimensiona o banco e armazenamento dimensiona a frota.", isCorrect: false },
                        { text: "RPS é medido em produção e armazenamento só é estimado.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Banda e memória de cache",
            blocks: [
                {
                    type: "text",
                    value: "# Banda e memória de cache\n\nDuas contas fecham o conjunto. A de **banda** diz quanto dado atravessa a rede por segundo, e é ela que aponta quando a CDN deixa de ser luxo. A de **memória de cache** diz quanta RAM comprar para o cache fazer efeito, e é ela que impede a resposta preguiçosa de \"boto um Redis\".\n\nAs duas saem de números que você já calculou, então são rápidas. E as duas costumam ser esquecidas, o que faz delas uma boa forma de se destacar.",
                },
                {
                    type: "code",
                    value: "Banda = RPS x tamanho medio da resposta\n\n  Leitura de feed: 30.000 RPS de pico x 20 KB por resposta\n  = 600.000 KB/s = 600 MB/s = cerca de 4,8 Gbps de saida\n\nCom imagem servida pelo mesmo caminho:\n\n  30.000 RPS x 300 KB = 9.000 MB/s = cerca de 72 Gbps\n  Nesse patamar a imagem sai da aplicacao e vai para CDN.",
                },
                {
                    type: "text",
                    value: "## O limiar em que a CDN entra\n\nA conta acima mostra o ponto sem precisar de opinião. Servir texto a 4,8 Gbps é caro, mas cabe numa frota. Servir mídia a 72 Gbps a partir das suas máquinas é jogar dinheiro fora, porque aquele mesmo byte vai sair repetido para milhares de pessoas, sem nenhuma personalização.\n\nA regra que sai disso é simples e vale dizer em voz alta: **conteúdo estático e repetido sai pela borda; conteúdo personalizado sai pela aplicação**. A CDN não é só velocidade, é principalmente banda e custo. E ela muda a conta de frota também: tirar mídia do caminho pode reduzir o número de instâncias mais do que qualquer otimização de código.",
                },
                {
                    type: "text",
                    value: '## Quanta memória o cache precisa\n\nCache só ajuda se o que está nele for pedido de novo. A pergunta certa não é "quanto cabe", é "qual fatia do dado responde pela maior parte dos acessos". Na prática, a distribuição de acesso costuma ser bem desigual, e uma regra de bolso muito usada é a de que **20% do conteúdo responde por 80% dos acessos**.\n\nEntão a conta é: pegue o conjunto quente, some o tamanho dele, e essa é a memória alvo. Se são 100 milhões de publicações de 1 KB, o total é 100 GB; os 20% quentes são 20 GB, que cabem confortavelmente em memória distribuída. Se o conjunto quente desse 5 TB, cache em memória sairia caro e a conversa mudaria para cache em disco, ou para cachear só o resultado agregado em vez do dado bruto.',
                },
                {
                    type: "table",
                    value: '[["Conta", "Fórmula", "O que ela decide"], ["Banda de saída", "RPS x tamanho da resposta", "Se entra CDN e quanto custa a saída"], ["Memória de cache", "Tamanho do conjunto quente", "Se o cache cabe em RAM"], ["Taxa de acerto", "Acertos / total de buscas", "Se o cache está valendo a pena"], ["Carga aliviada", "RPS x taxa de acerto", "Quanto o banco deixa de receber"]]',
                },
                {
                    type: "text",
                    value: "## Termine sempre dizendo o que o cache alivia\n\nA conta só fica completa quando você fecha o ciclo. Com 30 mil leituras por segundo e uma taxa de acerto de 90%, o banco recebe 3 mil por segundo em vez de 30 mil. Esse número é o que decide se o banco primário aguenta sozinho ou se precisa de réplicas.\n\nE vale declarar a fragilidade junto: se a taxa de acerto cair, por exemplo depois de um deploy que limpou o cache, o banco recebe as 30 mil de uma vez. Esse é o cenário de **avalanche de cache**, e mencioná-lo mostra justamente o julgamento operacional que a régua atual cobra.",
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** **banda = RPS x tamanho da resposta**, e é ela que mostra o limiar em que mídia precisa sair pela **CDN**. A memória de cache sai do **conjunto quente**, não do dado total. Feche a conta dizendo quanto o cache **alivia** o banco, e cite a **avalanche** que acontece quando a taxa de acerto despenca.",
                },
            ],
            questions: [
                {
                    statement: "Como se estima a banda de saída de um serviço?",
                    difficulty: "facil",
                    options: [
                        { text: "Multiplicando o RPS pelo tamanho médio da resposta.", isCorrect: true },
                        { text: "Multiplicando o número de usuários pelo tempo de sessão.", isCorrect: false },
                        { text: "Dividindo o volume diário de dados pelos segundos do dia.", isCorrect: false },
                        { text: "Somando o tamanho do banco ao tamanho do cache em memória.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual regra decide o que deve ser servido pela borda em vez de pela aplicação?",
                    difficulty: "medio",
                    options: [
                        { text: "Conteúdo estático e repetido sai pela borda.", isCorrect: true },
                        { text: "Todo conteúdo maior que 100 KB sai pela borda.", isCorrect: false },
                        { text: "Conteúdo de leitura sai pela borda e escrita pela aplicação.", isCorrect: false },
                        { text: "Conteúdo com mais de mil acessos por dia sai pela borda.", isCorrect: false },
                    ],
                },
                {
                    statement: "Sobre qual conjunto se dimensiona a memória de um cache?",
                    difficulty: "medio",
                    options: [
                        { text: "Sobre o conjunto quente, a fatia mais acessada.", isCorrect: true },
                        { text: "Sobre o total de dados guardados no banco primário.", isCorrect: false },
                        { text: "Sobre o volume gravado por dia pela aplicação.", isCorrect: false },
                        { text: "Sobre o pico de requisições por segundo do sistema.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Com 30 mil leituras por segundo e taxa de acerto de 90%, quantas chegam ao banco?",
                    difficulty: "medio",
                    options: [
                        { text: "Cerca de 3 mil por segundo.", isCorrect: true },
                        { text: "Cerca de 27 mil por segundo.", isCorrect: false },
                        { text: "Cerca de 300 por segundo.", isCorrect: false },
                        { text: "Continuam 30 mil por segundo.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece quando um deploy esvazia o cache de um sistema com alta taxa de acerto?",
                    difficulty: "dificil",
                    options: [
                        { text: "A carga inteira cai de uma vez sobre o banco.", isCorrect: true },
                        { text: "A latência sobe, mas a carga no banco continua igual.", isCorrect: false },
                        { text: "O cache se reconstrói antes de receber tráfego real.", isCorrect: false },
                        { text: "A taxa de acerto se recupera sozinha em poucos segundos.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Do número ao desenho",
            blocks: [
                {
                    type: "text",
                    value: "# Do número ao desenho\n\nA conta não vale nada se ficar num canto do quadro. Ela existe para **eliminar alternativas**, e essa é a habilidade que fecha o módulo: olhar o resultado e dizer o que ele acabou de proibir ou de autorizar.\n\nExiste um punhado de limiares que se repetem, e conhecer a ordem de grandeza deles é o que permite ler o próprio número com segurança.",
                },
                {
                    type: "table",
                    value: '[["Resultado da conta", "O que ele autoriza ou exige"], ["Menos de 1.000 RPS", "Uma instância e um banco resolvem; não invente componente"], ["Dezenas de milhares de RPS de leitura", "Cache e réplicas de leitura viram obrigatórios"], ["Dezenas de milhares de RPS de escrita", "Particionamento e escrita em lote entram na mesa"], ["Menos de 1 TB de dado", "Cabe num banco só, sem sharding"], ["Dezenas de TB ou mais", "Sharding, arquivamento e retenção viram tema central"], ["Dezenas de Gbps de saída", "CDN deixa de ser opcional"]]',
                },
                {
                    type: "text",
                    value: '## Use o número para dizer não\n\nO uso mais valioso da estimativa não é justificar o que você quer fazer, é **descartar** o que não precisa. "São 300 requisições por segundo e 40 GB de dado. Isso cabe numa instância e num Postgres com réplica. Não vou colocar fila nem sharding aqui, porque não há carga que justifique."\n\nEssa frase costuma valer mais do que um diagrama cheio. Ela mostra que você sabe que complexidade tem preço e que só se paga esse preço quando o número manda. É exatamente o contrário do erro de over-engineering visto no módulo 1.',
                },
                {
                    type: "text",
                    value: "## Quando o número muda, o desenho muda\n\nUm exercício que rende muito é refazer a conta com uma suposição diferente e ver o desenho se mexer. Pegue o mesmo sistema e multiplique os usuários por cem: o que quebra primeiro?\n\nQuase sempre a resposta é o banco, e quase sempre na leitura antes da escrita. Depois vem a banda, se houver mídia. Depois vem o tempo de reconstruir estado após uma falha. Saber essa ordem permite responder a pergunta que quase sempre vem no fim da sessão: \"e se crescer dez vezes?\". A resposta boa não é \"escalo horizontalmente\", é \"o primeiro a quebrar seria a leitura do banco, e o passo seria réplica mais cache; o segundo seria a saída de mídia, e o passo seria CDN\".",
                },
                {
                    type: "text",
                    value: '## Custo é parte da resposta, não um extra\n\nA régua de 2026 cobra custo explicitamente. Você não precisa saber a tabela de preços de cabeça, precisa saber **onde o dinheiro vai**: máquinas, armazenamento, saída de rede e serviços gerenciados. Saída de rede costuma ser a surpresa desagradável, porque é cobrada por byte que sai da nuvem, o que reforça de novo o argumento da CDN.\n\nUma frase de fechamento que funciona bem: "o desenho tem 40 instâncias, 12 TB replicados e mídia por CDN. O maior item de custo aqui é a saída de dado, então a primeira otimização de custo seria aumentar o tempo de cache na borda, não reduzir instâncias."',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** a conta serve para **eliminar alternativas**, e o uso mais valioso dela é **dizer não** ao componente que a carga não justifica. Conheça os limiares de ordem de grandeza. Saiba a ordem em que as coisas quebram quando a escala cresce, porque é a resposta para \"e se crescer dez vezes?\". E trate **custo** como parte do desenho, lembrando que saída de rede costuma ser o item que surpreende.",
                },
            ],
            questions: [
                {
                    statement: "A conta resultou em 300 RPS e 40 GB de dado. Qual é a conclusão de desenho correta?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma instância e um banco com réplica bastam.", isCorrect: true },
                        { text: "Já vale particionar o banco para preparar o crescimento.", isCorrect: false },
                        { text: "Convém colocar uma fila entre a aplicação e o banco.", isCorrect: false },
                        { text: "É preciso cache distribuído para garantir a latência.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o uso mais valioso de uma estimativa numa sessão de design?",
                    difficulty: "medio",
                    options: [
                        { text: "Descartar componentes que a carga não justifica.", isCorrect: true },
                        { text: "Demonstrar domínio de aritmética sob pressão.", isCorrect: false },
                        { text: "Justificar a escolha de tecnologia já decidida antes.", isCorrect: false },
                        { text: "Definir o orçamento mensal do sistema em nuvem.", isCorrect: false },
                    ],
                },
                {
                    statement: 'Ao ser perguntado "e se crescer dez vezes?", qual resposta é mais forte?',
                    difficulty: "dificil",
                    options: [
                        { text: "Dizer o que quebra primeiro e o passo que resolve.", isCorrect: true },
                        { text: "Afirmar que o desenho escala horizontalmente sem mudança.", isCorrect: false },
                        { text: "Refazer todas as estimativas com os novos números na hora.", isCorrect: false },
                        { text: "Apontar que a arquitetura já foi dimensionada com folga.", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um sistema com muita mídia, qual costuma ser o item de custo que surpreende?",
                    difficulty: "medio",
                    options: [
                        { text: "A saída de dados da nuvem.", isCorrect: true },
                        { text: "O número de instâncias de aplicação em execução.", isCorrect: false },
                        { text: "O armazenamento em disco dos arquivos originais.", isCorrect: false },
                        { text: "As licenças dos serviços gerenciados contratados.", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando a escala de um sistema de consumo cresce muito, o que costuma quebrar primeiro?",
                    difficulty: "dificil",
                    options: [
                        { text: "A leitura do banco.", isCorrect: true },
                        { text: "A escrita no banco primário.", isCorrect: false },
                        { text: "A memória das instâncias de aplicação.", isCorrect: false },
                        { text: "O tempo de resposta do balanceador de carga.", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Os blocos de construção",
    aulas: [
        {
            titulo: "DNS e o caminho até o servidor",
            blocks: [
                {
                    type: "text",
                    value: "# DNS e o caminho até o servidor\n\nTodo desenho começa com uma seta saindo do usuário, e quase todo mundo desenha essa seta chegando direto no balanceador. Entre um ponto e outro existe uma peça que resolve problemas de arquitetura reais, e que aparece com frequência nas perguntas de aprofundamento: o **DNS**.\n\nO DNS traduz nome em endereço, e essa é a parte que todo mundo sabe. O que interessa aqui é o que se pode fazer **durante** essa tradução, porque é o primeiro ponto do sistema em que dá para tomar decisão sobre para onde o usuário vai.",
                },
                {
                    type: "quote",
                    value: "O **DNS** resolve um nome em um ou mais endereços IP. A resposta vem com um **TTL**, o tempo que ela pode ficar guardada em cache pelo resolvedor e pelo cliente. Esse TTL é o que decide quanto tempo uma mudança leva para valer no mundo inteiro.",
                },
                {
                    type: "text",
                    value: "## O que dá para decidir na resolução\n\nComo o DNS pode responder coisas diferentes para clientes diferentes, ele vira uma ferramenta de roteamento global. Três usos aparecem sempre:\n\n**Balanceamento simples**, devolvendo vários endereços e alternando a ordem. É barato e funciona, mas não sabe se a máquina está viva. **Roteamento por proximidade**, devolvendo o endereço da região mais perto de quem perguntou, que é a base de servir usuário global com latência baixa. E **troca de destino em caso de falha**, apontando o nome para outra região quando a principal cai.\n\nO limite dos três é o mesmo: o TTL. Se a resposta ficou guardada por cinco minutos no resolvedor do usuário, a mudança leva até cinco minutos para chegar nele, e clientes que ignoram TTL podem demorar mais.",
                },
                {
                    type: "table",
                    value: '[["Estratégia de resolução", "Serve para", "Limite"], ["Alternar entre vários IPs", "Espalhar carga de forma grosseira", "Não enxerga máquina caída"], ["Responder pelo mais próximo", "Latência de usuário global", "Precisa de presença em várias regiões"], ["Apontar para outra região", "Sobreviver à queda de uma região", "Demora o TTL para propagar"], ["TTL curto (segundos)", "Trocar destino rápido", "Mais consultas e mais custo"], ["TTL longo (horas)", "Menos consulta e mais estabilidade", "Mudança demora a valer"]]',
                },
                {
                    type: "text",
                    value: '## O TTL é um trade-off de verdade\n\nEssa é a decisão que vale trazer para a mesa, porque tem os dois lados bem definidos. TTL curto dá agilidade: numa queda, o tráfego migra em segundos. O preço é volume de consulta, custo e uma dependência maior do provedor de DNS estar sempre respondendo.\n\nTTL longo dá estabilidade e barateia, mas amarra: uma troca de destino demora a valer, e nesse intervalo parte dos usuários continua batendo no lugar errado. O padrão comum é TTL de 60 segundos para nomes que participam de failover, e TTL de horas para nomes estáticos, como o domínio de assets que já está atrás de CDN.',
                },
                {
                    type: "text",
                    value: '## Por que isso cai em System Design\n\nPorque a pergunta "como você faria failover entre regiões?" tem duas respostas possíveis, e as duas passam por aqui. Ou o failover é feito no DNS, trocando o endereço, e aí você precisa falar de TTL e de propagação. Ou é feito com **anycast**, em que o mesmo endereço IP é anunciado a partir de vários lugares e a própria rede leva o pacote para o mais próximo, o que troca instantaneamente sem depender de TTL.\n\nSaber que existem essas duas famílias, e que uma depende de cache de resolução e a outra de roteamento de rede, é o tipo de detalhe que separa uma resposta genérica de uma resposta informada.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** o **DNS** é o primeiro ponto onde se decide para onde o usuário vai, e serve para espalhar carga, aproximar por região e trocar de destino numa falha. O **TTL** governa tudo isso: curto dá agilidade e custa consultas, longo dá estabilidade e atrasa mudanças. Failover por DNS depende de propagação; por **anycast**, não.",
                },
            ],
            questions: [
                {
                    statement: "O que o TTL de uma resposta DNS determina?",
                    difficulty: "facil",
                    options: [
                        { text: "Quanto tempo aquela resposta pode ficar em cache.", isCorrect: true },
                        { text: "Quantos endereços IP a resposta pode conter.", isCorrect: false },
                        { text: "O tempo máximo que o servidor tem para responder.", isCorrect: false },
                        { text: "A prioridade entre os endereços devolvidos ao cliente.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a principal limitação de balancear carga alternando endereços no DNS?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele não sabe se a máquina daquele endereço está viva.", isCorrect: true },
                        { text: "Ele só funciona com no máximo dois endereços por nome.", isCorrect: false },
                        { text: "Ele exige que todas as máquinas fiquem na mesma região.", isCorrect: false },
                        { text: "Ele impede o uso de cache pelos resolvedores do caminho.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o preço de usar um TTL muito curto?",
                    difficulty: "medio",
                    options: [
                        { text: "Mais consultas, mais custo e mais dependência do provedor.", isCorrect: true },
                        { text: "Mais tempo para uma troca de destino entrar em vigor no mundo.", isCorrect: false },
                        { text: "Perda da capacidade de responder por proximidade.", isCorrect: false },
                        { text: "Impossibilidade de devolver mais de um endereço por nome.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a vantagem do anycast sobre o failover feito por DNS?",
                    difficulty: "dificil",
                    options: [
                        { text: "A troca não depende da expiração de cache de resolução.", isCorrect: true },
                        { text: "O endereço IP passa a ser diferente em cada região atendida.", isCorrect: false },
                        { text: "Dispensa a existência de presença em mais de uma região.", isCorrect: false },
                        { text: "Elimina a necessidade de balanceador dentro de cada região.", isCorrect: false },
                    ],
                },
                {
                    statement: "Para qual tipo de nome faz mais sentido usar TTL longo, de horas?",
                    difficulty: "medio",
                    options: [
                        { text: "O domínio de assets estáticos atrás de CDN.", isCorrect: true },
                        { text: "O nome da API que participa de failover entre regiões.", isCorrect: false },
                        { text: "O nome do banco de dados primário da aplicação.", isCorrect: false },
                        { text: "O nome usado durante uma migração de infraestrutura.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "CDN e o conteúdo na borda",
            blocks: [
                {
                    type: "text",
                    value: "# CDN e o conteúdo na borda\n\nA conta de banda do módulo 2 já apontou para cá. A CDN é uma rede de servidores espalhados geograficamente que guarda cópia do seu conteúdo perto de quem consome. Ela resolve dois problemas ao mesmo tempo, e vale saber separá-los, porque só um deles costuma ser lembrado.\n\nO problema óbvio é **latência**: o byte não precisa atravessar o oceano. O problema silencioso, e normalmente o mais caro, é **banda e carga**: o mesmo arquivo sai milhares de vezes da borda e não da sua infraestrutura.",
                },
                {
                    type: "text",
                    value: "## Como o conteúdo chega lá\n\nExistem dois modelos, e a diferença entre eles é assunto frequente. No modelo **pull**, a borda não tem nada no começo. O primeiro usuário de cada região pede, a borda não tem, busca na sua origem, guarda e entrega. Os próximos são servidos localmente. É o modelo padrão, porque não exige trabalho de publicação e só ocupa espaço com o que é realmente pedido.\n\nNo modelo **push**, você envia o conteúdo para a borda antes de qualquer pedido. Faz sentido para arquivo grande e previsível, como o lançamento de um vídeo ou de uma atualização de aplicativo, quando você sabe que milhões vão pedir a mesma coisa no mesmo minuto e não quer que todos batam na origem ao mesmo tempo.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Pull", "Push"], ["Quem popula a borda", "O primeiro pedido de cada região", "Você, antes do primeiro pedido"], ["Primeiro usuário", "Paga a latência da origem", "Já é servido pela borda"], ["Ocupação de espaço", "Só o que foi pedido", "Tudo o que foi enviado"], ["Melhor caso de uso", "Site e mídia em geral", "Lançamento previsto de arquivo grande"]]',
                },
                {
                    type: "text",
                    value: '## Invalidação é o problema difícil\n\nColocar na borda é fácil. Tirar de lá é que dá trabalho, e é aqui que a pergunta de aprofundamento costuma cair. Se você publicou um arquivo com TTL de um dia e descobriu um erro nele, existem duas saídas.\n\nA primeira é **purgar**, pedindo à CDN que descarte aquele caminho. Funciona, mas leva algum tempo, tem custo e nem sempre é instantâneo em todas as bordas. A segunda, e a que se usa por padrão, é **versionar o nome**: em vez de publicar `app.js`, publica-se `app.a1b2c3.js`, com o hash do conteúdo no nome. Arquivo novo tem nome novo, então nunca há o que invalidar, e o TTL pode ser de um ano. A página que referencia esses arquivos é que fica com TTL curto.',
                },
                {
                    type: "text",
                    value: '## O que não deve ir para a borda\n\nA regra do módulo 2 se aplica: estático e repetido vai, personalizado não. Mas existe um caso intermediário que rende bons pontos: conteúdo **igual para muita gente, porém dinâmico**, como a página inicial de um portal de notícias.\n\nAí entra o cache de borda com TTL curto, de segundos. Guardar a home por dez segundos parece pouco, e num pico de 30 mil requisições por segundo significa que a origem recebe uma requisição a cada dez segundos em vez de 300 mil. É um dos melhores retornos por esforço que existem, e quase ninguém lembra de citar.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** a CDN resolve **latência** e, principalmente, **banda e carga**. No modelo **pull** a borda se popula sozinha no primeiro pedido; no **push** você envia antes, útil em lançamento previsto. A invalidação é o problema difícil, e a solução padrão é **versionar o nome do arquivo** em vez de purgar. Conteúdo dinâmico mas igual para todos ainda ganha muito com TTL de poucos segundos.",
                },
            ],
            questions: [
                {
                    statement: "Além da latência, qual problema a CDN resolve e costuma ser o mais caro?",
                    difficulty: "facil",
                    options: [
                        { text: "A banda e a carga que sairiam da sua infraestrutura.", isCorrect: true },
                        { text: "A consistência entre as réplicas do banco de dados.", isCorrect: false },
                        { text: "A autenticação dos usuários antes de servir o conteúdo.", isCorrect: false },
                        { text: "O armazenamento de longo prazo dos arquivos originais.", isCorrect: false },
                    ],
                },
                {
                    statement: "No modelo pull, quem paga a latência de buscar o conteúdo na origem?",
                    difficulty: "medio",
                    options: [
                        { text: "O primeiro usuário a pedir em cada região.", isCorrect: true },
                        { text: "Todos os usuários, até o TTL do arquivo expirar.", isCorrect: false },
                        { text: "Nenhum, porque a borda é populada antes do primeiro pedido.", isCorrect: false },
                        { text: "Apenas os usuários fora da região onde fica a origem.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a solução padrão para não precisar invalidar arquivos na borda?",
                    difficulty: "medio",
                    options: [
                        { text: "Versionar o nome do arquivo com o hash do conteúdo.", isCorrect: true },
                        { text: "Usar TTL de poucos segundos em todos os arquivos.", isCorrect: false },
                        { text: "Purgar o caminho na CDN a cada nova publicação do arquivo.", isCorrect: false },
                        { text: "Servir os arquivos direto da origem quando mudam.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "A home de um portal recebe 30 mil requisições por segundo e é igual para todos. Qual medida traz mais alívio?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cachear na borda por alguns segundos.", isCorrect: true },
                        { text: "Adicionar réplicas de leitura ao banco de dados.", isCorrect: false },
                        { text: "Aumentar o número de instâncias da aplicação.", isCorrect: false },
                        { text: "Comprimir a resposta antes de enviá-la ao cliente.", isCorrect: false },
                    ],
                },
                {
                    statement: "Em qual situação o modelo push para a borda faz mais sentido?",
                    difficulty: "medio",
                    options: [
                        { text: "Lançamento previsto de um arquivo grande e muito pedido.", isCorrect: true },
                        { text: "Site com muitas páginas raramente acessadas.", isCorrect: false },
                        { text: "Conteúdo personalizado por usuário já autenticado no sistema.", isCorrect: false },
                        { text: "Arquivos que mudam várias vezes ao longo do dia.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Balanceador, proxy reverso e API gateway",
            blocks: [
                {
                    type: "text",
                    value: "# Balanceador, proxy reverso e API gateway\n\nEssas três peças aparecem em quase todo diagrama e são frequentemente confundidas, inclusive porque um mesmo produto pode desempenhar os três papéis. Vale separar por **função**, não por produto, que é o hábito que o módulo 1 recomendou.\n\nO **balanceador** distribui requisições entre instâncias iguais. O **proxy reverso** é a porta de entrada que fala com o mundo em nome dos serviços de trás, e cuida de coisas como terminação de TLS e compressão. O **API gateway** é um proxy reverso com regras de negócio de borda: autenticação, limitação de taxa, roteamento por rota e agregação.",
                },
                {
                    type: "table",
                    value: '[["Peça", "Função central", "Exemplo de responsabilidade"], ["Balanceador", "Escolher qual instância atende", "Round robin, menor número de conexões"], ["Proxy reverso", "Ser a porta de entrada", "Terminar TLS, comprimir, servir estático"], ["API gateway", "Aplicar regra de borda", "Autenticar, limitar taxa, rotear por caminho"]]',
                },
                {
                    type: "text",
                    value: "## Camada 4 e camada 7\n\nA distinção que mais aparece em aprofundamento. Um balanceador de **camada 4** olha só endereço e porta: ele encaminha pacotes sem entender o que vai dentro. É rápido, barato e serve para qualquer protocolo, mas não sabe distinguir uma rota da outra.\n\nUm balanceador de **camada 7** entende HTTP: lê caminho, cabeçalho e cookie. Com isso pode mandar `/api` para um grupo e `/imagens` para outro, fazer lançamento gradual mandando 5% do tráfego para a versão nova, ou reencaminhar uma requisição que falhou. O preço é processar cada requisição, o que custa mais CPU e latência.",
                },
                {
                    type: "text",
                    value: "## Algoritmos de distribuição, e quando cada um importa\n\n**Round robin** alterna instâncias em ordem e é o padrão razoável quando todas as requisições custam parecido. **Menor número de conexões** manda para quem está menos ocupado, e é melhor quando o custo por requisição varia muito, como em uploads ou consultas pesadas. **Hash da origem** garante que o mesmo cliente caia sempre na mesma instância.\n\nEsse último merece cuidado, porque é o mecanismo por trás da sessão fixa. Ele resolve o problema de guardar estado na instância, mas cria outro: a instância vira insubstituível para aquele usuário, e cair significa perder a sessão dele. A resposta melhor quase sempre é tirar o estado da instância, colocando sessão em cache compartilhado, e voltar a poder distribuir livremente.",
                },
                {
                    type: "text",
                    value: '## Health check é o que faz o balanceador valer\n\nDistribuir carga é a parte fácil. O que realmente sustenta disponibilidade é o balanceador **parar de mandar tráfego** para uma instância doente. Ele faz isso batendo periodicamente num endpoint de saúde e tirando do grupo quem não responde.\n\nVale distinguir dois tipos, porque é detalhe que impressiona: o teste de **vivacidade** pergunta "o processo está de pé?", e o de **prontidão** pergunta "ele está apto a receber tráfego agora?". Um processo pode estar vivo e ainda não pronto, por exemplo enquanto carrega cache ou espera o banco. Sem essa separação, o balanceador manda tráfego para uma instância que sobe e derruba requisições nos primeiros segundos.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** separe por função: **balanceador** escolhe a instância, **proxy reverso** é a porta de entrada, **API gateway** aplica regra de borda. **Camada 4** é rápida e cega; **camada 7** entende HTTP e permite rotear e lançar gradualmente. Sessão fixa por hash resolve estado e cria dependência: melhor tirar o estado da instância. E é o **health check**, com vivacidade e prontidão separadas, que faz a peça valer.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a função central de um API gateway que o distingue de um proxy reverso comum?",
                    difficulty: "medio",
                    options: [
                        { text: "Aplicar regras de borda, como autenticar e limitar taxa.", isCorrect: true },
                        { text: "Distribuir requisições entre instâncias iguais do serviço.", isCorrect: false },
                        { text: "Terminar a conexão TLS antes de encaminhar ao serviço.", isCorrect: false },
                        { text: "Guardar em cache as respostas mais pedidas pelos clientes.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um balanceador de camada 7 permite que um de camada 4 não permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Rotear por caminho e enviar parte do tráfego a uma versão nova.", isCorrect: true },
                        { text: "Distribuir a carga entre várias instâncias do mesmo serviço.", isCorrect: false },
                        { text: "Retirar do grupo as instâncias que falham no health check periódico.", isCorrect: false },
                        { text: "Funcionar com protocolos que não sejam baseados em HTTP.", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o algoritmo de menor número de conexões é preferível ao round robin?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando o custo por requisição varia muito.", isCorrect: true },
                        { text: "Quando todas as requisições custam praticamente o mesmo.", isCorrect: false },
                        { text: "Quando é preciso manter o cliente na mesma instância.", isCorrect: false },
                        { text: "Quando as instâncias estão em regiões geográficas diferentes.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o problema criado pela sessão fixa por hash da origem?",
                    difficulty: "dificil",
                    options: [
                        { text: "A instância vira insubstituível para aquele usuário.", isCorrect: true },
                        { text: "A distribuição de carga passa a ignorar o health check.", isCorrect: false },
                        { text: "O balanceador precisa operar obrigatoriamente na camada 4.", isCorrect: false },
                        { text: "A sessão do usuário passa a trafegar em texto aberto.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a diferença entre o teste de vivacidade e o de prontidão?",
                    difficulty: "dificil",
                    options: [
                        { text: "Vivacidade diz se o processo está de pé; prontidão, se pode receber tráfego.", isCorrect: true },
                        { text: "Vivacidade roda uma vez na subida; prontidão roda por toda a vida do processo.", isCorrect: false },
                        { text: "Vivacidade é feita pelo balanceador; prontidão, pelo próprio serviço.", isCorrect: false },
                        { text: "Vivacidade verifica a rede; prontidão verifica o banco de dados.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Blob storage e o dado no lugar certo",
            blocks: [
                {
                    type: "text",
                    value: "# Blob storage e o dado no lugar certo\n\nA conta de armazenamento do módulo 2 mostrou que mídia domina o volume. Ela também aponta para uma decisão que aparece em quase todo estudo de caso: **arquivo não vai no banco**. Vai num armazenamento de objetos, o blob storage, e o banco guarda apenas o endereço dele.\n\nA razão é estrutural. Banco relacional é caro por byte, é otimizado para consulta e transação, e replicar gigabytes de binário dentro dele degrada tudo o que ele faz bem. Blob storage é o contrário: barato por byte, servido por HTTP, integrado a CDN, e sem nenhuma pretensão de consultar o conteúdo.",
                },
                {
                    type: "table",
                    value: '[["Tipo de dado", "Onde guardar", "Por quê"], ["Entidade com relação e transação", "Banco relacional", "Consulta e integridade são o ponto"], ["Documento sem esquema fixo", "Banco de documentos", "Formato varia por registro"], ["Arquivo, imagem, vídeo", "Blob storage", "Barato por byte e servido por HTTP"], ["Dado quente de leitura repetida", "Cache em memória", "Latência de microssegundos"], ["Série temporal e métrica", "Banco de série temporal", "Escrita sequencial e agregação por janela"], ["Texto para busca livre", "Índice de busca", "Ranqueamento e busca por termo"]]',
                },
                {
                    type: "text",
                    value: '## O padrão de upload que você deve conhecer\n\nExiste uma pergunta que aparece sempre que o sistema recebe arquivo: "o upload passa pela sua API?". A resposta ingênua é sim, e ela cria um problema, porque cada byte enviado ocupa uma instância da aplicação por todo o tempo do envio. Um vídeo de 500 MB numa conexão lenta prende um processo por minutos.\n\nO padrão correto é a **URL assinada**. O cliente pede à API permissão para enviar; a API valida quem é a pessoa, gera uma URL temporária e assinada para o blob storage, e devolve. O cliente envia o arquivo direto para o armazenamento, sem passar pela sua infraestrutura, e depois avisa a API que terminou. A API guarda o endereço e dispara o processamento. Sua frota nunca toca no arquivo.',
                },
                {
                    type: "code",
                    value: "Fluxo de upload com URL assinada:\n\n  1. cliente -> API      : quero enviar foto.jpg, 3 MB\n  2. API                 : valida usuario, cota e tipo do arquivo\n  3. API -> cliente      : URL assinada, valida por 10 minutos\n  4. cliente -> blob     : PUT do arquivo direto no armazenamento\n  5. cliente -> API      : terminei, id do objeto\n  6. API                 : grava o endereco e enfileira o processamento",
                },
                {
                    type: "text",
                    value: '## Classes de armazenamento e o dado que esfria\n\nBlob storage costuma oferecer classes com preços diferentes: acesso frequente, acesso raro e arquivo de longo prazo. A diferença de preço entre a mais quente e a mais fria é grande, e a contrapartida é o tempo e o custo para recuperar.\n\nIsso conecta direto com a alavanca de retenção do módulo 2. Em vez de apagar, muitas vezes a resposta certa é **mover**: original em acesso frequente por 30 dias, depois acesso raro, depois arquivo. Boa parte dos provedores faz isso por regra automática de ciclo de vida, e citar essa regra numa sessão mostra que você pensou em custo sem sacrificar o requisito de guardar.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** **arquivo vai para blob storage e o banco guarda o endereço**, porque banco é caro por byte e otimizado para consulta. Upload usa **URL assinada**, para o arquivo não atravessar a sua frota. E o dado que esfria **muda de classe** de armazenamento por regra de ciclo de vida, em vez de ser apagado.",
                },
            ],
            questions: [
                {
                    statement: "Por que arquivos grandes não devem ser guardados dentro do banco relacional?",
                    difficulty: "facil",
                    options: [
                        { text: "O banco é caro por byte e otimizado para consulta.", isCorrect: true },
                        { text: "O banco não consegue armazenar dados em formato binário.", isCorrect: false },
                        { text: "Arquivos não podem ser replicados junto com as tabelas.", isCorrect: false },
                        { text: "A CDN não consegue ler conteúdo servido pelo banco de dados.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o problema de fazer o upload de arquivos passar pela API da aplicação?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada envio ocupa uma instância pelo tempo inteiro.", isCorrect: true },
                        { text: "A API não consegue validar o tipo do arquivo enviado.", isCorrect: false },
                        { text: "O arquivo chega sem o endereço final no armazenamento.", isCorrect: false },
                        { text: "O cliente perde a possibilidade de retomar um envio interrompido.", isCorrect: false },
                    ],
                },
                {
                    statement: "No padrão de URL assinada, o que a API faz antes de gerar a URL?",
                    difficulty: "medio",
                    options: [
                        { text: "Valida usuário, cota e tipo de arquivo.", isCorrect: true },
                        { text: "Recebe o arquivo e o encaminha ao armazenamento.", isCorrect: false },
                        { text: "Cria o registro definitivo do arquivo no banco de dados.", isCorrect: false },
                        { text: "Reserva o espaço em disco necessário para o objeto novo.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a alternativa a apagar o dado antigo quando o custo de armazenamento incomoda?",
                    difficulty: "medio",
                    options: [
                        { text: "Mover para uma classe de armazenamento mais fria.", isCorrect: true },
                        { text: "Comprimir os arquivos mantendo a mesma classe de acesso.", isCorrect: false },
                        { text: "Replicar em menos regiões para reduzir as cópias pagas.", isCorrect: false },
                        { text: "Transferir os arquivos para o disco das próprias instâncias.", isCorrect: false },
                    ],
                },
                {
                    statement: "Para texto que precisa ser buscado por termo e ranqueado, qual é o lugar adequado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Um índice de busca dedicado.", isCorrect: true },
                        { text: "Um banco de série temporal com janelas de agregação.", isCorrect: false },
                        { text: "O blob storage, com os documentos servidos por HTTP.", isCorrect: false },
                        { text: "O cache em memória, pela latência de microssegundos.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Pub/sub e o desacoplamento por eventos",
            blocks: [
                {
                    type: "text",
                    value: "# Pub/sub e o desacoplamento por eventos\n\nO último bloco do módulo é o que muda a forma do diagrama, e não só o conteúdo de uma caixa. Até aqui, tudo foi uma requisição esperando resposta. Publicar e assinar quebra essa espera: quem produz o evento não sabe quem consome, não espera resposta, e não precisa nem saber se alguém está ouvindo.\n\nA diferença para uma fila comum vale ser dita com precisão, porque cai em aprofundamento. Numa **fila de trabalho**, cada mensagem é entregue a **um** consumidor, que a processa e a remove. Em **pub/sub**, cada mensagem é entregue a **todos** os assinantes daquele tópico, cada um com sua própria cópia e seu próprio ritmo.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Fila de trabalho", "Pub/sub"], ["Quem recebe a mensagem", "Um consumidor", "Todos os assinantes"], ["Objetivo típico", "Distribuir trabalho", "Notificar que algo aconteceu"], ["Efeito de somar consumidores", "Processa mais rápido", "Cada novo assinante recebe tudo"], ["Nome da mensagem", "Tarefa a fazer", "Fato que já aconteceu"]]',
                },
                {
                    type: "text",
                    value: '## O evento é um fato, e é isso que desacopla\n\nA mudança de vocabulário carrega a ideia inteira. Uma tarefa diz "envie o email de boas-vindas". Um evento diz "usuário se cadastrou". A primeira frase embute a decisão de quem manda; a segunda apenas relata.\n\nQuando o serviço de cadastro publica "usuário se cadastrou", ele deixa de ter opinião sobre o que acontece depois. Hoje três serviços ouvem esse fato: email, antifraude e analytics. Amanhã entra um quarto, de indicação de amigos, e o cadastro **não muda uma linha**. É esse o ganho real, e é ele que se cita numa sessão: acrescentar consumidor deixa de exigir mudança em quem produz.',
                },
                {
                    type: "text",
                    value: '## O preço que você precisa declarar\n\nDesacoplar não sai de graça, e um bom candidato traz os custos junto. **Rastrear fica mais difícil**: o fluxo deixa de ser uma pilha de chamadas e vira um encadeamento de eventos espalhados, o que torna correlação e observabilidade obrigatórias, não opcionais. **A ordem não é garantida**, a menos que se pague por ela com particionamento por chave. **A entrega costuma ser ao menos uma vez**, então o consumidor precisa ser idempotente, assunto do módulo 5.\n\nE existe um risco de projeto: transformar uma chamada que precisava de resposta imediata num evento assíncrono só porque eventos são elegantes. Se quem chamou precisa do resultado agora, use chamada síncrona. Publicar evento e ficar esperando a resposta chegar por outro caminho é reinventar a chamada síncrona com mais peças.',
                },
                {
                    type: "text",
                    value: '## Onde o pub/sub aparece nos estudos de caso\n\nVale guardar os usos recorrentes, porque eles se repetem no módulo 6. **Espalhar escrita para vários destinos**: uma publicação nova entra no banco, no índice de busca, no cache e no feed dos seguidores, e um evento único alimenta todos. **Absorver pico**, deixando a entrada rápida e o processamento no ritmo do consumidor. **Alimentar o mundo analítico** sem que o sistema de produção saiba que ele existe.\n\nUm detalhe que rende ponto: como cada assinante tem seu próprio ritmo, é normal que um esteja atrasado enquanto outro está em dia. Isso significa que consistência entre os destinos é **eventual** por construção, e dizer isso antes de alguém perguntar mostra que você entendeu o que acabou de desenhar.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** **fila** entrega a mensagem a **um** consumidor, **pub/sub** entrega a **todos** os assinantes. Publicar um **fato** em vez de uma ordem é o que desacopla: novo consumidor não exige mudança em quem produz. O preço é rastreamento mais difícil, ordem não garantida, entrega ao menos uma vez e consistência **eventual** entre os destinos.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença central entre uma fila de trabalho e um tópico pub/sub?",
                    difficulty: "facil",
                    options: [
                        { text: "A fila entrega a um consumidor e o tópico, a todos.", isCorrect: true },
                        { text: "A fila garante a ordem e o tópico nunca consegue garanti-la.", isCorrect: false },
                        { text: "A fila é síncrona e o tópico é sempre processado de forma assíncrona.", isCorrect: false },
                        { text: "A fila guarda a mensagem em disco e o tópico apenas em memória.", isCorrect: false },
                    ],
                },
                {
                    statement: 'Por que publicar "usuário se cadastrou" desacopla mais do que enfileirar "envie o email"?',
                    difficulty: "medio",
                    options: [
                        { text: "O produtor deixa de decidir o que acontece depois.", isCorrect: true },
                        { text: "O evento é entregue com garantia de ordem entre consumidores.", isCorrect: false },
                        { text: "A mensagem de fato ocupa menos espaço no broker de mensagens.", isCorrect: false },
                        { text: "O consumidor passa a poder responder diretamente ao produtor.", isCorrect: false },
                    ],
                },
                {
                    statement: "Um quarto serviço passa a precisar reagir ao cadastro de usuários. O que muda no produtor?",
                    difficulty: "medio",
                    options: [
                        { text: "Nada, ele apenas assina o mesmo tópico.", isCorrect: true },
                        { text: "É preciso incluir o novo destino na publicação do evento.", isCorrect: false },
                        { text: "É preciso criar um tópico novo para o serviço adicional.", isCorrect: false },
                        { text: "É preciso aumentar o número de partições do tópico atual.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual custo do modelo de eventos exige que o consumidor seja idempotente?",
                    difficulty: "dificil",
                    options: [
                        { text: "A entrega costuma ser ao menos uma vez.", isCorrect: true },
                        { text: "A ordem das mensagens não é garantida entre partições.", isCorrect: false },
                        { text: "Cada assinante consome no seu próprio ritmo de processamento.", isCorrect: false },
                        { text: "O rastreamento do fluxo exige correlação entre os eventos.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Quando transformar uma chamada síncrona em evento é a decisão errada?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quando quem chamou precisa do resultado imediatamente.", isCorrect: true },
                        { text: "Quando existe mais de um consumidor interessado no fato.", isCorrect: false },
                        { text: "Quando o processamento posterior é demorado e pesado.", isCorrect: false },
                        { text: "Quando a entrada precisa absorver picos de carga súbitos.", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Dados distribuídos",
    aulas: [
        {
            titulo: "Replicação: líder, seguidores e o atraso",
            blocks: [
                {
                    type: "text",
                    value: "# Replicação: líder, seguidores e o atraso\n\nGuardar o dado em mais de uma máquina resolve três coisas de uma vez: sobrevive à perda de uma delas, espalha a carga de leitura, e aproxima o dado de quem consome. O preço é uma pergunta que passa a existir para sempre: **as cópias estão iguais agora?**\n\nA resposta quase sempre é não, e a arquitetura inteira gira em torno de decidir o quanto esse \"não\" incomoda.",
                },
                {
                    type: "text",
                    value: "## Um líder e vários seguidores\n\nO arranjo mais comum, e o padrão em banco relacional, tem um **líder** que aceita escrita e **seguidores** que copiam o que ele fez e servem leitura. É simples de raciocinar: existe um lugar onde a verdade acontece primeiro, e a ordem das escritas é a ordem que o líder decidiu.\n\nA cópia pode ser feita de dois jeitos. **Assíncrona**: o líder confirma a escrita ao cliente assim que gravou, e os seguidores recebem depois. Rápido, mas se o líder morrer entre a confirmação e a cópia, aquela escrita se perde. **Síncrona**: o líder só confirma depois que ao menos um seguidor confirmou. Nada se perde, mas a escrita passa a custar uma ida e volta de rede a mais, e se o seguidor travar, a escrita trava junto.",
                },
                {
                    type: "table",
                    value: '[["Modo de replicação", "Latência de escrita", "Risco", "Uso típico"], ["Assíncrona", "Baixa", "Perder escritas na queda do líder", "Réplica de leitura, réplica em outra região"], ["Síncrona com um seguidor", "Média", "Escrita para se o seguidor travar", "Dado financeiro e crítico"], ["Semissíncrona", "Média", "Equilíbrio entre as duas", "Padrão de muitos bancos gerenciados"]]',
                },
                {
                    type: "text",
                    value: '## O atraso e os três problemas que ele cria\n\nCom réplica assíncrona sempre existe um **atraso de replicação**, normalmente de milissegundos, ocasionalmente de segundos ou minutos quando o seguidor fica sobrecarregado. Esse atraso gera três sintomas com nome próprio, e citá-los é um bom sinal numa sessão.\n\n**Ler a própria escrita**: a pessoa comenta, a leitura seguinte cai num seguidor atrasado, e o comentário sumiu. **Leitura não monotônica**: duas leituras seguidas caem em seguidores diferentes e o dado parece voltar no tempo. **Prefixo consistente**: uma resposta aparece antes da pergunta, porque chegaram por caminhos com atrasos diferentes.\n\nA correção do primeiro é a mais cobrada, e é simples: leituras do próprio usuário sobre dado que ele acabou de escrever vão para o líder, ou são grudadas na mesma réplica por um tempo curto.',
                },
                {
                    type: "text",
                    value: '## Quando o líder cai\n\nA troca de líder é o momento mais delicado do arranjo. Alguém precisa perceber a queda, escolher um seguidor para promover e redirecionar as escritas. Cada uma dessas etapas tem armadilha.\n\nSe a escolha recair sobre um seguidor atrasado, as escritas que ele não recebeu **se perdem**. Se o líder antigo voltar sem saber que foi substituído, aparecem dois líderes aceitando escrita, o que se chama **cérebro dividido** e costuma corromper dado. E se o detector for apressado demais, uma lentidão passageira vira troca de líder desnecessária, com indisponibilidade de brinde. Por isso a promoção séria depende de quórum, assunto que fecha o módulo.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** o arranjo padrão é **um líder e vários seguidores**. Replicação **assíncrona** é rápida e pode perder escrita na queda do líder; **síncrona** não perde e amarra a escrita ao seguidor. O atraso produz **ler a própria escrita**, **leitura não monotônica** e problema de **prefixo**. A troca de líder tem risco de perda de escrita e de **cérebro dividido**.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o risco da replicação assíncrona?",
                    difficulty: "facil",
                    options: [
                        { text: "Perder escritas já confirmadas se o líder cair.", isCorrect: true },
                        { text: "Travar a escrita quando um seguidor fica lento.", isCorrect: false },
                        { text: "Impedir que os seguidores sirvam qualquer leitura.", isCorrect: false },
                        { text: "Aumentar a latência de escrita em uma ida e volta.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um usuário publica um comentário e, ao recarregar, não o vê. Qual sintoma de replicação é esse?",
                    difficulty: "medio",
                    options: [
                        { text: "Falha em ler a própria escrita.", isCorrect: true },
                        { text: "Leitura não monotônica entre requisições.", isCorrect: false },
                        { text: "Quebra de prefixo consistente na ordem.", isCorrect: false },
                        { text: "Cérebro dividido entre dois líderes ativos.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a correção usual para o usuário enxergar o que acabou de escrever?",
                    difficulty: "medio",
                    options: [
                        { text: "Mandar essas leituras para o líder por um tempo.", isCorrect: true },
                        { text: "Tornar toda a replicação síncrona no banco de dados.", isCorrect: false },
                        { text: "Aumentar o número de seguidores disponíveis para leitura.", isCorrect: false },
                        { text: "Invalidar o cache da aplicação a cada escrita realizada.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza o cérebro dividido numa troca de líder?",
                    difficulty: "dificil",
                    options: [
                        { text: "Dois nós aceitando escrita ao mesmo tempo.", isCorrect: true },
                        { text: "Um seguidor atrasado sendo promovido a líder novo.", isCorrect: false },
                        { text: "O detector de falha promovendo um líder cedo demais.", isCorrect: false },
                        { text: "As leituras continuarem sendo servidas pelo líder antigo.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que um detector de falha apressado é um problema?",
                    difficulty: "dificil",
                    options: [
                        { text: "Transforma lentidão passageira em troca de líder.", isCorrect: true },
                        { text: "Permite que o líder antigo continue aceitando escritas.", isCorrect: false },
                        { text: "Impede que o seguidor mais atualizado seja escolhido.", isCorrect: false },
                        { text: "Aumenta o atraso de replicação entre líder e seguidores.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Particionamento e a escolha da chave",
            blocks: [
                {
                    type: "text",
                    value: "# Particionamento e a escolha da chave\n\nReplicação resolve leitura e sobrevivência, e não resolve tamanho: se o dado não cabe numa máquina, copiá-lo não ajuda. Aí entra o **particionamento**, também chamado de sharding, que divide o conjunto em pedaços e coloca cada pedaço num lugar diferente.\n\nA decisão inteira se resume a uma escolha: **qual chave define o pedaço**. Ela parece técnica e é, na prática, a decisão mais difícil de reverter em todo o desenho, porque muda onde cada linha mora.",
                },
                {
                    type: "table",
                    value: '[["Estratégia", "Como divide", "Ganha", "Perde"], ["Por faixa", "Intervalos ordenados da chave", "Consulta por intervalo é eficiente", "Concentra carga na faixa da moda"], ["Por hash", "Hash da chave decide o pedaço", "Distribui bem a carga", "Consulta por intervalo vira varredura"], ["Por lista", "Valor explícito, como país", "Isolamento e residência de dado", "Pedaços de tamanhos desiguais"]]',
                },
                {
                    type: "text",
                    value: '## O ponto quente é o inimigo\n\nParticionar por faixa de data parece natural e costuma ser armadilha: como quase toda escrita é de hoje, um único pedaço recebe tudo enquanto os outros ficam ociosos. É o **ponto quente**, e ele derruba o ganho inteiro do particionamento.\n\nO mesmo vale para chaves com distribuição desigual. Particionar publicações por autor funciona bem até existir um autor com dez milhões de seguidores e cinquenta publicações por dia. A saída usual é compor a chave: em vez de só o autor, usar autor mais um sufixo, espalhando as linhas daquele autor por vários pedaços. O custo é que ler tudo daquele autor passa a exigir consultar todos os pedaços.',
                },
                {
                    type: "text",
                    value: '## O que o particionamento tira de você\n\nEsta é a parte que separa uma resposta madura. Ao dividir, você perde coisas que o banco em uma máquina dava de graça.\n\n**Transação entre pedaços** deixa de ser trivial: atualizar duas linhas que caíram em máquinas diferentes exige coordenação, e o padrão prático é evitar essa necessidade escolhendo a chave de forma que o que muda junto fique junto. **Junção** entre tabelas particionadas por chaves diferentes vira consulta distribuída, cara e lenta. **Unicidade global**, como garantir que não existam dois emails iguais, deixa de sair de um índice único e passa a exigir uma tabela de reserva ou um serviço à parte. E **consulta que não usa a chave** precisa perguntar a todos os pedaços, o padrão espalhar e juntar, que não escala bem.',
                },
                {
                    type: "text",
                    value: '## Como escolher a chave na prática\n\nO critério prático é olhar as consultas mais frequentes, não o modelo de dados. Pergunte: qual valor aparece na maioria das consultas? Se 90% das consultas filtram por usuário, a chave é o usuário, porque assim cada consulta toca um pedaço só.\n\nE existe uma resposta legítima que vale ter na manga: **não particionar ainda**. Se a conta do módulo 2 deu menos de um terabyte e alguns milhares de operações por segundo, uma instância verticalizada com réplicas resolve, e você economiza toda essa complexidade. Dizer isso, com o número na mão, costuma valer mais do que desenhar um esquema de sharding elaborado que ninguém pediu.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** particionar divide o dado quando ele não cabe numa máquina, e a decisão é **qual chave**. Faixa favorece consulta por intervalo e cria **ponto quente**; hash distribui e atrapalha intervalo. Particionar custa **transação entre pedaços**, junção, unicidade global e consulta fora da chave. Escolha a chave pelas **consultas mais frequentes**, e lembre que **não particionar ainda** é resposta válida.",
                },
            ],
            questions: [
                {
                    statement: "Qual problema o particionamento resolve que a replicação não resolve?",
                    difficulty: "facil",
                    options: [
                        { text: "O dado não caber em uma única máquina.", isCorrect: true },
                        { text: "A perda de dados quando um nó falha de forma permanente.", isCorrect: false },
                        { text: "O excesso de leituras chegando ao banco primário.", isCorrect: false },
                        { text: "A latência alta para usuários de outras regiões do mundo.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que particionar por faixa de data costuma criar ponto quente?",
                    difficulty: "medio",
                    options: [
                        { text: "Quase toda escrita é do período mais recente.", isCorrect: true },
                        { text: "As faixas de data têm tamanhos naturalmente desiguais.", isCorrect: false },
                        { text: "O hash da data não distribui bem entre os pedaços.", isCorrect: false },
                        { text: "Consultas por intervalo precisam varrer todos os pedaços.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um autor com milhões de seguidores concentra carga num pedaço. Qual é a saída usual e o custo dela?",
                    difficulty: "dificil",
                    options: [
                        { text: "Compor a chave com um sufixo, e ler tudo dele fica caro.", isCorrect: true },
                        { text: "Trocar o particionamento por faixa, e perder distribuição.", isCorrect: false },
                        { text: "Replicar o pedaço quente, e perder consistência na escrita.", isCorrect: false },
                        { text: "Mover o autor para um banco próprio, e perder as junções.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que deixa de ser trivial depois de particionar o banco?",
                    difficulty: "medio",
                    options: [
                        { text: "Transação envolvendo linhas de pedaços diferentes.", isCorrect: true },
                        { text: "Consulta que filtra exatamente pela chave de partição.", isCorrect: false },
                        { text: "Replicação de cada pedaço para seus próprios seguidores.", isCorrect: false },
                        { text: "Escrita de linhas novas dentro de um mesmo pedaço.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual critério deve guiar a escolha da chave de partição?",
                    difficulty: "medio",
                    options: [
                        { text: "O valor que aparece na maioria das consultas.", isCorrect: true },
                        { text: "A coluna com maior número de valores distintos.", isCorrect: false },
                        { text: "A chave primária já usada pelo modelo de dados.", isCorrect: false },
                        { text: "O campo que mais cresce em tamanho ao longo do tempo.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Hashing consistente",
            blocks: [
                {
                    type: "text",
                    value: "# Hashing consistente\n\nEscolhida a chave, falta decidir **como o valor dela vira um destino**. A forma ingênua é o resto da divisão: `hash(chave) % numero_de_nos`. Funciona perfeitamente, distribui bem, é fácil de explicar. E quebra de um jeito espetacular no dia em que o número de nós muda.\n\nEsse é o problema que o hashing consistente resolve, e ele aparece em quase todo estudo de caso que envolve cache distribuído ou banco particionado.",
                },
                {
                    type: "code",
                    value: "Com resto da divisao, 4 nos:\n\n  hash(\"usuario-42\") = 1002  ->  1002 % 4 = no 2\n  hash(\"usuario-77\") = 2451  ->  2451 % 4 = no 3\n\nEntra o quinto no. Agora e % 5:\n\n  1002 % 5 = no 2   (continuou)\n  2451 % 5 = no 1   (mudou de lugar)\n\nNa pratica, cerca de 80% das chaves mudam de no.\nSe aquilo era um cache, 80% dele vira inutil de uma vez.",
                },
                {
                    type: "text",
                    value: "## O anel\n\nA ideia do hashing consistente é parar de calcular o destino a partir da **quantidade** de nós. Em vez disso, imagine o espaço de valores do hash como um círculo, de zero até o valor máximo. Cada nó recebe uma posição nesse círculo, também por hash do seu nome. Cada chave também recebe uma posição.\n\nA regra de destino passa a ser: a chave pertence ao **primeiro nó encontrado andando pelo círculo**, sempre no mesmo sentido. Como a posição de uma chave não depende de quantos nós existem, entrar ou sair um nó não mexe nas outras. Quando um nó entra, ele assume apenas as chaves que ficam entre ele e o nó anterior no círculo. Com dez nós, subir para onze move cerca de um décimo das chaves, e não quatro quintos.",
                },
                {
                    type: "text",
                    value: '## Nós virtuais\n\nO anel simples tem um defeito prático: com poucos nós, as posições sorteadas ficam desiguais e alguém acaba responsável por um pedaço bem maior do círculo. Além disso, quando um nó cai, **todo** o intervalo dele vai para um único vizinho, que pode não aguentar o dobro de carga.\n\nA correção é dar a cada nó físico muitas posições no círculo, chamadas **nós virtuais**. Em vez de uma posição, cada máquina recebe cem ou duzentas. Com isso a distribuição fica bem mais uniforme, e quando uma máquina cai, seus intervalos se espalham entre várias outras, em vez de cair todos no vizinho. É por isso que praticamente toda implementação real usa nós virtuais.',
                },
                {
                    type: "table",
                    value: '[["Abordagem", "Chaves movidas ao somar um nó", "Distribuição", "Falha de um nó"], ["Resto da divisão", "A grande maioria", "Uniforme", "Remapeia quase tudo"], ["Anel simples", "Cerca de 1/n", "Desigual com poucos nós", "Vizinho absorve tudo"], ["Anel com nós virtuais", "Cerca de 1/n", "Uniforme", "Carga se espalha entre vários"]]',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** `hash % n` remapeia quase todas as chaves quando `n` muda, o que esvazia um cache distribuído de uma vez. O **hashing consistente** coloca nós e chaves num círculo e associa a chave ao próximo nó, então entrar ou sair um nó move só cerca de **1/n** das chaves. **Nós virtuais** corrigem a distribuição desigual e espalham a carga de um nó que cai.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o problema de decidir o destino com o resto da divisão pelo número de nós?",
                    difficulty: "facil",
                    options: [
                        { text: "Mudar a quantidade de nós remapeia quase todas as chaves.", isCorrect: true },
                        { text: "A distribuição das chaves entre os nós fica desigual.", isCorrect: false },
                        { text: "O cálculo do destino fica lento conforme os nós aumentam.", isCorrect: false },
                        { text: "Chaves parecidas acabam sempre caindo no mesmo destino.", isCorrect: false },
                    ],
                },
                {
                    statement: "No anel do hashing consistente, a qual nó pertence uma chave?",
                    difficulty: "medio",
                    options: [
                        { text: "Ao primeiro nó encontrado andando pelo círculo.", isCorrect: true },
                        { text: "Ao nó cuja posição estiver numericamente mais próxima.", isCorrect: false },
                        { text: "Ao nó com menos chaves associadas naquele momento.", isCorrect: false },
                        { text: "Ao nó definido pelo resto da divisão da posição dela.", isCorrect: false },
                    ],
                },
                {
                    statement: "Com 10 nós no anel, aproximadamente quantas chaves mudam de lugar ao entrar o décimo primeiro?",
                    difficulty: "medio",
                    options: [
                        { text: "Cerca de 10% delas.", isCorrect: true },
                        { text: "Cerca de 90% delas.", isCorrect: false },
                        { text: "Cerca de 50% delas.", isCorrect: false },
                        { text: "Praticamente nenhuma.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual problema os nós virtuais resolvem no anel simples?",
                    difficulty: "dificil",
                    options: [
                        { text: "A distribuição desigual e a carga toda indo para um vizinho.", isCorrect: true },
                        { text: "A necessidade de recalcular a posição das chaves existentes.", isCorrect: false },
                        { text: "O custo de percorrer o círculo a cada busca de destino.", isCorrect: false },
                        { text: "A perda de dados quando um nó sai do anel sem aviso.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o hashing consistente importa tanto para cache distribuído?",
                    difficulty: "dificil",
                    options: [
                        { text: "Um remapeamento amplo esvaziaria o cache de uma vez.", isCorrect: true },
                        { text: "O cache não tem como replicar as chaves entre os nós.", isCorrect: false },
                        { text: "As chaves de cache expiram e precisam mudar de destino.", isCorrect: false },
                        { text: "O cache exige distribuição perfeitamente uniforme das chaves.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "CAP e PACELC",
            blocks: [
                {
                    type: "text",
                    value: "# CAP e PACELC\n\nO teorema CAP é o conceito mais citado e mais mal citado de sistemas distribuídos. A versão popular, de que se escolhem dois entre consistência, disponibilidade e tolerância a partição, é enganosa, porque sugere que existe a opção de abrir mão da tolerância a partição.\n\nNão existe. Partição é a rede falhando entre os nós, e rede falha. Se o seu sistema tem mais de uma máquina, você é obrigado a tolerar partição. A escolha real é outra, e é bem mais estreita.",
                },
                {
                    type: "quote",
                    value: "O **CAP** diz que, **quando existe uma partição de rede**, um sistema distribuído precisa escolher entre **consistência** (todo mundo lê o dado mais recente) e **disponibilidade** (todo nó responde, mesmo que com dado velho). Fora da partição, o teorema não diz nada.",
                },
                {
                    type: "text",
                    value: "## O que cada escolha significa na prática\n\nImagine dois datacenters e o cabo entre eles rompido. Uma escrita chega no lado A.\n\nSe o sistema escolhe **consistência**, o lado A recusa a escrita, porque não consegue confirmar com o outro lado. O usuário vê erro, e nenhum dado fica divergente. É o comportamento que se quer para saldo bancário e reserva de assento: recusar é melhor do que vender a mesma poltrona duas vezes.\n\nSe escolhe **disponibilidade**, o lado A aceita a escrita, o lado B segue com a versão antiga, e quando o cabo voltar alguém precisa reconciliar as duas versões. É o comportamento que se quer para carrinho de compras, curtida e contador de visualização, onde recusar o pedido é pior do que resolver uma divergência depois.",
                },
                {
                    type: "text",
                    value: "## PACELC, que é o que falta no CAP\n\nO CAP só fala do que fazer durante a partição, que é um evento raro. E no resto do tempo, que é quase sempre? É essa a lacuna que o **PACELC** preenche, e citá-lo é um sinal de estar atualizado.\n\nA formulação é: **se há Partição (P), escolha entre Availability e Consistency (A ou C); senão (Else, E), escolha entre Latency e Consistency (L ou C)**. A segunda metade é a que descreve o dia a dia. Confirmar uma escrita em três réplicas espalhadas pelo mundo antes de responder dá consistência forte e custa centenas de milissegundos. Responder assim que a réplica local gravou é rápido e aceita que outra região leia dado velho por um instante. Nenhuma partição envolvida: é só o preço da luz percorrendo fibra.",
                },
                {
                    type: "table",
                    value: '[["Classificação PACELC", "Durante partição", "Fora de partição", "Exemplo de uso"], ["PC/EC", "Prefere consistência", "Prefere consistência", "Saldo, estoque, reserva"], ["PA/EL", "Prefere disponibilidade", "Prefere latência", "Carrinho, curtida, contador"], ["PC/EL", "Prefere consistência", "Prefere latência", "Sistemas com leitura relaxada e escrita rígida"], ["PA/EC", "Prefere disponibilidade", "Prefere consistência", "Combinação rara na prática"]]',
                },
                {
                    type: "text",
                    value: '## Como usar isso numa sessão sem parecer decoreba\n\nO jeito ruim é anunciar "esse sistema é AP". O jeito bom é aplicar por **operação**, porque quase nenhum sistema real é uma coisa só. Num comércio eletrônico, navegar o catálogo pode ler dado de segundos atrás sem problema nenhum, enquanto a baixa de estoque no fechamento do pedido não pode.\n\nA frase que funciona é essa: "leitura de catálogo eu sirvo por réplica e cache, aceitando alguns segundos de atraso; a reserva de estoque eu faço no primário, com consistência forte, porque vender item inexistente custa mais caro do que uma latência um pouco maior naquele passo". Isso mostra que você entendeu o conceito como ferramenta de decisão, e não como classificação de banco.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** tolerar **partição** não é opcional, então o CAP é uma escolha entre **consistência e disponibilidade durante a partição**. O **PACELC** completa: fora da partição, a escolha é entre **latência e consistência**. Aplique por **operação**, e não ao sistema inteiro: catálogo pode ler dado velho, baixa de estoque não pode.",
                },
            ],
            questions: [
                {
                    statement: "Por que dizer que se escolhem dois entre consistência, disponibilidade e partição é enganoso?",
                    difficulty: "medio",
                    options: [
                        { text: "Tolerar partição não é opcional em um sistema distribuído.", isCorrect: true },
                        { text: "Os três podem ser obtidos ao mesmo tempo com quórum.", isCorrect: false },
                        { text: "A disponibilidade depende diretamente da consistência escolhida.", isCorrect: false },
                        { text: "A partição só ocorre em sistemas espalhados por várias regiões.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Durante uma partição, um sistema que prefere consistência faz o quê com uma escrita que não pode ser confirmada?",
                    difficulty: "facil",
                    options: [
                        { text: "Recusa a escrita.", isCorrect: true },
                        { text: "Aceita e reconcilia as versões depois.", isCorrect: false },
                        { text: "Aceita e replica apenas para os nós do mesmo lado.", isCorrect: false },
                        { text: "Guarda a escrita em fila até a rede voltar a funcionar.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o PACELC acrescenta ao CAP?",
                    difficulty: "medio",
                    options: [
                        { text: "A escolha entre latência e consistência fora da partição.", isCorrect: true },
                        { text: "A garantia de que partições podem ser evitadas por projeto.", isCorrect: false },
                        { text: "A definição formal do que conta como uma partição de rede.", isCorrect: false },
                        { text: "A separação entre consistência de leitura e a de escrita.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um sistema prefere disponibilidade na partição e latência fora dela. Como ele é classificado?",
                    difficulty: "dificil",
                    options: [
                        { text: "PA/EL.", isCorrect: true },
                        { text: "PC/EC.", isCorrect: false },
                        { text: "PC/EL.", isCorrect: false },
                        { text: "PA/EC.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a forma mais forte de aplicar CAP e PACELC numa sessão de design?",
                    difficulty: "dificil",
                    options: [
                        { text: "Decidir por operação, e não para o sistema inteiro.", isCorrect: true },
                        { text: "Classificar o banco escolhido e manter a escolha coerente.", isCorrect: false },
                        { text: "Preferir consistência sempre, e relaxar só se houver queixa.", isCorrect: false },
                        { text: "Escolher disponibilidade, já que indisponibilidade é o pior caso.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Quórum e modelos de consistência",
            blocks: [
                {
                    type: "text",
                    value: "# Quórum e modelos de consistência\n\nAs duas aulas anteriores falaram de escolhas. Esta fala de como se **implementa** a escolha, e do vocabulário para descrever o resultado com precisão. É a aula mais teórica do módulo, e a que mais rende em aprofundamento.\n\nO mecanismo central é o **quórum**: em vez de perguntar a todas as réplicas ou a apenas uma, pergunta-se a uma maioria, e a matemática garante o resto.",
                },
                {
                    type: "code",
                    value: "N = numero de replicas\nW = quantas precisam confirmar uma escrita\nR = quantas sao consultadas numa leitura\n\nSe W + R > N, leitura e escrita se sobrepoem em ao menos\numa replica, entao a leitura enxerga a escrita mais recente.\n\nCom N = 3:\n  W=3, R=1  -> escrita cara e lenta, leitura rapida\n  W=1, R=3  -> escrita rapida, leitura cara\n  W=2, R=2  -> equilibrado, o arranjo mais comum\n  W=1, R=1  -> rapido nos dois lados, sem garantia nenhuma",
                },
                {
                    type: "text",
                    value: "## O que o quórum resolve e o que não resolve\n\nCom `W + R > N`, sempre existe ao menos uma réplica em comum entre o conjunto que confirmou a escrita e o conjunto consultado na leitura. Como essa réplica tem a versão nova, a leitura consegue enxergá-la, desde que saiba comparar versões e escolher a mais recente.\n\nO que o quórum **não** resolve sozinho é a ordem de escritas concorrentes. Se duas pessoas escrevem valores diferentes na mesma chave ao mesmo tempo, e cada uma alcança um conjunto de réplicas, existem duas versões legítimas. Resolver isso exige carimbo de tempo com desempate, relógio vetorial ou um tipo de dado que saiba se fundir sozinho. E a estratégia mais simples, chamada última escrita vence, tem um defeito conhecido: ela **descarta** silenciosamente uma das escritas.",
                },
                {
                    type: "table",
                    value: '[["Modelo de consistência", "O que garante", "Custo"], ["Forte (linearizável)", "Toda leitura vê a última escrita confirmada", "Coordenação e latência alta"], ["Sequencial", "Todos veem as operações na mesma ordem", "Menor que a forte, ainda coordena"], ["Causal", "O que causou vem antes do efeito", "Barata e suficiente em muitos casos"], ["Ler a própria escrita", "Você vê o que acabou de gravar", "Roteamento de leitura, quase nada"], ["Eventual", "As réplicas convergem, um dia", "A mais barata e a mais confusa"]]',
                },
                {
                    type: "text",
                    value: '## Consistência eventual não é ausência de garantia\n\nA expressão soa como desculpa, e não é. Ela promete uma coisa concreta: **na ausência de novas escritas, todas as réplicas convergem para o mesmo valor**. O que ela não promete é quando, nem que as leituras no meio do caminho façam sentido juntas.\n\nÉ por isso que os modelos intermediários existem e valem tanto. Consistência **causal** garante que, se uma mensagem responde a outra, ninguém vê a resposta antes da pergunta, e isso resolve a maior parte do desconforto de um sistema eventual sem pagar o preço da consistência forte. **Ler a própria escrita** custa quase nada e elimina o sintoma mais visível para o usuário. Em muitos desenhos, a resposta certa é eventual no geral, com essas duas garantias pontuais onde importam.',
                },
                {
                    type: "text",
                    value: '## Consenso, e por que ele é caro\n\nQuando o sistema precisa que todos concordem com **uma** decisão, como quem é o líder ou qual é a ordem oficial das operações, entra o consenso, com Raft e Paxos como algoritmos conhecidos. A ideia comum a eles é a mesma da maioria: uma decisão só vale quando mais da metade dos nós concorda, o que impede dois grupos separados de decidirem coisas contraditórias, resolvendo o cérebro dividido da primeira aula.\n\nO preço é ida e volta de rede em cada decisão, e a exigência de que a maioria esteja viva. Por isso ninguém usa consenso para tudo: usa-se para as decisões estruturais, como eleger líder e guardar configuração, e deixa-se o caminho de dado seguir por replicação e quórum, que são bem mais baratos.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** com **W + R > N** os conjuntos de escrita e leitura se sobrepõem e a leitura enxerga a escrita mais recente. Quórum não ordena escritas concorrentes, e **última escrita vence** descarta uma delas em silêncio. **Eventual** promete convergência, não prazo; **causal** e **ler a própria escrita** resolvem barato o que mais incomoda. **Consenso** é caro e fica para decisões estruturais, como eleger líder.",
                },
            ],
            questions: [
                {
                    statement: "Com N igual a 3 réplicas, qual configuração garante que a leitura enxergue a escrita mais recente?",
                    difficulty: "medio",
                    options: [
                        { text: "W igual a 2 e R igual a 2.", isCorrect: true },
                        { text: "W igual a 1 e R igual a 1.", isCorrect: false },
                        { text: "W igual a 1 e R igual a 2.", isCorrect: false },
                        { text: "W igual a 2 e R igual a 1.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o quórum não resolve sozinho?",
                    difficulty: "dificil",
                    options: [
                        { text: "A ordem entre escritas concorrentes na mesma chave.", isCorrect: true },
                        { text: "A sobreposição entre o conjunto de leitura e o de escrita.", isCorrect: false },
                        { text: "A sobrevivência do sistema à queda de uma das réplicas.", isCorrect: false },
                        { text: "A distribuição das réplicas entre regiões geográficas.", isCorrect: false },
                    ],
                },
                {
                    statement: 'Qual é o defeito conhecido da estratégia "última escrita vence"?',
                    difficulty: "dificil",
                    options: [
                        { text: "Ela descarta uma das escritas em silêncio.", isCorrect: true },
                        { text: "Ela exige relógios sincronizados com precisão de microssegundos.", isCorrect: false },
                        { text: "Ela impede que as réplicas convirjam para o mesmo valor.", isCorrect: false },
                        { text: "Ela obriga o cliente a resolver o conflito manualmente.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que exatamente a consistência eventual promete?",
                    difficulty: "medio",
                    options: [
                        { text: "Que as réplicas convergem se as escritas pararem.", isCorrect: true },
                        { text: "Que toda leitura devolve a última escrita confirmada.", isCorrect: false },
                        { text: "Que a convergência acontece dentro de um prazo definido.", isCorrect: false },
                        { text: "Que as operações são vistas na mesma ordem por todos.", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que se usa consenso, dado o custo dele?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para decisões estruturais, como eleger o líder.", isCorrect: true },
                        { text: "Para toda escrita que precisa de durabilidade garantida.", isCorrect: false },
                        { text: "Para as leituras que exigem enxergar a escrita mais recente.", isCorrect: false },
                        { text: "Para distribuir as chaves entre os nós de forma equilibrada.", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Padrões que caem sempre",
    aulas: [
        {
            titulo: "Rate limiter",
            blocks: [
                {
                    type: "text",
                    value: "# Rate limiter\n\nLimitar taxa aparece como pergunta inteira e como parte de quase todo estudo de caso. A função é simples de enunciar: permitir no máximo N operações por janela de tempo, para um cliente identificado. A dificuldade está em ser **exato, disponível e escalável ao mesmo tempo**, e é essa tensão que a pergunta explora.\n\nAntes do algoritmo, vale fixar duas decisões que mudam tudo: **por quem se limita** (endereço IP, chave de API, usuário, rota) e **o que acontece ao estourar** (recusar com 429, enfileirar, ou apenas degradar).",
                },
                {
                    type: "table",
                    value: '[["Algoritmo", "Como funciona", "Ponto forte", "Ponto fraco"], ["Janela fixa", "Conta por intervalo, zera ao virar", "Simples e barato", "Aceita o dobro na virada"], ["Janela deslizante por log", "Guarda o instante de cada evento", "Exato", "Guarda muito dado por cliente"], ["Janela deslizante por contagem", "Pondera a janela anterior", "Quase exato e barato", "Aproximação"], ["Balde de fichas", "Fichas repõem por segundo, gasta uma por chamada", "Permite rajada controlada", "Dois parâmetros para ajustar"], ["Balde furado", "Fila que esvazia a taxa constante", "Saída suave e constante", "Introduz espera"]]',
                },
                {
                    type: "text",
                    value: "## O problema da virada e a resposta padrão\n\nA janela fixa tem um defeito conhecido que vale saber explicar. Com limite de 100 por minuto, um cliente pode fazer 100 chamadas nos últimos segundos de um minuto e outras 100 nos primeiros segundos do minuto seguinte: 200 chamadas em poucos segundos, dentro da regra.\n\nA janela deslizante por contagem resolve barato: em vez de zerar, ela pondera a janela anterior pela fração do tempo que ainda pertence à janela atual. Se estamos a 25% do minuto novo, o contador considerado é 75% do minuto anterior mais o que já veio agora. Não é exato, o erro é pequeno, e o custo é apenas dois contadores por cliente, contra um registro por evento na versão por log.",
                },
                {
                    type: "text",
                    value: '## Balde de fichas, o mais usado\n\nO balde de fichas merece atenção porque é o mais adotado em API pública, e por um motivo de produto: ele separa a **taxa média** da **rajada permitida**. O balde tem capacidade máxima, digamos 100 fichas, e é reabastecido a uma taxa constante, digamos 10 fichas por segundo. Cada chamada consome uma ficha; sem ficha, recusa.\n\nQuem ficou parado acumula até 100 fichas e pode disparar 100 chamadas de uma vez, o que é ótimo para um cliente que sincroniza em lote. Passada a rajada, ele fica limitado às 10 por segundo da reposição. Essa é exatamente a política que a maioria das APIs quer: tolerar pico curto, sustentar média baixa.',
                },
                {
                    type: "text",
                    value: '## Distribuído, que é onde a pergunta fica interessante\n\nCom uma instância só, um contador em memória resolve. Com cinquenta instâncias atrás de um balanceador, cada uma vendo parte do tráfego, contar localmente permite ao cliente estourar o limite cinquenta vezes.\n\nA resposta padrão é um contador **compartilhado**, em cache em memória, incrementado de forma atômica. Isso acrescenta uma ida e volta de rede a cada requisição, e cria uma dependência: se o cache cair, é preciso decidir se o sistema recusa tudo ou libera tudo, e a escolha usual é **liberar**, porque um limitador indisponível não deveria derrubar o serviço inteiro. Para reduzir a conversa com o cache, usa-se distribuir a cota entre as instâncias, cada uma pedindo um bloco de permissões de cada vez, o que troca um pouco de exatidão por muito menos rede. E o contador compartilhado escala pelo mesmo caminho do módulo 4: particionado por chave de cliente, com hashing consistente.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** decida **por quem** se limita e **o que acontece ao estourar**. **Janela fixa** aceita o dobro na virada; a **deslizante por contagem** corrige isso barato. O **balde de fichas** é o mais usado porque separa taxa média de rajada. No distribuído, o contador precisa ser **compartilhado e atômico**, com um bloco de permissões por instância para poupar rede, e a decisão declarada de **liberar** quando o limitador cair.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o defeito conhecido do algoritmo de janela fixa?",
                    difficulty: "medio",
                    options: [
                        { text: "Permite quase o dobro do limite na virada da janela.", isCorrect: true },
                        { text: "Precisa guardar o instante de cada requisição recebida.", isCorrect: false },
                        { text: "Introduz espera nas requisições que chegam em rajada.", isCorrect: false },
                        { text: "Exige dois parâmetros distintos para ser configurado.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o balde de fichas é o mais adotado em API pública?",
                    difficulty: "medio",
                    options: [
                        { text: "Separa a taxa média da rajada permitida.", isCorrect: true },
                        { text: "É o único que funciona de forma exata em ambiente distribuído.", isCorrect: false },
                        { text: "Não precisa guardar estado algum sobre cada cliente atendido.", isCorrect: false },
                        { text: "Garante saída constante, sem variação no ritmo de chamadas.", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Um balde com capacidade 100 e reposição de 10 por segundo. O que um cliente parado há muito tempo consegue fazer?",
                    difficulty: "dificil",
                    options: [
                        { text: "Disparar 100 chamadas e depois ficar em 10 por segundo.", isCorrect: true },
                        { text: "Disparar 10 chamadas e depois esperar a reposição seguinte.", isCorrect: false },
                        { text: "Disparar 100 chamadas por segundo enquanto o balde durar.", isCorrect: false },
                        { text: "Disparar 1.000 chamadas, somando a capacidade e a reposição.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que contar localmente em cada instância não funciona atrás de um balanceador?",
                    difficulty: "facil",
                    options: [
                        { text: "O cliente pode estourar o limite em cada instância.", isCorrect: true },
                        { text: "As instâncias não conseguem identificar o mesmo cliente.", isCorrect: false },
                        { text: "O contador local é perdido a cada nova requisição atendida.", isCorrect: false },
                        { text: "O balanceador impede a leitura do endereço de origem real.", isCorrect: false },
                    ],
                },
                {
                    statement: "O cache que guarda os contadores compartilhados fica indisponível. Qual é a decisão usual?",
                    difficulty: "dificil",
                    options: [
                        { text: "Liberar as requisições, para não derrubar o serviço.", isCorrect: true },
                        { text: "Recusar as requisições, para preservar a garantia do limite.", isCorrect: false },
                        { text: "Enfileirar as requisições até o cache voltar a responder.", isCorrect: false },
                        { text: "Voltar a contar localmente em cada uma das instâncias.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Gerar identificadores únicos em escala",
            blocks: [
                {
                    type: "text",
                    value: "# Gerar identificadores únicos em escala\n\nParece detalhe e não é. Assim que o dado é particionado, o autoincremento do banco deixa de servir, porque ele é único dentro de uma máquina e não entre várias. O sistema precisa de identificadores únicos gerados em qualquer nó, sem coordenação a cada chamada.\n\nE não basta serem únicos. A propriedade que costuma ser esquecida é a **ordenação**: identificadores que crescem com o tempo permitem ordenar por id, paginar por id e escrever de forma sequencial no índice, o que é muito mais rápido.",
                },
                {
                    type: "table",
                    value: '[["Estratégia", "Único", "Ordenável", "Precisa coordenar", "Tamanho"], ["Autoincremento do banco", "Só naquele banco", "Sim", "Sim, no banco", "8 bytes"], ["UUID versão 4", "Sim", "Não", "Não", "16 bytes"], ["UUID versão 7", "Sim", "Sim, por tempo", "Não", "16 bytes"], ["Snowflake", "Sim", "Sim, por tempo", "Só o id da máquina", "8 bytes"], ["Faixas pré-alocadas", "Sim", "Aproximadamente", "Sim, ao pegar faixa", "8 bytes"]]',
                },
                {
                    type: "text",
                    value: "## Por que UUID aleatório atrapalha o banco\n\nO UUID versão 4 é aleatório, resolve unicidade sem coordenação nenhuma e é a escolha preguiçosa. O problema aparece no índice: como cada valor novo cai num ponto aleatório da árvore, as escritas ficam espalhadas por todo o índice, o que fragmenta páginas e piora o desempenho conforme a tabela cresce.\n\nIdentificadores que começam com o tempo resolvem isso: como cada valor novo é maior que o anterior, as inserções acontecem sempre no fim do índice, de forma sequencial e barata. É por isso que o UUID versão 7, que coloca o carimbo de tempo nos bits mais significativos, virou a recomendação prática quando se quer um identificador de 16 bytes sem infraestrutura extra.",
                },
                {
                    type: "code",
                    value: "Snowflake, 64 bits:\n\n  1 bit   sinal, sempre zero\n  41 bits carimbo de tempo em milissegundos desde uma epoca escolhida\n  10 bits identificador da maquina (ate 1024 maquinas)\n  12 bits sequencia dentro do mesmo milissegundo (ate 4096)\n\n  41 bits de milissegundos = cerca de 69 anos de faixa\n  1024 maquinas x 4096 por ms = 4 milhoes de ids por milissegundo",
                },
                {
                    type: "text",
                    value: '## Snowflake e os dois problemas dele\n\nO desenho é elegante: cada máquina gera sozinha, sem falar com ninguém, e o resultado cabe em 8 bytes e ordena por tempo. A coordenação existe uma vez só, para atribuir o identificador de máquina, e isso é feito na subida, normalmente por um serviço de configuração.\n\nOs dois problemas valem citar. O primeiro é o **relógio andando para trás**: se o servidor ajustar a hora e voltar alguns milissegundos, é possível gerar identificador repetido. A defesa usual é detectar e esperar até o relógio passar do último instante usado. O segundo é o **vazamento de informação**: como o tempo está no id, quem recebe dois identificadores consegue estimar quantos itens foram criados entre eles, o que é indesejado em recurso público. Quando isso importa, expõe-se um identificador externo diferente do interno.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** com dado particionado, o autoincremento não serve. Além de único, o identificador deve ser **ordenável no tempo**, porque isso torna a escrita no índice sequencial. **UUID v4** é aleatório e fragmenta o índice; **UUID v7** e **Snowflake** carregam o tempo nos bits altos. Snowflake cabe em 8 bytes e coordena só uma vez, com atenção ao **relógio para trás** e ao **vazamento** de volume.",
                },
            ],
            questions: [
                {
                    statement: "Por que o autoincremento do banco deixa de servir quando o dado é particionado?",
                    difficulty: "facil",
                    options: [
                        { text: "Ele é único apenas dentro daquela instância.", isCorrect: true },
                        { text: "Ele deixa de ser ordenável quando existem vários pedaços.", isCorrect: false },
                        { text: "Ele passa a exigir coordenação a cada nova inserção feita.", isCorrect: false },
                        { text: "Ele ocupa espaço demais no índice de cada uma das partições.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o efeito de usar UUID aleatório como chave primária de uma tabela grande?",
                    difficulty: "medio",
                    options: [
                        { text: "As inserções se espalham e fragmentam o índice.", isCorrect: true },
                        { text: "Os identificadores acabam colidindo conforme a tabela cresce.", isCorrect: false },
                        { text: "As leituras por chave primária ficam significativamente lentas.", isCorrect: false },
                        { text: "O banco passa a precisar coordenar a geração entre os nós.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o UUID versão 7 faz de diferente do versão 4?",
                    difficulty: "medio",
                    options: [
                        { text: "Coloca o carimbo de tempo nos bits mais significativos.", isCorrect: true },
                        { text: "Reduz o tamanho do identificador de 16 para 8 bytes.", isCorrect: false },
                        { text: "Inclui o identificador da máquina que gerou aquele valor.", isCorrect: false },
                        { text: "Elimina a aleatoriedade, tornando o valor previsível.", isCorrect: false },
                    ],
                },
                {
                    statement: "No Snowflake, para que servem os bits de sequência?",
                    difficulty: "dificil",
                    options: [
                        { text: "Distinguir ids gerados no mesmo milissegundo.", isCorrect: true },
                        { text: "Identificar qual máquina do conjunto gerou o valor.", isCorrect: false },
                        { text: "Ampliar a faixa de anos que o carimbo de tempo cobre.", isCorrect: false },
                        { text: "Garantir que o identificador seja difícil de adivinhar.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o risco de expor publicamente identificadores que carregam o tempo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Permitir estimar o volume criado entre dois deles.", isCorrect: true },
                        { text: "Permitir descobrir em qual máquina o registro foi criado.", isCorrect: false },
                        { text: "Permitir gerar identificadores válidos de outros registros.", isCorrect: false },
                        { text: "Permitir alterar a ordem em que os registros são listados.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Busca e sugestão enquanto digita",
            blocks: [
                {
                    type: "text",
                    value: "# Busca e sugestão enquanto digita\n\nBusca aparece em quase todo sistema, e a primeira decisão é reconhecer que **o banco não é o lugar**. Procurar um termo dentro de um texto com o operador de semelhança do SQL obriga a varrer as linhas, porque o índice comum é ordenado por valor inteiro e não ajuda a achar palavra no meio.\n\nO que resolve é uma estrutura diferente, o **índice invertido**: em vez de mapear documento para o texto dele, mapeia cada termo para a lista de documentos onde ele aparece. Procurar duas palavras vira interseção de duas listas, operação rápida e barata.",
                },
                {
                    type: "code",
                    value: 'Documentos:\n  1: "curso de sistemas distribuidos"\n  2: "curso de banco de dados"\n  3: "sistemas operacionais"\n\nIndice invertido:\n  curso        -> [1, 2]\n  sistemas     -> [1, 3]\n  distribuidos -> [1]\n  banco        -> [2]\n  dados        -> [2]\n  operacionais -> [3]\n\nBusca por "curso sistemas" = intersecao de [1,2] e [1,3] = [1]',
                },
                {
                    type: "text",
                    value: '## O índice é uma cópia, e isso tem consequências\n\nO índice de busca vive fora do banco e é alimentado por ele, normalmente por evento, no padrão de pub/sub do módulo 3. Isso significa que ele é **eventualmente consistente** por construção: um item recém-criado pode não aparecer na busca por alguns segundos.\n\nDizer isso antes de perguntarem é ótimo, e a solução prática também: quando o requisito exige que o próprio usuário encontre o que acabou de criar, busca-se no índice e complementa-se com uma consulta direta ao banco pelos itens recentes daquele usuário. Vale também citar a reconstrução: como o índice é derivado, ele pode ser **jogado fora e refeito** a partir do banco, o que é uma propriedade valiosa quando o esquema de busca muda.',
                },
                {
                    type: "text",
                    value: "## Sugestão enquanto digita é outro problema\n\nA sugestão que aparece a cada tecla parece busca e não é. As diferenças mudam o desenho: o volume de requisições é muito maior, porque cada letra gera uma; a resposta precisa ser quase instantânea, na casa de dezenas de milissegundos; e o conjunto de respostas possíveis é pequeno e previsível, porque prefixos populares se repetem muito entre usuários.\n\nA estrutura clássica é a **trie**, uma árvore de prefixos em que cada caminho da raiz até um nó forma um prefixo e cada nó guarda as melhores sugestões que começam com ele. Assim, responder é caminhar poucas letras e devolver a lista já pronta, sem ranquear nada na hora. A trie inteira cabe em memória, e é atualizada em lote, de tempos em tempos, a partir do que as pessoas realmente buscaram.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Busca completa", "Sugestão enquanto digita"], ["Estrutura", "Índice invertido", "Árvore de prefixos em memória"], ["Volume", "Uma por busca", "Uma por tecla digitada"], ["Latência aceitável", "Centenas de milissegundos", "Dezenas de milissegundos"], ["Atualização", "Por evento, quase em tempo real", "Em lote, de tempos em tempos"], ["Cacheável na borda", "Pouco, resultado varia", "Muito, prefixos se repetem"]]',
                },
                {
                    type: "text",
                    value: '## Os cortes que sempre valem citar\n\nDois. O primeiro é **não sugerir com menos de duas ou três letras**, porque com uma letra o conjunto é enorme, a sugestão é inútil e o volume de requisições é o maior de todos. O segundo é **atrasar o disparo**, esperando algumas centenas de milissegundos sem digitação antes de consultar, o que reduz drasticamente o número de chamadas de quem digita rápido.\n\nEsses dois cortes são de front-end e derrubam a carga em uma ordem de grandeza, o que é exatamente o tipo de solução barata que a régua de custo valoriza. E como o resultado de um prefixo é igual para quase todo mundo, ele é um dos melhores candidatos a cache de borda que existem.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** busca textual pede **índice invertido**, não varredura no banco. Esse índice é uma **cópia derivada**, então é eventualmente consistente e pode ser refeito do zero. **Sugestão enquanto digita** é outro problema: **trie em memória** com as sugestões já prontas, atualizada em lote. Corte com **mínimo de letras** e **atraso no disparo**, e cacheie o prefixo na borda.",
                },
            ],
            questions: [
                {
                    statement: "Por que o índice comum do banco não resolve busca por termo dentro de um texto?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele é ordenado pelo valor inteiro, não pelas palavras.", isCorrect: true },
                        { text: "Ele não aceita colunas de texto com tamanho variável.", isCorrect: false },
                        { text: "Ele precisa ser reconstruído a cada nova inserção feita.", isCorrect: false },
                        { text: "Ele só funciona quando a tabela cabe inteira em memória.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um índice invertido mapeia?",
                    difficulty: "facil",
                    options: [
                        { text: "Cada termo para a lista de documentos onde ele aparece.", isCorrect: true },
                        { text: "Cada documento para a lista de termos que ele contém.", isCorrect: false },
                        { text: "Cada prefixo para as sugestões que começam com ele.", isCorrect: false },
                        { text: "Cada consulta para o resultado devolvido anteriormente.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual propriedade decorre de o índice de busca ser uma cópia derivada do banco?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele pode ser descartado e reconstruído do zero.", isCorrect: true },
                        { text: "Ele passa a exigir escrita síncrona junto com o banco.", isCorrect: false },
                        { text: "Ele precisa usar a mesma chave de partição do banco.", isCorrect: false },
                        { text: "Ele deixa de precisar de replicação para sobreviver a falhas.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual estrutura resolve sugestão enquanto digita e por quê?",
                    difficulty: "dificil",
                    options: [
                        { text: "Trie, porque guarda as sugestões já prontas por prefixo.", isCorrect: true },
                        { text: "Índice invertido, porque intersecta as listas rapidamente.", isCorrect: false },
                        { text: "Tabela hash, porque busca por chave em tempo constante.", isCorrect: false },
                        { text: "Árvore balanceada, porque mantém as chaves em ordem.", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais cortes de front-end reduzem mais a carga de sugestão enquanto digita?",
                    difficulty: "medio",
                    options: [
                        { text: "Exigir um mínimo de letras e atrasar o disparo.", isCorrect: true },
                        { text: "Limitar a taxa por usuário e recusar o excedente.", isCorrect: false },
                        { text: "Reduzir o número de sugestões devolvidas por consulta.", isCorrect: false },
                        { text: "Comprimir a resposta e reaproveitar a conexão aberta.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Feed: montar na leitura ou na escrita",
            blocks: [
                {
                    type: "text",
                    value: "# Feed: montar na leitura ou na escrita\n\nO feed é o problema mais reaproveitável do System Design, porque a decisão que ele exige aparece em dezenas de outros lugares: **fazer o trabalho na hora do pedido ou antecipá-lo na hora da escrita**. Timeline de rede social, caixa de entrada, painel de notificações e lista de recomendações são todos a mesma pergunta.\n\nO contexto é o do módulo 2: leitura muitas ordens de grandeza mais frequente que escrita. Isso já sugere a resposta, e é justamente por isso que a exceção que vem depois é tão interessante.",
                },
                {
                    type: "text",
                    value: '## Puxar na leitura\n\nNo modelo **pull**, nada é preparado. Quando alguém abre o feed, o sistema descobre quem essa pessoa segue, busca as publicações recentes dessas contas, junta, ordena e devolve.\n\nA vantagem é a simplicidade: nada é duplicado, a escrita é trivial, e quem publica nunca gera trabalho proporcional ao número de seguidores. A desvantagem aparece na leitura: uma pessoa que segue 500 contas exige uma consulta que toca 500 conjuntos de dados, em plena requisição do usuário, toda vez que ela abre o aplicativo. Com dezenas de milhares de leituras por segundo, isso não se sustenta.',
                },
                {
                    type: "text",
                    value: '## Empurrar na escrita\n\nNo modelo **push**, também chamado de fan-out na escrita, o trabalho é antecipado. Quando alguém publica, o sistema copia a referência daquela publicação para a caixa de entrada de cada seguidor, que fica pré-montada. Ler o feed vira ler uma lista pronta, ordenada, com uma consulta simples.\n\nO custo migrou para a escrita, e o valor dele depende do número de seguidores. Publicar para 200 seguidores é barato. Publicar para 30 milhões significa 30 milhões de escritas por uma única ação, e ainda com a expectativa de que a publicação apareça em segundos. É o **problema da celebridade**, e é o ponto que a pergunta sempre explora.',
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Pull (na leitura)", "Push (na escrita)"], ["Custo da escrita", "Constante", "Proporcional aos seguidores"], ["Custo da leitura", "Alto e repetido", "Baixo, lista pronta"], ["Espaço", "Sem duplicação", "Uma cópia por seguidor"], ["Conta com muitos seguidores", "Sem problema", "Explode a escrita"], ["Conta inativa", "Sem custo", "Escreve para quem nunca vai ler"]]',
                },
                {
                    type: "text",
                    value: '## O híbrido, que é a resposta esperada\n\nA solução adotada na prática é misturar, separando as contas por tamanho. Contas comuns usam **push**: publicam e a referência é distribuída para as caixas de entrada dos seguidores. Contas muito grandes usam **pull**: nada é distribuído, e as publicações delas são buscadas na hora da leitura e mescladas com a caixa já pronta.\n\nAssim, ler um feed é ler a lista pré-montada e somar as poucas contas grandes que a pessoa segue, o que é rápido, e publicar como celebridade custa uma escrita só. O limiar entre os dois grupos é um parâmetro, não uma verdade, e vale dizer isso: pode ser dez mil seguidores, pode ser cem mil, e se ajusta observando o sistema.\n\nDuas otimizações completam a resposta: não distribuir para contas inativas há muito tempo, montando o feed delas sob demanda quando voltarem; e distribuir para seguidores em ordem de atividade, para que quem está online agora receba primeiro.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** feed é a escolha entre trabalhar na **leitura** ou antecipar na **escrita**. Pull é simples e cobra caro em toda leitura; push entrega leitura barata e explode no **problema da celebridade**. A resposta esperada é o **híbrido**: push para contas comuns, pull para as muito grandes, com o limiar como parâmetro ajustável, sem distribuir para inativos.",
                },
            ],
            questions: [
                {
                    statement: "No modelo pull, onde está o custo do feed?",
                    difficulty: "facil",
                    options: [
                        { text: "Na leitura, que consulta todas as contas seguidas.", isCorrect: true },
                        { text: "Na escrita, que copia a publicação para cada seguidor.", isCorrect: false },
                        { text: "No espaço, por duplicar a publicação muitas vezes.", isCorrect: false },
                        { text: "Na ordenação, que precisa ser refeita a cada publicação.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é o problema da celebridade no fan-out na escrita?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma publicação vira milhões de escritas de uma vez.", isCorrect: true },
                        { text: "A conta grande recebe publicações demais em seu próprio feed.", isCorrect: false },
                        { text: "A ordenação do feed passa a favorecer as contas populares.", isCorrect: false },
                        { text: "O cache do feed é invalidado sempre que a conta publica.", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o modelo híbrido trata as contas com muitos seguidores?",
                    difficulty: "medio",
                    options: [
                        { text: "Não distribui, e busca as publicações na leitura.", isCorrect: true },
                        { text: "Distribui em segundo plano, ao longo das horas seguintes.", isCorrect: false },
                        { text: "Distribui apenas para os seguidores mais engajados da conta.", isCorrect: false },
                        { text: "Guarda a publicação em cache de borda e serve a partir dele.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a natureza do limiar que separa contas comuns de contas grandes?",
                    difficulty: "dificil",
                    options: [
                        { text: "É um parâmetro ajustável pela observação do sistema.", isCorrect: true },
                        { text: "É um valor fixo derivado do número total de usuários.", isCorrect: false },
                        { text: "É definido pelo tamanho máximo da caixa de entrada.", isCorrect: false },
                        { text: "É calculado a cada publicação, conforme a carga do momento.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual otimização evita trabalho inútil no fan-out na escrita?",
                    difficulty: "medio",
                    options: [
                        { text: "Não distribuir para contas inativas há muito tempo.", isCorrect: true },
                        { text: "Distribuir apenas as publicações com mais interações.", isCorrect: false },
                        { text: "Limitar o tamanho da caixa de entrada de cada usuário.", isCorrect: false },
                        { text: "Comprimir as referências guardadas em cada caixa de entrada.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Idempotência e o mito do exactly-once",
            blocks: [
                {
                    type: "text",
                    value: "# Idempotência e o mito do exactly-once\n\nEsta é a aula que amarra o módulo, porque o padrão dela aparece em todos os outros. A rede não é confiável: uma requisição pode chegar e a resposta se perder no caminho de volta. Do lado de quem chamou, os dois casos são indistinguíveis, e a reação natural é **tentar de novo**.\n\nDaí nasce o problema central dos sistemas distribuídos: a operação pode acontecer mais de uma vez. Se for uma cobrança, o cliente é cobrado duas vezes.",
                },
                {
                    type: "quote",
                    value: "Uma operação é **idempotente** quando executá-la várias vezes tem o mesmo efeito de executá-la uma vez. Não significa devolver sempre a mesma resposta, significa não produzir efeito adicional a cada repetição.",
                },
                {
                    type: "text",
                    value: '## Por que exactly-once não existe na entrega\n\nExistem três garantias de entrega possíveis. **No máximo uma vez**: manda e não repete, então pode perder. **Ao menos uma vez**: repete até confirmar, então pode duplicar. **Exatamente uma vez** seria não perder e não duplicar, e ela é impossível de garantir apenas com entrega, porque o remetente nunca consegue distinguir "a mensagem não chegou" de "chegou e a confirmação se perdeu".\n\nO que existe, e é o que os sistemas sérios oferecem, é **entrega ao menos uma vez somada a processamento idempotente**, que produz um efeito equivalente a exatamente uma vez. Dizer a frase nessa ordem, e não como se exactly-once fosse um recurso a ativar, é um bom sinal de maturidade numa sessão.',
                },
                {
                    type: "table",
                    value: '[["Operação", "É idempotente?", "Observação"], ["GET de um recurso", "Sim", "Só lê"], ["PUT com o estado completo", "Sim", "Grava o mesmo valor de novo"], ["DELETE de um id", "Sim", "Já apagado continua apagado"], ["POST criando recurso", "Não", "Cada chamada cria outro"], ["Incrementar um contador", "Não", "Cada chamada soma de novo"], ["Definir o saldo como um valor", "Sim", "Estado final não depende de repetições"]]',
                },
                {
                    type: "text",
                    value: '## A chave de idempotência\n\nO mecanismo padrão para tornar idempotente uma operação que não é, como criar um pagamento, é a **chave de idempotência**. Quem chama gera um identificador único para aquela intenção e o envia junto, normalmente num cabeçalho.\n\nO servidor guarda essa chave junto com o resultado. Na primeira vez, processa e grava. Se a mesma chave chegar de novo, ele não processa: devolve o resultado guardado. O detalhe que separa uma resposta boa é a **atomicidade**: gravar a chave e aplicar o efeito precisam acontecer na mesma transação, senão existe uma janela em que a cobrança foi feita e a chave não foi registrada, e a repetição cobra de novo. E vale lembrar que essas chaves têm prazo de validade, porque guardá-las para sempre custa espaço.',
                },
                {
                    type: "code",
                    value: "Fluxo com chave de idempotencia:\n\n  cliente -> POST /pagamentos\n             Idempotency-Key: 8f3a-91cd-...\n\n  servidor:\n    inicia transacao\n      SELECT resultado WHERE chave = '8f3a-91cd-...'\n      se existe        -> devolve o resultado guardado, fim\n      se nao existe    -> aplica o efeito\n                          grava chave + resultado\n    confirma transacao\n\n  Repeticao com a mesma chave devolve o mesmo resultado,\n  sem cobrar de novo.",
                },
                {
                    type: "text",
                    value: '## Onde mais isso aparece\n\nGuarde os três lugares, porque eles voltam no módulo 6. Em **consumidor de fila**, já que a entrega é ao menos uma vez: o consumidor registra os identificadores já processados e ignora repetição. Em **retentativa automática**, porque um cliente que repete com backoff precisa que o servidor tolere a repetição, senão o próprio mecanismo de resiliência vira fonte de duplicidade. E em **integração com terceiros**, onde a retentativa está fora do seu controle e a única defesa é a sua ponta ser idempotente.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** repetir é inevitável, porque quem chamou não distingue perda de requisição de perda de resposta. **Exactly-once não existe na entrega**: o que existe é **ao menos uma vez mais processamento idempotente**. A **chave de idempotência** torna idempotente o que não é, e gravar a chave junto com o efeito precisa ser **atômico**. O padrão volta em consumidor de fila, retentativa e integração externa.",
                },
            ],
            questions: [
                {
                    statement: "O que significa uma operação ser idempotente?",
                    difficulty: "facil",
                    options: [
                        { text: "Repeti-la não produz efeito adicional.", isCorrect: true },
                        { text: "Ela devolve exatamente a mesma resposta em toda chamada.", isCorrect: false },
                        { text: "Ela só pode ser executada uma vez por cliente registrado.", isCorrect: false },
                        { text: "Ela é aplicada dentro de uma transação do banco de dados.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a entrega exatamente uma vez não é possível de garantir?",
                    difficulty: "dificil",
                    options: [
                        { text: "O remetente não distingue perda de mensagem de perda da resposta.", isCorrect: true },
                        { text: "As redes atuais não oferecem confirmação de entrega verdadeiramente confiável.", isCorrect: false },
                        { text: "O receptor não consegue identificar mensagens já processadas.", isCorrect: false },
                        { text: "A ordem das mensagens não é preservada entre as partições.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual destas operações não é naturalmente idempotente?",
                    difficulty: "medio",
                    options: [
                        { text: "Incrementar um contador.", isCorrect: true },
                        { text: "Apagar um recurso por id.", isCorrect: false },
                        { text: "Definir o saldo como um valor.", isCorrect: false },
                        { text: "Gravar o estado completo do recurso.", isCorrect: false },
                    ],
                },
                {
                    statement: "Ao usar chave de idempotência, o que precisa acontecer de forma atômica?",
                    difficulty: "dificil",
                    options: [
                        { text: "Gravar a chave e aplicar o efeito.", isCorrect: true },
                        { text: "Gerar a chave e enviar a requisição ao servidor.", isCorrect: false },
                        { text: "Consultar a chave e devolver a resposta ao cliente.", isCorrect: false },
                        { text: "Expirar a chave e liberar o espaço que ela ocupava.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual combinação produz efeito equivalente a processar exatamente uma vez?",
                    difficulty: "medio",
                    options: [
                        { text: "Entrega ao menos uma vez com processamento idempotente.", isCorrect: true },
                        { text: "Entrega no máximo uma vez com confirmação do consumidor.", isCorrect: false },
                        { text: "Entrega ordenada por partição com retentativa automática.", isCorrect: false },
                        { text: "Entrega confirmada em transação distribuída entre serviços.", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Estudos de caso",
    aulas: [
        {
            titulo: "Encurtador de URL",
            blocks: [
                {
                    type: "text",
                    value: "# Encurtador de URL\n\nEste é o problema de abertura em quase todo material, e por um bom motivo: ele é pequeno o bastante para caber numa sessão inteira e grande o bastante para exercitar o roteiro completo. Vamos aplicá-lo na ordem do módulo 1, sem pular etapa.\n\n**Requisitos funcionais**, cortados: encurtar uma URL longa e devolver a curta; redirecionar a curta para a longa; opcionalmente permitir um apelido escolhido pelo usuário. Ficam de fora: contas, painel de estatísticas e expiração personalizada.\n\n**Não funcionais**: o redirecionamento precisa ser rápido, porque está no caminho do usuário; a leitura é muito mais frequente que a escrita; e um link não pode deixar de funcionar, o que empurra durabilidade para o topo.",
                },
                {
                    type: "code",
                    value: "Estimativa:\n\n  100.000.000 links criados por mes\n  100M / (30 x 100.000 s) = cerca de 35 escritas por segundo\n\n  Proporcao de leitura 100:1\n  35 x 100 = 3.500 redirecionamentos por segundo\n  com pico de 3x  = cerca de 10.000 por segundo\n\nArmazenamento:\n  500 bytes por registro (url longa + curta + metadados)\n  100M x 500 B = 50 GB por mes\n  50 GB x 12 x 5 anos = cerca de 3 TB em cinco anos",
                },
                {
                    type: "text",
                    value: "## O que a conta já decidiu\n\nTrês coisas, e vale dizê-las em voz alta. Trinta e cinco escritas por segundo é carga pequena: **um banco resolve**, sem sharding. Três terabytes em cinco anos também cabem numa instância grande com réplicas, então não há motivo para particionar. E 10 mil leituras por segundo de um dado que nunca muda é o caso perfeito de **cache**, com taxa de acerto altíssima esperada.\n\nRepare que a conta acabou de eliminar duas complexidades que muita gente desenha por reflexo. Esse é exatamente o uso da estimativa ensinado no módulo 2.",
                },
                {
                    type: "text",
                    value: '## Gerar o código curto\n\nEsta é a decisão central, e existem três caminhos. **Hash da URL longa**, cortando os primeiros caracteres: simples, mas colide, e tratar colisão exige verificar existência a cada criação. **Aleatório com verificação**: sorteia, checa se já existe, repete se preciso; a chance de colisão cresce conforme o espaço enche. E **contador convertido para base 62**, que é o caminho preferido: um número sempre crescente é convertido para os 62 caracteres possíveis, o que garante unicidade sem verificar nada.\n\nCom 7 caracteres em base 62 há 62 elevado a 7, cerca de 3,5 trilhões de combinações, o que cobre a escala estimada com folga enorme. O contador global vem do padrão do módulo 5: faixas pré-alocadas, cada instância pegando um bloco de identificadores de cada vez, ou um gerador estilo Snowflake. E como o contador é sequencial, os códigos ficam previsíveis, o que se resolve embaralhando os bits antes de converter, quando isso importa.',
                },
                {
                    type: "table",
                    value: '[["Decisão", "Escolha", "Por quê"], ["Geração do código", "Contador em base 62", "Único sem verificar colisão"], ["Banco", "Um só, com réplicas", "35 escritas por segundo não pedem sharding"], ["Cache", "Em memória, na frente da leitura", "Dado imutável e leitura 100x maior"], ["Redirecionamento", "301 ou 302", "302 preserva a passagem pelo servidor"], ["Camada de entrada", "Balanceador e CDN para estáticos", "Redirecionamento é dinâmico e curto"]]',
                },
                {
                    type: "text",
                    value: '## Os dois aprofundamentos que costumam vir\n\nO primeiro é **301 ou 302**. O 301 é permanente e o navegador passa a nem consultar o servidor, o que é ótimo para latência e péssimo se você quiser contar cliques ou trocar o destino depois. O 302 mantém toda requisição passando por você. A resposta boa depende do requisito, e como cortamos estatísticas do escopo, 301 é defensável; se estatística voltasse ao escopo, 302 seria a escolha.\n\nO segundo é **o que acontece se o cache cair**. Com 10 mil leituras por segundo e taxa de acerto alta, o banco recebe centenas por segundo normalmente e receberia as 10 mil de uma vez numa avalanche. A resposta é a do módulo 2: aquecer o cache antes de receber tráfego, distribuir o vencimento das chaves para não expirarem juntas, e ter réplicas de leitura capazes de absorver o pico enquanto o cache se refaz.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** no encurtador, a conta mostra carga de escrita pequena e leitura alta de dado imutável, o que **elimina sharding** e **exige cache**. O código curto sai de um **contador em base 62**, que dispensa tratar colisão. Os aprofundamentos clássicos são **301 x 302** e a **avalanche** quando o cache esvazia.",
                },
            ],
            questions: [
                {
                    statement: "Com cerca de 35 escritas por segundo e 3 TB em cinco anos, o que a estimativa já elimina?",
                    difficulty: "medio",
                    options: [
                        { text: "A necessidade de particionar o banco de dados.", isCorrect: true },
                        { text: "A necessidade de cache na frente da leitura.", isCorrect: false },
                        { text: "A necessidade de réplicas para leitura e falha.", isCorrect: false },
                        { text: "A necessidade de um balanceador na entrada.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que converter um contador para base 62 é preferível a sortear o código?",
                    difficulty: "medio",
                    options: [
                        { text: "Garante unicidade sem precisar verificar colisão.", isCorrect: true },
                        { text: "Gera códigos mais curtos para o mesmo espaço de valores.", isCorrect: false },
                        { text: "Torna os códigos impossíveis de adivinhar por terceiros.", isCorrect: false },
                        { text: "Dispensa qualquer forma de coordenação entre as instâncias.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a desvantagem de responder o redirecionamento com 301 permanente?",
                    difficulty: "dificil",
                    options: [
                        { text: "O navegador para de consultar o servidor nas vezes seguintes.", isCorrect: true },
                        { text: "O redirecionamento fica mais lento do que aconteceria com o 302.", isCorrect: false },
                        { text: "O código curto deixa de poder ser reaproveitado depois.", isCorrect: false },
                        { text: "O cache do servidor perde efeito para aquele link.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o dado de um encurtador é um caso quase ideal para cache?",
                    difficulty: "facil",
                    options: [
                        { text: "É imutável e lido muitas vezes mais do que escrito.", isCorrect: true },
                        { text: "É pequeno o suficiente para caber inteiro em memória.", isCorrect: false },
                        { text: "Tem prazo de validade curto definido na criação do link.", isCorrect: false },
                        { text: "É acessado sempre pelos mesmos usuários autenticados.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual medida reduz o risco de avalanche quando muitas chaves de cache vencem juntas?",
                    difficulty: "dificil",
                    options: [
                        { text: "Distribuir o vencimento das chaves ao longo do tempo.", isCorrect: true },
                        { text: "Aumentar o tempo de vida de todas as chaves igualmente.", isCorrect: false },
                        { text: "Reduzir o tamanho do cache para caber só o dado quente.", isCorrect: false },
                        { text: "Gravar no cache apenas na leitura, e nunca na escrita.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Chat em tempo real",
            blocks: [
                {
                    type: "text",
                    value: "# Chat em tempo real\n\nO chat introduz um elemento que nenhum caso anterior tinha: o servidor precisa **empurrar** dado para o cliente, sem que ele peça. Isso quebra o modelo de requisição e resposta e é o coração da pergunta.\n\n**Funcionais**, cortados: mensagem um a um, grupo pequeno, histórico, e indicador de entregue e lido. Fora do escopo: chamada de vídeo, anexo grande e reações.\n\n**Não funcionais**: entrega em menos de um segundo; nenhuma mensagem pode ser perdida, o que coloca durabilidade acima de latência quando as duas brigam; e a ordem dentro de uma conversa precisa fazer sentido.",
                },
                {
                    type: "text",
                    value: "## Como o servidor empurra\n\nTrês opções aparecem. **Polling** é o cliente perguntando de tempos em tempos: simples e desperdiça muito, porque a maioria das perguntas volta vazia. **Long polling** é a requisição que fica aberta até haver novidade: funciona em qualquer infraestrutura e é a alternativa de compatibilidade. E **WebSocket** é uma conexão persistente e bidirecional, que é a escolha natural aqui, porque o tráfego vai nos dois sentidos e a latência precisa ser baixa.\n\nVale citar o parente: **eventos enviados pelo servidor** são unidirecionais e mais simples, ótimos para notificação e painel ao vivo, mas insuficientes para chat, onde o cliente também envia o tempo todo.",
                },
                {
                    type: "text",
                    value: '## O problema real: conexão com estado\n\nAqui está a virada da pergunta. Uma conexão persistente **prende o usuário a uma máquina específica**, que é exatamente o oposto da aplicação sem estado que o módulo 3 defendeu. Se Ana está conectada ao servidor 3 e Bruno ao servidor 17, como a mensagem de Bruno chega até Ana?\n\nA resposta tem duas partes. Primeiro, um **registro de presença**: uma tabela em cache que diz em qual servidor cada usuário está conectado, escrita quando a conexão abre e apagada quando fecha. Segundo, um **canal entre servidores**: o servidor 17 consulta o registro, descobre o servidor 3 e entrega a mensagem a ele, seja por chamada direta, seja publicando num tópico que o servidor 3 assina. O registro é a peça que costuma faltar nas respostas incompletas.',
                },
                {
                    type: "code",
                    value: "Caminho de uma mensagem:\n\n  Bruno --WebSocket--> servidor 17\n    1. servidor 17 grava a mensagem (durabilidade primeiro)\n    2. confirma para Bruno: enviada\n    3. consulta presenca: Ana esta no servidor 3?\n       sim -> entrega ao servidor 3 -> Ana recebe -> entregue\n       nao -> enfileira notificacao push\n    4. Ana abre a conversa -> marca como lida -> avisa Bruno",
                },
                {
                    type: "text",
                    value: '## Guardar mensagem e ordenar\n\nO padrão de acesso do chat é bem específico: escreve muito, lê quase sempre as mensagens recentes de uma conversa, e ordena por tempo. Isso aponta para particionar por **identificador da conversa**, com as mensagens ordenadas dentro do pedaço, de modo que abrir uma conversa toque um pedaço só. É o critério do módulo 4 aplicado direto.\n\nA ordem merece cuidado. Relógio de servidor não basta, porque servidores diferentes discordam em milissegundos. A saída usual é gerar o identificador da mensagem com um esquema ordenável por tempo, como o Snowflake do módulo 5, e ordenar por ele. Dentro de uma conversa isso resolve; entre conversas diferentes a ordem global não importa, e é bom dizer isso, porque mostra que você sabe onde a garantia é necessária e onde ela seria desperdício.',
                },
                {
                    type: "text",
                    value: '## Entregue, lido e o que acontece offline\n\nOs indicadores são, na prática, três eventos com destinos diferentes: **enviada** quando o servidor gravou, **entregue** quando o dispositivo do destinatário confirmou o recebimento, e **lida** quando ele abriu a conversa. Cada um viaja de volta para o remetente pelo mesmo caminho da mensagem original.\n\nSe o destinatário está offline, a presença não encontra servidor, e a mensagem fica guardada esperando. Entra uma **notificação push** por serviço externo, e a mensagem é entregue quando ele reconectar, o que faz do chat também um caso de sincronização: ao reconectar, o cliente pede tudo o que aconteceu depois do último identificador que ele já tem.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** chat exige o servidor **empurrar**, e a escolha natural é **WebSocket**. O problema real é a conexão com **estado**: resolve-se com um **registro de presença** dizendo em qual servidor cada usuário está, mais um canal entre servidores. Particione por **conversa** e ordene por identificador ordenável no tempo. Offline vira **push** mais sincronização a partir do último identificador conhecido.",
                },
            ],
            questions: [
                {
                    statement: "Por que o WebSocket é a escolha natural para um chat, e não os eventos enviados pelo servidor?",
                    difficulty: "medio",
                    options: [
                        { text: "O tráfego precisa ir nos dois sentidos.", isCorrect: true },
                        { text: "Os eventos enviados pelo servidor não atravessam proxies.", isCorrect: false },
                        { text: "O WebSocket garante a ordem das mensagens na conversa.", isCorrect: false },
                        { text: "Os eventos enviados pelo servidor não sobrevivem a reconexões.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual problema a conexão persistente cria na arquitetura?",
                    difficulty: "medio",
                    options: [
                        { text: "O usuário fica preso a uma máquina específica.", isCorrect: true },
                        { text: "As mensagens deixam de poder ser gravadas em banco.", isCorrect: false },
                        { text: "O balanceador perde a capacidade de fazer health check.", isCorrect: false },
                        { text: "A ordem das mensagens passa a depender do relógio local.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual peça permite que um servidor entregue mensagem a um usuário conectado em outro?",
                    difficulty: "facil",
                    options: [
                        { text: "Um registro de presença por usuário.", isCorrect: true },
                        { text: "Um cache das mensagens recentes de cada conversa.", isCorrect: false },
                        { text: "Um balanceador com sessão fixa por endereço de origem.", isCorrect: false },
                        { text: "Um índice invertido sobre o conteúdo das mensagens.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que particionar as mensagens pelo identificador da conversa?",
                    difficulty: "medio",
                    options: [
                        { text: "Abrir uma conversa passa a tocar um pedaço só.", isCorrect: true },
                        { text: "As conversas têm todas o mesmo volume de mensagens.", isCorrect: false },
                        { text: "Permite ordenar globalmente todas as mensagens do sistema.", isCorrect: false },
                        { text: "Evita que uma conversa muito ativa gere ponto quente.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que não usar o relógio do servidor para ordenar as mensagens?",
                    difficulty: "dificil",
                    options: [
                        { text: "Servidores diferentes discordam em milissegundos.", isCorrect: true },
                        { text: "O relógio não tem resolução suficiente para mensagens.", isCorrect: false },
                        { text: "A gravação no banco acontece fora da ordem de chegada.", isCorrect: false },
                        { text: "O cliente pode enviar mensagens com data adulterada.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Feed social",
            blocks: [
                {
                    type: "text",
                    value: "# Feed social\n\nO feed junta quase tudo o que a trilha viu. A decisão central, entre montar na leitura ou na escrita, já foi tratada no módulo 5; aqui ela entra como **uma** decisão dentro de um desenho completo, que é como ela aparece de verdade.\n\n**Funcionais**, cortados: publicar; ver o feed de quem eu sigo, ordenado; seguir e deixar de seguir. Fora: comentário, mensagem direta e busca.\n\n**Não funcionais**: o feed abre em menos de 200ms, porque é a primeira tela do aplicativo; a publicação pode demorar alguns segundos para aparecer no feed alheio, e essa frouxidão é o que torna o desenho viável; nada se perde.",
                },
                {
                    type: "code",
                    value: "Estimativa:\n\n  50.000.000 usuarios ativos por dia\n  x 20 aberturas de feed = 1.000.000.000 leituras por dia\n  1B / 100.000 = 10.000 leituras por segundo, pico 30.000\n\n  2.000.000 publicacoes por dia\n  2M / 100.000 = 20 escritas por segundo, pico 60\n\n  Proporcao de 500 leituras para cada escrita\n  Media de 200 seguidores por conta\n  Fan-out medio = 20 x 200 = 4.000 escritas por segundo em caixas",
                },
                {
                    type: "text",
                    value: '## O que a conta decide aqui\n\nA proporção de 500 para 1 é o argumento definitivo para **antecipar o trabalho na escrita**: vale gastar 4 mil escritas por segundo em caixas de entrada para transformar 30 mil leituras por segundo em consultas simples de lista pronta.\n\nE a mesma conta mostra por que a exceção existe. Com uma conta de 30 milhões de seguidores, uma única publicação geraria 30 milhões de escritas, o que a média de 4 mil por segundo esconde. Daí o híbrido: **push para contas comuns, pull para as grandes**, com o feed final sendo a mescla da caixa pronta com as poucas contas grandes que a pessoa segue.',
                },
                {
                    type: "table",
                    value: '[["Componente", "Escolha", "Justificativa"], ["Caixa de entrada", "Lista por usuário em cache, com referências", "Leitura vira busca de lista pronta"], ["Publicações", "Banco particionado por id da publicação", "Guarda o conteúdo uma vez só"], ["Grafo de seguidores", "Armazenamento próprio, otimizado por leitura", "Consultado a cada publicação"], ["Distribuição", "Fila e workers, fora da requisição", "Publicar não espera o fan-out terminar"], ["Mídia", "Blob storage servido por CDN", "Domina banda e não pode sair da aplicação"]]',
                },
                {
                    type: "text",
                    value: '## A caixa guarda referência, não conteúdo\n\nDetalhe que rende ponto: a caixa de entrada guarda apenas o **identificador** da publicação, e não o texto dela. Se guardasse o conteúdo, uma publicação com um milhão de seguidores existiria um milhão de vezes, e editar ou apagar exigiria varrer todas as cópias.\n\nGuardando referência, o conteúdo vive num lugar só. Ler o feed passa a ser: pegar a lista de identificadores, buscar as publicações correspondentes (quase sempre em cache, porque publicações recentes são lidas por muita gente ao mesmo tempo), e montar. Apagar uma publicação vira apagar um registro, e as caixas simplesmente deixam de encontrá-la.',
                },
                {
                    type: "text",
                    value: '## Publicar sem esperar o fan-out\n\nO caminho de escrita precisa ser curto. Quando alguém publica, o sistema grava a publicação, confirma para o usuário e **enfileira** o trabalho de distribuição. O usuário não espera as milhares de escritas de caixa, e o pico de distribuição é absorvido pela fila, exatamente como o módulo 3 descreveu.\n\nEsse desenho também dá a resposta para a falha: se um worker morrer no meio, a mensagem volta para a fila e outro reprocessa, o que significa que a caixa pode receber a mesma referência duas vezes. É por isso que o consumidor precisa ser **idempotente**, e uma lista que ignora identificador repetido resolve. Fecha o ciclo com o módulo 5.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** a proporção de **500 leituras para 1 escrita** justifica antecipar o trabalho na escrita, e o **híbrido** cobre as contas grandes. A caixa de entrada guarda **referência**, nunca conteúdo, para não duplicar nem complicar a exclusão. Publicar **confirma antes** do fan-out, que roda por fila, e por isso o consumidor precisa ser **idempotente**.",
                },
            ],
            questions: [
                {
                    statement: "Qual número justifica antecipar o trabalho na escrita no feed?",
                    difficulty: "medio",
                    options: [
                        { text: "A proporção de 500 leituras para cada escrita.", isCorrect: true },
                        { text: "A média de 200 seguidores por conta do sistema.", isCorrect: false },
                        { text: "O pico de 60 publicações por segundo estimado.", isCorrect: false },
                        { text: "O limite de 200ms para abrir a primeira tela.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a caixa de entrada guarda referência em vez do conteúdo da publicação?",
                    difficulty: "medio",
                    options: [
                        { text: "Para não duplicar o conteúdo em cada seguidor.", isCorrect: true },
                        { text: "Para permitir ordenar a lista por data de publicação.", isCorrect: false },
                        { text: "Para que a leitura do feed não precise de cache.", isCorrect: false },
                        { text: "Para reduzir o número de escritas durante o fan-out.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com o usuário que publica, no momento em que aperta o botão?",
                    difficulty: "facil",
                    options: [
                        { text: "Recebe a confirmação antes de o fan-out terminar.", isCorrect: true },
                        { text: "Espera a distribuição para todos os seguidores terminar.", isCorrect: false },
                        { text: "Recebe a confirmação apenas quando o cache é atualizado.", isCorrect: false },
                        { text: "Espera o índice de busca indexar a nova publicação.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o worker que distribui o fan-out precisa ser idempotente?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma falha faz a mensagem voltar para a fila e rodar de novo.", isCorrect: true },
                        { text: "Vários workers acabam consumindo a mesma mensagem ao mesmo tempo.", isCorrect: false },
                        { text: "A ordem de entrega das mensagens na fila não é garantida.", isCorrect: false },
                        { text: "O usuário pode publicar o mesmo conteúdo mais de uma vez.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que apagar uma publicação fica simples nesse desenho?",
                    difficulty: "medio",
                    options: [
                        { text: "O conteúdo existe em um lugar só.", isCorrect: true },
                        { text: "As caixas de entrada são reconstruídas periodicamente.", isCorrect: false },
                        { text: "O fan-out desfaz as escritas ao receber o evento de exclusão.", isCorrect: false },
                        { text: "O cache expira as publicações apagadas em poucos segundos.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Upload e streaming de vídeo",
            blocks: [
                {
                    type: "text",
                    value: "# Upload e streaming de vídeo\n\nVídeo muda a natureza da conta. Nos casos anteriores, o dado era pequeno e a carga vinha do número de operações. Aqui uma única operação move centenas de megabytes, e a conta de **banda** passa a dominar tudo, como o módulo 2 antecipou.\n\n**Funcionais**, cortados: enviar um vídeo; assistir com qualidade adaptada à conexão; buscar por título. Fora: comentários, recomendação e transmissão ao vivo.\n\n**Não funcionais**: o vídeo começa a tocar em poucos segundos e não trava; o envio pode demorar minutos, e o processamento também; nenhum vídeo enviado se perde.",
                },
                {
                    type: "text",
                    value: "## O envio não passa pela sua aplicação\n\nO padrão do módulo 3 se aplica de forma óbvia: **URL assinada**, com o arquivo indo direto do cliente para o blob storage. Para arquivo grande, acrescenta-se o **envio em partes**: o cliente divide o vídeo em pedaços, envia cada um separadamente e pode retomar de onde parou se a conexão cair, sem recomeçar o arquivo inteiro.\n\nTerminado o envio, o cliente avisa a API, que grava o registro e **enfileira o processamento**. Nada disso acontece na requisição do usuário, porque transcodificar um vídeo leva minutos. O estado do vídeo passa a ser explícito, algo como enviado, processando, pronto ou falhou, e a interface mostra isso.",
                },
                {
                    type: "text",
                    value: '## Transcodificação, e por que ela é obrigatória\n\nO vídeo original serve para arquivar e não para assistir. Ele é convertido para várias resoluções e taxas de bits, e cada versão é quebrada em segmentos de poucos segundos, acompanhados de um arquivo de manifesto que lista o que existe.\n\nIsso viabiliza o **streaming com taxa adaptativa**: o player começa por uma qualidade baixa, mede a velocidade real e sobe ou desce de faixa entre um segmento e outro. Por isso o vídeo começa rápido e se ajusta quando a conexão piora, em vez de travar. É também o que permite servir tudo por CDN, já que segmentos são arquivos estáticos comuns, e é aí que a conta de banda deixa de ser problema seu.\n\nO trabalho de transcodificar é distribuído: o vídeo é dividido, cada pedaço vai para um worker diferente, e no fim os resultados são reunidos. Assim um vídeo de uma hora não fica preso a uma máquina por uma hora.',
                },
                {
                    type: "table",
                    value: '[["Etapa", "Onde acontece", "Por quê"], ["Envio", "Cliente para blob, por URL assinada e em partes", "Não ocupa a frota e permite retomar"], ["Registro", "API, rápido", "Só grava metadados e enfileira"], ["Transcodificação", "Workers, em paralelo por pedaço", "Leva minutos e não pode bloquear"], ["Distribuição", "CDN, segmentos e manifesto", "A banda sai da sua infraestrutura"], ["Reprodução", "Player escolhe a faixa por segmento", "Adapta à conexão sem travar"]]',
                },
                {
                    type: "text",
                    value: '## Onde o dinheiro vai\n\nEste é o caso em que a pergunta de custo é mais reveladora, e vale trazê-la sem esperar. O armazenamento cresce muito, porque cada vídeo existe no original mais uma cópia por resolução, o que facilmente multiplica por cinco o tamanho. A alavanca é a do módulo 2: manter o original em classe de arquivo, já que ele quase nunca é lido, e guardar em acesso frequente só as versões realmente assistidas.\n\nMas o maior item costuma ser a **saída de dados**. É por isso que a taxa de acerto da CDN é a métrica financeira mais importante do sistema, e por isso conteúdo popular é empurrado para a borda antes do lançamento, no modelo push que o módulo 3 descreveu. E existe a cauda longa: vídeo raramente assistido não vale ocupar espaço na borda, e é servido da origem mesmo.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** vídeo é dominado pela conta de **banda**. O envio vai direto ao blob por **URL assinada e em partes**, e o processamento roda **fora da requisição**, em workers paralelos. A **transcodificação** em várias faixas e segmentos viabiliza a **taxa adaptativa** e permite servir tudo por **CDN**. O custo mora na **saída de dados**, e a taxa de acerto da borda é a métrica financeira central.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a vantagem de enviar o vídeo em partes?",
                    difficulty: "facil",
                    options: [
                        { text: "Permite retomar de onde parou se a conexão cair.", isCorrect: true },
                        { text: "Reduz o tamanho total do arquivo que será transferido.", isCorrect: false },
                        { text: "Dispensa a geração de uma URL assinada pela API.", isCorrect: false },
                        { text: "Permite começar a transcodificação antes do envio acabar.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a transcodificação não acontece dentro da requisição de envio?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela leva minutos e prenderia o usuário esperando.", isCorrect: true },
                        { text: "Ela precisa do vídeo já disponível na CDN para rodar.", isCorrect: false },
                        { text: "A API não tem permissão de leitura no blob storage.", isCorrect: false },
                        { text: "O formato final depende da conexão de quem vai assistir.", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a divisão em segmentos com manifesto viabiliza?",
                    difficulty: "medio",
                    options: [
                        { text: "Trocar de qualidade entre um segmento e o seguinte.", isCorrect: true },
                        { text: "Reduzir o espaço ocupado pelas versões transcodificadas.", isCorrect: false },
                        { text: "Enviar o vídeo em partes a partir do navegador do usuário.", isCorrect: false },
                        { text: "Transcodificar cada trecho em um worker diferente e paralelo.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual costuma ser o maior item de custo em um sistema de vídeo?",
                    difficulty: "medio",
                    options: [
                        { text: "A saída de dados.", isCorrect: true },
                        { text: "O armazenamento dos arquivos originais enviados.", isCorrect: false },
                        { text: "A capacidade de processamento gasta na transcodificação.", isCorrect: false },
                        { text: "As instâncias de aplicação que atendem as requisições.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a decisão correta para vídeos da cauda longa, raramente assistidos?",
                    difficulty: "dificil",
                    options: [
                        { text: "Servir da origem, sem ocupar espaço na borda.", isCorrect: true },
                        { text: "Empurrar para a borda junto com o conteúdo popular.", isCorrect: false },
                        { text: "Apagar as versões transcodificadas e manter o original.", isCorrect: false },
                        { text: "Transcodificar apenas quando alguém pedir para assistir.", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Localização em tempo real",
            blocks: [
                {
                    type: "text",
                    value: "# Localização em tempo real\n\nO último caso traz um tipo de dado que nenhum outro tinha: **posição no espaço**, que muda o tempo todo. Aplicativo de carona, entrega e mapa de amigos compartilham o mesmo problema, e ele tem uma pergunta central: como achar rapidamente os pontos próximos de uma coordenada.\n\n**Funcionais**, cortados: o motorista envia a posição periodicamente; o passageiro pede corrida e o sistema encontra motoristas próximos; o passageiro acompanha o carro se aproximando. Fora: pagamento, avaliação e rota otimizada.\n\n**Não funcionais**: a busca por próximos responde em poucas centenas de milissegundos; a posição pode estar alguns segundos desatualizada sem problema; e a escrita é muito frequente, o que inverte a proporção dos casos anteriores.",
                },
                {
                    type: "code",
                    value: "Estimativa:\n\n  1.000.000 motoristas ativos\n  posicao a cada 4 segundos\n  1.000.000 / 4 = 250.000 escritas por segundo\n\n  100.000 pedidos de corrida por hora\n  100.000 / 3.600 = cerca de 30 buscas por segundo\n\n  Escrita 8.000x maior que a leitura: o oposto do feed.",
                },
                {
                    type: "text",
                    value: "## A conta inverte o desenho\n\nEste é o melhor exemplo de como o número muda tudo. Duzentas e cinquenta mil escritas por segundo contra trinta leituras significa que o desenho precisa otimizar **escrita**, e que a posição não deve ir para um banco relacional com índice a manter a cada atualização.\n\nDuas consequências. Primeiro, a posição atual vive em **memória**, num armazenamento chave e valor, porque é dado volátil que só interessa agora. Segundo, o histórico, se for necessário, vai por caminho separado: os eventos entram numa fila e são gravados em lote num armazenamento próprio de série temporal, longe do caminho quente.",
                },
                {
                    type: "text",
                    value: '## Como buscar por proximidade\n\nA forma ingênua é calcular a distância de cada motorista até o passageiro e ficar com os mais perto. Com um milhão de motoristas, isso é um milhão de contas por busca. Não serve.\n\nA solução é **dividir o mapa em células** e transformar a busca por proximidade em busca por chave. Duas técnicas aparecem. **Geohash** codifica latitude e longitude numa string em que prefixos iguais significam proximidade: buscar vizinhos vira buscar quem compartilha o prefixo. Grade de células indexadas, como o esquema usado em aplicativos de carona, faz o mesmo com identificadores de célula hierárquicos. Em ambos, o motorista é guardado na chave da sua célula, e buscar próximos é ler a célula do passageiro e as células vizinhas.\n\nDois detalhes que rendem ponto. Precisa **ler as vizinhas** porque o passageiro pode estar na borda da célula, com o carro mais próximo do outro lado da linha. E o tamanho da célula é um **trade-off**: célula grande devolve muita gente e obriga a filtrar; célula pequena obriga a consultar mais células. Em região densa e em região vazia o tamanho ideal é diferente, e é por isso que existem esquemas com precisão variável.',
                },
                {
                    type: "table",
                    value: '[["Necessidade", "Escolha", "Por quê"], ["Posição atual", "Chave e valor em memória, por célula", "250 mil escritas por segundo"], ["Busca por próximos", "Célula do pedido mais vizinhas", "Evita calcular distância de todos"], ["Histórico de trajeto", "Fila e gravação em lote em série temporal", "Sai do caminho quente"], ["Acompanhar o carro", "Conexão persistente com o passageiro", "Atualização empurrada, como no chat"], ["Pareamento", "Serviço próprio, com estado da corrida", "Precisa de consistência forte"]]',
                },
                {
                    type: "text",
                    value: '## O pareamento é o ponto de consistência forte\n\nQuase tudo aqui tolera dado velho: uma posição de três segundos atrás serve. Existe uma exceção, e reconhecê-la é o que fecha bem o caso: **o mesmo motorista não pode ser atribuído a duas corridas**.\n\nEsse passo precisa de consistência forte, e é resolvido com uma operação atômica de reserva, no espírito do módulo 4. O serviço tenta marcar o motorista como ocupado condicionalmente; se outro pedido chegou primeiro, a marcação falha e o sistema segue para o próximo candidato. É a mesma discussão da reserva de estoque na aula de CAP: aplicar consistência forte **na operação** que precisa, e deixar o resto do sistema relaxado.\n\nE o acompanhamento do carro reaproveita o chat: conexão persistente com o passageiro, recebendo as posições daquele motorista enquanto a corrida durar.',
                },
                {
                    type: "quote",
                    value: "**Recapitulando:** localização inverte a proporção: **escrita domina**, então a posição atual vive **em memória** e o histórico sai por fila para série temporal. Busca por proximidade vira busca por **célula**, com geohash ou grade, sempre lendo as **vizinhas**, e o tamanho da célula é um trade-off. O **pareamento** é o único ponto de consistência forte, resolvido com reserva atômica.",
                },
            ],
            questions: [
                {
                    statement: "Com 250 mil escritas de posição por segundo e 30 buscas, o que o desenho precisa otimizar?",
                    difficulty: "facil",
                    options: [
                        { text: "A escrita.", isCorrect: true },
                        { text: "A leitura.", isCorrect: false },
                        { text: "O espaço em disco.", isCorrect: false },
                        { text: "A banda de saída.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que calcular a distância de todos os motoristas não funciona?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada busca faria um cálculo por motorista ativo.", isCorrect: true },
                        { text: "As posições estariam desatualizadas no momento do cálculo.", isCorrect: false },
                        { text: "O cálculo de distância geográfica é impreciso em escala.", isCorrect: false },
                        { text: "O banco não consegue guardar coordenadas com precisão.", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a busca precisa consultar também as células vizinhas?",
                    difficulty: "dificil",
                    options: [
                        { text: "O ponto pode estar na borda da própria célula.", isCorrect: true },
                        { text: "As células têm tamanhos diferentes conforme a densidade.", isCorrect: false },
                        { text: "Os motoristas mudam de célula entre uma escrita e outra.", isCorrect: false },
                        { text: "A célula do passageiro pode estar temporariamente vazia.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o trade-off no tamanho da célula?",
                    difficulty: "dificil",
                    options: [
                        { text: "Célula grande devolve gente demais, pequena exige mais buscas.", isCorrect: true },
                        { text: "Célula grande consome mais memória e a pequena consome bem menos.", isCorrect: false },
                        { text: "Célula grande atualiza mais devagar do que a célula pequena.", isCorrect: false },
                        { text: "Célula grande perde precisão de coordenada ao codificar a chave.", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual operação desse sistema exige consistência forte?",
                    difficulty: "medio",
                    options: [
                        { text: "Atribuir o motorista a uma corrida.", isCorrect: true },
                        { text: "Atualizar a posição atual do motorista.", isCorrect: false },
                        { text: "Buscar os motoristas próximos ao passageiro.", isCorrect: false },
                        { text: "Enviar a posição para o passageiro acompanhar.", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [MODULO_1, MODULO_2, MODULO_3, MODULO_4, MODULO_5, MODULO_6];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
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
    console.log(
        "Seed concluido: " +
            MODULOS.length +
            " modulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questoes.",
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
