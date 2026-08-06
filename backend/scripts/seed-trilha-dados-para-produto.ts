// Seed da trilha Dados para Produto, estagio 3 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-dados-para-produto.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Dados para Produto";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "O território do Product Analyst: métricas acionáveis e north star, o funil AARRR com exemplos brasileiros, retenção e coorte de verdade, instrumentação de eventos que responde perguntas, experimentos A/B sem armadilhas e a análise que vira decisão, fechando com o sistema de métricas completo de um produto.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Métricas que importam",
    aulas: [
        {
            titulo: "Métrica de vaidade e métrica acionável",
            blocks: [
                {
                    type: "text",
                    value: "# A métrica que não muda nada\n\nUm app de finanças anuncia 500.000 downloads acumulados desde o lançamento. O número enche o slide, rende post no LinkedIn e não serve pra nada: ele só cresce, nunca cai e não separa quem abriu uma vez de quem usa toda semana. No mesmo período, esse app tem 12.000 usuários ativos mensais. Ou seja, 2,4% de quem baixou continua por perto, e é essa segunda conta que diz onde o produto realmente está.\n\nMétrica de vaidade é a que sobe com o tempo, faz o time se sentir bem e não altera nenhuma decisão. Downloads acumulados, pageviews totais, seguidores, cadastros desde sempre: todas têm o mesmo defeito, são estoques que só engordam. Métrica acionável é a que pode piorar, aponta pra um comportamento específico e tem alguém responsável. Retenção de 30 dias, conversão de cadastro em conta conectada, tempo até a primeira transação categorizada.\n\nA diferença não está no nome da métrica, está no uso. Pageviews de um artigo de ajuda é vaidade num slide de diretoria e é acionável pro time de suporte que quer saber qual dúvida aparece antes do chamado. O que separa as duas é a pergunta que vem depois do número, não o número em si.",
                },
                {
                    type: "table",
                    value: '[["Métrica","Por que ela atrai","O que perguntar no lugar"],["Downloads acumulados","Só cresce e vira manchete","Quantos instalaram e voltaram em 30 dias?"],["Pageviews totais","Volume alto impressiona","Quantas visitas terminaram em cadastro?"],["Cadastros desde o lançamento","Parece base de clientes","Quantos cadastrados usaram nesta semana?"],["Seguidores nas redes","Prova social visível","Quantos seguidores viraram usuários ativos?"],["Tempo médio na tela","Soa como engajamento","O tempo maior veio de valor ou de confusão?"]]',
                },
                {
                    type: "quote",
                    value: "Toda métrica boa aceita a pergunta: se esse número cair pela metade amanhã, o que a gente faz? Se a resposta é nada, o número é decoração.",
                },
                {
                    type: "text",
                    value: "## O teste da decisão\n\nExiste um teste de uma linha pra separar as duas: que decisão essa métrica muda? Se ninguém consegue nomear uma ação concreta que aconteceria caso o número subisse ou caísse 20%, você está diante de decoração cara, porque alguém paga pra coletar, guardar e desenhar aquilo num painel todo mês.\n\nAplicando ao mesmo app: ele fechou o mês com 240.000 usuários ativos mensais e 48.000 ativos diários. O total mensal sozinho não sugere ação nenhuma. A razão entre os dois, 20%, sugere: o usuário médio abre o app cerca de 6 dias por mês, pouco pra um produto que quer virar hábito de checagem semanal. Decisão possível: investir no resumo semanal por notificação e medir de novo em quatro semanas.\n\nTrês perguntas fazem a triagem de qualquer candidata a entrar no painel. Primeira: alguém é responsável por ela? Segunda: existe uma alavanca conhecida que mexe nela em semanas, não em anos? Terceira: ela pode piorar? Métrica que só sabe subir nunca vai te avisar de nada. Se as três respostas aparecem, você tem uma métrica de trabalho. Se não aparecem, você tem um número de relatório, e vale ser honesto sobre isso em vez de fingir que ele guia o time.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um app soma 500.000 downloads acumulados e 12.000 usuários ativos mensais. Por que o primeiro número é métrica de vaidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele só cresce e não separa quem ficou de quem sumiu",
                            isCorrect: true,
                        },
                        {
                            text: "Porque foi medido por ferramenta gratuita de mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Porque as lojas de apps não registram instalações",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a diretoria prefere olhar receita a olhar volume",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o teste de uma linha para saber se uma métrica é acionável?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Perguntar que decisão concreta esse número muda",
                            isCorrect: true,
                        },
                        {
                            text: "Conferir se o número aparece no painel da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Checar se a métrica cresceu nos últimos três meses",
                            isCorrect: false,
                        },
                        {
                            text: "Ver se a ferramenta de analytics coleta ela sozinha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O app tem 240.000 ativos mensais e 48.000 ativos diários. O que a razão de 20% sugere?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O usuário médio abre o app cerca de 6 dias por mês",
                            isCorrect: true,
                        },
                        {
                            text: "Um em cada cinco usuários cancelou a conta no período",
                            isCorrect: false,
                        },
                        {
                            text: "O produto perde 20% da base ativa a cada mês novo",
                            isCorrect: false,
                        },
                        {
                            text: "A base diária cresce cinco vezes mais que a mensal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que pageviews de um artigo de ajuda pode ser vaidade num caso e acionável em outro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que decide é a pergunta que o time faz com o número",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a métrica muda de nome conforme a ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Porque só o time de suporte pode ver dados de conteúdo",
                            isCorrect: false,
                        },
                        {
                            text: "Porque páginas de ajuda ficam fora do funil de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na triagem de métricas, qual pergunta a métrica 'cadastros desde o lançamento' reprova de forma mais clara?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela pode piorar? Um acumulado nunca cai, só engorda",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é coletada? Sim, todo cadastro vira um registro",
                            isCorrect: false,
                        },
                        {
                            text: "Ela tem dono? O time de crescimento acompanha o dado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é fácil de ler? O número é simples de interpretar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "North star: a métrica que resume valor",
            blocks: [
                {
                    type: "text",
                    value: "# Uma métrica para o produto inteiro\n\nNorth star é a métrica única que melhor representa o valor que o produto entrega ao usuário e que, se crescer de forma saudável, puxa o negócio junto. Ela existe por um motivo prático: times grandes se dispersam. Marketing persegue instalação, engenharia persegue tempo de resposta, comercial persegue contrato, e ninguém consegue dizer se o produto está ficando melhor. A north star obriga todo mundo a apontar pro mesmo lugar.\n\nUma boa candidata combina três coisas. Largura: quantas pessoas recebem valor. Profundidade: quanto valor cada uma recebe. Frequência: com que regularidade isso acontece. Por isso 'corridas concluídas por semana' funciona melhor que 'motoristas cadastrados', e 'horas ouvidas por usuário ativo' funciona melhor que 'assinaturas vendidas'. A primeira só sobe quando alguém foi de fato de um ponto ao outro; a segunda sobe mesmo com o app parado.\n\nO teste é direto: se essa métrica subir 30% no próximo trimestre, o usuário está claramente melhor? E o negócio, fica de pé? Se você responde sim pras duas perguntas, achou uma boa candidata. Se responde sim só pra segunda, achou uma métrica de receita disfarçada de métrica de produto.",
                },
                {
                    type: "table",
                    value: '[["Tipo de produto","North star plausível","Por que representa valor"],["Marketplace","Pedidos entregues no prazo","O valor só existe quando a entrega acontece"],["App de transporte","Corridas concluídas por semana","Junta oferta, demanda e execução num número"],["Streaming de música","Horas ouvidas por usuário ativo","Mede uso real, não apenas assinatura paga"],["Banco digital","Clientes com a conta como principal","Captura profundidade, não só conta aberta"],["Finanças pessoais","Semanas com o orçamento conferido","O hábito é o que resolve o problema real"]]',
                },
                {
                    type: "quote",
                    value: "Receita é consequência, não north star. Se a sua métrica principal consegue subir enquanto o usuário sai insatisfeito, ela não está medindo valor entregue.",
                },
                {
                    type: "text",
                    value: "## As armadilhas da escolha\n\nA primeira armadilha é escolher receita. Receita é o resultado que você quer, mas ela sobe com aumento de preço, com cobrança agressiva e com truque de renovação automática, tudo isso enquanto o usuário fica pior. A segunda é escolher algo que o time não influencia: cotação de mercado, sazonalidade do setor, decisão regulatória. Métrica que não responde ao trabalho vira fatalismo.\n\nA terceira é escolher uma métrica fácil de manipular. 'Sessões por usuário' sobe quando o app fica confuso e a pessoa precisa entrar três vezes pra achar o que quer. 'Tempo na tela' sobe quando o formulário está mal feito. Sempre pergunte de que jeitos ruins esse número pode crescer, e coloque um contrapeso ao lado.\n\nA quarta é ter três north stars, que é o mesmo que não ter nenhuma. Uma métrica principal, com duas ou três de contexto, é o formato que funciona. E a quinta é trocar de north star todo trimestre: sem estabilidade não existe série histórica, e sem série histórica ninguém sabe se o ano foi bom. Trocar às vezes é necessário, quando o produto muda de proposta, mas cada troca custa a memória do time.",
                },
            ],
            questions: [
                {
                    statement: "O que uma boa north star precisa representar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O valor que o produto entrega e o usuário percebe",
                            isCorrect: true,
                        },
                        {
                            text: "O total de receita reconhecida pelo financeiro",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de entregas feitas pelo time no trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "O número de usuários cadastrados desde o começo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual seria a north star mais adequada para um app de transporte?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Corridas concluídas por semana na região atendida",
                            isCorrect: true,
                        },
                        {
                            text: "Motoristas cadastrados na plataforma desde o início",
                            isCorrect: false,
                        },
                        {
                            text: "Downloads do aplicativo somando as duas lojas",
                            isCorrect: false,
                        },
                        {
                            text: "Reclamações abertas no atendimento a cada mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que 'sessões por usuário' costuma ser uma north star enganosa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela também sobe quando o app fica confuso de usar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque sessões não são registradas em ferramentas web",
                            isCorrect: false,
                        },
                        {
                            text: "Porque apenas produtos de mídia conseguem medir isso",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o valor depende do fuso horário do servidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa define receita mensal como north star. Qual é o problema central?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Receita é resultado e sobe até com usuário insatisfeito",
                            isCorrect: true,
                        },
                        {
                            text: "Receita só pode ser medida no fechamento do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Receita não é acompanhada pela área de produto no país",
                            isCorrect: false,
                        },
                        {
                            text: "Times de dados não têm acesso ao sistema financeiro interno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer trocar a north star pela terceira vez no mesmo ano. Qual é o maior custo dessa troca?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ninguém consegue comparar o desempenho ao longo do ano",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta de analytics precisa ser trocada junto",
                            isCorrect: false,
                        },
                        {
                            text: "O painel perde o histórico salvo pelo administrador antes",
                            isCorrect: false,
                        },
                        {
                            text: "A meta anual passa a exigir aprovação do jurídico",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas de entrada e de saída",
            blocks: [
                {
                    type: "text",
                    value: "# O que você move e o que apenas resulta\n\nMétrica de saída é o placar: receita recorrente, retenção de 30 dias, north star. Ninguém consegue chegar de manhã e aumentar receita por decreto. Métrica de entrada é a jogada: número de contas conectadas por usuário, tempo de sincronização bancária, quantidade de convites enviados, cobertura da notificação semanal. Essas o time move diretamente com o trabalho da semana.\n\nA confusão entre as duas produz o tipo mais comum de meta inútil. 'Aumentar a retenção em 5 pontos até dezembro' é um desejo, não um plano, porque não diz o que será feito. Vira plano quando alguém completa: 'acreditamos que reduzir o tempo de sincronização de 40 para 10 segundos aumenta a ativação, e ativação puxa retenção'. Agora existe uma entrada com dono, prazo e número.\n\nO caminho contrário também erra. Time que só olha entradas comemora sincronização rápida enquanto a retenção despenca, porque nunca checou se aquela entrada estava mesmo ligada ao resultado. As duas pontas precisam conviver: a saída diz se você está ganhando o jogo, a entrada diz o que fazer amanhã de manhã. A árvore de métricas é o desenho que liga uma coisa à outra de forma explícita.",
                },
                {
                    type: "code",
                    value: "// Arvore de metricas de um app de financas pessoais\nnorth_star = usuarios_com_semana_conferida\n\nusuarios_com_semana_conferida\n  = usuarios_ativos_semanais x taxa_de_conferencia\n\n  usuarios_ativos_semanais            // saida intermediaria\n    = novos_ativados + retornantes - perdidos\n\n  taxa_de_conferencia                 // saida intermediaria\n    <- notificacao_semanal_entregue   // entrada: engenharia\n    <- tempo_de_sincronizacao         // entrada: engenharia\n    <- contas_conectadas_por_usuario  // entrada: produto\n    <- categorias_sugeridas_corretas  // entrada: dados",
                },
                {
                    type: "table",
                    value: '[["Métrica","Tipo","Quem move e como"],["Receita recorrente mensal","Saída","Ninguém move direto; resulta das outras"],["Novos assinantes na semana","Entrada","Aquisição e time de conversão"],["Taxa de churn mensal","Saída","Resulta de valor percebido e suporte"],["Tempo de sincronização","Entrada","Engenharia, com meta em segundos"],["Contas conectadas por usuário","Entrada","Produto, melhorando o fluxo de conexão"]]',
                },
                {
                    type: "quote",
                    value: "Meta de saída sem entrada definida é desejo com data. Vira plano no instante em que alguém diz qual alavanca vai puxar e quanto ela precisa mexer.",
                },
                {
                    type: "text",
                    value: "## A aritmética da árvore\n\nA árvore fica útil quando você coloca números nela. O app tem 12.000 assinantes pagando R$ 19,90, o que dá R$ 238.800 de receita recorrente mensal. Entram 900 assinantes por mês e saem 600, então o crescimento líquido é de 300 por mês, ou 2,5% da base.\n\nAgora a pergunta de priorização: vale mais trazer assinante novo ou segurar quem está saindo? Se o churn cai de 5% para 4%, os cancelamentos passam de 600 para 480 e o líquido vai de 300 para 420 por mês, um crescimento 40% mais rápido sem gastar um centavo em aquisição. Pra conseguir o mesmo efeito só pela entrada, você precisaria subir os novos assinantes de 900 para 1.020, o que custa mídia.\n\nEsse tipo de conta é o trabalho central do analista de produto: transformar a árvore num modelo simples, mexer em uma variável por vez e mostrar ao time onde o esforço rende mais. Não precisa de estatística sofisticada, precisa de aritmética honesta e de deixar as suposições visíveis. Quando alguém discorda do resultado, a discussão passa a ser sobre a suposição, que é exatamente onde ela deveria estar.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma métrica de entrada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O time consegue mexer nela direto com o trabalho",
                            isCorrect: true,
                        },
                        {
                            text: "Ela aparece no relatório trimestral da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é sempre expressa em reais e nunca em contagem",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é calculada apenas no fechamento contábil do mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Receita recorrente mensal é métrica de entrada ou de saída?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Saída, porque resulta de outras métricas do produto",
                            isCorrect: true,
                        },
                        {
                            text: "Entrada, porque o time define o preço da assinatura",
                            isCorrect: false,
                        },
                        {
                            text: "Entrada, porque o comercial fecha contrato todo dia",
                            isCorrect: false,
                        },
                        {
                            text: "Saída, porque o valor é auditado pela contabilidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A base tem 12.000 assinantes, entram 900 e saem 600 por mês. Qual é o crescimento líquido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "300 por mês, o equivalente a 2,5% da base atual",
                            isCorrect: true,
                        },
                        {
                            text: "1.500 por mês, somando entradas e saídas do período",
                            isCorrect: false,
                        },
                        {
                            text: "600 por mês, o mesmo total de quem cancelou o plano",
                            isCorrect: false,
                        },
                        {
                            text: "900 por mês, contando apenas quem assinou no mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 12.000 assinantes e 900 novos por mês, o churn cai de 5% para 4%. O líquido vai de 300 para quanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para 420 por mês, um crescimento 40% mais rápido",
                            isCorrect: true,
                        },
                        {
                            text: "Para 360 por mês, já que o churn caiu um quinto",
                            isCorrect: false,
                        },
                        {
                            text: "Para 480 por mês, o novo total de cancelamentos",
                            isCorrect: false,
                        },
                        {
                            text: "Para 900 por mês, porque ninguém mais cancelaria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A meta do trimestre é 'aumentar a retenção em 5 pontos'. O que falta para ela virar plano?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dizer qual entrada será movida e quanto ela muda",
                            isCorrect: true,
                        },
                        {
                            text: "Escolher a ferramenta que vai calcular a retenção",
                            isCorrect: false,
                        },
                        {
                            text: "Definir o prazo de aprovação da meta na diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a north star por uma métrica de retenção",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Contadores, taxas e razões",
            blocks: [
                {
                    type: "text",
                    value: "# Três formas de contar e três formas de errar\n\nQuase toda métrica de produto cai em uma de três formas. Contador é contagem simples: 24.000 cadastros no mês, 1.850 pedidos no dia. Taxa é uma divisão em que o numerador é um subconjunto do denominador: 300 assinaram entre 1.200 que clicaram, 25%. Razão divide grandezas de populações diferentes: usuários diários sobre mensais, receita por usuário ativo.\n\nCada forma erra de um jeito. O contador erra na definição: 24.000 cadastros conta conta criada ou e-mail confirmado? A diferença entre as duas pode ser de 30%. A taxa erra no denominador: 300 assinaturas viram conversão de 25% se você divide por quem clicou em assinar, e de 10% se divide pelos 3.000 que só viram a página de planos. Mesmo numerador, duas histórias.\n\nA razão erra na comparação: DAU sobre MAU de 20% em duas empresas diferentes pode significar coisas opostas, porque cada uma define usuário ativo do seu jeito. Nada disso é fraude; é descuido de vocabulário. O antídoto é escrever o denominador no nome da métrica: 'conversão de quem viu a página de planos' é chato de ler e impossível de entender errado.",
                },
                {
                    type: "code",
                    value: "-- Conversao com denominador explicito: mesma janela, mesma populacao\nSELECT\n  COUNT(DISTINCT CASE WHEN nome = 'planos_visualizado'  THEN usuario_id END) AS viram_planos,\n  COUNT(DISTINCT CASE WHEN nome = 'assinatura_iniciada'  THEN usuario_id END) AS iniciaram,\n  COUNT(DISTINCT CASE WHEN nome = 'assinatura_concluida' THEN usuario_id END) AS concluiram\nFROM eventos\nWHERE data >= '2026-03-01' AND data < '2026-04-01';\n\n-- viram_planos = 3000, iniciaram = 1200, concluiram = 300\n-- conversao_de_quem_viu     = 300 / 3000 = 10,0%\n-- conversao_de_quem_iniciou = 300 / 1200 = 25,0%\n-- as duas estao certas; erradas sao as que nao dizem o denominador",
                },
                {
                    type: "table",
                    value: '[["Forma","Exemplo","Pergunta que precisa vir junto"],["Contador","24.000 cadastros no mês","Cadastro é conta criada ou e-mail confirmado?"],["Taxa","Conversão de 25% na assinatura","Vinte e cinco por cento de qual população?"],["Razão","Diários sobre mensais em 20%","As duas contagens usam a mesma definição?"],["Média","Ticket médio de R$ 19,90","A média esconde planos muito diferentes?"],["Acumulado","500.000 downloads","Em que período e quantos seguem ativos?"]]',
                },
                {
                    type: "quote",
                    value: "Toda taxa carrega um denominador escondido. Quem apresenta a taxa sem dizer o denominador não está mentindo, mas também não está informando nada.",
                },
                {
                    type: "text",
                    value: "## A definição de ativo decide o número\n\nUsuário ativo mensal parece um conceito único e não é. Se ativo significa 'abriu o app', o número infla com qualquer notificação disparada em massa: a pessoa toca na notificação, vê a tela, sai, e virou ativa. Se ativo significa 'conferiu o resumo com pelo menos uma conta sincronizada', o número cai e passa a medir gente que recebeu valor.\n\nNo mesmo produto, as duas definições dão 240.000 e 96.000 usuários ativos mensais. Nenhuma é falsa; a segunda é mais útil pro time, porque responde a uma pergunta de produto e não a uma pergunta de tráfego. A regra prática é escolher um evento âncora que só acontece quando o usuário obteve o que veio buscar, e manter essa definição estável por bastante tempo.\n\nO mesmo cuidado vale pra média. Ticket médio de R$ 19,90 é informativo quando todo mundo paga o mesmo plano. No dia em que entra um plano anual de R$ 199,00, a média passa a misturar duas populações e esconde as duas. Nesses casos, mediana e distribuição por faixa contam a história melhor que a média, e custa uma consulta a mais descobrir isso.",
                },
            ],
            questions: [
                {
                    statement:
                        "Na página de planos, 3.000 pessoas veem, 1.200 clicam em assinar e 300 concluem. Qual é a conversão de quem clicou?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "25%, porque 300 dividido por 1.200 dá um quarto",
                            isCorrect: true,
                        },
                        {
                            text: "10%, porque 300 dividido por 3.000 dá um décimo",
                            isCorrect: false,
                        },
                        {
                            text: "40%, porque 1.200 dividido por 3.000 dá dois quintos",
                            isCorrect: false,
                        },
                        {
                            text: "75%, porque 900 pessoas desistiram após o clique",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma taxa sem denominador claro engana quem lê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O mesmo numerador vira taxas bem diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "Porque taxas precisam virar número absoluto sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a ferramenta calcula taxa de um jeito só",
                            isCorrect: false,
                        },
                        {
                            text: "Porque taxa acima de cem por cento é inválida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 48.000 usuários diários e 240.000 mensais, o que a razão de 20% indica sobre o hábito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O usuário médio usa o produto uns 6 dias por mês",
                            isCorrect: true,
                        },
                        {
                            text: "Um quinto dos usuários cancelou a conta no mês",
                            isCorrect: false,
                        },
                        {
                            text: "A base ativa cresce 20% a cada mês que passa",
                            isCorrect: false,
                        },
                        {
                            text: "Vinte por cento dos dias do mês tiveram falha grave",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Trocar a definição de ativo de 'abriu o app' para 'conferiu o resumo' derruba o total de 240.000 para 96.000. Como interpretar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A segunda definição mede valor e dá número menor",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta perdeu 60% dos eventos com a mudança",
                            isCorrect: false,
                        },
                        {
                            text: "O produto encolheu 60% no período medido no painel",
                            isCorrect: false,
                        },
                        {
                            text: "As duas definições convergem no mesmo valor depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas empresas divulgam razão de usuários diários sobre mensais de 20%. Por que a comparação pode não valer nada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada uma define usuário ativo de um jeito próprio",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a razão só vale para produtos de assinatura",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os dados vêm de ferramentas concorrentes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque meses de 31 dias sempre elevam essa razão",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O dashboard que responde perguntas",
            blocks: [
                {
                    type: "text",
                    value: "# Menos gráficos, mais perguntas\n\nO painel típico de time de produto tem vinte e oito gráficos e três acessos por semana. Ele não fracassou por falta de dado, fracassou por excesso: quando tudo está na tela, nada tem peso, e o cérebro humano desiste de procurar o que importa. Painel bom é ferramenta de conversa, não vitrine de capacidade técnica.\n\nA inversão que resolve é começar pelas perguntas, não pelos dados disponíveis. Liste as cinco perguntas que o time realmente faz toda semana: estamos crescendo? onde as pessoas travam? quem voltou? o que quebrou? a última entrega mexeu em alguma coisa? Cada gráfico existe pra responder uma delas, e o título do gráfico deve ser a pergunta escrita, não o nome técnico do evento.\n\nA segunda regra é hierarquia. A north star fica no topo, sozinha, com meta e tendência. Logo abaixo, três a cinco entradas que o time move. Depois o funil do caminho principal. Por último, saúde técnica. Exploração não mora no painel: consulta solta responde pergunta nova e vira gráfico fixo apenas se a pergunta virar recorrente. Painel que ninguém abre há trinta dias está morto, e vale apagar em vez de manter no respirador.",
                },
                {
                    type: "table",
                    value: '[["Camada","O que mostra","Quando se olha"],["North star","Uma métrica com meta e tendência","Semanal, no ritual do time"],["Entradas","Três a cinco alavancas do time","Semanal, junto da north star"],["Funil","Conversão por etapa do caminho principal","Quinzenal ou quando algo cai"],["Saúde","Erro, latência e falha de sincronização","Diário, de preferência por alerta"],["Exploração","Consultas soltas de pergunta nova","Sob demanda, fora do painel"]]',
                },
                {
                    type: "quote",
                    value: "Painel não é obra de arte, é ferramenta de conversa. Se ele não muda o assunto da reunião de segunda-feira, é enfeite caro de manter.",
                },
                {
                    type: "text",
                    value: "## Contexto, comparação e alerta\n\nNúmero sozinho não informa. 'Ativação de 38%' não diz se o time deve comemorar ou entrar em pânico. 'Ativação de 38%, contra 34% na semana passada e meta de 45%' diz. Todo indicador precisa de pelo menos uma referência: período anterior, mesma semana do ano passado, meta acordada ou segmento comparável. Sem isso, cada pessoa da reunião inventa sua própria referência mental e a conversa vira disputa de intuição.\n\nA segunda peça é o segmento padrão. Nos produtos móveis, plataforma e coorte de entrada explicam a maior parte das diferenças, então já deixe o painel quebrado por elas. O agregado tem o hábito de esconder dois mundos: um número estável na média pode ser Android caindo e iOS subindo ao mesmo tempo.\n\nA terceira peça é abandonar a vigilância manual. Métrica de saúde não deveria depender de alguém lembrar de abrir a tela: erro de sincronização acima de 2% precisa virar alerta com destinatário e limite definido antes, no frio. Gráfico de saúde no painel serve pra investigar depois que o alerta tocou, não pra descobrir o incidente. Quando esse desenho fica pronto, o painel encolhe e a atenção do time volta pras perguntas que ainda não têm resposta automática.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a primeira camada de um painel bem organizado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A north star, com meta e tendência, no topo",
                            isCorrect: true,
                        },
                        {
                            text: "A lista completa de eventos coletados no mês",
                            isCorrect: false,
                        },
                        {
                            text: "O funil detalhado com todas as etapas do app",
                            isCorrect: false,
                        },
                        {
                            text: "As consultas exploratórias feitas pelo analista",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual deve ser o título de cada gráfico de um painel de time?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A pergunta de negócio que aquele gráfico responde",
                            isCorrect: true,
                        },
                        {
                            text: "O nome técnico do evento usado na consulta SQL",
                            isCorrect: false,
                        },
                        {
                            text: "A data da última atualização automática daquele dado",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do time responsável por manter o painel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um painel tem 28 gráficos e recebe 3 acessos por semana. Qual é o diagnóstico mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele mostra coisa demais e não responde nada útil",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta está lenta e por isso ninguém abre",
                            isCorrect: false,
                        },
                        {
                            text: "O time ainda não teve treinamento naquela ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Os dados chegam atrasados por falha de coleta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que todo número exibido no painel precisa de uma comparação ao lado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem referência, o valor não diz se é bom ou ruim",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a ferramenta exige duas séries para o gráfico",
                            isCorrect: false,
                        },
                        {
                            text: "Porque comparar reduz o custo de consulta no banco",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a diretoria só aceita gráfico com duas cores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O gráfico de erro de sincronização existe no painel, mas ninguém olha e o incidente demora horas a aparecer. Qual é a correção?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Virar alerta com limite e destinatário definidos",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o tamanho do gráfico na primeira tela do painel",
                            isCorrect: false,
                        },
                        {
                            text: "Mover o gráfico para cima, acima da north star",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a cor da linha para chamar mais atenção",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - O funil AARRR",
    aulas: [
        {
            titulo: "O modelo pirata AARRR",
            blocks: [
                {
                    type: "text",
                    value: "# Cinco letras para organizar o crescimento\n\nAARRR é um jeito de arrumar as métricas de produto em cinco etapas: aquisição, ativação, retenção, receita e indicação. O apelido de modelo pirata vem do som das iniciais, e a graça acaba aí; o valor está em obrigar o time a separar problemas que costumam virar uma papa só chamada 'crescimento'.\n\nA separação importa porque cada etapa tem dono, alavanca e remédio diferentes. Aquisição ruim se resolve com canal, criativo e proposta de valor. Ativação ruim se resolve com o primeiro uso, não com mais anúncio. Retenção ruim não se resolve com nenhum dos dois: se as pessoas não voltam, o problema é o produto. Quando o time discute 'crescimento' sem dizer a etapa, cada um está falando de uma coisa e todos concordam sem se entender.\n\nO modelo também dá uma ordem de leitura. Você lê de cima pra baixo pra entender o caminho do usuário, mas trabalha de baixo pra cima quando o produto ainda é jovem. Não adianta encher o topo enquanto o fundo vaza. Essa inversão é a lição mais cara do modelo e é o que a próxima seção mostra com números.",
                },
                {
                    type: "table",
                    value: '[["Etapa","Pergunta que ela responde","Métrica típica"],["Aquisição","Como as pessoas chegam até aqui?","Instalações e custo por instalação"],["Ativação","A primeira experiência entrega valor?","Taxa de ativação em 7 dias"],["Retenção","As pessoas voltam sozinhas?","Retenção de 30 dias por coorte"],["Receita","O produto se paga com esse uso?","Assinantes e receita por usuário"],["Indicação","Quem usa traz mais gente?","Convites enviados e convites aceitos"]]',
                },
                {
                    type: "quote",
                    value: "Encher o balde furado é a forma mais cara de crescer: você paga de novo, todo mês, pelo mesmo usuário que já tinha conquistado uma vez.",
                },
                {
                    type: "text",
                    value: "## Por que retenção vem primeiro\n\nUm app de finanças fecha o mês assim: 40.000 instalações, 24.000 cadastros concluídos, 9.600 pessoas que conectaram uma conta e viram o resumo, 2.880 que voltaram depois de 30 dias. As perdas por etapa são de 40%, 60% e 70%. O impulso natural é pedir mais verba de mídia, e é aí que o dinheiro some.\n\nCompare duas jogadas. Primeira: subir a retenção de 30 dias de 30% para 36%. Sobre os mesmos 9.600 ativados, isso são 576 usuários a mais permanecendo, e custa trabalho de produto, não mídia. Segunda: obter esses mesmos 576 pela aquisição. Como cada instalação vira 0,24 ativado e cada ativado tem 30% de chance de ficar, seriam necessárias 8.000 instalações extras. A R$ 12,00 cada na mídia paga, isso é R$ 96.000 no mês, e no mês seguinte você paga tudo de novo.\n\nEsse é o argumento inteiro. Melhoria de retenção é permanente e composta: ela vale pra coorte de agora e pra todas as próximas. Aquisição comprada é aluguel: para de pagar, para de chegar. Times maduros só abrem a torneira de cima depois de provar que o fundo do balde segura água.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as cinco etapas do modelo AARRR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aquisição, ativação, retenção, receita e indicação",
                            isCorrect: true,
                        },
                        {
                            text: "Anúncio, alcance, registro, recorrência e resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Análise, avaliação, revisão, relatório e indicador",
                            isCorrect: false,
                        },
                        {
                            text: "Atenção, adesão, retorno, rentabilidade e reforço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o modelo recomenda trabalhar a retenção antes da aquisição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Encher um balde furado desperdiça todo o investimento",
                            isCorrect: true,
                        },
                        {
                            text: "Porque campanhas pagas são proibidas para apps novos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque retenção é sempre mais barata de instrumentar",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a aquisição só pode ser medida no ano seguinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 40.000 instalações, 24.000 cadastros e 9.600 ativados, quais são as perdas nas duas primeiras etapas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Perde 40% no cadastro e 60% na ativação seguinte",
                            isCorrect: true,
                        },
                        {
                            text: "Perde 60% no cadastro e 40% na ativação seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "Perde 24% no cadastro e 76% na ativação seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "Perde 16% no cadastro e 84% na ativação seguinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Cada instalação vira 0,24 ativado e 30% dos ativados ficam. Quantas instalações extras dão 576 usuários retidos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "8.000 instalações, ao custo de R$ 96.000 em mídia",
                            isCorrect: true,
                        },
                        {
                            text: "2.400 instalações, ao custo de R$ 28.800 em mídia",
                            isCorrect: false,
                        },
                        {
                            text: "1.920 instalações, ao custo de R$ 23.040 em mídia",
                            isCorrect: false,
                        },
                        {
                            text: "19.200 instalações, ao custo de R$ 230.400 em mídia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a melhoria de retenção é considerada composta e a aquisição paga não é?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela vale para as coortes futuras sem novo gasto",
                            isCorrect: true,
                        },
                        {
                            text: "Ela aparece no painel antes das outras métricas",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é calculada com juros sobre a base de usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Ela depende de contrato anual com o canal de mídia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Aquisição: canais, custo e qualidade",
            blocks: [
                {
                    type: "text",
                    value: "# Volume barato não é volume bom\n\nA primeira tabela que todo analista monta na aquisição é canal por volume, e ela quase sempre engana. O canal que traz mais gente costuma trazer a gente errada, e o custo por instalação esconde isso muito bem. Só quando você leva a conta até a ativação a diferença de qualidade aparece.\n\nNo mês do app de finanças, a mídia paga trouxe 14.000 instalações por R$ 168.000, o que dá R$ 12,00 por instalação. Parece razoável. Só que dessas 14.000, apenas 1.400 pessoas chegaram a conectar uma conta: R$ 120,00 por usuário ativado, dez vezes o número que estava no relatório de mídia. A indicação, no mesmo mês, trouxe 6.000 instalações por R$ 21.000, ou R$ 3,50 cada, e entregou 2.100 ativados: R$ 10,00 por ativado.\n\nMesma verba, resultados incomparáveis. É por isso que a métrica de aquisição precisa terminar numa etapa de valor, nunca no download. Custo por instalação serve pra comparar criativos dentro de um canal. Custo por usuário ativado serve pra decidir onde colocar o dinheiro do trimestre, que é a decisão que interessa.",
                },
                {
                    type: "table",
                    value: '[["Canal","Instalações","Custo total","Por instalação","Ativados","Por ativado"],["Busca orgânica","16.000","sem custo direto","R$ 0,00","5.200","R$ 0,00"],["Mídia paga","14.000","R$ 168.000","R$ 12,00","1.400","R$ 120,00"],["Indicação","6.000","R$ 21.000","R$ 3,50","2.100","R$ 10,00"],["Parcerias","4.000","R$ 36.000","R$ 9,00","900","R$ 40,00"],["Total","40.000","R$ 225.000","R$ 5,63","9.600","R$ 23,44"]]',
                },
                {
                    type: "quote",
                    value: "Custo por instalação mede a eficiência do anúncio. Custo por usuário ativado mede a eficiência do investimento. Só o segundo paga a conta no fim do ano.",
                },
                {
                    type: "text",
                    value: "## Atribuição como problema honesto\n\nUma pessoa vê o anúncio no domingo, não clica, lembra do nome na quarta, busca na loja e instala. Qual canal recebeu o crédito? Com atribuição de último clique, a busca orgânica leva tudo e a mídia paga parece inútil. Com primeiro clique, o oposto. Nenhum dos dois está certo, e todo modelo de atribuição é uma convenção, não uma medição.\n\nEm 2026 o problema piorou por bons motivos: restrições de identificador nos sistemas operacionais móveis e o fim do cookie de terceiro na web tiraram a rastreabilidade individual que sustentava os modelos determinísticos. Sobraram três caminhos honestos. Modelagem estatística, que estima contribuição em vez de rastrear pessoa. Pesquisa declarada no cadastro, imprecisa mas barata. E experimento de verdade: desligar o canal em algumas regiões e comparar o total com regiões parecidas.\n\nO terceiro caminho é o único que responde a pergunta causal, que é sempre 'quanto eu perderia se parasse?'. Um teste geográfico de quatro semanas costuma dizer mais sobre um canal do que um ano de painel de atribuição. E a postura profissional é apresentar o número de atribuição sempre com a régua ao lado: essa é a convenção que usamos, este é o erro que ela tem, e é assim que a gente confere de vez em quando.",
                },
            ],
            questions: [
                {
                    statement:
                        "A mídia paga custou R$ 168.000 e trouxe 14.000 instalações. Qual é o custo por instalação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "R$ 12,00, dividindo o gasto pelas instalações",
                            isCorrect: true,
                        },
                        {
                            text: "R$ 120,00, dividindo o gasto pelos ativados",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 5,63, que é a média de todos os canais juntos",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 3,50, que é o valor pago no canal de indicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o custo por instalação sozinho engana na decisão de investimento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele ignora quantos daqueles usuários chegam ao valor",
                            isCorrect: true,
                        },
                        {
                            text: "Ele muda todo dia por causa do leilão dos anúncios",
                            isCorrect: false,
                        },
                        {
                            text: "Ele não pode ser calculado em campanhas de vídeo",
                            isCorrect: false,
                        },
                        {
                            text: "Ele soma canais pagos e orgânicos dentro da mesma conta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Mídia paga: 14.000 instalações e 1.400 ativados por R$ 168.000. Indicação: 6.000 e 2.100 por R$ 21.000. Qual comparação está correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "R$ 120,00 por ativado contra R$ 10,00 na indicação",
                            isCorrect: true,
                        },
                        {
                            text: "R$ 12,00 por ativado contra R$ 3,50 na indicação",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 120,00 por ativado contra R$ 35,00 na indicação",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 84,00 por ativado contra R$ 21,00 na indicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A pessoa vê o anúncio no domingo, busca o app na quarta e instala. Como o último clique registra isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dá todo o crédito à busca, e o anúncio some da conta",
                            isCorrect: true,
                        },
                        {
                            text: "Divide o crédito igualmente entre anúncio e busca",
                            isCorrect: false,
                        },
                        {
                            text: "Dá todo o crédito ao anúncio visto no primeiro dia",
                            isCorrect: false,
                        },
                        {
                            text: "Descarta a instalação por falta de identificador único",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual abordagem responde de fato à pergunta 'quanto eu perderia se desligasse esse canal?'",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Desligar o canal em algumas regiões e comparar totais",
                            isCorrect: true,
                        },
                        {
                            text: "Trocar o modelo de atribuição de último para primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "Somar as conversões relatadas pela própria plataforma",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar no cadastro onde a pessoa conheceu o app",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ativação e o aha moment",
            blocks: [
                {
                    type: "text",
                    value: "# O momento em que a promessa se cumpre\n\nAtivação é a etapa em que o usuário experimenta pela primeira vez o valor que o produto prometeu. Num app de finanças, não é criar a conta: é ver os próprios gastos organizados na tela. Antes disso, a pessoa só investiu tempo. Depois disso, ela tem um motivo pra voltar.\n\nO aha moment não se decide em reunião, se procura nos dados. A pergunta operacional é: qual comportamento nos primeiros sete dias mais separa quem fica de quem some? No mês analisado, dos 24.000 cadastros, 14.400 não conectaram nenhuma conta e retiveram 3% em 30 dias. Quem conectou uma conta, 6.000 pessoas, reteve 18%. Quem conectou duas ou mais, 3.600 pessoas, reteve 50%. O salto entre uma e duas contas é grande demais pra ser ruído.\n\nAtenção ao que essa evidência é e ao que ela não é. Ela é correlação: pode ser que conectar duas contas faça a pessoa ficar, e pode ser que quem já ia ficar seja justamente quem se dá ao trabalho de conectar duas. Serve como definição operacional de ativação e como hipótese forte pro experimento do módulo 5. Não serve como prova de causa, e confundir as duas coisas é o erro mais comum da área.",
                },
                {
                    type: "table",
                    value: '[["Comportamento nos 7 primeiros dias","Usuários","Retidos em 30 dias","Retenção"],["Nenhuma conta conectada","14.400","432","3%"],["Uma conta conectada","6.000","1.080","18%"],["Duas ou mais contas conectadas","3.600","1.800","50%"],["Total de ativados (uma conta ou mais)","9.600","2.880","30%"]]',
                },
                {
                    type: "quote",
                    value: "O aha moment não é o que o time acha bonito no produto. É o comportamento que, na tabela, separa quem volta de quem nunca mais aparece.",
                },
                {
                    type: "text",
                    value: "## Escolher a definição sem enganar a si mesmo\n\nUm bom critério de ativação passa por quatro filtros. Correlaciona forte com retenção. Acontece cedo, de preferência nos primeiros dias. Alcança uma fração razoável dos usuários. E é influenciável pelo produto, ou seja, existe uma tela, um fluxo ou uma mensagem capaz de empurrar mais gente pra lá.\n\nO terceiro filtro é o que mais gente ignora. Se você descobrir que quem cria três orçamentos e convida o cônjuge retém 90%, mas isso acontece com 2% da base, você achou um troféu, não uma alavanca: mesmo dobrando esse grupo, o efeito no total é pequeno. Uma ativação que atinge 40% da base e retém 50% move muito mais o produto.\n\nVale separar dois momentos que costumam ser confundidos. O setup moment é a configuração: conectar a conta, importar contatos, escolher preferências. O habit moment é o retorno espontâneo: a pessoa abre o app na terceira semana sem ter recebido notificação. O setup é condição, o hábito é o objetivo. Times que só medem setup ficam felizes com onboarding bonito e curva de retenção plana no chão, porque otimizaram a entrada e nunca perguntaram o que acontece depois dela.",
                },
            ],
            questions: [
                {
                    statement: "O que significa ativação num app de finanças pessoais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A pessoa ver os próprios gastos organizados na tela",
                            isCorrect: true,
                        },
                        {
                            text: "A pessoa concluir o cadastro e confirmar o e-mail",
                            isCorrect: false,
                        },
                        {
                            text: "A pessoa instalar o app e aceitar as notificações",
                            isCorrect: false,
                        },
                        {
                            text: "A pessoa assinar o plano pago logo no primeiro acesso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quem conectou duas ou mais contas reteve 50% em 30 dias, contra 18% de quem conectou uma. O que concluir?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É uma correlação forte, boa candidata a hipótese",
                            isCorrect: true,
                        },
                        {
                            text: "É prova de que conectar contas causa a retenção",
                            isCorrect: false,
                        },
                        {
                            text: "É ruído estatístico e não merece investigação",
                            isCorrect: false,
                        },
                        {
                            text: "É erro de coleta, já que a diferença é grande demais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dos 24.000 cadastros, 9.600 conectaram ao menos uma conta e 2.880 voltaram após 30 dias. Qual é a retenção dos ativados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "30%, porque 2.880 dividido por 9.600 dá 0,30",
                            isCorrect: true,
                        },
                        {
                            text: "12%, porque 2.880 dividido por 24.000 dá 0,12",
                            isCorrect: false,
                        },
                        {
                            text: "40%, porque 9.600 dividido por 24.000 dá 0,40",
                            isCorrect: false,
                        },
                        {
                            text: "24%, porque 9.600 dividido por 40.000 dá 0,24",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um comportamento raro retém 90%, mas só 2% da base chega até ele. Por que ele é ruim como definição de ativação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mesmo dobrando esse grupo, o total quase não muda",
                            isCorrect: true,
                        },
                        {
                            text: "Retenções acima de 80% indicam erro de medição",
                            isCorrect: false,
                        },
                        {
                            text: "Comportamentos raros não podem ser instrumentados",
                            isCorrect: false,
                        },
                        {
                            text: "Ativação precisa acontecer no primeiro dia de uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O onboarding melhorou e o setup subiu de 40% para 55%, mas a retenção de 30 dias ficou igual. O que isso indica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O produto virou fácil de configurar e não de voltar",
                            isCorrect: true,
                        },
                        {
                            text: "A instrumentação do setup parou de funcionar bem",
                            isCorrect: false,
                        },
                        {
                            text: "A retenção sempre demora cerca de três meses para reagir",
                            isCorrect: false,
                        },
                        {
                            text: "O setup escolhido é o mesmo que o habit moment",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Receita e indicação",
            blocks: [
                {
                    type: "text",
                    value: "# Monetização também é métrica de produto\n\nReceita costuma ser tratada como assunto do time comercial, e num produto digital isso não faz sentido. A decisão de pagar acontece dentro do app, depois de uma sequência de experiências que o time de produto desenhou. Por isso as métricas de receita entram no funil como qualquer outra etapa.\n\nNo mês do app de finanças, 9.600 pessoas ativaram e 480 assinaram o plano de R$ 19,90, o que dá 5% de conversão e R$ 9.552 de receita recorrente nova. A receita por ativado fica em R$ 1,00, e a receita por assinante em R$ 19,90. Com churn mensal de 5%, a vida média do assinante é de 20 meses, então cada um vale R$ 398,00 ao longo do relacionamento.\n\nAgora a conta que muda o humor da reunião: o mês custou R$ 225.000 em canais pagos e produziu 480 assinantes, ou R$ 468,75 por assinante. Como cada assinante devolve R$ 398,00 ao longo de vinte meses, o mês não se paga, e isso antes de descontar custo de servidor, suporte e imposto. Não é motivo pra pânico, é motivo pra escolher: melhorar a conversão, subir a retenção, aumentar o preço ou trocar o mix de canais.",
                },
                {
                    type: "table",
                    value: '[["Métrica","Como se calcula no mês","Valor"],["Assinantes novos","5% de 9.600 ativados","480"],["Receita recorrente nova","480 vezes R$ 19,90","R$ 9.552"],["Receita por ativado","R$ 9.552 sobre 9.600","R$ 1,00"],["Vida média do assinante","1 dividido por 0,05 de churn","20 meses"],["Valor de vida do assinante","R$ 19,90 vezes 20 meses","R$ 398,00"],["Custo por assinante","R$ 225.000 sobre 480","R$ 468,75"]]',
                },
                {
                    type: "quote",
                    value: "Quando o custo de conquistar um assinante passa o valor que ele deixa, crescer mais rápido só serve para perder dinheiro mais rápido.",
                },
                {
                    type: "text",
                    value: "## Indicação: fator K e NPS com ceticismo\n\nIndicação é a etapa que transforma usuário em canal. O fator K resume isso em uma conta simples: convites enviados por usuário multiplicados pela taxa de aceite. Se cada usuário envia 3 convites e 12% viram cadastro, K vale 0,36. Abaixo de 1 não existe crescimento viral, mas existe amplificação: cada 100 usuários trazidos por outros meios acabam virando cerca de 156, porque 1 dividido por 0,64 dá 1,56.\n\nO NPS é o vizinho barulhento dessa etapa. Ele pergunta a probabilidade declarada de recomendar, agrupa em promotores, neutros e detratores, e subtrai. Com 45% de promotores e 25% de detratores, o NPS é 20. O problema é que quem responde pesquisa não é uma amostra aleatória da base, intenção declarada não é comportamento, e o número é sensível a quando e onde a pergunta aparece.\n\nA saída prática é usar cada um pra sua função. NPS serve como série temporal do mesmo público e, principalmente, pelo campo aberto: as respostas escritas apontam o problema antes de qualquer painel. Indicação real se mede com evento: convite enviado, convite aberto, cadastro atribuído ao convite. Comportamento medido vence intenção declarada sempre que os dois estiverem disponíveis.",
                },
            ],
            questions: [
                {
                    statement:
                        "Com 9.600 ativados e 480 assinantes de R$ 19,90, qual é a conversão em pagante e a receita nova?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "5% de conversão e R$ 9.552 de receita recorrente",
                            isCorrect: true,
                        },
                        {
                            text: "5% de conversão e R$ 19.104 de receita recorrente",
                            isCorrect: false,
                        },
                        {
                            text: "2% de conversão e R$ 9.552 de receita recorrente",
                            isCorrect: false,
                        },
                        {
                            text: "50% de conversão e R$ 9.552 de receita recorrente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se calcula o fator K de indicação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Convites por usuário vezes a taxa de aceite deles",
                            isCorrect: true,
                        },
                        {
                            text: "Usuários novos divididos pelos usuários antigos",
                            isCorrect: false,
                        },
                        {
                            text: "Promotores menos detratores da pesquisa de NPS",
                            isCorrect: false,
                        },
                        {
                            text: "Receita por usuário dividida pelo custo total do canal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Cada usuário envia 3 convites e 12% deles viram cadastro. Qual é o fator K e o que ele significa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "K de 0,36: sem viralidade, mas com amplificação",
                            isCorrect: true,
                        },
                        {
                            text: "K de 3,12: crescimento viral já se sustentando",
                            isCorrect: false,
                        },
                        {
                            text: "K de 0,12: a taxa de aceite é o próprio fator K",
                            isCorrect: false,
                        },
                        {
                            text: "K de 1,36: cada usuário traz mais que um usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O assinante vale R$ 398,00 de vida útil e custou R$ 468,75 para ser conquistado. O que a conta indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O mês não se paga e o mix precisa ser revisto",
                            isCorrect: true,
                        },
                        {
                            text: "O produto está saudável, com folga de R$ 70,75",
                            isCorrect: false,
                        },
                        {
                            text: "A conta só fecha se o churn subir nos próximos meses",
                            isCorrect: false,
                        },
                        {
                            text: "O preço está alto demais para o público atendido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A pesquisa de NPS deu 20 e o time quer usar isso como principal métrica de indicação. Qual é a objeção mais forte?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Intenção declarada não é o mesmo que indicar de fato",
                            isCorrect: true,
                        },
                        {
                            text: "O cálculo do NPS ignora quem respondeu como neutro",
                            isCorrect: false,
                        },
                        {
                            text: "A escala de zero a dez varia entre países diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "O NPS não pode ser acompanhado ao longo dos meses",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Montando o funil do Financem",
            blocks: [
                {
                    type: "text",
                    value: "# O funil completo de um mês\n\nO Financem é um app fictício brasileiro de finanças pessoais: conecta contas bancárias, categoriza gastos e manda um resumo semanal. Ele serve de laboratório aqui e volta no último módulo. Este é o funil do primeiro mês depois da campanha de lançamento, com todos os números fechando.\n\nDe 40.000 instalações, 24.000 concluíram o cadastro, ou 60%. Dessas, 9.600 conectaram uma conta e viram o resumo, ou 40% dos cadastros e 24% das instalações. Depois de 30 dias, 2.880 continuavam usando, 30% dos ativados e 7,2% das instalações. E 480 assinaram o plano pago, 16,7% dos retidos e 1,2% de quem instalou.\n\nOlhar a coluna da direita muda a conversa. Cada 100 pessoas que instalam produzem pouco mais de uma assinatura. Isso não é necessariamente ruim, é o que é, e agora dá pra perguntar coisas úteis: qual etapa perde mais gente em termos absolutos, qual perde mais em termos relativos, e qual delas o time consegue mexer em quatro semanas. As três respostas raramente apontam pro mesmo lugar, e é aí que o trabalho de priorização começa.",
                },
                {
                    type: "table",
                    value: '[["Etapa","Usuários","Conversão da etapa","Desde a instalação"],["Instalou o app","40.000","100%","100%"],["Concluiu o cadastro","24.000","60,0%","60,0%"],["Conectou conta e viu o resumo","9.600","40,0%","24,0%"],["Continuava usando em 30 dias","2.880","30,0%","7,2%"],["Assinou o plano pago","480","16,7%","1,2%"]]',
                },
                {
                    type: "code",
                    value: "-- Funil por coorte de instalacao, com janela de 30 dias\nWITH base AS (\n  SELECT usuario_id, MIN(data) AS instalou_em\n  FROM eventos WHERE nome = 'app_instalado' GROUP BY usuario_id\n)\nSELECT\n  COUNT(*)                                             AS instalou,     -- 40000\n  COUNT(*) FILTER (WHERE fez('cadastro_concluido'))    AS cadastrou,    -- 24000\n  COUNT(*) FILTER (WHERE fez('conta_conectada'))       AS ativou,       --  9600\n  COUNT(*) FILTER (WHERE voltou_apos(30))              AS reteve,       --  2880\n  COUNT(*) FILTER (WHERE fez('assinatura_concluida'))  AS assinou       --   480\nFROM base;\n\n-- 24000/40000 = 60,0%   9600/24000 = 40,0%\n--  2880/9600 = 30,0%     480/2880  = 16,7%\n-- fim a fim: 480/40000 = 1,2%",
                },
                {
                    type: "quote",
                    value: "Funil bem montado não termina numa conclusão, termina numa pergunta melhor. O número diz onde doeu; a investigação diz por quê.",
                },
                {
                    type: "text",
                    value: "## Onde dez pontos rendem mais\n\nUma forma limpa de priorizar é simular a mesma melhoria em cada etapa e ver quantos assinantes ela produz no fim. Dez pontos percentuais em qualquer lugar, mantendo o resto igual.\n\nCadastro de 60% para 70%: entram 28.000 cadastros, 11.200 ativados, 3.360 retidos e 560 assinantes, ou 80 a mais. Ativação de 40% para 50%: 12.000 ativados, 3.600 retidos, 600 assinantes, ou 120 a mais. Retenção de 30% para 40%: 3.840 retidos e 640 assinantes, ou 160 a mais. A retenção rende o dobro do cadastro, e é o que se esperava depois da primeira aula.\n\nFalta comparar com a alternativa comprada. Para chegar aos mesmos 160 assinantes extras pela aquisição, seriam necessárias mais de 13.000 instalações, porque cada 100 instalações produzem 1,2 assinatura. A R$ 12,00 por instalação, passa de R$ 156.000 no mês, todo mês. Repare que a simulação não prova que dez pontos de retenção são alcançáveis: ela só ordena onde vale gastar a próxima semana de investigação. Essa diferença entre priorizar e prometer é o que mantém a credibilidade do analista intacta.",
                },
            ],
            questions: [
                {
                    statement:
                        "No funil do Financem, qual foi a conversão de instalação até assinatura paga?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "1,2%, porque 480 assinaram entre 40.000 instalações",
                            isCorrect: true,
                        },
                        {
                            text: "7,2%, porque 2.880 ficaram entre 40.000 instalações",
                            isCorrect: false,
                        },
                        {
                            text: "16,7%, porque 480 assinaram entre 2.880 retidos",
                            isCorrect: false,
                        },
                        {
                            text: "5,0%, porque 480 assinaram entre 9.600 ativados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual etapa do funil do Financem perdeu mais usuários em números absolutos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Do cadastro para a ativação, com 14.400 perdidos",
                            isCorrect: true,
                        },
                        {
                            text: "Da instalação para o cadastro, com 16.000 perdidos",
                            isCorrect: false,
                        },
                        {
                            text: "Da ativação para os 30 dias, com 6.720 perdidos",
                            isCorrect: false,
                        },
                        {
                            text: "Dos 30 dias para a assinatura, com 2.400 perdidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Se a ativação subir de 40% para 50% sobre os mesmos 24.000 cadastros, quantos ativados e retidos aparecem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "12.000 ativados e 3.600 retidos em trinta dias",
                            isCorrect: true,
                        },
                        {
                            text: "10.000 ativados e 3.000 retidos em trinta dias",
                            isCorrect: false,
                        },
                        {
                            text: "12.000 ativados e 4.800 retidos em trinta dias",
                            isCorrect: false,
                        },
                        {
                            text: "13.200 ativados e 3.960 retidos em trinta dias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dez pontos a mais no cadastro geram 80 assinantes e dez pontos na retenção geram 160. O que isso ordena?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Investigar retenção primeiro, com o dobro de retorno",
                            isCorrect: true,
                        },
                        {
                            text: "Investigar cadastro primeiro, por ser etapa anterior",
                            isCorrect: false,
                        },
                        {
                            text: "Investigar os dois juntos, já que somam 240 assinantes",
                            isCorrect: false,
                        },
                        {
                            text: "Investigar aquisição, que alimenta as duas etapas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A simulação mostra que retenção rende mais. Qual afirmação sobre esse resultado é a honesta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela ordena a investigação, não garante o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Ela prova que dez pontos de retenção são alcançáveis",
                            isCorrect: false,
                        },
                        {
                            text: "Ela substitui o experimento previsto para a mudança",
                            isCorrect: false,
                        },
                        {
                            text: "Ela vale só enquanto o mix de canais ficar estável",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Retenção e coorte",
    aulas: [
        {
            titulo: "Retenção como fundação",
            blocks: [
                {
                    type: "text",
                    value: "# O balde furado, com números\n\nRetenção é a fração de um grupo que continua usando o produto depois de um período. Simples de definir e brutal de encarar: é a única métrica que responde se o produto resolve mesmo alguma coisa. Aquisição diz que as pessoas chegaram, ativação diz que elas entenderam, retenção diz que elas voltaram porque valeu a pena.\n\nUma coorte de 1.000 usuários ativados costuma se comportar assim: 420 voltam no dia seguinte, 260 estão lá no sétimo dia, 180 no trigésimo, 165 no sexagésimo e 160 no nonagésimo. A curva despenca no começo, desacelera e depois quase para de cair. Esses últimos 16% são o platô, e o platô é a notícia mais importante do gráfico: ele diz quantas pessoas, de cada cem que provaram o produto, ficaram de vez.\n\nA diferença entre uma curva que estabiliza em 16% e outra que estabiliza em 2% não é de grau, é de natureza. Com platô, cada mês de aquisição deixa um sedimento que se acumula e o produto cresce mesmo sem aumentar a mídia. Sem platô, você aluga usuários: para de investir e a base evapora em poucas semanas. Antes de discutir canal, criativo ou preço, o time precisa olhar essa curva e responder com honestidade se ela tem chão.",
                },
                {
                    type: "table",
                    value: '[["Formato da curva","O que costuma indicar","Ação típica"],["Cai e chega perto de zero","O produto não resolve nada recorrente","Rever a proposta antes de gastar em mídia"],["Cai forte e estabiliza baixo","Existe um nicho pequeno que ama o produto","Descobrir quem é esse nicho e mirar nele"],["Cai e estabiliza alto","Encaixe saudável entre produto e mercado","Escalar aquisição com mais confiança"],["Cai e volta a subir","Uso sazonal ou ciclo mais longo que a janela","Rever a janela usada para medir"],["Sobe desde o primeiro dia","Quase sempre erro de coorte ou de evento","Conferir a definição de ativo e a base"]]',
                },
                {
                    type: "quote",
                    value: "Curva de retenção sem platô é um produto que aluga usuários. No dia em que a verba de mídia acabar, a base acaba junto, e ninguém vai entender por quê.",
                },
                {
                    type: "text",
                    value: "## Três regiões, três remédios\n\nA curva tem trechos com causas diferentes, e tratar tudo como um problema só desperdiça trabalho. Do dia zero ao dia 1, a queda costuma vir de expectativa quebrada: o anúncio prometeu uma coisa, a primeira tela entregou outra. O remédio mora no alinhamento entre a promessa e o primeiro minuto, não no produto inteiro.\n\nDo dia 1 ao dia 7, a queda costuma vir de configuração incompleta. A pessoa quis usar, esbarrou numa conexão que falhou, num formulário longo ou numa permissão que assustou. Aqui o remédio é reduzir atrito no caminho até o primeiro valor, que é exatamente o trabalho de ativação do módulo anterior.\n\nDo dia 7 em diante, a queda é sobre hábito. Ninguém abandona por atrito na quarta semana: abandona porque não apareceu um motivo recorrente de voltar. O remédio é encontrar o gatilho natural do produto, que pode ser o resumo semanal, a cobrança que vence ou a mudança que interessa. Um cuidado final: retenção não é um número universal. Comparar um app de banco, que quer uso diário, com uma plataforma de declaração de imposto, que quer uso anual, é comparar coisas diferentes com a mesma régua e concluir bobagem.",
                },
            ],
            questions: [
                {
                    statement: "O que a curva de retenção mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A fração da coorte que segue usando após um período",
                            isCorrect: true,
                        },
                        {
                            text: "O total de usuários novos que chegaram naquele mês",
                            isCorrect: false,
                        },
                        {
                            text: "A soma de todos os cadastros desde o lançamento do app",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo médio que a pessoa passa dentro de cada tela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o platô é a parte mais importante da curva de retenção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele mostra quantos usuários ficaram de vez no produto",
                            isCorrect: true,
                        },
                        {
                            text: "Ele indica o dia exato em que a campanha começou",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é o único trecho que as ferramentas calculam bem",
                            isCorrect: false,
                        },
                        {
                            text: "Ele determina o custo por instalação no mês seguinte ao teste",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "De 1.000 ativados, 420 voltam em D1, 260 em D7 e 180 em D30. Qual é a retenção de 30 dias?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "18%, porque 180 de 1.000 seguem ativos no dia 30",
                            isCorrect: true,
                        },
                        {
                            text: "26%, porque 260 de 1.000 seguem ativos no dia 30",
                            isCorrect: false,
                        },
                        {
                            text: "69%, porque 180 sobre 260 é o que sobra de D7",
                            isCorrect: false,
                        },
                        {
                            text: "42%, porque a curva começa com 420 no primeiro dia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A curva cai forte entre o dia 1 e o dia 7. Qual causa é mais provável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Atrito na configuração antes do primeiro valor",
                            isCorrect: true,
                        },
                        {
                            text: "Falta de gatilho recorrente para voltar ao app",
                            isCorrect: false,
                        },
                        {
                            text: "Promessa do anúncio diferente da primeira tela",
                            isCorrect: false,
                        },
                        {
                            text: "Preço alto demais para o público que instalou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um app de banco tem retenção D30 de 40% e uma plataforma de imposto tem 6%. Por que a comparação direta não vale?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O ritmo natural de uso dos dois produtos é diferente",
                            isCorrect: true,
                        },
                        {
                            text: "Produtos financeiros usam ferramentas de coleta distintas",
                            isCorrect: false,
                        },
                        {
                            text: "A retenção de 30 dias só vale para aplicativos móveis",
                            isCorrect: false,
                        },
                        {
                            text: "A plataforma de imposto tem menos usuários cadastrados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Análise de coorte",
            blocks: [
                {
                    type: "text",
                    value: "# A tabela triangular, linha por linha\n\nCoorte é um grupo de usuários que entrou no mesmo período. Coorte de janeiro são todos os que ativaram em janeiro, e o que interessa é acompanhar esse grupo específico ao longo do tempo, sem misturar com quem chegou depois. A tabela sai triangular por um motivo óbvio: a coorte de abril ainda não viveu quatro meses.\n\nA leitura tem duas direções e você precisa das duas. Ler uma LINHA mostra como aquele grupo envelheceu: a coorte de janeiro tinha 9.600 pessoas, ficou com 2.880 no primeiro mês, 2.304 no segundo, 2.016 no terceiro e 1.920 no quarto. Em porcentagem: 30%, 24%, 21% e 20%. Ela está estabilizando perto de um quinto do tamanho original, que é o platô da aula anterior aparecendo em escala mensal.\n\nLer uma COLUNA mostra se o produto está melhorando para quem chega agora. Na coluna do primeiro mês, as coortes de janeiro a abril marcam 30%, 33%, 35% e 38%. Cada grupo novo retém mais que o anterior, o que é o sinal mais limpo de que as mudanças recentes funcionaram. Esse tipo de conclusão é impossível de enxergar num gráfico agregado de usuários ativos, porque lá o crescimento da base esconde tudo.",
                },
                {
                    type: "table",
                    value: '[["Coorte","Ativados","Mês 1","Mês 2","Mês 3","Mês 4"],["Janeiro","9.600","2.880","2.304","2.016","1.920"],["Fevereiro","10.000","3.300","2.700","2.400","sem dado"],["Março","11.000","3.850","3.190","sem dado","sem dado"],["Abril","12.500","4.750","sem dado","sem dado","sem dado"]]',
                },
                {
                    type: "code",
                    value: "// A mesma tabela em porcentagem da coorte de origem\nCoorte      Tamanho    Mes 1    Mes 2    Mes 3    Mes 4\nJaneiro      9.600     30,0%    24,0%    21,0%    20,0%\nFevereiro   10.000     33,0%    27,0%    24,0%      .\nMarco       11.000     35,0%    29,0%      .        .\nAbril       12.500     38,0%      .        .        .\n\n// Linha (janeiro): 30 -> 24 -> 21 -> 20, estabiliza perto de 20%\n// Coluna (mes 1):  30 -> 33 -> 35 -> 38, cada coorte nova retem mais\n// Confira: 2.880/9.600 = 30,0%   4.750/12.500 = 38,0%",
                },
                {
                    type: "quote",
                    value: "O gráfico de usuários ativos mostra o resultado da soma. A tabela de coorte mostra de quem é o mérito. Só a segunda permite decidir o que fazer na semana que vem.",
                },
                {
                    type: "text",
                    value: "## Quatro jeitos de ler errado\n\nO primeiro é comparar coortes de meses muito diferentes sem lembrar da sazonalidade. Uma coorte de dezembro num app de finanças chega com o comportamento de dezembro, e vai parecer pior ou melhor que a de março por motivos que não têm nada a ver com o produto.\n\nO segundo é confiar em coorte pequena. Com 12.500 usuários, uma variação de 1 ponto percentual significa alguma coisa. Com 80 usuários, 5 pontos de diferença cabem dentro do acaso, e mesmo assim aparecem coloridos na tabela como se fossem descoberta.\n\nO terceiro é ignorar o mix de canais. Se em março entrou uma campanha grande de tráfego barato e ruim, a coorte de março piora inteira, e alguém vai concluir que o produto regrediu. A coorte só é comparável quando a composição é parecida, então vale quebrar a tabela por canal quando o mix muda.\n\nO quarto é achar que coorte é sempre por data. Coorte por comportamento costuma revelar mais: quem conectou duas contas na primeira semana contra quem conectou uma, quem entrou por indicação contra quem entrou por anúncio. A data é só o recorte mais fácil de montar, não o mais informativo.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma coorte numa análise de retenção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um grupo de usuários que entrou no mesmo período",
                            isCorrect: true,
                        },
                        {
                            text: "Um grupo sorteado ao acaso para participar de um teste A/B",
                            isCorrect: false,
                        },
                        {
                            text: "O conjunto de usuários que pagam o plano anual",
                            isCorrect: false,
                        },
                        {
                            text: "A lista dos usuários mais ativos de cada semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Ler uma linha da tabela de coorte responde a qual pergunta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como aquele grupo específico envelheceu no tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Se as coortes novas retêm mais que as anteriores",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos usuários novos chegaram naquele mesmo mês",
                            isCorrect: false,
                        },
                        {
                            text: "Qual canal trouxe mais gente para dentro do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A coorte de fevereiro tinha 10.000 ativados e 2.700 seguiam no segundo mês. Qual é a retenção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "27,0%, porque 2.700 sobre 10.000 dá 0,27",
                            isCorrect: true,
                        },
                        {
                            text: "24,0%, que é o valor da coorte de janeiro",
                            isCorrect: false,
                        },
                        {
                            text: "81,8%, porque 2.700 sobre 3.300 dá 0,818",
                            isCorrect: false,
                        },
                        {
                            text: "10,0%, porque a coorte tinha 10.000 pessoas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na coluna do primeiro mês, as coortes marcam 30%, 33%, 35% e 38%. O que isso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O produto está melhorando para quem chega agora",
                            isCorrect: true,
                        },
                        {
                            text: "A coorte de janeiro foi a de melhor desempenho",
                            isCorrect: false,
                        },
                        {
                            text: "A base total de usuários ativos cresceu 8 pontos",
                            isCorrect: false,
                        },
                        {
                            text: "O churn dos assinantes caiu ao longo do trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em março entrou uma campanha grande de tráfego barato e a coorte de março piorou. Qual é a leitura correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O mix mudou, então as coortes não são comparáveis",
                            isCorrect: true,
                        },
                        {
                            text: "O produto regrediu e a mudança precisa ser revertida",
                            isCorrect: false,
                        },
                        {
                            text: "A coorte de março ficou pequena demais para ser lida",
                            isCorrect: false,
                        },
                        {
                            text: "A sazonalidade de março explica sozinha a diferença",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Definindo a retenção certa",
            blocks: [
                {
                    type: "text",
                    value: "# Evento âncora, janela e base\n\nDizer 'nossa retenção é 30%' não significa nada sozinho. Toda definição de retenção esconde três escolhas, e mudar qualquer uma delas muda o número. A primeira é o evento âncora: o que conta como estar retido? Abrir o app é fraco demais, porque uma notificação em massa infla a métrica. Concluir a ação de valor é mais honesto e sempre dá um número menor.\n\nA segunda é a janela. D1, D7 e D30 fazem sentido em produto de uso diário. Num app de finanças pessoais, cujo ritmo natural é semanal, semana 1, semana 4 e semana 12 descrevem melhor a realidade. Numa plataforma de declaração de imposto, a janela é o ano seguinte, e medir D7 seria cômico.\n\nA terceira é a base. Retenção sobre quem instalou, sobre quem ativou ou sobre quem pagou são três métricas diferentes com o mesmo nome. A recomendação prática é medir sobre os ativados, porque só quem chegou ao valor tem a chance real de voltar, e deixar isso escrito no nome da métrica. Além disso, existe a escolha entre retenção de dia exato, que exige uso naquele dia específico, e retenção por intervalo, que aceita uso em qualquer momento da janela. A segunda é mais generosa e mais estável em produtos de ritmo irregular.",
                },
                {
                    type: "table",
                    value: '[["Tipo de produto","Ritmo natural","Janela adequada","Evento âncora"],["Banco digital","Diário","D1, D7 e D30","Transação concluída"],["Delivery de comida","Semanal","Semana 1, 4 e 12","Pedido entregue"],["Finanças pessoais","Semanal","Semana 1, 4 e 12","Resumo conferido"],["Declaração de imposto","Anual","Temporada seguinte","Declaração enviada"],["Ferramenta de trabalho","Dias úteis","D7 e D30 úteis","Documento editado"]]',
                },
                {
                    type: "quote",
                    value: "Retenção sem definição escrita é convite para discussão eterna. Escreva o evento, a janela e a base no nome da métrica, mesmo que fique feio de ler.",
                },
                {
                    type: "text",
                    value: "## Retenção de uso e retenção de receita\n\nExistem duas retenções que podem contar histórias opostas no mesmo produto. A de uso conta quem continua usando. A de receita conta quem continua pagando. Num plano anual, uma pessoa pode ter parado de usar em março e só aparecer como perda em dezembro, quando decidir não renovar.\n\nO caso é comum: de 1.000 assinantes anuais, 92% renovaram, o que soa excelente. Mas apenas 40% usaram o produto nos últimos 30 dias antes da renovação. Os 52 pontos de diferença são uma fila de cancelamentos esperando a data chegar. Um time que olhasse só a renovação comemoraria por onze meses e levaria o susto no décimo segundo.\n\nA retenção de receita também sabe passar de 100%, o que confunde quem vê pela primeira vez. Se a base começou o ano com R$ 100.000 por mês, perdeu R$ 12.000 em cancelamentos e ganhou R$ 18.000 em mudanças para planos maiores dos clientes que ficaram, a retenção líquida de receita é de 106%. Isso não é contradição: significa que os clientes que permanecem compram mais do que os que saem levavam embora. As duas métricas convivem, e apresentar uma sem a outra é meio caminho para enganar a si mesmo.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quais são as três escolhas escondidas em toda definição de retenção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O evento âncora, a janela de tempo e a base contada",
                            isCorrect: true,
                        },
                        {
                            text: "O canal de aquisição, o preço e a região do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "A ferramenta, o tipo de gráfico e a cor da série",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho da amostra, o p-valor e o teste aplicado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que 'abriu o app' é um evento âncora fraco para retenção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma notificação em massa já infla a métrica sozinha",
                            isCorrect: true,
                        },
                        {
                            text: "A abertura do app não é registrada pelas ferramentas",
                            isCorrect: false,
                        },
                        {
                            text: "Abertura só pode ser medida em produtos de assinatura",
                            isCorrect: false,
                        },
                        {
                            text: "O evento de abertura chega com um dia de atraso ao banco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual janela faz mais sentido para uma plataforma de declaração de imposto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A temporada seguinte, porque o ritmo é anual",
                            isCorrect: true,
                        },
                        {
                            text: "D1, D7 e D30, como em qualquer produto móvel",
                            isCorrect: false,
                        },
                        {
                            text: "Semana 1 e semana 4, como no app de delivery",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma, porque o produto não tem retenção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "De 1.000 assinantes anuais, 92% renovaram, mas só 40% usaram nos últimos 30 dias. O que a diferença sugere?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma fila de cancelamentos esperando a data chegar",
                            isCorrect: true,
                        },
                        {
                            text: "Um erro na coleta do evento de uso dentro do aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Um resultado saudável, já que a renovação é alta",
                            isCorrect: false,
                        },
                        {
                            text: "Uma base que migrou para o plano mensal barato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A base tinha R$ 100.000 por mês, perdeu R$ 12.000 em cancelamentos e ganhou R$ 18.000 em upgrades. Qual é a retenção líquida de receita?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "106%, porque quem fica compra mais do que quem sai",
                            isCorrect: true,
                        },
                        {
                            text: "88%, porque só os cancelamentos entram nessa conta",
                            isCorrect: false,
                        },
                        {
                            text: "118%, porque só os upgrades entram nessa conta",
                            isCorrect: false,
                        },
                        {
                            text: "94%, porque a média das duas variações é essa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Churn e o valor de reter",
            blocks: [
                {
                    type: "text",
                    value: "# A conta do que vaza\n\nChurn é a fração da base que sai num período. Com 12.000 assinantes e 600 cancelamentos no mês, o churn mensal é de 5%. O número parece pequeno até você multiplicar: cinco por cento ao mês significa perder mais da metade da base em um ano, se ninguém entrar no lugar.\n\nA primeira separação útil é entre churn voluntário e involuntário. Voluntário é quem decidiu sair: não viu valor, achou caro, resolveu o problema de outro jeito. Involuntário é quem saiu sem querer, quase sempre por falha de pagamento, cartão vencido ou limite estourado. No exemplo, dos 600 que saíram, 420 foram voluntários e 180 involuntários.\n\nEssa distinção rende dinheiro rápido, porque o churn involuntário tem remédio técnico. Uma rotina de nova tentativa de cobrança em dias diferentes, mais um aviso no app antes do vencimento, costuma recuperar boa parte. Recuperando 60% dos 180, são 108 assinantes salvos por mês. O churn cai de 5% para 4,1% e a receita recorrente preservada é de R$ 2.149,20 por mês, com trabalho de engenharia e nenhuma mudança de produto. É o tipo de melhoria que times de produto deixam parada por anos porque parece assunto de outra área.",
                },
                {
                    type: "table",
                    value: '[["Tipo de churn","Causa típica","Remédio","Efeito no exemplo"],["Voluntário por valor","Não viu utilidade recorrente","Ativação e hábito","Trabalho de produto"],["Voluntário por preço","Achou caro para o uso que faz","Plano menor ou anual","Trabalho de oferta"],["Involuntário","Cartão recusado ou vencido","Nova tentativa e aviso","108 assinantes salvos"],["Sazonal","Uso concentrado em parte do ano","Pausa em vez de cancelar","Melhora a leitura"],["Falha de produto","Sincronização quebrada","Correção e alerta ativo","Evita perda futura"]]',
                },
                {
                    type: "quote",
                    value: "Churn involuntário é receita que o produto já conquistou e o sistema de cobrança devolveu. É a melhoria mais barata que existe e a mais fácil de esquecer.",
                },
                {
                    type: "text",
                    value: "## Quanto vale um ponto percentual\n\nA conta que traduz retenção em dinheiro é simples. Se o churn mensal é constante, a vida média do assinante é 1 dividido pelo churn. Com 5%, são 20 meses. Com 4%, são 25 meses. Multiplicando pelo ticket de R$ 19,90, o valor de vida sai de R$ 398,00 para R$ 497,50: um ganho de R$ 99,50 por assinante, ou 25%, por um único ponto percentual.\n\nEspalhando pela base de 12.000 assinantes, o valor total sai de R$ 4.776.000 para R$ 5.970.000. A diferença de R$ 1.194.000 é o que está em jogo numa reunião em que alguém propõe corrigir a cobrança recusada ou melhorar o resumo semanal. Quando você leva a conta pronta, a discussão de prioridade muda de tom.\n\nDuas honestidades obrigatórias. A fórmula supõe churn constante, e churn não é constante: quem tem seis meses de casa cancela menos que quem tem um mês, então o número tende a subestimar. E o valor de vida não é caixa no banco, é projeção; usar como se fosse dinheiro disponível já quebrou muita empresa. Trate o resultado como ordem de grandeza para priorizar, nunca como previsão de receita para prometer ao conselho.",
                },
            ],
            questions: [
                {
                    statement:
                        "Com 12.000 assinantes e 600 cancelamentos no mês, qual é o churn mensal?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "5%, porque 600 dividido por 12.000 dá 0,05",
                            isCorrect: true,
                        },
                        {
                            text: "20%, porque 12.000 dividido por 600 dá 20",
                            isCorrect: false,
                        },
                        {
                            text: "6%, porque cada mês perde 600 dos assinantes",
                            isCorrect: false,
                        },
                        {
                            text: "0,5%, porque 600 é meio milésimo da base toda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é churn involuntário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem sai por falha de pagamento, sem ter decidido",
                            isCorrect: true,
                        },
                        {
                            text: "Quem cancela porque achou o preço alto demais",
                            isCorrect: false,
                        },
                        {
                            text: "Quem para de usar mas continua pagando o plano",
                            isCorrect: false,
                        },
                        {
                            text: "Quem sai no fim do plano anual sem renovar a assinatura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dos 600 que saíram, 180 foram involuntários e a cobrança recupera 60% deles. Qual é o novo churn?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "4,1%, porque sobram 492 saídas entre 12.000",
                            isCorrect: true,
                        },
                        {
                            text: "3,5%, porque sobram 420 saídas entre 12.000",
                            isCorrect: false,
                        },
                        {
                            text: "4,5%, porque a metade dos 180 é recuperada",
                            isCorrect: false,
                        },
                        {
                            text: "2,0%, porque os involuntários somem da conta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com ticket de R$ 19,90, o churn cai de 5% para 4%. Como muda o valor de vida do assinante?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sobe de R$ 398,00 para R$ 497,50, um ganho de 25%",
                            isCorrect: true,
                        },
                        {
                            text: "Sobe de R$ 398,00 para R$ 418,00, um ganho de 5%",
                            isCorrect: false,
                        },
                        {
                            text: "Sobe de R$ 398,00 para R$ 796,00, o dobro do valor",
                            isCorrect: false,
                        },
                        {
                            text: "Não muda, porque o ticket continuou o mesmo valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a ressalva mais importante ao usar a fórmula de vida média igual a 1 dividido pelo churn?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela supõe churn constante, o que não acontece",
                            isCorrect: true,
                        },
                        {
                            text: "Ela só funciona em produtos com plano anual",
                            isCorrect: false,
                        },
                        {
                            text: "Ela exige uma base maior que 10.000 clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Ela ignora o preço praticado pela concorrência",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ressurreição e engajamento profundo",
            blocks: [
                {
                    type: "text",
                    value: "# Quem volta depois de sumir\n\nRessurreição é o usuário que ficou parado por um bom tempo e voltou a usar o produto. Vale medir separado porque ele não é novo nem retido, e misturá-lo com qualquer um dos dois estraga as duas leituras. Um jeito prático de organizar isso é dar estados ao usuário: novo, ativo, em risco, dormente e ressuscitado, com regras claras de quando alguém muda de estado.\n\nO exercício fica interessante quando você mede o retorno real de uma campanha de reativação. O app tinha 8.000 usuários dormentes, sem uso há mais de 30 dias. A campanha por e-mail e notificação trouxe 640 de volta ao app, uma taxa de resposta de 8% que qualquer time comemoraria no dia seguinte. Trinta dias depois, apenas 96 ainda estavam ativos, ou 15% dos que voltaram.\n\nOu seja, a ressurreição verdadeira foi de 96 pessoas, 1,2% dos dormentes. Isso não torna a campanha inútil, mas muda completamente a conta de retorno: o custo por ressuscitado é o custo total dividido por 96, não por 640. E abre a comparação honesta: com o mesmo esforço aplicado a quem está ativo hoje, quantos usuários a mais o time teria segurado? Na maioria dos produtos, prevenir a dormência rende mais que revertê-la.",
                },
                {
                    type: "table",
                    value: '[["Estado","Definição operacional","Usuários no mês","Destino provável"],["Novo","Ativou nos últimos 30 dias","9.600","Ativo ou dormente"],["Ativo","Usou nos últimos 7 dias","14.200","Ativo ou em risco"],["Em risco","Sem uso entre 8 e 29 dias","5.400","Ativo ou dormente"],["Dormente","Sem uso há 30 dias ou mais","8.000","Dormente ou ressuscitado"],["Ressuscitado","Voltou após 30 dias parado","96","Ativo ou dormente"]]',
                },
                {
                    type: "quote",
                    value: "Campanha de reativação sem janela de acompanhamento mede aberturas, não usuários. Trazer de volta por um dia é fácil; o difícil é a segunda semana.",
                },
                {
                    type: "text",
                    value: "## O que a razão de diários sobre mensais esconde\n\nDividir usuários ativos diários por mensais dá um número famoso: 48.000 sobre 240.000 são 20%, o que equivale a cerca de 6 dias de uso por mês para o usuário médio. É um proxy de hábito rápido de calcular e cheio de limites, e conhecer os limites é o que separa quem usa a métrica de quem é usado por ela.\n\nO primeiro limite é a média. Os mesmos 20% podem descrever uma base em que todo mundo usa 6 dias, ou uma base em que 15% usam todo dia e o resto usa uma vez. São produtos completamente diferentes com o mesmo indicador. A distribuição de dias ativos resolve: dos 240.000, cerca de 132.000 usam de 1 a 3 dias, 60.000 usam de 4 a 10, 33.600 de 11 a 20 e 14.400 de 21 a 28 dias. Agora dá pra ver quem é quem.\n\nO segundo limite é o ritmo. Produto de uso semanal não deveria ser avaliado por uma razão diária; semanais sobre mensais descreve melhor. O terceiro é a manipulabilidade: a razão sobe quando o app dispara mais notificação, sem que ninguém tenha recebido mais valor. Por isso ela funciona bem como indicador de acompanhamento e mal como meta de time.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um usuário ressuscitado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Voltou a usar depois de um longo período parado",
                            isCorrect: true,
                        },
                        {
                            text: "Assinou o plano pago depois de testar de graça",
                            isCorrect: false,
                        },
                        {
                            text: "Usou o produto todos os dias do último mês fechado",
                            isCorrect: false,
                        },
                        {
                            text: "Recuperou a senha e entrou de novo na mesma semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 48.000 usuários diários e 240.000 mensais, quantos dias por mês o usuário médio usa o app?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cerca de 6 dias, porque a razão é de 20%",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 20 dias, um por ponto percentual",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 5 dias, um por semana do mês",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 12 dias, metade do mês corrido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A campanha atingiu 8.000 dormentes, trouxe 640 de volta e 96 seguiam ativos 30 dias depois. Qual é a ressurreição real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "1,2% dos dormentes, porque só 96 permaneceram",
                            isCorrect: true,
                        },
                        {
                            text: "8,0% dos dormentes, porque 640 voltaram ao app",
                            isCorrect: false,
                        },
                        {
                            text: "15% dos dormentes, que é a taxa dos que ficaram",
                            isCorrect: false,
                        },
                        {
                            text: "0,8% dos dormentes, contando metade dos que voltaram",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dos 240.000 mensais, 132.000 usam de 1 a 3 dias. O que isso acrescenta à razão de 20%?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra que a maioria usa pouco e a média engana",
                            isCorrect: true,
                        },
                        {
                            text: "Confirma que todos os usuários usam 6 dias por mês",
                            isCorrect: false,
                        },
                        {
                            text: "Indica que a coleta de eventos diários falhou no mês",
                            isCorrect: false,
                        },
                        {
                            text: "Prova que o produto tem hábito consolidado na base",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a razão de diários sobre mensais funciona mal como meta de time?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela sobe com mais notificação, sem mais valor entregue",
                            isCorrect: true,
                        },
                        {
                            text: "Ela depende do número de dias úteis de cada mês do ano",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só pode ser calculada em produtos de assinatura paga",
                            isCorrect: false,
                        },
                        {
                            text: "Ela exige uma base mínima de um milhão de usuários ativos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Instrumentação",
    aulas: [
        {
            titulo: "Eventos e propriedades",
            blocks: [
                {
                    type: "text",
                    value: "# O vocabulário do produto\n\nTodo dado de produto nasce de um evento: algo que aconteceu, num instante, com alguém. O evento tem um nome no passado, porque descreve fato consumado, e carrega propriedades, que são os detalhes daquele acontecimento específico. 'Conta conectada' é o evento; o banco escolhido, o método usado e o número de tentativas são propriedades.\n\nVale separar três famílias de informação que costumam se misturar. Propriedade de evento descreve aquele acontecimento e não muda depois: qual banco, quantas tentativas, quantos segundos. Propriedade de usuário descreve a pessoa no momento em que o evento chegou: plano atual, data de ativação, canal de origem. Contexto técnico descreve o ambiente e vem preenchido automaticamente: plataforma, versão do app, região.\n\nEssa distinção decide o que você vai conseguir perguntar depois. Se o banco for propriedade de usuário em vez de propriedade do evento, você perde a capacidade de comparar conexões diferentes da mesma pessoa. Se a versão do app não viajar junto, fica impossível descobrir que a queda de ontem começou numa build específica. Instrumentação não é sobre coletar tudo; é sobre garantir que as perguntas previsíveis tenham resposta e que as imprevisíveis tenham chance.",
                },
                {
                    type: "code",
                    value: '{\n  "evento": "conta_conectada",\n  "usuario_id": "u_38271",\n  "timestamp": "2026-03-14T09:12:44-03:00",\n  "propriedades": {\n    "banco": "banco_c",\n    "metodo": "open_finance",\n    "tentativas": 2,\n    "duracao_segundos": 38,\n    "origem_tela": "onboarding"\n  },\n  "usuario": {\n    "plano": "gratuito",\n    "ativado_em": "2026-03-14",\n    "canal_origem": "indicacao"\n  },\n  "contexto": {\n    "plataforma": "android",\n    "versao_app": "4.12.0",\n    "regiao": "SP"\n  }\n}',
                },
                {
                    type: "table",
                    value: '[["Conceito","Exemplo","Quando muda de valor"],["Evento","conta_conectada","A cada vez que a ação acontece"],["Propriedade de evento","banco, metodo, tentativas","Fica congelada no envio"],["Propriedade de usuário","plano, data de ativação","Quando o cadastro muda"],["Contexto técnico","plataforma, versão do app","A cada envio, automático"],["Identificador","usuario_id, dispositivo_id","Ao logar ou trocar de aparelho"]]',
                },
                {
                    type: "quote",
                    value: "Antes de instrumentar um evento novo, escreva a pergunta que ele responde. Se a pergunta não sai do teclado, o evento vai virar linha morta no banco.",
                },
                {
                    type: "text",
                    value: "## Instrumentar o caminho, não o mundo\n\nA tentação de quem começa é coletar tudo: todo clique, toda tela, todo rolar de página. Times que fazem isso terminam com 1.400 eventos, ninguém achando nada e uma fatura mensal que ninguém sabe explicar. A instrumentação boa é escassa de propósito.\n\nO critério de prioridade é o caminho da north star, ponta a ponta. No app de finanças isso significa instalação, cadastro concluído, conexão de conta iniciada, conexão concluída, conexão falhou, resumo visualizado, gasto categorizado, retorno na semana seguinte, tela de planos vista, assinatura iniciada e assinatura concluída. Entre quinze e vinte e cinco eventos bem escolhidos respondem a maior parte das perguntas de um produto inteiro.\n\nUma técnica que economiza muito: prefira propriedade a evento novo. Em vez de criar 'botao_azul_clicado' e 'botao_verde_clicado', crie 'botao_clicado' com a propriedade cor. Assim o painel continua funcionando quando surgir o terceiro botão. O exagero oposto também existe: um evento genérico chamado 'interacao' com quinze propriedades vira caixa preta que ninguém consulta. O equilíbrio é ter eventos com significado de negócio e propriedades com significado de contexto.",
                },
            ],
            questions: [
                {
                    statement: "O que é um evento na instrumentação de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um fato que aconteceu, com nome no passado",
                            isCorrect: true,
                        },
                        {
                            text: "Um relatório mensal gerado pela ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Uma tabela do banco de dados da aplicação",
                            isCorrect: false,
                        },
                        {
                            text: "Um alerta enviado quando a métrica cai muito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quantos eventos costumam bastar para responder à maior parte das perguntas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Entre quinze e vinte e cinco eventos bem escolhidos",
                            isCorrect: true,
                        },
                        {
                            text: "Mais de mil eventos, cobrindo todos os cliques da tela",
                            isCorrect: false,
                        },
                        {
                            text: "Exatamente cinco eventos, um para cada etapa do funil",
                            isCorrect: false,
                        },
                        {
                            text: "Um evento por tela existente dentro do aplicativo móvel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O banco escolhido na conexão foi registrado como propriedade de usuário. Qual análise fica impossível?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Comparar conexões diferentes da mesma pessoa",
                            isCorrect: true,
                        },
                        {
                            text: "Contar quantos usuários existem na base ativa",
                            isCorrect: false,
                        },
                        {
                            text: "Medir a retenção de 30 dias por coorte mensal",
                            isCorrect: false,
                        },
                        {
                            text: "Somar quantos eventos chegaram em cada semana",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que vale trocar 'botao_azul_clicado' e 'botao_verde_clicado' por um evento com propriedade cor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O painel continua válido quando surgir outra cor",
                            isCorrect: true,
                        },
                        {
                            text: "Eventos com nome de cor são proibidos pelas ferramentas",
                            isCorrect: false,
                        },
                        {
                            text: "Propriedades custam menos que eventos em qualquer plano",
                            isCorrect: false,
                        },
                        {
                            text: "A cor do botão não interessa a nenhuma análise de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time criou o evento 'interacao' com quinze propriedades para cobrir tudo. Qual é o problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vira caixa preta sem significado de negócio claro",
                            isCorrect: true,
                        },
                        {
                            text: "Ferramentas limitam eventos a dez propriedades no total",
                            isCorrect: false,
                        },
                        {
                            text: "Propriedades demais deixam o envio lento no aparelho",
                            isCorrect: false,
                        },
                        {
                            text: "O nome no infinitivo quebra a convenção da taxonomia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Taxonomia que escala",
            blocks: [
                {
                    type: "text",
                    value: "# Convenção de nomes que sobrevive a três anos\n\nA convenção mais usada e a que menos dá problema é objeto seguido de ação, tudo em minúsculas com underline, sempre em português ou sempre em inglês, nunca nos dois. 'conta_conectada', 'resumo_visualizado', 'assinatura_concluida'. Colocar o objeto primeiro tem um motivo prático: quando a lista cresce, a ordem alfabética agrupa tudo que fala do mesmo assunto.\n\nA ação vai no particípio, porque o evento é fato consumado, não intenção. 'conectar_conta' descreve um botão; 'conta_conectada' descreve o que aconteceu. E vale padronizar o pequeno conjunto de verbos que se repete no produto inteiro: visualizado, iniciado, concluido, falhou, cancelado. Com esses cinco, qualquer pessoa consegue adivinhar o nome do evento antes de abrir a documentação, e isso reduz a chance de alguém criar um duplicado com outro nome.\n\nDois erros custam caro depois. O primeiro é o evento genérico chamado 'erro', que impede qualquer análise porque mistura falha de conexão, falha de pagamento e falha de rede. O segundo é colocar versão no nome, como 'conta_conectada_v2': em seis meses ninguém lembra a diferença, o painel antigo aponta pro evento velho e os dois convivem para sempre. Se mudou o significado, deprecie o evento antigo com data e crie um nome novo que descreva o novo fato.",
                },
                {
                    type: "table",
                    value: '[["Nome ruim","Problema","Nome bom"],["clicouBotaoConectar","Mistura caixa e descreve o botão","conta_conexao_iniciada"],["Evento_Tela_Resumo","Caixa inconsistente e vago","resumo_visualizado"],["conectar_conta","Infinitivo, parece intenção","conta_conectada"],["erro","Genérico demais para consultar","conta_conexao_falhou"],["conta_conectada_v2","Versão no nome vira lixo eterno","nome novo e o antigo depreciado"]]',
                },
                {
                    type: "code",
                    value: '{\n  "nome": "conta_conectada",\n  "descricao": "Usuario terminou de conectar uma conta bancaria",\n  "dispara_quando": "A instituicao retorna sucesso na autorizacao",\n  "dono": "squad-conexoes",\n  "status": "ativo",\n  "criado_em": "2026-01-20",\n  "propriedades": [\n    { "nome": "banco", "tipo": "texto", "obrigatoria": true },\n    { "nome": "metodo", "tipo": "enum", "valores": ["open_finance", "manual"] },\n    { "nome": "tentativas", "tipo": "inteiro", "obrigatoria": true }\n  ],\n  "perguntas_que_responde": [\n    "Qual banco falha mais na conexao?",\n    "Quantas tentativas a pessoa faz antes de desistir?"\n  ]\n}',
                },
                {
                    type: "quote",
                    value: "Plano de eventos que vive numa planilha esquecida não é plano, é arqueologia. Ele precisa ser revisado antes do código, como qualquer contrato de interface.",
                },
                {
                    type: "text",
                    value: "## O plano de eventos como documento vivo\n\nO plano de eventos é o contrato entre quem escreve o código e quem faz a análise. Cada linha traz nome, descrição, momento exato do disparo, propriedades com tipo e obrigatoriedade, dono, status e as perguntas que aquele evento responde. Sem esse último campo, o plano vira inventário e perde a função de filtro.\n\nO fluxo que funciona é leve. Quem vai construir a funcionalidade propõe os eventos junto com a especificação. Uma pessoa responsável pela taxonomia, geralmente de dados ou de produto, revisa antes do desenvolvimento começar, checando duplicidade, nome e propriedades faltando. A revisão leva minutos e evita meses de dado inútil.\n\nO custo de não ter isso aparece sempre igual. Um time chega aos 320 eventos, descobre que 40% não são consultados há seis meses, que existem três nomes diferentes pro mesmo conceito e que ninguém sabe se 'assinatura_ok' ainda dispara. Nesse ponto, limpar custa mais que ter feito certo, porque cada evento suspeito exige investigação de código. A regra que segura a bagunça é simples: evento novo entra com dono e com pergunta; evento sem consulta há um ano entra na fila de remoção com aviso público antes.",
                },
            ],
            questions: [
                {
                    statement: "Qual convenção de nome de evento é recomendada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Objeto seguido da ação no particípio, em minúsculas",
                            isCorrect: true,
                        },
                        {
                            text: "Verbo no infinitivo seguido do nome da tela e da cor",
                            isCorrect: false,
                        },
                        {
                            text: "Nome livre, decidido por quem estiver programando a tela",
                            isCorrect: false,
                        },
                        {
                            text: "Sigla do time seguida de um número sequencial do evento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um evento chamado apenas 'erro' é ruim?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele mistura falhas diferentes e impede a análise",
                            isCorrect: true,
                        },
                        {
                            text: "Ele consome mais espaço no banco que os demais",
                            isCorrect: false,
                        },
                        {
                            text: "Ele não pode ser enviado por ferramentas de coleta",
                            isCorrect: false,
                        },
                        {
                            text: "Ele quebra o funil por não ter propriedade de tela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que 'conta_conectada' é melhor que 'conectar_conta'?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O evento registra fato consumado, não intenção",
                            isCorrect: true,
                        },
                        {
                            text: "O infinitivo não é aceito pelas ferramentas atuais",
                            isCorrect: false,
                        },
                        {
                            text: "O particípio ocupa menos caracteres no envio",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem alfabética exige verbo antes do objeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O significado de um evento vai mudar. Qual é a saída melhor que renomear para 'conta_conectada_v2'?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Depreciar o antigo com data e criar um nome novo",
                            isCorrect: true,
                        },
                        {
                            text: "Manter o mesmo nome e avisar o time por mensagem",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar o evento antigo do banco e reprocessar tudo",
                            isCorrect: false,
                        },
                        {
                            text: "Somar os dois eventos na consulta sempre que precisar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time tem 320 eventos e 40% deles não são consultados há seis meses. Qual regra evita esse acúmulo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Evento entra com dono e pergunta, e sai se não é usado",
                            isCorrect: true,
                        },
                        {
                            text: "Limitar o total de eventos em cem por aplicativo lançado",
                            isCorrect: false,
                        },
                        {
                            text: "Renomear todos os eventos a cada início de trimestre novo",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar apenas os eventos que aparecem no painel principal",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ferramentas em 2026 por categoria",
            blocks: [
                {
                    type: "text",
                    value: "# Categorias antes de nomes\n\nA pergunta 'qual ferramenta de analytics devo usar?' quase sempre está mal formulada, porque as ferramentas ocupam camadas diferentes e a maioria dos times acaba com três ou quatro convivendo. Entender as categorias resolve mais que decorar marcas, ainda mais numa área em que o líder de mercado muda de nome a cada dois anos.\n\nA camada de coleta e roteamento recebe o evento uma vez e entrega em vários destinos, o que evita reinstrumentar quando o time troca de ferramenta. A camada de analytics de produto responde funil, coorte e retenção sem exigir SQL, e é onde produto e design trabalham. A camada de web analytics olha tráfego, origem e páginas, com forte ligação com mídia. A camada de armazém guarda o dado bruto e permite cruzar com faturamento e suporte. E a camada de exploração e BI é onde se escreve consulta livre e se monta painel.\n\nEm 2026 os exemplos conhecidos de cada categoria são, respectivamente, ferramentas como Segment e RudderStack; Amplitude, Mixpanel e PostHog; GA4; BigQuery, Snowflake e Postgres; Metabase, Looker Studio e Power BI. A lista serve para reconhecer o território, não como ranking: a escolha certa depende do time, do volume e do orçamento, e não de qual nome aparece mais em conferência.",
                },
                {
                    type: "table",
                    value: '[["Categoria","Para que serve","Exemplos em 2026","Critério de escolha"],["Coleta e roteamento","Enviar o evento a vários destinos","Segment, RudderStack","Custo por evento e controle do dado"],["Analytics de produto","Funil, coorte e retenção sem SQL","Amplitude, Mixpanel, PostHog","Quem consulta e volume mensal"],["Web analytics","Tráfego, origem e páginas","GA4","Integração com mídia e consentimento"],["Armazém de dados","Guardar o bruto e cruzar fontes","BigQuery, Snowflake, Postgres","Volume e custo de consulta"],["Exploração e BI","Consulta livre e painel do time","Metabase, Looker Studio, Power BI","Domínio de SQL do time"]]',
                },
                {
                    type: "quote",
                    value: "Escolha ferramenta pela pergunta que o time faz toda semana e pelo custo de sair dela. Quem escolhe pela demonstração paga a diferença por anos.",
                },
                {
                    type: "text",
                    value: "## Como escolher sem virar refém\n\nCinco critérios resolvem quase todas as decisões. Quem vai consultar: se as perguntas nascem no time de produto e ninguém escreve SQL, ferramenta de analytics de produto vale o preço; se existe analista dedicado, armazém mais BI cobre mais por menos. Volume e modelo de cobrança: um app com 240.000 usuários ativos mensais e 25 eventos por usuário gera 6.000.000 de eventos por mês, e em planos que cobram por evento, dobrar a instrumentação dobra a fatura.\n\nOs outros três são portabilidade, conformidade e tempo de implantação. Portabilidade pergunta se você tem acesso ao dado bruto exportável; sem isso, trocar de fornecedor significa perder o histórico. Conformidade pergunta onde os dados ficam armazenados e como o consentimento é respeitado, assunto do fim deste módulo. Tempo de implantação pergunta quantas semanas até a primeira resposta útil.\n\nA arquitetura que evita arrependimento é mandar o evento primeiro para o armazém próprio e de lá espelhar para as ferramentas. Custa um pouco mais de engenharia no começo e transforma uma troca de fornecedor em projeto de semanas em vez de reescrita de um ano. Times que fizeram o contrário costumam descobrir o preço no dia em que o contrato é renovado com aumento.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual camada guarda o dado bruto e permite cruzar com faturamento e suporte?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O armazém de dados, onde o histórico fica completo",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta de web analytics, ligada à mídia paga",
                            isCorrect: false,
                        },
                        {
                            text: "A camada de coleta, que só roteia eventos adiante",
                            isCorrect: false,
                        },
                        {
                            text: "O painel de BI, que só desenha o gráfico já pronto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a camada de coleta e roteamento de eventos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Receber o evento uma vez e entregar a vários destinos",
                            isCorrect: true,
                        },
                        {
                            text: "Desenhar o painel semanal que a diretoria acompanha",
                            isCorrect: false,
                        },
                        {
                            text: "Calcular a significância estatística de cada teste A/B",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar o histórico completo de eventos por dez anos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 240.000 usuários ativos mensais e 25 eventos por usuário, qual é o volume mensal de eventos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "6.000.000 de eventos, o que pesa em plano por evento",
                            isCorrect: true,
                        },
                        {
                            text: "9.600.000 de eventos, o que pesa em plano por evento",
                            isCorrect: false,
                        },
                        {
                            text: "600.000 de eventos, o que pesa em plano por evento",
                            isCorrect: false,
                        },
                        {
                            text: "240.000 de eventos, o que pesa em plano por evento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time não tem ninguém que escreva SQL e precisa de funil e coorte na semana que vem. Qual categoria atende melhor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Analytics de produto, que entrega isso sem consulta",
                            isCorrect: true,
                        },
                        {
                            text: "Armazém de dados, que exige consulta escrita à mão",
                            isCorrect: false,
                        },
                        {
                            text: "Web analytics, que responde tráfego e origem apenas",
                            isCorrect: false,
                        },
                        {
                            text: "Camada de coleta, que apenas roteia os eventos brutos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que enviar o evento primeiro para o armazém próprio e depois espelhar para a ferramenta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Trocar de fornecedor deixa de custar o histórico todo",
                            isCorrect: true,
                        },
                        {
                            text: "O envio direto para a ferramenta é proibido desde 2025",
                            isCorrect: false,
                        },
                        {
                            text: "O armazém calcula funil e retenção melhor que os outros",
                            isCorrect: false,
                        },
                        {
                            text: "A ferramenta cobra menos quando recebe dado já tratado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Qualidade dos dados",
            blocks: [
                {
                    type: "text",
                    value: "# Confiar exige verificar\n\nDado de produto quebra em silêncio. Não aparece tela de erro, não toca alarme, o painel continua desenhando linhas bonitas e alguém decide com base numa métrica errada. Por isso qualidade de dado não é assunto de faxina anual: é parte do serviço, com as mesmas rotinas de monitoramento que a equipe usa para latência e disponibilidade.\n\nTrês falhas respondem pela maioria dos casos. Duplicação acontece quando o mesmo evento é enviado mais de uma vez, seja por nova tentativa sem chave de idempotência, seja por um componente de tela que dispara a cada redesenho. O sintoma clássico é uma etapa do funil com conversão acima de 100%, o que é impossível e ainda assim aparece em painéis pelo mundo todo.\n\nPerda acontece quando o evento não chega: bloqueador de rastreamento, aparelho offline, usuário que fecha o app antes do envio. O detalhe perigoso é que a perda não é aleatória, ela se concentra em quem tem internet ruim e aparelho antigo, o que enviesa qualquer análise por região ou por faixa de renda. Comparar o total do cliente com o total do servidor é o teste mais barato: 1.200.000 eventos no aplicativo contra 1.152.000 no servidor indicam 4% de perda, número que precisa ser conhecido antes de virar conclusão.",
                },
                {
                    type: "table",
                    value: '[["Sintoma no painel","Causa provável","Como confirmar"],["Conversão de etapa acima de 100%","Evento duplicado no cliente","Contar eventos por usuário e ver a moda"],["Queda súbita e total num evento","Renomeação ou build quebrada","Comparar volume por versão do app"],["Muitos usuários com um evento só","Identidade não unificada no login","Checar anônimos que viraram logados"],["Diferença entre cliente e servidor","Perda de envio na rede","Comparar totais diários das duas fontes"],["Região com número bom demais","Coleta bloqueada em outra região","Olhar cobertura por região e operadora"]]',
                },
                {
                    type: "quote",
                    value: "Perda de evento raramente é aleatória. Ela mora onde a internet é pior, e some justamente do grupo que você mais precisava enxergar na análise.",
                },
                {
                    type: "text",
                    value: "## Identidade e a rotina de sanidade\n\nA terceira falha é a mais sutil. Antes de logar, a pessoa é um dispositivo anônimo; depois de logar, é um usuário. Se o sistema não costura os dois históricos no momento do login, a mesma pessoa vira dois registros, e toda métrica que usa contagem de usuários no denominador desanda.\n\nA conta mostra o tamanho do estrago. Se 30% dos usuários aparecem duplicados, os 24.000 cadastros do mês viram 31.200 na ferramenta. A taxa de ativação, que era 9.600 sobre 24.000, ou 40%, passa a ser 9.600 sobre 31.200, ou 30,8%. O time vê nove pontos de queda, monta força-tarefa e investiga um problema que não existe no produto.\n\nA defesa é uma rotina de verificação diária, automática, com alerta. Volume de cada evento comparado com a média das quatro semanas anteriores. Proporção por plataforma dentro do esperado. Percentual de propriedade obrigatória vazia. Contagem de usuários com número absurdo de eventos por minuto. Nada disso é sofisticado, e é o que separa o painel em que o time confia do painel que o time consulta e depois confere na mão. Quando o dado quebra, alguém precisa ser avisado no mesmo dia, do mesmo jeito que um serviço fora do ar avisa.",
                },
            ],
            questions: [
                {
                    statement: "Qual sintoma indica evento duplicado no painel?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma etapa do funil com conversão acima de 100%",
                            isCorrect: true,
                        },
                        {
                            text: "Uma queda súbita e total no volume do evento",
                            isCorrect: false,
                        },
                        {
                            text: "Uma diferença de fuso horário entre dois relatórios",
                            isCorrect: false,
                        },
                        {
                            text: "Uma propriedade obrigatória chegando sempre vazia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a perda de eventos costuma não ser aleatória?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela se concentra em internet ruim e aparelho antigo",
                            isCorrect: true,
                        },
                        {
                            text: "Ela atinge sempre o mesmo percentual de cada evento",
                            isCorrect: false,
                        },
                        {
                            text: "Ela ocorre apenas em horários de pico do servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Ela depende do tipo de plano contratado pelo usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O app registrou 1.200.000 eventos e o servidor 1.152.000. Qual é a perda e o que fazer com ela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "4% de perda, que precisa ser conhecida antes da conclusão",
                            isCorrect: true,
                        },
                        {
                            text: "48% de perda, o que invalida qualquer análise do período",
                            isCorrect: false,
                        },
                        {
                            text: "4% de ganho, porque o cliente registra mais que o servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma perda, porque as duas fontes contam coisas iguais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 30% de usuários duplicados, os 24.000 cadastros viram 31.200. O que acontece com a ativação de 40%?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cai para 30,8%, sem que o produto tenha piorado",
                            isCorrect: true,
                        },
                        {
                            text: "Sobe para 52%, porque o denominador ficou maior",
                            isCorrect: false,
                        },
                        {
                            text: "Fica em 40%, porque o numerador também duplicou",
                            isCorrect: false,
                        },
                        {
                            text: "Cai para 12%, porque a perda se soma à duplicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual conjunto de verificações diárias detecta a maior parte das quebras de instrumentação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Volume por evento, mix de plataforma e campo vazio",
                            isCorrect: true,
                        },
                        {
                            text: "Receita do dia, ticket médio e total de assinantes",
                            isCorrect: false,
                        },
                        {
                            text: "Número de painéis abertos e consultas feitas no dia",
                            isCorrect: false,
                        },
                        {
                            text: "Tempo de resposta da API e uso de disco do servidor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Privacidade e LGPD na instrumentação",
            blocks: [
                {
                    type: "text",
                    value: "# Coletar menos e coletar melhor\n\nA LGPD organiza o trabalho de instrumentação em torno de alguns princípios que o analista precisa conhecer de cor: finalidade declarada, minimização, transparência, prazo de guarda e direitos do titular. Traduzindo para o dia a dia: só colete o que responde a uma pergunta definida, diga às pessoas o que está sendo coletado, guarde pelo tempo necessário e saiba apagar quando pedirem.\n\nMinimização é o princípio que mais muda o código. Enviar CPF, e-mail ou número de conta como propriedade de evento para uma ferramenta de terceiro é comum e é evitável: um identificador interno, sem significado fora dos seus sistemas, cumpre o mesmo papel analítico. O mesmo vale para valores: saber que o usuário está na faixa de dois a cinco mil reais responde tão bem quanto mandar o saldo exato, e reduz drasticamente o estrago de um vazamento.\n\nVale uma nota honesta sobre vocabulário. Dado financeiro não está na lista de dados sensíveis da lei, que trata de origem racial, convicção religiosa, opinião política, saúde, vida sexual, genética e biometria. Isso não significa que saldo e transação possam circular à vontade: o risco prático de reidentificação e de dano é altíssimo, e o cuidado exigido na prática é o mesmo. Categoria jurídica e responsabilidade técnica não são a mesma conversa.",
                },
                {
                    type: "table",
                    value: '[["Prática","O que evitar","O que fazer no lugar"],["Identificação","Enviar CPF ou e-mail no evento","Usar identificador interno sem significado"],["Valores","Mandar saldo exato para terceiros","Enviar faixa ou agregado quando bastar"],["Consentimento","Coletar antes de perguntar","Registrar a escolha e respeitar a recusa"],["Prazo de guarda","Guardar evento bruto para sempre","Definir prazo e apagar o que venceu"],["Acesso","Painel aberto para a empresa inteira","Perfis de acesso conforme a necessidade"]]',
                },
                {
                    type: "quote",
                    value: "Todo evento que você coleta é uma promessa de cuidado com alguém que não está na reunião. A dúvida sobre coletar ou não deve terminar sempre do lado de coletar menos.",
                },
                {
                    type: "text",
                    value: "## O analista responsável\n\nConsentimento não é banner. Quando a pessoa recusa a coleta de analytics, o efeito precisa ser real: o evento não sai do aparelho, ou sai apenas na versão estritamente necessária para o funcionamento. Interface que registra a recusa e continua enviando tudo é problema jurídico e, antes disso, quebra de palavra.\n\nAnonimizar e pseudonimizar também não são sinônimos, e a confusão custa caro. Trocar o nome por um código é pseudonimização: o dado continua sendo pessoal, porque existe uma tabela em algum lugar capaz de desfazer a troca. Anonimização de verdade é irreversível, e é mais difícil do que parece: a combinação de CEP, data de nascimento e gênero identifica boa parte da população brasileira sem precisar de nome nenhum.\n\nO direito de exclusão fecha o assunto. Um pedido atendido no banco principal, mas não no armazém analítico e nem nas três ferramentas de terceiro, é um pedido não atendido, e o mapa de para onde cada evento viaja precisa existir antes do primeiro pedido chegar. A postura profissional é conversar com jurídico e segurança antes de instrumentar, não depois: desfazer coleta é sempre mais caro do que ter feito a pergunta certa na semana da especificação.",
                },
            ],
            questions: [
                {
                    statement: "O que o princípio da minimização exige na instrumentação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Coletar só o que responde a uma pergunta definida",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o tamanho do arquivo enviado pelo aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Diminuir o número de painéis publicados pela empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Usar sempre a ferramenta mais barata disponível no mercado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre anonimizar e pseudonimizar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pseudonimizado ainda é dado pessoal, pois é reversível",
                            isCorrect: true,
                        },
                        {
                            text: "Anonimizado é o dado guardado com senha dentro do armazém",
                            isCorrect: false,
                        },
                        {
                            text: "Pseudonimizado é o dado enviado sem pedir consentimento",
                            isCorrect: false,
                        },
                        {
                            text: "Anonimizado é o dado que fica apenas dentro do aparelho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O usuário recusou a coleta de analytics, mas o app continua enviando todos os eventos. Qual é a leitura correta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A recusa precisa parar o envio, não só sumir o aviso",
                            isCorrect: true,
                        },
                        {
                            text: "Basta apagar os eventos depois, no fim de cada mês",
                            isCorrect: false,
                        },
                        {
                            text: "O envio pode seguir se o dado for pseudonimizado",
                            isCorrect: false,
                        },
                        {
                            text: "A recusa só vale para ferramentas sediadas fora do Brasil",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pedido de exclusão foi atendido no banco principal, mas não no armazém nem em três ferramentas. E aí?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O pedido não foi atendido, porque o dado segue existindo",
                            isCorrect: true,
                        },
                        {
                            text: "O pedido foi atendido, já que o sistema principal apagou",
                            isCorrect: false,
                        },
                        {
                            text: "O pedido vale só para o sistema onde o cadastro nasceu",
                            isCorrect: false,
                        },
                        {
                            text: "O pedido pode esperar o prazo de guarda vencer sozinho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que dado financeiro exige cuidado alto mesmo não sendo 'sensível' na definição da lei?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O risco de reidentificação e de dano continua enorme",
                            isCorrect: true,
                        },
                        {
                            text: "A lei brasileira proíbe qualquer coleta de valor pago",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas de mercado bloqueiam campos com dinheiro",
                            isCorrect: false,
                        },
                        {
                            text: "Bancos exigem contrato próprio para cada evento enviado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Experimentos A/B",
    aulas: [
        {
            titulo: "Por que experimentar",
            blocks: [
                {
                    type: "text",
                    value: "# Correlação não é causa, e isso custa dinheiro\n\nNo módulo de ativação apareceu um número forte: quem conecta duas contas na primeira semana retém 50% em 30 dias, contra 18% de quem conecta uma. A leitura tentadora é 'vamos empurrar todo mundo para a segunda conta e a retenção sobe'. Pode ser. Também pode ser que quem já pretendia usar o produto a sério seja justamente quem se dá ao trabalho de conectar a segunda conta, e nesse caso empurrar não muda nada além do número de cliques.\n\nA pergunta causal exige comparar o mundo com a mudança e o mundo sem ela, para as mesmas pessoas, no mesmo período. Esse contrafactual não existe: ninguém vive as duas versões. O experimento resolve por aproximação, sorteando quem recebe o quê. Com sorteio e amostra suficiente, os dois grupos ficam parecidos em idade, canal, aparelho, intenção e em todas as variáveis que você nem pensou em medir.\n\nÉ por isso que o teste A/B é o padrão-ouro de causalidade em produto. Não porque seja sofisticado, e sim porque é o único desenho em que a diferença observada tem uma explicação mais simples que qualquer alternativa: os grupos só diferiam naquilo que você mudou. Todo o resto da análise, por mais bem feito, gera hipóteses; o experimento gera decisões.",
                },
                {
                    type: "table",
                    value: '[["Observação","O que ela permite dizer","O que só o experimento responde"],["Quem conecta duas contas retém mais","Existe associação forte","Empurrar a conexão aumenta a retenção?"],["Retenção subiu após o lançamento","Algo mudou naquele período","A alta veio da mudança ou do calendário?"],["Quem vem por indicação retém mais","O canal traz outro perfil","O canal muda a pessoa ou apenas seleciona?"],["Quem recebe notificação volta mais","Os dois andam juntos","A notificação causa o retorno de alguém?"],["Plano caro tem menos churn","Perfil diferente assina caro","Subir o preço reduziria o churn de fato?"]]',
                },
                {
                    type: "quote",
                    value: "Análise observacional produz hipóteses excelentes e conclusões perigosas. O sorteio é o que transforma uma boa história em decisão defensável.",
                },
                {
                    type: "text",
                    value: "## O que o sorteio compra e o que ele exige\n\nO sorteio compra comparabilidade. Cada usuário elegível tem a mesma chance de cair no grupo de controle ou no de teste, e com número suficiente de pessoas as diferenças entre os grupos viram ruído. Isso vale inclusive para características que você desconhece, que é a parte impossível de conseguir com qualquer ajuste estatístico depois do fato.\n\nEm troca, o desenho exige disciplina. Primeiro, escolher a unidade de aleatorização: usuário, dispositivo, sessão ou região. Sortear por sessão numa mudança que pretende criar hábito é erro clássico, porque a mesma pessoa vive as duas versões em dias diferentes e o efeito se dilui até sumir. Para quase tudo em produto, a unidade certa é o usuário.\n\nSegundo, tratar os grupos igual em tudo menos na mudança. Se o grupo B também recebeu um e-mail de aviso, você testou duas coisas e não vai saber qual funcionou. Terceiro, reconhecer os casos em que o desenho não se aplica: preço divulgado publicamente, mudança de marca, efeito de rede em que um grupo influencia o outro. Nesses casos existem alternativas, e a última aula deste módulo trata delas sem fingir que substituem o sorteio.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o teste A/B é considerado o padrão-ouro de causalidade em produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O sorteio deixa os grupos parecidos em tudo o mais",
                            isCorrect: true,
                        },
                        {
                            text: "Ele usa a maior amostra possível dentro do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Ele dispensa qualquer definição de métrica primária",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é o método mais barato de rodar em qualquer app",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a unidade de aleatorização adequada para quase todo teste de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O usuário, para ele viver sempre a mesma versão",
                            isCorrect: true,
                        },
                        {
                            text: "A sessão, para aumentar o número de observações",
                            isCorrect: false,
                        },
                        {
                            text: "A tela, para isolar cada mudança de interface feita",
                            isCorrect: false,
                        },
                        {
                            text: "O evento, para maximizar o volume de dado coletado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quem conecta duas contas retém 50% e quem conecta uma retém 18%. Qual conclusão é sustentável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Existe associação forte que merece virar experimento",
                            isCorrect: true,
                        },
                        {
                            text: "Conectar a segunda conta causa a diferença de retenção",
                            isCorrect: false,
                        },
                        {
                            text: "Empurrar a segunda conta vai elevar a retenção total",
                            isCorrect: false,
                        },
                        {
                            text: "A diferença de 32 pontos é grande demais para ser real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um teste sorteou por sessão uma mudança que pretendia criar hábito. Qual é a consequência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A pessoa vive as duas versões e o efeito se dilui",
                            isCorrect: true,
                        },
                        {
                            text: "A amostra fica pequena demais para qualquer análise",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo de controle recebe mais tráfego que o outro",
                            isCorrect: false,
                        },
                        {
                            text: "O resultado passa a valer só para usuários novos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O grupo B recebeu a nova tela e também um e-mail de aviso que o grupo A não recebeu. O que isso causa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Duas mudanças juntas, sem saber qual gerou o efeito",
                            isCorrect: true,
                        },
                        {
                            text: "Um ganho de poder estatístico por reforço da mensagem",
                            isCorrect: false,
                        },
                        {
                            text: "Uma amostra desbalanceada entre os dois grupos do teste",
                            isCorrect: false,
                        },
                        {
                            text: "Um efeito de novidade que desaparece em duas semanas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Desenhar o experimento",
            blocks: [
                {
                    type: "text",
                    value: "# Hipótese, métrica primária e guardrails\n\nUm experimento começa numa frase com três partes: se fizermos X, então a métrica Y vai de A para B, porque Z. O 'porque' é o que separa experimento de tentativa aleatória, já que ele expõe o mecanismo e permite aprender mesmo quando o resultado é negativo.\n\nNo app de finanças, a hipótese fica assim: se sugerirmos a segunda conta logo depois da primeira conexão bem-sucedida, a proporção de usuários com duas contas em 7 dias sobe de 15% para 20%, porque a confiança do usuário está no auge no instante em que ele acabou de ver o primeiro sucesso. Repare que ela nomeia a mudança, a métrica, o tamanho esperado e a razão.\n\nA métrica primária precisa ser única. Não é economia de trabalho, é proteção contra autoengano: quem declara três primárias vai declarar vitória pela que der certo. As outras entram como secundárias, para entender o mecanismo, e como guardrails, que são métricas que não podem piorar mesmo que a primária melhore. No teste da segunda conta, os guardrails naturais são a taxa de falha na conexão e o cancelamento na primeira semana, porque uma sugestão insistente pode empurrar o número principal e irritar quem estava tranquilo.",
                },
                {
                    type: "table",
                    value: '[["Papel","Exemplo no teste da segunda conta","Regra de decisão"],["Primária","Duas contas conectadas em 7 dias","Decide sozinha o resultado"],["Guardrail","Taxa de falha na conexão","Não pode piorar além do limite"],["Guardrail","Cancelamento na primeira semana","Não pode piorar além do limite"],["Secundária","Resumo visualizado em 7 dias","Ajuda a explicar o mecanismo"],["Contexto","Tempo de conclusão do fluxo","Explica resultado inesperado"]]',
                },
                {
                    type: "code",
                    value: "// Regra de bolso para tamanho de amostra por variante\nn = 16 * p * (1 - p) / delta^2\n\n// Teste da segunda conta: p = 0,15 e delta = 0,05 (de 15% para 20%)\nn = 16 * 0,15 * 0,85 / 0,0025\nn = 16 * 0,1275 / 0,0025 = 816 usuarios por variante\n\n// Metade do efeito custa quatro vezes a amostra:\n// delta = 0,025  ->  n = 16 * 0,1275 / 0,000625 = 3.264 por variante\n\n// Outro caso: ativacao de 40% para 43% (p = 0,40 e delta = 0,03)\n// n = 16 * 0,24 / 0,0009 = 4.267 por variante",
                },
                {
                    type: "quote",
                    value: "Escreva o plano do teste antes de ligar o teste: métrica primária, tamanho, duração e o que você fará em cada resultado possível. Depois, o plano vira desculpa.",
                },
                {
                    type: "text",
                    value: "## Tamanho e duração decididos antes\n\nA regra de bolso para tamanho de amostra por variante é 16 vezes p vezes 1 menos p, dividido pelo quadrado do efeito que você quer detectar. Não substitui uma calculadora de poder estatístico, mas dá a ordem de grandeza em trinta segundos e evita testes que nasceram condenados. Para sair de 15% para 20%, são cerca de 820 usuários por variante. Para detectar metade desse efeito, o custo quadruplica e vai para mais de 3.200.\n\nEssa relação é a lição que mais poupa tempo: efeito pequeno exige amostra enorme. Por isso a primeira pergunta do desenho não é 'quanto vai melhorar?', e sim 'qual é o menor efeito que mudaria a nossa decisão?'. Se um ganho de 1 ponto já justificaria manter a mudança, prepare-se para um teste longo. Se só um ganho de 5 pontos mudaria alguma coisa, o teste cabe numa semana.\n\nDuração tem regra própria. Mesmo que a amostra necessária seja atingida em quatro dias, o comportamento de segunda-feira não é o de sábado, então o mínimo saudável é uma semana inteira, e duas quando existe suspeita de efeito de novidade. Com 400 usuários elegíveis por dia divididos em dois grupos, os 820 por variante chegam em pouco mais de quatro dias, e ainda assim o teste roda até fechar o ciclo semanal.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o formato recomendado de hipótese para um experimento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Se X, então Y muda para tanto, porque o mecanismo é Z",
                            isCorrect: true,
                        },
                        {
                            text: "Queremos melhorar a experiência da tela de conexão nova",
                            isCorrect: false,
                        },
                        {
                            text: "Vamos testar duas versões e ver qual delas se sai melhor",
                            isCorrect: false,
                        },
                        {
                            text: "A diretoria pediu a mudança e ela precisa ser avaliada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que servem as métricas de guardrail num experimento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Garantir que nada importante piore junto com o ganho",
                            isCorrect: true,
                        },
                        {
                            text: "Substituir a métrica primária quando ela não der certo",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o poder do teste somando mais observações",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar quantos usuários entraram em cada variante",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com p de 0,15 e efeito desejado de 5 pontos, quantos usuários por variante a regra de bolso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de 820, porque 16 vezes 0,1275 sobre 0,0025",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 4.267, porque 16 vezes 0,24 sobre 0,0009",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 3.264, porque o efeito buscado é de 2,5 pontos",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 200, porque bastam cem usuários em cada grupo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer detectar metade do efeito original. O que acontece com a amostra?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quadruplica, porque o efeito entra ao quadrado",
                            isCorrect: true,
                        },
                        {
                            text: "Dobra, porque a relação entre eles é proporcional",
                            isCorrect: false,
                        },
                        {
                            text: "Cai pela metade, já que o efeito ficou menor",
                            isCorrect: false,
                        },
                        {
                            text: "Não muda, porque a amostra depende só de p",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A amostra necessária é atingida em quatro dias. Por que ainda vale rodar a semana inteira?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O comportamento de dias úteis e de fim de semana difere",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas só calculam significância após sete dias",
                            isCorrect: false,
                        },
                        {
                            text: "A amostra da regra de bolso costuma vir subestimada",
                            isCorrect: false,
                        },
                        {
                            text: "O sorteio leva alguns dias para equilibrar os dois grupos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Significância sem sofrimento",
            blocks: [
                {
                    type: "text",
                    value: "# O que o p-valor diz e o que ele não diz\n\nO teste terminou. O grupo A, com 5.000 usuários, ativou 2.005 pessoas, ou 40,1%. O grupo B, também com 5.000, ativou 2.160, ou 43,2%. A diferença é de 3,1 pontos percentuais e o p-valor deu 0,002. Falta a parte que costuma ser recitada errado: o que exatamente esse 0,002 significa.\n\nO p-valor responde uma pergunta específica: se não existisse diferença nenhuma entre as versões, qual seria a chance de o acaso produzir uma diferença tão grande quanto essa, ou maior? Deu 0,2%. É pouco, e por isso a explicação 'foi sorte' fica difícil de sustentar. O limite de 5% que virou costume é uma convenção: aceitar, em média, um alarme falso a cada vinte testes em que não há efeito real.\n\nAgora o que o p-valor não diz. Ele não diz que há 95% de chance de B ser melhor, porque ele parte da hipótese de que não há diferença e não calcula a probabilidade dessa hipótese. Ele não diz que o efeito é exatamente 3,1 pontos, porque 3,1 é uma estimativa com incerteza em volta. E p acima de 0,05 nunca prova ausência de efeito: pode ser efeito pequeno, pode ser amostra insuficiente, e as duas situações se parecem no relatório.",
                },
                {
                    type: "table",
                    value: '[["Frase ouvida na reunião","Certa ou errada","Motivo"],["Há 95% de chance de B ser melhor","Errada","O p-valor não mede a chance da hipótese"],["Sem efeito real, esse resultado seria raro","Certa","É a definição do p-valor em português"],["p acima de 0,05 prova que não há efeito","Errada","Pode faltar amostra para detectar"],["O efeito verdadeiro é exatamente 3,1 pontos","Errada","3,1 é estimativa; a faixa é o intervalo"],["O efeito está entre 1,2 e 5,0 pontos","Certa","Descreve a incerteza de forma honesta"]]',
                },
                {
                    type: "quote",
                    value: "Prefira relatar o intervalo ao relatar o p-valor. A faixa mostra o tamanho do efeito e a incerteza junto, e é bem mais difícil de citar errado.",
                },
                {
                    type: "text",
                    value: "## Significância estatística e significância prática\n\nOs dois conceitos vivem sendo confundidos e não são a mesma coisa. Com uma base grande o bastante, qualquer diferença fica estatisticamente significante, inclusive 0,2 ponto percentual que não paga o custo de manter mais uma funcionalidade viva no código. A pergunta que importa vem depois do p-valor: o tamanho do efeito justifica a mudança?\n\nA tradução para dinheiro resolve a discussão. Os 3,1 pontos de ativação, aplicados aos 24.000 cadastros do mês, são 744 ativados a mais. Com retenção de 30%, viram 223 usuários retidos; com a conversão de 16,7% para assinatura, viram 37 assinantes; a R$ 19,90, são R$ 736,30 de receita recorrente nova por mês, todo mês. Aí sim dá pra comparar com o custo de manter a mudança.\n\nUsar o intervalo em vez do ponto deixa a conversa ainda mais honesta. Se o efeito está entre 1,2 e 5,0 pontos, o retorno mensal está entre cerca de R$ 279 e R$ 1.194. Faltou um conceito para fechar: poder estatístico é a chance de o teste detectar o efeito caso ele exista, e o padrão de mercado é 80%. Um teste com poder baixo que terminou sem significância não descobriu nada; ele apenas não olhou com atenção suficiente, e apresentar isso como 'não funciona' é erro de leitura, não de estatística.",
                },
            ],
            questions: [
                {
                    statement: "O que o p-valor de 0,002 significa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem efeito real, resultado assim seria muito raro",
                            isCorrect: true,
                        },
                        {
                            text: "Existe 99,8% de chance de a versão B ser melhor",
                            isCorrect: false,
                        },
                        {
                            text: "O efeito medido é de 0,2% sobre a base analisada",
                            isCorrect: false,
                        },
                        {
                            text: "A amostra do teste ficou 0,2% menor que o previsto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa adotar 95% de confiança num teste?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aceitar um alarme falso a cada vinte testes sem efeito",
                            isCorrect: true,
                        },
                        {
                            text: "Garantir que 95% dos usuários vão gostar da mudança",
                            isCorrect: false,
                        },
                        {
                            text: "Cobrir 95% da base de usuários dentro da amostra sorteada",
                            isCorrect: false,
                        },
                        {
                            text: "Ter 95% de certeza de que a hipótese está correta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Grupo A ativou 2.005 de 5.000 e grupo B ativou 2.160 de 5.000. Qual é a diferença observada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "3,1 pontos percentuais, de 40,1% para 43,2%",
                            isCorrect: true,
                        },
                        {
                            text: "155 pontos percentuais, contando pessoa a pessoa",
                            isCorrect: false,
                        },
                        {
                            text: "7,7 pontos percentuais, que é o ganho relativo",
                            isCorrect: false,
                        },
                        {
                            text: "0,2 ponto percentual, que é o valor do p-valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O teste deu p acima de 0,05 com amostra pequena. Qual é a conclusão honesta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não deu para detectar, o que não prova ausência",
                            isCorrect: true,
                        },
                        {
                            text: "A mudança não funciona e deve ser descartada já",
                            isCorrect: false,
                        },
                        {
                            text: "O efeito existe, mas ficou abaixo do limite legal",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo de controle teve vantagem no período todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Os 3,1 pontos sobre 24.000 cadastros viram 744 ativados, 223 retidos e 37 assinantes. Quanto isso vale por mês?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "R$ 736,30, porque 37 vezes R$ 19,90 dá esse valor",
                            isCorrect: true,
                        },
                        {
                            text: "R$ 4.437,70, porque 223 retidos pagam a assinatura",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 14.805,60, porque os 744 ativados viram pagantes",
                            isCorrect: false,
                        },
                        {
                            text: "R$ 19,90, porque o ticket já é o valor mensal total",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "As armadilhas do teste A/B",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro jeitos de se enganar com método\n\nO primeiro é espiar. O time abre o painel do teste todo dia e para no momento em que a diferença fica verde. Parece inofensivo e não é: cada olhada é uma chance nova de o acaso produzir um resultado extremo, e quem espia dez vezes durante um teste sem efeito real chega a uma probabilidade de falso positivo perto de 20%, em vez dos 5% combinados. O antídoto é decidir a duração antes e não parar no meio.\n\nO segundo é o efeito de novidade. Usuários reagem ao que é diferente, clicam para entender e o número sobe por duas semanas. Depois volta ao normal. O irmão gêmeo é a aversão à mudança, em que usuários antigos reclamam de algo que ficou melhor. Os dois se detectam olhando o resultado semana a semana, e não como um número único do período inteiro.\n\nO terceiro é olhar muitas métricas. Com vinte métricas acompanhadas e limite de 5%, o esperado é que uma dê significante por puro acaso, mesmo sem efeito nenhum. O quarto é segmentar depois do fato: 'no total não deu, mas em Android, no Nordeste, acima de 35 anos, deu'. Se você repartir a base em vinte recortes, algum vai brilhar. Isso não é descoberta, é a mesma armadilha das múltiplas métricas com outra roupa, e vira no máximo uma hipótese para um teste novo.",
                },
                {
                    type: "table",
                    value: '[["Armadilha","Como ela aparece","Antídoto"],["Espiar o resultado","Parar o teste no dia em que fica verde","Definir duração e tamanho antes"],["Efeito de novidade","Ganho grande na primeira semana e some","Rodar duas semanas e ler por semana"],["Muitas métricas","Uma entre vinte dá significante","Uma métrica primária definida antes"],["Segmento depois do fato","Achado só em um recorte específico","Tratar como hipótese de novo teste"],["Divisão desbalanceada","Um grupo com bem mais gente que o outro","Conferir a divisão antes de analisar"]]',
                },
                {
                    type: "quote",
                    value: "Se a análise só encontra o resultado depois de repartir a base em vinte pedaços, o que você encontrou foi o acaso vestido de segmento.",
                },
                {
                    type: "text",
                    value: "## Sanidade antes da conclusão\n\nAntes de olhar a métrica primária, três verificações evitam quase todo constrangimento. A primeira é a divisão dos grupos. Se você configurou 50 e 50 e recebeu 52 e 48 com cem mil usuários, isso não é azar: é bug na atribuição de variante, filtro que derrubou parte de um grupo ou evento perdido de um lado só. Diferença de proporção desse tamanho, com amostra grande, praticamente não acontece por acaso, e analisar um teste torto é perda de tempo.\n\nA segunda é o teste A e A. Rode dois grupos idênticos, sem mudança nenhuma, e veja se o seu sistema acusa diferença significante. Se acusar com frequência, o problema não está nas hipóteses e sim na infraestrutura de experimentação. Vale rodar um desses de vez em quando, principalmente depois de trocar de ferramenta.\n\nA terceira é a contaminação. A pessoa que troca de aparelho, sai da conta ou usa a versão web pode ver as duas variantes, e num produto com convite ou compartilhamento o grupo A pode ser afetado pelo que o grupo B recebeu. Depois dessas três checagens, a ordem de leitura é: guardrails primeiro, métrica primária em seguida, secundárias para entender o mecanismo e, por último, apenas os segmentos que estavam declarados no plano antes do teste começar.",
                },
            ],
            questions: [
                {
                    statement: "O que é espiar o resultado de um teste antes da hora?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Olhar todo dia e parar quando a diferença fica verde",
                            isCorrect: true,
                        },
                        {
                            text: "Analisar o teste junto com o time de engenharia do app",
                            isCorrect: false,
                        },
                        {
                            text: "Conferir a divisão dos grupos antes de começar o teste",
                            isCorrect: false,
                        },
                        {
                            text: "Ler o resultado semana a semana até o fim previsto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se detecta o efeito de novidade num experimento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Lendo o resultado semana a semana, não só no total",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentando a amostra até o p-valor ficar bem baixo",
                            isCorrect: false,
                        },
                        {
                            text: "Comparando o teste com outro rodado no ano passado",
                            isCorrect: false,
                        },
                        {
                            text: "Trocando a métrica primária no meio da execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time acompanhou 20 métricas com limite de 5%. Quantos resultados falsos são esperados por acaso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de 1, porque 20 vezes 0,05 dá exatamente um",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 5, porque o limite adotado foi de 5%",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum, porque o limite já protege contra isso",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 4, porque 20 dividido por 5 resulta em 4",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A divisão foi configurada em 50 e 50 e chegou 52 e 48 com cem mil usuários. O que isso indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Problema na atribuição, e não variação por acaso",
                            isCorrect: true,
                        },
                        {
                            text: "Variação normal, já que a amostra é bem grande",
                            isCorrect: false,
                        },
                        {
                            text: "Efeito da mudança atraindo mais gente para o teste",
                            isCorrect: false,
                        },
                        {
                            text: "Sinal de que a métrica primária vai dar positiva",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O teste não deu no total, mas deu em Android no Nordeste acima de 35 anos. Qual é a conduta correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Tratar como hipótese e desenhar um teste novo para ela",
                            isCorrect: true,
                        },
                        {
                            text: "Lançar a mudança apenas para esse segmento encontrado",
                            isCorrect: false,
                        },
                        {
                            text: "Refazer a análise com todos os segmentos possíveis da base",
                            isCorrect: false,
                        },
                        {
                            text: "Concluir que a mudança funciona em público específico",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Quando não dá para testar",
            blocks: [
                {
                    type: "text",
                    value: "# Nem tudo cabe num teste A/B\n\nO primeiro limite é volume. Um produto novo com 300 usuários elegíveis por semana, precisando de 4.300 por variante para detectar 3 pontos, levaria quase 29 semanas para concluir um único teste. Nesse cenário, insistir no método é desperdício: ou você aceita detectar apenas efeitos grandes, ou usa outro caminho.\n\nO segundo é estrutural. Reescrever o app inteiro, trocar a identidade visual da marca ou mudar o preço divulgado publicamente não são coisas que se servem em duas versões ao mesmo tempo. No caso do preço, além do custo técnico, existe o problema de dois usuários descobrirem que pagam valores diferentes pelo mesmo produto, o que é um risco de reputação e de contestação legal.\n\nO terceiro é o efeito de rede. Num produto com convite, indicação ou marketplace, o grupo de controle é afetado pelo que acontece com o grupo de teste, e a comparação perde sentido: quem recebeu convite de alguém do grupo B carrega o efeito para dentro do grupo A. O quarto é o horizonte. Se a métrica que interessa é retenção de doze meses, ninguém vai esperar um ano; o caminho é validar uma métrica intermediária que se prove ligada ao resultado de longo prazo e testar contra ela, sabendo que é uma aposta.",
                },
                {
                    type: "table",
                    value: '[["Situação","Por que o A/B não serve","Alternativa honesta"],["Tráfego pequeno","O teste levaria 29 semanas","Mirar efeito maior ou usar pré e pós"],["Reescrita completa do app","Não dá para servir duas versões","Rollout gradual com monitoramento"],["Preço divulgado ao público","Valores diferentes geram atrito","Testar por coorte nova de assinantes"],["Efeito de rede","Um grupo influencia o outro","Aleatorizar por cidade ou por região"],["Resultado de doze meses","Ninguém espera um ano","Métrica intermediária validada antes"]]',
                },
                {
                    type: "quote",
                    value: "Quando o método é fraco, a conclusão precisa ser proporcionalmente fraca. Dizer 'provavelmente ajudou, não conseguimos isolar' é mais profissional que fingir causalidade.",
                },
                {
                    type: "text",
                    value: "## Alternativas e o preço de cada uma\n\nA comparação antes e depois é a alternativa mais usada e a mais traiçoeira. Ela atribui à mudança tudo o que aconteceu no período, incluindo sazonalidade, campanha de mídia que entrou junto, mudança de mix de canal e qualquer outra alteração que o time fez na mesma semana. Dá para melhorar bastante com três cuidados: comparar janelas equivalentes, acompanhar em paralelo um grupo ou uma região que não recebeu a mudança, e conferir métricas que não deveriam ter sido afetadas. Se elas também subiram, o que mudou foi o mundo, não o produto.\n\nO rollout gradual serve primeiro à segurança: liberar para 1%, depois 5%, 25% e 100%, observando erro e reclamação a cada passo. Ele vira quase-experimento quando você segura deliberadamente uma fatia sem a mudança por algumas semanas e compara. Não é sorteio perfeito, mas é infinitamente melhor que olhar apenas o antes e o depois.\n\nA aleatorização por região resolve boa parte dos casos de efeito de rede e de preço: cidades parecidas recebem tratamentos diferentes e a comparação acontece entre grupos de cidades. O custo é precisar de muitas unidades e aceitar mais incerteza. Em todos esses casos, a regra que preserva a credibilidade é escrever no relatório qual desenho foi usado, o que ele não consegue descartar e qual seria o teste ideal se houvesse tráfego para ele.",
                },
            ],
            questions: [
                {
                    statement:
                        "Com 300 usuários elegíveis por semana e necessidade de 4.300 por variante, quanto dura o teste?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cerca de 29 semanas, somando os dois grupos do teste",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 14 semanas, contando apenas um dos grupos",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 4 semanas, que é o mínimo recomendado sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 60 semanas, porque o efeito buscado é pequeno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que mudar o preço divulgado publicamente é difícil de testar em A/B?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Usuários descobrem que pagam valores diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "Preço não pode ser medido como métrica primária",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas de teste não aceitam campo de valor",
                            isCorrect: false,
                        },
                        {
                            text: "A receita demora meses para aparecer no sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o principal risco da comparação simples entre antes e depois?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela credita à mudança tudo que ocorreu no período",
                            isCorrect: true,
                        },
                        {
                            text: "Ela exige uma amostra maior que a de um teste A/B",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só funciona em produtos com muitos usuários ativos",
                            isCorrect: false,
                        },
                        {
                            text: "Ela precisa de aprovação do jurídico antes de rodar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como um rollout gradual pode virar um quase-experimento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Segurando uma fatia sem a mudança para comparar",
                            isCorrect: true,
                        },
                        {
                            text: "Acelerando os passos até chegar aos 100% da base",
                            isCorrect: false,
                        },
                        {
                            text: "Liberando para todos e olhando o antes e o depois",
                            isCorrect: false,
                        },
                        {
                            text: "Escolhendo a dedo os usuários que recebem primeiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num produto com indicação entre usuários, por que o teste por usuário perde validade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quem está no controle recebe convite de quem foi tratado",
                            isCorrect: true,
                        },
                        {
                            text: "O sorteio por usuário não consegue equilibrar os grupos",
                            isCorrect: false,
                        },
                        {
                            text: "A métrica de indicação não pode ser medida por evento",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho de amostra necessário passa de cem mil pessoas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Análise para decisão",
    aulas: [
        {
            titulo: "Da pergunta ao dado",
            blocks: [
                {
                    type: "text",
                    value: "# Começar pela decisão, não pela tabela\n\nO pedido chega assim: 'me manda os dados de uso da busca'. O analista abre a ferramenta, exporta, entrega, e o número vira base para uma decisão que ele nem sabia que estava sendo tomada. Duas semanas depois, a busca sai da tela inicial e a conversão de quem procurava um banco específico despenca.\n\nO conserto é uma pergunta feita antes do trabalho: que decisão você vai tomar com isso? No exemplo, a decisão era remover a busca. Com essa informação, o dado necessário muda completamente. O total de usuários que usam a busca é quase irrelevante; o que importa é quem usa, por que usa e o que acontece com essas pessoas depois. Se 9% da base usa a busca, mas esse grupo tem o dobro de conversão em conexão de conta, a resposta não é 'pouca gente usa', é 'poucos usam e são justamente os que mais avançam'.\n\nUma pergunta bem formulada tem cinco partes: a decisão em jogo, quem decide, quando, quais são as opções e o que faria a pessoa escolher uma em vez da outra. Preencher isso leva dez minutos e economiza dias de análise que ninguém vai usar. Também deixa visível o caso em que o dado não muda escolha nenhuma, e aí a resposta profissional é dizer que a análise não vale a pena.",
                },
                {
                    type: "table",
                    value: '[["Pedido recebido","Decisão por trás dele","Dado que responde de verdade"],["Quantos usam a busca?","Tirar a busca da tela inicial","Quem usa e o que acontece com esse grupo"],["Manda o funil do mês","Escolher o foco do trimestre","Queda por etapa e valor de cada correção"],["Qual canal traz mais gente?","Onde colocar a verba de mídia","Custo por ativado e retenção por canal"],["A tela nova funcionou?","Manter, reverter ou iterar","Resultado do teste com os guardrails"],["Quantos cancelaram?","Priorizar retenção ou aquisição","Motivo do cancelamento e receita perdida"]]',
                },
                {
                    type: "quote",
                    value: "Antes de abrir a consulta, escreva a decisão que ela vai apoiar. Análise sem decisão associada é entretenimento caro com aparência de trabalho.",
                },
                {
                    type: "text",
                    value: "## O contrato de cinco linhas\n\nAntes de escrever a primeira consulta, vale registrar cinco linhas curtas: qual é a pergunta, qual decisão depende dela, que dado responde, qual recorte de tempo e população, e o que faria alguém mudar de ideia. Esse último item é o mais valioso, porque obriga o solicitante a declarar antes qual resultado o convenceria, o que reduz muito a chance de racionalização depois.\n\nO contrato também combina profundidade. Uma análise de duas horas e uma de duas semanas respondem a mesma pergunta com confianças diferentes, e ambas são legítimas dependendo do que está em jogo. Reverter uma cor de botão pede a primeira; decidir onde colocar meio milhão de reais em mídia pede a segunda. Quem não negocia isso no começo costuma entregar profundidade de duas semanas em prazo de duas horas ou o contrário.\n\nE existe uma resposta que muitos analistas evitam dar e que faz parte do ofício: essa pergunta não pode ser respondida com o que temos hoje. Ou porque o evento não é coletado, ou porque o desenho não permite isolar causa, ou porque o número necessário só existe daqui a três meses. Dizer isso com clareza, junto com a versão aproximada que dá pra entregar agora e o que precisaria mudar para responder direito, é mais útil que produzir um número bonito que ninguém deveria usar.",
                },
            ],
            questions: [
                {
                    statement: "Qual pergunta deve vir antes de qualquer análise?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que decisão será tomada com esse resultado?",
                            isCorrect: true,
                        },
                        {
                            text: "Qual ferramenta o time prefere para o painel?",
                            isCorrect: false,
                        },
                        {
                            text: "Quantas linhas a consulta vai retornar no total?",
                            isCorrect: false,
                        },
                        {
                            text: "Quem vai apresentar o resultado para a diretoria?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais partes compõem uma pergunta bem formulada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Decisão, quem decide, prazo, opções e critério",
                            isCorrect: true,
                        },
                        {
                            text: "Tabela, coluna, filtro, ordenação e exportação",
                            isCorrect: false,
                        },
                        {
                            text: "Evento, propriedade, plataforma, versão e região",
                            isCorrect: false,
                        },
                        {
                            text: "Hipótese, amostra, p-valor, poder e intervalo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A busca é usada por 9% da base, mas esse grupo converte o dobro. Como responder ao pedido de remover a busca?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Poucos usam, e são justamente os que mais avançam",
                            isCorrect: true,
                        },
                        {
                            text: "Poucos usam, então a remoção não traz risco algum",
                            isCorrect: false,
                        },
                        {
                            text: "O total de uso é o único dado relevante na decisão",
                            isCorrect: false,
                        },
                        {
                            text: "A conversão do grupo não interessa a essa pergunta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que declarar antes o que faria mudar de ideia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reduz a chance de racionalizar o resultado depois",
                            isCorrect: true,
                        },
                        {
                            text: "Acelera o tempo de execução da consulta no banco",
                            isCorrect: false,
                        },
                        {
                            text: "Substitui a necessidade de rodar um teste A/B antes",
                            isCorrect: false,
                        },
                        {
                            text: "Garante que a análise vai confirmar a hipótese inicial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O evento necessário não é coletado e a resposta correta levaria três meses. O que fazer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dizer isso e oferecer a versão aproximada possível",
                            isCorrect: true,
                        },
                        {
                            text: "Entregar o número mais próximo sem citar a limitação",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar a demanda e devolver para quem a solicitou",
                            isCorrect: false,
                        },
                        {
                            text: "Esperar os três meses e responder somente no final",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Segmentação que revela",
            blocks: [
                {
                    type: "text",
                    value: "# O agregado que esconde dois mundos\n\nUm número agregado é uma média, e média é o lugar onde as histórias vão morrer. A conversão de assinatura caiu de 12,5% em julho para 7,6% em agosto, uma queda de quase cinco pontos que já rendeu reunião de emergência. O detalhe: no celular ela subiu de 5,0% para 6,0%, e no computador subiu de 20,0% para 22,0%. Melhorou nos dois lugares e piorou no total.\n\nNão há erro de conta. Em julho, o tráfego era metade celular e metade computador: 50 conversões entre 1.000 no celular, 200 entre 1.000 no computador, 250 entre 2.000 no total. Em agosto, uma campanha grande trouxe muito celular: 108 entre 1.800 no celular, 44 entre 200 no computador, 152 entre 2.000. Como o celular converte bem menos e passou a ser 90% do tráfego, a média foi puxada para baixo mesmo com cada grupo indo melhor.\n\nEsse é o paradoxo de Simpson na forma que ele aparece no dia a dia: mudança de composição invertendo o sinal do resultado. A defesa é simples e precisa virar reflexo: antes de explicar qualquer variação de um número agregado, verifique se o mix de segmentos mudou. Quando o total se move e nenhum segmento se move, a resposta é o mix. Quando os segmentos se movem e o total não, o mix também é a resposta, só que na direção contrária.",
                },
                {
                    type: "table",
                    value: '[["Recorte","Julho","Agosto","Leitura"],["Celular","50 de 1.000 (5,0%)","108 de 1.800 (6,0%)","Melhorou 1 ponto"],["Computador","200 de 1.000 (20,0%)","44 de 200 (22,0%)","Melhorou 2 pontos"],["Total","250 de 2.000 (12,5%)","152 de 2.000 (7,6%)","Piorou 4,9 pontos"],["Peso do celular","50% do tráfego","90% do tráfego","Explica a queda do total"]]',
                },
                {
                    type: "code",
                    value: "-- Padronizacao: aplicar as taxas de agosto ao mix de julho\n-- Mix de julho: 50% celular e 50% computador\n-- Taxas de agosto: celular 6,0% e computador 22,0%\n\ntotal_padronizado = 0,50 * 0,060 + 0,50 * 0,220 = 0,140  -- 14,0%\ntotal_julho       = 0,50 * 0,050 + 0,50 * 0,200 = 0,125  -- 12,5%\n\n-- Com o mesmo mix, agosto seria 14,0% contra 12,5% de julho:\n-- melhora real de 1,5 ponto, escondida por uma queda de 4,9 no agregado",
                },
                {
                    type: "quote",
                    value: "Quando o total anda para um lado e todos os segmentos andam para o outro, não procure culpado no produto. Procure o que mudou na composição do público.",
                },
                {
                    type: "text",
                    value: "## Segmentar por hipótese, não por curiosidade\n\nA técnica que resolve o caso acima chama-se padronização: aplicar as taxas do período novo ao mix do período antigo. Com o mix de julho, as taxas de agosto dariam 14,0% contra os 12,5% originais. A conclusão correta, então, é que o produto melhorou 1,5 ponto e a mudança de público derrubou o número visível. As duas coisas são verdade ao mesmo tempo e as duas precisam aparecer no relatório.\n\nSobre quais cortes usar, a ordem que funciona é estrutural primeiro: plataforma, canal de aquisição, coorte de entrada, região e plano. Esses explicam a maior parte das diferenças e quase sempre estão disponíveis. Depois vêm os comportamentais, do tipo quem conectou duas contas ou quem usou a busca, que são mais reveladores e mais perigosos, porque o comportamento pode ser consequência e não causa.\n\nDuas disciplinas evitam que a segmentação vire pescaria. A primeira é ter uma hipótese antes de cada corte: você segmenta por plataforma porque suspeita que o fluxo de conexão está pior no Android, não porque a ferramenta oferece o botão. A segunda é respeitar tamanho mínimo: um segmento com menos de cem conversões oscila vários pontos entre semanas por puro acaso, e vai gerar descobertas que somem no mês seguinte.",
                },
            ],
            questions: [
                {
                    statement: "O que é o paradoxo de Simpson na prática de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O total piora enquanto cada segmento melhora",
                            isCorrect: true,
                        },
                        {
                            text: "O total sobe quando a amostra fica pequena demais",
                            isCorrect: false,
                        },
                        {
                            text: "O evento chega duplicado e infla a conversão medida",
                            isCorrect: false,
                        },
                        {
                            text: "A média muda quando o fuso horário é configurado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais cortes de segmentação convém tentar primeiro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Plataforma, canal, coorte, região e plano do usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Comportamentos raros observados na semana anterior",
                            isCorrect: false,
                        },
                        {
                            text: "Recortes gerados ao acaso pela própria ferramenta",
                            isCorrect: false,
                        },
                        {
                            text: "Faixas de horário e de dia da semana de cada acesso feito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em agosto, o celular converteu 108 de 1.800 e o computador 44 de 200. Qual é a conversão total?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "7,6%, porque 152 conversões saíram de 2.000 visitas",
                            isCorrect: true,
                        },
                        {
                            text: "14,0%, que é a média simples das duas plataformas",
                            isCorrect: false,
                        },
                        {
                            text: "6,0%, que é a taxa da plataforma com mais tráfego",
                            isCorrect: false,
                        },
                        {
                            text: "12,5%, o mesmo valor que tinha sido medido em julho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Aplicando as taxas de agosto ao mix de julho, o total dá 14,0%. O que isso permite concluir?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O produto melhorou 1,5 ponto e o mix escondeu isso",
                            isCorrect: true,
                        },
                        {
                            text: "O produto piorou 4,9 pontos, como o agregado mostrou",
                            isCorrect: false,
                        },
                        {
                            text: "A padronização provou que houve erro na coleta do dado",
                            isCorrect: false,
                        },
                        {
                            text: "As duas plataformas passaram a converter igualmente bem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um segmento com menos de cem conversões costuma gerar descoberta falsa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele oscila vários pontos por acaso entre as semanas",
                            isCorrect: true,
                        },
                        {
                            text: "Ele não pode ser calculado pelas ferramentas de BI",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige um teste A/B próprio antes de ser lido",
                            isCorrect: false,
                        },
                        {
                            text: "Ele sempre representa usuários de plataforma antiga",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Funis de conversão na prática",
            blocks: [
                {
                    type: "text",
                    value: "# Onde investigar primeiro\n\nO fluxo de conectar uma conta bancária tem quatro etapas e um mês de dados. Vinte mil pessoas abriram a tela de conectar. Dezesseis mil escolheram o banco, ou 80%. Nove mil e seiscentas autorizaram no ambiente do banco, ou 60% das que escolheram. Oito mil seiscentas e quarenta sincronizaram e viram o resumo, ou 90% das que autorizaram. A conversão fim a fim é de 43,2%.\n\nA leitura ingênua aponta para a etapa de autorização, que tem a menor taxa. A leitura completa concorda, mas por um motivo melhor: ela também é a maior perda absoluta, 6.400 pessoas, e está no meio do fluxo, então qualquer ganho ali se propaga para as etapas seguintes. Etapa com taxa baixa no fim do funil mexe em pouca gente; a mesma taxa no começo mexe em todo mundo.\n\nAntes de propor solução, vale quebrar a etapa problemática por dimensão. Das 16.000 pessoas que escolheram o banco, 6.400 foram para o banco A e autorizaram em 72%, 4.800 foram para o banco B e autorizaram em 68%, e 4.800 foram para o banco C e autorizaram em apenas 36%. As três parcelas somam exatamente as 9.600 autorizações. O problema deixou de ser 'a autorização está ruim' e virou 'a integração com o banco C está quebrando', que é uma frase acionável por um time específico ainda nesta semana.",
                },
                {
                    type: "table",
                    value: '[["Etapa","Usuários","Conversão da etapa","Perdidos na etapa"],["Abriu a tela de conectar","20.000","100%","0"],["Escolheu o banco","16.000","80,0%","4.000"],["Autorizou no banco","9.600","60,0%","6.400"],["Sincronizou e viu o resumo","8.640","90,0%","960"],["Resultado fim a fim","8.640","43,2%","11.360"]]',
                },
                {
                    type: "code",
                    value: "-- A etapa de autorizacao aberta por instituicao\nbanco    escolheram   autorizaram   taxa\nA            6.400         4.608      72,0%\nB            4.800         3.264      68,0%\nC            4.800         1.728      36,0%\ntotal       16.000         9.600      60,0%\n\n-- Se o banco C chegasse aos 68% do banco B:\n-- 4.800 * 0,68 = 3.264, ou 1.536 autorizacoes a mais\n-- total passaria a 11.136 de 16.000, ou 69,6%",
                },
                {
                    type: "quote",
                    value: "Etapa ruim é diagnóstico preguiçoso. Etapa ruim para quem, em qual aparelho, com qual parceiro: é aí que a análise vira tarefa para alguém executar.",
                },
                {
                    type: "text",
                    value: "## Quanto vale consertar cada queda\n\nPriorizar exige transformar cada correção em número. Subir a autorização de 60% para 70% levaria as 16.000 escolhas a 11.200 autorizações, 1.600 a mais, que depois da etapa de sincronização de 90% viram 1.440 conexões concluídas a mais. Se 5% dessas pessoas assinam o plano de R$ 19,90, são 72 assinantes e R$ 1.432,80 de receita recorrente por mês.\n\nAgora a alternativa. Subir a escolha do banco de 80% para 85% levaria a 17.000 escolhas, mas essas passam pelos mesmos 60% de autorização e 90% de sincronização: 9.180 concluídas, apenas 540 a mais, ou 27 assinantes e R$ 537,30 por mês. Cinco pontos na primeira etapa valem bem menos que dez pontos no meio, e a conta mostra isso sem discussão.\n\nRepare que a correção do banco C entrega quase tudo o que a simulação otimista prometia: se ele saltasse de 36% para os 68% do banco B, a autorização total iria a 69,6%. Ou seja, o ganho de dez pontos não exige redesenhar o fluxo inteiro, exige consertar uma integração. É esse tipo de conclusão que separa a análise que vira tarefa da análise que vira slide. E vale registrar a limitação: os 5% de conversão em assinatura vêm do histórico da base, e nada garante que os usuários destravados se comportem igual.",
                },
            ],
            questions: [
                {
                    statement:
                        "De 20.000 que abriram a tela, 8.640 concluíram. Qual é a conversão fim a fim do fluxo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "43,2%, porque 8.640 saem de 20.000 iniciais",
                            isCorrect: true,
                        },
                        {
                            text: "90,0%, que é a taxa da última etapa do fluxo",
                            isCorrect: false,
                        },
                        {
                            text: "60,0%, que é a taxa da etapa de autorização",
                            isCorrect: false,
                        },
                        {
                            text: "48,0%, que é a soma das perdas de cada etapa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual etapa do fluxo de conexão perdeu mais gente em números absolutos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A autorização no banco, com 6.400 pessoas perdidas",
                            isCorrect: true,
                        },
                        {
                            text: "A escolha do banco, com 4.000 pessoas perdidas ali",
                            isCorrect: false,
                        },
                        {
                            text: "A sincronização final, com 960 pessoas perdidas ali",
                            isCorrect: false,
                        },
                        {
                            text: "A abertura da tela, que não perde ninguém no começo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O banco C tem 4.800 escolhas e autoriza 36%. Quantas autorizações a mais se chegasse aos 68% do banco B?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "1.536 a mais, indo de 1.728 para 3.264 no mês",
                            isCorrect: true,
                        },
                        {
                            text: "3.264 a mais, porque esse é o total do banco B",
                            isCorrect: false,
                        },
                        {
                            text: "960 a mais, que é a perda da última etapa toda",
                            isCorrect: false,
                        },
                        {
                            text: "32 a mais, que é a diferença entre as duas taxas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dez pontos na autorização geram 1.440 conexões a mais e cinco pontos na escolha geram 540. O que priorizar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A autorização, que rende quase o triplo de conexões",
                            isCorrect: true,
                        },
                        {
                            text: "A escolha do banco, por ser a etapa mais no começo",
                            isCorrect: false,
                        },
                        {
                            text: "As duas juntas, já que somam quase 2.000 conexões",
                            isCorrect: false,
                        },
                        {
                            text: "A sincronização, que já converte 90% e é mais fácil",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual limitação precisa ser registrada junto com a estimativa de R$ 1.432,80 por mês?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os 5% de conversão vêm do histórico da base atual",
                            isCorrect: true,
                        },
                        {
                            text: "O valor foi calculado com o ticket do plano anual",
                            isCorrect: false,
                        },
                        {
                            text: "A etapa de autorização depende do time de mídia paga",
                            isCorrect: false,
                        },
                        {
                            text: "O número exclui os usuários que vieram por indicação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Correlação, causalidade e narrativa",
            blocks: [
                {
                    type: "text",
                    value: "# O gráfico que conta a história errada\n\nA retenção subiu de 30% em fevereiro para 35% em março, logo depois do lançamento do novo onboarding. A apresentação já está pronta, com a linha subindo e a seta apontando para a data da entrega. Antes de mandar, vale checar três suspeitos de sempre: sazonalidade, mix e confundidor.\n\nO mix é o culpado deste caso. A coorte de fevereiro tinha 10.000 pessoas, sendo 2.000 vindas de indicação, que retêm 50%, e 8.000 de outros canais, que retêm 25%. Isso dá 1.000 mais 2.000, ou 3.000 retidos, exatamente os 30%. A coorte de março também teve 10.000 pessoas, mas com 4.000 de indicação e 6.000 dos demais canais: 2.000 mais 1.500, ou 3.500 retidos, os 35%.\n\nAgora a padronização: se março tivesse o mix de fevereiro, com 20% de indicação, a conta seria 0,20 vezes 50% mais 0,80 vezes 25%, o que dá exatamente 30%. Dentro de cada canal, nada mudou. Os cinco pontos vieram inteiramente de uma campanha de indicação que aconteceu no mesmo período, e o onboarding novo não tem evidência nenhuma a seu favor. Publicar o gráfico original não seria mentira deliberada, seria falta de checagem, e o efeito prático é o mesmo: o time acredita numa alavanca que não existe e vai puxar de novo esperando o mesmo resultado.",
                },
                {
                    type: "table",
                    value: '[["Padrão observado","Explicação preguiçosa","O que falta descartar"],["Retenção subiu em março","O onboarding novo funcionou","Mix de canal e outras entregas do mês"],["Quem liga notificação retém mais","A notificação segura o usuário","Quem liga já era mais interessado"],["Receita por usuário caiu","O produto perdeu valor","Entrou canal novo com perfil diferente"],["Uso cai na terceira semana","O aplicativo cansa o usuário","Ciclo de salário e de contas a pagar"],["Android converte menos","O app de Android é pior","Aparelho, renda e canal também diferem"]]',
                },
                {
                    type: "quote",
                    value: "Toda seta apontando para a data de um lançamento precisa passar por uma pergunta chata: o que mais aconteceu naquela semana que também poderia explicar isso?",
                },
                {
                    type: "text",
                    value: "## Como testar a própria narrativa\n\nQuatro perguntas resolvem a maioria dos casos. O que mais mudou no período, incluindo campanha, preço, feriado e mudança de outro time? A composição do público mudou? Existe um terceiro fator que explica tanto a causa quanto o efeito, como a intenção do usuário explicando ao mesmo tempo ligar a notificação e voltar ao app? E o efeito aparece nos dois sentidos, ou seja, quando a mudança foi revertida em alguma região, o número voltou?\n\nUma técnica prática ajuda muito: procure o grupo que não deveria ter sido afetado. Se a mudança valeu só para Android, o iOS funciona como controle improvisado. Se o iOS subiu junto, a explicação está no mundo e não na entrega. Não é sorteio e não substitui um experimento, mas descarta muita história errada em quinze minutos de consulta.\n\nSobre a apresentação, dois cuidados evitam exagero involuntário. Eixo cortado transforma variação de meio ponto em montanha, o que é aceitável em série de linha bem sinalizada e é enganoso em gráfico de barras. E variação relativa sem a base absoluta engana: 'crescemos 200%' pode significar três usuários virando nove. A regra final é permitir que a conclusão seja fraca quando a evidência é fraca. 'Provavelmente contribuiu, não conseguimos isolar do efeito da campanha' é uma frase profissional, e quem a escreve constrói credibilidade que dura muito mais que um slide bonito.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quais são os três suspeitos a checar antes de atribuir uma alta a uma entrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sazonalidade, mudança de mix e algum confundidor",
                            isCorrect: true,
                        },
                        {
                            text: "Ferramenta, versão do app e fuso horário do servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Tamanho da amostra, p-valor e poder do teste usado",
                            isCorrect: false,
                        },
                        {
                            text: "Preço do plano, custo do canal e margem do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que 'quem liga a notificação retém mais' é uma conclusão frágil?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem liga já costuma ser mais interessado no produto",
                            isCorrect: true,
                        },
                        {
                            text: "Notificações não podem ser medidas por evento no app",
                            isCorrect: false,
                        },
                        {
                            text: "A retenção nunca é influenciada por avisos enviados",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo que liga é sempre pequeno demais para análise",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Fevereiro teve 2.000 de indicação em 10.000 e março teve 4.000. Com taxas de 50% e 25%, o que explica a alta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A mudança de mix, já que as taxas seguiram iguais",
                            isCorrect: true,
                        },
                        {
                            text: "O onboarding novo, que subiu a taxa de cada canal",
                            isCorrect: false,
                        },
                        {
                            text: "A sazonalidade de março em produtos financeiros",
                            isCorrect: false,
                        },
                        {
                            text: "O crescimento da coorte, que passou de 10.000 pessoas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Padronizando março com o mix de fevereiro, o resultado dá 30%. Qual é a conclusão sobre o onboarding?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não há evidência de efeito dentro de cada canal",
                            isCorrect: true,
                        },
                        {
                            text: "Há evidência de ganho de cinco pontos de retenção",
                            isCorrect: false,
                        },
                        {
                            text: "O onboarding piorou a retenção de quem vem de anúncio",
                            isCorrect: false,
                        },
                        {
                            text: "A padronização não se aplica a análise de retenção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A mudança valeu só para Android e o iOS subiu junto no mesmo período. Como interpretar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A explicação está fora da entrega, num fator comum",
                            isCorrect: true,
                        },
                        {
                            text: "A mudança vazou para o iOS por erro de configuração",
                            isCorrect: false,
                        },
                        {
                            text: "O efeito da entrega foi maior do que o previsto antes",
                            isCorrect: false,
                        },
                        {
                            text: "O iOS não serve como comparação em nenhuma análise",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Comunicar a análise",
            blocks: [
                {
                    type: "text",
                    value: "# O resumo de três linhas\n\nA melhor análise do trimestre não vale nada se ela chega como um documento de oito páginas que o decisor abre no celular entre duas reuniões. A forma que sobrevive a esse contexto é o resumo de três linhas: achado, evidência e recomendação, nessa ordem, no topo, antes de qualquer contexto.\n\nAplicado ao caso do módulo: o achado é que a etapa de autorização bancária perde 6.400 das 16.000 pessoas, e o banco C responde por quase metade dessa perda. A evidência é que o banco C autoriza 36% contra 72% e 68% dos outros dois, com 4.800 tentativas no mês. A recomendação é priorizar a correção da integração com o banco C, porque igualar aos 68% do banco B traz 1.536 conexões a mais por mês.\n\nO resto do documento existe para quem quiser descer o nível de detalhe, na ordem inversa da importância: contexto da decisão, evidência completa com tabela e recorte, limitações do que o dado não permite afirmar, e anexo com consulta e definições. Essa estrutura tem um efeito colateral valioso: se você não consegue escrever as três linhas, provavelmente ainda não entendeu o que descobriu, e mais dois dias de análise não vão resolver isso.",
                },
                {
                    type: "table",
                    value: '[["Parte do documento","O que entra ali","Tamanho sugerido"],["Resumo","Achado, evidência e recomendação","Três linhas"],["Contexto","A decisão em jogo e o prazo dela","Um parágrafo"],["Evidência","Números, tabela e recorte usado","Uma página"],["Limitações","O que o dado não permite afirmar","Um parágrafo"],["Anexo","Consulta, definições e método","O que for preciso"]]',
                },
                {
                    type: "quote",
                    value: "Se o achado não cabe em três linhas, o problema raramente é falta de espaço. É que a análise ainda não chegou a uma conclusão que alguém consiga usar.",
                },
                {
                    type: "text",
                    value: "## Gráfico honesto e limitações escritas\n\nAlgumas regras de apresentação evitam engano involuntário. Em gráfico de barras, o eixo começa em zero, sempre, porque a área da barra é lida como quantidade; em série de linha, cortar o eixo é aceitável quando a variação é pequena e o corte está sinalizado. Ordene por valor quando a comparação é o ponto, não em ordem alfabética. Use cor com significado e não para decorar, e escreva o denominador no título: 'conversão entre quem viu a página de planos' custa oito palavras e evita meia hora de discussão.\n\nContexto é obrigatório em todo número. Uma barra sozinha não informa; ao lado do período anterior e da meta, ela informa. E quando a série tem sazonalidade conhecida, compare com o mesmo período do ano anterior, não só com o mês passado.\n\nO parágrafo de limitações é a parte que constrói reputação. Escrever que os números excluem a web, que representa 12% do tráfego, ou que a estimativa de receita supõe conversão histórica, mostra domínio e evita que alguém descubra depois e desconfie do resto. Analista que só apresenta certezas perde credibilidade na primeira vez que erra; analista que declara a incerteza junto do achado é procurado justamente quando a decisão é difícil. No fim, a métrica do ofício não é relatório entregue, é decisão tomada com mais informação do que se teria sem ele.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as três linhas do resumo de uma análise?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Achado, evidência e recomendação, nessa ordem",
                            isCorrect: true,
                        },
                        {
                            text: "Contexto, metodologia e consulta usada no banco",
                            isCorrect: false,
                        },
                        {
                            text: "Objetivo, cronograma e responsável pela entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Hipótese, tamanho de amostra e valor do p-valor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em gráfico de barras, onde o eixo vertical deve começar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Em zero, porque a barra é lida como quantidade",
                            isCorrect: true,
                        },
                        {
                            text: "No menor valor da série, para destacar a variação",
                            isCorrect: false,
                        },
                        {
                            text: "Na média do período, para facilitar a comparação",
                            isCorrect: false,
                        },
                        {
                            text: "No valor da meta, para mostrar quanto falta ainda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O banco C autoriza 36% em 4.800 tentativas contra 72% e 68% dos outros. Qual é o achado em uma linha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O banco C responde por quase metade da perda da etapa",
                            isCorrect: true,
                        },
                        {
                            text: "A etapa de autorização está ruim em todos os bancos",
                            isCorrect: false,
                        },
                        {
                            text: "O fluxo de conexão precisa ser redesenhado por inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "O volume do banco C é pequeno demais para importar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que escrever as limitações da análise fortalece o trabalho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra domínio e evita desconfiança descoberta depois",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz o tempo de leitura do documento pelo decisor",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa a necessidade de anexar a consulta utilizada",
                            isCorrect: false,
                        },
                        {
                            text: "Transfere a responsabilidade da decisão para quem lê",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma métrica com sazonalidade conhecida está sendo apresentada. Com o que ela deve ser comparada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Com o mesmo período do ano anterior, além do mês",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas com o mês anterior, que é o dado mais recente",
                            isCorrect: false,
                        },
                        {
                            text: "Com a média de todos os meses desde o lançamento",
                            isCorrect: false,
                        },
                        {
                            text: "Com o melhor resultado já registrado pelo produto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: o sistema de métricas do Financem",
    aulas: [
        {
            titulo: "O produto e a pergunta",
            blocks: [
                {
                    type: "text",
                    value: "# O Financem em uma página\n\nO Financem é um app brasileiro fictício de finanças pessoais. Ele conecta as contas bancárias da pessoa por open finance, importa e categoriza as transações, mostra um resumo de para onde o dinheiro está indo e manda um aviso semanal com o fechamento. O plano gratuito faz isso; o plano pago de R$ 19,90 por mês acrescenta projeção de saldo, metas por categoria e histórico ilimitado.\n\nO público é adulto entre 25 e 45 anos, renda média, com mais de uma conta e alguma dívida rotativa, e a queixa que ele repete em toda pesquisa é a mesma: não sei para onde vai o meu dinheiro. Isso define o que 'dar certo' significa aqui. Não é a pessoa instalar, não é ela cadastrar cartão, não é nem conectar a conta: é ela olhar o resumo com regularidade e ajustar alguma decisão por causa dele.\n\nEssa frase é o critério que vai eliminar candidatas a north star nas próximas linhas. Toda métrica que sobe sem que ninguém tenha olhado o próprio dinheiro está medindo outra coisa. E toda métrica que exige que a pessoa olhe todo santo dia está medindo um produto que o Financem não é: quem confere finanças diariamente é uma minoria, e forçar esse ritmo seria escolher uma meta que o produto não pode cumprir sem irritar a base inteira.",
                },
                {
                    type: "table",
                    value: '[["Candidata","A favor","Contra","Veredito"],["Usuários ativos semanais","Fácil de medir e explicar","Abrir o app não é receber valor","Fica como métrica de contexto"],["Contas conectadas no total","Mede o setup necessário","Acumulado que só sabe crescer","Vira métrica de entrada"],["Gastos categorizados","Mostra uso real do produto","Boa parte é automática","Vira métrica secundária"],["Assinantes pagantes","Liga direto ao negócio","Sobe com truque de cobrança","Fica como resultado do negócio"],["Semanas com resumo conferido","Largura, profundidade e ritmo","Exige definição cuidadosa","Escolhida como north star"]]',
                },
                {
                    type: "quote",
                    value: "A north star do Financem precisa subir apenas quando alguém olhou para o próprio dinheiro com informação em dia. Qualquer coisa que suba sem isso está medindo outro produto.",
                },
                {
                    type: "text",
                    value: "## A definição escrita da north star\n\nA escolhida é 'semanas com resumo conferido', e a definição completa é esta: número de pares usuário e semana em que a pessoa abriu a tela de resumo tendo pelo menos uma conta sincronizada com sucesso nos sete dias anteriores. Cada usuário contribui com no máximo quatro por mês, e a métrica sobe tanto quando mais gente confere quanto quando a mesma gente confere com mais frequência.\n\nA cláusula da conta sincronizada é o detalhe que faz a métrica funcionar. Sem ela, bastaria empurrar notificação para inflar o número com pessoas abrindo uma tela desatualizada. Com ela, o produto só pontua quando entregou informação nova, que é a promessa original.\n\nMesmo assim, toda métrica pode ser burlada, e vale declarar como. O caminho óbvio seria bombardear notificação até a pessoa abrir. Por isso a north star vem acompanhada de dois guardrails permanentes: taxa de desativação de notificação e taxa de desinstalação, ambas com limite definido antes. Se as duas subirem enquanto a north star sobe, o ganho é falso e precisa ser revertido. Hoje o Financem marca 35.500 semanas conferidas por mês, de um teto de 56.800 se todos os ativos conferissem todas as semanas, ou 62,5% de aproveitamento.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a queixa central do público do Financem?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não saber para onde está indo o próprio dinheiro",
                            isCorrect: true,
                        },
                        {
                            text: "Não conseguir abrir conta em banco digital novo",
                            isCorrect: false,
                        },
                        {
                            text: "Pagar taxas altas demais nas transferências feitas",
                            isCorrect: false,
                        },
                        {
                            text: "Não ter acesso a crédito com juros mais baratos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que 'assinantes pagantes' foi descartada como north star?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela é resultado e sobe com truque de cobrança",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é difícil de medir no sistema de pagamento",
                            isCorrect: false,
                        },
                        {
                            text: "Ela não interessa à diretoria da empresa hoje",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só existe depois do primeiro ano de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a definição exige uma conta sincronizada nos sete dias anteriores ao resumo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem isso, a notificação infla o número sem valor novo",
                            isCorrect: true,
                        },
                        {
                            text: "Sem isso, a ferramenta não consegue contar as semanas",
                            isCorrect: false,
                        },
                        {
                            text: "Sem isso, o evento de resumo não chega ao servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Sem isso, o plano pago deixa de aparecer na análise",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O Financem marca 35.500 semanas conferidas contra um teto de 56.800. Qual é o aproveitamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "62,5%, e sobram 21.300 semanas por conquistar",
                            isCorrect: true,
                        },
                        {
                            text: "37,5%, que é a parte ainda não aproveitada hoje",
                            isCorrect: false,
                        },
                        {
                            text: "160%, porque o teto é menor que o valor medido",
                            isCorrect: false,
                        },
                        {
                            text: "25,0%, porque cada usuário confere uma por mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais guardrails protegem a north star do Financem contra ganho conseguido por insistência?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Desativação de notificação e taxa de desinstalação",
                            isCorrect: true,
                        },
                        {
                            text: "Receita recorrente mensal e ticket médio do plano",
                            isCorrect: false,
                        },
                        {
                            text: "Custo por instalação e retorno sobre a mídia paga",
                            isCorrect: false,
                        },
                        {
                            text: "Tempo de resposta da API e uso de disco no servidor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A árvore de métricas",
            blocks: [
                {
                    type: "text",
                    value: "# Da north star aos times\n\nUma north star sozinha não distribui trabalho. A árvore existe para responder uma pergunta prática: se essa métrica precisa subir, quem faz o quê na segunda-feira? A decomposição do Financem começa por uma multiplicação simples. Semanas com resumo conferido é igual ao número de usuários ativos semanais multiplicado pela média de semanas conferidas por usuário. Hoje são 14.200 usuários e média de 2,5 semanas, o que dá as 35.500 do mês.\n\nO primeiro fator, usuários ativos semanais, é alimentado por três entradas: novos ativados no mês, taxa de retorno semanal de quem já estava e usuários ressuscitados. Cada uma tem um time natural, respectivamente aquisição e ativação, engajamento e ciclo de vida.\n\nO segundo fator, semanas conferidas por usuário, depende de coisas bem diferentes: o resumo semanal precisa ser entregue sem falha, as contas precisam estar sincronizadas na hora certa e o usuário precisa ter contas suficientes conectadas para o resumo dizer algo útil. Isso coloca a plataforma e o time de conexões dentro de uma métrica que, à primeira vista, parecia assunto exclusivo de produto. É esse o valor da árvore: ela mostra que a north star é responsabilidade compartilhada e, ao mesmo tempo, dá a cada time um número que ele controla de verdade.",
                },
                {
                    type: "code",
                    value: "north_star = semanas_com_resumo_conferido        // 35.500 por mes\n\n= usuarios_ativos_semanais x semanas_por_usuario\n         14.200                      2,5\n\nusuarios_ativos_semanais\n  <- novos_ativados_no_mes        9.600     aquisicao e ativacao\n  <- taxa_de_retorno_semanal       62%      engajamento\n  <- ressuscitados_no_mes             96    ciclo de vida\n\nsemanas_por_usuario\n  <- resumo_entregue_sem_falha     94%      plataforma\n  <- contas_sincronizadas_ok       88%      conexoes\n  <- contas_por_usuario            1,4      conexoes\n\n// Teto do mes: 14.200 x 4 = 56.800 semanas possiveis\n// Aproveitamento atual: 35.500 / 56.800 = 62,5%",
                },
                {
                    type: "table",
                    value: '[["Nível","Métrica","Valor atual","Time responsável"],["North star","Semanas com resumo conferido","35.500 por mês","Produto como um todo"],["Fator","Usuários ativos semanais","14.200","Engajamento"],["Fator","Semanas conferidas por usuário","2,5 de 4","Engajamento e plataforma"],["Entrada","Novos ativados no mês","9.600","Aquisição e ativação"],["Entrada","Contas sincronizadas sem erro","88%","Conexões"]]',
                },
                {
                    type: "quote",
                    value: "Árvore de métricas boa dá a cada time um número que ele consegue mover sozinho e deixa visível o momento em que mover esse número está estragando o de outro time.",
                },
                {
                    type: "text",
                    value: "## Metas por time sem quebrar o todo\n\nA árvore permite simular antes de prometer. Se o time de engajamento levar os usuários ativos semanais de 14.200 para 15.620, um ganho de 10%, e a média continuar em 2,5, a north star vai a 39.050. Se em vez disso a média subir de 2,5 para 2,8 com a base parada, o resultado é 39.760. E se as duas coisas acontecerem juntas, o efeito é multiplicativo: 15.620 vezes 2,8 dá 43.736, ou 23,2% acima do ponto de partida.\n\nAgora o cenário que justifica os guardrails cruzados. Suponha que a meta de aquisição seja cumprida com tráfego barato e de baixa intenção: os ativos semanais sobem 20%, para 17.040, mas essas pessoas conferem menos e a média cai de 2,5 para 2,1. A conta dá 35.784, praticamente o mesmo número de antes, depois de um trimestre de trabalho e de verba gasta. A meta local foi batida e o produto não andou.\n\nÉ por isso que cada time recebe sua entrada e também um guardrail que pertence a outro pedaço da árvore. Aquisição responde por volume e observa a média de semanas conferidas da coorte que trouxe. Engajamento responde pela média e observa a taxa de desinstalação. Quando as metas se cruzam assim, a discussão de fim de trimestre deixa de ser sobre quem cumpriu a planilha e passa a ser sobre o que aconteceu com o produto.",
                },
            ],
            questions: [
                {
                    statement: "Como a north star do Financem se decompõe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ativos semanais vezes semanas conferidas por usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Instalações vezes a taxa de conversão em assinatura",
                            isCorrect: false,
                        },
                        {
                            text: "Receita recorrente dividida pelo total de assinantes",
                            isCorrect: false,
                        },
                        {
                            text: "Contas conectadas somadas aos gastos categorizados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual time responde pela métrica de contas sincronizadas sem erro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O time de conexões, dono da integração bancária",
                            isCorrect: true,
                        },
                        {
                            text: "O time de aquisição, dono da verba de mídia paga",
                            isCorrect: false,
                        },
                        {
                            text: "O time de monetização, dono da tela de planos",
                            isCorrect: false,
                        },
                        {
                            text: "O time de ciclo de vida, dono das campanhas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Se os ativos semanais vão de 14.200 para 15.620 e a média fica em 2,5, quanto marca a north star?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "39.050 semanas, um ganho de 10% sobre 35.500",
                            isCorrect: true,
                        },
                        {
                            text: "35.500 semanas, porque a média não se mexeu",
                            isCorrect: false,
                        },
                        {
                            text: "43.736 semanas, contando também a média maior",
                            isCorrect: false,
                        },
                        {
                            text: "56.800 semanas, que é o teto do mês inteiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ativos sobem 20% para 17.040 e a média cai de 2,5 para 2,1. O que acontece com a north star?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fica em 35.784, praticamente parada no mesmo lugar",
                            isCorrect: true,
                        },
                        {
                            text: "Sobe para 42.600, acompanhando o ganho de volume",
                            isCorrect: false,
                        },
                        {
                            text: "Cai para 29.820, porque a média pesa mais que a base",
                            isCorrect: false,
                        },
                        {
                            text: "Sobe para 47.712, somando os dois efeitos do período",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que cada time recebe também um guardrail que pertence a outro ramo da árvore?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Para meta local cumprida não estragar o resultado geral",
                            isCorrect: true,
                        },
                        {
                            text: "Para reduzir o número de métricas acompanhadas no painel",
                            isCorrect: false,
                        },
                        {
                            text: "Para que a diretoria consiga comparar times diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "Para dividir o custo da instrumentação entre as equipes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O plano de instrumentação",
            blocks: [
                {
                    type: "text",
                    value: "# Quinze eventos que cobrem o produto\n\nO plano do Financem tem quinze eventos, e cada um entrou por causa de uma pergunta específica. Eles cobrem o caminho inteiro da north star: chegar, cadastrar, conectar, sincronizar, conferir, categorizar, ser avisado, assinar e cancelar. Nenhum evento de rolagem de tela, nenhum clique de menu, nenhuma métrica de tempo de permanência.\n\nA taxonomia segue o combinado do módulo quatro: objeto seguido de ação no particípio, minúsculas com underline, verbos padronizados. Três eventos merecem atenção especial. O primeiro é conta_conexao_falhou, que carrega banco, código de erro e etapa, e foi ele que permitiu descobrir o problema do banco C. O segundo é resumo_visualizado, com o período, o número de contas ativas e a origem, porque é dele que a north star é calculada. O terceiro é assinatura_cancelada, com motivo e dias de casa, que separa churn voluntário de involuntário.\n\nOs cuidados de privacidade estão embutidos nas propriedades. Nenhum evento carrega CPF, e-mail ou número de conta. O identificador é interno e não significa nada fora dos sistemas do Financem. Valores aparecem em faixa, nunca em reais exatos: um orçamento vira valor_faixa igual a 'de 500 a 1.000', o que responde perfeitamente às perguntas de produto e reduz drasticamente o estrago de qualquer vazamento.",
                },
                {
                    type: "table",
                    value: '[["Evento","Quando dispara","Propriedades principais"],["app_instalado","Primeira abertura após instalar","canal, campanha, plataforma"],["cadastro_iniciado","Abriu o formulário de conta","origem_tela"],["cadastro_concluido","Confirmou o endereço de e-mail","metodo, tempo_segundos"],["conta_conexao_iniciada","Abriu a lista de instituições","origem_tela"],["banco_selecionado","Escolheu a instituição","banco"],["conta_conectada","Autorização retornou sucesso","banco, metodo, tentativas"],["conta_conexao_falhou","Autorização retornou erro","banco, codigo_erro, etapa"],["sincronizacao_concluida","Transações importadas","banco, qtd_transacoes, duracao"],["resumo_visualizado","Abriu a tela de resumo","periodo, contas_ativas, origem"],["gasto_categorizado","Confirmou ou trocou a categoria","categoria, sugerida_ou_manual"],["orcamento_criado","Salvou um orçamento novo","categoria, valor_faixa"],["notificacao_recebida","Resumo semanal foi entregue","tipo, canal"],["planos_visualizado","Abriu a tela de planos","origem_tela"],["assinatura_concluida","Pagamento foi aprovado","plano, meio_pagamento"],["assinatura_cancelada","Cancelamento efetivado","motivo, dias_de_casa"]]',
                },
                {
                    type: "code",
                    value: '{\n  "nome": "resumo_visualizado",\n  "descricao": "Usuario abriu a tela de resumo de gastos",\n  "dispara_quando": "A tela termina de carregar com dados",\n  "dono": "squad-engajamento",\n  "propriedades": [\n    { "nome": "periodo", "tipo": "enum", "valores": ["semana", "mes"] },\n    { "nome": "contas_ativas", "tipo": "inteiro", "obrigatoria": true },\n    { "nome": "dias_desde_sync", "tipo": "inteiro", "obrigatoria": true },\n    { "nome": "origem", "tipo": "enum", "valores": ["notificacao", "direto"] }\n  ],\n  "perguntas_que_responde": [\n    "Quantas semanas com resumo conferido tivemos no mes?",\n    "Quem confere vindo de notificacao volta mais na semana seguinte?"\n  ]\n}',
                },
                {
                    type: "quote",
                    value: "Repare que a propriedade banco, escolhida numa reunião de trinta minutos, foi o que transformou 'a autorização está ruim' numa tarefa com dono, prazo e valor estimado.",
                },
                {
                    type: "text",
                    value: "## O que esses eventos permitem perguntar\n\nCom esses quinze, o funil de conexão sai inteiro: quantos abriram a lista, quantos escolheram um banco, quantos autorizaram e quantos falharam, tudo aberto por instituição. A north star sai de resumo_visualizado combinado com a data da última sincronização, e não precisa de mais nada. A ativação sai de conta_conectada nos primeiros sete dias. E a análise de churn separa voluntário de involuntário pelo motivo em assinatura_cancelada.\n\nDuas perguntas ainda não têm resposta, e vale registrar isso em vez de fingir cobertura total. A primeira é por que a pessoa desiste na tela de autorização do banco, já que aquele passo acontece fora do app e o Financem só enxerga o retorno. A segunda é o que a pessoa faz com a informação do resumo, porque a mudança de comportamento financeiro acontece no mundo, não na tela. As duas exigem pesquisa qualitativa, e nenhum evento vai substituí-la.\n\nO plano também define o que fica de fora por enquanto: rolagem de tela, tempo por seção, abertura de menu e cada toque em filtro. Não é preguiça, é escolha. Se surgir uma pergunta que exija qualquer um desses, ele entra com dono e descrição, como qualquer outro. Enquanto a pergunta não existir, o evento seria custo de coleta, ruído no catálogo e mais uma linha para alguém manter.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual evento permitiu descobrir o problema de autorização do banco C?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "conta_conexao_falhou, que carrega o banco e o erro",
                            isCorrect: true,
                        },
                        {
                            text: "app_instalado, que carrega o canal e a campanha",
                            isCorrect: false,
                        },
                        {
                            text: "resumo_visualizado, que carrega o período aberto",
                            isCorrect: false,
                        },
                        {
                            text: "assinatura_concluida, que carrega o meio de pagamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o plano do Financem trata valores em reais nas propriedades?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Usa faixa de valor em vez do número exato do usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Envia o valor exato, já que o dado não é sensível",
                            isCorrect: false,
                        },
                        {
                            text: "Envia o valor exato apenas para usuários pagantes",
                            isCorrect: false,
                        },
                        {
                            text: "Não registra nenhuma informação ligada a valor em dinheiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De quais eventos a north star do Financem é calculada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "resumo_visualizado junto da última sincronização",
                            isCorrect: true,
                        },
                        {
                            text: "notificacao_recebida junto de cadastro_concluido",
                            isCorrect: false,
                        },
                        {
                            text: "conta_conectada junto de gasto_categorizado",
                            isCorrect: false,
                        },
                        {
                            text: "planos_visualizado junto de assinatura_concluida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o plano deixa de fora rolagem de tela, tempo por seção e toque em filtro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Nenhuma pergunta atual depende deles para ser respondida",
                            isCorrect: true,
                        },
                        {
                            text: "Ferramentas de analytics não conseguem coletar esses dados",
                            isCorrect: false,
                        },
                        {
                            text: "A LGPD proíbe registrar interações dentro de uma tela",
                            isCorrect: false,
                        },
                        {
                            text: "Eventos de interface sempre chegam duplicados ao servidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual pergunta o plano de quinze eventos reconhece que não consegue responder?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Por que a pessoa desiste na tela do próprio banco",
                            isCorrect: true,
                        },
                        {
                            text: "Quantas contas cada usuário conectou no primeiro mês",
                            isCorrect: false,
                        },
                        {
                            text: "Qual canal trouxe os usuários que mais se ativaram",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos cancelamentos vieram de falha na cobrança",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O primeiro mês de dados",
            blocks: [
                {
                    type: "text",
                    value: "# Ler o funil e a coorte na mesma sessão\n\nO mês fechou assim: 40.000 instalações, 24.000 cadastros, 9.600 ativados, 2.880 ainda ativos em 30 dias e 480 assinantes. A coorte, olhada pela coluna do primeiro mês, mostra 30% em janeiro, 33% em fevereiro, 35% em março e 38% em abril. Antes de comemorar essa subida, a disciplina do módulo seis manda checar o mix: a participação da indicação ficou entre 15% e 16% em todos os meses, então a melhora não veio de composição. É real.\n\nAgora os vazamentos. Em números absolutos, o maior é instalação para cadastro, que perde 16.000 pessoas. O segundo é cadastro para ativação, com 14.400. Dentro desse segundo, o funil de conexão localiza o ponto exato: das 16.000 que escolheram um banco, apenas 9.600 autorizaram, e o banco C, com 4.800 tentativas e 36% de autorização contra 68% e 72% dos outros dois, responde por 3.072 das 6.400 perdas dessa etapa.\n\nO terceiro vazamento aparece na semana dois: dos 9.600 ativados, 5.568 voltaram na segunda semana e 4.032 não voltaram nunca mais. É a fronteira entre setup e hábito, exatamente onde o módulo três disse que ela estaria. Três candidatos, e o trabalho agora é escolher dois com justificativa que sobreviva à pergunta 'por que não os outros?'.",
                },
                {
                    type: "table",
                    value: '[["Vazamento","Perda no mês","Evidência disponível","Dono provável"],["Instalação para cadastro","16.000 pessoas","Nenhum recorte explica a maior parte","Aquisição e onboarding"],["Autorização bancária","6.400 pessoas","Banco C com 36% contra 68% e 72%","Conexões"],["Retorno na semana dois","4.032 ativados","42% não voltam após a primeira semana","Engajamento"],["Assinatura do plano pago","2.400 retidos sem assinar","Só 16,7% dos retidos assinam","Monetização"],["Cobrança recusada","180 por mês","30% dos cancelamentos vêm de cartão","Pagamentos"]]',
                },
                {
                    type: "quote",
                    value: "O maior vazamento em número de pessoas nem sempre é o melhor lugar para começar. O melhor lugar combina tamanho, evidência específica e alguém capaz de agir esta semana.",
                },
                {
                    type: "text",
                    value: "## Os dois escolhidos e o descartado\n\nO primeiro escolhido é a autorização bancária. Não é a maior perda em pessoas, mas é a que tem a evidência mais específica: metade do buraco está numa integração identificada, com dono claro e correção de escopo técnico. Igualar o banco C aos 68% do banco B traz 1.536 autorizações a mais por mês, o que depois da etapa de sincronização vira cerca de 1.380 conexões concluídas a mais. Custo estimado em semanas, retorno estimado em conexões que já estavam pagas.\n\nO segundo escolhido é o retorno na semana dois, com 4.032 pessoas que ativaram e sumiram. Aqui a evidência é mais fraca e a hipótese vem do módulo dois: quem conecta duas ou mais contas retém 50%, contra 18% de quem conecta uma. Como só 3.600 dos 24.000 cadastros chegam a duas contas, existe espaço grande e uma hipótese testável, que é justamente o assunto da próxima aula.\n\nO descartado é a maior perda de todas, instalação para cadastro. O motivo é honesto: boa parte dela é intenção baixa comprada na mídia paga, que ativa 10% das suas instalações contra 35% da indicação. Mexer no formulário provavelmente rende pouco; mexer no mix de canal rende mais e é decisão de investimento, não de produto. Registrar essa distinção evita que o time gaste um trimestre otimizando um cadastro que já está razoável para o público certo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a maior perda do funil do Financem em número de pessoas?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Instalação para cadastro, com 16.000 pessoas perdidas",
                            isCorrect: true,
                        },
                        {
                            text: "Cadastro para ativação, com 14.400 pessoas perdidas ali",
                            isCorrect: false,
                        },
                        {
                            text: "Autorização bancária, com 6.400 pessoas perdidas ali",
                            isCorrect: false,
                        },
                        {
                            text: "Retorno na semana dois, com 4.032 pessoas perdidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A coorte melhorou de 30% para 38% no primeiro mês. Que checagem confirma que a melhora é real?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Conferir se o mix de canais ficou estável no período",
                            isCorrect: true,
                        },
                        {
                            text: "Conferir se a base total de usuários também cresceu",
                            isCorrect: false,
                        },
                        {
                            text: "Conferir se a receita recorrente acompanhou a subida",
                            isCorrect: false,
                        },
                        {
                            text: "Conferir se o número de eventos coletados aumentou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dos 9.600 ativados, 5.568 voltaram na semana dois. Qual proporção sumiu logo depois do setup?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "42%, o equivalente a 4.032 pessoas que não voltaram",
                            isCorrect: true,
                        },
                        {
                            text: "58%, o equivalente a 5.568 pessoas que não voltaram",
                            isCorrect: false,
                        },
                        {
                            text: "30%, o equivalente a 2.880 pessoas que não voltaram",
                            isCorrect: false,
                        },
                        {
                            text: "16%, o equivalente a 1.536 pessoas que não voltaram",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a autorização bancária foi escolhida mesmo não sendo a maior perda absoluta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A evidência é específica e existe dono capaz de agir",
                            isCorrect: true,
                        },
                        {
                            text: "A perda dela cresce mais rápido que a das outras etapas",
                            isCorrect: false,
                        },
                        {
                            text: "A etapa é a única que aparece no painel da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "A correção é a mais barata entre todas as candidatas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A mídia paga ativa 10% das instalações e a indicação ativa 35%. Como isso muda o diagnóstico do cadastro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A perda vem de intenção baixa, e não do formulário",
                            isCorrect: true,
                        },
                        {
                            text: "A perda vem do formulário longo demais em celulares",
                            isCorrect: false,
                        },
                        {
                            text: "A perda vem da falta de opção de login com rede social",
                            isCorrect: false,
                        },
                        {
                            text: "A perda vem de erro de coleta no evento de cadastro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Do vazamento ao experimento",
            blocks: [
                {
                    type: "text",
                    value: "# Nem todo vazamento pede um teste\n\nO primeiro vazamento escolhido não vira experimento, e reconhecer isso economiza semanas. A integração com o banco C está quebrada: não existe hipótese comportamental para testar, existe defeito para corrigir. O caminho certo é conserto com liberação gradual e monitoramento, acompanhando a taxa de autorização por instituição a cada passo. Se o número do banco C subir para perto dos 68% do banco B enquanto os outros ficam estáveis, a correção funcionou.\n\nO segundo vazamento é diferente. Ali existe uma hipótese comportamental de verdade, vinda do achado de que quem conecta duas ou mais contas retém 50% contra 18% de quem conecta uma. Como esse achado é correlação e pode ser puro efeito de seleção, ele exige sorteio. É o experimento certo para o caso, e ele fecha o ciclo iniciado no primeiro módulo desta trilha.\n\nA hipótese, escrita no formato do módulo cinco: se sugerirmos a segunda conta imediatamente após a primeira conexão bem-sucedida, a proporção de usuários com duas contas em sete dias sobe de 15% para 20%, porque a confiança da pessoa está no auge no instante em que ela acabou de ver o primeiro sucesso. A métrica primária é única, os guardrails estão declarados e o critério de decisão é escrito antes de ligar o teste.",
                },
                {
                    type: "code",
                    value: "PLANO DO EXPERIMENTO\n\nMudanca ...... sugerir a segunda conta logo apos a primeira conexao\nPrimaria ..... duas contas conectadas em 7 dias (hoje 15%)\nEfeito alvo .. +5 pontos percentuais (de 15% para 20%)\nAmostra ...... n = 16 * 0,15 * 0,85 / 0,0025 = 816 por variante\nFluxo ........ 9.600 ativados por mes = 320 por dia = 160 por grupo\nTempo ........ 816 / 160 = 5,1 dias de amostra, roda 14 dias\nUnidade ...... usuario (nunca sessao)\n\nGuardrails ... falha de conexao, desativacao de notificacao,\n               cancelamento na primeira semana\nSecundaria ... resumo visualizado na semana 2",
                },
                {
                    type: "table",
                    value: '[["Resultado na métrica primária","Guardrails","Decisão combinada antes"],["Ganho de 5 pontos ou mais","Dentro do limite","Lançar para toda a base"],["Ganho de 5 pontos ou mais","Algum guardrail estourado","Não lançar e investigar a causa"],["Ganho entre 2 e 5 pontos","Dentro do limite","Iterar com uma variante nova"],["Ganho abaixo de 2 pontos","Qualquer situação","Descartar e registrar o aprendizado"],["Resultado negativo","Qualquer situação","Reverter e revisar a hipótese"]]',
                },
                {
                    type: "quote",
                    value: "O valor de escrever a decisão antes do resultado aparece justamente quando o resultado decepciona. É nesse momento que a tabela combinada evita três semanas de discussão.",
                },
                {
                    type: "text",
                    value: "## O ciclo que fica\n\nO Financem foi só uma desculpa. O que essa trilha montou foi um ciclo repetível: começar por uma decisão, escolher uma métrica com definição escrita, instrumentar o evento que a alimenta, verificar se o dado é confiável, segmentar antes de concluir, testar quando existe hipótese causal, decidir com critério declarado e medir de novo o que a decisão produziu. Qualquer produto aceita o mesmo tratamento com outros números.\n\nO ritmo que sustenta isso é modesto e semanal: meia hora olhando a north star contra a meta, as entradas de cada time, o funil do caminho principal e a coorte mais recente. Dessa meia hora sai uma pergunta nova, e é a pergunta que puxa a análise da semana. Painel bonito sem pergunta vira enfeite; pergunta boa sem dado vira opinião; e dado sem decisão vira relatório que ninguém lê.\n\nDuas posturas atravessaram todos os módulos e vale levá-las adiante. A primeira é a honestidade aritmética: conferir se as contas fecham, escrever o denominador, mostrar a faixa em vez do ponto quando a incerteza é grande. A segunda é o ceticismo produtivo: desconfiar do gráfico que confirma o que você já queria acreditar, procurar o mix antes de culpar o produto e aceitar que 'provavelmente ajudou, não conseguimos isolar' é uma conclusão legítima. Quem sai daqui com essas duas coisas ganhou mais do que qualquer fórmula que apareceu no caminho.",
                },
            ],
            questions: [
                {
                    statement: "Por que a correção do banco C não precisa de teste A/B?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É defeito para corrigir, não hipótese para testar",
                            isCorrect: true,
                        },
                        {
                            text: "É mudança pequena demais para gerar significância",
                            isCorrect: false,
                        },
                        {
                            text: "É alteração que atinge só uma parte pequena da base",
                            isCorrect: false,
                        },
                        {
                            text: "É trabalho de engenharia e não passa por produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a métrica primária do experimento proposto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Duas contas conectadas em sete dias, hoje em 15%",
                            isCorrect: true,
                        },
                        {
                            text: "Retenção de trinta dias dos ativados, hoje em 30%",
                            isCorrect: false,
                        },
                        {
                            text: "Semanas com resumo conferido, hoje em 35.500 no mês",
                            isCorrect: false,
                        },
                        {
                            text: "Assinaturas concluídas no mês, hoje em 480 pessoas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 320 ativados por dia divididos em dois grupos e 816 por variante, em quantos dias a amostra fecha?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de 5 dias, mas o teste roda por duas semanas",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de 3 dias, e o teste pode parar logo em seguida",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 14 dias, que é a duração mínima obrigatória",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 30 dias, um mês inteiro de coleta de dados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O ganho na métrica primária foi de 6 pontos, mas o cancelamento na primeira semana estourou o limite. O que fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não lançar e investigar por que o guardrail piorou",
                            isCorrect: true,
                        },
                        {
                            text: "Lançar, porque a primária superou o alvo declarado",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar apenas para o segmento que não cancelou tanto",
                            isCorrect: false,
                        },
                        {
                            text: "Estender o teste até o guardrail voltar ao normal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual sequência resume o ciclo de trabalho apresentado ao longo da trilha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Decisão, métrica, evento, verificação, análise e teste",
                            isCorrect: true,
                        },
                        {
                            text: "Painel, relatório, reunião, aprovação e comunicado final",
                            isCorrect: false,
                        },
                        {
                            text: "Coleta, exportação, planilha, gráfico e apresentação",
                            isCorrect: false,
                        },
                        {
                            text: "Instalação, cadastro, ativação, retenção e receita",
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
