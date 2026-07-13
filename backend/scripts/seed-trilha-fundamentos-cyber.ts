// Seed da trilha Fundamentos de Cibersegurança (iniciante). Idempotente e não
// destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-fundamentos-cyber.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Fundamentos de Cibersegurança";
const DESCRICAO =
    "Trilha de entrada em cibersegurança para iniciantes: a tríade CIA, o panorama de ameaças e atores, malware e vetores de ataque, engenharia social, princípios e controles de defesa, identidade e controle de acesso, e gestão de risco, resposta a incidentes e carreira na área.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS: Modulo[] = [
    {
        "titulo": "Módulo 1 - O que é cibersegurança e a tríade CIA",
        "aulas": [
            {
                "titulo": "O que é cibersegurança e por que ela importa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é cibersegurança e por que ela importa\n\nSeja bem-vindo à sua primeira trilha de **cibersegurança**! Se você chegou até aqui curioso sobre esse mundo, mas com a sensação de que é coisa de gênio de computador trancado num porão escuro, pode relaxar. A gente vai começar do zero, com calma, com analogias do dia a dia e sem exigir que você seja um expert em tecnologia.\n\nVamos começar pela pergunta mais básica de todas: o que é, afinal, cibersegurança? De forma simples, **cibersegurança é a prática de proteger sistemas, redes, dispositivos, dados e pessoas contra ataques e acessos indevidos no mundo digital**. É o conjunto de tecnologias, processos e hábitos que mantêm o que é seu (e o que é das empresas e da sociedade) a salvo de quem quer roubar, alterar, espionar ou destruir informação.\n\nPense em como a sua vida passa por telas hoje: você acessa o banco pelo celular, conversa por aplicativos, guarda fotos na nuvem, faz compras, trabalha e estuda. Cada uma dessas ações envolve informação de valor viajando e sendo guardada em algum lugar. E onde existe valor, sempre aparece alguém querendo tirar proveito. A cibersegurança é o que protege tudo isso."
                    },
                    {
                        "type": "quote",
                        "value": "**Cibersegurança** é o conjunto de práticas, tecnologias e cuidados que protegem sistemas, dados e pessoas contra ataques e acessos indevidos no mundo digital. A ideia central é simples: onde há informação de valor, há quem queira **roubá-la, alterá-la ou derrubá-la** — e é exatamente disso que a cibersegurança cuida."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa para você\n\nPode parecer que cibersegurança é assunto de grandes empresas e governos, algo distante da sua vida. Mas ela começa muito perto de você. Veja situações que talvez você já tenha vivido ou visto acontecer com alguém próximo:\n\n- A conta de banco esvaziada depois de cair num **golpe** por link falso.\n- O WhatsApp **clonado**, com o golpista se passando por você e pedindo Pix para todos os seus contatos.\n- Fotos e mensagens **pessoais vazadas** por causa de uma conta invadida.\n- A mesma senha usada em vários sites que, ao vazar em um deles, abre a porta de todos os outros.\n\nUm detalhe importante desfaz um mito comum: você **não precisa ser famoso ou rico** para ser alvo. A maioria dos ataques não é feita por um criminoso genial que escolheu justamente você. Eles são **automáticos e oportunistas**, como uma rede de pesca jogada no mar: pega qualquer peixe que estiver desatento. É como trancar a porta de casa. Você não tranca porque um ladrão específico te escolheu, mas porque **porta destrancada é convite**. No mundo digital funciona igual."
                    },
                    {
                        "type": "text",
                        "value": "## Por que importa para empresas e para a sociedade\n\nQuando o alvo é uma **empresa**, o estrago vai muito além de um susto. Um ataque pode causar:\n\n- **Prejuízo financeiro** direto, com dinheiro roubado ou desviado.\n- **Parada da operação**: sem sistema, a empresa não vende, não atende, não produz.\n- **Vazamento de dados** de clientes, o que quebra a confiança e pode gerar multas previstas na **LGPD** (a Lei Geral de Proteção de Dados do Brasil).\n- **Dano à reputação**, que às vezes é o mais difícil de recuperar: cliente que perde a confiança dificilmente volta.\n\nE há um nível ainda maior: a **sociedade**. A cibersegurança deixou de ser um assunto isolado no computador e passou a afetar o mundo físico. Já houve casos de **hospitais** com sistemas paralisados, sem acesso a prontuários e exames, obrigados a adiar atendimentos. Redes de **energia**, **água**, **transporte**, o **sistema financeiro** e **órgãos públicos** dependem de sistemas digitais. Quando um deles é atacado, o efeito sai da tela e chega à vida real de milhares de pessoas. Por isso, hoje, cibersegurança é também uma questão de segurança coletiva."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Quem\",\"O que pode acontecer\",\"Exemplo do dia a dia\"],[\"Uma pessoa\",\"Roubo de dinheiro, invasão de contas, exposição da privacidade\",\"Golpe do Pix, WhatsApp clonado, fotos vazadas\"],[\"Uma pequena empresa\",\"Parada das vendas, perda de dados, prejuízo que pode fechar as portas\",\"Sistema de caixa sequestrado por ransomware\"],[\"Uma grande empresa\",\"Vazamento de milhões de clientes, multas, dano à marca\",\"Base de dados de clientes exposta na internet\"],[\"A sociedade\",\"Serviços essenciais paralisados, impacto no mundo físico\",\"Hospital sem sistema, energia ou transporte fora do ar\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** cibersegurança **não é assunto só de especialista de TI**. Ela protege o seu dinheiro e a sua privacidade, mantém as empresas funcionando e sustenta serviços dos quais a sociedade inteira depende. E boa parte dessa proteção começa em **hábitos simples de cada pessoa** — é isso que você vai aprender a construir nesta jornada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções descreve melhor o que é cibersegurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Proteger sistemas, dados e pessoas contra ataques e acessos indevidos no ambiente digital.",
                                "isCorrect": true
                            },
                            {
                                "text": "Instalar um antivírus uma única vez, que resolve todos os problemas de segurança para sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tema que interessa apenas a bancos e governos, sem nenhuma relação com pessoas comuns.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar sites e aplicativos com visual bonito e fácil de usar para qualquer público em geral.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Maria acha que golpes digitais só acontecem com gente famosa ou muito rica, então não se preocupa com a segurança das próprias contas. Por que esse raciocínio é perigoso?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a maioria dos ataques é automática e oportunista, atingindo quem estiver desatento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque golpes digitais, na verdade, só acontecem em computadores, nunca em celulares.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque pessoas famosas e ricas são, na prática, as únicas com proteção total garantida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque golpes digitais já deixaram de existir, restando apenas riscos no mundo físico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um hospital sofre um ataque que deixa seus sistemas fora do ar: médicos não conseguem acessar prontuários nem resultados de exames, e cirurgias precisam ser adiadas. O que esse caso mostra sobre cibersegurança?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que um ataque digital pode sair da tela e afetar o mundo físico, virando questão coletiva.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que cibersegurança causa apenas prejuízo financeiro, nunca afeta a saúde das pessoas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que hospitais jamais deveriam usar qualquer tipo de sistema digital em suas rotinas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que ataques digitais nunca chegam a atrapalhar serviços considerados essenciais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja online tem a base de dados de seus clientes vazada na internet. Além do susto imediato, quais consequências ela pode enfrentar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Perda de confiança dos clientes, dano à reputação e possíveis multas previstas na LGPD.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhuma consequência relevante, pois dados de clientes não têm valor algum no mercado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas um pequeno aborrecimento passageiro, sem qualquer efeito real sobre o negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um aumento automático nas vendas, já que o vazamento funciona como propaganda gratuita.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa investiu em bons equipamentos de segurança, mas um funcionário reutilizou, no sistema da empresa, a mesma senha que usava num site pessoal. Esse site sofreu um vazamento, e os atacantes usaram a senha para entrar na empresa. O que esse caso ilustra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que a segurança também depende de hábitos: uma brecha humana contorna boas defesas técnicas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que investir em segurança é inútil, já que nenhum tipo de ataque pode ser evitado nunca.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a culpa é exclusivamente dos equipamentos, que deveriam ter adivinhado a senha certa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que reutilizar senhas pessoais é seguro, desde que a empresa tenha bons equipamentos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Segurança da informação x cibersegurança",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Segurança da informação x cibersegurança\n\nNa aula anterior você viu o que é cibersegurança e por que ela importa. Agora vamos afinar o vocabulário, porque três termos costumam ser usados como sinônimos e não são exatamente a mesma coisa: **segurança da informação**, **cibersegurança** e **segurança digital**. Entender a diferença vai te ajudar a pensar como um profissional da área.\n\nAntes, uma distinção que é a base de tudo: **dado** e **informação** não são a mesma coisa.\n\n- Um **dado** é um fato bruto, isolado, sem contexto. Por exemplo, o número `4815`. Sozinho, ele não diz muita coisa.\n- Uma **informação** é o dado com significado, dentro de um contexto. Por exemplo: `4815 é a senha do cofre`. Agora aquele número virou algo valioso.\n\nA informação é o que chamamos de **ativo**: ela tem valor e, por isso, precisa ser protegida. É em torno da informação que gira toda a segurança."
                    },
                    {
                        "type": "text",
                        "value": "## O que é segurança da informação\n\nA **segurança da informação** (muitas vezes abreviada como **SI**) é a área que protege a informação em **qualquer forma** em que ela exista, e não apenas no computador. A mesma informação sigilosa pode estar:\n\n- **Digital**: um arquivo, um e-mail, um registro num banco de dados.\n- **No papel**: um contrato impresso, uma ficha de cadastro, um bilhete.\n- **Falada**: uma senha dita em voz alta, uma conversa confidencial numa sala.\n- **Na memória das pessoas**: aquilo que alguém sabe e poderia contar.\n\nPense num segredo de negócio importante. Ele pode vazar de várias formas: por um e-mail invadido, por um documento impresso jogado no lixo sem ser picotado, ou por um funcionário falando alto num elevador cheio. A segurança da informação se preocupa com **todas** essas frentes, e por isso ela se apoia em três pilares que sempre andam juntos: **tecnologia**, **processos** e **pessoas**."
                    },
                    {
                        "type": "text",
                        "value": "## O que é cibersegurança (e onde ela se encaixa)\n\nA **cibersegurança** é o ramo que foca na proteção do **mundo digital**, também chamado de **ciberespaço**: os sistemas, as redes, os dispositivos, os dados eletrônicos e as pessoas que os utilizam, contra ameaças que chegam por meios digitais.\n\nA melhor forma de entender a relação é esta: **toda cibersegurança é segurança da informação, mas nem toda segurança da informação é cibersegurança**. A cibersegurança é uma parte grande e central da SI, focada especificamente no digital. Se a segurança da informação cuida de proteger o valor onde quer que ele esteja, a cibersegurança cuida do **cofre eletrônico e das portas digitais**.\n\nVocê também vai ouvir o termo **segurança digital**, usado de forma mais ampla e popular, geralmente incluindo temas de privacidade e bem-estar das pessoas na internet. Na prática do dia a dia os três termos conversam bastante; o importante é entender que a SI é a mais abrangente, e a cibersegurança é o seu núcleo voltado ao digital."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Segurança da informação\",\"Cibersegurança\"],[\"Foco principal\",\"A informação em si, onde quer que esteja\",\"O mundo digital (ciberespaço)\"],[\"Formatos que protege\",\"Digital, papel, falado, na memória das pessoas\",\"Principalmente dados e sistemas digitais\"],[\"Exemplo de ameaça\",\"Um contrato impresso jogado no lixo sem picotar\",\"Um invasor explorando um sistema pela internet\"],[\"Relação entre elas\",\"É a área mais ampla\",\"É um ramo central dentro dela\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Onde a informação vive: os três estados\n\nPara proteger a informação, ajuda saber que, a qualquer momento, ela está em um de três **estados** — e cada um exige um cuidado diferente:\n\n- **Em repouso**: guardada, parada em algum lugar. Um arquivo no HD, um registro no banco de dados, um documento na gaveta.\n- **Em trânsito**: viajando de um ponto a outro. Um e-mail sendo enviado, dados passando pela rede, uma mensagem indo do seu celular ao servidor.\n- **Em uso**: sendo aberta, lida ou processada naquele instante, por exemplo aparecendo na tela.\n\nPor que isso importa? Porque não adianta proteger só um estado. De nada serve guardar a informação num cofre trancadíssimo (repouso) se ela viaja **aberta e desprotegida** pela internet (trânsito), onde alguém pode interceptá-la no caminho. Uma boa proteção pensa nos três estados. Guarde essa ideia: ela vai voltar quando falarmos de **criptografia** mais adiante."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** um **dado** é um fato bruto; a **informação** é o dado com significado, e ela é um **ativo** que precisamos proteger. A **segurança da informação** protege a informação em qualquer formato (digital, papel, falado), enquanto a **cibersegurança** é o ramo focado no mundo digital. Toda cibersegurança é segurança da informação, mas o contrário nem sempre é verdade. E lembre-se: a informação precisa ser protegida **em repouso, em trânsito e em uso**."
                    }
                ],
                "questions": [
                    {
                        "statement": "A segurança da informação protege a informação em quais formatos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em qualquer formato: digital, em papel, falado e até guardado na memória das pessoas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente no formato digital, dentro de computadores e servidores conectados à rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas em papel, como contratos impressos e fichas de cadastro arquivadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente em informações faladas durante reuniões presenciais dentro da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença entre um dado e uma informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O dado é um fato bruto sem contexto; a informação é o dado com significado, um ativo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há diferença alguma: dado e informação são exatamente a mesma coisa no dia a dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado é sempre digital, enquanto a informação existe apenas em papel impresso.",
                                "isCorrect": false
                            },
                            {
                                "text": "A informação é sempre pública, e o dado é sempre secreto e protegido por lei.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa descobre que uma informação confidencial vazou porque um contrato impresso foi jogado no lixo sem ser picotado, e alguém o encontrou. Como classificar esse incidente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É falha de segurança da informação, não de cibersegurança, pois não envolveu meio digital.",
                                "isCorrect": true
                            },
                            {
                                "text": "É uma falha de cibersegurança, já que todo vazamento de dados é, por definição, digital.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não é falha de segurança nenhuma, afinal um simples papel não é considerado um sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "É um problema apenas de tecnologia, sem nenhuma relação com processos ou pessoas da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve corretamente a relação entre segurança da informação e cibersegurança?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Toda cibersegurança é segurança da informação, mas o contrário nem sempre é verdade.",
                                "isCorrect": true
                            },
                            {
                                "text": "São termos idênticos e totalmente intercambiáveis, usados em qualquer contexto.",
                                "isCorrect": false
                            },
                            {
                                "text": "A cibersegurança é mais ampla e, na verdade, engloba toda a segurança da informação.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas áreas não têm relação alguma entre si, sendo campos completamente separados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa criptografa os arquivos guardados em seus servidores, mas envia um relatório sigiloso por um canal aberto na internet, onde ele acaba sendo interceptado no caminho. Qual conceito explica melhor a falha?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ficou protegida em repouso, mas desprotegida em trânsito: os estados pedem cuidado.",
                                "isCorrect": true
                            },
                            {
                                "text": "A empresa protegeu a informação em uso, mas se esqueceu de protegê-la em repouso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não houve falha alguma, pois criptografar os arquivos guardados já basta sempre.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é que a informação sigilosa jamais deveria existir em formato digital.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A tríade CIA: confidencialidade, integridade e disponibilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A tríade CIA\n\nSe existe um conceito que é o **coração** de toda a cibersegurança, é a **tríade CIA**. Ela responde a uma pergunta fundamental: quando dizemos que algo está seguro, seguro em relação a quê, exatamente? A resposta são três objetivos, e as iniciais deles, em inglês, formam a sigla **CIA**:\n\n- **C** de **Confidencialidade** (Confidentiality)\n- **I** de **Integridade** (Integrity)\n- **A** de **Disponibilidade** (Availability)\n\n(E não, isso não tem nada a ver com a agência de inteligência americana. É só uma coincidência das iniciais.)\n\nUma boa imagem é a de um **banquinho de três pernas**. Confidencialidade, integridade e disponibilidade são as três pernas. Se qualquer uma delas falha, o banquinho tomba — ou seja, a segurança foi comprometida. Toda medida de proteção que existe serve para sustentar pelo menos uma dessas pernas, e todo ataque tenta derrubar pelo menos uma delas. Vamos conhecer cada uma."
                    },
                    {
                        "type": "text",
                        "value": "## Confidencialidade: só quem pode, vê\n\n**Confidencialidade** é a garantia de que a informação só seja acessada por quem tem **autorização** para isso. É a perna da tríade que combate a **espionagem** e o **vazamento**.\n\nPense nas informações que você não gostaria que caíssem em mãos erradas: sua senha, seu prontuário médico, o salário dos funcionários de uma empresa, os segredos de um produto ainda não lançado. Manter tudo isso restrito a quem realmente precisa ver é confidencialidade em ação. Um princípio famoso resume a ideia: o do **precisa saber** (em inglês, _need to know_) — cada pessoa só tem acesso ao que é necessário para o seu trabalho, e nada além.\n\n**Como se protege:** senhas, **criptografia** (embaralhar a informação para que só quem tem a chave consiga ler), controle de acesso e permissões.\n\n**O que a viola:** um vazamento de dados, alguém bisbilhotando o e-mail alheio, uma senha anotada num post-it colado no monitor, dados sigilosos trafegando sem criptografia. Um exemplo concreto: um funcionário de banco que, por pura curiosidade, abre a conta de uma pessoa conhecida. Ele não roubou nem alterou nada, mas **só de olhar o que não devia**, já quebrou a confidencialidade."
                    },
                    {
                        "type": "text",
                        "value": "## Integridade: a informação está correta e intacta\n\n**Integridade** é a garantia de que a informação **não seja alterada de forma indevida** — seja por um erro, seja por má-fé — e permaneça correta, completa e confiável do começo ao fim.\n\nPense no quanto depende de a informação estar exata: o **saldo** da sua conta, o valor de um **Pix**, o **resultado** de um exame médico, os dados de uma nota fiscal. Se qualquer um desses for adulterado, a consequência é séria, mesmo que a informação continue disponível e secreta.\n\n**Como se protege:** permissões que limitam quem pode escrever ou editar, controle de versões, backups e, principalmente, o **hash** — uma espécie de impressão digital do arquivo, que muda por completo se um único caractere for alterado.\n\n**O que a viola:** a adulteração de um banco de dados, a corrupção de um arquivo ou o clássico golpe do **boleto adulterado**, em que um programa malicioso troca os dados de um boleto na hora do pagamento, e o dinheiro vai parar na conta do criminoso em vez de na do destinatário correto. O conteúdo foi **alterado sem autorização**: isso é um ataque à integridade. Veja como basta trocar um único número para a impressão digital (o hash) mudar por completo e denunciar a alteração:"
                    },
                    {
                        "type": "code",
                        "value": "Mensagem original:    Transferir R$ 100 para a conta 12345\nHash (impressao digital):   a3f5c9d1e8b7...\n\nMensagem adulterada:  Transferir R$ 900 para a conta 12345\nHash (impressao digital):   7e0b214f6c2d...\n\n// Bastou trocar um numero para a impressao digital mudar por completo.\n// E assim que uma alteracao indevida e detectada. (os valores de hash acima sao ilustrativos)"
                    },
                    {
                        "type": "text",
                        "value": "## Disponibilidade: acessível quando se precisa\n\n**Disponibilidade** é a garantia de que a informação e os sistemas estejam **acessíveis para quem precisa, no momento em que se precisa**. De nada adianta um dado ser secreto (confidencial) e estar correto (íntegro) se, na hora H, ninguém consegue chegar até ele.\n\nPense na importância do **acesso na hora certa**: o site do banco no dia do pagamento das contas, o sistema do hospital durante uma cirurgia, uma loja virtual no auge da Black Friday. Se qualquer um desses fica fora do ar, o prejuízo é imediato.\n\n**Como se protege:** redundância (ter mais de um servidor, para que um assuma se o outro cair), **backups**, planos de recuperação de desastres e proteção contra ataques de sobrecarga.\n\n**O que a viola:** um ataque de **DDoS**, em que o sistema é bombardeado com uma enxurrada de acessos falsos até não aguentar e sair do ar; o **ransomware**, uma praga que criptografa (sequestra) os dados e cobra resgate; além de causas não maliciosas como queda de energia, falha de equipamento ou desastres naturais. Repare num detalhe importante: num ataque de ransomware a um hospital, os dados podem continuar **secretos e sem alteração**, mas se ninguém consegue acessá-los, a **disponibilidade** foi destruída."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pilar\",\"O que garante\",\"Como se protege\",\"O que a viola\"],[\"Confidencialidade\",\"Só quem tem autorização acessa\",\"Senha, criptografia, controle de acesso\",\"Vazamento, espionagem, senha exposta\"],[\"Integridade\",\"A informação está correta e intacta\",\"Hash, permissões, controle de versões, backup\",\"Adulteração de dados, boleto falso, corrupção de arquivo\"],[\"Disponibilidade\",\"Acessível quando se precisa\",\"Redundância, backup, plano de recuperação\",\"DDoS, ransomware, queda de energia\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Na tríade CIA da segurança, o que significam as três letras?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Confidencialidade, Integridade e Disponibilidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Autenticação, Autorização e Contabilização.",
                                "isCorrect": false
                            },
                            {
                                "text": "Identificação, Classificação e Rastreabilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Governança, Conformidade e Rastreabilidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Garantir que uma informação só possa ser acessada por quem tem autorização é a definição de qual pilar da tríade CIA?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Confidencialidade, o pilar ligado ao sigilo da informação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Integridade, o pilar ligado à exatidão dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Disponibilidade, o pilar ligado ao acesso no momento certo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Redundância, uma técnica de proteção, não um pilar da tríade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um programa malicioso altera os dados de um boleto no momento do pagamento, fazendo o dinheiro cair na conta de um criminoso em vez da conta correta. Qual pilar da tríade CIA foi atacado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Integridade, pois os dados do boleto foram alterados sem autorização no pagamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Disponibilidade, pois o sistema de pagamento do boleto ficou fora do ar um tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confidencialidade, pois o boleto foi apenas visualizado por alguém sem permissão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum pilar, pois pagar um boleto pela internet é sempre uma ação totalmente segura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No dia de maior movimento do ano, o site de uma loja é bombardeado por uma enxurrada de acessos falsos (um ataque DDoS) e sai do ar, impedindo qualquer cliente de comprar. Qual pilar foi violado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Disponibilidade, pois o sistema ficou inacessível para quem precisava comprar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Confidencialidade, pois os dados pessoais dos clientes foram lidos pelos atacantes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Integridade, pois os preços e produtos da loja foram alterados durante o ataque.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticidade, pois o site da loja passou a ser, na prática, uma página falsa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um invasor copiou a senha de um administrador e passou semanas apenas observando os dados financeiros da empresa, sem alterar nada e sem derrubar nenhum sistema. Qual pilar da tríade foi violado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Confidencialidade, pois os dados foram acessados sem autorização, mesmo sem alteração.",
                                "isCorrect": true
                            },
                            {
                                "text": "Integridade, pois os dados financeiros da empresa foram modificados pelo invasor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Disponibilidade, pois os sistemas da empresa ficaram fora do ar durante semanas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum pilar, pois, sem alteração nem queda de sistema, não existe dano algum.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Autenticidade e não-repúdio: além da tríade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Autenticidade e não-repúdio\n\nA tríade CIA — confidencialidade, integridade e disponibilidade — dá conta da maior parte do que precisamos proteger. Mas o mundo digital trouxe desafios novos que pedem duas garantias extras, muito ligadas à tríade: a **autenticidade** e o **não-repúdio**. Alguns modelos de segurança até estendem a tríade para incluí-las.\n\nA ideia por trás das duas nasce de perguntas bem práticas do dia a dia digital: _essa mensagem veio mesmo de quem diz ter enviado?_ e _depois que alguém fez algo, dá para provar que foi essa pessoa, sem que ela possa negar?_ Vamos ver cada uma."
                    },
                    {
                        "type": "text",
                        "value": "## Autenticidade: é mesmo quem diz ser?\n\n**Autenticidade** é a garantia de que uma informação, uma mensagem ou um usuário é **genuíno**, verdadeiro, e realmente veio de quem afirma ter vindo. Não basta a informação estar íntegra (sem alteração); é preciso ter certeza de que a **origem é legítima**.\n\nPense num e-mail que chega dizendo ser do seu banco. A pergunta da autenticidade é: veio mesmo do banco, ou de um golpista se passando por ele? Quando você faz login com sua senha, você está **provando** (de forma imperfeita) que é você mesmo — isso é autenticação, o mecanismo que sustenta a autenticidade.\n\n**Como se protege:** autenticação (senha, biometria, tokens), certificados digitais e assinaturas digitais.\n\n**O que a viola:** o **spoofing** (falsificar a identidade ou o remetente, por exemplo forjar o endereço de e-mail para parecer outra pessoa), o **phishing** (mensagens que fingem vir de uma origem confiável para te enganar), sites falsos que imitam os verdadeiros e, mais recentemente, os **deepfakes**. Repare na diferença: a integridade pergunta _a mensagem chegou intacta?_; a autenticidade pergunta _a mensagem veio mesmo de quem diz?_"
                    },
                    {
                        "type": "text",
                        "value": "## Não-repúdio: depois não dá para negar\n\n**Não-repúdio** é a garantia de que quem realizou uma ação **não possa negar depois** que a realizou. Repudiar quer dizer negar a autoria; o não-repúdio impede o velho _não fui eu_.\n\nPense nas situações em que provar a autoria é essencial. Você assina um contrato digitalmente e, mais tarde, não pode alegar que nunca assinou. Um registro (**log**) do sistema mostra que o usuário X apagou determinado arquivo às 14h32. Uma transação bancária fica ligada de forma inegável a quem a fez. Uma boa analogia é a do **cartório** ou da **carta registrada com aviso de recebimento**: fica uma prova sólida de quem fez o quê, que a pessoa não consegue simplesmente desconhecer.\n\n**Como se protege:** assinaturas digitais, **logs** e trilhas de auditoria (o registro de quem fez o quê e quando) e o carimbo de tempo.\n\n**Por que importa:** em fraudes, disputas e crimes digitais, é o não-repúdio que sustenta a **responsabilização**. Sem ele, qualquer um poderia fazer algo e depois lavar as mãos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"Pergunta que ele responde\",\"Como se garante\"],[\"Integridade\",\"A informação chegou sem ser alterada?\",\"Hash, assinatura digital\"],[\"Autenticidade\",\"Ela veio mesmo de quem diz ter enviado?\",\"Autenticação, certificado digital\"],[\"Não-repúdio\",\"Dá para provar quem fez, sem a pessoa poder negar?\",\"Assinatura digital, logs de auditoria\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Juntando na prática: a assinatura digital\n\nUm ótimo exemplo que reúne vários desses conceitos de uma vez é a **assinatura digital** de um documento. Quando um contrato chega assinado digitalmente, essa assinatura oferece três garantias ao mesmo tempo:\n\n- **Integridade**: se uma única vírgula do documento for alterada depois de assinado, a assinatura deixa de bater, e a fraude aparece.\n- **Autenticidade**: ela comprova que o documento veio realmente de quem assinou.\n- **Não-repúdio**: quem assinou não consegue depois negar que o fez.\n\nDo lado oposto está o **phishing**, que é um ataque justamente à **autenticidade**: o golpista se disfarça de uma origem confiável (um banco, uma loja, o seu chefe) para te enganar. Perceber de qual garantia um ataque ou uma defesa está falando é uma habilidade que vai te acompanhar por toda a área de segurança."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** além da tríade CIA, dois conceitos completam a base da segurança. A **autenticidade** garante que algo ou alguém é **genuíno** — veio mesmo de quem diz. O **não-repúdio** garante que quem fez algo **não possa negar depois**. A **assinatura digital** é o exemplo que reúne integridade, autenticidade e não-repúdio de uma só vez, enquanto o **phishing** é o ataque clássico contra a autenticidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a autenticidade garante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que uma informação, mensagem ou usuário é genuíno e veio mesmo de quem diz ter enviado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a informação esteja sempre disponível para acesso no momento em que se precisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a informação jamais possa ser lida por nenhuma pessoa, em qualquer hipótese.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que os dados sejam apagados automaticamente logo depois de serem utilizados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o não-repúdio garante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que quem realizou uma ação não possa, depois, negar que foi o autor dela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que a informação seja criptografada durante todos os momentos possíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o sistema tenha vários servidores reserva para nunca sair do ar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que qualquer pessoa possa acessar livremente qualquer dado disponível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um e-mail chega imitando o visual e o endereço do seu banco, pedindo que você clique num link e confirme a senha. Na verdade, foi enviado por um golpista. Qual garantia de segurança esse golpe ataca diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A autenticidade, pois o golpista finge ser uma origem confiável que não é.",
                                "isCorrect": true
                            },
                            {
                                "text": "A disponibilidade, pois o site do banco de fato saiu do ar durante o golpe.",
                                "isCorrect": false
                            },
                            {
                                "text": "A integridade, pois o saldo da conta bancária foi diretamente alterado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O não-repúdio, pois o banco depois negou publicamente ter enviado o e-mail.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de assinar um contrato digitalmente, uma pessoa tenta alegar que nunca o assinou. A assinatura digital, porém, comprova que foi ela. Qual garantia impede esse tipo de negação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O não-repúdio, que impede quem assinou de negar depois a própria autoria.",
                                "isCorrect": true
                            },
                            {
                                "text": "A disponibilidade, que garante o acesso ao contrato a qualquer momento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A confidencialidade, que impede qualquer outra pessoa de ler o contrato.",
                                "isCorrect": false
                            },
                            {
                                "text": "A redundância, que mantém cópias do contrato em vários servidores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um documento chega com o conteúdo idêntico ao original, sem uma vírgula alterada, mas foi enviado por um impostor que se passou por outra pessoa. Qual objetivo de segurança falhou, mesmo com a integridade preservada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A autenticidade: o documento, mesmo intacto, não veio de quem dizia tê-lo enviado.",
                                "isCorrect": true
                            },
                            {
                                "text": "A integridade, pois o conteúdo do documento foi alterado durante o envio, no caminho.",
                                "isCorrect": false
                            },
                            {
                                "text": "A disponibilidade, pois o documento não pôde ser aberto pelo destinatário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum objetivo, pois, se o conteúdo está intacto, não existe problema algum.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ameaça, vulnerabilidade, risco e superfície de ataque",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ameaça, vulnerabilidade e risco\n\nAmeaça, vulnerabilidade e risco são três palavras que muita gente usa como se fossem sinônimos. Mas, em segurança, elas têm significados bem diferentes, e entender essa diferença é o que separa quem só tem medo de hacker de quem consegue pensar em proteção de forma organizada.\n\nVamos usar uma única analogia para os três: a de uma **casa**.\n\n- **Ameaça** (do inglês _threat_): é qualquer agente ou evento que pode causar dano. É o **perigo em potencial**. Na analogia, é o **ladrão** que ronda o bairro. No digital, é um hacker, um programa malicioso, um funcionário descuidado, um incêndio. Um ponto crucial: a ameaça existe **independentemente de você** — você não escolhe se ladrões existem ou não.\n- **Vulnerabilidade** (_vulnerability_): é uma **fraqueza ou brecha** que a ameaça pode aproveitar. Na analogia, é a **janela destrancada**. No digital, é uma senha fraca, um sistema desatualizado, um funcionário que não sabe reconhecer um golpe. A vulnerabilidade está do **seu lado** — é o que você pode corrigir.\n- **Risco** (_risk_): é a **probabilidade** de uma ameaça explorar uma vulnerabilidade, combinada com o **tamanho do estrago** que isso causaria. É o ladrão encontrando a janela aberta, e o quanto você perderia se ele entrasse."
                    },
                    {
                        "type": "quote",
                        "value": "Uma forma simples de guardar a relação: de maneira aproximada, **Risco ≈ Ameaça × Vulnerabilidade × Impacto**. Se não há ameaça, ou se não há vulnerabilidade, o risco despenca. Uma casa num bairro perigoso (muita ameaça), mas com portas blindadas e alarme (pouca vulnerabilidade), corre **menos risco** do que uma casa de porta aberta num bairro tranquilo. Risco é o encontro da ameaça com a vulnerabilidade, pesado pelo tamanho do estrago."
                    },
                    {
                        "type": "text",
                        "value": "## O que você controla (e o que não controla)\n\nAqui está a sacada mais útil de toda esta aula: você quase nunca controla as **ameaças**, mas controla boa parte das suas **vulnerabilidades**. Não dá para impedir que existam criminosos na internet, nem para proibir que chova. Mas dá, sim, para trancar a janela: atualizar o sistema, usar senhas fortes, treinar as pessoas para reconhecer golpes, fazer backup.\n\nÉ por isso que o trabalho de segurança se concentra em **reduzir vulnerabilidades** e em **reduzir o impacto** (com backups e planos de recuperação, por exemplo), já que a ameaça costuma estar fora do nosso alcance.\n\nUm cenário deixa isso claro: dois escritórios ficam na mesma rua, expostos aos **mesmos** ladrões (mesma ameaça). O escritório A tem alarme, câmeras e um cofre; o escritório B deixou a porta aberta e o sistema desatualizado. Com a mesma ameaça para os dois, quem tem **mais vulnerabilidade** corre **mais risco**. Reduzir risco, na prática, quase sempre significa reduzir vulnerabilidade e impacto."
                    },
                    {
                        "type": "text",
                        "value": "## A superfície de ataque\n\nUm último conceito amarra tudo isso: a **superfície de ataque**. Ela é o **conjunto de todos os pontos** por onde um atacante poderia tentar entrar ou interagir com um sistema. Voltando à casa: são todas as portas, janelas, o portão dos fundos, o basculante do banheiro. Quanto mais aberturas, mais lugares o ladrão pode tentar.\n\nNo mundo digital, **aumentam** a superfície de ataque: cada nova conta de usuário, cada programa instalado, cada porta de rede aberta, cada dispositivo conectado e até cada pessoa (que pode ser alvo de engano). Cada um desses pontos é uma **vulnerabilidade em potencial**.\n\nDaí nasce um dos princípios mais eficazes da segurança: **reduzir a superfície de ataque**. Desligue o que você não usa, feche as portas que não precisam estar abertas, remova contas antigas, instale só o necessário. Menos aberturas significam menos oportunidades para o atacante — e, portanto, menos risco. É o equivalente digital de tapar as janelas que você nunca abre."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"O que é\",\"Na casa\",\"No digital\"],[\"Ameaça\",\"Agente ou evento que pode causar dano\",\"O ladrão que ronda o bairro\",\"Hacker, malware, incêndio\"],[\"Vulnerabilidade\",\"Fraqueza que a ameaça pode explorar\",\"A janela destrancada\",\"Senha fraca, sistema desatualizado\"],[\"Risco\",\"Chance de a ameaça explorar a brecha, vezes o impacto\",\"O ladrão entrando pela janela aberta\",\"Invasão por uma falha conhecida e não corrigida\"],[\"Superfície de ataque\",\"Conjunto de todos os pontos de entrada\",\"Todas as portas e janelas da casa\",\"Contas, portas de rede, apps e dispositivos expostos\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** a **ameaça** é o perigo em potencial (o ladrão); a **vulnerabilidade** é a brecha que ela pode explorar (a janela aberta); o **risco** é a combinação dos dois, pesada pelo impacto. Você raramente controla a ameaça, mas pode reduzir suas vulnerabilidades e o impacto — e diminuir a **superfície de ataque** (os pontos de entrada) é uma das formas mais eficazes de baixar o risco. Esse trio é a base para pensar em segurança de forma profissional."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em segurança, o que é uma vulnerabilidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma fraqueza ou brecha que uma ameaça pode explorar, como uma senha fraca.",
                                "isCorrect": true
                            },
                            {
                                "text": "O agente que provoca o dano diretamente, como um hacker ou um malware.",
                                "isCorrect": false
                            },
                            {
                                "text": "O prejuízo financeiro que um ataque acaba causando para uma empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um programa instalado para proteger o computador contra invasões.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções é um exemplo de ameaça?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um criminoso na internet tentando invadir sistemas de outras pessoas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma senha fraca escolhida e usada por um funcionário desatento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um servidor da empresa sem as atualizações de segurança recentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um antivírus recém-instalado e devidamente atualizado no sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Considere a frase: o antivírus da empresa está desatualizado e há criminosos na internet tentando invadi-la. Nessa frase, o que é a vulnerabilidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O antivírus desatualizado, pois é a fraqueza que pode ser explorada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os criminosos na internet, pois são, na verdade, a fraqueza a corrigir.",
                                "isCorrect": false
                            },
                            {
                                "text": "A empresa como um todo, pois ela sozinha já representa todo o risco.",
                                "isCorrect": false
                            },
                            {
                                "text": "A internet em si, pois ela é sempre a principal ameaça de qualquer ataque.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa percebe que instalou dezenas de programas e serviços que ninguém usa e que várias portas de rede estão abertas sem necessidade. Do ponto de vista de segurança, o que isso significa e o que fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A superfície de ataque está grande; desativar o que não se usa reduz o risco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há problema algum: quanto mais programas e portas abertas, mais segura fica a rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ideal, na verdade, é abrir ainda mais portas para o sistema respirar melhor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O único caminho possível é desligar a empresa inteira da internet para sempre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas lojas ficam na mesma rua e enfrentam os mesmos assaltantes. A loja A tem alarme, câmeras e cofre; a loja B deixa a porta aberta e não tem nenhuma proteção. Se a ameaça é a mesma para as duas, por que a loja B corre mais risco?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o risco não depende só da ameaça: com a mesma ameaça, mais brecha é mais risco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a ameaça, na verdade, acaba sendo bem maior para a loja B do que para a A.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque risco e ameaça são, no fim das contas, exatamente a mesma coisa em segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a loja B tem, na verdade, uma superfície de ataque menor que a da loja A.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Ameaças, atores e a anatomia de um ataque",
        "aulas": [
            {
                "titulo": "Quem ataca e por quê: os atores de ameaça",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Quem ataca e por quê\n\nNo módulo anterior você aprendeu **o que** a segurança protege: a confidencialidade, a integridade e a disponibilidade da informação. Agora vem uma pergunta igualmente importante: **de quem** a gente está protegendo tudo isso?\n\nNa cabeça de muita gente, 'hacker' é sempre aquela figura de moletom com capuz, sozinha num quarto escuro. A realidade é bem mais variada. Por trás de um ataque pode estar um adolescente entediado testando um programa que baixou pronto, um grupo com bandeira política, uma quadrilha organizada atrás de dinheiro, um funcionário insatisfeito ou até uma equipe paga por um governo. Cada um tem uma **habilidade**, um **objetivo** e uma **paciência** diferentes.\n\nA esse conjunto de quem representa perigo damos o nome de **ator de ameaça** (do inglês _threat actor_). Antes de conhecer cada perfil, guarde os cinco grandes **motores** que fazem alguém atacar: **dinheiro**, **ideologia** (defender uma causa), **espionagem** (roubar segredos), **vingança** e **fama ou diversão**. Como você vai ver, a motivação praticamente **define** como cada um age.\n\nEntender quem são esses atores não é curiosidade à toa: é o que permite defender melhor. Um segurança que sabe se está lidando com um batedor de carteiras ou com um assalto planejado se prepara de formas diferentes. Na cibersegurança é igual."
                    },
                    {
                        "type": "quote",
                        "value": "Um **ator de ameaça** (_threat actor_) é qualquer pessoa ou grupo por trás de uma ação que pode causar dano a sistemas, dados ou pessoas. O que separa um ator do outro são três coisas: a **motivação** (por que atacam), a **capacidade** (quanto sabem e quanto dinheiro têm) e a **persistência** (quanto tempo estão dispostos a insistir)."
                    },
                    {
                        "type": "text",
                        "value": "## Dos curiosos ao crime organizado\n\nVamos aos perfis, do mais amador ao mais estruturado.\n\n**Script kiddies** são iniciantes com pouca habilidade técnica. O nome vem de _script_ (programa pronto) + _kiddie_ (novato): eles usam ferramentas e códigos que **outra pessoa** criou, sem entender bem como funcionam, e saem testando por aí. A motivação costuma ser curiosidade, adrenalina ou aparecer para os amigos. Parecem inofensivos, mas não subestime: uma ferramenta poderosa nas mãos erradas causa estrago mesmo sem perícia.\n\n**Hacktivistas** juntam _hacker_ + _ativista_. São movidos por **ideologia**: uma causa política, social ou ambiental. Em vez de dinheiro, querem chamar atenção ou protestar. As ações típicas são pichar sites (trocar a página inicial por uma mensagem), derrubar serviços com sobrecarga ou vazar documentos que consideram de interesse público.\n\n**Cibercriminosos** são o crime **profissional** atrás de **dinheiro**. Muitas vezes operam como quadrilhas organizadas, com divisão de tarefas e até 'suporte' para a vítima que precisa pagar um resgate. Estão por trás da maioria dos golpes, fraudes bancárias, roubo de cartões e ataques de ransomware que aparecem no noticiário. Para eles, atacar é um negócio: investem onde o retorno é maior."
                    },
                    {
                        "type": "text",
                        "value": "## A ameaça de dentro e a de elite\n\nDois perfis fogem do estereótipo do invasor externo.\n\n**Insiders**, ou **ameaça interna**, são pessoas que **já têm acesso legítimo**: funcionários, estagiários, prestadores, parceiros. Justamente por estarem 'dentro', são difíceis de detectar, porque o crachá é de verdade. O insider pode ser **malicioso** (um funcionário revoltado que rouba dados, ou alguém subornado para vazar informação) ou **não intencional** (a pessoa que clica num phishing, configura algo errado ou perde um notebook cheio de dados). A maioria dos incidentes internos, aliás, é sem má intenção: é gente comum cometendo um deslize.\n\n**APTs** são a elite. A sigla vem de _Advanced Persistent Threat_, ou **Ameaça Avançada e Persistente**, e cada palavra conta uma parte da história: **avançada** (usam técnicas sofisticadas), **persistente** (ficam meses ou anos infiltradas, quietinhas, sem serem notadas) e **ameaça** (são organizadas, financiadas e têm um objetivo claro). Costumam ser grupos **patrocinados por Estados**, voltados a **espionagem** e sabotagem de alvos estratégicos, com muito dinheiro e paciência. Não vamos citar nomes de grupos aqui; o que importa para você agora é o **perfil**: o adversário mais capaz e paciente que existe."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Perfil\",\"O que os move\",\"Nível técnico\",\"Exemplo de ação\"],[\"Script kiddie\",\"Curiosidade, adrenalina, aparecer\",\"Baixo\",\"Rodar uma ferramenta pronta só para ver se consegue\"],[\"Hacktivista\",\"Ideologia, protesto\",\"Variável\",\"Pichar um site ou derrubá-lo com sobrecarga\"],[\"Cibercriminoso\",\"Dinheiro\",\"Médio a alto\",\"Ransomware, fraude bancária, roubo de cartões\"],[\"Insider (ameaça interna)\",\"Vingança, suborno ou puro descuido\",\"Já tem acesso legítimo\",\"Vazar, roubar ou apagar dados de dentro\"],[\"APT / patrocinado por Estado\",\"Espionagem, sabotagem\",\"Muito alto\",\"Infiltração silenciosa e de longo prazo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** um **ator de ameaça** é quem está por trás de um ataque, e o que os diferencia é motivação, capacidade e persistência. Os **script kiddies** usam ferramentas prontas por curiosidade; os **hacktivistas** agem por **ideologia**; os **cibercriminosos** querem **dinheiro** e operam como negócio; os **insiders** já estão dentro (por má intenção ou por descuido); e as **APTs**, muitas vezes ligadas a **Estados**, são avançadas, persistentes e focadas em espionagem. Saber quem pode atacar, e por quê, é o primeiro passo para se defender do jeito certo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um 'ator de ameaça' em cibersegurança?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pessoa ou grupo responsável por uma ação que causa dano.",
                                "isCorrect": true
                            },
                            {
                                "text": "Programa de antivírus que evita infecções no computador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo de firewall que filtra o tráfego da rede corporativa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vítima que sofre as consequências de um ataque cibernético.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um adolescente baixa da internet uma ferramenta de invasão já pronta e sai testando em vários sites, sem entender como ela funciona, só para ver se consegue. Que perfil de atacante ele representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um script kiddie iniciante.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma APT ligada a um Estado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um insider malicioso interno.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cibercriminoso profissional.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um grupo invade o site de um órgão público e troca a página inicial por um manifesto político, sem pedir dinheiro nenhum. Qual perfil e motivação melhor explicam a ação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Hacktivistas, agindo por ideologia política.",
                                "isCorrect": true
                            },
                            {
                                "text": "Cibercriminosos, agindo só por dinheiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Script kiddies, sem nenhum objetivo real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma APT, fazendo espionagem em silêncio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um funcionário do financeiro, sem qualquer má intenção, cai num e-mail falso e acaba instalando um malware na rede da empresa. Como esse caso é classificado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma ameaça interna não intencional.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um ataque de hacktivismo direcionado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ação isolada de um script kiddie.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma ameaça, pois não houve má intenção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa descobre que, por quase dois anos, um grupo muito bem financiado esteve infiltrado na rede sem ser notado, apenas copiando documentos estratégicos aos poucos. Qual perfil combina com isso e por que o nome faz sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma APT: ficou infiltrada por meses, com paciência de grupo patrocinado por Estado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um script kiddie: só testaria ferramentas prontas, sem fôlego para meses de operação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um hacktivista: agiria às claras e rápido para chamar atenção, não em silêncio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um cibercriminoso comum: buscaria lucro rápido, não ficaria quieto por dois anos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Vetores de ataque e superfície de ataque",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Vetores de ataque e superfície de ataque\n\nJá sabemos **quem** ataca. Agora a pergunta muda para **por onde** eles entram. Nenhum invasor atravessa a parede: todo ataque precisa de um **caminho** e de uma **porta**. Entender esses dois conceitos permite fechar as brechas antes que alguém as use.\n\nPense na sua casa. Um ladrão pode entrar pela porta da frente, pela janela dos fundos, pela garagem ou convencendo você a abrir a porta com uma boa desculpa. Cada uma dessas rotas é um **caminho de ataque**. E o **total** de portas, janelas e frestas que existem na casa é o tamanho da sua exposição. Na segurança digital, esses dois conceitos têm nome: **vetor de ataque** e **superfície de ataque**."
                    },
                    {
                        "type": "quote",
                        "value": "Um **vetor de ataque** (_attack vector_) é o **caminho ou método** que o atacante usa para chegar até o alvo: um e-mail de phishing, um pendrive infectado, uma senha roubada, uma falha num programa. A **superfície de ataque** (_attack surface_) é a **soma de todos os pontos** por onde alguém poderia tentar entrar. Regra de ouro: quanto **maior** a superfície, mais lugares para defender e mais chances de escapar alguma coisa."
                    },
                    {
                        "type": "text",
                        "value": "## Os caminhos mais usados\n\nOs atacantes preferem os vetores que dão mais retorno com menos esforço. Os mais comuns no dia a dia são:\n\n- **E-mail (phishing)**: de longe o campeão. Uma mensagem falsa convence a pessoa a clicar num link, abrir um anexo ou digitar a senha num site clonado.\n- **Sites e downloads maliciosos**: páginas falsas ou invadidas que infectam quem as visita, e programas 'gratuitos' que trazem malware de brinde.\n- **Credenciais roubadas**: com um login e uma senha válidos (vazados, reutilizados ou adivinhados), o atacante simplesmente **entra pela porta da frente**, sem precisar arrombar nada.\n- **Software desatualizado**: um programa com uma falha conhecida e sem correção é um convite. O atacante explora a brecha que já era pública.\n- **Mídia removível**: um pendrive 'perdido' de propósito no estacionamento que, ao ser espetado, executa um código malicioso.\n- **Terceiros (cadeia de suprimentos)**: em vez de atacar você diretamente, o invasor entra por um **fornecedor** ou parceiro mais frágil que tem acesso aos seus sistemas.\n\nRepare num padrão: vários desses caminhos dependem de **uma pessoa** clicar, confiar ou reutilizar uma senha. Por isso se diz que o ser humano costuma ser o vetor preferido."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Vetor de ataque\",\"Como funciona\",\"Exemplo do dia a dia\"],[\"E-mail de phishing\",\"Engana a pessoa para clicar, abrir ou digitar dados\",\"'Sua conta será bloqueada, confirme a senha aqui'\"],[\"Site ou download malicioso\",\"Infecta quem visita ou instala um programa 'grátis'\",\"Baixar um app pirata que vem com malware\"],[\"Credencial roubada\",\"Usa um login e senha válidos para entrar\",\"Reaproveitar uma senha já vazada em outro site\"],[\"Software vulnerável\",\"Explora uma falha conhecida e sem correção\",\"Um sistema antigo que nunca foi atualizado\"],[\"Mídia removível\",\"Executa código ao conectar o dispositivo\",\"Espetar um pendrive achado no chão\"],[\"Terceiros / fornecedores\",\"Entra por um parceiro mais frágil\",\"Invadir a empresa que dá suporte à sua rede\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A superfície de ataque: quanto menor, melhor\n\nSe cada vetor é um caminho, a **superfície de ataque** é o mapa com **todos** os caminhos somados. Ela cresce a cada novo detalhe da sua vida digital:\n\n- cada **dispositivo** (computador, celular, câmera, roteador),\n- cada **programa** e serviço instalado,\n- cada **conta** e senha que existe,\n- cada **porta** aberta para a internet,\n- e cada **pessoa** que pode ser enganada.\n\nQuanto mais coisas expostas, maior a superfície, e mais trabalho para proteger tudo. Por isso um dos princípios mais valiosos da segurança é **reduzir a superfície de ataque**: expor o mínimo necessário.\n\nNa prática, isso significa **desligar** o que não se usa (serviços, contas antigas, funções que ninguém precisa), **atualizar** o que fica ligado para fechar falhas conhecidas, **limitar acessos** ao essencial e **treinar as pessoas** para não abrirem portas sem querer. Voltando à analogia da casa: você não deixa dez janelas destrancadas 'por via das dúvidas'. Quanto menos aberturas, menos lugares o ladrão tem para tentar."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **vetor de ataque** é o **caminho** que o invasor usa (phishing, senha roubada, software com falha, pendrive, um fornecedor frágil), e a **superfície de ataque** é a **soma de todos os pontos expostos**: dispositivos, programas, contas, portas e pessoas. Quanto maior a superfície, mais há para defender. Por isso a defesa mira **reduzir a superfície**: desligar o que não se usa, atualizar o que fica, limitar acessos e treinar gente. Menos portas abertas, menos chances para o atacante."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é um vetor de ataque?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O caminho que o atacante usa para chegar ao alvo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de todos os pontos expostos de uma empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um programa de antivírus instalado no computador.",
                                "isCorrect": false
                            },
                            {
                                "text": "A motivação que leva alguém a cometer um ataque.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que descreve melhor a superfície de ataque de uma organização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O total de pontos por onde é possível entrar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um único caminho específico usado numa invasão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista de senhas guardadas por toda a empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do grupo hacker responsável pelo ataque.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa decide desligar serviços que ninguém usa, remover contas antigas de ex-funcionários e fechar portas de rede desnecessárias. Que ideia de segurança ela está aplicando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduzir a superfície de ataque, cortando os pontos expostos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a superfície de ataque para confundir o invasor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar de propósito um novo vetor de ataque na rede interna.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada disso mudaria a segurança geral da empresa toda.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em vez de invadir a empresa-alvo diretamente, o atacante entra pela empresa terceirizada de TI, que é mais frágil e tem acesso à rede do cliente. Qual vetor de ataque foi usado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Terceiros: entrou pela empresa terceirizada, mais frágil.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mídia removível: um pendrive infectado foi conectado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Phishing: um e-mail falso foi enviado direto ao alvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Força bruta: senhas foram tentadas no sistema do alvo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa usava a mesma senha em vários sites, e ela vazou num deles. Meses depois, o atacante entra na conta de e-mail da vítima 'sem arrombar nada', apenas digitando o login e a senha corretos. Qual vetor descreve isso e por que é tão perigoso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Credencial roubada: login e senha válidos parecem acesso legítimo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Software vulnerável: uma falha do sistema teria sido explorada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mídia removível: um pendrive infectado teria sido conectado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não seria vetor: a senha era da própria vítima, sem roubo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A anatomia de um ataque: a Cyber Kill Chain (parte 1)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A anatomia de um ataque: a kill chain\n\nExiste um mito perigoso: o de que um ataque é um clique mágico, instantâneo, em que o invasor 'entra no sistema' de uma vez só. Na vida real, um ataque sério é uma **sequência de passos**, como um assalto a banco planejado, que tem observação, preparação, entrada, execução e fuga. Se você interrompe **qualquer** um desses passos, o assalto não acontece.\n\nFoi essa ideia que a empresa Lockheed Martin organizou num modelo chamado **Cyber Kill Chain** (algo como 'a cadeia de etapas de um ataque'). O nome vem do meio militar: _kill chain_ é a sequência de fases de uma operação. A grande sacada para a defesa está justamente na palavra **cadeia**: um ataque é uma corrente de elos, e **quebrar um único elo** já basta para frustrar o plano inteiro.\n\nA Cyber Kill Chain descreve **sete fases**, do primeiro olhar do atacante até ele atingir o objetivo. Nesta aula vamos ver as **quatro primeiras**, quando o atacante ainda está do lado de fora, preparando o bote."
                    },
                    {
                        "type": "quote",
                        "value": "A **Cyber Kill Chain** (Lockheed Martin) descreve um ataque em **sete fases**, em ordem: **1) Reconhecimento**, **2) Armamento**, **3) Entrega**, **4) Exploração**, **5) Instalação**, **6) Comando e Controle** e **7) Ações sobre os objetivos**. A lógica de defesa é simples e poderosa: quanto **mais cedo** você quebrar a cadeia, menor o estrago."
                    },
                    {
                        "type": "text",
                        "value": "## Fase 1 — Reconhecimento\n\nTodo ataque começa com **pesquisa**. Na fase de **reconhecimento** (_reconnaissance_), o atacante estuda o alvo sem fazer barulho: procura nomes de funcionários e e-mails, olha redes sociais e o site da empresa, descobre quais tecnologias ela usa e quais sistemas estão expostos na internet. Boa parte dessa informação é **pública**. É como um ladrão que observa a casa por dias antes de agir, anotando horários e pontos fracos.\n\n## Fase 2 — Armamento\n\nCom o alvo mapeado, o atacante **monta a arma**. Na fase de **armamento** (_weaponization_), ele prepara o material malicioso: por exemplo, junta um código que explora uma falha com um programa espião, tudo escondido dentro de um documento de aparência inofensiva (uma 'nota fiscal', um 'currículo'). Repare num ponto importante: aqui o atacante ainda trabalha **na casa dele**. A vítima nem sabe que ele existe, porque nada foi enviado ainda."
                    },
                    {
                        "type": "text",
                        "value": "## Fase 3 — Entrega\n\nAgora a arma sai em direção ao alvo. Na fase de **entrega** (_delivery_), o atacante **envia** o material malicioso pelo vetor escolhido: um anexo por e-mail, um link para um site falso, um pendrive deixado no estacionamento, uma mensagem em rede social. É o momento em que a bola passa para o campo da vítima. Muitas defesas, como o filtro de spam e o bloqueio de anexos perigosos, atuam justamente aqui.\n\n## Fase 4 — Exploração\n\nA entrega chegou; falta o **gatilho**. Na fase de **exploração** (_exploitation_), o código malicioso finalmente **dispara**: a vítima abre o anexo ou clica no link, e aí o programa aproveita uma **falha** (do sistema, de um aplicativo ou da própria distração humana) para começar a rodar no computador dela. É o instante em que o ataque deixa de ser uma ameaça e vira uma invasão de fato."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase\",\"O que o atacante faz\",\"Exemplo\"],[\"1. Reconhecimento\",\"Pesquisa o alvo e junta informações públicas\",\"Achar e-mails e descobrir os sistemas da empresa\"],[\"2. Armamento\",\"Monta o material malicioso, ainda do lado dele\",\"Esconder um espião dentro de um falso 'currículo'\"],[\"3. Entrega\",\"Envia a arma ao alvo pelo vetor escolhido\",\"Mandar o anexo por um e-mail de phishing\"],[\"4. Exploração\",\"Dispara o código ao explorar uma falha\",\"A vítima abre o anexo e o código começa a rodar\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando (parte 1):** a **Cyber Kill Chain** enxerga o ataque como uma **cadeia de fases**, e quebrar um elo já frustra o plano. As quatro primeiras são: **Reconhecimento** (pesquisar o alvo), **Armamento** (montar a arma, ainda do lado do atacante), **Entrega** (enviar a arma pelo vetor escolhido) e **Exploração** (o código dispara ao explorar uma falha). Até aqui, o invasor conseguiu **rodar** algo na máquina da vítima. Na próxima aula vamos ver o que ele faz para **ficar** lá dentro e atingir o objetivo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a ideia central da Cyber Kill Chain para quem defende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um ataque é uma cadeia de fases, e quebrar uma já frustra tudo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um ataque é um passo único e instantâneo, impossível de deter.",
                                "isCorrect": false
                            },
                            {
                                "text": "A defesa só funciona na última fase do ataque, nunca antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "A kill chain é um tipo de vírus especialmente perigoso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na fase de reconhecimento, o que o atacante costuma fazer?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pesquisa e reúne informações públicas sobre o alvo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografa os arquivos da vítima e cobra um resgate.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instala um backdoor permanente na máquina já invadida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Envia o anexo malicioso para a caixa de entrada da vítima.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No computador dele, e sem enviar nada para ninguém, o atacante junta um exploit e um programa espião dentro de um falso PDF de currículo. Em qual fase da kill chain ele está?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Armamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Entrega.",
                                "isCorrect": false
                            },
                            {
                                "text": "Exploração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O filtro de e-mail de uma empresa bloqueia um anexo malicioso antes que ele chegue à caixa de entrada do funcionário. Em qual fase da kill chain a defesa quebrou a cadeia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na entrega.",
                                "isCorrect": true
                            },
                            {
                                "text": "No reconhecimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Na exploração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nas ações sobre os objetivos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um funcionário recebe e abre um anexo; ao abrir, o arquivo aproveita uma falha do leitor de documentos e um código malicioso começa a rodar na máquina. Em que fase o ataque está e por que já é grave?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Exploração: o código disparou e já virou execução real na máquina.",
                                "isCorrect": true
                            },
                            {
                                "text": "Entrega: o e-mail só teria chegado à caixa de entrada, nada rodou ainda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armamento: o arquivo malicioso ainda estaria sendo preparado pelo atacante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reconhecimento: o atacante ainda estaria só juntando dados públicos do alvo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A Cyber Kill Chain (parte 2) e como a defesa a usa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# A kill chain, parte 2: por dentro do alvo\n\nNa aula anterior, acompanhamos o atacante das primeiras pesquisas até o momento em que o código malicioso **disparou** na máquina da vítima. Ele conseguiu rodar algo, mas rodar uma vez não basta. Agora ele quer **ficar**, **assumir o controle** e, enfim, **fazer o que veio fazer**. São as três últimas fases da **Cyber Kill Chain**, quando o invasor já está do lado de dentro."
                    },
                    {
                        "type": "text",
                        "value": "## Fase 5 — Instalação\n\nUm acesso que some quando o computador reinicia não serve para muita coisa. Na fase de **instalação** (_installation_), o atacante instala um **malware** ou **backdoor** (uma 'porta dos fundos') para garantir **persistência**: um jeito de continuar entrando mesmo depois de a máquina ser desligada e religada. É como o ladrão que, uma vez dentro, deixa uma janela destrancada para voltar quando quiser, sem repetir todo o trabalho.\n\n## Fase 6 — Comando e Controle\n\nCom a porta dos fundos instalada, a máquina infectada 'liga de volta' para o atacante e abre um canal de **comando e controle** (_command and control_, abreviado **C2** ou **C&C**). A partir daí, o invasor **controla o computador remotamente**, como se estivesse sentado na frente dele: envia ordens, baixa mais ferramentas, explora a rede. É o momento das 'mãos no teclado', em que o ataque deixa de ser um programa automático e passa a ter um humano no comando."
                    },
                    {
                        "type": "text",
                        "value": "## Fase 7 — Ações sobre os objetivos\n\nChegou o momento pelo qual todo o resto foi preparado. Na fase de **ações sobre os objetivos** (_actions on objectives_), o atacante finalmente faz o que motivou o ataque desde o começo. Dependendo de quem ele é e do que quer, isso pode ser:\n\n- **Roubar dados** (exfiltração): copiar arquivos, senhas, informações de clientes.\n- **Sequestrar e cobrar resgate**: criptografar tudo com ransomware e exigir pagamento.\n- **Destruir ou sabotar**: apagar dados, derrubar sistemas.\n- **Se espalhar** (movimento lateral): pular daquela máquina para outras, indo atrás de alvos mais valiosos na rede.\n\nRepare como o objetivo aqui reflete diretamente a **motivação** do ator que vimos na primeira aula: o cibercriminoso parte para o resgate, a APT para a espionagem silenciosa. A anatomia do ataque e o retrato do atacante se encaixam."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase\",\"O que o atacante faz\",\"Exemplo\"],[\"5. Instalação\",\"Instala um backdoor para garantir persistência\",\"Deixar uma porta dos fundos que sobrevive ao reinício\"],[\"6. Comando e Controle (C2)\",\"Controla a máquina remotamente\",\"A máquina infectada liga de volta e recebe ordens\"],[\"7. Ações sobre os objetivos\",\"Cumpre a meta do ataque\",\"Roubar dados, cobrar resgate ou se espalhar pela rede\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como a defesa usa a kill chain\n\nO valor da kill chain não é assustar, é **organizar a defesa**. Se o ataque é uma corrente de sete elos, o defensor pode posicionar barreiras em **cada** um deles, sem depender de uma única muralha. É a ideia de **defesa em profundidade**: várias camadas, uma cobrindo a falha da outra.\n\nDois princípios saem daí:\n\n- **Quanto mais cedo, melhor.** Barrar na entrega (um anexo bloqueado) é muito mais barato do que descobrir o problema lá na fase 7, com os dados já vazando. Cada elo cortado antes economiza dano.\n- **Nenhuma camada é perfeita.** Se o phishing passou pelo filtro, ainda dá para detectar a exploração; se a exploração passou, ainda dá para flagrar o canal de comando e controle 'ligando para fora'. A cada fase, uma nova chance de quebrar a cadeia.\n\nÉ por isso que a kill chain virou uma ferramenta de raciocínio tão comum: ela transforma um ataque assustador e abstrato numa **lista de pontos onde é possível agir**."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando (parte 2):** depois de invadir, o atacante busca **Instalação** (deixar um backdoor para persistir), **Comando e Controle / C2** (controlar a máquina remotamente) e **Ações sobre os objetivos** (roubar, sequestrar, destruir ou se espalhar). Para a defesa, o modelo diz duas coisas de ouro: **quebre a cadeia o mais cedo possível** e **use várias camadas** (defesa em profundidade), porque cada fase é uma nova oportunidade de deter o ataque."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o atacante busca na fase de instalação da kill chain?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Instalar um backdoor que garanta persistência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas pesquisar informações públicas sobre o alvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Enviar o anexo malicioso para a caixa da vítima.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pichar o site da empresa com uma mensagem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é o canal de comando e controle (C2) num ataque?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O canal que controla a máquina infectada à distância.",
                                "isCorrect": true
                            },
                            {
                                "text": "O antivírus instalado no computador da vítima.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lista de e-mails coletados na fase de reconhecimento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A criptografia usada por um ransomware nos arquivos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Já dentro da rede, o atacante copia arquivos confidenciais de clientes e os envia para um servidor fora da empresa. Em qual fase da kill chain isso se encaixa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "As ações sobre os objetivos.",
                                "isCorrect": true
                            },
                            {
                                "text": "A instalação de um backdoor.",
                                "isCorrect": false
                            },
                            {
                                "text": "O comando e controle remoto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O reconhecimento inicial.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a kill chain ensina que interromper o ataque 'o quanto antes' é melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque quanto mais cedo se interrompe, menor é o dano causado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque as fases finais seriam sempre as mais fáceis de detectar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só a primeira fase do ataque poderia ser defendida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque não faria diferença alguma em qual fase se atua.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O time de segurança nota que uma máquina interna está 'ligando' repetidamente para um endereço estranho na internet e recebendo comandos de lá. Qual fase está em curso e por que ainda vale a pena agir?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Comando e Controle: cortar esse canal agora ainda evita o roubo final.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reconhecimento: nessa fase inicial, ainda não haveria nada relevante a fazer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Entrega: bastaria bloquear o e-mail que originou o ataque todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Armamento: o arquivo malicioso ainda estaria sendo montado pelo atacante.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Introdução ao MITRE ATT&CK: táticas e técnicas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Introdução ao MITRE ATT&CK\n\nA kill chain nos deu a visão de cima: sete grandes passos, do reconhecimento até o objetivo. Mas, na hora de defender de verdade, surge uma pergunta mais fina: **exatamente como** os atacantes fazem cada coisa? De quantas maneiras diferentes alguém consegue 'entrar' ou 'roubar dados'?\n\nPara responder a isso, a organização **MITRE** (uma entidade sem fins lucrativos ligada a pesquisa) criou o **ATT&CK**: um **catálogo gigante** de comportamentos de atacantes **observados no mundo real**. Não é teoria inventada, é um registro do que grupos de verdade realmente fizeram, organizado para que defensores possam estudar, detectar e se preparar. Se a kill chain é o mapa da cidade visto de cima, o ATT&CK é o guia de ruas, com cada esquina detalhada."
                    },
                    {
                        "type": "quote",
                        "value": "**MITRE ATT&CK** (a sigla vem de _Adversarial Tactics, Techniques, and Common Knowledge_) é uma **base de conhecimento** pública que cataloga as **táticas** e **técnicas** usadas por atacantes reais. Ele responde a duas perguntas para cada passo de um ataque: qual é **o objetivo** (a tática) e qual é **o modo** de alcançá-lo (a técnica)."
                    },
                    {
                        "type": "text",
                        "value": "## Táticas: o objetivo de cada passo\n\nUma **tática** responde ao **porquê**: qual é o **objetivo** do atacante naquele momento. É uma meta, escrita de forma geral, sem dizer ainda como será cumprida. O ATT&CK organiza os ataques em várias táticas, como (entre outras):\n\n- **Acesso inicial** — conseguir o primeiro pé dentro do ambiente.\n- **Execução** — rodar código malicioso na máquina.\n- **Persistência** — garantir que o acesso continue com o tempo.\n- **Escalação de privilégios** — ganhar mais poder do que o usuário comum tem.\n- **Movimento lateral** — pular de uma máquina para outra na rede.\n- **Exfiltração** — tirar os dados para fora.\n- **Impacto** — causar o dano final (destruir, sequestrar, indisponibilizar).\n\nRepare que cada tática é um **objetivo**, não uma receita. 'Acesso inicial' diz o que o atacante quer (entrar), mas não diz **de que jeito**. Esse 'de que jeito' é o papel das técnicas."
                    },
                    {
                        "type": "text",
                        "value": "## Técnicas: o modo de conseguir\n\nUma **técnica** responde ao **como**: a **maneira específica** de cumprir uma tática. Para cada objetivo existem **várias** técnicas possíveis, porque há muitos caminhos para o mesmo fim.\n\nUm exemplo deixa tudo claro. A tática **Acesso inicial** (o objetivo: entrar) pode ser alcançada por diferentes técnicas, e uma das mais conhecidas é o **phishing**. Ou seja: 'entrar' é a **tática**; 'entrar **enviando um phishing**' é a **técnica**.\n\nA analogia da casa fecha a ideia. Imagine um ladrão cujo objetivo é **entrar na sua casa**: essa é a **tática**. As **técnicas** são as formas concretas de conseguir isso: arrombar a fechadura, quebrar a janela, entrar pela garagem ou convencer você a abrir a porta. Mesmo objetivo, vários modos. No ATT&CK, cada um desses 'modos' é uma técnica catalogada, com descrição de como funciona e de como detectá-la."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tática (o objetivo — porquê)\",\"Técnica de exemplo (o modo — como)\"],[\"Acesso inicial: entrar no ambiente\",\"Enviar um e-mail de phishing\"],[\"Execução: rodar código na máquina\",\"Fazer a vítima abrir um anexo malicioso\"],[\"Persistência: manter o acesso\",\"Instalar um backdoor que sobrevive ao reinício\"],[\"Exfiltração: tirar os dados\",\"Enviar os arquivos por um canal escondido\"],[\"Impacto: causar o dano final\",\"Criptografar tudo com um ransomware\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** o **MITRE ATT&CK** é uma base de conhecimento com o que atacantes reais fazem, separando **táticas** de **técnicas**. A **tática** é o **objetivo** (o porquê: acesso inicial, persistência, exfiltração...) e a **técnica** é o **modo** de alcançá-lo (o como: por exemplo, phishing para o acesso inicial). Cada objetivo tem várias técnicas possíveis. Enquanto a **kill chain** dá a visão geral em sete fases, o **ATT&CK** desce ao detalhe e vira um **vocabulário comum** para defensores descreverem ataques, mapearem suas defesas e enxergarem onde ainda estão desprotegidos."
                    }
                ],
                "questions": [
                    {
                        "statement": "No MITRE ATT&CK, o que é uma tática?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O objetivo do atacante em um determinado passo.",
                                "isCorrect": true
                            },
                            {
                                "text": "A maneira específica de executar essa ação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de antivírus usado por empresas grandes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de um grupo hacker bastante conhecido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é o MITRE ATT&CK?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma base de conhecimento sobre táticas e técnicas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um antivírus gratuito voltado para empresas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lei brasileira de proteção de dados pessoais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de firewall descrito como de última geração.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num relatório, lê-se: 'o objetivo era acesso inicial, e a forma usada foi enviar um phishing'. No vocabulário do ATT&CK, o que é a tática e o que é a técnica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Acesso inicial é a tática, e phishing é a técnica.",
                                "isCorrect": true
                            },
                            {
                                "text": "Phishing é a tática, e acesso inicial é a técnica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois termos são táticas nesse relatório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois termos são técnicas nesse relatório.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista diz: 'aqui o objetivo do atacante era persistência, e a técnica foi instalar um backdoor'. Que ideia do ATT&CK ele está aplicando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A separação entre tática, o objetivo, e técnica, o modo.",
                                "isCorrect": true
                            },
                            {
                                "text": "As sete fases da cyber kill chain, do início ao fim.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tríade CIA: confidencialidade, integridade e disponibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os fatores de autenticação usados para confirmar identidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois ataques diferentes tiveram o mesmo objetivo de 'entrar no ambiente', mas um usou phishing e o outro usou uma senha vazada. Como o ATT&CK descreve essa situação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A mesma tática alcançada por duas técnicas diferentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Táticas diferentes usando exatamente a mesma técnica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mesmo ataque repetido, sem nenhuma diferença real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo que o ATT&CK não teria como descrever ou catalogar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Malware e vetores de ataque",
        "aulas": [
            {
                "titulo": "O que é malware e como ele chega até você",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é malware e como ele chega até você\n\nVocê provavelmente já ouviu alguém dizer que \"pegou um vírus no computador\". Na maioria das vezes, a palavra certa nem é vírus: é **malware**. Neste módulo vamos conhecer os tipos de programa malicioso, os ataques que rondam as redes e as senhas, e entender o que diferencia cada um. Calma, você não precisa ser programador para acompanhar: a ideia é reconhecer as ameaças e entender **como** elas agem.\n\n**Malware** é a junção de _malicious software_, ou \"software malicioso\". É qualquer programa criado de propósito para fazer algo ruim: roubar seus dados, espionar o que você digita, sequestrar seus arquivos ou transformar sua máquina em ferramenta de um criminoso, quase sempre sem você perceber."
                    },
                    {
                        "type": "quote",
                        "value": "**Malware** é um termo guarda-chuva. Vírus, worm, trojan, ransomware, spyware: todos são _tipos_ de malware, assim como cachorro, gato e cavalo são tipos de animal. Dizer \"peguei um vírus\" muitas vezes é como dizer \"vi um animal\": pode até ser, mas geralmente é outra coisa."
                    },
                    {
                        "type": "text",
                        "value": "## Por que alguém criaria isso?\n\nMalware não nasce por acaso nem por travessura (pelo menos, não mais). Por trás quase sempre há um **objetivo bem concreto**, e entender a motivação ajuda a prever o comportamento da ameaça:\n\n- **Dinheiro**: de longe o motivo mais comum. Sequestrar seus arquivos e cobrar resgate, roubar a senha do banco, usar seu computador para minerar criptomoeda.\n- **Dados**: roubar informações valiosas, como cadastros de clientes, segredos de uma empresa ou fotos pessoais para chantagem.\n- **Controle**: transformar sua máquina em um \"soldado\" obediente, para usar em ataques maiores sem o dono saber.\n- **Espionagem e sabotagem**: vigiar alvos ou destruir sistemas, motivação comum em conflitos entre países ou concorrentes.\n\nGuarde esta ideia: o malware é um **meio**, não um fim. O criminoso quer alguma coisa, e o programa malicioso é a ferramenta para conseguir."
                    },
                    {
                        "type": "text",
                        "value": "## Duas perguntas: como chega e o que faz\n\nPara entender qualquer malware, faça sempre duas perguntas:\n\n1. **Como ele chega até a máquina?** Esse é o **vetor de ataque** (ou vetor de infecção), o \"caminho de entrada\".\n2. **O que ele faz depois que entra?** Essa é a **carga** (em inglês, _payload_), o estrago em si.\n\nÉ como um ladrão: uma coisa é _por onde_ ele entrou (a janela destrancada, a porta dos fundos); outra é _o que_ ele fez lá dentro (levou a TV, mexeu no cofre). Dois malwares podem entrar pelo mesmo caminho e fazer coisas totalmente diferentes, e o mesmo estrago pode chegar por caminhos diferentes. Separar essas duas perguntas deixa tudo mais claro, e é assim que vamos organizar o módulo inteiro."
                    },
                    {
                        "type": "text",
                        "value": "## Os caminhos de entrada mais comuns\n\nOs vetores mudam com a moda, mas alguns são clássicos e continuam funcionando porque exploram o elo mais frágil: **as pessoas**.\n\n- **Anexos de e-mail**: aquele \"boleto\", \"currículo\" ou \"nota fiscal\" que na verdade é um programa disfarçado.\n- **Downloads e sites**: instaladores \"piratas\", cracks de jogos ou um site invadido que empurra um arquivo.\n- **Pendrives e mídias**: um USB \"esquecido\" no estacionamento que alguém curioso pluga na máquina.\n- **Vulnerabilidades**: falhas em programas desatualizados que deixam a porta aberta, às vezes sem clique nenhum.\n- **Outros dispositivos na rede**: um aparelho já infectado que contamina os vizinhos da mesma rede.\n\nRepare que a maioria depende de uma **ação humana**: um clique, um download, plugar algo. Por isso, ao longo da trilha, você vai ver que treinar as pessoas é tão importante quanto instalar antivírus."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Vetor de entrada\",\"Exemplo do dia a dia\",\"Como reduzir o risco\"],[\"Anexo de e-mail\",\"Um `.exe` disfarçado de nota fiscal\",\"Desconfiar de anexos inesperados\"],[\"Download de site\",\"Crack de jogo ou instalador grátis de fonte duvidosa\",\"Baixar só de fontes oficiais\"],[\"Pendrive / USB\",\"Dispositivo achado no estacionamento\",\"Não plugar mídias desconhecidas\"],[\"Vulnerabilidade\",\"Programa desatualizado com falha conhecida\",\"Manter tudo atualizado\"],[\"Outro dispositivo na rede\",\"Máquina do colega já infectada\",\"Segmentar a rede e usar antivírus\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a palavra malware significa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um programa malicioso, criado de propósito para causar dano.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de programação que trava o computador sem querer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma peça de hardware com defeito dentro da máquina.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo específico e bastante famoso de programa antivírus.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um e-mail traz um anexo malicioso; ao ser aberto, o programa criptografa os arquivos da vítima. Nessa história, o anexo de e-mail representa o quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O vetor de ataque, ou seja, o caminho de entrada.",
                                "isCorrect": true
                            },
                            {
                                "text": "A carga (payload), ou seja, o estrago final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma vulnerabilidade do sistema operacional.",
                                "isCorrect": false
                            },
                            {
                                "text": "O antivírus da máquina, funcionando de forma correta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa foi infectada e os criminosos exigiram pagamento para devolver o acesso aos arquivos. Qual motivação por trás do malware isso ilustra melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ganho financeiro: extorquir dinheiro da vítima.",
                                "isCorrect": true
                            },
                            {
                                "text": "Curiosidade acadêmica, sem interesse financeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um defeito acidental do sistema, sem intenção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma rotina de manutenção preventiva do sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que treinar os funcionários é considerado uma defesa tão importante contra malware?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque muitos vetores de entrada dependem de uma ação humana, como um clique.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque funcionários treinados conseguem reescrever o antivírus da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o treinamento substitui por completo a necessidade de atualizar os programas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque malware só ataca quem nunca fez nenhum curso de segurança digital.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois computadores foram infectados pelo mesmo ransomware: um por um pendrive, outro por um anexo de e-mail. O que esse caso mostra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que o vetor pode mudar e a carga continuar a mesma.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que pendrive e e-mail são, na prática, o mesmo vetor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o ransomware deixou de ser malware nesse caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a carga muda sempre que o vetor muda.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Vírus, worms e trojans: as formas de se espalhar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Vírus, worms e trojans: as formas de se espalhar\n\nAgora que você sabe o que é malware, vamos aos \"clássicos\". Vírus, worm e trojan são três dos nomes mais antigos e mais confundidos do mundo da segurança. A diferença entre eles **não está no estrago** que causam, e sim em **como se espalham**: como cada um consegue ir de uma máquina para a outra. Entender isso é o que separa quem repete jargão de quem realmente entende a ameaça."
                    },
                    {
                        "type": "text",
                        "value": "## Vírus: precisa de carona\n\nUm **vírus** de computador funciona como um vírus biológico: ele **não vive sozinho**. Precisa se grudar em um **hospedeiro** (um arquivo ou programa legítimo) e só entra em ação quando você **executa** esse hospedeiro. Ao rodar, ele se copia para outros arquivos e continua se espalhando.\n\nO ponto-chave: o vírus depende de uma **ação sua**. Se você nunca abrir o arquivo infectado, ele fica dormente. É como um resfriado que só passa adiante quando as pessoas se aproximam: sem contato, sem contágio. Por isso a recomendação eterna de não abrir arquivos de origem duvidosa."
                    },
                    {
                        "type": "text",
                        "value": "## Worm: se espalha sozinho\n\nO **worm** (em português, \"verme\") é o parente que dispensa carona. A grande diferença para o vírus é que ele **se espalha sozinho, pela rede, sem precisar de ação humana**. Ele procura outras máquinas (pela internet ou pela rede local), encontra uma brecha e se copia para lá automaticamente. Dali, procura as próximas.\n\nÉ como uma corrente que se puxa sozinha. Justamente por não depender de cliques, um worm pode se espalhar em **velocidade assustadora**: em minutos, milhares de máquinas. Historicamente, worms causaram alguns dos maiores surtos da internet, chegando a congestionar redes inteiras só com o tráfego da própria multiplicação."
                    },
                    {
                        "type": "text",
                        "value": "## Trojan: o presente de grego\n\nO **trojan**, ou **cavalo de Troia**, tira o nome da lenda grega: os troianos levaram para dentro dos muros um enorme cavalo de madeira que julgavam ser um presente e, escondidos dentro dele, estavam os soldados inimigos. O malware faz igual: **se disfarça de algo legítimo e desejável** para que você mesmo o instale.\n\nUm trojan pode se passar por um jogo, um crack, um app de edição de foto, um \"acelerador de PC\". Você instala achando que é útil, e junto vem o estrago escondido. A diferença fundamental: o trojan **não se replica sozinho** como o vírus ou o worm; ele depende de te **enganar**. A arma dele não é técnica, é a **sua confiança**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\",\"Vírus\",\"Worm\",\"Trojan\"],[\"Como se espalha\",\"Grudado em um arquivo hospedeiro\",\"Sozinho, pela rede\",\"Disfarçado; o usuário instala\"],[\"Precisa de ação humana?\",\"Sim (executar o hospedeiro)\",\"Não\",\"Sim (ser enganado a instalar)\"],[\"Se replica sozinho?\",\"Sim, ao ser executado\",\"Sim, automaticamente\",\"Não\"],[\"Arma principal\",\"Um arquivo aparentemente inofensivo\",\"Falhas de rede e velocidade\",\"O disfarce e a sua confiança\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta que separa os três é sempre a mesma: **como ele se propaga?** O vírus pega carona num arquivo e precisa que você o execute. O worm anda sozinho pela rede. O trojan se disfarça e convence você a abrir a porta. Estrago é consequência; propagação é a identidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um programa malicioso se espalhou por milhares de computadores de uma rede em poucos minutos, sem que ninguém clicasse em nada. Que tipo de malware melhor descreve esse comportamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Worm, que se espalha sozinho pela rede, sem clique nenhum.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trojan, que precisa enganar cada usuário a instalá-lo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vírus, que precisa que alguém execute o arquivo hospedeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adware, que apenas mostra anúncios na tela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você baixa um \"acelerador de PC gratuito\", instala, e junto vem um programa que rouba suas senhas. Que tipo de malware é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Trojan (cavalo de Troia): disfarçado de algo útil, é você quem instala.",
                                "isCorrect": true
                            },
                            {
                                "text": "Worm, pois se espalha sozinho pela rede, sem nenhuma ação humana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vírus, pois qualquer programa malicioso recebe esse nome.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada disso: um programa instalado por vontade própria nunca é malware.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquivo infectado por vírus está guardado no computador há meses, mas nunca foi aberto. O que se pode dizer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O vírus fica inativo até que o hospedeiro seja executado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O vírus já se espalhou sozinho por toda a rede, como um worm.",
                                "isCorrect": false
                            },
                            {
                                "text": "O vírus deixou de ser malware por não ter sido aberto ainda.",
                                "isCorrect": false
                            },
                            {
                                "text": "É impossível um arquivo infectado existir sem já ter causado dano.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica diferencia um trojan de um vírus e de um worm?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O trojan não se replica sozinho; depende de enganar o usuário.",
                                "isCorrect": true
                            },
                            {
                                "text": "O trojan é o único dos três que se espalha pela rede sem ajuda.",
                                "isCorrect": false
                            },
                            {
                                "text": "O trojan é sempre inofensivo, ao contrário dos outros dois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O trojan é a única forma de malware capaz de causar dano financeiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, historicamente, worms causaram surtos de infecção muito mais rápidos e amplos do que vírus tradicionais?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque se replicam sozinhos pela rede, sem depender de cliques.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque worms são os únicos capazes de causar algum dano ao sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque worms se disfarçam melhor de programas legítimos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque vírus não conseguem se copiar de forma alguma.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que o malware faz lá dentro: ransomware, spyware, rootkit e cia.",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que o malware faz lá dentro: ransomware, spyware, rootkit e cia.\n\nNa aula anterior olhamos para _como_ o malware se espalha. Agora vamos olhar para o _que ele faz_ depois de entrar, a tal da **carga** (payload). Aqui os nomes mudam de critério: não importa mais como chegaram (podem ter vindo como vírus, worm ou trojan), e sim qual estrago causam. Um mesmo trojan, por exemplo, pode carregar dentro dele um ransomware ou um spyware."
                    },
                    {
                        "type": "text",
                        "value": "## Ransomware: o sequestro dos seus arquivos\n\nO **ransomware** é hoje um dos malwares mais temidos, e o nome entrega tudo: _ransom_ é \"resgate\" em inglês. Ele **criptografa** (embaralha com um cadeado digital) os seus arquivos e exige um **pagamento**, geralmente em criptomoeda, para devolver o acesso. Sem a chave, fotos, planilhas e sistemas inteiros viram um amontoado de dados inúteis.\n\nÉ o equivalente digital a um sequestro: trancam algo que é seu e cobram para devolver. Em 2017, o ransomware **WannaCry** se espalhou por computadores no mundo todo e chegou a afetar hospitais e empresas, mostrando que o alvo não é só \"gente descuidada\": serviços essenciais também caem. E há um detalhe cruel: **pagar não garante nada**. Você estaria confiando na palavra de um criminoso, e muitas vítimas pagam e não recuperam os arquivos. Por isso o melhor remédio é preventivo: **backup**."
                    },
                    {
                        "type": "text",
                        "value": "## Spyware, keylogger e adware: os bisbilhoteiros\n\nEssa família não quer sequestrar nada: quer **te observar** e lucrar com isso, de preferência sem você notar.\n\n- **Spyware** (\"software espião\"): fica escondido coletando informações, como sites que você visita, dados que você digita e arquivos que você tem. Depois manda tudo para o criminoso.\n- **Keylogger** (\"registrador de teclas\"): um tipo especialmente perigoso de espião, que anota **cada tecla que você aperta**. Ao digitar a senha do banco, você a entrega de bandeja. É uma das formas mais diretas de roubar credenciais.\n- **Adware** (\"software de anúncios\"): inunda a tela de propagandas e pop-ups. Costuma ser o **menos perigoso** da lista, mais irritante do que destrutivo, mas não é inofensivo: além de deixar tudo lento, pode espionar seus hábitos e, às vezes, abrir a porta para pragas piores."
                    },
                    {
                        "type": "text",
                        "value": "## Rootkit: o intruso que apaga as próprias pegadas\n\nO nome vem de _root_, que em muitos sistemas é a conta de **poder máximo** (o administrador total). Um **rootkit** é um malware feito para conseguir esse nível de controle e, principalmente, para **se esconder**. Ele se enfia nas camadas mais profundas do sistema e mente para o computador: some da lista de programas, engana o antivírus, disfarça os arquivos que usa.\n\nÉ o intruso que não só entra na casa, mas mexe nas câmeras de segurança para não aparecer em nenhuma gravação. Por isso rootkits estão entre os malwares **mais difíceis de detectar e remover**; muitas vezes, a única saída confiável é formatar a máquina. Ele costuma servir de \"base\" para outros malwares operarem escondidos."
                    },
                    {
                        "type": "text",
                        "value": "## Botnet: quando sua máquina vira soldado\n\nUm **bot** (de \"robô\") é um computador infectado que passa a **obedecer** a um criminoso remotamente. Uma **botnet** é uma **rede** desses computadores-zumbis: podem ser milhares ou milhões, espalhados pelo mundo, muitos deles de gente comum que não faz ideia de que a própria máquina está sendo usada.\n\nO dono da botnet dá ordens a todos de uma vez. Com esse exército, ele pode disparar spam em massa, minerar criptomoeda, tentar quebrar senhas ou lançar ataques de sobrecarga (o DDoS, que veremos na próxima aula). O assustador é a discrição: sua máquina pode estar em uma botnet **funcionando normalmente**, só um pouco mais lenta, enquanto trabalha para o crime nas suas costas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de malware\",\"O que ele faz\",\"Objetivo principal\"],[\"Ransomware\",\"Criptografa seus arquivos e cobra resgate\",\"Extorquir dinheiro\"],[\"Spyware\",\"Coleta informações escondido\",\"Roubar dados\"],[\"Keylogger\",\"Registra tudo o que você digita\",\"Roubar senhas e credenciais\"],[\"Adware\",\"Enche a tela de anúncios\",\"Lucrar com propaganda (e incomodar)\"],[\"Rootkit\",\"Dá controle profundo e se esconde\",\"Manter acesso oculto e duradouro\"],[\"Botnet\",\"Transforma a máquina em zumbi obediente\",\"Usar seu computador em ataques maiores\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Ao ligar o computador, uma empresa encontra todos os arquivos embaralhados e uma mensagem exigindo pagamento em criptomoeda para liberá-los. Que tipo de malware é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ransomware.",
                                "isCorrect": true
                            },
                            {
                                "text": "Adware.",
                                "isCorrect": false
                            },
                            {
                                "text": "Keylogger.",
                                "isCorrect": false
                            },
                            {
                                "text": "Worm.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um malware registra cada tecla digitada e envia ao criminoso, capturando a senha do banco no momento em que a vítima a digita. Como se chama esse tipo de programa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Keylogger (registrador de teclas).",
                                "isCorrect": true
                            },
                            {
                                "text": "Adware (programa de anúncios).",
                                "isCorrect": false
                            },
                            {
                                "text": "Ransomware (sequestro de arquivos).",
                                "isCorrect": false
                            },
                            {
                                "text": "Rootkit (acesso oculto ao sistema).",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O computador de uma pessoa comum funciona quase normal, só um pouco mais lento, mas está sendo usado remotamente por um criminoso, junto com milhares de outros, para disparar ataques. Essa máquina faz parte de quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "De uma botnet, como um computador-zumbi.",
                                "isCorrect": true
                            },
                            {
                                "text": "De um rootkit isolado, sem conexão com outras máquinas.",
                                "isCorrect": false
                            },
                            {
                                "text": "De um adware que só mostra anúncios.",
                                "isCorrect": false
                            },
                            {
                                "text": "De um serviço de backup na nuvem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que rootkits são considerados um dos tipos de malware mais difíceis de detectar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque operam no fundo do sistema e enganam o antivírus.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque exibem uma mensagem exigindo resgate bem no meio da tela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque enchem a tela de anúncios impossíveis de ignorar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque avisam o usuário assim que se instalam.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A rede de uma empresa foi tomada por ransomware. Qual afirmação reflete melhor a boa prática de segurança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pagar não garante nada; manter backups é a defesa mais confiável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pagar o resgate sempre devolve os arquivos, com total certeza.",
                                "isCorrect": false
                            },
                            {
                                "text": "Basta reiniciar o computador que o ransomware some sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ransomware só atinge usuários domésticos, nunca empresas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ataques na rede: sniffing, MITM e DDoS",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ataques na rede: sniffing, MITM e DDoS\n\nNem todo ataque instala um programa na sua máquina. Muitos acontecem **no caminho**, nos cabos, no Wi-Fi, nos servidores, enquanto seus dados viajam pela internet. Nesta aula veremos três ataques clássicos que miram a **rede**: o sniffing (farejar), o MITM (interceptar) e o DDoS (sobrecarregar). A boa notícia é que existem defesas simples e poderosas, como você vai ver."
                    },
                    {
                        "type": "text",
                        "value": "## Sniffing: alguém farejando o que passa\n\n**Sniffing** (\"farejar\") é o ato de **capturar e ler o tráfego** que passa por uma rede. Quando seus dados viajam **sem criptografia**, eles trafegam como um **cartão-postal**: qualquer um no caminho pode ler. Um atacante conectado à mesma rede (pense no **Wi-Fi grátis** de um café ou aeroporto) pode usar uma ferramenta para \"escutar\" tudo o que passa e pescar senhas, mensagens e números de cartão.\n\nA defesa? **Criptografia.** É por isso que o cadeado do **HTTPS** (aquele `https://` no início dos sites) importa tanto: ele transforma o cartão-postal em uma **carta lacrada**. O atacante até percebe que uma carta passou, mas não consegue ler o conteúdo."
                    },
                    {
                        "type": "text",
                        "value": "## Man-in-the-middle: o intermediário invisível\n\nO **man-in-the-middle** (MITM, \"homem no meio\") é um passo além do sniffing. Aqui o atacante não só escuta: ele se **posiciona no meio** da conversa entre você e o site, fingindo para cada lado ser o outro. Você acha que fala direto com o banco; o banco acha que fala direto com você; mas tudo passa pelo atacante, que pode **ler e até alterar** as mensagens.\n\nImagine um carteiro desonesto que abre todas as suas cartas, lê, às vezes muda o conteúdo, lacra de novo e entrega. Nenhum dos lados percebe. Um golpe comum é o **Wi-Fi falso**: o criminoso cria uma rede com nome parecido com o do local e, quem se conecta, passa a ter todo o tráfego intermediado por ele. Mais uma vez, a criptografia forte (HTTPS, VPN) é a principal defesa."
                    },
                    {
                        "type": "text",
                        "value": "## DDoS: afogar o serviço em pedidos\n\nO **DDoS** (_Distributed Denial of Service_, \"negação de serviço distribuída\") tem um objetivo diferente dos anteriores: não quer roubar dados, quer **derrubar**, deixar um site ou serviço **fora do ar**. A tática é sobrecarregar o alvo com um **dilúvio de acessos** ao mesmo tempo, até ele não aguentar e parar de responder aos usuários de verdade.\n\nImagine uma loja com uma única porta. Se centenas de pessoas fingindo ser clientes entopem a entrada de propósito, os clientes reais não conseguem passar. A loja não foi roubada, mas ficou **inútil** enquanto durou o tumulto.\n\nO \"distribuído\" do nome é a parte esperta: o ataque não vem de um computador, e sim de **milhares ao mesmo tempo**, geralmente uma **botnet** (lembra dos zumbis da aula passada?). Isso o torna difícil de bloquear, porque não há um único endereço para barrar: os pedidos maliciosos vêm misturados aos legítimos, do mundo inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ataque\",\"Objetivo\",\"Analogia\",\"Defesa principal\"],[\"Sniffing\",\"Ler os dados que passam na rede\",\"Ler um cartão-postal alheio\",\"Criptografia (HTTPS)\"],[\"Man-in-the-middle\",\"Interceptar e alterar a comunicação\",\"Carteiro que abre e troca cartas\",\"Criptografia forte, VPN, checar o cadeado\"],[\"DDoS\",\"Derrubar o serviço, tirar do ar\",\"Multidão entupindo a porta da loja\",\"Filtragem de tráfego e proteção anti-DDoS\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Um site de vendas fica fora do ar por horas porque recebeu um volume gigantesco de acessos falsos ao mesmo tempo. Que tipo de ataque é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "DDoS, um ataque de negação de serviço.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ransomware, que criptografa os arquivos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sniffing, que apenas lê o tráfego da rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Keylogger, que registra as teclas digitadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao usar o Wi-Fi grátis de um aeroporto, por que é mais seguro acessar apenas sites com `https://` (cadeado)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o HTTPS criptografa os dados e impede leitura por terceiros.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o HTTPS deixa a conexão de internet mais rápida e leve.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o cadeado impede que o site exiba qualquer anúncio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sites com https nunca podem ser falsos, clonados ou maliciosos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um criminoso cria uma rede Wi-Fi com nome parecido com a do café e passa a interceptar tudo o que as vítimas conectadas enviam, podendo até alterar mensagens. Que ataque ele está realizando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Man-in-the-middle (homem no meio).",
                                "isCorrect": true
                            },
                            {
                                "text": "DDoS (negação de serviço).",
                                "isCorrect": false
                            },
                            {
                                "text": "Força bruta, tentando todas as senhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um backup automático da rede, sem ataque.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um ataque DDoS costuma ser difícil de bloquear simplesmente barrando um endereço?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque os acessos vêm de milhares de máquinas ao mesmo tempo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o ataque sempre vem de um único computador conhecido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o DDoS criptografa todos os arquivos do servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o DDoS só funciona em redes sem acesso à internet.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença central entre sniffing e um ataque man-in-the-middle?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "No sniffing o atacante só lê; no MITM ele também altera as mensagens.",
                                "isCorrect": true
                            },
                            {
                                "text": "São exatamente a mesma coisa, apenas com nomes diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O sniffing derruba o site, enquanto o MITM apenas o deixa lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O MITM só observa os dados, enquanto o sniffing sempre os modifica.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ataques a senhas e um alerta sobre injeção",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ataques a senhas e um alerta sobre injeção\n\nMuitos ataques nem precisam de malware sofisticado: basta **descobrir a sua senha**. Nesta última aula do módulo veremos como os criminosos atacam senhas e por que senhas fracas e repetidas são um prato cheio para eles. No final, uma espiada rápida nos **ataques de injeção**, um assunto que a trilha de segurança web vai aprofundar."
                    },
                    {
                        "type": "text",
                        "value": "## Força bruta e ataque de dicionário\n\nO jeito mais direto de quebrar uma senha é **tentar até acertar**. É isso que fazem os ataques automatizados:\n\n- **Força bruta** (_brute force_): o computador testa **todas as combinações possíveis** (`aaaa`, `aaab`, `aaac`...) até acertar. Parece impossível, mas máquinas testam milhões de tentativas por segundo. Contra uma senha curta como `1234`, é questão de instantes. Contra uma senha longa, o número de combinações cresce tanto que levaria séculos, e é exatamente por isso que **tamanho importa**.\n- **Ataque de dicionário**: em vez de tentar tudo, o atacante usa uma **lista de senhas prováveis**, com palavras comuns, nomes, datas e as campeãs de vazamentos. É muito mais rápido, porque mira direto no que as pessoas realmente usam. Se a sua senha está nessa lista, ela cai em segundos.\n\nUm trecho de uma dessas listas se parece com isto:"
                    },
                    {
                        "type": "code",
                        "value": "123456\nsenha\nqwerty\nadmin\nfutebol2024\nteamo\n11111111"
                    },
                    {
                        "type": "text",
                        "value": "## Credential stuffing: o perigo de repetir senha\n\nDe tempos em tempos, algum site sofre um **vazamento** e milhões de e-mails e senhas acabam à venda na internet. É aí que entra o **credential stuffing** (\"recheio de credenciais\"): o criminoso pega essas combinações de e-mail e senha vazadas de um site e as **testa automaticamente em vários outros**, como seu e-mail, seu banco, sua rede social.\n\nPor que isso funciona tão bem? Porque muita gente **repete a mesma senha** em tudo. Aí basta **um** site frágil vazar a sua senha para que **todas** as suas contas fiquem expostas. É como usar a mesma chave na casa, no carro e no escritório: se um ladrão copia essa chave em um lugar, abre todos os outros.\n\nPor isso as duas regras de ouro: **senhas longas e únicas** para cada conta (um **gerenciador de senhas** faz esse trabalho pesado por você) e, sempre que possível, a **autenticação em dois fatores** (aquele código extra), que segura o ataque mesmo se a senha vazar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ataque\",\"Como funciona\",\"Por que dá certo\"],[\"Força bruta\",\"Testa todas as combinações possíveis\",\"Senhas curtas têm poucas combinações\"],[\"Dicionário\",\"Testa uma lista de senhas comuns\",\"As pessoas usam senhas óbvias\"],[\"Credential stuffing\",\"Testa senhas vazadas em outros sites\",\"As pessoas reutilizam a mesma senha\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Um alerta rápido: ataques de injeção\n\nPara fechar o módulo, uma ameaça de natureza diferente, que nasce de um descuido na **programação** dos sistemas. Nos **ataques de injeção**, o criminoso digita, num campo comum (uma busca, um login, um formulário), não um texto qualquer, mas **comandos disfarçados**. Se o sistema por trás **confia cegamente** nessa entrada e a executa, o atacante consegue fazer o programa obedecer a ele: vazar um banco de dados inteiro, burlar um login, apagar registros.\n\nA raiz do problema tem um nome: **entradas não validadas**. Um sistema seguro nunca deve confiar no que o usuário digita sem antes **verificar e tratar** esse dado. O tipo mais conhecido é a **SQL injection**, que ataca bancos de dados, mas a ideia vale para vários outros casos.\n\nVocê não precisa dominar isso agora: os detalhes ficam para a **trilha de segurança web**. Fica só o princípio, que vale ouro para quem um dia for construir sistemas: **nunca confie na entrada do usuário; sempre valide**."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um programa tenta automaticamente milhões de combinações de caracteres até acertar uma senha. Que tipo de ataque é esse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Força bruta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Sniffing.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adware.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ataque de injeção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma senha longa é muito mais difícil de quebrar por força bruta do que uma senha curta como `1234`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque, quanto mais longa, mais combinações existem para testar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque senhas longas são criptografadas e as curtas não.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o computador do atacante não consegue digitar senhas longas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque senhas longas mudam sozinhas a cada tentativa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa usa a mesma senha no e-mail, no banco e numa loja online. A loja sofre um vazamento. Qual é o maior risco?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um atacante pode testar essa senha vazada nas outras contas dela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum, pois cada site guarda a senha de forma separada e independente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco se limita a ela receber mais anúncios da loja.",
                                "isCorrect": false
                            },
                            {
                                "text": "A senha da loja para de funcionar, mas as outras ficam mais seguras.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que senhas como `123456`, `senha` ou `qwerty` são especialmente perigosas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque estão nas listas de dicionário e caem em segundos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque são longas demais para o sistema aceitar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só funcionam em redes Wi-Fi públicas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o teclado as criptografa de um jeito mais fraco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num campo de login, um atacante digita não um nome de usuário, mas um comando disfarçado, e o sistema o executa, liberando o acesso. Que falha permitiu isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma entrada do usuário não validada, a raiz da injeção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma senha longa demais armazenada no banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um antivírus desatualizado no computador do usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um ataque de DDoS contra o servidor de login.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Engenharia social e o fator humano",
        "aulas": [
            {
                "titulo": "O elo humano e os gatilhos psicológicos",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O elo humano e os gatilhos psicológicos\n\nAté aqui, nesta trilha, você conheceu ameaças bem \"técnicas\": vírus, worms, ransomware, ataques que exploram falhas em programas e sistemas. Neste módulo a gente muda o alvo. A ameaça de que vamos falar agora não invade um computador quebrando um cadeado digital: ela convence **você** a abrir a porta.\n\nIsso tem um nome: **engenharia social**. É a arte de manipular pessoas para que revelem informações confidenciais ou façam algo que comprometa a segurança. Em vez de atacar a máquina, o golpista ataca a **mente** de quem opera a máquina. E, adianto: costuma ser bem mais fácil."
                    },
                    {
                        "type": "quote",
                        "value": "**Engenharia social** é o conjunto de técnicas que exploram a confiança, as emoções e os hábitos das pessoas para obter acesso, dados ou dinheiro. O alvo não é a tecnologia, é o ser humano. Por isso se diz que as pessoas são o **elo mais fraco** (e o mais explorado) da segurança."
                    },
                    {
                        "type": "text",
                        "value": "## Por que mirar nas pessoas?\n\nPense em como a tecnologia de defesa evoluiu. Hoje temos criptografia forte, firewalls, atualizações automáticas, antivírus que aprende sozinho. Quebrar na marra uma senha bem feita ou uma criptografia moderna pode levar tempo e dinheiro que não compensam.\n\nAgora compare com o outro caminho: uma ligação de dois minutos fingindo ser o suporte de TI, pedindo \"só para confirmar\" a sua senha. Não existe atualização que conserte a pressa, a boa vontade ou o medo de uma pessoa. Um sistema pode receber um _patch_ (uma correção); um funcionário cansado numa sexta-feira à tarde, não.\n\nÉ por isso que a grande maioria dos ataques bem-sucedidos começa com um toque de engenharia social. Não porque as pessoas sejam bobas, mas porque somos **humanos**: temos empatia, respeitamos a autoridade, queremos ajudar, ficamos curiosos e reagimos ao medo. O golpista transforma essas qualidades normais em ferramentas contra nós."
                    },
                    {
                        "type": "text",
                        "value": "## O golpe não te convence, ele te apressa\n\nUm bom golpista não tenta te fazer pensar. Ele tenta te fazer **reagir** antes de pensar. É como o vendedor que diz \"é a última unidade e a promoção acaba em cinco minutos\": a pressa serve para desligar o seu senso crítico.\n\nPara isso, a engenharia social usa alguns **gatilhos psicológicos**, botões emocionais que quase todo mundo tem. Conhecer esses gatilhos é a sua melhor vacina: quando você sentir um deles sendo apertado com força, é hora de desconfiar e ir mais devagar. Vamos aos principais."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Gatilho\",\"Como o golpista usa\",\"Exemplo típico\"],[\"Urgência\",\"Cria um prazo curtíssimo para você não ter tempo de pensar\",\"'Sua conta será bloqueada em 24 horas'\"],[\"Autoridade\",\"Finge ser alguém a quem você costuma obedecer\",\"'Aqui é o diretor, preciso disso agora'\"],[\"Medo\",\"Ameaça com prejuízo, punição ou vergonha\",\"'Detectamos um acesso ilegal em seu nome'\"],[\"Curiosidade\",\"Desperta a vontade de ver o que é\",\"'Veja quem andou olhando seu perfil'\"],[\"Prova social\",\"Sugere que todos os outros já fizeram\",\"'Todos os colegas do setor já atualizaram o cadastro'\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Outros botões que costumam ser apertados\n\nAlém dos cinco acima, dois gatilhos aparecem bastante:\n\n- **Reciprocidade**: quando alguém nos faz um favor, sentimos que devemos retribuir. O golpista \"ajuda\" primeiro (resolve um problema que ele mesmo inventou) para depois pedir algo em troca.\n- **Simpatia e familiaridade**: tendemos a confiar em quem parece amigável, ou em nomes e marcas que conhecemos. Por isso os golpes imitam o visual do seu banco, o logo da empresa ou até o jeito de falar de um colega.\n\nRepare no fio que une tudo isso: a engenharia social sequestra emoções **legítimas**. Ser prestativo, respeitar o chefe e confiar em marcas conhecidas não são defeitos, são o que faz a convivência funcionar. O problema é quando alguém usa isso de má-fé. A defesa não é virar uma pessoa fria e desconfiada de tudo; é aprender a perceber quando uma dessas emoções está sendo puxada com força para te fazer agir rápido, e então parar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que melhor descreve o que é engenharia social?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "É manipular pessoas para revelar dados ou burlar a segurança.",
                                "isCorrect": true
                            },
                            {
                                "text": "Técnica usada para deixar redes de computadores mais rápidas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tipo de criptografia aplicada a mensagens de redes sociais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Programa antivírus especializado em vírus de redes sociais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma mensagem diz: \"Sua conta será bloqueada em 24 horas se você não confirmar seus dados agora.\" Qual gatilho psicológico está sendo explorado de forma mais evidente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Urgência.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prova social.",
                                "isCorrect": false
                            },
                            {
                                "text": "Curiosidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reciprocidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um funcionário recebe uma ligação: \"Aqui é do setor de TI da matriz, estamos resolvendo uma falha e preciso da sua senha para liberar seu acesso.\" Qual gatilho o golpista está usando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Autoridade: finge ser do suporte de TI para ser obedecido sem questionamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prova social: alega que todos os colegas já confirmaram a própria senha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Curiosidade: desperta a vontade de descobrir um segredo qualquer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escassez: avisa que a liberação de acesso vale por tempo limitado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa investiu pesado em firewall, criptografia e antivírus, mas mesmo assim sofreu uma invasão que começou com um telefonema convincente. Por que a tecnologia sozinha não impediu o ataque?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a engenharia social ataca a pessoa; não existe patch para a pressa ou o medo humano.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o firewall bloqueia ataques de rede, mas não impede ligações telefônicas enganosas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a criptografia protege dados em trânsito, mas não impede alguém de entregar a senha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o antivírus detecta arquivos maliciosos, mas não identifica um golpe feito por voz.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um golpista liga e diz: \"Notei que sua fatura veio com um valor a mais e já resolvi isso para você. Só preciso que confirme o código que acabou de chegar no seu SMS para fechar o ajuste.\" Além da autoridade, qual gatilho ele usa ao afirmar que já \"resolveu um problema\" antes de pedir algo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reciprocidade: finge ajudar primeiro, criando a sensação de dívida que cobra depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Prova social: afirma que diversos outros clientes já confirmaram esse mesmo código.",
                                "isCorrect": false
                            },
                            {
                                "text": "Curiosidade: desperta a vontade de descobrir o conteúdo secreto do SMS recebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escassez: informa que esse ajuste especial vale só para poucos clientes selecionados.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Phishing: a isca por e-mail e suas variantes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Phishing: a isca por e-mail e suas variantes\n\nAgora que você entende os gatilhos, vamos ver a técnica de engenharia social mais comum de todas: o **phishing**. Se você tem um e-mail, com certeza já recebeu um: aquela mensagem do \"banco\", da \"Receita Federal\" ou dos \"Correios\" pedindo para clicar num link urgente.\n\nA palavra vem do inglês _fishing_ (pescar), com um toque de _phreaking_ (as antigas fraudes de telefonia). A imagem é perfeita: o golpista joga uma **isca** na água e espera alguém morder. Ele não precisa que todo mundo caia; basta uma fração das milhares de pessoas que receberam a mensagem."
                    },
                    {
                        "type": "quote",
                        "value": "**Phishing** é o envio de mensagens fraudulentas que se passam por uma fonte confiável (um banco, uma empresa, um colega) para induzir a vítima a entregar dados sensíveis, clicar em links maliciosos ou baixar arquivos infectados. O e-mail é o canal clássico, mas a mesma ideia aparece em SMS, ligações e redes sociais."
                    },
                    {
                        "type": "text",
                        "value": "## Anatomia de um e-mail de phishing\n\nA maioria dos e-mails de phishing \"em massa\" (disparados para muita gente) tem uma cara parecida. Depois que você aprende os sinais, fica difícil não vê-los. Veja este exemplo fictício, com os pontos suspeitos numerados:"
                    },
                    {
                        "type": "code",
                        "value": "De: Suporte Seguranca <alerta@banco-verificacao-cliente.com>   (1)\nAssunto: URGENTE! Sua conta sera BLOQUEADA em 24 horas          (2)\n\nPrezado cliente,                                               (3)\n\nDetectamos um acesso suspeito na sua conta. Por sua seguranca,\nconfirme seus dados AGORA para evitar o bloqueio permanente:\n\n    http://sualogin-seguro.verificar-conta.xyz/banco           (4)\n\nCaso nao confirme em 24h, voce perdera o acesso e o saldo.     (5)\n\nAtenciosamente,\nEquipe de Seguranca\n\n----------------------------------------------------------------\n(1) Dominio estranho: nao e o site oficial do banco.\n(2) Urgencia + medo, gritando em letras MAIUSCULAS.\n(3) Saudacao generica: um banco de verdade costuma usar seu nome.\n(4) O link nao leva ao site oficial (passe o mouse e confira o destino antes de clicar).\n(5) Ameaca de perda para te empurrar a agir no impulso."
                    },
                    {
                        "type": "text",
                        "value": "## Quando a isca é feita sob medida\n\nO phishing em massa é um tiro de rede: atinge muita gente com pouca personalização e, por isso, é mais fácil de perceber. Mas existem versões bem mais perigosas, feitas sob medida.\n\nA primeira é o **spear phishing** (de _spear_, lança). Aqui o golpista mira **uma pessoa específica** e faz o dever de casa: pesquisa nome, cargo, colegas e projetos nas redes sociais para escrever uma mensagem sob medida. Um e-mail genérico é fácil de ignorar; já um que cita o nome do seu gerente e um projeto real da empresa parece legítimo. Quando esse ataque direcionado mira os **peixes grandes** (diretores, o CEO, gente com poder e acesso), ele ganha um nome próprio: **whaling** (de _whale_, baleia).\n\nA segunda é o **BEC** (_Business Email Compromise_, ou comprometimento de e-mail empresarial), também chamado de \"fraude do CEO\". O golpista se passa por um executivo ou por um fornecedor de confiança (às vezes usando uma conta de e-mail real que ele invadiu) e pede uma **transferência urgente** ou a troca dos dados de pagamento de um boleto. O mais traiçoeiro é que muitas vezes **não há link nem anexo** para um antivírus detectar: é só texto, com urgência e autoridade. A defesa aqui não é técnica, é humana: confirmar o pedido por outro canal antes de pagar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Variante\",\"Alvo\",\"Marca registrada\"],[\"Phishing\",\"Muitas pessoas ao mesmo tempo\",\"Mensagem genérica disparada em massa\"],[\"Spear phishing\",\"Uma pessoa ou grupo específico\",\"Personalizado com dados reais da vítima\"],[\"Whaling\",\"Altos executivos (CEO, diretores)\",\"Spear phishing mirando os peixes grandes\"],[\"BEC\",\"Quem autoriza pagamentos\",\"Pedido de transferência, por texto, sem link nem anexo\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é phishing?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mensagem fraudulenta que finge ser de uma fonte confiável para roubar dados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um esporte de pesca à distância, praticado hoje em dia pela internet.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um tipo de firewall que examina e filtra e-mails suspeitos automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um programa antivírus gratuito, especializado em proteger contas de e-mail.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia o spear phishing do phishing comum?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele mira uma pessoa específica, com dados reais para parecer legítimo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele é sempre enviado por SMS, e nunca chega por e-mail comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele é inofensivo, já que atinge apenas uma única pessoa por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele atinge muito mais pessoas ao mesmo tempo, sem nenhum alvo fixo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um e-mail chega à diretora financeira citando um projeto real e assinado como se fosse o presidente da empresa, pedindo a aprovação urgente de um pagamento sigiloso. Que tipo de ataque é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Whaling: spear phishing direcionado a um alvo de alto escalão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Phishing em massa: mensagem genérica disparada para muita gente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Smishing: um golpe que chega por SMS, não por e-mail corporativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Baiting: uma isca, como um pen drive, deixada para a vítima morder.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O setor financeiro recebe um e-mail, aparentemente de um fornecedor conhecido, avisando que \"mudou de banco\" e pedindo que os próximos boletos sejam pagos em uma nova conta. Não há links nem anexos. Qual é a defesa mais adequada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ligar para um telefone já conhecido do fornecedor antes de mudar o pagamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar o antivírus no e-mail, pois o risco de golpe está sempre no anexo enviado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Responder ao próprio e-mail, pedindo por escrito a confirmação dos novos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pagar logo na nova conta indicada, para não perder o prazo do boleto atual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois e-mails chegam no mesmo dia. O primeiro, disparado para todo o setor, diz \"Prezado cliente, atualize seu cadastro\". O segundo, só para você, cita seu gerente pelo nome, menciona um projeto real e pede que você envie uma planilha. Por que o segundo é mais perigoso, mesmo sem trazer ameaças óbvias?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque é spear phishing: dados reais tornam a mensagem convincente e confiável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque mensagens enviadas a uma só pessoa sempre carregam vírus mais fortes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o primeiro e-mail, por ser genérico, sequer é considerado phishing.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque nenhuma planilha enviada por e-mail pode ser aberta com segurança.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Além do e-mail: vishing, smishing e outros canais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Além do e-mail: vishing, smishing e outros canais\n\nO phishing não mora só na caixa de entrada. A mesma ideia (se passar por alguém confiável para enganar) funciona em qualquer canal por onde as pessoas se comunicam. E, à medida que aprendemos a desconfiar de e-mails, os golpistas migram para onde ainda baixamos a guarda: o telefone, o SMS, o WhatsApp, o QR code.\n\nNesta aula você vai conhecer os \"primos\" do phishing que usam a voz e as mensagens de celular. O nome muda conforme o canal, mas a receita é a mesma de sempre: um pretexto convincente temperado com urgência."
                    },
                    {
                        "type": "text",
                        "value": "## Vishing: o golpe pela voz\n\n**Vishing** é a junção de _voice_ (voz) com phishing: o ataque feito por **ligação telefônica**. É o clássico \"golpe do falso funcionário do banco\" ou do \"falso suporte técnico\". O telefone tem uma força especial: uma voz humana, ao vivo, pressionando em tempo real, é muito mais difícil de resistir do que um texto que você pode reler com calma.\n\nOs roteiros você provavelmente já ouviu: alguém liga dizendo que houve uma \"compra suspeita\" no seu cartão e que, para cancelar, você precisa informar o código que vai chegar por SMS. Ou o \"suporte da empresa de tecnologia\" avisando que seu computador está infectado e que precisa de acesso remoto para consertar. Em todos, a voz calma e prestativa serve para baixar a sua guarda enquanto a urgência te empurra.\n\nUm agravante moderno: já existem golpes que usam **clonagem de voz** por inteligência artificial para imitar a voz de um parente ou de um chefe. Ouvir uma voz conhecida deixou de ser garantia de que a pessoa é quem diz ser."
                    },
                    {
                        "type": "text",
                        "value": "## Smishing: o golpe por SMS e mensagem\n\n**Smishing** é o phishing que chega por **SMS** (daí _SMS + phishing_) e, por extensão, por aplicativos de mensagem como o WhatsApp. São aquelas mensagens curtinhas com um link: \"Sua encomenda está retida, pague a taxa aqui\", \"Você recebeu um Pix, confirme seus dados\", \"Sua conta do streaming expirou\".\n\nO SMS tem duas vantagens para o golpista. Primeiro, é difícil examinar um link no celular: a tela é pequena e o endereço muitas vezes vem encurtado, escondendo para onde ele realmente leva. Segundo, mexemos no celular no impulso, entre uma tarefa e outra, sem a atenção que damos ao computador.\n\nUma variante muito comum no Brasil é o **golpe do WhatsApp**: o golpista clona ou finge ser o número de um conhecido e escreve \"troquei de celular, me manda um Pix que depois te explico\". É engenharia social pura, usando a confiança em quem você acha que está do outro lado."
                    },
                    {
                        "type": "text",
                        "value": "## E ainda tem o QR code\n\nUma modalidade mais nova é o **quishing**, o phishing por **QR code**. Em vez de um link escrito, o golpista mostra um QR code (colado sobre o cartaz de um estacionamento, impresso num falso boleto, enviado num e-mail) que leva o seu celular para um site falso ou inicia um pagamento indevido. Como o QR code é ilegível a olho nu, você só descobre o destino depois de escanear, quando já pode ser tarde.\n\nRepare que, canal a canal, o truque é o mesmo. Muda o meio (voz, SMS, QR code), mas o coração do golpe continua sendo a engenharia social: um pretexto que parece legítimo, um gatilho emocional e um pedido de ação rápida."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nome\",\"Canal\",\"Exemplo clássico\"],[\"Phishing\",\"E-mail\",\"O suposto banco pedindo para clicar e confirmar dados\"],[\"Vishing\",\"Ligação de voz\",\"Falso suporte técnico pedindo acesso remoto ao seu PC\"],[\"Smishing\",\"SMS ou WhatsApp\",\"Sua encomenda está retida, pague a taxa por este link\"],[\"Quishing\",\"QR code\",\"Código adulterado que leva a um site de pagamento falso\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A regra de ouro para qualquer canal\n\nComo o golpe é o mesmo em todo canal, a defesa também é. Guarde esta regra: **desligue e procure o canal oficial você mesmo**. Recebeu uma ligação do \"seu banco\"? Agradeça, desligue e ligue de volta pelo número que está no verso do seu cartão ou no aplicativo oficial, nunca pelo número que te ligou. Chegou um SMS com link? Não clique; abra o aplicativo ou digite o site oficial na mão.\n\nE duas frases que valem por toda a aula:\n\n- **Nenhuma instituição séria pede a sua senha, o seu PIN ou o código de verificação** que chegou no seu celular. Quem pede isso é golpista, ponto.\n- **Ouvir uma voz ou um nome conhecido não é prova de identidade.** Números são clonados e vozes são imitadas. Na dúvida, confirme por um segundo canal antes de agir."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é vishing?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um golpe de engenharia social aplicado por telefone.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um golpe aplicado somente por mensagem de texto (SMS).",
                                "isCorrect": false
                            },
                            {
                                "text": "Um golpe aplicado somente por mensagens de e-mail.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um golpe aplicado somente por meio de QR code.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por qual canal o smishing chega até a vítima?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Por SMS e por apps de mensagem, como o WhatsApp.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas por meio de ligações telefônicas de voz.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas por mensagens de e-mail corporativo interno.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por cabos de rede conectados diretamente ao computador.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você recebe uma ligação: \"Aqui é a central do seu banco. Identificamos uma compra suspeita. Para cancelar, me informe o código de seis dígitos que acabamos de enviar por SMS.\" O que você deve fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não informar o código; desligar e ligar ao número oficial do banco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Informar o código, já que a ligação partiu claramente do banco de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ligar de volta para o mesmo número que ligou, e assim confirmar o pedido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Responder ao SMS com o código recebido, para agilizar o cancelamento pedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma mensagem de um número desconhecido chega no WhatsApp: \"Oi, é o seu primo, troquei de celular. Preciso de um Pix urgente, depois te explico.\" Qual é o sinal mais claro de golpe aqui?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Número novo, pedido de dinheiro e urgência, sem confirmar por outro canal.",
                                "isCorrect": true
                            },
                            {
                                "text": "O simples fato de ser um primo, já que parentes nunca pedem dinheiro assim.",
                                "isCorrect": false
                            },
                            {
                                "text": "O horário da mensagem, enviada fora do expediente comercial normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "O uso do WhatsApp para pedir o dinheiro, em vez de uma ligação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa recebe uma ligação em que a voz é idêntica à do seu chefe, pedindo com urgência que ela pague um boleto fora do procedimento normal. A voz foi imitada por inteligência artificial. Que princípio, se seguido, teria protegido a vítima mesmo com a voz clonada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A voz não prova identidade; todo pedido incomum deve ser confirmado por outro canal.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ligações do chefe devem sempre ser obedecidas na hora, sem qualquer questionamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Golpes por clonagem de voz não existem de verdade, então era seguro pagar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um antivírus atualizado no computador seria suficiente para evitar o golpe.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Golpes fora da tela: pretexting, isca e carona",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Golpes fora da tela: pretexting, isca e carona\n\nNem toda engenharia social acontece por trás de uma tela. Boa parte dos ataques mais audaciosos é feita **no mundo físico** ou por contato direto: alguém que liga com uma história bem montada, que deixa um pen drive \"esquecido\" de propósito, que entra no prédio atrás de você. Nesta aula vamos conhecer essas técnicas mais \"analógicas\", e você vai perceber que muitas delas dispensam qualquer computador.\n\nO fio condutor de quase todas é o mesmo: uma **história convincente**. Por isso vamos começar por ela."
                    },
                    {
                        "type": "text",
                        "value": "## Pretexting: a arte da história falsa\n\n**Pretexting** vem de _pretext_ (pretexto): é inventar um **cenário e um personagem** convincentes para justificar um pedido e ganhar a confiança da vítima. O golpista assume uma identidade (o técnico da operadora, o auditor, o entregador, o funcionário novo do RH) e constrói uma historinha que faz o pedido dele parecer a coisa mais natural do mundo.\n\nPor exemplo: \"Oi, aqui é o Ricardo, da equipe de TI. Estamos migrando o sistema e o seu usuário deu erro. Você pode confirmar seu login e senha para eu recadastrar antes que trave seu acesso amanhã?\" Não há vírus, não há link: há um personagem plausível, um contexto que faz sentido e um pedido que, no meio da correria, parece razoável.\n\nO pretexting é a **base** de quase toda engenharia social: o phishing, o vishing e as técnicas que veremos a seguir quase sempre dependem de um bom pretexto por trás."
                    },
                    {
                        "type": "text",
                        "value": "## Baiting e quid pro quo: a troca tentadora\n\nO **baiting** (de _bait_, isca) explora a nossa **curiosidade** e o gosto por algo grátis. O exemplo clássico é deixar um **pen drive** de propósito no estacionamento ou no banheiro da empresa, com uma etiqueta chamativa como \"Salários 2024\" ou \"Confidencial\". Quem encontra e espeta no computador (por curiosidade ou até com a boa intenção de achar o dono) acaba instalando um malware sem perceber. A isca também pode ser digital: um download \"grátis\" de um filme, um jogo ou um programa pago, recheado de vírus.\n\nO **quid pro quo** (do latim, \"isto por aquilo\") é a promessa de um **benefício em troca** de uma informação ou de uma ação. O caso típico é o falso suporte técnico que liga oferecendo \"ajuda\" para um problema que você nem sabia que tinha e, em troca, pede que você desative o antivírus ou instale um programa de acesso remoto. Você acha que está recebendo um favor; na prática, está abrindo a porta."
                    },
                    {
                        "type": "text",
                        "value": "## Carona, espiada e lixo: invadindo o espaço físico\n\nQuando o alvo é entrar num prédio ou numa sala restrita, entram em cena técnicas bem presenciais:\n\n- **Tailgating** (ou _piggybacking_, a \"carona\"): entrar numa área controlada **seguindo de perto** alguém autorizado. O golpista chega junto com um funcionário na catraca, muitas vezes de mãos ocupadas com caixas ou um café, contando com a gentileza de quem segura a porta para ele. Educação demais, segurança de menos.\n- **Shoulder surfing** (\"espiar por cima do ombro\"): simplesmente **olhar** você digitar a senha, o PIN no caixa eletrônico ou a tela do notebook no avião, no café, no transporte público. Não precisa de tecnologia nenhuma, só de um par de olhos bem posicionado.\n- **Dumpster diving** (\"mergulho na lixeira\"): **vasculhar o lixo** atrás de documentos, extratos, anotações de senha e outros papéis descartados sem cuidado. O que vira lixo para você pode ser um mapa do tesouro para o golpista.\n\nRepare que nenhuma dessas técnicas exige invadir um sistema. Elas exploram a gentileza, a distração e o descuido do dia a dia."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\",\"Como funciona\",\"Como se proteger\"],[\"Pretexting\",\"Inventa um personagem e uma história para justificar o pedido\",\"Verifique a identidade por um canal oficial antes de atender\"],[\"Baiting\",\"Deixa uma isca tentadora (pen drive, download grátis) para você morder\",\"Nunca conecte dispositivos achados nem baixe de fontes duvidosas\"],[\"Quid pro quo\",\"Oferece um benefício em troca de informação ou acesso\",\"Desconfie de ajuda que você não pediu\"],[\"Tailgating\",\"Entra numa área restrita seguindo alguém autorizado\",\"Não segure a porta para desconhecidos; cada um usa o próprio crachá\"],[\"Shoulder surfing\",\"Espia a sua senha ou a sua tela por cima do ombro\",\"Proteja o teclado ao digitar; cuidado com a tela em locais públicos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O denominador comum\n\nOlhe para trás nesta aula e veja o padrão: em todas as técnicas, o golpista se aproveita de comportamentos que, no dia a dia, são **positivos**. Segurar a porta para quem está de mãos cheias é gentileza. Ajudar um colega novo com o sistema é colaboração. Aceitar a ajuda de um suporte é confiar. Ninguém quer ser a pessoa grosseira que barra um \"colega\" na porta.\n\nÉ exatamente essa boa educação que o atacante transforma em brecha. Por isso, no contexto da segurança, vale trocar o \"na dúvida, ajude\" por um **\"na dúvida, verifique\"**. Pedir um crachá, confirmar quem está ligando, não conectar um pen drive achado: nada disso é falta de educação. É cuidado. E, na maioria das empresas maduras, é justamente o que se espera de você."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é tailgating (a \"carona\") no contexto da engenharia social?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Entrar numa área restrita seguindo de perto alguém autorizado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Enviar um grande volume de e-mails falsos para muitas pessoas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Espiar a senha alheia digitada por cima do ombro da pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar um pen drive infectado à vista para que alguém o pegue.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pen drive com a etiqueta \"Salários 2024\" aparece \"esquecido\" no estacionamento da empresa, esperando que alguém o conecte por curiosidade. Que técnica de engenharia social é essa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Baiting: uma isca tentadora é deixada para a vítima morder.",
                                "isCorrect": true
                            },
                            {
                                "text": "Shoulder surfing: espiar a senha por cima do ombro da vítima.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tailgating: entrar num local restrito seguindo alguém de perto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vishing: golpe de engenharia social aplicado por telefone.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Alguém liga se dizendo do suporte técnico, oferece resolver uma \"lentidão\" no seu computador e, para isso, pede que você desative o antivírus e instale um programa de acesso remoto. Que técnica é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quid pro quo: oferece ajuda em troca de uma ação que abre a porta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dumpster diving: vasculhar o lixo em busca de documentos descartados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Whaling: um spear phishing direcionado a um alto executivo da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Shoulder surfing: espiar a senha alheia por cima do ombro da vítima.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa recebe uma ligação: \"Sou o João, novo funcionário do RH. Estou montando a folha e preciso confirmar seu CPF e sua data de admissão.\" Qual é a base do golpe e a atitude correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É pretexting: um personagem inventado; o certo é confirmar pelo canal oficial.",
                                "isCorrect": true
                            },
                            {
                                "text": "É baiting, então basta não pegar o objeto físico que ele oferecer.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há problema algum: por ser do RH, basta fornecer os dados que ele pediu.",
                                "isCorrect": false
                            },
                            {
                                "text": "É smishing, então basta não clicar em nenhum link que ele venha a enviar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa empresa, uma pessoa de mãos cheias de caixas pede, com um sorriso, que você segure a porta da catraca \"só dessa vez, esqueci meu crachá\". Ela parece inofensiva e você não quer ser rude. Por que ceder é um risco de segurança, e o que explica a eficácia dessa técnica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "É tailgating: o golpista usa a gentileza da vítima para burlar o controle de acesso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não há risco algum: quem está de mãos cheias é sempre um funcionário de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco só existiria se a pessoa estivesse carregando um pen drive infectado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Segurar a porta para qualquer pessoa é sempre a atitude mais segura e educada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Reconhecer o golpe, se defender e criar cultura",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Reconhecer o golpe, se defender e criar cultura\n\nVocê já conhece os gatilhos, o phishing e suas variantes, e as técnicas presenciais. Falta a parte mais importante: o que fazer com tudo isso no dia a dia. Esta aula fecha o módulo com o lado prático: como **reconhecer** um golpe em segundos, como **reagir** sem cair e por que a defesa contra a engenharia social é, no fim das contas, um esforço **coletivo**.\n\nA boa notícia é que quase todos os golpes que você viu deixam os mesmos rastros. Uma vez que você aprende a farejar esses sinais, a maioria das tentativas passa a saltar aos olhos."
                    },
                    {
                        "type": "text",
                        "value": "## Os sinais de alerta (red flags)\n\nMensagens e ligações fraudulentas quase sempre trazem uma combinação destes sinais. Sozinho, um deles pode ser inocente; juntos, acendem a luz vermelha:\n\n- **Urgência e pressão**: um prazo curtíssimo, ameaças de bloqueio, perda ou punição, para você agir sem pensar.\n- **Pedido de informação secreta**: senha, PIN, número do cartão ou o código de verificação. Instituições sérias **não** pedem isso.\n- **Remetente estranho**: um domínio de e-mail esquisito, um número desconhecido, erros de português, um logo tortinho.\n- **Saudação genérica**: \"Prezado cliente\" em vez do seu nome, num serviço que sabe muito bem quem você é.\n- **Link ou anexo inesperado**: um endereço que não bate com o site oficial, um arquivo que você não estava esperando.\n- **Pedido de sigilo ou para sair do canal oficial**: \"não conte a ninguém\", \"me responde no particular\", \"resolve isso por fora do sistema\".\n- **Bom demais para ser verdade**: um prêmio que você não disputou, uma restituição inesperada, um desconto absurdo."
                    },
                    {
                        "type": "quote",
                        "value": "Guarde este princípio acima de qualquer checklist: **o golpe depende da sua pressa**. Ele foi desenhado para te fazer agir antes de pensar. Portanto, a defesa mais poderosa contra a engenharia social é também a mais simples: **desacelerar**. Parar, respirar e verificar quase sempre desmonta o golpe."
                    },
                    {
                        "type": "text",
                        "value": "## Como reagir sem cair\n\nQuando algo apertar um dos seus gatilhos, coloque em prática alguns hábitos simples. Eles custam poucos segundos e evitam a imensa maioria dos golpes:\n\n- **Desacelere.** Nenhum pedido legítimo depende de você agir em pânico nos próximos trinta segundos. A pressa é do golpista, não sua.\n- **Verifique por um canal independente.** Ligou o \"banco\"? Desligue e ligue para o número oficial. \"Seu chefe\" mandou um pedido estranho? Fale com ele pessoalmente ou por um canal que você já usa. Nunca use o contato que veio na mensagem suspeita.\n- **Não clique, digite.** Em vez de clicar no link da mensagem, abra o aplicativo ou digite o endereço do site você mesmo.\n- **Nunca entregue senhas nem códigos.** Em especial o código de verificação (a senha de uso único que chega no seu celular). Ele existe justamente para provar que é você; entregá-lo é abrir mão dessa prova.\n- **Ative a autenticação em duas etapas.** Como você verá no módulo sobre identidade, o MFA faz com que uma senha roubada, sozinha, não baste para o golpista entrar.\n- **Na dúvida, reporte.** É melhor reportar um alarme falso do que ignorar um golpe de verdade."
                    },
                    {
                        "type": "text",
                        "value": "## Segurança é um esporte coletivo\n\nAté aqui falamos de você, no singular. Mas contra a engenharia social nenhuma pessoa se defende sozinha, e é aí que entra a **cultura de segurança** de uma organização.\n\nEmpresas maduras tratam a conscientização como um processo **contínuo**, não uma palestra por ano que todos esquecem na semana seguinte. Isso inclui treinamentos regulares e até **simulações de phishing**, em que a própria empresa dispara e-mails falsos (inofensivos) para medir e treinar a atenção do time. O objetivo dessas simulações **não é punir** quem clica, e sim ensinar e descobrir onde reforçar.\n\nEsse ponto é decisivo: a cultura precisa ser **sem culpa** (_blameless_). Se as pessoas têm medo de serem humilhadas ou punidas por caírem num golpe, elas vão **esconder** o erro, e um incidente escondido é muito mais perigoso do que um reportado na hora. Quanto mais rápido alguém avisa \"acho que cliquei em algo errado\", mais rápido a equipe de segurança contém o estrago.\n\nQuando todo mundo entende que **segurança é responsabilidade de todos** (e não só do time de TI), cada funcionário treinado vira um sensor a mais. É o que se chama de **firewall humano**: uma camada de defesa feita de pessoas atentas, que muitas vezes percebe o que nenhuma ferramenta automática pegou."
                    },
                    {
                        "type": "quote",
                        "value": "O objetivo de aprender tudo isso não é te deixar paranoico, achando que cada e-mail é um ataque. É te deixar **atento**: capaz de sentir quando um gatilho está sendo apertado, de desacelerar no momento certo e de verificar antes de agir. Um usuário consciente é, de longe, a defesa mais eficaz que qualquer organização pode ter."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual destes é o sinal mais forte de que uma mensagem é um golpe?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ela pede a sua senha ou o código de verificação recebido por SMS.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ela chama você pelo seu nome completo, de forma correta e pessoal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela não impõe qualquer prazo, deixando você responder com calma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela foi enviada dentro do horário comercial de um dia útil comum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Segundo a aula, qual é a defesa mais simples e poderosa contra a engenharia social?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Desacelerar: parar, pensar e verificar com calma antes de agir.",
                                "isCorrect": true
                            },
                            {
                                "text": "Responder à mensagem recebida o mais rápido possível, sem demora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar vários programas antivírus diferentes ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Parar de usar e-mail e telefone completamente, para sempre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você recebe um e-mail do \"seu chefe\" pedindo, com urgência, que você compre cartões-presente e envie os códigos. Qual é a forma correta de verificar se o pedido é real?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falar com o chefe por um canal já conhecido, nunca pelo e-mail suspeito.",
                                "isCorrect": true
                            },
                            {
                                "text": "Responder ao e-mail recebido, perguntando se é mesmo ele quem escreveu aquilo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprar os cartões-presente imediatamente, já que foi o chefe quem pediu.",
                                "isCorrect": false
                            },
                            {
                                "text": "Encaminhar o e-mail para os colegas, pedindo a opinião deles sobre o pedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um funcionário percebe, minutos depois, que clicou num link de phishing e digitou a senha. Numa empresa com boa cultura de segurança, o que se espera que ele faça, e por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reportar de imediato à equipe de segurança, para conter o estrago.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não contar a ninguém sobre o ocorrido, para não se meter em encrenca.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apagar o e-mail recebido e fingir que absolutamente nada aconteceu.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esperar alguns dias para ver se algo dá errado antes de avisar alguém.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa passou a enviar, sem aviso, e-mails de phishing falsos (e inofensivos) para os próprios funcionários e a oferecer treinamento a quem clica, sem puni-los. Qual é o objetivo dessa prática e por que a ausência de punição é importante?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Simulações para treinar a atenção do time; sem punição, as pessoas reportam em vez de esconder.",
                                "isCorrect": true
                            },
                            {
                                "text": "O objetivo real é demitir quem clica, sendo a falta de punição apenas uma formalidade legal.",
                                "isCorrect": false
                            },
                            {
                                "text": "É uma forma disfarçada de invadir os computadores dos funcionários para testar o antivírus.",
                                "isCorrect": false
                            },
                            {
                                "text": "Serve apenas para provar que treinamento não funciona, já que sempre alguém acaba clicando.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Princípios e controles de defesa",
        "aulas": [
            {
                "titulo": "Defesa em profundidade: o castelo de muralhas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Defesa em profundidade: várias camadas de proteção\n\nNos módulos anteriores você conheceu o lado sombrio: os tipos de malware, os golpes de engenharia social, os ataques de rede. Agora a gente vira a chave e começa a olhar para o outro lado do tabuleiro — o da **defesa**. E o primeiro grande princípio que todo defensor aprende tem um nome que parece complicado, mas a ideia é simples: **defesa em profundidade** (em inglês, _defense in depth_).\n\nA ideia central é esta: **nunca dependa de uma única proteção**. Em vez de apostar todas as fichas em uma parede altíssima, você coloca **várias camadas** de defesa, uma atrás da outra. Se o atacante furar a primeira, ainda encontra a segunda; se furar a segunda, encontra a terceira. Cada camada existe porque a gente **assume que qualquer uma delas pode falhar**."
                    },
                    {
                        "type": "text",
                        "value": "## A analogia do castelo\n\nA melhor forma de sentir esse princípio é imaginar um **castelo medieval**. Quem projetava um castelo não confiava em uma muralha só. Pense em tudo que um invasor precisava vencer, em ordem:\n\n- O **fosso** cheio de água em volta de tudo.\n- A **muralha externa**, alta e grossa.\n- O **portão** com ponte levadiça, que sobe e some.\n- Os **arqueiros** nas torres, vigiando.\n- A **muralha interna**, mais um anel de pedra.\n- E, bem no centro, a **torre principal** (a parte mais protegida), onde ficava o que era mais valioso.\n\nRepare: para chegar ao tesouro, o invasor tinha que vencer **todas** essas barreiras, uma depois da outra. Cada camada o atrasava, o cansava e dava aos defensores mais uma chance de **perceber** o ataque e reagir. Nenhuma daquelas defesas, sozinha, protegia o castelo — mas o **conjunto** delas, sim."
                    },
                    {
                        "type": "text",
                        "value": "## Por que uma camada só nunca basta\n\nNa segurança da informação a lógica é idêntica. Todo controle de segurança pode falhar: um firewall pode ser mal configurado, uma pessoa pode clicar num phishing, uma atualização pode estar atrasada, uma senha pode vazar. Se você apostou tudo em **uma** proteção e ela falha, acabou o jogo — o atacante tem via livre.\n\nCom **camadas**, a falha de uma é amparada pela seguinte. O e-mail malicioso passou pelo filtro? O antivírus ainda pode barrar o anexo. O antivírus não pegou? A conta da vítima tem privilégios limitados, então o estrago é pequeno. O atacante conseguiu roubar os dados? Eles estão cifrados e viram um monte de caracteres sem sentido. Nenhuma camada é perfeita, e é justamente por isso que existem várias."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"No castelo\",\"Na segurança da informação\"],[\"Perímetro\",\"Fosso e muralha externa\",\"Firewall, filtro de e-mail\"],[\"Rede\",\"Portões internos\",\"Segmentação de rede, detecção de intrusão\"],[\"Máquina (host)\",\"Porta de cada cômodo\",\"Antivírus, hardening, atualizações\"],[\"Aplicação\",\"Cofre trancado\",\"Autenticação, validação de entrada\"],[\"Dados\",\"O tesouro em si\",\"Criptografia, backup\"],[\"Pessoas\",\"Guardas treinados\",\"Treinamento antiphishing, políticas\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O perigo do ponto único de falha\n\nQuando toda a segurança depende de **uma coisa só**, essa coisa vira o que chamamos de **ponto único de falha** (_single point of failure_): basta ela quebrar para tudo ruir.\n\nImagine uma empresa que confiava exclusivamente no antivírus de cada computador. Um belo dia surge um malware novo, que o antivírus ainda não reconhece. Como **não havia mais nenhuma camada** — a rede não era segmentada, as contas eram todas de administrador, nada era monitorado —, o malware entrou por um clique e se espalhou livremente por toda a empresa. Uma única falha derrubou tudo.\n\nAgora inverta a cena: com defesa em profundidade, aquele mesmo malware teria esbarrado na segmentação da rede, teria encontrado contas sem privilégio, teria sido notado pelo monitoramento. Provavelmente ficaria preso num cantinho, causando um susto em vez de um desastre."
                    },
                    {
                        "type": "quote",
                        "value": "**Defesa em profundidade** significa empilhar **várias camadas independentes** de proteção, partindo do princípio de que **qualquer uma delas pode falhar**. Nenhuma camada sozinha protege tudo; a segurança nasce do conjunto. Fuja do **ponto único de falha** — aquela proteção que, se cair, derruba tudo com ela."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o princípio de \"defesa em profundidade\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Combinar várias camadas de proteção independentes, pois qualquer uma pode falhar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escolher uma única proteção muito forte e investir todos os recursos apenas nela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter o funcionamento do sistema em segredo para que ninguém o conheça.",
                                "isCorrect": false
                            },
                            {
                                "text": "Programar backups completos dos dados uma vez por ano, sem outras medidas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na analogia do castelo, o que representam o fosso, a muralha, o portão e as torres, todos juntos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "As várias camadas de defesa que o invasor precisa vencer, uma depois da outra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas uma decoração do castelo, sem nenhuma função de proteção real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma única barreira que, sozinha, já garante a proteção completa do castelo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tesouro guardado no centro do castelo, que está sendo protegido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa protegia sua rede apenas com um firewall. Um funcionário clicou num link de phishing e o atacante entrou \"por dentro\", sem passar pelo firewall, e não encontrou mais nenhum obstáculo. Que erro de estratégia essa empresa cometeu?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Depender de uma única camada de proteção, sem nenhuma camada por trás.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ter usado um firewall, uma ferramenta que não gera proteção nenhuma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter oferecido treinamento excessivo contra phishing aos funcionários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter cifrado todos os dados sensíveis armazenados pela empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que é um \"ponto único de falha\" (single point of failure) em segurança?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um elemento do qual tudo depende, cuja falha sozinha derruba a proteção.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro que, por definição, só pode acontecer uma única vez no sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "O primeiro alarme disparado no exato momento em que um ataque começa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma senha criada para ser digitada apenas uma vez e depois descartada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois times propõem estratégias. O time A instala três antivírus diferentes na mesma máquina e para por aí. O time B usa filtro de e-mail, dá privilégio mínimo às contas, cifra os dados e treina as pessoas contra phishing. Qual estratégia representa melhor a defesa em profundidade e por quê?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O time B, por combinar camadas de tipos diferentes: rede, contas, dados e pessoas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O time A, porque três antivírus iguais já cobrem qualquer tipo de ameaça.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois, porque usar mais de uma ferramenta já basta para ser em profundidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum, porque defesa em profundidade exclui qualquer uso de antivírus.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Princípios que guiam a defesa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Princípios que guiam a defesa\n\nEmpilhar camadas (a defesa em profundidade da aula anterior) é o **como**. Mas existem alguns **princípios** que orientam as decisões de quem defende — regras de bolso que aparecem o tempo todo na área e que ajudam a projetar cada camada com bom senso. Nesta aula vamos ver cinco deles:\n\n- **Menor privilégio**\n- **Zero Trust** (confiança zero)\n- **Segregação de funções**\n- **Fail-safe defaults** (negar por padrão)\n- E por que **\"segurança por obscuridade\" não basta**\n\nNão precisa decorar os nomes agora. O importante é entender a ideia de cada um, porque eles voltam a aparecer em praticamente todo assunto de segurança."
                    },
                    {
                        "type": "text",
                        "value": "## Menor privilégio (least privilege)\n\nO princípio do **menor privilégio** diz que cada pessoa, sistema ou programa deve ter **apenas os acessos de que precisa para fazer o seu trabalho — nada além disso**.\n\nPense num hotel. A camareira recebe uma chave que abre os quartos que ela limpa. Ela **não** recebe a chave do cofre da recepção, nem a do escritório do gerente, nem a da sala de segurança. Por quê? Porque ela não precisa. E se aquela chave for perdida ou copiada, o estrago fica **limitado** aos quartos, não ao hotel inteiro.\n\nNa prática, isso significa que um estagiário do marketing não deveria ter acesso ao banco de dados da folha de pagamento; que um programa que só precisa ler um arquivo não deveria poder apagá-lo. O benefício é enorme: se aquela conta ou programa for comprometido, o atacante herda **pouco** poder. A gente costuma dizer que o menor privilégio **reduz o raio da explosão** — o tamanho do estrago quando algo dá errado."
                    },
                    {
                        "type": "text",
                        "value": "## Zero Trust: nunca confie, sempre verifique\n\nO modelo antigo de rede funcionava como o castelo: havia um \"lado de fora\" perigoso e um \"lado de dentro\" confiável. Uma vez que você passava do portão (entrava na rede da empresa), era tratado como amigo e podia circular à vontade. O problema? Se um atacante conseguisse **entrar**, ele passava a andar livremente, porque já estava \"do lado de dentro\". E funcionários mal-intencionados já estavam dentro desde o começo.\n\nO **Zero Trust** (confiança zero) joga essa ideia fora. O lema é: **\"nunca confie, sempre verifique\"**. Não existe mais um \"dentro confiável\": **toda** solicitação é checada — quem é você, de que dispositivo, para acessar o quê — mesmo que venha de dentro da rede. Você assume que o ambiente **já pode estar comprometido** e, por isso, verifica sempre, a cada acesso, em vez de confiar de uma vez por todas."
                    },
                    {
                        "type": "text",
                        "value": "## Segregação de funções (separation of duties)\n\nA **segregação de funções** diz que **nenhuma pessoa sozinha deve controlar um processo crítico do começo ao fim**. Você divide o processo em partes e coloca pessoas diferentes em cada parte, de modo que uma vigie a outra.\n\nO exemplo clássico é o do dinheiro: **quem solicita** uma compra não deveria ser a mesma pessoa que **aprova** o pagamento. Se fosse a mesma pessoa, ela poderia aprovar pagamentos falsos para si mesma sem que ninguém percebesse. É a mesma lógica do lançamento de mísseis nos filmes, em que **duas chaves** giradas por duas pessoas diferentes são necessárias.\n\nNa tecnologia, vale igual: o desenvolvedor que **escreve** o código idealmente não é o único que **aprova e publica** aquele código em produção. Segregar funções previne tanto **fraude** (é preciso mais de uma pessoa combinada para fazer estrago) quanto **erro** (uma segunda pessoa confere e pega o engano)."
                    },
                    {
                        "type": "text",
                        "value": "## Fail-safe defaults e a obscuridade que não protege\n\nMais dois princípios curtos, mas poderosos.\n\n**Fail-safe defaults (negar por padrão):** na dúvida, o sistema deve **negar** o acesso, não liberar. O padrão de fábrica de qualquer permissão deveria ser \"fechado\", e o acesso só é concedido quando alguém decide conceder, de forma explícita. É como uma porta que **tranca sozinha** quando falta energia, em vez de destrancar. Assim, quando algo dá errado ou é esquecido, o sistema erra para o lado **seguro** — bloqueando — e não para o lado perigoso.\n\n**\"Segurança por obscuridade\" não basta:** existe a tentação de achar que um sistema está seguro só porque **ninguém sabe como ele funciona**. Isso é chamado de **segurança por obscuridade**, e o problema é que esconder **não é o mesmo que trancar**. Se a sua única proteção é o segredo do funcionamento, no dia em que esse segredo vazar (e segredos vazam) você fica totalmente exposto. A regra de ouro da área diz que um sistema deve continuar seguro **mesmo que o atacante saiba exatamente como ele funciona** — o que precisa ficar secreto é a **chave**, não o **projeto**. Esconder detalhes pode ser uma casca extra, mas nunca pode ser a **única** defesa."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\",\"Ideia em uma frase\",\"Exemplo prático\"],[\"Menor privilégio\",\"Só o acesso necessário, nada além\",\"Estagiário não acessa a folha de pagamento\"],[\"Zero Trust\",\"Nunca confie, sempre verifique\",\"Checar cada acesso, mesmo vindo de dentro\"],[\"Segregação de funções\",\"Ninguém controla um processo inteiro sozinho\",\"Quem pede a compra não aprova o pagamento\"],[\"Fail-safe defaults\",\"Na dúvida, negue\",\"Permissão nasce \\\"fechada\\\" e é liberada caso a caso\"],[\"Obscuridade não basta\",\"Esconder não é trancar\",\"O segredo é a chave, não o funcionamento\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diz o princípio do menor privilégio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada pessoa ou sistema deve receber somente o acesso necessário ao seu trabalho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Todos os funcionários devem ter acesso irrestrito de administrador o tempo todo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os acessos devem ser sorteados aleatoriamente entre os funcionários da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o dono da empresa pode ter qualquer tipo de acesso aos sistemas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual frase resume o modelo de segurança conhecido como Zero Trust?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "\"Nunca confie, sempre verifique.\"",
                                "isCorrect": true
                            },
                            {
                                "text": "\"Quem entrou uma vez, é confiável para sempre.\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Confie em todos e não verifique nada.\"",
                                "isCorrect": false
                            },
                            {
                                "text": "\"Basta uma senha forte, o resto não importa.\"",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um novo estagiário do time de marketing precisava apenas editar textos do site, mas recebeu, por descuido, acesso de administrador a TODOS os sistemas da empresa, incluindo o financeiro. Que princípio foi desrespeitado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O menor privilégio, pois o acesso concedido foi muito maior do que o necessário.",
                                "isCorrect": true
                            },
                            {
                                "text": "A defesa em profundidade, pois faltou uma segunda camada de proteção depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "O fail-safe default, pois o sistema negou esse acesso automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A segurança por obscuridade, pois esse acesso ficou escondido dos outros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa empresa, a mesma funcionária cadastra os fornecedores, cria as ordens de pagamento e também as aprova, sozinha, do início ao fim. Um auditor apontou isso como um risco. Qual princípio corrigiria a situação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A segregação de funções, pois pessoas diferentes deveriam cuidar de cada etapa.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Zero Trust, pois ela mesma deveria verificar sua identidade antes de aprovar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O menor privilégio, pois ela deveria ter acesso total ao sistema financeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A obscuridade, pois o processo de pagamento deveria ficar escondido dos outros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O responsável por um sistema afirma: \"Ele é seguro porque criei um jeito de funcionar que ninguém conhece; enquanto ninguém descobrir como funciona, estamos protegidos.\" Por que essa é uma base frágil de segurança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque esconder o funcionamento não é o mesmo que protegê-lo, e o segredo pode vazar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque manter o funcionamento em sigilo seria proibido pelas leis da maioria dos países.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a obscuridade sozinha já é a defesa mais forte que qualquer sistema pode ter.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque um sistema que ninguém entende simplesmente para de funcionar sozinho.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Tipos de controle: as duas formas de classificar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Tipos de controle de segurança\n\nQuando a gente coloca em prática os princípios e as camadas das aulas anteriores, o que a gente está montando são **controles de segurança**. Um **controle** nada mais é do que **qualquer medida que reduz um risco**: uma tranca, uma senha, uma câmera, um treinamento, uma cópia de segurança — tudo isso é controle.\n\nComo existem muitos controles, é útil **classificá-los** para não esquecer nenhum tipo. E há duas formas principais de fazer isso, que respondem a perguntas diferentes sobre o **mesmo** controle:\n\n- **Por função:** o que o controle faz no tempo? Ele age **antes**, **durante** ou **depois** do incidente?\n- **Por natureza:** de que o controle é feito? Ele é **físico**, **técnico** ou **administrativo**?\n\nO segredo é entender que um mesmo controle recebe **as duas etiquetas ao mesmo tempo**."
                    },
                    {
                        "type": "text",
                        "value": "## Por função: o que o controle faz no tempo\n\nPense na segurança da sua casa e você já entende todos os tipos:\n\n- **Preventivo** — impede o incidente de acontecer. É a **fechadura** da porta, que barra o ladrão antes de ele entrar. Em TI: firewall, autenticação em duas etapas, criptografia, hardening.\n- **Detectivo** — percebe que algo aconteceu (ou está acontecendo) e **avisa**. É o **alarme** e a **câmera**, que não impedem o ladrão, mas denunciam a presença dele. Em TI: sistemas de detecção de intrusão, registros (logs), um antivírus que dispara um alerta.\n- **Corretivo** — entra em ação **depois** do incidente para **reparar e restaurar**. É trocar a fechadura arrombada e acionar o seguro. Em TI: restaurar um backup depois de um ransomware, isolar a máquina infectada, aplicar a correção que fecha a brecha.\n\nAinda há dois tipos que valem menção:\n\n- **Dissuasivo** — não impede nem detecta, apenas **desencoraja** o atacante a tentar. É a plaquinha \"cão bravo\" e a câmera bem visível na entrada.\n- **Compensatório** — é uma medida **alternativa**, usada quando o controle ideal não é possível no momento. Se não dá para instalar um alarme agora, você põe **grades** na janela para compensar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\",\"O que faz\",\"Quando age\",\"Exemplo em TI\"],[\"Preventivo\",\"Impede o incidente\",\"Antes\",\"Firewall, MFA, criptografia, hardening\"],[\"Detectivo\",\"Percebe e avisa\",\"Durante ou depois\",\"Detecção de intrusão, logs, alerta de antivírus\"],[\"Corretivo\",\"Repara e restaura\",\"Depois\",\"Restaurar backup, isolar máquina, aplicar correção\"],[\"Dissuasivo\",\"Desencoraja a tentativa\",\"Antes\",\"Aviso de monitoramento, câmera visível\"],[\"Compensatório\",\"Substitui um controle inviável\",\"Enquanto o ideal não é possível\",\"Monitoramento reforçado num sistema antigo que não pode ser trocado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por natureza: de que o controle é feito\n\nA segunda etiqueta olha para o **material** do controle:\n\n- **Físico** — coisas do mundo real, que você toca: cadeado, catraca, porta blindada, sala-cofre, câmera, guarda, gerador de energia.\n- **Técnico (ou lógico)** — feito de tecnologia e software: firewall, antivírus, senha, autenticação em duas etapas, criptografia, permissões de acesso.\n- **Administrativo** — feito de **regras e pessoas**: políticas, normas, procedimentos, treinamentos, contratos e termos de confidencialidade. Também são chamados de controles **gerenciais**.\n\nAgora junte as duas classificações e caia a ficha: um mesmo controle tem **as duas etiquetas**. Uma **câmera bem visível** é **física** (por natureza) e, ao mesmo tempo, **dissuasiva e detectiva** (por função). A autenticação em duas etapas é **técnica** e **preventiva**. Um **treinamento antiphishing** é **administrativo** e **preventivo**. Enxergar esses dois eixos ajuda a achar **buracos**: se você só tem controles preventivos e nenhum detectivo, não vai perceber quando algo passar; se só tem controles técnicos e nenhum administrativo, as pessoas continuam sendo a porta aberta. Um bom programa de segurança **mistura as três naturezas e cobre todas as funções**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Natureza\",\"De que é feito\",\"Exemplos\"],[\"Físico\",\"Barreiras do mundo real\",\"Cadeado, catraca, biometria na porta, câmera, gerador\"],[\"Técnico (lógico)\",\"Tecnologia e software\",\"Firewall, antivírus, MFA, criptografia, permissões\"],[\"Administrativo\",\"Regras e pessoas\",\"Política de senha, treinamento, procedimento de backup, termo de sigilo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um **controle** é qualquer medida que reduz risco, e ele carrega **duas etiquetas ao mesmo tempo**: a **função** (preventivo, detectivo, corretivo — e ainda dissuasivo e compensatório) diz **quando** ele age; a **natureza** (físico, técnico, administrativo) diz **de que** ele é feito. Um bom programa cobre todas as funções e mistura as três naturezas — assim nenhum tipo de brecha fica descoberto."
                    }
                ],
                "questions": [
                    {
                        "statement": "Em segurança da informação, o que é um \"controle\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Qualquer medida que ajuda a reduzir um risco, como uma senha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas o painel usado para administrar um servidor da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Somente equipamentos físicos, como cadeados, grades e câmeras.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um relatório com a lista de todos os funcionários da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma fechadura na porta e um firewall que barra conexões indesejadas são exemplos de controle de qual função?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Preventivo, porque atuam antes, tentando impedir o incidente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Corretivo, porque atuam depois, consertando o que já foi danificado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Detectivo, porque apenas avisam depois que o incidente já aconteceu.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dissuasivo, porque apenas desencorajam o ataque, sem impedir nada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa foi atingida por um ransomware que cifrou seus arquivos. A equipe conseguiu voltar a operar restaurando os dados a partir de um backup feito na véspera. A restauração do backup é um exemplo de controle de que função?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Corretivo, porque atua depois do incidente, reparando o sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Preventivo, porque impediu que o ataque de ransomware acontecesse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dissuasivo, porque serviu apenas para assustar o autor do ataque.",
                                "isCorrect": false
                            },
                            {
                                "text": "Detectivo, porque serviu para descobrir a identidade do atacante.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Classifique estes três controles quanto à sua NATUREZA: (1) uma catraca com biometria na entrada do prédio; (2) a criptografia do banco de dados; (3) o treinamento anual dos funcionários sobre phishing.",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "(1) físico, (2) técnico, (3) administrativo.",
                                "isCorrect": true
                            },
                            {
                                "text": "(1) administrativo, (2) físico, (3) técnico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os três são controles técnicos, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "(1) técnico, (2) administrativo, (3) físico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema antigo e crítico não pode ser atualizado nem substituído neste momento, pois quebraria a operação. Sem poder aplicar a correção ideal, a equipe decide cercá-lo de monitoramento intenso e isolá-lo numa rede à parte, reduzindo o risco enquanto uma solução definitiva não chega. Que tipo de controle, por função, foi adotado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Compensatório, pois substitui o controle ideal por uma medida alternativa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Preventivo, pois a falha do sistema antigo foi completamente eliminada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Corretivo, pois o sistema antigo já foi consertado e devolvido ao normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dissuasivo, pois a meta ali era apenas assustar possíveis atacantes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Hardening: reduzindo a superfície de ataque",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Hardening: reduzindo a superfície de ataque\n\nAntes de falar de **hardening**, precisamos de uma ideia irmã: a **superfície de ataque**. Ela é a **soma de todos os pontos por onde um atacante poderia tentar entrar** num sistema — cada porta de rede aberta, cada serviço rodando, cada conta de usuário, cada programa instalado, cada funcionalidade ligada. Quanto **mais** desses pontos existem, **maior** é a superfície de ataque e mais lugares o atacante tem para cutucar.\n\n**Hardening** (a palavra significa \"endurecimento\") é o trabalho de **encolher** essa superfície: desligar, remover, fechar e restringir tudo aquilo que **não** é necessário. A analogia é direta: uma casa com dez portas e vinte janelas destrancadas é muito mais difícil de vigiar do que uma casa com **uma** porta bem trancada. Menos aberturas significa menos coisas para o atacante tentar — e, de quebra, menos coisas para você ter que proteger e acompanhar."
                    },
                    {
                        "type": "text",
                        "value": "## O que faz a superfície de ataque crescer\n\nSistemas recém-instalados costumam vir \"abertos\" de fábrica, priorizando a facilidade em vez da segurança. Veja o que tipicamente **infla** a superfície de ataque:\n\n- **Serviços e portas de rede** ligados que ninguém usa.\n- **Programas e recursos** instalados por padrão, mas desnecessários.\n- **Contas padrão** de fábrica e contas antigas de gente que já saiu.\n- **Senhas padrão** que vêm de fábrica (o famoso \"admin / admin\").\n- **Permissões amplas demais**, que ignoram o menor privilégio.\n- **Funcionalidades ligadas** \"por via das dúvidas\", sem ninguém precisar.\n\nCada item desses é, na prática, **mais uma porta** que alguém precisa lembrar de trancar — e uma porta a mais que o atacante pode encontrar aberta."
                    },
                    {
                        "type": "text",
                        "value": "## Na prática: o que se faz no hardening\n\nHardening é uma lista de faxina de segurança. As práticas mais comuns são:\n\n- **Remover ou desabilitar o que não se usa:** serviços, programas e contas desnecessárias.\n- **Fechar as portas de rede** que não precisam estar abertas.\n- **Trocar as senhas padrão** e apagar as contas de fábrica.\n- **Aplicar o menor privilégio** nas permissões (lembra da aula 2?).\n- **Manter tudo atualizado (aplicar patches):** as atualizações fecham buracos de segurança já conhecidos.\n- **Desligar funcionalidades** que não são necessárias para aquele uso.\n- **Configurar com segurança** em vez de simplesmente aceitar o padrão de fábrica.\n\nRepare que várias dessas práticas são só a aplicação concreta dos princípios que você já viu: menor privilégio, negar por padrão, defesa em profundidade."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Sem hardening\",\"Com hardening\"],[\"Serviços\",\"Tudo ligado por padrão\",\"Só o necessário permanece ligado\"],[\"Senha\",\"Senha de fábrica \\\"admin/admin\\\"\",\"Senha forte, longa e única\"],[\"Contas\",\"Conta de teste continua ativa\",\"Conta de teste removida\"],[\"Portas de rede\",\"Várias abertas sem uso\",\"Apenas as portas usadas ficam abertas\"],[\"Atualizações\",\"Correções em atraso\",\"Correções aplicadas em dia\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Você não precisa inventar a lista: baselines e benchmarks\n\nA boa notícia é que existem **guias prontos** de configuração segura, chamados de **baselines** (linhas de base) ou **benchmarks**. Eles descrevem, passo a passo, como endurecer um sistema específico — um sistema operacional, um banco de dados, um navegador. Um dos conjuntos mais conhecidos são os **CIS Benchmarks**, publicados pelo mesmo CIS dos controles de segurança. Fabricantes também publicam seus próprios guias.\n\nDuas ideias para fechar. Primeiro: hardening **não é feito uma vez só**. Toda vez que o sistema muda — um programa novo, uma configuração alterada — a superfície de ataque pode crescer de novo, então o endurecimento é parte da **manutenção** contínua. Segundo: reduzir a superfície de ataque **também dá menos trabalho depois** — quanto menos serviços e programas rodando, menos coisas para você atualizar, monitorar e se preocupar. Segurança e simplicidade, aqui, andam de mãos dadas."
                    },
                    {
                        "type": "quote",
                        "value": "**Superfície de ataque** é a soma de todos os pontos por onde alguém poderia tentar invadir. **Hardening** é encolher essa superfície: **desligar, remover, fechar e restringir** tudo o que não é necessário — serviços, portas, contas e senhas padrão. Menos portas abertas significam menos chances para o atacante e menos coisas para você proteger."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é a \"superfície de ataque\" de um sistema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A soma de todos os pontos por onde alguém pode tentar invadir o sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tela de login onde o atacante digita a senha para tentar entrar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade total de ataques que aquele sistema já sofreu até hoje.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho do monitor usado pela equipe de segurança da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o objetivo do hardening (endurecimento) de um sistema?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Reduzir a superfície de ataque, desligando tudo o que não é necessário.",
                                "isCorrect": true
                            },
                            {
                                "text": "Instalar o máximo de programas possível, para dar mais opções ao usuário.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar todas as portas de rede abertas, para facilitar as conexões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter as senhas de fábrica, que já vêm seguras por padrão de origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um técnico acabou de ligar um servidor novo, que veio de fábrica com a senha padrão \"admin/admin\", com vários serviços que ninguém vai usar já ativados e com uma conta de teste ainda habilitada. Qual conjunto de ações representa o hardening desse servidor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar a senha padrão, desligar serviços sem uso e remover a conta teste.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter a senha \"admin/admin\" e ativar ainda mais serviços no servidor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir todas as portas de rede disponíveis, sem exceção nenhuma.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dar acesso de administrador a todos os usuários do servidor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Entre as opções abaixo, qual é uma prática de hardening?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Desabilitar serviços e recursos que não são utilizados naquele sistema.",
                                "isCorrect": true
                            },
                            {
                                "text": "Instalar vários programas extras por precaução, mesmo sem necessidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar a mesma conta de administrador para todas as tarefas do dia a dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiar as atualizações de segurança para não incomodar os usuários.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Vários dispositivos conectados à internet foram invadidos em massa e transformados em uma rede de ataque (botnet). A investigação mostrou que eles ainda usavam a senha de fábrica e tinham um serviço de administração remoto, que ninguém usava, exposto na internet. Quais práticas de hardening teriam tornado esse ataque muito mais difícil?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Trocar a senha de fábrica e desligar o serviço remoto sem uso, reduzindo os riscos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter a senha de fábrica, pois trocá-la exigiria treinamento extra dos usuários.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir mais portas de rede, pois isso ajudaria a distribuir o tráfego malicioso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar mais programas nos dispositivos, pois isso disfarçaria o ataque em andamento.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Criptografia como controle: uma primeira olhada",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Criptografia como controle: uma primeira olhada\n\nEntre todos os controles técnicos, um dos mais poderosos é a **criptografia**. Ela é a nossa principal ferramenta para proteger a **confidencialidade** (o sigilo) dos dados e ajuda também na **integridade** (garantir que nada foi alterado). Você já viu esses conceitos lá no início da trilha; agora vamos ver como a criptografia os coloca em prática.\n\nUm aviso importante: esta aula é só uma **primeira olhada**, para você entender o **papel** da criptografia como controle de defesa. Os detalhes mais profundos — os algoritmos, as chaves, a matemática por trás de tudo — ficam para a **trilha dedicada de Criptografia**, que aprofunda o assunto com calma. Aqui, o objetivo é apenas apresentar as ideias essenciais e onde elas entram na defesa."
                    },
                    {
                        "type": "text",
                        "value": "## Cifrar: embaralhar para proteger o sigilo\n\n**Cifrar** (em inglês, _encrypt_) é transformar uma informação legível — o **texto claro** — em algo embaralhado e sem sentido — o **texto cifrado** —, usando um algoritmo e uma **chave**. Só quem tiver a chave certa consegue **decifrar** (reverter) e ler a mensagem de novo.\n\nA analogia é a de uma **mensagem trancada dentro de um cofre**: qualquer um pode carregar o cofre de um lado para o outro, mas só quem tem a **chave** consegue abri-lo e ler o que está lá dentro. É por isso que a criptografia protege o **sigilo**: mesmo que um atacante **roube** os dados cifrados, o que ele tem nas mãos é um amontoado de caracteres inúteis, porque não possui a chave.\n\nO ponto essencial para guardar: cifrar é **reversível** — com a chave correta, você volta ao texto original."
                    },
                    {
                        "type": "text",
                        "value": "## Hash: uma impressão digital que não volta atrás\n\nO **hash** é uma ideia parecida, mas com um propósito diferente. Ele é uma função que pega qualquer dado (uma palavra, um arquivo inteiro) e gera um **resumo de tamanho fixo** — uma espécie de **impressão digital** daquele dado. Duas características o definem:\n\n- **A mesma entrada gera sempre o mesmo resumo**, e **qualquer mudancinha** no dado — uma vírgula, uma letra maiúscula — produz um resumo **completamente diferente**.\n- É de **mão única (irreversível)**: dá para ir do dado para o resumo, mas **não** dá para voltar do resumo para o dado original.\n\nPara que serve? Para dois usos muito comuns. Primeiro, **verificar integridade**: se o resumo de um arquivo mudou, é sinal de que o arquivo foi alterado. Segundo, **guardar senhas**: em vez de guardar a sua senha em texto claro, um site bem-feito guarda o **hash** dela — assim, nem quem administra o site vê a sua senha, e na hora de entrar ele apenas compara os resumos. Note o contraste com o cifrar: **cifrar volta atrás** (com a chave), o **hash não volta**."
                    },
                    {
                        "type": "code",
                        "value": "Exemplo ilustrativo do efeito de um hash:\n\n  \"relatorio.pdf\"       ->  8f3a...c1   (resumo de tamanho fixo)\n  \"relatorio (2).pdf\"    ->  d902...7e   (mudei pouca coisa: resumo totalmente diferente)\n\nComo o resumo mudou, dá para desconfiar que o arquivo nao e o mesmo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Cifrar\",\"Hash\"],[\"Para que serve\",\"Proteger o sigilo (confidencialidade)\",\"Verificar integridade e guardar senhas\"],[\"Volta atrás?\",\"Sim, com a chave certa\",\"Não, é de mão única\"],[\"Usa chave?\",\"Sim\",\"Em geral, não\"],[\"Exemplo de uso\",\"Disco cifrado, mensagem cifrada\",\"Conferir se um arquivo mudou, guardar senha\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Dados em repouso, dados em trânsito e o cadeado do HTTPS\n\nOs dados precisam de proteção em **dois momentos**:\n\n- **Em repouso** (_at rest_): os dados **parados**, guardados em algum lugar — no disco do computador, no banco de dados, no backup, na memória do celular. A proteção é **cifrar** esse armazenamento: se roubarem o aparelho, os dados continuam ilegíveis. É por isso que um notebook com o disco cifrado protege seus arquivos mesmo depois de furtado.\n- **Em trânsito** (_in transit_): os dados **viajando** pela rede — entre o seu navegador e um site, entre dois aplicativos. A proteção é **cifrar a comunicação**, para que ninguém no meio do caminho consiga ler (lembra do ataque **man-in-the-middle**, o \"homem no meio\"?).\n\nO exemplo mais presente na sua vida é o **HTTPS**, o famoso **cadeado** do navegador. O HTTP puro envia tudo em **texto claro**, e alguém no meio da rede poderia interceptar e ler senhas e mensagens. O HTTPS **cifra** a comunicação entre você e o site (o \"S\" é de seguro). Por isso a regra: **nunca** digite senha ou dados de cartão num site sem HTTPS.\n\nMas cuidado com um mal-entendido comum: o cadeado diz que a **conexão** é cifrada, **não** que o site é honesto. Um golpista também pode ter cadeado no site de phishing dele. HTTPS protege o **caminho**, não garante a **índole** de quem está do outro lado.\n\nÉ isto que a criptografia entrega como controle. Os \"comos\" — quais algoritmos, como as chaves são criadas e trocadas, os diferentes tipos de criptografia — são o assunto da **trilha dedicada de Criptografia**. Por aqui, guarde o papel de cada peça."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o principal objetivo de \"cifrar\" (criptografar) uma informação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Proteger o sigilo, tornando o dado ilegível para quem não tem a chave certa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Apagar o dado de forma permanente, para que ninguém consiga usá-lo depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar o dado mais leve, fazendo com que ocupe menos espaço no disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Traduzir automaticamente o dado para outro idioma, sem ajuda humana.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o HTTPS (o cadeado do navegador) faz pelos seus dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cifra a comunicação entre navegador e site, protegendo os dados em trânsito.",
                                "isCorrect": true
                            },
                            {
                                "text": "Faz o site carregar mais rápido, sem nenhuma relação com segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que o dono do site é uma pessoa honesta e completamente confiável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faz backup automático de tudo o que você digita durante a navegação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao baixar um programa, o site exibe ao lado do link um \"resumo\" (hash) do arquivo e pede que você o compare com o resumo do arquivo baixado. Para que serve essa comparação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Verificar a integridade do arquivo baixado, comparando os dois resumos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Recuperar a senha cadastrada no site a partir do resumo apresentado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descriptografar o arquivo automaticamente, dispensando qualquer programa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixar o download do arquivo mais rápido do que seria sem o resumo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O notebook de uma funcionária foi furtado. Como o disco estava cifrado, a empresa avaliou que os arquivos guardados nele continuam protegidos, pois o ladrão não tem a chave para lê-los. Que tipo de proteção de dados foi decisivo nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A criptografia dos dados em repouso, os dados parados e guardados no disco.",
                                "isCorrect": true
                            },
                            {
                                "text": "A criptografia dos dados em trânsito, os dados enquanto viajam pela rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um hash gerado a partir da senha de acesso daquela funcionária.",
                                "isCorrect": false
                            },
                            {
                                "text": "A troca da senha de fábrica configurada originalmente no notebook.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa recebe um link, vê o cadeado do HTTPS no navegador e conclui: \"tem cadeado, então este site é confiável e posso informar meus dados sem medo.\" Por que esse raciocínio é perigoso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o cadeado garante só a conexão cifrada, não a honestidade do site.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o cadeado do HTTPS é um sinal de que o site está infectado por malware.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o HTTPS funciona apenas em sites falsos, nunca nos sites verdadeiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque, mesmo com cadeado, os dados trafegam em texto claro e ficam expostos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Identidade, autenticação e controle de acesso",
        "aulas": [
            {
                "titulo": "Identidade: o novo perímetro e o AAA",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Identidade: o novo perímetro\n\nDurante muito tempo, proteger uma empresa foi parecido com proteger um **castelo**. Havia um lado de dentro (a rede da empresa, os computadores do escritório) e um lado de fora (a internet, o mundo). No meio, uma muralha: o **firewall** e outros controles vigiavam quem entrava e saía. A lógica era simples: se você está **dentro** da muralha, é de confiança; se está **fora**, é suspeito.\n\nEsse modelo funcionava quando tudo ficava num lugar só. Mas o mundo mudou. Hoje as pessoas trabalham de **casa**, de um café, do celular no ônibus. Os arquivos e sistemas não vivem mais numa sala trancada da empresa: estão na **nuvem**, acessíveis de qualquer lugar. A muralha do castelo, aos poucos, foi perdendo o sentido — afinal, quando quase todo mundo está do lado de fora, o que exatamente a muralha protege?"
                    },
                    {
                        "type": "quote",
                        "value": "Quando as paredes caem, sobra uma pergunta: **quem é você, e você é mesmo quem diz ser?** É por isso que se diz que a **identidade virou o novo perímetro**. O login deixou de ser um detalhe e passou a ser a porta de entrada de tudo — muitas vezes, a primeira e única linha de defesa."
                    },
                    {
                        "type": "text",
                        "value": "## Do castelo à identidade\n\nSe a muralha não segura mais o inimigo, o que segura? A resposta da cibersegurança moderna é: a **identidade** de cada pessoa e de cada sistema. Em vez de confiar em alguém só porque ele está \"dentro da rede\", passamos a verificar, a cada acesso, **quem** está pedindo entrada e **se** essa pessoa realmente é quem afirma ser.\n\nEsse jeito de pensar tem até um lema famoso, o **Zero Trust** (confiança zero): _nunca confie, sempre verifique_. Não importa de onde o acesso vem; o que importa é provar a identidade e ter permissão. Na prática, isso coloca o **login** no centro de tudo. Se um atacante descobre a sua senha, ele não precisa furar muralha nenhuma: ele simplesmente **entra pela porta da frente, se passando por você**. É por isso que cuidar da identidade ficou tão importante."
                    },
                    {
                        "type": "text",
                        "value": "## AAA: os três As da identidade\n\nToda vez que você acessa um sistema, três coisas acontecem nos bastidores. A cibersegurança resume essas três coisas numa sigla fácil de lembrar: **AAA** — de **Autenticação**, **Autorização** e **Auditoria** (esta última também chamada de _accounting_, ou contabilização).\n\nPense na entrada de um show ou de uma balada:\n\n- **Autenticação** — o segurança confere o seu documento para ter certeza de que você é você. É o \"provar quem você é\".\n- **Autorização** — a sua pulseira diz o que você pode fazer lá dentro. A pulseira VIP libera o camarote; o ingresso comum, não. É o \"o que você pode fazer\".\n- **Auditoria (accounting)** — a lista de presença e as câmeras registram quem entrou, a que horas e por onde andou. É o \"o que aconteceu\", guardado para consultar depois.\n\nEsses três As trabalham sempre juntos: um confirma quem você é, o outro decide o seu acesso, e o terceiro anota tudo para o caso de algo dar errado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O A\",\"A pergunta que ele responde\",\"Exemplo na entrada de um evento\"],[\"Autenticação\",\"Você é mesmo quem diz ser?\",\"O segurança confere o seu documento\"],[\"Autorização\",\"O que você pode fazer aqui dentro?\",\"A pulseira VIP libera áreas que o ingresso comum não acessa\"],[\"Auditoria (accounting)\",\"Quem entrou, quando e o que fez?\",\"A lista de presença e as câmeras registram tudo\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** com o trabalho remoto e a nuvem, a velha muralha da rede perdeu força e a **identidade** virou o novo perímetro — o login é a nova porta de entrada. Para cuidar dessa porta usamos o **AAA**: **Autenticação** (provar quem você é), **Autorização** (definir o que você pode fazer) e **Auditoria/accounting** (registrar o que foi feito). Guardar bem a identidade passou a ser tão importante quanto trancar qualquer porta."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa dizer que \"a identidade virou o novo perímetro\"?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que a rede não garante mais confiança sozinha: o login e a identidade de cada um definem o acesso.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o firewall e as muralhas de rede seguem sendo a única defesa que realmente importa hoje.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que estar fisicamente dentro do prédio da empresa já libera acesso completo a qualquer sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a identidade visual da empresa, como logo e cores, é o que protege os sistemas de invasão.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A sigla AAA, no contexto de identidade, quer dizer:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Antivírus, Antispam e Firewall de borda da rede.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação, Autorização e Auditoria (ou accounting).",
                                "isCorrect": true
                            },
                            {
                                "text": "Acesso, Alerta e Auditoria de eventos do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autenticação, Atualização e Armazenamento dos dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa migrou os sistemas para a nuvem e boa parte da equipe passou a trabalhar de casa. O time de segurança percebeu que só ter um firewall protegendo o escritório não bastava mais. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o firewall é uma tecnologia ultrapassada, que já não funciona em nenhuma situação hoje.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque trabalhar de casa elimina todo risco, tornando qualquer camada extra de proteção inútil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o acesso passa a vir de qualquer lugar, sem muralha única; a identidade é a defesa central.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a nuvem verifica sozinha a identidade de cada pessoa, dispensando login e senha de fato.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num sistema, o registro de que \"o usuário João acessou o relatório financeiro às 14h32\" é um exemplo de qual dos três As?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Autenticação, pois o log mostra a senha que João digitou para provar quem é.",
                                "isCorrect": false
                            },
                            {
                                "text": "Autorização, pois o log mostra a permissão que liberou o relatório para João.",
                                "isCorrect": false
                            },
                            {
                                "text": "Auditoria (accounting): o registro do que foi feito, para consultar depois.",
                                "isCorrect": true
                            },
                            {
                                "text": "Antivírus, pois o log mostra que o arquivo foi varrido antes de ser aberto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa balada, o segurança confere documentos na porta, a pulseira define quem entra no camarote e as câmeras gravam a noite inteira. Se algo some do camarote, qual desses recursos ajuda a descobrir o que aconteceu, e a qual dos As ele corresponde?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As câmeras, que correspondem à Auditoria (accounting): registram tudo para reconstruir o que houve.",
                                "isCorrect": true
                            },
                            {
                                "text": "A conferência de documentos na entrada, que corresponde à Autorização, pois decide quem pode entrar.",
                                "isCorrect": false
                            },
                            {
                                "text": "A pulseira do camarote, que corresponde à Autenticação, pois comprova a identidade de quem entra.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tapume da pista de dança, que corresponde à Auditoria, pois impede a entrada de estranhos.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Autenticação x autorização: a diferença que confunde todo mundo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Autenticação x autorização: a confusão mais comum\n\nExistem duas palavras na cibersegurança que se parecem tanto que quase todo mundo confunde: **autenticação** e **autorização**. Elas andam juntas, começam com \"autor...\", acontecem quase ao mesmo tempo quando você entra num sistema — e, ainda assim, significam coisas **bem diferentes**.\n\nEntender essa diferença é um daqueles conhecimentos que separam quem só \"ouviu falar\" de quem realmente entende de segurança de acesso. A boa notícia: depois desta aula, você não troca mais uma pela outra."
                    },
                    {
                        "type": "text",
                        "value": "## Autenticação: você é quem diz ser?\n\n**Autenticação** (às vezes abreviada como _authN_) é o processo de **provar a sua identidade**. É o momento em que o sistema pergunta \"quem é você?\" e você responde de um jeito que ele consiga conferir.\n\nO exemplo mais comum é o **login**: você digita usuário e senha. O usuário diz quem você afirma ser; a senha é a prova de que é você mesmo. Se a prova bate, você está **autenticado**. Nesta etapa, o sistema ainda nem pensa no que você pode fazer — ele só quer ter certeza de **quem** está batendo à porta."
                    },
                    {
                        "type": "text",
                        "value": "## Autorização: o que você pode fazer?\n\nDepois que o sistema já sabe quem você é, vem a segunda pergunta: \"tudo bem, mas **o que você tem permissão de fazer** aqui?\". Isso é a **autorização** (ou _authZ_).\n\nAutorização é sobre **permissões**. Duas pessoas podem estar perfeitamente autenticadas — as duas provaram quem são — e ainda assim ter acessos totalmente diferentes. O funcionário comum entra no sistema e vê só as suas tarefas; o gerente entra no mesmo sistema e enxerga os salários de todo mundo. Nenhum dos dois errou a identidade; o que muda é **o que cada um está autorizado a ver e fazer**."
                    },
                    {
                        "type": "quote",
                        "value": "**Autenticação** é provar **quem você é**. **Autorização** é decidir **o que você pode fazer**. Primeiro o sistema confirma a identidade, só depois define o acesso — nunca o contrário. Trocar uma pela outra é como confundir mostrar o documento na portaria com receber a chave de uma sala específica."
                    },
                    {
                        "type": "text",
                        "value": "## A ordem importa: a analogia do hotel\n\nImagine que você chega a um **hotel**. Na **recepção**, mostra o documento e a reserva; o recepcionista confirma que você é mesmo o hóspede esperado. Isso é **autenticação** — a prova de quem você é.\n\nEm seguida, você recebe um **cartão-chave**. Esse cartão não abre o hotel inteiro: ele abre **só o seu quarto** e talvez a academia. Não abre o quarto dos outros hóspedes nem a sala dos funcionários. Isso é **autorização** — o que você pode fazer depois de identificado.\n\nRepare que a ordem é sempre essa: **primeiro a recepção, depois o cartão**. Não faz sentido decidir quais portas alguém pode abrir antes de saber quem essa pessoa é. Por isso a **autenticação vem sempre antes** da autorização.\n\nQuem mexe com sistemas web percebe essa diferença até nas mensagens de erro: um problema de **autenticação** costuma dizer \"faça login\" (você ainda não provou quem é), enquanto um de **autorização** diz \"acesso negado\" (você já entrou, mas não pode ir ali)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Autenticação\",\"Autorização\"],[\"Pergunta que responde\",\"Quem é você?\",\"O que você pode fazer?\"],[\"Quando acontece\",\"Primeiro, na porta de entrada\",\"Depois, a cada tentativa de acesso\"],[\"No hotel\",\"A recepção confirma a sua reserva e identidade\",\"O cartão abre só o seu quarto e a academia\"],[\"Quando dá errado\",\"Login inválido: você nem entra\",\"Acesso negado: você entrou, mas não pode ir ali\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "A autenticação responde principalmente a qual pergunta?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Você é realmente a pessoa que diz ser ao entrar no sistema?",
                                "isCorrect": true
                            },
                            {
                                "text": "O que você tem permissão de fazer dentro deste sistema específico?",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas vezes você já entrou neste mesmo sistema hoje?",
                                "isCorrect": false
                            },
                            {
                                "text": "De qual cidade ou país você está tentando acessar agora?",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "E a autorização trata principalmente de quê?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Da prova de que você é você mesmo, feita logo no início do login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Das permissões: o que você pode ver e fazer depois de já identificado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Da velocidade da conexão de internet usada para acessar o sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Da criação e troca periódica da sua senha de acesso ao sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ana faz login no sistema da empresa com usuário e senha, sem problema nenhum. Ao clicar em \"Painel do administrador\", aparece a mensagem \"acesso negado\". O que aconteceu?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A senha de Ana está errada, pois o login não deveria ter funcionado daquele jeito.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ana está autenticada, o login funcionou, mas falta autorização para abrir o painel.",
                                "isCorrect": true
                            },
                            {
                                "text": "O sistema não reconheceu a identidade de Ana, mesmo com usuário e senha corretos digitados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ana precisa criar uma conta nova, pois a antiga não serve mais para nenhum acesso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois funcionários entram no mesmo sistema com suas próprias contas, os dois sem erro nenhum de login. Um consegue ver a folha de pagamento; o outro, não. O que explica essa diferença?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um dos dois não se autenticou de verdade, apesar de o login ter parecido funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O funcionário que vê a folha simplesmente usa uma senha mais longa e forte.",
                                "isCorrect": false
                            },
                            {
                                "text": "A autorização de cada um é diferente: os dois se autenticaram, mas têm permissões distintas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O sistema está com defeito, pois todo autenticado deveria enxergar exatamente as mesmas telas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido a autenticação acontecer antes da autorização, e nunca o contrário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a autorização é só um detalhe opcional, que a maioria dos sistemas nem chega a usar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a autenticação é mais lenta, então roda primeiro só para não atrasar o processo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as permissões já vêm sempre iguais para todo mundo, então a ordem nunca faz diferença.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque só depois de saber quem é a pessoa o sistema consegue consultar quais permissões ela tem.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Fatores de autenticação e o poder da MFA",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Fatores de autenticação: o que prova que é você\n\nNa aula sobre autenticação, o exemplo foi sempre a **senha**. Mas a senha é só **uma** forma de provar quem você é — e, sinceramente, uma forma bem frágil. Ela pode ser descoberta, roubada num vazamento, adivinhada ou copiada sem você perceber.\n\nPor isso a cibersegurança organiza as provas de identidade em três grandes grupos, chamados de **fatores de autenticação**. Cada fator é um tipo diferente de prova: algo que você **sabe**, algo que você **tem** e algo que você **é**."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fator\",\"A ideia em uma frase\",\"Exemplos do dia a dia\"],[\"Algo que você sabe\",\"Uma informação guardada na sua cabeça\",\"Senha, PIN, resposta secreta\"],[\"Algo que você tem\",\"Um objeto que está com você\",\"Celular com app autenticador, token físico, cartão\"],[\"Algo que você é\",\"Uma característica do seu corpo\",\"Impressão digital, rosto, íris, voz\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que um fator só é frágil\n\nQuando a sua conta depende de **um único fator** — quase sempre a senha, um \"algo que você sabe\" — basta esse fator cair para o atacante entrar. E senhas caem o tempo todo: num golpe de **phishing**, você mesmo digita a senha num site falso; num **vazamento**, ela escapa junto com os dados de uma empresa; num ataque de **força bruta**, um programa testa milhares de combinações até acertar.\n\nO problema não é a senha em si, é ela estar **sozinha**. Uma fechadura só, por melhor que seja, ainda é uma fechadura só. Se alguém copia a chave, a porta abre."
                    },
                    {
                        "type": "text",
                        "value": "## MFA: combinando fatores diferentes\n\nA solução é exigir **mais de um fator ao mesmo tempo** — e de **categorias diferentes**. Isso se chama **MFA** (_Multi-Factor Authentication_, autenticação multifator). Quando são exatamente dois, também se diz **2FA** (autenticação de dois fatores).\n\nVocê já usa MFA sem pensar: sacar dinheiro no caixa eletrônico exige o **cartão** (algo que você tem) **mais** a **senha** (algo que você sabe). Um sozinho não serve: cartão sem senha não saca, senha sem cartão também não.\n\nUm detalhe que confunde muita gente: repetir o **mesmo tipo** de prova **não** é MFA. Pedir uma senha e depois uma \"pergunta secreta\" são, os dois, \"algo que você sabe\" — é um fator só, repetido. MFA de verdade mistura categorias: senha (sabe) **mais** código do aplicativo no celular (tem), por exemplo."
                    },
                    {
                        "type": "text",
                        "value": "## Por que a MFA é tão eficaz\n\nA força da MFA está numa ideia simples: o atacante precisa vencer **várias barreiras independentes ao mesmo tempo**. Descobrir a sua senha deixou de ser suficiente — ele ainda precisaria estar com o seu celular na mão, ou com o seu token, ou com o seu dedo. Isso é a **defesa em profundidade** aplicada à identidade: se uma camada falha, a outra ainda segura.\n\nNa prática, ativar a MFA barra a **esmagadora maioria** dos ataques automatizados de sequestro de conta, justamente porque a senha roubada, sozinha, não abre mais a porta.\n\nVale saber que nem toda MFA é igualmente forte. Um código por **SMS** protege muito mais do que só a senha, mas pode ser interceptado ou desviado (o golpe do chip clonado). Um **aplicativo autenticador** é mais seguro, e as **chaves físicas** e **passkeys** são as mais resistentes a phishing. E cuidado com um golpe esperto: se começarem a chegar **notificações de aprovação que você não pediu**, nunca toque em \"aprovar\" só para elas pararem — é assim que atacantes tentam te empurrar a liberar o segundo fator."
                    },
                    {
                        "type": "quote",
                        "value": "**Recapitulando:** existem três **fatores** de autenticação — algo que você **sabe** (senha, PIN), algo que você **tem** (celular, token) e algo que você **é** (biometria). Depender de um só, geralmente a senha, é frágil. A **MFA** exige fatores de **categorias diferentes** ao mesmo tempo, então uma senha vazada não basta para invadir a conta. É por isso que ativar a MFA é uma das atitudes que mais aumentam a sua segurança com o menor esforço."
                    }
                ],
                "questions": [
                    {
                        "statement": "Reconhecer alguém pela impressão digital ou pelo rosto é um exemplo de qual fator de autenticação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Algo que você é, a biometria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Algo que você sabe de cor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo físico que você tem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Algo que você compra pronto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual destas combinações é um exemplo verdadeiro de autenticação multifator (MFA)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma senha mais uma pergunta secreta sobre você.",
                                "isCorrect": false
                            },
                            {
                                "text": "Duas senhas diferentes, digitadas uma depois da outra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma senha somada a um código gerado pelo aplicativo no celular.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um PIN de quatro dígitos seguido de outro PIN de seis dígitos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A senha de Marcos vazou num ataque a um site que ele usava. Mesmo assim, os invasores não conseguiram entrar na conta dele, que estava protegida por MFA com aplicativo autenticador. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque toda senha vazada se apaga automaticamente do sistema depois de algumas horas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque faltava o segundo fator: o código do aplicativo autenticador no celular de Marcos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o MFA troca a senha de Marcos sozinho a cada novo acesso feito ao sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sites que sofrem vazamento bloqueiam todos os logins de todo mundo para sempre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma colega afirma: \"minha conta é bem segura, ela pede a senha e depois o nome do meu primeiro animal de estimação, então é multifator\". Ela está certa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, qualquer verificação feita em duas etapas separadas já conta como MFA de verdade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque a pergunta secreta conta como um \"algo que você tem\" guardado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, senha e pergunta secreta são as duas \"algo que você sabe\", o mesmo fator repetido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque MFA exige sempre exatamente três senhas diferentes cadastradas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "De madrugada, Paula recebe uma enxurrada de notificações no celular pedindo para aprovar um login que ela não tentou fazer. Cansada, ela toca em \"aprovar\" para as notificações pararem. Logo depois, a conta é invadida. O que deu errado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A MFA falhou completamente sozinha, o que prova que esse tipo de proteção não serve para nada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema real foi a senha dela estar forte demais, o que acaba atrapalhando a MFA.",
                                "isCorrect": false
                            },
                            {
                                "text": "As notificações de aprovação de login são sempre seguras, então o erro foi outra coisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela aprovou o login de um estranho; aprovar pedido de MFA que não é seu entrega o acesso a ele.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Higiene de senhas e o futuro sem senha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Higiene de senhas (e para onde vamos depois delas)\n\nMesmo com biometria e aplicativos, a **senha** ainda é a chave que guarda a maior parte da nossa vida digital: e-mail, banco, redes sociais, trabalho. E, como toda chave, ela protege tanto quanto o cuidado que você tem com ela. \"Higiene de senhas\" é justamente o conjunto de bons hábitos que mantêm essa chave difícil de copiar.\n\nNesta aula vamos ver o que faz uma senha ser forte, por que **nunca** reutilizar a mesma senha, como um gerenciador resolve o problema de vez, e para onde o mundo está caminhando: o **futuro sem senha**."
                    },
                    {
                        "type": "text",
                        "value": "## O que faz uma senha forte\n\nA intuição de todo mundo é que senha forte é aquela cheia de símbolos estranhos. Mas a verdade surpreende: o que mais importa é o **tamanho**, não a bagunça. Uma senha curta e cheia de símbolos é difícil para **você** lembrar e relativamente fácil para o **computador** quebrar; uma senha bem longa é o contrário.\n\nPor isso a recomendação moderna é usar uma **frase-senha** (_passphrase_): várias palavras juntas que só fazem sentido para você, formando algo comprido e fácil de lembrar, mas absurdamente demorado de adivinhar. Fuja do óbvio: nada de datas de aniversário, nome do pet, sequências como 123456 ou fileiras do teclado como qwerty."
                    },
                    {
                        "type": "code",
                        "value": "Fraca:  joao1990\nFraca:  P@ss!2\nForte:  cavalo-bateria-grampo-teimoso\nForte:  MinhaTiaFazBoloDeMilhoAosDomingos"
                    },
                    {
                        "type": "text",
                        "value": "## O maior erro: reutilizar a mesma senha\n\nSe existe um hábito para abandonar hoje, é usar a **mesma senha em vários lugares**. O motivo é um ataque muito comum chamado **credential stuffing** (algo como \"enchimento de credenciais\"): quando um site qualquer é invadido e as senhas vazam, os criminosos pegam aquelas combinações de e-mail e senha e as testam **automaticamente** em dezenas de outros serviços — banco, e-mail, redes sociais.\n\nSe você reutiliza a senha, o vazamento de um **site bobo** que você nem lembra mais vira a chave do seu e-mail e da sua conta bancária. Uma senha vazada deveria colocar em risco **uma** conta, não a sua vida inteira. Por isso a regra é simples: **uma senha diferente para cada conta**."
                    },
                    {
                        "type": "text",
                        "value": "## Gerenciadores de senha\n\nAí bate o desespero: \"mas é impossível decorar uma senha longa e diferente para cada um dos meus cinquenta cadastros!\". E está certíssimo — é impossível mesmo. A solução realista é um **gerenciador de senhas**.\n\nUm gerenciador é como um **cofre** superprotegido para as suas senhas. Ele **gera** senhas longas e aleatórias, **guarda** todas de forma criptografada e as **preenche** para você na hora de logar. A única coisa que você precisa lembrar é **uma** senha mestra, forte, que abre o cofre. Assim você resolve os dois problemas de uma vez: cada conta ganha uma senha única e forte, sem você ter que memorizar nenhuma delas."
                    },
                    {
                        "type": "text",
                        "value": "## O futuro sem senha: passkeys e biometria\n\nApesar de tudo, a senha tem um defeito de nascença: ela é um **segredo compartilhado**. Você conhece a senha, o site também conhece — e tudo que é sabido por dois lados pode ser roubado, copiado ou pescado num site falso. E se desse para provar quem você é **sem nunca enviar um segredo**?\n\nÉ essa a ideia das **passkeys** (chaves de acesso) e da autenticação **sem senha**. Em alto nível: o seu aparelho guarda uma chave secreta que **nunca sai dele** e a usa para provar a sua identidade ao site — sem digitar nem transmitir senha alguma. Como não há segredo trafegando, não há o que um site falso capturar; por isso as passkeys são **resistentes a phishing**. E quem \"destranca\" essa chave no aparelho costuma ser a sua **biometria** (o rosto ou a digital, que também nunca são enviados pela internet). O resultado é um login ao mesmo tempo **mais fácil** e **mais seguro** — a direção para onde o mundo está caminhando."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo as recomendações atuais, o que mais contribui para uma senha ser forte?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tamanho: uma frase-senha longa é sempre mais difícil de quebrar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar a senha todos os dias, mesmo sem nenhum motivo aparente para isso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar o nome de um familiar querido, assim fica bem mais fácil de lembrar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar essa mesma senha forte em todos os sites e aplicativos que você tem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que é perigoso usar a mesma senha em vários sites?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque sites diferentes nunca aceitam exatamente a mesma senha cadastrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se um site vazar essa senha, as outras contas com a mesma senha caem junto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque digitar essa mesma senha em vários sites deixa tudo mais lento.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não há perigo nenhum nisso; reutilizar a senha é, na real, mais seguro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um fórum que Carla usava foi invadido. Poucos dias depois, o e-mail e o Instagram dela — que não tinham sido invadidos diretamente — também foram acessados por estranhos. O que provavelmente aconteceu?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O e-mail e o Instagram dela vazaram sozinhos, sem nenhuma relação com o fórum invadido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Foi só coincidência: usar a mesma senha em vários lugares não tem relação com invasões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Carla repetia a senha; com a senha vazada do fórum, os criminosos testaram em outros sites.",
                                "isCorrect": true
                            },
                            {
                                "text": "O provedor de e-mail dela apagou a senha por engano durante uma atualização do sistema.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Rafael quer senhas únicas e fortes em todas as contas, mas se acha incapaz de decorar dezenas delas. Qual é a melhor saída?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar uma única senha bem forte em absolutamente tudo, para lembrar só dessa uma senha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar variações bem simples como Senha1, Senha2 e Senha3 para cada site diferente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Anotar todas as senhas num arquivo de texto solto, sem proteção, na área de trabalho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar um gerenciador de senhas: ele gera e guarda tudo atrás de uma senha mestra única.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "As passkeys são consideradas mais resistentes a phishing do que as senhas. Qual explicação, em alto nível, justifica isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque a chave fica só no aparelho e nunca é enviada; o site falso não tem o que roubar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a passkey é apenas uma senha muito mais longa e difícil de digitar errada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque as passkeys trocam de senha automaticamente a cada nova hora do dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o site falso também precisaria capturar a sua digital enviada pela internet toda vez.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Modelos de controle de acesso e o menor privilégio",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Controle de acesso: quem pode o quê\n\nJá vimos que a **autenticação** prova quem você é e a **autorização** decide o que você pode fazer. Mas falta uma pergunta: **como** um sistema organiza essas permissões? Numa empresa com centenas de pessoas e milhares de arquivos, não dá para decidir cada acesso no olho. É aí que entram os **modelos de controle de acesso** — as \"regras do jogo\" que definem quem pode acessar o quê.\n\nExistem alguns modelos clássicos, e cada um responde à pergunta \"quem decide o acesso?\" de um jeito. Vamos conhecer os três mais comuns — **DAC**, **MAC** e **RBAC** — e ouvir falar de um quarto, o **ABAC**."
                    },
                    {
                        "type": "text",
                        "value": "## DAC: o dono decide\n\nNo **DAC** (_Discretionary Access Control_, controle de acesso **discricionário**), quem manda no acesso é o **dono do recurso**. Se o arquivo é seu, você decide quem pode abri-lo, editá-lo ou compartilhá-lo. É o modelo mais comum no dia a dia: quando você clica em \"compartilhar\" num documento do Google Drive e escolhe com quem, está usando DAC.\n\nA grande vantagem é a **flexibilidade** — é prático e cada um cuida do que é seu. A fraqueza é que tudo depende do **bom senso das pessoas**. Um clique errado no \"compartilhar\", uma permissão dada com pressa, e um arquivo sigiloso vaza; não porque o sistema falhou, mas porque o dono liberou demais."
                    },
                    {
                        "type": "text",
                        "value": "## MAC: a regra manda, não o dono\n\nNo **MAC** (_Mandatory Access Control_, controle de acesso **obrigatório**), o dono **não** decide. Quem decide é uma **regra central e rígida**, definida pela organização, baseada em **classificações** e **níveis de habilitação**. O exemplo clássico é o militar: documentos marcados como Confidencial, Secreto ou Ultrassecreto, e pessoas autorizadas para cada nível. Mesmo que você seja o autor de um documento secreto, **não pode** simplesmente entregá-lo a quem não tem a habilitação — o sistema não deixa.\n\nÉ um modelo **rígido** e trabalhoso, reservado a ambientes onde a segurança é crítica e não se pode confiar na discrição individual (governo, defesa, sistemas muito sensíveis). No mundo técnico, mecanismos como o SELinux, no Linux, seguem essa lógica."
                    },
                    {
                        "type": "text",
                        "value": "## RBAC: acesso pelo papel (cargo)\n\nO **RBAC** (_Role-Based Access Control_, controle de acesso baseado em **papéis**) é o modelo que a maioria das empresas usa. A ideia: em vez de dar permissões pessoa por pessoa, você define **papéis** (que costumam ser os cargos ou funções) e liga as permissões ao papel. Depois, é só encaixar cada pessoa no papel certo.\n\nNum hospital, o papel \"médico\" dá acesso aos prontuários; o papel \"recepção\" vê só a agenda; o papel \"financeiro\" cuida dos pagamentos. Quando alguém é contratado para a recepção, não é preciso configurar cinquenta permissões na mão — basta atribuir o papel \"recepção\" e pronto. Isso torna o RBAC fácil de **escalar** e de **auditar** em organizações grandes.\n\nHá ainda um modelo mais moderno e detalhista, o **ABAC** (_Attribute-Based Access Control_, baseado em **atributos**), que decide o acesso combinando várias características do momento — o departamento da pessoa, o horário, o local, o tipo do dado. É mais poderoso e granular, porém mais complexo de montar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Modelo\",\"Quem decide o acesso\",\"Exemplo do dia a dia\",\"Combina bem com\"],[\"DAC\",\"O dono do recurso\",\"Compartilhar um arquivo no Google Drive\",\"Uso pessoal e colaboração flexível\"],[\"MAC\",\"Uma regra central e fixa\",\"Documentos militares organizados por nível de sigilo\",\"Ambientes de segurança crítica\"],[\"RBAC\",\"O papel (cargo) da pessoa\",\"O cargo de médico dá acesso aos prontuários no hospital\",\"Empresas com muitas pessoas e funções\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O princípio do menor privilégio\n\nQualquer que seja o modelo, existe um princípio de ouro que vale para todos: o **menor privilégio** (_least privilege_). Ele diz que cada pessoa (ou sistema) deve ter **apenas o acesso necessário para fazer o seu trabalho — nada além disso**.\n\nPense num estagiário: ele precisa da chave do almoxarifado, não da chave-mestra do prédio inteiro. Dar acesso a mais \"por via das dúvidas\" parece inofensivo, mas cria um risco enorme: se aquela conta for invadida ou usada de má-fé, o estrago é do tamanho do acesso que ela tinha. Quanto menor o privilégio, **menor o estrago possível**.\n\nDois vilões atrapalham esse princípio: o **acúmulo de acessos** (a pessoa muda de área e vai juntando permissões que ninguém retira) e o hábito de usar contas de **administrador** para tarefas do dia a dia. A boa prática é o contrário: comece com o mínimo, conceda mais só quando for realmente preciso e retire o que não se usa mais. **Menos acesso, menos risco.**"
                    }
                ],
                "questions": [
                    {
                        "statement": "No modelo RBAC, o acesso de uma pessoa é definido principalmente por:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pelo papel, ou cargo, que a pessoa ocupa dentro da organização.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pela vontade pessoal do dono de cada arquivo específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Por uma classificação de sigilo fixa, definida de forma central.",
                                "isCorrect": false
                            },
                            {
                                "text": "Pela ordem cronológica em que as pessoas foram contratadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diz o princípio do menor privilégio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Todo mundo deveria ter acesso total de administrador, para nunca travar o trabalho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Cada pessoa deve ter só o acesso necessário ao seu trabalho, e nada além disso.",
                                "isCorrect": true
                            },
                            {
                                "text": "É sempre melhor liberar acesso a absolutamente tudo, só por precaução extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ninguém deveria ter acesso a nada, nem mesmo para conseguir trabalhar direito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um hospital quer que todo enfermeiro recém-contratado já receba, no primeiro dia, exatamente o mesmo conjunto de acessos dos demais enfermeiros, sem alguém configurar permissão por permissão. Qual modelo resolve isso melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "DAC: cada enfermeiro novo decide sozinho quais acessos prefere ter.",
                                "isCorrect": false
                            },
                            {
                                "text": "MAC: cada enfermeiro classifica sozinho os documentos que vai acessar.",
                                "isCorrect": false
                            },
                            {
                                "text": "RBAC: basta atribuir o papel \"enfermagem\" e a pessoa já herda as permissões dele.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nenhum modelo consegue padronizar acessos automaticamente por função do cargo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num Google Drive, o dono de um arquivo confidencial clica em \"compartilhar\" e, sem querer, libera o documento para a pessoa errada. Qual modelo estava em uso e qual é a sua principal fraqueza?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "MAC: o sistema central obrigou esse compartilhamento com base em classificações fixas.",
                                "isCorrect": false
                            },
                            {
                                "text": "RBAC: o papel da pessoa dentro da empresa liberou esse acesso automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum modelo específico; compartilhar arquivo no Drive não é controle de acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "DAC: o dono decide o compartilhamento, o que é flexível, mas depende do bom senso dele.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A conta de um funcionário foi comprometida num phishing. Como ele só tinha acesso à pasta do próprio time — e não à empresa inteira —, o estrago ficou contido. Qual princípio limitou o tamanho do dano?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O menor privilégio: como a conta só tinha acesso à pasta do time, o invasor alcançou pouco.",
                                "isCorrect": true
                            },
                            {
                                "text": "A autenticação multifator, que sozinha já impede qualquer tipo de phishing por completo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O modelo DAC, que por natureza sempre limita o acesso de forma automática e total.",
                                "isCorrect": false
                            },
                            {
                                "text": "A força da senha usada, que reduz o estrago mesmo depois de a conta já ter sido invadida.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Gestão de risco, resposta a incidentes e carreira",
        "aulas": [
            {
                "titulo": "Gestão de risco: enxergar e medir o risco",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Gestão de risco: por que não dá para blindar tudo\n\nChegamos ao último módulo da trilha, e ele começa com uma pergunta incômoda: se a segurança perfeita não existe, como uma empresa decide **o que** proteger primeiro? A resposta tem um nome: **gestão de risco**.\n\nPode parecer um assunto corporativo e distante, mas você já faz gestão de risco todos os dias, mesmo sem perceber. Ao sair de casa, você tranca a porta (mas não constrói um cofre em volta dela). Ao atravessar a rua, você olha para os dois lados (mas não deixa de atravessar por medo). Você leva o guarda-chuva quando o céu está fechado, não todos os dias. Em cada uma dessas decisões, você pesa **duas coisas**: qual a chance de algo dar errado e o quão ruim seria se desse. Isso é gestão de risco no dia a dia.\n\nEm cibersegurança a lógica é a mesma, só que aplicada a sistemas, dados e dinheiro. Nenhuma organização tem tempo, gente e orçamento infinitos para se proteger de tudo ao mesmo tempo. Gerir risco é justamente **decidir onde vale a pena gastar essa energia limitada**, cuidando primeiro do que é mais importante e mais provável de ser atacado."
                    },
                    {
                        "type": "quote",
                        "value": "**Risco** é a combinação de duas coisas: a **probabilidade** de algo ruim acontecer e o **impacto** que teria se acontecesse. Ele nasce no encontro de três elementos: um **ativo** que vale a pena proteger, uma **ameaça** que quer atingi-lo e uma **vulnerabilidade** que abre a porta. Sem os três juntos, não há risco relevante."
                    },
                    {
                        "type": "text",
                        "value": "## Os ingredientes do risco\n\nPara falar de risco com clareza, a área usa alguns termos precisos. Eles parecem sinônimos no dia a dia, mas significam coisas diferentes, e confundi-los atrapalha qualquer análise. Vamos usar um exemplo concreto: uma **loja virtual** que guarda os dados de cartão dos clientes.\n\n- **Ativo**: qualquer coisa de valor que você quer proteger. Na loja, o ativo mais precioso são os **dados de cartão dos clientes** (e a reputação da marca).\n- **Ameaça**: o que pode causar o dano. Aqui, um **criminoso** querendo roubar esses cartões para vendê-los.\n- **Vulnerabilidade**: a fraqueza que a ameaça explora. Digamos que o **servidor da loja está desatualizado**, com uma falha conhecida sem correção.\n- **Impacto**: o tamanho do estrago se o pior acontecer. Vazamento dos cartões, clientes lesados, multa da LGPD, reputação arranhada.\n- **Probabilidade**: a chance de o ataque realmente acontecer. Um servidor exposto na internet, com falha conhecida, tem probabilidade **alta**.\n\nRepare na engrenagem: a ameaça (o criminoso) explora a vulnerabilidade (o servidor desatualizado) para atingir o ativo (os cartões), gerando um impacto (o vazamento). O **risco** é o quanto tudo isso deveria te preocupar, medido por probabilidade vezes impacto."
                    },
                    {
                        "type": "text",
                        "value": "## Medir o risco: probabilidade vezes impacto\n\nDepois de identificar os riscos, é hora de **avaliá-los**, ou seja, colocar cada um numa escala para saber quais são os mais graves. A fórmula mental é simples:\n\n**Risco = Probabilidade × Impacto**\n\nNão precisa ser um cálculo exato com números (embora empresas grandes às vezes façam isso, no chamado modo **quantitativo**, com valores em reais). No começo, o mais comum é o modo **qualitativo**: classificar cada fator como **baixo**, **médio** ou **alto** e cruzar os dois.\n\nEsse cruzamento costuma virar uma **matriz de risco** (ou mapa de calor): uma tabelinha em que as linhas são a probabilidade, as colunas são o impacto, e a cor da célula indica a gravidade. Ela existe para uma coisa só: **priorizar**. Como ninguém consegue tratar tudo de uma vez, você começa pelos riscos que caem no canto vermelho (alta probabilidade **e** alto impacto) e deixa o canto verde para depois.\n\nUm detalhe que costuma confundir quem começa: um risco pode ter probabilidade **baixa** e ainda assim merecer atenção máxima, se o impacto for catastrófico. É por isso que se cruzam os **dois** fatores, em vez de olhar um só."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Probabilidade ↓ / Impacto →\",\"Baixo\",\"Médio\",\"Alto\"],[\"Alta\",\"Médio\",\"Alto\",\"Crítico\"],[\"Média\",\"Baixo\",\"Médio\",\"Alto\"],[\"Baixa\",\"Baixo\",\"Baixo\",\"Médio\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "**Para levar:** risco é **probabilidade × impacto**, e nasce quando uma **ameaça** encontra uma **vulnerabilidade** em cima de um **ativo** de valor. Como não dá para proteger tudo igualmente, a gestão de risco serve para **priorizar**: trate primeiro o que é provável **e** danoso. Um risco raro, mas catastrófico, ainda pode ser a sua maior prioridade."
                    }
                ],
                "questions": [
                    {
                        "statement": "De acordo com a aula, o risco é a combinação de quais dois fatores?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A probabilidade de o problema ocorrer e o impacto gerado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O preço do antivírus contratado e a velocidade da internet.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de senhas cadastradas e o número de funcionários.",
                                "isCorrect": false
                            },
                            {
                                "text": "A idade do sistema instalado e a marca do computador usado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O servidor de uma loja está desatualizado, com uma falha conhecida sem correção. Nos termos de gestão de risco, essa fraqueza é chamada de:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Vulnerabilidade, pois é a falha que a ameaça explora.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ameaça, pois é o criminoso que quer atacar o alvo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ativo, pois é o bem valioso que se quer proteger.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impacto, pois é o tamanho do estrago causado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa clínica, o prontuário dos pacientes é o que tem mais valor a proteger, um criminoso quer roubá-lo e o sistema tem uma senha fraca. O prontuário, nessa análise, representa o quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O ativo, o bem de valor que se quer proteger.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ameaça, o agente que pode causar o dano.",
                                "isCorrect": false
                            },
                            {
                                "text": "A vulnerabilidade, a falha que abre a porta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A probabilidade, a chance de o ataque ocorrer.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma empresa faz gestão de risco em vez de simplesmente proteger tudo ao máximo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque os recursos são limitados, e é preciso priorizar o mais grave e provável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque proteger demais deixa os sistemas mais lentos e mais caros de manter.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a lei só permite usar um único controle de segurança por vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque riscos de baixa probabilidade nunca causam impacto nenhum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um banco identifica um risco com probabilidade baixa, mas cujo impacto seria catastrófico (parar todos os caixas por dias). Um colega sugere ignorá-lo por ser \"raro\". O que a matriz de risco ensina aqui?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que se cruzam a probabilidade e o impacto, pois raro mas grave é prioridade alta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que só a probabilidade importa, então um risco raro pode ser sempre ignorado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que só o impacto importa, então a chance de ocorrer é sempre irrelevante.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que todo risco raro deve ser eliminado de imediato, custe o que custar.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "As quatro respostas ao risco",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Você mapeou o risco. E agora?\n\nNa aula anterior você aprendeu a **enxergar e medir** o risco. Mas identificar um risco não é o fim da história, é o começo. Depois de saber quais riscos ameaçam a organização e quão graves são, chega a hora da decisão: **o que fazer com cada um?**\n\nA boa notícia é que, por mais variados que sejam os riscos, as suas opções de resposta são sempre as **mesmas quatro**: **mitigar**, **transferir**, **aceitar** e **evitar**. Toda decisão de segurança, no fundo, é escolher uma delas (ou uma combinação).\n\nUma analogia com dirigir um carro deixa tudo claro. Todo dia você lida com o risco de um acidente: usa **cinto e freios** para reduzir o perigo (mitigar), faz um **seguro** para não arcar sozinho com o prejuízo (transferir), aceita que um pequeno risco de arranhão no estacionamento **faz parte** (aceitar) e, se a estrada estiver interditada por um temporal, simplesmente **não viaja** (evitar). Segurança da informação usa exatamente essas quatro cartas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Resposta\",\"O que significa\",\"Exemplo em cibersegurança\",\"No trânsito\"],[\"Mitigar\",\"Reduzir a probabilidade ou o impacto com controles\",\"Aplicar correções, exigir MFA e manter backups\",\"Usar cinto e freios\"],[\"Transferir\",\"Passar o prejuízo financeiro a um terceiro\",\"Contratar um seguro cibernético\",\"Fazer seguro do carro\"],[\"Aceitar\",\"Conviver com o risco de forma consciente\",\"Assumir um risco pequeno e registrá-lo\",\"Aceitar o risco de um arranhão\"],[\"Evitar\",\"Não fazer a atividade que gera o risco\",\"Não coletar um dado que não é necessário\",\"Não viajar na estrada interditada\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Mitigar e transferir: agir ou dividir o prejuízo\n\n**Mitigar** (ou reduzir) é a resposta mais comum, e foi sobre ela que falou boa parte desta trilha. Mitigar é aplicar **controles** que diminuem a probabilidade do ataque, o seu impacto, ou os dois. Manter os sistemas atualizados, exigir MFA, treinar as pessoas contra phishing, guardar backups: tudo isso é mitigação. Você não elimina o risco, mas o encolhe até um tamanho aceitável.\n\n**Transferir** (ou compartilhar) é passar o prejuízo para outra parte. O exemplo clássico é o **seguro cibernético**: você paga uma mensalidade e, se acontecer um vazamento, a seguradora cobre parte dos custos. Terceirizar um serviço para um provedor que assume certas responsabilidades também é uma forma de transferir.\n\nAqui mora uma pegadinha importante: você transfere o **custo financeiro**, mas **não** transfere a responsabilidade final nem o dano à reputação. Se a loja vaza os cartões dos clientes, o seguro paga a conta, mas quem os clientes vão culpar, e quem a LGPD vai responsabilizar, é a **loja**. Transferir divide o bolso, não o nome."
                    },
                    {
                        "type": "text",
                        "value": "## Aceitar e evitar: conviver ou dar meia-volta\n\n**Aceitar** é decidir, de olhos abertos, conviver com o risco. Isso faz sentido quando o risco é pequeno ou quando o controle custaria **mais** do que o prejuízo que evitaria (não vale gastar uma fortuna para proteger algo de valor baixo). O ponto crucial: aceitar é uma decisão **consciente e registrada**, tomada por quem tem autoridade para isso. Aceitar risco é diferente de **ignorar** risco. Ignorar é nem ter olhado; aceitar é ter olhado, entendido e escolhido seguir assim mesmo.\n\n**Evitar** é a resposta mais radical: **não fazer** a atividade que cria o risco. Se guardar números de cartão é arriscado, a loja pode decidir **nunca armazená-los**, deixando o pagamento por conta de um provedor especializado. Sem o dado guardado, o risco de vazá-lo desaparece. Evitar costuma ser a escolha quando o risco é alto e o benefício da atividade não compensa, como desligar de vez um sistema antigo e inseguro em vez de continuar remendando."
                    },
                    {
                        "type": "text",
                        "value": "## Sempre sobra alguma coisa: o risco residual\n\nDepois de tratar um risco, quase sempre **sobra** um pedacinho dele. Esse resto tem nome: **risco residual**. É o risco que continua existindo mesmo depois de aplicados todos os controles razoáveis. A loja pode atualizar o servidor, exigir MFA e contratar seguro, e ainda assim restar uma pequena chance de algo dar errado. Isso é normal e esperado.\n\nE aqui está uma das lições mais importantes de toda a área: **risco zero não existe**. Buscar segurança absoluta é impossível e, na prática, inviabilizaria o negócio (o sistema mais seguro é o que está desligado, mas ele não serve para nada). O objetivo real não é zerar o risco, e sim reduzi-lo até um nível que a organização consegue tolerar, o seu **apetite ao risco**. Você trata cada risco até ele caber nesse apetite, aceita o residual conscientemente e segue em frente."
                    },
                    {
                        "type": "quote",
                        "value": "**Para levar:** diante de um risco você tem **quatro** respostas: **mitigar** (reduzir com controles), **transferir** (passar o custo a um terceiro, como um seguro, mas a reputação continua sua), **aceitar** (conviver de forma consciente e registrada) e **evitar** (não fazer a atividade arriscada). O que sobra depois é o **risco residual**, e conviver com ele é inevitável: **risco zero não existe**."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são as quatro respostas possíveis a um risco?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mitigar, transferir, aceitar e evitar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografar, apagar, esconder e ignorar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar, atualizar, reiniciar e formatar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Detectar, alertar, culpar e esquecer.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa contrata um seguro cibernético para que, em caso de vazamento, a seguradora cubra parte dos prejuízos. Que resposta ao risco ela está usando?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Transferir, pois passa o custo a um terceiro.",
                                "isCorrect": true
                            },
                            {
                                "text": "Evitar, pois deixa de fazer a atividade de risco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aceitar, pois decide conviver com o risco assumido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mitigar, pois reduz a chance e o efeito do ataque.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Para reduzir a chance e o estrago de um ransomware, uma empresa passa a exigir MFA, atualizar os sistemas e manter backups testados. Que resposta ao risco é essa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mitigar, pois aplica controles que reduzem o risco.",
                                "isCorrect": true
                            },
                            {
                                "text": "Transferir, pois divide o prejuízo com uma seguradora.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar, pois encerra por completo a atividade arriscada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aceitar, pois decide conviver com o risco sem agir.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um recurso raramente usado tem um risco pequeno, e protegê-lo custaria bem mais do que ele vale. O time analisa, registra a decisão e segue sem controle extra. Como se classifica essa escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aceitar o risco, pois a decisão foi consciente e registrada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ignorar o risco, pois ninguém chegou a avaliar a situação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Evitar o risco, pois a atividade foi totalmente encerrada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Transferir o risco, pois o custo foi passado a um terceiro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup aplica vários controles (mitiga) e contrata um seguro (transfere), mas ainda resta uma pequena chance de incidente, que ela decide conviver de forma consciente. Como se chama esse resto e qual é a postura correta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Risco residual; a postura correta é aceitar esse resto de forma consciente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falha grave dos controles; a postura correta é refazer tudo até zerar o risco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erro de configuração; a postura correta é reiniciar todos os sistemas afetados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Vulnerabilidade não tratada; a postura correta é transferi-la para a seguradora.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Resposta a incidentes: quando a defesa falha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Quando a defesa falha: resposta a incidentes\n\nPor melhores que sejam as muralhas, uma hora alguém passa. Essa é a mentalidade madura da cibersegurança: a pergunta não é **se** um incidente vai acontecer, mas **quando**. E o que separa uma empresa que se recupera rápido de uma que vira notícia por semanas não é ter evitado o incidente, e sim saber **responder** a ele.\n\nUm **incidente de segurança** é qualquer evento que ameaça a confidencialidade, a integridade ou a disponibilidade dos dados (lembra da tríade CIA, lá do primeiro módulo?): um malware que se espalha, um vazamento, uma conta invadida, um site fora do ar por um ataque. **Resposta a incidentes** (do inglês _incident response_) é o conjunto organizado de passos para lidar com isso sem entrar em pânico.\n\nMuitas empresas mantêm um time dedicado a isso, o **CSIRT** (_Computer Security Incident Response Team_, o time de resposta a incidentes), os bombeiros digitais da organização. E não é à toa a comparação com bombeiros: responder a incidentes se parece muito com combater um incêndio."
                    },
                    {
                        "type": "quote",
                        "value": "A resposta a incidentes costuma seguir **seis fases**, nesta ordem: **preparação** (se aprontar antes), **identificação** (perceber que algo está errado), **contenção** (estancar o sangramento), **erradicação** (remover a causa), **recuperação** (voltar ao normal) e **lições aprendidas** (aprender para a próxima). Juntas, elas formam um ciclo que sempre recomeça na preparação."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase\",\"Objetivo\",\"Exemplo de ação\",\"No incêndio\"],[\"Preparação\",\"Estar pronto antes de qualquer incidente\",\"Ter plano, backups, contatos e treinar a equipe\",\"Fazer simulados e instalar extintores\"],[\"Identificação\",\"Perceber e confirmar que há um incidente\",\"Investigar alertas e logs para confirmar o ataque\",\"O alarme de fumaça dispara\"],[\"Contenção\",\"Impedir que o dano se espalhe\",\"Isolar as máquinas afetadas da rede\",\"Fechar as portas para o fogo não passar\"],[\"Erradicação\",\"Eliminar a causa raiz\",\"Remover o malware e corrigir a falha explorada\",\"Apagar as chamas\"],[\"Recuperação\",\"Voltar à operação normal com segurança\",\"Restaurar de um backup limpo e monitorar\",\"Limpar e reconstruir o cômodo\"],[\"Lições aprendidas\",\"Aprender para não repetir\",\"Reunir o time e documentar o que melhorar\",\"Revisar o que falhou na evacuação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Da calmaria ao combate: preparação, identificação e contenção\n\nA fase mais importante é, curiosamente, a que acontece **antes** de qualquer ataque: a **preparação**. É em tempos de paz que se escreve o plano, se definem os contatos de emergência, se testam os backups e se treina a equipe. Ninguém aprende a usar o extintor com a casa já pegando fogo. Toda a agilidade das fases seguintes vem da qualidade da preparação.\n\nA **identificação** (ou detecção) é o momento de perceber que algo está errado e **confirmar** que é mesmo um incidente. Um alerta do antivírus, um log estranho, um cliente reclamando: o time investiga, separa o alarme falso do ataque real e mede a gravidade e o alcance.\n\nA **contenção** é a hora de **estancar o sangramento**. Antes de sair limpando tudo, o objetivo é impedir que o problema se espalhe: isolar a máquina infectada da rede, bloquear uma conta comprometida, cortar o acesso do atacante. Um cuidado de ouro aqui: conter com pressa não pode **destruir as evidências**. Puxar tudo da tomada às vezes apaga rastros preciosos para entender o que aconteceu (e para a perícia forense, se houver)."
                    },
                    {
                        "type": "text",
                        "value": "## Fechar o ciclo: erradicação, recuperação e lições\n\nCom o incidente contido, a **erradicação** remove a **causa raiz**: apagar o malware de todas as máquinas, fechar a vulnerabilidade explorada, trocar as senhas que vazaram. Não adianta limpar uma máquina e deixar escancarada a porta que o atacante usou.\n\nA **recuperação** traz os sistemas de volta à vida, com cuidado: restaurar a partir de um **backup limpo** (de antes da infecção), religar os serviços aos poucos e monitorar de perto para ter certeza de que a ameaça realmente sumiu. Existe uma armadilha clássica aqui: restaurar um backup **sem** ter erradicado a causa é receita para ser reinfectado no dia seguinte. Por isso a ordem importa: erradicar **antes** de recuperar.\n\nPor fim, as **lições aprendidas**: já com a poeira baixada, o time se reúne para documentar o que aconteceu, o que funcionou e o que precisa melhorar. Essa reunião deve ser **sem caça às bruxas** (o termo em inglês é _blameless_, sem culpados): o foco é o processo, não punir pessoas, senão ninguém reporta o próximo incidente. E o mais bonito: o que se aprende aqui volta para a **preparação**, fechando o ciclo e deixando a empresa mais forte para a próxima vez. Para amarrar tudo, veja como um ataque de **ransomware** percorreria essas seis fases, do primeiro alerta à lição final:"
                    },
                    {
                        "type": "code",
                        "value": "PREPARACAO     (semanas antes) Plano de resposta pronto, backups testados, equipe treinada\nIDENTIFICACAO  09:14  Antivirus alerta arquivo suspeito na estacao EST-045\n               09:20  SOC confirma: mais 3 maquinas com o mesmo alerta -> e um incidente\nCONTENCAO      09:26  EST-045 e as outras 3 maquinas sao isoladas da rede\nERRADICACAO    10:05  Vetor identificado: anexo de phishing; anexo removido de todas as caixas\nRECUPERACAO    13:40  Maquinas reinstaladas e restauradas de backup limpo, sob monitoramento\nLICOES         Dia seguinte  Reforcar o filtro de e-mail e treinar a equipe contra phishing"
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo as fases de resposta a incidentes, qual delas acontece ANTES de qualquer ataque e é considerada a mais importante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A preparação: escrever o plano e treinar a equipe com antecedência.",
                                "isCorrect": true
                            },
                            {
                                "text": "A erradicação: remover o malware de todas as máquinas afetadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A recuperação: restaurar os sistemas a partir de um backup limpo.",
                                "isCorrect": false
                            },
                            {
                                "text": "As lições aprendidas: documentar o incidente depois de encerrado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o objetivo principal da fase de contenção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Impedir que o dano se espalhe pelos demais sistemas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Descobrir quem foi o culpado dentro da equipe técnica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Contratar um seguro para cobrir os prejuízos financeiros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escrever o relatório final a ser entregue à diretoria.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista do SOC percebe um malware se espalhando pela rede e, de imediato, desconecta as máquinas afetadas para impedir que ele alcance as demais. Em que fase da resposta a incidentes ele está atuando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Contenção, pois está isolando o problema para impedir a propagação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Recuperação, pois está devolvendo os sistemas à operação normal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Preparação, pois está se aprontando para um incidente futuro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lições aprendidas, pois está avaliando o que pode melhorar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de limpar e restaurar tudo, o time se reúne para documentar o que aconteceu e o que melhorar, sem procurar culpados. Que fase é essa e por que evitar a caça às bruxas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lições aprendidas; sem culpa, o time segue relatando incidentes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Contenção; sem culpa, o dano para de se espalhar mais depressa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Identificação; sem culpa, os alertas chegam bem mais cedo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Erradicação; sem culpa, o malware some sem qualquer ação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um ransomware, a equipe restaura os servidores a partir do backup, mas pula a erradicação. Dias depois, tudo é criptografado de novo. O que explica melhor esse erro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Pular a erradicação deixa a causa ativa, permitindo a reinfecção do ambiente.",
                                "isCorrect": true
                            },
                            {
                                "text": "O backup usado estava corrompido, e por isso a reinfecção era inevitável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou contratar um seguro cibernético antes de restaurar os sistemas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fase de lições aprendidas deveria ocorrer antes da identificação do incidente.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Frameworks e conformidade: os mapas da segurança",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Você não precisa começar do zero: frameworks e conformidade\n\nTudo o que você viu nesta trilha (proteger dados, gerir risco, responder a incidentes) pode parecer muita coisa para uma empresa organizar sozinha. A boa notícia: **ninguém precisa inventar a roda**. Existem **frameworks** (estruturas de referência) e **normas** que já reúnem, de forma organizada, o que a comunidade de segurança aprendeu ao longo de décadas. São mapas prontos.\n\nPense neles como a **receita de um prato** ou o **código de obras** de uma construção: um roteiro testado que diz o que fazer e em que ordem, para você não esquecer nada importante. Além disso, seguir um framework conhecido dá uma **linguagem comum** (duas empresas conseguem conversar sobre segurança usando os mesmos termos) e serve para **provar maturidade** a clientes e parceiros.\n\nVale separar três coisas que costumam se misturar: um **framework** é uma orientação de boas práticas (você segue porque quer), uma **norma** é um padrão no qual você pode ser **certificado** para provar que cumpre, e uma **lei** é obrigatória (descumprir tem consequência jurídica). Vamos ver um exemplo de cada."
                    },
                    {
                        "type": "text",
                        "value": "## O NIST Cybersecurity Framework: cinco funções\n\nO **NIST Cybersecurity Framework** (ou NIST CSF) é um dos mapas mais usados no mundo. Criado por um instituto de padrões dos Estados Unidos, ele organiza toda a segurança em **cinco funções** simples e fáceis de guardar:\n\n- **Identificar**: saber o que você tem e o que está em risco (seus ativos, seus riscos). É a gestão de risco da aula 1.\n- **Proteger**: aplicar os controles que evitam ou reduzem incidentes (acesso, criptografia, treinamento). É boa parte dos módulos anteriores.\n- **Detectar**: perceber quando algo errado está acontecendo (monitoramento, alertas, logs).\n- **Responder**: agir quando o incidente ocorre (a resposta a incidentes da aula 3).\n- **Recuperar**: voltar ao normal depois do estrago (backups, planos de continuidade).\n\nRepare que essas cinco funções são praticamente **um resumo desta trilha inteira**. Não é coincidência: o CSF foi feito para dar uma visão completa e equilibrada, do antes ao depois de um ataque. (Uma versão mais recente do framework acrescentou uma sexta função, **Governar**, sobre liderança e política de segurança, mas as cinco acima continuam sendo o coração dele.)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Função\",\"A pergunta que responde\",\"Exemplo prático\"],[\"Identificar\",\"O que eu tenho e o que está em risco?\",\"Mapear ativos e avaliar riscos\"],[\"Proteger\",\"Como evito que o ataque aconteça?\",\"Controle de acesso, MFA, criptografia, treinamento\"],[\"Detectar\",\"Como percebo que algo deu errado?\",\"Monitoramento de logs e alertas\"],[\"Responder\",\"O que faço durante o incidente?\",\"Acionar o plano de resposta e conter o dano\"],[\"Recuperar\",\"Como volto ao normal depois?\",\"Restaurar backups e retomar os serviços\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## ISO/IEC 27001 e os CIS Controls\n\nA **ISO/IEC 27001** é a principal **norma internacional** de segurança da informação. Ela descreve como montar um **SGSI** (_Sistema de Gestão de Segurança da Informação_), ou seja, não uma lista de ferramentas, mas um **processo de gestão**: definir políticas, avaliar riscos, aplicar controles e melhorar continuamente. O grande diferencial é que uma empresa pode ser **certificada** na ISO 27001 por um auditor externo, ganhando um selo reconhecido no mundo todo que diz \"aqui a segurança é levada a sério\". É muito pedida em contratos e licitações.\n\nOs **CIS Controls** (do _Center for Internet Security_) têm um espírito diferente, mais **prático e mão na massa**. Em vez de falar de gestão, eles são uma lista **priorizada** de ações defensivas concretas (do tipo \"faça o inventário dos seus equipamentos\", \"gerencie as contas\", \"mantenha tudo atualizado\"), organizadas para você saber **por onde começar**. Se a ISO 27001 responde \"como organizar a segurança como um processo\", os CIS Controls respondem \"quais controles instalar primeiro\"."
                    },
                    {
                        "type": "text",
                        "value": "## A LGPD: a lei brasileira dos dados pessoais\n\nEnquanto os anteriores são voluntários, a **LGPD** (Lei Geral de Proteção de Dados, a Lei nº 13.709/2018) é **lei**: vale para praticamente qualquer organização que trate dados pessoais de pessoas no Brasil. Ela não é exatamente uma lei de cibersegurança, e sim de **privacidade**. Seu objetivo é proteger os **dados pessoais** do cidadão (nome, CPF, e-mail, hábitos, tudo que identifica alguém).\n\nAlguns pontos que a LGPD trouxe:\n\n- A pessoa dona dos dados (o **titular**) ganhou **direitos**: saber quais dados a empresa tem sobre ela, corrigir e pedir a exclusão.\n- Empresas só podem tratar dados com uma **base legal** (por exemplo, o consentimento da pessoa) e apenas para a finalidade informada.\n- Existe um órgão fiscalizador, a **ANPD** (Autoridade Nacional de Proteção de Dados), que pode aplicar **sanções** e multas.\n- Em caso de vazamento que traga risco às pessoas, a empresa precisa **comunicar** o incidente.\n\nRepare a ponte com o resto da trilha: para **cumprir** a LGPD (proteger os dados), a empresa precisa de **segurança** de verdade. Mas cuidado com um mal-entendido comum: **conformidade não é o mesmo que segurança**. Ter um certificado ou seguir uma lei ajuda muito, mas não garante que você esteja realmente seguro. É o piso, não o teto."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Instrumento\",\"O que é\",\"Tipo\",\"Serve para\"],[\"NIST CSF\",\"Framework de referência com 5 funções\",\"Voluntário\",\"Ter uma visão completa e equilibrada da segurança\"],[\"ISO/IEC 27001\",\"Norma internacional de gestão (SGSI)\",\"Certificável\",\"Provar maturidade com um selo reconhecido\"],[\"CIS Controls\",\"Lista priorizada de controles práticos\",\"Voluntário\",\"Saber quais defesas aplicar primeiro\"],[\"LGPD\",\"Lei brasileira de proteção de dados\",\"Obrigatório (lei)\",\"Proteger os dados pessoais e evitar sanções\"]]"
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são as cinco funções do NIST Cybersecurity Framework?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Identificar, Proteger, Detectar, Responder e Recuperar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Instalar, Atualizar, Reiniciar, Formatar e Desligar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ler, Escrever, Executar, Apagar e Copiar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Planejar, Vender, Faturar, Entregar e Cobrar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que a LGPD, a lei brasileira, tem como objetivo principal?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Proteger os dados pessoais e garantir direitos ao titular.",
                                "isCorrect": true
                            },
                            {
                                "text": "Obrigar todas as empresas a usar o mesmo antivírus nacional.",
                                "isCorrect": false
                            },
                            {
                                "text": "Proibir o uso de senhas fracas em sistemas do governo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir qual é a velocidade mínima de internet no país.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa quer um selo internacional, emitido por um auditor externo, para provar a clientes que gerencia bem a sua segurança da informação. Qual instrumento ela deve buscar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A certificação ISO/IEC 27001, obtida por auditoria externa.",
                                "isCorrect": true
                            },
                            {
                                "text": "A LGPD, que também emite um selo de lei cumprida.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os CIS Controls, que emitem certificados oficiais reconhecidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "O NIST CSF, que concede um diploma internacional de segurança.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A equipe de segurança monitora os logs da rede e recebe um alerta de comportamento estranho num servidor. No NIST CSF, essa atividade corresponde a qual função?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Detectar, pois trata de perceber que algo está errado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Recuperar, pois trata de voltar ao normal após o estrago.",
                                "isCorrect": false
                            },
                            {
                                "text": "Identificar, pois trata de listar ativos antes do ataque.",
                                "isCorrect": false
                            },
                            {
                                "text": "Proteger, pois trata de aplicar controles preventivos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma startup brasileira que trata dados pessoais afirma: \"seguimos os CIS Controls, então já estamos automaticamente em conformidade com a LGPD e não precisamos nos preocupar com a lei\". Por que esse raciocínio está errado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Está errado, pois a LGPD é lei obrigatória e os CIS Controls são só boas práticas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Está certo, pois seguir qualquer framework de segurança dispensa o cumprimento das leis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está errado apenas porque os CIS Controls são oficialmente proibidos no Brasil desde 2020.",
                                "isCorrect": false
                            },
                            {
                                "text": "Está errado porque a LGPD é apenas um framework voluntário, mais fraco que os CIS Controls.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O mapa de carreira em cibersegurança",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cibersegurança não é uma profissão só: o mapa de carreira\n\nSe você chegou até aqui, já tem uma base real de cibersegurança, e talvez esteja se perguntando: \"e agora, por onde eu sigo?\". A resposta é libertadora: cyber **não é uma única profissão**, é um continente inteiro de especialidades. O estereótipo do \"hacker de moletom no escuro\" é só uma fresta de um campo enorme, com portas de entrada para os mais variados perfis, inclusive quem **não** vem da tecnologia.\n\nQuem gosta de quebrar coisas para entender como funcionam, quem prefere defender e vigiar, quem curte processos e regras, quem quer ajudar a construir software seguro, quem se fascina por investigação: há um lugar para cada um. Nesta última aula, vamos abrir o mapa das principais áreas e, o mais importante, ver **como continuar a jornada** a partir daqui."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Área\",\"O que faz\",\"Combina com quem...\"],[\"Red team (ofensiva)\",\"Simula ataques para achar falhas antes dos criminosos\",\"Gosta de desafios e de pensar como o atacante\"],[\"Blue team (defensiva)\",\"Monitora, detecta e responde a ataques no dia a dia\",\"Gosta de vigiar, investigar e proteger\"],[\"Purple team\",\"Une ataque e defesa para melhorar os dois\",\"Gosta de colaborar e enxergar o todo\"],[\"GRC\",\"Cuida de políticas, risco, auditoria e conformidade\",\"Gosta de organização, processos e regras\"],[\"AppSec\",\"Ajuda a construir software seguro desde o código\",\"Tem ou quer ter perfil de desenvolvimento\"],[\"Segurança em nuvem\",\"Protege ambientes na nuvem (AWS, Azure, GCP)\",\"Gosta de infraestrutura e de nuvem\"],[\"Forense\",\"Investiga o que aconteceu depois de um incidente\",\"Tem perfil detetive, gosta de reconstruir fatos\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Ataque, defesa e a ponte entre eles\n\nAs duas famílias mais conhecidas são os **times por cor**. O **red team** (time vermelho, ou segurança **ofensiva**) pensa como o inimigo: faz **testes de intrusão** (_pentests_) e simula ataques reais para descobrir as falhas **antes** que um criminoso as encontre. O **blue team** (time azul, ou segurança **defensiva**) está do outro lado, no dia a dia da proteção: monitora, detecta, responde a incidentes e endurece os sistemas. Boa parte do blue team trabalha num **SOC** (_Security Operations Center_, o centro de operações de segurança).\n\nO **purple team** (time roxo) é a **ponte**: a mistura das cores vermelha e azul. Em vez de red e blue competirem, o purple faz os dois colaborarem. O ataque mostra as brechas e a defesa aprende a fechá-las, num ciclo que fortalece a organização.\n\nAqui vale o alerta mais sério desta trilha: o que separa um profissional de red team de um **criminoso** é uma única palavra: **autorização**. Testar a segurança de um sistema sem permissão por escrito é crime, não importa a intenção. **Ética e autorização** não são um detalhe; são a fundação de qualquer carreira em segurança."
                    },
                    {
                        "type": "text",
                        "value": "## As outras portas de entrada\n\nLonge do teclado atacando ou defendendo, há áreas igualmente essenciais:\n\n- **GRC** (_Governança, Risco e Conformidade_) é o mundo das políticas, auditorias, gestão de risco e frameworks como a ISO 27001 e a LGPD (tudo o que você viu nas aulas anteriores!). É uma das melhores portas de entrada para quem vem de áreas como **direito, administração ou gestão**, porque valoriza organização e comunicação tanto quanto código.\n- **AppSec** (_Application Security_, segurança de aplicações) atua junto de quem desenvolve software: revisa o código em busca de vulnerabilidades, integra testes de segurança no processo de criação e ensina os desenvolvedores a programar com segurança. Combina com quem tem (ou quer ter) perfil de programação.\n- **Segurança em nuvem** cuida de proteger os ambientes na nuvem (AWS, Azure, Google Cloud), onde hoje mora boa parte dos sistemas: configurações, identidades e acessos nesses provedores.\n- **Forense digital** entra **depois** do incidente, de mãos dadas com a resposta a incidentes da aula 3: investiga o que aconteceu, preserva as evidências com cuidado (a chamada **cadeia de custódia**) e reconstrói a história do ataque. É a área de quem tem alma de detetive."
                    },
                    {
                        "type": "text",
                        "value": "## Como continuar a jornada\n\nNenhuma área se aprende só lendo: cyber é **prática**. Alguns caminhos para seguir a partir daqui:\n\n- **Monte um laboratório em casa**: máquinas virtuais no seu próprio computador para testar e quebrar coisas com segurança, sem risco para ninguém.\n- **Brinque de CTF** (_Capture The Flag_): competições e plataformas de desafios que ensinam segurança de forma prática e divertida, resolvendo enigmas.\n- **Busque uma certificação de entrada**: certificações reconhecidas de nível iniciante (uma das mais citadas para começar é a CompTIA Security+) ajudam a organizar os estudos e a mostrar conhecimento no mercado.\n- **Participe da comunidade**: a área é acolhedora e colaborativa; grupos, eventos e fóruns aceleram muito o aprendizado.\n- **Escolha uma direção e aprofunde**: você não precisa saber tudo. Prove um pouco de cada área, veja o que te empolga e mergulhe nela.\n\nE cultive duas coisas que nenhum curso ensina sozinho: **curiosidade** (a vontade de entender como as coisas funcionam por dentro) e **ética** (o compromisso de usar esse conhecimento para o bem). A tecnologia muda rápido, então a habilidade mais valiosa de todas é **nunca parar de aprender**."
                    },
                    {
                        "type": "quote",
                        "value": "**Para levar:** cibersegurança é um campo enorme (**ofensiva** no red team, **defensiva** no blue team, a **ponte** do purple team, **GRC**, **AppSec**, **nuvem** e **forense**), com uma porta para cada perfil, técnico ou não. Você percorreu a tríade CIA, as ameaças, o malware, a engenharia social, os controles de defesa, a identidade e a gestão de risco. A base está construída. Agora escolha uma direção, coloque a mão na massa com ética e **continue aprendendo**: a jornada só começou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual a diferença entre red team e blue team?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O red team ataca de forma ofensiva e o blue team defende no dia a dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "O red team cuida do financeiro e o blue team, do setor de marketing.",
                                "isCorrect": false
                            },
                            {
                                "text": "O red team atua de dia e o blue team, apenas durante a noite.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois fazem exatamente a mesma função, só muda o nome do time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma pessoa formada em direito gosta de políticas, auditorias, gestão de risco e conformidade com leis como a LGPD, mas não quer viver programando. Qual área de cibersegurança mais combina com ela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "GRC, a área de governança, risco e conformidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Red team, a área de segurança ofensiva.",
                                "isCorrect": false
                            },
                            {
                                "text": "AppSec, a área de segurança de aplicações.",
                                "isCorrect": false
                            },
                            {
                                "text": "Forense digital, a área de investigação pós-incidente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um profissional simula ataques reais contra a empresa, sempre com permissão por escrito, para encontrar falhas antes dos criminosos. Qual é a área, e o que o separa de um criminoso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Red team (ofensiva); a diferença para um criminoso é ter autorização.",
                                "isCorrect": true
                            },
                            {
                                "text": "Blue team (defensiva); a diferença estaria no horário de trabalho.",
                                "isCorrect": false
                            },
                            {
                                "text": "GRC; a diferença estaria apenas no diploma universitário obtido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Forense; a diferença estaria apenas no tipo de computador usado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de um incidente, uma especialista é chamada para investigar o que aconteceu, preservar as evidências com cuidado e reconstruir passo a passo a história do ataque. Em qual área ela atua?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Forense digital, que reconstrói os fatos após o incidente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Red team, que ataca sistemas em produção para achar falhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "GRC, que cuida de políticas, auditorias e normas internas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Purple team, que une ataque e defesa no dia a dia da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um profissional quer trabalhar lado a lado com os desenvolvedores: revisar o código em busca de vulnerabilidades e integrar testes de segurança no processo de criação do software. Qual área é essa?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "AppSec, focada em construir software seguro desde o código-fonte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Segurança em nuvem, focada em configurar ambientes na AWS ou Azure.",
                                "isCorrect": false
                            },
                            {
                                "text": "Red team, focado em atacar sistemas que já estão em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Forense digital, focada em investigar incidentes após eles ocorrerem.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: "iniciante", description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
        return;
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
    console.log("Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
