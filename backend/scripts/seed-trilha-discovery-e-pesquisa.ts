// Seed da trilha Discovery e Pesquisa, estagio 4 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-discovery-e-pesquisa.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Discovery e Pesquisa";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Reduzir o risco de construir a coisa errada: os quatro riscos do produto, entrevistas que não se enganam, o mapa de oportunidades do discovery contínuo, priorização de suposições, protótipos na fidelidade certa pro risco e o lado quantitativo da pesquisa, fechando um ciclo completo de discovery no papel.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Por que discovery",
    aulas: [
        {
            titulo: "Os quatro riscos",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro perguntas antes da primeira linha de código\n\nUm time de seis pessoas passou cinco meses construindo um módulo de conciliação bancária para um ERP. Ficou bonito, rápido, coberto de teste. Seis semanas depois do lançamento, 31 clientes tinham aberto a tela e 4 tinham voltado uma segunda vez. Ninguém errou o código. O time errou antes: construiu direito uma coisa que quase ninguém queria daquele jeito.\n\nMarty Cagan descreve quatro riscos que todo produto carrega e que precisam de resposta ANTES da construção, não depois. Risco de VALOR: as pessoas querem isso a ponto de largar o jeito atual? Risco de USABILIDADE: elas conseguem usar sem alguém explicando por cima do ombro? Risco de VIABILIDADE TÉCNICA: dá pra construir com o time, o prazo e os dados que existem hoje? Risco de VIABILIDADE DE NEGÓCIO: isso cabe no modelo comercial, no jurídico, no custo de suporte e na marca?\n\nRepare que só o terceiro é sobre código, e é justamente o único que a maioria dos times checa antes de começar. Os outros três derrubam produto com a mesma facilidade e costumam ser respondidos por chute numa reunião que ninguém registrou. Discovery é o trabalho de responder essas quatro perguntas gastando dias, e não trimestres.",
                },
                {
                    type: "table",
                    value: '[["Risco","A pergunta que ele faz","Quem puxa a resposta"],["Valor","As pessoas querem e vão trocar?","PM, com evidência de usuário"],["Usabilidade","Conseguem usar sem ajuda?","Design, com teste de tarefa"],["Viabilidade técnica","Dá pra construir e sustentar?","Engenharia, com investigação curta"],["Viabilidade de negócio","Cabe em custo, jurídico e marca?","PM com as áreas envolvidas"]]',
                },
                {
                    type: "quote",
                    value: "O risco que mais derruba produto não é o técnico. É o de valor: código impecável resolvendo com perfeição um problema que ninguém tinha.",
                },
                {
                    type: "text",
                    value: "## Quem responde, e por que junto\n\nCada risco tem um dono natural, mas nenhum deles se resolve sozinho. Quem lidera a resposta sobre valor costuma ser o PM, que está mais perto do usuário e do negócio; usabilidade é território de design; viabilidade técnica é da engenharia; viabilidade de negócio é do PM com jurídico, financeiro, suporte e comercial na mesa.\n\nO detalhe que muda o resultado é o TRIO: PM, design e engenharia fazendo discovery juntos, na mesma conversa, ouvindo o mesmo usuário. Quando o PM entrevista sozinho e depois conta a história, boa parte da informação evapora no caminho, e o time que vai construir recebe conclusão em vez de evidência. Quando a engenharia ouve a dor direto da fonte, aparece a solução barata que ninguém tinha imaginado; quando o design ouve, aparece o detalhe de fluxo que não cabia no resumo.\n\nO antipadrão é o time de entrega: o requisito chega pronto, o time estima, constrói e lança. Os quatro riscos foram respondidos por opinião em alguma reunião, e a conta só aparece quando o número não se move. Discovery inverte isso: o time participa da pergunta, não apenas da resposta.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os quatro riscos de produto descritos por Marty Cagan?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Valor, usabilidade, viabilidade técnica e de negócio",
                            isCorrect: true,
                        },
                        {
                            text: "Escopo, prazo, orçamento e qualidade final da entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Mercado, concorrência, tecnologia e regulação local",
                            isCorrect: false,
                        },
                        {
                            text: "Custo, cronograma, escopo e satisfação do cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time descobre que os usuários não encontram a função sozinhos. Qual risco está em jogo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Usabilidade, porque não conseguem usar sem ajuda",
                            isCorrect: true,
                        },
                        {
                            text: "Valor, porque o problema resolvido não interessa a ninguém",
                            isCorrect: false,
                        },
                        {
                            text: "Viabilidade técnica, porque a função não foi construída",
                            isCorrect: false,
                        },
                        {
                            text: "Viabilidade de negócio, porque o custo de suporte subiu",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um diretor entrega o requisito pronto e pede ao time apenas a estimativa. Qual é o maior risco desse arranjo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os quatro riscos foram respondidos por chute",
                            isCorrect: true,
                        },
                        {
                            text: "A estimativa do time costuma sair maior que o real",
                            isCorrect: false,
                        },
                        {
                            text: "O time perde autonomia para escolher a linguagem",
                            isCorrect: false,
                        },
                        {
                            text: "O diretor assume sozinho a responsabilidade pelo prazo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o trio faz discovery junto em vez de o PM entrevistar sozinho e repassar depois?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O time ouve a evidência crua, não a conclusão",
                            isCorrect: true,
                        },
                        {
                            text: "A empresa economiza no custo de contratar pesquisa",
                            isCorrect: false,
                        },
                        {
                            text: "A entrevista fica mais rápida com três pessoas na sala",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário se sente mais valorizado durante a conversa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Usuários adoraram o protótipo e a engenharia aprovou o esforço, mas cada uso exigiria conferência manual do suporte. Qual risco segue aberto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Viabilidade de negócio, pelo custo de operação",
                            isCorrect: true,
                        },
                        {
                            text: "Valor, porque ninguém demonstrou querer a função",
                            isCorrect: false,
                        },
                        {
                            text: "Usabilidade, porque o fluxo não foi testado ainda",
                            isCorrect: false,
                        },
                        {
                            text: "Viabilidade técnica, porque falta escalar o banco",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O custo de construir errado",
            blocks: [
                {
                    type: "text",
                    value: "# A conta de cinco meses de esteira\n\nVamos colocar número na dor. Um time de seis pessoas custa, com encargos e estrutura, algo entre 120 e 180 mil reais por mês em boa parte do mercado brasileiro. Cinco meses de esteira dedicada a um módulo que ninguém usa são seiscentos mil reais ou mais que viraram tela.\n\nSó que a fatura não para aí, e a parte invisível costuma ser maior que a visível. Tem o CUSTO DE OPORTUNIDADE: nesses cinco meses, o time não atacou o problema que estava sangrando de verdade, e o concorrente atacou. Tem o CUSTO DE MANUTENÇÃO: código que ninguém usa continua sendo migrado, testado, atualizado por questão de segurança e considerado em cada refatoração pelos próximos anos. Tem o CUSTO DE COMPLEXIDADE: cada função morta ocupa espaço no menu, na documentação, no treinamento do suporte e na cabeça de quem chega novo.\n\nE tem o custo mais silencioso de todos, que é o moral do time. Depois do segundo lançamento que morre sem uso, as pessoas param de perguntar por quê e passam a entregar cartão. O time vira uma fábrica que não acredita no próprio produto.",
                },
                {
                    type: "table",
                    value: '[["Onde o erro aparece","Custo de corrigir","O que já foi gasto"],["Na entrevista","Uma frase e uma pergunta nova","Meia hora de conversa"],["No protótipo","Refazer três telas","Dois dias de design"],["Na revisão de código","Rever a implementação","Semanas de construção"],["Em produção","Corrigir, migrar e comunicar","Ciclo inteiro mais suporte"],["Nunca corrigido","Conviver com a função morta","Manutenção por anos"]]',
                },
                {
                    type: "quote",
                    value: "O código mais caro da empresa não é o mal escrito. É o que não deveria ter sido escrito e agora precisa ser mantido para sempre.",
                },
                {
                    type: "text",
                    value: "## Discovery como seguro barato\n\nCompare a fatura com o preço do seguro. Oito entrevistas de quarenta minutos com o trio custam duas tardes de três pessoas. Um protótipo clicável testado com cinco usuários custa uns dois dias. Um teste de demanda com uma página e um botão custa menos de uma semana. Todo esse pacote fica bem abaixo de cinco por cento do orçamento do trimestre, e ele existe para responder a pergunta que decide os outros noventa e cinco por cento.\n\nA regra que vale a pena carregar: quanto mais tarde o erro é descoberto, mais caro ele fica, e a curva não é suave. Uma suposição derrubada numa conversa custa constrangimento. A mesma suposição derrubada depois do lançamento custa o ciclo inteiro, mais a comunicação com o cliente, mais a migração de dado, mais o tempo que ninguém recupera.\n\nDiscovery não é garantia de acerto, e prometer isso é desonesto. É redução de risco: você troca a chance de perder cinco meses pela certeza de perder duas semanas descobrindo. Times maduros não fazem discovery para ter razão; fazem para descobrir cedo, e barato, quando estão errados.",
                },
            ],
            questions: [
                {
                    statement:
                        "Além do salário do time, que custo o produto que ninguém usa continua cobrando?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Manutenção do código morto por anos seguidos",
                            isCorrect: true,
                        },
                        {
                            text: "Multa contratual paga ao cliente que não usou",
                            isCorrect: false,
                        },
                        {
                            text: "Imposto extra sobre software fora de operação",
                            isCorrect: false,
                        },
                        {
                            text: "Taxa de licença cobrada pelo provedor de nuvem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que significa custo de oportunidade num ciclo de cinco meses perdido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O problema real ficou sem ninguém atacando",
                            isCorrect: true,
                        },
                        {
                            text: "O time cobrou mais caro do que o combinado",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa deixou de contratar mais pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "O orçamento do trimestre foi devolvido ao caixa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a mesma suposição errada custa muito mais em produção do que numa entrevista?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Corrigir exige refazer, migrar dado e comunicar",
                            isCorrect: true,
                        },
                        {
                            text: "Usuários em produção reclamam nas redes sociais",
                            isCorrect: false,
                        },
                        {
                            text: "A lei obriga o aviso formal de falha ao cliente",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor de nuvem cobra mais caro por correção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um diretor diz que discovery é luxo de empresa grande e que o time precisa correr. Qual argumento responde melhor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Duas semanas de risco custam menos que cinco meses",
                            isCorrect: true,
                        },
                        {
                            text: "Empresas pequenas erram menos e podem pular a etapa",
                            isCorrect: false,
                        },
                        {
                            text: "Discovery garante que o produto vai dar certo agora",
                            isCorrect: false,
                        },
                        {
                            text: "Correr é sempre errado em qualquer estágio da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de dois lançamentos que morreram sem uso, o time parou de questionar o que recebe e só entrega cartão. Qual é a leitura desse sintoma?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O custo do erro chegou no moral de quem constrói",
                            isCorrect: true,
                        },
                        {
                            text: "O time ficou tecnicamente mais lento com o tempo",
                            isCorrect: false,
                        },
                        {
                            text: "A liderança precisa apertar as metas de entrega",
                            isCorrect: false,
                        },
                        {
                            text: "O processo de estimativa do time está calibrado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Discovery contínuo vs projeto de pesquisa",
            blocks: [
                {
                    type: "text",
                    value: "# Pesquisa que chega tarde não decide nada\n\nO roteiro é conhecido. A empresa contrata um estudo de mercado, a agência entra em campo por três meses, entrega um documento de oitenta páginas com personas coloridas e uma apresentação de uma hora. Todo mundo elogia. Duas semanas depois, o arquivo está numa pasta que ninguém abre, e o time continua decidindo do mesmo jeito de antes: no achismo do mais convincente da reunião.\n\nO problema não é a qualidade do estudo. É o descompasso de RITMO. O time toma dezenas de decisões pequenas por semana, e o estudo chega uma vez por semestre, respondendo perguntas que já mudaram. Pior: como custou caro e demorou, o estudo vira verdade sagrada por um ano, mesmo quando o mercado se mexeu.\n\nTeresa Torres chama de continuous discovery a alternativa: pelo menos um contato com usuário por semana, feito pelo trio que constrói, ligado a um outcome específico. Não é o mesmo trabalho comprimido; é outro trabalho. O estudo grande produz conhecimento; o discovery contínuo produz DECISÃO, na semana em que a decisão precisa ser tomada.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Projeto de pesquisa","Discovery contínuo"],["Ritmo","Uma vez por semestre","Toda semana, sem parar"],["Quem faz","Agência ou especialista só","O trio que vai construir"],["Entrega","Relatório e apresentação","Decisão e teste da semana"],["Recrutamento","Força-tarefa por rodada","Cano ligado o tempo todo"],["Validade","Envelhece rápido na gaveta","Corrigido pela rodada seguinte"]]',
                },
                {
                    type: "quote",
                    value: "Pesquisa que vira relatório informa. Pesquisa que vira hábito semanal muda o que o time constrói na segunda de manhã.",
                },
                {
                    type: "code",
                    value: "SEMANA DO TRIO (continuous discovery)\n\nSegunda, 30 minutos\n  Revisar o outcome do trimestre.\n  Escolher a pergunta da semana (uma só).\n\nTerça e quarta\n  2 entrevistas de 30 a 45 minutos.\n  PM conduz, design anota literal, engenharia assiste calada.\n  Convite automático no produto para quem fez a ação alvo nos últimos 7 dias.\n\nQuinta, 60 minutos\n  Síntese junto: trechos viram cartões, cartões viram oportunidades.\n  Atualizar a árvore de oportunidades.\n\nSexta, 30 minutos\n  Escolher a suposição mais perigosa e desenhar o teste da semana seguinte.\n  Registrar a decisão tomada e o que a derrubou ou sustentou.",
                },
                {
                    type: "text",
                    value: "## O que muda quando vira rotina\n\nRepare no que a agenda acima resolve sem esforço heroico. Recrutamento deixa de ser projeto e vira cano ligado: o convite sai automático para quem fez a ação que interessa, e sempre tem gente na fila. A síntese acontece com a conversa fresca, não três semanas depois. E o trio decide junto, o que elimina a etapa de convencer o time de algo que ele não ouviu.\n\nDuas entrevistas por semana parecem pouco, e é aí que está a graça: são cerca de cem contatos por ano, mais do que qualquer estudo grande entrega, distribuídos ao longo do tempo em vez de concentrados num mês. A cada semana o time corrige um pouco a rota, e erro de rota corrigido cedo custa quase nada.\n\nIsso não elimina o estudo grande. Entrada em novo mercado, mudança de posicionamento e decisão de investimento pesado pedem profundidade que uma conversa semanal não dá. A regra prática é simples: pesquisa grande para decisão grande e rara; discovery contínuo para as dezenas de decisões pequenas que, somadas, definem o produto.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que caracteriza o continuous discovery descrito por Teresa Torres?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Contato semanal com usuário feito pelo próprio trio",
                            isCorrect: true,
                        },
                        {
                            text: "Estudo aprofundado entregue uma vez por semestre",
                            isCorrect: false,
                        },
                        {
                            text: "Pesquisa terceirizada com relatório extenso ao fim",
                            isCorrect: false,
                        },
                        {
                            text: "Reunião semanal do time para revisar as estimativas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o estudo de três meses costuma acabar na gaveta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Chega fora do ritmo em que o time decide",
                            isCorrect: true,
                        },
                        {
                            text: "Vem escrito numa linguagem técnica demais",
                            isCorrect: false,
                        },
                        {
                            text: "Custa caro e por isso ninguém quer divulgar",
                            isCorrect: false,
                        },
                        {
                            text: "As agências entregam dados sempre incorretos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No ritmo semanal do trio, por que o recrutamento deixa de ser um gargalo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O convite vira automático e a fila nunca esvazia",
                            isCorrect: true,
                        },
                        {
                            text: "O time passa a entrevistar colegas da própria empresa",
                            isCorrect: false,
                        },
                        {
                            text: "A agência contratada assume o contato com usuários",
                            isCorrect: false,
                        },
                        {
                            text: "O incentivo oferecido sobe até garantir presença",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas entrevistas por semana parecem pouco. Por que esse volume funciona bem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Somam cem contatos por ano e corrigem a rota cedo",
                            isCorrect: true,
                        },
                        {
                            text: "Duas conversas bastam para representar toda a base",
                            isCorrect: false,
                        },
                        {
                            text: "Poucas entrevistas evitam confundir o time com ruído",
                            isCorrect: false,
                        },
                        {
                            text: "O número foi definido por padrão de mercado em 2026",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A empresa vai entrar num mercado novo, com decisão de investimento pesado. Como encaixar isso na lógica das duas abordagens?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Estudo profundo aqui, contínuo no dia a dia",
                            isCorrect: true,
                        },
                        {
                            text: "Só discovery contínuo, porque estudo sempre atrasa",
                            isCorrect: false,
                        },
                        {
                            text: "Só o estudo grande, e suspender as conversas semanais",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum dos dois, já que mercado novo é sempre aposta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Double diamond com leitura crítica",
            blocks: [
                {
                    type: "text",
                    value: '# Dois diamantes, quatro movimentos\n\nO double diamond é o desenho mais reproduzido do design de produto: dois losangos lado a lado, cada um com uma parte que abre e uma que fecha. No primeiro diamante você trabalha o PROBLEMA. Na fase de descobrir, você abre: entrevista, observa, junta sinal de todo lado, sem se apaixonar por nenhuma explicação. Na fase de definir, você fecha: agrupa, escolhe e escreve qual problema vale atacar.\n\nO segundo diamante trabalha a SOLUÇÃO. Em desenvolver, você abre de novo: gera muitas ideias, prototipa, testa alternativas que competem entre si. Em entregar, fecha: escolhe uma, refina e coloca no ar.\n\nA ideia central é que cada movimento tem uma postura mental própria, e misturar as duas destrói as duas. Quem julga enquanto diverge mata a ideia estranha que seria a boa. Quem diverge quando deveria convergir nunca decide nada e o projeto vira roda de conversa infinita. Falar em voz alta "estamos abrindo agora, ninguém critica ainda" resolve metade das reuniões improdutivas de produto, e esse talvez seja o maior valor prático do desenho.',
                },
                {
                    type: "table",
                    value: '[["Fase","Movimento","Pergunta central","Saída típica"],["Descobrir","Abre","O que está acontecendo?","Oportunidades cruas"],["Definir","Fecha","Qual problema atacar?","Problema escolhido"],["Desenvolver","Abre","De quantos jeitos dá?","Alternativas testadas"],["Entregar","Fecha","Qual sobe e como?","Solução no ar"]]',
                },
                {
                    type: "quote",
                    value: "O double diamond é um ótimo vocabulário e um péssimo cronograma. Serve para dizer onde você está, não para prometer quando termina.",
                },
                {
                    type: "text",
                    value: '## Bom como mapa, perigoso como processo\n\nAgora a leitura crítica, que quase nunca acompanha o desenho. Na prática, ninguém percorre os dois diamantes uma vez só e em linha reta. Você entra na fase de desenvolver, testa um protótipo e descobre que entendeu o problema errado; volta pro primeiro diamante. Isso não é falha de execução, é o funcionamento normal do trabalho com incerteza. Só que o desenho, com aquelas setas apontando sempre pra frente, sugere o contrário.\n\nDaí nasce a distorção mais comum: o double diamond virar cascata com nome bonito. Aparece como fase de projeto no cronograma, com oito semanas de descoberta antes de qualquer conversa com usuário, entrega de relatório no fim de cada losango e passagem de bastão para o time seguinte. Quando existe handoff entre diamantes, o time que constrói recebe conclusão pronta e perde o contexto que só se ganha ouvindo.\n\nO uso saudável é bem mais modesto. Use como vocabulário compartilhado para perguntar "estamos abrindo ou fechando agora?", e aceite que o ciclo é curto e se repete. Um diamante que dura duas semanas ensina mais do que um que dura dois trimestres.',
                },
            ],
            questions: [
                {
                    statement: "O que os dois diamantes do double diamond representam?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O espaço do problema e o espaço da solução",
                            isCorrect: true,
                        },
                        {
                            text: "A fase de análise e a fase de codificação final",
                            isCorrect: false,
                        },
                        {
                            text: "O trabalho do design e o trabalho da engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "A pesquisa qualitativa e a pesquisa quantitativa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a saída esperada da fase de definir?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O problema escolhido, escrito com clareza",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de todas as ideias geradas pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "O protótipo navegável pronto para o teste",
                            isCorrect: false,
                        },
                        {
                            text: "O cronograma de entrega assinado pela área",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa reunião de ideação, alguém critica cada ideia assim que ela aparece. Qual é o problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Julgar durante a abertura mata a ideia estranha",
                            isCorrect: true,
                        },
                        {
                            text: "A crítica precisa vir sempre por escrito e depois",
                            isCorrect: false,
                        },
                        {
                            text: "Ideias só podem ser avaliadas pela pessoa que lidera",
                            isCorrect: false,
                        },
                        {
                            text: "Reuniões de ideação não admitem nenhuma avaliação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma consultoria propõe oito semanas de descoberta, relatório e passagem para o time de entrega. O que a leitura crítica alerta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O desenho virou cascata e cria handoff sem contexto",
                            isCorrect: true,
                        },
                        {
                            text: "Oito semanas é pouco tempo para o primeiro diamante",
                            isCorrect: false,
                        },
                        {
                            text: "Relatórios devem ser substituídos por vídeo gravado",
                            isCorrect: false,
                        },
                        {
                            text: "Consultoria externa nunca deve conduzir descoberta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No meio do segundo diamante, o teste do protótipo mostra que o time entendeu o problema errado. Como interpretar isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Voltar ao problema é normal, o ciclo não é linear",
                            isCorrect: true,
                        },
                        {
                            text: "O time falhou na definição e perdeu o ciclo inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "O protótipo foi feito com fidelidade alta demais",
                            isCorrect: false,
                        },
                        {
                            text: "O correto é seguir e ajustar depois do lançamento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Evidência em níveis",
            blocks: [
                {
                    type: "text",
                    value: '# Nem toda evidência pesa o mesmo\n\nDuas frases chegam na mesma reunião. A primeira: "conversei com quatro clientes e todos acharam a ideia excelente". A segunda: "três clientes assinaram carta de intenção com valor". As duas são evidência. Só que uma delas custa nada pra quem falou, e a outra custa reputação e dinheiro. Confundir as duas é como aceitar promessa e recibo pelo mesmo valor.\n\nVale carregar uma escada mental. No degrau mais baixo está a OPINIÃO sobre o futuro: achar bonito, dizer que usaria, elogiar a ideia. Depois vem o DADO DE USO agregado: o painel mostrando que 78 por cento param na etapa de documento, forte pra dizer onde dói, mudo sobre o motivo. Em seguida, a DECLARAÇÃO sobre fato passado: "na semana passada eu exportei três vezes e conferi na mão", que já tem contexto e é difícil de inventar. Mais acima, o COMPORTAMENTO OBSERVADO: você viu a pessoa tentar e travar. No topo, o COMPROMISSO: dinheiro, assinatura, tempo cedido, dado sensível entregue.\n\nA escada não é rígida, e a graça não é ranquear por esporte. É perguntar, antes de decidir, de que degrau veio o que sustenta a decisão.',
                },
                {
                    type: "table",
                    value: '[["Nível","Exemplo típico","Responde bem","Onde engana"],["Opinião","Achei ótima a ideia","Quase nada","Cortesia vira sinal falso"],["Dado de uso","78 por cento abandonam ali","Onde e quanto","Silencia sobre o porquê"],["Declaração","Fiz isso três vezes na semana","Contexto do passado","Memória seletiva"],["Observado","Vi a pessoa travar na etapa","O que de fato ocorre","Ambiente artificial"],["Compromisso","Pagou, assinou, cedeu tempo","Intensidade do desejo","Amostra pequena e cara"]]',
                },
                {
                    type: "quote",
                    value: "Elogio é gentileza, cadastro é interesse, cartão de crédito é evidência. Cobre de cada decisão o degrau que ela merece.",
                },
                {
                    type: "text",
                    value: '## Como subir a escada sem gastar muito\n\nA subida costuma ser mais barata do que parece. Se você recebeu um elogio, peça o fato: "quando foi a última vez que você precisou disso?". Se recebeu uma declaração forte, peça pra ver: "me mostra como você faz hoje". Se o comportamento observado confirmou a dor, cobre um compromisso pequeno: entrar numa lista, ceder trinta minutos por semana no piloto, indicar um colega, pagar um valor simbólico. Cada degrau custa uma pergunta a mais, e vale muito mais que a repetição do degrau anterior.\n\nDois cuidados. O primeiro é a decisão proporcional: subir até o topo da escada para escolher a cor de um botão é desperdício, e decidir a aposta do trimestre com opinião de corredor é temerário. Peça evidência forte onde a decisão é cara e irreversível.\n\nO segundo é a honestidade na hora de contar. Quando apresentar o resultado, diga de qual degrau veio cada peça: "seis pessoas declararam, duas observamos fazendo, nenhuma pagou nada ainda". Uma frase assim vale mais que qualquer gráfico, porque coloca todo mundo diante do mesmo grau de incerteza.',
                },
            ],
            questions: [
                {
                    statement: "Na escada da evidência, o que fica no degrau mais fraco?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A opinião sobre a ideia e o elogio gratuito",
                            isCorrect: true,
                        },
                        {
                            text: "O comportamento observado durante uma tarefa",
                            isCorrect: false,
                        },
                        {
                            text: "A assinatura de contrato com valor combinado",
                            isCorrect: false,
                        },
                        {
                            text: "O relato detalhado do que houve semana passada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O painel mostra que 78 por cento abandonam a etapa de documento. O que esse dado entrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mostra onde a dor está, mas não diz o motivo",
                            isCorrect: true,
                        },
                        {
                            text: "Prova que a etapa foi mal desenhada pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "Indica falta de interesse pelo produto novo",
                            isCorrect: false,
                        },
                        {
                            text: "Confirma a hipótese levantada nas entrevistas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um cliente diz que a ideia é excelente e que usaria na hora. Qual é o melhor próximo passo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perguntar quando ele precisou disso pela última vez",
                            isCorrect: true,
                        },
                        {
                            text: "Registrar o elogio como validação do problema real",
                            isCorrect: false,
                        },
                        {
                            text: "Agendar o desenvolvimento e avisar sobre a data",
                            isCorrect: false,
                        },
                        {
                            text: "Procurar outros clientes até somar dez elogios iguais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que compromisso costuma ser a evidência mais forte da escada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Custa algo real para quem oferece o sinal",
                            isCorrect: true,
                        },
                        {
                            text: "Vem sempre de uma amostra maior de pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "É o único nível aceito por áreas financeiras",
                            isCorrect: false,
                        },
                        {
                            text: "Elimina qualquer incerteza sobre o lançamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time precisa decidir entre ajustar a cor de um aviso e apostar o trimestre num produto novo. Como aplicar a escada nos dois casos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Exigir degrau alto só na decisão cara e irreversível",
                            isCorrect: true,
                        },
                        {
                            text: "Buscar compromisso financeiro antes das duas decisões",
                            isCorrect: false,
                        },
                        {
                            text: "Usar apenas opinião nas duas, já que a escada orienta",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar as duas decisões até observar comportamento real",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Entrevistas que funcionam",
    aulas: [
        {
            titulo: "Recrutar sem viés",
            blocks: [
                {
                    type: "text",
                    value: "# Quem você chama decide o que você aprende\n\nVocê quer testar uma ideia de app pra controle de despesa de time comercial. Manda mensagem pros oito contatos mais próximos, todo mundo responde em uma hora, todo mundo acha genial. Três meses depois o produto está no ar e ninguém ativa. O problema não foi a condução das conversas: foi a lista de convidados.\n\nEntrevista de discovery serve pra ouvir quem TEM o problema, não quem gosta de você. Três perfis valem ouro. O USUÁRIO ATUAL mostra onde o produto trava no uso de verdade. O USUÁRIO QUE ABANDONOU é o mais incômodo e o mais informativo: ele tentou, desistiu e sabe exatamente onde doeu. E o NÃO USUÁRIO do segmento alvo, aquele que tem o problema e resolve de outro jeito, revela o concorrente real, que quase sempre é uma planilha, o WhatsApp ou o estagiário paciente.\n\nDois convidados envenenam a amostra. O amigo do time quer te ajudar e vai concordar com tudo que você disser. E quem aparece atraído por um incentivo alto responde pra receber o prêmio, não pra resolver a vida dele.",
                },
                {
                    type: "table",
                    value: '[["Quem você chama","O que costuma revelar","Risco de ouvir só isso"],["Usuário atual","Onde o uso trava hoje","Só melhora o que já existe"],["Quem abandonou","O motivo real da desistência","Difícil de achar e agendar"],["Não usuário do segmento","Como ele resolve sem você","Pode nem ter o problema"],["Amigo do time","Elogio e boa vontade","Concorda com tudo que você diz"],["Atraído por prêmio alto","O caminho mais rápido pro brinde","Inventa problema que não tem"]]',
                },
                {
                    type: "text",
                    value: "## Quantos, e por onde eles chegam\n\nA regra prática: 5 a 8 pessoas por segmento em cada rodada. Da quinta ou sexta conversa em diante, dentro do mesmo perfil, os padrões começam a se repetir, e é o que a pesquisa chama de SATURAÇÃO: a décima entrevista custa igual à primeira e traz quase nenhuma informação nova. Se as respostas ainda te surpreendem na oitava, provavelmente você misturou dois segmentos diferentes na mesma lista.\n\nOs canais que funcionam, do mais barato pro mais caro: a própria base do produto, filtrando por comportamento no banco (quem usou o relatório três vezes no mês passado, quem parou de entrar em maio); a lista de espera; o suporte, que sabe de cor quem reclamou do quê; a comunidade de clientes; e, por último, recrutamento pago com painel externo.\n\nEm todos eles entra um QUESTIONÁRIO DE TRIAGEM curto, o screener. E ele pergunta sobre comportamento, nunca sobre intenção. Nada de 'você teria interesse em controlar melhor as despesas do time?'. Pergunte 'quantas vezes você prestou conta de despesa nos últimos 30 dias?' e 'que ferramenta você usou na última vez?'. Interesse todo mundo declara; comportamento separa quem vive o problema de quem só acha o tema simpático.",
                },
                {
                    type: "quote",
                    value: "Entrevistar quem gosta de você é terapia em grupo. Pesquisa é entrevistar quem tem o problema, inclusive quem já desistiu de você.",
                },
                {
                    type: "text",
                    value: "## Recrutar é um cano ligado, não uma força-tarefa\n\nTeresa Torres chama de CONTINUOUS DISCOVERY o hábito de falar com usuário toda semana, e o gargalo disso quase nunca é a conversa: é achar gente. Times que tratam recrutamento como projeto ('semana que vem a gente organiza as entrevistas') passam metade do mês agendando. Times que tratam como cano deixam o fluxo ligado: convite dentro do produto pra quem acabou de usar a função, link de agenda automático, duas vagas fixas na semana que o time se compromete a preencher.\n\nO incentivo entra proporcional ao esforço: um voucher, um brinde, crédito no plano, uma doação em nome da pessoa. Alto demais e você compra o entrevistado, que vira profissional de pesquisa e finge ter qualquer problema que você descrever.\n\nE existe uma armadilha que incentivo nenhum resolve: o VIÉS DE SOBREVIVÊNCIA. Quem responde ao seu convite é quem ainda usa e ainda gosta. Quem cancelou não atende, não abre o email e talvez nem esteja mais na sua base. Se a rodada inteira sai de quem ficou, a conclusão sempre soa boa demais. Vale pagar o preço de caçar dois ou três desistentes por rodada, mesmo que cada um custe cinco tentativas.",
                },
            ],
            questions: [
                {
                    statement:
                        "Você vai montar a lista de entrevistas de um app de despesas corporativas. Quem deve entrar primeiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem convive com o problema, usando você ou não",
                            isCorrect: true,
                        },
                        {
                            text: "Quem já demonstrou entusiasmo pela ideia em conversas",
                            isCorrect: false,
                        },
                        {
                            text: "Quem tem mais tempo livre pra encaixar na agenda",
                            isCorrect: false,
                        },
                        {
                            text: "Quem trabalha perto do time e entende de tecnologia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quantas entrevistas por segmento costumam bastar em uma rodada, e por quê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "De 5 a 8, porque os padrões começam a se repetir",
                            isCorrect: true,
                        },
                        {
                            text: "Pelo menos 30, para ter significância estatística",
                            isCorrect: false,
                        },
                        {
                            text: "Uma só, desde que a pessoa seja bem representativa",
                            isCorrect: false,
                        },
                        {
                            text: "Quantas couberem no mês, sem limite definido antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O screener pergunta: 'você teria interesse em controlar melhor as despesas do time?'. Qual é o defeito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mede intenção declarada em vez de comportamento",
                            isCorrect: true,
                        },
                        {
                            text: "Usa linguagem técnica demais para o entrevistado",
                            isCorrect: false,
                        },
                        {
                            text: "É longa e derruba a taxa de resposta do convite",
                            isCorrect: false,
                        },
                        {
                            text: "Revela o preço do produto antes da hora certa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra encher a agenda rápido, alguém sugere sortear um celular entre os entrevistados. Qual é o risco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Atrair quem vem pelo prêmio e não tem o problema",
                            isCorrect: true,
                        },
                        {
                            text: "Encarecer a rodada sem mudar a qualidade das falas",
                            isCorrect: false,
                        },
                        {
                            text: "Atrasar a pesquisa por causa da logística do envio",
                            isCorrect: false,
                        },
                        {
                            text: "Obrigar o time a gravar todas as conversas por lei",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "As oito conversas da rodada saíram só de clientes ativos e o resultado foi elogio geral. Que viés explica isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sobrevivência: só quem ficou entrou na amostra",
                            isCorrect: true,
                        },
                        {
                            text: "Ancoragem: a primeira resposta guiou as seguintes",
                            isCorrect: false,
                        },
                        {
                            text: "Enquadramento: o roteiro citava a marca no início",
                            isCorrect: false,
                        },
                        {
                            text: "Halo: o entrevistador simpático elevou as respostas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Perguntar sobre a vida, não sobre a ideia",
            blocks: [
                {
                    type: "text",
                    value: "# A pergunta proibida é 'você usaria?'\n\nVocê apresenta a ideia numa call de vinte minutos, mostra três telas e pergunta: 'você usaria isso?'. A pessoa sorri e diz que sim, que faria muita falta, que é bem o que o mercado precisa. Você repete com mais sete, e as sete dizem o mesmo. Lança, e a página converte quatro cadastros em duas semanas.\n\nNinguém mentiu pra você. As pessoas são educadas e otimistas: elogiar custa zero, e imaginar a si mesmo organizado no futuro é uma fantasia agradável. 'Você usaria?' pede uma OPINIÃO SOBRE O FUTURO, e opinião sobre o futuro é o degrau mais fraco da escada da evidência. O que você quer é FATO PASSADO: o que a pessoa fez, quando fez, com que ferramenta fez, quanto custou e o que aconteceu depois.\n\nA troca é fácil de enunciar e difícil de sustentar no calor da conversa, porque a ideia é sua e você quer falar dela. Enquanto a pergunta apontar pro futuro e pra sua solução, a resposta vai ser cortesia. Quando ela aponta pro passado e pra vida da pessoa, vira dado.",
                },
                {
                    type: "text",
                    value: "## O teste da mãe, em português\n\nRob Fitzpatrick propôs um filtro simples pras suas perguntas, e batizou de teste da mãe. A ideia: sua mãe te ama, quer te ver feliz e vai elogiar qualquer coisa que você inventar. Uma boa pergunta é aquela que nem ela consegue responder com elogio vazio, porque não pede opinião nenhuma, pede fato.\n\n'Mãe, você usaria um app pra organizar as receitas da família?' passa longe do teste: a resposta é 'claro, filho'. Agora tente assim: 'me conta a última vez que você procurou uma receita antiga. Onde ela estava? Quanto tempo levou pra achar? O que você fez quando não achou?'. Não tem saída pelo elogio; ou ela lembra do episódio, ou admite que aquilo não acontece.\n\nRepare no que mudou: sumiu a sua ideia da frase. Você não pediu avaliação, pediu história. Perguntas que sobrevivem ao teste têm quase sempre a mesma cara: o que você FEZ, QUANDO foi a última vez, QUANTO você gastou, O QUE você usou, COMO terminou aquilo. Se dá pra responder a sua pergunta com 'ia ser ótimo', ela ainda não está pronta pra sair de casa.",
                },
                {
                    type: "table",
                    value: '[["Pergunta ruim","Pergunta boa","O que a boa revela"],["Você pagaria 30 reais por mês?","Quanto já gastou nisso este ano?","Prioridade medida em dinheiro"],["Essa tela ficou boa?","Me mostra como fez da última vez","O caminho e os atalhos reais"],["Você usaria um app pra isso?","Quando foi a última vez que doeu?","Frequência e gravidade da dor"],["Isso é um problema pra você?","O que você já tentou pra resolver?","Esforço investido no tema"],["Você gostaria de um relatório?","Quem cobra esse número, e quando?","Quem manda de verdade no fluxo"]]',
                },
                {
                    type: "quote",
                    value: "Elogio é ruído social e sai de graça. Tempo, reputação e dinheiro custam caro: é por isso que só eles valem como sinal.",
                },
                {
                    type: "text",
                    value: "## Elogio é ruído, compromisso é sinal\n\nDepois de cada conversa, separe o que a pessoa DISSE do que ela FEZ. 'Adorei, ficou muito bom' não entra no relatório: é gentileza. 'Eu montei uma planilha no domingo pra fechar isso' entra, porque é comportamento observado, com data e esforço.\n\nO nível seguinte é o compromisso, e ele tem várias moedas além do dinheiro. A pessoa te mandar a planilha real dela, com os dados dela, é compromisso. Aceitar uma segunda conversa de 40 minutos na semana seguinte é compromisso. Te apresentar pro gestor que aprova a compra é compromisso caro, porque ela põe a reputação junto. Assinar um pré-pedido ou pagar adiantado é o sinal mais forte que existe, e é exatamente por isso que ele é raro.\n\nQuando o elogio aparecer no meio da entrevista, e ele vai aparecer, não brigue com a pessoa. Use como gancho pra um fato: 'que bom que faz sentido, me conta a última vez que isso te atrapalhou'. Ou você acha o episódio real por trás do elogio, ou descobre que não tinha episódio nenhum. As duas respostas são úteis; só a primeira vira produto.",
                },
            ],
            questions: [
                {
                    statement: "Por que 'você usaria isso?' não serve como pergunta de discovery?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pede opinião sobre o futuro, e isso é cortesia",
                            isCorrect: true,
                        },
                        {
                            text: "É uma pergunta longa demais pra início de conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Só funciona quando o produto já está no ar há meses",
                            isCorrect: false,
                        },
                        {
                            text: "Exige que o entrevistado conheça bem o mercado todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o teste da mãe pede que você faça na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Perguntar o que a pessoa fez, não o que ela acha",
                            isCorrect: true,
                        },
                        {
                            text: "Entrevistar familiares antes de procurar clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar a ideia com palavras simples e sem jargão",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir que alguém próximo revise o roteiro da sessão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você quer saber se essa dor vale 30 reais por mês pro entrevistado. Que pergunta traz evidência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quanto você já gastou tentando resolver isso?",
                            isCorrect: true,
                        },
                        {
                            text: "Você pagaria 30 reais por mês numa solução assim?",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto acha justo cobrar por um produto desse tipo?",
                            isCorrect: false,
                        },
                        {
                            text: "Você acha que o seu chefe aprovaria essa despesa?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No fim da conversa, a pessoa diz que a tela ficou linda. Como transformar isso em dado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pedir que ela mostre como fez isso da última vez",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntar que nota de zero a dez ela daria pra tela",
                            isCorrect: false,
                        },
                        {
                            text: "Agradecer e registrar o elogio como validação forte",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar se ela indicaria a tela pra outros colegas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quatro entrevistados reagiram de jeitos diferentes à conversa. Qual reação é o sinal mais forte?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A pessoa que mandou a planilha que usa hoje",
                            isCorrect: true,
                        },
                        {
                            text: "A pessoa que disse ser a melhor ideia que já viu",
                            isCorrect: false,
                        },
                        {
                            text: "A pessoa que pediu pra receber novidades por email",
                            isCorrect: false,
                        },
                        {
                            text: "A pessoa que elogiou o design e indicou um amigo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O roteiro flexível",
            blocks: [
                {
                    type: "text",
                    value: "# Bússola, não trilho\n\nDuas entrevistas com o mesmo roteiro. Na primeira, a pessoa começa a contar como remonta a escala de plantão do hospital todo domingo à noite, e o entrevistador corta: 'legal, mas voltando à pergunta 4...'. Na segunda, o entrevistador larga o roteiro por dez minutos, segue a história e descobre que a escala é refeita porque o sistema não avisa quando um plantonista troca com o colega. A pergunta 4 nunca chegaria lá.\n\nO roteiro existe pra você não esquecer o que precisa cobrir e pra que duas entrevistas do time sejam comparáveis depois. Ele não existe pra ser lido em ordem, palavra por palavra. Quem lê o roteiro em voz alta conduz um formulário falado, e formulário a pessoa responde no automático.\n\nA sessão dura de 30 a 45 minutos. Menos que isso não dá tempo de sair da resposta ensaiada; mais que isso a pessoa cansa e passa a responder pra encerrar logo. Dentro dessa janela, a meta não é cobrir as doze perguntas: é sair com duas ou três HISTÓRIAS ESPECÍFICAS, com data, nome de ferramenta e o que aconteceu depois.",
                },
                {
                    type: "text",
                    value: "## A anatomia da conversa\n\nA ABERTURA leva uns três minutos e faz mais trabalho do que parece: quem é você, por que chamou aquela pessoa, quanto tempo vai levar, pedido de permissão pra gravar e duas frases que soltam o entrevistado, ditas com todas as letras: não existe resposta errada aqui, e eu não vim te vender nada.\n\nDepois vem o AQUECIMENTO com a rotina: como é o seu dia, com quem você trabalha, o que passa pela sua mão. Serve pra você calibrar o vocabulário e pra pessoa se ouvir falando.\n\nO coração é a HISTÓRIA ESPECÍFICA: 'me conta a última vez que você precisou refazer a escala de um plantão'. Repare na diferença pra 'como você costuma fazer?'. A pergunta genérica devolve um processo idealizado, aquele que a pessoa acha que segue; 'a última vez' devolve memória, com o improviso, o WhatsApp às onze da noite e a planilha paralela.\n\nDo episódio em diante é APROFUNDAMENTO: e aí, o que você fez em seguida, quanto tempo levou, quem mais entrou nisso, por que desse jeito. E o FECHAMENTO: o que eu deveria ter perguntado e não perguntei, quem mais vive isso, posso te procurar de novo.",
                },
                {
                    type: "code",
                    value: "ROTEIRO DE ENTREVISTA (35 a 45 min)\nProduto: gestão de escala de plantão em hospital\nPerfil: coordenador de enfermagem que monta a escala\n\n1. ABERTURA (3 min)\n   Sou o João, do time de produto.\n   Não vim vender nada, vim entender como você monta escala hoje.\n   Não existe resposta errada; o que te atrapalha é o que interessa.\n   Posso gravar só pra não perder nada? Fica com o time.\n\n2. AQUECIMENTO (5 min)\n   Como é um dia normal seu na coordenação?\n   Quantas pessoas entram na escala que você cuida?\n   Quem depende dessa escala depois de pronta?\n\n3. HISTÓRIA ESPECÍFICA (15 min)\n   Me conta a última vez que você precisou refazer uma escala.\n   Quando foi isso? Que dia da semana, que horário?\n   O que aconteceu antes? Como você ficou sabendo?\n   O que você usou pra resolver? Me mostra na tela, se puder.\n\n4. APROFUNDAR (10 min)\n   E aí, o que você fez em seguida?\n   Quanto tempo isso levou do início ao fim?\n   Quem mais precisou entrar pra resolver?\n   Por que desse jeito, e não de outro?\n   O que você já tentou antes que não funcionou?\n\n5. FECHAMENTO (4 min)\n   O que eu deveria ter perguntado e não perguntei?\n   Quem mais vive isso e toparia conversar comigo?\n   Posso te procurar se surgir dúvida? Obrigado pelo tempo.",
                },
                {
                    type: "table",
                    value: '[["Etapa","Tempo","O que você quer de saída"],["Abertura","3 min","Permissão pra gravar e clima leve"],["Aquecimento","5 min","Vocabulário e contexto da rotina"],["História específica","15 min","Um episódio com data e ferramenta"],["Aprofundar","10 min","Causa, esforço e tentativas antigas"],["Fechamento","4 min","Indicação e permissão pra voltar"]]',
                },
                {
                    type: "quote",
                    value: "'Como você costuma fazer?' devolve o processo que a pessoa gostaria de seguir. 'A última vez' devolve o que ela fez de verdade.",
                },
            ],
            questions: [
                {
                    statement: "O que significa dizer que o roteiro é bússola, e não trilho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele garante a cobertura, mas a ordem pode mudar",
                            isCorrect: true,
                        },
                        {
                            text: "Ele precisa ser lido na ordem exata toda vez",
                            isCorrect: false,
                        },
                        {
                            text: "Ele deve ser enviado ao entrevistado na véspera",
                            isCorrect: false,
                        },
                        {
                            text: "Ele substitui as anotações que o time faria depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quanto tempo costuma durar uma entrevista de discovery bem conduzida?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "De 30 a 45 minutos, com espaço pra desvio útil",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 10 minutos, para não cansar o entrevistado",
                            isCorrect: false,
                        },
                        {
                            text: "Umas 3 horas, para cobrir todo o roteiro preparado",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo que o entrevistado quiser, sem limite algum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que 'me conta a última vez que você refez a escala' rende mais que 'como você costuma fazer?'",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A primeira puxa memória; a segunda puxa o ideal",
                            isCorrect: true,
                        },
                        {
                            text: "A primeira é mais curta e cabe melhor no tempo total",
                            isCorrect: false,
                        },
                        {
                            text: "A segunda exige que a pessoa conheça o produto",
                            isCorrect: false,
                        },
                        {
                            text: "A primeira permite pular a etapa de aquecimento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que frases da abertura mais soltam o entrevistado pra falar do que atrapalha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não existe resposta errada e não vim vender nada",
                            isCorrect: true,
                        },
                        {
                            text: "Já temos a solução pronta e queremos sua aprovação",
                            isCorrect: false,
                        },
                        {
                            text: "Suas respostas vão definir o roadmap do próximo ano",
                            isCorrect: false,
                        },
                        {
                            text: "Responda rápido porque temos pouco tempo de conversa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Aos 12 minutos a pessoa foge do roteiro e conta uma dor forte que você nem tinha mapeado. O que fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Seguir a história e retomar o roteiro depois dela",
                            isCorrect: true,
                        },
                        {
                            text: "Interromper com educação e voltar à pergunta atual",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar a sessão porque a amostra ficou perdida",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar sua solução e perguntar se resolveria a dor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Conduzir sem contaminar",
            blocks: [
                {
                    type: "text",
                    value: "# Três segundos de silêncio valem uma pergunta\n\nA pessoa responde, dá uma pausa, e o entrevistador ansioso emenda a próxima pergunta na hora. Some ali a melhor parte da entrevista. Pausa não é constrangimento: é a pessoa terminando de lembrar. Conte até três em silêncio depois que ela parar de falar, com cara de quem ainda está escutando, e na maioria das vezes ela mesma completa: 'ah, e teve aquela vez que eu tive que ligar pro plantonista às onze da noite'.\n\nO SILÊNCIO é a ferramenta mais barata que você tem e a mais difícil de usar, porque o instinto manda preencher o vazio. Os outros vícios são parentes do mesmo instinto de ocupar espaço: completar a frase do outro, corrigir a pessoa quando ela usa o nome errado de uma função, empilhar duas perguntas numa só ('e como foi isso, você achou difícil?') e responder no lugar dela quando ela demora.\n\nCada um desses tira a conversa da cabeça do entrevistado e coloca na sua. Você sai da call com respostas, mas são as suas respostas ditas com a voz de outra pessoa. É o pior tipo de dado: parece pesquisa e é eco.",
                },
                {
                    type: "table",
                    value: '[["Vício do entrevistador","O que ele causa","No lugar disso"],["Emendar pergunta na pausa","Perde o complemento","Conte até três em silêncio"],["Explicar a solução no meio","Vira demo e acabou","Devolva pro problema"],["Não é frustrante quando trava?","Planta a emoção na pessoa","Como foi da última vez?"],["Duas perguntas numa só","Ela responde só uma","Uma por vez, e espere"],["Corrigir o termo que ela usa","Ela passa a se policiar","Anote a palavra dela"]]',
                },
                {
                    type: "quote",
                    value: "No minuto em que você começa a explicar a sua solução, a entrevista acabou e virou demo. Só que ninguém avisa você.",
                },
                {
                    type: "text",
                    value: "## Anotar a frase, não a sua conclusão\n\nO entrevistado diz: 'eu refaço a escala no domingo à noite porque só descubro a troca quando alguém não aparece'. Você anota: 'usuário quer notificação de troca'. Pronto, o dado morreu. Sobrou a sua hipótese de solução, e ela não pode mais ser revista, porque a frase original não existe em lugar nenhum.\n\nAnote LITERAL, entre aspas, com o vocabulário da pessoa. Se ela chama de 'escala furada', escreva escala furada, e não 'inconsistência de alocação'. A frase crua sobrevive a mudanças de opinião: daqui a três semanas, quando o time discutir se o problema é a notificação ou o processo de troca, a citação decide. Sua interpretação de hoje só repete o que você já achava antes de entrar na call.\n\nInterpretar tem hora, e a hora é depois. Durante a conversa, seu trabalho é capturar: o que ela fez, com que palavras contou, que número apareceu. Na dúvida entre anotar rápido e entender direito, anote rápido. É justamente pra isso que existe uma segunda pessoa na sala.",
                },
                {
                    type: "text",
                    value: "## Papéis, gravação e o cuidado de não intimidar\n\nEntrevista boa tem dois papéis separados. Quem CONDUZ olha pra pessoa, faz uma pergunta por vez e cuida do ritmo. Quem ANOTA fica quieto, registra frases literais com o horário e só entra no fim, com as perguntas que ficaram soltas. Fazer os dois sozinho é possível, mas você vai perder metade das falas ou metade do contato visual.\n\nGrave, sempre com consentimento explícito e dito em voz alta no começo: pra que serve, quem vai ver, por quanto tempo fica guardado. A gravação livra o entrevistador da transcrição e permite conferir a citação exata depois.\n\nCuidado com a proporção: três pessoas do time contra um entrevistado não é entrevista, é banca de avaliação. A pessoa vira aluno em prova oral e passa a dar a resposta que acha certa. Duas do seu lado é o teto.\n\nE quando ela pedir a solução ('e vocês vão fazer um botão pra isso?'), não prometa nada e não discuta o botão. Anote como pedido, agradeça e volte pro problema: 'anotei aqui. E hoje, quando isso acontece, o que você faz?'.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que vale contar até três em silêncio depois que o entrevistado responde?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque a pessoa costuma completar com a parte boa",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o silêncio melhora a qualidade final do áudio",
                            isCorrect: false,
                        },
                        {
                            text: "Porque assim ela percebe que errou e se corrige",
                            isCorrect: false,
                        },
                        {
                            text: "Porque três segundos é a pausa padrão de uma call",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O entrevistador pergunta: 'não é frustrante quando o sistema trava?'. Qual é o problema?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A pergunta induz e já entrega a emoção esperada",
                            isCorrect: true,
                        },
                        {
                            text: "A pergunta é técnica demais pra quem não é da área",
                            isCorrect: false,
                        },
                        {
                            text: "A pergunta deveria vir antes do aquecimento inicial",
                            isCorrect: false,
                        },
                        {
                            text: "A pergunta revela detalhes do concorrente sem querer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A pessoa descreve o problema e você anota 'usuário quer notificação'. Que erro de condução é esse?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Anotar a sua conclusão e perder a frase original",
                            isCorrect: true,
                        },
                        {
                            text: "Anotar rápido demais e comprometer a ortografia final",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar sem pedir o consentimento da gravação",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar de perguntar que nota ela dá pro problema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No meio da conversa ela pergunta: 'e vocês vão fazer um botão pra isso?'. O que fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Anotar o pedido e voltar pro problema por trás",
                            isCorrect: true,
                        },
                        {
                            text: "Prometer o botão pro próximo trimestre e seguir",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar o roadmap pra alinhar a expectativa dela",
                            isCorrect: false,
                        },
                        {
                            text: "Mostrar o protótipo e pedir uma nota de zero a dez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Três pessoas do time entram na call com um único entrevistado. Qual é o efeito mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A pessoa se sente avaliada e conta menos do que sabe",
                            isCorrect: true,
                        },
                        {
                            text: "A pessoa se distrai e acaba trocando o nome das telas",
                            isCorrect: false,
                        },
                        {
                            text: "A gravação perde qualidade e a transcrição fica ruim",
                            isCorrect: false,
                        },
                        {
                            text: "A sessão dobra de tempo por causa das apresentações",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Da conversa ao padrão",
            blocks: [
                {
                    type: "text",
                    value: "# Entrevista sem síntese vira lembrança\n\nSexta-feira, o time fechou nove entrevistas na semana. As gravações estão na pasta, as notas em três documentos diferentes e a cabeça de todo mundo cheia de história boa. Duas semanas depois, na reunião de priorização, alguém pergunta o que a pesquisa mostrou, e sai isso: 'teve um cara que falou uma coisa muito interessante sobre relatório'. Nove conversas viraram uma anedota.\n\nSÍNTESE é a etapa que transforma conversa em conhecimento do time, e ela tem prazo: 24 a 48 horas depois da entrevista, enquanto a memória ainda segura o contexto que a nota não capturou. Passou disso, você depende da transcrição pura e o custo triplica.\n\nE ela é feita junto, pelo TRIO: PM, design e engenharia. Não porque fica bonito no processo, mas porque cada um ouve uma coisa. O design percebe a hesitação na tela, a engenharia percebe que aquele número vem de um sistema que ninguém integra, o PM percebe o efeito no contrato. Síntese feita por uma pessoa só produz o que aquela pessoa já achava antes, agora com citação de apoio.",
                },
                {
                    type: "text",
                    value: "## Do bruto ao insight, em quatro passos\n\nO caminho é sempre o mesmo, e cada passo perde volume e ganha significado. Primeiro, o BRUTO: gravação, transcrição e notas. Segundo, os TRECHOS: você varre o material e recorta só o que é comportamento observado ou fala forte, sempre com as palavras da pessoa. 'Refaço a escala no domingo à noite' é trecho; 'usuário insatisfeito' não é.\n\nTerceiro, os CARTÕES: cada trecho vira um cartão com a citação, quem falou e o contexto. Quarto, o agrupamento por semelhança, o MAPA DE AFINIDADE: você espalha os cartões, junta os que falam da mesma coisa e deixa o grupo se formar sozinho, sem categoria decidida antes. Grupo grande demais costuma ser vago; grupo com um cartão só ainda não é padrão, é um caso.\n\nCada grupo estável vira uma OPORTUNIDADE nomeada, e o nome sai da linguagem do usuário, não do seu vocabulário interno. 'Descobrir a troca de plantão tarde demais' é nome de oportunidade. 'Módulo de notificações' é nome de solução, e não é solução que você está mapeando nesta etapa.",
                },
                {
                    type: "table",
                    value: '[["O que apareceu na conversa","Como classificar","O que fazer com isso"],["Refaço a escala todo domingo","Dor, com comportamento","Vira oportunidade forte"],["Queria ver tudo num lugar só","Desejo declarado","Guarde e procure evidência"],["Põe um botão de exportar aí","Solução pedida","Pergunte o problema por trás"],["Gastei 400 reais numa planilha","Dor, com dinheiro","Sinal mais forte da rodada"]]',
                },
                {
                    type: "quote",
                    value: "Contar quantas pessoas pediram a mesma feature não é pesquisa, é urna. Pesquisa é descobrir o que elas tentaram antes de pedir.",
                },
                {
                    type: "text",
                    value: "## O que faz um insight ser acionável\n\nInsight que serve pra decidir tem quatro partes: QUEM (o segmento, não 'os usuários'), EM QUE SITUAÇÃO (o gatilho, o momento), O QUE TENTOU (a solução caseira de hoje) e O QUE TRAVOU (onde a tentativa falha). Falte uma dessas e o time volta a discutir opinião.\n\nCompare. Versão inútil: 'os coordenadores querem mais notificações'. Versão acionável: 'coordenador de enfermagem de hospital médio, quando um plantonista troca com o colega sem avisar, descobre pelo WhatsApp na véspera e refaz a escala à mão no domingo à noite, porque o sistema só mostra a escala publicada'. A segunda dá pra medir, dá pra desenhar em cima e dá pra contestar com dado.\n\nSepare sempre DOR, DESEJO e SOLUÇÃO PEDIDA. Dor tem evidência de comportamento; desejo é o que a pessoa gostaria; solução pedida é o que ela mandou você construir, e é a mais perigosa, porque chega pronta e economiza o seu pensamento.\n\nCom uma pilha de oportunidades bem nomeadas na mão, a pergunta seguinte é inevitável: quais delas se conectam, e por onde começar. É aí que a lista precisa virar mapa.",
                },
            ],
            questions: [
                {
                    statement: "Em quanto tempo depois da entrevista a síntese deveria acontecer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Em 24 a 48 horas, com a memória ainda fresca",
                            isCorrect: true,
                        },
                        {
                            text: "No fim do trimestre, junto da revisão do roadmap",
                            isCorrect: false,
                        },
                        {
                            text: "Só depois de completar as trinta entrevistas todas",
                            isCorrect: false,
                        },
                        {
                            text: "Assim que a transcrição automática for revisada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o time faz num mapa de afinidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Agrupa cartões parecidos até um padrão aparecer",
                            isCorrect: true,
                        },
                        {
                            text: "Ordena as entrevistas pela nota que o usuário deu",
                            isCorrect: false,
                        },
                        {
                            text: "Classifica usuários por perfil demográfico e região",
                            isCorrect: false,
                        },
                        {
                            text: "Lista as features mais pedidas em ordem de votos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um entrevistado diz: 'põe um botão de exportar aí'. Como esse achado deve ser registrado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como solução pedida, e ir atrás da dor por trás",
                            isCorrect: true,
                        },
                        {
                            text: "Como oportunidade validada pelo usuário que a citou",
                            isCorrect: false,
                        },
                        {
                            text: "Como requisito, já que veio direto de quem usa",
                            isCorrect: false,
                        },
                        {
                            text: "Como desejo, e priorizar por número de pedidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que partes um insight precisa ter pra ser acionável na hora de decidir?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem, em que situação, o que tentou e o que travou",
                            isCorrect: true,
                        },
                        {
                            text: "Volume de pedidos, prazo, custo estimado e dono",
                            isCorrect: false,
                        },
                        {
                            text: "Persona, jornada, tamanho de mercado e concorrentes",
                            isCorrect: false,
                        },
                        {
                            text: "Nome da feature, tela afetada e critério de aceite",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O PM faz a síntese sozinho no domingo e apresenta o resultado pronto na segunda. Qual é a maior perda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem o trio, o achado vira memória de uma pessoa",
                            isCorrect: true,
                        },
                        {
                            text: "A apresentação fica longa demais pra reunião semanal",
                            isCorrect: false,
                        },
                        {
                            text: "As gravações precisam ser arquivadas de novo no drive",
                            isCorrect: false,
                        },
                        {
                            text: "O design perde o prazo de entregar o protótipo da tela",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Mapear oportunidades",
    aulas: [
        {
            titulo: "A Opportunity Solution Tree",
            blocks: [
                {
                    type: "text",
                    value: "# Uma árvore no lugar da lista\n\nNa review de trimestre, um diretor pergunta por que o time está construindo o chat interno. A resposta sai enrolada: 'estava no backlog', 'o cliente grande pediu', 'todo concorrente tem'. Ninguém consegue mostrar o caminho que sai da meta do negócio e chega naquela tela. Não é má-fé do time: é que a lista priorizada não guarda esse caminho em lugar nenhum.\n\nA OPPORTUNITY SOLUTION TREE, proposta por Teresa Torres, é o desenho que guarda. No topo fica um OUTCOME, um resultado de comportamento mensurável do tipo 'aumentar a taxa de segunda compra em 30 dias'. No nível seguinte vêm as OPORTUNIDADES: dores, necessidades e desejos que apareceram nas entrevistas, agrupadas em ramos e sub-ramos. Nas folhas ficam as SOLUÇÕES, aquilo que o time pode construir. Embaixo de cada solução ficam os TESTES DE SUPOSIÇÃO, que dizem se ela se sustenta antes de virar trimestre de trabalho.\n\nLida de baixo pra cima, a árvore responde o diretor sem improviso: esse chat ataca a oportunidade de não saber se o pedido vai atrasar, que apareceu em seis das nove entrevistas, e essa oportunidade é um dos caminhos até o outcome do trimestre. Lida de cima pra baixo, ela mostra o que também poderia ter sido feito e não foi.",
                },
                {
                    type: "table",
                    value: '[["Nível","O que entra","O que fica de fora"],["Outcome","Comportamento medível do usuário","Lista de entregas do trimestre"],["Oportunidade","Dor ou necessidade da entrevista","Nome de feature ou tecnologia"],["Solução","O que o time pode construir","Dor solta, sem ramo de origem"],["Teste","Experimento que checa a suposição","Opinião do time em reunião"]]',
                },
                {
                    type: "code",
                    value: "OST DE UM MARKETPLACE DE MÓVEIS USADOS\n\nOUTCOME: aumentar a taxa de segunda compra em 30 dias\n  OPORTUNIDADE: não confio no estado real do móvel\n    sub: a foto do anúncio esconde o defeito\n      SOLUÇÃO: foto obrigatória de quatro ângulos\n        TESTE: 20 anúncios novos com o fluxo obrigatório\n      SOLUÇÃO: selo de vendedor que aceita devolução\n        TESTE: oferta do selo em 3 categorias\n    sub: não sei se o vendedor responde\n  OPORTUNIDADE: o preço da entrega me pega de surpresa\n  OPORTUNIDADE: comprei uma vez e esqueci que existe",
                },
                {
                    type: "quote",
                    value: "Backlog priorizado diz o que vem primeiro. A árvore diz por que aquilo está na lista, e o que você decidiu não fazer.",
                },
                {
                    type: "text",
                    value: "## Por que a árvore disciplina\n\nTrês coisas mudam quando o desenho existe. A primeira: fica visível que a solução da moda atende UM ramo entre muitos. O chat resolve um pedaço da ansiedade da espera e não encosta nos outros dois ramos que apareceram nas mesmas entrevistas. Sem a árvore, esse recorte fica invisível e o time acha que está atacando o problema inteiro.\n\nA segunda: a árvore obriga a comparação antes do compromisso. Fechar um trimestre em cima de um ramo é abrir mão dos outros por três meses, e essa troca merece ser feita com os ramos lado a lado, não no impulso da reunião em que alguém falou mais alto.\n\nA terceira: 'por que estamos fazendo isso?' passa a ter resposta desenhada em vez de justificativa inventada depois. Repare que a lista de backlog priorizada não faz nada disso. Ela guarda a ordem das entregas e joga fora o raciocínio que produziu essa ordem. Seis semanas depois, ninguém lembra se aquele item entrou porque a evidência era forte ou porque sobrou espaço na sprint. A árvore guarda as duas pontas: o que o time decidiu fazer e o que decidiu deixar pra depois.",
                },
            ],
            questions: [
                {
                    statement: "Na Opportunity Solution Tree, o que fica no topo do desenho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um outcome: resultado de comportamento medível",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de features aprovadas para o próximo trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do executivo que patrocina a iniciativa",
                            isCorrect: false,
                        },
                        {
                            text: "O orçamento disponível para o time no semestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que entra no nível de oportunidades da árvore?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dores e necessidades ouvidas nas entrevistas",
                            isCorrect: true,
                        },
                        {
                            text: "As telas que o time de design já desenhou",
                            isCorrect: false,
                        },
                        {
                            text: "Os épicos que a engenharia estimou em pontos",
                            isCorrect: false,
                        },
                        {
                            text: "As metas de receita que a diretoria definiu no ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na review, o diretor pergunta por que o time construiu o chat interno. Como a árvore ajuda a responder?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra o caminho do outcome até aquela solução",
                            isCorrect: true,
                        },
                        {
                            text: "Prova que o chat foi entregue dentro do prazo",
                            isCorrect: false,
                        },
                        {
                            text: "Lista quantos pontos o time gastou naquele chat",
                            isCorrect: false,
                        },
                        {
                            text: "Garante que o cliente que pediu vai renovar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma lista de backlog priorizada esconde o porquê das entregas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Guarda a ordem das entregas, não o raciocínio",
                            isCorrect: true,
                        },
                        {
                            text: "Porque ferramenta de backlog não aceita comentário",
                            isCorrect: false,
                        },
                        {
                            text: "Porque só o PM pode abrir a lista completa de itens",
                            isCorrect: false,
                        },
                        {
                            text: "Porque todo item de backlog vira linguagem técnica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer comprometer o trimestre inteiro com a solução da moda. Que disciplina a árvore impõe antes disso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comparar os ramos irmãos antes de fechar a aposta",
                            isCorrect: true,
                        },
                        {
                            text: "Estimar em horas cada tarefa que está no backlog",
                            isCorrect: false,
                        },
                        {
                            text: "Validar com o jurídico a viabilidade do lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher a solução que o maior cliente pediu antes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Oportunidade não é solução",
            blocks: [
                {
                    type: "text",
                    value: "# O botão que esconde uma dor\n\nUm cliente do ERP abre um chamado curto: 'preciso de um botão de exportar pra Excel'. O time anota, estima, entrega. Três semanas depois o mesmo cliente reclama de novo, agora de outra coisa. O botão nunca era o assunto.\n\nPor trás do pedido tinha uma oportunidade: 'preciso mostrar o número da semana pro meu chefe e não confio no que a tela mostra'. Repare na distância entre as duas frases. O botão é UMA solução possível pra essa dor, e nem a melhor: se o problema é confiança no número, exportar pro Excel só muda a desconfiança de lugar.\n\nEssa é a confusão mais comum do discovery. As pessoas não descrevem dores, descrevem soluções, porque é assim que a gente fala no dia a dia. Ninguém pede 'preciso de segurança sobre o fechamento semanal'; pede um botão, uma integração, uma tela. Toda solução pedida esconde uma oportunidade, e traduzir uma na outra é o trabalho.\n\nTraduzir usa três perguntas simples: o que você faria com isso depois de ter, quando foi a última vez que precisou, e como você resolveu sem. As três puxam história, e história é onde a dor real aparece.",
                },
                {
                    type: "code",
                    value: "TRADUZINDO UM PEDIDO EM OPORTUNIDADE\n\nPedido bruto: 'quero um botão de exportar pra Excel'\n\n1. O que você faria com o arquivo depois de baixar?\n   'monto o resumo da semana pro meu gerente'\n2. Quando foi a última vez que você precisou disso?\n   'sexta passada, gastei duas horas conferindo'\n3. Como você resolveu sem o botão?\n   'digitei na planilha e conferi item por item'\n\nOportunidade: preciso fechar o número da semana\n              e confiar nele\nSoluções possíveis: painel de fechamento,\n                    alerta de divergência,\n                    conferência entre dois relatórios",
                },
                {
                    type: "table",
                    value: '[["Pedido bruto","Oportunidade por trás","Soluções possíveis"],["ERP: exportar pra Excel","Fechar o número da semana com confiança","Painel semanal, alerta de divergência"],["Delivery: chat com o entregador","Saber se o pedido vai atrasar","Rastreio ao vivo, aviso de atraso"],["RH: campo livre na avaliação","Registrar o combinado sem constranger","Nota privada, roteiro de conversa"],["Cobrança: boleto no WhatsApp","Ser avisado antes de o boleto vencer","Lembrete no canal que a pessoa usa"]]',
                },
                {
                    type: "quote",
                    value: "Todo pedido de feature é uma resposta. O trabalho do discovery é descobrir qual era a pergunta.",
                },
                {
                    type: "text",
                    value: "## Como reconhecer uma oportunidade bem escrita\n\nUma oportunidade boa tem quatro marcas. Está na VOZ DO USUÁRIO, com as palavras que ele usou na entrevista. Está no presente, porque é algo que já acontece com ele, não algo que aconteceria se o produto existisse. Não embute tecnologia: descreve a dor, nunca o mecanismo. E é específica o suficiente pra caber um teste, ou seja, dá pra imaginar como saberíamos se ela sumiu.\n\nTrês formatos costumam se disfarçar de oportunidade e não são. A vaga: 'melhorar a experiência' não diz o que dói, pra quem, nem quando. A disfarçada de solução: 'ter integração com WhatsApp' já escolheu o caminho e fecha o leque antes da conversa começar. E a meta de negócio: 'aumentar receita' é resultado da empresa, não dor de ninguém; ela até pode ser o outcome do topo, mas nunca é oportunidade.\n\nVale insistir num ponto que parece detalhe: traduzir AMPLIA o leque em vez de fechar. Quando o pedido vira 'preciso fechar o número da semana e confiar nele', aparecem caminhos que ninguém tinha considerado, do painel de fechamento ao alerta que avisa quando dois relatórios discordam. Com o botão na mesa, a conversa já tinha acabado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um cliente pede 'um botão de exportar pra Excel'. O que essa frase é, na árvore?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma solução, que ainda esconde a oportunidade",
                            isCorrect: true,
                        },
                        {
                            text: "Uma oportunidade escrita na voz do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Um outcome de comportamento, medível pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "Um teste de suposição pronto para ser rodado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza uma oportunidade bem escrita?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Está na voz do usuário e não embute tecnologia",
                            isCorrect: true,
                        },
                        {
                            text: "Cita a ferramenta que o time vai usar na entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Traz a meta de receita que a empresa quer bater",
                            isCorrect: false,
                        },
                        {
                            text: "Descreve a tela que o design já validou com a área",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma gerente de RH pede 'integração com WhatsApp' na avaliação de desempenho. Qual é o primeiro movimento do time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perguntar o que ela faria com isso e quando doeu",
                            isCorrect: true,
                        },
                        {
                            text: "Abrir a tarefa de integração e estimar o esforço",
                            isCorrect: false,
                        },
                        {
                            text: "Checar se a concorrência já tem essa integração",
                            isCorrect: false,
                        },
                        {
                            text: "Levar o pedido direto pro comitê de priorização mensal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que traduzir um pedido em oportunidade amplia o leque em vez de fechar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma oportunidade aceita várias soluções possíveis",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o pedido original costuma ser mais caro de fazer",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a tradução transfere a decisão para o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cada oportunidade gera uma feature equivalente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa empresa de cobrança, qual destas frases está escrita como oportunidade de verdade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não sei se o boleto chegou antes de vencer",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a receita de cobrança em quinze por cento",
                            isCorrect: false,
                        },
                        {
                            text: "Ter integração com WhatsApp para envio de boleto",
                            isCorrect: false,
                        },
                        {
                            text: "Melhorar a experiência de cobrança dos clientes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Alimentar a árvore",
            blocks: [
                {
                    type: "text",
                    value: "# Árvore viva, não slide de kickoff\n\nO time faz um offsite, desenha uma OST bonita, tira print e sobe no wiki. Três meses depois, quinze entrevistas novas viraram quinze documentos separados que ninguém abre, e a árvore do print continua igualzinha. Ela virou decoração.\n\nÁrvore é artefato VIVO do trio (PM, design e engenharia), atualizado no mesmo ritmo do discovery contínuo. Cada rodada semanal de entrevista produz oportunidades novas, e cada uma delas faz uma de duas coisas: encaixa num ramo que já existe, e aí a confiança naquele ramo sobe (a quarta pessoa dizendo a mesma coisa vale muito mais que a primeira), ou não encaixa em lugar nenhum, e aí abre um ramo novo que estava fora do seu mapa.\n\nDados de uso alimentam a árvore por outro lado, e é importante não confundir os dois papéis. Um funil que despenca de 100 pra 40 numa etapa do cadastro aponta ONDE procurar oportunidade. Ele não diz QUAL é a dor: pode ser confusão, pode ser desconfiança, pode ser um documento que a pessoa não tem em mãos naquela hora. O número escolhe o lugar da conversa; a conversa descobre o conteúdo.",
                },
                {
                    type: "table",
                    value: '[["Fonte","O que ela traz pra árvore","Onde ela para"],["Entrevista semanal","Oportunidade nova ou reforço de ramo","Não mede quanta gente vive aquilo"],["Funil de uso","O lugar onde procurar oportunidade","Não diz qual é a dor da etapa"],["Ticket de suporte","Dor recorrente já com contexto","Vem só de quem reclamou"],["Time comercial","Objeção repetida na negociação","Chega filtrada pela venda"]]',
                },
                {
                    type: "code",
                    value: "RITUAL SEMANAL DA ÁRVORE (30 MINUTOS, O TRIO JUNTO)\n\n00:00 Ler em voz alta as oportunidades novas da semana\n00:10 Encaixar cada uma: ramo existente ou ramo novo\n00:20 Fundir duplicatas e renomear o que ficou confuso\n00:25 Marcar ramos sem toque há 3 meses para revisão\n\nFICHA DE UMA OPORTUNIDADE\n  texto: não confio no número que a tela mostra\n  origem: entrevista 12, minuto 14, Carla do financeiro\n  ramo: confiança no dado do fechamento\n  reforçada por: 4 das 9 entrevistas do mês",
                },
                {
                    type: "quote",
                    value: "Árvore que só uma pessoa mexe vira a opinião dessa pessoa com um desenho bonito em volta.",
                },
                {
                    type: "text",
                    value: "## Higiene, casa e ritual\n\nArtefato vivo junta sujeira. Duplicata é a mais comum: 'não sei se chegou' e 'fico na dúvida se o boleto entrou' são a mesma oportunidade com palavras diferentes, e precisam virar uma só, somando as evidências das duas. Ramo que ninguém tocou em três meses merece revisão: ou a dor sumiu, ou você parou de perguntar sobre ela. E cada oportunidade guarda o link com o trecho de entrevista que a originou, com pessoa, data e minuto. Essa rastreabilidade é o que permite responder 'de onde você tirou isso?' sem apelar pra memória.\n\nDois erros derrubam a prática. O primeiro é deixar a árvore com uma pessoa só: vira a opinião dela, e o time nem discorda, porque não participou da construção. O segundo é tratar cada entrevista como documento independente; sem lugar comum, o aprendizado da semana passada não conversa com o desta semana.\n\nEm 2026, a casa da árvore costuma ser uma ferramenta de quadro compartilhado, categoria que já existe em qualquer empresa. Não procure o produto perfeito. Procure o lugar que o trio abre toda semana, e reserve trinta minutos fixos na agenda pra atualizar o desenho junto.",
                },
            ],
            questions: [
                {
                    statement: "Quem mantém a árvore de oportunidades atualizada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O trio de produto: PM, design e engenharia",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas o PM, que centraliza a visão do produto",
                            isCorrect: false,
                        },
                        {
                            text: "A liderança, na reunião trimestral de planejamento",
                            isCorrect: false,
                        },
                        {
                            text: "O time de dados, dono das métricas de uso do app",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma rodada nova de entrevistas faz com a árvore?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Encaixa num ramo existente ou abre um ramo novo",
                            isCorrect: true,
                        },
                        {
                            text: "Substitui as oportunidades levantadas nas anteriores",
                            isCorrect: false,
                        },
                        {
                            text: "Vira documento separado, guardado fora da árvore",
                            isCorrect: false,
                        },
                        {
                            text: "Confirma a solução que o time já tinha escolhido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O funil mostra queda de 60% numa etapa do cadastro. O que esse dado entrega pra árvore?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Aponta onde procurar, mas não diz qual é a dor",
                            isCorrect: true,
                        },
                        {
                            text: "Entrega a oportunidade pronta, na voz do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Prova que a solução atual não move o outcome do topo",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa a rodada de entrevistas daquela semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas oportunidades vindas de entrevistas diferentes dizem a mesma coisa com outras palavras. O que fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fundir numa só e somar as evidências das duas",
                            isCorrect: true,
                        },
                        {
                            text: "Manter as duas, porque vieram de pessoas distintas",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar a mais antiga e ficar com o texto mais novo",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir um ramo novo para acomodar as duas versões",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que cada oportunidade guarda o link com o trecho de entrevista que a originou?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Para rastrear de onde veio quando alguém duvidar",
                            isCorrect: true,
                        },
                        {
                            text: "Para provar que a pesquisa bateu a meta de amostra",
                            isCorrect: false,
                        },
                        {
                            text: "Para permitir que o jurídico audite a base de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Para calcular quantas entrevistas faltam no trimestre",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escolher o ramo",
            blocks: [
                {
                    type: "text",
                    value: "# Onde apostar o trimestre\n\nA árvore está com quatro ramos e todo mundo quer atacar os quatro. Não dá: trimestre é finito e o time é o mesmo. Aí acontece o de sempre, e você já viu isso acontecer: escolhe-se o ramo do cliente que gritou mais alto na renovação, ou o ramo que o executivo mencionou no corredor. Nos dois casos a decisão foi tomada, só que sem critério que alguém consiga repetir depois.\n\nEscolher ramo com critério explícito custa uma hora e economiza meses. São cinco perguntas. TAMANHO DA DOR: quão grave é quando acontece? ALCANCE: quantas pessoas do segmento vivem isso? FREQUÊNCIA: acontece uma vez por ano ou toda sexta? ALINHAMENTO: resolver isso move o outcome do topo? Se não move, é oportunidade legítima, mas de outra árvore. CAPACIDADE: temos como atacar isso nos próximos meses, com o time que temos?\n\nUm detalhe que muda o resultado: a comparação é entre RAMOS IRMÃOS, os que estão no mesmo nível e disputam o mesmo outcome. Comparar uma oportunidade enorme com um sub-ramo minúsculo de outra família é o jeito mais rápido de chegar num número que não quer dizer nada.",
                },
                {
                    type: "table",
                    value: '[["Critério","Pergunta que ele responde","Peso"],["Tamanho da dor","Quão grave é quando acontece?","3"],["Alcance","Quantos do segmento vivem isso?","3"],["Frequência","Volta quantas vezes por mês?","2"],["Alinhamento","Resolver move o outcome do topo?","3"],["Capacidade","Temos como atacar nos próximos meses?","1"]]',
                },
                {
                    type: "table",
                    value: '[["Ramo comparado","Dor (peso 3)","Alcance (peso 3)","Total"],["Não confio no número","5 (15)","4 (12)","27"],["A entrega me pega de surpresa","4 (12)","3 (9)","21"],["Comprei e esqueci que existe","2 (6)","5 (15)","21"]]',
                },
                {
                    type: "quote",
                    value: "Escolher ramo é escolher o que não fazer. Se a decisão não dói um pouco, você não escolheu nada.",
                },
                {
                    type: "text",
                    value: "## A decisão precisa ficar escrita\n\nNa tabela acima, o ramo da confiança no dado ganha com folga. O empate entre os outros dois é o momento interessante: a entrega surpresa dói mais, o esquecimento pega mais gente, e o critério de desempate é o alinhamento com o outcome. Se o outcome fala de segunda compra em 30 dias, o ramo do esquecimento encosta mais perto dele. Nota não decide sozinha; ela organiza a conversa e mostra onde as pessoas discordam.\n\nFeita a escolha, registre. Três linhas bastam: qual ramo escolhemos, por que ele, o que ficou de fora e por quê. Guarde junto da árvore, com data. Em seis semanas alguém vai perguntar 'por que a gente não fez aquele outro?', e a diferença entre uma resposta de dez segundos e uma rediscussão de uma hora é exatamente esse registro existir.\n\nFique atento ao antipadrão. Quando a escolha vem do cliente que gritou mais alto ou do executivo que mandou, o pedido não deixa de ser evidência: ele entra na conta como mais um sinal, pesado pelos mesmos critérios que os outros. O que não pode é o volume da voz substituir a comparação inteira.",
                },
            ],
            questions: [
                {
                    statement: "A comparação entre oportunidades acontece entre o quê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entre ramos irmãos, no mesmo nível da árvore",
                            isCorrect: true,
                        },
                        {
                            text: "Entre todas as oportunidades da árvore de uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "Entre as soluções que a engenharia já estimou",
                            isCorrect: false,
                        },
                        {
                            text: "Entre os pedidos abertos pelos clientes maiores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o critério de alcance mede na comparação de ramos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quantas pessoas do segmento vivem aquela dor",
                            isCorrect: true,
                        },
                        {
                            text: "Quão grave é a dor quando ela acontece na prática",
                            isCorrect: false,
                        },
                        {
                            text: "Quantas vezes por mês a dor volta a aparecer",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto o time consegue construir no trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um ramo tem dor grave e alcance alto, mas resolvê-lo não move o outcome do topo. O que fazer com ele?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Deixar de fora: ele pertence a outra árvore",
                            isCorrect: true,
                        },
                        {
                            text: "Priorizar mesmo assim, porque a dor é grave",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o outcome do topo para acomodar o ramo",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir o trimestre entre ele e o ramo escolhido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O maior cliente ligou pro CEO pedindo que um ramo específico fosse atacado. Como o time trata esse pedido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como mais uma evidência, pesada pelos critérios",
                            isCorrect: true,
                        },
                        {
                            text: "Como decisão tomada, já que veio da alta liderança",
                            isCorrect: false,
                        },
                        {
                            text: "Como ruído, ignorando o pedido do cliente grande",
                            isCorrect: false,
                        },
                        {
                            text: "Como troca imediata do outcome daquele trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Seis semanas depois, alguém pergunta por que o outro ramo ficou de fora. O que evita a rediscussão inteira?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O registro do que ficou de fora e por que ficou",
                            isCorrect: true,
                        },
                        {
                            text: "Refazer a comparação com os dados mais recentes",
                            isCorrect: false,
                        },
                        {
                            text: "Reabrir a decisão em reunião com o time completo",
                            isCorrect: false,
                        },
                        {
                            text: "Delegar a resposta ao executivo que patrocinou",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Da oportunidade às soluções",
            blocks: [
                {
                    type: "text",
                    value: "# A primeira ideia é a óbvia\n\nRamo escolhido, alguém fala 'então é um painel semanal' e a sala inteira concorda em quatro segundos. Parece eficiência. É o jeito mais barato de perder um trimestre: a primeira ideia é quase sempre a mais óbvia, aquela que já estava rondando a cabeça de todo mundo, e casar com ela dispensa justamente a comparação que faria você descobrir algo melhor.\n\nO antídoto é volume antes de filtro. Pro ramo escolhido, gere de 10 a 15 ideias. Comece SOZINHOS, em silêncio, cada pessoa escrevendo a sua lista: se a sessão começa aberta, todo mundo ancora na primeira ideia dita em voz alta, normalmente pela pessoa com mais tempo de casa. Só depois leia tudo junto, uma ideia por vez, sem debater ainda.\n\nInclua cotas que forçam o time a sair do óbvio: duas ideias sem nenhuma tecnologia (uma ligação, um mutirão manual, um combinado com o time de operações) e duas ideias absurdas de propósito. As absurdas raramente viram produto, mas quase sempre revelam a suposição escondida no meio das ideias sérias, e é isso que você quer enxergar agora, não daqui a três meses.",
                },
                {
                    type: "code",
                    value: "SESSÃO DE IDEAÇÃO DO RAMO 'NÃO CONFIO NO NÚMERO' (60 MIN)\n\n00:00 Reler a oportunidade e dois trechos de entrevista\n00:10 Sozinhos, em silêncio: 10 ideias cada, sem filtro\n00:25 Rodada de leitura, uma ideia por vez, sem debate\n00:40 Conferir as cotas obrigatórias:\n        duas ideias sem nenhuma tecnologia\n        duas ideias absurdas de propósito\n        duas ideias que outra empresa faria melhor\n00:50 Agrupar as parecidas e ficar com 3 concorrentes",
                },
                {
                    type: "table",
                    value: '[["Candidata","Move o outcome?","Esforço","Suposição mais frágil"],["Painel de fechamento","Alto","Médio","A pessoa abre o painel na sexta"],["Alerta de divergência","Médio","Baixo","Sabemos detectar a divergência"],["Fechamento assistido por gente","Alto","Alto","A operação aguenta o volume"]]',
                },
                {
                    type: "quote",
                    value: "Uma solução sozinha na mesa não é escolha, é profecia: o time vai encontrar razões pra ela dar certo.",
                },
                {
                    type: "text",
                    value: "## Três concorrentes, não uma favorita\n\nDepois do volume vem o corte. Filtre até TRÊS soluções que atacam a MESMA oportunidade por caminhos diferentes, porque só assim existe comparação de verdade. Uma solução sozinha vira profecia autorrealizável: o time investiga com carinho, encontra motivos pra ela dar certo e chama isso de validação. Dez soluções também não funcionam, por um motivo bem prosaico: investigar direito custa tempo, e você não tem tempo pra dez.\n\nCompare as três por três lentes. Potencial de mover o outcome: se der certo, o comportamento lá no topo muda quanto? Esforço percebido: uma ordem de grandeza combinada com a engenharia, sem estimativa de precisão falsa. E dependência de suposição frágil: o quanto cada caminho se apoia em algo que a gente acredita, mas nunca viu acontecer.\n\nA terceira lente costuma mudar a ordem. A solução mais empolgante às vezes é a que se apoia no maior número de 'se as pessoas fizerem X'. Repare que nenhuma das três está aprovada por ter passado nessa comparação. Cada uma carrega suposições que ainda precisam ser listadas, priorizadas e testadas, e é isso que separa uma aposta consciente de um palpite bem apresentado.",
                },
            ],
            questions: [
                {
                    statement: "Quantas ideias vale gerar pro ramo escolhido antes de filtrar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "De 10 a 15, antes de qualquer filtro do grupo",
                            isCorrect: true,
                        },
                        {
                            text: "Uma só, a que o time já sabe que vai funcionar",
                            isCorrect: false,
                        },
                        {
                            text: "Três, uma para cada pessoa do trio de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Cinquenta, para garantir cobertura do problema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que cada pessoa gera ideias sozinha antes da rodada em grupo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para o grupo não ancorar na voz mais alta da sala",
                            isCorrect: true,
                        },
                        {
                            text: "Para reduzir o tempo total gasto na sessão de ideação",
                            isCorrect: false,
                        },
                        {
                            text: "Para evitar que o design domine o resultado da sessão",
                            isCorrect: false,
                        },
                        {
                            text: "Para dispensar a presença da engenharia naquela sala",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que levar três soluções concorrentes em vez de investigar só a favorita do time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com uma só, o time só busca razões pra ela dar certo",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o processo exige três itens por oportunidade",
                            isCorrect: false,
                        },
                        {
                            text: "Porque três soluções cabem no mesmo trimestre de trabalho",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cada pessoa do trio defende a solução que criou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que as três soluções finalistas precisam ter em comum?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Atacam a mesma oportunidade por caminhos diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "Têm o mesmo esforço já estimado pela engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Vieram todas da mesma entrevista com o usuário final",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrem um ramo diferente cada uma dentro da árvore",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A solução com maior potencial de mover o outcome é também a que mais depende de suposição frágil. O que isso indica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Que a suposição precisa de teste antes de construir",
                            isCorrect: true,
                        },
                        {
                            text: "Que a solução deve sair da comparação com as outras",
                            isCorrect: false,
                        },
                        {
                            text: "Que o esforço estimado precisa ser refeito pela engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Que o ramo escolhido estava errado desde o começo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Priorizar o que investigar",
    aulas: [
        {
            titulo: "Suposições por trás da solução",
            blocks: [
                {
                    type: "text",
                    value: "# Toda solução é uma pilha de apostas\n\nO trio de produto de uma clínica decide construir um app pro paciente remarcar consulta sozinho. Parece óbvio, todo mundo concorda, entra no roadmap. Embaixo dessa decisão tem uma pilha de apostas que ninguém escreveu: que o paciente prefere o app a ligar pra recepção, que ele acha o botão sem ajuda, que a agenda do sistema legado devolve horário em tempo real, e que a clínica aceita perder a ligação em que a recepcionista costuma oferecer exame particular.\n\nSe qualquer uma dessas apostas for falsa, o app entra no ar e não acontece nada. SUPOSIÇÃO é isso: aquilo que precisa ser verdade pra solução funcionar. Enquanto ela mora na cabeça de todo mundo e no papel de ninguém, não dá pra testar nem pra discutir.\n\nO trabalho desta aula é curto e desconfortável: pegar cada solução que você quer construir e listar, sem piedade, tudo que precisa ser verdade. Os quatro riscos de Marty Cagan voltam aqui como as quatro famílias de suposição: valor (ou desejabilidade), usabilidade, viabilidade técnica e viabilidade de negócio. Toda frase que você escrever cai em uma delas.\n\nE preste atenção nas famílias vazias. Quando a lista não tem nenhuma suposição de negócio, quase nunca é porque não existe risco ali: é porque ninguém no trio olhou pra esse lado.",
                },
                {
                    type: "table",
                    value: '[["Família","Pergunta guia","Quem costuma puxar"],["Valor (desejabilidade)","Querem e trocam o jeito atual por isso?","PM"],["Usabilidade","Conseguem usar sozinhos, sem ajuda?","Design"],["Viabilidade técnica","Dá pra construir no prazo e escala?","Engenharia"],["Viabilidade de negócio","Cabe em custo, jurídico, suporte e marca?","PM com o negócio"],["Todas juntas","O que precisa ser verdade pra dar certo?","O trio na mesma sala"]]',
                },
                {
                    type: "quote",
                    value: "Solução aprovada em reunião é palpite de gravata. Escreva as apostas embaixo dela e o palpite volta a ter o tamanho real.",
                },
                {
                    type: "text",
                    value: "## Escreva como frase testável, não como pergunta\n\nExiste um jeito errado de listar suposição, e ele é o mais comum: escrever pergunta vaga. 'Será que o gestor usa no celular?' não dá pra testar, porque não diz quem, com que frequência e o que contaria como sim. Escreva sempre no presente, afirmando, com sujeito e número: 'o gestor de escala confere a escala pelo celular pelo menos duas vezes por semana'. Agora dá pra sair da sala e verificar.\n\nTrês coisas mudam quando a frase fica assim. Primeiro, o time descobre que discordava sem saber: uma pessoa achava uma vez por mês, outra achava todo dia. Segundo, fica óbvio se já existe evidência guardada em algum lugar, tipo o log de acesso mobile do último trimestre. Terceiro, o teste se desenha quase sozinho, porque a frase já diz o que precisa ser observado.\n\nUm atalho pra revisar a sua lista: se a suposição não pode ser falsa, ela não é suposição, é enfeite. 'As pessoas gostam de praticidade' é verdade em qualquer universo e não ajuda ninguém a decidir nada. Já 'o paciente troca o WhatsApp da recepção pelo app pra remarcar' pode ser falsa amanhã de manhã, e é exatamente por isso que vale escrever.",
                },
                {
                    type: "text",
                    value: "## O pré-mortem, ou imagine que já deu errado\n\nQuando o time trava e não consegue listar suposição, o pré-mortem destrava em quinze minutos. A regra do jogo: finja que já é daqui a seis meses, a solução foi lançada e fracassou feio, a ponto de virar assunto na reunião de diretoria. Cada pessoa escreve sozinha, em silêncio, os motivos do fracasso. Depois vocês leem em voz alta e agrupam.\n\nO efeito é psicológico e funciona: falar de um fracasso já consumado é socialmente mais fácil do que duvidar do plano de alguém na frente do time. Sai coisa que ninguém falaria numa reunião normal, tipo 'o jurídico barrou o envio de laudo por push' ou 'a base de telefones estava desatualizada'.\n\nCada motivo que aparece vira uma suposição escrita ao contrário. 'Ninguém achou o botão' vira 'o paciente encontra a opção de remarcar em menos de trinta segundos'. 'A integração não segurou' vira 'a agenda do legado responde em menos de dois segundos no horário de pico'.\n\nFaça isso com o trio inteiro na sala. O PM enxerga primeiro o risco de valor e de negócio, o design enxerga usabilidade, a engenharia enxerga o que vai quebrar. Sozinho, você lista muito bem os riscos que já conhecia.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma suposição por trás de uma solução?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Algo que precisa ser verdade pra solução funcionar",
                            isCorrect: true,
                        },
                        {
                            text: "Uma tarefa técnica já estimada pelo time de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Um requisito formal aprovado pelo cliente no contrato",
                            isCorrect: false,
                        },
                        {
                            text: "Uma métrica de acompanhamento definida no painel do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as quatro famílias de suposição de uma solução?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Desejabilidade, usabilidade, viabilidade e negócio",
                            isCorrect: true,
                        },
                        {
                            text: "Escopo, prazo, orçamento e qualidade da entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Backlog, sprint, review e retrospectiva do time ágil",
                            isCorrect: false,
                        },
                        {
                            text: "Custo, receita, margem e participação de mercado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time escreveu 'será que o gestor usa no celular?' na lista de suposições. Qual é o problema dessa frase?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É pergunta vaga: não diz quem, quando nem quanto",
                            isCorrect: true,
                        },
                        {
                            text: "O celular não é plataforma válida pra pesquisa séria",
                            isCorrect: false,
                        },
                        {
                            text: "Falta o nome do responsável técnico pela apuração",
                            isCorrect: false,
                        },
                        {
                            text: "Suposição de usabilidade não pode citar um aparelho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No pré-mortem, o que o time faz com cada motivo de fracasso que aparece na lista?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Transforma em suposição escrita como frase testável",
                            isCorrect: true,
                        },
                        {
                            text: "Registra como risco aceito e segue com o plano atual",
                            isCorrect: false,
                        },
                        {
                            text: "Descarta os motivos que soarem pessimistas demais",
                            isCorrect: false,
                        },
                        {
                            text: "Converte em tarefa técnica no backlog da próxima sprint",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na lista de suposições do app da clínica, a família de viabilidade de negócio ficou vazia. Qual é a leitura mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ninguém no trio olhou pra esse lado, e o risco segue lá",
                            isCorrect: true,
                        },
                        {
                            text: "A solução de fato não tem custo, jurídico nem suporte",
                            isCorrect: false,
                        },
                        {
                            text: "O risco de negócio só aparece depois do lançamento real",
                            isCorrect: false,
                        },
                        {
                            text: "A família de negócio pertence apenas ao time comercial",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O mapa de suposições",
            blocks: [
                {
                    type: "text",
                    value: "# Nem toda suposição merece o seu tempo\n\nO trio saiu do pré-mortem com trinta e duas suposições no quadro. Testar todas levaria um semestre, e ninguém tem um semestre. A pergunta agora não é 'o que dá pra testar?', é 'o que precisa ser testado antes de a gente construir qualquer coisa?'.\n\nO MAPA DE SUPOSIÇÕES resolve isso com dois eixos. O primeiro é IMPORTÂNCIA: se essa frase for falsa, a solução morre ou só fica pior? O segundo é EVIDÊNCIA: o quanto a gente já sabe, de verdade, que ela é verdadeira? E aqui vale a escada da evidência que você viu antes, porque opinião de time não conta como evidência forte, por mais sênior que a pessoa seja.\n\nCruzando os dois eixos aparecem quatro quadrantes, e um deles é o que interessa. Muita importância e pouca evidência é o quadrante que mata projeto: são as frases que sustentam a solução inteira e das quais ninguém tem prova nenhuma. É ali que você testa, agora, antes de escrever a primeira linha de código.\n\nOs outros três quadrantes existem pra você parar de gastar energia com eles. Importante e com evidência: documente onde está a prova e siga. Pouco importante: siga sem testar.",
                },
                {
                    type: "table",
                    value: '[["Quadrante","Importância e evidência","Ação"],["Mata projeto","Muita importância, pouca evidência","Teste agora, antes de construir"],["Base sólida","Muita importância, muita evidência","Documente a prova e siga"],["Ruído","Pouca importância, pouca evidência","Não gaste tempo com isso"],["Irrelevante","Pouca importância, muita evidência","Só registre e esqueça"]]',
                },
                {
                    type: "quote",
                    value: "O time testa o que é fácil de testar e depois se surpreende com o que era perigoso. Comece pelo perigoso.",
                },
                {
                    type: "code",
                    value: "MAPA DE SUPOSIÇÕES\nSolução: app pro paciente remarcar consulta sozinho\nCiclo 12, semana 1\n\nS1 O paciente prefere remarcar no app a ligar pra recepção\n   importância: alta\n   evidência: baixa (só opinião do time comercial)\n   quadrante: mata projeto, testar agora\n\nS2 A agenda do legado responde em menos de 2 segundos no pico\n   importância: alta\n   evidência: baixa (ninguém mediu no horário de pico)\n   quadrante: mata projeto, testar agora\n\nS3 A clínica aceita perder a ligação de venda de exame\n   importância: alta\n   evidência: média (diretoria disse que aceita, sem número)\n   quadrante: mata projeto, confirmar com dado\n\nS4 O paciente acha a opção de remarcar em até 30 segundos\n   importância: média\n   evidência: baixa (fluxo ainda está no papel)\n   quadrante: testar, mas depois de S1\n\nS5 O paciente já tem o app instalado no dia da remarcação\n   importância: alta\n   evidência: alta (78% dos ativos abriram no último mês)\n   quadrante: base sólida, documentar e seguir\n\nS6 O paciente prefere tema escuro na tela de agenda\n   importância: baixa\n   evidência: baixa\n   quadrante: ruído, não gastar tempo\n\nPRIMEIRO A TESTAR: S1 e S2",
                },
                {
                    type: "text",
                    value: "## Como posicionar sem discussão eterna\n\nO erro mais comum não é montar o mapa errado, é montar o mapa certo e testar a coisa errada. O time olha o quadrante perigoso, vê que testar aquilo dá trabalho, e escolhe a suposição fácil de verificar. Sai da semana com um gráfico bonito sobre algo que não decidia nada, enquanto a frase que sustentava tudo continua sem prova.\n\nPra posicionar sem gastar duas horas de debate, use a regra do silêncio primeiro. Cada pessoa do trio posiciona todas as suposições sozinha, sem ver a das outras. Depois vocês comparam e só discutem onde houve divergência.\n\nA divergência é o presente escondido do exercício. Quando o PM coloca uma frase como 'muita evidência' e a engenharia coloca a mesma frase como 'nenhuma evidência', a conclusão quase nunca é que alguém está errado: é que ninguém tem evidência de verdade, e o que existe é confiança de pessoas diferentes em fontes diferentes. Frase divergente vai direto pro quadrante perigoso.\n\nUm cuidado final com o eixo da evidência. Evidência é o que você consegue mostrar: um número, uma gravação, um log, uma transação. Se a resposta pra 'como sabemos disso?' for 'a gente sempre soube', a evidência é baixa.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os dois eixos do mapa de suposições?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Importância da suposição e evidência que já existe",
                            isCorrect: true,
                        },
                        {
                            text: "Esforço de implementação e valor entregue ao cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Urgência do pedido e senioridade de quem solicitou",
                            isCorrect: false,
                        },
                        {
                            text: "Custo do teste e tamanho da amostra que será usada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que fazer com uma suposição de muita importância e pouca evidência?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Testar agora, antes de o time construir a solução",
                            isCorrect: true,
                        },
                        {
                            text: "Registrar no backlog e revisar no próximo trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar, porque sem evidência não dá pra decidir nada",
                            isCorrect: false,
                        },
                        {
                            text: "Construir uma versão simples e medir só no lançamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time saiu da semana com um gráfico sobre a suposição mais simples de verificar. Qual é o risco disso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sobrar de pé justamente o que pode matar o projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Gastar dinheiro demais com ferramenta de pesquisa cara",
                            isCorrect: false,
                        },
                        {
                            text: "Perder o prazo de entrega combinado com a diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Descobrir cedo demais problemas que não eram urgentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ao posicionar em silêncio, o PM põe uma frase em 'muita evidência' e a engenharia põe a mesma em 'nenhuma'. O que isso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que ninguém tem evidência de verdade sobre ela",
                            isCorrect: true,
                        },
                        {
                            text: "Que uma das duas pessoas entendeu a solução errada",
                            isCorrect: false,
                        },
                        {
                            text: "Que a suposição deveria ser dividida em duas menores",
                            isCorrect: false,
                        },
                        {
                            text: "Que o mapa não funciona em time com opinião forte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma suposição técnica caiu no quadrante perigoso, mas a engenharia jura que dá pra fazer. Como tratar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Jurar não é evidência: rode um spike curto pra medir",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar a palavra do time técnico e ir pra construção",
                            isCorrect: false,
                        },
                        {
                            text: "Mover a suposição pro quadrante de muita evidência",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar a decisão até o começo do trimestre que vem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Desenhar o teste da suposição",
            blocks: [
                {
                    type: "text",
                    value: "# O menor teste que gera evidência confiável\n\nVocê tem uma suposição perigosa na mão e o time já começou a desenhar tela. Segura. A pergunta que abre um teste não é 'como a gente constrói isso?', é: qual é a MENOR coisa que gera evidência confiável sobre esta suposição?\n\nMenor não quer dizer malfeito. É o teste que responde àquela frase específica e nada mais. Se a suposição é 'a loja paga pra antecipar o recebível em 24 horas', você não precisa do motor de antecipação: precisa saber se o lojista clica, preenche e pede pra ser avisado. Se a suposição é 'a API do legado responde em dois segundos no pico', você não precisa de tela nenhuma: precisa de dois dias de spike e um gráfico.\n\nA anatomia é sempre a mesma: a suposição escrita como frase testável, o método, o critério de sucesso combinado ANTES, o tamanho da amostra e o prazo. Cinco campos, cabe num post-it.\n\nO campo que quase todo time pula é o critério. 'Vamos ver o que acontece' não é critério. 'Pelo menos 8 de 20 visitantes clicam e deixam email' é. E a diferença não é burocracia: sem número combinado antes, qualquer resultado vira 'achamos promissor', porque o time já investiu na ideia e vai defender ela com o que aparecer.",
                },
                {
                    type: "quote",
                    value: "Critério combinado antes é teste. Critério inventado depois é justificativa com cara de dado.",
                },
                {
                    type: "table",
                    value: '[["Suposição","Método barato","Critério de sucesso"],["Gestor confere escala no celular","Olhar o log de acesso mobile","Mais de 40% dos acessos no celular"],["Loja paga por antecipação","Landing com botão de contratar","8 de 20 visitas deixam email"],["Legado devolve agenda a tempo","Spike de 2 dias na API","Resposta abaixo de 2s no pico"],["Fluxo novo se entende sozinho","5 testes de usabilidade","4 de 5 concluem sem ajuda"],["Margem aguenta o frete grátis","Planilha com 3 cenários","Margem acima de 12% no pior caso"]]',
                },
                {
                    type: "text",
                    value: "## Método barato por família de risco\n\nCada família de suposição tem métodos que custam pouco e já entregam sinal. Valor: conversa com quem tem a dor, teste de demanda com página e captura de email, oferta de pré-venda. Usabilidade: protótipo clicável com cinco pessoas, ou até papel na mesa. Viabilidade técnica: spike de dois dias, medição no ambiente que já existe, conversa com quem mantém o sistema legado. Viabilidade de negócio: planilha de margem com três cenários, uma consulta ao jurídico, uma pergunta ao suporte sobre quantos chamados aquilo geraria por mês.\n\nRepare que quase nenhum desses métodos envolve construir a feature. Isso é de propósito. O antipadrão mais caro do discovery é o 'vamos construir só pra testar': o time entrega uma versão inteira, gasta seis semanas e no fim descobre que a suposição de valor era falsa. Aí ninguém tem coragem de matar, porque já tem código no ar e gente que defendeu aquilo em reunião de diretoria.\n\nUm teste de uma tarde vale mais do que um estudo de um mês quando a suposição ainda é grosseira. Precisão vem depois. Primeiro você quer saber se está no bairro certo; medir o terreno com trena antes disso é desperdício elegante.",
                },
                {
                    type: "text",
                    value: "## Amostra e prazo cabem na semana\n\nDuas perguntas travam mais time do que deveriam: quantas pessoas e até quando. Pra teste qualitativo, cinco a oito pessoas do perfil certo já mostram o padrão que interessa; se as cinco primeiras conversas apontam pro mesmo lugar, a sexta raramente vira o jogo. Pra teste de demanda, o que importa é ter tráfego suficiente pra o número significar alguma coisa: 20 visitantes não decidem nada, 300 já dizem algo.\n\nO prazo entra como restrição de projeto, não como estimativa. Em vez de perguntar quanto tempo o teste vai levar, combine que ele termina na sexta e desenhe o teste que cabe aí. Isso força o corte certo: some a tela extra, some a pergunta que ninguém ia usar, sobra o que responde à suposição.\n\nE escreva o critério com o número na frente do time, no mesmo dia em que desenha o teste. Se ninguém consegue combinar um número, isso já é informação: significa que a suposição ainda está vaga demais, e o problema não é o teste, é a frase. Volte pra frase testável antes de gastar a semana.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o critério de sucesso precisa ser definido antes de rodar o teste?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem número combinado antes, todo resultado vira bom",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o critério é exigido pelo processo de auditoria",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a amostra só pode ser calculada com o critério",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time precisa reportar o número pra diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são os cinco campos de um teste de suposição bem desenhado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Suposição, método, critério, amostra e prazo",
                            isCorrect: true,
                        },
                        {
                            text: "Escopo, cronograma, orçamento, risco e entregável",
                            isCorrect: false,
                        },
                        {
                            text: "Persona, jornada, wireframe, protótipo e handoff",
                            isCorrect: false,
                        },
                        {
                            text: "Objetivo, resultado-chave, iniciativa e indicador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A suposição é 'a API do legado responde em menos de dois segundos no pico'. Qual é o teste mais barato pra ela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um spike de dois dias medindo a resposta no pico",
                            isCorrect: true,
                        },
                        {
                            text: "Construir a tela de agenda e observar a reclamação",
                            isCorrect: false,
                        },
                        {
                            text: "Entrevistar oito pacientes sobre lentidão percebida",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao fornecedor um relatório de latência média",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time propõe construir a feature inteira 'só pra testar' a suposição de valor. Por que isso é antipadrão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Custa semanas e ninguém tem coragem de matar depois",
                            isCorrect: true,
                        },
                        {
                            text: "Porque testar direto em produção é proibido pela LGPD",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a feature completa não gera nenhum dado de uso",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time perde a chance de estimar o esforço real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você tem duas semanas e a suposição de valor ainda está grosseira. Qual é o melhor caminho?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um teste de uma tarde agora, precisão só depois",
                            isCorrect: true,
                        },
                        {
                            text: "Um estudo de mercado de um mês com amostra ampla",
                            isCorrect: false,
                        },
                        {
                            text: "Um protótipo de alta fidelidade com dez usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Um painel de dados com seis meses de histórico",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Sequência de testes",
            blocks: [
                {
                    type: "text",
                    value: "# Matar a ideia barato é o objetivo\n\nDuas ordens possíveis pro mesmo conjunto de testes. Na primeira, o time começa pelo protótipo clicável, porque o design estava com tempo livre; três semanas depois, na conversa com usuário, descobre que ninguém trocaria a planilha atual por aquilo. Na segunda, o time começa pela conversa; na quarta-feira da primeira semana já sabe que a solução não se sustenta e volta pra árvore de oportunidades.\n\nMesmo trabalho, custo completamente diferente. A ordem dos testes é decisão de produto, não detalhe de agenda.\n\nA regra é direta: teste primeiro a suposição mais IMPORTANTE e com MENOS evidência, aquela do quadrante que mata projeto. Dentro dela, escolha o método mais barato que ainda dê sinal confiável. Se dois métodos respondem à mesma pergunta e um custa dois dias enquanto o outro custa três semanas, comece pelos dois dias e só escale se o resultado ficar ambíguo.\n\nIsso muda o que você comemora. Um teste que derruba a solução na semana 1 não é fracasso do time: é o trimestre que você não gastou construindo a coisa errada. Time maduro anota o dinheiro salvo e segue; time inseguro tenta salvar a ideia mexendo no critério depois de ver o resultado.",
                },
                {
                    type: "table",
                    value: '[["Ordem","Teste","Custo","O que decide"],["1","Conversa com 8 gestores","1 semana","Se a dor existe e vale trocar"],["2","Spike na API do legado","2 dias","Se dá pra construir agora"],["3","Página de demanda com email","3 dias","Se alguém age, não só elogia"],["4","Protótipo com 5 pessoas","1 semana","Se o fluxo se entende sozinho"]]',
                },
                {
                    type: "quote",
                    value: "Quando o primeiro teste derruba a solução, você não perdeu a ideia: economizou o trimestre que ia gastar nela.",
                },
                {
                    type: "text",
                    value: "## Valor antes de usabilidade, técnica quando é binária\n\nExiste uma ordem padrão que resolve a maioria dos casos. Valor vem antes de usabilidade porque polir o fluxo de uma coisa que ninguém quer é caprichar no desperdício. Usabilidade perfeita não salva solução sem demanda; demanda forte sobrevive até a um fluxo meia-boca por um tempo.\n\nA exceção mora na viabilidade técnica. Quando ela é BINÁRIA e cara, entra cedo, às vezes antes de tudo. Se a solução depende de um dado que a empresa não coleta, de uma integração com um sistema que o fornecedor não abre, ou de uma latência que a infra atual não entrega, descubra isso na semana 1. Não faz sentido validar valor por um mês pra depois ouvir da engenharia que não existe caminho.\n\nViabilidade de negócio segue a mesma lógica: se o jurídico pode barrar de vez, pergunte antes, não depois. Um email de vinte linhas pro jurídico é mais barato que qualquer protótipo.\n\nA ordem padrão, então, é valor, técnica quando binária, usabilidade e negócio correndo em paralelo. Mas o mapa de suposições manda mais que a ordem padrão: se a frase mais perigosa é de usabilidade, comece por ela.",
                },
                {
                    type: "text",
                    value: "## Um por vez, em paralelo, e o ciclo semanal\n\nNem todo teste precisa esperar o anterior. A pergunta é simples: o resultado deste teste muda o desenho do próximo? Se muda, rode um por vez. Se não muda, rode em paralelo e ganhe uma semana. O spike na API do legado e as conversas com gestores são independentes: podem correr juntos, um com a engenharia, outro com o PM.\n\nJá o protótipo clicável depende do que sair das conversas, porque um fluxo desenhado antes de entender a rotina do gestor testa a tela errada. Esse espera.\n\nTeresa Torres chama de CONTINUOUS DISCOVERY o hábito de rodar pequenas rodadas toda semana em vez de uma bateria gigante antes do lançamento. A diferença prática é o tamanho do lote: três conversas por semana, todas as semanas, ensinam mais que trinta conversas em março e nenhuma até dezembro. E cabe na agenda de gente que também precisa entregar.\n\nUma última regra que economiza sofrimento: pare cedo. Se o primeiro teste derrubou a suposição que sustentava tudo, não rode os outros três só porque já estavam na planilha. O plano de testes serve pra decidir, não pra ser cumprido.",
                },
            ],
            questions: [
                {
                    statement: "Qual suposição deve ser testada primeiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A mais importante e com menos evidência hoje",
                            isCorrect: true,
                        },
                        {
                            text: "A mais simples de verificar com o time atual",
                            isCorrect: false,
                        },
                        {
                            text: "A que o patrocinador do projeto achar urgente",
                            isCorrect: false,
                        },
                        {
                            text: "A que a engenharia já tiver começado a fazer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que valor costuma ser testado antes de usabilidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Fluxo perfeito não salva algo que ninguém quer",
                            isCorrect: true,
                        },
                        {
                            text: "Porque design entra sempre depois do PM no processo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque teste de usabilidade custa mais que entrevista",
                            isCorrect: false,
                        },
                        {
                            text: "Porque valor é medido por dado e usabilidade não é",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em que situação a viabilidade técnica deve ser testada logo na primeira semana?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando é binária e cara, tipo um dado que não existe",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a engenharia estiver com agenda livre na sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o protótipo clicável já tiver sido validado",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o custo de infraestrutura passar do orçamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você tem um spike técnico e uma rodada de conversas, e o resultado de um não muda o desenho do outro. Como rodar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Em paralelo, já que um não muda o desenho do outro",
                            isCorrect: true,
                        },
                        {
                            text: "Em sequência, começando sempre pelo spike técnico",
                            isCorrect: false,
                        },
                        {
                            text: "Em sequência, porque teste em paralelo confunde dado",
                            isCorrect: false,
                        },
                        {
                            text: "Só o spike, porque conversa não gera evidência real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O primeiro teste derrubou a suposição que sustentava a solução, e ainda restam três testes na planilha. O que fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Parar ali e voltar pra árvore de oportunidades",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar os três, já que estavam planejados e pagos",
                            isCorrect: false,
                        },
                        {
                            text: "Refazer o teste com critério menos exigente agora",
                            isCorrect: false,
                        },
                        {
                            text: "Seguir pro protótipo pra confirmar a usabilidade",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Registro de aprendizado",
            blocks: [
                {
                    type: "text",
                    value: "# A memória do time contra a ideia zumbi\n\nNovembro. Alguém da diretoria sugere, com muito entusiasmo, um programa de cashback pro app. O PM sente um déjà-vu, procura em três ferramentas e não acha nada. O time testa de novo, gasta três semanas e chega ao mesmo resultado ruim de maio, quando outra squad já tinha testado exatamente aquilo. Isso é a IDEIA ZUMBI: volta de seis em seis meses, com o mesmo entusiasmo e a mesma falta de evidência, porque ninguém escreveu o que aprendeu.\n\nO registro de aprendizado é o remédio, e ele é bem mais simples do que parece. Pra cada suposição testada, uma entrada com seis campos: a suposição escrita como frase testável, o teste que foi feito, a data, o resultado observado em número cru, a interpretação e a DECISÃO tomada.\n\nO campo que quase todo mundo esquece é o último. Registro sem decisão vira arquivo de curiosidades: dá pra ler, não dá pra usar. Com a decisão escrita, a entrada responde à pergunta que alguém vai fazer daqui a oito meses, que quase nunca é 'o que vocês descobriram?', e sim 'por que vocês não fizeram?'.",
                },
                {
                    type: "code",
                    value: "REGISTRO DE APRENDIZADO\nCiclo 12, semana 3\n\nSuposição\n   O paciente prefere remarcar no app a ligar pra recepção\n\nTeste\n   Página com botão 'remarcar pelo app' e captura de email\n   Amostra: 312 visitas vindas do SMS de confirmação\n   Data: 12 a 19 de maio\n\nCritério combinado antes\n   Pelo menos 30 emails, ou seja, 10% das visitas\n\nResultado observado\n   17 emails em 312 visitas (5,4%)\n   9 dos 17 escreveram 'só se for pelo WhatsApp'\n\nInterpretação\n   Interesse existe, mas abaixo do que paga um app inteiro\n   O canal parece importar mais do que a funcionalidade\n\nDecisão\n   Ajustar: testar remarcação por link no WhatsApp antes\n   Suposição do app fica congelada, não descartada\n\nResponsável e revisão\n   PM da squad de agendamento, revisar em 30 dias",
                },
                {
                    type: "table",
                    value: '[["Campo","O que entra","Erro comum"],["Suposição","A frase testável, no presente","Escrever pergunta vaga"],["Teste e data","Método, amostra e quando rodou","Registrar só o mês"],["Resultado","O número cru observado","Já escrever a conclusão"],["Interpretação","O que o número sugere","Misturar com o número cru"],["Decisão","Seguir, ajustar ou matar","Deixar o campo em branco"]]',
                },
                {
                    type: "quote",
                    value: "Time sem registro repete a mesma ideia a cada seis meses, com o mesmo entusiasmo e a mesma falta de evidência.",
                },
                {
                    type: "text",
                    value: "## Onde mora, quem lê e quando encolher\n\nO registro mora junto do artefato de discovery, no mesmo lugar da árvore de oportunidades, e precisa ser buscável por palavra. Uma página por ciclo, com as entradas daquele ciclo, resolve bem. Se está num documento que só o PM abre, ele já morreu; se está espalhado em três ferramentas, também.\n\nTem um uso que ninguém antecipa: o registro expõe o viés do próprio time. Leia as últimas doze entradas e conte quantas vezes a decisão foi 'seguir' mesmo com evidência fraca. Se for quase sempre, o time não está testando, está coletando justificativa pra fazer o que já queria fazer. Esse número é desconfortável e é a coisa mais útil que o registro produz.\n\nO risco do outro lado é virar burocracia. Formulário de quinze campos, template com cabeçalho corporativo, ninguém lê e todo mundo preenche por obrigação. A regra é honesta: se ninguém consulta, encolha o formato até caber em cinco linhas.\n\nNo fundo, discovery não é uma fase que termina nem um ritual de calendário. É o hábito de escrever o que você supôs, o que testou e o que decidiu por causa disso, uma rodada de cada vez.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual campo do registro de aprendizado quase todo time esquece de preencher?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A decisão tomada: seguir, ajustar ou matar",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de participantes convidados para a sessão",
                            isCorrect: false,
                        },
                        {
                            text: "O nome da ferramenta usada durante todo o teste",
                            isCorrect: false,
                        },
                        {
                            text: "O custo em reais de cada rodada de pesquisa feita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é a ideia zumbi?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ideia que volta sempre, sem evidência nova nenhuma",
                            isCorrect: true,
                        },
                        {
                            text: "Feature lançada que ninguém do time quer mais manter",
                            isCorrect: false,
                        },
                        {
                            text: "Suposição escrita que nunca chegou a ser testada",
                            isCorrect: false,
                        },
                        {
                            text: "Solução copiada de concorrente sem adaptar nada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Nas últimas doze entradas do registro, a decisão foi 'seguir' mesmo com evidência fraca. O que isso mostra?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que o time coleta justificativa em vez de testar",
                            isCorrect: true,
                        },
                        {
                            text: "Que evidência fraca é normal nesse tipo de teste",
                            isCorrect: false,
                        },
                        {
                            text: "Que o time precisa de amostras maiores nos testes",
                            isCorrect: false,
                        },
                        {
                            text: "Que os critérios foram definidos por gente errada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O registro virou um formulário de quinze campos e ninguém mais lê. Qual é a saída?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Encolher o formato até caber em poucas linhas",
                            isCorrect: true,
                        },
                        {
                            text: "Cobrar o preenchimento na retrospectiva do time",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a ferramenta por uma mais bonita e moderna",
                            isCorrect: false,
                        },
                        {
                            text: "Delegar o preenchimento pra uma pessoa só do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pessoa nova entra no time e sugere uma solução testada e descartada em maio. Como o registro ajuda nessa conversa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Mostra o número, a decisão e o que mudaria a resposta",
                            isCorrect: true,
                        },
                        {
                            text: "Prova que a pessoa nova não estudou o produto direito",
                            isCorrect: false,
                        },
                        {
                            text: "Impede que qualquer solução antiga volte pra discussão",
                            isCorrect: false,
                        },
                        {
                            text: "Libera o time de rodar qualquer teste novo sobre isso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Protótipos e testes",
    aulas: [
        {
            titulo: "Fidelidade certa pro risco",
            blocks: [
                {
                    type: "text",
                    value: "# O protótipo responde uma pergunta\n\nVocê pede um protótipo pra testar renegociação de dívida num app de banco. Três semanas depois chega uma peça linda, animada, com microinterações caprichadas. A pessoa que testa passa a sessão inteira comentando o verde do botão, e ninguém descobre o que importava: ela entende que aquilo tira o nome dela do serviço de proteção ao crédito?\n\nProtótipo não é maquete bonita. É FERRAMENTA pra responder uma pergunta, e a fidelidade se escolhe pelo RISCO que você quer atacar. Rabisco em papel ou tela cinza serve pra testar CONCEITO: a pessoa entende o que é aquilo e pra que serve? Protótipo clicável serve pra testar FLUXO e usabilidade: ela consegue completar a tarefa sozinha? Protótipo com DADO REAL do usuário serve pra testar confiança e decisão: ela acredita no número e age em cima dele?\n\nAlta fidelidade cedo demais custa caro de dois jeitos. Consome tempo de design que você ainda não sabe se vale, e cria apego, porque ninguém quer jogar fora o que ficou lindo. De quebra, desvia o feedback pra cor do botão. Baixa fidelidade no teste errado também engana: ninguém decide confiar num extrato de banco desenhado a lápis.",
                },
                {
                    type: "table",
                    value: '[["Pergunta a responder","Fidelidade","Tempo típico","Armadilha"],["Entende o que é isso?","Papel ou tela cinza","1 a 2 horas","Achar que testou usabilidade"],["Completa a tarefa sozinha?","Clicável sem visual final","1 a 2 dias","Discussão sobre cor e fonte"],["Confia no número e age?","Dado real do usuário","3 a 5 dias","Expor dado sem cuidado"],["Vale a pena pagar por isso?","Página de oferta real","2 a 3 dias","Prometer o que não existe"]]',
                },
                {
                    type: "quote",
                    value: "Protótipo caro não é o que custa dinheiro, é o que você não tem mais coragem de jogar fora.",
                },
                {
                    type: "text",
                    value: "## Escolher a fidelidade sem se apaixonar\n\nA regra prática é curta: escreva a pergunta antes de abrir a ferramenta e use a menor fidelidade que responde aquela pergunta. Se a dúvida é 'as pessoas entendem o que é frete combinado?', um cartaz com três frases resolve. Se a dúvida é 'o lojista consegue configurar a regra de frete sozinho?', você precisa de algo clicável, com os nomes reais dos campos. Se a dúvida é 'o lojista confia no cálculo e desliga a planilha dele?', tem que aparecer o número dele, com o CEP dele.\n\nDois sinais de que você subiu de fidelidade cedo demais. O primeiro é a pauta do teste virar estética: as anotações da sessão falam mais de tipografia do que de tarefa. O segundo é o time defender o protótipo quando o usuário trava, em vez de anotar em silêncio. Apego é sintoma de investimento alto.\n\nVale o caminho inverso também. Se a pessoa não consegue nem entender o conceito no papel, não adianta caprichar no clicável: você não tem problema de interface, tem problema de proposta. Subir fidelidade nesse ponto só deixa o mal-entendido mais bonito e mais caro de corrigir depois.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve um protótipo, na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Responder uma pergunta específica sobre um risco",
                            isCorrect: true,
                        },
                        {
                            text: "Mostrar pra diretoria como o produto vai ficar",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar o escopo aprovado antes do desenvolvimento",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir a documentação técnica do time de engenharia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual fidelidade serve pra testar se a pessoa entende o conceito?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Rabisco em papel ou tela cinza, sem visual final",
                            isCorrect: true,
                        },
                        {
                            text: "Protótipo navegável com todas as telas já prontas",
                            isCorrect: false,
                        },
                        {
                            text: "Versão em produção liberada para dez por cento",
                            isCorrect: false,
                        },
                        {
                            text: "Protótipo com o dado real da conta do usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer saber se o lojista confia no cálculo de frete a ponto de desligar a planilha dele. Qual fidelidade cabe?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Protótipo com o dado real e o CEP daquele lojista",
                            isCorrect: true,
                        },
                        {
                            text: "Rabisco em papel com três frases explicando a ideia",
                            isCorrect: false,
                        },
                        {
                            text: "Tela cinza clicável com valores genéricos de exemplo",
                            isCorrect: false,
                        },
                        {
                            text: "Apresentação de slides com o resumo da proposta nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Nas sessões, as anotações do time só falam de tipografia e cor. O que isso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que a fidelidade subiu antes da pergunta certa",
                            isCorrect: true,
                        },
                        {
                            text: "Que o protótipo está pronto para virar produção",
                            isCorrect: false,
                        },
                        {
                            text: "Que os usuários recrutados eram designers de ofício",
                            isCorrect: false,
                        },
                        {
                            text: "Que o time precisa de mais rodadas com o mesmo perfil",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A pessoa não entende o conceito nem no papel, e o time propõe caprichar no clicável. Qual é o erro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Tratar problema de proposta como problema de tela",
                            isCorrect: true,
                        },
                        {
                            text: "Testar com menos de cinco pessoas em cada rodada nova",
                            isCorrect: false,
                        },
                        {
                            text: "Usar dado real antes de fechar o contrato jurídico",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar a pessoa travar sem oferecer ajuda nenhuma",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Teste de usabilidade",
            blocks: [
                {
                    type: "text",
                    value: "# Cinco pessoas por rodada bastam\n\nVocê tem orçamento pra quinze sessões. A tentação é agendar as quinze na mesma semana, rodar tudo e sair com um relatório grosso. Não faça. Cinco usuários por rodada já pegam a maior parte dos problemas graves de um fluxo, e a sexta pessoa costuma repetir o que as cinco primeiras mostraram. Melhor rodar cinco, corrigir o que apareceu e rodar mais cinco no fluxo corrigido: você gasta o mesmo e aprende três vezes.\n\nMontar a sessão começa pela TAREFA. Tarefa é uma situação real e específica: 'você recebeu uma fatura de 240 reais que não reconhece, resolve isso aqui'. Instrução não vale. 'Clique no menu superior e depois em contestar' entrega o caminho e não mede nada. Se você precisou explicar por onde ir, o teste acabou antes de começar.\n\nDurante a sessão, observe sem guiar. Quando a pessoa travar, conte até três antes de abrir a boca, porque o silêncio é onde aparece o comportamento real. As duas perguntas salva-vidas são 'o que você está pensando agora?' e 'o que você esperava que acontecesse?'. Nenhuma das duas ensina o caminho, e as duas fazem a pessoa narrar o modelo mental dela.",
                },
                {
                    type: "code",
                    value: "Ficha de sessão (uma por participante)\n\n  Tarefa 1: contestar a fatura de 240 reais\n    Travou em: tela de detalhe do lançamento\n    Esperava: botão contestar dentro do próprio lançamento\n    Tempo até concluir ou desistir: 4min12\n    Concluiu sozinha: não, pediu ajuda no minuto 3\n    Frase literal: 'cadê o botão de reclamar disso aqui?'\n    Severidade: impede\n\n  Legenda de severidade\n    cosmetico: incomoda, mas não muda o resultado\n    atrapalha: perde tempo e conclui sozinha\n    impede: não conclui sem ajuda de alguém",
                },
                {
                    type: "table",
                    value: '[["Severidade","O que acontece na sessão","Prioridade"],["Cosmético","Incomoda, não muda o resultado","Entra na fila normal"],["Atrapalha","Perde tempo, mas conclui sozinha","Corrige no próximo ciclo"],["Impede","Não conclui sem ajuda de alguém","Corrige antes de lançar"],["Repetido em 4 de 5","Padrão, não azar do participante","Trata como bloqueio"]]',
                },
                {
                    type: "quote",
                    value: "Teste de usabilidade responde se a pessoa consegue usar. Se ela quer usar é outra pergunta, e não é aqui que ela cai.",
                },
                {
                    type: "text",
                    value: "## O que o teste não responde\n\nO erro mais comum não está na condução, está na conclusão. O time roda cinco sessões, todo mundo completa a tarefa sem travar, e alguém escreve no relatório: 'validado, as pessoas querem'. Não querem nada. Teste de usabilidade responde 'consegue usar?'. Se a pessoa QUER usar é risco de valor, e isso se descobre de outro jeito: entrevista sobre a vida dela, teste de demanda, dinheiro na mesa.\n\nDá pra ter as duas leituras na mesma sessão, desde que você separe as anotações. Do lado da usabilidade: onde travou, o que ela esperava que acontecesse, quanto tempo levou, se concluiu sozinha, a frase literal. Do lado do valor: se ela perguntou 'quando isso fica pronto?' sem você puxar, se contou uma história de quando precisou disso, se reclamou do preço. Misturar as duas leituras produz confiança falsa.\n\nFeche a rodada com a lista de problemas ordenada por severidade e por repetição. Problema que apareceu em quatro dos cinco participantes é padrão. Problema que apareceu em um pode ser azar de recrutamento, e é mais honesto marcar assim do que transformar em tarefa no próximo sprint.",
                },
            ],
            questions: [
                {
                    statement: "Por que cinco usuários por rodada costumam bastar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque a sexta pessoa tende a repetir os achados",
                            isCorrect: true,
                        },
                        {
                            text: "Porque cinco é o mínimo exigido por norma técnica",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cinco pessoas representam todo o público",
                            isCorrect: false,
                        },
                        {
                            text: "Porque acima disso o custo por sessão sobe demais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual destas é uma tarefa de teste, e não uma instrução?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Você recebeu uma fatura errada, resolve isso aqui",
                            isCorrect: true,
                        },
                        {
                            text: "Clique no menu superior e escolha contestar agora",
                            isCorrect: false,
                        },
                        {
                            text: "Abra a aba de faturas e procure o valor de 240",
                            isCorrect: false,
                        },
                        {
                            text: "Use o botão vermelho no canto e confirme a ação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na terceira tarefa, a pessoa trava na tela e olha pra você. O que fazer primeiro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contar até três em silêncio e observar o que ela faz",
                            isCorrect: true,
                        },
                        {
                            text: "Mostrar o caminho certo pra não perder a sessão",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar a tarefa e seguir direto pra próxima da lista",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar se ela gostou do visual da tela atual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "As cinco pessoas completaram a tarefa sem travar. O que o time pode concluir daí?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que o fluxo é usável, nada sobre querer usar",
                            isCorrect: true,
                        },
                        {
                            text: "Que a demanda pelo produto ficou comprovada ali",
                            isCorrect: false,
                        },
                        {
                            text: "Que o preço cobrado foi aceito pelo público",
                            isCorrect: false,
                        },
                        {
                            text: "Que dá pra pular a próxima rodada de sessões",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um problema apareceu em apenas um dos cinco participantes. Como registrar isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Como possível azar de recrutamento, não padrão",
                            isCorrect: true,
                        },
                        {
                            text: "Como bloqueio de lançamento, com correção urgente",
                            isCorrect: false,
                        },
                        {
                            text: "Como problema cosmético, sem prioridade nenhuma",
                            isCorrect: false,
                        },
                        {
                            text: "Como padrão do público, já que apareceu na rodada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Testes de demanda",
            blocks: [
                {
                    type: "text",
                    value: "# Medir demanda antes de construir\n\nUm marketplace de peças automotivas decide lançar entrega no mesmo dia. Seis meses de time, integração com três transportadoras, tudo no ar. Adesão no primeiro mês: 0,4% dos pedidos. Ninguém tinha perguntado ao mercado se aquilo valia o preço, porque perguntar parecia menos sério do que construir.\n\nTeste de demanda existe pra isso: descobrir se alguém quer, antes de virar código. Os métodos são poucos e simples. LANDING PAGE com proposta clara e chamada pra ação, o clássico smoke test. BOTÃO FALSO dentro do produto, que registra o clique e responde 'estamos preparando isso, quer ser avisado quando sair?'. LISTA DE ESPERA com email. Campanha pequena de anúncio, pra medir quanto custa trazer uma pessoa interessada. E pré-venda, que é o teste mais duro de todos.\n\nO que separa sinal forte de sinal fraco é o CUSTO que a pessoa paga pra sinalizar interesse. Clicar não custa quase nada. Deixar o email custa um pouco, porque ela sabe que vai receber contato. Colocar o cartão custa muito. É a escada da evidência aplicada a demanda: opinião embaixo, comportamento no meio, dinheiro no topo.",
                },
                {
                    type: "table",
                    value: '[["Método","O que mede","Força do sinal","Cuidado ético"],["Landing page","Interesse pela proposta","Fraco","Não prometer data de entrega"],["Botão falso no produto","Intenção no contexto de uso","Médio","Avisar na hora que não existe"],["Lista de espera","Disposição a dar contato","Médio","Usar o email só pra isso"],["Anúncio pago","Custo pra atrair interesse","Médio","Anúncio não pode enganar"],["Pré-venda","Disposição a pagar","Forte","Devolver o valor se não sair"]]',
                },
                {
                    type: "quote",
                    value: "Curtida não paga boleto. O sinal vale exatamente o que custou pra pessoa que emitiu ele.",
                },
                {
                    type: "text",
                    value: "## Critério antes, ética sempre\n\nAntes de subir qualquer teste, escreva o número que faria o time seguir. Algo como: 'se pelo menos 8% de quem vê a página clicar, e 25% desses deixarem o email, a gente investiga a fundo; abaixo disso, arquiva'. Sem critério escrito antes, qualquer resultado vira defesa da ideia original: 40 cadastros parecem muito pra quem quer construir e pouco pra quem não quer.\n\nCuidado com o denominador. Trezentos cliques vindos da sua base de clientes fiéis não dizem o mesmo que trezentos cliques vindos de anúncio pra público frio. E cuidado com o teste que mede só a qualidade do anúncio: manchete espetacular converte bem e não prova nada sobre o produto.\n\nA parte ética não é detalhe, é o que separa teste de golpe. Nunca prometa o que não existe sem avisar. Nunca cobre por algo que você não vai entregar; se cobrou em pré-venda e desistiu, devolva o dinheiro rápido e explique o motivo. Avise quem se cadastrou mesmo quando a decisão for não fazer, com uma mensagem curta e honesta. E lembre que a marca paga a conta: teste de demanda mal feito queima a confiança do cliente que você já tinha.",
                },
            ],
            questions: [
                {
                    statement: "O que é um smoke test de demanda?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Página com a proposta e uma chamada pra ação",
                            isCorrect: true,
                        },
                        {
                            text: "Teste de carga do servidor sob pico de acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Sessão gravada com cinco usuários por rodada",
                            isCorrect: false,
                        },
                        {
                            text: "Entrevista de trinta minutos sobre a rotina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na escada da evidência aplicada a demanda, qual sinal é o mais forte?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Colocar o cartão de crédito numa pré-venda",
                            isCorrect: true,
                        },
                        {
                            text: "Clicar no botão falso dentro do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Curtir a publicação do anúncio nas redes",
                            isCorrect: false,
                        },
                        {
                            text: "Responder numa pesquisa que acha a ideia boa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time subiu a landing page e agora discute se 40 cadastros são muitos ou poucos. O que faltou?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Definir antes o número que faria o time seguir",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar a campanha por um trimestre inteiro antes",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar uma agência pra desenhar a página",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o orçamento de anúncio antes de medir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A pré-venda foi feita, e depois o time decidiu não construir. Qual é a conduta correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Devolver o dinheiro rápido e explicar a decisão",
                            isCorrect: true,
                        },
                        {
                            text: "Manter o valor como crédito futuro sem avisar",
                            isCorrect: false,
                        },
                        {
                            text: "Ficar em silêncio até alguém pedir estorno",
                            isCorrect: false,
                        },
                        {
                            text: "Entregar outra funcionalidade qualquer no lugar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O anúncio tinha manchete espetacular e a página converteu 12%. Por que desconfiar do número?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O teste pode ter medido o anúncio, não a oferta",
                            isCorrect: true,
                        },
                        {
                            text: "Taxas acima de 10% são sempre erro de medição",
                            isCorrect: false,
                        },
                        {
                            text: "Anúncio pago nunca serve pra teste de demanda",
                            isCorrect: false,
                        },
                        {
                            text: "Público frio não pode ser usado em nenhum teste",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Wizard of Oz e concierge",
            blocks: [
                {
                    type: "text",
                    value: "# Gente por trás da cortina\n\nUma startup de contabilidade promete classificação automática de notas fiscais. O cliente sobe o PDF e, em quinze minutos, recebe a nota categorizada. Não existe modelo nenhum: tem dois analistas do outro lado da tela fazendo na mão. Em três meses, o time descobriu quarenta regras de exceção que jamais apareceriam num fluxograma de reunião, e só então começou a codificar.\n\nIsso é WIZARD OF OZ: por fora parece automático, por dentro tem gente fazendo o trabalho. O usuário não sabe, e é justamente por isso que o cuidado ético é maior. Nunca faça com dado sensível sem consentimento claro, e nunca com decisão crítica sem supervisão de quem responde por ela: crédito negado, triagem médica, desligamento de funcionário.\n\nO primo assumido dele é o CONCIERGE. Aqui o serviço é declaradamente manual e personalizado: o usuário sabe que tem gente atendendo, muitas vezes fala com essa pessoa por WhatsApp, e recebe um trabalho feito a mão. Uma operação de logística que promete otimizar rotas pode começar com um planejador montando tudo em planilha e mandando por mensagem, cliente por cliente. Os dois entregam valor de verdade antes de existir automação; a diferença é quem sabe.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Wizard of Oz","Concierge"],["Usuário sabe do humano","Não sabe","Sabe e conversa"],["Serve pra medir","Comportamento sem viés","Processo e exceções"],["Risco ético","Alto, exige limite claro","Baixo, é transparente"],["Sinal de que passou do ponto","Virou operação escondida","Virou consultoria fixa"]]',
                },
                {
                    type: "quote",
                    value: "Se o seu Wizard of Oz roda há seis meses, você não tem um teste: tem uma operação com cara de software.",
                },
                {
                    type: "text",
                    value: "## Quando usar cada um, e quando parar\n\nEscolha pelo que você ainda não sabe. Use WIZARD OF OZ quando precisa medir comportamento real sem enviesar: se a pessoa souber que tem gente montando a resposta, ela pede diferente, espera mais e perdoa erro. Use CONCIERGE quando ainda não entende o processo bem o suficiente pra automatizar; aí esconder o humano não ajuda em nada e atrapalha, porque a conversa aberta com o cliente é metade do dado.\n\nO que se aprende nos dois é a mesma coisa valiosa: as regras de exceção. O fluxo feliz qualquer um desenha na reunião. O que derruba projeto é a nota fiscal com CNPJ de matriz e entrega em filial, o currículo sem data de saída no último emprego, o pedido que muda de endereço depois de sair pra rota. Isso só aparece quando alguém faz na mão, algumas centenas de vezes.\n\nOs limites são claros. Não escala, cansa o time e tem prazo de validade. Combine antes quantas semanas vai durar e qual pergunta encerra o teste. Se rodar meio ano, você não está mais testando: está operando um serviço manual fantasiado de produto.",
                },
            ],
            questions: [
                {
                    statement: "No Wizard of Oz, o que o usuário percebe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Acha que é automático, sem saber do humano",
                            isCorrect: true,
                        },
                        {
                            text: "Sabe que existe uma equipe atendendo ele",
                            isCorrect: false,
                        },
                        {
                            text: "Recebe um aviso de que o serviço é manual",
                            isCorrect: false,
                        },
                        {
                            text: "Assina um termo autorizando o teste técnico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um teste concierge?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Serviço manual e assumido, feito pessoa a pessoa",
                            isCorrect: true,
                        },
                        {
                            text: "Automação parcial escondida atrás da interface",
                            isCorrect: false,
                        },
                        {
                            text: "Atendimento por robô treinado com dado interno",
                            isCorrect: false,
                        },
                        {
                            text: "Versão gratuita liberada apenas pra um grupo fechado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time de RH não entende o processo de triagem de currículo o bastante pra automatizar. Qual abordagem cabe?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Concierge, com o recrutador triando na mão",
                            isCorrect: true,
                        },
                        {
                            text: "Wizard of Oz com filtro escondido no site",
                            isCorrect: false,
                        },
                        {
                            text: "Landing page medindo cliques em uma semana",
                            isCorrect: false,
                        },
                        {
                            text: "Teste de usabilidade com cinco recrutadores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o Wizard of Oz esconde o humano, mesmo pagando um preço ético por isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra medir o comportamento real sem enviesar",
                            isCorrect: true,
                        },
                        {
                            text: "Pra reduzir o custo da operação manual do time",
                            isCorrect: false,
                        },
                        {
                            text: "Pra evitar contratar analistas no início",
                            isCorrect: false,
                        },
                        {
                            text: "Pra cumprir exigência de sigilo do contrato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O Wizard of Oz de triagem de crédito roda há seis meses com dois analistas fixos. Qual é o diagnóstico?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Virou operação manual, não é mais um teste",
                            isCorrect: true,
                        },
                        {
                            text: "Está pronto pra escalar pro país inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Prova que a automação seria desnecessária",
                            isCorrect: false,
                        },
                        {
                            text: "Confirma que o modelo de negócio é rentável",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Protótipo em 2026",
            blocks: [
                {
                    type: "text",
                    value: "# Ficou barato produzir, continua caro perguntar\n\nEm 2026, um time de produto abre uma ferramenta de IA generativa, descreve a tela em duas frases e recebe dez variações navegáveis em minutos. Outra ferramenta gera dado falso realista pra popular o protótipo. Uma terceira transcreve as oito entrevistas e devolve os temas agrupados antes do café esfriar. O custo de PRODUZIR artefato de discovery despencou, e isso é ótimo.\n\nO efeito colateral é traiçoeiro. Ficou barato produzir protótipo e continua caro descobrir a pergunta certa. Na prática, o time gera dez telas lindas em cima de uma suposição que ninguém questionou, todo mundo se sente produtivo, e o erro só aparece no lançamento, agora com dez telas de investimento emocional em vez de uma.\n\nSepare o que a ferramenta acelera do que ela não substitui. Ela acelera EXECUÇÃO, VARIAÇÃO e VOLUME: mais versões, mais rápido, mais barato. Ela não escolhe qual risco atacar, não recruta a pessoa certa, não ouve sem induzir e não decide o que fazer quando a evidência é fraca e o prazo é curto. Essas quatro seguem sendo trabalho humano, e são justamente as que definem se o discovery serviu pra alguma coisa.",
                },
                {
                    type: "table",
                    value: '[["Etapa do discovery","Quanto a ferramenta ajuda","O que segue humano"],["Escolher o risco a atacar","Quase nada","Definir a pergunta"],["Recrutar participante","Pouco, ajuda no filtro","Achar quem tem a dor"],["Produzir protótipo","Muito, gera em minutos","Decidir a fidelidade"],["Conduzir entrevista","Pouco, ajuda no roteiro","Ouvir sem induzir"],["Sintetizar entrevista","Muito, agrupa os temas","Ler a frase literal"]]',
                },
                {
                    type: "quote",
                    value: "A ferramenta gera dez telas em cinco minutos. Ela não gera a pergunta que fazia valer a pena desenhar uma.",
                },
                {
                    type: "text",
                    value: "## O risco escondido na síntese automática\n\nMerece atenção especial o resumo automático de entrevista. A ferramenta transcreve, agrupa e devolve algo como 'os usuários relatam dificuldade no processo de conciliação'. Parece útil, e é, pra achar o trecho. Mas o dado bom quase nunca mora no resumo: mora na frase literal ('eu imprimo o relatório e confiro com caneta, porque o sistema já me deu prejuízo uma vez') e na hesitação de quatro segundos antes de responder se confia no número.\n\nResumo apaga hesitação, apaga o tom, apaga a contradição entre o que a pessoa diz e o que ela faz. Use a síntese como índice, não como conclusão: ela aponta onde ouvir, e você ouve. Guarde as frases literais no registro de aprendizado, com participante e minuto.\n\nA regra prática que sobrevive a qualquer ferramenta cabe numa linha: escreva a pergunta e o critério de sucesso ANTES de abrir a ferramenta. Feito isso, use tudo o que existir pra ir mais rápido. O que muda todo ano é o custo de produzir; o que não muda é a disciplina de saber o que você está tentando descobrir e o que faria você mudar de ideia.",
                },
            ],
            questions: [
                {
                    statement: "O que as ferramentas de IA generativa barateram no discovery?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A produção de artefato: tela, protótipo e dado",
                            isCorrect: true,
                        },
                        {
                            text: "A escolha do risco que o time vai atacar antes",
                            isCorrect: false,
                        },
                        {
                            text: "O recrutamento de participantes com a dor certa",
                            isCorrect: false,
                        },
                        {
                            text: "A decisão de seguir quando a evidência é fraca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que costuma se perder no resumo automático de uma entrevista?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A frase literal e a hesitação de quem falou",
                            isCorrect: true,
                        },
                        {
                            text: "O nome do participante e o dia da sessão",
                            isCorrect: false,
                        },
                        {
                            text: "A gravação em vídeo e o áudio original",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo total de duração de cada conversa gravada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time gerou dez variações de tela numa tarde e todo mundo se sentiu produtivo. Qual é o alerta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As dez podem estar em cima da mesma suposição",
                            isCorrect: true,
                        },
                        {
                            text: "Gerar variação com IA custa caro demais hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Dez telas ultrapassam o limite de um teste",
                            isCorrect: false,
                        },
                        {
                            text: "Protótipo gerado por IA não pode ser testado com gente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como usar a síntese automática de entrevista sem perder o que importa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como índice pra achar onde ouvir, não como conclusão",
                            isCorrect: true,
                        },
                        {
                            text: "Como conclusão final, dispensando o áudio bruto",
                            isCorrect: false,
                        },
                        {
                            text: "Como substituto do registro de aprendizado do time todo",
                            isCorrect: false,
                        },
                        {
                            text: "Como relatório enviado direto para a diretoria toda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual regra prática sobrevive a qualquer ferramenta nova de discovery?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Escrever pergunta e critério antes de abrir a ferramenta",
                            isCorrect: true,
                        },
                        {
                            text: "Gerar o máximo de variações possíveis antes do teste",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher a ferramenta mais nova do mercado a cada mês novo",
                            isCorrect: false,
                        },
                        {
                            text: "Subir a fidelidade do protótipo logo na primeira semana",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Discovery quantitativo",
    aulas: [
        {
            titulo: "Surveys bem feitas",
            blocks: [
                {
                    type: "text",
                    value: "# Survey não descobre, survey conta\n\nUm PM de app de delivery dispara uma survey pra 4 mil lojistas parceiros com a pergunta 'o que falta no app?'. Voltam 900 respostas em texto livre: 'mais promoções', 'app mais rápido', 'taxa menor'. Duas semanas de trabalho pra confirmar que lojista quer pagar menos. O erro não foi a survey, foi o que ele pediu dela.\n\nSurvey é instrumento de MEDIÇÃO. Ela responde quantos e com que frequência sobre algo que você já descobriu conversando com gente. Você entrevista doze lojistas, três contam a mesma história de repasse que atrasa e quebra o caixa da semana. Aí a survey entra pra dizer se isso é 6% da base ou 55%. Sem a entrevista antes, você escreve perguntas sobre o que imagina e recebe de volta, em escala, exatamente o que imaginou.\n\nA pergunta fechada é onde a survey ganha ou perde. Uma ideia por pergunta: 'o app é rápido e fácil de usar?' não tem resposta possível pra quem acha rápido e confuso. Linguagem do usuário, não do time: se o lojista chama de 'o dinheiro que cai', não pergunte sobre liquidação de recebíveis. E opções que cubram o mundo inteiro sem se sobrepor, sempre com 'outro' e 'não se aplica' pra quem não cabe nas suas caixinhas.",
                },
                {
                    type: "code",
                    value: "SURVEY: repasse financeiro para lojistas (app de delivery)\nObjetivo: medir frequencia e impacto do atraso ouvido em 12 entrevistas\nTempo alvo: 6 minutos, 14 perguntas\n\nBLOCO 1  Contexto (facil e concreto, aquece a pessoa)\n  P1 Ha quanto tempo voce vende pelo app?\n     tipo: escolha unica\n     opcoes: menos de 6 meses / 6 a 12 meses / 1 a 3 anos /\n             mais de 3 anos\n  P2 Quantos pedidos voce recebe numa semana tipica?\n     tipo: escolha unica em faixas\n     opcoes: ate 20 / 21 a 100 / 101 a 400 / mais de 400 /\n             nao sei dizer\n\nBLOCO 2  Frequencia do problema\n  P3 Nos ultimos 3 meses, quantas vezes o repasse caiu\n     depois da data prevista?\n     tipo: escolha unica\n     opcoes: nenhuma / 1 vez / 2 a 3 vezes / 4 ou mais /\n             nao acompanho as datas\n  LOGICA DE PULO: se P3 = nenhuma ou nao acompanho,\n                  siga direto para o BLOCO 4\n\nBLOCO 3  Impacto (so quem viveu o problema)\n  P4 O quanto o atraso atrapalhou o caixa da loja?\n     tipo: escala 1 a 5 (1 = nada, 5 = muito)\n  P5 O que voce fez quando percebeu o atraso?\n     tipo: multipla escolha, com 'outro' e 'nao fiz nada'\n\nBLOCO 4  Concordancia (mesma escala do inicio ao fim)\n  P6 a P10, escala 1 a 5, sempre 1 = discordo totalmente\n  e 5 = concordo totalmente, sem inverter a direcao:\n     - Eu sei com antecedencia quanto vou receber\n     - O extrato do app explica cada desconto\n     - Consigo resolver duvida de repasse sem ligar\n     - Confio na data que o app me mostra\n     - O prazo atual cabe na rotina da minha loja\n\nBLOCO 5  Aberta e demografia (por ultimo)\n  P11 Se pudesse mudar uma coisa no repasse, qual seria?\n      tipo: texto livre, opcional\n  P12 a P14 regiao, tipo de estabelecimento, faturamento",
                },
                {
                    type: "table",
                    value: '[["Problema na pergunta","Versão ruim","Versão corrigida"],["Duas ideias juntas","É rápido e fácil de usar?","Quebrar em duas perguntas"],["Pergunta que induz","O quanto você gostou da tela?","Como você avalia a nova tela?"],["Escala inconsistente","Uma pergunta inverte a direção","Mesma escala no formulário todo"],["Opções incompletas","Só três motivos possíveis","Somar \'outro\' e \'não se aplica\'"],["Jargão do time","Usa o módulo de conciliação?","Usa a tela de conferir o dinheiro?"]]',
                },
                {
                    type: "quote",
                    value: "Entrevista descobre, survey conta. Quem manda survey pra descobrir só recebe de volta, em escala, aquilo que já tinha imaginado sozinho.",
                },
                {
                    type: "text",
                    value: "## Escala, ordem e o tempo que a pessoa aguenta\n\nEscolha UMA escala e use ela do começo ao fim. Se o questionário é de concordância de 1 a 5, toda pergunta de opinião fica de 1 a 5, com 1 sempre em discordo e 5 sempre em concordo. Inverter a direção no meio parece esperto pra pegar quem responde no automático, mas polui o dado: boa parte das pessoas não percebe a virada e você fica sem saber quais respostas são erro de leitura e quais são opinião de verdade.\n\nDois viéses derrubam survey boa. O primeiro é a pergunta que induz: 'o quanto você gostou da nova tela?' já parte do princípio de que a pessoa gostou, e ela educadamente acompanha. Troque por uma formulação neutra, que deixe espaço confortável pra resposta ruim. O segundo é a AQUIESCÊNCIA: existe uma tendência humana de concordar com afirmações, ainda mais com quem está prestando um serviço pra você. Ela infla toda afirmação positiva do questionário, então desconfie quando tudo volta 4 e 5.\n\nOrdem importa. Comece fácil e concreto, deixe o sensível pro fim e a demografia por último, quando a pessoa já investiu tempo e tem menos motivo pra sair. E respeite o relógio: de 5 a 8 minutos é o teto razoável. Depois disso o abandono cresce rápido, e quem insiste até o fim começa a marcar qualquer coisa só pra terminar.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve uma survey dentro de um processo de discovery?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Medir a frequência de algo já visto em entrevista",
                            isCorrect: true,
                        },
                        {
                            text: "Descobrir problemas novos que ninguém tinha notado",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir as entrevistas com usuários por dados",
                            isCorrect: false,
                        },
                        {
                            text: "Convencer a liderança de que a ideia do time é boa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o defeito da pergunta 'o app é rápido e fácil de usar?'",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mistura duas ideias que podem ter respostas opostas",
                            isCorrect: true,
                        },
                        {
                            text: "Usa uma escala de resposta longa demais para celular",
                            isCorrect: false,
                        },
                        {
                            text: "Usa um jargão que o cliente não costuma entender",
                            isCorrect: false,
                        },
                        {
                            text: "Deixa de oferecer a opção 'não se aplica' na lista",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No meio do questionário, alguém sugere inverter a escala em três perguntas pra pegar quem responde no automático. Qual é o risco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem não percebe a virada responde ao contrário",
                            isCorrect: true,
                        },
                        {
                            text: "A plataforma de survey não aceita escalas invertidas",
                            isCorrect: false,
                        },
                        {
                            text: "As perguntas invertidas dobram o tempo de resposta",
                            isCorrect: false,
                        },
                        {
                            text: "A inversão obriga a repetir a demografia no começo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa perguntar faturamento e região numa survey com lojistas. Onde essas perguntas devem ficar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No fim, depois que a pessoa já investiu tempo",
                            isCorrect: true,
                        },
                        {
                            text: "No começo, para segmentar quem pode continuar",
                            isCorrect: false,
                        },
                        {
                            text: "No meio, entre as perguntas de concordância",
                            isCorrect: false,
                        },
                        {
                            text: "Em survey separada, enviada na semana seguinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma survey com dez afirmações positivas sobre o app volta com quase tudo em 4 e 5. Qual leitura é a mais responsável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Parte disso pode ser tendência a concordar",
                            isCorrect: true,
                        },
                        {
                            text: "O produto está aprovado pela base de clientes",
                            isCorrect: false,
                        },
                        {
                            text: "A amostra ficou pequena demais pra ser lida",
                            isCorrect: false,
                        },
                        {
                            text: "As perguntas abertas devem substituir a escala",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Pesquisas de priorização",
            blocks: [
                {
                    type: "text",
                    value: "# Ranquear dez itens produz lixo\n\nUm time de ERP manda pra 300 clientes uma lista de dez melhorias com a instrução 'arraste em ordem de importância'. Metade abandona no quarto item. Quem termina entrega uma ordem que, numa pergunta de controle no fim, ele mesmo não repete. O time trata aquele ranking como verdade e prioriza o trimestre inteiro em cima dele.\n\nRanquear dez itens é trabalho pesado: exige comparar cada item com todos os outros, e o cérebro cansa. A partir do quarto ou quinto, a pessoa ordena no chute, um empate mental disfarçado de decisão. A variação preguiçosa é pior ainda: perguntar item a item 'o quanto isso é importante pra você?' numa escala de 1 a 5. Não custa nada dizer que tudo importa, então nove dos dez itens voltam como muito importante e você fica com uma lista achatada entre 4,1 e 4,6.\n\nO conserto não é caprichar no enunciado, é mudar a mecânica. Prioridade só aparece quando existe TRADE-OFF, quando escolher uma coisa significa abrir mão de outra. Toda técnica boa de priorização faz a mesma coisa: obriga a pessoa a sacrificar algo. As duas mais úteis no dia a dia são o MaxDiff e o modelo Kano, e nenhuma das duas exige estatística avançada pra dar resposta útil.",
                },
                {
                    type: "text",
                    value: "## MaxDiff: escolher o melhor e o pior\n\nA ideia do MaxDiff é simples. Em vez da lista inteira, você mostra 4 ou 5 itens por tela e faz duas perguntas: qual destes é o MAIS importante pra você e qual é o MENOS importante. A pessoa responde em segundos, porque comparar quatro coisas é fácil. Aí você repete a rodada com outra combinação de itens, e outra, até que cada item tenha aparecido algumas vezes ao lado de adversários diferentes.\n\nCada tela dessas carrega muita informação: você fica sabendo o topo e o fundo daquele grupo, e por tabela sabe que os do meio perderam pro primeiro e ganharam do último. Somando dez ou quinze rodadas rápidas, sai uma ordem com separação de verdade. Em vez de dez itens espremidos entre 4,1 e 4,6, você enxerga o que aparece sempre no topo, o que ninguém escolhe nunca e a faixa cinzenta no meio.\n\nO segredo é a mecânica da escolha forçada. Ninguém consegue dizer que tudo é importante quando a tela exige apontar o menos importante. Cabe numa survey comum, roda no celular e a taxa de conclusão costuma ser melhor que a do arrasta e ordena, porque cada tela é leve.",
                },
                {
                    type: "quote",
                    value: "Escala de importância pergunta o que a pessoa quer. MaxDiff pergunta do que ela abre mão. Só a segunda separa prioridade de vontade.",
                },
                {
                    type: "table",
                    value: '[["Categoria Kano","Como a pessoa reage","Exemplo em app de banco"],["Básico","A falta irrita, ter não elogia","Saldo correto e login funcionando"],["Linear","Quanto mais tem, melhor fica","Velocidade pra abrir o extrato"],["Encantador","Surpreende, a falta não incomoda","Cofrinho que rende sozinho"],["Indiferente","Tanto faz ter ou não ter","Escolher a cor do tema do app"]]',
                },
                {
                    type: "text",
                    value: "## Kano: a pergunta funcional e a disfuncional\n\nO modelo Kano classifica cada item com um par de perguntas. A FUNCIONAL é 'como você se sentiria se o app abrisse o extrato em um segundo?'. A DISFUNCIONAL é 'como você se sentiria se o extrato demorasse dez segundos?'. As duas usam as mesmas cinco opções de resposta: gosto assim, é o esperado, tanto faz, dá pra conviver, não gosto. O cruzamento das duas respostas classifica o item.\n\nSai daí uma leitura direta. Básico é o que a pessoa espera: ninguém elogia login que funciona, mas login quebrado gera raiva e cancelamento. Linear é o que responde na proporção: quanto mais rápido o extrato, mais satisfeita ela fica. Encantador surpreende quando existe, e a ausência não incomoda, porque ela nem sabia que era possível. E indiferente é aquilo que o time acha lindo e o cliente não sente falta.\n\nO uso prático é o que interessa. Básico entra no essencial e não vira argumento de venda, só evita perda. Linear entra na comparação com o concorrente, é onde a métrica anda quando você investe. Encantador entra com parcimônia, um de cada vez, porque custa caro e envelhece: câmera boa em celular já foi encanto e hoje é básico. Item indiferente sai da lista sem dó.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que pedir pra alguém ranquear dez itens costuma gerar dado ruim?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A pessoa cansa e ordena o resto no chute",
                            isCorrect: true,
                        },
                        {
                            text: "Listas longas travam a maioria dos formulários",
                            isCorrect: false,
                        },
                        {
                            text: "Ranking exige análise estatística avançada",
                            isCorrect: false,
                        },
                        {
                            text: "Dez itens ultrapassam o limite de oito minutos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No modelo Kano, o que caracteriza um item básico?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A falta irrita, mas a presença não é elogiada",
                            isCorrect: true,
                        },
                        {
                            text: "A presença encanta e a falta passa despercebida",
                            isCorrect: false,
                        },
                        {
                            text: "A satisfação sobe conforme o item vai melhorando",
                            isCorrect: false,
                        },
                        {
                            text: "O cliente não sente diferença tendo ou não tendo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa survey de ERP, nove dos dez itens voltaram como muito importante. Qual mudança de mecânica resolve isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostrar poucos itens e exigir o mais e o menos",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a escala de importância de 1 a 5 pra 1 a 10",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir a mesma survey com o dobro de respondentes",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar melhor no enunciado o que é ser importante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O Kano classificou o cofrinho automático como encantador e o login estável como básico. O que fazer com isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Garantir o login e soltar o cofrinho com parcimônia",
                            isCorrect: true,
                        },
                        {
                            text: "Priorizar o cofrinho, já que ele encanta mais gente",
                            isCorrect: false,
                        },
                        {
                            text: "Cortar os dois, porque nenhum aparece na comparação",
                            isCorrect: false,
                        },
                        {
                            text: "Tratar os dois no mesmo nível dentro do trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma diretora diz que o MaxDiff é caro e que a escala de importância dá a mesma resposta mais barato. Qual é a réplica honesta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A escala não força escolha, então achata o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "A escala de importância não funciona em pesquisa B2B",
                            isCorrect: false,
                        },
                        {
                            text: "O MaxDiff dispensa entrevista qualitativa antes dele",
                            isCorrect: false,
                        },
                        {
                            text: "A escala só vale quando a base passa de mil clientes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Dados de uso como pesquisa",
            blocks: [
                {
                    type: "text",
                    value: "# O produto já está te contando coisas\n\nNo painel de um app de seguro, um número salta: 78% das pessoas param na etapa de enviar o documento. O time lê aquilo como resposta, conclui que a tela está feia e gasta um trimestre redesenhando. Depois do lançamento, 74% param na etapa nova. O número estava certo, a leitura é que estava errada.\n\nFunil de abandono é PERGUNTA, não resposta. Ele diz onde a sua base está travando e com que tamanho, e essa é uma informação valiosíssima, porque aponta exatamente onde a próxima entrevista deve acontecer. O que ele nunca diz é o motivo. Talvez a tela esteja confusa. Talvez o documento pedido esteja na gaveta da casa dos pais. Talvez a pessoa não confie em mandar um RG por um app que conheceu ontem. Cada uma dessas hipóteses pede uma solução completamente diferente, e nenhuma delas aparece no gráfico.\n\nA disciplina é simples de enunciar e difícil de manter sob pressão: quando o dado mostrar um buraco, escreva a pergunta que ele levanta antes de escrever a solução. Cinco conversas com quem abandonou custam menos que um trimestre de redesenho e respondem o que o painel não responde.",
                },
                {
                    type: "text",
                    value: "## Caminhos, vaivém e a busca interna\n\nO funil é só a superfície. Debaixo dele existe o caminho que as pessoas realmente fazem, que quase nunca é o caminho que alguém desenhou no Figma. Gente que entra pela busca e ignora o menu, gente que passa por três telas de ajuda antes de comprar, gente que sai do app e volta pelo link do e-mail. Comparar o fluxo desenhado com o fluxo real costuma render mais oportunidade que qualquer brainstorm.\n\nO vaivém entre telas merece atenção especial. Alguém que alterna três vezes entre o carrinho e a página do produto não está passeando, está procurando uma informação que você não colocou onde deveria: prazo de entrega, compatibilidade, política de troca. Esse padrão de ida e volta é um dos sinais mais confiáveis de confusão que existe.\n\nA fonte mais barata de todas é a BUSCA INTERNA, principalmente os termos que voltam sem resultado. Ali o usuário está escrevendo, com as palavras dele, exatamente o que veio buscar e não achou. Se 'segunda via de boleto' aparece mil vezes por mês na busca de um app que tem essa função, o problema não é a função, é o caminho até ela. E recorrência é o sinal mais honesto de valor: gente que volta sozinha na semana seguinte está dizendo que aquilo resolve alguma coisa.",
                },
                {
                    type: "quote",
                    value: "Funil não responde nada. Ele só aponta, com precisão de metro quadrado, onde a sua próxima entrevista deveria acontecer.",
                },
                {
                    type: "table",
                    value: '[["Sinal quantitativo","Pergunta que ele levanta","Como investigar"],["78% param no envio do documento","O que trava a pessoa ali?","Teste de usabilidade na etapa"],["Busca por boleto sem resultado","Existe e não acham?","5 conversas com quem buscou"],["Vaivém entre carrinho e produto","Falta qual informação?","Ver sessões e perguntar depois"],["Uso cai no dia 8 e não volta","O valor não apareceu?","Falar com quem parou de usar"]]',
                },
                {
                    type: "text",
                    value: "## Cuidados e a briga da instrumentação\n\nTrês armadilhas pegam todo mundo. A primeira é confundir correlação com causa: quem usa a feature X retém mais, mas talvez a feature não retenha nada e apenas os já engajados cheguem até ela. A segunda é esquecer o calendário: queda em dezembro, pico depois de campanha, movimento de fim de mês em produto financeiro. Comparar semana contra semana sem olhar sazonalidade produz conclusão inventada.\n\nA terceira é a mais traiçoeira: o dado agregado esconde segmentos com comportamento oposto. Uma conversão total estável pode ser queda forte no celular compensada por alta no computador. Antes de comemorar ou entrar em pânico com uma linha reta, quebre por plataforma, por plano, por região e por tempo de casa.\n\nE tem a base de tudo: INSTRUMENTAÇÃO. Evento sem definição combinada vira número que ninguém confia. O evento pedido_criado dispara no clique do botão ou só depois que o pagamento confirma? Se dois times respondem diferente, o painel virou fonte de discussão em vez de fonte de verdade. A prática que salva é chata e barata: um dicionário de eventos com nome, momento exato em que dispara, propriedades e dono. Sem isso, todo o resto desta aula não se sustenta.",
                },
            ],
            questions: [
                {
                    statement: "Como um funil de abandono deve ser lido no discovery?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como pergunta que indica onde investigar",
                            isCorrect: true,
                        },
                        {
                            text: "Como resposta sobre o motivo do abandono",
                            isCorrect: false,
                        },
                        {
                            text: "Como prova de que a tela precisa mudar",
                            isCorrect: false,
                        },
                        {
                            text: "Como métrica de negócio para a diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os termos buscados sem resultado são uma fonte valiosa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É o usuário pedindo com as palavras dele",
                            isCorrect: true,
                        },
                        {
                            text: "É o único dado que já vem com o motivo explicado",
                            isCorrect: false,
                        },
                        {
                            text: "É a métrica que mais influencia a receita mensal",
                            isCorrect: false,
                        },
                        {
                            text: "É o sinal que dispensa qualquer conversa posterior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A conversão total do mês ficou igual à do mês passado. O que vale conferir antes de dizer que nada mudou?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se um segmento caiu e outro subiu compensando",
                            isCorrect: true,
                        },
                        {
                            text: "Se a meta do trimestre foi revisada pela diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Se o time entregou features novas nesse período",
                            isCorrect: false,
                        },
                        {
                            text: "Se a concorrência lançou promoção no mesmo mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois times discutem porque cada painel mostra um número diferente de pedidos criados. Qual é a causa mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O evento não tem definição combinada entre eles",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta de análise está com atraso de coleta",
                            isCorrect: false,
                        },
                        {
                            text: "Um dos times está olhando um período diferente",
                            isCorrect: false,
                        },
                        {
                            text: "O banco de dados perdeu registros na última semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quem usa a feature de metas retém 30% mais. A liderança quer empurrar a feature pra todo mundo. Qual é a ressalva?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Talvez só quem já era engajado chegue até ela",
                            isCorrect: true,
                        },
                        {
                            text: "Talvez a feature esteja com bug em alguns aparelhos",
                            isCorrect: false,
                        },
                        {
                            text: "Talvez a retenção não seja a métrica certa do time",
                            isCorrect: false,
                        },
                        {
                            text: "Talvez o painel esteja contando sessões duplicadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Juntar quali e quanti",
            blocks: [
                {
                    type: "text",
                    value: "# O número diz onde, a entrevista diz por quê\n\nNum marketplace de peças automotivas, o painel mostra que quem usa a busca converte quatro vezes mais que quem navega por categoria. A conclusão parece óbvia: investir na busca. Três entrevistas depois, a história muda. O comprador não tem dúvida sobre qual peça quer, ele tem MEDO de que a peça não sirva no carro dele, e sai do site pra confirmar compatibilidade no WhatsApp do vendedor. Busca melhor não resolveria nada disso.\n\nGuarde essa frase, ela organiza o módulo inteiro: o número diz ONDE e QUANTO, a entrevista diz POR QUÊ. Cada lado responde uma pergunta que o outro não consegue responder. O painel enxerga a base inteira, mas é cego pra motivo, contexto e emoção. A conversa enxerga motivo com nitidez, mas só de um punhado de pessoas, e você nunca sabe sozinho se aquele punhado representa alguém além dele mesmo.\n\nO time que trata os dois como times rivais perde duas vezes. O que trata como um par de instrumentos ganha uma coisa que nenhum dos dois entrega sozinho: uma decisão com motivo explicado e tamanho conhecido. É isso que faz uma prioridade sobreviver à primeira pergunta difícil numa reunião.",
                },
                {
                    type: "text",
                    value: "## O ciclo roda nos dois sentidos\n\nO primeiro sentido começa no número. Um app de saúde vê que 38% das pessoas que remarcam consulta pelo app ligam pro call center nos dez minutos seguintes. Nenhum painel explica isso. Quatro entrevistas explicam: a tela de confirmação some rápido, ninguém recebe comprovante e o paciente liga porque não confia que a remarcação pegou. A dor não era remarcar, era não ter prova de que remarcou.\n\nO segundo sentido começa na conversa. Nesse mesmo app, quatro de nove pacientes contam que anotam o horário da consulta num papel na geladeira. Isso é uma hipótese bonita, e hipótese não se prioriza sozinha. Vai pro quantitativo medir: quantos exportam pro calendário, quantos abrem a tela de agenda mais de três vezes na semana da consulta, quantos tiram print. Se o comportamento aparece em 40% da base, virou prioridade com tamanho. Se aparece em 3%, era um detalhe interessante de quatro pessoas.\n\nNo marketplace de peças, o ciclo completo seria: painel aponta o abandono, entrevista revela o medo da compatibilidade, survey mede quantos compradores já receberam peça errada, e o teste da solução volta pro painel pra ver se o abandono cede. Entra e sai dos dois lados, sempre.",
                },
                {
                    type: "quote",
                    value: "Dashboard sem entrevista otimiza o botão que não deveria existir. Entrevista sem dashboard escala a dor de seis pessoas pra base inteira.",
                },
                {
                    type: "table",
                    value: '[["Situação","O que o quanti entrega","O que o quali entrega"],["Abandono no cadastro","Onde e quanto se perde","Por que a pessoa desiste ali"],["Feature nova pouco usada","Quantos chegaram a abrir","Se entenderam pra que serve"],["Churn de contas B2B","Quais clientes e quando","O gatilho da decisão de sair"],["Pedido de feature repetido","Tamanho do público afetado","A dor real por trás do pedido"]]',
                },
                {
                    type: "text",
                    value: "## Os dois erros clássicos e como apresentar\n\nDe um lado, o quali generalizado: seis entrevistas, todas apontando o mesmo incômodo, e alguém escreve no documento que 'todo mundo quer isso'. Seis pessoas não são todo mundo, e a frase some do texto na hora que você troca por 'seis de seis pessoas que entrevistamos disseram isso; ainda não sabemos o tamanho'. Do outro lado, o quanti sem contexto: trimestres inteiros gastos otimizando a taxa de clique de um botão que, se alguém tivesse perguntado, não deveria estar naquela tela.\n\nTRIANGULAÇÃO é a saída pra ambos. Quando três fontes independentes apontam a mesma coisa, entrevista, ticket de suporte e funil de uso, a confiança sobe muito mais do que quando uma fonte só é enorme. O motivo é que cada fonte tem um viés diferente, e viéses diferentes dificilmente erram na mesma direção. Amostra grande de um canal só repete o mesmo viés em escala.\n\nPra liderança, existe uma ordem que funciona: o número abre e a frase literal do usuário fecha. Primeiro '31% dos lojistas tiveram repasse atrasado no trimestre', que dá tamanho e credibilidade. Depois 'eu deixei de pagar meu fornecedor porque o dinheiro não caiu', que ninguém esquece até a próxima reunião.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a divisão de trabalho entre dado quantitativo e entrevista?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O número diz onde e quanto, a conversa diz por quê",
                            isCorrect: true,
                        },
                        {
                            text: "O número diz por quê, a conversa confirma o tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois respondem o mesmo, muda só o custo da coleta",
                            isCorrect: false,
                        },
                        {
                            text: "O número serve pro time, a conversa serve pra diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é triangulação numa pesquisa de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Fontes independentes apontando para a mesma coisa",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar a mesma survey três vezes em meses seguidos",
                            isCorrect: false,
                        },
                        {
                            text: "Entrevistar três perfis diferentes de um mesmo cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Cruzar três métricas dentro do mesmo painel de uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quatro de nove pacientes contam que anotam o horário da consulta num papel. Qual é o passo seguinte mais sólido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Medir na base quantos repetem esse comportamento",
                            isCorrect: true,
                        },
                        {
                            text: "Colocar lembrete impresso no roadmap do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Entrevistar mais nove pacientes do mesmo hospital",
                            isCorrect: false,
                        },
                        {
                            text: "Descartar o achado, porque nove pessoas é muito pouco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O painel mostra que 38% de quem remarca pelo app liga pro call center logo depois. O que fazer com esse número?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usar como ponto de partida de algumas entrevistas",
                            isCorrect: true,
                        },
                        {
                            text: "Concluir que o call center está mal dimensionado",
                            isCorrect: false,
                        },
                        {
                            text: "Refazer a tela de remarcação antes de investigar",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar, porque ligação não é problema de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você vai apresentar um achado de discovery pra diretoria em cinco minutos. Qual é a ordem mais eficaz?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Abrir com o número e fechar com a fala do usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Abrir com a fala do usuário e nem citar os números",
                            isCorrect: false,
                        },
                        {
                            text: "Mostrar só o gráfico, que é o que a diretoria entende",
                            isCorrect: false,
                        },
                        {
                            text: "Começar pela solução proposta e deixar os dados no anexo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Amostra e representatividade",
            blocks: [
                {
                    type: "text",
                    value: "# Quem respondeu se parece com quem usa?\n\nUma rede de academias dispara survey de satisfação e volta com 72% de 'recomendo'. Sobe pro slide, vira meta batida. Só que a survey apareceu dentro do app, pra quem abriu o app naquela semana. Quem cancelou não estava lá. Quem parou de ir em março não estava lá. Aquele 72% mede a opinião de quem ainda usa e ainda gosta, e o nome disso não é satisfação da base, é satisfação de quem sobrou.\n\nA pergunta que você faz antes de olhar qualquer percentual é sempre a mesma: quem respondeu se parece com quem usa? Três viéses estragam a resposta com frequência. O de SELEÇÃO: quem responde survey espontânea costuma ser o muito engajado ou o muito irritado, e o usuário do meio, que é a maioria, fica de fora em silêncio. O de SOBREVIVÊNCIA: quem cancelou saiu da sua base, então a lista de quem você consegue perguntar já está limpa das piores experiências.\n\nE o de CANAL: survey dentro do app nunca alcança quem parou de abrir o app, e-mail nunca alcança quem não abre e-mail, e pesquisa no caixa da loja nunca alcança quem desistiu da fila. O canal escolhe a amostra antes de você escolher qualquer coisa.",
                },
                {
                    type: "text",
                    value: "## Tamanho, sem estatística pesada\n\nDá pra ser honesto sem fórmula. Para uma leitura DIRECIONAL de um único segmento, algumas dezenas de respostas já orientam a conversa: se 30 de 40 lojistas de uma região relatam atraso de repasse, você não sabe o número exato, mas sabe que ali tem um problema grande e vale investigar. Ninguém precisa de mil respostas pra decidir com quem conversar em seguida.\n\nAgora, no momento em que você quer comparar dois grupos ou cortar por segmento, o jogo muda. Cada corte divide a amostra, e o que sobra em cada célula vira ruído. Aquelas 40 respostas viram 12 do plano básico e 9 do premium, e a diferença de sete pontos entre os dois é indistinguível de acaso. Dizer que o premium está mais insatisfeito com base nisso é inventar.\n\nO ponto duro é este: uma amostra grande e enviesada é PIOR que uma pequena e honesta. A pequena você lê com cuidado, sabendo que é indício. A grande dá confiança falsa, entra no slide com casa decimal e vira decisão de trimestre. Três mil respostas de um canal só não corrigem o viés do canal, elas repetem o mesmo viés três mil vezes.",
                },
                {
                    type: "quote",
                    value: "Setenta e dois por cento não quer dizer nada até você contar de quantos. Setenta e dois por cento de 18 respostas é uma conversa, não um resultado.",
                },
                {
                    type: "table",
                    value: '[["Viés","Quem fica de fora","Como reduzir"],["Seleção","O usuário médio e silencioso","Sortear convites na base inteira"],["Sobrevivência","Quem já cancelou o serviço","Convidar ex-clientes por e-mail"],["Canal","Quem parou de abrir o app","Usar dois ou três canais juntos"],["Momento","Quem só usa no fim do mês","Manter a coleta aberta mais tempo"]]',
                },
                {
                    type: "text",
                    value: "## Reduzir o viés e reportar direito\n\nQuatro hábitos resolvem a maior parte do problema. Convide por mais de um canal, porque cada canal traz um pedaço diferente da base. Inclua quem abandonou: a lista de cancelados é a mais valiosa e a menos usada de qualquer empresa, e costuma bastar um e-mail curto com uma pergunta só. Compare o perfil de quem respondeu com o perfil da base: se 70% dos seus clientes estão no plano básico e 70% das respostas vieram do premium, você mediu o premium, não a base. E, quando o desvio existir e você não puder corrigir, diga isso na apresentação.\n\nO quarto hábito é o mais barato e o mais ignorado: reporte o DENOMINADOR junto do percentual. Dizer '72% aprovam' sem dizer 'de 18 respostas' é enganar sem mentir, e cedo ou tarde alguém descobre e o seu trabalho inteiro perde crédito. Escreva o número absoluto, o canal e a data ao lado de todo percentual que sair da sua mão.\n\nDaqui pra frente, quando alguém te mostrar um resultado de pesquisa, a sua primeira pergunta é de quantos, e quem eram essas pessoas. É a pergunta mais barata da mesa e a que mais evita decisão errada.",
                },
            ],
            questions: [
                {
                    statement: "O que é viés de sobrevivência numa pesquisa com clientes?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem cancelou não está na base para responder",
                            isCorrect: true,
                        },
                        {
                            text: "Quem responde tende a concordar com as afirmações",
                            isCorrect: false,
                        },
                        {
                            text: "Quem usa mais o produto responde mais devagar",
                            isCorrect: false,
                        },
                        {
                            text: "Quem entra na base recente distorce toda a média",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que reportar o denominador junto do percentual importa tanto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque 72% de 18 respostas não é um resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a auditoria interna exige o número absoluto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque percentual sozinho não cabe bem em slide",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o cálculo do percentual muda com a amostra",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A survey de satisfação da academia rodou só dentro do app e deu 72% de aprovação. Qual é a leitura correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mede quem continua usando, não a base inteira",
                            isCorrect: true,
                        },
                        {
                            text: "Mede a base inteira, já que todos têm o app instalado",
                            isCorrect: false,
                        },
                        {
                            text: "Mede mal porque o canal digital tende a ser mais duro",
                            isCorrect: false,
                        },
                        {
                            text: "Mede bem, desde que o total de respostas passe de 500",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você tem 40 respostas e quer comparar a satisfação do plano básico com a do premium. O que é honesto fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não comparar: cada corte deixa muito pouca resposta",
                            isCorrect: true,
                        },
                        {
                            text: "Comparar e reportar a diferença como tendência clara",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar só se um dos grupos tiver mais de dez pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "Descartar as 40 respostas e recomeçar a coleta do zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um gestor prefere 3 mil respostas vindas só do banner do app a 200 respostas coletadas em três canais. Por que ele está errado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Volume não corrige viés, só repete o mesmo recorte",
                            isCorrect: true,
                        },
                        {
                            text: "Banner no app costuma ter taxa de resposta muito baixa",
                            isCorrect: false,
                        },
                        {
                            text: "Três canais sempre alcançam mais gente que um só canal",
                            isCorrect: false,
                        },
                        {
                            text: "Amostras acima de mil pessoas exigem análise estatística",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: um ciclo de discovery no papel (leitura guiada)",
    aulas: [
        {
            titulo: "O cenário do Caronaê",
            blocks: [
                {
                    type: "text",
                    value: "# 9.400 contas e quase nenhuma carona\n\nCaronaê é um app fictício de carona corporativa. A empresa contrata o serviço, os funcionários se cadastram e passam a dividir carro na ida e na volta do escritório. Quem dirige racha o combustível, quem pega carona economiza condução, e o RH corta gasto com estacionamento e vale transporte. O contrato é vendido por funcionário ativo, com um teto de custo mensal por empresa.\n\nO retrato de hoje: 12 empresas clientes, 9.400 funcionários com conta criada e apenas 11% que completaram a primeira carona em 60 dias. Um em cada nove. O resto instalou, criou senha, olhou a tela e sumiu.\n\nRepare no formato do problema. Não falta gente entrando: o RH divulga, a adesão de cadastro é ótima, os números de topo são bonitos em qualquer apresentação. O que não acontece é o segundo passo. Isso tem nome: cadastro tem, ATIVAÇÃO não tem. E ativação é o que o contrato cobra, porque empresa nenhuma renova pagando por conta parada.\n\nEsta aula monta o tabuleiro do ciclo de discovery que você vai acompanhar até o fim do módulo. Nada aqui é hipotético demais: é o tipo de situação que aparece em qualquer produto B2B2C com adesão fácil e uso difícil.",
                },
                {
                    type: "table",
                    value: '[["Candidato a meta do ciclo","Tipo","Serve ou não serve"],["Lançar o novo onboarding em maio","Entrega","Mede esforço, não resultado"],["Aumentar a receita da conta em 20%","Negócio","Longe do que o trio controla"],["Subir a ativação de 11% para 25%","Comportamento","Serve: mede o que muda no uso"],["Reduzir o gasto com estacionamento","Negócio","Consequência, não alavanca do trio"]]',
                },
                {
                    type: "quote",
                    value: "Cadastro é promessa, carona completa é prova. O trio do Caronaê parou de contar promessas e foi atrás da prova.",
                },
                {
                    type: "text",
                    value: "## O outcome do ciclo, escrito em uma linha\n\nO trio de produto do Caronaê (PM, design e engenharia) sentou e escreveu o outcome do ciclo: aumentar de 11% para 25% o percentual de funcionários que completam a primeira carona em 60 dias. Uma frase, um número, um prazo.\n\nDuas alternativas foram descartadas na hora. A primeira era 'lançar o novo onboarding'. Isso é entrega, não resultado: o time pode lançar a coisa mais linda do mundo e a ativação não sair do lugar, e ainda assim bater a meta no papel. A segunda era 'aumentar a receita'. Receita é o placar da empresa, não a alavanca do trio; entre o que esse time faz e o faturamento existem renovação, comercial, preço e mais uma dúzia de fatores que ninguém ali controla.\n\nO outcome escolhido fica no meio: descreve COMPORTAMENTO de gente de verdade, é medido sem interpretação criativa e o trio consegue mover com o próprio trabalho. Esse é o teste que você aplica em qualquer meta que te oferecerem. Se der pra bater entregando, é output disfarçado. Se der pra errar fazendo tudo certo, está longe demais do time.",
                },
                {
                    type: "text",
                    value: "## O que os dados contam e o que ainda é chute\n\nAntes de falar com alguém, o trio esvaziou o painel. Os dados de uso mostram que 62% dos cadastrados abrem a tela de busca pelo menos uma vez e saem sem pedir nada; que 38% dos pedidos de volta terminam sem motorista; que existe um motorista cadastrado para cada seis passageiros; e que 71% das caronas concluídas acontecem no trajeto da manhã.\n\nIsso é bastante coisa. E não explica nada. Dado de uso mostra ONDE trava, nunca por quê. Na escada da evidência ele está acima de opinião e abaixo de comportamento observado com contexto, que é justamente o que falta.\n\nO time listou em separado o que era chute: 'as pessoas têm medo de andar com desconhecido', 'o app é confuso', 'falta motorista', 'o pessoal só quer ir de carro sozinho mesmo'. Quatro frases ditas com muita convicção em reunião e zero evidência atrás. Escrever a lista de chutes é um exercício desconfortável e absurdamente útil: ela vira a pauta do que as entrevistas precisam confirmar ou derrubar.",
                },
                {
                    type: "text",
                    value: "## Quem o trio vai ouvir e o plano do ciclo\n\nRecrutamento por comportamento, não por opinião. O trio separou três grupos: quem se cadastrou e nunca andou (o travamento puro), quem andou uma vez e parou (viveu a experiência inteira e desistiu no meio), e quem virou usuário frequente. Esse terceiro grupo parece dispensável e é o mais valioso: o CONTRASTE entre quem ficou e quem saiu é o ouro da pesquisa, porque mostra o que precisou dar certo pra pessoa continuar.\n\nSeis conversas, uma por dia, meia hora cada, marcadas direto com o RH das duas maiores empresas clientes. Nada de estudo de três meses: é uma semana de campo, no ritmo de discovery contínuo.\n\nO plano do restante deste módulo é o ciclo inteiro, na ordem em que ele acontece de verdade. Na próxima aula você lê trechos reais das seis entrevistas e vê a síntese sendo feita. Depois, a árvore de oportunidades e a escolha do ramo com critério explícito. Depois, o mapa de suposições e os dois primeiros testes. E no fim, o resultado, a decisão e o que o time faz na segunda-feira seguinte.",
                },
            ],
            questions: [
                {
                    statement:
                        "O Caronaê tem 9.400 contas criadas e só 11% completaram a primeira carona em 60 dias. O que esse retrato aponta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O gargalo está na ativação e não na aquisição de contas",
                            isCorrect: true,
                        },
                        {
                            text: "O gargalo está na aquisição, porque falta divulgação no RH",
                            isCorrect: false,
                        },
                        {
                            text: "O produto não tem problema algum, o número é normal no setor",
                            isCorrect: false,
                        },
                        {
                            text: "O preço cobrado das empresas clientes está claramente alto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que 'lançar o novo onboarding' foi descartado como outcome do ciclo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque descreve uma entrega e não uma mudança de uso",
                            isCorrect: true,
                        },
                        {
                            text: "Porque onboarding é assunto de marketing e não do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time de engenharia não teria prazo pra construir",
                            isCorrect: false,
                        },
                        {
                            text: "Porque toda meta de produto precisa citar valor em reais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A diretoria sugeriu 'aumentar a receita da conta em 20%' como meta do trio. Qual é o problema dessa escolha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fica longe demais do que esse time consegue mover",
                            isCorrect: true,
                        },
                        {
                            text: "Receita nunca pode ser medida por trimestre numa empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Metas de negócio são proibidas em times de discovery",
                            isCorrect: false,
                        },
                        {
                            text: "O trio teria que aprender finanças antes de qualquer coisa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O painel mostra que 62% abrem a busca e saem sem pedir carona. Como o trio deve tratar esse número?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como pista de onde trava, sem explicar o porquê",
                            isCorrect: true,
                        },
                        {
                            text: "Como prova de que a tela de busca precisa ser refeita",
                            isCorrect: false,
                        },
                        {
                            text: "Como evidência forte de que falta motorista cadastrado",
                            isCorrect: false,
                        },
                        {
                            text: "Como ruído de medição, já que dado de uso engana muito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O trio pode entrevistar só quem nunca andou, já que é esse grupo que trava. Por que ele também chamou usuários frequentes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O contraste mostra o que precisou dar certo pra pessoa ficar",
                            isCorrect: true,
                        },
                        {
                            text: "Usuários frequentes dão notas melhores para o app na pesquisa",
                            isCorrect: false,
                        },
                        {
                            text: "Toda amostra de pesquisa precisa de metade de cada perfil",
                            isCorrect: false,
                        },
                        {
                            text: "Eles conseguem indicar quais features devem entrar no roadmap",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "As entrevistas",
            blocks: [
                {
                    type: "text",
                    value: "# Uma semana de campo, seis conversas\n\nSegunda a sábado, meia hora por pessoa, sempre com duas gentes do trio na chamada: uma conduz, a outra anota. A regra combinada antes foi simples e difícil de cumprir: nada de apresentar ideia, nada de perguntar 'você usaria', nada de defender o app quando aparecer crítica. Só história específica, no passado, sobre o deslocamento da semana anterior.\n\nÉ o teste da mãe do Rob Fitzpatrick aplicado sem cerimônia: fazer perguntas que nem sua mãe conseguiria responder com gentileza vazia. 'Você acha legal a ideia de carona corporativa?' qualquer pessoa educada responde que sim. 'Me conta como você voltou pra casa na quarta-feira passada' ninguém consegue enfeitar.\n\nOs trechos abaixo são recortes das gravações, do jeito que ficaram na transcrição. Leia prestando atenção em duas coisas: onde a pessoa descreve um comportamento que já aconteceu, e onde ela entrega uma solução pronta no lugar da dor. As duas coisas aparecem na mesma conversa, misturadas, e separar isso é metade do trabalho de síntese.",
                },
                {
                    type: "code",
                    value: "ENTREVISTA 1\nAna, analista financeira, mora a 34 km, filha na creche\n\n  Pesquisadora: me conta como foi sua volta pra casa na quarta passada.\n  Ana: sai as 18h10, peguei dois onibus, cheguei em casa as 19h55.\n  Pesquisadora: e no dia em que voce abriu o Caronae, o que aconteceu?\n  Ana: eu procurei carona de volta, apareceram duas opcoes as 18h,\n       eu olhei um tempo e fechei o app.\n  Pesquisadora: o que passou pela sua cabeca na hora de fechar?\n  Ana: se a creche me ligar e eu tiver que sair as 17h, ou se meu chefe\n       segurar uma reuniao ate as 19h, o carro ja foi. Ai eu fico na rua\n       sem plano B. O onibus e ruim, mas o onibus sempre esta la.\n\n\nENTREVISTA 2\nRafael, estagiario de marketing, nao tem carro\n\n  Pesquisador: voce chegou a andar de carona alguma vez?\n  Rafael: de manha sim, umas tres ou quatro vezes, foi tranquilo.\n  Pesquisador: e a volta?\n  Rafael: a volta nunca deu. Eu procuro e nao tem ninguem.\n  Pesquisador: o que voce faz quando nao tem ninguem?\n  Rafael: eu ja nem procuro mais, sinceramente. Ficou aquela coisa de\n       abrir, nao ter nada, abrir de novo, nao ter nada. Cansa.\n\n\nENTREVISTA 3\nMarcelo, gerente comercial, dirige todo dia, carro proprio\n\n  Pesquisadora: voce se cadastrou em marco e nunca ofereceu carona. Por que?\n  Marcelo: e o meu carro, sabe. Nao e frescura, mas e uma hora de trajeto\n       com uma pessoa que eu nao conheco, tendo que puxar assunto.\n  Pesquisadora: teve algum momento especifico que te fez desistir?\n  Marcelo: quando o app pediu pra eu confirmar rota de casa. Eu parei ali.\n       Nao vou botar meu endereco pra qualquer um da empresa ver.\n  Pesquisadora: e se fosse alguem do seu andar, do time comercial?\n  Marcelo: ai muda. Se eu soubesse quem e antes, provavelmente eu levava.\n\n\nENTREVISTA 4\nPriscila, atendente, escala que muda toda semana\n\n  Pesquisador: como voce descobre o seu horario da semana?\n  Priscila: sai na sexta a tarde, e as vezes muda na terca.\n  Pesquisador: voce chegou a marcar alguma carona no app?\n  Priscila: marquei uma. Ai trocaram meu turno e eu tive que cancelar.\n       Fiquei com vergonha de marcar de novo e cancelar de novo.\n\n\nENTREVISTA 5\nBeatriz, analista de RH, andou uma vez e parou\n\n  Pesquisadora: me conta essa unica carona que voce fez.\n  Beatriz: foi de volta, marcada pras 18h. As 18h10 o motorista cancelou\n       no app, sem falar nada comigo.\n  Pesquisadora: e o que voce fez?\n  Beatriz: desci, pedi um carro por aplicativo e paguei 34 reais.\n       Foi o dobro do que eu economizaria no mes inteiro.\n  Pesquisadora: voce tentou de novo depois disso?\n  Beatriz: nao. Uma vez tudo bem, mas eu nao vou arriscar de novo.\n       Se tivesse um chat no app pra falar com o motorista, talvez.\n\n\nENTREVISTA 6\nDiego, desenvolvedor, usa quatro vezes por semana\n\n  Pesquisador: o que fez voce continuar depois da primeira carona?\n  Diego: eu ando sempre com o Fabio, do time de dados. A gente combinou\n       fixo: 8h e 18h, segunda a quinta.\n  Pesquisador: e quando um dos dois nao pode?\n  Diego: a gente avisa no grupo do time de manha e resolve.\n  Pesquisador: se o Fabio saisse da empresa amanha, voce continuaria?\n  Diego: sinceramente? Acho que eu voltaria de carro sozinho.",
                },
                {
                    type: "table",
                    value: '[["Fala do entrevistado","Tipo de cartão","Oportunidade nomeada"],["\'se a creche ligar, o carro ja foi\'","Dor","Meu horário de volta é imprevisível"],["\'uma hora com quem eu não conheço\'","Dor","Não confio em andar com desconhecido"],["\'cancelou 18h10 e eu paguei 34 reais\'","Dor","Fiquei na mão quando cancelaram"],["\'eu procuro e nunca tem ninguém\'","Dor","Não sei se tem carona pro meu trajeto"],["\'se tivesse um chat no app, talvez\'","Solução pedida","Vira pergunta, não vira ramo"]]',
                },
                {
                    type: "quote",
                    value: "Quando o usuário te entrega uma solução pronta, ele te entregou o fim da história. Seu trabalho é voltar e descobrir o começo.",
                },
                {
                    type: "text",
                    value: "## Da fala solta ao cartão, do cartão ao ramo\n\nA síntese aconteceu na sexta, com as seis transcrições abertas. O método foi o mais simples que existe e funciona: cada momento relevante da fala virou um CARTÃO, com o trecho literal escrito nele. Não resumo, não interpretação, a frase da pessoa. 'Se a creche ligar e eu tiver que sair as 17h, o carro já foi' é um cartão. 'A pessoa tem receio de imprevistos' não é cartão, é opinião do time disfarçada de dado.\n\nCartão parecido com cartão vira agrupamento, e o agrupamento ganha um nome escrito NA VOZ DO USUÁRIO. Foi assim que apareceram os quatro nomes da tabela acima. Repare que nenhum deles menciona tela, botão ou feature. Uma oportunidade é dor, necessidade ou desejo declarado, ponto.\n\nA entrevista do Diego, o único usuário frequente, entrou na síntese como contraste e mudou o peso de tudo. Ele não é fiel ao app: ele é fiel ao Fábio. O que sustenta o uso dele é um acordo humano fixo, com plano B combinado por fora. Isso reforçou dois ramos ao mesmo tempo: previsibilidade da volta e confiança em quem está no carro.",
                },
                {
                    type: "text",
                    value: "## Dor não é a mesma coisa que solução pedida\n\nTrês das seis pessoas pediram chat no app. Beatriz pediu com todas as letras. É a tentação clássica: metade da amostra pedindo a mesma coisa parece consenso de mercado, e o time sai construindo.\n\nO trio não fez isso, e vale entender por quê. Chat é SOLUÇÃO. Ela responde a alguma dor que a pessoa não conseguiu nomear, e o trabalho é achar a dor por trás. Beatriz não quer conversar por escrito com estranho; ela quer saber, antes de descer do escritório, se o carro vai estar lá. Marcelo tampouco quer chat; ele quer saber quem vai sentar no banco de trás. A mesma solução pedida escondia duas dores diferentes, que viraram ramos diferentes.\n\nA regra prática que o time passou a usar: toda vez que alguém pede uma funcionalidade, a pergunta seguinte é 'me conta a última vez que você precisou disso'. A resposta é sempre uma história, e a história é que vira cartão. Solução pedida não morre, ela só muda de lugar: vai pro fim da árvore, como candidata a ser testada depois, se o ramo dela for escolhido.",
                },
            ],
            questions: [
                {
                    statement:
                        "Metade dos entrevistados do Caronaê pediu chat no app. Como o trio tratou esse pedido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como solução pedida, e foi atrás da dor por trás dela",
                            isCorrect: true,
                        },
                        {
                            text: "Como oportunidade validada, por aparecer em metade da amostra",
                            isCorrect: false,
                        },
                        {
                            text: "Como ruído de pesquisa, e descartou os trechos da conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Como item de backlog, priorizado já pro próximo trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o trio escreveu dentro de cada cartão da síntese?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O trecho literal da fala, sem resumo nem interpretação",
                            isCorrect: true,
                        },
                        {
                            text: "A conclusão do time sobre o que o entrevistado quis dizer",
                            isCorrect: false,
                        },
                        {
                            text: "A feature que resolveria aquele ponto da conversa gravada",
                            isCorrect: false,
                        },
                        {
                            text: "A nota de 1 a 5 que a pessoa deu para o app durante a call",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ana disse que fechou o app ao ver caronas de volta as 18h. Qual dor a fala dela revela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela não controla o horário da volta e teme ficar sem plano B",
                            isCorrect: true,
                        },
                        {
                            text: "Ela não entendeu como funciona a busca de carona no aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Ela achou o preço do rateio de combustível caro pro salário",
                            isCorrect: false,
                        },
                        {
                            text: "Ela não tem interesse em dividir o carro com colegas do prédio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em vez de perguntar 'você usaria uma carona corporativa', o pesquisador pediu a história da quarta-feira passada. Por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "História específica é difícil de enfeitar por educação",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntas sobre o futuro exigem mais tempo de entrevista",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar sobre a ideia obriga o time a assinar um termo",
                            isCorrect: false,
                        },
                        {
                            text: "A pessoa lembra melhor de datas do que de comportamentos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Diego usa o app quatro vezes por semana, mas disse que pararia se o Fábio saísse. O que essa entrevista acrescenta ao ciclo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Mostra que o uso se apoia em acordo humano, não no produto",
                            isCorrect: true,
                        },
                        {
                            text: "Mostra que usuários frequentes não devem entrar na amostra",
                            isCorrect: false,
                        },
                        {
                            text: "Prova que o app já resolve bem a dor de quem tem colega fixo",
                            isCorrect: false,
                        },
                        {
                            text: "Indica que o time deveria focar somente no público de manhã",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A árvore e a escolha",
            blocks: [
                {
                    type: "text",
                    value: "# A árvore do Caronaê na parede\n\nCom os cartões agrupados, o trio montou a Opportunity Solution Tree. A estrutura é sempre a mesma: o outcome no topo, as oportunidades no meio, as soluções candidatas nas folhas e, mais embaixo, os testes de suposição. Ela não é um diagrama bonito pra reunião de status; ela é o mapa do raciocínio do time, e serve pra responder uma pergunta chata que sempre aparece: por que vocês estão mexendo justamente nisso?\n\nUm detalhe que muda tudo na hora de montar: nenhuma oportunidade entra na árvore sem cartão atrás. Se o time quiser pendurar um ramo e não achar a fala que sustenta, o ramo não entra. Vira pergunta pra próxima rodada de entrevistas.\n\nOs quatro ramos abaixo vieram inteiros das seis conversas da aula anterior. As sub-oportunidades são recortes mais finos do mesmo tema, porque nem toda dor grande se resolve inteira de uma vez. E as soluções, note bem, aparecem sempre no plural: uma solução única pendurada num ramo quase sempre significa que o time já tinha decidido antes e foi buscar a evidência depois.",
                },
                {
                    type: "code",
                    value: "OUTCOME\n  Subir de 11% para 25% os funcionarios que completam\n  a primeira carona em 60 dias\n\n  RAMO 1: nao sei se tem carona pro meu trajeto antes de me cadastrar\n      sub: nao quero criar conta pra descobrir que nao tem ninguem\n      sub: meu bairro nunca aparece nos resultados de busca\n        solucao: previa de rotas ativas sem precisar de login\n        solucao: aviso por email quando surgir alguem do meu trajeto\n        solucao: mapa de calor de rotas enviado pelo RH na adesao\n\n  RAMO 2: nao confio em andar com quem eu nao conheco\n      sub: nao sei quem e a pessoa antes de aceitar\n      sub: nao quero expor meu endereco de casa pra empresa toda\n        solucao: perfil com foto, area e tempo de casa\n        solucao: ponto de encontro publico no lugar do endereco\n        solucao: carona restrita ao mesmo andar ou mesma area\n\n  RAMO 3: meu horario de volta e imprevisivel\n      sub: se eu atrasar, o carro vai embora e eu fico sem plano B\n      sub: minha escala muda na semana e eu nao posso me comprometer\n        solucao: garantia de volta com reembolso de transporte por app\n        solucao: janela flexivel com confirmacao ate 30 min antes\n        solucao: pool de motoristas de plantao da propria empresa\n\n  RAMO 4: fiquei na mao quando cancelaram em cima da hora\n      sub: cancelamento chega sem aviso e sem alternativa\n      sub: nao ha custo nenhum pra quem cancela\n        solucao: fila de reserva acionada no cancelamento\n        solucao: reputacao de motorista visivel pra todos\n\n  PERGUNTAS SEM CARTAO (nao viram ramo ainda)\n      chat dentro do app: qual dor isso resolve de verdade?\n      gamificacao de caronas: ninguem citou, veio de reuniao interna",
                },
                {
                    type: "table",
                    value: '[["Ramo de oportunidade","Notas (alc, grav, alin, cap)","Total"],["Não sei se tem carona pro trajeto","3, 2, 3, 3","11"],["Não confio em andar com estranho","2, 3, 2, 1","8"],["Meu horário de volta é imprevisível","3, 3, 3, 3","12"],["Fiquei na mão quando cancelaram","1, 3, 3, 2","9"]]',
                },
                {
                    type: "quote",
                    value: "Escolher um ramo dói porque obriga o time a escrever, com todas as letras, o que ele não vai resolver agora.",
                },
                {
                    type: "text",
                    value: "## Quatro critérios, notas de 1 a 3, decisão registrada\n\nA árvore com quatro ramos é bonita e paralisante. O trio combinou quatro critérios antes de pontuar, justamente pra não pontuar puxando sardinha pro ramo favorito de alguém. ALCANCE: quantos dos 9.400 vivem isso. GRAVIDADE: o quanto trava a primeira carona. ALINHAMENTO: o quanto mexer nisso move a ativação em 60 dias. CAPACIDADE: se o time consegue atacar sozinho, sem depender de outra área.\n\nO ramo do horário imprevisível venceu com 12 de 12. Alcance máximo porque atinge todo mundo que tem volta variável, e a volta é justamente onde os dados mostram 38% de pedidos sem match. Gravidade máxima porque é o ponto exato em que Ana fechou o app. Alinhamento direto com a primeira carona. E capacidade, porque não depende de mudar contrato nem de convencer o jurídico.\n\nO que ficou de fora foi registrado por escrito, com data e motivo, no mesmo documento. Confiança perdeu por capacidade: mexer em exposição de endereço e regra de convivência puxa jurídico e RH das 12 empresas. Cancelamento perdeu por alcance: dói muito em quem passou por isso, mas foram poucos casos. Trajeto ficou perto e virou o próximo da fila.",
                },
                {
                    type: "text",
                    value: "## Três soluções concorrentes pro mesmo ramo\n\nRamo escolhido, o trio fez a parte que mais gente pula: gerou soluções CONCORRENTES em vez de defender a primeira ideia que apareceu. São três, todas atacando a mesma dor de volta imprevisível, e propositalmente diferentes entre si.\n\nA primeira é a garantia de volta: se a carona marcada cair, o Caronaê paga o transporte por aplicativo até o valor de uma corrida comum. Ataca o medo direto, promete plano B e não exige mudar o comportamento de ninguém. A segunda é a janela flexível: em vez de marcar 18h, a pessoa marca uma faixa entre 17h30 e 19h e confirma até 30 minutos antes, com uma fila de motoristas de reserva por trás. A terceira é o pool de plantão: a própria empresa mantém dois motoristas de sobreaviso na volta, remunerados com um bônus.\n\nO trio escolheu investigar a garantia primeiro, e o motivo foi honesto: é a que testa a dor de forma mais limpa. Se a promessa de plano B não destravar ninguém, as outras duas provavelmente também não destravam, e o ramo inteiro cai por terra antes de virar código.",
                },
            ],
            questions: [
                {
                    statement: "Na árvore do Caronaê, o que fica no topo da estrutura?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O outcome do ciclo, com número e prazo definidos",
                            isCorrect: true,
                        },
                        {
                            text: "As soluções candidatas que o time pretende construir",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de features pedidas pelos clientes nas entrevistas",
                            isCorrect: false,
                        },
                        {
                            text: "Os testes de suposição que o trio vai rodar na semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Alguém sugeriu pendurar 'gamificação de caronas' como ramo da árvore. Por que o trio não pendurou?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não existe cartão de entrevista sustentando esse ramo",
                            isCorrect: true,
                        },
                        {
                            text: "Gamificação é uma técnica ultrapassada em produtos de 2026",
                            isCorrect: false,
                        },
                        {
                            text: "A árvore do time já tinha atingido o limite de quatro ramos",
                            isCorrect: false,
                        },
                        {
                            text: "Só o PM pode propor oportunidades novas dentro da árvore",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O ramo da desconfiança tirou nota 3 em gravidade e nota 1 em capacidade. O que essa nota baixa significa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Atacar isso depende de jurídico e RH das 12 empresas",
                            isCorrect: true,
                        },
                        {
                            text: "A dor apareceu em poucas entrevistas e por isso vale pouco",
                            isCorrect: false,
                        },
                        {
                            text: "O problema não tem relação com a primeira carona completa",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma solução possível foi imaginada para esse ramo ainda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o trio gerou três soluções concorrentes para o ramo do horário, em vez de detalhar só a garantia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Solução única costuma ser decisão tomada antes da evidência",
                            isCorrect: true,
                        },
                        {
                            text: "Times de discovery precisam entregar três opções ao cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Três soluções permitem dividir o trabalho entre os três papéis",
                            isCorrect: false,
                        },
                        {
                            text: "A diretoria exige alternativas antes de aprovar qualquer verba",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O trio escolheu investigar a garantia de volta antes das outras duas soluções do mesmo ramo. Qual foi o argumento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "É a que testa a dor de forma mais limpa e barata",
                            isCorrect: true,
                        },
                        {
                            text: "É a mais simples de implementar no aplicativo existente",
                            isCorrect: false,
                        },
                        {
                            text: "É a única das três que as empresas clientes já aprovaram",
                            isCorrect: false,
                        },
                        {
                            text: "É a que apareceu com mais frequência nas seis entrevistas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Suposições e testes",
            blocks: [
                {
                    type: "text",
                    value: "# O que precisa ser verdade pra garantia funcionar\n\nA solução escolhida cabe em uma frase: se a sua carona de volta cair, o Caronaê paga o seu transporte por aplicativo até um teto. Frase curta, e embaixo dela um monte de coisa que o time está torcendo pra ser verdade sem ter checado nenhuma.\n\nEsse é o momento em que a maioria dos times pula direto pro Figma. O trio fez o contrário: sentou por quarenta minutos e listou toda suposição que sustenta a garantia, nas quatro famílias de risco do Marty Cagan. DESEJABILIDADE (alguém quer isso), USABILIDADE (as pessoas entendem e conseguem usar), VIABILIDADE TÉCNICA (dá pra construir e operar) e VIABILIDADE DE NEGÓCIO (o dinheiro fecha).\n\nO exercício tem uma regra que evita autoengano: escreva cada suposição como afirmação que pode ser FALSA. Não vale 'entender se as pessoas gostam da garantia'. Vale 'o medo de ficar na mão é o principal motivo do abandono, e a promessa de reembolso destrava a primeira carona'. Escrita assim, dá pra olhar pra frase e perguntar quanta evidência existe atrás dela. Quase sempre, a resposta é bem menos do que parecia na reunião.",
                },
                {
                    type: "code",
                    value: "MAPA DE SUPOSICOES: garantia de volta\nSe a carona de volta cair, o Caronae paga o transporte por app\n\n  DESEJABILIDADE\n    S1. o medo de ficar na mao e o que trava a primeira carona\n        importancia: alta      evidencia: media (4 das 6 entrevistas)\n    S2. a promessa de reembolso e suficiente pra pessoa agendar\n        importancia: alta      evidencia: nenhuma\n\n  USABILIDADE\n    S3. a pessoa entende a regra da garantia sem ler manual\n        importancia: media     evidencia: nenhuma\n    S4. a pessoa consegue acionar o reembolso no momento do aperto\n        importancia: alta      evidencia: nenhuma\n\n  VIABILIDADE TECNICA\n    S5. da pra detectar a carona que caiu sem alguem conferir na mao\n        importancia: media     evidencia: media (log ja existe)\n    S6. da pra reembolsar sem virar planilha do financeiro\n        importancia: media     evidencia: baixa\n\n  VIABILIDADE DE NEGOCIO\n    S7. o custo do reembolso cabe no teto do contrato da empresa\n        importancia: alta      evidencia: nenhuma\n    S8. a garantia nao vira desculpa pra motorista cancelar mais\n        importancia: media     evidencia: nenhuma\n\n  QUADRANTE PERIGOSO (muito importante, pouca evidencia)\n    S2, S4, S7\n    ordem de ataque: S2, depois S7, depois S4",
                },
                {
                    type: "text",
                    value: "## Importância no eixo de cima, evidência no de baixo\n\nCom as oito suposições na mesa, o trio jogou cada uma num plano de dois eixos: importância (se essa for falsa, a solução inteira cai?) e evidência (o quanto já sabemos hoje). O canto de cima à esquerda, muito importante e pouca evidência, é o quadrante que mata projeto. É lá que o time investe tempo de teste, e só lá.\n\nTrês suposições caíram nesse canto. S2, que a promessa de reembolso é suficiente pra pessoa agendar: se for falsa, a solução não destrava nada. S7, que o custo cabe no contrato: se for falsa, a solução funciona e quebra a conta. S4, que a pessoa consegue acionar o reembolso no aperto: se for falsa, a promessa existe no papel e falha na hora que importa.\n\nRepare no que ficou de fora e por quê. S5 e S6 são risco técnico com evidência razoável, porque o log de cancelamento já existe e a engenharia disse na cara que o reembolso é um problema conhecido. Nada disso significa que S5 e S6 são verdade; significa que testar elas primeiro seria gastar semana com o risco errado.",
                },
                {
                    type: "table",
                    value: '[["Teste desenhado","Risco atacado","Critério de sucesso"],["Banner da garantia, 200 inativos","Valor","15% clicam e 8% agendam"],["Concierge em 1 empresa, 14 dias","Negócio","Custo médio até 12 reais"],["Ler a regra em voz alta, 5 pessoas","Usabilidade","4 de 5 explicam sem ajuda"],["Spike de reembolso automático","Técnico","Fluxo em pé em 3 dias de dev"]]',
                },
                {
                    type: "quote",
                    value: "Suposição importante sem evidência é dívida escondida. Cedo ela custa uma semana de teste; tarde ela custa um trimestre de código.",
                },
                {
                    type: "text",
                    value: "## Os dois primeiros testes, com critério escrito antes\n\nO teste 1 ataca S2 e é ridiculamente barato. O RH manda uma mensagem para 200 funcionários cadastrados e inativos com a promessa da garantia escrita em uma linha, e um botão pra agendar a volta da semana. Critério combinado ANTES de disparar: pelo menos 15% clicam e 8% agendam. Abaixo disso, o time trata como sinal fraco e volta pra árvore.\n\nO teste 2 ataca S7 e é um concierge clássico, aquilo que também chamam de wizard of oz. Numa empresa cliente, por duas semanas, a garantia é anunciada de verdade e operada na mão: quando a carona cai, a pessoa manda mensagem no grupo, alguém do trio pede o carro por aplicativo e o financeiro reembolsa por fora. Nada de código. O que se mede é quantas vezes a garantia é acionada e quanto custa cada acionamento.\n\nPor que não construir a feature pra testar? Porque a feature levaria seis semanas de time e responderia as mesmas duas perguntas que uma mensagem e uma planilha respondem em quinze dias. Construir é o jeito mais caro que existe de descobrir que a suposição era falsa.",
                },
            ],
            questions: [
                {
                    statement:
                        "A suposição 'o custo do reembolso cabe no teto do contrato' pertence a qual das quatro famílias de risco?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Viabilidade de negócio, porque trata da conta fechar",
                            isCorrect: true,
                        },
                        {
                            text: "Viabilidade técnica, porque exige integração de pagamento",
                            isCorrect: false,
                        },
                        {
                            text: "Usabilidade, porque a pessoa precisa entender a regra do teto",
                            isCorrect: false,
                        },
                        {
                            text: "Desejabilidade, porque mede o quanto o usuário quer aquilo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual quadrante do mapa de suposições concentrou os testes do Caronaê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Muita importância e pouca evidência acumulada",
                            isCorrect: true,
                        },
                        {
                            text: "Muita importância e muita evidência já acumulada no time",
                            isCorrect: false,
                        },
                        {
                            text: "Pouca importância e pouca evidência, por serem mais baratos",
                            isCorrect: false,
                        },
                        {
                            text: "Pouca importância e muita evidência, por serem mais rápidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O trio deixou de testar 'dá pra detectar a carona que caiu' logo de início. Qual foi a razão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Já existe evidência técnica razoável sustentando essa parte",
                            isCorrect: true,
                        },
                        {
                            text: "Risco técnico nunca precisa ser testado em ciclo de discovery",
                            isCorrect: false,
                        },
                        {
                            text: "A engenharia se recusou a participar dos testes desse ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Essa suposição não afeta em nada o resultado final da solução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No teste do banner, o time definiu 15% de clique e 8% de agendamento antes de disparar. Por que definir antes?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem critério prévio, qualquer número vira boa notícia depois",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a ferramenta de disparo exige as metas no cadastro",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o RH da empresa cliente precisa aprovar cada número",
                            isCorrect: false,
                        },
                        {
                            text: "Porque critério definido antes dispensa rodar o segundo teste",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um dev sugeriu construir a garantia de verdade em seis semanas para então medir o uso. Qual é o furo dessa proposta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Gasta seis semanas pra responder o que quinze dias respondem",
                            isCorrect: true,
                        },
                        {
                            text: "Código em produção não gera dado confiável sobre comportamento",
                            isCorrect: false,
                        },
                        {
                            text: "O time não teria autorização das empresas para lançar a feature",
                            isCorrect: false,
                        },
                        {
                            text: "Testes de concierge devem sempre vir depois da versão construída",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento do ciclo",
            blocks: [
                {
                    type: "text",
                    value: "# Um teste passou, o outro derrubou a solução\n\nQuinze dias depois, os dois resultados na mesa. O teste do banner foi bem acima do combinado: dos 200 inativos, 19% clicaram e 11% agendaram uma volta na mesma semana. O critério era 15% e 8%. Nenhuma dúvida sobre o que isso diz: o medo de ficar na mão é real, ele estava mesmo travando gente, e a promessa de plano B destrava.\n\nO concierge contou outra história. Em 14 dias, numa empresa com 61 caronas de volta agendadas, a garantia foi acionada 23 vezes. Custo médio por acionamento: 31 reais. Fazendo a conta simples, isso dá mais de 700 reais em duas semanas numa empresa só, contra um teto de contrato que não chega perto disso quando você multiplica por 12 clientes.\n\nA leitura do trio foi cirúrgica e vale gravar: a OPORTUNIDADE está confirmada, a SOLUÇÃO não se paga. São duas conclusões diferentes, e confundir as duas é o erro mais caro dessa etapa. Quem mistura joga fora o ramo inteiro por causa de uma implementação ruim, e volta pra estaca zero sem precisar.",
                },
                {
                    type: "table",
                    value: '[["Teste","Critério","Resultado","Veredito"],["Banner, 200 inativos","15% e 8%","19% e 11%","Passou"],["Concierge, custo","Até 12 reais","31 reais por vez","Reprovou"],["Concierge, frequência","Até 15%","23 de 61 caronas","Reprovou"],["Ramo do horário de volta","Confirmar a dor","Confirmada nos dois","Mantido"]]',
                },
                {
                    type: "quote",
                    value: "Oportunidade confirmada com solução reprovada não é ciclo fracassado. É o ciclo funcionando, e cobrando barato pelo aprendizado.",
                },
                {
                    type: "text",
                    value: "## Pivotar a solução sem trocar o ramo\n\nA decisão saiu na mesma reunião: mantém o outcome, mantém o ramo do horário imprevisível, troca a solução. Sai a garantia de volta com reembolso, entra a janela flexível de confirmação até 30 minutos antes, com fila de motoristas de reserva por trás.\n\nO raciocínio é direto. A dor que o banner comprovou é a incerteza de conseguir voltar. A garantia atacava essa incerteza comprando uma corrida, ou seja, resolvendo com custo variável a cada acionamento. A janela flexível ataca a mesma incerteza mudando o compromisso: em vez de prometer dinheiro quando falha, ela reduz a chance de falhar. Custo variável perto de zero, e o próprio Diego já fazia isso na mão com o Fábio, combinando por fora.\n\nA garantia não foi apagada da árvore. Ela virou solução reprovada por custo, com o número na frente, e continua pendurada no mesmo ramo. Se um dia o contrato mudar de formato ou o volume de cancelamento cair muito, ela volta pra fila com contexto. Isso é o valor de manter o registro: o time do ano que vem não vai gastar quinze dias descobrindo de novo o que este descobriu.",
                },
                {
                    type: "code",
                    value: "REGISTRO DE APRENDIZADO, ciclo 07, semana 14\n\n  OUTCOME\n    ativacao em 60 dias, de 11% para 25%\n\n  OPORTUNIDADE\n    meu horario de volta e imprevisivel\n\n  SOLUCAO INVESTIGADA\n    garantia de volta com reembolso de transporte por app\n\n  HIPOTESE (S2)\n    a promessa de plano B faz o cadastrado inativo agendar\n      teste: banner para 200 inativos, criterio 15% clique e 8% agenda\n      resultado: 19% de clique, 11% de agendamento\n      leitura: confirmada, a dor trava e a promessa destrava\n\n  HIPOTESE (S7)\n    o custo do reembolso cabe no teto do contrato\n      teste: concierge em 1 empresa por 14 dias, criterio 12 reais\n      resultado: 23 acionamentos em 61 caronas, 31 reais em media\n      leitura: refutada, custo variavel estoura a margem\n\n  DECISAO\n    manter outcome e oportunidade, trocar de solucao\n    entra: janela flexivel com confirmacao ate 30 min antes\n    sai: garantia com reembolso (reprovada por custo, nao por valor)\n\n  PROXIMA SUPOSICAO NA FILA\n    a fila de reserva cobre o cancelamento em menos de 10 minutos\n      teste previsto: concierge na mesma empresa, 2 semanas\n\n  ENTREVISTAS DA SEMANA QUE VEM\n    2 com quem agendou pelo banner e nao completou a carona\n    1 com motorista que cancelou volta nos ultimos 30 dias",
                },
                {
                    type: "text",
                    value: "## O ciclo não termina, ele recomeça\n\nNa segunda-feira seguinte, nada de reunião de encerramento. O trio já tinha três entrevistas marcadas, a árvore ganhou a anotação do que foi reprovado e a próxima suposição estava na fila, com teste desenhado. Esse é o ponto inteiro do discovery contínuo que a Teresa Torres defende: não é um estudo com relatório final, é um hábito semanal de contato com quem usa.\n\nOlhando o ciclo de trás pra frente: um outcome de comportamento, seis entrevistas em uma semana, cartões virando oportunidades na voz do usuário, uma árvore com quatro ramos, uma escolha registrada por escrito com o que ficou de fora, três soluções concorrentes, um mapa de suposições, dois testes baratos com critério antes, e uma decisão que mudou a solução sem perder o aprendizado. Duas semanas e meia. Zero linha de código na feature investigada.\n\nO que você leva disso pro seu trabalho não é o caso do Caronaê. É a sequência, e principalmente a disciplina de perguntar, toda vez que alguém propuser construir algo grande: o que precisa ser verdade pra isso funcionar, e qual é o jeito mais barato de descobrir ainda esta semana?",
                },
            ],
            questions: [
                {
                    statement:
                        "O banner bateu 19% de clique e 11% de agendamento, acima do critério. O que esse resultado confirma?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que a dor da volta imprevisível trava mesmo a ativação",
                            isCorrect: true,
                        },
                        {
                            text: "Que a garantia de volta deve ser construída pelo time agora",
                            isCorrect: false,
                        },
                        {
                            text: "Que o custo do reembolso cabe no teto do contrato vendido",
                            isCorrect: false,
                        },
                        {
                            text: "Que o problema de ativação estava só no texto da comunicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O concierge mostrou 23 acionamentos em 61 caronas e custo médio de 31 reais. O que o trio decidiu?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Trocar de solução mantendo o mesmo ramo da árvore",
                            isCorrect: true,
                        },
                        {
                            text: "Abandonar o ramo do horário e voltar para outra oportunidade",
                            isCorrect: false,
                        },
                        {
                            text: "Construir a garantia assim mesmo e renegociar o contrato depois",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir o concierge por mais quatro semanas antes de decidir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a janela flexível com fila de reserva ataca a mesma dor sem o problema de custo da garantia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela reduz a chance de falhar em vez de pagar pela falha",
                            isCorrect: true,
                        },
                        {
                            text: "Ela transfere o custo do reembolso para o motorista do carro",
                            isCorrect: false,
                        },
                        {
                            text: "Ela resolve uma dor diferente, que é a desconfiança do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Ela dispensa qualquer teste, por ter sido validada no concierge",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um gerente disse que o ciclo foi perdido, já que a solução principal caiu. Como você responde com o registro na mão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A oportunidade ficou confirmada e o erro custou duas semanas",
                            isCorrect: true,
                        },
                        {
                            text: "O ciclo foi perdido mesmo, e o time precisa recomeçar do zero",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado do banner já autoriza construir a garantia completa",
                            isCorrect: false,
                        },
                        {
                            text: "A culpa é da amostra pequena, que invalidou os dois resultados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A garantia foi reprovada, mas continua pendurada no ramo com o número do custo ao lado. Qual é o ganho disso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Se o contrato mudar, ela volta com contexto já medido",
                            isCorrect: true,
                        },
                        {
                            text: "A árvore precisa manter todas as soluções já pensadas pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "Soluções reprovadas contam como entrega no relatório do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar o registro impede que outro time proponha algo parecido",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

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
