// Seed da trilha Sistemas de Tempo Real, estagio 7 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-sistemas-de-tempo-real.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Sistemas de Tempo Real";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Correto e no prazo: hard e soft real-time, RTOS com tarefas, ISRs e filas, escalonamento com RMS e EDF, a inversão de prioridade que travou um robô em Marte, memória sem malloc com pools e ring buffers, WCET, watchdog e os padrões de projeto que mantêm firmware previsível quando o mundo não é.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O que é tempo real",
    aulas: [
        {
            titulo: "Correto e no prazo",
            blocks: [
                {
                    type: "text",
                    value: "# Resposta certa fora do prazo é resposta errada\n\nUm sistema de tempo real é aquele em que a correção do resultado depende de duas coisas ao mesmo tempo: o valor calculado e o instante em que ele chega. Não basta acertar a conta; a conta precisa estar pronta antes de um prazo, o deadline, e esse prazo faz parte da especificação tanto quanto o resultado.\n\nO airbag do seu carro é o exemplo mais honesto. Numa colisão frontal a 50 km/h, o sensor de aceleração detecta o impacto, o módulo decide disparar em cerca de 10 milissegundos e a bolsa termina de inflar por volta de 30 milissegundos depois. A cabeça do motorista chega ao volante em torno de 50 milissegundos após o impacto. Agora imagine um software que calcula a decisão PERFEITA de disparo, mas leva 200 milissegundos: a resposta estava certa, e o motorista já bateu no volante. O valor era correto e o sistema falhou.\n\nGuarde a frase que resume esta trilha inteira: em tempo real, resposta certa atrasada é resposta errada. Todo o resto, escalonamento, memória, medição, existe pra garantir essa frase na prática.",
                },
                {
                    type: "table",
                    value: '[["Sistema","O que calcula","Prazo típico","Se atrasar"],["Airbag","Decisão de disparo","Cerca de 10 ms","Ocupante atinge o volante antes da bolsa"],["Freio ABS","Pressão de frenagem por ciclo","5 a 10 ms","Roda trava e o carro desliza"],["Áudio ao vivo","Próximo bloco de amostras","2 a 10 ms","Clique ou silêncio audível"],["Relatório mensal","Total consolidado","Horas","Ninguém percebe"]]',
                },
                {
                    type: "quote",
                    value: "Em tempo real, o relógio faz parte da especificação: entregar certo e atrasado é só uma forma cara de entregar errado.",
                },
                {
                    type: "text",
                    value: '## De onde vem o deadline\n\nO deadline não é um desejo de produto, é um número extraído do mundo físico. Numa malha de controle que roda a 500 Hz, o cálculo do próximo comando precisa caber em 2 milissegundos, porque em 2 milissegundos chega a próxima amostra e o ciclo recomeça. Num conversor de áudio com buffer de 128 amostras a 48 kHz, você tem cerca de 2,7 milissegundos pra entregar o próximo bloco, senão a placa toca silêncio.\n\nO seu trabalho como engenheiro começa antes do código: escrever os deadlines, com número e unidade, e a origem de cada um. "Rápido" não é requisito; "responder em até 2 ms em 100% dos ciclos" é. Essa lista vira o contrato que o resto do projeto precisa honrar, e é contra ela que você vai medir o sistema no final.\n\nRepare também na diferença entre período e deadline: o período diz de quanto em quanto tempo a tarefa dispara; o deadline diz até quando a resposta vale. Na maioria das malhas os dois coincidem, mas nem sempre, e confundir os dois custa caro na análise.',
                },
            ],
            questions: [
                {
                    statement: "O que define um sistema de tempo real?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A correção depende do valor e do instante da resposta",
                            isCorrect: true,
                        },
                        {
                            text: "A execução acontece sempre em menos de um milissegundo",
                            isCorrect: false,
                        },
                        {
                            text: "O processador dedica todos os núcleos a uma só tarefa",
                            isCorrect: false,
                        },
                        {
                            text: "O código roda direto no hardware, sem sistema operacional",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No exemplo do airbag, por que a resposta certa atrasada é inútil?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Porque o ocupante já colidiu quando o disparo acontece",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o sensor de colisão descarta respostas repetidas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o módulo desliga após a primeira leitura do sensor",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a pressão do gás cai demais depois da detecção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a relação entre deadline e correção num sistema de tempo real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O deadline é parte da especificação, como o valor calculado",
                            isCorrect: true,
                        },
                        {
                            text: "O deadline é uma meta de desempenho, desejável mas opcional",
                            isCorrect: false,
                        },
                        {
                            text: "O deadline só importa quando o sistema está sobrecarregado",
                            isCorrect: false,
                        },
                        {
                            text: "O deadline vale para a média das respostas, não para cada uma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde deve sair o número do deadline de uma malha de controle?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Da física do processo controlado e da taxa de amostragem",
                            isCorrect: true,
                        },
                        {
                            text: "Da velocidade máxima que o processador consegue atingir",
                            isCorrect: false,
                        },
                        {
                            text: "De um benchmark do fornecedor rodado em condições ideais",
                            isCorrect: false,
                        },
                        {
                            text: "Da média dos tempos observados numa semana de operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma malha roda a 500 Hz e o cálculo às vezes leva 3 ms. Qual é o diagnóstico?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Viola o deadline de 2 ms, mesmo com a média baixa",
                            isCorrect: true,
                        },
                        {
                            text: "Aceitável, porque o que conta é o tempo médio do cálculo",
                            isCorrect: false,
                        },
                        {
                            text: "Aceitável, se o resultado numérico estiver sempre correto",
                            isCorrect: false,
                        },
                        {
                            text: "Viola apenas se acontecer em dois ciclos consecutivos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Hard, firm e soft",
            blocks: [
                {
                    type: "text",
                    value: '# A consequência define a classe\n\nNem todo deadline tem o mesmo peso, e a classificação clássica olha pra uma única pergunta: o que acontece quando o prazo estoura?\n\nHARD real-time: perder um deadline é falha do sistema, com consequência séria no mundo físico. O airbag que dispara tarde, o freio que responde tarde, o marcapasso que estimula fora de hora. Aqui não existe "quase": ou o pior caso cabe no prazo, ou o projeto está errado.\n\nFIRM real-time: o resultado atrasado perde todo o valor, mas o atraso em si não é catástrofe. Uma leitura de sensor que chega velha é descartada e a próxima resolve; um pacote de telemetria de 100 ms atrás não interessa mais. Perder pouco e raramente é aceitável; usar o dado atrasado, não.\n\nSOFT real-time: o valor degrada com o atraso, mas ainda existe. Um frame de vídeo a 30 fps tem 33 milissegundos; se um atrasar, a tela engasga, a experiência piora e a vida segue. A meta vira estatística: manter os atrasos raros e pequenos.',
                },
                {
                    type: "table",
                    value: '[["Classe","Deadline perdido","Exemplo","Postura de projeto"],["Hard","Falha do sistema, risco físico","Airbag, freio, marcapasso","Garantir o pior caso"],["Firm","Resultado perde todo o valor","Telemetria, leitura de sensor velha","Descartar e perder raramente"],["Soft","Valor degrada, ainda serve","Frame de vídeo, resposta de app","Otimizar percentis"]]',
                },
                {
                    type: "quote",
                    value: "A classe não está no sistema, está na consequência: pergunte o que acontece no mundo físico quando o prazo estoura.",
                },
                {
                    type: "text",
                    value: "## Um produto, várias classes\n\nUm sistema de verdade mistura as três classes. Pegue um drone: a malha de estabilização é hard, porque perder ciclos derruba a aeronave; a telemetria pro operador é soft, porque um dado atrasado só envelhece o painel; a leitura de um sensor auxiliar pode ser firm, porque amostra velha é descartada sem drama.\n\nClassificar direito importa porque cada classe cobra um preço diferente. Deadline hard exige análise de pior caso, medição, margem e, muitas vezes, hardware mais simples e previsível. Deadline soft pede boa engenharia de percentis, e só. Tratar tudo como hard incha o custo e o prazo do projeto com garantias que ninguém pediu; tratar algo hard como soft é como assinar um laudo sem ler: funciona até o dia em que mata alguém ou destrói o equipamento.\n\nPor isso a tabela de requisitos temporais do módulo 7 terá uma coluna de classe ao lado do deadline. Escrever a classe força a pergunta certa na fase certa: qual é a consequência? Quem responde isso é o domínio, nunca o programador sozinho.",
                },
            ],
            questions: [
                {
                    statement: "O que define se um deadline é hard, firm ou soft?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A consequência de perder o prazo, não a velocidade exigida",
                            isCorrect: true,
                        },
                        {
                            text: "O tamanho do prazo: abaixo de um milissegundo é sempre hard",
                            isCorrect: false,
                        },
                        {
                            text: "O tipo de processador escolhido para o produto embarcado",
                            isCorrect: false,
                        },
                        {
                            text: "A linguagem de programação escolhida para o caminho crítico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o exemplo clássico de deadline hard?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O airbag, em que atraso significa falha catastrófica",
                            isCorrect: true,
                        },
                        {
                            text: "O frame de vídeo, que engasga a tela quando atrasa",
                            isCorrect: false,
                        },
                        {
                            text: "A telemetria, que vira dado velho e é descartada",
                            isCorrect: false,
                        },
                        {
                            text: "O relatório mensal, que pode sair horas mais tarde",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Num sistema firm, o que fazer com um resultado que perdeu o prazo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descartar: atrasado ele não tem mais valor algum",
                            isCorrect: true,
                        },
                        {
                            text: "Entregar mesmo assim: algum valor ele sempre conserva",
                            isCorrect: false,
                        },
                        {
                            text: "Reprocessar com prioridade máxima até compensar o atraso",
                            isCorrect: false,
                        },
                        {
                            text: "Pausar o sistema inteiro até a causa ser identificada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que tratar todo deadline como hard é um erro de projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Encarece o sistema e gasta análise onde não precisa",
                            isCorrect: true,
                        },
                        {
                            text: "Porque deadlines hard são proibidos em produtos civis",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o hardware moderno não atende deadlines duros",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o escalonador aceita no máximo um deadline hard",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um drone tem malha de atitude, telemetria e leitura de sensor auxiliar. Como classificar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Atitude hard, telemetria soft e sensor auxiliar firm",
                            isCorrect: true,
                        },
                        {
                            text: "Tudo hard, porque um drone voando é sempre crítico",
                            isCorrect: false,
                        },
                        {
                            text: "Atitude soft, porque o piloto corrige qualquer desvio",
                            isCorrect: false,
                        },
                        {
                            text: "Telemetria hard, porque o operador depende dos dados",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Determinismo não é velocidade",
            blocks: [
                {
                    type: "text",
                    value: '# O mal-entendido central da área\n\n"Tempo real" soa como "muito rápido", e essa intuição está errada. Tempo real é sobre PREVISIBILIDADE: responder sempre dentro de um limite conhecido. Velocidade ajuda, mas não é a propriedade.\n\nCompare dois sistemas respondendo ao mesmo evento. O sistema A responde em 1 milissegundo na média, mas de vez em quando, numa tempestade de cache misses ou numa pausa do runtime, leva 80 milissegundos. O sistema B responde sempre entre 3 e 5 milissegundos, sem exceção. Pra um painel de estatísticas, A é melhor. Pra controlar um freio com prazo de 10 milissegundos, A é inaceitável e B é perfeito: o pior caso de B cabe no prazo com folga, o de A estoura por um fator de oito.\n\nDeterminismo temporal significa isso: mesmo estímulo, resposta dentro de um limite superior conhecido, sempre. Não significa responder no tempo exato e idêntico a cada execução; variação abaixo do limite é normal e aceitável. O contrato é com o teto, não com a média nem com a repetição perfeita.',
                },
                {
                    type: "table",
                    value: '[["Métrica","Sistema A","Sistema B","Leitura de tempo real"],["Média","1 ms","4 ms","A parece melhor no folder"],["Percentil 99","12 ms","4,5 ms","A cauda de A já assusta"],["Pior caso","80 ms","5 ms","B cumpre prazo de 10 ms, A não"],["Veredito","Rápido e imprevisível","Mais lento e limitado","B serve tempo real"]]',
                },
                {
                    type: "quote",
                    value: "Pra tempo real, o pior caso é a única métrica que assina contrato; a média é material de marketing.",
                },
                {
                    type: "text",
                    value: '## A matemática da cauda\n\nRaridade não salva ninguém quando a taxa é alta. Uma malha a 500 Hz executa 500 vezes por segundo, 1,8 milhão de vezes por hora. Um estouro "raro", de um em dez mil ciclos, acontece a cada 20 segundos. Um em um milhão acontece a cada 33 minutos, várias vezes num voo. Em tempo real, probabilidade pequena vezes frequência alta é rotina, não azar.\n\nPor isso a engenharia de tempo real inverte a cultura de benchmark. O mundo de servidores otimiza vazão e latência média, e aceita cauda em troca de throughput. O mundo de tempo real faz o oposto: aceita piorar a média de propósito pra estreitar a distribuição. Você vai ver isso a trilha inteira: desligar conveniências, pré-alocar memória, escolher hardware mais simples, tudo pra transformar "quase sempre rápido" em "sempre dentro do limite".\n\nQuando alguém te disser que o sistema "roda de boa a 1 ms", pergunte pelo percentil 100. É nele que o airbag mora.',
                },
            ],
            questions: [
                {
                    statement: "O que significa determinismo temporal?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Responder sempre dentro de um limite conhecido de tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Responder mais rápido que qualquer sistema concorrente",
                            isCorrect: false,
                        },
                        {
                            text: "Responder em tempo idêntico até o último microssegundo",
                            isCorrect: false,
                        },
                        {
                            text: "Responder sem nunca usar interrupções nem preempção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Entre média de 1 ms com pior caso de 80 ms, e 4 ms constantes, o que serve um prazo de 10 ms?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os 4 ms constantes, porque o pior caso é limitado",
                            isCorrect: true,
                        },
                        {
                            text: "A média de 1 ms, porque velocidade sempre vence",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum dos dois, porque ambos passam de 1 ms",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois igualmente, porque a diferença é pequena",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a média engana ao avaliar um sistema de tempo real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela esconde a cauda: os raros casos lentos que estouram o prazo",
                            isCorrect: true,
                        },
                        {
                            text: "Ela varia demais entre execuções para ser calculada direito",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só pode ser medida depois que o produto já está em campo",
                            isCorrect: false,
                        },
                        {
                            text: "Ela depende do compilador usado e por isso não é comparável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A 500 Hz, um estouro de um em dez mil ciclos acontece com que frequência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de uma vez a cada 20 segundos de operação",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de uma vez por hora, o que costuma ser aceitável",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de uma vez por dia, praticamente irrelevante",
                            isCorrect: false,
                        },
                        {
                            text: "Menos de uma vez por semana em uso contínuo normal",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que troca um projeto de tempo real costuma aceitar de propósito?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Piorar a média para garantir um pior caso limitado",
                            isCorrect: true,
                        },
                        {
                            text: "Piorar o pior caso para melhorar a média das respostas",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o uso de heap para reduzir o uso de stack",
                            isCorrect: false,
                        },
                        {
                            text: "Elevar o clock além do nominal para cumprir os prazos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fontes de imprevisibilidade",
            blocks: [
                {
                    type: "text",
                    value: "# De onde vem a variância\n\nSe determinismo é a meta, o inimigo é tudo que faz o mesmo código levar tempos diferentes. Vale conhecer os suspeitos de sempre.\n\nCACHE: um acesso que acerta a cache custa um ou poucos ciclos; um que erra e vai à memória externa custa dezenas ou centenas. O mesmo laço pode variar uma ordem de grandeza dependendo do que executou antes. Junto dela, o preditor de desvio: acertar o palpite é de graça, errar custa o esvaziamento do pipeline.\n\nINTERRUPÇÕES: chegam quando o hardware quiser e roubam a CPU da tarefa no pior momento possível. Uma rajada de pacotes de rede pode enterrar sua malha de controle sob milhares de interrupções por segundo.\n\nALOCAÇÃO DINÂMICA: malloc percorre estruturas de blocos livres, e o tempo depende do histórico de alocações. Com fragmentação, a busca alonga, e no limite falha.\n\nRUNTIME: coletor de lixo, JIT aquecendo, lazy loading. Conveniências maravilhosas, todas com a mesma conta: pausas que você não escolhe quando acontecem.",
                },
                {
                    type: "table",
                    value: '[["Fonte","Efeito no tempo","Mitigação"],["Cache e preditor","Mesmo laço varia ordem de grandeza","Hardware simples, medir pior caso, memória travada"],["Interrupções","CPU roubada em momento imprevisível","ISRs curtas, mascarar em seções críticas"],["Alocação dinâmica","malloc de tempo variável, fragmentação","Pools fixos, alocar tudo na inicialização"],["Coletor de lixo","Pausas de milissegundos sem aviso","Linguagem sem GC no caminho crítico"]]',
                },
                {
                    type: "quote",
                    value: "Cada camada de conveniência que você empilha cobra em variância, e o caminho crítico paga a conta em pior caso.",
                },
                {
                    type: "text",
                    value: "## Por que GC fica fora do caminho crítico\n\nLinguagens com coletor de lixo, como Java, C#, Go e Python, automatizam a memória ao custo de pausas que o seu código não agenda. Mesmo coletores modernos, com pausas de poucos milissegundos, decidem sozinhos QUANDO parar o mundo, e um deadline de 2 milissegundos não sobrevive a uma pausa de 5 no meio do ciclo. O problema não é a duração média da pausa, é não poder garantir que ela não cai dentro do prazo.\n\nPor isso, em 2026, o caminho crítico de firmware continua dominado por C, C++ e, cada vez mais, Rust: linguagens sem GC, com custo de memória explícito. As linguagens com runtime têm lugar de sobra no resto do produto: o backend de telemetria, o painel do operador, as ferramentas de teste. MicroPython é ótimo pra prototipar num fim de semana; o laço de controle que vai a campo, você reescreve sem runtime.\n\nA regra prática: no caminho crítico, só entra código cujo pior caso você consegue explicar. O que você não controla, você não embarca.",
                },
            ],
            questions: [
                {
                    statement: "Por que a memória cache introduz imprevisibilidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Acerto e falha têm custos de ordens de grandeza diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "Porque a cache perde os dados quando a energia é cortada",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a cache é compartilhada apenas entre os periféricos",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a cache reduz a frequência efetiva do processador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que linguagens com coletor de lixo ficam fora do caminho crítico?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As pausas do coletor acontecem fora do seu controle",
                            isCorrect: true,
                        },
                        {
                            text: "Elas não conseguem acessar registradores de hardware",
                            isCorrect: false,
                        },
                        {
                            text: "Elas compilam para um formato que o RTOS não carrega",
                            isCorrect: false,
                        },
                        {
                            text: "Elas exigem mais de um núcleo para rodar corretamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o papel da alocação dinâmica na variância de tempo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O malloc percorre estruturas e leva tempo variável",
                            isCorrect: true,
                        },
                        {
                            text: "O malloc zera toda a memória e por isso é constante",
                            isCorrect: false,
                        },
                        {
                            text: "O malloc só varia quando o heap está totalmente vazio",
                            isCorrect: false,
                        },
                        {
                            text: "O malloc envia os dados ao disco quando a RAM enche",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde uma linguagem com GC ainda cabe num produto de tempo real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fora do caminho crítico: telemetria, painel, ferramentas",
                            isCorrect: true,
                        },
                        {
                            text: "Na ISR, desde que o coletor rode em outra prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Na malha de controle, se o processador tiver potência",
                            isCorrect: false,
                        },
                        {
                            text: "Em lugar nenhum: produtos embarcados proíbem o uso delas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um firmware só estoura o deadline quando chegam rajadas de pacotes de rede. Qual a causa mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Interrupções em excesso roubando CPU do caminho crítico",
                            isCorrect: true,
                        },
                        {
                            text: "A cache do processador desligada pelo driver de rede",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador removendo otimizações do código de rede",
                            isCorrect: false,
                        },
                        {
                            text: "O relógio do sistema perdendo precisão com o tráfego",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Onde o tempo real vive",
            blocks: [
                {
                    type: "text",
                    value: "# Os domínios clássicos\n\nTempo real é o software que encosta no mundo físico, e ele está em mais lugares do que parece.\n\nAUTOMOTIVO: um carro moderno carrega dezenas de ECUs. O ABS recalcula a pressão de frenagem a cada 5 a 10 milissegundos; a injeção eletrônica sincroniza com a rotação do motor; o airbag decide em cerca de 10 milissegundos. Software de segurança segue normas como a ISO 26262.\n\nAEROESPACIAL: fly-by-wire significa que entre o manche e a superfície de controle existe software, com redundância e certificação. Satélites e sondas somam o agravante de não ter técnico por perto, como o módulo 3 vai contar.\n\nMÉDICO: marcapasso que sente e estimula o coração, bomba de infusão que doseia remédio, ventilador pulmonar. Prazos de milissegundos com vidas penduradas neles.\n\nINDUSTRIAL: CLPs varrendo entradas e saídas a cada 1 a 10 milissegundos, robôs, esteiras, inversores.\n\nÁUDIO: interfaces e processamento ao vivo com buffers de 2 a 10 milissegundos; atrasou, o público ouviu o clique.",
                },
                {
                    type: "table",
                    value: '[["Domínio","Exemplo","Escala de tempo típica"],["Automotivo","ABS, airbag, injeção eletrônica","1 a 10 ms por ciclo"],["Aeroespacial","Fly-by-wire, controle de atitude","Milissegundos, com redundância"],["Médico","Marcapasso, bomba de infusão","Milissegundos a segundos"],["Industrial","CLP, robô, inversor","1 a 10 ms por varredura"],["Áudio","Interface e efeitos ao vivo","Buffers de 2 a 10 ms"]]',
                },
                {
                    type: "quote",
                    value: "Tempo real não é nicho: é o software que segura o mundo físico enquanto o resto da computação olha pra tela.",
                },
                {
                    type: "text",
                    value: "## O mercado e os perfis em 2026\n\nEm 2026, a demanda por gente de tempo real é puxada pela eletrificação automotiva, pelos robôs em logística e agricultura, pelos drones e pelos dispositivos médicos conectados. Os perfis mais comuns: engenheiro de firmware em microcontrolador (bare metal ou RTOS, o foco desta trilha), desenvolvedor de Linux embarcado (produtos com mais músculo, telas e rede), especialista automotivo (AUTOSAR, ISO 26262) e a turma de robótica, que em 2026 mistura ROS 2 com nós de tempo real.\n\nO conselho de carreira é o mesmo que vale pra escolher ferramenta: aprenda o que transfere. Escalonamento, análise de pior caso, disciplina de memória e medição valem em qualquer domínio e sobrevivem a qualquer troca de fabricante. O datasheet do chip da moda você aprende na primeira semana de trabalho; o critério pra dimensionar uma fila, não.\n\nMaterial em português sobre isso ainda é escasso, e é exatamente essa lacuna que você está atravessando agora. Nos próximos módulos, a base: o RTOS, o escalonamento e a memória.",
                },
            ],
            questions: [
                {
                    statement: "Qual escala de tempo um ciclo de CLP industrial costuma ter?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Da ordem de 1 a 10 ms por varredura completa",
                            isCorrect: true,
                        },
                        {
                            text: "Da ordem de nanossegundos por varredura completa",
                            isCorrect: false,
                        },
                        {
                            text: "Da ordem de meio segundo por varredura completa",
                            isCorrect: false,
                        },
                        {
                            text: "Da ordem de minutos, pois esteiras mudam devagar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que áudio ao vivo é um problema de tempo real?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Buffer que atrasa vira clique ou silêncio audível",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o volume depende da prioridade da tarefa",
                            isCorrect: false,
                        },
                        {
                            text: "Porque cada amostra exige acesso direto ao disco",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o ouvido humano só tolera latência zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o software automotivo de segurança?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Normas como ISO 26262 e prazos de milissegundos",
                            isCorrect: true,
                        },
                        {
                            text: "Atualizações contínuas várias vezes ao dia na frota",
                            isCorrect: false,
                        },
                        {
                            text: "Interface gráfica rica rodando na própria ECU do freio",
                            isCorrect: false,
                        },
                        {
                            text: "Uso intenso de coletor de lixo nas ECUs de segurança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual competência transfere melhor entre os domínios de tempo real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fundamentos: escalonamento, memória e medição de tempo",
                            isCorrect: true,
                        },
                        {
                            text: "O domínio completo da IDE de um único fabricante de chip",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de registradores decorada de um chip específico",
                            isCorrect: false,
                        },
                        {
                            text: "O catálogo de placas de desenvolvimento lançadas no ano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em 2026, o que puxa a demanda por engenheiros de tempo real?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Eletrificação, robôs, drones e dispositivos médicos",
                            isCorrect: true,
                        },
                        {
                            text: "A migração dos sistemas embarcados para a nuvem pública",
                            isCorrect: false,
                        },
                        {
                            text: "O fim dos microcontroladores de 32 bits no mercado",
                            isCorrect: false,
                        },
                        {
                            text: "A substituição do firmware por modelos de linguagem",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - RTOS",
    aulas: [
        {
            titulo: "Por que não um SO comum",
            blocks: [
                {
                    type: "text",
                    value: '# Contratos diferentes\n\nUm sistema operacional de propósito geral, como o Linux do seu notebook, foi projetado pra uma meta: aproveitar bem a máquina na média, sendo razoavelmente justo com dezenas de processos. O escalonador reparte CPU pensando em vazão e fluidez, a memória usa paginação, os drivers fazem trabalho pesado em momentos que você não escolhe. Nada disso promete prazo: sob carga, a resposta a um evento pode levar de microssegundos a dezenas de milissegundos, e o sistema continua "funcionando perfeitamente" segundo o contrato dele.\n\nUm RTOS assina outro contrato. Ele oferece pouquíssimo: tarefas, um escalonador preemptivo de prioridade fixa, filas, semáforos e timers, tudo em dezenas de kilobytes. Em troca, cada uma dessas peças tem comportamento temporal conhecido: a latência de interrupção é limitada e documentada em microssegundos, a preempção é garantida (a tarefa mais prioritária pronta assume a CPU, ponto), e nenhuma operação do kernel esconde um custo ilimitado.\n\nA diferença não é qualidade, é propósito: um otimiza a média de muitos, o outro garante o pior caso de poucos.',
                },
                {
                    type: "table",
                    value: '[["Aspecto","SO de propósito geral","RTOS"],["Meta","Vazão e justiça na média","Pior caso limitado"],["Escalonador","Justo, dinâmico, complexo","Prioridade fixa, preemptivo, simples"],["Latência de interrupção","Sem garantia, varia com a carga","Limitada e documentada, em microssegundos"],["Memória","Gigabytes, com paginação","Kilobytes a megabytes, sem paginação"],["Exemplos","Linux, Windows","FreeRTOS, Zephyr, VxWorks"]]',
                },
                {
                    type: "quote",
                    value: "O SO comum promete ser justo com todo mundo; o RTOS promete ser pontual com quem importa. São contratos diferentes.",
                },
                {
                    type: "text",
                    value: "## Linux com PREEMPT_RT, o meio termo\n\nExiste um caminho intermediário que amadureceu de vez: o PREEMPT_RT, conjunto de mudanças que torna o kernel Linux quase todo preemptível, move interrupções pra threads com prioridade e aplica herança de prioridade nos locks internos. Depois de vinte anos como patch, entrou na linha principal do kernel em 2024, e em 2026 é opção de configuração normal.\n\nCom PREEMPT_RT bem configurado, um Linux em hardware decente entrega latências de pior caso na casa de centenas de microssegundos. Isso basta pra muita coisa séria: robótica, áudio profissional, automação industrial com prazos de milissegundos. E você leva junto todo o ecossistema: rede, sistemas de arquivos, ferramentas, times que já conhecem Linux.\n\nO que ele não substitui: deadlines duros de microssegundos com consequência grave, certificação de segurança simples, consumo mínimo. Aí o desenho clássico vence: um microcontrolador com RTOS (ou bare metal) cuidando do caminho crítico, e o Linux, se existir no produto, cuidando do resto. O critério é sempre o mesmo: prazo, consequência e o quanto você consegue auditar do pior caso.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a meta de um escalonador de SO de propósito geral?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Vazão e justiça na média, sem garantir pior caso",
                            isCorrect: true,
                        },
                        {
                            text: "Garantir o deadline de todas as tarefas do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Minimizar a latência de interrupção a microssegundos",
                            isCorrect: false,
                        },
                        {
                            text: "Executar sempre a tarefa de maior prioridade pronta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um RTOS garante que um SO comum não garante?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Latência de interrupção e preempção com limite conhecido",
                            isCorrect: true,
                        },
                        {
                            text: "Execução mais veloz de qualquer código de aplicação usual",
                            isCorrect: false,
                        },
                        {
                            text: "Compatibilidade imediata com os periféricos do mercado",
                            isCorrect: false,
                        },
                        {
                            text: "Proteção completa de memória entre todos os processos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o PREEMPT_RT muda no Linux?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Torna o kernel preemptível, com latências de centenas de µs",
                            isCorrect: true,
                        },
                        {
                            text: "Remove o escalonador padrão e desativa metade dos drivers",
                            isCorrect: false,
                        },
                        {
                            text: "Transforma o Linux num microkernel certificado para voo",
                            isCorrect: false,
                        },
                        {
                            text: "Elimina interrupções, trocando tudo por polling do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra que classe de sistema o Linux com PREEMPT_RT costuma bastar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Robótica, áudio e industrial com prazos de milissegundos",
                            isCorrect: true,
                        },
                        {
                            text: "Airbag e freio, com prazos duríssimos de microssegundos",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer sistema, desde que o hardware tenha dois núcleos",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum sistema de verdade: o patch segue experimental",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um deadline hard de microssegundos pede MCU com RTOS em vez de Linux?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O pior caso do Linux é difícil de limitar e auditar",
                            isCorrect: true,
                        },
                        {
                            text: "O Linux não compila para nenhum processador de 32 bits",
                            isCorrect: false,
                        },
                        {
                            text: "O Linux exige interface gráfica sempre ativa no produto",
                            isCorrect: false,
                        },
                        {
                            text: "O RTOS executa qualquer código muito mais rápido que o Linux",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "FreeRTOS como referência",
            blocks: [
                {
                    type: "text",
                    value: "# Tarefas, estados e o tick\n\nO FreeRTOS vai ser nossa referência: kernel pequeno, licença MIT, presente em bilhões de dispositivos e no SDK de quase todo fabricante de microcontrolador. O que ele te dá é um vocabulário enxuto.\n\nTAREFA: uma função com laço infinito, um stack próprio e uma prioridade. Você cria com xTaskCreate e entrega o controle ao escalonador com vTaskStartScheduler.\n\nESTADOS: a tarefa está EXECUTANDO (dona da CPU), PRONTA (quer CPU, esperando a vez), BLOQUEADA (esperando tempo ou evento: um delay, uma fila vazia, um semáforo) ou SUSPENSA (fora do jogo até alguém chamar resume). O movimento saudável é o pêndulo entre bloqueada e executando: a tarefa dorme esperando o que lhe interessa, acorda, trabalha pouco e volta a dormir.\n\nTICK: uma interrupção periódica, tipicamente a cada 1 milissegundo, que dá noção de tempo ao kernel: é ela que vence os delays e os timeouts.\n\nO escalonador aplica uma regra só, sem exceção: a tarefa pronta de maior prioridade executa. É essa regra que o módulo 3 vai explorar a fundo.",
                },
                {
                    type: "code",
                    value: 'void vTaskControle(void *pvParameters) {\n    for (;;) {\n        ler_sensores();\n        calcular_comando();\n        aplicar_comando();\n        vTaskDelay(pdMS_TO_TICKS(2));   /* bloqueia 2 ms */\n    }\n}\n\nvoid vTaskTelemetria(void *pvParameters) {\n    for (;;) {\n        enviar_pacote();\n        vTaskDelay(pdMS_TO_TICKS(100)); /* bloqueia 100 ms */\n    }\n}\n\nint main(void) {\n    xTaskCreate(vTaskControle,   "controle",   512, NULL, 3, NULL);\n    xTaskCreate(vTaskTelemetria, "telemetria", 512, NULL, 1, NULL);\n    vTaskStartScheduler();\n    for (;;); /* nunca chega aqui */\n}',
                },
                {
                    type: "table",
                    value: '[["Estado","Significado","Como entra","Como sai"],["Executando","Dona da CPU agora","Escolhida pelo escalonador","Preemptada ou bloqueia"],["Pronta","Quer CPU, aguardando a vez","Evento chegou ou delay venceu","Escalonador a escolhe"],["Bloqueada","Espera tempo ou evento","Delay, fila vazia, semáforo","Evento chega ou timeout vence"],["Suspensa","Fora do jogo até ordem","vTaskSuspend","vTaskResume"]]',
                },
                {
                    type: "quote",
                    value: "Tarefa boa passa a vida bloqueada: quem fica pronta o tempo todo está roubando CPU de alguém.",
                },
                {
                    type: "text",
                    value: "## E o Zephyr?\n\nVale situar o mapa de 2026. O FreeRTOS segue como o RTOS mais difundido do mercado e é a melhor porta de entrada: pequeno, estável, documentação madura, e os conceitos (tarefa, fila, semáforo, tick) aparecem com outros nomes em qualquer concorrente.\n\nO Zephyr, projeto da Linux Foundation, é a alternativa em ascensão: traz devicetree pra descrever hardware, stacks integradas de Bluetooth e rede, build system unificado e um modelo de desenvolvimento parecido com o do kernel Linux. Fabricantes grandes vêm adotando o Zephyr como SDK oficial, e em 2026 ele é presença constante em produto novo com conectividade.\n\nA boa notícia: nada do que você vai aprender aqui se perde na troca. Tarefas viram threads, filas continuam filas, prioridades continuam mandando. O critério de escolha num projeto real é prosaico: qual RTOS o fabricante do seu chip suporta bem, quais stacks de conectividade o produto precisa e com qual a equipe já tem estrada. Aprenda os conceitos num, leia o manual do outro em uma tarde.",
                },
            ],
            questions: [
                {
                    statement: "No FreeRTOS, o que é uma tarefa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma função com stack e prioridade próprias",
                            isCorrect: true,
                        },
                        {
                            text: "Um processo com espaço de memória isolado",
                            isCorrect: false,
                        },
                        {
                            text: "Uma interrupção de hardware com nome amigável",
                            isCorrect: false,
                        },
                        {
                            text: "Um arquivo compilado separadamente do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual estado uma tarefa bem projetada ocupa na maior parte do tempo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Bloqueada, à espera de um evento ou de tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Executando, para aproveitar melhor a CPU",
                            isCorrect: false,
                        },
                        {
                            text: "Pronta, para responder no mesmo instante",
                            isCorrect: false,
                        },
                        {
                            text: "Suspensa, para economizar memória de stack",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o escalonador do FreeRTOS executa a cada momento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A tarefa pronta de maior prioridade no instante",
                            isCorrect: true,
                        },
                        {
                            text: "A tarefa que está esperando há mais tempo na fila",
                            isCorrect: false,
                        },
                        {
                            text: "Todas as tarefas em fatias iguais de tempo de CPU",
                            isCorrect: false,
                        },
                        {
                            text: "A tarefa com menor uso acumulado de processador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No exemplo, por que a tarefa de controle tem prioridade 3 e a telemetria 1?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O prazo do controle é mais curto e mais crítico",
                            isCorrect: true,
                        },
                        {
                            text: "A telemetria usa mais memória e precisa ceder CPU",
                            isCorrect: false,
                        },
                        {
                            text: "O controle foi criado primeiro e herda a prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Números maiores economizam energia no escalonador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que descreve o Zephyr em 2026?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "RTOS da Linux Foundation em ascensão, com devicetree",
                            isCorrect: true,
                        },
                        {
                            text: "Uma distribuição Linux mínima para microcontroladores",
                            isCorrect: false,
                        },
                        {
                            text: "Um fork do FreeRTOS mantido pela mesma fundação",
                            isCorrect: false,
                        },
                        {
                            text: "Um bootloader que carrega imagens de kernel assinadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ISR, as regras do jogo",
            blocks: [
                {
                    type: "text",
                    value: '# A rotina que interrompe tudo\n\nQuando o hardware tem algo urgente (um byte chegou na UART, o conversor terminou, o pino mudou), ele interrompe o processador: o código atual congela, a ISR (rotina de serviço de interrupção) executa, e só depois o mundo continua. Esse mecanismo é o que dá reflexo ao firmware, e é também uma zona com regras próprias, porque enquanto a ISR roda, TODAS as tarefas param, e interrupções de prioridade igual ou menor esperam.\n\nAs regras do jogo, sem exceção:\n\nCURTA: microssegundos, não milissegundos. Cada microssegundo seu vira latência de todo o resto do sistema.\n\nSEM BLOQUEIO: ISR não é tarefa. Não pode esperar fila, mutex nem delay; não existe "dormir" dentro de uma interrupção.\n\nSEM MALLOC, SEM PRINTF: tempo variável, locks internos, buffers compartilhados. Nada disso entra.\n\nSINALIZA E SAI: capture o fato (leia o registrador, limpe a flag), entregue pra quem processa e retorne.\n\nO trabalho de verdade acontece depois, numa tarefa comum, com prioridade adequada. A ISR é o porteiro, não a fábrica.',
                },
                {
                    type: "code",
                    value: "/* Ruim: trabalho pesado dentro da ISR */\nvoid UART_IRQHandler(void) {\n    uint8_t b = UART->DR;\n    processar_protocolo(b);   /* parse, CRC, log... */\n    atualizar_display(b);     /* I2C lento, na ISR! */\n}\n\n/* Bom: capturar, sinalizar e sair */\nvoid UART_IRQHandler(void) {\n    uint8_t b = UART->DR;\n    BaseType_t acordou = pdFALSE;\n    xQueueSendFromISR(filaRx, &b, &acordou);\n    portYIELD_FROM_ISR(acordou);\n}",
                },
                {
                    type: "table",
                    value: '[["Na ISR","Pode?","Por quê"],["Ler registrador e limpar a flag","Sim","É o trabalho dela"],["Enviar pra fila com FromISR","Sim","Não bloqueia, só sinaliza"],["Esperar mutex ou chamar delay","Não","ISR não pode bloquear"],["malloc ou printf","Não","Tempo variável e locks internos"],["Laço longo de processamento","Não","Atrasa tarefas e outras ISRs"]]',
                },
                {
                    type: "quote",
                    value: "ISR boa cabe numa frase: capture o fato, sinalize quem processa e devolva a CPU antes que alguém sinta a falta.",
                },
                {
                    type: "text",
                    value: "## Deferred work: o trabalho fica pra tarefa\n\nO padrão tem nome: trabalho adiado (deferred work). A ISR faz o mínimo inadiável e uma tarefa, acordada pela sinalização, faz o resto. No Linux a mesma ideia aparece como top half e bottom half; no FreeRTOS, é a dupla ISR curta mais tarefa de processamento com prioridade bem escolhida.\n\nComo saber se a sua ISR é curta de verdade? Medindo. O truque clássico custa um pino: leve um GPIO a nível alto na primeira linha da ISR e a nível baixo na última, e pendure um osciloscópio ou analisador lógico. A largura do pulso é a duração real, com pior caso visível ao longo de horas. Faça essa conta fechar: uma ISR de 5 microssegundos disparando 10 mil vezes por segundo consome 5% da CPU; a mesma ISR com um printf de 1 milissegundo dentro consumiria dez CPUs.\n\nDuração vezes taxa: esse produto é o orçamento da sua interrupção, e ele precisa caber na margem do sistema, não no otimismo do autor.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel de uma ISR bem escrita?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Capturar o evento, sinalizar uma tarefa e retornar",
                            isCorrect: true,
                        },
                        {
                            text: "Processar o dado por completo antes de retornar",
                            isCorrect: false,
                        },
                        {
                            text: "Agendar a si mesma para rodar de novo em seguida",
                            isCorrect: false,
                        },
                        {
                            text: "Elevar a própria prioridade e concluir o protocolo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que malloc é proibido dentro de ISR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tempo variável e uso de locks internos do heap",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o heap fica fora do mapa de memória da ISR",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a ISR não tem permissão de escrita na RAM",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o malloc zera os registradores da interrupção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma ISR não pode esperar um mutex?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "ISR não é tarefa e não pode bloquear a CPU esperando",
                            isCorrect: true,
                        },
                        {
                            text: "Porque mutexes só funcionam entre tarefas de mesmo nome",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o mutex apaga o contexto salvo da interrupção",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a espera consumiria o stack de outra tarefa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece enquanto uma ISR longa executa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tarefas e interrupções de nível igual ou menor esperam",
                            isCorrect: true,
                        },
                        {
                            text: "O escalonador reparte a ISR em fatias de tempo justas",
                            isCorrect: false,
                        },
                        {
                            text: "As tarefas seguem normais, pois a ISR roda em paralelo",
                            isCorrect: false,
                        },
                        {
                            text: "O watchdog congela a contagem até a rotina terminar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como medir a duração real de uma ISR no hardware?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "GPIO alto na entrada, baixo na saída, e osciloscópio",
                            isCorrect: true,
                        },
                        {
                            text: "printf com timestamp no início e no fim da rotina",
                            isCorrect: false,
                        },
                        {
                            text: "Cronometrar com vTaskDelay dentro da própria ISR",
                            isCorrect: false,
                        },
                        {
                            text: "Contar linhas de código e multiplicar pelo clock da CPU",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "ISR fala com tarefa",
            blocks: [
                {
                    type: "text",
                    value: '# A fronteira e suas pontes\n\nSe a ISR captura e a tarefa processa, precisa existir um canal seguro entre as duas. O FreeRTOS oferece três pontes, e todas têm uma versão especial pra usar de dentro da interrupção, com o sufixo FromISR.\n\nPor que uma API separada? Porque o contexto de interrupção é outro mundo: não pode bloquear, não pertence a nenhuma tarefa e não pode decidir sozinho uma troca de contexto no meio do caminho. As versões FromISR nunca esperam (se a fila está cheia, falham na hora) e devolvem num parâmetro a informação "acordei uma tarefa mais prioritária que a interrompida". Com ela, você chama portYIELD_FROM_ISR na última linha, e a troca de contexto acontece imediatamente na saída da interrupção, em vez de esperar o próximo tick.\n\nAs três pontes: o SEMÁFORO BINÁRIO diz "aconteceu"; a FILA diz "aconteceu, e aqui está o dado"; a TASK NOTIFICATION é o sinal direto e leve pra uma tarefa específica, a opção mais rápida e econômica do FreeRTOS quando só uma tarefa consome o evento.',
                },
                {
                    type: "code",
                    value: "static QueueHandle_t filaRx;\n\nvoid UART_IRQHandler(void) {\n    uint8_t b = UART->DR;\n    BaseType_t acordou = pdFALSE;\n    xQueueSendFromISR(filaRx, &b, &acordou);\n    portYIELD_FROM_ISR(acordou);\n}\n\nvoid vTaskProtocolo(void *arg) {\n    uint8_t b;\n    for (;;) {\n        if (xQueueReceive(filaRx, &b, portMAX_DELAY) == pdTRUE) {\n            montar_quadro(b);   /* trabalho pesado, fora da ISR */\n        }\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Primitiva","Carrega dado?","Uso típico","Versão de ISR"],["Semáforo binário","Não","Acordar tarefa: o evento aconteceu","xSemaphoreGiveFromISR"],["Fila","Sim","Bytes de UART, amostras, comandos","xQueueSendFromISR"],["Task notification","Até 32 bits","Sinal leve pra uma tarefa fixa","vTaskNotifyGiveFromISR"]]',
                },
                {
                    type: "quote",
                    value: "A fronteira entre ISR e tarefa é o contrato mais importante do firmware: de um lado a pressa, do outro o trabalho.",
                },
                {
                    type: "text",
                    value: '## Qual ponte escolher\n\nO critério cabe em três perguntas. Primeira: o consumidor precisa do DADO ou só do fato? Se precisa do dado (bytes, amostras, comandos), fila. Se só do fato, siga.\n\nSegunda: quantas tarefas podem consumir o sinal? Se exatamente uma, e sempre a mesma, use task notification: segundo a própria documentação do FreeRTOS, ela é significativamente mais rápida que um semáforo e não custa objeto de kernel separado, porque o "slot" de notificação já vive dentro da tarefa. Se mais de uma tarefa pode tomar o evento, ou se você quer a semântica clássica de contagem, fica com o semáforo.\n\nTerceira: qual o custo de perder? Fila cheia com FromISR descarta na hora, e você PRECISA contar esses descartes (um contador de overflow por fila é higiene básica). Notificações do tipo "give" se acumulam como contador; sinais repetidos não se perdem, mas também não carregam payload distinto.\n\nDimensionamento de fila tem aula própria no módulo 6; por ora, grave a fronteira: FromISR na interrupção, versão normal na tarefa, yield na saída.',
                },
            ],
            questions: [
                {
                    statement:
                        "Pra passar bytes de uma ISR de UART a uma tarefa, qual primitiva usar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma fila, enviando com xQueueSendFromISR",
                            isCorrect: true,
                        },
                        {
                            text: "Um mutex protegendo uma variável global",
                            isCorrect: false,
                        },
                        {
                            text: "Um vTaskDelay curto dentro da própria ISR",
                            isCorrect: false,
                        },
                        {
                            text: "Uma segunda ISR de prioridade mais baixa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a versão FromISR de uma primitiva nunca faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Bloquear esperando espaço ou disponibilidade",
                            isCorrect: true,
                        },
                        {
                            text: "Escrever o dado na estrutura de destino",
                            isCorrect: false,
                        },
                        {
                            text: "Executar dentro do contexto da interrupção",
                            isCorrect: false,
                        },
                        {
                            text: "Sinalizar a tarefa que estava esperando",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra que serve o parâmetro de retorno das chamadas FromISR (o acordou)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pedir o yield na saída, se acordou tarefa mais prioritária",
                            isCorrect: true,
                        },
                        {
                            text: "Contar quantas tarefas foram acordadas pela interrupção",
                            isCorrect: false,
                        },
                        {
                            text: "Indicar que a fila encheu e o dado foi descartado na hora",
                            isCorrect: false,
                        },
                        {
                            text: "Confirmar que a ISR pode ser chamada novamente depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a task notification vence fila e semáforo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como sinal leve e rápido para uma única tarefa fixa",
                            isCorrect: true,
                        },
                        {
                            text: "Quando várias tarefas precisam receber o mesmo sinal",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o dado enviado é maior que uma palavra de 32 bits",
                            isCorrect: false,
                        },
                        {
                            text: "Quando a sinalização precisa atravessar dois núcleos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Sem o portYIELD_FROM_ISR no fim da ISR, o que pode acontecer?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A tarefa acordada espera até o próximo ponto de escalonamento",
                            isCorrect: true,
                        },
                        {
                            text: "A fila devolve o dado enviado e a ISR executa duas vezes",
                            isCorrect: false,
                        },
                        {
                            text: "O escalonador desativa a interrupção por medida de segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Nada muda: o yield é somente uma otimização de consumo de energia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Timers e tick",
            blocks: [
                {
                    type: "text",
                    value: "# A régua do kernel\n\nO tick é a batida do coração do RTOS: uma interrupção periódica, tipicamente a 1000 Hz (1 milissegundo), que incrementa o relógio do kernel. É ela que vence delays, expira timeouts de fila e semáforo e dispara a troca entre tarefas de mesma prioridade.\n\nA resolução importa, e engana. Com tick de 1 ms, pedir vTaskDelay de 1 tick pode dormir QUASE ZERO: se você chamou no meio do intervalo, o próximo tick chega em menos de 1 ms. Por isso delays curtos pedem cuidado, e medição fina nunca usa o tick.\n\nPra tarefas periódicas existe uma pegadinha clássica. vTaskDelay conta a partir do momento da chamada: se a malha levou 0,3 ms pra executar, o período real vira 2,3 ms, e a deriva se acumula ciclo a ciclo. A solução é vTaskDelayUntil, que trabalha com um instante absoluto de referência: cada iteração acorda no múltiplo exato do período, e o tempo de execução da malha deixa de contaminar o ritmo. Malha de controle sem deriva usa sempre a versão Until.",
                },
                {
                    type: "code",
                    value: "void vTaskControle(void *arg) {\n    TickType_t proximo = xTaskGetTickCount();\n    for (;;) {\n        executar_malha();\n        /* acorda em multiplos exatos de 2 ms, sem deriva */\n        vTaskDelayUntil(&proximo, pdMS_TO_TICKS(2));\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Mecanismo","Resolução","Onde executa","Uso certo"],["Tick do kernel","1 ms típico","ISR do timer do sistema","Delays e timeouts de tarefa"],["Timer de software","Múltiplos do tick","Tarefa daemon do RTOS","Callbacks leves e periódicos"],["Timer de hardware","Submicrossegundo","Periférico dedicado","Medição fina, PWM, captura"]]',
                },
                {
                    type: "quote",
                    value: "O tick é uma régua de milímetros: mede tábua, não fio de cabelo. Pra microssegundos, a régua é o timer de hardware.",
                },
                {
                    type: "text",
                    value: "## Timers de software, tickless e o overflow\n\nTimers de software (xTimerCreate) executam o callback na tarefa daemon de timers do FreeRTOS, não numa ISR. Isso significa duas coisas: o callback pode usar a API normal do kernel, e a pontualidade dele depende da prioridade da daemon e do que mais estiver rodando. Callback de timer é lugar de trabalho leve; pesado, sinalize uma tarefa.\n\nEm produto a bateria, o tick periódico vira vilão: acordar o processador mil vezes por segundo pra não fazer nada custa energia. O modo tickless (configUSE_TICKLESS_IDLE) suprime o tick na ociosidade e programa o hardware pra acordar só no próximo evento agendado, alongando o sono real do chip.\n\nE pra medir tempo direito: use um timer de hardware ou o contador de ciclos (no Cortex-M, o DWT CYCCNT) pra microssegundos, e aritmética SEM SINAL pra diferenças. Contador de milissegundos em 32 bits transborda em 49,7 dias; a subtração agora menos antes em unsigned sobrevive ao estouro, a comparação ingênua não. Firmware que trava depois de semanas ligado quase sempre pisou nessa.",
                },
            ],
            questions: [
                {
                    statement: "O que é o tick de um RTOS?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A interrupção periódica que marca o tempo do kernel",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo que uma troca de contexto sempre consome",
                            isCorrect: false,
                        },
                        {
                            text: "O ciclo de clock do processador visto pelo kernel",
                            isCorrect: false,
                        },
                        {
                            text: "O intervalo mínimo entre duas interrupções externas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra um laço periódico sem deriva, qual chamada usar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "vTaskDelayUntil, com referência absoluta de tempo",
                            isCorrect: true,
                        },
                        {
                            text: "vTaskDelay, contando o atraso a partir do retorno",
                            isCorrect: false,
                        },
                        {
                            text: "vTaskSuspend seguido de vTaskResume pelo timer",
                            isCorrect: false,
                        },
                        {
                            text: "taskYIELD dentro de um laço de espera ocupada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde executa o callback de um timer de software do FreeRTOS?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na tarefa daemon de timers, não numa ISR",
                            isCorrect: true,
                        },
                        {
                            text: "Na ISR do tick, junto com o escalonador",
                            isCorrect: false,
                        },
                        {
                            text: "Na tarefa que criou o timer, por herança",
                            isCorrect: false,
                        },
                        {
                            text: "Numa tarefa nova criada a cada disparo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Pra que serve o tickless idle?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Suprimir ticks na ociosidade e economizar energia",
                            isCorrect: true,
                        },
                        {
                            text: "Acelerar o tick quando o sistema está carregado",
                            isCorrect: false,
                        },
                        {
                            text: "Eliminar a necessidade de timer de hardware no chip",
                            isCorrect: false,
                        },
                        {
                            text: "Reduzir a latência de interrupção dos periféricos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que medir microssegundos com o tick de 1 ms é um erro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A resolução do tick é mil vezes maior que a medida",
                            isCorrect: true,
                        },
                        {
                            text: "O tick para de contar durante as interrupções longas",
                            isCorrect: false,
                        },
                        {
                            text: "O tick só existe quando o escalonador está suspenso",
                            isCorrect: false,
                        },
                        {
                            text: "O tick conta em segundos inteiros desde a partida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Escalonamento de tempo real",
    aulas: [
        {
            titulo: "Prioridades fixas e preempção",
            blocks: [
                {
                    type: "text",
                    value: '# A regra de ouro\n\nTodo o escalonamento de tempo real com prioridades fixas se resume a uma frase: a tarefa pronta de maior prioridade executa, SEMPRE, e imediatamente. Se uma tarefa mais prioritária fica pronta (a fila dela recebeu um item, o delay venceu, a ISR a sinalizou), ela toma a CPU da atual naquele instante. Isso é preempção, e é ela que transforma prioridade em garantia.\n\nNote o que a regra não diz: ela não fala em justiça, nem em revezamento, nem em "dar chance". O escalonador de RTOS é deliberadamente implacável, porque é essa implacabilidade que permite ANALISAR o sistema: se você sabe quem sempre vence, sabe calcular o pior caso de quem perde.\n\nA consequência prática é que atribuir prioridades é decisão de engenharia, não de vaidade. O critério correto é a criticidade TEMPORAL: quem tem o prazo mais curto e a consequência mais dura fica em cima. O erro clássico é priorizar pela importância percebida do recurso ("a comunicação com o servidor é essencial pro negócio") e deixar a malha de 2 milissegundos apanhando de uma tarefa de rede que podia esperar meio segundo.',
                },
                {
                    type: "table",
                    value: '[["Critério de prioridade","Exemplo","Resultado"],["Criticidade temporal (certo)","Malha de 2 ms acima da telemetria de 100 ms","Prazos cumpridos e analisáveis"],["Importância percebida (errado)","Rede do produto acima da malha de controle","Controle perde prazo nas rajadas"],["Ordem de criação (errado)","Primeira tarefa criada no topo","Prioridade vira acidente de código"],["Tudo na mesma (errado)","Todas em prioridade média","Round-robin decide quem atrasa"]]',
                },
                {
                    type: "quote",
                    value: "Prioridade não é status, é matemática: quem tem o prazo mais curto precisa da CPU primeiro.",
                },
                {
                    type: "text",
                    value: "## Mesma prioridade, starvation e a tarefa ociosa\n\nEntre tarefas prontas de MESMA prioridade, o FreeRTOS reveza por round-robin a cada tick (com o time slicing habilitado). É um empate administrado, não uma garantia: se dois trabalhos têm prazos diferentes, não deveriam estar empatados.\n\nA regra de ouro tem um efeito colateral que você precisa respeitar: quem está em cima e não bloqueia mata todo mundo embaixo de fome (starvation). Uma tarefa de alta prioridade com um laço de espera ocupada, esperando um bit num registrador em vez de bloquear numa fila, congela o resto do sistema indefinidamente, e o escalonador está funcionando EXATAMENTE como prometido. Por isso o mantra do módulo 2: toda tarefa precisa bloquear; espera ocupada em prioridade alta é bug, não estilo.\n\nNo porão do sistema vive a tarefa ociosa (idle), prioridade zero, criada pelo próprio kernel: ela roda quando ninguém mais quer a CPU, limpa recursos de tarefas encerradas e é o gancho dos modos de economia de energia. Medir quanto tempo a idle roda, aliás, é o jeito mais barato de saber quanta folga de CPU sobrou.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a regra de um escalonador preemptivo de prioridade fixa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A tarefa pronta de maior prioridade sempre executa",
                            isCorrect: true,
                        },
                        {
                            text: "As tarefas se revezam em fatias iguais de tempo",
                            isCorrect: false,
                        },
                        {
                            text: "A tarefa que chegou primeiro termina antes das outras",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel sorteia entre as tarefas prontas a cada tick",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como atribuir prioridades corretamente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pela criticidade temporal: prazo mais curto, mais alto",
                            isCorrect: true,
                        },
                        {
                            text: "Pela importância da funcionalidade para o cliente final",
                            isCorrect: false,
                        },
                        {
                            text: "Pela ordem de criação das tarefas na inicialização",
                            isCorrect: false,
                        },
                        {
                            text: "Pelo tamanho do stack que cada tarefa vai consumir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tarefa de alta prioridade entra num laço de espera ocupada. O que acontece?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Todas as tarefas abaixo dela param de receber CPU",
                            isCorrect: true,
                        },
                        {
                            text: "O escalonador rebaixa a prioridade dela aos poucos",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel encerra a tarefa por excesso de uso de CPU",
                            isCorrect: false,
                        },
                        {
                            text: "As demais tarefas seguem nas fatias de tempo do tick",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece entre duas tarefas prontas de mesma prioridade no FreeRTOS?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revezam em round-robin a cada tick do sistema",
                            isCorrect: true,
                        },
                        {
                            text: "A mais antiga executa até terminar ou bloquear",
                            isCorrect: false,
                        },
                        {
                            text: "A de menor stack executa primeiro por economia",
                            isCorrect: false,
                        },
                        {
                            text: "O escalonador promove uma delas ao nível acima",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a preempção acontece, exatamente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Assim que uma tarefa mais prioritária fica pronta",
                            isCorrect: true,
                        },
                        {
                            text: "Somente na virada do tick, uma vez por milissegundo",
                            isCorrect: false,
                        },
                        {
                            text: "Somente quando a tarefa atual devolve a CPU ao kernel",
                            isCorrect: false,
                        },
                        {
                            text: "No fim do quantum de tempo da tarefa em execução",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RMS: prioridade pela taxa",
            blocks: [
                {
                    type: "text",
                    value: "# Rate Monotonic Scheduling\n\nSe prioridades fixas são a regra do jogo, falta o critério pra distribuí-las. O RMS (Rate Monotonic Scheduling) dá a resposta clássica: prioridade pela TAXA. Período menor, prioridade maior, sem exceção e sem opinião. A malha de 2 ms fica acima da leitura de 10 ms, que fica acima da comunicação de 50 ms.\n\nIsso não é só uma heurística simpática. Liu e Layland provaram em 1973 que, pra tarefas periódicas e independentes com deadline igual ao período, o RMS é ÓTIMO entre as políticas de prioridade fixa: se algum arranjo de prioridades fixas consegue cumprir todos os prazos, o arranjo do RMS consegue também. Você não precisa inventar nada melhor, porque não existe.\n\nE vem com um bônus raro em engenharia: um teste de papel. Some a utilização de cada tarefa, U igual a C sobre T (tempo de execução de pior caso dividido pelo período). Se a soma ficar abaixo de n vezes (2 elevado a 1 sobre n, menos 1), com n tarefas, TODOS os prazos estão garantidos. Esse limite vale 0,828 pra duas tarefas, 0,780 pra três, 0,757 pra quatro, e desce até 69,3% (ln 2) pra muitas tarefas.",
                },
                {
                    type: "table",
                    value: '[["Tarefa","C (pior caso)","T (período)","U = C/T"],["Malha de controle","0,6 ms","2 ms","0,30"],["Leitura de sensores","1,0 ms","10 ms","0,10"],["Comunicação","4,0 ms","50 ms","0,08"],["Total","","","0,48, abaixo do limite 0,78 pra 3 tarefas"]]',
                },
                {
                    type: "quote",
                    value: "O teste de utilização é o raro luxo do firmware: uma conta de padaria que garante que nenhum prazo vai estourar.",
                },
                {
                    type: "text",
                    value: '## O que o teste diz, e o que ele cala\n\nLeia o contrato com atenção, porque ele é assimétrico. O teste é SUFICIENTE, não necessário: passou, está garantido; falhou, não significa impossível, significa "não sei". Conjuntos acima do limite podem funcionar perfeitamente (com períodos harmônicos, em que cada período divide o seguinte, dá pra chegar a 100% de utilização), mas aí a garantia precisa vir de uma análise mais fina, a análise de tempo de resposta, que calcula tarefa a tarefa o pior atraso possível.\n\nE leia as hipóteses, porque o mundo real as viola: tarefas periódicas, independentes (sem mutex compartilhado, que o Pathfinder daqui a duas aulas vai desmentir), deadline igual ao período, custo de troca de contexto desprezível. Nada disso é exatamente verdade no seu firmware.\n\nO uso maduro do teste é como primeiro filtro e como margem de projeto: se o seu conjunto passa com folga (utilização total na casa dos 50%, digamos), você dorme tranquilo e tem espaço pra crescer. Se está raspando no limite, o teste está te dizendo pra medir melhor, otimizar ou comprar folga de hardware, ANTES de descobrir em campo.',
                },
            ],
            questions: [
                {
                    statement: "Como o RMS atribui prioridades?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Pela taxa: período menor recebe prioridade maior",
                            isCorrect: true,
                        },
                        {
                            text: "Pelo deadline dinâmico mais próximo a cada instante",
                            isCorrect: false,
                        },
                        {
                            text: "Pelo tempo de execução: tarefa mais curta no topo",
                            isCorrect: false,
                        },
                        {
                            text: "Pela importância declarada no documento de requisitos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa passar no teste de utilização do RMS?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Todos os prazos serão cumpridos, garantido pela análise",
                            isCorrect: true,
                        },
                        {
                            text: "A CPU ficará ociosa por pelo menos metade do tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma interrupção chegará durante o caminho crítico",
                            isCorrect: false,
                        },
                        {
                            text: "As trocas de contexto ficarão abaixo de cem por segundo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o limite de utilização do RMS pra muitas tarefas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cerca de 69%, limite clássico de Liu e Layland",
                            isCorrect: true,
                        },
                        {
                            text: "Exatos 50%, metade da capacidade do processador",
                            isCorrect: false,
                        },
                        {
                            text: "95%, desde que o tick seja de um milissegundo",
                            isCorrect: false,
                        },
                        {
                            text: "80%, valendo apenas para períodos idênticos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Três tarefas somam utilização 0,48 e o limite pra três é 0,78. Conclusão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Escalonável: o conjunto passa no teste com folga",
                            isCorrect: true,
                        },
                        {
                            text: "Inconclusivo: o teste exige ao menos cinco tarefas",
                            isCorrect: false,
                        },
                        {
                            text: "Não escalonável: 0,48 está abaixo do mínimo exigido",
                            isCorrect: false,
                        },
                        {
                            text: "Inconclusivo: falta somar o período total das tarefas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Utilização de 0,85 falha no teste do RMS. O que isso significa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Inconclusivo: pode escalonar, decide análise mais fina",
                            isCorrect: true,
                        },
                        {
                            text: "Impossível escalonar: os prazos vão estourar sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Escalonável: 0,85 é menor que 1,0 e portanto passa",
                            isCorrect: false,
                        },
                        {
                            text: "O RMS rejeita o conjunto e obriga a migração pra EDF",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "EDF: deadline mais próximo primeiro",
            blocks: [
                {
                    type: "text",
                    value: "# O escalonador guloso por prazo\n\nO EDF (Earliest Deadline First) abandona prioridades fixas: a cada instante, executa a tarefa cujo deadline absoluto está mais próximo. As prioridades são dinâmicas, recalculadas conforme os prazos se aproximam, e nenhum número é atribuído por você.\n\nO prêmio é o maior possível: pra tarefas periódicas com deadline igual ao período, o EDF garante todos os prazos enquanto a utilização total não passar de 1. Cem por cento da CPU, contra os 69 a 78% garantidos do RMS. No papel, é o escalonador ótimo em processador único: se ALGUMA política consegue cumprir os prazos, o EDF consegue.\n\nEntão por que o mundo embarcado inteiro não usa? Porque o prêmio tem contrapartidas. O kernel precisa manter e comparar deadlines a cada decisão, um custo extra de execução e de complexidade. A análise de sistemas reais (com bloqueios, jitter de ativação, deadlines diferentes do período) é mais delicada que a do RMS. E o comportamento em SOBRECARGA é o calcanhar: quando a demanda passa de 100%, o EDF entra em efeito dominó, com atrasos se espalhando por todas as tarefas de forma difícil de prever.",
                },
                {
                    type: "table",
                    value: '[["Critério","RMS","EDF"],["Prioridade","Fixa, pela taxa","Dinâmica, pelo deadline"],["Utilização garantida","69 a 78%, conforme n","Até 100%"],["Análise do sistema real","Simples e madura","Mais delicada"],["Em sobrecarga","Sacrifica as de baixa prioridade, previsível","Efeito dominó, difícil de prever"],["Suporte em RTOS","Nativo em praticamente todos","Raro: Zephyr tem, FreeRTOS não"]]',
                },
                {
                    type: "quote",
                    value: "O RMS falha com hierarquia e avisa quem paga a conta; o EDF espreme cada ciclo e, na sobrecarga, derruba todos sem escolher.",
                },
                {
                    type: "text",
                    value: "## Critério de escolha, não torcida\n\nNa sobrecarga, o RMS falha do jeito que um engenheiro gosta: as tarefas de MENOR prioridade perdem primeiro, sempre elas, e as críticas em cima seguem intocadas. Você sabe de antemão quem sangra. Essa previsibilidade na degradação, somada à análise madura, explica por que prioridade fixa domina os setores certificados (automotivo, aeroespacial, médico): auditor quer pior caso demonstrável, inclusive do fracasso.\n\nO suporte prático segue o mesmo desenho: o FreeRTOS não traz EDF nativo; o Zephyr oferece EDF como política; RTOS de pesquisa e o SCHED_DEADLINE do Linux completam o mapa. Ou seja: em 2026, usar EDF é uma decisão que restringe suas opções de plataforma, e precisa se pagar.\n\nO critério: se o seu conjunto de tarefas precisa de utilização alta num núcleo só (acima dos 78%) e o domínio tolera degradação menos previsível, EDF onde houver suporte. Se você está em domínio certificado, ou passa no teste do RMS com folga, prioridade fixa vence pela simplicidade da análise. Escalonador não é time de futebol: é ferramenta com contrato, e o contrato decide.",
                },
            ],
            questions: [
                {
                    statement: "Como o EDF decide quem executa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sempre a tarefa com o deadline absoluto mais próximo",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre a tarefa com o menor período configurado",
                            isCorrect: false,
                        },
                        {
                            text: "Sempre a tarefa que está esperando há mais tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Sempre a tarefa com a maior prioridade fixa definida",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual utilização o EDF consegue atingir garantindo prazos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Até 100%, com o teste U menor ou igual a 1",
                            isCorrect: true,
                        },
                        {
                            text: "Até 69%, como qualquer política de prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Até 50%, pela necessidade de folga dinâmica",
                            isCorrect: false,
                        },
                        {
                            text: "Até 78%, o mesmo limite fixo garantido do RMS",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como RMS e EDF se comportam na sobrecarga?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "RMS sacrifica as de menor prioridade; EDF degrada geral",
                            isCorrect: true,
                        },
                        {
                            text: "Os dois pausam a tarefa mais longa até a carga baixar",
                            isCorrect: false,
                        },
                        {
                            text: "EDF protege as tarefas críticas; RMS derruba todas elas",
                            isCorrect: false,
                        },
                        {
                            text: "Ambos rejeitam tarefas novas e mantêm todos os prazos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que prioridade fixa domina o automotivo e o aeroespacial?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Análise simples e madura facilita certificar o pior caso",
                            isCorrect: true,
                        },
                        {
                            text: "EDF é proibido por norma nesses setores desde os anos 90",
                            isCorrect: false,
                        },
                        {
                            text: "Prioridade fixa dispensa qualquer análise de escalonamento",
                            isCorrect: false,
                        },
                        {
                            text: "EDF exige processadores de mais de um núcleo pra operar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Seu conjunto precisa de 85% de utilização num só núcleo. O que considerar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "EDF onde houver suporte, ou hardware com mais folga",
                            isCorrect: true,
                        },
                        {
                            text: "Somente subir o clock, pois política não muda o limite",
                            isCorrect: false,
                        },
                        {
                            text: "Reescrever as tarefas como ISRs pra fugir do escalonador",
                            isCorrect: false,
                        },
                        {
                            text: "Dividir cada tarefa em duas pra dobrar o limite do RMS",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Inversão de prioridade e o caso Pathfinder",
            blocks: [
                {
                    type: "text",
                    value: "# Um robô travando em Marte\n\nEm 4 de julho de 1997, a Mars Pathfinder pousou e virou manchete. Dias depois, virou outra: o computador de bordo resetava sozinho, perdendo o trabalho do dia, e ninguém sabia por quê.\n\nO software rodava sobre o RTOS VxWorks, com um barramento de informações protegido por mutex. Três personagens importam. A tarefa de GERÊNCIA DO BARRAMENTO, de alta prioridade e período curto. A tarefa de METEOROLOGIA (ASI/MET), de baixa prioridade, que de vez em quando tomava o mutex pra publicar seus dados. E as tarefas de COMUNICAÇÃO, de prioridade média, longas quando havia muito o que transmitir.\n\nA armadilha: a meteorologia pega o mutex. A gerência acorda, precisa do mutex, bloqueia esperando. Até aí, normal, seria coisa de microssegundos. Mas então as tarefas de comunicação, mais prioritárias que a meteorologia, assumem a CPU e seguram-na por longos períodos. A baixa não roda, logo não solta o mutex; a ALTA fica bloqueada atrás de uma tarefa de MÉDIA prioridade que nem usa o recurso. É a inversão de prioridade: a hierarquia inteira de escalonamento, subvertida por um mutex e um terceiro personagem.",
                },
                {
                    type: "table",
                    value: '[["Tarefa","Prioridade","Papel no incidente"],["Gerência do barramento","Alta","Bloqueada esperando o mutex além do prazo"],["Comunicação","Média","Domina a CPU e atropela a meteorologia"],["Meteorologia (ASI/MET)","Baixa","Segura o mutex sem conseguir executar"],["Watchdog","Supervisão","Vê o ciclo perdido e reseta o sistema"]]',
                },
                {
                    type: "quote",
                    value: "A tarefa de média prioridade nunca tocou no mutex e mesmo assim causou o reset: inversão de prioridade é um crime sem arma na mão.",
                },
                {
                    type: "text",
                    value: "## O reset, o diagnóstico e os remédios\n\nQuando a gerência do barramento perdia seu prazo, um mecanismo de proteção concluía que o sistema estava doente e RESETAVA o computador, descartando as atividades do dia. O JPL reproduziu o cenário numa réplica em laboratório, com o rastreamento de eventos que tiveram a sabedoria de deixar ligado no software de voo, identificou a inversão e corrigiu SEM trocar o firmware: o mutex do VxWorks tinha um parâmetro de herança de prioridade desativado, e um comando enviado a Marte o ativou.\n\nHERANÇA DE PRIORIDADE: enquanto segura o mutex, a tarefa dona herda temporariamente a prioridade da mais alta que espera. Com ela, a meteorologia teria rodado na frente da comunicação, soltado o mutex em microssegundos e devolvido a fila à ordem.\n\nTETO DE PRIORIDADE: variação mais rígida, comum no mundo automotivo: cada mutex tem um teto, a prioridade da mais alta tarefa que o usa, e quem o toma sobe ao teto imediatamente, prevenindo também encadeamentos e certos deadlocks.\n\nNo FreeRTOS, o mutex de xSemaphoreCreateMutex já vem com herança; o semáforo binário NÃO tem. Exclusão mútua se faz com mutex, nunca com semáforo. O Pathfinder pagou pra você não precisar redescobrir.",
                },
            ],
            questions: [
                {
                    statement: "O que é inversão de prioridade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Alta bloqueada num recurso da baixa, e a média rodando",
                            isCorrect: true,
                        },
                        {
                            text: "Duas tarefas trocando de prioridade a cada tick do kernel",
                            isCorrect: false,
                        },
                        {
                            text: "O escalonador invertendo a ordem da fila de prontas",
                            isCorrect: false,
                        },
                        {
                            text: "Uma ISR executando com prioridade menor que uma tarefa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No Pathfinder, qual tarefa segurava o mutex do barramento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A tarefa de meteorologia, de baixa prioridade",
                            isCorrect: true,
                        },
                        {
                            text: "A tarefa de comunicação, de média prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "A gerência do barramento, de alta prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "A tarefa ociosa, de prioridade mínima do sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual papel a tarefa de comunicação (média) teve no travamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Atropelou a baixa e a impediu de soltar o mutex",
                            isCorrect: true,
                        },
                        {
                            text: "Tomou o mutex do barramento e nunca o devolveu",
                            isCorrect: false,
                        },
                        {
                            text: "Elevou a própria prioridade acima da gerência do bus",
                            isCorrect: false,
                        },
                        {
                            text: "Desativou o watchdog durante as janelas de transmissão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o problema foi corrigido com a sonda em Marte?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ativando a herança de prioridade do mutex por upload",
                            isCorrect: true,
                        },
                        {
                            text: "Enviando um firmware novo compilado sem o watchdog",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciando a sonda em modo seguro até o fim da missão",
                            isCorrect: false,
                        },
                        {
                            text: "Trocando o escalonador do VxWorks por um EDF dinâmico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Com herança de prioridade, o que muda no cenário do Pathfinder?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A baixa herda a prioridade da alta e solta o mutex logo",
                            isCorrect: true,
                        },
                        {
                            text: "A média herda a prioridade da baixa e para de executar",
                            isCorrect: false,
                        },
                        {
                            text: "O mutex passa a pertencer ao kernel até o fim do ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "A alta desiste do mutex e recalcula sem o barramento",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Jitter e latência",
            blocks: [
                {
                    type: "text",
                    value: '# Nomear pra medir\n\nDois termos organizam toda conversa séria sobre tempo: LATÊNCIA é o tempo entre o evento e a resposta; JITTER é a variação dessa latência entre ocorrências. Um sistema pode ter latência alta e jitter baixo (sempre 500 µs), latência baixa e jitter alto (entre 20 e 300 µs), e pra tempo real o segundo costuma ser pior: a malha de controle digital foi projetada assumindo amostras em ritmo constante, e cada desvio desse ritmo entra na conta como ruído e erro de fase, corroendo margens de estabilidade que o projetista da malha calculou no papel.\n\nVale decompor a latência de um evento típico (um pino mudou, a resposta saiu): tempo até a ISR começar (latência de interrupção, uns poucos microssegundos num Cortex-M com RTOS bem configurado), duração da ISR, sinalização, espera de escalonamento até a tarefa assumir (depende de quem mais está pronto) e a execução do tratamento em si. Cada termo tem um pior caso, e o orçamento do sistema é a soma deles. Escrever esse orçamento, número a número, é o que separa "acho que dá tempo" de engenharia.',
                },
                {
                    type: "table",
                    value: '[["Termo","Definição","Exemplo de número"],["Latência","Do evento à resposta completa","120 µs do pino ao comando"],["Jitter","Variação da latência","De 100 a 180 µs: 80 µs de jitter"],["Latência de interrupção","Do evento ao início da ISR","2 a 5 µs num Cortex-M típico"],["Jitter de ativação","Variação do início da tarefa periódica","Cresce com ISRs e tarefas acima"]]',
                },
                {
                    type: "quote",
                    value: "A malha digital assume amostras em ritmo constante; cada microssegundo de jitter é ruído que você mesmo injeta no sistema.",
                },
                {
                    type: "code",
                    value: "void vTaskMalha(void *arg) {\n    TickType_t proximo = xTaskGetTickCount();\n    for (;;) {\n        gpio_set(PINO_MEDIDA);    /* borda de subida = inicio do ciclo */\n        executar_malha();\n        gpio_clear(PINO_MEDIDA);  /* largura do pulso = tempo de execucao */\n        vTaskDelayUntil(&proximo, pdMS_TO_TICKS(2));\n    }\n}\n/* No osciloscopio com persistencia: o espalhamento das bordas\n   de subida em torno da grade de 2 ms E o jitter de ativacao. */",
                },
                {
                    type: "text",
                    value: "## Instrumentos e disciplina\n\nO par GPIO mais osciloscópio (ou analisador lógico) segue imbatível pelo custo: um pino por medição, persistência ligada, e horas de operação desenham a distribuição real diante dos seus olhos, com o pior caso observado marcado na tela. É a técnica da aula de ISR, agora aplicada a tarefas.\n\nUm degrau acima estão os rastreadores de RTOS, como Tracealyzer e SystemView: o kernel registra cada evento de escalonamento com carimbo de microssegundos num buffer, e a ferramenta desenha a linha do tempo de tarefas, ISRs e filas. É o raio-x que o JPL usou na essência no Pathfinder: sem trace, inversão de prioridade e jitter são fantasmas; com trace, são fatos com carimbo de tempo.\n\nDuas disciplinas fecham a aula. Primeira: registre SEMPRE o pior caso observado, não a média (a média você já sabe que engana). Segunda: reduza jitter atacando as causas na ordem: ISRs curtas, prioridades pelo RMS, seções críticas mínimas e, pra amostragem de sensor, deixar o TIMER DE HARDWARE ou o DMA amostrar no ritmo exato e a tarefa apenas processar, tirando o escalonador do caminho da física.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre latência e jitter?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Latência é o tempo de resposta; jitter, sua variação",
                            isCorrect: true,
                        },
                        {
                            text: "Latência ocorre em ISR; jitter ocorre só em tarefas",
                            isCorrect: false,
                        },
                        {
                            text: "Latência é medida em ms; jitter é medido em bytes",
                            isCorrect: false,
                        },
                        {
                            text: "Latência é do hardware; jitter é sempre do software",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que jitter degrada uma malha de controle digital?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O projeto da malha assume amostragem em ritmo constante",
                            isCorrect: true,
                        },
                        {
                            text: "O jitter descarrega o capacitor do conversor analógico",
                            isCorrect: false,
                        },
                        {
                            text: "O jitter inverte o sinal dos coeficientes do filtro",
                            isCorrect: false,
                        },
                        {
                            text: "O jitter aumenta o consumo de stack em todos os ciclos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como ver o jitter de ativação de uma tarefa periódica no osciloscópio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pino no início do ciclo e persistência na tela ligada",
                            isCorrect: true,
                        },
                        {
                            text: "Média de tensão do pino medida com um multímetro",
                            isCorrect: false,
                        },
                        {
                            text: "Contagem de bordas por segundo no modo frequência",
                            isCorrect: false,
                        },
                        {
                            text: "FFT do sinal do pino procurando picos harmônicos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que compõe a latência total do evento à resposta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Entrada da ISR, a própria ISR, sinalização e escalonamento",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas o tempo de execução da ISR, que domina o resto",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas a troca de contexto, que é o único custo do RTOS",
                            isCorrect: false,
                        },
                        {
                            text: "O tick do kernel somado ao tempo de envio da telemetria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como reduzir o jitter de amostragem de um sensor sem redesenhar o sistema?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Amostrar por timer de hardware e processar na tarefa",
                            isCorrect: true,
                        },
                        {
                            text: "Subir a prioridade da telemetria pra drenar mais rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar as filas por variáveis globais sem proteção",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar o tick do kernel de 1 ms para 10 ms no build",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Memória em tempo real",
    aulas: [
        {
            titulo: "Por que malloc é banido do caminho crítico",
            blocks: [
                {
                    type: "text",
                    value: "# Três pecados capitais\n\nO malloc é banido do caminho crítico por três razões independentes, e cada uma bastaria sozinha.\n\nTEMPO NÃO DETERMINÍSTICO: pra achar um bloco livre, o alocador percorre estruturas internas cujo estado depende de todo o histórico de alocações e liberações. A mesma chamada custa 200 nanossegundos agora e 80 microssegundos daqui a três dias. Um WCET honesto fica impossível de fechar.\n\nFRAGMENTAÇÃO: alocando e liberando tamanhos variados, a memória livre vira queijo suíço: os buracos somam o suficiente, mas nenhum é contíguo o bastante. Firmware roda meses sem reiniciar; a fragmentação é uma dívida que só cresce.\n\nFALHA EM RUNTIME: um dia o malloc retorna NULL. Não na bancada, com o depurador aberto: às 3 da manhã do quadragésimo dia, no cliente. E o que o firmware do respirador faz com um NULL?\n\nSome o detalhe de que o heap é global e protegido por lock (olá, bloqueio e inversão de prioridade no meio do caminho crítico), e o veredito da indústria fica óbvio: alocação dinâmica não entra onde há prazo.",
                },
                {
                    type: "table",
                    value: '[["Problema do malloc","Por quê","Consequência no firmware"],["Tempo variável","Busca em listas cujo estado é histórico","WCET impossível de fechar"],["Fragmentação","Tamanhos variados furam a memória livre","Falha após dias, com memória sobrando"],["Falha em runtime","NULL longe da bancada","Decisão impossível às 3h do dia 40"],["Lock do heap","Alocador global exige exclusão mútua","Bloqueio e inversão no caminho crítico"]]',
                },
                {
                    type: "quote",
                    value: "Aloque na inicialização e o fracasso aparece na bancada; aloque em runtime e ele aparece no cliente.",
                },
                {
                    type: "text",
                    value: '## A regra e como cumpri-la\n\nA resposta consagrada é radicalmente simples: aloque TUDO na inicialização. Se a memória não basta, o sistema não sobe, e você descobre no laboratório, onde falhar é barato. As regras célebres do JPL pra código crítico (o "Power of Ten") gravam isso em pedra: nada de alocação dinâmica depois da inicialização. O MISRA C, padrão da indústria automotiva, aponta na mesma direção.\n\nO FreeRTOS te ajuda a obedecer. Existem as variantes estáticas das APIs, como xTaskCreateStatic e xQueueCreateStatic, em que VOCÊ fornece a memória (arrays globais) e o kernel não toca em heap algum. E existem os cinco esquemas de heap da distribuição, do heap_1 (que só aloca e nunca libera: comportamento perfeitamente determinístico, ideal pra quem cria tudo no boot) ao heap_4 e heap_5 (com coalescência de blocos, pra quem realmente precisa de dinâmica fora do caminho crítico).\n\nO padrão de projeto maduro: fase de inicialização cria tarefas, filas e pools com memória estática; a fase de operação vive de pools e buffers pré-alocados, que são o assunto do resto do módulo.',
                },
            ],
            questions: [
                {
                    statement: "Qual é o principal problema temporal do malloc?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tempo de execução variável, dependente do histórico",
                            isCorrect: true,
                        },
                        {
                            text: "Velocidade constante, porém lenta demais para ISRs",
                            isCorrect: false,
                        },
                        {
                            text: "Uso obrigatório de instruções privilegiadas da CPU",
                            isCorrect: false,
                        },
                        {
                            text: "Necessidade de mover dados para a memória externa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é fragmentação de heap?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Memória livre total suficiente, mas sem bloco contíguo",
                            isCorrect: true,
                        },
                        {
                            text: "Memória perdida de vez a cada chamada de free do código",
                            isCorrect: false,
                        },
                        {
                            text: "Divisão do heap em bancos físicos de tamanho idêntico",
                            isCorrect: false,
                        },
                        {
                            text: "Corrupção gradual dos ponteiros guardados dentro do heap",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que alocar tudo na inicialização muda o perfil de risco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A falta de memória aparece na bancada, não no campo",
                            isCorrect: true,
                        },
                        {
                            text: "O heap inicializado fica imune à fragmentação futura",
                            isCorrect: false,
                        },
                        {
                            text: "A inicialização roda com o dobro da memória disponível",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador consegue otimizar melhor o código do boot",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a regra do JPL (Power of Ten) diz sobre alocação dinâmica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Proibida depois da inicialização do sistema",
                            isCorrect: true,
                        },
                        {
                            text: "Permitida apenas dentro de seções críticas",
                            isCorrect: false,
                        },
                        {
                            text: "Permitida se o heap tiver o dobro do necessário",
                            isCorrect: false,
                        },
                        {
                            text: "Proibida somente em código de interrupção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Firmware recebe NULL do malloc após 40 dias ligado, com memória livre somando o bastante. Causa provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Fragmentação: sobra total, falta bloco contíguo",
                            isCorrect: true,
                        },
                        {
                            text: "Vazamento no driver de UART consumindo o heap todo",
                            isCorrect: false,
                        },
                        {
                            text: "Estouro do contador de ticks corrompendo o alocador",
                            isCorrect: false,
                        },
                        {
                            text: "Desgaste físico da RAM após semanas de operação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Alocação estática e pools",
            blocks: [
                {
                    type: "text",
                    value: "# O alocador que cabe numa aula\n\nSe o firmware precisa de alocação em operação (quadros de protocolo, mensagens, eventos), a resposta de tempo real é o POOL DE BLOCOS FIXOS: um array de N blocos, todos do mesmo tamanho, ligados numa lista de livres.\n\nAlocar é tirar o primeiro da lista; liberar é devolver ao topo. Duas operações de ponteiro, O(1) no sentido mais literal: o custo é o mesmo no primeiro dia e no milésimo, com pool cheio ou quase vazio. E como todos os blocos são do mesmo tamanho, QUALQUER bloco livre serve a qualquer pedido: a fragmentação externa, aquela do queijo suíço, simplesmente não existe.\n\nO preço, porque sempre há um: fragmentação interna. Um pedido de 40 bytes num pool de blocos de 64 desperdiça 24. Projetos reais criam dois ou três pools por classe de tamanho (pequeno, médio, grande) e aceitam o desperdício restante como custo da previsibilidade.\n\nFalhar também fica civilizado: o pool esgota apenas se houver mais blocos EM USO do que você dimensionou, um evento que você conta, monitora e trata com política definida em projeto.",
                },
                {
                    type: "code",
                    value: "typedef struct bloco { struct bloco *prox; } bloco_t;\n\nstatic uint8_t area[N_BLOCOS][TAM_BLOCO];\nstatic bloco_t *livre = NULL;\n\nvoid pool_init(void) {\n    for (int i = 0; i < N_BLOCOS; i++) {\n        bloco_t *b = (bloco_t *)area[i];\n        b->prox = livre;\n        livre = b;\n    }\n}\n\nvoid *pool_alloc(void) {          /* O(1), sempre */\n    bloco_t *b = livre;\n    if (b) livre = b->prox;\n    return b;                     /* NULL se esgotou: conte! */\n}\n\nvoid pool_free(void *p) {         /* O(1), sempre */\n    bloco_t *b = (bloco_t *)p;\n    b->prox = livre;\n    livre = b;\n}",
                },
                {
                    type: "table",
                    value: '[["Aspecto","malloc","Pool de blocos fixos"],["Tempo","Variável com o histórico","O(1) constante"],["Fragmentação externa","Acumula com o uso","Não existe"],["Falha","Imprevisível, difícil de tratar","Só no esgotamento, contado e tratado"],["Desperdício","Baixo por pedido","Interno: bloco maior que o pedido"]]',
                },
                {
                    type: "quote",
                    value: "O pool troca elegância por certeza: desperdiça alguns bytes por bloco pra nunca te dever uma resposta no prazo.",
                },
                {
                    type: "text",
                    value: '## Dimensionar com conta, não com fé\n\nQuantos blocos? A resposta vem de uma conta de pior caso: quantos blocos podem estar EM USO ao mesmo tempo? Some os produtores (cada ISR ou tarefa que aloca), o máximo em trânsito em cada fila, o que o consumidor mais lento segura durante o processamento, e aplique margem (50% é um começo honesto; a medição ajusta depois).\n\nE instrumente: um contador de "mínimo de blocos livres já visto" (o high-water do pool) diz, depois de horas de bancada e de campo, quão perto do esgotamento você realmente chegou. Pool que nunca desce de 60% de folga pode encolher; pool que raspa o zero é um incidente esperando data.\n\nDois cuidados finais. Primeiro: a lista de livres é compartilhada, então proteja o alloc e o free com uma seção crítica curtíssima (ou use as versões FromISR de um pool pronto do seu RTOS). Segundo: defina a POLÍTICA de esgotamento em projeto, não no susto: descartar a mensagem nova? A mais antiga? Degradar a taxa? Qualquer resposta é melhor que a que se improvisa às 3 da manhã.',
                },
            ],
            questions: [
                {
                    statement: "Por que a alocação num pool de blocos fixos é O(1)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É só tirar o primeiro bloco da lista de livres",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o pool mora em memória mais rápida que o heap",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o compilador resolve o endereço no momento do build",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o pool guarda no máximo um bloco por tarefa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que pool de blocos fixos não sofre fragmentação externa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Todos os blocos têm o mesmo tamanho e são trocáveis",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o pool compacta a memória a cada liberação",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o pool recusa liberações feitas fora de ordem",
                            isCorrect: false,
                        },
                        {
                            text: "Porque os blocos ficam em regiões de ROM reservadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual desperdício o pool aceita de propósito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fragmentação interna: bloco maior que o pedido",
                            isCorrect: true,
                        },
                        {
                            text: "Uma cópia extra de cada bloco para redundância",
                            isCorrect: false,
                        },
                        {
                            text: "Um ponteiro de 32 bits por byte armazenado",
                            isCorrect: false,
                        },
                        {
                            text: "A perda dos blocos liberados fora da inicialização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como dimensionar um pool com seriedade?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pior caso simultâneo contado, mais margem medida",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre 1024 blocos, o padrão consagrado da indústria",
                            isCorrect: false,
                        },
                        {
                            text: "O dobro da RAM dividido pelo tamanho do bloco usado",
                            isCorrect: false,
                        },
                        {
                            text: "Um bloco por tarefa criada, mais um pro escalonador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O pool esgotou em operação. O que um projeto maduro faz?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Aplica a política decidida em projeto e conta o evento",
                            isCorrect: true,
                        },
                        {
                            text: "Chama malloc como reserva de emergência do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Reseta imediatamente pelo watchdog, sem registrar nada",
                            isCorrect: false,
                        },
                        {
                            text: "Aumenta o pool em tempo de execução realocando o heap",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Ring buffer, o padrão rei",
            blocks: [
                {
                    type: "text",
                    value: "# Um array, dois índices\n\nO ring buffer (buffer circular) é o padrão mais usado do firmware: um array de tamanho fixo, um índice de escrita (a cabeça) e um índice de leitura (a cauda). O produtor escreve na cabeça e a avança; o consumidor lê da cauda e a avança; nas bordas do array, os índices dão a volta. Nenhuma alocação, custo O(1) por operação, e uma vocação natural pra fluxos contínuos: bytes de UART, amostras de sensor, eventos de log.\n\nAs duas condições que regem tudo: VAZIO quando cauda alcança cabeça; CHEIO, na convenção clássica, quando o próximo avanço da cabeça alcançaria a cauda (sacrifica-se uma posição pra distinguir cheio de vazio sem contador extra).\n\nE o truque de gente grande: faça o tamanho POTÊNCIA DE DOIS. O avanço vira uma máscara com AND (índice e tamanho menos 1) em vez da divisão do operador de módulo, mais barata e de custo constante em qualquer processador. Com 256 posições, a máscara é 255; com 250, você paga divisão a cada byte, pra economizar seis posições. Não economize.",
                },
                {
                    type: "code",
                    value: "#define TAM 256u  /* potencia de dois */\n\nstatic uint8_t buf[TAM];\nstatic volatile uint32_t cabeca = 0;  /* so o produtor escreve */\nstatic volatile uint32_t cauda  = 0;  /* so o consumidor escreve */\n\nbool ring_put(uint8_t b) {            /* chamado pela ISR */\n    uint32_t prox = (cabeca + 1u) & (TAM - 1u);\n    if (prox == cauda) return false;  /* cheio: descarte e conte */\n    buf[cabeca] = b;                  /* 1: escreve o dado */\n    cabeca = prox;                    /* 2: so entao publica */\n    return true;\n}\n\nbool ring_get(uint8_t *b) {           /* chamado pela tarefa */\n    if (cauda == cabeca) return false; /* vazio */\n    *b = buf[cauda];\n    cauda = (cauda + 1u) & (TAM - 1u);\n    return true;\n}",
                },
                {
                    type: "table",
                    value: '[["Operação","Condição","Custo"],["Inserir (produtor)","Não está cheio","O(1), sem lock no SPSC"],["Remover (consumidor)","Não está vazio","O(1), sem lock no SPSC"],["Cheio","Próximo da cabeça alcançaria a cauda","Política: descartar e contar"],["Vazio","Cauda alcança a cabeça","Consumidor bloqueia ou tenta depois"]]',
                },
                {
                    type: "quote",
                    value: "Metade do firmware do mundo é um ring buffer entre uma ISR apressada e uma tarefa caprichosa.",
                },
                {
                    type: "text",
                    value: '## Por que SPSC dispensa lock\n\nA versão da aula é SPSC: single producer, single consumer. Um único contexto escreve (a ISR da UART, digamos) e um único contexto lê (a tarefa de protocolo). Nesse arranjo, olhe quem escreve o quê: a CABEÇA é escrita só pelo produtor; a CAUDA, só pelo consumidor. Cada lado lê o índice do outro, mas nunca o escreve. Num microcontrolador de 32 bits, ler e escrever uma palavra alinhada é atômico; e como cada teste (cheio, vazio) é conservador, o pior que acontece com um índice lido "atrasado" é recusar uma operação que já caberia. Nenhum lock, nenhuma seção crítica, nenhuma chance de inversão de prioridade.\n\nA ORDEM das escritas no produtor é sagrada: primeiro o dado, DEPOIS o índice. Publicar a cabeça antes de escrever o byte abriria uma janela em que o consumidor lê lixo. Guarde esse princípio (publicar por último); no módulo 6 ele volta com barreiras de memória e atomics pra processadores mais espertos.\n\nDois ou mais produtores? Aí o SPSC acabou: proteja com seção crítica curta ou use uma fila do RTOS, que já resolve isso por você.',
                },
            ],
            questions: [
                {
                    statement: "No ring buffer, o que indicam cabeça e cauda?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Onde o produtor escreve e onde o consumidor lê",
                            isCorrect: true,
                        },
                        {
                            text: "O maior e o menor valor armazenados no buffer",
                            isCorrect: false,
                        },
                        {
                            text: "O início e o fim da memória física reservada",
                            isCorrect: false,
                        },
                        {
                            text: "A prioridade das tarefas que acessam o buffer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que dimensionar o ring buffer com potência de dois?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O avanço do índice vira um AND, barato e constante",
                            isCorrect: true,
                        },
                        {
                            text: "A RAM só pode ser dividida em potências de dois",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador exige esse tamanho para vetores globais",
                            isCorrect: false,
                        },
                        {
                            text: "Evita o desgaste desigual das células de memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na convenção clássica, como se detecta buffer cheio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O próximo avanço da cabeça alcançaria a cauda",
                            isCorrect: true,
                        },
                        {
                            text: "A cabeça e a cauda apontam pro mesmo índice",
                            isCorrect: false,
                        },
                        {
                            text: "Um contador global de bytes chega ao valor máximo",
                            isCorrect: false,
                        },
                        {
                            text: "O produtor recebe um sinal enviado pelo consumidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No SPSC, por que cada índice só pode ter um escritor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Escritas de dono único dispensam lock entre os lados",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o hardware bloqueia escritas de duas tarefas",
                            isCorrect: false,
                        },
                        {
                            text: "Porque índices compartilhados desgastam a RAM estática",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o kernel exige registrar um dono por variável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na inserção, por que escrever o dado ANTES de avançar a cabeça?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O consumidor só pode ver o índice após o dado válido",
                            isCorrect: true,
                        },
                        {
                            text: "O avanço primeiro deixaria o índice desalinhado em RAM",
                            isCorrect: false,
                        },
                        {
                            text: "A escrita depois do avanço custaria um ciclo a mais de CPU",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador reordena structs se o índice muda antes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Stack por tarefa",
            blocks: [
                {
                    type: "text",
                    value: '# O bug clássico do firmware\n\nCada tarefa do RTOS tem seu próprio stack, com o tamanho que VOCÊ declarou no xTaskCreate. Nele vivem as variáveis locais, os endereços de retorno das chamadas e, em alguns ports, o contexto salvo nas interrupções. Errar esse número pra menos é assinar o bug mais clássico do firmware embarcado: o estouro de stack.\n\nO que o torna cruel é o silêncio. O stack que estoura não lança exceção educada: ele avança sobre a memória vizinha, que pode ser o stack de OUTRA tarefa, uma estrutura do kernel ou suas variáveis globais. O sintoma aparece longe da causa: um hard fault aleatório sob carga, uma variável que "muda sozinha", um bug que some quando você adiciona um printf (porque o printf mudou o layout da memória e a vítima da corrupção agora é outra). Semanas de caçada na tarefa errada.\n\nOs vilões de consumo também são clássicos: buffers grandes declarados como variáveis locais (um uint8_t buf de 512 bytes na função), recursão, printf e sprintf com seus apetites internos, e o caminho fundo raro: aquela cadeia de chamadas que só acontece no tratamento de erro do parser do protocolo.',
                },
                {
                    type: "table",
                    value: '[["Sintoma","Suspeita"],["Hard fault aleatório sob carga","Estouro de stack num caminho de pior caso"],["Variável global mudando sozinha","Stack vizinho invadindo a região dela"],["Bug que some ao adicionar printf","Layout de memória mudou, corrupção migrou"],["Travamento só com um recurso ativo","Caminho fundo raro consumindo stack extra"]]',
                },
                {
                    type: "quote",
                    value: "Estouro de stack não avisa: ele corrompe o vizinho e deixa você caçando fantasma na tarefa errada.",
                },
                {
                    type: "code",
                    value: "void vTaskHousekeeping(void *arg) {\n    for (;;) {\n        /* menor folga historica do stack da tarefa de controle,\n           em palavras: o high-water mark */\n        UBaseType_t folga = uxTaskGetStackHighWaterMark(hControle);\n        if (folga < 64) {\n            registrar_evento(EV_STACK_BAIXO, (uint32_t)folga);\n        }\n        vTaskDelay(pdMS_TO_TICKS(1000));\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Medir, folgar, detectar\n\nA defesa tem três camadas. MEDIR: o FreeRTOS pinta o stack de cada tarefa com um padrão conhecido na criação; uxTaskGetStackHighWaterMark responde quanta folga MÍNIMA já existiu, olhando até onde a pintura foi sobrescrita. Dimensione generoso, rode o sistema forçando os piores caminhos (erros de protocolo, reconexões, rajadas), leia os high-water marks e ajuste deixando margem de segurança; um terço de folga é uma régua inicial saudável.\n\nDETECTAR: ligue configCHECK_FOR_STACK_OVERFLOW e implemente o hook vApplicationStackOverflowHook, que registra a tarefa culpada e leva o sistema a um estado seguro. É detecção de melhor esforço (o estrago pode acontecer entre verificações), mas transforma semanas de caçada em minutos de log. Onde houver MPU (unidade de proteção de memória, presente em muitos Cortex-M), regiões de guarda fazem o estouro virar exceção imediata, no instante exato.\n\nEVITAR: buffers grandes saem do stack (vão pra pools ou estáticos), recursão fora (o Power of Ten também a proíbe), e o housekeeping monitora as folgas a cada segundo, como no código acima. Stack não se chuta: mede-se.",
                },
            ],
            questions: [
                {
                    statement: "O que costuma acontecer quando o stack de uma tarefa estoura?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Corrupção silenciosa da memória vizinha ao stack",
                            isCorrect: true,
                        },
                        {
                            text: "Uma exceção clara apontando a linha exata do estouro",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel amplia o stack e registra um aviso no log",
                            isCorrect: false,
                        },
                        {
                            text: "A tarefa reinicia sozinha do começo da sua função",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o high-water mark de um stack?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A menor folga que o stack já teve desde a criação",
                            isCorrect: true,
                        },
                        {
                            text: "O maior endereço físico que o stack pode alcançar",
                            isCorrect: false,
                        },
                        {
                            text: "A média de uso do stack na última hora de operação",
                            isCorrect: false,
                        },
                        {
                            text: "O limite de stack imposto pelo compilador C usado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o FreeRTOS mede a folga de stack de uma tarefa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pinta o stack com um padrão e vê até onde foi sobrescrito",
                            isCorrect: true,
                        },
                        {
                            text: "Compara o ponteiro atual com a média das outras tarefas",
                            isCorrect: false,
                        },
                        {
                            text: "Conta as chamadas de função feitas pela tarefa por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "Consulta o registrador de limite de stack da própria CPU",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que hábito de código mais infla o consumo de stack?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Buffers grandes como variáveis locais e recursão",
                            isCorrect: true,
                        },
                        {
                            text: "Constantes longas declaradas no escopo do arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Muitas tarefas bloqueadas na mesma fila de eventos",
                            isCorrect: false,
                        },
                        {
                            text: "Ponteiros de função guardados em tabelas estáticas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que dimensionar stack exige forçar os piores caminhos em teste?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O pico de uso só aparece no caminho mais fundo real",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador remove stacks não usados no link final",
                            isCorrect: false,
                        },
                        {
                            text: "A medição só funciona com o escalonador suspenso",
                            isCorrect: false,
                        },
                        {
                            text: "Os caminhos rasos consomem mais stack que os fundos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Double buffering",
            blocks: [
                {
                    type: "text",
                    value: '# Escrever num, ler do outro\n\nQuando produtor e consumidor precisam trabalhar sobre um CONJUNTO de dados que deve ser visto inteiro (um bloco de amostras, um quadro de imagem, o vetor dos três eixos de um sensor), compartilhar um buffer único cria o defeito da leitura rasgada: o leitor apanha o conjunto no meio da escrita, metade novo, metade velho. Um acelerômetro lido assim entrega um vetor que nunca existiu fisicamente: eixo X da amostra nova com Y e Z da anterior.\n\nO DOUBLE BUFFERING resolve com o esquema mais simples possível: dois buffers, A e B. O produtor escreve em A enquanto o consumidor lê B; na fronteira (fim do bloco, fim do quadro), os papéis se invertem. Cada lado enxerga sempre um retrato completo e consistente; a troca é a única cerimônia.\n\nE a troca é barata, se você resistir à tentação de copiar: trocam-se os PONTEIROS, nunca o conteúdo. Dois ponteiros trocados numa seção crítica de meia dúzia de instruções, ou uma variável de "qual é o buffer ativo" alternada pelo único dono da decisão. Copiar kilobytes na fronteira seria pagar em latência o que o padrão existe pra economizar.',
                },
                {
                    type: "table",
                    value: '[["Esquema","Como funciona","O que resolve"],["Buffer único","Todos leem e escrevem o mesmo","Nada: leitura rasgada é rotina"],["Duplo (ping-pong)","Escreve num, lê do outro, troca na fronteira","Leitura de conjunto pela metade"],["DMA circular","Periférico enche metades alternadas sozinho","CPU fora do ritmo da amostragem"],["Fila de N blocos","Generalização com mais folga","Picos longos do consumidor"]]',
                },
                {
                    type: "quote",
                    value: "O double buffering compra consistência com memória: cada lado enxerga sempre um retrato inteiro, nunca o pincel no meio do traço.",
                },
                {
                    type: "text",
                    value: "## Sensores, DMA e o ping-pong de graça\n\nO padrão brilha com DMA, o controlador de acesso direto à memória: um periférico que copia dados entre conversores e RAM sem gastar um ciclo de CPU. O arranjo clássico de aquisição: o ADC amostra num ritmo cravado por um timer de hardware (adeus, jitter de software), o DMA deposita as amostras num buffer em modo CIRCULAR, e o controlador avisa por interrupção em dois momentos: na METADE do buffer e no fim.\n\nPercebeu o presente? É o double buffering de graça: quando a interrupção de meia transferência chega, a primeira metade está completa e estável, e o DMA já está enchendo a segunda. A tarefa processa a metade pronta com um prazo claro (o tempo de encher a outra metade) e alterna. Nenhuma cópia, nenhum lock, e a CPU só encosta nos dados quando há um bloco inteiro pra processar.\n\nA mesma ideia aparece nos displays (desenha-se o quadro seguinte enquanto o atual é exibido) e em qualquer lugar onde consistência de conjunto importa. Quando os blocos variam de tamanho ou o consumidor tem picos longos, o double buffering se generaliza na fila de blocos de um pool, casando este módulo inteiro.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ideia do double buffering?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escrever num buffer enquanto se lê do outro, e trocar",
                            isCorrect: true,
                        },
                        {
                            text: "Guardar duas cópias idênticas por segurança de dados",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar a taxa de amostragem sem trocar o conversor",
                            isCorrect: false,
                        },
                        {
                            text: "Comprimir os dados antes de entregar ao consumidor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que problema o double buffering elimina?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ler um conjunto de dados escrito pela metade",
                            isCorrect: true,
                        },
                        {
                            text: "Perder interrupções durante a troca de contexto",
                            isCorrect: false,
                        },
                        {
                            text: "Gastar CPU copiando buffers entre as tarefas",
                            isCorrect: false,
                        },
                        {
                            text: "Estourar o stack da tarefa de processamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se faz a troca entre os dois buffers?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trocando ponteiros na fronteira, sem copiar conteúdo",
                            isCorrect: true,
                        },
                        {
                            text: "Copiando o buffer cheio sobre o vazio a cada ciclo",
                            isCorrect: false,
                        },
                        {
                            text: "Movendo os dados pro heap e realocando os buffers",
                            isCorrect: false,
                        },
                        {
                            text: "Desligando as interrupções durante toda a leitura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No DMA circular com interrupção de meia transferência, o que a CPU processa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A metade recém completada, enquanto a outra enche",
                            isCorrect: true,
                        },
                        {
                            text: "As duas metades de uma vez, ao fim de cada volta",
                            isCorrect: false,
                        },
                        {
                            text: "Somente a primeira metade, reservada ao software",
                            isCorrect: false,
                        },
                        {
                            text: "Amostras avulsas, uma por interrupção do conversor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sensor de 3 eixos lido por outra tarefa sem proteção mostra vetores impossíveis. Causa provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Leitura rasgada: eixos de amostras diferentes juntos",
                            isCorrect: true,
                        },
                        {
                            text: "Ruído eletromagnético corrompendo o barramento I2C",
                            isCorrect: false,
                        },
                        {
                            text: "Saturação do conversor durante os picos de aceleração",
                            isCorrect: false,
                        },
                        {
                            text: "Perda de calibração térmica do sensor com o tempo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - WCET e confiabilidade",
    aulas: [
        {
            titulo: "WCET: o pior caso de execução",
            blocks: [
                {
                    type: "text",
                    value: "# O número que sustenta tudo\n\nToda a análise do módulo 3 se apoiava num número que fingimos conhecer: o C de cada tarefa, seu tempo de execução. Chegou a hora de encará-lo. O WCET (worst-case execution time) é o MAIOR tempo que um trecho de código pode levar, considerando todos os caminhos possíveis, todas as entradas possíveis e o pior humor do hardware.\n\nPor que não usar a média, que é tão mais fácil de medir? Porque você já sabe: a média dimensiona o dia bom, e o deadline vence todo dia. Um parser que processa quadros em 80 microssegundos na média, mas leva 2 milissegundos no quadro malformado com escape duplo, tem WCET de 2 milissegundos. É esse número que entra na utilização do RMS, é ele que decide se o sistema fecha.\n\nDe onde vem a variação? De caminhos que dependem da entrada (o if do caso raro), de laços cujo número de iterações varia, e do estado do hardware (cache, pipeline, contenção de barramento). O WCET precisa cobrir o pior alinhamento de todos esses fatores ao mesmo tempo, e é por isso que ele é difícil e valioso.",
                },
                {
                    type: "table",
                    value: '[["Sigla","Definição","Serventia"],["BCET","Melhor caso de execução","Raramente interessa"],["ACET","Tempo médio de execução","Dimensiona vazão, nunca prazos"],["WCET","Pior caso de execução","Alimenta o RMS e os orçamentos de tempo"],["Margem","Folga aplicada sobre o WCET","Absorve o que a análise não enxergou"]]',
                },
                {
                    type: "quote",
                    value: "Quem projeta pela média dimensiona pro dia bom; o deadline, porém, vence todo dia.",
                },
                {
                    type: "text",
                    value: "## Escrever código que tem WCET\n\nO pior caso só pode ser fechado se o código cooperar. As regras de estilo do tempo real existem exatamente pra isso.\n\nLAÇOS COM LIMITE: todo laço do caminho crítico precisa de um teto de iterações demonstrável (as regras do JPL exigem que uma ferramenta consiga PROVAR o limite). Um while que depende só de dado externo é um WCET infinito de plantão.\n\nSEM RECURSÃO: profundidade de chamada precisa ser estática, pelo stack e pelo tempo.\n\nPOUCOS CAMINHOS: função crítica com dezenas de ramos vira uma explosão combinatória de casos a analisar. Simplicidade aqui não é estética, é análise viável.\n\nCUIDADO COM BIBLIOTECAS: aquele sprintf conveniente, o qsort da libc: qual é o pior caso deles? Você não sabe, e é essa a resposta errada. No caminho crítico, ou a biblioteca tem WCET documentado, ou não entra.\n\nE o hardware ajuda ou atrapalha: num microcontrolador simples, sem cache, o tempo por instrução é praticamente constante e o WCET fecha com conforto. É uma das razões pelas quais o caminho crítico de sistemas críticos roda em núcleos modestos e previsíveis, não no processador mais parrudo do catálogo.",
                },
            ],
            questions: [
                {
                    statement: "O que é WCET?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O maior tempo de execução possível de um trecho",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo médio de execução medido em bancada",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de execução com a cache sempre quente",
                            isCorrect: false,
                        },
                        {
                            text: "O menor tempo entre duas interrupções seguidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual papel o WCET cumpre na análise de escalonamento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "É o C da utilização: pior caso dividido pelo período",
                            isCorrect: true,
                        },
                        {
                            text: "É o T da utilização: o período máximo tolerado da tarefa",
                            isCorrect: false,
                        },
                        {
                            text: "Define o tamanho do stack que cada tarefa vai receber",
                            isCorrect: false,
                        },
                        {
                            text: "Determina a ordem de criação das tarefas no boot",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que laços precisam de limite fixo em código de tempo real?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Sem limite provável, o WCET não pode ser fechado",
                            isCorrect: true,
                        },
                        {
                            text: "Laços longos esquentam o processador além do normal",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador recusa laços sem constante de parada",
                            isCorrect: false,
                        },
                        {
                            text: "O escalonador conta iterações pra medir utilização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que bibliotecas genéricas são um risco no caminho crítico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O pior caso delas é desconhecido e pode ser enorme",
                            isCorrect: true,
                        },
                        {
                            text: "Elas ocupam flash demais em qualquer configuração",
                            isCorrect: false,
                        },
                        {
                            text: "Elas exigem licenças incompatíveis com o firmware",
                            isCorrect: false,
                        },
                        {
                            text: "Elas só funcionam com o heap padrão habilitado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que hardware simples, sem cache, facilita fechar o WCET?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O tempo por instrução fica estável e previsível",
                            isCorrect: true,
                        },
                        {
                            text: "A ausência de cache dobra a frequência efetiva",
                            isCorrect: false,
                        },
                        {
                            text: "Sem cache, o compilador gera menos instruções",
                            isCorrect: false,
                        },
                        {
                            text: "O barramento único elimina qualquer interrupção",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Medir e analisar o WCET",
            blocks: [
                {
                    type: "text",
                    value: "# O pior que você viu\n\nO caminho mais acessível pro WCET é a MEDIÇÃO instrumentada. No Cortex-M, o contador de ciclos DWT CYCCNT conta cada ciclo de clock: leia antes, leia depois, subtraia (em aritmética sem sinal, que sobrevive ao estouro do contador) e você tem o custo exato daquela execução. Guarde o máximo já visto, o high-water mark de tempo, e deixe o sistema rodando por horas.\n\nA qualidade da medição depende da malícia dos estímulos. Medir o parser com quadros bonitos mede o caso bom; o ofício está em provocar o pior: quadros malformados, escapes encadeados, o buffer chegando cheio, a reconexão no meio. Trace de RTOS e GPIO com osciloscópio completam o arsenal, cada um com sua resolução.\n\nE aqui entra a honestidade intelectual da técnica: a medição entrega o pior caso QUE VOCÊ VIU, nunca a certeza de que não existe um pior. O caminho patológico que você não imaginou não aparece na bancada; ele estreia em campo. Medição é evidência, não prova, e todo o uso profissional dela parte dessa consciência.",
                },
                {
                    type: "code",
                    value: "/* Cortex-M: contador de ciclos do DWT */\nDWT->CTRL |= DWT_CTRL_CYCCNTENA_Msk;   /* habilita uma vez no boot */\n\nvoid medir_malha(void) {\n    uint32_t t0 = DWT->CYCCNT;\n    executar_malha();\n    uint32_t ciclos = DWT->CYCCNT - t0; /* unsigned: aguenta o wrap */\n    if (ciclos > pior_visto) {\n        pior_visto = ciclos;            /* high-water mark de tempo */\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Método","O que entrega","Limitação"],["Medição instrumentada","Pior caso observado","Pode não ter visto o pior real"],["Análise estática de WCET","Limite superior garantido","Cara, exige modelo do processador"],["Híbrido","Medição guiada pela análise de caminhos","Meio termo prático comum"],["Chute com folga","Nada verificável","Não é método, é esperança"]]',
                },
                {
                    type: "quote",
                    value: "A medição te diz o pior que você viu; a análise, o pior que existe. Saber a diferença é o ofício.",
                },
                {
                    type: "text",
                    value: "## Análise estática e a margem\n\nNo outro extremo está a ANÁLISE ESTÁTICA de WCET: ferramentas que enumeram os caminhos do binário, modelam o processador (pipeline, memórias, penalidades) e derivam um limite superior GARANTIDO, sem executar nada. É o padrão ouro dos domínios certificados, como a aviônica sob DO-178C, e tem o preço correspondente: ferramentas caras, modelos de processador específicos e a exigência de código disciplinado (os laços com limite provável da aula anterior).\n\nA prática da indústria, fora dos domínios certificados, é o meio termo pragmático: medir com estímulos adversariais os caminhos que a análise de código aponta como candidatos a pior caso, aplicar uma MARGEM generosa e documentada sobre o máximo observado (dobrar é um ponto de partida comum em hardware complexo; com núcleo simples e sem cache, margens menores se justificam), e MONITORAR EM CAMPO: contadores de estouro de prazo, high-water marks de tempo por tarefa, alarme quando a folga encolher.\n\nAssim o número deixa de ser um chute e vira um contrato com três testemunhas: a medição, a margem e o monitor. Quando a folga começar a sumir, você fica sabendo pelo log, não pelo cliente.",
                },
            ],
            questions: [
                {
                    statement: "Qual instrumento mede ciclos de execução num Cortex-M?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O contador de ciclos DWT CYCCNT do próprio chip",
                            isCorrect: true,
                        },
                        {
                            text: "O conversor analógico interno em modo rápido",
                            isCorrect: false,
                        },
                        {
                            text: "O registrador de temperatura da CPU calibrado",
                            isCorrect: false,
                        },
                        {
                            text: "O watchdog independente rodando no cristal de 32 kHz",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a limitação central da medição de WCET?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela só mostra o pior caso que você conseguiu ver",
                            isCorrect: true,
                        },
                        {
                            text: "Ela exige parar o sistema durante cada amostra",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só funciona em processadores sem interrupção",
                            isCorrect: false,
                        },
                        {
                            text: "Ela mede em milissegundos, resolução insuficiente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que a análise estática de WCET entrega que a medição não entrega?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um limite superior garantido pra todos os caminhos",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo médio exato de produção com usuários reais",
                            isCorrect: false,
                        },
                        {
                            text: "A prova de que o código está livre de qualquer bug",
                            isCorrect: false,
                        },
                        {
                            text: "A lista das interrupções que ocorrem em cada ciclo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como a indústria pragmática fecha WCET sem análise estática formal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Medindo os piores caminhos e aplicando margem generosa",
                            isCorrect: true,
                        },
                        {
                            text: "Confiando no tempo médio de uma semana inteira de bancada",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrando o clock nominal do processador antes da produção",
                            isCorrect: false,
                        },
                        {
                            text: "Delegando a estimativa ao fornecedor do compilador usado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que monitorar tempos de execução também em campo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pra flagrar aproximações do limite antes da falha",
                            isCorrect: true,
                        },
                        {
                            text: "Pra faturar suporte com relatórios periódicos ao cliente",
                            isCorrect: false,
                        },
                        {
                            text: "Porque a medição de bancada expira depois de 90 dias",
                            isCorrect: false,
                        },
                        {
                            text: "Pra recalibrar o oscilador conforme o chip envelhece",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Watchdog: o cão de guarda",
            blocks: [
                {
                    type: "text",
                    value: "# O último recurso\n\nO watchdog de hardware é um contador independente que anda sozinho: se o firmware não o realimentar dentro do prazo (dezenas de milissegundos a segundos, conforme a configuração), ele reseta o processador. É a última linha de defesa contra o travamento que nenhuma outra proteção pegou: o deadlock, o laço infinito, o estado corrompido por um estouro de stack.\n\nO mecanismo é trivial. A ARTE está em alimentá-lo do jeito certo, e a regra cabe numa linha: alimente o watchdog SOMENTE quando o sistema estiver saudável de verdade. Alimentar por reflexo transforma o cão de guarda em enfeite.\n\nO antipadrão célebre: pendurar a alimentação numa ISR de timer de alta prioridade, incondicional. Interrupção é a última coisa que morre num sistema doente: as tarefas podem estar todas travadas num deadlock e a ISR continua, pontualmente, alimentando o watchdog e atestando uma saúde que não existe. A aula 5 mostra esse erro custando muito caro no mundo real.\n\nO padrão correto inverte a lógica: são as TAREFAS críticas que provam vida, e alguém só alimenta o hardware quando todas provaram.",
                },
                {
                    type: "code",
                    value: "#define TODAS ((1u << N_CRITICAS) - 1u)\nstatic volatile uint32_t checkins = 0;\n\n/* cada tarefa critica, ao fechar um ciclo saudavel: */\nvoid tarefa_checkin(int id) { checkins |= (1u << id); }\n\nvoid vTaskWatchdog(void *arg) {\n    for (;;) {\n        vTaskDelay(pdMS_TO_TICKS(50));\n        if (checkins == TODAS) {\n            wdt_alimentar();     /* todas provaram vida */\n            checkins = 0;\n        }\n        /* faltou alguma: nao alimenta, o hardware reseta */\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Abordagem","Comportamento","Veredito"],["Alimentar em ISR de timer","Nunca reseta, mesmo com tarefas mortas","Antipadrão que mascara defeito"],["Alimentar na tarefa ociosa","Pega CPU travada, não tarefa morta","Insuficiente sozinho"],["Check-in das tarefas críticas","Reseta se qualquer crítica parar","Padrão correto"],["Watchdog com janela","Cedo demais também reseta","Pega laço descontrolado alimentador"]]',
                },
                {
                    type: "quote",
                    value: "O watchdog não conserta nada: devolve o sistema a um estado conhecido quando tudo o mais falhou. É o freio de emergência, não o motorista.",
                },
                {
                    type: "text",
                    value: "## Janela, camadas e o dia seguinte ao reset\n\nDuas sofisticações valem o custo. A JANELA (windowed watchdog): alimentar cedo demais TAMBÉM reseta. Parece perverso, mas pega um defeito real: o laço descontrolado que ficou girando exatamente em volta da alimentação, batendo no watchdog a cada volta. Com janela, saúde tem ritmo certo, nem lento nem frenético. E as CAMADAS: o watchdog de hardware (com clock próprio, independente do principal) vigia o conjunto, enquanto monitores de software por tarefa (contadores de deadline perdido, timeouts de check-in) apontam o culpado específico com diagnóstico fino.\n\nTão importante quanto resetar é o que acontece DEPOIS. Na inicialização, leia o registrador de causa do reset (power-on, watchdog, brown-out) e registre; persista um mínimo de diagnóstico (qual tarefa faltou no check-in, contadores) em memória que sobrevive ao reset; entre em estado seguro antes de retomar operação; e conte os resets: uma tempestade de resets em sequência é sinal de defeito persistente, e o firmware maduro para de insistir e fica no modo seguro esperando socorro.\n\nFoi um mecanismo dessa família, você lembra, que salvou o Pathfinder: o reset devolvia a sonda a um estado conhecido, dia após dia, até o diagnóstico chegar.",
                },
            ],
            questions: [
                {
                    statement: "O que faz um watchdog de hardware?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reseta o sistema se não for alimentado no prazo",
                            isCorrect: true,
                        },
                        {
                            text: "Acorda as tarefas bloqueadas em filas vazias",
                            isCorrect: false,
                        },
                        {
                            text: "Corrige a memória corrompida por estouros de stack",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz o clock do chip quando a CPU superaquece",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o antipadrão clássico de watchdog?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Alimentar incondicionalmente numa ISR de timer",
                            isCorrect: true,
                        },
                        {
                            text: "Alimentar apenas quando todas as tarefas reportam",
                            isCorrect: false,
                        },
                        {
                            text: "Usar um timeout maior que o ciclo mais longo",
                            isCorrect: false,
                        },
                        {
                            text: "Ler a causa do reset durante a inicialização",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que alimentar o watchdog em ISR de timer mascara defeitos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A ISR segue viva mesmo com tarefas essenciais mortas",
                            isCorrect: true,
                        },
                        {
                            text: "A ISR alimenta rápido demais e dispara a janela",
                            isCorrect: false,
                        },
                        {
                            text: "O timer de hardware para quando o escalonador suspende",
                            isCorrect: false,
                        },
                        {
                            text: "O watchdog ignora alimentações vindas de interrupção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o watchdog com janela (windowed) acrescenta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Alimentar cedo demais também provoca o reset",
                            isCorrect: true,
                        },
                        {
                            text: "Dois timeouts independentes pra cada tarefa",
                            isCorrect: false,
                        },
                        {
                            text: "Um log automático das tarefas em execução",
                            isCorrect: false,
                        },
                        {
                            text: "A recarga automática após quedas de energia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Após um reset por watchdog, o que o firmware deve fazer primeiro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ler a causa do reset, registrar e ir a estado seguro",
                            isCorrect: true,
                        },
                        {
                            text: "Retomar a operação normal do ponto em que parou",
                            isCorrect: false,
                        },
                        {
                            text: "Apagar a memória de diagnóstico pra liberar espaço",
                            isCorrect: false,
                        },
                        {
                            text: "Desativar o watchdog até a próxima manutenção da placa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Modos de falha",
            blocks: [
                {
                    type: "text",
                    value: '# Falhar bem se projeta\n\nTodo sistema falha. A pergunta de engenharia não é "se", é "como": o que o sistema DEVE fazer quando uma parte dele quebrar? A resposta divide o mundo em duas famílias.\n\nFAIL-SAFE: existe um estado seguro pra onde ir, e falhar significa alcançá-lo. A esteira industrial para; a serra freia; o forno corta o aquecimento. Quando o seguro é "desligado", a vida do projetista é boa, e o ideal é que até o hardware sozinho (um relé, um contator) consiga levar o sistema até lá.\n\nFAIL-OPERATIONAL: não existe "parar". Um fly-by-wire não pode desistir de voar; um freio eletrônico não pode parar de frear. A operação precisa continuar mesmo com falha, e isso exige redundância: computadores em triplicata votando (o clássico 2 de 3 da aviônica), sensores cruzados, fontes duplicadas.\n\nE o ponto que essa trilha martela: o estado seguro DEPENDE DO DOMÍNIO. Pro drone, desligar motores não é seguro, é a queda; o seguro é um pouso controlado com taxa de descida limitada. Copiar o modo de falha de outro domínio é herdar a suposição errada de alguém.',
                },
                {
                    type: "table",
                    value: '[["Domínio","Estado seguro","Estratégia"],["Esteira industrial","Parar tudo","Fail-safe simples, se possível por hardware"],["Freio eletrônico","Continuar freando","Fail-operational com redundância"],["Fly-by-wire","Continuar voando","Redundância tripla com votação"],["Drone","Pouso controlado","Degradação: desligar significa cair"],["Forno industrial","Cortar o aquecimento","Fail-safe, relé independente do software"]]',
                },
                {
                    type: "quote",
                    value: "Antes da primeira linha de código, escreva a resposta: quando isto falhar, o que o sistema DEVE fazer? Falhar bem se projeta.",
                },
                {
                    type: "text",
                    value: "## Detectar, degradar, decidir antes\n\nModo de falha só dispara se a falha for DETECTADA, e detecção é trabalho ativo: testes de plausibilidade (a leitura do sensor cabe na física? acelerações de 300 g num carro de passeio são mentira do sensor), CRC em quadros de comunicação e em blocos de memória, comparação entre sensores redundantes, e os contadores de deadline perdido do módulo anterior. Falha silenciosa é a pior espécie: o sistema erra com convicção.\n\nEntre o normal e o desastre existe o meio termo da DEGRADAÇÃO CONTROLADA: modos de operação reduzida, cada um mantendo o essencial com menos função. O limp mode automotivo é o exemplo canônico: detectada uma anomalia no trem de força, a ECU limita rotação e potência, o suficiente pra chegar à oficina sem guincho e sem risco. Um produto sério define a escada inteira: normal, degradado, seguro, e as regras de transição entre eles.\n\nA disciplina que amarra tudo: modos e transições se decidem EM PROJETO, escritos numa tabela (falha, detecção, reação, estado alvo), e se TESTAM no chão, injetando cada falha de propósito. O módulo 7 faz exatamente isso com o drone. Decidir modo de falha durante a falha é o pior momento possível, e é onde os sistemas sem projeto acabam decidindo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre fail-safe e fail-operational?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um pode parar em estado seguro; o outro deve continuar",
                            isCorrect: true,
                        },
                        {
                            text: "Um usa watchdog de hardware; o outro usa o de software",
                            isCorrect: false,
                        },
                        {
                            text: "Um vale pra protótipos; o outro, pra produtos em série",
                            isCorrect: false,
                        },
                        {
                            text: "Um exige dois núcleos; o outro roda em núcleo único",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que desligar os motores NÃO é estado seguro pra um drone?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem motores o drone cai, criando o perigo maior",
                            isCorrect: true,
                        },
                        {
                            text: "Os motores travariam com o calor residual do voo",
                            isCorrect: false,
                        },
                        {
                            text: "A bateria descarrega mais rápido com motores parados",
                            isCorrect: false,
                        },
                        {
                            text: "O rádio perde o alcance quando os motores desligam",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é degradação controlada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Operar com menos função, mantendo o essencial seguro",
                            isCorrect: true,
                        },
                        {
                            text: "Reduzir o clock até o sistema esfriar por completo",
                            isCorrect: false,
                        },
                        {
                            text: "Desligar módulos aleatórios pra economizar energia",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar o firmware em versões cada vez mais antigas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a aviônica mantém operação com um computador falhando?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Redundância com votação, como o arranjo 2 de 3",
                            isCorrect: true,
                        },
                        {
                            text: "Um único computador blindado contra toda falha",
                            isCorrect: false,
                        },
                        {
                            text: "Reset imediato do computador em falha, no ar mesmo",
                            isCorrect: false,
                        },
                        {
                            text: "Transferência do controle total pro piloto humano",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando os modos de falha de um produto devem ser definidos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Em projeto, escritos em tabela e testados no chão",
                            isCorrect: true,
                        },
                        {
                            text: "Depois do primeiro incidente registrado em campo",
                            isCorrect: false,
                        },
                        {
                            text: "Na certificação, pelo laboratório credenciado externo",
                            isCorrect: false,
                        },
                        {
                            text: "Durante a falha, pelo operador com mais experiência",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "As lições dos desastres",
            blocks: [
                {
                    type: "text",
                    value: "# Ariane 5, 4 de junho de 1996\n\nQuarenta segundos. Foi quanto durou o voo inaugural do Ariane 5, o foguete que custou uma década à agência espacial europeia, levando satélites avaliados em centenas de milhões de dólares.\n\nA causa coube numa linha de código. O sistema de referência inercial (SRI) fora REUSADO do Ariane 4, onde voava há anos sem incidente. Nele, uma variável ligada à velocidade horizontal era convertida de ponto flutuante de 64 bits pra inteiro de 16 bits. No Ariane 4, o valor jamais chegava perto do limite; a proteção contra estouro dessa conversão específica tinha sido REMOVIDA de propósito, por análise que provava ser impossível estourar. Na trajetória do Ariane 5, mais veloz desde os primeiros segundos, o impossível aconteceu aos 36 segundos: overflow, exceção sem tratamento, e o SRI se desligou, cuspindo dados de diagnóstico. O SRI reserva? Mesmo software: já havia falhado do mesmo jeito milissegundos antes. O computador de voo interpretou o diagnóstico como dados de trajetória, deu tudo de tubeira, a estrutura não aguentou e a autodestruição encerrou o voo.\n\nDetalhe amargo: a função que estourou nem era necessária em voo no Ariane 5; era um alinhamento útil na plataforma, herdado ligado.",
                },
                {
                    type: "table",
                    value: '[["Caso","Causa técnica","Lição de processo"],["Ariane 5 (1996)","Overflow na conversão de 64 pra 16 bits em código reusado","Requisito mudou, revalide tudo, até o que nunca falhou"],["Mars Pathfinder (1997)","Inversão de prioridade no mutex do barramento","Herança de prioridade, e instrumentação ligada em voo"],["Toyota UA (anos 2000)","Milhares de globals, stack no limite, watchdog fraco","Qualidade de código é requisito de segurança"]]',
                },
                {
                    type: "quote",
                    value: "Nenhum desses sistemas falhou por falta de gênios: falharam por processos que deixaram uma suposição sem dono.",
                },
                {
                    type: "text",
                    value: "## Toyota e a aceleração não comandada\n\nEntre 2009 e 2011, a Toyota conduziu recalls milionários sob relatos de aceleração não comandada. Em 2013, no caso Bookout, um júri no Oklahoma viu a perícia de software mais citada da história do firmware: especialistas examinaram o código do controle eletrônico do acelerador e descreveram um sistema com MILHARES de variáveis globais graváveis (a contagem apresentada passava de 10 mil), métricas de complexidade estouradas, uso de stack estimado perto do limite somado a recursão, variáveis críticas (como o alvo de abertura do acelerador) sem espelhamento contra corrupção, e a possibilidade de morte silenciosa de uma tarefa central levando junto proteções. A cereja: o watchdog era alimentado por uma ISR de timer, exatamente o antipadrão da aula 3, incapaz de perceber tarefas mortas. O júri decidiu contra a fabricante, que fechou acordos em série.\n\nAs lições são de PROCESSO, e cada desastre ensina a sua. Ariane 5: reuso não é inocente; quando o requisito muda, toda suposição herdada precisa de dono e de revalidação. Pathfinder: instrumentação em produção paga a si mesma, e primitivas certas (herança de prioridade) existem pra ser ligadas. Toyota: qualidade de código não é estética, é segurança; padrões como MISRA, análise estática, disciplina de stack e watchdog honesto são o preço de assinar firmware que carrega gente.",
                },
            ],
            questions: [
                {
                    statement: "O que causou a perda do Ariane 5 em 1996?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Overflow ao converter velocidade de 64 pra 16 bits",
                            isCorrect: true,
                        },
                        {
                            text: "Vazamento de combustível num sensor da turbina",
                            isCorrect: false,
                        },
                        {
                            text: "Raio atingindo o foguete nos primeiros segundos",
                            isCorrect: false,
                        },
                        {
                            text: "Falha mecânica na separação do primeiro estágio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a redundância do Ariane 5 não salvou o voo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O reserva rodava o mesmo software e falhou igual",
                            isCorrect: true,
                        },
                        {
                            text: "O reserva estava desligado pra economizar energia",
                            isCorrect: false,
                        },
                        {
                            text: "O cabo entre os dois computadores estava rompido",
                            isCorrect: false,
                        },
                        {
                            text: "O reserva era de um fornecedor sem certificação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual lição de processo o Ariane 5 deixou?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reuso exige revalidar suposições no contexto novo",
                            isCorrect: true,
                        },
                        {
                            text: "Foguetes precisam de três computadores, não dois",
                            isCorrect: false,
                        },
                        {
                            text: "Conversões de tipo devem ser proibidas em voo",
                            isCorrect: false,
                        },
                        {
                            text: "Software de voo não deve reusar nenhuma linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a perícia do caso Toyota apontou no firmware do acelerador?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Globals aos milhares, stack no limite e watchdog fraco",
                            isCorrect: true,
                        },
                        {
                            text: "Um vírus instalado na linha de montagem final das ECUs",
                            isCorrect: false,
                        },
                        {
                            text: "Código impecável, com falha somente no pedal físico",
                            isCorrect: false,
                        },
                        {
                            text: "Uso excessivo de análise estática atrasando entregas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o watchdog do caso Toyota não pegava tarefas mortas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Era alimentado por ISR de timer, que seguia rodando",
                            isCorrect: true,
                        },
                        {
                            text: "Tinha timeout de horas por exigência da fábrica",
                            isCorrect: false,
                        },
                        {
                            text: "Era desativado pelo modo de economia de combustível",
                            isCorrect: false,
                        },
                        {
                            text: "Só monitorava a temperatura da unidade de controle",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Padrões de projeto de tempo real",
    aulas: [
        {
            titulo: "Máquina de estados",
            blocks: [
                {
                    type: "text",
                    value: "# O coração do firmware\n\nFirmware vive de modos e eventos: desarmado, armando, voando, pousando; byte chegou, timeout venceu, botão caiu. A forma profissional de organizar isso é a MÁQUINA DE ESTADOS FINITOS: estados explícitos num enum, eventos nomeados, e transições que dizem, sem ambiguidade, o que acontece quando cada evento chega em cada estado.\n\nA alternativa, que você já viu em código alheio, são as flags booleanas espalhadas: conectado, aguardando, erro, primeira_vez... Cinco flags criam 32 combinações, das quais 25 não deveriam existir, e uma delas vai existir na quinta-feira à noite. A máquina de estados mata essa classe de bug pela raiz: o sistema está em UM estado de cada vez, e as combinações inválidas deixam de ser representáveis.\n\nHá duas implementações canônicas. ENUM + SWITCH: um switch sobre o estado, um case por estado, legível no depurador, perfeito pra máquinas pequenas e médias. TABELA DE TRANSIÇÕES: uma matriz estado x evento com ponteiros de função ou próximos estados; a lógica vira DADOS, auditáveis linha a linha, ideal quando os estados passam de uma dúzia ou quando a revisão formal importa.",
                },
                {
                    type: "code",
                    value: "typedef enum { AGUARDA_INICIO, LE_TAMANHO, LE_DADOS, CONFERE_CRC } estado_t;\n\nstatic estado_t estado = AGUARDA_INICIO;\nstatic uint8_t quadro[TAM_MAX];\nstatic uint8_t esperados, lidos;\n\nvoid protocolo_byte(uint8_t b) {\n    switch (estado) {\n    case AGUARDA_INICIO:\n        if (b == 0x7E) estado = LE_TAMANHO;\n        break;\n    case LE_TAMANHO:\n        if (b > 0 && b <= TAM_MAX) {\n            esperados = b; lidos = 0; estado = LE_DADOS;\n        } else {\n            estado = AGUARDA_INICIO;  /* tamanho invalido: descarta */\n        }\n        break;\n    case LE_DADOS:\n        quadro[lidos++] = b;\n        if (lidos == esperados) estado = CONFERE_CRC;\n        break;\n    case CONFERE_CRC:\n        entregar_se_crc_ok(quadro, esperados, b);\n        estado = AGUARDA_INICIO;\n        break;\n    default:\n        log_evento(EV_ESTADO_IMPOSSIVEL, (uint8_t)estado, 0);\n        estado = AGUARDA_INICIO;\n        break;\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Abordagem","Vantagem","Custo","Quando usar"],["enum + switch","Simples, visível no depurador","Cresce num bloco só de código","Poucos estados, lógica local"],["Tabela de transições","Regras viram dados auditáveis","Indireção e ponteiros de função","Muitos estados, revisão formal"],["Flags booleanas soltas","Nenhuma","Combinações inválidas explodem","Nunca em firmware sério"]]',
                },
                {
                    type: "quote",
                    value: "Se você não consegue desenhar os estados do seu firmware num guardanapo, ele tem estados que você não conhece.",
                },
                {
                    type: "text",
                    value: "## Disciplinas que fazem a FSM valer\n\nQuatro hábitos transformam o desenho bonito em firmware robusto.\n\nEVENTO INVÁLIDO É CASO DEFINIDO: o que acontece se um byte de dados chegar em AGUARDA_INICIO? Ignorar, registrar, resetar o parser? Qualquer resposta serve, DESDE QUE decidida em projeto e escrita no código. O silêncio é que mata.\n\nTIMEOUT É EVENTO: quadro que parou no meio não pode prender o parser pra sempre. O timeout entra na máquina como qualquer outro evento, com transição própria (normalmente de volta ao início, com contador).\n\nUM ESCRITOR SÓ: a variável de estado pertence a um único contexto. Se ISR e tarefa mudam o estado, você reinventou a condição de corrida com nome bonito: transições que nenhuma das duas escreveu passam a existir.\n\nDEFAULT QUE ACUSA: o case default registra o estado impossível e recupera. Memória corrompe, e a FSM que loga o absurdo vira sua testemunha.\n\nE cada transição é um caso de teste natural: estado inicial, evento, estado esperado. Quando a máquina crescer demais, procure o conceito de máquinas hierárquicas; antes disso, o switch honesto com essas quatro disciplinas cobre a maioria do firmware do mundo.",
                },
            ],
            questions: [
                {
                    statement: "Qual problema a máquina de estados explícita resolve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Flags booleanas soltas criando combinações inválidas",
                            isCorrect: true,
                        },
                        {
                            text: "A falta de comentários nas funções longas do driver",
                            isCorrect: false,
                        },
                        {
                            text: "O consumo excessivo de flash em tabelas de dados",
                            isCorrect: false,
                        },
                        {
                            text: "A ausência de herança de prioridade nos mutexes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Numa FSM enum + switch, o que representa cada case?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O comportamento do sistema num estado específico",
                            isCorrect: true,
                        },
                        {
                            text: "Uma tarefa separada criada pelo escalonador",
                            isCorrect: false,
                        },
                        {
                            text: "Um nível de prioridade do escalonador do RTOS",
                            isCorrect: false,
                        },
                        {
                            text: "Um bloco de memória alocado do pool de mensagens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a tabela de transições vence o enum + switch?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Com muitos estados e necessidade de auditar as regras",
                            isCorrect: true,
                        },
                        {
                            text: "Quando o firmware precisa rodar sem RAM estática",
                            isCorrect: false,
                        },
                        {
                            text: "Quando os estados mudam mais de dez vezes por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o compilador usado não suporta o comando switch",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que fazer com um evento que chega num estado em que ele é inválido?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tratar conforme a regra definida em projeto e registrar",
                            isCorrect: true,
                        },
                        {
                            text: "Processar mesmo assim, pois evento não pode se perder",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar para o estado de maior prioridade do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar o firmware de imediato acionando o watchdog",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a variável de estado deve ter um único escritor?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Escritas concorrentes criam transições que não existem",
                            isCorrect: true,
                        },
                        {
                            text: "O depurador só observa variáveis de escritor único",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador otimiza melhor variáveis sem leitores",
                            isCorrect: false,
                        },
                        {
                            text: "Estados compartilhados dobram o consumo total de stack",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Executor cíclico vs RTOS",
            blocks: [
                {
                    type: "text",
                    value: "# O superloop, sem vergonha\n\nAntes do RTOS existe uma arquitetura mais velha e perfeitamente digna: o EXECUTOR CÍCLICO, o famoso superloop. Um laço infinito, ritmado por um timer, executando fases fixas em ordem fixa. Sem kernel, sem tarefas, sem troca de contexto: a análise temporal é somar o pior caso das fases e conferir que cabe no período.\n\nMilhões de produtos embarcados rodam exatamente isso, e bem: um termostato, um carregador, um sensor com um protocolo simples. Pra taxas diferentes, contadores derivados do tick escolhem o que roda em cada volta (a cada 2 ms a malha, a cada 100 ms a telemetria), como no código abaixo.\n\nOs limites aparecem com o crescimento. NÃO HÁ PREEMPÇÃO: se a fase de telemetria resolver gastar 30 milissegundos escrevendo na flash, a malha de 2 milissegundos perde 15 ciclos, e ninguém a socorre. Todo trabalho lento precisa ser FATIADO à mão em passos curtos (uma máquina de estados por fase, olha ela aí), e o laço vira um escalonador manual que você mantém. É exatamente essa dor que o RTOS vende de volta: preempção pra proteger o prazo curto do trabalho longo.",
                },
                {
                    type: "code",
                    value: "volatile bool tick_1ms = false;   /* setado pela ISR do timer */\n\nint main(void) {\n    hw_init();\n    uint32_t ms = 0;\n    for (;;) {\n        while (!tick_1ms) { }         /* espera o proximo tick */\n        tick_1ms = false;\n        ms++;\n\n        ler_sensores();                        /* toda volta: 1 kHz */\n        if ((ms % 2u) == 0u)   malha_controle();    /* 500 Hz */\n        if ((ms % 100u) == 0u) telemetria_passo();  /* 10 Hz, fatiada */\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Critério","Superloop","RTOS"],["Complexidade","Mínima, sem kernel","Kernel, configuração, curva de equipe"],["Preempção","Nenhuma: fase lenta atrasa tudo","Tarefa crítica passa na frente"],["Taxas múltiplas","Contadores manuais no laço","Uma tarefa por taxa, natural"],["Análise temporal","Somar o pior caso das fases","RMS e análise de resposta"],["Memória","Um stack único","Um stack por tarefa"]]',
                },
                {
                    type: "quote",
                    value: "O superloop não é o RTOS dos pobres: é a ferramenta certa pro problema pequeno. Vaidade é usar kernel onde cabia um laço.",
                },
                {
                    type: "text",
                    value: "## O critério de migração\n\nFique no superloop enquanto três condições valerem: as taxas são poucas e harmônicas (100 Hz e 10 Hz convivem bem; 500 Hz e uma escrita de flash de 30 ms, não); nenhuma operação precisa bloquear por muito tempo (ou todas se deixam fatiar sem sofrimento); e a soma dos piores casos das fases cabe com folga no período mais curto. Bônus real: em domínios certificados, menos mecanismo significa menos superfície pra auditar, e executores cíclicos têm longa tradição justamente onde a auditoria é pesada.\n\nMigre pra RTOS quando se pegar construindo um escalonador artesanal: fatiando na mão cada trabalho lento, inventando filas próprias entre fases, fazendo malabarismo de contadores pra encaixar uma taxa nova. Nesse ponto, o kernel de dezenas de kilobytes está mais barato que o seu: o do FreeRTOS chega testado, com preempção, prioridades analisáveis pelo RMS e as primitivas dos módulos anteriores.\n\nO erro em ambas as direções tem nome: kernel em termostato é complexidade gratuita; superloop em drone é prazo curto desprotegido. Arquitetura se escolhe pelo problema, e trocar no meio custa caro: gaste uma tarde na decisão antes da primeira linha.",
                },
            ],
            questions: [
                {
                    statement: "O que é o executor cíclico (superloop)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um laço único com fases fixas ritmadas por timer",
                            isCorrect: true,
                        },
                        {
                            text: "Um escalonador dinâmico embutido no bootloader",
                            isCorrect: false,
                        },
                        {
                            text: "Uma tarefa de RTOS com prioridade sempre máxima",
                            isCorrect: false,
                        },
                        {
                            text: "Um modo de baixo consumo do microcontrolador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a principal limitação do superloop?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem preempção: uma fase lenta atrasa todas",
                            isCorrect: true,
                        },
                        {
                            text: "Não funciona sem um RTOS por baixo dele",
                            isCorrect: false,
                        },
                        {
                            text: "Exige um stack separado pra cada fase do laço",
                            isCorrect: false,
                        },
                        {
                            text: "Só roda em processadores antigos de 8 bits",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o superloop atende taxas diferentes (1 kHz e 10 Hz)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Contadores de tick escolhem a fase de cada iteração",
                            isCorrect: true,
                        },
                        {
                            text: "Duplicando o laço principal em dois núcleos da CPU",
                            isCorrect: false,
                        },
                        {
                            text: "Trocando o clock do processador a cada iteração",
                            isCorrect: false,
                        },
                        {
                            text: "Rodando a fase lenta numa interrupção de software",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual sinal indica que o superloop deixou de bastar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Você fatia na mão cada trabalho lento em passos",
                            isCorrect: true,
                        },
                        {
                            text: "O laço principal passa de cem linhas de código",
                            isCorrect: false,
                        },
                        {
                            text: "O produto ganha um segundo LED de status na placa",
                            isCorrect: false,
                        },
                        {
                            text: "A equipe cresce pra mais de dois desenvolvedores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que certificação às vezes favorece o superloop?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Menos mecanismo pra auditar: sem kernel nem preempção",
                            isCorrect: true,
                        },
                        {
                            text: "As normas proíbem RTOS em qualquer produto crítico",
                            isCorrect: false,
                        },
                        {
                            text: "O superloop elimina a necessidade de testes de unidade",
                            isCorrect: false,
                        },
                        {
                            text: "Auditores só leem programas com um único arquivo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Produtor-consumidor com prioridades",
            blocks: [
                {
                    type: "text",
                    value: "# Ritmos diferentes, fila no meio\n\nO cenário mais comum do firmware com RTOS: sensores rápidos de um lado, processamento lento do outro. A IMU cospe amostras a 1 kHz; o filtro que as digere leva o tempo que leva, e de vez em quando é atropelado por tarefas mais prioritárias. Ligar os dois DIRETAMENTE (produtor chama o consumidor) acorrenta o ritmo de captura ao ritmo de processamento, e a captura perde amostras sempre que o processamento engasga.\n\nO padrão produtor-consumidor desata o nó com uma fila no meio: o produtor deposita e segue; o consumidor drena no seu ritmo; a fila absorve a diferença momentânea entre os dois.\n\nAs prioridades seguem a lógica do módulo 3: o PRODUTOR é curto e pontual (capturar e enfileirar, microssegundos), então pode ter prioridade alta sem pesar; o CONSUMIDOR carrega o trabalho pesado em prioridade menor, sendo preemptado sem drama. E o TAMANHO da fila sai de uma conta, não de um palpite: taxa de produção vezes a maior pausa possível do consumidor, mais margem. Produtor a 1 kHz, consumidor que pode ficar 20 milissegundos sem rodar: 20 itens em trânsito; a fila de 32 dorme tranquila.",
                },
                {
                    type: "code",
                    value: "static QueueHandle_t filaAmostras;\n\nvoid vTaskAquisicao(void *arg) {          /* prioridade alta, curta */\n    amostra_t a;\n    for (;;) {\n        esperar_amostra_pronta(&a);       /* bloqueia no sensor */\n        if (xQueueSend(filaAmostras, &a, 0) != pdTRUE) {\n            atomic_fetch_add(&perdidas, 1); /* cheia: descarta e conta */\n        }\n    }\n}\n\nvoid vTaskProcessamento(void *arg) {      /* prioridade menor */\n    amostra_t a;\n    for (;;) {\n        xQueueReceive(filaAmostras, &a, portMAX_DELAY);\n        filtrar_e_integrar(&a);           /* trabalho pesado aqui */\n    }\n}\n\nvoid init_filas(void) {\n    filaAmostras = xQueueCreate(32, sizeof(amostra_t));\n}",
                },
                {
                    type: "table",
                    value: '[["Parâmetro","Pergunta que o define","Exemplo"],["Tamanho da fila","Taxa x maior pausa do consumidor + margem","1 kHz x 20 ms = 20; use 32"],["Prioridade do produtor","A captura é curta e tem prazo?","Alta, com trabalho mínimo"],["Prioridade do consumidor","Quanto atraso o processamento tolera?","Média ou baixa"],["Política de fila cheia","O que vale mais: o novo ou o velho?","Descartar e contar"]]',
                },
                {
                    type: "quote",
                    value: "A fila não cria capacidade: ela compra tempo. Se o consumidor é lento pra sempre, nenhum tamanho salva.",
                },
                {
                    type: "text",
                    value: "## Fila cheia é decisão, não acidente\n\nToda fila enche um dia, e o que acontece então é POLÍTICA de projeto, escolhida por canal.\n\nDESCARTAR O NOVO: o padrão pra fluxos contínuos; a amostra perdida tem substituta em 1 milissegundo. Obrigatório contar (o contador de perdidas do código) e revisar o contador em bancada e em campo.\n\nDESCARTAR O VELHO: quando só o valor mais RECENTE interessa, como a última posição do manche. O FreeRTOS tem a primitiva exata: xQueueOverwrite numa fila de uma posição, a caixa postal que sempre guarda o último valor.\n\nBLOQUEAR O PRODUTOR: jamais numa ISR (ela não pode esperar), e em tarefa apenas com timeout limitado e justificado: você está propagando a pressão pra trás, e isso precisa caber no prazo de quem produz.\n\nE o diagnóstico que evita remédio errado: fila que transborda EM RAJADA é fila curta (aumente, é barato); fila que transborda SEMPRE é consumidor sem vazão, e nenhum tamanho de fila fabrica CPU. Monitore o high-water da fila (máximo de itens já vistos) junto com os contadores de descarte: esses dois números contam a história inteira do canal.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel da fila entre produtor rápido e consumidor lento?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Absorver rajadas e desacoplar os ritmos dos dois",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar a velocidade média do consumidor lento",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar as amostras por prioridade de conteúdo",
                            isCorrect: false,
                        },
                        {
                            text: "Comprimir os dados pra economizar memória RAM",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o produtor curto costuma ter prioridade alta?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O prazo de captura é curto e o trabalho é mínimo",
                            isCorrect: true,
                        },
                        {
                            text: "Ele foi criado antes do consumidor no código",
                            isCorrect: false,
                        },
                        {
                            text: "Ele usa mais stack e precisa terminar rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Filas exigem que quem envia tenha prioridade maior",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como dimensionar o tamanho da fila?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Taxa de produção vezes a maior pausa do consumidor",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre 64 posições, o padrão seguro da indústria",
                            isCorrect: false,
                        },
                        {
                            text: "Metade da RAM livre dividida pelo tamanho do item",
                            isCorrect: false,
                        },
                        {
                            text: "Uma posição por tarefa existente no sistema todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando usar xQueueOverwrite (descartar o mais velho)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quando só o valor mais recente importa ao consumidor",
                            isCorrect: true,
                        },
                        {
                            text: "Quando a fila guarda comandos que não podem sumir",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o produtor roda em prioridade mais baixa",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o consumidor processa em ordem alfabética",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A fila transborda continuamente, não só em rajadas. Qual é o diagnóstico?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vazão do consumidor insuficiente: fila não resolve",
                            isCorrect: true,
                        },
                        {
                            text: "Fila pequena: dobrar o tamanho resolve de vez",
                            isCorrect: false,
                        },
                        {
                            text: "Prioridade do produtor baixa demais pra enviar",
                            isCorrect: false,
                        },
                        {
                            text: "O RTOS limita filas a cem mensagens por segundo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Sincronizar sem bloquear",
            blocks: [
                {
                    type: "text",
                    value: '# A escada da sincronização\n\nCompartilhar dados custa, e o custo certo depende do caso. Suba a escada degrau a degrau, do mais simples ao mais afiado.\n\nSEÇÃO CRÍTICA CURTA: mascarar interrupções por meia dúzia de instruções (taskENTER_CRITICAL no FreeRTOS). Simples e correta; o preço é somar essa duração à latência de TODAS as interrupções, então só pra trechos mínimos e raros.\n\nMUTEX: exclusão entre tarefas com herança de prioridade. Certo pra recursos longos; bloqueio e trocas de contexto no pacote.\n\nATOMICS: operações indivisíveis do C11 (stdatomic) pra contadores, flags e índices. Baratas, sem bloqueio, sem inversão.\n\nE o degrau afiado: estruturas LOCK-FREE, como o SPSC do módulo 4, agora com as garantias formais.\n\nUma limpeza de terreno antes: VOLATILE NÃO É ATOMICIDADE. O volatile diz ao compilador "não elimine nem reordene os acessos a esta variável"; não torna leitura-modificação-escrita indivisível (o clássico contador++ compartilhado quebra) e não impõe ordem ao PROCESSADOR. Serve pra registrador de hardware e flag simples de ISR no mesmo núcleo; pra sincronizar de verdade, atomics.',
                },
                {
                    type: "code",
                    value: "#include <stdatomic.h>\n\nstatic uint8_t buf[TAM];              /* TAM potencia de dois */\nstatic atomic_uint cabeca;            /* so o produtor escreve */\nstatic atomic_uint cauda;             /* so o consumidor escreve */\n\nbool put(uint8_t b) {\n    unsigned c = atomic_load_explicit(&cabeca, memory_order_relaxed);\n    unsigned prox = (c + 1u) & (TAM - 1u);\n    if (prox == atomic_load_explicit(&cauda, memory_order_acquire))\n        return false;                          /* cheio */\n    buf[c] = b;                                /* 1: escreve o dado */\n    atomic_store_explicit(&cabeca, prox,\n                          memory_order_release); /* 2: publica */\n    return true;\n}",
                },
                {
                    type: "table",
                    value: '[["Mecanismo","Custo","Quando usar"],["Seção crítica curta","Soma latência a todas as ISRs","Poucas instruções, trecho raro"],["Mutex com herança","Bloqueio e trocas de contexto","Recurso longo entre tarefas"],["Atomics","Barato, sem bloqueio","Contadores, flags, índices"],["SPSC lock-free","Projeto delicado, revisão cara","Caminho quente entre ISR e tarefa"]]',
                },
                {
                    type: "quote",
                    value: "Lock-free é ferramenta de precisão, não troféu: o custo de errar é um bug que aparece uma vez por semana, sempre em outro lugar.",
                },
                {
                    type: "text",
                    value: '## Release, acquire e o teste da vaidade\n\nPor que o SPSC de verdade usa release e acquire em vez de esperança? Porque compilador E processador reordenam operações. No put, a dupla sagrada do módulo 4 (primeiro o dado, depois o índice) só é GARANTIDA porque a publicação da cabeça usa memory_order_release: nada escrito antes dela pode ser enxergado depois. Do outro lado, o consumidor lê a cabeça com acquire e tem a garantia espelhada: se viu o índice novo, vê o dado que o precedeu. O par release-acquire é o contrato; volatile não o oferece.\n\nNum Cortex-M de núcleo único muita coisa "funciona" sem isso, por acidente da microarquitetura, e morre na portada pro chip de dois núcleos, ou quando o DMA entra na dança. Escreva o contrato certo desde o início: nos alvos simples, os atomics compilam pra quase nada; nos complexos, salvam o produto.\n\nE o teste da vaidade, pra fechar: lock-free se justifica quando a MEDIÇÃO mostra o caminho quente sofrendo com o mecanismo mais simples, e quando existe um padrão consagrado (SPSC é um; MPMC genérico é tese de doutorado, não firmware). Fora disso, a fila do RTOS e o mutex curto são corretos, legíveis e auditáveis. Correto primeiro, esperto depois, e esperto só com número na mão.',
                },
            ],
            questions: [
                {
                    statement: "O que volatile garante em C?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Que o compilador não elimina nem guarda os acessos",
                            isCorrect: true,
                        },
                        {
                            text: "Atomicidade completa de leitura e de escrita da variável",
                            isCorrect: false,
                        },
                        {
                            text: "Ordem de execução respeitada também pelo processador",
                            isCorrect: false,
                        },
                        {
                            text: "Exclusão mútua implícita entre todas as tarefas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Pra um contador compartilhado simples, qual mecanismo é o mais leve?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Operações atômicas, como as do stdatomic de C11",
                            isCorrect: true,
                        },
                        {
                            text: "Um mutex com herança de prioridade ativada",
                            isCorrect: false,
                        },
                        {
                            text: "Uma fila do RTOS criada com uma posição apenas",
                            isCorrect: false,
                        },
                        {
                            text: "Suspender o escalonador durante o incremento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No SPSC lock-free, por que publicar a cabeça com release?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Garante o dado visível antes do índice novo",
                            isCorrect: true,
                        },
                        {
                            text: "Acelera a escrita usando o barramento rápido",
                            isCorrect: false,
                        },
                        {
                            text: "Impede interrupções durante a atualização",
                            isCorrect: false,
                        },
                        {
                            text: "Notifica o consumidor pela fila do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando a seção crítica curta é a escolha certa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra poucas instruções, em trecho raro e curto",
                            isCorrect: true,
                        },
                        {
                            text: "Pra proteger o processamento inteiro de um quadro",
                            isCorrect: false,
                        },
                        {
                            text: "Pra substituir mutexes em todos os drivers do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Pra impedir a preempção da tarefa de telemetria",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o lock-free vira vaidade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quando ninguém mediu e um mutex curto já bastaria",
                            isCorrect: true,
                        },
                        {
                            text: "Sempre que o firmware roda num núcleo único de CPU",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o buffer compartilhado passa de um kilobyte",
                            isCorrect: false,
                        },
                        {
                            text: "Quando produtor e consumidor têm a mesma prioridade",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Logging em tempo real",
            blocks: [
                {
                    type: "text",
                    value: "# O log que não atrapalha\n\nVocê precisa saber o que o firmware fez, e a ferramenta ingênua pra isso destrói exatamente o que você quer observar. Um printf inocente custa caro duas vezes: a FORMATAÇÃO (converter números em texto) consome de dezenas de microssegundos a milissegundos, com stack e às vezes heap no pacote; e a TRANSMISSÃO bloqueante numa UART a 115200 bauds anda a passo de carroça: cerca de 87 microssegundos POR CARACTERE, quase 7 milissegundos pra uma linha de 80 colunas. Enfiar isso numa ISR ou na malha de 2 milissegundos não é log, é sabotagem.\n\nO padrão de tempo real inverte tudo: registre BINÁRIO, formate DEPOIS, transmita LONGE. Um evento é um registro pequeno e fixo (código do evento, timestamp do timer de hardware, um ou dois valores) escrito num ring buffer em poucos microssegundos, sem formatação nenhuma. Uma tarefa de prioridade BAIXA drena o ring pra UART ou flash quando sobra CPU, e um decodificador no seu computador transforma os códigos em texto legível usando um dicionário gerado do próprio código-fonte. O caminho crítico paga microssegundos; a estética fica pra quem tem tempo.",
                },
                {
                    type: "code",
                    value: "typedef struct {\n    uint8_t  id;        /* codigo do evento */\n    uint8_t  dado8;\n    uint16_t dado16;\n    uint32_t t_us;      /* timestamp do timer de hardware */\n} evento_t;             /* 8 bytes, tamanho fixo */\n\nvoid log_evento(uint8_t id, uint8_t d8, uint16_t d16) {\n    evento_t e = { id, d8, d16, timer_us() };\n    if (!ring_put_evento(&e)) {\n        atomic_fetch_add(&evt_descartados, 1);  /* perdeu: conte */\n    }\n}\n\n/* tarefa de prioridade baixa drena o ring pra UART ou flash;\n   um decodificador no PC traduz ids em texto com o dicionario */",
                },
                {
                    type: "table",
                    value: '[["Aspecto","printf na hora","Log binário de eventos"],["Custo no ponto quente","Dezenas de µs a ms","Poucos µs por evento"],["Determinismo","Formatação e UART variáveis","Registro de tamanho fixo"],["Risco escondido","Bloqueio, stack, alocação","Perda contada quando o ring enche"],["Análise","Texto imediato na serial","Decodificação offline com dicionário"]]',
                },
                {
                    type: "quote",
                    value: "O log que muda o tempo do sistema mente duas vezes: sobre o sistema e sobre si mesmo.",
                },
                {
                    type: "text",
                    value: '## Timestamps, perda contada e as ferramentas\n\nTrês acabamentos separam o log profissional do improviso.\n\nTIMESTAMP DE VERDADE: use o timer de hardware em microssegundos, não o tick de milissegundo. Eventos do caminho crítico se separam por dezenas de microssegundos, e um carimbo grosso embaralha a ordem aparente das causas, transformando a análise em adivinhação.\n\nPERDA É DADO: quando o ring enche, descarte o evento e incremente o contador de descartados. Saber que perdeu 217 eventos entre dois instantes é informação valiosa (o sistema estava saturado ali); travar o caminho crítico pra não perder log seria inverter os valores do projeto inteiro.\n\nDRENAGEM HUMILDE: a tarefa que esvazia o ring roda em prioridade baixa por princípio: o log jamais compete com o controle. Se a drenagem atrasa, o ring segura; se estoura, o contador conta.\n\nÉ exatamente essa arquitetura que as ferramentas profissionais de trace (SEGGER SystemView, Tracealyzer) usam pro próprio kernel: eventos binários com carimbo fino num ring, interface gráfica offline. Seus eventos de aplicação podem viajar no mesmo esquema. E o heisenbug do módulo 4 ganha explicação completa: o printf que "conserta" o bug mudou o tempo e o layout de memória; o log binário, de tão leve, quase não mexe na cena do crime.',
                },
            ],
            questions: [
                {
                    statement: "Por que printf é proibido na ISR?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Formatar e transmitir custam de µs a ms variáveis",
                            isCorrect: true,
                        },
                        {
                            text: "O texto gerado ocuparia toda a flash de programa",
                            isCorrect: false,
                        },
                        {
                            text: "A UART só aceita dados enviados a partir de tarefas",
                            isCorrect: false,
                        },
                        {
                            text: "O printf reinicia o contador do watchdog por padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que um evento do log binário carrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Id, timestamp e um payload pequeno de tamanho fixo",
                            isCorrect: true,
                        },
                        {
                            text: "O texto completo formatado da mensagem de erro",
                            isCorrect: false,
                        },
                        {
                            text: "Uma cópia do stack da tarefa no instante do evento",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do arquivo e a linha em string terminada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que drenar o log em prioridade baixa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O log não pode competir com o caminho crítico por CPU",
                            isCorrect: true,
                        },
                        {
                            text: "A UART exige a prioridade mais baixa de todo o sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Prioridade baixa comprime melhor os dados do ring",
                            isCorrect: false,
                        },
                        {
                            text: "O escalonador reserva as altas pra código do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O ring de eventos encheu. O que o sistema deve fazer?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descartar o evento novo e incrementar um contador",
                            isCorrect: true,
                        },
                        {
                            text: "Bloquear o produtor até a drenagem abrir espaço",
                            isCorrect: false,
                        },
                        {
                            text: "Parar o sistema: log é tão crítico quanto controle",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar o ring alocando memória do heap na hora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um bug some quando você adiciona logs de texto. Qual a explicação clássica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O log mudou o tempo e o layout, escondendo a causa",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador corrige erros ao recompilar com printf",
                            isCorrect: false,
                        },
                        {
                            text: "O bug era do osciloscópio, não do firmware em si",
                            isCorrect: false,
                        },
                        {
                            text: "Logs de texto limpam a memória corrompida ao rodar",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: firmware de um drone agrícola",
    aulas: [
        {
            titulo: "Requisitos temporais do drone",
            blocks: [
                {
                    type: "text",
                    value: "# O projeto no papel\n\nÚltimos cinco encontros: vamos projetar, no papel, o firmware de um drone agrícola de pulverização. Nada de placa nem solda; o exercício é de ENGENHARIA de tempo real: requisitos, tarefas, comunicação, proteção. É uma leitura guiada em que cada módulo anterior vira decisão concreta.\n\nO drone: um quadricóptero que voa linhas retas sobre a lavoura, pulverizando com vazão controlada. O trabalho começa onde todo projeto sério começa: a TABELA DE REQUISITOS TEMPORAIS, com cada função, seu período, seu deadline, sua classe e a consequência do estouro.\n\nA malha de estabilização de atitude roda a 500 Hz: a cada 2 milissegundos, ler o estado, calcular, comandar os motores. É o coração hard do sistema: perder ciclos em sequência significa instabilidade e queda. A IMU (giroscópio e acelerômetro) amostra a 1 kHz pra alimentar o filtro. O rádio traz comandos do operador a 50 Hz. GPS e navegação corrigem a rota a 10 Hz. A telemetria atualiza o painel a 10 Hz. E o housekeeping vigia a saúde a 1 Hz. A tabela abaixo é o contrato do projeto inteiro.",
                },
                {
                    type: "table",
                    value: '[["Função","Período","Deadline","Classe","Consequência do estouro"],["Malha de atitude","2 ms (500 Hz)","2 ms","Hard","Instabilidade e queda"],["Amostragem da IMU","1 ms (1 kHz)","1 ms","Hard","Amostra perdida degrada o filtro"],["Comando de rádio","20 ms (50 Hz)","20 ms","Firm","Comando velho é descartado"],["GPS e navegação","100 ms (10 Hz)","100 ms","Firm","Correção de rota adiada um ciclo"],["Telemetria","100 ms (10 Hz)","Folgado","Soft","Painel do operador envelhece"],["Housekeeping","1 s","Folgado","Soft","Diagnóstico atrasa um pouco"]]',
                },
                {
                    type: "quote",
                    value: "O documento mais barato do projeto é a tabela de deadlines; o mais caro é descobri-los em campo.",
                },
                {
                    type: "text",
                    value: "## Da física ao número\n\nCada linha da tabela precisa de uma origem defensável, porque é isso que separa requisito de chute.\n\nPor que 500 Hz na atitude? A dinâmica de um quadricóptero é rápida: perturbações de vento e as respostas dos motores acontecem em dezenas de milissegundos, e a regra prática de controle digital pede amostrar com folga generosa acima da dinâmica que se quer dominar, preservando margem de fase. Taxas nessa faixa são o padrão consolidado de controladoras de voo, e descer muito abaixo corrói a estabilidade antes de qualquer outra coisa.\n\nPor que a IMU a 1 kHz? O filtro de atitude melhora com amostragem acima da taxa da malha, e o custo de capturar (uma ISR curta ou DMA) é pequeno.\n\nPor que a telemetria é soft? Porque do outro lado há um humano olhando um painel: um pacote atrasado envelhece o dado em 100 milissegundos, e ninguém morre.\n\nRepare no que a classificação compra: o esforço de garantia (análise, medição, margem) se concentra nas duas linhas hard; o resto pede boa engenharia comum. Classificar é alocar rigor. Nas próximas aulas, essa tabela vira tarefas, prioridades e filas.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o deadline da malha de atitude a 500 Hz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "2 ms: o comando deve sair antes da próxima amostra",
                            isCorrect: true,
                        },
                        {
                            text: "20 ms, um ciclo de folga sobre o período da malha",
                            isCorrect: false,
                        },
                        {
                            text: "1 s, o tempo de reação típico de um operador humano",
                            isCorrect: false,
                        },
                        {
                            text: "500 ms, metade do período configurado da malha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a telemetria do drone é classificada como soft?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Atraso só envelhece o painel do operador",
                            isCorrect: true,
                        },
                        {
                            text: "Porque usa menos memória que o controle",
                            isCorrect: false,
                        },
                        {
                            text: "Porque roda no rádio, fora do processador",
                            isCorrect: false,
                        },
                        {
                            text: "Porque é a única função sem timestamp",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a malha de atitude precisa de taxa tão alta (500 Hz)?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A dinâmica rápida exige amostrar com margem de fase",
                            isCorrect: true,
                        },
                        {
                            text: "O rádio manda comandos a 500 Hz e força a taxa",
                            isCorrect: false,
                        },
                        {
                            text: "A bateria rende mais com laços de controle rápidos",
                            isCorrect: false,
                        },
                        {
                            text: "O GPS exige a mesma taxa pra sincronizar posição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Perder UM comando de rádio (classe firm) leva a quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descarta o comando velho e usa o próximo que chegar",
                            isCorrect: true,
                        },
                        {
                            text: "Acionar o pouso controlado de emergência na hora",
                            isCorrect: false,
                        },
                        {
                            text: "Repetir o último comando por três ciclos inteiros",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar o módulo de rádio e limpar a fila toda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna a tabela de requisitos engenharia, e não burocracia?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada número tem origem física que se pode defender",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é assinada pelo gerente antes do primeiro commit",
                            isCorrect: false,
                        },
                        {
                            text: "Ela lista todas as funções do código-fonte do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Ela usa os mesmos períodos de projetos anteriores",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Tarefas e prioridades do drone",
            blocks: [
                {
                    type: "text",
                    value: "# Da tabela às tarefas\n\nRegra do módulo 2: ISR captura, tarefa processa. A amostragem da IMU vira uma ISR curtíssima (ou DMA) a 1 kHz que deposita amostras e sinaliza. O resto vira cinco tarefas: CONTROLE (a malha de 2 ms), RÁDIO (parser de comandos, 20 ms), NAVEGAÇÃO (GPS e correção de rota, 100 ms), TELEMETRIA (100 ms) e HOUSEKEEPING (1 s: stacks, filas, watchdog, temperatura).\n\nPrioridades pelo RMS do módulo 3: período menor, prioridade maior. Controle no topo, housekeeping no porão. O C de cada tarefa vem de onde o módulo 5 mandou: pior caso MEDIDO com estímulos maliciosos, mais margem documentada. Os números da tabela abaixo são as estimativas de projeto que a bancada vai revisar.\n\nNote o empate em 100 ms: navegação e telemetria têm o mesmo período, e o RMS não desempata. Desempatamos por CONSEQUÊNCIA: navegação acima (corrigir rota alimenta o voo; telemetria alimenta um painel), e a decisão fica registrada na tabela com sua justificativa, como manda o hábito que este projeto quer te deixar: toda escolha com dono e com porquê.",
                },
                {
                    type: "table",
                    value: '[["Tarefa","T (período)","C (pior caso + margem)","U = C/T","Prioridade"],["Controle","2 ms","0,7 ms","0,35","5 (máxima)"],["Rádio","20 ms","0,8 ms","0,04","4"],["Navegação","100 ms","2,0 ms","0,02","3"],["Telemetria","100 ms","3,0 ms","0,03","2"],["Housekeeping","1000 ms","5,0 ms","0,005","1"]]',
                },
                {
                    type: "quote",
                    value: "A telemetria é importantíssima pro operador e mesmo assim fica embaixo: prioridade mede prazo, não prestígio.",
                },
                {
                    type: "text",
                    value: "## A conta que deixa dormir\n\nSomem-se as utilizações: 0,35 + 0,04 + 0,02 + 0,03 + 0,005 = 0,445. Falta o custo das ISRs, que rouba CPU de todo mundo: a ISR da IMU a 1 kHz custando uns 20 microssegundos por disparo consome 2% (0,02), e reservamos outro tanto pra rádio e miudezas: chegamos a uns 0,47 de utilização total.\n\nO limite de Liu e Layland pra cinco tarefas: 5 vezes (2 elevado a 1/5, menos 1), que dá 0,743. Nosso 0,47 passa com folga larga, e a folga É um resultado de projeto: significa espaço pra crescer (uma função nova de mapeamento, um filtro mais caro) sem redesenhar o sistema, e tolerância pros erros de estimativa que a bancada vai revelar.\n\nE se a conta tivesse dado 0,8? O cardápio do módulo 3, na ordem da honestidade: medir melhor os C (estimativa gorda é comum), otimizar o caminho quente, baixar taxas que a física permitir baixar, dividir trabalho entre chips, ou aceitar a análise mais fina de tempo de resposta se a soma passa do limite mas os períodos são bem comportados.\n\nA utilização é um número VIVO: recalcule a cada função nova, e monitore em campo o tempo da tarefa ociosa, que é a folga real respirando.",
                },
            ],
            questions: [
                {
                    statement: "Pelo RMS, qual tarefa do drone recebe a prioridade máxima?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O controle de 2 ms, o menor período do conjunto",
                            isCorrect: true,
                        },
                        {
                            text: "A telemetria, que o operador acompanha ao vivo",
                            isCorrect: false,
                        },
                        {
                            text: "O housekeeping, que vigia a saúde do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "A navegação, que corrige a rota da aplicação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde fica a amostragem da IMU nesse desenho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Em ISR ou DMA curtos, sinalizando o controle",
                            isCorrect: true,
                        },
                        {
                            text: "Numa tarefa de prioridade mínima do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Dentro da tarefa de telemetria, por conveniência",
                            isCorrect: false,
                        },
                        {
                            text: "No laço principal, antes do escalonador subir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com U total de 0,47 e limite de 0,743 pra cinco tarefas, qual é a leitura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Passa no teste com folga boa pra crescer com o produto",
                            isCorrect: true,
                        },
                        {
                            text: "Falha, pois 0,47 está abaixo do mínimo exigido de 0,5",
                            isCorrect: false,
                        },
                        {
                            text: "Passa, mas somente se o tick do kernel for menor que 1 ms",
                            isCorrect: false,
                        },
                        {
                            text: "Inconclusivo até somar o consumo de RAM das tarefas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Navegação e telemetria têm o mesmo período. Como ordenar as duas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Por consequência: navegação acima, decisão registrada",
                            isCorrect: true,
                        },
                        {
                            text: "Sorteando na inicialização, já que o RMS não decide",
                            isCorrect: false,
                        },
                        {
                            text: "Deixando as duas na mesma prioridade, sem exceção",
                            isCorrect: false,
                        },
                        {
                            text: "Pela ordem alfabética dos nomes das duas tarefas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "De onde deve vir o C usado na utilização de cada tarefa?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Do pior caso medido com estímulos, mais margem",
                            isCorrect: true,
                        },
                        {
                            text: "Da média de uma semana de bancada estável",
                            isCorrect: false,
                        },
                        {
                            text: "Da estimativa de linhas de código da função",
                            isCorrect: false,
                        },
                        {
                            text: "Do datasheet do fabricante do microcontrolador",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Comunicação entre as partes",
            blocks: [
                {
                    type: "text",
                    value: "# Os canais e suas contas\n\nTarefas definidas, falta ligá-las, e cada canal recebe o mecanismo do módulo 6 que seu papel pede, com tamanho JUSTIFICADO.\n\nIMU PRA CONTROLE: a ISR deposita amostras numa fila. Produção a 1 kHz, consumo a 500 Hz: duas amostras por ciclo do controle. Fila de 8 dá quatro ciclos de tolerância a atrasos momentâneos do consumidor; se encher, descarta e conta (fluxo contínuo, classe firm na prática: amostra nova chega em 1 ms).\n\nRÁDIO PRA PARSER: ring de bytes de 64 posições; o maior quadro do protocolo tem 32 bytes, então cabem dois quadros inteiros de rajada com o parser ocupado.\n\nPARSER PRA CONTROLE, o setpoint: caixa postal de UMA posição com xQueueOverwrite. O controle quer o comando de voo MAIS RECENTE; um intermediário perdido é exatamente o que se deseja perder.\n\nCOMANDOS DE MISSÃO (iniciar pulverização, voltar, pousar): fila de 8 SEM overwrite, porque comando de missão não pode evaporar; o produtor espera com timeout curto e conta a falha se estourar.\n\nTELEMETRIA: as produtoras registram eventos num ring de 128, drenado a 10 Hz; transbordo vira contador, nunca pressão sobre o controle.",
                },
                {
                    type: "table",
                    value: '[["Canal","Mecanismo","Tamanho","Justificativa"],["IMU para controle","Fila de amostras","8","2 por ciclo de consumo; margem de 4 ciclos"],["Rádio para parser","Ring de bytes","64","Dois quadros máximos de 32 bytes em rajada"],["Parser para controle","Caixa postal com overwrite","1","Só o setpoint mais recente interessa"],["Comandos de missão","Fila sem overwrite","8","Comando não pode se perder; produtor espera"],["Eventos de telemetria","Ring de eventos","128","Drenagem a 10 Hz; rajadas absorvidas e contadas"]]',
                },
                {
                    type: "quote",
                    value: "Cada tamanho de fila é uma frase: aguento tanto de rajada com o consumidor parado por tanto tempo. Quem não completa a frase não sabe o tamanho.",
                },
                {
                    type: "text",
                    value: '## Por que cada escolha e não outra\n\nVale explicitar os contrastes, porque neles mora o critério.\n\nSetpoint com overwrite, missão sem: os dois vêm do mesmo rádio, mas o setpoint é um FLUXO (o valor seguinte substitui o anterior por natureza) e a missão é uma SEQUÊNCIA de eventos discretos (pular um "iniciar pulverização" muda o comportamento do produto). Mesma origem, semânticas opostas, mecanismos opostos.\n\nA fila da IMU podia ser menor? Podia: 4 já cobriria dois ciclos. Os 8 custam alguns bytes e compram tolerância a interferências raras (uma rajada de ISRs de rádio atrasando o controle em um ciclo). Barato demais pra não comprar; a regra do produtor-consumidor é dimensionar pra RAJADA, e transbordo contínuo indicaria consumidor doente, coisa que fila nenhuma conserta.\n\nE os contadores de descarte de cada canal não são enfeite: o housekeeping os lê a 1 Hz e o log da telemetria os carrega pro chão. Um contador de perdas da IMU subindo em voo é o sistema avisando que a análise de escalonamento e a realidade discordaram em algum ponto, e essa diferença é exatamente o que se investiga ANTES do incidente, não depois.',
                },
            ],
            questions: [
                {
                    statement: "Por que o setpoint do rádio vai numa caixa postal com overwrite?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só o valor mais recente interessa ao controle",
                            isCorrect: true,
                        },
                        {
                            text: "Porque overwrite economiza RAM de forma geral",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o rádio transmite mais rápido que a IMU",
                            isCorrect: false,
                        },
                        {
                            text: "Porque filas comuns não aceitam structs grandes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que comandos de missão NÃO usam overwrite?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Comando não pode se perder nem ser sobrescrito",
                            isCorrect: true,
                        },
                        {
                            text: "Overwrite dobraria o consumo de energia do rádio",
                            isCorrect: false,
                        },
                        {
                            text: "O rádio exige confirmação antes de aceitar o próximo",
                            isCorrect: false,
                        },
                        {
                            text: "Comandos são maiores que o limite das caixas postais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual conta dimensiona a fila da IMU pro controle em 8 posições?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Duas amostras por ciclo de consumo, com margem de 4x",
                            isCorrect: true,
                        },
                        {
                            text: "Oito é o limite máximo de uma fila no FreeRTOS padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Uma posição por tarefa criada no firmware do drone",
                            isCorrect: false,
                        },
                        {
                            text: "Oito bytes é o tamanho de cada amostra da IMU usada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O produtor de comandos de missão encontra a fila cheia. O que ele faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Espera com timeout limitado e conta se estourar",
                            isCorrect: true,
                        },
                        {
                            text: "Descarta o comando novo sem registrar o evento",
                            isCorrect: false,
                        },
                        {
                            text: "Sobrescreve o comando mais antigo pra abrir espaço",
                            isCorrect: false,
                        },
                        {
                            text: "Reseta a fila inteira e reenvia todos os comandos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a frase de dimensionamento de uma fila precisa declarar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A rajada tolerada e a pausa máxima do consumidor",
                            isCorrect: true,
                        },
                        {
                            text: "O nome da tarefa e a linha onde a fila é criada",
                            isCorrect: false,
                        },
                        {
                            text: "A versão do kernel e a licença da distribuição",
                            isCorrect: false,
                        },
                        {
                            text: "O clock da CPU e o tamanho da flash do produto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Proteção: watchdog e modos de falha",
            blocks: [
                {
                    type: "text",
                    value: "# O drone que sabe falhar\n\nAgora o módulo 5 vira projeto. O watchdog de HARDWARE fica em 100 milissegundos, alimentado pelo housekeeping, e só quando as tarefas críticas provaram vida: controle, rádio e navegação dão check-in a cada ciclo saudável; faltou uma, o housekeeping não alimenta e o hardware reseta. Nada de alimentar em ISR de timer: a lição da Toyota está paga.\n\nO CONTROLE ainda se vigia sozinho: mede o próprio ciclo com o contador de ciclos e mantém um contador de deadline miss. Estouro isolado vira evento no log; estouros repetidos numa janela curta acionam o modo seguro, porque malha que atrasa em sequência é drone caindo em câmera lenta.\n\nO housekeeping completa a ronda a 1 Hz: high-water de todos os stacks (limiar de alarme, evento grave se raspar), contadores de descarte das filas, tensão da bateria sob carga, temperatura dos drivers.\n\nE os MODOS DE FALHA, decididos agora, no papel: perda de rádio por 500 milissegundos, o drone paira; aos 5 segundos, pouso controlado com taxa de descida limitada. Bateria crítica: pouso imediato. Desligar motores em voo NÃO é opção em falha nenhuma: o estado seguro de um drone é o chão, alcançado devagar.",
                },
                {
                    type: "table",
                    value: '[["Falha","Detecção","Reação"],["Tarefa crítica travada","Check-in ausente no ciclo do watchdog","Reset e partida em estado seguro"],["Estouro de prazo no controle","Contador de deadline miss na janela","Registrar; no limite, modo seguro"],["Perda de rádio","Timeout de 500 ms sem quadro válido","Pairar; aos 5 s, pouso controlado"],["Bateria crítica","Tensão sob carga abaixo do piso","Pouso controlado imediato"],["Stack raspando o limite","High-water abaixo do limiar no housekeeping","Evento grave; revisão em solo"]]',
                },
                {
                    type: "quote",
                    value: "Proteção que nunca foi testada com falha injetada é decoração: derrube o rádio de propósito, mate uma tarefa, e veja o drone decidir.",
                },
                {
                    type: "text",
                    value: '## O reset no ar e o ensaio no chão\n\nFalta encarar a pergunta desconfortável: e se o watchdog resetar EM VOO? O boot precisa saber que estava voando. Na inicialização, o firmware lê o registrador de causa do reset e uma flag de "armado" persistida em memória que sobrevive ao reset (RAM de backup). Reset por watchdog com flag de armado: nada de autoteste completo e calibrações; o firmware entra direto num modo de descida de emergência, com a malha mínima estabilizando e descendo. São os piores segundos da vida do produto, e o caminho até eles se escreve com antecedência. Resets em tempestade (três num minuto) travam no modo mais seguro disponível: insistir em voar com defeito persistente é a decisão errada.\n\nE o ENSAIO: cada linha da tabela de falhas vira um teste de chão, com hélices removidas e o drone preso na bancada. Desligue o rádio no cronômetro e confira o pairar aos 500 milissegundos e a descida aos 5 segundos. Mate uma tarefa de propósito (o build de teste tem um comando pra isso) e confira o reset e o boot em modo seguro. Force a tensão de bateria no simulador e veja o pouso. Cada transição observada, com o log de eventos gravando a sequência como testemunha. Código de proteção é o menos executado e o mais importante do produto: é nele que o teste artificial é obrigação.',
                },
            ],
            questions: [
                {
                    statement: "Quando o housekeeping do drone alimenta o watchdog?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só quando todas as tarefas críticas deram check-in",
                            isCorrect: true,
                        },
                        {
                            text: "A cada 50 ms, incondicionalmente, por segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Sempre que a telemetria envia um pacote completo",
                            isCorrect: false,
                        },
                        {
                            text: "Quando o operador confirma pelo rádio a cada minuto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o controle faz ao detectar estouro do próprio prazo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Registra e conta; no limite, aciona o modo seguro",
                            isCorrect: true,
                        },
                        {
                            text: "Ignora, porque um estouro isolado nunca importa",
                            isCorrect: false,
                        },
                        {
                            text: "Desliga os motores imediatamente por precaução",
                            isCorrect: false,
                        },
                        {
                            text: "Aumenta a própria prioridade acima do watchdog",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Perda de rádio por mais de 5 segundos leva a quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pouso controlado com taxa de descida limitada",
                            isCorrect: true,
                        },
                        {
                            text: "Desligamento dos motores pra poupar a bateria",
                            isCorrect: false,
                        },
                        {
                            text: "Aumento da altitude pra recuperar o sinal do link",
                            isCorrect: false,
                        },
                        {
                            text: "Reset do watchdog e reinício da missão do zero",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que persistir a flag de armado em memória que sobrevive ao reset?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra decidir descida de emergência se resetar no ar",
                            isCorrect: true,
                        },
                        {
                            text: "Pra restaurar o plano de voo completo após o boot",
                            isCorrect: false,
                        },
                        {
                            text: "Pra evitar novo pareamento do rádio com a base",
                            isCorrect: false,
                        },
                        {
                            text: "Pra manter o log de telemetria em ordem cronológica",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como validar os modos de falha antes do primeiro voo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Injetando cada falha no chão e observando a reação",
                            isCorrect: true,
                        },
                        {
                            text: "Rodando o sistema por uma semana sem nenhum erro",
                            isCorrect: false,
                        },
                        {
                            text: "Revisando o código das proteções em dupla no PR",
                            isCorrect: false,
                        },
                        {
                            text: "Simulando apenas a falha mais provável do conjunto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: o checklist de tempo real",
            blocks: [
                {
                    type: "text",
                    value: "# O projeto inteiro numa página\n\nOlhe o que o drone virou: uma tabela de deadlines com classes (módulo 1), uma ISR curta e cinco tarefas sobre um RTOS (módulo 2), prioridades pelo RMS com utilização conferida no teste (módulo 3), filas, rings e caixa postal dimensionados por conta, sem um malloc no caminho crítico (módulos 4 e 6), WCET medido com margem, watchdog alimentado por saúde real e modos de falha ensaiados no chão (módulo 5). Nenhuma peça exótica: cada decisão veio de um princípio que você agora conhece pelo nome.\n\nEsse é o segredo aberto da área: sistemas de tempo real confiáveis não nascem de genialidade, nascem de MÉTODO. As mesmas dez perguntas, feitas com disciplina, no começo e durante o projeto. Por isso o fechamento desta trilha não é um resumo, é uma ferramenta: o checklist abaixo, pronto pra ser colado na parede do seu próximo firmware, seja um drone, um inversor, uma bomba de infusão ou um sintetizador.\n\nPasse o olho linha a linha com o drone na cabeça: você vai reconhecer de qual aula cada pergunta saiu, e vai notar que nenhuma exige ferramenta cara: exigem número escrito, decisão com dono e teste que provoca.",
                },
                {
                    type: "table",
                    value: '[["Item do checklist","A pergunta que precisa de sim"],["1. Deadlines escritos","Cada função tem prazo, classe e consequência anotados?"],["2. Pior caso, não média","O WCET de cada tarefa foi medido com estímulos e tem margem?"],["3. Sem malloc no crítico","O caminho crítico vive de pools, rings e alocação estática?"],["4. Prioridades justificadas","RMS aplicado, com empates decididos por consequência?"],["5. Utilização conferida","A soma dos C/T passa no teste, com a folga anotada?"],["6. ISRs mínimas","Toda ISR captura, sinaliza e sai, com duração medida?"],["7. Filas com conta","Cada tamanho declara rajada, pausa e política de cheia?"],["8. Stacks medidos","High-water marks monitorados, com limiar de alarme?"],["9. Watchdog honesto","Alimentado por check-in de saúde real, nunca por timer cego?"],["10. Falhas ensaiadas","Modos de falha escritos, cada um injetado e observado?"]]',
                },
                {
                    type: "quote",
                    value: "Previsível não é o sistema que nunca surpreende o mundo: é o sistema que nunca é surpreendido por ele.",
                },
                {
                    type: "text",
                    value: '## O que você leva daqui\n\nAcima de tudo, um critério: pior caso vale mais que média, previsível vale mais que rápido, e todo número de tempo merece origem, margem e monitor. É um jeito de olhar sistemas que muda até como você lê código que nunca vai rodar num microcontrolador.\n\nPra transformar critério em calo, o caminho é encostar a mão: uma placa barata da classe ESP32 ou STM32, o FreeRTOS ou o Zephyr, um osciloscópio modesto ou analisador lógico de dez dólares, e um projeto pequeno com prazo de verdade: um datalogger que não perde amostra, um controle de temperatura, um mini sequenciador de áudio. Meça tudo o que esta trilha mandou medir: a duração das suas ISRs, o jitter da sua tarefa periódica, os high-water marks. Os números vão te contar histórias que nenhum texto conta.\n\nE leia os clássicos quando quiser profundidade: o artigo de Liu e Layland de 1973, os relatórios públicos do Ariane 5 e do Pathfinder, as regras de código do JPL. São curtos, são gratuitos e envelheceram melhor que muito framework.\n\nO checklist é seu. Da próxima vez que alguém disser que o sistema "roda de boa", você vai sorrir e perguntar pelo percentil 100. Bons projetos, e bons piores casos.',
                },
            ],
            questions: [
                {
                    statement: "O que o checklist cobra sobre deadlines?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Escritos com número, classe e consequência de estouro",
                            isCorrect: true,
                        },
                        {
                            text: "Aprovados na homologação do fornecedor do chip usado",
                            isCorrect: false,
                        },
                        {
                            text: "Sempre menores que 1 ms em todas as funções do produto",
                            isCorrect: false,
                        },
                        {
                            text: "Definidos iguais entre si pra simplificar o escalonador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual item do checklist trata a memória do caminho crítico?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Viver de pools, rings e alocação estática, sem malloc",
                            isCorrect: true,
                        },
                        {
                            text: "Usar heap com coleta de lixo em prioridade baixa",
                            isCorrect: false,
                        },
                        {
                            text: "Dobrar a RAM reservada a cada nova versão de firmware",
                            isCorrect: false,
                        },
                        {
                            text: "Manter o heap sempre abaixo de dez por cento de uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o checklist exige empates de prioridade decididos por consequência?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pra ordem virar decisão registrada, não acidente",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o RTOS proíbe prioridades repetidas no build",
                            isCorrect: false,
                        },
                        {
                            text: "Pra reduzir o número total de tarefas do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Porque consequência define o tamanho dos stacks",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa watchdog honesto no checklist?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Alimentado por check-in de saúde real das tarefas",
                            isCorrect: true,
                        },
                        {
                            text: "Configurado com o maior timeout que o chip aceita",
                            isCorrect: false,
                        },
                        {
                            text: "Alimentado por um timer dedicado de alta prioridade",
                            isCorrect: false,
                        },
                        {
                            text: "Desativado durante as fases críticas da operação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o espírito do item falhas ensaiadas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada modo de falha foi injetado e observado no chão",
                            isCorrect: true,
                        },
                        {
                            text: "O sistema nunca vai falhar depois da certificação",
                            isCorrect: false,
                        },
                        {
                            text: "Só a falha mais provável precisa de teste dedicado",
                            isCorrect: false,
                        },
                        {
                            text: "Falhas raras dispensam reação definida em projeto",
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
