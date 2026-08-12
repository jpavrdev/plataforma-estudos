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

export const MODULOS: Modulo[] = [MODULO_1, MODULO_2];

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
