// Seed da trilha Produto na Prática, estagio 6 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-produto-na-pratica.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Produto na Prática";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Do plano ao mercado: go-to-market e lançamento por fases com feature flags, growth loops com ativação e retenção como fundação, monetização e testes de preço com cuidado, o produto técnico que conversa de igual com engenharia, a IA no trabalho de produto em 2026 e a carreira fechando com um case completo de portfólio.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Do plano ao lançamento",
    aulas: [
        {
            titulo: "Go-to-market sem mistério",
            blocks: [
                {
                    type: "text",
                    value: '# O produto não termina no deploy\n\nGo-to-market (GTM) é o plano de como o produto chega em quem precisa dele. Muita gente de tecnologia trata isso como assunto de marketing e descobre tarde demais que construiu bem e não entregou para ninguém. A conta é dura: um produto que o usuário não encontra, não entende ou não confia rende exatamente zero, e os seis meses de engenharia foram gastos do mesmo jeito.\n\nO GTM básico tem quatro peças que se sustentam. PROPOSTA: qual problema você resolve e por que a sua solução. PÚBLICO: para quem, no recorte mais estreito que ainda faz sentido comercial. CANAL: por onde essa pessoa vai te encontrar. MENSAGEM: as palavras em que ela reconhece a própria dor. Mexer numa peça obriga a revisar as outras, porque trocar de público quase sempre troca o canal e sempre troca a mensagem.\n\nNo Financem, o app de finanças para autônomos que acompanha esta trilha, a proposta é saber quanto dá para gastar sem comprometer o imposto do mês. O público inicial é o prestador de serviço que já emite nota. O canal são comunidades de MEI e parcerias com contadores. E a mensagem fala do susto no fim do mês, não de "gestão financeira integrada".',
                },
                {
                    type: "table",
                    value: '[["Peça","Pergunta que responde","Erro comum","No Financem"],["Proposta","Que dor resolvemos e por que nós","Descrever a feature no lugar da dor","Gastar sem comprometer o imposto"],["Público","Para quem, no recorte mais estreito","Responder que serve para todo mundo","Autônomo que já emite nota"],["Canal","Onde essa pessoa já está hoje","Escolher o canal da moda do ano","Comunidades de MEI e contadores"],["Mensagem","Que palavras ela reconhece","Falar a língua interna do time","Sem susto no fim do mês"]]',
                },
                {
                    type: "quote",
                    value: "Produto bom que ninguém encontra é, para o negócio, indistinguível de produto que nunca foi construído.",
                },
                {
                    type: "text",
                    value: "## O GTM entra no discovery, não na véspera\n\nO erro mais caro é tratar o lançamento como etapa que começa quando o código fica pronto. Quem só pensa em canal na semana da subida descobre que o canal escolhido tem ciclo de dois meses, que a mensagem não sobrevive ao primeiro teste com usuário e que a página de entrada depende de um texto que ninguém escreveu. Nada disso é azar: é planejamento faltando.\n\nEm time pequeno, o PM escreve a primeira versão do GTM sozinho e revisa com quem chegar (marketing, vendas, suporte). Em time grande existe gente dedicada, e o papel do PM muda de autor para guardião: garantir que a promessa da campanha é a promessa que o produto cumpre. Campanha que promete mais do que o produto entrega gera cadastro e cancelamento na mesma semana, e ainda queima a confiança para a próxima tentativa.\n\nUm sinal prático de GTM saudável: você responde de cabeça quem é a primeira pessoa que deveria usar isso, onde ela está e qual frase faria ela clicar. Se qualquer uma das três respostas sair vaga, o lançamento vai depender de sorte, e sorte não entra em plano nenhum.",
                },
            ],
            questions: [
                {
                    statement: "O que o go-to-market descreve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O plano de como o produto chega em quem precisa dele",
                            isCorrect: true,
                        },
                        {
                            text: "O cronograma de sprints até a entrega da primeira versão",
                            isCorrect: false,
                        },
                        {
                            text: "A arquitetura escolhida para o produto aguentar escala",
                            isCorrect: false,
                        },
                        {
                            text: "O documento de requisitos aprovado pelos stakeholders",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as quatro peças básicas de um GTM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A proposta, o público, o canal e a mensagem",
                            isCorrect: true,
                        },
                        {
                            text: "Escopo, prazo, custo e qualidade do que será feito",
                            isCorrect: false,
                        },
                        {
                            text: "Visão, missão, valores e cultura da empresa toda",
                            isCorrect: false,
                        },
                        {
                            text: "Backlog, sprint, review e retrospectiva do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que trocar o público obriga a revisar o resto do GTM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque outro público está em outro canal e outra linguagem",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o marketing precisa aprovar formalmente a mudança",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o preço do produto precisa ser recalculado por lei",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a engenharia precisa reescrever toda a arquitetura do app",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em time grande, com gente dedicada a marketing, qual vira o papel do PM no GTM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Garantir que a campanha promete o que o produto cumpre",
                            isCorrect: true,
                        },
                        {
                            text: "Escrever pessoalmente os anúncios e as peças de campanha",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovar o orçamento de mídia e negociar com os veículos",
                            isCorrect: false,
                        },
                        {
                            text: "Assumir a meta de vendas do trimestre no lugar do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time só começou a pensar em canal na semana do lançamento. Qual é a consequência mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Descobrir tarde que o canal escolhido tem ciclo longo demais",
                            isCorrect: true,
                        },
                        {
                            text: "Perder o direito de usar o canal por falta de contrato prévio",
                            isCorrect: false,
                        },
                        {
                            text: "Precisar refazer a arquitetura para aguentar o pico de acessos",
                            isCorrect: false,
                        },
                        {
                            text: "Ter que adiar o deploy até o time de dados liberar o painel",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Lançamento por fases",
            blocks: [
                {
                    type: "text",
                    value: "# Ninguém abre a porta para todo mundo de uma vez\n\nLançar tudo para toda a base no mesmo dia é a forma mais cara de descobrir um problema. O caminho maduro abre o produto em fases, e cada fase existe para caçar um tipo diferente de erro enquanto ele ainda é barato.\n\nA sequência clássica tem quatro degraus. INTERNO (dogfooding): o próprio time usa e encontra o absurdo óbvio, o botão que não funciona, o texto errado. BETA FECHADO com allowlist: um grupo escolhido a dedo, com contato direto, que topa conviver com aspereza em troca de acesso antecipado. BETA ABERTO: qualquer pessoa entra, mas sob o rótulo de beta, o que ajusta a expectativa e libera o time para errar. GERAL: o produto vira promessa pública, com suporte, documentação e SLA.\n\nO detalhe que separa o processo do teatro é o CRITÉRIO DE PASSAGEM. Antes de abrir a fase, você escreve o que precisa ser verdade para avançar: nenhum bug crítico aberto por cinco dias, taxa de conclusão do fluxo principal acima de um patamar, tempo de resposta dentro do alvo, volume de contatos no suporte abaixo do limite. Sem critério escrito antes, a decisão de avançar vira debate de opinião na véspera, e ganha quem fala mais alto ou quem tem a data mais apertada na agenda.",
                },
                {
                    type: "table",
                    value: '[["Fase","Quem entra","O que você aprende","Critério para passar"],["Interno","O próprio time e áreas vizinhas","Erros grosseiros e textos ruins","Fluxo principal completo sem travar"],["Beta fechado","Grupo escolhido por allowlist","Uso real com contato direto","Sem bug crítico aberto e feedback digerido"],["Beta aberto","Quem quiser, avisado do risco","Comportamento em escala e arestas","Métrica de ativação e carga dentro do alvo"],["Geral","Toda a base e o público novo","O produto como promessa pública","Suporte, documentação e plano de reversão"]]',
                },
                {
                    type: "quote",
                    value: "Cada fase existe para descobrir, barato, um problema que na fase seguinte custaria caro demais.",
                },
                {
                    type: "text",
                    value: "## Os dois jeitos de estragar as fases\n\nO primeiro é a FASE ETERNA. O beta entra no segundo ano, ninguém quer assumir a decisão de abrir, o time acumula duas versões do produto para manter e o usuário aprende que aquele rótulo não significa nada. Quando isso acontece, o problema raramente é técnico: é falta de critério escrito e de alguém com autoridade para dizer que o critério foi atingido.\n\nO segundo é PULAR FASE por pressão de data. A feira do setor é semana que vem, a diretoria quer anunciar, e o beta fechado de duas semanas vira dois dias. Não existe proibição absoluta aqui, existe conta: pular uma fase é aceitar conscientemente um risco. A pergunta honesta é o que você faria se o pior acontecesse com a base inteira dentro, e se a resposta for aceitável, siga.\n\nNo Financem, a regra que funcionou foi simples. Cada fase tem dono, data máxima e critério numérico escrito antes de abrir. Se a data chega e o critério não fecha, a fase estende com uma justificativa curta e registrada, em vez de escorregar em silêncio por mais um mês.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ordem clássica das fases de lançamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Interno, beta fechado, beta aberto e geral",
                            isCorrect: true,
                        },
                        {
                            text: "Geral, beta aberto, beta fechado e teste interno",
                            isCorrect: false,
                        },
                        {
                            text: "Beta aberto, interno, geral e depois beta fechado",
                            isCorrect: false,
                        },
                        {
                            text: "Beta fechado, geral, interno e por fim beta aberto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o beta fechado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um grupo escolhido por allowlist, com contato direto",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer pessoa da base entrando quando quiser, sem convite",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o time interno usando o produto no dia a dia",
                            isCorrect: false,
                        },
                        {
                            text: "O produto no ar com suporte completo e SLA firmado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o critério de passagem precisa ser escrito antes de abrir a fase?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para a decisão não virar debate de opinião na véspera",
                            isCorrect: true,
                        },
                        {
                            text: "Para o time de auditoria liberar o lançamento formalmente",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o critério antigo perde validade a cada nova fase",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a lei brasileira exige registro de cada etapa do beta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o problema de um beta que já dura dois anos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O rótulo perde sentido e o time mantém duas versões",
                            isCorrect: true,
                        },
                        {
                            text: "O provedor de nuvem cobra taxa extra por ambiente beta",
                            isCorrect: false,
                        },
                        {
                            text: "O código do beta expira e precisa ser reescrito do zero",
                            isCorrect: false,
                        },
                        {
                            text: "A base de usuários é apagada automaticamente após um ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A diretoria quer anunciar na feira e o beta fechado encolheu de duas semanas para dois dias. Qual é a leitura profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pular fase é aceitar um risco explícito, não um detalhe",
                            isCorrect: true,
                        },
                        {
                            text: "A antecipação é sempre inaceitável e deve ser recusada",
                            isCorrect: false,
                        },
                        {
                            text: "Datas de mercado dispensam qualquer critério de passagem",
                            isCorrect: false,
                        },
                        {
                            text: "O risco desaparece porque a feira traz usuários avançados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Feature flags e rollout gradual",
            blocks: [
                {
                    type: "text",
                    value: "# Deploy não é lançamento\n\nA ideia mais libertadora do lançamento moderno é separar duas coisas que a intuição junta: subir o código e ligar a funcionalidade. Feature flag é uma chave no código que decide, em tempo de execução, se aquele caminho existe para aquele usuário. Com ela, o time integra todo dia, sobe o código desligado e escolhe o momento de acender, sem depender de uma janela noturna heroica.\n\nPara o PM, isso muda o vocabulário do dia a dia. Você para de perguntar quando sobe e passa a perguntar para quem já está ligado. A liberação vira gradual: 1% dos usuários, 5%, 25%, 100%, observando métrica a cada degrau. É o canário do produto, primo direto do canário de infraestrutura: um grupo pequeno experimenta primeiro, e se o indicador piora, você fecha a chave.\n\nO KILL SWITCH é o caso extremo e o mais valioso numa noite ruim. Desligar uma flag leva segundos e não pede build, deploy nem aprovação de release. Comparado com reverter um deploy sob pressão, com o time acordado às duas da manhã, a diferença é entre um susto e um incidente. Quem já viveu os dois lados não abre mão da chave.",
                },
                {
                    type: "table",
                    value: '[["Tipo de flag","Para que serve","Vida útil","Quem decide ligar"],["Release","Esconder o que ainda não estreou","Curta, até o lançamento","Produto, com o time"],["Experimento","Dividir usuários em variantes","O tempo do teste","Produto e dados"],["Operacional","Desligar carga em pico ou falha","Permanente","Engenharia de plantão"],["Permissão","Liberar por plano ou cliente","Permanente","Regra de negócio"]]',
                },
                {
                    type: "quote",
                    value: "Uma flag que você não sabe quem liga, quando desliga e quando morre já deixou de ser controle e virou dívida.",
                },
                {
                    type: "code",
                    value: 'flag: "extrato-preditivo"\ntipo: release\ndono: produto\nregras:\n  - allowlist: ["beta-fechado"]        # fase 1\n  - percentual: 5                      # fase 2, canario\n  - percentual: 25                     # fase 3\n  - percentual: 100                    # fase 4, geral\nkill_switch: true\nmetricas_de_guarda:\n  - ativacao_do_fluxo >= 0.35\n  - erro_5xx <= 0.5%\n  - p95_ms <= 1200\nremover_ate: "2026-09-30"',
                },
                {
                    type: "text",
                    value: "## O preço da liberdade: a dívida de flags\n\nFlag é barata de criar e cara de esquecer. Cada uma vira um caminho a mais no código, e o produto que acumula quarenta flags esquecidas tem, na prática, um número absurdo de combinações possíveis que ninguém testa. O bug que aparece em produção e não reproduz em lugar nenhum costuma morar exatamente aí.\n\nA disciplina é chata e funciona: toda flag de release nasce com data de remoção e dono. Quando a funcionalidade vira o comportamento padrão para todo mundo, a chave sai do código na sprint seguinte, não algum dia. Flags de permissão e operacionais são permanentes por natureza, e essas ficam, com nome claro e documentação de quem pode mexer.\n\nO PM tem um papel específico aqui, e ele é impopular. A limpeza de flags nunca vai ganhar de uma feature nova na disputa por prioridade se a decisão for por empolgação. Reserve espaço para ela como parte do custo de lançar assim, do mesmo jeito que se reserva tempo de teste. Você escolheu a liberdade de ligar e desligar quando quiser, e essa liberdade tem manutenção.",
                },
            ],
            questions: [
                {
                    statement: "O que uma feature flag permite fazer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Subir o código com a funcionalidade ainda desligada",
                            isCorrect: true,
                        },
                        {
                            text: "Acelerar o build do projeto removendo etapas do deploy",
                            isCorrect: false,
                        },
                        {
                            text: "Traduzir a interface automaticamente para outros idiomas",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir os testes automatizados na esteira de entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve um kill switch?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Desligar a funcionalidade em segundos, sem novo deploy",
                            isCorrect: true,
                        },
                        {
                            text: "Apagar os dados gerados pela funcionalidade com problema",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear o acesso de usuários que abusaram do recurso",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar o contrato com o provedor de nuvem em emergência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o canário de produto num rollout gradual?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Liberar para uma fatia pequena e observar as métricas",
                            isCorrect: true,
                        },
                        {
                            text: "Manter um ambiente de testes idêntico ao de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Convidar usuários avançados para uma reunião de feedback",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar a suíte de testes automatizados antes de cada deploy",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que flags esquecidas viram dívida técnica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada uma multiplica caminhos que ninguém testa de verdade",
                            isCorrect: true,
                        },
                        {
                            text: "Cada flag ativa consome uma licença paga da ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Flags antigas deixam de funcionar depois de alguns meses",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor cobra por chamada de leitura de cada uma delas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A funcionalidade virou padrão para 100% da base há três meses e a flag continua no código. O que deveria acontecer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Remover a flag, porque ela já nasceu com data de morte",
                            isCorrect: true,
                        },
                        {
                            text: "Manter para sempre, já que desligar pode ser útil um dia",
                            isCorrect: false,
                        },
                        {
                            text: "Converter em flag de permissão para justificar a existência",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar como está, pois flag parada não afeta o sistema",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O checklist de lançamento",
            blocks: [
                {
                    type: "text",
                    value: "# O que precisa estar pronto antes de acender a chave\n\nChecklist de lançamento não é burocracia: é a memória escrita dos erros que o time já cometeu. Toda linha de um bom checklist existe porque, num lançamento anterior, alguém esqueceu exatamente aquilo e o preço apareceu depois. É por isso que checklist copiado da internet vale pouco e checklist do seu time vale muito.\n\nQuatro blocos aparecem em qualquer versão decente. INSTRUMENTAÇÃO PRONTA: os eventos que medem o sucesso já estão implantados e testados antes de o primeiro usuário entrar, porque dado que começa a ser coletado depois não conta a história do começo. SUPORTE AVISADO: quem atende o cliente sabe o que mudou, com que palavras responder e para onde escalar. PLANO DE ROLLBACK: como voltar atrás, quem tem autoridade para mandar voltar e o que acontece com os dados criados no meio. MÉTRICAS DEFINIDAS ANTES: qual número diz que deu certo e qual número interrompe o rollout.\n\nA parte mais violada é a última. Definir a métrica depois de ver o resultado é o convite perfeito para escolher o número que confirma a decisão que você já tinha tomado, e todo mundo faz isso sem perceber que está fazendo.",
                },
                {
                    type: "code",
                    value: "CHECKLIST DE LANCAMENTO (Financem, extrato preditivo)\n\n[ ] Metrica de sucesso escrita e combinada: ativacao do fluxo >= 35% em 7 dias\n[ ] Metrica de guarda (interrompe o rollout): erro 5xx > 1% ou p95 > 1.5s\n[ ] Eventos instrumentados, testados em staging e visiveis no painel\n[ ] Painel de acompanhamento criado e compartilhado com o time\n[ ] Feature flag criada, com dono, allowlist e kill switch testado\n[ ] Plano de rollback escrito: quem decide, como volta, o que vira dos dados\n[ ] Suporte treinado: o que mudou, respostas prontas, caminho de escalonamento\n[ ] Textos, ajuda e FAQ publicados e revisados\n[ ] Aviso legal e privacidade revisados quando ha dado novo coletado\n[ ] Comunicado combinado: quem publica, onde e em que horario\n[ ] Janela escolhida: nao lancar na sexta a tarde nem na vespera de feriado\n[ ] Responsavel de plantao definido para as primeiras 48 horas",
                },
                {
                    type: "quote",
                    value: "Métrica escolhida depois do resultado não mede nada: ela só confirma a decisão que você já tinha tomado.",
                },
                {
                    type: "table",
                    value: '[["Item","Quem garante","Como se verifica","Se faltar"],["Instrumentação","Produto com engenharia","Evento visível no painel de staging","Semana 1 vira cega"],["Suporte avisado","Produto com suporte","Roteiro de resposta publicado","Cliente ensina o atendente"],["Plano de rollback","Engenharia","Ensaio da reversão em ambiente","Decisão sob pânico às 2h"],["Métrica definida","Produto","Número e prazo escritos antes","Resultado interpretado a gosto"]]',
                },
                {
                    type: "text",
                    value: "## Quem assina e quando parar\n\nUm checklist sem dono vira lista de desejos. Cada linha precisa de um nome ao lado, e o PM costuma ser o dono das linhas de métrica, comunicação e suporte, enquanto engenharia responde por instrumentação, flag e reversão. O ritual que funciona é curto: quinze minutos na véspera, todo mundo junto, item por item, com autorização de dizer que não está pronto.\n\nE existe o direito de parar. Se um item crítico está aberto na hora do go, adiar é uma decisão profissional, não uma falha pessoal. O custo de adiar um dia é conhecido e pequeno; o custo de lançar sem rollback é desconhecido e potencialmente enorme. Time que nunca adia um lançamento provavelmente não está checando de verdade.\n\nSobre a janela: sexta à tarde e véspera de feriado continuam sendo más ideias em 2026, pelo motivo mais banal do mundo. Não é superstição, é disponibilidade de gente. O problema aparece quando quem sabe consertar já viajou, e aí um incidente de trinta minutos vira um fim de semana inteiro de produto quebrado.",
                },
            ],
            questions: [
                {
                    statement: "Por que a instrumentação precisa estar pronta antes do lançamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dado coletado depois não conta a história do começo",
                            isCorrect: true,
                        },
                        {
                            text: "Porque instrumentar depois exige um novo contrato de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o painel só aceita eventos criados no mesmo mês",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a ferramenta de análise cobra mais por evento novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o plano de rollback precisa deixar claro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem decide voltar, como volta e o que vira dos dados",
                            isCorrect: true,
                        },
                        {
                            text: "O valor exato do prejuízo estimado em caso de falha grave",
                            isCorrect: false,
                        },
                        {
                            text: "A data do próximo lançamento depois da reversão do atual",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do responsável pelo erro que motivou a reversão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que definir a métrica de sucesso depois de ver o resultado é um problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Você acaba escolhendo o número que confirma a sua decisão",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta de análise bloqueia métricas criadas depois",
                            isCorrect: false,
                        },
                        {
                            text: "O cálculo retroativo perde precisão por falta de amostra",
                            isCorrect: false,
                        },
                        {
                            text: "A área financeira não aceita indicador definido fora do plano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve uma métrica de guarda no lançamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Definir o número que interrompe o rollout antes da hora",
                            isCorrect: true,
                        },
                        {
                            text: "Comparar o desempenho do produto com o dos concorrentes",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar quantas pessoas viram o comunicado de lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Estimar a receita adicional que a funcionalidade vai gerar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na reunião de go, o plano de rollback ainda não foi escrito, mas a data já foi anunciada. Qual é a postura profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Adiar, porque o custo de um dia é menor que o do escuro",
                            isCorrect: true,
                        },
                        {
                            text: "Lançar assim mesmo, já que o anúncio público criou compromisso",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar apenas para metade da base sem combinar mais nada",
                            isCorrect: false,
                        },
                        {
                            text: "Delegar a decisão ao time de engenharia e seguir o calendário",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A primeira semana depois do lançamento",
            blocks: [
                {
                    type: "text",
                    value: "# Os sete dias em que o produto responde\n\nO lançamento é o começo do trabalho, não o fim. Na primeira semana chegam os dados que nenhum discovery entrega, porque agora existe gente de verdade usando o produto de verdade, com pressa, distração e contexto que você não previu.\n\nA ordem de leitura importa. Comece pela SAÚDE: erro, latência, fila, custo de infraestrutura. Se isso está ruim, nada mais interessa. Depois olhe a ADOÇÃO: quantos entraram e quantos chegaram ao valor. Em seguida a QUALIDADE do uso: onde as pessoas param no fluxo, o que repetem, o que abandonam. E só então a opinião: tíquetes de suporte, avaliações, mensagens em comunidade.\n\nCuidado com dois enganos que aparecem sempre. O primeiro é o efeito novidade: o pico dos primeiros dias mistura curiosidade com necessidade, e a curva sempre cai depois. O segundo é o viés dos barulhentos: cinco mensagens raivosas parecem representar a base inteira, e quase nunca representam. Contraponha o volume do suporte com o total de usuários ativos antes de reescrever o roadmap por causa de um post.",
                },
                {
                    type: "table",
                    value: '[["Sinal","O que costuma significar","Reação adequada"],["Erro e latência acima do alvo","Problema técnico com o volume real","Segurar o rollout e corrigir"],["Muitos entram e poucos concluem","Fricção no meio do fluxo","Investigar a etapa e iterar"],["Poucos entram e quem entra conclui","Problema de descoberta ou mensagem","Ajustar comunicação e entrada"],["Uso alto e suporte calmo","O fluxo está claro para o público","Seguir o plano de rollout"],["Queda após o pico inicial","Efeito novidade se dissipando","Esperar a curva estabilizar"]]',
                },
                {
                    type: "quote",
                    value: "Reverter não é derrota: é a decisão certa quando o custo de insistir cresce mais rápido que o aprendizado.",
                },
                {
                    type: "text",
                    value: "## Iterar ou reverter\n\nA pergunta difícil da semana é essa, e ela tem critério. Você ITERA quando o problema é de ajuste: um texto confuso, um passo a mais no fluxo, um limite mal escolhido. O caminho está certo, a execução precisa de lixa, e cada ajuste move a métrica na direção esperada.\n\nVocê REVERTE quando o problema é estrutural: o produto quebra dado, gera risco para o usuário, derruba uma métrica que importava mais do que a que você tentava melhorar, ou simplesmente ninguém quer aquilo. Reverter cedo é barato e devolve tempo; insistir por orgulho custa semanas e ainda envenena a leitura do que aconteceu.\n\nFeche a semana com um registro curto, três parágrafos bastam: o que esperávamos, o que aconteceu, o que faremos. Guarde junto os números do dia 1 e do dia 7. Daqui a seis meses, quando alguém propuser a mesma ideia com outro nome, esse texto vai valer mais que a memória de qualquer pessoa da sala, inclusive a sua.",
                },
            ],
            questions: [
                {
                    statement: "Qual sinal deve ser lido primeiro na semana pós-lançamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Saúde do sistema: erro, latência, fila e custo",
                            isCorrect: true,
                        },
                        {
                            text: "As avaliações publicadas nas lojas de aplicativos",
                            isCorrect: false,
                        },
                        {
                            text: "O número de menções da marca em redes sociais",
                            isCorrect: false,
                        },
                        {
                            text: "A receita adicional apurada pelo time financeiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o efeito novidade nos primeiros dias?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um pico de uso por curiosidade que depois se dissipa",
                            isCorrect: true,
                        },
                        {
                            text: "A queda de desempenho causada pelo excesso de acessos",
                            isCorrect: false,
                        },
                        {
                            text: "O aumento de erros provocado por código recém subido",
                            isCorrect: false,
                        },
                        {
                            text: "A demora do usuário para achar a funcionalidade nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Muitos usuários entram no fluxo novo e poucos concluem. O que isso costuma indicar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Existe fricção no meio do caminho até o valor",
                            isCorrect: true,
                        },
                        {
                            text: "A mensagem de divulgação atraiu o público errado",
                            isCorrect: false,
                        },
                        {
                            text: "O servidor está lento e derruba a sessão dos usuários",
                            isCorrect: false,
                        },
                        {
                            text: "A funcionalidade resolve um problema que não existia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Cinco mensagens raivosas chegaram no suporte. Como avaliar o peso disso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comparar o volume com o total de usuários ativos",
                            isCorrect: true,
                        },
                        {
                            text: "Priorizar imediatamente, porque quem reclama representa a base",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar, porque reclamação em suporte é sempre exagerada",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar chegar a cem mensagens antes de olhar o assunto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando reverter é melhor do que iterar depois de um lançamento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quando o problema é estrutural e não de ajuste fino",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a primeira semana não bateu a meta do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Quando algum usuário influente criticou em público",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o time perdeu o interesse pelo tema no meio do caminho",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Growth e ciclos",
    aulas: [
        {
            titulo: "Funil vaza, loop realimenta",
            blocks: [
                {
                    type: "text",
                    value: '# Duas formas de pensar o crescimento\n\nO funil é a imagem mais conhecida do crescimento: entra muita gente no topo, uma parte vira usuário, uma parte menor vira cliente. Ele é útil para diagnosticar onde o produto perde pessoas, e você aprendeu a usá lo com o AARRR. O problema é que o funil, sozinho, é uma máquina de gastar: cada novo usuário exige uma nova dose de esforço no topo, e no dia em que a verba acaba, a entrada acaba junto.\n\nO LOOP é a outra forma de olhar. Nele, a saída de um ciclo alimenta a entrada do seguinte: o usuário que chega faz algo que traz o próximo usuário, e o crescimento passa a ter memória. A pergunta muda de "quantos entraram este mês" para "cada usuário que entra devolve quanto de entrada para o sistema".\n\nTrês loops aparecem com mais frequência. CONTEÚDO: o uso do produto gera páginas que trazem busca orgânica, que traz mais uso. VIRAL: usar o produto expõe outra pessoa a ele, por convite, colaboração ou marca visível no que foi produzido. PAGO: a receita do usuário adquirido financia a aquisição do próximo, e o loop só fecha se o retorno vier antes do caixa acabar.',
                },
                {
                    type: "table",
                    value: '[["Aspecto","Funil","Loop"],["Formato","Linha com etapas e perdas","Ciclo em que a saída volta para a entrada"],["Pergunta central","Onde estamos perdendo gente","O que cada usuário devolve ao sistema"],["Dependência","Esforço novo a cada mês","O uso alimenta a próxima entrada"],["Risco típico","Parar de investir e parar de crescer","Loop lento demais para sustentar o negócio"],["Uso ideal","Diagnosticar as perdas do caminho","Desenhar crescimento que se sustenta"]]',
                },
                {
                    type: "quote",
                    value: "Funil responde onde você perde gente. Loop responde de onde vem a próxima. Um bom produto precisa das duas respostas.",
                },
                {
                    type: "text",
                    value: "## Nem todo produto tem loop viral, e tudo bem\n\nExiste uma pressão cultural para forçar viralidade em produtos que não têm nada de social. Um app de controle de impostos não é naturalmente compartilhável, e enfiar um convite artificial na tela só polui a experiência sem trazer ninguém. O loop precisa nascer do uso real, não do desejo do time.\n\nO caminho honesto é procurar qual loop o seu produto suporta. No Financem, o loop viral fraco é compensado por dois outros. O de CONTEÚDO funciona: dúvidas recorrentes de autônomos sobre imposto viram material que aparece na busca e traz gente com a dor exata. E existe um loop de PARCERIA: o contador que atende trinta clientes recomenda a ferramenta porque ela reduz o trabalho dele, e cada contador satisfeito entrega uma pequena leva de novos usuários.\n\nUm detalhe que separa amador de profissional: todo loop tem um tempo de ciclo. Um loop que fecha em três dias e outro que fecha em nove meses têm efeitos completamente diferentes no caixa, mesmo com o mesmo multiplicador. Antes de comemorar o desenho bonito no quadro, meça quanto tempo cada volta realmente leva.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença central entre funil e loop?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No loop, a saída de um ciclo alimenta a entrada seguinte",
                            isCorrect: true,
                        },
                        {
                            text: "No loop, as etapas são medidas com ferramentas mais caras",
                            isCorrect: false,
                        },
                        {
                            text: "No funil, o usuário passa por menos telas até a conversão",
                            isCorrect: false,
                        },
                        {
                            text: "No funil, só entram usuários pagantes desde o primeiro dia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um loop de conteúdo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O uso gera material que traz busca orgânica e mais uso",
                            isCorrect: true,
                        },
                        {
                            text: "A equipe publica um artigo por semana no blog da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "O produto envia notificações diárias para toda a base ativa",
                            isCorrect: false,
                        },
                        {
                            text: "O time compra anúncios em portais de conteúdo especializado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um funil sozinho é chamado de máquina de gastar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada novo usuário exige esforço novo no topo, sempre",
                            isCorrect: true,
                        },
                        {
                            text: "Porque medir cada etapa custa caro em ferramentas de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Porque as etapas intermediárias exigem times dedicados a elas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o funil só funciona com campanhas de mídia paga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que forçar um loop viral num produto pouco social costuma falhar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O loop precisa nascer do uso real, não do desejo do time",
                            isCorrect: true,
                        },
                        {
                            text: "Porque loops virais exigem aprovação prévia das lojas de app",
                            isCorrect: false,
                        },
                        {
                            text: "Porque convites por email são bloqueados pelos provedores hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Porque produtos pagos não podem oferecer convites gratuitos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois loops têm o mesmo multiplicador, mas um fecha em três dias e o outro em nove meses. O que muda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O tempo de ciclo muda o efeito no caixa e no crescimento",
                            isCorrect: true,
                        },
                        {
                            text: "Nada muda, porque o multiplicador é o que define o resultado",
                            isCorrect: false,
                        },
                        {
                            text: "O loop lento sempre gera usuários de qualidade muito melhor",
                            isCorrect: false,
                        },
                        {
                            text: "O loop rápido perde efeito porque satura o mercado em semanas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ativação como alavanca",
            blocks: [
                {
                    type: "text",
                    value: '# O caminho até o primeiro valor\n\nAtivação é o momento em que o usuário experimenta, pela primeira vez, o valor que o produto promete. Não é criar conta, não é confirmar email, não é ver o tour: é sentir na pele por que aquilo vale o tempo dele. No Financem, ativação não é cadastrar. É ver, pela primeira vez, quanto pode gastar no mês sem comprometer o imposto.\n\nDefinir esse marco com precisão é a parte que a maioria dos times pula. Sem uma definição escrita, cada pessoa da sala mede uma coisa diferente e ninguém consegue dizer se melhorou. A definição boa tem ação, quantidade e prazo: "conectou uma fonte de receita e viu o painel de limite em até sete dias".\n\nA ativação é a alavanca mais barata que existe porque ela multiplica tudo que vem antes. Dobrar a ativação equivale a dobrar a aquisição, com a diferença de que a aquisição custa dinheiro todo mês e a ativação é uma melhoria que fica. É por isso que time experiente olha ativação antes de pedir mais verba de mídia: gastar mais para encher um caminho que trava no meio é jogar dinheiro no ralo com método.',
                },
                {
                    type: "table",
                    value: '[["Definição usada","O que ela mede","Problema"],["Criou conta","Interesse inicial apenas","Não diz nada sobre valor recebido"],["Confirmou o email","Que o endereço existe","Mede o sistema, não o usuário"],["Completou o tour","Paciência com o tutorial","Ver instruções não é receber valor"],["Conectou receita e viu o limite","O valor prometido acontecendo","Exige instrumentação bem feita"]]',
                },
                {
                    type: "quote",
                    value: "Dobrar a ativação vale o mesmo que dobrar a aquisição, com a diferença de que ela não chega com boleto todo mês.",
                },
                {
                    type: "text",
                    value: "## Reduzir fricção sem pular o valor\n\nA reação automática de todo time é cortar passos. E cortar passo inútil é ótimo: campo que ninguém usa, confirmação redundante, tela de boas vindas que só atrasa. O erro fino aparece quando o time corta o passo que produz o valor. Se a ativação do Financem exige conectar uma fonte de receita, remover essa etapa aumenta o número de contas criadas e derruba o número de gente que entende para que serve o produto.\n\nExiste uma pergunta que resolve quase todos esses casos: este passo trabalha para o usuário ou para nós? O passo que trabalha para nós (pesquisa de origem, telefone para o time comercial, aceite de comunicação) pode esperar. O passo que entrega valor fica, e o trabalho é torná lo mais leve, com valor padrão, importação automática ou um exemplo pronto para experimentar.\n\nO indicador que amarra tudo é o TIME TO VALUE: quanto tempo passa entre a chegada e o primeiro valor. Medir em minutos, horas ou dias depende do produto, mas medir é obrigatório. É comum descobrir que a mediana é aceitável e o percentil 90 é absurdo, e que a briga não está no fluxo feliz.",
                },
            ],
            questions: [
                {
                    statement: "O que significa ativação em produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O usuário experimentar o valor prometido pela primeira vez",
                            isCorrect: true,
                        },
                        {
                            text: "O usuário terminar o cadastro e confirmar o endereço de email",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário assistir ao tour de apresentação da ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário virar cliente pagante depois do período gratuito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o time to value?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O tempo entre a chegada e o primeiro valor recebido",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo médio que o usuário passa no produto por semana",
                            isCorrect: false,
                        },
                        {
                            text: "O prazo do time para entregar a próxima funcionalidade",
                            isCorrect: false,
                        },
                        {
                            text: "O período gratuito antes da cobrança da primeira mensalidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que ativação costuma ser uma alavanca mais barata que aquisição?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela é uma melhoria que fica e multiplica todo o topo",
                            isCorrect: true,
                        },
                        {
                            text: "Porque campanhas de aquisição são proibidas em vários canais",
                            isCorrect: false,
                        },
                        {
                            text: "Porque melhorar ativação não exige trabalho de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o custo por clique sobe todo mês em qualquer canal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual pergunta ajuda a decidir se um passo do onboarding pode ser cortado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Este passo trabalha para o usuário ou trabalha para nós?",
                            isCorrect: true,
                        },
                        {
                            text: "Este passo foi pedido por algum cliente grande da carteira?",
                            isCorrect: false,
                        },
                        {
                            text: "Este passo aparece no fluxo dos concorrentes do mercado?",
                            isCorrect: false,
                        },
                        {
                            text: "Este passo dá trabalho para o time de engenharia manter?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time removeu a conexão de receita e as contas criadas subiram 40%, mas a ativação caiu. O que aconteceu?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cortaram justamente o passo que entregava o valor",
                            isCorrect: true,
                        },
                        {
                            text: "A instrumentação parou de registrar o evento de ativação",
                            isCorrect: false,
                        },
                        {
                            text: "O público mudou porque a campanha ficou mais agressiva",
                            isCorrect: false,
                        },
                        {
                            text: "O efeito novidade inflou o número de contas naquele mês",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Retenção como fundação",
            blocks: [
                {
                    type: "text",
                    value: "# Crescer com o balde furado\n\nA imagem é velha e continua exata: encher um balde furado exige água sem parar, e o nível nunca sobe. Um produto com retenção ruim pode até parecer que cresce enquanto a verba de aquisição está alta, mas o gráfico de usuários ativos vira um platô e depois cai, porque a saída empata com a entrada.\n\nA aritmética é implacável. Se você retém 40% dos usuários no mês seguinte, cada mil novos usuários viram quatrocentos, e para dobrar a base você precisa dobrar o gasto. Com 70% de retenção, os mesmos mil usuários rendem muito mais base acumulada, e o crescimento se sustenta com menos esforço no topo. Por isso a frase que corre nos times bons: retenção não é uma métrica do funil, é a fundação em que os loops se apoiam.\n\nO diagnóstico começa pela curva de retenção por coorte, que você já sabe ler. O que importa aqui é a forma: se a curva estabiliza num patamar, existe um grupo que encontrou valor de verdade e o produto tem chão para crescer. Se ela desce até quase zero, nenhum investimento em aquisição resolve, porque você está pagando para encher um balde que não segura água.",
                },
                {
                    type: "table",
                    value: '[["Situação","Sintoma no gráfico","Onde investir primeiro"],["Curva que estabiliza","Platô visível após alguns períodos","Aquisição e ativação, com segurança"],["Curva que zera","Queda contínua até quase nada","Valor do produto e problema resolvido"],["Queda só no início","Tombo na primeira semana","Ativação e clareza do onboarding"],["Queda tardia","Saída depois de meses de uso","Profundidade de uso e novos motivos"]]',
                },
                {
                    type: "quote",
                    value: "Investir em aquisição com retenção quebrada é pagar mais caro, todo mês, para aprender a mesma lição.",
                },
                {
                    type: "text",
                    value: "## Hábito e gatilhos, com ética\n\nRetenção alta quase sempre vem de hábito: o produto se encaixa numa rotina que já existe. O Financem não precisa ser aberto todo dia, mas precisa estar presente no momento em que a pessoa decide gastar. Descobrir esse momento é trabalho de discovery, não de notificação.\n\nGatilhos externos ajudam quando respeitam o momento e a intenção do usuário: um aviso no dia em que a nota é emitida, um resumo semanal que chega na sexta, um alerta quando o limite fica perto. Gatilhos viram abuso quando servem só à métrica do time: notificação diária sem novidade, badge falso de pendência, email que sugere urgência inexistente.\n\nA régua ética que eu uso é direta: se o usuário soubesse exatamente por que recebeu aquele aviso, ele agradeceria ou se sentiria manipulado? Padrões escuros funcionam por um trimestre, aparecem no relatório como vitória e cobram a conta depois, em desinstalação, avaliação ruim na loja e desconfiança que nenhuma campanha recompra. Em 2026, com o usuário mais atento a esse tipo de coisa, a conta chega ainda mais rápido.",
                },
            ],
            questions: [
                {
                    statement: "O que a metáfora do balde furado descreve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Crescer sem reter faz a saída empatar com a entrada",
                            isCorrect: true,
                        },
                        {
                            text: "Investir em muitos canais ao mesmo tempo dispersa o time",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar sem instrumentação impede medir qualquer resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrar caro demais afasta os usuários mais sensíveis a preço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que uma curva de retenção que estabiliza num patamar indica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Existe um grupo que encontrou valor real no produto",
                            isCorrect: true,
                        },
                        {
                            text: "O produto atingiu o limite de mercado disponível no país",
                            isCorrect: false,
                        },
                        {
                            text: "A instrumentação parou de registrar eventos após um tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Os usuários antigos foram removidos da base pelo sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que retenção é chamada de fundação do growth?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem ela, os loops não acumulam base e nada se sustenta",
                            isCorrect: true,
                        },
                        {
                            text: "Porque é a única métrica que a diretoria acompanha de perto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ela é medida antes de todas as outras no ciclo mensal",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ela substitui a necessidade de qualquer aquisição paga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a régua ética sugerida para avaliar um gatilho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se soubesse o motivo do aviso, o usuário agradeceria?",
                            isCorrect: true,
                        },
                        {
                            text: "O gatilho aumenta a métrica de sessões no próximo trimestre?",
                            isCorrect: false,
                        },
                        {
                            text: "O concorrente direto já usa esse mesmo tipo de notificação?",
                            isCorrect: false,
                        },
                        {
                            text: "O jurídico da empresa aprovou o texto enviado aos usuários?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A curva de retenção cai até quase zero e a diretoria quer triplicar a verba de mídia. Qual é a resposta correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Resolver o valor antes, senão o gasto só acelera a perda",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar, porque volume maior sempre melhora a curva média",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar o canal de mídia e manter o valor de investimento",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a verba e cortar o preço para segurar mais gente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Canais em 2026",
            blocks: [
                {
                    type: "text",
                    value: "# Onde a sua próxima pessoa está\n\nCanal é o caminho pelo qual alguém descobre que o seu produto existe. Em 2026, quatro famílias dominam a conversa e cada uma tem um contrato diferente com quem investe nela.\n\nORGÂNICO (busca, conteúdo, presença própria): barato por unidade, lento para maturar e sensível a mudanças de algoritmo. Com os buscadores respondendo direto por resumo de IA, muita busca informativa deixou de gerar clique, o que empurrou o conteúdo orgânico para nichos, profundidade e reputação em vez de volume raso. PAGO (anúncios): liga rápido, desliga rápido, mede bem e é o único que cobra mais quanto mais você usa, porque você compete com todo mundo pelo mesmo espaço.\n\nPARCERIAS: alguém que já tem a confiança do seu público empresta essa confiança, com ciclo longo de negociação e resultado desproporcional quando fecha. COMUNIDADE: presença em espaços onde o público já conversa, com a regra de ouro de contribuir antes de vender, sob pena de ser expulso pelo grupo e sair com a marca pior do que entrou.\n\nO erro clássico é escolher o canal pela empolgação e não pelo público. O canal certo é aquele em que a sua pessoa já está, e isso não muda por causa da novidade da temporada.",
                },
                {
                    type: "table",
                    value: '[["Canal","Velocidade","Custo típico","Risco principal"],["Orgânico","Lento para maturar","Baixo por unidade, alto em tempo","Dependência de algoritmo alheio"],["Pago","Liga e desliga em dias","Sobe com a concorrência","Parou de pagar, parou de entrar"],["Parcerias","Ciclo longo de negociação","Comissão ou troca de valor","Depender de poucos parceiros"],["Comunidade","Construção contínua","Tempo de gente do time","Ser lido como propaganda invasiva"]]',
                },
                {
                    type: "quote",
                    value: "Canal não se escolhe pela moda: escolhe se pelo lugar onde a sua próxima pessoa já está hoje.",
                },
                {
                    type: "text",
                    value: "## Saturação e o CAC que sobe\n\nTodo canal satura. No começo, você fala com quem tem exatamente a dor e o custo de aquisição fica baixo. Conforme o público mais óbvio se esgota, você passa a pagar para alcançar gente cada vez menos parecida com o cliente ideal, e o CAC sobe sem que nada tenha sido feito de errado. Isso é física do canal, não incompetência do time.\n\nA leitura errada é aumentar a verba achando que o resultado acompanha na mesma proporção. A leitura certa é acompanhar o CAC por canal ao longo do tempo, comparar com o valor que o cliente traz e saber a hora de diversificar. Um produto que depende de um único canal está a uma mudança de regra de distância de um trimestre péssimo.\n\nDuas defesas práticas. Primeira: manter pelo menos um canal que não dependa de leilão, porque comunidade e conteúdo próprio não somem de um dia para o outro. Segunda: medir o payback, ou seja, em quantos meses o cliente devolve o que custou. Um CAC alto pode ser saudável se o payback é rápido, e um CAC baixo pode ser ruim se o cliente sai antes de pagar a conta.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a característica principal do canal pago?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Liga e desliga rápido, mas para de entrar quando para",
                            isCorrect: true,
                        },
                        {
                            text: "Cresce sozinho com o tempo sem exigir novos investimentos",
                            isCorrect: false,
                        },
                        {
                            text: "Depende de negociação longa com parceiros do mesmo setor",
                            isCorrect: false,
                        },
                        {
                            text: "Exige presença diária do time em fóruns e grupos do público",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a regra de ouro para atuar em comunidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Contribuir antes de vender qualquer coisa para o grupo",
                            isCorrect: true,
                        },
                        {
                            text: "Publicar o link do produto em todos os tópicos abertos",
                            isCorrect: false,
                        },
                        {
                            text: "Patrocinar o administrador para liberar posts comerciais",
                            isCorrect: false,
                        },
                        {
                            text: "Criar perfis diferentes para ampliar o alcance das mensagens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o CAC de um canal tende a subir com o tempo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O público mais óbvio se esgota e você paga por gente distante",
                            isCorrect: true,
                        },
                        {
                            text: "As plataformas reajustam o preço por contrato a cada semestre",
                            isCorrect: false,
                        },
                        {
                            text: "O time perde eficiência criativa depois de meses no mesmo canal",
                            isCorrect: false,
                        },
                        {
                            text: "A concorrência copia os anúncios e derruba a taxa de clique",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em 2026, o que mudou para o canal orgânico de busca?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Resumos de IA reduziram o clique em conteúdo raso",
                            isCorrect: true,
                        },
                        {
                            text: "Buscadores passaram a cobrar por indexação de sites novos",
                            isCorrect: false,
                        },
                        {
                            text: "Conteúdo próprio deixou de aparecer nos resultados de busca",
                            isCorrect: false,
                        },
                        {
                            text: "A produção de texto passou a exigir registro em órgão oficial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um canal tem CAC alto e outro tem CAC baixo. O que decide qual é mais saudável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O payback: em quantos meses o cliente devolve o custo",
                            isCorrect: true,
                        },
                        {
                            text: "O volume absoluto de novos usuários que cada canal entrega",
                            isCorrect: false,
                        },
                        {
                            text: "A facilidade de operar o canal com o time que existe hoje",
                            isCorrect: false,
                        },
                        {
                            text: "O número de concorrentes que já investem naquele mesmo canal",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Experimentos de growth",
            blocks: [
                {
                    type: "text",
                    value: '# Velocidade com critério\n\nTime de growth vive de ritmo: muitos experimentos pequenos, ciclos curtos, aprendizado acumulado. Essa velocidade é uma virtude real, e ela só não vira desperdício quando cada experimento carrega três coisas escritas antes de começar: a hipótese, a métrica que decide e o critério de parada.\n\nA hipótese boa tem forma de aposta, não de tarefa. "Mudar o texto do botão" é tarefa. "Se o botão disser quanto sobra em vez de continuar, mais gente conclui o cadastro, porque a promessa fica concreta" é hipótese: dá para estar errado, e é isso que a torna útil. O critério de parada evita a armadilha mais comum do growth, que é ficar espiando o teste e declarar vitória no primeiro momento em que os números favorecem a ideia de quem propôs.\n\nO backlog de growth funciona melhor quando é organizado por alavanca, não por área. Você separa as ideias por aquisição, ativação, retenção, receita e indicação, e escolhe onde atacar olhando o número mais fraco. Isso evita o padrão que assola muitos times: dez experimentos seguidos na mesma tela porque ela é fácil de mexer, enquanto o gargalo real está três passos adiante.',
                },
                {
                    type: "table",
                    value: '[["Elemento do experimento","Pergunta que responde","Se faltar"],["Hipótese","No que apostamos e por quê","Vira tarefa sem aprendizado"],["Métrica de decisão","Qual número resolve a dúvida","Cada um lê o resultado a gosto"],["Critério de parada","Quando encerramos o teste","Encerra quando dá o resultado desejado"],["Métrica de guarda","O que não pode piorar","Ganha na parte e perde no todo"],["Registro do aprendizado","O que ficou sabido","O time repete o mesmo teste em um ano"]]',
                },
                {
                    type: "quote",
                    value: "Experimento sem hipótese escrita não é experimento: é uma mudança com gráfico bonito do lado.",
                },
                {
                    type: "text",
                    value: "## Quando growth vira fábrica disfarçada\n\nExiste uma versão do time de growth que é feature factory com outro crachá. Os sinais são reconhecíveis: o time celebra número de experimentos rodados em vez de aprendizado acumulado; ninguém consegue citar uma decisão que mudou por causa de um resultado; os ganhos aparecem em métricas locais e a métrica principal do produto não sai do lugar.\n\nO caso mais traiçoeiro é o ganho que rouba de outro lugar. Um pop up agressivo aumenta cliques na oferta e derruba a satisfação e a retenção do trimestre; um cadastro encurtado sobe as contas criadas e desaba a ativação. Por isso a métrica de guarda não é detalhe: ela é o que impede o time de vencer a batalha e perder a guerra sem perceber.\n\nA defesa é simples de dizer e exige disciplina para manter. Cada experimento fechado ganha um registro de duas linhas com o que foi testado, o resultado e a decisão. Trimestralmente, o time revisa a lista e responde a uma pergunta desconfortável: o que aprendemos que mudou o rumo do produto? Se a resposta for nada, a velocidade estava servindo ao relatório, não ao produto.",
                },
            ],
            questions: [
                {
                    statement: "O que separa uma hipótese de experimento de uma simples tarefa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A hipótese é uma aposta que pode se mostrar errada",
                            isCorrect: true,
                        },
                        {
                            text: "A hipótese é escrita pelo time de dados, não pelo produto",
                            isCorrect: false,
                        },
                        {
                            text: "A hipótese exige orçamento aprovado antes de ser executada",
                            isCorrect: false,
                        },
                        {
                            text: "A hipótese sempre envolve mudança visual em alguma tela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a métrica de guarda num experimento de growth?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Garantir que o ganho local não piora algo mais importante",
                            isCorrect: true,
                        },
                        {
                            text: "Medir quantos usuários entraram em cada variante do teste",
                            isCorrect: false,
                        },
                        {
                            text: "Definir o tamanho de amostra necessário para concluir o teste",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar o custo do experimento para o fechamento do mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o critério de parada precisa ser definido antes do teste começar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para ninguém encerrar no momento que favorece a própria ideia",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a ferramenta de teste exige a data final no cadastro",
                            isCorrect: false,
                        },
                        {
                            text: "Porque testes longos custam mais caro em infraestrutura de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time de engenharia precisa reservar a agenda com folga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que organizar o backlog de growth por alavanca ajuda?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Evita repetir testes na tela fácil enquanto o gargalo é outro",
                            isCorrect: true,
                        },
                        {
                            text: "Permite distribuir os experimentos igualmente entre as equipes",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz o custo de cada teste por reaproveitar a mesma amostra",
                            isCorrect: false,
                        },
                        {
                            text: "Facilita a aprovação do orçamento anual junto à diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time rodou 40 experimentos no trimestre e a métrica principal não mudou. Qual é o diagnóstico mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Growth virou fábrica: velocidade sem aprendizado que decide",
                            isCorrect: true,
                        },
                        {
                            text: "A amostra foi pequena demais em todos os quarenta experimentos",
                            isCorrect: false,
                        },
                        {
                            text: "O trimestre foi curto e os efeitos aparecem no período seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "A métrica principal estava mal calculada pelo time de dados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Monetização",
    aulas: [
        {
            titulo: "Modelos e empacotamento",
            blocks: [
                {
                    type: "text",
                    value: "# Como o produto vira receita\n\nModelo de receita é a resposta para uma pergunta simples e decisiva: pelo que exatamente o cliente paga. A escolha não é financeira apenas, ela desenha o produto inteiro, porque define o que precisa ser medido, o que precisa ser limitado e qual comportamento do usuário o negócio passa a torcer para acontecer.\n\nQuatro modelos cobrem a maior parte do mercado. FREE COM PREMIUM: uma versão gratuita permanente e uma paga com mais capacidade, boa para produtos de volume e ciclo curto de decisão. ASSINATURA: valor fixo por período, previsível para os dois lados, exige entrega de valor contínuo para não virar cancelamento. USO: cobra pelo consumo (mensagens, notas, processamento), justo quando o custo variável é real e assustador quando a conta do cliente é imprevisível. POR ASSENTO: cobra por pessoa com acesso, natural em ferramentas de time e perverso quando incentiva o cliente a compartilhar login para economizar.\n\nEMPACOTAMENTO é a arte de decidir o que entra em cada plano. O critério que sustenta o pacote é o eixo de valor: o cliente que recebe mais valor precisa cair naturalmente no plano mais caro. Quando o eixo é arbitrário, o cliente grande fica no plano barato e o pequeno paga caro, e o time passa o ano inteiro remendando exceção comercial.",
                },
                {
                    type: "table",
                    value: '[["Modelo","Cobra por","Vai bem quando","Risco"],["Free com premium","Capacidade extra da versão paga","Volume alto e decisão rápida","Grátis bom demais trava a conversão"],["Assinatura","Período de acesso ao produto","Valor entregue de forma contínua","Uso cai e o cancelamento vem"],["Uso","Consumo medido do serviço","Custo variável real por unidade","Conta imprevisível assusta o cliente"],["Por assento","Pessoa com acesso liberado","Ferramenta usada por times","Cliente compartilha login para economizar"]]',
                },
                {
                    type: "quote",
                    value: "O eixo de cobrança precisa crescer junto com o valor entregue, senão o cliente grande paga pouco e o pequeno paga demais.",
                },
                {
                    type: "text",
                    value: "## Escolhendo o eixo no Financem\n\nNo Financem, três eixos entraram na mesa. Por NÚMERO DE NOTAS emitidas: acompanha o tamanho do negócio do autônomo, mas pune justamente o mês bom, o que soa como castigo pelo sucesso. Por FUNCIONALIDADE: quem quer projeção de imposto e conciliação automática paga; quem quer só o registro básico usa de graça. Por USUÁRIO: não faz sentido, porque autônomo trabalha sozinho quase sempre.\n\nA escolha foi funcionalidade, com um teto generoso de notas no plano gratuito. O raciocínio: o valor percebido salta quando a pessoa deixa de ter medo do imposto, e esse salto acontece na projeção, não no volume de registro. Quem chega nesse ponto paga com prazer; quem só quer anotar despesa continua de graça e alimenta o loop de conteúdo e indicação.\n\nDuas armadilhas para lembrar. Ter planos demais confunde e trava a decisão de compra, e três costuma ser o limite prático da clareza. E promessa de plano gratuito para sempre é difícil de desfazer sem queimar a confiança, então prometa o que você aguenta pagar quando a base multiplicar por dez.",
                },
            ],
            questions: [
                {
                    statement: "O que o modelo de receita define?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pelo que exatamente o cliente paga no produto",
                            isCorrect: true,
                        },
                        {
                            text: "Quanto o time pode gastar com infraestrutura por mês",
                            isCorrect: false,
                        },
                        {
                            text: "Qual canal de aquisição será usado no lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Como o produto será construído pelo time de engenharia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o risco típico da cobrança por assento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O cliente compartilhar login para pagar menos assentos",
                            isCorrect: true,
                        },
                        {
                            text: "A conta do cliente variar demais de um mês para o outro",
                            isCorrect: false,
                        },
                        {
                            text: "A versão gratuita ficar boa demais e travar a conversão",
                            isCorrect: false,
                        },
                        {
                            text: "O custo de infraestrutura crescer mais rápido que a receita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que significa dizer que o eixo de cobrança precisa acompanhar o valor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem recebe mais valor deve cair no plano mais caro",
                            isCorrect: true,
                        },
                        {
                            text: "O preço precisa subir todo ano acompanhando a inflação",
                            isCorrect: false,
                        },
                        {
                            text: "Cada funcionalidade nova deve ter uma cobrança separada",
                            isCorrect: false,
                        },
                        {
                            text: "O valor cobrado deve cobrir o custo de servir cada cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que cobrar por nota emitida foi descartado no Financem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cobrar mais no mês bom soa como castigo pelo sucesso",
                            isCorrect: true,
                        },
                        {
                            text: "Porque contar notas exige integração cara com a prefeitura",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a legislação proíbe cobrança baseada em documento fiscal",
                            isCorrect: false,
                        },
                        {
                            text: "Porque autônomos raramente emitem nota fiscal no Brasil hoje",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que oferecer seis planos diferentes costuma piorar a receita?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Excesso de opção confunde e trava a decisão de compra",
                            isCorrect: true,
                        },
                        {
                            text: "Cada plano extra exige um contrato jurídico próprio e caro",
                            isCorrect: false,
                        },
                        {
                            text: "Sistemas de cobrança não conseguem operar tantos planos ativos",
                            isCorrect: false,
                        },
                        {
                            text: "Planos demais impedem qualquer comparação com concorrentes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Pricing básico",
            blocks: [
                {
                    type: "text",
                    value: "# Preço é hipótese, não conta de padaria\n\nA forma mais comum de errar preço é calcular custo, somar uma margem e chamar de decisão. Custo define o seu piso, não o seu preço. O que define o preço é o VALOR PERCEBIDO: quanto vale, para aquela pessoa, o problema deixar de existir. Um produto que economiza oito horas por mês de um profissional que fatura por hora tem um teto de valor evidente, e ele não tem relação nenhuma com o quanto custa manter o servidor no ar.\n\nO enquadramento importa tanto quanto o número. ANCORAGEM é o efeito de comparar: sozinho, um preço não significa nada; ao lado de outra coisa, ele fica caro ou barato. Por isso a página de planos coloca opções lado a lado e por isso a conversa comercial começa comparando com a alternativa atual do cliente, que muitas vezes é uma planilha e um contador cobrando por hora.\n\nO ponto de partida honesto para um produto novo é tratar preço como HIPÓTESE. Você escolhe um número defensável, observa taxa de conversão, objeções e desconto concedido, e ajusta. Nunca cobrar nada porque falta coragem de pedir dinheiro é a forma mais silenciosa de descobrir tarde que ninguém queria pagar por aquilo.",
                },
                {
                    type: "table",
                    value: '[["Sinal observado","Leitura provável","Ação a considerar"],["Ninguém reclama do preço","Você está cobrando abaixo do valor","Testar um patamar acima em novos clientes"],["Quase todos reclamam","Preço acima do valor percebido","Rever proposta, pacote ou público"],["Uma parte reclama e fecha","Preço perto do ponto saudável","Manter e observar conversão por segmento"],["Desconto em toda negociação","A lista virou ficção comercial","Corrigir a tabela e dar régua ao time"]]',
                },
                {
                    type: "quote",
                    value: "Se nenhum cliente reclama do seu preço, o mercado está lhe dizendo, com educação, que você cobra pouco.",
                },
                {
                    type: "text",
                    value: "## A conversa de preço em B2B\n\nEm produto vendido para empresa, preço é conversa, não etiqueta. Existe uma tabela, existe uma régua de desconto e existe um vendedor com meta, e o PM precisa entender essa dinâmica para não ser atropelado por ela.\n\nDuas coisas ajudam. A primeira é a régua escrita: até quanto de desconto cada nível pode dar, em troca de quê (prazo maior, pagamento antecipado, caso de sucesso público). Desconto sem contrapartida ensina o mercado a esperar desconto, e a próxima renovação começa do valor descontado. A segunda é o cuidado com o pedido de funcionalidade dentro da negociação: o cliente grande pede uma feature em troca da assinatura, e a decisão de aceitar não é comercial, é de produto. A pergunta certa é se aquilo serve para mais gente ou se você acabou de virar fábrica de um cliente só.\n\nRegistre o motivo de cada desconto grande. Depois de vinte negociações, esse registro vira a evidência mais barata de que a tabela precisa mudar, e ela chega com dado em vez de opinião.",
                },
            ],
            questions: [
                {
                    statement: "O que define o preço de um produto, se não é o custo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O valor percebido pelo cliente ao resolver a dor",
                            isCorrect: true,
                        },
                        {
                            text: "A média dos preços praticados pelos concorrentes diretos",
                            isCorrect: false,
                        },
                        {
                            text: "O orçamento anual aprovado pela diretoria da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de engenharia investido para construir o produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é ancoragem em preço?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um preço só faz sentido quando comparado com outro",
                            isCorrect: true,
                        },
                        {
                            text: "Fixar o preço em contrato por um período longo e definido",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrar sempre um valor terminado em nove por hábito",
                            isCorrect: false,
                        },
                        {
                            text: "Congelar a tabela para não perder cliente na renovação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Nenhum cliente reclama do preço do seu produto. O que isso sugere?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Provavelmente você está cobrando abaixo do valor entregue",
                            isCorrect: true,
                        },
                        {
                            text: "O preço está exatamente no ponto ideal para o mercado atual",
                            isCorrect: false,
                        },
                        {
                            text: "A base de clientes é pequena demais para gerar reclamação",
                            isCorrect: false,
                        },
                        {
                            text: "O time comercial está escondendo objeções do time de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que dar desconto sem contrapartida é perigoso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ensina o mercado a esperar desconto na próxima renovação",
                            isCorrect: true,
                        },
                        {
                            text: "Impede o registro correto da receita no fechamento contábil",
                            isCorrect: false,
                        },
                        {
                            text: "Obriga a empresa a oferecer o mesmo valor a todos os clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Torna a margem negativa em qualquer contrato de longo prazo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um cliente grande condiciona a assinatura a uma funcionalidade exclusiva. Como o PM deve tratar isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Perguntar se aquilo serve para mais gente além dele",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitar sempre, porque contrato grande justifica o esforço",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar sempre, já que pedido de cliente enviesa o produto",
                            isCorrect: false,
                        },
                        {
                            text: "Delegar a decisão ao time comercial, que conhece a negociação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Testar preço com cuidado",
            blocks: [
                {
                    type: "text",
                    value: "# Por que o A/B de preço é diferente\n\nA tentação é óbvia: se testamos cor de botão e texto de tela, por que não testar preço? Porque preço não é interface, é promessa comercial, e mostrar valores diferentes para pessoas diferentes toca em três terrenos delicados de uma vez.\n\nJUSTIÇA: duas pessoas com a mesma necessidade pagando valores diferentes pelo mesmo produto, sem nenhum critério que elas reconheçam como legítimo, é o tipo de coisa que vira print e circula. CONFIANÇA: descobrir que foi sorteado para o grupo caro estraga a relação de um jeito difícil de consertar, mesmo com reembolso. JURÍDICO: no Brasil, o Código de Defesa do Consumidor trata de informação clara e prática abusiva, e discriminação de preço sem critério defensável é terreno arriscado; some a isso a LGPD quando o preço varia por dados pessoais do usuário.\n\nExiste ainda um problema técnico. Preço afeta a receita por muito tempo, e a leitura correta exige acompanhar retenção e valor do cliente por meses, não a conversão da semana. Um preço menor quase sempre converte mais no curto prazo, e isso não prova nada sobre o resultado no fim do ano.",
                },
                {
                    type: "table",
                    value: '[["Alternativa","Como funciona","Cuidado necessário"],["Preço novo para novos clientes","Base antiga mantém o valor antigo","Comunicar bem quem já é cliente"],["Teste por mercado ou região","Preço distinto por praça definida","Critério precisa ser público e claro"],["Pesquisa de sensibilidade","Perguntar faixas caro e barato","Intenção declarada não é compra real"],["Desconto por tempo limitado","Promoção com prazo e regra","Promoção eterna vira o preço de fato"],["Mudar o pacote, não o preço","Realocar itens entre os planos","Não tirar valor de quem já pagava"]]',
                },
                {
                    type: "quote",
                    value: "Preço não é cor de botão: o usuário sorteado para a variante cara descobre, conta para todo mundo e não esquece.",
                },
                {
                    type: "text",
                    value: "## Como testar preço sem quebrar a confiança\n\nO caminho mais seguro e mais usado é o preço novo valendo só para quem chega a partir de agora, com a base atual protegida pelo valor antigo por um período combinado. Você aprende com o comportamento real de compra e ninguém se sente traído, porque a regra é reconhecível: quem entrou antes entrou com aquelas condições.\n\nQuando faz sentido comparar de verdade, separe por mercado inteiro em vez de sortear indivíduos. Praças diferentes, moedas diferentes ou segmentos declarados (estudante, pequena empresa, uso comercial) são critérios que as pessoas aceitam como legítimos, porque conseguem entender a lógica.\n\nE vale lembrar o que muitos esquecem: mudar o EMPACOTAMENTO costuma render mais que mexer no número. Tirar uma funcionalidade cobiçada do plano intermediário move a conversão tanto quanto uma alteração de preço, e sem o desgaste de dizer que o produto ficou mais caro. O limite ético segue o mesmo de sempre: não retire valor de quem já estava pagando por ele.",
                },
            ],
            questions: [
                {
                    statement: "Por que testar preço com sorteio entre usuários é delicado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mexe com justiça, confiança e terreno jurídico",
                            isCorrect: true,
                        },
                        {
                            text: "Exige uma ferramenta de testes muito mais cara que o normal",
                            isCorrect: false,
                        },
                        {
                            text: "Demanda aprovação prévia dos meios de pagamento usados",
                            isCorrect: false,
                        },
                        {
                            text: "Impede o time de medir a conversão de cada variante criada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a alternativa mais segura para testar um preço novo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aplicar só para quem chega a partir daquela data",
                            isCorrect: true,
                        },
                        {
                            text: "Sortear metade da base atual para o valor mais alto",
                            isCorrect: false,
                        },
                        {
                            text: "Subir o preço de todos e reembolsar quem reclamar",
                            isCorrect: false,
                        },
                        {
                            text: "Alternar o preço da página a cada dia da semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que conversão da semana não basta para avaliar um preço?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Preço afeta retenção e receita ao longo de muitos meses",
                            isCorrect: true,
                        },
                        {
                            text: "A amostra semanal nunca alcança significância estatística",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas de análise atrasam o dado de receita em semanas",
                            isCorrect: false,
                        },
                        {
                            text: "A conversão só é confiável quando medida em dias úteis cheios",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que separar preço por mercado é mais aceitável que sortear indivíduos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O critério é público e as pessoas reconhecem a lógica",
                            isCorrect: true,
                        },
                        {
                            text: "A legislação isenta empresas que operam em várias regiões",
                            isCorrect: false,
                        },
                        {
                            text: "Mercados diferentes não trocam informação entre os clientes",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado estatístico fica mais preciso com grupos maiores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer converter mais sem anunciar aumento de preço. Qual caminho costuma render mais?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Rever o empacotamento dos planos sem tirar valor",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar uma promoção permanente com desconto fixo divulgado",
                            isCorrect: false,
                        },
                        {
                            text: "Mostrar preços diferentes conforme o aparelho do visitante",
                            isCorrect: false,
                        },
                        {
                            text: "Remover uma funcionalidade que os clientes atuais já usavam",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas de receita",
            blocks: [
                {
                    type: "text",
                    value: "# O vocabulário que a diretoria usa\n\nQuando a conversa sobe de nível, o idioma muda, e o PM que não fala esse idioma vira espectador da própria estratégia. Comece pelos dois básicos. MRR é a receita recorrente mensal, ou seja, o valor previsível que entra todo mês; ARR é a versão anual do mesmo número. Receita avulsa e projeto pontual não entram, justamente porque a graça do indicador é a previsibilidade.\n\nA composição importa mais que o total. O MRR de um mês é o do mês anterior mais o NOVO (clientes que chegaram), mais a EXPANSÃO (clientes que passaram a pagar mais), menos a CONTRAÇÃO (que reduziram plano) e menos o CHURN de receita (que saíram). Duas empresas com o mesmo MRR e composições diferentes são negócios completamente diferentes: uma cresce por esteira comercial cara, a outra cresce porque os clientes que ficam pagam mais a cada ano.\n\nDaí vem a distinção que mais confunde no começo. CHURN DE LOGO conta clientes perdidos; CHURN DE RECEITA conta reais perdidos. Perder dez clientes pequenos e um grande dá o mesmo churn de logo com efeitos financeiros incomparáveis, e é por isso que os dois números aparecem sempre lado a lado.",
                },
                {
                    type: "table",
                    value: '[["Métrica","O que mede","Por que importa"],["MRR","Receita recorrente do mês","Base previsível do planejamento"],["Expansão","Receita a mais de quem já é cliente","Crescimento sem custo de aquisição"],["Contração","Redução de plano sem saída","Sinal precoce de valor caindo"],["Churn de logo","Clientes perdidos no período","Saúde da base em quantidade"],["Churn de receita","Reais perdidos no período","Impacto financeiro real da saída"],["Payback de CAC","Meses até devolver o custo","Fôlego de caixa para crescer"]]',
                },
                {
                    type: "quote",
                    value: "Duas empresas com o mesmo MRR podem ser negócios opostos: o que decide é de onde esse número vem.",
                },
                {
                    type: "text",
                    value: "## Expansão e payback: os dois que salvam\n\nEXPANSÃO é a métrica preferida de quem entende do assunto, e o motivo é aritmético: receita que cresce dentro da base não paga custo de aquisição de novo. Quando a expansão supera o churn de receita, acontece o fenômeno mais desejado do modelo de assinatura, o crescimento que continua mesmo sem nenhum cliente novo entrar. Isso muda a conversa com investidor e muda a pressão sobre o time comercial.\n\nPAYBACK DE CAC responde em quantos meses o cliente devolve o que custou para ser adquirido. Doze meses é confortável em muitos contextos; vinte e quatro exige caixa e paciência. O número é decisivo porque governa velocidade: com payback curto, cada real reinvestido volta rápido e o crescimento acelera; com payback longo, crescer rápido consome caixa e a empresa pode quebrar crescendo.\n\nPara o PM, essas métricas apontam trabalho concreto. Expansão baixa costuma indicar que o plano superior não tem valor suficiente para justificar a subida. Contração alta indica que o cliente encolheu o uso antes de encolher o plano, e esse sinal aparece no produto semanas antes de aparecer na receita.",
                },
            ],
            questions: [
                {
                    statement: "O que o MRR mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A receita recorrente e previsível de cada mês",
                            isCorrect: true,
                        },
                        {
                            text: "Todo o dinheiro que entrou no caixa durante o mês",
                            isCorrect: false,
                        },
                        {
                            text: "O lucro obtido depois de descontar todos os custos",
                            isCorrect: false,
                        },
                        {
                            text: "O valor total dos contratos assinados no trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre churn de logo e churn de receita?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um conta clientes perdidos e o outro conta reais perdidos",
                            isCorrect: true,
                        },
                        {
                            text: "Um é medido por mês e o outro é sempre medido por ano",
                            isCorrect: false,
                        },
                        {
                            text: "Um vale para produto pago e o outro para produto gratuito",
                            isCorrect: false,
                        },
                        {
                            text: "Um é calculado por produto e o outro pela empresa inteira",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que expansão é considerada a métrica mais saudável de crescimento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É receita a mais sem pagar aquisição outra vez",
                            isCorrect: true,
                        },
                        {
                            text: "É a métrica que a área financeira audita com mais rigor",
                            isCorrect: false,
                        },
                        {
                            text: "É calculada automaticamente pelas ferramentas de cobrança",
                            isCorrect: false,
                        },
                        {
                            text: "É a única métrica que aparece nos relatórios trimestrais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa a expansão superar o churn de receita?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A receita cresce mesmo sem nenhum cliente novo entrar",
                            isCorrect: true,
                        },
                        {
                            text: "O número de clientes ativos aumenta em todos os meses",
                            isCorrect: false,
                        },
                        {
                            text: "O custo de aquisição de clientes ficou abaixo da meta anual",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa parou de precisar de time comercial e de marketing",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas empresas têm o mesmo MRR, mas uma tem payback de 6 meses e outra de 24. O que isso muda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A de payback curto reinveste antes e cresce mais rápido",
                            isCorrect: true,
                        },
                        {
                            text: "Nada relevante, já que ambas têm a mesma receita mensal",
                            isCorrect: false,
                        },
                        {
                            text: "A de payback longo tem margem melhor por definição do modelo",
                            isCorrect: false,
                        },
                        {
                            text: "A de payback curto necessariamente cobra um preço mais alto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Freemium sem se machucar",
            blocks: [
                {
                    type: "text",
                    value: "# O grátis que trabalha para você\n\nFreemium é uma aposta de aquisição: você entrega valor de graça para muita gente esperando que uma fração pague. O erro de leitura mais comum é tratar o plano gratuito como versão capada do produto. Ele não é isso. É um produto inteiro, com público próprio, custo próprio e papel próprio na estratégia, e ele precisa fazer sentido sozinho.\n\nA pergunta que organiza o desenho é o que o grátis faz por você. Ele pode alimentar loop de conteúdo (usuários gratuitos geram material que atrai busca), loop de indicação (chamam colegas para colaborar), efeito de rede (o produto fica melhor com mais gente) ou simplesmente construir confiança antes da compra. Se você não consegue nomear qual desses papéis o gratuito cumpre, ele é só custo com nome bonito.\n\nDaí vem a decisão mais delicada: onde fica o limite. Apertado demais, a pessoa não chega a sentir valor e vai embora sem entender o que perdeu. Frouxo demais, o grátis resolve o problema por completo e ninguém tem motivo para pagar. O limite bem colocado deixa o usuário experimentar o valor e encontrar a parede exatamente quando o uso dele cresce, no momento em que pagar parece natural.",
                },
                {
                    type: "table",
                    value: '[["Tipo de limite","Como funciona","Vai bem quando"],["Por volume","Até X registros ou notas por mês","O uso cresce junto com o negócio"],["Por funcionalidade","O avançado só no plano pago","Existe um salto claro de valor"],["Por tempo","Teste completo com prazo fechado","A decisão de compra é rápida"],["Por pessoa","Grátis sozinho, pago em equipe","O produto ganha valor em grupo"]]',
                },
                {
                    type: "quote",
                    value: "Se você não sabe dizer qual trabalho o plano gratuito faz por você, ele não é estratégia: é despesa fixa.",
                },
                {
                    type: "text",
                    value: "## O custo de quem nunca vai pagar\n\nUsuário gratuito custa dinheiro. Ele consome infraestrutura, abre tíquete no suporte, aparece nas avaliações da loja e ocupa espaço no roadmap, porque reclamação de quem não paga também dói. Em produtos com custo variável relevante, e produtos com IA são o exemplo mais atual disso, essa conta deixa de ser detalhe e vira decisão de sobrevivência: cada resposta gerada tem preço, e mil usuários gratuitos entusiasmados podem consumir a margem do mês inteiro.\n\nOs números de referência ajudam a manter o pé no chão. Conversão de gratuito para pago costuma ficar na casa de poucos por cento na maioria dos produtos de consumo. Se o seu plano exige vinte por cento de conversão para fechar a conta, o modelo provavelmente não é freemium, é teste gratuito com prazo.\n\nSinais de que o grátis está estrangulando o negócio: a base gratuita cresce e a receita fica parada; o suporte passa a maior parte do tempo com quem não paga; o custo de servir sobe mais rápido que o MRR. Quando isso aparece, aperte o limite para os novos e proteja quem já está dentro, porque tirar o que a pessoa já usava é o caminho curto para a revolta pública.",
                },
            ],
            questions: [
                {
                    statement: "Como o plano gratuito deve ser encarado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como um produto próprio, com público e papel definidos",
                            isCorrect: true,
                        },
                        {
                            text: "Como uma versão capada do produto pago que existe hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Como uma promoção temporária de lançamento do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Como um custo inevitável que não traz retorno nenhum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece quando o limite do plano gratuito é apertado demais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A pessoa sai antes de experimentar o valor do produto",
                            isCorrect: true,
                        },
                        {
                            text: "O custo de infraestrutura cresce mais que a receita mensal",
                            isCorrect: false,
                        },
                        {
                            text: "O time de suporte passa a receber muito mais tíquetes",
                            isCorrect: false,
                        },
                        {
                            text: "A conversão para o plano pago dispara nos primeiros meses",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que produtos com IA exigem cuidado extra no freemium?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada resposta gerada tem custo variável real por uso",
                            isCorrect: true,
                        },
                        {
                            text: "Modelos de IA proíbem uso gratuito em produtos comerciais",
                            isCorrect: false,
                        },
                        {
                            text: "Usuários gratuitos abandonam o produto mais rápido que os pagos",
                            isCorrect: false,
                        },
                        {
                            text: "A LGPD impede tratar dados de usuários que não pagam nada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais são os sinais de que o plano gratuito está estrangulando o negócio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A base cresce, a receita fica parada e o custo de servir sobe",
                            isCorrect: true,
                        },
                        {
                            text: "A quantidade de avaliações positivas na loja diminui bastante",
                            isCorrect: false,
                        },
                        {
                            text: "O produto passa a ser citado por concorrentes em campanhas",
                            isCorrect: false,
                        },
                        {
                            text: "O time de engenharia reclama do tamanho do banco de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O plano precisa apertar o limite do gratuito para fechar a conta. Qual é o caminho menos destrutivo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Aplicar o novo limite só aos novos e proteger quem já usa",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o limite de todos no mesmo dia com aviso prévio curto",
                            isCorrect: false,
                        },
                        {
                            text: "Encerrar o plano gratuito e migrar a base para o plano pago",
                            isCorrect: false,
                        },
                        {
                            text: "Manter tudo igual e cortar investimento em infraestrutura",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Produto técnico",
    aulas: [
        {
            titulo: "Falar com engenharia de igual",
            blocks: [
                {
                    type: "text",
                    value: "# Entender o suficiente para perguntar bem\n\nO PM não precisa programar, mas precisa entender o suficiente para fazer perguntas boas e reconhecer uma resposta vaga. A diferença entre o PM respeitado pela engenharia e o PM tolerado por ela quase sempre mora aqui: um pergunta o que muda a decisão, o outro repete prazo com voz mais firme.\n\nQuatro territórios cobrem a maior parte das conversas. API: como sistemas conversam, o que é um contrato entre eles e por que mudar um campo pode quebrar quem consome. BANCO: onde o dado mora, por que consulta em tabela grande fica lenta e por que mudar a forma dos dados custa mais que mudar uma tela. DEPLOY: como o código chega em produção, o que é ambiente, esteira e reversão. DÍVIDA: por que o time diz que uma tarefa pequena vai custar duas semanas.\n\nO teste prático é o seguinte. Quando a engenharia responde que algo é complicado, o PM preparado consegue perguntar se a complicação está no dado, na integração, no volume ou na dívida acumulada. Isso não é invasão de território: é ter vocabulário para transformar um bloqueio abstrato em um problema com nome, que dá para priorizar, adiar ou dividir em pedaços.",
                },
                {
                    type: "table",
                    value: '[["Pergunta fraca","Pergunta boa","Por que a segunda funciona"],["Dá para fazer até sexta?","O que precisaria ser verdade para caber na semana?","Convida a mostrar restrições reais"],["Por que está complicado?","A complicação é o dado, o volume ou a integração?","Dá nome ao obstáculo e permite decidir"],["Dá para fazer mais rápido?","Que parte entrega valor sozinha primeiro?","Abre a porta para uma fatia menor"],["Isso é seguro?","O que acontece se der errado em produção?","Traz o risco para termos de impacto"]]',
                },
                {
                    type: "quote",
                    value: "O PM não precisa saber a resposta técnica: precisa saber a pergunta que faz a resposta aparecer.",
                },
                {
                    type: "text",
                    value: "## Confiança se constrói com previsibilidade\n\nEngenharia confia em PM que faz três coisas com constância. A primeira é trazer o problema antes da solução, porque quando você chega com a tela desenhada, elimina a chance de alguém propor um caminho dez vezes mais barato. A segunda é sustentar a prioridade: mudar a ordem toda semana destrói mais produtividade do que qualquer ferramenta recupera. A terceira é dizer não para fora do time, porque o PM que aceita tudo transfere para a engenharia o desgaste de negar.\n\nUm hábito que rende muito é pedir a estimativa em faixas e não em datas. Perguntar se algo é de dias, de semanas ou de meses gera respostas mais honestas do que exigir um número exato, e serve perfeitamente para decidir se vale a pena continuar explorando aquela ideia.\n\nEvite dois vícios comuns. Fingir que entende quando não entendeu produz decisões erradas e é sempre percebido. E usar termo técnico decorado para parecer parte da turma soa pior do que perguntar. Ninguém espera que o PM saiba tudo; o time espera que ele seja honesto sobre o que sabe.",
                },
            ],
            questions: [
                {
                    statement: "Por que o PM precisa entender o básico de tecnologia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para fazer perguntas boas e reconhecer resposta vaga",
                            isCorrect: true,
                        },
                        {
                            text: "Para revisar o código escrito pelo time antes do deploy",
                            isCorrect: false,
                        },
                        {
                            text: "Para estimar as tarefas no lugar dos desenvolvedores",
                            isCorrect: false,
                        },
                        {
                            text: "Para escolher as tecnologias que o time vai adotar no ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que trazer o problema antes da solução ajuda a engenharia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Abre espaço para um caminho bem mais barato aparecer",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz o número de reuniões necessárias durante a sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Permite que o time escolha sozinho o que vai priorizar",
                            isCorrect: false,
                        },
                        {
                            text: "Evita que o time precise conversar com usuários reais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A engenharia diz que a tarefa está complicada. Qual pergunta melhora essa conversa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A complicação é o dado, o volume ou a integração?",
                            isCorrect: true,
                        },
                        {
                            text: "Quantas horas exatas cada pessoa vai gastar na tarefa?",
                            isCorrect: false,
                        },
                        {
                            text: "Vocês já tentaram usar uma biblioteca pronta para isso?",
                            isCorrect: false,
                        },
                        {
                            text: "Alguém do time já resolveu algo parecido em outra empresa?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que pedir estimativa em faixas costuma funcionar melhor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dias, semanas ou meses gera resposta mais honesta",
                            isCorrect: true,
                        },
                        {
                            text: "Faixas permitem cobrar prazo com mais firmeza depois",
                            isCorrect: false,
                        },
                        {
                            text: "Faixas são exigidas pelos frameworks ágeis mais usados",
                            isCorrect: false,
                        },
                        {
                            text: "Faixas eliminam a necessidade de refinar o item depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O PM não entendeu a explicação técnica na reunião. Qual é a melhor conduta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Assumir que não entendeu e pedir para explicar de novo",
                            isCorrect: true,
                        },
                        {
                            text: "Fingir que entendeu e pesquisar o assunto depois sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir os termos técnicos ouvidos para acompanhar o ritmo",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir que outra pessoa do time explique tudo por escrito",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Dívida técnica como conversa de negócio",
            blocks: [
                {
                    type: "text",
                    value: '# Os juros que você paga toda sprint\n\nDívida técnica é o atalho que o time tomou para entregar mais rápido e que agora cobra juros. A metáfora financeira é boa porque explica o comportamento: assim como uma dívida de verdade, ela tem um valor principal (o retrabalho necessário para arrumar) e um custo recorrente (cada nova funcionalidade naquela área sai mais cara e mais arriscada).\n\nO problema é que a conversa quase sempre chega mal traduzida. Engenharia diz que precisa refatorar o módulo de cobrança; produto ouve um pedido de tempo sem retorno; a diretoria ouve custo puro. Todo mundo tem razão pela metade, e a discussão vira briga de território em vez de decisão econômica.\n\nA tradução que funciona é falar em efeito observável. Não é "o código está feio", é "cada mudança nessa área leva três vezes mais tempo do que levaria e é onde nasce metade dos nossos incidentes". Com esse formato, a conversa deixa de ser estética e vira aritmética: se pagar custa duas semanas e economiza dois dias por mês em manutenção, o retorno aparece em pouco mais de um semestre, e isso é uma decisão de investimento que qualquer gestor sabe avaliar.',
                },
                {
                    type: "table",
                    value: '[["Tipo de dívida","Como surgiu","Quando pagar"],["Deliberada e registrada","Atalho consciente para uma data","Assim que a data passar"],["Deliberada e esquecida","Atalho que ninguém anotou","Quando o custo aparecer no fluxo"],["Acidental por aprendizado","Só depois entendeu se o domínio","Ao mexer de novo naquela área"],["Por envelhecimento","Dependência ou versão obsoleta","Antes de virar risco de segurança"]]',
                },
                {
                    type: "quote",
                    value: "Dívida técnica não se discute em adjetivos: se discute em tempo perdido, incidentes e risco que o negócio consegue enxergar.",
                },
                {
                    type: "text",
                    value: "## Quando priorizar refatoração contra feature\n\nA disputa direta entre uma refatoração e uma funcionalidade nova é injusta por natureza, porque a funcionalidade tem benefício visível e a refatoração tem benefício invisível. Três critérios ajudam a decidir com honestidade.\n\nPrimeiro, a área está no caminho do roadmap? Refatorar um módulo que ninguém vai tocar nos próximos dois trimestres raramente compensa, por pior que ele seja. Segundo, a dívida está gerando incidente ou risco de segurança? Aí não é priorização, é obrigação. Terceiro, o custo já é mensurável? Se o time consegue mostrar que estimativas naquela área estouram sistematicamente, existe dado para defender.\n\nO combinado que funciona na prática é reservar uma fatia fixa de capacidade, algo entre dez e vinte por cento, para saúde técnica, com autonomia do time para escolher o que entra. Isso resolve a assimetria política sem transformar cada decisão numa negociação individual. E o PM ganha um direito legítimo: pedir que o time mostre, de vez em quando, qual efeito aquela fatia produziu, em tempo de entrega ou em incidentes que deixaram de acontecer.",
                },
            ],
            questions: [
                {
                    statement: "O que são os juros da dívida técnica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O custo extra que cada mudança naquela área passa a ter",
                            isCorrect: true,
                        },
                        {
                            text: "A multa cobrada pelo cliente quando a entrega atrasa demais",
                            isCorrect: false,
                        },
                        {
                            text: "O valor pago em licenças de ferramentas antigas do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo gasto pelo time em reuniões de refinamento técnico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual formulação traduz dívida técnica para o negócio?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mudanças nessa área demoram o triplo e geram incidentes",
                            isCorrect: true,
                        },
                        {
                            text: "O código dessa parte do sistema está feio e desorganizado",
                            isCorrect: false,
                        },
                        {
                            text: "O time não gosta de trabalhar naquele módulo específico",
                            isCorrect: false,
                        },
                        {
                            text: "A tecnologia usada ali não é a mais moderna do mercado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando pagar a dívida deixa de ser priorização e vira obrigação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando ela já gera incidentes ou risco de segurança",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o time reclama dela em mais de uma retrospectiva",
                            isCorrect: false,
                        },
                        {
                            text: "Quando existe uma tecnologia mais nova disponível no mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a área não é tocada há mais de dois trimestres seguidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que reservar uma fatia fixa de capacidade para saúde técnica ajuda?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Evita disputa injusta entre benefício visível e invisível",
                            isCorrect: true,
                        },
                        {
                            text: "Garante que nenhuma funcionalidade nova entre no trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Permite ao time trabalhar sem prestar contas do resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz a necessidade de refinamento das histórias do backlog",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer refatorar um módulo ruim que ninguém vai tocar nos próximos dois trimestres. Como avaliar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem incidente nem roadmap na área, o retorno é baixo",
                            isCorrect: true,
                        },
                        {
                            text: "Aprovar sempre, porque saúde técnica não se discute com prazo",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar sempre, já que refatoração não gera valor ao cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar para o próximo ano e retomar o tema no planejamento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "API e plataforma como produto",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o usuário é uma pessoa que programa\n\nQuando o seu produto é uma API, um SDK ou uma plataforma de integração, o usuário passa a ser alguém que programa, e quase tudo que você aprendeu sobre experiência continua valendo com outra roupa. Fricção de onboarding vira demora até a primeira chamada funcionar. Mensagem de erro ruim vira uma tarde perdida. Documentação é a interface principal, não um anexo.\n\nA métrica de ativação também muda de nome mas não de espírito: tempo até a primeira chamada bem sucedida. Se a pessoa precisa de duas reuniões, um contrato e uma semana para conseguir uma resposta de teste, você tem um problema de produto, e nenhum time comercial resolve isso no lugar da engenharia.\n\nDX (experiência do desenvolvedor) é feita de coisas pequenas e cumulativas: exemplos que rodam colados sem edição, credencial de teste que sai em minutos, erros que dizem exatamente o que fazer, mudanças anunciadas com antecedência e um ambiente de teste que se parece com o real. O padrão de qualidade é reconhecível: quem integra consegue ir do zero ao primeiro sucesso sozinho, sem falar com ninguém da sua empresa.",
                },
                {
                    type: "table",
                    value: '[["Conceito de produto","Equivalente na API","Sinal de problema"],["Onboarding","Do cadastro à primeira chamada","Demora dias para o primeiro teste"],["Mensagem de erro","Código e descrição do erro","Erro genérico sem dizer o que fazer"],["Ativação","Primeira chamada bem sucedida","Muita credencial criada e pouco uso"],["Comunicação","Notas de versão e avisos","Cliente descobre a mudança quebrando"],["Documentação","A interface principal do produto","Exemplo que não roda como está escrito"]]',
                },
                {
                    type: "quote",
                    value: "Numa API, a documentação não acompanha o produto: ela é o produto que a pessoa usa antes de escrever a primeira linha.",
                },
                {
                    type: "text",
                    value: "## Versionamento é promessa, não detalhe\n\nQuando alguém integra com a sua API, essa pessoa escreve código que depende do seu comportamento. Mudar um campo obrigatório, renomear uma propriedade ou alterar o formato de uma resposta quebra sistemas em produção de outras empresas, às vezes sem aviso e sempre no pior horário.\n\nPor isso a regra do jogo: mudança que quebra exige versão nova, com prazo de convivência entre as versões e comunicação repetida. Adicionar campo novo costuma ser seguro; remover ou mudar o significado de um campo existente nunca é. E manter versões antigas custa caro, o que faz do ciclo de descontinuação uma decisão de produto legítima, com prazo público, avisos e acompanhamento de quem ainda não migrou.\n\nO PM de plataforma carrega uma tensão permanente: cada promessa mantida limita a liberdade de mudar amanhã. É por isso que a superfície pública deve ser a menor possível. Tudo que você expõe vira contrato, e contrato mal desenhado se paga por anos, com um custo que não aparece em nenhum relatório de sprint.",
                },
            ],
            questions: [
                {
                    statement: "O que significa DX no contexto de API?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A experiência de quem programa usando o seu produto",
                            isCorrect: true,
                        },
                        {
                            text: "O painel de métricas de uso disponível para o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "O contrato comercial firmado com empresas integradoras",
                            isCorrect: false,
                        },
                        {
                            text: "A camada de segurança que protege as chamadas recebidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a métrica de ativação típica de uma API?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O tempo até a primeira chamada bem sucedida",
                            isCorrect: true,
                        },
                        {
                            text: "A quantidade de credenciais criadas a cada mês",
                            isCorrect: false,
                        },
                        {
                            text: "O número de páginas lidas na documentação oficial",
                            isCorrect: false,
                        },
                        {
                            text: "O total de contratos assinados com empresas parceiras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que remover um campo de uma resposta é diferente de adicionar um novo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Remover quebra o código de quem já integrou com você",
                            isCorrect: true,
                        },
                        {
                            text: "Remover exige alteração no contrato comercial vigente",
                            isCorrect: false,
                        },
                        {
                            text: "Remover aumenta o tempo de resposta de todas as chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "Remover obriga a criar uma documentação inteiramente nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que manter a superfície pública da API pequena é uma boa prática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tudo que você expõe vira contrato difícil de desfazer",
                            isCorrect: true,
                        },
                        {
                            text: "APIs menores respondem mais rápido em qualquer cenário",
                            isCorrect: false,
                        },
                        {
                            text: "Documentação curta é mais fácil de traduzir para idiomas",
                            isCorrect: false,
                        },
                        {
                            text: "Menos rotas reduzem o custo cobrado pelo provedor de nuvem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A empresa precisa descontinuar uma versão antiga da API que ainda tem clientes. Qual é o caminho profissional?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Prazo público, avisos repetidos e apoio a quem falta migrar",
                            isCorrect: true,
                        },
                        {
                            text: "Desligar de uma vez, porque manter duas versões custa caro",
                            isCorrect: false,
                        },
                        {
                            text: "Manter a versão antiga para sempre e congelar as melhorias",
                            isCorrect: false,
                        },
                        {
                            text: "Migrar os clientes sem avisar, já que o comportamento é igual",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Trade-offs técnicos que o PM participa",
            blocks: [
                {
                    type: "text",
                    value: "# As decisões que ninguém pode tomar sozinho\n\nExistem escolhas técnicas que são inteiramente da engenharia, e o PM deve ficar longe delas: linguagem, padrão de código, estrutura interna dos módulos. E existem escolhas que parecem técnicas, mas mudam o produto, o prazo e o custo por anos. Nessas, o PM participa por obrigação, trazendo contexto de negócio que a engenharia sozinha não tem.\n\nCOMPRAR OU CONSTRUIR é a mais frequente. Comprar entrega rápido, custa mensalidade, cria dependência e limita a customização. Construir dá controle total, custa tempo de time caro e cria manutenção para sempre. O critério que resolve a maioria dos casos é se aquilo é o seu diferencial. Ninguém constrói o próprio provedor de email para um app de finanças; mas se o motor de projeção de imposto é o coração do Financem, terceirizá lo é entregar o produto para outra empresa.\n\nPRAZO CONTRA ROBUSTEZ é a segunda. Nem tudo precisa aguentar dez vezes o tráfego atual desde o primeiro dia. A pergunta certa é o que acontece se a aposta der certo antes do esperado, e se a resposta for um fim de semana de trabalho, o atalho é aceitável; se for perda de dado de cliente, não é.",
                },
                {
                    type: "table",
                    value: '[["Decisão","Comprar ou usar pronto","Construir por conta"],["Entrega","Rápida, em semanas","Lenta, em meses"],["Custo","Mensalidade que cresce com o uso","Time caro agora e manutenção depois"],["Controle","Limitado ao que o fornecedor permite","Total, incluindo o que der errado"],["Quando escolher","Não é o seu diferencial","É o coração da sua proposta"]]',
                },
                {
                    type: "quote",
                    value: "Atalho documentado com prazo e dono é decisão de engenharia. Atalho esquecido no meio do código é sorte esperando acabar.",
                },
                {
                    type: "text",
                    value: '## O débito consciente, escrito e com data\n\nA prática que distingue times maduros é o registro curto de decisão técnica. Meia página basta: qual era o problema, quais caminhos foram considerados, o que foi escolhido, o que se está deixando de lado e em que condição essa escolha deve ser revista. Não é burocracia; é o antídoto contra a pergunta que aparece um ano depois, quando ninguém lembra por que aquilo foi feito assim e todo mundo assume que foi incompetência.\n\nO papel do PM nesse registro é específico e insubstituível: garantir que a condição de revisão seja de negócio, não só técnica. "Revisar quando passarmos de cinco mil clientes ativos" é acionável e observável. "Revisar quando o sistema começar a dar problema" é uma frase que nunca dispara, porque ninguém está olhando.\n\nE existe uma responsabilidade que é sua sozinho: não deixar o atalho virar padrão silencioso. Se o time escolheu três vezes seguidas a versão rápida por causa de data, isso não é agilidade, é uma decisão estratégica sendo tomada por omissão, uma sprint de cada vez, e ela vai cobrar a conta inteira de uma vez só.',
                },
            ],
            questions: [
                {
                    statement:
                        "Qual critério resolve a maioria das decisões de comprar ou construir?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Se aquilo é o diferencial do seu produto ou não",
                            isCorrect: true,
                        },
                        {
                            text: "Se o time tem experiência prévia com a tecnologia usada",
                            isCorrect: false,
                        },
                        {
                            text: "Se o fornecedor é uma empresa reconhecida no mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Se o orçamento do trimestre comporta a mensalidade nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um registro de decisão técnica deve conter?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Problema, opções, escolha e quando revisar isso",
                            isCorrect: true,
                        },
                        {
                            text: "O nome de quem propôs e de quem aprovou a solução",
                            isCorrect: false,
                        },
                        {
                            text: "O detalhamento completo do código que será escrito",
                            isCorrect: false,
                        },
                        {
                            text: "A estimativa em horas de cada pessoa envolvida nela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a pergunta certa no trade-off entre prazo e robustez?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que acontece se a aposta der certo antes do esperado?",
                            isCorrect: true,
                        },
                        {
                            text: "Quantos usuários simultâneos a concorrência aguenta hoje?",
                            isCorrect: false,
                        },
                        {
                            text: "Qual tecnologia é considerada mais moderna neste momento?",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto tempo o time levaria para reescrever tudo depois?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel específico do PM no registro de decisão técnica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Garantir que a condição de revisão seja de negócio",
                            isCorrect: true,
                        },
                        {
                            text: "Escolher a solução técnica que será adotada pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovar formalmente o documento antes da implementação",
                            isCorrect: false,
                        },
                        {
                            text: "Traduzir o documento para a linguagem da área comercial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time escolheu a versão rápida por causa da data em três entregas seguidas. Como ler isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Virou decisão estratégica tomada por omissão a cada sprint",
                            isCorrect: true,
                        },
                        {
                            text: "É agilidade saudável e mostra maturidade na entrega contínua",
                            isCorrect: false,
                        },
                        {
                            text: "É problema exclusivo da engenharia, que aceitou os atalhos",
                            isCorrect: false,
                        },
                        {
                            text: "É irrelevante enquanto os prazos combinados forem cumpridos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Incidentes e qualidade",
            blocks: [
                {
                    type: "text",
                    value: "# O que o PM faz quando o produto cai\n\nDurante um incidente, quem conduz a resolução técnica é a engenharia, e a pior coisa que um PM pode fazer é entrar na sala perguntando de dez em dez minutos quanto falta. Mas ficar de fora também não é opção, porque existe um trabalho que é seu e que ninguém mais vai fazer.\n\nSão quatro frentes. IMPACTO: quantos usuários, quais operações, qual dado corre risco. Essa resposta orienta a urgência e evita tanto o pânico desnecessário quanto a calma indevida. COMUNICAÇÃO: informar cliente, suporte e liderança com honestidade e ritmo previsível, porque silêncio durante uma queda é interpretado como descaso ou como incompetência. DECISÃO DE PRODUTO: aceitar degradar uma funcionalidade para restaurar o resto, ou desligar algo temporariamente, é escolha de negócio. PROTEÇÃO DO TIME: segurar a ansiedade de fora para que quem está resolvendo consiga trabalhar.\n\nO padrão de comunicação que funciona é simples: dizer o que se sabe, o que não se sabe e quando haverá a próxima atualização, mesmo que a próxima atualização seja para dizer que ainda não há novidade.",
                },
                {
                    type: "table",
                    value: '[["Momento","Papel da engenharia","Papel do PM"],["Detecção","Confirmar e medir o alcance","Traduzir o alcance em impacto ao usuário"],["Mitigação","Estancar o problema","Decidir o que pode ser degradado"],["Comunicação","Informar o estado técnico","Falar com cliente, suporte e liderança"],["Correção","Resolver a causa raiz","Reordenar o plano da semana"],["Post mortem","Explicar a cadeia de falhas","Levar as ações para o backlog real"]]',
                },
                {
                    type: "quote",
                    value: "Post mortem que termina com o nome de um culpado ensina o time a esconder erro, e o próximo incidente chega mais tarde e pior.",
                },
                {
                    type: "text",
                    value: "## Post mortem sem culpa e a qualidade invisível\n\nA análise pós incidente parte de uma premissa: as pessoas agiram de forma razoável com a informação que tinham no momento. O objetivo não é encontrar quem apertou o botão, é entender por que o sistema permitiu que apertar aquele botão derrubasse tudo. Onde estava o teste, o alerta, o limite, a confirmação, a reversão automática?\n\nO PM tem uma responsabilidade concreta aqui, e é onde a maioria falha. As ações combinadas no post mortem precisam entrar no backlog de verdade, com prioridade real, e não numa lista paralela que ninguém abre. Post mortem cujas ações nunca são executadas é teatro caro, e o time percebe isso na segunda vez.\n\nQualidade, no fim, é uma feature invisível: ninguém abre o app para elogiar que ele não caiu. Ela só aparece na ausência, e por isso perde todas as disputas de priorização feitas por empolgação. Cabe ao PM dar a ela um lugar permanente no plano, com números que a tornem visível, como tempo fora do ar, taxa de erro e incidentes por trimestre. O que não é medido não é defendido.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel do PM durante um incidente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Medir impacto, comunicar e proteger quem resolve",
                            isCorrect: true,
                        },
                        {
                            text: "Conduzir a investigação técnica junto com a engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrar prazo de resolução a cada dez minutos no canal",
                            isCorrect: false,
                        },
                        {
                            text: "Aguardar o fim para saber o que aconteceu no relatório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um post mortem sem culpa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Busca o que o sistema permitiu, não quem errou",
                            isCorrect: true,
                        },
                        {
                            text: "Evita registrar por escrito os detalhes da falha ocorrida",
                            isCorrect: false,
                        },
                        {
                            text: "Envolve apenas a liderança técnica na análise do ocorrido",
                            isCorrect: false,
                        },
                        {
                            text: "Conclui que o incidente não poderia ter sido evitado antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o padrão de comunicação recomendado durante uma queda?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dizer o que se sabe, o que falta e quando haverá notícia",
                            isCorrect: true,
                        },
                        {
                            text: "Só comunicar quando o problema estiver completamente resolvido",
                            isCorrect: false,
                        },
                        {
                            text: "Divulgar uma previsão otimista para acalmar os clientes afetados",
                            isCorrect: false,
                        },
                        {
                            text: "Encaminhar todas as perguntas para o time técnico de plantão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que qualidade é chamada de feature invisível?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ninguém elogia o app por não ter caído nesta semana",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o time de engenharia trabalha nela sem ser notado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o esforço de teste não aparece no quadro da sprint",
                            isCorrect: false,
                        },
                        {
                            text: "Porque ela não pode ser medida por nenhum indicador direto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "As ações do último post mortem ficaram numa lista à parte e nada foi feito. Qual é a consequência?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O ritual vira teatro e o time deixa de levar a sério",
                            isCorrect: true,
                        },
                        {
                            text: "A engenharia perde acesso ao histórico técnico do incidente",
                            isCorrect: false,
                        },
                        {
                            text: "O cliente afetado tem direito automático a compensação legal",
                            isCorrect: false,
                        },
                        {
                            text: "O incidente é reclassificado como problema menor pelo sistema",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - IA no trabalho de produto",
    aulas: [
        {
            titulo: "O que mudou de verdade",
            blocks: [
                {
                    type: "text",
                    value: "# A ferramenta que virou requisito\n\nEm 2026, saber usar IA no trabalho de produto deixou de ser diferencial curioso e virou linha de requisito em boa parte das vagas de PM no Brasil. A leitura correta não é que a IA substitui o PM: é que ela apagou o piso das tarefas mecânicas do ofício. Ler mil comentários, transformar rascunho em texto apresentável, montar uma primeira versão de tela, resumir uma hora de entrevista. Tudo isso encolheu de dias para minutos.\n\nO que NÃO mudou é a parte que sempre foi o trabalho de verdade: decidir o que fazer, com quem falar, o que recusar, como priorizar sob incerteza e como convencer um time a caminhar junto. A IA acelera a produção de artefato; ela não assume a responsabilidade pela escolha. E responsabilidade é justamente o que a empresa paga quando contrata um PM.\n\nA consequência prática é desconfortável e honesta. Se o seu valor estava concentrado em produzir documento bonito, esse valor caiu de preço. Se o seu valor está em diagnóstico, julgamento e articulação com pessoas, a IA virou uma alavanca que te dá mais tempo exatamente para o que só você faz.",
                },
                {
                    type: "table",
                    value: '[["Tarefa","Antes","Com IA em 2026","Quem continua responsável"],["Ler feedback em volume","Dias de leitura manual","Minutos com amostragem conferida","Você, pela interpretação"],["Primeiro rascunho de doc","Horas em página em branco","Minutos para ter o esqueleto","Você, pelo diagnóstico"],["Protótipo navegável","Dias com apoio de design","Horas para testar um conceito","Você, pelo que será testado"],["Resumo de entrevista","Transcrever e destacar","Resumo em minutos, com citações","Você, por checar no original"]]',
                },
                {
                    type: "quote",
                    value: "A IA encolheu o custo de produzir artefato. Ela não encolheu em nada o custo de estar errado sobre o que importa.",
                },
                {
                    type: "text",
                    value: "## Onde ela acelera de verdade e onde ela atrapalha\n\nA regra que tem funcionado é olhar o tipo de tarefa. A IA rende muito quando o trabalho é de VOLUME (muitos itens parecidos), de PRIMEIRA VERSÃO (partir de algo em vez do vazio) e de TRADUÇÃO (mudar o mesmo conteúdo de formato ou de público). Nesses três, o ganho é imediato e o risco é gerenciável, porque você consegue conferir o resultado.\n\nEla atrapalha, e às vezes de forma cara, quando o trabalho depende de contexto que não está escrito em lugar nenhum: a política interna, o histórico daquele cliente, o motivo pelo qual aquela decisão foi tomada em 2024, o que a diretoria realmente quis dizer na reunião. A IA preenche esses buracos com material plausível, e plausível é exatamente o tipo de erro que passa despercebido numa leitura rápida.\n\nUm efeito colateral novo merece atenção. Quando produzir fica barato, a tentação é produzir mais: mais documento, mais slide, mais proposta. O time que cai nessa troca reflexão por volume e inunda todo mundo de material que ninguém lê. Produzir mais rápido só vale se você usar o tempo economizado para pensar melhor, e isso é uma decisão sua, não da ferramenta.",
                },
            ],
            questions: [
                {
                    statement: "O que a IA mudou no trabalho de produto em 2026?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reduziu muito o custo de produzir artefatos do dia a dia",
                            isCorrect: true,
                        },
                        {
                            text: "Passou a tomar as decisões de priorização no lugar do PM",
                            isCorrect: false,
                        },
                        {
                            text: "Substituiu a pesquisa com usuários na maior parte dos casos",
                            isCorrect: false,
                        },
                        {
                            text: "Eliminou a necessidade de conversar com o time de engenharia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em quais tipos de tarefa a IA rende mais no trabalho de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Volume, primeira versão e tradução de formato",
                            isCorrect: true,
                        },
                        {
                            text: "Negociação com stakeholders difíceis da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Definição da estratégia do produto para o próximo ano",
                            isCorrect: false,
                        },
                        {
                            text: "Escolha de qual cliente merece atenção prioritária agora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a IA erra mais quando o contexto não está escrito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela preenche os buracos com material apenas plausível",
                            isCorrect: true,
                        },
                        {
                            text: "Ela se recusa a responder quando falta informação no pedido",
                            isCorrect: false,
                        },
                        {
                            text: "Ela consulta apenas documentos públicos disponíveis na web",
                            isCorrect: false,
                        },
                        {
                            text: "Ela precisa de acesso ao banco de dados para funcionar bem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o efeito colateral de produzir artefatos ficar barato demais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O time troca reflexão por volume de material que ninguém lê",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas passam a cobrar por documento gerado no mês",
                            isCorrect: false,
                        },
                        {
                            text: "Os documentos ficam longos demais para o formato das reuniões",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa precisa contratar mais gente para revisar os textos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Se produzir documento ficou barato, onde passa a estar o valor do PM?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "No diagnóstico, no julgamento e na articulação",
                            isCorrect: true,
                        },
                        {
                            text: "Na velocidade de gerar mais entregáveis que os colegas",
                            isCorrect: false,
                        },
                        {
                            text: "No domínio técnico das ferramentas de IA mais recentes",
                            isCorrect: false,
                        },
                        {
                            text: "Na quantidade de reuniões conduzidas ao longo da semana",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Análise de feedback em volume",
            blocks: [
                {
                    type: "text",
                    value: "# Mil comentários numa tarde\n\nEste é o caso em que o ganho é mais claro e mais fácil de defender. O Financem acumulou, em um trimestre, cerca de três mil mensagens entre tíquetes de suporte, avaliações na loja, respostas de pesquisa e posts em comunidade. Ler tudo à mão levaria uma semana de trabalho e ninguém tem essa semana, então o que acontecia antes era pior: alguém lia cinquenta mensagens, formava uma impressão e apresentava como se fosse a voz da base.\n\nO caminho com LLM é direto. Você define as categorias que interessam ao produto (por exemplo: dificuldade de conectar receita, dúvida sobre imposto, preço, desempenho, elogio, pedido de funcionalidade), pede a classificação de cada mensagem em uma dessas categorias mais um grau de intensidade, e depois um resumo por categoria com três citações literais como evidência. O resultado é uma tabela com contagem por tema e exemplos reais para abrir a discussão.\n\nA parte que separa análise séria de teatro automatizado é a AMOSTRAGEM DE CONFERÊNCIA. Você sorteia algo entre trinta e cinquenta mensagens já classificadas, lê à mão e compara. Se a taxa de acerto for boa, você confia no restante. Se estiver ruim, ajusta as categorias e roda de novo, porque o erro quase sempre está na definição, não no modelo.",
                },
                {
                    type: "table",
                    value: '[["Etapa","O que a IA faz","O que você faz"],["Definir categorias","Sugere um primeiro conjunto","Decide o que importa para o produto"],["Classificar","Separa milhares de mensagens","Confere uma amostra sorteada à mão"],["Resumir por tema","Escreve o resumo com citações","Lê as citações no texto original"],["Quantificar","Conta por categoria e intensidade","Cruza com dado de uso e receita"],["Decidir","Nada","Prioriza e assume a escolha"]]',
                },
                {
                    type: "quote",
                    value: "Sem amostra conferida à mão, a análise automática não é evidência: é uma opinião com aparência de planilha.",
                },
                {
                    type: "text",
                    value: "## Os erros que essa análise esconde\n\nO primeiro é confundir volume com importância. Trezentas reclamações sobre a cor de um botão e quinze sobre perda de dado não empatam, e a contagem sozinha sugere o contrário. Por isso a saída do modelo precisa ser cruzada com dado de uso, receita e gravidade antes de virar prioridade.\n\nO segundo é o viés de quem escreve. Quem manda mensagem é quem está muito irritado ou muito satisfeito; o usuário morno, que é a maioria, fica calado. A análise mostra as pontas, não a base. Isso não invalida o resultado, apenas define o que ele pode responder: ela diz quais temas existem e com que peso relativo entre quem fala, não qual é a opinião média da sua base.\n\nO terceiro é a citação inventada. Peça sempre trecho literal e faça a conferência de pelo menos algumas delas no texto original. É um teste barato, leva minutos, e é a diferença entre levar evidência para a reunião e levar uma frase bonita que ninguém escreveu. Quando esse tipo de erro é descoberto por outra pessoa na sala, o custo não é o da análise: é o da sua credibilidade.",
                },
            ],
            questions: [
                {
                    statement: "Como usar LLM para analisar milhares de mensagens de feedback?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Classificar por categoria e resumir com citações reais",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir ao modelo que decida o que deve entrar no roadmap",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher as cinquenta mensagens mais recentes para leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Solicitar uma nota de satisfação geral para a base inteira",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é a amostragem de conferência nessa análise?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ler à mão algumas mensagens já classificadas pelo modelo",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir ao modelo que revise a própria classificação outra vez",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar a mesma análise com dois modelos diferentes e comparar",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar as categorias para o time de suporte validar por escrito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que volume de reclamações não define prioridade sozinho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gravidade e impacto variam muito entre os temas citados",
                            isCorrect: true,
                        },
                        {
                            text: "A contagem por categoria costuma vir errada nos modelos atuais",
                            isCorrect: false,
                        },
                        {
                            text: "Reclamações são registradas com atraso pelo time de suporte",
                            isCorrect: false,
                        },
                        {
                            text: "O número de mensagens depende do canal em que foram escritas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que viés a análise de feedback escrito sempre carrega?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem escreve são as pontas, e o usuário morno fica calado",
                            isCorrect: true,
                        },
                        {
                            text: "Os canais de texto atraem apenas usuários mais experientes",
                            isCorrect: false,
                        },
                        {
                            text: "Mensagens antigas pesam mais que as recentes na contagem",
                            isCorrect: false,
                        },
                        {
                            text: "Clientes pagantes escrevem menos do que os usuários gratuitos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O resumo trouxe uma citação forte que ninguém encontra no material original. O que fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Descartar e conferir o resto, porque pode ser invenção",
                            isCorrect: true,
                        },
                        {
                            text: "Usar mesmo assim, já que ela representa bem o sentimento",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir ao modelo que confirme a origem daquela citação",
                            isCorrect: false,
                        },
                        {
                            text: "Manter na apresentação e avisar que é apenas ilustrativa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Protótipo e discovery acelerados",
            blocks: [
                {
                    type: "text",
                    value: "# Do conceito à tela em uma tarde\n\nA segunda mudança concreta é a velocidade de sair da ideia para algo que uma pessoa consegue ver e usar. Descrever um fluxo em texto e receber uma versão navegável em poucas horas mudou a economia do teste: o custo de mostrar caiu tanto que não existe mais desculpa para testar conceito só depois de duas sprints de construção.\n\nIsso reforça uma prática que você já viu no discovery: escolher a fidelidade certa. Para descobrir se o problema existe, papel continua ganhando. Para descobrir se a pessoa entende o fluxo, protótipo clicável basta. E agora entrou uma opção que antes era cara demais: o protótipo com dado de mentira mas comportamento realista, que serve para testar entendimento de coisas dinâmicas, como uma projeção que muda conforme você mexe nos números.\n\nO uso mais subestimado é o exploratório. Gerar três versões diferentes do mesmo fluxo e colocá las lado a lado na frente de cinco usuários rende mais aprendizado do que polir uma única versão até o pixel. Antes isso era proibitivo, porque cada alternativa custava dias de trabalho de alguém. Agora custa uma manhã, e a conversa com o usuário fica muito melhor quando existe comparação em vez de aprovação.",
                },
                {
                    type: "table",
                    value: '[["Pergunta a responder","Fidelidade adequada","O que a IA acelera"],["O problema existe?","Nenhuma: conversa com usuário","Quase nada, e tudo bem"],["A pessoa entende o fluxo?","Protótipo clicável simples","Gerar telas e variações rápido"],["A projeção faz sentido?","Protótipo com dado simulado","Comportamento realista sem backend"],["Qual das três versões?","Alternativas lado a lado","Criar variantes em poucas horas"],["Aguenta escala?","Prova técnica com engenharia","Nada: é trabalho de verdade"]]',
                },
                {
                    type: "quote",
                    value: "Prototipar rápido só ajuda quem escolheu bem a pergunta: velocidade em cima da dúvida errada é desperdício mais eficiente.",
                },
                {
                    type: "text",
                    value: "## O risco de polir a coisa errada mais rápido\n\nExiste um perigo específico nessa aceleração, e ele é sutil. Quando produzir protótipo fica barato, a etapa de decidir O QUE testar é a primeira a ser pulada. O time gera cinco telas lindas de uma funcionalidade que ninguém pediu, mostra para stakeholders, todo mundo se anima com o visual e a pergunta original (esse problema vale a pena resolver?) nunca é feita.\n\nO segundo risco é o encantamento pela aparência. Protótipo bonito recebe elogio; protótipo feio recebe crítica útil. Quando o material parece pronto, o usuário e o stakeholder passam a comentar cor e fonte em vez de dizer se aquilo resolve a vida deles. Já vi discovery inteiro se perder porque a tela estava boa demais para a fase em que estava.\n\nA defesa é velha e continua valendo: antes de gerar qualquer coisa, escreva a pergunta que o protótipo precisa responder e o que você faria se a resposta fosse não. Se não existe resposta possível que mude a sua decisão, você não está testando nada; está produzindo material de convencimento, e é melhor admitir isso desde o começo.",
                },
            ],
            questions: [
                {
                    statement: "O que a IA mudou na prototipação de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O custo de sair da ideia para algo navegável despencou",
                            isCorrect: true,
                        },
                        {
                            text: "A necessidade de conversar com usuários deixou de existir",
                            isCorrect: false,
                        },
                        {
                            text: "O protótipo passou a substituir a construção do produto real",
                            isCorrect: false,
                        },
                        {
                            text: "A escolha de fidelidade deixou de importar em qualquer teste",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual uso de protótipo ficou viável e antes era caro demais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Criar três versões do fluxo e comparar com usuários",
                            isCorrect: true,
                        },
                        {
                            text: "Testar o desempenho da aplicação sob carga muito alta",
                            isCorrect: false,
                        },
                        {
                            text: "Validar a integração com sistemas externos do cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Medir a retenção real da funcionalidade ao longo de meses",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o principal risco de prototipar muito rápido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pular a etapa de decidir o que vale a pena testar",
                            isCorrect: true,
                        },
                        {
                            text: "Gastar orçamento demais com ferramentas de prototipação",
                            isCorrect: false,
                        },
                        {
                            text: "Perder o histórico das versões criadas ao longo do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar o time de design sem trabalho durante alguns meses",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um protótipo bonito demais pode atrapalhar o discovery?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As pessoas comentam cor e fonte em vez de dizer se resolve",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo de produção acaba consumindo a agenda de pesquisa",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário passa a exigir aquele mesmo visual no produto final",
                            isCorrect: false,
                        },
                        {
                            text: "A engenharia se recusa a construir algo diferente do mostrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Antes de gerar um protótipo, qual pergunta revela se o teste é real?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O que eu faria diferente se a resposta fosse não?",
                            isCorrect: true,
                        },
                        {
                            text: "Quanto tempo o time vai levar para construir isso depois?",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos usuários preciso convidar para a sessão de teste?",
                            isCorrect: false,
                        },
                        {
                            text: "Qual ferramenta gera o resultado visual mais convincente?",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Documentos com IA sem terceirizar o pensar",
            blocks: [
                {
                    type: "text",
                    value: "# O rascunho é da máquina, a decisão é sua\n\nDocumento de produto tem duas camadas que costumam ser confundidas. A camada de FORMA é a organização, a redação, a estrutura de tópicos, o resumo executivo, a versão curta para a diretoria. A camada de SUBSTÂNCIA é o diagnóstico do problema, a escolha do que fazer, o que está sendo deixado de fora e por quê, e o critério de sucesso que você vai defender depois.\n\nA IA é excelente na forma e perigosa na substância. Se você entrega o contexto e pede o esqueleto, ganha meia hora e começa de um lugar melhor que a página em branco. Se você pede que ela decida a estratégia, recebe um texto convincente, genérico e sem dono, que qualquer pessoa da sala consegue identificar como vazio na primeira pergunta difícil.\n\nA prática que funciona é inverter a ordem habitual. Primeiro você escreve, com as suas palavras e sem capricho nenhum, o diagnóstico e a decisão: seis linhas bastam. Só depois entrega isso para a IA organizar, expandir e adaptar ao público. O documento sai com a sua cabeça dentro, e o tempo economizado é o da digitação, não o do pensamento.",
                },
                {
                    type: "code",
                    value: "CONTEXTO\nProduto: Financem, financas para autonomos no Brasil.\nPublico do doc: time de engenharia e design (6 pessoas).\nProblema: 62% conectam a receita e so 24% chegam a ver a projecao.\nDecisao ja tomada por mim: atacar a etapa de conciliacao, nao o cadastro.\nFora de escopo agora: app novo, integracao bancaria automatica.\nMetrica: ativacao de 24% para 40% em 8 semanas.\n\nTAREFA\nOrganize isso num documento de uma pagina com: contexto, problema com\nnumero, decisao, o que fica fora, criterio de sucesso e riscos.\n\nREGRAS\n- Nao invente numero nenhum: use somente os que estao acima.\n- Se faltar informacao, escreva [FALTA: o que falta] em vez de supor.\n- Tom direto, frases curtas, sem adjetivo de marketing.\n- Liste no fim as 3 perguntas que um cetico faria neste documento.",
                },
                {
                    type: "quote",
                    value: "Se você não consegue defender cada frase do documento sem o texto na frente, ele não é seu, e a reunião vai mostrar isso.",
                },
                {
                    type: "table",
                    value: '[["Camada do documento","Quem faz melhor","Sinal de que inverteu"],["Diagnóstico do problema","Você, com os dados na mão","Texto genérico que serve a qualquer produto"],["Decisão e o que fica fora","Você, assumindo a escolha","Nenhuma alternativa foi descartada"],["Organização e estrutura","IA, a partir do seu material","Documento desorganizado e repetitivo"],["Versão curta para liderança","IA, com a sua revisão","Resumo que muda o sentido do original"],["Números e evidências","Você, sempre","Aparece um dado que ninguém sabe de onde veio"]]',
                },
                {
                    type: "text",
                    value: "## Três regras que evitam o constrangimento\n\nA primeira: proíba invenção de número no próprio pedido. Modelos preenchem lacuna com valor verossímil, e um dado inventado num documento de produto circula pela empresa e volta como fato citado por outra pessoa meses depois. Peça explicitamente que a falta seja marcada em vez de suprida.\n\nA segunda: peça a crítica junto com o texto. Pedir as três perguntas que um cético faria transforma a ferramenta em revisor e prepara você para a reunião de verdade. É o uso com melhor retorno por minuto investido que eu conheço no trabalho de produto.\n\nA terceira: leia o resultado inteiro antes de mandar para alguém, e reescreva pelo menos uma parte com as suas palavras. Isso não é vaidade autoral. Documento passa a valer na hora em que alguém questiona, e quem não escreveu de fato não sustenta a defesa. Some a isso um combinado de time sobre transparência: dizer que o rascunho saiu com apoio de IA é normal em 2026 e evita conversa desagradável depois, principalmente quando o documento vira base de decisão para outras áreas.",
                },
            ],
            questions: [
                {
                    statement: "Em qual camada do documento a IA ajuda mais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Na forma: organização, redação e estrutura do texto",
                            isCorrect: true,
                        },
                        {
                            text: "Na substância: diagnóstico do problema e decisão tomada",
                            isCorrect: false,
                        },
                        {
                            text: "Na escolha das métricas que o time vai defender depois",
                            isCorrect: false,
                        },
                        {
                            text: "Na negociação do prazo com as áreas que dependem disso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual ordem de trabalho evita terceirizar o pensamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escrever o diagnóstico primeiro e pedir a organização depois",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir o documento completo e revisar apenas o resultado final",
                            isCorrect: false,
                        },
                        {
                            text: "Gerar três versões e escolher a que parecer mais convincente",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar o rascunho da IA ao time e coletar comentários depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que pedir que a IA marque a informação faltante em vez de supor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dado inventado circula pela empresa e volta como fato",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo trava quando não encontra a informação pedida",
                            isCorrect: false,
                        },
                        {
                            text: "Documentos incompletos são recusados pelas áreas de risco",
                            isCorrect: false,
                        },
                        {
                            text: "A marcação reduz o custo por token cobrado pela ferramenta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual pedido transforma a IA em revisora do seu documento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Listar as três perguntas que um cético faria no texto",
                            isCorrect: true,
                        },
                        {
                            text: "Reescrever o documento inteiro num tom mais formal",
                            isCorrect: false,
                        },
                        {
                            text: "Resumir o conteúdo em um parágrafo para a liderança",
                            isCorrect: false,
                        },
                        {
                            text: "Traduzir o material para o inglês antes de compartilhar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na reunião, alguém questiona um trecho do documento e você não sabe sustentar. O que isso revela?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A substância foi delegada, e não só a redação do texto",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo usado não tinha qualidade suficiente para a tarefa",
                            isCorrect: false,
                        },
                        {
                            text: "O documento ficou longo demais para ser lido com atenção",
                            isCorrect: false,
                        },
                        {
                            text: "A pergunta estava fora do escopo combinado para a reunião",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Limites e responsabilidade",
            blocks: [
                {
                    type: "text",
                    value: "# O que você assina quando usa\n\nUsar IA no trabalho de produto traz quatro limites que não são detalhe técnico, são responsabilidade profissional. Quem apresenta o material responde por ele, e nenhuma explicação sobre como a ferramenta funciona conserta uma decisão errada tomada em cima de dado inventado.\n\nALUCINAÇÃO: o modelo produz conteúdo plausível e falso com a mesma segurança com que produz conteúdo correto. Número de mercado, citação de usuário, referência de estudo e nome de concorrente são os casos mais frequentes no trabalho de produto, justamente porque parecem verificáveis e quase nunca são verificados.\n\nVIÉS: o modelo aprendeu com texto do mundo, e o mundo tem viés. Perfis de usuário gerados automaticamente tendem ao usuário médio de classe média urbana com bom aparelho e boa conexão, o que apaga exatamente as pessoas que você mais precisava enxergar num produto brasileiro. Persona gerada por IA é ponto de partida para investigar, nunca substituto de pesquisa com gente real.\n\nDADO SENSÍVEL: colar transcrição de entrevista com nome, telefone e situação financeira de uma pessoa numa ferramenta qualquer é tratamento de dado pessoal, com tudo que a LGPD implica.",
                },
                {
                    type: "table",
                    value: '[["Limite","Como aparece no trabalho","Defesa prática"],["Alucinação","Número de mercado e citação inventados","Conferir na fonte antes de usar"],["Viés","Persona média que apaga quem importa","Validar com pesquisa e dado real"],["Dado sensível","Transcrição com nome e telefone","Anonimizar antes de qualquer envio"],["Opacidade","Não dá para saber de onde veio","Não usar como evidência sozinha"],["Dependência","Time perde o hábito de pensar junto","Manter a discussão antes do rascunho"]]',
                },
                {
                    type: "quote",
                    value: "A ferramenta não assina nada. Quem leva o material para a reunião responde por cada número que estiver ali dentro.",
                },
                {
                    type: "text",
                    value: "## LGPD, ferramenta aprovada e transparência com o time\n\nNo Brasil, a LGPD vale para tratamento de dado pessoal, e colar conteúdo com dado de usuário numa ferramenta externa é tratamento. As perguntas que a sua empresa precisa ter respondido são concretas: a ferramenta está aprovada pelo jurídico e pela segurança? Existe contrato que impede uso dos dados para treinamento? Onde o dado fica armazenado e por quanto tempo? A base legal daquele uso está clara?\n\nEnquanto essas respostas não existirem, a regra segura é simples: anonimize sempre. Troque nome por identificador, remova telefone, email, documento e endereço, e reduza qualquer detalhe que identifique alguém sozinho. Para a maior parte da análise de produto, você não precisa saber quem é a pessoa, precisa saber o padrão. Se precisar do individual, faça no ambiente aprovado.\n\nPor fim, a transparência com o time. Combinar como o grupo usa IA (o que pode entrar, o que nunca entra, o que precisa ser sinalizado) evita dois extremos igualmente ruins: o uso escondido, que cria material sem revisão, e a proibição total, que empurra o uso para o celular pessoal, longe de qualquer controle. Em 2026, fingir que ninguém usa é a política menos segura de todas.",
                },
            ],
            questions: [
                {
                    statement: "O que é alucinação no uso de IA?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O modelo gerar conteúdo plausível que é simplesmente falso",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo se recusar a responder perguntas sobre certos temas",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo demorar demais para responder pedidos muito longos",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo repetir a mesma resposta para perguntas diferentes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que colar transcrição de entrevista numa ferramenta externa é delicado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É tratamento de dado pessoal e a LGPD se aplica",
                            isCorrect: true,
                        },
                        {
                            text: "O arquivo pode ficar grande demais para o limite da ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "O modelo entende pior textos falados do que textos escritos",
                            isCorrect: false,
                        },
                        {
                            text: "A transcrição automática costuma trocar palavras importantes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o problema típico de uma persona gerada por IA?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela tende ao usuário médio e apaga quem mais importa",
                            isCorrect: true,
                        },
                        {
                            text: "Ela costuma vir longa demais para caber numa apresentação",
                            isCorrect: false,
                        },
                        {
                            text: "Ela não pode ser usada em documentos internos por contrato",
                            isCorrect: false,
                        },
                        {
                            text: "Ela exige revisão jurídica antes de circular pela empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a regra segura enquanto a empresa não aprovou uma ferramenta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Anonimizar sempre antes de enviar qualquer conteúdo",
                            isCorrect: true,
                        },
                        {
                            text: "Usar apenas em textos internos que não citam clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir autorização verbal ao usuário antes de cada análise",
                            isCorrect: false,
                        },
                        {
                            text: "Limitar o uso a resumos curtos de menos de mil palavras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que proibir totalmente o uso de IA no time costuma piorar o controle?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O uso migra para o aparelho pessoal, fora de qualquer regra",
                            isCorrect: true,
                        },
                        {
                            text: "A produtividade cai e o time perde prazo em todas as entregas",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa passa a descumprir exigências legais de inovação",
                            isCorrect: false,
                        },
                        {
                            text: "Os concorrentes contratam os profissionais mais atualizados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Carreira em produto",
    aulas: [
        {
            titulo: "Níveis e expectativas",
            blocks: [
                {
                    type: "text",
                    value: "# O que muda de um nível para o outro\n\nTítulos variam muito entre empresas, mas a progressão em produto costuma seguir três eixos: ESCOPO (o tamanho do problema que você recebe), AUTONOMIA (quanto de direção vem pronto) e INFLUÊNCIA (quantas pessoas seguem o seu raciocínio sem que você mande em nenhuma delas).\n\nAPM ou Product Analyst trabalha com problema recortado e apoio próximo. A entrega esperada é execução confiável: história bem escrita, dado bem apurado, aprendizado bem registrado. PM assume uma área e o ciclo inteiro, do discovery à métrica pós lançamento, com autonomia para decidir dentro de uma estratégia dada por outra pessoa. PM Sênior recebe problema ambíguo, do tipo que chega em uma frase vaga, e é dele o trabalho de transformar aquilo em diagnóstico, plano e prioridade sem pedir tradução. GPM ou líder de produto passa a responder por um conjunto de times, e a partir daí o trabalho principal vira desenvolver pessoas e alinhar áreas, não escrever documento.\n\nA armadilha comum é achar que o próximo nível é uma versão mais rápida do atual. Não é. Cada degrau troca a natureza da tarefa, e é por isso que gente excelente na execução pode travar quando o problema chega sem contorno.",
                },
                {
                    type: "table",
                    value: '[["Nível","Escopo típico","Autonomia","Sinal de que está no nível"],["APM ou Analyst","Recorte de uma área maior","Direção vem definida","Executa bem e registra aprendizado"],["PM","Uma área e o ciclo completo","Decide dentro da estratégia","Roda discovery e entrega sozinho"],["PM Sênior","Problema ambíguo e amplo","Define o próprio caminho","Transforma frase vaga em plano claro"],["GPM ou líder","Conjunto de times e temas","Define estratégia da área","Desenvolve gente e alinha áreas"]]',
                },
                {
                    type: "quote",
                    value: "Não se sobe de nível fazendo mais rápido o trabalho do nível atual: sobe se quando a natureza do problema muda.",
                },
                {
                    type: "text",
                    value: "## Como pedir promoção sem constrangimento\n\nA conversa de promoção funciona melhor quando começa cedo e sem drama. Pergunte à sua liderança, com meses de antecedência, quais são os critérios concretos do próximo nível naquela empresa e que evidência ela precisaria ver. Anote a resposta. Isso transforma um assunto emocional numa lista verificável, e protege os dois lados de mal entendido.\n\nO caminho mais confiável é o mesmo em quase toda organização: exercer o nível seguinte antes de recebê lo. Peça um problema mais ambíguo, assuma uma iniciativa que atravessa times, ajude alguém mais novo a crescer. Promoção, na maior parte dos casos, é o reconhecimento formal de um comportamento que já existe, não uma aposta em potencial.\n\nDuas notas de realidade brasileira. Primeira: os títulos são bagunçados, e um PM Pleno numa empresa faz o trabalho de um Sênior em outra, então compare responsabilidades, não crachás. Segunda: mudar de empresa continua sendo, com frequência, o caminho mais rápido para salto de faixa salarial, e vale saber disso sem transformar em regra. Trocar de contexto tem custo real: você recomeça a construção de confiança do zero, e confiança é a moeda que sustenta influência.",
                },
            ],
            questions: [
                {
                    statement: "Quais eixos definem a progressão de carreira em produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escopo, autonomia e influência sobre outras pessoas",
                            isCorrect: true,
                        },
                        {
                            text: "Tempo de casa, formação acadêmica e certificações obtidas",
                            isCorrect: false,
                        },
                        {
                            text: "Número de entregas feitas e de reuniões conduzidas por mês",
                            isCorrect: false,
                        },
                        {
                            text: "Tamanho do time liderado e orçamento sob responsabilidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o trabalho de um PM Sênior?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Receber problema ambíguo e transformar em plano claro",
                            isCorrect: true,
                        },
                        {
                            text: "Executar com rapidez as decisões tomadas pela liderança",
                            isCorrect: false,
                        },
                        {
                            text: "Coordenar a agenda de vários times de engenharia ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Responder pelo resultado financeiro da unidade de negócio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que muda quando alguém vira líder de produto ou GPM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O trabalho principal vira desenvolver gente e alinhar áreas",
                            isCorrect: true,
                        },
                        {
                            text: "O volume de documentos escritos por semana cresce bastante",
                            isCorrect: false,
                        },
                        {
                            text: "A responsabilidade por discovery passa a ser exclusivamente sua",
                            isCorrect: false,
                        },
                        {
                            text: "A relação com engenharia deixa de fazer parte da rotina diária",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o caminho mais confiável para uma promoção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Exercer o nível seguinte antes de receber o título",
                            isCorrect: true,
                        },
                        {
                            text: "Acumular tempo de casa até completar o ciclo esperado",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o número de entregas feitas em cada trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Buscar uma proposta externa para usar como argumento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que comparar títulos entre empresas brasileiras engana?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O mesmo título cobre responsabilidades bem diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "As faixas salariais são reguladas de forma distinta por estado",
                            isCorrect: false,
                        },
                        {
                            text: "Empresas menores não usam a nomenclatura de níveis de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Os títulos mudam de nome a cada reestruturação interna anual",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Transições clássicas no Brasil",
            blocks: [
                {
                    type: "text",
                    value: "# Ninguém começa em produto do zero absoluto\n\nProduto é uma carreira de segunda entrada: a maioria dos PMs brasileiros chegou de outra função, e isso é vantagem, não defeito. Cada origem entrega uma parte do ofício já pronta e deixa outra parte como dever de casa. Reconhecer as duas com honestidade encurta o caminho.\n\nQuem vem de DESENVOLVIMENTO chega com credibilidade técnica de graça: entende viabilidade, conversa de igual com o time, sabe o que custa caro. O dever de casa é parar de resolver e passar a decidir, aprendendo a conviver com problema mal definido em vez de correr para a solução. Quem vem de QA traz a melhor visão de fluxo, casos de borda e qualidade percebida que existe na empresa, e precisa treinar o olhar de oportunidade, porque QA é treinado para achar defeito, não para escolher aposta.\n\nQuem vem de DADOS já pensa em métrica, evidência e experimento, e costuma tropeçar no lado qualitativo: entrevista, empatia e a decisão que precisa ser tomada com evidência insuficiente. E quem vem de NEGÓCIO (vendas, suporte, operação) conhece o cliente e o mercado melhor que qualquer um, e precisa construir vocabulário técnico e o hábito de duvidar do que o cliente pede.",
                },
                {
                    type: "table",
                    value: '[["Origem","Vantagem que já vem pronta","Dever de casa"],["Desenvolvimento","Credibilidade e noção de viabilidade","Decidir em vez de correr para resolver"],["QA","Fluxo, casos de borda e qualidade","Olhar oportunidade, não só defeito"],["Dados","Métrica, evidência e experimento","Pesquisa qualitativa e empatia"],["Negócio","Cliente, mercado e comunicação","Vocabulário técnico e senso crítico"],["Design","Usuário, fluxo e pesquisa","Números, receita e restrição técnica"]]',
                },
                {
                    type: "quote",
                    value: "A origem não define o teto de ninguém em produto: define só quais capítulos você vai ter que estudar com mais esforço.",
                },
                {
                    type: "text",
                    value: "## O caminho prático da transição\n\nA transição interna é mais fácil que a externa, e por um motivo simples: dentro da empresa você já tem contexto, relação e confiança, que são justamente as coisas mais difíceis de provar num processo seletivo. Se existe time de produto onde você trabalha, o movimento inteligente é criar valor visível na fronteira antes de pedir a vaga.\n\nNa prática isso significa se aproximar do PM da sua área, ajudar em pesquisa e análise, escrever a documentação que ninguém escreveu, levar dado que muda uma decisão. Quando a vaga abrir, você não será um candidato desconhecido: será a pessoa que já faz parte daquilo, e essa diferença decide a maioria dos processos internos.\n\nDuas expectativas para ajustar. Primeira: pode haver ajuste salarial na virada, principalmente saindo de desenvolvimento sênior para produto pleno, e é melhor descobrir isso antes de pedir a mudança. Segunda: os primeiros meses são desconfortáveis de um jeito específico. Você sai de um lugar onde entrega coisas concretas todo dia e chega num lugar onde o dia inteiro foi conversa, e nada foi construído por você. Isso não é improdutividade, é a mudança de ofício acontecendo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a vantagem de quem vem de desenvolvimento para produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Credibilidade técnica e boa noção de viabilidade",
                            isCorrect: true,
                        },
                        {
                            text: "Facilidade natural para conduzir entrevistas com usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Conhecimento profundo de mercado e de concorrentes diretos",
                            isCorrect: false,
                        },
                        {
                            text: "Domínio das técnicas de negociação com áreas comerciais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o dever de casa típico de quem vem de QA?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Treinar o olhar de oportunidade, não só o de defeito",
                            isCorrect: true,
                        },
                        {
                            text: "Aprender a escrever casos de teste com mais profundidade",
                            isCorrect: false,
                        },
                        {
                            text: "Dominar as ferramentas de automação usadas pelo time atual",
                            isCorrect: false,
                        },
                        {
                            text: "Estudar arquitetura de sistemas antes de assumir o produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a dificuldade mais comum de quem vem de dados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Decidir com evidência insuficiente e ouvir gente",
                            isCorrect: true,
                        },
                        {
                            text: "Entender como funcionam métricas de retenção e coorte",
                            isCorrect: false,
                        },
                        {
                            text: "Convencer o time de engenharia a instrumentar eventos",
                            isCorrect: false,
                        },
                        {
                            text: "Construir painéis que respondam perguntas de negócio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a transição interna costuma ser mais fácil que a externa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contexto, relação e confiança já existem na empresa",
                            isCorrect: true,
                        },
                        {
                            text: "Processos internos costumam dispensar qualquer entrevista",
                            isCorrect: false,
                        },
                        {
                            text: "As vagas internas exigem menos experiência prévia na área",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa é obrigada a priorizar candidatos da própria casa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Nos primeiros meses em produto, a pessoa sente que não construiu nada no dia. Como interpretar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "É a mudança de ofício, não falta de produtividade",
                            isCorrect: true,
                        },
                        {
                            text: "É sinal de que a transição foi feita antes da hora certa",
                            isCorrect: false,
                        },
                        {
                            text: "É reflexo de um time desorganizado com reuniões demais",
                            isCorrect: false,
                        },
                        {
                            text: "É consequência de não ter recebido treinamento adequado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Entrevistas de produto",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro tipos de pergunta e um único critério\n\nProcessos seletivos de produto no Brasil costumam misturar quatro formatos, e cada um testa uma coisa diferente. ESTIMATIVA: quantos entregadores de aplicativo operam em São Paulo num dia útil. Ninguém quer o número certo; querem ver você quebrar um problema grande em partes, assumir premissas explícitas e fazer a conta em voz alta.\n\nDESIGN DE PRODUTO: melhore o aplicativo do banco para idosos. O erro fatal é sair listando funcionalidade. O caminho esperado é perguntar objetivo, escolher um usuário e um problema, gerar alternativas, escolher uma com critério e dizer como mediria o resultado.\n\nMÉTRICAS: a retenção caiu 8% no mês passado, o que você faz. Testa raciocínio de diagnóstico: separar o efeito por segmento, canal, plataforma e tempo antes de sair propondo solução.\n\nPRIORIZAÇÃO: cinco itens na mesa e capacidade para dois. Testa se você tem critério e se consegue dizer não em voz alta, com o motivo na frente de quem discorda.\n\nO critério único por trás dos quatro: eles querem ouvir como você PENSA. Resposta pronta e bonita vale menos que raciocínio audível com premissas expostas.",
                },
                {
                    type: "table",
                    value: '[["Tipo de case","O que testam de verdade","Erro que reprova"],["Estimativa","Quebrar problema e assumir premissa","Chutar um número sem mostrar a conta"],["Design de produto","Usuário, problema e critério de escolha","Listar funcionalidades sem perguntar nada"],["Métricas","Diagnóstico antes da solução","Propor solução no primeiro minuto"],["Priorização","Critério e coragem de recusar","Tentar fazer tudo e agradar a todos"],["Comportamental","Como você age com conflito real","História genérica sem o seu papel claro"]]',
                },
                {
                    type: "quote",
                    value: "Em entrevista de produto, a resposta certa dita em silêncio vale menos que o raciocínio errado dito em voz alta.",
                },
                {
                    type: "text",
                    value: "## Como treinar cada tipo sem decorar\n\nEstimativa treina com repetição e cronômetro: escolha um número por dia, dê a si mesmo cinco minutos, escreva as premissas e depois procure a ordem de grandeza real. O objetivo não é acertar, é ficar confortável em pensar em voz alta com número na mesa.\n\nDesign de produto treina com produtos que você usa. Pegue um app do seu dia, escolha um público específico e escreva meia página com problema, alternativas e critério. Dez desses valem mais que qualquer lista de frameworks decorada, porque o que trava a maioria dos candidatos não é falta de método, é falta de prática em escolher.\n\nMétricas treina inventando quedas: se a ativação caísse 15% amanhã, quais seriam as cinco explicações possíveis e que dado separaria cada uma? Priorização treina com o backlog real do seu trabalho, defendendo em voz alta por que dois itens ficam de fora.\n\nE existe a parte comportamental, que muita gente subestima. Tenha três histórias prontas de verdade: um conflito com stakeholder, uma decisão que deu errado, um momento em que você mudou de ideia com dado. Histórias reais têm textura que a inventada não tem, e o entrevistador percebe a diferença na segunda pergunta de aprofundamento.",
                },
            ],
            questions: [
                {
                    statement: "O que uma pergunta de estimativa realmente avalia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quebrar o problema e assumir premissas explícitas",
                            isCorrect: true,
                        },
                        {
                            text: "Conhecer de cor os números de mercado do setor citado",
                            isCorrect: false,
                        },
                        {
                            text: "Calcular mentalmente com rapidez e sem cometer erros",
                            isCorrect: false,
                        },
                        {
                            text: "Chegar ao número exato antes do tempo combinado acabar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o erro fatal num case de design de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Listar funcionalidades sem definir usuário e problema",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntar qual é o objetivo do produto antes de responder",
                            isCorrect: false,
                        },
                        {
                            text: "Apresentar mais de uma alternativa possível de solução",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar como mediria o resultado da mudança proposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A retenção caiu 8% e o entrevistador quer sua reação. Por onde começar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Separar por segmento, canal, plataforma e período",
                            isCorrect: true,
                        },
                        {
                            text: "Propor três funcionalidades para trazer os usuários de volta",
                            isCorrect: false,
                        },
                        {
                            text: "Sugerir uma campanha de reativação por email para a base",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar qual era a meta de retenção definida no trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um case de priorização testa além do framework escolhido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A coragem de dizer não com o motivo na frente de todos",
                            isCorrect: true,
                        },
                        {
                            text: "A velocidade de cálculo das notas de cada item da lista",
                            isCorrect: false,
                        },
                        {
                            text: "O conhecimento das fórmulas usadas pelos métodos clássicos",
                            isCorrect: false,
                        },
                        {
                            text: "A capacidade de negociar prazo com o time de engenharia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que histórias comportamentais reais funcionam melhor que inventadas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A textura do detalhe aparece no aprofundamento seguinte",
                            isCorrect: true,
                        },
                        {
                            text: "Empresas costumam checar cada história com ex colegas depois",
                            isCorrect: false,
                        },
                        {
                            text: "Histórias reais são sempre mais impressionantes que as criadas",
                            isCorrect: false,
                        },
                        {
                            text: "Entrevistadores preferem candidatos que já viveram conflitos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Portfólio de produto",
            blocks: [
                {
                    type: "text",
                    value: '# Como mostrar trabalho que é confidencial\n\nA dificuldade é real: quase tudo que um PM faz é interno, coberto por acordo de confidencialidade, e não dá para publicar número de receita nem estratégia da empresa. Muita gente conclui daí que portfólio de produto não existe. Existe, e ele é feito de outra matéria prima: o PROCESSO, não os segredos.\n\nO que você pode mostrar sem violar nada. Como estruturou um problema, que alternativas considerou, que critério usou para escolher, o que aprendeu. Números viram percentual ou faixa em vez de valor absoluto: "aumentamos a ativação em cerca de 40%" diz o que precisa dizer sem revelar receita. E existe uma regra simples de segurança: se você não pode citar o número, cite o efeito e o método.\n\nQuando o trabalho não pode ser contado nem assim, três alternativas resolvem. TEARDOWN: análise pública de um produto que você não construiu, mostrando raciocínio. SIDE PROJECT: algo pequeno que você realmente lançou, com dado real, mesmo que minúsculo. E o CASE COMPLETO, que é o que você vai montar no próximo módulo desta trilha, usando um produto fictício em que todos os números podem ser mostrados sem risco nenhum.',
                },
                {
                    type: "table",
                    value: '[["Formato","O que demonstra","Cuidado"],["Case de trabalho real","Processo e decisão sob restrição","Nunca revelar dado confidencial"],["Teardown público","Raciocínio e olhar crítico","Não virar lista de palpites soltos"],["Side project lançado","Iniciativa e execução ponta a ponta","Mostrar dado real, mesmo pequeno"],["Case com produto fictício","Método completo sem risco algum","Deixar claro que é exercício"],["Escrita pública","Clareza de pensamento e consistência","Exige constância para ter efeito"]]',
                },
                {
                    type: "quote",
                    value: "Portfólio de produto não prova o que você entregou: prova como você pensa quando o problema ainda não tem resposta.",
                },
                {
                    type: "text",
                    value: "## O formato que entrevistador consegue ler\n\nQuem avalia portfólio tem pouco tempo e muitos candidatos. O material que funciona respeita isso: uma página por case, escaneável, com títulos que já contam a história. Nada de vinte slides de contexto antes da primeira decisão aparecer.\n\nA estrutura que se repete nos bons cases é sempre a mesma: qual era o problema e como você soube, o que você decidiu e o que descartou, o que aconteceu, o que faria diferente. A quarta parte é a que separa candidato experiente de candidato ensaiado, porque quem tem repertório real consegue apontar com precisão o próprio erro sem transformar aquilo em falsa modéstia.\n\nDois avisos práticos. Primeiro: não exagere o seu papel. Dizer que liderou sozinho algo que foi feito por um time de doze pessoas é o tipo de coisa que desmorona na entrevista de aprofundamento, e o custo é a credibilidade inteira. Segundo: qualidade acima de quantidade. Dois cases bem escritos, com decisão visível e aprendizado honesto, valem mais que oito descrições rasas de projetos que você tocou de longe.",
                },
            ],
            questions: [
                {
                    statement: "Do que é feito um portfólio de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Do processo e das decisões, não dos dados sigilosos",
                            isCorrect: true,
                        },
                        {
                            text: "Dos números de receita alcançados em cada projeto tocado",
                            isCorrect: false,
                        },
                        {
                            text: "Das telas desenhadas ao longo dos anos de experiência",
                            isCorrect: false,
                        },
                        {
                            text: "Da lista de empresas e cargos ocupados na trajetória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como citar resultados sem revelar dado confidencial?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Usar percentual ou faixa em vez do valor absoluto",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir autorização formal do jurídico da antiga empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Omitir qualquer resultado e falar apenas do processo",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir os números reais por estimativas aproximadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a estrutura que se repete nos bons cases de portfólio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Problema, decisão, resultado e o que faria diferente",
                            isCorrect: true,
                        },
                        {
                            text: "Empresa, cargo, tempo de atuação e principais entregas",
                            isCorrect: false,
                        },
                        {
                            text: "Contexto de mercado, concorrentes e posicionamento atual",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas usadas, times envolvidos e prazos cumpridos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual parte do case separa o candidato experiente do ensaiado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que faria diferente, apontado com precisão",
                            isCorrect: true,
                        },
                        {
                            text: "O tamanho do resultado alcançado no fim do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de dados apresentados na análise inicial",
                            isCorrect: false,
                        },
                        {
                            text: "A clareza visual dos gráficos usados na apresentação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que exagerar o próprio papel num case é um erro caro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A conversa de aprofundamento derruba a versão inflada",
                            isCorrect: true,
                        },
                        {
                            text: "As empresas checam o histórico com todos os antigos gestores",
                            isCorrect: false,
                        },
                        {
                            text: "Casos grandes chamam menos atenção que os casos pequenos",
                            isCorrect: false,
                        },
                        {
                            text: "Recrutadores desconfiam de qualquer resultado muito expressivo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Os primeiros 90 dias num produto novo",
            blocks: [
                {
                    type: "text",
                    value: "# Chegar sem quebrar o que funciona\n\nOs primeiros meses num produto novo decidem boa parte do que você vai conseguir fazer no ano seguinte, e o erro mais comum é chegar propondo mudança. Quem chega assim gasta o único crédito que tinha antes de entender por que as coisas são como são, e descobre tarde que aquela decisão estranha existia por um motivo que ninguém teve tempo de explicar.\n\nO plano 30-60-90 costuma virar clichê de entrevista, mas ele funciona quando descreve comportamento em vez de intenção. Os primeiros 30 dias são de APRENDER: usar o produto todo dia como usuário, ler tíquetes de suporte, ouvir gravações de venda, conversar com cada pessoa do time e perguntar o que elas mudariam. Nessa fase você pergunta muito e opina pouco, e isso é uma escolha, não timidez.\n\nDos 30 aos 60 dias você MAPEIA: onde estão os dados, quais métricas existem e em quais dá para confiar, quem decide o quê, qual é o histórico das últimas apostas e por que falharam. Dos 60 aos 90 você ENTREGA a primeira vitória, algo pequeno, visível e escolhido para provar que você entendeu o contexto, não para impressionar.",
                },
                {
                    type: "table",
                    value: '[["Período","Foco principal","Sinal de que foi bem"],["Dias 1 a 30","Aprender o produto e ouvir gente","Sabe explicar o produto com as palavras do usuário"],["Dias 31 a 60","Mapear dado, decisão e histórico","Sabe em qual métrica dá para confiar"],["Dias 61 a 90","Primeira vitória pequena e visível","O time viu você entregar algo real"],["Depois de 90","Assumir direção com contexto","Sua proposta é discutida, não ignorada"]]',
                },
                {
                    type: "quote",
                    value: "Nos primeiros meses, cada pergunta bem feita compra mais crédito do que qualquer opinião bem formulada.",
                },
                {
                    type: "text",
                    value: '## A primeira vitória e as armadilhas do começo\n\nA primeira vitória tem requisitos bem específicos. Precisa ser pequena o bastante para caber no prazo, visível o bastante para as pessoas notarem e escolhida entre as coisas que o time já sabia que precisavam ser feitas. Resolver um incômodo antigo que ninguém tinha priorizado é melhor que lançar uma ideia sua, porque prova que você ouviu.\n\nTrês armadilhas derrubam gente boa nessa fase. A primeira é comparar em voz alta com a empresa anterior: "na minha antiga empresa a gente fazia assim" é a frase que mais rápido fecha portas, mesmo quando está certa. A segunda é confiar na primeira versão da história: as três primeiras pessoas com quem você conversar vão te dar três versões diferentes do mesmo passado, e nenhuma delas está completa. A terceira é aceitar a métrica do painel sem investigar como ela é calculada, porque muita empresa acompanha há anos um número que mede outra coisa.\n\nUm último cuidado: escreva o que você percebeu de estranho nas primeiras semanas. Daqui a três meses você já terá se acostumado com tudo isso, e esse olhar de fora, que só existe uma vez, é um dos ativos mais valiosos que você traz para o time.',
                },
            ],
            questions: [
                {
                    statement: "Qual é o foco dos primeiros 30 dias num produto novo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aprender o produto e ouvir as pessoas do time",
                            isCorrect: true,
                        },
                        {
                            text: "Apresentar a nova estratégia da área para a liderança",
                            isCorrect: false,
                        },
                        {
                            text: "Reorganizar o backlog conforme a sua experiência prévia",
                            isCorrect: false,
                        },
                        {
                            text: "Definir as metas do trimestre seguinte junto com o time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como deve ser a primeira vitória do PM que acabou de chegar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pequena, visível e entre o que o time já queria fazer",
                            isCorrect: true,
                        },
                        {
                            text: "Grande o bastante para justificar a contratação recente",
                            isCorrect: false,
                        },
                        {
                            text: "Uma ideia original que ninguém no time tinha considerado",
                            isCorrect: false,
                        },
                        {
                            text: "Uma mudança estrutural no processo de trabalho da equipe",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que propor mudanças grandes na primeira semana costuma dar errado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gasta crédito antes de entender por que as coisas são assim",
                            isCorrect: true,
                        },
                        {
                            text: "Contraria as regras de conduta da maior parte das empresas",
                            isCorrect: false,
                        },
                        {
                            text: "Impede que o time termine as entregas já comprometidas antes",
                            isCorrect: false,
                        },
                        {
                            text: "Exige aprovação da liderança que ainda não conhece o novato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que não confiar na primeira versão da história que te contam?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada pessoa conta um recorte diferente do mesmo passado",
                            isCorrect: true,
                        },
                        {
                            text: "Pessoas novas na empresa costumam desconhecer o histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Registros escritos sempre contradizem o que é dito em conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Times tendem a esconder informação de quem acabou de chegar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que vale escrever o que pareceu estranho nas primeiras semanas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O olhar de fora só existe uma vez e some com o costume",
                            isCorrect: true,
                        },
                        {
                            text: "O registro serve como defesa formal em avaliações futuras",
                            isCorrect: false,
                        },
                        {
                            text: "A liderança costuma cobrar um relatório ao fim do período",
                            isCorrect: false,
                        },
                        {
                            text: "As anotações substituem a documentação que o time não tem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Capstone: o case completo",
    aulas: [
        {
            titulo: "O formato do case",
            blocks: [
                {
                    type: "text",
                    value: "# Seis partes que sustentam qualquer case\n\nUm case de produto é uma narrativa com estrutura fixa, e ela existe porque quem lê está procurando exatamente estas informações, nesta ordem. Fugir do formato não te faz original: faz o leitor procurar sozinho o que você deveria ter entregue.\n\nPROBLEMA: qual dor, de quem, e como você soube que ela existia. CONTEXTO: onde isso acontecia, quais restrições existiam (time, prazo, técnica, regulatória) e o que estava em jogo. PROCESSO: o que você fez para reduzir a incerteza, incluindo o que descobriu que contrariava a expectativa inicial. DECISÃO: o que foi escolhido, o que foi descartado e com que critério. RESULTADO: o que aconteceu, em número, com honestidade sobre o que não deu certo. APRENDIZADO: o que você faria diferente e o que passou a fazer sempre.\n\nA parte que mais gente entrega mal é o processo, porque é tentador narrar como se a solução tivesse aparecido pronta na sua cabeça. Ninguém acredita nisso, e quem avalia sabe que produto é feito de reviravolta: a hipótese que caiu, a entrevista que mudou o rumo, o dado que contrariou a intuição do time inteiro. É esse trecho que prova que você trabalhou de verdade.",
                },
                {
                    type: "code",
                    value: "CASE: <titulo curto que ja diz o resultado>\n\n1. PROBLEMA\n   Quem sofria, o que doia, como voce soube (dado + evidencia qualitativa).\n\n2. CONTEXTO\n   Produto, momento, tamanho do time, restricoes, o que estava em jogo.\n\n3. PROCESSO\n   O que voce fez para reduzir incerteza, em ordem.\n   Inclua: a hipotese que caiu e o que voce aprendeu com isso.\n\n4. DECISAO\n   O que foi escolhido. O que foi descartado. Com qual criterio.\n   Uma linha sobre o trade-off assumido conscientemente.\n\n5. RESULTADO\n   Metrica antes e depois, com prazo. O que nao melhorou tambem entra.\n\n6. APRENDIZADO\n   O que faria diferente. O que virou habito depois disso.\n\nREGRAS DE OURO\n- Uma pagina. Titulos que contam a historia sozinhos.\n- Diga o seu papel com precisao: eu decidi, eu propus, o time construiu.\n- Nenhum numero sem prazo e sem base de comparacao.",
                },
                {
                    type: "quote",
                    value: "O trecho mais valioso do case é aquele em que você estava errado: é ele que prova que houve trabalho e não sorte.",
                },
                {
                    type: "table",
                    value: '[["Parte","Pergunta que responde","Erro frequente"],["Problema","Quem sofria e como você soube","Começar pela solução escolhida"],["Contexto","Que restrições existiam","Omitir o que limitava as opções"],["Processo","Como reduziu a incerteza","Narrar um caminho reto sem tropeço"],["Decisão","O que escolheu e descartou","Não citar nenhuma alternativa"],["Resultado","O que mudou, em número","Só mostrar o que deu certo"],["Aprendizado","O que faria diferente","Falsa modéstia sem conteúdo"]]',
                },
            ],
            questions: [
                {
                    statement: "Quais são as seis partes de um case de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Problema, contexto, processo, decisão, resultado, aprendizado",
                            isCorrect: true,
                        },
                        {
                            text: "Empresa, cargo, período, entregas, ferramentas e resultados",
                            isCorrect: false,
                        },
                        {
                            text: "Visão, estratégia, roadmap, backlog, entrega e retrospectiva",
                            isCorrect: false,
                        },
                        {
                            text: "Pesquisa, protótipo, teste, construção, lançamento e suporte final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a parte de decisão precisa deixar claro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O que foi escolhido, o que foi descartado e por quê",
                            isCorrect: true,
                        },
                        {
                            text: "Quantas pessoas participaram da reunião que definiu tudo",
                            isCorrect: false,
                        },
                        {
                            text: "Qual framework de priorização foi aplicado naquele momento",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto tempo o time levou para implementar a solução final",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o processo é a parte que mais gente entrega mal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É tentador narrar um caminho reto que nunca existiu",
                            isCorrect: true,
                        },
                        {
                            text: "Exige detalhes técnicos que o candidato não domina bem",
                            isCorrect: false,
                        },
                        {
                            text: "Costuma envolver informação confidencial da empresa antiga",
                            isCorrect: false,
                        },
                        {
                            text: "Ocupa espaço demais e cansa quem está lendo o material",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que incluir a hipótese que caiu fortalece o case?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra que houve trabalho de verdade, e não sorte",
                            isCorrect: true,
                        },
                        {
                            text: "Demonstra domínio das técnicas de pesquisa qualitativa",
                            isCorrect: false,
                        },
                        {
                            text: "Preenche a narrativa quando faltam resultados expressivos",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz a chance de perguntas difíceis durante a entrevista",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que descrever o próprio papel com precisão importa tanto no case?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Eu decidi e o time construiu não são a mesma frase",
                            isCorrect: true,
                        },
                        {
                            text: "As empresas verificam o histórico com antigos colegas depois",
                            isCorrect: false,
                        },
                        {
                            text: "Recrutadores contam quantas vezes o candidato usa a palavra eu",
                            isCorrect: false,
                        },
                        {
                            text: "Cases individuais valem sempre mais que trabalhos coletivos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Montando o case com o Financem",
            blocks: [
                {
                    type: "text",
                    value: "# Um produto fictício com números que fecham\n\nO Financem acompanhou toda a jornada por um motivo prático: ele permite mostrar o método inteiro sem esbarrar em confidencialidade nenhuma. O contrato com quem lê é ser explícito quanto a isso, dizendo em uma linha que se trata de um exercício com produto fictício e números simulados. Case honesto sobre a própria natureza vale muito; case fictício apresentado como real destrói a confiança de quem descobre.\n\nA matéria prima já existe e está espalhada pela sua trilha. O problema vem do trabalho de discovery: autônomo que não sabe quanto pode gastar porque o imposto some no meio do caminho. As métricas vêm da instrumentação e do funil: cadastro, conexão de receita, primeira projeção vista, retorno em sete dias. A estratégia vem do posicionamento escolhido: um recorte estreito de prestadores de serviço que já emitem nota, em vez do genérico controle financeiro pessoal. E a execução vem deste módulo de prática: lançamento por fases, flag, métrica de guarda e leitura da primeira semana.\n\nO trabalho do capstone não é inventar mais nada. É costurar essas peças numa narrativa em que cada decisão se apoia na evidência anterior, do jeito que aconteceria numa empresa de verdade.",
                },
                {
                    type: "table",
                    value: '[["Parte do case","De onde vem o material","O que precisa aparecer"],["Problema","Entrevistas e mapa de oportunidades","A dor com evidência, não com opinião"],["Contexto","Posicionamento e recorte de público","A restrição que limitou as opções"],["Processo","Discovery, protótipo e teste","A hipótese que caiu no meio"],["Decisão","Priorização com critério explícito","O que ficou de fora e por quê"],["Resultado","Funil, ativação e retenção","Número com prazo e comparação"],["Aprendizado","Leitura pós lançamento","O que viraria hábito daqui em diante"]]',
                },
                {
                    type: "quote",
                    value: "Case fictício apresentado como exercício é método demonstrado. Case fictício apresentado como real é uma mentira com gráfico.",
                },
                {
                    type: "text",
                    value: "## A costura que faz o case ficar coerente\n\nO teste de coerência é encadear as partes com a palavra POR ISSO e ver se a frase se sustenta. As entrevistas mostraram que a dor era a incerteza no meio do mês, POR ISSO a métrica escolhida foi a primeira projeção vista e não o cadastro. O público era pequeno e específico, POR ISSO o canal foi comunidade e contador, não mídia paga. A conexão de receita era o passo de maior fricção, POR ISSO o lançamento começou fechado, com acompanhamento individual dos primeiros usuários.\n\nQuando alguma dessas frases não fecha, você encontrou um buraco. Ou falta evidência para sustentar a decisão, ou a decisão foi tomada por outro motivo que você não escreveu. Nos dois casos, quem avalia vai perceber, porque avaliador experiente lê case procurando exatamente essas costuras frouxas.\n\nDeixe uma decisão difícil visível no texto, com o trade-off assumido. No Financem, a decisão de exigir a conexão de receita no onboarding derrubou o número de contas criadas e foi mantida porque o objetivo era ativação, não cadastro. Uma escolha assim, defendida com clareza, diz mais sobre a sua capacidade do que três resultados positivos alinhados.",
                },
            ],
            questions: [
                {
                    statement: "Por que usar um produto fictício no case de portfólio?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Permite mostrar o método sem esbarrar em sigilo",
                            isCorrect: true,
                        },
                        {
                            text: "Facilita apresentar resultados melhores que os reais",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz o tempo necessário para escrever o documento",
                            isCorrect: false,
                        },
                        {
                            text: "Evita a necessidade de fazer pesquisa com usuários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que cuidado é obrigatório ao apresentar um case fictício?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dizer com clareza que é exercício com dados simulados",
                            isCorrect: true,
                        },
                        {
                            text: "Evitar mencionar números para não induzir ninguém ao erro",
                            isCorrect: false,
                        },
                        {
                            text: "Usar nomes de empresas reais para dar credibilidade ao texto",
                            isCorrect: false,
                        },
                        {
                            text: "Manter o material apenas para uso interno e nunca publicar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como testar a coerência entre as partes de um case?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Encadear as partes com por isso e ver se sustenta",
                            isCorrect: true,
                        },
                        {
                            text: "Contar o número de páginas dedicadas a cada seção",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar o texto com cases publicados por outras pessoas",
                            isCorrect: false,
                        },
                        {
                            text: "Verificar se todas as métricas citadas subiram no período",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa encontrar uma costura frouxa no case?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falta evidência ou o motivo real não foi escrito",
                            isCorrect: true,
                        },
                        {
                            text: "O texto ficou longo demais para o formato de uma página",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado apresentado foi menor que a meta combinada",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem das seções não seguiu o formato mais tradicional",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que deixar visível uma decisão que derrubou uma métrica de propósito?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Trade-off defendido mostra mais capacidade que só acertos",
                            isCorrect: true,
                        },
                        {
                            text: "Avaliadores exigem pelo menos um resultado negativo no case",
                            isCorrect: false,
                        },
                        {
                            text: "Métricas em queda tornam o relato mais realista aos olhos",
                            isCorrect: false,
                        },
                        {
                            text: "É a única forma de justificar prazos que não foram cumpridos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O resultado narrado com honestidade",
            blocks: [
                {
                    type: "text",
                    value: '# Números que fecham e limites que aparecem\n\nA parte de resultado é onde a maioria dos cases se estraga, e o motivo é sempre o mesmo: número solto. "Aumentamos a ativação em 40%" não diz nada sozinho. Quarenta por cento em relação a quê, medido em quanto tempo, com quantos usuários, comparado com qual período anterior? Sem essas quatro informações, o leitor não consegue avaliar se aquilo foi conquista, sazonalidade ou ruído de amostra pequena.\n\nA regra que resolve: todo número aparece com BASE, PRAZO e COMPARAÇÃO. No Financem, o resultado é assim: a ativação em sete dias saiu de 24% para 38% em oito semanas, sobre uma base de cerca de mil e duzentos novos usuários por mês, contra os dois trimestres anteriores estáveis em torno de 24%. Agora dá para discutir de verdade, e é isso que você quer.\n\nA segunda regra é mostrar o que não melhorou. No mesmo período, a retenção em trinta dias ficou praticamente parada, e a conversão para o plano pago subiu bem menos do que a ativação. Escrever isso não enfraquece o case: mostra que você entende que ativação não resolve retenção e que sabe distinguir efeito de expectativa.',
                },
                {
                    type: "table",
                    value: '[["Número solto","Número que dá para avaliar"],["Aumentamos a ativação em 40%","Ativação em 7 dias: de 24% para 38% em oito semanas"],["Muitos usuários aprovaram","42 das 50 pessoas ouvidas citaram o mesmo ganho"],["Reduzimos o churn bastante","Churn mensal de 9,1% para 7,4% em dois trimestres"],["O suporte diminuiu muito","Tíquetes por mil ativos caíram de 31 para 19"]]',
                },
                {
                    type: "quote",
                    value: "Número sem base, prazo e comparação não é resultado: é adjetivo vestido de dado, e quem avalia percebe na primeira pergunta.",
                },
                {
                    type: "text",
                    value: '## O que funcionou, o que faria diferente\n\nA honestidade do case aparece de forma concreta quando você separa o que funcionou do que foi sorte e do que ainda está em aberto. No Financem, funcionou apostar em ativação antes de gastar em aquisição, e funcionou o lançamento por fases, que pegou um erro de cálculo de imposto ainda no beta fechado, com dezoito pessoas dentro em vez de mil e duzentas.\n\nO que faria diferente também precisa ser específico. Duas coisas: a instrumentação da etapa de conciliação entrou tarde, o que custou duas semanas de diagnóstico às cegas; e a decisão de manter a conexão de receita obrigatória deveria ter vindo acompanhada de uma alternativa para quem não conseguia conectar, porque parte das pessoas travava sem saída e ia embora em silêncio.\n\nEvite dois extremos ao escrever esta seção. A falsa modéstia genérica ("poderia ter comunicado melhor") não diz nada e todo avaliador já leu mil vezes. O excesso de autocrítica transforma o case num relato de fracasso e apaga o que você de fato conseguiu. O tom certo é o de quem revisa o próprio trabalho com calma: aqui acertamos, aqui erramos, isto aprendemos, e a próxima vez começa de um lugar melhor.',
                },
            ],
            questions: [
                {
                    statement: "O que todo número apresentado no case precisa ter?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Base, prazo e comparação com o período anterior",
                            isCorrect: true,
                        },
                        {
                            text: "Fonte externa que comprove o dado citado no texto",
                            isCorrect: false,
                        },
                        {
                            text: "Gráfico ilustrativo mostrando a evolução no período",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovação da empresa onde o trabalho foi realizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mostrar o que não melhorou fortalece o case?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mostra que você distingue efeito real de expectativa",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz a chance de o avaliador pedir dados adicionais",
                            isCorrect: false,
                        },
                        {
                            text: "Compensa a falta de resultados positivos no período",
                            isCorrect: false,
                        },
                        {
                            text: "Torna o texto mais longo e completo para a leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o problema de escrever apenas aumentamos a ativação em 40%?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem base e prazo, pode ser conquista, sazonalidade ou ruído",
                            isCorrect: true,
                        },
                        {
                            text: "Percentuais não são aceitos em cases de produto no mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Ativação é uma métrica pouco relevante para avaliar produto",
                            isCorrect: false,
                        },
                        {
                            text: "O leitor vai supor que o número foi inventado pelo candidato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o lançamento por fases entregou de valor no case do Financem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pegou o erro de cálculo com dezoito pessoas dentro",
                            isCorrect: true,
                        },
                        {
                            text: "Reduziu pela metade o tempo total até o lançamento geral",
                            isCorrect: false,
                        },
                        {
                            text: "Eliminou a necessidade de instrumentar as etapas do fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "Garantiu a meta de conversão para o plano pago no trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o tom adequado da seção sobre o que faria diferente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Específico: nem falsa modéstia nem relato de fracasso",
                            isCorrect: true,
                        },
                        {
                            text: "Otimista: destacar que os erros foram todos corrigidos depois",
                            isCorrect: false,
                        },
                        {
                            text: "Técnico: detalhar as falhas de implementação do time envolvido",
                            isCorrect: false,
                        },
                        {
                            text: "Breve: uma linha genérica basta para cumprir o formato do case",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Apresentando o case",
            blocks: [
                {
                    type: "text",
                    value: '# A versão de cinco minutos e a de trinta\n\nUm case bom existe em duas durações, e quem só prepara uma sempre apresenta a errada. A versão de CINCO MINUTOS é a que você usa quando alguém pergunta de improviso, no meio de uma conversa ou no começo de uma entrevista. Ela tem quatro frases: qual era o problema e de quem, o que você decidiu e descartou, o que aconteceu em número, o que aprendeu. Nada mais.\n\nA versão de TRINTA MINUTOS é a apresentação completa, e o erro clássico é achar que ela é a de cinco minutos com mais detalhe no começo. Não é. Ela tem espaço para o processo (as entrevistas, a hipótese que caiu, o teste que mudou o rumo), para as alternativas descartadas com o critério na mesa e para as perguntas do interlocutor no meio do caminho.\n\nRegra prática das duas versões: comece pelo resultado. Dizer logo na primeira frase onde a história termina ("levamos a ativação de 24% para 38% em oito semanas") prende a atenção e dá contexto para tudo que vem depois. Quem guarda o desfecho para o fim, como num suspense, perde metade da sala antes do terceiro slide.',
                },
                {
                    type: "table",
                    value: '[["Momento","Duração","O que entra","O que fica de fora"],["Pergunta de improviso","Cinco minutos","Problema, decisão, número, aprendizado","Detalhe de processo e de contexto"],["Entrevista com case","Vinte a trinta minutos","Processo, alternativas e trade-off","Descrição de tela e de ferramenta"],["Portfólio escrito","Uma página lida sozinha","As seis partes, escaneáveis","Narrativa longa sem subtítulo"],["Conversa informal","Dois minutos","O problema e o que aprendeu","Números e detalhes de execução"]]',
                },
                {
                    type: "quote",
                    value: "Comece pelo fim: quem guarda o resultado para o último slide perde a sala antes de chegar na parte interessante.",
                },
                {
                    type: "text",
                    value: '## Antecipando as perguntas difíceis\n\nTodo case tem pontos frágeis, e o entrevistador experiente vai direto neles. Prepare resposta honesta para as quatro que sempre aparecem. "Qual foi exatamente o SEU papel?" exige precisão: o que você decidiu, o que propôs, o que o time construiu, quem mais participou. "Como você sabe que foi o seu trabalho que causou o resultado?" exige humildade estatística: se não houve grupo de controle, diga que não houve e cite o que reforça a leitura, como a ausência de outras mudanças no período.\n\n"O que você faria com metade do tempo?" testa priorização de verdade, e a resposta boa é concreta sobre o que cortaria primeiro. "E se o resultado tivesse sido negativo?" testa se você tinha critério antes ou se está explicando o passado com o que já sabe hoje.\n\nUma nota sobre o case fictício, que vale repetir. Diga na primeira frase que é um exercício. Quem faz isso costuma ser recebido com respeito, porque demonstra método e transparência ao mesmo tempo. Quem tenta passar exercício por experiência real perde o processo inteiro no minuto em que a segunda pergunta de aprofundamento chega, e perde algo maior que a vaga.',
                },
            ],
            questions: [
                {
                    statement: "O que entra na versão de cinco minutos do case?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Problema, decisão, resultado em número e aprendizado",
                            isCorrect: true,
                        },
                        {
                            text: "O contexto completo do mercado e dos concorrentes diretos",
                            isCorrect: false,
                        },
                        {
                            text: "A descrição das telas e do fluxo desenhado pelo time todo",
                            isCorrect: false,
                        },
                        {
                            text: "O detalhamento das entrevistas realizadas durante a pesquisa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que começar a apresentação pelo resultado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Prende a atenção e dá contexto para o resto da história",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz a duração total necessária para contar o case inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Evita que o interlocutor faça perguntas durante a exposição",
                            isCorrect: false,
                        },
                        {
                            text: "Permite omitir a parte de processo, que é sempre mais longa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como responder à pergunta sobre qual foi exatamente o seu papel?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com precisão: o que decidiu, propôs e quem construiu",
                            isCorrect: true,
                        },
                        {
                            text: "Assumindo a liderança geral para demonstrar protagonismo",
                            isCorrect: false,
                        },
                        {
                            text: "Falando sempre no plural para valorizar o trabalho do time",
                            isCorrect: false,
                        },
                        {
                            text: "Descrevendo as ferramentas que dominava naquele projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Não houve grupo de controle no seu experimento. Como responder sobre causalidade?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dizer que não houve e citar o que reforça a leitura",
                            isCorrect: true,
                        },
                        {
                            text: "Afirmar que a correlação observada é prova suficiente disso",
                            isCorrect: false,
                        },
                        {
                            text: "Mudar de assunto para os aprendizados obtidos no processo",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar que grupos de controle são inviáveis em produto real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a pergunta sobre resultado negativo realmente testa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Se você tinha critério antes ou explica o passado agora",
                            isCorrect: true,
                        },
                        {
                            text: "Se você é capaz de admitir fracassos diante de estranhos",
                            isCorrect: false,
                        },
                        {
                            text: "Se o experimento foi desenhado com significância adequada",
                            isCorrect: false,
                        },
                        {
                            text: "Se o time tinha um plano de contingência combinado antes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento da jornada",
            blocks: [
                {
                    type: "text",
                    value: "# Do zero ao case completo\n\nVale olhar para trás um instante. Você começou sem saber a diferença entre produto e projeto, entre output e outcome, entre o papel de PO e o de PM. Passou pelo delivery, aprendeu a operar backlog e fluxo sem teatro. Entrou nos dados e parou de discutir opinião contra opinião, porque passou a saber o que medir e como um experimento pode enganar. Aprendeu discovery e o hábito de duvidar da própria certeza antes de gastar seis meses de time. Subiu para estratégia, priorização e a conversa difícil com quem tem poder. E agora fechou o ciclo com lançamento, growth, monetização, produto técnico, IA no trabalho e um case que mostra tudo isso funcionando junto.\n\nO que essas etapas têm em comum não é o vocabulário nem a lista de frameworks. É um jeito de trabalhar: transformar incerteza em pergunta, pergunta em evidência, evidência em decisão, e decisão em algo que dá para verificar depois. Quem faz isso com constância vira, com o tempo, a pessoa em quem o time confia quando o caminho não está claro.\n\nEsse é o ofício. Não é a última ferramenta da moda, é o hábito de decidir com método quando ninguém tem certeza.",
                },
                {
                    type: "table",
                    value: '[["O que você levou","Como isso aparece no dia a dia"],["Outcome acima de output","Pergunta o que muda para o usuário antes de estimar"],["Evidência antes de opinião","Traz dado e citação em vez de achismo com convicção"],["Dúvida metódica","Testa a suposição mais arriscada antes de construir"],["Escolha explícita","Diz o que fica de fora e sustenta o motivo"],["Responsabilidade","Assina a decisão, inclusive quando ela deu errado"],["Honestidade com número","Não vende sorte como mérito nem esconde o que falhou"]]',
                },
                {
                    type: "quote",
                    value: "Produto é decidir sob incerteza com método, assumir a escolha e voltar depois para conferir se ela se sustentou.",
                },
                {
                    type: "text",
                    value: "## Caminhos de aprofundamento, sem ordem obrigatória\n\nDaqui em diante o caminho é seu, e ele não tem sequência única. Algumas direções costumam render, e cada pessoa escolhe pela vontade e pelo contexto em que trabalha. Aprofundar em DADOS deixa você mais forte na conversa de causalidade e de experimento. Aprofundar em PESQUISA melhora a qualidade do que você escuta e do que você descarta. Ir para o lado TÉCNICO amplia o repertório de trade-offs que você consegue enxergar sozinho. Estudar NEGÓCIO e finanças muda o nível da conversa com quem decide orçamento. E há quem se aprofunde em domínio específico, que é um caminho subestimado: entender de saúde, de logística ou de educação vale muito no mercado brasileiro.\n\nO melhor treino continua sendo o mesmo, e ele não custa nada: praticar em cima de problema real, escrever a decisão antes do resultado aparecer e voltar depois para conferir se você estava certo. Repetir isso por alguns anos forma um repertório que nenhum curso entrega.\n\nUma última palavra sobre o ofício. Produto é um trabalho de responsabilidade sobre incerteza: você decide com informação incompleta, afeta a vida de gente real e responde pelo que escolheu. Isso pede humildade para mudar de ideia com evidência e coragem para sustentar a escolha quando ela ainda não deu resultado. Faça esse trabalho com seriedade, e é ele que vai construir a sua carreira.",
                },
            ],
            questions: [
                {
                    statement: "O que une todas as etapas da jornada de produto percorrida?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Transformar incerteza em pergunta, evidência e decisão",
                            isCorrect: true,
                        },
                        {
                            text: "Dominar os frameworks mais usados pelas grandes empresas",
                            isCorrect: false,
                        },
                        {
                            text: "Conhecer as ferramentas que o mercado adota neste momento",
                            isCorrect: false,
                        },
                        {
                            text: "Acumular certificações reconhecidas pelas áreas de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o ofício de produto foi definido no fechamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Decidir sob incerteza com método e assumir a escolha",
                            isCorrect: true,
                        },
                        {
                            text: "Coordenar times de engenharia para entregar no prazo",
                            isCorrect: false,
                        },
                        {
                            text: "Traduzir pedidos de clientes em requisitos detalhados",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever documentos que alinham as áreas da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o melhor treino contínuo para quem trabalha com produto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Escrever a decisão antes e conferir o resultado depois",
                            isCorrect: true,
                        },
                        {
                            text: "Ler um livro novo de produto a cada mês do ano inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Acompanhar os lançamentos das empresas de tecnologia grandes",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de empresa com frequência para acumular repertório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que aprofundar em um domínio específico é um caminho subestimado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conhecer o setor a fundo é valorizado no mercado",
                            isCorrect: true,
                        },
                        {
                            text: "Domínios específicos exigem menos conhecimento técnico geral",
                            isCorrect: false,
                        },
                        {
                            text: "Empresas de setores tradicionais pagam mais que as de software",
                            isCorrect: false,
                        },
                        {
                            text: "Especialistas de domínio não precisam mais estudar produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que combinação o trabalho de produto exige de quem o exerce?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Humildade para mudar de ideia e coragem para sustentar",
                            isCorrect: true,
                        },
                        {
                            text: "Firmeza para manter a decisão tomada até o fim do prazo",
                            isCorrect: false,
                        },
                        {
                            text: "Neutralidade para nunca defender uma posição pessoal forte",
                            isCorrect: false,
                        },
                        {
                            text: "Consenso constante entre todas as áreas antes de decidir",
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
