import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Fundamentos de Cibersegurança, primeira trilha do roadmap de
 * Segurança.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas guardam as siglas abertas, as listas fechadas de fases
 * e os nomes próprios de framework que a aula cita de passagem.
 */
export const fundamentosDeCiberseguranca: CartasDaTrilha = {
    trilha: "Fundamentos de Cibersegurança",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que a cibersegurança protege, na definição da aula?",
                        verso: "Sistemas, dados e pessoas contra ataques e acessos indevidos.",
                    },
                    {
                        frente: "De quem é o assunto da cibersegurança?",
                        verso: "De todo mundo, não só do especialista de tecnologia.",
                    },
                    {
                        frente: "Que três coisas a cibersegurança sustenta no dia a dia?",
                        verso: "O dinheiro, a privacidade e o funcionamento das empresas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que diferença separa dado de informação?",
                        verso: "O dado é fato bruto; a informação é o dado com significado.",
                    },
                    {
                        frente: "Que nome a informação recebe por merecer proteção?",
                        verso: "Ativo.",
                    },
                    {
                        frente: "Que alcance a segurança da informação tem além do digital?",
                        verso: "Protege também o papel, a conversa e o ambiente físico.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três pilares a tríade CIA reúne?",
                        verso: "Confidencialidade, integridade e disponibilidade.",
                    },
                    {
                        frente: "O que a confidencialidade garante?",
                        verso: "Que só quem tem permissão acessa a informação.",
                    },
                    {
                        frente: "O que a integridade garante?",
                        verso: "Que a informação não foi alterada indevidamente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a autenticidade garante?",
                        verso: "Que algo ou alguém é genuíno, veio mesmo de quem diz.",
                    },
                    {
                        frente: "O que o não-repúdio impede?",
                        verso: "Que alguém negue depois uma ação que praticou.",
                    },
                    {
                        frente: "Que tecnologia sustenta o não-repúdio na prática?",
                        verso: "A assinatura digital.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que produto aproximado define o risco?",
                        verso: "Ameaça vezes vulnerabilidade vezes impacto.",
                    },
                    {
                        frente: "Que analogia a aula usa para ameaça e vulnerabilidade?",
                        verso: "O ladrão e a janela aberta.",
                    },
                    {
                        frente: "O que faz o risco despencar nessa relação?",
                        verso: "Faltar a ameaça, ou faltar a vulnerabilidade.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que três coisas separam um ator de ameaça de outro?",
                        verso: "Motivação, capacidade e persistência.",
                    },
                    {
                        frente: "Que ator usa ferramenta pronta sem entender o fundo?",
                        verso: "O script kiddie.",
                    },
                    {
                        frente: "Que ator combina recurso alto e persistência longa?",
                        verso: "O grupo patrocinado por Estado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um vetor de ataque representa?",
                        verso: "O caminho ou método usado para chegar até o alvo.",
                    },
                    {
                        frente: "Que exemplos de vetor de ataque a aula lista?",
                        verso: "Phishing, senha roubada, software com falha e pendrive.",
                    },
                    {
                        frente: "O que a superfície de ataque soma?",
                        verso: "Todos os pontos por onde alguém poderia tentar entrar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas fases a Cyber Kill Chain descreve?",
                        verso: "Sete fases, em ordem.",
                    },
                    {
                        frente: "Quem publicou a Cyber Kill Chain?",
                        verso: "A Lockheed Martin.",
                    },
                    {
                        frente: "Que quatro fases abrem a Cyber Kill Chain?",
                        verso: "Reconhecimento, armamento, entrega e exploração.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três fases fecham a Cyber Kill Chain?",
                        verso: "Instalação, comando e controle, e ações no objetivo.",
                    },
                    {
                        frente: "O que a fase de instalação deixa para trás?",
                        verso: "Um backdoor, para o atacante persistir na máquina.",
                    },
                    {
                        frente: "Que vantagem a defesa tira da cadeia de fases?",
                        verso: "Quebrar um elo já frustra o plano inteiro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o MITRE ATT&CK cataloga?",
                        verso: "As táticas e técnicas usadas por atacantes reais.",
                    },
                    {
                        frente: "Que diferença separa tática de técnica?",
                        verso: "A tática é o objetivo; a técnica é como se chega nele.",
                    },
                    {
                        frente: "Que ideia a sigla ATT&CK resume?",
                        verso: "Táticas, técnicas e conhecimento comum do adversário.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que tipo de termo malware é?",
                        verso: "Guarda-chuva: vírus, worm e trojan são tipos dele.",
                    },
                    {
                        frente: "Que analogia a aula usa para explicar malware?",
                        verso: "A de animal, com cachorro e gato como tipos.",
                    },
                    {
                        frente: "Que frase a aula considera imprecisa?",
                        verso: "Dizer que pegou um vírus para qualquer infecção.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que pergunta separa vírus, worm e trojan?",
                        verso: "Como cada um deles se propaga.",
                    },
                    {
                        frente: "O que o worm faz sem ajuda de ninguém?",
                        verso: "Anda sozinho pela rede.",
                    },
                    {
                        frente: "Como o trojan chega até a vítima?",
                        verso: "Disfarçado de programa legítimo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o ransomware faz com os dados?",
                        verso: "Cifra e cobra resgate para devolver o acesso.",
                    },
                    {
                        frente: "O que o spyware busca na máquina?",
                        verso: "Informação, espionando em silêncio.",
                    },
                    {
                        frente: "O que caracteriza um rootkit?",
                        verso: "Esconder a presença do invasor no sistema.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o sniffing faz na rede?",
                        verso: "Escuta o tráfego que passa por ela.",
                    },
                    {
                        frente: "Que posição o atacante ocupa num ataque de intermediário?",
                        verso: "No meio da conversa, entre as duas pontas.",
                    },
                    {
                        frente: "O que o DDoS busca derrubar?",
                        verso: "A disponibilidade, com tráfego vindo de muitas origens.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a força bruta tenta contra a senha?",
                        verso: "Todas as combinações, uma a uma.",
                    },
                    {
                        frente: "O que um ataque de dicionário usa?",
                        verso: "Uma lista de senhas prováveis.",
                    },
                    {
                        frente: "O que a injeção explora na aplicação?",
                        verso: "A entrada do usuário interpretada como comando.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o alvo da engenharia social?",
                        verso: "A pessoa, e não a tecnologia.",
                    },
                    {
                        frente: "Que gatilhos a engenharia social explora?",
                        verso: "Confiança, emoção e hábito.",
                    },
                    {
                        frente: "Que recurso o golpista sempre tenta criar?",
                        verso: "Pressa, para a vítima agir antes de pensar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o phishing tenta induzir?",
                        verso: "Entregar dados sensíveis ou clicar num link falso.",
                    },
                    {
                        frente: "De que fonte a mensagem de phishing finge vir?",
                        verso: "De uma fonte confiável, como banco, empresa ou colega.",
                    },
                    {
                        frente: "Que variante do phishing mira uma pessoa específica?",
                        verso: "O spear phishing.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que canal o vishing usa?",
                        verso: "A chamada de voz.",
                    },
                    {
                        frente: "Que canal o smishing usa?",
                        verso: "A mensagem de texto no celular.",
                    },
                    {
                        frente: "Que canais a aula cita além de e-mail e telefone?",
                        verso: "As redes sociais e os aplicativos de mensagem.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o pretexting monta antes do pedido?",
                        verso: "Uma história falsa que justifica o contato.",
                    },
                    {
                        frente: "Que golpe usa um objeto largado de propósito?",
                        verso: "A isca, como um pendrive esquecido.",
                    },
                    {
                        frente: "O que a carona explora no acesso físico?",
                        verso: "Entrar atrás de alguém autorizado pela porta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "De que o golpe depende, acima de qualquer checklist?",
                        verso: "Da sua pressa.",
                    },
                    {
                        frente: "Que defesa a aula considera a mais poderosa?",
                        verso: "Desacelerar antes de agir.",
                    },
                    {
                        frente: "Que objetivo aprender sobre golpes tem?",
                        verso: "Deixar a pessoa atenta, e não paranoica.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que a defesa em profundidade empilha?",
                        verso: "Várias camadas independentes de proteção.",
                    },
                    {
                        frente: "De que princípio a defesa em profundidade parte?",
                        verso: "De que qualquer uma das camadas pode falhar.",
                    },
                    {
                        frente: "Que imagem a aula usa para a defesa em profundidade?",
                        verso: "A do castelo com várias muralhas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o menor privilégio determina?",
                        verso: "Dar só o acesso necessário para a tarefa.",
                    },
                    {
                        frente: "O que a segregação de funções evita?",
                        verso: "Que uma pessoa sozinha conclua um processo crítico.",
                    },
                    {
                        frente: "O que o padrão seguro define?",
                        verso: "Que o sistema já nasce fechado, e não aberto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas etiquetas um controle carrega ao mesmo tempo?",
                        verso: "Duas: a função e o tipo.",
                    },
                    {
                        frente: "Que funções um controle pode ter?",
                        verso: "Preventivo, detectivo, corretivo, dissuasivo e compensatório.",
                    },
                    {
                        frente: "Que tipos classificam um controle?",
                        verso: "Administrativo, técnico e físico.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o hardening faz com a superfície de ataque?",
                        verso: "Encolhe: desliga, remove, fecha e restringe.",
                    },
                    {
                        frente: "Que serviços o hardening manda desligar?",
                        verso: "Os que não estão em uso.",
                    },
                    {
                        frente: "Que ganho o hardening traz à defesa?",
                        verso: "Menos pontos por onde alguém poderia entrar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pilar a criptografia protege diretamente?",
                        verso: "A confidencialidade.",
                    },
                    {
                        frente: "Que dois estados do dado a criptografia cobre?",
                        verso: "Em repouso e em trânsito.",
                    },
                    {
                        frente: "O que a criptografia não resolve sozinha?",
                        verso: "A gestão das chaves e o resto dos controles.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Por que a identidade virou o novo perímetro?",
                        verso: "Com nuvem e trabalho remoto, o login virou a porta de entrada.",
                    },
                    {
                        frente: "Que três funções o AAA reúne?",
                        verso: "Autenticação, autorização e auditoria.",
                    },
                    {
                        frente: "O que a auditoria registra?",
                        verso: "Quem fez o quê, e quando.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a autenticação prova?",
                        verso: "Quem você é.",
                    },
                    {
                        frente: "O que a autorização decide?",
                        verso: "O que você pode fazer.",
                    },
                    {
                        frente: "Que ordem as duas seguem, sem exceção?",
                        verso: "Primeiro a autenticação, só depois a autorização.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três fatores de autenticação existem?",
                        verso: "Algo que se sabe, algo que se tem e algo que se é.",
                    },
                    {
                        frente: "Que fator a biometria representa?",
                        verso: "Algo que você é.",
                    },
                    {
                        frente: "O que a MFA exige para valer de verdade?",
                        verso: "Fatores de categorias diferentes, não dois do mesmo tipo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que qualidade importa mais numa senha?",
                        verso: "O tamanho, acima da complexidade decorada.",
                    },
                    {
                        frente: "Que ferramenta a aula recomenda para senhas?",
                        verso: "O gerenciador de senhas.",
                    },
                    {
                        frente: "Que tecnologia aponta para o futuro sem senha?",
                        verso: "As passkeys.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que modelo concede acesso conforme o cargo?",
                        verso: "O baseado em papéis.",
                    },
                    {
                        frente: "Que modelo decide por atributos de contexto?",
                        verso: "O baseado em atributos.",
                    },
                    {
                        frente: "O que o menor privilégio evita na prática?",
                        verso: "Que uma conta invadida alcance mais do que precisava.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que dois fatores compõem o risco?",
                        verso: "A probabilidade e o impacto.",
                    },
                    {
                        frente: "Que três elementos fazem o risco nascer?",
                        verso: "Um ativo, uma ameaça e uma vulnerabilidade.",
                    },
                    {
                        frente: "Por que priorizar riscos é obrigatório?",
                        verso: "Não dá para proteger tudo com o mesmo esforço.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas respostas ao risco existem?",
                        verso: "Quatro respostas.",
                    },
                    {
                        frente: "Que respostas ao risco a aula lista?",
                        verso: "Mitigar, transferir, evitar e aceitar.",
                    },
                    {
                        frente: "O que a transferência não transfere junto?",
                        verso: "A reputação, que continua sendo sua.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas fases a resposta a incidentes tem?",
                        verso: "Seis fases, em ordem.",
                    },
                    {
                        frente: "Que fases abrem a resposta a incidentes?",
                        verso: "Preparação, identificação e contenção.",
                    },
                    {
                        frente: "Que fases fecham a resposta a incidentes?",
                        verso: "Erradicação, recuperação e lições aprendidas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que servem os frameworks de segurança?",
                        verso: "De mapa, com práticas já organizadas e testadas.",
                    },
                    {
                        frente: "Que diferença separa framework de conformidade?",
                        verso: "O framework orienta; a conformidade é exigida de fora.",
                    },
                    {
                        frente: "Que ganho um framework traz à organização?",
                        verso: "Uma linguagem comum para medir maturidade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que áreas o mapa de carreira em segurança lista?",
                        verso: "Red team, blue team, purple team, GRC, AppSec, nuvem e forense.",
                    },
                    {
                        frente: "Que papel o purple team cumpre?",
                        verso: "O de ponte entre a ofensiva e a defensiva.",
                    },
                    {
                        frente: "Que sigla reúne governança, risco e conformidade?",
                        verso: "GRC.",
                    },
                ],
            },
        },
    },
};
