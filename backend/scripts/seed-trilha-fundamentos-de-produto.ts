// Seed da trilha Fundamentos de Produto, estagio 1 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-fundamentos-de-produto.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Fundamentos de Produto";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "A porta de entrada da carreira de produto: o que é produto de verdade (outcome sobre output), os papéis de PO, PM e Product Analyst sem mito, como um time de produto funciona, o usuário no centro com JTBD, a base de negócio que todo PM precisa e a comunicação que sustenta tudo.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O que é produto",
    aulas: [
        {
            titulo: "Produto vs projeto",
            blocks: [
                {
                    type: "text",
                    value: "# Projeto termina, produto evolui\n\nPensa em dois pedidos que podem cair na sua mesa: o site de um evento que acontece em novembro e o app de delivery que uma empresa quer manter no ar pelos próximos dez anos. O primeiro é um PROJETO: esforço temporário, com começo, meio e fim, escopo combinado e uma data em que ele acaba. O segundo é um PRODUTO: algo vivo, que resolve um problema recorrente de um grupo de pessoas e que evolui enquanto esse problema existir.\n\nA diferença parece burocrática, mas muda tudo. Projeto é medido por entrega: cumpriu escopo, prazo e orçamento, sucesso. Produto é medido por resultado: alguém usa, o uso resolve o problema, o negócio se sustenta com isso. O site do evento pode ficar perfeito e nunca mais ser tocado. O app de delivery lançado é só o começo: o comportamento dos usuários vai revelar o que funciona, e o time vai ajustar, cortar e reconstruir por anos.\n\nQuem trata produto como projeto entrega, comemora e desmonta o time. Três meses depois, o app está desatualizado, os concorrentes se moveram e não sobrou ninguém pra aprender com o que os usuários estão fazendo ali dentro.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Projeto","Produto"],["Fim","Data de entrega definida","Evolui enquanto o problema existir"],["Sucesso","Escopo, prazo e orçamento","Resultado pro usuário e pro negócio"],["Escopo","Fechado no início","Aposta revisada com feedback"],["Time","Desmontado na entrega","Permanece pra aprender e ajustar"],["Pergunta-chave","Entregamos o combinado?","Estamos resolvendo o problema?"]]',
                },
                {
                    type: "quote",
                    value: "Projeto acaba quando entrega. Produto começa quando entrega: é ali que o usuário aparece e as suas hipóteses vão a teste.",
                },
                {
                    type: "text",
                    value: "## Por que a mentalidade muda tudo\n\nImagina um banco digital que encomenda um 'cadastro em três passos' pra um time. O time entrega no prazo, dentro do orçamento, pixel perfeito. Na lógica de projeto, festa. Aí os dados chegam: 70% das pessoas abandonam no segundo passo. Na lógica de produto, isso não é sucesso, é o começo do trabalho: por que abandonam? O que pedimos cedo demais? O que dá pra cortar?\n\nEssa mentalidade muda como você planeja. O roadmap deixa de ser contrato ('em março entregamos X') e vira sequência de apostas ('acreditamos que X reduz o abandono; se não reduzir, mudamos o plano'). Muda como você mede: menos 'entregas do trimestre', mais 'o que mudou no comportamento de quem usa'. E muda como a empresa investe: produto pede time estável, porque o conhecimento sobre o usuário mora nas pessoas que acompanham o dia a dia.\n\nAo longo desta trilha, essa é a lente. Você vai ver papéis, times, usuários, negócio e comunicação, sempre com a mesma pergunta de fundo: isso está fazendo o produto gerar resultado, ou só gerando entrega bonita de acompanhar em relatório?",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença essencial entre projeto e produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Projeto tem fim definido; produto evolui enquanto viver",
                            isCorrect: true,
                        },
                        {
                            text: "Projeto envolve tecnologia; produto envolve só o comercial",
                            isCorrect: false,
                        },
                        {
                            text: "Produto é sempre maior, mais caro e mais demorado que projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Projeto é do gerente; produto pertence apenas aos engenheiros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na lógica de projeto, o que define sucesso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cumprir o escopo combinado dentro do prazo e do orçamento",
                            isCorrect: true,
                        },
                        {
                            text: "Fazer o usuário voltar a usar o sistema todas as semanas",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a receita da empresa já no primeiro mês após o fim",
                            isCorrect: false,
                        },
                        {
                            text: "Manter o time completo trabalhando junto por vários anos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time entregou a feature no prazo, mas 70% dos usuários abandonam o fluxo. Como a mentalidade de produto avalia isso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como o começo do trabalho: falta entender e reduzir o abandono",
                            isCorrect: true,
                        },
                        {
                            text: "Como sucesso completo, porque o combinado foi entregue no prazo",
                            isCorrect: false,
                        },
                        {
                            text: "Como um problema exclusivo do marketing, que atraiu gente errada",
                            isCorrect: false,
                        },
                        {
                            text: "Como prova de que o projeto precisava de mais orçamento inicial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o roadmap de produto funciona melhor como aposta do que como contrato?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque o plano é revisado conforme o uso real ensina o time",
                            isCorrect: true,
                        },
                        {
                            text: "Porque contratos de software são proibidos em empresas ágeis",
                            isCorrect: false,
                        },
                        {
                            text: "Porque apostas dispensam qualquer tipo de planejamento formal",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a diretoria nunca deve conhecer as datas planejadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A diretoria quer desmontar o time do app logo após o lançamento, como faria num projeto. Qual é o principal risco?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O produto para de evoluir e ninguém aprende com o uso real",
                            isCorrect: true,
                        },
                        {
                            text: "Os servidores do aplicativo são desligados de forma automática",
                            isCorrect: false,
                        },
                        {
                            text: "O código-fonte se perde porque projetos não usam versionamento",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa fica impedida por lei de lançar novos aplicativos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Outcome sobre output",
            blocks: [
                {
                    type: "text",
                    value: "# Feature entregue não é valor\n\nNo fim do trimestre, o time comemora: doze features entregues, release notes lotado, demo bonita pra diretoria. Aí alguém abre o painel: retenção parada, conversão parada, suporte recebendo os mesmos chamados de sempre. Muito OUTPUT, nenhum OUTCOME.\n\nOutput é o que o time produz: telas, features, lançamentos, linhas de código. Outcome é a mudança que isso causa no mundo: o usuário que passa a resolver o problema mais rápido, o cliente que para de cancelar, a operação que para de depender de planilha. Output está sob seu controle direto; outcome é a consequência que você persegue e que o mundo precisa confirmar.\n\nUm exemplo pra fixar. Num app de banco digital, 'permitir personalizar a cor do cartão virtual' é output. O outcome pretendido talvez fosse 'mais gente ativa o cartão e passa a usá-lo como principal'. Se a personalização for lançada e a ativação não se mover, houve entrega sem valor. Se a ativação subir sem nenhuma feature nova, por exemplo só reordenando a tela inicial, houve valor com pouquíssima entrega. O placar do jogo é o segundo, não o primeiro.",
                },
                {
                    type: "table",
                    value: '[["Situação","Output","Outcome buscado"],["E-commerce com busca ruim","Filtro novo de busca","Mais gente encontra e compra"],["Suporte lotado de chamados","Central de ajuda no app","Menos chamados repetidos"],["Cadastro com abandono","Fluxo reduzido a 2 passos","Mais contas chegam ao fim"],["Entregas atrasando","Painel de rastreamento","Menos ansiedade e cancelamento"]]',
                },
                {
                    type: "quote",
                    value: "Ninguém acorda querendo usar a sua feature. As pessoas querem progresso na vida delas; a feature é só o meio de transporte.",
                },
                {
                    type: "text",
                    value: "## Como reconhecer cada um no dia a dia\n\nO teste é uma pergunta: 'se isso der certo, o que muda no comportamento de quem usa?'. Se a resposta descreve a entrega ('teremos o chat no app'), você está falando de output. Se descreve mudança observável ('o cliente resolve sozinho em minutos o que hoje espera horas'), é outcome.\n\nO perigo do output é que ele é confortável: é visível, fotografável, cabe em relatório. Nasce daí o teatro de entrega: times ocupadíssimos, gráficos de velocidade subindo, e o negócio parado no mesmo lugar. A saída não é parar de entregar; é amarrar cada entrega a um resultado esperado ANTES de construir, e voltar pra conferir se a ponte aconteceu depois do lançamento.\n\nCuidado com o outro extremo: outcome sem output também não existe. Resultado vem de entrega que funcionou; um PM que só fala de métrica e não ajuda o time a colocar nada no ar também não move o placar. A regra prática que você leva desta aula: metas escritas como outcome, trabalho diário organizado em outputs, e a honestidade de checar a ligação entre os dois todo mês.",
                },
            ],
            questions: [
                {
                    statement: "O que é output?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aquilo que o time entrega: features, telas e lançamentos",
                            isCorrect: true,
                        },
                        {
                            text: "A mudança de comportamento observada nos usuários do produto",
                            isCorrect: false,
                        },
                        {
                            text: "O lucro líquido gerado pela empresa ao longo do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de usuários ativos registrada todos os meses",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é outcome?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A mudança de resultado ou comportamento causada pelo uso",
                            isCorrect: true,
                        },
                        {
                            text: "O número total de features publicadas dentro do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "O documento que descreve o escopo combinado com o cliente",
                            isCorrect: false,
                        },
                        {
                            text: "A soma de linhas de código produzidas pelo time no período",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Doze features entregues no trimestre e nenhuma métrica se moveu. O que esse cenário ilustra?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Output alto com outcome zero: entrega que não virou valor",
                            isCorrect: true,
                        },
                        {
                            text: "Outcome alto com output zero: valor gerado sem nenhuma entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Um trimestre saudável, pois entregar já comprova o valor gerado",
                            isCorrect: false,
                        },
                        {
                            text: "Falta de output, já que as métricas dependem de mais features",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual pergunta ajuda a distinguir output de outcome ao planejar uma feature?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Se isso der certo, o que muda no comportamento de quem usa?",
                            isCorrect: true,
                        },
                        {
                            text: "Quantos pontos de esforço o time estima pra essa entrega?",
                            isCorrect: false,
                        },
                        {
                            text: "Qual tecnologia nova o time vai poder aprender construindo?",
                            isCorrect: false,
                        },
                        {
                            text: "Em qual sprint essa feature consegue entrar sem atrasar nada?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um PM diz que só se importa com outcome e se recusa a discutir entregas com o time. Qual é o problema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Outcome nasce de entrega que funciona; sem output nada muda",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: discutir entrega é tarefa exclusiva da engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "O problema é de hierarquia, pois entrega é assunto de diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Outcome e output são sinônimos, então a recusa é só de nome",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O ciclo de vida do produto",
            blocks: [
                {
                    type: "text",
                    value: "# Quatro fases, quatro jogos diferentes\n\nProduto tem ciclo de vida, e cada fase é um jogo com regras próprias. Na INTRODUÇÃO, o produto acabou de nascer e ainda procura seu encaixe: poucos usuários, muita incerteza, mudanças bruscas de direção são normais e até saudáveis. No CRESCIMENTO, o encaixe apareceu e a demanda puxa: o desafio vira escalar sem quebrar, repetir o que funciona, abrir canais. Na MATURIDADE, o crescimento desacelera: a briga passa a ser eficiência, margem e defesa da posição contra concorrentes. No DECLÍNIO, o uso cai de forma consistente: a decisão honesta é reinventar, colher o que resta ou desligar com dignidade.\n\nPensa num app de caronas urbanas. No início, o time muda o produto toda semana atrás do formato que faz motorista e passageiro voltarem. Quando encontra, o jogo vira cobertura de bairros e tempo de espera. Anos depois, com o mercado disputado, vira preço, eficiência e programa de fidelidade. Se um novo modal tomar o lugar, vira decisão de portfólio. Mesmo produto, quatro trabalhos completamente diferentes, e o time que não percebe a virada joga o jogo errado.",
                },
                {
                    type: "table",
                    value: '[["Fase","Sinal típico","Foco do time"],["Introdução","Poucos usuários, muita incerteza","Aprender rápido e achar o encaixe"],["Crescimento","Demanda puxando, canais abrindo","Escalar sem quebrar o que funciona"],["Maturidade","Crescimento lento, margem em foco","Eficiência, retenção e defesa"],["Declínio","Queda consistente de uso","Reinventar, colher ou desligar"]]',
                },
                {
                    type: "quote",
                    value: "Gerir produto maduro como se fosse novo queima dinheiro; gerir produto novo como se fosse maduro mata a descoberta. Errar a fase é errar tudo que vem depois.",
                },
                {
                    type: "text",
                    value: "## O que o time faz diferente em cada fase\n\nNa introdução, a virtude é jogar fora sem dó: o objetivo é aprender, então funcionalidades, telas e até o público-alvo podem mudar. Métricas de escala (receita, participação de mercado) dizem pouco; o que importa é sinal de valor: alguém volta? Recomenda? Sente falta quando o app sai do ar?\n\nNo crescimento, a virtude se inverte: disciplina pra NÃO quebrar o que funciona. Experimentos continuam, mas protegendo o núcleo que sustenta a demanda. Surgem gargalos de operação e suporte, o time cresce, e boa parte do trabalho vira coordenação entre gente nova.\n\nNa maturidade, otimização composta: melhorias de 2% que somam, novos segmentos pro mesmo motor, corte do custo de servir. É a fase em que a dívida acumulada cobra juros, e onde muitos times erram por tédio: inventam features que ninguém pediu só pra sentir movimento.\n\nNo declínio, honestidade: reconhecer a queda cedo, entender se ela é do produto ou da categoria inteira, e decidir com dados. Migrar usuários com respeito também é trabalho de produto. Saber em que fase o seu produto está é o primeiro diagnóstico de qualquer decisão.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as quatro fases do ciclo de vida do produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Introdução, crescimento, maturidade e declínio",
                            isCorrect: true,
                        },
                        {
                            text: "Ideação, prototipagem, homologação e manutenção",
                            isCorrect: false,
                        },
                        {
                            text: "Descoberta, planejamento, execução e encerramento",
                            isCorrect: false,
                        },
                        {
                            text: "Alfa, beta, lançamento oficial e suporte estendido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o foco principal do time na fase de introdução?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aprender rápido e encontrar o encaixe do produto",
                            isCorrect: true,
                        },
                        {
                            text: "Maximizar a margem de lucro de cada transação feita",
                            isCorrect: false,
                        },
                        {
                            text: "Defender a posição contra os concorrentes maiores",
                            isCorrect: false,
                        },
                        {
                            text: "Escalar a operação pra atender a demanda crescente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na fase de crescimento, por que a disciplina de proteger o núcleo se torna central?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque quebrar o que já funciona custa a demanda conquistada",
                            isCorrect: true,
                        },
                        {
                            text: "Porque experimentos passam a ser proibidos depois do encaixe",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time fica pequeno demais pra tocar qualquer mudança",
                            isCorrect: false,
                        },
                        {
                            text: "Porque nessa fase os usuários param de dar qualquer feedback",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time de produto maduro lança features que ninguém pediu 'pra sentir movimento'. Qual erro de fase é esse?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tratar produto maduro como novo, em vez de otimizar e defender",
                            isCorrect: true,
                        },
                        {
                            text: "Tratar produto novo como maduro, cortando toda a descoberta",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum erro: maturidade exige lançar o máximo possível de novidade",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro de declínio, pois lançar features acelera o desligamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O uso do produto cai há seis trimestres. Qual é a postura profissional do time?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Entender se a queda é do produto ou da categoria e decidir",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o investimento em marketing até a curva subir de novo",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar a queda, pois todo produto oscila naturalmente",
                            isCorrect: false,
                        },
                        {
                            text: "Esconder os números da diretoria até ter um plano pronto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Tipos de produto",
            blocks: [
                {
                    type: "text",
                    value: "# B2C, B2B, marketplace, plataforma e interno\n\nDizer 'trabalho com produto' é como dizer 'trabalho com esporte': o jogo muda completamente conforme o tipo. Em B2C (direto pro consumidor, como um app de delivery ou de streaming), você lida com volume: milhões de usuários, decisão de uso rápida e emocional, ciclos curtos de experimento. Em B2B (empresas vendendo pra empresas, como um sistema de gestão pra restaurantes), são poucos clientes de alto valor, ciclo de venda longo, e uma pegadinha central: quem USA o produto raramente é quem ASSINA o contrato.\n\nMarketplace conecta dois lados, quem vende e quem compra, como num Mercado Livre da vida, e herda o problema do ovo e da galinha: sem oferta não vem demanda, sem demanda não vem oferta. Plataforma e API têm desenvolvedor como usuário: a documentação é a interface, e estabilidade vale mais que novidade. Produto interno atende a própria empresa: o usuário é cativo, o que tenta justificar experiência ruim, e o sucesso se mede em produtividade da operação, não em receita direta.",
                },
                {
                    type: "table",
                    value: '[["Tipo","Quem decide usar","Desafio central"],["B2C","O próprio usuário","Ganhar atenção e criar hábito em escala"],["B2B","Comprador que não é o usuário","Servir quem usa e quem assina ao mesmo tempo"],["Marketplace","Dois lados ao mesmo tempo","Equilibrar oferta e demanda"],["Plataforma/API","Desenvolvedores","Estabilidade, documentação e confiança"],["Interno","A empresa impõe","Manter qualidade mesmo com usuário cativo"]]',
                },
                {
                    type: "quote",
                    value: "Em B2B, quem sofre com o produto raramente é quem assina o contrato. Confundir os dois é a origem de muito software odiado.",
                },
                {
                    type: "text",
                    value: "## O que muda pra quem faz produto\n\nO tipo de produto define suas ferramentas. Em B2C, dados quantitativos mandam: com milhões de usuários, teste A/B e funil são o dia a dia, e cada segundo de atrito importa. Em B2B, você conhece clientes pelo nome: pesquisa é conversa profunda, o roadmap sofre pressão de contratos ('o cliente grande pediu'), e dizer não exige jogo político. No marketplace, cada decisão precisa ser pensada duas vezes, uma pra cada lado: baixar a comissão agrada quem vende e pode piorar o serviço de quem compra.\n\nEm plataforma, seu usuário lê changelog: quebrar compatibilidade é o pecado capital, e a métrica de sucesso inclui o sucesso dos OUTROS produtos construídos sobre o seu. No produto interno, a tentação é pular pesquisa ('a gente já sabe o que a operação precisa'); os melhores times tratam colegas como clientes, com onboarding, métrica e roadmap de verdade.\n\nNenhum tipo é superior. Mas saber qual é o seu muda o que você mede, como pesquisa e com quem negocia. Nas vagas em 2026, a distinção aparece já no título: PM de marketplace, PM de plataforma, PM B2B.",
                },
            ],
            questions: [
                {
                    statement: "Num produto B2B, qual é a pegadinha clássica sobre usuários?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem usa o produto raramente é quem assina o contrato",
                            isCorrect: true,
                        },
                        {
                            text: "Os usuários de empresas nunca dão feedback sobre nada",
                            isCorrect: false,
                        },
                        {
                            text: "O volume de usuários é sempre maior que no mercado B2C",
                            isCorrect: false,
                        },
                        {
                            text: "Os contratos impedem qualquer tipo de pesquisa com o cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o problema do ovo e da galinha em marketplaces?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem oferta não vem demanda; sem demanda não vem oferta",
                            isCorrect: true,
                        },
                        {
                            text: "Sem aplicativo não há site; sem site não há aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Vendedores e compradores exigem comissões cada vez menores",
                            isCorrect: false,
                        },
                        {
                            text: "O primeiro lado a entrar no marketplace sempre sai no lucro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que estabilidade vale mais que novidade num produto de plataforma ou API?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Produtos de terceiros dependem dele; quebra afeta todos",
                            isCorrect: true,
                        },
                        {
                            text: "Porque desenvolvedores não gostam de aprender recursos novos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque APIs estáveis dispensam documentação e suporte técnico",
                            isCorrect: false,
                        },
                        {
                            text: "Porque novidades em plataformas são proibidas por contrato",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o risco típico de um produto interno?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usuário cativo virar desculpa pra experiência ruim",
                            isCorrect: true,
                        },
                        {
                            text: "A receita do produto cair junto com o mercado externo",
                            isCorrect: false,
                        },
                        {
                            text: "O excesso de concorrência direta dentro da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Os usuários migrarem pro concorrente sem avisar o time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um marketplace estuda baixar a comissão pra atrair vendedores. Que análise o tipo de produto exige?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Avaliar o efeito nos dois lados, não só em quem vende",
                            isCorrect: true,
                        },
                        {
                            text: "Aplicar a mudança logo, pois comissão menor sempre ajuda",
                            isCorrect: false,
                        },
                        {
                            text: "Consultar apenas os compradores, que são o lado que paga",
                            isCorrect: false,
                        },
                        {
                            text: "Ignorar a comissão, que não influencia nenhum dos lados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Onde produto vive na empresa",
            blocks: [
                {
                    type: "text",
                    value: "# A função que conecta\n\nProduto não constrói, não desenha, não vende e não atende: produto CONECTA. O valor do papel está em fazer engenharia, design, marketing, vendas e suporte puxarem na mesma direção, cada área com a sua lente. Com ENGENHARIA, a conversa é viabilidade e custo: o que dá pra construir, em quanto tempo, com quais riscos. Com DESIGN, é desejabilidade e usabilidade: as pessoas entendem, conseguem e querem usar. Esses dois, junto com produto, formam o trio que você vai destrinchar no módulo 3.\n\nCom MARKETING, a conversa é posicionamento e aquisição: que história o mercado vai ouvir, por qual canal, e se o produto entrega a promessa da campanha. Com VENDAS, é promessa e contrato: o que foi vendido precisa existir, e o que existe precisa ser vendível; quando vendas promete o que não existe, o produto vira refém do improviso. Com SUPORTE, é a verdade nua: nenhuma pesquisa revela tanto sobre o produto quanto a fila de chamados de uma segunda-feira qualquer. Quem trabalha com produto circula entre essas cinco conversas todos os dias.",
                },
                {
                    type: "table",
                    value: '[["Área","O que ela traz","Conversa típica com produto"],["Engenharia","Viabilidade técnica e custo","O que construir e a que preço"],["Design","Usabilidade e desejo","O usuário entende e quer isso?"],["Marketing","Posicionamento e aquisição","Que promessa vamos fazer ao mercado?"],["Vendas","Receita e contratos","O que foi prometido existe?"],["Suporte","A dor real do dia a dia","O que mais gera chamado hoje?"]]',
                },
                {
                    type: "quote",
                    value: "O suporte sabe antes de todo mundo quando o produto piorou. Time de produto que não lê chamado está pesquisando de olhos fechados.",
                },
                {
                    type: "text",
                    value: "## Influência sem autoridade\n\nAqui vai a verdade que derruba muita gente na primeira semana: produto não é chefe de ninguém. Engenharia responde a um gestor de engenharia, design a um de design, marketing a outro. Você coordena sem mandar, e a sua moeda é contexto: quem entende o problema, o usuário e o negócio consegue alinhar gente que não deve nada a você.\n\nUm cenário clássico de falha: o time prepara um lançamento por dois meses e avisa o marketing na véspera. Resultado: campanha improvisada, suporte pego de surpresa, vendas descobrindo a novidade pelo cliente. O lançamento tecnicamente perfeito vira fracasso comercial. A lição não é 'faça mais reunião'; é: as áreas que vão carregar o seu produto precisam entrar cedo o suficiente pra influenciar, não só pra executar.\n\nNa prática, produto vive de tradução: transformar meta de negócio em problema pro time, dado de suporte em prioridade, restrição técnica em conversa honesta com a diretoria. Se você gosta de ter razão sozinho, o papel machuca. Se gosta de fazer um sistema de pessoas funcionar, é o melhor lugar da empresa pra se estar.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a relação hierárquica do PM com engenharia e design?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Nenhuma: produto coordena sem ser chefe dessas áreas",
                            isCorrect: true,
                        },
                        {
                            text: "O PM é o gestor direto de engenheiros e designers",
                            isCorrect: false,
                        },
                        {
                            text: "O PM responde ao líder técnico do time de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Engenharia e design são subordinados da área de produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a fila do suporte é valiosa pra produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela mostra a dor real dos usuários sem filtro",
                            isCorrect: true,
                        },
                        {
                            text: "Ela define sozinha o roadmap do próximo semestre",
                            isCorrect: false,
                        },
                        {
                            text: "Ela substitui qualquer conversa direta com usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Ela mede com precisão a receita gerada pelo produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Vendas fechou contrato prometendo uma feature que não existe. O que esse cenário revela?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Falta de alinhamento cedo entre produto e vendas",
                            isCorrect: true,
                        },
                        {
                            text: "Que vendas deve parar de conversar com os clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Que o produto precisa esconder o roadmap de vendas",
                            isCorrect: false,
                        },
                        {
                            text: "Um sucesso: agora o time tem prazo claro pra entregar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a principal moeda de influência de quem trabalha com produto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contexto: domínio do problema, do usuário e do negócio",
                            isCorrect: true,
                        },
                        {
                            text: "Autoridade formal garantida pelo organograma da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Controle direto sobre o orçamento de todas as áreas",
                            isCorrect: false,
                        },
                        {
                            text: "Amizade pessoal com os diretores mais influentes da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um lançamento tecnicamente perfeito fracassou porque marketing e suporte souberam na véspera. Qual é a lição?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Envolver cedo as áreas que carregam o produto ao mercado",
                            isCorrect: true,
                        },
                        {
                            text: "Adiar lançamentos até o marketing criar a campanha ideal",
                            isCorrect: false,
                        },
                        {
                            text: "Transferir o time de marketing pra dentro da engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Lançar sem avisar ninguém pra evitar vazamento de informação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Os papéis sem mito",
    aulas: [
        {
            titulo: "Product Manager: dono do problema",
            blocks: [
                {
                    type: "text",
                    value: "# Dono do problema, não do backlog\n\nPergunta pra dez pessoas o que um Product Manager faz e você recebe dez respostas, quase todas erradas. A definição que sustenta esta trilha: o PM é o DONO DO PROBLEMA. Ele responde por garantir que o time está resolvendo algo que importa pro usuário e pro negócio, e que a solução escolhida tem chance real de funcionar. O backlog, o quadro de tarefas e o cronograma são consequências; o problema é a origem.\n\nO dia a dia real é menos glamouroso que o LinkedIn sugere: conversar com usuários e stakeholders, escrever (muito), analisar dados pra entender o que está acontecendo, priorizar com informação incompleta e alinhar gente que discorda. A decisão raramente é 'qual feature é genial'; quase sempre é 'dado o que sabemos hoje, qual problema atacamos primeiro e o que deixamos de fazer'.\n\nRepara no verbo: decidir com informação incompleta. Se você espera certeza pra agir, produto vai ser desconfortável. O PM profissional constrói o máximo de contexto possível no tempo disponível, decide, comunica o porquê e se responsabiliza por corrigir o rumo quando o dado novo chegar.",
                },
                {
                    type: "table",
                    value: '[["Mito","Realidade"],["PM é o mini-CEO do produto","PM influencia sem autoridade; CEO manda"],["PM é chefe do time","Engenharia e design têm gestores próprios"],["PM é gerente de projeto","Prazo é meio; o fim é resultado no uso"],["PM define tudo sozinho","Decide junto com o trio e com dados"],["PM precisa programar","Precisa conversar tecnicamente, não codar"]]',
                },
                {
                    type: "quote",
                    value: "PM não é chefe do time. É a pessoa que garante que o time está gastando a vida resolvendo um problema que vale a pena.",
                },
                {
                    type: "text",
                    value: "## O que o PM NÃO é\n\nTrês desvios aparecem em toda empresa. O GERENTE DE PROJETO DISFARÇADO: vive de cronograma, cobra status, mede sucesso por entrega no prazo. Útil? Às vezes. Mas se ninguém está cuidando de qual problema resolver, o time entrega rápido a coisa errada. O SECRETÁRIO DE BACKLOG: anota pedidos de stakeholders, transforma em tickets e repassa pro time, sem filtro nem critério. Vira um garçom de features, e o produto vira a soma dos pedidos de quem grita mais alto. E o MINI-CEO: acredita no mito, tenta mandar, e descobre da pior forma que ninguém deve obediência a ele.\n\nO antídoto pros três é o mesmo: voltar pro problema. Quando alguém pedir uma feature, pergunte que problema ela resolve e pra quem. Quando cobrarem prazo, mostre o resultado que a data compra ou sacrifica. Quando sentir vontade de mandar, lembre que a sua força é o contexto que você carrega, não o cargo. Nos próximos módulos você vai ver as ferramentas; nenhuma delas funciona sem essa postura de dono do problema.",
                },
            ],
            questions: [
                {
                    statement: "Segundo a aula, o PM é dono de quê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Do problema a resolver, não do backlog de tarefas",
                            isCorrect: true,
                        },
                        {
                            text: "Do backlog, do cronograma e das férias do time",
                            isCorrect: false,
                        },
                        {
                            text: "Da infraestrutura técnica que roda o produto",
                            isCorrect: false,
                        },
                        {
                            text: "Do orçamento de marketing da empresa inteira",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o mito do PM como 'mini-CEO' erra?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "CEO manda; PM influencia sem autoridade sobre o time",
                            isCorrect: true,
                        },
                        {
                            text: "CEOs não participam de decisões sobre os produtos",
                            isCorrect: false,
                        },
                        {
                            text: "PMs ganham mais que CEOs na maioria das empresas",
                            isCorrect: false,
                        },
                        {
                            text: "O termo correto seria mini-CFO, focado em finanças",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual dupla de atividades melhor descreve o dia a dia real de um PM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Conversar pra alinhar e decidir com informação incompleta",
                            isCorrect: true,
                        },
                        {
                            text: "Programar as features e revisar o código dos engenheiros",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovar férias do time e conduzir avaliações de desempenho",
                            isCorrect: false,
                        },
                        {
                            text: "Desenhar todas as telas e escrever o material de vendas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que tratar o PM como gerente de projeto empobrece o papel?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O foco vira prazo e escopo, não o resultado do produto",
                            isCorrect: true,
                        },
                        {
                            text: "Gerentes de projeto são proibidos em empresas de software",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cronogramas nunca funcionam em nenhum contexto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o PM perde o direito de participar das cerimônias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time comenta: 'nosso PM só anota pedidos dos stakeholders e repassa'. Que desvio é esse?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Virou secretário de backlog, sem dono do problema",
                            isCorrect: true,
                        },
                        {
                            text: "Virou mini-CEO, concentrando poder demais nas decisões",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: repassar pedidos é a definição correta do papel",
                            isCorrect: false,
                        },
                        {
                            text: "Virou gerente de engenharia, focado demais na técnica",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Product Owner na prática brasileira",
            blocks: [
                {
                    type: "text",
                    value: "# De papel do Scrum a cargo de mercado\n\nProduct Owner nasceu dentro do Scrum: é o papel responsável por maximizar o valor do trabalho do time, dono do Product Backlog, quem ordena os itens e aceita (ou não) o que foi construído. No manual, PO não é um cargo na carreira; é uma função dentro do framework, e uma pessoa com o cargo de Product Manager poderia exercê-la.\n\nO mercado brasileiro, porém, transformou o título em cargo, e em 2026 a confusão continua firme nas vagas. No uso mais comum por aqui, PO descreve alguém mais próximo do delivery: refina backlog com o time, escreve user stories, tira dúvida de regra de negócio, valida entrega. PM descreve alguém mais próximo da estratégia: descobre problemas, fala com o mercado, define direção e métricas. Em muitas empresas os dois papéis convivem em camadas; em outras, é a mesma pessoa com o título que o RH escolheu naquele ano.\n\nA divisão 'PM cuida do porquê e do quê, PO cuida do como e do quando junto ao time' é um resumo honesto do uso brasileiro, desde que você lembre: é um retrato do mercado, não uma lei.",
                },
                {
                    type: "code",
                    value: "USER STORY (formato clássico)\n\nComo cliente que recebeu o pedido errado,\nquero solicitar reembolso direto pelo app,\npara resolver sem precisar ligar pro suporte.\n\nCriterios de aceite:\n- Pedido elegivel aparece com botao 'Pedir reembolso'\n- Cliente escolhe motivo em lista (item errado, faltando, avariado)\n- Confirmacao mostra prazo e valor a devolver\n- Caso fora da politica cai em revisao manual com aviso claro",
                },
                {
                    type: "table",
                    value: '[["Dimensão","PO (uso comum no Brasil)","PM"],["Horizonte","Sprint e trimestre","Trimestre e ano"],["Foco","Refinar, detalhar, aceitar","Descobrir, priorizar, medir"],["Conversa mais frequente","Time de desenvolvimento","Usuários e stakeholders"],["Pergunta típica","Isso está pronto pra entrar?","Isso vale a pena ser feito?"]]',
                },
                {
                    type: "quote",
                    value: "Em entrevista, ignore o título e pergunte pelo escopo: quem descobre o problema, quem decide a prioridade, quem fala com o usuário. A resposta diz o que a vaga é de verdade.",
                },
                {
                    type: "text",
                    value: "## Como navegar os títulos sem se perder\n\nNa prática, o que importa é o ESCOPO REAL do papel, e ele varia por empresa, não por título. Há POs no Brasil fazendo descoberta e estratégia de altíssimo nível, e há PMs que passam o dia inteiro escrevendo ticket. Por isso, ao avaliar uma vaga ou se apresentar, descreva o que você FAZ: 'descobri o problema X conversando com N clientes, priorizei contra Y, o resultado foi Z'. Isso comunica senioridade em qualquer vocabulário.\n\nUma ferramenta do dia a dia associada ao papel de PO merece atenção: a user story. O formato 'como [persona], quero [ação], para [benefício]' não é burocracia; é um lembrete de que toda entrega tem um usuário e um valor esperado. A parte mais negligenciada é o 'para': sem o benefício explícito, o time não tem como questionar a solução nem propor caminho melhor. Story boa cabe numa conversa; os critérios de aceite delimitam o que 'pronto' significa. Se a story vira um contrato de dez páginas, o espírito se perdeu no caminho.",
                },
            ],
            questions: [
                {
                    statement: "De onde vem o papel de Product Owner?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Do Scrum, como responsável por maximizar o valor do backlog",
                            isCorrect: true,
                        },
                        {
                            text: "Do marketing, como responsável pelas campanhas do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Da engenharia, como liderança técnica das entregas do time",
                            isCorrect: false,
                        },
                        {
                            text: "Do design, como pessoa guardiã da experiência do usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No uso comum do mercado brasileiro, o título de PO costuma indicar o quê?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Atuação mais próxima do delivery e do dia a dia do time",
                            isCorrect: true,
                        },
                        {
                            text: "A pessoa dona da estratégia de longo prazo da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "O gestor direto dos engenheiros que trabalham no squad",
                            isCorrect: false,
                        },
                        {
                            text: "Um papel exclusivo de agências e de consultorias externas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na divisão mais comum no Brasil, o que separa PM de PO na prática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "PM foca no porquê e no quê; PO foca no como e no quando",
                            isCorrect: true,
                        },
                        {
                            text: "PM cuida do backend e PO cuida do frontend do produto",
                            isCorrect: false,
                        },
                        {
                            text: "PM trabalha remoto e PO precisa estar sempre no escritório",
                            isCorrect: false,
                        },
                        {
                            text: "PM atende B2C e PO atende exclusivamente clientes B2B",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que olhar o escopo real da vaga importa mais que o título PO ou PM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Empresas usam os títulos de formas diferentes entre si",
                            isCorrect: true,
                        },
                        {
                            text: "Porque títulos de produto mudam por lei a cada dois anos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o título define o salário em todas as empresas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque PO é sempre júnior e PM é sempre senior em todo lugar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa user story bem escrita, qual é o papel do trecho 'para...' (o benefício)?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Explicitar o valor buscado, que orienta solução e aceite",
                            isCorrect: true,
                        },
                        {
                            text: "Definir o prazo máximo de entrega aceito pelo cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Listar as tecnologias obrigatórias da implementação",
                            isCorrect: false,
                        },
                        {
                            text: "Indicar qual pessoa do time vai implementar a tarefa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Product Analyst e APM: a porta de entrada",
            blocks: [
                {
                    type: "text",
                    value: "# Onde a carreira começa\n\nQuase ninguém entra em produto direto como PM, e está tudo bem. As duas portas mais comuns têm nome: PRODUCT ANALYST e APM (Associate Product Manager). O Product Analyst é o braço de dados e evidência do time: monta dashboards, investiga por que uma métrica caiu, prepara análises que sustentam decisões de priorização, ajuda a desenhar e ler experimentos, organiza feedback de usuários. É quem transforma 'eu acho' em 'os dados sugerem'.\n\nO APM é o mesmo destino por outra estrada: programas estruturados de formação, com rotação entre times, mentoria de PMs seniores e responsabilidade crescente. No Brasil de 2026 esses programas ainda são raros (algumas techs grandes mantêm os seus), então a rota Analyst, ou um PO júnior, segue sendo a mais realista pra maioria.\n\nO que os dois papéis têm em comum: você aprende o ofício perto de quem já decide, com escopo protegido. O que muda o jogo é como você usa esse período: dá pra passar dois anos extraindo dados pros outros, ou dá pra usar cada análise como ensaio de decisão.",
                },
                {
                    type: "table",
                    value: '[["Atividade do Analyst","Versão executante","Versão que vira degrau"],["Dashboard","Entrega o painel pedido","Aponta o que o painel revela e sugere ação"],["Análise de queda","Descreve a queda","Levanta hipóteses e propõe o próximo passo"],["Feedback de usuários","Compila numa planilha","Sintetiza padrões e conecta ao roadmap"],["Experimento","Calcula o resultado","Recomenda decisão com base no resultado"]]',
                },
                {
                    type: "quote",
                    value: "A distância entre Analyst e PM se mede numa frase: você termina a análise com um número ou com uma recomendação?",
                },
                {
                    type: "text",
                    value: "## Como o papel cresce\n\nA progressão tem uma escada clara: da ANÁLISE (o que aconteceu) pra RECOMENDAÇÃO (o que deveríamos fazer) e da recomendação pra DECISÃO (assumir um problema e responder por ele). Cada degrau é um hábito que você pratica antes de ganhar o título. Analyst que entrega análise com recomendação escrita está fazendo estágio de PM em público; quando surge uma vaga interna, o histórico já existe.\n\nO movimento mais eficaz, e o conselho mais repetido por quem contrata: peça pra ser dono de um problema PEQUENO de ponta a ponta. Um fluxo de recuperação de senha, a página de FAQ, um relatório interno que ninguém ama. Pequeno o suficiente pra não assustar ninguém, completo o suficiente pra você exercitar o ciclo inteiro: entender o problema, propor, priorizar, acompanhar a entrega, medir e contar a história do resultado.\n\nA armadilha do papel é o conforto do outro lado: virar o 'SQL de estimação' do time, cada vez mais rápido em extrair dado e cada vez mais longe da decisão. Se todas as suas entregas do trimestre foram consumidas por outra pessoa que decidiu no seu lugar, é hora de renegociar o escopo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel central de um Product Analyst?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sustentar decisões de produto com dados e análises",
                            isCorrect: true,
                        },
                        {
                            text: "Aprovar o orçamento anual da área de tecnologia",
                            isCorrect: false,
                        },
                        {
                            text: "Gerenciar diretamente os engenheiros mais juniores",
                            isCorrect: false,
                        },
                        {
                            text: "Cuidar das redes sociais e da marca do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um programa de APM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porta de entrada estruturada, com rotação e mentoria",
                            isCorrect: true,
                        },
                        {
                            text: "Curso obrigatório por lei pra quem quer atuar como PM",
                            isCorrect: false,
                        },
                        {
                            text: "Cargo de gestão responsável por vários times de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Certificação internacional emitida por consultorias ágeis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o papel de Analyst evolui rumo a PM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Da análise à recomendação, e da recomendação à decisão",
                            isCorrect: true,
                        },
                        {
                            text: "Do frontend ao backend, dominando toda a stack técnica",
                            isCorrect: false,
                        },
                        {
                            text: "Do suporte ao comercial, passando por todas as áreas",
                            isCorrect: false,
                        },
                        {
                            text: "Da operação ao conselho, pulando o trabalho com times",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual armadilha trava o crescimento de um Analyst?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Virar só extrator de dados pros outros decidirem",
                            isCorrect: true,
                        },
                        {
                            text: "Estudar o negócio além do que o cargo atual exige",
                            isCorrect: false,
                        },
                        {
                            text: "Conversar demais com usuários e clientes da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever análises curtas demais pra diretoria ler",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um Analyst quer acelerar rumo a PM. Qual movimento a aula recomenda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Assumir um problema pequeno de ponta a ponta, como dono",
                            isCorrect: true,
                        },
                        {
                            text: "Esperar a promoção formal antes de opinar em decisões",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar de empresa a cada seis meses pra subir o título",
                            isCorrect: false,
                        },
                        {
                            text: "Focar apenas em ferramentas novas de dashboard e BI",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Papéis vizinhos e suas fronteiras",
            blocks: [
                {
                    type: "text",
                    value: "# O elenco ao redor do produto\n\nQuatro papéis orbitam o time de produto e geram confusão constante. O SCRUM MASTER (ou Agile Coach) cuida do PROCESSO: facilita cerimônias, remove impedimentos, ajuda o time a trabalhar melhor; não decide o que construir. O PRODUCT DESIGNER cuida da EXPERIÊNCIA: pesquisa usuários, explora soluções, desenha fluxos e telas; nas empresas maduras participa da descoberta desde o primeiro dia, não recebe 'o pedido pra desenhar' no final.\n\nO PRODUCT MARKETING MANAGER (PMM) cuida da PONTE COM O MERCADO: posicionamento, mensagem, lançamento, capacitação de vendas. Se o PM garante que o produto resolve o problema, o PMM garante que o mercado fica sabendo disso nos termos certos. E o BUSINESS ANALYST (BA), papel forte em bancos e empresas tradicionais, mapeia processos e requisitos, especialmente onde sistema novo encosta em sistema velho e em regra regulatória.\n\nNenhuma dessas fronteiras é limpa na vida real. Pesquisa de usuário é do designer ou do PM? Mensagem de lançamento é do PMM ou do PM? A resposta honesta: depende da empresa, do momento e das pessoas.",
                },
                {
                    type: "table",
                    value: '[["Papel","Foco","Sobreposição comum com o PM"],["Scrum Master / Agile Coach","Processo e impedimentos","Rituais e saúde do time"],["Product Designer","Pesquisa e experiência","Descoberta e contato com usuários"],["Product Marketing (PMM)","Posicionamento e lançamento","Mensagem e narrativa do produto"],["Business Analyst","Processos e requisitos","Detalhamento de regras de negócio"]]',
                },
                {
                    type: "quote",
                    value: "Sobreposição de papéis não é defeito de organograma, é natureza do trabalho criativo. O defeito é fingir que ela não existe e deixar a fronteira pra ser descoberta na crise.",
                },
                {
                    type: "text",
                    value: "## Fronteiras se conversam, não se decoram\n\nA pergunta errada é 'de quem é essa tarefa segundo o manual'. A pergunta certa: 'neste time, pra este trabalho, quem assume o quê?'. Times maduros fazem esse combinado explícito. Exemplo concreto: num lançamento, PM e PMM sentam e dividem: o PM escreve o documento interno com o problema, a solução e as métricas; o PMM escreve a narrativa externa e valida com clientes próximos; os dois revisam o material um do outro. Vinte minutos de conversa economizam semanas de ressentimento.\n\nDois sinais de fronteira mal resolvida pra você reconhecer: TRABALHO DUPLICADO (duas pessoas descobrem tarde que fizeram a mesma coisa) e TERRA DE NINGUÉM (todo mundo achou que era do outro, e o lançamento saiu sem material de suporte). Quando notar um dos dois, a correção não é escalar pro chefe: é puxar o combinado explícito.\n\nCom o Scrum Master, a parceria saudável é clara: ele protege o COMO se trabalha, você responde pelo O QUE e o PORQUÊ. Quando o processo vira fim em si mesmo, cerimônia por cerimônia, é papel do PM trazer a conversa de volta pro resultado.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o foco do Scrum Master ou Agile Coach?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O processo do time e a remoção de impedimentos",
                            isCorrect: true,
                        },
                        {
                            text: "A definição da estratégia comercial do produto",
                            isCorrect: false,
                        },
                        {
                            text: "O conteúdo das entrevistas com usuários finais",
                            isCorrect: false,
                        },
                        {
                            text: "A arquitetura técnica dos sistemas da empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que faz um Product Marketing Manager?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Posicionamento, mensagem e lançamento no mercado",
                            isCorrect: true,
                        },
                        {
                            text: "Gestão do backlog e refinamento com engenheiros",
                            isCorrect: false,
                        },
                        {
                            text: "Contratação e avaliação dos designers do time",
                            isCorrect: false,
                        },
                        {
                            text: "Monitoramento da infraestrutura e dos servidores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a sobreposição clássica entre PM e Product Designer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os dois pesquisam usuários e desenham a descoberta",
                            isCorrect: true,
                        },
                        {
                            text: "Os dois programam juntos as telas mais importantes",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois definem as metas de vendas do trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois aprovam o orçamento da área de marketing",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde o papel de Business Analyst é mais comum?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Em empresas tradicionais, mapeando processos e requisitos",
                            isCorrect: true,
                        },
                        {
                            text: "Em startups muito pequenas, fazendo o papel de fundador",
                            isCorrect: false,
                        },
                        {
                            text: "Em agências de publicidade, criando campanhas digitais",
                            isCorrect: false,
                        },
                        {
                            text: "Em times de infraestrutura, otimizando custos de nuvem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "PM e PMM discutem quem escreve o material do lançamento. Como a aula recomenda resolver fronteiras assim?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Combinar explicitamente quem faz o quê no contexto do time",
                            isCorrect: true,
                        },
                        {
                            text: "Escalar pro CEO decidir, pois fronteira é assunto executivo",
                            isCorrect: false,
                        },
                        {
                            text: "Seguir o manual internacional oficial de papéis de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar sem dono: sobreposição se resolve sozinha com o tempo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A escada da carreira",
            blocks: [
                {
                    type: "text",
                    value: "# Degraus de escopo, não de status\n\nA escada mais comum do mercado: APM ou Product Analyst, PM, PM Senior, GPM ou Product Lead, Head de Produto ou CPO. O erro clássico é ler essa sequência como escada de status, com cada degrau mandando no anterior. A leitura certa é de ESCOPO E AMBIGUIDADE: o que cresce a cada passo é o tamanho do problema que você resolve e o quanto ninguém sabe a resposta antes de você.\n\nNo primeiro degrau, você executa com supervisão: problemas delimitados, decisões revisadas por alguém mais experiente. Como PM, você vira dono de um produto ou área: decide com autonomia dentro de uma direção dada. Como SENIOR, os problemas chegam sem enunciado: 'nosso engajamento está estranho' em vez de 'melhore o onboarding'; você define o problema antes de resolver, influencia além do seu time e desenvolve os mais novos sem ter cargo de gestão.\n\nNo degrau de GPM ou Lead a natureza do trabalho muda de verdade: você passa a multiplicar POR OUTROS PMs. Menos decidir o produto, mais desenvolver quem decide. É gestão, com tudo que ela cobra: feedback difícil, contratação, carreira dos outros.",
                },
                {
                    type: "table",
                    value: '[["Degrau","Escopo típico","O que muda"],["APM / Analyst","Problemas delimitados","Executa com supervisão e aprende o ofício"],["PM","Um produto ou área","Decide com autonomia dentro da direção"],["PM Senior","Problemas sem enunciado","Define o problema e influencia além do time"],["GPM / Lead","Vários times","Multiplica por outros PMs: gestão"],["Head / CPO","Portfólio e organização","Estratégia, estrutura e cultura de produto"]]',
                },
                {
                    type: "quote",
                    value: "Subir na carreira de produto é trocar problemas maiores por certeza menor: quanto mais senior, menos alguém te diz o que fazer, e mais gente espera que você saiba.",
                },
                {
                    type: "text",
                    value: "## Duas trilhas e um critério honesto\n\nNo topo, Head e CPO trabalham em outra camada: portfólio (quais apostas a empresa faz), organização (como os times se dividem) e cultura (como se decide por aqui). Estão longe do detalhe de cada tela, e essa distância é o preço do escopo.\n\nDois avisos práticos. Primeiro: gestão NÃO é o único caminho. Um PM senior excelente que não quer gerir pessoas pode seguir crescendo como contribuidor individual, atacando os problemas mais espinhosos da empresa; forçar todo senior a virar gestor produz gestores ruins e perde ótimos solucionadores. Se a empresa não oferece essa trilha, isso é informação sobre a empresa.\n\nSegundo: o critério de promoção maduro é IMPACTO DEMONSTRADO NO PRÓXIMO ESCOPO, não tempo de casa. 'Faz dois anos que estou aqui' não é argumento; 'assumi um problema ambíguo, defini, resolvi e eis o resultado' é. Isso vale também na direção contrária: se você já opera no degrau seguinte há um ano e a empresa não reconhece, o mercado em 2026 reconhece. Construa o histórico por escrito; ele é o seu caso de promoção, aqui ou lá fora.",
                },
            ],
            questions: [
                {
                    statement: "O que de fato muda ao subir a escada de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O escopo e a ambiguidade dos problemas, não o status",
                            isCorrect: true,
                        },
                        {
                            text: "O direito de escolher pessoalmente todas as features",
                            isCorrect: false,
                        },
                        {
                            text: "A obrigação de programar cada vez mais nas entregas",
                            isCorrect: false,
                        },
                        {
                            text: "O número de reuniões diárias, que diminui até zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o degrau típico de entrada na carreira?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "APM ou Product Analyst, executando com supervisão",
                            isCorrect: true,
                        },
                        {
                            text: "Head de produto, definindo a estratégia da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "GPM, coordenando o trabalho de vários PMs de uma vez",
                            isCorrect: false,
                        },
                        {
                            text: "CPO, respondendo pelo portfólio inteiro no conselho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que diferencia um PM senior de um PM pleno?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Resolver problemas mais ambíguos e influenciar mais amplo",
                            isCorrect: true,
                        },
                        {
                            text: "Acumular mais tempo de casa e mais certificações formais",
                            isCorrect: false,
                        },
                        {
                            text: "Participar de todas as reuniões executivas da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovar pessoalmente cada entrega antes da publicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Ao virar GPM ou líder de PMs, qual é a mudança central?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Passar a multiplicar por outros PMs, assumindo gestão",
                            isCorrect: true,
                        },
                        {
                            text: "Voltar a executar tarefas operacionais de um só produto",
                            isCorrect: false,
                        },
                        {
                            text: "Abandonar o contato com estratégia pra focar em processo",
                            isCorrect: false,
                        },
                        {
                            text: "Ganhar autoridade direta sobre engenharia e design",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma PM senior excelente não quer gerir pessoas. O que a aula diz sobre esse caminho?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Seguir como contribuidora individual é caminho legítimo",
                            isCorrect: true,
                        },
                        {
                            text: "Sem gestão não existe progressão em nenhuma empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Ela deve migrar pra engenharia, onde não há gestão",
                            isCorrect: false,
                        },
                        {
                            text: "Ela precisa aceitar a gestão por no mínimo dois anos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - O time de produto",
    aulas: [
        {
            titulo: "O trio de produto",
            blocks: [
                {
                    type: "text",
                    value: "# Três cadeiras na mesma decisão\n\nTodo time de produto que funciona tem um núcleo pequeno de decisão: produto, design e engenharia. É o TRIO. Cada cadeira chega com uma pergunta diferente, e é o cruzamento delas que produz decisão boa. Produto pergunta se vale a pena: o problema importa pra quem usa e o resultado importa pro negócio. Design pergunta se as pessoas conseguem e querem: o fluxo faz sentido, a linguagem é clara, o esforço cabe na vida de quem está do outro lado. Engenharia pergunta se dá pra construir e a que preço: o que é caro, o que é arriscado, o que já existe pronto e o que vai cobrar manutenção por anos.\n\nO contrário do trio é a cascata interna, mais comum do que se admite: o PM escreve um documento com a solução pronta, passa pro design 'deixar bonito' e o design entrega telas pra engenharia 'implementar'. Cada passagem perde contexto, e o risco só aparece no fim, quando mudar custa caro. É telefone sem fio com prazo.\n\nNo trio, os três entram JUNTOS na definição do problema. Design pode mostrar que a dor é outra; engenharia pode oferecer um caminho dez vezes mais barato que ninguém tinha imaginado. Nenhum documento substitui essa conversa.",
                },
                {
                    type: "table",
                    value: '[["Cadeira","Pergunta que traz","Risco que ajuda a evitar"],["Produto","Vale a pena resolver isso agora?","Construir algo que não importa"],["Design","A pessoa entende e consegue?","Solução usável só por quem criou"],["Engenharia","Dá pra construir e a que custo?","Prazo estourado e manutenção cara"],["Trio junto","Qual problema atacamos primeiro?","Decidir sem metade do contexto"]]',
                },
                {
                    type: "quote",
                    value: "Documento não substitui conversa. Quando design e engenharia recebem a decisão pronta, o time perde as duas melhores chances de achar um caminho melhor.",
                },
                {
                    type: "text",
                    value: "## Decisão colaborativa não é decisão por consenso\n\nTrio não significa votar em tudo nem travar até todo mundo concordar. Significa decidir com as TRÊS LENTES na mesa, com responsabilidades claras: produto responde pelo problema e pela prioridade, design responde pela experiência, engenharia responde pela solução técnica e pela viabilidade. Quando há empate, alguém decide e assume. O combinado saudável é registrar a decisão com o porquê, pra que ela não seja rediscutida toda semana.\n\nUm cenário comum numa fintech: o time precisa reduzir o abandono na abertura de conta. Na cascata, o PM chega com 'vamos tirar dois campos do formulário'. No trio, a designer traz gravações mostrando que o abandono se concentra na foto do documento, e o engenheiro lembra que já existe um serviço contratado que valida documento com muito menos atrito. A decisão final não é de ninguém sozinho, e é melhor que qualquer uma das três iniciais.\n\nSinais de trio saudável: as três pessoas explicam o problema com as mesmas palavras; engenharia participa antes do escopo fechar; design conversa com usuários junto do PM. Se você é o único que sabe por que o time está fazendo aquilo, não existe trio, existe repasse.",
                },
            ],
            questions: [
                {
                    statement: "Quem forma o trio de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Produto, design e engenharia decidindo juntos",
                            isCorrect: true,
                        },
                        {
                            text: "Produto, marketing e vendas definindo o preço final",
                            isCorrect: false,
                        },
                        {
                            text: "Três engenheiros que revisam o código uns dos outros",
                            isCorrect: false,
                        },
                        {
                            text: "O comitê de diretores que aprova cada nova entrega",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual pergunta a engenharia leva pro trio?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dá pra construir isso, a que custo e com qual risco?",
                            isCorrect: true,
                        },
                        {
                            text: "As pessoas conseguem entender e usar essa tela sozinhas?",
                            isCorrect: false,
                        },
                        {
                            text: "Esse problema merece mesmo prioridade neste trimestre?",
                            isCorrect: false,
                        },
                        {
                            text: "Qual campanha vamos usar pra divulgar o novo recurso?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a cascata interna, com o PM entregando a solução pronta, prejudica o time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contexto se perde e o risco só aparece no fim",
                            isCorrect: true,
                        },
                        {
                            text: "Porque documentos escritos são proibidos em times ágeis",
                            isCorrect: false,
                        },
                        {
                            text: "Porque design e engenharia entregam sempre mais rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o PM perde o direito de conversar com usuários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que significa dizer que decisão no trio não é decisão por consenso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As três lentes entram, mas alguém decide e assume",
                            isCorrect: true,
                        },
                        {
                            text: "Só o PM decide, pois as outras cadeiras apenas executam",
                            isCorrect: false,
                        },
                        {
                            text: "O time vota em tudo e a maioria simples sempre prevalece",
                            isCorrect: false,
                        },
                        {
                            text: "A decisão sobe pro diretor sempre que houver discordância",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa fintech, o PM chegou com a solução fechada e o abandono continuou. O que o trio teria mudado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Design e engenharia revelariam a causa e o caminho barato",
                            isCorrect: true,
                        },
                        {
                            text: "Nada relevante, já que a solução do PM foi entregue no prazo",
                            isCorrect: false,
                        },
                        {
                            text: "O time teria escalado a decisão para a diretoria de negócio",
                            isCorrect: false,
                        },
                        {
                            text: "A entrega seria adiada até a próxima pesquisa de satisfação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Squads e modelos de organização",
            blocks: [
                {
                    type: "text",
                    value: "# Por feature, por jornada ou por plataforma\n\nComo a empresa divide os times define o que ela consegue construir sem virar reunião. Três recortes aparecem quase sempre. Por FEATURE: cada time cuida de um pedaço do produto, como busca, checkout ou notificações. É fácil de montar e tende a produzir times que entregam pedaços sem enxergar o resultado inteiro. Por JORNADA: o time cuida de um caminho do usuário de ponta a ponta, como 'primeira compra' ou 'renovação', com uma métrica que é sua. Dá mais autonomia e obriga o time a olhar o problema, não a tela. Por PLATAFORMA: times que servem outros times, como autenticação, pagamentos ou dados, cujos clientes são internos e cujo sucesso se mede na produtividade de quem depende deles.\n\nNenhum recorte é neutro. O que fica na fronteira entre dois times é o que atrasa. Por isso a pergunta ao desenhar times não é 'qual modelo está na moda', e sim quais problemas precisam ser resolvidos sem depender de acordo entre cinco times.\n\nNo Brasil, o termo SQUAD virou sinônimo de time, copiado de modelos publicados por empresas grandes sem o contexto que os fazia funcionar. Trocar 'equipe' por 'squad' não muda nada; mudar quem decide, sim.",
                },
                {
                    type: "table",
                    value: '[["Recorte","Exemplo de time","Ponto forte","Ponto fraco"],["Por feature","Time de busca","Foco e domínio técnico","Perde o resultado de ponta a ponta"],["Por jornada","Time de primeira compra","Métrica própria e autonomia","Disputa telas com outros times"],["Por plataforma","Time de pagamentos","Escala e reuso interno","Fica longe do usuário final"],["Por segmento","Time de lojista grande","Conhece o cliente a fundo","Duplica esforço entre segmentos"]]',
                },
                {
                    type: "quote",
                    value: "Time empoderado recebe um problema e responde por um resultado. Feature team recebe uma lista e responde por datas. O organograma pode ser o mesmo; o trabalho não é.",
                },
                {
                    type: "text",
                    value: "## Times empoderados e feature teams\n\nMarty Cagan popularizou dois termos que hoje valem como vocabulário de mercado. O FEATURE TEAM recebe uma lista de coisas pra construir e é medido por entregar essa lista. O TIME EMPODERADO recebe um problema, com uma métrica de resultado e liberdade pra escolher a solução, e é medido pelo resultado.\n\nA diferença não aparece no organograma, aparece na conversa de segunda-feira. Se a liderança chega com 'precisamos lançar o cupom até junho', é feature team. Se chega com 'a recompra caiu oito pontos, o que vocês propõem?', é time empoderado. Autonomia de verdade exige três coisas que a empresa precisa conceder: contexto de negócio compartilhado, acesso direto a usuários e dados, e tolerância a experimentos que não deram certo.\n\nUm aviso honesto pra quem está começando: boa parte das vagas em 2026 é em times mais próximos do feature team, e isso não invalida o seu trabalho. Dá pra puxar autonomia aos poucos: entregar o pedido junto de uma leitura do problema, propor alternativa mais barata com dado na mão, transformar 'faça X' em 'o objetivo é Y, e X é uma hipótese'. Autonomia raramente é concedida em bloco; ela é conquistada em decisões pequenas que deram certo.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um time organizado por jornada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cuida de um caminho do usuário de ponta a ponta",
                            isCorrect: true,
                        },
                        {
                            text: "Cuida de uma única tela do aplicativo por vez",
                            isCorrect: false,
                        },
                        {
                            text: "Atende apenas pedidos vindos da área comercial",
                            isCorrect: false,
                        },
                        {
                            text: "Presta serviço técnico para os demais times internos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quem são os clientes de um time de plataforma?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Outros times da empresa, que dependem daquele serviço",
                            isCorrect: true,
                        },
                        {
                            text: "Os consumidores finais que baixam o aplicativo na loja",
                            isCorrect: false,
                        },
                        {
                            text: "Os investidores que acompanham o crescimento da receita",
                            isCorrect: false,
                        },
                        {
                            text: "Os fornecedores de infraestrutura contratados pela empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença central entre time empoderado e feature team?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um recebe problema e resultado; o outro recebe lista",
                            isCorrect: true,
                        },
                        {
                            text: "Um usa Scrum e o outro trabalha exclusivamente com Kanban",
                            isCorrect: false,
                        },
                        {
                            text: "Um é remoto e o outro precisa estar sempre no escritório",
                            isCorrect: false,
                        },
                        {
                            text: "Um tem designers no time e o outro terceiriza o desenho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo típico de organizar times por feature?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada time entrega um pedaço e ninguém olha o todo",
                            isCorrect: true,
                        },
                        {
                            text: "Os engenheiros perdem profundidade técnica no seu domínio",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa fica sem nenhuma métrica de negócio disponível",
                            isCorrect: false,
                        },
                        {
                            text: "O produto passa a depender apenas de fornecedores externos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa renomeou as equipes para squads e nada mudou no dia a dia. O que faltou de verdade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Mudar quem decide, com contexto e acesso a dados",
                            isCorrect: true,
                        },
                        {
                            text: "Contratar mais engenheiros para cada uma das equipes",
                            isCorrect: false,
                        },
                        {
                            text: "Adotar o nome tribo para os agrupamentos maiores também",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a ferramenta de gestão de tarefas por outra melhor",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Rituais que valem o tempo",
            blocks: [
                {
                    type: "text",
                    value: "# Reunião é custo, ritual é investimento\n\nToda reunião recorrente é um custo fixo que se paga em horas de gente cara. Um ritual só se justifica quando produz algo que a conversa assíncrona não produziria: uma decisão, um alinhamento difícil, um ajuste de rumo. O resto é hábito herdado.\n\nTrês rituais costumam pagar o próprio preço. O SYNC DO TRIO, curto e frequente, é onde produto, design e engenharia olham o que está em andamento, o que travou e o que precisa ser decidido nesta semana. Ele evita que a descoberta e a entrega andem em trilhos separados. A REVIEW COM STAKEHOLDERS mostra o que foi feito, o que foi aprendido e o que muda no plano; bem conduzida, ela substitui dezenas de mensagens de cobrança avulsa. E o RITUAL DE MÉTRICA, mensal, é onde o time abre os números do que lançou e pergunta se a aposta funcionou.\n\nRepare no padrão: os três terminam com algo. Um ritual que termina apenas com 'todo mundo atualizado' está competindo com um documento, e vai perder. A pergunta pra sustentar qualquer agenda é simples: se cancelarmos por um mês, o que quebra?",
                },
                {
                    type: "table",
                    value: '[["Ritual","Para que serve","Sinal de que virou teatro"],["Sync do trio","Decidir o que trava a semana","Vira relatório de status individual"],["Review com stakeholders","Mostrar aprendizado e ajustar","Vira demo pra impressionar diretor"],["Ritual de métrica","Ver se a aposta funcionou","Ninguém pergunta o que fazer agora"],["Planejamento","Combinar foco do período","Já vem com tudo decidido de fora"]]',
                },
                {
                    type: "quote",
                    value: "Se um ritual pode ser substituído por um documento bem escrito, ele deveria ser substituído por um documento bem escrito.",
                },
                {
                    type: "text",
                    value: "## O mínimo que funciona\n\nTimes iniciantes tendem a dois extremos. O primeiro é a agenda lotada: cerimônia todo dia, calendário sem buraco, e nenhum bloco de trabalho concentrado sobrando. O segundo é a ausência total de ritual, que parece liberdade até o dia em que duas pessoas descobrem que construíram coisas incompatíveis.\n\nO caminho prático é começar pelo mínimo e adicionar só quando doer. Um sync curto do trio, uma conversa de alinhamento com stakeholders no ritmo do ciclo e um momento de olhar números. Tudo o mais precisa justificar a própria existência. E rituais devem ser revistos: a cada trimestre, vale perguntar time a time quais encontros ainda valem e quais viraram hábito.\n\nDuas regras que melhoram qualquer ritual, sem custo. Primeira: toda reunião recorrente tem dono, propósito escrito e resultado esperado; sem isso, ela não entra no calendário. Segunda: decisão tomada em reunião vira texto no mesmo dia, no lugar onde o time procura informação. Quem faltou não precisa perguntar, e quem participou não precisa lembrar de memória três semanas depois. Ritual sem registro produz a mesma discussão de novo em quinze dias.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o objetivo do sync do trio?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Decidir junto o que trava o trabalho da semana",
                            isCorrect: true,
                        },
                        {
                            text: "Reportar horas trabalhadas por cada pessoa do time",
                            isCorrect: false,
                        },
                        {
                            text: "Aprovar formalmente o orçamento anual da área toda",
                            isCorrect: false,
                        },
                        {
                            text: "Apresentar resultados financeiros para os investidores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Segundo a aula, o que justifica manter um ritual no calendário?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele produz decisão ou alinhamento que o texto não daria",
                            isCorrect: true,
                        },
                        {
                            text: "Ele já existe há bastante tempo e todo mundo se acostumou",
                            isCorrect: false,
                        },
                        {
                            text: "Ele reúne o maior número possível de áreas da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Ele preenche a agenda e demonstra que o time está ocupado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A review com stakeholders virou uma demo para impressionar a diretoria. O que se perdeu?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O aprendizado e o ajuste honesto do plano",
                            isCorrect: true,
                        },
                        {
                            text: "A oportunidade de mostrar telas bonitas ao público",
                            isCorrect: false,
                        },
                        {
                            text: "O registro formal das horas gastas em cada entrega",
                            isCorrect: false,
                        },
                        {
                            text: "A chance de aumentar o orçamento do próximo semestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que decisão tomada em ritual precisa virar texto no mesmo dia?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem registro, o time rediscute a mesma coisa depois",
                            isCorrect: true,
                        },
                        {
                            text: "Porque auditorias externas exigem ata de toda reunião",
                            isCorrect: false,
                        },
                        {
                            text: "Porque quem faltou perde o direito de opinar no assunto",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o texto substitui a necessidade de qualquer decisão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time herdou seis rituais semanais e ninguém lembra por que existem. Qual é o teste que a aula sugere?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Perguntar o que quebra se cancelarmos por um mês",
                            isCorrect: true,
                        },
                        {
                            text: "Manter todos, já que cortar reunião gera desalinhamento",
                            isCorrect: false,
                        },
                        {
                            text: "Cancelar todos de uma vez e trabalhar sem nenhum encontro",
                            isCorrect: false,
                        },
                        {
                            text: "Convidar mais pessoas para que cada ritual fique mais útil",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Trabalhando com engenharia",
            blocks: [
                {
                    type: "text",
                    value: "# Dívida técnica é conversa de negócio\n\nDívida técnica é o custo futuro de um atalho tomado hoje. Às vezes o atalho é a decisão certa: lançar rápido pra testar uma hipótese vale mais do que a arquitetura perfeita de um produto que ninguém quer. O problema não é contrair dívida, é fingir que ela não existe e pagar juros em silêncio, na forma de bug recorrente, entrega cada vez mais lenta e time desmotivado.\n\nO PM não precisa avaliar a qualidade do código, mas precisa conseguir conversar sobre custo e risco. Quando a engenharia diz 'precisamos refatorar o módulo de pagamentos', a pergunta útil não é 'isso é mesmo necessário?', é 'o que acontece com o negócio se não fizermos, e quando?'. A resposta transforma um pedido técnico em decisão de produto: mais incidentes em pico de vendas, suporte sobrecarregado, funcionalidades novas que passam a custar o dobro.\n\nO padrão que funciona é reservar capacidade de forma explícita, combinada com o time, em vez de prometer 'depois a gente arruma'. Depois nunca chega, porque sempre existe algo mais urgente pra colocar no lugar.",
                },
                {
                    type: "table",
                    value: '[["Pedido técnico","Tradução pro negócio","Decisão que fica clara"],["Refatorar o checkout","Cada mudança custa o dobro hoje","Investir agora ou pagar mais depois"],["Trocar a fila de pagamentos","Incidentes em pico derrubam repasse","Assumir o risco ou reduzir agora"],["Cobrir testes do módulo","Regressão chega ao cliente","Aceitar retrabalho ou prevenir"],["Atualizar dependência","Falha de segurança em aberto","Tratar antes ou explicar depois"]]',
                },
                {
                    type: "code",
                    value: "ITEM DE DIVIDA TECNICA ESCRITO PRA DECISAO\n\nTitulo: Reprocessamento manual na fila de pagamentos\nSintoma hoje: 3 incidentes no trimestre, 40h de operacao manual\nRisco se nada mudar: pico de vendas trava o repasse ao lojista\nCusto estimado: 2 semanas do time, com margem de erro alta\nGanho esperado: menos incidente, menos suporte, base pro parcelamento\nDecisao pedida: entra agora, entra apos o lancamento ou fica registrado",
                },
                {
                    type: "quote",
                    value: "Estimativa não é promessa, é a melhor leitura de incerteza que o time tem hoje. Cobrar estimativa como se fosse contrato ensina o time a mentir com folga.",
                },
                {
                    type: "text",
                    value: "## Estimativas, incerteza e confiança\n\nEstimativa é previsão sob incerteza, e incerteza diminui conforme o time aprende. Um pedido vago, com integração desconhecida, tem margem de erro enorme; o mesmo pedido depois de uma investigação de dois dias fica muito mais previsível. Por isso a pergunta madura não é 'quanto tempo leva?', e sim 'o que você precisaria saber pra ter mais confiança nessa estimativa?'.\n\nO ciclo que destrói confiança é conhecido. O PM pressiona por uma data, o time chuta baixo pra agradar, o prazo estoura, a qualidade cai e o próximo chute vem inflado pra se proteger. A saída é mudar a moeda da conversa: prazo com faixa e nível de confiança, escopo negociável, e a honestidade de dizer à diretoria que uma data única sem margem é ficção.\n\nConfiança se constrói com comportamento repetido. Não mudar a prioridade no meio do ciclo sem conversar, defender o time quando a pressão externa chega, explicar o porquê de cada decisão e admitir quando você errou a aposta. Engenharia que confia no PM traz problema cedo. Engenharia que não confia esconde o problema até virar crise.",
                },
            ],
            questions: [
                {
                    statement: "O que é dívida técnica?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O custo futuro de um atalho técnico tomado hoje",
                            isCorrect: true,
                        },
                        {
                            text: "O valor gasto com licenças de software pela empresa",
                            isCorrect: false,
                        },
                        {
                            text: "O prejuízo causado por uma feature que ninguém adotou",
                            isCorrect: false,
                        },
                        {
                            text: "O salário acumulado dos engenheiros do time no ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o PM deve tratar uma estimativa dada pela engenharia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Como leitura de incerteza, não como promessa fechada",
                            isCorrect: true,
                        },
                        {
                            text: "Como compromisso contratual que não pode mudar depois",
                            isCorrect: false,
                        },
                        {
                            text: "Como número irrelevante, já que prazos sempre estouram",
                            isCorrect: false,
                        },
                        {
                            text: "Como assunto exclusivo da engenharia, sem envolver produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual pergunta transforma um pedido de refatoração em decisão de produto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que acontece com o negócio se não fizermos, e quando?",
                            isCorrect: true,
                        },
                        {
                            text: "Qual linguagem de programação o time prefere usar agora?",
                            isCorrect: false,
                        },
                        {
                            text: "Quem escreveu o código original que gerou esse problema?",
                            isCorrect: false,
                        },
                        {
                            text: "Dá pra empurrar isso para o próximo ano sem consequência?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que 'depois a gente arruma' costuma falhar como plano para dívida técnica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sempre aparece algo mais urgente ocupando o lugar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a engenharia esquece rapidamente o que precisa mudar",
                            isCorrect: false,
                        },
                        {
                            text: "Porque dívida técnica desaparece sozinha com o tempo de uso",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time perde acesso ao código antigo depois do prazo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time passou a inflar estimativas depois de vários prazos cobrados como contrato. Como reverter?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Adotar faixa com nível de confiança e escopo negociável",
                            isCorrect: true,
                        },
                        {
                            text: "Exigir que o time assine cada estimativa antes de começar",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar as pessoas do time por outras mais experientes nisso",
                            isCorrect: false,
                        },
                        {
                            text: "Estimar sozinho e informar as datas prontas para a engenharia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Trabalhando com design",
            blocks: [
                {
                    type: "text",
                    value: "# Pesquisa compartilhada, decisão compartilhada\n\nO erro mais comum de PM iniciante com design é tratar a dupla como uma linha de produção: o PM traz o problema já resolvido, o design deixa apresentável. Isso desperdiça a parte mais valiosa da parceria. Designer de produto não é quem escolhe cor; é quem investiga como as pessoas pensam, testa caminhos e transforma um problema confuso em fluxo que alguém consegue percorrer sem manual.\n\nA prática que muda esse jogo é a PESQUISA COMPARTILHADA. Em vez de dividir 'design faz entrevista, PM lê o relatório', os dois assistem às mesmas conversas com usuários, cada um com sua lente. O designer repara na hesitação diante de uma tela; o PM repara na frase que revela quanto aquilo custa pro negócio da pessoa. Quando os dois ouviram a mesma coisa, a discussão sobre o que fazer fica curta, porque a evidência é comum.\n\nA regra prática é simples: o PM não desenha, mas participa. Participar significa entrar cedo, trazer restrição de negócio antes e não depois, e discutir alternativas enquanto elas ainda são rascunho barato de jogar fora.",
                },
                {
                    type: "table",
                    value: '[["Situação","PM que atrapalha","PM que soma"],["Início do problema","Chega com a tela pronta","Chega com o problema e o resultado"],["Pesquisa","Espera o relatório final","Assiste às sessões junto do design"],["Crítica de trabalho","Diz que não gostou do visual","Aponta objetivo, risco e evidência"],["Prazo apertado","Corta a pesquisa inteira","Reduz o escopo do que será testado"]]',
                },
                {
                    type: "quote",
                    value: "Feedback de design útil não fala de gosto, fala de objetivo: o que essa tela precisa fazer a pessoa entender, e o que na proposta atual atrapalha isso.",
                },
                {
                    type: "text",
                    value: "## Como dar crítica de design sem virar decorador\n\nCrítica de design é uma habilidade que se aprende. A versão inútil soa assim: 'não curti', 'acho que fica melhor em azul', 'faz igual ao concorrente'. A versão útil separa três coisas: OBJETIVO (o que essa tela precisa que a pessoa entenda ou faça), OBSERVAÇÃO (o que na proposta pode atrapalhar esse objetivo) e PERGUNTA ABERTA (o que você não entendeu e quer que expliquem). Quem critica dessa forma não invade o ofício do outro, e ainda ajuda a decisão.\n\nEvite também o extremo oposto, o PM que se cala. Silêncio educado antes do lançamento vira reprovação depois, e refazer no fim custa caro pra todo mundo. Restrições de negócio, limites legais e regras de risco precisam aparecer no rascunho, não na véspera.\n\nUm sinal de parceria saudável: em um time bem entrosado, é difícil dizer de quem foi a ideia. As melhores decisões costumam nascer no meio da conversa, quando alguém junta a dor observada na pesquisa com a restrição técnica e alguém completa com o objetivo de negócio. Se você sente que precisa vencer o designer numa discussão, o problema já não é a tela.",
                },
            ],
            questions: [
                {
                    statement: "O que é pesquisa compartilhada entre PM e design?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os dois acompanham as mesmas conversas com usuários",
                            isCorrect: true,
                        },
                        {
                            text: "O designer entrevista e envia o relatório pronto pro PM",
                            isCorrect: false,
                        },
                        {
                            text: "O PM contrata uma consultoria externa para pesquisar tudo",
                            isCorrect: false,
                        },
                        {
                            text: "A pesquisa é dividida em partes que ninguém revisa depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que faz um product designer, segundo a aula?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Investiga, testa caminhos e desenha fluxos de uso",
                            isCorrect: true,
                        },
                        {
                            text: "Escolhe cores e fontes depois que a tela já foi decidida",
                            isCorrect: false,
                        },
                        {
                            text: "Programa as telas do aplicativo junto com a engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "Define o preço do produto e a estratégia de campanha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual crítica de design é útil para o time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ligar objetivo da tela, observação e pergunta aberta",
                            isCorrect: true,
                        },
                        {
                            text: "Dizer que não gostou e sugerir copiar o concorrente direto",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir uma paleta de cores diferente sem explicar o motivo",
                            isCorrect: false,
                        },
                        {
                            text: "Guardar a opinião até a véspera do lançamento do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quando o PM deve trazer restrições legais e de negócio para o design?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No rascunho, enquanto mudar ainda é barato",
                            isCorrect: true,
                        },
                        {
                            text: "Na véspera do lançamento, quando tudo estiver definido",
                            isCorrect: false,
                        },
                        {
                            text: "Somente se algum stakeholder externo cobrar formalmente",
                            isCorrect: false,
                        },
                        {
                            text: "Depois da entrega, para não travar a criatividade do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um PM redesenha as telas sozinho e apresenta prontas ao designer. Qual é o principal prejuízo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Perde a investigação que revelaria a dor de verdade",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum, porque decidir mais rápido compensa qualquer perda",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o incômodo pessoal do designer com a falta de aviso",
                            isCorrect: false,
                        },
                        {
                            text: "O time perde o direito de fazer pesquisa naquele trimestre",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - O usuário no centro",
    aulas: [
        {
            titulo: "Problema antes da solução",
            blocks: [
                {
                    type: "text",
                    value: "# A armadilha da solução apaixonante\n\nUma ideia chega pronta e brilhante: 'precisamos de um assistente com IA dentro do app'. Ela é sedutora, cabe numa frase, rende uma boa apresentação. E é exatamente aí que mora a armadilha: quando alguém se apaixona por uma solução, passa a procurar um problema que a justifique. O time constrói, lança, e descobre que a dor real era outra, mais chata e menos fotogênica.\n\nProduto trabalha no ESPAÇO DO PROBLEMA antes de entrar no espaço da solução. No espaço do problema você descreve quem sofre, em que situação, com que frequência e quanto isso custa hoje. No espaço da solução você escolhe como atacar. Pular o primeiro é como comprar remédio antes do diagnóstico: às vezes funciona, e você nunca sabe por quê.\n\nIsso não significa transformar todo pedido num interrogatório. Quando a solução é barata, reversível e o problema é evidente, faça e siga em frente. O rigor precisa ser proporcional ao custo: quanto mais caro e mais difícil de desfazer, mais vale investigar o problema antes de escrever a primeira linha de código.",
                },
                {
                    type: "table",
                    value: '[["Pedido que chega","Pergunta que revela","Problema que pode estar por trás"],["Quero um chat com IA","O que te fez pensar nisso agora?","Suporte demora a responder dúvidas simples"],["Precisamos de um app","Quem vai usar e em que momento?","O site não funciona bem no celular"],["Faça um relatório novo","Que decisão esse relatório apoia?","Ninguém confia nos números atuais"],["Copie a feature do concorrente","Que resultado esperamos com isso?","Medo de perder clientes sem evidência"]]',
                },
                {
                    type: "quote",
                    value: "Todo pedido de feature carrega um problema escondido e uma solução chutada. Sua função é separar os dois antes que o time construa o chute.",
                },
                {
                    type: "text",
                    value: "## Como reformular um pedido sem virar chato\n\nA reformulação começa com curiosidade, não com resistência. Em vez de 'por que você quer isso?', que soa a interrogatório, funciona melhor perguntar o que aconteceu recentemente que levou àquele pedido, quem sentiu a dor e o que essas pessoas fazem hoje pra contornar. Gambiarra é ouro: quando alguém mantém uma planilha paralela, exporta relatório e refaz conta na mão, o problema está gritando ali.\n\nDepois de entender, escreva o problema numa frase curta que qualquer pessoa do time consiga repetir. Um formato que ajuda: QUEM, em QUE SITUAÇÃO, não consegue O QUÊ, e por isso paga QUAL PREÇO. Por exemplo: 'o lojista pequeno, ao fechar o mês, não consegue conferir repasses e gasta duas horas na planilha, com risco de cobrar errado'.\n\nEsse enunciado muda a conversa inteira. Com ele, várias soluções podem ser comparadas, inclusive as que ninguém tinha imaginado, e o sucesso deixa de ser 'entregamos o chat' e passa a ser 'o lojista fecha o mês em minutos'. Quem escreve bem o problema já ganhou metade da discussão de prioridade.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza o espaço do problema?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Descrever quem sofre, quando e a que custo hoje",
                            isCorrect: true,
                        },
                        {
                            text: "Escolher a tecnologia que será usada na construção",
                            isCorrect: false,
                        },
                        {
                            text: "Detalhar as telas e os fluxos que serão desenhados",
                            isCorrect: false,
                        },
                        {
                            text: "Definir o prazo de entrega combinado com a diretoria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a armadilha da solução apaixonante?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Procurar um problema que justifique a ideia amada",
                            isCorrect: true,
                        },
                        {
                            text: "Investigar demais e nunca chegar a construir nada",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher a alternativa mais barata sempre que possível",
                            isCorrect: false,
                        },
                        {
                            text: "Deixar a diretoria escolher as prioridades do trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a gambiarra do usuário é um sinal valioso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela mostra uma dor real que a pessoa já contorna sozinha",
                            isCorrect: true,
                        },
                        {
                            text: "Ela prova que o usuário domina bem as ferramentas atuais",
                            isCorrect: false,
                        },
                        {
                            text: "Ela indica que o problema não é urgente o suficiente ainda",
                            isCorrect: false,
                        },
                        {
                            text: "Ela substitui qualquer necessidade de conversar com clientes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual enunciado descreve bem um problema de produto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Lojista, ao fechar o mês, não confere repasses e perde horas",
                            isCorrect: true,
                        },
                        {
                            text: "Precisamos de um painel novo com gráficos de repasse no app",
                            isCorrect: false,
                        },
                        {
                            text: "O time vai entregar a integração de repasses até o fim de maio",
                            isCorrect: false,
                        },
                        {
                            text: "A concorrência lançou repasse automático na semana passada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quando faz sentido atender um pedido direto, sem investigar longamente o problema por trás?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quando é barato, reversível e a dor já está evidente",
                            isCorrect: true,
                        },
                        {
                            text: "Quando quem pediu ocupa o cargo mais alto entre os envolvidos",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o time está com capacidade sobrando naquele momento",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a solução parece inovadora frente ao resto do mercado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Jobs To Be Done e o job do milkshake",
            blocks: [
                {
                    type: "text",
                    value: "# As pessoas contratam produtos pra fazer um trabalho\n\nA história virou clássica no mundo de produto. Uma rede de fast food queria vender mais milkshake e fez o de sempre: perguntou a clientes que perfil de sabor, textura e preço agradaria mais. Ajustou o produto conforme as respostas e as vendas não se moveram. Uma equipe de pesquisa, ligada ao trabalho de Clayton Christensen, resolveu olhar de outro jeito e passou a observar QUANDO as compras aconteciam.\n\nA descoberta: uma fatia enorme dos milkshakes era comprada de manhã cedo, por pessoas sozinhas, que levavam a bebida no carro. Elas não queriam sobremesa. Estavam contratando o milkshake pra um trabalho bem específico: ocupar uma viagem longa e chata até o trabalho e segurar a fome até o almoço. Nesse trabalho, os concorrentes não eram outros milkshakes; eram a banana, a rosquinha e a barra de cereal.\n\nEssa é a ideia central de JOBS TO BE DONE. As pessoas não compram produtos, elas contratam soluções pra fazer um progresso na vida delas. Entender o job explica escolhas que a demografia nunca explicaria.",
                },
                {
                    type: "table",
                    value: '[["Job do cliente","Situação típica","Concorrentes reais"],["Ocupar o trajeto e segurar a fome","Trânsito longo pela manhã","Banana, rosquinha, barra de cereal"],["Provar que o mês fechou certo","Fim de mês do lojista","Planilha paralela e contador"],["Não passar vergonha na reunião","Apresentação para a diretoria","Slide do colega e improviso"],["Matar o tempo em fila","Espera de dez minutos","Rede social, jogo, notícia"]]',
                },
                {
                    type: "quote",
                    value: "Ninguém quer uma furadeira, todo mundo quer o furo na parede. E às vezes nem o furo: quer a prateleira no lugar sem sujeira nem dor de cabeça.",
                },
                {
                    type: "text",
                    value: "## Progresso, não demografia\n\nO deslocamento mais útil do JTBD é este: a CIRCUNSTÂNCIA explica mais que o PERFIL. Duas pessoas com a mesma idade, renda e cidade contratam produtos diferentes conforme o momento; a mesma pessoa contrata soluções diferentes na segunda de manhã e na sexta à noite. Por isso o job costuma ter três camadas: a funcional (o que precisa ser feito), a emocional (como a pessoa quer se sentir) e a social (como quer ser vista pelos outros).\n\nNa prática, você chega no job entrevistando sobre o PASSADO CONCRETO, nunca sobre o futuro hipotético. Pergunte pela última vez que a pessoa resolveu aquilo: o que aconteceu antes, o que ela tentou, o que a fez desistir da alternativa anterior. Esse relato revela o que ela demitiu e por quê, que é a informação mais rica que existe pra quem quer entrar no lugar.\n\nUm aviso de calibragem: JTBD é uma lente, não um oráculo. Ele ajuda a enxergar concorrentes fora da sua categoria e a evitar features que ninguém contrataria, mas não prioriza sozinho, não mede resultado e não dispensa dado de uso.",
                },
            ],
            questions: [
                {
                    statement: "O que a ideia de Jobs To Be Done propõe?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As pessoas contratam soluções pra fazer um progresso",
                            isCorrect: true,
                        },
                        {
                            text: "As pessoas compram por faixa de idade, renda e região",
                            isCorrect: false,
                        },
                        {
                            text: "As pessoas escolhem sempre o produto de menor preço final",
                            isCorrect: false,
                        },
                        {
                            text: "As pessoas seguem a recomendação de quem tem mais marca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na história do milkshake, quais eram os concorrentes reais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Banana, rosquinha e barra de cereal no trajeto",
                            isCorrect: true,
                        },
                        {
                            text: "Os milkshakes vendidos por outras redes de fast food",
                            isCorrect: false,
                        },
                        {
                            text: "Os refrigerantes servidos no jantar da mesma rede",
                            isCorrect: false,
                        },
                        {
                            text: "As sobremesas oferecidas por restaurantes da vizinhança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a circunstância explica mais que a demografia no JTBD?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A mesma pessoa contrata coisas diferentes conforme o momento",
                            isCorrect: true,
                        },
                        {
                            text: "Dados demográficos são proibidos pela legislação brasileira",
                            isCorrect: false,
                        },
                        {
                            text: "Perfil socioeconômico não influencia nenhuma decisão de compra",
                            isCorrect: false,
                        },
                        {
                            text: "A circunstância é sempre mais fácil de medir do que o perfil",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são as três camadas típicas de um job?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As camadas funcional, emocional e social do job",
                            isCorrect: true,
                        },
                        {
                            text: "As camadas técnica, comercial e jurídica do produto",
                            isCorrect: false,
                        },
                        {
                            text: "As etapas estratégica, tática e operacional do plano",
                            isCorrect: false,
                        },
                        {
                            text: "As fases de aquisição, ativação e retenção do funil",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você quer descobrir o job de um cliente numa entrevista. Que tipo de pergunta funciona melhor?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pedir o relato da última vez que ele resolveu aquilo",
                            isCorrect: true,
                        },
                        {
                            text: "Perguntar se ele usaria uma solução nova como a que você pensou",
                            isCorrect: false,
                        },
                        {
                            text: "Pedir que ele dê nota de zero a dez para as ideias do time",
                            isCorrect: false,
                        },
                        {
                            text: "Perguntar quanto ele pagaria por um produto ainda inexistente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Segmentos e personas com critério",
            blocks: [
                {
                    type: "text",
                    value: "# Persona é ferramenta de comunicação\n\nSegmento e persona resolvem problemas diferentes. SEGMENTO é um recorte de mercado com comportamento e necessidade parecidos: 'lojistas com até cinco pedidos por dia', 'clientes que só usam o app pra pagar boleto'. Ele serve pra decidir onde investir e como medir. PERSONA é a representação de uma pessoa típica daquele grupo, com nome, contexto, objetivo e barreira, e serve pra alinhar o time em torno de quem está do outro lado.\n\nRepare no verbo: persona ALINHA. Ela não substitui dado, não prova nada e não decide sozinha. Existe pra que, quando alguém disser 'a Renata do mercadinho não vai entender esse campo', todo mundo saiba de quem se trata e por quê.\n\nO problema é que persona virou entregável decorativo em muitos times: uma foto de banco de imagens, uma idade, uma frase inspiradora e três hobbies. Esse cartaz não muda nenhuma decisão, e é por isso que ele acaba na parede sem que ninguém volte a olhar. Persona útil tem comportamento observado, dor concreta, contexto de uso e uma frase real ouvida em pesquisa.",
                },
                {
                    type: "table",
                    value: '[["Elemento","Persona decorativa","Persona útil"],["Base","Achismo do time em uma tarde","Entrevistas e dados de uso"],["Conteúdo","Idade, hobbies e foto bonita","Comportamento, objetivo e barreira"],["Quantidade","Sete personas para tudo","Duas ou três, revisadas de tempos em tempos"],["Uso no dia a dia","Fica no slide da parede","Aparece quando o time decide algo"]]',
                },
                {
                    type: "quote",
                    value: "O teste de uma persona é simples: ela já fez o time rejeitar alguma ideia? Se nunca serviu pra dizer não, ela é decoração com nome próprio.",
                },
                {
                    type: "text",
                    value: "## Sinais de persona inútil e como corrigir\n\nTrês sinais denunciam persona morta. O primeiro é a ORIGEM: nasceu numa oficina de duas horas, sem nenhuma conversa com gente de verdade, refletindo o que o time imagina sobre o mundo. O segundo é o EXCESSO: quando existem sete personas, nenhuma orienta decisão, porque sempre há uma que justifica qualquer ideia. O terceiro é o CONGELAMENTO: foi feita há três anos, o produto mudou de público duas vezes e o cartaz continua igual.\n\nA correção é barata. Reduza a duas ou três, cada uma ligada a um segmento que o negócio realmente atende. Troque hobbies por comportamento observável: com que frequência usa, em que aparelho, o que faz quando trava, qual alternativa usava antes. Inclua a barreira principal, aquilo que impede a pessoa de conseguir o que quer com o seu produto. E date o documento, porque persona também envelhece.\n\nDois cuidados finais. Persona não é média estatística: descrever o usuário médio costuma produzir alguém que não existe. E persona não é desculpa pra parar de pesquisar; ela é o resumo do que você aprendeu até aqui, não um substituto de aprender de novo.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve uma persona?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Alinhar o time sobre quem está do outro lado",
                            isCorrect: true,
                        },
                        {
                            text: "Provar estatisticamente o tamanho de um mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir a necessidade de conversar com usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Definir o preço que será cobrado de cada cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um segmento de usuários?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Recorte com comportamento e necessidade parecidos",
                            isCorrect: true,
                        },
                        {
                            text: "Lista completa de todos os clientes ativos na base",
                            isCorrect: false,
                        },
                        {
                            text: "Personagem fictício criado para inspirar o time todo",
                            isCorrect: false,
                        },
                        {
                            text: "Divisão interna das equipes por área de conhecimento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o sinal mais claro de que uma persona é decorativa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela nunca ajudou o time a rejeitar nenhuma ideia",
                            isCorrect: true,
                        },
                        {
                            text: "Ela tem um nome próprio e uma foto na parede da sala",
                            isCorrect: false,
                        },
                        {
                            text: "Ela foi construída a partir de entrevistas com clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Ela descreve o aparelho usado e a frequência de acesso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que ter sete personas costuma atrapalhar as decisões do time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sempre existe uma que justifica qualquer ideia proposta",
                            isCorrect: true,
                        },
                        {
                            text: "O time não consegue decorar tantos nomes e fotos diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "As ferramentas de design só aceitam três personas por projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Cada persona exige um time de desenvolvimento dedicado a ela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer transformar personas antigas em ferramenta viva de decisão. Qual mudança tem mais efeito?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Trocar hobbies por comportamento e barreira observados",
                            isCorrect: true,
                        },
                        {
                            text: "Contratar um ilustrador para melhorar as imagens do material",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o número de personas para cobrir todos os públicos",
                            isCorrect: false,
                        },
                        {
                            text: "Publicar as personas na intranet para toda a empresa acessar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A voz do usuário sem se enganar",
            blocks: [
                {
                    type: "text",
                    value: "# Nem todo feedback vale o mesmo\n\nOuvir o usuário é obrigação, e ouvir mal é a forma mais elegante de construir a coisa errada com convicção. Todo canal de escuta carrega um viés embutido, e o trabalho de quem faz produto é conhecer o viés de cada um antes de tirar conclusão.\n\nQuem reclama publicamente é uma amostra específica: costuma ser quem teve problema grave ou quem já é bastante engajado. Quem responde pesquisa é quem tinha tempo e alguma opinião formada. Quem fala com você em evento é quem gosta o suficiente pra estar ali. Nenhum desses grupos representa quem instalou o app, não entendeu nada e desistiu em silêncio, que é justamente a pessoa que mais tinha a ensinar.\n\nExiste ainda a MINORIA BARULHENTA: um grupo pequeno, ativo e organizado, capaz de encher a caixa de entrada e fazer parecer consenso o que é opinião de poucos. Cuidado especial em B2B, onde um único cliente grande consegue transformar uma preferência interna em urgência de roadmap. A pergunta que salva é sempre a mesma: quantas pessoas isso representa, e elas se parecem com quem queremos servir?",
                },
                {
                    type: "table",
                    value: '[["Fonte de feedback","Viés típico","Como compensar"],["Avaliação em loja de app","Extremos de raiva ou paixão","Cruzar com dados de uso do fluxo"],["Pesquisa por formulário","Quem tem tempo e opinião pronta","Ver taxa de resposta e o perfil"],["Chamados de suporte","Só quem procurou ajuda","Olhar quem desistiu sem abrir chamado"],["Cliente grande em B2B","Peso comercial na conversa","Checar se a dor aparece na base"]]',
                },
                {
                    type: "quote",
                    value: "O que as pessoas dizem, o que fazem e o que dizem que fazem são três coisas diferentes. Produto sério confere as três antes de decidir.",
                },
                {
                    type: "text",
                    value: "## Dizer e fazer não são a mesma coisa\n\nO exemplo mais comum é o pedido declarado. Uma pesquisa mostra que a maioria adoraria um recurso; ele é lançado com alarde e a adoção fica em poucos por cento. Não houve mentira: responder um formulário é barato, mudar o comportamento é caro. Por isso preferência declarada vale pouco sozinha, e comportamento observado vale muito.\n\nO antídoto tem três partes. Primeira: pergunte sobre o PASSADO, não sobre o futuro. 'Como você fez isso da última vez?' produz informação; 'você usaria?' produz gentileza. Segunda: TRIANGULE. Uma dor que aparece em entrevista, se repete nos chamados de suporte e bate com uma queda no funil é uma dor real; uma dor que só existe em um canal é uma pista, não uma conclusão. Terceira: procure o SILÊNCIO. Quem abandonou o cadastro não vai reclamar, e é ali que costuma estar o maior ganho disponível.\n\nE quando o feedback vier com solução embutida, e virá, guarde o problema e descarte a solução. 'Coloca um botão de exportar na tela inicial' quase sempre quer dizer 'não consigo achar meus dados quando preciso deles'.",
                },
            ],
            questions: [
                {
                    statement: "O que é a minoria barulhenta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Grupo pequeno e ativo que parece consenso",
                            isCorrect: true,
                        },
                        {
                            text: "O conjunto de usuários que nunca dá nenhum retorno",
                            isCorrect: false,
                        },
                        {
                            text: "A maioria dos clientes que paga o plano mais caro",
                            isCorrect: false,
                        },
                        {
                            text: "O time interno que discorda das decisões tomadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que preferência declarada vale pouco sozinha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Responder é barato e mudar de comportamento é caro",
                            isCorrect: true,
                        },
                        {
                            text: "Usuários costumam mentir de propósito nas pesquisas",
                            isCorrect: false,
                        },
                        {
                            text: "Formulários digitais registram respostas com muitos erros",
                            isCorrect: false,
                        },
                        {
                            text: "Pesquisas só podem ser aplicadas com clientes que pagam",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que grupo tende a ficar invisível nos canais de feedback?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem tentou usar, não entendeu e desistiu calado",
                            isCorrect: true,
                        },
                        {
                            text: "Quem avalia o aplicativo na loja com nota muito baixa",
                            isCorrect: false,
                        },
                        {
                            text: "Quem abre chamados frequentes no canal de atendimento",
                            isCorrect: false,
                        },
                        {
                            text: "Quem participa dos eventos e encontros da comunidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa triangular evidência sobre um problema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Confirmar a dor em entrevistas, suporte e dados de uso",
                            isCorrect: true,
                        },
                        {
                            text: "Consultar três pessoas diferentes da mesma área comercial",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir a mesma pesquisa por três trimestres seguidos",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir o problema em três partes antes de priorizar algo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um cliente grande pede uma feature específica e o comercial pressiona. Que checagem o PM faz antes?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ver se a mesma dor aparece na base além daquele cliente",
                            isCorrect: true,
                        },
                        {
                            text: "Atender de imediato, porque contrato grande define prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Recusar por princípio, já que pedido de cliente enviesa tudo",
                            isCorrect: false,
                        },
                        {
                            text: "Transferir a decisão para a diretoria comercial da empresa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Acessibilidade e inclusão como decisão de produto",
            blocks: [
                {
                    type: "text",
                    value: "# Alcance, obrigação e oportunidade\n\nAcessibilidade costuma ser tratada como tarefa técnica de última hora, e essa é a leitura mais cara possível. Ela é, antes de tudo, uma decisão de produto sobre QUEM CONSEGUE USAR o que você constrói.\n\nComeça pelo tamanho do mercado. O Censo de 2022 contou milhões de brasileiros com alguma deficiência, entre visual, auditiva, motora e intelectual. Some a isso as deficiências TEMPORÁRIAS, como um braço quebrado ou uma cirurgia nos olhos, e as SITUACIONAIS, como usar o celular no sol forte, com uma mão só segurando a criança, ou em ambiente barulhento sem fone. A conta deixa de ser sobre um grupo específico e passa a ser sobre praticamente todo mundo, em algum momento.\n\nExiste também o lado normativo. A Lei Brasileira de Inclusão trata acessibilidade digital como obrigação, e não como cortesia, e referências técnicas como as diretrizes WCAG orientam o que fazer na prática. Em 2026, exigência de acessibilidade já aparece com frequência em contratos com órgãos públicos e grandes empresas, o que transforma o tema em requisito comercial, não apenas ético.",
                },
                {
                    type: "table",
                    value: '[["Barreira","Quem ela afeta","Decisão de produto"],["Contraste baixo no texto","Baixa visão, tela no sol","Definir contraste mínimo no design"],["Botão sem rótulo de texto","Quem usa leitor de tela","Exigir rótulo em cada elemento"],["Fluxo que exige mouse","Deficiência motora e teclado","Garantir navegação por teclado"],["App pesado demais","Aparelho antigo e dado limitado","Medir tamanho e tempo de carga"]]',
                },
                {
                    type: "quote",
                    value: "Acessibilidade tratada no fim vira reforma cara. Tratada no começo, é quase sempre uma sequência de escolhas simples que ninguém percebe.",
                },
                {
                    type: "text",
                    value: "## Inclusão não para na deficiência\n\nNo Brasil, o recorte de inclusão vai além. Boa parte da base de muitos produtos acessa por aparelho de entrada, com pouca memória, em conexão instável e com franquia de dados contada. Um app que só funciona bem em celular caro e wi-fi rápido está escolhendo, sem dizer, atender uma fatia estreita do país. Some o letramento digital: gente que usa internet há pouco tempo, pessoas idosas, quem tem baixa escolaridade formal e não decifra jargão de sistema.\n\nO critério prático é entrar cedo e medir. Acessibilidade na definição de pronto do time, teste com leitor de tela e navegação por teclado antes de lançar, contraste verificado no design, textos alternativos em imagens que carregam informação, mensagens de erro em português claro em vez de código. Nada disso é caro quando é hábito; tudo isso é caro quando vira mutirão de correção depois de uma notificação judicial ou da perda de um contrato.\n\nE tem o ganho silencioso: quase toda melhoria de acessibilidade melhora a experiência de todo mundo. Contraste bom ajuda quem está no ônibus, rótulo claro ajuda quem tem pressa, app leve ajuda até quem tem aparelho novo.",
                },
            ],
            questions: [
                {
                    statement: "O que são deficiências situacionais?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Limitações do contexto, como sol forte ou uma mão só",
                            isCorrect: true,
                        },
                        {
                            text: "Condições permanentes registradas em laudo médico oficial",
                            isCorrect: false,
                        },
                        {
                            text: "Falhas técnicas do aplicativo que aparecem em certas telas",
                            isCorrect: false,
                        },
                        {
                            text: "Restrições impostas pelas lojas de aplicativos aos produtos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual referência técnica orienta acessibilidade na web?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As diretrizes WCAG, usadas como padrão do setor",
                            isCorrect: true,
                        },
                        {
                            text: "O manual interno de marca da empresa que constrói o site",
                            isCorrect: false,
                        },
                        {
                            text: "As regras de publicação das lojas de aplicativos móveis",
                            isCorrect: false,
                        },
                        {
                            text: "O guia de estilo de código adotado pelo time de engenharia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que deixar acessibilidade para o fim do projeto sai caro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Vira reforma de fluxos já construídos e testados",
                            isCorrect: true,
                        },
                        {
                            text: "Porque as ferramentas de teste custam mais no fim do ano",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a lei exige que o tema seja tratado no primeiro dia",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os designers cobram mais caro por revisões tardias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como a inclusão aparece além da deficiência no contexto brasileiro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Aparelho de entrada, conexão instável e dado contado",
                            isCorrect: true,
                        },
                        {
                            text: "Preferência dos usuários por aplicativos de marcas nacionais",
                            isCorrect: false,
                        },
                        {
                            text: "Necessidade de traduzir o produto para vários idiomas locais",
                            isCorrect: false,
                        },
                        {
                            text: "Exigência de que todo produto tenha versão para computador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer tornar acessibilidade parte do trabalho, e não um mutirão anual. Qual medida sustenta isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Incluir critérios de acessibilidade na definição de pronto",
                            isCorrect: true,
                        },
                        {
                            text: "Criar um comitê trimestral que audita as telas já lançadas",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar consultoria externa uma vez por ano para revisar",
                            isCorrect: false,
                        },
                        {
                            text: "Publicar um manifesto público de compromisso com inclusão",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Negócio básico pra produto",
    aulas: [
        {
            titulo: "Modelos de receita",
            blocks: [
                {
                    type: "text",
                    value: "# De onde vem o dinheiro\n\nAntes de discutir qualquer feature, vale responder uma pergunta simples e decisiva: como esse produto ganha dinheiro? Cinco modelos cobrem a maior parte do mercado. ASSINATURA: o cliente paga por período pra continuar tendo acesso, como numa ferramenta de gestão ou num streaming; a receita é previsível e o inimigo é o cancelamento. TRANSAÇÃO: a empresa fica com uma fatia de cada operação, como a comissão de um marketplace ou a taxa de um meio de pagamento; a receita acompanha o volume que passa pelo produto. ANÚNCIO: quem paga é o anunciante e o uso é gratuito, então a moeda vira atenção e dado.\n\nFREEMIUM, a rigor, não é modelo de receita, e sim estratégia de aquisição: uma versão gratuita útil atrai gente e uma fatia pequena converte pra um plano pago. Funciona quando servir quem não paga custa pouco e quando a linha entre grátis e pago é honesta. LICENÇA ou venda única: paga-se uma vez pelo direito de uso, comum em software corporativo instalado e em jogos.\n\nO ponto que interessa é este: cada modelo premia um comportamento diferente e, sem ninguém perceber, molda o produto inteiro.",
                },
                {
                    type: "table",
                    value: '[["Modelo","Quem paga","O que o produto otimiza","Risco típico"],["Assinatura","O usuário, por período","Uso recorrente e retenção","Cancelamento silencioso"],["Transação","Quem opera na plataforma","Volume e conclusão do fluxo","Só fecha a conta com escala"],["Anúncio","O anunciante","Tempo de tela e alcance","Interesse do usuário fica em segundo plano"],["Freemium","Uma fatia dos usuários","Conversão do grátis pro pago","Custo alto de servir quem não paga"],["Licença","O cliente, uma vez","Fechar venda e lançar versões","Receita pouco previsível"]]',
                },
                {
                    type: "quote",
                    value: "Me diga como o produto ganha dinheiro e eu te digo o que ele vai priorizar quando a meta apertar no fim do trimestre.",
                },
                {
                    type: "text",
                    value: "## O modelo molda o produto\n\nRepare como o incentivo escorre pra dentro das decisões. Em produto de anúncio, tempo de tela vira meta, e isso pode entrar em conflito direto com resolver a vida da pessoa rápido. Em assinatura, o time inteiro passa a viver de ativação, hábito e motivo pra voltar, porque um cliente que some por dois meses cancela no terceiro. Em transação, disponibilidade e conclusão do fluxo viram obsessão: se a operação falha, não existe receita naquele instante. Em freemium, decidir o que fica de graça é decisão de produto, não de comercial. Em licença, o produto vive de justificar a próxima versão.\n\nModelos híbridos são comuns: um marketplace com assinatura pro vendedor e destaque pago, ou uma ferramenta com mensalidade mais cobrança por uso. E mudar de modelo é mudar o produto: passar a cobrar por algo que era gratuito redesenha incentivos, comunicação e até a divisão dos times.\n\nO critério de saúde é o alinhamento entre o que se cobra e o valor entregue. Quando a receita cresce junto com o valor percebido, produto e negócio empurram pro mesmo lado. Quando não cresce, nasce o produto que lucra enquanto o usuário perde tempo, e essa contradição sempre cobra a conta.",
                },
            ],
            questions: [
                {
                    statement: "Como funciona o modelo de receita por transação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A empresa fica com uma fatia de cada operação feita",
                            isCorrect: true,
                        },
                        {
                            text: "O cliente paga um valor fixo por mês pra ter acesso",
                            isCorrect: false,
                        },
                        {
                            text: "O anunciante paga para exibir mensagens aos usuários",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário compra uma licença única e usa pra sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que freemium é descrito como estratégia de aquisição?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A versão grátis atrai gente e uma fatia vira pagante",
                            isCorrect: true,
                        },
                        {
                            text: "Ela elimina qualquer custo de servir os usuários gratuitos",
                            isCorrect: false,
                        },
                        {
                            text: "Ela garante receita previsível desde o primeiro mês de uso",
                            isCorrect: false,
                        },
                        {
                            text: "Ela substitui a necessidade de qualquer canal de marketing",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual conflito é típico de produtos sustentados por anúncio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Prender atenção pode brigar com resolver a vida rápido",
                            isCorrect: true,
                        },
                        {
                            text: "Cobrar mensalidade acaba reduzindo o alcance da audiência",
                            isCorrect: false,
                        },
                        {
                            text: "Vender licença única impede qualquer atualização posterior",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o volume de transações derruba a margem do negócio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num produto por assinatura, qual métrica costuma virar preocupação de todo o time?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O cancelamento, porque ele corrói a receita recorrente",
                            isCorrect: true,
                        },
                        {
                            text: "O número de anunciantes ativos na plataforma a cada mês",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de licenças vendidas no fechamento do ano",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo médio de tela por sessão de cada usuário gratuito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer passar a cobrar por um recurso que hoje é gratuito. Por que isso é decisão de produto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Muda incentivos, comunicação e o valor percebido pelo uso",
                            isCorrect: true,
                        },
                        {
                            text: "Porque só a área de produto pode alterar preços na empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cobrança nova exige aprovação prévia do órgão regulador",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o time de engenharia precisa refazer todo o aplicativo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Proposta de valor",
            blocks: [
                {
                    type: "text",
                    value: "# O que resolve, pra quem, melhor que quem\n\nProposta de valor é a resposta curta pra uma pergunta que o mercado faz o tempo todo: por que eu usaria isso, e não a alternativa que já tenho? Ela tem três partes obrigatórias. O QUE RESOLVE: o problema concreto, na linguagem de quem sofre, não no jargão da empresa. PRA QUEM: o segmento específico, porque uma proposta que serve pra todo mundo não convence ninguém. MELHOR QUE QUEM: a comparação honesta com a alternativa real.\n\nEssa terceira parte é a que mais se erra. A alternativa quase nunca é o concorrente óbvio: costuma ser a planilha do fim de semana, o grupo de mensagens improvisado, o caderno, o estagiário que faz na mão ou simplesmente não fazer nada e conviver com a dor. Quem ignora a alternativa real escreve uma proposta bonita e perde a venda pro Excel.\n\nO teste mais rápido de qualidade: se um concorrente puder assinar a sua frase sem mudar uma palavra, ela não diz nada. 'Somos a plataforma completa e inovadora que simplifica a gestão' descreve mil empresas, portanto não descreve a sua.",
                },
                {
                    type: "code",
                    value: "FRASE DE POSICIONAMENTO (rascunho de trabalho)\n\nPara [segmento especifico]\nque [situacao ou dor recorrente],\no [produto] e um [categoria conhecida]\nque [beneficio principal, mensuravel se possivel].\nDiferente de [alternativa real que a pessoa usa hoje],\nele [diferencial que a alternativa nao consegue entregar].\n\nExemplo:\nPara o lojista pequeno que fecha o mes na planilha,\no X e um painel de repasses que mostra o quanto entrou por dia\ne aponta divergencia. Diferente da planilha manual,\nele concilia sozinho e guarda o historico auditavel.",
                },
                {
                    type: "table",
                    value: '[["Parte","Pergunta que responde","Erro comum"],["Problema","Que dor concreta some?","Descrever a feature, não a dor"],["Segmento","Pra quem exatamente?","Dizer que serve para qualquer empresa"],["Benefício","O que melhora e quanto?","Adjetivo vago como completo e inovador"],["Alternativa","O que a pessoa usa hoje?","Ignorar planilha e o não fazer nada"],["Diferencial","Por que não copiam amanhã?","Confundir feature nova com vantagem"]]',
                },
                {
                    type: "quote",
                    value: "Se o seu concorrente pode assinar embaixo da sua proposta de valor sem mudar nada, você ainda não tem uma proposta de valor.",
                },
                {
                    type: "text",
                    value: "## Canvas mental, sem burocracia\n\nExistem quadros e canvas famosos pra isso, e eles ajudam. Mas o essencial cabe numa folha e em quatro perguntas que você responde com evidência, não com opinião: qual dor, de quem, comparada a quê, e por que a pessoa acreditaria em você. A parte da crença é subestimada: promessa grande sem prova gera desconfiança, e a prova pode ser um número, um caso real, uma garantia ou uma versão de teste sem fricção.\n\nProposta de valor é HIPÓTESE até alguém demonstrar com comportamento que ela vale. As formas de testar são baratas: apresentar a frase a dez clientes e observar qual parte faz os olhos brilharem, medir se uma página que comunica a proposta converte melhor que a atual, ver quantas pessoas seguem até o fim quando a promessa muda.\n\nUm cuidado final para times técnicos: proposta de valor não é lista de funcionalidades. 'Integra com quinze sistemas' é característica; 'você para de digitar o mesmo pedido em dois lugares' é valor. A tradução entre uma coisa e outra é trabalho de produto, e ela costuma ser a diferença entre um produto que se explica sozinho e um que precisa de vendedor pra cada conversa.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as três partes de uma proposta de valor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O que resolve, para quem e melhor que qual alternativa",
                            isCorrect: true,
                        },
                        {
                            text: "Preço cobrado, prazo de entrega e canal de distribuição usado",
                            isCorrect: false,
                        },
                        {
                            text: "Visão da empresa, missão declarada e valores do time interno",
                            isCorrect: false,
                        },
                        {
                            text: "Lista de features, tecnologias usadas e integrações previstas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual costuma ser a alternativa real que o usuário já usa hoje?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Planilha, caderno ou simplesmente conviver com a dor",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre o concorrente direto mais conhecido do mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Um produto internacional que ainda nem chegou ao país",
                            isCorrect: false,
                        },
                        {
                            text: "Uma solução construída internamente pela própria empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que 'plataforma completa e inovadora' é uma proposta de valor fraca?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Qualquer concorrente poderia assinar a mesma frase",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a frase é longa demais para caber num anúncio",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a palavra plataforma não existe no vocabulário técnico",
                            isCorrect: false,
                        },
                        {
                            text: "Porque propostas de valor precisam citar o preço do produto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre característica e valor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Característica é o que existe; valor é o que melhora",
                            isCorrect: true,
                        },
                        {
                            text: "Característica é técnica; valor é sempre o preço cobrado",
                            isCorrect: false,
                        },
                        {
                            text: "Característica vale para B2B; valor só se aplica ao B2C",
                            isCorrect: false,
                        },
                        {
                            text: "Característica é medida; valor é impossível de mensurar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time escreveu a proposta de valor e quer saber se ela se sustenta. Qual teste dá mais informação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Apresentar a clientes e medir reação e conversão real",
                            isCorrect: true,
                        },
                        {
                            text: "Pedir que a diretoria vote na frase que soa mais impactante",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar o texto com o site dos concorrentes mais famosos",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar uma agência para reescrever a frase com mais estilo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Unit economics na conta de padaria",
            blocks: [
                {
                    type: "text",
                    value: "# CAC, LTV e margem numa folha de papel\n\nUnit economics é a conta de quanto vale um cliente e quanto custa conquistá-lo. Três números bastam pra começar. O CAC (custo de aquisição de cliente) soma tudo o que foi gasto pra trazer clientes novos, incluindo mídia, comissões e time comercial, dividido pelo número de clientes que entraram. A MARGEM é o que sobra do preço depois do custo de servir: infraestrutura, taxa do meio de pagamento, suporte. O LTV (valor do cliente ao longo da vida) é quanto de margem aquele cliente deixa enquanto permanece.\n\nA conta de padaria funciona assim. Uma assinatura custa 40 reais por mês, com margem de 70%, ou seja, 28 reais líquidos por mês. Se 5% da base cancela por mês, a vida média é de 1 dividido por 0,05, isto é, 20 meses. O LTV fica em 28 vezes 20, ou 560 reais. Se o CAC é de 180 reais, a relação LTV sobre CAC é de cerca de 3,1, e o tempo pra recuperar o investimento é 180 dividido por 28, aproximadamente 6 meses.\n\nNenhum PM precisa ser analista financeiro. Precisa saber fazer essa conta de cabeça.",
                },
                {
                    type: "table",
                    value: '[["Item","Valor no exemplo","Como se obtém"],["Preço mensal","40 reais","Plano cobrado do cliente"],["Margem mensal","28 reais","Preço menos o custo de servir"],["Cancelamento mensal","5%","Cancelamentos sobre a base ativa"],["Vida média","20 meses","1 dividido pelo cancelamento mensal"],["LTV","560 reais","Margem mensal vezes a vida média"],["CAC","180 reais","Gasto de aquisição por cliente novo"],["LTV sobre CAC","3,1","LTV dividido pelo CAC"],["Payback","Cerca de 6 meses","CAC dividido pela margem mensal"]]',
                },
                {
                    type: "quote",
                    value: "Retenção não é só um tema de produto, é o motor do LTV. Cada ponto de cancelamento a menos alonga a vida do cliente e paga a aquisição mais cedo.",
                },
                {
                    type: "text",
                    value: "## Onde produto move esses números\n\nReferências comuns de mercado dizem que uma relação de LTV sobre CAC a partir de 3 e um payback abaixo de doze meses indicam negócio saudável. São referências, não leis: negócios com capital caro precisam de payback mais curto, e contratos longos toleram números diferentes. O que não muda é a lógica: se cada cliente custa mais do que devolve, crescer só acelera o prejuízo.\n\nO time de produto tem alavancas diretas em quase todos os termos. Reduzir cancelamento alonga a vida média e infla o LTV. Melhorar ativação faz o cliente chegar ao valor antes de desistir, o que encurta o payback. Autoatendimento e mensagens de erro claras derrubam o custo de suporte, aumentando a margem. Expansão de plano e uso adicional elevam a receita por cliente sem novo CAC.\n\nTrês erros aparecem sempre. Calcular LTV com receita bruta em vez de margem, o que produz números lindos e falsos. Esquecer custo de servir, principalmente suporte e taxas. E usar coortes muito recentes pra estimar vida média, o que sempre superestima a permanência. Conta simples e honesta vale mais que planilha sofisticada com premissa errada.",
                },
            ],
            questions: [
                {
                    statement: "O que o CAC mede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quanto se gasta para conquistar um cliente novo",
                            isCorrect: true,
                        },
                        {
                            text: "Quanto um cliente gera de receita ao longo da vida",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto sobra do preço depois do custo de servir",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos clientes cancelam a assinatura a cada mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o LTV representa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A margem que o cliente deixa enquanto permanece",
                            isCorrect: true,
                        },
                        {
                            text: "O gasto total de marketing feito durante o trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo que a empresa leva pra recuperar o investimento",
                            isCorrect: false,
                        },
                        {
                            text: "O preço da assinatura mensal cobrada de cada cliente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com margem de 28 reais por mês e cancelamento mensal de 5%, qual é a vida média do cliente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Vinte meses, resultado de 1 dividido por 0,05",
                            isCorrect: true,
                        },
                        {
                            text: "Cinco meses, o mesmo número da taxa de cancelamento",
                            isCorrect: false,
                        },
                        {
                            text: "Doze meses, valor padrão adotado para qualquer assinatura",
                            isCorrect: false,
                        },
                        {
                            text: "Vinte e oito meses, o mesmo valor da margem mensal obtida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual erro mais infla artificialmente o cálculo de LTV?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usar receita bruta no lugar da margem por cliente",
                            isCorrect: true,
                        },
                        {
                            text: "Considerar o cancelamento observado nos últimos doze meses",
                            isCorrect: false,
                        },
                        {
                            text: "Incluir a taxa do meio de pagamento no custo de servir",
                            isCorrect: false,
                        },
                        {
                            text: "Separar clientes por plano contratado antes de fazer a conta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O payback está em dezoito meses e a diretoria quer encurtar. Qual alavanca de produto ajuda mais?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Melhorar ativação para o cliente chegar ao valor antes",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o investimento em mídia para trazer mais clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar o lançamento das próximas funcionalidades planejadas",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar mais vendedores para fechar contratos maiores",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O mercado brasileiro de tecnologia em 2026",
            blocks: [
                {
                    type: "text",
                    value: "# Onde produto cresce por aqui\n\nEm 2026, quatro frentes concentram boa parte das vagas de produto no Brasil, e todas têm a mesma origem: setores grandes da economia com processos ainda manuais.\n\nFINTECH continua sendo a maior escola de produto do país. A infraestrutura de pagamento instantâneo e as regras de compartilhamento de dados financeiros abriram espaço pra uma geração de produtos de crédito, cobrança, gestão financeira pra pequenos negócios e meios de pagamento embutidos em outros serviços. SAÚDE cresce em agendamento, atendimento a distância, gestão de clínicas e operadoras, com um detalhe importante: dado sensível e regulação fazem parte do trabalho diário.\n\nAGRO é a fronteira menos disputada e uma das mais interessantes: gestão de safra, rastreabilidade, compra de insumos e crédito rural, com usuários em campo, conexão instável e ciclos longos. EDUCAÇÃO segue forte em formação corporativa, preparação para provas e gestão escolar. Some varejo e logística, onde a briga é última milha, estoque e experiência de compra.\n\nO padrão que interessa pra carreira: o problema costuma ser mais de operação e confiança do que de tecnologia de ponta.",
                },
                {
                    type: "table",
                    value: '[["Setor","Por que produto cresce ali","Tipo de problema comum"],["Fintech","Infraestrutura nova e muita concorrência","Crédito, cobrança e conciliação"],["Saúde","Operação manual e dado sensível","Agendamento, prontuário e adesão"],["Agro","Cadeia longa e pouca digitalização","Safra, rastreabilidade e crédito"],["Educação","Formação contínua e escala","Engajamento, avaliação e gestão"],["Varejo e logística","Margem apertada e volume alto","Última milha, estoque e devolução"]]',
                },
                {
                    type: "quote",
                    value: "Vaga de produto raramente pede tecnologia nova. Pede alguém que entenda o negócio, leia dados sem medo e escreva com clareza suficiente pra alinhar gente.",
                },
                {
                    type: "text",
                    value: "## O que as vagas pedem em 2026\n\nLendo descrições de vaga de produto no Brasil, cinco exigências se repetem. DADOS: consultar, ler e questionar métricas, com SQL básico aparecendo com frequência até em posições de entrada. ESCRITA E COMUNICAÇÃO: documentos claros, apresentação de decisão, alinhamento com áreas que não respondem a você. DISCOVERY: falar com usuário, testar hipótese, evitar construir o que ninguém quer. NEGÓCIO: entender receita, custo e a conta que sustenta o produto. INGLÊS: em boa parte das vagas, ao menos pra leitura e documentação.\n\nDuas observações práticas. A primeira é que vaga de entrada com o título de PM é rara; a porta costuma ser Product Analyst, PO júnior ou uma transição interna vinda de suporte, dados, QA ou desenvolvimento. Trabalhar perto do produto dentro da empresa em que você já está costuma ser o caminho mais curto.\n\nA segunda é sobre prova de capacidade. Certificado isolado impressiona pouco. O que muda entrevista é conseguir contar uma história completa: qual problema, como você investigou, o que decidiu, o que aconteceu e o que aprendeu. Isso vale mesmo quando o caso é pequeno ou veio de outra função.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual setor é descrito como a maior escola de produto do país em 2026?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Fintech, puxado por pagamentos e crédito digital",
                            isCorrect: true,
                        },
                        {
                            text: "Games, puxado pelo consumo de entretenimento no celular",
                            isCorrect: false,
                        },
                        {
                            text: "Turismo, puxado pela retomada das viagens internacionais",
                            isCorrect: false,
                        },
                        {
                            text: "Construção civil, puxada por sistemas de gestão de obras",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual exigência aparece com frequência nas vagas de produto em 2026?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Saber consultar dados e questionar métricas do produto",
                            isCorrect: true,
                        },
                        {
                            text: "Programar aplicativos móveis em pelo menos duas linguagens",
                            isCorrect: false,
                        },
                        {
                            text: "Ter certificação internacional emitida por instituto famoso",
                            isCorrect: false,
                        },
                        {
                            text: "Gerenciar formalmente a equipe de engenharia e de design",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que característica marca os produtos voltados ao agro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usuário em campo, conexão instável e ciclo longo",
                            isCorrect: true,
                        },
                        {
                            text: "Público urbano e jovem com aparelhos de última geração",
                            isCorrect: false,
                        },
                        {
                            text: "Decisão de compra rápida e feita direto pelo aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Ausência total de regulação sobre os dados coletados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual costuma ser a porta de entrada realista na carreira de produto no Brasil?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Analyst, PO júnior ou transição interna na empresa",
                            isCorrect: true,
                        },
                        {
                            text: "Vaga de PM sênior em empresa grande logo no primeiro emprego",
                            isCorrect: false,
                        },
                        {
                            text: "Curso livre de produto seguido de contratação garantida",
                            isCorrect: false,
                        },
                        {
                            text: "Cargo de gestão de produto criado após uma pós-graduação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um candidato tem certificações mas nenhuma experiência formal em produto. O que mais ajuda na entrevista?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Contar um caso real com problema, decisão e resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Listar todos os cursos concluídos em ordem cronológica clara",
                            isCorrect: false,
                        },
                        {
                            text: "Demonstrar domínio teórico dos frameworks mais citados na área",
                            isCorrect: false,
                        },
                        {
                            text: "Explicar quais ferramentas de gestão de backlog já configurou",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métricas de negócio e métricas de produto",
            blocks: [
                {
                    type: "text",
                    value: "# A ponte entre a diretoria e o time\n\nExistem dois vocabulários de métrica dentro da mesma empresa, e a tradução entre eles é trabalho de produto. As MÉTRICAS DE NEGÓCIO respondem à pergunta 'a empresa vai bem?': receita recorrente, cancelamento, margem, custo de aquisição, satisfação medida por pesquisas como o NPS. São elas que aparecem na reunião de resultados e que a diretoria acompanha.\n\nAs MÉTRICAS DE PRODUTO respondem 'o produto está entregando valor?': quantas pessoas chegam ao primeiro valor, quanto tempo isso leva, com que frequência voltam, quantas concluem a tarefa principal sem erro, quantas usam o recurso que sustenta a proposta. São métricas que o time consegue mover na semana.\n\nO problema começa quando alguém cobra do time uma métrica que ele não controla sozinho. Receita depende de preço, campanha, mercado e sazonalidade; um time de produto influencia, mas não determina. A saída não é fugir do número de negócio, é construir a ponte: mostrar qual métrica de produto alimenta aquele resultado e assumir essa como meta operacional.",
                },
                {
                    type: "table",
                    value: '[["Métrica de negócio","Métrica de produto que a alimenta","Alavanca do time"],["Receita recorrente","Ativação e uso do recurso pago","Reduzir atrito até o primeiro valor"],["Cancelamento","Frequência de uso no primeiro mês","Criar motivo real pra voltar"],["Custo de servir","Chamados por cliente ativo","Autoatendimento e erro mais claro"],["NPS","Sucesso na tarefa principal","Remover fricção do fluxo central"]]',
                },
                {
                    type: "quote",
                    value: "Meta boa pra time de produto tem duas propriedades: o time consegue movê-la com o próprio trabalho e dá pra explicar em uma frase como ela vira dinheiro.",
                },
                {
                    type: "text",
                    value: "## NPS, churn e o que eles não dizem\n\nO NPS nasce de uma pergunta única sobre a chance de recomendar, numa escala de zero a dez. Quem dá nove ou dez é promotor, sete e oito são neutros, de zero a seis são detratores; o índice é o percentual de promotores menos o de detratores, variando de menos cem a cem. É um termômetro útil de relação, e é péssimo como bússola: ele diz que algo vai bem ou mal, nunca o que fazer. O valor real está no campo aberto que vem depois da nota, e na comparação da sua própria série ao longo do tempo, não com o número de outra empresa.\n\nO cancelamento também engana quando olhado como número único. Existe o VOLUNTÁRIO, quando a pessoa decide sair, e o INVOLUNTÁRIO, quando o pagamento falha por cartão vencido ou limite. O segundo costuma responder por uma fatia relevante e se resolve com produto e comunicação, não com nova feature.\n\nA prática que sustenta a ponte é a árvore de métricas: escreva o resultado de negócio no topo, quebre nos comportamentos que o produzem e escolha um deles como foco do trimestre. Quem enxerga esse caminho consegue defender prioridade com argumento de negócio, que é a conversa que abre porta na carreira.",
                },
            ],
            questions: [
                {
                    statement: "Qual delas é uma métrica de negócio?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A receita recorrente acompanhada pela diretoria",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo até o usuário chegar ao primeiro valor",
                            isCorrect: false,
                        },
                        {
                            text: "A taxa de conclusão do cadastro no aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "O número de erros exibidos na tela de pagamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o NPS é calculado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Percentual de promotores menos o de detratores",
                            isCorrect: true,
                        },
                        {
                            text: "Média simples de todas as notas dadas pelos clientes",
                            isCorrect: false,
                        },
                        {
                            text: "Soma dos promotores dividida pelo total de respostas",
                            isCorrect: false,
                        },
                        {
                            text: "Quantidade de neutros sobre o total de clientes ativos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que cobrar receita direta de um time de produto costuma gerar frustração?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O time influencia, mas não controla preço e mercado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque receita é informação restrita à diretoria da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Porque métricas financeiras mudam de definição todo trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Porque times de produto não devem discutir assuntos de negócio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre cancelamento voluntário e involuntário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um é decisão do cliente; o outro é falha no pagamento",
                            isCorrect: true,
                        },
                        {
                            text: "Um ocorre no primeiro mês; o outro só depois de um ano",
                            isCorrect: false,
                        },
                        {
                            text: "Um afeta planos anuais; o outro atinge apenas os mensais",
                            isCorrect: false,
                        },
                        {
                            text: "Um é registrado pelo suporte; o outro nunca é contabilizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A diretoria pede aumento de receita e o time precisa de uma meta operacional. Qual caminho a aula indica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Montar a árvore que liga receita ao comportamento de uso",
                            isCorrect: true,
                        },
                        {
                            text: "Adotar a própria receita como meta semanal do time inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher a métrica de produto que já vem subindo sozinha",
                            isCorrect: false,
                        },
                        {
                            text: "Aguardar o fim do trimestre para avaliar o efeito das entregas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Comunicação e stakeholders",
    aulas: [
        {
            titulo: "Escrever é pensar",
            blocks: [
                {
                    type: "text",
                    value: "# A escrita é a principal ferramenta de produto\n\nQuem trabalha com produto escreve o dia inteiro: documento de problema, resumo de decisão, mensagem que alinha três áreas, nota de lançamento. Não é burocracia, é a ferramenta central do ofício, por duas razões.\n\nA primeira é que ESCREVER REVELA BURACO NO RACIOCÍNIO. Na conversa, dá pra sustentar uma ideia frouxa com entonação, gesto e simpatia. No texto, não. Quando você tenta escrever por que aquele problema é prioridade e trava na terceira linha, você acabou de descobrir que ainda não entendeu o problema. Esse desconforto é o maior benefício do exercício, não o efeito colateral.\n\nA segunda é que TEXTO ESCALA. Uma reunião alinha quem estava na sala naquele horário; um documento alinha quem chegou depois, quem estava de férias, quem entrou no time no mês seguinte e a área que só será afetada no trimestre que vem. Produto vive de contexto compartilhado, e contexto que só existe na memória de quem participou some rápido.\n\nO formato mais útil pra decisão é o documento de UMA PÁGINA. Ele obriga a escolher o que importa e cabe na agenda de quem decide.",
                },
                {
                    type: "code",
                    value: "ONE PAGER DE PRODUTO (uma pagina, sem anexo obrigatorio)\n\nProblema: quem sofre, em que situacao, com que frequencia, a que custo\nEvidencia: 3 fatos com fonte e data (uso, chamado, entrevista)\nObjetivo: que resultado queremos mover e em quanto tempo\nOpcoes consideradas: A, B e nao fazer nada, com custo e risco\nRecomendacao: qual opcao e por que, em uma frase\nComo saberemos: metrica de sucesso e quando vamos ler\nRiscos: o que pode dar errado e o que nos faria mudar de ideia\nDecisao pedida: o que voce precisa de quem esta lendo",
                },
                {
                    type: "table",
                    value: '[["Documento","Quando usar","Tamanho alvo"],["One pager","Pedir uma decisão","Uma página, sem anexo"],["Registro de decisão","Depois de decidir algo","Poucos parágrafos com data"],["Documento de problema","Antes de discutir solução","Uma a duas páginas"],["Nota de lançamento","Comunicar o que mudou","Curto, com impacto explícito"]]',
                },
                {
                    type: "quote",
                    value: "Se você não consegue escrever a decisão em uma página, você ainda não decidiu. Está negociando com a própria dúvida usando slides como anestesia.",
                },
                {
                    type: "text",
                    value: "## Seis regras que melhoram qualquer texto de produto\n\nPrimeira: COMECE PELA CONCLUSÃO. Quem lê quer saber logo o que você está propondo e o que precisa de resposta; o raciocínio vem depois, pra quem quiser conferir. Segunda: um documento, um assunto. Texto que trata de três decisões não recebe nenhuma.\n\nTerceira: dado com FONTE E DATA. 'A conversão caiu' não sustenta nada; 'a conversão do cadastro caiu de 42% para 31% entre março e maio, medida no painel de funil' sustenta. Quarta: escreva para quem chega sem contexto, porque essa pessoa sempre aparece, e costuma ser quem decide.\n\nQuinta: corte jargão e adjetivo. 'Solução robusta e escalável' não informa; 'aguenta o pico de segunda sem fila' informa. Sexta: revise cortando. Quase todo primeiro rascunho encolhe vinte por cento sem perder nada, e fica mais forte.\n\nUm hábito que muda a carreira de quem está começando: depois de qualquer decisão relevante, escreva cinco linhas com o que foi decidido, por quê, quem decidiu e o que foi descartado. Em três meses, você terá um histórico que responde 'por que fizemos assim?' sem depender da memória de ninguém, e virá a referência natural do time.",
                },
            ],
            questions: [
                {
                    statement: "Por que escrever ajuda a pensar melhor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O texto expõe buracos que a conversa disfarça",
                            isCorrect: true,
                        },
                        {
                            text: "O texto elimina a necessidade de conversar com o time",
                            isCorrect: false,
                        },
                        {
                            text: "O texto garante que a decisão tomada estará correta",
                            isCorrect: false,
                        },
                        {
                            text: "O texto substitui a análise de dados sobre o problema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a vantagem do texto sobre a reunião?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele alinha também quem não estava presente na hora",
                            isCorrect: true,
                        },
                        {
                            text: "Ele impede que qualquer pessoa discorde da proposta feita",
                            isCorrect: false,
                        },
                        {
                            text: "Ele dispensa a participação das áreas afetadas na decisão",
                            isCorrect: false,
                        },
                        {
                            text: "Ele acelera a entrega técnica das funcionalidades do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa começar um documento pela conclusão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Abrir com a proposta e o que você precisa de resposta",
                            isCorrect: true,
                        },
                        {
                            text: "Colocar o histórico completo do projeto logo no início",
                            isCorrect: false,
                        },
                        {
                            text: "Listar todos os dados coletados antes de qualquer análise",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever primeiro os riscos e só no fim a recomendação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que todo dado citado num documento precisa de fonte e data?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem isso o número não sustenta a decisão proposta",
                            isCorrect: true,
                        },
                        {
                            text: "Porque auditorias externas exigem esse formato por norma",
                            isCorrect: false,
                        },
                        {
                            text: "Porque documentos sem data não podem ser compartilhados",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a diretoria só aceita números vindos do financeiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um PM trava ao tentar escrever por que um problema é prioridade. O que isso costuma indicar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Que o entendimento do problema ainda está incompleto",
                            isCorrect: true,
                        },
                        {
                            text: "Que o formato escolhido de documento é inadequado ao caso",
                            isCorrect: false,
                        },
                        {
                            text: "Que a decisão deveria ser tomada apenas de forma verbal",
                            isCorrect: false,
                        },
                        {
                            text: "Que faltam ferramentas melhores de escrita colaborativa ali",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Apresentar decisões",
            blocks: [
                {
                    type: "text",
                    value: "# Contexto, opções, recomendação\n\nExiste um formato que resolve a maioria das apresentações de produto, e ele tem três partes. CONTEXTO: qual o problema, por que agora, o que já sabemos. OPÇÕES: os caminhos considerados, com custo, risco e o que cada um sacrifica, incluindo sempre a opção de não fazer nada. RECOMENDAÇÃO: qual você escolheria, por quê, e o que faria você mudar de ideia.\n\nA terceira parte é a que separa profissional de mensageiro. Apresentar três opções sem recomendar transfere a decisão pra plateia e faz a reunião durar o dobro. Recomendar sem mostrar as alternativas soa a imposição e convida a plateia a inventar opções no meio da conversa. As duas coisas juntas produzem o efeito que você quer: quem ouve entende o raciocínio, confia no processo e decide rápido.\n\nUm detalhe subestimado: diga desde o começo O QUE VOCÊ PRECISA daquela sala. Decisão? Aprovação de orçamento? Apenas informação? Reunião sem pedido explícito termina em 'legal, vamos pensar', e volta na agenda duas semanas depois com o mesmo assunto e menos energia.",
                },
                {
                    type: "table",
                    value: '[["Parte","O que entra","Erro comum"],["Contexto","Problema, urgência e evidência","Contar toda a história do projeto"],["Opções","Caminhos com custo e risco","Esconder a alternativa incômoda"],["Recomendação","Sua escolha e o porquê","Não recomendar nada por receio"],["Pedido","O que você precisa da sala","Terminar sem definir o próximo passo"]]',
                },
                {
                    type: "quote",
                    value: "Reunião de decisão que termina sem decisão vira reunião de novo, com as mesmas pessoas, menos energia e o problema um pouco mais caro.",
                },
                {
                    type: "text",
                    value: "## Como conduzir a conversa\n\nMande o material antes, e deixe claro que a leitura prévia é esperada. Isso economiza metade da reunião e melhora a qualidade das perguntas. Abra dizendo o pedido em uma frase: 'preciso da decisão entre A e B hoje, porque a janela de integração fecha no dia vinte'. Depois apresente contexto e opções sem enfeitar o caminho que você prefere: quem percebe que só a sua opção foi bem descrita perde a confiança no resto.\n\nQuando houver discordância, separe TIPO DE DESACORDO. Se for sobre o fato, resolve com dado, e às vezes é melhor buscar o dado depois do que discutir no escuro. Se for sobre o risco tolerado, é decisão de quem responde pelo resultado. Se for sobre prioridade, a conversa é de estratégia, não de solução, e talvez a reunião mude de assunto.\n\nFeche sempre com registro: o que ficou decidido, quem decidiu, o que ficou pendente, quem faz o quê e até quando. Publique no mesmo dia. Decisão que não vira texto some, e você vai gastar a mesma energia daqui a um mês defendendo algo que já tinha sido combinado.",
                },
            ],
            questions: [
                {
                    statement: "Quais são as três partes do formato de apresentação de decisão?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Contexto, opções consideradas e recomendação",
                            isCorrect: true,
                        },
                        {
                            text: "Cronograma, orçamento e alocação de pessoas no time",
                            isCorrect: false,
                        },
                        {
                            text: "Visão, missão e valores que orientam a área de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Introdução, desenvolvimento e conclusão do relatório",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que incluir a opção de não fazer nada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela é uma alternativa real e revela o custo de agir",
                            isCorrect: true,
                        },
                        {
                            text: "Ela aumenta o número de páginas do material apresentado",
                            isCorrect: false,
                        },
                        {
                            text: "Ela protege o time de qualquer cobrança futura da diretoria",
                            isCorrect: false,
                        },
                        {
                            text: "Ela garante que a decisão será adiada para o próximo ciclo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o problema de apresentar opções sem recomendar nenhuma?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Transfere a decisão para a plateia e alonga a conversa",
                            isCorrect: true,
                        },
                        {
                            text: "Impede que os participantes façam perguntas sobre os dados",
                            isCorrect: false,
                        },
                        {
                            text: "Obriga o time a construir todas as alternativas mostradas",
                            isCorrect: false,
                        },
                        {
                            text: "Elimina a necessidade de registrar o resultado da reunião",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como distinguir os tipos de desacordo numa reunião de decisão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Separar desacordo de fato, de risco e de prioridade",
                            isCorrect: true,
                        },
                        {
                            text: "Identificar quem tem o cargo mais alto entre os presentes",
                            isCorrect: false,
                        },
                        {
                            text: "Contar quantas pessoas defendem cada uma das alternativas",
                            isCorrect: false,
                        },
                        {
                            text: "Adiar toda discussão até a próxima reunião do comitê gestor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A apresentação descreveu bem só a opção preferida do PM. Qual é o efeito mais provável disso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A sala perde confiança e passa a questionar todo o resto",
                            isCorrect: true,
                        },
                        {
                            text: "A decisão sai mais rápido, já que há menos caminhos a avaliar",
                            isCorrect: false,
                        },
                        {
                            text: "O time ganha autonomia para executar sem revisão posterior",
                            isCorrect: false,
                        },
                        {
                            text: "Os stakeholders passam a delegar decisões futuras ao próprio PM",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Dizer não com evidência e alternativa",
            blocks: [
                {
                    type: "text",
                    value: "# O não é parte do trabalho\n\nPriorizar é escolher, e escolher significa dizer não a coisas legítimas, pedidas por pessoas razoáveis, que resolveriam problemas reais. Quem não consegue dizer não acaba dizendo sim pra tudo, e o resultado é pior pra todo mundo: o time fica com trinta itens em andamento, nada termina no prazo e a confiança se desgasta em silêncio. O sim covarde é mais destrutivo que o não claro.\n\nExistem três nãos diferentes, e confundi-los cria briga desnecessária. O 'NÃO AGORA' reconhece o valor e explica a fila: outra coisa está na frente por um critério, e há um momento previsto pra revisar. O 'NÃO ASSIM' aceita o problema e recusa a solução proposta, oferecendo um caminho mais barato ou mais seguro. E o 'NÃO, PORQUE CONFLITA' é o mais duro: aquilo vai contra o objetivo do período ou contra o público que decidimos servir, e não é questão de fila.\n\nOs três só funcionam com duas coisas anexadas: EVIDÊNCIA de por que a prioridade é outra e ALTERNATIVA do que pode ser feito no lugar, mesmo que pequena.",
                },
                {
                    type: "table",
                    value: '[["Tipo de não","Quando usar","O que precisa vir junto"],["Não agora","O valor existe, a fila é outra","Critério da fila e data de revisão"],["Não assim","O problema é real, a solução não","Caminho alternativo mais barato"],["Não, conflita","Vai contra o objetivo do período","O objetivo e quem o definiu"],["Sim covarde","Nunca","Nada: ele só adia a frustração"]]',
                },
                {
                    type: "quote",
                    value: "Um não com critério explicado gera respeito. Um sim que nunca acontece gera desconfiança, e você paga essa conta na próxima negociação.",
                },
                {
                    type: "text",
                    value: "## Como dizer não sem queimar a relação\n\nA sequência que funciona tem quatro passos. Primeiro, REPITA O PROBLEMA com as palavras de quem pediu, até a pessoa concordar que você entendeu. Boa parte do conflito nasce da sensação de não ter sido ouvido, e não da recusa em si. Segundo, mostre a fila e o critério: o que está na frente, por qual razão e qual resultado esperado. Transparência sobre o critério transforma uma decisão pessoal em decisão de produto.\n\nTerceiro, ofereça algo: uma versão mínima que cabe agora, um contorno operacional temporário, uma data pra revisar com dado novo, ou o compromisso de medir a dor pra decidir melhor no próximo ciclo. Quarto, registre por escrito, com data. Isso protege os dois lados e evita a reabertura eterna do mesmo assunto.\n\nE existe o não que você não deveria dar sozinho. Quando o pedido carrega risco legal, compromisso contratual assinado ou consequência séria pro negócio, a decisão precisa subir com clareza, e isso não é fraqueza: é reconhecer quem responde pelo quê. Escalar bem significa levar contexto, opções e recomendação, não empurrar o problema pra cima.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza o não agora?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reconhece o valor e explica a fila com critério",
                            isCorrect: true,
                        },
                        {
                            text: "Recusa o pedido de forma definitiva e sem explicação",
                            isCorrect: false,
                        },
                        {
                            text: "Aceita o pedido e o coloca no topo da lista do time",
                            isCorrect: false,
                        },
                        {
                            text: "Transfere a decisão para a diretoria da área pedinte",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o sim covarde é pior que um não claro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele só adia a frustração e trava o time com excesso",
                            isCorrect: true,
                        },
                        {
                            text: "Ele obriga o time a trabalhar horas extras todo trimestre",
                            isCorrect: false,
                        },
                        {
                            text: "Ele impede que o pedido volte a ser discutido no futuro",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige aprovação formal de todas as áreas envolvidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que deve acompanhar qualquer não profissional?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Evidência do critério e alguma alternativa possível",
                            isCorrect: true,
                        },
                        {
                            text: "Um pedido formal de desculpas a quem trouxe a demanda",
                            isCorrect: false,
                        },
                        {
                            text: "A promessa de atender o pedido no trimestre seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "A assinatura do gestor da área que fez a solicitação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que repetir o problema com as palavras de quem pediu ajuda tanto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Muito do conflito vem de não se sentir ouvido",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a repetição convence a pessoa a retirar o pedido",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o registro escrito exige a citação literal da demanda",
                            isCorrect: false,
                        },
                        {
                            text: "Porque assim o PM transfere a responsabilidade da recusa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pedido negado envolve risco legal e contrato assinado. Como o PM deve proceder?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Levar contexto, opções e recomendação a quem responde",
                            isCorrect: true,
                        },
                        {
                            text: "Recusar sozinho e registrar a decisão no documento do time",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar o pedido para evitar exposição jurídica da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Encaminhar o assunto ao jurídico e sair da conversa em seguida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Mapa de stakeholders",
            blocks: [
                {
                    type: "text",
                    value: "# Quem são e o que cada um quer\n\nStakeholder é qualquer pessoa que afeta o seu produto ou é afetada por ele. A lista é maior do que parece: diretoria, vendas, marketing, suporte, operações, financeiro, jurídico, compliance, segurança da informação, parceiros e, em setores regulados, até o órgão que fiscaliza. Cada um chega com uma meta própria, e quase nunca é a sua.\n\nEntender a meta alheia é o atalho pra parar de tratar stakeholder como obstáculo. Vendas quer fechar contrato neste mês e por isso pede a feature que destrava o cliente da vez. Suporte quer reduzir volume de chamados e sofre com o problema que ninguém prioriza. Jurídico quer risco baixo e por isso trava aquilo que parecia simples. Nenhum deles é vilão; todos respondem por metas que a empresa criou.\n\nO PM que enxerga isso muda a conversa: em vez de 'não dá', consegue dizer 'entendi que você precisa fechar o contrato; existe um caminho que resolve em duas semanas sem quebrar o roadmap?'. A negociação fica sobre METAS, e não sobre vontades pessoais.",
                },
                {
                    type: "table",
                    value: '[["Quadrante","Postura recomendada","Ritmo de conversa","Exemplo típico"],["Alta influência e alto interesse","Envolver na decisão","Conversar antes de decidir","Diretor dono da meta"],["Alta influência e baixo interesse","Manter satisfeito","Resumo curto, sem surpresa","Jurídico e compliance"],["Baixa influência e alto interesse","Manter informado","Atualização regular por escrito","Suporte e operação"],["Baixa influência e baixo interesse","Monitorar","Só quando o tema encostar","Times distantes do produto"]]',
                },
                {
                    type: "quote",
                    value: "Nenhuma surpresa na reunião. Se alguém importante vai discordar da sua proposta, é melhor descobrir isso na véspera, em conversa individual.",
                },
                {
                    type: "text",
                    value: "## Um mapa simples que evita muita crise\n\nO mapa clássico cruza duas perguntas: quanto essa pessoa se importa com o assunto e quanto ela pode influenciar o resultado. Não precisa de ferramenta: uma folha dividida em quatro quadrantes resolve. O valor não está no desenho, está na disciplina de fazer duas perguntas antes de toda decisão grande: quem é afetado por isso e quem pode bloquear isso?\n\nA partir daí, o comportamento muda. Com quem tem alta influência e alto interesse, você conversa ANTES, ainda com a proposta em rascunho, porque essa pessoa precisa se sentir parte da decisão. Com quem tem alta influência e pouco interesse, você manda resumo curto e evita ocupar tempo: essa pessoa só quer não ser surpreendida. Com quem tem alto interesse e pouca influência, como suporte e operação, você informa com regularidade, porque são eles que carregam o impacto no dia a dia.\n\nDois lembretes finais. O mapa muda a cada reorganização, mudança de meta ou troca de liderança, então revise. E stakeholder difícil, na enorme maioria dos casos, é alguém com meta desalinhada da sua, não alguém de má fé. Descobrir qual é essa meta costuma resolver mais que qualquer técnica de negociação.",
                },
            ],
            questions: [
                {
                    statement: "Quem é considerado stakeholder de um produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quem afeta o produto ou é afetado por ele",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas os diretores que aprovam o orçamento da área",
                            isCorrect: false,
                        },
                        {
                            text: "Somente os clientes que pagam pelo uso do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Todos os engenheiros que trabalham no código do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais eixos o mapa simples de stakeholders cruza?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Interesse pelo tema e influência sobre o resultado",
                            isCorrect: true,
                        },
                        {
                            text: "Tempo de casa na empresa e nível salarial de cada pessoa",
                            isCorrect: false,
                        },
                        {
                            text: "Simpatia pessoal pelo time e frequência de reuniões feitas",
                            isCorrect: false,
                        },
                        {
                            text: "Volume de pedidos enviados e velocidade de resposta obtida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como tratar quem tem alta influência e baixo interesse no tema?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Manter satisfeito com resumo curto e sem surpresas",
                            isCorrect: true,
                        },
                        {
                            text: "Convidar para todas as reuniões semanais de acompanhamento",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar relatórios diários detalhados sobre cada nova entrega",
                            isCorrect: false,
                        },
                        {
                            text: "Evitar qualquer contato até que a decisão esteja finalizada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que conversar individualmente antes de uma reunião importante?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descobrir discordância antes evita crise na sala",
                            isCorrect: true,
                        },
                        {
                            text: "Porque decisões só valem se combinadas fora das reuniões",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a reunião pode ser cancelada se ninguém discordar",
                            isCorrect: false,
                        },
                        {
                            text: "Porque conversas individuais dispensam registro por escrito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Vendas insiste numa feature que atrapalha o roadmap. Qual leitura ajuda mais o PM a negociar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Entender a meta comercial por trás e negociar sobre ela",
                            isCorrect: true,
                        },
                        {
                            text: "Assumir que vendas quer apenas impor a própria vontade ali",
                            isCorrect: false,
                        },
                        {
                            text: "Levar o caso direto à diretoria antes de qualquer conversa",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitar o pedido e reduzir o escopo das entregas planejadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Comunicação assíncrona e remota",
            blocks: [
                {
                    type: "text",
                    value: "# Escrever pra ser lido depois\n\nTime distribuído mudou a comunicação de produto de forma permanente. Em 2026, é comum um mesmo time ter gente em fusos diferentes, com rotinas diferentes, e a informação precisa funcionar sem que todos estejam online ao mesmo tempo. A habilidade central passa a ser escrever pra quem vai ler DEPOIS, sem você por perto pra explicar.\n\nIsso muda a forma da mensagem. Comunicação síncrona tolera contexto incompleto porque a outra pessoa pergunta na hora. Assíncrona, não: uma mensagem que gera três perguntas de volta custa um dia inteiro de espera. Então a regra é entregar o pacote completo: o que aconteceu, por que importa, o que você propõe, o que precisa da pessoa e até quando.\n\nO custo da reunião fica mais visível nesse arranjo. Oito pessoas numa hora consomem um dia útil de trabalho somado. Isso não significa abolir encontros: significa reservá-los pro que realmente exige tempo real, como negociação difícil, conversa delicada, alinhamento com muita ambiguidade e momentos de construção conjunta. O resto vira texto.",
                },
                {
                    type: "table",
                    value: '[["Situação","Canal adequado","Por quê"],["Alinhar decisão com trade-off","Documento e comentário","Cada um lê e responde com calma"],["Negociação difícil","Conversa ao vivo","Tom e reação importam muito"],["Status do trabalho","Quadro ou resumo escrito","Ninguém precisa de reunião pra isso"],["Dúvida rápida do time","Canal de mensagem do time","Resposta curta e visível a todos"],["Feedback pessoal","Conversa ao vivo e privada","Texto endurece o que é sensível"]]',
                },
                {
                    type: "quote",
                    value: "Oito pessoas numa reunião de uma hora custam um dia inteiro de trabalho. Se o resultado cabe num documento, você acabou de gastar um dia à toa.",
                },
                {
                    type: "text",
                    value: "## Regras que sustentam um time assíncrono\n\nPrimeira: cada tipo de informação tem UM LUGAR conhecido. Decisão mora no registro de decisões, requisito mora no item de trabalho, discussão mora no documento, aviso mora no canal do time. Quando informação importante mora no chat privado de duas pessoas, o time inteiro fica dependente de memória alheia.\n\nSegunda: mensagem que pede algo diz o PRAZO e o TIPO de resposta esperada. 'Preciso do seu ok até quinta, ou um comentário do que impede' funciona; 'o que você acha?' fica sem resposta por uma semana. Terceira: publique decisão no mesmo dia, mesmo que curta, e sempre no lugar combinado.\n\nQuarta: respeite o fuso e a rotina. Cobrar resposta imediata em time distribuído destrói o principal ganho do modelo, que é a capacidade de trabalhar concentrado. Quinta: visibilidade não é vigilância. Resumo semanal do que avançou, o que travou e o que vem a seguir dá tranquilidade a stakeholders e substitui a tentação da microgestão.\n\nO efeito colateral bom é que times assíncronos maduros escrevem melhor, decidem com mais gente informada e sofrem menos com a ausência de qualquer pessoa específica.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma boa mensagem assíncrona?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Traz contexto completo e o que se espera de resposta",
                            isCorrect: true,
                        },
                        {
                            text: "É curta ao máximo, mesmo que falte parte do contexto",
                            isCorrect: false,
                        },
                        {
                            text: "É enviada apenas dentro do horário comercial combinado",
                            isCorrect: false,
                        },
                        {
                            text: "Convida todos os envolvidos para uma chamada de vídeo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual conversa costuma justificar um encontro ao vivo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Negociação difícil, em que tom e reação importam",
                            isCorrect: true,
                        },
                        {
                            text: "Atualização de status das tarefas em andamento no time",
                            isCorrect: false,
                        },
                        {
                            text: "Aviso sobre a data de manutenção programada do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Compartilhamento do relatório mensal já pronto e revisado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que informação importante não deve morar em conversa privada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O time passa a depender da memória de duas pessoas",
                            isCorrect: true,
                        },
                        {
                            text: "Porque mensagens privadas são apagadas automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a empresa proíbe decisões fora dos canais oficiais",
                            isCorrect: false,
                        },
                        {
                            text: "Porque conversas privadas atrasam o envio de qualquer aviso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna um pedido assíncrono mais eficaz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dizer o prazo e o tipo de resposta que você espera",
                            isCorrect: true,
                        },
                        {
                            text: "Enviar a mesma mensagem em todos os canais disponíveis",
                            isCorrect: false,
                        },
                        {
                            text: "Marcar todas as pessoas do time para garantir visibilidade",
                            isCorrect: false,
                        },
                        {
                            text: "Escrever o texto mais curto possível, sem detalhar o pedido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Stakeholders remotos cobram reuniões frequentes por insegurança. Qual prática reduz essa pressão?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Resumo semanal do que avançou, travou e vem depois",
                            isCorrect: true,
                        },
                        {
                            text: "Convidar todos eles para as cerimônias internas do time",
                            isCorrect: false,
                        },
                        {
                            text: "Ampliar o número de reuniões até a ansiedade diminuir sozinha",
                            isCorrect: false,
                        },
                        {
                            text: "Enviar acesso ao quadro de tarefas e encerrar a comunicação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: teardown de um produto real",
    aulas: [
        {
            titulo: "Escolhendo o alvo e o método",
            blocks: [
                {
                    type: "text",
                    value: "# Analisar um produto por fora, com método\n\nTEARDOWN é a análise estruturada de um produto que você não construiu, feita só com o que dá pra observar de fora. É o exercício mais barato que existe pra treinar olhar de produto: não precisa de acesso, não precisa de permissão, e obriga você a praticar tudo o que viu até aqui em um caso concreto.\n\nA escolha do alvo importa mais do que parece. Prefira um produto que você USA COM ALGUMA FREQUÊNCIA, porque você já conhece o fluxo, e que não seja objeto de paixão, porque fã não enxerga fricção. Prefira também um produto com público amplo, que facilita entender o segmento, e evite produtos internos de empresa, cujo contexto você não consegue reconstruir de fora.\n\nO escopo é a segunda decisão. Analisar 'o app inteiro' produz texto genérico. Escolha UM FLUXO PRINCIPAL, como a primeira compra, a criação da primeira conta, a busca até o resultado ou a renovação de plano, e vá fundo nele. Reserve algo entre três e cinco horas, divididas em pelo menos duas sessões, com um intervalo entre elas. A distância ajuda a separar o que é fato do que foi só irritação do momento.",
                },
                {
                    type: "code",
                    value: "ROTEIRO DE TEARDOWN (3 a 5 horas, em duas sessoes)\n\n1. Alvo e escopo: qual produto, qual fluxo, em que aparelho\n2. Proposta de valor: o que promete, pra quem, contra qual alternativa\n3. Usuarios provaveis: segmentos visiveis e o job principal de cada um\n4. Modelo de receita: quem paga, pelo que, o que e gratuito e por que\n5. Jornada: do primeiro contato ao primeiro valor, com passos contados\n6. Metricas: north star provavel e funil provavel, sempre como hipotese\n7. Estrategia: concorrentes reais, diferencial e o que o sustenta\n8. O que eu faria: 3 apostas com metrica esperada e risco de cada uma\n9. Limites: o que nao da pra saber olhando de fora",
                },
                {
                    type: "table",
                    value: '[["Tipo de alvo","Por que funciona bem","Cuidado"],["App de delivery ou transporte","Fluxo curto e público amplo","Muita gente já analisou o óbvio"],["Banco digital ou carteira","Onboarding rico e regulado","Regra externa explica muita coisa"],["Marketplace de nicho","Dois lados visíveis na interface","Você só enxerga um dos lados"],["Ferramenta de trabalho","Job claro e alternativa óbvia","O comprador não é quem usa"]]',
                },
                {
                    type: "quote",
                    value: "Você está analisando de fora, com informação pública. Toda conclusão sobre intenção alheia é hipótese, e escrever isso com honestidade é o que separa análise de chute.",
                },
                {
                    type: "text",
                    value: "## O método, passo a passo\n\nA sequência que funciona tem quatro etapas separadas, e misturá-las é o erro mais comum. USAR: percorra o fluxo como se fosse a primeira vez, sem anotar nada, prestando atenção no que você sente. REGISTRAR: refaça o mesmo caminho anotando fatos observáveis, passos, telas, textos e pontos onde você hesitou. ANALISAR: só depois, longe do aplicativo, aplique as perguntas do roteiro. ESCREVER: monte o documento final com hipóteses claramente rotuladas.\n\nTrês regras de honestidade sustentam o trabalho. Primeira: SEPARE OBSERVAÇÃO DE INTERPRETAÇÃO. 'O botão de finalizar aparece só depois de rolar a tela' é observação; 'talvez por isso muita gente abandone' é interpretação. Segunda: não afirme nada sobre o que acontece dentro da empresa, sobre números internos ou sobre o motivo real de uma decisão. Você não sabe, e um bom teardown assume isso em voz alta.\n\nTerceira: critique o produto, nunca as pessoas. E date o documento, porque produto muda: uma análise sem data envelhece mal e vira fonte de informação errada seis meses depois.",
                },
            ],
            questions: [
                {
                    statement: "O que é um teardown de produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Análise estruturada feita só com o que se observa fora",
                            isCorrect: true,
                        },
                        {
                            text: "Auditoria interna do código-fonte de um aplicativo concorrente",
                            isCorrect: false,
                        },
                        {
                            text: "Entrevista formal com os gestores responsáveis pelo produto",
                            isCorrect: false,
                        },
                        {
                            text: "Relatório financeiro comparando receita de duas empresas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual escopo funciona melhor num teardown?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um fluxo principal analisado com profundidade",
                            isCorrect: true,
                        },
                        {
                            text: "O produto inteiro, com todas as telas disponíveis",
                            isCorrect: false,
                        },
                        {
                            text: "A comparação entre cinco concorrentes ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico completo de versões lançadas pela empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que evitar analisar um produto pelo qual você é apaixonado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem admira demais deixa de enxergar as fricções",
                            isCorrect: true,
                        },
                        {
                            text: "Porque produtos famosos não têm problemas relevantes a citar",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a empresa pode reclamar de análises feitas por fãs dela",
                            isCorrect: false,
                        },
                        {
                            text: "Porque só produtos desconhecidos rendem conclusões originais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre observação e interpretação no teardown?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma descreve o que se vê; a outra sugere o porquê",
                            isCorrect: true,
                        },
                        {
                            text: "Uma vem do usuário final; a outra vem do time de produto",
                            isCorrect: false,
                        },
                        {
                            text: "Uma usa dados internos; a outra depende de fontes públicas",
                            isCorrect: false,
                        },
                        {
                            text: "Uma aparece no início do texto; a outra fecha o documento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No teardown, você conclui que a empresa priorizou receita em vez do usuário. Como registrar isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Como hipótese, com a evidência pública que a sugeriu",
                            isCorrect: true,
                        },
                        {
                            text: "Como fato, já que a interface deixa a intenção bastante clara",
                            isCorrect: false,
                        },
                        {
                            text: "Como crítica direta às pessoas que decidiram aquele caminho",
                            isCorrect: false,
                        },
                        {
                            text: "Como conclusão final, sem precisar detalhar o que foi observado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Mapa da experiência",
            blocks: [
                {
                    type: "text",
                    value: "# Do primeiro contato ao primeiro valor\n\nO coração do teardown é a jornada, e ela começa antes do aplicativo: na loja, no site, no anúncio que promete algo. Anote a PROMESSA que trouxe a pessoa até ali, porque toda fricção seguinte será julgada contra ela.\n\nDepois vem o ONBOARDING, que é o trecho entre o primeiro contato e o momento em que a pessoa recebe algo de valor. Registre com precisão: quantas telas, quantos campos, quantas permissões pedidas, quanto tempo até o primeiro valor real. Preste atenção especial no que é EXIGIDO ANTES DE ENTREGAR: pedir cadastro completo, documento e permissão de localização antes de mostrar qualquer benefício é uma decisão de produto com custo alto e, às vezes, com boa razão por trás, como exigência regulatória.\n\nEm seguida, o JOB PRINCIPAL: a tarefa pela qual a pessoa está ali. Percorra esse caminho contando passos e toques, e marque cada ponto onde você hesitou, voltou, releu ou errou. Hesitação é o dado mais valioso do exercício, porque é o rastro visível de uma dúvida que muita gente também teve.",
                },
                {
                    type: "table",
                    value: '[["Etapa","O que registrar","Pergunta de analista"],["Promessa inicial","Texto da loja e do anúncio","O produto cumpre o que prometeu?"],["Onboarding","Telas, campos e permissões","O que é pedido antes de entregar valor?"],["Primeiro valor","Tempo e passos até chegar","Dá pra encurtar esse caminho?"],["Job principal","Toques, erros e hesitações","Onde a pessoa provavelmente desiste?"],["Retorno","Motivo pra voltar amanhã","O que traz a pessoa de novo?"]]',
                },
                {
                    type: "quote",
                    value: "Anote como analista, não como fã nem como crítico irritado. O que interessa não é se você gostou, e sim o que a interface pede, entrega e esconde.",
                },
                {
                    type: "text",
                    value: "## Como registrar sem se enganar\n\nUse instrumentos simples e disciplinados. Conte PASSOS e toques até o objetivo, cronometre o TEMPO ATÉ O PRIMEIRO VALOR, capture as telas em que algo te travou e escreva uma linha ao lado de cada captura dizendo o que aconteceu ali. Números aproximados servem: sete toques e dois minutos é informação; 'achei demorado' não é.\n\nA técnica que mais melhora o resultado é observar OUTRA PESSOA. Peça a alguém que nunca usou o produto pra fazer uma tarefa simples, avise que não vai poder ajudar e fique em silêncio, anotando. Vai doer ver a pessoa não achar o botão óbvio, e é exatamente esse desconforto que ensina. Cinco minutos assim revelam mais que uma hora de opinião própria.\n\nPor fim, separe suas anotações em três colunas: OBSERVAÇÃO, INTERPRETAÇÃO e OPINIÃO. A primeira é o que qualquer pessoa veria; a segunda é a sua leitura do porquê; a terceira é gosto pessoal, e ela pode ficar de fora do documento final. Times inteiros perdem credibilidade misturando as três num parágrafo só, e você não precisa repetir esse erro no seu primeiro material público.",
                },
            ],
            questions: [
                {
                    statement: "O que é o onboarding num teardown?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O trecho entre o primeiro contato e o primeiro valor",
                            isCorrect: true,
                        },
                        {
                            text: "O treinamento oferecido às pessoas recém-contratadas pelo time",
                            isCorrect: false,
                        },
                        {
                            text: "A tela final de confirmação exibida ao término de uma compra",
                            isCorrect: false,
                        },
                        {
                            text: "O processo de instalação técnica do aplicativo no aparelho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que registrar hesitações durante o uso?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Elas revelam dúvidas que outras pessoas também têm",
                            isCorrect: true,
                        },
                        {
                            text: "Elas medem a velocidade de resposta do servidor do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Elas indicam o quanto o analista conhece pouco a categoria",
                            isCorrect: false,
                        },
                        {
                            text: "Elas substituem a necessidade de contar passos e toques",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa observar o que é exigido antes de entregar valor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Notar cadastros e permissões pedidos antes do benefício",
                            isCorrect: true,
                        },
                        {
                            text: "Verificar quais recursos ficam disponíveis apenas no plano pago",
                            isCorrect: false,
                        },
                        {
                            text: "Conferir se o aplicativo funciona sem conexão com a internet",
                            isCorrect: false,
                        },
                        {
                            text: "Avaliar quanto tempo a empresa leva para responder um chamado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual técnica revela mais fricção com menos esforço?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Observar alguém que nunca usou tentando a tarefa",
                            isCorrect: true,
                        },
                        {
                            text: "Ler as avaliações mais recentes publicadas na loja de apps",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar o produto com o principal concorrente do mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Refazer o mesmo fluxo várias vezes até decorar cada etapa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Suas anotações misturam 'o botão fica abaixo da dobra' com 'achei feio'. Como organizar isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Separar observação, interpretação e opinião pessoal",
                            isCorrect: true,
                        },
                        {
                            text: "Descartar tudo e refazer a análise em um aparelho diferente",
                            isCorrect: false,
                        },
                        {
                            text: "Manter junto, pois a impressão estética também é um dado útil",
                            isCorrect: false,
                        },
                        {
                            text: "Publicar apenas as opiniões, que geram mais debate com leitores",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Hipóteses de métricas",
            blocks: [
                {
                    type: "text",
                    value: "# O que esse produto provavelmente mede\n\nVocê não tem acesso ao painel de ninguém, e é justamente por isso que este exercício é bom: obriga a raciocinar a partir de evidência pública. A interface revela prioridade. O que o produto coloca na tela inicial, o que ele destaca com cor, o que ele empurra por notificação, o que a página de preços cobra e o que a campanha promete são pistas do que aquele time está tentando mover.\n\nO conceito mais útil aqui é a NORTH STAR: uma métrica que representa o valor entregue ao usuário e que, quando cresce de forma saudável, tende a puxar o negócio junto. Uma boa candidata cumpre três critérios. Primeiro, mede valor recebido, não esforço da empresa. Segundo, o time consegue influenciá-la com o próprio trabalho. Terceiro, existe um caminho explicável entre ela e a receita.\n\nPor isso downloads, cadastros e curtidas raramente servem: são métricas de vaidade, sobem com campanha e não dizem se alguém recebeu valor. Formatos melhores costumam envolver frequência, conclusão ou quantidade de algo entregue com sucesso, como pedidos concluídos por cliente ativo por mês.",
                },
                {
                    type: "table",
                    value: '[["Tipo de produto","North star plausível","Funil provável"],["Delivery","Pedidos concluídos por cliente ativo","Abrir, buscar, montar carrinho, pagar"],["Streaming","Horas assistidas por assinante ativo","Entrar, escolher, começar, terminar"],["Marketplace","Negócios fechados entre os dois lados","Buscar, comparar, negociar, pagar"],["Ferramenta de trabalho","Tarefas concluídas por equipe ativa","Criar conta, configurar, convidar, usar"]]',
                },
                {
                    type: "quote",
                    value: "Downloads sobem com campanha e caem com o esquecimento. Métrica boa é aquela que só cresce quando alguém do outro lado recebeu valor de verdade.",
                },
                {
                    type: "text",
                    value: "## Escrevendo métricas como hipótese testável\n\nO formato que dá seriedade ao exercício é este: 'HIPÓTESE: a north star deste produto é X. EVIDÊNCIA PÚBLICA: a tela inicial destaca X, as notificações empurram X e o plano pago cobra por X. COMO EU CHECARIA SE TIVESSE ACESSO: olharia a série de X por coorte e a relação entre X e renovação'. Três frases, e a análise deixa de ser palpite.\n\nDesenhe também o FUNIL PROVÁVEL, ou seja, as etapas até o valor: chegar, entender, configurar o mínimo, realizar a tarefa uma vez, voltar. Para cada etapa, aponte onde a interface parece proteger a passagem, com atalho, valor padrão preenchido, lembrete ou incentivo. Onde há muito esforço de retenção, geralmente há uma queda conhecida.\n\nNão esqueça a CONTRA-MÉTRICA, o número que impede a otimização burra. Um produto que persegue tempo de tela precisa vigiar cancelamentos e reclamações; um que persegue conversão precisa vigiar arrependimento, devolução e chamado de suporte. Apontar a contra-métrica no teardown mostra maturidade, porque revela que você entende que toda métrica isolada pode ser gamificada por um time bem-intencionado sob pressão.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma north star metric?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Métrica que representa o valor entregue ao usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Meta financeira definida pela diretoria para o ano inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Indicador técnico de disponibilidade dos servidores do time",
                            isCorrect: false,
                        },
                        {
                            text: "Número de funcionalidades entregues durante cada trimestre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que downloads é considerada métrica de vaidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sobe com campanha sem indicar valor recebido",
                            isCorrect: true,
                        },
                        {
                            text: "É difícil de medir com precisão nas lojas de aplicativo",
                            isCorrect: false,
                        },
                        {
                            text: "Só pode ser acompanhada por empresas de grande porte",
                            isCorrect: false,
                        },
                        {
                            text: "Depende exclusivamente do preço cobrado pelo aplicativo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que evidência pública ajuda a inferir o que um produto mede?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O que a tela inicial destaca e o que a notificação empurra",
                            isCorrect: true,
                        },
                        {
                            text: "O organograma da empresa publicado nas redes profissionais",
                            isCorrect: false,
                        },
                        {
                            text: "A quantidade de pessoas contratadas para o time de engenharia",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de existência do produto desde o lançamento original",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve uma contra-métrica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Impedir que otimizar um número estrague outra coisa",
                            isCorrect: true,
                        },
                        {
                            text: "Substituir a north star quando ela para de crescer no período",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar o desempenho do produto com o do maior concorrente",
                            isCorrect: false,
                        },
                        {
                            text: "Medir a produtividade individual das pessoas dentro do time",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você aponta uma north star para o produto analisado. Como deixar a afirmação defensável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Rotular como hipótese, citar evidência e dizer como checar",
                            isCorrect: true,
                        },
                        {
                            text: "Afirmar com segurança, já que a interface não deixa dúvida ali",
                            isCorrect: false,
                        },
                        {
                            text: "Copiar a métrica usada por produtos parecidos do mesmo setor",
                            isCorrect: false,
                        },
                        {
                            text: "Escolher a métrica mais fácil de estimar com dados de mercado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Hipóteses de estratégia",
            blocks: [
                {
                    type: "text",
                    value: "# Concorrentes, diferencial e apostas\n\nA parte de estratégia do teardown começa com uma pergunta simples e mal respondida: contra quem esse produto compete de verdade? A resposta raramente é a lista de empresas da mesma categoria. Um app de finanças pessoais compete com a planilha, com o caderno e com o hábito de não olhar a conta. Uma ferramenta de gestão compete com o grupo de mensagens que já funciona mal, mas funciona. Concorrente é tudo aquilo que faz o mesmo job na vida da pessoa.\n\nDepois vem o DIFERENCIAL, e aqui o critério é a defensabilidade. Uma feature bonita é copiável em um trimestre. Difícil de copiar é outra coisa: efeito de rede, quando o produto melhora conforme mais gente entra; custo de troca alto, quando sair dói por causa de histórico, integração ou processo; vantagem de custo estrutural; marca e confiança construídas ao longo de anos; e acesso a dados que só o uso acumulado gera.\n\nQuando você não encontra nenhum desses, a hipótese honesta é que o produto compete por execução e velocidade, o que é legítimo e frágil ao mesmo tempo.",
                },
                {
                    type: "table",
                    value: '[["Diferencial","O que o sustenta","Como ele se enfraquece"],["Efeito de rede","Cada usuário novo agrega valor","Público migra em bloco pra outro lugar"],["Custo de troca","Histórico, integração e processo","Concorrente facilita a importação"],["Marca e confiança","Anos de entrega consistente","Um episódio grave mal conduzido"],["Vantagem de custo","Escala e operação enxuta","Novo entrante com estrutura menor"],["Dados acumulados","Uso que melhora o serviço","Regra nova sobre uso de dados"]]',
                },
                {
                    type: "quote",
                    value: "Antes de dizer o que faria diferente, escreva o que você não consegue ver de fora: contratos, regulação, dívida técnica e dados que contrariam a sua intuição.",
                },
                {
                    type: "text",
                    value: "## O que eu faria diferente, e por quê\n\nEsta é a seção que mais revela nível profissional, e também a que mais estraga teardowns amadores. O erro clássico é a lista de palpites soltos: 'colocaria um botão maior', 'mudaria a cor', 'adicionaria inteligência artificial'. Nada ali é discutível, porque nada está ligado a problema, resultado esperado ou risco.\n\nO formato que funciona transforma cada sugestão em APOSTA escrita. Comece pelo problema observado, com a evidência pública que o sustenta. Descreva a mudança proposta em uma frase. Diga qual métrica deveria se mover e em qual direção. Aponte a contra-métrica que você vigiaria. E termine com o teste mais barato capaz de indicar se a aposta vale, porque propor experimento é mais forte do que propor certeza.\n\nDuas ou três apostas bem escritas valem mais que quinze sugestões. E mantenha a humildade explícita: você não enxerga contratos, obrigações regulatórias, limitações herdadas nem resultados de testes que o time já fez e descartou. Escrever 'se não existir restrição que eu não vejo' não enfraquece a análise; ao contrário, é o que faz uma pessoa experiente levar o seu texto a sério.",
                },
            ],
            questions: [
                {
                    statement: "Quem são os concorrentes reais de um produto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tudo aquilo que faz o mesmo job na vida da pessoa",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas as empresas registradas na mesma categoria de mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Somente os aplicativos que aparecem na mesma loja de apps",
                            isCorrect: false,
                        },
                        {
                            text: "As empresas que cobram exatamente o mesmo preço pelo serviço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é efeito de rede?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O produto melhora conforme mais gente passa a usar",
                            isCorrect: true,
                        },
                        {
                            text: "A infraestrutura suporta picos altos de acesso simultâneo",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa mantém acordos comerciais com vários parceiros",
                            isCorrect: false,
                        },
                        {
                            text: "O aplicativo funciona bem mesmo com conexão instável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma feature bonita raramente é um diferencial defensável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela pode ser copiada em pouco tempo pelo concorrente",
                            isCorrect: true,
                        },
                        {
                            text: "Ela costuma exigir investimento maior do que a empresa aceita",
                            isCorrect: false,
                        },
                        {
                            text: "Ela deixa de funcionar quando o produto ganha muitos usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Ela sempre entra em conflito com o modelo de receita adotado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como escrever uma sugestão de melhoria em formato de aposta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Problema, mudança, métrica esperada e risco vigiado",
                            isCorrect: true,
                        },
                        {
                            text: "Descrição da tela nova com todos os detalhes visuais dela",
                            isCorrect: false,
                        },
                        {
                            text: "Comparação lado a lado com o concorrente mais bem avaliado",
                            isCorrect: false,
                        },
                        {
                            text: "Lista de funcionalidades ordenadas por preferência pessoal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sua análise externa sugere uma mudança óbvia que o time não fez. Qual leitura é mais madura?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pode existir restrição ou teste anterior que você não vê",
                            isCorrect: true,
                        },
                        {
                            text: "O time provavelmente não percebeu essa oportunidade evidente",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa deve estar priorizando apenas receita de curto prazo",
                            isCorrect: false,
                        },
                        {
                            text: "Falta capacidade técnica no time para implementar a mudança",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: o teardown como hábito",
            blocks: [
                {
                    type: "text",
                    value: "# De exercício isolado a peça de portfólio\n\nUm teardown feito e guardado na gaveta treina o olhar. Um teardown publicado vira prova de raciocínio, e prova de raciocínio é o que abre porta pra quem ainda não tem título de produto no crachá. A diferença entre os dois é só a organização final.\n\nO formato que funciona cabe em duas páginas. Comece pelo RESUMO: qual produto, qual fluxo, quando foi feito e as três conclusões principais. Depois a análise, seguindo o roteiro que você já usou: proposta de valor, usuários e job, modelo de receita, jornada com números observados, hipóteses de métrica e de estratégia. Termine com as apostas escritas, os limites da análise e o que você mudaria de opinião com mais informação.\n\nDuas escolhas de forma fazem diferença. Rotule TODA hipótese como hipótese, sem exceção, e evite qualquer afirmação sobre o que acontece dentro da empresa. E date o documento, porque produto muda e uma análise antiga sem data envelhece mal. Um teardown honesto sobre um produto simples vale mais que um texto ambicioso cheio de conclusões que você não pode sustentar.",
                },
                {
                    type: "table",
                    value: '[["Seção","O que entra","Erro comum"],["Resumo","Alvo, escopo, data e conclusões","Começar pelo histórico da empresa"],["Jornada","Passos e tempo até o valor","Descrever impressão sem número"],["Métricas","North star e funil, como hipótese","Afirmar o que o time mede de fato"],["Apostas","Problema, mudança, métrica e risco","Lista de palpites sem resultado"],["Limites","O que não dá pra saber de fora","Fingir que a análise é completa"]]',
                },
                {
                    type: "quote",
                    value: "O hábito importa mais que a peça isolada. Quem analisa um produto por mês durante um ano enxerga padrões que nenhum curso consegue ensinar em uma aula.",
                },
                {
                    type: "text",
                    value: "## O mapa mental que você leva daqui\n\nVale amarrar o que este percurso construiu, porque tudo foi usado no teardown. Produto não é projeto: ele evolui enquanto o problema existir, e o placar é OUTCOME, não output. Cada fase do ciclo de vida pede um jogo diferente, e cada tipo de produto, de B2C a plataforma, muda as ferramentas de quem decide.\n\nOs papéis existem sem mito: PM cuida do problema, PO e Analyst são portas legítimas de entrada, e o título importa menos que o escopo real. O trabalho acontece em time, com o trio decidindo junto, rituais que precisam se justificar, engenharia tratada como parceira de negócio e design como parceira de investigação.\n\nO usuário entra pelo problema, não pela solução apaixonante; o job explica escolhas que a demografia não explica; feedback exige desconfiança metódica; e acessibilidade é decisão de alcance. O negócio se sustenta em modelo de receita, proposta de valor e uma conta de padaria que todo mundo deveria saber fazer. E tudo isso só vira decisão quando alguém escreve com clareza, apresenta opções, diz não com critério e mantém as pessoas certas informadas.\n\nEscolha o próximo produto, marque as horas na agenda e faça de novo. É assim que fundamento vira olhar treinado.",
                },
            ],
            questions: [
                {
                    statement: "O que abre um bom documento de teardown?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Resumo com alvo, escopo, data e conclusões",
                            isCorrect: true,
                        },
                        {
                            text: "Histórico completo da fundação da empresa analisada",
                            isCorrect: false,
                        },
                        {
                            text: "Lista de todas as funcionalidades existentes no produto",
                            isCorrect: false,
                        },
                        {
                            text: "Comparação de preços entre os concorrentes do setor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que datar a análise importa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O produto muda e a conclusão envelhece rápido",
                            isCorrect: true,
                        },
                        {
                            text: "A data comprova a autoria do documento publicado",
                            isCorrect: false,
                        },
                        {
                            text: "Empresas exigem data em qualquer análise externa feita",
                            isCorrect: false,
                        },
                        {
                            text: "Sem data o texto não pode ser usado em uma entrevista",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a seção de limites fortalece o teardown?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra que você sabe o que não dá pra saber de fora",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz o tamanho do documento e facilita a leitura completa",
                            isCorrect: false,
                        },
                        {
                            text: "Protege o autor de qualquer questionamento sobre o conteúdo",
                            isCorrect: false,
                        },
                        {
                            text: "Substitui a necessidade de apresentar evidências observadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que repetir o teardown com regularidade ensina mais que fazer um só?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A repetição revela padrões entre produtos diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "A repetição garante acesso a dados internos das empresas",
                            isCorrect: false,
                        },
                        {
                            text: "A repetição elimina a necessidade de estudar teoria depois",
                            isCorrect: false,
                        },
                        {
                            text: "A repetição faz o autor ficar conhecido no mercado rapidamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Alguém sem experiência formal em produto quer provar raciocínio numa seleção. O que mais ajuda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Uma análise curta e honesta, com hipóteses bem rotuladas",
                            isCorrect: true,
                        },
                        {
                            text: "Um documento longo com conclusões firmes sobre a estratégia",
                            isCorrect: false,
                        },
                        {
                            text: "Uma lista extensa de melhorias visuais propostas ao produto",
                            isCorrect: false,
                        },
                        {
                            text: "Um resumo dos cursos concluídos sobre gestão de produtos",
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
