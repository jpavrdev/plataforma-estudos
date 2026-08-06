// Seed da trilha Ágil e Delivery na Prática, estagio 2 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-agil-e-delivery.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Ágil e Delivery na Prática";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "Scrum como o guia manda e como a vida cobra: papéis, eventos e artefatos de verdade, o Product Backlog com histórias bem escritas, Kanban e métricas de fluxo, previsibilidade sem teatro, os anti-padrões que todo time repete e um sprint completo na cadeira do PO. A base direta da certificação PSPO.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Por que ágil",
    aulas: [
        {
            titulo: "O mundo que criou o ágil",
            blocks: [
                {
                    type: "text",
                    value: '# O custo de descobrir tarde\n\nImagina o cenário clássico dos anos 90, que ainda acontece em 2026: um banco contrata um sistema, o time passa quatro meses escrevendo um documento de requisitos de 300 páginas, mais seis meses desenvolvendo, mais dois testando. Um ano depois, o cliente vê o sistema funcionando pela primeira vez e diz a frase que assombra a profissão: "não era isso que eu pedi".\n\nEsse é o modelo cascata: fases sequenciais (requisitos, design, implementação, testes, entrega), cada uma só começa quando a anterior termina. No papel, parece organizado. Na prática, ele aposta tudo numa premissa falsa: a de que dá para especificar corretamente, no início, algo que ninguém nunca viu funcionando.\n\nO problema não é falta de disciplina, é a estrutura do feedback. Em cascata, o aprendizado mais valioso (o usuário usando o produto) chega no final, quando mudar é caríssimo. Cada mês sem feedback real é um mês acumulando risco invisível. O ágil nasceu como resposta a essa matemática: encurtar brutalmente a distância entre fazer e descobrir se aquilo tem valor.',
                },
                {
                    type: "table",
                    value: '[["Aspecto","Cascata","Iterativo e incremental"],["Feedback do usuário","No final, após a entrega","A cada ciclo curto"],["Custo de mudar","Cresce a cada fase concluída","Baixo, o plano espera mudar"],["Risco","Acumula invisível até o fim","Exposto e reduzido cedo"],["Primeira versão usável","Meses ou anos depois","Semanas depois"],["Premissa","Dá para especificar tudo antes","Vamos aprender fazendo"]]',
                },
                {
                    type: "quote",
                    value: "O maior risco de um projeto de software não é atrasar. É entregar, no prazo, uma coisa que ninguém precisa.",
                },
                {
                    type: "text",
                    value: "## Iterativo e incremental, as duas pernas\n\nA alternativa tem dois nomes que andam juntos mas não são a mesma coisa. INCREMENTAL significa entregar em fatias: em vez do sistema inteiro no final, uma parte usável agora, outra depois. ITERATIVO significa revisitar: a fatia entregue volta para a mesa, recebe feedback e melhora na rodada seguinte.\n\nDá para ser incremental sem ser iterativo (entregar fatias e nunca revisar nada, só empilhar) e iterativo sem ser incremental (refinar protótipos para sempre sem entregar nada usável). Os métodos ágeis combinam os dois: entrega uma fatia pequena que funciona, observa o que o uso real ensina, ajusta o plano e entrega a próxima.\n\nRepara no que isso muda para o negócio. Se o projeto for cancelado no meio, sobra um produto parcial funcionando, não uma pilha de documentos. Se o mercado mudar, o plano muda no ciclo seguinte, não na renegociação do contrato. E se a ideia era ruim, você descobre gastando um mês, não um ano. Essa é a aposta econômica do ágil, e é por ela que vale julgar qualquer método.",
                },
            ],
            questions: [
                {
                    statement:
                        "No modelo cascata, quando o cliente costuma ver o sistema funcionando pela primeira vez?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só no final, depois de todas as fases concluídas",
                            isCorrect: true,
                        },
                        {
                            text: "Logo na fase de requisitos, em protótipos semanais",
                            isCorrect: false,
                        },
                        {
                            text: "No meio do projeto, na revisão formal de design",
                            isCorrect: false,
                        },
                        {
                            text: "A cada fase, em demonstrações parciais obrigatórias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre entregar de forma incremental e de forma iterativa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Incremental entrega em fatias; iterativo revisa com feedback",
                            isCorrect: true,
                        },
                        {
                            text: "Incremental é para software novo; iterativo é para hardware",
                            isCorrect: false,
                        },
                        {
                            text: "Incremental exige sprints; iterativo exige fases sequenciais",
                            isCorrect: false,
                        },
                        {
                            text: "São sinônimos, os dois descrevem o mesmo ciclo de entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time entrega o produto em fatias mensais, mas nunca revisa nada com base no uso: só empilha as fatias planejadas. O que falta a esse time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Iteração: usar o feedback das fatias para ajustar o plano",
                            isCorrect: true,
                        },
                        {
                            text: "Incremento: dividir o trabalho em partes ainda menores",
                            isCorrect: false,
                        },
                        {
                            text: "Documentação: registrar formalmente o escopo de cada fatia",
                            isCorrect: false,
                        },
                        {
                            text: "Velocidade: fatias mensais são longas demais para o ágil",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o custo de mudança cresce tanto ao longo de um projeto em cascata?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada fase concluída vira retrabalho quando o rumo muda",
                            isCorrect: true,
                        },
                        {
                            text: "Os contratos de cascata proíbem mudanças após a assinatura",
                            isCorrect: false,
                        },
                        {
                            text: "As equipes de cascata são maiores e mais caras por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "As ferramentas antigas do modelo dificultam qualquer edição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um patrocinador argumenta: 'com um bom documento de requisitos, o cascata funciona'. Qual é a falha estrutural que esse argumento ignora?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ninguém especifica bem o que nunca viu funcionando",
                            isCorrect: true,
                        },
                        {
                            text: "Documentos longos custam caro demais para escrever",
                            isCorrect: false,
                        },
                        {
                            text: "Requisitos só podem ser escritos pelo time técnico",
                            isCorrect: false,
                        },
                        {
                            text: "Analistas de requisitos ficaram raros no mercado atual",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O Manifesto lido com atenção",
            blocks: [
                {
                    type: "text",
                    value: '# Dezessete pessoas e quatro frases\n\nEm 2001, dezessete profissionais que já praticavam métodos leves (Scrum, XP e outros) se reuniram numa estação de esqui em Utah e escreveram o Manifesto Ágil: quatro valores e doze princípios. O texto envelheceu bem justamente porque não prescreve ferramenta nenhuma, prescreve prioridades.\n\nOs quatro valores têm uma estrutura que quase todo mundo cita errado: "indivíduos e interações MAIS QUE processos e ferramentas", "software funcionando MAIS QUE documentação abrangente", "colaboração com o cliente MAIS QUE negociação de contratos", "responder a mudanças MAIS QUE seguir um plano". E logo abaixo, a frase que o mercado adora esquecer: "mesmo havendo valor nos itens à direita, valorizamos MAIS os itens à esquerda".\n\nOu seja: o Manifesto não manda jogar fora processo, documentação, contrato e plano. Ele diz o que ganha quando os dois lados brigam. Time que usa "somos ágeis" para não documentar nada e não planejar nada não leu o rodapé. Time que trava entrega esperando documento perfeito leu só o lado direito. A leitura correta é um critério de desempate, não uma lista de proibições.',
                },
                {
                    type: "table",
                    value: '[["Valorizamos mais","Sem abandonar","O desempate na prática"],["Indivíduos e interações","Processos e ferramentas","Processo serve ao time, não o contrário"],["Software funcionando","Documentação abrangente","A medida de progresso é o produto no ar"],["Colaboração com o cliente","Negociação de contratos","Contrato existe, mas a conversa decide"],["Responder a mudanças","Seguir um plano","Plano existe, e muda quando aprendemos"]]',
                },
                {
                    type: "quote",
                    value: 'O Manifesto diz "mais que", não "em vez de". Quem apaga essa diferença transforma uma escala de prioridades numa desculpa para o caos.',
                },
                {
                    type: "text",
                    value: '## Os princípios que sustentam tudo\n\nDos doze princípios, alguns carregam o peso do resto e merecem memória. "Nossa maior prioridade é satisfazer o cliente através da entrega contínua e adiantada de software com valor": entrega cedo não é pressa, é estratégia de aprendizado. "Mudanças de requisitos são bem-vindas, mesmo tarde no desenvolvimento": a mudança deixa de ser falha de planejamento e vira matéria-prima. "Software funcionando é a medida primária de progresso": não slides, não percentual de cronograma, não relatório de status.\n\nTem também os princípios incômodos, que os times pulam. "Simplicidade, a arte de maximizar a quantidade de trabalho NÃO feito, é essencial": dizer não é parte do método. "Em intervalos regulares, o time reflete sobre como se tornar mais eficaz e ajusta seu comportamento": sem esse, os outros onze viram decoração.\n\nQuando alguém te apresentar uma prática "ágil", teste contra os princípios: ela encurta o caminho até o feedback? Ela permite mudar de rumo barato? Se a resposta for não para as duas, o nome está emprestado.',
                },
            ],
            questions: [
                {
                    statement: "Qual leitura dos quatro valores do Manifesto está correta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os dois lados têm valor; a esquerda vence no desempate",
                            isCorrect: true,
                        },
                        {
                            text: "O lado direito deve ser eliminado dos projetos ágeis",
                            isCorrect: false,
                        },
                        {
                            text: "Cada time escolhe um dos quatro valores para seguir",
                            isCorrect: false,
                        },
                        {
                            text: "Os valores só se aplicam a times que usam Scrum puro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Segundo os princípios do Manifesto, qual é a medida primária de progresso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Software funcionando entregue ao usuário",
                            isCorrect: true,
                        },
                        {
                            text: "O percentual concluído do cronograma",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de documentação aprovada",
                            isCorrect: false,
                        },
                        {
                            text: "O número de tarefas fechadas no quadro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um dev diz: 'somos ágeis, então não documentamos nada'. O que essa postura erra em relação ao Manifesto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trata 'mais que' como 'em vez de': o lado direito tem valor",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o Manifesto de fato proíbe documentação nos times",
                            isCorrect: false,
                        },
                        {
                            text: "Erra só o meio: a documentação deveria virar vídeo curto",
                            isCorrect: false,
                        },
                        {
                            text: "Erra a autoria: essa decisão caberia apenas ao gerente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O cliente pede uma mudança grande faltando três semanas para o marco. Qual resposta reflete os princípios ágeis?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Acolher a mudança e renegociar o plano com transparência",
                            isCorrect: true,
                        },
                        {
                            text: "Recusar: mudanças tardias violam o processo combinado",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar sem discutir prazo, porque o cliente sempre manda",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar o pedido para a próxima versão anual do plano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O princípio da simplicidade fala em 'maximizar a quantidade de trabalho não feito'. O que isso significa na gestão de um produto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cortar o que não gera valor, dizendo não a boa parte das ideias",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir a jornada de trabalho semanal do time e evitar desgaste",
                            isCorrect: false,
                        },
                        {
                            text: "Automatizar as tarefas repetitivas para o time produzir mais",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar os itens mais complexos por último na fila de entrega",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Empirismo: o motor por trás do Scrum",
            blocks: [
                {
                    type: "text",
                    value: "# Decidir com base no que aconteceu\n\nExistem dois jeitos de controlar um processo. O controle DEFINIDO serve quando as entradas e saídas são previsíveis: uma linha de montagem, uma receita de bolo. Você planeja tudo, executa igual e o resultado sai igual. O controle EMPÍRICO serve quando há mais desconhecido que conhecido: você decide com base no que já aconteceu, em ciclos curtos de experimento e observação. Desenvolvimento de produto é o segundo caso, e insistir em tratá-lo como o primeiro é a origem de boa parte dos fracassos.\n\nO empirismo se apoia em três pilares. TRANSPARÊNCIA: o processo e o trabalho precisam estar visíveis para quem executa e para quem recebe, senão a inspeção olha para uma ficção. INSPEÇÃO: olhar com frequência para o trabalho e para o progresso rumo às metas, procurando desvios. ADAPTAÇÃO: quando a inspeção revela um desvio, ajustar o quanto antes, seja o produto, seja o processo. Os três são sequenciais e dependentes: sem transparência a inspeção engana, e inspeção sem adaptação é reunião perdida.",
                },
                {
                    type: "table",
                    value: '[["Pilar","Pergunta que responde","Exemplo no dia a dia"],["Transparência","Todos veem a mesma realidade?","Backlog visível, DoD clara, progresso real no quadro"],["Inspeção","Estamos nos desviando da meta?","Olhar o incremento na Review, o fluxo na Daily"],["Adaptação","O que muda a partir do desvio?","Reordenar o backlog, mudar o processo na Retro"]]',
                },
                {
                    type: "quote",
                    value: "Inspeção sem adaptação é teatro. Se nada muda depois de olhar, você não inspecionou: só assistiu.",
                },
                {
                    type: "text",
                    value: '## Scrum é empirismo embalado\n\nAqui está o segredo que destrava o resto da trilha: o Scrum não é um conjunto de reuniões, é o empirismo embalado em eventos e artefatos. Cada evento existe para forçar um ciclo de inspeção e adaptação que, sem estrutura, os times adiariam para sempre. A Sprint cria a cadência. A Daily inspeciona o progresso rumo à meta da Sprint e adapta o plano do dia. A Review inspeciona o incremento com os stakeholders e adapta o Product Backlog. A Retrospective inspeciona o próprio time e adapta o jeito de trabalhar.\n\nE os artefatos existem para dar transparência: o Product Backlog torna visível o que se pretende, o Sprint Backlog torna visível o plano corrente, o incremento torna visível o que de fato existe.\n\nEssa lente muda como você avalia qualquer prática. A pergunta nunca é "estamos fazendo a reunião?", é "essa reunião gerou inspeção de algo transparente e produziu adaptação?". Quando a resposta é não, o time tem a casca do Scrum sem o motor, e é exatamente esse o assunto da aula sobre ágil de mentira.',
                },
            ],
            questions: [
                {
                    statement: "Quais são os três pilares do empirismo em que o Scrum se apoia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Transparência, inspeção e adaptação, nessa ordem",
                            isCorrect: true,
                        },
                        {
                            text: "Planejamento, execução e controle de qualidade",
                            isCorrect: false,
                        },
                        {
                            text: "Velocidade, qualidade e entrega no prazo combinado",
                            isCorrect: false,
                        },
                        {
                            text: "Coragem, hierarquia e disciplina de processo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para que tipo de trabalho o controle empírico é mais indicado que o definido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Trabalho com mais desconhecido do que conhecido",
                            isCorrect: true,
                        },
                        {
                            text: "Trabalho repetitivo com resultado previsível",
                            isCorrect: false,
                        },
                        {
                            text: "Trabalho manual executado por uma pessoa só",
                            isCorrect: false,
                        },
                        {
                            text: "Trabalho regulado por contratos de longo prazo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time esconde os bugs conhecidos do quadro para 'não assustar o gestor'. Qual pilar foi ferido primeiro, e com que efeito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Transparência: a inspeção passa a olhar para uma ficção",
                            isCorrect: true,
                        },
                        {
                            text: "Adaptação: o time deixou de fazer a reunião de melhoria",
                            isCorrect: false,
                        },
                        {
                            text: "Inspeção: o gestor deveria auditar o quadro toda semana",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: proteger o gestor de detalhes técnicos é saudável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a relação correta entre o Scrum e o empirismo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os eventos e artefatos estruturam os ciclos do empirismo",
                            isCorrect: true,
                        },
                        {
                            text: "O empirismo substitui os eventos quando o time amadurece",
                            isCorrect: false,
                        },
                        {
                            text: "São independentes: o Scrum funciona sem pilar nenhum",
                            isCorrect: false,
                        },
                        {
                            text: "O empirismo vale só para o PO; o time segue o plano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time faz Retrospective toda sprint, gera boas discussões, mas nada muda no jeito de trabalhar há seis meses. Qual é o diagnóstico empírico?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Há inspeção sem adaptação: o ciclo empírico está quebrado",
                            isCorrect: true,
                        },
                        {
                            text: "Falta transparência: as discussões deveriam ser gravadas",
                            isCorrect: false,
                        },
                        {
                            text: "O evento está longo demais: retros devem durar dez minutos",
                            isCorrect: false,
                        },
                        {
                            text: "Está tudo bem: seis meses estáveis provam maturidade do time",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ágil de mentira",
            blocks: [
                {
                    type: "text",
                    value: '# A casca sem o motor\n\nO cenário é tão comum que virou piada interna da profissão: a empresa "virou ágil" ano passado. Tem Daily às 9h15, tem quadro colorido, tem sprint de duas semanas, tem post-it. E tem também um cronograma de doze meses fechado no contrato, requisitos congelados no PDF de 2024 e um gerente que cobra status na Daily. Nada do que o time aprende muda qualquer decisão. Isso tem nome: cargo cult, o culto à forma sem a função.\n\nO padrão mais frequente é a cascata com sprint: o projeto continua sendo uma sequência fixa de fases com escopo e prazo travados, só que picada em pedaços de duas semanas com nomes do Scrum. As "sprints" ali não são ciclos de aprendizado, são parcelas de um cronograma. A Review não decide nada, porque o que vem depois já está decidido. A Retrospective produz post-its que ninguém relê.\n\nO custo é duplo: a empresa paga o preço do processo (reuniões, papéis novos, treinamento) sem receber o benefício (redução de risco por feedback), e o time conclui, com razão aparente, que "esse tal de ágil não funciona".',
                },
                {
                    type: "table",
                    value: '[["Sinal observável","Ágil de fachada","Ágil funcionando"],["Review com stakeholders","Demo ensaiada, backlog intacto","Feedback muda a ordem do backlog"],["Daily","Status report para o chefe","Developers replanejam o dia entre si"],["Escopo do trimestre","Congelado no contrato","Renegociado quando algo é aprendido"],["Retrospective","Post-its arquivados","Uma melhoria concreta por ciclo"],["Erro descoberto","Procura-se um culpado","Vira ajuste de produto ou processo"]]',
                },
                {
                    type: "quote",
                    value: 'O teste do ágil de verdade cabe numa pergunta: "o que mudou na última vez que vocês aprenderam algo?". Se a resposta for "nada", o resto é figurino.',
                },
                {
                    type: "text",
                    value: '## O teste do "o que muda?"\n\nPara diagnosticar um time sem assistir a uma reunião sequer, faça perguntas sobre mudança. Quando a Review revelou que os usuários odiaram uma funcionalidade, o que aconteceu com o backlog? Quando o time descobriu que a estimativa estava furada, o que aconteceu com o plano? Quando a Retro apontou que o deploy manual causava erros, o que foi feito? Respostas concretas indicam empirismo funcionando; respostas do tipo "registramos a sugestão" indicam teatro.\n\nRepara que o diagnóstico não é sobre pessoas más. Quase sempre é um sistema de incentivos: o contrato pune mudança de escopo, o bônus do gestor depende do cronograma original, a cultura pune quem expõe problema. Adotar os eventos do Scrum sem mexer nesses incentivos produz exatamente a fachada, porque as pessoas respondem ao que é cobrado, não ao que é cerimonizado.\n\nGuarda essa lente para o módulo de anti-padrões: lá você vai ver as formas específicas que essa fachada assume (feature factory, scrumfall, PO proxy) e, mais importante, por onde começar a desmontá-la.',
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza o chamado cargo cult ágil?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Adotar os rituais sem mudar como as decisões são tomadas",
                            isCorrect: true,
                        },
                        {
                            text: "Adotar métodos ágeis apenas nos times de tecnologia",
                            isCorrect: false,
                        },
                        {
                            text: "Fazer sprints mais curtas do que o guia do Scrum recomenda",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar consultoria externa para treinar o time todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual pergunta é o melhor teste rápido para saber se um time é ágil de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O que mudou na última vez que vocês aprenderam algo?",
                            isCorrect: true,
                        },
                        {
                            text: "Quantas cerimônias vocês fazem por semana no time?",
                            isCorrect: false,
                        },
                        {
                            text: "Qual ferramenta de quadro digital o time utiliza?",
                            isCorrect: false,
                        },
                        {
                            text: "Há quanto tempo o time pratica sprints de duas semanas?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um projeto tem fases fixas de análise, desenvolvimento e testes, escopo travado em contrato, mas trabalha em 'sprints' quinzenais. Como descrever isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cascata fatiada: as sprints são parcelas de cronograma",
                            isCorrect: true,
                        },
                        {
                            text: "Scrum maduro: fases claras dão previsibilidade ao time",
                            isCorrect: false,
                        },
                        {
                            text: "Kanban puro: o fluxo contínuo substituiu as iterações",
                            isCorrect: false,
                        },
                        {
                            text: "XP na prática: contratos fixos são a base do método",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na Review, os usuários rejeitaram a funcionalidade apresentada, e o time seguiu o plano original sem tocar no backlog. Qual é o problema central?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O feedback não gerou adaptação: a Review virou teatro",
                            isCorrect: true,
                        },
                        {
                            text: "A Review teve gente demais: usuários não deveriam ir",
                            isCorrect: false,
                        },
                        {
                            text: "O time errou ao apresentar algo que podia ser rejeitado",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: manter o plano demonstra foco e disciplina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa adotou todos os eventos do Scrum, mas o bônus dos gestores segue atrelado ao cumprimento do cronograma original. O que tende a acontecer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A fachada ágil: as pessoas respondem ao incentivo, não ao rito",
                            isCorrect: true,
                        },
                        {
                            text: "A transição completa: eventos bem feitos mudam a cultura sozinhos",
                            isCorrect: false,
                        },
                        {
                            text: "A melhora imediata dos prazos: rituais aceleram qualquer entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Nada de especial: bônus e processo são assuntos independentes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Quando ágil não é a resposta",
            blocks: [
                {
                    type: "text",
                    value: '# Honestidade metodológica\n\nEssa aula existe para te vacinar contra o vendedor de método. Ágil é uma resposta a um problema específico: incerteza alta sobre o que tem valor. Quando esse problema não existe, insistir no método é dogma, e dogma é justamente o que o Manifesto veio combater.\n\nPrimeiro caso: contexto fortemente regulado com validação externa obrigatória. Um firmware de marcapasso ou um sistema de freio precisa de especificação formal, rastreabilidade e certificação por órgão regulador antes de qualquer uso. Dá para usar iterações internas no desenvolvimento, claro, mas o ciclo "entrega em produção a cada duas semanas e aprende com o usuário" simplesmente não se aplica ao produto final. O custo de um erro em campo não é um bug report, é uma vida.\n\nSegundo caso: escopo realmente fixo e conhecido. Migrar 400 relatórios de um sistema legado para outro, com regras claras e resultado binário (bate ou não bate), é um problema de execução, não de descoberta. Cadência e limites de trabalho ajudam; Review quinzenal com stakeholder para "validar direção" é encenação, porque não há direção a descobrir.',
                },
                {
                    type: "table",
                    value: '[["Contexto","O que pesa contra o ágil pleno","O que ainda ajuda"],["Regulado (saúde, aviação)","Certificação externa antes do uso","Iterações internas, integração contínua"],["Escopo fixo e binário","Nada relevante a descobrir","Kanban, WIP limitado, entregas parciais"],["Fornecedor preço fechado","Contrato pune a mudança","Contratos por fase, escopo negociável"],["Produto novo, mercado incerto","Nada: é o caso ideal","Scrum completo, feedback real"]]',
                },
                {
                    type: "quote",
                    value: "Método é ferramenta, não identidade. O profissional sério escolhe a abordagem depois de entender o problema, nunca antes.",
                },
                {
                    type: "text",
                    value: '## O caso do fornecedor e a saída adulta\n\nO terceiro caso é o mais comum no Brasil: projeto de fornecedor com escopo e preço fechados em contrato. O cliente comprou "o sistema X por Y reais até dezembro". Nesse arranjo, responder a mudanças (o quarto valor do Manifesto) é prejuízo direto para o fornecedor: cada aprendizado que altera o escopo vira aditivo contratual e briga comercial. Fazer Scrum de fachada por cima não resolve o conflito, só o esconde.\n\nA saída adulta não é fingir agilidade, é renegociar o arranjo quando possível (contratos por fase, escopo variável com orçamento fixo, cláusulas de troca item por item) ou aceitar o jogo e usar o que serve: cadência, transparência de progresso, entregas parciais para reduzir o risco de integração.\n\nA regra geral que fecha o módulo: quanto mais incerteza sobre O QUE tem valor, mais o empirismo paga o seu custo; quanto mais o problema é executar um escopo já conhecido, mais um bom fluxo (que você vai estudar no módulo de Kanban) vale sozinho. Saber dizer "aqui, ágil pleno não paga" é sinal de maturidade, não de heresia.',
                },
            ],
            questions: [
                {
                    statement: "Para qual tipo de problema o ágil foi desenhado como resposta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Incerteza alta sobre o que de fato tem valor",
                            isCorrect: true,
                        },
                        {
                            text: "Falta de disciplina nas equipes de tecnologia",
                            isCorrect: false,
                        },
                        {
                            text: "Custo elevado de infraestrutura e ferramentas",
                            isCorrect: false,
                        },
                        {
                            text: "Excesso de documentação nos órgãos públicos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num projeto de migração de 400 relatórios com regras claras e resultado binário, o que uma Review quinzenal para 'validar direção' tende a ser?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Encenação, porque não há direção nova a descobrir",
                            isCorrect: true,
                        },
                        {
                            text: "Essencial, porque toda entrega exige feedback de rumo",
                            isCorrect: false,
                        },
                        {
                            text: "Obrigatória por contrato em projetos de migração",
                            isCorrect: false,
                        },
                        {
                            text: "Útil só se durar mais de duas horas por encontro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num firmware de dispositivo médico com certificação externa obrigatória, qual é o limite real do ágil?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Entregar em produção a cada ciclo curto não se aplica",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: basta contratar um Scrum Master experiente",
                            isCorrect: false,
                        },
                        {
                            text: "Iterações internas são proibidas pelos reguladores",
                            isCorrect: false,
                        },
                        {
                            text: "O time não pode usar quadros nem integração contínua",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que Scrum de fachada não resolve o conflito de um contrato de escopo e preço fechados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O contrato segue punindo mudança; o rito só esconde isso",
                            isCorrect: true,
                        },
                        {
                            text: "Porque fornecedores não têm permissão para usar Scrum",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o cliente sempre rejeita cerimônias quinzenais",
                            isCorrect: false,
                        },
                        {
                            text: "Resolve, desde que as sprints tenham duração de uma semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sua consultoria vai propor abordagem para dois projetos: um produto novo em mercado incerto e uma migração de escopo fixo e binário. Qual proposta demonstra critério?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Empirismo pleno no produto; fluxo com cadência na migração",
                            isCorrect: true,
                        },
                        {
                            text: "Scrum completo nos dois, porque padronizar sempre reduz custo",
                            isCorrect: false,
                        },
                        {
                            text: "Cascata nos dois, porque contratos exigem fases bem definidas",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar cada dev escolher o método que preferir usar no dia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Scrum de verdade (Guia 2020)",
    aulas: [
        {
            titulo: "O esqueleto do Scrum",
            blocks: [
                {
                    type: "text",
                    value: '# Um time só, três responsabilidades\n\nO Guia do Scrum 2020 descreve um framework propositalmente incompleto: define poucas regras e deixa o resto por conta de quem usa. A unidade fundamental é o Scrum Team, um time único, normalmente de dez pessoas ou menos, sem sub-times e sem hierarquia interna. Não existe "o time de dev" de um lado e "o PO" do outro: é um time só, focado num objetivo de produto por vez.\n\nDentro dele há três accountabilities, e a palavra importa. Até a versão de 2017 o guia falava em papéis, o que o mercado leu como cargo e crachá. Em 2020 o texto passou a falar em accountabilities, ou seja, responsabilidades assumidas por alguém do time. O Product Owner responde por maximizar o valor. O Scrum Master responde pela eficácia do Scrum. Os Developers respondem por criar um incremento utilizável a cada Sprint.\n\nO time é cross-functional: reúne todas as habilidades necessárias para transformar uma ideia em incremento sem depender de aprovação externa a cada passo. E é auto-gerenciado: decide internamente quem faz o quê, quando e como. Isso não é regalia, é condição para o empirismo funcionar, porque quem inspeciona precisa poder adaptar.',
                },
                {
                    type: "table",
                    value: '[["Accountability","Responde por","Erro comum de leitura"],["Product Owner","Maximizar o valor do produto","Virar analista de requisitos do time"],["Scrum Master","Eficácia do Scrum dentro e fora","Virar secretário de reunião e quadro"],["Developers","Um incremento utilizável por Sprint","Virar apenas quem escreve código"],["Time inteiro","Entregar valor a cada Sprint","Virar grupo de especialistas isolados"]]',
                },
                {
                    type: "quote",
                    value: "Scrum não distribui cargos, distribui responsabilidades. Quem procura crachá no Guia 2020 encontra só uma lista de compromissos.",
                },
                {
                    type: "text",
                    value: "## Auto-gerenciamento não é anarquia\n\nAuto-gerenciamento tem fronteiras claras, e conhecê-las evita duas caricaturas. O time decide COMO o trabalho é feito, quem pega o quê e em que sequência dentro da Sprint. O Product Owner decide O QUE entra e em que ordem no Product Backlog. A organização define o entorno: orçamento, restrições legais, padrões de arquitetura e segurança. Nada disso vira negociável só porque o time é auto-gerenciado.\n\nNa vida real, a fronteira mais atacada é a primeira. Um gerente funcional continua distribuindo tarefas nominalmente e o time vira executor com nome novo. Outro sintoma é o PO que monta o Sprint Backlog no lugar dos Developers: quanto cabe e como fazer não é decisão dele.\n\nVale a leitura crítica: o guia descreve o time ideal e cala sobre o caminho até ele. Um time recém-formado, sem uma habilidade essencial dentro de casa, não vira auto-gerenciado por decreto. Nesse caso o Scrum Master tem trabalho concreto de médio prazo: tornar a dependência visível, negociar a habilidade que falta e reduzir a distância entre o time real e o time descrito no guia. Fingir que a fronteira já existe só produz cerimônia.",
                },
            ],
            questions: [
                {
                    statement:
                        "Segundo o Guia do Scrum 2020, quantas accountabilities existem dentro do Scrum Team?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Três: Product Owner, Scrum Master e Developers",
                            isCorrect: true,
                        },
                        {
                            text: "Duas: Product Owner e time de desenvolvimento",
                            isCorrect: false,
                        },
                        {
                            text: "Quatro: PO, Scrum Master, Developers e gerente",
                            isCorrect: false,
                        },
                        {
                            text: "Cinco, uma para cada evento formal do framework",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o tamanho típico de um Scrum Team segundo o guia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dez pessoas ou menos, sem sub-times internos",
                            isCorrect: true,
                        },
                        {
                            text: "Vinte pessoas divididas em três sub-times",
                            isCorrect: false,
                        },
                        {
                            text: "Sem limite: depende do tamanho do projeto todo",
                            isCorrect: false,
                        },
                        {
                            text: "Exatamente sete pessoas, mais ou menos duas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um gerente funcional continua distribuindo nominalmente as tarefas da Sprint para cada dev. O que isso fere?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Auto-gerenciamento: o time decide quem faz o quê",
                            isCorrect: true,
                        },
                        {
                            text: "Timebox: distribuir tarefas atrasa a Daily do time",
                            isCorrect: false,
                        },
                        {
                            text: "Transparência: as tarefas deveriam ficar ocultas",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: designar tarefas é função de qualquer gestor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O Product Owner monta o Sprint Backlog sozinho e define como cada item será implementado. O que está errado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como fazer e quanto cabe é decisão dos Developers",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o PO é o dono de todos os artefatos do time",
                            isCorrect: false,
                        },
                        {
                            text: "O erro é o PO participar da Sprint Planning inteira",
                            isCorrect: false,
                        },
                        {
                            text: "O Scrum Master é quem deveria montar esse artefato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time novo depende de outra área para publicar qualquer mudança. Qual é o trabalho do Scrum Master aqui?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Tornar a dependência visível e negociar a habilidade",
                            isCorrect: true,
                        },
                        {
                            text: "Declarar o time auto-gerenciado e seguir com a cadência",
                            isCorrect: false,
                        },
                        {
                            text: "Assumir o deploy sozinho, sem avisar a outra área",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar o Scrum até a empresa reorganizar as áreas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Os eventos e seus timeboxes",
            blocks: [
                {
                    type: "text",
                    value: "# A Sprint é o contêiner\n\nOs eventos do Scrum não são reuniões avulsas: são oportunidades formais de inspeção e adaptação, e cada um existe para impedir que o time adie uma decisão. A Sprint é o contêiner que abriga todos os outros. Dura no máximo um mês, começa assim que a anterior termina e não há intervalo entre elas. Durante a Sprint, ninguém faz mudança que ameace o Sprint Goal, o escopo pode ser renegociado entre PO e Developers conforme o time aprende, e a qualidade não cai.\n\nSprint mais curta significa mais ciclos de feedback por trimestre e menos risco por ciclo, ao custo de mais tempo gasto em eventos. Duas semanas viraram padrão de mercado por equilibrar as duas coisas, mas o guia não obriga nada além do teto de um mês.\n\nUm ponto que quase toda prova cobra: só o Product Owner tem autoridade para cancelar uma Sprint, e isso acontece quando o Sprint Goal se torna obsoleto, seja porque o mercado virou, a lei mudou ou o produto pivotou. Não é ferramenta de punição por atraso, é o reconhecimento de que continuar seria desperdício puro.",
                },
                {
                    type: "table",
                    value: '[["Evento","Teto numa Sprint de um mês","Para que serve"],["Sprint","Até um mês","Conter o ciclo inteiro de inspeção"],["Sprint Planning","Até 8 horas","Definir por que, o que e como"],["Daily Scrum","15 minutos, todo dia","Replanejar o trabalho rumo ao Sprint Goal"],["Sprint Review","Até 4 horas","Inspecionar o incremento com stakeholders"],["Sprint Retrospective","Até 3 horas","Inspecionar o time e escolher melhoria"]]',
                },
                {
                    type: "quote",
                    value: "Timebox não é meta de duração, é teto. Planning que acaba em duas horas com o Sprint Goal claro cumpriu o evento inteiro.",
                },
                {
                    type: "text",
                    value: "## Os três tópicos da Planning e o dono da Daily\n\nA Sprint Planning responde a três perguntas, nessa ordem. POR QUE esta Sprint é valiosa: o PO propõe como o produto pode aumentar de valor e o time formula o Sprint Goal junto. O QUE pode ser entregue: os Developers escolhem, conversando com o PO, os itens do Product Backlog que cabem. COMO o trabalho será feito: os Developers decompõem os itens, e essa parte é só deles.\n\nA Daily Scrum é dos Developers, dura 15 minutos e serve para inspecionar o progresso rumo ao Sprint Goal e ajustar o plano do dia. PO e Scrum Master participam apenas se forem Developers naquela Sprint. O formato das três perguntas deixou de ser regra em 2020: o time escolhe a estrutura, desde que o evento produza replanejamento de verdade.\n\nA Sprint Review não é demonstração ensaiada: é sessão de trabalho em que time e stakeholders inspecionam o incremento e ajustam o Product Backlog. Se o backlog sai igual como entrou, houve teatro. A Retrospective fecha a Sprint olhando para pessoas, interações, processo e ferramentas, e sai de lá com uma melhoria escolhida.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o timebox da Daily Scrum?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quinze minutos por dia, em qualquer tamanho de Sprint",
                            isCorrect: true,
                        },
                        {
                            text: "Uma hora por dia, com o Scrum Master conduzindo a pauta",
                            isCorrect: false,
                        },
                        {
                            text: "Trinta minutos por dia, apenas nas Sprints de um mês",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo que o time precisar para alinhar o dia todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o timebox máximo da Sprint Planning numa Sprint de um mês?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Oito horas, e menos se a Sprint for mais curta",
                            isCorrect: true,
                        },
                        {
                            text: "Quatro horas, independentemente do tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Um dia inteiro de trabalho, sempre com o gestor",
                            isCorrect: false,
                        },
                        {
                            text: "Não existe teto: dura até o plano ficar pronto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O mercado virou e o Sprint Goal ficou obsoleto no meio da Sprint. Quem tem autoridade para cancelar a Sprint?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Apenas o Product Owner, e só ele tem essa autoridade",
                            isCorrect: true,
                        },
                        {
                            text: "O Scrum Master, por ser o guardião do processo do time",
                            isCorrect: false,
                        },
                        {
                            text: "Os Developers, por votação da maioria simples do time",
                            isCorrect: false,
                        },
                        {
                            text: "Ninguém: toda Sprint precisa chegar até o fim dela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A Review acabou, os stakeholders deram vários feedbacks e o Product Backlog saiu exatamente igual. O que isso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A Review virou demonstração: não houve adaptação",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o backlog só pode mudar na Sprint Planning",
                            isCorrect: false,
                        },
                        {
                            text: "O time acertou: manter o plano mostra disciplina",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou stakeholder: só o PO deveria opinar ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa Daily, o gerente pede status individual de cada dev e distribui tarefas novas. Qual correção é fiel ao Guia 2020?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A Daily é dos Developers para replanejar o dia",
                            isCorrect: true,
                        },
                        {
                            text: "Manter o status, mas reduzir para dez minutos",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a Daily por um relatório escrito diário",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar o Scrum Master responder pelo time todo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Artefatos e compromissos",
            blocks: [
                {
                    type: "text",
                    value: "# Três artefatos, três compromissos\n\nO Guia 2020 trouxe uma simetria que ajuda a memorizar e, melhor ainda, a entender. Cada artefato do Scrum carrega um compromisso, e o compromisso existe para dar transparência e servir de foco para a inspeção.\n\nO Product Backlog é a lista ordenada e emergente de tudo que pode melhorar o produto. É a única fonte do trabalho assumido pelo time. Seu compromisso é o Product Goal: o objetivo de longo prazo que o time persegue, um por vez.\n\nO Sprint Backlog é composto de três coisas: o Sprint Goal (por quê), os itens selecionados para a Sprint (o quê) e o plano de entrega (como). É dos Developers, atualizado por eles ao longo da Sprint. Seu compromisso é o Sprint Goal, o objetivo único que dá coerência à Sprint inteira.\n\nO Increment é um degrau concreto rumo ao Product Goal. Pode haver vários numa mesma Sprint, e ele existe de verdade só quando atende à Definition of Done. Trabalho que não atende à DoD não é incremento: não é apresentado na Review e volta para o Product Backlog, por mais pronto que pareça na máquina de quem escreveu.",
                },
                {
                    type: "table",
                    value: '[["Artefato","Compromisso","Quem responde por ele"],["Product Backlog","Product Goal","Product Owner"],["Sprint Backlog","Sprint Goal","Developers"],["Increment","Definition of Done","Developers"]]',
                },
                {
                    type: "code",
                    value: "# Definition of Done do time (vale para TODO item, sem exceção)\n\n- [ ] Código revisado por outra pessoa e integrado na branch principal\n- [ ] Testes automatizados escritos e suíte verde no CI\n- [ ] Nenhuma regressão conhecida aberta no fluxo tocado\n- [ ] Documentação de API e changelog atualizados\n- [ ] Feature flag configurada e versão publicada em homologação\n- [ ] Log de erro e métrica do fluxo novo em produção\n- [ ] Item aceito pelo Product Owner na sessão de aceite\n\n# Regra: se um item não marca tudo, ele NÃO entra na Review\n# e volta para o Product Backlog com o que falta explícito.",
                },
                {
                    type: "quote",
                    value: "Toda vez que alguém pergunta se está pronto, a única resposta profissional é outra pergunta: atende à Definition of Done?",
                },
                {
                    type: "text",
                    value: "## A DoD é da organização, não do humor do dia\n\nSe a organização já tem uma Definition of Done padrão, o time precisa segui-la no mínimo: pode endurecer, nunca afrouxar. Se não existe padrão, os Developers criam a sua. E ela é uma só. Não existe DoD por item nem DoD que muda quando o prazo aperta, porque nesse instante ela deixa de ser régua e vira desculpa.\n\nDuas leituras críticas fecham o assunto. A primeira: o guia diz que o incremento precisa ser utilizável, não que precisa estar publicado para o usuário final. Publicar é decisão de negócio do PO; estar pronto para publicar é obrigação do time. A segunda: uma DoD honesta expõe fragilidade. Times que não conseguem cumprir a própria DoD costumam reagir enfraquecendo o texto, quando o caminho é atacar o gargalo real, seja teste manual demorado, ambiente instável ou revisão que trava por dias.\n\nNa prática, a DoD é o contrato de qualidade que impede a dívida técnica de virar entrega invisível. Ela é o que separa um incremento de uma promessa bem intencionada.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o compromisso associado ao Product Backlog?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O Product Goal, o objetivo de longo prazo do produto",
                            isCorrect: true,
                        },
                        {
                            text: "A Definition of Done acordada por toda a organização",
                            isCorrect: false,
                        },
                        {
                            text: "O Sprint Goal definido na Planning pelo time todo",
                            isCorrect: false,
                        },
                        {
                            text: "A velocidade média registrada nas últimas Sprints",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O Sprint Backlog é composto por quais três elementos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sprint Goal, itens selecionados e plano de entrega",
                            isCorrect: true,
                        },
                        {
                            text: "Product Goal, roadmap anual e lista de tarefas fixas",
                            isCorrect: false,
                        },
                        {
                            text: "Itens do backlog, estimativas e o prazo final",
                            isCorrect: false,
                        },
                        {
                            text: "Definition of Done, incremento e relatório final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um item ficou sem os testes automatizados que a DoD exige. O que fazer na Sprint Review?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não apresentar o item: ele não é incremento ainda",
                            isCorrect: true,
                        },
                        {
                            text: "Apresentar e registrar a pendência como dívida técnica",
                            isCorrect: false,
                        },
                        {
                            text: "Apresentar: a DoD vale apenas para itens grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao PO uma exceção na DoD para esta Sprint",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A organização já tem uma Definition of Done padrão. O que o time pode fazer com ela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Seguir no mínimo, podendo endurecer, nunca afrouxar",
                            isCorrect: true,
                        },
                        {
                            text: "Ignorar e criar a própria, mais adequada ao time novo",
                            isCorrect: false,
                        },
                        {
                            text: "Afrouxar quando o prazo da Sprint ficar apertado",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar só aos itens que o Product Owner escolher",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Há três Sprints o time não cumpre a própria DoD e agora propõe remover o item de testes automatizados dela. Qual leitura é correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Enfraquecer a DoD esconde o gargalo em vez de tratar",
                            isCorrect: true,
                        },
                        {
                            text: "Correto: a DoD deve refletir o que o time consegue hoje",
                            isCorrect: false,
                        },
                        {
                            text: "A DoD é do Scrum Master: ele decide o que sai dela",
                            isCorrect: false,
                        },
                        {
                            text: "Basta trocar a DoD a cada Sprint conforme o escopo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O Product Owner por dentro",
            blocks: [
                {
                    type: "text",
                    value: "# Uma pessoa, não um comitê\n\nO Guia 2020 é direto num ponto que a maioria das empresas ignora: o Product Owner é UMA PESSOA, não um comitê. Ele pode representar as necessidades de muitos stakeholders dentro do Product Backlog, e quem quiser mudar a ordem dos itens precisa convencê-lo, não passar por cima dele. Para o Product Owner ter sucesso, a organização inteira precisa respeitar as decisões dele, e essas decisões ficam visíveis no conteúdo e na ordenação do backlog.\n\nA responsabilidade central é maximizar o valor do produto resultante do trabalho do Scrum Team. Isso se desdobra em quatro deveres concretos: desenvolver e comunicar explicitamente o Product Goal, criar e comunicar com clareza os itens do Product Backlog, ordenar esses itens e garantir que o backlog seja transparente, visível e compreendido por todos.\n\nAqui entra a distinção que separa PO de despachante: ele PODE delegar o trabalho, e outra pessoa escreve a história, refina o critério ou faz a pesquisa, mas ele permanece responsável pelo resultado. Delegar tarefa é gestão de tempo; delegar responsabilidade é abandonar o posto.",
                },
                {
                    type: "table",
                    value: '[["Situação real","Como fica sem PO único","O que o guia pede"],["Ordem do backlog","Comitê vota a cada mês","Uma pessoa decide e explica"],["Pedido de diretor","Entra na frente pelo cargo","Entra se o PO ordenar assim"],["Escrita das histórias","Ninguém assume de fato","PO delega o trabalho e responde"],["Product Goal","Cada área tem o seu","Um objetivo por vez, comunicado"]]',
                },
                {
                    type: "quote",
                    value: "O Product Owner pode delegar o trabalho de escrever o backlog. A responsabilidade pelo resultado não tem para onde ser delegada.",
                },
                {
                    type: "text",
                    value: "## O PO que a vida cobra\n\nNa prática, o posto costuma vir com três distorções. A primeira é o PO sem autoridade: ele monta e ordena o backlog, mas qualquer diretor reordena por e-mail, e o sintoma é o backlog mudar sem conversa. A segunda é o PO sem tempo: acumula três produtos, aparece na Planning e some, e os Developers passam a adivinhar critério de aceite. A terceira é o PO virado analista: escreve especificação detalhada, some da conversa e o time perde o porquê.\n\nO contraveneno tem duas partes. A primeira é tornar a decisão visível: se o pedido do diretor entrou na frente, isso aparece na ordem do backlog e é dito na Review, junto com o custo do que foi adiado. A segunda é proteger o tempo do PO para o que ninguém faz por ele: falar com usuário, medir resultado e decidir o que não será feito.\n\nVale a leitura crítica: o guia descreve a autoridade do PO como um dado, e nenhuma empresa entrega isso pronto. Conquistar essa autoridade é trabalho político de meses, sustentado por decisões que depois se mostraram boas.",
                },
            ],
            questions: [
                {
                    statement: "Segundo o Guia do Scrum 2020, o que é o Product Owner?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma pessoa, que pode representar vários stakeholders",
                            isCorrect: true,
                        },
                        {
                            text: "Um comitê formado por representantes de cada diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "O gerente de produto que fica acima do Scrum Team",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer Developer que assuma o posto na Sprint",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a responsabilidade central do Product Owner?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Maximizar o valor do produto gerado pelo time",
                            isCorrect: true,
                        },
                        {
                            text: "Garantir que os Developers cumpram o prazo",
                            isCorrect: false,
                        },
                        {
                            text: "Facilitar os eventos e remover os impedimentos",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever a documentação técnica do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um diretor manda e-mail reordenando o Product Backlog por cima do PO. Qual resposta segue o Guia 2020?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A ordem é decisão do PO; o diretor precisa convencê-lo",
                            isCorrect: true,
                        },
                        {
                            text: "O diretor tem cargo maior, então a ordem dele prevalece",
                            isCorrect: false,
                        },
                        {
                            text: "O Scrum Master decide o desempate entre os dois lados",
                            isCorrect: false,
                        },
                        {
                            text: "Os Developers reordenam o backlog durante a Planning",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O PO delega a escrita das histórias para uma analista do time. Isso é permitido pelo guia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sim: pode delegar o trabalho, mas responde por ele",
                            isCorrect: true,
                        },
                        {
                            text: "Não: só o PO pode encostar em qualquer artefato",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, e a responsabilidade toda passa para a analista",
                            isCorrect: false,
                        },
                        {
                            text: "Só com autorização formal do Scrum Master antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um PO cuida de três produtos, aparece só na Planning e depois some. Qual é o efeito mais provável no time?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os Developers passam a adivinhar critério de aceite",
                            isCorrect: true,
                        },
                        {
                            text: "O time ganha autonomia e entrega mais rápido sempre",
                            isCorrect: false,
                        },
                        {
                            text: "O Scrum Master assume o backlog e vira o novo PO",
                            isCorrect: false,
                        },
                        {
                            text: "Nada muda: o backlog escrito basta para o time",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Os valores do Scrum",
            blocks: [
                {
                    type: "text",
                    value: "# Cinco palavras que sustentam o resto\n\nComprometimento, foco, abertura, respeito e coragem. O Guia 2020 diz algo forte sobre esses cinco valores: quando eles são incorporados pelo time, os pilares do empirismo ganham vida e constroem confiança. Sem confiança, transparência vira exposição perigosa, inspeção vira auditoria e adaptação vira briga por culpa.\n\nCOMPROMETIMENTO é com a meta, não com uma lista. O time se compromete com o Sprint Goal e com apoiar uns aos outros, não com entregar todos os itens selecionados aconteça o que acontecer. FOCO é concentrar-se no trabalho da Sprint para progredir rumo à meta, e é o valor mais atacado pelo dia a dia de interrupções.\n\nABERTURA é o time e os stakeholders serem abertos sobre o trabalho e sobre os desafios, inclusive os desconfortáveis. RESPEITO é tratar as pessoas como capazes e independentes, o que na prática significa não passar por cima de decisão que não é sua. CORAGEM é fazer a coisa certa e trabalhar em problemas difíceis, e ela aparece menos no discurso e mais nas conversas incômodas que ninguém queria puxar.",
                },
                {
                    type: "table",
                    value: '[["Valor","Como aparece numa decisão real","Sinal de que falta"],["Comprometimento","Time protege o Sprint Goal sob pressão","Promete escopo que sabe não caber"],["Foco","Recusa tarefa fora da meta da Sprint","Todo mundo em cinco frentes ao mesmo tempo"],["Abertura","Diz na Review que a hipótese falhou","Demo maquiada e problema escondido"],["Respeito","PO aceita o quanto cabe segundo o time","Gerente reatribui tarefas por cima"],["Coragem","Alguém diz que a estimativa é fantasia","Silêncio na Planning e surpresa no fim"]]',
                },
                {
                    type: "quote",
                    value: "Os cinco valores não são cartaz de parede. Eles se medem no que o time faz quando dizer a verdade custa caro para quem diz.",
                },
                {
                    type: "text",
                    value: "## Onde os valores decidem o dia\n\nPega uma Sprint qualquer e observe três momentos. Na Planning, os Developers percebem que o volume proposto não cabe. Coragem é dizer isso na hora; abertura é explicar o porquê com dados; respeito é o PO aceitar o limite em vez de negociar por cansaço. O resultado prático é um Sprint Goal em que todo mundo acredita, e isso vale mais que dois itens a mais no plano.\n\nNo meio da Sprint chega um pedido urgente de outra área. Foco é perguntar se aquilo ajuda o Sprint Goal; comprometimento é proteger a meta; abertura é registrar o pedido e discutir com o PO em vez de aceitar por baixo do pano.\n\nNa Retrospective, alguém precisa dizer que a revisão de código está travando tudo há semanas. Coragem de novo, e respeito de quem escuta sem levar para o lado pessoal. Repara no padrão: os valores não são decoração moral, são o que torna o empirismo possível. Time sem eles cumpre o calendário do Scrum e não colhe quase nada dele.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os cinco valores do Scrum?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Comprometimento, foco, abertura, respeito e coragem",
                            isCorrect: true,
                        },
                        {
                            text: "Transparência, inspeção, adaptação, foco e disciplina",
                            isCorrect: false,
                        },
                        {
                            text: "Velocidade, qualidade, custo, prazo e escopo fixo",
                            isCorrect: false,
                        },
                        {
                            text: "Disciplina, hierarquia, método, ordem e controle",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Com o que exatamente o Scrum Team se compromete numa Sprint?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Com o Sprint Goal e com apoiar uns aos outros",
                            isCorrect: true,
                        },
                        {
                            text: "Com entregar todos os itens selecionados",
                            isCorrect: false,
                        },
                        {
                            text: "Com a data de release combinada para o trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Com a velocidade média das Sprints passadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na Planning, os Developers percebem que o volume proposto não cabe e ficam calados. Qual valor faltou primeiro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Coragem: dizer o que é incômodo na hora certa",
                            isCorrect: true,
                        },
                        {
                            text: "Foco: a Planning deveria durar bem menos tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Respeito: o PO merecia um plano mais ousado",
                            isCorrect: false,
                        },
                        {
                            text: "Comprometimento: aceitar tudo mostra empenho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Chega um pedido urgente de outra área no meio da Sprint. Qual reação combina foco e abertura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Checar se ajuda o Sprint Goal e discutir com o PO",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar em silêncio para não criar atrito na área",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar sem explicar nada: a Sprint é intocável",
                            isCorrect: false,
                        },
                        {
                            text: "Encaixar escondido e avisar só na Review depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time cumpre todos os eventos do Scrum, mas ninguém fala dos problemas reais. O que o Guia 2020 diz sobre esse caso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem os valores vividos, os pilares não sustentam nada",
                            isCorrect: true,
                        },
                        {
                            text: "Basta cumprir os eventos: o resto vem com o tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Os valores são opcionais: cada time escolhe os que quiser",
                            isCorrect: false,
                        },
                        {
                            text: "O Scrum Master deve punir quem esconder problema",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - O Product Backlog",
    aulas: [
        {
            titulo: "O backlog vivo",
            blocks: [
                {
                    type: "text",
                    value: "# Ordenado, emergente e enxuto\n\nO Product Backlog não é uma lista de pedidos, é a ordem de trabalho do time. Três adjetivos definem o que ele precisa ser. EMERGENTE: nunca está completo, cresce e muda conforme o produto e o mercado ensinam. ORDENADO: existe uma sequência do primeiro ao último item, e não um agrupamento em prioridade alta, média e baixa. ENXUTO o bastante para alguém olhar o topo e entender o que vem pela frente.\n\nA diferença entre ordenar e etiquetar parece detalhe e não é. Uma lista com quarenta itens marcados como alta prioridade não decide nada: quando dois competem pelo mesmo dia, alguém decide no corredor, sem critério registrado. Uma lista ordenada obriga a decisão difícil antes da pressão. Se dois itens são igualmente importantes, um deles ainda assim fica em segundo, e a conversa que resolve isso é justamente o valor do artefato.\n\nO terceiro adjetivo é o mais ignorado. Backlog de quatrocentos itens é cemitério: ninguém lê, ninguém remove, e o custo de procurar algo ali passa a ser maior que o custo de escrever tudo de novo.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Backlog cemitério","Backlog vivo"],["Tamanho","Centenas de itens antigos","Topo detalhado, cauda curta"],["Ordem","Etiquetas alta, média e baixa","Sequência do primeiro ao último"],["Itens do topo","Vagos, sem critério de aceite","Prontos para entrar na Sprint"],["Itens do fim","Nunca revisados","Ideias grossas, sem detalhe"],["Limpeza","Nada sai nunca da lista","Item parado seis meses é removido"]]',
                },
                {
                    type: "quote",
                    value: "Backlog com quatrocentos itens não é riqueza de ideias, é dívida de decisão. Cada item que ninguém vai puxar rouba atenção de quem procura o que importa.",
                },
                {
                    type: "text",
                    value: "## O topo é diferente do fim\n\nUm backlog saudável tem granularidade decrescente. Os itens do topo, que entram nas próximas uma ou duas Sprints, são pequenos, entendidos e com critérios de aceite claros. No meio ficam itens médios que ainda vão ser fatiados. No fim, ideias grossas do tipo repensar o onboarding, que não merecem uma hora de refinamento hoje porque podem nunca ser feitas.\n\nDetalhar demais o que está longe é desperdício puro: quando aquele item chegar ao topo, o contexto terá mudado e boa parte do detalhe será jogada fora. É o mesmo erro do documento de trezentas páginas, só que parcelado em cartões.\n\nPara ordenar, o critério prático combina três forças: valor esperado para o usuário e para o negócio, risco ou incerteza que a entrega resolve, e dependência técnica que destrava outros itens. Um item de valor médio que derruba um risco alto costuma ir na frente de um item de valor alto e risco zero, porque aprender cedo economiza dinheiro. E tudo isso é decisão do Product Owner, que ouve todo mundo e depois assume a ordem.",
                },
            ],
            questions: [
                {
                    statement:
                        "O Guia do Scrum diz que o Product Backlog é ordenado. O que isso significa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Existe uma sequência do primeiro ao último item",
                            isCorrect: true,
                        },
                        {
                            text: "Os itens são agrupados em alta, média e baixa urgência",
                            isCorrect: false,
                        },
                        {
                            text: "Os itens ficam em ordem alfabética por título",
                            isCorrect: false,
                        },
                        {
                            text: "Cada área do negócio ordena a própria fatia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um backlog com centenas de itens antigos é um problema?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ninguém lê nem remove, e procurar ali custa caro",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta de gestão cobra por item cadastrado",
                            isCorrect: false,
                        },
                        {
                            text: "O guia proíbe backlogs com mais de cem itens",
                            isCorrect: false,
                        },
                        {
                            text: "Times grandes precisam de listas mais curtas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um PO quer detalhar hoje, com critérios completos, um item previsto para daqui a seis meses. Qual é o problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O contexto muda e boa parte do detalhe será jogada fora",
                            isCorrect: true,
                        },
                        {
                            text: "Detalhar cedo é sempre proibido pelo Guia do Scrum 2020",
                            isCorrect: false,
                        },
                        {
                            text: "Só os Developers podem escrever critério de aceite",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: quanto mais detalhe antes, melhor fica o plano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois itens têm valor parecido, mas um deles derruba uma incerteza técnica grande. Como ordenar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que reduz o risco vai antes, porque aprender cedo paga",
                            isCorrect: true,
                        },
                        {
                            text: "Tanto faz: com valor parecido, a ordem fica aleatória",
                            isCorrect: false,
                        },
                        {
                            text: "O item mais simples primeiro, para ganhar velocidade",
                            isCorrect: false,
                        },
                        {
                            text: "O que o cliente maior pediu, sempre na frente de tudo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um diretor pede que o backlog volte a usar etiquetas de alta, média e baixa no lugar da ordem única. Qual argumento sustenta a ordem?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Etiqueta adia a decisão difícil para a hora da pressão",
                            isCorrect: true,
                        },
                        {
                            text: "Etiqueta é proibida pela ferramenta de backlog usada",
                            isCorrect: false,
                        },
                        {
                            text: "Ordem única existe só para times com mais de dez devs",
                            isCorrect: false,
                        },
                        {
                            text: "Etiqueta funciona bem quando o time já é experiente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Histórias de usuário bem escritas",
            blocks: [
                {
                    type: "text",
                    value: "# O cartão é o começo da conversa\n\nA história de usuário nasceu no Extreme Programming e não faz parte do Guia do Scrum. Ela é uma técnica popular de escrever itens do Product Backlog, e vale a pena justamente porque desloca o foco: em vez de descrever a tela, descreve quem precisa, do quê e para quê.\n\nO formato mais conhecido é como PAPEL, quero AÇÃO, para BENEFÍCIO. O terceiro pedaço é o que o mercado mais corta e o único que não pode faltar, porque é ele que permite ao time propor um jeito melhor de resolver o mesmo problema. Sem o para quê, a história vira ordem de serviço.\n\nRon Jeffries resumiu a técnica em três palavras: cartão, conversa e confirmação. O CARTÃO é um lembrete curto, não uma especificação. A CONVERSA entre PO, Developers e quem entende do negócio é onde o entendimento realmente acontece. A CONFIRMAÇÃO são os critérios de aceite que dizem quando aquilo está resolvido. Time que escreve cartões lindos e pula a conversa reinventou a especificação por outro nome, com a desvantagem de ser mais curta.",
                },
                {
                    type: "code",
                    value: "# Ruim: descreve a tela, não a necessidade\nComo usuário, quero um botão azul na tela de pedidos.\n\n# Melhor: quem, o que e para que\nComo cliente que já fez um pedido,\nquero repetir meu último pedido em um toque,\npara não precisar remontar o carrinho toda semana.\n\n# Fatia fina de valor (pequena e negociável)\nComo cliente,\nquero ver os 3 itens do meu último pedido na home,\npara decidir rápido se repito ou monto outro.\n\n# Não é história: fatia técnica, ninguém de fora percebe ganho\nCriar a tabela de histórico de pedidos no banco.",
                },
                {
                    type: "table",
                    value: '[["Letra","Significa","Pergunta de teste"],["Independent","Independente","Dá para entregar sem esperar outra história?"],["Negotiable","Negociável","O como ainda está aberto para conversa?"],["Valuable","Valiosa","Alguém de fora do time percebe o ganho?"],["Estimable","Estimável","O time consegue dimensionar o esforço?"],["Small","Pequena","Cabe com folga dentro de uma Sprint?"],["Testable","Testável","Dá para dizer com objetividade que ficou pronto?"]]',
                },
                {
                    type: "quote",
                    value: "A história de usuário é um lembrete para conversar, não um contrato para cobrar. Quem transforma o cartão em especificação perde os dois.",
                },
                {
                    type: "text",
                    value: "## INVEST na prática, sem virar burocracia\n\nO acrônimo INVEST é útil quando serve de checklist de dois minutos, e vira burocracia quando o time começa a recusar história por não marcar as seis letras. Duas delas concentram quase todo o valor.\n\nVALIOSA é a que mais separa história de tarefa. Criar a tabela de histórico no banco não é história: ninguém de fora do time percebe ganho nenhum quando ela termina. É trabalho legítimo, mas é parte do como de uma história maior, não um item que o PO ordena por valor.\n\nPEQUENA é a segunda. História que ocupa a Sprint inteira concentra risco: se der errado no oitavo dia, não sobra tempo para reagir e a Sprint termina com nada entregue. A régua prática é caber com folga, deixando espaço para o imprevisto que sempre aparece.\n\nSobre INDEPENDENTE, um aviso honesto: independência total é utopia em produto real. O que se busca é encurtar a corrente de bloqueios, e quando não dá, a dependência precisa estar visível na ordenação, nunca escondida no meio da Sprint.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o formato clássico de uma história de usuário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como papel, quero ação, para obter um benefício",
                            isCorrect: true,
                        },
                        {
                            text: "Dado um estado, quando algo ocorre, então o sistema faz X",
                            isCorrect: false,
                        },
                        {
                            text: "Tela, campo, regra de validação e mensagem",
                            isCorrect: false,
                        },
                        {
                            text: "Título, descrição técnica e prazo de entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa a letra V do INVEST?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Valiosa: alguém de fora do time percebe o ganho",
                            isCorrect: true,
                        },
                        {
                            text: "Versionada: fica registrada no controle de versão",
                            isCorrect: false,
                        },
                        {
                            text: "Validada: o jurídico aprova antes de entrar",
                            isCorrect: false,
                        },
                        {
                            text: "Vertical: corta todas as camadas técnicas do app",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Criar a tabela de histórico de pedidos no banco entrou no backlog como história de usuário. Qual crítica cabe?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não é valiosa sozinha: é parte do como de outra história",
                            isCorrect: true,
                        },
                        {
                            text: "Está correta: todo trabalho técnico também é história",
                            isCorrect: false,
                        },
                        {
                            text: "Falta a estimativa em pontos para o item ser aceito",
                            isCorrect: false,
                        },
                        {
                            text: "Falta o nome do dev responsável pela execução do item",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma única história consome a Sprint inteira do time. Qual é o risco principal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se falhar no dia 8, a Sprint termina sem entrega",
                            isCorrect: true,
                        },
                        {
                            text: "O time perde pontos de velocity naquele período",
                            isCorrect: false,
                        },
                        {
                            text: "A história fica difícil de estimar em horas",
                            isCorrect: false,
                        },
                        {
                            text: "O Product Owner precisa aprovar ela duas vezes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time escreve cartões impecáveis, mas PO e Developers nunca conversam sobre eles. O que se perde?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A conversa, que é onde o entendimento acontece",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: um cartão bem escrito dispensa a conversa",
                            isCorrect: false,
                        },
                        {
                            text: "A estimativa, que só sai em reunião presencial",
                            isCorrect: false,
                        },
                        {
                            text: "O registro formal exigido pela auditoria interna",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Critérios de aceite",
            blocks: [
                {
                    type: "text",
                    value: "# Quando a história está resolvida\n\nCritério de aceite é a resposta combinada para a pergunta: como vamos saber que esta história está resolvida? Ele pertence à história, é escrito antes de o item entrar na Sprint e é conversado, não decretado. Bom critério é concreto o bastante para virar teste e curto o bastante para caber num cartão.\n\nO formato mais útil no dia a dia é o Gherkin leve: DADO um contexto, QUANDO acontece uma ação, ENTÃO o resultado esperado. Ele obriga a escolher um exemplo concreto, e exemplo concreto é o que expõe divergência de entendimento antes do código. Duas pessoas concordam com a frase o sistema deve validar o CPF e discordam violentamente sobre o que acontece quando o CPF é válido mas já está cadastrado.\n\nEscreva também os caminhos que dão errado. Boa parte do retrabalho vem do critério que só cobriu o caminho feliz: o time entrega, o PO testa o cenário de falha e descobre que ninguém pensou nele. Cada cenário de erro escrito antes vale por uma discussão evitada depois.",
                },
                {
                    type: "code",
                    value: "# História\nComo cliente que já fez um pedido,\nquero repetir meu último pedido em um toque,\npara não remontar o carrinho toda semana.\n\n# Critérios de aceite (Gherkin leve)\n\nDADO que tenho um pedido entregue nos últimos 90 dias\nQUANDO abro a home do aplicativo\nENTÃO vejo o botão Repetir pedido com os itens do último pedido\n\nDADO que um item do pedido saiu do cardápio\nQUANDO toco em Repetir pedido\nENTÃO o carrinho monta sem esse item e me avisa qual saiu\n\nDADO que nunca fiz um pedido\nQUANDO abro a home\nENTÃO o botão Repetir pedido não aparece",
                },
                {
                    type: "table",
                    value: '[["Escrito no cartão","É critério de aceite?","Por quê"],["Botão aparece só com pedido recente","Sim","Verificável e ligado ao valor"],["Item fora do cardápio some do carrinho","Sim","Cobre um caminho de erro"],["A tela deve ser bonita e moderna","Não","Ninguém verifica isso com objetividade"],["Ter cobertura de testes automatizados","Não","Isso é Definition of Done"],["Usar Redis para o cache da home","Não","É decisão de como, dos Developers"]]',
                },
                {
                    type: "quote",
                    value: "Critério de aceite bom não descreve a solução, descreve o exemplo concreto que prova que o problema foi resolvido.",
                },
                {
                    type: "text",
                    value: "## O que não é critério de aceite\n\nTrês confusões aparecem em quase todo time. A primeira é enfiar a Definition of Done no critério: ter testes unitários, passar no lint, estar documentado. Isso vale para todos os itens, então não pertence a nenhum em particular. Repetir a DoD em cada cartão só cria ruído e a ilusão de que ela é negociável item a item.\n\nA segunda é escrever decisão técnica como critério: usar Redis, criar índice na tabela. O como é dos Developers, e travar a solução no cartão elimina justamente a chance de alguém propor um caminho melhor. Se existe uma restrição real de arquitetura, ela é uma restrição declarada, não um critério de aceite.\n\nA terceira é o critério não verificável: a tela deve ser intuitiva, a busca deve ser rápida. O teste é simples: duas pessoas conseguem, sozinhas, chegar ao mesmo veredito? Se a resposta é não, transforme em número, como responder em menos de 300 ms no percentil 95, ou tire do cartão de uma vez.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a estrutura do Gherkin leve usado em critérios de aceite?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dado um contexto, quando uma ação, então o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Como um papel, quero uma ação, para obter benefício",
                            isCorrect: false,
                        },
                        {
                            text: "Requisito, restrição, risco e nome do responsável",
                            isCorrect: false,
                        },
                        {
                            text: "Objetivo, escopo, prazo e critério de sucesso claro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando os critérios de aceite de uma história devem ser escritos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Antes de o item entrar na Sprint, na conversa",
                            isCorrect: true,
                        },
                        {
                            text: "Depois da entrega, junto com o teste do PO",
                            isCorrect: false,
                        },
                        {
                            text: "Só na Review, com os stakeholders presentes",
                            isCorrect: false,
                        },
                        {
                            text: "Na Daily, quando o dev pega o item para fazer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Alguém escreveu ter cobertura de testes unitários como critério de aceite de uma história. Onde isso deveria estar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na Definition of Done, que vale para todos os itens",
                            isCorrect: true,
                        },
                        {
                            text: "No critério mesmo: cada item define a qualidade",
                            isCorrect: false,
                        },
                        {
                            text: "No Sprint Goal, que resume o objetivo da Sprint",
                            isCorrect: false,
                        },
                        {
                            text: "No contrato com o cliente, assinado lá no início",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um critério de aceite diz que a busca deve ser rápida. Como consertar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Virar número: responder em 300 ms no percentil 95",
                            isCorrect: true,
                        },
                        {
                            text: "Manter assim: rapidez é sentida pelo usuário",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar por: usar cache Redis na tela de busca",
                            isCorrect: false,
                        },
                        {
                            text: "Mover para a Retrospective como ponto de melhoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O PO escreveu usar Redis para o cache da home entre os critérios de aceite. Por que isso não cabe ali?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O como é dos Developers; isso trava a solução no cartão",
                            isCorrect: true,
                        },
                        {
                            text: "É critério sim, desde que o time domine a ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Redis não é permitido pelo Guia do Scrum em produto",
                            isCorrect: false,
                        },
                        {
                            text: "Critérios técnicos pertencem ao Sprint Backlog inteiro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Refinamento contínuo",
            blocks: [
                {
                    type: "text",
                    value: "# Refinamento não é um evento\n\nO Guia 2020 é claro: refinamento do Product Backlog é uma ATIVIDADE CONTÍNUA, não um evento do Scrum. Não tem timebox oficial, não tem lugar fixo na agenda e não precisa de convite formal. É o trabalho de quebrar itens grandes em menores, acrescentar descrição, ordem e tamanho, até que os itens do topo estejam prontos para entrar numa Sprint.\n\nNa prática, a maioria dos times reserva uma ou duas sessões curtas por Sprint, e isso é escolha do time, não regra do guia. A régua que importa é o resultado: chegar na Planning com os itens do topo entendidos. Se a Planning vira sessão de descoberta, com gente perguntando o que é o item, o refinamento não aconteceu.\n\nQuem participa: o Product Owner e os Developers sempre, mais especialistas de fora quando o assunto pede, como jurídico, atendimento ou segurança. Chamar o time inteiro para refinar tudo é caro; deixar dois devs refinarem sozinhos gera itens que só eles entendem. A referência prática é ter gente suficiente para a conversa valer e pouca gente o bastante para ela render.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Refinamento doente","Refinamento saudável"],["Na Planning","Time descobre o item ali","Time discute quanto cabe"],["Tamanho dos itens","Cada um leva a Sprint toda","Vários cabem com folga"],["Quem participa","Só o PO, sozinho em casa","PO e Developers, mais quem sabe"],["Fatiamento","Por camada: banco, API, tela","Por valor: fatia fina ponta a ponta"],["Duração","Maratona de três horas","Sessões curtas ao longo da Sprint"]]',
                },
                {
                    type: "quote",
                    value: "Se na Sprint Planning as pessoas ainda estão descobrindo o que o item significa, o refinamento não aconteceu. Ele só foi adiado para o pior momento.",
                },
                {
                    type: "code",
                    value: "# Item grande demais\nComo cliente, quero acompanhar meu pedido em tempo real.\n\n# Fatiamento HORIZONTAL (evite): ninguém usa nada até o fim\n1. Criar tabela de eventos de entrega\n2. Criar API de status do pedido\n3. Criar tela de acompanhamento\n\n# Fatiamento VERTICAL (prefira): cada fatia entrega valor\n1. Ver o status atual do pedido em texto na tela de pedidos\n2. Ver o mapa com a posição do entregador\n3. Receber notificação quando o pedido sair para entrega",
                },
                {
                    type: "text",
                    value: "## Fatiar vertical, não por camada\n\nO erro de fatiamento mais comum é dividir por camada técnica: uma história para o banco, outra para a API, outra para a tela. Parece organizado e é uma armadilha, porque nenhuma das três entrega valor sozinha. Se a Sprint termina com banco e API prontos, o usuário recebe exatamente nada e o time não aprende nada, já que ninguém pode usar aquilo para dar feedback.\n\nA alternativa é a fatia vertical: um pedaço fino que atravessa todas as camadas e produz algo utilizável. Ver o status do pedido em texto é feio comparado ao mapa animado, mas está no ar, pode ser medido e ensina se as pessoas usam aquilo de verdade.\n\nPadrões úteis para fatiar: caminho feliz primeiro e casos de erro depois, por tipo de usuário, por regra de negócio, por variação de dados, interface simples agora e rica depois. E uma pergunta que resolve quase tudo: qual é a menor versão disso que alguém de fora usaria e comentaria com você?",
                },
            ],
            questions: [
                {
                    statement: "Segundo o Guia 2020, o refinamento do Product Backlog é o quê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma atividade contínua, sem evento formal no Scrum",
                            isCorrect: true,
                        },
                        {
                            text: "Um quinto evento, com timebox de quatro horas",
                            isCorrect: false,
                        },
                        {
                            text: "Uma reunião obrigatória na sexta de cada semana",
                            isCorrect: false,
                        },
                        {
                            text: "Tarefa exclusiva do Scrum Master fora da Sprint",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem costuma participar do refinamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "PO e Developers, mais especialistas quando precisa",
                            isCorrect: true,
                        },
                        {
                            text: "Só o Product Owner, que depois comunica o time todo",
                            isCorrect: false,
                        },
                        {
                            text: "Só o Scrum Master, que representa o time todo",
                            isCorrect: false,
                        },
                        {
                            text: "Os stakeholders, sem ninguém do time presente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na Sprint Planning o time gasta duas horas descobrindo o que os itens significam. Qual é o diagnóstico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O refinamento não aconteceu: foi adiado para a Planning",
                            isCorrect: true,
                        },
                        {
                            text: "A Planning está com o timebox curto demais para o time",
                            isCorrect: false,
                        },
                        {
                            text: "Está normal: descobrir o item é função da Planning",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou o Scrum Master conduzir melhor a pauta do evento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time fatiou uma funcionalidade em três histórias: banco, API e tela. Qual é o problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nenhuma entrega valor sozinha: fatia por camada",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: separar camadas melhora a especialização",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou uma quarta história para a documentação",
                            isCorrect: false,
                        },
                        {
                            text: "As três deveriam estar na mesma Sprint sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como fatiar de forma vertical o item acompanhar o pedido em tempo real?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ver o status em texto agora, mapa e alertas depois",
                            isCorrect: true,
                        },
                        {
                            text: "Modelar o banco, depois a API, depois a interface",
                            isCorrect: false,
                        },
                        {
                            text: "Entregar tudo junto no fim, para não parecer feio",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir por dev: um pega o mapa, outro o alerta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Definition of Done e critérios de aceite",
            blocks: [
                {
                    type: "text",
                    value: "# Duas réguas diferentes\n\nÉ a confusão mais comum de quem está começando, e ela custa caro nas duas direções. A DEFINITION OF DONE é a régua de qualidade do INCREMENTO: vale para todo item, é a mesma para o time inteiro e não muda de acordo com a pressa. Os CRITÉRIOS DE ACEITE são a régua de conclusão de UMA história específica: mudam a cada item, descrevem comportamento e respondem se aquilo resolve o problema de uma pessoa real.\n\nUm item só está pronto quando passa nas duas. Cumprir os critérios com código sem teste, sem revisão e sem observabilidade produz uma funcionalidade que aparenta funcionar e some do radar na primeira falha. Cumprir a DoD com um comportamento que não resolve o problema produz código impecável que ninguém usa.\n\nUma forma de guardar: a DoD é do time e da organização, os critérios são do item e do usuário. Quando alguém pergunta se está pronto, a resposta completa tem duas partes: atende aos critérios daquele item e atende à Definition of Done do time.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","Definition of Done","Critérios de aceite"],["Escopo","Todo item do incremento","Uma história específica"],["Muda com que frequência","Raramente, por decisão do time","A cada item novo"],["Quem escreve","Developers, dentro do padrão da empresa","PO e Developers na conversa"],["Exemplo","Testes verdes e revisão feita","Botão some para quem nunca pediu"],["Se falhar","Não é incremento","A história não foi resolvida"]]',
                },
                {
                    type: "quote",
                    value: "Cumprir o critério de aceite sem cumprir a Definition of Done é entregar uma funcionalidade que aparenta funcionar até a primeira falha.",
                },
                {
                    type: "text",
                    value: "## Uma DoD compartilhada quando há vários times\n\nQuando mais de um Scrum Team trabalha no mesmo produto, o Guia 2020 pede uma Definition of Done compartilhada, e a razão é aritmética: o incremento é um só. Se o time A considera pronto o que passa em teste manual e o time B exige teste automatizado, o produto integrado tem duas qualidades diferentes e ninguém sabe qual delas está no ar.\n\nNa prática, a DoD compartilhada costuma ser o piso, e cada time pode endurecer o que quiser acima dele. O piso cobre o que atravessa fronteiras: integração, segurança, observabilidade, compatibilidade de contrato entre serviços. O que é interno ao time, como o estilo de revisão de código, fica a critério de cada um.\n\nDuas armadilhas fecham o assunto. A primeira é a DoD escrita e nunca lida, que existe no wiki e não na conversa. A segunda é a DoD longa demais, com trinta linhas que ninguém confere de verdade. Uma DoD de seis a dez linhas que o time realmente aplica vale mais que um documento completo que ninguém abre.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre Definition of Done e critério de aceite?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "DoD vale para todo item; critério vale para um só",
                            isCorrect: true,
                        },
                        {
                            text: "DoD é do PO; critério de aceite é dos Developers",
                            isCorrect: false,
                        },
                        {
                            text: "São sinônimos, só muda o nome usado em cada time",
                            isCorrect: false,
                        },
                        {
                            text: "DoD muda a cada Sprint; critério é fixo no ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando um item pode ser considerado pronto de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando passa nos critérios e também na DoD",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o dev termina de escrever o código",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o PO aprova, mesmo sem os testes",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a Sprint acaba, independente do resto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois times trabalham no mesmo produto com Definitions of Done diferentes. Qual é o risco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O incremento é um só e passa a ter duas qualidades",
                            isCorrect: true,
                        },
                        {
                            text: "Risco nenhum: cada time tem seu próprio contexto",
                            isCorrect: false,
                        },
                        {
                            text: "Os times vão precisar de dois Product Owners fixos",
                            isCorrect: false,
                        },
                        {
                            text: "A velocity dos dois times deixa de ser comparável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time cumpriu todos os critérios de aceite, mas o item ficou sem teste automatizado e sem revisão. Está pronto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não: falta a DoD, e sem ela não existe incremento",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: o critério de aceite é a régua que vale",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, desde que o PO aprove a entrega na Review",
                            isCorrect: false,
                        },
                        {
                            text: "Depende do tamanho do item entregue na Sprint",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A Definition of Done do time tem trinta linhas e ninguém confere de verdade. Qual é a correção mais eficaz?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Encurtar para o que o time aplica todo dia mesmo",
                            isCorrect: true,
                        },
                        {
                            text: "Manter e criar auditoria semanal do cumprimento",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar cada dev seguir a parte que preferir",
                            isCorrect: false,
                        },
                        {
                            text: "Transformar as trinta linhas em critérios de aceite",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Kanban e fluxo",
    aulas: [
        {
            titulo: "O quadro que reflete a realidade",
            blocks: [
                {
                    type: "text",
                    value: "# Visualizar o trabalho de verdade\n\nA primeira prática do Kanban é a mais subestimada: tornar visível o trabalho invisível. Software é feito de coisa que ninguém vê passando, e por isso o quadro é o instrumento central. A regra é simples de dizer e difícil de cumprir: as colunas precisam ser os ESTADOS REAIS pelos quais o trabalho passa, não os estados que gostaríamos que existissem.\n\nO quadro clássico A fazer, Fazendo e Feito é quase sempre uma mentira confortável. Entre Fazendo e Feito existe, na vida real, aguardando revisão, aguardando teste, aguardando aprovação do jurídico, aguardando deploy da outra área. Enquanto esses estados ficam escondidos dentro de Fazendo, o quadro mostra dez cartões em andamento e esconde que oito estão parados esperando alguém.\n\nUm bom exercício de time é seguir um item do começo ao fim durante uma semana e anotar cada momento em que ele parou. Cada espera recorrente merece uma coluna ou um marcador. O quadro fica mais feio e passa a servir para alguma coisa: deixa de ser um mural de tarefas e vira um mapa do fluxo.",
                },
                {
                    type: "table",
                    value: '[["Detalhe do quadro","O que esconde","Como melhorar"],["Coluna Fazendo genérica","Espera por revisão e por teste","Separar em colunas de espera"],["Coluna Feito","Feito para quem, exatamente?","Amarrar o estado final à DoD"],["Sem marcador de bloqueio","Item travado parece em andamento","Marcador visível com o motivo"],["Sem dono do desbloqueio","Ninguém sabe quem destrava","Nome no cartão e regra de puxada"],["Sem data de entrada","Impossível medir tempo real","Registrar entrada e saída do item"]]',
                },
                {
                    type: "quote",
                    value: "Um quadro que mostra tudo em Fazendo não mente por maldade. Ele só esconde as esperas, que é onde mora quase todo o tempo perdido.",
                },
                {
                    type: "text",
                    value: "## Fazendo e esperando são coisas diferentes\n\nA distinção mais útil de todas separa trabalho ATIVO de trabalho em ESPERA. Item ativo é aquele em que alguém está trabalhando agora. Item em espera é aquele pronto para o próximo passo, aguardando uma pessoa, uma aprovação ou um ambiente. Quando o time mede isso pela primeira vez, o resultado costuma chocar: a maior parte do tempo de um item é espera, não trabalho.\n\nIsso muda a conversa. Se dois terços do tempo é fila, contratar mais gente para escrever código mais rápido melhora um terço do problema. Reduzir espera, ao contrário, costuma ser barato: revisão em até quatro horas, ambiente de teste que sobe sozinho, aprovação assíncrona com prazo combinado.\n\nBloqueio merece tratamento próprio. Um item bloqueado precisa de marcador visível, motivo escrito e dono do desbloqueio. Sem isso, ele fica no quadro parecendo trabalho e some da conversa da Daily. Times maduros olham primeiro para o que está parado, não para o que está andando, porque o que está parado é o que está custando prazo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a regra para montar as colunas de um quadro Kanban?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As colunas são os estados reais pelos quais o item passa",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre três colunas: A fazer, Fazendo e Feito, nessa ordem",
                            isCorrect: false,
                        },
                        {
                            text: "Uma coluna para cada pessoa do time, com o nome dela",
                            isCorrect: false,
                        },
                        {
                            text: "Uma coluna por tipo de item: bug, história e tarefa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o quadro esconde quando não separa espera de trabalho ativo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que boa parte dos itens está parada, não em andamento",
                            isCorrect: true,
                        },
                        {
                            text: "Que o time precisa de mais uma ferramenta de gestão",
                            isCorrect: false,
                        },
                        {
                            text: "Que a estimativa dos itens ficou errada no começo",
                            isCorrect: false,
                        },
                        {
                            text: "Que faltam devs seniores para revisar todo o código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O quadro mostra dez itens em Fazendo, mas oito deles apenas aguardam revisão. Qual é a primeira correção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Criar colunas de espera para tornar a fila visível",
                            isCorrect: true,
                        },
                        {
                            text: "Contratar mais devs para dar conta desse volume",
                            isCorrect: false,
                        },
                        {
                            text: "Remover a etapa de revisão de código do fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a duração da Sprint para três semanas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um item está bloqueado há três dias esperando outra área. Como o quadro deve tratar esse caso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Marcador visível, motivo escrito e dono do desbloqueio",
                            isCorrect: true,
                        },
                        {
                            text: "Tirar do quadro até a outra área responder alguma coisa",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar em Fazendo, porque o item ainda é do time todo",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar como Feito e reabrir o cartão quando destravar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time mediu e descobriu que dois terços do tempo de cada item é espera. Qual ação ataca melhor o problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reduzir as filas: revisão rápida e ambiente pronto",
                            isCorrect: true,
                        },
                        {
                            text: "Contratar mais devs para escrever código mais rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a meta de pontos por Sprint em vinte",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a ferramenta de quadro por uma mais moderna",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Limitar o trabalho em andamento",
            blocks: [
                {
                    type: "text",
                    value: "# Menos em andamento, mais entregue\n\nParece contraintuitivo até você ver funcionar. Um time com dez itens abertos ao mesmo tempo entrega menos, e mais devagar, que o mesmo time com quatro. A razão não é moral, é matemática de fila somada a custo de troca de contexto.\n\nCada item aberto consome atenção mesmo quando ninguém está trabalhando nele: alguém precisa lembrar do estado, responder pergunta, reabrir o contexto. Troca de contexto cobra caro em trabalho de conhecimento, e a conta piora com o número de frentes abertas. Além disso, item aberto é dinheiro parado: ele só vira valor quando chega ao fim.\n\nLimitar o WIP significa colocar um número no topo de cada coluna e respeitar esse número. Se a coluna Em revisão tem limite 3 e já tem 3, ninguém empurra o quarto: quem ia empurrar vai ajudar a destravar os que já estão lá. Esse é o efeito mais valioso do limite, e ele não é sobre controle: o limite transforma um problema individual, minha tarefa está parada, num problema do time, o fluxo travou naquela coluna.",
                },
                {
                    type: "table",
                    value: '[["Situação","WIP alto","WIP limitado"],["Foco","Cada um em três frentes","Duas pessoas fecham um item"],["Item travado","Some no meio do quadro","Vira problema do time na hora"],["Tempo de entrega","Longo e imprevisível","Curto e mais estável"],["Reação a urgência","Empilha em cima do resto","Algo precisa sair antes de entrar"],["Sensação do time","Todo mundo ocupado","Menos coisa aberta, mais coisa pronta"]]',
                },
                {
                    type: "quote",
                    value: "Ocupação e produtividade não são a mesma coisa. Time cem por cento ocupado costuma ser o time com a fila mais longa esperando na frente.",
                },
                {
                    type: "text",
                    value: "## A lei de Little em português de gente\n\nA lei de Little é uma relação simples: o tempo médio que um item leva para atravessar o sistema é igual à quantidade média de itens dentro dele dividida pela taxa média de saída. Em português de gente: se o time entrega 5 itens por semana e mantém 20 itens em andamento, cada item leva em média 4 semanas para sair.\n\nA consequência prática é direta. Existem dois jeitos de entregar mais rápido: aumentar a taxa de saída, que é difícil e demorado, pedindo mais gente, mais automação e menos retrabalho; ou reduzir a quantidade em andamento, que é decisão de hoje à tarde e não custa nada. É por isso que limitar WIP costuma ser o primeiro ajuste de qualquer time com fluxo travado.\n\nA leitura crítica que evita o dogma: a lei vale para médias, num sistema estável, ao longo do tempo. Ela não promete que o próximo item vai levar 4 semanas, promete a média. Serve para orientar decisão de fluxo, nunca para prometer data de um item específico.",
                },
            ],
            questions: [
                {
                    statement: "Por que limitar o WIP costuma aumentar a entrega do time?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Menos troca de contexto e menos item parado no meio",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o time passa a trabalhar mais horas por dia",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o quadro fica mais bonito para o gestor ver",
                            isCorrect: false,
                        },
                        {
                            text: "Porque itens menores exigem menos revisão de código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pela lei de Little, se o time entrega 5 itens por semana e mantém 20 em andamento, qual é o tempo médio de entrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quatro semanas em média por item que atravessa",
                            isCorrect: true,
                        },
                        {
                            text: "Cem semanas, porque os dois números se multiplicam",
                            isCorrect: false,
                        },
                        {
                            text: "Uma semana, já que a entrega é semanal no time",
                            isCorrect: false,
                        },
                        {
                            text: "Quinze semanas, que é a diferença entre os dois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A coluna Em revisão tem limite 3 e está cheia. Um dev acabou de terminar o código de outro item. O que ele faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ajuda a destravar a revisão em vez de empurrar mais",
                            isCorrect: true,
                        },
                        {
                            text: "Empurra assim mesmo: o limite é só uma sugestão",
                            isCorrect: false,
                        },
                        {
                            text: "Começa mais um item novo, para não ficar ocioso",
                            isCorrect: false,
                        },
                        {
                            text: "Aumenta o limite da coluna para 4 e segue o fluxo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer entregar mais rápido e já discute contratar gente. Qual ajuste é mais barato e imediato?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reduzir a quantidade de itens em andamento hoje",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a meta de pontos da próxima Sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o quadro físico por uma ferramenta paga",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar dois devs seniores neste trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um gerente usa a lei de Little para prometer que um item específico sai em 4 semanas. Qual é o erro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A lei vale para médias, não para um item específico",
                            isCorrect: true,
                        },
                        {
                            text: "A lei só se aplica a times que usam Kanban puro",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: a lei serve exatamente para prometer data",
                            isCorrect: false,
                        },
                        {
                            text: "A conta correta seria multiplicar em vez de dividir",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas de fluxo",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro números que descrevem o fluxo\n\nAs métricas de fluxo respondem perguntas que velocity não responde. LEAD TIME é o tempo do pedido até a entrega, contado do ponto de vista de quem pediu: começa quando o item entra no sistema e termina quando chega ao usuário. CYCLE TIME é o tempo do início do trabalho até a entrega, e é o número que o time controla mais diretamente. THROUGHPUT é a quantidade de itens entregues por período. WIP é quanto está em andamento agora.\n\nA confusão entre lead time e cycle time custa credibilidade em reunião. Quando o negócio pergunta quanto tempo leva, quase sempre a pergunta é sobre lead time, que inclui a fila antes de o trabalho começar. Responder com cycle time, três dias, e depois entregar em cinco semanas cria a sensação de que o time mente, quando o problema real é a fila de quatro semanas antes de alguém pegar o item.\n\nUma vantagem prática dessas métricas: elas não dependem de estimativa nenhuma. Basta registrar quando o item entrou e quando ele saiu.",
                },
                {
                    type: "table",
                    value: '[["Métrica","O que mede","Pergunta que responde"],["Lead time","Do pedido até a entrega","Quanto tempo o cliente espera?"],["Cycle time","Do início do trabalho até a entrega","Quanto tempo o time leva?"],["Throughput","Itens entregues por período","Quanto sai por semana?"],["WIP","Itens em andamento agora","Quanto está aberto ao mesmo tempo?"],["Idade do item","Tempo desde a entrada no fluxo","Qual item está envelhecendo demais?"]]',
                },
                {
                    type: "quote",
                    value: "Média esconde o dia ruim. Dizer que 85 por cento dos itens saíram em até 12 dias vale mais que uma média de 6 dias, porque é com o percentil que se assume compromisso.",
                },
                {
                    type: "text",
                    value: "## Percentil em vez de média\n\nO erro mais comum ao usar métricas de fluxo é resumir tudo pela média. A distribuição de tempo de entrega em software é assimétrica: a maioria dos itens sai rápido e alguns poucos demoram muito. Nessa forma, a média fica abaixo da experiência real de quem espera, e o item que levou 40 dias desaparece na conta.\n\nPercentil resolve isso sem matemática pesada. Ordene os tempos e olhe onde caem 50, 85 e 95 por cento dos itens. Se o percentil 85 é 12 dias, você pode afirmar que na maioria esmagadora das vezes entrega em até 12 dias. Esse é um compromisso que se sustenta e que não vira mentira no primeiro caso ruim.\n\nDuas leituras de apoio. A idade do item em andamento é a métrica mais acionável do dia a dia: um item aberto há 20 dias num sistema com percentil 85 de 12 dias é um alerta hoje, não uma constatação no fim do mês. E toda métrica de fluxo é do sistema, não da pessoa: usar cycle time para comparar devs destrói o dado e a confiança junto.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre lead time e cycle time?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Lead conta desde o pedido; cycle, desde o início do trabalho",
                            isCorrect: true,
                        },
                        {
                            text: "Lead é sempre medido em dias; cycle é medido em horas úteis",
                            isCorrect: false,
                        },
                        {
                            text: "Lead é do time de produto; cycle é do time de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "São sinônimos: os dois medem o tempo total de uma entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é throughput?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A quantidade de itens entregues por período",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo médio que cada item leva no fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "A soma dos pontos estimados numa Sprint",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de itens abertos ao mesmo tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time responde ao negócio que leva três dias, usando cycle time, e o negócio recebe cinco semanas depois. O que causou o mal-entendido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A pergunta era sobre lead time, que inclui a fila",
                            isCorrect: true,
                        },
                        {
                            text: "O time estimou errado a complexidade do item",
                            isCorrect: false,
                        },
                        {
                            text: "O negócio não entende métricas de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Cycle time só vale para times que usam Kanban",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que percentil é preferível à média em métricas de fluxo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A distribuição é assimétrica e a média esconde a cauda",
                            isCorrect: true,
                        },
                        {
                            text: "Percentil é bem mais fácil de calcular numa planilha",
                            isCorrect: false,
                        },
                        {
                            text: "A média só pode ser usada com mais de cem itens medidos",
                            isCorrect: false,
                        },
                        {
                            text: "Percentil substitui a necessidade de estimar itens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um gerente quer usar cycle time individual para comparar o desempenho de cada dev. Qual é o problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A métrica é do sistema; comparar pessoa destrói o dado",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: comparar devs é o uso mais natural da métrica",
                            isCorrect: false,
                        },
                        {
                            text: "O certo seria comparar por time, e não por pessoa",
                            isCorrect: false,
                        },
                        {
                            text: "Cycle time individual precisa de uma ferramenta paga",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Scrum com Kanban",
            blocks: [
                {
                    type: "text",
                    value: "# Fluxo dentro do sprint\n\nScrum e Kanban não competem: um define um contêiner com cadência e compromissos, o outro define práticas de fluxo. Existe inclusive um guia complementar escrito para times de Scrum, e a ideia é simples: manter os eventos, os artefatos e as accountabilities do Scrum e acrescentar visualização, limite de WIP e métricas de fluxo dentro da Sprint.\n\nNa prática, três coisas mudam no dia a dia. O quadro passa a ter colunas de estado real e limites por coluna. A Daily deixa de ser rodada de status e vira leitura do quadro da direita para a esquerda, começando pelo que está mais perto de terminar e pelo que está travado. A Retrospective ganha dados concretos: cycle time, throughput e itens que envelheceram sem sair.\n\nO Sprint Backlog continua existindo, o Sprint Goal continua sendo o compromisso e a Review continua inspecionando o incremento. O que some é a ilusão de que basta encher a Sprint de itens e torcer para tudo terminar junto na sexta-feira.",
                },
                {
                    type: "table",
                    value: '[["Prática","Scrum sozinho","Scrum com Kanban"],["Daily","Rodada de status por pessoa","Leitura do quadro, do fim para o começo"],["Andamento","Itens abertos sem limite","Limite de WIP por coluna"],["Retrospective","Percepção e memória","Cycle time e throughput na mesa"],["Fim de Sprint","Tudo terminando na sexta","Entregas espalhadas pela Sprint"],["Previsão","Velocity em pontos","Throughput histórico em itens"]]',
                },
                {
                    type: "quote",
                    value: "Um time que fecha oito itens na sexta-feira não teve uma boa Sprint. Teve oito riscos concentrados no último dia, e deu sorte.",
                },
                {
                    type: "text",
                    value: "## Quando o Kanban puro ganha\n\nNem todo trabalho combina com sprint, e três contextos costumam favorecer o Kanban puro.\n\nO primeiro é suporte e sustentação. O trabalho chega quando chega, a prioridade muda em horas e comprometer-se com um escopo de duas semanas não faz sentido. Aqui, classes de serviço, como urgente, padrão e data fixa, somadas a limites de WIP, resolvem melhor que qualquer Planning.\n\nO segundo é o time com itens muito uniformes e pequenos, como ajustes de conteúdo ou correções miúdas, em que a entrega é contínua e a Sprint só adiciona cerimônia.\n\nO terceiro é o time em que a fila domina o tempo, tipicamente por depender de aprovações externas. Nesse caso, atacar o fluxo rende mais que planejar melhor.\n\nO critério de decisão cabe numa pergunta: existe um objetivo comum que valha a pena perseguir por duas semanas? Se sim, o Sprint Goal é um ativo real. Se o trabalho é um fluxo de pedidos independentes, o contêiner vira formalidade e o Kanban entrega mais.",
                },
            ],
            questions: [
                {
                    statement: "O que o Kanban acrescenta a um time que já usa Scrum?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Visualização do fluxo, limite de WIP e métricas",
                            isCorrect: true,
                        },
                        {
                            text: "Um substituto para o Sprint Goal e a Review",
                            isCorrect: false,
                        },
                        {
                            text: "A troca dos eventos por reuniões só semanais",
                            isCorrect: false,
                        },
                        {
                            text: "Um novo papel formal de gestor do fluxo do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual contexto o Kanban puro costuma vencer o Scrum?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Suporte, onde a prioridade muda em horas",
                            isCorrect: true,
                        },
                        {
                            text: "Produto novo, com muita coisa a descobrir",
                            isCorrect: false,
                        },
                        {
                            text: "Time grande, com muitas dependências",
                            isCorrect: false,
                        },
                        {
                            text: "Projeto com escopo fechado em contrato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como fica a Daily num time que usa Scrum com Kanban?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Leitura do quadro, começando pelo que está travado",
                            isCorrect: true,
                        },
                        {
                            text: "Rodada de status individual, com um dev por vez",
                            isCorrect: false,
                        },
                        {
                            text: "Reunião de planejamento curta, em todo dia útil",
                            isCorrect: false,
                        },
                        {
                            text: "Fica opcional e some quando o time já amadurece",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time fecha oito itens sempre na sexta-feira da Sprint. Como o olhar de fluxo lê esse padrão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Risco concentrado no fim: falta fluxo durante a Sprint",
                            isCorrect: true,
                        },
                        {
                            text: "Sinal de time maduro: entregar tudo junto mostra foco",
                            isCorrect: false,
                        },
                        {
                            text: "Indica que a Sprint deveria durar mais três semanas",
                            isCorrect: false,
                        },
                        {
                            text: "Mostra que faltou estimar todos os itens em pontos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual pergunta decide melhor entre trabalhar com Sprint e trabalhar com Kanban puro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Existe um objetivo comum que valha duas semanas?",
                            isCorrect: true,
                        },
                        {
                            text: "O time tem gente suficiente para fazer os dois?",
                            isCorrect: false,
                        },
                        {
                            text: "A ferramenta atual suporta limite de WIP por coluna?",
                            isCorrect: false,
                        },
                        {
                            text: "O gestor prefere relatório semanal ou quinzenal?",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cadência sem sprint",
            blocks: [
                {
                    type: "text",
                    value: "# Entregar quando estiver pronto\n\nSprint é um contêiner com data de fim. Fluxo contínuo é outra escolha: o item vai para produção quando fica pronto, sem esperar a sexta-feira. As duas abordagens podem coexistir, e times maduros costumam misturar cadência de conversa, com um encontro quinzenal de planejamento e outro de melhoria, e entrega contínua no meio.\n\nEssa separação é a chave que destrava o assunto. Cadência de PLANEJAMENTO, cadência de ENTREGA e cadência de REVISÃO são três coisas independentes. O Scrum amarra as três na mesma frequência por simplicidade, e isso ajuda muito no começo. Um time com prática pode planejar a cada duas semanas, entregar dez vezes por dia e revisar com stakeholders uma vez por mês, sem nenhuma incoerência.\n\nO que não pode desaparecer é o ciclo empírico. Sem sprint, alguém precisa garantir que ainda existe inspeção regular do produto com quem usa e adaptação do que se pretende fazer. Kanban sem esse cuidado degenera rápido numa esteira de pedidos, que é o anti-padrão da feature factory, só que sem cerimônia nenhuma.",
                },
                {
                    type: "table",
                    value: '[["Cadência","No Scrum clássico","Em fluxo contínuo"],["Planejamento","Sprint Planning quinzenal","Replenishment quando abre espaço"],["Entrega","Ao fim da Sprint","Quando o item fica pronto"],["Revisão com quem usa","Sprint Review quinzenal","Encontro mensal ou por marco"],["Melhoria do processo","Retrospective por Sprint","Encontro fixo, mesma frequência"],["Compromisso","Sprint Goal","Acordo de tempo por classe de serviço"]]',
                },
                {
                    type: "quote",
                    value: "Cadência de planejamento, de entrega e de revisão são três relógios distintos. O Scrum sincroniza os três de propósito; fluxo contínuo permite desacoplar, desde que nenhum deles pare.",
                },
                {
                    type: "text",
                    value: "## Replenishment e o critério entre os dois mundos\n\nEm fluxo contínuo, o evento que ocupa o lugar da Planning é o REPLENISHMENT: uma reunião curta, em geral semanal ou disparada quando abre espaço na primeira coluna, em que se escolhe o que entra a seguir. O PO segue decidindo a ordem; o que muda é a granularidade da decisão, que passa a ser item a item em vez de lote quinzenal.\n\nO critério para escolher entre os dois mundos cabe em três perguntas. O trabalho tem um objetivo comum que dá coerência a um período? Se sim, o Sprint Goal vale. A prioridade muda em horas ou em semanas? Se muda em horas, o compromisso quinzenal vai ser quebrado toda vez. O time consegue entregar com segurança fora de uma data fixa? Se não consegue, a Sprint dá disciplina enquanto o pipeline amadurece.\n\nE o alerta honesto: fluxo contínuo exige mais maturidade, não menos. Sem a data de fim que força a conversa, um time desatento simplesmente para de inspecionar e vira esteira.",
                },
            ],
            questions: [
                {
                    statement: "O que é replenishment no fluxo contínuo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reunião curta para escolher o que entra a seguir",
                            isCorrect: true,
                        },
                        {
                            text: "A entrega automática de tudo que ficou pronto",
                            isCorrect: false,
                        },
                        {
                            text: "O ritual de revisão do incremento com o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "A recontagem dos pontos estimados no começo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais três cadências podem ser desacopladas fora do Scrum?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Planejamento, entrega e revisão com stakeholders",
                            isCorrect: true,
                        },
                        {
                            text: "Estimativa, contratação e treinamento do time",
                            isCorrect: false,
                        },
                        {
                            text: "Refinamento, codificação e teste de aceitação",
                            isCorrect: false,
                        },
                        {
                            text: "Orçamento, contrato e auditoria de qualidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time entrega dez vezes por dia mas planeja a cada duas semanas. Isso é incoerente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não: cadências de plano e de entrega são distintas",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: o Scrum exige entregar só no fim da Sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Sim: planejar quinzenal exige entrega quinzenal",
                            isCorrect: false,
                        },
                        {
                            text: "Depende: só vale se o time tiver mais de dez devs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A prioridade do trabalho de um time muda a cada poucas horas. O que isso sugere sobre a abordagem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Kanban puro: o compromisso quinzenal seria quebrado",
                            isCorrect: true,
                        },
                        {
                            text: "Scrum com Sprint de um mês para dar estabilidade",
                            isCorrect: false,
                        },
                        {
                            text: "Cascata, já que não dá para planejar coisa alguma",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar mais gente até a prioridade estabilizar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time tirou as Sprints, adotou fluxo contínuo e em três meses parou de conversar com usuário. O que aconteceu?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O ciclo empírico sumiu junto com a data que forçava",
                            isCorrect: true,
                        },
                        {
                            text: "Nada demais: fluxo contínuo dispensa conversar",
                            isCorrect: false,
                        },
                        {
                            text: "O time ficou grande demais para o modelo antigo",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou trocar a ferramenta de quadro na mudança",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Planejamento e previsibilidade",
    aulas: [
        {
            titulo: "Estimativas com ceticismo",
            blocks: [
                {
                    type: "text",
                    value: "# Por que horas mentem\n\nEstimar em horas parece o jeito honesto, e é o que mais engana. Três razões. A primeira: a estimativa em horas mistura tamanho com disponibilidade, e a disponibilidade real de um dev num dia com reunião, revisão e suporte é uma fração do dia. A segunda: horas dão precisão falsa, porque 14 horas soa mais confiável que a palavra médio, quando a incerteza é exatamente a mesma. A terceira: horas viram cobrança individual com uma facilidade assustadora, e no minuto em que viram, o número deixa de ser honesto para sempre.\n\nPontos de história nasceram para escapar disso. Ponto é uma medida relativa de tamanho, combinando esforço, complexidade e incerteza, sempre comparando um item com outro do mesmo backlog. A escala mais usada lembra Fibonacci, com 1, 2, 3, 5, 8 e 13, justamente porque a distância entre os números cresce junto com a incerteza: dá para diferenciar 1 de 2, e não faz sentido discutir 20 contra 21.\n\nO ponto mais importante: estimativa é uma CONVERSA, não um contrato. O valor está no que aparece durante a discussão.",
                },
                {
                    type: "table",
                    value: '[["Critério","Estimativa em horas","Pontos de história"],["O que mede","Tempo de uma pessoa","Tamanho relativo do item"],["Precisão aparente","Alta e enganosa","Grosseira e honesta"],["Risco de virar cobrança","Muito alto","Menor, mas continua existindo"],["Comparação entre times","Parece possível e não é","Não faz sentido nenhum"],["Melhor uso","Tarefa curta e conhecida","Item com incerteza real"]]',
                },
                {
                    type: "quote",
                    value: "Quando dois devs dizem 3 e 13 para o mesmo item, a estimativa já cumpriu o papel dela: alguém sabe de algo que o outro não sabe, e isso vai aparecer antes do código.",
                },
                {
                    type: "text",
                    value: "## Planning poker e o horizonte do no estimates\n\nPlanning poker existe para o mesmo fim: não para chegar a um número, mas para expor divergência. Todo mundo mostra a carta ao mesmo tempo, para ninguém ancorar no mais experiente, e a discussão acontece entre os extremos. O 13 costuma saber de uma integração que ninguém lembrou; o 3 costuma ter feito algo parecido no mês passado. Depois da conversa, o número novo importa pouco perto do que o time aprendeu.\n\nExiste uma corrente chamada no estimates que propõe abandonar a estimativa e prever pela contagem de itens entregues. O argumento é forte: se você já mede throughput, a estimativa individual acrescenta pouco e custa horas de reunião por Sprint. A condição é fatiar itens em tamanhos parecidos, o que dá trabalho e nem todo time consegue manter.\n\nO caminho maduro em 2026 costuma ser intermediário. Estimar com pontos onde a conversa ainda revela alguma coisa, contar itens onde eles já são pequenos e uniformes, e nunca transformar a estimativa em promessa.",
                },
            ],
            questions: [
                {
                    statement: "Por que estimar em horas costuma enganar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mistura tamanho com disponibilidade e dá precisão falsa",
                            isCorrect: true,
                        },
                        {
                            text: "Porque os devs não sabem calcular horas corretamente",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o Guia do Scrum proíbe qualquer estimativa em horas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque hora é uma unidade grande demais para software",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que os pontos de história medem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tamanho relativo, somando esforço e incerteza",
                            isCorrect: true,
                        },
                        {
                            text: "As horas úteis que o item vai consumir mesmo",
                            isCorrect: false,
                        },
                        {
                            text: "O valor de negócio que o item vai gerar depois",
                            isCorrect: false,
                        },
                        {
                            text: "A prioridade definida pelo Product Owner",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No planning poker, dois devs mostram 3 e 13 para o mesmo item. O que o time deve fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conversar: alguém sabe algo que o outro não sabe",
                            isCorrect: true,
                        },
                        {
                            text: "Tirar a média entre os dois e seguir em frente",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar o número do dev mais experiente do time",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar como 13 sempre, para não correr risco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma diretoria quer transformar as estimativas em pontos em compromisso formal de entrega. Qual é o problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Estimativa é conversa sobre incerteza, não contrato",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: o ponto foi criado justamente para isso",
                            isCorrect: false,
                        },
                        {
                            text: "Só vale como compromisso a partir de 20 pontos",
                            isCorrect: false,
                        },
                        {
                            text: "O problema é a diretoria não conhecer Fibonacci",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time tem itens pequenos e uniformes e ainda gasta duas horas por Sprint estimando. O que considerar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Contar itens e prever por throughput, sem estimar",
                            isCorrect: true,
                        },
                        {
                            text: "Manter a estimativa: sem ela não há previsão",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o tempo de estimativa para três horas",
                            isCorrect: false,
                        },
                        {
                            text: "Estimar em horas, que é mais rápido de fazer",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Velocity sem teatro",
            blocks: [
                {
                    type: "text",
                    value: "# Uma medida de capacidade, não de valor\n\nVelocity é a soma dos pontos dos itens que atendem à Definition of Done ao fim de uma Sprint. É um número útil e um dos mais corrompidos do mercado, porque é fácil de inflar e parece medir desempenho de gente.\n\nTrês regras evitam quase todo o estrago. A PRIMEIRA: velocity é do time e serve ao time. Comparar a velocity de dois times é comparar duas moedas diferentes, já que cada um calibrou os pontos com o próprio backlog; um time com velocity 40 pode entregar metade do valor de um time com velocity 15.\n\nA SEGUNDA: velocity é observação, nunca meta. No instante em que vira meta, ela deixa de medir qualquer coisa, porque inflar estimativa é trivial e ninguém precisa combinar nada para que isso aconteça. É a lei de Goodhart em ação: toda medida que vira alvo deixa de ser uma boa medida.\n\nA TERCEIRA: velocity não fala de valor. Um time pode dobrar a velocity entregando funcionalidades que ninguém usa, e os gráficos vão continuar bonitos.",
                },
                {
                    type: "table",
                    value: '[["Uso da velocity","Saudável ou tóxico","Por quê"],["Prever quanto cabe na Sprint","Saudável","Usa a tendência do próprio time"],["Comparar dois times","Tóxico","Pontos não são moeda comum"],["Virar meta trimestral","Tóxico","Inflar estimativa é trivial"],["Compor bônus individual","Tóxico","Destrói o dado e a confiança"],["Detectar mudança de contexto","Saudável","Queda súbita indica algo novo"]]',
                },
                {
                    type: "quote",
                    value: "No dia em que velocity vira meta, ela deixa de medir qualquer coisa. Inflar estimativa não exige combinação nem má-fé: acontece sozinho.",
                },
                {
                    type: "text",
                    value: "## Como usar a tendência do próprio time\n\nO uso honesto é simples. Pegue as últimas três a cinco Sprints, olhe o menor e o maior valor e trabalhe com essa faixa em vez de uma média. Se as últimas cinco foram 18, 22, 15, 25 e 20, o time planeja com algo entre 15 e 25, e não com 20 cravado no plano.\n\nAlguns cuidados práticos. A velocity de um time novo não significa nada nas primeiras Sprints, porque a calibragem dos pontos ainda está se formando. Mudança de composição reinicia parcialmente a série: se entrou ou saiu gente, o histórico anterior perde parte do valor. E férias, feriado e incidente entram na conversa de capacidade antes da Sprint, não como desculpa depois.\n\nA leitura crítica que fecha o assunto: velocity é métrica de capacidade e nada mais. Ela não diz se o produto está melhor, se o cliente está mais satisfeito ou se a arquitetura aguenta o próximo ano. Um time que só olha para velocity está otimizando a esteira e ignorando o destino, o que é confortável e caro.",
                },
            ],
            questions: [
                {
                    statement: "O que a velocity mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os pontos entregues por Sprint, dentro da DoD",
                            isCorrect: true,
                        },
                        {
                            text: "O valor de negócio gerado a cada Sprint pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "A satisfação do cliente com a entrega feita",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de horas trabalhadas no mês todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que não faz sentido comparar a velocity de dois times?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada time calibra os pontos com o próprio backlog",
                            isCorrect: true,
                        },
                        {
                            text: "Porque times diferentes usam ferramentas diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o Guia do Scrum proíbe qualquer comparação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a velocity muda toda semana em qualquer time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A diretoria definiu a meta de aumentar a velocity em 20 por cento no trimestre. O que tende a acontecer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As estimativas incham e o número perde o sentido",
                            isCorrect: true,
                        },
                        {
                            text: "O time entrega 20 por cento mais valor ao cliente",
                            isCorrect: false,
                        },
                        {
                            text: "A qualidade sobe porque a meta gera foco no time",
                            isCorrect: false,
                        },
                        {
                            text: "Nada muda: velocity não reage a meta nenhuma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "As últimas cinco Sprints deram 18, 22, 15, 25 e 20 pontos. Como planejar a próxima?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trabalhar com a faixa de 15 a 25, não com a média",
                            isCorrect: true,
                        },
                        {
                            text: "Cravar 25, porque o time já provou que consegue",
                            isCorrect: false,
                        },
                        {
                            text: "Cravar 20, que é exatamente a média das cinco",
                            isCorrect: false,
                        },
                        {
                            text: "Somar tudo e dividir pelo número de devs do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time dobrou a velocity em dois trimestres e a diretoria comemorou. O que ainda falta saber?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Se o produto melhorou para quem usa de verdade",
                            isCorrect: true,
                        },
                        {
                            text: "Quantas horas o time trabalhou a mais no período",
                            isCorrect: false,
                        },
                        {
                            text: "Se a ferramenta de quadro registrou tudo certo",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos devs novos entraram no time nesse tempo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Previsão probabilística leve",
            blocks: [
                {
                    type: "text",
                    value: "# Trocar a promessa pela probabilidade\n\nA pergunta do negócio é sempre a mesma: quando fica pronto? A resposta tradicional, uma data única, é uma mentira estatística. Existe uma distribuição de resultados possíveis, e escolher um ponto dela para chamar de plano é justamente o que produz atraso crônico.\n\nA alternativa não exige matemática pesada. Com o histórico de throughput, quantos itens o time entregou por semana nas últimas dez a quinze semanas, e a contagem do que falta, dá para simular. A ideia da simulação de Monte Carlo é sortear muitas vezes um futuro possível usando as semanas passadas: sorteia uma semana histórica, soma o que ela entregaria, sorteia outra, até completar o escopo. Repita alguns milhares de vezes e você tem uma distribuição de datas.\n\nO resultado sai numa forma que muda a conversa: em metade das simulações o time termina até 12 de março, em 85 por cento delas até 26 de março, em 95 por cento até 9 de abril. A decisão volta então para o negócio, que é quem deve escolher o nível de confiança que quer comprar.",
                },
                {
                    type: "table",
                    value: '[["Forma de responder","Como soa","O que acontece depois"],["Data única cravada","Fica pronto dia 12 de março","Vira promessa e depois desculpa"],["Faixa sem probabilidade","Entre março e abril","Ninguém sabe o que planejar"],["Percentil explicado","85 por cento até 26 de março","O negócio escolhe o risco"],["Nenhuma resposta","Ágil não estima data","O time perde a cadeira na mesa"]]',
                },
                {
                    type: "quote",
                    value: "Toda data única é uma distribuição escondida. Dizer que há 85 por cento de chance até 26 de março não é fugir da pergunta: é responder com o que de fato se sabe.",
                },
                {
                    type: "text",
                    value: "## O que a simulação exige, e o que ela não promete\n\nTrês condições para o número valer alguma coisa. A primeira é histórico suficiente: dez a quinze semanas de dados do MESMO time em contexto parecido. A segunda é escopo contado: quantos itens faltam, com uma faixa para o que ainda vai aparecer, porque escopo cresce. A terceira é estabilidade razoável: se o time mudou de tamanho ou o tipo de trabalho virou outro, a série passada não descreve o futuro.\n\nE o que a simulação não faz. Ela não adivinha o item que ninguém pensou, não corrige backlog inventado e não substitui conversa. Ela apenas transforma o que você já sabe numa forma honesta de dizer.\n\nO ganho maior é político, não técnico. Quando você chega dizendo que em 85 por cento dos cenários a entrega sai até 26 de março, e que chegar a 95 por cento exigiria até 9 de abril, a conversa deixa de ser sobre coragem e passa a ser sobre risco. O negócio decide se compra a data segura, se corta escopo ou se aceita a chance menor.",
                },
            ],
            questions: [
                {
                    statement: "Qual dado histórico alimenta uma previsão por Monte Carlo simples?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O throughput das últimas dez a quinze semanas",
                            isCorrect: true,
                        },
                        {
                            text: "A soma das horas estimadas pelo time todo",
                            isCorrect: false,
                        },
                        {
                            text: "A média de bugs abertos a cada trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "O orçamento aprovado para o próximo ano todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual resposta comunica melhor uma previsão de entrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "85% de chance de terminar até 26 de março",
                            isCorrect: true,
                        },
                        {
                            text: "Fica pronto no dia 12 de março, sem falta",
                            isCorrect: false,
                        },
                        {
                            text: "Quando estiver pronto a gente avisa vocês",
                            isCorrect: false,
                        },
                        {
                            text: "Ágil não trabalha com data de entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time nunca mediu throughput e quer rodar uma previsão probabilística hoje. O que falta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Histórico do mesmo time em contexto parecido",
                            isCorrect: true,
                        },
                        {
                            text: "Uma ferramenta paga de simulação estatística",
                            isCorrect: false,
                        },
                        {
                            text: "A aprovação formal do Product Owner do time",
                            isCorrect: false,
                        },
                        {
                            text: "Estimativas em horas de todos os itens abertos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma data única cravada é problemática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela esconde a distribuição de resultados possíveis",
                            isCorrect: true,
                        },
                        {
                            text: "Porque datas exatas exigem contrato assinado antes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o negócio nunca aceita data de entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time perde a motivação com prazo fixo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O negócio precisa de alta segurança na data por causa de uma campanha já comprada. Como estruturar a resposta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Oferecer o percentil 95 e o custo em dias a mais",
                            isCorrect: true,
                        },
                        {
                            text: "Prometer a data mais cedo e correr atrás depois",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar a pergunta, porque o método não permite",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar toda estimativa para garantir a margem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Release planning",
            blocks: [
                {
                    type: "text",
                    value: "# Marcos por objetivo, não por lista\n\nRelease planning ágil não é montar um cronograma de doze meses com features nomeadas e datas. É desenhar uma sequência de fatias de valor, cada uma com um objetivo que dá para verificar, e comunicar honestamente o que se sabe e o que não se sabe sobre cada uma delas.\n\nA diferença aparece na forma de escrever o marco. Entregar login social, carrinho salvo e cupom em 30 de junho é uma lista com data: quando um dos três atrasa, tudo vira negociação e ninguém sabe o que sacrificar. Até junho, o cliente consegue comprar de novo sem remontar o carrinho é um objetivo: dá para verificar, dá para alcançar de várias formas e o time pode cortar escopo sem quebrar a promessa.\n\nEssa mudança de forma é o que salva release planning de virar cascata com nome novo. O objetivo permanece; a lista de itens que o realiza é hipótese, e hipótese se ajusta com o que a Review ensina a cada duas semanas.",
                },
                {
                    type: "table",
                    value: '[["Elemento do plano","Cascata disfarçada","Release planning ágil"],["Marco","Lista de features com data","Objetivo verificável com data"],["Escopo","Fixo e detalhado até o fim","Fatia próxima fina, resto grosso"],["Data","Compromisso único","Faixa com nível de confiança"],["Mudança","Aditivo e negociação","Reordenar dentro do objetivo"],["Revisão do plano","Trimestral e formal","A cada Sprint, com dados novos"]]',
                },
                {
                    type: "quote",
                    value: "Marco por lista de features quebra no primeiro imprevisto. Marco por objetivo aguenta, porque sobra ao time a liberdade de escolher outro caminho até ele.",
                },
                {
                    type: "code",
                    value: "# Marco por LISTA (frágil)\nEm 30/06: login social + carrinho salvo + cupom de primeira compra\n\n# Marco por OBJETIVO (resistente)\nEm 30/06: o cliente que já comprou consegue repetir a compra\nsem remontar o carrinho.\n\nHipótese de escopo (pode mudar sem quebrar o marco):\n- Repetir o último pedido a partir da home\n- Salvar o carrinho entre sessões\n- (opcional) Cupom de retorno para quem sumiu\n\nConfiança hoje: 85% até 30/06 pelo throughput das 12 semanas\nO que derruba a data: dependência do novo gateway de pagamento",
                },
                {
                    type: "text",
                    value: "## Comunicar incerteza sem perder a mesa\n\nExiste um medo legítimo: se eu falar em probabilidade, vão achar que estou enrolando. A saída está na forma da frase. Compare: dizer que não dá para saber derruba sua credibilidade; dizer que, pelo histórico do time, 85 por cento dos cenários entregam esse objetivo até 30 de junho, e que o maior risco é a dependência do gateway, mantém você na mesa e ainda entrega uma ação ao interlocutor.\n\nTrês hábitos ajudam. Primeiro, separe o que é compromisso do que é previsão: o objetivo do trimestre pode ser compromisso; a lista de itens é previsão. Segundo, torne visível o que muda a data, porque risco nomeado é risco gerenciável. Terceiro, atualize o plano com dados a cada Sprint e avise cedo quando a previsão piorar.\n\nO contrário disso, que quase todo time já fez, é sustentar a data original até uma semana antes e então anunciar o atraso. Do lado de fora, isso não parece azar: parece que ninguém estava olhando.",
                },
            ],
            questions: [
                {
                    statement: "Como um marco de release deve ser escrito num plano ágil?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como objetivo verificável, não como lista de features",
                            isCorrect: true,
                        },
                        {
                            text: "Como lista de features com data fechada em contrato",
                            isCorrect: false,
                        },
                        {
                            text: "Como cronograma de doze meses aprovado no início",
                            isCorrect: false,
                        },
                        {
                            text: "Como a soma dos pontos previstos para o trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece quando um marco é escrito como lista de features com data?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No primeiro atraso, tudo vira negociação confusa",
                            isCorrect: true,
                        },
                        {
                            text: "O time entrega mais rápido por causa da pressão",
                            isCorrect: false,
                        },
                        {
                            text: "A qualidade sobe porque o escopo fica claro",
                            isCorrect: false,
                        },
                        {
                            text: "O cliente entende melhor o valor do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um stakeholder pergunta a data e o time responde apenas que não dá para saber. Qual é o efeito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O time perde a mesa: nada acionável foi oferecido",
                            isCorrect: true,
                        },
                        {
                            text: "O stakeholder passa a confiar mais na honestidade",
                            isCorrect: false,
                        },
                        {
                            text: "O projeto ganha tempo para ajustar o escopo todo",
                            isCorrect: false,
                        },
                        {
                            text: "Nada muda: previsão não é assunto do time ágil",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como tratar a lista de itens que está dentro de um marco escrito por objetivo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como hipótese, que se ajusta com o que a Review ensina",
                            isCorrect: true,
                        },
                        {
                            text: "Como compromisso fechado com o cliente e a diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Como escopo travado até a data final do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Como estimativa em horas revisada uma vez por mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A previsão piorou já na terceira Sprint do trimestre. Quando avisar o negócio?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Agora, junto com o que muda a data e as opções",
                            isCorrect: true,
                        },
                        {
                            text: "Na semana anterior à data, com o número final",
                            isCorrect: false,
                        },
                        {
                            text: "Só na Review do último sprint do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Depois de tentar recuperar com hora extra",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Compromissos com o negócio",
            blocks: [
                {
                    type: "text",
                    value: "# O Sprint Goal é o compromisso real\n\nAqui está a distinção que separa um time confiável de um time que só promete: o compromisso da Sprint é o SPRINT GOAL, não a lista de itens selecionados. O Guia 2020 é explícito nisso, e a razão é prática. O objetivo é uma direção que pode ser alcançada por caminhos diferentes; a lista é uma hipótese de como chegar lá.\n\nUm Sprint Goal bom é curto, único e verificável do lado de fora. Reduzir o abandono no checkout permitindo pagar com um toque para quem já comprou é um objetivo. Terminar os itens 14, 15, 17 e 22 é uma lista com título bonito.\n\nA consequência prática aparece na quinta-feira da segunda semana. Se o time percebe que dois dos cinco itens não vão caber, com Sprint Goal ele conversa com o PO, corta o item menos essencial e ainda entrega o objetivo. Sem Sprint Goal, qualquer item que fica de fora é fracasso, e o time aprende a prometer menos do que pode fazer para nunca errar.",
                },
                {
                    type: "table",
                    value: '[["Situação","Compromisso na lista","Compromisso no Sprint Goal"],["Item não vai caber","A Sprint falhou","Corta o item, mantém o objetivo"],["Chega uma urgência","Nada pode entrar","Troca consciente junto com o PO"],["Na Review","Conta itens fechados","Mostra o objetivo alcançado"],["Comportamento do time","Promete pouco por segurança","Assume objetivo e negocia escopo"],["Conversa com o negócio","Sobre lista de tarefas","Sobre o resultado esperado"]]',
                },
                {
                    type: "quote",
                    value: "O compromisso do time é com o Sprint Goal, e o escopo é a hipótese de como chegar nele. Trocar a hipótese durante a Sprint não é falha: é o método funcionando.",
                },
                {
                    type: "text",
                    value: "## O que dizer quando não vai caber\n\nToda pessoa que trabalha com produto vive esse momento. O negócio quer três coisas até o fim do mês e cabem duas. Existem quatro respostas possíveis e só uma sustenta a relação no ano seguinte.\n\nDizer sim para tudo e entregar duas destrói a confiança e ainda gasta o crédito de quem prometeu. Dizer não seco e sem alternativa transfere o problema e queima capital político. Prometer contando com hora extra funciona uma vez e cobra caro nas Sprints seguintes, com bug e gente cansada. A quarta é a que funciona: apresentar o que cabe, o custo do que não cabe e as opções reais.\n\nNa prática, a frase tem três partes. O que cabe com segurança, apoiado no histórico das últimas cinco Sprints. O custo do resto, no formato de que C entra se A sair, ou entra na Sprint seguinte. E a decisão que é do outro: qual dos dois você prefere? Repara que a última parte devolve a escolha a quem tem autoridade sobre valor, que é exatamente o desenho do Scrum.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o compromisso do time numa Sprint?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O Sprint Goal, não a lista de itens selecionados",
                            isCorrect: true,
                        },
                        {
                            text: "A lista completa dos itens que entraram no plano",
                            isCorrect: false,
                        },
                        {
                            text: "A data de release combinada com a diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "A velocity média das últimas cinco Sprints feitas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual destas frases é um Sprint Goal de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reduzir o abandono no checkout de quem já comprou",
                            isCorrect: true,
                        },
                        {
                            text: "Terminar os itens 14, 15, 17 e 22 do backlog",
                            isCorrect: false,
                        },
                        {
                            text: "Fechar 25 pontos, que é a velocity média do time",
                            isCorrect: false,
                        },
                        {
                            text: "Corrigir todos os bugs abertos no sistema hoje",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na quinta-feira da segunda semana, dois dos cinco itens não vão caber. O time tem um Sprint Goal claro. O que fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cortar o item menos essencial e entregar o objetivo",
                            isCorrect: true,
                        },
                        {
                            text: "Declarar a Sprint fracassada e recomeçar na segunda",
                            isCorrect: false,
                        },
                        {
                            text: "Fazer hora extra até fechar os cinco itens do plano",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao Scrum Master que cancele a Sprint agora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O negócio quer três entregas no mês e cabem duas. Qual resposta sustenta a relação no longo prazo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostrar o que cabe, o custo do resto e as opções",
                            isCorrect: true,
                        },
                        {
                            text: "Dizer sim para os três e resolver depois com sorte",
                            isCorrect: false,
                        },
                        {
                            text: "Dizer não sem alternativa e encerrar a conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Prometer os três contando com hora extra do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um time sem Sprint Goal tende a prometer menos do que consegue entregar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem objetivo, todo item de fora vira fracasso visível",
                            isCorrect: true,
                        },
                        {
                            text: "Porque time sem objetivo trabalha menos horas por dia",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o Product Owner corta o escopo por precaução",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a velocity média cai quando falta objetivo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Anti-padrões e escala",
    aulas: [
        {
            titulo: "PO proxy e PO comitê",
            blocks: [
                {
                    type: "text",
                    value: "# Duas formas de quebrar o mesmo desenho\n\nO Scrum coloca uma pessoa no centro da decisão de valor, e as duas distorções mais comuns atacam exatamente esse centro, cada uma por um lado.\n\nO PO PROXY é o Product Owner sem autoridade. Ele fala com o time, escreve histórias, participa dos eventos, mas não decide nada: leva o pedido do time até o PO de verdade, que é um diretor ou gerente de negócio que nunca aparece. O sintoma clássico é a frase preciso confirmar surgindo em toda decisão de ordem. O custo é o atraso de todo aprendizado, porque cada feedback do time vira uma rodada extra de telefone sem fio.\n\nO PO COMITÊ é o oposto: em vez de ninguém decidir, muita gente decide. Um fórum quinzenal com representantes de marketing, vendas, operações e financeiro reordena o backlog por consenso. O resultado é um backlog que muda de rumo a cada quinze dias, porque consenso entre áreas com metas diferentes produz média, não direção.\n\nOs dois quebram a mesma coisa: a ligação curta entre quem decide o valor e quem constrói o produto.",
                },
                {
                    type: "table",
                    value: '[["Sintoma observável","PO proxy","PO comitê"],["Frase típica","Preciso confirmar lá em cima","Vamos levar isso para o fórum"],["Tempo de decisão","Dias por pergunta simples","Até a próxima reunião do grupo"],["Coerência do backlog","Depende de quem responder","Muda de rumo a cada quinzena"],["Quem sente primeiro","Time esperando parado","Time refazendo o que já fez"],["Raiz comum","Autoridade não delegada","Ninguém quer perder o voto"]]',
                },
                {
                    type: "quote",
                    value: "Nos dois casos o desenho quebra no mesmo ponto: a distância entre quem decide o valor e quem constrói o produto ficou longa demais para o aprendizado atravessar.",
                },
                {
                    type: "text",
                    value: "## Como reverter, sem heroísmo\n\nReverter não é apresentar o Guia do Scrum numa reunião. É reduzir a distância aos poucos, com evidência na mão.\n\nPrimeiro passo: tornar o custo visível. Registre por duas ou três Sprints quanto tempo cada decisão levou e o que ficou parado esperando. Um número simples, do tipo onze dias de espera por decisão de ordem no trimestre, muda mais conversa que qualquer citação de guia.\n\nSegundo: peça delegação pequena e específica, não autoridade total. A pergunta sobre poder decidir sozinho tudo que fica abaixo de certo impacto costuma ser aceita quando um pedido genérico de autonomia não é.\n\nTerceiro, no caso do comitê: transforme o fórum de decisão em fórum de INFLUÊNCIA. As áreas trazem contexto, dados e pedidos; a ordenação sai com uma pessoa e é comunicada com o motivo. Muita gente aceita perder o voto quando ganha explicação e previsibilidade.\n\nE existe o caso em que a empresa simplesmente não vai mudar. Aí a honestidade é dizer o nome do arranjo em vez de fingir Scrum, porque o pior cenário é pagar o custo do rito sem o benefício da decisão curta.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um PO proxy?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Fala com o time, mas não tem autoridade de decidir",
                            isCorrect: true,
                        },
                        {
                            text: "Decide tudo sozinho, sem ouvir nenhuma outra área",
                            isCorrect: false,
                        },
                        {
                            text: "Acumula os papéis de PO e de Scrum Master no time",
                            isCorrect: false,
                        },
                        {
                            text: "Trabalha em dois produtos ao mesmo tempo sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o efeito mais visível de um PO comitê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O backlog muda de rumo a cada nova reunião",
                            isCorrect: true,
                        },
                        {
                            text: "O time entrega mais rápido por causa do consenso",
                            isCorrect: false,
                        },
                        {
                            text: "As histórias ficam melhor escritas e detalhadas",
                            isCorrect: false,
                        },
                        {
                            text: "A velocity do time sobe de forma consistente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Cada decisão de ordem do backlog leva dias porque o PO precisa confirmar com alguém. Qual é o primeiro passo para reverter?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Medir e mostrar o tempo perdido esperando decisão",
                            isCorrect: true,
                        },
                        {
                            text: "Apresentar o Guia do Scrum numa reunião com todos",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o PO por alguém mais antigo na empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Parar de perguntar e decidir tudo dentro do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fórum de sete pessoas reordena o backlog por consenso. Qual mudança preserva a influência das áreas sem quebrar o modelo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fórum vira de influência; a ordem sai com uma pessoa",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o fórum para incluir todas as áreas da casa",
                            isCorrect: false,
                        },
                        {
                            text: "Votar por maioria simples em vez de por consenso",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar o Scrum Master presidir e desempatar tudo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A empresa deixou claro que não vai delegar autoridade ao PO tão cedo. Qual é a postura honesta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nomear o arranjo real em vez de fingir que é Scrum",
                            isCorrect: true,
                        },
                        {
                            text: "Seguir com os eventos e esperar a cultura mudar",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o número de cerimônias para dar ritmo",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir demissão, porque o modelo não vai funcionar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Feature factory",
            blocks: [
                {
                    type: "text",
                    value: "# Esteira de entregas sem resultado\n\nFeature factory é o nome do time que produz muito e não sabe se produziu valor. O termo ficou popular com John Cutler, e a definição prática é simples: o sucesso é medido pelo que sai da esteira, nunca pelo que acontece depois que sai.\n\nOs sinais são fáceis de reconhecer. O roadmap é uma lista de funcionalidades com datas, e não uma lista de problemas a resolver. Ninguém no time sabe dizer o que aconteceu com a última entrega grande, se as pessoas usaram, se o número que motivou aquilo mudou. A ideia sempre chega pronta de cima, na forma de solução, como faça um chat na tela de pedido, e não na forma de problema, como as pessoas não conseguem falar com o entregador. E a pergunta sobre como vamos saber se deu certo incomoda a sala.\n\nO time sente isso como um cansaço estranho: entrega, entrega, entrega, e a sensação de progresso não chega. Do lado de fora, os gráficos parecem ótimos: burndown limpo, velocity estável, roadmap batendo.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Feature factory","Time orientado a resultado"],["Roadmap","Lista de features com data","Lista de problemas e objetivos"],["Definição de sucesso","Entregamos no prazo","O número que queríamos mudou"],["Origem da ideia","Chega pronta como solução","Chega como problema medido"],["Depois da entrega","Ninguém acompanha","Mede uso e decide manter ou tirar"],["Reação ao dado ruim","Segue o plano do trimestre","Muda o plano com o que aprendeu"]]',
                },
                {
                    type: "quote",
                    value: "Numa feature factory ninguém consegue responder o que aconteceu com a entrega do trimestre passado. O silêncio nessa pergunta é o diagnóstico inteiro.",
                },
                {
                    type: "text",
                    value: "## Sair da esteira, um passo por vez\n\nA saída não começa com reorganização, começa com uma pergunta feita antes de cada item grande: como vamos saber se deu certo? Escreva a resposta junto do item, com o número atual e o número esperado. No começo, quase todos os palpites vão errar feio, e é justamente aí que a coisa fica interessante.\n\nO segundo movimento é medir DEPOIS. Uma sessão curta a cada duas ou quatro semanas, só para olhar o que as entregas anteriores fizeram com os números. Ela cria o hábito que falta em quase todo time: fechar o ciclo.\n\nO terceiro é traduzir pedido de solução em problema. Quando chega uma solução pronta, a pergunta é qual problema aquilo resolve e para quem. Muitas vezes existe um caminho bem mais barato para o mesmo problema, e essa conversa é onde o PO ganha respeito.\n\nE a leitura crítica: nem tudo precisa de métrica. Obrigação legal, correção de bug crítico e dívida técnica de risco entram porque precisam. O que não pode existir é um trimestre inteiro sem uma única entrega com resultado verificado.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma feature factory?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Time que mede sucesso pelo que entrega, não pelo efeito",
                            isCorrect: true,
                        },
                        {
                            text: "Time que entrega poucas funcionalidades por trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Empresa que só vende software pronto de prateleira",
                            isCorrect: false,
                        },
                        {
                            text: "Time que trabalha com Kanban puro em vez de com Scrum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é um sinal claro de feature factory?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Roadmap é lista de features com data, não de problemas",
                            isCorrect: true,
                        },
                        {
                            text: "O time usa quadro digital em vez de post-it na parede",
                            isCorrect: false,
                        },
                        {
                            text: "As Sprints do time têm duração de apenas uma semana",
                            isCorrect: false,
                        },
                        {
                            text: "O Product Owner participa de todas as Dailies do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Chega da diretoria o pedido de colocar um chat na tela de pedido. Qual é a melhor resposta do PO?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perguntar qual problema isso resolve, e para quem",
                            isCorrect: true,
                        },
                        {
                            text: "Colocar no topo do backlog, porque veio da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar o pedido: solução pronta não entra nunca",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir estimativa em horas antes de qualquer coisa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time nunca sabe o que aconteceu com as entregas passadas. Qual hábito corrige isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sessão curta e periódica para olhar o efeito medido",
                            isCorrect: true,
                        },
                        {
                            text: "Relatório mensal com a soma dos pontos entregues",
                            isCorrect: false,
                        },
                        {
                            text: "Retrospective mais longa, com mais gente de fora",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o detalhe das histórias no refinamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um gestor argumenta que medir resultado atrasa a entrega. Qual resposta equilibrada cabe aqui?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Bug e obrigação legal entram sem métrica; o resto não",
                            isCorrect: true,
                        },
                        {
                            text: "Concordar: medir é luxo de empresa grande e madura",
                            isCorrect: false,
                        },
                        {
                            text: "Discordar: todo item precisa de métrica antes de sair",
                            isCorrect: false,
                        },
                        {
                            text: "Medir apenas o que a diretoria pedir explicitamente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Scrumfall e sprints de fase",
            blocks: [
                {
                    type: "text",
                    value: "# Cascata fatiada em quinze dias\n\nScrumfall é o híbrido em que a estrutura mental continua sendo cascata e só o calendário virou Scrum. A forma mais reconhecível é a sprint de fase: Sprint 1 de análise, Sprint 2 de desenvolvimento, Sprint 3 de testes, Sprint 4 de homologação. Cada sprint carrega o nome de uma fase, e o incremento utilizável só existe no fim de todas elas, quando existe.\n\nO problema não é estético. Quando a sprint é uma fase, ela não produz incremento, então não há o que inspecionar na Review, então não há adaptação real. O ciclo empírico está formalmente presente e materialmente ausente. Some a isso o efeito de concentrar teste no fim: os defeitos aparecem quando restam duas semanas e mudar arquitetura já não é opção.\n\nOutras variações do mesmo padrão: a sprint zero que dura dois meses montando arquitetura antes de qualquer entrega, e a sprint de estabilização recorrente, que é a confissão de que a Definition of Done não está sendo cumprida durante as Sprints normais.",
                },
                {
                    type: "table",
                    value: '[["Prática","Scrumfall","Scrum de verdade"],["Conteúdo da Sprint","Uma fase do processo","Fatia vertical utilizável"],["Testes","Concentrados no fim","Dentro da própria Sprint"],["Review","Slide de andamento da fase","Incremento funcionando"],["Sprint zero","Dois meses de arquitetura","Primeira fatia fina no ar"],["Estabilização","Recorrente no calendário","Não existe: a DoD é cumprida"]]',
                },
                {
                    type: "quote",
                    value: "Sprint de estabilização recorrente é a confissão pública de que a Definition of Done não está sendo cumprida nas outras Sprints.",
                },
                {
                    type: "text",
                    value: "## Por onde desmontar\n\nDesmontar scrumfall começa por um alvo pequeno e concreto: fazer UMA fatia vertical caber numa Sprint. Não a funcionalidade inteira, mas a menor versão dela que atravessa da tela ao banco e pode ser usada. É um exercício técnico e político: técnico porque exige fatiar melhor, político porque prova para a organização que o incremento é possível.\n\nO segundo alvo é a qualidade dentro da Sprint. Testar no fim é sintoma de teste manual caro e ambiente escasso. Enquanto for barato adiar o teste, ele vai ser adiado. Automatizar o caminho crítico e ter ambiente sob demanda muda o cálculo econômico do time, e o comportamento muda junto.\n\nO terceiro é linguagem. Trocar sprint de dev por um Sprint Goal de verdade obriga a conversa a mudar, porque objetivo verificável não cabe numa fase. Vale a leitura crítica: em contexto com integração externa lenta, ter o incremento pronto sem publicar é aceitável, e ele continua sendo incremento. O que não é aceitável é a fase virar norma permanente.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma sprint de fase?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sprint dedicada a análise, dev ou teste separados",
                            isCorrect: true,
                        },
                        {
                            text: "Sprint mais curta que o normal para acelerar",
                            isCorrect: false,
                        },
                        {
                            text: "Sprint sem Sprint Goal definido pelo time todo",
                            isCorrect: false,
                        },
                        {
                            text: "Sprint em que só o Product Owner é que trabalha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma sprint de estabilização recorrente revela sobre o time?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que a Definition of Done não é cumprida nas Sprints",
                            isCorrect: true,
                        },
                        {
                            text: "Que o time é maduro e reserva tempo para qualidade",
                            isCorrect: false,
                        },
                        {
                            text: "Que a Sprint deveria durar um mês em vez de duas",
                            isCorrect: false,
                        },
                        {
                            text: "Que faltam testadores dedicados dentro do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time faz Sprint 1 de análise, Sprint 2 de dev e Sprint 3 de teste. Por que o ciclo empírico não funciona ali?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem incremento por Sprint, não há o que inspecionar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o timebox de cada Sprint fica curto demais",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o Scrum Master não participa das três fases",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a Daily não cabe em sprint de análise pura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que os testes acabam sempre empurrados para o fim num time com scrumfall?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Testar é caro e manual, então adiar sai barato",
                            isCorrect: true,
                        },
                        {
                            text: "Porque testar antes é proibido pelo Guia do Scrum",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a equipe de QA sempre chega no fim do mês",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o PO só aprova o item depois de pronto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o primeiro alvo prático para desmontar scrumfall num time real?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Fazer uma fatia vertical fina caber numa Sprint",
                            isCorrect: true,
                        },
                        {
                            text: "Renomear as sprints com nomes mais modernos",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar um Scrum Master certificado de fora",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o timebox da Sprint para quatro semanas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escala com critério",
            blocks: [
                {
                    type: "text",
                    value: "# Quando um time vira dois\n\nA primeira pergunta sobre escala é se ela é mesmo necessária. Times crescem por reflexo: chegou orçamento, contrata; chegou pedido, contrata. E cada pessoa nova acrescenta canais de comunicação numa curva que não perdoa, além de criar dependências novas entre partes do sistema.\n\nAntes de dividir, vale checar se o gargalo é de fato capacidade de escrever código. Se o time espera revisão, ambiente, aprovação ou decisão, mais gente piora tudo, porque aumenta a fila em cima do mesmo gargalo. A pergunta honesta é: se dobrássemos o time amanhã, o que travaria primeiro?\n\nQuando dividir é mesmo necessário, o critério que funciona é fatiar por FLUXO DE VALOR, não por camada nem por especialidade. Dois times que atendem jornadas diferentes do cliente conseguem trabalhar em paralelo. Um time de front e um time de back precisam se coordenar em toda entrega, e você acabou de criar uma dependência permanente no lugar de duas autonomias. E cada time precisa do próprio PO, ou de uma ordenação clara que evite disputa de prioridade.",
                },
                {
                    type: "table",
                    value: '[["Critério de divisão","Consequência","Recomendação"],["Por camada, front e back","Dependência em toda entrega","Evitar"],["Por especialidade técnica","Fila de um time no outro","Evitar"],["Por jornada do cliente","Times entregam sozinhos","Preferir"],["Por produto ou domínio","Autonomia com contrato claro","Preferir"],["Por gerente disponível","Estrutura alheia ao fluxo","Evitar"]]',
                },
                {
                    type: "quote",
                    value: "Se o gargalo é revisão, ambiente ou decisão, contratar mais gente só aumenta a fila em cima do mesmo gargalo. Mais gente resolve pouco quando o problema é espera.",
                },
                {
                    type: "text",
                    value: "## O que o SAFe promete e o que ele cobra\n\nFrameworks de escala tentam resolver coordenação entre muitos times. O SAFe é o mais adotado em empresa grande e o mais criticado na comunidade, e vale entender os dois lados sem torcida.\n\nO que ele promete e às vezes entrega: linguagem comum entre dezenas de times, um ritual de planejamento conjunto que expõe dependências antes de elas doerem, responsabilidades definidas e uma trilha de adoção que executivo entende. Numa empresa de trezentas pessoas sem coordenação nenhuma, isso é melhora real.\n\nO que ele cobra: camadas de gestão que reaparecem com nome novo, planejamento longo em ciclos de três meses que reintroduz cascata, e autonomia de time reduzida na prática. Muita implantação vira um cronograma trimestral disfarçado de agilidade.\n\nEm 2026, a moda de escalar por framework passou e o critério ficou. O que sobreviveu bem é mais leve: reduzir dependências pela arquitetura, times pequenos e duráveis com contrato de API entre eles, e coordenação por objetivo comum em vez de por processo comum.",
                },
            ],
            questions: [
                {
                    statement: "Qual critério de divisão de times funciona melhor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Por jornada do cliente ou domínio do produto",
                            isCorrect: true,
                        },
                        {
                            text: "Por camada técnica: um de front, um de back",
                            isCorrect: false,
                        },
                        {
                            text: "Por especialidade: teste, banco e integração",
                            isCorrect: false,
                        },
                        {
                            text: "Por gerente disponível em cada trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que checar antes de dividir um time em dois?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Se o gargalo é mesmo capacidade de escrever código",
                            isCorrect: true,
                        },
                        {
                            text: "Se o orçamento do ano comporta as contratações",
                            isCorrect: false,
                        },
                        {
                            text: "Se existe sala física para acomodar os dois times",
                            isCorrect: false,
                        },
                        {
                            text: "Se o Scrum Master consegue atender os dois times",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time espera dias por revisão e por ambiente, e a diretoria quer contratar mais cinco devs. O que tende a acontecer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A fila cresce em cima do mesmo gargalo de espera",
                            isCorrect: true,
                        },
                        {
                            text: "A entrega dobra, porque há o dobro de gente codando",
                            isCorrect: false,
                        },
                        {
                            text: "A qualidade sobe com mais gente revisando código",
                            isCorrect: false,
                        },
                        {
                            text: "O cycle time cai pela metade em duas semanas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o SAFe costuma entregar de fato numa empresa grande e sem coordenação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Linguagem comum e dependências expostas mais cedo",
                            isCorrect: true,
                        },
                        {
                            text: "Autonomia total para cada time do programa todo",
                            isCorrect: false,
                        },
                        {
                            text: "Redução imediata do custo de operação da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Fim das camadas de gestão dentro da organização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a crítica mais consistente às implantações de framework de escala?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ciclo trimestral longo reintroduz cascata disfarçada",
                            isCorrect: true,
                        },
                        {
                            text: "Exigem ferramenta paga e servidor próprio na nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "Não funcionam com times menores que trinta pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "Proíbem o uso de Kanban dentro dos times do trem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Mudando um time real",
            blocks: [
                {
                    type: "text",
                    value: "# Transparência primeiro\n\nToda tentativa de mudar um time começa com a mesma tentação: instalar o processo inteiro na segunda-feira. Isso quase sempre falha, porque processo novo sem problema visível é imposição, e imposição gera cumprimento formal, que é a fachada estudada lá no começo desta trilha.\n\nO primeiro movimento é sempre transparência, por três motivos. É o mais barato: um quadro que reflete a realidade custa uma tarde de trabalho. É o menos ameaçador: ninguém perde poder porque o trabalho ficou visível. E é o que produz os argumentos para todo o resto, porque quando o quadro mostra oito itens parados em revisão, a conversa sobre limite de WIP acontece sozinha e vem do time, não de quem está tentando mudar as coisas.\n\nDepois de tornar visível, escolha UM problema que o time reconhece como dor e resolva. Um só. A tentação de arrumar cinco coisas ao mesmo tempo é o erro mais comum, porque nada fica bem feito e ninguém consegue dizer o que funcionou. Vitória pequena e rápida compra permissão para a próxima.",
                },
                {
                    type: "table",
                    value: '[["Ordem","Movimento","Por que nessa posição"],["1","Tornar o trabalho visível","Barato e não ameaça ninguém"],["2","Resolver uma dor reconhecida","Compra permissão para o resto"],["3","Medir o fluxo com dados simples","Troca opinião por evidência"],["4","Ajustar eventos e artefatos","Agora existe motivo para eles"],["5","Conversar com quem decide fora","Sustenta o que o time mudou"]]',
                },
                {
                    type: "quote",
                    value: "Processo novo sem problema visível é imposição, e imposição produz cumprimento formal. Torne a dor visível primeiro; aí o processo passa a ser pedido, não imposto.",
                },
                {
                    type: "text",
                    value: "## O papel do PO na mudança\n\nO Product Owner tem uma alavanca que ninguém mais tem: ele é a ponte entre o time e o mundo que cobra. Três movimentos concretos.\n\nO primeiro é proteger o Sprint Goal em público. Quando o pedido urgente chega, a resposta do PO, perguntando o que sai para isso entrar, ensina a organização inteira que existe capacidade finita. Repetida algumas vezes, essa frase muda mais a cultura que qualquer treinamento.\n\nO segundo é trazer resultado, não só entrega. Começar a Review contando o que aconteceu desde a última, com números, cria a expectativa de que entrega tem consequência verificada. Em pouco tempo alguém de fora começa a perguntar pelo resultado antes de você mostrar.\n\nO terceiro é dizer não com alternativa, sempre com o custo à vista. É assim que se constrói a autoridade que o guia descreve e nenhuma empresa entrega pronta.\n\nO fechamento honesto: mudar um time leva meses, e a maior parte do trabalho é conversa, não framework. Você vai errar a ordem algumas vezes, e a única falha grave é parar de inspecionar o que está tentando.",
                },
            ],
            questions: [
                {
                    statement: "Por onde começar a mudar um time?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pela transparência: tornar o trabalho visível",
                            isCorrect: true,
                        },
                        {
                            text: "Pela instalação do processo completo de uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "Pela contratação de um coach ágil externo",
                            isCorrect: false,
                        },
                        {
                            text: "Pela troca das pessoas que resistem à mudança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantos problemas atacar primeiro numa mudança de time?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um só, escolhido entre as dores que o time reconhece",
                            isCorrect: true,
                        },
                        {
                            text: "Todos ao mesmo tempo, para acelerar a transformação",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: primeiro treina todo mundo por três meses",
                            isCorrect: false,
                        },
                        {
                            text: "Cinco por trimestre, conforme o plano do consultor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Chega um pedido urgente durante a Sprint. Qual resposta do PO educa a organização?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Isso entra, e o que sai no lugar? Capacidade é finita",
                            isCorrect: true,
                        },
                        {
                            text: "Pode entrar: o time dá um jeito de encaixar tudo",
                            isCorrect: false,
                        },
                        {
                            text: "Não pode entrar de jeito nenhum durante a Sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Vou levar para o comitê decidir na próxima semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o PO ganha ao abrir a Review com os resultados da entrega anterior?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cria a expectativa de que entrega tem consequência",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz o tempo da Review para menos de vinte minutos",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa a presença dos Developers naquele evento",
                            isCorrect: false,
                        },
                        {
                            text: "Elimina a necessidade de refinar o backlog depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Alguém instalou todos os eventos do Scrum na primeira semana e o time cumpre tudo sem mudar nada. O que faltou?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Faltou dor visível: o processo virou imposição",
                            isCorrect: true,
                        },
                        {
                            text: "Faltou treinar o time em certificação oficial",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou uma ferramenta melhor para o quadro",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou o apoio formal do diretor daquela área",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: um sprint na cadeira do PO (leitura guiada)",
    aulas: [
        {
            titulo: "O cenário: Entregaí",
            blocks: [
                {
                    type: "text",
                    value: "# Você acabou de sentar na cadeira\n\nO Entregaí é um app de delivery de comida numa cidade média. Existe há dois anos, tem 40 mil usuários cadastrados, 6 mil pedidos por semana e uma equipe de sete pessoas: cinco Developers, uma Scrum Master e você, que assumiu como Product Owner na semana passada.\n\nO contexto que te entregaram é este. A taxa de conversão do carrinho caiu de 62 para 54 por cento em três meses. O suporte reclama de dúvidas sobre entrega, e a pergunta sobre onde está o pedido responde por 40 por cento dos contatos. O comercial fechou parceria com uma rede de padarias que quer estar no app até o fim do trimestre. As Sprints são de duas semanas e o histórico das últimas cinco ficou entre 18 e 25 pontos.\n\nO backlog que você herdou é uma lista de doze itens misturados: história bem escrita, bug, tarefa técnica, pedido de diretor, ideia solta. Nada está ordenado, nada tem critério de aceite e cinco itens estão parados há mais de seis meses.",
                },
                {
                    type: "table",
                    value: '[["Item","Como está escrito no backlog","Origem"],["1","Cliente não consegue repetir o último pedido","Suporte"],["2","Botão de rastreio do pedido em tempo real","Pesquisa com usuário"],["3","Migrar o banco para a versão nova","Time técnico"],["4","Cadastro de lojas parceiras em lote","Comercial"],["5","Cupom de primeira compra não aplica no iOS","Bug de produção"],["6","Tela de perfil mais bonita","Ideia do diretor"],["7","Notificar quando o pedido sair para entrega","Suporte"],["8","Checkout pede o endereço duas vezes","Bug de produção"],["9","Programa de fidelidade completo","Ideia do diretor"],["10","Painel de métricas para o comercial","Comercial"],["11","Trocar a biblioteca de gráficos","Time técnico"],["12","Reduzir o checkout de 5 para 3 passos","Pesquisa com usuário"]]',
                },
                {
                    type: "quote",
                    value: "Backlog herdado nunca é uma lista de tarefas: é o registro arqueológico das promessas que alguém fez. Sua primeira tarefa não é executar, é entender o que cada item resolvia.",
                },
                {
                    type: "text",
                    value: "## O que você sabe e o que precisa descobrir\n\nAntes de mexer em qualquer ordem, separe fato de opinião. FATOS: a conversão caiu 8 pontos percentuais, 40 por cento dos contatos de suporte são sobre status de entrega, existe uma parceria comercial com prazo de trimestre e o time entrega entre 18 e 25 pontos por Sprint. OPINIÕES: que a tela de perfil precisa ficar mais bonita, que o programa de fidelidade é urgente, que trocar a biblioteca de gráficos é prioridade.\n\nDuas perguntas de partida orientam tudo. A primeira: qual problema custa mais caro hoje? A queda de conversão bate direto no faturamento e tem números para sustentar. A segunda: qual item tem prazo externo real? A parceria de padarias, porque data combinada com terceiro é diferente de vontade interna.\n\nRepara no que ainda não dá para responder: por que a conversão caiu. Pode ser o checkout, pode ser preço, pode ser concorrente novo. O bug do endereço duplicado no checkout é um suspeito com evidência, e é por isso que ele vai pesar tanto na aula seguinte.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a primeira coisa a fazer com um backlog herdado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entender qual problema cada item pretendia resolver",
                            isCorrect: true,
                        },
                        {
                            text: "Começar a executar de cima para baixo na ordem",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar tudo e escrever um backlog novo do zero",
                            isCorrect: false,
                        },
                        {
                            text: "Estimar em pontos todos os itens já na primeira semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No cenário do Entregaí, qual destes é um fato e não uma opinião?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A conversão do carrinho caiu de 62% para 54%",
                            isCorrect: true,
                        },
                        {
                            text: "A tela de perfil precisa ficar mais bonita",
                            isCorrect: false,
                        },
                        {
                            text: "O programa de fidelidade é o item urgente",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a biblioteca de gráficos é prioridade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual item do backlog do Entregaí tem prazo externo real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O cadastro das lojas parceiras, com data comercial",
                            isCorrect: true,
                        },
                        {
                            text: "A migração do banco para a versão nova do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "O programa de fidelidade completo pedido acima",
                            isCorrect: false,
                        },
                        {
                            text: "A tela de perfil mais bonita pedida pelo diretor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O diretor pediu a tela de perfil mais bonita. Como o PO trata esse pedido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Buscar o problema por trás e comparar com os outros",
                            isCorrect: true,
                        },
                        {
                            text: "Colocar no topo, porque veio de quem tem cargo alto",
                            isCorrect: false,
                        },
                        {
                            text: "Descartar o pedido: diretor não define backlog",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar direto para os Developers estimarem hoje",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A conversão caiu 8 pontos e ninguém sabe por quê. Qual item merece atenção primeiro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O bug do endereço duplicado: suspeito com evidência",
                            isCorrect: true,
                        },
                        {
                            text: "O programa de fidelidade, que aumenta a retenção",
                            isCorrect: false,
                        },
                        {
                            text: "A migração do banco, que melhora a performance",
                            isCorrect: false,
                        },
                        {
                            text: "O painel de métricas pedido pela área comercial",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ordenar e refinar",
            blocks: [
                {
                    type: "text",
                    value: "# Três forças na hora de ordenar\n\nOrdenar é a decisão mais visível de um PO, e ela combina três forças. VALOR: quanto o item move um número que importa. RISCO: quanta incerteza a entrega elimina, ou quanto dano ela evita. DEPENDÊNCIA: se aquele item destrava outros ou está bloqueado por algo.\n\nAplicando ao Entregaí, o topo se organiza assim. O bug do endereço duplicado no checkout vai primeiro: é barato, ataca o número que caiu e ainda vira evidência para a hipótese. Reduzir os passos do checkout vem em seguida, atacando a mesma queda com esforço maior. O cadastro das lojas parceiras entra logo depois por causa da data externa. Notificar quando o pedido sai para entrega ataca os 40 por cento do suporte com uma fatia pequena.\n\nDescem para o fim: a tela de perfil bonita, sem problema declarado; o programa de fidelidade, grande demais e sem hipótese; a troca da biblioteca de gráficos, sem impacto visível; e o painel de métricas do comercial, que provavelmente se resolve com uma planilha por enquanto.",
                },
                {
                    type: "table",
                    value: '[["Posição","Item","Por que fica aqui"],["1","Corrigir endereço duplicado no checkout","Barato e ataca a conversão"],["2","Checkout de 5 para 3 passos","Mesma queda, esforço maior"],["3","Cadastro de lojas parceiras","Data externa já combinada"],["4","Notificação de saída para entrega","Corta contato de suporte"],["5","Repetir o último pedido","Valor claro, sem urgência"],["Fim","Perfil bonito e fidelidade","Sem problema declarado"]]',
                },
                {
                    type: "code",
                    value: "# Item 8 reescrito como história com critérios\nComo cliente que já cadastrou endereço,\nquero concluir o pedido sem digitar o endereço de novo,\npara não desistir no meio do checkout.\n\nDADO que tenho um endereço salvo e escolhi entregar nele\nQUANDO avanço para o pagamento\nENTÃO o endereço não é pedido outra vez\n\nDADO que não tenho endereço salvo\nQUANDO chego na etapa de entrega\nENTÃO informo o endereço uma única vez e ele fica salvo\n\n# Item 7 reescrito como fatia fina\nComo cliente com pedido em preparo,\nquero ser avisado quando o pedido sair para entrega,\npara não abrir o app a cada cinco minutos.\n\nDADO que autorizei notificações e meu pedido saiu para entrega\nQUANDO o status muda para Saiu para entrega\nENTÃO recebo uma notificação com a previsão de chegada",
                },
                {
                    type: "quote",
                    value: "Ordenar é escolher o que NÃO será feito agora. Um PO que nunca desce um item para o fim da lista não está ordenando, está empilhando.",
                },
                {
                    type: "text",
                    value: "## O que fazer com os itens grandes demais\n\nO programa de fidelidade completo é o item mais perigoso do backlog, porque tem patrocínio de diretor e nenhum contorno. Ele não desce para o fim por ser ruim: desce por não ser decidível, já que ninguém sabe qual problema resolve, para quem, nem como saberíamos se funcionou.\n\nExistem duas saídas honestas. A primeira é transformá-lo numa pergunta: qual comportamento queremos mudar? Se a resposta for aumentar a frequência de pedido de quem já comprou, existe uma fatia bem menor para testar essa hipótese, como um cupom para quem não pede há trinta dias. A segunda é assumir que ele fica onde está até alguém trazer o problema, e comunicar isso ao diretor com a razão à vista.\n\nSobre a migração de banco e a troca da biblioteca: itens técnicos entram no backlog e disputam ordem como todos os outros, mas o argumento precisa ser traduzido em risco ou custo. Dizer que a versão fica sem suporte de segurança a partir de março é argumento; dizer que está velho não é.",
                },
            ],
            questions: [
                {
                    statement: "Quais três forças combinam na hora de ordenar o backlog?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Valor, risco e dependência entre os itens",
                            isCorrect: true,
                        },
                        {
                            text: "Cargo de quem pediu, idade e tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Esforço, prazo legal e custo de nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "Estimativa, velocity e horas do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o bug do endereço duplicado vai para o topo do backlog?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É barato e ataca direto o número que caiu",
                            isCorrect: true,
                        },
                        {
                            text: "Porque bug sempre vem antes de qualquer história",
                            isCorrect: false,
                        },
                        {
                            text: "Porque foi o diretor quem relatou esse problema",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time técnico pediu prioridade para ele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O programa de fidelidade completo desce para o fim do backlog. Qual é a razão principal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não é decidível: falta problema, público e métrica",
                            isCorrect: true,
                        },
                        {
                            text: "É caro demais para o orçamento deste trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "O diretor que pediu já saiu da empresa faz tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Fidelidade nunca funciona em aplicativo de comida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer priorizar a migração do banco. Que tipo de argumento sustenta isso na ordenação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Risco concreto: versão sem suporte a partir de março",
                            isCorrect: true,
                        },
                        {
                            text: "A tecnologia atual já está velha e desatualizada",
                            isCorrect: false,
                        },
                        {
                            text: "O time prefere trabalhar com a versão mais nova",
                            isCorrect: false,
                        },
                        {
                            text: "Itens técnicos não precisam disputar ordem nenhuma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como reescrever o item de notificar quando o pedido sai para entrega numa fatia fina?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um aviso na saída, com critério de dado e de erro",
                            isCorrect: true,
                        },
                        {
                            text: "Um centro de notificações completo com histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Uma tarefa técnica de integrar o serviço de push",
                            isCorrect: false,
                        },
                        {
                            text: "Uma pesquisa com usuários antes de escrever nada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A Planning",
            blocks: [
                {
                    type: "text",
                    value: "# Negociar o Sprint Goal\n\nA Planning começa pelo porquê. Você propõe reduzir o abandono no checkout entregando um caminho de compra sem repetição de dados. Os Developers ouvem, e a Scrum Master pergunta o que dentro desta Sprint prova que o objetivo foi alcançado. Vocês fecham assim: o cliente com endereço salvo conclui a compra sem digitar o endereço de novo, em três passos.\n\nRepara no que esse objetivo faz. Ele exclui a parceria de padarias e a notificação de entrega, e isso é bom, porque uma Sprint com três objetivos não tem nenhum. Ele também deixa espaço, já que pode ser alcançado por caminhos diferentes.\n\nAgora a capacidade honesta. O histórico é de 18 a 25 pontos. Nesta Sprint tem um feriado e uma pessoa de férias por três dias, então a conversa realista fica em torno de 15 a 18. Não existe cálculo mágico aqui: existe o time olhando o calendário e dizendo o que consegue sustentar sem hora extra. A tentação nesse momento é empurrar só mais um item, e é exatamente aí que a Sprint começa a falhar.",
                },
                {
                    type: "table",
                    value: '[["Item","Decisão","Motivo"],["Endereço duplicado no checkout","Entra","Núcleo do Sprint Goal"],["Checkout de 5 para 3 passos","Entra","Completa o objetivo"],["Cadastro de lojas parceiras","Fica fora","Não serve ao objetivo desta Sprint"],["Notificação de saída","Fica fora","Sprint seguinte, com data dita"],["Migração do banco","Fica fora","Sem risco datado até aqui"],["Fidelidade completa","Fica fora","Sem problema definido"]]',
                },
                {
                    type: "quote",
                    value: "Uma Sprint com três objetivos não tem objetivo nenhum. A força do Sprint Goal vem exatamente daquilo que ele deixa de fora.",
                },
                {
                    type: "text",
                    value: "## Comunicar o que ficou de fora\n\nO erro que queima PO iniciante não é escolher errado, é deixar o corte implícito. O comercial acredita que a parceria de padarias está sendo feita agora, porque ninguém disse o contrário, e vai descobrir na segunda-feira da outra semana, quando já for tarde para reagir.\n\nA comunicação que funciona tem três partes e cabe numa mensagem curta. O que está sendo feito e por quê: esta Sprint ataca o abandono no checkout, que derrubou 8 pontos de conversão. O que não está e quando entra: o cadastro das lojas parceiras entra na Sprint seguinte, que começa dia 24, com previsão de estar no ar até 8 de outubro. E o convite explícito para contestar: se essa ordem prejudica algum compromisso já assumido, me fale hoje.\n\nRepara na terceira parte. Ela não é gentileza: é o que transforma o corte numa decisão que sobrevive à cobrança depois, porque quem podia reclamar teve a chance e o registro está de pé.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o primeiro tópico da Sprint Planning?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Por que esta Sprint é valiosa: o Sprint Goal",
                            isCorrect: true,
                        },
                        {
                            text: "Quantas horas cada dev tem disponível na Sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Quais bugs foram abertos na Sprint anterior",
                            isCorrect: false,
                        },
                        {
                            text: "Qual a velocity média das últimas Sprints",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma Sprint não deve carregar três objetivos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Com três objetivos, na prática não há nenhum",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o Guia limita a Sprint a um item só",
                            isCorrect: false,
                        },
                        {
                            text: "Porque três objetivos exigem três Dailies",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o PO não consegue escrever três metas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Nesta Sprint há um feriado e uma pessoa de férias por três dias. O histórico é de 18 a 25 pontos. Como tratar a capacidade?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reduzir a faixa para algo próximo de 15 a 18 pontos",
                            isCorrect: true,
                        },
                        {
                            text: "Manter 25, porque o time compensa com dedicação",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar o calendário: velocity já considera isso",
                            isCorrect: false,
                        },
                        {
                            text: "Cancelar a Sprint e retomar logo depois do feriado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O cadastro das lojas parceiras ficou de fora desta Sprint. O que o PO faz em seguida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Avisar o comercial com data prevista e convite a contestar",
                            isCorrect: true,
                        },
                        {
                            text: "Esperar o comercial perguntar, para não criar ruído agora",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao Scrum Master que comunique o corte para as áreas",
                            isCorrect: false,
                        },
                        {
                            text: "Colocar o item de volta na Sprint para evitar conflito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o convite explícito para contestar a ordem faz diferença?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Transforma o corte em decisão que sobrevive à cobrança",
                            isCorrect: true,
                        },
                        {
                            text: "Permite que qualquer área reverta a ordem quando quiser",
                            isCorrect: false,
                        },
                        {
                            text: "Serve para o PO transferir a responsabilidade da ordem",
                            isCorrect: false,
                        },
                        {
                            text: "Cumpre uma exigência formal do Guia do Scrum 2020",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Meio do sprint",
            blocks: [
                {
                    type: "text",
                    value: "# Quarta-feira, 14h20\n\nO alerta chega junto com o telefone tocando: pedidos com pagamento por Pix estão falhando desde as 13h. Cerca de 15 por cento das tentativas retornam erro, o suporte já acumulou trinta contatos e o time de pagamentos do parceiro confirma um problema do lado deles, sem previsão. Existe um contorno possível do nosso lado, e dois Developers estimam meio dia para colocar de pé.\n\nEssa é a situação que separa entendimento de decoreba. Duas leituras erradas costumam aparecer. A primeira diz que nada entra na Sprint porque o escopo é sagrado. Errado: o guia proíbe mudanças que ameacem o Sprint Goal, não qualquer mudança, e o escopo pode ser renegociado entre PO e Developers conforme o time aprende. A segunda diz que urgência manda e joga tudo para o lado. Também errado, porque a decisão precisa passar pelo PO e ficar visível.\n\nA leitura correta é uma pergunta de troca: o que sai para isso entrar, e o Sprint Goal continua alcançável? Se sim, é troca consciente. Se não, o assunto passa a ser outro.",
                },
                {
                    type: "table",
                    value: '[["Opção","Efeito no Sprint Goal","Custo"],["Entrar sem tirar nada","Ameaça: falta meio dia","Time compensa com hora extra"],["Trocar pelo item de 3 passos","Preservado em parte","Objetivo sai reduzido"],["Trocar por parte do checkout","Preservado","Fatia menor do mesmo objetivo"],["Ignorar o incidente","Preservado no papel","Perda de receita acontecendo agora"],["Cancelar a Sprint","Deixa de existir","Só cabe se o Goal ficar obsoleto"]]',
                },
                {
                    type: "quote",
                    value: "O Guia não proíbe mudança durante a Sprint. Proíbe mudança que ameace o Sprint Goal, e a diferença entre as duas coisas é uma conversa de dez minutos com quem faz.",
                },
                {
                    type: "text",
                    value: "## A decisão e como ela fica registrada\n\nA escolha do PO: o contorno do Pix entra, e sai a parte do checkout que reduzia de quatro para três passos, ficando de cinco para quatro nesta Sprint. O Sprint Goal continua alcançável, porque o cliente com endereço salvo segue concluindo a compra sem redigitar, que era o núcleo do objetivo.\n\nTrês detalhes fazem essa decisão ser profissional e não improviso. O primeiro é a conversa com os Developers antes de decidir, porque quem sabe o custo real do contorno são eles. O segundo é o registro visível: o item que saiu volta para o topo do Product Backlog com o motivo escrito, para ninguém achar depois que ele foi esquecido. O terceiro é o aviso curto aos interessados no mesmo dia.\n\nE a pergunta que sempre aparece: e se o incidente fosse grande a ponto de comer a Sprint inteira? Aí o Sprint Goal deixaria de fazer sentido, e a única pessoa que pode cancelar a Sprint é o Product Owner. Cancelar não é punição: é reconhecer que insistir custaria mais que recomeçar.",
                },
            ],
            questions: [
                {
                    statement: "O que o Guia do Scrum proíbe durante a Sprint?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mudanças que ameacem o Sprint Goal combinado",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer alteração no escopo já selecionado",
                            isCorrect: false,
                        },
                        {
                            text: "Conversa entre o PO e os Developers no meio",
                            isCorrect: false,
                        },
                        {
                            text: "Entrada de qualquer item novo no Sprint Backlog",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem decide se um item novo entra no meio da Sprint?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O PO, conversando com os Developers sobre o custo",
                            isCorrect: true,
                        },
                        {
                            text: "O gerente da área que abriu o chamado urgente",
                            isCorrect: false,
                        },
                        {
                            text: "O Scrum Master, que protege o time das urgências",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer Developer que estiver com tempo livre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O contorno do Pix custa meio dia de trabalho. Qual é a pergunta certa antes de aceitar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que sai, e o Sprint Goal segue alcançável?",
                            isCorrect: true,
                        },
                        {
                            text: "Quem vai assumir a culpa se atrasar depois?",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos pontos esse contorno vale na conta?",
                            isCorrect: false,
                        },
                        {
                            text: "O time consegue fazer hora extra esta semana?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O item que saiu da Sprint para dar lugar ao contorno. O que fazer com ele?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Voltar ao topo do Product Backlog com o motivo",
                            isCorrect: true,
                        },
                        {
                            text: "Descartar de vez: item cortado não volta mais",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar numa planilha à parte do time técnico",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar como concluído para não sujar a métrica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O incidente cresceu e vai consumir a Sprint inteira, e o Sprint Goal perdeu o sentido. O que pode acontecer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Só o Product Owner pode cancelar aquela Sprint",
                            isCorrect: true,
                        },
                        {
                            text: "O Scrum Master cancela e comunica os envolvidos",
                            isCorrect: false,
                        },
                        {
                            text: "Os Developers decidem por votação da maioria",
                            isCorrect: false,
                        },
                        {
                            text: "Ninguém pode: toda Sprint precisa terminar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Review e Retro",
            blocks: [
                {
                    type: "text",
                    value: "# O ciclo se fecha na quinta-feira\n\nA Review do Entregaí começa como toda Review boa: não com slide, mas com o produto no ar. Você mostra o checkout novo funcionando numa conta com endereço salvo, mostra o contorno do Pix operando e diz, sem enfeite, que a redução de passos ficou pela metade por causa da troca feita no meio da Sprint.\n\nDepois vêm os números, que é a parte que a maioria dos times pula. Conversão do carrinho: 54 por cento antes, 58 por cento nos primeiros quatro dias com o checkout novo. Contatos de suporte sobre pagamento: pico de trinta na quarta, três no dia seguinte ao contorno. Não é prova definitiva, o período é curto e pode haver outros efeitos, e dizer isso em voz alta aumenta a sua credibilidade em vez de reduzir.\n\nO comercial pergunta pelas padarias, você confirma a Sprint seguinte com data, e alguém do suporte sugere avisar o cliente quando o Pix falha, em vez de só mostrar erro. Esse é o momento mais valioso da Review: o backlog mudou por causa de quem estava na sala.",
                },
                {
                    type: "table",
                    value: '[["Indicador","Antes","Depois","Leitura"],["Conversão do carrinho","54%","58% em 4 dias","Promissor, período curto"],["Contatos sobre pagamento","30 na quarta","3 no dia seguinte","O contorno funcionou"],["Itens planejados","5","4 entregues","Troca consciente no meio"],["Sprint Goal","Definido","Alcançado em parte","Núcleo entregue"],["Cycle time médio","6 dias","4 dias","Menos itens abertos juntos"]]',
                },
                {
                    type: "quote",
                    value: "Uma Review que termina com o Product Backlog exatamente igual ao que entrou não foi uma Review: foi uma apresentação com plateia.",
                },
                {
                    type: "text",
                    value: "## A Retro e o que fica\n\nNa Retrospective, o time olha para dentro. Três pontos aparecem. O primeiro: a troca no meio da Sprint funcionou porque a conversa aconteceu antes da decisão, e todo mundo reconhece isso. O segundo: dois itens ficaram parados dois dias esperando revisão, e o time propõe uma regra de revisar o que está aberto antes de começar coisa nova. O terceiro: o critério de aceite do checkout não previa o caso de endereço parcialmente preenchido, e o retrabalho custou meio dia.\n\nSai uma melhoria escolhida, uma só, com dono e prazo: revisão antes de código novo, valendo já na próxima Sprint, com o time reavaliando o efeito daqui a duas semanas.\n\nRepara no ciclo inteiro que você atravessou. Um backlog bruto virou ordem justificada, a ordem virou objetivo, o objetivo sobreviveu a um incidente, a entrega virou número e o número virou backlog novo. Nada disso dependeu de ferramenta ou de vocabulário: dependeu de decidir com clareza, dizer o que não vai ser feito e olhar para o resultado depois.",
                },
            ],
            questions: [
                {
                    statement: "Como uma boa Sprint Review começa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Com o produto funcionando, não com slides",
                            isCorrect: true,
                        },
                        {
                            text: "Com a leitura da ata da Review anterior",
                            isCorrect: false,
                        },
                        {
                            text: "Com o relatório de horas gastas no mês",
                            isCorrect: false,
                        },
                        {
                            text: "Com a apresentação de slides do roadmap",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que indica que a Review cumpriu o papel dela?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O Product Backlog mudou por causa do feedback",
                            isCorrect: true,
                        },
                        {
                            text: "Todos os itens planejados foram entregues",
                            isCorrect: false,
                        },
                        {
                            text: "Os stakeholders aplaudiram a apresentação",
                            isCorrect: false,
                        },
                        {
                            text: "O time terminou o evento bem antes do tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A conversão subiu de 54 para 58 por cento em quatro dias. Como comunicar isso na Review?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como sinal promissor, dizendo que o período é curto",
                            isCorrect: true,
                        },
                        {
                            text: "Como prova definitiva de que a mudança funcionou",
                            isCorrect: false,
                        },
                        {
                            text: "Como número interno, sem contar aos stakeholders",
                            isCorrect: false,
                        },
                        {
                            text: "Como meta batida, já registrada no plano do ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na Retrospective apareceram três pontos de melhoria. Quantos o time deve levar adiante?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um, com dono e prazo, reavaliado na Sprint seguinte",
                            isCorrect: true,
                        },
                        {
                            text: "Os três, para aproveitar melhor o esforço do evento",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: melhoria é assunto da próxima Retrospective",
                            isCorrect: false,
                        },
                        {
                            text: "Só o que o Scrum Master considerar mais urgente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois itens ficaram parados dois dias esperando revisão. Qual melhoria ataca isso direto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Revisar o que está aberto antes de começar coisa nova",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a quantidade de itens abertos por pessoa",
                            isCorrect: false,
                        },
                        {
                            text: "Estimar os itens em horas para saber quando revisar",
                            isCorrect: false,
                        },
                        {
                            text: "Remover a etapa de revisão do fluxo de trabalho todo",
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
