// Seed da trilha Estratégia e Priorização, estagio 5 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-estrategia-e-priorizacao.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Estratégia e Priorização";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Estratégia como escolhas, não como slide: visão e diagnóstico, posicionamento e diferenciais defensáveis, OKRs sem teatro, o roadmap now-next-later que comunica incerteza, RICE e custo de atraso com o critério acima dos frameworks, e a influência com stakeholders que faz tudo isso sair do papel.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Visão e estratégia",
    aulas: [
        {
            titulo: "Visão que orienta",
            blocks: [
                {
                    type: "text",
                    value: '# O futuro desejado em uma frase testável\n\nVisão é a descrição do futuro que o seu produto quer tornar real: onde o usuário vai estar daqui a três ou cinco anos se você acertar. Não é o que a empresa faz hoje (isso é missão) e não é frase de camiseta (isso é slogan). Antes de aprovar qualquer parágrafo bonito, aplique dois testes: a visão é TESTÁVEL (dá para olhar o mundo e dizer se você chegou perto) e ela ORIENTA (na dúvida entre dois caminhos, ela ajuda a escolher um e descartar o outro).\n\nCompare duas frases. "Ser a plataforma financeira mais amada do Brasil" não passa em teste nenhum: amada por quem, medida como, orientando qual escolha? Já "todo autônomo brasileiro sabe, em qualquer dia do mês, quanto pode gastar sem comprometer os impostos" descreve um futuro observável. Você consegue imaginar a cena, medir a distância até ela e usar a frase para recusar uma feature que não aproxima ninguém desse dia. A diferença não é de estilo: é de utilidade. Visão boa trabalha todos os dias; visão ruim decora a parede da recepção e não decide nada.',
                },
                {
                    type: "table",
                    value: '[["Peça","Pergunta que responde","Horizonte","Exemplo"],["Missão","Por que existimos","Permanente","Simplificar a vida financeira de quem trabalha por conta própria"],["Visão","Onde estaremos se acertarmos","3 a 5 anos","Todo autônomo sabe quanto pode gastar em qualquer dia do mês"],["Slogan","Como nos apresentamos","Campanha","Seu dinheiro, sem sustos"],["Estratégia","Como chegamos lá","1 a 2 anos","Dominar o segmento de autônomos antes de expandir"]]',
                },
                {
                    type: "quote",
                    value: "Se a sua visão serve, palavra por palavra, para o concorrente, ela não está orientando ninguém: é papel de parede.",
                },
                {
                    type: "text",
                    value: '## Bons e ruins, lado a lado\n\nVisões ruins têm assinatura reconhecível: superlativo sem medida ("a melhor experiência"), abstração sem cena ("empoderar pessoas") e ambição sem recorte ("revolucionar o mercado financeiro"). O problema não é estética. Uma frase que cabe em qualquer pitch não elimina alternativa nenhuma, e o papel da visão é exatamente esse: ser o primeiro filtro de decisão da empresa.\n\nO teste prático que eu recomendo: pegue as três últimas decisões difíceis do seu time e pergunte se a visão teria ajudado a decidir. Se a resposta for não nas três, você não tem visão, tem enfeite. E um aviso de calibragem: visão não é compromisso de entrega. Ela pode e deve ser ambiciosa demais para caber num trimestre; quem traduz a ambição em passos verificáveis é a estratégia, e quem mede cada passo é o OKR, assunto de um módulo inteiro adiante. Visão usada como meta trimestral esmaga o time com uma cobrança impossível; meta trimestral vestida de visão engana a diretoria com uma ambição pequena demais. Cada peça no seu lugar.',
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença central entre visão e missão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Missão é o porquê de hoje; visão é o futuro desejado",
                            isCorrect: true,
                        },
                        {
                            text: "Missão é da diretoria; visão é escrita pelo time de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Missão muda todo ano; visão é revista a cada trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Missão fala de receita; visão fala apenas de tecnologia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna uma visão testável?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dá para olhar o mundo e medir se você chegou perto dela",
                            isCorrect: true,
                        },
                        {
                            text: "Ela foi validada em pesquisa com pelo menos cem usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Ela cita a meta de receita esperada para o próximo ano",
                            isCorrect: false,
                        },
                        {
                            text: "Ela cabe em uma frase curta aprovada pela diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'A diretoria propõe a visão "ser a plataforma mais amada do país". Qual é o problema central dessa frase?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela não elimina alternativa nenhuma, então não orienta",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é ambiciosa demais para o tamanho atual da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Ela deveria citar a meta de receita dos próximos dois anos",
                            isCorrect: false,
                        },
                        {
                            text: "Ela precisa ser aprovada pelo conselho antes de circular",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time transformou a visão em meta do trimestre e está esmagado pela cobrança. O que deu errado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Visão é ambição de anos; quem mede o passo curto é o OKR",
                            isCorrect: true,
                        },
                        {
                            text: "O time deveria ter negociado uma visão menos ambiciosa",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou quebrar a visão em tarefas diárias dentro do backlog",
                            isCorrect: false,
                        },
                        {
                            text: "A visão deveria mudar a cada trimestre junto do planejamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você percebe que a visão do seu produto serve, sem mudar uma palavra, para o maior concorrente. O que isso revela?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Falta recorte: ela não faz escolha que diferencie o produto",
                            isCorrect: true,
                        },
                        {
                            text: "Nada grave: visões do mesmo mercado sempre coincidem em essência",
                            isCorrect: false,
                        },
                        {
                            text: "Que o concorrente copiou o posicionamento do seu produto",
                            isCorrect: false,
                        },
                        {
                            text: "Que o mercado amadureceu e a diferença agora virá do preço",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Estratégia é escolha",
            blocks: [
                {
                    type: "text",
                    value: '# Escolher é abrir mão\n\nRichard Rumelt passou a carreira colecionando planos que se dizem estratégia e não são, e o padrão se repete em qualquer empresa: metas vestidas de estratégia e listas de desejos. "Crescer 30% este ano" não é estratégia, é aspiração; não diz de onde o crescimento vem, o que muda na operação nem o que fica de fora para ele acontecer. A lista de doze prioridades também não é: quando tudo é prioridade, o time decide sozinho no dia a dia, e cada pessoa decide numa direção diferente.\n\nEstratégia de verdade tem cheiro de escolha: um caminho apostado e, na mesma página, os caminhos recusados. "Vamos dominar o segmento de autônomos e NÃO vamos atacar contas PJ nem investimentos neste ciclo" é estratégia, porque alguém importante vai reclamar. Se o documento foi aprovado em dez minutos e agradou a todo mundo, desconfie: consenso instantâneo costuma significar que nada foi decidido, só descrito. O teste rápido que nunca falha: procure no texto um "não faremos". Se não existir, você está segurando uma lista de desejos com capa bonita.',
                },
                {
                    type: "table",
                    value: '[["Sinal de estratégia ruim","Como aparece","Por que falha"],["Meta vestida de estratégia","Crescer 30% ao ano","Diz o quanto, não diz o como"],["Lista de desejos","Doze prioridades para o ano","Sem escolha, tudo compete com tudo"],["Palavrório","Alavancar sinergias digitais","Esconde a ausência de decisão"],["Negação do problema","Falar de expansão ignorando o churn","Sem diagnóstico honesto, o plano é fantasia"]]',
                },
                {
                    type: "quote",
                    value: "Estratégia é tanto sobre o que você decide não fazer quanto sobre o que faz. Se nada doeu na aprovação do plano, nenhuma escolha foi feita.",
                },
                {
                    type: "text",
                    value: "## Quem paga a conta da não escolha\n\nA não escolha parece prudente e sai cara. Imagine o app de finanças com um time de oito pessoas atacando três frentes: investimentos, autônomos e contas PJ. São quase três pessoas por frente, contra concorrentes que colocam vinte em uma. Em cada frente você é o competidor mais fraco, e a matemática não perdoa: profundidade vence espalhamento em mercado disputado. O concorrente focado lança em um mês o que você lança em um trimestre, porque não paga o imposto da troca de contexto.\n\nQuem paga a conta primeiro é o time, que alterna de problema toda semana e não acumula domínio de nenhum. Depois paga o usuário, que recebe três produtos rasos em vez de um fundo. Por fim paga a empresa, quando descobre que gastou um ano para ficar em terceiro lugar em três corridas. Dizer não é a ferramenta mais barata de estratégia que existe: custa uma conversa desconfortável hoje e economiza trimestres inteiros depois. O seu papel como PM inclui provocar essa conversa antes que o calendário a torne inevitável.",
                },
            ],
            questions: [
                {
                    statement: 'Por que "crescer 30% este ano" não é uma estratégia?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "É aspiração: não diz como nem o que fica de fora",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o número saudável para metas anuais seria 20%",
                            isCorrect: false,
                        },
                        {
                            text: "Porque estratégia não deve mencionar crescimento",
                            isCorrect: false,
                        },
                        {
                            text: "Porque metas de crescimento pertencem só ao financeiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o sinal mais confiável de que um plano fez escolhas de verdade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele diz explicitamente o que a empresa não vai fazer",
                            isCorrect: true,
                        },
                        {
                            text: "Ele foi aprovado por unanimidade na primeira reunião",
                            isCorrect: false,
                        },
                        {
                            text: "Ele tem metas numéricas para todas as áreas da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Ele cabe em uma única página e usa linguagem simples",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O planejamento anual saiu com doze prioridades de mesmo peso. Qual é a consequência prática mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada pessoa prioriza sozinha e o esforço se dispersa",
                            isCorrect: true,
                        },
                        {
                            text: "O time entrega as doze com um pouco mais de horas extras",
                            isCorrect: false,
                        },
                        {
                            text: "A diretoria corta o orçamento por excesso de ambição",
                            isCorrect: false,
                        },
                        {
                            text: "As prioridades se ordenam sozinhas conforme o trimestre anda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A estratégia foi aprovada em dez minutos e agradou todas as áreas. Por que isso deveria acender um alerta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Consenso fácil sugere que nada foi de fato decidido",
                            isCorrect: true,
                        },
                        {
                            text: "Reuniões curtas indicam que faltou convidar mais gente",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovação rápida só vale quando registrada em contrato",
                            isCorrect: false,
                        },
                        {
                            text: "Estratégias boas exigem no mínimo um mês de discussão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O CEO quer atacar investimentos, autônomos e PJ com um time de oito pessoas. Como você argumenta contra?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Mostra que três frentes rasas perdem para um rival focado",
                            isCorrect: true,
                        },
                        {
                            text: "Aceita as três frentes e propõe contratar mais devagar",
                            isCorrect: false,
                        },
                        {
                            text: "Propõe rodízio mensal do time inteiro entre as três frentes",
                            isCorrect: false,
                        },
                        {
                            text: "Sugere terceirizar duas frentes para uma consultoria externa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Diagnóstico primeiro",
            blocks: [
                {
                    type: "text",
                    value: '# O desafio central antes da solução\n\nNo modelo de Rumelt, toda estratégia boa tem um núcleo de três peças, e a primeira delas é o diagnóstico: a leitura honesta do cenário que explica POR QUE o desempenho é o que é e nomeia o obstáculo que, removido, destrava o resto. A maioria dos planos pula essa etapa e vai direto para a solução, o que equivale a receitar remédio sem examinar o paciente.\n\nSintoma não é diagnóstico. "Churn de 6% ao mês" é o que dói; diagnóstico é a frase que explica a dor. No nosso app de finanças, o diagnóstico honesto seria: "depois de organizar o primeiro mês, o produto não devolve valor novo; o usuário resolve o problema visível e vai embora". Repare no que essa frase faz: transforma um número solto numa causa endereçável e aponta para onde a solução precisa ir (valor recorrente), sem ainda dizer qual é. Um bom diagnóstico simplifica a realidade: pega mil dados e devolve um desafio central que cabe em três frases e que todo mundo consegue repetir no corredor.',
                },
                {
                    type: "table",
                    value: '[["Sintoma","Diagnóstico raso","Diagnóstico honesto"],["Churn de 6% ao mês","Usuários não engajam","O produto não devolve valor novo depois do primeiro mês"],["Vendas em queda","O comercial está fraco","Perdemos a paridade no requisito que decide a compra"],["NPS estagnado","Falta caprichar na interface","O caso de uso principal exige dez toques a mais que o rival"],["CAC subindo","O marketing está caro","Estamos comprando o mesmo público disputado por todos"]]',
                },
                {
                    type: "quote",
                    value: "Um diagnóstico que não proíbe nenhuma solução não diagnosticou nada: só decorou o problema com palavras novas.",
                },
                {
                    type: "text",
                    value: '## Honestidade dói e economiza\n\nLer o cenário com honestidade inclui admitir o que a empresa errou e o que o concorrente acerta, e é aqui que a maioria tropeça: o diagnóstico político ("o mercado está difícil", "falta verba de marketing") protege egos e queima trimestres. Quatro técnicas ajudam a manter a régua. Escreva o diagnóstico antes de qualquer reunião de solução, porque a solução favorita contamina a leitura. Separe fatos ("retenção D30 de 18%") de interpretações ("o onboarding é confuso"). Procure ativamente o dado que derrubaria a sua leitura, não só o que confirma. E aplique o teste da proibição: se esse diagnóstico está certo, o que ele proíbe? "Não adianta comprar mais tráfego enquanto o balde vaza" é um diagnóstico proibindo algo; se nada fica proibido, nada foi dito.\n\nEm 2026, com dashboards por todos os lados, o risco mudou de lado: raramente falta dado, sobra. Diagnosticar virou o ato de escolher quais números contam a história verdadeira e ter coragem de escrever essa história mesmo quando ela aponta para dentro de casa.',
                },
            ],
            questions: [
                {
                    statement:
                        "No núcleo da estratégia segundo Rumelt, qual é o papel do diagnóstico?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Explicar a causa do desempenho e nomear o desafio central",
                            isCorrect: true,
                        },
                        {
                            text: "Listar todas as métricas da empresa em um único painel",
                            isCorrect: false,
                        },
                        {
                            text: "Definir as metas numéricas que o time deve perseguir",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher as ferramentas de análise que o time vai usar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: '"Churn de 6% ao mês" é sintoma ou diagnóstico?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sintoma: mostra a dor, mas não explica a causa dela",
                            isCorrect: true,
                        },
                        {
                            text: "Diagnóstico: números sempre explicam a causa raiz",
                            isCorrect: false,
                        },
                        {
                            text: "Diagnóstico, desde que venha acompanhado de um gráfico",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum dos dois: churn é apenas uma meta de retenção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que escrever o diagnóstico antes da reunião de soluções?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A solução favorita contamina a leitura do problema",
                            isCorrect: true,
                        },
                        {
                            text: "Para a reunião de soluções poder ser cancelada depois",
                            isCorrect: false,
                        },
                        {
                            text: "Porque diagnósticos escritos em grupo são sempre piores",
                            isCorrect: false,
                        },
                        {
                            text: "Para o documento ficar pronto antes do fim do trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O diretor insiste que o problema é "mercado difícil e pouca verba". Como você testa se esse diagnóstico vale algo?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pergunta o que ele proíbe; se não proíbe nada, é vazio",
                            isCorrect: true,
                        },
                        {
                            text: "Compara com o diagnóstico publicado pelos concorrentes",
                            isCorrect: false,
                        },
                        {
                            text: "Aceita, porque contexto de mercado não se questiona",
                            isCorrect: false,
                        },
                        {
                            text: "Pede uma consultoria externa para validar a hipótese",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Retenção baixa, e o time já quer comprar mais tráfego pago. Com o diagnóstico do balde furado em mãos, qual é a sua jogada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vetar a compra: encher um balde furado só acelera a perda",
                            isCorrect: true,
                        },
                        {
                            text: "Aprovar a compra, porque volume novo compensa o churn",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir a verba meio a meio entre tráfego e retenção",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar qualquer decisão até o NPS do trimestre fechar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Política orientadora e ações coerentes",
            blocks: [
                {
                    type: "text",
                    value: "# A ponte entre entender e agir\n\nO núcleo de Rumelt tem três peças que só funcionam juntas: diagnóstico (o que está acontecendo e por quê), política orientadora (a abordagem geral escolhida para atacar o desafio) e ações coerentes (os passos concretos que aplicam a política e se reforçam entre si). A política orientadora é a peça mais mal compreendida: ela não é meta nem tarefa, é o COMO geral que canaliza a energia. Pense nela como as margens da estrada: não dizem onde parar para almoçar, mas impedem que você dirija pelo pasto.\n\nNo app de finanças, ficaria assim. Diagnóstico: o público geral abandona depois do primeiro mês, mas autônomos retêm o dobro porque a dor deles se repete toda semana. Política orientadora: concentrar o produto no autônomo e no seu ciclo semanal de decisão financeira. Ações coerentes: separar gasto pessoal do gasto de trabalho, criar a reserva automática para impostos, prever os meses magros com base no histórico. Cada ação serve à política, e cada uma torna as outras mais valiosas: a separação de gastos alimenta a previsão, que dá sentido à reserva.",
                },
                {
                    type: "table",
                    value: '[["Peça do núcleo","Pergunta que responde","Exemplo no app de finanças"],["Diagnóstico","Por que o desempenho é esse","Só o autônomo tem dor que se repete toda semana"],["Política orientadora","Qual abordagem geral adotamos","Tudo para o ciclo semanal de decisão do autônomo"],["Ações coerentes","Que passos aplicam a política","Separar gastos, reserva de imposto, prever meses magros"],["Teste de coerência","As ações se reforçam","Separação alimenta previsão, que dá sentido à reserva"]]',
                },
                {
                    type: "quote",
                    value: "Iniciativas que não conseguem citar a política orientadora que servem não são estratégia em execução: são vontades com orçamento.",
                },
                {
                    type: "text",
                    value: '## Coerência é o teste final\n\nA marca registrada da má estratégia é a incoerência entre iniciativas: cortar preço para ganhar volume, prometer atendimento premium e, no mesmo trimestre, reduzir o time de suporte. Cada decisão pode ter defensor eloquente; juntas, elas se anulam. A incoerência quase nunca nasce de burrice, nasce de política: cada stakeholder ganhou um pedaço do plano, e o plano virou colcha.\n\nDois hábitos protegem você. Primeiro, o teste de citação: toda iniciativa do trimestre precisa apontar a política orientadora que serve; a que não aponta entra na fila do não, por melhor que pareça isolada. Segundo, o teste do reforço: pergunte se a iniciativa A deixa a iniciativa B mais fácil ou mais valiosa. Estratégias fortes têm efeito composto, cada entrega multiplica as vizinhas; estratégias fracas são somas de projetos que nem se conhecem. Quando alguém trouxer "uma oportunidade imperdível" fora da política, a resposta madura não é "é ruim", é "pode ser ótima, e não é o nosso jogo neste ciclo". A política orientadora existe para dar a você o direito de dizer exatamente isso.',
                },
            ],
            questions: [
                {
                    statement: "O que é a política orientadora no núcleo de Rumelt?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A abordagem geral escolhida para atacar o desafio",
                            isCorrect: true,
                        },
                        {
                            text: "O conjunto de metas numéricas aprovadas para o ano",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de tarefas priorizadas no backlog do time",
                            isCorrect: false,
                        },
                        {
                            text: "O documento de compliance exigido pelo jurídico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza ações coerentes?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Elas aplicam a política e se reforçam entre si",
                            isCorrect: true,
                        },
                        {
                            text: "Elas são aprovadas juntas na mesma reunião anual",
                            isCorrect: false,
                        },
                        {
                            text: "Elas têm o mesmo prazo de entrega no trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Elas pertencem todas ao mesmo time de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Cortar preço, prometer atendimento premium e reduzir o suporte no mesmo trimestre. Qual é o defeito desse plano?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Incoerência: as iniciativas se anulam entre si",
                            isCorrect: true,
                        },
                        {
                            text: "Falta de ambição nas metas de cada iniciativa",
                            isCorrect: false,
                        },
                        {
                            text: "Excesso de foco em um único segmento de cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Prazo curto demais para três frentes tão simples",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "De onde costuma nascer a incoerência entre iniciativas de um plano?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "De agradar cada stakeholder com um pedaço do plano",
                            isCorrect: true,
                        },
                        {
                            text: "Da falta de ferramentas modernas de gestão de projeto",
                            isCorrect: false,
                        },
                        {
                            text: "De times técnicos que ignoram as ordens da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Do excesso de dados disponíveis na hora de planejar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Chega uma "oportunidade imperdível" fora da política orientadora, com patrocínio de um diretor. Qual é a resposta madura?',
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pode ser ótima, e não é o nosso jogo neste ciclo",
                            isCorrect: true,
                        },
                        {
                            text: "Encaixar a oportunidade no trimestre com horas extras",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar porque patrocínio de diretor reduz o risco",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar alegando que a ideia é fraca tecnicamente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Estratégia de produto vs da empresa",
            blocks: [
                {
                    type: "text",
                    value: '# Herdar contexto, não copiar metas\n\nA estratégia da empresa define onde competir e qual é a aposta macro: mercados, modelo de receita, vantagem que se quer construir. A estratégia de produto herda esse contexto e o traduz em escolhas que só o produto pode fazer: qual segmento primeiro, qual problema resolver, em que sequência apostar. Marty Cagan insiste nesse desenho: times empoderados não inventam estratégia num vácuo nem recebem lista de features pronta; recebem contexto e devolvem escolhas de produto com dono.\n\nO erro mais comum é o atalho preguiçoso: pegar a meta financeira da empresa e reescrever como "estratégia de produto". Se a empresa quer dobrar a receita, a estratégia de produto NÃO é "dobrar a receita": é a cadeia de escolhas que torna isso possível, por exemplo "dominar o segmento de autônomos, porque ele retém o dobro e paga mais, começando pelo ciclo semanal de caixa". Note a tradução: a empresa fala de resultado, o produto fala de quem, qual problema e em que ordem. Quando os dois níveis falam a mesma frase, um deles não está fazendo o próprio trabalho.',
                },
                {
                    type: "code",
                    value: "ESTRATEGIA DE PRODUTO (one-pager)\n\n1. DIAGNOSTICO\n   O desafio central em 2 ou 3 frases, com numeros.\n   Ex.: retencao D30 de 18%; autonomos retem 34% e pagam 1,6x mais.\n\n2. APOSTA (politica orientadora)\n   A abordagem escolhida E os caminhos recusados.\n   Ex.: tudo no ciclo semanal do autonomo. NAO: investimentos, PJ.\n\n3. ACOES COERENTES\n   3 a 5 iniciativas que se reforcam, cada uma citando a aposta.\n\n4. MEDIDAS DE SUCESSO\n   Outcomes com baseline e alvo (nunca lista de entregas).\n\n5. RISCOS E PREMISSAS\n   O que precisa ser verdade; qual evidencia derrubaria o plano.",
                },
                {
                    type: "table",
                    value: '[["Nível","Pergunta que responde","Exemplo de decisão"],["Empresa","Onde competimos e com qual aposta","Ser o sistema financeiro de quem trabalha por conta própria"],["Produto","Que problema, para quem, em que ordem","Autônomos primeiro: caixa semanal antes de crédito"],["Time","Qual solução e como validar","Reserva automática de imposto testada no onboarding"]]',
                },
                {
                    type: "quote",
                    value: "Documento de estratégia que precisa de uma hora de reunião para ser explicado não é estratégia: é ata com ambição.",
                },
                {
                    type: "text",
                    value: "## O documento enxuto\n\nEstratégia de produto boa cabe em uma página, e isso não é capricho de minimalista: uma página força escolha, vinte páginas escondem que ela não aconteceu. O formato que funciona segue o núcleo que você já conhece: diagnóstico com números, aposta com os nãos explícitos, ações coerentes, medidas de sucesso em outcome e riscos com as premissas que precisam ser verdade. Quem lê em cinco minutos deve conseguir responder: qual é o desafio, qual é a aposta, o que ficou de fora e como saberemos se está funcionando.\n\nO documento enxuto tem uma segunda virtude: ele é atualizável. Estratégia não é pedra; quando uma premissa cai (o segmento não retém como previsto, o concorrente muda o jogo), o one-pager é revisado e a mudança é registrada com data e motivo. O que não pode acontecer é a estratégia mudar por cansaço ou por reunião ruim, sem evidência nova. Ao longo da trilha você vai preencher cada seção desse formato com técnica própria: posicionamento, OKRs, roadmap e priorização são, no fundo, os capítulos detalhados dessa única página.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a relação correta entre estratégia da empresa e de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O produto herda o contexto e o traduz em escolhas próprias",
                            isCorrect: true,
                        },
                        {
                            text: "O produto copia as metas da empresa com outras palavras",
                            isCorrect: false,
                        },
                        {
                            text: "São documentos independentes escritos por áreas rivais",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa detalha as features e o produto executa a lista",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o one-pager de estratégia deve caber em uma página?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma página força escolhas; vinte páginas as escondem",
                            isCorrect: true,
                        },
                        {
                            text: "Porque executivos se recusam a ler documentos longos",
                            isCorrect: false,
                        },
                        {
                            text: "Para caber no slide de abertura da reunião de conselho",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ferramentas de gestão limitam o tamanho do texto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'A empresa quer dobrar a receita e o PM escreveu "dobrar a receita" como estratégia de produto. Qual é o problema?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Faltou a tradução: quem, qual problema e em que ordem",
                            isCorrect: true,
                        },
                        {
                            text: "A meta deveria ser triplicar para criar margem de folga",
                            isCorrect: false,
                        },
                        {
                            text: "Receita é assunto proibido em documentos de produto",
                            isCorrect: false,
                        },
                        {
                            text: "O PM deveria esperar a estratégia da empresa mudar antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Segundo a visão de Marty Cagan, o que um time empoderado recebe da liderança?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contexto estratégico e problemas, não lista de features",
                            isCorrect: true,
                        },
                        {
                            text: "Autonomia total para definir a estratégia da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Um roadmap detalhado com as datas de cada entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Metas individuais de velocidade para cada engenheiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma premissa central da estratégia caiu no meio do trimestre: o segmento apostado não retém como previsto. O que fazer com o one-pager?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Revisar a aposta e registrar a mudança com data e motivo",
                            isCorrect: true,
                        },
                        {
                            text: "Manter tudo até o fim do ano para preservar a confiança",
                            isCorrect: false,
                        },
                        {
                            text: "Descartar o documento e voltar a operar sem estratégia",
                            isCorrect: false,
                        },
                        {
                            text: "Esconder o dado até o time bater as metas do trimestre",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Posicionamento e mercado",
    aulas: [
        {
            titulo: "Segmentação com critério",
            blocks: [
                {
                    type: "text",
                    value: "# O mercado que você consegue endereçar\n\nTodo pitch tem o slide do mercado de bilhões, e quase nenhum sobrevive à pergunta seguinte: quanto disso você consegue de fato atender? A hierarquia clássica ajuda a manter a honestidade. TAM é o mercado total da categoria (todo mundo que gasta com finanças pessoais). SAM é a fatia que o seu produto, como ele existe, consegue servir (quem usa app, aceita conectar banco, fala português). SOM é o que você alcança com o canal e o time de hoje. O número que paga as suas contas é o SOM; os outros dois medem o tamanho do sonho.\n\nSegmentar é dividir esse mercado em grupos que compartilham a mesma dor, o mesmo contexto de uso e o mesmo bolso, e escolher por onde começar. Critérios que importam: intensidade da dor (ela se repete? o cliente já paga por paliativo?), acesso (você consegue chegar nesse grupo sem comprar mídia infinita?), disposição a pagar e efeito de rede entre membros. Segmento bom não é o maior: é o que você consegue dominar primeiro com o que tem.",
                },
                {
                    type: "table",
                    value: '[["Conceito","Pergunta","Exemplo no app de finanças"],["TAM","Quanto a categoria movimenta","Todos que gastam com organização financeira no país"],["SAM","Quem o produto atual serve","Usuários de app dispostos a conectar o banco"],["SOM","Quem você alcança hoje","Autônomos urbanos que chegam pelos canais atuais"],["Cabeça de praia","Por onde começar a dominar","Autônomos de serviços com renda variável"]]',
                },
                {
                    type: "quote",
                    value: "Mercado endereçável não é o slide que impressiona o investidor: é o número que diz se o seu canal de hoje paga a folha de amanhã.",
                },
                {
                    type: "text",
                    value: '## O segmento cabeça de praia\n\nCabeça de praia é o segmento estreito que você escolhe dominar primeiro para, a partir dele, expandir. A lógica vem de guerra e de startups: concentrar força num ponto onde você pode ser o melhor do mundo, em vez de ser mais um em todo lugar. Dominar um nicho gera três ativos que dinheiro não compra rápido: reputação boca a boca dentro do grupo (autônomos conversam com autônomos), profundidade de produto que generalistas não alcançam e dados específicos do segmento que viram vantagem.\n\nO medo clássico é "estamos deixando mercado na mesa". Estão, e é essa a jogada: o foco é uma vantagem exatamente porque o concorrente grande não consegue se dar ao luxo de ter. O banco enorme não vai redesenhar o produto inteiro para o fluxo de caixa do diarista; você pode. A pergunta de saída também precisa de critério: você expande quando o segmento dá sinais de saturação (crescimento orgânico desacelerando com liderança consolidada), não quando a diretoria fica entediada. Sair cedo demais da cabeça de praia é o erro mais caro e mais comum.',
                },
            ],
            questions: [
                {
                    statement:
                        "Qual número representa o mercado que você alcança com canal e time atuais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "SOM: a fatia alcançável com os recursos de hoje",
                            isCorrect: true,
                        },
                        {
                            text: "TAM: o total que a categoria movimenta no país",
                            isCorrect: false,
                        },
                        {
                            text: "SAM: todos que o produto conseguiria servir um dia",
                            isCorrect: false,
                        },
                        {
                            text: "CAC: o custo médio de aquisição de cada cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que define um bom segmento cabeça de praia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ser dominável primeiro com os recursos que você tem",
                            isCorrect: true,
                        },
                        {
                            text: "Ser o maior segmento disponível dentro do mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Ser o segmento com menos concorrentes registrados",
                            isCorrect: false,
                        },
                        {
                            text: "Ser o grupo mais parecido com o investidor do fundo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O investidor pergunta "por que vocês ignoram 90% do mercado?". Qual é a defesa correta do foco?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dominar o nicho gera reputação e dados que financiam",
                            isCorrect: true,
                        },
                        {
                            text: "Admitir o erro e ampliar o público alvo já no trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar que o time é pequeno demais para mirar mais alto",
                            isCorrect: false,
                        },
                        {
                            text: "Mostrar que os outros 90% serão atacados por anúncios",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que sinal justifica expandir para além da cabeça de praia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Liderança consolidada e crescimento orgânico saturando",
                            isCorrect: true,
                        },
                        {
                            text: "A diretoria considerar o nicho pequeno demais para o pitch",
                            isCorrect: false,
                        },
                        {
                            text: "Um concorrente novo anunciar captação de investimento",
                            isCorrect: false,
                        },
                        {
                            text: "Seis meses corridos desde o lançamento no segmento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois segmentos: A tem dor intensa e canal barato, mas é 5x menor que B, onde a dor é ocasional e o acesso é caro. Por onde começar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Por A: dor recorrente e acesso barato vencem tamanho",
                            isCorrect: true,
                        },
                        {
                            text: "Por B: o tamanho do mercado sempre decide a entrada",
                            isCorrect: false,
                        },
                        {
                            text: "Pelos dois ao mesmo tempo, para não perder timing",
                            isCorrect: false,
                        },
                        {
                            text: "Por nenhum: melhor esperar um segmento maior aparecer",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Posicionamento",
            blocks: [
                {
                    type: "text",
                    value: "# Pra quem, contra o quê, por que ganha\n\nPosicionamento é a resposta estruturada a três perguntas: para quem o produto é a melhor escolha, contra qual alternativa ele compete de verdade e por que ele ganha essa comparação. Parece simples e quase ninguém responde direito, porque a segunda pergunta é traiçoeira: a alternativa competitiva real raramente é o concorrente do pitch. Para o app de finanças do autônomo, a concorrência não é só a fintech rival: é a planilha que ele mantém há anos, o caderninho, e a alternativa mais forte de todas, não fazer nada e continuar no sufoco conhecido.\n\nIsso muda o discurso inteiro. Contra a fintech rival, você compararia features; contra a planilha, você vende o fim do trabalho manual e o alerta que a planilha nunca dará; contra o não fazer nada, você vende o custo escondido do caos: o imposto pago com multa, o mês magro que pegou de surpresa. Posicionar é escolher essa batalha explicitamente. Quem não escolhe compete contra todo mundo ao mesmo tempo e perde para o mais barato.",
                },
                {
                    type: "table",
                    value: '[["Campo","Pergunta","Exemplo preenchido"],["Para quem","Quem tem a dor que atacamos","Autônomos de serviços com renda variável"],["Alternativa real","O que ele usaria no nosso lugar","Planilha própria ou simplesmente não controlar"],["Categoria","Em que prateleira nos colocam","Assistente financeiro, não mais um app de gastos"],["Por que ganha","Nossa vantagem nessa comparação","Reserva de imposto e previsão de meses magros automáticas"],["Prova","Evidência de que é verdade","Usuários ativos deixando a planilha em 3 semanas"]]',
                },
                {
                    type: "quote",
                    value: "Se o cliente compara você com uma planilha e o seu pitch compara você com outra startup, quem está fora da conversa é você.",
                },
                {
                    type: "text",
                    value: '## Posicionamento é escolha, não descrição\n\nUm erro frequente é tratar posicionamento como exercício de marketing feito depois do produto pronto. É o contrário: a escolha de contra quem competir deveria moldar o backlog. Se a alternativa real é a planilha, a primeira milha do produto precisa importar os dados dela sem fricção e provar valor na primeira semana, senão o usuário volta para o conhecido. Se a alternativa é não fazer nada, o onboarding precisa mostrar o custo da inércia com os números do próprio usuário, não com estatísticas genéricas.\n\nO teste de qualidade do posicionamento é a exclusão: "para quem" bom exclui gente (autônomos de serviços, não "pessoas que querem organizar a vida"); "por que ganha" bom cita algo que a alternativa não consegue copiar amanhã de manhã. E ele precisa ser verificável: a seção de prova existe para impedir posicionamento de ficção. Quando o time inteiro sabe contra o quê o produto compete, decisões pequenas se alinham sozinhas: o suporte responde melhor, o marketing acerta o anúncio, o PM recusa a feature que serve a batalha errada.',
                },
            ],
            questions: [
                {
                    statement: "Quais são as três perguntas centrais do posicionamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para quem, contra qual alternativa e por que ganhamos",
                            isCorrect: true,
                        },
                        {
                            text: "Quanto custa, quando lança e quem aprova o orçamento",
                            isCorrect: false,
                        },
                        {
                            text: "Qual slogan, qual logotipo e qual canal de mídia usar",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos usuários, qual receita e qual margem esperar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para o autônomo que controla tudo numa planilha, qual é a alternativa competitiva real do app?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A própria planilha e a opção de não controlar nada",
                            isCorrect: true,
                        },
                        {
                            text: "Somente as outras fintechs registradas na categoria",
                            isCorrect: false,
                        },
                        {
                            text: "Os grandes bancos tradicionais e seus gerentes",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicativos internacionais ainda sem versão local",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'A alternativa real do seu produto é "não fazer nada". O que o onboarding precisa provar primeiro?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "O custo da inércia com os números do próprio usuário",
                            isCorrect: true,
                        },
                        {
                            text: "A lista completa de features que o produto oferece",
                            isCorrect: false,
                        },
                        {
                            text: "Os prêmios e certificações que a empresa acumulou",
                            isCorrect: false,
                        },
                        {
                            text: "A comparação de preço com os concorrentes diretos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O "para quem" do documento diz "pessoas que querem organizar a vida financeira". Qual é o defeito?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não exclui ninguém, então não orienta produto nem canal",
                            isCorrect: true,
                        },
                        {
                            text: "É restritivo demais e deixa mercado fora da conta",
                            isCorrect: false,
                        },
                        {
                            text: "Deveria citar a faixa etária e a renda média do público",
                            isCorrect: false,
                        },
                        {
                            text: "Falta mencionar o nome dos concorrentes que atacamos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O pitch compara seu app com startups rivais, mas 80% dos leads perdidos ficam na planilha. O que o posicionamento deveria mudar no produto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Importar a planilha sem fricção e provar valor cedo",
                            isCorrect: true,
                        },
                        {
                            text: "Adicionar as features que as startups rivais anunciaram",
                            isCorrect: false,
                        },
                        {
                            text: "Baixar o preço para ficar abaixo de todas as rivais",
                            isCorrect: false,
                        },
                        {
                            text: "Investir o trimestre em uma campanha contra planilhas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Análise de concorrência sem paranoia",
            blocks: [
                {
                    type: "text",
                    value: '# Olhar o concorrente sem virar refém\n\nExistem dois PMs disfuncionais diante da concorrência: o que não olha nunca ("a gente foca no nosso usuário") e o que olha demais e transforma o backlog num espelho do rival. Os dois erram pelo mesmo motivo: não têm critério sobre o que importa. O concorrente é uma fonte de dados como outra qualquer, e dados precisam de filtro.\n\nO que importa observar: movimentos de posicionamento (o rival mudou de segmento ou de preço, isso reconta o mercado), resultados visíveis (o que os usuários DELE elogiam e reclamam em reviews públicos é pesquisa de graça) e apostas estruturais (contratações, aquisições, mudanças de modelo de negócio). O que quase nunca importa: a feature da semana. Copiar feature avulsa é herdar a solução sem conhecer o problema, e você a implementa pior, atrasado e sem o contexto que a fez funcionar lá. Em 2026, com todo lançamento amplificado em redes e newsletters, o barulho é maior que nunca; o seu filtro precisa ser proporcional.',
                },
                {
                    type: "table",
                    value: '[["Sinal do concorrente","Importa?","Reação adequada"],["Mudou preço ou segmento alvo","Sim, reconta o mercado","Revisar posicionamento e cabeça de praia"],["Reviews elogiando um fluxo dele","Sim, é pesquisa de graça","Entender o problema por trás do elogio"],["Contratou pesado para uma área","Sim, revela a aposta","Antecipar o movimento no seu radar"],["Lançou a feature da semana","Quase nunca","Perguntar qual problema ela resolve antes de reagir"],["Anunciou captação barulhenta","Pouco","Seguir o plano; dinheiro não é estratégia"]]',
                },
                {
                    type: "quote",
                    value: "Concorrente bom é professor barato: os reviews dele contam de graça o que o seu roadmap levaria um trimestre para descobrir.",
                },
                {
                    type: "text",
                    value: '## Copiar com critério, ignorar com coragem\n\nCopiar não é pecado; copiar sem entender é. Quando o rival acerta algo que serve à SUA política orientadora, estude o problema que ele resolveu e implemente a sua versão, possivelmente melhor, porque você chega depois e aprende com os erros dele. Quando o acerto dele serve ao jogo DELE e não ao seu, ignorar é a decisão estratégica correta, mesmo com a diretoria ansiosa. A pergunta de triagem é sempre a mesma: isso ataca o desafio central do meu diagnóstico ou o do dele?\n\nMonte uma rotina leve, não um departamento de espionagem: uma revisão mensal de meia hora com três fontes (reviews públicos, changelog dos rivais, vagas abertas) e um registro de uma linha por observação. O objetivo é detectar tendência, não reagir a evento. E cuidado com o efeito manada: quando todos os concorrentes correm para a mesma feature, a pergunta certa não é "como copiamos rápido", é "que aposta compartilhada eles estão fazendo, e ela vale para o nosso segmento?". Às vezes a multidão está certa. Às vezes ela só está com medo junta.',
                },
            ],
            questions: [
                {
                    statement: "Qual sinal de concorrente quase nunca merece reação imediata?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O lançamento de uma feature avulsa na semana",
                            isCorrect: true,
                        },
                        {
                            text: "A mudança de preço e de segmento alvo do rival",
                            isCorrect: false,
                        },
                        {
                            text: "Reviews públicos elogiando um fluxo específico",
                            isCorrect: false,
                        },
                        {
                            text: "Contratações pesadas em uma área estratégica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os reviews públicos do concorrente são valiosos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "São pesquisa de usuário de graça sobre dores reais",
                            isCorrect: true,
                        },
                        {
                            text: "Permitem processar o rival por propaganda enganosa",
                            isCorrect: false,
                        },
                        {
                            text: "Mostram exatamente o roadmap interno da empresa rival",
                            isCorrect: false,
                        },
                        {
                            text: "Servem de prova de mercado para o pitch de captação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O rival lançou uma feature e a diretoria quer cópia imediata. Qual é a pergunta de triagem correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Essa feature ataca o desafio central do nosso diagnóstico?",
                            isCorrect: true,
                        },
                        {
                            text: "Quantos dias o time levaria para entregar uma cópia fiel?",
                            isCorrect: false,
                        },
                        {
                            text: "O rival registrou patente que impeça a nossa versão?",
                            isCorrect: false,
                        },
                        {
                            text: "A imprensa especializada deu destaque para o lançamento?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Todos os concorrentes correram para a mesma aposta. Como reagir com critério?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Avaliar se a aposta compartilhada vale para o seu segmento",
                            isCorrect: true,
                        },
                        {
                            text: "Copiar rápido, porque consenso de mercado não erra",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar sempre, porque manada é sinal seguro de erro",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar um ano completo para ver quem sobreviveu à moda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O rival acertou um fluxo que serve à estratégia dele, não à sua, e o CEO cobra resposta. Qual é a postura estratégica correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ignorar com justificativa: o acerto serve ao jogo dele",
                            isCorrect: true,
                        },
                        {
                            text: "Copiar mesmo assim para neutralizar a vantagem do rival",
                            isCorrect: false,
                        },
                        {
                            text: "Mudar a estratégia para disputar o mesmo jogo do rival",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar uma versão simplificada só para constar na mídia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Diferenciais defensáveis",
            blocks: [
                {
                    type: "text",
                    value: '# Feature não é fosso\n\nToda vantagem que pode ser copiada em um trimestre será copiada em um trimestre. É por isso que feature não é fosso: o rival com mais engenheiros replica a sua tela em semanas. Fosso (moat) é a vantagem que fica mais forte com o tempo e mais cara de atacar, e as quatro famílias clássicas valem para produto digital. Efeito de rede: cada usuário novo torna o produto melhor para os demais (marketplace, comunidade). Dados proprietários: informação acumulada que melhora o produto e que o rival não compra pronta, como o histórico de renda variável dos seus autônomos alimentando previsões que ninguém mais faz. Custo de troca: quanto mais o cliente investe no produto (histórico, integrações, hábito), mais caro fica sair. Marca: a confiança acumulada que faz o cliente escolher você em empate técnico, especialmente onde erro dói, como dinheiro.\n\nA pergunta de PM não é "temos fosso?", é "qual fosso estamos cavando de propósito?". Fosso não nasce por acidente: cada trimestre do roadmap deveria aprofundar pelo menos um.',
                },
                {
                    type: "table",
                    value: '[["Fosso","Mecanismo","Teste de verdade","Exemplo no app"],["Efeito de rede","Cada usuário melhora o produto para os outros","Valor por usuário cresce com a base?","Benchmarks de renda entre autônomos da mesma área"],["Dados proprietários","Informação acumulada vira produto melhor","O rival compraria esse dado pronto?","Histórico que prevê meses magros por profissão"],["Custo de troca","Sair fica caro em tempo e risco","O que o cliente perde ao migrar?","Anos de histórico fiscal e categorias treinadas"],["Marca","Confiança decide o empate técnico","Escolhem você sem comparar tudo?","Reputação de nunca vazar dado financeiro"]]',
                },
                {
                    type: "quote",
                    value: "Se a sua vantagem cabe num screenshot, ela cabe no sprint do concorrente. Fosso de verdade não aparece em demo.",
                },
                {
                    type: "text",
                    value: '## Cavando fosso de propósito\n\nFossos exigem escolhas de produto deliberadas, e é aqui que estratégia encontra backlog. Quer custo de troca saudável? Invista em histórico útil e integrações profundas, não em cadeado (dificultar exportação de dados gera rancor, não retenção; o custo de troca bom é o valor que o cliente perderia, não a porta trancada). Quer dados proprietários? Desenhe o produto para coletar o dado que melhora a experiência de quem o fornece, senão é vigilância sem contrapartida. Quer rede? Encontre a interação genuína entre usuários; rede forçada em produto solitário vira feature fantasma.\n\nDois avisos de calibragem. Primeiro, fosso leva anos e o pitch leva minutos: desconfie de "nosso diferencial é a IA", porque em 2026 o modelo que você usa o concorrente também aluga; o fosso possível está no dado que só você tem para alimentar o modelo e no fluxo em que ele vive. Segundo, fosso não substitui produto bom: ele protege a casa, não constrói. A sequência madura é provar valor primeiro e aprofundar a defesa enquanto cresce, um trimestre de cada vez.',
                },
            ],
            questions: [
                {
                    statement: "Por que uma feature bem feita não é um fosso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque o rival consegue copiá-la em poucos meses",
                            isCorrect: true,
                        },
                        {
                            text: "Porque features não aparecem em material de venda",
                            isCorrect: false,
                        },
                        {
                            text: "Porque fosso só existe em empresa de infraestrutura",
                            isCorrect: false,
                        },
                        {
                            text: "Porque usuários não percebem valor em features novas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um efeito de rede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada usuário novo melhora o produto para os demais",
                            isCorrect: true,
                        },
                        {
                            text: "O produto funciona offline em qualquer aparelho",
                            isCorrect: false,
                        },
                        {
                            text: "A base de usuários cresce por anúncios pagos mensais",
                            isCorrect: false,
                        },
                        {
                            text: "Os servidores escalam sozinhos conforme a demanda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para reter clientes, o time propõe dificultar a exportação de dados. Qual é o problema dessa jogada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cadeado gera rancor; custo de troca bom é valor perdido",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: retenção justifica qualquer atrito na saída",
                            isCorrect: false,
                        },
                        {
                            text: "O problema é só técnico: exportação é difícil de bloquear",
                            isCorrect: false,
                        },
                        {
                            text: "Deveriam cobrar uma taxa de saída em vez de bloquear",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O pitch diz que o diferencial do produto "é a IA". Por que esse fosso é frágil em 2026?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "O mesmo modelo está de aluguel para qualquer concorrente",
                            isCorrect: true,
                        },
                        {
                            text: "Porque IA ainda não funciona para produtos financeiros",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o custo de IA torna qualquer produto inviável",
                            isCorrect: false,
                        },
                        {
                            text: "Porque usuários evitam produtos que anunciam usar IA",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com um trimestre de folga, o CEO quer mais features visíveis; você defende aprofundar o histórico de dados por profissão. Qual argumento sustenta a sua escolha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dado acumulado vira vantagem que rival não copia em sprint",
                            isCorrect: true,
                        },
                        {
                            text: "Features visíveis atraem imprensa e resolvem a retenção",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico é mais barato de construir que qualquer tela",
                            isCorrect: false,
                        },
                        {
                            text: "A diretoria prefere projetos longos a lançamentos rápidos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Pricing como posicionamento (introdutório)",
            blocks: [
                {
                    type: "text",
                    value: '# O preço fala antes do produto\n\nPreço não é só matemática de custo mais margem: é a frase mais alta do seu posicionamento. Antes de testar o produto, o cliente lê o preço e deduz a categoria: R$ 9,90 por mês diz "utilitário descartável", R$ 89 diz "ferramenta profissional", grátis diz "você não é o cliente, é o produto" para uma parcela crescente do público. Cobrar barato demais não é gentileza, é ruído: o autônomo que confia a vida fiscal a um app estranha pagar o preço de um café, porque coisa séria custa como coisa séria.\n\nO conceito central é valor percebido: o cliente não compara seu preço com seu custo de servidor, compara com o valor que acredita receber e com as referências que tem na cabeça. Se o app evita uma multa de R$ 500 por atraso de imposto, R$ 39 por mês parece barganha; se o cliente acha que o app "só mostra gráficos", R$ 9,90 parece caro. Pricing, portanto, começa no discurso: antes de discutir o número, pergunte que valor o cliente enxerga e que âncoras ele carrega.',
                },
                {
                    type: "table",
                    value: '[["Decisão de preço","O que comunica","Risco embutido"],["Muito abaixo do mercado","Produto simples ou desespero","Atrai quem sai pelo mesmo preço que entrou"],["Na média do mercado","Comparável aos rivais","A decisão vira lista de features"],["Acima do mercado","Especialista premium","Precisa provar o valor extra rápido"],["Grátis com plano pago","Experimente sem medo","Ancorar todo mundo no grátis para sempre"],["Preço por uso","Pague pelo que consome","Conta imprevisível assusta o cliente"]]',
                },
                {
                    type: "quote",
                    value: "O cliente nunca vê o seu custo: vê o valor que percebe e a âncora que carrega. O preço conversa com esses dois, não com a sua planilha.",
                },
                {
                    type: "text",
                    value: "## Ancoragem e as decisões introdutórias\n\nAncoragem é o vício cognitivo que faz o primeiro número visto virar régua para os seguintes. Você usa isso honestamente ao ordenar planos: o plano Profissional de R$ 79 exposto ao lado do Essencial de R$ 39 faz o Essencial parecer razoável, e a comparação certa é com a multa de R$ 500 que o app evita, âncora que o seu marketing deveria plantar. Contra quem você se posicionou também define a âncora: se a alternativa é a planilha grátis, você precisa vender o custo do erro dela; se é o contador de R$ 400 por mês, você é a opção acessível.\n\nEste é um capítulo introdutório, então fique com três regras de bolso. Primeira: preço é hipótese, teste como testa produto, com coortes e disposição a pagar, não com achismo em reunião. Segunda: subir preço de quem já percebe valor é a alavanca de receita mais barata que existe, e quase sempre está subutilizada. Terceira: desconto vicia; o que você dá em promoção permanente vira o preço real na cabeça do cliente, e o caminho de volta é doloroso. Preço é posicionamento em números, trate com o mesmo cuidado.",
                },
            ],
            questions: [
                {
                    statement: "Por que preço é uma decisão de posicionamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O cliente lê o preço e deduz a categoria do produto",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o financeiro participa da reunião de preço",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o preço define o custo dos servidores",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a nota fiscal exige a categoria declarada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é valor percebido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O valor que o cliente acredita receber do produto",
                            isCorrect: true,
                        },
                        {
                            text: "O custo de produção somado à margem da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "A média de preço dos três maiores concorrentes",
                            isCorrect: false,
                        },
                        {
                            text: "O valor contábil registrado no balanço da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O app evita multas de R$ 500, mas o time teme cobrar mais que R$ 9,90. Qual âncora o marketing deveria plantar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O custo da multa que o produto evita todo ano",
                            isCorrect: true,
                        },
                        {
                            text: "O preço dos apps de entretenimento mais populares",
                            isCorrect: false,
                        },
                        {
                            text: "O valor do café diário que o cliente já gasta",
                            isCorrect: false,
                        },
                        {
                            text: "A mensalidade média das academias da região",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o risco de manter desconto permanente para acelerar vendas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O preço com desconto vira a referência real do cliente",
                            isCorrect: true,
                        },
                        {
                            text: "O desconto obriga a empresa a demitir o time de vendas",
                            isCorrect: false,
                        },
                        {
                            text: "Plataformas de pagamento bloqueiam preços rebaixados",
                            isCorrect: false,
                        },
                        {
                            text: "O cliente desconfia e passa a pagar somente à vista",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Receita precisa crescer 20% no semestre. A base atual percebe alto valor e paga um preço antigo e baixo. Qual alavanca testar primeiro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Reajustar o preço de quem já percebe valor, medindo churn",
                            isCorrect: true,
                        },
                        {
                            text: "Dobrar o investimento em aquisição de usuários novos",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar um plano grátis para ampliar o topo do funil",
                            isCorrect: false,
                        },
                        {
                            text: "Cortar o preço para ganhar volume contra os rivais",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - OKRs sem teatro",
    aulas: [
        {
            titulo: "O que OKR resolve",
            blocks: [
                {
                    type: "text",
                    value: '# Foco e alinhamento, nada mais\n\nOKR resolve exatamente dois problemas, e conhecê-los evita noventa por cento do teatro. Primeiro, FOCO: forçar a organização a declarar o pouco que importa neste trimestre, porque um time sem esse filtro trata vinte assuntos com a mesma energia e não move nenhum. Segundo, ALINHAMENTO: tornar público o que cada time persegue, para que marketing, produto e vendas não remem em direções opostas descobrindo isso só na retrospectiva. Qualquer outro uso (avaliar pessoas, controlar tarefas, impressionar o conselho) é contrabando que estraga a ferramenta.\n\nA anatomia é curta. O Objetivo é qualitativo, inspirador e com prazo: a frase que o time repetiria no corredor ("fazer o autônomo confiar no app para decidir o próprio dinheiro"). Os Key Results são a régua do objetivo: dois a quatro resultados MENSURÁVEIS que, se acontecerem, provam que o objetivo aconteceu. A palavra decisiva é resultado: KR mede mudança no mundo (ativação, retenção, receita), não esforço do time (lançar, fazer, entregar). Essa distinção separa OKR de lista de tarefas com nome importado, e é o assunto da próxima aula.',
                },
                {
                    type: "table",
                    value: '[["Peça","Natureza","Pergunta que responde","Exemplo"],["Objetivo","Qualitativo, inspirador, com prazo","O que queremos tornar verdade","Autônomo confia no app para decidir o dinheiro"],["Key Result","Quantitativo, verificável","Como sabemos que aconteceu","Retenção D30 do segmento de 18% para 28%"],["Iniciativa","Trabalho, hipótese de alavanca","O que faremos para tentar","Reserva automática de imposto no onboarding"]]',
                },
                {
                    type: "quote",
                    value: "OKR não faz o trabalho estratégico por você: ele só torna impossível esconder que o trabalho não foi feito.",
                },
                {
                    type: "text",
                    value: "## O que OKR não é\n\nOKR não é lista de tarefas glorificada: as iniciativas (o trabalho em si) ficam FORA do OKR de propósito, porque são hipóteses trocáveis. Se a reserva automática de imposto não mover a retenção, o time troca de iniciativa no meio do caminho sem tocar no KR; o compromisso é com o resultado, não com o plano de ontem. OKR também não é o cascateamento militar em que o objetivo do CEO vira KR do diretor, que vira objetivo do gerente, numa pirâmide que demora seis semanas para fechar e congela a empresa; alinhamento se obtém com contexto compartilhado e negociação entre times, não com planilha genealógica.\n\nE OKR não é sistema de avaliação de desempenho, este é o desvio mais tóxico: no momento em que o bônus depende do KR, todo mundo negocia metas confortáveis, e a ferramenta que existia para dar foco vira instrumento de defesa pessoal. Andy Grove, que criou o modelo na Intel, e John Doerr, que o popularizou, repetem o mesmo aviso: OKR e remuneração dormem em quartos separados. Guarde os dois usos legítimos, foco e alinhamento, e recuse o resto.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os dois problemas que OKR de fato resolve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Foco no que importa e alinhamento público entre times",
                            isCorrect: true,
                        },
                        {
                            text: "Avaliação de desempenho e cálculo justo dos bônus",
                            isCorrect: false,
                        },
                        {
                            text: "Controle de tarefas diárias e apontamento de horas",
                            isCorrect: false,
                        },
                        {
                            text: "Documentação de processos e auditoria de qualidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a natureza correta de um Key Result?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Resultado mensurável que prova o avanço do objetivo",
                            isCorrect: true,
                        },
                        {
                            text: "Tarefa detalhada com responsável e data de entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Frase inspiradora que o time repete nas reuniões",
                            isCorrect: false,
                        },
                        {
                            text: "Documento aprovado pela diretoria a cada semestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que as iniciativas ficam de fora do OKR?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "São hipóteses trocáveis; o compromisso é com o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque iniciativas são responsabilidade só da engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Para o documento do OKR caber em uma única página",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ferramentas de OKR não têm campo para tarefas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A iniciativa principal do trimestre não moveu o KR após seis semanas. O que o modelo manda fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trocar a iniciativa e manter o compromisso com o KR",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o alvo do KR para refletir o novo cenário",
                            isCorrect: false,
                        },
                        {
                            text: "Insistir na iniciativa até o fim do trimestre fechar",
                            isCorrect: false,
                        },
                        {
                            text: "Cancelar o OKR e retomar o planejamento no ano seguinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O RH propõe atrelar o bônus anual ao atingimento dos KRs. Qual é a consequência previsível?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Times negociam metas confortáveis e o foco vira defesa",
                            isCorrect: true,
                        },
                        {
                            text: "Os KRs ficam mais ambiciosos pela motivação financeira",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma: bônus e OKR sempre andaram bem juntos",
                            isCorrect: false,
                        },
                        {
                            text: "O RH passa a escrever KRs melhores que os times",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Escrever KRs de verdade",
            blocks: [
                {
                    type: "text",
                    value: '# De entregar para mudar\n\n"Lançar a feature X" é o KR mais comum do mundo corporativo e é exatamente o que um KR não deve ser. Lançar é output: mede que o time trabalhou, não que o mundo mudou. O usuário não acorda melhor porque você lançou; acorda melhor quando ativa, volta, paga, recomenda. A régua do outcome é uma pergunta curta: se entregarmos tudo e esse número não se mover, fracassamos? Se a resposta é sim, o número é o KR e a entrega é só iniciativa.\n\nA conversão tem método. Pegue a entrega ("lançar o onboarding novo") e pergunte PARA QUÊ até chegar num número de comportamento: para o usuário conectar o banco logo, para ativar mais, portanto "ativação de 22% para 30%". Todo KR de outcome carrega três pedaços: a métrica (ativação, definida como quem cria a primeira meta financeira na semana um), a baseline (22% hoje, e sem baseline não existe meta, existe chute) e o alvo com prazo (30% ao fim do trimestre). Faltou um dos três, devolva o rascunho.',
                },
                {
                    type: "code",
                    value: 'OBJETIVO (trimestre)\nFazer o autonomo confiar no app para decidir o proprio dinheiro.\n\nKR1  Retencao D30 do segmento autonomo: de 18% para 28%\nKR2  Ativacao (primeira meta financeira criada na semana 1):\n     de 22% para 30%\nKR3  Usuarios com banco conectado: de 35% para 55%\n\nINICIATIVAS (hipoteses, fora do OKR, trocaveis no caminho)\n- Reserva automatica de imposto no onboarding\n- Separacao gasto pessoal x gasto de trabalho\n- Alerta semanal de caixa no WhatsApp\n\nNAO SAO KRs (e por que)\n- "Lancar onboarding 2.0"     entrega, nao resultado\n- "Fazer 12 entrevistas"      atividade; util, mas nao mede mudanca\n- "Melhorar a experiencia"    sem numero, sem baseline, sem prazo',
                },
                {
                    type: "table",
                    value: '[["KR de entrega (ruim)","Pergunta para quê","KR de outcome (bom)"],["Lançar o onboarding 2.0","Para o novato ativar mais","Ativação de 22% para 30% no trimestre"],["Integrar com 3 bancos","Para conectar sem fricção","Usuários com banco conectado de 35% para 55%"],["Publicar 10 conteúdos","Para atrair autônomos certos","Cadastros do segmento de 800 para 1.400 por mês"],["Migrar o app para a nuvem","Para parar de cair no pico","Disponibilidade de 97,1% para 99,9%"]]',
                },
                {
                    type: "quote",
                    value: "Se o time pode bater o KR sem nenhum usuário ficar melhor, o KR está medindo o esforço de vocês, não o resultado deles.",
                },
                {
                    type: "text",
                    value: '## Calibragem de ambição e as exceções honestas\n\nQuantos KRs? Dois a quatro por objetivo; acima disso é lista de desejos com métrica. Quão ambicioso? A escola do stretch mira o desconfortável: bater 70% de um alvo agressivo move mais o mundo do que bater 100% de um alvo covarde. O essencial é combinar a régua ANTES: se 70% é sucesso, todo mundo sabe desde o primeiro dia, senão o fim do trimestre vira tribunal de interpretação.\n\nExistem exceções honestas ao outcome puro, e fingir que não existem gera KR de ficção. Compromissos binários com obrigação externa (adequação regulatória, migração com data contratual) podem entrar como KR de entrega declarado como tal, de preferência poucos e marcados como "compromisso" em vez de "aposta". O que não tem perdão é o KR de atividade disfarçado ("realizar 12 entrevistas") ocupando o lugar de um resultado: entrevista é meio; o KR honesto seria o que as entrevistas deveriam causar. Regra final de qualidade: alguém de fora do time, lendo só os KRs, deveria conseguir dizer o que melhorou na vida do usuário ou do negócio. Se só dá para dizer o que o time andou fazendo, reescreva.',
                },
            ],
            questions: [
                {
                    statement: 'Por que "lançar a feature X" não serve como KR?',
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mede o esforço do time, não a mudança no mundo",
                            isCorrect: true,
                        },
                        {
                            text: "Porque features devem ser segredo até o lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Porque KRs só podem falar de receita e de custo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque lançamentos pertencem ao time de marketing",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais três pedaços todo KR de outcome precisa ter?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Métrica definida, baseline e alvo com prazo",
                            isCorrect: true,
                        },
                        {
                            text: "Responsável, orçamento e data de lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramenta, dashboard e reunião semanal fixa",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovação, patrocinador e apresentação final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O time propôs o KR "realizar 12 entrevistas com usuários". Como corrigir?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perguntar o que as entrevistas devem causar e medir isso",
                            isCorrect: true,
                        },
                        {
                            text: "Subir o número para 24 entrevistas e manter o formato",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar, porque pesquisa com usuário sempre é outcome",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar entrevistas por um questionário mais barato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma migração com data em contrato precisa entrar no OKR do trimestre. Qual é o jeito honesto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Entrar como compromisso de entrega declarado como tal",
                            isCorrect: true,
                        },
                        {
                            text: "Disfarçar a migração como métrica de satisfação",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar fora do OKR e torcer para ninguém perguntar",
                            isCorrect: false,
                        },
                        {
                            text: "Transformar a data do contrato em objetivo inspirador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Fim do trimestre: KR agressivo parou em 70% e a diretoria fala em fracasso. O que faltou combinar antes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A régua: com alvo stretch, 70% já era o sucesso esperado",
                            isCorrect: true,
                        },
                        {
                            text: "Um alvo menor, para o time nunca ficar abaixo de 100%",
                            isCorrect: false,
                        },
                        {
                            text: "Mais iniciativas paralelas para garantir o número cheio",
                            isCorrect: false,
                        },
                        {
                            text: "Um KR reserva para substituir o principal no relatório",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cadência e check-ins",
            blocks: [
                {
                    type: "text",
                    value: '# O trimestre e o ritmo semanal\n\nOKR sem cadência vira decoração de kickoff: escreve-se em janeiro, redescobre-se em março, lamenta-se em abril. O ciclo padrão é trimestral (curto o bastante para corrigir, longo o bastante para mover outcome), e dentro dele vive o ritual que sustenta tudo: o check-in curto, semanal ou quinzenal, de quinze a trinta minutos. A pauta cabe em quatro perguntas: onde está o número, qual a nossa confiança de bater o alvo, o que aprendemos, o que muda na semana que vem.\n\nA palavra operacional é CONFIANÇA. Além do valor atual do KR, o time declara uma nota simples (verde, amarelo, vermelho, ou 0 a 10) para "vamos chegar lá?". Esse termômetro é o que transforma o check-in em ferramenta de decisão: um KR em 40% do alvo na metade do trimestre com confiança alta (a alavanca já foi lançada, o efeito é retardado) é saudável; um KR em 60% com confiança despencando pede conversa séria agora, não no post-mortem. Sem a nota de confiança, o check-in vira leitura burocrática de dashboard que ninguém precisava ouvir em voz alta.',
                },
                {
                    type: "table",
                    value: '[["Ritual","Frequência","Pergunta central","Saída esperada"],["Check-in do time","Semanal ou quinzenal","Número, confiança e o que muda","Ajuste de iniciativa ou pedido de ajuda"],["Revisão de meio de ciclo","Uma vez por trimestre","Algum KR virou causa perdida ou teto batido?","Realocar energia com registro do motivo"],["Fechamento e nota","Fim do trimestre","O que o número diz e o que aprendemos","Notas finais e lições para o próximo ciclo"],["Planejamento do ciclo","Antes do trimestre","O que importa agora segundo a estratégia","Novo conjunto de OKRs enxuto"]]',
                },
                {
                    type: "quote",
                    value: "Check-in bom termina com uma decisão diferente da que se tomaria sem ele. Se nada muda nunca, vocês estão lendo um dashboard em coro.",
                },
                {
                    type: "text",
                    value: '## Correção de rota sem apagar a história\n\nO meio do trimestre traz a pergunta delicada: pode mudar OKR no caminho? A resposta madura é "raramente, e sempre com registro". Se uma premissa caiu de verdade (o mercado virou, um dado novo derrubou a hipótese), insistir no KR morto é teatro ao contrário; ajusta-se o alvo ou troca-se o KR, escrevendo data e motivo para o aprendizado não evaporar. O que não pode é o ajuste silencioso de fim de ciclo, aquele em que o alvo encolhe para a apresentação ficar verde: isso destrói a única moeda que o sistema tem, a honestidade do número.\n\nE repita para quem precisar ouvir: check-in de OKR não é avaliação de desempenho nem prestação de contas individual. No momento em que o vermelho vira bronca, os times aprendem a esconder o vermelho, e você perde o sinal exatamente quando ele mais importa. O vermelho honesto e cedo é o melhor presente que um time pode dar ao PM: é ele que compra tempo para agir. Proteja quem o traz; desconfie do quadro que está sempre verde.',
                },
            ],
            questions: [
                {
                    statement: "Qual é a pauta essencial de um check-in de OKR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Número atual, confiança no alvo e o que muda agora",
                            isCorrect: true,
                        },
                        {
                            text: "Leitura completa do backlog e das tarefas da semana",
                            isCorrect: false,
                        },
                        {
                            text: "Apresentação de slides sobre as entregas concluídas",
                            isCorrect: false,
                        },
                        {
                            text: "Avaliação individual de desempenho de cada pessoa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o ciclo padrão de OKR é trimestral?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Curto para corrigir rota e longo para mover outcome",
                            isCorrect: true,
                        },
                        {
                            text: "Porque coincide com o calendário fiscal das empresas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque foi o prazo definido em contrato pela Intel",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ferramentas de OKR só aceitam esse período",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "KR em 40% do alvo na metade do ciclo, confiança alta e alavanca já lançada. Como ler esse quadro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Saudável: efeito retardado com termômetro apontando bem",
                            isCorrect: true,
                        },
                        {
                            text: "Crítico: menos de 50% na metade sempre exige intervenção",
                            isCorrect: false,
                        },
                        {
                            text: "Inválido: KR abaixo do ritmo linear deve ser cancelado",
                            isCorrect: false,
                        },
                        {
                            text: "Irrelevante: confiança declarada não serve para decidir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No fim do ciclo, um gerente encolheu o alvo do KR para a apresentação ficar verde. Qual é o dano real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Destrói a honestidade do número, que sustenta o sistema",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: ajustar alvo no fechamento é prática comum",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas estético: o histórico corrige tudo sozinho depois",
                            isCorrect: false,
                        },
                        {
                            text: "Só contábil: o financeiro terá de refazer o relatório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Times escondem KRs vermelhos até o fim do trimestre. Qual mudança de postura da liderança ataca a causa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Tratar o vermelho cedo como sinal valioso, sem punição",
                            isCorrect: true,
                        },
                        {
                            text: "Exigir relatórios diários detalhados de cada métrica",
                            isCorrect: false,
                        },
                        {
                            text: "Premiar com bônus os times que mantêm o quadro verde",
                            isCorrect: false,
                        },
                        {
                            text: "Transferir a leitura dos números para uma auditoria",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Anti-padrões",
            blocks: [
                {
                    type: "text",
                    value: '# O bestiário do OKR de teatro\n\nDepois de duas décadas de moda, os fracassos de OKR são tão padronizados que dá para catalogar. O OKR SANDUÍCHE: a cascata rígida em que o KR do CEO vira objetivo do diretor, que gera KRs que viram objetivos dos gerentes, camada sobre camada; o fechamento leva seis semanas, a empresa congela e o time da ponta executa um número que não entende. Alinhamento não é genealogia: é contexto compartilhado e negociação horizontal entre times que enxergam a mesma estratégia.\n\nA LISTA DE QUINZE KRs: se tudo é chave, nada é; quinze KRs são o velho relatório de área com formatação nova, e o sinal clássico é ninguém do time saber recitar os próprios KRs de cabeça. O KR BINÁRIO DE ENTREGA: "migrar o sistema, sim ou não" passa o trimestre inteiro em 0% e pula para 100% na última semana, sem dar leitura de progresso nem de risco; quando a entrega for inevitável como compromisso, quebre em marcos verificáveis ou declare-a fora da régua de outcome. Cada um desses vícios tem o mesmo DNA: manter a aparência do sistema descartando a parte difícil, que é escolher pouco e medir de verdade.',
                },
                {
                    type: "table",
                    value: '[["Anti-padrão","Sintoma visível","Correção"],["OKR sanduíche","Seis semanas para fechar a cascata anual","Contexto compartilhado e negociação entre times"],["Quinze KRs por time","Ninguém recita os KRs de cabeça","Cortar para 2 a 4 por objetivo, doa a quem doer"],["KR binário de entrega","0% o trimestre todo, 100% na última semana","Marcos verificáveis ou declarar como compromisso"],["Meta batida, outcome pior","Número verde com usuário e negócio piores","KR de guarda: par de métricas que se vigiam"],["OKR como avaliação","Metas negociadas para baixo na largada","Separar OKR de remuneração explicitamente"]]',
                },
                {
                    type: "quote",
                    value: "Quando a meta vira o alvo da esperteza em vez do resultado, o número bate e o negócio piora: você mediu a criatividade do time contra a régua.",
                },
                {
                    type: "text",
                    value: '## A meta batida que piorou tudo\n\nO anti-padrão mais perigoso é o mais silencioso: a meta batida com outcome piorado, o efeito cobra em versão corporativa. O KR de "reduzir tempo médio de resposta do suporte" bate com respostas automáticas inúteis que fecham chamados sem resolver; o de "aumentar cadastros" bate com um botão enganoso que infla o topo e afunda a ativação; o de "elevar itens por pedido" bate porque o time escondeu o frete no preço e o churn explode dois meses depois. Em todos, o número obedeceu e a realidade desobedeceu.\n\nA defesa tem nome: métrica de guarda. Para cada KR de empurrão, declare o par que não pode piorar: tempo de resposta COM satisfação do atendido; cadastros COM ativação em sete dias; itens por pedido COM recompra. O check-in lê os dois juntos, e bater o principal estourando a guarda conta como fracasso, combinado assim desde o primeiro dia. É a versão operacional de uma verdade que este módulo repete: o objetivo do sistema nunca é o número, é a realidade que o número deveria representar. Quando os dois divergem, audite a régua antes de comemorar.',
                },
            ],
            questions: [
                {
                    statement: "O que é o anti-padrão do OKR sanduíche?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cascata rígida em que cada camada deriva da de cima",
                            isCorrect: true,
                        },
                        {
                            text: "Colocar dois objetivos diferentes no mesmo trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Misturar KRs de produto com KRs de marketing",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir o mesmo OKR por dois ciclos seguidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o sintoma clássico de um time com quinze KRs?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ninguém consegue recitar os próprios KRs de cabeça",
                            isCorrect: true,
                        },
                        {
                            text: "O dashboard fica lento com métricas em excesso",
                            isCorrect: false,
                        },
                        {
                            text: "As reuniões de check-in acabam antes do previsto",
                            isCorrect: false,
                        },
                        {
                            text: "O financeiro reclama do custo das ferramentas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O KR "migrar o sistema" ficou 0% por onze semanas e saltou para 100% na última. Que problema isso revela?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "KR binário não dá leitura de progresso nem de risco",
                            isCorrect: true,
                        },
                        {
                            text: "O time trabalhou pouco nas onze primeiras semanas",
                            isCorrect: false,
                        },
                        {
                            text: "A migração deveria ter sido feita fora do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou uma ferramenta melhor de acompanhamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O KR de cadastros bateu, mas a ativação em 7 dias desabou. Qual defesa faltou no desenho do OKR?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Métrica de guarda vigiando o par que não pode piorar",
                            isCorrect: true,
                        },
                        {
                            text: "Um alvo de cadastros mais agressivo desde o começo",
                            isCorrect: false,
                        },
                        {
                            text: "Mais iniciativas de aquisição rodando em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "Um dashboard em tempo real para o time comercial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O suporte bateu a meta de tempo de resposta fechando chamados sem resolver. Além da guarda de satisfação, o que a liderança deve corrigir?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A régua combinada: estourar a guarda conta como fracasso",
                            isCorrect: true,
                        },
                        {
                            text: "O time: substituir os atendentes que usaram o atalho",
                            isCorrect: false,
                        },
                        {
                            text: "A meta: apertar ainda mais o tempo para compensar",
                            isCorrect: false,
                        },
                        {
                            text: "O canal: migrar todo o suporte para respostas por bot",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "OKR conectado à estratégia",
            blocks: [
                {
                    type: "text",
                    value: '# Do diagnóstico ao objetivo\n\nOKR sem estratégia por trás é um gerador de números aleatórios com cerimônia. A cadeia saudável você já conhece dos módulos anteriores: o diagnóstico nomeia o desafio central, a política orientadora escolhe a abordagem, e o OKR do trimestre é simplesmente o pedaço dessa aposta que dá para medir agora. No app de finanças: diagnóstico (o produto não devolve valor recorrente; autônomos são a exceção que retém), política (concentrar no ciclo semanal do autônomo), e daí o objetivo do trimestre sai quase sozinho: "fazer o autônomo confiar no app para decidir o próprio dinheiro", com KRs de retenção e ativação do segmento.\n\nO teste de conexão é direto e impiedoso: para cada KR, pergunte "qual parte da estratégia este número serve?". KR que não responde é enfeite herdado de benchmark, por mais mensurável que seja. E a volta também vale: se uma aposta central da estratégia não aparece em nenhum KR de nenhum time, ela não está sendo executada, está sendo lembrada com carinho. OKR é onde a estratégia encosta no trimestre; sem essa costura, sobra um ritual que mede movimento e chama de progresso.',
                },
                {
                    type: "table",
                    value: '[["Contexto do time","OKR ajuda?","Alternativa mais honesta"],["Aposta estratégica clara a medir","Sim, é o caso de uso ideal","Nenhuma: use OKR com 2 a 4 KRs"],["Time de 5 pessoas e um produto","Raramente compensa o rito","Uma métrica norte e conversa semanal"],["Operação contínua (suporte, SRE)","Não para o dia a dia","SLAs e metas de serviço acompanhadas"],["Roadmap contratual sem folga","Vira teatro de outcome","Gestão de marcos e prazos, sem disfarce"],["Crise aguda no trimestre","Cerimônia atrapalha","Plano de guerra com check-in diário"]]',
                },
                {
                    type: "quote",
                    value: "OKR é a estratégia encostando no trimestre. Se o número não serve a nenhuma aposta, ele é um enfeite que custa reunião.",
                },
                {
                    type: "text",
                    value: '## Quando não usar OKR\n\nMaturidade com OKR inclui saber onde ele não paga o próprio custo. Time pequeno com um produto e contexto compartilhado no almoço não precisa da liturgia completa: uma métrica norte bem escolhida e conversa franca semanal entregam o mesmo foco por um décimo do atrito. Operação essencialmente contínua (suporte, confiabilidade, faturamento) vive melhor com SLAs e metas de serviço; forçar "outcome inspirador" trimestral em quem mantém o motor girando gera KR inventado para preencher formulário. Contexto de compromisso duro (contratos com data, regulatório) pede gestão de marcos honesta, não entrega fantasiada de resultado.\n\nA pergunta de adoção é econômica: o custo do ritual (planejar, medir, check-ins, fechar) é menor que o valor do foco e do alinhamento que ele compra? Em empresas com times múltiplos remando em direções opostas, sim, com folga. Numa equipe de cinco que se fala todo dia, quase nunca. Adotar OKR porque "empresa séria tem OKR" é o mesmo vício de forma sobre substância que este módulo passou cinco aulas desmontando. A ferramenta serve à estratégia; quando não serve, coragem: descarte a ferramenta, nunca a estratégia.',
                },
            ],
            questions: [
                {
                    statement: "Qual é a cadeia correta entre estratégia e OKR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Diagnóstico, política orientadora e então o OKR medível",
                            isCorrect: true,
                        },
                        {
                            text: "OKR primeiro, estratégia depois, diagnóstico no fim",
                            isCorrect: false,
                        },
                        {
                            text: "Benchmark do mercado, metas do CEO e depois o OKR",
                            isCorrect: false,
                        },
                        {
                            text: "Backlog priorizado, roadmap de datas e então o OKR",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o teste de conexão de um KR com a estratégia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Perguntar qual parte da estratégia o número serve",
                            isCorrect: true,
                        },
                        {
                            text: "Conferir se o número aparece no relatório mensal",
                            isCorrect: false,
                        },
                        {
                            text: "Verificar se o KR usa a mesma métrica do concorrente",
                            isCorrect: false,
                        },
                        {
                            text: "Checar se a diretoria aprovou o número em reunião",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time de cinco pessoas que almoça junto todo dia quer adotar a liturgia completa de OKR. O que recomendar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Métrica norte e conversa semanal: mesmo foco, menos rito",
                            isCorrect: true,
                        },
                        {
                            text: "Adotar tudo: OKR funciona igual em qualquer tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar o time dobrar de tamanho antes de ter metas",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar consultoria para implantar o modelo formal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma aposta central da estratégia não aparece em nenhum KR de nenhum time. O que isso significa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A aposta não está sendo executada, só lembrada",
                            isCorrect: true,
                        },
                        {
                            text: "A aposta é tão importante que dispensa medição",
                            isCorrect: false,
                        },
                        {
                            text: "Os times decidiram que a aposta já foi concluída",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema de OKR está com excesso de métricas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time de SRE foi obrigado a inventar um objetivo inspirador trimestral e os KRs viraram ficção. Qual é o desenho mais honesto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "SLAs e metas de serviço no lugar da liturgia de OKR",
                            isCorrect: true,
                        },
                        {
                            text: "Manter o OKR e treinar o time para escrever melhor",
                            isCorrect: false,
                        },
                        {
                            text: "Mover o time de SRE para dentro do time de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o objetivo a cada mês até um deles inspirar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Roadmap de produto",
    aulas: [
        {
            titulo: "O problema do roadmap de datas",
            blocks: [
                {
                    type: "text",
                    value: '# A promessa que vira contrato\n\nO roadmap clássico é um Gantt de features com datas: onboarding novo em março, integração bancária em maio, versão PJ em setembro. Ele nasce como estimativa de boa fé e envelhece como contrato: vendas promete a data ao cliente, o executivo repete no conselho, e seis meses depois o time está entregando uma feature que a evidência já desmentiu, só porque ela estava no slide. O documento que deveria comunicar direção passa a proibir aprendizado.\n\nO defeito é estrutural, não moral: o roadmap de datas esconde a incerteza em vez de comunicá-la. Uma data única ("maio") finge o mesmo grau de certeza para o que o time começa amanhã e para o que depende de três descobertas ainda não feitas. E produto não é obra civil: a estimativa de algo nunca construído, que depende de validação com usuário, carrega variância enorme que o formato simplesmente não tem onde registrar. O resultado conhecido: times inflando prazos para se proteger, executivos cortando prazos para pressionar, e a data final virando ficção negociada entre os dois medos.',
                },
                {
                    type: "table",
                    value: '[["O que o roadmap de datas promete","O que acontece na prática"],["Certeza sobre doze meses de entregas","Tudo além de um trimestre é chute solene"],["Compromisso que tranquiliza vendas","Data repetida a cliente vira contrato informal"],["Plano estável para o ano inteiro","Evidência nova torna o plano obsoleto em semanas"],["Produtividade visível para o conselho","Entrega de feature sem pergunta sobre resultado"],["Direção clara para o time","Time executa o slide em vez de resolver o problema"]]',
                },
                {
                    type: "quote",
                    value: "O roadmap de datas não erra por ter datas: erra por fingir que tudo tem a mesma certeza, do sprint de amanhã à aposta de dezembro.",
                },
                {
                    type: "text",
                    value: '## Por que times empoderados sofrem mais\n\nMarty Cagan descreve a contradição com precisão: a empresa diz ao time "vocês são donos do problema, descubram a melhor solução" e entrega junto um roadmap com as soluções já listadas e datadas. As duas mensagens se anulam. Time empoderado existe para trocar de solução quando a evidência manda; roadmap de features com data pune exatamente essa troca, porque qualquer desvio do slide vira "atraso" na conversa executiva, mesmo quando é a decisão certa.\n\nO sofrimento aparece nos dois lados. O time descobre no meio do caminho que a feature prometida não resolve o problema, e enfrenta a escolha perversa entre entregar o combinado sabendo que é inútil ou pagar o custo político de "furar o roadmap". O executivo, por sua vez, perdeu o que mais queria: previsibilidade de RESULTADO; ganhou previsibilidade de entrega, que não paga as contas. A saída não é abolir compromissos nem esconder o plano: é um formato que separe o que é compromisso firme do que é aposta em investigação, e que prometa outcomes onde datas não se sustentam. É o assunto da próxima aula.',
                },
            ],
            questions: [
                {
                    statement: "Qual é o defeito estrutural do roadmap de datas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele esconde a incerteza em vez de comunicá-la",
                            isCorrect: true,
                        },
                        {
                            text: "Ele usa um formato visual difícil de apresentar",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige ferramentas caras de gestão de projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é longo demais para caber numa reunião",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a estimativa de boa fé do roadmap vira contrato?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vendas e executivos repetem a data até virar promessa",
                            isCorrect: true,
                        },
                        {
                            text: "O jurídico registra o roadmap em cartório todo ano",
                            isCorrect: false,
                        },
                        {
                            text: "O time assina termo de compromisso com cada data",
                            isCorrect: false,
                        },
                        {
                            text: "O conselho transforma o slide em cláusula contratual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Times inflam prazos e executivos cortam prazos. O que esse ciclo revela sobre o formato?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A data única virou ficção negociada entre dois medos",
                            isCorrect: true,
                        },
                        {
                            text: "Os times precisam de treinamento em estimativas",
                            isCorrect: false,
                        },
                        {
                            text: "Os executivos entendem pouco de desenvolvimento",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa precisa de uma ferramenta de cronograma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Segundo Cagan, por que roadmap de features datadas anula o time empoderado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele pune a troca de solução que a evidência recomenda",
                            isCorrect: true,
                        },
                        {
                            text: "Ele impede o time de participar das cerimônias ágeis",
                            isCorrect: false,
                        },
                        {
                            text: "Ele obriga o time a estimar em pontos, não em horas",
                            isCorrect: false,
                        },
                        {
                            text: "Ele concentra as decisões técnicas no time de design",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No meio do trimestre, a evidência mostra que a feature prometida no roadmap não resolve o problema. Qual é a decisão madura?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Levar a evidência e renegociar o plano com transparência",
                            isCorrect: true,
                        },
                        {
                            text: "Entregar o combinado para preservar a credibilidade",
                            isCorrect: false,
                        },
                        {
                            text: "Entregar uma versão mínima só para constar no slide",
                            isCorrect: false,
                        },
                        {
                            text: "Silenciar o achado até o ciclo seguinte de planejamento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Now-Next-Later",
            blocks: [
                {
                    type: "text",
                    value: '# Horizontes de incerteza\n\nNow-Next-Later organiza o roadmap por grau de certeza, não por trimestre do calendário. NOW é o que está em execução ou entra já: problemas validados, escopo razoavelmente claro, compromisso alto; é onde vive o detalhe. NEXT é a direção provável na sequência: problemas escolhidos, soluções ainda em descoberta; compromisso médio, detalhe médio. LATER é o campo das apostas: temas que dependem de validações que ainda não aconteceram; compromisso baixo de propósito, descrição curta de propósito. A régua de leitura é honesta por construção: quanto mais longe, menos detalhe, porque detalhe sobre o distante é ficção com aparência de planejamento.\n\nA segunda mudança do formato é tão importante quanto: as colunas carregam TEMAS E PROBLEMAS, não features. "Reduzir o abandono do onboarding" em vez de "tela nova de conexão bancária". O tema preserva a liberdade do time de trocar de solução sem "furar o roadmap", e obriga cada item a nascer com justificativa (por que este problema) e medida (como saberemos). Feature é hipótese de solução; o roadmap comunica intenção.',
                },
                {
                    type: "code",
                    value: "ROADMAP DO PRODUTO (por horizonte de incerteza)\n\nNOW (em execucao, compromisso alto)\n- Tema: reduzir o abandono do onboarding\n  Por que: 78% dos novos usuarios nao conectam o banco\n  Medida: ativacao de 22% para 30%\n\nNEXT (proximo na fila, direcao provavel)\n- Tema: valor recorrente semanal para autonomos\n  Por que: retencao D30 de 18% e o teto do crescimento\n  Em descoberta: reserva de imposto ou previsao de caixa\n\nLATER (aposta, sujeita a validacao)\n- Tema: relacionamento com o contador do autonomo\n  Condicao: depende do resultado da descoberta do NEXT\n- Tema: credito com base no fluxo de caixa\n  Condicao: exige base maior e conversa regulatoria",
                },
                {
                    type: "table",
                    value: '[["Coluna","Horizonte típico","Nível de detalhe","O que comunica"],["Now","Semanas até um trimestre","Alto: escopo e medida claros","Compromisso: contem conosco"],["Next","Um a dois trimestres","Médio: problema definido","Direção: é o provável seguinte"],["Later","Além de dois trimestres","Baixo: tema e condição","Aposta: depende de validação"]]',
                },
                {
                    type: "quote",
                    value: "Detalhe sobre o que está longe não é planejamento, é ficção bem formatada. O Now-Next-Later devolve ao detalhe o lugar onde ele é honesto.",
                },
                {
                    type: "text",
                    value: "## Como os itens se movem\n\nO fluxo saudável é uma esteira puxada por evidência: um tema entra no LATER como aposta escrita em uma linha; quando a estratégia o elege como próximo, sobe ao NEXT e ganha investimento de descoberta (entrevistas, protótipos, análise de dados); quando a descoberta valida problema e abordagem, entra no NOW com escopo e medida de sucesso. A promoção é um ritual de evidência, não de ansiedade: o que promove um item é aprendizado registrado, não a impaciência de um stakeholder barulhento.\n\nE a esteira anda para trás sem vergonha: item do NEXT cuja descoberta desmentiu a premissa volta ao LATER ou morre, com o motivo registrado. Isso não é fracasso do roadmap, é o roadmap funcionando: cada rebaixamento documentado é um trimestre de construção inútil que não aconteceu. Duas disciplinas mantêm o formato vivo: revisão em cadência fixa (mensal funciona bem) e a regra de que toda mudança carrega o porquê. Sem isso, o Now-Next-Later degenera no vício antigo com nomes novos: três listas de features, empurradas por opinião.",
                },
            ],
            questions: [
                {
                    statement: "O que organiza as colunas do Now-Next-Later?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O grau de certeza e compromisso de cada horizonte",
                            isCorrect: true,
                        },
                        {
                            text: "O trimestre fiscal em que cada item será entregue",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho da equipe alocada em cada iniciativa",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem alfabética dos temas dentro do backlog",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que as colunas carregam temas e problemas em vez de features?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para o time trocar de solução sem furar o roadmap",
                            isCorrect: true,
                        },
                        {
                            text: "Porque features são segredo industrial da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Para o documento ficar mais curto na apresentação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque executivos não entendem nomes de features",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que legitimamente promove um item de Next para Now?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descoberta validando o problema e a abordagem",
                            isCorrect: true,
                        },
                        {
                            text: "A pressão de um stakeholder com assento no conselho",
                            isCorrect: false,
                        },
                        {
                            text: "O fim do trimestre e a necessidade de renovar o slide",
                            isCorrect: false,
                        },
                        {
                            text: "A folga momentânea de engenheiros entre projetos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A descoberta desmentiu a premissa de um item do Next. O que o fluxo saudável manda fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Rebaixar ou matar o item registrando o motivo",
                            isCorrect: true,
                        },
                        {
                            text: "Mantê-lo no Next até uma evidência mais definitiva",
                            isCorrect: false,
                        },
                        {
                            text: "Promovê-lo ao Now para testar em produção real",
                            isCorrect: false,
                        },
                        {
                            text: "Transferir o item para o roadmap de outro time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Seis meses depois da adoção, o Now-Next-Later virou três listas de features empurradas por opinião. Que disciplina faltou?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Revisão em cadência com evidência e porquê registrado",
                            isCorrect: true,
                        },
                        {
                            text: "Uma ferramenta visual mais moderna para as colunas",
                            isCorrect: false,
                        },
                        {
                            text: "Mais colunas para representar horizontes distantes",
                            isCorrect: false,
                        },
                        {
                            text: "Um comitê executivo aprovando cada movimentação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Comunicar incerteza sem parecer evasivo",
            blocks: [
                {
                    type: "text",
                    value: '# Dizer o que se sabe, e o quanto\n\n"Quando fica pronto?" é a pergunta mais frequente da vida de PM, e as duas respostas reflexas são ruins: a data cravada que você não sustenta e o "depende" que soa como fuga. A resposta profissional tem outra forma: dizer o que se sabe, com que confiança, e quando haverá mais informação. "Estamos em descoberta; em três semanas teremos o teste com usuários e eu volto com uma janela de entrega" é específico, verificável e não promete o que não existe.\n\nA ferramenta central são níveis de compromisso EXPLÍCITOS, com vocabulário combinado com a empresa: COMPROMISSO (data firme, honrada como contrato, usada com moderação), JANELA (período provável, "no segundo trimestre", revisada em cadência conhecida) e APOSTA (direção declarada sem data, com o marco de quando saberemos mais). O que destrói a confiança não é a incerteza, é a incerteza descoberta depois: o stakeholder que ouviu "maio" como promessa e descobre em abril que era palpite. Vocabulário explícito transforma a conversa de adivinhação em contrato de comunicação.',
                },
                {
                    type: "table",
                    value: '[["Nível","O que significa","Quando usar","Exemplo de fala"],["Compromisso","Data firme, tratada como contrato","Obrigação real: contrato, regulatório, evento","Entra em produção até 30 de setembro"],["Janela","Período provável, revisado em cadência","Escopo claro com variância normal","Segundo trimestre, confirmo a cada mês"],["Aposta","Direção sem data, com marco de aprendizado","Descoberta em andamento","Depois do teste de três semanas eu dou janela"],["Fora do plano","Não está na direção atual","Pedidos fora da estratégia","Não está nos próximos dois ciclos, e o porquê é este"]]',
                },
                {
                    type: "quote",
                    value: "Ninguém perde a confiança do stakeholder por dizer que não sabe ainda. Perde por ter deixado que ele descobrisse sozinho.",
                },
                {
                    type: "text",
                    value: '## Datas onde há obrigação real\n\nCravar data é caro: a partir da promessa, o time gerencia para a data (corta escopo em silêncio, adia refatoração, esconde risco) e a organização inteira paga o custo da margem de segurança embutida. Por isso a regra: data firme só onde existe obrigação real do outro lado, e cada uma delas nomeada. Contrato com cliente, exigência regulatória, evento de mercado com dia marcado, dependência de terceiro com janela fechada: nesses casos, compromisso, plano de risco e comunicação de perto. No resto, janela ou aposta, ancoradas em quando haverá informação nova.\n\nDois hábitos completam a prática. Primeiro, a cadência de revisão anunciada: "janelas são revisadas na primeira segunda do mês" tira o drama de cada atualização, porque revisão vira rotina em vez de confissão. Segundo, o registro de mudança: quando uma janela move, comunica-se o que mudou e por quê, antes que perguntem. Evasivo é quem some quando o plano muda; confiável é quem aparece primeiro com a nova leitura. A diferença entre os dois não é sorte na execução: é protocolo de comunicação decidido antes.',
                },
            ],
            questions: [
                {
                    statement: "Quais são os três níveis explícitos de compromisso propostos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Compromisso firme, janela provável e aposta sem data",
                            isCorrect: true,
                        },
                        {
                            text: "Urgente, importante e desejável, na ordem da fila",
                            isCorrect: false,
                        },
                        {
                            text: "Curto, médio e longo prazo, medidos em sprints",
                            isCorrect: false,
                        },
                        {
                            text: "Alfa, beta e disponibilidade geral do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando uma data firme se justifica no roadmap?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando existe obrigação real, como contrato ou regulação",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre que o executivo pedir precisão na reunião",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o time estiver confiante depois da estimativa",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o concorrente anunciar uma data parecida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'O diretor pergunta "quando fica pronto?" de um tema ainda em descoberta. Qual é a resposta profissional?',
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dizer o que se sabe e quando haverá informação nova",
                            isCorrect: true,
                        },
                        {
                            text: "Cravar a data mais distante que pareça defensável",
                            isCorrect: false,
                        },
                        {
                            text: "Responder que em produto digital não existem prazos",
                            isCorrect: false,
                        },
                        {
                            text: "Prometer a data que o diretor demonstrou esperar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que anunciar uma cadência fixa de revisão das janelas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revisão vira rotina esperada em vez de confissão de erro",
                            isCorrect: true,
                        },
                        {
                            text: "Para reduzir o número de reuniões do time no trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ferramentas de roadmap exigem data de revisão",
                            isCorrect: false,
                        },
                        {
                            text: "Para impedir que stakeholders façam novas perguntas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Vendas quer prometer a um cliente grande uma data que para o time ainda é aposta em descoberta. Como você destrava a venda sem mentir?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dar o marco de aprendizado e a data da nova leitura",
                            isCorrect: true,
                        },
                        {
                            text: "Autorizar a promessa e repassar a pressão para o time",
                            isCorrect: false,
                        },
                        {
                            text: "Cravar a data com uma margem dobrada de segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir que vendas evite o assunto até o produto sair",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Roadmap por audiência",
            blocks: [
                {
                    type: "text",
                    value: "# O mesmo plano, três recortes\n\nRoadmap não é um documento, é uma conversa com três públicos diferentes, e servir o recorte errado gera dano em todas as direções. O EXECUTIVO quer saber se a estratégia está virando resultado: temas por horizonte, a métrica que cada um move, riscos e pedidos de decisão; mostrar dez cards de detalhes técnicos convida ao microgerenciamento e afoga a discussão que importa. O TIME precisa do porquê e da fronteira: os problemas, as medidas de sucesso, o que está fora e a razão; é o recorte mais rico em contexto, porque é dele que saem mil decisões diárias. O CLIENTE (e vendas, que fala com ele) precisa de direção confiável sem promessa que vire processo: temas de valor na linguagem do cliente, janelas apenas onde há compromisso real, nada de data decorativa.\n\nA regra inegociável: são TRÊS RECORTES DO MESMO PLANO, nunca três planos. A fonte é única; o que muda é zoom e vocabulário. No dia em que o roadmap do cliente promete o que o roadmap do time desconhece, você não tem três visões, tem duas mentiras e um processo esperando para acontecer.",
                },
                {
                    type: "table",
                    value: '[["Audiência","Pergunta que traz","O que mostrar","O que cortar"],["Executivo","A estratégia está virando resultado?","Temas, métricas, riscos e decisões pedidas","Detalhe técnico e microescopo"],["Time","Por que isso e o que é sucesso?","Problemas, medidas, fronteiras e contexto","Teatro de datas sem obrigação"],["Cliente e vendas","Posso confiar na direção de vocês?","Temas de valor, janelas só com compromisso","Aposta interna e data decorativa"]]',
                },
                {
                    type: "quote",
                    value: "Três recortes do mesmo plano constroem confiança. Três planos diferentes constroem a reunião em que os três se encontram.",
                },
                {
                    type: "text",
                    value: '## Adaptar sem bifurcar\n\nO fluxo prático: mantenha o roadmap canônico (Now-Next-Later com temas, medidas e níveis de compromisso) como fonte única, e gere os recortes a partir dele. Para o executivo, agregue: um slide com os temas por horizonte, a métrica de cada um e os três riscos que pedem decisão. Para o cliente, traduza: "previsão de meses magros" vira "saiba com antecedência quando o mês vai apertar", e some apenas as janelas com compromisso real. Para o time, expanda: cada tema com sua evidência, sua medida e seus limites de escopo.\n\nDois cuidados de veterano. Primeiro, assuma que todo roadmap vaza: o slide "interno" de vendas chega ao cliente, o print circula; escreva cada recorte como se o público mais sensível fosse lê-lo, porque vai. Segundo, feche o ciclo: quando um tema do recorte executivo muda de horizonte, a mudança precisa aparecer nos três recortes na mesma semana, com o mesmo porquê. Recortes que divergem com o tempo são o sintoma clássico de fonte duplicada, e a cura é sempre a mesma: uma fonte, três zooms, uma cadência de sincronização.',
                },
            ],
            questions: [
                {
                    statement: "O que o recorte executivo do roadmap deve destacar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Temas, métricas movidas, riscos e decisões pedidas",
                            isCorrect: true,
                        },
                        {
                            text: "Os cards detalhados do backlog com estimativas",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de bugs corrigidos no último trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "O organograma do time com as senioridades",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a regra inegociável dos recortes por audiência?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma fonte única de plano, com três zooms diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "Um plano separado e independente para cada público",
                            isCorrect: false,
                        },
                        {
                            text: "O mesmo slide idêntico apresentado aos três públicos",
                            isCorrect: false,
                        },
                        {
                            text: "Roadmap secreto para o time e público para o resto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mostrar detalhe técnico demais ao executivo é um erro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Convida ao microgerenciamento e afoga a decisão real",
                            isCorrect: true,
                        },
                        {
                            text: "Executivos não têm formação para entender tecnologia",
                            isCorrect: false,
                        },
                        {
                            text: "Detalhes técnicos são confidenciais da engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Slides técnicos demoram mais para serem desenhados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que escrever o recorte de vendas como se o cliente fosse lê-lo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque roadmap vaza; o print chega onde não devia",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o cliente participa das reuniões de vendas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a lei obriga a publicar planos de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque vendas se recusa a manter documento interno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O roadmap que vendas apresenta a clientes promete uma integração que o time nem está investigando. Qual é a correção de raiz?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Restaurar a fonte única e sincronizar os recortes",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir ao time que encaixe a integração no trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Proibir vendas de mostrar qualquer roadmap a clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Criar um comitê para aprovar cada slide de vendas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Manter o roadmap vivo",
            blocks: [
                {
                    type: "text",
                    value: '# Revisão com evidência, não com humor\n\nRoadmap que não muda está morto; roadmap que muda ao sabor da última reunião nunca esteve vivo. O que separa os dois é o combustível da mudança: EVIDÊNCIA. A revisão em cadência (mensal para o plano tático, trimestral para os horizontes) processa o que chegou de novo desde a última: resultado de descoberta, métrica que reagiu ou não reagiu ao lançamento, movimento relevante de mercado, restrição nova de negócio. Cada item da pauta responde três perguntas: o que aprendemos, o que isso muda no plano, o que registramos.\n\nOs movimentos legítimos são conhecidos: sobe o item cuja descoberta validou premissa ou cuja urgência real cresceu (um custo de atraso que apareceu, uma janela regulatória); desce ou morre o item cuja premissa caiu, cuja métrica de referência já foi resolvida por outro caminho ou que perdeu para uma aposta melhor. O que NÃO move item: opinião nova sem dado novo, ansiedade de fim de trimestre, cliente barulhento sem representatividade, demo bonita de concorrente. A pergunta de triagem na porta da reunião: "que evidência nova sustenta essa mudança?". Sem resposta, sem mudança.',
                },
                {
                    type: "table",
                    value: '[["Gatilho","Evidência nova?","Movimento legítimo"],["Descoberta validou a premissa do tema","Sim","Item sobe de Next para Now"],["Métrica não reagiu ao lançamento","Sim","Repriorizar o tema e registrar a lição"],["Janela regulatória com data apareceu","Sim","Vira compromisso com plano de risco"],["Cliente barulhento pediu de novo","Não, sem dado de representatividade","Nenhum: registrar o pedido e medir o alcance"],["Concorrente fez demo impressionante","Ainda não","Investigar o problema por trás, sem mover nada"]]',
                },
                {
                    type: "quote",
                    value: "O roadmap de seis meses atrás com os porquês registrados vale mais que qualquer retrospectiva: é a memória de como vocês decidem.",
                },
                {
                    type: "text",
                    value: '## O registro do porquê\n\nA disciplina mais barata e mais negligenciada da gestão de roadmap é o registro de decisão: uma linha por mudança, com data, o movimento e o motivo. "12/03: previsão de meses magros sobe para Now; teste com 40 usuários mostrou 62% de uso semanal. Integração com contador desce; entrevistas indicaram que a dor é do fim do ano." Custa dois minutos e compra três coisas caras: memória institucional (em 2026 a rotatividade dos times continua alta, e sem registro cada PM novo reabre as mesmas discussões), proteção contra revisionismo ("por que vocês abandonaram X?" tem resposta com data) e aprendizado sobre o próprio processo, porque relendo os porquês você descobre se as suas promoções de item têm acertado.\n\nO fechamento do módulo cabe numa imagem: o roadmap é um organismo com metabolismo, não um monumento. Entra evidência, sai decisão, fica registro. Quando alguém pedir "o roadmap do ano que vem", você já sabe responder com os três horizontes, os níveis de compromisso e a cadência de revisão que mantém tudo isso honesto. É menos glamoroso que o Gantt de doze meses, e é a diferença entre planejar e fingir.',
                },
            ],
            questions: [
                {
                    statement: "O que legitimamente move um item do roadmap na revisão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Evidência nova, como descoberta ou métrica que reagiu",
                            isCorrect: true,
                        },
                        {
                            text: "A opinião mais recente do stakeholder mais sênior",
                            isCorrect: false,
                        },
                        {
                            text: "O desejo do time de trabalhar em algo diferente",
                            isCorrect: false,
                        },
                        {
                            text: "A chegada do fim do trimestre e do novo slide",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que deve conter o registro de uma mudança de roadmap?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Data, o movimento feito e o motivo com a evidência",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de presentes na reunião e a ata completa",
                            isCorrect: false,
                        },
                        {
                            text: "O custo estimado da mudança para o financeiro",
                            isCorrect: false,
                        },
                        {
                            text: "A assinatura de todos os diretores da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um cliente barulhento pediu a mesma feature pela terceira vez. Qual é a resposta correta do processo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Registrar o pedido e medir a representatividade da dor",
                            isCorrect: true,
                        },
                        {
                            text: "Subir a feature para Now pela insistência do pedido",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar o pedido, porque cliente não define roadmap",
                            isCorrect: false,
                        },
                        {
                            text: "Transferir a decisão para o time comercial resolver",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o registro do porquê protege o PM meses depois?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dá resposta com data e dado a questionamentos tardios",
                            isCorrect: true,
                        },
                        {
                            text: "Serve de prova formal em processos trabalhistas",
                            isCorrect: false,
                        },
                        {
                            text: "Substitui as reuniões de revisão dali em diante",
                            isCorrect: false,
                        },
                        {
                            text: "Garante bônus ao time quando a decisão der certo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A métrica não reagiu ao lançamento do tema principal do Now. O que a revisão madura faz com essa informação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Repriorizar com a lição registrada, sem dobrar a aposta",
                            isCorrect: true,
                        },
                        {
                            text: "Manter o tema e aumentar o time até a métrica reagir",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a métrica por outra que mostre algum progresso",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar o roadmap atual e recomeçar o plano do zero",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Priorização",
    aulas: [
        {
            titulo: "Por que frameworks existem",
            blocks: [
                {
                    type: "text",
                    value: '# O fim do grito como método\n\nAntes de qualquer framework, a priorização de produto tinha um método universal: ganhava quem gritava mais alto ou quem ocupava o cargo mais alto. O nome corporativo disso é HiPPO, a opinião da pessoa mais bem paga da sala, e o defeito dele não é a opinião em si, porque executivos costumam ter contexto valioso. O defeito é que a decisão não deixa rastro: ninguém sabe qual critério venceu, então ninguém consegue discordar com argumento nem aprender com o erro seis meses depois.\n\nFramework de priorização é, antes de tudo, um contrato de conversa. Ele obriga todo mundo a colocar as premissas na mesa em unidades comparáveis: quantas pessoas isso alcança, qual o tamanho do efeito esperado, o quanto acreditamos nisso e quanto custa construir. A discussão sai de "eu acho importante" e vai para "sua estimativa de alcance é dez vezes a minha, vamos olhar o dado antes". Essa mudança de terreno, e não a nota final da planilha, é o que paga o custo do exercício. Um framework bom não produz a resposta certa; produz a discordância certa, cedo, em público e com nome de variável.',
                },
                {
                    type: "table",
                    value: '[["O que o framework faz","O que ele não faz"],["Torna premissas explícitas e comparáveis","Descobrir se a premissa é verdadeira"],["Ordena itens dentro de um conjunto dado","Escolher qual conjunto merece o trimestre"],["Deixa rastro para revisar a decisão depois","Assumir a responsabilidade pela escolha"],["Reduz o peso do cargo na discussão","Eliminar o julgamento de quem decide"]]',
                },
                {
                    type: "quote",
                    value: "Framework não decide nada por você: ele só obriga a discordância a aparecer cedo, em números, e não tarde, na retrospectiva.",
                },
                {
                    type: "text",
                    value: '## O limite que a planilha não cruza\n\nTrês limites precisam ficar claros antes da primeira conta. O primeiro é o mais velho da computação: entra lixo, sai lixo. Score calculado sobre alcance chutado e impacto imaginado não é objetivo, é subjetivo com casas decimais; a nota herda toda a fragilidade das entradas e ainda ganha uma aparência de rigor que dificulta o questionamento.\n\nO segundo limite é o do conjunto. Qualquer framework ordena o que está na lista, e a lista foi montada por alguém. Se as vinte iniciativas do backlog nasceram de pedidos avulsos, o ranking perfeito delas continua sendo o ranking perfeito das ideias erradas. Quem escolhe o conjunto é a estratégia, e essa escolha acontece antes da planilha abrir.\n\nO terceiro é o da responsabilidade. Score não assina decisão; PM assina. Usar a nota como escudo ("o modelo mandou") transfere para uma fórmula uma escolha que continua sendo sua, e a organização percebe rápido quando isso vira hábito. O uso maduro é o inverso: rode o framework, olhe a ordem que saiu, e pergunte se ela contradiz o seu julgamento. Quando contradisser, investigue qual dos dois está errado, porque um deles está. Essa conversa entre a conta e o critério é o trabalho de verdade.',
                },
            ],
            questions: [
                {
                    statement: "O que um framework de priorização entrega de mais valioso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Premissas explícitas e comparáveis entre iniciativas",
                            isCorrect: true,
                        },
                        {
                            text: "A resposta final sobre o que a empresa deve construir",
                            isCorrect: false,
                        },
                        {
                            text: "A garantia de que a estimativa de alcance está certa",
                            isCorrect: false,
                        },
                        {
                            text: "A substituição do julgamento de quem decide o plano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa priorizar pelo HiPPO?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Decidir pela opinião de quem tem o cargo mais alto",
                            isCorrect: true,
                        },
                        {
                            text: "Decidir pelo item com maior custo de implementação",
                            isCorrect: false,
                        },
                        {
                            text: "Decidir pela ordem de chegada dos pedidos na fila",
                            isCorrect: false,
                        },
                        {
                            text: "Decidir pelo resultado da votação aberta do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas pessoas discordam sobre o alcance de uma iniciativa. Para que serve o framework nesse momento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Expor a diferença de premissa e mandar buscar o dado",
                            isCorrect: true,
                        },
                        {
                            text: "Fechar a discussão com a média das duas estimativas",
                            isCorrect: false,
                        },
                        {
                            text: "Dar a vitória a quem tem mais tempo de casa no time",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar o item até que as duas pessoas cheguem a acordo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O backlog inteiro foi ranqueado por score, mas metade dos itens não serve à política orientadora. O que o score não fez?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Escolher o conjunto que merecia entrar na planilha",
                            isCorrect: true,
                        },
                        {
                            text: "Calcular corretamente a nota de cada item da lista",
                            isCorrect: false,
                        },
                        {
                            text: "Considerar o esforço de engenharia de cada entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar quem sugeriu cada item do backlog atual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time entregou os cinco itens de maior score e nenhum indicador de negócio se moveu. Qual é a leitura mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "As entradas do modelo eram chutes sem dado por trás",
                            isCorrect: true,
                        },
                        {
                            text: "O framework escolhido era inadequado para o produto",
                            isCorrect: false,
                        },
                        {
                            text: "O time executou os itens com qualidade insuficiente",
                            isCorrect: false,
                        },
                        {
                            text: "Os indicadores demoram mais de um ano para reagir",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RICE na prática",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro variáveis e uma divisão\n\nRICE existe para comparar iniciativas de tamanhos diferentes numa unidade só. Reach é quantas pessoas o item alcança numa janela declarada (por trimestre, por mês, escolha uma e mantenha). Impact é o tamanho do efeito por pessoa alcançada, numa escala fixa: 3 para massivo, 2 para alto, 1 para médio, 0,5 para baixo e 0,25 para mínimo. Confidence é o desconto de honestidade sobre as suas próprias estimativas: 100% quando existe dado forte, 80% quando existe dado parcial, 50% quando é intuição informada. Effort é o custo em pessoa mês, estimado por quem vai construir.\n\nA conta é uma divisão: alcance vezes impacto vezes confiança, tudo dividido pelo esforço. O número que sai não tem significado absoluto, e insistir nisso evita metade das brigas: 3.200 não quer dizer nada sozinho, só quer dizer mais que 1.500. O RICE serve para ORDENAR, não para medir. Trate o resultado como ordem de grandeza, não como precisão: itens separados por dez por cento de diferença estão empatados, e o desempate volta a ser o julgamento estratégico.",
                },
                {
                    type: "code",
                    value: "RICE = (Reach x Impact x Confidence) / Effort\n\nImpact: 3 massivo | 2 alto | 1 medio | 0,5 baixo | 0,25 minimo\nReach:  usuarios alcancados por trimestre\nEffort: pessoa-mes, estimado por quem constroi\n\nA. Importar a planilha do usuario\n   R 12000 | I 1 | C 100% | E 3   (12000 x 1 x 1,0) / 3 = 4000\n\nB. Reserva automatica de imposto\n   R 8000  | I 2 | C 80%  | E 4   (8000 x 2 x 0,8) / 4  = 3200\n\nC. Previsao de meses magros\n   R 5000  | I 3 | C 50%  | E 5   (5000 x 3 x 0,5) / 5  = 1500\n\nD. Relatorio para o contador\n   R 2000  | I 2 | C 80%  | E 8   (2000 x 2 x 0,8) / 8  = 400\n\nOrdem final: A 4000 > B 3200 > C 1500 > D 400",
                },
                {
                    type: "table",
                    value: '[["Mudança em uma estimativa","Novo score","A ordem muda?"],["C sobe de 50% para 80% de confiança","1500 vira 2400","Não: C continua atrás de B"],["B cai de 4 para 2 pessoa mês de esforço","3200 vira 6400","Sim: B passa a liderar a fila"],["A cai de impacto 1 para impacto 0,5","4000 vira 2000","Sim: A perde a liderança para B"],["D sobe de 2000 para 6000 de alcance","400 vira 1200","Não: D segue em último lugar"]]',
                },
                {
                    type: "quote",
                    value: "Se dobrar o esforço estimado inverte a sua fila inteira, o problema nunca foi a fórmula: era a estimativa que ninguém checou.",
                },
                {
                    type: "text",
                    value: "## Onde o RICE mente\n\nA tabela acima é o exercício mais útil do módulo: mexa em uma variável de cada vez e veja se a ordem aguenta. Quando um item lidera por causa de um número que ninguém verificou, a fila é frágil, e o remédio é barato, meio dia de análise para transformar um chute em estimativa apoiada.\n\nQuatro cuidados práticos evitam o RICE de fachada. Primeiro, defina alcance com janela e critério antes de estimar, senão cada pessoa conta um universo diferente e a comparação morre na origem. Segundo, esforço é estimado por quem constrói, e antes de a nota aparecer, porque estimativa feita depois do score tende a confirmar a conclusão desejada. Terceiro, confiança é onde a honestidade se paga: baixar de 100% para 50% divide o score pela metade, e é exatamente esse desconto que impede a ideia querida de furar a fila com nada além de entusiasmo. Quarto, evite comparar itens de escalas absurdamente diferentes na mesma planilha, porque um projeto de doze pessoa mês contra um ajuste de dois dias distorce a leitura; separe por porte e compare dentro de cada grupo. E lembre da regra do módulo: o RICE ordena a lista que a estratégia já filtrou.",
                },
            ],
            questions: [
                {
                    statement: "Como se calcula o score RICE?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Alcance vezes impacto vezes confiança, sobre esforço",
                            isCorrect: true,
                        },
                        {
                            text: "Alcance mais impacto mais confiança, sobre esforço",
                            isCorrect: false,
                        },
                        {
                            text: "Alcance vezes esforço, dividido pela confiança total",
                            isCorrect: false,
                        },
                        {
                            text: "Impacto vezes esforço, dividido pelo alcance mensal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma iniciativa tem alcance 8000, impacto 2, confiança 80% e esforço 4. Qual é o score RICE?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "3200: o produto 12800 dividido pelo esforço 4",
                            isCorrect: true,
                        },
                        {
                            text: "12800: o produto das três primeiras variáveis",
                            isCorrect: false,
                        },
                        {
                            text: "1600: metade do produto, por causa da confiança",
                            isCorrect: false,
                        },
                        {
                            text: "6400: o produto dividido pela metade do esforço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Baixar o esforço de B de 4 para 2 pessoa mês dobra o score dela e a coloca na frente de A. O que esse teste revela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A ordem depende de estimativas não verificadas",
                            isCorrect: true,
                        },
                        {
                            text: "Que o esforço é a variável mais importante do RICE",
                            isCorrect: false,
                        },
                        {
                            text: "Que a fórmula do RICE tem um erro de construção",
                            isCorrect: false,
                        },
                        {
                            text: "Que iniciativas curtas sempre vencem as demais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem deve estimar o esforço no RICE, e quando?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem vai construir, antes de a nota ser calculada",
                            isCorrect: true,
                        },
                        {
                            text: "O PM, para manter o critério igual entre os itens",
                            isCorrect: false,
                        },
                        {
                            text: "O executivo que patrocina a iniciativa no comitê",
                            isCorrect: false,
                        },
                        {
                            text: "O financeiro, que conhece o custo hora do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A importação de planilha lidera com 4000 e a previsão de meses magros fica em terceiro com 1500, mas só a segunda ataca o diagnóstico. Como decidir?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A estratégia filtra antes e o RICE ordena o resto",
                            isCorrect: true,
                        },
                        {
                            text: "Seguir a planilha: o score existe para tirar o viés",
                            isCorrect: false,
                        },
                        {
                            text: "Somar peso estratégico ao score até a ordem inverter",
                            isCorrect: false,
                        },
                        {
                            text: "Empatar as duas e entregar as duas no mesmo ciclo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Custo de atraso",
            blocks: [
                {
                    type: "text",
                    value: '# O que cada mês de espera custa\n\nOs frameworks de score respondem "o que vale mais?". Custo de atraso responde outra pergunta, que quase ninguém faz: "o que perdemos por mês enquanto isso não existe?". A diferença parece sutil e reordena filas inteiras, porque coloca o tempo dentro da conta em vez de deixá-lo do lado de fora.\n\nEm versão didática, custo de atraso é o valor que você deixa de capturar a cada mês de espera: receita não realizada, churn que continua acontecendo, multa que segue sendo paga, suporte que segue sendo acionado. Não precisa ser exato para ser útil; precisa ser comparável. Se o resumo semanal de caixa evita a saída de cem assinantes por mês, e cada um vale R$ 39, o custo de atraso ronda R$ 3.900 por mês só em receita direta, antes de contar a aquisição que você paga para repor cada um deles. Escrever esse número muda o tom da reunião: adiar deixa de ser neutro e passa a ter preço declarado. A pergunta que fecha o raciocínio é sempre a mesma: quanto custa esperar mais um mês?',
                },
                {
                    type: "code",
                    value: "CUSTO DE ATRASO (CD) E CD3, VERSAO DIDATICA\n\nCD  = valor perdido por mes de espera\nCD3 = CD dividido pela duracao do trabalho, em meses\n\nA. Resumo semanal de caixa\n   CD 40 mil/mes | duracao 2 meses    40 / 2 = 20\n\nB. Correcao do calculo de imposto\n   CD 30 mil/mes | duracao 1 mes      30 / 1 = 30\n\nC. Previsao de meses magros\n   CD 60 mil/mes | duracao 6 meses    60 / 6 = 10\n\nPor CD puro:  C (60) > A (40) > B (30)\nPor CD3:      B (30) > A (20) > C (10)\n\nFazer B primeiro custa 1 mes e libera A e C um mes antes.\nComecar por C prende a fila por meio ano.",
                },
                {
                    type: "table",
                    value: '[["Perfil do custo de atraso","Como ele se comporta","Exemplo no app de finanças"],["Constante","Perde o mesmo valor todo mês de espera","Resumo semanal que segura churn mensal"],["Com pico e queda","Salta na data marcada e some depois","Regra fiscal que entra em vigor em julho"],["Crescente","Cada mês de espera custa mais que o anterior","Rival ocupando o segmento antes de você"],["Quase nulo","Esperar custa pouco ou nada","Ajuste estético em tela pouco visitada"]]',
                },
                {
                    type: "quote",
                    value: "Sem custo de atraso na mesa, adiar parece de graça. Com ele escrito, adiar vira uma decisão com preço, e decisões com preço são discutidas melhor.",
                },
                {
                    type: "text",
                    value: '## Urgência real e urgência de voz\n\nCD3 é a versão didática que ordena por custo de atraso dividido pela duração, e ela existe para punir o item que segura a fila. O exemplo do quadro acima é o caso clássico: a previsão de meses magros tem o maior custo de atraso do trio, R$ 60 mil por mês, e ainda assim vai para o fim, porque seis meses de execução bloqueiam duas entregas curtas que também estão sangrando dinheiro. Filas curtas primeiro não é preguiça, é aritmética.\n\nO segundo uso da ferramenta é separar urgência real de urgência de voz. Urgência real muda o custo de atraso: uma data regulatória cria um pico, uma janela sazonal cria uma queda, um rival avançando cria uma curva crescente. Urgência de voz é volume: o pedido repetido em tom firme, o e mail com "prioridade máxima" no assunto, a insistência de quem tem sala com porta. A pergunta de triagem cabe em uma linha e desarma quase tudo: o que muda, em número, se isso sair daqui a três meses em vez de agora? Quando a resposta é "nada que a gente consiga medir", você acabou de descobrir que aquilo nunca foi urgente, só era barulhento.',
                },
            ],
            questions: [
                {
                    statement: "O que o custo de atraso mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O valor que se deixa de capturar a cada mês de espera",
                            isCorrect: true,
                        },
                        {
                            text: "O custo de engenharia acumulado durante a espera",
                            isCorrect: false,
                        },
                        {
                            text: "A multa contratual prevista para entregas atrasadas",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo médio entre o pedido e a entrega da feature",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se calcula o CD3 na versão didática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Custo de atraso dividido pela duração do trabalho",
                            isCorrect: true,
                        },
                        {
                            text: "Custo de atraso multiplicado pelo esforço estimado",
                            isCorrect: false,
                        },
                        {
                            text: "Custo de atraso somado ao custo de oportunidade",
                            isCorrect: false,
                        },
                        {
                            text: "Custo de atraso dividido pelo número de pessoas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A previsão de meses magros tem o maior custo de atraso do trio, R$ 60 mil por mês, e mesmo assim o CD3 a coloca em último. Por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque ela segura a fila por muito mais tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o custo dela cai com o passar dos meses",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o custo de atraso dela foi superestimado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque itens longos têm impacto menor no negócio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como separar urgência real de urgência de voz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perguntar o que muda de fato se entregarmos depois",
                            isCorrect: true,
                        },
                        {
                            text: "Contar quantas vezes o pedido chegou ao suporte",
                            isCorrect: false,
                        },
                        {
                            text: "Verificar o cargo de quem trouxe o pedido urgente",
                            isCorrect: false,
                        },
                        {
                            text: "Checar se o concorrente lançou algo parecido antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma mudança de regra fiscal entra em vigor em julho e o time só conseguiria entregar em agosto. Como o custo de atraso muda a leitura?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vira compromisso: o custo salta na data e não volta",
                            isCorrect: true,
                        },
                        {
                            text: "Nada muda: a regra é externa e não cabe ao produto",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz a prioridade: o custo se dilui ao longo do ano",
                            isCorrect: false,
                        },
                        {
                            text: "Vira aposta: sem certeza, não se assume data firme",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ICE, MoSCoW e Kano na caixa de ferramentas",
            blocks: [
                {
                    type: "text",
                    value: "# Cada ferramenta presta um serviço\n\nQuem sai por aí procurando o melhor framework de priorização está fazendo a pergunta errada. Eles não competem entre si: cada um responde a uma pergunta diferente, e usar o errado é como abrir uma lata com chave de fenda, funciona mal e estraga a lata.\n\nICE é o irmão rápido do RICE: impacto, confiança e facilidade, três notas de 1 a 10 multiplicadas. Serve para triagem de muitas ideias cruas, quando você precisa cortar sessenta sugestões para dez em uma tarde. Perde para o RICE em qualquer decisão que envolva dinheiro sério, porque não separa alcance de efeito e a facilidade vira sensação.\n\nMoSCoW não ordena nada: classifica escopo em quatro caixas, obrigatório, importante, desejável e fora desta entrega. Serve quando prazo ou orçamento estão fixos e a pergunta é o que cabe dentro. Kano também não ordena fila: classifica o tipo de satisfação que cada item gera, e é a única das três que fala do usuário em vez de falar da empresa. Escolha pela pergunta que você tem, não pela ferramenta que está na moda.",
                },
                {
                    type: "table",
                    value: '[["Ferramenta","Pergunta que ela responde","Onde ela falha"],["RICE","Qual iniciativa rende mais por esforço","Quando não há base para estimar alcance"],["ICE","Quais ideias merecem análise séria","Quando vira nota de gosto com decimais"],["MoSCoW","O que entra na caixa de prazo fixo","Quando tudo é classificado como must"],["Kano","Que tipo de satisfação o item gera","Quando é usado para ordenar a fila"],["Custo de atraso","Quanto custa esperar mais um mês","Quando o valor por mês é pura invenção"]]',
                },
                {
                    type: "quote",
                    value: "Nenhum framework é o melhor; existe o adequado à pergunta que você tem na mão. Quem usa sempre o mesmo acaba fazendo sempre a mesma pergunta.",
                },
                {
                    type: "text",
                    value: "## Kano em três categorias\n\nKano separa o que o usuário sente em famílias que se comportam de formas opostas. BÁSICO é o que ninguém elogia e cuja ausência destrói tudo: no app de finanças, o saldo estar certo. Investir mais em básico depois de atingir o aceitável não gera satisfação extra, só custa; mas falhar nele apaga qualquer encantamento construído em outro lugar.\n\nDESEMPENHO é a família linear: quanto mais, melhor, e o usuário percebe cada degrau. Velocidade de sincronização com o banco, quantidade de instituições suportadas, precisão da categorização automática. É onde a comparação com concorrentes acontece de forma explícita e onde investimento contínuo se converte em satisfação contínua.\n\nENCANTAMENTO é o inesperado que gera afeto: o alerta que avisa que a semana vai ser apertada antes de o usuário perceber. Encanta enquanto é novidade e, com o tempo, vira desempenho e depois vira básico, o que explica por que produtos parados envelhecem mesmo sem piorar. A regra de bolso para priorizar com Kano: garanta o básico, invista em desempenho onde você escolheu competir, e reserve pouco para encantamento, porque encantar não compensa um básico quebrado.",
                },
                {
                    type: "text",
                    value: "## O teatro da objetividade\n\nO risco compartilhado por todos esses métodos tem nome: teatro de objetividade. Alguém defende a ideia preferida, atribui as notas que produzem o resultado desejado, apresenta o score e encerra a discussão com um número. Ninguém contesta, porque contestar parece contestar a matemática. Em 2026, com ferramentas que geram score automaticamente a partir de tickets e transcrições de conversas, produzir esse número ficou instantâneo, e a plateia passou a confundir velocidade com evidência.\n\nA defesa é simples e desconfortável: sempre discuta as ENTRADAS, nunca a saída. Pergunte de onde veio o alcance, quem estimou o esforço, o que sustenta a confiança de 80%. Um chute com três casas decimais continua sendo um chute, só que mais difícil de questionar. Duas práticas ajudam: peça que a pessoa que propõe e a pessoa que constrói estimem separadamente e comparem, e registre as entradas junto com a nota, para que a revisão futura consiga auditar a decisão. Framework é ferramenta de conversa e nunca autoridade. No dia em que a planilha começar a ganhar discussões sozinha, ela deixou de servir ao time e passou a servir a quem preenche as células.",
                },
            ],
            questions: [
                {
                    statement: "O que as três notas do ICE representam?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Impacto, confiança e facilidade de execução",
                            isCorrect: true,
                        },
                        {
                            text: "Investimento, custo e eficiência do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Importância, criticidade e escopo da entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Impacto, custo e envolvimento das áreas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No modelo Kano, o que caracteriza um item básico?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O que ninguém elogia, mas cuja falta destrói tudo",
                            isCorrect: true,
                        },
                        {
                            text: "O que encanta o usuário na primeira semana de uso",
                            isCorrect: false,
                        },
                        {
                            text: "O que a concorrência ainda não conseguiu entregar",
                            isCorrect: false,
                        },
                        {
                            text: "O que gera mais receita por usuário cadastrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na reunião de escopo, 90% dos itens foram classificados como must have. O que aconteceu com o MoSCoW?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perdeu a função: sem corte, não há priorização",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: must have é a classificação mais comum",
                            isCorrect: false,
                        },
                        {
                            text: "Foi aplicado ao tipo errado de projeto do time",
                            isCorrect: false,
                        },
                        {
                            text: "Faltou incluir a categoria de itens desejáveis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em qual situação o ICE é a ferramenta adequada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na triagem rápida de muitas ideias ainda cruas",
                            isCorrect: true,
                        },
                        {
                            text: "Na decisão final sobre o roadmap do ano inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Na negociação de escopo com prazo contratado",
                            isCorrect: false,
                        },
                        {
                            text: "Na definição do preço de cada plano do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O comitê aprovou uma iniciativa por causa do score 8,7, número montado com três chutes do próprio proponente. Como você intervém?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Discutir as entradas: chute com decimal segue chute",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar o score, porque o método foi seguido à risca",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o ICE pelo RICE e recalcular a nota final",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir que outro time refaça o cálculo em paralelo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O critério acima dos frameworks",
            blocks: [
                {
                    type: "text",
                    value: '# A planilha entra depois da escolha\n\nA sequência correta é curta e quase sempre invertida na prática: diagnóstico, política orientadora, conjunto de candidatos coerentes com a política e só então o framework para ordenar dentro desse conjunto. Quando o time abre a planilha antes de fechar a aposta, ele calcula com precisão a ordem de itens que não deveriam estar competindo entre si.\n\nO caso mais comum é o item de score alto e estratégia zero. Um relatório para contadores pode ter alcance decente, esforço baixo e um número bonito; se a política orientadora do trimestre é o ciclo semanal de caixa do autônomo, esse item não perde no ranking, ele nem entra na lista. Recusar pelo score é fraco, porque score muda com uma estimativa nova; recusar pelo critério é firme, porque o critério é a aposta que a empresa assumiu por escrito.\n\nA inversão também protege você. Discussão de prioridade sem estratégia definida vira disputa de opinião com aparência técnica, e nessa arena ganha quem tem mais poder. Com a política na mesa, a conversa muda de "eu acho" para "isso serve à aposta?", e essa é uma pergunta que qualquer pessoa da sala consegue responder.',
                },
                {
                    type: "code",
                    value: "REGISTRO DE DECISAO DE PRIORIZACAO\n\nData: 12/03\nCiclo: segundo trimestre\nPolitica orientadora: ciclo semanal de caixa do autonomo\n\nENTRA NO NOW\n- Tema: motivo semanal para voltar\n  Criterio: ataca o desafio central e tem custo de atraso\n  constante de ~40 mil por mes\n\nRECUSADOS NESTE CICLO\n- Versao PJ             fora da politica orientadora\n- Relatorio p/ contador RICE 400, alcance restrito\n- Tema de investimentos sem evidencia de dor recorrente\n\nALTERNATIVA OFERECIDA\n- Exportacao em CSV cobre a maior parte do caso do contador\n\nQuando revisitamos: revisao mensal de 05/04\nQuem decidiu: PM do time, com a diretora de produto ciente",
                },
                {
                    type: "table",
                    value: '[["Peça do não","O que dizer","Erro comum"],["Reconhecer o problema","Entendi a dor e ela é real","Fingir que o pedido não faz sentido"],["Mostrar o critério","Priorizamos pelo desafio central do ciclo","Esconder o critério atrás de falta de tempo"],["Dar a alternativa","O CSV cobre a maior parte do caso hoje","Deixar a pessoa sem nenhuma saída"],["Marcar a revisita","Volta à mesa na revisão de abril","Prometer um algum dia sem data"]]',
                },
                {
                    type: "quote",
                    value: "Não sem critério é arrogância, e não sem alternativa é abandono. O não que funciona carrega os dois, mais a data em que a conversa volta.",
                },
                {
                    type: "text",
                    value: "## O não que preserva a relação\n\nDizer não é a habilidade mais cara de aprender e a mais barata de usar depois de aprendida. A estrutura tem quatro peças e cabe em um minuto de conversa: reconheça o problema (quase sempre a dor por trás do pedido é real, mesmo quando a solução pedida é ruim), mostre o critério que está sendo aplicado (não o cansaço do time, não a falta de gente, o critério), ofereça a alternativa que existe hoje, mesmo parcial, e marque quando o assunto volta à mesa. O que transforma um não em conflito raramente é a recusa: é a sensação de que a decisão foi arbitrária e de que a porta ficou fechada para sempre.\n\nFecha o módulo a mesma disciplina que atravessa a trilha inteira, o registro. Uma linha por decisão com data, critério, o que entrou, o que ficou de fora e quando revisita. Custa dois minutos e paga três dívidas: evita rediscutir o mesmo pedido a cada trimestre, dá resposta com evidência quando alguém questiona meses depois e, sobretudo, permite que você audite o seu próprio critério ao reler as escolhas antigas com o resultado já conhecido. Priorização boa não é a que acerta sempre; é a que deixa rastro suficiente para melhorar.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a ordem correta entre estratégia e framework de priorização?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A estratégia filtra e o framework ordena o que passou",
                            isCorrect: true,
                        },
                        {
                            text: "O framework ordena e a estratégia confirma o topo",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois rodam juntos e a maior nota decide o caso",
                            isCorrect: false,
                        },
                        {
                            text: "O framework substitui a estratégia quando há dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um bom não precisa oferecer junto com a recusa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um critério, uma alternativa e uma data de revisita",
                            isCorrect: true,
                        },
                        {
                            text: "Um pedido de desculpas e a promessa de compensar",
                            isCorrect: false,
                        },
                        {
                            text: "Uma justificativa técnica detalhada da recusa",
                            isCorrect: false,
                        },
                        {
                            text: "Uma reunião com o diretor que aprovou o corte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um item fora da política orientadora tirou o maior score da planilha. O que fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Deixar fora: a planilha não decide o conjunto",
                            isCorrect: true,
                        },
                        {
                            text: "Aprovar o item: o score existe justamente para isso",
                            isCorrect: false,
                        },
                        {
                            text: "Recalcular o score com pesos que corrijam a ordem",
                            isCorrect: false,
                        },
                        {
                            text: "Levar o caso ao comitê para desempatar a decisão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que registrar por escrito a decisão de priorização?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dá rastro do critério e evita rediscutir o mesmo",
                            isCorrect: true,
                        },
                        {
                            text: "Cumpre a exigência de auditoria interna da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Permite cobrar quem sugeriu a iniciativa recusada",
                            isCorrect: false,
                        },
                        {
                            text: "Serve de base para a avaliação anual do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um diretor pede uma feature fora da estratégia e com RICE baixo. Como recusar sem queimar a relação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Mostrar o critério, oferecer alternativa e a revisita",
                            isCorrect: true,
                        },
                        {
                            text: "Apresentar o score baixo e encerrar a conversa ali",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar em silêncio e adiar a entrega indefinidamente",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir que ele leve o pedido ao comitê de produto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Stakeholders e influência",
    aulas: [
        {
            titulo: "Mapa de stakeholders",
            blocks: [
                {
                    type: "text",
                    value: "# Poder e interesse em um quadro\n\nEstratégia boa morre em reunião quando o PM descobre tarde quem podia barrá-la. O mapa de stakeholders existe para evitar essa surpresa, e o desenho clássico usa dois eixos: PODER sobre a decisão em questão e INTERESSE no resultado dela. Cruzando os dois, saem quatro tratamentos distintos, e o erro mais caro é aplicar o mesmo tratamento a todo mundo.\n\nQuem tem poder alto e interesse alto é patrocinador ou decisor: entra cedo, participa da construção e nunca é informado depois do fato. Poder alto e interesse baixo é o executivo distante que raramente aparece e pode vetar num corredor: mantenha satisfeito com resumo curto, porque inundá-lo de detalhe é a receita mais confiável de transformar desatenção em oposição. Poder baixo e interesse alto é o time e as áreas afetadas: informe e ouça cedo, porque a qualidade da execução mora aqui. Poder baixo e interesse baixo apenas monitore, sem consumir a sua semana. O mapa não é sobre política suja; é sobre gastar atenção onde ela muda o resultado.",
                },
                {
                    type: "table",
                    value: '[["Quadrante","Perfil típico","Como tratar","Erro clássico"],["Poder alto, interesse alto","Patrocinador ou decisor direto","Envolver cedo e com frequência","Avisar só quando já deu errado"],["Poder alto, interesse baixo","Executivo distante que pode vetar","Manter satisfeito com resumo curto","Inundar de detalhe até virar veto"],["Poder baixo, interesse alto","Time e áreas afetadas pela decisão","Informar sempre e ouvir cedo","Tratar como plateia sem voz"],["Poder baixo, interesse baixo","Áreas com contato eventual","Monitorar sem gastar energia","Consumir metade da semana com eles"]]',
                },
                {
                    type: "quote",
                    value: "O bloqueador descoberto na véspera do lançamento custa um trimestre. O mesmo bloqueador descoberto no primeiro mês custa um café.",
                },
                {
                    type: "code",
                    value: "MAPA DE STAKEHOLDERS (por decisao, nao por cargo)\n\nDecisao: concentrar o produto no autonomo de servicos\n\nDECIDE       Diretora de produto\nINFLUENCIA   CEO (visao), lider de dados (evidencia)\nBLOQUEIA     Juridico (uso de dado bancario)\n             Head de vendas (contratos PJ ja assinados)\nINFORMADO    Suporte, marketing, financeiro\n\nSEQUENCIA DE CONVERSA\n1. Lider de dados   fechar a evidencia de retencao\n2. Juridico         destravar o risco antes da reuniao\n3. Head de vendas   negociar a transicao dos contratos\n4. Diretora         decidir com os tres pontos resolvidos\n\nRegra: ninguem descobre a decisao na reuniao de decisao.",
                },
                {
                    type: "text",
                    value: "## Quem decide, quem influencia, quem bloqueia\n\nO segundo corte do mapa é mais útil que os quadrantes e quase sempre esquecido: mapeie por DECISÃO, não por cargo. A mesma pessoa é decisora em um assunto, influenciadora em outro e irrelevante num terceiro. O jurídico não decide nada sobre roadmap e pode paralisar qualquer entrega que toque dado bancário; o head de vendas não manda em produto e tem contratos assinados que viram bloqueio real quando você muda o público alvo.\n\nSão quatro papéis. DECIDE é quem assina, e existe um por decisão, não três. INFLUENCIA é quem molda a opinião de quem decide, e frequentemente é alguém sem cargo grande, como a pessoa de dados em quem a diretora confia. BLOQUEIA é quem pode travar sem precisar convencer ninguém, por competência formal ou compromisso já assumido. INFORMADO é quem precisa saber para executar bem, mesmo sem voz na escolha.\n\nDaí sai a sequência de conversas, que é a parte prática. Fale com influenciadores e bloqueadores ANTES da reunião de decisão, para que ela seja confirmação e não descoberta. Reunião de decisão em que alguém se surpreende quase nunca decide: ela agenda outra reunião.",
                },
            ],
            questions: [
                {
                    statement: "Quais são os dois eixos do mapa clássico de stakeholders?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Poder sobre a decisão e interesse no resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Tempo de casa e nível hierárquico no organograma",
                            isCorrect: false,
                        },
                        {
                            text: "Orçamento disponível e tamanho da equipe atual",
                            isCorrect: false,
                        },
                        {
                            text: "Proximidade do cliente e domínio técnico do tema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como tratar quem tem poder alto e interesse baixo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Manter satisfeito com resumo curto e sem detalhe",
                            isCorrect: true,
                        },
                        {
                            text: "Convocar para todas as reuniões semanais do time",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar até que demonstre interesse pelo assunto",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar o relatório completo de progresso toda semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mapear stakeholders por decisão, e não por cargo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem decide muda conforme o assunto em jogo",
                            isCorrect: true,
                        },
                        {
                            text: "Porque cargos mudam com frequência nas empresas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o organograma é confidencial em muitas áreas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a decisão sempre cabe ao cargo mais alto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O jurídico pode barrar o uso de dado bancário no fim do projeto. Em qual papel ele entra no mapa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como bloqueador, consultado antes da construção",
                            isCorrect: true,
                        },
                        {
                            text: "Como informado, avisado quando a entrega ficar pronta",
                            isCorrect: false,
                        },
                        {
                            text: "Como influenciador, ouvido apenas se houver dúvida",
                            isCorrect: false,
                        },
                        {
                            text: "Como decisor, dono final da escolha de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A diretora aprovou a mudança de público alvo, mas vendas travou a execução por causa de contratos PJ já assinados. O que faltou no mapa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Identificar o bloqueador e negociar antes da decisão",
                            isCorrect: true,
                        },
                        {
                            text: "Registrar a aprovação da diretora em ata assinada",
                            isCorrect: false,
                        },
                        {
                            text: "Levar o caso direto ao CEO antes de falar com vendas",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar a decisão até os contratos PJ terminarem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Gestão para cima",
            blocks: [
                {
                    type: "text",
                    value: "# Contexto de menos, opinião de mais\n\nO executivo que decide sobre o seu produto costuma ver dez por cento do que você vê e tem cem por cento de responsabilidade pelo resultado. Essa assimetria produz o padrão que todo PM reconhece: opinião forte sobre um detalhe que ele viu de relance, silêncio sobre a escolha estrutural que importa. A leitura errada é achar que ele é arbitrário. A leitura certa é que ele preenche com palpite os buracos de contexto que ninguém preencheu com informação.\n\nMarty Cagan descreve o antídoto sem meias palavras: liderança boa dá contexto ao time, e time bom devolve contexto à liderança. A gestão para cima não é bajulação nem política; é a disciplina de entregar, no formato e no tempo certos, o contexto que falta para a decisão sair boa. Isso muda o que você leva à sala: menos atualização de andamento, mais decisão pedida; menos slide de progresso, mais opção com trade off; menos isenção estudada, mais recomendação assinada. Executivo que recebe contexto suficiente devolve decisão rápida. Executivo faminto de contexto devolve microgerenciamento, e o culpado do jejum quase nunca é ele.",
                },
                {
                    type: "code",
                    value: "BRIEF EXECUTIVO (uma pagina, 5 minutos de leitura)\n\nDECISAO PEDIDA\nAprovar a concentracao do time no autonomo de servicos\nneste trimestre. Preciso da decisao ate 20/03.\n\nSITUACAO EM TRES LINHAS\nRetencao D30 geral de 18%; no segmento autonomo, 34%.\nAquisicao cresce 12% ao mes e a base ativa esta parada.\nO gargalo nao e topo de funil, e a falta de valor semanal.\n\nOPCOES\nA. Concentrar no autonomo  ganho provavel maior, mercado menor\nB. Abrir versao PJ         mercado maior, 2 trimestres de compliance\nC. Manter as tres frentes  nenhuma frente ganha profundidade\n\nRECOMENDACAO\nA. Concentra 9 pessoas no unico segmento que ja retem.\n\nRISCO E MITIGACAO\nPerder a janela PJ em 2026. Mitigacao: reavaliar em outubro\ncom o dado de saturacao do segmento.",
                },
                {
                    type: "table",
                    value: '[["O que o executivo precisa","O que costuma receber","Consequência"],["Decisão pedida, clara e datada","Atualização longa sem pedido","Ele inventa uma decisão para dar"],["Opções com trade off explícito","Proposta única, sem alternativa","A conversa vira sim ou não"],["Recomendação com dono","Isenção estudada do PM","Ele decide sem o seu contexto"],["Risco declarado antes","Risco descoberto depois","Confiança difícil de reconstruir"]]',
                },
                {
                    type: "quote",
                    value: "Executivo faminto de contexto microgerencia. Antes de reclamar do apetite dele, confira o que você tem servido e com que frequência.",
                },
                {
                    type: "text",
                    value: "## Nunca surpreender\n\nA regra de ouro da gestão para cima cabe em duas palavras: nunca surpreender. Má notícia entregue por você, cedo, com leitura e plano, custa uma conversa desconfortável. A mesma notícia descoberta por ele em outra reunião, ou pior, por um cliente, custa a sua credibilidade e o direito de operar com autonomia por muitos meses. A conta é assimétrica e vale a pena pagar o lado barato.\n\nTrês hábitos sustentam a prática. O primeiro é escrever a decisão pedida na primeira linha, com prazo: quem lê em cinco minutos precisa saber o que se espera dele antes de chegar ao contexto. O segundo é apresentar opções reais, não uma proposta acompanhada de duas alternativas ridículas montadas para perder; executivo experiente reconhece o teatro e desconta a sua credibilidade na hora. O terceiro é recomendar. Levar três opções e se recusar a opinar parece prudência e é abdicação: você é quem tem o contexto profundo, e a recomendação é justamente o que ele não consegue produzir sozinho.\n\nQuando a decisão for contra a sua recomendação, registre o seu ponto uma vez, com clareza, e execute com energia total. Discordar e se comprometer é assunto da próxima aula, e é o que separa profissional de resistente passivo.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que um brief executivo precisa deixar explícito logo na primeira linha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A decisão pedida e o prazo em que ela é necessária",
                            isCorrect: true,
                        },
                        {
                            text: "O histórico completo do projeto desde o começo",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de tarefas que o time entregou no mês",
                            isCorrect: false,
                        },
                        {
                            text: "O organograma das áreas envolvidas na entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que apresentar opções em vez de uma proposta única?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque a conversa deixa de ser apenas sim ou não",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o executivo prefere escolher entre marcas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a política da empresa exige três cenários",
                            isCorrect: false,
                        },
                        {
                            text: "Porque assim a culpa da escolha muda de lado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você levou três opções e o executivo pergunta o que você faria. Qual é a postura correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Recomendar uma opção e assumir a escolha feita",
                            isCorrect: true,
                        },
                        {
                            text: "Manter a isenção para não influenciar a decisão",
                            isCorrect: false,
                        },
                        {
                            text: "Devolver a pergunta e pedir que ele decida sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "Sugerir uma quarta opção criada ali na reunião",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O executivo tem opinião forte sobre um tema que acompanha de longe. Qual é o antídoto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Levar antes o contexto que falta, com dado",
                            isCorrect: true,
                        },
                        {
                            text: "Concordar na reunião e seguir o plano original",
                            isCorrect: false,
                        },
                        {
                            text: "Escalar a divergência para o chefe dele",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar a opinião dele para preservar a relação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um risco grande apareceu e o comitê onde ele seria apresentado só acontece na semana que vem. O que fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Avisar antes, com leitura e plano de mitigação",
                            isCorrect: true,
                        },
                        {
                            text: "Esperar o comitê, onde todos ouvem ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Resolver sozinho e relatar apenas se der errado",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar no documento e confiar que ele vai ler",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Conflito produtivo",
            blocks: [
                {
                    type: "text",
                    value: '# Discordar do dado, não da pessoa\n\nTime sem conflito não é time alinhado, é time em que alguém desistiu de falar. Discordância é matéria prima de decisão boa; o que separa o conflito produtivo do destrutivo não é a intensidade, é o alvo. Conflito produtivo ataca premissas, dados e interpretações. Conflito destrutivo ataca competência, intenção e pessoa, e uma vez que a conversa cruza essa linha, nenhum dado a traz de volta.\n\nA técnica mais simples é reformular a discordância como pergunta sobre evidência. "Isso não vai funcionar" fecha a porta e convida à defesa; "que evidência mudaria a sua leitura?" abre o caminho para um teste. A segunda técnica é separar posição de interesse: a posição do marketing pode ser "precisamos da campanha em abril" enquanto o interesse é "bater a meta do semestre", e é no interesse que existe negociação possível, porque campanhas são uma entre várias formas de chegar lá.\n\nA terceira é declarar o desacordo cedo. Divergência guardada não evapora: ela reaparece como execução morna, sabotagem passiva ou aquele comentário na reunião errada, na frente das pessoas erradas.',
                },
                {
                    type: "table",
                    value: '[["Frase que trava","Frase que destrava","O que mudou"],["Isso não vai funcionar","Que evidência mudaria a sua leitura","Sai da opinião e vai para o teste"],["Você não entende o cliente","Nossos dados divergem, vamos olhar juntos","Ataca o dado, não a pessoa"],["Já decidimos, siga em frente","Discordo e assumo, medimos em seis semanas","Compromisso com revisão marcada"],["Vou escalar isso agora mesmo","Precisamos de decisão até quinta, eis as opções","Escalada com prazo e material"]]',
                },
                {
                    type: "quote",
                    value: "Escalar não é acusar: é levar duas leituras honestas a quem tem autoridade para decidir entre elas, com a outra parte sabendo que você vai subir.",
                },
                {
                    type: "text",
                    value: "## Escalar bem\n\nEscalar tem má fama porque quase sempre é feito mal. Feito bem, é um serviço prestado à empresa: decisão travada tem custo de atraso, e alguém precisa pagar a conta de destravá-la. O critério de QUANDO é objetivo: escale quando a decisão está parada, as partes já tentaram resolver no próprio nível e a espera custa dinheiro ou oportunidade mensurável. Escalar por impaciência, na primeira divergência, gasta um crédito que você vai querer depois.\n\nO COMO é onde a maioria erra. Avise a outra parte antes de subir, sempre, sem exceção; ninguém perdoa descobrir pelas costas. Leve as duas versões, a sua e a dela, escritas de forma que a outra parte reconheceria a própria posição no seu resumo. Chegue com opções e uma recomendação, não com uma queixa. E peça uma decisão com data, porque escalada sem prazo apenas move o travamento de andar.\n\nDepois da decisão vem a parte que define reputação: discordar e se comprometer. Você registra a divergência uma vez, combina o marco em que o assunto será medido de novo e executa com energia total. Execução morna para provar que você estava certo é a forma mais cara de ter razão.",
                },
            ],
            questions: [
                {
                    statement: "O que significa discordar do dado e não da pessoa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Atacar a premissa e a evidência, não a competência",
                            isCorrect: true,
                        },
                        {
                            text: "Evitar qualquer discussão aberta dentro do time",
                            isCorrect: false,
                        },
                        {
                            text: "Levar a divergência apenas para conversas privadas",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar o argumento de quem tem mais senioridade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando escalar um conflito é a decisão certa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quando a decisão travou e a espera custa caro",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a outra área discorda da sua proposta",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o time pede apoio da liderança direta",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a discussão já dura mais de uma reunião",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como escalar sem destruir a relação com a outra área?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Levar as duas versões e avisar a pessoa antes",
                            isCorrect: true,
                        },
                        {
                            text: "Levar só a sua versão, que já está bem fundamentada",
                            isCorrect: false,
                        },
                        {
                            text: "Escalar por escrito para deixar registro do caso",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir que a outra área escale o assunto sozinha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza discordar e se comprometer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Registrar a divergência e executar com energia",
                            isCorrect: true,
                        },
                        {
                            text: "Executar devagar até a decisão ser revista",
                            isCorrect: false,
                        },
                        {
                            text: "Manter a discussão aberta durante a execução",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar a decisão e evitar registrar o desacordo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas áreas discordam sobre o público prioritário, a decisão está travada há três semanas e o custo de atraso é alto. Qual escalada é boa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Subir com as duas leituras, opções e prazo de decisão",
                            isCorrect: true,
                        },
                        {
                            text: "Subir com a sua leitura e o pedido de aprovação dela",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar mais uma rodada de dados antes de subir",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao chefe que decida sem ver o material atual",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Vender a estratégia por dentro",
            blocks: [
                {
                    type: "text",
                    value: "# Estratégia que ninguém conhece não existe\n\nO documento perfeito, aprovado pela diretoria e guardado numa pasta, tem impacto zero. Estratégia só vira comportamento quando as pessoas que tomam mil decisões pequenas por semana conseguem repeti-la com as próprias palavras. Enquanto o suporte não souber quem é o público prioritário, ele vai priorizar a fila pelo tom de voz do cliente; enquanto vendas não souber os nãos, vai prometer o que não existe.\n\nVender por dentro começa com narrativa, e narrativa tem forma fixa: o que está acontecendo, por que acontece, o que escolhemos, o que isso muda para você e como saberemos que deu certo. As três primeiras partes são iguais para todos, porque são o diagnóstico e a aposta. A quarta muda por audiência, e é a que faz a mensagem grudar: dizer a vendas que não prometemos PJ neste ano é mais útil que qualquer slide sobre visão. A quinta fecha o contrato de honestidade, porque dá a todos o direito de cobrar o resultado prometido.",
                },
                {
                    type: "code",
                    value: "NARRATIVA DA ESTRATEGIA (90 segundos, mesma base para todos)\n\n1. O QUE ESTA ACONTECENDO\n   A base cresce e nao retem: 18% de retencao em D30.\n\n2. POR QUE ACONTECE\n   O produto resolve uma vez so. O autonomo e a excecao:\n   a decisao de dinheiro dele volta toda semana.\n\n3. O QUE ESCOLHEMOS\n   Concentrar no ciclo semanal do autonomo de servicos.\n   Nao faremos PJ nem credito neste ano.\n\n4. O QUE MUDA PARA VOCE\n   Vendas    nao prometemos PJ; o discurso vira autonomo\n   Suporte   fila do segmento tem prioridade\n   Marketing canal e mensagem so para autonomo\n   Engenharia PJ entra em manutencao, sem evolucao\n\n5. COMO SABEREMOS QUE DEU CERTO\n   Retencao D30 do segmento de 34% para 45% ate junho.",
                },
                {
                    type: "table",
                    value: '[["Momento","Recorte da narrativa","Erro comum"],["Reunião geral da empresa","Diagnóstico e aposta em 90 segundos","Ler o documento inteiro em voz alta"],["Conversa individual com um par","O que muda no trabalho dele","Falar só do seu time e das suas metas"],["Comitê executivo","A aposta, o risco e a decisão pedida","Mostrar o detalhe da execução"],["Chegada de gente nova","A história completa, com os nãos","Entregar só o link do documento"]]',
                },
                {
                    type: "quote",
                    value: "Você vai enjoar da sua própria estratégia muito antes de a organização ouvi-la pela primeira vez de verdade. Repita mesmo assim.",
                },
                {
                    type: "text",
                    value: "## Repetição e aliados\n\nDuas mecânicas transformam narrativa em adoção. A primeira é repetição, e ela é contraintuitiva: no momento em que você não aguenta mais falar da aposta, metade da empresa está ouvindo com atenção pela primeira vez. Comunicação interna não é evento, é frequência; a mesma mensagem, nos mesmos termos, em canais diferentes, por meses. Trocar as palavras a cada apresentação para não parecer repetitivo destrói justamente o efeito que você quer, que é a frase virar vocabulário comum.\n\nA segunda é coalizão. Estratégia não passa em reunião grande, passa em conversas pequenas antes dela. Identifique os influenciadores do mapa, leve o material a cada um individualmente, ouça as objeções enquanto ainda dá para incorporá-las e chegue à reunião com a sala já parcialmente convencida. Isso não é manipulação, é respeito pelo tempo coletivo: nenhuma decisão boa nasce da primeira exposição de um assunto complexo a dez pessoas simultaneamente.\n\nO oposto disso tem nome e custo conhecido: a área influente que descobre a estratégia junto com todo mundo, se sente atropelada e vira opositora permanente, não pelo conteúdo, mas pelo processo. Recuperar essa relação leva trimestres. Evitá-la leva três conversas de meia hora.",
                },
            ],
            questions: [
                {
                    statement: "Por que repetir a estratégia mesmo depois de já tê-la apresentado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque o autor se cansa muito antes da organização",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o documento oficial some do sistema interno",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a estratégia muda a cada duas ou três semanas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a diretoria exige apresentações mensais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a narrativa da estratégia precisa entregar para cada área?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O que muda no trabalho concreto daquela área",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de entregas do time de produto no ano",
                            isCorrect: false,
                        },
                        {
                            text: "O organograma novo com as responsabilidades",
                            isCorrect: false,
                        },
                        {
                            text: "As metas individuais de cada pessoa da área",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Antes da reunião de decisão, o que mais aumenta a chance de a estratégia passar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Alinhar em conversas individuais com os influentes",
                            isCorrect: true,
                        },
                        {
                            text: "Preparar um material visual bem mais elaborado",
                            isCorrect: false,
                        },
                        {
                            text: "Convidar mais pessoas para ampliar o apoio na sala",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar a surpresa para causar impacto na reunião",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Seis meses depois, ninguém fora do time sabe explicar a aposta do produto. O que isso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A estratégia foi publicada, mas nunca foi vendida",
                            isCorrect: true,
                        },
                        {
                            text: "O documento precisa de uma revisão de linguagem",
                            isCorrect: false,
                        },
                        {
                            text: "A aposta escolhida era complexa demais para todos",
                            isCorrect: false,
                        },
                        {
                            text: "O time deveria ter escolhido outra aposta na época",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma área influente foi surpreendida pela estratégia na reunião geral e virou opositora. Qual erro de venda interna você cometeu?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Não construir a coalizão antes do anúncio público",
                            isCorrect: true,
                        },
                        {
                            text: "Não incluir dados suficientes na apresentação final",
                            isCorrect: false,
                        },
                        {
                            text: "Não pedir aprovação formal do comitê executivo",
                            isCorrect: false,
                        },
                        {
                            text: "Não repetir a mensagem nas semanas seguintes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Negociação de escopo e prazo",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro variáveis, nenhuma de graça\n\nToda negociação de entrega mexe em quatro variáveis: escopo (o quanto se faz), prazo (quando fica pronto), qualidade (o quanto se testa, se documenta e se sustenta) e gente (quantas pessoas participam). Elas são ligadas: mexer numa muda pelo menos uma das outras. O papel do PM na conversa é impedir que essa ligação fique implícita, porque quando ninguém declara a troca, ela acontece sozinha, e a variável que cede em silêncio é sempre a mesma, a qualidade.\n\nGente merece um aviso à parte. A intuição diz que dobrar o time dobra a velocidade, e a realidade diz o contrário no curto prazo: pessoas novas consomem quem já estava produzindo, em explicação, revisão e coordenação. Frederick Brooks resumiu isso há décadas e a lição continua ignorada em todo trimestre apertado. Adicionar gente pode ajudar em projetos longos, com tempo de maturação; em projeto atrasado que precisa entregar em três semanas, atrasa mais.\n\nA conversa madura, portanto, não é sobre esforço nem sobre vontade. É sobre qual variável cede, quem decide isso e o que a empresa perde em cada opção.",
                },
                {
                    type: "table",
                    value: '[["Pedido que chega","Troca honesta","Troca desonesta"],["Antecipar a data em três semanas","Cortar dois temas do escopo","Prometer tudo e reduzir o teste"],["Somar uma feature ao escopo","Adiar a data ou trocar por outra","Absorver com hora extra por meses"],["Dobrar o time no meio do projeto","Assumir queda de ritmo no começo","Prometer o dobro de velocidade"],["Manter escopo, prazo, time e qualidade","Nenhuma: alguma variável vai ceder","Deixar a qualidade ceder calada"]]',
                },
                {
                    type: "quote",
                    value: "Quando ninguém escolhe qual variável cede, a qualidade cede sozinha, sem reunião e sem ata. É a única que não tem quem a defenda na sala.",
                },
                {
                    type: "text",
                    value: '## O não construtivo\n\nO não que funciona em negociação de escopo quase nunca é a palavra "não". É a troca colocada na mesa: "posso entregar A e B até a data combinada, ou A, B e C três semanas depois, e a escolha é sua". Repare no que essa frase faz: não recusa nada, devolve a decisão a quem tem autoridade sobre ela, e torna o custo visível. O interlocutor sai com poder, você sai com um plano executável, e ninguém sai enganado.\n\nTrês regras completam a prática. Primeiro, negocie com números, não com sensação: "isso são cinco semanas de duas pessoas" encerra discussões que "isso é muito trabalho" só prolonga. Segundo, nunca aceite as quatro variáveis fixas de uma vez, porque aceitar é assumir sozinho um risco que pertence à empresa; explicite a impossibilidade na hora, com educação, e proponha as combinações viáveis. Terceiro, registre o combinado no mesmo dia, em texto curto, com o que entra, o que sai e a data; memória de negociação apertada é notoriamente criativa três semanas depois.\n\nCom o mapa de stakeholders, a gestão para cima, o conflito produtivo e a venda interna, você tem o conjunto que faz a estratégia sair do documento. O módulo final junta tudo em um caso único, do diagnóstico ao one-pager.',
                },
            ],
            questions: [
                {
                    statement: "Quais são as quatro variáveis de uma negociação de entrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escopo, prazo, qualidade e tamanho do time",
                            isCorrect: true,
                        },
                        {
                            text: "Custo, receita, margem e prazo de retorno",
                            isCorrect: false,
                        },
                        {
                            text: "Risco, esforço, alcance e confiança do time",
                            isCorrect: false,
                        },
                        {
                            text: "Backlog, sprint, release e retrospectiva",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual variável costuma ceder em silêncio quando nada é negociado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A qualidade, que ninguém declara ter cortado",
                            isCorrect: true,
                        },
                        {
                            text: "O prazo, que sempre é renegociado em público",
                            isCorrect: false,
                        },
                        {
                            text: "O escopo, que o cliente corta por conta própria",
                            isCorrect: false,
                        },
                        {
                            text: "O time, que cresce automaticamente na pressão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pedem para antecipar a data em três semanas sem tirar nada do escopo. Qual é a resposta profissional?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostrar o que sai do escopo para a data caber",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar e compensar com horas extras do time",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar sem explicar, porque o plano está fechado",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar e avisar do atraso quando ele acontecer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O diretor propõe dobrar o time no meio do projeto para acelerar a entrega. O que declarar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que gente nova custa ritmo antes de somar ritmo",
                            isCorrect: true,
                        },
                        {
                            text: "Que o orçamento não comporta novas contratações",
                            isCorrect: false,
                        },
                        {
                            text: "Que o time atual vai resistir à chegada de gente",
                            isCorrect: false,
                        },
                        {
                            text: "Que a velocidade dobra a partir do mês seguinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um cliente grande exige escopo, prazo e qualidade sem alterar o tamanho do time. Como conduzir a conversa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Explicitar que uma variável cede e escolher qual",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar tudo e resolver os problemas no caminho",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar o cliente e encerrar a negociação ali",
                            isCorrect: false,
                        },
                        {
                            text: "Prometer o prazo e negociar o escopo depois dele",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: a estratégia do Financem em um documento (leitura guiada)",
    aulas: [
        {
            titulo: "O cenário e os três caminhos",
            blocks: [
                {
                    type: "text",
                    value: "# Financem: tração inicial e uma bifurcação\n\nO Financem é um app de finanças fictício com dois anos de vida e o problema mais comum dessa idade: tração suficiente para provar que existe demanda e insuficiente para provar que existe negócio. São 40 mil usuários ativos por mês, 6 mil deles pagando R$ 39 no plano único, o que dá R$ 234 mil de receita recorrente mensal. A aquisição paga cresce 12% ao mês e a base ativa está parada há dois trimestres, o que já conta metade da história.\n\nA outra metade está na retenção. Em D30, a base geral retém 18%: quatro em cada cinco pessoas somem antes do segundo mês. Dentro dela existe um grupo que se comporta de forma diferente. Os autônomos de serviços, cerca de 8 mil ativos, retêm 34% e convertem para pago em 30%, contra 15% da média. Eles custam menos para adquirir, porque chegam por indicação, e reclamam de coisas específicas no suporte: imposto, mês fraco, mistura entre o dinheiro do trabalho e o de casa.\n\nO conselho pediu para dobrar a receita em doze meses. O caixa dura catorze. O time tem nove pessoas.",
                },
                {
                    type: "table",
                    value: '[["Indicador","Valor atual","Leitura"],["Base ativa mensal","40.000 usuários","Parada há dois trimestres, apesar da aquisição"],["Pagantes","6.000 no plano de R$ 39","Receita recorrente de R$ 234.000 por mês"],["Retenção D30 geral","18%","Quatro em cada cinco somem no primeiro mês"],["Retenção D30 do autônomo","34%","Quase o dobro da média da base"],["Conversão do autônomo","30% contra 15% da média","O segmento paga em proporção dobrada"],["Caixa e time","14 meses e 9 pessoas","Uma aposta errada consome metade da pista"]]',
                },
                {
                    type: "code",
                    value: "OS TRES CAMINHOS SOBRE A MESA\n\nA. APROFUNDAR NO AUTONOMO DE SERVICOS\n   Mercado alcancavel: cerca de 1,2 milhao de pessoas\n   Time necessario: o time atual, 9 pessoas\n   Evidencia a favor: retencao 34% e conversao 30%\n   Risco: teto de receita menor no horizonte de 3 anos\n\nB. ABRIR VERSAO PJ PARA MICROEMPRESAS\n   Mercado alcancavel: cerca de 4,5 milhoes de empresas\n   Ticket possivel: R$ 149/mes contra R$ 39 hoje\n   Custo de entrada: 2 trimestres de nota fiscal e\n   conciliacao, mais 1 pessoa dedicada a compliance\n   Risco: ciclo de venda longo e time dividido em dois\n\nC. CREDITO COM BASE NO FLUXO DE CAIXA\n   Receita potencial: a maior das tres\n   Pre requisitos: capital, parceiro bancario e\n   autorizacao regulatoria (estimativa de 9 a 12 meses)\n   Risco: amplia um produto que ainda nao retem",
                },
                {
                    type: "quote",
                    value: "Aquisição subindo 12% ao mês com base ativa parada não é um problema de marketing: é um recibo de que o balde vaza no mesmo ritmo em que enche.",
                },
                {
                    type: "text",
                    value: "## O que o conselho pediu e o que o caixa permite\n\nDobrar a receita em doze meses significa sair de R$ 234 mil para R$ 468 mil por mês. Existem só três alavancas para isso: mais pagantes, ticket maior ou menos gente saindo. A restrição de caixa muda o peso de cada uma. Com catorze meses de pista, qualquer caminho que só comece a devolver dinheiro no décimo segundo mês é uma aposta de tudo ou nada, e apostas de tudo ou nada em empresa que ainda não achou a retenção costumam ser a última decisão que a empresa toma.\n\nRepare também no que os números NÃO dizem. Eles não dizem que o autônomo é o melhor mercado do mundo, nem que PJ é ruim; PJ tem mercado maior e ticket quase quatro vezes o atual, o que é sério. Eles dizem que o Financem tem um vazamento na base e um grupo que não vaza, e que dois dos três caminhos gastam trimestres antes de tocar nesse vazamento.\n\nAntes de virar a página, escreva a sua versão do diagnóstico em três frases. A próxima aula mostra a versão do documento, e comparar as duas vale mais que ler a resposta pronta.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o principal sinal a favor do segmento de autônomos de serviços?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Retém 34% em D30, quase o dobro da média da base",
                            isCorrect: true,
                        },
                        {
                            text: "É o maior mercado disponível entre os três",
                            isCorrect: false,
                        },
                        {
                            text: "Tem o menor custo de aquisição possível hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Já responde por 80% da receita mensal atual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a receita recorrente mensal atual do Financem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "R$ 234.000, de 6.000 pagantes a R$ 39 por mês",
                            isCorrect: true,
                        },
                        {
                            text: "R$ 156.000, de 4.000 pagantes a R$ 39 por mês",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 1.560.000, de 40.000 ativos a R$ 39 por mês",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 93.600, de 6.000 pagantes a R$ 15,60 por mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o caminho do crédito é o mais arriscado neste momento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Amplia um produto que ainda não retém usuários",
                            isCorrect: true,
                        },
                        {
                            text: "Exige um ticket maior do que a base aceita hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Não tem mercado grande o bastante para valer",
                            isCorrect: false,
                        },
                        {
                            text: "Depende de um time de vendas que não existe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A aquisição cresce 12% ao mês e a base ativa está parada. O que esse par indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O balde vaza: o problema está na retenção",
                            isCorrect: true,
                        },
                        {
                            text: "O canal de aquisição está caro demais",
                            isCorrect: false,
                        },
                        {
                            text: "A meta de crescimento foi mal calculada",
                            isCorrect: false,
                        },
                        {
                            text: "O mercado alcançável já está saturado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O conselho quer dobrar a receita em doze meses e o caixa dura catorze. Como essa restrição muda a leitura dos três caminhos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Descarta o que só dá retorno depois da pista acabar",
                            isCorrect: true,
                        },
                        {
                            text: "Favorece o caminho de maior mercado potencial",
                            isCorrect: false,
                        },
                        {
                            text: "Obriga a rodar os três caminhos ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Indica que a meta do conselho deve ser recusada",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O diagnóstico e a escolha",
            blocks: [
                {
                    type: "text",
                    value: '# O desafio central em três frases\n\nO diagnóstico precisa explicar POR QUE o desempenho é esse, não repetir que ele é ruim. A versão do documento diz assim: o Financem resolve um problema de uma vez só, porque depois do primeiro mês organizado ele não devolve valor novo; a exceção é o autônomo de serviços, cuja decisão de dinheiro se repete toda semana, e por isso ele retém 34% contra 18% e converte 30% contra 15%; o gargalo, portanto, não é topo de funil, é a ausência de um motivo semanal para voltar.\n\nAplique o teste da proibição do primeiro módulo: esse diagnóstico proíbe algo? Proíbe. Ele proíbe comprar mais tráfego enquanto o balde vaza, o que já derruba a saída mais óbvia diante da meta do conselho. Ele também proíbe tratar retenção como problema de interface, porque a leitura não é "o produto é confuso", é "o produto não tem por que ser aberto na terça de manhã".\n\nDa leitura sai a política orientadora quase sozinha: concentrar todo o produto no ciclo semanal de caixa do autônomo de serviços, até ser a escolha óbvia desse público. Uma abordagem geral, não uma feature, exatamente como Rumelt descreve.',
                },
                {
                    type: "code",
                    value: "DIAGNOSTICO, APOSTA E OS DOIS NAOS\n\nDESAFIO CENTRAL\nO Financem resolve um problema uma vez so: depois do\nprimeiro mes organizado, nao devolve valor novo. A excecao\ne o autonomo de servicos, cuja decisao de dinheiro se repete\ntoda semana (retencao 34% contra 18%, conversao 30% contra\n15%). O gargalo nao e topo de funil, e a ausencia de um\nmotivo semanal para voltar.\n\nPOLITICA ORIENTADORA\nConcentrar todo o produto no ciclo semanal de caixa do\nautonomo de servicos, ate sermos a escolha obvia dele.\n\nOS DOIS NAOS DESTE ANO\nNAO: versao PJ. Consome 2 trimestres em nota fiscal e\n     compliance e nao toca o gargalo de retencao.\n     Revisita marcada: outubro.\nNAO: credito. Depende de capital e licenca (9 a 12 meses)\n     e amplia um produto que ainda nao retem.\n     Revisita marcada: quando a retencao D30 passar de 45%.",
                },
                {
                    type: "table",
                    value: '[["Pergunta de teste","Resposta no caso do Financem"],["O diagnóstico explica a causa?","Sim: sem valor recorrente, o usuário resolve e sai"],["Ele proíbe alguma solução?","Sim: proíbe comprar tráfego para um balde furado"],["A aposta elimina alternativas?","Sim: PJ e crédito ficam fora, com data de revisita"],["Alguém importante vai reclamar?","Sim: vendas perde os contratos PJ deste ano"],["Existe evidência por trás?","Sim: retenção e conversão do segmento, medidas"]]',
                },
                {
                    type: "quote",
                    value: "Um não sem data é um talvez covarde. Escrever quando o assunto volta à mesa custa uma linha e evita que ele volte toda semana.",
                },
                {
                    type: "text",
                    value: "## Por que os nãos precisam de data\n\nOs dois nãos do documento não dizem que PJ e crédito são ideias ruins. Dizem que não são o jogo DESTE ano, com ESTE time e ESTE caixa, e cada um carrega a condição que reabriria a discussão: PJ volta em outubro, com dado de saturação do segmento; crédito volta quando a retenção D30 passar de 45%, porque emprestar dinheiro apoiado num produto que as pessoas abandonam é amplificar um problema em vez de resolvê-lo.\n\nEssa forma de recusar faz três trabalhos ao mesmo tempo. Protege o foco, porque o pedido não volta na semana seguinte com outra roupagem. Protege a relação, porque quem defendia PJ sai da reunião com uma data, não com uma porta fechada. E protege a própria estratégia contra teimosia, porque a condição de revisita é também o gatilho que obriga o time a olhar de novo, mesmo que a aposta esteja indo bem.\n\nO teste final do módulo 1 está satisfeito: alguém importante reclama. Vendas perde contratos PJ que já estavam no funil deste ano, e essa perda é a evidência mais confiável de que houve escolha de verdade. Estratégia aprovada sem nenhum descontente é quase sempre uma lista de desejos com capa nova.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o desafio central do Financem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Falta um motivo semanal para o usuário voltar",
                            isCorrect: true,
                        },
                        {
                            text: "Falta verba de marketing para crescer a base",
                            isCorrect: false,
                        },
                        {
                            text: "Falta um time maior para acelerar as entregas",
                            isCorrect: false,
                        },
                        {
                            text: "Falta um preço competitivo contra os rivais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual foi a política orientadora escolhida no documento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Concentrar tudo no ciclo semanal do autônomo",
                            isCorrect: true,
                        },
                        {
                            text: "Ampliar a base com aquisição paga mais agressiva",
                            isCorrect: false,
                        },
                        {
                            text: "Atacar os três caminhos com times separados",
                            isCorrect: false,
                        },
                        {
                            text: "Subir o preço do plano para dobrar a receita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna o não à versão PJ um não profissional?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Vem com motivo, critério e data de reavaliação",
                            isCorrect: true,
                        },
                        {
                            text: "Vem assinado pelo diretor de produto da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Vem depois de uma votação aberta com o time todo",
                            isCorrect: false,
                        },
                        {
                            text: "Vem sem prazo, para não criar expectativa nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Vendas vai perder contratos PJ por causa dessa escolha. O que isso diz sobre a estratégia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Que houve escolha real: alguém importante reclama",
                            isCorrect: true,
                        },
                        {
                            text: "Que o processo de aprovação foi mal conduzido",
                            isCorrect: false,
                        },
                        {
                            text: "Que a estratégia precisa de ajuste antes de valer",
                            isCorrect: false,
                        },
                        {
                            text: "Que vendas deveria ter tido poder de veto no caso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um investidor pergunta por que o Financem ignora um mercado de 4,5 milhões de empresas. Qual é a defesa da escolha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dominar quem já retém financia a expansão depois",
                            isCorrect: true,
                        },
                        {
                            text: "O mercado PJ é menor do que parece nos relatórios",
                            isCorrect: false,
                        },
                        {
                            text: "O time atual não tem competência técnica para PJ",
                            isCorrect: false,
                        },
                        {
                            text: "O produto PJ teria margem menor que o atual",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "OKRs do próximo trimestre",
            blocks: [
                {
                    type: "text",
                    value: "# Um objetivo, três resultados\n\nA aposta está escrita e agora precisa encostar no trimestre. O objetivo do ciclo traduz a política orientadora em uma frase que o time repete no corredor: fazer o autônomo de serviços voltar toda semana porque o Financem decide COM ele, e não apenas registra o que já aconteceu. Qualitativo, com prazo, e alinhado ao diagnóstico sem citar nenhuma solução.\n\nOs três KRs medem resultado em camadas que se explicam. Retenção D30 do segmento, de 34% para 45%, é o número que prova a tese central: se o valor semanal existir, as pessoas ficam. Uso semanal, definido como três semanas ativas em quatro, de 21% para 35%, mede o hábito que produz a retenção e reage antes dela, o que dá leitura de progresso no meio do ciclo. Conversão para pago no segmento, de 30% para 38%, liga o hábito à receita que o conselho cobra.\n\nDuas métricas de guarda impedem o número de subir pelo motivo errado: o NPS do segmento não pode cair abaixo de 45, e o tempo de resposta do suporte segue abaixo de seis horas.",
                },
                {
                    type: "code",
                    value: "OKR DO TRIMESTRE (abril a junho)\n\nOBJETIVO\nFazer o autonomo de servicos voltar toda semana porque o\nFinancem decide com ele, e nao apenas registra o passado.\n\nKR1  Retencao D30 do segmento:        de 34% para 45%\nKR2  Uso semanal (3 semanas em 4):     de 21% para 35%\nKR3  Conversao para pago no segmento:  de 30% para 38%\n\nMETRICAS DE GUARDA (nao podem piorar)\n- NPS do segmento nao cai abaixo de 45 (hoje 48)\n- Tempo de resposta do suporte segue abaixo de 6 horas\n\nINICIATIVAS (hipoteses, fora do OKR, trocaveis no caminho)\n- Resumo semanal de caixa com uma decisao sugerida\n- Reserva automatica de imposto no onboarding\n- Alerta de semana atipica no canal preferido\n\nREGUA COMBINADA\nAlvos sao stretch: 70% de cada KR ja e sucesso declarado.\nCombinado no dia 1, nao no dia 90.",
                },
                {
                    type: "table",
                    value: '[["Key Result","Parte da aposta que ele prova","Baseline e alvo"],["Retenção D30 do segmento","Que o valor semanal segura o usuário","34% para 45%"],["Uso semanal, 3 em 4 semanas","Que existe hábito, não só instalação","21% para 35%"],["Conversão para pago","Que o hábito vira receita no ciclo","30% para 38%"],["NPS do segmento, guarda","Que o hábito não veio de insistência","48 hoje, piso de 45"]]',
                },
                {
                    type: "quote",
                    value: "Três KRs em camadas contam uma história: hábito acontece, retenção responde, receita segue. Se a primeira camada não se mexe, a tese caiu cedo.",
                },
                {
                    type: "text",
                    value: '## O que ficou de fora, e por quê\n\nTrês candidatos foram recusados na escrita do OKR, e as recusas ensinam mais que os aceitos. "Lançar o resumo semanal de caixa" ficou de fora porque é entrega: o time pode lançar e o usuário continuar sem voltar. Ele vive na lista de iniciativas, onde pode ser trocado no meio do ciclo sem que ninguém mexa nos KRs.\n\n"Dobrar a receita da empresa" ficou de fora porque o time não controla a variável em um trimestre: metade dela depende de preço, canal e mercado. O OKR pega o pedaço que este time move agora, e a cadeia até a meta do conselho fica explícita no documento, não dentro do KR.\n\n"Fazer 20 entrevistas com autônomos" ficou de fora porque é atividade. Entrevistar é meio, e um meio importante; o KR honesto é o que as entrevistas deveriam causar. Repare no efeito colateral saudável dessas três recusas: elas devolvem liberdade ao time. Com KRs de outcome, se na semana seis o resumo semanal não mover o uso, ninguém precisa de permissão para trocar de iniciativa, porque o compromisso assumido foi com o número do usuário, não com o plano de segunda-feira.',
                },
            ],
            questions: [
                {
                    statement: "Por que lançar o resumo semanal de caixa não entra como KR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É entrega, não mudança no comportamento do usuário",
                            isCorrect: true,
                        },
                        {
                            text: "É trabalho que pertence a outro time da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "É uma iniciativa cara demais para o trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "É um item que já estava previsto no roadmap atual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a função das métricas de guarda nesse OKR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Impedir que o KR seja batido piorando outra coisa",
                            isCorrect: true,
                        },
                        {
                            text: "Substituir o KR principal caso ele fique vermelho",
                            isCorrect: false,
                        },
                        {
                            text: "Medir o esforço do time durante o trimestre todo",
                            isCorrect: false,
                        },
                        {
                            text: "Servir de meta reserva para a apresentação final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o KR de uso semanal existe ao lado do de retenção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mede hábito, o mecanismo por trás da retenção",
                            isCorrect: true,
                        },
                        {
                            text: "Funciona como reserva se a retenção não se mover",
                            isCorrect: false,
                        },
                        {
                            text: "Facilita bater a meta com um número mais alto",
                            isCorrect: false,
                        },
                        {
                            text: "Substitui a conversão como indicador de receita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Combinar no primeiro dia que 70% do alvo stretch já é sucesso serve para quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Evitar que o fechamento vire disputa de interpretação",
                            isCorrect: true,
                        },
                        {
                            text: "Permitir que o time reduza o alvo no meio do ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir bônus proporcional ao resultado alcançado",
                            isCorrect: false,
                        },
                        {
                            text: "Justificar alvos menores no planejamento seguinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na semana 6, o uso semanal subiu de 21% para 33% e a retenção D30 não se moveu. Como ler esse quadro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Hábito reage antes; a retenção tem efeito retardado",
                            isCorrect: true,
                        },
                        {
                            text: "O KR de retenção está errado e precisa ser trocado",
                            isCorrect: false,
                        },
                        {
                            text: "O uso semanal foi inflado por uma definição frouxa",
                            isCorrect: false,
                        },
                        {
                            text: "A aposta falhou e o trimestre deve ser reiniciado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O roadmap now-next-later",
            blocks: [
                {
                    type: "text",
                    value: '# Temas por horizonte, compromisso por item\n\nO roadmap do Financem organiza a aposta em três horizontes de incerteza e declara, item por item, o nível de compromisso assumido. No NOW ficam dois temas de naturezas diferentes, e isso é proposital. O primeiro é "motivo semanal para voltar", o coração da aposta, com medida de sucesso ligada ao KR de uso semanal e nível JANELA: segundo trimestre, revisado na primeira segunda de cada mês. O segundo é a adequação à regra nova do carnê do autônomo, que entra em vigor em 1 de julho e por isso é COMPROMISSO com data firme, o único do plano.\n\nNo NEXT está a previsão de meses magros, ainda em descoberta, com teste marcado para maio com 40 usuários. Nível APOSTA: nada de data até o teste falar. Ao lado dela, a separação entre gasto pessoal e gasto de trabalho, escolhida porque alimenta a previsão.\n\nNo LATER ficam os dois nãos do ano com as condições de reabertura escritas: relacionamento com o contador, que depende do resultado do NEXT, e crédito pelo fluxo de caixa, que exige licença e uma base que retenha.',
                },
                {
                    type: "code",
                    value: "ROADMAP DO FINANCEM (revisao mensal, primeira segunda)\n\nNOW (abril a junho)\n- Tema: motivo semanal para voltar\n  Por que: retencao D30 de 34% e o teto do segmento\n  Medida: uso semanal de 21% para 35%\n  Nivel: JANELA, segundo trimestre, revisada todo mes\n- Tema: adequacao a regra nova do carne do autonomo\n  Por que: a regra entra em vigor em 1 de julho\n  Nivel: COMPROMISSO, obrigacao externa com data firme\n\nNEXT (direcao provavel)\n- Tema: previsao de meses magros\n  Em descoberta: teste com 40 usuarios em maio\n  Nivel: APOSTA, janela definida apos o teste\n- Tema: separacao de gasto pessoal e de trabalho\n  Por que: alimenta a previsao de meses magros\n\nLATER (sujeito a validacao)\n- Tema: relacionamento com o contador do autonomo\n  Condicao: depende do resultado do teste de maio\n- Tema: credito pelo fluxo de caixa\n  Condicao: licenca e retencao D30 acima de 45%",
                },
                {
                    type: "table",
                    value: '[["Horizonte","Tema","Métrica que ele move","Nível de compromisso"],["Now","Motivo semanal para voltar","Uso semanal e retenção D30","Janela do segundo trimestre"],["Now","Regra nova do carnê","Nenhuma: obrigação externa","Compromisso com data firme"],["Next","Previsão de meses magros","Retenção D30 do segmento","Aposta, com teste em maio"],["Later","Relação com o contador","Indicação e conversão","Aposta sem data definida"],["Later","Crédito pelo fluxo de caixa","Receita nova","Aposta, revisita em outubro"]]',
                },
                {
                    type: "quote",
                    value: "Um roadmap com um único compromisso de data e o resto declarado como janela ou aposta não é vago: é o mais honesto que o time consegue ser.",
                },
                {
                    type: "text",
                    value: "## A versão executiva em cinco minutos\n\nO recorte executivo é a tabela acima, mais três linhas de risco e uma decisão pedida. Nada de escopo, nada de estimativa em pontos, nada de nome de tela. A leitura que o diretor precisa fazer em cinco minutos é esta: existem dois temas em execução, um deles com data firme porque a lei manda, o resto está declarado como aposta com marco de aprendizado, e o número que dirá se a estratégia está funcionando é o uso semanal do segmento.\n\nO recorte de vendas parte do mesmo documento e corta mais: temas de valor na linguagem do cliente, apenas a data de julho, que é compromisso real, e nenhuma menção às apostas do LATER. O recorte do time expande na direção oposta, com a evidência por trás de cada tema, a medida de sucesso e as fronteiras de escopo.\n\nTrês zooms, uma fonte. Quando o teste de maio devolver resultado, a mudança aparece nos três recortes na mesma semana, com o mesmo porquê registrado em uma linha: data, movimento, motivo. É esse registro, e não o desenho das colunas, que mantém o roadmap vivo depois do terceiro mês.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que a regra nova do carnê entra como compromisso com data firme?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque existe obrigação externa com data marcada",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o time já estimou o esforço com precisão",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o executivo pediu uma data na última reunião",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o tema está no horizonte mais próximo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a coluna Later comunica no roadmap do Financem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aposta que depende de validação, sem data firme",
                            isCorrect: true,
                        },
                        {
                            text: "Entrega garantida para o fim do ano corrente",
                            isCorrect: false,
                        },
                        {
                            text: "Trabalho já iniciado por um time paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "Itens recusados que ficam registrados à parte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A previsão de meses magros está em Next com teste marcado. Como responder a vendas quando perguntam a data?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dar o marco do teste e a data da próxima leitura",
                            isCorrect: true,
                        },
                        {
                            text: "Dar uma data com margem dobrada de segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Dizer que produto digital não trabalha com datas",
                            isCorrect: false,
                        },
                        {
                            text: "Repassar a pergunta para o time de engenharia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o recorte executivo deve trazer de cada tema do roadmap?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A métrica que ele move e o nível de compromisso",
                            isCorrect: true,
                        },
                        {
                            text: "O detalhe de escopo e as estimativas em pontos",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de pessoas alocadas em cada iniciativa",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico de todas as versões anteriores do plano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em maio, o teste da previsão de meses magros mostrou 62% de uso semanal entre os 40 participantes. O que acontece no roadmap?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sobe para Now com janela e o motivo registrado",
                            isCorrect: true,
                        },
                        {
                            text: "Vira compromisso com data firme para o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Permanece em Next até o trimestre seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "Desce para Later, porque a amostra é pequena",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O one-pager final",
            blocks: [
                {
                    type: "text",
                    value: "# A estratégia inteira em uma página\n\nAs quatro aulas anteriores produziram peças soltas. Esta as junta no formato que a trilha vem construindo desde o primeiro módulo: uma página com diagnóstico, aposta, OKRs, roadmap e riscos. A restrição de tamanho não é estética. Cinco seções em uma página obrigam cada frase a fazer trabalho, e é justamente a impossibilidade de encher linguiça que expõe as escolhas que não foram feitas.\n\nUm leitor externo deve conseguir responder cinco perguntas em cinco minutos: qual é o desafio central, qual é a aposta, o que ficou de fora, como saberemos que está funcionando e o que derrubaria o plano. Se qualquer uma delas exigir uma reunião de explicação, o documento ainda não está pronto.\n\nRepare, ao ler o quadro a seguir, na costura entre as seções. O diagnóstico nomeia a ausência de valor semanal; a aposta escolhe o ciclo semanal do autônomo; o KR principal mede uso semanal; o tema do NOW se chama motivo semanal para voltar; o risco declarado é justamente a premissa de que valor semanal move retenção. A mesma ideia atravessa as cinco seções, e essa é a definição prática de coerência.",
                },
                {
                    type: "code",
                    value: "FINANCEM: ESTRATEGIA DE PRODUTO (uma pagina, revisao 05/04)\n\n1. DIAGNOSTICO\nO produto resolve uma vez e nao devolve valor novo: retencao\nD30 de 18%. O autonomo de servicos e a excecao (34% de\nretencao, 30% de conversao) porque a decisao dele se repete\ntoda semana. O gargalo e a ausencia de motivo semanal.\n\n2. APOSTA (politica orientadora)\nConcentrar o produto no ciclo semanal de caixa do autonomo\nde servicos ate sermos a escolha obvia desse publico.\nNAO neste ano: versao PJ (revisita em outubro) e credito\n(revisita quando a retencao D30 passar de 45%).\n\n3. OKR DO TRIMESTRE\nObjetivo: fazer o autonomo voltar toda semana porque o\nFinancem decide com ele.\nKR1 Retencao D30 do segmento:       34% para 45%\nKR2 Uso semanal (3 em 4 semanas):   21% para 35%\nKR3 Conversao para pago:            30% para 38%\nGuarda: NPS do segmento nao abaixo de 45.\n\n4. ROADMAP\nNOW   motivo semanal (janela do 2o trimestre); regra do\n      carne (compromisso, data firme de 1 de julho)\nNEXT  previsao de meses magros (teste com 40 usuarios em maio)\nLATER contador; credito pelo fluxo de caixa\n\n5. RISCOS E PREMISSAS\nPremissa: valor semanal move retencao. Cai se o teste de\nmaio ficar abaixo de 30% de uso semanal.\nRisco: perder a janela PJ em 2026. Mitigacao: revisita de\noutubro com o dado de saturacao do segmento.\nRisco: dependencia de um unico segmento. Mitigacao: medir\ntodo mes o teto de crescimento organico do nicho.",
                },
                {
                    type: "table",
                    value: '[["Seção","Pergunta de qualidade","Resposta no documento"],["Diagnóstico","Explica a causa ou repete o sintoma?","Explica: ausência de motivo semanal"],["Aposta","Existe pelo menos um não com data?","Dois: PJ e crédito, com revisita marcada"],["OKR","Os KRs medem resultado ou entrega?","Resultado: retenção, hábito e conversão"],["Roadmap","Cada item declara o compromisso?","Sim: compromisso, janela ou aposta"],["Riscos","Está escrito o que derruba o plano?","Sim: teste de maio abaixo de 30%"]]',
                },
                {
                    type: "quote",
                    value: "Documento de estratégia bom não é o que convence na apresentação: é o que continua respondendo perguntas quando você não está na sala para defendê-lo.",
                },
                {
                    type: "text",
                    value: "## O que este documento prova\n\nUm one-pager como esse é uma peça de portfólio incomum, porque mostra raciocínio em vez de tela bonita. Quem o lê consegue ver como você lê números (o par aquisição subindo com base parada), como escolhe (o segmento que já retém, contra dois mercados maiores), como recusa (com condição de revisita, não com porta fechada), como mede (resultado em camadas, com guarda) e como comunica incerteza (um compromisso de data, o resto declarado como janela ou aposta).\n\nRefazer o exercício com um produto real, seu ou de uma empresa que você conhece de fora, é o passo natural. Os dados serão piores e mais confusos que os do Financem, e é exatamente aí que a técnica se prova: escrever o desafio central com informação incompleta, apostar assumindo o custo dos nãos e declarar a premissa que, se cair, derruba o plano inteiro.\n\nDo diagnóstico à influência, o percurso desta trilha foi um só argumento: estratégia é a soma de escolhas que alguém assinou, medidas por números que ninguém maquiou e comunicadas até virarem vocabulário comum. O documento é só o lugar onde essas três coisas ficam visíveis ao mesmo tempo, e revisáveis quando a realidade mudar.",
                },
            ],
            questions: [
                {
                    statement: "Quais seções compõem o one-pager final do Financem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Diagnóstico, aposta, OKR, roadmap e riscos",
                            isCorrect: true,
                        },
                        {
                            text: "Missão, visão, valores e metas anuais",
                            isCorrect: false,
                        },
                        {
                            text: "Personas, jornadas, wireframes e testes",
                            isCorrect: false,
                        },
                        {
                            text: "Backlog, sprints, releases e retrospectivas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a seção de riscos e premissas precisa deixar explícito?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Qual evidência derrubaria o plano proposto",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de bugs conhecidos do produto hoje",
                            isCorrect: false,
                        },
                        {
                            text: "O orçamento reservado para imprevistos",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do responsável por cada entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como um leitor externo confere em poucos minutos se a aposta é real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Procura os nãos e a data de reavaliação deles",
                            isCorrect: true,
                        },
                        {
                            text: "Confere o número de páginas do documento todo",
                            isCorrect: false,
                        },
                        {
                            text: "Verifica quem assinou a aprovação do documento",
                            isCorrect: false,
                        },
                        {
                            text: "Conta quantas iniciativas foram listadas no plano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que liga o roadmap do documento ao diagnóstico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada tema ataca a ausência de valor semanal",
                            isCorrect: true,
                        },
                        {
                            text: "Cada tema tem uma data firme de entrega definida",
                            isCorrect: false,
                        },
                        {
                            text: "Cada tema pertence a um time diferente da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Cada tema foi votado pelos clientes mais antigos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um leitor aponta que o OKR não cita a meta de dobrar a receita pedida pelo conselho. Como você defende o documento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os KRs medem o que o time move e leva à receita",
                            isCorrect: true,
                        },
                        {
                            text: "A meta do conselho não vale para times de produto",
                            isCorrect: false,
                        },
                        {
                            text: "A receita entra apenas no relatório do financeiro",
                            isCorrect: false,
                        },
                        {
                            text: "O OKR não deve conter números vindos da diretoria",
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
