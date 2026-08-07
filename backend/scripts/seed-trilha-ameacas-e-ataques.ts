// Seed da trilha Ameaças e Ataques na Prática, estagio 4 do roadmap de Seguranca
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-ameacas-e-ataques.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Ameaças e Ataques na Prática";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Como um ataque acontece de verdade, do primeiro e-mail à exfiltração: a kill chain, as técnicas catalogadas no MITRE ATT&CK, engenharia social que funciona porque explora gente e não software, as famílias de malware, o negócio por trás do ransomware e o que cada etapa deixa de rastro para quem defende.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Como um ataque acontece",
    aulas: [
        {
            titulo: "A anatomia de um ataque",
            blocks: [
                {
                    type: "text",
                    value: "# Ataque não é um evento, é uma campanha\n\nFilme de hacker mostra alguém digitando rápido e derrubando um banco em trinta segundos. A realidade é quase o oposto: um ataque sério é uma campanha que dura semanas ou meses, feita de etapas pacientes, e quase sempre começa com algo sem graça, como um e-mail bem escrito.\n\nPense no invasor como alguém que quer roubar uma empresa e não tem a chave. Ele não arromba a porta da frente com um aríete. Ele passa dias observando quem entra e sai, descobre que o porteiro do turno da noite é novo, liga fingindo ser do suporte técnico e pede para ser cadastrado. Depois entra andando, com crachá.\n\nEssa diferença entre o mito e a prática importa para quem defende. Se você espera um evento único e barulhento, vai procurar a coisa errada. Ataque real é uma sequência de passos discretos, e cada passo deixa um rastro pequeno. A defesa moderna vive de juntar esses rastros pequenos, não de esperar o alarme tocar.",
                },
                {
                    type: "text",
                    value: '## As etapas que quase todo ataque repete\n\nIndependente de o invasor ser um adolescente entediado ou um grupo pago por um governo, a sequência costuma ser a mesma. Primeiro ele estuda o alvo. Depois consegue entrar de alguma forma. Uma vez dentro, garante que consegue voltar, aumenta o poder que tem, caminha para onde estão as coisas valiosas e, por fim, faz o que veio fazer.\n\nO tempo entre entrar e ser percebido tem nome no mercado: dwell time, ou tempo de permanência. Ele caiu muito na última década, de meses para algo em torno de duas a três semanas na média global, mas continua sendo tempo mais que suficiente para o invasor fazer tudo o que planejou.\n\nRepare que "conseguir entrar" é apenas o segundo passo de seis. A indústria gastou anos obcecada em impedir a entrada, e é por isso que a defesa que só olha o perímetro falha: quando o invasor passa, ele tem o campo livre.',
                },
                {
                    type: "table",
                    value: '[["Etapa","O que o invasor faz","Rastro que costuma deixar"],["Reconhecimento","Estuda pessoas, domínios e serviços expostos","Acessos incomuns a páginas públicas"],["Acesso inicial","Entra por phishing, senha vazada ou falha exposta","Login de origem estranha, anexo aberto"],["Persistência","Garante que consegue voltar amanhã","Tarefa agendada ou usuário novo"],["Escalonamento","Vira administrador","Uso de conta privilegiada fora do padrão"],["Movimentação","Caminha até onde está o valor","Conexões entre máquinas que nunca se falam"],["Ação final","Rouba, criptografa ou destrói","Volume alto de leitura e saída de dados"]]',
                },
                {
                    type: "quote",
                    value: "Impedir a entrada é importante, mas é só um dos seis passos. Quem defende olhando apenas o perímetro entrega o resto do caminho de graça.",
                },
                {
                    type: "text",
                    value: "## Por que essa sequência é uma boa notícia\n\nSe o ataque fosse instantâneo, defender seria impossível. Como ele é uma sequência, cada etapa é uma chance de interromper. O invasor precisa acertar todos os passos; quem defende precisa acertar um só.\n\nÉ daí que vem a ideia de defesa em profundidade, que você vai encontrar o resto da carreira inteira: várias camadas independentes, de forma que falhar em uma não signifique perder tudo. O e-mail malicioso passou pelo filtro? O antivírus ainda pode pegar. Passou também? O monitoramento de rede ainda pode estranhar a conexão de saída.\n\nNo restante desta trilha você vai percorrer essas etapas uma a uma, entendendo o que o invasor faz e, principalmente, que sinal ele deixa. Entender o ataque não é curiosidade mórbida: é a única forma honesta de saber o que procurar.",
                },
            ],
            questions: [
                {
                    statement: "O que melhor descreve um ataque cibernético sério na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uma campanha em etapas que dura semanas ou meses",
                            isCorrect: true,
                        },
                        {
                            text: "Um evento único e barulhento que dura poucos minutos",
                            isCorrect: false,
                        },
                        {
                            text: "Uma falha acidental de configuração do próprio servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Um programa automático que age sem nenhum plano prévio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que significa dwell time no contexto de um incidente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O tempo entre o invasor entrar e alguém perceber",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo que a equipe leva para restaurar os backups",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo que o invasor gasta estudando o alvo antes",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo de indisponibilidade sofrido pelos usuários",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que defender apenas o perímetro da rede é considerado insuficiente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O acesso inicial é só uma das seis etapas do ataque",
                            isCorrect: true,
                        },
                        {
                            text: "O perímetro moderno bloqueia somente tráfego já cifrado",
                            isCorrect: false,
                        },
                        {
                            text: "As ferramentas de perímetro exigem atualização diária",
                            isCorrect: false,
                        },
                        {
                            text: "A maioria dos ataques começa dentro da própria empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma máquina do setor financeiro passa a abrir conexões para servidores de outros setores com os quais nunca se comunicou. Qual etapa isso mais sugere?",
                    difficulty: "dificil",
                    options: [
                        { text: "Movimentação lateral em busca do que tem valor", isCorrect: true },
                        {
                            text: "Reconhecimento inicial feito de fora da empresa",
                            isCorrect: false,
                        },
                        { text: "Exfiltração do volume final de dados roubados", isCorrect: false },
                        {
                            text: "Escalonamento de privilégio na estação de origem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a ideia central da defesa em profundidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Camadas independentes, para que uma falha não perca tudo",
                            isCorrect: true,
                        },
                        {
                            text: "Concentrar todo o investimento na melhor ferramenta única",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar todos os eventos e revisar o log uma vez ao mês",
                            isCorrect: false,
                        },
                        {
                            text: "Separar a rede interna da internet por um único firewall",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A Cyber Kill Chain",
            blocks: [
                {
                    type: "text",
                    value: "# O modelo que deu nome às etapas\n\nEm 2011 a Lockheed Martin publicou um trabalho que pegou emprestado um conceito militar, a cadeia de destruição, e aplicou a ataques de computador. A ideia era simples e poderosa: se o ataque é uma cadeia de elos, quebrar qualquer elo interrompe o ataque inteiro. O modelo virou a Cyber Kill Chain e organizou o vocabulário da área.\n\nSão sete fases, na ordem: reconhecimento, armamento, entrega, exploração, instalação, comando e controle, e ações sobre o objetivo. Cada uma tem um significado bem delimitado, e vale aprender a sequência porque ela aparece em relatório de incidente, em entrevista de emprego e em conversa com o time de resposta.\n\nO ponto de virada trazido pelo modelo foi de mentalidade. Antes dele, a defesa media sucesso por quantos malwares o antivírus bloqueou. Depois dele, a pergunta passou a ser em qual fase conseguimos interromper, e o quanto isso custa para o invasor.",
                },
                {
                    type: "table",
                    value: '[["Fase","O que acontece","Exemplo concreto"],["Reconhecimento","Estudo do alvo","Levantar quem é o gerente financeiro no LinkedIn"],["Armamento","Prepara o artefato","Montar um documento com macro maliciosa"],["Entrega","Faz o artefato chegar","Enviar o documento por e-mail"],["Exploração","Dispara a falha ou o engano","A macro roda quando a vítima habilita a edição"],["Instalação","Planta o acesso duradouro","Implante gravado na inicialização do sistema"],["Comando e controle","Abre o canal com o invasor","A máquina passa a consultar um servidor externo"],["Ações sobre o objetivo","Faz o que veio fazer","Copia a base de clientes para fora"]]',
                },
                {
                    type: "quote",
                    value: "O valor da kill chain não é decorar sete nomes: é lembrar que interromper cedo custa pouco, e interromper tarde custa uma resposta a incidente inteira.",
                },
                {
                    type: "text",
                    value: "## As críticas, que também importam\n\nO modelo tem quinze anos e envelheceu em alguns pontos. A crítica mais forte é que ele nasceu centrado em malware entregue por e-mail, e hoje boa parte dos ataques nem usa malware: o invasor entra com credencial válida comprada, e a partir daí só usa ferramentas que já existem na máquina. Nesse cenário, as fases de armamento e instalação simplesmente não acontecem.\n\nA segunda crítica é o excesso de linearidade. O modelo sugere uma marcha ordenada, e ataque real vai e volta: o invasor entra, falha, tenta outro caminho, encontra uma terceira máquina e recomeça o ciclo ali dentro. Também não cobre bem ameaça interna, já que um funcionário insatisfeito pula direto para a última fase.\n\nNada disso invalida o modelo, apenas define onde ele serve. Para narrar um ataque e decidir onde investir defesa, a kill chain continua ótima. Para catalogar comportamento em detalhe, a área passou a usar outro instrumento, que é o assunto da próxima aula.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ideia central por trás da Cyber Kill Chain?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Quebrar um elo da cadeia interrompe o ataque inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "Bloquear todo malware conhecido antes que ele execute",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar cada evento da rede para auditar depois",
                            isCorrect: false,
                        },
                        {
                            text: "Isolar a rede interna de qualquer acesso pela internet",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na Cyber Kill Chain, o que caracteriza a fase de armamento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Preparar o artefato que será usado contra o alvo",
                            isCorrect: true,
                        },
                        {
                            text: "Levantar nomes e cargos dos funcionários do alvo",
                            isCorrect: false,
                        },
                        { text: "Fazer o artefato chegar até a caixa da vítima", isCorrect: false },
                        {
                            text: "Abrir o canal de comunicação com o servidor externo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a principal limitação da Cyber Kill Chain diante dos ataques atuais?",
                    difficulty: "dificil",
                    options: [
                        { text: "Nasceu centrada em malware entregue por e-mail", isCorrect: true },
                        { text: "Descreve fases demais para um incidente comum", isCorrect: false },
                        {
                            text: "Só funciona em ambientes que já usam nuvem pública",
                            isCorrect: false,
                        },
                        {
                            text: "Exige ferramentas pagas para ser aplicada na empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um invasor compra credenciais válidas e opera usando apenas ferramentas nativas do sistema. Que fases da kill chain tendem a não ocorrer?",
                    difficulty: "medio",
                    options: [
                        { text: "Armamento e instalação, porque não há artefato", isCorrect: true },
                        {
                            text: "Entrega e exploração, porque não há e-mail no meio",
                            isCorrect: false,
                        },
                        {
                            text: "Reconhecimento e entrega, porque o acesso foi comprado",
                            isCorrect: false,
                        },
                        {
                            text: "Comando e controle, porque a conta já é legítima",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a kill chain lida mal com o cenário de ameaça interna?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O funcionário já começa na fase do objetivo final",
                            isCorrect: true,
                        },
                        {
                            text: "O modelo exige um servidor de controle externo",
                            isCorrect: false,
                        },
                        {
                            text: "As sete fases só valem para ataques automatizados",
                            isCorrect: false,
                        },
                        {
                            text: "A empresa não registra as ações de quem é confiável",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "MITRE ATT&CK: o catálogo do comportamento",
            blocks: [
                {
                    type: "text",
                    value: "# Se a kill chain é o enredo, o ATT&CK é o dicionário\n\nO MITRE ATT&CK é uma base de conhecimento pública que cataloga o que invasores realmente fazem, observado em incidentes reais. Onde a kill chain dá sete fases largas, o ATT&CK desce ao detalhe: centenas de técnicas nomeadas, cada uma com identificador, descrição, exemplos de grupos que a usaram e, o que mais interessa a você, sugestões de detecção e mitigação.\n\nA estrutura tem três níveis que você precisa separar bem. Tática é o objetivo do invasor naquele momento, o porquê: conseguir persistência, escalar privilégio, evadir defesa. Técnica é a maneira de alcançar aquele objetivo, o como: criar uma tarefa agendada, abusar de um serviço do sistema. Procedimento é a implementação concreta que um grupo específico usou.\n\nA sigla TTP, que você vai ver em todo relatório de ameaça, é exatamente isso: táticas, técnicas e procedimentos. Falar em TTP de um grupo é falar do jeito característico dele trabalhar, que é bem mais estável do que o endereço de servidor que ele usou na semana passada.",
                },
                {
                    type: "table",
                    value: '[["Nível","Pergunta que responde","Exemplo"],["Tática","Por que o invasor faz isso agora","Persistência"],["Técnica","De que forma ele consegue isso","Tarefa agendada ou job programado"],["Subtécnica","Qual variação exata","Tarefa agendada do Windows"],["Procedimento","Como um grupo fez na prática","Grupo X criou tarefa diária às 3h chamando script"]]',
                },
                {
                    type: "text",
                    value: '## Para que isso serve no seu dia a dia\n\nO uso mais direto é falar a mesma língua. Quando um relatório diz que o grupo usou T1053 para persistir, qualquer analista do mundo entende sem ambiguidade, e a empresa consegue perguntar objetivamente: nós detectamos T1053?\n\nO segundo uso é análise de lacuna. Você lista as técnicas mais relevantes para o seu setor, marca quais o seu monitoramento detecta hoje e enxerga o buraco. É bem diferente de "temos antivírus e firewall", porque vira um mapa com cores em vez de uma sensação.\n\nO terceiro uso é priorizar. Nenhuma empresa detecta tudo, então você começa pelas técnicas que aparecem em mais campanhas contra o seu ramo. Vale um cuidado aqui: o ATT&CK cataloga o que já foi observado, não o que existe. Ele é um mapa excelente do território conhecido, não uma lista completa do possível.',
                },
                {
                    type: "quote",
                    value: "Endereço de servidor e hash de arquivo o invasor troca numa tarde. O jeito dele trabalhar, não. Por isso detecção baseada em comportamento envelhece melhor.",
                },
            ],
            questions: [
                {
                    statement: "No MITRE ATT&CK, o que uma tática representa?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O objetivo do invasor naquele momento do ataque",
                            isCorrect: true,
                        },
                        {
                            text: "A ferramenta específica usada para invadir a máquina",
                            isCorrect: false,
                        },
                        {
                            text: "O comando exato que um grupo executou no terminal",
                            isCorrect: false,
                        },
                        {
                            text: "A vulnerabilidade explorada para obter o acesso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre técnica e procedimento no ATT&CK?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Técnica é a forma geral; procedimento é o uso concreto",
                            isCorrect: true,
                        },
                        {
                            text: "Técnica é sempre manual; procedimento é sempre automático",
                            isCorrect: false,
                        },
                        {
                            text: "Técnica descreve a defesa; procedimento descreve o ataque",
                            isCorrect: false,
                        },
                        {
                            text: "Técnica vale para rede; procedimento vale para o endpoint",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a sigla TTP designa em um relatório de ameaça?",
                    difficulty: "facil",
                    options: [
                        { text: "Táticas, técnicas e procedimentos de um grupo", isCorrect: true },
                        {
                            text: "Testes técnicos de penetração feitos no ambiente",
                            isCorrect: false,
                        },
                        { text: "Tempo total de permanência do invasor na rede", isCorrect: false },
                        {
                            text: "Tabela de tratamento prioritário de vulnerabilidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que detecção baseada em comportamento tende a durar mais que detecção por indicador?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trocar de servidor é fácil, mudar de método não é",
                            isCorrect: true,
                        },
                        {
                            text: "Indicadores só funcionam em ambientes com nuvem",
                            isCorrect: false,
                        },
                        {
                            text: "Comportamento é registrado por padrão em todo sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Indicadores exigem licença paga de inteligência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual limitação honesta do MITRE ATT&CK vale ter em mente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cataloga o que já foi observado, não tudo que existe",
                            isCorrect: true,
                        },
                        {
                            text: "Cobre apenas ataques contra sistemas operacionais Windows",
                            isCorrect: false,
                        },
                        {
                            text: "Descreve técnicas sem oferecer qualquer sugestão de defesa",
                            isCorrect: false,
                        },
                        {
                            text: "Precisa ser licenciado junto com uma ferramenta comercial",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Quem ataca e por quê",
            blocks: [
                {
                    type: "text",
                    value: "# Motivação prevê comportamento\n\nSaber quem provavelmente vai te atacar muda tudo: o que você protege primeiro, quanto tempo espera de campanha e até como responde. Um adolescente testando ferramenta e um grupo patrocinado por um Estado deixam rastros muito diferentes e exigem respostas muito diferentes.\n\nO erro comum de quem começa é imaginar que todo ataque é sofisticado. A maioria esmagadora não é: são campanhas oportunistas, automatizadas, que varrem a internet inteira procurando quem esqueceu de atualizar. Você não foi escolhido, você foi encontrado.\n\nDo outro lado da escala está o ataque dirigido, em que alguém decidiu que quer especificamente a sua empresa. Aí o orçamento é outro, a paciência é outra, e a defesa precisa assumir que o invasor vai insistir depois de falhar.",
                },
                {
                    type: "table",
                    value: '[["Perfil","O que quer","Como costuma agir"],["Oportunista","Qualquer alvo fácil","Varredura automatizada em massa"],["Cibercriminoso","Dinheiro","Ransomware, fraude e revenda de acesso"],["Hacktivista","Visibilidade para uma causa","Pichação de site e vazamento público"],["Ameaça interna","Vingança ou ganho pessoal","Usa o acesso que já tem, sem invadir nada"],["Patrocinado por Estado","Espionagem e influência","Campanha longa, discreta e bem financiada"]]',
                },
                {
                    type: "text",
                    value: "## O que é uma APT, de verdade\n\nA sigla APT significa ameaça persistente avançada, e virou jargão de marketing, então vale desmontar palavra por palavra. Avançada não quer dizer que use sempre técnica exótica: muitos grupos de elite entram por phishing comum, porque funciona. Persistente é a parte que mais define: o grupo tem um objetivo e continua tentando por meses depois de falhar. Ameaça lembra que existe um humano decidindo, não um script.\n\nEssa persistência muda a defesa. Contra o oportunista, corrigir a falha resolve, porque ele vai procurar alvo mais fácil. Contra o grupo persistente, corrigir a falha só faz ele tentar outra porta, e a pergunta passa a ser se você consegue perceber a próxima tentativa.\n\nUm cuidado profissional: atribuir um ataque a um grupo ou a um país é difícil e frequentemente errado. Invasores plantam pistas falsas de propósito, usam infraestrutura de terceiros e copiam o estilo uns dos outros. Atribuição séria leva meses e junta muito mais do que dados técnicos. Analista júnior não atribui; analista júnior descreve o que observou.",
                },
                {
                    type: "quote",
                    value: "Na maioria dos incidentes você não foi escolhido, foi encontrado por uma varredura automática. Isso não torna o prejuízo menor, mas muda como você se prepara.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um ataque oportunista?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Varredura automatizada buscando qualquer alvo fácil",
                            isCorrect: true,
                        },
                        {
                            text: "Campanha longa dirigida a uma empresa específica",
                            isCorrect: false,
                        },
                        {
                            text: "Ação de um funcionário usando o acesso que já tem",
                            isCorrect: false,
                        },
                        {
                            text: "Vazamento público de dados para promover uma causa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Na sigla APT, o que a palavra persistente indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O grupo continua tentando por meses após falhar",
                            isCorrect: true,
                        },
                        {
                            text: "O malware permanece gravado na inicialização do sistema",
                            isCorrect: false,
                        },
                        {
                            text: "A técnica usada nunca muda ao longo da campanha",
                            isCorrect: false,
                        },
                        {
                            text: "O ataque só ocorre em horários fora do expediente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que atribuir um ataque a um grupo específico é arriscado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Invasores plantam pistas falsas e copiam uns aos outros",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas de análise não registram o endereço de origem",
                            isCorrect: false,
                        },
                        {
                            text: "A legislação brasileira proíbe nomear grupos em relatório",
                            isCorrect: false,
                        },
                        {
                            text: "Os grupos trocam de nome a cada campanha que executam",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Corrigir a falha explorada resolve o problema contra qual tipo de invasor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O oportunista, que segue para um alvo mais fácil",
                            isCorrect: true,
                        },
                        {
                            text: "O grupo persistente, que abandona o alvo corrigido",
                            isCorrect: false,
                        },
                        {
                            text: "A ameaça interna, que perde o acesso ao ser corrigida",
                            isCorrect: false,
                        },
                        {
                            text: "O hacktivista, que só age contra sistemas vulneráveis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna a ameaça interna diferente das demais?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela usa um acesso legítimo, sem precisar invadir",
                            isCorrect: true,
                        },
                        {
                            text: "Ela depende de malware comprado no mercado ilegal",
                            isCorrect: false,
                        },
                        {
                            text: "Ela sempre busca visibilidade pública para uma causa",
                            isCorrect: false,
                        },
                        {
                            text: "Ela só consegue agir a partir de fora da rede interna",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Superfície de ataque e vetor inicial",
            blocks: [
                {
                    type: "text",
                    value: "# Tudo que pode ser alcançado é superfície\n\nSuperfície de ataque é o conjunto de tudo que um invasor consegue tocar: cada serviço publicado na internet, cada aplicação web, cada API, cada conta de usuário, cada notebook que sai da empresa e cada fornecedor com acesso ao seu ambiente. Quanto maior essa superfície, mais portas alguém precisa vigiar.\n\nA superfície cresce sozinha, e é isso que a torna perigosa. Alguém sobe um ambiente de teste para uma demonstração e esquece ligado. Um time contrata uma ferramenta nova sem avisar a segurança. Um servidor antigo continua respondendo anos depois de o sistema ter sido substituído. Esse acúmulo tem nome: shadow IT, a tecnologia que existe sem estar no mapa.\n\nO trabalho de reduzir superfície é menos glamouroso e mais eficaz do que quase tudo. Desligar o que não é usado, fechar a porta que ninguém precisa e remover a conta de quem saiu da empresa elimina classes inteiras de ataque sem comprar nada.",
                },
                {
                    type: "text",
                    value: "## Vetor inicial: por onde eles realmente entram\n\nVetor inicial é a porta específica por onde o invasor entrou. Os relatórios anuais de investigação de incidentes vêm repetindo o mesmo pódio há anos, e ele é bem menos exótico do que a imaginação sugere.\n\nO primeiro lugar alterna entre credencial válida e phishing. Credencial válida é o cenário em que ninguém invadiu nada: o invasor entrou com usuário e senha corretos, obtidos em vazamento, comprados ou reutilizados de outro serviço. O terceiro lugar costuma ser a exploração de aplicação exposta na internet que não foi corrigida.\n\nA leitura prática disso é dura para quem gosta de tecnologia sofisticada. As três medidas que mais reduzem risco são autenticação em dois fatores bem implementada, correção rápida do que está exposto e um inventário honesto do que existe. Nenhuma delas é empolgante, e as três valem mais que qualquer ferramenta cara.",
                },
                {
                    type: "table",
                    value: '[["Vetor inicial","Como se parece","Medida que mais reduz"],["Credencial válida","Login correto de origem incomum","Dois fatores resistente a phishing"],["Phishing","E-mail convincente com link ou anexo","Filtro, treino e dois fatores"],["Aplicação exposta","Serviço público sem correção aplicada","Inventário e correção rápida"],["Fornecedor comprometido","Acesso legítimo de terceiro usado por outro","Acesso mínimo e revisão periódica"],["Dispositivo perdido","Notebook fora da empresa sem cifra","Cifra de disco e bloqueio remoto"]]',
                },
                {
                    type: "quote",
                    value: "Você não consegue defender o que não sabe que tem. Inventário não é burocracia, é a lista dos lugares onde alguém pode entrar sem você olhar.",
                },
            ],
            questions: [
                {
                    statement: "O que compõe a superfície de ataque de uma organização?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tudo que um invasor consegue alcançar de alguma forma",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas os servidores publicados diretamente na internet",
                            isCorrect: false,
                        },
                        {
                            text: "Somente as contas com privilégio de administrador",
                            isCorrect: false,
                        },
                        {
                            text: "O conjunto de falhas já registradas em catálogo público",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o termo shadow IT descreve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tecnologia em uso que não está no mapa da empresa",
                            isCorrect: true,
                        },
                        {
                            text: "Servidores mantidos apenas para cópias de segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Ambiente isolado usado para analisar arquivo suspeito",
                            isCorrect: false,
                        },
                        {
                            text: "Rede paralela criada pelo time de segurança para testes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o vetor inicial de credencial válida?",
                    difficulty: "medio",
                    options: [
                        { text: "O invasor entra com usuário e senha corretos", isCorrect: true },
                        { text: "O invasor explora uma falha da tela de login", isCorrect: false },
                        { text: "O invasor intercepta a sessão já autenticada", isCorrect: false },
                        { text: "O invasor quebra a cifra do banco de senhas", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer reduzir risco sem comprar ferramenta nova. Qual conjunto de medidas tende a render mais?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Dois fatores, correção rápida e inventário honesto",
                            isCorrect: true,
                        },
                        {
                            text: "Antivírus atualizado, senha longa e troca trimestral",
                            isCorrect: false,
                        },
                        {
                            text: "Firewall bem configurado e rede segmentada por setor",
                            isCorrect: false,
                        },
                        {
                            text: "Treinamento anual, política assinada e termo de uso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um inventário atualizado é considerado base de segurança?",
                    difficulty: "facil",
                    options: [
                        { text: "Não se defende o que não se sabe que existe", isCorrect: true },
                        {
                            text: "Ele substitui a necessidade de monitorar a rede",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é exigido por lei para qualquer empresa privada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele reduz o custo das licenças de software usadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Reconhecimento e acesso inicial",
    aulas: [
        {
            titulo: "OSINT: o que a empresa entrega de graça",
            blocks: [
                {
                    type: "text",
                    value: "# A primeira fase não toca no seu servidor\n\nOSINT é inteligência de fontes abertas: reunir informação sobre um alvo usando só o que está publicamente disponível. É a fase mais silenciosa de um ataque, porque em boa parte dela o invasor não encosta na sua infraestrutura. Ele lê o LinkedIn, o site, o repositório público de código, o registro do domínio, as vagas abertas.\n\nAs vagas de emprego são um exemplo desconfortável de quanto se entrega sem perceber. Um anúncio pedindo experiência com uma versão específica de um sistema de gestão informa ao mundo qual sistema roda ali dentro e, muitas vezes, qual versão. O invasor não precisou varrer nada.\n\nO mesmo vale para o formato de e-mail. Se uma pessoa aparece publicamente como nome.sobrenome na empresa, o invasor deduz o endereço de qualquer outro funcionário que encontrar no LinkedIn. Ele acabou de montar a lista de destinatários da campanha de phishing sem enviar um único pacote para a sua rede.",
                },
                {
                    type: "table",
                    value: '[["Fonte aberta","O que costuma revelar","Uso pelo invasor"],["LinkedIn","Nomes, cargos e hierarquia","Escolher alvo e montar pretexto"],["Vagas de emprego","Tecnologias e versões em uso","Saber o que atacar antes de varrer"],["Registro de domínio","Contatos e domínios irmãos","Achar ambientes esquecidos"],["Repositório público","Código, configuração e segredo vazado","Encontrar chave ou senha em commit"],["Certificados públicos","Nomes de subdomínios emitidos","Descobrir ambientes internos expostos"]]',
                },
                {
                    type: "text",
                    value: "## Segredo em repositório é um clássico\n\nUma das colheitas mais fartas do reconhecimento é o código-fonte público. Não porque ler código dê acesso, mas porque desenvolvedores comitam segredo por engano: chave de API, senha de banco, token de serviço. O problema é agravado pelo funcionamento do controle de versão, já que apagar o segredo num commit novo não remove o commit antigo do histórico.\n\nExiste um mercado inteiro de ferramentas que vasculham repositórios públicos atrás desses segredos, minuto a minuto, assim que aparecem. O tempo entre publicar uma chave por engano e ela ser usada por um desconhecido é medido em minutos, não em dias.\n\nA lição defensiva é dupla. Primeiro, varredura automática de segredo antes do commit chegar ao repositório. Segundo, e mais importante: uma vez que o segredo foi publicado, ele está queimado. Não adianta apagar, tem que trocar.",
                },
                {
                    type: "quote",
                    value: "Segredo que apareceu em repositório público não é apagado, é trocado. Remover o arquivo esconde do humano distraído e não esconde do histórico.",
                },
            ],
            questions: [
                {
                    statement: "O que define OSINT dentro de um ataque?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Reunir informação usando apenas fontes públicas",
                            isCorrect: true,
                        },
                        {
                            text: "Varrer portas do alvo para descobrir os serviços",
                            isCorrect: false,
                        },
                        {
                            text: "Interceptar o tráfego de rede entre alvo e servidor",
                            isCorrect: false,
                        },
                        { text: "Testar senhas comuns contra a página de login", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que anúncios de vaga interessam a um invasor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revelam tecnologias e versões usadas na empresa",
                            isCorrect: true,
                        },
                        {
                            text: "Mostram o organograma completo da área técnica",
                            isCorrect: false,
                        },
                        { text: "Contêm o endereço dos servidores de produção", isCorrect: false },
                        {
                            text: "Indicam quando a equipe de segurança tira férias",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um desenvolvedor comitou uma chave de API, percebeu e a removeu no commit seguinte. Qual é a resposta correta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Trocar a chave, porque o histórico ainda a contém",
                            isCorrect: true,
                        },
                        {
                            text: "Manter a chave, já que o arquivo atual está limpo",
                            isCorrect: false,
                        },
                        {
                            text: "Tornar o repositório privado e seguir com a mesma",
                            isCorrect: false,
                        },
                        {
                            text: "Renomear o arquivo para dificultar a busca por texto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o padrão de e-mail da empresa ajuda o invasor?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Permite deduzir o endereço de qualquer funcionário",
                            isCorrect: true,
                        },
                        {
                            text: "Revela a senha usada no primeiro acesso de cada um",
                            isCorrect: false,
                        },
                        {
                            text: "Mostra quais contas têm privilégio administrativo",
                            isCorrect: false,
                        },
                        {
                            text: "Indica qual servidor de correio a empresa utiliza",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a fase de OSINT é difícil de detectar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Boa parte dela não toca a infraestrutura do alvo",
                            isCorrect: true,
                        },
                        {
                            text: "Ela usa tráfego cifrado que o firewall não inspeciona",
                            isCorrect: false,
                        },
                        {
                            text: "Ela ocorre sempre fora do horário comercial da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Ela depende de ferramentas que apagam o próprio registro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Varredura e enumeração",
            blocks: [
                {
                    type: "text",
                    value: "# Da lista de nomes para a lista de portas\n\nDepois de reunir informação pública, o invasor precisa saber o que de fato responde. Varredura é o processo de perguntar a uma faixa de endereços quais portas estão abertas; enumeração é o passo seguinte, em que ele conversa com cada serviço encontrado para descobrir o que é, qual versão e como está configurado.\n\nA diferença entre as duas importa. A varredura responde onde tem porta aberta. A enumeração responde o que tem atrás dela, e é aí que o ataque ganha direção: um serviço de compartilhamento de arquivos com permissão aberta vale muito mais que uma porta anônima.\n\nDo lado de quem defende, esse é o primeiro momento em que o invasor deixa rastro no seu ambiente. Uma varredura de muitas portas em pouco tempo, vinda de uma origem só, é um padrão bem visível em log de firewall. O problema é que a internet inteira é varrida o tempo todo por robôs, então o desafio não é ver a varredura, é separar a que importa.",
                },
                {
                    type: "table",
                    value: '[["Sinal no log","O que costuma indicar","Quanto preocupa"],["Muitas portas, um destino, origem única","Varredura dirigida ao seu ambiente","Alto"],["Uma porta, muitos destinos","Robô procurando alvo na internet","Baixo, é ruído constante"],["Conexões lentas e espaçadas","Varredura tentando passar despercebida","Alto, indica cuidado do invasor"],["Requisição a caminhos administrativos","Enumeração de aplicação web","Médio a alto"],["Consulta a transferência de zona DNS","Tentativa de listar todos os nomes","Alto, se responder"]]',
                },
                {
                    type: "text",
                    value: "## O que o defensor faz com isso\n\nA reação instintiva é bloquear o endereço de origem, e ela é fraca sozinha: trocar de endereço custa centavos para o invasor. O valor real da detecção de varredura é outro, é servir de aviso antecipado. Uma varredura dirigida costuma preceder uma tentativa de exploração, e saber disso permite conferir se o alvo dela está corrigido antes que a tentativa chegue.\n\nA medida estruturalmente melhor é não ter o que responder. Cada porta aberta desnecessária é uma resposta a mais que você dá a quem pergunta. Serviço administrativo não deveria estar acessível pela internet aberta, e sim atrás de acesso restrito.\n\nVale também um lembrete profissional que a próxima trilha vai repetir: varrer redes que não são suas, sem autorização por escrito, é crime no Brasil e na maioria dos países. Nesta trilha você estuda a varredura pelo lado de quem a observa no log, não pelo lado de quem a dispara.",
                },
                {
                    type: "quote",
                    value: "Bloquear o endereço que varreu você custa uma linha de regra para você e um clique para o invasor. Fechar a porta que não precisava estar aberta custa uma vez e vale para sempre.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre varredura e enumeração?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Varredura acha portas; enumeração descobre o serviço",
                            isCorrect: true,
                        },
                        {
                            text: "Varredura é passiva; enumeração é feita sem contato",
                            isCorrect: false,
                        },
                        {
                            text: "Varredura usa DNS; enumeração usa apenas endereços",
                            isCorrect: false,
                        },
                        {
                            text: "Varredura é interna; enumeração ocorre só de fora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No log do firewall, qual padrão sugere varredura dirigida contra o seu ambiente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Muitas portas de um destino, vindas de uma origem",
                            isCorrect: true,
                        },
                        {
                            text: "Uma porta única testada em milhares de destinos",
                            isCorrect: false,
                        },
                        {
                            text: "Tráfego cifrado saindo em horário comercial normal",
                            isCorrect: false,
                        },
                        {
                            text: "Conexões repetidas do mesmo usuário autenticado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que bloquear o endereço de origem da varredura é uma medida fraca?",
                    difficulty: "medio",
                    options: [
                        { text: "Trocar de endereço custa quase nada ao invasor", isCorrect: true },
                        {
                            text: "O bloqueio derruba também usuários legítimos da rede",
                            isCorrect: false,
                        },
                        {
                            text: "O firewall não consegue bloquear origem por endereço",
                            isCorrect: false,
                        },
                        {
                            text: "A varredura já terminou quando o alerta é gerado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o valor defensivo real de detectar uma varredura dirigida?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Servir de aviso antes da tentativa de exploração",
                            isCorrect: true,
                        },
                        {
                            text: "Identificar com precisão o grupo que está por trás",
                            isCorrect: false,
                        },
                        {
                            text: "Impedir que o invasor descubra as portas abertas",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir que o serviço varrido não será explorado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que separar varredura relevante de ruído é difícil?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A internet inteira é varrida por robôs o tempo todo",
                            isCorrect: true,
                        },
                        {
                            text: "O firewall registra apenas as conexões já aceitas",
                            isCorrect: false,
                        },
                        {
                            text: "A varredura sempre usa origem forjada e não rastreável",
                            isCorrect: false,
                        },
                        {
                            text: "As ferramentas de varredura não deixam registro no log",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Credenciais válidas: a porta preferida",
            blocks: [
                {
                    type: "text",
                    value: "# Ninguém invadiu, alguém entrou\n\nO cenário mais comum de acesso inicial hoje não envolve explorar falha nenhuma: o invasor faz login com usuário e senha corretos. Do ponto de vista do sistema, nada de anormal aconteceu, e é justamente isso que torna o caso difícil. Não há exploração para o antivírus pegar nem tráfego estranho para o firewall barrar.\n\nAs senhas chegam ao invasor por três caminhos principais. Vazamento de outro serviço, em que uma loja qualquer foi comprometida e as senhas foram publicadas. Reuso, o hábito de usar a mesma senha do serviço vazado no e-mail corporativo. E o roubo direto por malware que captura o que a vítima digita ou lê o cofre do navegador.\n\nExiste um mercado organizado em torno disso. Grupos que só roubam credenciais vendem acesso pronto para grupos que só operam ransomware. A divisão de trabalho é real e é o que explica a escala.",
                },
                {
                    type: "table",
                    value: '[["Técnica","Como funciona","Sinal característico no log"],["Recheio de credencial","Testa pares vazados de outro serviço","Muitas contas, uma tentativa cada"],["Pulverização de senha","Testa uma senha comum em muitas contas","Falhas espalhadas, sem bloqueio de conta"],["Força bruta","Tenta muitas senhas numa conta","Muitas falhas na mesma conta"],["Roubo por malware","Captura digitação ou cofre do navegador","Login correto de local incomum"],["Compra de acesso","Adquire sessão já ativa de terceiro","Sessão sem evento de autenticação"]]',
                },
                {
                    type: "text",
                    value: "## Por que pulverização é mais perigosa que força bruta\n\nA força bruta clássica ataca uma conta com muitas senhas, e é fácil de barrar: depois de algumas falhas, a conta bloqueia. A pulverização inverte a lógica. O invasor pega uma senha muito provável e a testa uma única vez em milhares de contas diferentes.\n\nO efeito é que nenhuma conta acumula falhas suficientes para bloquear, e o volume total se dilui no ruído normal de gente errando a senha. Sem uma visão agregada, que olhe a taxa de falhas do domínio inteiro em vez de conta por conta, o ataque passa despercebido.\n\nA defesa que resolve a categoria inteira é o segundo fator, e não qualquer um. Código por mensagem de texto ajuda contra vazamento, mas não contra quem engana o usuário em tempo real. O que resiste de verdade é o fator ligado ao dispositivo e ao endereço do site, como chave de segurança e chave de acesso, porque não há o que a vítima possa digitar num site falso.",
                },
                {
                    type: "quote",
                    value: "Contra login com senha correta não existe assinatura de malware para detectar. Sobra o contexto: de onde veio, a que horas, para fazer o quê.",
                },
            ],
            questions: [
                {
                    statement: "Por que o uso de credencial válida é difícil de detectar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para o sistema, o login parece completamente normal",
                            isCorrect: true,
                        },
                        {
                            text: "O acesso ocorre sempre por um canal cifrado e oculto",
                            isCorrect: false,
                        },
                        {
                            text: "O invasor apaga o registro de autenticação depois",
                            isCorrect: false,
                        },
                        {
                            text: "A conta usada costuma pertencer a um administrador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza a pulverização de senha?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma senha provável testada em muitas contas", isCorrect: true },
                        { text: "Muitas senhas testadas contra uma única conta", isCorrect: false },
                        {
                            text: "Pares de e-mail e senha vindos de um vazamento",
                            isCorrect: false,
                        },
                        {
                            text: "Captura da digitação da vítima por um programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a pulverização escapa do bloqueio automático de conta?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nenhuma conta acumula falhas suficientes para bloquear",
                            isCorrect: true,
                        },
                        {
                            text: "O bloqueio só considera tentativas do mesmo endereço",
                            isCorrect: false,
                        },
                        {
                            text: "As tentativas ocorrem fora do horário monitorado",
                            isCorrect: false,
                        },
                        {
                            text: "A senha testada é sempre a correta na primeira vez",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual tipo de segundo fator resiste melhor a um site falso que engana o usuário em tempo real?",
                    difficulty: "medio",
                    options: [
                        { text: "Chave de segurança ligada ao endereço do site", isCorrect: true },
                        {
                            text: "Código de seis dígitos enviado por mensagem de texto",
                            isCorrect: false,
                        },
                        {
                            text: "Pergunta secreta cadastrada no primeiro acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Senha longa trocada obrigatoriamente a cada mês",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que explica a escala do mercado de credenciais roubadas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Há divisão de trabalho: uns roubam, outros operam",
                            isCorrect: true,
                        },
                        {
                            text: "As senhas vazadas funcionam em qualquer sistema alvo",
                            isCorrect: false,
                        },
                        {
                            text: "A maioria das empresas não registra tentativa de login",
                            isCorrect: false,
                        },
                        {
                            text: "Os sistemas atuais aceitam senha sem qualquer limite",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Exploração de serviço exposto",
            blocks: [
                {
                    type: "text",
                    value: '# A falha conhecida que ninguém corrigiu\n\nO terceiro grande vetor inicial é a exploração de uma aplicação publicada na internet. Quase sempre não se trata de uma falha inédita e cara: trata-se de uma falha pública, com correção disponível há semanas ou meses, num sistema que ninguém atualizou.\n\nO ciclo é bem conhecido. O fabricante publica a correção e o aviso. Pesquisadores e criminosos analisam a correção para entender exatamente o que ela conserta. Em pouco tempo aparece código de exploração público. A partir daí, robôs varrem a internet inteira procurando quem ainda não aplicou.\n\nA janela entre a correção sair e a exploração em massa começar vem encurtando ano após ano, e hoje é medida em dias para falhas graves em produtos populares. Isso muda a conversa de segurança de "temos um processo trimestral de atualização" para "quanto tempo levamos para corrigir o que está exposto".',
                },
                {
                    type: "table",
                    value: '[["Momento","O que existe","Risco para quem não corrigiu"],["Correção publicada","Aviso e atualização do fabricante","Baixo, ainda"],["Análise da correção","Entendimento público da falha","Crescendo"],["Exploração pública","Código pronto disponível","Alto"],["Varredura em massa","Robôs procurando quem não aplicou","Muito alto"],["Uso em ransomware","Grupos incorporam à rotina","Crítico"]]',
                },
                {
                    type: "text",
                    value: "## Nem toda falha grave é urgente para você\n\nA nota de gravidade que acompanha uma falha mede o impacto técnico dela no pior cenário, e não a urgência no seu ambiente. Uma falha de nota altíssima num componente que você não usa, ou que só é alcançável de dentro da rede, é menos urgente que uma falha de nota média num sistema seu publicado na internet e sem autenticação.\n\nPor isso o mercado passou a olhar dois sinais além da nota. Primeiro, se existe exploração conhecida sendo usada de verdade, informação que órgãos públicos como a agência americana de segurança cibernética publicam em catálogo aberto. Segundo, a exposição real: está na internet ou não, exige autenticação ou não.\n\nA priorização honesta combina os três: gravidade, exploração ativa e exposição. É assim que uma equipe pequena decide o que corrigir hoje sem tentar corrigir tudo.",
                },
                {
                    type: "quote",
                    value: "A pergunta que separa empresa preparada de empresa sortuda não é se você tem falhas, é quanto tempo você leva para corrigir as que estão expostas.",
                },
            ],
            questions: [
                {
                    statement:
                        "Na exploração de serviço exposto, qual é o cenário mais comum na prática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Falha pública com correção disponível e não aplicada",
                            isCorrect: true,
                        },
                        {
                            text: "Falha inédita descoberta pelo próprio invasor no alvo",
                            isCorrect: false,
                        },
                        {
                            text: "Falha de hardware que exige acesso físico ao servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Falha de configuração criada durante a instalação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que publicar uma correção também aumenta o risco no curto prazo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Analisar a correção revela a falha que ela conserta",
                            isCorrect: true,
                        },
                        {
                            text: "A atualização abre portas novas durante a instalação",
                            isCorrect: false,
                        },
                        {
                            text: "O fabricante divulga o código de exploração junto",
                            isCorrect: false,
                        },
                        {
                            text: "Os sistemas ficam indisponíveis enquanto atualizam",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma falha de nota máxima afeta um componente interno que você não publica. Outra, de nota média, afeta um sistema seu exposto sem autenticação. Qual priorizar?",
                    difficulty: "dificil",
                    options: [
                        { text: "A de nota média, por causa da exposição real", isCorrect: true },
                        { text: "A de nota máxima, porque a gravidade é maior", isCorrect: false },
                        {
                            text: "As duas ao mesmo tempo, já que ambas são falhas",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma, se não houver exploração pública ainda",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que sinal indica que uma falha merece correção imediata?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Haver exploração conhecida em uso contra alvos reais",
                            isCorrect: true,
                        },
                        {
                            text: "A falha ter sido divulgada há mais de seis meses",
                            isCorrect: false,
                        },
                        {
                            text: "O fabricante ter classificado o produto como legado",
                            isCorrect: false,
                        },
                        {
                            text: "A correção exigir reinicialização do servidor afetado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais três sinais compõem uma priorização honesta de correção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Gravidade, exploração ativa e exposição do sistema",
                            isCorrect: true,
                        },
                        {
                            text: "Gravidade, custo da correção e tamanho da equipe",
                            isCorrect: false,
                        },
                        {
                            text: "Idade da falha, fabricante e volume de usuários",
                            isCorrect: false,
                        },
                        {
                            text: "Exposição, tipo de licença e frequência de uso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Cadeia de suprimentos e terceiros",
            blocks: [
                {
                    type: "text",
                    value: "# Atacar quem entrega para muitos\n\nQuando invadir uma empresa bem defendida fica caro, o invasor muda de alvo: ataca alguém que já tem acesso a ela. Pode ser o fornecedor de software, cuja atualização entra assinada e confiável em milhares de clientes. Pode ser o prestador de serviço que administra os servidores. Pode ser uma biblioteca de código aberto que centenas de aplicações usam sem pensar.\n\nA lógica é de economia de escala e é o que torna essa classe tão atraente. Comprometer um fornecedor de médio porte pode render acesso a centenas de clientes de uma vez, e o acesso chega pelo canal que ninguém desconfia, o da atualização legítima.\n\nDo lado defensivo, é a categoria que mais desafia a intuição, porque a falha não está em você. Seus controles funcionaram, sua equipe fez o certo, e ainda assim o invasor entrou por um canal que você mesmo autorizou.",
                },
                {
                    type: "table",
                    value: '[["Tipo","Como o invasor chega","Medida que mais ajuda"],["Software de fornecedor","Atualização legítima comprometida","Monitorar comportamento após atualizar"],["Prestador de serviço","Usa o acesso remoto do terceiro","Acesso mínimo e por tempo limitado"],["Biblioteca de código","Pacote público alterado ou substituído","Fixar versão e verificar integridade"],["Serviço em nuvem","Provedor de um recurso usado por você","Entender o que depende de quem"],["Hardware","Componente adulterado antes de chegar","Compra por canal oficial"]]',
                },
                {
                    type: "text",
                    value: "## O que dá para fazer sem controlar o fornecedor\n\nA primeira medida é a mais chata e a mais útil: saber de quem você depende. Poucas empresas conseguem listar todos os fornecedores com acesso ao ambiente, e você não consegue reagir a um comprometimento que não sabe que te afeta.\n\nA segunda é limitar o que cada terceiro alcança. Prestador que administra um sistema não precisa de acesso à rede inteira, e acesso permanente pode virar acesso sob demanda, aberto quando há chamado e fechado depois. Isso não impede o comprometimento do fornecedor, mas reduz muito o que ele carrega junto.\n\nA terceira é assumir que vai acontecer e vigiar o comportamento, não a origem. Se a confiança vem do canal, e o canal foi comprometido, o que sobra é estranhar a ação: um software de gestão que nunca falou com a internet passa a falar, um agente de administração começa a copiar arquivo. É assim que esses casos costumam ser percebidos.",
                },
                {
                    type: "quote",
                    value: "Nesta categoria seus controles funcionaram e o invasor entrou mesmo assim, pelo canal que você autorizou. Por isso a defesa se apoia em vigiar comportamento, não origem.",
                },
            ],
            questions: [
                {
                    statement: "Por que atacar a cadeia de suprimentos é atraente para o invasor?",
                    difficulty: "facil",
                    options: [
                        { text: "Um comprometimento pode render muitos clientes", isCorrect: true },
                        {
                            text: "Fornecedores nunca aplicam correções de segurança",
                            isCorrect: false,
                        },
                        {
                            text: "O acesso obtido dispensa qualquer autenticação",
                            isCorrect: false,
                        },
                        {
                            text: "As leis não responsabilizam quem ataca terceiros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que torna o ataque via atualização de fornecedor difícil de barrar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela chega pelo canal legítimo que você autorizou",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é instalada sem qualquer registro no sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Ela desativa o antivírus antes de ser executada",
                            isCorrect: false,
                        },
                        {
                            text: "Ela ocorre apenas em software sem assinatura digital",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o primeiro passo prático para tratar risco de terceiros?",
                    difficulty: "medio",
                    options: [
                        { text: "Saber de quem a empresa realmente depende", isCorrect: true },
                        {
                            text: "Exigir certificação de segurança de cada fornecedor",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar fornecedores por alternativas de código aberto",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar seguro que cubra incidentes de terceiros",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Se a confiança vinha do canal e o canal foi comprometido, o que resta ao defensor?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Estranhar o comportamento, e não a origem do acesso",
                            isCorrect: true,
                        },
                        {
                            text: "Bloquear todas as atualizações automáticas na empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Confiar na assinatura digital do pacote recebido",
                            isCorrect: false,
                        },
                        {
                            text: "Aguardar o aviso oficial publicado pelo fornecedor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como reduzir o alcance de um prestador de serviço comprometido?",
                    difficulty: "medio",
                    options: [
                        { text: "Dar acesso mínimo e apenas durante o chamado", isCorrect: true },
                        {
                            text: "Exigir que ele use a mesma ferramenta de antivírus",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar em contrato a responsabilidade por incidente",
                            isCorrect: false,
                        },
                        {
                            text: "Permitir acesso só a partir da rede interna da empresa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Engenharia social",
    aulas: [
        {
            titulo: "Por que a engenharia social funciona",
            blocks: [
                {
                    type: "text",
                    value: "# O alvo não é o sistema, é a pessoa\n\nEngenharia social é a arte de conseguir que alguém faça, por vontade própria, algo que beneficia o invasor. Não há falha de software envolvida. Há uma pessoa ocupada, uma história plausível e um pedido que parece razoável no momento em que chega.\n\nA razão de funcionar tão bem não é burrice de quem cai. É que o cérebro humano usa atalhos para decidir rápido, e esses atalhos são úteis na vida normal. Confiar em quem se apresenta como autoridade, retribuir favor, evitar contrariar alguém, agir rápido quando algo parece urgente: tudo isso funciona na maior parte do tempo, e é exatamente isso que o invasor aluga.\n\nQuem defende precisa engolir uma verdade incômoda: culpar o usuário é confortável e inútil. Se um processo depende de a pessoa nunca errar sob pressão, o processo está mal desenhado. A defesa boa reduz o custo do erro, em vez de exigir perfeição.",
                },
                {
                    type: "table",
                    value: '[["Gatilho","Como aparece no golpe","Por que baixa a guarda"],["Autoridade","Mensagem que diz vir da diretoria","Questionar chefe custa caro"],["Urgência","Prazo de poucos minutos","Pensar devagar parece um risco"],["Escassez","Última chance de resolver","Medo de perder a oportunidade"],["Prova social","Todo o time já respondeu","Ninguém quer ser o único fora"],["Simpatia","Contato cordial e pessoal","É difícil desconfiar de quem é gentil"],["Medo","Ameaça de bloqueio ou multa","A reação vem antes da checagem"]]',
                },
                {
                    type: "text",
                    value: "## Pretexto: a história que sustenta o pedido\n\nPretexto é o cenário inventado que dá sentido ao que o invasor quer. Quanto melhor o pretexto encaixa na rotina real da vítima, menos ela estranha. Um pedido de recadastramento é estranho vindo do nada e deixa de ser quando chega logo depois de a empresa anunciar uma troca de sistema, informação que costuma estar pública.\n\nÉ por isso que reconhecimento e engenharia social se alimentam. Todo dado colhido na fase aberta vira material de pretexto: o nome do gerente direto, o sistema que a empresa usa, a data da confraternização, o fornecedor que acabou de ser contratado.\n\nA defesa que realmente funciona não é decorar sinais de e-mail suspeito, porque os golpes melhoraram e a lista envelhece. É criar caminhos de verificação fora do canal: qualquer pedido de dinheiro, credencial ou mudança de dado bancário se confirma por outro meio, ligando para um número que você já tinha, e não para o que veio na mensagem.",
                },
                {
                    type: "quote",
                    value: "Se o seu controle depende de a pessoa nunca errar num dia corrido, ele não é um controle, é uma esperança. Reduza o custo do erro em vez de exigir perfeição.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza um ataque de engenharia social?",
                    difficulty: "facil",
                    options: [
                        { text: "Levar a pessoa a agir por vontade própria", isCorrect: true },
                        { text: "Explorar uma falha do sistema operacional", isCorrect: false },
                        { text: "Interceptar a comunicação entre dois pontos", isCorrect: false },
                        { text: "Testar senhas comuns até uma delas funcionar", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que os gatilhos psicológicos funcionam tão bem nesses golpes?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "São atalhos que costumam acertar na vida normal",
                            isCorrect: true,
                        },
                        {
                            text: "São reações que só afetam quem tem pouca instrução",
                            isCorrect: false,
                        },
                        {
                            text: "São falhas de memória provocadas pelo excesso de dados",
                            isCorrect: false,
                        },
                        {
                            text: "São hábitos criados pelo uso constante de computador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o pretexto em um ataque de engenharia social?",
                    difficulty: "medio",
                    options: [
                        { text: "O cenário inventado que dá sentido ao pedido", isCorrect: true },
                        { text: "O canal escolhido para entregar a mensagem", isCorrect: false },
                        { text: "O programa que a vítima instala sem perceber", isCorrect: false },
                        { text: "O intervalo entre o contato e o golpe em si", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual defesa resiste melhor à evolução dos golpes, comparada a ensinar sinais de e-mail suspeito?",
                    difficulty: "dificil",
                    options: [
                        { text: "Confirmar o pedido por um canal independente", isCorrect: true },
                        {
                            text: "Bloquear mensagens vindas de domínios externos",
                            isCorrect: false,
                        },
                        {
                            text: "Aplicar treinamento obrigatório uma vez ao ano",
                            isCorrect: false,
                        },
                        {
                            text: "Exigir senha mais longa para acessar o correio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o reconhecimento aberto potencializa a engenharia social?",
                    difficulty: "medio",
                    options: [
                        { text: "Dados públicos viram material para o pretexto", isCorrect: true },
                        {
                            text: "Ele revela as senhas usadas pelos funcionários",
                            isCorrect: false,
                        },
                        {
                            text: "Ele permite enviar mensagem sem passar pelo filtro",
                            isCorrect: false,
                        },
                        {
                            text: "Ele mostra quais contas não têm segundo fator ativo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Phishing e suas variações",
            blocks: [
                {
                    type: "text",
                    value: "# O vetor que não sai de moda\n\nPhishing é a mensagem que se passa por alguém confiável para conseguir que a vítima clique, abra ou digite. Continua no topo dos vetores iniciais há mais de uma década por um motivo simples de economia: enviar mensagem custa quase nada, e basta uma pessoa entre milhares para o ataque valer.\n\nO que mudou foi a qualidade. O golpe cheio de erro de português ainda existe, mas hoje disputa espaço com mensagens impecáveis, com identidade visual correta, assinatura real e contexto que faz sentido. Boa parte do treinamento antigo, que ensinava a procurar erro de escrita, envelheceu mal.\n\nO objetivo também variou. Nem todo phishing quer credencial. Muitos querem apenas que você abra um arquivo, aprove uma permissão para um aplicativo ou responda para confirmar que a conta existe e que alguém lê aquela caixa.",
                },
                {
                    type: "table",
                    value: '[["Variação","Alvo","O que muda"],["Phishing em massa","Qualquer pessoa","Mensagem genérica enviada em volume"],["Spear phishing","Pessoa específica","Pretexto feito sob medida para ela"],["Whaling","Alta direção","Alvo com poder de aprovar pagamento"],["Clone","Quem já recebeu o original","Cópia de mensagem real com link trocado"],["Phishing de consentimento","Usuário de nuvem","Pede permissão a um aplicativo, não a senha"]]',
                },
                {
                    type: "text",
                    value: "## O phishing que não pede sua senha\n\nVale destacar uma variação que confunde muita gente porque não se parece com golpe: o phishing de consentimento. A mensagem leva a uma tela de autorização legítima do próprio provedor de nuvem, com o endereço correto e o cadeado no lugar, pedindo que você permita que um aplicativo acesse seus e-mails e arquivos.\n\nA vítima não digita senha nenhuma. Ela apenas clica em permitir. O invasor passa a ter acesso contínuo pela permissão concedida, e o segundo fator não protege, porque nada foi burlado: o acesso foi autorizado.\n\nA defesa aqui é administrativa, não comportamental. Restringir quais aplicativos podem receber consentimento, exigir aprovação da equipe de segurança para aplicativos novos e revisar periodicamente as permissões já concedidas. É um bom exemplo de por que segurança de nuvem exige olhar identidade e permissão, assunto do último estágio deste roadmap.",
                },
                {
                    type: "quote",
                    value: "Ensinar a procurar erro de português envelheceu mal. O phishing que dói hoje vem bem escrito, no momento certo e falando de um assunto que você realmente esperava.",
                },
            ],
            questions: [
                {
                    statement: "Por que o phishing continua sendo o vetor mais usado?",
                    difficulty: "facil",
                    options: [
                        { text: "Enviar custa quase nada e basta uma vítima", isCorrect: true },
                        {
                            text: "Os filtros de correio ainda não conseguem barrá-lo",
                            isCorrect: false,
                        },
                        {
                            text: "Ele dispensa qualquer preparação prévia do invasor",
                            isCorrect: false,
                        },
                        {
                            text: "Ele funciona somente contra empresas sem antivírus",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que diferencia spear phishing do phishing em massa?",
                    difficulty: "facil",
                    options: [
                        { text: "O pretexto é feito sob medida para a vítima", isCorrect: true },
                        { text: "A mensagem sempre carrega um arquivo anexado", isCorrect: false },
                        {
                            text: "O envio ocorre apenas dentro do horário comercial",
                            isCorrect: false,
                        },
                        {
                            text: "O objetivo é sempre obter uma transferência bancária",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o phishing de consentimento?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A vítima autoriza um aplicativo em vez de digitar senha",
                            isCorrect: true,
                        },
                        {
                            text: "A vítima informa a senha numa página falsa idêntica",
                            isCorrect: false,
                        },
                        {
                            text: "A vítima instala um programa recebido por anexo",
                            isCorrect: false,
                        },
                        {
                            text: "A vítima aprova uma notificação do segundo fator",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o segundo fator não protege contra o phishing de consentimento?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Nada foi burlado: o acesso foi de fato autorizado",
                            isCorrect: true,
                        },
                        {
                            text: "O código enviado é interceptado pelo aplicativo falso",
                            isCorrect: false,
                        },
                        {
                            text: "A tela de autorização desativa o segundo fator antes",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor não exige segundo fator para aplicativos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual medida trata melhor o risco de consentimento indevido a aplicativos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Restringir quais aplicativos podem ser autorizados",
                            isCorrect: true,
                        },
                        {
                            text: "Treinar os usuários a conferir o endereço do site",
                            isCorrect: false,
                        },
                        {
                            text: "Exigir troca de senha após qualquer autorização nova",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear o recebimento de mensagens com links externos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Vishing, smishing e o código na parede",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o golpe sai do e-mail\n\nÀ medida que filtros de correio melhoraram, os golpes migraram para canais menos vigiados. Vishing é a versão por voz, uma ligação em que alguém se apresenta como suporte, banco ou fornecedor. Smishing é a versão por mensagem de texto ou aplicativo de mensagem. Nos dois casos o mecanismo é o mesmo do phishing, o que muda é o canal e, principalmente, quanto a empresa consegue enxergar.\n\nA voz tem um problema extra: ela transmite autoridade e urgência de um jeito que texto não consegue, e não deixa artefato para analisar depois. Com a facilidade atual de clonar voz a partir de poucos segundos de áudio, a checagem por reconhecimento de voz virou um controle fraco.\n\nO golpe mais rentável dessa família é o do falso suporte técnico: alguém liga dizendo que detectou um problema na máquina do funcionário e pede que ele instale uma ferramenta de acesso remoto. Não há malware a ser detectado, porque a ferramenta instalada costuma ser legítima e conhecida.",
                },
                {
                    type: "table",
                    value: '[["Canal","Como chega","Dificuldade para a empresa"],["Correio","Mensagem na caixa corporativa","Menor, há filtro e registro"],["Voz","Ligação para o ramal ou celular","Alta, não há artefato para analisar"],["Mensagem de texto","Link curto no celular pessoal","Alta, o aparelho pode ser pessoal"],["Aplicativo de mensagem","Contato se passando por colega","Alta, fora do controle da empresa"],["Código em imagem","Cartaz, crachá ou anexo","Média, o destino fica escondido"]]',
                },
                {
                    type: "text",
                    value: "## O código de barras bidimensional como isca\n\nO golpe por código de barras bidimensional ganhou espaço por uma razão prática: o destino fica escondido dentro de uma imagem, então filtros que analisam texto e link não veem nada. E a leitura costuma acontecer no celular, que muitas vezes é pessoal e está fora das proteções da empresa.\n\nOs cenários mais comuns são adesivo colado sobre o código legítimo em estacionamento ou máquina de pagamento, e anexo de imagem em mensagem que se apresenta como configuração de segundo fator. Nos dois, a vítima acha que está seguindo um procedimento normal.\n\nA orientação prática que funciona é simples de comunicar: código lido pela câmera abre uma página, então trate a página como trataria um link recebido de estranho. Confira o endereço antes de digitar qualquer coisa e desconfie de qualquer pedido de credencial que chegue por esse caminho.",
                },
                {
                    type: "quote",
                    value: "Filtro de correio empurrou o golpe para o telefone e para o celular pessoal, que é justamente onde a empresa enxerga menos e o funcionário está mais sozinho.",
                },
            ],
            questions: [
                {
                    statement: "O que diferencia vishing de phishing tradicional?",
                    difficulty: "facil",
                    options: [
                        { text: "O golpe é conduzido por uma ligação de voz", isCorrect: true },
                        {
                            text: "O golpe exige que a vítima instale um programa",
                            isCorrect: false,
                        },
                        { text: "O golpe usa somente números internacionais", isCorrect: false },
                        {
                            text: "O golpe ocorre apenas fora do horário comercial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que os golpes migraram do correio para voz e mensagem?",
                    difficulty: "medio",
                    options: [
                        { text: "São canais menos vigiados pela empresa", isCorrect: true },
                        { text: "São canais que não permitem uso de links", isCorrect: false },
                        { text: "São canais que dispensam qualquer pretexto", isCorrect: false },
                        { text: "São canais mais baratos que o envio em massa", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que reconhecer a voz de quem liga virou um controle fraco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Clonar voz exige apenas alguns segundos de áudio",
                            isCorrect: true,
                        },
                        {
                            text: "As ligações corporativas passam por conversores digitais",
                            isCorrect: false,
                        },
                        {
                            text: "O ruído das chamadas impede a identificação correta",
                            isCorrect: false,
                        },
                        {
                            text: "As operadoras não garantem a origem exibida na tela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o código de barras bidimensional escapa dos filtros de correio?",
                    difficulty: "dificil",
                    options: [
                        { text: "O destino fica escondido dentro de uma imagem", isCorrect: true },
                        {
                            text: "A mensagem é enviada sem qualquer texto no corpo",
                            isCorrect: false,
                        },
                        {
                            text: "O filtro não inspeciona anexos menores que um limite",
                            isCorrect: false,
                        },
                        {
                            text: "O código é gerado no momento em que a vítima abre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No golpe do falso suporte técnico, por que o antivírus costuma não ajudar?",
                    difficulty: "medio",
                    options: [
                        { text: "A ferramenta de acesso instalada é legítima", isCorrect: true },
                        { text: "O invasor desativa o antivírus antes de ligar", isCorrect: false },
                        {
                            text: "O ataque acontece inteiramente dentro do navegador",
                            isCorrect: false,
                        },
                        {
                            text: "O programa usado é novo demais para ter assinatura",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "BEC: a fraude do falso executivo",
            blocks: [
                {
                    type: "text",
                    value: "# O golpe mais caro não usa malware\n\nComprometimento de e-mail corporativo, conhecido pela sigla BEC, é a fraude em que o invasor usa correio eletrônico para induzir um pagamento ou o desvio de um pagamento legítimo. Ano após ano ele aparece nos relatórios de perda financeira acima do ransomware, e não envolve nenhum programa malicioso.\n\nO enredo clássico tem duas formas. Na primeira, o invasor se passa por um executivo e pede a alguém do financeiro uma transferência urgente e confidencial. Na segunda, mais lucrativa, ele já está dentro de uma caixa de correio, acompanha uma negociação real e, na hora do pagamento, envia os dados bancários dele.\n\nA segunda forma é devastadora porque tudo é verdadeiro: o fornecedor existe, a nota é real, o valor confere, o histórico da conversa está ali. A única coisa trocada é o número da conta.",
                },
                {
                    type: "table",
                    value: '[["Variante","Como se apresenta","Sinal que costuma aparecer"],["Falso executivo","Pedido urgente e sigiloso de transferência","Pressa incomum e canal único"],["Fatura desviada","Cobrança real com conta trocada","Mudança de dado bancário de última hora"],["Falso fornecedor","Aviso de atualização cadastral","Domínio parecido com o verdadeiro"],["Falso RH","Pedido de troca da conta de salário","Solicitação vinda de fora do sistema"],["Falso advogado","Operação confidencial com prazo","Proibição explícita de comentar"]]',
                },
                {
                    type: "text",
                    value: "## Por que o controle tem que ser de processo\n\nNão existe filtro que resolva BEC sozinho, porque em muitos casos a mensagem sai de uma caixa legítima e comprometida. O controle que funciona é de processo financeiro, e é barato: qualquer mudança de dado bancário exige confirmação por um canal independente, ligando para um número já cadastrado, e nunca para o telefone que veio na mensagem.\n\nO segundo controle é a segregação: pagamentos acima de um valor exigem duas aprovações de pessoas diferentes. Isso tira o poder do gatilho de urgência, porque um pedido sigiloso que não pode ser comentado com ninguém entra em conflito direto com a regra.\n\nDo lado técnico, ajuda muito monitorar regras de caixa de correio. Invasor que entra numa caixa costuma criar uma regra que move para a lixeira as mensagens contendo palavras como fatura ou pagamento, para que o dono não veja a conversa paralela. Regra nova desse tipo é um sinal excelente de comprometimento.",
                },
                {
                    type: "quote",
                    value: "Na fraude de fatura desviada tudo é verdadeiro: o fornecedor, a nota, o valor e o histórico. Só o número da conta mudou, e é por isso que nenhum filtro pega.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza a fraude conhecida como BEC?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uso do correio para induzir ou desviar pagamento",
                            isCorrect: true,
                        },
                        {
                            text: "Uso de programa que cifra os arquivos da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Uso de falha do servidor de correio para invadir",
                            isCorrect: false,
                        },
                        {
                            text: "Uso de rede sem fio falsa para capturar credencial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a variante de fatura desviada é tão difícil de barrar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Só o dado bancário é falso, o resto é verdadeiro",
                            isCorrect: true,
                        },
                        {
                            text: "A mensagem chega sempre fora do horário comercial",
                            isCorrect: false,
                        },
                        {
                            text: "O anexo usa um formato que o filtro não inspeciona",
                            isCorrect: false,
                        },
                        {
                            text: "O remetente usa um domínio recém-registrado e válido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual controle de processo mais reduz perda financeira em BEC?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Confirmar mudança bancária por canal independente",
                            isCorrect: true,
                        },
                        {
                            text: "Exigir assinatura digital em todas as mensagens",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear mensagens vindas de domínios parecidos",
                            isCorrect: false,
                        },
                        {
                            text: "Treinar o financeiro a identificar remetente falso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que exigir dupla aprovação enfraquece o gatilho de urgência e sigilo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um pedido que proíbe comentar entra em conflito com a regra",
                            isCorrect: true,
                        },
                        {
                            text: "A segunda pessoa consegue verificar a origem da mensagem",
                            isCorrect: false,
                        },
                        {
                            text: "O prazo do golpe expira antes da segunda aprovação sair",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema bloqueia automaticamente pedidos sigilosos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que sinal técnico costuma indicar que uma caixa de correio foi comprometida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Regra nova movendo mensagens de fatura para a lixeira",
                            isCorrect: true,
                        },
                        {
                            text: "Aumento no volume de mensagens recebidas por dia",
                            isCorrect: false,
                        },
                        {
                            text: "Assinatura do usuário alterada com dados diferentes",
                            isCorrect: false,
                        },
                        {
                            text: "Grande quantidade de mensagens marcadas como spam",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fadiga de MFA e o que veio depois",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o segundo fator vira o alvo\n\nA adoção do segundo fator tirou do jogo boa parte dos ataques por senha, e os invasores fizeram o que sempre fazem: passaram a atacar o próprio segundo fator. As técnicas que apareceram não quebram criptografia; elas exploram como a aprovação chega até a pessoa.\n\nA mais conhecida é a fadiga de notificação. O invasor já tem a senha correta e dispara dezenas de pedidos de aprovação em sequência, muitas vezes de madrugada. A vítima acorda com o celular vibrando sem parar e aprova para o barulho acabar, ou por achar que é falha do sistema. O acesso é concedido sem nenhuma invasão técnica.\n\nA resposta da indústria foi mudar o formato da aprovação. Em vez de um botão de aceitar, a tela de login mostra um número que precisa ser digitado no aplicativo. Isso quebra a aprovação reflexa, porque quem não está fazendo login não tem como saber o número.",
                },
                {
                    type: "table",
                    value: '[["Técnica","Como funciona","O que a neutraliza"],["Fadiga de notificação","Enxurrada de pedidos até alguém aprovar","Aprovação com número na tela"],["Troca de chip","Assume o número da vítima na operadora","Não usar mensagem de texto como fator"],["Proxy de autenticação","Site falso repassa tudo em tempo real","Fator ligado ao endereço do site"],["Roubo de sessão","Furta o cookie já autenticado","Vincular sessão a dispositivo"],["Registro indevido","Cadastra o próprio fator na conta alheia","Alertar e exigir aprovação ao registrar"]]',
                },
                {
                    type: "text",
                    value: "## O ataque que derrota quase todo segundo fator\n\nA técnica mais relevante hoje é o proxy de autenticação. A vítima acessa um site falso que fica no meio do caminho e repassa cada campo para o site verdadeiro em tempo real. Ela digita usuário, digita senha e digita o código do segundo fator, tudo é encaminhado, e o site verdadeiro devolve uma sessão autenticada que o invasor captura.\n\nRepare no detalhe importante: qualquer fator que dependa de a pessoa digitar algo é vulnerável a isso. Código por mensagem, código de aplicativo autenticador e até notificação com número podem ser repassados por um intermediário paciente.\n\nO que resiste é o fator ligado criptograficamente ao endereço do site, como chave de segurança física e chave de acesso. Nesse desenho o navegador só entrega a resposta se o endereço for o verdadeiro, e o site falso não consegue obter nada útil. É por isso que a recomendação mudou de ative o segundo fator para ative um segundo fator resistente a phishing.",
                },
                {
                    type: "quote",
                    value: "Qualquer fator que a pessoa possa digitar, ela pode digitar no lugar errado. O que resiste é o fator que o navegador se recusa a entregar fora do site verdadeiro.",
                },
            ],
            questions: [
                {
                    statement: "Como funciona o ataque de fadiga de notificação?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Envia pedidos repetidos até a vítima aprovar um",
                            isCorrect: true,
                        },
                        {
                            text: "Bloqueia a conta até que o usuário troque a senha",
                            isCorrect: false,
                        },
                        {
                            text: "Copia o código exibido pelo aplicativo autenticador",
                            isCorrect: false,
                        },
                        {
                            text: "Cadastra um segundo fator novo na conta da vítima",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que exibir um número na tela de login reduz a fadiga de notificação?",
                    difficulty: "medio",
                    options: [
                        { text: "Quem não está entrando não conhece o número", isCorrect: true },
                        {
                            text: "O número expira antes de o invasor tentar de novo",
                            isCorrect: false,
                        },
                        {
                            text: "O sistema bloqueia pedidos repetidos automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "O usuário precisa confirmar também por mensagem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como funciona o proxy de autenticação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um site falso repassa os dados ao verdadeiro na hora",
                            isCorrect: true,
                        },
                        {
                            text: "Um programa captura o que a vítima digita no teclado",
                            isCorrect: false,
                        },
                        {
                            text: "Um servidor gera códigos válidos para qualquer conta",
                            isCorrect: false,
                        },
                        {
                            text: "Um aplicativo autoriza acesso contínuo aos arquivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que código de aplicativo autenticador não resiste ao proxy de autenticação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O que a pessoa digita pode ser repassado adiante",
                            isCorrect: true,
                        },
                        {
                            text: "O código gerado é o mesmo em qualquer dispositivo",
                            isCorrect: false,
                        },
                        {
                            text: "O aplicativo não verifica a hora do servidor remoto",
                            isCorrect: false,
                        },
                        {
                            text: "O código permanece válido por várias horas seguidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna a chave de segurança resistente a phishing?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A resposta só é entregue ao endereço verdadeiro",
                            isCorrect: true,
                        },
                        {
                            text: "O código gerado por ela muda a cada poucos segundos",
                            isCorrect: false,
                        },
                        {
                            text: "Ela exige biometria além da senha em todo acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Ela funciona apenas dentro da rede interna da empresa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Malware por dentro",
    aulas: [
        {
            titulo: "Como classificar malware",
            blocks: [
                {
                    type: "text",
                    value: "# Duas perguntas diferentes que costumam se misturar\n\nMalware é qualquer software feito para agir contra o interesse de quem opera o sistema. A confusão começa quando se tenta classificar tudo numa lista só, misturando duas perguntas distintas: como o programa se espalha e o que ele faz depois de rodar.\n\nA primeira pergunta separa vírus, worm e trojan. São formas de propagação. A segunda separa ransomware, ladrão de credencial, ferramenta de acesso remoto e minerador. São propósitos. Um mesmo artefato pode ser um trojan pela propagação e um ladrão de credencial pelo propósito, sem contradição.\n\nManter as duas perguntas separadas ajuda no dia a dia, porque a resposta a incidente depende das duas. Como se espalha define se você precisa isolar a rede agora. O que faz define o que já pode ter sido perdido.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","Categoria","Exemplo de resposta"],["Como chega e se espalha","Propagação","Trojan, worm, vírus"],["O que faz ao rodar","Propósito","Cifra dados, rouba senha, minera moeda"],["Como sobrevive ao reinício","Persistência","Tarefa agendada, serviço, chave de inicialização"],["Como fala com o dono","Controle","Consulta a servidor externo, canal em serviço legítimo"],["Como escapa da detecção","Evasão","Executa só em memória, usa binário do próprio sistema"]]',
                },
                {
                    type: "text",
                    value: "## Malware sem arquivo e o abuso do que já existe\n\nDuas tendências mudaram a defesa nos últimos anos. A primeira é o malware que não grava arquivo: ele vive apenas na memória do processo, o que derrota qualquer defesa que dependa de examinar o disco. Reiniciar a máquina o elimina, mas costuma haver algum mecanismo de persistência que o traz de volta.\n\nA segunda é o abuso de ferramentas legítimas, chamado de viver da terra. Em vez de trazer utilitário próprio, o invasor usa o que o sistema já oferece: interpretador de comandos, ferramenta de administração remota, utilitário de compactação, cliente de transferência. Nada disso é malicioso, e nenhum antivírus vai apagar um programa oficial do sistema.\n\nA consequência prática é grande: a detecção deixou de poder ser só sobre o que o arquivo é e passou a ser sobre o que ele faz. Um utilitário de compactação é normal. O mesmo utilitário compactando a pasta inteira de documentos às três da manhã, logo antes de uma transferência para fora, não é.",
                },
                {
                    type: "quote",
                    value: "Nenhum antivírus vai apagar o interpretador de comandos do sistema. Por isso a pergunta deixou de ser que arquivo é esse e passou a ser por que ele está fazendo isso agora.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quais duas perguntas diferentes organizam a classificação de malware?",
                    difficulty: "facil",
                    options: [
                        { text: "Como ele se espalha e o que ele faz ao rodar", isCorrect: true },
                        { text: "Quem o criou e qual país foi o alvo escolhido", isCorrect: false },
                        { text: "Qual linguagem usa e qual sistema ele suporta", isCorrect: false },
                        {
                            text: "Quanto ocupa em disco e quanta memória consome",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o malware que não grava arquivo?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele vive apenas na memória do processo", isCorrect: true },
                        { text: "Ele se instala como serviço oculto do sistema", isCorrect: false },
                        { text: "Ele apaga a si mesmo depois de cada execução", isCorrect: false },
                        { text: "Ele grava seu código dentro de outro programa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa a expressão viver da terra em um ataque?",
                    difficulty: "medio",
                    options: [
                        { text: "Usar as ferramentas que já existem no sistema", isCorrect: true },
                        {
                            text: "Operar somente a partir de máquinas comprometidas",
                            isCorrect: false,
                        },
                        {
                            text: "Manter o acesso sem depender de servidor externo",
                            isCorrect: false,
                        },
                        {
                            text: "Espalhar-se apenas dentro da rede local do alvo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que essa técnica desafia a detecção baseada em identificar arquivos maliciosos?",
                    difficulty: "dificil",
                    options: [
                        { text: "As ferramentas usadas são legítimas do sistema", isCorrect: true },
                        {
                            text: "Os arquivos são cifrados antes de serem gravados",
                            isCorrect: false,
                        },
                        { text: "As ferramentas trocam de nome a cada execução", isCorrect: false },
                        {
                            text: "Os programas rodam com privilégio de administrador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na resposta a incidente, para que serve saber como o malware se propaga?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Decidir se é preciso isolar a rede imediatamente",
                            isCorrect: true,
                        },
                        {
                            text: "Estimar o valor do resgate que será exigido depois",
                            isCorrect: false,
                        },
                        {
                            text: "Identificar qual grupo criminoso está por trás dele",
                            isCorrect: false,
                        },
                        {
                            text: "Definir qual antivírus deve ser comprado em seguida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Vírus, worm e trojan",
            blocks: [
                {
                    type: "text",
                    value: "# Três formas de chegar, muito confundidas\n\nEsses três termos descrevem propagação e são usados como sinônimo no dia a dia, o que atrapalha. A diferença é objetiva e vale fixar, porque muda a urgência da resposta.\n\nVírus precisa de um hospedeiro: ele insere seu código dentro de outro arquivo, e só roda quando aquele arquivo roda. É o modelo mais antigo e o menos comum hoje, já que depende de troca de arquivos executáveis.\n\nWorm se espalha sozinho pela rede, sem precisar que ninguém abra nada. É a categoria que gera surto: uma máquina infectada procura outras, e o crescimento é exponencial. Trojan não se espalha sozinho nem infecta arquivo; ele se disfarça de algo desejável e depende de a vítima executá-lo. É de longe o formato mais comum hoje, porque casa perfeitamente com engenharia social.",
                },
                {
                    type: "table",
                    value: '[["Tipo","Precisa de ação humana","Espalha sozinho","Urgência típica"],["Vírus","Sim, executar o hospedeiro","Não, depende do arquivo","Média"],["Worm","Não","Sim, pela rede","Muito alta, isolar já"],["Trojan","Sim, a vítima executa","Não","Alta, mas contida"],["Híbrido","Depende do módulo","Alguns módulos sim","Muito alta"]]',
                },
                {
                    type: "text",
                    value: "## Por que a distinção muda a resposta\n\nDiante de um trojan numa estação, a resposta é isolar aquela máquina, entender o que foi executado e verificar se houve movimentação a partir dela. O incidente é grave, mas tem raio conhecido.\n\nDiante de indício de worm, a resposta muda de natureza e vira contenção de emergência: segmentar rede, bloquear o protocolo usado para propagar e correr atrás da correção antes que o número de máquinas dobre. Os surtos mais destrutivos da história combinaram propagação automática com carga destrutiva, e a lição que ficou foi essa: propagação automática transforma um incidente localizado em um evento de continuidade do negócio.\n\nHoje é comum encontrar híbridos: o acesso inicial vem por trojan, entregue em phishing, e a partir de dentro o operador usa módulos que se espalham sozinhos. Por isso a pergunta na triagem nunca é só o que é esse arquivo, mas também se ele já tocou outras máquinas.",
                },
                {
                    type: "quote",
                    value: "Trojan é um incidente com raio conhecido. Worm é um relógio correndo: cada minuto de análise é mais máquinas infectadas.",
                },
            ],
            questions: [
                {
                    statement: "O que distingue um vírus das outras formas de propagação?",
                    difficulty: "facil",
                    options: [
                        { text: "Ele insere seu código dentro de outro arquivo", isCorrect: true },
                        { text: "Ele se copia pela rede sem ação de ninguém", isCorrect: false },
                        { text: "Ele se disfarça de programa útil e desejável", isCorrect: false },
                        {
                            text: "Ele opera apenas na memória, sem tocar o disco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza um worm?",
                    difficulty: "facil",
                    options: [
                        { text: "Espalha-se sozinho, sem ação de nenhum usuário", isCorrect: true },
                        {
                            text: "Depende de a vítima executar o arquivo recebido",
                            isCorrect: false,
                        },
                        { text: "Precisa infectar um programa para poder rodar", isCorrect: false },
                        {
                            text: "Cifra os arquivos e exige pagamento de resgate",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o trojan é hoje o formato mais comum?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele casa perfeitamente com engenharia social", isCorrect: true },
                        {
                            text: "Ele é o único que escapa de qualquer antivírus",
                            isCorrect: false,
                        },
                        {
                            text: "Ele dispensa privilégio de administrador para rodar",
                            isCorrect: false,
                        },
                        {
                            text: "Ele funciona em qualquer sistema sem adaptação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que indício de worm muda a natureza da resposta a incidente?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O número de máquinas cresce enquanto você analisa",
                            isCorrect: true,
                        },
                        {
                            text: "O worm apaga os registros antes de se propagar",
                            isCorrect: false,
                        },
                        {
                            text: "O worm sempre traz uma carga destrutiva embutida",
                            isCorrect: false,
                        },
                        {
                            text: "O worm impede o isolamento da rede pelo firewall",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na triagem de um artefato, qual pergunta acompanha a identificação do tipo?",
                    difficulty: "medio",
                    options: [
                        { text: "Se ele já alcançou outras máquinas da rede", isCorrect: true },
                        { text: "Se ele foi escrito por um grupo conhecido", isCorrect: false },
                        { text: "Se ele consome muita memória ao ser executado", isCorrect: false },
                        {
                            text: "Se ele possui assinatura digital de fabricante",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RAT, backdoor e rootkit",
            blocks: [
                {
                    type: "text",
                    value: "# As ferramentas de quem já está dentro\n\nDepois do acesso inicial, o invasor precisa de três coisas: controlar a máquina, garantir que consegue voltar e não ser visto. Cada necessidade tem uma família de ferramenta correspondente, e elas costumam aparecer juntas.\n\nFerramenta de acesso remoto, conhecida pela sigla RAT, dá controle interativo: o invasor executa comandos, navega em arquivos, captura tela e às vezes liga a câmera. É o equivalente a sentar na cadeira da vítima. Muitas são versões maliciosas de programas de administração legítimos, e algumas são o programa legítimo mesmo, instalado por engano pelo próprio usuário.\n\nPorta dos fundos é qualquer mecanismo que permita voltar sem passar pela autenticação normal. Pode ser uma conta criada discretamente, uma chave de acesso adicionada ou um serviço que fica escutando. Já o rootkit é a família da ocultação: código que se instala em camada profunda do sistema para esconder processos, arquivos e conexões do próprio sistema operacional.",
                },
                {
                    type: "table",
                    value: '[["Família","Necessidade que atende","Sinal possível"],["Acesso remoto","Controlar a máquina agora","Conexão de saída constante para o mesmo destino"],["Porta dos fundos","Voltar depois sem autenticar","Conta ou chave que ninguém reconhece"],["Rootkit","Não ser visto","Diferença entre o que o sistema mostra e a realidade"],["Carregador","Trazer o próximo estágio","Processo baixando e executando conteúdo"],["Proxy interno","Alcançar redes sem saída direta","Máquina comum roteando tráfego de outras"]]',
                },
                {
                    type: "text",
                    value: "## Por que rootkit é o mais incômodo\n\nO rootkit ataca a própria fonte de verdade. Se ele opera em nível de núcleo do sistema, a lista de processos que o sistema mostra passa a ser filtrada por ele: o processo do invasor está rodando e simplesmente não aparece. Uma ferramenta que pergunta ao sistema o que está acontecendo recebe uma resposta editada.\n\nDaí vêm duas práticas de investigação. A primeira é comparar visões: o que o sistema relata contra o que uma análise externa observa, como o tráfego visto no equipamento de rede em vez de na própria máquina. Discrepância entre as duas é sinal forte.\n\nA segunda é a regra que orienta a resposta a esses casos: máquina com suspeita de comprometimento profundo não se limpa, se reinstala. Remover o que foi encontrado não prova que nada ficou, e o custo de reinstalar é quase sempre menor que o de conviver com a dúvida.",
                },
                {
                    type: "quote",
                    value: "Quando o próprio sistema pode estar mentindo, olhar de fora vale mais que olhar de dentro: o tráfego que sai do cabo não é filtrado pelo que foi instalado na máquina.",
                },
            ],
            questions: [
                {
                    statement: "O que uma ferramenta de acesso remoto oferece ao invasor?",
                    difficulty: "facil",
                    options: [
                        { text: "Controle interativo sobre a máquina da vítima", isCorrect: true },
                        {
                            text: "Ocultação dos processos diante do sistema operacional",
                            isCorrect: false,
                        },
                        {
                            text: "Propagação automática para as máquinas vizinhas",
                            isCorrect: false,
                        },
                        {
                            text: "Cifragem dos arquivos para exigir um resgate depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que define uma porta dos fundos?",
                    difficulty: "facil",
                    options: [
                        { text: "Um meio de voltar sem passar pela autenticação", isCorrect: true },
                        { text: "Um programa que captura tudo que é digitado", isCorrect: false },
                        {
                            text: "Um canal cifrado usado para exfiltrar arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "Um módulo que se espalha sozinho pela rede local",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um rootkit em nível de núcleo é tão problemático?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O sistema passa a relatar uma realidade filtrada",
                            isCorrect: true,
                        },
                        { text: "Ele impede que a máquina volte a ser iniciada", isCorrect: false },
                        {
                            text: "Ele cifra o disco inteiro antes de ser detectado",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige privilégio de administrador todo dia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que abordagem de investigação ajuda quando o próprio sistema pode estar comprometido?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comparar o que a máquina relata com o visto na rede",
                            isCorrect: true,
                        },
                        {
                            text: "Executar o antivírus com a base de assinaturas nova",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar a máquina e repetir a coleta de processos",
                            isCorrect: false,
                        },
                        {
                            text: "Consultar o registro de eventos do próprio sistema",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a orientação padrão para máquina com suspeita de comprometimento profundo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reinstalar, porque limpar não prova que nada ficou",
                            isCorrect: true,
                        },
                        {
                            text: "Limpar com a ferramenta específica do fabricante",
                            isCorrect: false,
                        },
                        {
                            text: "Manter em observação até surgir novo indício claro",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar apenas as credenciais usadas naquela máquina",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Infostealer: o combustível do mercado",
            blocks: [
                {
                    type: "text",
                    value: "# O ladrão que não quer ficar\n\nLadrão de informação é uma categoria que cresceu de forma explosiva e que muita gente subestima porque o dano não é imediato. O programa entra, varre a máquina atrás de tudo que serve para se autenticar, envia o resultado e vai embora. Ele não cifra nada, não exige resgate e não fica esperando: a visita dura minutos.\n\nO que ele leva é o que dói. Senhas salvas no navegador, cookies de sessão ativos, tokens de aplicativos, carteiras de criptomoeda, arquivos de configuração de acesso remoto, credenciais de clientes de transferência de arquivo. Tudo isso é empacotado no que o mercado chama de log, vendido em lote em fóruns e mercados fechados.\n\nO ciclo se fecha meses depois. Alguém compra o pacote, encontra ali uma credencial corporativa válida e usa como acesso inicial. A empresa é atacada por uma senha roubada de um computador pessoal que ela nunca administrou.",
                },
                {
                    type: "table",
                    value: '[["O que rouba","Por que é valioso","Consequência prática"],["Senhas do navegador","Acesso direto a serviços","Login válido em nome do usuário"],["Cookies de sessão","Sessão já autenticada","Entra sem senha e sem segundo fator"],["Tokens de aplicativo","Acesso programático","Acesso que não aparece como login"],["Carteiras de moeda","Valor imediato","Perda financeira direta"],["Configuração de acesso remoto","Caminho para servidores","Porta de entrada na infraestrutura"]]',
                },
                {
                    type: "text",
                    value: "## O cookie de sessão e o limite do segundo fator\n\nVale entender bem esse ponto, porque ele explica um mal-entendido comum. Quando você entra num serviço e passa pelo segundo fator, o servidor devolve uma prova de que você já se autenticou, guardada como cookie de sessão. Nas requisições seguintes, o navegador apresenta essa prova, e o servidor não pede tudo de novo.\n\nSe o ladrão copia esse cookie e o apresenta a partir da máquina dele, o servidor pode aceitar: para ele, aquela sessão já passou pela autenticação. O segundo fator não é burlado, ele é pulado, porque a etapa em que ele atuaria já aconteceu.\n\nÉ por isso que a resposta a esse tipo de comprometimento tem um passo que muita gente esquece. Trocar a senha não basta, porque a sessão roubada continua válida. É preciso invalidar as sessões ativas, e é para isso que existe o botão de encerrar sessões em todos os dispositivos.",
                },
                {
                    type: "quote",
                    value: "Trocar a senha e esquecer de encerrar as sessões é fechar a porta com o invasor já dentro de casa.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o comportamento típico de um ladrão de informação?",
                    difficulty: "facil",
                    options: [
                        { text: "Coleta credenciais, envia e vai embora rápido", isCorrect: true },
                        {
                            text: "Cifra os arquivos e aguarda o pagamento do resgate",
                            isCorrect: false,
                        },
                        {
                            text: "Permanece meses aguardando comando do operador",
                            isCorrect: false,
                        },
                        {
                            text: "Espalha-se pela rede infectando cada máquina nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o cookie de sessão roubado é tão valioso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele representa uma autenticação que já aconteceu",
                            isCorrect: true,
                        },
                        {
                            text: "Ele contém a senha do usuário de forma cifrada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele permite gerar novos códigos de segundo fator",
                            isCorrect: false,
                        },
                        {
                            text: "Ele concede privilégio de administrador no serviço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que se diz que o segundo fator é pulado, e não burlado, no roubo de sessão?",
                    difficulty: "dificil",
                    options: [
                        { text: "A etapa em que ele atuaria já tinha ocorrido", isCorrect: true },
                        {
                            text: "O código do segundo fator é copiado junto ao cookie",
                            isCorrect: false,
                        },
                        {
                            text: "O servidor desativa o segundo fator após o primeiro uso",
                            isCorrect: false,
                        },
                        {
                            text: "O ladrão reproduz a resposta da chave de segurança",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Após comprometimento por ladrão de informação, o que trocar a senha deixa de resolver?",
                    difficulty: "medio",
                    options: [
                        { text: "As sessões já ativas continuam sendo aceitas", isCorrect: true },
                        {
                            text: "Os arquivos copiados voltam a ficar acessíveis",
                            isCorrect: false,
                        },
                        {
                            text: "O programa permanece instalado e ativo na máquina",
                            isCorrect: false,
                        },
                        {
                            text: "As credenciais de outros serviços seguem expostas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como uma credencial roubada de computador pessoal atinge uma empresa?",
                    difficulty: "medio",
                    options: [
                        { text: "É vendida em lote e usada como acesso inicial", isCorrect: true },
                        {
                            text: "É usada para infectar a rede da empresa por worm",
                            isCorrect: false,
                        },
                        {
                            text: "Permite alterar a configuração do correio da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Concede acesso administrativo ao domínio corporativo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Persistência: como o malware volta",
            blocks: [
                {
                    type: "text",
                    value: "# Sobreviver ao reinício é metade do trabalho\n\nUm programa malicioso que roda uma vez e morre no primeiro reinício tem valor limitado. Por isso quase todo ataque investe em persistência: algum mecanismo que garanta que o acesso volte sozinho quando a máquina ligar, o usuário entrar ou um horário chegar.\n\nO detalhe interessante é que quase nenhum desses mecanismos é malicioso em si. Todos existem porque sistemas operacionais precisam iniciar programas automaticamente, e administradores usam isso o tempo todo. O invasor simplesmente ocupa um lugar legítimo, e é por isso que a defesa se apoia menos em identificar o mecanismo e mais em conhecer o que é normal na sua máquina.\n\nPara quem defende, persistência é uma das melhores oportunidades de detecção da cadeia inteira. Diferente do que roda só na memória, ela deixa marca gravada: um registro de tarefa, um serviço criado, uma chave alterada. Marca gravada é coisa que se pode inventariar e comparar.",
                },
                {
                    type: "table",
                    value: '[["Mecanismo","Uso legítimo","Como o invasor abusa"],["Tarefa agendada","Rotinas de manutenção","Cria tarefa que chama o próprio código"],["Serviço do sistema","Programas que sobem com a máquina","Registra serviço com nome parecido com o oficial"],["Chave de inicialização","Programas do usuário ao entrar","Adiciona entrada apontando para o artefato"],["Conta adicional","Usuários de serviço","Cria conta discreta com acesso remoto"],["Chave pública instalada","Acesso administrativo sem senha","Insere a própria chave no servidor"]]',
                },
                {
                    type: "text",
                    value: "## Caçar persistência é comparar com o normal\n\nA técnica prática é a linha de base: registrar como uma máquina saudável se parece e procurar o que destoa. Quais tarefas agendadas existem numa estação recém-instalada, quais serviços rodam, quais contas locais existem. Com essa referência, uma tarefa nova numa máquina isolada salta aos olhos.\n\nSem linha de base, o analista fica olhando uma lista de trinta tarefas agendadas sem saber quais são do fabricante e quais não são, e a análise vira adivinhação. Com ela, a pergunta fica objetiva: isso aqui existe nas outras máquinas do mesmo modelo?\n\nDois sinais valem destaque por serem baratos e eficazes. Conta local nova em estação de trabalho é raro e quase sempre merece checagem. Chave pública adicionada a um servidor é ainda mais raro e permite acesso sem senha, o que a torna um dos mecanismos mais silenciosos e mais graves.",
                },
                {
                    type: "quote",
                    value: "Persistência é o presente que o invasor deixa para o defensor: diferente do que só roda em memória, ela precisa ficar gravada em algum lugar para funcionar.",
                },
            ],
            questions: [
                {
                    statement: "Por que a persistência é essencial para o invasor?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem ela, o acesso se perde no primeiro reinício",
                            isCorrect: true,
                        },
                        {
                            text: "Sem ela, o antivírus detecta o processo em memória",
                            isCorrect: false,
                        },
                        {
                            text: "Sem ela, o malware não consegue se espalhar na rede",
                            isCorrect: false,
                        },
                        {
                            text: "Sem ela, o invasor não consegue elevar privilégio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que os mecanismos de persistência são difíceis de bloquear por completo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Eles existem para uso legítimo de administração",
                            isCorrect: true,
                        },
                        {
                            text: "Eles operam em nível de núcleo do sistema sempre",
                            isCorrect: false,
                        },
                        {
                            text: "Eles são criados por programas sem assinatura digital",
                            isCorrect: false,
                        },
                        {
                            text: "Eles só podem ser removidos com a máquina desligada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que persistência é uma boa oportunidade de detecção?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela precisa ficar gravada para poder funcionar", isCorrect: true },
                        { text: "Ela gera tráfego constante de saída na rede", isCorrect: false },
                        {
                            text: "Ela exige privilégio de administrador para existir",
                            isCorrect: false,
                        },
                        {
                            text: "Ela dispara alerta em qualquer antivírus atual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é a linha de base na caça a mecanismos de persistência?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O retrato de como uma máquina saudável se parece",
                            isCorrect: true,
                        },
                        {
                            text: "A lista de indicadores publicada por inteligência",
                            isCorrect: false,
                        },
                        {
                            text: "O conjunto mínimo de regras exigido por auditoria",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo médio entre a infecção e a sua detecção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma chave pública adicionada a um servidor é especialmente grave?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela concede acesso sem exigir nenhuma senha", isCorrect: true },
                        {
                            text: "Ela substitui as chaves legítimas já cadastradas",
                            isCorrect: false,
                        },
                        {
                            text: "Ela impede o registro dos acessos no log local",
                            isCorrect: false,
                        },
                        { text: "Ela permite executar comandos como o núcleo", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Ransomware como negócio",
    aulas: [
        {
            titulo: "Anatomia de um ataque de ransomware",
            blocks: [
                {
                    type: "text",
                    value: "# A cifragem é o último ato, não o primeiro\n\nA imagem popular do ransomware é a tela vermelha exigindo pagamento. Essa tela é o fim de uma operação que já dura dias ou semanas. Quando ela aparece, o invasor já entrou, já mapeou a rede, já roubou o que interessava e já cuidou dos backups. Cifrar é o gesto final, e é justamente o único que a vítima percebe.\n\nEssa inversão de percepção explica muita coisa. Quem só se prepara para o momento da cifragem está se preparando para o instante em que já perdeu. Toda a chance de interromper esteve nas semanas anteriores, quando havia login estranho, ferramenta de administração usada fora do padrão e um volume incomum de dados saindo.\n\nO tempo entre a entrada e a cifragem vem encurtando, e operações bem ensaiadas conseguem fazer o percurso inteiro em poucos dias. Ainda assim, dias são dias: há janela para detectar, desde que alguém esteja olhando as coisas certas.",
                },
                {
                    type: "table",
                    value: '[["Momento","O que acontece","Chance de detectar"],["Acesso inicial","Phishing, credencial válida ou serviço exposto","Alta, se houver monitoramento de login"],["Reconhecimento interno","Mapeia rede, servidores e backups","Alta, consultas incomuns ao diretório"],["Escalonamento","Obtém conta administrativa","Alta, uso privilegiado fora do padrão"],["Exfiltração","Copia dados para fora","Média, volume de saída anômalo"],["Sabotagem de backup","Apaga ou cifra as cópias","Alta, se houver alerta em exclusão"],["Cifragem","Dispara em massa","Nenhuma, o dano já está feito"]]',
                },
                {
                    type: "text",
                    value: "## O passo que a vítima descobre tarde demais\n\nOperadores competentes tratam o backup como alvo prioritário, porque backup funcionando destrói o modelo de negócio deles. Antes de cifrar qualquer coisa, eles procuram o servidor de cópias, apagam os pontos de restauração, cifram os repositórios acessíveis pela rede e, quando conseguem, revogam o acesso da própria equipe.\n\nÉ por isso que a pergunta importante nunca é se a empresa tem backup, e sim se ela tem backup que o invasor não consegue alcançar com uma conta de administrador do domínio. A resposta muda tudo, e costuma ser descoberta no pior momento possível.\n\nDaí vem a regra prática mais repetida da área, a do três, dois, um: três cópias dos dados, em dois tipos de mídia diferentes, sendo uma fora do ambiente. A parte que mais falha na prática é a última, e a versão moderna acrescenta uma exigência: pelo menos uma cópia precisa ser imutável ou desconectada, de modo que nem uma credencial administrativa consiga apagá-la.",
                },
                {
                    type: "quote",
                    value: "A pergunta não é se você tem backup. É se você tem backup que o administrador do domínio não consegue apagar, porque essa é exatamente a conta que o invasor terá.",
                },
            ],
            questions: [
                {
                    statement: "Em um ataque de ransomware, quando ocorre a cifragem?",
                    difficulty: "facil",
                    options: [
                        { text: "No final, depois de dias de operação interna", isCorrect: true },
                        { text: "No início, logo após o primeiro acesso obtido", isCorrect: false },
                        { text: "Em paralelo à fase de reconhecimento da rede", isCorrect: false },
                        { text: "Somente após o pagamento não ser realizado", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que operadores de ransomware atacam o backup antes de cifrar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Backup funcionando destrói o modelo de negócio deles",
                            isCorrect: true,
                        },
                        {
                            text: "O backup guarda as credenciais de administrador da rede",
                            isCorrect: false,
                        },
                        {
                            text: "A cifragem falha quando existe cópia sendo executada",
                            isCorrect: false,
                        },
                        {
                            text: "O servidor de backup é o único acessível de fora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a regra de três, dois, um recomenda?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Três cópias, duas mídias e uma fora do ambiente",
                            isCorrect: true,
                        },
                        {
                            text: "Três dias de retenção, dois testes e um responsável",
                            isCorrect: false,
                        },
                        {
                            text: "Três servidores, dois locais e uma conta de acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Três verificações, dois backups e um plano escrito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual exigência moderna foi acrescentada à regra clássica de backup?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma cópia imutável ou desconectada do ambiente", isCorrect: true },
                        { text: "Uma cópia cifrada com chave guardada em cofre", isCorrect: false },
                        { text: "Uma cópia diária mantida por no mínimo um ano", isCorrect: false },
                        {
                            text: "Uma cópia validada por auditoria externa anual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que preparar-se apenas para o momento da cifragem é insuficiente?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando ela ocorre, a empresa já perdeu o jogo", isCorrect: true },
                        {
                            text: "A cifragem pode ser revertida com a chave correta",
                            isCorrect: false,
                        },
                        {
                            text: "A cifragem atinge apenas os servidores de arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "O antivírus interrompe a cifragem na maioria dos casos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Dupla e tripla extorsão",
            blocks: [
                {
                    type: "text",
                    value: "# Quando o backup deixou de ser suficiente\n\nPor anos a resposta ao ransomware foi direta: tenha backup, restaure, não pague. Funcionou tão bem que os criminosos mudaram o modelo. Se cifrar não obriga mais a pagar, então roubar obriga.\n\nA dupla extorsão consiste em copiar os dados antes de cifrar. A vítima com backup restaura os sistemas e continua com um problema enorme, porque o invasor tem uma cópia dos contratos, da folha de pagamento, dos dados de clientes e ameaça publicar. O backup resolve a indisponibilidade e não resolve o vazamento.\n\nA tripla extorsão acrescenta uma terceira pressão. Pode ser ligar para os clientes cujos dados foram roubados, avisando que a empresa foi negligente. Pode ser denunciar o vazamento ao órgão regulador, transformando o incidente em problema legal. Pode ser derrubar o site com negação de serviço enquanto a negociação corre.",
                },
                {
                    type: "table",
                    value: '[["Camada","Pressão exercida","O que a neutraliza"],["Cifragem","Você não opera","Backup isolado e restauração testada"],["Vazamento","Seus dados serão publicados","Cifrar dados sensíveis e reduzir o que se guarda"],["Contato com terceiros","Seus clientes vão saber","Plano de comunicação preparado antes"],["Denúncia ao regulador","Você terá problema legal","Notificar por conta própria, no prazo"],["Negação de serviço","Seu site cai durante a negociação","Proteção contratada antes do incidente"]]',
                },
                {
                    type: "text",
                    value: "## O que isso muda na sua defesa\n\nA primeira consequência é que restaurar não encerra o incidente. Enquanto a empresa comemora os sistemas de volta, o relógio do vazamento continua correndo, com obrigações legais de notificação que no Brasil vêm da lei geral de proteção de dados.\n\nA segunda é que a exfiltração passa a ser o ponto de detecção mais valioso da cadeia inteira. Ela acontece antes da cifragem e envolve mover volume incomum de dados para fora. Vigiar saída de dados deixou de ser preciosismo e virou o alarme que toca enquanto ainda dá para agir.\n\nA terceira é sobre reduzir a superfície do próprio dado. Informação que a empresa não guarda não pode vazar, e dado cifrado em repouso, com chave que o invasor não obteve, perde valor de chantagem. Retenção mínima virou controle de segurança, não só de custo de armazenamento.",
                },
                {
                    type: "quote",
                    value: "Backup resolve a indisponibilidade e não resolve o vazamento. Restaurar os sistemas encerra a parada, não o incidente.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza a dupla extorsão?",
                    difficulty: "facil",
                    options: [
                        { text: "Os dados são copiados antes de serem cifrados", isCorrect: true },
                        {
                            text: "O resgate é cobrado em duas parcelas separadas",
                            isCorrect: false,
                        },
                        { text: "Dois grupos diferentes atacam a mesma empresa", isCorrect: false },
                        {
                            text: "A cifragem atinge servidores e também estações",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o backup deixou de ser resposta completa ao ransomware?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele não impede a publicação dos dados roubados", isCorrect: true },
                        {
                            text: "Ele costuma ser cifrado junto com os servidores",
                            isCorrect: false,
                        },
                        {
                            text: "Ele leva mais tempo para restaurar do que pagar",
                            isCorrect: false,
                        },
                        {
                            text: "Ele não preserva as versões anteriores dos arquivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual pressão a tripla extorsão costuma acrescentar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Avisar clientes ou o órgão regulador sobre o vazamento",
                            isCorrect: true,
                        },
                        {
                            text: "Aumentar o valor do resgate a cada dia sem pagamento",
                            isCorrect: false,
                        },
                        {
                            text: "Cifrar novamente os sistemas já restaurados do backup",
                            isCorrect: false,
                        },
                        {
                            text: "Impedir o acesso remoto dos funcionários à empresa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a exfiltração virou o ponto de detecção mais valioso da cadeia?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela ocorre antes da cifragem, quando ainda dá para agir",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é a única etapa que gera registro no servidor",
                            isCorrect: false,
                        },
                        {
                            text: "Ela exige privilégio administrativo para acontecer",
                            isCorrect: false,
                        },
                        {
                            text: "Ela sempre usa um canal cifrado e facilmente notado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que retenção mínima de dados virou controle de segurança?",
                    difficulty: "medio",
                    options: [
                        { text: "O que não se guarda não pode ser vazado", isCorrect: true },
                        { text: "Menos dados aceleram a restauração do backup", isCorrect: false },
                        {
                            text: "Menos dados reduzem o tempo de cifragem sofrido",
                            isCorrect: false,
                        },
                        { text: "A lei proíbe guardar dado por mais de um ano", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Ransomware como serviço",
            blocks: [
                {
                    type: "text",
                    value: "# Uma indústria com divisão de trabalho\n\nA escala do ransomware não se explica por gênios solitários. Ela se explica por um modelo de negócio que separou quem constrói de quem opera. No arranjo conhecido como ransomware como serviço, um grupo desenvolve o programa de cifragem, mantém o site de vazamento, opera o portal de negociação e o suporte à vítima. Outro grupo, chamado de afiliado, cuida de invadir empresas e usar aquela plataforma.\n\nA receita é dividida por porcentagem, tipicamente com a maior parte ficando com o afiliado que executou o ataque. Existe seleção de afiliados, existe material de treinamento, existe até algo parecido com acordo de nível de serviço para o atendimento à vítima que decidiu pagar.\n\nEssa divisão tem uma consequência analítica importante: o mesmo programa de cifragem aparece em ataques com estilos completamente diferentes, porque quem operou era outra pessoa. Concluir que dois incidentes são do mesmo grupo só porque usaram o mesmo cifrador é um erro comum de análise.",
                },
                {
                    type: "table",
                    value: '[["Papel","O que faz","O que ganha"],["Desenvolvedor","Constrói e mantém a plataforma","Percentual sobre cada resgate"],["Afiliado","Invade e executa o ataque","A maior parte do valor pago"],["Corretor de acesso","Vende acessos já obtidos","Valor fixo por acesso vendido"],["Negociador","Conversa com a vítima","Comissão sobre o acordo"],["Lavagem","Converte o valor recebido","Percentual do montante movido"]]',
                },
                {
                    type: "text",
                    value: "## O corretor de acesso e o que ele significa para você\n\nUm papel merece atenção especial: o corretor de acesso inicial. É alguém que se especializou em entrar em empresas e não faz mais nada com isso além de vender o acesso, geralmente descrito por setor, país e faturamento aproximado, sem citar o nome da vítima.\n\nA existência desse mercado explica um fenômeno que confunde: a empresa é comprometida em janeiro e o ransomware só acontece em maio. Não é que o invasor tenha esperado por estratégia. É que o acesso ficou parado no estoque de alguém até ser vendido.\n\nA implicação defensiva é direta e otimista. Aquele acesso antigo e esquecido continua ativo em algum lugar, e caçá-lo é caçar um ataque que ainda não começou. Revisar contas de acesso remoto sem uso, credencial de fornecedor antigo e sessão que nunca expira é uma das atividades com melhor retorno que uma equipe pequena pode fazer.",
                },
                {
                    type: "quote",
                    value: "Empresa comprometida em janeiro e cifrada em maio não sofreu um invasor paciente. Sofreu um acesso que ficou no estoque de alguém até ser vendido.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza o modelo de ransomware como serviço?",
                    difficulty: "facil",
                    options: [
                        { text: "Quem constrói a plataforma não é quem invade", isCorrect: true },
                        {
                            text: "O resgate é cobrado como assinatura mensal fixa",
                            isCorrect: false,
                        },
                        {
                            text: "A vítima contrata um serviço para recuperar dados",
                            isCorrect: false,
                        },
                        {
                            text: "O programa de cifragem roda em nuvem do criminoso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que faz um corretor de acesso inicial?",
                    difficulty: "medio",
                    options: [
                        { text: "Invade empresas e revende o acesso obtido", isCorrect: true },
                        {
                            text: "Negocia o valor do resgate com a empresa vítima",
                            isCorrect: false,
                        },
                        {
                            text: "Desenvolve o programa de cifragem sob encomenda",
                            isCorrect: false,
                        },
                        { text: "Converte o pagamento recebido em moeda comum", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que o mesmo cifrador aparece em ataques de estilos muito diferentes?",
                    difficulty: "dificil",
                    options: [
                        { text: "Afiliados diferentes usam a mesma plataforma", isCorrect: true },
                        { text: "O cifrador se adapta sozinho a cada ambiente", isCorrect: false },
                        { text: "O código vaza e é copiado por outros grupos", isCorrect: false },
                        { text: "A ferramenta muda de comportamento por versão", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O que explica uma empresa ser comprometida meses antes da cifragem?",
                    difficulty: "medio",
                    options: [
                        { text: "O acesso ficou em estoque até alguém comprá-lo", isCorrect: true },
                        {
                            text: "O invasor aguardou o período de menor monitoramento",
                            isCorrect: false,
                        },
                        {
                            text: "A cifragem exige meses de preparação técnica prévia",
                            isCorrect: false,
                        },
                        {
                            text: "O grupo esperou o vencimento do contrato de seguro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual atividade defensiva tem bom retorno diante do mercado de acessos?",
                    difficulty: "medio",
                    options: [
                        { text: "Revisar acessos remotos antigos e sem uso", isCorrect: true },
                        {
                            text: "Trocar a senha de todos os usuários a cada mês",
                            isCorrect: false,
                        },
                        {
                            text: "Contratar inteligência sobre grupos criminosos",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a retenção dos registros de auditoria",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Pagar ou não pagar",
            blocks: [
                {
                    type: "text",
                    value: "# Uma decisão de negócio, não técnica\n\nA orientação das autoridades é consistente: não pagar. Pagar financia a próxima campanha, marca a empresa como pagadora e não garante nada. Ao mesmo tempo, é preciso honestidade sobre a pressão real de quem está com hospital parado ou folha de pagamento inacessível. Essa decisão nunca é do analista de segurança, e sim da direção, com jurídico e comunicação na sala.\n\nO que cabe ao time técnico é fornecer os fatos que sustentam a decisão: o que exatamente foi cifrado, o que dá para restaurar e em quanto tempo, o que foi levado para fora e qual o mínimo necessário para voltar a operar. Sem esses números, a direção decide no escuro e o medo decide por ela.\n\nExiste ainda uma dimensão legal que cresceu nos últimos anos. Pagamento a grupos submetidos a sanções internacionais pode expor a empresa a responsabilização, e é por isso que o jurídico entra na conversa desde a primeira hora, não depois.",
                },
                {
                    type: "table",
                    value: '[["Promessa do criminoso","Realidade frequente"],["Devolvemos tudo","O decifrador é lento e falha em parte dos arquivos"],["Apagamos sua cópia","Não há como verificar, e cópias reaparecem depois"],["Não publicaremos nada","Empresas que pagaram foram extorquidas de novo"],["Ninguém saberá","O caso costuma vir a público de qualquer forma"],["Damos suporte","Existe, e é justamente o que revela o tamanho do negócio"]]',
                },
                {
                    type: "text",
                    value: "## O que o decifrador entrega, na prática\n\nMesmo quando o pagamento é feito e a chave chega, a recuperação está longe de ser um botão. As ferramentas entregues costumam ser lentas, mal testadas e falham em parte dos arquivos, especialmente em bases de dados grandes. Não é raro que restaurar do backup, quando ele existe, seja mais rápido do que decifrar.\n\nHá também a questão da confiança no ambiente. Decifrar arquivos não remove o invasor: as portas dos fundos continuam onde estavam, as credenciais continuam válidas e o caminho de entrada continua aberto. Empresa que decifra e volta a operar sem erradicar o acesso corre risco alto de repetir o incidente em poucos meses.\n\nPor isso a sequência correta, independente da decisão sobre pagar, é sempre a mesma: conter, erradicar o acesso, trocar credenciais, e só então recuperar. Inverter essa ordem é o erro mais caro da resposta a incidente.",
                },
                {
                    type: "quote",
                    value: "Decifrar arquivo não expulsa invasor. Quem volta a operar sem erradicar o acesso comprou tempo, não solução.",
                },
            ],
            questions: [
                {
                    statement: "De quem é a decisão sobre pagar ou não um resgate?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Da direção, com jurídico e comunicação envolvidos",
                            isCorrect: true,
                        },
                        {
                            text: "Do analista de segurança que atendeu o incidente",
                            isCorrect: false,
                        },
                        {
                            text: "Do fornecedor responsável pelo sistema atingido",
                            isCorrect: false,
                        },
                        { text: "Da seguradora que cobre o risco cibernético", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o papel do time técnico nessa decisão?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fornecer os fatos sobre perda e tempo de recuperação",
                            isCorrect: true,
                        },
                        {
                            text: "Recomendar o valor máximo aceitável de pagamento",
                            isCorrect: false,
                        },
                        { text: "Negociar diretamente com o grupo responsável", isCorrect: false },
                        {
                            text: "Definir se o caso será comunicado ao regulador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que costuma acontecer com o decifrador entregue após o pagamento?",
                    difficulty: "medio",
                    options: [
                        { text: "É lento e falha em parte dos arquivos cifrados", isCorrect: true },
                        {
                            text: "Funciona bem, mas exige o servidor reinstalado",
                            isCorrect: false,
                        },
                        {
                            text: "Só recupera arquivos menores que um certo tamanho",
                            isCorrect: false,
                        },
                        { text: "Precisa ser executado por um técnico do grupo", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual é a sequência correta de resposta, independentemente de pagar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Conter, erradicar, trocar credenciais e recuperar",
                            isCorrect: true,
                        },
                        {
                            text: "Recuperar, conter, trocar credenciais e erradicar",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar credenciais, recuperar, conter e erradicar",
                            isCorrect: false,
                        },
                        {
                            text: "Erradicar, recuperar, conter e trocar credenciais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que pagar pode expor a empresa a risco legal adicional?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O grupo pode estar submetido a sanções internacionais",
                            isCorrect: true,
                        },
                        {
                            text: "A lei brasileira proíbe expressamente qualquer resgate",
                            isCorrect: false,
                        },
                        {
                            text: "O pagamento invalida a cobertura de qualquer seguro",
                            isCorrect: false,
                        },
                        {
                            text: "O valor pago precisa ser declarado como despesa ilegal",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Preparação e recuperação",
            blocks: [
                {
                    type: "text",
                    value: "# O plano que só serve se tiver sido ensaiado\n\nO que separa a empresa que atravessa um ransomware da que quebra raramente é a ferramenta. É ter decidido antes o que fazer e ter praticado. No dia do incidente ninguém está calmo, o correio pode estar indisponível e o telefone do responsável está no sistema que caiu.\n\nPor isso o plano precisa existir em papel ou fora do ambiente. Uma lista de contatos que só abre na intranet cifrada não é uma lista de contatos. O mesmo vale para a documentação de restauração, para as senhas de emergência e para os contratos de suporte.\n\nO segundo ponto é ensaiar. Simulação de mesa, em que a equipe percorre um cenário e responde quem faz o quê, custa uma tarde e revela buracos que nenhuma auditoria pega, do tipo ninguém sabe quem autoriza desligar a produção.",
                },
                {
                    type: "table",
                    value: '[["Preparação","Por que importa","Como testar"],["Backup isolado","Sobrevive ao comprometimento total","Restaurar de verdade, com cronômetro"],["Plano fora do ambiente","Continua acessível com tudo parado","Abrir a cópia impressa no ensaio"],["Contatos definidos","Ninguém procura telefone na hora","Ligar de fato durante a simulação"],["Segmentação de rede","Limita o alcance da cifragem","Verificar o que uma máquina alcança"],["Registros preservados","Permite entender o que houve","Conferir a retenção antes de precisar"]]',
                },
                {
                    type: "text",
                    value: "## Restauração testada é a única que conta\n\nA pergunta que mais constrange equipes é simples: quanto tempo leva para restaurar o sistema principal a partir do backup? Quem nunca cronometrou responde uma estimativa otimista, e a realidade costuma ser várias vezes maior, porque o teste real inclui achar a mídia, provisionar hardware, restaurar em ordem de dependência e validar a integridade.\n\nEssa medição tem nome e vira compromisso de negócio: o tempo objetivo de recuperação, quanto se aceita ficar parado, e o ponto objetivo de recuperação, quanto de trabalho se aceita perder. Definir esses dois números com a área de negócio transforma discussão técnica em decisão empresarial, com orçamento correspondente.\n\nVale fechar com o ponto que atravessa este módulo inteiro. Ransomware é a etapa final de uma cadeia que você estudou nos módulos anteriores: acesso inicial, persistência, escalonamento e movimentação. A defesa que impede o ransomware é a mesma que impede o resto, e ela acontece muito antes da tela vermelha aparecer.",
                },
                {
                    type: "quote",
                    value: "Backup que nunca foi restaurado é uma hipótese, não uma cópia. O primeiro teste real não pode ser no dia do incidente.",
                },
            ],
            questions: [
                {
                    statement:
                        "Por que o plano de resposta precisa estar acessível fora do ambiente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Durante o incidente os sistemas podem estar parados",
                            isCorrect: true,
                        },
                        {
                            text: "A norma exige uma via impressa arquivada em cartório",
                            isCorrect: false,
                        },
                        {
                            text: "O plano precisa ser assinado por todos os envolvidos",
                            isCorrect: false,
                        },
                        {
                            text: "A cópia digital fica desatualizada mais rapidamente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o valor de uma simulação de mesa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Revela buracos de decisão que auditoria não pega",
                            isCorrect: true,
                        },
                        {
                            text: "Substitui a necessidade de testar a restauração",
                            isCorrect: false,
                        },
                        {
                            text: "Comprova a eficácia das ferramentas contratadas",
                            isCorrect: false,
                        },
                        {
                            text: "Atende a exigência legal de treinamento periódico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que mede o tempo objetivo de recuperação?",
                    difficulty: "medio",
                    options: [
                        { text: "Quanto tempo o negócio aceita ficar parado", isCorrect: true },
                        { text: "Quanto de trabalho recente se aceita perder", isCorrect: false },
                        { text: "Quanto tempo o invasor permaneceu na rede", isCorrect: false },
                        { text: "Quanto tempo leva para detectar o incidente", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que estimativas de tempo de restauração costumam ser otimistas demais?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O teste real inclui etapas que ninguém contabiliza",
                            isCorrect: true,
                        },
                        {
                            text: "As ferramentas de backup exageram a própria velocidade",
                            isCorrect: false,
                        },
                        {
                            text: "A restauração é sempre feita em horário de menor uso",
                            isCorrect: false,
                        },
                        {
                            text: "Os fornecedores garantem prazos que não são cumpridos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a relação entre defesa contra ransomware e o resto da cadeia de ataque?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É a mesma defesa, aplicada bem antes da cifragem",
                            isCorrect: true,
                        },
                        {
                            text: "São defesas distintas, com ferramentas específicas",
                            isCorrect: false,
                        },
                        {
                            text: "A defesa contra ransomware começa na cifragem em si",
                            isCorrect: false,
                        },
                        {
                            text: "Só o backup importa, o resto da cadeia é secundário",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Depois do acesso inicial",
    aulas: [
        {
            titulo: "Escalonamento de privilégio",
            blocks: [
                {
                    type: "text",
                    value: "# Entrar é fácil, entrar como administrador é o objetivo\n\nO acesso inicial quase sempre chega com pouco poder: a conta de um usuário comum, num notebook comum. Isso permite ler os arquivos daquela pessoa e pouco mais. Para chegar aos servidores, ao diretório de identidades e aos backups, o invasor precisa de privilégio, e é isso que a fase de escalonamento busca.\n\nHá duas direções. O escalonamento vertical vai de usuário comum para administrador da máquina ou do domínio. O horizontal se move para a conta de outro usuário do mesmo nível, o que parece pouco, mas pode ser exatamente o que interessa quando o outro usuário é do financeiro.\n\nA maior parte do escalonamento real não usa falha exótica. Usa configuração descuidada: senha de administrador local igual em todas as máquinas, credencial guardada em texto claro num script de instalação, serviço rodando com conta privilegiada porque alguém não quis descobrir a permissão mínima.",
                },
                {
                    type: "table",
                    value: '[["Caminho","Como acontece","O que corta pela raiz"],["Senha local repetida","Mesma senha de administrador em toda máquina","Senha única e rotacionada por máquina"],["Credencial em script","Senha em texto claro em arquivo de instalação","Cofre de segredo e varredura de repositório"],["Serviço com conta forte","Serviço roda como administrador do domínio","Conta de serviço com permissão mínima"],["Falha do sistema","Exploração de componente sem correção","Correção rápida no que está exposto"],["Permissão herdada","Grupo antigo dá acesso que ninguém revisou","Revisão periódica de grupo privilegiado"]]',
                },
                {
                    type: "text",
                    value: "## Por que senha local repetida é tão perigosa\n\nVale detalhar esse caso porque ele é comum e o efeito é desproporcional. Muitas empresas criam a imagem padrão da estação com uma conta de administrador local e a mesma senha em todas as máquinas, porque facilita o suporte.\n\nBasta o invasor comprometer uma estação qualquer e extrair essa credencial para ter administrador local em todo o parque. Ele não precisou escalar para administrador do domínio: com administrador local em centenas de máquinas, ele espera a próxima vez que alguém do suporte com conta privilegiada fizer login numa delas, e colhe essa credencial ali.\n\nA correção é conhecida e barata: mecanismo que gera senha diferente por máquina, guardada centralmente e rotacionada sozinha. É uma das mudanças com melhor relação entre esforço e redução de risco em ambiente corporativo, e costuma ser das primeiras coisas que um avaliador procura.",
                },
                {
                    type: "quote",
                    value: "Administrador local com a mesma senha em todo o parque transforma uma estação comprometida em todas as estações comprometidas.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o objetivo da fase de escalonamento de privilégio?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sair de conta comum e obter poder administrativo",
                            isCorrect: true,
                        },
                        {
                            text: "Espalhar o acesso para as máquinas vizinhas da rede",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir que o acesso sobreviva ao reinício da máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Copiar os dados sensíveis encontrados nos servidores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é escalonamento horizontal?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Assumir a conta de outro usuário do mesmo nível",
                            isCorrect: true,
                        },
                        {
                            text: "Passar de usuário comum para administrador local",
                            isCorrect: false,
                        },
                        {
                            text: "Mover-se de uma máquina para outra na mesma rede",
                            isCorrect: false,
                        },
                        {
                            text: "Obter acesso ao diretório central de identidades",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a origem mais comum do escalonamento de privilégio na prática?",
                    difficulty: "medio",
                    options: [
                        { text: "Configuração descuidada, não falha exótica", isCorrect: true },
                        {
                            text: "Falha inédita no núcleo do sistema operacional",
                            isCorrect: false,
                        },
                        {
                            text: "Interceptação do tráfego de autenticação da rede",
                            isCorrect: false,
                        },
                        { text: "Quebra da criptografia usada no armazenamento", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que senha de administrador local repetida amplia tanto o impacto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Uma estação comprometida entrega o parque inteiro",
                            isCorrect: true,
                        },
                        {
                            text: "Ela concede acesso direto ao controlador de domínio",
                            isCorrect: false,
                        },
                        {
                            text: "Ela impede que o suporte troque senhas remotamente",
                            isCorrect: false,
                        },
                        {
                            text: "Ela é armazenada sem cifragem no diretório central",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual medida corta pela raiz o problema da senha local repetida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Senha diferente por máquina, rotacionada sozinha",
                            isCorrect: true,
                        },
                        {
                            text: "Bloqueio da conta após tentativas de login falhas",
                            isCorrect: false,
                        },
                        {
                            text: "Exigência de senha longa na imagem padrão usada",
                            isCorrect: false,
                        },
                        {
                            text: "Registro de todo uso da conta de administrador local",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Movimentação lateral",
            blocks: [
                {
                    type: "text",
                    value: "# Caminhar até onde o valor está\n\nO invasor raramente cai onde quer chegar. Ele entra num notebook de alguém do marketing e o objetivo está num servidor de banco de dados três saltos adiante. Movimentação lateral é esse percurso, e ele acontece quase sempre com credenciais válidas e ferramentas legítimas de administração.\n\nÉ o que torna essa fase difícil de detectar por assinatura. As mesmas ferramentas que o time de infraestrutura usa para administrar servidores remotamente são as que o invasor usa, e a diferença não está no programa, está no contexto: quem chamou, de onde, para qual destino, a que horas.\n\nO padrão que denuncia é o de relacionamento. Numa rede saudável, máquinas conversam com poucos destinos previsíveis. Uma estação de marketing que de repente abre sessão administrativa em servidores de três setores diferentes está fazendo algo que nunca fez antes, e isso é visível mesmo sem saber qual ferramenta foi usada.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Por que chama atenção","Como observar"],["Novo par origem e destino","Máquinas que nunca se falaram","Mapa de conexões internas"],["Sessão administrativa incomum","Estação comum administrando servidor","Registro de logon por tipo"],["Uso de conta privilegiada em estação","Conta forte fora do lugar dela","Alerta por conta sensível"],["Ferramenta de administração remota nova","Programa que não faz parte do padrão","Inventário de software"],["Horário atípico","Atividade administrativa de madrugada","Perfil de horário por conta"]]',
                },
                {
                    type: "text",
                    value: "## Segmentar é encurtar o caminho do invasor\n\nA defesa estrutural contra movimentação lateral é a segmentação de rede: separar o ambiente em zonas e permitir apenas o tráfego que precisa existir entre elas. Numa rede plana, comprometer qualquer coisa é estar a um passo de tudo. Numa rede segmentada, o invasor precisa achar uma passagem a cada fronteira, e cada tentativa é uma chance de ser visto.\n\nUm caso especial merece atenção: estação de trabalho não precisa falar com outra estação de trabalho. Bloquear esse tráfego, chamado de isolamento entre pares, elimina de uma vez um dos caminhos mais usados para espalhar acesso e ransomware, e quase nunca quebra algo legítimo.\n\nA segunda medida estrutural é o modelo de camadas para contas administrativas: a conta que administra servidores críticos não faz login em estação comum. Assim, comprometer a estação de um administrador não entrega a credencial mais poderosa, porque ela nunca esteve ali.",
                },
                {
                    type: "quote",
                    value: "Numa rede plana, comprometer qualquer coisa é estar a um passo de tudo. A segmentação não impede o invasor de andar, ela o obriga a fazer barulho a cada fronteira.",
                },
            ],
            questions: [
                {
                    statement: "O que é movimentação lateral?",
                    difficulty: "facil",
                    options: [
                        { text: "O percurso do invasor até onde está o valor", isCorrect: true },
                        {
                            text: "A troca de conta comum por conta administrativa",
                            isCorrect: false,
                        },
                        {
                            text: "A cópia dos dados sensíveis para fora da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "O mecanismo que faz o acesso voltar após reinício",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a movimentação lateral é difícil de detectar por assinatura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Usa credenciais válidas e ferramentas legítimas",
                            isCorrect: true,
                        },
                        {
                            text: "Ocorre inteiramente dentro da memória do processo",
                            isCorrect: false,
                        },
                        {
                            text: "Usa protocolos cifrados que ninguém inspeciona",
                            isCorrect: false,
                        },
                        {
                            text: "Acontece rápido demais para gerar qualquer registro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que padrão costuma denunciar movimentação lateral?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Máquinas que nunca conversaram passam a conversar",
                            isCorrect: true,
                        },
                        {
                            text: "Aumento súbito do consumo de memória nos servidores",
                            isCorrect: false,
                        },
                        {
                            text: "Falhas repetidas de autenticação na mesma conta",
                            isCorrect: false,
                        },
                        {
                            text: "Instalação de programas sem assinatura na estação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o isolamento entre estações de trabalho elimina?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um dos caminhos mais usados para espalhar acesso",
                            isCorrect: true,
                        },
                        { text: "A necessidade de segmentar o restante da rede", isCorrect: false },
                        {
                            text: "O risco de credencial administrativa ser roubada",
                            isCorrect: false,
                        },
                        {
                            text: "A possibilidade de o invasor alcançar servidores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a ideia do modelo de camadas para contas administrativas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A conta que administra o crítico não entra em estação",
                            isCorrect: true,
                        },
                        {
                            text: "Cada administrador usa uma senha diferente por sistema",
                            isCorrect: false,
                        },
                        {
                            text: "As contas administrativas expiram ao fim do expediente",
                            isCorrect: false,
                        },
                        {
                            text: "Os administradores acessam tudo por um único portal",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Comando e controle",
            blocks: [
                {
                    type: "text",
                    value: "# O canal que mantém o invasor no jogo\n\nDepois de instalar o acesso, o invasor precisa conversar com a máquina comprometida: enviar comandos e receber resultados. Esse canal é o comando e controle, escrito muitas vezes como C2. Entender como ele se comporta importa para quem defende, porque é uma das etapas com sinal mais consistente na rede.\n\nO desenho quase universal é o de saída: a máquina comprometida é quem inicia a conexão para fora, em intervalos regulares, perguntando se há comando novo. Isso não é por elegância, é por necessidade: firewall corporativo bloqueia conexão vinda de fora, mas costuma permitir a saída para a internet.\n\nEssa periodicidade tem nome, batimento, e é o sinal característico. Um usuário navegando gera tráfego irregular, com pausas e rajadas. Uma máquina consultando um servidor a cada intervalo fixo, dia e noite, inclusive quando ninguém está usando o computador, tem uma regularidade que a atividade humana não tem.",
                },
                {
                    type: "table",
                    value: '[["Característica","Como se manifesta","Por que ajuda o defensor"],["Saída iniciada pela vítima","Conexão parte de dentro para fora","Concentra a busca no tráfego de saída"],["Batimento periódico","Consulta em intervalos regulares","Regularidade destoa do uso humano"],["Domínio recém-criado","Destino registrado há poucos dias","Idade do domínio é sinal barato"],["Canal em serviço legítimo","Usa plataforma pública conhecida","Exige olhar volume e destino, não reputação"],["Atividade fora de expediente","Conversa quando ninguém trabalha","Perfil de horário revela"]]',
                },
                {
                    type: "text",
                    value: "## Quando o canal se esconde no que é normal\n\nA evolução esperada foi os operadores abandonarem servidores próprios e passarem a usar serviços legítimos como intermediários: plataformas de armazenamento em nuvem, redes sociais, serviços de colaboração. O tráfego vai para um domínio conhecido, com reputação boa e certificado válido, e bloquear aquele destino é impossível porque a empresa inteira o usa.\n\nContra isso, reputação de destino perde força e sobram três sinais. O primeiro é volume: uma estação que envia muito mais do que recebe para um serviço de armazenamento é estranha, porque o normal é o inverso. O segundo é a regularidade, que sobrevive à mudança de destino. O terceiro é o contexto do processo: um utilitário de sistema falando com um serviço de nuvem não é o mesmo que o navegador fazendo isso.\n\nRepare que esta aula descreve o comportamento do canal para você reconhecê-lo no log, e não como construir um. Montar infraestrutura de comando e controle está fora do escopo desta trilha e do roadmap por decisão de projeto: o que forma um bom profissional aqui é saber identificar o padrão, não reproduzi-lo.",
                },
                {
                    type: "quote",
                    value: "Gente navega em rajadas e pausas. Máquina comprometida conversa no mesmo intervalo, de madrugada, todo dia. A regularidade é o que a entrega.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve o canal de comando e controle?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Enviar comandos e receber resultados da máquina",
                            isCorrect: true,
                        },
                        {
                            text: "Cifrar os arquivos encontrados no disco da vítima",
                            isCorrect: false,
                        },
                        {
                            text: "Propagar o acesso para outras máquinas da rede",
                            isCorrect: false,
                        },
                        {
                            text: "Ocultar os processos maliciosos do sistema local",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a conexão do canal costuma ser iniciada de dentro para fora?",
                    difficulty: "medio",
                    options: [
                        { text: "O firewall bloqueia entrada e permite a saída", isCorrect: true },
                        { text: "A conexão de saída não fica registrada em log", isCorrect: false },
                        { text: "O protocolo usado só funciona nesse sentido", isCorrect: false },
                        {
                            text: "A máquina comprometida não aceita conexões novas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o batimento nesse contexto?",
                    difficulty: "medio",
                    options: [
                        { text: "A consulta periódica em intervalos regulares", isCorrect: true },
                        {
                            text: "O primeiro contato após a instalação do acesso",
                            isCorrect: false,
                        },
                        { text: "O envio do lote final de dados exfiltrados", isCorrect: false },
                        { text: "A troca de chaves feita ao abrir a conexão", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Quando o canal usa um serviço legítimo popular, que sinal ainda ajuda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Volume invertido: envia muito mais do que recebe",
                            isCorrect: true,
                        },
                        {
                            text: "Reputação ruim do domínio consultado pela máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Ausência de certificado válido na conexão cifrada",
                            isCorrect: false,
                        },
                        {
                            text: "Uso de porta não padrão para o serviço acessado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o processo que gera o tráfego é um sinal relevante?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Utilitário de sistema falando com nuvem é atípico",
                            isCorrect: true,
                        },
                        {
                            text: "Só o navegador consegue abrir conexões cifradas",
                            isCorrect: false,
                        },
                        {
                            text: "Processos do sistema não registram tráfego no log",
                            isCorrect: false,
                        },
                        {
                            text: "O nome do processo identifica o grupo responsável",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Coleta e exfiltração",
            blocks: [
                {
                    type: "text",
                    value: "# O momento em que o dano vira permanente\n\nColeta é reunir o que interessa: vasculhar compartilhamentos, bases de dados, caixas de correio e pastas de projeto atrás do que tem valor. Exfiltração é tirar isso da empresa. Diferente de quase tudo que veio antes, essa etapa é irreversível: sistema cifrado se restaura, dado que saiu não volta.\n\nA coleta costuma deixar rastro característico. Uma conta que normalmente abre uma dúzia de arquivos por dia passa a listar diretórios inteiros e ler milhares de documentos em minutos. Esse padrão de leitura em massa é bem diferente do uso humano e aparece no registro de acesso a arquivos, quando ele existe.\n\nAntes de enviar, o invasor quase sempre compacta e protege com senha, por dois motivos práticos: reduz o volume e impede que qualquer inspeção de conteúdo no caminho identifique o que está sendo levado. Um arquivo compactado grande, protegido por senha, criado numa pasta temporária, é um dos indicadores mais úteis desta fase.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Como se parece","Por que é forte"],["Leitura em massa","Milhares de arquivos lidos em minutos","Humano não trabalha assim"],["Compactado protegido","Arquivo grande com senha em pasta temporária","Preparação clássica de envio"],["Saída em volume","Muitos dados subindo para fora","Inverte o padrão normal de uso"],["Transferência lenta e contínua","Envio fatiado ao longo de dias","Tentativa de ficar abaixo do limiar"],["Destino de armazenamento","Serviço de nuvem incomum para a empresa","Fácil de comparar com a linha de base"]]',
                },
                {
                    type: "text",
                    value: "## Detectar sem ler o conteúdo de todo mundo\n\nUma dúvida legítima aparece aqui: para perceber a saída de dados é preciso inspecionar tudo que os funcionários enviam? Não, e há bons motivos para não fazer isso, de privacidade e de esforço.\n\nO caminho prático é olhar metadados. Quanto saiu, para onde, por qual processo, em que horário, comparado ao que aquela máquina e aquele usuário costumam fazer. Isso detecta a anomalia sem abrir conteúdo, e funciona mesmo quando o tráfego é cifrado, que é o caso quase sempre.\n\nO segundo caminho é etiquetar o dado que importa de verdade. Em vez de vigiar tudo igualmente, identifique onde estão as bases realmente sensíveis e concentre o monitoramento ali. É mais barato, gera menos alarme falso e protege melhor o que de fato faria diferença num vazamento.",
                },
                {
                    type: "quote",
                    value: "Sistema cifrado se restaura, dado que saiu não volta. Por isso a exfiltração é a etapa em que detectar tarde e detectar nunca dão quase no mesmo.",
                },
            ],
            questions: [
                {
                    statement: "Por que a exfiltração é considerada uma etapa irreversível?",
                    difficulty: "facil",
                    options: [
                        { text: "Dado que saiu não pode ser trazido de volta", isCorrect: true },
                        {
                            text: "Os arquivos originais são apagados ao serem enviados",
                            isCorrect: false,
                        },
                        { text: "O envio corrompe as cópias mantidas em backup", isCorrect: false },
                        {
                            text: "A cifragem posterior impede qualquer restauração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que sinal caracteriza a fase de coleta?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Leitura de milhares de arquivos em poucos minutos",
                            isCorrect: true,
                        },
                        {
                            text: "Criação de contas novas com privilégio elevado",
                            isCorrect: false,
                        },
                        {
                            text: "Conexões regulares para um mesmo destino externo",
                            isCorrect: false,
                        },
                        {
                            text: "Instalação de ferramenta de administração remota",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o invasor compacta e protege com senha antes de enviar?",
                    difficulty: "medio",
                    options: [
                        { text: "Reduz volume e impede inspeção do conteúdo", isCorrect: true },
                        {
                            text: "Acelera a cifragem posterior dos mesmos arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "Garante que o destino aceite o formato enviado",
                            isCorrect: false,
                        },
                        {
                            text: "Evita que o antivírus examine os arquivos lidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como detectar saída anômala de dados sem inspecionar o conteúdo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Comparando metadados com a linha de base do uso",
                            isCorrect: true,
                        },
                        {
                            text: "Bloqueando todo tráfego cifrado que sai da empresa",
                            isCorrect: false,
                        },
                        {
                            text: "Exigindo que todo envio passe por aprovação prévia",
                            isCorrect: false,
                        },
                        {
                            text: "Registrando o conteúdo apenas de contas privilegiadas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que envio fatiado ao longo de vários dias é usado pelo invasor?",
                    difficulty: "medio",
                    options: [
                        { text: "Para ficar abaixo do limiar que dispara alerta", isCorrect: true },
                        {
                            text: "Para evitar sobrecarregar o servidor de destino",
                            isCorrect: false,
                        },
                        {
                            text: "Para permitir a cifragem simultânea dos arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "Para contornar limites de tamanho do compactador",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Anti-forense e limpeza de rastro",
            blocks: [
                {
                    type: "text",
                    value: "# Apagar o log é apagar a prova, e também é uma prova\n\nInvasores tentam dificultar a investigação. Apagam registros de eventos, alteram data de arquivos, removem ferramentas usadas, limpam histórico de comandos. O conjunto dessas ações é chamado de anti-forense, e entendê-la muda a forma como você guarda evidência.\n\nO ponto central é o seguinte: enquanto o registro estiver na mesma máquina que o invasor controla, ele pode ser apagado. Se ele já foi enviado para um servidor central que a máquina não pode alterar, apagar localmente não adianta, e o próprio ato de apagar vira um evento registrado lá.\n\nÉ por isso que centralizar log não é preferência de arquitetura, é medida de segurança. Sem centralização você depende da boa vontade do invasor de não limpar nada. Com ela, a limpeza local passa de encobrimento a denúncia.",
                },
                {
                    type: "table",
                    value: '[["Técnica","O que o invasor busca","O que a neutraliza"],["Apagar log de eventos","Remover o histórico das ações","Envio imediato para servidor central"],["Alterar data de arquivo","Confundir a linha do tempo","Correlacionar com fontes independentes"],["Limpar histórico de comandos","Esconder o que foi executado","Registro de execução de processo"],["Remover ferramentas usadas","Dificultar a identificação","Registro de criação de arquivo"],["Desligar o registro","Cegar o monitoramento","Alerta quando o registro para"]]',
                },
                {
                    type: "text",
                    value: "## Ausência de dado também é dado\n\nUma habilidade que separa analista experiente de iniciante é reparar no silêncio. Um servidor que enviava mil eventos por hora e parou de enviar não ficou tranquilo, ele parou de falar, e isso merece a mesma atenção que um alerta.\n\nPor isso equipes maduras monitoram a própria saúde da coleta: alerta quando uma fonte para de reportar, quando o volume cai muito abaixo do esperado, quando um agente é desinstalado. Esses alertas costumam ser os mais valiosos e são justamente os que ninguém lembra de configurar.\n\nA última recomendação é sobre ordem de trabalho no incidente. Ao suspeitar de comprometimento, preserve antes de mexer: copie os registros relevantes, guarde a imagem da máquina se possível, anote horários. Investigar direto na máquina viva destrói evidência sem querer, e depois não há como recuperar o que foi sobrescrito.",
                },
                {
                    type: "quote",
                    value: "A fonte que parou de enviar evento não está tranquila, está calada. Silêncio inesperado no monitoramento merece a mesma atenção que um alerta vermelho.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza as técnicas anti-forenses?",
                    difficulty: "facil",
                    options: [
                        { text: "Ações para dificultar a investigação posterior", isCorrect: true },
                        { text: "Ações para manter o acesso após o reinício", isCorrect: false },
                        { text: "Ações para elevar o privilégio na máquina", isCorrect: false },
                        {
                            text: "Ações para acelerar a cópia dos dados roubados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que centralizar registros é medida de segurança?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O invasor não consegue apagar o que já saiu da máquina",
                            isCorrect: true,
                        },
                        {
                            text: "O servidor central cifra os eventos ao recebê-los",
                            isCorrect: false,
                        },
                        {
                            text: "A coleta central reduz o volume gerado por máquina",
                            isCorrect: false,
                        },
                        {
                            text: "O registro local deixa de ser gravado no disco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com registros centralizados, o que acontece quando o invasor limpa o log local?",
                    difficulty: "medio",
                    options: [
                        { text: "O próprio ato de apagar fica registrado", isCorrect: true },
                        { text: "O servidor central perde os eventos antigos", isCorrect: false },
                        { text: "A máquina para de enviar novos eventos", isCorrect: false },
                        {
                            text: "O histórico precisa ser reconstruído do backup",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que uma fonte que para de enviar eventos merece atenção?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O silêncio pode indicar que alguém cegou a coleta",
                            isCorrect: true,
                        },
                        {
                            text: "A falta de eventos significa ausência de atividade",
                            isCorrect: false,
                        },
                        {
                            text: "O servidor central descarta fontes inativas sozinho",
                            isCorrect: false,
                        },
                        {
                            text: "A retenção configurada expira quando não há envio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a ordem correta ao suspeitar de comprometimento numa máquina?",
                    difficulty: "medio",
                    options: [
                        { text: "Preservar a evidência antes de investigar nela", isCorrect: true },
                        { text: "Investigar na máquina viva e preservar depois", isCorrect: false },
                        {
                            text: "Reinstalar o sistema e analisar o backup antigo",
                            isCorrect: false,
                        },
                        { text: "Executar o antivírus antes de qualquer coleta", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Do ataque à defesa",
    aulas: [
        {
            titulo: "Lendo uma técnica do ATT&CK",
            blocks: [
                {
                    type: "text",
                    value: "# A página que você vai consultar a carreira inteira\n\nCada técnica do ATT&CK tem uma página com estrutura fixa, e saber lê-la rápido é uma habilidade prática. No topo vem o identificador, algo como T seguido de quatro dígitos, e a lista de táticas a que ela serve. A mesma técnica pode servir a mais de um objetivo, e isso não é erro de catálogo: criar uma tarefa agendada serve tanto para persistir quanto para executar código.\n\nDepois vem a descrição do comportamento, seguida das subtécnicas, que são as variações concretas. Em seguida há duas listas que costumam ser as mais úteis para quem defende. A de mitigações diz o que muda no ambiente para a técnica não funcionar. A de detecções diz que fonte de dado observar e o que procurar nela.\n\nO campo de exemplos de procedimento fecha a página, listando grupos e programas que usaram aquilo em campanhas reais. É o que transforma a técnica de conceito abstrato em algo com endereço no mundo.",
                },
                {
                    type: "table",
                    value: '[["Seção da página","O que traz","Como você usa"],["Identificador e táticas","Código e objetivos atendidos","Referência sem ambiguidade em relatório"],["Descrição","O comportamento em si","Entender o que procurar"],["Subtécnicas","Variações concretas","Saber qual variação seu ambiente sofre"],["Mitigações","Mudanças no ambiente","Priorizar o que reduz risco na raiz"],["Detecções","Fonte de dado e o que observar","Escrever ou revisar uma regra"],["Exemplos de procedimento","Grupos que usaram","Avaliar relevância para o seu setor"]]',
                },
                {
                    type: "text",
                    value: "## Mitigação e detecção não são a mesma coisa\n\nVale separar bem esses dois campos, porque confundi-los é erro comum. Mitigar é impedir que a técnica funcione, mexendo em configuração, permissão ou arquitetura. Detectar é perceber que alguém tentou. As duas são necessárias e resolvem problemas diferentes.\n\nMitigação é sempre preferível quando é possível, porque não depende de ninguém estar de plantão. Uma configuração que bloqueia a execução de macro de origem externa protege de madrugada, no feriado e quando o time está reduzido. Detecção depende de alguém ver o alerta e agir.\n\nAcontece que muitas técnicas não têm mitigação viável, porque bloquear a capacidade quebraria uso legítimo. Ninguém vai proibir tarefa agendada ou o interpretador de comandos numa empresa. Para essas, detecção é a única resposta possível, e é justamente aí que o trabalho do analista concentra valor.",
                },
                {
                    type: "quote",
                    value: "Mitigação protege enquanto todo mundo dorme. Detecção só protege se alguém estiver acordado. Prefira mitigar; detecte o que não dá para mitigar.",
                },
            ],
            questions: [
                {
                    statement: "Por que uma mesma técnica pode aparecer em mais de uma tática?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O mesmo comportamento atende a objetivos diferentes",
                            isCorrect: true,
                        },
                        {
                            text: "O catálogo mantém entradas duplicadas por histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Cada tática exige uma técnica exclusiva registrada",
                            isCorrect: false,
                        },
                        {
                            text: "A classificação muda conforme o grupo que a usou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre mitigação e detecção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mitigar impede a técnica; detectar percebe a tentativa",
                            isCorrect: true,
                        },
                        {
                            text: "Mitigar é feito na rede; detectar é feito no endpoint",
                            isCorrect: false,
                        },
                        {
                            text: "Mitigar vale para malware; detectar vale para intrusão",
                            isCorrect: false,
                        },
                        {
                            text: "Mitigar é automático; detectar exige ferramenta paga",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que mitigação é preferível quando é viável?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela não depende de alguém estar de plantão", isCorrect: true },
                        { text: "Ela gera menos registros para o time analisar", isCorrect: false },
                        { text: "Ela funciona mesmo sem inventário atualizado", isCorrect: false },
                        {
                            text: "Ela custa menos que qualquer regra de detecção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que algumas técnicas não têm mitigação viável em ambiente corporativo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Bloquear a capacidade quebraria uso legítimo", isCorrect: true },
                        {
                            text: "As mitigações existentes exigem licença específica",
                            isCorrect: false,
                        },
                        {
                            text: "O catálogo ainda não documentou essas mitigações",
                            isCorrect: false,
                        },
                        {
                            text: "As técnicas mudam rápido demais para serem barradas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual seção da página de uma técnica indica onde procurar evidência?",
                    difficulty: "medio",
                    options: [
                        { text: "A de detecções, com a fonte de dado a observar", isCorrect: true },
                        { text: "A de exemplos, com os grupos que já a usaram", isCorrect: false },
                        { text: "A de subtécnicas, com as variações concretas", isCorrect: false },
                        { text: "A de identificador, com as táticas atendidas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Indicadores: IoC e IoA",
            blocks: [
                {
                    type: "text",
                    value: "# Duas formas de reconhecer um ataque\n\nIndicador de comprometimento, ou IoC, é um dado concreto associado a algo malicioso já conhecido: um resumo criptográfico de arquivo, um endereço de rede, um nome de domínio. É fácil de compartilhar e de aplicar, porque comparar valores é barato.\n\nIndicador de ataque, ou IoA, descreve um comportamento suspeito independente de artefato específico: um processo de editor de texto abrindo um interpretador de comandos, uma conta administrativa fazendo login em dez servidores em minutos. Não importa qual programa foi usado, importa a sequência de ações.\n\nA diferença prática está na durabilidade. Trocar um domínio ou recompilar um arquivo custa minutos para o invasor, e o IoC morre. Mudar o método de trabalho custa muito mais, e é por isso que o IoA envelhece melhor. Um bom programa de detecção usa os dois, com expectativas diferentes de cada um.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Indicador de comprometimento","Indicador de ataque"],["Natureza","Dado concreto e específico","Comportamento observado"],["Exemplo","Domínio usado numa campanha","Documento abrindo interpretador"],["Custo para o invasor driblar","Baixo, troca em minutos","Alto, exige mudar o método"],["Falso positivo","Raro","Mais frequente, exige ajuste"],["Melhor uso","Varredura retroativa e bloqueio","Detecção do que ainda não se conhece"]]',
                },
                {
                    type: "text",
                    value: "## A pirâmide da dor, em uma frase\n\nExiste um conceito clássico que organiza isso: quanto mais alto na escala está o que você detecta, mais dói para o invasor contornar. Na base ficam resumos de arquivo, triviais de mudar. Acima vêm endereços e domínios, ainda baratos. No topo ficam as táticas, técnicas e procedimentos, que representam o jeito de trabalhar e custam caro para abandonar.\n\nA leitura prática é de investimento. Bloquear listas de indicadores é útil, barato e deve ser feito, mas não constrói defesa duradoura sozinho. O esforço de engenharia deve ir para detecção de comportamento, porque é ela que continua funcionando contra a próxima campanha do mesmo grupo.\n\nUma consequência menos óbvia é sobre expectativa de ruído. Detecção por indicador quase não gera alarme falso, e detecção por comportamento gera, porque comportamento suspeito às vezes é só trabalho legítimo incomum. Isso não é defeito da abordagem: é o preço de detectar o que ainda não tem nome, e o trabalho de ajuste faz parte do serviço.",
                },
                {
                    type: "quote",
                    value: "Trocar um domínio custa minutos ao invasor. Trocar o jeito de trabalhar custa meses. Detecte o que dói mais para ele abandonar.",
                },
            ],
            questions: [
                {
                    statement: "O que é um indicador de comprometimento?",
                    difficulty: "facil",
                    options: [
                        { text: "Um dado concreto ligado a algo já conhecido", isCorrect: true },
                        { text: "Uma sequência de ações considerada suspeita", isCorrect: false },
                        { text: "Uma falha do sistema ainda sem correção", isCorrect: false },
                        { text: "Um registro gerado ao bloquear uma conexão", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza um indicador de ataque?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descreve comportamento, não artefato específico",
                            isCorrect: true,
                        },
                        {
                            text: "Identifica o arquivo pelo seu resumo criptográfico",
                            isCorrect: false,
                        },
                        { text: "Aponta o endereço de origem usado na conexão", isCorrect: false },
                        { text: "Registra a falha explorada para obter acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que indicadores de comprometimento envelhecem rápido?",
                    difficulty: "medio",
                    options: [
                        { text: "Trocar domínio ou recompilar custa muito pouco", isCorrect: true },
                        { text: "As listas públicas são atualizadas com atraso", isCorrect: false },
                        { text: "As ferramentas descartam indicadores antigos", isCorrect: false },
                        { text: "Os grupos abandonam campanhas em poucos dias", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a pirâmide da dor propõe?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Quanto mais alto o indicador, mais custa contorná-lo",
                            isCorrect: true,
                        },
                        {
                            text: "Quanto mais indicadores, menor a chance de invasão",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto mais grave a falha, mais rápido corrigi-la",
                            isCorrect: false,
                        },
                        {
                            text: "Quanto mais fontes de log, melhor a visibilidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que detecção por comportamento gera mais alarme falso que por indicador?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Trabalho legítimo incomum se parece com o suspeito",
                            isCorrect: true,
                        },
                        { text: "As fontes de dado usadas são menos confiáveis", isCorrect: false },
                        { text: "As regras precisam rodar em tempo real sempre", isCorrect: false },
                        { text: "O volume de eventos analisados é sempre maior", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Inteligência de ameaças na prática",
            blocks: [
                {
                    type: "text",
                    value: "# Informação vira inteligência quando muda uma decisão\n\nInteligência de ameaças é informação sobre adversários processada de forma a apoiar decisão. A palavra que faz o trabalho é decisão. Uma lista de mil domínios maliciosos é informação; ela vira inteligência quando responde a uma pergunta que alguém precisava responder para agir.\n\nA área costuma separar três níveis. O estratégico fala com a direção, sobre tendência e risco de negócio, e sustenta decisão de investimento. O operacional fala com quem defende, sobre campanhas e métodos ativos contra o seu setor, e orienta o que detectar primeiro. O tático é o mais concreto, com indicadores prontos para alimentar as ferramentas.\n\nO erro clássico de quem começa é consumir só o nível tático, porque é o que chega pronto, e concluir que inteligência é uma assinatura de listas. O nível que mais muda resultado é o operacional: saber que campanhas contra o seu ramo estão entrando por um método específico permite priorizar a defesa daquele caminho antes de ser alvo.",
                },
                {
                    type: "table",
                    value: '[["Nível","Público","Pergunta que responde"],["Estratégico","Direção","Onde investir no próximo ciclo"],["Operacional","Time de defesa","Que método priorizar agora"],["Tático","Ferramentas","O que bloquear ou procurar hoje"]]',
                },
                {
                    type: "text",
                    value: "## Relevância vale mais que volume\n\nA tentação natural é assinar tudo que existir e despejar nas ferramentas. O resultado costuma ser ruim: milhares de indicadores irrelevantes, alertas demais e o time cansado, o que na prática reduz a segurança em vez de aumentar.\n\nUm bom filtro tem três perguntas. Isso afeta tecnologia que eu uso? Isso afeta o meu setor ou a minha região? Eu conseguiria agir com essa informação hoje? Se as três respostas forem não, aquele item não deveria ocupar espaço na sua operação.\n\nVale ainda uma nota sobre confiança. Nem toda informação de ameaça é igualmente sólida, e relatórios sérios indicam nível de confiança e fonte. Tratar tudo como certeza leva a bloquear serviços legítimos e a acusar terceiros sem base. Como visto no módulo sobre atores, descrever o observado é papel do analista; afirmar autoria é outra coisa.",
                },
                {
                    type: "quote",
                    value: "Assinar toda lista disponível não aumenta segurança, aumenta ruído. O time cansado de alerta é uma vulnerabilidade que nenhuma ferramenta corrige.",
                },
            ],
            questions: [
                {
                    statement: "O que transforma informação em inteligência de ameaças?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ela apoiar uma decisão que alguém precisa tomar",
                            isCorrect: true,
                        },
                        {
                            text: "Ela vir de uma fonte comercial paga e confiável",
                            isCorrect: false,
                        },
                        { text: "Ela ser publicada por um órgão governamental", isCorrect: false },
                        { text: "Ela conter indicadores prontos para bloqueio", isCorrect: false },
                    ],
                },
                {
                    statement: "A quem se destina a inteligência de nível estratégico?",
                    difficulty: "medio",
                    options: [
                        { text: "À direção, para decisão de investimento", isCorrect: true },
                        { text: "Ao time de defesa, para priorizar detecção", isCorrect: false },
                        { text: "Às ferramentas, para bloqueio automático", isCorrect: false },
                        { text: "Ao time de resposta, durante o incidente", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual erro é comum em quem começa a consumir inteligência de ameaças?",
                    difficulty: "medio",
                    options: [
                        { text: "Consumir só o nível tático e parar por ali", isCorrect: true },
                        { text: "Consumir só o nível estratégico da direção", isCorrect: false },
                        {
                            text: "Ignorar relatórios que indicam nível de confiança",
                            isCorrect: false,
                        },
                        { text: "Compartilhar indicadores com outras empresas", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que assinar todas as fontes disponíveis pode reduzir a segurança?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Excesso de alerta cansa o time e piora a resposta",
                            isCorrect: true,
                        },
                        {
                            text: "As fontes se contradizem e invalidam os bloqueios",
                            isCorrect: false,
                        },
                        { text: "O custo consome o orçamento de outras defesas", isCorrect: false },
                        {
                            text: "As ferramentas não suportam tantos indicadores",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual pergunta ajuda a filtrar o que é relevante?",
                    difficulty: "medio",
                    options: [
                        { text: "Eu conseguiria agir com essa informação hoje", isCorrect: true },
                        { text: "Essa fonte é a mais citada no mercado atual", isCorrect: false },
                        {
                            text: "Esse indicador foi publicado nas últimas horas",
                            isCorrect: false,
                        },
                        { text: "Esse relatório nomeia o grupo responsável", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Mapeando um incidente ao ATT&CK",
            blocks: [
                {
                    type: "text",
                    value: "# Do relato confuso à narrativa organizada\n\nIncidente real não chega organizado. Chega como um usuário reclamando de lentidão, um alerta de antivírus e um servidor que reiniciou sozinho. O trabalho de mapear ao ATT&CK é transformar esse amontoado numa narrativa: o que aconteceu, em que ordem e com qual objetivo em cada passo.\n\nO método é direto. Liste cada observação com horário. Para cada uma, pergunte que objetivo do invasor ela atende, o que dá a tática. Depois pergunte de que forma aquilo foi feito, o que dá a técnica. Por fim, ordene por horário e olhe os buracos: se você tem acesso inicial e exfiltração, mas nada no meio, faltou visibilidade, não faltou ataque.\n\nEsse último ponto é o mais valioso do exercício. O mapa mostra onde você enxerga e onde é cego, e a cegueira encontrada vira lista de trabalho concreta para melhorar coleta antes do próximo incidente.",
                },
                {
                    type: "table",
                    value: '[["Observação no incidente","Objetivo provável","Técnica correspondente"],["Anexo aberto por usuário","Acesso inicial","Anexo de phishing"],["Tarefa agendada criada","Persistência","Tarefa agendada"],["Conta de administrador usada às 3h","Escalonamento","Uso de conta válida"],["Sessão remota para três servidores","Movimentação lateral","Serviço remoto"],["Compactado grande com senha","Coleta","Dados preparados para envio"],["Envio para armazenamento externo","Exfiltração","Transferência para nuvem"]]',
                },
                {
                    type: "text",
                    value: "## O que fazer com o mapa pronto\n\nO primeiro uso é a comunicação. Um mapa em ordem cronológica, com objetivo e método de cada passo, explica o incidente para a direção sem jargão desnecessário e sustenta decisão sobre investimento.\n\nO segundo uso é a melhoria concreta. Para cada técnica identificada, existe a pergunta dupla que você já conhece: dá para mitigar? Se não, o que precisamos coletar para detectar da próxima vez? Assim o incidente deixa de ser só prejuízo e vira insumo de engenharia.\n\nO terceiro uso é medir progresso ao longo do tempo. Guardando os mapas de vários incidentes, a equipe enxerga as técnicas que se repetem e mede se as lacunas de visibilidade estão diminuindo. É uma das poucas formas honestas de responder se a segurança está melhorando, em vez de apenas se sentindo mais segura.",
                },
                {
                    type: "quote",
                    value: "Se o mapa tem começo e fim mas nada no meio, isso não significa que o invasor pulou etapas. Significa que você não enxergou as do meio.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o objetivo de mapear um incidente ao ATT&CK?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Transformar observações soltas em narrativa ordenada",
                            isCorrect: true,
                        },
                        {
                            text: "Identificar com precisão o grupo criminoso envolvido",
                            isCorrect: false,
                        },
                        {
                            text: "Calcular o prejuízo financeiro causado pelo ataque",
                            isCorrect: false,
                        },
                        {
                            text: "Definir se o caso deve ser reportado ao regulador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Ao analisar cada observação, qual pergunta revela a tática?",
                    difficulty: "medio",
                    options: [
                        { text: "Que objetivo do invasor essa ação atende", isCorrect: true },
                        { text: "Que ferramenta foi usada para executá-la", isCorrect: false },
                        { text: "Que usuário estava conectado no momento", isCorrect: false },
                        { text: "Que sistema operacional a máquina usava", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O mapa mostra acesso inicial e exfiltração, mas nada entre os dois. O que isso indica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Falta de visibilidade nas etapas intermediárias",
                            isCorrect: true,
                        },
                        { text: "Que o invasor pulou as etapas intermediárias", isCorrect: false },
                        {
                            text: "Que o ataque foi automatizado do início ao fim",
                            isCorrect: false,
                        },
                        { text: "Que os dados saíram no mesmo acesso inicial", isCorrect: false },
                    ],
                },
                {
                    statement: "Que pergunta dupla se faz para cada técnica identificada no mapa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dá para mitigar e, se não, o que coletar para detectar",
                            isCorrect: true,
                        },
                        {
                            text: "Quem foi o responsável e qual prejuízo isso causou",
                            isCorrect: false,
                        },
                        {
                            text: "Qual ferramenta bloqueia e quanto ela vai custar",
                            isCorrect: false,
                        },
                        {
                            text: "Quando ocorreu e quem estava de plantão no momento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como guardar mapas de vários incidentes ajuda a equipe?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra técnicas repetidas e lacunas que persistem",
                            isCorrect: true,
                        },
                        {
                            text: "Comprova a eficácia das ferramentas contratadas",
                            isCorrect: false,
                        },
                        {
                            text: "Reduz o tempo de resposta do próximo incidente",
                            isCorrect: false,
                        },
                        {
                            text: "Atende a exigência legal de retenção de evidência",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O que você leva desta trilha",
            blocks: [
                {
                    type: "text",
                    value: "# Você aprendeu a pensar como quem ataca, para defender melhor\n\nO fio que atravessou os sete módulos foi um só: ataque é sequência, não evento. Você percorreu essa sequência inteira, do reconhecimento que nem toca o seu servidor até a exfiltração que não tem volta, e em cada parada a pergunta foi a mesma, que sinal isso deixa.\n\nEsse deslocamento de perspectiva é o que separa quem decora ferramenta de quem entende o ofício. Saber que credencial válida é hoje o vetor de entrada mais comum muda o que você monitora. Saber que backup é alvo prioritário do ransomware muda como você desenha a cópia. Saber que persistência precisa ficar gravada muda onde você procura.\n\nGuarde também as três honestidades que apareceram no caminho. A maioria dos ataques é oportunista, não dirigida a você. Atribuição é difícil e frequentemente errada, então descreva o que observou. E ausência de dado é dado: o silêncio de uma fonte merece a mesma atenção que um alerta.",
                },
                {
                    type: "table",
                    value: '[["Etapa","O que você reconhece agora","Onde procurar"],["Acesso inicial","Credencial válida, phishing, serviço exposto","Registro de autenticação e correio"],["Persistência","Tarefa, serviço, conta ou chave nova","Inventário comparado à linha de base"],["Escalonamento","Senha local repetida e conta de serviço forte","Uso de conta privilegiada"],["Movimentação","Pares de máquinas que nunca se falaram","Mapa de conexões internas"],["Comando e controle","Batimento regular e volume invertido","Tráfego de saída e processo de origem"],["Exfiltração","Leitura em massa e compactado com senha","Acesso a arquivo e metadados de saída"]]',
                },
                {
                    type: "text",
                    value: "## Para onde isso aponta\n\nEsta trilha te deu o lado do ataque. A próxima do seu roadmap pega exatamente esses rastros e transforma em ofício: como o centro de operações de segurança coleta esses dados, escreve as detecções que disparam a partir deles, faz a triagem dos alertas que chegam e conduz a resposta quando um deles é verdadeiro.\n\nA transição é direta. Cada sinal listado na tabela acima vira uma regra, uma fonte de dado a integrar ou uma pergunta de triagem. O que aqui foi conhecimento sobre o adversário lá vira procedimento de trabalho.\n\nUma sugestão de estudo antes de seguir: escolha uma notícia recente de incidente e tente reconstruir a sequência com o que você aprendeu, apontando o que provavelmente aconteceu em cada etapa e que sinal teria delatado. Essa é literalmente a habilidade que se cobra num analista, e ela se treina lendo caso real com o mapa na mão.",
                },
                {
                    type: "quote",
                    value: "Você não precisa saber atacar para defender bem, mas precisa saber o que o atacante faria em seguida. É essa antecipação que transforma alerta solto em investigação.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a ideia central que atravessa toda a trilha?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ataque é uma sequência de etapas, não um evento",
                            isCorrect: true,
                        },
                        {
                            text: "Toda defesa depende de ferramenta especializada",
                            isCorrect: false,
                        },
                        {
                            text: "O invasor sempre explora falha ainda sem correção",
                            isCorrect: false,
                        },
                        {
                            text: "A maioria dos incidentes começa por ameaça interna",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde procurar sinal de persistência, segundo o que você estudou?",
                    difficulty: "medio",
                    options: [
                        { text: "No inventário comparado com a linha de base", isCorrect: true },
                        { text: "No volume de tráfego de saída da estação", isCorrect: false },
                        { text: "No registro de leitura em massa de arquivos", isCorrect: false },
                        { text: "No mapa de conexões entre máquinas internas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual postura profissional a trilha recomenda diante da atribuição?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descrever o que foi observado, sem afirmar autoria",
                            isCorrect: true,
                        },
                        {
                            text: "Nomear o grupo assim que houver indicador conhecido",
                            isCorrect: false,
                        },
                        {
                            text: "Aguardar confirmação oficial antes de qualquer análise",
                            isCorrect: false,
                        },
                        {
                            text: "Comparar o caso com campanhas do mesmo setor apenas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que exercício a trilha sugere para treinar a habilidade adquirida?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Reconstruir a sequência de um incidente noticiado",
                            isCorrect: true,
                        },
                        {
                            text: "Executar as técnicas estudadas num ambiente próprio",
                            isCorrect: false,
                        },
                        {
                            text: "Memorizar os identificadores das técnicas mais comuns",
                            isCorrect: false,
                        },
                        {
                            text: "Assinar fontes de indicadores e acompanhar o volume",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que conhecer o comportamento do adversário melhora a triagem de alertas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Permite antecipar qual seria o próximo passo dele",
                            isCorrect: true,
                        },
                        {
                            text: "Reduz a quantidade de alertas gerados pelas regras",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa a consulta às fontes de dado adicionais",
                            isCorrect: false,
                        },
                        {
                            text: "Garante que nenhum alarme falso chegue ao analista",
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
