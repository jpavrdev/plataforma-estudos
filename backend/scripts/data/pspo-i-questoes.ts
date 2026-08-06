// Banco de questões do simulado Scrum.org Professional Scrum Product Owner I (PSPO I).
// Compartilhado pelo seed (instalação nova) e por eventuais scripts de atualização.
// Regras do banco: cenários curtos no estilo da prova real, base fiel ao Guia do
// Scrum 2020 e ao EBM introdutório, distratores plausíveis (vícios de gestão
// tradicional) e a correta nunca sendo a única opção visivelmente mais longa.
// A prova PSPO I real é de resposta única, então o banco segue o mesmo formato.

export type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

export const QUESTOES: Questao[] = [
    {
        statement:
            "Os Developers atualizam o andamento do trabalho apenas no último dia da Sprint, e o Product Owner descobre problemas tarde demais para reagir. Qual pilar do empirismo está comprometido nesse cenário?",
        explanation:
            "Sem transparência (transparency) não há inspeção útil: o trabalho e o processo precisam estar visíveis para quem executa e para quem recebe o resultado. Inspeção sobre dados escondidos engana e leva a decisões ruins, por isso os artefatos do Scrum têm compromissos que reforçam essa visibilidade. Compromisso é um valor do Scrum, não um pilar.",
        topic: "Scrum e empirismo",
        options: [
            [
                "Transparência, porque o estado real do trabalho não está visível para quem decide.",
                true,
            ],
            [
                "Adaptação, porque o time deveria ter trocado de processo assim que o problema surgiu.",
                false,
            ],
            [
                "Inspeção, porque o Product Owner deveria auditar o código dos Developers diariamente.",
                false,
            ],
            [
                "Compromisso, porque o time não assinou um acordo formal de metas com os stakeholders.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um time realiza a Sprint Retrospective em todas as Sprints, identifica sempre os mesmos problemas e nunca muda nada na forma de trabalhar. O que o Scrum diz sobre essa situação?",
        explanation:
            "A inspeção (inspection) existe para detectar variações indesejadas e disparar a adaptação (adaptation): quando algo sai dos limites aceitáveis, o ajuste deve acontecer o quanto antes para reduzir novos desvios. A Retrospective é o evento formal para inspecionar e adaptar o modo de trabalho, e nenhum evento do Scrum é opcional.",
        topic: "Scrum e empirismo",
        options: [
            [
                "Inspeção sem adaptação não tem sentido: o exame precisa gerar ajuste no processo.",
                true,
            ],
            [
                "A prática está correta, pois o objetivo da Retrospective é apenas registrar aprendizados.",
                false,
            ],
            [
                "O time deveria abandonar a Retrospective, já que ela não é um evento obrigatório do Scrum.",
                false,
            ],
            [
                "O Scrum Master deve impor as mudanças que julgar necessárias, já que o time não decide.",
                false,
            ],
        ],
    },
    {
        statement:
            "No terceiro dia da Sprint, os Developers percebem que o plano da Sprint Backlog não os levará à Sprint Goal. Quando devem ajustar o plano?",
        explanation:
            "A adaptação (adaptation) deve acontecer o mais cedo possível para minimizar o desvio. A Sprint Backlog pertence aos Developers e é atualizada durante toda a Sprint conforme eles aprendem mais, e o Daily Scrum existe para inspecionar o progresso rumo à meta da Sprint (Sprint Goal) e ajustar o plano, sem depender de aprovação externa.",
        topic: "Scrum e empirismo",
        options: [
            [
                "Assim que o desvio for percebido, pois a Sprint Backlog é atualizada ao longo da Sprint.",
                true,
            ],
            [
                "Na próxima Sprint Planning, porque o plano de uma Sprint não pode ser alterado depois de fechado.",
                false,
            ],
            [
                "Na Sprint Retrospective, que é o evento reservado para discutir e corrigir problemas do time.",
                false,
            ],
            [
                "Somente após aprovação do Product Owner, dono de todas as decisões de planejamento do time.",
                false,
            ],
        ],
    },
    {
        statement:
            "Além do empirismo, o Scrum se fundamenta em outro pilar teórico. Qual é ele e o que significa?",
        explanation:
            "O Scrum é fundado no empirismo (empiricism) e no pensamento enxuto (lean thinking): o conhecimento vem da experiência, as decisões vêm do que é observado, e o desperdício é reduzido com foco no essencial. As demais opções descrevem abordagens tradicionais que o Scrum substitui em ambientes complexos.",
        topic: "Scrum e empirismo",
        options: [
            ["O pensamento enxuto, que reduz desperdício e foca no essencial.", true],
            ["A gestão científica, com tarefas medidas e cronometradas por gerentes.", false],
            ["O modelo em cascata, com fases sequenciais e bem documentadas.", false],
            ["A engenharia de requisitos, que congela o escopo antes da construção.", false],
        ],
    },
    {
        statement: "Quais são os cinco valores do Scrum descritos no Guia do Scrum?",
        explanation:
            "Os valores do Scrum são compromisso (commitment), foco (focus), abertura (openness), respeito (respect) e coragem (courage). Quando o time os vive, os pilares de transparência, inspeção e adaptação ganham vida e constroem confiança. Transparência, inspeção e adaptação são os pilares do empirismo, não os valores.",
        topic: "Scrum e empirismo",
        options: [
            ["Compromisso, foco, abertura, respeito e coragem.", true],
            ["Transparência, inspeção, adaptação, empirismo e melhoria.", false],
            ["Comunicação, simplicidade, feedback, coragem e respeito.", false],
            ["Colaboração, entrega, qualidade, velocidade e previsão.", false],
        ],
    },
    {
        statement:
            "Uma Developer percebe que uma decisão técnica antiga do time está prejudicando o produto, mas evita levantar o assunto para não gerar conflito. Qual valor do Scrum precisa ser fortalecido?",
        explanation:
            "O valor da coragem (courage) orienta os membros do Scrum Team a fazer a coisa certa e a trabalhar em problemas difíceis, o que inclui expor desacordos técnicos. Respeito não significa silenciar discordâncias, e compromisso é com as metas do time, não com decisões intocáveis. Sem coragem, a transparência também se perde.",
        topic: "Scrum e empirismo",
        options: [
            ["Coragem, para tratar assuntos difíceis e problemas duros.", true],
            ["Foco, para que ela se concentre nas tarefas que assumiu na Sprint.", false],
            ["Compromisso, para que ela cumpra o plano sem questionar decisões.", false],
            ["Respeito, para que ela preserve a decisão dos colegas do time.", false],
        ],
    },
    {
        statement:
            "Durante a Sprint, os Developers atendem pedidos avulsos de vários departamentos e a Sprint Goal fica em segundo plano. Qual valor do Scrum está sendo negligenciado?",
        explanation:
            "O valor do foco (focus) diz que o principal foco do time é o trabalho da Sprint, para o melhor progresso possível em direção às metas. Pedidos avulsos que atropelam a meta da Sprint (Sprint Goal) corroem esse valor, e cabe ao Scrum Master ajudar a remover interferências que ameacem a meta.",
        topic: "Scrum e empirismo",
        options: [
            ["Foco, pois o trabalho principal do time é o progresso rumo à meta da Sprint.", true],
            [
                "Abertura, pois o time deveria comunicar aos departamentos todos os detalhes da Sprint.",
                false,
            ],
            [
                "Coragem, pois o time deveria aceitar qualquer demanda desafiadora que chegar até ele.",
                false,
            ],
            [
                "Respeito, pois o time deveria valorizar mais as demandas dos departamentos externos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um time esconde dos stakeholders as dificuldades técnicas que estão atrasando o produto, com medo de parecer incompetente. Qual valor do Scrum está em falta?",
        explanation:
            "O valor da abertura (openness) pede que o Scrum Team e os stakeholders sejam abertos sobre o trabalho e os desafios. Esconder dificuldades destrói a transparência e impede decisões empíricas de quem depende dessa informação. Horas extras não são resposta do Scrum a atrasos, e afastar stakeholders reduz colaboração.",
        topic: "Scrum e empirismo",
        options: [
            [
                "Abertura sobre o trabalho e os desafios, tanto no time quanto com os stakeholders.",
                true,
            ],
            [
                "Foco, porque falar de dificuldades desviaria a atenção do time das entregas da Sprint.",
                false,
            ],
            [
                "Compromisso, porque o time deveria compensar o atraso trabalhando horas adicionais.",
                false,
            ],
            [
                "Coragem, porque o time deveria remover os stakeholders das conversas sobre o produto.",
                false,
            ],
        ],
    },
    {
        statement:
            "Em um Scrum Team, sugestões técnicas de pessoas mais novas são sistematicamente ignoradas, sem qualquer avaliação. Qual valor do Scrum é ferido nesse comportamento?",
        explanation:
            "O valor do respeito (respect) estabelece que os membros do Scrum Team se respeitam mutuamente como pessoas capazes e independentes, o que exige considerar as contribuições de todos. Respeitar não é aprovar tudo automaticamente, e sim avaliar ideias pelo mérito, independentemente de senioridade.",
        topic: "Scrum e empirismo",
        options: [
            ["Respeito, pois os membros se respeitam como pessoas capazes e independentes.", true],
            [
                "Compromisso, pois todas as pessoas do time deveriam aceitar as propostas umas das outras.",
                false,
            ],
            [
                "Foco, pois o tempo gasto avaliando propostas novas atrapalha o andamento da Sprint.",
                false,
            ],
            [
                "Abertura, pois qualquer ideia apresentada em reunião deveria ser aprovada pelo grupo.",
                false,
            ],
        ],
    },
    {
        statement:
            "Para caber uma funcionalidade grande inteira, o time propõe estender a próxima Sprint para seis semanas. O que o Guia do Scrum estabelece sobre a duração da Sprint?",
        explanation:
            "Sprints têm duração fixa (timebox) de um mês ou menos. Horizontes maiores deixam a meta da Sprint (Sprint Goal) instável, aumentam a complexidade e o risco e reduzem os ciclos de aprendizado. Se o trabalho não cabe, o caminho é decompor os itens no refinamento, nunca esticar a Sprint.",
        topic: "Scrum e empirismo",
        options: [
            ["A Sprint tem duração fixa de um mês ou menos, para manter consistência.", true],
            [
                "A Sprint pode durar até seis semanas quando o Product Owner aprovar formalmente a extensão.",
                false,
            ],
            [
                "A duração é livre, desde que o time inteiro concorde com o novo prazo antes da Planning.",
                false,
            ],
            [
                "A Sprint pode ser estendida durante a execução sempre que a meta estiver ameaçada.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um Scrum Team trabalha com Sprints de um mês. Qual é o limite de tempo da Sprint Planning nesse caso?",
        explanation:
            "A Sprint Planning tem limite (timebox) de oito horas para uma Sprint de um mês; para Sprints mais curtas, o evento costuma ser mais curto. Quatro horas é o limite da Sprint Review e três horas o da Sprint Retrospective, ambos também para Sprints de um mês. O plano não precisa sair completo: ele evolui durante a Sprint.",
        topic: "Scrum e empirismo",
        options: [
            ["No máximo oito horas, e costuma ser menor para Sprints mais curtas.", true],
            [
                "No máximo quatro horas, mesmo limite aplicado à Sprint Review desse mesmo time.",
                false,
            ],
            [
                "No máximo três horas, mesmo limite aplicado à Sprint Retrospective desse time.",
                false,
            ],
            [
                "Um dia inteiro de trabalho, para que o plano da Sprint saia completo e detalhado.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um Scrum Team cresceu de cinco para nove Developers e o Scrum Master sugeriu aumentar o Daily Scrum para trinta minutos. O que o Guia do Scrum define sobre esse evento?",
        explanation:
            "O Daily Scrum é um evento de quinze minutos para os Developers, realizado todo dia útil da Sprint, de preferência no mesmo horário e local para reduzir complexidade. O limite (timebox) não muda com o tamanho do time; se quinze minutos não bastam, o sinal é de excesso de pessoas ou de evento virando reunião de status.",
        topic: "Scrum e empirismo",
        options: [
            [
                "O Daily Scrum tem duração fixa de quinze minutos, independentemente do tamanho do time.",
                true,
            ],
            [
                "A duração cresce proporcionalmente ao número de pessoas, respeitando o teto de uma hora.",
                false,
            ],
            [
                "O evento não tem limite de tempo, desde que aconteça no mesmo horário todos os dias.",
                false,
            ],
            [
                "Times com mais de sete Developers devem dividir o Daily em duas sessões de quinze minutos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um gerente passou a comparecer ao Daily Scrum e a pedir que cada Developer justifique o que fez no dia anterior. O que está errado nessa situação segundo o Scrum?",
        explanation:
            "O Daily Scrum é dos Developers e serve para inspecionar o progresso em direção à meta da Sprint (Sprint Goal) e adaptar a Sprint Backlog. Não é reunião de status para terceiros: transformar o evento em prestação de contas mina o auto-gerenciamento (self-management). Se Product Owner ou Scrum Master trabalham em itens da Sprint Backlog, participam como Developers.",
        topic: "Scrum e empirismo",
        options: [
            [
                "O Daily Scrum é um evento dos Developers para ajustar o próprio plano, não uma reunião de status.",
                true,
            ],
            [
                "Nada, desde que o gerente limite as perguntas dele aos quinze minutos previstos para o evento.",
                false,
            ],
            [
                "O erro é apenas de formato: as justificativas deveriam ser enviadas por escrito antes do evento.",
                false,
            ],
            [
                "O gerente deveria antes pedir autorização ao Product Owner para conduzir o Daily Scrum do time.",
                false,
            ],
        ],
    },
    {
        statement: "Qual é o limite de tempo da Sprint Review para uma Sprint de um mês?",
        explanation:
            "A Sprint Review tem limite (timebox) de quatro horas para uma Sprint de um mês, geralmente menor em Sprints mais curtas. Oito horas é o teto da Sprint Planning e três horas o da Sprint Retrospective. Todos os eventos do Scrum têm duração máxima definida justamente para criar regularidade e reduzir desperdício.",
        topic: "Scrum e empirismo",
        options: [
            ["Até quatro horas, e geralmente menos para Sprints mais curtas.", true],
            ["Até oito horas, o mesmo limite definido para a Sprint Planning de um mês.", false],
            ["Até três horas, o mesmo limite definido para a Sprint Retrospective do time.", false],
            [
                "Não há limite, pois a duração depende da quantidade de stakeholders presentes.",
                false,
            ],
        ],
    },
    {
        statement:
            "O Scrum Master de um time com Sprints mensais reservou uma tarde inteira de cinco horas para a Sprint Retrospective. O que diz o Guia do Scrum?",
        explanation:
            "A Sprint Retrospective é limitada (timebox) a três horas para uma Sprint de um mês, geralmente menos para Sprints mais curtas. Quatro horas é o teto da Sprint Review, e o evento mais curto do framework é o Daily Scrum, com quinze minutos. O propósito da Retrospective é planejar formas de aumentar qualidade e eficácia.",
        topic: "Scrum e empirismo",
        options: [
            ["O evento tem limite de três horas para Sprints de um mês.", true],
            ["A reserva está correta, pois a Retrospective não tem limite.", false],
            ["O limite correto é de quatro horas, igual ao da Sprint Review.", false],
            ["O limite é de uma hora, o menor entre os eventos do Scrum.", false],
        ],
    },
    {
        statement:
            "Ao fim de cada Sprint, um time costuma esperar uma semana de estabilização antes de começar a próxima. O que o Guia do Scrum determina?",
        explanation:
            "Uma nova Sprint começa imediatamente (immediately) após a conclusão da Sprint anterior: não existem pausas, Sprints de estabilização ou de endurecimento (hardening) no Scrum. Trabalho de qualidade, testes e correções fazem parte da definição de pronto (Definition of Done) dentro de cada Sprint.",
        topic: "Scrum e empirismo",
        options: [
            ["Uma nova Sprint começa imediatamente após a conclusão da anterior.", true],
            [
                "Pausas curtas entre Sprints são recomendadas para consolidar testes e documentação.",
                false,
            ],
            [
                "O intervalo é permitido quando aprovado pelo Product Owner e pelos stakeholders.",
                false,
            ],
            [
                "O time pode intercalar Sprints de entrega com Sprints dedicadas somente a correções.",
                false,
            ],
        ],
    },
    {
        statement:
            "No meio da Sprint, os stakeholders concluem que a Sprint Goal perdeu completamente o sentido por uma mudança regulatória. Quem tem autoridade para cancelar a Sprint?",
        explanation:
            "Somente o Product Owner tem autoridade para cancelar a Sprint, e isso ocorre quando a meta da Sprint (Sprint Goal) se torna obsoleta. Stakeholders, Scrum Master e Developers podem trazer informações e influenciar a decisão, mas a palavra final sobre o cancelamento é exclusiva do Product Owner.",
        topic: "Scrum e empirismo",
        options: [
            ["Apenas o Product Owner, dono da decisão de cancelamento.", true],
            ["O Scrum Master, guardião do processo e dos eventos do time.", false],
            ["Os Developers em conjunto, já que a Sprint Backlog é deles.", false],
            ["Os stakeholders afetados, junto com quem financia o produto.", false],
        ],
    },
    {
        statement:
            "Em qual situação o cancelamento de uma Sprint é justificado segundo o Guia do Scrum?",
        explanation:
            "Uma Sprint só é cancelada se a meta da Sprint (Sprint Goal) se tornar obsoleta, por exemplo após uma mudança brusca de mercado ou de estratégia. Não terminar todos os itens não é motivo: o escopo pode ser renegociado com o Product Owner ao longo da Sprint, desde que a meta continue de pé.",
        topic: "Scrum e empirismo",
        options: [
            ["Quando a Sprint Goal se torna obsoleta para o negócio.", true],
            ["Quando os Developers não conseguem terminar todos os itens.", false],
            ["Quando um stakeholder discorda da ordenação do Product Backlog.", false],
            ["Quando os defeitos da Sprint passam do limite aceitável do time.", false],
        ],
    },
    {
        statement:
            "Durante a Sprint, o Product Owner percebe que um detalhe de um item selecionado precisa mudar, sem afetar a Sprint Goal. Como o Scrum trata mudanças nesse momento?",
        explanation:
            "Durante a Sprint não se fazem mudanças que coloquem em risco a meta da Sprint (Sprint Goal), mas o escopo pode ser esclarecido e renegociado com o Product Owner conforme o time aprende mais. A Sprint não é um contrato congelado, e o Scrum Master não é um controlador de escopo.",
        topic: "Scrum e empirismo",
        options: [
            [
                "O escopo pode ser esclarecido e renegociado com os Developers conforme se aprende mais.",
                true,
            ],
            [
                "Nenhuma alteração é permitida na Sprint: qualquer mudança deve aguardar a próxima Planning.",
                false,
            ],
            [
                "A mudança exige o cancelamento imediato da Sprint e a realização de uma nova Planning.",
                false,
            ],
            [
                "A mudança deve ser aprovada pelo Scrum Master, que controla o escopo durante a Sprint.",
                false,
            ],
        ],
    },
    {
        statement:
            "Pressionado pelo prazo, um time decide pular testes previstos na Definition of Done para entregar mais itens na Sprint. O que o Guia do Scrum estabelece?",
        explanation:
            "Durante a Sprint a qualidade não diminui: itens que não atendem a definição de pronto (Definition of Done) não fazem parte do incremento (Increment) e não podem ser liberados. Se o trabalho não cabe, negocia-se escopo com o Product Owner. Sprints dedicadas a correções não existem no Scrum.",
        topic: "Scrum e empirismo",
        options: [
            [
                "A qualidade não diminui durante a Sprint: a Definition of Done continua valendo.",
                true,
            ],
            [
                "Reduzir a qualidade é aceitável quando a decisão é registrada e comunicada aos stakeholders.",
                false,
            ],
            [
                "A Definition of Done pode ser suspensa em Sprints críticas mediante acordo com o Product Owner.",
                false,
            ],
            [
                "O time pode entregar sem os testes e compensar criando uma Sprint dedicada a correções.",
                false,
            ],
        ],
    },
    {
        statement: "Qual é a relação entre a Sprint e os demais eventos do Scrum?",
        explanation:
            "A Sprint é o batimento cardíaco do Scrum e funciona como contêiner (container) para todos os demais eventos: Sprint Planning, Daily Scrum, Sprint Review e Sprint Retrospective acontecem dentro dela. Cada evento é uma oportunidade formal de inspecionar e adaptar artefatos, criando regularidade e reduzindo reuniões avulsas.",
        topic: "Scrum e empirismo",
        options: [
            ["A Sprint é um contêiner que engloba todos os outros eventos.", true],
            ["A Sprint fica entre a Planning e a Review, que estão fora dela.", false],
            ["A Sprint engloba só o desenvolvimento; os eventos ficam fora.", false],
            ["A Sprint é um dos cinco eventos e ocorre em paralelo aos outros.", false],
        ],
    },
    {
        statement:
            "Uma empresa criou dentro do Scrum Team os cargos de analista de requisitos, líder técnico e gerente de projeto, além das accountabilities do Scrum. O que o Guia do Scrum define sobre a composição do time?",
        explanation:
            "O Scrum Team é formado por um Scrum Master, um Product Owner e Developers, sem sub-times nem hierarquias internas. As três responsabilidades (accountabilities) cobrem tudo o que o time precisa, e criar camadas internas fragmenta o foco e mina o auto-gerenciamento (self-management).",
        topic: "Scrum e empirismo",
        options: [
            ["O Scrum Team tem três accountabilities e nenhum sub-time interno.", true],
            [
                "Cargos adicionais são bem-vindos desde que o Scrum Master aprove a estrutura.",
                false,
            ],
            ["O Scrum permite hierarquias internas quando o time passa de dez pessoas.", false],
            ["Cada especialidade do produto deve virar um sub-time com seu responsável.", false],
        ],
    },
    {
        statement:
            "Um Scrum Team chegou a dezenove pessoas e a comunicação ficou lenta e cara. O que o Guia do Scrum orienta sobre o tamanho do time?",
        explanation:
            "O Scrum Team é pequeno o bastante para permanecer ágil e grande o bastante para completar trabalho significativo, tipicamente dez pessoas ou menos. Se ficar grande demais, deve considerar se reorganizar em vários Scrum Teams coesos, compartilhando a mesma meta do produto (Product Goal), o mesmo Product Backlog e o mesmo Product Owner.",
        topic: "Scrum e empirismo",
        options: [
            ["Tipicamente dez pessoas ou menos, com reorganização em times menores.", true],
            ["Entre quinze e vinte pessoas, desde que exista um coordenador dedicado.", false],
            ["Não há orientação de tamanho: o que importa é a soma das habilidades.", false],
            ["Times grandes devem dividir a Sprint em duas metades com metas próprias.", false],
        ],
    },
    {
        statement:
            "A diretoria decidiu que as decisões de Product Owner passarão a ser tomadas por um comitê de três gerentes, que votam a cada mudança do Product Backlog. O que o Guia do Scrum estabelece?",
        explanation:
            "O Product Owner é uma pessoa, e não um comitê. Ele pode representar as necessidades de muitos stakeholders no Product Backlog, e quem quiser mudar o Product Backlog precisa convencê-lo. Decisão por votação destrói a responsabilidade única (single accountability) e torna a ordenação lenta e incoerente.",
        topic: "Scrum e empirismo",
        options: [
            ["O Product Owner é uma pessoa, e não um comitê que decide por voto.", true],
            ["O comitê é aceitável desde que um dos gerentes tenha voto de desempate.", false],
            ["O comitê pode decidir a ordem, cabendo ao Scrum Master registrar tudo.", false],
            ["A decisão coletiva é preferível, pois distribui o risco entre as áreas.", false],
        ],
    },
    {
        statement:
            "Um Scrum Master começou a distribuir tarefas entre os Developers e a cobrar prazos individuais de cada um. Como o Guia do Scrum descreve essa responsabilidade?",
        explanation:
            "O Scrum Master é um líder que serve (true leader who serves) o Scrum Team e a organização, responsável pela eficácia do time. Ele remove impedimentos e treina as práticas, mas quem decide quem faz o quê são os próprios Developers, por auto-gerenciamento (self-management).",
        topic: "Scrum e empirismo",
        options: [
            ["É um líder que serve, sem distribuir tarefas entre os Developers.", true],
            ["É o gerente do time, responsável por atribuir e cobrar tarefas diárias.", false],
            ["É o responsável por aprovar as estimativas antes do início do trabalho.", false],
            ["É quem responde pela entrega da Sprint diante do Product Owner e da área.", false],
        ],
    },
    {
        statement:
            "Um time recém-formado quer saber quais assuntos precisam ser tratados na Sprint Planning. Quais são os três tópicos previstos no Guia do Scrum?",
        explanation:
            "A Sprint Planning trata de por que esta Sprint é valiosa, o que pode ser feito nela e como o trabalho escolhido será realizado. O primeiro tópico resulta na meta da Sprint (Sprint Goal), o segundo na seleção de itens e o terceiro no plano dos Developers, e juntos formam a Sprint Backlog.",
        topic: "Scrum e empirismo",
        options: [
            ["Por que a Sprint é valiosa, o que pode ser feito e como será feito.", true],
            ["Prazo de entrega, custo estimado do escopo e responsável por cada item.", false],
            ["Revisão da Sprint anterior, plano da atual e previsão da Sprint seguinte.", false],
            ["Estimativa em horas, alocação das pessoas e aprovação do Product Owner.", false],
        ],
    },
    {
        statement:
            "Ao final da Sprint Planning, um time saiu com a lista de itens selecionados, mas sem nenhum objetivo comum para a Sprint. O que ficou faltando e quando deveria ter sido definido?",
        explanation:
            "A meta da Sprint (Sprint Goal) é criada durante a Sprint Planning e é o compromisso da Sprint Backlog. Sem ela o time perde a coerência e o critério para renegociar escopo. A meta é o objetivo único da Sprint, e não a soma dos itens selecionados nem um resumo escrito depois.",
        topic: "Scrum e empirismo",
        options: [
            ["Faltou a Sprint Goal, definida na própria Sprint Planning.", true],
            ["Faltou o plano por hora, que deveria sair no fim da Sprint Planning.", false],
            ["Faltou a Sprint Goal, que o Product Owner escreve após o primeiro Daily.", false],
            ["Faltou a aprovação dos stakeholders sobre os itens escolhidos na Sprint.", false],
        ],
    },
    {
        statement:
            "Um gerente pediu para reorganizar a Sprint Backlog do time no meio da Sprint, alegando que a sequência das tarefas estava ineficiente. Quem responde por esse artefato?",
        explanation:
            "A Sprint Backlog é composta pela meta da Sprint (Sprint Goal), pelos itens selecionados e pelo plano de entrega, e pertence exclusivamente aos Developers. É um plano feito por e para eles, atualizado ao longo da Sprint conforme aprendem mais, sem intervenção de fora do time.",
        topic: "Scrum e empirismo",
        options: [
            ["Os Developers, que criam e atualizam o plano ao longo da Sprint.", true],
            ["O Product Owner, que responde pelo valor entregue em cada Sprint.", false],
            ["O Scrum Master, que garante o cumprimento do plano feito na Planning.", false],
            ["O gerente de projeto, que responde pela eficiência do uso das horas.", false],
        ],
    },
    {
        statement:
            "Um time considera pronto um item que ainda depende de testes previstos na Definition of Done. Esse item faz parte do Incremento da Sprint?",
        explanation:
            "O compromisso do incremento (Increment) é a definição de pronto (Definition of Done). Trabalho que não atende a esse critério não é incremento, não é liberado nem apresentado como concluído na Sprint Review: ele volta para o Product Backlog para ser considerado no futuro.",
        topic: "Scrum e empirismo",
        options: [
            ["Não, pois só é incremento o que atende à Definition of Done.", true],
            ["Sim, desde que o Product Owner aceite o item na Sprint Review.", false],
            ["Sim, pois a Definition of Done só vale no momento do release final.", false],
            ["Depende do Scrum Master, que define o que entra no incremento.", false],
        ],
    },
    {
        statement: "Qual é o compromisso associado ao Product Backlog no Guia do Scrum 2020?",
        explanation:
            "Cada artefato tem um compromisso: o Product Backlog tem a meta do produto (Product Goal), a Sprint Backlog tem a meta da Sprint (Sprint Goal) e o incremento (Increment) tem a definição de pronto (Definition of Done). Os compromissos reforçam o empirismo ao dar foco e transparência.",
        topic: "Scrum e empirismo",
        options: [
            ["O Product Goal, que descreve o objetivo futuro do produto.", true],
            ["A Definition of Done, que fixa a qualidade mínima de cada item.", false],
            ["O Sprint Goal, que dá coerência ao trabalho escolhido na Sprint.", false],
            ["O roadmap aprovado, que fixa as entregas dos próximos trimestres.", false],
        ],
    },
    {
        statement:
            "A organização já possui uma Definition of Done corporativa, e um Scrum Team quer adotar critérios adicionais mais rigorosos para o seu produto. Isso é permitido?",
        explanation:
            "Se existe uma definição de pronto (Definition of Done) padrão da organização, todos os Scrum Teams devem segui-la como mínimo. Times podem acrescentar critérios mais rigorosos, mas nunca afrouxar o padrão. Se a organização não tem um padrão, o próprio Scrum Team cria o seu.",
        topic: "Scrum e empirismo",
        options: [
            ["Sim, o padrão da organização é o mínimo e o time pode reforçar.", true],
            ["Não, o padrão da organização é fixo e nenhum time pode alterá-lo.", false],
            ["Sim, e o time também pode remover critérios que julgar caros demais.", false],
            ["Somente com autorização do Product Owner e do patrocinador do produto.", false],
        ],
    },
    {
        statement:
            "No fim da Sprint, um diretor tratou a Sprint Review como reunião de aprovação e recusou todo o incremento por causa de um detalhe visual. O que o Guia do Scrum estabelece sobre esse evento?",
        explanation:
            "A Sprint Review é uma sessão de trabalho em que o Scrum Team e os stakeholders inspecionam o resultado da Sprint e discutem o que fazer em seguida, ajustando o Product Backlog. Não é portão de aprovação nem apresentação formal: o que está pronto já atende à definição de pronto (Definition of Done).",
        topic: "Scrum e empirismo",
        options: [
            ["É sessão de trabalho para inspecionar o resultado e adaptar o backlog.", true],
            ["É a reunião em que os stakeholders aprovam ou reprovam o incremento.", false],
            ["É a apresentação formal à diretoria, com ata e assinatura de aceite.", false],
            ["É o evento em que o Scrum Master avalia o desempenho dos Developers.", false],
        ],
    },
    {
        statement:
            "Um Scrum Team quer saber qual o propósito da Sprint Retrospective e em que momento ela ocorre. O que o Guia do Scrum estabelece?",
        explanation:
            "A Sprint Retrospective planeja formas de aumentar a qualidade e a eficácia do time, inspecionando pessoas, interações, processos, ferramentas e a definição de pronto (Definition of Done). Ela acontece depois da Sprint Review e antes da próxima Sprint Planning, encerrando a Sprint.",
        topic: "Scrum e empirismo",
        options: [
            ["Aumentar qualidade e eficácia, encerrando a Sprint após a Review.", true],
            ["Revisar o incremento com os stakeholders, ocorrendo antes da Review.", false],
            ["Avaliar o desempenho de cada Developer, ocorrendo no meio da Sprint.", false],
            ["Replanejar o Product Backlog, ocorrendo junto da próxima Planning.", false],
        ],
    },
    {
        statement:
            "Um time reclama que o Scrum não define como estimar, como testar nem como versionar o código. Como o Guia do Scrum se posiciona sobre essa ausência?",
        explanation:
            "O Scrum é intencionalmente incompleto (purposefully incomplete): define apenas as partes necessárias para implementar a teoria do Scrum e deixa que cada time acrescente as práticas que fizerem sentido no seu contexto. Ele não é um processo completo nem uma metodologia com receitas prontas.",
        topic: "Scrum e empirismo",
        options: [
            ["O Scrum é intencionalmente incompleto e o time escolhe as práticas.", true],
            ["O Scrum é uma metodologia completa e essas práticas deveriam constar.", false],
            ["As práticas ausentes devem ser definidas pelo escritório de projetos.", false],
            ["O Scrum Master é quem escolhe as técnicas de estimativa e de teste.", false],
        ],
    },
    {
        statement:
            "Uma empresa adotou Sprints e Daily Scrum, mas eliminou a Sprint Retrospective e a responsabilidade de Product Owner. Como isso é avaliado à luz do Guia do Scrum?",
        explanation:
            "O Scrum é imutável (immutable): implementar apenas partes é possível, mas o resultado não é Scrum. O framework existe como um todo e cada elemento serve a um propósito específico dentro dele. Retirar peças costuma esconder problemas em vez de resolvê-los.",
        topic: "Scrum e empirismo",
        options: [
            ["Partes do Scrum podem ser usadas, mas o resultado não é Scrum.", true],
            ["É Scrum válido, pois o Guia trata a Retrospective como opcional.", false],
            ["É Scrum adaptado, formato recomendado para empresas pequenas.", false],
            ["É Scrum desde que o Scrum Master assuma o Product Backlog.", false],
        ],
    },
    {
        statement:
            "Em um Scrum Team, quem decide quem trabalha em cada item da Sprint Backlog e de que forma o trabalho será realizado?",
        explanation:
            "Scrum Teams são auto-gerenciados (self-managing): decidem internamente quem faz o quê, quando e como. Essa autonomia é o que torna o time responsável pelo resultado. O Product Owner define o que é mais valioso e o Scrum Master cuida da eficácia, mas nenhum dos dois distribui tarefas.",
        topic: "Scrum e empirismo",
        options: [
            ["Os próprios Developers, porque o time é auto-gerenciado.", true],
            ["O Product Owner, que responde pelo valor gerado em cada Sprint.", false],
            ["O Scrum Master, que organiza a distribuição do trabalho do time.", false],
            ["O gerente funcional de cada especialidade envolvida no produto.", false],
        ],
    },
    {
        statement:
            "Uma Sprint atrasou porque o time precisou esperar duas semanas por uma equipe externa de banco de dados. Que característica do Scrum Team está ausente?",
        explanation:
            "Scrum Teams são multifuncionais (cross-functional): possuem todas as habilidades necessárias para criar valor a cada Sprint, sem depender de terceiros para concluir o trabalho. Depender de fila externa quebra o fluxo, torna a meta da Sprint (Sprint Goal) frágil e reduz a frequência de entrega.",
        topic: "Scrum e empirismo",
        options: [
            ["Multifuncionalidade, ter no time as habilidades para criar valor.", true],
            ["Auto-gerenciamento, que garante o cumprimento dos prazos do plano.", false],
            ["Transparência, que tornaria visível a fila da equipe externa ao time.", false],
            ["Tamanho reduzido, já que times pequenos não têm dependência externa.", false],
        ],
    },
    {
        statement:
            "Por que o Guia do Scrum define uma duração máxima para cada evento e um ritmo fixo para a Sprint?",
        explanation:
            "Os eventos ocorrem em cadência fixa para criar regularidade e reduzir a necessidade de reuniões não definidas no Scrum. O limite de tempo (timebox) evita desperdício e força foco, e cada evento é uma oportunidade formal de inspecionar e adaptar os artefatos do Scrum.",
        topic: "Scrum e empirismo",
        options: [
            ["Para criar regularidade e reduzir reuniões fora das do Scrum.", true],
            ["Para permitir que a gerência acompanhe o desempenho semana a semana.", false],
            ["Para garantir que o escopo planejado seja concluído dentro do prazo.", false],
            ["Para que o Scrum Master consiga medir a produtividade individual.", false],
        ],
    },
    {
        statement:
            "Um time terminou no quarto dia da Sprint um item que atende à Definition of Done e quer disponibilizá-lo aos usuários antes da Sprint Review. Isso é permitido?",
        explanation:
            "Vários incrementos (Increments) podem ser criados dentro de uma Sprint, e a soma deles é apresentada na Sprint Review. A entrega não precisa esperar o fim da Sprint: um incremento pode ser liberado a qualquer momento, e a Sprint Review não é o portão que autoriza o release.",
        topic: "Scrum e empirismo",
        options: [
            ["Sim, um incremento pode ser liberado antes do fim da Sprint.", true],
            ["Não, a liberação só é possível após a aprovação na Sprint Review.", false],
            ["Não, cada Sprint produz um único incremento entregue no último dia.", false],
            ["Sim, mas apenas se o Scrum Master autorizar a antecipação do release.", false],
        ],
    },
    {
        statement:
            "Durante a Sprint, o Product Owner sugere trocar a Sprint Goal por outra que apareceu como mais interessante. O que o Guia do Scrum estabelece sobre isso?",
        explanation:
            "A meta da Sprint (Sprint Goal) é o único objetivo da Sprint e não muda durante ela: mudanças que ameacem a meta não são feitas. Se a meta se tornou obsoleta, o caminho previsto é cancelar a Sprint, decisão exclusiva do Product Owner, e não substituir a meta no meio do caminho.",
        topic: "Scrum e empirismo",
        options: [
            ["A Sprint Goal não muda: se ficou obsoleta, cancela-se a Sprint.", true],
            ["O Product Owner pode trocar a meta sempre que surgir opção melhor.", false],
            ["A troca é possível com a concordância da maioria dos Developers.", false],
            ["A meta pode ser substituída no Daily Scrum, que serve para adaptar.", false],
        ],
    },
    {
        statement:
            "Uma organização exige um plano detalhado de doze meses com escopo e datas fixas para um produto cheio de incerteza tecnológica. Que argumento o Scrum oferece contra essa exigência?",
        explanation:
            "O Scrum se apoia no empirismo (empiricism): em trabalho complexo, o conhecimento vem da experiência e as decisões se baseiam no que é observado. Planos longos e fixos assumem uma previsibilidade que não existe, por isso o Scrum entrega em ciclos curtos e adapta com base em evidência real.",
        topic: "Scrum e empirismo",
        options: [
            ["Em trabalho complexo, o conhecimento vem da experiência observada.", true],
            ["Planos longos são aceitáveis desde que revisados a cada trimestre.", false],
            ["O Scrum dispensa qualquer planejamento e trabalha só com prioridades.", false],
            ["Escopo e datas fixas funcionam quando a equipe conhece bem o domínio.", false],
        ],
    },
    {
        statement:
            "Áreas de fora do time continuam pedindo relatórios semanais de horas e interrompendo a Sprint com demandas avulsas. Como o Scrum Master deve atuar nesse caso?",
        explanation:
            "O Scrum Master serve o Scrum Team, o Product Owner e a organização: lidera e treina a adoção do Scrum, ajuda os stakeholders a entender o empirismo (empiricism) e remove barreiras entre eles e o time. Atender em silêncio preserva o hábito antigo, e cortar a comunicação piora a colaboração.",
        topic: "Scrum e empirismo",
        options: [
            ["Ajudando a organização a entender o Scrum e removendo barreiras.", true],
            ["Produzindo os relatórios pedidos para preservar a relação com as áreas.", false],
            ["Proibindo qualquer contato entre as áreas externas e o Scrum Team.", false],
            ["Repassando as demandas avulsas direto aos Developers durante a Sprint.", false],
        ],
    },
    {
        statement:
            "Uma empresa contratou um Product Owner e pediu que ele detalhasse todas as histórias e acompanhasse o cumprimento do cronograma. Qual é a responsabilidade central dessa accountability?",
        explanation:
            "O Product Owner é responsável por maximizar o valor do produto resultante do trabalho do Scrum Team. Escrever itens e acompanhar o andamento podem fazer parte do dia a dia, mas a responsabilidade (accountability) é o valor, e a forma de exercê-la varia conforme a organização e o produto.",
        topic: "Valor e Product Backlog",
        options: [
            ["Maximizar o valor do produto resultante do trabalho do time.", true],
            ["Garantir que o cronograma aprovado seja cumprido dentro do orçamento.", false],
            ["Detalhar todos os itens do Product Backlog antes do início da Sprint.", false],
            ["Coordenar as pessoas do time e distribuir as tarefas de cada Sprint.", false],
        ],
    },
    {
        statement:
            "Um Product Owner delegou o refinamento dos itens mais técnicos a dois Developers experientes. Como o Guia do Scrum trata essa delegação?",
        explanation:
            "O Product Owner pode delegar trabalho como refinamento e escrita de itens, mas continua sendo o responsável (accountable) pelo resultado. A delegação não transfere a responsabilidade: se a ordenação ou o conteúdo do Product Backlog piorarem, a resposta continua sendo dele.",
        topic: "Valor e Product Backlog",
        options: [
            ["É permitida, mas o Product Owner segue responsável pelo resultado.", true],
            ["É proibida, pois somente o Product Owner pode tocar no Product Backlog.", false],
            ["É permitida e transfere a responsabilidade pelos itens aos Developers.", false],
            ["É permitida somente quando aprovada previamente pelo Scrum Master.", false],
        ],
    },
    {
        statement:
            "Um gerente sênior pediu ao Scrum Master que subisse o item dele para o topo do Product Backlog, sem falar com o Product Owner. O que deve acontecer?",
        explanation:
            "O Product Backlog é ordenado pelo Product Owner, e ele é a única pessoa que muda essa ordem. Quem quiser alterá-la precisa convencer o Product Owner com argumentos de valor, risco ou dependência, e toda a organização deve respeitar essa decisão para que ele tenha sucesso.",
        topic: "Valor e Product Backlog",
        options: [
            ["O pedido vai ao Product Owner, único a ordenar o Product Backlog.", true],
            ["O Scrum Master pode reordenar itens urgentes trazidos pela gerência.", false],
            ["Os Developers decidem a ordem, já que serão eles a fazer o trabalho.", false],
            ["O item entra direto na Sprint atual por ter sido pedido por um gerente.", false],
        ],
    },
    {
        statement:
            "Um Product Backlog está agrupado em três caixas de prioridade alta, média e baixa, sem sequência definida dentro de cada caixa. Que problema isso cria?",
        explanation:
            "O Product Backlog é ordenado (ordered), não apenas classificado em faixas: o topo precisa deixar claro o que vem primeiro. A ordem considera valor, risco, dependências e aprendizado, e é o que permite aos Developers puxarem trabalho na Sprint Planning sem discutir o que é mais importante.",
        topic: "Valor e Product Backlog",
        options: [
            ["O backlog precisa ser ordenado, deixando claro o que vem primeiro.", true],
            ["Nenhum, faixas de prioridade são o formato previsto no Guia do Scrum.", false],
            ["O problema é a quantidade de faixas, que deveriam ser cinco e não três.", false],
            ["O erro é a falta de estimativa em horas em cada uma das três faixas.", false],
        ],
    },
    {
        statement: "Qual é a função da meta do produto (Product Goal) no Scrum?",
        explanation:
            "A meta do produto (Product Goal) descreve um estado futuro do produto e serve de alvo de longo prazo para o Scrum Team planejar. Ela vive no Product Backlog e é o compromisso desse artefato: o restante do Product Backlog emerge para definir o que cumpre a meta.",
        topic: "Valor e Product Backlog",
        options: [
            ["Descrever um estado futuro do produto como alvo de longo prazo.", true],
            ["Definir a lista fechada de funcionalidades do trimestre corrente.", false],
            ["Registrar o objetivo de negócio que deve ser atingido em cada Sprint.", false],
            ["Estabelecer a data de entrega acordada com os principais stakeholders.", false],
        ],
    },
    {
        statement:
            "Um Product Owner mantém três metas de produto ativas ao mesmo tempo para agradar áreas diferentes da empresa. O que o Guia do Scrum estabelece?",
        explanation:
            "O Scrum Team deve cumprir ou abandonar uma meta do produto (Product Goal) antes de assumir a próxima: apenas um objetivo de longo prazo por vez. Várias metas simultâneas dispersam o foco, tornam a ordenação incoerente e enfraquecem o valor entregue em cada Sprint.",
        topic: "Valor e Product Backlog",
        options: [
            ["O time cumpre ou abandona uma meta antes de assumir a próxima.", true],
            ["Metas simultâneas são recomendadas quando há vários grupos de usuários.", false],
            ["Podem existir até três metas ativas, uma para cada trimestre do plano.", false],
            ["Cada Sprint deve ter a sua própria meta de produto independente.", false],
        ],
    },
    {
        statement:
            "Um Product Owner adiou o início do desenvolvimento por dois meses para deixar o Product Backlog completo e detalhado antes da primeira Sprint. Que característica do artefato ele ignorou?",
        explanation:
            "O Product Backlog é emergente (emergent) e nunca está completo: ele evolui conforme o produto e o ambiente mudam. Esperar por uma lista final adia o aprendizado e o feedback, que são exatamente as fontes de informação capazes de tornar a lista melhor.",
        topic: "Valor e Product Backlog",
        options: [
            ["O Product Backlog é emergente e nunca chega a ficar completo.", true],
            ["O Product Backlog deve ser aprovado pelos stakeholders antes de começar.", false],
            ["O detalhamento inicial cabe aos Developers, não ao Product Owner.", false],
            ["O backlog só pode ser criado depois da definição do plano de release.", false],
        ],
    },
    {
        statement:
            "Um time reservou uma reunião mensal de quatro horas para refinar o backlog e passou a tratá-la como o quinto evento do Scrum. Como o refinamento é definido no Guia?",
        explanation:
            "O refinamento do Product Backlog (Product Backlog refinement) é uma atividade contínua que quebra e detalha itens em unidades menores e mais precisas, acrescentando descrição, ordem e tamanho. Não é um evento do Scrum, não tem limite de tempo definido e acontece ao longo da Sprint.",
        topic: "Valor e Product Backlog",
        options: [
            ["É atividade contínua na Sprint, e não um evento do Scrum.", true],
            ["É o quinto evento do Scrum, com limite de quatro horas por Sprint.", false],
            ["É um evento facultativo que o Scrum Master conduz uma vez por Sprint.", false],
            ["É a parte final da Sprint Planning, quando os itens ficam detalhados.", false],
        ],
    },
    {
        statement:
            "Durante o refinamento, o Product Owner definiu sozinho o tamanho de cada item para acelerar o processo. O que o Guia do Scrum diz sobre isso?",
        explanation:
            "Os Developers que farão o trabalho é que fazem o dimensionamento (sizing). O Product Owner pode influenciar ajudando o time a entender e a escolher entre alternativas, mas não define o tamanho. Quem estima é quem executa, e é isso que torna o número útil para previsão.",
        topic: "Valor e Product Backlog",
        options: [
            ["Quem dimensiona os itens são os Developers que farão o trabalho.", true],
            ["O Product Owner estima, pois conhece melhor o valor de cada item.", false],
            ["O Scrum Master estima, para manter a neutralidade técnica do número.", false],
            ["A estimativa sai do histórico de itens parecidos, sem ouvir o time.", false],
        ],
    },
    {
        statement:
            "Um stakeholder pediu para liberar em produção um item que ficou pronto mas não passou pela varredura de segurança prevista na Definition of Done. O que o Product Owner deve fazer?",
        explanation:
            "Trabalho que não atende à definição de pronto (Definition of Done) não pode ser liberado nem apresentado na Sprint Review: ele retorna ao Product Backlog. O Product Owner decide quando liberar o que está pronto, mas não decide reduzir o critério de pronto para acelerar a entrega.",
        topic: "Valor e Product Backlog",
        options: [
            ["Não liberar, pois o item ainda não atende à Definition of Done.", true],
            ["Liberar e agendar a varredura de segurança para a Sprint seguinte.", false],
            ["Pedir ao Scrum Master uma exceção formal ao critério de pronto.", false],
            ["Liberar apenas para parte dos usuários, já que o risco fica menor.", false],
        ],
    },
    {
        statement:
            "Um Product Owner acumula incrementos prontos há três Sprints porque prefere um lançamento único no fim do trimestre. Que consequência o Scrum aponta para essa escolha?",
        explanation:
            "Um incremento (Increment) utilizável pode ser liberado a qualquer momento, e adiar a entrega adia o feedback que sustentaria as próximas decisões. Segurar valor pronto aumenta o risco do lançamento, atrasa o retorno e desperdiça o aprendizado que o uso real traria.",
        topic: "Valor e Product Backlog",
        options: [
            ["Adia o feedback e o retorno de valor que a entrega já traria.", true],
            ["Nenhuma, pois o Scrum determina uma entrega por trimestre ao mercado.", false],
            ["Melhora a qualidade, pois vários incrementos são testados em conjunto.", false],
            ["Reduz o risco, já que a Sprint Review passa a validar tudo de uma vez.", false],
        ],
    },
    {
        statement:
            "Durante a Sprint Review, um stakeholder exige que uma funcionalidade nova entre imediatamente na Sprint que começa amanhã. O que o Product Owner deve fazer?",
        explanation:
            "A Sprint Review existe para inspecionar o resultado e adaptar o Product Backlog: o pedido entra como item e o Product Owner o posiciona conforme o valor em relação aos demais e à meta do produto (Product Goal). Prometer entrada automática ignora a ordenação e a conversa da Sprint Planning.",
        topic: "Valor e Product Backlog",
        options: [
            ["Registrar o pedido no Product Backlog e ordená-lo pelo valor.", true],
            ["Aceitar o pedido e garantir a entrega na Sprint que começa amanhã.", false],
            ["Recusar o pedido, pois o Product Backlog fecha antes da Planning.", false],
            ["Encaminhar a decisão ao Scrum Master, que avalia a viabilidade.", false],
        ],
    },
    {
        statement:
            "No meio da Sprint, o presidente da empresa liga pedindo uma funcionalidade urgente que ameaça a Sprint Goal. Como o Product Owner deve conduzir a situação?",
        explanation:
            "Nenhuma mudança que ponha em risco a meta da Sprint (Sprint Goal) é feita durante a Sprint. O Product Owner conversa com os Developers sobre o pedido e, se ele for realmente mais valioso do que a meta atual, a alternativa prevista é cancelar a Sprint, decisão exclusiva dele.",
        topic: "Valor e Product Backlog",
        options: [
            ["Avaliar com os Developers e, se a meta perdeu sentido, cancelar.", true],
            ["Inserir o item na Sprint atual, pois a origem do pedido é a mais alta.", false],
            ["Pedir horas extras aos Developers para caber a novidade sem perder nada.", false],
            ["Delegar a resposta ao Scrum Master, responsável por proteger a Sprint.", false],
        ],
    },
    {
        statement:
            "A diretoria quer transformar a velocidade média das últimas Sprints em compromisso contratual de entrega. Como o Scrum trata esse tipo de projeção?",
        explanation:
            "Dados históricos como velocidade servem para previsão (forecast), não para compromisso: o Product Backlog é emergente e a complexidade permanece. O Scrum não prescreve velocidade nem gráfico de queima, e o único compromisso da Sprint é a meta da Sprint (Sprint Goal).",
        topic: "Valor e Product Backlog",
        options: [
            ["Serve como previsão, e não como compromisso de entrega fechado.", true],
            ["É compromisso válido, pois o time confirmou a média nas Sprints.", false],
            ["É proibida no Scrum, que não admite projeção de entrega futura.", false],
            ["Passa a valer depois que o Scrum Master homologa a média calculada.", false],
        ],
    },
    {
        statement:
            "Ao fim da Sprint, dois itens ficaram pela metade e o time quer prorrogar a Sprint em três dias para concluí-los. O que deve acontecer?",
        explanation:
            "A Sprint tem duração fixa e termina na data prevista. Itens que não atendem à definição de pronto (Definition of Done) voltam ao Product Backlog e são reordenados pelo Product Owner, que decide se ainda valem a pena. Estender a Sprint quebra a cadência e esconde o problema.",
        topic: "Valor e Product Backlog",
        options: [
            ["A Sprint termina e os itens voltam ao Product Backlog para reordenar.", true],
            ["A Sprint é prorrogada até que os itens selecionados sejam concluídos.", false],
            ["Os itens entram automaticamente no topo da Sprint Backlog seguinte.", false],
            ["Os itens são considerados entregues em parte na Sprint Review atual.", false],
        ],
    },
    {
        statement:
            "Um Product Backlog tem oitocentos itens, muitos criados há dois anos e sem relação com a meta do produto atual. Como o Product Owner deve agir?",
        explanation:
            "O Product Backlog existe para definir o que cumpre a meta do produto (Product Goal), e itens que não contribuem só criam ruído e custo de manutenção. Remover o que perdeu sentido melhora a transparência e reduz o esforço de refinamento, mesmo que nada tenha sido implementado.",
        topic: "Valor e Product Backlog",
        options: [
            ["Remover os itens que não contribuem mais para a meta do produto.", true],
            ["Manter todos os itens, pois o Product Backlog é um registro histórico.", false],
            ["Transferir os itens antigos a outro time para que sejam concluídos.", false],
            ["Distribuir os itens antigos nas próximas Sprints para zerar a lista.", false],
        ],
    },
    {
        statement:
            "Quatro Scrum Teams trabalham no mesmo produto. Quantos Product Backlogs, Product Goals e Product Owners devem existir nesse arranjo?",
        explanation:
            "Se vários Scrum Teams trabalham no mesmo produto, eles compartilham o mesmo Product Backlog, a mesma meta do produto (Product Goal) e o mesmo Product Owner. Backlogs separados criam ordenações concorrentes e destroem a visão única de valor do produto.",
        topic: "Valor e Product Backlog",
        options: [
            ["Um de cada: mesmo backlog, mesma meta e mesmo Product Owner.", true],
            ["Um backlog por time, com metas próprias e um Product Owner geral.", false],
            ["Um backlog para todos, com um Product Owner para cada um dos times.", false],
            ["Quatro backlogs e quatro metas, unidos por um comitê de produto.", false],
        ],
    },
    {
        statement:
            "Uma falha grave em produção chegou pelo suporte no segundo dia da Sprint. Onde ela deve ser registrada e quem decide quando será tratada?",
        explanation:
            "Correções são trabalho de produto e entram no Product Backlog como qualquer outro item, cabendo ao Product Owner ordená-las. Se a falha for grave a ponto de tornar a meta da Sprint (Sprint Goal) obsoleta, existe a opção de cancelar a Sprint, decisão também do Product Owner.",
        topic: "Valor e Product Backlog",
        options: [
            ["No Product Backlog, com a ordem definida pelo Product Owner.", true],
            ["Em uma fila separada de defeitos, priorizada pela equipe de suporte.", false],
            ["Direto na Sprint Backlog atual, pois falhas têm prioridade automática.", false],
            ["No Product Backlog, com a ordem definida pelo Scrum Master do time.", false],
        ],
    },
    {
        statement:
            "Os Developers avisam que uma parte do código precisa de reestruturação, sem a qual cada nova funcionalidade levará o dobro do tempo. O Product Owner não vê valor de negócio nisso. Qual é o encaminhamento adequado?",
        explanation:
            "O trabalho técnico entra no Product Backlog e é ordenado pelo Product Owner como qualquer outro item, mas a decisão precisa ser informada: cabe aos Developers tornar visível o efeito do débito sobre o custo e o prazo das próximas entregas. Trabalho escondido quebra a transparência.",
        topic: "Valor e Product Backlog",
        options: [
            ["Tornar o efeito visível e ordenar o trabalho no Product Backlog.", true],
            ["Os Developers fazem a reestruturação sem registrar nada no backlog.", false],
            ["O Scrum Master decide quanto da capacidade vai para trabalho técnico.", false],
            ["O tema é técnico, então não deve entrar no Product Backlog do produto.", false],
        ],
    },
    {
        statement:
            "Um item de alto custo e valor incerto está no topo do Product Backlog, e o Product Owner quer reduzir o risco dessa aposta. Qual caminho é coerente com o Scrum?",
        explanation:
            "Fatiar o item e entregar uma versão menor permite medir o uso real antes de investir o resto, transformando suposição em evidência. O empirismo (empiricism) recomenda passos pequenos com inspeção e adaptação, em vez de construir tudo e descobrir o resultado apenas no fim.",
        topic: "Valor e Product Backlog",
        options: [
            ["Entregar uma fatia menor e decidir o resto pelo uso real.", true],
            ["Encomendar uma pesquisa longa de mercado antes de iniciar o trabalho.", false],
            ["Deixar o item por último até que a incerteza se resolva sozinha.", false],
            ["Construir tudo em uma Sprint dedicada e avaliar só no lançamento.", false],
        ],
    },
    {
        statement:
            "Na Sprint Planning, quem propõe como o produto pode aumentar seu valor e sua utilidade na Sprint que começa?",
        explanation:
            "No primeiro tópico da Sprint Planning, o Product Owner propõe como o produto pode aumentar seu valor e utilidade, e o Scrum Team inteiro colabora para definir a meta da Sprint (Sprint Goal). A meta precisa estar clara antes do fim do evento e é o compromisso da Sprint Backlog.",
        topic: "Valor e Product Backlog",
        options: [
            ["O Product Owner, e o time todo define a Sprint Goal em conjunto.", true],
            ["O Scrum Master, que conduz a discussão e formaliza a meta escolhida.", false],
            ["Os Developers, que conhecem o esforço de cada item selecionado.", false],
            ["Os stakeholders presentes, que trazem as necessidades do mercado.", false],
        ],
    },
    {
        statement:
            "Na Sprint Planning, um gerente definiu quantos itens o time levaria para a Sprint com base na média histórica. Quem seleciona os itens da Sprint?",
        explanation:
            "Os Developers selecionam os itens do Product Backlog para incluir na Sprint, conversando com o Product Owner para ajustar as escolhas conforme o entendimento da meta da Sprint (Sprint Goal). Ninguém de fora do Scrum Team define quanto trabalho cabe na Sprint.",
        topic: "Valor e Product Backlog",
        options: [
            ["Os Developers, em conversa com o Product Owner sobre a meta.", true],
            ["O Product Owner, que decide o escopo entregue em cada uma das Sprints.", false],
            ["O gerente, com base na média de itens concluídos nas últimas Sprints.", false],
            ["O Scrum Master, que equilibra a carga entre as pessoas disponíveis.", false],
        ],
    },
    {
        statement:
            "Stakeholders reclamam que não sabem o que está sendo construído nem o que vem em seguida, porque o Product Owner mantém a ordenação em uma planilha pessoal. Qual é o problema?",
        explanation:
            "Artefatos do Scrum precisam ser transparentes: um Product Backlog visível permite que stakeholders inspecionem o que vem pela frente e influenciem a ordenação conversando com o Product Owner. Backlog escondido produz inspeção sobre informação incompleta e decisões piores para todos.",
        topic: "Valor e Product Backlog",
        options: [
            ["O Product Backlog precisa ser transparente para quem depende dele.", true],
            ["O erro é a ferramenta usada, que deveria ser corporativa e integrada.", false],
            ["Os stakeholders devem esperar a Sprint Review para ter a informação.", false],
            ["O Scrum Master é quem deveria comunicar o andamento toda semana.", false],
        ],
    },
    {
        statement:
            "Um time criou uma lista de critérios de entrada e passou a recusar qualquer item que não os atendesse por completo. Como o Guia do Scrum trata esse tipo de critério?",
        explanation:
            "A definição de pronto (Definition of Done) é a única definição prevista no Guia do Scrum. Critérios de entrada podem ser um acordo útil do time, mas não são regra do framework, e usá-los como portão rígido cria fila, atrasa a conversa com o Product Owner e reduz a colaboração.",
        topic: "Valor e Product Backlog",
        options: [
            ["Não é previsto no Guia: é acordo do time, e não um portão rígido.", true],
            ["É artefato obrigatório do Scrum, ao lado da Definition of Done.", false],
            ["É responsabilidade do Product Owner, que aprova cada critério de entrada.", false],
            ["Substitui a Definition of Done nos times que já são maduros o bastante.", false],
        ],
    },
    {
        statement:
            "A empresa exige que todos os itens do Product Backlog sejam estimados em horas para alimentar o sistema de custos. O que o Guia do Scrum define sobre unidade de estimativa?",
        explanation:
            "O Guia do Scrum não prescreve unidade de estimativa: itens do Product Backlog têm um atributo de tamanho (size), e a técnica fica a critério do Scrum Team. Quem dimensiona são os Developers, e a unidade escolhida não deve virar compromisso de prazo individual.",
        topic: "Valor e Product Backlog",
        options: [
            ["O Guia não prescreve unidade: o time escolhe como dimensionar.", true],
            ["Exige pontos de história, técnica padrão prevista no framework.", false],
            ["Exige horas por item, para permitir o cálculo de custo por Sprint.", false],
            ["Exige que o Product Owner converta os tamanhos em valores em reais.", false],
        ],
    },
    {
        statement:
            "Um contrato prevê escopo, prazo e preço fixos por doze meses, e o Product Owner quer manter o empirismo dentro desse limite. Qual conduta é mais coerente com o Scrum?",
        explanation:
            "Mesmo com restrições contratuais, o Product Owner ordena o Product Backlog para entregar primeiro o que tem mais valor e mais risco, criando oportunidade de feedback cedo. O Scrum não exige contrato aberto, mas exige transparência sobre o que é observado a cada Sprint.",
        topic: "Valor e Product Backlog",
        options: [
            ["Ordenar por valor e risco para entregar cedo o que ensina mais.", true],
            ["Congelar o Product Backlog na assinatura para respeitar o contrato.", false],
            ["Abandonar o Scrum e adotar um plano em fases até o fim do contrato.", false],
            ["Deixar os itens de maior risco para o final, quando houver folga.", false],
        ],
    },
    {
        statement:
            "Dois itens custam o mesmo esforço: um gera receita já no lançamento e o outro só gera receita daqui a um ano. Que critério de ordenação o Product Owner deve considerar?",
        explanation:
            "Entre itens de custo igual, entregar antes o que gera retorno mais cedo aumenta o valor total capturado, porque o custo do atraso é diferente para cada um. A ordem no Product Backlog considera valor, risco e dependências, e não a ordem de chegada dos pedidos nem quem os fez.",
        topic: "Valor e Product Backlog",
        options: [
            ["Entregar antes o item cujo retorno começa mais cedo.", true],
            ["Entregar antes o item que foi solicitado primeiro pelos stakeholders.", false],
            ["Entregar antes o item pedido pela área com maior orçamento anual.", false],
            ["Entregar os dois na mesma Sprint para equilibrar as duas demandas.", false],
        ],
    },
    {
        statement:
            "Um Product Owner participa apenas da Sprint Planning e da Sprint Review, e some no resto da Sprint. Que efeito isso tem sobre o trabalho do time?",
        explanation:
            "Os Developers precisam de esclarecimentos ao longo da Sprint, e a ausência do Product Owner gera suposições, retrabalho e itens que não atendem à necessidade. Ele não precisa estar em todo momento, mas precisa estar disponível para conversar e decidir sobre escopo e valor.",
        topic: "Valor e Product Backlog",
        options: [
            ["Gera suposições e retrabalho por falta de esclarecimento na Sprint.", true],
            ["Nenhum, pois a presença nos dois eventos já é tudo o que o Scrum pede.", false],
            ["O Scrum Master assume as decisões de escopo enquanto ele está ausente.", false],
            ["Os Developers devem parar o trabalho até a próxima Sprint Planning.", false],
        ],
    },
    {
        statement:
            "Um time criou uma etapa em que o Product Owner testa cada item e assina o aceite antes da Sprint Review. Como isso se relaciona com o Guia do Scrum?",
        explanation:
            "O que determina se o trabalho está concluído é a definição de pronto (Definition of Done), e são os Developers que respondem por cumpri-la. Uma etapa de aceite individual não está no Guia, cria gargalo no fim da Sprint e transfere ao Product Owner um controle de qualidade que não é dele.",
        topic: "Valor e Product Backlog",
        options: [
            ["O critério de conclusão é a Definition of Done, não um aceite pessoal.", true],
            ["A etapa é obrigatória, pois o Product Owner responde pelo valor gerado.", false],
            ["A etapa deve existir, mas quem assina o aceite é o Scrum Master do time.", false],
            ["O aceite é necessário sempre que o item mudar algo visível no produto.", false],
        ],
    },
    {
        statement:
            "Na Sprint Review, usuários apontaram que o fluxo de cadastro criado na Sprint é confuso. Qual é o desfecho previsto pelo Scrum para esse feedback?",
        explanation:
            "A Sprint Review termina com o Product Backlog ajustado para atender às novas oportunidades: o feedback vira item e o Product Owner define onde ele entra. Refazer na hora sem análise, ou tratar o assunto como encerrado, desperdiça a informação que o evento acabou de produzir.",
        topic: "Valor e Product Backlog",
        options: [
            ["Vira item no Product Backlog e o Product Owner define a ordem.", true],
            ["O time corrige o fluxo imediatamente, ainda durante a Sprint Review.", false],
            ["O assunto fica registrado em ata e é reavaliado no fim do trimestre.", false],
            ["O item entra automaticamente no topo da próxima Sprint Backlog.", false],
        ],
    },
    {
        statement:
            "Um Product Owner de um produto interno nunca conversou com as pessoas que usam o sistema, apenas com o diretor que patrocina o projeto. Qual é o risco dessa escolha?",
        explanation:
            "Maximizar valor exige entender a necessidade de quem usa o produto, e não apenas de quem o financia. Ouvir só o patrocinador produz um Product Backlog que reflete opinião interna, com alta chance de entregar funcionalidades pouco usadas e descobrir o erro tarde demais.",
        topic: "Valor e Product Backlog",
        options: [
            ["Ordenar por opinião interna e entregar pouco valor real ao usuário.", true],
            ["Nenhum, pois o patrocinador responde pelo orçamento e pelo resultado.", false],
            ["O risco é apenas de imagem, já que o produto é interno à empresa.", false],
            ["O Scrum Master é quem deveria conduzir as conversas com os usuários.", false],
        ],
    },
    {
        statement:
            "Um Product Owner não consegue explicar em uma frase para onde o produto está indo, e cada área entende um rumo diferente. Que elemento do Scrum resolve isso?",
        explanation:
            "A meta do produto (Product Goal) é o alvo de longo prazo do Scrum Team e vive no Product Backlog, dando direção comum ao time e aos stakeholders. Ela é o compromisso do Product Backlog justamente para que a ordenação e as metas de Sprint façam sentido em conjunto.",
        topic: "Valor e Product Backlog",
        options: [
            ["A meta do produto, alvo de longo prazo dentro do Product Backlog.", true],
            ["A Definition of Done, que padroniza a qualidade entregue pelo time.", false],
            ["O roadmap trimestral aprovado pela diretoria e pelas áreas de negócio.", false],
            ["A Sprint Goal, que dá direção de longo prazo para todo o produto.", false],
        ],
    },
    {
        statement:
            "A diretoria quer saber quando um conjunto grande de funcionalidades estará pronto. Qual é a resposta mais coerente com o empirismo?",
        explanation:
            "A previsão (forecast) se apoia em dados reais das Sprints anteriores e é apresentada como faixa que se ajusta a cada Sprint, já que o Product Backlog é emergente. Prometer data exata para escopo incerto quebra a transparência, e recusar qualquer previsão deixa a organização sem base para decidir.",
        topic: "Valor e Product Backlog",
        options: [
            ["Uma previsão baseada em dados reais, revista a cada Sprint.", true],
            ["Uma data exata calculada a partir da soma das estimativas dos itens.", false],
            ["Uma recusa, pois o Scrum não permite previsões de prazo de entrega.", false],
            ["Uma data definida pelo Scrum Master a partir do histórico do time.", false],
        ],
    },
    {
        statement: "Que atributos o Guia do Scrum cita para os itens do Product Backlog?",
        explanation:
            "Itens do Product Backlog costumam ter descrição, ordem, tamanho (size) e, quando aplicável, critérios de teste. O refinamento é a atividade que acrescenta esses detalhes de forma contínua, e o nível de detalhe cresce conforme o item se aproxima do topo da lista.",
        topic: "Valor e Product Backlog",
        options: [
            ["Descrição, ordem e tamanho, detalhados durante o refinamento.", true],
            ["Responsável, data de entrega e percentual de conclusão do trabalho.", false],
            ["Custo em reais, retorno esperado e prazo aprovado pelo patrocinador.", false],
            ["Prioridade em faixas, complexidade técnica e nome do time executor.", false],
        ],
    },
    {
        statement:
            "No meio da Sprint, os Developers descobrem que um item selecionado é muito maior do que parecia e não caberá junto com o restante. Qual conduta preserva a Sprint Goal?",
        explanation:
            "O escopo pode ser esclarecido e renegociado com o Product Owner ao longo da Sprint, desde que a meta da Sprint (Sprint Goal) continue viável. Reduzir a definição de pronto (Definition of Done) ou esconder o problema até a Sprint Review destrói a transparência e a qualidade.",
        topic: "Valor e Product Backlog",
        options: [
            ["Renegociar o escopo com o Product Owner mantendo a meta de pé.", true],
            ["Cancelar a Sprint e refazer a Sprint Planning com o escopo corrigido.", false],
            ["Reduzir os critérios de pronto para caber tudo o que foi selecionado.", false],
            ["Manter o plano e informar o problema só na próxima Sprint Review.", false],
        ],
    },
    {
        statement:
            "Um Product Owner comemora que o time dobrou o número de itens entregues por Sprint, embora o uso do produto não tenha mudado. Como o Scrum enxerga esse indicador?",
        explanation:
            "Quantidade entregue é medida de produção, não de valor: o que importa é o efeito para clientes e usuários. Maximizar o valor do produto exige olhar o resultado do que foi entregue e ajustar o Product Backlog conforme a evidência, e não celebrar o volume de itens concluídos.",
        topic: "Valor e Product Backlog",
        options: [
            ["Volume entregue mede produção, e não o valor gerado pelo produto.", true],
            ["É a principal medida de sucesso do Product Owner em cada Sprint.", false],
            ["É indicador válido desde que a Definition of Done tenha sido cumprida.", false],
            ["É a base correta para negociar o orçamento do produto com a diretoria.", false],
        ],
    },
    {
        statement:
            "Um time detalha em profundidade os cem primeiros itens do Product Backlog, incluindo os que só serão feitos daqui a oito meses. Que problema isso cria?",
        explanation:
            "Itens mais ao topo são mais claros e detalhados, enquanto os demais permanecem mais grossos: detalhar cedo demais o que ainda vai mudar é desperdício. O Product Backlog é emergente, então boa parte desse esforço será jogado fora quando o entendimento do produto evoluir.",
        topic: "Valor e Product Backlog",
        options: [
            ["Detalhar cedo o que ainda vai mudar é desperdício de esforço.", true],
            ["Nenhum, pois quanto mais detalhado o backlog, melhor a previsibilidade.", false],
            ["O problema é a quantidade de itens, que deveria ficar abaixo de cinquenta.", false],
            ["O detalhamento deveria ser feito só pelo Product Owner, sem o time.", false],
        ],
    },
    {
        statement:
            "Um time define a Sprint Goal como concluir os oito itens selecionados na Planning. Que fragilidade essa formulação traz?",
        explanation:
            "A meta da Sprint (Sprint Goal) é um objetivo único que dá coerência ao trabalho e permite renegociar escopo sem perder o rumo. Quando a meta é a própria lista, qualquer ajuste vira falha, o time perde flexibilidade e a conversa com o Product Owner fica travada.",
        topic: "Valor e Product Backlog",
        options: [
            ["Sem objetivo próprio, o time perde espaço para renegociar escopo.", true],
            ["Nenhuma, pois a meta da Sprint é a lista de itens escolhidos mesmo.", false],
            ["A fragilidade é o número de itens, que deveria ser sempre menor.", false],
            ["A meta deveria ser escrita pelo Scrum Master para ficar objetiva.", false],
        ],
    },
    {
        statement:
            "Um Product Owner acredita que um painel novo aumentará a retenção, mas não tem nenhuma evidência disso. Qual abordagem é mais coerente com o empirismo?",
        explanation:
            "Tratar a ideia como hipótese, entregar uma versão pequena e medir o efeito real transforma opinião em evidência com baixo custo. O empirismo (empiricism) pede inspeção sobre o que aconteceu de fato, e o incremento (Increment) é o meio de obter essa informação.",
        topic: "Valor e Product Backlog",
        options: [
            ["Entregar uma versão pequena do painel e medir o efeito real.", true],
            ["Construir o painel completo e avaliar a retenção após seis meses.", false],
            ["Pedir a opinião dos gerentes antes de escrever qualquer linha.", false],
            ["Adiar o item até que exista certeza sobre o comportamento do usuário.", false],
        ],
    },
    {
        statement:
            "O que o Product Owner discute com os presentes durante a Sprint Review, segundo o Guia do Scrum?",
        explanation:
            "Na Sprint Review o Scrum Team apresenta o resultado do trabalho, o Product Owner discute o Product Backlog e o progresso rumo à meta do produto (Product Goal), e todos avaliam o que fazer em seguida diante das mudanças de contexto, de mercado e de prazo.",
        topic: "Valor e Product Backlog",
        options: [
            ["O Product Backlog e o progresso rumo à meta do produto.", true],
            ["O desempenho individual de cada Developer na Sprint encerrada.", false],
            ["As melhorias de processo escolhidas para a próxima Sprint do time.", false],
            ["O plano detalhado das próximas três Sprints aprovado pela diretoria.", false],
        ],
    },
    {
        statement:
            "Um item de alto valor depende de uma integração com um fornecedor que leva dois meses para responder. Como o Product Owner deve tratar essa dependência na ordenação?",
        explanation:
            "Ordenar considera valor, risco e dependências: iniciar cedo o que tem espera longa evita que o item vire gargalo justamente quando o valor precisar ser entregue. Deixar a dependência para o fim converte um risco conhecido em atraso certo para o produto.",
        topic: "Valor e Product Backlog",
        options: [
            ["Antecipar o que depende de espera longa para reduzir o risco.", true],
            ["Deixar o item por último e cobrar o fornecedor quando for a hora.", false],
            ["Retirar o item do backlog enquanto o fornecedor não responder nada.", false],
            ["Repassar a negociação ao Scrum Master, que remove os impedimentos.", false],
        ],
    },
    {
        statement:
            "Duas áreas pedem funcionalidades incompatíveis para a mesma tela e cada uma pressiona por prioridade. Qual é a conduta esperada do Product Owner?",
        explanation:
            "Cabe ao Product Owner decidir com base na meta do produto (Product Goal) e no valor esperado, e explicar a escolha às duas áreas. Alternar entre pedidos para agradar ambos dilui o foco, e transferir a decisão a um comitê descaracteriza a responsabilidade única do Product Owner.",
        topic: "Valor e Product Backlog",
        options: [
            ["Decidir pela meta do produto e explicar a escolha às duas áreas.", true],
            ["Alternar entregas entre as duas áreas para manter o equilíbrio.", false],
            ["Levar a disputa a um comitê de diretores para que definam a ordem.", false],
            ["Deixar os Developers escolherem qual pedido é mais simples de fazer.", false],
        ],
    },
    {
        statement:
            "Uma Sprint foi cancelada no oitavo dia. O que acontece com os itens que já atendiam à Definition of Done e com os demais?",
        explanation:
            "Na revisão do cancelamento, o trabalho concluído que atende à definição de pronto (Definition of Done) é avaliado e pode ser liberado, enquanto o que restou volta ao Product Backlog. Em seguida começa uma nova Sprint com nova Sprint Planning, e nada é descartado pelo cancelamento.",
        topic: "Valor e Product Backlog",
        options: [
            ["O que está pronto pode ser liberado e o resto volta ao backlog.", true],
            ["Todo o trabalho da Sprint é descartado, pois a meta deixou de valer.", false],
            ["Tudo o que foi iniciado passa direto para a Sprint Backlog seguinte.", false],
            ["O Product Owner escolhe item a item quais entram na Sprint seguinte.", false],
        ],
    },
    {
        statement:
            "Os Developers alertam que o item do topo do Product Backlog exige uma migração de infraestrutura que ainda não existe. Como isso afeta a ordenação?",
        explanation:
            "A ordenação é do Product Owner, mas ele decide informado: a conversa com os Developers revela dependências técnicas que mudam a sequência viável. Ignorar o alerta gera itens travados dentro da Sprint, e transferir a ordenação ao time confunde as responsabilidades (accountabilities).",
        topic: "Valor e Product Backlog",
        options: [
            ["O Product Owner reordena considerando a dependência apontada.", true],
            ["A ordem permanece intacta, pois questão técnica não afeta o valor.", false],
            ["Os Developers passam a ordenar os trechos técnicos do backlog.", false],
            ["O Scrum Master arbitra a ordem quando existe divergência assim.", false],
        ],
    },
    {
        statement:
            "Depois de um lançamento, os dados mostram que uma funcionalidade planejada perdeu sentido diante do comportamento real dos usuários. O que fazer com os itens relacionados?",
        explanation:
            "Adaptação com base em evidência é o ponto do empirismo (empiricism): itens que não contribuem mais para a meta do produto (Product Goal) saem do Product Backlog. Manter o que já se sabe inútil apenas para cumprir o plano original desperdiça a capacidade do time.",
        topic: "Valor e Product Backlog",
        options: [
            ["Remover os itens que a evidência mostrou não ter mais valor.", true],
            ["Executar os itens mesmo assim para cumprir o plano já aprovado.", false],
            ["Adiar os itens para o próximo ano sem revisar a ordem do backlog.", false],
            ["Repassar a decisão ao patrocinador que aprovou o plano original.", false],
        ],
    },
    {
        statement:
            "Um Product Owner mede sucesso apenas pela redução de custo interno e ignora o efeito das entregas sobre os clientes. Que distorção isso cria na ordenação?",
        explanation:
            "Maximizar valor exige equilibrar o benefício para clientes, usuários e organização, porque produto que não serve a quem usa perde receita e mercado no médio prazo. Ordenar só por custo interno costuma produzir ganhos pequenos e imediatos que corroem o valor do produto.",
        topic: "Valor e Product Backlog",
        options: [
            ["Prioriza ganhos internos pequenos e corrói o valor para o cliente.", true],
            ["Nenhuma, pois reduzir custo é sempre a forma mais direta de gerar valor.", false],
            ["Cria excesso de funcionalidades novas e deixa o produto instável demais.", false],
            ["Desloca a ordenação do produto para a área financeira da empresa.", false],
        ],
    },
    {
        statement:
            "Metade da capacidade do time é consumida por chamados de suporte que chegam direto dos usuários, sem passar pelo Product Backlog. Qual é o efeito no trabalho do Product Owner?",
        explanation:
            "Trabalho invisível impede o Product Owner de ordenar a capacidade real e distorce qualquer previsão (forecast). Tornar os chamados visíveis no Product Backlog permite decidir conscientemente quanto da capacidade vai para suporte e quanto vai para evolução do produto.",
        topic: "Valor e Product Backlog",
        options: [
            ["Ele perde a visão da capacidade real e não consegue ordenar valor.", true],
            ["Nenhum, pois chamados de suporte não fazem parte do trabalho do produto.", false],
            ["O Scrum Master passa a ordenar essa metade da capacidade do time.", false],
            ["A previsão fica mais confiável, já que o suporte é trabalho recorrente.", false],
        ],
    },
    {
        statement:
            "Uma empresa dividiu o Product Backlog do mesmo produto por camadas, com um Product Owner para o backend e outro para o aplicativo. Que problema o Scrum aponta?",
        explanation:
            "Um produto tem um Product Backlog, uma meta do produto (Product Goal) e um Product Owner. Backlogs por camada criam ordenações concorrentes, geram entregas que só têm valor quando combinadas e escondem dos stakeholders o valor real produzido em cada Sprint.",
        topic: "Valor e Product Backlog",
        options: [
            ["Ordenações concorrentes: um produto tem um backlog e um responsável.", true],
            ["Nenhum, pois cada camada tem um ritmo técnico próprio de evolução.", false],
            ["O problema é a quantidade de times, que deveria ser sempre a mesma.", false],
            ["Cada camada precisaria também de uma Definition of Done específica.", false],
        ],
    },
    {
        statement:
            "Um gerente de área passou a atribuir individualmente as tarefas da Sprint a cada Developer e a cobrar entregas diárias. O que o Scrum estabelece sobre esse arranjo?",
        explanation:
            "Scrum Teams são auto-gerenciados (self-managing): decidem internamente quem faz o quê, quando e como. A atribuição externa de tarefas retira do time a responsabilidade pelo resultado, reduz a colaboração e transforma o Daily Scrum em prestação de contas para terceiros.",
        topic: "Pessoas e times",
        options: [
            ["O time é auto-gerenciado e decide internamente quem faz o quê.", true],
            ["O arranjo é válido desde que o gerente respeite a Sprint Goal do time.", false],
            ["O arranjo é válido enquanto o time não tiver experiência com Scrum.", false],
            ["A atribuição cabe ao Scrum Master, que conhece a carga de cada um.", false],
        ],
    },
    {
        statement:
            "Um Product Owner passou a definir a arquitetura e a escolher as bibliotecas que os Developers devem usar. Como o Scrum trata essa atuação?",
        explanation:
            "O Product Owner responde pelo que será construído e por quê, e os Developers decidem como construir. Invadir a decisão técnica enfraquece o auto-gerenciamento (self-management) e a responsabilidade dos Developers por aderir à definição de pronto (Definition of Done).",
        topic: "Pessoas e times",
        options: [
            ["O Product Owner define o que e por quê; o como é dos Developers.", true],
            ["É adequada, pois o Product Owner responde por tudo o que o time faz.", false],
            ["É adequada quando o Product Owner tem formação técnica na área.", false],
            ["O Scrum Master é quem deveria escolher as bibliotecas do produto.", false],
        ],
    },
    {
        statement:
            "Os Developers travam com dúvidas de regra de negócio e esperam dias por resposta, porque o Product Owner só aceita conversar em reuniões agendadas. Qual é a conduta esperada dele?",
        explanation:
            "O Product Owner colabora com os Developers ao longo de toda a Sprint, esclarecendo o que é esperado do produto e ajudando a escolher entre alternativas. Disponibilidade não significa estar em toda reunião, mas significa responder a tempo de não travar o trabalho da Sprint.",
        topic: "Pessoas e times",
        options: [
            ["Estar disponível na Sprint para esclarecer o que é esperado.", true],
            ["Concentrar todas as respostas na Sprint Review, evitando interrupção.", false],
            ["Delegar as respostas ao Scrum Master, que acompanha o time todo dia.", false],
            ["Escrever itens tão detalhados que as dúvidas deixem de existir.", false],
        ],
    },
    {
        statement:
            "Um Scrum Team não tem ninguém capaz de escrever os testes automatizados exigidos pela Definition of Done e passou a depender de uma equipe externa. Qual encaminhamento é coerente com o Scrum?",
        explanation:
            "Scrum Teams são multifuncionais (cross-functional) e precisam ter dentro do time as habilidades necessárias para criar valor a cada Sprint. Desenvolver ou trazer a habilidade elimina a fila externa, enquanto enfraquecer a definição de pronto (Definition of Done) apenas esconde o problema.",
        topic: "Pessoas e times",
        options: [
            ["Trazer ou desenvolver a habilidade dentro do próprio Scrum Team.", true],
            ["Retirar os testes automatizados da Definition of Done por enquanto.", false],
            ["Manter a dependência externa e ajustar a Sprint ao tempo de espera.", false],
            ["Criar um sub-time de qualidade dentro do Scrum Team para essa função.", false],
        ],
    },
    {
        statement:
            "Um Scrum Team de dezoito pessoas quer continuar unido, mas as conversas ficaram lentas e a Sprint Planning consome dois dias. O que o Guia do Scrum orienta?",
        explanation:
            "Se o Scrum Team fica grande demais, deve considerar se reorganizar em vários Scrum Teams coesos, todos focados no mesmo produto. Nesse caso eles compartilham a mesma meta do produto (Product Goal), o mesmo Product Backlog e o mesmo Product Owner.",
        topic: "Pessoas e times",
        options: [
            ["Reorganizar-se em times menores com o mesmo Product Owner.", true],
            ["Dividir a Sprint Planning em duas sessões para caber as pessoas.", false],
            ["Criar sub-times internos com um coordenador técnico em cada um.", false],
            ["Manter o time e ampliar os limites de tempo dos eventos do Scrum.", false],
        ],
    },
    {
        statement:
            "Um Product Owner não tem autoridade formal sobre nenhuma das áreas que pedem funcionalidades, mas precisa sustentar as decisões de ordenação. Como ele exerce liderança nesse contexto?",
        explanation:
            "O Product Owner lidera pelo produto: torna a meta do produto (Product Goal) e o Product Backlog transparentes, explica os critérios da ordenação e negocia com evidência. A organização precisa respeitar suas decisões, e essa confiança se constrói com clareza e resultados observáveis.",
        topic: "Pessoas e times",
        options: [
            ["Tornando a meta e os critérios claros e negociando com evidência.", true],
            ["Solicitando à diretoria uma alçada formal sobre as áreas solicitantes.", false],
            ["Delegando as negociações difíceis ao Scrum Master do Scrum Team.", false],
            ["Aceitando os pedidos de quem tem mais poder para manter a relação.", false],
        ],
    },
    {
        statement:
            "Os Developers dizem que só entregam com a qualidade da Definition of Done, e o Product Owner pressiona por mais itens na mesma Sprint. Como esse conflito deve ser resolvido?",
        explanation:
            "A qualidade não diminui durante a Sprint, então o ajuste possível é no escopo: Product Owner e Developers renegociam o que entra, preservando a meta da Sprint (Sprint Goal). Os Developers respondem por aderir à definição de pronto (Definition of Done), e isso não se troca por prazo.",
        topic: "Pessoas e times",
        options: [
            ["Ajustando o escopo, porque a qualidade não é negociável na Sprint.", true],
            ["Com o Scrum Master decidindo qual dos dois lados tem razão no caso.", false],
            ["Reduzindo a Definition of Done até que o escopo desejado caiba nela.", false],
            ["Com o Product Owner decidindo, já que responde pelo valor do produto.", false],
        ],
    },
    {
        statement:
            "Um Product Owner recém-chegado tem dificuldade em manter o Product Backlog claro e em lidar com stakeholders exigentes. Como o Scrum Master pode ajudar?",
        explanation:
            "O Scrum Master serve o Product Owner ajudando a encontrar técnicas eficazes de definição da meta do produto (Product Goal) e de gestão do Product Backlog, e facilitando a colaboração com stakeholders quando solicitado. Ele apoia sem assumir a responsabilidade (accountability) do outro.",
        topic: "Pessoas e times",
        options: [
            ["Ensinando técnicas de gestão do backlog e facilitando as conversas.", true],
            ["Assumindo a ordenação do Product Backlog até ele ganhar experiência.", false],
            ["Filtrando os stakeholders para que apenas os principais falem com ele.", false],
            ["Delegando a escrita dos itens aos Developers com mais tempo de casa.", false],
        ],
    },
    {
        statement:
            "Quem responde por aderir à Definition of Done a cada dia de trabalho dentro da Sprint?",
        explanation:
            "Os Developers são responsáveis por criar o plano da Sprint, instilar qualidade aderindo à definição de pronto (Definition of Done), adaptar o plano a cada dia rumo à meta da Sprint (Sprint Goal) e responder mutuamente uns aos outros como profissionais.",
        topic: "Pessoas e times",
        options: [
            ["Os Developers, responsáveis por instilar qualidade no trabalho.", true],
            ["O Product Owner, que aceita ou recusa cada item entregue na Sprint.", false],
            ["O Scrum Master, que fiscaliza a aderência ao processo do framework.", false],
            ["A área de qualidade da empresa, que audita o incremento por amostra.", false],
        ],
    },
    {
        statement:
            "Todo o conhecimento de um módulo crítico está com um único Developer, e o time trava sempre que ele tira férias. Como o Scrum Team deve tratar essa situação?",
        explanation:
            "O Scrum Team responde como um todo pela criação de valor a cada Sprint, e responsabilidade compartilhada exige que o conhecimento circule. Espalhar a habilidade entre os Developers preserva a multifuncionalidade (cross-functionality) e evita que a meta da Sprint dependa de uma só pessoa.",
        topic: "Pessoas e times",
        options: [
            ["Espalhando o conhecimento entre os Developers do próprio time.", true],
            ["Formalizando esse Developer como responsável oficial pelo módulo.", false],
            ["Evitando itens do módulo nas Sprints em que ele estiver ausente.", false],
            ["Pedindo ao Scrum Master a contratação de um segundo especialista.", false],
        ],
    },
    {
        statement:
            "Por falta de gente, o mesmo profissional vai acumular Product Owner e Scrum Master no mesmo time. Que risco esse acúmulo traz?",
        explanation:
            "As responsabilidades (accountabilities) existem separadas porque sustentam decisões diferentes: o Product Owner defende o valor do produto e o Scrum Master defende a eficácia do time e a aderência ao Scrum. Acumular as duas remove o contraponto e costuma fazer a pressão por escopo vencer.",
        topic: "Pessoas e times",
        options: [
            ["Some o contraponto entre valor e eficácia do time e do processo.", true],
            ["Nenhum, pois o Guia do Scrum recomenda o acúmulo em times pequenos.", false],
            ["O risco é apenas de carga de trabalho excessiva para essa pessoa.", false],
            ["Os Developers passam a decidir sozinhos a ordem do Product Backlog.", false],
        ],
    },
    {
        statement:
            "Stakeholders só aparecem na Sprint Review para criticar o resultado e não trazem contexto em nenhum outro momento. O que o Scrum Team deve buscar?",
        explanation:
            "Colaboração exige abertura (openness) e respeito (respect) dos dois lados: o Scrum Team convida os stakeholders a compartilhar contexto ao longo da Sprint e mantém o Product Backlog transparente. Fechar a porta ou apenas absorver críticas mantém o ciclo de desconfiança.",
        topic: "Pessoas e times",
        options: [
            ["Envolver os stakeholders na Sprint, com backlog transparente.", true],
            ["Restringir a Sprint Review a quem participou do refinamento dos itens.", false],
            ["Pedir ao Scrum Master que responda por todas as críticas recebidas.", false],
            ["Aceitar as críticas em silêncio e ajustar o plano na Sprint seguinte.", false],
        ],
    },
    {
        statement:
            "Um Product Owner quer saber, hoje, quanto benefício os clientes estão de fato obtendo do produto. Qual área de valor do Evidence-Based Management responde a essa pergunta?",
        explanation:
            "O Valor Atual (Current Value) mede o benefício que clientes e stakeholders recebem no momento presente, com indicadores como satisfação do cliente, satisfação de quem trabalha no produto e uso real das funcionalidades. Ele não fala de potencial futuro nem de velocidade de entrega.",
        topic: "Evidência e organização",
        options: [
            ["Valor Atual, que mede o benefício percebido hoje pelos clientes.", true],
            ["Valor Não Realizado, que estima o potencial ainda não capturado.", false],
            ["Tempo até o Mercado, que mede a rapidez para entregar valor novo.", false],
            ["Capacidade de Inovar, que mede o poder de criar recursos novos.", false],
        ],
    },
    {
        statement:
            "Pesquisas mostram que os clientes atuais estão satisfeitos, mas o produto atende só doze por cento de um mercado que poderia usar a solução. Qual área de valor esse dado revela?",
        explanation:
            "O Valor Não Realizado (Unrealized Value) representa o benefício adicional que poderia ser obtido se as necessidades de mais clientes fossem atendidas, e aparece em indicadores como participação de mercado e lacuna de satisfação. Valor Atual alto com Valor Não Realizado alto sinaliza oportunidade.",
        topic: "Evidência e organização",
        options: [
            ["Valor Não Realizado, o benefício potencial ainda não capturado.", true],
            ["Valor Atual, que reflete a satisfação de quem já usa o produto.", false],
            ["Tempo até o Mercado, que mede a velocidade de entrega das novidades.", false],
            ["Capacidade de Inovar, que mede o quanto o produto consegue evoluir.", false],
        ],
    },
    {
        statement:
            "Uma organização leva nove meses entre aprovar uma ideia e colocá-la em produção. Qual área de valor do Evidence-Based Management é medida por esse intervalo?",
        explanation:
            "O Tempo até o Mercado (Time to Market) mede a rapidez com que a organização entrega valor novo, com indicadores como frequência de release, tempo de ciclo e intervalo entre a ideia e o uso pelo cliente. Reduzir esse tempo aumenta a frequência do aprendizado empírico.",
        topic: "Evidência e organização",
        options: [
            ["Tempo até o Mercado, a rapidez para entregar valor novo.", true],
            ["Valor Atual, o benefício que os clientes recebem no presente.", false],
            ["Valor Não Realizado, a oportunidade que ainda não foi atendida.", false],
            ["Capacidade de Inovar, o poder de entregar funcionalidades novas.", false],
        ],
    },
    {
        statement:
            "Um time gasta setenta por cento do tempo corrigindo defeitos e mantendo sistemas antigos, sobrando pouco espaço para o que é novo. Qual área de valor está comprometida?",
        explanation:
            "A Capacidade de Inovar (Ability to Innovate) mede o quanto a organização consegue entregar novas capacidades, e é corroída por dívida técnica, defeitos e trabalho de baixo valor que consome a capacidade do time. Ela não mede satisfação nem velocidade, mas o espaço disponível para inovar.",
        topic: "Evidência e organização",
        options: [
            ["Capacidade de Inovar, corroída por defeitos e dívida técnica.", true],
            ["Tempo até o Mercado, que mede a frequência de entrega ao cliente.", false],
            ["Valor Atual, que mede o benefício recebido pelos clientes agora.", false],
            ["Valor Não Realizado, que mede a fatia de mercado não conquistada.", false],
        ],
    },
    {
        statement:
            "Um produto tem clientes muito satisfeitos e já atende quase todo o mercado que faz sentido para ele. O que essa combinação sugere ao Product Owner?",
        explanation:
            "Valor Atual alto com Valor Não Realizado baixo indica mercado praticamente saturado: investir mais no mesmo produto rende pouco, e o retorno tende a vir de novos mercados ou de outro produto. A leitura conjunta das áreas de valor evita investimento sem retorno.",
        topic: "Evidência e organização",
        options: [
            ["O mercado está saturado e novo investimento ali rende pouco.", true],
            ["O produto precisa de investimento pesado para crescer no mercado.", false],
            ["A prioridade passa a ser reduzir o tempo até o mercado do produto.", false],
            ["O time deve aumentar a quantidade de itens entregues por Sprint.", false],
        ],
    },
    {
        statement:
            "No Evidence-Based Management, além do objetivo estratégico de longo prazo, quais metas guiam a organização rumo a ele?",
        explanation:
            "O Evidence-Based Management trabalha com o objetivo estratégico (Strategic Goal), metas intermediárias (Intermediate Goals) que marcam o progresso e metas táticas imediatas (Immediate Tactical Goals), que são os passos experimentais mais próximos. Cada passo é medido e o rumo é adaptado.",
        topic: "Evidência e organização",
        options: [
            ["Metas intermediárias e metas táticas imediatas, medidas a cada passo.", true],
            ["Metas anuais por departamento, consolidadas no orçamento da empresa.", false],
            ["Metas de Sprint de cada time, somadas no fim de cada um dos trimestres.", false],
            ["Metas de entrega por release, definidas no roadmap de doze meses.", false],
        ],
    },
    {
        statement:
            "Em uma reunião de investimento, a decisão sobre o próximo passo do produto foi tomada pela opinião do executivo mais graduado, sem nenhum dado. O que o Evidence-Based Management propõe?",
        explanation:
            "O Evidence-Based Management usa evidência medida para orientar decisões de investimento, melhorar resultados, reduzir riscos e otimizar investimentos. A opinião de quem tem mais poder pode iniciar uma hipótese, mas a decisão precisa ser confirmada por indicadores observados.",
        topic: "Evidência e organização",
        options: [
            ["Decidir com evidência medida, e não pela opinião de maior cargo.", true],
            ["Decidir por consenso entre todos os executivos presentes na reunião.", false],
            ["Decidir com base no plano estratégico aprovado no início do ano.", false],
            ["Decidir pelo volume de pedidos registrados pelos clientes no suporte.", false],
        ],
    },
    {
        statement:
            "Um relatório de produto apresenta apenas o número de funcionalidades lançadas por trimestre como prova de sucesso. Qual é a fraqueza dessa medida?",
        explanation:
            "Quantidade entregue mede produção, e não resultado: valor é o efeito que a entrega produz para clientes e para a organização. O Evidence-Based Management mede resultado nas quatro áreas de valor, e não a saída bruta do time, porque entregar mais não significa entregar melhor.",
        topic: "Evidência e organização",
        options: [
            ["Mede produção, e não o resultado obtido por quem usa o produto.", true],
            ["Mede o trimestre inteiro, quando deveria ser medida por Sprint.", false],
            ["Mede funcionalidades, quando o correto seria medir linhas de código.", false],
            ["Mede o passado, quando o correto seria projetar o próximo trimestre.", false],
        ],
    },
    {
        statement:
            "Como o Guia do Scrum descreve um produto, e qual é a implicação disso para o Product Owner?",
        explanation:
            "Um produto é um veículo para entregar valor, com uma fronteira clara, stakeholders conhecidos e usuários bem definidos, podendo ser um serviço, um item físico ou algo mais abstrato. Essa definição sustenta a existência de um Product Backlog e de uma meta do produto (Product Goal) por produto.",
        topic: "Evidência e organização",
        options: [
            ["É um veículo para entregar valor, com fronteira e usuários claros.", true],
            ["É o conjunto de sistemas mantidos por uma mesma área de tecnologia.", false],
            ["É o software entregue ao cliente, excluindo serviços e itens físicos.", false],
            ["É a soma dos projetos aprovados no portfólio anual da organização.", false],
        ],
    },
    {
        statement:
            "Uma organização investiu em automação de build e de implantação, reduzindo de dias para minutos o tempo de colocar uma mudança no ar. Qual área de valor melhora de forma mais direta?",
        explanation:
            "O Tempo até o Mercado (Time to Market) mede a rapidez para entregar valor novo, e indicadores como tempo de build, frequência de release e tempo de ciclo caem diretamente com esse tipo de investimento. As demais áreas costumam se beneficiar depois, por permitir experimentos mais frequentes.",
        topic: "Evidência e organização",
        options: [
            ["Tempo até o Mercado, medido por frequência de release e ciclo.", true],
            ["Valor Atual, medido pela satisfação dos clientes que usam hoje.", false],
            ["Valor Não Realizado, medido pela fatia de mercado ainda em aberto.", false],
            ["Capacidade de Inovar, medida pelo total de defeitos em produção.", false],
        ],
    },
    {
        statement:
            "Uma organização quer aplicar o Evidence-Based Management, mas só sabe planejar iniciativas anuais de grande porte. Qual mudança de abordagem o modelo pede?",
        explanation:
            "O Evidence-Based Management avança por passos experimentais curtos: forma-se uma hipótese, entrega-se algo pequeno, mede-se o efeito nas áreas de valor e adapta-se o rumo. Iniciativas anuais adiam a medição para depois do gasto, quando corrigir a direção já custa caro.",
        topic: "Evidência e organização",
        options: [
            ["Avançar por experimentos curtos e medir o efeito de cada passo.", true],
            ["Detalhar melhor o plano anual antes de iniciar cada uma das frentes.", false],
            ["Concentrar a medição no encerramento de cada iniciativa aprovada.", false],
            ["Contratar auditoria externa para validar os indicadores do produto.", false],
        ],
    },
    {
        statement:
            "Um diretor quer usar a velocidade dos times como principal indicador de valor entregue pela área de produto. Como isso se relaciona com o Evidence-Based Management?",
        explanation:
            "Velocidade é medida interna de capacidade e não diz nada sobre o benefício para o cliente. O Evidence-Based Management mede valor nas quatro áreas, com indicadores como satisfação, uso, participação de mercado e tempo de ciclo, justamente para não confundir esforço com resultado.",
        topic: "Evidência e organização",
        options: [
            ["Velocidade mede capacidade interna, e não o valor para o cliente.", true],
            ["É o indicador central do modelo, pois reflete a produtividade da área.", false],
            ["É válido quando comparado entre times de tamanhos parecidos entre si.", false],
            ["É válido se convertido em reais pelo custo por ponto de cada equipe.", false],
        ],
    },
    {
        statement:
            "Ao medir o Valor Atual, um Product Owner considerou apenas a satisfação dos clientes externos. Que outro indicador comum dessa área ficou de fora?",
        explanation:
            "O Valor Atual (Current Value) inclui a satisfação de quem trabalha no produto, além da satisfação dos clientes e do uso real das funcionalidades, porque times desmotivados degradam o valor entregue ao longo do tempo. Participação de mercado pertence ao Valor Não Realizado.",
        topic: "Evidência e organização",
        options: [
            ["A satisfação de quem trabalha no produto dentro da organização.", true],
            ["A participação de mercado conquistada pelo produto no último ano.", false],
            ["A frequência de entrega de versões novas para os clientes finais.", false],
            ["O total de itens concluídos pelo time nas últimas cinco Sprints.", false],
        ],
    },
    {
        statement:
            "Como um Product Owner pode usar as áreas de valor do Evidence-Based Management no dia a dia da ordenação do Product Backlog?",
        explanation:
            "As áreas de valor dão critérios de comparação entre itens: alguns aumentam o Valor Atual, outros atacam o Valor Não Realizado, outros reduzem o Tempo até o Mercado ou recuperam a Capacidade de Inovar. Ordenar com esses critérios torna a decisão discutível com evidência, e não com opinião.",
        topic: "Evidência e organização",
        options: [
            ["Comparando itens pelo efeito esperado em cada área de valor.", true],
            ["Definindo uma cota fixa de itens por área de valor em cada Sprint.", false],
            ["Substituindo o Product Backlog por um painel de indicadores da área.", false],
            ["Transferindo a ordenação para a área responsável pelos indicadores.", false],
        ],
    },
    {
        statement:
            "Uma empresa reduziu bastante o tempo de entrega, mas o time continua sem espaço para criar coisas novas por causa do peso da manutenção. O que esse quadro indica?",
        explanation:
            "Tempo até o Mercado (Time to Market) e Capacidade de Inovar (Ability to Innovate) medem coisas diferentes: entregar rápido não garante espaço para inovar se dívida técnica e trabalho de baixo valor consomem a capacidade do time. Por isso o modelo pede a leitura conjunta das quatro áreas.",
        topic: "Evidência e organização",
        options: [
            ["Entregar rápido não garante espaço para criar capacidades novas.", true],
            ["O tempo até o mercado foi medido com o indicador errado pela empresa.", false],
            ["A capacidade de inovar melhora sozinha quando a entrega fica rápida.", false],
            ["O valor atual do produto caiu por causa do excesso de manutenção.", false],
        ],
    },
    {
        statement:
            "Um produto tem clientes satisfeitos e ainda enxerga um mercado grande sem atender. Qual leitura combinada dessas duas áreas de valor sustenta a decisão de investimento?",
        explanation:
            "Valor Atual alto mostra que o produto entrega benefício real, e Valor Não Realizado alto mostra que existe espaço para crescer: a combinação favorece investir mais nesse produto. A decisão continua sendo verificada por medições a cada passo, e não assumida como certa.",
        topic: "Evidência e organização",
        options: [
            ["Vale investir mais: o produto entrega valor e há espaço para crescer.", true],
            ["Vale reduzir o investimento, pois os clientes atuais já estão satisfeitos.", false],
            ["Vale trocar de produto, pois o mercado restante tende a ser mais caro.", false],
            ["Vale congelar o produto e medir de novo apenas no próximo exercício.", false],
        ],
    },
    {
        statement:
            "Uma empresa chamou de produto cada sistema interno mantido por uma equipe, criando trinta produtos sem usuários claros. Que critério do Guia do Scrum foi ignorado?",
        explanation:
            "Um produto é um veículo para entregar valor, com fronteira clara, stakeholders conhecidos e usuários bem definidos. Chamar cada sistema de produto sem esses elementos multiplica Product Backlogs, dilui a responsabilidade pelo valor e esconde o resultado real das entregas.",
        topic: "Evidência e organização",
        options: [
            ["Produto exige fronteira clara, usuários e stakeholders definidos.", true],
            ["Produto exige ao menos um time dedicado em tempo integral a ele.", false],
            ["Produto exige aprovação formal do comitê de arquitetura da empresa.", false],
            ["Produto exige receita direta para justificar um Product Owner próprio.", false],
        ],
    },
    {
        statement:
            "Qual é o propósito declarado do Evidence-Based Management ao usar medições de valor nas decisões de produto?",
        explanation:
            "O Evidence-Based Management busca melhorar os resultados, reduzir os riscos e otimizar os investimentos, usando evidência empírica no lugar de suposição. Ele não substitui o Scrum nem prescreve indicadores fixos: as métricas variam conforme o contexto de cada organização.",
        topic: "Evidência e organização",
        options: [
            ["Melhorar resultados, reduzir riscos e otimizar os investimentos.", true],
            ["Padronizar os indicadores de produto usados por toda a organização.", false],
            ["Substituir o Scrum por um modelo de gestão baseado em indicadores.", false],
            ["Comparar o desempenho dos times a partir de uma base única de dados.", false],
        ],
    },
];
